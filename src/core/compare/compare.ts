// Evidence-aware comparison: rank by fit to stated requirements, never "best for everyone".
// Affiliate relationships never influence factual ranking.

import type { AccountTier, PropFirm } from '../../types/schema.ts';

export interface FitRequirement {
  needNews?: 'allowed' | 'any';
  needOvernight?: boolean;
  needWeekend?: boolean;
  needEA?: boolean;
  maxPrice?: number;
  needNoConsistency?: boolean;
  needInstantPayout?: boolean;
}

export interface FitScore {
  accountId: string;
  firmName: string;
  accountName: string;
  score: number; // 0-100
  reasons: string[];
  warnings: string[];
  evidenceQuality: 'high' | 'medium' | 'low';
}

export function scoreAccountFit(
  firm: PropFirm,
  account: AccountTier,
  req: FitRequirement
): FitScore {
  const reasons: string[] = [];
  const warnings: string[] = [];
  let score = 50;

  const hasEvidence = account.sources.length > 0 || firm.rules.length > 0;
  const evidenceQuality = account.sources.length > 0 ? 'high' : firm.rules.length > 0 ? 'medium' : 'low';
  if (!hasEvidence) warnings.push('No account-level evidence — values are firm-published parameters pending clause citation.');

  if (req.needNews === 'allowed') {
    if (account.newsTradingRule === 'Allowed') { score += 12; reasons.push('News trading explicitly allowed.'); }
    else if (account.newsTradingRule === 'Restricted') { score += 2; warnings.push('News trading conditional — check 2-min buffer.'); }
    else { score -= 15; warnings.push('News trading prohibited for this account.'); }
  }
  if (req.needOvernight) {
    if (account.overnightHolding) { score += 8; reasons.push('Overnight holding allowed.'); }
    else { score -= 12; warnings.push('No overnight holding — must close before market close.'); }
  }
  if (req.needWeekend) {
    if (account.weekendHolding) { score += 8; reasons.push('Weekend holding allowed.'); }
    else { score -= 12; warnings.push('No weekend holding.'); }
  }
  if (req.needEA) {
    // Unknown must remain separate — only explicit true counts
    if (account.eaAllowed === true) { score += 8; reasons.push('Expert Advisors explicitly allowed.'); }
    else { score -= 10; warnings.push('EAs not explicitly allowed — treated as prohibited/unknown.'); }
  }
  if (req.maxPrice !== undefined) {
    if (account.priceUnknown) {
      warnings.push('Price not publicly verified — budget check skipped.');
    } else {
      const price = account.discountedPrice ?? account.price;
      if (price <= req.maxPrice) { score += 6; reasons.push(`Price $${price} within budget $${req.maxPrice}.`); }
      else { score -= 8; warnings.push(`Price $${price} exceeds budget $${req.maxPrice}.`); }
    }
  }
  if (req.needNoConsistency) {
    const noConsistency = !account.consistencyRule || account.consistencyRule.toLowerCase().includes('none');
    if (noConsistency) { score += 8; reasons.push('No consistency rule.'); }
    else { score -= 6; warnings.push(`Consistency rule applies: ${account.consistencyRule}`); }
  }

  // Cost awareness: total cost = price + refundability
  if (account.refundableFee) { score += 3; reasons.push('Fee refundable on payout.'); }
  else warnings.push('Fee non-refundable — treat as sunk cost.');

  score = Math.max(0, Math.min(100, score));
  return { accountId: account.id, firmName: firm.name, accountName: account.name, score, reasons, warnings, evidenceQuality };
}

export function labelForFit(score: number, context: string): string {
  return `Best match for ${context} (${score}/100) — based on verified rules, not sponsorship.`;
}

export const AFFILIATE_DISCLOSURE =
  'Rankings use verified rule data only. Affiliate relationships, if any, never influence factual comparison and are disclosed separately.';
