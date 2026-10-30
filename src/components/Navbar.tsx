'use client';

import React, { useState } from 'react';
import { useVault } from '@/lib/context/vaultContext';
import { formatSeconds } from '@/lib/utils';
import {
  Lock,
  Plus,
  FileDown,
  FileUp,
  KeyRound,
  LogOut,
  User,
  ChevronDown,
} from 'lucide-react';

interface NavbarProps {
  onOpenNewModal: () => void;
  onOpenEnvExport: () => void;
  onOpenEnvImport: () => void;
  onOpenRecovery: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenNewModal,
  onOpenEnvExport,
  onOpenEnvImport,
  onOpenRecovery,
}) => {
  const { isLocked, isVaultConfigured, lockVault, secondsUntilLock, user, signOut } = useVault();
  const [showUserMenu, setShowUserMenu] = useState(false);

  return (
    <header className="sticky top-0 z-30 border-b border-white/[0.06] bg-[#0a0a0f]/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center space-x-3">
          <div className="h-8 w-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="text-indigo-400">
              <path
                d="M8 1L2 4.5V11.5L8 15L14 11.5V4.5L8 1Z"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinejoin="round"
              />
              <path
                d="M8 5.5L5 7.25V10.75L8 12.5L11 10.75V7.25L8 5.5Z"
                fill="currentColor"
                opacity="0.3"
                stroke="currentColor"
                strokeWidth="1"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-[15px] font-semibold text-white/90 tracking-[-0.01em]">
                Syntoze
              </span>
              <span className="text-[11px] px-1.5 py-0.5 rounded-md bg-white/[0.04] border border-white/[0.06] text-white/40 font-medium">
                vault
              </span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center space-x-2">
          {isVaultConfigured && !isLocked && (
            <>
              {/* Auto-lock countdown */}
              <div
                title="Vault will auto-lock after inactivity"
                className={`hidden md:flex items-center space-x-1.5 px-2.5 py-1 rounded-lg text-[11px] border transition-colors ${
                  secondsUntilLock < 120
                    ? 'border-rose-500/20 bg-rose-500/[0.06] text-rose-300/80'
                    : 'border-white/[0.06] bg-white/[0.02] text-white/40'
                }`}
              >
                <span
                  className={`h-1.5 w-1.5 rounded-full ${
                    secondsUntilLock < 120 ? 'bg-rose-400' : 'bg-emerald-400/70'
                  }`}
                />
                <span className="font-mono text-[11px]">{formatSeconds(secondsUntilLock)}</span>
              </div>

              <div className="hidden sm:block h-4 w-px bg-white/[0.06] mx-1" />

              <button
                onClick={lockVault}
                className="inline-flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg text-[12px] font-medium text-white/50 hover:text-white/80 hover:bg-white/[0.04] border border-transparent hover:border-white/[0.06] transition-all duration-150"
              >
                <Lock className="h-3.5 w-3.5" />
                <span>Lock</span>
              </button>

              <button
                onClick={onOpenEnvImport}
                className="inline-flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg text-[12px] font-medium text-white/50 hover:text-white/80 hover:bg-white/[0.04] border border-transparent hover:border-white/[0.06] transition-all duration-150"
                title="Import .env file"
              >
                <FileUp className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Import</span>
              </button>

              <button
                onClick={onOpenEnvExport}
                className="inline-flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg text-[12px] font-medium text-white/50 hover:text-white/80 hover:bg-white/[0.04] border border-transparent hover:border-white/[0.06] transition-all duration-150"
              >
                <FileDown className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Export</span>
              </button>

              <button
                onClick={onOpenRecovery}
                className="inline-flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg text-[12px] font-medium text-white/50 hover:text-white/80 hover:bg-white/[0.04] border border-transparent hover:border-white/[0.06] transition-all duration-150"
              >
                <KeyRound className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Recovery</span>
              </button>

              <div className="hidden sm:block h-4 w-px bg-white/[0.06] mx-1" />

              <button
                onClick={onOpenNewModal}
                className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-[12px] font-medium bg-indigo-500 hover:bg-indigo-400 text-white shadow-sm transition-colors duration-150"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Add key</span>
              </button>
            </>
          )}

          {isVaultConfigured && isLocked && (
            <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-amber-500/[0.06] border border-amber-500/10 text-amber-300/70 text-[12px]">
              <Lock className="h-3 w-3" />
              <span>Locked</span>
            </div>
          )}

          {/* User menu */}
          {user && (
            <div className="relative ml-1">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center space-x-1.5 px-1.5 py-1 rounded-lg hover:bg-white/[0.04] transition-colors duration-150"
              >
                {user.avatarUrl ? (
                  <img
                    src={user.avatarUrl}
                    alt={user.fullName || user.email}
                    className="h-6 w-6 rounded-full border border-white/[0.08]"
                  />
                ) : (
                  <div className="h-6 w-6 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
                    <User className="h-3 w-3 text-indigo-400" />
                  </div>
                )}
                <ChevronDown className="h-3 w-3 text-white/30" />
              </button>

              {showUserMenu && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowUserMenu(false)} />
                  <div className="absolute right-0 top-9 z-50 w-52 rounded-xl bg-[#111118] border border-white/[0.08] shadow-lg shadow-black/40 py-1">
                    <div className="px-3 py-2.5 border-b border-white/[0.06]">
                      <p className="text-[13px] font-medium text-white/90 truncate">
                        {user.fullName || 'Developer'}
                      </p>
                      <p className="text-[11px] text-white/35 truncate mt-0.5">{user.email}</p>
                    </div>
                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        signOut();
                      }}
                      className="w-full px-3 py-2 text-left text-[12px] text-white/50 hover:text-white/80 hover:bg-white/[0.04] flex items-center space-x-2 transition-colors duration-150"
                    >
                      <LogOut className="h-3.5 w-3.5" />
                      <span>Sign out</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
