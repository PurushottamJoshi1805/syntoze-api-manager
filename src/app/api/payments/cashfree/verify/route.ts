import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const orderId = searchParams.get('order_id');
  const origin =
    request.headers.get('origin') ||
    process.env.NEXT_PUBLIC_APP_URL ||
    'http://localhost:3000';

  if (!orderId) {
    return NextResponse.redirect(`${origin}/?payment=missing_order`);
  }

  try {
    const appId = process.env.CASHFREE_APP_ID;
    const secretKey = process.env.CASHFREE_SECRET_KEY;
    const mode = process.env.CASHFREE_MODE || 'sandbox';

    if (!appId || !secretKey) {
      return NextResponse.redirect(`${origin}/?payment=config_error`);
    }

    const baseUrl =
      mode === 'production'
        ? 'https://api.cashfree.com/pg'
        : 'https://sandbox.cashfree.com/pg';

    const response = await fetch(`${baseUrl}/orders/${orderId}`, {
      method: 'GET',
      headers: {
        'x-client-id': appId,
        'x-client-secret': secretKey,
        'x-api-version': '2023-08-01',
      },
    });

    const orderData = await response.json();

    if (orderData.order_status === 'PAID') {
      const supabase = await createServerSupabaseClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        // Upgrade user plan in Supabase
        await supabase.from('user_subscriptions').upsert(
          {
            user_id: user.id,
            plan: 'pro',
            billing_cycle: orderData.order_amount < 500 ? 'monthly' : 'lifetime',
            status: 'active',
            order_id: orderId,
            amount: orderData.order_amount,
            currency: orderData.order_currency || 'INR',
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'user_id' }
        );
      }

      return NextResponse.redirect(`${origin}/?upgraded=true`);
    } else {
      console.warn('Cashfree payment not completed. Status:', orderData.order_status);
      return NextResponse.redirect(`${origin}/?payment=unpaid&status=${orderData.order_status}`);
    }
  } catch (error) {
    console.error('Error verifying Cashfree order:', error);
    return NextResponse.redirect(`${origin}/?payment=error`);
  }
}
