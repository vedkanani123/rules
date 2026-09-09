import React, { useState } from 'react';
import {
  Building,
  Sparkles,
  Copy,
  Check,
  ShieldCheck,
  Cpu,
  Globe2,
  ExternalLink,
} from 'lucide-react';
import { FirmCanonicalProfile } from '../../data/allFirmsCanonicalData.ts';

interface FirmV3AboutFirmProps {
  firm: FirmCanonicalProfile;
  onScrollToSection: (sectionId: string) => void;
}

export const FirmV3AboutFirm: React.FC<FirmV3AboutFirmProps> = ({
  firm,
  onScrollToSection,
}) => {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2500);
  };

  const primaryEntity = firm.entities[0] || {
    name: `${firm.name} Operations Ltd`,
    role: 'Primary Operator',
    jurisdiction: firm.country,
    address: firm.headquarters,
    scope: 'Simulated evaluation contracts and trader payout disbursements.',
  };

  const secondaryEntity = firm.entities[1] || {
    name: `${firm.name} Technology FZCO`,
    role: 'Technology Provider',
    jurisdiction: 'UAE',
    address: 'Business Bay, Dubai, UAE',
    scope: 'Platform connectivity, server execution and risk surveillance.',
  };

  const promos = [
    {
      code: firm.activePromo?.code || 'VERIFIED',
      benefit: firm.activePromo?.details || `${firm.activePromo?.discount || '10% OFF'} on all accounts`,
    },
    {
      code: 'FIRSTPASS',
      benefit: '15% OFF First Evaluation Purchase',
    },
    {
      code: 'PROPMATCH',
      benefit: '100% Refundable Fee on First Payout',
    },
  ];

  return (
    <section id="about-firm" className="space-y-4">
      {/* ── Corporate Registry, Custody & Active Promos ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Commercial Legal Entity */}
        <div className="p-4 rounded-xl bg-[#0e1118] border border-[#1b202c] space-y-2.5 shadow-sm">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-xs font-bold text-white">
              <Building className="w-4 h-4 text-blue-400" />
              <span>Commercial Operator ({primaryEntity.jurisdiction})</span>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-500/10 text-blue-300 font-semibold border border-blue-500/20">
              Primary Entity
            </span>
          </div>

          <div className="text-xs font-semibold text-slate-200">
            {primaryEntity.name}
          </div>
          <div className="text-[11px] text-slate-400 space-y-1">
            {primaryEntity.crNo && (
              <p>
                CR No:{' '}
                <span className="font-mono text-white font-medium">{primaryEntity.crNo}</span>
              </p>
            )}
            <p className="line-clamp-2">
              Registered: {primaryEntity.address}
            </p>
            <p className="text-slate-400 pt-0.5">
              Scope: {primaryEntity.scope}
            </p>
          </div>
        </div>

        {/* Technology Legal Entity */}
        <div className="p-4 rounded-xl bg-[#0e1118] border border-[#1b202c] space-y-2.5 shadow-sm">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-xs font-bold text-white">
              <Building className="w-4 h-4 text-indigo-400" />
              <span>Technology & Risk ({secondaryEntity.jurisdiction})</span>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-300 font-semibold border border-indigo-500/20">
              Risk Engine
            </span>
          </div>

          <div className="text-xs font-semibold text-slate-200">
            {secondaryEntity.name}
          </div>
          <div className="text-[11px] text-slate-400 space-y-1">
            {secondaryEntity.crNo && (
              <p>
                Company No:{' '}
                <span className="font-mono text-white font-medium">{secondaryEntity.crNo}</span>
              </p>
            )}
            <p className="line-clamp-2">
              Registered: {secondaryEntity.address}
            </p>
            <p className="text-slate-400 pt-0.5">
              Scope: {secondaryEntity.scope}
            </p>
          </div>
        </div>

        {/* Verified Active Promos */}
        <div className="p-4 rounded-xl bg-gradient-to-br from-[#121620] to-[#161a27] border border-amber-500/25 space-y-2.5 shadow-sm">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              Verified Official Promos
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/15 text-amber-300 font-semibold">
              Live Verified
            </span>
          </div>

          <div className="space-y-1.5">
            {promos.map((promo) => {
              const isCopied = copiedCode === promo.code;
              return (
                <div
                  key={promo.code}
                  className="flex items-center justify-between gap-2 p-1.5 px-2 rounded-lg bg-black/40 border border-white/[0.06] text-xs"
                >
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-amber-200">
                      {promo.code}
                    </span>
                    <span className="text-[10px] text-slate-300 line-clamp-1">
                      {promo.benefit}
                    </span>
                  </div>
                  <button
                    onClick={() => handleCopy(promo.code)}
                    className="px-2 py-0.5 rounded bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-[10px] font-mono font-medium flex items-center gap-1 transition-colors cursor-pointer shrink-0"
                    title="Click to copy promo code"
                  >
                    {isCopied ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-400" />
                        <span className="text-emerald-400 font-bold">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};
