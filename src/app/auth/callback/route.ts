import { createServerSupabaseClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const errorParam = searchParams.get('error');
  const errorDescription = searchParams.get('error_description');
  const next = searchParams.get('next') ?? '/';

  // Determine the best redirect base URL (prioritizing custom/production app URL over internal Vercel preview hosts)
  const appUrl = process.env.NEXT_PUBLIC_APP_URL;
  const isLocalEnv = process.env.NODE_ENV === 'development';
  const redirectBase =
    appUrl && !appUrl.includes('localhost')
      ? appUrl.replace(/\/$/, '')
      : isLocalEnv
      ? origin
      : 'https://syntoze-api-manager.vercel.app';

  // If Supabase returned an OAuth error directly in query params
  if (errorParam || errorDescription) {
    const errorMsg = encodeURIComponent(errorDescription || errorParam || 'auth_failed');
    return NextResponse.redirect(`${redirectBase}/auth/login?error=${errorMsg}`);
  }

  if (code) {
    const supabase = await createServerSupabaseClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${redirectBase}${next}`);
    } else {
      const errorMsg = encodeURIComponent(error.message);
      return NextResponse.redirect(`${redirectBase}/auth/login?error=${errorMsg}`);
    }
  }

  // Fallback
  return NextResponse.redirect(`${redirectBase}/auth/login?error=auth_callback_failed`);
}
