import { DecryptedCredential } from './types/vault';

export type HealthSeverity = 'critical' | 'warning' | 'good';

export interface SecurityIssue {
  id: string;
  credentialId: string;
  credentialName: string;
  severity: HealthSeverity;
  type: 'stale_key' | 'cross_env_reuse' | 'test_in_prod' | 'weak_pattern' | 'expiring_soon';
  title: string;
  description: string;
  recommendation: string;
}

export interface CredentialSecurityBadge {
  ageDays: number;
  severity: HealthSeverity;
  label: string;
  warningNotice?: string;
  isReusedInOtherEnv: boolean;
  isTestKeyInProd: boolean;
}

export interface SecurityAuditResult {
  score: number;
  grade: 'A+' | 'A' | 'B' | 'C' | 'D' | 'F';
  issues: SecurityIssue[];
  freshCount: number;
  staleCount: number;
  reusedCount: number;
  testKeyInProdCount: number;
}

/**
 * Audit a single credential against best-practice security criteria
 */
export function getCredentialSecurityStatus(
  cred: DecryptedCredential,
  allCreds: DecryptedCredential[]
): CredentialSecurityBadge {
  const timestamp = cred.updatedAt || cred.createdAt;
  const ageMs = Date.now() - new Date(timestamp).getTime();
  const ageDays = Math.max(0, Math.floor(ageMs / (1000 * 60 * 60 * 24)));

  const secret = cred.plaintextSecret?.trim() || '';

  // 1. Cross-environment re-use check
  let isReusedInOtherEnv = false;
  if (secret && secret.length > 8) {
    const matching = allCreds.filter(
      (c) =>
        c.id !== cred.id &&
        c.plaintextSecret?.trim() === secret &&
        c.environment !== cred.environment
    );
    if (matching.length > 0) {
      isReusedInOtherEnv = true;
    }
  }

  // 2. Test key in production check
  const isTestKeyInProd =
    cred.environment === 'production' &&
    (secret.startsWith('sk_test_') ||
      secret.startsWith('pk_test_') ||
      secret.startsWith('rk_test_'));

  // Determine severity and primary label
  let severity: HealthSeverity = 'good';
  let label = `${ageDays}d old`;
  let warningNotice: string | undefined;

  if (isReusedInOtherEnv) {
    severity = 'critical';
    warningNotice = 'Secret shared across Dev and Prod';
  } else if (isTestKeyInProd) {
    severity = 'critical';
    warningNotice = 'Test-mode key used in Production';
  } else if (ageDays >= 180) {
    severity = 'critical';
    label = `${ageDays}d old (Stale)`;
    warningNotice = 'Not rotated in over 6 months';
  } else if (ageDays >= 90) {
    severity = 'warning';
    label = `${ageDays}d old (Rotate)`;
    warningNotice = 'Rotation recommended (>90 days)';
  } else {
    severity = 'good';
    label = ageDays === 0 ? 'Today' : `${ageDays}d old`;
  }

  return {
    ageDays,
    severity,
    label,
    warningNotice,
    isReusedInOtherEnv,
    isTestKeyInProd,
  };
}

/**
 * Compute aggregate security health audit across all credentials
 */
export function calculateSecurityHealth(credentials: DecryptedCredential[]): SecurityAuditResult {
  const issues: SecurityIssue[] = [];
  let staleCount = 0;
  let freshCount = 0;
  let reusedCount = 0;
  let testKeyInProdCount = 0;

  if (credentials.length === 0) {
    return {
      score: 100,
      grade: 'A+',
      issues: [],
      freshCount: 0,
      staleCount: 0,
      reusedCount: 0,
      testKeyInProdCount: 0,
    };
  }

  // Map of secret -> environments it appears in
  const secretEnvMap = new Map<string, Set<string>>();
  credentials.forEach((c) => {
    const s = c.plaintextSecret?.trim();
    if (s && s.length > 8) {
      if (!secretEnvMap.has(s)) {
        secretEnvMap.set(s, new Set());
      }
      secretEnvMap.get(s)!.add(c.environment);
    }
  });

  credentials.forEach((cred) => {
    const timestamp = cred.updatedAt || cred.createdAt;
    const ageDays = Math.max(0, Math.floor((Date.now() - new Date(timestamp).getTime()) / (1000 * 60 * 60 * 24)));
    const secret = cred.plaintextSecret?.trim() || '';

    // Check age
    if (ageDays >= 180) {
      staleCount++;
      issues.push({
        id: `stale-crit-${cred.id}`,
        credentialId: cred.id,
        credentialName: cred.name,
        severity: 'critical',
        type: 'stale_key',
        title: `Critical: Key not rotated in ${ageDays} days`,
        description: `"${cred.name}" was created ${ageDays} days ago. Long-lived credentials represent an increased leak exposure surface.`,
        recommendation: `Generate a new key in the provider console and click "Rotate Key".`,
      });
    } else if (ageDays >= 90) {
      staleCount++;
      issues.push({
        id: `stale-warn-${cred.id}`,
        credentialId: cred.id,
        credentialName: cred.name,
        severity: 'warning',
        type: 'stale_key',
        title: `Rotation Recommended: ${ageDays} days old`,
        description: `Industry security standards (SOC 2, ISO 27001) recommend rotating API credentials every 90 days.`,
        recommendation: `Schedule key rotation for this credential.`,
      });
    } else {
      freshCount++;
    }

    // Check cross-env re-use
    if (secret && secretEnvMap.has(secret)) {
      const envs = secretEnvMap.get(secret)!;
      if (envs.has('production') && (envs.has('development') || envs.has('staging'))) {
        reusedCount++;
        // Avoid duplicate alerts for the same key
        if (!issues.some((i) => i.credentialId === cred.id && i.type === 'cross_env_reuse')) {
          issues.push({
            id: `reuse-${cred.id}`,
            credentialId: cred.id,
            credentialName: cred.name,
            severity: 'critical',
            type: 'cross_env_reuse',
            title: `Severe: Same secret used in Production & Non-Prod`,
            description: `"${cred.name}" shares the exact same secret token across both Production and Development/Staging.`,
            recommendation: `Issue a separate dedicated key for Development to prevent staging code from altering production data.`,
          });
        }
      }
    }

    // Check test key in prod
    if (
      cred.environment === 'production' &&
      (secret.startsWith('sk_test_') || secret.startsWith('pk_test_') || secret.startsWith('rk_test_'))
    ) {
      testKeyInProdCount++;
      issues.push({
        id: `test-prod-${cred.id}`,
        credentialId: cred.id,
        credentialName: cred.name,
        severity: 'critical',
        type: 'test_in_prod',
        title: `Config Error: Test-Mode Key in Production`,
        description: `This key has a "test_" prefix but is assigned to your Production environment.`,
        recommendation: `Replace with your live production secret key.`,
      });
    }

    // Check format / truncation
    if (cred.provider === 'openai' && secret && !secret.startsWith('sk-') && !secret.startsWith('sess-')) {
      issues.push({
        id: `malformed-${cred.id}`,
        credentialId: cred.id,
        credentialName: cred.name,
        severity: 'warning',
        type: 'weak_pattern',
        title: `Malformed Key Format`,
        description: `OpenAI API keys typically begin with "sk-proj-" or "sk-".`,
        recommendation: `Verify that this key was copied completely from the OpenAI developer dashboard.`,
      });
    }
  });

  // Calculate score
  let score = 100;
  issues.forEach((issue) => {
    if (issue.severity === 'critical') score -= 18;
    if (issue.severity === 'warning') score -= 8;
  });
  score = Math.max(0, Math.min(100, score));

  let grade: SecurityAuditResult['grade'] = 'A+';
  if (score >= 95) grade = 'A+';
  else if (score >= 85) grade = 'A';
  else if (score >= 72) grade = 'B';
  else if (score >= 60) grade = 'C';
  else if (score >= 40) grade = 'D';
  else grade = 'F';

  return {
    score,
    grade,
    issues,
    freshCount,
    staleCount,
    reusedCount,
    testKeyInProdCount,
  };
}

