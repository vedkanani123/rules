// Runtime validation for all external data.
// Rejects malformed data before it reaches the frontend. Never silently coerces unknown -> false/0/allowed.

import type { PropFirm, AccountTier, Rule, SourceEvidence, CrawlSnapshotNode } from '../../types/schema.ts';

export interface ValidationIssue {
  path: string;
  message: string;
}

function isNonEmptyString(v: unknown): v is string {
  return typeof v === 'string' && v.trim().length > 0;
}

function isValidUrl(v: unknown): boolean {
  if (typeof v !== 'string' || !v) return false;
  try {
    const u = new URL(v);
    return u.protocol === 'http:' || u.protocol === 'https:';
  } catch {
    return false;
  }
}

function isValidPercent(v: unknown): boolean {
  return typeof v === 'number' && Number.isFinite(v) && v >= 0 && v <= 100;
}

function isValidDate(v: unknown): boolean {
  if (typeof v !== 'string' || !v) return false;
  const t = Date.parse(v);
  return !Number.isNaN(t);
}

export function validateEvidence(ev: SourceEvidence, path: string): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  if (!isNonEmptyString(ev.id)) issues.push({ path: `${path}.id`, message: 'Missing evidence id' });
  if (!isValidUrl(ev.sourceUrl)) issues.push({ path: `${path}.sourceUrl`, message: `Invalid source URL: ${String(ev.sourceUrl)}` });
  if (!isNonEmptyString(ev.sourceTitle)) issues.push({ path: `${path}.sourceTitle`, message: 'Missing source title' });
  if (!isNonEmptyString(ev.sourceExcerpt)) issues.push({ path: `${path}.sourceExcerpt`, message: 'Missing source excerpt — every rule must cite a passage' });
  if (!isValidDate(ev.retrievedAt)) issues.push({ path: `${path}.retrievedAt`, message: 'Invalid retrievedAt date' });
  const conf = ['A', 'B', 'C', 'D', 'E'];
  if (!conf.includes(ev.confidence)) issues.push({ path: `${path}.confidence`, message: `Invalid confidence: ${String(ev.confidence)}` });
  const vs = ['VERIFIED', 'PARTIALLY_VERIFIED', 'CONFLICTING', 'OUTDATED', 'UNVERIFIED'];
  if (!vs.includes(ev.verificationStatus)) issues.push({ path: `${path}.verificationStatus`, message: `Invalid verificationStatus` });
  return issues;
}

export function validateRule(rule: Rule, path: string): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  if (!isNonEmptyString(rule.id)) issues.push({ path: `${path}.id`, message: 'Missing rule id' });
  if (!isNonEmptyString(rule.name)) issues.push({ path: `${path}.name`, message: 'Missing rule name' });
  if (!isNonEmptyString(rule.slug)) issues.push({ path: `${path}.slug`, message: 'Missing rule slug' });
  if (!isNonEmptyString(rule.headlineValue)) issues.push({ path: `${path}.headlineValue`, message: 'Missing headlineValue' });
  if (!isNonEmptyString(rule.plainEnglish)) issues.push({ path: `${path}.plainEnglish`, message: 'Missing plain-English explanation' });
  if (!isNonEmptyString(rule.officialWording)) issues.push({ path: `${path}.officialWording`, message: 'Missing official wording' });
  if (!isNonEmptyString(rule.howTradersViolate)) issues.push({ path: `${path}.howTradersViolate`, message: 'Missing violation explanation' });
  if (!Array.isArray(rule.sources) || rule.sources.length === 0) {
    issues.push({ path: `${path}.sources`, message: 'Rule has no evidence — must be marked Unknown, not rendered as verified' });
  } else {
    rule.sources.forEach((s, i) => issues.push(...validateEvidence(s, `${path}.sources[${i}]`)));
  }
  if (!isValidDate(rule.lastVerified)) issues.push({ path: `${path}.lastVerified`, message: 'Invalid lastVerified' });
  if (typeof rule.visibilityScore !== 'number' || rule.visibilityScore < 0 || rule.visibilityScore > 4) {
    issues.push({ path: `${path}.visibilityScore`, message: 'visibilityScore must be 0-4' });
  }
  if (typeof rule.impactScore !== 'number' || rule.impactScore < 0 || rule.impactScore > 100) {
    issues.push({ path: `${path}.impactScore`, message: 'impactScore must be 0-100' });
  }
  return issues;
}

export function validateAccount(acc: AccountTier, path: string): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  if (!isNonEmptyString(acc.id)) issues.push({ path: `${path}.id`, message: 'Missing account id' });
  if (!isNonEmptyString(acc.programId)) issues.push({ path: `${path}.programId`, message: 'Missing programId' });
  if (!Number.isFinite(acc.nominalSize) || acc.nominalSize <= 0) issues.push({ path: `${path}.nominalSize`, message: 'Invalid account size' });
  if (!Number.isFinite(acc.price) || acc.price < 0) issues.push({ path: `${path}.price`, message: 'Invalid price' });
  if (!isValidPercent(acc.dailyLossLimit)) issues.push({ path: `${path}.dailyLossLimit`, message: 'dailyLossLimit must be 0-100%' });
  if (!isValidPercent(acc.maxTotalLoss)) issues.push({ path: `${path}.maxTotalLoss`, message: 'maxTotalLoss must be 0-100%' });
  if (!isValidPercent(acc.profitSplit)) issues.push({ path: `${path}.profitSplit`, message: 'profitSplit must be 0-100%' });
  if (acc.profitTargetPhase1 !== undefined && !isValidPercent(acc.profitTargetPhase1)) {
    issues.push({ path: `${path}.profitTargetPhase1`, message: 'Invalid profit target' });
  }
  if (!isNonEmptyString(acc.leverage)) issues.push({ path: `${path}.leverage`, message: 'Missing leverage' });
  if (!Array.isArray(acc.platforms) || acc.platforms.length === 0) issues.push({ path: `${path}.platforms`, message: 'Missing platforms' });
  // Rules attached to account inherit rule validation
  (acc.rules ?? []).forEach((r, i) => issues.push(...validateRule(r, `${path}.rules[${i}]`)));
  (acc.sources ?? []).forEach((s, i) => issues.push(...validateEvidence(s, `${path}.sources[${i}]`)));
  return issues;
}

export function validateFirm(firm: PropFirm): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const base = `firm(${firm.id || 'unknown'})`;
  if (!isNonEmptyString(firm.id)) issues.push({ path: `${base}.id`, message: 'Missing canonical firm id' });
  if (!isNonEmptyString(firm.name)) issues.push({ path: `${base}.name`, message: 'Missing firm name' });
  if (!isNonEmptyString(firm.slug)) issues.push({ path: `${base}.slug`, message: 'Missing firm slug' });
  if (!isValidUrl(firm.website)) issues.push({ path: `${base}.website`, message: `Invalid website: ${String(firm.website)}` });
  if (!isValidDate(firm.lastVerified)) issues.push({ path: `${base}.lastVerified`, message: 'Invalid lastVerified' });
  if (!Array.isArray(firm.programs) || firm.programs.length === 0) {
    issues.push({ path: `${base}.programs`, message: 'Firm has no programs' });
  } else {
    firm.programs.forEach((p, pi) => {
      if (!isNonEmptyString(p.id)) issues.push({ path: `${base}.programs[${pi}].id`, message: 'Missing program id' });
      (p.accounts ?? []).forEach((a, ai) => issues.push(...validateAccount(a, `${base}.programs[${pi}].accounts[${ai}]`)));
    });
  }
  (firm.rules ?? []).forEach((r, i) => issues.push(...validateRule(r, `${base}.rules[${i}]`)));
  return issues;
}

export function validateAllFirms(firms: PropFirm[]): { issues: ValidationIssue[]; valid: boolean } {
  const issues = firms.flatMap((f) => validateFirm(f));
  return { issues, valid: issues.length === 0 };
}

export function validateSnapshot(node: CrawlSnapshotNode): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  if (!isValidUrl(node.url)) issues.push({ path: 'snapshot.url', message: 'Invalid snapshot URL' });
  if (!Number.isInteger(node.httpStatus) || node.httpStatus < 100 || node.httpStatus > 599) {
    issues.push({ path: 'snapshot.httpStatus', message: 'Invalid HTTP status' });
  }
  if (!isNonEmptyString(node.contentHash)) issues.push({ path: 'snapshot.contentHash', message: 'Missing content hash' });
  if (!isValidDate(node.crawledAt)) issues.push({ path: 'snapshot.crawledAt', message: 'Invalid crawledAt' });
  return issues;
}
