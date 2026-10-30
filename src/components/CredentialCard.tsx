'use client';

import React, { useState, useEffect } from 'react';
import { DecryptedCredential, Project } from '@/lib/types/vault';
import { useVault } from '@/lib/context/vaultContext';
import {
  PROVIDER_METADATA,
  ENVIRONMENT_METADATA,
  maskSecret,
} from '@/lib/utils';
import { getCredentialSecurityStatus } from '@/lib/securityAudit';
import {
  Eye,
  EyeOff,
  Copy,
  Check,
  MoreVertical,
  Edit2,
  Trash2,
  Clock,
  Layers,
  RefreshCw,
  AlertTriangle,
  ShieldAlert,
} from 'lucide-react';

interface CredentialCardProps {
  credential: DecryptedCredential;
  project?: Project;
  onEdit: (cred: DecryptedCredential) => void;
  onRotate?: (cred: DecryptedCredential) => void;
}

export const CredentialCard: React.FC<CredentialCardProps> = ({
  credential,
  project,
  onEdit,
  onRotate,
}) => {
  const { toggleRevealSecret, deleteCredential, credentials, copyToClipboardSecure } = useVault();
  const [copied, setCopied] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);

  const providerMeta = PROVIDER_METADATA[credential.provider] || PROVIDER_METADATA.custom;
  const envMeta = ENVIRONMENT_METADATA[credential.environment];

  // Calculate real-time security health for this credential
  const security = getCredentialSecurityStatus(credential, credentials);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (credential.isRevealed) {
      setCountdown(15);
      timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev === null || prev <= 1) {
            clearInterval(timer);
            toggleRevealSecret(credential.id);
            return null;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      setCountdown(null);
    }
    return () => clearInterval(timer);
  }, [credential.isRevealed, credential.id, toggleRevealSecret]);

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!credential.plaintextSecret) return;
    await copyToClipboardSecure(credential.plaintextSecret, credential.name);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDelete = async () => {
    if (confirm(`Delete "${credential.name}"? This permanently removes the encrypted ciphertext from Supabase.`)) {
      await deleteCredential(credential.id);
    }
  };

  return (
    <div
      className={`group relative bg-[#0D0E14] border rounded-xl p-4 transition-all duration-150 shadow-sm ${
        security.severity === 'critical'
          ? 'border-rose-500/30 hover:border-rose-500/50'
          : security.severity === 'warning'
          ? 'border-amber-500/30 hover:border-amber-500/50'
          : 'border-white/[0.08] hover:border-white/[0.16]'
      }`}
    >
      {/* Top Bar: Provider, Environment, Security Badge, and Menu */}
      <div className="flex items-center justify-between gap-2 mb-2.5">
        <div className="flex flex-wrap items-center gap-1.5">
          {/* Provider badge */}
          <span
            className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium ${providerMeta.badgeBg} border ${providerMeta.border}`}
          >
            <span>{providerMeta.name}</span>
          </span>

          {/* Environment badge */}
          <span className={`px-2 py-0.5 rounded-md text-[10px] font-mono font-medium lowercase tracking-wide ${envMeta.badge}`}>
            {envMeta.label}
          </span>

          {/* Project tag */}
          {project && (
            <span
              className="inline-flex items-center space-x-1 text-[11px] text-zinc-400 px-2 py-0.5 rounded-md bg-zinc-900/60 border border-white/[0.06]"
              style={{ borderLeftColor: project.color || '#6366f1', borderLeftWidth: '2px' }}
            >
              <Layers className="h-3 w-3 text-zinc-500" />
              <span>{project.name}</span>
            </span>
          )}
        </div>

        {/* Action Menu */}
        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-1 rounded-md text-zinc-500 hover:text-zinc-200 hover:bg-white/[0.05] transition-colors"
          >
            <MoreVertical className="h-3.5 w-3.5" />
          </button>

          {showMenu && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)} />
              <div className="absolute right-0 top-6 z-20 w-36 rounded-lg bg-[#0F1017] border border-white/[0.1] shadow-xl py-1 text-xs">
                {onRotate && (
                  <button
                    onClick={() => {
                      setShowMenu(false);
                      onRotate(credential);
                    }}
                    className="w-full px-3 py-1.5 text-left text-amber-300 hover:bg-white/[0.06] flex items-center space-x-2 transition-colors"
                  >
                    <RefreshCw className="h-3.5 w-3.5 text-amber-400" />
                    <span>Rotate Key</span>
                  </button>
                )}
                <button
                  onClick={() => {
                    setShowMenu(false);
                    onEdit(credential);
                  }}
                  className="w-full px-3 py-1.5 text-left text-zinc-200 hover:bg-white/[0.06] flex items-center space-x-2 transition-colors"
                >
                  <Edit2 className="h-3.5 w-3.5 text-zinc-400" />
                  <span>Edit Details</span>
                </button>
                <button
                  onClick={() => {
                    setShowMenu(false);
                    handleDelete();
                  }}
                  className="w-full px-3 py-1.5 text-left text-rose-400 hover:bg-rose-500/10 flex items-center space-x-2 transition-colors"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  <span>Delete</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Title & Security Health Tag */}
      <div className="mb-2.5 flex items-center justify-between gap-2">
        <h3 className="font-medium text-white text-[13px] tracking-tight truncate">
          {credential.name}
        </h3>

        {/* Security Health Indicator */}
        {security.severity === 'critical' ? (
          <span
            title={security.warningNotice}
            className="flex-shrink-0 inline-flex items-center space-x-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-rose-500/10 text-rose-400 border border-rose-500/20"
          >
            <ShieldAlert className="h-3 w-3" />
            <span>{security.isReusedInOtherEnv ? 'Shared' : 'Critical'}</span>
          </span>
        ) : security.severity === 'warning' ? (
          <span
            title={security.warningNotice}
            className="flex-shrink-0 inline-flex items-center space-x-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20"
          >
            <AlertTriangle className="h-3 w-3" />
            <span>&gt;90d</span>
          </span>
        ) : null}
      </div>

      {/* Secret Display Box */}
      <div className="p-2 bg-[#08090C] rounded-lg border border-white/[0.06] flex items-center justify-between gap-2 font-mono text-xs mb-2.5">
        <div className="truncate flex-1 pl-1">
          {credential.isRevealed ? (
            <span className="text-cyan-300 select-all font-medium tracking-wide">
              {credential.plaintextSecret || '[Encrypted]'}
            </span>
          ) : (
            <span className="text-zinc-500 select-none tracking-wider text-[11px]">
              {maskSecret(credential.plaintextSecret)}
            </span>
          )}
        </div>

        <div className="flex items-center space-x-1 flex-shrink-0">
          {countdown !== null && (
            <span className="text-[10px] font-mono text-amber-400 bg-amber-950/60 px-1.5 py-0.5 rounded border border-amber-500/30">
              {countdown}s
            </span>
          )}

          <button
            onClick={() => toggleRevealSecret(credential.id)}
            className="p-1 rounded text-zinc-400 hover:text-white hover:bg-white/[0.06] transition-colors"
            title={credential.isRevealed ? 'Hide secret' : 'Reveal secret'}
          >
            {credential.isRevealed ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
          </button>

          <button
            onClick={handleCopy}
            className={`p-1 rounded transition-colors flex items-center space-x-1 ${
              copied
                ? 'bg-emerald-500/20 text-emerald-400'
                : 'text-zinc-400 hover:text-white hover:bg-white/[0.06]'
            }`}
            title="Copy secret"
          >
            {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
          </button>
        </div>
      </div>

      {/* Warnings & Notices */}
      {security.warningNotice && (
        <div className="mb-2 px-2 py-1 rounded bg-zinc-900/40 border border-white/[0.05] flex items-center justify-between text-[11px]">
          <span className={security.severity === 'critical' ? 'text-rose-400' : 'text-amber-400'}>
            {security.warningNotice}
          </span>
          {onRotate && (
            <button
              onClick={() => onRotate(credential)}
              className="text-indigo-400 hover:text-indigo-300 font-medium flex items-center space-x-1 ml-2 flex-shrink-0"
            >
              <RefreshCw className="h-2.5 w-2.5" />
              <span>Rotate</span>
            </button>
          )}
        </div>
      )}

      {/* Notes if available */}
      {credential.notes && (
        <p className="text-[11px] text-zinc-400 line-clamp-1 mb-2">
          {credential.notes}
        </p>
      )}

      {/* Footer bar: Age & Rotation status */}
      <div className="flex items-center justify-between text-[11px] text-zinc-500 pt-2 border-t border-white/[0.05]">
        <span className="flex items-center space-x-1">
          <Clock className="h-3 w-3 text-zinc-600" />
          <span>{security.label}</span>
        </span>

        {onRotate && (
          <button
            onClick={() => onRotate(credential)}
            className="text-[11px] text-zinc-400 hover:text-zinc-200 flex items-center space-x-1 transition-colors"
          >
            <RefreshCw className="h-3 w-3 text-zinc-500" />
            <span>Rotate</span>
          </button>
        )}
      </div>
    </div>
  );
};
