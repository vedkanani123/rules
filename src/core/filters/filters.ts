// Verified-data filters with explicit 4-state logic.
// Unknown is NEVER treated as allowed.

import type { AccountTier } from '../../types/schema.ts';

export type TriState = 'allowed' | 'prohibited' | 'conditional' | 'unknown' | 'any';

export interface AccountFilters {
  maxPrice?: number;
  minSize?: number;
  drawdownType?: string | 'any';
  news?: TriState;
  overnight?: TriState;
  weekend?: TriState;
  ea?: TriState;
  copyTrading?: TriState;
  minSplit?: number;
  verificationOnly?: boolean;
}

export function newsStateOf(a: AccountTier): TriState {
  if (a.newsTradingRule === 'Allowed') return 'allowed';
  if (a.newsTradingRule === 'Prohibited') return 'prohibited';
  return 'conditional'; // Restricted
}

export function boolStateOf(value: boolean | undefined): TriState {
  if (value === true) return 'allowed';
  if (value === false) return 'prohibited';
  return 'unknown';
}

export function matchesFilters(a: AccountTier, f: AccountFilters): { pass: boolean; excludedReason?: string } {
  if (f.maxPrice !== undefined && !a.priceUnknown && (a.discountedPrice ?? a.price) > f.maxPrice) {
    return { pass: false, excludedReason: 'price' };
  }
  if (f.minSize !== undefined && a.nominalSize < f.minSize) return { pass: false, excludedReason: 'size' };
  if (f.drawdownType && f.drawdownType !== 'any' && a.drawdownType !== f.drawdownType) {
    return { pass: false, excludedReason: 'drawdownType' };
  }
  if (f.news && f.news !== 'any' && newsStateOf(a) !== f.news) return { pass: false, excludedReason: 'news' };
  if (f.overnight && f.overnight !== 'any' && boolStateOf(a.overnightHolding) !== f.overnight) {
    return { pass: false, excludedReason: 'overnight' };
  }
  if (f.weekend && f.weekend !== 'any' && boolStateOf(a.weekendHolding) !== f.weekend) {
    return { pass: false, excludedReason: 'weekend' };
  }
  if (f.ea && f.ea !== 'any') {
    // 'allowed' includes ONLY explicitly verified allowed accounts
    if (boolStateOf(a.eaAllowed) !== f.ea) return { pass: false, excludedReason: 'ea' };
  }
  if (f.copyTrading && f.copyTrading !== 'any' && boolStateOf(a.copyTradingAllowed) !== f.copyTrading) {
    return { pass: false, excludedReason: 'copy' };
  }
  if (f.minSplit !== undefined && a.profitSplit < f.minSplit) return { pass: false, excludedReason: 'split' };
  if (f.verificationOnly && a.sources.length === 0) return { pass: false, excludedReason: 'verification' };
  return { pass: true };
}
