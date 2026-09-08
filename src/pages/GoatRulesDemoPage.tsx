import React, { useState, useMemo } from 'react';
import { PROP_FIRMS_DATA } from '../data/propFirmsData.ts';
import { SourceEvidence, PropFirm } from '../types/schema.ts';
import { ReviewCard } from '../components/reviews/ReviewCard.tsx';
import { RiskSimulator } from '../components/simulator/RiskSimulator.tsx';
import {
  ExternalLink,
  CheckCircle2,
  AlertTriangle,
  Flame,
  ArrowRight,
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  TrendingDown,
  TrendingUp,
  Shield,
  Clock,
  Calendar,
  Sliders,
  DollarSign,
  Copy,
  Check,
  Rocket,
  Globe,
  SlidersHorizontal,
  Info,
  Sparkles,
  Award,
  Wallet,
  Zap,
  HelpCircle,
  Layers,
  Coins,
  Search,
  BookOpen,
  FileText,
  AlertOctagon,
  XCircle,
  Percent,
  CheckCheck,
  Scale,
} from 'lucide-react';

interface GoatRulesDemoPageProps {
  onNavigate: (path: string) => void;
  onOpenSource: (evidence: SourceEvidence, ruleTitle: string) => void;
}

// GFT Official Asset Categories: Forex/CFD and Futures
// (Goat Funded Trader does NOT offer a separate Crypto-only evaluation — Crypto is integrated into all Forex/CFD accounts)
type AssetClass = 'forex' | 'futures';

// GFT Official Programs (All 12 Models: 6 Current Evaluation, 5 Current Instant, 2 Legacy)
type ProgramType =
  // Current Evaluation Models
  | 'one_step'          // 1-Step (10% target, 4% daily [3% from Aug 1, 2026], 6% static max, 3 min days, 4 funded days)
  | 'two_step_standard' // 2-Step Standard (10% / 5% targets, 5% daily, 10% static max, 3 min days, 4 funded days)
  | 'two_step_goat'     // 2-Step GOAT (8% / 6% targets, 4% daily, 10% static max, 3 min days, 4 funded days)
  | 'three_step'        // 3-Step (6% / 6% / 6% targets, 4% daily, 8% static max, no eval min days, 4 funded days)
  | 'pay_after_pass'    // Pay Later ($5 entry, 4% target, 0% daily in eval, 8% trailing max; funded: 3% daily, 6% trailing, 20% consistency)
  | 'blitz'             // GOAT BLITZ (3% target, 3% static daily, 5% trailing max, 5 eval min days, 15% consistency)
  // Current Instant Direct Master Models
  | 'instant_goat'      // Instant GOAT (Immediate, 3% trailing daily, 6% trailing max, 2% floating loss, 15% consistency)
  | 'instant_pro'       // Instant PRO (Immediate, NO daily DD, 4% trailing max, 2% floating loss, 20% consistency)
  | 'instant_premium'   // Instant Premium ⚡ (Immediate, 3% daily, 6% intraday trailing max, 1% floating loss, NO consistency, 10-day reward)
  | 'instant_hero'      // Instant HERO 👑 (Immediate, 3% trailing daily, 5% trailing max, 1% floating loss, 90% split)
  | 'goat_1'            // Goat $1 🪙 ($1 entry, $1,000 size, 3% static daily, 6% trailing EOD max, 28-day expiry, $100 lifetime cap)
  // Legacy Models (Explicitly marked discontinued for new purchase)
  | 'two_step_pro'      // 2-Step PRO (Discontinued June 13, 2026)
  | 'instant_standard'  // Instant Standard (Discontinued Sept 22, 2025)
  // Backwards-compatibility aliases
  | 'fast'
  | 'classic'
  | 'instant';

// Category for Master Rules Encyclopedia
type RuleCategory = 'all' | 'evaluation' | 'funded' | 'trading' | 'prohibited' | 'scaling' | 'payouts';

interface GFTRuleItem {
  id: string;
  title: string;
  category: 'evaluation' | 'funded' | 'trading' | 'prohibited' | 'scaling' | 'payouts';
  categoryLabel: string;
  badge: string;
  status: 'allowed' | 'warning' | 'breach' | 'info';
  statusLabel: string;
  summary: string;
  details: string;
  exactClause?: string;
  calcValue?: (capital: number) => string;
  sourceDoc: string;
  sourceUrl?: string;
  models?: string[]; // specific models or undefined for all
  stage?: 'evaluation' | 'funded' | 'both';
  versionDate?: string;
  verificationStatus?: 'official' | 'version-dependent' | 'conflicting' | 'trader-report';
  conflictNotice?: string;
  conflictDetails?: string;
  consequence?: 'hard-breach' | 'payout-deduction' | 'delay-only' | 'advisory' | 'allowed';
  keywords?: string[];
}

interface MatrixCell {
  val: string;
  note?: string;
  color?: string;
}

interface MatrixRow {
  slug: string;
  label: string;
  sub: string;
  isDifferent: boolean;
  phase1?: MatrixCell;
  phase2?: MatrixCell;
  phase3?: MatrixCell;
  funded: MatrixCell;
  expandedDetails: {
    ruleTitle: string;
    explanation: string;
    formula?: string;
    dollarCalculation?: string;
    contractClause?: string;
    source: string;
  };
}

export interface EvalModelComparison {
  name: string;
  slug: ProgramType;
  tag: string;
  phases: string;
  p1Target: string;
  p2Target: string;
  p3Target: string;
  evalDailyDD: string;
  evalMaxDD: string;
  minDaysP1: string;
  minDaysP2: string;
  minDaysP3: string;
  validDayRule: string;
  evalConsistency: string;
  maxDailyProfitEval: string;
  maxLossPerTrade: string;
  goatGuard: string;
  fundedDailyDD: string;
  fundedMaxDD: string;
  fundedValidDays: string;
  fundedConsistency: string;
  fundedDailyProfitCap: string;
  baseSplit: string;
  payoutCycle: string;
  splitAddon: string;
  onDemandAddon: string;
  newsRule: string;
  weekendRule: string;
  vpsRule: string;
}

export interface InstantModelComparison {
  name: string;
  slug: ProgramType;
  tag: string;
  evaluation: string;
  funding: string;
  accountSize: string;
  price: string;
  dailyDD: string;
  maxDD: string;
  floatingLoss: string;
  minValidDays: string;
  validDayThreshold: string;
  consistency: string;
  profitSplit: string;
  rewardCycle: string;
  dailyProfitCap: string;
  splitAddon: string;
  ddResetAfterPayout: string;
  accountExpiry: string;
  minPayout: string;
  lifetimeMaxWithdrawal: string;
  purchaseLimit: string;
  vpsRule: string;
}

export const GFT_EVAL_MODELS: EvalModelComparison[] = [
  {
    name: '1-Step',
    slug: 'one_step',
    tag: 'Fast Track',
    phases: '1',
    p1Target: '10%',
    p2Target: '—',
    p3Target: '—',
    evalDailyDD: '4% (3% for purchases from Aug 1, 2026)',
    evalMaxDD: '6% Static',
    minDaysP1: '3 Valid Days',
    minDaysP2: '—',
    minDaysP3: '—',
    validDayRule: 'Yes (≥0.5% initial balance)',
    evalConsistency: 'No (None)',
    maxDailyProfitEval: 'None',
    maxLossPerTrade: 'Standard risk rules',
    goatGuard: 'Funded (2% snapshot)',
    fundedDailyDD: '4% (3% from Aug 1, 2026)',
    fundedMaxDD: '6% Static',
    fundedValidDays: '4 Valid Days (Jul 27 cutoff)',
    fundedConsistency: 'No (None)',
    fundedDailyProfitCap: '$3,000 / day (excess deducted)',
    baseSplit: '80%',
    payoutCycle: '14 Days',
    splitAddon: 'Yes (up to 100%)',
    onDemandAddon: 'Yes',
    newsRule: 'Allowed (1% cap in ±5m)',
    weekendRule: 'Allowed (24/7 crypto)',
    vpsRule: 'Prohibited (from Aug 12, 2026)',
  },
  {
    name: '2-Step Standard',
    slug: 'two_step_standard',
    tag: 'Max Buffer (10%)',
    phases: '2',
    p1Target: '10%',
    p2Target: '5%',
    p3Target: '—',
    evalDailyDD: '5%',
    evalMaxDD: '10% Static',
    minDaysP1: '3 Valid Days',
    minDaysP2: '3 Valid Days',
    minDaysP3: '—',
    validDayRule: 'Yes (≥0.5% initial balance)',
    evalConsistency: 'No (None)',
    maxDailyProfitEval: 'None',
    maxLossPerTrade: 'Standard risk rules',
    goatGuard: 'Funded (2% snapshot)',
    fundedDailyDD: '5%',
    fundedMaxDD: '10% Static',
    fundedValidDays: '4 Valid Days (Jul 25 cutoff)',
    fundedConsistency: 'No (None)',
    fundedDailyProfitCap: '$3,000 / day (excess deducted)',
    baseSplit: '80%',
    payoutCycle: '14 Days',
    splitAddon: 'Yes (up to 100%)',
    onDemandAddon: 'Yes',
    newsRule: 'Allowed (1% cap in ±5m)',
    weekendRule: 'Allowed (24/7 crypto)',
    vpsRule: 'Prohibited (from Aug 12, 2026)',
  },
  {
    name: '2-Step GOAT',
    slug: 'two_step_goat',
    tag: 'Balanced Targets',
    phases: '2',
    p1Target: '8%',
    p2Target: '6%',
    p3Target: '—',
    evalDailyDD: '4%',
    evalMaxDD: '10% Static',
    minDaysP1: '3 Valid Days',
    minDaysP2: '3 Valid Days',
    minDaysP3: '—',
    validDayRule: 'Yes (≥0.5% initial balance)',
    evalConsistency: 'No (None)',
    maxDailyProfitEval: 'None',
    maxLossPerTrade: 'Standard risk rules',
    goatGuard: 'Funded (2% snapshot)',
    fundedDailyDD: '4%',
    fundedMaxDD: '10% Static',
    fundedValidDays: '4 Valid Days (Jul 25 cutoff)',
    fundedConsistency: 'No (None)',
    fundedDailyProfitCap: '$3,000 / day (excess deducted)',
    baseSplit: '80%',
    payoutCycle: '14 Days',
    splitAddon: 'Yes (up to 100%)',
    onDemandAddon: 'Yes',
    newsRule: 'Allowed (1% cap in ±5m)',
    weekendRule: 'Allowed (24/7 crypto)',
    vpsRule: 'Prohibited (from Aug 12, 2026)',
  },
  {
    name: '3-Step',
    slug: 'three_step',
    tag: 'Lowest Target (6%)',
    phases: '3',
    p1Target: '6%',
    p2Target: '6%',
    p3Target: '6%',
    evalDailyDD: '4%',
    evalMaxDD: '8% Static',
    minDaysP1: 'None',
    minDaysP2: 'None',
    minDaysP3: '3?',
    validDayRule: 'No eval requirement',
    evalConsistency: 'No (None)',
    maxDailyProfitEval: 'None',
    maxLossPerTrade: 'Standard risk rules',
    goatGuard: 'Funded (2% snapshot)',
    fundedDailyDD: '4%',
    fundedMaxDD: '8% Static',
    fundedValidDays: '4 Valid Days (Jul 27 cutoff)',
    fundedConsistency: 'No (None)',
    fundedDailyProfitCap: '$3,000 / day (excess deducted)',
    baseSplit: '80%',
    payoutCycle: '14 Days',
    splitAddon: 'Yes (up to 100%)',
    onDemandAddon: 'Yes',
    newsRule: 'Allowed (1% cap in ±5m)',
    weekendRule: 'Allowed (24/7 crypto)',
    vpsRule: 'Prohibited (from Aug 12, 2026)',
  },
  {
    name: 'Pay Later',
    slug: 'pay_after_pass',
    tag: '$5 Entry Fee',
    phases: '1',
    p1Target: '4%',
    p2Target: '—',
    p3Target: '—',
    evalDailyDD: 'None (0% Daily DD!)',
    evalMaxDD: '8% Trailing',
    minDaysP1: 'None',
    minDaysP2: '—',
    minDaysP3: '—',
    validDayRule: 'Funded only (≥0.5%)',
    evalConsistency: 'No (None)',
    maxDailyProfitEval: 'None',
    maxLossPerTrade: '2% Floating loss rule',
    goatGuard: 'Not listed in model table',
    fundedDailyDD: '3% (of initial size)',
    fundedMaxDD: '6% Trailing',
    fundedValidDays: '3 Valid Days',
    fundedConsistency: '20% Single-Day Cap',
    fundedDailyProfitCap: 'Not stated',
    baseSplit: '80%',
    payoutCycle: '14 Days',
    splitAddon: 'Not stated',
    onDemandAddon: '—',
    newsRule: 'Allowed (1% cap in ±5m)',
    weekendRule: 'Allowed (24/7 crypto)',
    vpsRule: 'Prohibited (from Aug 12, 2026)',
  },
  {
    name: 'GOAT BLITZ',
    slug: 'blitz',
    tag: 'Weekend Drop (3%)',
    phases: '1',
    p1Target: '3%',
    p2Target: '—',
    p3Target: '—',
    evalDailyDD: '3% Static',
    evalMaxDD: '5% Trailing',
    minDaysP1: '5 Valid Days',
    minDaysP2: '—',
    minDaysP3: '—',
    validDayRule: 'Yes (≥0.5% initial balance)',
    evalConsistency: 'No (None)',
    maxDailyProfitEval: 'Not stated as cap',
    maxLossPerTrade: '2% Floating loss rule',
    goatGuard: 'Not listed in model table',
    fundedDailyDD: '3% Static',
    fundedMaxDD: '5% Trailing',
    fundedValidDays: '5 Valid Days',
    fundedConsistency: '15% Single-Day Cap',
    fundedDailyProfitCap: 'Not stated',
    baseSplit: '80%',
    payoutCycle: '14 Days',
    splitAddon: 'Not stated',
    onDemandAddon: '—',
    newsRule: 'Allowed (1% cap in ±5m)',
    weekendRule: 'Allowed (24/7 crypto)',
    vpsRule: 'Prohibited (from Aug 12, 2026)',
  },
];

export const GFT_INSTANT_MODELS: InstantModelComparison[] = [
  {
    name: 'Instant GOAT',
    slug: 'instant_goat',
    tag: 'Standard Direct Master',
    evaluation: 'None (Immediate)',
    funding: 'Immediate',
    accountSize: 'Varies ($5K - $100K)',
    price: 'Varies',
    dailyDD: '3% Trailing',
    maxDD: '6% Trailing',
    floatingLoss: '2%',
    minValidDays: '5 Valid Days',
    validDayThreshold: '0.5%',
    consistency: '15% Single-Day Cap',
    profitSplit: '80%',
    rewardCycle: '14 Days',
    dailyProfitCap: 'Not stated',
    splitAddon: 'Yes (up to 100%)',
    ddResetAfterPayout: 'Yes',
    accountExpiry: '— (No expiry)',
    minPayout: '$100',
    lifetimeMaxWithdrawal: '— (Unlimited)',
    purchaseLimit: '—',
    vpsRule: 'Allowed',
  },
  {
    name: 'Instant PRO',
    slug: 'instant_pro',
    tag: '0% Daily Drawdown',
    evaluation: 'None (Immediate)',
    funding: 'Immediate',
    accountSize: 'Varies ($3K - $100K)',
    price: 'Varies',
    dailyDD: 'None (0% Daily DD!)',
    maxDD: '4% Trailing',
    floatingLoss: '2%',
    minValidDays: '5 Valid Days',
    validDayThreshold: '0.5%',
    consistency: '20% Single-Day Cap',
    profitSplit: '80%',
    rewardCycle: '14 Days',
    dailyProfitCap: 'Not stated',
    splitAddon: 'Yes (up to 100%)',
    ddResetAfterPayout: 'Not explicitly stated',
    accountExpiry: '— (No expiry)',
    minPayout: '$100',
    lifetimeMaxWithdrawal: '— (Unlimited)',
    purchaseLimit: '—',
    vpsRule: 'Prohibited (Aug 12, 2026)',
  },
  {
    name: 'Instant Premium ⚡',
    slug: 'instant_premium',
    tag: '10-Day Rewards · 0% Consistency',
    evaluation: 'None (Immediate)',
    funding: 'Immediate',
    accountSize: 'Varies ($5K - $100K)',
    price: 'Varies',
    dailyDD: '3%',
    maxDD: '6% Intraday Trailing',
    floatingLoss: '1% (from Sep 2, 2026; previously 1.5%)',
    minValidDays: '5 Valid Days',
    validDayThreshold: '0.5%',
    consistency: 'None (ZERO Consistency Rule!)',
    profitSplit: '80%',
    rewardCycle: '10 Days (Fastest in Industry)',
    dailyProfitCap: 'Not stated',
    splitAddon: 'Not shown in model page',
    ddResetAfterPayout: 'Not explicitly stated',
    accountExpiry: '— (No expiry)',
    minPayout: '$100',
    lifetimeMaxWithdrawal: '— (Unlimited)',
    purchaseLimit: '—',
    vpsRule: 'Prohibited (Aug 12, 2026)',
  },
  {
    name: 'Instant HERO 👑',
    slug: 'instant_hero',
    tag: '90% Base Profit Split',
    evaluation: 'None (Immediate)',
    funding: 'Immediate',
    accountSize: 'Varies ($5K - $100K)',
    price: 'Varies',
    dailyDD: '3% Trailing',
    maxDD: '5% Trailing',
    floatingLoss: '1%',
    minValidDays: '6 Valid Days',
    validDayThreshold: '0.5%',
    consistency: '15% Single-Day Cap',
    profitSplit: '90% (Highest Instant Split!)',
    rewardCycle: '14 Days',
    dailyProfitCap: 'Not stated',
    splitAddon: 'Yes (up to 100%)',
    ddResetAfterPayout: 'Yes',
    accountExpiry: '— (No expiry)',
    minPayout: '$100',
    lifetimeMaxWithdrawal: '— (Unlimited)',
    purchaseLimit: '—',
    vpsRule: 'Allowed',
  },
  {
    name: 'Goat $1 🪙',
    slug: 'goat_1',
    tag: '$1.00 Entry Cost',
    evaluation: 'None (Immediate)',
    funding: 'Immediate',
    accountSize: '$1,000 only',
    price: '$1.00',
    dailyDD: '3% Static ($30 floor)',
    maxDD: '6% Trailing EOD ($60 max loss)',
    floatingLoss: '2% ($20 limit)',
    minValidDays: '3 Valid Days',
    validDayThreshold: '0.5% ($5 per day)',
    consistency: '15% Single-Day Cap',
    profitSplit: '80%',
    rewardCycle: '14 Days',
    dailyProfitCap: 'Not stated',
    splitAddon: 'Not stated',
    ddResetAfterPayout: 'EOD Trailing Mechanics',
    accountExpiry: '28 Calendar Days',
    minPayout: '$100',
    lifetimeMaxWithdrawal: '$100 Total Maximum',
    purchaseLimit: '1 Per User',
    vpsRule: 'Allowed',
  },
];

export const GoatRulesDemoPage: React.FC<GoatRulesDemoPageProps> = ({
  onNavigate,
}) => {
  // Load official Goat Funded Trader data
  const firm: PropFirm = useMemo(() => {
    return (
      PROP_FIRMS_DATA.find((f) => f.slug === 'goat-funded-trader') ||
      PROP_FIRMS_DATA[0]
    );
  }, []);

  // Primary Controls
  const [selectedAsset, setSelectedAsset] = useState<AssetClass>('forex');
  const [selectedProgram, setSelectedProgram] = useState<ProgramType>('pay_after_pass');
  const [copiedPromo, setCopiedPromo] = useState<boolean>(false);
  const [showCryptoInfo, setShowCryptoInfo] = useState<boolean>(false);

  // Matrix table row expansion state
  const [expandedMatrixRow, setExpandedMatrixRow] = useState<string | null>(null);

  // Encyclopedia search & category filters
  const [encyclopediaSearch, setEncyclopediaSearch] = useState<string>('');
  const [activeCategory, setActiveCategory] = useState<RuleCategory>('all');
  const [expandedEncyclopediaId, setExpandedEncyclopediaId] = useState<string | null>('rule-daily-drawdown');

  // Scaling simulator start capital
  const [scalingStartSize, setScalingStartSize] = useState<number>(100000);

  // 6 Expandable Model Categories: Pay Later, 1-Step, 2-Step, 3-Step, Instant Funding, Legacy / Archived
  type GFTCategory = 'pay_later' | 'one_step' | 'two_step' | 'three_step' | 'instant' | 'legacy';
  const [selectedCategory, setSelectedCategory] = useState<GFTCategory>('pay_later');

  // View mode: Active Model Matrix vs Full Evaluation Table vs Full Instant Table
  const [activeTableView, setActiveTableView] = useState<'matrix' | 'eval_table' | 'instant_table'>('matrix');

  // Account Context Filters (Stage, Purchase Version, Platform, Status)
  const [selectedStage, setSelectedStage] = useState<'all' | 'evaluation' | 'funded'>('all');
  const [selectedVersion, setSelectedVersion] = useState<'current_2026' | 'pre_aug_2026'>('current_2026');
  const [selectedPlatform, setSelectedPlatform] = useState<'all' | 'ctrader' | 'matchtrader' | 'tradelocker' | 'mt5' | 'volumetrica'>('all');
  const [ruleStatusFilter, setRuleStatusFilter] = useState<'all' | 'allowed' | 'warning' | 'breach'>('all');

  // Grouped models structure for the 6 categories
  const GFT_CATEGORIES: Array<{
    id: GFTCategory;
    label: string;
    badge: string;
    models: Array<{
      key: ProgramType;
      label: string;
      badge: string;
      sub: string;
      hasEvaluation: boolean;
      stages: Array<'evaluation' | 'funded'>;
      version: 'current_2026' | 'pre_aug_2026' | 'both';
      platforms: Array<'ctrader' | 'matchtrader' | 'tradelocker' | 'mt5' | 'volumetrica'>;
    }>;
  }> = [
    {
      id: 'pay_later',
      label: 'Pay Later',
      badge: '1 Model · $5 Entry',
      models: [
        {
          key: 'pay_after_pass',
          label: 'Pay Later ($5 Entry)',
          badge: '4% Target · 0% Daily in Eval',
          sub: '$5 upfront, pay remainder after pass. 8% max trailing, 3% funded daily loss.',
          hasEvaluation: true,
          stages: ['evaluation', 'funded'],
          version: 'both',
          platforms: ['ctrader', 'matchtrader', 'tradelocker', 'mt5', 'volumetrica'],
        },
      ],
    },
    {
      id: 'one_step',
      label: '1-Step',
      badge: '2 Models · Fast & Blitz',
      models: [
        {
          key: 'one_step',
          label: '1-Step Fast',
          badge: '10% Target · 6% Static DD',
          sub: 'Single evaluation stage. 4% daily DD (3% from Aug 1, 2026). No consistency rule.',
          hasEvaluation: true,
          stages: ['evaluation', 'funded'],
          version: 'both',
          platforms: ['ctrader', 'matchtrader', 'tradelocker', 'mt5', 'volumetrica'],
        },
        {
          key: 'blitz',
          label: 'GOAT BLITZ',
          badge: '3% Target · 5% Trailing DD',
          sub: 'Fastest 3% profit target. Released 2 weekends per month. 15% funded consistency.',
          hasEvaluation: true,
          stages: ['evaluation', 'funded'],
          version: 'both',
          platforms: ['ctrader', 'matchtrader', 'tradelocker', 'mt5', 'volumetrica'],
        },
      ],
    },
    {
      id: 'two_step',
      label: '2-Step',
      badge: '2 Models · Static Floor',
      models: [
        {
          key: 'two_step_standard',
          label: '2-Step Standard',
          badge: '10% / 5% Targets · 10% Static Floor',
          sub: 'Maximum risk room with fixed 10% static floor. 5% daily loss limit.',
          hasEvaluation: true,
          stages: ['evaluation', 'funded'],
          version: 'both',
          platforms: ['ctrader', 'matchtrader', 'tradelocker', 'mt5', 'volumetrica'],
        },
        {
          key: 'two_step_goat',
          label: '2-Step GOAT',
          badge: '8% / 6% Targets · 10% Static Floor',
          sub: 'Lower Phase 1 target (8%). 4% daily loss limit with 10% static maximum floor.',
          hasEvaluation: true,
          stages: ['evaluation', 'funded'],
          version: 'both',
          platforms: ['ctrader', 'matchtrader', 'tradelocker', 'mt5', 'volumetrica'],
        },
      ],
    },
    {
      id: 'three_step',
      label: '3-Step',
      badge: '1 Model · 6% Target',
      models: [
        {
          key: 'three_step',
          label: '3-Step Challenge',
          badge: '6% / 6% / 6% Targets · 8% Static Floor',
          sub: 'Lowest target per phase (6%). 4% daily loss, 8% static floor. 80% split.',
          hasEvaluation: true,
          stages: ['evaluation', 'funded'],
          version: 'both',
          platforms: ['ctrader', 'matchtrader', 'tradelocker', 'mt5', 'volumetrica'],
        },
      ],
    },
    {
      id: 'instant',
      label: 'Instant Funding',
      badge: '5 Models · Direct Live',
      models: [
        {
          key: 'instant_goat',
          label: 'Instant GOAT',
          badge: 'Immediate · 6% Trailing DD',
          sub: 'Immediate live capital. 3% trailing daily, 6% trailing max, 2% floating loss.',
          hasEvaluation: false,
          stages: ['funded'],
          version: 'both',
          platforms: ['ctrader', 'matchtrader', 'tradelocker', 'mt5'],
        },
        {
          key: 'instant_pro',
          label: 'Instant PRO',
          badge: '0% Daily DD · 4% Trailing Max',
          sub: 'Zero daily drawdown limit! 4% total trailing loss, 20% consistency rule.',
          hasEvaluation: false,
          stages: ['funded'],
          version: 'both',
          platforms: ['ctrader', 'matchtrader', 'tradelocker', 'mt5'],
        },
        {
          key: 'instant_premium',
          label: 'Instant Premium ⚡',
          badge: '10-Day Rewards · 0% Consistency',
          sub: 'Zero consistency rule, 10-day reward cycle (fastest in prop industry), 1% floating loss.',
          hasEvaluation: false,
          stages: ['funded'],
          version: 'current_2026',
          platforms: ['ctrader', 'matchtrader', 'tradelocker', 'mt5'],
        },
        {
          key: 'instant_hero',
          label: 'Instant HERO 👑',
          badge: '90% Profit Split · 5% Trailing DD',
          sub: 'Starts at 90% base profit split from Day 1. 1% floating loss rule, 6 valid days.',
          hasEvaluation: false,
          stages: ['funded'],
          version: 'current_2026',
          platforms: ['ctrader', 'matchtrader', 'tradelocker', 'mt5'],
        },
        {
          key: 'goat_1',
          label: 'Goat $1 🪙',
          badge: '$1.00 Entry · $1,000 Capital',
          sub: '$1 entry price, 28-day expiration, $100 lifetime maximum withdrawable profit.',
          hasEvaluation: false,
          stages: ['funded'],
          version: 'current_2026',
          platforms: ['ctrader', 'matchtrader', 'tradelocker', 'mt5'],
        },
      ],
    },
    {
      id: 'legacy',
      label: 'Legacy / Archived',
      badge: '2 Models · Grandfathered',
      models: [
        {
          key: 'two_step_pro',
          label: '2-Step PRO (Archived)',
          badge: 'Discontinued June 13, 2026',
          sub: 'Legacy 2-step model (8% / 4% targets). Existing accounts remain supported under old terms.',
          hasEvaluation: true,
          stages: ['evaluation', 'funded'],
          version: 'pre_aug_2026',
          platforms: ['ctrader', 'matchtrader', 'tradelocker', 'mt5'],
        },
        {
          key: 'instant_standard',
          label: 'Instant Standard (Archived)',
          badge: 'Discontinued Sept 22, 2025',
          sub: 'Legacy instant model. Replaced by Instant GOAT and Instant Premium.',
          hasEvaluation: false,
          stages: ['funded'],
          version: 'pre_aug_2026',
          platforms: ['ctrader', 'matchtrader', 'tradelocker', 'mt5'],
        },
      ],
    },
  ];

  // Filter models inside the selected category based on Stage, Version, and Platform
  const relevantModels = useMemo(() => {
    const activeCatObj = GFT_CATEGORIES.find((c) => c.id === selectedCategory);
    if (!activeCatObj) return [];

    return activeCatObj.models.filter((m) => {
      // 1. Stage filter: 'all' | 'evaluation' | 'funded'
      if (selectedStage === 'evaluation' && !m.stages.includes('evaluation')) {
        return false;
      }
      if (selectedStage === 'funded' && !m.stages.includes('funded')) {
        return false;
      }

      // 2. Version filter: 'current_2026' | 'pre_aug_2026'
      if (selectedCategory !== 'legacy') {
        if (selectedVersion === 'current_2026' && m.version === 'pre_aug_2026') return false;
        if (selectedVersion === 'pre_aug_2026' && m.version === 'current_2026') return false;
      }

      // 3. Platform filter: 'all' | 'ctrader' | 'matchtrader' | 'tradelocker' | 'mt5' | 'volumetrica'
      if (selectedPlatform !== 'all') {
        if (!m.platforms.includes(selectedPlatform)) return false;
      }

      return true;
    });
  }, [GFT_CATEGORIES, selectedCategory, selectedStage, selectedVersion, selectedPlatform]);

  const handleSelectCategory = (catId: GFTCategory) => {
    setSelectedCategory(catId);
    // Align filters smoothly when category is switched
    if (catId === 'instant' && selectedStage === 'evaluation') {
      setSelectedStage('all');
    }
    if (catId === 'instant' && selectedPlatform === 'volumetrica') {
      setSelectedPlatform('all');
    }
    if (catId === 'legacy' && selectedVersion === 'current_2026') {
      setSelectedVersion('pre_aug_2026');
    }

    const catObj = GFT_CATEGORIES.find((c) => c.id === catId);
    if (catObj && catObj.models.length > 0) {
      const exists = catObj.models.some((m) => m.key === selectedProgram);
      if (!exists) {
        setSelectedProgram(catObj.models[0].key);
      }
    }
  };

  // Auto-sync selectedProgram to first relevant model if current program is filtered out
  React.useEffect(() => {
    if (relevantModels.length > 0) {
      const isSelectedInList = relevantModels.some((m) => m.key === selectedProgram);
      if (!isSelectedInList) {
        setSelectedProgram(relevantModels[0].key);
      }
    }
  }, [relevantModels, selectedProgram]);

  // Real GFT Account Sizes per model (verified from official GFT model directory & checkout pages)
  const programSizes: Record<ProgramType, number[]> = {
    pay_after_pass: [5000, 10000, 15000, 25000, 50000, 100000, 200000],
    one_step: [5000, 10000, 15000, 25000, 50000, 100000, 150000, 200000, 250000, 300000, 400000],
    fast: [5000, 10000, 15000, 25000, 50000, 100000, 150000, 200000, 250000, 300000, 400000],
    two_step_standard: [5000, 10000, 15000, 25000, 50000, 100000, 200000, 400000],
    classic: [5000, 10000, 15000, 25000, 50000, 100000, 200000, 400000],
    two_step_goat: [5000, 10000, 15000, 25000, 50000, 100000, 200000, 400000],
    three_step: [5000, 10000, 25000, 50000, 100000, 200000],
    blitz: [5000, 10000, 25000, 50000, 100000, 200000],
    instant_goat: [5000, 10000, 25000, 50000, 100000],
    instant: [5000, 10000, 25000, 50000, 100000],
    instant_pro: [3000, 6000, 15000, 25000, 50000, 100000],
    instant_premium: [5000, 10000, 25000, 50000, 100000],
    instant_hero: [5000, 10000, 25000, 50000, 100000],
    goat_1: [1000],
    two_step_pro: [5000, 10000, 25000, 50000, 100000],
    instant_standard: [5000, 10000, 25000, 50000, 100000],
  };

  // Futures sizes
  const futuresSizes = [25000, 50000, 100000, 150000];

  const sizes = selectedAsset === 'futures' ? futuresSizes : (programSizes[selectedProgram] || [100000]);
  const [selectedCapital, setSelectedCapital] = useState<number>(100000);

  // Auto-adjust selected size when program or asset changes
  React.useEffect(() => {
    if (!sizes.includes(selectedCapital)) {
      setSelectedCapital(sizes.includes(100000) ? 100000 : sizes[sizes.length - 1] || 50000);
    }
  }, [selectedProgram, selectedAsset, sizes, selectedCapital]);

  // Auto-sync selectedCategory when selectedProgram changes
  React.useEffect(() => {
    const foundCat = GFT_CATEGORIES.find((c) => c.models.some((m) => m.key === selectedProgram));
    if (foundCat && foundCat.id !== selectedCategory) {
      setSelectedCategory(foundCat.id);
    }
  }, [selectedProgram]);

  // Dropdown expansion states in step breakdown
  const [expandedRule, setExpandedRule] = useState<string | null>('daily-drawdown');
  const [expandedMasterRule, setExpandedMasterRule] = useState<string | null>('m-consistency');

  const toggleRule = (id: string) => {
    setExpandedRule((prev) => (prev === id ? null : id));
  };

  const toggleMasterRule = (id: string) => {
    setExpandedMasterRule((prev) => (prev === id ? null : id));
  };

  const toggleMatrixRow = (slug: string) => {
    setExpandedMatrixRow((prev) => (prev === slug ? null : slug));
  };

  const toggleEncyclopediaRule = (id: string) => {
    setExpandedEncyclopediaId((prev) => (prev === id ? null : id));
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedPromo(true);
    setTimeout(() => setCopiedPromo(false), 2000);
  };

  const fmt = (n: number) => `$${n.toLocaleString()}`;

  const is3Step = selectedProgram === 'three_step';
  const is2Step =
    selectedProgram === 'two_step_standard' ||
    selectedProgram === 'two_step_goat' ||
    selectedProgram === 'two_step_pro' ||
    selectedProgram === 'classic';
  const is1Step =
    selectedProgram === 'one_step' ||
    selectedProgram === 'fast' ||
    selectedProgram === 'pay_after_pass' ||
    selectedProgram === 'blitz' ||
    selectedAsset === 'futures';
  const isInstantMode =
    selectedProgram === 'instant_goat' ||
    selectedProgram === 'instant_pro' ||
    selectedProgram === 'instant_premium' ||
    selectedProgram === 'instant_hero' ||
    selectedProgram === 'goat_1' ||
    selectedProgram === 'instant' ||
    selectedProgram === 'instant_standard';

  // Real GFT Program Specifications (Official Sep 8, 2026 Rulebook)
  const programConfig = useMemo(() => {
    if (selectedAsset === 'futures') {
      return {
        name: 'GFT Futures Evaluation',
        hasEvaluation: true,
        evalStepNum: 2,
        masterStepNum: 3,
        rewardStepNum: 4,
        evalTarget: 6, // 6% target
        evalDailyLoss: 4,
        evalMaxLoss: 5,
        masterDailyLoss: 4,
        masterMaxLoss: 5,
        maxLossType: 'Trailing (EOD)',
        leverageEval: 'Exchange Margin',
        leverageMaster: 'Exchange Margin',
        inactivityEval: 30,
        inactivityMaster: 30,
        consistency: 30,
        profitSplit: 90,
        payoutDetails: '90% Profit split (100% of first $10,000); payouts every 14 days',
        newsRule: 'Allowed (Hold CME contracts)',
        entryFeeNote: 'CME/CBOT/NYMEX/COMEX data included; Tradovate & NinjaTrader',
        minDaysEval: '0 Days (No min days)',
        minDaysFunded: '5 Active Trading Days',
        rewardBufferRange: 'CME Exchange Buffer',
      };
    }

    switch (selectedProgram) {
      case 'pay_after_pass':
        return {
          name: 'Pay Later (1-Step Evaluation)',
          hasEvaluation: true,
          evalStepNum: 2,
          masterStepNum: 3,
          rewardStepNum: 4,
          evalTarget: 4, // 4% Target
          evalDailyLoss: 0, // NONE in evaluation!
          evalMaxLoss: 8, // 8% Trailing max
          masterDailyLoss: 3, // 3% Daily in funded (of initial size)
          masterMaxLoss: 6, // 6% Trailing in funded
          maxLossType: 'Trailing',
          leverageEval: '1:100 Forex, 1:20 Indices, 1:2 Crypto',
          leverageMaster: '1:50 Forex, 1:10 Indices, 1:2 Crypto',
          inactivityEval: 30,
          inactivityMaster: 30,
          consistency: 20, // 20% single day cap on funded
          profitSplit: 80,
          rewardBufferRange: '$750 - $6,000',
          entryFeeNote: '$5.00 entry fee — pay the rest only after you pass; 100% refunded on 4th payout',
          newsRule: 'Allowed (1% cap on trades inside news window in funded)',
          minDaysEval: 'None in evaluation',
          minDaysFunded: '3 Valid Days (≥0.5% profit each)',
          floatingLoss: '2% Floating Loss Rule',
          payoutDetails: '80% base split; 14-day reward cycle; activation fee within 30 days',
        };

      case 'one_step':
      case 'fast':
        return {
          name: '1-Step Evaluation',
          hasEvaluation: true,
          evalStepNum: 2,
          masterStepNum: 3,
          rewardStepNum: 4,
          evalTarget: 10, // 10% Target
          evalDailyLoss: 4, // 4% Daily (3% for purchases from Aug 1, 2026)
          evalMaxLoss: 6, // 6% Static max DD
          masterDailyLoss: 4,
          masterMaxLoss: 6,
          maxLossType: 'Static',
          leverageEval: '1:100 Forex, 1:20 Indices, 1:2 Crypto',
          leverageMaster: '1:50 Forex, 1:10 Indices, 1:2 Crypto',
          inactivityEval: 30,
          inactivityMaster: 30,
          consistency: 0, // No consistency rule in eval or funded!
          profitSplit: 80,
          rewardBufferRange: '$750 - $6,000',
          entryFeeNote: '100% Refundable on 4th payout',
          newsRule: 'Allowed (±5m red-folder profit capped at 1%)',
          minDaysEval: '3 Valid Days (≥0.5% each)',
          minDaysFunded: '4 Valid Days (Jul 27, 2026 cutoff)',
          floatingLoss: 'Goat Guard (2% snapshot on funded)',
          payoutDetails: '80% profit split, scalable to 95%; $3,000/day profit cap; 14-day cycle',
        };

      case 'two_step_standard':
      case 'classic':
        return {
          name: '2-Step Standard',
          hasEvaluation: true,
          evalStepNum: 2,
          masterStepNum: 3,
          rewardStepNum: 4,
          evalTarget: 10, // 10% Phase 1, 5% Phase 2
          evalPhase2Target: 5,
          evalDailyLoss: 5, // 5% Balance/equity daily
          evalMaxLoss: 10, // 10% Static floor!
          masterDailyLoss: 5,
          masterMaxLoss: 10,
          maxLossType: 'Static (Fixed Floor)',
          leverageEval: '1:100 Forex, 1:20 Indices, 1:2 Crypto',
          leverageMaster: '1:50 Forex, 1:10 Indices, 1:2 Crypto',
          inactivityEval: 30,
          inactivityMaster: 30,
          consistency: 0, // No consistency rule
          profitSplit: 80,
          rewardBufferRange: '$750 - $6,000',
          entryFeeNote: '100% Refundable on 4th payout',
          newsRule: 'Holding allowed; news window ±5m trades capped at 1% profit',
          minDaysEval: '3 Days Phase 1, 3 Days Phase 2',
          minDaysFunded: '4 Valid Days (Jul 25, 2026 cutoff)',
          floatingLoss: 'Goat Guard (2% snapshot on funded)',
          payoutDetails: '80% profit split; $3,000/day profit cap; 14-day cycle',
        };

      case 'two_step_goat':
        return {
          name: '2-Step GOAT',
          hasEvaluation: true,
          evalStepNum: 2,
          masterStepNum: 3,
          rewardStepNum: 4,
          evalTarget: 8, // 8% Phase 1, 6% Phase 2
          evalPhase2Target: 6,
          evalDailyLoss: 4,
          evalMaxLoss: 10, // 10% Static floor!
          masterDailyLoss: 4,
          masterMaxLoss: 10,
          maxLossType: 'Static (Fixed Floor)',
          leverageEval: '1:100 Forex, 1:20 Indices, 1:2 Crypto',
          leverageMaster: '1:50 Forex, 1:10 Indices, 1:2 Crypto',
          inactivityEval: 30,
          inactivityMaster: 30,
          consistency: 0,
          profitSplit: 80,
          rewardBufferRange: '$750 - $6,000',
          entryFeeNote: '100% Refundable on 4th payout',
          newsRule: 'Holding allowed; news window ±5m trades capped at 1% profit',
          minDaysEval: '3 Days Phase 1, 3 Days Phase 2',
          minDaysFunded: '4 Valid Days (Jul 25, 2026 cutoff)',
          floatingLoss: 'Goat Guard (2% snapshot on funded)',
          payoutDetails: '80% profit split; $3,000/day profit cap; 14-day cycle',
        };

      case 'three_step':
        return {
          name: '3-Step Evaluation',
          hasEvaluation: true,
          evalStepNum: 2,
          masterStepNum: 3,
          rewardStepNum: 4,
          evalTarget: 6, // 6% Phase 1, 6% Phase 2, 6% Phase 3
          evalPhase2Target: 6,
          evalPhase3Target: 6,
          evalDailyLoss: 4,
          evalMaxLoss: 8, // 8% Static floor!
          masterDailyLoss: 4,
          masterMaxLoss: 8,
          maxLossType: 'Static (Fixed Floor)',
          leverageEval: '1:100 Forex, 1:20 Indices, 1:2 Crypto',
          leverageMaster: '1:50 Forex, 1:10 Indices, 1:2 Crypto',
          inactivityEval: 30,
          inactivityMaster: 30,
          consistency: 0,
          profitSplit: 80,
          rewardBufferRange: '$750 - $6,000',
          entryFeeNote: '100% Refundable on 4th payout',
          newsRule: 'Holding allowed; news window ±5m trades capped at 1% profit',
          minDaysEval: 'None in evaluation',
          minDaysFunded: '4 Valid Days (Jul 27, 2026 cutoff)',
          floatingLoss: 'Goat Guard (2% snapshot on funded)',
          payoutDetails: '80% profit split; $3,000/day profit cap; 14-day cycle',
        };

      case 'blitz':
        return {
          name: 'GOAT BLITZ (Limited Weekend Drop)',
          hasEvaluation: true,
          evalStepNum: 2,
          masterStepNum: 3,
          rewardStepNum: 4,
          evalTarget: 3, // 3% Target
          evalDailyLoss: 3, // 3% Static
          evalMaxLoss: 5, // 5% Trailing
          masterDailyLoss: 3,
          masterMaxLoss: 5,
          maxLossType: 'Trailing',
          leverageEval: '1:100 Forex, 1:20 Indices, 1:2 Crypto',
          leverageMaster: '1:50 Forex, 1:10 Indices, 1:2 Crypto',
          inactivityEval: 30,
          inactivityMaster: 30,
          consistency: 15, // 15% Funded consistency
          profitSplit: 80,
          rewardBufferRange: '$750 - $6,000',
          entryFeeNote: 'Limited availability: Released on 2 weekends per month only',
          newsRule: 'Holding allowed',
          minDaysEval: '5 Active Days (≥0.5%)',
          minDaysFunded: '5 Valid Days (≥0.5%)',
          floatingLoss: '2% Floating Loss Rule',
          payoutDetails: '80% profit split, 14-day payout cycle',
        };

      case 'instant_goat':
      case 'instant':
        return {
          name: 'Instant GOAT',
          hasEvaluation: false,
          masterStepNum: 2,
          rewardStepNum: 3,
          evalTarget: 0,
          evalDailyLoss: 3,
          evalMaxLoss: 6,
          masterDailyLoss: 3,
          masterMaxLoss: 6,
          maxLossType: 'Trailing',
          leverageEval: '1:50 Forex, 1:10 Indices, 1:2 Crypto',
          leverageMaster: '1:50 Forex, 1:10 Indices, 1:2 Crypto',
          inactivityEval: 30,
          inactivityMaster: 30,
          consistency: 15, // 15% consistency rule
          profitSplit: 80,
          rewardBufferRange: '$750 - $6,000',
          entryFeeNote: 'Immediate live funded account; 100% refundable on 4th payout',
          newsRule: 'Holding allowed; news window ±5m trades capped at 1%',
          minDaysEval: 'None',
          minDaysFunded: '5 Valid Days (≥0.5% profit each)',
          floatingLoss: '2% Floating Loss Rule',
          payoutDetails: '80% profit split; 14-day reward cycle; VPS Allowed',
        };

      case 'instant_pro':
        return {
          name: 'Instant PRO (0% Daily DD)',
          hasEvaluation: false,
          masterStepNum: 2,
          rewardStepNum: 3,
          evalTarget: 0,
          evalDailyLoss: 0, // NONE!
          evalMaxLoss: 4, // 4% Trailing
          masterDailyLoss: 0, // NO DAILY DRAWDOWN!
          masterMaxLoss: 4,
          maxLossType: 'Trailing',
          leverageEval: '1:50 Forex, 1:10 Indices, 1:2 Crypto',
          leverageMaster: '1:50 Forex, 1:10 Indices, 1:2 Crypto',
          inactivityEval: 30,
          inactivityMaster: 30,
          consistency: 20, // 20% consistency rule
          profitSplit: 80,
          rewardBufferRange: '$750 - $6,000',
          entryFeeNote: 'Zero daily drawdown — only 4% total trailing loss',
          newsRule: 'Holding allowed',
          minDaysEval: 'None',
          minDaysFunded: '5 Valid Days (≥0.5% profit each)',
          floatingLoss: '2% Floating Loss Rule',
          payoutDetails: '80% profit split; 14-day reward cycle; VPS Prohibited (Aug 12, 2026)',
        };

      case 'instant_premium':
        return {
          name: 'Instant Premium ⚡',
          hasEvaluation: false,
          masterStepNum: 2,
          rewardStepNum: 3,
          evalTarget: 0,
          evalDailyLoss: 3,
          evalMaxLoss: 6,
          masterDailyLoss: 3,
          masterMaxLoss: 6,
          maxLossType: 'Intraday Trailing',
          leverageEval: '1:50 Forex, 1:10 Indices, 1:2 Crypto',
          leverageMaster: '1:50 Forex, 1:10 Indices, 1:2 Crypto',
          inactivityEval: 30,
          inactivityMaster: 30,
          consistency: 0, // ZERO CONSISTENCY RULE!
          profitSplit: 80,
          rewardBufferRange: '$500 - $3,000',
          entryFeeNote: 'ZERO consistency rule & 10-day reward cycle (fastest in prop industry)',
          newsRule: 'Holding allowed',
          minDaysEval: 'None',
          minDaysFunded: '5 Valid Days (≥0.5% profit each)',
          floatingLoss: '1% Floating Loss (Purchases from Sep 2, 2026; previously 1.5%)',
          payoutDetails: '80% profit split; 10-day payout cycle; VPS Prohibited (Aug 12, 2026)',
        };

      case 'instant_hero':
        return {
          name: 'Instant HERO 👑',
          hasEvaluation: false,
          masterStepNum: 2,
          rewardStepNum: 3,
          evalTarget: 0,
          evalDailyLoss: 3,
          evalMaxLoss: 5,
          masterDailyLoss: 3,
          masterMaxLoss: 5,
          maxLossType: 'Trailing',
          leverageEval: '1:50 Forex, 1:10 Indices, 1:2 Crypto',
          leverageMaster: '1:50 Forex, 1:10 Indices, 1:2 Crypto',
          inactivityEval: 30,
          inactivityMaster: 30,
          consistency: 15,
          profitSplit: 90, // HIGHEST STANDARD SPLIT!
          rewardBufferRange: '$750 - $6,000',
          entryFeeNote: 'Immediate funding with 90% base profit split from day 1',
          newsRule: 'Holding allowed',
          minDaysEval: 'None',
          minDaysFunded: '6 Valid Days (≥0.5% profit each)',
          floatingLoss: '1% Floating Loss Rule',
          payoutDetails: '90% profit split; 14-day reward cycle; VPS Allowed',
        };

      case 'goat_1':
        return {
          name: 'Goat $1 🪙',
          hasEvaluation: false,
          masterStepNum: 2,
          rewardStepNum: 3,
          evalTarget: 0,
          evalDailyLoss: 3,
          evalMaxLoss: 6,
          masterDailyLoss: 3,
          masterMaxLoss: 6,
          maxLossType: 'Trailing EOD',
          leverageEval: '1:50 Forex, 1:10 Indices, 1:2 Crypto',
          leverageMaster: '1:50 Forex, 1:10 Indices, 1:2 Crypto',
          inactivityEval: 28,
          inactivityMaster: 28,
          consistency: 15,
          profitSplit: 80,
          rewardBufferRange: '$100 Maximum',
          entryFeeNote: '$1.00 starting fee; $1,000 account size; 28-day expiry; $100 lifetime withdrawable cap',
          newsRule: 'Holding allowed',
          minDaysEval: 'None',
          minDaysFunded: '3 Valid Days (≥0.5% each)',
          floatingLoss: '2% Floating Loss ($20 limit)',
          payoutDetails: '80% profit split; 14-day reward cycle; $100 min & lifetime max withdrawal; 1 per user',
        };

      case 'two_step_pro':
        return {
          name: '2-Step PRO (Legacy / Unavailable)',
          hasEvaluation: true,
          isLegacy: true,
          evalStepNum: 2,
          masterStepNum: 3,
          rewardStepNum: 4,
          evalTarget: 8,
          evalPhase2Target: 4,
          evalDailyLoss: 4,
          evalMaxLoss: 8,
          masterDailyLoss: 4,
          masterMaxLoss: 8,
          maxLossType: 'Static',
          leverageEval: '1:100',
          leverageMaster: '1:100',
          inactivityEval: 30,
          inactivityMaster: 30,
          consistency: 0,
          profitSplit: 80,
          rewardBufferRange: '$750 - $6,000',
          entryFeeNote: 'EXPLICITLY MARKED UNAVAILABLE FOR SALE SINCE JUNE 13, 2026',
          newsRule: 'Holding allowed',
          minDaysEval: '3 Days Phase 1, 3 Days Phase 2',
          minDaysFunded: '3 Active Days',
          payoutDetails: 'Legacy account type; existing accounts remain supported under old terms',
        };

      case 'instant_standard':
      default:
        return {
          name: 'Instant Standard (Legacy / Unavailable)',
          hasEvaluation: false,
          isLegacy: true,
          masterStepNum: 2,
          rewardStepNum: 3,
          evalTarget: 0,
          evalDailyLoss: 3,
          evalMaxLoss: 6,
          masterDailyLoss: 3,
          masterMaxLoss: 6,
          maxLossType: 'Trailing',
          leverageEval: '1:30',
          leverageMaster: '1:30',
          inactivityEval: 30,
          inactivityMaster: 30,
          consistency: 20,
          profitSplit: 80,
          rewardBufferRange: '$750 - $6,000',
          entryFeeNote: 'EXPLICITLY MARKED UNAVAILABLE FOR SALE SINCE SEPTEMBER 22, 2025',
          newsRule: 'Holding allowed',
          minDaysEval: 'None',
          minDaysFunded: '3 Active Days',
          payoutDetails: 'Legacy account type; replaced by Instant GOAT & Instant Premium',
        };
    }
  }, [selectedProgram, selectedAsset]);

  // Real pricing breakdown per program & account size
  const pricingData = useMemo(() => {
    if (selectedProgram === 'pay_after_pass') {
      const passFees: Record<number, number> = {
        5000: 54,
        10000: 118,
        15000: 178,
        25000: 248,
        50000: 290,
        100000: 550,
        200000: 998,
      };
      return {
        entryPrice: 5,
        feeAfterPass: passFees[selectedCapital] ?? 550,
        refundable: true,
        code: 'BOGO35',
        discountLabel: 'Pay $5 Upfront · Remainder Only After Pass',
      };
    }

    if (selectedProgram === 'goat_1') {
      return {
        entryPrice: 1,
        fullPrice: 1,
        feeAfterPass: 0,
        refundable: false,
        code: 'DIRECT',
        discountLabel: '$1.00 Direct Entry Price',
      };
    }

    if (selectedProgram === 'instant_pro') {
      const prices: Record<number, number> = {
        3000: 99,
        6000: 189,
        15000: 349,
        25000: 549,
        50000: 999,
        100000: 1850,
      };
      const retail = prices[selectedCapital] ?? 549;
      const discounted = Math.round(retail * 0.55 * 100) / 100;
      return {
        entryPrice: discounted,
        fullPrice: retail,
        feeAfterPass: 0,
        refundable: false,
        code: 'MATCH45',
        discountLabel: '45% OFF with MATCH45',
      };
    }

    if (
      selectedProgram === 'instant_goat' ||
      selectedProgram === 'instant' ||
      selectedProgram === 'instant_premium' ||
      selectedProgram === 'instant_hero' ||
      selectedProgram === 'instant_standard'
    ) {
      const prices: Record<number, number> = {
        5000: 110,
        10000: 210,
        25000: 450,
        50000: 850,
        100000: 1590,
      };
      const retail = prices[selectedCapital] ?? 850;
      const discounted = Math.round(retail * 0.55 * 100) / 100;
      return {
        entryPrice: discounted,
        fullPrice: retail,
        feeAfterPass: 0,
        refundable: false,
        code: 'MATCH45',
        discountLabel: '45% OFF with MATCH45',
      };
    }

    if (selectedProgram === 'blitz') {
      const prices: Record<number, number> = {
        5000: 45,
        10000: 79,
        25000: 179,
        50000: 269,
        100000: 449,
        200000: 899,
      };
      const retail = prices[selectedCapital] ?? 449;
      const discounted = Math.round(retail * 0.55 * 100) / 100;
      return {
        entryPrice: discounted,
        fullPrice: retail,
        feeAfterPass: 0,
        refundable: true,
        code: 'MATCH45',
        discountLabel: '45% OFF with MATCH45 (100% Refundable)',
      };
    }

    if (selectedAsset === 'futures') {
      const prices: Record<number, number> = {
        25000: 149,
        50000: 179,
        100000: 299,
        150000: 379,
      };
      const retail = prices[selectedCapital] ?? 299;
      const discounted = Math.round(retail * 0.55 * 100) / 100;
      return {
        entryPrice: discounted,
        fullPrice: retail,
        feeAfterPass: 0,
        refundable: true,
        code: 'MATCH45',
        discountLabel: '45% OFF with MATCH45',
      };
    }

    // Classic / Fast standard 2-step / 1-step / 3-step
    const standardPrices: Record<number, { full: number; disc: number }> = {
      5000: { full: 49, disc: 26.95 },
      10000: { full: 89, disc: 48.95 },
      15000: { full: 129, disc: 70.95 },
      25000: { full: 199, disc: 109.45 },
      50000: { full: 299, disc: 164.45 },
      100000: { full: 499, disc: 274.45 },
      150000: { full: 749, disc: 411.95 },
      200000: { full: 979, disc: 538.45 },
      250000: { full: 1199, disc: 659.45 },
      300000: { full: 1449, disc: 796.95 },
      400000: { full: 1899, disc: 1044.45 },
    };
    const p = standardPrices[selectedCapital] ?? { full: 499, disc: 274.45 };
    return {
      entryPrice: p.disc,
      fullPrice: p.full,
      feeAfterPass: 0,
      refundable: true,
      code: 'MATCH45',
      discountLabel: '45% OFF with MATCH45 (100% Refundable)',
    };
  }, [selectedProgram, selectedCapital, selectedAsset]);

  // Calculations for selected account size
  const targetDollar = (selectedCapital * (programConfig.evalTarget || 4)) / 100;
  const evalDailyLossPct = programConfig.evalDailyLoss;
  const evalDailyLossDollar = (selectedCapital * evalDailyLossPct) / 100;
  const evalMaxLossDollar = (selectedCapital * programConfig.evalMaxLoss) / 100;

  const masterDailyLossPct = programConfig.masterDailyLoss ?? 3;
  const masterDailyLossDollar = (selectedCapital * masterDailyLossPct) / 100;
  const masterMaxLossDollar = (selectedCapital * (programConfig.masterMaxLoss ?? programConfig.evalMaxLoss)) / 100;

  const floorDollar = selectedCapital - evalMaxLossDollar;

  // ══════════════════════════════════════════════════════════════════════════════════
  // DYNAMIC PHASE-BY-PHASE MATRIX COLUMNS & ROWS
  // Matches the user's requested table view from http://localhost:3000/prop-firms/goat-funded-trader
  // ══════════════════════════════════════════════════════════════════════════════════
  const matrixColumns = useMemo(() => {
    if (isInstantMode) {
      return [
        {
          key: 'funded',
          label: '🚀 LIVE DIRECT MASTER',
          sub: selectedProgram === 'goat_1' ? '$1 Entry · $1,000 live allocation' : 'Immediate funded capital (No evaluation)',
          class: 'text-[#34d399] bg-emerald-950/20 border-l border-emerald-500/30',
        },
      ];
    }
    if (is3Step) {
      return [
        {
          key: 'phase1',
          label: 'PHASE 1 (EVALUATION)',
          sub: '6% Profit target',
          class: 'text-white/80 bg-[#080A10]',
        },
        {
          key: 'phase2',
          label: 'PHASE 2 (VERIFICATION)',
          sub: '6% Profit target',
          class: 'text-white/80 bg-[#080A10]',
        },
        {
          key: 'phase3',
          label: 'PHASE 3 (FINAL TEST)',
          sub: '6% Profit target',
          class: 'text-white/80 bg-[#080A10]',
        },
        {
          key: 'funded',
          label: '🚀 FUNDED STAGE',
          sub: 'Live rewards begin',
          class: 'text-[#34d399] bg-emerald-950/20 border-l border-emerald-500/30',
        },
      ];
    }
    if (is2Step) {
      return [
        {
          key: 'phase1',
          label: 'PHASE 1 (EVALUATION)',
          sub: 'First challenge step',
          class: 'text-white/80 bg-[#080A10]',
        },
        {
          key: 'phase2',
          label: 'PHASE 2 (VERIFICATION)',
          sub: 'Second challenge step',
          class: 'text-white/80 bg-[#080A10]',
        },
        {
          key: 'funded',
          label: '🚀 FUNDED STAGE',
          sub: 'Live rewards begin',
          class: 'text-[#34d399] bg-emerald-950/20 border-l border-emerald-500/30',
        },
      ];
    }
    // 1-step (1-Step, Pay Later, Blitz, Futures)
    return [
      {
        key: 'phase1',
        label: 'PHASE 1 (EVALUATION)',
        sub: selectedProgram === 'pay_after_pass' ? 'Pay $5 entry — pass in 1 phase' : 'Single challenge step',
        class: 'text-white/80 bg-[#080A10]',
      },
      {
        key: 'funded',
        label: '🚀 FUNDED STAGE',
        sub: 'Live rewards begin',
        class: 'text-[#34d399] bg-emerald-950/20 border-l border-emerald-500/30',
      },
    ];
  }, [isInstantMode, is3Step, is2Step, selectedProgram]);

  const matrixTableRows: MatrixRow[] = useMemo(() => {
    const c = selectedCapital;
    const pTarget1 = (c * (programConfig.evalTarget || 4)) / 100;
    const pTarget2 = programConfig.evalPhase2Target ? (c * programConfig.evalPhase2Target) / 100 : 0;
    const pTarget3 = programConfig.evalPhase3Target ? (c * programConfig.evalPhase3Target) / 100 : 0;

    const isVpsAllowed = selectedProgram === 'instant_goat' || selectedProgram === 'instant_hero';

    return [
      {
        slug: 'profit-target',
        label: 'Profit Target',
        sub: 'Required profit to advance',
        isDifferent: false,
        phase1: {
          val: `${programConfig.evalTarget}% (${fmt(pTarget1)})`,
          note: selectedProgram === 'pay_after_pass' ? 'Reach 4% with all positions closed' : 'Close all trades to confirm target',
          color: 'text-white',
        },
        phase2: (is2Step || is3Step)
          ? {
              val: `${programConfig.evalPhase2Target}% (${fmt(pTarget2)})`,
              note: 'Verification target',
              color: 'text-white/80',
            }
          : undefined,
        phase3: is3Step
          ? {
              val: `${programConfig.evalPhase3Target || 6}% (${fmt(pTarget3 || c * 0.06)})`,
              note: 'Phase 3 final verification',
              color: 'text-white/80',
            }
          : undefined,
        funded: {
          val: '✅ No Target',
          note: 'Withdraw 100% of profits freely',
          color: 'text-emerald-400',
        },
        expandedDetails: {
          ruleTitle: 'Profit Target Mechanics',
          explanation: 'There is no profit target once funded. During evaluation, all trades must be fully closed to lock in target equity.',
          dollarCalculation: `Phase 1 target on your ${fmt(c)} account is +${fmt(pTarget1)} (Equity target: ${fmt(c + pTarget1)}). No time limit applies.`,
          source: 'GFT Official Models & FAQ 13860595',
        },
      },
      {
        slug: 'daily-drawdown',
        label: 'Daily Drawdown Limit',
        sub: 'Max loss in 1 day (balance/equity)',
        isDifferent: evalDailyLossPct !== masterDailyLossPct || evalDailyLossPct === 0,
        phase1: evalDailyLossPct === 0
          ? {
              val: '0% (NONE) ✅',
              note: 'Zero daily drawdown in evaluation!',
              color: 'text-emerald-400 font-bold',
            }
          : {
              val: `${evalDailyLossPct}% (${fmt(evalDailyLossDollar)})`,
              note: `Floor: ${fmt(c - evalDailyLossDollar)} — resets at 5 PM EST`,
              color: 'text-sky-300',
            },
        phase2: (is2Step || is3Step)
          ? {
              val: `${evalDailyLossPct}% (${fmt(evalDailyLossDollar)})`,
              note: `Floor: ${fmt(c - evalDailyLossDollar)}`,
              color: 'text-sky-300',
            }
          : undefined,
        phase3: is3Step
          ? {
              val: `${evalDailyLossPct}% (${fmt(evalDailyLossDollar)})`,
              note: `Floor: ${fmt(c - evalDailyLossDollar)}`,
              color: 'text-sky-300',
            }
          : undefined,
        funded: {
          val: masterDailyLossPct === 0 ? '0% (NONE) ✅' : `${masterDailyLossPct}% (${fmt(masterDailyLossDollar)})`,
          note: masterDailyLossPct === 0 ? 'Zero daily loss limit on Instant PRO!' : `Resets daily at 5 PM EST (00:00 server rollover)`,
          color: masterDailyLossPct === 0 ? 'text-emerald-400 font-bold' : 'text-sky-300 font-bold',
        },
        expandedDetails: {
          ruleTitle: 'Daily Drawdown Calculation & 5 PM EST Rollover',
          explanation:
            'Pay Later has NO daily drawdown in evaluation; Instant PRO has NO daily drawdown even when funded. For models using 5 PM EST rollover, GFT calculates the daily loss limit from the higher of balance or equity at 5:00:00 PM EST.',
          dollarCalculation: `Funded daily loss floor on ${fmt(c)}: ${fmt(c - masterDailyLossDollar)} (-${fmt(masterDailyLossDollar)} max intraday loss).`,
          contractClause: 'Calculated at 5 PM EST / 00:00 server time. Breach occurs if active equity drops below the daily floor.',
          source: 'GFT FAQ 12687827 & Terms of Service',
        },
      },
      {
        slug: 'max-drawdown',
        label: 'Maximum Total Drawdown',
        sub: 'Account breach ceiling',
        isDifferent: programConfig.evalMaxLoss !== (programConfig.masterMaxLoss ?? programConfig.evalMaxLoss),
        phase1: programConfig.maxLossType.includes('Static')
          ? {
              val: `${programConfig.evalMaxLoss}% (${fmt(evalMaxLossDollar)}) STATIC`,
              note: `Permanent floor: ${fmt(c - evalMaxLossDollar)} — never trails up!`,
              color: 'text-emerald-400 font-bold',
            }
          : {
              val: `${programConfig.evalMaxLoss}% (${fmt(evalMaxLossDollar)})`,
              note: `Floor: ${fmt(floorDollar)} (${programConfig.maxLossType})`,
              color: 'text-white font-bold',
            },
        phase2: (is2Step || is3Step)
          ? programConfig.maxLossType.includes('Static')
            ? {
                val: `${programConfig.evalMaxLoss}% (${fmt(evalMaxLossDollar)}) STATIC`,
                note: `Fixed floor: ${fmt(c - evalMaxLossDollar)}`,
                color: 'text-emerald-400 font-bold',
              }
            : {
                val: `${programConfig.evalMaxLoss}% (${fmt(evalMaxLossDollar)})`,
                note: `Trailing floor`,
                color: 'text-white',
              }
          : undefined,
        phase3: is3Step
          ? {
              val: `${programConfig.evalMaxLoss}% (${fmt(evalMaxLossDollar)}) STATIC`,
              note: `Fixed floor: ${fmt(c - evalMaxLossDollar)}`,
              color: 'text-emerald-400 font-bold',
            }
          : undefined,
        funded: programConfig.maxLossType.includes('Static')
          ? {
              val: `${programConfig.masterMaxLoss ?? programConfig.evalMaxLoss}% (${fmt(masterMaxLossDollar)}) STATIC`,
              note: `Static floor: ${fmt(c - masterMaxLossDollar)} — never trails`,
              color: 'text-emerald-400 font-bold',
            }
          : {
              val: `${programConfig.masterMaxLoss ?? 6}% (${fmt(masterMaxLossDollar)})`,
              note: `Trailing floor locks at ${fmt(c)}; resets to -6% after payout`,
              color: 'text-white font-bold',
            },
        expandedDetails: {
          ruleTitle: 'Maximum Loss Mechanics: Static vs Trailing Locking',
          explanation:
            '2-Step Standard & 2-Step GOAT feature a 10% STATIC drawdown floor that remains permanently fixed ($90,000 on $100K) and never trails higher. Trailing models evaluate on highest balance/equity, lock permanently at starting capital, and reset after withdrawals.',
          dollarCalculation: `Max allowable cumulative loss on ${fmt(c)}: ${fmt(masterMaxLossDollar)}. Starting floor: ${fmt(c - masterMaxLossDollar)}.`,
          source: 'GFT FAQ 10742114 & Model Specifications',
        },
      },
      {
        slug: 'min-trading-days',
        label: 'Minimum Trading Days',
        sub: 'Days to pass eval / per payout cycle',
        isDifferent: true,
        phase1: {
          val: programConfig.minDaysEval || '0 Days ✅',
          note: selectedProgram === 'pay_after_pass' || selectedProgram === 'three_step' ? 'No eval minimum days' : '3 Valid Days required (≥0.5% profit each)',
          color: 'text-emerald-400 font-bold',
        },
        phase2: (is2Step || is3Step)
          ? {
              val: is3Step ? 'None' : '3 Valid Days',
              note: is3Step ? 'No minimum days in Phase 2' : '≥0.5% closed profit each day',
              color: 'text-emerald-400 font-bold',
            }
          : undefined,
        phase3: is3Step
          ? {
              val: 'None (or 3)',
              note: 'Standard evaluation progression',
              color: 'text-emerald-400 font-bold',
            }
          : undefined,
        funded: {
          val: `🚨 ${programConfig.minDaysFunded}`,
          note: 'Purchases from late July 2026 require 4 valid days (≥0.5% profit)',
          color: 'text-amber-400 font-bold',
        },
        expandedDetails: {
          ruleTitle: 'Minimum Trading Days & Recent Cutoff Dates',
          explanation:
            'For newer accounts purchased after late July 2026, the funded valid-day requirement increased from 3 to 4 days: 1-Step & 3-Step (from July 27, 2026), 2-Step Standard & 2-Step GOAT (from July 25, 2026). Instant models require 5 valid days (HERO requires 6; $1 requires 3).',
          dollarCalculation: `On ${fmt(c)}, each qualifying funded day must record at least +${fmt(c * 0.005)} in closed profit.`,
          source: 'GFT FAQ 13860595 & Official Model Updates',
        },
      },
      {
        slug: 'valid-day-threshold',
        label: 'Valid Trading Day (≥0.5% Rule)',
        sub: 'Threshold to count as an active day',
        isDifferent: false,
        phase1: {
          val: selectedProgram === 'three_step' || selectedProgram === 'pay_after_pass' ? 'Not Required in Eval' : '≥0.5% Initial Balance',
          note: `Must gain ≥${fmt(c * 0.005)} closed profit`,
          color: 'text-white',
        },
        phase2: (is2Step || is3Step)
          ? {
              val: is3Step ? 'Not Required' : '≥0.5% Initial Balance',
              note: `Must gain ≥${fmt(c * 0.005)} closed profit`,
              color: 'text-white',
            }
          : undefined,
        phase3: is3Step
          ? {
              val: 'Not Required',
              note: 'Evaluation day requirement',
              color: 'text-white',
            }
          : undefined,
        funded: {
          val: `≥0.5% (${fmt(c * 0.005)} / day)`,
          note: 'Trading day runs 5:00:01 PM to 4:59:59 PM EST next day',
          color: 'text-[#a3e635] font-bold',
        },
        expandedDetails: {
          ruleTitle: '0.5% Valid Trading Day Definition',
          explanation:
            'A trading day is not merely opening a trade. A valid trading day requires closed net profit ≥ 0.5% of initial account balance. For example, on a $100K account, only days logging +$500 or more count as valid days toward your payout eligibility.',
          dollarCalculation: `On ${fmt(c)}, you need at least +${fmt(c * 0.005)} closed profit during the 5 PM EST to 4:59:59 PM EST window for the day to count.`,
          source: 'GFT Rules & Payout FAQ',
        },
      },
      {
        slug: 'goat-guard',
        label: 'Goat Guard (2% Floating Risk)',
        sub: 'Automated floating drawdown snapshot',
        isDifferent: true,
        phase1: {
          val: 'Standard Risk Rules',
          note: 'Evaluation monitored under general risk rules',
          color: 'text-white/60',
        },
        phase2: (is2Step || is3Step)
          ? {
              val: 'Standard Risk Rules',
              note: 'Evaluation monitored under general risk rules',
              color: 'text-white/60',
            }
          : undefined,
        phase3: is3Step
          ? {
              val: 'Standard Risk Rules',
              note: 'Evaluation monitored under general risk rules',
              color: 'text-white/60',
            }
          : undefined,
        funded: isInstantMode
          ? {
              val: '— Not Active on Instant',
              note: 'Instant models use direct floating loss rules (1% - 2%)',
              color: 'text-white/40',
            }
          : {
              val: `🚨 2% Snapshot (-${fmt(c * 0.02)})`,
              note: '1st trigger: Split drops to 50% · 2nd trigger: Hard breach',
              color: 'text-red-400 font-bold',
            },
        expandedDetails: {
          ruleTitle: 'Goat Guard Floating Risk Snapshot System',
          explanation:
            'Goat Guard applies to funded evaluation accounts. It monitors the combined floating P&L of open positions. Threshold: 2% of initial account size. 1st trigger: Email warning, positions stay open, but profit split is permanently reduced to 50%. 2nd trigger: Account is hard-breached and closed. Modifying or closing/reopening positions creates a new snapshot.',
          dollarCalculation: `On ${fmt(c)}, Goat Guard triggers if floating open losses reach -${fmt(c * 0.02)}.`,
          source: 'GFT Help Center: Goat Guard System',
        },
      },
      {
        slug: 'funded-daily-profit-cap',
        label: '$3,000 Daily Profit Cap',
        sub: 'Funded evaluation account limit',
        isDifferent: true,
        phase1: {
          val: 'No Cap (Unlimited)',
          note: 'No profit cap during evaluation phases',
          color: 'text-emerald-400 font-bold',
        },
        phase2: (is2Step || is3Step)
          ? {
              val: 'No Cap (Unlimited)',
              note: 'No profit cap in Phase 2',
              color: 'text-emerald-400 font-bold',
            }
          : undefined,
        phase3: is3Step
          ? {
              val: 'No Cap (Unlimited)',
              note: 'No profit cap in Phase 3',
              color: 'text-emerald-400 font-bold',
            }
          : undefined,
        funded: isInstantMode
          ? {
              val: 'Not Stated',
              note: 'Subject to model-specific consistency caps',
              color: 'text-white/60',
            }
          : {
              val: '⚠️ $3,000 Max Credited / Day',
              note: 'Excess profit is deducted at payout review; NOT a breach!',
              color: 'text-amber-400 font-bold',
            },
        expandedDetails: {
          ruleTitle: '$3,000 Daily Profit Cap (Funded Accounts)',
          explanation:
            'Applicable to funded evaluation models (1-Step, 2-Step Standard, 2-Step GOAT, 3-Step). Maximum generated profit credited per trading day is $3,000. If you make $5,000 in one day, the excess $2,000 is simply deducted upon payout request. GFT confirms this is NOT an account breach.',
          dollarCalculation: `Daily profit above $3,000 is removed at payout. Example: +$4,500 day = $3,000 counted, $1,500 deducted.`,
          source: 'GFT Official Rulebook (Sep 2026)',
        },
      },
      {
        slug: 'consistency-rule',
        label: 'Consistency Rule',
        sub: 'Single-day profit concentration cap',
        isDifferent: programConfig.consistency > 0,
        phase1: {
          val: '0% (NO RULE) ✅',
          note: 'No consistency rule during evaluation!',
          color: 'text-emerald-400 font-bold',
        },
        phase2: (is2Step || is3Step)
          ? {
              val: '0% (NO RULE) ✅',
              note: 'No consistency rule on evaluation',
              color: 'text-emerald-400 font-bold',
            }
          : undefined,
        phase3: is3Step
          ? {
              val: '0% (NO RULE) ✅',
              note: 'No consistency rule on evaluation',
              color: 'text-emerald-400 font-bold',
            }
          : undefined,
        funded: programConfig.consistency === 0
          ? {
              val: '✅ NO RULE',
              note: 'Instant Premium & Standard 2-Step have zero consistency rule',
              color: 'text-emerald-400 font-bold',
            }
          : {
              val: `🚨 ${programConfig.consistency}% Single-Day Cap`,
              note: 'Formula: Best day / total profit < allowed %',
              color: 'text-amber-400 font-bold',
            },
        expandedDetails: {
          ruleTitle: 'Consistency Rule: Formula & Consequences',
          explanation:
            'Formula: Highest profit day / total payout-period profit < allowed percentage (15% or 20%). Failing consistency NEVER terminates the account. It simply pauses withdrawal approval until you trade more days to bring the ratio into compliance. Note: Partial closes count toward the day the final portion is closed.',
          dollarCalculation: `On a 15% rule: If your highest day is $1,500, your total profit pool before requesting payout must be at least $10,000 ($1,500 / 0.15).`,
          source: 'GFT FAQ 15290379 & Rulebook',
        },
      },
      {
        slug: 'news-trading',
        label: 'News Trading Policy',
        sub: 'High-impact event rules',
        isDifferent: true,
        phase1: {
          val: '✅ Allowed (1% Cap in ±5m)',
          note: 'Hold trades through news; 1% balance cap on news window',
          color: 'text-emerald-400 font-bold',
        },
        phase2: (is2Step || is3Step)
          ? {
              val: '✅ Allowed (1% Cap in ±5m)',
              note: 'Hold trades through news; 1% balance cap on news window',
              color: 'text-emerald-400 font-bold',
            }
          : undefined,
        phase3: is3Step
          ? {
              val: '✅ Allowed (1% Cap in ±5m)',
              note: 'Hold trades through news; 1% balance cap on news window',
              color: 'text-emerald-400 font-bold',
            }
          : undefined,
        funded: {
          val: '⚠️ 1% Profit Cap on News Window',
          note: 'Trades opened/closed ±5m around red-folder news capped at 1% profit',
          color: 'text-amber-400 font-bold',
        },
        expandedDetails: {
          ruleTitle: 'News Trading & ±5 Minutes 1% Profit Cap',
          explanation:
            'Holding trades through news events is allowed. However, any trade opened or closed within 5 minutes before or after a high-impact/red-folder news release can generate at most 1% of initial account balance profit. Excess profit is removed upon payout review rather than creating an account breach.',
          dollarCalculation: `On ${fmt(c)}, max counted profit from a trade executed in the news window is +${fmt(c * 0.01)}.`,
          source: 'GFT Help Article 10742084 & 10064672',
        },
      },
      {
        slug: 'sub-2-minute-trades',
        label: 'Trades Under 2 Minutes (<120s)',
        sub: 'Fast scalping profit deduction',
        isDifferent: true,
        phase1: {
          val: '✅ Allowed',
          note: 'Evaluation phases are exempt from this rule',
          color: 'text-emerald-400',
        },
        phase2: (is2Step || is3Step)
          ? {
              val: '✅ Allowed',
              note: 'Evaluation phases are exempt from this rule',
              color: 'text-emerald-400',
            }
          : undefined,
        phase3: is3Step
          ? {
              val: '✅ Allowed',
              note: 'Evaluation phases are exempt from this rule',
              color: 'text-emerald-400',
            }
          : undefined,
        funded: {
          val: '🚨 Profit Voided (Losses Remain)',
          note: 'Trades held <120s lose all profit; losses remain trader responsibility',
          color: 'text-red-400 font-bold',
        },
        expandedDetails: {
          ruleTitle: 'Sub-2-Minute Trade Profit Voiding (Funded Accounts)',
          explanation:
            'On funded accounts, any profitable position held for less than 120 seconds has its profit completely removed at payout review. Crucially, losing trades held <120s remain the trader responsibility and are not reversed. This is an adjustment, not an automatic breach.',
          contractClause: 'Any profitable trade held for less than 120 seconds on funded accounts will have its profit removed at payout. Losses remain the trader\'s responsibility.',
          source: 'GFT Funded Rules (Sep 2026)',
        },
      },
      {
        slug: 'ea-trading',
        label: 'EA & Algorithmic Trading',
        sub: 'Expert Advisors & bots',
        isDifferent: false,
        phase1: {
          val: '✅ Allowed (Own Code Only)',
          note: 'No commercial/third-party challenge passing bots',
          color: 'text-emerald-400',
        },
        phase2: (is2Step || is3Step)
          ? {
              val: '✅ Allowed (Own Code Only)',
              note: 'Standard personal EAs allowed',
              color: 'text-emerald-400',
            }
          : undefined,
        phase3: is3Step
          ? {
              val: '✅ Allowed (Own Code Only)',
              note: 'Standard personal EAs allowed',
              color: 'text-emerald-400',
            }
          : undefined,
        funded: {
          val: 'Allowed (Proof of Ownership)',
          note: 'GFT may request source code; no HFT or Gold Arbitrage EAs',
          color: 'text-emerald-400 font-bold',
        },
        expandedDetails: {
          ruleTitle: 'Expert Advisors & Prohibited Algo Practices',
          explanation:
            'Legitimate personal automation is allowed. Banned: Third-party or off-the-shelf passing EAs, High-Frequency Trading (HFT) latency bots, Gold Arbitrage EAs, and reverse hedging. GFT reserves the right to request proof of code ownership.',
          contractClause: 'Prohibited: Use of EAs with HFT strategies, Gold Arbitrage EA, third-party off-the-shelf bots, and strategy switching between evaluation and funded.',
          source: 'GFT Terms & Conditions Section 4.4 & FAQ 10749630',
        },
      },
      {
        slug: 'vps-policy',
        label: 'VPS Policy (Aug 12, 2026 Update)',
        sub: 'Virtual Private Server usage',
        isDifferent: false,
        phase1: {
          val: isVpsAllowed ? '✅ VPS Allowed' : '❌ VPS Prohibited',
          note: isVpsAllowed ? 'Instant GOAT & HERO support VPS' : 'Prohibited for accounts bought from Aug 12, 2026',
          color: isVpsAllowed ? 'text-emerald-400 font-bold' : 'text-red-400 font-bold',
        },
        phase2: (is2Step || is3Step)
          ? {
              val: '❌ VPS Prohibited',
              note: 'Prohibited for accounts bought from Aug 12, 2026',
              color: 'text-red-400 font-bold',
            }
          : undefined,
        phase3: is3Step
          ? {
              val: '❌ VPS Prohibited',
              note: 'Prohibited for accounts bought from Aug 12, 2026',
              color: 'text-red-400 font-bold',
            }
          : undefined,
        funded: {
          val: isVpsAllowed ? '✅ VPS Allowed' : '❌ VPS Prohibited',
          note: isVpsAllowed ? 'Instant GOAT & Instant HERO allow VPS' : 'Trade directly from local PC/device',
          color: isVpsAllowed ? 'text-emerald-400 font-bold' : 'text-red-400 font-bold',
        },
        expandedDetails: {
          ruleTitle: 'VPS Policy: August 12, 2026 Restriction',
          explanation:
            'For purchases from August 12, 2026 onward: VPS is strictly PROHIBITED on 1-Step, 2-Step, Instant Premium, and Pay Later. VPS is ALLOWED on Instant GOAT and Instant HERO. Older accounts purchased prior to Aug 12, 2026 are grandfathered in. VPNs are allowed provided geographic consistency is maintained.',
          source: 'GFT Policy Update (Aug 12, 2026)',
        },
      },
      {
        slug: 'weekend-hold',
        label: 'Weekend & Overnight Holding',
        sub: 'Hold positions over weekend?',
        isDifferent: false,
        phase1: {
          val: '✅ Allowed (24/7 Crypto)',
          note: 'No forced close; 500+ Crypto trades 24/7',
          color: 'text-emerald-400',
        },
        phase2: (is2Step || is3Step)
          ? {
              val: '✅ Allowed',
              note: 'Hold positions over weekend',
              color: 'text-emerald-400',
            }
          : undefined,
        phase3: is3Step
          ? {
              val: '✅ Allowed',
              note: 'Hold positions over weekend',
              color: 'text-emerald-400',
            }
          : undefined,
        funded: {
          val: 'Allowed (No Gap Exploitation)',
          note: 'Trades opened last 3h Friday & closed first 3h Monday are reviewed',
          color: 'text-emerald-400 font-bold',
        },
        expandedDetails: {
          ruleTitle: 'Weekend Holding Permitted & Gap Exploitation Clause',
          explanation:
            'Holding positions over weekends is allowed. However, GFT prohibits trading designed solely to exploit weekend market gaps: trades opened in the last 3 hours of Friday and closed in the first 3 hours of Monday can have profits removed upon review.',
          source: 'GFT FAQ 10742082 & Prohibited Practice List',
        },
      },
      {
        slug: 'inactivity',
        label: 'Inactivity Limit',
        sub: 'Max consecutive idle days',
        isDifferent: false,
        phase1: {
          val: selectedProgram === 'goat_1' ? '28 Calendar Days (Expiry)' : '30 Calendar Days',
          note: selectedProgram === 'goat_1' ? 'Goat $1 expires after 28 days' : 'Place at least 1 trade every 30 days',
          color: 'text-amber-300',
        },
        phase2: (is2Step || is3Step)
          ? {
              val: '30 Calendar Days',
              note: 'Keep demo active',
              color: 'text-amber-300',
            }
          : undefined,
        phase3: is3Step
          ? {
              val: '30 Calendar Days',
              note: 'Keep demo active',
              color: 'text-amber-300',
            }
          : undefined,
        funded: {
          val: selectedProgram === 'goat_1' ? '28 Days Total Expiry' : '30 Calendar Days',
          note: 'Account breached if idle for 30 consecutive days',
          color: 'text-amber-300',
        },
        expandedDetails: {
          ruleTitle: 'Inactivity Policy (30 Days) & Goat $1 Expiration',
          explanation:
            'Accounts remain valid indefinitely with no calendar expiration, provided at least one trade is executed every 30 consecutive calendar days. Failure to trade breaches the account without reinstatement. Note: Goat $1 has an absolute 28-day lifetime expiration.',
          source: 'GFT FAQ 10742197',
        },
      },
      {
        slug: 'profit-split',
        label: 'Profit Split',
        sub: 'Your share of gains',
        isDifferent: false,
        phase1: {
          val: 'N/A',
          note: 'Evaluation demo phase',
          color: 'text-white/40',
        },
        phase2: (is2Step || is3Step)
          ? {
              val: 'N/A',
              note: 'Verification demo phase',
              color: 'text-white/40',
            }
          : undefined,
        phase3: is3Step
          ? {
              val: 'N/A',
              note: 'Evaluation demo phase',
              color: 'text-white/40',
            }
          : undefined,
        funded: {
          val: `${programConfig.profitSplit}% — 95% (or 100%)`,
          note: 'Instant HERO starts at 90%! Scalable via official scaling ladder',
          color: 'text-emerald-400 font-bold',
        },
        expandedDetails: {
          ruleTitle: 'Profit Split & Scaling Plan',
          explanation:
            'Standard models start at 80% (Instant HERO starts at 90%). Profit split scales to 90% (Level 1), 92% (Level 3), and 95% (Level 4 GOAT Trader). Add-on available at checkout for 100% profit split.',
          source: 'GFT Scaling Plan & Rewards',
        },
      },
      {
        slug: 'payout-schedule',
        label: 'Payout Schedule',
        sub: 'When can you withdraw?',
        isDifferent: false,
        phase1: {
          val: 'N/A',
          note: '',
          color: 'text-white/40',
        },
        phase2: (is2Step || is3Step)
          ? {
              val: 'N/A',
              note: '',
              color: 'text-white/40',
            }
          : undefined,
        phase3: is3Step
          ? {
              val: 'N/A',
              note: '',
              color: 'text-white/40',
            }
          : undefined,
        funded: {
          val: selectedProgram === 'instant_premium' ? '⚡ Every 10 Days' : 'Every 14 Days / On Demand',
          note: 'Processed within 2 business days; $1,000 guarantee if delayed',
          color: 'text-white font-bold',
        },
        expandedDetails: {
          ruleTitle: 'Payout Schedule & First Two Payout Limits',
          explanation:
            'Standard withdrawals occur every 14 days; Instant Premium offers a 10-day reward cycle. Note on first 2 payouts: Restricted to 6% of initial balance or $10,000 (whichever is lower; 4% on $5K accounts). Restriction is fully removed from payout 3 onward.',
          source: 'GFT Payout Guidelines & Terms of Service',
        },
      },
      {
        slug: 'registration-fee',
        label: 'Evaluation Fee & 4th Payout Refund',
        sub: 'Paid upfront / refundable?',
        isDifferent: true,
        phase1: selectedProgram === 'pay_after_pass'
          ? {
              val: '$5.00 Upfront',
              note: 'Pass first — only pay remainder after you succeed',
              color: 'text-[#a3e635] font-bold',
            }
          : {
              val: `${fmt(pricingData.entryPrice)} Upfront`,
              note: 'One-time challenge registration fee',
              color: 'text-white font-bold',
            },
        phase2: (is2Step || is3Step)
          ? {
              val: '$0 — Free Phase 2',
              note: 'Phase 2 has zero additional cost',
              color: 'text-emerald-400 font-bold',
            }
          : undefined,
        phase3: is3Step
          ? {
              val: '$0 — Free Phase 3',
              note: 'Phase 3 has zero additional cost',
              color: 'text-emerald-400 font-bold',
            }
          : undefined,
        funded: selectedProgram === 'pay_after_pass'
          ? {
              val: `Pay ${fmt(pricingData.feeAfterPass ?? 550)} after pass`,
              note: '100% Refunded on 4th approved payout',
              color: 'text-emerald-400 font-bold',
            }
          : {
              val: '100% Refunded on 4th Payout',
              note: 'Applicable to evaluation, Pay Later, and Instant accounts',
              color: 'text-emerald-400 font-bold',
            },
        expandedDetails: {
          ruleTitle: 'Fee Schedule & 4th Payout Full Refund',
          explanation:
            'GFT provides a 100% evaluation fee refund on the fourth successful profit withdrawal, covering traditional evaluations, Pay Later activation fees, and Instant accounts. Failing before the fourth payout forfeits the refund.',
          dollarCalculation: `On your ${fmt(c)} account: Registration fee is refunded in full with your 4th payout.`,
          source: 'GFT Refund Policy & FAQ (2026)',
        },
      },
      {
        slug: 'leverage',
        label: 'Leverage',
        sub: 'Max ratio available',
        isDifferent: programConfig.leverageEval !== programConfig.leverageMaster,
        phase1: {
          val: programConfig.leverageEval,
          note: '1:100 FX · 1:20 Indices & Commodities · 1:5 Stocks · 1:2 Crypto',
          color: 'text-white font-bold',
        },
        phase2: (is2Step || is3Step)
          ? {
              val: programConfig.leverageEval,
              note: 'Same leverage schedule',
              color: 'text-white font-bold',
            }
          : undefined,
        phase3: is3Step
          ? {
              val: programConfig.leverageEval,
              note: 'Same leverage schedule',
              color: 'text-white font-bold',
            }
          : undefined,
        funded: {
          val: programConfig.leverageMaster,
          note: '1:50 FX · 1:10 Indices & Commodities · 1:5 Stocks · 1:2 Crypto',
          color: 'text-white font-bold',
        },
        expandedDetails: {
          ruleTitle: 'Leverage Schedule by Instrument Class',
          explanation:
            'Evaluation Leverage: Forex 1:100, Indices & Commodities 1:20, Stocks 1:5, Cryptocurrencies 1:2. Funded Leverage: Forex 1:50, Indices & Commodities 1:10, Stocks 1:5, Crypto 1:2.',
          source: 'GFT FAQ 10741910',
        },
      },
      {
        slug: 'margin-80-rule',
        label: '80% Margin Rule (Gambling Clause)',
        sub: 'Max concurrent used margin',
        isDifferent: true,
        phase1: {
          val: 'Soft Risk Monitor',
          note: 'Keep margin usage disciplined',
          color: 'text-white/60',
        },
        phase2: (is2Step || is3Step)
          ? {
              val: 'Soft Risk Monitor',
              note: 'Maintain responsible position sizing',
              color: 'text-white/60',
            }
          : undefined,
        phase3: is3Step
          ? {
              val: 'Soft Risk Monitor',
              note: 'Maintain responsible position sizing',
              color: 'text-white/60',
            }
          : undefined,
        funded: {
          val: `🚨 Max 80% (${fmt(selectedCapital * 0.8)})`,
          note: 'Consuming >80% margin flags account as gambling; profits voided',
          color: 'text-red-400 font-bold',
        },
        expandedDetails: {
          ruleTitle: '80% Margin Limit & All-or-Nothing Gambling Ban',
          explanation:
            'Section 4.4 explicitly bans all-or-nothing trading. If concurrent open positions consume more than 80% of account margin, profits are flagged upon payout review and can be withheld.',
          dollarCalculation: `Keep total used margin on your ${fmt(selectedCapital)} account strictly below ${fmt(selectedCapital * 0.8)}.`,
          contractClause: 'Prohibited: All-or-Nothing Trading, where you can lose the account in one trade.',
          source: 'GFT Terms & Conditions Section 4.4',
        },
      },
      {
        slug: 'equity-earnings-rule',
        label: 'Single Share Equity CFDs Earnings',
        sub: 'Stock CFD earnings release rule',
        isDifferent: true,
        phase1: {
          val: '🚨 Close by 3:50 PM ET',
          note: 'Before earnings announcement',
          color: 'text-amber-300',
        },
        phase2: (is2Step || is3Step)
          ? {
              val: '🚨 Close by 3:50 PM ET',
              note: 'Mandatory closure',
              color: 'text-amber-300',
            }
          : undefined,
        phase3: is3Step
          ? {
              val: '🚨 Close by 3:50 PM ET',
              note: 'Mandatory closure',
              color: 'text-amber-300',
            }
          : undefined,
        funded: {
          val: '🚨 Immediate Hard Breach',
          note: 'Holding single-stock CFDs into earnings terminates account',
          color: 'text-red-400 font-bold',
        },
        expandedDetails: {
          ruleTitle: 'Single Share Equity CFDs Earnings Hard Breach',
          explanation:
            'Section 4.4 mandates closing all Single Share Equity CFD positions by 3:50 PM Eastern before company earnings releases. Holding into earnings results in immediate termination and voiding of gains.',
          contractClause: 'To avoid being in breach, close all Single Share Equity CFD positions by 3:50 pm Eastern Time. Violation constitutes an immediate hard breach.',
          source: 'GFT Terms & Conditions Section 4.4',
        },
      },
      {
        slug: 'hedging-policy',
        label: 'Hedging Policy',
        sub: 'Opposite positions restriction',
        isDifferent: false,
        phase1: {
          val: '❌ Strictly Prohibited',
          note: 'No hedging within account or cross-account',
          color: 'text-red-400 font-bold',
        },
        phase2: (is2Step || is3Step)
          ? {
              val: '❌ Strictly Prohibited',
              note: 'No hedging within account or cross-account',
              color: 'text-red-400 font-bold',
            }
          : undefined,
        phase3: is3Step
          ? {
              val: '❌ Strictly Prohibited',
              note: 'No hedging within account or cross-account',
              color: 'text-red-400 font-bold',
            }
          : undefined,
        funded: {
          val: '❌ Immediate Termination & Ban',
          note: 'Hedging across accounts or with other firms results in lifetime ban',
          color: 'text-red-400 font-bold',
        },
        expandedDetails: {
          ruleTitle: 'Hedging Ban Across Accounts & Other Prop Firms',
          explanation:
            'GFT prohibits opposite positions on the same asset across: (1) the same account, (2) your different GFT accounts, (3) your account and another trader account, (4) your GFT account and an account at another prop firm. Hard breach and permanent forfeiture of simulated rewards.',
          source: 'GFT Prohibited Trading Policy',
        },
      },
    ];
  }, [selectedCapital, programConfig, evalDailyLossPct, evalDailyLossDollar, masterDailyLossPct, masterDailyLossDollar, evalMaxLossDollar, masterMaxLossDollar, floorDollar, is2Step, is3Step, isInstantMode, selectedProgram, pricingData]);

  // ══════════════════════════════════════════════════════════════════════════════════
  // MASTER COMPREHENSIVE GFT RULEBOOK DATABASE (ENCYCLOPEDIA)
  // ══════════════════════════════════════════════════════════════════════════════════
  const gftRulesDatabase: GFTRuleItem[] = useMemo(() => [
    {
      id: 'rule-profit-target',
      title: 'Profit Target (Challenge Phase)',
      category: 'evaluation',
      categoryLabel: 'Evaluation Phase',
      badge: 'Goal',
      status: 'info',
      statusLabel: 'Mandatory Goal',
      summary: 'Profit threshold required to unlock funded stage. No time limit.',
      details:
        'Traders must reach the target based on initial starting capital with all open positions closed. Pay After You Pass requires 4%; 1-Step Fast requires 10%; 2-Step Classic requires 8% (Phase 1) and 5% (Phase 2); Blitz requires 7% (Phase 1) and 5% (Phase 2); Futures requires 6%. There is no maximum time limit to achieve the target.',
      calcValue: (c) =>
        `On a ${fmt(c)} account, target is +${fmt((c * (programConfig.evalTarget || 4)) / 100)} (target equity: ${fmt(
          c + (c * (programConfig.evalTarget || 4)) / 100
        )}).`,
      sourceDoc: 'GFT Model Specifications & FAQ 13860595',
    },
    {
      id: 'rule-daily-drawdown',
      title: 'Daily Drawdown (Evaluation vs Funded)',
      category: 'evaluation',
      categoryLabel: 'Drawdown Engine',
      badge: 'Limit',
      status: 'breach',
      statusLabel: 'Hard Breach',
      summary:
        'Zero daily drawdown during Pay After Pass evaluation! Resets daily at 5:00 PM EST (00:00 server rollover).',
      details:
        'Pay After You Pass features ZERO daily drawdown during the evaluation stage. For Classic, Blitz, and Fast models, daily loss is 4% (3% in funded stage). Resets strictly at 5:00 PM Eastern Standard Time (00:00 server rollover). Calculated based on the higher of balance or equity at the moment of rollover. If floating equity falls below this floor during active trading, account is closed immediately.',
      exactClause:
        'Daily loss resets at 5 PM EST / 00:00 server time. Breach occurs if floating equity touches the calculated daily loss floor.',
      calcValue: (c) =>
        evalDailyLossPct === 0
          ? `Pay After Pass Challenge: 0% Daily Loss Limit (No daily breach floor!). Funded Master: 3% = ${fmt(c * 0.03)} max daily loss.`
          : `Challenge Daily Cap: ${evalDailyLossPct}% = ${fmt((c * evalDailyLossPct) / 100)} (Breach floor: ${fmt(c - (c * evalDailyLossPct) / 100)}).`,
      sourceDoc: 'GFT Terms & Conditions & FAQ 12687827',
    },
    {
      id: 'rule-max-drawdown',
      title: 'Maximum Drawdown (Trailing vs Static Floor)',
      category: 'evaluation',
      categoryLabel: 'Drawdown Engine',
      badge: 'Limit',
      status: 'breach',
      statusLabel: 'Hard Breach',
      summary:
        '2-Step Classic features a permanent STATIC floor. 1-Step and Blitz feature a Trailing floor that locks at initial balance.',
      details:
        '2-Step Classic has an 8% STATIC drawdown floor that never trails up as you earn profit (initial floor remains fixed forever). Pay After Pass (8% eval, 6% funded) and 1-Step Fast (6%) use a Trailing Drawdown evaluated at 5 PM EST rollover based on highest equity/balance. Once trailing floor reaches starting balance, it permanently locks and never moves higher. After a withdrawal, it resets to 6% below initial balance.',
      calcValue: (c) =>
        `On ${fmt(c)}, maximum total loss is ${fmt((c * programConfig.evalMaxLoss) / 100)}. Starting loss floor is ${fmt(c - (c * programConfig.evalMaxLoss) / 100)}.`,
      sourceDoc: 'GFT FAQ 10742114 & Model Specifications',
    },
    {
      id: 'rule-consistency-rule',
      title: 'Consistency Rule (20% Single-Day Profit Cap)',
      category: 'funded',
      categoryLabel: 'Funded Rules',
      badge: 'Payout Term',
      status: 'warning',
      statusLabel: 'Withdrawal Delay Only',
      summary:
        'Active only on funded accounts (Pay Later & Instant Standard). Best day must not exceed 20% of total profit. NEVER breaches account.',
      details:
        'Applies ONLY to funded accounts where designated (0% consistency on Instant Premium and 2-Step Classic). Your most profitable single trading day must account for no more than 20% of your total payout profit. CRITICAL GFT GUARANTEE: Violating the consistency rule NEVER closes or breaches your account. Your payout is simply paused while you continue trading to balance out the profit distribution across subsequent trading days.',
      exactClause:
        'The consistency rule applies strictly to funded stages. If your highest day represents >20% of total profit, the account is not breached; you simply trade more days to bring the ratio into compliance.',
      calcValue: (c) =>
        `If you request a payout of $5,000 profit on ${fmt(c)}, no single calendar day can have generated more than $1,000 (20%) of that $5,000 profit pool.`,
      sourceDoc: 'GFT FAQ 15290379 & Help Article',
    },
    {
      id: 'rule-zero-consistency-models',
      title: 'Instant Premium & Standard: ZERO Consistency Rule',
      category: 'funded',
      categoryLabel: 'Funded Rules',
      badge: 'Advantage',
      status: 'allowed',
      statusLabel: '100% Unrestricted',
      summary:
        'Instant Premium ⚡ and 2-Step Classic have ZERO consistency rule in evaluation or funded stages.',
      details:
        'Traders on Instant Premium or 2-Step Classic can generate 90%+ of their profits on a single news breakout or trending session. Payout requests are approved immediately without requiring balanced distribution across multiple days.',
      sourceDoc: 'GFT Model Specifications & Instant Funding Rules',
    },
    {
      id: 'rule-min-days',
      title: 'Minimum Trading Days (Evaluation vs Funded)',
      category: 'evaluation',
      categoryLabel: 'Evaluation & Funded',
      badge: 'Time Policy',
      status: 'allowed',
      statusLabel: 'Pass in 1 Trade',
      summary:
        '0 Minimum days in evaluation (pass in 1 trade). 3 active trading days (with ≥0.5% profit each) required before first funded payout.',
      details:
        'Evaluation Stage: Zero minimum trading days across all GFT challenges. You can pass the evaluation in a single trading session if the profit target is hit. Funded Stage: On Pay After You Pass and Instant Funding, traders must log at least 3 active trading days where each day produces ≥0.5% profit of initial capital before submitting their first payout request.',
      calcValue: (c) =>
        `Funded qualifying day on ${fmt(c)}: Each trading day must log at least +${fmt(c * 0.005)} in closed profits to count toward the 3-day minimum.`,
      sourceDoc: 'GFT FAQ 13860595 & Pay Later Model',
    },
    {
      id: 'rule-time-limit',
      title: 'Unlimited Trading Period & Inactivity Policy',
      category: 'evaluation',
      categoryLabel: 'Evaluation & Funded',
      badge: 'Time Policy',
      status: 'info',
      statusLabel: 'No Time Limit',
      summary:
        'No calendar deadline to pass. Accounts remain active as long as at least 1 trade is placed every 30 consecutive calendar days.',
      details:
        'GFT imposes no maximum time limits or calendar deadlines to hit the evaluation target. To prevent account archiving due to inactivity, traders must place or close at least one trade every 30 calendar days (recommended buffer: 29 days). On Instant Pro, an active trade every 7 days is recommended.',
      sourceDoc: 'GFT FAQ 10742197 & Model Rules',
    },
    {
      id: 'rule-stop-loss',
      title: 'Stop Loss & Take Profit Requirement',
      category: 'trading',
      categoryLabel: 'Trading Conditions',
      badge: 'Risk Policy',
      status: 'allowed',
      statusLabel: '100% Optional',
      summary:
        'Stop loss is NOT mandatory on any Goat Funded Trader account type (evaluation or funded).',
      details:
        'Official Help Center Article 10742069 confirms: "Is it Mandatory to use stop loss and take profit? No, it is not mandatory." Traders have full autonomy over stop placement, lot sizing, and manual execution. However, automated drawdown and daily loss floors remain hard-enforced.',
      sourceDoc: 'GFT Help Center Article 10742069',
    },
    {
      id: 'rule-weekend-holding',
      title: 'Overnight & Weekend Position Holding',
      category: 'trading',
      categoryLabel: 'Trading Conditions',
      badge: 'Execution',
      status: 'allowed',
      statusLabel: 'Allowed Across All Stages',
      summary:
        'Holding trades overnight and over the weekend is 100% permitted across evaluation and funded accounts.',
      details:
        'Traders can hold positions over weekends and market closes across Forex, Indices, Commodities, and Crypto. Official FAQ 10742082 states: "Can I hold trades over the weekend? Yes, holding trades overnight and over the weekend is fully allowed — both in the evaluation and funded stages."',
      sourceDoc: 'GFT FAQ 10742082',
    },
    {
      id: 'rule-crypto-architecture',
      title: 'Integrated Crypto Trading (No Standalone Evaluation)',
      category: 'trading',
      categoryLabel: 'Trading Conditions',
      badge: 'Multi-Asset',
      status: 'allowed',
      statusLabel: '500+ Crypto Pairs 24/7',
      summary:
        'No separate crypto challenge. 500+ crypto pairs are built directly into CFD accounts with 1:5 leverage, 0% commissions, and 24/7 weekend execution.',
      details:
        'Goat Funded Trader does not market a separate "Crypto Evaluation". Instead, 500+ cryptocurrency pairs (BTC, ETH, SOL, XRP, DOGE, altcoins) are integrated directly into all CFD accounts on Volumetrica FX, cTrader, MT5, MatchTrader, and TradeLocker. Crypto markets trade 24/7 through weekends with fixed 1:5 leverage and 0% raw commissions.',
      sourceDoc: 'GFT Product Architecture & Model Specifications',
    },
    {
      id: 'rule-leverage-breakdown',
      title: 'Leverage Schedule by Asset Class',
      category: 'trading',
      categoryLabel: 'Trading Conditions',
      badge: 'Margin',
      status: 'info',
      statusLabel: 'Fixed Schedule',
      summary:
        '1:100 Forex (1:50 funded Pay Later), 1:5 Crypto (24/7), 1:40 Metals, 1:20 Indices, 1:5 Equity CFDs.',
      details:
        'Forex Majors/Minors: 1:100 (Evaluation), 1:50 (Pay Later Funded Master); Cryptocurrencies: 1:5; Precious Metals (XAU/XAG) & Commodities: 1:40; Equity Indices: 1:20; Single Share Equity CFDs: 1:5. Futures accounts operate on standard CME exchange margin via Tradovate & NinjaTrader.',
      sourceDoc: 'GFT FAQ 10741910',
    },
    {
      id: 'rule-news-trading',
      title: 'News Trading Policy & 1% Profit Cap',
      category: 'trading',
      categoryLabel: 'Execution',
      badge: 'News Policy',
      status: 'warning',
      statusLabel: 'Unrestricted Eval / 1% Funded Cap',
      summary:
        '100% unrestricted in evaluation. In funded stage, positions held through news are allowed; trades opened/closed within news window have a 1% profit cap.',
      details:
        'Evaluation Stage: News trading is completely unrestricted. Trade high-impact red-folder news events freely. Funded Master Stage: Holding swing positions through news is permitted. However, opening or closing trades within 2 minutes before/after major high-impact economic events is subject to a 1% profit cap. Profits exceeding 1% generated during this window are deducted at withdrawal review; it is NEVER a hard breach.',
      sourceDoc: 'GFT FAQ 10742084 & 10064672',
    },
    {
      id: 'rule-margin-80-gambling',
      title: '80% Margin Rule (All-or-Nothing Gambling Clause)',
      category: 'prohibited',
      categoryLabel: 'Prohibited Practices',
      badge: 'Trap Warning',
      status: 'breach',
      statusLabel: 'Profit Deduction Risk',
      summary:
        'Using >80% of available account margin on concurrent open positions is classified as gambling under Section 4.4.',
      details:
        'Section 4.4 of GFT Terms & Conditions explicitly forbids "All-or-Nothing Trading, where you can lose the account in one trade." If total used margin across active positions exceeds 80% of account capacity, GFT risk auditors flag the account as reckless gambling. Profits earned during that cycle can be voided upon payout request.',
      exactClause:
        'Prohibited Trading includes: "All-or-Nothing Trading, where you can lose the account in one trade" and "Any trading style that we deem too risky will result in a retake or profit deduction."',
      calcValue: (c) =>
        `On your ${fmt(c)} account, keep aggregate used margin strictly below ${fmt(c * 0.8)} to avoid gambling flags.`,
      sourceDoc: 'GFT Terms & Conditions Section 4.4',
    },
    {
      id: 'rule-equity-earnings-release',
      title: 'Single Share Equity CFDs: 3:50 PM ET Earnings Rule',
      category: 'prohibited',
      categoryLabel: 'Prohibited Practices',
      badge: 'Hard Breach',
      status: 'breach',
      statusLabel: 'Immediate Hard Breach',
      summary:
        'Must close all Single Share Equity CFD positions by 3:50 PM Eastern Time before earnings releases. Holding into earnings terminates the account.',
      details:
        'Holding a Single Share Equity CFD into an earnings release for that stock is an immediate hard breach. You must close all positions by 3:50 PM Eastern on the day of an aftermarket release, or the preceding day for before-market-open release. Any gain or loss is removed and the account is breached.',
      exactClause:
        'Holding a Single Share Equity CFD position into an earnings release pertaining to that underlying equity. To avoid breach, close positions by 3:50 pm Eastern Time. Violation constitutes an immediate, hard breach.',
      sourceDoc: 'GFT Terms & Conditions Section 4.4',
    },
    {
      id: 'rule-drawdown-protection-floating',
      title: 'Drawdown Protection: 2% Floating Open Loss Rule',
      category: 'trading',
      categoryLabel: 'Trading Conditions',
      badge: 'Risk Limit',
      status: 'warning',
      statusLabel: 'Risk Engine Alert',
      summary:
        'Open positions must not exceed -2% floating unrealized loss of starting capital at any time.',
      details:
        'GFT implements an automated risk limitation monitor: active open floating loss across running positions should not exceed -2% of the initial capital balance. Exceeding this threshold flags the account for risk review.',
      calcValue: (c) =>
        `Floating unrealized loss limit on ${fmt(c)}: Keep floating loss above -${fmt(c * 0.02)} at all times.`,
      sourceDoc: 'GFT Help Article 10742114 (Risk Limitation Policy)',
    },
    {
      id: 'rule-eas-algo-trading',
      title: 'Expert Advisors (EAs) & Strategy Switching Policy',
      category: 'trading',
      categoryLabel: 'Trading Conditions',
      badge: 'Algo Policy',
      status: 'warning',
      statusLabel: 'Standard EAs Allowed',
      summary:
        'Normal EAs allowed. Banned: High-frequency trading (HFT), latency arbitrage, Gold Arbitrage EAs, passing bots, and strategy switching.',
      details:
        'Standard algorithmic trading and indicators are permitted. Strictly prohibited under Section 4.4: HFT latency bots, Gold Arbitrage EAs, and tick scalping under 2 minutes that exploits data feed lag. Strategy switching rule: Traders are prohibited from passing an evaluation with an automated EA and then switching to manual trading in funded (or vice versa).',
      exactClause:
        'Prohibited: "Use of EAs with high-frequency trading (HFT) strategies, Gold Arbitrage EA and any usage involving Prohibited Practices" and "Utilize one strategy to pass an assessment and then utilizing a different strategy in a funded account."',
      sourceDoc: 'GFT Terms & Conditions Section 4.4 & FAQ 10749630',
    },
    {
      id: 'rule-copy-trading-accounts',
      title: 'Copy Trading & Multiple Registered Accounts',
      category: 'trading',
      categoryLabel: 'Trading Conditions',
      badge: 'Account Limits',
      status: 'warning',
      statusLabel: 'Personal Copying Allowed',
      summary:
        'Copying trades between your own personal GFT accounts is allowed. Third-party passing services and reverse hedging are strictly banned.',
      details:
        'Traders can manage up to $400,000 in initial challenge accounts (scalable to $2,000,000). You can copy trades between your own accounts. Prohibited: Copying trades from external third parties, using commercial account passing services, or executing opposing hedging positions (long on one account, short on another) across GFT or other prop firms.',
      sourceDoc: 'GFT Terms Section 4.4 & FAQ 14424149 / 14588703',
    },
    {
      id: 'rule-ip-address-vpn',
      title: 'IP Address, Shared Device & Anti-Collusion Policy',
      category: 'prohibited',
      categoryLabel: 'Prohibited Practices',
      badge: 'Compliance',
      status: 'breach',
      statusLabel: 'Account Termination',
      summary:
        'Do not share devices, trade from public Wi-Fi, or use commercial VPNs matching other registered traders.',
      details:
        'Section 4.4 and FAQ 10742103 ban sharing trading devices or logging into accounts from identical IP addresses as other traders. Public Wi-Fi networks and commercial VPNs often assign shared IP addresses that trigger automated anti-collusion alarms, resulting in account closure without refund.',
      sourceDoc: 'GFT Help Article 10742103 & 12921537',
    },
    {
      id: 'rule-scaling-plan',
      title: '$2,000,000 Scaling Plan (Compound Growth)',
      category: 'scaling',
      categoryLabel: 'Scaling & Loyalty',
      badge: 'Growth',
      status: 'allowed',
      statusLabel: '+25% Capital Every 4 Months',
      summary:
        'Generate 10% net profit over 4 months to receive a +25% capital increase, compounding up to $2,000,000 with up to 100% profit split.',
      details:
        'Traders who generate a cumulative 10% net profit over a 4-month evaluation period qualify for an automatic +25% increase in account size. As your capital scales up to the $2M ceiling, your profit split increases from 80% to 90%, 95%, and up to 100%. Risk drawdown parameters expand proportionally with your new balance.',
      calcValue: (c) =>
        `Starting from ${fmt(c)}: Stage 1 = ${fmt(c * 1.25)} (+25%), Stage 2 = ${fmt(c * 1.25 * 1.25)}, Stage 3 = ${fmt(
          c * 1.25 * 1.25 * 1.25
        )}, continuing up to $2,000,000 max.`,
      sourceDoc: 'GFT Official Scaling Plan Publication (Oct 2024)',
    },
    {
      id: 'rule-goat-fidelity-program',
      title: 'GOAT Fidelity Loyalty Program',
      category: 'scaling',
      categoryLabel: 'Scaling & Loyalty',
      badge: 'Loyalty',
      status: 'allowed',
      statusLabel: '4 Purchases = 50% Off · 9 = 10th Free',
      summary:
        'Purchase 4 challenges to get 50% off your most frequent size. Purchase 9 challenges to get the 10th challenge 100% FREE.',
      details:
        'Launched September 14, 2023. Benefit 1: Traders who purchase 4 or more challenges receive a 50% discount on their most purchased account size. Benefit 2: Traders who reach 9 challenge purchases receive their 10th challenge 100% free (in their most frequently bought size). Claimed directly via 24/7 live support.',
      sourceDoc: 'GFT Official Fidelity Program Publication (0352)',
    },
    {
      id: 'rule-payout-terms-guarantee',
      title: 'Payout Terms & $1,000 Reward Delay Guarantee',
      category: 'payouts',
      categoryLabel: 'Rewards & Payouts',
      badge: 'Guarantee',
      status: 'allowed',
      statusLabel: '$1,000 Delay Guarantee',
      summary:
        '80% to 100% profit split. $100 min payout, $15,000 cap per cycle. If payout takes >2 business days, GFT adds an extra $1,000 cash.',
      details:
        'Withdrawals processed bi-weekly (or on-demand; 10-day cycle on Instant Premium). Minimum withdrawal: $100. Single withdrawal cap: $15,000 per cycle. Official GFT Reward Delay Guarantee: If an approved payout takes longer than 2 business days (or 24 hours on eligible on-demand tracks), GFT adds an extra $1,000 USD to your payment. Gateways: Crypto (BTC, USDT ERC20/TRC20), Rise, Skrill, and Bank Wire.',
      sourceDoc: 'GFT Rewards Page & Terms of Service',
    },
    {
      id: 'rule-all-trades-closed',
      title: 'All Positions & Pending Orders Must Be Closed for Payout',
      category: 'payouts',
      categoryLabel: 'Rewards & Payouts',
      badge: 'Payout Condition',
      status: 'warning',
      statusLabel: 'Required for Withdrawal',
      summary:
        'All active market positions and pending limit/stop orders must be closed before submitting a reward request.',
      details:
        'Submitting a payout request while any open trade or pending order remains active triggers an automatic gateway rejection. Traders must close all positions before requesting funds.',
      sourceDoc: 'GFT Payout Guidelines (FAQ 10742264)',
    },
  ], [evalDailyLossPct, programConfig]);

  // Filtered encyclopedia rules based on natural language search, category, model, stage, and status
  const filteredEncyclopediaRules = useMemo(() => {
    // Natural Language Query Normalizer
    const rawQ = encyclopediaSearch.toLowerCase().trim();
    const cleanQ = rawQ
      .replace(/[?.,!]/g, '')
      .replace(/^(can i|is it|is|what is|what are|when does|how many|what happens if i|how do i)\s+/g, '')
      .trim();

    return gftRulesDatabase.filter((rule) => {
      // 1. Category filter
      const matchesCat = activeCategory === 'all' || rule.category === activeCategory;
      if (!matchesCat) return false;

      // 2. Stage filter (Evaluation vs Funded Master)
      if (selectedStage !== 'all') {
        if (rule.stage && rule.stage !== 'both' && rule.stage !== selectedStage) {
          // If rule is specifically for evaluation or funded only
          if (rule.category === 'evaluation' && selectedStage === 'funded') return false;
          if (rule.category === 'funded' && selectedStage === 'evaluation') return false;
        }
      }

      // 3. Status filter (Allowed / Warning / Breach)
      if (ruleStatusFilter !== 'all' && rule.status !== ruleStatusFilter) {
        return false;
      }

      // 4. Model applicability filter (if specified on the rule)
      if (rule.models && rule.models.length > 0 && !rule.models.includes(selectedProgram) && !rule.models.includes('all')) {
        return false;
      }

      // 5. Search matching
      if (!rawQ) return true;

      // Natural language synonyms & intent expansion
      const intentMatches = (() => {
        if (rawQ.includes('news') || cleanQ.includes('news')) {
          return rule.id.includes('news');
        }
        if (rawQ.includes('overnight') || rawQ.includes('weekend') || cleanQ.includes('weekend') || cleanQ.includes('overnight')) {
          return rule.id.includes('weekend');
        }
        if (rawQ.includes('hedg') || cleanQ.includes('hedg')) {
          return rule.id.includes('hedging');
        }
        if (rawQ.includes('ea') || rawQ.includes('bot') || rawQ.includes('algo') || cleanQ.includes('ea') || cleanQ.includes('bot')) {
          return rule.id.includes('ea');
        }
        if (rawQ.includes('copy') || cleanQ.includes('copy') || rawQ.includes('signal')) {
          return rule.id.includes('copy');
        }
        if (rawQ.includes('maximum drawdown') || rawQ.includes('max drawdown') || rawQ.includes('max loss') || cleanQ.includes('max drawdown')) {
          return rule.id.includes('max-drawdown');
        }
        if (rawQ.includes('daily drawdown') || rawQ.includes('daily loss') || rawQ.includes('reset') && rawQ.includes('daily')) {
          return rule.id.includes('daily-drawdown');
        }
        if (rawQ.includes('payout') && (rawQ.includes('day') || rawQ.includes('how many') || rawQ.includes('min'))) {
          return rule.id.includes('min-days') || rule.id.includes('valid-day');
        }
        if (rawQ.includes('80%') || rawQ.includes('margin') || rawQ.includes('gambl')) {
          return rule.id.includes('margin-80');
        }
        if (rawQ.includes('refund') || rawQ.includes('fee')) {
          return rule.id.includes('fee-refund') || rule.id.includes('registration');
        }
        if (rawQ.includes('crypto') || cleanQ.includes('crypto')) {
          return rule.id.includes('crypto');
        }
        if (rawQ.includes('goat guard') || rawQ.includes('guard')) {
          return rule.id.includes('goat-guard');
        }
        if (rawQ.includes('3000') || rawQ.includes('profit cap') || rawQ.includes('3k')) {
          return rule.id.includes('profit-cap');
        }
        if (rawQ.includes('vps') || cleanQ.includes('vps')) {
          return rule.id.includes('vps');
        }
        if (rawQ.includes('2 min') || rawQ.includes('120') || rawQ.includes('sub-2') || cleanQ.includes('minute')) {
          return rule.id.includes('sub-2');
        }
        return false;
      })();

      if (intentMatches) return true;

      // Direct text and keyword match
      const searchTargets = [
        rule.title,
        rule.summary,
        rule.details,
        rule.categoryLabel,
        rule.exactClause || '',
        rule.sourceDoc,
        rule.conflictNotice || '',
        rule.conflictDetails || '',
        rule.calcValue ? rule.calcValue(selectedCapital) : '',
        ...(rule.keywords || []),
      ].map((t) => t.toLowerCase());

      const tokens = (cleanQ || rawQ).split(/\s+/).filter(Boolean);
      return tokens.every((token) => searchTargets.some((target) => target.includes(token)));
    });
  }, [gftRulesDatabase, activeCategory, encyclopediaSearch, selectedStage, ruleStatusFilter, selectedProgram, selectedCapital]);

  // Dynamic scaling plan ladder steps calculation
  const scalingLadder = useMemo(() => {
    const steps = [];
    let currentCapital = scalingStartSize;
    let split = 80;
    for (let i = 1; i <= 6; i++) {
      const profitNeeded = currentCapital * 0.1;
      const nextCapital = Math.min(2000000, Math.round(currentCapital * 1.25));
      steps.push({
        step: i,
        capital: currentCapital,
        target10Pct: profitNeeded,
        profitSplit: split,
        maxTrailingLoss: currentCapital * 0.06,
        dailyLoss: currentCapital * 0.03,
      });
      if (currentCapital >= 2000000) break;
      currentCapital = nextCapital;
      if (i === 1) split = 85;
      else if (i === 2) split = 90;
      else if (i === 3) split = 95;
      else split = 100;
    }
    return steps;
  }, [scalingStartSize]);

  return (
    <div className="min-h-screen bg-[#080A10] text-slate-100 font-sans pb-24 selection:bg-[#a3e635]/20 selection:text-[#a3e635]">
      {/* ══ STICKY NAVIGATION BAR ══ */}
      <div className="border-b border-white/[0.08] bg-[#0c0e14]/90 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => onNavigate('/prop-firms/goat-funded-trader')}
              className="inline-flex items-center gap-1.5 text-xs text-white/60 hover:text-white transition-colors px-2.5 py-1.5 rounded-lg hover:bg-white/[0.06]"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Back to Goat Funded Trader</span>
              <span className="sm:hidden">Back</span>
            </button>
            <span className="text-white/20">|</span>
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#a3e635]/10 border border-[#a3e635]/30 text-[11px] font-bold text-[#a3e635]">
              <Sparkles className="w-3 h-3" />
              <span>Official Rules &amp; Model Intelligence</span>
            </div>
          </div>

          <div className="flex items-center gap-1 bg-[#111318] p-1 rounded-xl border border-[#1F2228] text-xs font-mono">
            <button
              onClick={() => onNavigate('/prop-firms/goat-funded-trader')}
              className="px-2.5 py-1 rounded-lg text-white/60 hover:text-white transition-colors cursor-pointer"
              title="Open Official Rules Intelligence"
            >
              Rules Hub
            </button>
            <span className="px-2.5 py-1 rounded-lg bg-[#151c14] border border-[#a3e635]/40 text-[#a3e635] font-semibold">
              Visual Matrix
            </span>
            <button
              onClick={() => onNavigate('/prop-firms/goat-funded-trader/classic')}
              className="px-2.5 py-1 rounded-lg text-white/60 hover:text-white transition-colors cursor-pointer"
              title="Open Classic Profile"
            >
              Classic Profile
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
        {/* ══ FIRM BRAND HEADER WITH REAL CREDENTIALS ══ */}
        <div className="p-5 sm:p-6 rounded-2xl bg-[#0e1017] border border-[#1b1e28] flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xl">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white p-1.5 flex items-center justify-center shrink-0 shadow-md">
              <img
                src={firm.logoUrl || firm.countryFlag}
                alt={firm.name}
                className="w-full h-full object-contain"
              />
            </div>
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                  {firm.name}
                </h2>
                <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  Grade {firm.confidenceRating} Verified
                </span>
                <span className="px-2 py-0.5 text-xs font-semibold rounded bg-white/[0.06] text-white/70">
                  {firm.status}
                </span>
                <span className="px-2 py-0.5 text-xs font-mono font-semibold rounded bg-sky-500/10 text-sky-300 border border-sky-500/20">
                  100% Profit Split Available
                </span>
              </div>
              <p className="text-xs text-white/50">
                Founded {firm.foundedYear} • CEO: <strong className="text-white">{firm.ceoName}</strong> • HQ: {firm.headquarters} • Legal: Wishes Tower International Ltd (HK 76428795) &amp; Goat Funded LTD (Saint Lucia 2025-00240)
              </p>
              <div className="flex flex-wrap items-center gap-3 pt-0.5 text-xs">
                <a
                  href={firm.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white/80 hover:text-white underline flex items-center gap-1"
                >
                  Official Site <ExternalLink className="w-3 h-3" />
                </a>
                <span className="text-white/30">•</span>
                <span className="text-white/50">{firm.totalPayoutsReported} paid in rewards</span>
                <span className="text-white/30">•</span>
                <span className="text-emerald-400 font-medium">24h / 2-day delay guarantee: $1,000 extra</span>
              </div>
            </div>
          </div>

          {/* ACTIVE PROMO */}
          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between gap-3 shrink-0">
            <div>
              <span className="text-[10px] uppercase font-bold text-amber-400 block">
                Official Promo (40% OFF + BOGO)
              </span>
              <span className="text-xs text-white font-mono font-bold">
                BOGO40 • New: FIRSTGFT • PayLater: BOGO35
              </span>
            </div>
            <button
              onClick={() => handleCopyCode('BOGO40')}
              className="px-3 py-1.5 text-xs font-mono font-bold rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 flex items-center gap-1 transition-colors shadow-sm"
            >
              {copiedPromo ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedPromo ? 'Copied!' : 'Copy'}</span>
            </button>
          </div>
        </div>

        {/* ══ "OUR RULES" MAIN HEADER ══ */}
        <div className="text-center space-y-3 pt-2">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight">
            Our Rules
          </h1>
          <p className="text-sm sm:text-base text-white/60 max-w-2xl mx-auto leading-relaxed">
            Everything you need to know about Goat Funded Trader accounts, in one place. No hidden rules, full contract terms, and verified operational math.
          </p>
        </div>

        {/* ══ CRUCIAL CLARIFICATION: CRYPTO INTEGRATION (NO SEPARATE CRYPTO EVALUATION) ══ */}
        <div className="p-4 sm:p-5 rounded-2xl bg-[#0f1422] border border-sky-500/30 shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-sky-500/5 rounded-full blur-3xl pointer-events-none" />
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-sky-500/15 border border-sky-500/30 flex items-center justify-center shrink-0 text-sky-400 mt-0.5">
                <Coins className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-1.5">
                    Does Goat Funded Trader have a separate Crypto evaluation?
                  </h3>
                  <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-sky-500/20 text-sky-300 border border-sky-500/40">
                    Integrated Architecture
                  </span>
                </div>
                <p className="text-xs text-white/70 leading-relaxed">
                  <strong>No separate Crypto-only challenge exists.</strong> Goat Funded Trader does not sell a standalone crypto evaluation tier. Instead, <strong>over 500+ cryptocurrency pairs (via Volumetrica FX &amp; MT5) are fully integrated into all Forex / CFD accounts</strong> with 24/7 weekend trading, 1:5 crypto leverage, and $0 commissions.
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowCryptoInfo(!showCryptoInfo)}
              className="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-sky-500/10 hover:bg-sky-500/20 text-sky-300 border border-sky-500/30 shrink-0 transition-colors flex items-center gap-1.5 self-start sm:self-center"
            >
              <Info className="w-3.5 h-3.5" />
              <span>{showCryptoInfo ? 'Hide Crypto Details' : 'View Crypto Trading Rules'}</span>
            </button>
          </div>

          {showCryptoInfo && (
            <div className="mt-4 pt-4 border-t border-sky-500/20 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-[#0a0d16] border border-white/[0.06] space-y-1">
                <span className="text-[11px] font-bold text-sky-400 block uppercase tracking-wider font-mono">
                  500+ Crypto Pairs
                </span>
                <p className="text-white/70">
                  Trade BTC, ETH, SOL and 500+ altcoins on Volumetrica FX, cTrader, MT5, MatchTrader, and TradeLocker.
                </p>
              </div>
              <div className="p-3 rounded-xl bg-[#0a0d16] border border-white/[0.06] space-y-1">
                <span className="text-[11px] font-bold text-sky-400 block uppercase tracking-wider font-mono">
                  24/7 Weekend Trading
                </span>
                <p className="text-white/70">
                  Crypto trades uninterrupted Saturday &amp; Sunday. Weekend holding is 100% permitted across all evaluation and funded stages.
                </p>
              </div>
              <div className="p-3 rounded-xl bg-[#0a0d16] border border-white/[0.06] space-y-1">
                <span className="text-[11px] font-bold text-sky-400 block uppercase tracking-wider font-mono">
                  1:5 Leverage &amp; 0% Commission
                </span>
                <p className="text-white/70">
                  Leverage is fixed at 1:5 for crypto assets, with 0% raw commission on crypto and index instruments.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* ══ REAL GFT MARKET & PROGRAM SELECTORS ══ */}
        <div className="space-y-4">
          {/* 1. TOP MARKET SELECTOR: Real GFT Categories (Forex / CFDs vs Futures) */}
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={() => setSelectedAsset('forex')}
              className={`px-5 py-2.5 rounded-full text-xs font-semibold transition-all flex items-center gap-2 border ${
                selectedAsset === 'forex'
                  ? 'bg-[#151c14] border-[#a3e635] text-[#a3e635] shadow-[0_0_15px_rgba(163,230,53,0.15)] ring-1 ring-[#a3e635]/30'
                  : 'bg-[#10131a] border-[#1f2430] text-white/70 hover:text-white hover:border-white/20'
              }`}
            >
              <Globe className="w-3.5 h-3.5" />
              <span>Forex / CFDs</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-white/10 text-white/60 font-normal">
                FX · 500+ Crypto · Indices · Metals · Stocks
              </span>
            </button>

            <button
              onClick={() => setSelectedAsset('futures')}
              className={`px-5 py-2.5 rounded-full text-xs font-semibold transition-all flex items-center gap-2 border ${
                selectedAsset === 'futures'
                  ? 'bg-[#151c14] border-[#a3e635] text-[#a3e635] shadow-[0_0_15px_rgba(163,230,53,0.15)] ring-1 ring-[#a3e635]/30'
                  : 'bg-[#10131a] border-[#1f2430] text-white/70 hover:text-white hover:border-white/20'
              }`}
            >
              <Rocket className="w-3.5 h-3.5" />
              <span>Futures</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-white/10 text-white/60 font-normal">
                CME · Tradovate · NinjaTrader
              </span>
            </button>
          </div>

          {/* 2. REAL GFT PROGRAMS ROW (When in Forex/CFDs) */}
          {selectedAsset === 'forex' && (
            <div className="space-y-3">
              {/* 1. Expandable Category Tabs (Pay Later, 1-Step, 2-Step, 3-Step, Instant Funding, Legacy / Archived) */}
              <div className="flex flex-wrap items-center justify-center gap-2">
                {GFT_CATEGORIES.map((cat) => {
                  const active = selectedCategory === cat.id;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => handleSelectCategory(cat.id)}
                      className={`px-4 py-2.5 rounded-full text-xs font-semibold transition-all border flex items-center gap-2 ${
                        active
                          ? 'bg-[#151c14] border-[#a3e635] text-[#a3e635] shadow-[0_0_15px_rgba(163,230,53,0.15)] ring-1 ring-[#a3e635]/30'
                          : 'bg-[#10131a] border-[#1f2430] text-white/70 hover:text-white hover:border-white/20'
                      }`}
                    >
                      <span className="font-bold">{cat.label}</span>
                      <span
                        className={`text-[9px] px-1.5 py-0.5 rounded font-mono font-bold ${
                          active ? 'bg-[#a3e635]/20 text-[#a3e635]' : 'bg-white/10 text-white/50'
                        }`}
                      >
                        {cat.badge}
                      </span>
                      <ChevronDown
                        className={`w-3.5 h-3.5 transition-transform duration-200 ${
                          active ? 'rotate-180 text-[#a3e635]' : 'text-white/40'
                        }`}
                      />
                    </button>
                  );
                })}
              </div>

              {/* 2. Account Context Filters (Stage, Purchase Version, Platform) */}
              <div className="flex flex-wrap items-center justify-center gap-3 pt-1 text-xs">
                {/* Stage Selector */}
                <div className="flex items-center gap-1 bg-[#10131b] p-1 rounded-xl border border-[#1d2230]">
                  <span className="text-[10px] text-white/40 uppercase font-mono px-2">Stage:</span>
                  {[
                    { key: 'all', label: 'Both' },
                    { key: 'evaluation', label: 'Evaluation' },
                    { key: 'funded', label: 'Funded Master' },
                  ].map((s) => (
                    <button
                      key={s.key}
                      onClick={() => setSelectedStage(s.key as any)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all ${
                        selectedStage === s.key
                          ? 'bg-[#151c14] text-[#a3e635] border border-[#a3e635]/40'
                          : 'text-white/60 hover:text-white'
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>

                {/* Purchase / Version Date Filter */}
                <div className="flex items-center gap-1 bg-[#10131b] p-1 rounded-xl border border-[#1d2230]">
                  <span className="text-[10px] text-white/40 uppercase font-mono px-2">Version:</span>
                  {[
                    { key: 'current_2026', label: 'Sep 2026 (Current)' },
                    { key: 'pre_aug_2026', label: 'Pre-Aug 2026' },
                  ].map((v) => (
                    <button
                      key={v.key}
                      onClick={() => setSelectedVersion(v.key as any)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all ${
                        selectedVersion === v.key
                          ? 'bg-[#151c14] text-[#a3e635] border border-[#a3e635]/40'
                          : 'text-white/60 hover:text-white'
                      }`}
                    >
                      {v.label}
                    </button>
                  ))}
                </div>

                {/* Trading Platform Filter */}
                <div className="flex items-center gap-1 bg-[#10131b] p-1 rounded-xl border border-[#1d2230]">
                  <span className="text-[10px] text-white/40 uppercase font-mono px-2">Platform:</span>
                  {[
                    { key: 'all', label: 'All' },
                    { key: 'ctrader', label: 'cTrader' },
                    { key: 'matchtrader', label: 'Match-Trader' },
                    { key: 'tradelocker', label: 'TradeLocker' },
                    { key: 'mt5', label: 'MT5' },
                    { key: 'volumetrica', label: 'Volumetrica' },
                  ].map((p) => (
                    <button
                      key={p.key}
                      onClick={() => setSelectedPlatform(p.key as any)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all ${
                        selectedPlatform === p.key
                          ? 'bg-[#151c14] text-[#a3e635] border border-[#a3e635]/40'
                          : 'text-white/60 hover:text-white'
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* 3. Grouped Models Section (Shows ONLY models belonging to the selected category, filtered by Stage, Version, Platform) */}
              {(() => {
                const activeCatObj = GFT_CATEGORIES.find((c) => c.id === selectedCategory);
                if (!activeCatObj) return null;
                const activeFiltersCount =
                  (selectedStage !== 'all' ? 1 : 0) +
                  (selectedVersion !== 'current_2026' ? 1 : 0) +
                  (selectedPlatform !== 'all' ? 1 : 0);

                return (
                  <div className="p-3 sm:p-4 rounded-2xl bg-[#0f121a] border border-[#1e2432] space-y-3 shadow-md">
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/[0.06] pb-2 text-xs">
                      <span className="text-white/70 font-mono text-[11px] uppercase tracking-wider flex items-center gap-1.5">
                        <Layers className="w-3.5 h-3.5 text-[#a3e635]" />
                        <span className="text-white font-bold">{activeCatObj.label}</span>
                        <span className="text-white/40">Models:</span>
                      </span>
                      <div className="flex items-center gap-2 text-[11px] font-mono">
                        <span className="text-white/50">
                          {relevantModels.length} of {activeCatObj.models.length} visible
                        </span>
                        {activeFiltersCount > 0 && (
                          <button
                            onClick={() => {
                              setSelectedStage('all');
                              setSelectedVersion('current_2026');
                              setSelectedPlatform('all');
                            }}
                            className="text-[10px] text-[#a3e635] hover:underline cursor-pointer"
                          >
                            Reset filters
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Filtered Models Pills */}
                    {relevantModels.length > 0 ? (
                      <div className="flex flex-wrap items-center justify-center gap-2">
                        {relevantModels.map((prog) => {
                          const active = selectedProgram === prog.key;
                          return (
                            <button
                              key={prog.key}
                              onClick={() => setSelectedProgram(prog.key as ProgramType)}
                              className={`px-4 py-2 rounded-full text-xs font-semibold transition-all border flex items-center gap-2 ${
                                active
                                  ? 'bg-[#151c14] border-[#a3e635] text-[#a3e635] shadow-[0_0_15px_rgba(163,230,53,0.15)] ring-1 ring-[#a3e635]/30'
                                  : 'bg-[#131620] border-[#222838] text-white/80 hover:text-white hover:border-white/20'
                              }`}
                            >
                              <span className="font-bold">{prog.label}</span>
                              <span
                                className={`text-[9px] px-1.5 py-0.2 rounded font-mono font-bold ${
                                  active ? 'bg-[#a3e635]/20 text-[#a3e635]' : 'bg-white/10 text-white/50'
                                }`}
                              >
                                {prog.badge}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    ) : (
                      /* Informative helper when filters exclude models */
                      <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs flex flex-col sm:flex-row items-center justify-between gap-3">
                        <div className="flex items-center gap-2 text-center sm:text-left">
                          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                          <span>
                            {selectedStage === 'evaluation' && selectedCategory === 'instant'
                              ? 'Instant Funding accounts skip evaluation and begin directly in Funded Master stage.'
                              : selectedPlatform === 'volumetrica' && selectedCategory === 'instant'
                              ? 'Volumetrica FX is exclusive to Evaluation Challenges. Instant accounts trade on cTrader, Match-Trader, MT5 & TradeLocker.'
                              : `No ${activeCatObj.label} models match the active filter criteria.`}
                          </span>
                        </div>
                        <button
                          onClick={() => {
                            setSelectedStage('all');
                            setSelectedPlatform('all');
                            setSelectedVersion('current_2026');
                          }}
                          className="px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer"
                        >
                          Reset Filters
                        </button>
                      </div>
                    )}

                    {/* Active Model Description Snippet */}
                    {(() => {
                      const currentModel = activeCatObj.models.find((m) => m.key === selectedProgram);
                      if (!currentModel) return null;
                      return (
                        <p className="text-[11px] text-white/50 text-center italic font-mono pt-1">
                          {currentModel.sub}
                        </p>
                      );
                    })()}
                  </div>
                );
              })()}
            </div>
          )}

          {/* Futures Mode Explanatory Notice */}
          {selectedAsset === 'futures' && (
            <div className="p-4 rounded-2xl bg-[#0e141f] border border-sky-500/30 text-xs text-sky-200 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-lg">
              <div className="flex items-center gap-2.5">
                <Rocket className="w-4 h-4 text-sky-400 shrink-0" />
                <span>
                  <strong>CME Futures Evaluation:</strong> Direct access to CME, CBOT, NYMEX, and COMEX contracts via <strong>Tradovate, NinjaTrader &amp; TradingView</strong>. Sizing from $25,000 to $150,000 with 6% profit target and EOD trailing drawdown.
                </span>
              </div>
              <button
                onClick={() => setSelectedAsset('forex')}
                className="px-3.5 py-1.5 rounded-lg bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 font-semibold whitespace-nowrap text-xs transition-colors shrink-0 cursor-pointer"
              >
                Switch to Forex / CFDs
              </button>
            </div>
          )}

          {/* Pricing & Offer highlight banner */}
          <div className="flex justify-center">
            <div className="inline-flex flex-wrap items-center justify-center gap-3 px-5 py-2.5 rounded-2xl bg-[#11131a] border border-[#1f2430] text-xs shadow-md">
              <span className="text-white/70">
                Selected: <strong className="text-white">{programConfig.name}</strong> · <span className="text-[#a3e635] font-mono font-bold">{fmt(selectedCapital)}</span>
              </span>
              <span className="text-white/20">•</span>
              {selectedProgram === 'pay_after_pass' ? (
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-[#a3e635]/15 text-[#a3e635] font-mono font-bold">
                    $5.00 Upfront
                  </span>
                  <span className="text-white/70">
                    Pay {fmt(pricingData.feeAfterPass ?? 550)} only after passing (100% refunded on 4th payout)
                  </span>
                </div>
              ) : selectedProgram === 'goat_1' ? (
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-[#a3e635]/15 text-[#a3e635] font-mono font-bold">
                    $1.00 Direct Entry
                  </span>
                  <span className="text-white/70">
                    $1,000 Live Account · 28-day expiration · $100 lifetime withdrawable profit
                  </span>
                </div>
              ) : (
                <div className="flex flex-wrap items-center gap-2">
                  {pricingData.fullPrice && pricingData.fullPrice > pricingData.entryPrice && (
                    <span className="line-through text-white/40 font-mono">
                      ${pricingData.fullPrice}
                    </span>
                  )}
                  <span className="text-[#a3e635] font-bold font-mono">
                    ${pricingData.entryPrice.toFixed(2)}
                  </span>
                  <span className="px-2 py-0.5 rounded bg-[#a3e635]/15 text-[#a3e635] font-mono font-bold text-[10px]">
                    45% OFF · CODE: MATCH45
                  </span>
                  <span className="text-white/50 text-[11px]">
                    {pricingData.refundable ? '(100% Refundable on Reward)' : '(Direct Live Access)'}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ══ STEP 1: AVAILABLE ACCOUNT SIZES ══ */}
        <section className="p-6 sm:p-8 rounded-3xl bg-[#0f1118] border border-[#1b1e29] space-y-6 shadow-xl">
          <div className="flex items-start gap-3">
            <div className="w-7 h-7 rounded-full bg-[#a3e635] text-slate-950 font-black text-sm flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
              1
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                Available Account Sizes
              </h2>
              <p className="text-xs sm:text-sm text-white/50 mt-0.5">
                The simulated capital you'll manage. Scale up to $2,000,000 without paying extra evaluation fees.
              </p>
            </div>
          </div>

          <div
            className={`grid gap-3 sm:gap-4 ${
              sizes.length > 6 ? 'grid-cols-2 sm:grid-cols-4 lg:grid-cols-6' : 'grid-cols-2 sm:grid-cols-4'
            }`}
          >
            {sizes.map((size) => {
              const isSelected = size === selectedCapital;
              return (
                <div
                  key={size}
                  onClick={() => setSelectedCapital(size)}
                  className={`p-4 sm:p-5 rounded-2xl border cursor-pointer transition-all text-center space-y-1 relative group ${
                    isSelected
                      ? 'bg-[#141b14] border-[#a3e635] shadow-[0_0_20px_rgba(163,230,53,0.12)] ring-1 ring-[#a3e635]/40'
                      : 'bg-[#13161f] border-[#1e2330] hover:border-[#2d3446] hover:bg-[#161a25]'
                  }`}
                >
                  {isSelected && (
                    <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[#a3e635] ring-4 ring-[#a3e635]/20" />
                  )}
                  <span
                    className={`text-xl sm:text-2xl font-extrabold font-mono block tracking-tight ${
                      isSelected ? 'text-[#a3e635]' : 'text-white group-hover:text-[#a3e635]/90'
                    }`}
                  >
                    ${size >= 1000 ? `${(size / 1000).toFixed(0)}K` : size}
                  </span>
                  <span className="text-[11px] text-white/50 font-mono block">
                    {fmt(size)}
                  </span>
                </div>
              );
            })}
          </div>
        </section>

        {/* ══ INTERACTIVE PHASE-BY-PHASE RULES MATRIX & MASTER TABLES ══ */}
        <section className="space-y-4">
          <div className="space-y-3 border-b border-white/[0.06] pb-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full bg-white/10 text-white text-xs font-semibold border border-white/[0.06]">
                <Scale className="w-3.5 h-3.5 shrink-0" />
                <span>
                  {activeTableView === 'matrix'
                    ? (isInstantMode ? 'Instant Funding — Live Account Rules' : `${programConfig.name} — Phase-by-Phase Rules Matrix`)
                    : activeTableView === 'eval_table'
                    ? 'Master Evaluation Rulebook — 6 Models Compared Side-by-Side'
                    : 'Complete Instant Funding Rulebook — 5 Models Compared Side-by-Side'}
                </span>
              </div>

              <div className="shrink-0 flex items-center gap-2">
                <span className="text-[11px] font-mono text-white/50 bg-[#111318] px-3 py-1.5 rounded-lg border border-white/[0.06]">
                  Account: <strong className="text-[#a3e635]">{fmt(selectedCapital)}</strong>
                </span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-3">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight leading-tight">
                  {activeTableView === 'matrix'
                    ? (isInstantMode
                        ? `Live Account Rules for ${fmt(selectedCapital)} Instant Funding`
                        : `All Rules — ${programConfig.name} (${fmt(selectedCapital)} Account)`)
                    : activeTableView === 'eval_table'
                    ? 'Master Rule Comparison: 6 Evaluation Models'
                    : 'Complete Instant Funding Table: 5 Models'}
                </h2>
                <p className="text-xs sm:text-sm text-white/50 leading-relaxed max-w-3xl mt-1">
                  {activeTableView === 'matrix'
                    ? (isInstantMode
                        ? 'No evaluation phases exist for Instant Funding. Below are all live account rules that apply from day one.'
                        : 'Rows flagged with DIFF highlight where funded-stage rules change vs evaluation. Tap any row to inspect the dollar math.')
                    : activeTableView === 'eval_table'
                    ? 'Side-by-side comparison of all 6 GFT evaluation models across 20 parameters. Tap any model header to switch your active account.'
                    : 'Side-by-side comparison of all 5 GFT instant funding models across 18 parameters. Includes 0% daily DD and 10-day payout rules.'}
                </p>
              </div>
            </div>

            {/* Table View Switcher Tabs (Exact Same Design Language) */}
            <div className="flex flex-wrap items-center gap-2 pt-2">
              <button
                onClick={() => setActiveTableView('matrix')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all border flex items-center gap-1.5 ${
                  activeTableView === 'matrix'
                    ? 'bg-[#151c14] border-[#a3e635] text-[#a3e635] ring-1 ring-[#a3e635]/30 shadow-sm'
                    : 'bg-[#12151e] border-[#1d2230] text-white/70 hover:text-white hover:border-white/20'
                }`}
              >
                <Scale className="w-3.5 h-3.5" />
                <span>Active Model Matrix ({programConfig.name})</span>
              </button>
              <button
                onClick={() => setActiveTableView('eval_table')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all border flex items-center gap-1.5 ${
                  activeTableView === 'eval_table'
                    ? 'bg-[#151c14] border-[#a3e635] text-[#a3e635] ring-1 ring-[#a3e635]/30 shadow-sm'
                    : 'bg-[#12151e] border-[#1d2230] text-white/70 hover:text-white hover:border-white/20'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Master Rule Table: 6 Evaluation Models (Side-by-Side)</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-white/10 text-white/60 font-mono">6 Models</span>
              </button>
              <button
                onClick={() => setActiveTableView('instant_table')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all border flex items-center gap-1.5 ${
                  activeTableView === 'instant_table'
                    ? 'bg-[#151c14] border-[#a3e635] text-[#a3e635] ring-1 ring-[#a3e635]/30 shadow-sm'
                    : 'bg-[#12151e] border-[#1d2230] text-white/70 hover:text-white hover:border-white/20'
                }`}
              >
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                <span>Complete Table: 5 Instant Funding Models (Side-by-Side)</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-white/10 text-white/60 font-mono">5 Models</span>
              </button>
            </div>
          </div>

          {/* VIEW 1: MASTER EVALUATION COMPARISON TABLE (6 Models) */}
          {activeTableView === 'eval_table' && (
            <div className="overflow-x-auto rounded-xl border border-[#1F2228] bg-[#111318] shadow-2xl overflow-hidden">
              <table className="w-full text-left border-collapse" style={{ minWidth: '980px' }}>
                <thead>
                  <tr className="border-b border-white/[0.06] bg-[#080A10] text-[11px] uppercase tracking-wider font-bold">
                    <th className="p-4 w-56 min-w-[220px] sticky left-0 bg-[#080A10] z-20 text-white/50 border-r border-white/[0.06]">
                      Rule / Metric
                    </th>
                    {GFT_EVAL_MODELS.map((m) => {
                      const isSelected = selectedProgram === m.slug;
                      return (
                        <th
                          key={m.slug}
                          className={`p-4 text-center cursor-pointer transition-colors ${
                            isSelected
                              ? 'bg-[#151c14] border-x border-[#a3e635]/40 text-[#a3e635]'
                              : 'text-white/80 hover:bg-white/[0.02]'
                          }`}
                          onClick={() => {
                            setSelectedProgram(m.slug);
                            setActiveTableView('matrix');
                          }}
                          title="Click to select this model"
                        >
                          <div className="flex flex-col items-center gap-1">
                            <span className="font-bold text-xs text-white flex items-center gap-1">
                              {m.name}
                              {isSelected && (
                                <span className="w-2 h-2 rounded-full bg-[#a3e635] inline-block" />
                              )}
                            </span>
                            <span className="text-[10px] text-white/50 font-normal">{m.tag}</span>
                            <span className="text-[9px] px-2 py-0.5 rounded bg-white/10 text-white/70 font-mono mt-0.5">
                              {isSelected ? 'Active Model' : 'Tap to View Matrix'}
                            </span>
                          </div>
                        </th>
                      );
                    })}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1F2228] text-xs">
                  {[
                    { label: 'Evaluation Phases', key: 'phases' },
                    { label: 'Phase 1 Target', key: 'p1Target' },
                    { label: 'Phase 2 Target', key: 'p2Target' },
                    { label: 'Phase 3 Target', key: 'p3Target' },
                    { label: 'Daily Drawdown (Eval)', key: 'evalDailyDD' },
                    { label: 'Maximum Total Drawdown', key: 'evalMaxDD' },
                    { label: 'Min Days (Phase 1)', key: 'minDaysP1' },
                    { label: 'Min Days (Phase 2)', key: 'minDaysP2' },
                    { label: 'Min Days (Phase 3)', key: 'minDaysP3' },
                    { label: '0.5% Valid-Day Rule', key: 'validDayRule' },
                    { label: 'Evaluation Consistency', key: 'evalConsistency' },
                    { label: 'Max Daily Profit (Eval)', key: 'maxDailyProfitEval' },
                    { label: 'Goat Guard (Floating Risk)', key: 'goatGuard' },
                    { label: 'Funded Daily Drawdown', key: 'fundedDailyDD' },
                    { label: 'Funded Max Drawdown', key: 'fundedMaxDD' },
                    { label: 'Funded Valid Days / Payout', key: 'fundedValidDays' },
                    { label: 'Funded Consistency Rule', key: 'fundedConsistency' },
                    { label: 'Funded Daily Profit Cap', key: 'fundedDailyProfitCap' },
                    { label: 'Base Profit Split', key: 'baseSplit' },
                    { label: 'Payout Cycle', key: 'payoutCycle' },
                    { label: '100% Split Add-on', key: 'splitAddon' },
                    { label: 'News Trading Policy', key: 'newsRule' },
                    { label: 'Weekend Position Holding', key: 'weekendRule' },
                    { label: 'VPS Policy (Aug 12, 2026)', key: 'vpsRule' },
                  ].map((row, idx) => (
                    <tr key={row.key} className={idx % 2 === 0 ? 'bg-white/[0.01]' : ''}>
                      <td className="p-4 font-semibold text-white sticky left-0 bg-[#0f1b2e] z-10 border-r border-white/[0.06] w-56 min-w-[220px]">
                        {row.label}
                      </td>
                      {GFT_EVAL_MODELS.map((m) => {
                        const val = (m as any)[row.key];
                        const isSelected = selectedProgram === m.slug;
                        const isHighlight = val && (val.includes('Static') || val.includes('0%') || val.includes('None') || val.includes('Yes'));
                        return (
                          <td
                            key={m.slug}
                            className={`p-4 text-center font-mono text-xs ${
                              isSelected ? 'bg-[#151c14]/40 border-x border-[#a3e635]/30' : ''
                            } ${isHighlight ? 'text-[#a3e635]' : 'text-white/80'}`}
                          >
                            {val}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* VIEW 2: MASTER INSTANT FUNDING TABLE (5 Models) */}
          {activeTableView === 'instant_table' && (
            <div className="overflow-x-auto rounded-xl border border-[#1F2228] bg-[#111318] shadow-2xl overflow-hidden">
              <table className="w-full text-left border-collapse" style={{ minWidth: '940px' }}>
                <thead>
                  <tr className="border-b border-white/[0.06] bg-[#080A10] text-[11px] uppercase tracking-wider font-bold">
                    <th className="p-4 w-56 min-w-[220px] sticky left-0 bg-[#080A10] z-20 text-white/50 border-r border-white/[0.06]">
                      Instant Rule / Feature
                    </th>
                    {GFT_INSTANT_MODELS.map((m) => {
                      const isSelected = selectedProgram === m.slug;
                      return (
                        <th
                          key={m.slug}
                          className={`p-4 text-center cursor-pointer transition-colors ${
                            isSelected
                              ? 'bg-[#151c14] border-x border-[#a3e635]/40 text-[#a3e635]'
                              : 'text-white/80 hover:bg-white/[0.02]'
                          }`}
                          onClick={() => {
                            setSelectedProgram(m.slug);
                            setActiveTableView('matrix');
                          }}
                          title="Click to select this model"
                        >
                          <div className="flex flex-col items-center gap-1">
                            <span className="font-bold text-xs text-white flex items-center gap-1">
                              {m.name}
                              {isSelected && (
                                <span className="w-2 h-2 rounded-full bg-[#a3e635] inline-block" />
                              )}
                            </span>
                            <span className="text-[10px] text-white/50 font-normal">{m.tag}</span>
                            <span className="text-[9px] px-2 py-0.5 rounded bg-white/10 text-white/70 font-mono mt-0.5">
                              {isSelected ? 'Active Model' : 'Tap to View Matrix'}
                            </span>
                          </div>
                        </th>
                      );
                    })}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1F2228] text-xs">
                  {[
                    { label: 'Evaluation Stage', key: 'evaluation' },
                    { label: 'Funding Mechanism', key: 'funding' },
                    { label: 'Available Account Sizes', key: 'accountSize' },
                    { label: 'Entry Price', key: 'price' },
                    { label: 'Daily Drawdown', key: 'dailyDD' },
                    { label: 'Maximum Total Drawdown', key: 'maxDD' },
                    { label: 'Floating Loss Rule', key: 'floatingLoss' },
                    { label: 'Minimum Valid Days', key: 'minValidDays' },
                    { label: 'Valid-Day Profit Threshold', key: 'validDayThreshold' },
                    { label: 'Consistency Rule', key: 'consistency' },
                    { label: 'Base Profit Split', key: 'profitSplit' },
                    { label: 'Reward Cycle', key: 'rewardCycle' },
                    { label: 'Daily Profit Cap', key: 'dailyProfitCap' },
                    { label: '100% Split Add-on', key: 'splitAddon' },
                    { label: 'Drawdown Reset After Payout', key: 'ddResetAfterPayout' },
                    { label: 'Account Expiration', key: 'accountExpiry' },
                    { label: 'Minimum Withdrawal', key: 'minPayout' },
                    { label: 'Lifetime Maximum Withdrawal', key: 'lifetimeMaxWithdrawal' },
                    { label: 'Purchase Limit Per User', key: 'purchaseLimit' },
                    { label: 'VPS Policy', key: 'vpsRule' },
                  ].map((row, idx) => (
                    <tr key={row.key} className={idx % 2 === 0 ? 'bg-white/[0.01]' : ''}>
                      <td className="p-4 font-semibold text-white sticky left-0 bg-[#0f1b2e] z-10 border-r border-white/[0.06] w-56 min-w-[220px]">
                        {row.label}
                      </td>
                      {GFT_INSTANT_MODELS.map((m) => {
                        const val = (m as any)[row.key];
                        const isSelected = selectedProgram === m.slug;
                        const isHighlight = val && (val.includes('0%') || val.includes('None') || val.includes('90%') || val.includes('10 Days') || val.includes('$1.00'));
                        return (
                          <td
                            key={m.slug}
                            className={`p-4 text-center font-mono text-xs ${
                              isSelected ? 'bg-[#151c14]/40 border-x border-[#a3e635]/30' : ''
                            } ${isHighlight ? 'text-[#a3e635] font-bold' : 'text-white/80'}`}
                          >
                            {val}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* VIEW 3: ACTIVE MODEL PHASE-BY-PHASE MATRIX */}
          {activeTableView === 'matrix' && (
            <>
              {/* Instant Funding Notice if active */}
              {isInstantMode && (
                <div className="flex items-start sm:items-center gap-3 p-4 bg-amber-500/10 border border-amber-500/30 rounded-2xl">
                  <Zap className="w-5 h-5 text-amber-400 shrink-0 mt-0.5 sm:mt-0" />
                  <div>
                    <p className="text-sm font-bold text-amber-300">Instant Funding — Direct Live Capital (No Evaluation)</p>
                    <p className="text-xs text-amber-400/80 mt-0.5">
                      This program skips all evaluation phases. You receive a live funded account immediately. The rules below apply from your very first trade.
                    </p>
                  </div>
                </div>
              )}

          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto rounded-xl border border-[#1F2228] bg-[#111318] shadow-2xl overflow-hidden">
            <table
              aria-label="Phase by phase rules comparison"
              className="w-full text-left border-collapse"
              style={{ minWidth: isInstantMode ? '600px' : (is1Step ? '720px' : '900px') }}
            >
              <thead>
                <tr className="border-b border-white/[0.06] bg-[#080A10] text-[11px] uppercase tracking-wider font-bold">
                  <th className="p-4 w-60 min-w-[240px] sticky left-0 bg-[#080A10] z-20 text-white/50 border-r border-white/[0.06]">
                    Rule / Condition
                  </th>
                  {matrixColumns.map((col) => (
                    <th key={col.key} className={`p-4 ${col.class}`}>
                      <span className="block font-bold">{col.label}</span>
                      <span className="text-[10px] font-normal opacity-70 normal-case tracking-normal block mt-0.5">
                        {col.sub}
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1F2228] text-xs">
                {matrixTableRows.map((row) => {
                  const isExpanded = expandedMatrixRow === row.slug;
                  return (
                    <React.Fragment key={row.slug}>
                      <tr
                        onClick={() => toggleMatrixRow(row.slug)}
                        className={`hover:bg-white/[0.04] cursor-pointer transition-colors group ${
                          row.isDifferent ? 'bg-amber-500/[0.03]' : ''
                        } ${isExpanded ? 'bg-white/[0.05]' : ''}`}
                      >
                        {/* Rule Label Sticky Column */}
                        <td className="p-4 font-semibold text-white sticky left-0 bg-[#0f1b2e] group-hover:bg-[#162540] z-10 border-r border-white/[0.06] w-60 min-w-[240px] transition-colors">
                          <div className="flex items-center justify-between gap-2">
                            <span className="flex items-center gap-1.5 text-xs font-bold text-white">
                              {row.label}
                              {row.isDifferent && (
                                <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 text-[9px] font-bold shrink-0 font-mono border border-amber-500/30">
                                  DIFF
                                </span>
                              )}
                            </span>
                            <ChevronDown
                              className={`w-3.5 h-3.5 text-slate-500 group-hover:text-white shrink-0 transition-transform duration-200 ${
                                isExpanded ? 'rotate-180 text-white' : ''
                              }`}
                            />
                          </div>
                          <span className="text-[10px] text-white/60 font-normal block mt-0.5">
                            {row.sub}
                          </span>
                        </td>

                        {/* Dynamic Value Columns */}
                        {matrixColumns.map((col) => {
                          const cell = row[col.key as keyof typeof row] as MatrixCell | undefined;
                          const isFundedCol = col.key === 'funded';
                          return (
                            <td
                              key={col.key}
                              className={`p-4 ${isFundedCol ? 'bg-emerald-950/10 border-l border-emerald-900/30' : ''}`}
                            >
                              {cell ? (
                                <div className="space-y-0.5">
                                  <span className={`font-mono font-bold block ${cell.color || 'text-white'}`}>
                                    {cell.val}
                                  </span>
                                  {cell.note && (
                                    <span className="text-[10px] text-white/60 font-sans font-normal block mt-0.5 leading-tight">
                                      {cell.note}
                                    </span>
                                  )}
                                </div>
                              ) : (
                                <span className="text-white/20 font-mono">—</span>
                              )}
                            </td>
                          );
                        })}
                      </tr>

                      {/* Expandable In-Place Detail Row */}
                      {isExpanded && (
                        <tr className="bg-[#0b0e17] border-b border-[#1F2228]">
                          <td colSpan={matrixColumns.length + 1} className="p-4 sm:p-5">
                            <div className="sticky left-0 max-w-4xl p-4 sm:p-5 rounded-xl bg-[#131722] border border-white/[0.08] space-y-3 shadow-xl">
                              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/[0.06] pb-2.5">
                                <span className="text-xs font-bold text-[#a3e635] font-mono flex items-center gap-1.5">
                                  <Info className="w-3.5 h-3.5 shrink-0" />
                                  {row.expandedDetails.ruleTitle} — Exact Parameters on {fmt(selectedCapital)}
                                </span>
                                <span className="text-[11px] text-white/40 font-mono">
                                  Source: {row.expandedDetails.source}
                                </span>
                              </div>

                              <p className="text-xs text-white/80 leading-relaxed">
                                {row.expandedDetails.explanation}
                              </p>

                              {row.expandedDetails.dollarCalculation && (
                                <div className="p-3 rounded-lg bg-[#080a10] border border-white/[0.06] flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-mono">
                                  <span className="text-white/60">Account Math:</span>
                                  <strong className="text-[#a3e635] text-left sm:text-right">
                                    {row.expandedDetails.dollarCalculation}
                                  </strong>
                                </div>
                              )}

                              {row.expandedDetails.contractClause && (
                                <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-[11px] font-mono text-amber-200">
                                  <span className="text-amber-400 font-bold block uppercase text-[10px]">
                                    Contract Clause:
                                  </span>
                                  "{row.expandedDetails.contractClause}"
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View */}
          <div className="md:hidden space-y-3">
            {matrixTableRows.map((row) => {
              const isExpanded = expandedMatrixRow === row.slug;
              return (
                <div
                  key={row.slug}
                  onClick={() => toggleMatrixRow(row.slug)}
                  className="w-full text-left p-4 rounded-xl border border-[#1F2228] bg-[#111318] space-y-3 transition-colors cursor-pointer active:border-[#2A2D35]"
                >
                  <div className="flex items-center justify-between gap-2 border-b border-[#1F2228] pb-2">
                    <div>
                      <span className="font-bold text-white text-sm flex items-center gap-1.5">
                        {row.label}
                        {row.isDifferent && (
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 font-mono">
                            DIFF
                          </span>
                        )}
                      </span>
                      <p className="text-[11px] text-white/50 mt-0.5">{row.sub}</p>
                    </div>
                    <ChevronDown
                      className={`w-4 h-4 text-white/40 shrink-0 transition-transform duration-200 ${
                        isExpanded ? 'rotate-180 text-[#a3e635]' : ''
                      }`}
                    />
                  </div>

                  <div className="space-y-2">
                    {matrixColumns.map((col) => {
                      const cell = (row as any)[col.key] as MatrixCell | undefined;
                      if (!cell) return null;
                      return (
                        <div key={col.key} className="flex justify-between items-start gap-3 text-xs">
                          <span className="text-white/50 shrink-0 font-medium">
                            {col.label.replace('🚀 ', '')}:
                          </span>
                          <span className={`font-mono font-bold text-right max-w-[65%] ${cell.color || 'text-white'}`}>
                            {cell.val}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  {isExpanded && (
                    <div className="pt-3 border-t border-[#1F2228] text-xs space-y-2">
                      <p className="text-white/80 leading-relaxed">{row.expandedDetails.explanation}</p>
                      {row.expandedDetails.dollarCalculation && (
                        <div className="p-2.5 rounded-lg bg-[#080A10] font-mono text-[11px] text-[#a3e635] border border-white/[0.06]">
                          {row.expandedDetails.dollarCalculation}
                        </div>
                      )}
                      {row.expandedDetails.contractClause && (
                        <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-[10px] font-mono text-amber-200">
                          <span className="text-amber-400 font-bold block uppercase text-[9px]">Clause:</span>
                          "{row.expandedDetails.contractClause}"
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}
    </section>

        {/* ══ STEP 2: EVALUATION PHASE (Skipped in Instant & Instant Pro) ══ */}
        {programConfig.hasEvaluation && (
          <section className="p-6 sm:p-8 rounded-3xl bg-[#0f1118] border border-[#1b1e29] space-y-6 shadow-xl">
            <div className="flex items-start gap-3">
              <div className="w-7 h-7 rounded-full bg-[#a3e635] text-slate-950 font-black text-sm flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                2
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                  Evaluation Phase
                </h2>
                <p className="text-xs sm:text-sm text-white/50 mt-0.5">
                  Prove your risk discipline to unlock your Master Account. No time limit, news holding allowed, and pass in as little as 1 trade.
                </p>
              </div>
            </div>

            {/* TARGETS vs LIMITS 2-COLUMN GRID */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
              {/* LEFT COLUMN: TARGETS — HOW TO PASS */}
              <div className="space-y-3">
                <span className="text-[11px] font-bold tracking-wider text-[#a3e635] uppercase block font-mono">
                  TARGETS — HOW TO PASS
                </span>

                {/* Card: Profit Target */}
                <div className="rounded-2xl bg-[#13161f] border border-[#1e2330] overflow-hidden transition-all">
                  <div
                    onClick={() => toggleRule('profit-target')}
                    className="p-5 cursor-pointer flex items-start justify-between gap-3 hover:bg-white/[0.02]"
                  >
                    <div className="flex items-start gap-3">
                      <TrendingUp className="w-5 h-5 text-[#a3e635] shrink-0 mt-0.5" />
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm sm:text-base font-bold text-white">
                            Profit Target
                          </h3>
                        </div>
                        <p className="text-xs text-white/60">
                          {selectedProgram === 'pay_after_pass'
                            ? 'Reach just 4% profit based on starting simulated balance.'
                            : programConfig.evalPhase2Target
                            ? `Phase 1: ${programConfig.evalTarget}% • Phase 2: ${programConfig.evalPhase2Target}%`
                            : `You must reach the ${programConfig.evalTarget}% Profit Target based on initial capital.`}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="px-2.5 py-0.5 rounded text-xs font-mono font-bold bg-[#a3e635]/15 text-[#a3e635] border border-[#a3e635]/30">
                        {programConfig.evalTarget}%
                      </span>
                      {expandedRule === 'profit-target' ? (
                        <ChevronUp className="w-4 h-4 text-white/40" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-white/40" />
                      )}
                    </div>
                  </div>

                  {/* Visual Dropdown for Profit Target */}
                  {expandedRule === 'profit-target' && (
                    <div className="p-5 border-t border-[#1e2330] bg-[#0c0e14] space-y-4">
                      <div className="p-4 rounded-xl bg-[#11131a] border border-white/[0.06] space-y-2">
                        <div className="flex justify-between items-center text-[11px] font-mono">
                          <span className="text-[#a3e635] font-bold">
                            Target: +{programConfig.evalTarget}% ({fmt(targetDollar)})
                          </span>
                          <span className="text-white/50">Starting: {fmt(selectedCapital)}</span>
                        </div>

                        {/* Interactive SVG Chart */}
                        <svg viewBox="0 0 500 160" className="w-full h-36 overflow-visible">
                          <defs>
                            <linearGradient id="profitGradReal" x1="0" y1="1" x2="0" y2="0">
                              <stop offset="0%" stopColor="#a3e635" stopOpacity="0.0" />
                              <stop offset="100%" stopColor="#a3e635" stopOpacity="0.2" />
                            </linearGradient>
                          </defs>

                          <line x1="40" y1="30" x2="480" y2="30" stroke="#a3e635" strokeDasharray="4,4" strokeWidth="1" opacity="0.7" />
                          <line x1="40" y1="85" x2="480" y2="85" stroke="#252a36" strokeWidth="1" />
                          <line x1="40" y1="135" x2="480" y2="135" stroke="#252a36" strokeWidth="1" />

                          <text x="5" y="34" fill="#a3e635" fontSize="10" fontFamily="monospace" fontWeight="bold">
                            +{programConfig.evalTarget}%
                          </text>
                          <text x="15" y="89" fill="#6b7280" fontSize="10" fontFamily="monospace">
                            0%
                          </text>
                          <text x="12" y="139" fill="#6b7280" fontSize="10" fontFamily="monospace">
                            -2%
                          </text>

                          <path
                            d="M 50 85 Q 150 80 230 60 T 380 30 L 460 20"
                            fill="none"
                            stroke="#a3e635"
                            strokeWidth="2.5"
                          />
                          <path
                            d="M 50 85 Q 150 80 230 60 T 380 30 L 460 20 L 460 85 L 50 85 Z"
                            fill="url(#profitGradReal)"
                          />

                          <circle cx="380" cy="30" r="5" fill="#a3e635" />
                          <circle cx="380" cy="30" r="9" fill="#a3e635" opacity="0.25" className="animate-ping" />
                          <text x="350" y="18" fill="#a3e635" fontSize="10" fontFamily="monospace" fontWeight="bold">
                            Target Hit ✓
                          </text>

                          <text x="50" y="152" fill="#6b7280" fontSize="10" fontFamily="monospace">
                            Mon
                          </text>
                          <text x="150" y="152" fill="#6b7280" fontSize="10" fontFamily="monospace">
                            Tue
                          </text>
                          <text x="250" y="152" fill="#6b7280" fontSize="10" fontFamily="monospace">
                            Wed
                          </text>
                          <text x="365" y="152" fill="#a3e635" fontSize="10" fontFamily="monospace" fontWeight="bold">
                            Thu
                          </text>
                          <text x="460" y="152" fill="#6b7280" fontSize="10" fontFamily="monospace">
                            Fri
                          </text>
                        </svg>
                      </div>

                      <p className="text-xs text-white/70 leading-relaxed">
                        On your <strong className="text-white font-mono">{fmt(selectedCapital)}</strong> account, you hit the target when equity reaches{' '}
                        <strong className="text-[#a3e635] font-mono">{fmt(selectedCapital + targetDollar)}</strong> with all positions closed. No time limit applies.
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* RIGHT COLUMN: LIMITS — HARD BREACHES */}
              <div className="space-y-3">
                <span className="text-[11px] font-bold tracking-wider text-[#f87171] uppercase block font-mono">
                  LIMITS — HARD BREACHES
                </span>

                {/* Card 1: Daily Drawdown */}
                <div className="rounded-2xl bg-[#13161f] border border-[#1e2330] overflow-hidden transition-all">
                  <div
                    onClick={() => toggleRule('daily-drawdown')}
                    className="p-5 cursor-pointer flex items-start justify-between gap-3 hover:bg-white/[0.02]"
                  >
                    <div className="flex items-start gap-3">
                      <TrendingDown className="w-5 h-5 text-[#f87171] shrink-0 mt-0.5" />
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm sm:text-base font-bold text-white">
                            Daily Drawdown
                          </h3>
                        </div>
                        <p className="text-xs text-white/60">
                          {evalDailyLossPct === 0
                            ? 'No daily drawdown limit during evaluation phase!'
                            : 'The maximum allowable loss you cannot exceed in a single trading day.'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span
                        className={`px-2.5 py-0.5 rounded text-xs font-mono font-bold ${
                          evalDailyLossPct === 0
                            ? 'bg-[#a3e635]/15 text-[#a3e635] border border-[#a3e635]/30'
                            : 'bg-[#f87171]/15 text-[#f87171] border border-[#f87171]/30'
                        }`}
                      >
                        {evalDailyLossPct === 0 ? 'NONE' : `${evalDailyLossPct}%`}
                      </span>
                      {expandedRule === 'daily-drawdown' ? (
                        <ChevronUp className="w-4 h-4 text-white/40" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-white/40" />
                      )}
                    </div>
                  </div>

                  {/* Expanded View */}
                  {expandedRule === 'daily-drawdown' && (
                    <div className="p-5 border-t border-[#1e2330] bg-[#0c0e14] space-y-4">
                      {evalDailyLossPct === 0 ? (
                        <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-800/40 space-y-2 text-xs">
                          <div className="flex items-center gap-2 text-emerald-400 font-bold">
                            <CheckCircle2 className="w-4 h-4" />
                            <span>GFT Pay After Pass Advantage: Zero Daily Drawdown</span>
                          </div>
                          <p className="text-emerald-200/80 leading-relaxed">
                            Official GFT FAQ confirms: There is <strong>no daily drawdown</strong> during the evaluation phase of Pay After You Pass. You only have the overall 8% trailing maximum loss ceiling, meaning you never fail from a single volatile day or rollover spread widening.
                          </p>
                          <p className="text-[11px] text-white/50 pt-1 font-mono">
                            Note: Once passed and funded, the Master Account activates a 3% daily limit.
                          </p>
                        </div>
                      ) : (
                        <>
                          <div className="p-4 rounded-xl bg-[#11131a] border border-white/[0.06]">
                            <svg viewBox="0 0 500 170" className="w-full h-40 overflow-visible">
                              <line x1="50" y1="20" x2="480" y2="20" stroke="#1f2430" strokeWidth="1" />
                              <line x1="50" y1="50" x2="480" y2="50" stroke="#1f2430" strokeWidth="1" />
                              <line x1="50" y1="85" x2="480" y2="85" stroke="#252b38" strokeWidth="1" />
                              <line x1="50" y1="120" x2="480" y2="120" stroke="#ef4444" strokeDasharray="3,3" strokeWidth="1.2" />
                              <line x1="50" y1="150" x2="480" y2="150" stroke="#1f2430" strokeWidth="1" />

                              <text x="15" y="24" fill="#6b7280" fontSize="10" fontFamily="monospace">
                                +2%
                              </text>
                              <text x="10" y="54" fill="#4ade80" fontSize="10" fontFamily="monospace" fontWeight="bold">
                                Equity
                              </text>
                              <text x="22" y="89" fill="#6b7280" fontSize="10" fontFamily="monospace">
                                0%
                              </text>
                              <text x="18" y="124" fill="#ef4444" fontSize="10" fontFamily="monospace" fontWeight="bold">
                                -{evalDailyLossPct}%
                              </text>
                              <text x="18" y="154" fill="#6b7280" fontSize="10" fontFamily="monospace">
                                -4%
                              </text>

                              <text x="455" y="117" fill="#ef4444" fontSize="10" fontFamily="monospace" fontWeight="bold">
                                {evalDailyLossPct}%
                              </text>

                              <path
                                d="M 60 55 Q 160 65 240 105 T 320 120 T 400 135 L 470 142"
                                fill="none"
                                stroke="#4ade80"
                                strokeWidth="2.5"
                              />

                              <circle cx="320" cy="120" r="5" fill="#ef4444" />
                              <circle cx="320" cy="120" r="8" fill="#ef4444" opacity="0.3" className="animate-ping" />

                              <text x="300" y="145" fill="#ef4444" fontSize="11" fontFamily="sans-serif" fontWeight="bold">
                                Breach
                              </text>
                              <text x="304" y="158" fill="#ef4444" fontSize="11" fontFamily="sans-serif" fontWeight="bold">
                                Wed
                              </text>

                              <text x="90" y="165" fill="#6b7280" fontSize="10" fontFamily="monospace">
                                Mon
                              </text>
                              <text x="190" y="165" fill="#6b7280" fontSize="10" fontFamily="monospace">
                                Tue
                              </text>
                              <text x="390" y="165" fill="#6b7280" fontSize="10" fontFamily="monospace">
                                Thu
                              </text>
                              <text x="460" y="165" fill="#6b7280" fontSize="10" fontFamily="monospace">
                                Fri
                              </text>
                            </svg>
                          </div>

                          <p className="text-xs text-white/70 leading-relaxed">
                            Resets at 5 PM EST (00:00 server rollover). Calculated as {evalDailyLossPct}% of your start-of-day equity or initial balance. A violation occurs if your floating equity drops below this floor during active trading.
                          </p>

                          <div className="p-2.5 rounded-lg bg-red-950/20 border border-red-900/30 text-[11px] font-mono text-red-300 flex items-center justify-between">
                            <span>Daily limit on {fmt(selectedCapital)}:</span>
                            <strong className="text-red-400">
                              {fmt(evalDailyLossDollar)} (Breach floor: {fmt(selectedCapital - evalDailyLossDollar)})
                            </strong>
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </div>

                {/* Card 2: Maximum Drawdown */}
                <div className="rounded-2xl bg-[#13161f] border border-[#1e2330] overflow-hidden transition-all">
                  <div
                    onClick={() => toggleRule('max-drawdown')}
                    className="p-5 cursor-pointer flex items-start justify-between gap-3 hover:bg-white/[0.02]"
                  >
                    <div className="flex items-start gap-3">
                      <Shield className="w-5 h-5 text-[#f87171] shrink-0 mt-0.5" />
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm sm:text-base font-bold text-white">
                            Maximum Drawdown - {programConfig.maxLossType}
                          </h3>
                        </div>
                        <p className="text-xs text-white/60">
                          {programConfig.maxLossType.includes('Static')
                            ? 'Permanent fixed floor 8% below initial capital. Never trails up.'
                            : 'Trailing floor evaluated at rollover (5 PM EST). Locks permanently at starting balance.'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="px-2.5 py-0.5 rounded text-xs font-mono font-bold bg-[#f87171]/15 text-[#f87171] border border-[#f87171]/30">
                        {programConfig.evalMaxLoss}%
                      </span>
                      {expandedRule === 'max-drawdown' ? (
                        <ChevronUp className="w-4 h-4 text-white/40" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-white/40" />
                      )}
                    </div>
                  </div>

                  {expandedRule === 'max-drawdown' && (
                    <div className="p-5 border-t border-[#1e2330] bg-[#0c0e14] space-y-3">
                      <div className="p-3 rounded-xl bg-[#11131a] border border-white/[0.06] text-xs text-white/70 space-y-2">
                        <p>
                          {programConfig.maxLossType.includes('Static')
                            ? `Static Drawdown: Your loss floor remains permanently fixed at ${fmt(floorDollar)} and never moves higher as you earn profits, giving you maximum safety.`
                            : `Locking Trailing Model: Evaluated at market rollover (5 PM EST) on the higher of balance or equity. It moves upward as profits are banked and permanently locks once it reaches initial capital ($${selectedCapital.toLocaleString()}).`}
                        </p>
                      </div>

                      <div className="p-2.5 rounded-lg bg-red-950/20 border border-red-900/30 text-[11px] font-mono text-red-300 flex items-center justify-between">
                        <span>Max allowable loss:</span>
                        <strong className="text-red-400">
                          {fmt(evalMaxLossDollar)} (Starting floor: {fmt(floorDollar)})
                        </strong>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* ACCOUNT SETTINGS ROW */}
            <div className="space-y-3 pt-4">
              <span className="text-[11px] font-bold tracking-wider text-white/50 uppercase block font-mono">
                ACCOUNT SETTINGS &amp; EXECUTION POLICIES
              </span>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* News Trading & Position Holding */}
                <div className="p-5 rounded-2xl bg-[#13161f] border border-[#1e2330] flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <Globe className="w-4 h-4 text-white/60" />
                      News &amp; Weekend Holding
                    </h3>
                    <p className="text-xs text-white/60 leading-relaxed">
                      During evaluation, news trading is 100% unrestricted. Holding overnight and over weekends is permitted across all instruments. Crypto trades 24/7.
                    </p>
                  </div>
                  <span className="px-2.5 py-0.5 rounded text-xs font-mono font-bold bg-[#a3e635]/15 text-[#a3e635] border border-[#a3e635]/30 shrink-0">
                    ALLOWED
                  </span>
                </div>

                {/* Leverage */}
                <div className="p-5 rounded-2xl bg-[#13161f] border border-[#1e2330] flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <Sliders className="w-4 h-4 text-white/60" />
                      Leverage by Asset Class
                    </h3>
                    <p className="text-xs text-white/60 leading-relaxed">
                      {selectedAsset === 'futures'
                        ? 'CME Exchange margin requirements apply'
                        : '1:100 Forex, 1:5 Crypto (24/7), 1:40 Metals/Commodities, 1:20 Indices, 1:5 Stocks.'}
                    </p>
                  </div>
                  <span className="px-2.5 py-0.5 rounded text-xs font-mono font-bold bg-[#a3e635]/15 text-[#a3e635] border border-[#a3e635]/30 shrink-0">
                    {programConfig.leverageEval}
                  </span>
                </div>

                {/* Stop Loss Policy */}
                <div className="p-5 rounded-2xl bg-[#13161f] border border-[#1e2330] flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <Shield className="w-4 h-4 text-white/60" />
                      Stop Loss Requirement
                    </h3>
                    <p className="text-xs text-white/60 leading-relaxed">
                      Stop loss is NOT mandatory on any GFT account. You have full discretion over risk stop placement.
                    </p>
                  </div>
                  <span className="px-2.5 py-0.5 rounded text-xs font-mono font-bold bg-[#a3e635]/15 text-[#a3e635] border border-[#a3e635]/30 shrink-0">
                    OPTIONAL
                  </span>
                </div>

                {/* Time Limit */}
                <div className="p-5 rounded-2xl bg-[#13161f] border border-[#1e2330] flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <Clock className="w-4 h-4 text-white/60" />
                      Time Limit &amp; Min Days
                    </h3>
                    <p className="text-xs text-white/60 leading-relaxed">
                      Unlimited calendar time. Pass in as little as 1 trade (0 minimum trading days required).
                    </p>
                  </div>
                  <span className="px-2.5 py-0.5 rounded text-xs font-mono font-bold bg-[#a3e635]/15 text-[#a3e635] border border-[#a3e635]/30 shrink-0">
                    UNLIMITED
                  </span>
                </div>

                {/* Inactivity */}
                <div className="p-5 rounded-2xl bg-[#13161f] border border-[#1e2330] flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-white/60" />
                      Inactivity Policy
                    </h3>
                    <p className="text-xs text-white/60 leading-relaxed">
                      Place at least 1 trade every {programConfig.inactivityEval} consecutive days to keep your demo account active.
                    </p>
                  </div>
                  <span className="px-2.5 py-0.5 rounded text-xs font-mono font-bold bg-amber-400/15 text-amber-300 border border-amber-400/30 shrink-0">
                    {programConfig.inactivityEval} DAYS
                  </span>
                </div>

                {/* Consistency in Eval */}
                <div className="p-5 rounded-2xl bg-[#13161f] border border-[#1e2330] flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <SlidersHorizontal className="w-4 h-4 text-white/60" />
                      Consistency in Challenge
                    </h3>
                    <p className="text-xs text-white/60 leading-relaxed">
                      Zero consistency rule during evaluation. Single-trade wins that reach the profit target are 100% valid.
                    </p>
                  </div>
                  <span className="px-2.5 py-0.5 rounded text-xs font-mono font-bold bg-[#a3e635]/15 text-[#a3e635] border border-[#a3e635]/30 shrink-0">
                    NO RULE
                  </span>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ══ STAGE TRANSITION CONNECTOR 1 ══ */}
        {programConfig.hasEvaluation && (
          <div className="flex justify-center">
            <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#10131b] border border-[#212635] text-xs font-mono font-bold text-white/80 shadow-lg">
              <span className="text-[#a3e635] flex items-center gap-1">
                <Check className="w-3.5 h-3.5" />
                CHALLENGE PASSED
              </span>
              <ArrowRight className="w-3.5 h-3.5 text-white/40" />
              <span>MASTER ACCOUNT ALLOCATION</span>
            </div>
          </div>
        )}

        {/* ══ STEP 3 (or 2 in Instant): MASTER ACCOUNT ══ */}
        <section className="p-6 sm:p-8 rounded-3xl bg-[#0f1118] border border-[#1b1e29] space-y-6 shadow-xl">
          <div className="flex items-start gap-3">
            <div className="w-7 h-7 rounded-full bg-[#a3e635] text-slate-950 font-black text-sm flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
              {programConfig.masterStepNum}
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                Master Account (Funded Stage)
              </h2>
              <p className="text-xs sm:text-sm text-white/50 mt-0.5">
                You receive a Master account {isInstantMode ? 'immediately upon signup' : 'upon passing the challenge'}. Trade simulated capital and withdraw real cash rewards.
              </p>
            </div>
          </div>

          {/* RULES & LIMITS SUBHEADER */}
          <div className="space-y-3">
            <span className="text-[11px] font-bold tracking-wider text-[#f87171] uppercase block font-mono">
              RULES &amp; LIMITS
            </span>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Daily Drawdown */}
              {masterDailyLossPct > 0 && (
                <div className="rounded-2xl bg-[#13161f] border border-[#1e2330] overflow-hidden">
                  <div
                    onClick={() => toggleMasterRule('m-daily')}
                    className="p-5 cursor-pointer flex items-start justify-between gap-3 hover:bg-white/[0.02]"
                  >
                    <div className="flex items-start gap-3">
                      <TrendingDown className="w-5 h-5 text-[#f87171] shrink-0 mt-0.5" />
                      <div className="space-y-1">
                        <h3 className="text-sm font-bold text-white">Daily Drawdown</h3>
                        <p className="text-xs text-white/60">
                          The maximum loss you cannot exceed in a single day.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="px-2.5 py-0.5 rounded text-xs font-mono font-bold bg-[#f87171]/15 text-[#f87171] border border-[#f87171]/30">
                        {masterDailyLossPct}%
                      </span>
                      {expandedMasterRule === 'm-daily' ? (
                        <ChevronUp className="w-4 h-4 text-white/40" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-white/40" />
                      )}
                    </div>
                  </div>

                  {expandedMasterRule === 'm-daily' && (
                    <div className="p-4 border-t border-[#1e2330] bg-[#0c0e14] text-xs text-white/70 space-y-2">
                      <p>
                        On your {fmt(selectedCapital)} Master account, daily drawdown limit is <strong className="text-red-400 font-mono">{fmt(masterDailyLossDollar)}</strong> (breach floor: {fmt(selectedCapital - masterDailyLossDollar)}).
                      </p>
                      <p className="text-[11px] text-white/50">
                        Resets at 5 PM EST / 00:00 server rollover. Calculated on the higher of balance or equity at rollover time.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Maximum Drawdown - Trailing */}
              <div className="rounded-2xl bg-[#13161f] border border-[#1e2330] overflow-hidden">
                <div
                  onClick={() => toggleMasterRule('m-max')}
                  className="p-5 cursor-pointer flex items-start justify-between gap-3 hover:bg-white/[0.02]"
                >
                  <div className="flex items-start gap-3">
                    <Shield className="w-5 h-5 text-[#f87171] shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <h3 className="text-sm font-bold text-white">
                        Maximum Drawdown - {programConfig.maxLossType}
                      </h3>
                      <p className="text-xs text-white/60">
                        If your losses hit this limit, your account will be closed.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="px-2.5 py-0.5 rounded text-xs font-mono font-bold bg-[#f87171]/15 text-[#f87171] border border-[#f87171]/30">
                      {programConfig.masterMaxLoss}%
                    </span>
                    {expandedMasterRule === 'm-max' ? (
                      <ChevronUp className="w-4 h-4 text-white/40" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-white/40" />
                    )}
                  </div>
                </div>

                {expandedMasterRule === 'm-max' && (
                  <div className="p-4 border-t border-[#1e2330] bg-[#0c0e14] text-xs text-white/70 space-y-2">
                    <p>
                      Funded stage maximum total loss is <strong className="text-red-400 font-mono">{fmt(masterMaxLossDollar)}</strong>.
                    </p>
                    <p className="text-[11px] text-white/50">
                      Once trailing drawdown reaches your initial balance (${selectedCapital.toLocaleString()}), it locks permanently. After a payout, it resets to {programConfig.masterMaxLoss}% below initial balance.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* MASTER ACCOUNT SETTINGS */}
          <div className="space-y-3 pt-3">
            <span className="text-[11px] font-bold tracking-wider text-white/50 uppercase block font-mono">
              ACCOUNT SETTINGS &amp; FUNDED TRADING RULES
            </span>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Leverage */}
              <div className="p-5 rounded-2xl bg-[#13161f] border border-[#1e2330] flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-white/60" />
                    Leverage
                  </h3>
                  <p className="text-xs text-white/60 leading-relaxed">
                    {programConfig.leverageMaster} for Forex, 1:5 for Crypto (24/7), 1:40 for Commodities, 1:20 for Indices.
                  </p>
                </div>
                <span className="px-2.5 py-0.5 rounded text-xs font-mono font-bold bg-[#a3e635]/15 text-[#a3e635] border border-[#a3e635]/30 shrink-0">
                  {programConfig.leverageMaster}
                </span>
              </div>

              {/* Time Limit */}
              <div className="p-5 rounded-2xl bg-[#13161f] border border-[#1e2330] flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Clock className="w-4 h-4 text-white/60" />
                    Time Limit
                  </h3>
                  <p className="text-xs text-white/60 leading-relaxed">
                    Take your time. There is no deadline or trading expiration on Master Accounts.
                  </p>
                </div>
                <span className="px-2.5 py-0.5 rounded text-xs font-mono font-bold bg-[#a3e635]/15 text-[#a3e635] border border-[#a3e635]/30 shrink-0">
                  UNLIMITED
                </span>
              </div>

              {/* News Trading */}
              <div className="p-5 rounded-2xl bg-[#13161f] border border-[#1e2330] flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Globe className="w-4 h-4 text-amber-400/80" />
                    News Trading in Funded
                  </h3>
                  <p className="text-xs text-white/60 leading-relaxed">
                    Holding trades through news is permitted. Opening or closing trades within high-impact news windows has a 1% profit cap (excess profit removed on review, not an account breach).
                  </p>
                </div>
                <span className="px-2.5 py-0.5 rounded text-xs font-mono font-bold bg-amber-400/15 text-amber-400 border border-amber-400/30 shrink-0">
                  1% PROFIT CAP
                </span>
              </div>

              {/* Inactivity */}
              <div className="p-5 rounded-2xl bg-[#13161f] border border-[#1e2330] flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-white/60" />
                    Inactivity
                  </h3>
                  <p className="text-xs text-white/60 leading-relaxed">
                    Close at least 1 trade every {programConfig.inactivityMaster} days.
                  </p>
                </div>
                <span className="px-2.5 py-0.5 rounded text-xs font-mono font-bold bg-amber-400/15 text-amber-300 border border-amber-400/30 shrink-0">
                  {programConfig.inactivityMaster} DAYS
                </span>
              </div>

              {/* Drawdown Protection */}
              <div className="rounded-2xl bg-[#13161f] border border-[#1e2330] overflow-hidden">
                <div
                  onClick={() => toggleMasterRule('m-protection')}
                  className="p-5 cursor-pointer flex items-start justify-between gap-3 hover:bg-white/[0.02]"
                >
                  <div className="space-y-1">
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <Shield className="w-4 h-4 text-white/60" />
                      Drawdown Protection (Floating Loss Limit)
                    </h3>
                    <p className="text-xs text-white/60 leading-relaxed">
                      Open positions must not exceed a floating loss of -2% of starting balance.
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="px-2.5 py-0.5 rounded text-xs font-mono font-bold bg-[#a3e635]/15 text-[#a3e635] border border-[#a3e635]/30">
                      2%
                    </span>
                    {expandedMasterRule === 'm-protection' ? (
                      <ChevronUp className="w-4 h-4 text-white/40" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-white/40" />
                    )}
                  </div>
                </div>

                {expandedMasterRule === 'm-protection' && (
                  <div className="p-4 border-t border-[#1e2330] bg-[#0c0e14] text-xs text-white/70 space-y-1.5 font-mono">
                    <p>
                      Floating open trade limit on {fmt(selectedCapital)}: <strong className="text-amber-300">-{fmt(selectedCapital * 0.02)}</strong>.
                    </p>
                    <p className="text-[11px] text-white/50 font-sans">
                      Automated risk engine flags accounts whose unrealized open equity drops more than 2% below starting capital on open positions.
                    </p>
                  </div>
                )}
              </div>

              {/* Consistency */}
              <div className="rounded-2xl bg-[#13161f] border border-[#1e2330] overflow-hidden">
                <div
                  onClick={() => toggleMasterRule('m-consistency')}
                  className="p-5 cursor-pointer flex items-start justify-between gap-3 hover:bg-white/[0.02]"
                >
                  <div className="space-y-1">
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <SlidersHorizontal className="w-4 h-4 text-white/60" />
                      Consistency Rule
                    </h3>
                    <p className="text-xs text-white/60 leading-relaxed">
                      {programConfig.consistency === 0
                        ? 'NO consistency rule applies to this model! Trade freely.'
                        : `Your best day's profit must not exceed ${programConfig.consistency}% of your total payout profit.`}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="px-2.5 py-0.5 rounded text-xs font-mono font-bold bg-[#a3e635]/15 text-[#a3e635] border border-[#a3e635]/30">
                      {programConfig.consistency === 0 ? 'NO RULE' : `${programConfig.consistency}%`}
                    </span>
                    {expandedMasterRule === 'm-consistency' ? (
                      <ChevronUp className="w-4 h-4 text-white/40" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-white/40" />
                    )}
                  </div>
                </div>

                {expandedMasterRule === 'm-consistency' && (
                  <div className="p-4 border-t border-[#1e2330] bg-[#0c0e14] text-xs text-white/70 space-y-3">
                    {programConfig.consistency === 0 ? (
                      <div className="p-3 rounded-lg bg-emerald-950/20 border border-emerald-800/40 text-xs text-emerald-300">
                        Zero consistency requirement! Whether you make 90% of your profits on a single news breakout or spread it evenly, your payout will be approved without delay.
                      </div>
                    ) : (
                      <>
                        <div className="p-3 rounded-lg bg-[#11131a] border border-white/[0.06] space-y-2">
                          <div className="flex justify-between items-center text-[11px] font-mono">
                            <span className="text-[#a3e635] font-bold">20% Single-Day Rule in GFT Funded Stage</span>
                            <span className="text-white/50">Delays withdrawal, never breaches account</span>
                          </div>
                          <div className="space-y-1.5">
                            <div className="flex items-center justify-between text-[10px] text-white/60">
                              <span>Consistent Trader (No single day &gt;20%)</span>
                              <span className="text-emerald-400">Withdrawal Approved ✅</span>
                            </div>
                            <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                              <div className="h-full bg-emerald-400 rounded-full" style={{ width: '85%' }} />
                            </div>

                            <div className="flex items-center justify-between text-[10px] text-white/60 pt-1">
                              <span>1-Day Spiked Trader (&gt;20% on one day)</span>
                              <span className="text-amber-400">Trade More Days to Balance</span>
                            </div>
                            <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                              <div className="h-full bg-amber-400 rounded-full" style={{ width: '100%' }} />
                            </div>
                          </div>
                        </div>
                        <p className="text-[11px] text-white/60 leading-relaxed">
                          Confirmed in official GFT FAQs: Consistency rule applies ONLY to funded stages where stated. If exceeded, your account is NEVER closed — you simply continue trading to balance the profit distribution.
                        </p>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* ══ STAGE TRANSITION CONNECTOR 2 ══ */}
        <div className="flex justify-center">
          <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#10131b] border border-[#212635] text-xs font-mono font-bold text-white/80 shadow-lg">
            <span className="text-[#a3e635] flex items-center gap-1">
              <Check className="w-3.5 h-3.5" />
              FIRST REWARD
            </span>
            <ArrowRight className="w-3.5 h-3.5 text-white/40" />
            <span>KYC VERIFICATION</span>
            <ArrowRight className="w-3.5 h-3.5 text-white/40" />
            <span>DIRECT PAYOUT TO BANK OR CRYPTO WALLET</span>
          </div>
        </div>

        {/* ══ STEP 4 (or 3 in Instant): REWARDS ══ */}
        <section className="p-6 sm:p-8 rounded-3xl bg-[#0f1118] border border-[#1b1e29] space-y-6 shadow-xl">
          <div className="flex items-start gap-3">
            <div className="w-7 h-7 rounded-full bg-[#a3e635] text-slate-950 font-black text-sm flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
              {programConfig.rewardStepNum}
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                Rewards &amp; Payouts
              </h2>
              <p className="text-xs sm:text-sm text-white/50 mt-0.5">
                Withdraw your trading profits directly into your bank or crypto wallet. Covered by Goat Funded Trader's Reward Guarantee.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Reward Cycle */}
            <div className="p-5 rounded-2xl bg-[#13161f] border border-[#1e2330] flex items-start justify-between gap-3">
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Clock className="w-4 h-4 text-white/60" />
                  Reward Cycle
                </h3>
                <p className="text-xs text-white/60 leading-relaxed">
                  {selectedProgram === 'instant_pro'
                    ? '10-Day reward cycle on Instant Premium (fastest in the prop industry).'
                    : 'On-demand rewards available; standard payouts processed bi-weekly (every 14 days).'}
                </p>
              </div>
              <span className="px-2.5 py-0.5 rounded text-xs font-mono font-bold bg-[#a3e635]/15 text-[#a3e635] border border-[#a3e635]/30 shrink-0">
                {selectedProgram === 'instant_pro' ? 'Every 10 Days' : 'On Demand / 14 Days'}
              </span>
            </div>

            {/* Profit Split */}
            <div className="p-5 rounded-2xl bg-[#13161f] border border-[#1e2330] flex items-start justify-between gap-3">
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-white/60" />
                  Profit Split
                </h3>
                <p className="text-xs text-white/60 leading-relaxed">
                  Your share of trading profits. Starts at {programConfig.profitSplit}%, scale up to 100% with add-ons or scaling milestones.
                </p>
              </div>
              <span className="px-2.5 py-0.5 rounded text-xs font-mono font-bold bg-[#a3e635]/15 text-[#a3e635] border border-[#a3e635]/30 shrink-0">
                {programConfig.profitSplit}% (Up to 100%)
              </span>
            </div>

            {/* Minimum Withdrawable Profit */}
            <div className="p-5 rounded-2xl bg-[#13161f] border border-[#1e2330] flex items-start justify-between gap-3">
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-white/60" />
                  Minimum Withdrawable Profit
                </h3>
                <p className="text-xs text-white/60 leading-relaxed">
                  The smallest net profit required to trigger an official withdrawal request.
                </p>
              </div>
              <span className="px-2.5 py-0.5 rounded text-xs font-mono font-bold bg-[#a3e635]/15 text-[#a3e635] border border-[#a3e635]/30 shrink-0">
                $100
              </span>
            </div>

            {/* Supported Payout Gateways */}
            <div className="p-5 rounded-2xl bg-[#13161f] border border-[#1e2330] flex items-start justify-between gap-3">
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Wallet className="w-4 h-4 text-white/60" />
                  Payout Methods
                </h3>
                <p className="text-xs text-white/60 leading-relaxed">
                  Crypto wallet (BTC, USDT ERC20/TRC20), Skrill, Rise, and direct international bank transfer.
                </p>
              </div>
              <span className="px-2.5 py-0.5 rounded text-xs font-mono font-bold bg-sky-500/15 text-sky-300 border border-sky-500/30 shrink-0">
                Crypto · Rise · Skrill
              </span>
            </div>

            {/* Maximum Reward / Cycle & Delay Guarantee */}
            <div className="p-5 rounded-2xl bg-[#13161f] border border-[#1e2330] flex items-start justify-between gap-3 md:col-span-2">
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Award className="w-4 h-4 text-white/60" />
                  Maximum Reward / Cycle &amp; Delay Guarantee
                </h3>
                <p className="text-xs text-white/60 leading-relaxed">
                  Single payout cap of $15,000 per cycle. Backed by GFT's official <strong>Reward Delay Guarantee</strong>: If your approved reward takes longer than 2 business days (or 24 hours on eligible on-demand tracks), GFT adds an extra <strong>$1,000</strong> straight to your payout!
                </p>
              </div>
              <span className="px-2.5 py-0.5 rounded text-xs font-mono font-bold bg-[#a3e635]/15 text-[#a3e635] border border-[#a3e635]/30 shrink-0">
                $15,000 Cap + $1K Guarantee
              </span>
            </div>
          </div>
        </section>

        {/* ══ COMPLETE GFT RULEBOOK & VERIFICATION ENCYCLOPEDIA (SEARCHABLE) ══ */}
        <section className="p-6 sm:p-8 rounded-3xl bg-[#0f1118] border border-[#1b1e29] space-y-6 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.08] pb-5">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#a3e635]/10 text-[#a3e635] text-xs font-bold border border-[#a3e635]/30">
                <BookOpen className="w-3.5 h-3.5" />
                <span>Verified GFT Knowledge Base</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Complete GFT Rulebook &amp; Terms Encyclopedia
              </h2>
              <p className="text-xs sm:text-sm text-white/60">
                Every single rule, clause, and mathematical condition of Goat Funded Trader verified across official contracts.
              </p>
            </div>

            {/* Search Input */}
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-white/40 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search all rules (e.g. news, stop loss, margin)..."
                value={encyclopediaSearch}
                onChange={(e) => setEncyclopediaSearch(e.target.value)}
                className="w-full bg-[#141722] border border-[#222736] rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-white/40 focus:outline-none focus:border-[#a3e635] transition-colors"
              />
            </div>
          </div>

          {/* Category Tabs */}
          <div className="flex flex-wrap items-center gap-2">
            {[
              { key: 'all', label: 'All Rules', count: gftRulesDatabase.length },
              { key: 'evaluation', label: 'Evaluation Phase', count: gftRulesDatabase.filter((r) => r.category === 'evaluation').length },
              { key: 'funded', label: 'Funded Rules', count: gftRulesDatabase.filter((r) => r.category === 'funded').length },
              { key: 'trading', label: 'Trading & Crypto', count: gftRulesDatabase.filter((r) => r.category === 'trading').length },
              { key: 'prohibited', label: 'Prohibited (Sec 4.4)', count: gftRulesDatabase.filter((r) => r.category === 'prohibited').length },
              { key: 'scaling', label: 'Scaling & Loyalty', count: gftRulesDatabase.filter((r) => r.category === 'scaling').length },
              { key: 'payouts', label: 'Rewards & Payouts', count: gftRulesDatabase.filter((r) => r.category === 'payouts').length },
            ].map((tab) => {
              const active = activeCategory === tab.key;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveCategory(tab.key as RuleCategory)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all border flex items-center gap-1.5 ${
                    active
                      ? 'bg-[#151c14] border-[#a3e635] text-[#a3e635] ring-1 ring-[#a3e635]/30'
                      : 'bg-[#12151e] border-[#1d2230] text-white/70 hover:text-white hover:border-white/20'
                  }`}
                >
                  <span>{tab.label}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${
                      active ? 'bg-[#a3e635]/20 text-[#a3e635]' : 'bg-white/10 text-white/50'
                    }`}
                  >
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Filtered Rule Cards List */}
          <div className="space-y-3 pt-1">
            {filteredEncyclopediaRules.map((rule) => {
              const isExpanded = expandedEncyclopediaId === rule.id;
              return (
                <div
                  key={rule.id}
                  className={`rounded-2xl border transition-all overflow-hidden ${
                    isExpanded
                      ? 'bg-[#12151f] border-[#2d3448] shadow-lg'
                      : 'bg-[#10131b] border-[#1b202c] hover:border-[#262c3d]'
                  }`}
                >
                  {/* Card Header / Click to toggle */}
                  <div
                    onClick={() => toggleEncyclopediaRule(rule.id)}
                    className="p-4 sm:p-5 cursor-pointer flex items-start justify-between gap-4"
                  >
                    <div className="flex items-start gap-3.5">
                      <div
                        className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                          rule.status === 'breach'
                            ? 'bg-red-500/15 text-red-400 border border-red-500/30'
                            : rule.status === 'warning'
                            ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                            : rule.status === 'allowed'
                            ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                            : 'bg-sky-500/15 text-sky-400 border border-sky-500/30'
                        }`}
                      >
                        {rule.status === 'breach' ? (
                          <XCircle className="w-4 h-4" />
                        ) : rule.status === 'warning' ? (
                          <AlertTriangle className="w-4 h-4" />
                        ) : rule.status === 'allowed' ? (
                          <Check className="w-4 h-4" />
                        ) : (
                          <Info className="w-4 h-4" />
                        )}
                      </div>

                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-sm sm:text-base font-bold text-white">
                            {rule.title}
                          </h3>
                          <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-white/[0.06] text-white/50">
                            {rule.categoryLabel}
                          </span>
                        </div>
                        <p className="text-xs text-white/60 leading-relaxed">
                          {rule.summary}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span
                        className={`px-2.5 py-0.5 rounded text-xs font-mono font-bold shrink-0 ${
                          rule.status === 'breach'
                            ? 'bg-red-500/15 text-red-400 border border-red-500/30'
                            : rule.status === 'warning'
                            ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                            : rule.status === 'allowed'
                            ? 'bg-[#a3e635]/15 text-[#a3e635] border border-[#a3e635]/30'
                            : 'bg-sky-500/15 text-sky-300 border border-sky-500/30'
                        }`}
                      >
                        {rule.statusLabel}
                      </span>
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4 text-white/40" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-white/40" />
                      )}
                    </div>
                  </div>

                  {/* Expanded Card Details */}
                  {isExpanded && (
                    <div className="p-5 border-t border-[#1e2330] bg-[#090b10] space-y-4 text-xs">
                      <div className="text-white/80 leading-relaxed space-y-2">
                        <p>{rule.details}</p>
                      </div>

                      {/* Exact Clause if available */}
                      {rule.exactClause && (
                        <div className="p-3.5 rounded-xl bg-red-950/20 border border-red-900/40 space-y-1 font-mono text-[11px] text-red-200">
                          <span className="text-[10px] text-red-400 font-bold uppercase tracking-wider block">
                            Exact Contract Clause (Wishes Tower International Ltd):
                          </span>
                          <p className="italic leading-relaxed">"{rule.exactClause}"</p>
                        </div>
                      )}

                      {/* Dynamic Account Math for Current Capital */}
                      {rule.calcValue && (
                        <div className="p-3.5 rounded-xl bg-[#11141e] border border-white/[0.08] flex items-center justify-between gap-3 text-xs">
                          <div className="space-y-0.5">
                            <span className="text-[10px] font-bold text-[#a3e635] uppercase font-mono">
                              Parameters on your {fmt(selectedCapital)} Account:
                            </span>
                            <p className="text-white font-mono">
                              {rule.calcValue(selectedCapital)}
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Conflict Handling Notice */}
                      {rule.conflictNotice && (
                        <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-200 space-y-1.5 font-mono">
                          <div className="flex items-center gap-1.5 font-bold text-amber-400 uppercase text-[10px]">
                            <AlertTriangle className="w-3.5 h-3.5" />
                            Conflict Detected Between Official Sources
                          </div>
                          <p className="leading-relaxed text-[11px]">{rule.conflictNotice}</p>
                          {rule.conflictDetails && (
                            <p className="text-[10px] text-amber-300/80 pt-1 border-t border-amber-500/20">
                              {rule.conflictDetails}
                            </p>
                          )}
                        </div>
                      )}

                      {/* Verification Status & Model Applicability Badges */}
                      <div className="flex flex-wrap items-center gap-2 pt-1">
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/10 text-white/70">
                          Status: {rule.verificationStatus || 'Official GFT Rule'}
                        </span>
                        {rule.versionDate && (
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/10 text-white/70">
                            Version: {rule.versionDate}
                          </span>
                        )}
                        {rule.consequence && (
                          <span className={`text-[10px] font-mono px-2 py-0.5 rounded ${
                            rule.consequence === 'hard-breach'
                              ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                              : rule.consequence === 'payout-deduction'
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                              : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          }`}>
                            Consequence: {rule.consequence.replace('-', ' ').toUpperCase()}
                          </span>
                        )}
                      </div>

                      {/* Source Footnote */}
                      <div className="flex items-center justify-between gap-2 text-[11px] text-white/40 pt-1 font-mono border-t border-white/[0.04]">
                        <div className="flex items-center gap-1.5">
                          <FileText className="w-3.5 h-3.5 text-white/30" />
                          <span>Source: {rule.sourceDoc}</span>
                        </div>
                        <span className="text-[10px] text-white/30">Verified Sep 2026</span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Independent Disclaimer Banner */}
          <div className="p-3.5 rounded-xl bg-[#0c0e14] border border-white/[0.06] text-center text-[11px] text-white/40 leading-relaxed font-mono">
            This platform is an independent rule-reference tool. The applicable contract and official provider documentation control. Rules may change by model, platform, purchase date, or account version.
          </div>
        </section>

        {/* ══ SCALING PLAN ($2M) & GOAT FIDELITY LOYALTY PROGRAM ══ */}
        <section className="p-6 sm:p-8 rounded-3xl bg-[#0f1118] border border-[#1b1e29] space-y-6 shadow-xl">
          <div className="flex items-start gap-3">
            <div className="w-7 h-7 rounded-full bg-[#a3e635] text-slate-950 font-black text-sm flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
              <TrendingUp className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                  Account Scaling Plan &amp; Loyalty Rewards
                </h2>
                <span className="px-2 py-0.5 rounded text-xs font-mono font-bold bg-[#a3e635]/15 text-[#a3e635] border border-[#a3e635]/30">
                  Up to $2,000,000 Capital
                </span>
              </div>
              <p className="text-xs sm:text-sm text-white/50 mt-0.5">
                Generate 10% net profit over 4 months to scale capital by +25% compounding, up to 100% profit split.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* LEFT 2 COLS: INTERACTIVE SCALING LADDER */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white/70 uppercase tracking-wider font-mono">
                  Select Starting Capital:
                </span>
                <div className="flex items-center gap-1.5">
                  {[25000, 50000, 100000, 200000, 400000].map((c) => (
                    <button
                      key={c}
                      onClick={() => setScalingStartSize(c)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold border transition-all ${
                        scalingStartSize === c
                          ? 'bg-[#151c14] border-[#a3e635] text-[#a3e635]'
                          : 'bg-[#12151e] border-[#1f2432] text-white/60 hover:text-white'
                      }`}
                    >
                      ${c >= 1000 ? `${c / 1000}K` : c}
                    </button>
                  ))}
                </div>
              </div>

              {/* Ladder Table */}
              <div className="rounded-2xl border border-[#1e2330] overflow-hidden bg-[#0c0e14]">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#12151f] text-white/50 font-mono text-[11px] border-b border-[#1e2330]">
                    <tr>
                      <th className="p-3">Stage</th>
                      <th className="p-3">Simulated Capital</th>
                      <th className="p-3">10% Scaling Goal</th>
                      <th className="p-3">Profit Split</th>
                      <th className="p-3">Max Loss (6%)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1e2330]/60 font-mono">
                    {scalingLadder.map((step) => (
                      <tr key={step.step} className="hover:bg-white/[0.02] transition-colors">
                        <td className="p-3 font-bold text-[#a3e635]">Step {step.step}</td>
                        <td className="p-3 text-white font-bold">{fmt(step.capital)}</td>
                        <td className="p-3 text-amber-300">+{fmt(step.target10Pct)}</td>
                        <td className="p-3 text-emerald-400 font-bold">{step.profitSplit}%</td>
                        <td className="p-3 text-red-400">-{fmt(step.maxTrailingLoss)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <p className="text-[11px] text-white/50 leading-relaxed font-sans">
                ✓ Compounding growth calculates against your newly scaled balance each cycle. Risk parameters expand alongside allocation. Demotions do not occur unless drawdown is breached.
              </p>
            </div>

            {/* RIGHT COL: GOAT FIDELITY PROGRAM */}
            <div className="p-5 rounded-2xl bg-[#12151e] border border-[#202534] space-y-4 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-amber-400" />
                  <h3 className="text-base font-bold text-white">GOAT Fidelity Program</h3>
                </div>
                <p className="text-xs text-white/70 leading-relaxed">
                  Official loyalty initiative rewarding repeat traders without requiring coupon codes.
                </p>

                <div className="space-y-2.5 pt-2">
                  <div className="p-3 rounded-xl bg-[#090b10] border border-amber-500/30 space-y-1 text-xs">
                    <span className="text-[11px] font-bold text-amber-400 block uppercase font-mono">
                      Tier 1: 4 Purchases = 50% OFF
                    </span>
                    <p className="text-white/70">
                      Purchase 4 or more challenges to receive a 50% discount on your favorite account size.
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-[#090b10] border border-emerald-500/30 space-y-1 text-xs">
                    <span className="text-[11px] font-bold text-emerald-400 block uppercase font-mono">
                      Tier 2: 9 Purchases = 10th FREE
                    </span>
                    <p className="text-white/70">
                      Invest in 9 challenges total, and your 10th challenge is 100% completely free.
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-white/[0.04] text-[11px] text-white/50 font-sans">
                Claim via 24/7 Live Chat support after reaching 4 or 9 purchases.
              </div>
            </div>
          </div>
        </section>

        {/* ══ REAL GFT PRE-PURCHASE RISKS & DISPUTE WARNINGS ══ */}
        <section className="p-8 bg-gradient-to-b from-red-950/20 via-[#0f1118] to-[#0f1118] border border-red-500/30 rounded-3xl space-y-6 shadow-2xl">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/10 text-red-400 text-xs font-bold border border-red-500/30">
              <AlertTriangle className="w-4 h-4" />
              <span>Real Trader Traps &amp; Verified Contract Clauses</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              🚨 7 Real Operational Traps on Goat Funded Trader
            </h2>
            <p className="text-xs sm:text-sm text-white/70">
              Extracted directly from GFT's Terms &amp; Conditions (Wishes Tower International Ltd) and Trustpilot dispute audits.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Trap 1: 80% Margin Rule */}
            <div className="p-5 bg-[#080A10] border border-red-500/40 rounded-2xl space-y-2.5 shadow-lg">
              <span className="px-2 py-0.5 text-[10px] font-semibold uppercase rounded bg-red-500/20 text-red-400 border border-red-500/40 flex items-center gap-1 w-fit font-mono">
                <Flame className="w-3 h-3" />
                #1 Review Trap: 80% Margin Rule
              </span>
              <h3 className="text-sm font-bold text-white">
                Using &gt;80% Margin Deducts All Profits at Payout
              </h3>
              <p className="text-xs text-white/70 leading-relaxed">
                If your concurrent open positions ever consume more than 80% of available margin, GFT flags this as "all-or-nothing gambling". When you request a payout, profits can be confiscated.
              </p>
              <div className="p-2.5 rounded-lg bg-red-950/30 border border-red-900/50 text-[11px] text-red-300 font-mono">
                <strong>Limit on {fmt(selectedCapital)}:</strong> Keep total used margin strictly below {fmt(selectedCapital * 0.8)}.
              </div>
            </div>

            {/* Trap 2: Coordinated Trading / IP Matching */}
            <div className="p-5 bg-[#080A10] border border-red-500/30 rounded-2xl space-y-2.5 shadow-lg">
              <span className="px-2 py-0.5 text-[10px] font-semibold uppercase rounded bg-red-500/20 text-red-400 border border-red-500/40 flex items-center gap-1 w-fit font-mono">
                #2 Trap: IP &amp; Device Match Ban
              </span>
              <h3 className="text-sm font-bold text-white">
                Shared WiFi, VPN, or Multi-Device Banning
              </h3>
              <p className="text-xs text-white/70 leading-relaxed">
                Section 4.4 of GFT terms bans using devices or IP addresses matching other traders. Logging in from public WiFi or VPNs triggers automated coordinated trading bans without refunds.
              </p>
              <div className="p-2.5 rounded-lg bg-white/[0.04] text-[11px] text-white/50">
                <strong>Rule of thumb:</strong> Only trade from a dedicated personal connection with zero VPN.
              </div>
            </div>

            {/* Trap 3: 5 PM EST / 00:00 Rollover Spread Spikes */}
            <div className="p-5 bg-[#080A10] border border-orange-500/30 rounded-2xl space-y-2.5">
              <span className="px-2 py-0.5 text-[10px] font-bold uppercase rounded bg-orange-500/20 text-orange-400 border border-orange-500/40 flex items-center gap-1 w-fit font-mono">
                #3 Daily Loss at Rollover
              </span>
              <h3 className="text-sm font-bold text-white">
                Spread Widening at 5 PM EST (00:00 Server)
              </h3>
              <p className="text-xs text-white/70 leading-relaxed">
                Daily loss resets at 5 PM EST. Holding floating drawdowns into rollover can cause widening spreads to touch the daily floor and terminate your account instantly.
              </p>
              <div className="p-2.5 rounded-lg bg-white/[0.04] text-[11px] text-white/50 font-mono">
                <strong>Funded Daily Cap:</strong> {fmt(masterDailyLossDollar)} on {fmt(selectedCapital)}.
              </div>
            </div>

            {/* Trap 4: Single Share Equity CFD Earnings Rule */}
            <div className="p-5 bg-[#080A10] border border-amber-500/30 rounded-2xl space-y-2.5">
              <span className="px-2 py-0.5 text-[10px] font-bold uppercase rounded bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center gap-1 w-fit font-mono">
                #4 Equity CFD Earnings Hard Breach
              </span>
              <h3 className="text-sm font-bold text-white">
                Close Single Share CFDs by 3:50 PM ET Before Earnings
              </h3>
              <p className="text-xs text-white/70 leading-relaxed">
                Section 4.4 explicitly mandates that any stock CFD holding into an earnings release is an immediate hard breach. Positions must close by 3:50 PM Eastern.
              </p>
            </div>

            {/* Trap 5: 3 Active Trading Days with 0.5%+ Profit */}
            <div className="p-5 bg-[#080A10] border border-amber-500/30 rounded-2xl space-y-2.5">
              <span className="px-2 py-0.5 text-[10px] font-bold uppercase rounded bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center gap-1 w-fit font-mono">
                #5 First Payout 3-Day Rule
              </span>
              <h3 className="text-sm font-bold text-white">
                3 Trading Days with &ge;0.5% Profit Each
              </h3>
              <p className="text-xs text-white/70 leading-relaxed">
                To request your first payout on Pay Later / GOAT models, you must log at least 3 individual days where closed profit is 0.5% or more of starting balance.
              </p>
            </div>

            {/* Trap 6: All Trades Closed Before Payout */}
            <div className="p-5 bg-[#080A10] border border-purple-500/30 rounded-2xl space-y-2.5">
              <span className="px-2 py-0.5 text-[10px] font-bold uppercase rounded bg-purple-500/20 text-purple-400 border border-purple-500/40 flex items-center gap-1 w-fit font-mono">
                #6 Active Orders During Payout
              </span>
              <h3 className="text-sm font-bold text-white">
                All Positions &amp; Pending Orders Must Be Closed
              </h3>
              <p className="text-xs text-white/70 leading-relaxed">
                Submitting a reward withdrawal while any open trade or pending limit/stop order exists will trigger an automatic gateway rejection.
              </p>
            </div>

            {/* Trap 7: Crypto Weekend Volatility & 1:5 Leverage */}
            <div className="p-5 bg-[#080A10] border border-sky-500/30 rounded-2xl space-y-2.5 md:col-span-2 lg:col-span-3">
              <span className="px-2 py-0.5 text-[10px] font-bold uppercase rounded bg-sky-500/20 text-sky-400 border border-sky-500/40 flex items-center gap-1 w-fit font-mono">
                #7 Crypto Trading Reality
              </span>
              <h3 className="text-sm font-bold text-white">
                Crypto Trades 24/7 with 1:5 Leverage — Manage Weekend Gap &amp; Spread Spikes
              </h3>
              <p className="text-xs text-white/70 leading-relaxed">
                Because Goat Funded Trader includes crypto inside the CFD account, your crypto trades remain active across the weekend while FX and indices are closed. Ensure crypto margin doesn't breach your 2% floating loss rule or max trailing floor during volatile weekend moves!
              </p>
            </div>
          </div>
        </section>

        {/* ══ INTERACTIVE RISK SIMULATOR ══ */}
        <section className="space-y-4">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Sliders className="w-5 h-5 text-[#a3e635]" />
              Interactive Risk Simulator — {fmt(selectedCapital)} {programConfig.name}
            </h2>
            <p className="text-xs text-white/50 mt-1">
              Simulate drawdown scenarios, lot sizes, and pips against Goat Funded Trader's exact contract limits.
            </p>
          </div>
          <RiskSimulator
            initialNominalSize={selectedCapital}
            initialDailyLossPct={programConfig.evalDailyLoss || 3}
            initialMaxLossPct={programConfig.evalMaxLoss || 6}
            initialDrawdownType={programConfig.maxLossType.includes('Trailing') ? 'trailing_equity' : 'static'}
          />
        </section>

        {/* ══ REAL VERIFIED REVIEWS FROM GOAT FUNDED TRADER ══ */}
        {firm.reviewsOverview && (
          <section className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.06] pb-4">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2.5">
                  <Award className="w-5 h-5 text-[#a3e635]" />
                  Verified Trader Reviews &amp; Compliance Responses
                </h2>
                <p className="text-xs sm:text-sm text-white/50 mt-1">
                  1,123+ Trustpilot &amp; TradingPilot verified reviews analyzed with compliance policy records.
                </p>
              </div>
              <div className="flex items-center gap-4 bg-[#111318] p-3 rounded-2xl border border-[#1F2228] shrink-0">
                <div className="text-right">
                  <div className="text-xl font-extrabold text-white font-mono flex items-center justify-end gap-1">
                    <span className="text-[#a3e635]">{firm.reviewsOverview.averageRating}</span>
                    <span className="text-white/40 text-sm">/ 5.0</span>
                  </div>
                  <span className="text-[11px] text-white/50 block">
                    {firm.reviewsOverview.totalReviews} verified reviews
                  </span>
                </div>
                <div className="w-10 h-10 rounded-xl bg-[#151c14] border border-[#a3e635]/40 flex items-center justify-center text-[#a3e635] font-black text-sm">
                  4.2★
                </div>
              </div>
            </div>

            {/* Sentiment Bar & Top Complaint Breakdown */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Sentiment Distribution */}
              <div className="p-4 sm:p-5 rounded-2xl bg-[#0f1118] border border-[#1b1e29] space-y-3 shadow-md">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-white/80">Trader Sentiment Distribution</span>
                  <span className="text-[#a3e635] font-mono font-bold">74% Positive</span>
                </div>
                <div className="w-full h-3 rounded-full bg-white/[0.06] overflow-hidden flex">
                  <div style={{ width: '74%' }} className="bg-[#a3e635] h-full" title="74% Positive" />
                  <div style={{ width: '14%' }} className="bg-amber-400 h-full" title="14% Neutral" />
                  <div style={{ width: '12%' }} className="bg-rose-500 h-full" title="12% Negative" />
                </div>
                <div className="flex items-center justify-between text-[11px] font-mono text-white/50 pt-1">
                  <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-[#a3e635]" /> Positive (74%)</span>
                  <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-amber-400" /> Neutral (14%)</span>
                  <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-rose-500" /> Critical (12%)</span>
                </div>
              </div>

              {/* Top Complaint Themes */}
              <div className="p-4 sm:p-5 rounded-2xl bg-[#0f1118] border border-[#1b1e29] space-y-3 shadow-md">
                <span className="text-xs font-semibold text-white/80 block">Top Scrutinized Compliance Topics</span>
                <div className="grid grid-cols-3 gap-2">
                  <div className="p-2.5 rounded-xl bg-[#131620] border border-[#222838] text-center">
                    <span className="text-[10px] text-white/50 uppercase font-mono block">Payout Checks</span>
                    <span className="text-sm font-bold text-amber-400 font-mono">34%</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-[#131620] border border-[#222838] text-center">
                    <span className="text-[10px] text-white/50 uppercase font-mono block">IP / Copy Rules</span>
                    <span className="text-sm font-bold text-sky-400 font-mono">24%</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-[#131620] border border-[#222838] text-center">
                    <span className="text-[10px] text-white/50 uppercase font-mono block">30D Inactivity</span>
                    <span className="text-sm font-bold text-rose-400 font-mono">16%</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Individual Reviews with Firm Responses */}
            {firm.reviewsOverview.recentReviews && firm.reviewsOverview.recentReviews.length > 0 && (
              <div className="space-y-4">
                {firm.reviewsOverview.recentReviews.map((rev) => (
                  <ReviewCard key={rev.id} review={rev} />
                ))}
              </div>
            )}
          </section>
        )}
      </div>
    </div>
  );
};
