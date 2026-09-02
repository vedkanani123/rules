import React, { useState } from 'react';
import {
  Scale,
  Check,
  X,
  SlidersHorizontal,
  ChevronRight,
  ShieldCheck,
  AlertTriangle,
  FileText,
  Sparkles,
  Zap,
  ArrowRight,
  Plus
} from 'lucide-react';
import { PropFirm, PropAccountModel } from '../types';
import { formatCurrency } from '../lib/utils';

interface CompareAccountsProps {
  firm: PropFirm;
  onSelectAccount: (account: PropAccountModel) => void;
  onOpenSimulatorForAccount: (account: PropAccountModel) => void;
}

export const CompareAccounts: React.FC<CompareAccountsProps> = ({
  firm,
  onSelectAccount,
  onOpenSimulatorForAccount
}) => {
  // Collect all accounts from all programs
  const allAccounts: PropAccountModel[] = [];
  for (const prog of firm.programs) {
    for (const acc of prog.accounts) {
      allAccounts.push(acc);
    }
  }

  // Pre-select 3 standard accounts
  const [selectedIds, setSelectedIds] = useState<string[]>([
    allAccounts[0]?.id || '',
    allAccounts[3]?.id || '',
    allAccounts[4]?.id || ''
  ]);
  const [sizeFilter, setSizeFilter] = useState<number>(0);

  const toggleSelect = (id: string) => {
    if (selectedIds.includes(id)) {
      if (selectedIds.length > 1) {
        setSelectedIds(selectedIds.filter(i => i !== id));
      }
    } else {
      if (selectedIds.length < 4) {
        setSelectedIds([...selectedIds, id]);
      } else {
        setSelectedIds([...selectedIds.slice(1), id]);
      }
    }
  };

  const compared = allAccounts.filter(a => selectedIds.includes(a.id));

  const filteredAccountPool = sizeFilter === 0
    ? allAccounts
    : allAccounts.filter(a => a.account_size === sizeFilter);

  const rows = [
    {
      label: 'Account Size',
      render: (a: PropAccountModel) => (
        <span className="font-extrabold text-indigo-400 font-mono text-base">
          {formatCurrency(a.account_size)}
        </span>
      )
    },
    {
      label: 'Upfront Evaluation Fee',
      render: (a: PropAccountModel) => (
        <div className="font-mono">
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-zinc-100 text-sm">${a.price}</span>
            {a.discounted_price && (
              <span className="text-emerald-400 text-xs font-bold px-1.5 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20">
                ${a.discounted_price} with MATCH45
              </span>
            )}
          </div>
          <span className="block text-[10px] text-zinc-400 mt-0.5">{a.fee_type} (Refunded on 4th payout)</span>
        </div>
      )
    },
    {
      label: 'Profit Target',
      render: (a: PropAccountModel) => (
        <div className="font-mono text-xs">
          {a.profit_target_step1 ? (
            <div className="space-y-0.5">
              <span className="text-zinc-200 block">Phase 1: <strong className="text-emerald-400">{a.profit_target_step1}%</strong> (${((a.account_size * (a.profit_target_step1 || 8)) / 100).toLocaleString()})</span>
              <span className="text-zinc-300 block">Phase 2: <strong className="text-emerald-400">{a.profit_target_step2}%</strong> (${((a.account_size * (a.profit_target_step2 || 5)) / 100).toLocaleString()})</span>
            </div>
          ) : (
            <span className="px-2 py-0.5 rounded bg-amber-500/15 text-amber-300 border border-amber-500/30 text-[11px] font-bold">
              Instant Funded (No Eval Phase)
            </span>
          )}
        </div>
      )
    },
    {
      label: 'Daily Drawdown Type & Limit',
      render: (a: PropAccountModel) => (
        <div className="font-mono text-xs">
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-rose-400">{a.daily_drawdown}%</span>
            <span className="text-zinc-400">(${((a.account_size * a.daily_drawdown) / 100).toLocaleString()})</span>
          </div>
          <span className={`inline-block mt-1 text-[10px] px-1.5 py-0.5 rounded ${
            a.daily_drawdown_type === 'Balance-Based'
              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
              : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
          }`}>
            {a.daily_drawdown_type} (5:00 PM EST reset)
          </span>
        </div>
      )
    },
    {
      label: 'Max Overall Loss Floor',
      render: (a: PropAccountModel) => (
        <div className="font-mono text-xs">
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-rose-400">{a.max_drawdown}%</span>
            <span className="text-zinc-400">(${((a.account_size * a.max_drawdown) / 100).toLocaleString()})</span>
          </div>
          <span className={`inline-block mt-1 text-[10px] px-1.5 py-0.5 rounded ${
            a.max_drawdown_type === 'Static'
              ? 'bg-indigo-500/10 text-indigo-300 border border-indigo-500/20'
              : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
          }`}>
            {a.max_drawdown_type} Baseline
          </span>
        </div>
      )
    },
    {
      label: 'Min Trading Days (Funded)',
      render: (a: PropAccountModel) => (
        <div className="font-mono text-xs">
          <span className="font-bold text-emerald-400">
            {a.minimum_trading_days_funded} Days / withdrawal cycle
          </span>
          <span className="block text-[10px] text-zinc-400 mt-0.5">Updated July 25, 2026</span>
        </div>
      )
    },
    {
      label: 'Profit Consistency Rule',
      render: (a: PropAccountModel) => (
        <div className="text-xs">
          <span className={`font-mono font-bold ${a.consistency_rule ? 'text-purple-400' : 'text-zinc-400'}`}>
            {a.consistency_rule || 'No Explicit % Cap'}
          </span>
          {a.consistency_rule && (
            <span className="block text-[10px] text-zinc-400 mt-0.5">
              1 single day cannot exceed 33% of total payout profit
            </span>
          )}
        </div>
      )
    },
    {
      label: '80% Margin Rule (FAQ)',
      render: (a: PropAccountModel) => (
        <div className="text-xs">
          <span className="text-amber-400 font-bold font-mono flex items-center gap-1">
            <AlertTriangle className="h-3 w-3" /> Applies (80% Max)
          </span>
          <span className="block text-[10px] text-zinc-400 mt-0.5">Breaching 80% risks profit voiding</span>
        </div>
      )
    },
    {
      label: 'Profit Split Tier',
      render: (a: PropAccountModel) => (
        <div className="font-mono text-xs">
          <span className="font-extrabold text-emerald-400">{a.profit_split}</span>
          <span className="block text-[10px] text-zinc-400 mt-0.5">Scalable up to 95% with add-on</span>
        </div>
      )
    },
    {
      label: 'First Payout Schedule',
      render: (a: PropAccountModel) => (
        <span className="font-mono text-xs text-zinc-300">{a.payout_frequency}</span>
      )
    },
    {
      label: 'Weekend & News Trading',
      render: (a: PropAccountModel) => (
        <div className="space-y-1 text-xs font-mono">
          <span className="flex items-center gap-1 text-emerald-400">
            <Check className="h-3.5 w-3.5" /> Weekend Holding Allowed
          </span>
          <span className="flex items-center gap-1 text-emerald-400">
            <Check className="h-3.5 w-3.5" /> News Trading Allowed
          </span>
        </div>
      )
    },
    {
      label: 'Trading Leverage',
      render: (a: PropAccountModel) => (
        <span className="font-mono text-xs font-semibold text-zinc-200">{a.leverage}</span>
      )
    }
  ];

  return (
    <div id="compare-accounts-container" className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-zinc-900 via-zinc-925 to-zinc-950 border border-zinc-800 shadow-xl space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-indigo-500/15 border border-indigo-500/30 text-indigo-400">
                <Scale className="h-5 w-5" />
              </span>
              <h1 className="text-xl sm:text-2xl font-black text-zinc-100">
                Side-by-Side Account Model Comparison
              </h1>
            </div>
            <p className="text-xs text-zinc-300 max-w-3xl leading-relaxed">
              Compare rules, drawdown mechanics, pricing, and hidden constraints side-by-side. Select up to 4 models below to customize your comparison matrix.
            </p>
          </div>

          {/* Size Filter Pills */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[10px] font-mono text-zinc-500 uppercase mr-1">Filter Tier:</span>
            {[0, 10000, 25000, 50000, 100000, 200000].map(size => (
              <button
                key={size}
                onClick={() => setSizeFilter(size)}
                className={`px-2.5 py-1 rounded-lg text-xs font-mono transition-colors ${
                  sizeFilter === size
                    ? 'bg-indigo-600 text-white font-bold'
                    : 'bg-zinc-950 text-zinc-400 hover:text-zinc-200 border border-zinc-800'
                }`}
              >
                {size === 0 ? 'All Sizes' : `$${size / 1000}K`}
              </button>
            ))}
          </div>
        </div>

        {/* Account Selector Chips */}
        <div className="pt-2 border-t border-zinc-800/80">
          <span className="text-[11px] font-mono uppercase text-zinc-400 font-semibold block mb-2">
            Click to Toggle Compared Accounts (Max 4):
          </span>
          <div className="flex flex-wrap gap-2">
            {filteredAccountPool.map(acc => {
              const isSelected = selectedIds.includes(acc.id);
              return (
                <button
                  key={acc.id}
                  onClick={() => toggleSelect(acc.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-mono font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
                    isSelected
                      ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                      : 'bg-zinc-950 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-850 border border-zinc-800'
                  }`}
                >
                  <span>{acc.name} (${(acc.account_size / 1000).toFixed(0)}K)</span>
                  {isSelected ? <Check className="h-3 w-3" /> : <Plus className="h-3 w-3 opacity-40" />}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Comparison Matrix Table */}
      <div className="rounded-3xl border border-zinc-800 bg-zinc-900/90 overflow-x-auto shadow-2xl backdrop-blur-md">
        <table className="w-full text-left border-collapse text-xs">
          {/* Header Row with Account Names */}
          <thead>
            <tr className="border-b border-zinc-800 bg-zinc-950">
              <th className="p-4 sm:p-5 font-mono uppercase text-zinc-400 text-[11px] w-56 shrink-0 bg-zinc-950 sticky left-0 z-20">
                Rule / Metric Specification
              </th>
              {compared.map(acc => (
                <th key={acc.id} className="p-4 sm:p-5 min-w-[240px] border-l border-zinc-800 align-top">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-sm text-zinc-100 block">{acc.name}</span>
                      <button
                        onClick={() => toggleSelect(acc.id)}
                        className="text-zinc-500 hover:text-zinc-300 p-1 rounded hover:bg-zinc-800"
                        title="Remove column"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <span className="text-xs font-mono text-indigo-400 font-bold block">
                      {formatCurrency(acc.account_size)}
                    </span>
                    <div className="pt-1 flex gap-2">
                      <button
                        onClick={() => onSelectAccount(acc)}
                        className="flex-1 py-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 text-[11px] font-mono font-semibold transition-colors text-center"
                      >
                        Deep Dive
                      </button>
                      <button
                        onClick={() => onOpenSimulatorForAccount(acc)}
                        className="flex-1 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-[11px] font-mono font-semibold transition-colors text-center"
                      >
                        Simulate
                      </button>
                    </div>
                  </div>
                </th>
              ))}
            </tr>
          </thead>

          {/* Body Rows */}
          <tbody className="divide-y divide-zinc-800">
            {rows.map((row, idx) => (
              <tr key={idx} className="hover:bg-zinc-850/40 transition-colors">
                <td className="p-4 sm:p-5 font-semibold text-zinc-300 bg-zinc-950/60 sticky left-0 z-10 border-r border-zinc-800/80">
                  {row.label}
                </td>
                {compared.map(acc => (
                  <td key={acc.id} className="p-4 sm:p-5 border-l border-zinc-800 align-top">
                    {row.render(acc)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
