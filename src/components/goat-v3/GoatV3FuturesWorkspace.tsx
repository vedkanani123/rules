import React, { useState } from 'react';
import { GFTFuturesModel } from '../../data/goatCanonicalData.ts';
import {
  Flame,
  Clock,
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Layers,
  Activity,
  Terminal,
} from 'lucide-react';

interface GoatV3FuturesWorkspaceProps {
  futuresModels: GFTFuturesModel[];
}

export const GoatV3FuturesWorkspace: React.FC<GoatV3FuturesWorkspaceProps> = ({
  futuresModels,
}) => {
  const [selectedFuturesId, setSelectedFuturesId] = useState<string>('futures-50k');

  const activeModel =
    futuresModels.find((f) => f.id === selectedFuturesId) || futuresModels[0];

  return (
    <section id="futures" className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
              <Flame className="w-5 h-5 text-amber-400" />
              Dedicated CME Futures Evaluation Desk
            </h2>
            <span className="text-xs px-2 py-0.5 rounded font-mono font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
              CME Order Book
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400">
            Independent CME Futures rules. Completely isolated from Forex/CFD metrics. No CFD spreads, real tick execution.
          </p>
        </div>
      </div>

      {/* Account Size Switcher */}
      <div className="flex flex-wrap gap-2">
        {futuresModels.map((f) => {
          const isSelected = selectedFuturesId === f.id;
          return (
            <button
              key={f.id}
              onClick={() => setSelectedFuturesId(f.id)}
              className={`px-4 py-2 rounded-xl text-xs font-mono font-bold border transition-all cursor-pointer ${
                isSelected
                  ? 'bg-amber-600/20 text-amber-300 border-amber-500/60 shadow-md shadow-amber-500/10'
                  : 'bg-[#111318] hover:bg-[#16181E] text-slate-300 border-[#1F2228]'
              }`}
            >
              ${f.nominalSize.toLocaleString()} Challenge · ${f.evalPrice}
            </button>
          );
        })}
      </div>

      {/* Active Model Snapshot Card */}
      <div className="p-5 rounded-2xl bg-[#111318] border border-[#1F2228] space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/[0.06] pb-3">
          <div>
            <h3 className="text-base font-extrabold text-white">{activeModel.name}</h3>
            <p className="text-xs text-slate-400">
              Platforms: {activeModel.supportedPlatforms.join(', ')}
            </p>
          </div>
          <div className="text-right">
            <div className="text-xs text-slate-400">Evaluation Fee:</div>
            <div className="text-xl font-black text-white font-mono">${activeModel.evalPrice}</div>
          </div>
        </div>

        {/* 4 Core Parameter Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="p-3.5 rounded-xl bg-[#16181E] border border-[#1F2228] space-y-1">
            <span className="text-[11px] font-mono text-slate-400 block">PROFIT TARGET</span>
            <div className="text-lg font-black text-emerald-400 font-mono">
              +${activeModel.profitTarget.toLocaleString()} ({activeModel.profitTargetPct}%)
            </div>
            <p className="text-[10px] text-slate-400">Single phase qualification</p>
          </div>

          <div className="p-3.5 rounded-xl bg-[#16181E] border border-[#1F2228] space-y-1">
            <span className="text-[11px] font-mono text-slate-400 block">DAILY LOSS LIMIT</span>
            <div className="text-lg font-black text-amber-400 font-mono">
              -${activeModel.dailyLossLimit.toLocaleString()} ({activeModel.dailyLossPct}%)
            </div>
            <p className="text-[10px] text-slate-400">Resets daily at 5:00 PM EST</p>
          </div>

          <div className="p-3.5 rounded-xl bg-[#16181E] border border-[#1F2228] space-y-1">
            <span className="text-[11px] font-mono text-slate-400 block">EOD TRAILING DRAWDOWN</span>
            <div className="text-lg font-black text-rose-400 font-mono">
              -${activeModel.maxTrailingDrawdown.toLocaleString()} ({activeModel.maxTrailingDrawdownPct}%)
            </div>
            <p className="text-[10px] text-slate-400">Calculated at CME settlement</p>
          </div>

          <div className="p-3.5 rounded-xl bg-[#16181E] border border-[#1F2228] space-y-1">
            <span className="text-[11px] font-mono text-slate-400 block">MAX PERMITTED CONTRACTS</span>
            <div className="text-lg font-black text-blue-400 font-mono">
              {activeModel.maxContracts.minis} Minis / {activeModel.maxContracts.micros} Micros
            </div>
            <p className="text-[10px] text-slate-400">Across ES, NQ, YM, GC, CL</p>
          </div>
        </div>

        {/* Futures Execution Guardrails */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
          {/* Critical Overnight Rule */}
          <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/25 space-y-1">
            <div className="flex items-center gap-1.5 text-xs font-bold text-rose-300">
              <Clock className="w-3.5 h-3.5 text-rose-400" />
              Strict CME Daily Close Rule (Zero Overnight Holding)
            </div>
            <p className="text-xs text-rose-200/90 leading-relaxed">
              All open positions must be closed by <strong>4:45 PM EST</strong> daily. The CME market halts from 5:00 PM to 6:00 PM EST. Holding any open futures contract through the daily maintenance window triggers automated liquidation and immediate account breach.
            </p>
          </div>

          {/* Safety Buffer & Payout Rule */}
          <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/25 space-y-1">
            <div className="flex items-center gap-1.5 text-xs font-bold text-amber-300">
              <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
              Safety Buffer & 20% Consistency Threshold
            </div>
            <p className="text-xs text-amber-200/90 leading-relaxed">
              Traders must maintain a <strong>${activeModel.safetyBufferRequired.toLocaleString()} safety buffer</strong> in the master account above initial capital before withdrawal requests are enabled. The best trading day cannot represent more than 20% of total profit.
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-white/[0.04]">
          <span className="flex items-center gap-1">
            <Calendar className="w-3 h-3 text-slate-400" />
            Verified CME Terms: <strong className="text-slate-200">Sept 2026 Audit</strong>
          </span>
          <span>Data Feed fees post-pass: <strong className="text-slate-200">Direct exchange billing</strong></span>
        </div>
      </div>
    </section>
  );
};
