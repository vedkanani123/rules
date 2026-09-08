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

interface GoatV3AboutFirmProps {
  onScrollToSection: (sectionId: string) => void;
}

export const GoatV3AboutFirm: React.FC<GoatV3AboutFirmProps> = ({ onScrollToSection }) => {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2500);
  };

  return (
    <section id="about-firm" className="space-y-4">
      {/* ── Corporate Registry, Custody & Active Promos ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Commercial Legal Entity */}
        <div className="p-4 rounded-xl bg-[#0e1118] border border-[#1b202c] space-y-2.5 shadow-sm">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-xs font-bold text-white">
              <Building className="w-4 h-4 text-blue-400" />
              <span>Commercial Operator (Hong Kong)</span>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-500/10 text-blue-300 font-semibold border border-blue-500/20">
              Primary Entity
            </span>
          </div>

          <div className="text-xs font-semibold text-slate-200">
            Wishes Tower International Limited
          </div>
          <div className="text-[11px] text-slate-400 space-y-1">
            <p>
              CR No:{' '}
              <span className="font-mono text-white font-medium">76428795</span>
            </p>
            <p className="line-clamp-2">
              Registered: M 1205, 12/F, Beverly Hse, 93-107 Lockhart Rd, Wan Chai, Hong Kong
            </p>
            <p className="text-slate-400 pt-0.5">
              Scope: Brand management, marketing agreements, and billing operations.
            </p>
          </div>
        </div>

        {/* Technology Legal Entity */}
        <div className="p-4 rounded-xl bg-[#0e1118] border border-[#1b202c] space-y-2.5 shadow-sm">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-xs font-bold text-white">
              <Building className="w-4 h-4 text-indigo-400" />
              <span>Technology Operator (Saint Lucia)</span>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-300 font-semibold border border-indigo-500/20">
              Risk Engine
            </span>
          </div>

          <div className="text-xs font-semibold text-slate-200">
            Goat Funded LTD
          </div>
          <div className="text-[11px] text-slate-400 space-y-1">
            <p>
              Company No:{' '}
              <span className="font-mono text-white font-medium">2025-00240</span>
            </p>
            <p className="line-clamp-2">
              Registered: Ground Floor, The Sotheby Building, Rodney Village, Rodney Bay, Saint Lucia
            </p>
            <p className="text-slate-400 pt-0.5">
              Scope: Simulated trading accounts, risk monitoring &amp; server execution.
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
            {[
              {
                code: 'BOGO40',
                benefit: '40% OFF + Free BOGO Account',
              },
              {
                code: 'FIRSTGFT',
                benefit: '50% OFF First Evaluation Purchase',
              },
              {
                code: 'BOGO35',
                benefit: 'Pay Later Model Entry from $5',
              },
            ].map((promo) => {
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
