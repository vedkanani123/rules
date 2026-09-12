import React, { useState } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  Search,
  Calendar,
  Layers,
  Sparkles,
  ExternalLink,
  TrendingUp,
  Scale,
  DollarSign,
  AlertTriangle,
  Flame,
  BookOpen,
  Building,
  Users,
  Star,
  Clock,
  Coins,
  Cpu,
  Globe2,
  Copy,
  Check,
} from 'lucide-react';
import { FirmCanonicalProfile } from '../../data/allFirmsCanonicalData.ts';

interface FirmV3HeaderProps {
  firm: FirmCanonicalProfile;
  onSearchOpen: () => void;
  activeSection: string;
  onSectionClick: (sectionId: string) => void;
  onNavigate: (path: string) => void;
  totalModelsCount: number;
}

export const FirmV3Header: React.FC<FirmV3HeaderProps> = ({
  firm,
  onSearchOpen,
  activeSection,
  onSectionClick,
  onNavigate,
  totalModelsCount,
}) => {
  const [copiedPromo, setCopiedPromo] = useState<string | null>(null);

  const handleCopyPromo = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedPromo(code);
    setTimeout(() => setCopiedPromo(null), 2500);
  };

  const promoCode = firm.activePromo?.code || 'VERIFIED';
  const promoDiscount = firm.activePromo?.discount || '10% OFF';

  const kpis = [
    {
      label: 'Verified Payouts',
      value: firm.totalPayoutsReported,
      sub: 'Documented trader rewards',
      icon: DollarSign,
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/10 border-emerald-500/20',
    },
    {
      label: 'Active Traders',
      value: firm.activeTradersReported,
      sub: 'Global community count',
      icon: Users,
      color: 'text-blue-400',
      bg: 'bg-blue-500/10 border-blue-500/20',
    },
    {
      label: 'Trustpilot Score',
      value: `${firm.reviewScore.toFixed(1)} / 5.0`,
      sub: `${firm.reviewsCount.toLocaleString()} verified reviews`,
      icon: Star,
      color: 'text-amber-400',
      bg: 'bg-amber-500/10 border-amber-500/20',
    },
    {
      label: 'Operating Models',
      value: `${totalModelsCount} Models`,
      sub: '1-Step, 2-Step & Instant',
      icon: Layers,
      color: 'text-purple-400',
      bg: 'bg-purple-500/10 border-purple-500/20',
    },
    {
      label: 'HQ Jurisdiction',
      value: firm.headquarters.split(',')[0],
      sub: `Founded ${firm.foundedYear}`,
      icon: Globe2,
      color: 'text-sky-400',
      bg: 'bg-sky-500/10 border-sky-500/20',
    },
    {
      label: 'Profit Split',
      value: 'Up to 90%–100%',
      sub: 'Milestone scaling ladder',
      icon: Sparkles,
      color: 'text-rose-400',
      bg: 'bg-rose-500/10 border-rose-500/20',
    },
  ];

  return (
    <div className="w-full bg-[#080A10] border-b border-[#1F2228]">
      {/* 1. Sleek Top Compliance / Meta Strip */}
      <div className="w-full bg-[#0a0d16] border-b border-white/[0.05] px-4 sm:px-6 lg:px-8 py-2 text-xs text-slate-300 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2 text-[11px]">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase tracking-wider">
            <ShieldCheck className="w-3 h-3" />
            Grade A Audited
          </span>
          <span className="text-slate-300">
            Official {firm.name} rulebook, multi-model risk engine &amp; corporate transparency dossier.
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-400">
          <span className="flex items-center gap-1">
            <Calendar className="w-3 h-3 text-sky-400" />
            Active Terms: <span className="text-slate-200 font-mono font-medium">Sept 2026</span>
          </span>
          <span className="text-slate-700 hidden sm:inline">•</span>
          <a
            href={firm.website}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-400 hover:text-blue-300 underline flex items-center gap-1"
          >
            Official Website <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>

      {/* 2. Main Brand Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          {/* Logo & Identity */}
          <div className="flex items-start gap-4 sm:gap-5">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-b from-[#1c202d] to-[#10121a] border border-[#2b3244] p-1.5 flex items-center justify-center shadow-2xl shadow-black/80 shrink-0 overflow-hidden">
              <img
                src={firm.logoUrl}
                alt={firm.name}
                width="80"
                height="80"
                decoding="async"
                className="w-full h-full object-contain rounded-xl filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)]"
                onError={(e) => {
                  const target = e.currentTarget as HTMLImageElement;
                  try {
                    const domain = new URL(firm.website || '').hostname;
                    if (domain && !target.src.includes('unavatar.io')) {
                      target.src = 'https://unavatar.io/' + domain;
                      return;
                    }
                  } catch {}
                  target.src = firm.countryFlag;
                }}
              />
            </div>

            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                  {firm.name}
                </h1>
                <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Grade A Verified
                </span>
                <span className="px-2 py-0.5 text-xs font-semibold rounded bg-white/[0.06] text-white/80 border border-white/[0.08]">
                  ACTIVE OPERATIONAL
                </span>
                <span className="px-2.5 py-0.5 text-xs font-mono font-semibold rounded-full bg-blue-500/10 text-blue-300 border border-blue-500/20">
                  TrustScore {firm.trustScore}/100
                </span>
              </div>

              <p className="text-xs sm:text-sm text-slate-300 max-w-3xl leading-relaxed">
                Official Rule Verification, Multi-Model Risk Simulator &amp; Neutral Decision Engine. 
                Transparent corporate operating structure, verified daily loss limits, and audited payout policies.
              </p>

              {/* Corporate Metadata Line */}
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-400 pt-0.5">
                <span className="flex items-center gap-1 text-slate-300">
                  <Globe2 className="w-3.5 h-3.5 text-sky-400" />
                  Founded: <strong className="text-white font-semibold">{firm.foundedYear}</strong>
                </span>
                <span className="text-slate-600">•</span>
                <span className="text-slate-300">
                  Leadership: <strong className="text-white font-semibold">{firm.ceoFounder}</strong>
                </span>
                <span className="text-slate-600">•</span>
                <span className="text-slate-300">
                  HQ: <strong className="text-white font-semibold">{firm.headquarters}</strong>
                </span>
                <span className="text-slate-600">•</span>
                <span className="flex items-center gap-1 text-slate-300">
                  <Cpu className="w-3.5 h-3.5 text-indigo-400" />
                  Platforms: MT5, cTrader, Match-Trader, TradeLocker
                </span>
              </div>
            </div>
          </div>

          {/* Quick Actions & Promo Chip */}
          <div className="flex flex-col sm:flex-row lg:flex-col gap-3 shrink-0">
            {/* Promo Code Box */}
            <div className="p-3 rounded-xl bg-gradient-to-r from-amber-500/15 to-amber-600/10 border border-amber-500/30 flex items-center justify-between gap-3 shadow-lg">
              <div>
                <span className="text-[10px] uppercase font-bold text-amber-400 block tracking-wider">
                  Official Promo ({promoDiscount})
                </span>
                <span className="text-xs text-white font-mono font-bold">
                  Code: {promoCode}
                </span>
              </div>
              <button
                onClick={() => handleCopyPromo(promoCode)}
                className="px-2.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold font-mono flex items-center gap-1 transition-colors cursor-pointer shadow-sm"
              >
                {copiedPromo === promoCode ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-slate-950" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={onSearchOpen}
                className="flex-1 flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl bg-[#111318] hover:bg-[#16181E] border border-[#1F2228] text-slate-300 text-xs font-medium transition-colors group cursor-pointer"
                title="Press Cmd+K or click to search"
              >
                <Search className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-400 transition-colors" />
                <span>Search Rules &amp; Models</span>
                <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] bg-slate-800/80 border border-slate-700/50 rounded text-slate-400 font-mono">
                  ⌘K
                </kbd>
              </button>

              <button
                onClick={() => onSectionClick('comparison')}
                className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-blue-600/20 transition-all cursor-pointer shrink-0"
              >
                <Scale className="w-3.5 h-3.5" />
                <span>Compare</span>
              </button>
            </div>
          </div>
        </div>

        {/* 3. 6 Key Verified Performance & Safety Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-4 border-t border-white/[0.06]">
          {kpis.map((kpi, idx) => {
            const Icon = kpi.icon;
            return (
              <div
                key={idx}
                className="p-3 rounded-xl bg-black/40 border border-white/[0.05] hover:border-white/[0.12] transition-colors"
              >
                <div className="flex items-center justify-between gap-1 mb-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider line-clamp-1">
                    {kpi.label}
                  </span>
                  <div className={`p-1 rounded-md border ${kpi.bg}`}>
                    <Icon className={`w-3 h-3 ${kpi.color}`} />
                  </div>
                </div>
                <div className="text-base sm:text-lg font-black text-white tracking-tight">
                  {kpi.value}
                </div>
                <div className="text-[10px] text-slate-400 line-clamp-1 mt-0.5">
                  {kpi.sub}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
