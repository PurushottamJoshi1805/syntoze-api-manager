import { ProviderType } from './types/vault';

export interface ParsedEnvItem {
  id: string;
  keyName: string;
  secretValue: string;
  provider: ProviderType;
  suggestedName: string;
  selected: boolean;
  comment?: string;
}

/**
 * Intelligent detector that inspects both key name (e.g. OPENAI_API_KEY)
 * and token prefix (e.g. sk-proj-, sk_live_, gsk_) to assign the provider.
 */
export function detectProvider(keyName: string, value: string): ProviderType {
  const upperKey = keyName.toUpperCase();
  const trimmedVal = value.trim();

  // 1. Anthropic Claude
  if (upperKey.includes('ANTHROPIC') || upperKey.includes('CLAUDE') || trimmedVal.startsWith('sk-ant-')) {
    return 'anthropic';
  }

  // 2. OpenAI
  if (
    upperKey.includes('OPENAI') ||
    trimmedVal.startsWith('sk-proj-') ||
    (trimmedVal.startsWith('sk-') && !trimmedVal.startsWith('sk-ant-') && !trimmedVal.startsWith('sk_'))
  ) {
    return 'openai';
  }

  // 3. Groq
  if (upperKey.includes('GROQ') || trimmedVal.startsWith('gsk_')) {
    return 'groq';
  }

  // 4. Google Gemini / AI Studio
  if (upperKey.includes('GEMINI') || upperKey.includes('GOOGLE_AI') || (upperKey.includes('GOOGLE') && upperKey.includes('KEY')) || trimmedVal.startsWith('AIzaSy')) {
    return 'gemini';
  }

  // 5. NVIDIA NIM
  if (upperKey.includes('NVIDIA') || upperKey.includes('NVAPI') || trimmedVal.startsWith('nvapi-')) {
    return 'nvidia';
  }

  // 6. Stripe
  if (
    upperKey.includes('STRIPE') ||
    trimmedVal.startsWith('sk_live_') ||
    trimmedVal.startsWith('sk_test_') ||
    trimmedVal.startsWith('rk_live_') ||
    trimmedVal.startsWith('rk_test_') ||
    trimmedVal.startsWith('whsec_')
  ) {
    return 'stripe';
  }

  // 7. GitHub
  if (
    upperKey.includes('GITHUB') ||
    upperKey.includes('GH_TOKEN') ||
    upperKey.includes('GH_PAT') ||
    trimmedVal.startsWith('ghp_') ||
    trimmedVal.startsWith('gho_') ||
    trimmedVal.startsWith('github_pat_')
  ) {
    return 'github';
  }

  // 8. AWS
  if (upperKey.includes('AWS') || trimmedVal.startsWith('AKIA') || trimmedVal.startsWith('ASIA')) {
    return 'aws';
  }

  // 9. Supabase
  if (upperKey.includes('SUPABASE') || trimmedVal.startsWith('sbp_')) {
    return 'supabase';
  }

  // 10. Neon Postgres
  if (upperKey.includes('NEON') || trimmedVal.includes('neon.tech')) {
    return 'neon';
  }

  // 11. Resend
  if (upperKey.includes('RESEND') || trimmedVal.startsWith('re_')) {
    return 'resend';
  }

  // 12. Cloudflare
  if (upperKey.includes('CLOUDFLARE') || upperKey.includes('CF_TOKEN')) {
    return 'cloudflare';
  }

  // 13. Vercel
  if (upperKey.includes('VERCEL')) {
    return 'vercel';
  }

  // 14. Twilio
  if (upperKey.includes('TWILIO') || (trimmedVal.startsWith('AC') && trimmedVal.length === 34)) {
    return 'twilio';
  }

  // 15. SendGrid
  if (upperKey.includes('SENDGRID') || trimmedVal.startsWith('SG.')) {
    return 'sendgrid';
  }

  // 16. Firebase
  if (upperKey.includes('FIREBASE')) {
    return 'firebase';
  }

  // 17. MongoDB
  if (upperKey.includes('MONGO') || trimmedVal.startsWith('mongodb://') || trimmedVal.startsWith('mongodb+srv://')) {
    return 'mongodb';
  }

  // 18. PlanetScale
  if (upperKey.includes('PLANETSCALE') || trimmedVal.startsWith('pscale_pw_')) {
    return 'planetscale';
  }

  // 19. Upstash Redis
  if (upperKey.includes('UPSTASH') || trimmedVal.startsWith('rediss://')) {
    return 'upstash';
  }

  return 'custom';
}

/**
 * Format a raw variable name like "OPENAI_API_KEY" into "OpenAI API Key"
 */
export function formatVarLabel(keyName: string): string {
  const parts = keyName.split(/[_-]+/);
  return parts
    .map((p) => {
      const up = p.toUpperCase();
      if (['API', 'URL', 'DB', 'AWS', 'ID', 'AI', 'UI', 'JWT', 'PAT', 'KMS', 'NIM'].includes(up)) {
        return up;
      }
      return p.charAt(0).toUpperCase() + p.slice(1).toLowerCase();
    })
    .join(' ');
}

/**
 * Parse .env formatted raw string into clean, structured items
 */
export function parseEnvContent(rawText: string): ParsedEnvItem[] {
  const lines = rawText.split(/\r?\n/);
  const items: ParsedEnvItem[] = [];
  let pendingComment = '';

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    // Skip empty lines
    if (!line) {
      pendingComment = '';
      continue;
    }

    // Capture comments
    if (line.startsWith('#')) {
      const commentText = line.replace(/^#+\s*/, '').trim();
      pendingComment = pendingComment ? `${pendingComment} | ${commentText}` : commentText;
      continue;
    }

    // Match KEY=VALUE (supports optional "export KEY=VALUE")
    const match = line.match(/^(?:export\s+)?([A-Za-z0-9_.-]+)\s*=\s*(.*)$/);
    if (!match) continue;

    const keyName = match[1].trim();
    let secretValue = match[2].trim();

    // Strip surrounding matching quotes ("...", '...', `...`)
    if (
      (secretValue.startsWith('"') && secretValue.endsWith('"')) ||
      (secretValue.startsWith("'") && secretValue.endsWith("'")) ||
      (secretValue.startsWith('`') && secretValue.endsWith('`'))
    ) {
      secretValue = secretValue.slice(1, -1);
    }

    // Remove inline comments if unquoted (e.g., FOO=bar # inline comment)
    // Only if not an inline quoted string
    if (!secretValue.includes('"') && !secretValue.includes("'")) {
      const hashIndex = secretValue.indexOf('#');
      if (hashIndex > -1) {
        secretValue = secretValue.slice(0, hashIndex).trim();
      }
    }

    if (!keyName || !secretValue) continue;

    const provider = detectProvider(keyName, secretValue);
    const suggestedName = formatVarLabel(keyName);

    items.push({
      id: `parsed-${i}-${Math.random().toString(36).substring(2, 6)}`,
      keyName,
      secretValue,
      provider,
      suggestedName,
      selected: true,
      comment: pendingComment || undefined,
    });

    pendingComment = '';
  }

  return items;
}

