// Generates a simple SVG monogram badge for a firm
// Used as a replacement for hotlinked external logos

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
  // Check for self-hosted logos first
  const selfHosted: Record<string, string> = {
    'goat-funded-trader': '/goat-brand-logo.png',
    'shark-funded': '/sharkfunded-logo.png',
  };
  if (selfHosted[slug]) return selfHosted[slug];
  
  // Generate SVG monogram
  const color = FIRM_COLORS[slug] || '#6B7280';
  const initials = getInitials(firmName);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64"><rect width="64" height="64" rx="12" fill="${color}"/><text x="32" y="32" text-anchor="middle" dominant-baseline="central" font-family="system-ui,-apple-system,sans-serif" font-weight="700" font-size="22" fill="white">${initials}</text></svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

export function getCountryFlag(countryCode: string): string {
  // Return a simple text label instead of a flag image
  // This avoids external dependencies and IP issues
  return '';
}

// Map of slug to country code for display
export const FIRM_COUNTRIES: Record<string, { code: string; name: string }> = {
  'ftmo': { code: 'CZ', name: 'Czech Republic' },
  'goat-funded-trader': { code: 'LC', name: 'Saint Lucia' },
  'funding-pips': { code: 'AE', name: 'UAE' },
  'fundednext': { code: 'AE', name: 'UAE' },
  'the-5ers': { code: 'IL', name: 'Israel' },
  'topstep': { code: 'US', name: 'United States' },
  'apex-trader-funding': { code: 'US', name: 'United States' },
  'take-profit-trader': { code: 'US', name: 'United States' },
  'e8-markets': { code: 'US', name: 'United States' },
  'alpha-capital-group': { code: 'GB', name: 'United Kingdom' },
  'lark-funding': { code: 'CA', name: 'Canada' },
  'aquafunded': { code: 'AE', name: 'UAE' },
  'blue-guardian': { code: 'AE', name: 'UAE' },
  'brightfunded': { code: 'NL', name: 'Netherlands' },
  'moneta-funded': { code: 'AU', name: 'Australia' },
  'maven-trading': { code: 'GB', name: 'United Kingdom' },
  'for-traders': { code: 'LC', name: 'Saint Lucia' },
  'crypto-fund-trader': { code: 'ES', name: 'Spain' },
  'top-one-trader': { code: 'HK', name: 'Hong Kong' },
  'fundedelite': { code: 'AE', name: 'UAE' },
  'hola-prime': { code: 'LC', name: 'Saint Lucia' },
  'atlas-funded': { code: 'CY', name: 'Cyprus' },
  'atmos-funded': { code: 'CY', name: 'Cyprus' },
  'shark-funded': { code: 'LC', name: 'Saint Lucia' },
  'funded-trading-plus': { code: 'GB', name: 'United Kingdom' },
};
