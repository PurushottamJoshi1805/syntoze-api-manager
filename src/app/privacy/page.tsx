import React from 'react';
import Link from 'next/link';
import { Shield, ArrowLeft, Lock, Database, EyeOff, CheckCircle2 } from 'lucide-react';

export const metadata = {
  title: 'Privacy Policy | Syntoze API Vault',
  description: 'Zero-Knowledge Privacy Policy. Your API keys are encrypted client-side and never seen by our servers.',
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#08090C] text-slate-100 font-sans selection:bg-indigo-500/30 selection:text-white">
      <header className="border-b border-white/[0.06] bg-[#0A0B10]/80 backdrop-blur-xl sticky top-0 z-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <Link
            href="/auth/login"
            className="flex items-center space-x-2 text-xs font-medium text-zinc-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Syntoze Vault</span>
          </Link>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold text-white tracking-tight">Syntoze</span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              Zero-Knowledge
            </span>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-12 space-y-8">
        <div className="space-y-3">
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono">
            <Shield className="w-3.5 h-3.5" />
            <span>End-to-End Cryptographic Privacy</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">Privacy Policy</h1>
          <p className="text-xs sm:text-sm text-zinc-400">
            Last Updated: November 1, 2026 • Effective Immediately
          </p>
        </div>

        {/* Core Guarantee */}
        <div className="p-6 rounded-2xl bg-gradient-to-b from-indigo-950/30 to-zinc-950 border border-indigo-500/20 space-y-3">
          <div className="flex items-center space-x-2 text-indigo-400 font-semibold text-sm">
            <Lock className="w-4 h-4" />
            <span>The Syntoze Zero-Knowledge Guarantee</span>
          </div>
          <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
            Your master encryption passphrase is <strong>never transmitted</strong> over the network, never logged, and
            never stored on our servers. All API credentials, secrets, tokens, and notes are encrypted on your local device
            using <strong>WebCrypto AES-256-GCM</strong> before any bytes leave your browser. Even in the event of a full
            database breach, your secrets remain mathematically impossible to decrypt without your master passphrase.
          </p>
        </div>

        <section className="space-y-4 text-xs sm:text-sm text-zinc-300 leading-relaxed">
          <h2 className="text-lg font-bold text-white flex items-center space-x-2">
            <EyeOff className="w-4 h-4 text-indigo-400" />
            <span>1. What We DO NOT Collect or Store</span>
          </h2>
          <ul className="space-y-2 list-none pl-1">
            <li className="flex items-start space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span><strong>Plaintext Secrets:</strong> We never have access to unencrypted API keys, access tokens, or private environment variables.</span>
            </li>
            <li className="flex items-start space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span><strong>Master Passphrases:</strong> Only a 600,000-round PBKDF2 salt and a client-side verification hash are stored to authenticate your vault.</span>
            </li>
            <li className="flex items-start space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span><strong>Clipboard Contents:</strong> We do not track or persist the keys you copy; secure auto-clear purges clipboard content within 15–60 seconds.</span>
            </li>
          </ul>
        </section>

        <section className="space-y-4 text-xs sm:text-sm text-zinc-300 leading-relaxed">
          <h2 className="text-lg font-bold text-white flex items-center space-x-2">
            <Database className="w-4 h-4 text-indigo-400" />
            <span>2. What Information We Collect</span>
          </h2>
          <p>We collect only the minimum information required to provide the authentication and subscription services:</p>
          <ul className="list-disc pl-5 space-y-1.5 text-zinc-400">
            <li><strong>Account Identity:</strong> Your email address and basic profile information provided via Google/GitHub OAuth or email signup.</li>
            <li><strong>Encrypted Vault Blobs:</strong> Base64-encoded AES-256-GCM ciphertexts, initialization vectors (IVs), and project label metadata (e.g. project name, environment tag).</li>
            <li><strong>Billing Details:</strong> Payment order ID, transaction status, and invoice mobile number processed securely through our RBI-licensed payment partner, Cashfree Payments. We do not store raw credit card numbers or UPI PINs.</li>
          </ul>
        </section>

        <section className="space-y-3 text-xs sm:text-sm text-zinc-300 leading-relaxed">
          <h2 className="text-lg font-bold text-white">3. Third-Party Service Providers</h2>
          <p>We work exclusively with industry-standard, SOC-2 compliant infrastructure providers:</p>
          <ul className="list-disc pl-5 space-y-1 text-zinc-400">
            <li><strong>Supabase (PostgreSQL):</strong> Encrypted database hosting with Row-Level Security (RLS).</li>
            <li><strong>Cashfree Payments:</strong> Payment processing and invoice generation.</li>
            <li><strong>Vercel:</strong> Edge hosting, CDN, and serverless execution.</li>
          </ul>
        </section>

        <section className="space-y-3 text-xs sm:text-sm text-zinc-300 leading-relaxed">
          <h2 className="text-lg font-bold text-white">4. Data Deletion &amp; Right to Be Forgotten</h2>
          <p>
            You have the right to permanently purge your vault at any time. Using the <em>Danger Zone</em> in Vault Settings,
            you can execute a cryptographic purge that permanently deletes all stored ciphertexts, projects, and security settings with zero server retention.
          </p>
        </section>

        <section className="space-y-2 text-xs sm:text-sm text-zinc-300 leading-relaxed pt-4 border-t border-white/[0.06]">
          <h2 className="text-lg font-bold text-white">5. Contact Our Privacy Team</h2>
          <p className="text-zinc-400">
            Questions regarding our cryptographic model or privacy practices? Reach us at{' '}
            <a href="mailto:support@syntoze.com" className="text-indigo-400 hover:underline">
              support@syntoze.com
            </a>{' '}
            or visit our <Link href="/contact" className="text-indigo-400 hover:underline">Contact Page</Link>.
          </p>
        </section>
      </main>
    </div>
  );
}

