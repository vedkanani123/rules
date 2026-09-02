import React, { useState, useEffect } from 'react';
import {
  SlidersHorizontal,
  ShieldCheck,
  AlertTriangle,
  RefreshCw,
  Info,
  DollarSign,
  TrendingDown,
  Percent,
  CheckCircle2,
  Flame,
  ArrowRight,
  HelpCircle,
  Sparkles,
  Zap,
  Activity,
  Layers
} from 'lucide-react';
import { PropAccountModel, SimulatorState, SimulatorEvaluation } from '../types';
import { formatCurrency } from '../lib/utils';

interface LiveSimulatorProps {
  preloadedAccount?: PropAccountModel;
}

export const LiveSimulator: React.FC<LiveSimulatorProps> = ({ preloadedAccount }) => {
  const initialSize = preloadedAccount ? preloadedAccount.account_size : 100000;
  const initialDailyPct = preloadedAccount ? preloadedAccount.daily_drawdown : 4;
  const initialMaxPct = preloadedAccount ? preloadedAccount.max_drawdown : 8;
  const isTrailing = preloadedAccount ? preloadedAccount.max_drawdown_type === 'Trailing' : false;

  const [state, setState] = useState<SimulatorState>({
    account_size: initialSize,
    initial_balance: initialSize,
    current_balance: initialSize + 2500,
    current_equity: initialSize + 2100,
    day_start_balance: initialSize + 2500,
    day_high_water_equity: initialSize + 2500,
    daily_drawdown_limit_pct: initialDailyPct,
    max_drawdown_limit_pct: initialMaxPct,
    drawdown_calc_type: isTrailing ? 'High-Water-Trailing' : 'Balance-Based',
    open_floating_pnl: -400,
    margin_used: 650,
    total_margin_available: 2000,
    top_single_day_profit: 900,
    total_profit: 2500,
    consistency_threshold_pct: 33
  });

  const [evaluation, setEvaluation] = useState<SimulatorEvaluation | null>(null);

  // Run calculation whenever state changes
  useEffect(() => {
    const dayStart = state.day_start_balance;
    const dailyLimitAmount = Math.round((dayStart * (state.daily_drawdown_limit_pct / 100)) * 100) / 100;
    const dailyFloor = Math.round((dayStart - dailyLimitAmount) * 100) / 100;
    const dailyRemaining = Math.round((state.current_equity - dailyFloor) * 100) / 100;
    const dailyLoss = Math.max(0, dayStart - state.current_equity);

    let dailyStatus: 'SAFE' | 'WARNING' | 'BREACHED' = 'SAFE';
    if (state.current_equity <= dailyFloor) dailyStatus = 'BREACHED';
    else if (dailyRemaining <= dailyLimitAmount * 0.25) dailyStatus = 'WARNING';

    const maxLimitAmount = Math.round((state.initial_balance * (state.max_drawdown_limit_pct / 100)) * 100) / 100;
    const maxFloor = state.drawdown_calc_type === 'High-Water-Trailing'
      ? Math.round((Math.max(state.initial_balance, state.day_high_water_equity) - maxLimitAmount) * 100) / 100
      : Math.round((state.initial_balance - maxLimitAmount) * 100) / 100;
    const maxRemaining = Math.round((state.current_equity - maxFloor) * 100) / 100;
    const maxLoss = Math.max(0, (state.drawdown_calc_type === 'High-Water-Trailing' ? state.day_high_water_equity : state.initial_balance) - state.current_equity);

    let maxStatus: 'SAFE' | 'WARNING' | 'BREACHED' = 'SAFE';
    if (state.current_equity <= maxFloor) maxStatus = 'BREACHED';
    else if (maxRemaining <= maxLimitAmount * 0.25) maxStatus = 'WARNING';

    const marginUsagePct = state.total_margin_available > 0
      ? Math.round(((state.margin_used / state.total_margin_available) * 100) * 10) / 10
      : 0;
    let marginStatus: 'SAFE' | 'WARNING' | 'GAMBLING_FLAG_BREACH' = 'SAFE';
    if (marginUsagePct >= 80) marginStatus = 'GAMBLING_FLAG_BREACH';
    else if (marginUsagePct >= 65) marginStatus = 'WARNING';

    const consistencyPct = state.total_profit > 0
      ? Math.round(((state.top_single_day_profit / state.total_profit) * 100) * 10) / 10
      : 0;
    let consistencyStatus: 'SAFE' | 'WARNING' | 'FAILED_THRESHOLD' = 'SAFE';
    if (consistencyPct > state.consistency_threshold_pct) consistencyStatus = 'FAILED_THRESHOLD';
    else if (consistencyPct > state.consistency_threshold_pct - 5) consistencyStatus = 'WARNING';

    const warnings: string[] = [];
    const rules: string[] = [];

    if (dailyStatus === 'BREACHED') {
      warnings.push(`Daily drawdown limit breached! Equity ($${state.current_equity.toLocaleString()}) dropped below daily floor ($${dailyFloor.toLocaleString()}).`);
      rules.push(`${state.daily_drawdown_limit_pct}% Daily Drawdown Limit`);
    }
    if (maxStatus === 'BREACHED') {
      warnings.push(`Maximum overall drawdown breached! Equity ($${state.current_equity.toLocaleString()}) dropped below loss floor ($${maxFloor.toLocaleString()}).`);
      rules.push(`${state.max_drawdown_limit_pct}% Maximum Overall Drawdown`);
    }
    if (marginStatus === 'GAMBLING_FLAG_BREACH') {
      warnings.push(`Margin rule violated! Margin usage is ${marginUsagePct}%, which exceeds 80%. Goat Funded Trader classifies this as gambling-style exposure and can forfeit profits or reset the account.`);
      rules.push('80% Maximum Margin Usage Rule (FAQ)');
    }
    if (consistencyStatus === 'FAILED_THRESHOLD') {
      warnings.push(`Consistency threshold failed: Your top day represents ${consistencyPct}% of total profit (max allowed: ${state.consistency_threshold_pct}%). Extra distributed trading days required before payout.`);
      rules.push('Funded Payout Consistency Rule (33% Cap)');
    }

    let overall: SimulatorEvaluation['overall_verdict'] = 'ACCOUNT_HEALTHY';
    if (dailyStatus === 'BREACHED' || maxStatus === 'BREACHED' || marginStatus === 'GAMBLING_FLAG_BREACH') {
      overall = 'ACCOUNT_BREACHED';
    } else if (dailyStatus === 'WARNING' || maxStatus === 'WARNING' || marginStatus === 'WARNING' || consistencyStatus === 'FAILED_THRESHOLD') {
      overall = 'APPROACHING_RISK_LIMIT';
    }

    setEvaluation({
      daily_loss_status: dailyStatus,
      daily_loss_amount: dailyLoss,
      daily_loss_allowed: dailyLimitAmount,
      daily_loss_remaining: dailyRemaining,
      daily_loss_floor: dailyFloor,
      max_loss_status: maxStatus,
      max_loss_amount: maxLoss,
      max_loss_allowed: maxLimitAmount,
      max_loss_remaining: maxRemaining,
      max_loss_floor: maxFloor,
      margin_status: marginStatus,
      margin_usage_pct: marginUsagePct,
      margin_limit_pct: 80,
      consistency_status: consistencyStatus,
      consistency_pct: consistencyPct,
      consistency_max_allowed_pct: state.consistency_threshold_pct,
      overall_verdict: overall,
      critical_warnings: warnings,
      responsible_rules: rules
    });
  }, [state]);

  const loadPreset = (type: 'HEALTHY' | 'DAILY_BREACH' | 'MARGIN_TRAP' | 'CONSISTENCY_FAIL' | 'ROLLOVER_RISK') => {
    const size = state.account_size;
    if (type === 'HEALTHY') {
      setState(prev => ({
        ...prev,
        current_balance: size + 3000,
        current_equity: size + 2800,
        day_start_balance: size + 3000,
        day_high_water_equity: size + 3200,
        open_floating_pnl: -200,
        margin_used: 400,
        total_margin_available: 2000,
        top_single_day_profit: 800,
        total_profit: 3000
      }));
    } else if (type === 'DAILY_BREACH') {
      const start = size + 1000;
      const floor = start - (start * (state.daily_drawdown_limit_pct / 100));
      setState(prev => ({
        ...prev,
        day_start_balance: start,
        current_balance: start,
        current_equity: floor - 250, // Breached
        open_floating_pnl: -((start * (state.daily_drawdown_limit_pct / 100)) + 250),
        margin_used: 800,
        total_margin_available: 2000
      }));
    } else if (type === 'MARGIN_TRAP') {
      setState(prev => ({
        ...prev,
        current_balance: size + 2000,
        current_equity: size + 2000,
        margin_used: 1750, // 87.5% margin used
        total_margin_available: 2000
      }));
    } else if (type === 'CONSISTENCY_FAIL') {
      setState(prev => ({
        ...prev,
        top_single_day_profit: 2800,
        total_profit: 3500 // 80% on 1 day
      }));
    } else if (type === 'ROLLOVER_RISK') {
      setState(prev => ({
        ...prev,
        day_start_balance: size + 4000,
        current_balance: size + 4000,
        current_equity: size + 4000 - (size * 0.036),
        open_floating_pnl: -(size * 0.036),
        margin_used: 1100,
        total_margin_available: 2000
      }));
    }
  };

  // SVG Chart Calculations
  const minVal = Math.min(
    evaluation?.max_loss_floor || state.initial_balance * 0.9,
    evaluation?.daily_loss_floor || state.day_start_balance * 0.95,
    state.current_equity * 0.98
  );
  const maxVal = Math.max(
    state.day_start_balance * 1.05,
    state.current_equity * 1.05,
    state.initial_balance * 1.1
  );
  const range = maxVal - minVal || 1;

  const getY = (val: number) => {
    const pct = (val - minVal) / range;
    return Math.max(25, Math.min(160, 160 - pct * 130));
  };

  const equityY = getY(state.current_equity);
  const startY = getY(state.day_start_balance);
  const dailyFloorY = evaluation ? getY(evaluation.daily_loss_floor) : 120;
  const maxFloorY = evaluation ? getY(evaluation.max_loss_floor) : 150;

  return (
    <div id="live-simulator-container" className="space-y-6 animate-fadeIn">
      {/* Top Banner & Scenario Presets */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-zinc-900 via-zinc-925 to-zinc-950 border border-zinc-800 shadow-xl space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-indigo-500/15 border border-indigo-500/30 text-indigo-400">
                <SlidersHorizontal className="h-5 w-5" />
              </span>
              <h1 className="text-xl sm:text-2xl font-black text-zinc-100">
                Deterministic Rule & Drawdown Simulator
              </h1>
            </div>
            <p className="text-xs text-zinc-300 max-w-3xl leading-relaxed">
              Simulate any account balance, floating PnL, leverage usage, and multi-day profit distributions. Test hidden policy edge-cases (e.g. 5:00 PM EST daily reset, 80% margin cap, 33% profit cap) before executing trades.
            </p>
          </div>

          {/* Quick Scenario Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] font-mono text-zinc-500 uppercase mr-1">One-Click Scenarios:</span>
            <button
              onClick={() => loadPreset('HEALTHY')}
              className="px-3 py-1.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30 text-xs font-semibold cursor-pointer transition-colors"
            >
              ✅ Safe Day
            </button>
            <button
              onClick={() => loadPreset('DAILY_BREACH')}
              className="px-3 py-1.5 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-500/30 text-xs font-semibold cursor-pointer transition-colors"
            >
              🚨 Daily Breach (4%)
            </button>
            <button
              onClick={() => loadPreset('MARGIN_TRAP')}
              className="px-3 py-1.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 text-xs font-semibold cursor-pointer transition-colors"
            >
              ⚠️ 80% Margin Trap
            </button>
            <button
              onClick={() => loadPreset('CONSISTENCY_FAIL')}
              className="px-3 py-1.5 rounded-xl bg-purple-500/15 hover:bg-purple-500/25 text-purple-300 border border-purple-500/30 text-xs font-semibold cursor-pointer transition-colors"
            >
              📊 33% Consistency Fail
            </button>
          </div>
        </div>
      </div>

      {/* Main Interactive Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT COLUMN: PARAMETER ADJUSTMENT SLIDERS & CONTROLS */}
        <div className="lg:col-span-6 space-y-4">
          {/* Account Base Setup */}
          <div className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <h3 className="font-mono text-xs uppercase tracking-wider text-indigo-400 font-bold flex items-center gap-2">
                <Layers className="h-4 w-4" />
                <span>1. Account Configuration</span>
              </h3>
              <span className="text-[11px] font-mono text-zinc-400">Balance: ${state.account_size.toLocaleString()}</span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] text-zinc-400 font-mono block mb-1">Account Tier Size ($)</label>
                <select
                  aria-label="Account tier size"
                  value={state.account_size}
                  onChange={e => {
                    const val = Number(e.target.value);
                    setState(prev => ({
                      ...prev,
                      account_size: val,
                      initial_balance: val,
                      current_balance: val,
                      current_equity: val,
                      day_start_balance: val,
                      day_high_water_equity: val
                    }));
                  }}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-100 font-mono focus:border-indigo-500 focus:outline-none"
                >
                  <option value={5000}>$5,000</option>
                  <option value={10000}>$10,000</option>
                  <option value={25000}>$25,000</option>
                  <option value={50000}>$50,000</option>
                  <option value={100000}>$100,000</option>
                  <option value={200000}>$200,000</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] text-zinc-400 font-mono block mb-1">Drawdown Calculation Type</label>
                <select
                  aria-label="Drawdown calculation type"
                  value={state.drawdown_calc_type}
                  onChange={e => setState(prev => ({ ...prev, drawdown_calc_type: e.target.value as any }))}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-100 font-mono focus:border-indigo-500 focus:outline-none"
                >
                  <option value="Balance-Based">Balance-Based (2-Step / Instant)</option>
                  <option value="High-Water-Trailing">High-Water-Trailing (1-Step)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] text-zinc-400 font-mono block mb-1">Daily Drawdown Limit (%)</label>
                <input
                  type="number"
                  value={state.daily_drawdown_limit_pct}
                  onChange={e => setState(prev => ({ ...prev, daily_drawdown_limit_pct: Number(e.target.value) }))}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-100 font-mono focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] text-zinc-400 font-mono block mb-1">Max Overall Drawdown (%)</label>
                <input
                  type="number"
                  value={state.max_drawdown_limit_pct}
                  onChange={e => setState(prev => ({ ...prev, max_drawdown_limit_pct: Number(e.target.value) }))}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-100 font-mono focus:border-indigo-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Real-time Balances & Floating Equity */}
          <div className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <h3 className="font-mono text-xs uppercase tracking-wider text-indigo-400 font-bold flex items-center gap-2">
                <Activity className="h-4 w-4" />
                <span>2. Live Balance & Floating PnL</span>
              </h3>
              <span className="text-[11px] font-mono text-cyan-400">
                Floating: {state.open_floating_pnl >= 0 ? `+$${state.open_floating_pnl}` : `-$${Math.abs(state.open_floating_pnl)}`}
              </span>
            </div>

            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-xs font-mono mb-1">
                  <span className="text-zinc-400">Today's Start Balance (5:00 PM EST):</span>
                  <span className="text-zinc-100 font-bold">${state.day_start_balance.toLocaleString()}</span>
                </div>
                <input
                  type="range"
                  min={state.account_size * 0.9}
                  max={state.account_size * 1.15}
                  step={100}
                  value={state.day_start_balance}
                  onChange={e => {
                    const val = Number(e.target.value);
                    setState(prev => ({
                      ...prev,
                      day_start_balance: val,
                      current_balance: val,
                      current_equity: val + prev.open_floating_pnl
                    }));
                  }}
                  className="w-full h-1.5 bg-zinc-950 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs font-mono mb-1">
                  <span className="text-zinc-400">Current Floating Open PnL:</span>
                  <span className={`font-bold ${state.open_floating_pnl >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    ${state.open_floating_pnl.toLocaleString()}
                  </span>
                </div>
                <input
                  type="range"
                  min={-(state.account_size * 0.08)}
                  max={state.account_size * 0.1}
                  step={50}
                  value={state.open_floating_pnl}
                  onChange={e => {
                    const pnl = Number(e.target.value);
                    setState(prev => ({
                      ...prev,
                      open_floating_pnl: pnl,
                      current_equity: prev.day_start_balance + pnl
                    }));
                  }}
                  className="w-full h-1.5 bg-zinc-950 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800">
                  <span className="text-[10px] text-zinc-500 uppercase block font-mono">Current Balance</span>
                  <span className="text-sm font-bold font-mono text-zinc-200">${state.current_balance.toLocaleString()}</span>
                </div>
                <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800">
                  <span className="text-[10px] text-zinc-500 uppercase block font-mono">Current Equity</span>
                  <span className="text-sm font-bold font-mono text-indigo-300">${state.current_equity.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Hidden Rule Exposures: 80% Margin & Consistency */}
          <div className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <h3 className="font-mono text-xs uppercase tracking-wider text-amber-400 font-bold flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                <span>3. Hidden Traps & Consistency Parameters</span>
              </h3>
              <span className="text-[11px] font-mono text-amber-300">FAQ Policy Enforced</span>
            </div>

            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-xs font-mono mb-1">
                  <span className="text-zinc-400">Margin Used / Total Available:</span>
                  <span className={`font-bold ${evaluation && evaluation.margin_usage_pct >= 80 ? 'text-rose-400' : 'text-zinc-200'}`}>
                    ${state.margin_used} / ${state.total_margin_available} ({evaluation?.margin_usage_pct}%)
                  </span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={state.total_margin_available}
                  step={50}
                  value={state.margin_used}
                  onChange={e => setState(prev => ({ ...prev, margin_used: Number(e.target.value) }))}
                  className="w-full h-1.5 bg-zinc-950 rounded-lg appearance-none cursor-pointer accent-amber-500"
                />
                <span className="text-[10px] text-zinc-500 block mt-1">
                  ⚠️ Goat Funded Trader limits total margin usage to <strong>80% max</strong>. Exceeding this triggers anti-gambling profit voiding.
                </span>
              </div>

              <div>
                <div className="flex justify-between text-xs font-mono mb-1">
                  <span className="text-zinc-400">Top Day Profit / Total Profit:</span>
                  <span className={`font-bold ${evaluation && evaluation.consistency_pct > 33 ? 'text-purple-400' : 'text-zinc-200'}`}>
                    ${state.top_single_day_profit} / ${state.total_profit} ({evaluation?.consistency_pct}%)
                  </span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={state.total_profit || 1000}
                  step={50}
                  value={state.top_single_day_profit}
                  onChange={e => setState(prev => ({ ...prev, top_single_day_profit: Number(e.target.value) }))}
                  className="w-full h-1.5 bg-zinc-950 rounded-lg appearance-none cursor-pointer accent-purple-500"
                />
                <span className="text-[10px] text-zinc-500 block mt-1">
                  📊 On Instant accounts, 1 single day cannot represent more than <strong>33% of total profit</strong>.
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: LIVE GAUGES, VISUAL CHART & EVALUATION VERDICT */}
        <div className="lg:col-span-6 space-y-4">
          {/* Main Verdict Card */}
          <div className={`p-6 rounded-2xl border ${
            evaluation?.overall_verdict === 'ACCOUNT_BREACHED'
              ? 'bg-gradient-to-br from-rose-950/60 via-zinc-900 to-zinc-950 border-rose-500 shadow-2xl shadow-rose-950/40'
              : evaluation?.overall_verdict === 'APPROACHING_RISK_LIMIT'
              ? 'bg-gradient-to-br from-amber-950/60 via-zinc-900 to-zinc-950 border-amber-500 shadow-2xl shadow-amber-950/40'
              : 'bg-gradient-to-br from-emerald-950/60 via-zinc-900 to-zinc-950 border-emerald-500 shadow-2xl shadow-emerald-950/40'
          } space-y-4`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {evaluation?.overall_verdict === 'ACCOUNT_BREACHED' ? (
                  <Flame className="h-6 w-6 text-rose-400 animate-bounce" />
                ) : evaluation?.overall_verdict === 'APPROACHING_RISK_LIMIT' ? (
                  <AlertTriangle className="h-6 w-6 text-amber-400" />
                ) : (
                  <CheckCircle2 className="h-6 w-6 text-emerald-400" />
                )}
                <h3 className="text-xl font-black text-white">
                  {evaluation?.overall_verdict === 'ACCOUNT_BREACHED'
                    ? 'ACCOUNT BREACHED / VIOLATED'
                    : evaluation?.overall_verdict === 'APPROACHING_RISK_LIMIT'
                    ? 'WARNING: APPROACHING RISK LIMIT'
                    : 'ACCOUNT HEALTHY & FULLY COMPLIANT'}
                </h3>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-mono font-bold ${
                evaluation?.overall_verdict === 'ACCOUNT_BREACHED'
                  ? 'bg-rose-500 text-white'
                  : evaluation?.overall_verdict === 'APPROACHING_RISK_LIMIT'
                  ? 'bg-amber-500 text-zinc-950'
                  : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
              }`}>
                {evaluation?.overall_verdict.replace(/_/g, ' ')}
              </span>
            </div>

            {/* Critical Warnings list if any */}
            {evaluation && evaluation.critical_warnings.length > 0 && (
              <div className="p-3.5 rounded-xl bg-zinc-950/90 border border-rose-500/40 space-y-1.5 text-xs text-rose-300">
                <span className="font-bold block text-rose-200">Active Violations Detected:</span>
                {evaluation.critical_warnings.map((w, idx) => (
                  <div key={idx} className="flex items-start gap-2">
                    <span className="text-rose-400 mt-0.5">•</span>
                    <span>{w}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Visual Progress Meters */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              {/* Daily Drawdown Meter */}
              <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 space-y-1.5 font-mono">
                <div className="flex justify-between text-[11px]">
                  <span className="text-zinc-400">Daily Buffer Left</span>
                  <span className={`font-bold ${evaluation && evaluation.daily_loss_remaining <= 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                    ${evaluation?.daily_loss_remaining.toFixed(2)}
                  </span>
                </div>
                <div className="w-full bg-zinc-800 h-2 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${
                      evaluation && evaluation.daily_loss_status === 'BREACHED'
                        ? 'bg-rose-500'
                        : evaluation && evaluation.daily_loss_status === 'WARNING'
                        ? 'bg-amber-500'
                        : 'bg-emerald-500'
                    }`}
                    style={{
                      width: `${Math.min(100, Math.max(0, ((evaluation?.daily_loss_remaining || 0) / (evaluation?.daily_loss_allowed || 1)) * 100))}%`
                    }}
                  />
                </div>
                <div className="flex justify-between text-[9px] text-zinc-500">
                  <span>Floor: ${evaluation?.daily_loss_floor.toFixed(0)}</span>
                  <span>Limit: 4%</span>
                </div>
              </div>

              {/* Max Overall Drawdown Meter */}
              <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 space-y-1.5 font-mono">
                <div className="flex justify-between text-[11px]">
                  <span className="text-zinc-400">Max Overall Buffer</span>
                  <span className={`font-bold ${evaluation && evaluation.max_loss_remaining <= 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                    ${evaluation?.max_loss_remaining.toFixed(2)}
                  </span>
                </div>
                <div className="w-full bg-zinc-800 h-2 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${
                      evaluation && evaluation.max_loss_status === 'BREACHED'
                        ? 'bg-rose-500'
                        : evaluation && evaluation.max_loss_status === 'WARNING'
                        ? 'bg-amber-500'
                        : 'bg-indigo-500'
                    }`}
                    style={{
                      width: `${Math.min(100, Math.max(0, ((evaluation?.max_loss_remaining || 0) / (evaluation?.max_loss_allowed || 1)) * 100))}%`
                    }}
                  />
                </div>
                <div className="flex justify-between text-[9px] text-zinc-500">
                  <span>Floor: ${evaluation?.max_loss_floor.toFixed(0)}</span>
                  <span>Limit: 8%</span>
                </div>
              </div>
            </div>
          </div>

          {/* SVG Visual Risk Map & Equity Curve */}
          <div className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs uppercase tracking-wider text-zinc-400 font-semibold flex items-center gap-2">
                <TrendingDown className="h-4 w-4 text-cyan-400" />
                <span>Visual Equity vs Drawdown Floors</span>
              </span>
              <span className="text-[10px] font-mono text-zinc-500">Live Render</span>
            </div>

            {/* SVG Visual Stage */}
            <div className="relative rounded-xl bg-zinc-950 border border-zinc-850 p-3 h-48 flex items-center justify-center overflow-hidden">
              <svg className="w-full h-full" viewBox="0 0 400 180">
                {/* Background grid lines */}
                <line x1="20" y1="30" x2="380" y2="30" stroke="#27272a" strokeDasharray="3 3" />
                <line x1="20" y1="80" x2="380" y2="80" stroke="#27272a" strokeDasharray="3 3" />
                <line x1="20" y1="130" x2="380" y2="130" stroke="#27272a" strokeDasharray="3 3" />

                {/* Day Start Line */}
                <line x1="40" y1={startY} x2="360" y2={startY} stroke="#6366f1" strokeWidth="2" strokeDasharray="4 4" />
                <text x="45" y={Math.max(15, startY - 6)} fill="#a5b4fc" fontSize="10" fontFamily="monospace">
                  Day Start: ${state.day_start_balance.toLocaleString()}
                </text>

                {/* Daily Loss Floor Line */}
                <line x1="40" y1={dailyFloorY} x2="360" y2={dailyFloorY} stroke="#f43f5e" strokeWidth="2" strokeDasharray="2 2" />
                <text x="45" y={Math.min(175, dailyFloorY + 12)} fill="#fda4af" fontSize="10" fontFamily="monospace">
                  4% Daily Floor: ${evaluation?.daily_loss_floor.toFixed(0)}
                </text>

                {/* Max Loss Floor Line */}
                <line x1="40" y1={maxFloorY} x2="360" y2={maxFloorY} stroke="#e11d48" strokeWidth="2" />
                <text x="220" y={Math.min(175, maxFloorY + 12)} fill="#f43f5e" fontSize="10" fontFamily="monospace">
                  8% Hard Floor: ${evaluation?.max_loss_floor.toFixed(0)}
                </text>

                {/* Live Current Equity Point */}
                <circle cx="280" cy={equityY} r="7" fill="#10b981" stroke="#ffffff" strokeWidth="2" />
                <text x="220" y={Math.max(20, equityY - 12)} fill="#34d399" fontSize="11" fontWeight="bold" fontFamily="monospace">
                  Equity: ${state.current_equity.toLocaleString()}
                </text>

                {/* Connecting trace */}
                <polyline
                  points={`60,${startY} 120,${(startY + equityY) / 2} 200,${equityY + 5} 280,${equityY}`}
                  fill="none"
                  stroke="#10b981"
                  strokeWidth="2.5"
                  opacity="0.8"
                />
              </svg>
            </div>

            {/* Quick Rules Takeaway */}
            <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 text-[11px] text-zinc-400 space-y-1">
              <span className="font-bold text-zinc-200 block">💡 Pro Trader Compliance Tips:</span>
              <p>• Daily drawdown is evaluated at 5:00 PM EST based on the start balance of that trading day.</p>
              <p>• Floating unrealized losses count immediately toward your daily breach limit.</p>
              <p>• Close all positions and cancel pending limit orders before requesting payouts.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
