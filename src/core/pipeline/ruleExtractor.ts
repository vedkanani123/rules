// Generic extraction + conflict detection with source priority, confidence,
// review queue, and version-history helpers. No hardcoded two-conflict limit.

import type {
  Rule, RuleConflict, RuleCategory, RuleImportance, SourceEvidence, ConfidenceRating, EvidenceClass,
} from '../../types/schema.ts';

export interface RawExtractedFact {
  topic: string;
  rawText: string;
  sourceUrl: string;
  sourceTitle: string;
  pageSection?: string;
  sourceType: 'OFFICIAL' | 'OFFICIAL_SUPPORT' | 'OFFICIAL_TERMS' | 'OFFICIAL_PROMOTIONAL';
  capturedAt?: string;
}

/** Authoritative source priority (lower index = more authoritative). Configurable. */
export const SOURCE_PRIORITY: EvidenceClass[] = [
  'OFFICIAL_TERMS',
  'OFFICIAL',
  'OFFICIAL_SUPPORT',
  'FIRM_RESPONSE',
  'OFFICIAL_PROMOTIONAL',
  'REVIEW_PLATFORM',
  'TRADER_REPORT',
  'THIRD_PARTY_ANALYSIS',
  'INFERENCE',
  'UNVERIFIED',
  'CONFLICTING',
];

export function sourceRank(t: EvidenceClass): number {
  const i = SOURCE_PRIORITY.indexOf(t);
  return i === -1 ? 99 : i;
}

export function calculateEasyToMissRisk(visibilityScore: number, impactScore: number): {
  score: number; isEasyToMiss: boolean; severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
} {
  const score = visibilityScore * impactScore;
  const isEasyToMiss = score >= 140;
  let severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' = 'LOW';
  if (score >= 250) severity = 'CRITICAL';
  else if (score >= 180) severity = 'HIGH';
  else if (score >= 100) severity = 'MEDIUM';
  return { score, isEasyToMiss, severity };
}

export function evaluateRuleImportance(category: RuleCategory, name: string): {
  importance: RuleImportance; reason: string;
} {
  const lower = name.toLowerCase();
  if (lower.includes('daily drawdown') || lower.includes('daily loss') || lower.includes('maximum loss') || lower.includes('trailing')) {
    return { importance: 'CRITICAL', reason: 'Immediate automatic breach and account disqualification upon threshold touch.' };
  }
  if (lower.includes('payout') || lower.includes('profit split') || lower.includes('news') || lower.includes('inactivity')) {
    return { importance: 'HIGH', reason: 'Directly impacts trader withdrawal eligibility, reward timing, or account preservation.' };
  }
  if (lower.includes('consistency') || lower.includes('minimum trading days') || lower.includes('ea') || lower.includes('copy')) {
    return { importance: 'MEDIUM', reason: 'Requires operational adjustment during evaluation or payout review phase.' };
  }
  return { importance: 'LOW', reason: 'Operational guideline or secondary commercial detail.' };
}

function normalizeTopic(t: string): string {
  return t.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
}

function normalizeValueText(t: string): string {
  return t.toLowerCase().replace(/\s+/g, ' ').trim();
}

/** Generic conflict detection: any topic with materially different values across sources. */
export function detectRuleConflicts(facts: RawExtractedFact[]): RuleConflict[] {
  const conflicts: RuleConflict[] = [];
  const groups = new Map<string, RawExtractedFact[]>();
  for (const f of facts) {
    const k = normalizeTopic(f.topic);
    if (!groups.has(k)) groups.set(k, []);
    groups.get(k)!.push(f);
  }
  for (const [topic, list] of groups) {
    if (list.length < 2) continue;
    const values = new Set(list.map((f) => normalizeValueText(f.rawText)));
    if (values.size < 2) continue; // agree
    // Sort by authority so sourceA = most authoritative
    const sorted = [...list].sort((a, b) => sourceRank(a.sourceType) - sourceRank(b.sourceType));
    const a = sorted[0]!;
    const b = sorted.find((f) => normalizeValueText(f.rawText) !== normalizeValueText(a.rawText)) ?? sorted[1]!;
    conflicts.push({
      id: `conflict-${topic.replace(/[^a-z0-9]+/g, '-')}`,
      topic: list[0]!.topic,
      sourceA: { claim: a.rawText, url: a.sourceUrl, sourceType: a.sourceType, context: a.pageSection ?? a.sourceTitle },
      sourceB: { claim: b.rawText, url: b.sourceUrl, sourceType: b.sourceType, context: b.pageSection ?? b.sourceTitle },
      discrepancy: `Sources disagree on "${list[0]!.topic}": "${a.rawText.slice(0, 120)}" vs "${b.rawText.slice(0, 120)}".`,
      practicalMeaning: 'Do not act on either value until manual review resolves which source governs your account type and stage.',
      recommendedTraderAction: 'Treat as Conflicting — verify with official support and keep the snapshot before trading.',
      confidence: 'B',
    });
  }
  return conflicts;
}

/** Extract candidate raw statements mentioning rule-like numbers from page text. */
export function extractRawStatements(pageUrl: string, pageTitle: string, text: string, sourceType: RawExtractedFact['sourceType']): RawExtractedFact[] {
  const out: RawExtractedFact[] = [];
  const sentences = text.split(/(?<=[.!?])\s+/).slice(0, 400);
  const ruleHints = ['drawdown', 'loss', 'profit target', 'payout', 'news', 'weekend', 'overnight', 'consistency', 'inactiv', 'minimum trading day', 'copy trad', 'expert advisor', '\bea\b', 'leverage', '%', 'trading day'];
  for (const s of sentences) {
    const low = s.toLowerCase();
    if (s.length < 30 || s.length > 400) continue;
    if (!ruleHints.some((h) => low.includes(h))) continue;
    let topic = 'General rule';
    if (low.includes('news')) topic = 'News Trading';
    else if (low.includes('payout') || low.includes('withdraw')) topic = 'Payout Timing';
    else if (low.includes('drawdown') || low.includes('daily loss') || low.includes('max') && low.includes('loss')) topic = 'Drawdown Limits';
    else if (low.includes('consistency')) topic = 'Consistency Rule';
    else if (low.includes('inactiv')) topic = 'Inactivity Rule';
    else if (low.includes('minimum trading day')) topic = 'Minimum Trading Days';
    else if (low.includes('copy')) topic = 'Copy Trading';
    else if (low.includes('expert advisor') || low.includes(' ea ')) topic = 'Expert Advisors';
    out.push({ topic, rawText: s.trim(), sourceUrl: pageUrl, sourceTitle: pageTitle, sourceType });
    if (out.length >= 50) break;
  }
  return out;
}

export interface ReviewItem {
  id: string;
  reason: string;
  topic: string;
  excerpt: string;
  sourceUrl: string;
}

/** Review queue: ambiguous, conflicting, outdated, or low-confidence extractions. */
export function buildReviewQueue(facts: RawExtractedFact[], conflicts: RuleConflict[]): ReviewItem[] {
  const queue: ReviewItem[] = [];
  for (const f of facts) {
    const low = f.rawText.toLowerCase();
    const ambiguous = ['may', 'might', 'usually', 'generally', 'up to', 'subject to', 'at our discretion'].some((w) => low.includes(w));
    if (ambiguous) {
      queue.push({ id: `review-${queue.length + 1}`, reason: 'Ambiguous language requires human interpretation', topic: f.topic, excerpt: f.rawText.slice(0, 200), sourceUrl: f.sourceUrl });
    }
  }
  for (const c of conflicts) {
    queue.push({ id: `review-conflict-${c.id}`, reason: 'Conflicting sources require manual resolution', topic: c.topic, excerpt: c.discrepancy.slice(0, 200), sourceUrl: c.sourceA.url });
  }
  return queue.slice(0, 100);
}

export function assignConfidence(sourceType: EvidenceClass, hasCorroboration: boolean): ConfidenceRating {
  if (sourceType === 'OFFICIAL_TERMS' || sourceType === 'OFFICIAL') return hasCorroboration ? 'A' : 'B';
  if (sourceType === 'OFFICIAL_SUPPORT') return 'B';
  if (sourceType === 'FIRM_RESPONSE') return 'B';
  if (sourceType === 'REVIEW_PLATFORM') return 'C';
  if (sourceType === 'TRADER_REPORT') return 'D';
  return 'E';
}

export function evidenceForVerification(
  id: string, url: string, title: string, excerpt: string, sourceType: EvidenceClass, retrievedAt: string
): SourceEvidence {
  const corroborated = false;
  return {
    id, sourceUrl: url, sourceTitle: title, sourceType, sourceExcerpt: excerpt,
    retrievedAt, confidence: assignConfidence(sourceType, corroborated),
    verificationStatus: sourceType === 'UNVERIFIED' ? 'UNVERIFIED' : 'PARTIALLY_VERIFIED',
  };
}
