export function formatCurrency(val: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0
  }).format(val);
}

export function formatPct(val: number): string {
  return `${val}%`;
}

export function getConfidenceBadgeClass(grade: string): { bg: string; text: string; border: string } {
  switch (grade) {
    case 'A':
      return { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/30' };
    case 'B':
      return { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/30' };
    case 'C':
      return { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/30' };
    case 'D':
      return { bg: 'bg-orange-500/10', text: 'text-orange-400', border: 'border-orange-500/30' };
    default:
      return { bg: 'bg-zinc-500/10', text: 'text-zinc-400', border: 'border-zinc-500/30' };
  }
}

export function getImportanceBadgeClass(importance: string): { bg: string; text: string; border: string } {
  switch (importance) {
    case 'CRITICAL':
      return { bg: 'bg-rose-500/15', text: 'text-rose-400', border: 'border-rose-500/40' };
    case 'HIGH':
      return { bg: 'bg-amber-500/15', text: 'text-amber-400', border: 'border-amber-500/40' };
    case 'MEDIUM':
      return { bg: 'bg-blue-500/15', text: 'text-blue-400', border: 'border-blue-500/40' };
    default:
      return { bg: 'bg-zinc-500/15', text: 'text-zinc-400', border: 'border-zinc-500/40' };
  }
}

export function getEvidenceClassBadge(eClass: string): { label: string; color: string } {
  switch (eClass) {
    case 'OFFICIAL':
      return { label: 'Official Firm Page', color: 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30' };
    case 'OFFICIAL_SUPPORT':
      return { label: 'Official Help/FAQ', color: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30' };
    case 'OFFICIAL_TERMS':
      return { label: 'Official Legal Terms', color: 'bg-purple-500/15 text-purple-300 border-purple-500/30' };
    case 'OFFICIAL_PROMOTIONAL':
      return { label: 'Marketing/Promo Claim', color: 'bg-yellow-500/15 text-yellow-300 border-yellow-500/30' };
    case 'TRADER_REPORT':
      return { label: 'Trader Report', color: 'bg-orange-500/15 text-orange-300 border-orange-500/30' };
    case 'REVIEW_PLATFORM':
      return { label: 'Review Platform Data', color: 'bg-teal-500/15 text-teal-300 border-teal-500/30' };
    case 'FIRM_RESPONSE':
      return { label: 'Official Firm Reply', color: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30' };
    case 'CONFLICTING':
      return { label: 'Conflicting Evidence', color: 'bg-red-500/15 text-red-300 border-red-500/30' };
    default:
      return { label: eClass, color: 'bg-zinc-500/15 text-zinc-300 border-zinc-500/30' };
  }
}
