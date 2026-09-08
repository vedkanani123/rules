import React from 'react';
import { ShieldCheck, AlertTriangle, AlertOctagon, TrendingUp, Scale } from 'lucide-react';
import { calculateMaxLossFloor, calculateDailyLossFloor } from '../../core/calculator/engine.ts';
import { AccountTier } from '../../types/schema.ts';

interface TradeScenario {
  label: string;
  pnl: number;
  equityDip?: number; // intraday lowest equity during trade
}

interface SameTradeVisualProps {
  accounts: { name: string; account: AccountTier; color: string }[];
  trades: TradeScenario[];
  startingEquity?: number;
}

export const SameTradeVisual: React.FC<SameTradeVisualProps> = ({ accounts, trades, startingEquity = 100000 }) => {
  // For each account, simulate cumulative P&L and check breach conditions
  // Scale trades proportionally based on each account's nominal size so a $5k account isn't tested with $100k dollar sizes
  const results = accounts.map(({ name, account }) => {
    const accSize = account.nominalSize || startingEquity;
    const sizeRatio = accSize / 100000;
    let equity = accSize;
    let peak = accSize;
    let status: 'PASS' | 'BREACH' | 'WARNING' = 'PASS';
    let reason = 'Survives all trades';
    const details: string[] = [];
    let breachAt: number | null = null;

    for (let i = 0; i < trades.length; i++) {
      const t = trades[i];
      const prevEquity = equity;
      const scaledPnl = t.pnl * sizeRatio;
      equity += scaledPnl;

      // Calculate scaled intraday low
      let intradayLow = equity;
      if (t.equityDip !== undefined) {
        const dipFromStart = t.equityDip - startingEquity;
        intradayLow = prevEquity + (dipFromStart * sizeRatio);
      }
      intradayLow = Math.min(equity, intradayLow);

      peak = Math.max(peak, equity);

      // Daily floor check
      const { floor: dailyFloor } = calculateDailyLossFloor(prevEquity, account.dailyLossLimit);
      // Max floor check
      const { floor: maxFloor } = calculateMaxLossFloor(accSize, peak, account.maxTotalLoss, account.drawdownType);

      if (intradayLow <= dailyFloor) {
        status = 'BREACH';
        reason = `Daily drawdown breach on ${t.label}`;
        breachAt = i;
        details.push(`Trade ${i+1} (${t.label}): equity low $${Math.round(intradayLow).toLocaleString()} ≤ daily floor $${Math.round(dailyFloor).toLocaleString()} (${account.dailyLossLimit}%)`);
        break;
      }
      if (intradayLow <= maxFloor) {
        status = 'BREACH';
        reason = `Max drawdown breach on ${t.label}`;
        breachAt = i;
        details.push(`Trade ${i+1}: equity $${Math.round(intradayLow).toLocaleString()} ≤ max floor $${Math.round(maxFloor).toLocaleString()} (${account.maxTotalLoss}% ${account.drawdownType.replace(/_/g, ' ')})`);
        break;
      }

      // Consistency warning: only evaluate after multiple trades when pattern can be judged
      if (account.consistencyRule && account.consistencyRule !== 'None' && i > 0 && scaledPnl > 0) {
        const totalProfit = equity - accSize;
        if (totalProfit > 0 && (scaledPnl / totalProfit) > 0.5) {
          if (status === 'PASS' || status === 'WARNING') {
            status = 'WARNING';
            reason = 'Consistency flag — single day dominates';
          }
          details.push(`Trade ${i+1}: $${Math.round(scaledPnl).toLocaleString()} is ${((scaledPnl/totalProfit)*100).toFixed(1)}% of $${Math.round(totalProfit).toLocaleString()} total profit`);
        }
      }
    }

    if (status === 'PASS' && equity - accSize > 0) {
      details.push(`Final: +$${Math.round(equity - accSize).toLocaleString()} profit, peak $${Math.round(peak).toLocaleString()}`);
    }

    return { name, account, status, reason, details, finalEquity: Math.round(equity), breachAt, nominalSize: accSize };
  });

  const statusStyle = {
    PASS: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400',
    WARNING: 'bg-amber-500/10 border-amber-500/20 text-amber-400',
    BREACH: 'bg-red-500/10 border-red-500/20 text-red-400',
  };
  const statusIcon = {
    PASS: ShieldCheck,
    WARNING: AlertTriangle,
    BREACH: AlertOctagon,
  };

  return (
    <div className="rounded-2xl overflow-hidden bg-[#111318] border border-[#1F2228]">
      <div className="px-5 py-4 border-b border-[#1F2228] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="w-9 h-9 rounded-xl bg-[#2563eb]/15 border border-[#2563eb]/20 flex items-center justify-center"><Scale className="w-4 h-4 text-[#2563eb]" /></span>
          <div>
            <h3 className="text-sm font-semibold text-white tracking-tight">Same Trade → Different Program → Different Outcome</h3>
            <p className="text-xs text-white/40 mt-0.5">One trade history, replayed against each program's real rules</p>
          </div>
        </div>
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#080A10] border border-[#1F2228] text-[11px] font-mono text-white/50"><TrendingUp className="w-3 h-3" />Deterministic math — no AI guess</span>
      </div>

      <div className="p-4 sm:p-5 space-y-4">
        {/* Trade strip */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {trades.map((t,i)=>(
            <div key={i} className="shrink-0 px-3 py-2.5 rounded-xl bg-[#080A10] border border-[#1F2228] text-center min-w-[110px]">
              <p className="text-[11px] font-mono uppercase tracking-wide text-white/30">{t.label}</p>
              <p className={`text-sm font-mono font-semibold ${t.pnl>=0?'text-emerald-400':'text-red-400'}`}>{t.pnl>=0?'+':''}${t.pnl.toLocaleString()}</p>
              {t.equityDip && <p className="text-[11px] font-mono text-white/30">low ${t.equityDip.toLocaleString()}</p>}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {results.map((r,i)=>{
            const Icon = statusIcon[r.status];
            return (
              <div key={i} className={`p-4 rounded-xl border flex flex-col gap-2 ${statusStyle[r.status]}`}>
                <div className="flex items-center gap-2">
                  <Icon className="w-4 h-4" />
                  <span className="text-xs font-bold tracking-wide uppercase">{r.status}</span>
                </div>
                <p className="text-[13px] font-semibold text-white leading-tight">{r.name}</p>
                <p className="text-xs leading-relaxed opacity-80">{r.reason}</p>
                <div className="mt-1 p-2 rounded-lg bg-black/20 border border-white/5 space-y-1">
                  <p className="text-[11px] font-mono text-white/60">{r.account.dailyLossLimit}% daily • {r.account.maxTotalLoss}% max • {r.account.drawdownType.replace(/_/g,' ')}</p>
                  <p className="text-[11px] font-mono text-white/40">${r.account.nominalSize.toLocaleString()} • final ${r.finalEquity.toLocaleString()}</p>
                </div>
                {r.details.length>0 && <ul className="mt-1 space-y-1">{r.details.slice(0,2).map((d,di)=><li key={di} className="text-[11px] leading-relaxed text-white/50">• {d}</li>)}</ul>}
              </div>
            );
          })}
        </div>

        <p className="text-[11px] leading-relaxed text-white/25 text-center px-4">This is the moat: traders finally understand <span className="text-white/60">“the problem is not your trade, it is how the program's rules interpret the trade.”</span> Math is exact — equity vs balance, EOD vs intraday included.</p>
      </div>
    </div>
  );
};
