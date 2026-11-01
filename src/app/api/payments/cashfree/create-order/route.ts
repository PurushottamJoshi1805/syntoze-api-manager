import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { CURRENCIES, SupportedCurrency } from '@/lib/constants/pricing';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized. Please sign in.' }, { status: 401 });
    }

    const body = await request.json();
    const { planType, customerPhone, currency = 'INR' } = body; // 'lifetime' or 'monthly'

    const currConfig = CURRENCIES[(currency as SupportedCurrency)] || CURRENCIES.INR;
    const amount = planType === 'monthly' ? currConfig.monthlyPrice : currConfig.lifetimePrice;
    const planName = planType === 'monthly' ? 'Syntoze Pro Monthly' : 'Syntoze Pro Lifetime Access';

    const appId = process.env.CASHFREE_APP_ID;
    const secretKey = process.env.CASHFREE_SECRET_KEY;
    const mode = process.env.CASHFREE_MODE || 'sandbox';

    if (!appId || !secretKey) {
      return NextResponse.json(
        {
          error:
            'Cashfree API keys are not configured. Please add CASHFREE_APP_ID and CASHFREE_SECRET_KEY in your environment variables.',
        },
        { status: 500 }
      );
    }

    const baseUrl =
      mode === 'production'
        ? 'https://api.cashfree.com/pg'
        : 'https://sandbox.cashfree.com/pg';

    const origin =
      request.headers.get('origin') ||
      request.nextUrl.origin ||
      'https://syntoze-api-manager.vercel.app';

    // Unique order ID (Alphanumeric, max 45 chars)
    const sanitizedUserId = user.id.replace(/[^a-zA-Z0-9]/g, '').slice(0, 8);
    const orderId = `syntoze_${sanitizedUserId}_${Date.now()}`.slice(0, 45);

    let orderCurrency = currConfig.code;
    let orderAmount = amount;

    const orderPayload = {
      order_id: orderId,
      order_amount: orderAmount,
      order_currency: orderCurrency,
      customer_details: {
        customer_id: user.id.replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 50),
        customer_email: user.email || 'developer@syntoze.com',
        customer_phone: customerPhone?.replace(/[^0-9]/g, '') || '9999999999',
        customer_name: user.user_metadata?.full_name || 'Syntoze Developer',
      },
      order_meta: {
        return_url: `${origin}/api/payments/cashfree/verify?order_id={order_id}&uid=${user.id}`,
      },
      order_note: `${planName} (${currConfig.symbol}${amount})`,
    };

    let cfResponse = await fetch(`${baseUrl}/orders`, {
      method: 'POST',
      headers: {
        'x-client-id': appId,
        'x-client-secret': secretKey,
        'x-api-version': '2023-08-01',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(orderPayload),
    });

    let cfData = await cfResponse.json();

    // Graceful international fallback:
    // If merchant account does not have foreign currency settlement enabled yet,
    // process as INR equivalent so international cards NEVER fail.
    if (!cfResponse.ok && orderCurrency !== 'INR') {
      const inrAmount = planType === 'monthly' ? 99.0 : 999.0;
      orderPayload.order_amount = inrAmount;
      orderPayload.order_currency = 'INR';

      cfResponse = await fetch(`${baseUrl}/orders`, {
        method: 'POST',
        headers: {
          'x-client-id': appId,
          'x-client-secret': secretKey,
          'x-api-version': '2023-08-01',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderPayload),
      });
      cfData = await cfResponse.json();
    }

    if (!cfResponse.ok) {
      console.error('Cashfree Create Order Error:', cfData);
      return NextResponse.json(
        { error: cfData.message || 'Failed to create Cashfree order.' },
        { status: cfResponse.status }
      );
    }

    return NextResponse.json({
      success: true,
      order_id: cfData.order_id,
      payment_session_id: cfData.payment_session_id,
      amount: cfData.order_amount,
      currency: cfData.order_currency,
      mode,
    });
  } catch (error: any) {
    console.error('Server error creating Cashfree order:', error);
    return NextResponse.json(
      { error: error?.message || 'Internal server error processing payment.' },
      { status: 500 }
    );
  }
}
