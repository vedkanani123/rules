import React from 'react';

export type TrustStatus =
  | 'Verified'
  | 'Partially verified'
  | 'Needs review'
  | 'Conflicting'
  | 'Unknown'
  | 'Outdated'
  | 'Unavailable'
  | 'Not applicable';

const STYLES: Record<TrustStatus, string> = {
  'Verified': 'bg-emerald-500/10 text-emerald-300 border-emerald-500/25',
  'Partially verified': 'bg-sky-500/10 text-sky-300 border-sky-500/25',
  'Needs review': 'bg-amber-500/10 text-amber-300 border-amber-500/25',
  'Conflicting': 'bg-red-500/10 text-red-300 border-red-500/25',
  'Unknown': 'bg-white/[0.04] text-white/50 border-white/10',
  'Outdated': 'bg-orange-500/10 text-orange-300 border-orange-500/25',
  'Unavailable': 'bg-white/[0.04] text-white/40 border-white/10',
  'Not applicable': 'bg-white/[0.04] text-white/40 border-white/10',
};

export const TrustBadge: React.FC<{ status: TrustStatus; note?: string }> = ({ status, note }) => (
  <span
    title={note ?? status}
    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium border ${STYLES[status]}`}
  >
    <span className="w-1.5 h-1.5 rounded-full bg-current" />
    {status}
  </span>
);

export const UnknownNotice: React.FC<{ message?: string }> = ({ message }) => (
  <div className="p-3 rounded-xl bg-white/[0.03] border border-white/10 text-xs leading-relaxed text-white/60">
    <span className="font-semibold text-white/80">Unknown — </span>
    {message ?? 'Not publicly stated or not yet verified. Do not rely on this for a trading or purchase decision.'}
  </div>
);

export const VerificationWarning: React.FC = () => (
  <div className="p-3 rounded-xl bg-amber-500/[0.07] border border-amber-500/20 text-xs leading-relaxed text-amber-200/90">
    Rules under verification. Do not rely on this data for a trading or purchase decision until the source has been reviewed.
  </div>
);
