'use client';

import React, { useState, useRef } from 'react';
import { useVault } from '@/lib/context/vaultContext';
import { EnvironmentType, ProviderType } from '@/lib/types/vault';
import { parseEnvContent, ParsedEnvItem } from '@/lib/envParser';
import { PROVIDER_METADATA } from '@/lib/utils';
import {
  X,
  UploadCloud,
  FileCode,
  FileText,
  Check,
  CheckSquare,
  Square,
  ShieldCheck,
  AlertCircle,
  Plus,
  Loader2,
  Lock,
  ArrowRight,
  ChevronRight,
} from 'lucide-react';
import { toast } from 'sonner';

interface EnvImportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const EnvImportModal: React.FC<EnvImportModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { projects, addProject, batchAddCredentials } = useVault();

  // Mode: 'input' | 'preview'
  const [step, setStep] = useState<'input' | 'preview'>('input');
  const [rawText, setRawText] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const [targetProjectId, setTargetProjectId] = useState<string>('');
  const [targetEnv, setTargetEnv] = useState<EnvironmentType>('development');

  // Inline project creation
  const [isCreatingProject, setIsCreatingProject] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');

  // Parsed items
  const [parsedItems, setParsedItems] = useState<ParsedEnvItem[]>([]);
  const [isImporting, setIsImporting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // File drag & drop handlers
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (file: File) => {
    setErrorMsg('');
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (!content || !content.trim()) {
        setErrorMsg('The selected file appears to be empty.');
        return;
      }
      setRawText(content);
      const items = parseEnvContent(content);
      if (items.length === 0) {
        setErrorMsg('No valid environment variables (KEY=VALUE) found in this file.');
        return;
      }
      setParsedItems(items);
      setStep('preview');
    };
    reader.onerror = () => {
      setErrorMsg('Failed to read file.');
    };
    reader.readAsText(file);
  };

  const handleParseText = () => {
    setErrorMsg('');
    if (!rawText.trim()) {
      setErrorMsg('Please paste or drag a .env file content first.');
      return;
    }
    const items = parseEnvContent(rawText);
    if (items.length === 0) {
      setErrorMsg('Could not detect any KEY=VALUE assignments. Please check formatting.');
      return;
    }
    setParsedItems(items);
    setStep('preview');
  };

  const handleToggleItem = (id: string) => {
    setParsedItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, selected: !item.selected } : item))
    );
  };

  const handleToggleAll = (select: boolean) => {
    setParsedItems((prev) => prev.map((item) => ({ ...item, selected: select })));
  };

  const handleUpdateItemProvider = (id: string, provider: ProviderType) => {
    setParsedItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, provider } : item))
    );
  };

  const handleUpdateItemName = (id: string, suggestedName: string) => {
    setParsedItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, suggestedName } : item))
    );
  };

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjectName.trim()) return;
    try {
      await addProject(newProjectName.trim());
      setIsCreatingProject(false);
      setNewProjectName('');
      toast.success(`Project "${newProjectName.trim()}" created!`);
    } catch {
      toast.error('Failed to create project');
    }
  };

  const handleExecuteImport = async () => {
    const selected = parsedItems.filter((i) => i.selected);
    if (selected.length === 0) {
      setErrorMsg('Please select at least one variable to import.');
      return;
    }

    setIsImporting(true);
    setErrorMsg('');

    try {
      const payload = selected.map((item) => ({
        projectId: targetProjectId ? targetProjectId : null,
        provider: item.provider,
        name: item.suggestedName || item.keyName,
        environment: targetEnv,
        secret: item.secretValue,
        notes: item.comment ? `Imported from .env (${item.keyName}): ${item.comment}` : `Imported from variable: ${item.keyName}`,
      }));

      const count = await batchAddCredentials(payload);
      toast.success(`Successfully encrypted and imported ${count} API keys to ${targetEnv}.`);
      handleReset();
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to batch encrypt and import keys.');
    } finally {
      setIsImporting(false);
    }
  };

  const handleReset = () => {
    setStep('input');
    setRawText('');
    setParsedItems([]);
    setErrorMsg('');
  };

  const selectedCount = parsedItems.filter((i) => i.selected).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-3xl bg-vault-900 border border-white/[0.08] rounded-xl shadow-sm p-6 sm:p-8 relative max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/[0.06]">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-lg bg-brand/10 border border-white/[0.06] flex items-center justify-center text-brand">
              <UploadCloud className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-lg font-semibold text-white">.env File Importer</h2>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/[0.04] border border-white/[0.06] text-vault-400 font-medium">
                  Auto-parse
                </span>
              </div>
              <p className="text-[11px] text-vault-400">
                Drag and drop your existing environment file. Auto-detects providers and encrypts in browser.
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              handleReset();
              onClose();
            }}
            className="p-1 rounded-lg text-vault-400 hover:text-white hover:bg-vault-800 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Global Error Banner */}
        {errorMsg && (
          <div className="mt-4 p-3 rounded-lg bg-rose-950/30 border border-rose-500/20 text-xs text-rose-300 flex items-center space-x-2">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* STEP 1: INPUT / DRAG & DROP */}
        {step === 'input' && (
          <div className="space-y-4 my-4 overflow-y-auto flex-1 pr-1">
            {/* Target Project & Environment Config */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 rounded-lg bg-vault-950 border border-white/[0.06]">
              {/* Project */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[11px] font-medium text-vault-300">Assign to project</label>
                  <button
                    type="button"
                    onClick={() => setIsCreatingProject(!isCreatingProject)}
                    className="text-[11px] text-brand hover:text-brand-hover flex items-center space-x-0.5 transition-colors"
                  >
                    <Plus className="h-3 w-3" />
                    <span>New project</span>
                  </button>
                </div>

                {isCreatingProject ? (
                  <div className="flex items-center space-x-1.5">
                    <input
                      type="text"
                      value={newProjectName}
                      onChange={(e) => setNewProjectName(e.target.value)}
                      placeholder="Project name..."
                      className="flex-1 px-3 py-1.5 bg-vault-900 border border-white/[0.08] rounded-lg text-xs text-white focus:outline-none focus:border-brand transition-colors"
                    />
                    <button
                      type="button"
                      onClick={handleCreateProject}
                      className="px-2.5 py-1.5 bg-brand text-white rounded-lg text-xs font-medium transition-colors hover:bg-brand-hover"
                    >
                      Save
                    </button>
                  </div>
                ) : (
                  <select
                    value={targetProjectId}
                    onChange={(e) => setTargetProjectId(e.target.value)}
                    className="w-full px-3 py-2 bg-vault-900 border border-white/[0.08] rounded-lg text-xs text-white focus:outline-none focus:border-brand transition-colors"
                  >
                    <option value="">No Project (General Vault)</option>
                    {projects.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Environment */}
              <div>
                <label className="block text-[11px] font-medium text-vault-300 mb-1">Target environment</label>
                <div className="grid grid-cols-3 gap-1 bg-vault-900 p-1 rounded-lg border border-white/[0.08]">
                  {(['development', 'staging', 'production'] as EnvironmentType[]).map((env) => (
                    <button
                      key={env}
                      type="button"
                      onClick={() => setTargetEnv(env)}
                      className={`py-1.5 text-[11px] font-medium rounded-md capitalize transition-colors ${
                        targetEnv === env
                          ? 'bg-brand text-white'
                          : 'text-vault-400 hover:text-white'
                      }`}
                    >
                      {env === 'development' ? 'Dev' : env === 'staging' ? 'Stage' : 'Prod'}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Drag and Drop Zone */}
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors duration-150 flex flex-col items-center justify-center space-y-2.5 ${
                dragActive
                  ? 'border-brand bg-brand/5'
                  : 'border-white/[0.08] bg-vault-950/60 hover:border-white/[0.12] hover:bg-vault-950'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".env,.env.*,text/plain"
                onChange={handleFileInputChange}
                className="hidden"
              />
              <div className="h-10 w-10 rounded-lg bg-vault-800 border border-white/[0.06] flex items-center justify-center text-vault-400">
                <FileCode className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[13px] font-medium text-white">
                  Drop your <code className="text-vault-300 font-mono text-xs">.env</code> or <code className="text-vault-300 font-mono text-xs">.env.local</code> file here
                </p>
                <p className="text-[11px] text-vault-500 mt-1">or click to browse from your computer</p>
              </div>
            </div>

            {/* Alternative: Raw Paste */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-[11px] font-medium text-vault-300 flex items-center space-x-1.5">
                  <FileText className="h-3.5 w-3.5 text-vault-400" />
                  <span>Or paste raw .env contents</span>
                </label>
                {rawText && (
                  <button
                    onClick={() => setRawText('')}
                    className="text-[11px] text-vault-500 hover:text-vault-300 transition-colors"
                  >
                    Clear
                  </button>
                )}
              </div>
              <textarea
                rows={4}
                value={rawText}
                onChange={(e) => setRawText(e.target.value)}
                placeholder={'OPENAI_API_KEY="sk-proj-..."\nSTRIPE_SECRET_KEY="sk_live_..."\nDATABASE_URL="postgres://..."'}
                className="w-full p-3 bg-vault-950 border border-white/[0.06] rounded-lg text-xs font-mono text-vault-300 placeholder-vault-600 focus:outline-none focus:border-brand transition-colors"
              />
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={handleParseText}
                disabled={!rawText.trim()}
                className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-lg text-xs font-medium bg-brand hover:bg-brand-hover disabled:bg-vault-800 disabled:text-vault-500 text-white transition-colors"
              >
                <span>Parse & Preview Keys</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: PREVIEW & CONFIRM */}
        {step === 'preview' && (
          <div className="my-4 flex-1 flex flex-col overflow-hidden space-y-3">
            {/* Top Toolbar */}
            <div className="flex items-center justify-between text-xs pb-2 border-b border-white/[0.06]">
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => handleToggleAll(selectedCount !== parsedItems.length)}
                  className="flex items-center space-x-1.5 text-vault-300 hover:text-white font-medium transition-colors"
                >
                  {selectedCount === parsedItems.length ? (
                    <CheckSquare className="h-4 w-4 text-brand" />
                  ) : (
                    <Square className="h-4 w-4 text-vault-500" />
                  )}
                  <span>Select All ({selectedCount}/{parsedItems.length})</span>
                </button>
                <span className="text-vault-700">|</span>
                <span className="text-vault-400">
                  Target: <strong className="text-vault-200">{targetEnv}</strong>
                  {targetProjectId ? ` (${projects.find((p) => p.id === targetProjectId)?.name})` : ''}
                </span>
              </div>

              <button
                onClick={() => setStep('input')}
                className="text-xs text-vault-400 hover:text-vault-200 transition-colors"
              >
                ← Back to Input
              </button>
            </div>

            {/* Parsed Items List */}
            <div className="overflow-y-auto flex-1 space-y-2 pr-1">
              {parsedItems.map((item) => {
                const meta = PROVIDER_METADATA[item.provider] || PROVIDER_METADATA.custom;
                return (
                  <div
                    key={item.id}
                    className={`p-3 rounded-lg border transition-colors ${
                      item.selected
                        ? 'bg-vault-950 border-white/[0.08]'
                        : 'bg-vault-950/40 border-white/[0.04] opacity-60'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      {/* Checkbox + Key Name */}
                      <div className="flex items-center space-x-2.5 flex-1 min-w-0">
                        <button
                          type="button"
                          onClick={() => handleToggleItem(item.id)}
                          className="text-vault-400 hover:text-brand transition-colors"
                        >
                          {item.selected ? (
                            <CheckSquare className="h-4 w-4 text-brand" />
                          ) : (
                            <Square className="h-4 w-4 text-vault-600" />
                          )}
                        </button>
                        <div className="truncate flex-1">
                          <input
                            type="text"
                            value={item.suggestedName}
                            onChange={(e) => handleUpdateItemName(item.id, e.target.value)}
                            placeholder={item.keyName}
                            className="bg-transparent border-b border-transparent hover:border-white/[0.08] focus:border-brand text-xs font-medium text-white focus:outline-none w-full transition-colors"
                          />
                          <p className="text-[10px] font-mono text-vault-500 truncate">{item.keyName}</p>
                        </div>
                      </div>

                      {/* Auto-detected Provider Selector */}
                      <div className="flex items-center space-x-2 flex-shrink-0">
                        <select
                          value={item.provider}
                          onChange={(e) => handleUpdateItemProvider(item.id, e.target.value as ProviderType)}
                          className="px-2.5 py-1 rounded-md text-[11px] font-medium bg-vault-800 border border-white/[0.06] text-vault-200 focus:outline-none focus:border-brand transition-colors"
                        >
                          {Object.entries(PROVIDER_METADATA).map(([key, pMeta]) => (
                            <option key={key} value={key}>
                              {pMeta.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Masked secret preview */}
                    <div className="mt-2 pl-6 flex items-center justify-between text-[11px] font-mono text-vault-500">
                      <span className="truncate max-w-xs">
                        {item.secretValue.slice(0, 6)}••••••••••••••••{item.secretValue.slice(-4)}
                      </span>
                      <span className="text-[10px] text-vault-600">{item.secretValue.length} chars</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Bottom Actions */}
            <div className="flex items-center justify-between pt-3 border-t border-white/[0.06]">
              <span className="text-xs text-vault-400 flex items-center space-x-1.5">
                <ShieldCheck className="h-4 w-4 text-emerald-400" />
                <span>All {selectedCount} keys will be encrypted client-side with AES-256</span>
              </span>

              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => setStep('input')}
                  className="px-4 py-2 text-xs font-medium text-vault-400 hover:text-white rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleExecuteImport}
                  disabled={isImporting || selectedCount === 0}
                  className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-lg text-xs font-medium bg-brand hover:bg-brand-hover disabled:bg-vault-800 disabled:text-vault-500 text-white transition-colors"
                >
                  {isImporting ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      <span>Encrypting & Importing...</span>
                    </>
                  ) : (
                    <>
                      <Lock className="h-3.5 w-3.5" />
                      <span>Encrypt & Save {selectedCount} Keys</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
