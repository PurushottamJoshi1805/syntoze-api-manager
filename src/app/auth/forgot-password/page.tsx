'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import {
  KeyRound,
  Mail,
  ArrowLeft,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { resetPassword } from '@/lib/supabase/auth-actions';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isPending, startTransition] = useTransition();

  async function handleReset() {
    setError('');

    const formData = new FormData();
    formData.append('email', email);

    startTransition(async () => {
      const result = await resetPassword(formData);
      if (result?.error) {
        setError(result.error);
      } else {
        setSuccess(true);
      }
    });
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
          Reset your account password
        </p>
      </div>

      {/* Card */}
      <div className="rounded-xl border border-white/[0.08] bg-[#0D0E14] shadow-2xl p-6">
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
                If an account exists for <span className="text-white font-medium">{email}</span>, you will receive a reset link shortly.
              </p>
            </div>
            <Link
              href="/auth/login"
              className="inline-flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300 font-medium transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to sign in</span>
            </Link>
          </div>
        ) : (
          <>
            <div className="mb-4">
              <h2 className="text-sm font-semibold text-white mb-1">
                Password recovery
              </h2>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Enter your registered email address and we&apos;ll send you a password reset link.
              </p>
            </div>

            {error && (
              <div className="flex items-start gap-2.5 rounded-lg bg-rose-500/10 border border-rose-500/20 p-2.5 mb-4 animate-in fade-in duration-150">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <p className="text-xs text-rose-300">{error}</p>
              </div>
            )}

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleReset();
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

              <button
                type="submit"
                disabled={isPending}
                className="w-full flex items-center justify-center gap-1.5 rounded-lg px-3.5 py-2 text-xs font-medium bg-white text-zinc-950 hover:bg-zinc-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
              >
                {isPending ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <>
                    <span>Send reset link</span>
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
        <Link
          href="/auth/login"
          className="inline-flex items-center gap-1 text-zinc-300 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-3 h-3" />
          <span>Back to sign in</span>
        </Link>
      </p>
    </div>
  );
}
