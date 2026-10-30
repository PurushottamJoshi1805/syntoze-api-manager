import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

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
    const { planType, customerPhone } = body; // 'lifetime' (999) or 'monthly' (199)

    const amount = planType === 'monthly' ? 199.0 : 999.0;
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
      process.env.NEXT_PUBLIC_APP_URL ||
      'http://localhost:3000';

    // Unique order ID (Alphanumeric, max 45 chars)
    const sanitizedUserId = user.id.replace(/[^a-zA-Z0-9]/g, '').slice(0, 8);
    const orderId = `syntoze_${sanitizedUserId}_${Date.now()}`.slice(0, 45);

    const orderPayload = {
      order_id: orderId,
      order_amount: amount,
      order_currency: 'INR',
      customer_details: {
        customer_id: user.id.replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 50),
        customer_email: user.email || 'developer@syntoze.com',
        customer_phone: customerPhone?.replace(/[^0-9]/g, '') || '9999999999',
        customer_name: user.user_metadata?.full_name || 'Syntoze Developer',
      },
      order_meta: {
        return_url: `${origin}/api/payments/cashfree/verify?order_id={order_id}`,
      },
      order_note: planName,
    };

    const cfResponse = await fetch(`${baseUrl}/orders`, {
      method: 'POST',
      headers: {
        'x-client-id': appId,
        'x-client-secret': secretKey,
        'x-api-version': '2023-08-01',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(orderPayload),
    });

    const cfData = await cfResponse.json();

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
