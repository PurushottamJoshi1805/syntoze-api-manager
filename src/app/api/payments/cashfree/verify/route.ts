import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  return handleVerification(request);
}

export async function POST(request: NextRequest) {
  return handleVerification(request);
}

async function handleVerification(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const wantsJson =
    searchParams.get('format') === 'json' ||
    request.headers.get('accept')?.includes('application/json');

  let orderId = searchParams.get('order_id');

  // If POST, also check body for orderId
  if (!orderId && request.method === 'POST') {
    try {
      const body = await request.json();
      orderId = body.orderId || body.order_id;
    } catch {
      // ignore
    }
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL;
  const origin =
    appUrl && !appUrl.includes('localhost')
      ? appUrl.replace(/\/$/, '')
      : request.nextUrl.origin && !request.nextUrl.origin.includes('localhost')
      ? 'https://syntoze-api-manager.vercel.app'
      : request.nextUrl.origin || 'http://localhost:3000';

  if (!orderId || typeof orderId !== 'string') {
    if (wantsJson) {
      return NextResponse.json({ error: 'Order ID is required' }, { status: 400 });
    }
    return NextResponse.redirect(`${origin}/?payment=missing_order`);
  }

  const cleanOrderId = orderId.trim();

  try {
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      if (wantsJson) {
        return NextResponse.json({ error: 'User must be signed in to verify payment.' }, { status: 401 });
      }
      return NextResponse.redirect(`${origin}/auth/login`);
    }

    const appId = process.env.CASHFREE_APP_ID;
    const secretKey = process.env.CASHFREE_SECRET_KEY;
    const mode = process.env.CASHFREE_MODE || 'sandbox';

    if (!appId || !secretKey) {
      if (wantsJson) {
        return NextResponse.json(
          { error: 'Payment gateway credentials are not configured on server.' },
          { status: 500 }
        );
      }
      return NextResponse.redirect(`${origin}/?payment=config_error`);
    }

    const baseUrl =
      mode === 'production'
        ? 'https://api.cashfree.com/pg'
        : 'https://sandbox.cashfree.com/pg';

    // Verify order directly with Cashfree Official PG API
    const response = await fetch(`${baseUrl}/orders/${encodeURIComponent(cleanOrderId)}`, {
      method: 'GET',
      headers: {
        'x-client-id': appId,
        'x-client-secret': secretKey,
        'x-api-version': '2023-08-01',
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      if (wantsJson) {
        return NextResponse.json(
          { error: errData.message || 'Order not found in Cashfree system.' },
          { status: 404 }
        );
      }
      return NextResponse.redirect(`${origin}/?payment=not_found`);
    }

    const orderData = await response.json();

    // STRICT CHECK 1: Cashfree Order Status MUST be 'PAID'
    if (orderData.order_status !== 'PAID') {
      if (wantsJson) {
        return NextResponse.json(
          {
            error: `Payment is not completed. Cashfree status: ${orderData.order_status}`,
            status: orderData.order_status,
          },
          { status: 400 }
        );
      }
      return NextResponse.redirect(`${origin}/?payment=unpaid&status=${orderData.order_status}`);
    }

    // STRICT CHECK 2: Order Customer MUST match the logged-in user (prevent claim hijacking)
    const cfCustomerId = orderData.customer_details?.customer_id;
    const cfCustomerEmail = orderData.customer_details?.customer_email;
    const sanitizedUserId = user.id.replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 50);

    const isOwner =
      cfCustomerId === sanitizedUserId ||
      cfCustomerId === user.id ||
      (cfCustomerEmail && cfCustomerEmail.toLowerCase() === user.email?.toLowerCase());

    if (!isOwner) {
      if (wantsJson) {
        return NextResponse.json(
          { error: 'This Cashfree payment order belongs to a different user account.' },
          { status: 403 }
        );
      }
      return NextResponse.redirect(`${origin}/?payment=account_mismatch`);
    }

    // Determine plan type from paid amount (e.g. 199 = monthly, 999 = lifetime)
    const billingCycle = (orderData.order_amount || 0) < 500 ? 'monthly' : 'lifetime';

    // Upsert subscription for THIS verified user only
    const { error: dbError } = await supabase.from('user_subscriptions').upsert(
      {
        user_id: user.id,
        plan: 'pro',
        billing_cycle: billingCycle,
        status: 'active',
        order_id: cleanOrderId,
        amount: orderData.order_amount,
        currency: orderData.order_currency || 'INR',
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id' }
    );

    if (dbError) {
      console.error('Error saving subscription in database:', dbError);
      if (wantsJson) {
        return NextResponse.json({ error: 'Failed to record subscription in database' }, { status: 500 });
      }
      return NextResponse.redirect(`${origin}/?payment=db_error`);
    }

    if (wantsJson) {
      return NextResponse.json({
        success: true,
        plan: 'pro',
        billing_cycle: billingCycle,
        order_id: cleanOrderId,
      });
    }

    return NextResponse.redirect(`${origin}/?upgraded=true`);
  } catch (error: any) {
    console.error('Error in Cashfree verification handler:', error);
    if (wantsJson) {
      return NextResponse.json(
        { error: error?.message || 'Internal server error verifying order' },
        { status: 500 }
      );
    }
    return NextResponse.redirect(`${origin}/?payment=error`);
  }
}
