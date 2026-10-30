'use client';

import React, { useState } from 'react';
import { useVault } from '@/lib/context/vaultContext';
import {
  Lock,
  Unlock,
  ShieldAlert,
  KeyRound,
  Eye,
  EyeOff,
  Copy,
  Check,
  AlertCircle,
  Shield,
} from 'lucide-react';

export const MasterLockModal: React.FC = () => {
  const {
    user,
    isVaultConfigured,
    isLocked,
    initializeVault,
    unlockVault,
    unlockWithRecovery,
    resetVault,
  } = useVault();

  const [mode, setMode] = useState<'unlock' | 'recovery' | 'setup-step1' | 'setup-step2'>(
    isVaultConfigured ? 'unlock' : 'setup-step1'
  );

  const [passphrase, setPassphrase] = useState('');
  const [confirmPassphrase, setConfirmPassphrase] = useState('');
  const [autoLockMinutes, setAutoLockMinutes] = useState(15);
  const [showPassphrase, setShowPassphrase] = useState(false);
  const [recoveryCode, setRecoveryCode] = useState('');
  const [copiedRecovery, setCopiedRecovery] = useState(false);
  const [hasConfirmedSaved, setHasConfirmedSaved] = useState(false);

  const [unlockPassphrase, setUnlockPassphrase] = useState('');
  const [recoveryInput, setRecoveryInput] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Sync mode if isVaultConfigured updates
  React.useEffect(() => {
    if (!isVaultConfigured) {
      setMode('setup-step1');
    } else {
      setMode('unlock');
    }
  }, [isVaultConfigured]);

  if (!user || (!isLocked && isVaultConfigured)) {
    return null;
  }

  const handleProceedToStep2 = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (passphrase.length < 8) {
      setErrorMessage('Master passphrase must be at least 8 characters long.');
      return;
    }
    if (passphrase !== confirmPassphrase) {
      setErrorMessage('Passphrases do not match.');
      return;
    }

    setIsLoading(true);
    try {
      const { recoveryCode: code } = await initializeVault(passphrase, autoLockMinutes);
      setRecoveryCode(code);
      setMode('setup-step2');
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to initialize vault');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCompleteSetup = () => {
    if (!hasConfirmedSaved) {
      setErrorMessage('Please confirm that you have securely saved your recovery code.');
      return;
    }
  };

  const handleUnlock = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    if (!unlockPassphrase) {
      setErrorMessage('Please enter your master passphrase.');
      return;
    }

    setIsLoading(true);
    try {
      const result = await unlockVault(unlockPassphrase);
      if (!result.success) {
        setErrorMessage(result.error || 'Incorrect passphrase.');
      } else {
        setUnlockPassphrase('');
      }
    } catch {
      setErrorMessage('Decryption failed.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRecoveryUnlock = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    if (!recoveryInput) {
      setErrorMessage('Please enter your recovery code.');
      return;
    }

    setIsLoading(true);
    try {
      const result = await unlockWithRecovery(recoveryInput);
      if (!result.success) {
        setErrorMessage(result.error || 'Invalid recovery code.');
      } else {
        setRecoveryInput('');
      }
    } catch {
      setErrorMessage('Recovery failed.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyRecoveryCode = () => {
    navigator.clipboard.writeText(recoveryCode);
    setCopiedRecovery(true);
    setTimeout(() => setCopiedRecovery(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-vault-900 border border-white/[0.08] rounded-xl p-6 sm:p-8 shadow-sm relative">

        {mode === 'setup-step1' && (
          <div>
            <div className="flex items-center space-x-3 mb-4">
              <div className="h-10 w-10 rounded-lg bg-brand/10 border border-white/[0.06] flex items-center justify-center text-brand">
                <Shield className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-white">Configure Personal Vault</h2>
                <p className="text-[11px] text-vault-400">Step 1 of 2 — Create master passphrase</p>
              </div>
            </div>

            <div className="p-3 mb-5 rounded-lg bg-vault-950/60 border border-white/[0.06] text-xs text-vault-300 space-y-1">
              <div className="flex items-center space-x-1.5 font-medium text-brand-accent">
                <ShieldAlert className="h-4 w-4" />
                <span>Zero-knowledge architecture</span>
              </div>
              <p>
                Credentials are encrypted in your browser using AES-256-GCM before saving to Supabase. Even Supabase admins cannot read your keys.
              </p>
            </div>

            {errorMessage && (
              <div className="p-3 mb-4 rounded-lg bg-rose-950/30 border border-rose-500/20 text-xs text-rose-300 flex items-center space-x-2">
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleProceedToStep2} className="space-y-4">
              <div>
                <label className="block text-[11px] font-medium text-vault-300 mb-1.5">
                  Master passphrase (min. 8 characters)
                </label>
                <div className="relative">
                  <input
                    type={showPassphrase ? 'text' : 'password'}
                    value={passphrase}
                    onChange={(e) => setPassphrase(e.target.value)}
                    placeholder="Enter a strong master passphrase..."
                    required
                    className="w-full px-3.5 py-2.5 bg-vault-950 border border-white/[0.08] rounded-lg text-[13px] text-white placeholder-vault-500 focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassphrase(!showPassphrase)}
                    className="absolute right-3 top-2.5 text-vault-400 hover:text-white transition-colors"
                  >
                    {showPassphrase ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-vault-300 mb-1.5">
                  Confirm master passphrase
                </label>
                <input
                  type={showPassphrase ? 'text' : 'password'}
                  value={confirmPassphrase}
                  onChange={(e) => setConfirmPassphrase(e.target.value)}
                  placeholder="Re-enter master passphrase..."
                  required
                  className="w-full px-3.5 py-2.5 bg-vault-950 border border-white/[0.08] rounded-lg text-[13px] text-white placeholder-vault-500 focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand transition-colors"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-vault-300 mb-1.5">
                  Inactivity auto-lock
                </label>
                <select
                  value={autoLockMinutes}
                  onChange={(e) => setAutoLockMinutes(Number(e.target.value))}
                  className="w-full px-3.5 py-2 bg-vault-950 border border-white/[0.08] rounded-lg text-xs text-vault-200 focus:outline-none focus:border-brand transition-colors"
                >
                  <option value={5}>5 minutes</option>
                  <option value={15}>15 minutes (Recommended)</option>
                  <option value={30}>30 minutes</option>
                  <option value={60}>1 hour</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 px-4 mt-2 bg-brand hover:bg-brand-hover text-white text-[13px] font-medium rounded-lg transition-colors flex items-center justify-center space-x-2"
              >
                <span>{isLoading ? 'Deriving Master Key (600k iters)...' : 'Continue to Recovery Key'}</span>
              </button>
            </form>
          </div>
        )}

        {mode === 'setup-step2' && (
          <div>
            <div className="flex items-center space-x-3 mb-4">
              <div className="h-10 w-10 rounded-lg bg-amber-500/10 border border-white/[0.06] flex items-center justify-center text-amber-400">
                <KeyRound className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-white">Save Your Recovery Key</h2>
                <p className="text-[11px] text-vault-400">Step 2 of 2 — Emergency recovery code</p>
              </div>
            </div>

            <div className="p-3 mb-4 rounded-lg bg-amber-950/20 border border-amber-500/15 text-xs text-amber-300">
              <p className="font-medium mb-1">Save this code in a safe place</p>
              <p className="text-amber-200/70">
                If you forget your master passphrase, this code is the <strong>only way</strong> to unwrap your vault key and recover your credentials.
              </p>
            </div>

            <div className="p-4 bg-vault-950 border border-white/[0.06] rounded-lg mb-4">
              <span className="text-[11px] font-medium text-vault-400 block mb-1.5">
                Your secret recovery code
              </span>
              <div className="flex items-center justify-between">
                <span className="font-mono text-[13px] text-vault-200 tracking-wide break-all select-all">
                  {recoveryCode}
                </span>
                <button
                  onClick={handleCopyRecoveryCode}
                  className="p-2 ml-2 rounded-lg bg-vault-800 hover:bg-vault-700 text-vault-200 hover:text-white transition-colors flex-shrink-0"
                  title="Copy recovery code"
                >
                  {copiedRecovery ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {errorMessage && (
              <div className="p-3 mb-4 rounded-lg bg-rose-950/30 border border-rose-500/20 text-xs text-rose-300 flex items-center space-x-2">
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <label className="flex items-start space-x-2.5 text-xs text-vault-300 cursor-pointer mb-6">
              <input
                type="checkbox"
                checked={hasConfirmedSaved}
                onChange={(e) => setHasConfirmedSaved(e.target.checked)}
                className="mt-0.5 rounded border-vault-700 bg-vault-950 text-brand focus:ring-brand"
              />
              <span>I have safely recorded and stored this recovery code.</span>
            </label>

            <button
              onClick={handleCompleteSetup}
              disabled={!hasConfirmedSaved}
              className={`w-full py-2.5 px-4 text-[13px] font-medium rounded-lg transition-colors flex items-center justify-center space-x-2 ${
                hasConfirmedSaved
                  ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                  : 'bg-vault-800 text-vault-500 cursor-not-allowed'
              }`}
            >
              <Unlock className="h-4 w-4" />
              <span>Unlock Vault & Enter Dashboard</span>
            </button>
          </div>
        )}

        {mode === 'unlock' && (
          <div>
            <div className="flex items-center space-x-3 mb-6">
              <div className="h-10 w-10 rounded-lg bg-brand/10 border border-white/[0.06] flex items-center justify-center">
                <Lock className="h-5 w-5 text-amber-400" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-white">Vault Locked</h2>
                <p className="text-[11px] text-vault-400">Enter master passphrase to decrypt your keys</p>
              </div>
            </div>

            {errorMessage && (
              <div className="p-3 mb-4 rounded-lg bg-rose-950/30 border border-rose-500/20 text-xs text-rose-300 flex items-center space-x-2">
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleUnlock} className="space-y-4">
              <div>
                <label className="block text-[11px] font-medium text-vault-300 mb-1.5">
                  Master passphrase
                </label>
                <div className="relative">
                  <input
                    type={showPassphrase ? 'text' : 'password'}
                    value={unlockPassphrase}
                    onChange={(e) => setUnlockPassphrase(e.target.value)}
                    placeholder="Enter your master passphrase..."
                    autoFocus
                    required
                    className="w-full px-3.5 py-2.5 bg-vault-950 border border-white/[0.08] rounded-lg text-[13px] text-white placeholder-vault-500 focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassphrase(!showPassphrase)}
                    className="absolute right-3 top-2.5 text-vault-400 hover:text-white transition-colors"
                  >
                    {showPassphrase ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 px-4 bg-brand hover:bg-brand-hover text-white text-[13px] font-medium rounded-lg transition-colors flex items-center justify-center space-x-2"
              >
                <Unlock className="h-4 w-4" />
                <span>{isLoading ? 'Decrypting Vault...' : 'Unlock Vault'}</span>
              </button>
            </form>

            <div className="mt-5 pt-4 border-t border-white/[0.06] flex items-center justify-between text-xs">
              <button
                onClick={() => {
                  setErrorMessage('');
                  setMode('recovery');
                }}
                className="text-vault-400 hover:text-brand transition-colors"
              >
                Forgot passphrase? Use Recovery Code
              </button>
              <button
                onClick={() => {
                  if (confirm('Reset local vault state? (Your cloud records remain until reconfigured)')) {
                    resetVault();
                    setMode('setup-step1');
                  }
                }}
                className="text-vault-500 hover:text-rose-400 transition-colors"
              >
                Reset
              </button>
            </div>
          </div>
        )}

        {mode === 'recovery' && (
          <div>
            <div className="flex items-center space-x-3 mb-4">
              <div className="h-10 w-10 rounded-lg bg-brand/10 border border-white/[0.06] flex items-center justify-center text-brand">
                <KeyRound className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-white">Emergency Key Recovery</h2>
                <p className="text-[11px] text-vault-400">Restore access using your recovery code</p>
              </div>
            </div>

            <p className="text-xs text-vault-300 mb-4">
              Enter your recovery code (format: <code className="text-vault-200 font-mono">SYN-XXXX-XXXX...</code>) to unwrap your encryption key.
            </p>

            {errorMessage && (
              <div className="p-3 mb-4 rounded-lg bg-rose-950/30 border border-rose-500/20 text-xs text-rose-300 flex items-center space-x-2">
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleRecoveryUnlock} className="space-y-4">
              <div>
                <label className="block text-[11px] font-medium text-vault-300 mb-1.5">
                  Recovery code
                </label>
                <input
                  type="text"
                  value={recoveryInput}
                  onChange={(e) => setRecoveryInput(e.target.value.toUpperCase())}
                  placeholder="SYN-XXXX-XXXX-XXXX-XXXX-XXXX-XXXX"
                  autoFocus
                  required
                  className="w-full px-3.5 py-2.5 bg-vault-950 border border-white/[0.08] rounded-lg text-[13px] font-mono text-vault-200 placeholder-vault-500 focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand transition-colors"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 px-4 bg-brand hover:bg-brand-hover text-white text-[13px] font-medium rounded-lg transition-colors flex items-center justify-center space-x-2"
              >
                <Unlock className="h-4 w-4" />
                <span>{isLoading ? 'Unwrapping Master Key...' : 'Restore Vault Access'}</span>
              </button>
            </form>

            <div className="mt-5 pt-4 border-t border-white/[0.06] text-center">
              <button
                onClick={() => {
                  setErrorMessage('');
                  setMode('unlock');
                }}
                className="text-xs text-vault-400 hover:text-white transition-colors"
              >
                Back to Passphrase Login
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
