import React, { useState } from 'react';
import {
  ShieldCheck,
  Award,
  AlertTriangle,
  ExternalLink,
  ChevronRight,
  SlidersHorizontal,
  FileText,
  Copy,
  Check,
  Activity,
  Layers,
  Sparkles,
  Zap,
  Tag
} from 'lucide-react';
import { PropFirm, PropProgram, PropAccountModel } from '../types';
import { formatCurrency, getConfidenceBadgeClass } from '../lib/utils';

interface FirmOverviewProps {
  firm: PropFirm;
  onSelectAccount: (account: PropAccountModel) => void;
  onOpenSourceModal: (source: any) => void;
  onOpenSimulatorForAccount: (account: PropAccountModel) => void;
}

export const FirmOverview: React.FC<FirmOverviewProps> = ({
  firm,
  onSelectAccount,
  onOpenSourceModal,
  onOpenSimulatorForAccount
}) => {
  const [selectedProgramId, setSelectedProgramId] = useState<string>(firm.programs[0]?.id || '');
  const [copiedCode, setCopiedCode] = useState(false);

  const selectedProgram = firm.programs.find(p => p.id === selectedProgramId) || firm.programs[0];
  const confBadge = getConfidenceBadgeClass(firm.data_confidence);

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2500);
  };

  return (
    <div className="space-y-8">
      {/* Top Firm Header Banner */}
      <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-br from-zinc-900 via-zinc-925 to-zinc-950 border border-zinc-800 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="h-16 w-16 rounded-2xl bg-zinc-950 border border-zinc-750 p-2 flex items-center justify-center shadow-lg shrink-0">
              <span className="text-2xl font-black bg-gradient-to-r from-amber-400 to-indigo-400 bg-clip-text text-transparent">
                GFT
              </span>
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-100 tracking-tight">
                  {firm.name}
                </h1>
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  <span>Verified Corpus</span>
                </span>
                <span className={`text-xs font-mono px-2 py-0.5 rounded border ${confBadge.bg} ${confBadge.text} ${confBadge.border}`}>
                  Data Confidence: Grade {firm.data_confidence}
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
                <span>CEO: <strong className="text-zinc-200">{firm.ceo || 'Edoardo Dalla Torre'}</strong></span>
                <span>•</span>
                <span>HQ: <strong className="text-zinc-200">{firm.headquarters}</strong></span>
                <span>•</span>
                <span>Founded: <strong className="text-zinc-200">{firm.founded}</strong></span>
                <span>•</span>
                <a
                  href={firm.website}
                  target="_blank"
                  rel="noreferrer"
                  className="text-cyan-400 hover:underline flex items-center gap-1 font-mono"
                >
                  <span>{firm.website}</span>
                  <ExternalLink className="h-3 w-3" />
                </a>
              </p>
            </div>
          </div>

          {/* Quick Score Badge & Trustpilot */}
          <div className="flex items-center gap-4 shrink-0 bg-zinc-950/80 p-4 rounded-xl border border-zinc-800">
            <div className="text-center pr-4 border-r border-zinc-800">
              <span className="text-[10px] font-mono uppercase text-zinc-500 block">Overall Intel Score</span>
              <span className="text-3xl font-black text-indigo-400 font-mono">{firm.overall_score}</span>
              <span className="text-[10px] text-zinc-400 block font-mono">/ 100</span>
            </div>
            <div className="text-left text-xs space-y-1">
              <div>
                <span className="text-zinc-400">Trustpilot: </span>
                <strong className="text-emerald-400 font-mono">★ {firm.trustpilot_rating}</strong>
                <span className="text-zinc-500 text-[11px]"> ({firm.trustpilot_reviews_count.toLocaleString()} reviews)</span>
              </div>
              <div>
                <span className="text-zinc-400">PropFirmMatch: </span>
                <strong className="text-amber-400 font-mono">★ {firm.propfirmmatch_rating}</strong>
                <span className="text-zinc-500 text-[11px]"> (Verified)</span>
              </div>
              <div className="text-[10px] text-zinc-500 font-mono">
                Last Verified: {firm.last_verified}
              </div>
            </div>
          </div>
        </div>

        {/* 6-Pillar Risk & Quality Scores */}
        <div className="mt-8 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-6 border-t border-zinc-800/80 text-xs">
          {[
            { label: 'Risk Safety', score: firm.scores.risk_score, reason: firm.score_reasons.risk },
            { label: 'Payout Reliability', score: firm.scores.payout_score, reason: firm.score_reasons.payout },
            { label: 'Trading Freedom', score: firm.scores.trading_freedom, reason: firm.score_reasons.trading_freedom },
            { label: 'Rule Simplicity', score: firm.scores.rule_simplicity, reason: firm.score_reasons.rule_simplicity },
            { label: 'Transparency', score: firm.scores.transparency, reason: firm.score_reasons.transparency },
            { label: 'Trader Experience', score: firm.scores.trader_experience, reason: firm.score_reasons.trader_experience }
          ].map((pillar, i) => (
            <div
              key={i}
              className="p-3 rounded-xl bg-zinc-950/60 border border-zinc-800/80 hover:border-zinc-700 transition-colors group relative"
            >
              <div className="flex items-center justify-between font-mono mb-1">
                <span className="text-[10px] uppercase text-zinc-400 truncate">{pillar.label}</span>
                <span className="font-bold text-zinc-200 text-xs">{pillar.score}</span>
              </div>
              <div className="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                <div
                  className={`h-full ${
                    pillar.score >= 75
                      ? 'bg-emerald-500'
                      : pillar.score >= 60
                      ? 'bg-amber-500'
                      : 'bg-rose-500'
                  }`}
                  style={{ width: `${pillar.score}%` }}
                />
              </div>
              <p className="text-[10px] text-zinc-400 mt-2 line-clamp-2">{pillar.reason}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Active Promotion & AI Evidence Verdict */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Active Promo Box */}
        {firm.active_offer && (
          <div className="lg:col-span-4 p-5 rounded-2xl bg-gradient-to-br from-amber-950/40 via-zinc-900 to-indigo-950/40 border border-amber-500/30 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-amber-400 font-bold text-xs font-mono">
                <Sparkles className="h-4 w-4" />
                <span>OFFICIAL VERIFIED PROMOTION</span>
              </div>
              <h3 className="text-lg font-extrabold text-zinc-100">
                {firm.active_offer.discount} {firm.active_offer.perk}
              </h3>
              <p className="text-xs text-zinc-300 leading-relaxed">
                {firm.active_offer.details}
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-zinc-800/80 flex items-center justify-between">
              <div className="font-mono text-xs text-zinc-400">
                CODE: <strong className="text-amber-300">{firm.active_offer.code}</strong>
              </div>
              <button
                onClick={() => handleCopyCode(firm.active_offer!.code)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-xs font-mono font-semibold transition-colors"
              >
                {copiedCode ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                <span>{copiedCode ? 'Copied' : 'Copy Code'}</span>
              </button>
            </div>
          </div>
        )}

        {/* AI Synthesis Summary */}
        <div className={`p-5 rounded-2xl bg-zinc-900 border border-zinc-800 ${firm.active_offer ? 'lg:col-span-8' : 'lg:col-span-12'} space-y-3`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-indigo-400 font-bold text-xs font-mono">
              <Activity className="h-4 w-4" />
              <span>PLATFORM EVIDENCE SYNTHESIS</span>
            </div>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-amber-500/15 text-amber-300 border border-amber-500/30">
              VERDICT: {firm.ai_summary.verdict}
            </span>
          </div>
          <h4 className="font-bold text-zinc-100 text-sm">{firm.ai_summary.title}</h4>
          <p className="text-xs text-zinc-300 leading-relaxed">{firm.ai_summary.text}</p>
        </div>
      </div>

      {/* Program Selector Tabs */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="h-5 w-5 text-indigo-400" />
            <h2 className="text-lg font-extrabold text-zinc-100">Discovered Trading Models & Programs</h2>
          </div>
          <span className="text-xs text-zinc-400 font-mono">
            {firm.programs.length} Programs Detected
          </span>
        </div>

        {/* Program Tabs */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
          {firm.programs.map(prog => {
            const isSelected = prog.id === selectedProgramId;
            return (
              <button
                key={prog.id}
                onClick={() => setSelectedProgramId(prog.id)}
                className={`px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-2 ${
                  isSelected
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                    : 'bg-zinc-900 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-850 border border-zinc-800'
                }`}
              >
                <span>{prog.name}</span>
                <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded ${
                  isSelected ? 'bg-indigo-800 text-indigo-200' : 'bg-zinc-800 text-zinc-400'
                }`}>
                  {prog.accounts.length} Accounts
                </span>
              </button>
            );
          })}
        </div>

        {/* Selected Program Description */}
        <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-850 text-xs text-zinc-300">
          <span className="text-indigo-400 font-bold mr-2">Program Overview:</span>
          {selectedProgram?.description}
        </div>

        {/* Account Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {selectedProgram?.accounts.map(acc => (
            <div
              key={acc.id}
              className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 hover:border-indigo-500/50 transition-all shadow-lg flex flex-col justify-between space-y-4 group"
            >
              {/* Card Header */}
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
                    {acc.currency} {formatCurrency(acc.account_size)}
                  </span>
                  <div className="text-right">
                    {acc.discounted_price ? (
                      <div>
                        <span className="text-xs line-through text-zinc-500 mr-1.5">${acc.price}</span>
                        <span className="text-base font-extrabold text-emerald-400">${acc.discounted_price}</span>
                      </div>
                    ) : (
                      <span className="text-base font-extrabold text-zinc-100">${acc.price}</span>
                    )}
                  </div>
                </div>
                <h3 className="font-extrabold text-base text-zinc-100 mt-2">{acc.name}</h3>
                <p className="text-[11px] text-zinc-400">
                  {acc.refundable ? 'Refundable Fee upon Payout' : 'Non-Refundable Upfront Fee'}
                </p>
              </div>

              {/* Core Metric Highlights */}
              <div className="grid grid-cols-2 gap-2 text-xs bg-zinc-950 p-3 rounded-xl border border-zinc-850 font-mono">
                <div>
                  <span className="text-[10px] text-zinc-500 block">Daily Drawdown</span>
                  <span className="font-bold text-rose-400">{acc.daily_drawdown}%</span>
                  <span className="text-[9px] text-zinc-400 block">{acc.daily_drawdown_type}</span>
                </div>
                <div>
                  <span className="text-[10px] text-zinc-500 block">Max Overall Loss</span>
                  <span className="font-bold text-rose-400">{acc.max_drawdown}%</span>
                  <span className="text-[9px] text-zinc-400 block">{acc.max_drawdown_type}</span>
                </div>
                <div>
                  <span className="text-[10px] text-zinc-500 block">Profit Target</span>
                  <span className="font-bold text-indigo-400">
                    {acc.profit_target_step1 ? `${acc.profit_target_step1}% / ${acc.profit_target_step2}%` : 'Instant'}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-zinc-500 block">Profit Split</span>
                  <span className="font-bold text-emerald-400">{acc.profit_split}</span>
                </div>
              </div>

              {/* Fail Safe Warning */}
              <div className="text-[11px] bg-rose-950/20 border border-rose-500/20 p-2.5 rounded-lg text-rose-200/90">
                <strong className="block text-rose-300 font-mono">🚨 Biggest Breach Risk:</strong>
                {acc.biggest_risks[0]?.title}: {acc.biggest_risks[0]?.description.substring(0, 75)}...
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-zinc-800">
                <button
                  onClick={() => onSelectAccount(acc)}
                  className="px-3 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-colors flex items-center justify-center gap-1"
                >
                  <span>Rules & Risks</span>
                  <ChevronRight className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={() => onOpenSimulatorForAccount(acc)}
                  className="px-3 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-750 text-zinc-200 text-xs font-semibold transition-colors flex items-center justify-center gap-1"
                >
                  <SlidersHorizontal className="h-3.5 w-3.5 text-indigo-400" />
                  <span>Simulate</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
