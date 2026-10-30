'use client';

import React, { useState } from 'react';
import { useVault } from '@/lib/context/vaultContext';
import { calculateSecurityHealth } from '@/lib/securityAudit';
import {
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  X,
  RefreshCw,
  Info,
} from 'lucide-react';

interface SecurityHealthBannerProps {
  onRotateKey: (credentialId: string) => void;
}

export const SecurityHealthBanner: React.FC<SecurityHealthBannerProps> = ({
  onRotateKey,
}) => {
  const { credentials } = useVault();
  const [isModalOpen, setIsModalOpen] = useState(false);

  if (credentials.length === 0) return null;

  const audit = calculateSecurityHealth(credentials);
  const criticalCount = audit.issues.filter((i) => i.severity === 'critical').length;
  const warningCount = audit.issues.filter((i) => i.severity === 'warning').length;

  const gradeColor =
    audit.score >= 90
      ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
      : audit.score >= 70
      ? 'text-amber-400 bg-amber-500/10 border-amber-500/20'
      : 'text-rose-400 bg-rose-500/10 border-rose-500/20';

  return (
    <>
      {/* Sleek inline audit bar */}
      <div className="rounded-xl border border-white/[0.07] bg-[#0D0E14] p-3.5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 shadow-sm hover:border-white/[0.12] transition-colors">
        <div className="flex items-center space-x-3">
          {/* Grade Badge */}
          <div
            className={`h-9 w-9 rounded-lg flex items-center justify-center font-mono font-semibold text-sm border ${gradeColor} flex-shrink-0`}
          >
            {audit.grade}
          </div>

          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-medium text-white tracking-tight">
                Vault Health
              </span>
              <span className="text-[11px] text-zinc-400">Score: {audit.score}/100</span>
            </div>
            <p className="text-xs text-zinc-400">
              {criticalCount > 0 ? (
                <span className="text-rose-400 font-medium">
                  {criticalCount} critical risk{criticalCount > 1 ? 's' : ''} detected
                </span>
              ) : warningCount > 0 ? (
                <span className="text-amber-400 font-medium">
                  {warningCount} key rotation recommendation{warningCount > 1 ? 's' : ''}
                </span>
              ) : (
                <span className="text-emerald-400 font-medium">All credentials fresh & isolated</span>
              )}
              {' '}· {audit.freshCount} fresh, {audit.staleCount} stale (&gt;90d)
            </p>
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-white/[0.04] hover:bg-white/[0.08] text-zinc-200 border border-white/[0.08] transition-colors w-full sm:w-auto justify-center"
        >
          <span>Security report</span>
          <ChevronRight className="h-3.5 w-3.5 text-zinc-400" />
        </button>
      </div>

      {/* Detailed Audit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-2xl bg-[#0D0E14] border border-white/[0.09] rounded-xl shadow-2xl p-6 relative max-h-[85vh] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-white/[0.06]">
              <div className="flex items-center space-x-3">
                <div
                  className={`h-9 w-9 rounded-lg flex items-center justify-center font-mono font-semibold text-sm border ${gradeColor}`}
                >
                  {audit.grade}
                </div>
                <div>
                  <h2 className="text-sm font-semibold text-white tracking-tight">Security Audit Report</h2>
                  <p className="text-xs text-zinc-400">
                    Calculated score: {audit.score}/100 based on key age, isolation, and rotation hygiene
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-white/[0.05] transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Metrics Breakdown row */}
            <div className="grid grid-cols-3 gap-3 my-4">
              <div className="p-3 rounded-lg bg-zinc-950/60 border border-white/[0.06] text-center">
                <p className="text-[11px] text-zinc-400">Fresh Keys</p>
                <p className="text-base font-semibold text-emerald-400 font-mono mt-0.5">{audit.freshCount}</p>
                <span className="text-[10px] text-zinc-500">&lt; 90 days</span>
              </div>

              <div className="p-3 rounded-lg bg-zinc-950/60 border border-white/[0.06] text-center">
                <p className="text-[11px] text-zinc-400">Stale Keys</p>
                <p className="text-base font-semibold text-amber-400 font-mono mt-0.5">{audit.staleCount}</p>
                <span className="text-[10px] text-zinc-500">&gt; 90 days old</span>
              </div>

              <div className="p-3 rounded-lg bg-zinc-950/60 border border-white/[0.06] text-center">
                <p className="text-[11px] text-zinc-400">Cross-Env Leaks</p>
                <p className="text-base font-semibold text-rose-400 font-mono mt-0.5">{audit.reusedCount}</p>
                <span className="text-[10px] text-zinc-500">Shared Secrets</span>
              </div>
            </div>

            {/* List of Detected Issues */}
            <div className="overflow-y-auto flex-1 space-y-2.5 pr-1">
              {audit.issues.length === 0 ? (
                <div className="p-8 text-center bg-zinc-950/40 rounded-xl border border-white/[0.06] space-y-2">
                  <div className="h-9 w-9 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="h-5 w-5" />
                  </div>
                  <h3 className="text-xs font-semibold text-white">No security risks detected</h3>
                  <p className="text-xs text-zinc-400 max-w-sm mx-auto">
                    All stored credentials follow rotation hygiene and have proper environment isolation.
                  </p>
                </div>
              ) : (
                audit.issues.map((issue) => (
                  <div
                    key={issue.id}
                    className={`p-3.5 rounded-lg border ${
                      issue.severity === 'critical'
                        ? 'bg-rose-500/[0.04] border-rose-500/20'
                        : 'bg-amber-500/[0.04] border-amber-500/20'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start space-x-2.5">
                        {issue.severity === 'critical' ? (
                          <ShieldAlert className="h-4 w-4 text-rose-400 flex-shrink-0 mt-0.5" />
                        ) : (
                          <AlertTriangle className="h-4 w-4 text-amber-400 flex-shrink-0 mt-0.5" />
                        )}
                        <div>
                          <h4 className="text-xs font-medium text-white">{issue.title}</h4>
                          <p className="text-xs text-zinc-300 mt-0.5">{issue.description}</p>
                          <p className="text-[11px] text-zinc-400 mt-1 flex items-center space-x-1">
                            <Info className="h-3 w-3 text-zinc-500 flex-shrink-0" />
                            <span>Action: {issue.recommendation}</span>
                          </p>
                        </div>
                      </div>

                      {issue.type === 'stale_key' && (
                        <button
                          onClick={() => {
                            setIsModalOpen(false);
                            onRotateKey(issue.credentialId);
                          }}
                          className="px-2.5 py-1 rounded-md bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 text-xs font-medium flex items-center space-x-1 flex-shrink-0 transition-colors"
                        >
                          <RefreshCw className="h-3 w-3" />
                          <span>Rotate</span>
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            <div className="pt-3.5 border-t border-white/[0.06] flex justify-end">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-3 py-1.5 bg-white/[0.06] hover:bg-white/[0.1] text-white rounded-lg text-xs font-medium transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
