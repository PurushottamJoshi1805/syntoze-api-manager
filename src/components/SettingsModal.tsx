'use client';

import React, { useState } from 'react';
import { useVault } from '@/lib/context/vaultContext';
import {
  X,
  Shield,
  Clock,
  Key,
  FolderKanban,
  CreditCard,
  Download,
  AlertTriangle,
  Check,
  Copy,
  Trash2,
  Lock,
  Plus,
  Edit2,
  Sparkles,
  RefreshCw,
  Terminal,
  FileDown,
  ChevronRight,
  Eye,
  EyeOff,
  Zap,
} from 'lucide-react';
import { toast } from 'sonner';

type SettingsTab = 'security' | 'projects' | 'generator' | 'billing' | 'backup';

const PRESET_COLORS = [
  '#6366f1', // Indigo
  '#8b5cf6', // Violet
  '#ec4899', // Pink
  '#f43f5e', // Rose
  '#f97316', // Orange
  '#eab308', // Amber
  '#10b981', // Emerald
  '#06b6d4', // Cyan
  '#3b82f6', // Blue
  '#64748b', // Slate
];

export const SettingsModal: React.FC = () => {
  const {
    isSettingsOpen,
    closeSettings,
    autoLockMinutes,
    updateAutoLockMinutes,
    changeMasterPassphrase,
    regenerateRecoveryKit,
    clipboardClearSeconds,
    setClipboardClearSeconds,
    copyToClipboardSecure,
    projects,
    addProject,
    updateProject,
    deleteProject,
    credentials,
    userSubscription,
    isPro,
    keyLimit,
    openPricingModal,
    exportEncryptedBackup,
    purgeAllCredentials,
    lockVault,
    user,
  } = useVault();

  const [activeTab, setActiveTab] = useState<SettingsTab>('security');

  // Change Passphrase state
  const [currentPass, setCurrentPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [showPasswords, setShowPasswords] = useState(false);
  const [isChangingPass, setIsChangingPass] = useState(false);
  const [newRecoveryResult, setNewRecoveryResult] = useState<string | null>(null);

  // Recovery kit regeneration
  const [isRegeneratingKit, setIsRegeneratingKit] = useState(false);
  const [freshRecoveryKit, setFreshRecoveryKit] = useState<string | null>(null);

  // Projects state
  const [newProjName, setNewProjName] = useState('');
  const [newProjDesc, setNewProjDesc] = useState('');
  const [newProjColor, setNewProjColor] = useState('#6366f1');
  const [isCreatingProj, setIsCreatingProj] = useState(false);
  const [editingProjId, setEditingProjId] = useState<string | null>(null);
  const [editProjName, setEditProjName] = useState('');
  const [editProjDesc, setEditProjDesc] = useState('');
  const [editProjColor, setEditProjColor] = useState('');

  // Key Generator state
  const [genFormat, setGenFormat] = useState<'alphanumeric' | 'hex' | 'base64' | 'uuid'>('alphanumeric');
  const [genLength, setGenLength] = useState<number>(32);
  const [genPrefix, setGenPrefix] = useState<string>('sk_live_');
  const [generatedKey, setGeneratedKey] = useState<string>('');

  // Danger zone state
  const [purgeConfirmation, setPurgeConfirmation] = useState('');
  const [isPurging, setIsPurging] = useState(false);

  // Auto generate on tab open or change
  React.useEffect(() => {
    if (activeTab === 'generator' && !generatedKey) {
      handleGenerateKey();
    }
  }, [activeTab]);

  if (!isSettingsOpen) return null;

  // --- Handlers ---

  const handleUpdateAutoLock = async (mins: number) => {
    const ok = await updateAutoLockMinutes(mins);
    if (ok) {
      toast.success(`Auto-lock timeout updated to ${mins} minutes`);
    } else {
      toast.error('Failed to update auto-lock setting');
    }
  };

  const handleChangePassphrase = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPass || !newPass) {
      toast.error('Please enter both your current and new passphrase.');
      return;
    }
    if (newPass.length < 12) {
      toast.error('New master passphrase must be at least 12 characters.');
      return;
    }
    if (newPass !== confirmPass) {
      toast.error('New passphrase and confirmation do not match.');
      return;
    }

    setIsChangingPass(true);
    try {
      const res = await changeMasterPassphrase(currentPass, newPass);
      if (res.success && res.newRecoveryCode) {
        setNewRecoveryResult(res.newRecoveryCode);
        setCurrentPass('');
        setNewPass('');
        setConfirmPass('');
        toast.success('Master passphrase updated and vault re-encrypted successfully!');
      } else {
        toast.error(res.error || 'Failed to change passphrase.');
      }
    } catch (err: any) {
      toast.error(err?.message || 'Error re-encrypting vault.');
    } finally {
      setIsChangingPass(false);
    }
  };

  const handleRegenerateRecoveryKit = async () => {
    if (!window.confirm('Regenerating your recovery kit will invalidate your previous recovery code. Continue?')) {
      return;
    }
    setIsRegeneratingKit(true);
    try {
      const res = await regenerateRecoveryKit();
      setFreshRecoveryKit(res.recoveryCode);
      toast.success('New emergency recovery code generated.');
    } catch (err: any) {
      toast.error(err?.message || 'Failed to regenerate recovery kit.');
    } finally {
      setIsRegeneratingKit(false);
    }
  };

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjName.trim()) return;
    try {
      await addProject(newProjName.trim(), newProjDesc.trim() || undefined, newProjColor);
      setNewProjName('');
      setNewProjDesc('');
      setIsCreatingProj(false);
      toast.success(`Project "${newProjName.trim()}" created`);
    } catch (err: any) {
      toast.error(err?.message || 'Failed to create project');
    }
  };

  const handleSaveEditProject = async (id: string) => {
    if (!editProjName.trim()) return;
    try {
      await updateProject(id, {
        name: editProjName.trim(),
        description: editProjDesc.trim(),
        color: editProjColor,
      });
      setEditingProjId(null);
      toast.success('Project updated');
    } catch (err: any) {
      toast.error(err?.message || 'Failed to update project');
    }
  };

  const handleDeleteProject = async (id: string, name: string) => {
    const credCount = credentials.filter((c) => c.projectId === id).length;
    if (credCount > 0) {
      toast.error(`Cannot delete project with ${credCount} active credentials. Reassign or delete them first.`);
      return;
    }
    if (!window.confirm(`Delete empty project "${name}"?`)) return;

    try {
      await deleteProject(id);
      toast.success(`Project "${name}" deleted`);
    } catch (err: any) {
      toast.error(err?.message || 'Failed to delete project');
    }
  };

  const handleGenerateKey = () => {
    let key = '';
    const length = genLength;

    if (genFormat === 'uuid') {
      key = crypto.randomUUID();
    } else if (genFormat === 'hex') {
      const bytes = new Uint8Array(Math.ceil(length / 2));
      crypto.getRandomValues(bytes);
      key = Array.from(bytes)
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('')
        .slice(0, length);
    } else if (genFormat === 'base64') {
      const bytes = new Uint8Array(Math.ceil((length * 3) / 4));
      crypto.getRandomValues(bytes);
      key = btoa(String.fromCharCode(...bytes))
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '')
        .slice(0, length);
    } else {
      // Alphanumeric
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
      const bytes = new Uint8Array(length);
      crypto.getRandomValues(bytes);
      key = Array.from(bytes)
        .map((b) => chars[b % chars.length])
        .join('');
    }

    const fullKey = genPrefix ? `${genPrefix}${key}` : key;
    setGeneratedKey(fullKey);
  };

  const handlePurgeAll = async () => {
    if (purgeConfirmation !== 'PURGE') {
      toast.error('Please type PURGE to confirm.');
      return;
    }
    setIsPurging(true);
    try {
      await purgeAllCredentials();
      setPurgeConfirmation('');
      toast.success('All credentials permanently deleted.');
    } catch (err: any) {
      toast.error(err?.message || 'Failed to purge credentials.');
    } finally {
      setIsPurging(false);
    }
  };

  const handleExportAuditReport = () => {
    let csv = 'Name,Provider,Environment,Project,Created At,Status\n';
    credentials.forEach((c) => {
      const proj = projects.find((p) => p.id === c.projectId)?.name || 'Unassigned';
      const ageDays = Math.floor((Date.now() - new Date(c.createdAt).getTime()) / (1000 * 60 * 60 * 24));
      const status = ageDays > 90 ? 'Needs Rotation' : 'Healthy';
      csv += `"${c.name}","${c.provider}","${c.environment}","${proj}","${c.createdAt}","${status}"\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `syntoze-security-audit-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Security audit report exported (CSV)');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-4xl bg-[#0D0E14] border border-white/[0.08] rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row max-h-[85vh]">
        {/* Sidebar Tabs */}
        <div className="w-full md:w-60 bg-[#08090C] border-b md:border-b-0 md:border-r border-white/[0.06] p-4 flex flex-col justify-between shrink-0">
          <div className="space-y-4">
            <div className="px-2 pt-1 pb-2">
              <h2 className="text-sm font-semibold tracking-tight text-white flex items-center gap-2">
                <Shield className="h-4 w-4 text-indigo-400" />
                <span>Vault Settings</span>
              </h2>
              <p className="text-[11px] text-zinc-500 mt-0.5 truncate">{user?.email}</p>
            </div>

            <nav className="space-y-1">
              {[
                { id: 'security', label: 'Security & Auto-Lock', icon: Clock },
                { id: 'projects', label: 'Projects & Scope', icon: FolderKanban },
                { id: 'generator', label: 'API Key Generator', icon: Terminal },
                { id: 'billing', label: 'Plan & Billing', icon: CreditCard },
                { id: 'backup', label: 'Backups & Portability', icon: Download },
              ].map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id as SettingsTab)}
                    className={`w-full flex items-center space-x-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                      isActive
                        ? 'bg-zinc-800 text-white shadow-sm'
                        : 'text-zinc-400 hover:text-white hover:bg-zinc-900/60'
                    }`}
                  >
                    <Icon className={`h-4 w-4 ${isActive ? 'text-indigo-400' : 'text-zinc-500'}`} />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          <div className="pt-4 border-t border-white/[0.06] hidden md:block">
            <div className="px-2 py-1 text-[11px] text-zinc-500 flex items-center justify-between">
              <span>Syntoze Vault v2.0</span>
              <span className="font-mono text-emerald-400 text-[10px]">AES-256</span>
            </div>
          </div>
        </div>

        {/* Content Panel */}
        <div className="flex-1 flex flex-col overflow-hidden bg-[#0D0E14]">
          {/* Header */}
          <div className="px-6 py-4 border-b border-white/[0.06] flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white capitalize">
              {activeTab === 'security' && 'Security & Auto-Lock'}
              {activeTab === 'projects' && 'Projects & Environments'}
              {activeTab === 'generator' && 'Developer API Key Generator'}
              {activeTab === 'billing' && 'Subscription & Quotas'}
              {activeTab === 'backup' && 'Vault Backup & Danger Zone'}
            </h3>
            <button
              onClick={closeSettings}
              className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Scrollable Tab Body */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* TAB: SECURITY & AUTO-LOCK */}
            {activeTab === 'security' && (
              <div className="space-y-6">
                {/* Auto-Lock Setting */}
                <div className="p-4 rounded-xl bg-zinc-950/70 border border-white/[0.06] space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-xs font-semibold text-white">Auto-Lock Inactivity Timer</h4>
                      <p className="text-[11px] text-zinc-400 mt-0.5">
                        Locks your vault and securely purges in-memory keys when inactive.
                      </p>
                    </div>
                    <span className="text-xs font-mono text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                      {autoLockMinutes} mins
                    </span>
                  </div>

                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5 pt-1">
                    {[1, 5, 15, 30, 60, 240].map((mins) => (
                      <button
                        key={mins}
                        type="button"
                        onClick={() => handleUpdateAutoLock(mins)}
                        className={`py-1.5 px-2 rounded-lg text-xs font-medium transition-colors ${
                          autoLockMinutes === mins
                            ? 'bg-indigo-600 text-white font-semibold shadow-sm'
                            : 'bg-zinc-900 text-zinc-400 hover:text-white hover:bg-zinc-800'
                        }`}
                      >
                        {mins < 60 ? `${mins}m` : `${mins / 60}h`}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Clipboard Security */}
                <div className="p-4 rounded-xl bg-zinc-950/70 border border-white/[0.06] space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-xs font-semibold text-white">Clipboard Security Auto-Clear</h4>
                      <p className="text-[11px] text-zinc-400 mt-0.5">
                        Automatically clears copied secret tokens from system clipboard to prevent leakage.
                      </p>
                    </div>
                    <span className="text-xs font-mono text-zinc-400 bg-zinc-900 px-2 py-0.5 rounded border border-white/[0.08]">
                      {clipboardClearSeconds === 0 ? 'Disabled' : `${clipboardClearSeconds}s`}
                    </span>
                  </div>

                  <div className="grid grid-cols-4 gap-2 pt-1">
                    {[
                      { label: '15 seconds', val: 15 },
                      { label: '30 seconds', val: 30 },
                      { label: '60 seconds', val: 60 },
                      { label: 'Never clear', val: 0 },
                    ].map((opt) => (
                      <button
                        key={opt.val}
                        type="button"
                        onClick={() => {
                          setClipboardClearSeconds(opt.val);
                          toast.success(`Clipboard timeout set to ${opt.label}`);
                        }}
                        className={`py-1.5 px-2 rounded-lg text-xs font-medium transition-colors ${
                          clipboardClearSeconds === opt.val
                            ? 'bg-white text-zinc-950 font-semibold shadow-sm'
                            : 'bg-zinc-900 text-zinc-400 hover:text-white hover:bg-zinc-800'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Change Master Passphrase Form */}
                <div className="p-4 rounded-xl bg-zinc-950/70 border border-white/[0.06] space-y-4">
                  <div>
                    <h4 className="text-xs font-semibold text-white">Change Master Passphrase</h4>
                    <p className="text-[11px] text-zinc-400 mt-0.5">
                      Re-encrypts your entire vault with PBKDF2 (600,000 iterations) and AES-256-GCM.
                    </p>
                  </div>

                  <form onSubmit={handleChangePassphrase} className="space-y-3">
                    <div>
                      <label className="block text-[11px] text-zinc-400 mb-1">Current Passphrase</label>
                      <input
                        type={showPasswords ? 'text' : 'password'}
                        value={currentPass}
                        onChange={(e) => setCurrentPass(e.target.value)}
                        placeholder="••••••••••••"
                        className="w-full px-3 py-1.5 bg-[#0D0E14] border border-white/[0.08] rounded-lg text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-indigo-500"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[11px] text-zinc-400 mb-1">New Passphrase (min 12 chars)</label>
                        <input
                          type={showPasswords ? 'text' : 'password'}
                          value={newPass}
                          onChange={(e) => setNewPass(e.target.value)}
                          placeholder="••••••••••••"
                          className="w-full px-3 py-1.5 bg-[#0D0E14] border border-white/[0.08] rounded-lg text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-indigo-500"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] text-zinc-400 mb-1">Confirm New Passphrase</label>
                        <input
                          type={showPasswords ? 'text' : 'password'}
                          value={confirmPass}
                          onChange={(e) => setConfirmPass(e.target.value)}
                          placeholder="••••••••••••"
                          className="w-full px-3 py-1.5 bg-[#0D0E14] border border-white/[0.08] rounded-lg text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-indigo-500"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <button
                        type="button"
                        onClick={() => setShowPasswords(!showPasswords)}
                        className="text-[11px] text-zinc-400 hover:text-zinc-200 flex items-center space-x-1"
                      >
                        {showPasswords ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                        <span>{showPasswords ? 'Hide passphrases' : 'Show passphrases'}</span>
                      </button>

                      <button
                        type="submit"
                        disabled={isChangingPass || !currentPass || !newPass}
                        className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-medium transition-colors disabled:opacity-50 flex items-center space-x-1.5"
                      >
                        {isChangingPass ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Lock className="h-3.5 w-3.5" />}
                        <span>{isChangingPass ? 'Re-encrypting Vault…' : 'Update Passphrase'}</span>
                      </button>
                    </div>

                    {newRecoveryResult && (
                      <div className="mt-3 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300 space-y-2">
                        <div className="flex items-center space-x-1.5 font-semibold">
                          <Check className="h-4 w-4 text-emerald-400" />
                          <span>Passphrase Changed! New Recovery Kit Generated:</span>
                        </div>
                        <div className="p-2 rounded bg-black/40 font-mono text-[11px] text-emerald-200 break-all select-all flex items-center justify-between">
                          <span>{newRecoveryResult}</span>
                          <button
                            type="button"
                            onClick={() => copyToClipboardSecure(newRecoveryResult, 'Recovery Code')}
                            className="p-1 hover:text-white"
                          >
                            <Copy className="h-3.5 w-3.5" />
                          </button>
                        </div>
                        <p className="text-[10px] text-emerald-400/80">
                          Save this 24-character code in a secure offline location.
                        </p>
                      </div>
                    )}
                  </form>
                </div>

                {/* Emergency Recovery Kit Card */}
                <div className="p-4 rounded-xl bg-zinc-950/70 border border-white/[0.06] space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-xs font-semibold text-white">Emergency Recovery Kit</h4>
                      <p className="text-[11px] text-zinc-400 mt-0.5">
                        Regenerating invalidates previous recovery codes and wraps your master key with a fresh one.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleRegenerateRecoveryKit}
                      disabled={isRegeneratingKit}
                      className="px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-white/[0.08] rounded-lg text-xs font-medium transition-colors flex items-center space-x-1.5"
                    >
                      {isRegeneratingKit ? <RefreshCw className="h-3 w-3 animate-spin" /> : <Key className="h-3 w-3" />}
                      <span>Regenerate Code</span>
                    </button>
                  </div>

                  {freshRecoveryKit && (
                    <div className="p-3 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-xs text-indigo-300 space-y-2">
                      <p className="font-semibold text-white text-xs">Fresh Recovery Code:</p>
                      <div className="p-2 bg-black/40 font-mono text-xs text-indigo-200 select-all flex items-center justify-between rounded">
                        <span>{freshRecoveryKit}</span>
                        <button
                          type="button"
                          onClick={() => copyToClipboardSecure(freshRecoveryKit, 'Recovery Code')}
                          className="hover:text-white"
                        >
                          <Copy className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Instant Lock */}
                <div className="pt-2 flex justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      closeSettings();
                      lockVault();
                    }}
                    className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-white/[0.08] text-xs font-medium text-zinc-300 hover:text-white transition-colors"
                  >
                    <Lock className="h-3.5 w-3.5 text-amber-400" />
                    <span>Lock Vault Now</span>
                  </button>
                </div>
              </div>
            )}

            {/* TAB: PROJECTS & SCOPE */}
            {activeTab === 'projects' && (
              <div className="space-y-5">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-semibold text-white">Vault Projects</h4>
                    <p className="text-[11px] text-zinc-400 mt-0.5">
                      Organize your API credentials by microservice, client app, or repository.
                    </p>
                  </div>
                  {!isCreatingProj && (
                    <button
                      type="button"
                      onClick={() => setIsCreatingProj(true)}
                      className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-white text-zinc-950 rounded-lg text-xs font-medium hover:bg-zinc-200 transition-colors"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      <span>New Project</span>
                    </button>
                  )}
                </div>

                {/* Create Project Card */}
                {isCreatingProj && (
                  <form onSubmit={handleCreateProject} className="p-4 rounded-xl bg-zinc-950 border border-indigo-500/30 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-white">Create New Project</span>
                      <button
                        type="button"
                        onClick={() => setIsCreatingProj(false)}
                        className="text-zinc-500 hover:text-white"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] text-zinc-400 mb-1">Project Name</label>
                        <input
                          type="text"
                          required
                          value={newProjName}
                          onChange={(e) => setNewProjName(e.target.value)}
                          placeholder="e.g. Payments Gateway"
                          className="w-full px-3 py-1.5 bg-[#0D0E14] border border-white/[0.08] rounded-lg text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-indigo-500"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] text-zinc-400 mb-1">Description (optional)</label>
                        <input
                          type="text"
                          value={newProjDesc}
                          onChange={(e) => setNewProjDesc(e.target.value)}
                          placeholder="Backend billing service"
                          className="w-full px-3 py-1.5 bg-[#0D0E14] border border-white/[0.08] rounded-lg text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-indigo-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] text-zinc-400 mb-1">Badge Color</label>
                      <div className="flex items-center space-x-2">
                        {PRESET_COLORS.map((c) => (
                          <button
                            key={c}
                            type="button"
                            onClick={() => setNewProjColor(c)}
                            style={{ backgroundColor: c }}
                            className={`h-5 w-5 rounded-full transition-transform ${
                              newProjColor === c ? 'ring-2 ring-white scale-110' : 'opacity-70 hover:opacity-100'
                            }`}
                          />
                        ))}
                      </div>
                    </div>

                    <div className="flex justify-end space-x-2 pt-1">
                      <button
                        type="button"
                        onClick={() => setIsCreatingProj(false)}
                        className="px-3 py-1.5 text-xs text-zinc-400 hover:text-white"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-medium"
                      >
                        Create Project
                      </button>
                    </div>
                  </form>
                )}

                {/* Projects List */}
                <div className="divide-y divide-white/[0.06] border border-white/[0.06] rounded-xl overflow-hidden bg-zinc-950/50">
                  {projects.length === 0 ? (
                    <div className="p-6 text-center text-xs text-zinc-500">
                      No custom projects created yet. Keys are currently stored uncategorized.
                    </div>
                  ) : (
                    projects.map((proj) => {
                      const count = credentials.filter((c) => c.projectId === proj.id).length;
                      const isEditing = editingProjId === proj.id;

                      if (isEditing) {
                        return (
                          <div key={proj.id} className="p-4 space-y-3 bg-zinc-900/60">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              <input
                                type="text"
                                value={editProjName}
                                onChange={(e) => setEditProjName(e.target.value)}
                                className="px-3 py-1 bg-zinc-950 border border-white/[0.1] rounded text-xs text-white"
                              />
                              <input
                                type="text"
                                value={editProjDesc}
                                onChange={(e) => setEditProjDesc(e.target.value)}
                                placeholder="Description"
                                className="px-3 py-1 bg-zinc-950 border border-white/[0.1] rounded text-xs text-white"
                              />
                            </div>
                            <div className="flex items-center justify-between">
                              <div className="flex space-x-1.5">
                                {PRESET_COLORS.map((c) => (
                                  <button
                                    key={c}
                                    type="button"
                                    onClick={() => setEditProjColor(c)}
                                    style={{ backgroundColor: c }}
                                    className={`h-4 w-4 rounded-full ${
                                      editProjColor === c ? 'ring-2 ring-white' : 'opacity-60'
                                    }`}
                                  />
                                ))}
                              </div>
                              <div className="flex space-x-2">
                                <button
                                  type="button"
                                  onClick={() => setEditingProjId(null)}
                                  className="text-[11px] text-zinc-400"
                                >
                                  Cancel
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleSaveEditProject(proj.id)}
                                  className="px-2.5 py-1 bg-white text-zinc-950 text-[11px] font-semibold rounded"
                                >
                                  Save
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      }

                      return (
                        <div key={proj.id} className="p-3.5 flex items-center justify-between hover:bg-zinc-900/40 transition-colors">
                          <div className="flex items-center space-x-3">
                            <span
                              className="h-3 w-3 rounded-full shrink-0"
                              style={{ backgroundColor: proj.color || '#6366f1' }}
                            />
                            <div>
                              <div className="flex items-center space-x-2">
                                <span className="text-xs font-semibold text-white">{proj.name}</span>
                                <span className="text-[10px] font-mono text-zinc-500">/{proj.slug}</span>
                              </div>
                              {proj.description && (
                                <p className="text-[11px] text-zinc-400 mt-0.5">{proj.description}</p>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center space-x-3">
                            <span className="text-[11px] text-zinc-400 font-mono bg-zinc-900 px-2 py-0.5 rounded border border-white/[0.06]">
                              {count} {count === 1 ? 'key' : 'keys'}
                            </span>
                            <button
                              type="button"
                              onClick={() => {
                                setEditingProjId(proj.id);
                                setEditProjName(proj.name);
                                setEditProjDesc(proj.description || '');
                                setEditProjColor(proj.color || '#6366f1');
                              }}
                              className="p-1 text-zinc-400 hover:text-white"
                              title="Edit Project"
                            >
                              <Edit2 className="h-3.5 w-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteProject(proj.id, proj.name)}
                              className="p-1 text-zinc-500 hover:text-rose-400"
                              title="Delete Project"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}

            {/* TAB: API KEY GENERATOR */}
            {activeTab === 'generator' && (
              <div className="space-y-5">
                <div>
                  <h4 className="text-xs font-semibold text-white">Cryptographic API Key Generator</h4>
                  <p className="text-[11px] text-zinc-400 mt-0.5">
                    Generate high-entropy tokens and secrets using the Web Crypto CSPRNG.
                  </p>
                </div>

                {/* Generator Output Display */}
                <div className="p-4 rounded-xl bg-zinc-950 border border-white/[0.08] space-y-2">
                  <div className="flex items-center justify-between text-[11px] text-zinc-400">
                    <span className="font-mono text-indigo-400 flex items-center space-x-1">
                      <Terminal className="h-3.5 w-3.5" />
                      <span>Generated Secret</span>
                    </span>
                    <span className="text-[10px] text-zinc-500 font-mono">
                      {generatedKey.length} chars · ~{(generatedKey.length * 5.2).toFixed(0)} bits entropy
                    </span>
                  </div>

                  <div className="p-3 bg-[#08090C] border border-white/[0.08] rounded-lg font-mono text-xs text-emerald-400 break-all select-all flex items-center justify-between">
                    <span className="mr-2">{generatedKey || 'Click Generate Below'}</span>
                    <button
                      type="button"
                      onClick={() => copyToClipboardSecure(generatedKey, 'API Token')}
                      className="p-1.5 rounded bg-zinc-800 hover:bg-zinc-700 text-white shrink-0"
                      title="Copy to clipboard"
                    >
                      <Copy className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                {/* Generator Controls */}
                <div className="p-4 rounded-xl bg-zinc-950/70 border border-white/[0.06] space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Format Selector */}
                    <div>
                      <label className="block text-[11px] font-medium text-zinc-300 mb-1.5">Secret Format</label>
                      <div className="grid grid-cols-2 gap-1.5">
                        {[
                          { id: 'alphanumeric', label: 'Alphanumeric' },
                          { id: 'hex', label: 'Hex (0-9, a-f)' },
                          { id: 'base64', label: 'Base64 Safe' },
                          { id: 'uuid', label: 'UUID v4' },
                        ].map((fmt) => (
                          <button
                            key={fmt.id}
                            type="button"
                            onClick={() => {
                              setGenFormat(fmt.id as any);
                            }}
                            className={`py-1.5 px-2 text-xs font-medium rounded-lg text-left transition-colors ${
                              genFormat === fmt.id
                                ? 'bg-indigo-600 text-white font-semibold'
                                : 'bg-zinc-900 text-zinc-400 hover:text-white'
                            }`}
                          >
                            {fmt.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Prefix & Length */}
                    <div className="space-y-3">
                      <div>
                        <label className="block text-[11px] font-medium text-zinc-300 mb-1">Prefix</label>
                        <div className="flex space-x-1.5">
                          <input
                            type="text"
                            value={genPrefix}
                            onChange={(e) => setGenPrefix(e.target.value)}
                            placeholder="e.g. sk_live_, ghp_"
                            className="flex-1 px-3 py-1.5 bg-[#0D0E14] border border-white/[0.08] rounded-lg text-xs text-white font-mono placeholder-zinc-600 focus:outline-none focus:border-indigo-500"
                          />
                          {['sk_live_', 'pk_test_', 'ghp_', ''].map((p) => (
                            <button
                              key={p || 'none'}
                              type="button"
                              onClick={() => setGenPrefix(p)}
                              className="px-2 py-1 bg-zinc-900 hover:bg-zinc-800 rounded text-[10px] font-mono text-zinc-400 hover:text-white"
                            >
                              {p || 'none'}
                            </button>
                          ))}
                        </div>
                      </div>

                      {genFormat !== 'uuid' && (
                        <div>
                          <div className="flex justify-between text-[11px] text-zinc-400 mb-1">
                            <span>Key Length</span>
                            <span className="font-mono text-white">{genLength} characters</span>
                          </div>
                          <input
                            type="range"
                            min="16"
                            max="96"
                            step="4"
                            value={genLength}
                            onChange={(e) => setGenLength(parseInt(e.target.value, 10))}
                            className="w-full accent-indigo-500"
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="pt-2 flex justify-end">
                    <button
                      type="button"
                      onClick={handleGenerateKey}
                      className="px-4 py-2 bg-white text-zinc-950 hover:bg-zinc-200 text-xs font-semibold rounded-lg shadow-sm transition-colors flex items-center space-x-1.5"
                    >
                      <Sparkles className="h-3.5 w-3.5 text-zinc-950" />
                      <span>Generate New Secret</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* TAB: PLAN & BILLING */}
            {activeTab === 'billing' && (
              <div className="space-y-5">
                <div>
                  <h4 className="text-xs font-semibold text-white">Subscription & Plan Limits</h4>
                  <p className="text-[11px] text-zinc-400 mt-0.5">
                    Syntoze Vault zero-knowledge architecture with Cashfree payments.
                  </p>
                </div>

                {/* Plan Card */}
                <div className="p-4 rounded-xl bg-zinc-950 border border-white/[0.08] space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2.5">
                      <div className="h-9 w-9 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                        <Zap className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="text-xs font-bold text-white">
                            {isPro ? 'Syntoze Pro Plan' : 'Free Developer Tier'}
                          </span>
                          <span
                            className={`text-[10px] font-mono px-2 py-0.5 rounded-full uppercase font-semibold ${
                              isPro
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                : 'bg-zinc-800 text-zinc-400 border border-white/[0.08]'
                            }`}
                          >
                            {isPro ? userSubscription?.billingCycle || 'Active' : 'Free'}
                          </span>
                        </div>
                        <p className="text-[11px] text-zinc-400 mt-0.5">
                          {isPro
                            ? 'Unlimited credentials & automated rotation alerts'
                            : 'Capped at 15 stored credentials'}
                        </p>
                      </div>
                    </div>

                    {!isPro && (
                      <button
                        type="button"
                        onClick={() => {
                          closeSettings();
                          openPricingModal();
                        }}
                        className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors flex items-center space-x-1"
                      >
                        <span>Upgrade to Pro</span>
                        <ChevronRight className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>

                  {/* Quota Progress Bar */}
                  <div className="space-y-1.5 pt-2 border-t border-white/[0.06]">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-zinc-400">Stored Credentials</span>
                      <span className="font-mono text-white">
                        {credentials.length} / {isPro ? '∞' : keyLimit} keys
                      </span>
                    </div>
                    <div className="h-2 w-full bg-zinc-900 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-300 ${
                          credentials.length >= keyLimit && !isPro ? 'bg-rose-500' : 'bg-indigo-500'
                        }`}
                        style={{
                          width: isPro ? '25%' : `${Math.min(100, (credentials.length / keyLimit) * 100)}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* Benefits List */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-zinc-300">
                  {[
                    'Zero-Knowledge Client-Side AES-256 Encryption',
                    'Cross-Environment Leak Detection (Dev keys in Prod)',
                    'Automated Key Rotation Health Warnings (>90 days)',
                    'Instant .env Exporter & Batch Importer',
                  ].map((feat) => (
                    <div key={feat} className="flex items-start space-x-2 p-2.5 rounded-lg bg-zinc-950/40 border border-white/[0.04]">
                      <Check className="h-3.5 w-3.5 text-emerald-400 shrink-0 mt-0.5" />
                      <span className="text-[11px] leading-relaxed">{feat}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB: BACKUP & PORTABILITY */}
            {activeTab === 'backup' && (
              <div className="space-y-6">
                <div>
                  <h4 className="text-xs font-semibold text-white">Data Portability & Backups</h4>
                  <p className="text-[11px] text-zinc-400 mt-0.5">
                    Export full encrypted database snapshots or audit logs.
                  </p>
                </div>

                {/* Export Options */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-4 rounded-xl bg-zinc-950 border border-white/[0.06] space-y-2">
                    <div className="h-7 w-7 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                      <FileDown className="h-4 w-4" />
                    </div>
                    <h5 className="text-xs font-semibold text-white">Full Encrypted Vault Backup</h5>
                    <p className="text-[11px] text-zinc-400 leading-relaxed">
                      Download entire database as JSON with ciphertext and IVs. No plaintexts.
                    </p>
                    <button
                      type="button"
                      onClick={exportEncryptedBackup}
                      className="mt-2 w-full py-1.5 px-3 bg-zinc-900 hover:bg-zinc-800 border border-white/[0.08] text-zinc-300 hover:text-white rounded-lg text-xs font-medium transition-colors flex items-center justify-center space-x-1.5"
                    >
                      <Download className="h-3.5 w-3.5" />
                      <span>Download JSON Backup</span>
                    </button>
                  </div>

                  <div className="p-4 rounded-xl bg-zinc-950 border border-white/[0.06] space-y-2">
                    <div className="h-7 w-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                      <Shield className="h-4 w-4" />
                    </div>
                    <h5 className="text-xs font-semibold text-white">Security Audit Log (CSV)</h5>
                    <p className="text-[11px] text-zinc-400 leading-relaxed">
                      Export credential age, provider breakdown, health compliance, and rotation logs.
                    </p>
                    <button
                      type="button"
                      onClick={handleExportAuditReport}
                      className="mt-2 w-full py-1.5 px-3 bg-zinc-900 hover:bg-zinc-800 border border-white/[0.08] text-zinc-300 hover:text-white rounded-lg text-xs font-medium transition-colors flex items-center justify-center space-x-1.5"
                    >
                      <Download className="h-3.5 w-3.5" />
                      <span>Export CSV Audit</span>
                    </button>
                  </div>
                </div>

                {/* Danger Zone */}
                <div className="p-4 rounded-xl bg-rose-500/[0.04] border border-rose-500/20 space-y-3">
                  <div className="flex items-center space-x-2 text-rose-400">
                    <AlertTriangle className="h-4 w-4" />
                    <h5 className="text-xs font-semibold uppercase tracking-wider">Danger Zone</h5>
                  </div>
                  <p className="text-[11px] text-zinc-400 leading-relaxed">
                    Permanently delete all stored credentials from your cloud vault. This action cannot be reversed.
                  </p>

                  <div className="flex flex-col sm:flex-row items-center gap-2 pt-1">
                    <input
                      type="text"
                      value={purgeConfirmation}
                      onChange={(e) => setPurgeConfirmation(e.target.value)}
                      placeholder='Type "PURGE" to confirm'
                      className="w-full sm:w-48 px-3 py-1.5 bg-[#08090C] border border-rose-500/30 rounded-lg text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-rose-500"
                    />
                    <button
                      type="button"
                      onClick={handlePurgeAll}
                      disabled={isPurging || purgeConfirmation !== 'PURGE'}
                      className="w-full sm:w-auto px-4 py-1.5 bg-rose-600 hover:bg-rose-500 disabled:opacity-40 text-white rounded-lg text-xs font-medium transition-colors"
                    >
                      {isPurging ? 'Purging…' : 'Purge All Credentials'}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

