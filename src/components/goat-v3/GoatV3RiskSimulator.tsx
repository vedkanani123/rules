import React, { useState, useMemo } from 'react';
import { GFTModel } from '../../data/goatCanonicalData.ts';
import { CanonicalSelectedModelRules } from '../../data/goatCanonicalContext.ts';
import {
  runModelRiskSimulation,
  SimulatorInputs,
  SimulatorOutputs,
} from '../../data/goatSelectors.ts';
import {
  TrendingUp,
  AlertTriangle,
  ShieldCheck,
  ShieldAlert,
  HelpCircle,
  RotateCcw,
  Sparkles,
  Sliders,
  DollarSign,
  Activity,
  CheckCircle2,
  XCircle,
  Calculator,
  Code2,
  Info,
} from 'lucide-react';

interface GoatV3RiskSimulatorProps {
  canonicalRules: CanonicalSelectedModelRules;
  model?: GFTModel;
  accountSize?: number;
}

export const GoatV3RiskSimulator: React.FC<GoatV3RiskSimulatorProps> = ({
  canonicalRules,
}) => {
  const activeModel = canonicalRules.model;
  const currentCapital = canonicalRules.core.nominalCapital;

  // Simulator Interactive State
  const [startingBalance, setStartingBalance] = useState<number>(currentCapital);
  const [currentEquity, setCurrentEquity] = useState<number>(currentCapital);
  const [currentFloatingLoss, setCurrentFloatingLoss] = useState<number>(0);
  const [riskPerTradePct, setRiskPerTradePct] = useState<number>(1.0);
  const [stopLossPips, setStopLossPips] = useState<number>(20);
  const [winRatePct, setWinRatePct] = useState<number>(50);
  const [riskRewardRatio, setRiskRewardRatio] = useState<number>(2.0);
  const [simulatedTradesCount, setSimulatedTradesCount] = useState<number>(20);
  const [targetPayoutAmount, setTargetPayoutAmount] = useState<number>(4000);
  const [showFormulas, setShowFormulas] = useState<boolean>(true);

  // Sync starting balance and equity when capital changes
  React.useEffect(() => {
    setStartingBalance(currentCapital);
    setCurrentEquity(currentCapital);
  }, [currentCapital]);

  // Run model-specific simulation strictly bound to the canonical rule object
  const simulation: SimulatorOutputs = useMemo(() => {
    const inputs: SimulatorInputs = {
      model: activeModel,
      accountSize: currentCapital,
      startingBalance,
      currentEquity,
      currentFloatingLoss,
      riskPerTradePct,
      stopLossPips,
      winRatePct,
      riskRewardRatio,
      simulatedTradesCount,
      targetPayoutAmount,
      canonicalRules,
    };
    return runModelRiskSimulation(inputs);
  }, [
    activeModel,
    currentCapital,
    startingBalance,
    currentEquity,
    currentFloatingLoss,
    riskPerTradePct,
    stopLossPips,
    winRatePct,
    riskRewardRatio,
    simulatedTradesCount,
    targetPayoutAmount,
    canonicalRules,
  ]);

  const resetToDefaults = () => {
    setStartingBalance(currentCapital);
    setCurrentEquity(currentCapital);
    setCurrentFloatingLoss(0);
    setRiskPerTradePct(1.0);
    setStopLossPips(20);
    setWinRatePct(50);
    setRiskRewardRatio(2.0);
    setSimulatedTradesCount(20);
    setTargetPayoutAmount(4000);
  };

  const getStatusBanner = () => {
    if (simulation.status === 'danger') {
      return (
        <div className="p-3.5 rounded-xl bg-rose-500/15 border border-rose-500/30 flex items-start gap-3">
          <ShieldAlert className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-extrabold text-sm text-rose-300 block">
              CRITICAL RISK WARNING — ACCOUNT IN IMMEDIATE DANGER
            </span>
            <p className="text-xs text-rose-200/90 mt-0.5 leading-relaxed">
              {simulation.summarySentence}
            </p>
          </div>
        </div>
      );
    }
    if (simulation.status === 'caution') {
      return (
        <div className="p-3.5 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-extrabold text-sm text-amber-300 block">
              CAUTION — COMPRESSED DRAWDOWN BUFFER
            </span>
            <p className="text-xs text-amber-200/90 mt-0.5 leading-relaxed">
              {simulation.summarySentence}
            </p>
          </div>
        </div>
      );
    }
    return (
      <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
        <div>
          <span className="font-extrabold text-sm text-emerald-300 block">
            PORTFOLIO HEALTH: COMPLIANT & HEALTHY BUFFER
          </span>
          <p className="text-xs text-emerald-200/90 mt-0.5 leading-relaxed">
            {simulation.summarySentence}
          </p>
        </div>
      </div>
    );
  };

  return (
    <section id="simulator" className="space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <Activity className="w-5 h-5 text-blue-400" />
            Model-Specific Risk & Payout Simulator
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            Mathematical simulation engine bound strictly to active rules ({canonicalRules.core.modelName} · {canonicalRules.core.nominalCapitalFormatted} · {canonicalRules.core.termsVersionLabel}).
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowFormulas(!showFormulas)}
            className={`px-3 py-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              showFormulas
                ? 'bg-blue-600/20 text-blue-300 border-blue-500/30'
                : 'bg-[#16181E] text-slate-400 border-[#1F2228] hover:text-white'
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>{showFormulas ? 'Hide Formulas' : 'Show All Formulas'}</span>
          </button>

          <button
            onClick={resetToDefaults}
            className="px-3 py-1.5 rounded-lg bg-[#16181E] hover:bg-slate-800 border border-[#1F2228] text-xs text-slate-300 hover:text-white flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Inputs</span>
          </button>
        </div>
      </div>

      {/* Dynamic Health Status Banner */}
      {getStatusBanner()}

      {/* Main Grid: Controls on Left, Outputs on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Column: Interactive Sliders & Inputs */}
        <div className="lg:col-span-5 p-5 rounded-2xl bg-[#111318] border border-[#1F2228] space-y-4">
          <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Sliders className="w-4 h-4 text-blue-400" />
              Account State Controls
            </h3>
            <span className="text-[11px] font-mono text-slate-400">
              {canonicalRules.core.modelName}
            </span>
          </div>

          {/* Current Floating Equity Slider */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-slate-400">Current Equity:</span>
              <span className="font-mono font-bold text-white">
                ${currentEquity.toLocaleString()}
              </span>
            </div>
            <input
              type="range"
              min={Math.round(currentCapital * 0.88)}
              max={Math.round(currentCapital * 1.15)}
              step={100}
              value={currentEquity}
              onChange={(e) => setCurrentEquity(Number(e.target.value))}
              className="w-full accent-blue-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono">
              <span>${Math.round(currentCapital * 0.88).toLocaleString()} (Floor)</span>
              <span>Baseline: {canonicalRules.core.nominalCapitalFormatted}</span>
              <span>${Math.round(currentCapital * 1.15).toLocaleString()} (+15%)</span>
            </div>
          </div>

          {/* Current Floating Unrealized Loss */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-slate-400">Current Open Floating Loss:</span>
              <span className={`font-mono font-bold ${currentFloatingLoss > 0 ? 'text-rose-400' : 'text-slate-300'}`}>
                -${currentFloatingLoss.toLocaleString()}
              </span>
            </div>
            <input
              type="range"
              min={0}
              max={Math.round(currentCapital * 0.05)}
              step={50}
              value={currentFloatingLoss}
              onChange={(e) => setCurrentFloatingLoss(Number(e.target.value))}
              className="w-full accent-rose-500 cursor-pointer"
            />
            {simulation.floatingLossViolation && (
              <p className="text-[11px] text-rose-400 font-semibold flex items-center gap-1">
                <AlertTriangle className="w-3 h-3 shrink-0" />
                Floating loss exceeds model cap! Violates model policy.
              </p>
            )}
          </div>

          {/* Risk Per Trade Slider */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-slate-400">Risk Per Trade:</span>
              <span className="font-mono font-bold text-blue-400">
                {riskPerTradePct}% (${((currentCapital * riskPerTradePct) / 100).toLocaleString()})
              </span>
            </div>
            <input
              type="range"
              min={0.2}
              max={3.0}
              step={0.1}
              value={riskPerTradePct}
              onChange={(e) => setRiskPerTradePct(Number(e.target.value))}
              className="w-full accent-blue-500 cursor-pointer"
            />
          </div>

          {/* Win Rate & R:R Ratio */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Win Rate:</span>
                <span className="font-mono font-bold text-emerald-400">{winRatePct}%</span>
              </div>
              <input
                type="range"
                min={20}
                max={80}
                step={5}
                value={winRatePct}
                onChange={(e) => setWinRatePct(Number(e.target.value))}
                className="w-full accent-emerald-500 cursor-pointer"
              />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Risk/Reward:</span>
                <span className="font-mono font-bold text-sky-400">1:{riskRewardRatio.toFixed(1)}</span>
              </div>
              <input
                type="range"
                min={0.5}
                max={4.0}
                step={0.1}
                value={riskRewardRatio}
                onChange={(e) => setRiskRewardRatio(Number(e.target.value))}
                className="w-full accent-sky-500 cursor-pointer"
              />
            </div>
          </div>

          {/* Simulated Trades & Requested Payout */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Simulated Trades:</span>
                <span className="font-mono font-bold text-slate-200">{simulatedTradesCount}</span>
              </div>
              <input
                type="range"
                min={5}
                max={50}
                step={5}
                value={simulatedTradesCount}
                onChange={(e) => setSimulatedTradesCount(Number(e.target.value))}
                className="w-full accent-blue-500 cursor-pointer"
              />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Target Payout:</span>
                <span className="font-mono font-bold text-emerald-400">${targetPayoutAmount.toLocaleString()}</span>
              </div>
              <input
                type="range"
                min={500}
                max={15000}
                step={500}
                value={targetPayoutAmount}
                onChange={(e) => setTargetPayoutAmount(Number(e.target.value))}
                className="w-full accent-emerald-500 cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Right Column: Calculated Mathematical Outputs (All 9 Required Calculations with Formulas) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* 1. Daily Loss Buffer */}
            <div className="p-4 rounded-xl bg-[#111318] border border-[#1F2228] space-y-2">
              <div className="text-[11px] font-mono text-slate-400 flex items-center justify-between">
                <span>1. DAILY LOSS BUFFER</span>
                <span className="text-amber-400 font-bold">
                  {canonicalRules.core.hasDailyLossLimit ? `${canonicalRules.core.dailyLossPct}% Daily Limit` : '0% (No Daily DD)'}
                </span>
              </div>
              <div className="text-xl sm:text-2xl font-black text-white font-mono">
                {!canonicalRules.core.hasDailyLossLimit
                  ? 'No daily loss limit verified.'
                  : `$${simulation.remainingDailyLossBuffer.toLocaleString()}`}
              </div>
              <p className="text-[11px] text-slate-400">
                {!canonicalRules.core.hasDailyLossLimit
                  ? 'Zero daily drawdown enforced on this model. Intraday equity pullbacks will never breach the account.'
                  : `You can absorb ${
                      simulation.consecutiveLossesBeforeDailyBreach > 100
                        ? 'Unlimited'
                        : simulation.consecutiveLossesBeforeDailyBreach
                    } consecutive stop-losses before daily breach.`}
              </p>
              {showFormulas && (
                <div className="p-2 rounded bg-black/40 border border-white/[0.04] text-[10px] font-mono text-slate-400">
                  <span className="text-amber-300 font-bold block mb-0.5">Formula:</span>
                  {simulation.formulas.dailyLossBuffer}
                </div>
              )}
            </div>

            {/* 2. Maximum Drawdown Buffer */}
            <div className="p-4 rounded-xl bg-[#111318] border border-[#1F2228] space-y-2">
              <div className="text-[11px] font-mono text-slate-400 flex items-center justify-between">
                <span>2. TOTAL DRAWDOWN BUFFER</span>
                <span className="text-rose-400 font-bold">{canonicalRules.core.maxDDPct}% Total Max</span>
              </div>
              <div className="text-xl sm:text-2xl font-black text-white font-mono">
                ${simulation.remainingTotalDrawdownBuffer.toLocaleString()}
              </div>
              <p className="text-[11px] text-slate-400">
                You can absorb{' '}
                <strong className="text-rose-300">
                  {simulation.consecutiveLossesBeforeTotalBreach}
                </strong>{' '}
                consecutive full stop-losses at ${simulation.maxPermittedRiskPerTradeDollars.toLocaleString()} risk before liquidation.
              </p>
              {showFormulas && (
                <div className="p-2 rounded bg-black/40 border border-white/[0.04] text-[10px] font-mono text-slate-400">
                  <span className="text-rose-300 font-bold block mb-0.5">Formula:</span>
                  {simulation.formulas.totalDrawdownBuffer}
                </div>
              )}
            </div>

            {/* 3. Floating-Loss Buffer */}
            <div className="p-4 rounded-xl bg-[#111318] border border-[#1F2228] space-y-2">
              <div className="text-[11px] font-mono text-slate-400 flex items-center justify-between">
                <span>3. FLOATING-LOSS BUFFER</span>
                <span className={canonicalRules.core.hasFloatingLossCap ? 'text-rose-400 font-bold' : 'text-slate-400 font-bold'}>
                  {canonicalRules.core.hasFloatingLossCap ? `${canonicalRules.core.floatingLossPct}% Max Cap` : 'Standard SL'}
                </span>
              </div>
              <div className="text-xl sm:text-2xl font-black text-white font-mono">
                {canonicalRules.core.hasFloatingLossCap
                  ? `$${Math.max(0, (simulation.maxPermittedFloatingLossDollars || 0) - currentFloatingLoss).toLocaleString()}`
                  : 'No Floating Cap'}
              </div>
              <p className="text-[11px] text-slate-400">
                {canonicalRules.core.hasFloatingLossCap
                  ? `Max permitted open loss: -$${(simulation.maxPermittedFloatingLossDollars || 0).toLocaleString()}. Current: -$${currentFloatingLoss.toLocaleString()}.`
                  : 'Model does not enforce open floating loss cap; protected by daily and total drawdown floors.'}
              </p>
              {showFormulas && (
                <div className="p-2 rounded bg-black/40 border border-white/[0.04] text-[10px] font-mono text-slate-400">
                  <span className="text-sky-300 font-bold block mb-0.5">Formula:</span>
                  {simulation.formulas.floatingLossBuffer}
                </div>
              )}
            </div>

            {/* 4. Profit Target Distance */}
            <div className="p-4 rounded-xl bg-[#111318] border border-[#1F2228] space-y-2">
              <div className="text-[11px] font-mono text-slate-400 flex items-center justify-between">
                <span>4. TARGET DISTANCE</span>
                <span className="text-emerald-400 font-bold">
                  {canonicalRules.core.hasProfitTarget ? `+${canonicalRules.core.targetPct}%` : 'Direct Live'}
                </span>
              </div>
              <div className="text-xl sm:text-2xl font-black text-emerald-400 font-mono">
                {!canonicalRules.core.hasProfitTarget
                  ? 'Profit target not applicable.'
                  : simulation.profitTargetReached
                  ? 'Target Reached! 🎉'
                  : `$${simulation.distanceToProfitTargetDollars.toLocaleString()}`}
              </div>
              <p className="text-[11px] text-slate-400">
                {!canonicalRules.core.hasProfitTarget
                  ? 'Direct live account. No evaluation challenge required.'
                  : `Target: $${(currentCapital + canonicalRules.core.targetDollars).toLocaleString()} closed equity.`}
              </p>
              {showFormulas && (
                <div className="p-2 rounded bg-black/40 border border-white/[0.04] text-[10px] font-mono text-slate-400">
                  <span className="text-emerald-300 font-bold block mb-0.5">Formula:</span>
                  {simulation.formulas.profitTargetDistance}
                </div>
              )}
            </div>
          </div>

          {/* Detailed Compliance & Status Breakdown Cards (5 through 9) */}
          <div className="p-4 rounded-2xl bg-[#111318] border border-[#1F2228] space-y-3">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono flex items-center gap-1.5">
              <Calculator className="w-3.5 h-3.5 text-blue-400" />
              Calculated Payout Eligibility & Account Health Status
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
              {/* 5. Payout Eligibility */}
              <div className="p-3 rounded-xl bg-black/30 border border-white/[0.04] space-y-1">
                <span className="text-slate-400 block text-[11px]">5. Payout Eligibility:</span>
                <div className="flex items-center gap-1.5 font-bold">
                  {simulation.isPayoutEligible ? (
                    <span className="text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Eligible (${targetPayoutAmount.toLocaleString()})
                    </span>
                  ) : (
                    <span className="text-rose-400 flex items-center gap-1">
                      <XCircle className="w-3.5 h-3.5" /> Not Eligible
                    </span>
                  )}
                </div>
                {simulation.payoutBlockReason && (
                  <p className="text-[10px] text-rose-300/80 leading-tight">
                    {simulation.payoutBlockReason}
                  </p>
                )}
                {showFormulas && (
                  <div className="text-[9px] font-mono text-slate-500 pt-1 border-t border-white/[0.04]">
                    Formula: {simulation.formulas.payoutEligibility}
                  </div>
                )}
              </div>

              {/* 6. Consistency Requirement */}
              <div className="p-3 rounded-xl bg-black/30 border border-white/[0.04] space-y-1">
                <span className="text-slate-400 block text-[11px]">6. Consistency Requirement:</span>
                <span className="font-bold text-white block">
                  {canonicalRules.core.hasConsistencyRule && canonicalRules.core.consistencyPct
                    ? `Max single day: $${((targetPayoutAmount * canonicalRules.core.consistencyPct) / 100).toLocaleString()}`
                    : 'No Consistency Rule (0% Cap)'}
                </span>
                <p className="text-[10px] text-slate-400">
                  {canonicalRules.core.hasConsistencyRule
                    ? 'Excess delays payout only (never breaches account).'
                    : '100% of profits can be made in a single trading session.'}
                </p>
                {showFormulas && (
                  <div className="text-[9px] font-mono text-slate-500 pt-1 border-t border-white/[0.04]">
                    Formula: {simulation.formulas.consistencyCap}
                  </div>
                )}
              </div>

              {/* 7. Losses Remaining Before Breach */}
              <div className="p-3 rounded-xl bg-black/30 border border-white/[0.04] space-y-1">
                <span className="text-slate-400 block text-[11px]">7. Losses Before Breach:</span>
                <span className="font-bold text-amber-300 block">
                  {canonicalRules.core.hasDailyLossLimit
                    ? `${simulation.consecutiveLossesBeforeDailyBreach} Daily / ${simulation.consecutiveLossesBeforeTotalBreach} Total`
                    : `${simulation.consecutiveLossesBeforeTotalBreach} Total Losses`}
                </span>
                <p className="text-[10px] text-slate-400">
                  At ${simulation.maxPermittedRiskPerTradeDollars.toLocaleString()} risk per trade ({riskPerTradePct}% of starting balance).
                </p>
                {showFormulas && (
                  <div className="text-[9px] font-mono text-slate-500 pt-1 border-t border-white/[0.04]">
                    Formula: {simulation.formulas.lossesRemaining}
                  </div>
                )}
              </div>

              {/* 8. Current Equity Status */}
              <div className="p-3 rounded-xl bg-black/30 border border-white/[0.04] space-y-1">
                <span className="text-slate-400 block text-[11px]">8. Current Equity Status:</span>
                <span className="font-bold text-white block font-mono">
                  ${currentEquity.toLocaleString()} ({currentEquity >= currentCapital ? `+$${(currentEquity - currentCapital).toLocaleString()}` : `-$${(currentCapital - currentEquity).toLocaleString()}`})
                </span>
                <p className="text-[10px] text-slate-400">
                  {currentEquity >= currentCapital ? 'Account is in net profit.' : 'Account is currently in net drawdown.'}
                </p>
                {showFormulas && (
                  <div className="text-[9px] font-mono text-slate-500 pt-1 border-t border-white/[0.04]">
                    Formula: {simulation.formulas.equityStatus}
                  </div>
                )}
              </div>

              {/* 9. Current Floating-Loss Status */}
              <div className="p-3 rounded-xl bg-black/30 border border-white/[0.04] space-y-1 sm:col-span-2 lg:col-span-2">
                <span className="text-slate-400 block text-[11px]">9. Floating-Loss Status:</span>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white font-mono">
                    Open Loss: -${currentFloatingLoss.toLocaleString()}
                  </span>
                  <span className="text-[11px] font-mono text-slate-400">
                    {canonicalRules.core.hasFloatingLossCap
                      ? `Cap: -$${(simulation.maxPermittedFloatingLossDollars || 0).toLocaleString()} (${canonicalRules.core.floatingLossPct}%)`
                      : 'No Open Loss Floor'}
                  </span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden mt-1">
                  <div
                    className={`h-full transition-all ${simulation.floatingLossViolation ? 'bg-rose-500' : 'bg-blue-500'}`}
                    style={{
                      width: canonicalRules.core.hasFloatingLossCap && simulation.maxPermittedFloatingLossDollars
                        ? `${Math.min(100, (currentFloatingLoss / simulation.maxPermittedFloatingLossDollars) * 100)}%`
                        : `${Math.min(100, (currentFloatingLoss / (currentCapital * 0.05)) * 100)}%`,
                    }}
                  />
                </div>
                {showFormulas && (
                  <div className="text-[9px] font-mono text-slate-500 pt-1 border-t border-white/[0.04]">
                    Formula: {simulation.formulas.floatingLossStatus}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
