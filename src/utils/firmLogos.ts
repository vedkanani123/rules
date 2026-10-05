// Official self-hosted company logos for all 24 prop firms across the directory

const SELF_HOSTED_FIRM_LOGOS: Record<string, string> = {
  // Canonical and alternate slugs
  'ftmo': '/logos/ftmo.svg',
  'goat-funded-trader': '/goat-brand-logo.png',
  'funding-pips': '/logos/funding-pips.svg',
  'fundingpips': '/logos/funding-pips.svg',
  'fundednext': '/logos/fundednext.svg',
  'funded-next': '/logos/fundednext.svg',
  'the-5ers': '/logos/the-5ers.svg',
  'the-5-ers': '/logos/the-5ers.svg',
  'the5ers': '/logos/the-5ers.svg',
  'topstep': '/logos/topstep.webp',
  'apex-trader-funding': '/logos/apex-trader-funding.png',
  'take-profit-trader': '/logos/take-profit-trader.svg',
  'e8-markets': '/logos/e8-markets.svg',
  'alpha-capital-group': '/logos/alpha-capital-group.svg',
  'alpha-capital': '/logos/alpha-capital-group.svg',
  'alphacapitalgroup': '/logos/alpha-capital-group.svg',
  'alphacapital': '/logos/alpha-capital-group.svg',
  'lark-funding': '/logos/lark-funding.svg',
  'larkfunding': '/logos/lark-funding.svg',
  'aquafunded': '/logos/aquafunded.svg',
  'aqua-funded': '/logos/aquafunded.svg',
  'blue-guardian': '/logos/blue-guardian.png',
  'blueguardian': '/logos/blue-guardian.png',
  'brightfunded': '/logos/brightfunded.jpg',
  'bright-funded': '/logos/brightfunded.jpg',
  'moneta-funded': '/logos/moneta-funded.png',
  'monetafunded': '/logos/moneta-funded.png',
  'maven-trading': '/logos/maven-trading.png',
  'maventrading': '/logos/maven-trading.png',
  'for-traders': '/logos/for-traders.png',
  'fortraders': '/logos/for-traders.png',
  'crypto-fund-trader': '/logos/crypto-fund-trader.svg',
  'crypto-funded-trader': '/logos/crypto-fund-trader.svg',
  'cryptofundtrader': '/logos/crypto-fund-trader.svg',
  'cryptofundedtrader': '/logos/crypto-fund-trader.svg',
  'top-one-trader': '/logos/top-one-trader.svg',
  'toponetrader': '/logos/top-one-trader.svg',
  'fundedelite': '/logos/fundedelite.svg',
  'funded-elite': '/logos/fundedelite.svg',
  'hola-prime': '/logos/hola-prime.png',
  'holaprime': '/logos/hola-prime.png',
  'atlas-funded': '/logos/atlas-funded.png',
  'atlasfunded': '/logos/atlas-funded.png',
  'atmos-funded': '/logos/atmos-funded.svg',
  'atmosfunded': '/logos/atmos-funded.svg',
  'shark-funded': '/sharkfunded-logo.png',
  'sharkfunded': '/sharkfunded-logo.png',
  'funded-trading-plus': '/logos/funded-trading-plus.png',
  'fundedtradingplus': '/logos/funded-trading-plus.png',
};

const FIRM_COLORS: Record<string, string> = {
  'ftmo': '#0A84FF',
  'goat-funded-trader': '#10B981',
  'funding-pips': '#F59E0B',
  'fundednext': '#8B5CF6',
  'the-5ers': '#EC4899',
  'topstep': '#06B6D4',
  'apex-trader-funding': '#EF4444',
  'take-profit-trader': '#14B8A6',
  'e8-markets': '#6366F1',
  'alpha-capital-group': '#F97316',
  'lark-funding': '#84CC16',
  'aquafunded': '#22D3EE',
  'blue-guardian': '#3B82F6',
  'brightfunded': '#FBBF24',
  'moneta-funded': '#A78BFA',
  'maven-trading': '#34D399',
  'for-traders': '#FB923C',
  'crypto-fund-trader': '#A855F7',
  'top-one-trader': '#F43F5E',
  'fundedelite': '#2DD4BF',
  'hola-prime': '#E879F9',
  'atlas-funded': '#60A5FA',
  'atmos-funded': '#60A5FA',
  'shark-funded': '#64748B',
  'funded-trading-plus': '#4ADE80',
};

function getInitials(name: string): string {
  const words = name.replace(/[^a-zA-Z0-9 ]/g, '').split(/\s+/).filter(Boolean);
  if (words.length >= 2) return (words[0][0] + words[1][0]).toUpperCase();
  return (words[0]?.substring(0, 2) || '??').toUpperCase();
}

export function getFirmLogoUrl(slug: string, firmName: string): string {
  const cleanSlug = (slug || '').trim().toLowerCase();
  if (SELF_HOSTED_FIRM_LOGOS[cleanSlug]) {
    return SELF_HOSTED_FIRM_LOGOS[cleanSlug];
  }
  const compactSlug = cleanSlug.replace(/[^a-z0-9]/g, '');
  if (SELF_HOSTED_FIRM_LOGOS[compactSlug]) {
    return SELF_HOSTED_FIRM_LOGOS[compactSlug];
  }
  const compactName = (firmName || '').trim().toLowerCase().replace(/[^a-z0-9]/g, '');
  if (SELF_HOSTED_FIRM_LOGOS[compactName]) {
    return SELF_HOSTED_FIRM_LOGOS[compactName];
  }

  // Fallback SVG monogram for any unknown future firm
  const color = FIRM_COLORS[cleanSlug] || '#6B7280';
  const initials = getInitials(firmName || slug || '??');
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64"><rect width="64" height="64" rx="12" fill="${color}"/><text x="32" y="32" text-anchor="middle" dominant-baseline="central" font-family="system-ui,-apple-system,sans-serif" font-weight="700" font-size="22" fill="white">${initials}</text></svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

// Map of slug to country code for display
export const FIRM_COUNTRIES: Record<string, { code: string; name: string }> = {
  'ftmo': { code: 'CZ', name: 'Czech Republic' },
  'goat-funded-trader': { code: 'LC', name: 'Saint Lucia' },
  'funding-pips': { code: 'AE', name: 'UAE' },
  'fundednext': { code: 'AE', name: 'UAE' },
  'funded-next': { code: 'AE', name: 'UAE' },
  'the-5ers': { code: 'IL', name: 'Israel' },
  'the-5-ers': { code: 'IL', name: 'Israel' },
  'topstep': { code: 'US', name: 'United States' },
  'apex-trader-funding': { code: 'US', name: 'United States' },
  'take-profit-trader': { code: 'US', name: 'United States' },
  'e8-markets': { code: 'US', name: 'United States' },
  'alpha-capital-group': { code: 'GB', name: 'United Kingdom' },
  'alpha-capital': { code: 'GB', name: 'United Kingdom' },
  'lark-funding': { code: 'CA', name: 'Canada' },
  'aquafunded': { code: 'AE', name: 'UAE' },
  'aqua-funded': { code: 'AE', name: 'UAE' },
  'blue-guardian': { code: 'AE', name: 'UAE' },
  'brightfunded': { code: 'NL', name: 'Netherlands' },
  'bright-funded': { code: 'NL', name: 'Netherlands' },
  'moneta-funded': { code: 'AU', name: 'Australia' },
  'maven-trading': { code: 'CA', name: 'Canada' },
  'for-traders': { code: 'CZ', name: 'Czech Republic' },
  'crypto-fund-trader': { code: 'CH', name: 'Switzerland' },
  'crypto-funded-trader': { code: 'CH', name: 'Switzerland' },
  'top-one-trader': { code: 'US', name: 'United States' },
  'fundedelite': { code: 'IT', name: 'Italy' },
  'funded-elite': { code: 'IT', name: 'Italy' },
  'hola-prime': { code: 'HK', name: 'Hong Kong' },
  'atlas-funded': { code: 'GB', name: 'United Kingdom' },
  'atmos-funded': { code: 'AE', name: 'UAE' },
  'shark-funded': { code: 'LC', name: 'Saint Lucia' },
  'funded-trading-plus': { code: 'GB', name: 'United Kingdom' },
};

export function getCountryFlag(countryCodeOrSlug: string): string {
  const clean = (countryCodeOrSlug || '').trim();
  if (!clean) return '';
  if (clean.length === 2) {
    return `https://flagcdn.com/w80/${clean.toLowerCase()}.png`;
  }
  const mapped = FIRM_COUNTRIES[clean.toLowerCase()];
  if (mapped) {
    return `https://flagcdn.com/w80/${mapped.code.toLowerCase()}.png`;
  }
  return '';
}

