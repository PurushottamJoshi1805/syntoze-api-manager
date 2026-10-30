import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { ProviderType, EnvironmentType } from './types/vault';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export interface ProviderMeta {
  name: string;
  badgeBg: string;
  badgeText: string;
  border: string;
  placeholder: string;
  docsUrl: string;
}

export const PROVIDER_METADATA: Record<ProviderType, ProviderMeta> = {
  openai: {
    name: 'OpenAI',
    badgeBg: 'bg-emerald-500/[0.08] text-emerald-300',
    badgeText: 'text-emerald-400',
    border: 'border-emerald-500/20',
    placeholder: 'sk-proj-...',
    docsUrl: 'https://platform.openai.com/api-keys',
  },
  anthropic: {
    name: 'Anthropic',
    badgeBg: 'bg-amber-500/[0.08] text-amber-300',
    badgeText: 'text-amber-400',
    border: 'border-amber-500/20',
    placeholder: 'sk-ant-api03-...',
    docsUrl: 'https://console.anthropic.com/settings/keys',
  },
  gemini: {
    name: 'Google Gemini',
    badgeBg: 'bg-blue-500/[0.08] text-blue-300',
    badgeText: 'text-blue-400',
    border: 'border-blue-500/20',
    placeholder: 'AIzaSy...',
    docsUrl: 'https://aistudio.google.com/app/apikey',
  },
  groq: {
    name: 'Groq',
    badgeBg: 'bg-orange-500/[0.08] text-orange-300',
    badgeText: 'text-orange-400',
    border: 'border-orange-500/20',
    placeholder: 'gsk_...',
    docsUrl: 'https://console.groq.com/keys',
  },
  nvidia: {
    name: 'NVIDIA NIM',
    badgeBg: 'bg-lime-500/[0.08] text-lime-300',
    badgeText: 'text-lime-400',
    border: 'border-lime-500/20',
    placeholder: 'nvapi-...',
    docsUrl: 'https://build.nvidia.com',
  },
  stripe: {
    name: 'Stripe',
    badgeBg: 'bg-indigo-500/[0.08] text-indigo-300',
    badgeText: 'text-indigo-400',
    border: 'border-indigo-500/20',
    placeholder: 'sk_live_... / sk_test_...',
    docsUrl: 'https://dashboard.stripe.com/apikeys',
  },
  aws: {
    name: 'AWS',
    badgeBg: 'bg-amber-500/[0.08] text-amber-200',
    badgeText: 'text-amber-300',
    border: 'border-amber-500/20',
    placeholder: 'AKIA... / secret',
    docsUrl: 'https://aws.amazon.com',
  },
  github: {
    name: 'GitHub',
    badgeBg: 'bg-zinc-800/80 text-zinc-200',
    badgeText: 'text-zinc-300',
    border: 'border-white/[0.1]',
    placeholder: 'ghp_...',
    docsUrl: 'https://github.com/settings/tokens',
  },
  supabase: {
    name: 'Supabase',
    badgeBg: 'bg-emerald-500/[0.08] text-emerald-200',
    badgeText: 'text-emerald-300',
    border: 'border-emerald-500/20',
    placeholder: 'sbp_... / service_role',
    docsUrl: 'https://supabase.com/dashboard',
  },
  neon: {
    name: 'Neon',
    badgeBg: 'bg-emerald-500/[0.08] text-emerald-300',
    badgeText: 'text-emerald-400',
    border: 'border-emerald-500/20',
    placeholder: 'postgres://...',
    docsUrl: 'https://console.neon.tech',
  },
  resend: {
    name: 'Resend',
    badgeBg: 'bg-zinc-800/80 text-zinc-200',
    badgeText: 'text-zinc-300',
    border: 'border-white/[0.1]',
    placeholder: 're_...',
    docsUrl: 'https://resend.com/api-keys',
  },
  cloudflare: {
    name: 'Cloudflare',
    badgeBg: 'bg-orange-500/[0.08] text-orange-200',
    badgeText: 'text-orange-300',
    border: 'border-orange-500/20',
    placeholder: 'v1.0-...',
    docsUrl: 'https://dash.cloudflare.com/profile/api-tokens',
  },
  vercel: {
    name: 'Vercel',
    badgeBg: 'bg-zinc-800/80 text-zinc-200',
    badgeText: 'text-zinc-300',
    border: 'border-white/[0.1]',
    placeholder: 'vercel_...',
    docsUrl: 'https://vercel.com/account/tokens',
  },
  twilio: {
    name: 'Twilio',
    badgeBg: 'bg-rose-500/[0.08] text-rose-300',
    badgeText: 'text-rose-400',
    border: 'border-rose-500/20',
    placeholder: 'AC... / auth_token',
    docsUrl: 'https://console.twilio.com',
  },
  sendgrid: {
    name: 'SendGrid',
    badgeBg: 'bg-sky-500/[0.08] text-sky-300',
    badgeText: 'text-sky-400',
    border: 'border-sky-500/20',
    placeholder: 'SG....',
    docsUrl: 'https://app.sendgrid.com/settings/api_keys',
  },
  firebase: {
    name: 'Firebase',
    badgeBg: 'bg-amber-500/[0.08] text-amber-300',
    badgeText: 'text-amber-400',
    border: 'border-amber-500/20',
    placeholder: 'AIzaSy... / service_account.json',
    docsUrl: 'https://console.firebase.google.com',
  },
  mongodb: {
    name: 'MongoDB',
    badgeBg: 'bg-emerald-500/[0.08] text-emerald-300',
    badgeText: 'text-emerald-400',
    border: 'border-emerald-500/20',
    placeholder: 'mongodb+srv://...',
    docsUrl: 'https://cloud.mongodb.com',
  },
  planetscale: {
    name: 'PlanetScale',
    badgeBg: 'bg-zinc-800/80 text-zinc-200',
    badgeText: 'text-zinc-300',
    border: 'border-white/[0.1]',
    placeholder: 'pscale_pw_...',
    docsUrl: 'https://app.planetscale.com',
  },
  upstash: {
    name: 'Upstash',
    badgeBg: 'bg-emerald-500/[0.08] text-emerald-300',
    badgeText: 'text-emerald-400',
    border: 'border-emerald-500/20',
    placeholder: 'rediss://default:...',
    docsUrl: 'https://console.upstash.com',
  },
  custom: {
    name: 'Custom API',
    badgeBg: 'bg-violet-500/[0.08] text-violet-300',
    badgeText: 'text-violet-400',
    border: 'border-violet-500/20',
    placeholder: 'Secret token or connection string...',
    docsUrl: '',
  },
};

export const ENVIRONMENT_METADATA: Record<EnvironmentType, { label: string; badge: string }> = {
  development: {
    label: 'dev',
    badge: 'bg-sky-500/[0.08] text-sky-400 border border-sky-500/20',
  },
  staging: {
    label: 'staging',
    badge: 'bg-amber-500/[0.08] text-amber-400 border border-amber-500/20',
  },
  production: {
    label: 'prod',
    badge: 'bg-emerald-500/[0.08] text-emerald-400 border border-emerald-500/20',
  },
};

export function maskSecret(secret?: string): string {
  if (!secret) return '••••••••••••••••••••••••';
  if (secret.length <= 8) return '••••••••';
  const prefix = secret.slice(0, 6);
  const suffix = secret.slice(-4);
  return `${prefix}••••••••••••••••${suffix}`;
}

export function formatSeconds(totalSeconds: number): string {
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}
