'use client';

import React, { useState } from 'react';
import { useVault } from '@/lib/context/vaultContext';
import { EnvironmentType } from '@/lib/types/vault';
import {
  X,
  FileCode2,
  Copy,
  Check,
  Download,
  AlertTriangle,
} from 'lucide-react';

interface EnvExportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const EnvExportModal: React.FC<EnvExportModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { projects, exportEnvFormat } = useVault();

  const [selectedProjectId, setSelectedProjectId] = useState<string>('all');
  const [selectedEnv, setSelectedEnv] = useState<EnvironmentType>('development');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const envContent = exportEnvFormat(selectedProjectId, selectedEnv);

  const handleCopy = () => {
    navigator.clipboard.writeText(envContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const filename =
      selectedEnv === 'development'
        ? '.env.local'
        : selectedEnv === 'production'
        ? '.env.production'
        : '.env.staging';

    const blob = new Blob([envContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-2xl bg-vault-900 border border-white/[0.08] rounded-xl shadow-sm p-6 relative max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between pb-4 border-b border-white/[0.06]">
          <div className="flex items-center space-x-2.5">
            <div className="h-9 w-9 rounded-lg bg-brand/10 border border-white/[0.06] flex items-center justify-center text-brand">
              <FileCode2 className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">Export .env Configuration</h2>
              <p className="text-[11px] text-vault-400">Decrypted locally in browser memory for deployment</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-vault-400 hover:text-white hover:bg-vault-800 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 my-4">
          <div>
            <label className="block text-[11px] font-medium text-vault-300 mb-1">Target project</label>
            <select
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              className="w-full px-3 py-2 bg-vault-950 border border-white/[0.08] rounded-lg text-xs text-white focus:outline-none focus:border-brand transition-colors"
            >
              <option value="all">All Projects</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-medium text-vault-300 mb-1">Target environment</label>
            <div className="grid grid-cols-3 gap-1 bg-vault-950 p-1 rounded-lg border border-white/[0.08]">
              {(['development', 'staging', 'production'] as EnvironmentType[]).map((env) => (
                <button
                  key={env}
                  type="button"
                  onClick={() => setSelectedEnv(env)}
                  className={`py-1.5 text-[11px] font-medium rounded-md capitalize transition-colors ${
                    selectedEnv === env
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

        <div className="relative flex-1 min-h-[200px] bg-vault-950 border border-white/[0.06] rounded-lg p-4 font-mono text-xs overflow-auto">
          <pre className="text-vault-300 whitespace-pre-wrap">{envContent || '# No keys found for this environment.'}</pre>
        </div>

        <div className="mt-3 p-3 rounded-lg bg-amber-950/20 border border-amber-500/15 text-xs text-amber-300/90 flex items-center space-x-2">
          <AlertTriangle className="h-4 w-4 flex-shrink-0 text-amber-400" />
          <span>
            Always add <code>.env*.local</code> to your <code>.gitignore</code> to prevent committing secrets to GitHub.
          </span>
        </div>

        <div className="flex items-center justify-between pt-4 mt-3 border-t border-white/[0.06]">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-vault-400 hover:text-white rounded-lg hover:bg-vault-800 transition-colors"
          >
            Close
          </button>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleCopy}
              disabled={!envContent}
              className="px-4 py-2 text-xs font-medium bg-vault-800 hover:bg-vault-700 text-white rounded-lg border border-white/[0.06] transition-colors flex items-center space-x-1.5"
            >
              {copied ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
            <button
              onClick={handleDownload}
              disabled={!envContent}
              className="px-4 py-2 text-xs font-medium bg-brand hover:bg-brand-hover text-white rounded-lg transition-colors flex items-center space-x-1.5"
            >
              <Download className="h-4 w-4" />
              <span>Download File</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
