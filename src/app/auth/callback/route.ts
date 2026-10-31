import { createServerClient } from '@supabase/ssr';
import { type NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const errorParam = searchParams.get('error');
  const errorDescription = searchParams.get('error_description');
  const next = searchParams.get('next') ?? '/';

  // Request origin guarantees matching protocol and domain (preventing cross-origin cookie loss)
  const requestOrigin = request.nextUrl.origin;
  const isLocalEnv = process.env.NODE_ENV === 'development';
  const appUrl = process.env.NEXT_PUBLIC_APP_URL;

  const redirectBase =
    isLocalEnv
      ? requestOrigin
      : appUrl && !appUrl.includes('localhost')
      ? appUrl.replace(/\/$/, '')
      : requestOrigin;

  // Handle direct OAuth provider errors (e.g. user cancelled)
  if (errorParam || errorDescription) {
    const errorMsg = encodeURIComponent(errorDescription || errorParam || 'auth_failed');
    return NextResponse.redirect(`${redirectBase}/auth/login?error=${errorMsg}`);
  }

  if (code) {
    // 1. Prepare target URL and redirect response object FIRST
    const safeNext = next.startsWith('/') ? next : '/';
    const targetUrl = new URL(safeNext, redirectBase);
    const response = NextResponse.redirect(targetUrl);

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      console.error('Supabase environment variables missing in callback route');
      return NextResponse.redirect(`${redirectBase}/auth/login?error=server_config_error`);
    }

    // 2. Create the SSR client directly bound to the response's Set-Cookie header store
    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            // Write cookies directly into the outgoing redirect response
            response.cookies.set(name, value, {
              ...options,
              sameSite: 'lax',
              path: '/',
            });
          });
        },
      },
    });

    // 3. Exchange the temporary code for a verified session
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // 4. Return the response with all Set-Cookie headers intact so browser persists session immediately
      return response;
    } else {
      console.error('OAuth exchangeCodeForSession error:', error.message);
      const errorMsg = encodeURIComponent(error.message);
      return NextResponse.redirect(`${redirectBase}/auth/login?error=${errorMsg}`);
    }
  }

  // Fallback if no code provided
  return NextResponse.redirect(`${redirectBase}/auth/login?error=missing_auth_code`);
}
