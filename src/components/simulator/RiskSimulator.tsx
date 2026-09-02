import React, { useState, useMemo } from 'react';
import { simulateAccountState } from '../../core/calculator/engine.ts';
import { DrawdownType } from '../../types/schema.ts';
import { ShieldCheck, AlertTriangle, AlertOctagon, RefreshCw, DollarSign } from 'lucide-react';

interface RiskSimulatorProps {
  initialNominalSize?: number;
  initialDailyLossPct?: number;
  initialMaxLossPct?: number;
  initialDrawdownType?: DrawdownType;
}

export const RiskSimulator: React.FC<RiskSimulatorProps> = ({
  initialNominalSize = 100000,
  initialDailyLossPct = 4,
  initialMaxLossPct = 8,
  initialDrawdownType = 'static',
}) => {
  const [nominalSize, setNominalSize] = useState<number>(initialNominalSize);
  const [balance, setBalance] = useState<number>(initialNominalSize);
  const [equity, setEquity] = useState<number>(initialNominalSize);
  const [highWaterToday, setHighWaterToday] = useState<number>(initialNominalSize);
  const [dailyLossLimitPct, setDailyLossLimitPct] = useState<number>(initialDailyLossPct);
  const [maxLossLimitPct, setMaxLossLimitPct] = useState<number>(initialMaxLossPct);
  const [drawdownType, setDrawdownType] = useState<DrawdownType>(initialDrawdownType);
  const [tradeRiskPct, setTradeRiskPct] = useState<number>(1.0);

  const effectiveHighWater = useMemo(() => Math.max(highWaterToday, equity), [highWaterToday, equity]);

  const simulation = useMemo(() => {
    return simulateAccountState({
      nominalSize,
      startingBalance: balance,
      currentBalance: balance,
      currentEquity: equity,
      todayStartEquity: balance,
      highWaterEquityToday: effectiveHighWater,
      dailyLossLimitPct,
      maxLossLimitPct,
      drawdownType,
      openLotsRisked: 1.0,
      tradeRiskPercent: tradeRiskPct,
    });
  }, [nominalSize, balance, equity, effectiveHighWater, dailyLossLimitPct, maxLossLimitPct, drawdownType, tradeRiskPct]);

  const handleEquityChange = (newEquity: number) => {
    setEquity(newEquity);
    if (newEquity > highWaterToday) {
      setHighWaterToday(newEquity);
    }
  };

  const handleReset = () => {
    setBalance(nominalSize);
    setEquity(nominalSize);
    setHighWaterToday(nominalSize);
    setTradeRiskPct(1.0);
  };

  const handleSizeChange = (size: number) => {
    setNominalSize(size);
    setBalance(size);
    setEquity(size);
    setHighWaterToday(size);
  };

  const statusStyle = {
    SAFE: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400',
    WARNING: 'bg-amber-500/10 border-amber-500/20 text-amber-400',
    BREACH: 'bg-red-500/10 border-red-500/20 text-red-400',
  }[simulation.overallStatus];

  return (
    <div className="rounded-xl overflow-hidden bg-[#111318] border border-[#1F2228]">
      {/* Terminal header with traffic lights */}
      <div className="px-4 py-3 bg-[#0F1014] border-b border-[#1F2228] flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="w-2.5 h-2.5 rounded-full bg-[#ff5f56] border border-black/10" />
            <span className="w-2.5 h-2.5 rounded-full bg-[#ffbd2e] border border-black/10" />
            <span className="w-2.5 h-2.5 rounded-full bg-[#27c93f] border border-black/10" />
          </div>
          <span className="text-[10px] font-mono tracking-widest uppercase text-[#6B7280] truncate">RISK ENGINE — LIVE</span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[10px] font-mono font-semibold tracking-widest uppercase ${statusStyle}`}>
            {simulation.overallStatus==='SAFE' && <ShieldCheck className="w-3 h-3" />}
            {simulation.overallStatus==='WARNING' && <AlertTriangle className="w-3 h-3" />}
            {simulation.overallStatus==='BREACH' && <AlertOctagon className="w-3 h-3" />}
            {simulation.overallStatus}
          </span>
          <button onClick={handleReset} aria-label="Reset simulation" className="w-8 h-8 rounded-lg bg-[#111318] border border-[#1F2228] flex items-center justify-center text-[#6B7280] hover:text-white hover:bg-[#16181E] hover:border-[#2A2D35] transition-colors"><RefreshCw className="w-3.5 h-3.5" /></button>
        </div>
      </div>

      <div className="p-4 sm:p-5 space-y-5">
        <div>
          <p className="text-[10px] font-mono tracking-widest uppercase text-[#6B7280] mb-2">Account size</p>
          <div className="flex gap-1.5 overflow-x-auto scrollbar-hide pb-1">
            {[5000,10000,25000,50000,100000,200000].map(size=>(
              <button key={size} onClick={()=>handleSizeChange(size)} className={`shrink-0 px-3.5 py-2 rounded-lg text-xs font-mono font-medium border transition-colors ${nominalSize===size ? 'bg-[#2563eb] text-white border-[#2563eb]' : 'bg-[#080A10] border-[#1F2228] text-[#8A8F98] hover:text-white hover:border-[#2A2D35] hover:bg-[#16181E]'}`}>${(size/1000).toFixed(0)}k</button>
            ))}
          </div>
        </div>

        <div className="p-4 rounded-xl bg-[#080A10] border border-[#1F2228] space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono tracking-widest uppercase text-[#6B7280] flex items-center gap-1.5"><DollarSign className="w-3 h-3" /> Current equity</span>
            <span className="text-sm font-semibold font-mono text-white">${equity.toLocaleString()}</span>
          </div>
          <input type="range" aria-label="Adjust current equity" min={Math.round(nominalSize*0.80)} max={Math.round(nominalSize*1.20)} step={100} value={equity} onChange={e=>handleEquityChange(Number(e.target.value))} className="w-full h-1.5 bg-[#1F2228] rounded-full appearance-none cursor-pointer accent-[#3b82f6]" />
          <div className="flex justify-between text-[11px] font-mono text-[#6B7280]"><span>${(nominalSize*0.80).toLocaleString()} (-20%)</span><span>${(nominalSize*1.20).toLocaleString()} (+20%)</span></div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <label className="p-3 rounded-xl bg-[#080A10] border border-[#1F2228] space-y-1.5 block">
            <span className="text-[10px] font-mono tracking-widest uppercase text-[#6B7280]">Midnight start balance</span>
            <div className="flex items-center gap-2"><span className="text-sm font-mono text-[#6B7280]">$</span><input type="number" min={1000} aria-label="Midnight start balance" value={balance} onChange={e=>setBalance(Math.max(0, Number(e.target.value)||0))} className="w-full bg-transparent text-sm font-mono text-white focus:outline-none" /></div>
          </label>
          <label className="p-3 rounded-xl bg-[#080A10] border border-[#1F2228] space-y-1.5 block">
            <span className="text-[10px] font-mono tracking-widest uppercase text-[#6B7280]">Peak equity today (High-Water)</span>
            <div className="flex items-center gap-2"><span className="text-sm font-mono text-[#6B7280]">$</span><input type="number" min={1000} aria-label="Peak equity today" value={highWaterToday} onChange={e=>setHighWaterToday(Math.max(0, Number(e.target.value)||0))} className="w-full bg-transparent text-sm font-mono text-white focus:outline-none" /></div>
          </label>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <label className="space-y-1.5"><span className="text-[10px] font-mono tracking-widest uppercase text-[#6B7280]">Daily %</span><input type="number" min={1} max={25} step={0.5} aria-label="Daily loss percent" value={dailyLossLimitPct} onChange={e=>setDailyLossLimitPct(Math.max(0.1, Number(e.target.value)||0))} className="w-full px-3 py-2.5 rounded-xl bg-[#080A10] border border-[#1F2228] text-sm font-mono text-white focus:outline-none focus:border-[#2A2D35]" /></label>
          <label className="space-y-1.5"><span className="text-[10px] font-mono tracking-widest uppercase text-[#6B7280]">Max %</span><input type="number" min={1} max={30} step={0.5} aria-label="Max loss percent" value={maxLossLimitPct} onChange={e=>setMaxLossLimitPct(Math.max(0.1, Number(e.target.value)||0))} className="w-full px-3 py-2.5 rounded-xl bg-[#080A10] border border-[#1F2228] text-sm font-mono text-white focus:outline-none focus:border-[#2A2D35]" /></label>
          <label className="space-y-1.5"><span className="text-[10px] font-mono tracking-widest uppercase text-[#6B7280]">Type</span><select aria-label="Drawdown type" value={drawdownType} onChange={e=>setDrawdownType(e.target.value as DrawdownType)} className="w-full px-3 py-2.5 rounded-xl bg-[#080A10] border border-[#1F2228] text-sm text-white focus:outline-none focus:border-[#2A2D35]"><option value="static">Static floor</option><option value="trailing_equity">Trailing (Equity)</option><option value="trailing_balance">Trailing (Balance)</option></select></label>
          <label className="space-y-1.5"><span className="text-[10px] font-mono tracking-widest uppercase text-[#6B7280]">Trade Risk %</span><input type="number" min={0.25} max={10} step={0.25} aria-label="Trade risk percent" value={tradeRiskPct} onChange={e=>setTradeRiskPct(Math.max(0.1, Number(e.target.value)||0))} className="w-full px-3 py-2.5 rounded-xl bg-[#080A10] border border-[#1F2228] text-sm font-mono text-white focus:outline-none focus:border-[#2A2D35]" /></label>
        </div>

        <div className="p-4 rounded-xl bg-[#080A10] border border-[#1F2228] space-y-3">
          <p className="text-[10px] font-mono tracking-widest uppercase text-[#6B7280]">Live calculations</p>
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-xl bg-[#111318] border border-[#1F2228]">
              <p className="text-[10px] font-mono tracking-widest uppercase text-[#6B7280]">Daily floor</p>
              <p className="text-sm font-semibold font-mono text-white mt-1">${simulation.dailyLossFloor.toLocaleString()}</p>
              <p className={`text-xs font-mono mt-1 ${simulation.dailyLossStatus==='BREACH' ? 'text-red-400' : simulation.dailyLossStatus==='WARNING' ? 'text-amber-400' : 'text-emerald-400'}`}>
                {simulation.dailyLossDistance <= 0 ? `Breached by $${Math.abs(simulation.dailyLossDistance).toLocaleString()}` : `Buffer $${simulation.dailyLossDistance.toLocaleString()}`}
              </p>
            </div>
            <div className="p-3 rounded-xl bg-[#111318] border border-[#1F2228]">
              <p className="text-[10px] font-mono tracking-widest uppercase text-[#6B7280]">Max floor</p>
              <p className="text-sm font-semibold font-mono text-white mt-1">${simulation.maxLossFloor.toLocaleString()}</p>
              <p className={`text-xs font-mono mt-1 ${simulation.maxLossStatus==='BREACH' ? 'text-red-400' : simulation.maxLossStatus==='WARNING' ? 'text-amber-400' : 'text-emerald-400'}`}>
                {simulation.maxLossDistance <= 0 ? `Breached by $${Math.abs(simulation.maxLossDistance).toLocaleString()}` : `Buffer $${simulation.maxLossDistance.toLocaleString()}`}
              </p>
            </div>
          </div>
          <p className="text-xs leading-relaxed font-mono text-[#8A8F98] border-t border-[#1F2228] pt-3">{simulation.explanation}</p>
          {simulation.triggeredRules.length>0 && (
            <ul className="space-y-1.5">
              {simulation.triggeredRules.map((r,i)=><li key={i} className="text-xs leading-relaxed font-mono text-[#8A8F98] flex gap-2"><span className="text-amber-500 mt-0.5">•</span><span>{r}</span></li>)}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};
