'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import {
  KeyRound,
  Mail,
  Lock,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  signUpWithEmail,
  signInWithGoogle,
  signInWithGitHub,
} from '@/lib/supabase/auth-actions';

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

export default function SignUpPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [oauthLoading, setOauthLoading] = useState<'google' | 'github' | null>(null);

  const passwordTooShort = password.length > 0 && password.length < 8;
  const passwordsMismatch = confirmPassword.length > 0 && password !== confirmPassword;

  async function handleSignUp() {
    setError('');

    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    const formData = new FormData();
    formData.append('email', email);
    formData.append('password', password);

    startTransition(async () => {
      const result = await signUpWithEmail(formData);
      if (result?.error) {
        setError(result.error);
      } else {
        setSuccess(true);
      }
    });
  }

  async function handleGoogleSignIn() {
    setOauthLoading('google');
    try {
      await signInWithGoogle();
    } catch {
      setError('Failed to initiate Google sign-in.');
      setOauthLoading(null);
    }
  }

  async function handleGitHubSignIn() {
    setOauthLoading('github');
    try {
      await signInWithGitHub();
    } catch {
      setError('Failed to initiate GitHub sign-in.');
      setOauthLoading(null);
    }
  }

  return (
    <div className="w-full max-w-sm font-sans">
      {/* Branding Header */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-zinc-900 border border-white/[0.08] mb-3 shadow-sm">
          <KeyRound className="w-4 h-4 text-indigo-400" />
        </div>
        <div className="flex items-center justify-center space-x-1.5 mb-1">
          <span className="text-base font-semibold tracking-tight text-white">Syntoze</span>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/[0.04] border border-white/[0.07] text-zinc-400 font-medium">
            vault
          </span>
        </div>
        <p className="text-xs text-zinc-400">
          Create a zero-knowledge developer account
        </p>
      </div>

      {/* Card */}
      <div className="rounded-xl border border-white/[0.08] bg-[#0D0E14] shadow-2xl p-6">
        {/* Success State */}
        {success ? (
          <div className="text-center py-3 animate-in fade-in duration-200">
            <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-emerald-500/10 text-emerald-400 mb-3">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <h2 className="text-sm font-semibold text-white mb-1.5">
              Check your email
            </h2>
            <div className="rounded-lg bg-zinc-950 p-3 mb-4 border border-white/[0.06]">
              <p className="text-xs text-zinc-300">
                Confirmation link sent to <span className="text-white font-medium">{email}</span>. Click it to activate your account.
              </p>
            </div>
            <Link
              href="/auth/login"
              className="text-xs text-indigo-400 hover:text-indigo-300 font-medium transition-colors"
            >
              Back to sign in
            </Link>
          </div>
        ) : (
          <>
            {/* Error Banner */}
            {error && (
              <div className="flex items-start gap-2.5 rounded-lg bg-rose-500/10 border border-rose-500/20 p-2.5 mb-4 animate-in fade-in duration-150">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <p className="text-xs text-rose-300">{error}</p>
              </div>
            )}

            {/* OAuth Buttons */}
            <div className="space-y-2">
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={oauthLoading !== null || isPending}
                className={cn(
                  'w-full flex items-center justify-center gap-2 rounded-lg px-3.5 py-2 text-xs font-medium',
                  'bg-white text-zinc-950 hover:bg-zinc-200',
                  'transition-colors duration-150',
                  'disabled:opacity-50 disabled:cursor-not-allowed shadow-sm'
                )}
              >
                {oauthLoading === 'google' ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <GoogleIcon className="w-3.5 h-3.5" />
                )}
                Continue with Google
              </button>

              <button
                type="button"
                onClick={handleGitHubSignIn}
                disabled={oauthLoading !== null || isPending}
                className={cn(
                  'w-full flex items-center justify-center gap-2 rounded-lg px-3.5 py-2 text-xs font-medium',
                  'bg-zinc-900 text-zinc-200 hover:bg-zinc-800',
                  'border border-white/[0.08]',
                  'transition-colors duration-150',
                  'disabled:opacity-50 disabled:cursor-not-allowed'
                )}
              >
                {oauthLoading === 'github' ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <GitHubIcon className="w-3.5 h-3.5" />
                )}
                Continue with GitHub
              </button>
            </div>

            {/* Divider */}
            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/[0.06]" />
              </div>
              <div className="relative flex justify-center text-[10px]">
                <span className="bg-[#0D0E14] px-2 text-zinc-500 lowercase">
                  or email
                </span>
              </div>
            </div>

            {/* Sign-Up Form */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSignUp();
              }}
              className="space-y-3"
            >
              <div>
                <label
                  htmlFor="email"
                  className="block text-xs font-medium text-zinc-300 mb-1"
                >
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500" />
                  <input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@company.com"
                    autoComplete="email"
                    className="w-full rounded-lg bg-zinc-950 border border-white/[0.08] pl-9 pr-3 py-1.5 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500/60 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-xs font-medium text-zinc-300 mb-1"
                >
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500" />
                  <input
                    id="password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min. 8 characters"
                    autoComplete="new-password"
                    className={cn(
                      'w-full rounded-lg bg-zinc-950 border pl-9 pr-3 py-1.5 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500/60 transition-colors',
                      passwordTooShort ? 'border-rose-500/50' : 'border-white/[0.08]'
                    )}
                  />
                </div>
                {passwordTooShort && (
                  <p className="mt-1 text-[11px] text-rose-400">
                    Password must be at least 8 characters
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="confirmPassword"
                  className="block text-xs font-medium text-zinc-300 mb-1"
                >
                  Confirm password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500" />
                  <input
                    id="confirmPassword"
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repeat password"
                    autoComplete="new-password"
                    className={cn(
                      'w-full rounded-lg bg-zinc-950 border pl-9 pr-3 py-1.5 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500/60 transition-colors',
                      passwordsMismatch ? 'border-rose-500/50' : 'border-white/[0.08]'
                    )}
                  />
                </div>
                {passwordsMismatch && (
                  <p className="mt-1 text-[11px] text-rose-400">
                    Passwords do not match
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={isPending || oauthLoading !== null}
                className="w-full flex items-center justify-center gap-1.5 rounded-lg px-3.5 py-2 text-xs font-medium bg-white text-zinc-950 hover:bg-zinc-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm mt-1"
              >
                {isPending ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <>
                    <span>Create account</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </form>
          </>
        )}
      </div>

      {/* Footer Link */}
      <p className="text-center text-xs text-zinc-500 mt-4">
        Already have an account?{' '}
        <Link
          href="/auth/login"
          className="text-zinc-300 hover:text-white font-medium transition-colors"
        >
          Sign in
        </Link>
      </p>
    </div>
  );
}
