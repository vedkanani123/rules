// Canonical source of truth — single ownership for all firm / account / rule data.
// Hierarchy: Firm -> Program -> Account Tier -> Rule Set -> Rule -> Evidence -> Snapshot
// Directory firms (third-party index) are NEVER merged with verified rule data.

import { PROP_FIRMS_DATA } from '../../data/propFirmsData.ts';
import { REAL_FIRMS } from '../../data/propFirmMatchReal.ts';
import type { PropFirm, AccountTier, ProgramModel, Rule } from '../../types/schema.ts';

export type TrustState =
  | 'VERIFIED'
  | 'PARTIALLY_VERIFIED'
  | 'NEEDS_REVIEW'
  | 'CONFLICTING'
  | 'UNKNOWN'
  | 'OUTDATED'
  | 'UNAVAILABLE'
  | 'NOT_APPLICABLE';

export interface DirectoryFirm {
  id: string;
  name: string;
  slug: string;
  country: string;
  countryFlag: string;
  logoUrl?: string;
  maxAllocation?: number;
  reviewScore?: number;
  reviewsCount?: number;
  platforms: string[];
  programTypes: string[];
  marketType: string;
  foundedYear?: number;
  trustScore?: number;
  verificationState: TrustState;
  verificationNote: string;
}

const FRESHNESS_DAYS = 30;

function isFresh(lastVerified: string): boolean {
  const t = Date.parse(lastVerified);
  if (Number.isNaN(t)) return false;
  const ageDays = (Date.now() - t) / (1000 * 60 * 60 * 24);
  return ageDays <= FRESHNESS_DAYS;
}

export function getTrustStateForRule(rule: Rule): TrustState {
  if (!rule.sources || rule.sources.length === 0) return 'UNKNOWN';
  const hasConflict = rule.sources.some((s) => s.verificationStatus === 'CONFLICTING');
  if (hasConflict) return 'CONFLICTING';
  const hasVerified = rule.sources.some((s) => s.verificationStatus === 'VERIFIED');
  const hasPartial = rule.sources.some((s) => s.verificationStatus === 'PARTIALLY_VERIFIED');
  if (!isFresh(rule.lastVerified)) return 'OUTDATED';
  if (hasVerified && rule.sources.every((s) => s.verificationStatus === 'VERIFIED')) return 'VERIFIED';
  if (hasVerified || hasPartial) return 'PARTIALLY_VERIFIED';
  return 'NEEDS_REVIEW';
}

export function getCanonicalFirms(): PropFirm[] {
  return PROP_FIRMS_DATA;
}

export function getFirmBySlug(slug: string): PropFirm | undefined {
  return PROP_FIRMS_DATA.find((f) => f.slug === slug);
}

export function getAccountById(firm: PropFirm, accountId: string): AccountTier | undefined {
  for (const p of firm.programs) {
    const a = p.accounts.find((x) => x.id === accountId);
    if (a) return a;
  }
  return undefined;
}

export function getProgramBySlug(firm: PropFirm, slug: string): ProgramModel | undefined {
  return firm.programs.find((p) => p.slug === slug);
}

export function getAllCanonicalAccounts(): { firm: PropFirm; program: ProgramModel; account: AccountTier }[] {
  const out: { firm: PropFirm; program: ProgramModel; account: AccountTier }[] = [];
  for (const firm of PROP_FIRMS_DATA) {
    for (const program of firm.programs) {
      for (const account of program.accounts) {
        out.push({ firm, program, account });
      }
    }
  }
  return out;
}

/** Directory index — third-party metadata only, explicitly NOT verified rules. */
export function getDirectoryFirms(): DirectoryFirm[] {
  return (REAL_FIRMS as unknown as Record<string, unknown>[]).map((rf) => {
    const r = rf as Record<string, string & number & string[] & number[]>;
    const name = String(r['name'] ?? 'Unknown firm');
    const slug = String(r['slug'] ?? name.toLowerCase().replace(/[^a-z0-9]+/g, '-'));
    return {
      id: String(r['id'] ?? slug),
      name,
      slug,
      country: String(r['country'] ?? 'Unknown'),
      countryFlag: String(r['countryFlag'] ?? ''),
      logoUrl: typeof r['logoUrl'] === 'string' ? (r['logoUrl'] as string) : undefined,
      maxAllocation: typeof r['maxAllocation'] === 'number' ? (r['maxAllocation'] as number) : undefined,
      reviewScore: typeof r['reviewScore'] === 'number' ? (r['reviewScore'] as number) : undefined,
      reviewsCount: typeof r['reviewsCount'] === 'number' ? (r['reviewsCount'] as number) : undefined,
      platforms: Array.isArray(r['platforms']) ? (r['platforms'] as string[]) : [],
      programTypes: Array.isArray(r['programType']) ? (r['programType'] as string[]) : [],
      marketType: String(r['marketType'] ?? 'Unknown'),
      foundedYear: typeof r['foundedYear'] === 'number' ? (r['foundedYear'] as number) : undefined,
      trustScore: typeof r['trustScore'] === 'number' ? (r['trustScore'] as number) : undefined,
      verificationState: 'UNKNOWN' as TrustState,
      verificationNote: 'Directory metadata only. Rules under verification — do not rely on this data for a trading or purchase decision until the source has been reviewed.',
    };
  });
}

/** Detect duplicate canonical IDs across firms/programs/accounts/rules. */
export function findDuplicateIds(): { scope: string; id: string; count: number }[] {
  const counts = new Map<string, number>();
  const push = (scope: string, id: string) => {
    const k = `${scope}:${id}`;
    counts.set(k, (counts.get(k) ?? 0) + 1);
  };
  for (const f of PROP_FIRMS_DATA) {
    push('firm', f.id);
    push('firm-slug', f.slug);
    for (const p of f.programs) {
      push('program', p.id);
      for (const a of p.accounts) push('account', a.id);
    }
    for (const r of f.rules) push('rule', r.id);
  }
  const dups: { scope: string; id: string; count: number }[] = [];
  for (const [k, count] of counts) {
    if (count > 1) {
      const [scope, ...rest] = k.split(':');
      dups.push({ scope, id: rest.join(':'), count });
    }
  }
  return dups;
}

/** Honest price display — Unknown stays Unknown, never $0/free. */
export function displayPrice(a: { price: number; discountedPrice?: number; priceUnknown?: boolean }): string {
  if (a.priceUnknown) return 'Unknown';
  const p = a.discountedPrice ?? a.price;
  return `$${p.toLocaleString()}`;
}

/** Canonical stats — always derived from real data, never hardcoded. */
export function getCanonicalStats(): {
  firms: number;
  tiers: number;
  rules: number;
  hiddenRules: number;
  verifiedRules: number;
  lastVerified: string;
} {
  let tiers = 0;
  let rules = 0;
  let hidden = 0;
  let verified = 0;
  let latest = '';
  for (const f of PROP_FIRMS_DATA) {
    if (!latest || f.lastVerified > latest) latest = f.lastVerified;
    for (const p of f.programs) tiers += p.accounts.length;
    for (const r of f.rules) {
      rules++;
      if (r.isEasyToMiss) hidden++;
      if (r.sources.some((s) => s.verificationStatus === 'VERIFIED')) verified++;
    }
  }
  return {
    firms: PROP_FIRMS_DATA.length,
    tiers,
    rules,
    hiddenRules: hidden,
    verifiedRules: verified,
    lastVerified: latest || 'Unknown',
  };
}
