import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Mail, MessageSquare, Clock, Globe, Shield, Terminal } from 'lucide-react';

export const metadata = {
  title: 'Contact Support | Syntoze API Vault',
  description: 'Get in touch with the Syntoze engineering and billing support team.',
};

export default function ContactPage() {
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
              Support
            </span>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-12 space-y-8">
        <div className="space-y-3">
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-mono">
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Developer Support &amp; Billing Desk</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">Contact Us</h1>
          <p className="text-xs sm:text-sm text-zinc-400">
            Have questions about cryptographic vault security, Cashfree payments, or bug reports? We are here to help.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Card 1: Email Support */}
          <div className="p-6 rounded-2xl bg-zinc-950 border border-white/[0.08] space-y-3">
            <div className="h-10 w-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <Mail className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-white">Direct Email Support</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Reach our core engineering and billing team directly. We respond within 12 hours.
            </p>
            <div className="pt-2">
              <a
                href="mailto:support@syntoze.com"
                className="text-xs font-mono font-semibold text-indigo-400 hover:text-indigo-300 underline underline-offset-4"
              >
                support@syntoze.com
              </a>
            </div>
          </div>

          {/* Card 2: Operating Hours & Turnaround */}
          <div className="p-6 rounded-2xl bg-zinc-950 border border-white/[0.08] space-y-3">
            <div className="h-10 w-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Clock className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-white">Response Turnaround</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Monday through Saturday: 9:00 AM – 9:00 PM IST (GMT +5:30). Urgent payment reconciliation requests are handled with priority.
            </p>
            <div className="pt-2 text-[11px] font-mono text-emerald-400">
              Average response time: &lt; 2 hours
            </div>
          </div>
        </div>

        {/* Security Disclosure */}
        <div className="p-6 rounded-2xl bg-[#090A0F] border border-white/[0.06] space-y-2">
          <div className="flex items-center space-x-2 text-zinc-300 text-xs font-semibold">
            <Shield className="w-4 h-4 text-indigo-400" />
            <span>Responsible Security Vulnerability Disclosure</span>
          </div>
          <p className="text-xs text-zinc-400 leading-relaxed">
            If you have identified a cryptographic flaw, security vulnerability, or potential leak in our WebCrypto AES-256 implementation, please encrypt your report or send it directly to{' '}
            <code className="text-indigo-300 font-mono text-[11px]">security@syntoze.com</code> or{' '}
            <code className="text-indigo-300 font-mono text-[11px]">support@syntoze.com</code>.
          </p>
        </div>
      </main>
    </div>
  );
}

