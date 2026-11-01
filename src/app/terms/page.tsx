import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Scale, ShieldAlert, Award } from 'lucide-react';

export const metadata = {
  title: 'Terms of Service | Syntoze API Vault',
  description: 'Terms and conditions for using Syntoze API Manager zero-knowledge vault and subscriptions.',
};

export default function TermsPage() {
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
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 border border-white/[0.08]">
              Legal
            </span>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-12 space-y-8">
        <div className="space-y-3">
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-mono">
            <Scale className="w-3.5 h-3.5" />
            <span>Developer Service Agreement</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">Terms of Service</h1>
          <p className="text-xs sm:text-sm text-zinc-400">
            Last Updated: November 1, 2026 • Effective Immediately
          </p>
        </div>

        <section className="space-y-3 text-xs sm:text-sm text-zinc-300 leading-relaxed">
          <h2 className="text-lg font-bold text-white">1. Acceptance of Terms</h2>
          <p>
            By accessing or using Syntoze API Manager (&quot;Service&quot;, &quot;Syntoze Vault&quot;, &quot;we&quot;, &quot;us&quot;),
            you agree to be bound by these Terms of Service. If you disagree with any part of these terms, you must discontinue use immediately.
          </p>
        </section>

        <section className="space-y-3 text-xs sm:text-sm text-zinc-300 leading-relaxed">
          <h2 className="text-lg font-bold text-white">2. Cryptographic Architecture &amp; User Responsibility</h2>
          <p>
            Syntoze operates as a zero-knowledge cryptographic vault. You acknowledge and accept that:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-zinc-400">
            <li>
              <strong>Passphrase Custody:</strong> You are solely responsible for retaining your master encryption passphrase and your 24-character Emergency Recovery Kit. Because we do not store your master key, <strong>we cannot recover lost passwords or decrypt vaults on your behalf</strong>.
            </li>
            <li>
              <strong>Credential Authorization:</strong> You represent that you own or have lawful permission to store any API keys, access tokens, and connection strings placed into the Service.
            </li>
          </ul>
        </section>

        <section className="space-y-3 text-xs sm:text-sm text-zinc-300 leading-relaxed">
          <h2 className="text-lg font-bold text-white flex items-center space-x-2">
            <Award className="w-4 h-4 text-indigo-400" />
            <span>3. Plans, Subscriptions &amp; Billing</span>
          </h2>
          <ul className="list-disc pl-5 space-y-1.5 text-zinc-400">
            <li><strong>Free Developer Tier:</strong> Includes up to 15 stored credentials, client-side AES-256 encryption, and standard .env exports at zero cost.</li>
            <li><strong>Syntoze Pro (Monthly / Lifetime):</strong> Unlocks unlimited credentials, multi-environment leak detection, automated key rotation health alerts, and instant disaster recovery backups.</li>
            <li><strong>Billing &amp; Payments:</strong> All payments are processed in Indian Rupees (INR) through Cashfree Payments. You agree to provide accurate billing details (email and mobile number) for transaction confirmations and GST invoices.</li>
          </ul>
        </section>

        <section className="space-y-3 text-xs sm:text-sm text-zinc-300 leading-relaxed">
          <h2 className="text-lg font-bold text-white flex items-center space-x-2">
            <ShieldAlert className="w-4 h-4 text-amber-400" />
            <span>4. Limitation of Liability</span>
          </h2>
          <p>
            To the maximum extent permitted by applicable law, Syntoze and its contributors shall not be held liable for any indirect, incidental, or consequential damages resulting from unauthorized access caused by compromised user master passphrases, lost recovery codes, or third-party service outages.
          </p>
        </section>

        <section className="space-y-2 text-xs sm:text-sm text-zinc-300 leading-relaxed pt-4 border-t border-white/[0.06]">
          <h2 className="text-lg font-bold text-white">5. Governing Law &amp; Contact</h2>
          <p className="text-zinc-400">
            These terms are governed by the laws of India. For legal inquiries or support requests, email{' '}
            <a href="mailto:support@syntoze.com" className="text-indigo-400 hover:underline">
              support@syntoze.com
            </a>.
          </p>
        </section>
      </main>
    </div>
  );
}
