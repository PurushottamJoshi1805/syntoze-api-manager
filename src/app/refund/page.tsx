import React from 'react';
import Link from 'next/link';
import { ArrowLeft, RefreshCcw, CheckCircle2, Clock, Mail } from 'lucide-react';

export const metadata = {
  title: 'Refund & Cancellation Policy | Syntoze API Vault',
  description: '7-day money-back guarantee and subscription cancellation terms for Syntoze Pro.',
};

export default function RefundPage() {
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
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              Fair Billing
            </span>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-12 space-y-8">
        <div className="space-y-3">
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono">
            <RefreshCcw className="w-3.5 h-3.5" />
            <span>7-Day Money-Back Guarantee</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">Refund &amp; Cancellation Policy</h1>
          <p className="text-xs sm:text-sm text-zinc-400">
            Last Updated: November 1, 2026 • Cashfree PG Compliant
          </p>
        </div>

        {/* Highlight Card */}
        <div className="p-6 rounded-2xl bg-gradient-to-b from-emerald-950/20 to-zinc-950 border border-emerald-500/20 space-y-3">
          <div className="flex items-center space-x-2 text-emerald-400 font-semibold text-sm">
            <CheckCircle2 className="w-4 h-4" />
            <span>Risk-Free 7-Day Refund Promise</span>
          </div>
          <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
            If you upgrade to <strong>Syntoze Pro (Lifetime or Monthly)</strong> and determine that it does not fit your engineering workflow, simply contact us within <strong>7 calendar days</strong> of your transaction. We will issue a 100% full refund to your original payment method with zero hassle.
          </p>
        </div>

        <section className="space-y-3 text-xs sm:text-sm text-zinc-300 leading-relaxed">
          <h2 className="text-lg font-bold text-white">1. Eligibility for Refunds</h2>
          <ul className="list-disc pl-5 space-y-1.5 text-zinc-400">
            <li><strong>First-Time Upgrades:</strong> Both the ₹99/month (or international equivalent) and ₹999 Lifetime Access tiers are eligible for a full refund within 7 days of purchase.</li>
            <li><strong>Duplicate Charges:</strong> If an unintended multiple transaction occurs due to network timeout or gateway delay, all duplicate amounts are refunded automatically within 24–48 hours.</li>
          </ul>
        </section>

        <section className="space-y-3 text-xs sm:text-sm text-zinc-300 leading-relaxed">
          <h2 className="text-lg font-bold text-white flex items-center space-x-2">
            <Clock className="w-4 h-4 text-indigo-400" />
            <span>2. Refund Processing Timeline</span>
          </h2>
          <p>
            Once approved, refunds are initiated immediately through Cashfree Payments. The credited funds will reflect in your source account within standard banking windows:
          </p>
          <ul className="list-disc pl-5 space-y-1 text-zinc-400">
            <li><strong>UPI &amp; NetBanking:</strong> 2 to 4 business days.</li>
            <li><strong>Debit / Credit Cards:</strong> 5 to 7 business days, depending on your issuing bank.</li>
          </ul>
        </section>

        <section className="space-y-3 text-xs sm:text-sm text-zinc-300 leading-relaxed">
          <h2 className="text-lg font-bold text-white flex items-center space-x-2">
            <Mail className="w-4 h-4 text-indigo-400" />
            <span>3. How to Request a Refund</span>
          </h2>
          <p>
            Email your refund request to{' '}
            <a href="mailto:support@syntoze.com" className="text-indigo-400 font-medium hover:underline">
              support@syntoze.com
            </a>{' '}
            with:
          </p>
          <ul className="list-disc pl-5 space-y-1 text-zinc-400">
            <li>Your account email address</li>
            <li>Your Cashfree Order ID (e.g. <code>syntoze_...</code>) or UPI reference number</li>
          </ul>
          <p className="text-zinc-500 text-xs">Our billing desk responds within 12 hours.</p>
        </section>
      </main>
    </div>
  );
}

