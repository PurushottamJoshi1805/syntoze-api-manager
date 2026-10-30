'use client';

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
} from 'react';
import { toast } from 'sonner';
import {
  Project,
  StoredCredential,
  DecryptedCredential,
  VaultSettings,
  UserProfile,
  ProviderType,
  EnvironmentType,
  UserSubscription,
} from '../types/vault';
import {
  generateRecoveryCode,
  setupVault,
  unlockVault as cryptoUnlock,
  unlockWithRecovery as cryptoRecoveryUnlock,
  encryptString,
  decryptString,
  generateSalt,
  deriveKeyFromPassphrase,
  sha256Hash,
  bufferToBase64,
} from '../crypto/vaultCrypto';
import {
  getVaultSettings,
  upsertVaultSettings,
  getProjects,
  createProject as dbCreateProject,
  updateProject as dbUpdateProject,
  deleteProject as dbDeleteProject,
  getCredentials,
  createCredential as dbCreateCredential,
  createCredentialsBatch as dbCreateCredentialsBatch,
  updateCredential as dbUpdateCredential,
  deleteCredential as dbDeleteCredential,
  deleteAllCredentials as dbDeleteAllCredentials,
  updateVaultAutoLockMinutes as dbUpdateVaultAutoLockMinutes,
  getUserSubscription,
  activateProSubscription,
} from '../supabase/database';
import { createClient } from '../supabase/client';
import { formatSeconds } from '../utils';

// ============================================================
// CONTEXT TYPES
// ============================================================

interface VaultContextType {
  // State
  isReady: boolean;
  isVaultConfigured: boolean;
  isLocked: boolean;
  user: UserProfile | null;
  vaultSettings: VaultSettings | null;
  projects: Project[];
  credentials: DecryptedCredential[];
  autoLockMinutes: number;
  secondsUntilLock: number;

  // Filters
  activeProjectId: string;
  activeEnvironment: EnvironmentType | 'all';
  activeProvider: ProviderType | 'all';
  searchQuery: string;

  // Auth
  signOut: () => Promise<void>;

  // Vault lifecycle
  initializeVault: (
    passphrase: string,
    autoLockMinutes?: number
  ) => Promise<{ recoveryCode: string }>;
  unlockVault: (passphrase: string) => Promise<{ success: boolean; error?: string }>;
  unlockWithRecovery: (code: string) => Promise<{ success: boolean; error?: string }>;
  lockVault: () => void;
  resetVault: () => Promise<void>;

  // Credentials CRUD
  addCredential: (data: {
    projectId: string | null;
    provider: ProviderType;
    name: string;
    environment: EnvironmentType;
    secret: string;
    notes?: string;
    expiresAt?: string;
  }) => Promise<void>;
  batchAddCredentials: (items: Array<{
    projectId: string | null;
    provider: ProviderType;
    name: string;
    environment: EnvironmentType;
    secret: string;
    notes?: string;
  }>) => Promise<number>;
  updateCredential: (
    id: string,
    data: Partial<{
      projectId: string | null;
      provider: ProviderType;
      name: string;
      environment: EnvironmentType;
      secret?: string;
      notes?: string;
      expiresAt?: string;
    }>
  ) => Promise<void>;
  deleteCredential: (id: string) => Promise<void>;
  toggleRevealSecret: (id: string) => void;

  // Projects
  addProject: (name: string, description?: string, color?: string) => Promise<void>;
  updateProject: (id: string, updates: { name?: string; description?: string; color?: string }) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;

  // Export & Backup
  exportEnvFormat: (projectId: string, environment: EnvironmentType) => string;
  exportEncryptedBackup: () => void;

  // Filters
  setActiveProjectId: (id: string) => void;
  setActiveEnvironment: (env: EnvironmentType | 'all') => void;
  setActiveProvider: (prov: ProviderType | 'all') => void;
  setSearchQuery: (q: string) => void;

  // Refresh
  refreshData: () => Promise<void>;

  // Settings & Security Preferences
  isSettingsOpen: boolean;
  openSettings: () => void;
  closeSettings: () => void;
  updateAutoLockMinutes: (minutes: number) => Promise<boolean>;
  changeMasterPassphrase: (
    currentPass: string,
    newPass: string
  ) => Promise<{ success: boolean; newRecoveryCode?: string; error?: string }>;
  regenerateRecoveryKit: () => Promise<{ recoveryCode: string }>;
  purgeAllCredentials: () => Promise<void>;
  clipboardClearSeconds: number;
  setClipboardClearSeconds: (secs: number) => void;
  copyToClipboardSecure: (text: string, label?: string) => Promise<void>;

  // Subscription & Pro Status
  userSubscription: UserSubscription | null;
  isPro: boolean;
  keyLimit: number;
  isPricingOpen: boolean;
  openPricingModal: () => void;
  closePricingModal: () => void;
  refreshSubscription: () => Promise<void>;
  activateProPlan: (billingCycle?: 'monthly' | 'lifetime', orderId?: string) => Promise<boolean>;
}

const VaultContext = createContext<VaultContextType | undefined>(undefined);

// ============================================================
// PROVIDER
// ============================================================

export function VaultProvider({ children }: { children: React.ReactNode }) {
  const [isReady, setIsReady] = useState(false);
  const [isVaultConfigured, setIsVaultConfigured] = useState(false);
  const [isLocked, setIsLocked] = useState(true);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [vaultSettings, setVaultSettings] = useState<VaultSettings | null>(null);

  const masterKeyRef = useRef<CryptoKey | null>(null);

  const [projects, setProjects] = useState<Project[]>([]);
  const [storedCredentials, setStoredCredentials] = useState<StoredCredential[]>([]);
  const [credentials, setCredentials] = useState<DecryptedCredential[]>([]);

  // Subscription (Cashfree PG)
  const [userSubscription, setUserSubscription] = useState<UserSubscription | null>(null);
  const [isPricingOpen, setIsPricingOpen] = useState(false);

  // Settings modal
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const openSettings = useCallback(() => setIsSettingsOpen(true), []);
  const closeSettings = useCallback(() => setIsSettingsOpen(false), []);

  // Clipboard security
  const [clipboardClearSeconds, setClipboardClearSecondsState] = useState<number>(30);
  const clipboardTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('syntoze_clipboard_clear_seconds');
      if (saved !== null) {
        setClipboardClearSecondsState(parseInt(saved, 10));
      }
    }
  }, []);

  const setClipboardClearSeconds = useCallback((secs: number) => {
    setClipboardClearSecondsState(secs);
    if (typeof window !== 'undefined') {
      localStorage.setItem('syntoze_clipboard_clear_seconds', secs.toString());
    }
  }, []);

  const copyToClipboardSecure = useCallback(
    async (text: string, label = 'Secret') => {
      try {
        await navigator.clipboard.writeText(text);

        if (clipboardClearSeconds > 0) {
          if (clipboardTimeoutRef.current) {
            clearTimeout(clipboardTimeoutRef.current);
          }

          toast.success(`${label} copied to clipboard`, {
            description: `Auto-clearing clipboard in ${clipboardClearSeconds}s for security.`,
            duration: 3500,
          });

          clipboardTimeoutRef.current = setTimeout(async () => {
            try {
              const currentClip = await navigator.clipboard.readText();
              if (currentClip === text) {
                await navigator.clipboard.writeText('');
                toast.info('Clipboard cleared for security');
              }
            } catch {
              // Browser permission check fallback
            }
          }, clipboardClearSeconds * 1000);
        } else {
          toast.success(`${label} copied to clipboard`);
        }
      } catch {
        toast.error('Failed to copy to clipboard');
      }
    },
    [clipboardClearSeconds]
  );

  const isPro = userSubscription?.plan === 'pro' || userSubscription?.plan === 'team';
  const keyLimit = isPro ? Infinity : 15;

  const openPricingModal = useCallback(() => setIsPricingOpen(true), []);
  const closePricingModal = useCallback(() => setIsPricingOpen(false), []);

  const refreshSubscription = useCallback(async () => {
    try {
      const sub = await getUserSubscription();
      if (sub) {
        setUserSubscription({
          id: sub.id,
          userId: sub.user_id,
          plan: sub.plan,
          billingCycle: sub.billing_cycle,
          status: sub.status,
          orderId: sub.order_id || undefined,
          paymentId: sub.payment_id || undefined,
          amount: sub.amount ? Number(sub.amount) : undefined,
          currency: sub.currency,
          expiresAt: sub.expires_at,
          createdAt: sub.created_at,
          updatedAt: sub.updated_at,
        });
      }
    } catch {
      // Safe fallback
    }
  }, []);

  const activateProPlan = useCallback(
    async (billingCycle: 'monthly' | 'lifetime' = 'monthly', orderId?: string) => {
      try {
        const ok = await activateProSubscription(billingCycle, orderId);
        if (ok) {
          await refreshSubscription();
          toast.success('Syntoze Pro activated! Unlimited credentials unlocked.');
          return true;
        } else {
          toast.error('Failed to sync Pro status with database.');
          return false;
        }
      } catch (err: any) {
        toast.error(err?.message || 'Error activating Pro plan');
        return false;
      }
    },
    [refreshSubscription]
  );

  // Filters
  const [activeProjectId, setActiveProjectId] = useState('all');
  const [activeEnvironment, setActiveEnvironment] = useState<EnvironmentType | 'all'>('all');
  const [activeProvider, setActiveProvider] = useState<ProviderType | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Auto-lock
  const [autoLockMinutes, setAutoLockMinutes] = useState(15);
  const [secondsUntilLock, setSecondsUntilLock] = useState(15 * 60);
  const lastActiveRef = useRef<number>(Date.now());

  // ----------------------------------------------------------
  // INIT: Load user, vault settings, projects, credentials
  // ----------------------------------------------------------
  useEffect(() => {
    let cancelled = false;

    // Safety timeout to ensure isReady is never stuck indefinitely
    const safetyTimer = setTimeout(() => {
      if (!cancelled) {
        setIsReady(true);
      }
    }, 3500);

    async function init() {
      try {
        const supabase = createClient();
        const {
          data: { user: authUser },
        } = await supabase.auth.getUser();

        if (!authUser || cancelled) {
          setIsReady(true);
          return;
        }

        setUser({
          id: authUser.id,
          email: authUser.email || '',
          fullName: authUser.user_metadata?.full_name || authUser.user_metadata?.name,
          avatarUrl: authUser.user_metadata?.avatar_url,
        });

        // Load vault settings
        const settings = await getVaultSettings();
        if (settings) {
          const mapped: VaultSettings = {
            id: settings.id,
            userId: settings.user_id,
            vaultSalt: settings.vault_salt,
            keyCheckCiphertext: settings.key_check_ciphertext,
            keyCheckIv: settings.key_check_iv,
            recoveryHash: settings.recovery_hash,
            recoveryEncryptedKey: settings.recovery_encrypted_key,
            recoverySalt: settings.recovery_salt,
            autoLockMinutes: settings.auto_lock_minutes,
            createdAt: settings.created_at,
            updatedAt: settings.updated_at,
          };
          setVaultSettings(mapped);
          setIsVaultConfigured(true);
          setAutoLockMinutes(mapped.autoLockMinutes);
          setSecondsUntilLock(mapped.autoLockMinutes * 60);
        }

        // Load projects
        const dbProjects = await getProjects();
        setProjects(
          dbProjects.map((p) => ({
            id: p.id,
            userId: p.user_id,
            name: p.name,
            slug: p.slug,
            description: p.description,
            color: p.color,
            createdAt: p.created_at,
            updatedAt: p.updated_at,
          }))
        );

        // Load encrypted credentials
        const dbCreds = await getCredentials();
        const mapped: StoredCredential[] = dbCreds.map((c) => ({
          id: c.id,
          userId: c.user_id,
          projectId: c.project_id,
          provider: c.provider as ProviderType,
          name: c.name,
          environment: c.environment as EnvironmentType,
          encryptedCiphertext: c.encrypted_ciphertext,
          iv: c.iv,
          notes: c.notes,
          expiresAt: c.expires_at,
          createdAt: c.created_at,
          updatedAt: c.updated_at,
        }));
        setStoredCredentials(mapped);
        // Credentials stay encrypted in state until vault is unlocked
        setCredentials(
          mapped.map((c) => ({ ...c, plaintextSecret: undefined, isRevealed: false }))
        );

        // Load user subscription (Cashfree PG)
        try {
          const sub = await getUserSubscription();
          if (sub) {
            setUserSubscription({
              id: sub.id,
              userId: sub.user_id,
              plan: sub.plan,
              billingCycle: sub.billing_cycle,
              status: sub.status,
              orderId: sub.order_id || undefined,
              paymentId: sub.payment_id || undefined,
              amount: sub.amount ? Number(sub.amount) : undefined,
              currency: sub.currency,
              expiresAt: sub.expires_at,
              createdAt: sub.created_at,
              updatedAt: sub.updated_at,
            });
          }
        } catch {
          // If subscription table not yet set up, default to free
        }
      } catch (err) {
        console.error('Vault init error:', err);
      } finally {
        clearTimeout(safetyTimer);
        if (!cancelled) setIsReady(true);
      }
    }

    init();
    return () => {
      cancelled = true;
      clearTimeout(safetyTimer);
    };
  }, []);

  // ----------------------------------------------------------
  // AUTH STATE LISTENER
  // ----------------------------------------------------------
  useEffect(() => {
    const supabase = createClient();
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session?.user) {
        setUser(null);
        lockVaultInternal();
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  // ----------------------------------------------------------
  // DECRYPT ALL CREDENTIALS
  // ----------------------------------------------------------
  const decryptAllCredentials = useCallback(
    async (creds: StoredCredential[], key: CryptoKey): Promise<DecryptedCredential[]> => {
      const results: DecryptedCredential[] = [];
      for (const cred of creds) {
        try {
          const plaintext = await decryptString(
            { ciphertext: cred.encryptedCiphertext, iv: cred.iv },
            key
          );
          results.push({ ...cred, plaintextSecret: plaintext, isRevealed: false });
        } catch {
          results.push({ ...cred, plaintextSecret: '[Decryption Error]', isRevealed: false });
        }
      }
      return results;
    },
    []
  );

  // ----------------------------------------------------------
  // LOCK / UNLOCK
  // ----------------------------------------------------------
  const lockVaultInternal = useCallback(() => {
    masterKeyRef.current = null;
    setIsLocked(true);
    setCredentials((prev) =>
      prev.map((c) => ({ ...c, plaintextSecret: undefined, isRevealed: false }))
    );
  }, []);

  const lockVault = useCallback(() => {
    lockVaultInternal();
  }, [lockVaultInternal]);

  const recordActivity = useCallback(() => {
    lastActiveRef.current = Date.now();
    setSecondsUntilLock(autoLockMinutes * 60);
  }, [autoLockMinutes]);

  // Auto-lock timer
  useEffect(() => {
    if (isLocked) return;

    const handle = () => recordActivity();
    window.addEventListener('mousemove', handle);
    window.addEventListener('keydown', handle);
    window.addEventListener('click', handle);

    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - lastActiveRef.current) / 1000);
      const remaining = Math.max(0, autoLockMinutes * 60 - elapsed);
      setSecondsUntilLock(remaining);
      if (remaining <= 0) lockVaultInternal();
    }, 1000);

    return () => {
      window.removeEventListener('mousemove', handle);
      window.removeEventListener('keydown', handle);
      window.removeEventListener('click', handle);
      clearInterval(interval);
    };
  }, [isLocked, autoLockMinutes, lockVaultInternal, recordActivity]);

  // ----------------------------------------------------------
  // INITIALIZE VAULT (first-time setup)
  // ----------------------------------------------------------
  const initializeVault = useCallback(
    async (passphrase: string, lockMins = 15): Promise<{ recoveryCode: string }> => {
      const recoveryCode = generateRecoveryCode();
      const result = await setupVault(passphrase, recoveryCode);

      // Persist to Supabase
      const supabase = createClient();
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser();
      if (!authUser) throw new Error('Not authenticated');

      const saved = await upsertVaultSettings({
        user_id: authUser.id,
        vault_salt: result.salt,
        key_check_ciphertext: result.keyCheckCiphertext,
        key_check_iv: result.keyCheckIv,
        recovery_hash: result.recoveryHash,
        recovery_encrypted_key: result.recoveryEncryptedKey,
        recovery_salt: result.recoverySalt,
        auto_lock_minutes: lockMins,
      });

      if (saved) {
        const mapped: VaultSettings = {
          id: saved.id,
          userId: saved.user_id,
          vaultSalt: saved.vault_salt,
          keyCheckCiphertext: saved.key_check_ciphertext,
          keyCheckIv: saved.key_check_iv,
          recoveryHash: saved.recovery_hash,
          recoveryEncryptedKey: saved.recovery_encrypted_key,
          recoverySalt: saved.recovery_salt,
          autoLockMinutes: saved.auto_lock_minutes,
          createdAt: saved.created_at,
          updatedAt: saved.updated_at,
        };
        setVaultSettings(mapped);
      }

      setIsVaultConfigured(true);
      setAutoLockMinutes(lockMins);
      masterKeyRef.current = result.masterKey;
      setIsLocked(false);
      recordActivity();

      return { recoveryCode };
    },
    [recordActivity]
  );

  // ----------------------------------------------------------
  // UNLOCK VAULT
  // ----------------------------------------------------------
  const unlockVault = useCallback(
    async (passphrase: string): Promise<{ success: boolean; error?: string }> => {
      if (!vaultSettings) return { success: false, error: 'Vault not configured.' };

      const res = await cryptoUnlock(
        passphrase,
        vaultSettings.vaultSalt,
        vaultSettings.keyCheckCiphertext,
        vaultSettings.keyCheckIv
      );

      if (res.success && res.masterKey) {
        masterKeyRef.current = res.masterKey;
        const decrypted = await decryptAllCredentials(storedCredentials, res.masterKey);
        setCredentials(decrypted);
        setIsLocked(false);
        recordActivity();
        return { success: true };
      }
      return { success: false, error: res.error };
    },
    [vaultSettings, storedCredentials, decryptAllCredentials, recordActivity]
  );

  // ----------------------------------------------------------
  // RECOVERY UNLOCK
  // ----------------------------------------------------------
  const unlockWithRecovery = useCallback(
    async (code: string): Promise<{ success: boolean; error?: string }> => {
      if (!vaultSettings) return { success: false, error: 'Vault not configured.' };

      const res = await cryptoRecoveryUnlock(
        code,
        vaultSettings.recoveryEncryptedKey,
        vaultSettings.recoverySalt,
        vaultSettings.keyCheckCiphertext,
        vaultSettings.keyCheckIv
      );

      if (res.success && res.masterKey) {
        masterKeyRef.current = res.masterKey;
        const decrypted = await decryptAllCredentials(storedCredentials, res.masterKey);
        setCredentials(decrypted);
        setIsLocked(false);
        recordActivity();
        return { success: true };
      }
      return { success: false, error: res.error };
    },
    [vaultSettings, storedCredentials, decryptAllCredentials, recordActivity]
  );

  // ----------------------------------------------------------
  // ADD CREDENTIAL
  // ----------------------------------------------------------
  const addCredential = useCallback(
    async (data: {
      projectId: string | null;
      provider: ProviderType;
      name: string;
      environment: EnvironmentType;
      secret: string;
      notes?: string;
      expiresAt?: string;
    }) => {
      if (!masterKeyRef.current) throw new Error('Vault is locked');

      // Free tier limit check (15 keys)
      if (!isPro && credentials.length >= 15) {
        setIsPricingOpen(true);
        throw new Error('Free plan limit reached (15 keys). Please upgrade to Syntoze Pro.');
      }

      // Encrypt in browser
      const encrypted = await encryptString(data.secret, masterKeyRef.current);

      // Store ciphertext in Supabase
      const dbCred = await dbCreateCredential({
        project_id: data.projectId,
        provider: data.provider,
        name: data.name,
        environment: data.environment,
        encrypted_ciphertext: encrypted.ciphertext,
        iv: encrypted.iv,
        notes: data.notes,
        expires_at: data.expiresAt,
      });

      const newStored: StoredCredential = {
        id: dbCred.id,
        userId: dbCred.user_id,
        projectId: dbCred.project_id,
        provider: dbCred.provider as ProviderType,
        name: dbCred.name,
        environment: dbCred.environment as EnvironmentType,
        encryptedCiphertext: dbCred.encrypted_ciphertext,
        iv: dbCred.iv,
        notes: dbCred.notes,
        expiresAt: dbCred.expires_at,
        createdAt: dbCred.created_at,
        updatedAt: dbCred.updated_at,
      };

      setStoredCredentials((prev) => [newStored, ...prev]);
      setCredentials((prev) => [
        { ...newStored, plaintextSecret: data.secret, isRevealed: false },
        ...prev,
      ]);
    },
    [isPro, credentials.length]
  );

  // ----------------------------------------------------------
  // BATCH ADD CREDENTIALS (.env import)
  // ----------------------------------------------------------
  const batchAddCredentials = useCallback(
    async (items: Array<{
      projectId: string | null;
      provider: ProviderType;
      name: string;
      environment: EnvironmentType;
      secret: string;
      notes?: string;
    }>): Promise<number> => {
      if (!masterKeyRef.current) throw new Error('Vault is locked');
      if (items.length === 0) return 0;

      // Free tier limit check (15 keys)
      if (!isPro && credentials.length + items.length > 15) {
        setIsPricingOpen(true);
        throw new Error(
          `Importing ${items.length} key(s) would exceed your Free tier limit (15 keys max). Please upgrade to Syntoze Pro.`
        );
      }

      // 1. Encrypt all secrets concurrently in browser
      const encryptedRows = await Promise.all(
        items.map(async (item) => {
          const enc = await encryptString(item.secret, masterKeyRef.current!);
          return {
            project_id: item.projectId,
            provider: item.provider,
            name: item.name,
            environment: item.environment,
            encrypted_ciphertext: enc.ciphertext,
            iv: enc.iv,
            notes: item.notes,
            _plaintext: item.secret,
          };
        })
      );

      // 2. Batch insert into Supabase
      const payloadForDb = encryptedRows.map(({ _plaintext, ...rest }) => rest);
      const inserted = await dbCreateCredentialsBatch(payloadForDb);

      // 3. Update in-memory state
      const newStoredList: StoredCredential[] = inserted.map((dbCred) => ({
        id: dbCred.id,
        userId: dbCred.user_id,
        projectId: dbCred.project_id,
        provider: dbCred.provider as ProviderType,
        name: dbCred.name,
        environment: dbCred.environment as EnvironmentType,
        encryptedCiphertext: dbCred.encrypted_ciphertext,
        iv: dbCred.iv,
        notes: dbCred.notes,
        expiresAt: dbCred.expires_at,
        createdAt: dbCred.created_at,
        updatedAt: dbCred.updated_at,
      }));

      const newDecryptedList: DecryptedCredential[] = newStoredList.map((stored, idx) => ({
        ...stored,
        plaintextSecret: items[idx]?.secret || '',
        isRevealed: false,
      }));

      setStoredCredentials((prev) => [...newStoredList, ...prev]);
      setCredentials((prev) => [...newDecryptedList, ...prev]);

      return inserted.length;
    },
    [isPro, credentials.length]
  );

  // ----------------------------------------------------------
  // UPDATE CREDENTIAL
  // ----------------------------------------------------------
  const updateCredential = useCallback(
    async (
      id: string,
      data: Partial<{
        projectId: string | null;
        provider: ProviderType;
        name: string;
        environment: EnvironmentType;
        secret?: string;
        notes?: string;
        expiresAt?: string;
      }>
    ) => {
      if (!masterKeyRef.current) throw new Error('Vault is locked');

      const updates: Record<string, any> = {};
      if (data.projectId !== undefined) updates.project_id = data.projectId;
      if (data.provider) updates.provider = data.provider;
      if (data.name) updates.name = data.name;
      if (data.environment) updates.environment = data.environment;
      if (data.notes !== undefined) updates.notes = data.notes;
      if (data.expiresAt !== undefined) updates.expires_at = data.expiresAt;

      let newPlaintext: string | undefined;
      if (data.secret) {
        const encrypted = await encryptString(data.secret, masterKeyRef.current);
        updates.encrypted_ciphertext = encrypted.ciphertext;
        updates.iv = encrypted.iv;
        newPlaintext = data.secret;
      }

      const dbCred = await dbUpdateCredential(id, updates);

      setStoredCredentials((prev) =>
        prev.map((c) =>
          c.id === id
            ? {
                ...c,
                projectId: dbCred.project_id,
                provider: dbCred.provider as ProviderType,
                name: dbCred.name,
                environment: dbCred.environment as EnvironmentType,
                encryptedCiphertext: dbCred.encrypted_ciphertext,
                iv: dbCred.iv,
                notes: dbCred.notes,
                expiresAt: dbCred.expires_at,
                updatedAt: dbCred.updated_at,
              }
            : c
        )
      );

      setCredentials((prev) =>
        prev.map((c) =>
          c.id === id
            ? {
                ...c,
                projectId: dbCred.project_id,
                provider: dbCred.provider as ProviderType,
                name: dbCred.name,
                environment: dbCred.environment as EnvironmentType,
                encryptedCiphertext: dbCred.encrypted_ciphertext,
                iv: dbCred.iv,
                notes: dbCred.notes,
                expiresAt: dbCred.expires_at,
                updatedAt: dbCred.updated_at,
                plaintextSecret: newPlaintext || c.plaintextSecret,
              }
            : c
        )
      );
    },
    []
  );

  // ----------------------------------------------------------
  // DELETE CREDENTIAL
  // ----------------------------------------------------------
  const deleteCredential = useCallback(async (id: string) => {
    await dbDeleteCredential(id);
    setStoredCredentials((prev) => prev.filter((c) => c.id !== id));
    setCredentials((prev) => prev.filter((c) => c.id !== id));
  }, []);

  // ----------------------------------------------------------
  // TOGGLE REVEAL
  // ----------------------------------------------------------
  const toggleRevealSecret = useCallback((id: string) => {
    setCredentials((prev) =>
      prev.map((c) => (c.id === id ? { ...c, isRevealed: !c.isRevealed } : c))
    );
  }, []);

  // ----------------------------------------------------------
  // PROJECTS
  // ----------------------------------------------------------
  const addProject = useCallback(
    async (name: string, description?: string, color = '#6366f1') => {
      const slug = name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
      const dbProj = await dbCreateProject({ name, slug, description, color });
      setProjects((prev) => [
        ...prev,
        {
          id: dbProj.id,
          userId: dbProj.user_id,
          name: dbProj.name,
          slug: dbProj.slug,
          description: dbProj.description,
          color: dbProj.color,
          createdAt: dbProj.created_at,
          updatedAt: dbProj.updated_at,
        },
      ]);
    },
    []
  );

  const deleteProject = useCallback(async (id: string) => {
    await dbDeleteProject(id);
    setProjects((prev) => prev.filter((p) => p.id !== id));
  }, []);

  // ----------------------------------------------------------
  // SIGN OUT
  // ----------------------------------------------------------
  const signOut = useCallback(async () => {
    lockVaultInternal();
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = '/auth/login';
  }, [lockVaultInternal]);

  // ----------------------------------------------------------
  // RESET VAULT (deletes vault settings only — user account stays)
  // ----------------------------------------------------------
  const resetVault = useCallback(async () => {
    lockVaultInternal();
    setVaultSettings(null);
    setIsVaultConfigured(false);
    setCredentials([]);
    setStoredCredentials([]);
  }, [lockVaultInternal]);

  // ----------------------------------------------------------
  // UPDATE PROJECT
  // ----------------------------------------------------------
  const updateProject = useCallback(
    async (
      id: string,
      updates: { name?: string; description?: string; color?: string }
    ): Promise<void> => {
      const dbProj = await dbUpdateProject(id, updates);
      setProjects((prev) =>
        prev.map((p) =>
          p.id === id
            ? {
                ...p,
                name: dbProj.name,
                description: dbProj.description,
                color: dbProj.color,
                updatedAt: dbProj.updated_at,
              }
            : p
        )
      );
    },
    []
  );

  // ----------------------------------------------------------
  // UPDATE AUTO-LOCK MINUTES
  // ----------------------------------------------------------
  const updateAutoLockMinutes = useCallback(
    async (minutes: number): Promise<boolean> => {
      try {
        await dbUpdateVaultAutoLockMinutes(minutes);
        setAutoLockMinutes(minutes);
        setSecondsUntilLock(minutes * 60);
        setVaultSettings((prev) => (prev ? { ...prev, autoLockMinutes: minutes } : null));
        return true;
      } catch (err) {
        console.error('Failed to update auto-lock:', err);
        return false;
      }
    },
    []
  );

  // ----------------------------------------------------------
  // CHANGE MASTER PASSPHRASE
  // ----------------------------------------------------------
  const changeMasterPassphrase = useCallback(
    async (
      currentPass: string,
      newPass: string
    ): Promise<{ success: boolean; newRecoveryCode?: string; error?: string }> => {
      if (!vaultSettings) return { success: false, error: 'Vault is not configured.' };
      if (!masterKeyRef.current) return { success: false, error: 'Vault is currently locked. Please unlock first.' };

      try {
        // 1. Verify current passphrase
        const check = await cryptoUnlock(
          currentPass,
          vaultSettings.vaultSalt,
          vaultSettings.keyCheckCiphertext,
          vaultSettings.keyCheckIv
        );
        if (!check.success || !check.masterKey) {
          return { success: false, error: 'Current master passphrase is incorrect.' };
        }

        // 2. Derive new key from new passphrase
        const newSalt = generateSalt();
        const newMasterKey = await deriveKeyFromPassphrase(newPass, newSalt);

        // 3. New verifier sentinel
        const verifier = await encryptString('SYNTOZE_VAULT_VERIFIED_OK_v1', newMasterKey);

        // 4. Wrap with fresh recovery code
        const cryptoObj = typeof window !== 'undefined' ? window.crypto : globalThis.crypto;
        const rawKey = await cryptoObj.subtle.exportKey('raw', newMasterKey);
        const rawKeyB64 = bufferToBase64(rawKey);

        const newRecoveryCode = generateRecoveryCode();
        const newRecoverySalt = generateSalt();
        const recoveryKey = await deriveKeyFromPassphrase(newRecoveryCode, newRecoverySalt);
        const wrappedMaster = await encryptString(rawKeyB64, recoveryKey);
        const recoveryHash = await sha256Hash(newRecoveryCode);

        // 5. Re-encrypt all stored credentials with new master key
        for (const cred of credentials) {
          if (cred.plaintextSecret && cred.plaintextSecret !== '[Decryption Error]') {
            const reEnc = await encryptString(cred.plaintextSecret, newMasterKey);
            await dbUpdateCredential(cred.id, {
              encrypted_ciphertext: reEnc.ciphertext,
              iv: reEnc.iv,
            });
          }
        }

        // 6. Save new vault settings to Supabase
        const supabase = createClient();
        const {
          data: { user: authUser },
        } = await supabase.auth.getUser();
        if (!authUser) throw new Error('Not authenticated');

        const saved = await upsertVaultSettings({
          user_id: authUser.id,
          vault_salt: newSalt,
          key_check_ciphertext: verifier.ciphertext,
          key_check_iv: verifier.iv,
          recovery_hash: recoveryHash,
          recovery_encrypted_key: wrappedMaster.ciphertext,
          recovery_salt: `${newRecoverySalt}:${wrappedMaster.iv}`,
          auto_lock_minutes: autoLockMinutes,
        });

        if (saved) {
          setVaultSettings({
            id: saved.id,
            userId: saved.user_id,
            vaultSalt: saved.vault_salt,
            keyCheckCiphertext: saved.key_check_ciphertext,
            keyCheckIv: saved.key_check_iv,
            recoveryHash: saved.recovery_hash,
            recoveryEncryptedKey: saved.recovery_encrypted_key,
            recoverySalt: saved.recovery_salt,
            autoLockMinutes: saved.auto_lock_minutes,
            createdAt: saved.created_at,
            updatedAt: saved.updated_at,
          });
        }

        // 7. Update master key ref
        masterKeyRef.current = newMasterKey;
        recordActivity();

        return { success: true, newRecoveryCode };
      } catch (err: any) {
        console.error('Change passphrase error:', err);
        return { success: false, error: err?.message || 'Failed to change master passphrase.' };
      }
    },
    [vaultSettings, credentials, autoLockMinutes, recordActivity]
  );

  // ----------------------------------------------------------
  // REGENERATE RECOVERY KIT
  // ----------------------------------------------------------
  const regenerateRecoveryKit = useCallback(async (): Promise<{ recoveryCode: string }> => {
    if (!vaultSettings) throw new Error('Vault not configured.');
    if (!masterKeyRef.current) throw new Error('Vault is locked. Please unlock to regenerate recovery kit.');

    const cryptoObj = typeof window !== 'undefined' ? window.crypto : globalThis.crypto;
    const rawKey = await cryptoObj.subtle.exportKey('raw', masterKeyRef.current);
    const rawKeyB64 = bufferToBase64(rawKey);

    const newCode = generateRecoveryCode();
    const newSalt = generateSalt();
    const recoveryKey = await deriveKeyFromPassphrase(newCode, newSalt);
    const wrappedMaster = await encryptString(rawKeyB64, recoveryKey);
    const recoveryHash = await sha256Hash(newCode);

    const supabase = createClient();
    const {
      data: { user: authUser },
    } = await supabase.auth.getUser();
    if (!authUser) throw new Error('Not authenticated');

    const saved = await upsertVaultSettings({
      user_id: authUser.id,
      vault_salt: vaultSettings.vaultSalt,
      key_check_ciphertext: vaultSettings.keyCheckCiphertext,
      key_check_iv: vaultSettings.keyCheckIv,
      recovery_hash: recoveryHash,
      recovery_encrypted_key: wrappedMaster.ciphertext,
      recovery_salt: `${newSalt}:${wrappedMaster.iv}`,
      auto_lock_minutes: autoLockMinutes,
    });

    if (saved) {
      setVaultSettings((prev) =>
        prev
          ? {
              ...prev,
              recoveryHash,
              recoveryEncryptedKey: wrappedMaster.ciphertext,
              recoverySalt: `${newSalt}:${wrappedMaster.iv}`,
              updatedAt: saved.updated_at,
            }
          : null
      );
    }

    return { recoveryCode: newCode };
  }, [vaultSettings, autoLockMinutes]);

  // ----------------------------------------------------------
  // PURGE ALL CREDENTIALS
  // ----------------------------------------------------------
  const purgeAllCredentials = useCallback(async (): Promise<void> => {
    await dbDeleteAllCredentials();
    setCredentials([]);
    setStoredCredentials([]);
  }, []);

  // ----------------------------------------------------------
  // ENCRYPTED BACKUP EXPORT
  // ----------------------------------------------------------
  const exportEncryptedBackup = useCallback(() => {
    if (!storedCredentials || !vaultSettings) return;

    const backupPayload = {
      app: 'Syntoze API Manager',
      version: '2.0.0',
      exportedAt: new Date().toISOString(),
      userEmail: user?.email,
      vaultMeta: {
        autoLockMinutes: vaultSettings.autoLockMinutes,
        createdAt: vaultSettings.createdAt,
      },
      projects: projects.map((p) => ({
        id: p.id,
        name: p.name,
        slug: p.slug,
        description: p.description,
        color: p.color,
      })),
      credentials: storedCredentials.map((c) => ({
        id: c.id,
        projectId: c.projectId,
        provider: c.provider,
        name: c.name,
        environment: c.environment,
        ciphertext: c.encryptedCiphertext,
        iv: c.iv,
        notes: c.notes,
        createdAt: c.createdAt,
      })),
    };

    const blob = new Blob([JSON.stringify(backupPayload, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `syntoze-vault-encrypted-backup-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [storedCredentials, vaultSettings, user, projects]);

  // ----------------------------------------------------------
  // EXPORT .env
  // ----------------------------------------------------------
  const exportEnvFormat = useCallback(
    (projectId: string, environment: EnvironmentType): string => {
      const matching = credentials.filter(
        (c) =>
          (projectId === 'all' || c.projectId === projectId) &&
          c.environment === environment &&
          c.plaintextSecret
      );

      const project = projects.find((p) => p.id === projectId);
      let output = `# =========================================\n`;
      output += `# Syntoze API Vault Export\n`;
      output += `# Project: ${project?.name || 'All Projects'}\n`;
      output += `# Environment: ${environment.toUpperCase()}\n`;
      output += `# Generated: ${new Date().toISOString()}\n`;
      output += `# =========================================\n\n`;

      matching.forEach((c) => {
        let envKey = c.name
          .toUpperCase()
          .replace(/[^A-Z0-9]+/g, '_')
          .replace(/^_+|_+$/g, '');
        if (!envKey.includes('KEY') && !envKey.includes('SECRET') && !envKey.includes('TOKEN')) {
          envKey += '_KEY';
        }
        if (c.notes) output += `# ${c.notes}\n`;
        output += `${envKey}="${c.plaintextSecret}"\n\n`;
      });

      return output;
    },
    [credentials, projects]
  );

  // ----------------------------------------------------------
  // REFRESH DATA
  // ----------------------------------------------------------
  const refreshData = useCallback(async () => {
    try {
      const dbProjects = await getProjects();
      setProjects(
        dbProjects.map((p) => ({
          id: p.id,
          userId: p.user_id,
          name: p.name,
          slug: p.slug,
          description: p.description,
          color: p.color,
          createdAt: p.created_at,
          updatedAt: p.updated_at,
        }))
      );

      const dbCreds = await getCredentials();
      const mapped: StoredCredential[] = dbCreds.map((c) => ({
        id: c.id,
        userId: c.user_id,
        projectId: c.project_id,
        provider: c.provider as ProviderType,
        name: c.name,
        environment: c.environment as EnvironmentType,
        encryptedCiphertext: c.encrypted_ciphertext,
        iv: c.iv,
        notes: c.notes,
        expiresAt: c.expires_at,
        createdAt: c.created_at,
        updatedAt: c.updated_at,
      }));
      setStoredCredentials(mapped);

      if (masterKeyRef.current) {
        const decrypted = await decryptAllCredentials(mapped, masterKeyRef.current);
        setCredentials(decrypted);
      } else {
        setCredentials(
          mapped.map((c) => ({ ...c, plaintextSecret: undefined, isRevealed: false }))
        );
      }

      await refreshSubscription();
    } catch (err) {
      console.error('Refresh error:', err);
    }
  }, [decryptAllCredentials, refreshSubscription]);

  return (
    <VaultContext.Provider
      value={{
        isReady,
        isVaultConfigured,
        isLocked,
        user,
        vaultSettings,
        projects,
        credentials,
        userSubscription,
        isPro,
        keyLimit,
        isPricingOpen,
        openPricingModal,
        closePricingModal,
        refreshSubscription,
        activateProPlan,
        isSettingsOpen,
        openSettings,
        closeSettings,
        updateAutoLockMinutes,
        changeMasterPassphrase,
        regenerateRecoveryKit,
        purgeAllCredentials,
        exportEncryptedBackup,
        clipboardClearSeconds,
        setClipboardClearSeconds,
        copyToClipboardSecure,
        autoLockMinutes,
        secondsUntilLock,
        activeProjectId,
        activeEnvironment,
        activeProvider,
        searchQuery,
        signOut,
        initializeVault,
        unlockVault,
        unlockWithRecovery,
        lockVault,
        resetVault,
        addCredential,
        batchAddCredentials,
        updateCredential,
        deleteCredential,
        toggleRevealSecret,
        addProject,
        updateProject,
        deleteProject,
        exportEnvFormat,
        setActiveProjectId,
        setActiveEnvironment,
        setActiveProvider,
        setSearchQuery,
        refreshData,
      }}
    >
      {children}
    </VaultContext.Provider>
  );
}

export function useVault() {
  const ctx = useContext(VaultContext);
  if (!ctx) throw new Error('useVault must be used within VaultProvider');
  return ctx;
}

