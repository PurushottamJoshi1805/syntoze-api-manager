export type ProviderType =
  | 'openai'
  | 'anthropic'
  | 'gemini'
  | 'groq'
  | 'nvidia'
  | 'stripe'
  | 'aws'
  | 'github'
  | 'supabase'
  | 'neon'
  | 'resend'
  | 'cloudflare'
  | 'vercel'
  | 'twilio'
  | 'sendgrid'
  | 'firebase'
  | 'mongodb'
  | 'planetscale'
  | 'upstash'
  | 'custom';

export type EnvironmentType = 'development' | 'staging' | 'production';

export interface Project {
  id: string;
  userId: string;
  name: string;
  slug: string;
  description: string | null;
  color: string;
  createdAt: string;
  updatedAt: string;
}

export interface EncryptedPayload {
  ciphertext: string; // Base64 encoded AES-256-GCM ciphertext with auth tag
  iv: string;         // Base64 encoded 12-byte IV
}

export interface StoredCredential {
  id: string;
  userId: string;
  projectId: string | null;
  provider: ProviderType;
  name: string;
  environment: EnvironmentType;
  encryptedCiphertext: string;
  iv: string;
  notes: string | null;
  expiresAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface DecryptedCredential extends StoredCredential {
  plaintextSecret?: string;
  isRevealed?: boolean;
}

export interface VaultSettings {
  id: string;
  userId: string;
  vaultSalt: string;
  keyCheckCiphertext: string;
  keyCheckIv: string;
  recoveryHash: string;
  recoveryEncryptedKey: string;
  recoverySalt: string;
  autoLockMinutes: number;
  createdAt: string;
  updatedAt: string;
}

export interface UserProfile {
  id: string;
  email: string;
  fullName?: string;
  avatarUrl?: string;
}
