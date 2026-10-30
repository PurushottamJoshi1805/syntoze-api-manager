'use client';

import React, { useState } from 'react';
import { useVault } from '@/lib/context/vaultContext';
import {
  X,
  KeyRound,
  Download,
  AlertTriangle,
  ShieldCheck,
  Check,
  Copy,
} from 'lucide-react';

interface VaultRecoveryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const VaultRecoveryModal: React.FC<VaultRecoveryModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { vaultSettings, credentials, projects, resetVault } = useVault();
  const [copiedSalt, setCopiedSalt] = useState(false);

  if (!isOpen) return null;

  const handleExportEncryptedJson = () => {
    const payload = {
      exportedAt: new Date().toISOString(),
      vaultSettings: vaultSettings
        ? {
            vaultSalt: vaultSettings.vaultSalt,
            keyCheckCiphertext: vaultSettings.keyCheckCiphertext,
            keyCheckIv: vaultSettings.keyCheckIv,
            recoverySalt: vaultSettings.recoverySalt,
            recoveryEncryptedKey: vaultSettings.recoveryEncryptedKey,
            autoLockMinutes: vaultSettings.autoLockMinutes,
          }
        : null,
      projects,
      credentials: credentials.map((c) => ({
        id: c.id,
        projectId: c.projectId,
        provider: c.provider,
        name: c.name,
        environment: c.environment,
        encryptedCiphertext: c.encryptedCiphertext,
        iv: c.iv,
        notes: c.notes,
        createdAt: c.createdAt,
      })),
    };

    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `syntoze-vault-ciphertext-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-lg bg-vault-900 border border-white/[0.08] rounded-xl shadow-sm p-6 relative max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-4 border-b border-white/[0.06]">
          <div className="flex items-center space-x-2.5">
            <div className="h-9 w-9 rounded-lg bg-brand/10 border border-white/[0.06] flex items-center justify-center text-brand">
              <KeyRound className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">Vault Security & Recovery</h2>
              <p className="text-[11px] text-vault-400">Zero-knowledge backup and architecture</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-vault-400 hover:text-white hover:bg-vault-800 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-4 p-3.5 rounded-lg bg-vault-950 border border-white/[0.06] text-xs text-vault-300 space-y-2">
          <div className="flex items-center space-x-1.5 font-medium text-brand">
            <ShieldCheck className="h-4 w-4" />
            <span>Zero-knowledge recovery architecture</span>
          </div>
          <p>
            Your account authentication (Google / GitHub / Supabase Email) controls database access via Row Level Security (RLS).
          </p>
          <p>
            Separately, your vault encryption key is derived using <strong>600,000 rounds of PBKDF2</strong>. Supabase stores only ciphertext, salts, and your wrapped master key. No admin can read your secrets.
          </p>
        </div>

        <div className="mt-5 space-y-3">
          <h3 className="text-[11px] font-medium text-vault-400">
            Encrypted backup (zero-knowledge)
          </h3>

          <div className="p-4 bg-vault-950 border border-white/[0.06] rounded-lg space-y-3">
            <p className="text-xs text-vault-300">
              Download a JSON file containing all your encrypted credentials, salts, and wrapped keys directly from Supabase. All secrets in this file remain AES-256-GCM encrypted.
            </p>
            <button
              onClick={handleExportEncryptedJson}
              className="w-full py-2.5 px-4 bg-brand hover:bg-brand-hover text-white text-xs font-medium rounded-lg transition-colors flex items-center justify-center space-x-2"
            >
              <Download className="h-4 w-4" />
              <span>Download Encrypted Backup (.json)</span>
            </button>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-white/[0.06] space-y-2">
          <h3 className="text-[11px] font-medium text-rose-400 flex items-center space-x-1">
            <AlertTriangle className="h-3.5 w-3.5" />
            <span>Danger zone</span>
          </h3>
          <p className="text-[11px] text-vault-400">
            Resetting your vault locks your session and clears local decryption state.
          </p>
          <button
            onClick={() => {
              if (confirm('Lock and clear local session state?')) {
                resetVault();
                onClose();
              }
            }}
            className="px-3 py-1.5 text-xs font-medium text-rose-400 hover:bg-rose-950/30 rounded-lg border border-rose-500/20 transition-colors"
          >
            Clear Local Session State
          </button>
        </div>
      </div>
    </div>
  );
};
