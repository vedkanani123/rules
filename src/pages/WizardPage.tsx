import React, { useState } from 'react';
import { Sparkles, Check, ArrowRight, RefreshCw, Shield, Zap, Target } from 'lucide-react';
import { PROP_FIRMS_DATA } from '../data/propFirmsData.ts';

export const WizardPage: React.FC<{ onNavigate: (path: string) => void }> = ({ onNavigate }) => {
  const [step, setStep] = useState<number>(1);
  const [market, setMarket] = useState<string>('Forex');
  const [strategy, setStrategy] = useState<string>('Swing');
  const [capital, setCapital] = useState<number>(100000);
  const [priority, setPriority] = useState<string>('static_drawdown');
  const [calculated, setCalculated] = useState<boolean>(false);
  const steps = [{n:1,label:'Market'},{n:2,label:'Strategy'},{n:3,label:'Capital'},{n:4,label:'Priority'}];

  return (
    <div className="bg-[#080A10] min-h-screen">
      <div className="max-w-[960px] mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="text-center pt-10 sm:pt-14 pb-10 border-b border-[#1F2228]">
          <p className="text-[11px] tracking-[0.14em] uppercase font-medium text-[#8A8F98] mb-3">THE FINDER</p>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#111318] border border-[#1F2228] text-[11px] font-semibold tracking-wide uppercase text-[#8A8F98] mb-4">
            <Sparkles className="w-3 h-3" /> Strategy matcher
          </div>
          <h1 className="text-[30px] sm:text-[42px] font-semibold tracking-tight leading-[0.95] text-white">Find your<br /><span className="text-[#8A8F98]">best account</span></h1>
          <p className="text-[13px] leading-relaxed text-[#8A8F98] max-w-xl mx-auto mt-3">Answer 4 questions. We match you to verified rules — not affiliate rankings — and show the dollar math for your size.</p>
        </div>

        {!calculated ? (
          <div className="mt-8 rounded-2xl bg-[#111318] border border-[#1F2228] overflow-hidden">
            <div className="px-6 sm:px-8 py-5 border-b border-[#1F2228] flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                {steps.map((s,idx)=>(
                  <React.Fragment key={s.n}>
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-semibold border transition-colors ${step>=s.n ? 'bg-white text-[#080A10] border-white' : 'bg-[#080A10] text-[#8A8F98] border-[#1F2228]'}`}>
                      {step>s.n ? <Check className="w-4 h-4" /> : s.n}
                    </div>
                    {idx<3 && <div className={`w-6 sm:w-8 h-px ${step>s.n ? 'bg-white' : 'bg-[#1F2228]'}`} />}
                  </React.Fragment>
                ))}
              </div>
              <span className="text-[13px] font-medium text-[#8A8F98] hidden sm:block">Step {step} of 4 · {steps[step-1].label}</span>
            </div>

            <div className="p-6 sm:p-8">
              {step===1 && (
                <div className="space-y-5">
                  <div>
                    <p className="text-[11px] tracking-[0.12em] uppercase font-medium text-[#8A8F98]">Step 01 — Market</p>
                    <h2 className="text-[15px] font-semibold text-white mt-1">What do you trade most?</h2>
                    <p className="text-[13px] text-[#8A8F98] mt-1">We check news buffers, weekend holding and instrument coverage.</p>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {['Forex','Crypto','Indices (Nasdaq/US30)','Commodities (Gold)'].map(m=>(
                      <button key={m} onClick={()=>{setMarket(m); setStep(2);}} className={`p-4 rounded-2xl border text-left transition-colors ${market===m ? 'bg-white border-white text-[#080A10]' : 'bg-[#080A10] border-[#1F2228] text-white hover:border-[#2A2D35]'}`}>
                        <span className="text-[13px] font-medium block">{m}</span>
                        <span className={`text-xs mt-1 block ${market===m ? 'text-[#080A10]/50' : 'text-[#8A8F98]'}`}>{m==='Forex'?'Majors · minors · exotics': m==='Crypto'?'BTC · ETH · alts': m.includes('Indices')?'US30 · NAS100 · SPX':'XAU · XAG · Oil'}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {step===2 && (
                <div className="space-y-5">
                  <div>
                    <p className="text-[11px] tracking-[0.12em] uppercase font-medium text-[#8A8F98]">Step 02 — Style</p>
                    <h2 className="text-[15px] font-semibold text-white mt-1">How do you trade?</h2>
                    <p className="text-[13px] text-[#8A8F98] mt-1">We check consistency rule, EA policy and drawdown type.</p>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {[
                      {id:'Scalping',label:'Scalper',desc:'Many trades, tight stops'},
                      {id:'Swing',label:'Swing trader',desc:'Hold days, weekends'},
                      {id:'News',label:'News trader',desc:'Trade CPI / NFP / FOMC'},
                      {id:'EA',label:'EA / Algo',desc:'Automated on MT5'},
                      {id:'Manual',label:'Discretionary',desc:'Close before close'},
                    ].map(s=>(
                      <button key={s.id} onClick={()=>{setStrategy(s.id); setStep(3);}} className={`p-4 rounded-2xl border text-left transition-colors ${strategy===s.id ? 'bg-white border-white text-[#080A10]' : 'bg-[#080A10] border-[#1F2228] text-white hover:border-[#2A2D35]'}`}>
                        <span className="text-[13px] font-semibold block">{s.label}</span>
                        <span className={`text-xs mt-1 block ${strategy===s.id ? 'text-[#080A10]/50' : 'text-[#8A8F98]'}`}>{s.desc}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {step===3 && (
                <div className="space-y-5">
                  <div>
                    <p className="text-[11px] tracking-[0.12em] uppercase font-medium text-[#8A8F98]">Step 03 — Capital</p>
                    <h2 className="text-[15px] font-semibold text-white mt-1">Account size?</h2>
                    <p className="text-[13px] text-[#8A8F98] mt-1">We show exact dollar floors per size.</p>
                  </div>
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                    {[5000,10000,25000,50000,100000,200000].map(size=>(
                      <button key={size} onClick={()=>{setCapital(size); setStep(4);}} className={`py-4 rounded-2xl border font-mono font-semibold text-[13px] transition-colors ${capital===size ? 'bg-white border-white text-[#080A10]' : 'bg-[#080A10] border-[#1F2228] text-white hover:border-[#2A2D35]'}`}>
                        ${(size/1000).toFixed(0)}k
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {step===4 && (
                <div className="space-y-5">
                  <div>
                    <p className="text-[11px] tracking-[0.12em] uppercase font-medium text-[#8A8F98]">Step 04 — Priority</p>
                    <h2 className="text-[15px] font-semibold text-white mt-1">What matters most?</h2>
                    <p className="text-[13px] text-[#8A8F98] mt-1">This decides the match weight.</p>
                  </div>
                  <div className="grid grid-cols-1 gap-3">
                    {[
                      {id:'static_drawdown',label:'Static drawdown',desc:'Floor never trails up — safer for runners'},
                      {id:'fast_payout',label:'Fast payout',desc:'On-demand or bi-weekly, low minimum'},
                      {id:'weekend_holding',label:'Weekend holding',desc:'No forced Friday close'},
                      {id:'low_fee',label:'Lowest fee',desc:'Most capital per dollar'},
                      {id:'no_consistency',label:'No consistency rule',desc:'Big winners allowed'},
                    ].map(p=>(
                      <button key={p.id} onClick={()=>{setPriority(p.id); setCalculated(true);}} className={`p-4 rounded-2xl border text-left flex gap-3 transition-colors ${priority===p.id ? 'bg-white border-white text-[#080A10]' : 'bg-[#080A10] border-[#1F2228] text-white hover:border-[#2A2D35]'}`}>
                        <span className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${priority===p.id ? 'bg-[#080A10] text-white' : 'bg-[#111318] border border-[#1F2228] text-[#8A8F98]'}`}><Target className="w-4 h-4" /></span>
                        <span><span className="text-[13px] font-semibold block">{p.label}</span><span className={`text-[13px] block ${priority===p.id ? 'text-[#080A10]/50' : 'text-[#8A8F98]'}`}>{p.desc}</span></span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between mt-8 pt-6 border-t border-[#1F2228]">
                {step>1 ? <button onClick={()=>setStep(step-1)} className="px-4 py-2 rounded-full bg-[#080A10] border border-[#1F2228] text-[13px] font-medium text-[#8A8F98] hover:text-white min-h-[44px]">← Back</button> : <span />}
                <span className="text-[11px] text-[#8A8F98] hidden sm:block">Your picks: {market} · {strategy} · ${(capital/1000).toFixed(0)}k</span>
              </div>
            </div>
          </div>
        ) : (
          (() => {
            // Dynamic Multi-Firm Matcher Algorithm
            interface MatchResult {
              firm: typeof PROP_FIRMS_DATA[0];
              program: typeof PROP_FIRMS_DATA[0]['programs'][0];
              account: typeof PROP_FIRMS_DATA[0]['programs'][0]['accounts'][0];
              score: number;
              whyFit: string[];
              whyNotFit: string[];
            }

            const candidates: MatchResult[] = [];

            for (const f of PROP_FIRMS_DATA) {
              for (const p of f.programs) {
                const acc = p.accounts.find(a => a.nominalSize === capital) || p.accounts[0];
                if (!acc) continue;

                let score = 75;
                const whyFit: string[] = [];
                const whyNotFit: string[] = [];

                // 1. Market Alignment
                const handlesMarket = f.marketType === 'Multi-Asset' || 
                  (market === 'Forex' && (f.marketType === 'Forex' || acc.instruments?.includes('Forex'))) ||
                  (market === 'Futures' && f.marketType === 'Futures') ||
                  (market === 'Crypto' && acc.instruments?.includes('Crypto'));

                if (handlesMarket) {
                  score += 8;
                  whyFit.push(`Direct ${market} market execution with official instrument spreads`);
                } else if (f.marketType === 'Futures' && market === 'Forex') {
                  score -= 25;
                  whyNotFit.push(`Futures-specialized firm — currency trading limited to CME FX futures`);
                }

                // 2. Strategy Fit
                if (strategy === 'Swing') {
                  if (acc.weekendHolding) {
                    score += 10;
                    whyFit.push('Weekend & overnight holding permitted — positions can run without forced Friday liquidation');
                  } else {
                    score -= 20;
                    whyNotFit.push('Weekend holding prohibited — all trades must close before market session close');
                  }
                } else if (strategy === 'News') {
                  if (acc.newsTradingRule === 'Allowed') {
                    score += 10;
                    whyFit.push('Unrestricted news trading permitted during major economic releases');
                  } else {
                    score -= 15;
                    whyNotFit.push(acc.newsTradingDetail || 'Restricted news execution — 2-min buffer on high-impact events');
                  }
                } else if (strategy === 'EA') {
                  if (acc.eaAllowed) {
                    score += 8;
                    whyFit.push('Algorithmic trading & MT5 EAs fully allowed with individual trade logic');
                  } else {
                    score -= 25;
                    whyNotFit.push('Manual trading only — automated EAs and bots strictly barred');
                  }
                } else if (strategy === 'Scalping') {
                  score += 6;
                  whyFit.push('Fast tick execution with no minimum duration restrictions on closed orders');
                }

                // 3. Priority Weighting
                if (priority === 'static_drawdown') {
                  if (acc.drawdownType === 'static') {
                    score += 12;
                    whyFit.push(`Static floor at $${Math.round(capital * (1 - acc.maxTotalLoss / 100)).toLocaleString()} — floor never ratchets up when profits bank`);
                  } else {
                    score -= 14;
                    whyNotFit.push(`Trailing drawdown model (${acc.drawdownType.replace(/_/g, ' ')}) — floor trails peak equity/balance`);
                  }
                } else if (priority === 'fast_payout') {
                  if (acc.payoutFrequency.toLowerCase().includes('on-demand') || acc.payoutFrequency.toLowerCase().includes('bi-weekly') || acc.payoutFrequency.toLowerCase().includes('14')) {
                    score += 10;
                    whyFit.push(`Fast withdrawal cadence: ${acc.payoutFrequency} (${acc.firstPayoutConditions || 'profit unlock'})`);
                  }
                } else if (priority === 'no_consistency') {
                  if (!acc.consistencyRule || acc.consistencyRule === 'None') {
                    score += 10;
                    whyFit.push('No consistency rule — a single breakout winning day will not raise your profit target');
                  } else {
                    score -= 10;
                    whyNotFit.push(`Consistency policy active: ${acc.consistencyRule}`);
                  }
                } else if (priority === 'low_fee') {
                  if (acc.price < 500) {
                    score += 8;
                    whyFit.push(`Competitive entry cost: $${acc.discountedPrice || acc.price} registration fee${acc.refundableFee ? ' (refundable on 1st payout)' : ''}`);
                  }
                } else if (priority === 'weekend_holding') {
                  if (acc.weekendHolding) {
                    score += 10;
                    whyFit.push('Guaranteed weekend position retention across crypto and multi-day macro setups');
                  }
                }

                // Inactivity watch
                if (acc.inactivityLimitDays <= 30) {
                  whyNotFit.push(`${acc.inactivityLimitDays}-day inactivity lockout — account deactivated if zero trades placed`);
                }

                candidates.push({
                  firm: f,
                  program: p,
                  account: acc,
                  score: Math.max(50, Math.min(97, score)),
                  whyFit: whyFit.slice(0, 3),
                  whyNotFit: whyNotFit.slice(0, 3),
                });
              }
            }

            // Sort by match score descending
            candidates.sort((a, b) => b.score - a.score);
            const best = candidates[0] || {
              firm: PROP_FIRMS_DATA[0],
              program: PROP_FIRMS_DATA[0].programs[0],
              account: PROP_FIRMS_DATA[0].programs[0].accounts[0],
              score: 85,
              whyFit: ['Supported trading model with verified official sources'],
              whyNotFit: ['Always review official terms before purchasing'],
            };

            const runnerUp = candidates.find(c => c.firm.id !== best.firm.id);

            return (
              <div className="mt-8 rounded-2xl bg-[#111318] border border-[#1F2228] overflow-hidden">
                <div className="p-6 sm:p-8 border-b border-[#1F2228]">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div>
                      <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[11px] font-mono uppercase tracking-widest mb-2">
                        <Sparkles className="w-3 h-3" /> Best Algorithmic Match
                      </div>
                      <h2 className="text-[22px] sm:text-[28px] font-semibold tracking-tight text-white mt-1">
                        {best.firm.name} — {best.program.name} <span className="text-[#8A8F98]">${(capital/1000).toFixed(0)}k</span>
                      </h2>
                      <p className="text-[13px] text-[#8A8F98] mt-2">
                        Evaluated against {PROP_FIRMS_DATA.length} firms • Matched for <span className="font-medium text-white">{strategy}</span> · <span className="font-medium text-white">{market}</span> · Priority: <span className="font-medium text-white">{priority.replace(/_/g,' ')}</span>
                      </p>
                    </div>

                    <div className="shrink-0 px-5 py-4 rounded-2xl bg-white text-[#080A10] text-center min-w-[110px]">
                      <p className="text-[10px] tracking-[0.14em] uppercase font-bold text-[#080A10]/50">Match Score</p>
                      <p className="text-[28px] font-bold font-mono leading-none mt-1">{best.score}<span className="text-lg font-sans">%</span></p>
                      <p className="text-[10px] font-mono text-[#080A10]/60 mt-1 flex items-center justify-center gap-1"><Shield className="w-3 h-3" /> Verified Math</p>
                    </div>
                  </div>
                </div>

                <div className="p-6 sm:p-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <h3 className="text-[11px] tracking-[0.12em] uppercase font-semibold text-emerald-400 flex items-center gap-2">
                      <Zap className="w-3.5 h-3.5" /> Why this FITS your profile
                    </h3>
                    <div className="space-y-2.5">
                      {best.whyFit.map((t, i) => (
                        <div key={i} className="flex gap-2.5 p-3 rounded-xl bg-[#080A10] border border-emerald-500/15">
                          <span className="w-6 h-6 rounded-full bg-emerald-500/15 border border-emerald-500/20 flex items-center justify-center shrink-0 mt-0.5">
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                          </span>
                          <p className="text-[13px] leading-relaxed text-white/80">{t}</p>
                        </div>
                      ))}
                    </div>
                    <p className="text-[11px] text-white/30 leading-relaxed">Positive match factors derived deterministically from the firm's verified rule schema.</p>
                  </div>

                  <div className="space-y-3">
                    <h3 className="text-[11px] tracking-[0.12em] uppercase font-semibold text-amber-400 flex items-center gap-2">
                      <Shield className="w-4 h-4" /> Watchouts & Potential friction
                    </h3>
                    <div className="space-y-2.5">
                      {best.whyNotFit.map((t, i) => (
                        <div key={i} className="flex gap-2.5 p-3 rounded-xl bg-amber-500/[0.06] border border-amber-500/15">
                          <span className="w-6 h-6 rounded-full bg-amber-500/15 border border-amber-500/20 flex items-center justify-center shrink-0 mt-0.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                          </span>
                          <p className="text-[13px] leading-relaxed text-white/80">{t}</p>
                        </div>
                      ))}
                    </div>
                    <p className="text-[11px] text-amber-300/50 leading-relaxed">Negative recommendations are mandatory (§ 71) — we show potential rule hazards before you spend money.</p>
                  </div>
                </div>

                {runnerUp && (
                  <div className="mx-6 sm:mx-8 mb-6 p-4 rounded-xl bg-[#080A10] border border-[#1F2228] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div>
                      <span className="text-[10px] font-mono tracking-widest uppercase text-white/40">Alternative Option</span>
                      <p className="text-sm font-semibold text-white mt-0.5">{runnerUp.firm.name} — {runnerUp.program.name} ({runnerUp.score}% match)</p>
                      <p className="text-xs text-[#8A8F98] mt-0.5">{runnerUp.account.drawdownType.replace(/_/g, ' ')} drawdown • {runnerUp.account.dailyLossLimit}% daily • {runnerUp.account.maxTotalLoss}% max</p>
                    </div>
                    <button onClick={() => onNavigate(`/prop-firms/${runnerUp.firm.slug}`)} className="px-4 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.08] text-xs font-semibold text-white transition-colors shrink-0">
                      Compare Alternative →
                    </button>
                  </div>
                )}

                <div className="px-6 sm:px-8 pb-6 sm:pb-8 flex flex-col sm:flex-row gap-3">
                  <button onClick={() => onNavigate(`/prop-firms/${best.firm.slug}`)} className="flex-1 py-3.5 rounded-full bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-semibold text-[13px] transition-colors shadow-[0_4px_20px_rgba(37,99,235,0.3)] flex items-center justify-center gap-1.5">
                    Inspect {best.firm.name} Dossier <ArrowRight className="w-4 h-4" />
                  </button>
                  <button onClick={() => { setCalculated(false); setStep(1); }} className="px-6 py-3.5 rounded-full bg-[#080A10] border border-[#1F2228] text-white font-medium hover:bg-[#111318] flex items-center justify-center gap-1.5 text-[13px] transition-colors">
                    <RefreshCw className="w-4 h-4" /> Retake Matcher
                  </button>
                </div>
              </div>
            );
          })()
        )}
      </div>
    </div>
  );
};
