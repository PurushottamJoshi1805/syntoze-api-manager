'use client';

import React, { useEffect, useRef } from 'react';
import { useVault } from '@/lib/context/vaultContext';
import { EnvironmentType, ProviderType } from '@/lib/types/vault';
import { PROVIDER_METADATA } from '@/lib/utils';
import { Search, X, ChevronDown } from 'lucide-react';

export const ProjectFilter: React.FC = () => {
  const {
    projects,
    activeProjectId,
    setActiveProjectId,
    activeEnvironment,
    setActiveEnvironment,
    activeProvider,
    setActiveProvider,
    searchQuery,
    setSearchQuery,
  } = useVault();

  const searchInputRef = useRef<HTMLInputElement>(null);

  const environments: { id: EnvironmentType | 'all'; label: string }[] = [
    { id: 'all', label: 'All envs' },
    { id: 'development', label: 'Development' },
    { id: 'staging', label: 'Staging' },
    { id: 'production', label: 'Production' },
  ];

  const hasActiveFilters =
    activeProjectId !== 'all' || activeEnvironment !== 'all' || activeProvider !== 'all' || searchQuery !== '';

  const handleReset = () => {
    setActiveProjectId('all');
    setActiveEnvironment('all');
    setActiveProvider('all');
    setSearchQuery('');
  };

  // Keyboard shortcut: Cmd/Ctrl + K or "/" to focus search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeTag = document.activeElement?.tagName.toLowerCase();
      const isInputFocused = activeTag === 'input' || activeTag === 'textarea' || activeTag === 'select';

      if ((e.key === 'k' && (e.metaKey || e.ctrlKey)) || (e.key === '/' && !isInputFocused)) {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
      if (e.key === 'Escape' && document.activeElement === searchInputRef.current) {
        searchInputRef.current?.blur();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="bg-[#0D0E14] border border-white/[0.07] rounded-xl p-3 space-y-2.5">
      {/* Top row: search + dropdowns */}
      <div className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center">
        <div className="relative flex-1 sm:max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-500" />
          <input
            ref={searchInputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search credentials, providers, notes…"
            className="w-full pl-8 pr-14 py-1.5 bg-zinc-950 border border-white/[0.08] rounded-lg text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500/60 transition-colors"
          />
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center space-x-1">
            {searchQuery ? (
              <button
                onClick={() => setSearchQuery('')}
                className="text-zinc-500 hover:text-zinc-300 p-0.5 transition-colors"
              >
                <X className="h-3 w-3" />
              </button>
            ) : (
              <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono text-zinc-500 bg-white/[0.04] border border-white/[0.06] rounded">
                ⌘K
              </kbd>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Project selector */}
          <div className="relative flex-1 sm:flex-initial">
            <select
              value={activeProjectId}
              onChange={(e) => setActiveProjectId(e.target.value)}
              className="w-full sm:w-40 pl-2.5 pr-7 py-1.5 bg-zinc-950 border border-white/[0.08] rounded-lg text-xs text-zinc-300 focus:outline-none focus:border-indigo-500/60 appearance-none cursor-pointer transition-colors"
            >
              <option value="all">All projects</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-3 w-3 text-zinc-500 pointer-events-none" />
          </div>

          {/* Provider selector */}
          <div className="relative flex-1 sm:flex-initial">
            <select
              value={activeProvider}
              onChange={(e) => setActiveProvider(e.target.value as ProviderType | 'all')}
              className="w-full sm:w-36 pl-2.5 pr-7 py-1.5 bg-zinc-950 border border-white/[0.08] rounded-lg text-xs text-zinc-300 focus:outline-none focus:border-indigo-500/60 appearance-none cursor-pointer transition-colors"
            >
              <option value="all">All providers</option>
              {Object.entries(PROVIDER_METADATA).map(([key, meta]) => (
                <option key={key} value={key}>
                  {meta.name}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-3 w-3 text-zinc-500 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Bottom row: environment tabs + reset */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-white/[0.04]">
        <div className="flex items-center gap-1 bg-zinc-950/60 p-0.5 rounded-lg border border-white/[0.05]">
          {environments.map((env) => (
            <button
              key={env.id}
              onClick={() => setActiveEnvironment(env.id)}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                activeEnvironment === env.id
                  ? 'bg-white/[0.1] text-white shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              {env.label}
            </button>
          ))}
        </div>

        {hasActiveFilters && (
          <button
            onClick={handleReset}
            className="text-xs text-zinc-400 hover:text-zinc-200 flex items-center gap-1 transition-colors"
          >
            <X className="h-3 w-3" />
            <span>Reset filters</span>
          </button>
        )}
      </div>
    </div>
  );
};
