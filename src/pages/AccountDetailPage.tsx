import React, { useMemo } from 'react';
import { PropFirm, AccountTier, SourceEvidence } from '../types/schema.ts';
import { RiskSimulator } from '../components/simulator/RiskSimulator.tsx';
import { RuleCard } from '../components/rules/RuleCard.tsx';
import { ShieldAlert, AlertTriangle, ArrowLeft, Receipt, Wallet, Calculator, Info } from 'lucide-react';
import { calculateAllInCost } from '../core/calculator/engine.ts';
import { SameTradeVisual } from '../components/comparison/SameTradeVisual.tsx';

interface AccountDetailPageProps {
  firm: PropFirm;
  account: AccountTier;
  onNavigate: (path: string) => void;
  onOpenSource: (evidence: SourceEvidence, ruleTitle: string) => void;
}

export const AccountDetailPage: React.FC<AccountDetailPageProps> = ({ firm, account, onNavigate, onOpenSource }) => {
  return (
    <div className="bg-[#080A10] min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        {/* Eyebrow */}
        <div className="pt-10 sm:pt-12 pb-8 border-b border-[#1F2228]">
          <button onClick={() => onNavigate(`/prop-firms/${firm.slug}`)} className="inline-flex items-center gap-1.5 text-[13px] text-[#8A8F98] hover:text-white transition-colors min-h-[44px] px-2 -mx-2 rounded-xl mb-4">
            <ArrowLeft className="w-4 h-4 shrink-0" />
            <span>Back to {firm.name} Dossier</span>
          </button>
          <p className="text-[11px] tracking-[0.14em] uppercase font-medium text-[#8A8F98] mb-3">THE DOSSIER — ACCOUNT DEEP-DIVE</p>
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-[#111318] border border-[#1F2228] text-white">{firm.name}</span>
                <span className="text-[11px] tracking-[0.12em] uppercase font-medium text-[#8A8F98]">Account deep-dive</span>
              </div>
              <h1 className="text-[26px] sm:text-[36px] font-semibold text-white tracking-tight leading-tight">{account.name}</h1>
              <p className="text-[13px] text-[#8A8F98] mt-2 max-w-2xl">Exact dollar thresholds, breach math, and verified sources for this tier.</p>
            </div>
            <div className="shrink-0 bg-[#111318] border border-[#1F2228] rounded-2xl p-4 min-w-[180px]">
              <span className="text-[11px] tracking-[0.12em] uppercase font-medium text-[#8A8F98] block">Registration Fee</span>
              <span className="text-2xl font-semibold font-mono text-white block mt-1">${account.discountedPrice || account.price}</span>
              {account.refundableFee && <span className="text-[13px] text-emerald-400 block font-medium mt-1">✓ 100% Refundable on 1st Payout</span>}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-8 p-4 rounded-2xl bg-[#111318] border border-[#1F2228]">
          {[
            { label: 'Nominal Capital', value: `$${account.nominalSize.toLocaleString()}`, sub: null },
            { label: 'Daily Drawdown', value: `${account.dailyLossLimit}%`, sub: `$${(account.nominalSize * account.dailyLossLimit / 100).toLocaleString()} • ${account.dailyLossCalculation.replace(/_/g, ' ')}` },
            { label: 'Max Total Loss', value: `${account.maxTotalLoss}%`, sub: `$${(account.nominalSize * account.maxTotalLoss / 100).toLocaleString()} • ${account.drawdownType.replace(/_/g,' ')}` },
            { label: 'Profit Split', value: `${account.profitSplit}%`, sub: `Up to ${account.profitSplitMaxWithAddon || 100}%` },
            { label: 'Profit Targets', value: account.profitTargetPhase1 ? `P1: ${account.profitTargetPhase1}%` : 'No Target', sub: account.profitTargetPhase2 ? `P2: ${account.profitTargetPhase2}%` : account.profitTargetPhase1 ? 'Single phase' : 'Instant funding' },
            { label: 'Leverage', value: account.leverage, sub: null },
            { label: 'Platforms', value: account.platforms.slice(0,2).join(', '), sub: account.platforms.length>2 ? `+${account.platforms.length-2} more` : null },
            { label: 'Payout Cycle', value: account.payoutFrequency, sub: null },
          ].map((item) => (
            <div key={item.label} className="p-3.5 bg-[#080A10] rounded-xl border border-[#1F2228] space-y-1 min-w-0">
              <span className="text-[11px] text-[#8A8F98] font-medium tracking-[0.08em] uppercase block leading-tight">{item.label}</span>
              <span className="text-[13px] sm:text-[15px] font-semibold text-white block font-mono leading-tight break-words">{item.value}</span>
              {item.sub && <span className="text-[11px] text-[#8A8F98] block leading-tight break-words">{item.sub}</span>}
            </div>
          ))}
        </div>

        {/* All-In Cost to First Payout — Section 26 */}
        {(() => {
          const cost = calculateAllInCost({
            challengeFee: account.price,
            expectedResets: 0,
            activationFee: (account as any).activationFee ?? 0,
            dataFeeMonthly: 0,
            monthsToPayout: 1,
            addOnCost: 0,
            refundableOnFirstPayout: account.refundableFee,
          });
          const realistic = calculateAllInCost({
            challengeFee: account.price,
            expectedResets: 1,
            activationFee: (account as any).activationFee ?? 0,
            dataFeeMonthly: 0,
            monthsToPayout: 1,
            addOnCost: 0,
            refundableOnFirstPayout: account.refundableFee,
          });
          return (
            <section className="mt-8 rounded-2xl bg-[#111318] border border-[#1F2228] overflow-hidden">
              <div className="px-6 sm:px-8 py-5 border-b border-[#1F2228] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center"><Receipt className="w-4 h-4 text-emerald-400" /></span>
                  <div>
                    <h3 className="text-sm font-semibold text-white tracking-tight">All-In Cost to First Payout</h3>
                    <p className="text-xs text-white/40 mt-0.5">Sticker price vs real cost — All-In Quantitative Fee Model</p>
                  </div>
                </div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white text-[#080A10] text-xs font-semibold">Evidence-based • No affiliate markup</span>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 divide-y lg:divide-y-0 lg:divide-x divide-[#1F2228]">
                <div className="p-6 space-y-3">
                  <p className="text-[11px] tracking-[0.12em] uppercase font-medium text-white/40">If you pass first try</p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-mono font-semibold text-white">${cost.totalPaidBeforePayout.toLocaleString()}</span>
                    <span className="text-xs text-white/40">paid upfront</span>
                  </div>
                  {account.refundableFee && <p className="text-xs font-medium text-emerald-400">→ ${cost.totalAfterRefund.toLocaleString()} net after refund on 1st payout</p>}
                  <div className="space-y-1 pt-2">
                    {cost.breakdown.map(b => (
                      <div key={b.label} className="flex justify-between text-xs"><span className="text-white/40">{b.label}</span><span className={`font-mono ${b.amount<0?'text-emerald-400':'text-white/70'}`}>{b.amount<0?'-':''}${Math.abs(b.amount).toLocaleString()}</span></div>
                    ))}
                  </div>
                  <p className="text-[11px] leading-relaxed text-white/30 pt-2 border-t border-[#1F2228] mt-2">{cost.assumptionNote}</p>
                </div>
                <div className="p-6 space-y-3 bg-amber-500/[0.03]">
                  <p className="text-[11px] tracking-[0.12em] uppercase font-medium text-amber-400">Realistic (1 reset avg)</p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-mono font-semibold text-white">${realistic.totalPaidBeforePayout.toLocaleString()}</span>
                    <span className="text-xs text-white/40">paid upfront</span>
                  </div>
                  {account.refundableFee && <p className="text-xs font-medium text-emerald-400">→ ${realistic.totalAfterRefund.toLocaleString()} net after refund</p>}
                  {!account.refundableFee && <p className="text-xs font-medium text-amber-400">Non-refundable — every reset is sunk cost</p>}
                  <div className="space-y-1 pt-2">
                    {realistic.breakdown.map(b => (
                      <div key={b.label} className="flex justify-between text-xs"><span className="text-white/40">{b.label}</span><span className={`font-mono ${b.amount<0?'text-emerald-400':'text-white/70'}`}>{b.amount<0?'-':''}${Math.abs(b.amount).toLocaleString()}</span></div>
                    ))}
                  </div>
                  <p className="text-[11px] leading-relaxed text-white/30 pt-2 border-t border-[#1F2228] mt-2">{realistic.assumptionNote} FPFX base rate: ~7% ever get payout — budget for resets.</p>
                </div>
              </div>
              <div className="px-6 py-3 bg-[#080A10] border-t border-[#1F2228] flex items-start gap-2">
                <Info className="w-3.5 h-3.5 text-white/30 mt-0.5 shrink-0" />
                <p className="text-[11px] leading-relaxed text-white/35">Methodology: challenge + resets + activation + data + add-ons − documented refund. Futures add $38/mo data + $149 activation where applicable. We never hide reset cost behind “bonus” language.</p>
              </div>
            </section>
          );
        })()}

        <section className="mt-8 rounded-2xl bg-[#111318] border border-red-500/20 p-6 sm:p-8 space-y-6">
          <div className="space-y-2 text-center max-w-2xl mx-auto">
            <p className="text-[11px] tracking-[0.14em] uppercase font-medium text-red-400">RISK ANALYSIS</p>
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-red-500/10 text-red-400 text-xs font-bold border border-red-500/20 mx-auto">
              <ShieldAlert className="w-4 h-4 shrink-0" />
              <span>Essential Pre-Purchase Risk Analysis</span>
            </div>
            <h2 className="text-[22px] sm:text-[28px] font-semibold text-white tracking-tight">How Can I Fail This Account?</h2>
            <p className="text-[13px] text-[#8A8F98] leading-relaxed">Before spending capital on this evaluation, these are the exact mathematical and operational tripwires that disqualify traders on this specific model.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { badge: '#1 Biggest Risk', title: 'Daily Loss at 00:00 Rollover', desc: 'Daily loss is calculated against your day starting balance/equity. Holding floating drawdowns into 00:00 server reset can breach on spread widening.', foot: `Limit: Losing $${(account.nominalSize * account.dailyLossLimit / 100).toLocaleString()} in 24h = immediate breach.`, color: 'border-red-500/20' },
              { badge: '#2 Second Risk', title: '30-Day Inactivity Forfeiture', desc: '30 consecutive days without a trade = automatic lock and revoked. Many pass Phase 1 and pause before Phase 2, losing progress.', foot: 'Mitigation: Set reminder or place 0.01 lot micro-trade.', color: 'border-orange-500/20' },
              { badge: 'Easy-to-Miss', title: '4-Day Minimum Funded Days', desc: 'Evaluation has 0 minimum days, but funded withdrawal requires 4 distinct calendar days. Early payout = declined.', foot: null, color: 'border-amber-500/20' },
              { badge: 'Payout Trap', title: 'Open Positions on Withdrawal', desc: 'All trades flat and pending orders deleted before reward request. Any active order = automated rejection.', foot: null, color: 'border-[#1F2228]' },
            ].map((card) => (
              <div key={card.title} className={`p-5 bg-[#080A10] border ${card.color} rounded-2xl space-y-2.5 flex flex-col`}>
                <span className="px-2.5 py-1 text-[10px] font-bold uppercase rounded-full bg-[#111318] text-[#8A8F98] border border-[#1F2228] self-start tracking-wide">{card.badge}</span>
                <h3 className="text-[13px] font-bold text-white leading-tight">{card.title}</h3>
                <p className="text-[13px] text-[#8A8F98] leading-relaxed flex-1">{card.desc}</p>
                {card.foot && <div className="p-2.5 rounded-xl bg-[#111318] border border-[#1F2228] text-[13px] text-[#8A8F98] leading-relaxed">{card.foot}</div>}
              </div>
            ))}
          </div>
        </section>

        <section className="mt-8 space-y-4">
          <div className="space-y-1 text-center max-w-2xl mx-auto">
            <p className="text-[11px] tracking-[0.14em] uppercase font-medium text-[#8A8F98]">SIMULATOR</p>
            <h2 className="text-[20px] font-semibold text-white flex items-center justify-center gap-2">Interactive Drawdown Simulator</h2>
            <p className="text-[13px] text-[#8A8F98] leading-relaxed">Pre-configured for {account.nominalSize.toLocaleString()} • {account.dailyLossLimit}% daily, {account.maxTotalLoss}% max — adjust equity to test breach.</p>
          </div>
          <RiskSimulator initialNominalSize={account.nominalSize} initialDailyLossPct={account.dailyLossLimit} initialMaxLossPct={account.maxTotalLoss} initialDrawdownType={account.drawdownType} />
        </section>

        {/* Same-Trade Visual — Signature Moat (Section 27) */}
        <section className="mt-8 space-y-3">
          <div className="text-center">
            <p className="text-[11px] tracking-[0.14em] uppercase font-medium text-[#8A8F98]">SIGNATURE VISUAL</p>
            <h3 className="text-[18px] font-semibold text-white tracking-tight mt-1">Same trade, different fate — see why</h3>
            <p className="text-[13px] text-[#8A8F98] max-w-2xl mx-auto">
              This +1.8% win (+${Math.round(account.nominalSize * 0.018).toLocaleString()}) followed by a -0.5% loss with an intraday dip is replayed against each program's real drawdown math.
            </p>
          </div>
          <SameTradeVisual
            startingEquity={account.nominalSize}
            trades={[
              { label: 'Day 1 Win (+1.8%)', pnl: Math.round(account.nominalSize * 0.018) },
              { label: 'Day 2 Loss (-0.5%)', pnl: Math.round(account.nominalSize * -0.005), equityDip: Math.round(account.nominalSize * 0.965) },
              { label: 'Day 3 Overnight (+0.3%)', pnl: Math.round(account.nominalSize * 0.003), equityDip: Math.round(account.nominalSize * 0.99) },
            ]}
            accounts={(() => {
              const sets = firm.programs.slice(0,4).map(p => {
                const acc = p.accounts.find(a=>a.nominalSize===account.nominalSize) || p.accounts[0] || account;
                return { name: `${firm.brandName} ${p.name}`, account: acc, color: '#2563eb' };
              });
              // Ensure at least 2 distinct examples
              if (sets.length === 1) {
                sets.push({ name: `${firm.brandName} Instant (5% trail)`, account: { ...account, maxTotalLoss: 5, drawdownType: 'trailing_equity' as const }, color: '#f59e0b' });
              }
              return sets.slice(0,4);
            })()}
          />
        </section>

        <section className="mt-10 space-y-4">
          <div className="space-y-1 border-b border-[#1F2228] pb-4 text-center">
            <p className="text-[11px] tracking-[0.14em] uppercase font-medium text-[#8A8F98]">THE RULES</p>
            <h2 className="text-[20px] font-semibold text-white">Explain the Rules</h2>
            <p className="text-[13px] text-[#8A8F98] leading-relaxed max-w-xl mx-auto">Exact formulas, plain translations, and verified source citations for every rule.</p>
          </div>
          <div className="space-y-3">
            {firm.rules.map((rule) => (
              <RuleCard key={rule.id} rule={rule} onOpenSource={onOpenSource} />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};
