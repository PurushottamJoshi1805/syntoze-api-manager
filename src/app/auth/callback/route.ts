import { createServerSupabaseClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const errorParam = searchParams.get('error');
  const errorDescription = searchParams.get('error_description');
  const next = searchParams.get('next') ?? '/';

  // If Supabase returned an OAuth error directly in query params
  if (errorParam || errorDescription) {
    const errorMsg = encodeURIComponent(errorDescription || errorParam || 'auth_failed');
    return NextResponse.redirect(`${origin}/auth/login?error=${errorMsg}`);
  }

  if (code) {
    const supabase = await createServerSupabaseClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    } else {
      const errorMsg = encodeURIComponent(error.message);
      return NextResponse.redirect(`${origin}/auth/login?error=${errorMsg}`);
    }
  }

  // Fallback
  return NextResponse.redirect(`${origin}/auth/login?error=auth_callback_failed`);
}
