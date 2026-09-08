// Intent-aware search: understands rule intent, not just firm names.
// Never fabricates results. Unknown stays unknown. No-result returns alternatives.

import { getCanonicalFirms, getAllCanonicalAccounts } from '../canonical/store.ts';

export interface SearchResultItem {
  type: 'firm' | 'account' | 'rule' | 'guide';
  title: string;
  subtitle: string;
  path: string;
  tag: string;
  verification: string;
}

const INTENT_PATTERNS: { intent: string; keywords: string[]; suggestion: string }[] = [
  { intent: 'news', keywords: ['news'], suggestion: 'Firms with news-trading rules' },
  { intent: 'overnight', keywords: ['overnight', 'swing'], suggestion: 'Firms allowing overnight trading' },
  { intent: 'weekend', keywords: ['weekend', 'hold over weekend'], suggestion: 'Accounts with weekend holding' },
  { intent: 'ea', keywords: ['ea', 'expert advisor', 'automated', 'bot'], suggestion: 'Firms allowing Expert Advisors' },
  { intent: 'copy', keywords: ['copy'], suggestion: 'Accounts with copy-trading policy' },
  { intent: 'consistency', keywords: ['consistency', 'no consistency'], suggestion: 'Accounts with no consistency rule' },
  { intent: 'trailing', keywords: ['trailing', 'drawdown'], suggestion: 'Accounts by drawdown type' },
  { intent: 'instant', keywords: ['instant'], suggestion: 'Instant funding accounts' },
  { intent: 'payout', keywords: ['payout', 'withdraw'], suggestion: 'Firms by payout timing' },
  { intent: 'minimum trading days', keywords: ['minimum trading day', 'min day'], suggestion: 'Firms with low minimum trading days' },
  { intent: 'inactivity', keywords: ['inactivity', 'inactive'], suggestion: 'Accounts by inactivity limit' },
  { intent: 'price', keywords: ['under', 'cheap', 'price', 'cost', '$'], suggestion: 'Accounts under a price' },
];

export function detectIntents(query: string): string[] {
  const q = query.toLowerCase();
  return INTENT_PATTERNS.filter((p) => p.keywords.some((k) => q.includes(k))).map((p) => p.intent);
}

function matchesRuleIntent(ruleName: string, ruleText: string, intents: string[]): boolean {
  if (intents.length === 0) return true;
  const hay = `${ruleName} ${ruleText}`.toLowerCase();
  return intents.some((intent) => {
    const pat = INTENT_PATTERNS.find((p) => p.intent === intent);
    return pat ? pat.keywords.some((k) => hay.includes(k)) : false;
  });
}

export function searchAll(query: string): { results: SearchResultItem[]; intents: string[]; alternatives: string[] } {
  const q = query.toLowerCase().trim();
  const intents = detectIntents(q);
  const results: SearchResultItem[] = [];
  if (!q) return { results, intents, alternatives: [] };

  const firms = getCanonicalFirms();
  const priceMatch = q.match(/\$?\s?(\d[\d,]*)/);
  const priceCap = priceMatch ? Number(priceMatch[1].replace(/,/g, '')) : null;
  const sizeMatch = q.match(/(\d+)\s?k/);

  for (const firm of firms) {
    if (firm.name.toLowerCase().includes(q) || firm.slug.includes(q.replace(/\s+/g, '-'))) {
      results.push({
        type: 'firm',
        title: firm.name,
        subtitle: `Status: ${firm.status} · Verified rules: ${firm.rules.length} · Last verified ${firm.lastVerified}`,
        path: `/prop-firms/${firm.slug}`,
        tag: 'Prop Firm',
        verification: firm.confidenceRating === 'A' ? 'Verified' : 'Partially verified',
      });
    }
    for (const rule of firm.rules) {
      const hay = `${rule.name} ${rule.plainEnglish} ${rule.category}`.toLowerCase();
      if (hay.includes(q) || (intents.length > 0 && matchesRuleIntent(rule.name, rule.plainEnglish, intents))) {
        const verified = rule.sources.some((s) => s.verificationStatus === 'VERIFIED');
        results.push({
          type: 'rule',
          title: `${rule.name} — ${firm.name}`,
          subtitle: `${rule.headlineValue} · ${verified ? 'Verified' : 'Needs review'} · ${rule.stageScope}`,
          path: `/prop-firms/${firm.slug}#rule-card-${rule.slug}`,
          tag: rule.category,
          verification: verified ? 'Verified' : 'Needs review',
        });
      }
    }
  }

  for (const { firm, account } of getAllCanonicalAccounts()) {
    const hay = `${account.name} ${account.drawdownType} ${account.platforms.join(' ')}`.toLowerCase();
    let match = hay.includes(q);
    if (priceCap !== null && !account.priceUnknown && (account.discountedPrice ?? account.price) <= priceCap) match = true;
    if (sizeMatch && account.nominalSize === Number(sizeMatch[1]) * 1000) match = true;
    // Intent filters: only include explicitly verified values, never Unknown-as-allowed
    if (intents.includes('ea') && q.includes('allow')) match = account.eaAllowed === true && hay.includes(q.split(' ')[0]);
    if (match) {
      results.push({
        type: 'account',
        title: `${account.name} (${firm.name})`,
        subtitle: `Daily ${account.dailyLossLimit}% · Max ${account.maxTotalLoss}% · Split ${account.profitSplit}% · ${account.priceUnknown ? 'Price unknown' : `$${account.discountedPrice ?? account.price}`}`,
        path: `/prop-firms/${firm.slug}/accounts/${account.id}`,
        tag: 'Account',
        verification: account.lastVerified || firm.lastVerified,
      });
    }
  }

  // Cap + dedupe
  const seen = new Set<string>();
  const deduped = results.filter((r) => {
    if (seen.has(r.path)) return false;
    seen.add(r.path);
    return true;
  });

  const alternatives = deduped.length === 0
    ? [
        'Firms allowing overnight trading',
        'Accounts with no consistency rule',
        'Instant funding accounts',
        'Firms with low minimum trading days',
      ]
    : [];

  return { results: deduped.slice(0, 20), intents, alternatives };
}
