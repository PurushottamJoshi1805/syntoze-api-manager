'use client';

import React, { useState, useEffect } from 'react';
import { useVault } from '@/lib/context/vaultContext';
import { Navbar } from '@/components/Navbar';
import { MasterLockModal } from '@/components/MasterLockModal';
import { StatsBar } from '@/components/StatsBar';
import { SecurityHealthBanner } from '@/components/SecurityHealthBanner';
import { RotateKeyModal } from '@/components/RotateKeyModal';
import { ProjectFilter } from '@/components/ProjectFilter';
import { CredentialCard } from '@/components/CredentialCard';
import { CredentialFormModal } from '@/components/CredentialFormModal';
import { EnvExportModal } from '@/components/EnvExportModal';
import { EnvImportModal } from '@/components/EnvImportModal';
import { VaultRecoveryModal } from '@/components/VaultRecoveryModal';
import { PricingModal } from '@/components/PricingModal';
import { SettingsModal } from '@/components/SettingsModal';
import { DecryptedCredential } from '@/lib/types/vault';
import { toast } from 'sonner';
import {
  Key,
  Plus,
  Shield,
  Search,
  FileCode2,
  Upload,
  Cpu,
  Brain,
  CreditCard,
  Cloud,
} from 'lucide-react';

export default function HomePage() {
  const {
    isReady,
    isVaultConfigured,
    isLocked,
    credentials,
    projects,
    activeProjectId,
    activeEnvironment,
    activeProvider,
    searchQuery,
    user,
    isPro,
    isPricingOpen,
    openPricingModal,
    closePricingModal,
    refreshSubscription,
    openSettings,
  } = useVault();

  const [isCredentialModalOpen, setIsCredentialModalOpen] = useState(false);
  const [editingCredential, setEditingCredential] = useState<DecryptedCredential | null>(null);
  const [rotatingCredential, setRotatingCredential] = useState<DecryptedCredential | null>(null);
  const [isRotateModalOpen, setIsRotateModalOpen] = useState(false);
  const [isEnvExportOpen, setIsEnvExportOpen] = useState(false);
  const [isEnvImportOpen, setIsEnvImportOpen] = useState(false);
  const [isRecoveryOpen, setIsRecoveryOpen] = useState(false);

  // Check Cashfree Payment Return Status
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('upgraded') === 'true') {
        toast.success(
          '🎉 Welcome to Syntoze Pro! Unlimited keys and advanced security alerts are now active.',
          { duration: 6000 }
        );
        refreshSubscription();
        window.history.replaceState({}, '', window.location.pathname);
      } else if (params.get('payment') === 'unpaid') {
        toast.error('Payment was not completed. Please try again when ready.');
        window.history.replaceState({}, '', window.location.pathname);
      } else if (params.get('payment') === 'config_error') {
        toast.error('Payment configuration error. Please verify Cashfree API keys.');
        window.history.replaceState({}, '', window.location.pathname);
      }
    }
  }, [refreshSubscription]);

  // Global keyboard shortcuts: "N" opens Add Key, "⌘," opens Settings
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeTag = document.activeElement?.tagName.toLowerCase();
      const isInput = activeTag === 'input' || activeTag === 'textarea' || activeTag === 'select';

      // Cmd/Ctrl + , opens Settings
      if ((e.metaKey || e.ctrlKey) && e.key === ',') {
        e.preventDefault();
        openSettings();
        return;
      }

      // "N" opens Add Key
      if (e.key.toLowerCase() === 'n' && !isInput && !e.metaKey && !e.ctrlKey) {
        if (!isLocked && isVaultConfigured && !isCredentialModalOpen) {
          e.preventDefault();
          handleOpenAddModal();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isLocked, isVaultConfigured, isCredentialModalOpen, openSettings]);

  if (!isReady) {
    return (
      <div
        style={{
          backgroundColor: '#08090C',
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#F1F5F9',
        }}
        className="min-h-screen flex items-center justify-center bg-[#08090C] text-zinc-100"
      >
        <div className="flex flex-col items-center space-y-3">
          <div className="h-7 w-7 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-zinc-400 font-mono">Loading vault session…</p>
        </div>
      </div>
    );
  }

  const filteredCredentials = credentials.filter((cred) => {
    if (activeProjectId !== 'all' && cred.projectId !== activeProjectId) {
      return false;
    }
    if (activeEnvironment !== 'all' && cred.environment !== activeEnvironment) {
      return false;
    }
    if (activeProvider !== 'all' && cred.provider !== activeProvider) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = cred.name.toLowerCase().includes(q);
      const matchProvider = cred.provider.toLowerCase().includes(q);
      const matchNotes = cred.notes ? cred.notes.toLowerCase().includes(q) : false;
      const projectName = projects.find((p) => p.id === cred.projectId)?.name.toLowerCase() || '';
      const matchProject = projectName.includes(q);

      if (!matchName && !matchProvider && !matchNotes && !matchProject) {
        return false;
      }
    }
    return true;
  });

  const handleOpenAddModal = () => {
    if (!isPro && credentials.length >= 15) {
      openPricingModal();
      toast.error('Free tier limit reached (15/15 keys). Upgrade to Pro for unlimited storage.');
      return;
    }
    setEditingCredential(null);
    setIsCredentialModalOpen(true);
  };

  const handleEditCredential = (cred: DecryptedCredential) => {
    setEditingCredential(cred);
    setIsCredentialModalOpen(true);
  };

  const handleRotateCredential = (cred: DecryptedCredential) => {
    setRotatingCredential(cred);
    setIsRotateModalOpen(true);
  };

  const handleRotateFromAudit = (credentialId: string) => {
    const cred = credentials.find((c) => c.id === credentialId);
    if (cred) {
      setRotatingCredential(cred);
      setIsRotateModalOpen(true);
    }
  };

  const displayName = user?.fullName || user?.email?.split('@')[0] || 'Developer';

  return (
    <div className="min-h-screen flex flex-col bg-[#08090C] text-zinc-100 font-sans selection:bg-indigo-500/25 selection:text-white">
      <Navbar
        onOpenNewModal={handleOpenAddModal}
        onOpenEnvExport={() => setIsEnvExportOpen(true)}
        onOpenEnvImport={() => setIsEnvImportOpen(true)}
        onOpenRecovery={() => setIsRecoveryOpen(true)}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-7 space-y-6">
        {/* Header toolbar */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-5 border-b border-white/[0.06]">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-white">
                API credentials
              </h1>
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                <Shield className="h-3 w-3" />
                <span>Zero-Knowledge AES-256</span>
              </span>
            </div>
            <p className="text-xs sm:text-[13px] text-zinc-400">
              Personal vault for <span className="text-zinc-200 font-medium">{displayName}</span> · Decrypted in browser memory
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsEnvImportOpen(true)}
              disabled={isLocked || !isVaultConfigured}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                isLocked || !isVaultConfigured
                  ? 'bg-zinc-900 text-zinc-600 cursor-not-allowed'
                  : 'bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-white/[0.08]'
              }`}
            >
              <Upload className="h-3.5 w-3.5 text-cyan-400" />
              <span>Import .env</span>
            </button>

            <button
              onClick={() => setIsEnvExportOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-white/[0.08] transition-colors"
            >
              <FileCode2 className="h-3.5 w-3.5 text-indigo-400" />
              <span>Export .env</span>
            </button>

            <button
              onClick={handleOpenAddModal}
              disabled={isLocked || !isVaultConfigured}
              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium rounded-lg transition-colors shadow-sm ${
                isLocked || !isVaultConfigured
                  ? 'bg-zinc-900 text-zinc-600 cursor-not-allowed'
                  : 'bg-white hover:bg-zinc-200 text-zinc-950 font-semibold'
              }`}
            >
              <Plus className="h-3.5 w-3.5 text-zinc-950" />
              <span>Add key</span>
              <kbd className="hidden sm:inline-block ml-1 px-1 text-[10px] font-mono bg-zinc-200 rounded text-zinc-700">N</kbd>
            </button>
          </div>
        </div>

        {/* Global Vault Stats Bar */}
        <StatsBar />

        {/* Real-Time Security Health Banner & Audit Report */}
        <SecurityHealthBanner onRotateKey={handleRotateFromAudit} />

        {/* Project, Environment & Provider Filter Bar */}
        <ProjectFilter />

        {/* Content: Empty State vs Cards Grid vs Filter Zero State */}
        {credentials.length === 0 ? (
          <div className="rounded-xl border border-white/[0.07] bg-[#0D0E14] p-8 sm:p-12 text-center relative overflow-hidden shadow-sm">
            <div className="max-w-md mx-auto space-y-4 relative z-10">
              <div className="h-10 w-10 rounded-xl bg-zinc-900 border border-white/[0.08] flex items-center justify-center text-zinc-300 mx-auto shadow-sm">
                <Key className="h-5 w-5" />
              </div>

              <div className="space-y-1">
                <h2 className="text-base font-semibold tracking-tight text-white">
                  Add your first API credential
                </h2>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Your vault is ready. Keys are encrypted with AES-256-GCM before saving. No plaintext ever leaves your browser.
                </p>
              </div>

              {/* Quick Preset Buttons */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                {[
                  { name: 'OpenAI', icon: Cpu, provider: 'openai' },
                  { name: 'Anthropic', icon: Brain, provider: 'anthropic' },
                  { name: 'Stripe', icon: CreditCard, provider: 'stripe' },
                  { name: 'AWS Cloud', icon: Cloud, provider: 'aws' },
                ].map((item) => (
                  <button
                    key={item.name}
                    onClick={handleOpenAddModal}
                    className="flex flex-col items-start gap-1 p-2.5 rounded-lg bg-zinc-900/60 hover:bg-zinc-800/80 border border-white/[0.06] hover:border-white/[0.12] text-left transition-colors group"
                  >
                    <item.icon className="h-3.5 w-3.5 text-zinc-400 group-hover:text-white transition-colors" />
                    <p className="text-xs font-medium text-zinc-300 group-hover:text-white transition-colors">
                      {item.name}
                    </p>
                  </button>
                ))}
              </div>

              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-2">
                <button
                  onClick={() => setIsEnvImportOpen(true)}
                  disabled={isLocked || !isVaultConfigured}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg text-xs font-medium bg-white text-zinc-950 hover:bg-zinc-200 transition-colors shadow-sm"
                >
                  <Upload className="h-3.5 w-3.5 text-zinc-950" />
                  <span>Import from .env</span>
                </button>

                <button
                  onClick={handleOpenAddModal}
                  disabled={isLocked || !isVaultConfigured}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg text-xs font-medium bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-white/[0.08] transition-colors"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Add manually</span>
                </button>
              </div>
            </div>
          </div>
        ) : filteredCredentials.length > 0 ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs text-zinc-400">
              <span className="font-medium text-zinc-300">
                {filteredCredentials.length} {filteredCredentials.length === 1 ? 'credential' : 'credentials'}
                {credentials.length !== filteredCredentials.length && (
                  <span className="text-zinc-500 font-normal"> (filtered from {credentials.length})</span>
                )}
              </span>
              <span className="flex items-center gap-1.5 text-emerald-400 text-[11px] font-medium">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                <span>Encrypted & synced</span>
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {filteredCredentials.map((cred) => {
                const project = projects.find((p) => p.id === cred.projectId);
                return (
                  <CredentialCard
                    key={cred.id}
                    credential={cred}
                    project={project}
                    onEdit={handleEditCredential}
                    onRotate={handleRotateCredential}
                  />
                );
              })}
            </div>
          </div>
        ) : (
          <div className="py-14 text-center space-y-2 bg-[#0D0E14] border border-white/[0.06] rounded-xl">
            <div className="h-9 w-9 rounded-lg bg-zinc-900 mx-auto flex items-center justify-center text-zinc-500">
              <Search className="h-4 w-4" />
            </div>
            <h3 className="text-xs font-medium text-white">No matching credentials found</h3>
            <p className="text-xs text-zinc-400 max-w-xs mx-auto">
              No credentials match your active filters or search terms. Try clearing your filters.
            </p>
          </div>
        )}
      </main>

      {/* Global Modals */}
      <MasterLockModal />
      <CredentialFormModal
        isOpen={isCredentialModalOpen}
        onClose={() => setIsCredentialModalOpen(false)}
        editingCredential={editingCredential}
      />
      <RotateKeyModal
        isOpen={isRotateModalOpen}
        onClose={() => {
          setIsRotateModalOpen(false);
          setRotatingCredential(null);
        }}
        credential={rotatingCredential}
      />
      <EnvExportModal
        isOpen={isEnvExportOpen}
        onClose={() => setIsEnvExportOpen(false)}
      />
      <EnvImportModal
        isOpen={isEnvImportOpen}
        onClose={() => setIsEnvImportOpen(false)}
      />
      <VaultRecoveryModal
        isOpen={isRecoveryOpen}
        onClose={() => setIsRecoveryOpen(false)}
      />
      <PricingModal
        isOpen={isPricingOpen}
        onClose={closePricingModal}
      />
      <SettingsModal />
    </div>
  );
}
