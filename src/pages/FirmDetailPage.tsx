import React, { useState, useMemo, useRef } from 'react';
import { PropFirm, SourceEvidence, AccountTier, ProgramModel } from '../types/schema.ts';
import { ReviewCard } from '../components/reviews/ReviewCard.tsx';
import { RiskSimulator } from '../components/simulator/RiskSimulator.tsx';
import { RulesAccordion } from '../components/rules/RulesAccordion.tsx';
import { RulesQuickView } from '../components/rules/RulesQuickView.tsx';
import { buildParameterRules } from '../core/pipeline/parameterRules.ts';
import {
  ExternalLink,
  Building,
  CheckCircle2,
  AlertTriangle,
  Layers,
  Scale,
  MessageSquareQuote,
  DollarSign,
  ArrowRight,
  Tag,
  Copy,
  Check,
  Sliders,
  Sparkles,
  ArrowLeft,
  ChevronDown,
  Zap,
  Info,
  Flame,
} from 'lucide-react';

interface FirmDetailPageProps {
  firm: PropFirm;
  onNavigate: (path: string) => void;
  onOpenSource: (evidence: SourceEvidence, ruleTitle: string) => void;
}

// Helper to format dollar
const fmt = (n: number) => `$${n.toLocaleString()}`;
const pctFmt = (pct: number, capital: number) => `${pct}% (${fmt((capital * pct) / 100)})`;

export const FirmDetailPage: React.FC<FirmDetailPageProps> = ({
  firm,
  onNavigate,
  onOpenSource,
}) => {
  // 1. Program State
  const [selectedProgramId, setSelectedProgramId] = useState<string>(
    firm.programs[0]?.id || ''
  );

  // Sync when navigating between firms (fix stale state)
  React.useEffect(() => {
    setSelectedProgramId(firm.programs[0]?.id || '');
    const firstCap = firm.programs[0]?.accounts[0]?.nominalSize || 100000;
    setSelectedCapital(firstCap);
  }, [firm.id]);

  const currentProgram: ProgramModel | undefined = useMemo(() => {
    return firm.programs.find((p) => p.id === selectedProgramId) || firm.programs[0];
  }, [firm.programs, selectedProgramId]);

  const isInstant = currentProgram?.programType === 'Instant';
  const is1Step = currentProgram?.programType === '1-Step';
  const is2Step = currentProgram?.programType === '2-Step';

  // 2. Available capital sizes for this program
  const availableSizes = useMemo(() => {
    const defaultSizes = [5000, 10000, 25000, 50000, 100000, 200000];
    if (!currentProgram?.accounts?.length) return defaultSizes;
    const existing = currentProgram.accounts.map((a) => a.nominalSize);
    return Array.from(new Set([...existing, ...defaultSizes].filter(s => s >= 5000))).sort((a, b) => a - b);
  }, [currentProgram]);

  const [selectedCapital, setSelectedCapital] = useState<number>(100000);

  // When program changes, reset capital to best matching size
  const handleSelectProgram = (id: string) => {
    setSelectedProgramId(id);
    const prog = firm.programs.find((p) => p.id === id);
    const sizes = prog?.accounts?.map((a) => a.nominalSize) || [];
    if (sizes.length > 0 && !sizes.includes(selectedCapital)) {
      // pick closest
      const closest = sizes.reduce((prev, curr) =>
        Math.abs(curr - selectedCapital) < Math.abs(prev - selectedCapital) ? curr : prev
      );
      setSelectedCapital(closest);
    }
  };

  // 3. Resolve account (exact match or derive)
  const currentAccount: AccountTier = useMemo(() => {
    const match = currentProgram?.accounts?.find((a) => a.nominalSize === selectedCapital);
    if (match) return match;

    // Derive from reference account in this program
    const ref = currentProgram?.accounts?.[0];
    const ratio = selectedCapital / (ref?.nominalSize || 100000);

    if (!ref) {
      // absolute fallback
      const dailyLoss = isInstant ? 3 : is1Step ? 3 : 4;
      const maxLoss = isInstant ? 5 : is1Step ? 6 : 8;
      return {
        id: `derived-${selectedCapital}`,
        programId: currentProgram?.id || '',
        name: `${fmt(selectedCapital)} ${currentProgram?.name}`,
        nominalSize: selectedCapital,
        currency: 'USD',
        price: Math.round(500 * ratio),
        refundableFee: !isInstant,
        profitTargetPhase1: isInstant ? undefined : is1Step ? 10 : 8,
        profitTargetPhase2: is2Step ? 5 : undefined,
        dailyLossLimit: dailyLoss,
        dailyLossCalculation: 'balance_based',
        maxTotalLoss: maxLoss,
        drawdownType: isInstant || is1Step ? 'trailing_equity' : 'static',
        minimumTradingDays: isInstant ? 3 : 0,
        maximumTradingDays: 'Unlimited',
        profitSplit: 80,
        profitSplitMaxWithAddon: 100,
        payoutFrequency: 'Bi-weekly (14 days)',
        firstPayoutConditions: isInstant ? '3 active days; profit buffer reached' : '4 active funded trading days',
        payoutMinimum: 100,
        newsTradingRule: 'Allowed',
        newsTradingDetail: 'News holding allowed; follow funded stage 2-minute buffer on red-folder events',
        weekendHolding: true,
        overnightHolding: true,
        eaAllowed: true,
        copyTradingAllowed: false,
        hedgingAllowed: true,
        inactivityLimitDays: 30,
        leverage: is1Step ? '1:50' : isInstant ? '1:30' : '1:100',
        platforms: firm.platforms || ['MetaTrader 5'],
        instruments: ['Forex', 'Indices', 'Crypto'],
        rules: firm.rules || [],
        sources: [],
        lastVerified: firm.lastVerified || '2026-08-28',
      };
    }

    return {
      ...ref,
      id: `derived-${selectedCapital}`,
      name: `${fmt(selectedCapital)} ${currentProgram?.name}`,
      nominalSize: selectedCapital,
      price: ref.priceUnknown ? ref.price : Math.round(ref.price * ratio),
      discountedPrice: ref.priceUnknown ? undefined : ref.discountedPrice ? Math.round(ref.discountedPrice * ratio) : undefined,
    };
  }, [currentProgram, selectedCapital, firm, isInstant, is1Step, is2Step]);

  // Display rules: clause-level dossier when available, otherwise honest
  // parameter-derived rules (INFERENCE evidence) — no firm page renders empty.
  const displayRules = useMemo(() => {
    if (firm.rules && firm.rules.length > 0) return firm.rules;
    try {
      return buildParameterRules(firm);
    } catch {
      return firm.rules;
    }
  }, [firm]);

  const [copiedPromo, setCopiedPromo] = useState<boolean>(false);
  const rulesTableRef = useRef<HTMLDivElement>(null);
  const [highlightedRule, setHighlightedRule] = useState<string | null>(null);

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedPromo(true);
    setTimeout(() => setCopiedPromo(false), 2000);
  };

  const scrollToRule = (slug: string) => {
    const rulesForLookup = firm.rules && firm.rules.length > 0 ? firm.rules : buildParameterRules(firm);
    const matchingRule = rulesForLookup?.find(r => 
      r.slug === slug || 
      r.slug.startsWith(slug) || 
      slug.startsWith(r.slug) ||
      r.category.toLowerCase().replace(/[^a-z0-9]/g, '-').includes(slug) ||
      slug.includes(r.category.toLowerCase().replace(/[^a-z0-9]/g, '-'))
    );
    const targetSlug = matchingRule ? matchingRule.slug : slug;
    setHighlightedRule(targetSlug);
    const el = document.getElementById(`rule-card-${targetSlug}`) || 
               document.getElementById(`rule-card-${slug}`) ||
               document.getElementById(targetSlug);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    } else {
      const section = document.getElementById('rules-section');
      if (section) section.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // 4. Build table rows based on program type
  // Each row: { label, sub, slug, isDifferent, cols }
  // cols = array of cell data for each column (eval cols + funded col)
  const tableRows = useMemo(() => {
    const capital = selectedCapital;
    const acc = currentAccount;

    if (isInstant) {
      // Instant: Only "Live Funded" column — no phases
      return [
        {
          label: 'Daily Drawdown Limit', sub: 'Max loss in 1 day (equity-based)',
          slug: 'daily-drawdown', isDifferent: false,
          funded: { val: pctFmt(acc.dailyLossLimit, capital), note: `Floor: ${fmt(capital - (capital * acc.dailyLossLimit / 100))} — equity-based, resets at 00:00`, color: 'text-sky-300' },
        },
        {
          label: 'Maximum Total Drawdown', sub: 'Absolute account breach ceiling',
          slug: 'max-drawdown', isDifferent: false,
          funded: { val: pctFmt(acc.maxTotalLoss, capital), note: `Floor: ${fmt(capital - (capital * acc.maxTotalLoss / 100))} (${acc.drawdownType.replace(/_/g, ' ')})`, color: 'text-white' },
        },
        {
          label: 'Minimum Active Trading Days', sub: 'Days before first payout request',
          slug: 'min-trading-days', isDifferent: false,
          funded: { val: `${acc.minimumTradingDays || 3} Active Trading Days`, note: 'Must place trades across this many separate calendar days before payout', color: 'text-amber-400' },
        },
        {
          label: 'Drawdown Calculation Method', sub: 'How loss is measured',
          slug: 'drawdown-type', isDifferent: false,
          funded: { val: acc.drawdownType.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()), note: 'Loss floor trails up as equity grows — permanently locking in gains', color: 'text-white' },
        },
        {
          label: 'News Trading Policy', sub: 'High-impact event restrictions',
          slug: 'news-trading', isDifferent: false,
          funded: { val: acc.newsTradingRule, note: acc.newsTradingDetail || 'Follow firm guidelines', color: acc.newsTradingRule === 'Restricted' ? 'text-red-400' : 'text-emerald-400' },
        },
        {
          label: 'EA & Algorithmic Trading', sub: 'Expert Advisors allowed?',
          slug: 'ea-trading', isDifferent: false,
          funded: { val: acc.eaAllowed ? 'Allowed' : 'Prohibited', note: acc.eaAllowed ? 'Unique strategy required; no shared IP copy clusters' : 'Manual trading only', color: acc.eaAllowed ? 'text-emerald-400' : 'text-red-400' },
        },
        {
          label: 'Weekend & Overnight Holding', sub: 'Can you hold positions over weekend?',
          slug: 'weekend-hold', isDifferent: false,
          funded: { val: acc.weekendHolding ? 'Allowed' : 'Prohibited', note: acc.weekendHolding ? 'No forced Friday close' : 'All positions must close before weekend', color: acc.weekendHolding ? 'text-emerald-400' : 'text-red-400' },
        },
        {
          label: 'Inactivity Limit', sub: 'Consecutive days without trading',
          slug: 'inactivity', isDifferent: false,
          funded: { val: `${acc.inactivityLimitDays || 30} Calendar Days`, note: 'Account locked and forfeited if no trade executed for this period', color: 'text-amber-300' },
        },
        {
          label: 'Profit Split', sub: 'Your share of trading profits',
          slug: 'profit-split', isDifferent: false,
          funded: { val: `${acc.profitSplit}% — ${acc.profitSplitMaxWithAddon || 100}%`, note: 'Base split scalable with profit split add-on', color: 'text-white' },
        },
        {
          label: 'Payout Schedule', sub: 'When can you request withdrawals?',
          slug: 'payout', isDifferent: false,
          funded: { val: acc.payoutFrequency, note: acc.firstPayoutConditions || '', color: 'text-white' },
        },
        {
          label: 'Registration Fee', sub: 'Refundable on funded account?',
          slug: 'fee-refund', isDifferent: false,
          funded: { val: acc.refundableFee ? '100% Refundable' : 'Non-Refundable', note: acc.refundableFee ? 'Fee returned with your first reward payout' : 'Instant account fee is a commitment cost', color: acc.refundableFee ? 'text-emerald-400' : 'text-red-400' },
        },
        {
          label: 'Leverage', sub: 'Maximum trading leverage',
          slug: 'leverage', isDifferent: false,
          funded: { val: acc.leverage || '1:30', note: 'Maximum available ratio', color: 'text-white' },
        },
      ];
    }

    if (is1Step) {
      return [
        {
          label: 'Profit Target', sub: 'Required profit to pass evaluation',
          slug: 'profit-target', isDifferent: false,
          phase1: { val: acc.profitTargetPhase1 ? pctFmt(acc.profitTargetPhase1, capital) : 'N/A', note: 'Must close all trades at target', color: 'text-white' },
          funded: { val: '✅ No Target', note: 'Withdraw 100% of profits whenever you like', color: 'text-emerald-400' },
        },
        {
          label: 'Daily Drawdown Limit', sub: 'Max loss in 1 day',
          slug: 'daily-drawdown', isDifferent: false,
          phase1: { val: pctFmt(acc.dailyLossLimit, capital), note: `Floor: ${fmt(capital - (capital * acc.dailyLossLimit / 100))} — equity-based`, color: 'text-sky-300' },
          funded: { val: pctFmt(acc.dailyLossLimit, capital), note: 'Resets at 00:00 server time', color: 'text-sky-300' },
        },
        {
          label: 'Maximum Total Drawdown', sub: 'Absolute account breach ceiling',
          slug: 'max-drawdown', isDifferent: false,
          phase1: { val: pctFmt(acc.maxTotalLoss, capital), note: `Floor: ${fmt(capital - (capital * acc.maxTotalLoss / 100))} (Trailing equity)`, color: 'text-white' },
          funded: { val: pctFmt(acc.maxTotalLoss, capital), note: 'Trailing floor locks profits permanently', color: 'text-white' },
        },
        {
          label: 'Minimum Trading Days', sub: 'Days needed to pass / to payout',
          slug: 'min-trading-days', isDifferent: true,
          phase1: { val: '0 Days (Pass in 1 day)', note: 'No minimum day requirement on evaluation', color: 'text-emerald-400' },
          funded: { val: '🚨 4 Active Trading Days', note: 'Required per payout cycle before first withdrawal', color: 'text-amber-400' },
        },
        {
          label: 'Consistency Rule', sub: '15% single-day / single-trade cap',
          slug: 'consistency', isDifferent: false,
          phase1: { val: acc.consistencyRule || '15% Consistency Rule', note: 'No single trade can be >15% of total required profit target', color: 'text-amber-300' },
          funded: { val: acc.consistencyRule || '15% Consistency Rule', note: 'Consistency checked before payout is approved', color: 'text-amber-300' },
        },
        {
          label: 'News Trading Policy', sub: 'High-impact event restrictions',
          slug: 'news-trading', isDifferent: true,
          phase1: { val: 'Restricted during spikes', note: acc.newsTradingDetail || 'Follow firm guidelines on volatility events', color: 'text-amber-400' },
          funded: { val: 'Restricted — 2-Min Buffer', note: 'No open/close within 2 minutes of red-folder events', color: 'text-red-400' },
        },
        {
          label: 'EA & Algorithmic Trading', sub: 'Expert Advisors allowed?',
          slug: 'ea-trading', isDifferent: false,
          phase1: { val: acc.eaAllowed ? 'Allowed' : 'Prohibited', note: 'Unique strategy only', color: acc.eaAllowed ? 'text-emerald-400' : 'text-red-400' },
          funded: { val: acc.eaAllowed ? 'Allowed' : 'Prohibited', note: 'No shared IP copy clusters', color: acc.eaAllowed ? 'text-emerald-400' : 'text-red-400' },
        },
        {
          label: 'Weekend & Overnight Holding', sub: 'Hold positions over weekend?',
          slug: 'weekend-hold', isDifferent: false,
          phase1: { val: acc.weekendHolding ? 'Allowed' : 'Prohibited', note: '', color: acc.weekendHolding ? 'text-emerald-400' : 'text-red-400' },
          funded: { val: acc.weekendHolding ? 'Allowed (No force-close)' : 'Prohibited', note: '', color: acc.weekendHolding ? 'text-emerald-400' : 'text-red-400' },
        },
        {
          label: 'Inactivity Limit', sub: 'Consecutive days without trading',
          slug: 'inactivity', isDifferent: false,
          phase1: { val: `${acc.inactivityLimitDays || 30} Calendar Days`, note: 'Account locked if idle this long', color: 'text-amber-300' },
          funded: { val: `${acc.inactivityLimitDays || 30} Calendar Days`, note: 'Applies continuously on funded stage', color: 'text-amber-300' },
        },
        {
          label: 'Profit Split', sub: 'Your share of profits',
          slug: 'profit-split', isDifferent: false,
          phase1: { val: 'N/A (Evaluation)', note: '', color: 'text-white/60' },
          funded: { val: `${acc.profitSplit}% — ${acc.profitSplitMaxWithAddon || 100}%`, note: 'Scalable with add-on', color: 'text-white' },
        },
        {
          label: 'Payout Schedule', sub: 'Withdrawal frequency',
          slug: 'payout', isDifferent: false,
          phase1: { val: 'N/A', note: '', color: 'text-white/60' },
          funded: { val: acc.payoutFrequency, note: acc.firstPayoutConditions || '', color: 'text-white' },
        },
        {
          label: 'Registration Fee', sub: 'Refundable?',
          slug: 'fee-refund', isDifferent: false,
          phase1: { val: `${acc.priceUnknown ? 'Unknown' : fmt(acc.discountedPrice || acc.price)} Paid Upfront`, note: 'One-time payment', color: 'text-white/70' },
          funded: { val: acc.refundableFee ? '100% Refunded on 1st Payout' : 'Non-refundable', note: '', color: acc.refundableFee ? 'text-emerald-400' : 'text-red-400' },
        },
        {
          label: 'Leverage', sub: 'Max trading leverage',
          slug: 'leverage', isDifferent: false,
          phase1: { val: acc.leverage || '1:50', note: '', color: 'text-white' },
          funded: { val: acc.leverage || '1:50', note: '', color: 'text-white' },
        },
      ];
    }

    // 2-Step (default)
    return [
      {
        label: 'Profit Target', sub: 'Required profit to advance',
        slug: 'profit-target', isDifferent: false,
        phase1: { val: acc.profitTargetPhase1 ? pctFmt(acc.profitTargetPhase1, capital) : 'N/A', note: 'Close all trades to confirm target', color: 'text-white' },
        phase2: { val: acc.profitTargetPhase2 ? pctFmt(acc.profitTargetPhase2, capital) : 'N/A', note: 'Lower target for verification', color: 'text-white/70' },
        funded: { val: '✅ No Target', note: 'Withdraw 100% of profits freely', color: 'text-emerald-400' },
      },
      {
        label: 'Daily Drawdown Limit', sub: 'Max loss in 1 day (balance-based)',
        slug: 'daily-drawdown', isDifferent: false,
        phase1: { val: pctFmt(acc.dailyLossLimit, capital), note: `Floor: ${fmt(capital - (capital * acc.dailyLossLimit / 100))}`, color: 'text-sky-300' },
        phase2: { val: pctFmt(acc.dailyLossLimit, capital), note: `Floor: ${fmt(capital - (capital * acc.dailyLossLimit / 100))}`, color: 'text-sky-300' },
        funded: { val: pctFmt(acc.dailyLossLimit, capital), note: 'Resets daily at 00:00 server time', color: 'text-sky-300' },
      },
      {
        label: 'Maximum Total Drawdown', sub: 'Account breach ceiling',
        slug: 'max-drawdown', isDifferent: false,
        phase1: { val: pctFmt(acc.maxTotalLoss, capital), note: `Floor: ${fmt(capital - (capital * acc.maxTotalLoss / 100))}`, color: 'text-white' },
        phase2: { val: pctFmt(acc.maxTotalLoss, capital), note: `Floor: ${fmt(capital - (capital * acc.maxTotalLoss / 100))}`, color: 'text-white' },
        funded: { val: pctFmt(acc.maxTotalLoss, capital), note: `Static floor: ${fmt(capital - (capital * acc.maxTotalLoss / 100))} — never trails`, color: 'text-white' },
      },
      {
        label: 'Minimum Trading Days', sub: 'Days to pass eval / per payout cycle',
        slug: 'min-trading-days', isDifferent: true,
        phase1: { val: '0 Days ✅', note: 'Pass in 1 day if target hit', color: 'text-emerald-400' },
        phase2: { val: '0 Days ✅', note: 'Pass in 1 day if target hit', color: 'text-emerald-400' },
        funded: { val: '🚨 4 Active Trading Days', note: 'Required per payout cycle — easy to miss!', color: 'text-amber-400' },
      },
      {
        label: 'News Trading Policy', sub: 'High-impact event rules',
        slug: 'news-trading', isDifferent: true,
        phase1: { val: '✅ Allowed', note: 'No buffer restrictions on evaluation', color: 'text-emerald-400' },
        phase2: { val: '✅ Allowed', note: 'No buffer restrictions on verification', color: 'text-emerald-400' },
        funded: { val: '🚨 2-Minute Buffer', note: 'Holding OK; NO open/close 2 min before/after red-folder events', color: 'text-amber-400' },
      },
      {
        label: 'EA & Algorithmic Trading', sub: 'Expert Advisors policy',
        slug: 'ea-trading', isDifferent: false,
        phase1: { val: acc.eaAllowed ? '✅ Allowed' : 'Prohibited', note: '', color: acc.eaAllowed ? 'text-emerald-400' : 'text-red-400' },
        phase2: { val: acc.eaAllowed ? '✅ Allowed' : 'Prohibited', note: '', color: acc.eaAllowed ? 'text-emerald-400' : 'text-red-400' },
        funded: { val: acc.eaAllowed ? 'Allowed (Unique Strategy)' : 'Prohibited', note: 'No shared IP copy signal clusters', color: acc.eaAllowed ? 'text-emerald-400' : 'text-red-400' },
      },
      {
        label: 'Weekend & Overnight Holding', sub: 'Hold positions over weekend?',
        slug: 'weekend-hold', isDifferent: false,
        phase1: { val: acc.weekendHolding ? '✅ Allowed' : 'Prohibited', note: '', color: acc.weekendHolding ? 'text-emerald-400' : 'text-red-400' },
        phase2: { val: acc.weekendHolding ? '✅ Allowed' : 'Prohibited', note: '', color: acc.weekendHolding ? 'text-emerald-400' : 'text-red-400' },
        funded: { val: acc.weekendHolding ? 'Allowed (No Friday force-close)' : 'Prohibited', note: '', color: acc.weekendHolding ? 'text-emerald-400' : 'text-red-400' },
      },
      {
        label: 'Inactivity Limit', sub: 'Max consecutive idle days',
        slug: 'inactivity', isDifferent: false,
        phase1: { val: `${acc.inactivityLimitDays || 30} Calendar Days`, note: '', color: 'text-amber-300' },
        phase2: { val: `${acc.inactivityLimitDays || 30} Calendar Days`, note: '', color: 'text-amber-300' },
        funded: { val: `${acc.inactivityLimitDays || 30} Calendar Days`, note: 'Account forfeited if idle this long', color: 'text-amber-300' },
      },
      {
        label: 'Profit Split', sub: 'Your share of gains',
        slug: 'profit-split', isDifferent: false,
        phase1: { val: 'N/A', note: '', color: 'text-white/60' },
        phase2: { val: 'N/A', note: '', color: 'text-white/60' },
        funded: { val: `${acc.profitSplit}% — ${acc.profitSplitMaxWithAddon || 100}%`, note: 'Scalable via profit split add-on', color: 'text-white' },
      },
      {
        label: 'Payout Schedule', sub: 'When can you withdraw?',
        slug: 'payout', isDifferent: false,
        phase1: { val: 'N/A', note: '', color: 'text-white/60' },
        phase2: { val: 'N/A', note: '', color: 'text-white/60' },
        funded: { val: acc.payoutFrequency, note: acc.firstPayoutConditions || '', color: 'text-white' },
      },
      {
        label: 'Registration Fee', sub: 'Paid upfront / refundable?',
        slug: 'fee-refund', isDifferent: false,
        phase1: { val: `${acc.priceUnknown ? 'Unknown' : fmt(acc.discountedPrice || acc.price)} Upfront`, note: 'One-time challenge payment', color: 'text-white/70' },
        phase2: { val: '$0 — Free Phase 2', note: 'Phase 2 has zero additional cost', color: 'text-emerald-400' },
        funded: { val: acc.refundableFee ? '100% Refunded on 1st Payout' : 'Non-refundable', note: '', color: acc.refundableFee ? 'text-emerald-400' : 'text-red-400' },
      },
      {
        label: 'Leverage', sub: 'Max ratio available',
        slug: 'leverage', isDifferent: false,
        phase1: { val: acc.leverage || '1:100', note: '', color: 'text-white' },
        phase2: { val: acc.leverage || '1:100', note: '', color: 'text-white' },
        funded: { val: acc.leverage || '1:100', note: '', color: 'text-white' },
      },
      ...(acc.consistencyRule && acc.consistencyRule !== 'None' && acc.consistencyRule !== 'None on Standard evaluation' ? [{
        label: 'Consistency Rule', sub: 'Max % from single day/trade',
        slug: 'consistency', isDifferent: false,
        phase1: { val: acc.consistencyRule, note: 'Checked before payout approval', color: 'text-amber-300' },
        phase2: { val: acc.consistencyRule, note: '', color: 'text-amber-300' },
        funded: { val: acc.consistencyRule, note: 'Must satisfy consistency check for every reward request', color: 'text-amber-300' },
      }] : []),
    ];
  }, [currentAccount, selectedCapital, isInstant, is1Step, is2Step]);

  // Columns header config
  const columnConfig = useMemo(() => {
    if (isInstant) {
      return [{ key: 'funded', label: '🚀 Live Funded Account', sub: 'Start trading immediately', class: 'bg-emerald-950/20 text-emerald-400 border-l border-emerald-900/30' }];
    }
    if (is1Step) {
      return [
        { key: 'phase1', label: 'Phase 1 (Evaluation)', sub: 'Single challenge phase', class: '' },
        { key: 'funded', label: '🚀 Funded Stage', sub: 'Live rewards begin', class: 'bg-emerald-950/20 text-emerald-400 border-l border-emerald-900/30' },
      ];
    }
    return [
      { key: 'phase1', label: 'Phase 1 (Evaluation)', sub: 'First challenge step', class: '' },
      { key: 'phase2', label: 'Phase 2 (Verification)', sub: 'Second challenge step', class: '' },
      { key: 'funded', label: '🚀 Funded Stage', sub: 'Live rewards begin', class: 'bg-emerald-950/20 text-emerald-400 border-l border-emerald-900/30' },
    ];
  }, [isInstant, is1Step]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 sm:space-y-12 pb-12 sm:pb-20 overflow-x-hidden">
      <div>
        <button
          onClick={() => onNavigate('/prop-firms')}
          className="inline-flex items-center gap-1.5 text-xs sm:text-sm text-white/50 hover:text-white transition-colors min-h-[44px] px-2 -mx-2 rounded-xl focus-visible:ring-2 focus-visible:ring-brand-500"
        >
          <ArrowLeft className="w-4 h-4 shrink-0" />
          <span>Back to All Prop Firms</span>
        </button>
      </div>
      {firm.slug === 'goat-funded-trader' && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-950/40 via-indigo-950/30 to-blue-950/40 border border-blue-500/30 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-blue-200 shadow-xl">
          <div className="flex items-center gap-2.5">
            <Sparkles className="w-5 h-5 text-blue-400 shrink-0" />
            <div>
              <strong className="text-white block sm:inline">Official Rules &amp; Intelligence Hub is active: </strong>
              <span className="text-blue-200/80">You are viewing the legacy standard directory profile. The comprehensive live intelligence hub with all 13 models, evidence audit, and 4-model comparison is live.</span>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => onNavigate('/prop-firms/goat-funded-trader')}
              className="px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition-colors shadow-sm cursor-pointer"
            >
              Open Rules Hub
            </button>
            <button
              onClick={() => onNavigate('/demo')}
              className="px-3.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white font-semibold text-xs transition-colors cursor-pointer"
            >
              Open Visual Matrix
            </button>
          </div>
        </div>
      )}

      <section className="p-4 sm:p-6 bg-[#111318] border border-[#1F2228] rounded-xl space-y-5 sm:space-y-6 overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6 border-b border-[#1F2228] pb-6">
          <div className="flex items-start gap-3 sm:gap-4 min-w-0">
            <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl bg-white border border-[#1F2228] flex items-center justify-center overflow-hidden shadow-sm shrink-0 p-1.5">
              <img
                src={(firm as any).logoUrl || firm.countryFlag}
                alt={firm.name}
                className="w-full h-full object-contain"
                loading="lazy"
                onError={(e) => {
                  const el = e.currentTarget as HTMLImageElement;
                  el.onerror = null;
                  el.src = firm.countryFlag;
                }}
              />
            </div>
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-semibold text-white tracking-tight leading-tight text-balance">
                  {firm.name}
                </h1>
                <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Verified Grade {firm.confidenceRating}
                </span>
                <span className="px-2 py-0.5 text-xs font-semibold rounded bg-white/[0.06] text-white/70 border border-white/[0.08]">
                  {firm.status}
                </span>
                {firm.marketType && (
                  <span className="px-2 py-0.5 text-xs font-semibold rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                    {firm.marketType}
                  </span>
                )}
              </div>

              <p className="text-xs sm:text-sm text-white/50 leading-relaxed">
                Founded {firm.foundedYear} • CEO: <strong className="text-white">{firm.ceoName}</strong> • HQ: {firm.headquarters}
              </p>

              {firm.tagline && (
                <p className="text-sm sm:text-base text-white/70 max-w-xl leading-relaxed">{firm.tagline}</p>
              )}

              <div className="flex flex-wrap items-center gap-3 pt-1 text-xs">
                <a href={firm.website} target="_blank" rel="noopener noreferrer"
                  className="text-white hover:text-brand-300 flex items-center gap-1 underline font-medium">
                  <span>Official Website</span><ExternalLink className="w-3.5 h-3.5" />
                </a>
                {firm.helpCenterUrl && (
                  <>
                    <span className="text-slate-600">•</span>
                    <a href={firm.helpCenterUrl} target="_blank" rel="noopener noreferrer"
                      className="text-blue-400 hover:text-blue-300 flex items-center gap-1 underline font-medium">
                      <span>Help Center</span><ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </>
                )}
                <span className="text-slate-600">•</span>
                <span className="text-white/60">Last verified: {firm.lastVerified}</span>
              </div>
            </div>
          </div>

          <div className="space-y-2.5 shrink-0 w-full lg:max-w-xs">
            {firm.activePromo && (
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between gap-3">
                <div>
                  <span className="text-[10px] uppercase font-bold text-amber-400 block">
                    Active Promo ({firm.activePromo.discount})
                  </span>
                  <span className="text-xs text-white font-mono font-bold">
                    {firm.activePromo.code}
                  </span>
                </div>
                <button
                  onClick={() => handleCopyCode(firm.activePromo!.code)}
                  className="px-2.5 py-1 text-xs font-mono font-bold rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 flex items-center gap-1 transition-colors"
                >
                  {copiedPromo ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedPromo ? 'Copied!' : 'Copy'}</span>
                </button>
              </div>
            )}
            {firm.payoutGuarantee && (
              <div className="p-2.5 rounded-xl bg-emerald-950/40 border border-emerald-800/50 text-[11px] text-emerald-300">
                <strong className="text-emerald-400 block text-[10px] uppercase mb-0.5">Payout Guarantee:</strong>
                {firm.payoutGuarantee}
              </div>
            )}
            {firm.totalPayoutsReported && (
              <div className="p-2.5 rounded-xl bg-[#080A10] border border-white/[0.06] text-[11px] text-white/70 flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-white shrink-0" />
                <span><strong className="text-white">{firm.totalPayoutsReported}</strong> total payouts reported</span>
              </div>
            )}
          </div>
        </div>

        {/* Legal Entities */}
        {firm.legalEntities && firm.legalEntities.length > 0 && (
          <div className="space-y-2">
            <span className="text-xs font-bold text-white/50 uppercase tracking-wider flex items-center gap-1.5">
              <Building className="w-3.5 h-3.5 text-white" />
              Verified Corporate Legal Entities
            </span>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              {firm.legalEntities.map((entity, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-[#080A10] border border-white/[0.06] space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-white">{entity.name}</span>
                    <span className="font-mono text-[10px] text-white/50">{entity.jurisdiction}</span>
                  </div>
                  <p className="text-white/50 text-[11px]">
                    Reg: <span className="font-mono text-white">{entity.companyNumber}</span> • {entity.role}
                  </p>
                  <p className="text-white/60 text-[10px] truncate">{entity.registeredAddress}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="space-y-3 pt-1">
          <div className="flex flex-col xs:flex-row xs:items-center justify-between gap-1 text-xs">
            <span className="font-bold text-white/50 uppercase tracking-wider text-xs">
              Intelligence Scorecard ({firm.scorecard.overallScore}/100)
            </span>
            <span className="text-white/60 text-xs hidden sm:inline">Formula-derived from verified rules</span>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 sm:gap-3">
            {[
              { label: 'Risk Balance', score: firm.scorecard.riskScore },
              { label: 'Payout Freedom', score: firm.scorecard.payoutScore },
              { label: 'Trading Freedom', score: firm.scorecard.tradingFreedomScore },
              { label: 'Simplicity', score: firm.scorecard.ruleComplexityScore },
              { label: 'Transparency', score: firm.scorecard.transparencyScore },
              { label: 'Trader XP', score: firm.scorecard.traderExperienceScore },
            ].map((pillar) => (
              <div key={pillar.label} className="p-2.5 bg-[#080A10] border border-white/[0.06] rounded-xl text-center space-y-0.5">
                <span className="text-[10px] uppercase font-bold text-white/60 block">{pillar.label}</span>
                <span className={`text-lg font-semibold font-mono block ${
                  pillar.score >= 80 ? 'text-emerald-400' : pillar.score >= 65 ? 'text-amber-400' : 'text-red-400'
                }`}>
                  {pillar.score}<span className="text-[10px] text-white/60 font-normal">/100</span>
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="space-y-4 sm:space-y-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full bg-white/10 text-white text-xs font-semibold border border-white/[0.06]">
            <Layers className="w-3.5 h-3.5 shrink-0" />
            <span className="hidden sm:inline">All Evaluation Programs Offered by {firm.name}</span><span className="sm:hidden">Evaluation Programs</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-semibold text-white tracking-tight text-balance">
            Choose Evaluation Model
          </h2>
          <p className="text-xs sm:text-sm text-white/50 leading-relaxed">
            Click any program to load its complete rules table below. Each model has different phase structures and restrictions.
          </p>
        </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
          {firm.programs.map((prog) => {
            const selected = prog.id === currentProgram?.id;
            const progIsInstant = prog.programType === 'Instant';
            return (
              <div
                key={prog.id}
                onClick={() => handleSelectProgram(prog.id)}
                className={`p-4 rounded-xl border cursor-pointer transition-all space-y-3 ${
                  selected
                    ? 'bg-[#111318] border-white/20 shadow-[0_0_0_1px_rgba(255,255,255,0.08)]'
                    : 'bg-[#111318] border-[#1F2228] hover:border-[#2A2D35] hover:bg-[#16181E]'
                }`}
              >
                <div className="flex justify-between items-start">
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border font-mono ${
                    selected
                      ? 'bg-white text-[#080A10] border-white'
                      : progIsInstant
                      ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                      : 'bg-[#080A10] text-[#9CA3AF] border-[#1F2228]'
                  }`}>
                    {prog.programType}
                  </span>
                  {selected ? <span className="w-5 h-5 rounded-full bg-white flex items-center justify-center"><Check className="w-3 h-3 text-[#080A10]" /></span> : <span className="w-5 h-5 rounded-full bg-[#080A10] border border-[#1F2228]" />}
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-white">{prog.name}</h3>
                  <p className="text-xs mt-1 leading-relaxed line-clamp-2 text-[#9CA3AF]">{prog.description}</p>
                </div>
                <div className="pt-2 border-t border-[#1F2228] flex items-center justify-between text-[11px] text-[#9CA3AF] font-mono">
                  {progIsInstant ? (
                    <span className="text-amber-400 font-semibold flex items-center gap-1">
                      <Zap className="w-3 h-3" /> No Evaluation
                    </span>
                  ) : (
                    <span>{prog.stagesCount} Step{prog.stagesCount !== 1 ? 's' : ''}</span>
                  )}
                  <ArrowRight className="w-3.5 h-3.5 text-[#6B7280]" />
                </div>
              </div>
            );
          })}
        </div>

        <div className="p-4 sm:p-5 bg-[#111318] border border-[#1F2228] rounded-xl space-y-4 overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#1F2228] pb-3">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#9CA3AF] block font-mono">
                Account Capital — {currentProgram?.name}
              </span>
              <p className="text-[11px] text-[#6B7280] mt-0.5">
                Dollar thresholds auto-update to your selection.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-[#6B7280] font-mono">Selected:</span>
              <span className="font-mono font-semibold text-white text-lg bg-[#080A10] px-3 py-1 rounded-lg border border-[#1F2228]">
                {fmt(selectedCapital)}
              </span>
            </div>
          </div>

          <div className="flex gap-2 overflow-x-auto scrollbar-hide snap-x -mx-4 px-4 sm:mx-0 sm:px-0 sm:grid sm:grid-cols-6 sm:overflow-visible pb-2 sm:pb-0">
            {availableSizes.map((size) => {
              const sel = size === selectedCapital;
              return (
                <button
                  key={size}
                  onClick={() => setSelectedCapital(size)}
                  className={`shrink-0 snap-start sm:shrink py-3 px-3 sm:px-2 rounded-lg text-center transition-all relative min-h-[56px] min-w-[72px] sm:min-w-0 border font-mono ${
                    sel
                      ? 'bg-white text-[#080A10] font-bold border-white shadow-sm'
                      : 'bg-[#080A10] text-[#9CA3AF] hover:text-white border-[#1F2228] hover:border-[#2A2D35] hover:bg-[#16181E] font-medium'
                  }`}
                >
                  <span className="text-sm block">${(size / 1000).toFixed(0)}K</span>
                  <span className="text-[10px] opacity-60 block hidden sm:block">Capital</span>
                </button>
              );
            })}
          </div>

          <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-3 sm:gap-4 pt-3 border-t border-[#1F2228] text-xs font-mono">
            <div>
              <span className="text-[#6B7280] block text-[10px] uppercase">Challenge Fee</span>
              <span className="font-semibold text-white text-sm">
                {currentAccount.priceUnknown ? 'Unknown' : fmt(currentAccount.discountedPrice || currentAccount.price)}
              </span>
              {currentAccount.discountedPrice && !currentAccount.priceUnknown && (
                <span className="text-[10px] text-[#6B7280] line-through ml-1.5">
                  {fmt(currentAccount.price)}
                </span>
              )}
            </div>
            <div className="border-l-0 sm:border-l border-[#1F2228] sm:pl-4">
              <span className="text-[#6B7280] block text-[10px] uppercase">Fee Policy</span>
              <span className={currentAccount.refundableFee ? 'text-emerald-400 font-bold' : 'text-red-400 font-bold'}>
                {currentAccount.refundableFee ? '100% Refundable' : 'Non-refundable'}
              </span>
            </div>
            <div className="border-l-0 sm:border-l border-[#1F2228] sm:pl-4">
              <span className="text-[#6B7280] block text-[10px] uppercase">Leverage</span>
              <span className="text-white font-bold">{currentAccount.leverage}</span>
            </div>
            <div className="border-l-0 sm:border-l border-[#1F2228] sm:pl-4 col-span-2 sm:col-span-1">
              <span className="text-[#6B7280] block text-[10px] uppercase">Platforms</span>
              <span className="text-[#9CA3AF]">{currentAccount.platforms.slice(0, 3).join(', ')}</span>
            </div>
            {isInstant && (
              <div className="ml-auto p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-400" />
                <span className="text-amber-400 font-bold text-xs">No evaluation — live immediately</span>
              </div>
            )}
          </div>
        </div>
      </section>

      <section ref={rulesTableRef} className="space-y-4">
        <div className="space-y-3 border-b border-white/[0.06] pb-4">
          <div className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full bg-white/10 text-white text-xs font-semibold border border-white/[0.06]">
            <Scale className="w-3.5 h-3.5 shrink-0" />
            <span className="hidden sm:inline">{isInstant ? 'Instant Funding — Live Account Rules' : `${currentProgram?.name} — Phase-by-Phase Rules Matrix`}</span><span className="sm:hidden">{isInstant ? 'Live Account Rules' : `${currentProgram?.name} Rules`}</span>
          </div>
          <div className="flex flex-col gap-2">
            <h2 className="text-xl sm:text-2xl font-semibold text-white tracking-tight leading-tight text-balance">
              {isInstant
                ? `Live Account Rules for ${fmt(selectedCapital)} Instant Funding`
                : `All Rules — ${currentProgram?.name} (${fmt(selectedCapital)} Account)`}
            </h2>
            <p className="text-xs sm:text-sm text-white/50 leading-relaxed max-w-2xl">
              {isInstant
                ? 'No evaluation phases exist for Instant Funding. Below are all live account rules that apply from day one.'
                : 'Rows flagged with DIFFERENT highlight where funded-stage rules change vs evaluation. Tap any row to inspect the dollar math.'}
            </p>
          </div>
        </div>

        {isInstant && (
          <div className="flex items-start sm:items-center gap-3 p-4 bg-amber-500/10 border border-amber-500/30 rounded-2xl">
            <Zap className="w-5 h-5 text-amber-400 shrink-0" />
            <div>
              <p className="text-sm font-bold text-amber-300">Instant Funding — No Challenge Phases</p>
              <p className="text-xs text-amber-400/80 mt-0.5">
                This program skips all evaluation phases. You receive a live funded account immediately. The rules below apply from your very first trade.
              </p>
            </div>
          </div>
        )}

        <div className="hidden lg:block overflow-x-auto rounded-xl border border-[#1F2228] bg-[#111318] overflow-hidden">
          <table aria-label="Phase by phase rules comparison" className="w-full text-left border-collapse" style={{ minWidth: isInstant ? '600px' : (is1Step ? '700px' : '900px') }}>
            <thead>
              <tr className="border-b border-white/[0.06] bg-[#080A10] text-[11px] uppercase tracking-wider font-bold">
                <th className="p-4 w-56 sticky left-0 bg-[#080A10] z-10 text-white/50">
                  Rule / Condition
                </th>
                {columnConfig.map((col) => (
                  <th key={col.key} className={`p-4 ${col.class}`}>
                    <span className="block">{col.label}</span>
                    <span className="text-[10px] font-normal opacity-70 normal-case tracking-normal">{col.sub}</span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1F2228] text-xs">
              {tableRows.map((row: any) => (
                <tr
                  key={row.slug}
                  onClick={() => scrollToRule(row.slug)}
                  className={`hover:bg-white/[0.06]/40 cursor-pointer transition-colors group ${
                    row.isDifferent ? 'bg-amber-500/[0.03]' : ''
                  }`}
                >
                  {/* Rule Label Column */}
                  <td className="p-4 font-semibold text-white sticky left-0 bg-[#0f1b2e] group-hover:bg-white/[0.06]/70 z-10 border-r border-white/[0.06]">
                    <div className="flex items-center justify-between gap-2">
                      <span className="flex items-center gap-1.5 text-xs">
                        {row.label}
                        {row.isDifferent && (
                          <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 text-[9px] font-bold shrink-0">
                            DIFF
                          </span>
                        )}
                      </span>
                      <ChevronDown className="w-3.5 h-3.5 text-slate-600 group-hover:text-white shrink-0" />
                    </div>
                    <span className="text-[10px] text-white/60 font-normal block mt-0.5">{row.sub}</span>
                  </td>

                  {/* Dynamic value columns */}
                  {columnConfig.map((col) => {
                    const cell = row[col.key as keyof typeof row] as { val: string; note: string; color: string } | undefined;
                    const isFundedCol = col.key === 'funded';
                    return (
                      <td key={col.key} className={`p-4 ${isFundedCol ? 'bg-emerald-950/10 border-l border-emerald-900/30' : ''}`}>
                        {cell ? (
                          <>
                            <span className={`font-mono font-bold block ${cell.color}`}>{cell.val}</span>
                            {cell.note && (
                              <span className="text-[10px] text-white/60 font-sans font-normal block mt-0.5">{cell.note}</span>
                            )}
                          </>
                        ) : (
                          <span className="text-slate-600 font-mono">—</span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Card View */}
        <div className="md:hidden space-y-3">
          {tableRows.map((row) => (
            <button
              key={row.slug}
              onClick={() => scrollToRule(row.slug)}
              className="w-full text-left p-4 rounded-xl border border-[#1F2228] bg-[#111318] space-y-3 transition-colors active:border-[#2A2D35]"
            >
              <div className="flex items-center justify-between gap-2 border-b border-[#1F2228] pb-2">
                <div>
                  <span className="font-semibold text-white text-sm">{row.label}</span>
                  <p className="text-[11px] text-white/40">{row.sub}</p>
                </div>
                {row.isDifferent && (
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 shrink-0">
                    DIFFERENT
                  </span>
                )}
              </div>
              <div className="space-y-2">
                {columnConfig.map(col => {
                  const cell = (row as any)[col.key];
                  if (!cell) return null;
                  return (
                    <div key={col.key} className="flex justify-between items-start gap-3">
                      <span className="text-xs text-white/60 shrink-0">{col.label.replace('🚀 ','')}</span>
                      <span className={`text-xs font-mono font-bold text-right break-words max-w-[60%] ${cell.color}`}>{cell.val}</span>
                    </div>
                  );
                })}
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* ══ 3.5 EVERY RULE BEFORE YOU START — QUICK VIEW (short answers up top, details below) ══ */}
      <RulesQuickView
        firm={firm}
        program={currentProgram}
        account={currentAccount}
        rules={displayRules}
        accountSizeLabel={fmt(selectedCapital)}
        onSelectRule={scrollToRule}
      />

      {/* ══ 4. ALL RULES — ACCORDION WITH FILTERS & HIDDEN RULES ══ */}
      {displayRules.length > 0 && (
        <section id="rules-section" className="space-y-6">
          <div className="border-b border-white/[0.06] pb-4 space-y-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/10 text-white text-xs font-semibold border border-white/[0.06]">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Complete Rule Intelligence — {currentProgram?.name}</span>
            </div>
            <h2 className="text-2xl font-semibold text-white tracking-tight">
              All Rules with Examples & Dollar Math
            </h2>
            {displayRules[0]?.sources[0]?.sourceType === 'INFERENCE' && (
              <p className="text-[11px] font-mono text-amber-300/80 bg-amber-500/[0.06] border border-amber-500/20 rounded-lg px-3 py-2">
                Parameter-derived dossier — every figure below is computed from {firm.name}'s published account parameters. Clause-level citations pending human verification.
              </p>
            )}
            <p className="text-xs text-white/50">
              Every rule for <strong className="text-white">{currentProgram?.name}</strong> on your <strong className="text-white">{fmt(selectedCapital)}</strong> account.
              Filter by category, risk level, or reveal hidden rules buried in the Terms &amp; Conditions. Click any rule to expand the full explanation with formula and official citation.
            </p>
          </div>

          <RulesAccordion
            rules={displayRules}
            selectedCapital={selectedCapital}
            programType={currentProgram?.programType || '2-Step'}
            programSlug={currentProgram?.slug}
            highlightedRuleId={highlightedRule}
            onOpenSource={onOpenSource}
          />
        </section>
      )}

      {/* ══ 5. HOW CAN I FAIL THIS ACCOUNT? ═══════════════ */}
      <section className="p-8 bg-gradient-to-b from-red-950/20 via-slate-900 to-slate-900 border border-red-500/30 rounded-3xl space-y-6 shadow-2xl">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/10 text-red-400 text-xs font-bold border border-red-500/30">
            <AlertTriangle className="w-4 h-4" />
            <span>Pre-Purchase Risk Intelligence</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-semibold text-white tracking-tight">
            🚨 How Can I Fail This Account?
          </h2>
          <p className="text-xs sm:text-sm text-white/70">
            Before purchasing, these are the exact mathematical and operational tripwires that disqualify traders on {firm.name} {currentProgram?.name}.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Risk 1: Dynamic per firm */}
          {firm.slug === 'goat-funded-trader' ? (
            <div className="p-5 bg-[#080A10] border border-red-500/40 rounded-2xl space-y-2.5 shadow-lg">
              <span className="px-2 py-0.5 text-[10px] font-semibold uppercase rounded bg-red-500/20 text-red-400 border border-red-500/40 flex items-center gap-1 w-fit">
                <Flame className="w-3 h-3" />
                #1 Review Trap: 80% Margin Rule
              </span>
              <h3 className="text-sm font-bold text-white">
                Using &gt;80% Margin Confiscates All Profits at Payout
              </h3>
              <p className="text-xs text-white/70 leading-relaxed">
                If your concurrent open positions ever consume more than 80% of available margin, {firm.brandName || firm.name} flags this as "gambling". When you request a payout, the risk desk deducts all profits made and resets your balance.
              </p>
              <div className="p-2.5 rounded-lg bg-red-950/30 border border-red-900/50 text-[11px] text-red-300 font-mono">
                <strong>Limit on {fmt(selectedCapital)}:</strong> Keep total used margin strictly below {fmt(selectedCapital * 0.8)}. (Confirmed in trader Imane dispute).
              </div>
            </div>
          ) : (
            <div className="p-5 bg-[#080A10] border border-red-500/40 rounded-2xl space-y-2.5 shadow-lg">
              <span className="px-2 py-0.5 text-[10px] font-semibold uppercase rounded bg-red-500/20 text-red-400 border border-red-500/40 flex items-center gap-1 w-fit">
                <Flame className="w-3 h-3" />
                #1 Maximum Drawdown Ceiling
              </span>
              <h3 className="text-sm font-bold text-white">
                Hard Breach on {currentAccount.maxTotalLoss}% Loss Ceiling
              </h3>
              <p className="text-xs text-white/70 leading-relaxed">
                If account equity breaches the {currentAccount.drawdownType.replace(/_/g, ' ')} floor ({fmt(selectedCapital * (1 - currentAccount.maxTotalLoss / 100))}), the account is liquidated immediately.
              </p>
              <div className="p-2.5 rounded-lg bg-red-950/30 border border-red-900/50 text-[11px] text-red-300 font-mono">
                <strong>Ceiling on {fmt(selectedCapital)}:</strong> Maximum allowable loss is {fmt((selectedCapital * currentAccount.maxTotalLoss) / 100)}.
              </div>
            </div>
          )}

          {/* Risk 2: IP / Device Multi-Account */}
          <div className="p-5 bg-[#080A10] border border-red-500/30 rounded-2xl space-y-2.5 shadow-lg">
            <span className="px-2 py-0.5 text-[10px] font-semibold uppercase rounded bg-red-500/20 text-red-400 border border-red-500/40 flex items-center gap-1 w-fit">
              #2 Trap: IP & Device Match Ban
            </span>
            <h3 className="text-sm font-bold text-white">
              Shared WiFi, VPN, or Multi-Device Login Banning
            </h3>
            <p className="text-xs text-white/70 leading-relaxed">
              Logging in from a VPN, VPS, public network, or device that ever touched another trader's account triggers an automated "Coordinated Trading" ban without warning, terminating the account without refund.
            </p>
            <div className="p-2.5 rounded-lg glass-card text-[11px] text-white/50">
              <strong>Rule of thumb:</strong> Only trade from a dedicated personal connection with zero VPN usage.
            </div>
          </div>

          {/* Risk 3: Daily Drawdown Reset */}
          <div className="p-5 bg-[#080A10] border border-orange-500/30 rounded-2xl space-y-2.5">
            <span className="px-2 py-0.5 text-[10px] font-bold uppercase rounded bg-orange-500/20 text-orange-400 border border-orange-500/40 flex items-center gap-1 w-fit">
              #3 Daily Loss at 00:00 Rollover
            </span>
            <h3 className="text-sm font-bold text-white">
              {currentAccount.dailyLossLimit === 0
                ? (currentAccount.drawdownType === 'end_of_day'
                  ? 'No Daily Cap — EOD Floor Steps Up on Closes'
                  : 'No Daily Cap — Trailing Max Is the Only Tripwire')
                : isInstant
                  ? 'Trailing Drawdown Locks at Peak Equity'
                  : 'Spread Widening at Daily Server Rollover (00:00)'}
            </h3>
            <p className="text-xs text-white/70 leading-relaxed">
              {currentAccount.dailyLossLimit === 0
                ? (currentAccount.drawdownType === 'end_of_day'
                  ? 'No intraday tripwire exists. Only the daily close moves the maximum-loss floor — intraday peaks bank nothing, but every closing high permanently tightens your room.'
                  : 'No intraday tripwire exists. Early profits ratchet the trailing floor up, and a normal pullback from the new high can tag it.')
                : isInstant
                  ? 'The trailing drawdown floor moves up with every high-water mark. Once equity reaches a peak, the floor stays locked. Overnight spreads can touch the floor.'
                  : 'Daily loss calculates against midnight start balance. Holding floating drawdowns into 00:00 server reset can cause widening spreads to breach the daily floor.'}
            </p>
            <div className="p-2.5 rounded-lg glass-card text-[11px] text-white/50 font-mono">
              <strong>Limit on {fmt(selectedCapital)}:</strong> {currentAccount.dailyLossLimit === 0
                ? `Lifetime floor starts at ${fmt(selectedCapital * (1 - currentAccount.maxTotalLoss / 100))} and only tightens — no daily early warning.`
                : `Max loss in 24hr cycle: ${fmt((selectedCapital * currentAccount.dailyLossLimit) / 100)}.`}
            </div>
          </div>

          {/* Risk 4: Inactivity */}
          <div className="p-5 bg-[#080A10] border border-amber-500/30 rounded-2xl space-y-2.5">
            <span className="px-2 py-0.5 text-[10px] font-bold uppercase rounded bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center gap-1 w-fit">
              #4 Inactivity Forfeiture
            </span>
            <h3 className="text-sm font-bold text-white">{currentAccount.inactivityLimitDays}-Day Consecutive Idle Lockout</h3>
            <p className="text-xs text-white/70 leading-relaxed">
              If {currentAccount.inactivityLimitDays} consecutive calendar days elapse without placing a trade, credentials are automatically deactivated and challenge progress is forfeited.
            </p>
            <div className="p-2.5 rounded-lg glass-card text-[11px] text-white/50">
              <strong>Fix:</strong> Place a 0.01 lot micro trade before taking any long break or holiday.
            </div>
          </div>

          {/* Risk 5: 2-Minute News Buffer */}
          <div className="p-5 bg-[#080A10] border border-amber-500/30 rounded-2xl space-y-2.5">
            <span className="px-2 py-0.5 text-[10px] font-bold uppercase rounded bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center gap-1 w-fit">
              #5 News Execution Buffer
            </span>
            {firm.slug === 'goat-funded-trader' ? (
              <>
                <h3 className="text-sm font-bold text-white">
                  2-Minute Window Around Red Folder News
                </h3>
                <p className="text-xs text-white/70 leading-relaxed">
                  While marketing says "News Trading Allowed", opening or closing trades within 2 minutes before or after high-impact events on funded stages invalidates profits.
                </p>
              </>
            ) : (
              <>
                <h3 className="text-sm font-bold text-white">
                  News Trading: {currentAccount.newsTradingRule}
                </h3>
                <p className="text-xs text-white/70 leading-relaxed">
                  {currentAccount.newsTradingDetail}
                </p>
              </>
            )}
          </div>

          {/* Risk 6: Open Orders During Payout */}
          <div className="p-5 bg-[#080A10] border border-purple-500/30 rounded-2xl space-y-2.5">
            <span className="px-2 py-0.5 text-[10px] font-bold uppercase rounded bg-purple-500/20 text-purple-400 border border-purple-500/40 flex items-center gap-1 w-fit">
              #6 Payout Submission Trap
            </span>
            <h3 className="text-sm font-bold text-white">
              Active Orders / Positions During Withdrawal
            </h3>
            <p className="text-xs text-white/70 leading-relaxed">
              All positions and pending limit/stop orders must be 100% closed before submitting a reward withdrawal. Any active order causes automated payout gateway rejection.
            </p>
          </div>
        </div>
      </section>

      {/* ══ 6. RISK SIMULATOR ════════════════════════════════ */}
      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Sliders className="w-5 h-5 text-blue-400" />
            Interactive Risk Simulator — {fmt(selectedCapital)} {currentProgram?.name}
          </h2>
          <p className="text-xs text-white/50 mt-1">
            Simulate drawdown scenarios, lot sizes, and pips against this account's exact limits.
          </p>
        </div>
        <RiskSimulator
          initialNominalSize={selectedCapital}
          initialDailyLossPct={currentAccount.dailyLossLimit}
          initialMaxLossPct={currentAccount.maxTotalLoss}
          initialDrawdownType={currentAccount.drawdownType}
        />
      </section>

      {/* ══ 7. CONFLICTS ════════════════════════════════════ */}
      {firm.conflicts && firm.conflicts.length > 0 && (
        <section className="space-y-4">
          <div className="border-b border-white/[0.06] pb-3">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Scale className="w-5 h-5 text-amber-400" />
              Detected Rule Conflicts & Discrepancies
            </h2>
            <p className="text-xs text-white/50 mt-1">
              Discrepancies identified between promotional headlines and official support FAQ policies.
            </p>
          </div>
          <div className="space-y-4">
            {firm.conflicts.map((conflict) => (
              <div key={conflict.id} className="p-6 glass-card rounded-2xl space-y-4">
                <h3 className="text-base font-bold text-white">{conflict.topic}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-[#080A10] border border-white/[0.06] space-y-2">
                    <span className="text-[10px] uppercase font-bold text-amber-400 block">
                      Claim ({conflict.sourceA.context})
                    </span>
                    <blockquote className="text-xs text-white italic font-mono">
                      "{conflict.sourceA.claim}"
                    </blockquote>
                  </div>
                  <div className="p-4 rounded-xl bg-[#080A10] border border-white/[0.06] space-y-2">
                    <span className="text-[10px] uppercase font-bold text-blue-400 block">
                      Official Policy ({conflict.sourceB.context})
                    </span>
                    <blockquote className="text-xs text-white italic font-mono">
                      "{conflict.sourceB.claim}"
                    </blockquote>
                  </div>
                </div>
                <div className="p-4 rounded-xl bg-[#080A10]/60 border border-white/[0.06] space-y-2 text-xs">
                  <p className="text-white/70"><strong className="text-white">What this means: </strong>{conflict.practicalMeaning}</p>
                  <p className="text-white/70 pt-2 border-t border-white/[0.06] mt-2">
                    <strong className="text-emerald-400">Recommended Action: </strong>{conflict.recommendedTraderAction}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ══ 8. TRADER REVIEWS ═══════════════════════════════ */}
      {firm.reviewsOverview && firm.reviewsOverview.recentReviews?.length > 0 && (
        <section className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/[0.06] pb-3">
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <MessageSquareQuote className="w-5 h-5 text-white" />
                Trader Complaints vs Official Firm Responses
              </h2>
              <p className="text-xs text-white/50 mt-1">Real reviews and formal compliance replies recorded objectively.</p>
            </div>
            <div className="text-right shrink-0">
              <span className="text-lg font-bold text-white font-mono">
                {firm.reviewsOverview.averageRating}/5.0
              </span>
              <span className="text-[11px] text-white/50 block">
                {firm.reviewsOverview.totalReviews} verified reviews
              </span>
            </div>
          </div>
          <div className="space-y-4">
            {firm.reviewsOverview.recentReviews.map((rev) => (
              <ReviewCard key={rev.id} review={rev} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
