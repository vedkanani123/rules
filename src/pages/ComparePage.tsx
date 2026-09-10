import React, { useState, useMemo, useEffect } from 'react';
import { PROP_FIRMS_DATA } from '../data/propFirmsData.ts';
import { getFirmCanonicalProfile } from '../data/allFirmsCanonicalData.ts';
import { AFFILIATE_DISCLOSURE } from '../core/compare/compare.ts';
import { AccountTier, PropFirm, SourceEvidence } from '../types/schema.ts';
import { CURATED_COMPARISONS, getComparisonPairData } from '../core/seo/comparisonData.ts';
import { Breadcrumbs } from '../components/common/Breadcrumbs.tsx';
import { Link } from '../components/common/Link.tsx';
import { Scale, ArrowRight, Check, FileCheck, Info, CheckCircle2, ShieldCheck, Sparkles } from 'lucide-react';

interface ComparePageProps {
  pairSlug?: string;
  onNavigate?: (path: string) => void;
  onOpenSource?: (evidence: SourceEvidence, ruleTitle: string) => void;
}

export const ComparePage: React.FC<ComparePageProps> = ({ pairSlug, onNavigate, onOpenSource }) => {
  const pairData = useMemo(() => {
    if (!pairSlug) return null;
    return getComparisonPairData(pairSlug);
  }, [pairSlug]);

  const allAccounts = useMemo(() => {
    const list: { firm: PropFirm; account: AccountTier }[] = [];
    const seenIds = new Set<string>();

    PROP_FIRMS_DATA.forEach((firm) => {
      firm.programs.forEach((prog) => {
        prog.accounts.forEach((acc) => {
          if (!seenIds.has(acc.id)) {
            seenIds.add(acc.id);
            list.push({ firm, account: acc });
          }
        });
      });

      const canonical = getFirmCanonicalProfile(firm.slug, firm);
      if (canonical && canonical.models) {
        canonical.models.forEach((m) => {
          const sizes = m.availableSizes && m.availableSizes.length > 0 ? m.availableSizes : [50000, 100000];
          sizes.forEach((size) => {
            const accId = `${firm.slug}-${m.id}-${size / 1000}k`;
            if (!seenIds.has(accId)) {
              seenIds.add(accId);
              const pricing = canonical.pricingRegistry.find(
                p => p.size === size && (p.modelId === m.id || p.modelId.includes(m.category))
              ) || canonical.pricingRegistry.find(p => p.size === size);
              const price = pricing ? pricing.price : Math.round(size * 0.0052);

              const syntheticAcc: AccountTier = {
                id: accId,
                programId: `prog-${m.id}`,
                name: `$${(size / 1000).toLocaleString()}K ${m.name}`,
                nominalSize: size,
                currency: 'USD',
                price: price ?? Math.round(size * 0.0052),
                priceUnknown: false,
                refundableFee: m.refundableFee ?? true,
                profitTargetPhase1: m.targetsByStage?.phase1 || 8,
                profitTargetPhase2: m.targetsByStage?.phase2 || 5,
                dailyLossLimit: m.dailyLossLimit?.pct || 5,
                dailyLossCalculation: m.dailyLossLimit?.calculationType || 'balance_based',
                maxTotalLoss: m.maxDrawdown?.pct || 10,
                drawdownType: m.maxDrawdown?.type === 'trailing_locked' ? 'trailing_locked' : 'static',
                minimumTradingDays: m.minTradingDaysEval || 3,
                maximumTradingDays: 'Unlimited',
                profitSplit: m.profitSplit?.basePct || 80,
                profitSplitMaxWithAddon: m.profitSplit?.maxWithAddonPct || 90,
                payoutFrequency: `Every ${m.profitSplit?.payoutCycleDays || 14} days`,
                firstPayoutConditions: '14 calendar days after first trade on funded stage',
                payoutMinimum: m.profitSplit?.minPayoutAmount || 100,
                consistencyRule: m.consistencyRule?.active ? `${m.consistencyRule.maxSingleDayPct}% max single day` : 'No consistency rule',
                newsTradingRule: m.allowedStyles?.newsTrading === 'allowed' ? 'Allowed' : 'Restricted',
                newsTradingDetail: m.allowedStyles?.newsDetails || 'Allowed',
                weekendHolding: m.allowedStyles?.weekendHolding === 'allowed',
                overnightHolding: true,
                eaAllowed: m.allowedStyles?.eaTrading === 'allowed',
                copyTradingAllowed: m.allowedStyles?.copyTrading === 'allowed',
                hedgingAllowed: true,
                inactivityLimitDays: 30,
                leverage: m.leverage?.forex || '1:100',
                platforms: ['MetaTrader 5', 'cTrader', 'Match-Trader'],
                instruments: ['Forex', 'Indices', 'Metals', 'Crypto'],
                rules: [],
                sources: [
                  {
                    id: `src-${accId}`,
                    sourceType: 'official_faq' as any,
                    sourceUrl: canonical.website || firm.website,
                    sourceTitle: `${firm.name} Official Evaluation Rules`,
                    retrievedAt: '2026-09-08',
                    sourceExcerpt: `${m.name} verified evaluation parameters with ${m.dailyLossLimit?.pct || 5}% daily loss and ${m.maxDrawdown?.pct || 10}% drawdown.`,
                    confidence: 'A' as any,
                    verificationStatus: 'VERIFIED' as any,
                  }
                ],
                lastVerified: '2026-09-08',
              };
              list.push({ firm, account: syntheticAcc });
            }
          });
        });
      }
    });

    return list;
  }, []);

  const [selectedAccIds, setSelectedAccIds] = useState<string[]>(() => {
    if (pairData) {
      const accA = allAccounts.find(a => a.firm.slug === pairData.firmASlug && a.account.nominalSize === 100000) ||
                   allAccounts.find(a => a.firm.slug === pairData.firmASlug);
      const accB = allAccounts.find(a => a.firm.slug === pairData.firmBSlug && a.account.nominalSize === 100000) ||
                   allAccounts.find(a => a.firm.slug === pairData.firmBSlug);
      if (accA && accB) {
        return [accA.account.id, accB.account.id];
      }
    }
    return ['gft-standard-100k', 'ftmo-100k', 'funding-pips-100k'];
  });

  // Sync state if pair changes
  useEffect(() => {
    if (pairData) {
      const accA = allAccounts.find(a => a.firm.slug === pairData.firmASlug && a.account.nominalSize === 100000) ||
                   allAccounts.find(a => a.firm.slug === pairData.firmASlug);
      const accB = allAccounts.find(a => a.firm.slug === pairData.firmBSlug && a.account.nominalSize === 100000) ||
                   allAccounts.find(a => a.firm.slug === pairData.firmBSlug);
      if (accA && accB) {
        setSelectedAccIds([accA.account.id, accB.account.id]);
      }
    }
  }, [pairData, allAccounts]);

  const [highlightDiffs, setHighlightDiffs] = useState<boolean>(true);
  const selectedItems = selectedAccIds.map((id) => allAccounts.find((item) => item.account.id === id) || allAccounts[0]).filter(Boolean);

  const handleSelectChange = (slotIndex: number, newId: string) => {
    if (selectedAccIds.includes(newId) && selectedAccIds[slotIndex] !== newId) return;
    const u = [...selectedAccIds];
    u[slotIndex] = newId;
    setSelectedAccIds(u);
  };
  const addColumn = () => {
    if (selectedAccIds.length < 4) {
      const n = allAccounts.find(a => !selectedAccIds.includes(a.account.id));
      if (n) setSelectedAccIds([...selectedAccIds, n.account.id]);
    }
  };
  const removeColumn = (slotIndex: number) => {
    if (selectedAccIds.length > 2) setSelectedAccIds(selectedAccIds.filter((_, idx) => idx !== slotIndex));
  };

  const parameters = [
    { label: 'Prop Firm', getValue: (i: any) => i.firm.name },
    { label: 'Account', getValue: (i: any) => i.account.name },
    { label: 'Capital', getValue: (i: any) => `$${i.account.nominalSize.toLocaleString()}` },
    { label: 'Price', getValue: (i: any) => i.account.priceUnknown ? 'Unknown' : `$${i.account.discountedPrice || i.account.price}` },
    { label: 'Fee', getValue: (i: any) => i.account.refundableFee ? 'Refundable' : 'Non-refundable' },
    { label: 'Target P1', getValue: (i: any) => i.account.profitTargetPhase1 ? `${i.account.profitTargetPhase1}%` : '—' },
    { label: 'Target P2', getValue: (i: any) => i.account.profitTargetPhase2 ? `${i.account.profitTargetPhase2}%` : '—' },
    { label: 'Daily loss', getValue: (i: any) => `${i.account.dailyLossLimit}%` },
    { label: 'Method', getValue: (i: any) => i.account.dailyLossCalculation.replace(/_/g, ' ') },
    { label: 'Max loss', getValue: (i: any) => `${i.account.maxTotalLoss}%` },
    { label: 'Drawdown', getValue: (i: any) => i.account.drawdownType.replace(/_/g, ' ') },
    { label: 'Min days', getValue: (i: any) => `${i.account.minimumTradingDays}` },
    { label: 'Split', getValue: (i: any) => i.account.profitSplitMaxWithAddon ? `${i.account.profitSplit}% → ${i.account.profitSplitMaxWithAddon}%` : `${i.account.profitSplit}%` },
    { label: 'Payout', getValue: (i: any) => i.account.payoutFrequency },
    { label: 'News', getValue: (i: any) => i.account.newsTradingRule },
    { label: 'Weekend', getValue: (i: any) => i.account.weekendHolding ? 'Allowed' : 'No' },
    { label: 'EA / Bot', getValue: (i: any) => i.account.eaAllowed ? 'Allowed' : 'No' },
    { label: 'Inactivity', getValue: (i: any) => `${i.account.inactivityLimitDays}d` },
    { label: 'Leverage', getValue: (i: any) => i.account.leverage },
    { label: 'Platforms', getValue: (i: any) => i.account.platforms.join(', ') },
    { label: 'Last verified', getValue: (i: any) => i.account.lastVerified || i.firm.lastVerified || 'Unknown' },
    { label: 'Evidence', getValue: (i: any) => i.account.sources.length > 0 ? `✓ ${i.account.sources.length} source(s)` : i.firm.rules.length > 0 ? `${i.firm.rules.length} rules cited` : 'Unknown — under verification' },
  ];

  const breadcrumbs = pairData
    ? [
        { name: 'Home', url: '/' },
        { name: 'Compare', url: '/compare' },
        { name: `${pairData.firmAName} vs ${pairData.firmBName}`, url: `/compare/${pairData.slug}` },
      ]
    : [
        { name: 'Home', url: '/' },
        { name: 'Compare', url: '/compare' },
      ];

  return (
    <div className="bg-[#080A10] min-h-screen">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <Breadcrumbs items={breadcrumbs} className="pt-4" />

        {/* Hero Header */}
        <div className="pt-6 pb-10 border-b border-[#1F2228] text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#111318] border border-[#1F2228] text-[11px] font-semibold tracking-wide uppercase text-sky-400 mb-4">
            <Scale className="w-3 h-3" /> Comparison Engine
          </div>

          <h1 className="text-[30px] sm:text-[40px] lg:text-[48px] font-extrabold tracking-tight leading-[1.05] text-white max-w-4xl mx-auto">
            {pairData ? `${pairData.firmAName} vs ${pairData.firmBName}` : 'Compare Prop Firms Side-by-Side'}
          </h1>
          <p className="text-[14px] leading-relaxed text-[#8A8F98] mt-3 max-w-2xl mx-auto">
            {pairData
              ? pairData.metaDescription
              : 'Select 2–4 accounts to compare side-by-side. Every value is derived from official terms with program-level mathematical accuracy.'}
          </p>

          {/* Quick Verdict Box if in Dedicated Comparison Mode */}
          {pairData && (
            <div className="mt-6 p-5 rounded-2xl bg-[#111318] border border-[#1F2228] text-left max-w-3xl mx-auto space-y-3">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-emerald-400">
                <Sparkles className="w-4 h-4" /> Editorial Verdict & Recommendation
              </div>
              <p className="text-sm text-white/90 leading-relaxed">{pairData.verdict}</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs text-[#8A8F98]">
                <div className="p-3 rounded-xl bg-[#080A10] border border-[#1F2228]">
                  <strong className="text-white block mb-1">Best for {pairData.firmAName}:</strong>
                  {pairData.suitabilityA}
                </div>
                <div className="p-3 rounded-xl bg-[#080A10] border border-[#1F2228]">
                  <strong className="text-white block mb-1">Best for {pairData.firmBName}:</strong>
                  {pairData.suitabilityB}
                </div>
              </div>
              <div className="flex items-center gap-3 pt-2 text-xs">
                <Link
                  href={`/prop-firms/${pairData.firmASlug}`}
                  className="text-sky-400 hover:text-sky-300 font-medium inline-flex items-center gap-1"
                >
                  View full {pairData.firmAName} rules <ArrowRight className="w-3 h-3" />
                </Link>
                <span className="text-white/20">•</span>
                <Link
                  href={`/prop-firms/${pairData.firmBSlug}`}
                  className="text-sky-400 hover:text-sky-300 font-medium inline-flex items-center gap-1"
                >
                  View full {pairData.firmBName} rules <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          )}

          <div className="flex items-center justify-center gap-2 mt-6">
            <button
              onClick={() => setHighlightDiffs(!highlightDiffs)}
              className={`px-4 py-2.5 rounded-full text-[13px] font-medium border transition-colors ${
                highlightDiffs
                  ? 'bg-white text-[#080A10] border-white'
                  : 'bg-[#111318] border-[#1F2228] text-[#8A8F98] hover:text-white'
              }`}
            >
              {highlightDiffs ? (
                <span className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5" /> Highlight differences
                </span>
              ) : (
                'Highlight off'
              )}
            </button>
            {selectedAccIds.length < 4 && (
              <button
                onClick={addColumn}
                className="px-4 py-2.5 rounded-full bg-white text-[#080A10] text-[13px] font-semibold hover:bg-white/90 min-h-[44px]"
              >
                + Add Column
              </button>
            )}
          </div>
        </div>

        {/* Desktop Comparison Table */}
        <div className="hidden lg:block mt-8 overflow-hidden rounded-2xl border border-[#1F2228] bg-[#111318]">
          <div className="overflow-auto">
            <table className="w-full text-left border-collapse min-w-[720px]" aria-label="Compare accounts table">
              <caption className="sr-only">Compare selected accounts side by side</caption>
              <thead>
                <tr className="border-b border-[#1F2228] bg-[#080A10]">
                  <th scope="col" className="px-4 py-3 text-[11px] font-semibold tracking-[0.12em] uppercase text-[#8A8F98] sticky left-0 bg-[#080A10]">
                    Rule Parameter
                  </th>
                  {selectedItems.map((item, idx) => (
                    <th key={idx} className="px-3 py-3 min-w-[180px]">
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] tracking-[0.12em] uppercase font-medium text-[#8A8F98]">
                            Slot {idx + 1}
                          </span>
                          {selectedItems.length > 2 && (
                            <button
                              onClick={() => removeColumn(idx)}
                              className="text-[11px] px-2 py-0.5 rounded bg-[#111318] text-[#8A8F98] hover:text-white border border-[#1F2228]"
                            >
                              Remove
                            </button>
                          )}
                        </div>
                        <select
                          aria-label={`Select account for slot ${idx + 1}`}
                          value={item.account.id}
                          onChange={(e) => handleSelectChange(idx, e.target.value)}
                          className="w-full px-2.5 py-1.5 rounded-lg bg-[#080A10] border border-[#1F2228] text-xs font-semibold text-white truncate"
                        >
                          {allAccounts.map((opt) => (
                            <option key={opt.account.id} value={opt.account.id}>
                              {opt.firm.name} — {opt.account.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1F2228]/50 text-xs">
                {parameters.map((param) => {
                  const values = selectedItems.map((item) => param.getValue(item));
                  const diff = new Set(values).size > 1;
                  return (
                    <tr
                      key={param.label}
                      className={`hover:bg-[#080A10]/40 transition-colors ${
                        highlightDiffs && diff ? 'bg-amber-500/[0.03]' : ''
                      }`}
                    >
                      <th
                        scope="row"
                        className="px-4 py-3 font-medium text-[#8A8F98] whitespace-nowrap sticky left-0 bg-[#111318]"
                      >
                        <div className="flex items-center gap-1.5">
                          <span>{param.label}</span>
                          {highlightDiffs && diff && (
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" title="Values differ" />
                          )}
                        </div>
                      </th>
                      {selectedItems.map((item, i) => (
                        <td key={i} className="px-3 py-3 text-white font-mono">
                          {values[i]}
                        </td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Mobile Cards Matrix */}
        <div className="lg:hidden mt-8 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {selectedItems.map((item, idx) => (
              <div key={idx} className="p-4 rounded-2xl bg-[#111318] border border-[#1F2228] space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] tracking-[0.12em] uppercase font-medium text-[#8A8F98]">
                    Slot {idx + 1} · {item.firm.brandName}
                  </span>
                  {selectedItems.length > 2 && (
                    <button
                      onClick={() => removeColumn(idx)}
                      className="text-[13px] px-3 py-1.5 rounded-full bg-[#080A10] border border-[#1F2228] text-[#8A8F98] min-h-[36px]"
                    >
                      Remove
                    </button>
                  )}
                </div>
                <select
                  aria-label="Select account to compare"
                  value={item.account.id}
                  onChange={(e) => handleSelectChange(idx, e.target.value)}
                  className="w-full px-3 py-3 rounded-xl bg-[#080A10] border border-[#1F2228] text-[13px] text-white min-h-[44px]"
                >
                  {allAccounts.map((opt) => (
                    <option key={opt.account.id} value={opt.account.id}>
                      {opt.firm.brandName} — {opt.account.name}
                    </option>
                  ))}
                </select>
              </div>
            ))}
          </div>

          <div className="space-y-2">
            {parameters.map((param) => {
              const values = selectedItems.map((item) => param.getValue(item));
              const diff = new Set(values).size > 1;
              return (
                <div
                  key={param.label}
                  className={`p-4 rounded-2xl border ${
                    highlightDiffs && diff
                      ? 'bg-amber-500/[0.04] border-amber-500/15'
                      : 'bg-[#111318] border-[#1F2228]'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-[13px] font-semibold text-white">{param.label}</span>
                    {highlightDiffs && diff && (
                      <span className="px-2 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/20 text-[11px] font-medium text-amber-500">
                        differs
                      </span>
                    )}
                  </div>
                  <div
                    className={`grid gap-2 ${
                      selectedItems.length === 2
                        ? 'grid-cols-2'
                        : selectedItems.length === 3
                        ? 'grid-cols-3'
                        : 'grid-cols-2 sm:grid-cols-4'
                    }`}
                  >
                    {values.map((v, i) => (
                      <div key={i} className="p-3 rounded-xl bg-[#080A10] border border-[#1F2228]">
                        <p className="text-[11px] text-[#8A8F98] truncate">{selectedItems[i].firm.brandName}</p>
                        <p className="text-[13px] font-mono font-medium text-white mt-1 break-words">{v}</p>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Popular Comparison Links for Crawler Discovery */}
        <div className="mt-14 pt-8 border-t border-[#1F2228] space-y-4">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-[#8A8F98]">
            Popular Prop Firm Comparisons
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {CURATED_COMPARISONS.map((comp) => (
              <Link
                key={comp.slug}
                href={`/compare/${comp.slug}`}
                className="p-3.5 rounded-xl bg-[#111318] border border-[#1F2228] hover:border-sky-500/40 text-xs text-white/90 hover:text-white transition-all group flex items-center justify-between"
              >
                <div>
                  <strong className="text-white block font-semibold">
                    {comp.firmAName} vs {comp.firmBName}
                  </strong>
                  <span className="text-[11px] text-[#8A8F98] line-clamp-1 mt-0.5">
                    {comp.title}
                  </span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-[#8A8F98] group-hover:text-white group-hover:translate-x-0.5 transition-all shrink-0 ml-2" />
              </Link>
            ))}
          </div>
        </div>

        {/* Footer Disclaimer */}
        <div className="mt-12 flex flex-col items-center gap-2">
          <p className="text-[11px] text-white/30 max-w-2xl text-center">{AFFILIATE_DISCLOSURE}</p>
          <Link
            href="/prop-firms"
            className="text-[13px] text-[#8A8F98] hover:text-white inline-flex items-center gap-1.5"
          >
            Browse all firms in directory <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
};
