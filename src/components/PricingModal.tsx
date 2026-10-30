'use client';

import React, { useState } from 'react';
import { useVault } from '@/lib/context/vaultContext';
import { load } from '@cashfreepayments/cashfree-js';
import {
  X,
  Check,
  Sparkles,
  Zap,
  Shield,
  RefreshCw,
  Key,
  Layers,
  ArrowRight,
  Loader2,
  Lock,
  Phone,
  AlertCircle,
  CreditCard,
} from 'lucide-react';
import { toast } from 'sonner';

interface PricingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PricingModal: React.FC<PricingModalProps> = ({ isOpen, onClose }) => {
  const { user, isPro, credentials, refreshSubscription } = useVault();
  const [selectedPlan, setSelectedPlan] = useState<'lifetime' | 'monthly'>('lifetime');
  const [phone, setPhone] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen) return null;

  const handleCheckout = async () => {
    setErrorMessage('');
    setIsLoading(true);

    try {
      // 1. Call server to create Cashfree order
      const response = await fetch('/api/payments/cashfree/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planType: selectedPlan,
          customerPhone: phone.trim() || '9999999999',
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setErrorMessage(data.error || 'Failed to create payment order.');
        setIsLoading(false);
        return;
      }

      // 2. Initialize Cashfree JS SDK
      const cashfree = await load({
        mode: data.mode === 'production' ? 'production' : 'sandbox',
      });

      // 3. Open Cashfree embedded checkout modal
      await cashfree.checkout({
        paymentSessionId: data.payment_session_id,
        redirectTarget: '_modal',
      });

      setIsLoading(false);
    } catch (err: any) {
      console.error('Checkout error:', err);
      setErrorMessage(err?.message || 'Payment initiation failed. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-xl bg-[#0D0E14] border border-white/[0.1] rounded-2xl shadow-2xl p-6 sm:p-8 relative max-h-[90vh] overflow-y-auto">
        {/* Top subtle highlight */}
        <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-indigo-500/30 to-transparent rounded-t-2xl" />

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800/80 transition-colors"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Header */}
        <div className="text-center space-y-2 mb-6">
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-medium">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Syntoze Pro Access</span>
          </div>

          <h2 className="text-2xl font-bold tracking-tight text-white">
            Unlock Unlimited Keys & Security Hygiene
          </h2>

          <p className="text-xs text-zinc-400 max-w-md mx-auto">
            Zero-knowledge client encrypted vault. Currently using{' '}
            <strong className="text-white">{credentials.length} of 15</strong> free credentials.
          </p>
        </div>

        {/* Plan Selector Toggle */}
        <div className="grid grid-cols-2 gap-3 mb-6 p-1 bg-[#08090C] rounded-xl border border-white/[0.06]">
          <button
            type="button"
            onClick={() => setSelectedPlan('lifetime')}
            className={`p-3 rounded-lg text-left transition-all relative ${
              selectedPlan === 'lifetime'
                ? 'bg-zinc-900 border border-indigo-500/40 text-white shadow-md'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <span className="absolute -top-2 right-2 text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-semibold">
              Early Bird
            </span>
            <p className="text-xs font-semibold">Lifetime Access</p>
            <div className="flex items-baseline space-x-1 mt-1">
              <span className="text-xl font-bold text-white font-mono">₹999</span>
              <span className="text-[10px] text-zinc-500">one-time payment</span>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setSelectedPlan('monthly')}
            className={`p-3 rounded-lg text-left transition-all ${
              selectedPlan === 'monthly'
                ? 'bg-zinc-900 border border-indigo-500/40 text-white shadow-md'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <p className="text-xs font-semibold">Monthly Subscription</p>
            <div className="flex items-baseline space-x-1 mt-1">
              <span className="text-xl font-bold text-white font-mono">₹199</span>
              <span className="text-[10px] text-zinc-500">/ month</span>
            </div>
          </button>
        </div>

        {/* Feature comparison checklist */}
        <div className="space-y-2.5 mb-6 p-4 rounded-xl bg-[#08090C] border border-white/[0.06]">
          {[
            'Unlimited API keys, tokens & connection strings',
            'All environments (Development, Staging, QA, Production)',
            'Automated Security Health & Rotation Alerts (>90 days old)',
            'Cross-Environment Leak Protection (Flags dev keys in prod)',
            'Instant 1-Click .env Batch Exporter & Importer',
            '24-Character Cryptographic Disaster Recovery Kit',
            'Zero Server Knowledge: Client WebCrypto AES-256-GCM',
          ].map((feature) => (
            <div key={feature} className="flex items-start space-x-2.5 text-xs text-zinc-300">
              <div className="h-4 w-4 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 flex-shrink-0 mt-0.5">
                <Check className="h-2.5 w-2.5 stroke-[3]" />
              </div>
              <span>{feature}</span>
            </div>
          ))}
        </div>

        {/* Phone number input for Cashfree receipts / UPI */}
        <div className="mb-4">
          <label className="block text-[11px] font-medium text-zinc-300 mb-1">
            Mobile Number (for UPI & Cashfree invoice receipt)
          </label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <input
              type="tel"
              placeholder="9876543210"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2 bg-[#08090C] border border-white/[0.08] rounded-lg text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
            />
          </div>
        </div>

        {/* Error notification */}
        {errorMessage && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-300 flex flex-col space-y-2">
            <div className="flex items-start space-x-2">
              <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
              <span className="text-[11px] leading-relaxed">{errorMessage}</span>
            </div>
            {errorMessage.includes('Cashfree API keys') && (
              <button
                type="button"
                onClick={() => {
                  setIsLoading(true);
                  window.location.href = '/api/payments/cashfree/verify?demo=true';
                }}
                className="mt-1 w-full py-2 px-3 bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 rounded-lg text-xs font-semibold flex items-center justify-center space-x-1.5 transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Activate Pro Upgrade (Sandbox Demo Mode)</span>
              </button>
            )}
          </div>
        )}

        {/* Action Button */}
        <button
          type="button"
          onClick={handleCheckout}
          disabled={isLoading || isPro}
          className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg shadow-lg shadow-indigo-600/20 transition-all flex items-center justify-center space-x-2 active:scale-[0.99] disabled:opacity-50"
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin text-white" />
          ) : isPro ? (
            <span>You are already on Syntoze Pro</span>
          ) : (
            <>
              <span>
                Pay {selectedPlan === 'lifetime' ? '₹999 (Lifetime)' : '₹199 / month'} via Cashfree
              </span>
              <ArrowRight className="w-3.5 h-3.5" />
            </>
          )}
        </button>

        {/* Security & Payment badge footer */}
        <div className="mt-4 pt-3 border-t border-white/[0.06] flex items-center justify-between text-[11px] text-zinc-500">
          <span className="flex items-center space-x-1">
            <Lock className="h-3 w-3" />
            <span>256-Bit Encrypted Payments</span>
          </span>
          <span>Powered by Cashfree Payments (UPI / Cards / NetBanking)</span>
        </div>
      </div>
    </div>
  );
};

