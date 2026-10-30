-- ====================================================================
-- SYNTOZE API MANAGER: PERSONAL API KEY VAULT
-- PostgreSQL Schema with Row Level Security (RLS) for Supabase
-- ====================================================================

-- 1. Vault Security Settings (per user)
-- Stores salt for PBKDF2, encrypted verifier sentinel, and wrapped recovery key
create table if not exists public.vault_settings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade unique not null,
  vault_salt text not null,                  -- Base64 encoded salt for PBKDF2
  key_check_ciphertext text not null,        -- Encrypted sentinel "SYNTOZE_VAULT_VERIFIED_OK"
  key_check_iv text not null,                -- IV for sentinel
  recovery_hash text not null,               -- SHA-256 hash of recovery code
  recovery_encrypted_key text not null,      -- Master key wrapped with recovery key
  recovery_salt text not null,               -- Salt and IV for recovery key
  auto_lock_minutes integer default 15 not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- 2. Projects Table
create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  slug text not null,
  description text,
  color text default '#6366f1',
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- 3. Credentials Table (Encrypted Secrets Only)
create table if not exists public.credentials (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  project_id uuid references public.projects(id) on delete set null,
  provider text not null,                    -- 'openai', 'anthropic', 'gemini', 'stripe', etc.
  name text not null,                        -- e.g. 'OpenAI Production GPT-4 Key'
  environment text not null,                 -- 'development' | 'staging' | 'production'
  encrypted_ciphertext text not null,        -- AES-256-GCM ciphertext (Base64)
  iv text not null,                          -- 12-byte Initialization Vector (Base64)
  notes text,                                -- Non-sensitive usage notes
  expires_at timestamptz,                    -- Optional key expiration date
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- Indexes for lightning fast lookups
create index if not exists idx_credentials_user_id on public.credentials(user_id);
create index if not exists idx_credentials_project_id on public.credentials(project_id);
create index if not exists idx_credentials_environment on public.credentials(environment);
create index if not exists idx_projects_user_id on public.projects(user_id);

-- Enable Row Level Security (RLS) on all tables
alter table public.vault_settings enable row level security;
alter table public.projects enable row level security;
alter table public.credentials enable row level security;

-- Strict Row Level Security Policies (Enforces auth.uid() = user_id)
create policy "Users can only read and manage their own vault settings"
  on public.vault_settings for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can only read and manage their own projects"
  on public.projects for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can only read and manage their own credentials"
  on public.credentials for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

