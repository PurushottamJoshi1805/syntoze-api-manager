'use client';

import React, { useState, useEffect } from 'react';
import { useVault } from '@/lib/context/vaultContext';
import {
  DecryptedCredential,
  ProviderType,
  EnvironmentType,
} from '@/lib/types/vault';
import { PROVIDER_METADATA } from '@/lib/utils';
import {
  X,
  Key,
  Plus,
  Eye,
  EyeOff,
  ExternalLink,
  Shield,
  AlertCircle,
  ChevronDown,
  Sparkles,
} from 'lucide-react';

interface CredentialFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingCredential?: DecryptedCredential | null;
}

export const CredentialFormModal: React.FC<CredentialFormModalProps> = ({
  isOpen,
  onClose,
  editingCredential,
}) => {
  const { projects, addProject, addCredential, updateCredential } = useVault();

  const [name, setName] = useState('');
  const [provider, setProvider] = useState<ProviderType>('openai');
  const [projectId, setProjectId] = useState<string>('');
  const [environment, setEnvironment] = useState<EnvironmentType>('development');
  const [secret, setSecret] = useState('');
  const [notes, setNotes] = useState('');
  const [showSecret, setShowSecret] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const [isCreatingProject, setIsCreatingProject] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');

  useEffect(() => {
    if (editingCredential) {
      setName(editingCredential.name);
      setProvider(editingCredential.provider);
      setProjectId(editingCredential.projectId || '');
      setEnvironment(editingCredential.environment);
      setSecret(editingCredential.plaintextSecret || '');
      setNotes(editingCredential.notes || '');
    } else {
      setName('');
      setProvider('openai');
      setProjectId(projects[0]?.id || '');
      setEnvironment('development');
      setSecret('');
      setNotes('');
    }
    setErrorMessage('');
    setIsCreatingProject(false);
    setNewProjectName('');
  }, [editingCredential, isOpen, projects]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const currentProviderMeta = PROVIDER_METADATA[provider];

  const handleCreateNewProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjectName.trim()) return;
    try {
      await addProject(newProjectName.trim());
      setIsCreatingProject(false);
      setNewProjectName('');
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to create project');
    }
  };

  const handleGenerateSecret = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const bytes = new Uint8Array(32);
    crypto.getRandomValues(bytes);
    const token = Array.from(bytes)
      .map((b) => chars[b % chars.length])
      .join('');

    let prefix = 'sk_live_';
    if (provider === 'stripe') prefix = environment === 'production' ? 'sk_live_' : 'sk_test_';
    else if (provider === 'github') prefix = 'ghp_';
    else if (provider === 'aws') prefix = 'AKIA';
    else if (provider === 'openai') prefix = 'sk-';
    else if (provider === 'custom') prefix = 'sec_';

    setSecret(`${prefix}${token}`);
    setShowSecret(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!name.trim()) {
      setErrorMessage('Please provide a name for this credential.');
      return;
    }
    if (!editingCredential && !secret.trim()) {
      setErrorMessage('Secret key value cannot be empty.');
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingCredential) {
        await updateCredential(editingCredential.id, {
          name: name.trim(),
          provider,
          projectId: projectId || null,
          environment,
          secret: secret.trim() ? secret.trim() : undefined,
          notes: notes.trim(),
        });
      } else {
        await addCredential({
          name: name.trim(),
          provider,
          projectId: projectId || null,
          environment,
          secret: secret.trim(),
          notes: notes.trim(),
        });
      }
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to encrypt and save credential');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-lg bg-[#0D0E14] border border-white/[0.09] rounded-xl shadow-2xl p-6 relative max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/[0.06]">
          <div className="flex items-center space-x-2.5">
            <div className="h-8 w-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <Key className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-white tracking-tight">
                {editingCredential ? 'Edit credential' : 'Add new credential'}
              </h2>
              <p className="text-xs text-zinc-400">Client-side encrypted before sending to Supabase</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-white/[0.05] transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {errorMessage && (
          <div className="mt-4 p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-xs text-rose-300 flex items-center space-x-2">
            <AlertCircle className="h-4 w-4 flex-shrink-0 text-rose-400" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          {/* Provider */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-medium text-zinc-300">API provider</label>
              {currentProviderMeta?.docsUrl && (
                <a
                  href={currentProviderMeta.docsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[11px] text-indigo-400 hover:text-indigo-300 transition-colors inline-flex items-center space-x-1"
                >
                  <span>Get {currentProviderMeta.name} keys</span>
                  <ExternalLink className="h-2.5 w-2.5" />
                </a>
              )}
            </div>
            <div className="relative">
              <select
                value={provider}
                onChange={(e) => setProvider(e.target.value as ProviderType)}
                className="w-full pl-3 pr-8 py-2 bg-zinc-950 border border-white/[0.08] rounded-lg text-xs text-zinc-200 focus:outline-none focus:border-indigo-500/60 appearance-none cursor-pointer transition-colors"
              >
                <option value="openai">OpenAI (GPT-4, Embeddings)</option>
                <option value="anthropic">Anthropic (Claude 3.5)</option>
                <option value="gemini">Google Gemini (AI Studio)</option>
                <option value="groq">Groq (LPU Inference)</option>
                <option value="nvidia">NVIDIA NIM Microservices</option>
                <option value="stripe">Stripe (Payments)</option>
                <option value="aws">AWS IAM / KMS</option>
                <option value="github">GitHub Personal Access Token</option>
                <option value="supabase">Supabase Service Key</option>
                <option value="neon">Neon Postgres</option>
                <option value="resend">Resend (Email)</option>
                <option value="cloudflare">Cloudflare API Token</option>
                <option value="vercel">Vercel Token</option>
                <option value="twilio">Twilio</option>
                <option value="sendgrid">SendGrid</option>
                <option value="firebase">Firebase</option>
                <option value="mongodb">MongoDB Atlas</option>
                <option value="planetscale">PlanetScale</option>
                <option value="upstash">Upstash Redis</option>
                <option value="custom">Custom / Other</option>
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-500 pointer-events-none" />
            </div>
          </div>

          {/* Credential Name */}
          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1.5">Label / Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. OpenAI Production Key"
              required
              className="w-full px-3 py-2 bg-zinc-950 border border-white/[0.08] rounded-lg text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500/60 transition-colors"
            />
          </div>

          {/* Project & Environment */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-medium text-zinc-300">Project</label>
                <button
                  type="button"
                  onClick={() => setIsCreatingProject(!isCreatingProject)}
                  className="text-[11px] text-indigo-400 hover:text-indigo-300 transition-colors inline-flex items-center space-x-0.5"
                >
                  <Plus className="h-3 w-3" />
                  <span>New</span>
                </button>
              </div>

              {isCreatingProject ? (
                <div className="flex items-center space-x-1.5">
                  <input
                    type="text"
                    value={newProjectName}
                    onChange={(e) => setNewProjectName(e.target.value)}
                    placeholder="Project name…"
                    className="flex-1 px-2.5 py-1.5 bg-zinc-950 border border-white/[0.08] rounded-lg text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500/60"
                  />
                  <button
                    type="button"
                    onClick={handleCreateNewProject}
                    className="px-2.5 py-1.5 bg-white text-zinc-950 rounded-lg text-xs font-medium hover:bg-zinc-200 transition-colors"
                  >
                    Save
                  </button>
                </div>
              ) : (
                <div className="relative">
                  <select
                    value={projectId}
                    onChange={(e) => setProjectId(e.target.value)}
                    className="w-full pl-3 pr-8 py-2 bg-zinc-950 border border-white/[0.08] rounded-lg text-xs text-zinc-200 focus:outline-none focus:border-indigo-500/60 appearance-none cursor-pointer transition-colors"
                  >
                    <option value="">No Project (Uncategorized)</option>
                    {projects.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-500 pointer-events-none" />
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1.5">Environment</label>
              <div className="grid grid-cols-3 gap-1 bg-zinc-950 p-1 rounded-lg border border-white/[0.08]">
                {(['development', 'staging', 'production'] as EnvironmentType[]).map((env) => (
                  <button
                    key={env}
                    type="button"
                    onClick={() => setEnvironment(env)}
                    className={`py-1.5 text-xs font-medium rounded-md capitalize transition-colors ${
                      environment === env
                        ? 'bg-white/[0.1] text-white shadow-sm'
                        : 'text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    {env === 'development' ? 'Dev' : env === 'staging' ? 'Stage' : 'Prod'}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Secret Input */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-medium text-zinc-300">
                {editingCredential ? 'Replace secret (leave blank to keep)' : 'Secret key / token'}
              </label>
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={handleGenerateSecret}
                  className="text-[11px] text-indigo-400 hover:text-indigo-300 font-medium flex items-center space-x-1 transition-colors"
                  title="Generate a random secure API secret"
                >
                  <Sparkles className="h-3 w-3" />
                  <span>Generate</span>
                </button>
                {secret.length > 0 && (
                  <span className="text-[10px] text-zinc-500 font-mono">
                    {secret.length} chars
                  </span>
                )}
              </div>
            </div>
            <div className="relative">
              <input
                type={showSecret ? 'text' : 'password'}
                value={secret}
                onChange={(e) => setSecret(e.target.value)}
                placeholder={currentProviderMeta?.placeholder || 'Paste secret value here…'}
                required={!editingCredential}
                className="w-full pl-3 pr-9 py-2 bg-zinc-950 border border-white/[0.08] rounded-lg text-xs font-mono text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-indigo-500/60 transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowSecret(!showSecret)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white"
              >
                {showSecret ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
              </button>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1.5">
              Notes (optional)
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Bound to billing tier 3, webhook secret for endpoint /api/stripe"
              className="w-full px-3 py-2 bg-zinc-950 border border-white/[0.08] rounded-lg text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-indigo-500/60 transition-colors"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end space-x-2 pt-3 border-t border-white/[0.06]">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 text-xs font-medium text-zinc-400 hover:text-white rounded-lg hover:bg-white/[0.05] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-1.5 text-xs font-medium bg-white text-zinc-950 hover:bg-zinc-200 rounded-lg transition-colors flex items-center space-x-1.5 shadow-sm"
            >
              <Shield className="h-3.5 w-3.5 text-zinc-900" />
              <span>
                {isSubmitting
                  ? 'Encrypting…'
                  : editingCredential
                  ? 'Update credential'
                  : 'Save credential'}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
