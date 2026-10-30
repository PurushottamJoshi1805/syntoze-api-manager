'use client';

import React, { useState } from 'react';
import { useVault } from '@/lib/context/vaultContext';
import { DecryptedCredential } from '@/lib/types/vault';
import { PROVIDER_METADATA } from '@/lib/utils';
import {
  X,
  RefreshCw,
  Eye,
  EyeOff,
  AlertTriangle,
  ExternalLink,
} from 'lucide-react';
import { toast } from 'sonner';

interface RotateKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  credential: DecryptedCredential | null;
}

export const RotateKeyModal: React.FC<RotateKeyModalProps> = ({
  isOpen,
  onClose,
  credential,
}) => {
  const { updateCredential } = useVault();
  const [newSecret, setNewSecret] = useState('');
  const [showSecret, setShowSecret] = useState(false);
  const [confirmedActive, setConfirmedActive] = useState(false);
  const [isRotating, setIsRotating] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen || !credential) return null;

  const providerMeta = PROVIDER_METADATA[credential.provider] || PROVIDER_METADATA.custom;
  const daysOld = Math.max(
    0,
    Math.floor((Date.now() - new Date(credential.updatedAt || credential.createdAt).getTime()) / (1000 * 60 * 60 * 24))
  );

  const handleRotate = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!newSecret.trim()) {
      setErrorMsg('Please enter the replacement secret key.');
      return;
    }

    if (newSecret.trim() === credential.plaintextSecret?.trim()) {
      setErrorMsg('The new key is identical to the current key. Please provide a freshly generated token.');
      return;
    }

    setIsRotating(true);
    try {
      await updateCredential(credential.id, {
        secret: newSecret.trim(),
        notes: credential.notes ? `${credential.notes} (Rotated on ${new Date().toISOString().split('T')[0]})` : `Rotated on ${new Date().toISOString().split('T')[0]}`,
      });

      toast.success(`"${credential.name}" rotated successfully! Key age reset.`);
      setNewSecret('');
      setConfirmedActive(false);
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to rotate key.');
    } finally {
      setIsRotating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-lg bg-[#0D0E14] border border-white/[0.09] rounded-xl shadow-2xl p-6 relative">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/[0.06]">
          <div className="flex items-center space-x-2.5">
            <div className="h-8 w-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <RefreshCw className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-white tracking-tight">Rotate credential</h2>
              <p className="text-xs text-zinc-400">Replace current key with a newly generated token</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-white/[0.05] transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Credential summary card */}
        <div className="my-4 p-3 rounded-lg bg-zinc-950/60 border border-white/[0.06] flex items-center justify-between">
          <div>
            <span className="text-[11px] text-zinc-500 block mb-0.5">
              Target credential
            </span>
            <p className="text-xs font-medium text-white">{credential.name}</p>
            <span className="text-[11px] text-zinc-400">
              Environment: <span className="text-zinc-200 lowercase font-medium">{credential.environment}</span>
            </span>
          </div>

          <div className="text-right">
            <span className={`inline-block px-2 py-0.5 rounded text-[11px] font-medium ${
              daysOld >= 90 ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 'bg-white/[0.05] text-zinc-300'
            }`}>
              {daysOld} days old
            </span>
            {providerMeta.docsUrl && (
              <a
                href={providerMeta.docsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-1 text-[11px] text-indigo-400 hover:text-indigo-300 flex items-center justify-end space-x-0.5 transition-colors"
              >
                <span>Provider console</span>
                <ExternalLink className="h-2.5 w-2.5" />
              </a>
            )}
          </div>
        </div>

        {errorMsg && (
          <div className="mb-4 p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-xs text-rose-300 flex items-center space-x-2">
            <AlertTriangle className="h-4 w-4 flex-shrink-0 text-rose-400" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleRotate} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1.5">
              New replacement secret value
            </label>
            <div className="relative">
              <input
                type={showSecret ? 'text' : 'password'}
                required
                value={newSecret}
                onChange={(e) => setNewSecret(e.target.value)}
                placeholder={providerMeta.placeholder || 'Paste newly generated key…'}
                className="w-full px-3 py-2 bg-zinc-950 border border-white/[0.08] rounded-lg text-xs font-mono text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-indigo-500/60 transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowSecret(!showSecret)}
                className="absolute right-2.5 top-2.5 text-zinc-400 hover:text-white"
              >
                {showSecret ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
              </button>
            </div>
            <p className="text-[11px] text-zinc-500 mt-1">
              Encrypted in-browser with AES-256-GCM. The old secret will be overwritten.
            </p>
          </div>

          <label className="flex items-start space-x-2 text-xs text-zinc-300 cursor-pointer pt-1">
            <input
              type="checkbox"
              checked={confirmedActive}
              onChange={(e) => setConfirmedActive(e.target.checked)}
              className="mt-0.5 rounded border-zinc-700 bg-zinc-900 text-indigo-600 focus:ring-indigo-500"
            />
            <span>I have verified this replacement token is active.</span>
          </label>

          <div className="flex items-center justify-end space-x-2 pt-3 border-t border-white/[0.06]">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 text-xs font-medium text-zinc-400 hover:text-white rounded-lg hover:bg-white/[0.05] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isRotating || !confirmedActive}
              className={`px-4 py-1.5 text-xs font-medium rounded-lg transition-colors flex items-center space-x-1.5 ${
                confirmedActive && !isRotating
                  ? 'bg-amber-600 hover:bg-amber-500 text-white'
                  : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
              }`}
            >
              <RefreshCw className={`h-3 w-3 ${isRotating ? 'animate-spin' : ''}`} />
              <span>{isRotating ? 'Rotating…' : 'Complete rotation'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
