'use client';

import { useState, useTransition, Suspense, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  ShieldCheck,
  Mail,
  Lock,
  ArrowRight,
  AlertCircle,
  Loader2,
  KeyRound,
  Terminal,
  RefreshCw,
  Layers,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18A10.96 10.96 0 0 0 1 12c0 1.77.42 3.45 1.18 4.93l3.66-2.84z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  );
}

function GitHubIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.02 10.02 0 0 0 22 12.017C22 6.484 17.522 2 12 2z" />
    </svg>
  );
}

function AuthForm() {
  const searchParams = useSearchParams();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isEmailConflict, setIsEmailConflict] = useState(false);
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState<'google' | 'github' | null>(null);

  useEffect(() => {
    try {
      const errParam = searchParams.get('error') || '';
      const errDesc = searchParams.get('error_description') || '';
      let hash = '';
      if (typeof window !== 'undefined' && window.location.hash) {
        hash = window.location.hash;
      }
      const rawText = `${errParam} ${errDesc} ${hash}`.toLowerCase();

      if (
        rawText.includes('multiple accounts with the same email') ||
        rawText.includes('linking domain') ||
        rawText.includes('different providers')
      ) {
        setIsEmailConflict(true);
        setError('');
      } else if (errDesc) {
        setError(errDesc.replace(/\+/g, ' '));
      } else if (errParam && errParam !== 'auth_callback_failed') {
        setError(errParam.replace(/\+/g, ' '));
      }
    } catch {
      // Safe fallback
    }
  }, [searchParams]);

  // Handle Email + Password Login or Signup directly via Supabase browser client
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsEmailConflict(false);

    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    setIsLoading(true);

    try {
      const supabase = createClient();

      if (isSignUp) {
        // Sign up flow
        const { data, error: signUpError } = await supabase.auth.signUp({
          email: email.trim(),
          password: password.trim(),
          options: {
            emailRedirectTo: typeof window !== 'undefined' ? `${window.location.origin}/auth/callback` : undefined,
          },
        });

        if (signUpError) {
          setError(signUpError.message);
          setIsLoading(false);
          return;
        }

        if (data?.session) {
          window.location.href = '/';
        } else {
          setSuccess('Account created! Please check your email inbox to confirm your account.');
          setIsLoading(false);
        }
      } else {
        // Sign in flow
        const { data, error: signInError } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password: password.trim(),
        });

        if (signInError) {
          if (signInError.message.includes('Invalid login credentials')) {
            setError('Invalid email or password. If you do not have an account yet, click "Create an account" below.');
          } else {
            setError(signInError.message);
          }
          setIsLoading(false);
          return;
        }

        if (data?.session) {
          window.location.href = '/';
        } else {
          window.location.href = '/';
        }
      }
    } catch (err: any) {
      setError(err?.message || 'Authentication failed. Please verify your connection.');
      setIsLoading(false);
    }
  };

  // Handle OAuth with direct browser redirect
  const handleOAuth = async (provider: 'google' | 'github') => {
    setOauthLoading(provider);
    setError('');
    setIsEmailConflict(false);

    try {
      const supabase = createClient();
      const redirectUrl = typeof window !== 'undefined' ? `${window.location.origin}/auth/callback` : undefined;

      const { data, error: oauthError } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: redirectUrl,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });

      if (oauthError) {
        setError(oauthError.message);
        setOauthLoading(null);
        return;
      }

      if (data?.url) {
        window.location.href = data.url;
      }
    } catch (err: any) {
      setError(err?.message || `Failed to initialize ${provider} authentication.`);
      setOauthLoading(null);
    }
  };

  return (
    <div className="w-full min-h-screen flex flex-col lg:flex-row bg-[#08090C] text-slate-100 font-sans selection:bg-indigo-500/30 selection:text-white">
      {/* Left Column: Developer Value Pitch & Crypto Terminal */}
      <div className="lg:w-7/12 p-8 sm:p-12 lg:p-16 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-white/[0.06] relative overflow-hidden bg-developer-grid">
        <div className="absolute -top-40 -left-40 w-[500px] h-[500px] bg-indigo-600/[0.08] rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-[450px] h-[450px] bg-cyan-600/[0.05] rounded-full blur-[160px] pointer-events-none" />

        {/* Brand identity */}
        <div className="flex items-center space-x-3 z-10">
          <div className="h-9 w-9 rounded-lg bg-zinc-900 border border-white/[0.1] flex items-center justify-center shadow-sm">
            <KeyRound className="h-4 w-4 text-indigo-400" />
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-base font-semibold tracking-tight text-white">Syntoze</span>
            <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-md bg-white/[0.04] border border-white/[0.08] text-zinc-400 font-medium">
              Vault v2.4
            </span>
          </div>
        </div>

        {/* Main developer pitch */}
        <div className="my-10 lg:my-0 max-w-xl z-10 space-y-6">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-zinc-900/80 border border-white/[0.08] text-xs text-zinc-300">
            <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-mono text-[11px] text-zinc-300">Client-Side WebCrypto AES-256-GCM</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight text-white leading-[1.15]">
            The secret manager crafted for{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 via-cyan-200 to-emerald-300">
              real developers
            </span>.
          </h1>

          <p className="text-sm sm:text-base text-zinc-400 leading-relaxed max-w-lg">
            Stop copy-pasting API keys in plain text notes or untracked <code className="text-cyan-300 font-mono text-xs bg-zinc-900 px-1.5 py-0.5 rounded border border-white/[0.08]">.env</code> files. Syntoze derives cryptographic keys inside your browser with 600,000 PBKDF2 rounds before syncing ciphertext to Supabase.
          </p>

          {/* Live Cryptographic Terminal Simulation */}
          <div className="rounded-xl border border-white/[0.08] bg-[#0C0D12] p-4 font-mono text-xs text-zinc-300 shadow-2xl relative">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/[0.06] text-zinc-500 text-[11px]">
              <div className="flex items-center space-x-2">
                <span className="h-2.5 w-2.5 rounded-full bg-rose-500/80 inline-block" />
                <span className="h-2.5 w-2.5 rounded-full bg-amber-500/80 inline-block" />
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-500/80 inline-block" />
              </div>
              <span className="text-[10px] text-zinc-500">syntoze-crypto-runtime</span>
            </div>
            <div className="space-y-1.5 text-[11px] leading-relaxed">
              <p className="text-zinc-500">$ syntoze vault:status --strict</p>
              <p className="text-emerald-400">✓ WebCrypto PBKDF2-SHA256 (600,000 iterations) initialized</p>
              <p className="text-indigo-300">✓ AES-256-GCM master key derived in ephemeral browser memory</p>
              <p className="text-cyan-300">✓ Zero-knowledge: Plaintext never transmitted or logged</p>
              <p className="text-zinc-400">✓ Supabase encrypted ciphertext storage active</p>
            </div>
          </div>

          {/* Feature Highlights */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            <div className="p-3.5 rounded-xl bg-zinc-900/40 border border-white/[0.06]">
              <div className="flex items-center space-x-2 mb-1.5">
                <ShieldCheck className="h-4 w-4 text-indigo-400" />
                <p className="text-xs font-medium text-white">Zero Trust</p>
              </div>
              <p className="text-[11px] text-zinc-400 leading-normal">
                Browser WebCrypto AES-GCM. Supabase stores ciphertext only.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-zinc-900/40 border border-white/[0.06]">
              <div className="flex items-center space-x-2 mb-1.5">
                <RefreshCw className="h-4 w-4 text-amber-400" />
                <p className="text-xs font-medium text-white">Rotation Alerts</p>
              </div>
              <p className="text-[11px] text-zinc-400 leading-normal">
                Flags keys &gt;90 days old with 1-click token update workflows.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-zinc-900/40 border border-white/[0.06]">
              <div className="flex items-center space-x-2 mb-1.5">
                <Layers className="h-4 w-4 text-cyan-400" />
                <p className="text-xs font-medium text-white">Leak Shield</p>
              </div>
              <p className="text-[11px] text-zinc-400 leading-normal">
                Audits against accidental Dev vs Prod secret re-use.
              </p>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="text-xs text-zinc-500 z-10 flex items-center justify-between pt-4 border-t border-white/[0.06]">
          <p>© 2026 Syntoze API Manager. Zero-Knowledge Cryptography.</p>
          <span className="font-mono text-[11px] text-zinc-500">Production Build</span>
        </div>
      </div>

      {/* Right Column: Clean, high-density authentication card */}
      <div className="lg:w-5/12 flex items-center justify-center p-6 sm:p-12 relative bg-[#090A0F]">
        <div className="w-full max-w-md bg-[#0D0E14] border border-white/[0.08] rounded-2xl p-7 sm:p-8 shadow-2xl relative">
          <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/15 to-transparent rounded-t-2xl" />

          {/* Form Header */}
          <div className="mb-6">
            <h2 className="text-xl font-semibold tracking-tight text-white">
              {isSignUp ? 'Create your developer vault' : 'Welcome back'}
            </h2>
            <p className="text-xs text-zinc-400 mt-1">
              {isSignUp
                ? 'Free zero-knowledge personal vault. Enter email & password.'
                : 'Sign in to decrypt and manage your developer credentials.'}
            </p>
          </div>

          {/* Social OAuth Providers */}
          <div className="space-y-2.5 mb-5">
            <button
              type="button"
              onClick={() => handleOAuth('google')}
              disabled={oauthLoading !== null || isLoading}
              className="w-full flex items-center justify-center space-x-2.5 px-4 py-2.5 rounded-lg text-xs font-medium bg-white text-zinc-950 hover:bg-zinc-200 transition-all shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 active:scale-[0.99] disabled:opacity-50"
            >
              {oauthLoading === 'google' ? (
                <Loader2 className="w-4 h-4 animate-spin text-zinc-700" />
              ) : (
                <GoogleIcon className="w-4 h-4" />
              )}
              <span>Continue with Google</span>
            </button>

            <button
              type="button"
              onClick={() => handleOAuth('github')}
              disabled={oauthLoading !== null || isLoading}
              className="w-full flex items-center justify-center space-x-2.5 px-4 py-2.5 rounded-lg text-xs font-medium bg-zinc-900 text-white hover:bg-zinc-800 border border-white/[0.08] hover:border-white/[0.15] transition-all shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 active:scale-[0.99] disabled:opacity-50"
            >
              {oauthLoading === 'github' ? (
                <Loader2 className="w-4 h-4 animate-spin text-zinc-400" />
              ) : (
                <GitHubIcon className="w-4 h-4" />
              )}
              <span>Continue with GitHub</span>
            </button>
          </div>

          {/* Divider */}
          <div className="relative my-5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/[0.08]" />
            </div>
            <div className="relative flex justify-center text-[10px] uppercase font-mono tracking-wider">
              <span className="bg-[#0D0E14] px-2.5 text-zinc-500">or use work email</span>
            </div>
          </div>

          {/* Supabase Email Conflict Alert */}
          {isEmailConflict && (
            <div className="p-3.5 mb-5 rounded-xl bg-amber-500/10 border border-amber-500/25 text-xs text-amber-200 animate-in fade-in duration-200 space-y-2">
              <div className="flex items-start space-x-2.5">
                <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-semibold text-amber-300">Account already registered with Google</p>
                  <p className="text-[11px] text-amber-200/80 leading-relaxed">
                    This email was previously used to sign in with Google. Click below to sign in directly with your verified Google account:
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleOAuth('google')}
                className="w-full mt-2 inline-flex items-center justify-center space-x-2 px-3 py-2 rounded-lg bg-amber-400 hover:bg-amber-300 text-zinc-950 font-semibold text-xs transition-colors shadow-sm"
              >
                <GoogleIcon className="w-3.5 h-3.5" />
                <span>Sign in with Google now</span>
              </button>
            </div>
          )}

          {/* Error Alert */}
          {error && !isEmailConflict && (
            <div className="p-3 mb-4 rounded-xl bg-rose-500/10 border border-rose-500/25 text-xs text-rose-300 flex items-start space-x-2 animate-in fade-in duration-150">
              <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-400 mt-0.5" />
              <span className="text-[11px] leading-relaxed">{error}</span>
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="p-3 mb-4 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-xs text-emerald-300 flex items-center space-x-2 animate-in fade-in duration-150">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-400" />
              <span className="text-[11px] leading-relaxed">{success}</span>
            </div>
          )}

          {/* Email / Password Form */}
          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div>
              <label className="block text-[11px] font-medium text-zinc-300 mb-1">
                Email address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                <input
                  type="email"
                  required
                  placeholder="developer@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2 bg-[#08090C] border border-white/[0.08] hover:border-white/[0.15] rounded-lg text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-[11px] font-medium text-zinc-300">
                  Password
                </label>
                {!isSignUp && (
                  <Link
                    href="/auth/forgot-password"
                    className="text-[11px] text-zinc-400 hover:text-white transition-colors"
                  >
                    Forgot password?
                  </Link>
                )}
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                <input
                  type="password"
                  required
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2 bg-[#08090C] border border-white/[0.08] hover:border-white/[0.15] rounded-lg text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium rounded-lg shadow-sm transition-all flex items-center justify-center space-x-2 active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin text-white" />
              ) : (
                <>
                  <span>{isSignUp ? 'Create Vault Account' : 'Sign In to Vault'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </form>

          {/* Toggle between Sign In and Create Account */}
          <div className="mt-5 pt-4 border-t border-white/[0.06] text-center">
            <button
              type="button"
              onClick={() => {
                setIsSignUp(!isSignUp);
                setError('');
                setSuccess('');
                setIsEmailConflict(false);
              }}
              className="text-xs text-zinc-400 hover:text-white transition-colors"
            >
              {isSignUp ? (
                <span>
                  Already have an account? <strong className="text-indigo-400 font-medium">Sign in</strong>
                </span>
              ) : (
                <span>
                  New to Syntoze? <strong className="text-indigo-400 font-medium">Create an account</strong>
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#08090C] flex items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
        </div>
      }
    >
      <AuthForm />
    </Suspense>
  );
}
