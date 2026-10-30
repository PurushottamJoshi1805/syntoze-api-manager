import { createClient } from './client';

// ============================================================
// VAULT SETTINGS
// ============================================================

export interface DbVaultSettings {
  id: string;
  user_id: string;
  vault_salt: string;
  key_check_ciphertext: string;
  key_check_iv: string;
  recovery_hash: string;
  recovery_encrypted_key: string;
  recovery_salt: string;
  auto_lock_minutes: number;
  created_at: string;
  updated_at: string;
}

export async function getVaultSettings(): Promise<DbVaultSettings | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('vault_settings')
    .select('*')
    .single();

  if (error || !data) return null;
  return data as DbVaultSettings;
}

export async function upsertVaultSettings(settings: Omit<DbVaultSettings, 'id' | 'created_at' | 'updated_at'>): Promise<DbVaultSettings | null> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('vault_settings')
    .upsert(
      { ...settings, user_id: user.id, updated_at: new Date().toISOString() },
      { onConflict: 'user_id' }
    )
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data as DbVaultSettings;
}

// ============================================================
// PROJECTS
// ============================================================

export interface DbProject {
  id: string;
  user_id: string;
  name: string;
  slug: string;
  description: string | null;
  color: string;
  created_at: string;
  updated_at: string;
}

export async function getProjects(): Promise<DbProject[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .order('created_at', { ascending: true });

  if (error) throw new Error(error.message);
  return (data || []) as DbProject[];
}

export async function createProject(project: { name: string; slug: string; description?: string; color?: string }): Promise<DbProject> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('projects')
    .insert({
      user_id: user.id,
      name: project.name,
      slug: project.slug,
      description: project.description || null,
      color: project.color || '#6366f1',
    })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data as DbProject;
}

export async function updateProject(id: string, updates: Partial<{ name: string; slug: string; description: string; color: string }>): Promise<DbProject> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('projects')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data as DbProject;
}

export async function deleteProject(id: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.from('projects').delete().eq('id', id);
  if (error) throw new Error(error.message);
}

// ============================================================
// CREDENTIALS (ENCRYPTED ONLY — NO PLAINTEXT EVER TOUCHES DB)
// ============================================================

export interface DbCredential {
  id: string;
  user_id: string;
  project_id: string | null;
  provider: string;
  name: string;
  environment: string;
  encrypted_ciphertext: string;
  iv: string;
  notes: string | null;
  expires_at: string | null;
  created_at: string;
  updated_at: string;
}

export async function getCredentials(): Promise<DbCredential[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('credentials')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw new Error(error.message);
  return (data || []) as DbCredential[];
}

export async function createCredential(cred: {
  project_id: string | null;
  provider: string;
  name: string;
  environment: string;
  encrypted_ciphertext: string;
  iv: string;
  notes?: string;
  expires_at?: string;
}): Promise<DbCredential> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('credentials')
    .insert({
      user_id: user.id,
      project_id: cred.project_id,
      provider: cred.provider,
      name: cred.name,
      environment: cred.environment,
      encrypted_ciphertext: cred.encrypted_ciphertext,
      iv: cred.iv,
      notes: cred.notes || null,
      expires_at: cred.expires_at || null,
    })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data as DbCredential;
}

export async function createCredentialsBatch(creds: Array<{
  project_id: string | null;
  provider: string;
  name: string;
  environment: string;
  encrypted_ciphertext: string;
  iv: string;
  notes?: string;
  expires_at?: string;
}>): Promise<DbCredential[]> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const rows = creds.map((cred) => ({
    user_id: user.id,
    project_id: cred.project_id,
    provider: cred.provider,
    name: cred.name,
    environment: cred.environment,
    encrypted_ciphertext: cred.encrypted_ciphertext,
    iv: cred.iv,
    notes: cred.notes || null,
    expires_at: cred.expires_at || null,
  }));

  const { data, error } = await supabase
    .from('credentials')
    .insert(rows)
    .select();

  if (error) throw new Error(error.message);
  return (data || []) as DbCredential[];
}

export async function updateCredential(id: string, updates: Partial<{
  project_id: string | null;
  provider: string;
  name: string;
  environment: string;
  encrypted_ciphertext: string;
  iv: string;
  notes: string;
  expires_at: string;
}>): Promise<DbCredential> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('credentials')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data as DbCredential;
}

export async function deleteCredential(id: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.from('credentials').delete().eq('id', id);
  if (error) throw new Error(error.message);
}

export async function deleteAllCredentials(): Promise<void> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { error } = await supabase.from('credentials').delete().eq('user_id', user.id);
  if (error) throw new Error(error.message);
}

export async function updateVaultAutoLockMinutes(minutes: number): Promise<void> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { error } = await supabase
    .from('vault_settings')
    .update({ auto_lock_minutes: minutes, updated_at: new Date().toISOString() })
    .eq('user_id', user.id);
  if (error) throw new Error(error.message);
}

// ============================================================
// SUBSCRIPTIONS (CASHFREE PG)
// ============================================================

export interface DbSubscription {
  id: string;
  user_id: string;
  plan: 'free' | 'pro' | 'team';
  billing_cycle: 'monthly' | 'yearly' | 'lifetime';
  status: 'active' | 'cancelled' | 'expired';
  order_id: string | null;
  payment_id: string | null;
  amount: number | null;
  currency: string;
  expires_at: string | null;
  created_at: string;
  updated_at: string;
}

export async function getUserSubscription(): Promise<DbSubscription | null> {
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return null;

    const { data, error } = await supabase
      .from('user_subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .maybeSingle();

    if (error || !data) return null;
    return data as DbSubscription;
  } catch {
    return null;
  }
}

export async function upsertUserSubscription(
  sub: Omit<DbSubscription, 'id' | 'created_at' | 'updated_at'>
): Promise<DbSubscription | null> {
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user || user.id !== sub.user_id) {
      console.error('Unauthorized subscription upsert attempt.');
      return null;
    }

    const { data, error } = await supabase
      .from('user_subscriptions')
      .upsert(
        { ...sub, user_id: user.id, updated_at: new Date().toISOString() },
        { onConflict: 'user_id' }
      )
      .select()
      .single();

    if (error) {
      console.error('Error upserting subscription:', error.message);
      return null;
    }
    return data as DbSubscription;
  } catch {
    return null;
  }
}


