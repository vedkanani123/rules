import React, { useState } from 'react';
import {
  Compass,
  CheckCircle2,
  AlertTriangle,
  Zap,
  SlidersHorizontal,
  ChevronRight,
  TrendingUp,
  Percent,
  Layers,
  Sparkles,
  ShieldCheck,
  Flame,
  ArrowRight
} from 'lucide-react';
import { PropFirm, PropAccountModel } from '../types';
import { formatCurrency } from '../lib/utils';
import { StrategyEngine } from '../../server/engine/strategy-engine';

interface StrategyMatcherProps {
  firm: PropFirm;
  onSelectAccount: (account: PropAccountModel) => void;
  onOpenSimulatorForAccount: (account: PropAccountModel) => void;
}

export const StrategyMatcher: React.FC<StrategyMatcherProps> = ({
  firm,
  onSelectAccount,
  onOpenSimulatorForAccount
}) => {
  const [strategyId, setStrategyId] = useState<string>('SCALPER');
  const [modelType, setModelType] = useState<string>('ALL');
  const [selectedSize, setSelectedSize] = useState<number>(0);

  const strategies = [
    {
      id: 'SCALPER',
      name: 'High-Frequency Scalper',
      desc: 'Rapid intraday entries, small stop losses, high lot sizes.',
      icon: '⚡',
      keyRisk: '80% Margin rule & fast slippage'
    },
    {
      id: 'SWING_TRADER',
      name: 'Swing Trader',
      desc: 'Multi-day holds, wider stop losses, weekend exposure.',
      icon: '📈',
      keyRisk: 'Weekend swaps & rollover gap drawdowns'
    },
    {
      id: 'NEWS_TRADER',
      name: 'Macro & News Trader',
      desc: 'Trades during CPI, NFP, FOMC high-volatility spikes.',
      icon: '📰',
      keyRisk: 'Slippage during red folder releases'
    },
    {
      id: 'EA_ALGO',
      name: 'Algorithmic / EA Trader',
      desc: 'Automated MetaTrader bots, grid, or custom algorithms.',
      icon: '🤖',
      keyRisk: 'Coordinated IP / Martingale restrictions'
    },
    {
      id: 'DAY_TRADER',
      name: 'Discretionary Day Trader',
      desc: 'Intraday price action, closed before daily rollover.',
      icon: '🎯',
      keyRisk: '5:00 PM EST daily drawdown reset'
    }
  ];

  // Evaluate matches across all accounts in the firm
  const allAccounts: { acc: PropAccountModel; progName: string; type: string }[] = [];
  for (const prog of firm.programs) {
    for (const acc of prog.accounts) {
      allAccounts.push({ acc, progName: prog.name, type: prog.type });
    }
  }

  const matches = allAccounts
    .filter(item => {
      if (modelType !== 'ALL' && item.type !== modelType) return false;
      if (selectedSize > 0 && item.acc.account_size !== selectedSize) return false;
      return true;
    })
    .map(item => {
      const evalRes = StrategyEngine.evaluateCompatibility(strategyId, item.acc, item.progName);
      return {
        ...evalRes,
        account: item.acc,
        programName: item.progName
      };
    })
    .sort((a, b) => b.match_percentage - a.match_percentage);

  return (
    <div id="strategy-matcher-container" className="space-y-6 animate-fadeIn">
      {/* Header & Persona Selector */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-indigo-950/50 via-zinc-900 to-zinc-950 border border-indigo-500/30 shadow-xl space-y-5">
        <div className="flex items-center gap-3">
          <span className="p-2.5 rounded-2xl bg-indigo-500/15 border border-indigo-500/30 text-indigo-400">
            <Compass className="h-6 w-6" />
          </span>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-zinc-100">
              Trader Strategy & Rule Compatibility Engine
            </h1>
            <p className="text-xs text-zinc-300 mt-0.5">
              Select your trading archetype below. Our risk engine cross-references your methodology against drawdown resets, margin limits, and holding rules.
            </p>
          </div>
        </div>

        {/* Strategy Archetype Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 pt-2">
          {strategies.map(s => {
            const isSelected = strategyId === s.id;
            return (
              <button
                key={s.id}
                onClick={() => setStrategyId(s.id)}
                className={`p-4 rounded-2xl border text-left transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between ${
                  isSelected
                    ? 'bg-gradient-to-b from-indigo-600/30 to-indigo-950/40 border-indigo-400 text-white shadow-xl shadow-indigo-600/20 ring-1 ring-indigo-500'
                    : 'bg-zinc-950/80 border-zinc-800/80 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900 hover:border-zinc-700'
                }`}
              >
                <div>
                  <div className="text-2xl mb-2">{s.icon}</div>
                  <div className="font-extrabold text-xs text-zinc-100">{s.name}</div>
                  <div className="text-[10px] text-zinc-400 mt-1 line-clamp-2 leading-relaxed">{s.desc}</div>
                </div>
                <div className="mt-3 pt-2 border-t border-zinc-800/60 text-[9px] font-mono text-amber-400/90 truncate">
                  ⚠️ {s.keyRisk}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Filter Controls Bar */}
      <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="font-mono text-zinc-400">Account Model:</span>
            <select
              aria-label="Account model filter"
              value={modelType}
              onChange={e => setModelType(e.target.value)}
              className="bg-zinc-950 border border-zinc-750 rounded-xl px-3 py-1.5 text-zinc-200 font-mono focus:border-indigo-500 focus:outline-none"
            >
              <option value="ALL">All Models</option>
              <option value="TWO_STEP">2-Step Standard</option>
              <option value="ONE_STEP">1-Step Classic</option>
              <option value="INSTANT">Instant Funding</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="font-mono text-zinc-400">Size:</span>
            <select
              aria-label="Account size filter"
              value={selectedSize}
              onChange={e => setSelectedSize(Number(e.target.value))}
              className="bg-zinc-950 border border-zinc-750 rounded-xl px-3 py-1.5 text-zinc-200 font-mono focus:border-indigo-500 focus:outline-none"
            >
              <option value={0}>All Sizes</option>
              <option value={5000}>$5,000</option>
              <option value={10000}>$10,000</option>
              <option value={25000}>$25,000</option>
              <option value={50000}>$50,000</option>
              <option value={100000}>$100,000</option>
              <option value={200000}>$200,000</option>
            </select>
          </div>
        </div>

        <span className="text-zinc-400 font-mono text-xs">
          Ranked <strong>{matches.length}</strong> Compatible Accounts
        </span>
      </div>

      {/* Ranked Compatibility Matches */}
      <div className="space-y-4">
        {matches.map((item, idx) => (
          <div
            key={idx}
            className="p-6 rounded-3xl bg-zinc-900/90 border border-zinc-800 hover:border-indigo-500/40 shadow-xl space-y-4 transition-all"
          >
            {/* Match Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-800">
              <div>
                <div className="flex items-center gap-2.5">
                  <span className="text-xs font-mono px-2 py-0.5 rounded-lg bg-zinc-800 text-zinc-300 font-bold">
                    Rank #{idx + 1}
                  </span>
                  <h3 className="font-black text-base text-zinc-100">{item.account.name}</h3>
                  <span className="text-xs font-mono text-indigo-400 font-semibold">
                    ({item.programName})
                  </span>
                </div>
                <p className="text-xs text-zinc-400 mt-1 font-mono">
                  Fee: <span className="text-zinc-200">${item.account.price}</span> • Size: <span className="text-indigo-300 font-bold">{formatCurrency(item.account.account_size)}</span> • Leverage: <span className="text-zinc-200">{item.account.leverage}</span>
                </p>
              </div>

              {/* Match Score Meter */}
              <div className="flex items-center gap-3 bg-zinc-950 p-3 rounded-2xl border border-zinc-800 shrink-0">
                <div>
                  <span className="text-[10px] font-mono uppercase text-zinc-500 block">Compatibility</span>
                  <span className={`text-xl font-black font-mono ${
                    item.match_percentage >= 80 ? 'text-emerald-400' : item.match_percentage >= 60 ? 'text-amber-400' : 'text-rose-400'
                  }`}>
                    {item.match_percentage}%
                  </span>
                </div>
                <div className="w-24 bg-zinc-800 h-2.5 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${
                      item.match_percentage >= 80
                        ? 'bg-emerald-500'
                        : item.match_percentage >= 60
                        ? 'bg-amber-500'
                        : 'bg-rose-500'
                    }`}
                    style={{ width: `${item.match_percentage}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Strategy Verdict */}
            <div className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-850 text-xs text-zinc-200 leading-relaxed">
              <strong className="text-indigo-400 font-mono mr-1.5">Strategy Engine Assessment:</strong>
              {item.verdict}
            </div>

            {/* Pros & Cons Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              <div className="p-4 rounded-2xl bg-emerald-950/15 border border-emerald-500/20 space-y-2">
                <span className="font-bold text-emerald-400 font-mono flex items-center gap-1.5 text-xs">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Favorable Rule Mechanics:</span>
                </span>
                <ul className="space-y-1.5 pl-1">
                  {item.pros.map((pro: string, i: number) => (
                    <li key={i} className="text-zinc-300 flex items-start gap-1.5 leading-relaxed">
                      <span className="text-emerald-400 font-bold">•</span>
                      <span>{pro}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-4 rounded-2xl bg-amber-950/15 border border-amber-500/20 space-y-2">
                <span className="font-bold text-amber-400 font-mono flex items-center gap-1.5 text-xs">
                  <AlertTriangle className="h-4 w-4" />
                  <span>Specific Trap & Breach Vectors:</span>
                </span>
                <ul className="space-y-1.5 pl-1">
                  {item.cons.map((con: string, i: number) => (
                    <li key={i} className="text-zinc-300 flex items-start gap-1.5 leading-relaxed">
                      <span className="text-amber-400 font-bold">•</span>
                      <span>{con}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-2 flex items-center justify-end gap-2 text-xs">
              <button
                onClick={() => onSelectAccount(item.account)}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <span>View Full Rules & Specifications</span>
                <ChevronRight className="h-4 w-4" />
              </button>
              <button
                onClick={() => onOpenSimulatorForAccount(item.account)}
                className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <SlidersHorizontal className="h-4 w-4 text-indigo-400" />
                <span>Simulate Account</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
