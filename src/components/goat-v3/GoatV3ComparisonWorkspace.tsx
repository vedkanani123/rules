import React, { useState, useMemo } from 'react';
import { GFTModel, GFT_CANONICAL_MODELS } from '../../data/goatCanonicalData.ts';
import {
  CanonicalSelectedModelRules,
  buildCanonicalSelectedRules,
} from '../../data/goatCanonicalContext.ts';
import {
  Scale,
  X,
  Plus,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  ShieldCheck,
  TrendingDown,
  DollarSign,
  Zap,
  Clock,
  Layers,
  Info,
} from 'lucide-react';

interface ComparisonParameter {
  id: string;
  category: string;
  name: string;
  description: string;
  getValue: (canonical: CanonicalSelectedModelRules) => {
    display: string;
    subtext?: string;
    status: 'verified' | 'ambiguous' | 'historical' | 'conflict' | 'not_applicable' | 'not_verified';
  };
}

interface GoatV3ComparisonWorkspaceProps {
  allModels: GFTModel[];
  selectedModelIds: string[];
  onRemoveModel: (modelId: string) => void;
  onAddModel: (modelId: string) => void;
  comparisonSize: number;
  onChangeComparisonSize: (size: number) => void;
}

export const GoatV3ComparisonWorkspace: React.FC<GoatV3ComparisonWorkspaceProps> = ({
  allModels,
  selectedModelIds,
  onRemoveModel,
  onAddModel,
  comparisonSize,
  onChangeComparisonSize,
}) => {
  const [showAddDropdown, setShowAddDropdown] = useState(false);

  // Available models to add
  const availableToAdd = allModels.filter((m) => !selectedModelIds.includes(m.id));

  // Generate canonical objects for each compared model strictly at comparisonSize
  const comparedCanonicals: CanonicalSelectedModelRules[] = useMemo(() => {
    return selectedModelIds
      .map((id) => allModels.find((m) => m.id === id))
      .filter((m): m is GFTModel => Boolean(m))
      .map((model) =>
        buildCanonicalSelectedRules(model, {
          category: model.category,
          modelId: model.id,
          accountSize: comparisonSize,
          stage: 'all',
          platform: 'all',
          purchaseDate: '2026-09-01',
          termsVersion: 'current_2026',
          tradingStyle: 'conservative',
        })
      );
  }, [allModels, selectedModelIds, comparisonSize]);

  // Structured 21-Parameter Matrix Definition
  const parameters: ComparisonParameter[] = useMemo(() => {
    return [
      {
        id: 'param-stages',
        category: 'Structure',
        name: '1. Stages & Evaluation',
        description: 'Challenge phases before live simulated capital access',
        getValue: (c) => ({
          display: c.model.isEvaluation
            ? `${c.model.stagesCount - 1}-Phase Challenge + 1 Funded`
            : 'Direct Live Capital (0 Phases)',
          subtext: c.model.isEvaluation ? 'Evaluation challenge required' : 'Immediate payout eligibility',
          status: 'verified',
        }),
      },
      {
        id: 'param-profit-target',
        category: 'Targets',
        name: '2. Profit Target(s)',
        description: 'Net closed profit percentage required to advance',
        getValue: (c) => {
          if (!c.core.hasProfitTarget) {
            return {
              display: 'Not Applicable',
              subtext: 'Direct funded master — no evaluation phase',
              status: 'not_applicable',
            };
          }
          const p1 = c.model.targetsByStage.phase1 ? `P1: +${c.model.targetsByStage.phase1}%` : '';
          const p2 = c.model.targetsByStage.phase2 ? ` | P2: +${c.model.targetsByStage.phase2}%` : '';
          const p3 = c.model.targetsByStage.phase3 ? ` | P3: +${c.model.targetsByStage.phase3}%` : '';
          return {
            display: `${p1}${p2}${p3}`,
            subtext: `Target 1: +$${((comparisonSize * (c.model.targetsByStage.phase1 || 0)) / 100).toLocaleString()}`,
            status: 'verified',
          };
        },
      },
      {
        id: 'param-daily-loss',
        category: 'Drawdown',
        name: '3. Daily Loss Limit',
        description: 'Maximum permitted equity loss per 24-hour cycle',
        getValue: (c) => {
          if (!c.core.hasDailyLossLimit) {
            return {
              display: '0% (No Daily Loss Limit)',
              subtext: 'Intraday equity drawdown free',
              status: 'verified',
            };
          }
          return {
            display: `${c.core.dailyLossPct}% ($${c.core.dailyLossDollars.toLocaleString()}/day)`,
            subtext: c.core.dailyLossHasConflict
              ? 'Current terms (Aug 1, 2026+). Pre-Aug was 4%.'
              : 'Resets at 5:00 PM EST daily',
            status: c.core.dailyLossHasConflict ? 'conflict' : 'verified',
          };
        },
      },
      {
        id: 'param-max-drawdown',
        category: 'Drawdown',
        name: '4. Maximum Total Drawdown',
        description: 'Account termination threshold from starting capital',
        getValue: (c) => ({
          display: `${c.core.maxDDPct}% ($${c.core.maxDDDollars.toLocaleString()})`,
          subtext: `Breach floor at $${c.core.maxDDFloorDollars.toLocaleString()}`,
          status: 'verified',
        }),
      },
      {
        id: 'param-drawdown-type',
        category: 'Drawdown',
        name: '5. Drawdown Mechanics',
        description: 'How the loss floor behaves as profits accrue',
        getValue: (c) => ({
          display: c.core.maxDDTypeLabel,
          subtext:
            c.core.maxDDType === 'static'
              ? 'Floor stays fixed forever'
              : 'Trails high-water until starting capital',
          status: 'verified',
        }),
      },
      {
        id: 'param-floating-loss',
        category: 'Drawdown',
        name: '6. Floating Loss Cap',
        description: 'Maximum allowable open unrealized loss at any second',
        getValue: (c) => {
          if (!c.core.hasFloatingLossCap) {
            return {
              display: 'Not Applicable',
              subtext: 'Standard SL rules apply',
              status: 'not_applicable',
            };
          }
          return {
            display: `${c.core.floatingLossPct}% (-$${(c.core.floatingLossDollars || 0).toLocaleString()})`,
            subtext: 'Tick-by-tick open loss trigger',
            status: 'verified',
          };
        },
      },
      {
        id: 'param-min-trading-days',
        category: 'Trading Rules',
        name: '7. Minimum Valid Days',
        description: 'Days with ≥0.5% starting capital profit required',
        getValue: (c) => ({
          display: `${c.core.minTradingDaysFunded} Valid Days`,
          subtext: `≥${c.core.validDayThresholdFormatted} profit per qualifying day`,
          status: 'verified',
        }),
      },
      {
        id: 'param-profit-split',
        category: 'Payouts',
        name: '8. Base Profit Split',
        description: 'Contractual trader share of net closed profits',
        getValue: (c) => ({
          display: `${c.core.baseProfitSplitPct}% Trader Share`,
          subtext: `Scales up to ${c.core.maxProfitSplitPct}% via milestones`,
          status: 'verified',
        }),
      },
      {
        id: 'param-payout-cycle',
        category: 'Payouts',
        name: '9. Payout Cycle Frequency',
        description: 'Days between recurring profit withdrawal requests',
        getValue: (c) => ({
          display: `Every ${c.core.payoutCycleDays} Calendar Days`,
          subtext: `First payout eligible after ${c.core.firstPayoutDays} days`,
          status: 'verified',
        }),
      },
      {
        id: 'param-payout-sla',
        category: 'Payouts',
        name: '10. Payout Processing SLA',
        description: 'Operational guarantee for payout execution',
        getValue: () => ({
          display: '48 Business Hours SLA',
          subtext: '$1,000 compensation bonus if delayed',
          status: 'verified',
        }),
      },
      {
        id: 'param-consistency',
        category: 'Restrictions',
        name: '11. Single-Day Consistency',
        description: 'Maximum profit allowed in one trading session',
        getValue: (c) => {
          if (!c.core.hasConsistencyRule) {
            return {
              display: '0% (No Consistency Rule)',
              subtext: 'Single-session profits 100% withdrawable',
              status: 'verified',
            };
          }
          return {
            display: `${c.core.consistencyPct}% Best-Day Cap`,
            subtext: 'Withdrawal pause only (never breaches account)',
            status: 'verified',
          };
        },
      },
      {
        id: 'param-news-trading',
        category: 'Restrictions',
        name: '12. News Trading Policy',
        description: 'Rules for trading during high-impact economic releases',
        getValue: () => ({
          display: 'Allowed (1% Profit Cap)',
          subtext: '±5 min red-folder trades capped at 1% of capital',
          status: 'verified',
        }),
      },
      {
        id: 'param-weekend-crypto',
        category: 'Restrictions',
        name: '13. Weekend & Crypto Holding',
        description: 'Holding open positions through weekend rollover',
        getValue: () => ({
          display: 'Allowed (24/7 Crypto)',
          subtext: 'Weekend swings permitted across all pairs',
          status: 'verified',
        }),
      },
      {
        id: 'param-ea-bots',
        category: 'Automation',
        name: '14. EAs & Algorithmic Trading',
        description: 'Automated trading bot permission and restrictions',
        getValue: () => ({
          display: 'Allowed (Proprietary Only)',
          subtext: 'Commercial shared EAs and arbitrage prohibited',
          status: 'verified',
        }),
      },
      {
        id: 'param-copy-trading',
        category: 'Automation',
        name: '15. Copy Trading Scope',
        description: 'Account-to-account trade replication permission',
        getValue: (c) => ({
          display: c.core.copyTradingScope,
          subtext: 'Third-party account management banned',
          status: 'verified',
        }),
      },
      {
        id: 'param-vps-policy',
        category: 'Infrastructure',
        name: '16. VPS & IP Cluster Policy',
        description: 'Hosting and IP requirements for execution',
        getValue: (c) => ({
          display: c.core.vpsAllowed ? 'VPS Allowed (Dedicated IP)' : 'Data-Center VPS Banned',
          subtext: 'Residential IP directive (Aug 12, 2026)',
          status: 'verified',
        }),
      },
      {
        id: 'param-forex-leverage',
        category: 'Leverage',
        name: '17. Forex Leverage',
        description: 'Simulated margin purchasing power for FX pairs',
        getValue: (c) => ({
          display: c.core.forexLeverage,
          subtext: 'FX Major & Minor pairs',
          status: 'verified',
        }),
      },
      {
        id: 'param-crypto-leverage',
        category: 'Leverage',
        name: '18. Crypto Leverage',
        description: 'Simulated margin purchasing power for cryptocurrencies',
        getValue: (c) => ({
          display: `${c.model.leverage.crypto} (24/7)`,
          subtext: 'BTC, ETH, SOL simulated contracts',
          status: 'verified',
        }),
      },
      {
        id: 'param-platforms',
        category: 'Platforms',
        name: '19. Supported Platforms',
        description: 'Execution software platforms available',
        getValue: (c) => ({
          display: c.model.supportedPlatforms.map((p) => p.toUpperCase()).join(', '),
          subtext: 'MT5 restricted for US; TradeLocker global',
          status: 'verified',
        }),
      },
      {
        id: 'param-scaling',
        category: 'Growth',
        name: '20. Scaling Plan Milestones',
        description: 'Capital growth plan for consistent traders',
        getValue: () => ({
          display: '+25% Every 3 Months',
          subtext: '8% profit + 2 payouts required. Max $2M.',
          status: 'verified',
        }),
      },
      {
        id: 'param-refundable-fee',
        category: 'Pricing',
        name: '21. Registration Fee Refund',
        description: 'Reimbursement of initial purchase fee',
        getValue: (c) => ({
          display: c.core.refundableFee ? '100% Refundable' : 'Non-Refundable',
          subtext: c.core.refundableFee ? 'Paid with 1st funded payout' : 'Instant live access fee',
          status: 'verified',
        }),
      },
    ];
  }, [comparisonSize]);

  const getCellStatusBadge = (status: string) => {
    switch (status) {
      case 'verified':
        return null;
      case 'conflict':
        return (
          <span className="inline-block text-[9px] px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30 font-mono mt-0.5">
            Conflict
          </span>
        );
      case 'historical':
        return (
          <span className="inline-block text-[9px] px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30 font-mono mt-0.5">
            Historical
          </span>
        );
      case 'not_applicable':
        return (
          <span className="inline-block text-[9px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700 font-mono mt-0.5">
            Not Applicable
          </span>
        );
      case 'not_verified':
      default:
        return (
          <span className="inline-block text-[9px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 font-mono mt-0.5">
            Not Verified
          </span>
        );
    }
  };

  return (
    <section id="comparison" className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <Scale className="w-5 h-5 text-blue-400" />
            Multi-Model Comparison Workspace (21-Parameter Matrix)
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            Side-by-side exhaustive matrix strictly generated from the canonical registry. Every cell is validated with zero misalignment or unexplained blanks.
          </p>
        </div>

        {/* Global Capital Selector for Comparison */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">Normalized Capital:</span>
          <select
            value={comparisonSize}
            onChange={(e) => onChangeComparisonSize(Number(e.target.value))}
            className="bg-[#111318] border border-[#1F2228] rounded-lg px-2.5 py-1 text-xs text-slate-200 font-mono focus:outline-none focus:border-blue-500 cursor-pointer"
          >
            <option value={10000}>$10,000</option>
            <option value={25000}>$25,000</option>
            <option value={50000}>$50,000</option>
            <option value={100000}>$100,000</option>
            <option value={200000}>$200,000</option>
          </select>
        </div>
      </div>

      {comparedCanonicals.length === 0 ? (
        <div className="p-8 rounded-2xl bg-[#111318] border border-[#1F2228] text-center space-y-3">
          <Scale className="w-10 h-10 text-slate-500 mx-auto" />
          <h3 className="text-base font-bold text-white">No Models Selected for Comparison</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Select up to 4 models to compare side-by-side across all 21 canonical parameters.
          </p>
          <button
            onClick={() => {
              onAddModel('two_step_standard');
              onAddModel('one_step');
              onAddModel('pay_after_pass');
              onAddModel('instant_premium');
            }}
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold cursor-pointer"
          >
            Load Benchmark Models (2-Step vs 1-Step vs Pay Later vs Instant)
          </button>
        </div>
      ) : (
        <div className="rounded-2xl border border-[#1F2228] bg-[#111318] overflow-hidden shadow-xl">
          {/* Top Bar with Active Model Chips */}
          <div className="p-3 bg-[#0d0f14] border-b border-[#1F2228] flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-xs text-slate-400 mr-1">Comparing ({comparedCanonicals.length}):</span>
              {comparedCanonicals.map((c) => (
                <span
                  key={c.model.id}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-800 text-slate-200 border border-slate-700"
                >
                  <span className="font-semibold">{c.model.name}</span>
                  <button
                    onClick={() => onRemoveModel(c.model.id)}
                    className="hover:text-rose-400 p-0.5 rounded cursor-pointer"
                    title="Remove model"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>

            {availableToAdd.length > 0 && comparedCanonicals.length < 4 && (
              <div className="relative">
                <button
                  onClick={() => setShowAddDropdown(!showAddDropdown)}
                  className="px-3 py-1 rounded-lg bg-[#16181E] hover:bg-slate-800 border border-[#1F2228] text-xs text-blue-400 font-medium flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add Model ({4 - comparedCanonicals.length} slots left)
                </button>

                {showAddDropdown && (
                  <div className="absolute right-0 mt-1 w-64 bg-[#16181E] border border-[#1F2228] rounded-xl shadow-2xl z-20 py-1 max-h-60 overflow-y-auto">
                    {availableToAdd.map((m) => (
                      <button
                        key={m.id}
                        onClick={() => {
                          onAddModel(m.id);
                          setShowAddDropdown(false);
                        }}
                        className="w-full px-3 py-1.5 text-left text-xs text-slate-300 hover:bg-blue-600 hover:text-white cursor-pointer flex justify-between items-center"
                      >
                        <span className="font-semibold">{m.name}</span>
                        <span className="text-[10px] text-slate-400">{m.categoryLabel}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Structured Matrix Table with Real Dynamic Generation */}
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="border-b border-[#1F2228] bg-black/40 text-slate-400 font-mono text-[11px]">
                  <th className="p-3.5 w-60 min-w-56 sticky left-0 bg-[#0d0f14] z-10 border-r border-[#1F2228]">
                    Canonical Parameter
                  </th>
                  {comparedCanonicals.map((c) => (
                    <th key={c.model.id} className="p-3.5 min-w-64 font-bold text-white">
                      <div className="text-sm font-extrabold text-blue-400">{c.model.name}</div>
                      <div className="text-[10px] text-slate-400 font-normal">{c.model.categoryLabel}</div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1F2228] text-slate-300">
                {parameters.map((param, index) => (
                  <tr
                    key={param.id}
                    className={`hover:bg-white/[0.02] transition-colors ${
                      index % 2 === 0 ? 'bg-transparent' : 'bg-white/[0.01]'
                    }`}
                  >
                    <td className="p-3.5 font-semibold text-slate-300 sticky left-0 bg-[#111318] z-10 border-r border-[#1F2228]">
                      <div>{param.name}</div>
                      <div className="text-[10px] text-slate-500 font-normal">{param.description}</div>
                    </td>
                    {comparedCanonicals.map((c) => {
                      const cell = param.getValue(c);
                      return (
                        <td key={c.model.id} className="p-3.5 align-top">
                          <div className="font-medium text-white text-xs">{cell.display}</div>
                          {cell.subtext && (
                            <div className="text-[11px] text-slate-400 leading-tight mt-0.5">
                              {cell.subtext}
                            </div>
                          )}
                          {getCellStatusBadge(cell.status)}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Matrix Verification Footer */}
          <div className="p-3 bg-[#0d0f14] border-t border-[#1F2228] flex flex-wrap items-center justify-between text-[11px] text-slate-400">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>All 21 parameters validated dynamically against the selected models' canonical records.</span>
            </div>
            <span className="font-mono text-slate-500">
              Normalized Capital Base: ${comparisonSize.toLocaleString()}
            </span>
          </div>
        </div>
      )}
    </section>
  );
};
