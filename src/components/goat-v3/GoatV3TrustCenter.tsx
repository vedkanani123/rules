import React, { useState } from 'react';
import { VerificationStatus } from '../../data/goatCanonicalData.ts';
import {
  ShieldCheck,
  ShieldAlert,
  HelpCircle,
  CheckCircle2,
  AlertTriangle,
  FileText,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Building,
  Scale,
} from 'lucide-react';

export const GoatV3TrustCenter: React.FC = () => {
  const [selectedStatus, setSelectedStatus] = useState<VerificationStatus | null>(
    'officially_verified'
  );

  const verificationLevels: Array<{
    status: VerificationStatus;
    title: string;
    badge: string;
    color: string;
    description: string;
    criteria: string;
    example: string;
  }> = [
    {
      status: 'officially_verified',
      title: 'Officially Verified',
      badge: 'Tier 1 Evidence',
      color: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10',
      description: 'Confirmed directly from active official GFT documentation, terms of service, or checkout contracts.',
      criteria: 'Direct match with public GFT help articles, client agreement, or API data within the last 30 days.',
      example: '2-Step Standard 10% static drawdown floor, 5% daily loss limit, and 4 valid trading days.',
    },
    {
      status: 'official_ambiguous',
      title: 'Official but Ambiguous',
      badge: 'Tier 2 Caveat',
      color: 'text-sky-400 border-sky-500/30 bg-sky-500/10',
      description: 'Stated in official documentation but lacks complete technical definitions or contradicts other marketing materials.',
      criteria: 'Mentioned in FAQ but missing critical edge-case clauses (e.g. exact weekend rollover spread tolerance).',
      example: 'Whether crypto weekend trading incurs financing rollover charges on demo accounts during weekends.',
    },
    {
      status: 'historical_rule',
      title: 'Historical / Grandfathered',
      badge: 'Archived Rule',
      color: 'text-purple-400 border-purple-500/30 bg-purple-500/10',
      description: 'Officially enacted in a prior version. Retained exclusively for accounts purchased before a documented cutoff date.',
      criteria: 'Explicitly superseded by a dated firm changelog or product retirement announcement.',
      example: '2-Step PRO (discontinued June 13, 2026) and Instant Standard (discontinued Sept 22, 2025).',
    },
    {
      status: 'conflicting_sources',
      title: 'Conflicting Sources',
      badge: 'Active Discrepancy',
      color: 'text-amber-400 border-amber-500/30 bg-amber-500/10',
      description: 'Two or more official GFT channels (e.g. Website vs Discord vs FAQ) provide differing rules or metrics.',
      criteria: 'Simultaneous conflicting public statements without a clarifying unifying announcement.',
      example: '1-Step daily loss stated as 4% on legacy marketing banners, but enforced as 3% on accounts bought after Aug 1, 2026.',
    },
    {
      status: 'third_party_report',
      title: 'Third-Party Report',
      badge: 'External Audit',
      color: 'text-blue-400 border-blue-500/30 bg-blue-500/10',
      description: 'Information compiled from analytical prop directories, partner brokers, or payment processors.',
      criteria: 'Reported by PropFirmMatch or financial aggregators without direct GFT terms citation.',
      example: 'Average payout processing time statistics across all users.',
    },
    {
      status: 'community_reported',
      title: 'Community-Reported',
      badge: 'Trader Field Experience',
      color: 'text-indigo-400 border-indigo-500/30 bg-indigo-500/10',
      description: 'Direct experiences reported by verified traders in Trustpilot reviews, Discord channels, or Reddit.',
      criteria: 'User review or screenshot testimony; not presented as an official firm rule.',
      example: 'Support response times during KYC video verification.',
    },
    {
      status: 'unverified_claim',
      title: 'Unverified Claim',
      badge: 'Unconfirmed',
      color: 'text-rose-400 border-rose-500/30 bg-rose-500/10',
      description: 'Allegations or rumors that lack corroborating documentation. Never presented as fact.',
      criteria: 'Anonymous forum posts without trading statements or official confirmation.',
      example: 'Unsubstantiated claims regarding simulated slippage injection.',
    },
  ];

  return (
    <section id="trust" className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-sky-400" />
            Trust & Verification Framework
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            Our strict 7-tier epistemic verification hierarchy. We never present an allegation, estimate, or review as an official rule.
          </p>
        </div>
      </div>

      {/* Corporate Registry & Entity Transparency Box */}
      <div className="p-4 rounded-2xl bg-[#111318] border border-[#1F2228] grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
        <div className="space-y-1.5 p-3 rounded-xl bg-black/30 border border-white/[0.04]">
          <div className="flex items-center gap-2 text-white font-bold">
            <Building className="w-4 h-4 text-blue-400" />
            Commercial Entity (Hong Kong)
          </div>
          <div className="text-slate-300 font-medium">Wishes Tower International Limited</div>
          <p className="text-slate-400 text-[11px]">
            Company No: <span className="font-mono text-white">76428795</span> · Wan Chai, Hong Kong.
            Responsible for brand marketing, global promotion, and billing operations.
          </p>
        </div>

        <div className="space-y-1.5 p-3 rounded-xl bg-black/30 border border-white/[0.04]">
          <div className="flex items-center gap-2 text-white font-bold">
            <Building className="w-4 h-4 text-indigo-400" />
            Technology Operator (Saint Lucia)
          </div>
          <div className="text-slate-300 font-medium">Goat Funded LTD</div>
          <p className="text-slate-400 text-[11px]">
            Company No: <span className="font-mono text-white">2025-00240</span> · Rodney Bay, Saint Lucia.
            Responsible for simulated trading accounts, risk monitoring, and server execution.
          </p>
        </div>
      </div>

      {/* The 7 Verification Levels Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {verificationLevels.map((lvl) => {
          const isSelected = selectedStatus === lvl.status;

          return (
            <div
              key={lvl.status}
              onClick={() => setSelectedStatus(isSelected ? null : lvl.status)}
              className={`p-4 rounded-xl border transition-all cursor-pointer ${
                isSelected
                  ? 'bg-[#141824] border-blue-500/60 shadow-md shadow-blue-500/10'
                  : 'bg-[#111318] hover:bg-[#151820] border-[#1F2228]'
              }`}
            >
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className={`text-[10px] px-2 py-0.5 rounded font-mono font-bold border ${lvl.color}`}>
                  {lvl.badge}
                </span>
                <span className="text-[11px] text-slate-400">Click to inspect</span>
              </div>

              <h3 className="text-sm font-bold text-white mb-1">{lvl.title}</h3>
              <p className="text-xs text-slate-300 leading-relaxed mb-2">{lvl.description}</p>

              {isSelected && (
                <div className="pt-2 border-t border-white/[0.06] space-y-2 text-[11px] animate-fadeIn">
                  <div>
                    <span className="text-slate-400 block font-semibold">Verification Standard:</span>
                    <span className="text-slate-300">{lvl.criteria}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-semibold">Representative Example:</span>
                    <span className="text-slate-300 font-mono">{lvl.example}</span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
};
