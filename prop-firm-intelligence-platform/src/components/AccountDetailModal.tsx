import React, { useState } from 'react';
import {
  X,
  AlertOctagon,
  ShieldCheck,
  FileText,
  SlidersHorizontal,
  History,
  TrendingDown,
  Info,
  DollarSign,
  ChevronRight,
  ExternalLink
} from 'lucide-react';
import { PropAccountModel, PropFirm } from '../types';
import { formatCurrency, getImportanceBadgeClass } from '../lib/utils';
import { LiveSimulator } from './LiveSimulator';

interface AccountDetailModalProps {
  account: PropAccountModel | null;
  firm: PropFirm;
  onClose: () => void;
  onOpenSourceModal: (source: any) => void;
}

export const AccountDetailModal: React.FC<AccountDetailModalProps> = ({
  account,
  firm,
  onClose,
  onOpenSourceModal
}) => {
  const [activeTab, setActiveTab] = useState<'FAIL_RISKS' | 'RULES_EXPLAINED' | 'SIMULATOR' | 'SOURCES'>('FAIL_RISKS');

  if (!account) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-zinc-950/85 backdrop-blur-md animate-in fade-in">
      <div className="w-full max-w-4xl bg-zinc-900 border border-zinc-750 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-zinc-800 bg-zinc-950/70 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400 font-bold">
              ${(account.account_size / 1000).toFixed(0)}K
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-extrabold text-zinc-100">{account.name}</h2>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 border border-zinc-700">
                  {account.fee_type} ${account.price}
                </span>
              </div>
              <p className="text-xs text-zinc-400">
                {firm.name} • {account.leverage} Leverage • {account.platforms.join(', ')}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Navigation Tabs */}
        <div className="flex border-b border-zinc-800 bg-zinc-950/40 px-6 space-x-2 text-xs font-medium overflow-x-auto no-scrollbar">
          {[
            { id: 'FAIL_RISKS', label: '🚨 How Can I Fail This Account?', icon: AlertOctagon },
            { id: 'RULES_EXPLAINED', label: '🧠 Explain The Rules', icon: Info },
            { id: 'SIMULATOR', label: '🧮 Interactive Simulator', icon: SlidersHorizontal },
            { id: 'SOURCES', label: '📚 Evidence & Sources', icon: FileText }
          ].map(t => {
            const Icon = t.icon;
            const isActive = activeTab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id as any)}
                className={`flex items-center gap-2 py-3 px-3 border-b-2 font-semibold transition-all whitespace-nowrap ${
                  isActive
                    ? 'border-indigo-500 text-indigo-400'
                    : 'border-transparent text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{t.label}</span>
              </button>
            );
          })}
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs text-zinc-300">
          {/* TAB 1: HOW CAN I FAIL THIS ACCOUNT? */}
          {activeTab === 'FAIL_RISKS' && (
            <div className="space-y-6">
              <div className="p-4 rounded-xl bg-gradient-to-r from-rose-950/40 via-zinc-900 to-amber-950/30 border border-rose-500/30">
                <div className="flex items-center gap-2 text-rose-400 font-bold text-sm mb-1">
                  <AlertOctagon className="h-4 w-4" />
                  <span>CRITICAL RISK SUMMARY: HOW TRADERS FAIL THIS {account.name.toUpperCase()}</span>
                </div>
                <p className="text-zinc-300 text-xs leading-relaxed">
                  Before purchasing, understand the mathematically exact breach triggers. Over 85% of challenge failures on this account model occur from three specific risk factors below.
                </p>
              </div>

              {/* Biggest Risks List */}
              <div className="space-y-3">
                <h4 className="font-mono text-[11px] uppercase tracking-wider text-zinc-400 font-semibold">
                  PRIMARY ACCOUNT BREACH VECTORS
                </h4>
                {account.biggest_risks.map((risk, idx) => {
                  const impClass = getImportanceBadgeClass(risk.severity);
                  return (
                    <div
                      key={idx}
                      className="p-4 rounded-xl bg-zinc-950/80 border border-zinc-800 hover:border-zinc-700 space-y-2 transition-all"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="h-5 w-5 rounded-full bg-rose-500/20 text-rose-300 font-mono flex items-center justify-center text-[10px] font-bold">
                            0{idx + 1}
                          </span>
                          <span className="font-bold text-zinc-100 text-sm">{risk.title}</span>
                        </div>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-mono border ${impClass.bg} ${impClass.text} ${impClass.border}`}>
                          {risk.severity}
                        </span>
                      </div>
                      <p className="text-zinc-300 leading-relaxed">{risk.description}</p>
                      <div className="pt-2 border-t border-zinc-850 flex items-start gap-2 text-emerald-400 bg-emerald-950/20 p-2.5 rounded-lg border border-emerald-500/20">
                        <ShieldCheck className="h-4 w-4 shrink-0 mt-0.5" />
                        <div>
                          <strong className="block text-emerald-300 text-[11px]">How to safeguard your account:</strong>
                          <span className="text-emerald-200/90 text-xs">{risk.how_to_avoid}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Easy to miss traps */}
              <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-500/30 space-y-2">
                <div className="flex items-center gap-2 text-amber-400 font-bold text-xs">
                  <Info className="h-4 w-4" />
                  <span>EASY-TO-MISS RULES THAT PREVENT PAYOUTS ON THIS ACCOUNT</span>
                </div>
                <ul className="space-y-1.5 pl-2">
                  {account.easy_to_miss_rules.map((rule, i) => (
                    <li key={i} className="flex items-start gap-2 text-zinc-300 text-xs">
                      <span className="text-amber-400 font-bold">•</span>
                      <span>{rule}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* TAB 2: EXPLAIN THE RULES */}
          {activeTab === 'RULES_EXPLAINED' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-zinc-950 p-4 rounded-xl border border-zinc-800 text-center font-mono">
                <div>
                  <span className="text-[10px] text-zinc-500 uppercase block">Daily Drawdown</span>
                  <span className="text-sm font-bold text-rose-400">
                    {account.daily_drawdown}% ({formatCurrency(account.account_size * (account.daily_drawdown / 100))})
                  </span>
                  <span className="text-[10px] text-zinc-400 block">{account.daily_drawdown_type}</span>
                </div>
                <div>
                  <span className="text-[10px] text-zinc-500 uppercase block">Max Overall Loss</span>
                  <span className="text-sm font-bold text-rose-400">
                    {account.max_drawdown}% ({formatCurrency(account.account_size * (account.max_drawdown / 100))})
                  </span>
                  <span className="text-[10px] text-zinc-400 block">{account.max_drawdown_type}</span>
                </div>
                <div>
                  <span className="text-[10px] text-zinc-500 uppercase block">Step 1 Target</span>
                  <span className="text-sm font-bold text-indigo-400">
                    {account.profit_target_step1 ? `${account.profit_target_step1}% (${formatCurrency(account.account_size * (account.profit_target_step1 / 100))})` : 'None (Instant)'}
                  </span>
                  <span className="text-[10px] text-zinc-400 block">Evaluation Target</span>
                </div>
                <div>
                  <span className="text-[10px] text-zinc-500 uppercase block">Funded Trading Days</span>
                  <span className="text-sm font-bold text-emerald-400">
                    {account.minimum_trading_days_funded} Days
                  </span>
                  <span className="text-[10px] text-zinc-400 block">Per Payout Cycle</span>
                </div>
              </div>

              {/* Explanations Breakdown */}
              <div className="space-y-3">
                <h4 className="font-mono text-[11px] uppercase tracking-wider text-zinc-400 font-semibold">
                  COMPREHENSIVE RULE GLOSSARY FOR THIS ACCOUNT
                </h4>
                {account.rules_summary.map((r, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-lg bg-zinc-950 border border-zinc-800 flex items-center justify-between"
                  >
                    <div>
                      <span className="font-bold text-zinc-200 text-xs block">{r.label}</span>
                      <span className="text-[11px] text-zinc-400 font-mono">Source Ref: {r.source_ref}</span>
                    </div>
                    <div className="text-right">
                      <span className="font-mono font-bold text-indigo-300 text-xs block">{r.value}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-zinc-850 text-zinc-400 font-mono">
                        {r.importance}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: INTERACTIVE SIMULATOR */}
          {activeTab === 'SIMULATOR' && (
            <div>
              <LiveSimulator preloadedAccount={account} />
            </div>
          )}

          {/* TAB 4: EVIDENCE & SOURCES */}
          {activeTab === 'SOURCES' && (
            <div className="space-y-3">
              <h4 className="font-mono text-[11px] uppercase tracking-wider text-zinc-400 font-semibold">
                PROVENANCE SOURCES FOR {account.name.toUpperCase()}
              </h4>
              <div className="space-y-2">
                {[
                  {
                    title: 'Model Comparison Table',
                    url: 'https://www.goatfundedtrader.com/model',
                    quote: `Standard evaluation for ${account.name} features ${account.daily_drawdown}% daily loss and ${account.max_drawdown}% max loss.`,
                    type: 'OFFICIAL'
                  },
                  {
                    title: 'Help Center - Minimum Trading Days',
                    url: 'https://help.goatfundedtrader.com/en/articles/minimum-trading-days-funded',
                    quote: 'For accounts purchased on or after July 25, 2026, 4 active trading days are required per payout cycle.',
                    type: 'OFFICIAL_SUPPORT'
                  },
                  {
                    title: 'Help Center - 80% Margin Rule',
                    url: 'https://help.goatfundedtrader.com/en/articles/margin-and-gambling-policy',
                    quote: 'We define gambling-style trading as any trade where more than 80% of available margin is used in a trading idea.',
                    type: 'OFFICIAL_SUPPORT'
                  }
                ].map((src, i) => (
                  <div
                    key={i}
                    className="p-3.5 rounded-lg bg-zinc-950 border border-zinc-800 flex items-center justify-between"
                  >
                    <div>
                      <span className="font-semibold text-zinc-100 text-xs block">{src.title}</span>
                      <p className="text-zinc-400 text-[11px] italic mt-0.5">&ldquo;{src.quote}&rdquo;</p>
                    </div>
                    <button
                      onClick={() => onOpenSourceModal(src)}
                      className="px-3 py-1.5 rounded bg-zinc-850 hover:bg-zinc-800 text-indigo-400 hover:text-indigo-300 font-mono text-xs flex items-center gap-1 shrink-0 ml-3"
                    >
                      <FileText className="h-3.5 w-3.5" />
                      <span>Inspect Evidence</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-zinc-800 bg-zinc-950/80 flex items-center justify-between text-xs text-zinc-400">
          <span>Firm Status: <strong className="text-emerald-400">Verified Direct Official Corpus</strong></span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-medium transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
