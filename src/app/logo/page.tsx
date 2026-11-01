'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Download, Copy, Check, ShieldCheck, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

export default function LogoAssetPage() {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const assets = [
    {
      title: 'Circular Avatar (Social Profiles)',
      description: 'Optimized for circular avatar crops on X (Twitter), Threads, Instagram, and LinkedIn.',
      src: '/logo-circle.svg',
      dimensions: '512 × 512 px',
      format: 'SVG Vector (Scalable)',
      filename: 'syntoze-avatar-circle.svg',
    },
    {
      title: 'App Icon (Squircle Badge)',
      description: 'Modern rounded squircle icon for app stores, favicon, mobile home screens, and docs.',
      src: '/logo-512.svg',
      dimensions: '512 × 512 px',
      format: 'SVG Vector (Scalable)',
      filename: 'syntoze-app-icon.svg',
    },
    {
      title: 'Horizontal Brand Banner Lockup',
      description: 'Official emblem + SYNTOZE brand typography + AES-256 status pill for banners and readmes.',
      src: '/logo-brand.svg',
      dimensions: '640 × 160 px',
      format: 'SVG Vector (Scalable)',
      filename: 'syntoze-brand-lockup.svg',
    },
    {
      title: 'Minimal Vector Emblem',
      description: 'Clean isometric vault shield glyph for small icons, toolbars, and UI embeds.',
      src: '/logo.svg',
      dimensions: '64 × 64 px (Scalable)',
      format: 'SVG Vector (Scalable)',
      filename: 'syntoze-emblem.svg',
    },
  ];

  const handleCopySvg = async (url: string, index: number) => {
    try {
      const res = await fetch(url);
      const text = await res.text();
      await navigator.clipboard.writeText(text);
      setCopiedIndex(index);
      toast.success('SVG code copied to clipboard!');
      setTimeout(() => setCopiedIndex(null), 2500);
    } catch {
      toast.error('Could not copy SVG code');
    }
  };

  return (
    <div className="min-h-screen bg-[#08090C] text-zinc-100 p-6 sm:p-12 font-sans selection:bg-indigo-500/30 selection:text-white relative overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-indigo-600/[0.08] rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-emerald-600/[0.05] rounded-full blur-[160px] pointer-events-none" />

      <div className="max-w-5xl mx-auto relative z-10 space-y-10">
        {/* Navigation & Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.08] pb-6">
          <Link
            href="/"
            className="inline-flex items-center space-x-2 text-xs font-medium text-zinc-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Vault</span>
          </Link>

          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Official Brand Kit v2.0</span>
          </div>
        </div>

        {/* Title */}
        <div className="space-y-3">
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
            Syntoze Brand &amp; Logo Assets
          </h1>
          <p className="text-sm sm:text-base text-zinc-400 max-w-2xl leading-relaxed">
            Download vector SVG files or copy code for your X company profile (@Syntoze), Threads, Instagram avatar, GitHub READMEs, and marketing banners.
          </p>
        </div>

        {/* Asset Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {assets.map((asset, i) => (
            <div
              key={i}
              className="rounded-2xl border border-white/[0.08] bg-[#0D0E14] p-6 flex flex-col justify-between hover:border-indigo-500/30 transition-all shadow-xl space-y-6"
            >
              {/* Preview Canvas */}
              <div className="w-full h-52 rounded-xl bg-[#050608] border border-white/[0.04] flex items-center justify-center p-6 relative group overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/[0.03] to-transparent pointer-events-none" />
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={asset.src}
                  alt={asset.title}
                  className="max-h-full max-w-full object-contain filter drop-shadow-[0_8px_24px_rgba(99,102,241,0.25)] transition-transform duration-300 group-hover:scale-105"
                />
              </div>

              {/* Metadata */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-white">{asset.title}</h3>
                  <span className="text-[10px] font-mono font-medium text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                    {asset.dimensions}
                  </span>
                </div>
                <p className="text-xs text-zinc-400 leading-relaxed">{asset.description}</p>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3 pt-2">
                <a
                  href={asset.src}
                  download={asset.filename}
                  className="flex-1 inline-flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl bg-white text-zinc-950 hover:bg-zinc-200 text-xs font-semibold transition-all shadow-sm active:scale-[0.98]"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download SVG</span>
                </a>

                <button
                  type="button"
                  onClick={() => handleCopySvg(asset.src, i)}
                  className="inline-flex items-center justify-center space-x-1.5 px-4 py-2.5 rounded-xl bg-zinc-900 border border-white/[0.1] hover:bg-zinc-800 text-zinc-300 hover:text-white text-xs font-medium transition-all"
                >
                  {copiedIndex === i ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400 font-semibold">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-zinc-400" />
                      <span>Copy SVG</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Brand Specs Note */}
        <div className="p-6 rounded-2xl bg-[#0D0E14] border border-white/[0.08] space-y-4">
          <div className="flex items-center space-x-2 text-indigo-400">
            <Sparkles className="w-4 h-4" />
            <h4 className="text-xs font-bold uppercase tracking-wider">Brand Palette &amp; Colors</h4>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono">
            <div className="p-3 rounded-xl bg-[#08090C] border border-white/[0.06] space-y-1">
              <div className="h-4 w-full rounded bg-[#08090C] border border-white/20 mb-2" />
              <p className="text-white font-semibold">Obsidian Base</p>
              <p className="text-zinc-500">#08090C</p>
            </div>
            <div className="p-3 rounded-xl bg-[#08090C] border border-white/[0.06] space-y-1">
              <div className="h-4 w-full rounded bg-[#6366F1] mb-2" />
              <p className="text-white font-semibold">Indigo Primary</p>
              <p className="text-zinc-500">#6366F1</p>
            </div>
            <div className="p-3 rounded-xl bg-[#08090C] border border-white/[0.06] space-y-1">
              <div className="h-4 w-full rounded bg-[#38BDF8] mb-2" />
              <p className="text-white font-semibold">Cyan Quantum</p>
              <p className="text-zinc-500">#38BDF8</p>
            </div>
            <div className="p-3 rounded-xl bg-[#08090C] border border-white/[0.06] space-y-1">
              <div className="h-4 w-full rounded bg-[#10B981] mb-2" />
              <p className="text-white font-semibold">Emerald AES</p>
              <p className="text-zinc-500">#10B981</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

