'use client';

import React from 'react';
import { useVault } from '@/lib/context/vaultContext';

export const StatsBar: React.FC = () => {
  const { credentials, projects } = useVault();

  const devCount = credentials.filter((c) => c.environment === 'development').length;
  const stageCount = credentials.filter((c) => c.environment === 'staging').length;
  const prodCount = credentials.filter((c) => c.environment === 'production').length;

  const stats = [
    {
      label: 'Credentials',
      value: String(credentials.length),
    },
    {
      label: 'Projects',
      value: String(projects.length),
    },
    {
      label: 'Environments',
      detail: (
        <div className="flex items-center space-x-1.5 text-xs font-mono">
          <span className="text-sky-400">{devCount} dev</span>
          <span className="text-zinc-600">·</span>
          <span className="text-amber-400">{stageCount} stg</span>
          <span className="text-zinc-600">·</span>
          <span className="text-emerald-400">{prodCount} prod</span>
        </div>
      ),
    },
    {
      label: 'Cryptography',
      detail: (
        <span className="text-xs text-emerald-400/90 font-medium font-mono">
          AES-256-GCM
        </span>
      ),
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-px bg-white/[0.05] rounded-xl overflow-hidden border border-white/[0.07]">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="bg-[#0D0E14] px-4 py-3 flex flex-col justify-center space-y-1"
        >
          <p className="text-[11px] text-zinc-500 font-medium">{stat.label}</p>
          {stat.detail ? (
            stat.detail
          ) : (
            <p className="text-lg font-semibold text-white tracking-tight leading-none font-mono">
              {stat.value}
            </p>
          )}
        </div>
      ))}
    </div>
  );
};
