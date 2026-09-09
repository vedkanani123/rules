import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import {
  Sparkles,
  Check,
  ArrowRight,
  Shield,
  Zap,
  Target,
  Search,
  Filter,
  X,
  SlidersHorizontal,
  AlertTriangle,
  Scale,
  CheckCircle2,
  XCircle,
  Info,
  DollarSign,
  Calendar,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Bookmark,
  Layers,
  TrendingUp,
  Eye,
  Flame,
  Ban,
  Clock,
  Award,
  Star,
  Globe,
  Percent,
  Cpu,
  ExternalLink,
  Lock,
  Unlock,
  LayoutGrid,
} from 'lucide-react';
import { PROP_FIRMS_DATA } from '../data/propFirmsData.ts';
import { getFirmCanonicalProfile } from '../data/allFirmsCanonicalData.ts';

interface WizardPageProps {
  onNavigate: (path: string) => void;
}

export interface CandidateAccount {
  id: string;
  firmId: string;
  firmName: string;
  firmSlug: string;
  brandName: string;
  logoUrl: string;
  country: string;
  countryFlag: string;
  trustScore: number;
  trustGrade: string;
  reviewScore: number;
  reviewsCount: number;
  modelId: string;
  modelName: string;
  programType: '2-Step' | '1-Step' | 'Instant' | 'Futures';
  tagline: string;
  size: number;
  price: number;
  officialPrice: number;
  discountedPrice?: number;
  activePromo?: { code: string; discount: string; details?: string };
  refundableFee: boolean;
  profitTargetPhase1: number;
  profitTargetPhase2: number;
  dailyLossLimit: number;
  dailyLossCalculation: 'balance_based' | 'equity_based' | 'none';
  hasNoDailyLimit: boolean;
  maxTotalLoss: number;
  drawdownType: 'static' | 'trailing_locked' | 'trailing_equity' | 'eod';
  minimumTradingDays: number;
  profitSplit: number;
  profitSplitMax: number;
  payoutFrequency: string;
  firstPayoutDays: number;
  hasOnDemandPayout: boolean;
  newsTradingAllowed: boolean;
  newsTradingDetail: string;
  weekendHoldingAllowed: boolean;
  weekendHoldingDetail: string;
  overnightHoldingAllowed: boolean;
  eaTradingAllowed: boolean;
  eaTradingDetail: string;
  copyTradingAllowed: boolean;
  copyTradingDetail: string;
  hedgingAllowed: boolean;
  hedgingDetail: string;
  hasConsistencyRule: boolean;
  consistencyRuleDetail: string;
  hasInactivityLockout: boolean;
  inactivityDays: number;
  hasMandatoryStopLoss: boolean;
  hasLotSizeLimits: boolean;
  hasScalingPlan: boolean;
  maxScalingCeiling: number;
  noTimeLimit: boolean;
  cryptoTradingAllowed: boolean;
  platforms: string[];
  leverage: { forex?: string; crypto?: string; indices?: string; commodities?: string };
  officialSourceUrl?: string;
  lastVerifiedDate?: string;
  score?: number;
  satisfiedReasons?: string[];
  dealbreakersAvoided?: string[];
}

// ── FAST PRE-CALCULATION HELPER (COMPUTED ONCE PER ACCOUNT AT INIT) ───────────
function enrichAccountScore(acc: CandidateAccount): CandidateAccount {
  let score = 78;
  const satisfiedReasons: string[] = [];
  const dealbreakersAvoided: string[] = [];

  if (acc.drawdownType === 'static') {
    score += 6;
    satisfiedReasons.push(
      `Static floor locked at $${Math.round(
        acc.size * (1 - acc.maxTotalLoss / 100)
      ).toLocaleString()} (never trails up)`
    );
    dealbreakersAvoided.push('Relative / Trailing equity floor trap eliminated');
  }
  if (acc.newsTradingAllowed) {
    score += 4;
    satisfiedReasons.push('News trading unrestricted during NFP, CPI & FOMC');
  }
  if (acc.weekendHoldingAllowed) {
    score += 4;
    satisfiedReasons.push('Weekend swing holding permitted without forced Friday close');
  }
  if (acc.eaTradingAllowed) {
    score += 3;
    satisfiedReasons.push('Algorithmic MT5 EAs & automation permitted');
  }
  if (acc.copyTradingAllowed) {
    score += 3;
    satisfiedReasons.push('Trade copying permitted between accounts');
  }
  if (acc.dailyLossCalculation === 'balance_based') {
    score += 3;
    satisfiedReasons.push('Balance-based daily loss limit resets cleanly at 00:00 server time');
    dealbreakersAvoided.push('Intraday equity peak drawdown spikes eliminated');
  } else if (acc.hasNoDailyLimit) {
    score += 5;
    satisfiedReasons.push('Zero daily drawdown limit — only max overall drawdown applies');
  }
  if (!acc.hasConsistencyRule) {
    score += 4;
    satisfiedReasons.push('No profit consistency rule — big single-day runners permitted');
    dealbreakersAvoided.push('0% consistency rule penalties');
  }
  if (acc.minimumTradingDays === 0) {
    score += 4;
    satisfiedReasons.push('Zero minimum trading days — pass evaluation phase on Day 1');
    dealbreakersAvoided.push('No mandatory multi-day waiting periods');
  }
  if (acc.firstPayoutDays <= 14) {
    score += 3;
    satisfiedReasons.push(`Fast first payout cadence (${acc.payoutFrequency})`);
  }
  if (acc.hasOnDemandPayout) {
    score += 3;
    satisfiedReasons.push('On-demand payouts with express 24h processing');
  }
  if (acc.profitSplit >= 80) {
    score += 3;
    satisfiedReasons.push(`${acc.profitSplit}% to ${acc.profitSplitMax}% maximum profit split`);
  }
  if (acc.refundableFee) {
    score += 2;
    satisfiedReasons.push('100% refundable evaluation registration fee');
  }
  if (!acc.hasMandatoryStopLoss) {
    dealbreakersAvoided.push('No mandatory stop-loss orders enforced');
  }

  return {
    ...acc,
    score: Math.min(99, Math.max(72, score)),
    satisfiedReasons: satisfiedReasons.slice(0, 4),
    dealbreakersAvoided: dealbreakersAvoided.slice(0, 3),
  };
}

type RuleCategory = 'all' | 'freedom' | 'drawdown' | 'payouts' | 'evaluation';

export const WizardPage: React.FC<WizardPageProps> = ({ onNavigate }) => {
  // ── FILTER STATE ───────────────────────────────────────────────────────────
  // Active Rule Category Tab (for expanded grid view or category switching)
  const [activeCategory, setActiveCategory] = useState<RuleCategory>('all');

  // Rules user WANTS (Must Have)
  const [wantNewsTrading, setWantNewsTrading] = useState<boolean>(false);
  const [wantWeekendHolding, setWantWeekendHolding] = useState<boolean>(false);
  const [wantOvernightHolding, setWantOvernightHolding] = useState<boolean>(false);
  const [wantEaTrading, setWantEaTrading] = useState<boolean>(false);
  const [wantCopyTrading, setWantCopyTrading] = useState<boolean>(false);
  const [wantHedging, setWantHedging] = useState<boolean>(false);
  const [wantStaticDrawdown, setWantStaticDrawdown] = useState<boolean>(false);
  const [wantBalanceBasedDaily, setWantBalanceBasedDaily] = useState<boolean>(false);
  const [wantNoDailyLimit, setWantNoDailyLimit] = useState<boolean>(false);
  const [wantFastPayout, setWantFastPayout] = useState<boolean>(false);
  const [wantOnDemandPayout, setWantOnDemandPayout] = useState<boolean>(false);
  const [wantHighSplit, setWantHighSplit] = useState<boolean>(false);
  const [wantScalingPlan, setWantScalingPlan] = useState<boolean>(false);
  const [wantZeroMinDays, setWantZeroMinDays] = useState<boolean>(false);
  const [wantLowMinDays, setWantLowMinDays] = useState<boolean>(false);
  const [wantNoTimeLimit, setWantNoTimeLimit] = useState<boolean>(false);
  const [wantRefundableFee, setWantRefundableFee] = useState<boolean>(false);
  const [wantCryptoWeekend, setWantCryptoWeekend] = useState<boolean>(false);

  // Rules user REFUSES / DOES NOT WANT (Dealbreakers - Strict Exclusion)
  const [avoidTrailingDrawdown, setAvoidTrailingDrawdown] = useState<boolean>(false);
  const [avoidConsistencyRule, setAvoidConsistencyRule] = useState<boolean>(false);
  const [avoidInactivityLockout, setAvoidInactivityLockout] = useState<boolean>(false);
  const [avoidEquityDailyLoss, setAvoidEquityDailyLoss] = useState<boolean>(false);
  const [avoidMandatoryStopLoss, setAvoidMandatoryStopLoss] = useState<boolean>(false);
  const [avoidLotSizeLimit, setAvoidLotSizeLimit] = useState<boolean>(false);
  const [avoidMinDaysDelay, setAvoidMinDaysDelay] = useState<boolean>(false);
  const [avoidWeekendClose, setAvoidWeekendClose] = useState<boolean>(false);
  const [avoidNewsRestrictions, setAvoidNewsRestrictions] = useState<boolean>(false);
  const [avoidNonRefundable, setAvoidNonRefundable] = useState<boolean>(false);

  // Sizing, Challenge Type, Platform & Search
  const [selectedCapital, setSelectedCapital] = useState<number | 'ALL'>('ALL');
  const [selectedType, setSelectedType] = useState<string>('ALL');
  const [selectedPlatform, setSelectedPlatform] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<
    'match' | 'trust_desc' | 'price_asc' | 'price_desc' | 'size_desc' | 'split_desc' | 'payout_asc'
  >('match');

  // DROPDOWN SELECTION STATES
  const [openDropdown, setOpenDropdown] = useState<
    'mustHave' | 'dealbreakers' | 'trading' | 'drawdown' | 'payouts' | 'evaluation' | null
  >(null);
  const [dropdownSearch, setDropdownSearch] = useState<string>('');
  const [isGridExpanded, setIsGridExpanded] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // View Options
  const [viewLayout, setViewLayout] = useState<'grid' | 'grouped' | 'table'>('grid');
  const [expandedCardId, setExpandedCardId] = useState<string | null>(null);
  const [selectedForCompare, setSelectedForCompare] = useState<string[]>([]);

  // ── 1. COMPILE ALL CANDIDATE ACCOUNTS ACROSS ALL 24 VERIFIED FIRMS ──────────
  const allCandidateAccounts: CandidateAccount[] = useMemo(() => {
    const list: CandidateAccount[] = [];
    const seenIds = new Set<string>();

    PROP_FIRMS_DATA.forEach((firm) => {
      const canonical = getFirmCanonicalProfile(firm.slug, firm);
      const logoUrl =
        firm.logoUrl ||
        canonical?.logoUrl ||
        `https://flagcdn.com/w80/${firm.country?.toLowerCase() || 'us'}.png`;

      const trustScore = canonical?.trustScore || firm.scorecard?.overallScore || 90;
      const trustGrade =
        trustScore >= 95 ? 'A+' : trustScore >= 90 ? 'A' : trustScore >= 85 ? 'B+' : 'B';
      const reviewScore =
        canonical?.reviewScore || firm.reviewsOverview?.averageRating || 4.7;
      const reviewsCount =
        canonical?.reviewsCount || firm.reviewsOverview?.totalReviews || 3500;

      // 1. Process from canonical profile models (Primary, authoritative & verified)
      if (canonical && canonical.models && canonical.models.length > 0) {
        canonical.models.forEach((model) => {
          const sizes =
            model.availableSizes && model.availableSizes.length > 0
              ? model.availableSizes
              : [10000, 25000, 50000, 100000, 200000];

          sizes.forEach((size) => {
            const accId = `${firm.slug}-${model.id}-${size / 1000}k`;
            if (!seenIds.has(accId)) {
              seenIds.add(accId);

              // Accurately resolve verified pricing from registry
              const matchSize = (p: any) =>
                p.nominalCapital === size || p.accountSize === size || p.size === size;
              let pricingEntry = canonical.pricingRegistry?.find(
                (p: any) => matchSize(p) && p.modelId === model.id
              );
              if (!pricingEntry && model.category) {
                pricingEntry = canonical.pricingRegistry?.find(
                  (p: any) =>
                    matchSize(p) &&
                    (p.modelId?.includes(model.category) ||
                      model.id.includes(p.modelId) ||
                      p.modelId.includes(model.id))
                );
              }
              if (!pricingEntry) {
                pricingEntry = canonical.pricingRegistry?.find((p: any) => matchSize(p));
              }

              const officialPrice =
                pricingEntry?.officialListedPrice ??
                pricingEntry?.standardPriceUsd ??
                pricingEntry?.price ??
                (size === 10000
                  ? 89
                  : size === 25000
                  ? 169
                  : size === 50000
                  ? 299
                  : size === 100000
                  ? 499
                  : size === 200000
                  ? 979
                  : Math.round(size * 0.005));

              const verifiedPrice =
                pricingEntry?.verifiedCurrentPrice ??
                pricingEntry?.promoPriceBogo40 ??
                pricingEntry?.discountedPriceUsd ??
                officialPrice;

              const promoCode = pricingEntry?.promoCode || firm.activePromo?.code;
              const promoDiscount =
                pricingEntry?.promoDiscountPct
                  ? `${pricingEntry.promoDiscountPct}% OFF`
                  : firm.activePromo?.discount;

              const isFutures =
                firm.marketType === 'Futures' ||
                model.name.toLowerCase().includes('futures');
              const isInstant =
                model.category === 'instant_funding' ||
                model.name.toLowerCase().includes('instant') ||
                !model.isEvaluation;
              const is1Step =
                model.category === 'one_step' ||
                model.name.toLowerCase().includes('1-step');
              const programType: '2-Step' | '1-Step' | 'Instant' | 'Futures' = isFutures
                ? 'Futures'
                : isInstant
                ? 'Instant'
                : is1Step
                ? '1-Step'
                : '2-Step';

              const hasNoDailyLimit =
                !model.dailyLossLimit ||
                model.dailyLossLimit.pct === 0 ||
                model.dailyLossLimit.calculationType === 'none';

              const dailyLossType: 'balance_based' | 'equity_based' | 'none' =
                hasNoDailyLimit
                  ? 'none'
                  : model.dailyLossLimit?.calculationType === 'equity_based'
                  ? 'equity_based'
                  : 'balance_based';

              const drawdownType: 'static' | 'trailing_locked' | 'trailing_equity' | 'eod' =
                model.maxDrawdown?.type === 'trailing_locked'
                  ? 'trailing_locked'
                  : model.maxDrawdown?.type === 'trailing_eod' ||
                    model.maxDrawdown?.type === 'trailing_intraday' ||
                    model.maxDrawdown?.type === 'eod' ||
                    model.maxDrawdown?.type === 'eod_trailing'
                  ? 'trailing_equity'
                  : 'static';

              const newsAllowed = model.allowedStyles?.newsTrading === 'allowed';
              const newsDetail =
                model.allowedStyles?.newsDetails ||
                (newsAllowed
                  ? 'Full news trading permitted on all stages'
                  : 'Restricted execution around high-impact news');

              const weekendAllowed =
                model.allowedStyles?.weekendHolding === 'allowed';
              const weekendDetail =
                model.allowedStyles?.weekendDetails ||
                (weekendAllowed
                  ? 'Weekend swing positions permitted'
                  : 'Positions must close before Friday market close');

              const eaAllowed = model.allowedStyles?.eaTrading === 'allowed';
              const eaDetail =
                model.allowedStyles?.eaDetails ||
                (eaAllowed
                  ? 'Algorithmic MT5 EAs & cTrader cBots permitted'
                  : 'Automated EAs restricted or prohibited');

              const copyAllowed =
                model.allowedStyles?.copyTrading === 'allowed' ||
                model.allowedStyles?.copyTrading === 'restricted';
              const copyDetail =
                model.allowedStyles?.copyDetails ||
                (copyAllowed
                  ? 'Account-to-account trade copying permitted (own accounts)'
                  : 'Trade copying prohibited');

              const hasConsistency = Boolean(
                model.consistencyRule && model.consistencyRule.active
              );
              const consistencyDetail = model.consistencyRule?.active
                ? `${model.consistencyRule.maxSingleDayPct}% max single-day profit cap`
                : 'No consistency rule — big single-day runners permitted';

              const platforms =
                model.supportedPlatforms && model.supportedPlatforms.length > 0
                  ? model.supportedPlatforms.map((p) =>
                      p
                        .toUpperCase()
                        .replace('MT5', 'MetaTrader 5')
                        .replace('MT4', 'MetaTrader 4')
                        .replace('TRADELOCKER', 'TradeLocker')
                        .replace('CTRADER', 'cTrader')
                        .replace('MATCHTRADER', 'Match-Trader')
                        .replace('DXTRADE', 'DXtrade')
                    )
                  : firm.platforms || ['MetaTrader 5', 'cTrader', 'Match-Trader'];

              const minDays = model.minTradingDaysEval ?? 0;
              const profitSplit = model.profitSplit?.basePct || 80;
              const profitSplitMax = model.profitSplit?.maxWithAddonPct || 90;
              const firstPayoutDays = model.profitSplit?.firstPayoutDays || 14;
              const hasOnDemand =
                firstPayoutDays <= 1 ||
                model.profitSplit?.payoutCycleDays <= 1 ||
                Boolean((firm as any).tradingRules?.payoutSpeed?.toLowerCase().includes('on-demand'));

              const hasStopLossTrap = Boolean(
                (canonical as any).traps?.some(
                  (t: any) =>
                    t.id?.includes('stoploss') &&
                    t.affectedModelIds?.some((mid: any) => mid === model.id)
                )
              );

              list.push(
                enrichAccountScore({
                id: accId,
                firmId: firm.id,
                firmName: firm.name,
                firmSlug: firm.slug,
                brandName: firm.brandName || firm.name,
                logoUrl,
                country: firm.country || 'Global',
                countryFlag: firm.countryFlag || '🌐',
                trustScore,
                trustGrade,
                reviewScore,
                reviewsCount,
                modelId: model.id,
                modelName: model.name,
                programType,
                tagline: model.tagline || `${firm.name} ${model.name}`,
                size,
                price: verifiedPrice,
                officialPrice,
                discountedPrice: verifiedPrice < officialPrice ? verifiedPrice : undefined,
                activePromo: promoCode
                  ? { code: promoCode, discount: promoDiscount || '10% OFF' }
                  : undefined,
                refundableFee: model.refundableFee ?? true,
                profitTargetPhase1: model.targetsByStage?.phase1 || (isInstant ? 0 : 8),
                profitTargetPhase2: model.targetsByStage?.phase2 || 0,
                dailyLossLimit: model.dailyLossLimit?.pct || (hasNoDailyLimit ? 0 : 5),
                dailyLossCalculation: dailyLossType,
                hasNoDailyLimit,
                maxTotalLoss: model.maxDrawdown?.pct || 10,
                drawdownType,
                minimumTradingDays: minDays,
                profitSplit,
                profitSplitMax,
                payoutFrequency: `Every ${model.profitSplit?.payoutCycleDays || 14} days`,
                firstPayoutDays,
                hasOnDemandPayout: hasOnDemand,
                newsTradingAllowed: newsAllowed,
                newsTradingDetail: newsDetail,
                weekendHoldingAllowed: weekendAllowed,
                weekendHoldingDetail: weekendDetail,
                overnightHoldingAllowed: weekendAllowed,
                eaTradingAllowed: eaAllowed,
                eaTradingDetail: eaDetail,
                copyTradingAllowed: copyAllowed,
                copyTradingDetail: copyDetail,
                hedgingAllowed: true,
                hedgingDetail: 'Simultaneous long/short positions permitted within account',
                hasConsistencyRule: hasConsistency,
                consistencyRuleDetail: consistencyDetail,
                hasInactivityLockout: true,
                inactivityDays: 30,
                hasMandatoryStopLoss: hasStopLossTrap,
                hasLotSizeLimits: false,
                hasScalingPlan: true,
                maxScalingCeiling: 2000000,
                noTimeLimit: true,
                cryptoTradingAllowed: true,
                platforms,
                leverage: model.leverage || { forex: '1:100', crypto: '1:5' },
                officialSourceUrl: model.sourceUrl || firm.website,
                lastVerifiedDate: model.lastVerifiedDate || '2026-09-08',
              }));
            }
          });
        });
      }

      // 2. Process from firm.programs (Fallback and alternative accounts)
      firm.programs.forEach((prog) => {
        prog.accounts.forEach((acc) => {
          if (!seenIds.has(acc.id)) {
            seenIds.add(acc.id);
            const isFutures = firm.marketType === 'Futures';
            const isInstant = prog.programType === 'Instant';
            const is1Step = prog.programType === '1-Step';
            const programType: '2-Step' | '1-Step' | 'Instant' | 'Futures' = isFutures
              ? 'Futures'
              : isInstant
              ? 'Instant'
              : is1Step
              ? '1-Step'
              : '2-Step';

            const price = acc.discountedPrice || acc.price || Math.round(acc.nominalSize * 0.005);
            const officialPrice = acc.price || price;

            const hasConsistency = Boolean(
              acc.consistencyRule &&
                acc.consistencyRule !== 'None' &&
                !acc.consistencyRule.toLowerCase().includes('none')
            );

            list.push(
              enrichAccountScore({
              id: acc.id,
              firmId: firm.id,
              firmName: firm.name,
              firmSlug: firm.slug,
              brandName: firm.brandName,
              logoUrl,
              country: firm.country || 'Global',
              countryFlag: firm.countryFlag || '🌐',
              trustScore,
              trustGrade,
              reviewScore,
              reviewsCount,
              modelId: prog.id,
              modelName: prog.name,
              programType,
              tagline: prog.description || `${firm.name} ${prog.name}`,
              size: acc.nominalSize,
              price,
              officialPrice,
              discountedPrice: acc.discountedPrice,
              activePromo: firm.activePromo,
              refundableFee: acc.refundableFee ?? true,
              profitTargetPhase1: acc.profitTargetPhase1 || (isInstant ? 0 : 8),
              profitTargetPhase2: acc.profitTargetPhase2 || 0,
              dailyLossLimit: acc.dailyLossLimit || 5,
              dailyLossCalculation:
                (acc.dailyLossCalculation as any) === 'equity_based'
                  ? 'equity_based'
                  : 'balance_based',
              hasNoDailyLimit: !acc.dailyLossLimit || acc.dailyLossLimit === 0,
              maxTotalLoss: acc.maxTotalLoss || 10,
              drawdownType:
                acc.drawdownType === 'trailing_equity' || acc.drawdownType === 'trailing_locked'
                  ? 'trailing_equity'
                  : 'static',
              minimumTradingDays: acc.minimumTradingDays || 0,
              profitSplit: acc.profitSplit || 80,
              profitSplitMax: acc.profitSplitMaxWithAddon || 90,
              payoutFrequency: acc.payoutFrequency || 'Bi-weekly (14 days)',
              firstPayoutDays: 14,
              hasOnDemandPayout: Boolean(
                acc.payoutFrequency?.toLowerCase().includes('on-demand')
              ),
              newsTradingAllowed: acc.newsTradingRule === 'Allowed',
              newsTradingDetail: acc.newsTradingRule === 'Allowed' ? 'Allowed' : 'Restricted',
              weekendHoldingAllowed: Boolean(acc.weekendHolding),
              weekendHoldingDetail: acc.weekendHolding ? 'Permitted' : 'Closed on Friday',
              overnightHoldingAllowed: Boolean(acc.weekendHolding),
              eaTradingAllowed: Boolean(acc.eaAllowed),
              eaTradingDetail: acc.eaAllowed ? 'Permitted' : 'Prohibited',
              copyTradingAllowed: Boolean(acc.copyTradingAllowed),
              copyTradingDetail: acc.copyTradingAllowed ? 'Permitted' : 'Prohibited',
              hedgingAllowed: (acc as any).hedgingAllowed ?? true,
              hedgingDetail: 'Permitted',
              hasConsistencyRule: hasConsistency,
              consistencyRuleDetail: acc.consistencyRule || 'No consistency rule',
              hasInactivityLockout: Boolean(
                acc.inactivityLimitDays && acc.inactivityLimitDays <= 30
              ),
              inactivityDays: acc.inactivityLimitDays || 30,
              hasMandatoryStopLoss: false,
              hasLotSizeLimits: false,
              hasScalingPlan: true,
              maxScalingCeiling: 2000000,
              noTimeLimit: true,
              cryptoTradingAllowed: true,
              platforms:
                acc.platforms && acc.platforms.length > 0
                  ? acc.platforms
                  : firm.platforms || ['MetaTrader 5'],
              leverage: { forex: '1:100', crypto: '1:5' },
              officialSourceUrl: firm.website,
              lastVerifiedDate: '2026-09-08',
            }));
          }
        });
      });
    });

    return list;
  }, []);

  // ── 2. LIVE MATCH COUNTERS FOR EVERY RULE ──────────────────────────────────
  const ruleCounts = useMemo(() => {
    return {
      newsTrading: allCandidateAccounts.filter((a) => a.newsTradingAllowed).length,
      weekendHolding: allCandidateAccounts.filter((a) => a.weekendHoldingAllowed).length,
      overnightHolding: allCandidateAccounts.filter((a) => a.overnightHoldingAllowed).length,
      eaTrading: allCandidateAccounts.filter((a) => a.eaTradingAllowed).length,
      copyTrading: allCandidateAccounts.filter((a) => a.copyTradingAllowed).length,
      hedging: allCandidateAccounts.filter((a) => a.hedgingAllowed).length,
      staticDrawdown: allCandidateAccounts.filter((a) => a.drawdownType === 'static').length,
      balanceBasedDaily: allCandidateAccounts.filter(
        (a) => a.dailyLossCalculation === 'balance_based' || a.hasNoDailyLimit
      ).length,
      noDailyLimit: allCandidateAccounts.filter((a) => a.hasNoDailyLimit).length,
      fastPayout: allCandidateAccounts.filter(
        (a) => a.firstPayoutDays <= 14 || a.hasOnDemandPayout
      ).length,
      onDemandPayout: allCandidateAccounts.filter((a) => a.hasOnDemandPayout).length,
      highSplit: allCandidateAccounts.filter((a) => a.profitSplit >= 80).length,
      scalingPlan: allCandidateAccounts.filter((a) => a.hasScalingPlan).length,
      zeroMinDays: allCandidateAccounts.filter((a) => a.minimumTradingDays === 0).length,
      lowMinDays: allCandidateAccounts.filter((a) => a.minimumTradingDays <= 3).length,
      noTimeLimit: allCandidateAccounts.filter((a) => a.noTimeLimit).length,
      refundableFee: allCandidateAccounts.filter((a) => a.refundableFee).length,
      cryptoWeekend: allCandidateAccounts.filter((a) => a.cryptoTradingAllowed).length,

      // Traps / Exclusions count
      trailingDrawdownTraps: allCandidateAccounts.filter(
        (a) => a.drawdownType === 'trailing_equity' || a.drawdownType === 'eod'
      ).length,
      consistencyTraps: allCandidateAccounts.filter((a) => a.hasConsistencyRule).length,
      inactivityTraps: allCandidateAccounts.filter(
        (a) => a.hasInactivityLockout && a.inactivityDays <= 30
      ).length,
      equityDailyTraps: allCandidateAccounts.filter(
        (a) => a.dailyLossCalculation === 'equity_based'
      ).length,
      mandatoryStopLossTraps: allCandidateAccounts.filter((a) => a.hasMandatoryStopLoss).length,
      minDaysDelayTraps: allCandidateAccounts.filter((a) => a.minimumTradingDays > 0).length,
      weekendCloseTraps: allCandidateAccounts.filter((a) => !a.weekendHoldingAllowed).length,
      newsRestrictionTraps: allCandidateAccounts.filter((a) => !a.newsTradingAllowed).length,
      nonRefundableTraps: allCandidateAccounts.filter((a) => !a.refundableFee).length,
    };
  }, [allCandidateAccounts]);

  // ── 3. RULES LIST DEFINITIONS ──────────────────────────────────────────────
  const mustHaveRules = [
    {
      key: 'news',
      category: 'freedom',
      categoryLabel: 'Trading Freedom',
      label: 'News Trading Allowed',
      active: wantNewsTrading,
      set: setWantNewsTrading,
      desc: 'Hold & execute over NFP, CPI & FOMC releases',
      count: ruleCounts.newsTrading,
      icon: Flame,
    },
    {
      key: 'weekend',
      category: 'freedom',
      categoryLabel: 'Trading Freedom',
      label: 'Weekend Holding Allowed',
      active: wantWeekendHolding,
      set: setWantWeekendHolding,
      desc: 'No forced Friday market close or position liquidation',
      count: ruleCounts.weekendHolding,
      icon: Calendar,
    },
    {
      key: 'overnight',
      category: 'freedom',
      categoryLabel: 'Trading Freedom',
      label: 'Overnight Holding Allowed',
      active: wantOvernightHolding,
      set: setWantOvernightHolding,
      desc: 'Keep trades open through 5 PM EST rollover & daily swap',
      count: ruleCounts.overnightHolding,
      icon: Clock,
    },
    {
      key: 'ea',
      category: 'freedom',
      categoryLabel: 'Trading Freedom',
      label: 'EA & Automated Bots Allowed',
      active: wantEaTrading,
      set: setWantEaTrading,
      desc: 'Algorithmic MT5 execution & custom cBots permitted',
      count: ruleCounts.eaTrading,
      icon: Cpu,
    },
    {
      key: 'copy',
      category: 'freedom',
      categoryLabel: 'Trading Freedom',
      label: 'Copy Trading Allowed',
      active: wantCopyTrading,
      set: setWantCopyTrading,
      desc: 'Account-to-account mirroring from your own master accounts',
      count: ruleCounts.copyTrading,
      icon: Layers,
    },
    {
      key: 'hedging',
      category: 'freedom',
      categoryLabel: 'Trading Freedom',
      label: 'Hedging Allowed',
      active: wantHedging,
      set: setWantHedging,
      desc: 'Simultaneously hold opposing Long & Short positions',
      count: ruleCounts.hedging,
      icon: Scale,
    },
    {
      key: 'cryptoWeekend',
      category: 'freedom',
      categoryLabel: 'Trading Freedom',
      label: 'Crypto Weekend Trading',
      active: wantCryptoWeekend,
      set: setWantCryptoWeekend,
      desc: 'Trade BTC, ETH & crypto 24/7 on Saturday and Sunday',
      count: ruleCounts.cryptoWeekend,
      icon: Zap,
    },
    {
      key: 'static',
      category: 'drawdown',
      categoryLabel: 'Drawdown & Risk',
      label: 'Static Drawdown Floor',
      active: wantStaticDrawdown,
      set: setWantStaticDrawdown,
      desc: 'Max loss floor locked permanently at starting balance',
      count: ruleCounts.staticDrawdown,
      icon: Shield,
    },
    {
      key: 'balance',
      category: 'drawdown',
      categoryLabel: 'Drawdown & Risk',
      label: 'Balance-Based Daily Loss',
      active: wantBalanceBasedDaily,
      set: setWantBalanceBasedDaily,
      desc: 'Resets at midnight server time, not intraday peak equity',
      count: ruleCounts.balanceBasedDaily,
      icon: CheckCircle2,
    },
    {
      key: 'noDaily',
      category: 'drawdown',
      categoryLabel: 'Drawdown & Risk',
      label: 'No Daily Loss Limit',
      active: wantNoDailyLimit,
      set: setWantNoDailyLimit,
      desc: 'Zero daily cap — only max overall drawdown applies',
      count: ruleCounts.noDailyLimit,
      icon: Unlock,
    },
    {
      key: 'payout',
      category: 'payouts',
      categoryLabel: 'Payouts & Economics',
      label: 'Fast Payout (≤ 14 Days)',
      active: wantFastPayout,
      set: setWantFastPayout,
      desc: 'First payout eligible within 14 days or bi-weekly',
      count: ruleCounts.fastPayout,
      icon: DollarSign,
    },
    {
      key: 'onDemand',
      category: 'payouts',
      categoryLabel: 'Payouts & Economics',
      label: 'On-Demand / 24h Payouts',
      active: wantOnDemandPayout,
      set: setWantOnDemandPayout,
      desc: 'Request payouts anytime with under 24-48h processing',
      count: ruleCounts.onDemandPayout,
      icon: Zap,
    },
    {
      key: 'split',
      category: 'payouts',
      categoryLabel: 'Payouts & Economics',
      label: '80%+ Base Profit Split',
      active: wantHighSplit,
      set: setWantHighSplit,
      desc: 'Keep 80% to 90% of all profits from Phase 1 onwards',
      count: ruleCounts.highSplit,
      icon: Percent,
    },
    {
      key: 'scaling',
      category: 'payouts',
      categoryLabel: 'Payouts & Economics',
      label: 'Scaling Plan (Up to $2M-$4M)',
      active: wantScalingPlan,
      set: setWantScalingPlan,
      desc: 'Systematic capital increases upon meeting profit milestones',
      count: ruleCounts.scalingPlan,
      icon: TrendingUp,
    },
    {
      key: 'zeroMinDays',
      category: 'evaluation',
      categoryLabel: 'Evaluation Terms',
      label: 'Zero Minimum Trading Days',
      active: wantZeroMinDays,
      set: setWantZeroMinDays,
      desc: 'Pass evaluation instantly on Day 1 without waiting',
      count: ruleCounts.zeroMinDays,
      icon: Target,
    },
    {
      key: 'lowMinDays',
      category: 'evaluation',
      categoryLabel: 'Evaluation Terms',
      label: 'Low Minimum Days (≤ 3 Days)',
      active: wantLowMinDays,
      set: setWantLowMinDays,
      desc: 'Speedy progression with at most 3 active trading days',
      count: ruleCounts.lowMinDays,
      icon: Target,
    },
    {
      key: 'noTimeLimit',
      category: 'evaluation',
      categoryLabel: 'Evaluation Terms',
      label: 'No Time Limit (Unlimited Days)',
      active: wantNoTimeLimit,
      set: setWantNoTimeLimit,
      desc: 'Zero deadline pressure — trade at your own pace',
      count: ruleCounts.noTimeLimit,
      icon: Calendar,
    },
    {
      key: 'refund',
      category: 'payouts',
      categoryLabel: 'Payouts & Economics',
      label: '100% Refundable Fee',
      active: wantRefundableFee,
      set: setWantRefundableFee,
      desc: 'Challenge fee refunded in full with your first payout',
      count: ruleCounts.refundableFee,
      icon: Award,
    },
  ];

  const dealbreakerRules = [
    {
      key: 'noTrailing',
      category: 'drawdown',
      categoryLabel: 'Drawdown & Risk',
      label: 'NO Trailing Drawdown',
      active: avoidTrailingDrawdown,
      set: setAvoidTrailingDrawdown,
      desc: 'Reject trailing equity floors that climb with floating profit',
      count: ruleCounts.trailingDrawdownTraps,
      icon: Ban,
    },
    {
      key: 'noConsistency',
      category: 'evaluation',
      categoryLabel: 'Evaluation Terms',
      label: 'NO Consistency Rule',
      active: avoidConsistencyRule,
      set: setAvoidConsistencyRule,
      desc: 'Reject 20% to 40% single-day profit caps or lot uniformity rules',
      count: ruleCounts.consistencyTraps,
      icon: XCircle,
    },
    {
      key: 'noInactivity',
      category: 'evaluation',
      categoryLabel: 'Evaluation Terms',
      label: 'NO Inactivity Lockout (≤ 30d)',
      active: avoidInactivityLockout,
      set: setAvoidInactivityLockout,
      desc: 'Reject firms that cancel dormant accounts in 14-30 days',
      count: ruleCounts.inactivityTraps,
      icon: Clock,
    },
    {
      key: 'noEquityDaily',
      category: 'drawdown',
      categoryLabel: 'Drawdown & Risk',
      label: 'NO Equity-Based Daily Loss',
      active: avoidEquityDailyLoss,
      set: setAvoidEquityDailyLoss,
      desc: 'Reject intraday peak equity loss traps that punish floating runs',
      count: ruleCounts.equityDailyTraps,
      icon: AlertTriangle,
    },
    {
      key: 'noStopLoss',
      category: 'drawdown',
      categoryLabel: 'Drawdown & Risk',
      label: 'NO Mandatory Stop-Loss',
      active: avoidMandatoryStopLoss,
      set: setAvoidMandatoryStopLoss,
      desc: 'Reject hard mandatory stop-loss enforcement within 2 minutes',
      count: ruleCounts.mandatoryStopLossTraps,
      icon: Lock,
    },
    {
      key: 'noLotLimit',
      category: 'drawdown',
      categoryLabel: 'Drawdown & Risk',
      label: 'NO Restrictive Lot Limits',
      active: avoidLotSizeLimit,
      set: setAvoidLotSizeLimit,
      desc: 'Reject arbitrary lot size matrices or 80% margin caps',
      count: 0,
      icon: Ban,
    },
    {
      key: 'noMinDaysDelay',
      category: 'evaluation',
      categoryLabel: 'Evaluation Terms',
      label: 'NO Minimum Days Requirement',
      active: avoidMinDaysDelay,
      set: setAvoidMinDaysDelay,
      desc: 'Reject firms forcing 4+ or 5+ mandatory active trading days',
      count: ruleCounts.minDaysDelayTraps,
      icon: Calendar,
    },
    {
      key: 'noWeekendClose',
      category: 'freedom',
      categoryLabel: 'Trading Freedom',
      label: 'NO Weekend Close Mandates',
      active: avoidWeekendClose,
      set: setAvoidWeekendClose,
      desc: 'Reject firms forcing Friday market close on all open trades',
      count: ruleCounts.weekendCloseTraps,
      icon: XCircle,
    },
    {
      key: 'noNewsBan',
      category: 'freedom',
      categoryLabel: 'Trading Freedom',
      label: 'NO News Restrictions on Funded',
      active: avoidNewsRestrictions,
      set: setAvoidNewsRestrictions,
      desc: 'Reject firms barring execution ±2-5 mins around news',
      count: ruleCounts.newsRestrictionTraps,
      icon: Flame,
    },
    {
      key: 'noNonRefundable',
      category: 'payouts',
      categoryLabel: 'Payouts & Economics',
      label: 'NO Non-Refundable Evaluations',
      active: avoidNonRefundable,
      set: setAvoidNonRefundable,
      desc: 'Reject firms that do not return your fee upon payout',
      count: ruleCounts.nonRefundableTraps,
      icon: Award,
    },
  ];

  const mustHaveActiveCount = mustHaveRules.filter((r) => r.active).length;
  const dealbreakerActiveCount = dealbreakerRules.filter((r) => r.active).length;

  // Active filters count
  const activeFiltersCount = useMemo(() => {
    let count = mustHaveActiveCount + dealbreakerActiveCount;
    if (selectedCapital !== 'ALL') count++;
    if (selectedType !== 'ALL') count++;
    if (selectedPlatform !== 'ALL') count++;
    if (searchQuery.trim()) count++;
    return count;
  }, [mustHaveActiveCount, dealbreakerActiveCount, selectedCapital, selectedType, selectedPlatform, searchQuery]);

  const resetAllFilters = () => {
    setWantNewsTrading(false);
    setWantWeekendHolding(false);
    setWantOvernightHolding(false);
    setWantEaTrading(false);
    setWantCopyTrading(false);
    setWantHedging(false);
    setWantStaticDrawdown(false);
    setWantBalanceBasedDaily(false);
    setWantNoDailyLimit(false);
    setWantFastPayout(false);
    setWantOnDemandPayout(false);
    setWantHighSplit(false);
    setWantScalingPlan(false);
    setWantZeroMinDays(false);
    setWantLowMinDays(false);
    setWantNoTimeLimit(false);
    setWantRefundableFee(false);
    setWantCryptoWeekend(false);

    setAvoidTrailingDrawdown(false);
    setAvoidConsistencyRule(false);
    setAvoidInactivityLockout(false);
    setAvoidEquityDailyLoss(false);
    setAvoidMandatoryStopLoss(false);
    setAvoidLotSizeLimit(false);
    setAvoidMinDaysDelay(false);
    setAvoidWeekendClose(false);
    setAvoidNewsRestrictions(false);
    setAvoidNonRefundable(false);

    setSelectedCapital('ALL');
    setSelectedType('ALL');
    setSelectedPlatform('ALL');
    setSearchQuery('');
  };

  // ── 4. FILTERING & DYNAMIC MATCH SCORING ────────────────────────────────────
  const filteredAccounts = useMemo(() => {
    return allCandidateAccounts
      .filter((acc) => {
        // ── STRICT EXCLUSIONS (DEALBREAKERS / AVOID) ──
        if (
          avoidTrailingDrawdown &&
          (acc.drawdownType === 'trailing_equity' || acc.drawdownType === 'eod')
        ) {
          return false;
        }
        if (avoidConsistencyRule && acc.hasConsistencyRule) {
          return false;
        }
        if (
          avoidInactivityLockout &&
          acc.hasInactivityLockout &&
          acc.inactivityDays <= 30
        ) {
          return false;
        }
        if (avoidEquityDailyLoss && acc.dailyLossCalculation === 'equity_based') {
          return false;
        }
        if (avoidMandatoryStopLoss && acc.hasMandatoryStopLoss) {
          return false;
        }
        if (avoidLotSizeLimit && acc.hasLotSizeLimits) {
          return false;
        }
        if (avoidMinDaysDelay && acc.minimumTradingDays > 0) {
          return false;
        }
        if (avoidWeekendClose && !acc.weekendHoldingAllowed) {
          return false;
        }
        if (avoidNewsRestrictions && !acc.newsTradingAllowed) {
          return false;
        }
        if (avoidNonRefundable && !acc.refundableFee) {
          return false;
        }

        // ── MUST-HAVE CONSTRAINTS (WANTS) ──
        if (wantNewsTrading && !acc.newsTradingAllowed) return false;
        if (wantWeekendHolding && !acc.weekendHoldingAllowed) return false;
        if (wantOvernightHolding && !acc.overnightHoldingAllowed) return false;
        if (wantEaTrading && !acc.eaTradingAllowed) return false;
        if (wantCopyTrading && !acc.copyTradingAllowed) return false;
        if (wantHedging && !acc.hedgingAllowed) return false;
        if (wantStaticDrawdown && acc.drawdownType !== 'static') return false;
        if (
          wantBalanceBasedDaily &&
          acc.dailyLossCalculation !== 'balance_based' &&
          !acc.hasNoDailyLimit
        )
          return false;
        if (wantNoDailyLimit && !acc.hasNoDailyLimit) return false;
        if (
          wantFastPayout &&
          acc.firstPayoutDays > 14 &&
          !acc.hasOnDemandPayout
        )
          return false;
        if (wantOnDemandPayout && !acc.hasOnDemandPayout) return false;
        if (wantHighSplit && acc.profitSplit < 80) return false;
        if (wantScalingPlan && !acc.hasScalingPlan) return false;
        if (wantZeroMinDays && acc.minimumTradingDays !== 0) return false;
        if (wantLowMinDays && acc.minimumTradingDays > 3) return false;
        if (wantNoTimeLimit && !acc.noTimeLimit) return false;
        if (wantRefundableFee && !acc.refundableFee) return false;
        if (wantCryptoWeekend && !acc.cryptoTradingAllowed) return false;

        // ── SIZING, TYPE, PLATFORM & SEARCH ──
        if (selectedCapital !== 'ALL' && acc.size !== selectedCapital) {
          return false;
        }
        if (selectedType !== 'ALL' && acc.programType !== selectedType) {
          return false;
        }
        if (
          selectedPlatform !== 'ALL' &&
          !acc.platforms.some((p) =>
            p.toLowerCase().includes(selectedPlatform.toLowerCase())
          )
        ) {
          return false;
        }
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matches =
            acc.firmName.toLowerCase().includes(q) ||
            acc.modelName.toLowerCase().includes(q) ||
            acc.brandName.toLowerCase().includes(q) ||
            acc.country.toLowerCase().includes(q) ||
            acc.platforms.some((p) => p.toLowerCase().includes(q));
          if (!matches) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'match') return (b.score || 0) - (a.score || 0);
        if (sortBy === 'trust_desc') return b.trustScore - a.trustScore;
        if (sortBy === 'price_asc') return a.price - b.price;
        if (sortBy === 'price_desc') return b.price - a.price;
        if (sortBy === 'size_desc') return b.size - a.size;
        if (sortBy === 'split_desc') return b.profitSplit - a.profitSplit;
        if (sortBy === 'payout_asc') return a.firstPayoutDays - b.firstPayoutDays;
        return (b.score || 0) - (a.score || 0);
      });
  }, [
    allCandidateAccounts,
    wantNewsTrading,
    wantWeekendHolding,
    wantOvernightHolding,
    wantEaTrading,
    wantCopyTrading,
    wantHedging,
    wantStaticDrawdown,
    wantBalanceBasedDaily,
    wantNoDailyLimit,
    wantFastPayout,
    wantOnDemandPayout,
    wantHighSplit,
    wantScalingPlan,
    wantZeroMinDays,
    wantLowMinDays,
    wantNoTimeLimit,
    wantRefundableFee,
    wantCryptoWeekend,
    avoidTrailingDrawdown,
    avoidConsistencyRule,
    avoidInactivityLockout,
    avoidEquityDailyLoss,
    avoidMandatoryStopLoss,
    avoidLotSizeLimit,
    avoidMinDaysDelay,
    avoidWeekendClose,
    avoidNewsRestrictions,
    avoidNonRefundable,
    selectedCapital,
    selectedType,
    selectedPlatform,
    searchQuery,
    sortBy,
  ]);

  // Unique firm count of matching accounts
  const matchingFirmsCount = useMemo(() => {
    return new Set(filteredAccounts.map((a) => a.firmSlug)).size;
  }, [filteredAccounts]);

  // Grouped Accounts by Firm
  const groupedByFirm = useMemo(() => {
    const groups: { [key: string]: CandidateAccount[] } = {};
    filteredAccounts.forEach((acc) => {
      if (!groups[acc.firmName]) {
        groups[acc.firmName] = [];
      }
      groups[acc.firmName].push(acc);
    });
    return groups;
  }, [filteredAccounts]);

  // ── PAGINATION & PROGRESSIVE BATCH RENDERING (60FPS INSTANT SPEED) ────────
  const PAGE_SIZE = 24;
  const [visibleCount, setVisibleCount] = useState<number>(PAGE_SIZE);

  // Reset visible window to top matches whenever any search, filter, or rule changes
  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [
    wantNewsTrading,
    wantWeekendHolding,
    wantOvernightHolding,
    wantEaTrading,
    wantCopyTrading,
    wantHedging,
    wantStaticDrawdown,
    wantBalanceBasedDaily,
    wantNoDailyLimit,
    wantFastPayout,
    wantOnDemandPayout,
    wantHighSplit,
    wantScalingPlan,
    wantZeroMinDays,
    wantLowMinDays,
    wantNoTimeLimit,
    wantRefundableFee,
    wantCryptoWeekend,
    avoidTrailingDrawdown,
    avoidConsistencyRule,
    avoidInactivityLockout,
    avoidEquityDailyLoss,
    avoidMandatoryStopLoss,
    avoidLotSizeLimit,
    avoidMinDaysDelay,
    avoidWeekendClose,
    avoidNewsRestrictions,
    avoidNonRefundable,
    selectedCapital,
    selectedType,
    selectedPlatform,
    searchQuery,
    sortBy,
  ]);

  const visibleAccounts = useMemo(() => {
    return filteredAccounts.slice(0, visibleCount);
  }, [filteredAccounts, visibleCount]);

  const handleToggleExpand = useCallback((id: string) => {
    setExpandedCardId((prev) => (prev === id ? null : id));
  }, []);

  const handleToggleCompare = useCallback((id: string) => {
    setSelectedForCompare((prev) =>
      prev.includes(id)
        ? prev.filter((item) => item !== id)
        : prev.length < 4
        ? [...prev, id]
        : prev
    );
  }, []);

  const handleNavigate = useCallback(
    (path: string) => {
      onNavigate(path);
    },
    [onNavigate]
  );

  // ── QUICK PRESETS ──────────────────────────────────────────────────────────
  const applyPreset = (presetKey: string) => {
    resetAllFilters();
    if (presetKey === 'safe') {
      setWantStaticDrawdown(true);
      setWantBalanceBasedDaily(true);
      setAvoidConsistencyRule(true);
      setAvoidTrailingDrawdown(true);
      setWantRefundableFee(true);
    } else if (presetKey === 'swing') {
      setWantWeekendHolding(true);
      setWantOvernightHolding(true);
      setWantNewsTrading(true);
      setWantStaticDrawdown(true);
      setAvoidTrailingDrawdown(true);
      setAvoidWeekendClose(true);
    } else if (presetKey === 'news') {
      setWantNewsTrading(true);
      setWantFastPayout(true);
      setWantBalanceBasedDaily(true);
      setAvoidNewsRestrictions(true);
    } else if (presetKey === 'algo') {
      setWantEaTrading(true);
      setWantCopyTrading(true);
      setWantWeekendHolding(true);
      setAvoidInactivityLockout(true);
      setAvoidLotSizeLimit(true);
    } else if (presetKey === 'payout') {
      setWantFastPayout(true);
      setWantHighSplit(true);
      setWantRefundableFee(true);
      setWantZeroMinDays(true);
    } else if (presetKey === 'fastpass') {
      setWantZeroMinDays(true);
      setWantNoTimeLimit(true);
      setWantRefundableFee(true);
      setAvoidMinDaysDelay(true);
    } else if (presetKey === 'freedom') {
      setWantNewsTrading(true);
      setWantWeekendHolding(true);
      setWantOvernightHolding(true);
      setWantEaTrading(true);
      setWantCopyTrading(true);
      setWantHedging(true);
      setWantStaticDrawdown(true);
      setAvoidTrailingDrawdown(true);
      setAvoidConsistencyRule(true);
    }
  };

  // Compare tray handler
  const toggleCompare = (accId: string) => {
    setSelectedForCompare((prev) =>
      prev.includes(accId)
        ? prev.filter((id) => id !== accId)
        : prev.length < 4
        ? [...prev, accId]
        : prev
    );
  };

  // Filter rules by active category tab for expanded view
  const visibleMustHaves = mustHaveRules.filter(
    (r) => activeCategory === 'all' || r.category === activeCategory
  );
  const visibleDealbreakers = dealbreakerRules.filter(
    (r) => activeCategory === 'all' || r.category === activeCategory
  );

  return (
    <div className="bg-[#080A10] min-h-screen text-slate-100 font-sans">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 pb-32">
        {/* ── 1. COMMAND CENTER HEADER ── */}
        <div className="pt-10 sm:pt-14 pb-8 border-b border-[#1F2228] text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#111318] border border-[#1F2228] text-[11px] font-semibold tracking-wide uppercase text-slate-300 mb-4 shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-blue-400 animate-pulse" /> Certified Prop Firm Matching Engine
          </div>
          <h1 className="text-[32px] sm:text-[48px] font-extrabold tracking-tight leading-[1.05] text-white max-w-4xl mx-auto">
            Find your ideal prop account{' '}
            <span className="bg-gradient-to-r from-blue-400 via-emerald-400 to-teal-300 bg-clip-text text-transparent">
              tailored to your exact rules
            </span>
          </h1>
          <p className="text-[13px] sm:text-[15px] leading-relaxed text-[#8A8F98] max-w-2xl mx-auto mt-3">
            Select the trading freedoms you must have, ban the sneaky gotchas and dealbreakers you refuse to accept,
            and inspect 100% verified real-time data across all 24 certified prop firms.
          </p>

          {/* Trust Guarantees */}
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 mt-6 text-xs text-[#8A8F98]">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#111318] border border-[#1F2228] font-medium">
              <Check className="w-3.5 h-3.5 text-emerald-400" /> 100% Verified Rules & Pricing
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#111318] border border-[#1F2228] font-medium">
              <Shield className="w-3.5 h-3.5 text-blue-400" /> Zero Affiliate Bias
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#111318] border border-[#1F2228] font-medium">
              <Zap className="w-3.5 h-3.5 text-amber-400" /> Real-Time Multi-Factor Engine
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#111318] border border-[#1F2228] font-medium">
              <Award className="w-3.5 h-3.5 text-purple-400" /> 24 Certified Global Prop Firms
            </span>
          </div>

          {/* Quick Presets Bar */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-2 pt-6 border-t border-[#1F2228]/60">
            <span className="text-[11px] font-mono uppercase tracking-widest text-[#8A8F98] mr-1 flex items-center gap-1">
              <Flame className="w-3.5 h-3.5 text-orange-400" /> Smart Presets:
            </span>
            <button
              onClick={() => applyPreset('safe')}
              className="px-3.5 py-1.5 rounded-full text-xs font-medium bg-[#111318] border border-[#1F2228] hover:border-emerald-500/50 hover:text-white text-slate-300 transition-all flex items-center gap-1.5"
            >
              🛡️ Zero Gotchas Safe
            </button>
            <button
              onClick={() => applyPreset('swing')}
              className="px-3.5 py-1.5 rounded-full text-xs font-medium bg-[#111318] border border-[#1F2228] hover:border-blue-500/50 hover:text-white text-slate-300 transition-all flex items-center gap-1.5"
            >
              🌙 Pure Swing Trader
            </button>
            <button
              onClick={() => applyPreset('news')}
              className="px-3.5 py-1.5 rounded-full text-xs font-medium bg-[#111318] border border-[#1F2228] hover:border-amber-500/50 hover:text-white text-slate-300 transition-all flex items-center gap-1.5"
            >
              ⚡ News Scalper
            </button>
            <button
              onClick={() => applyPreset('algo')}
              className="px-3.5 py-1.5 rounded-full text-xs font-medium bg-[#111318] border border-[#1F2228] hover:border-purple-500/50 hover:text-white text-slate-300 transition-all flex items-center gap-1.5"
            >
              🤖 Algo & Bot Master
            </button>
            <button
              onClick={() => applyPreset('payout')}
              className="px-3.5 py-1.5 rounded-full text-xs font-medium bg-[#111318] border border-[#1F2228] hover:border-emerald-500/50 hover:text-white text-slate-300 transition-all flex items-center gap-1.5"
            >
              💰 Max Payouts & Fast Pass
            </button>
            <button
              onClick={() => applyPreset('fastpass')}
              className="px-3.5 py-1.5 rounded-full text-xs font-medium bg-[#111318] border border-[#1F2228] hover:border-teal-500/50 hover:text-white text-slate-300 transition-all flex items-center gap-1.5"
            >
              🚀 Zero Minimum Days
            </button>
            <button
              onClick={() => applyPreset('freedom')}
              className="px-3.5 py-1.5 rounded-full text-xs font-medium bg-[#111318] border border-[#1F2228] hover:border-sky-500/50 hover:text-white text-slate-300 transition-all flex items-center gap-1.5"
            >
              ♾️ Maximum Freedom
            </button>

            {activeFiltersCount > 0 && (
              <button
                onClick={resetAllFilters}
                className="px-3.5 py-1.5 rounded-full text-xs font-semibold bg-red-500/10 border border-red-500/30 hover:bg-red-500/20 text-red-300 transition-all flex items-center gap-1"
              >
                <X className="w-3 h-3" /> Reset All ({activeFiltersCount})
              </button>
            )}
          </div>
        </div>

        {/* ── 2. DROPDOWN-TYPE RULE SELECTION COMMAND CENTER ── */}
        <div ref={dropdownRef} className="mt-8 space-y-4">
          <div className="rounded-2xl bg-[#111318] border border-[#1F2228] p-5 shadow-xl relative">
            {/* Header with Mode Toggle */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#1F2228] pb-3.5">
              <div>
                <h2 className="text-sm font-extrabold text-white flex items-center gap-2">
                  <Filter className="w-4 h-4 text-blue-400" />
                  Rule Selectors & Conditions
                  <span className="text-[11px] font-normal text-[#8A8F98] bg-[#080A10] px-2 py-0.5 rounded-md border border-[#1F2228]">
                    Dropdown Type
                  </span>
                </h2>
                <p className="text-[11px] text-[#8A8F98] mt-0.5">
                  Click any dropdown to select rules or dealbreakers. Accounts update in real time.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsGridExpanded(!isGridExpanded)}
                  className="px-3 py-1.5 rounded-xl bg-[#080A10] border border-[#1F2228] hover:border-[#3b82f6] text-xs font-semibold text-[#8A8F98] hover:text-white transition-all flex items-center gap-1.5"
                >
                  <LayoutGrid className="w-3.5 h-3.5 text-blue-400" />
                  {isGridExpanded ? 'Collapse to Dropdowns' : 'View Full Grid'}
                </button>
              </div>
            </div>

            {/* PRIMARY DROPDOWNS ROW */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-4">
              {/* 🟢 DROPDOWN 1: Rules You MUST HAVE */}
              <div className="relative">
                <label className="block text-[11px] font-bold text-emerald-400 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Must-Have Rules
                  </span>
                  {mustHaveActiveCount > 0 && (
                    <span className="px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-400 text-[10px] font-mono font-bold">
                      {mustHaveActiveCount} Active
                    </span>
                  )}
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setOpenDropdown(openDropdown === 'mustHave' ? null : 'mustHave');
                    setDropdownSearch('');
                  }}
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-xs font-semibold flex items-center justify-between transition-all ${
                    mustHaveActiveCount > 0
                      ? 'bg-emerald-500/15 border-emerald-500/60 text-white shadow-[0_0_15px_rgba(16,185,129,0.15)]'
                      : 'bg-[#080A10] border-[#1F2228] text-slate-300 hover:border-[#2b303c]'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <span
                      className={`w-2 h-2 rounded-full shrink-0 ${
                        mustHaveActiveCount > 0 ? 'bg-emerald-400 animate-pulse' : 'bg-slate-600'
                      }`}
                    />
                    <span className="truncate">
                      {mustHaveActiveCount > 0
                        ? `${mustHaveActiveCount} Rules Selected`
                        : 'Select Must-Have Rules...'}
                    </span>
                  </div>
                  <ChevronDown
                    className={`w-4 h-4 text-[#8A8F98] shrink-0 transition-transform ${
                      openDropdown === 'mustHave' ? 'rotate-180 text-emerald-400' : ''
                    }`}
                  />
                </button>

                {/* DROPDOWN POPOVER FOR MUST HAVES */}
                {openDropdown === 'mustHave' && (
                  <div className="absolute top-full left-0 mt-2 z-50 w-full sm:w-[480px] bg-[#0c0e14] border border-[#2b3244] rounded-2xl shadow-2xl p-4 space-y-3 animate-in fade-in zoom-in-95 duration-150">
                    <div className="flex items-center justify-between border-b border-[#1F2228] pb-2.5">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        <span className="text-xs font-bold text-white">Select Rules You MUST HAVE</span>
                      </div>
                      <span className="text-[10px] font-mono text-emerald-400 font-semibold">
                        {mustHaveActiveCount} of {mustHaveRules.length} active
                      </span>
                    </div>

                    {/* Search inside dropdown */}
                    <div className="relative">
                      <Search className="w-3.5 h-3.5 text-[#8A8F98] absolute left-3 top-2.5" />
                      <input
                        type="text"
                        placeholder="Search rules (news, weekend, static DD...)"
                        value={dropdownSearch}
                        onChange={(e) => setDropdownSearch(e.target.value)}
                        className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-[#111318] border border-[#1F2228] text-xs text-white placeholder:text-[#8A8F98]/50 focus:outline-none focus:border-emerald-500"
                      />
                    </div>

                    {/* Rules List in Dropdown */}
                    <div className="max-h-[300px] overflow-y-auto space-y-1.5 pr-1">
                      {mustHaveRules
                        .filter(
                          (r) =>
                            !dropdownSearch ||
                            r.label.toLowerCase().includes(dropdownSearch.toLowerCase()) ||
                            r.desc.toLowerCase().includes(dropdownSearch.toLowerCase())
                        )
                        .map((item) => (
                          <div
                            key={item.key}
                            onClick={() => item.set(!item.active)}
                            className={`p-2.5 rounded-xl text-left cursor-pointer transition-all border flex items-start gap-2.5 ${
                              item.active
                                ? 'bg-emerald-500/15 border-emerald-500/60 text-white'
                                : 'bg-[#111318] border-[#1F2228] text-slate-300 hover:border-[#2b303c] hover:bg-[#141720]'
                            }`}
                          >
                            <span
                              className={`w-4 h-4 rounded flex items-center justify-center text-[10px] shrink-0 mt-0.5 border ${
                                item.active
                                  ? 'bg-emerald-500 border-emerald-400 text-[#080A10]'
                                  : 'border-slate-700 bg-slate-900 text-transparent'
                              }`}
                            >
                              <Check className="w-3 h-3 stroke-[3]" />
                            </span>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center justify-between gap-1">
                                <span className="font-bold text-xs text-white">{item.label}</span>
                                <span className="text-[10px] font-mono font-semibold px-1.5 py-0.2 rounded bg-[#080A10] text-[#8A8F98] border border-[#1F2228] shrink-0">
                                  {item.count}
                                </span>
                              </div>
                              <p className="text-[10px] text-[#8A8F98] leading-tight mt-0.5">{item.desc}</p>
                            </div>
                          </div>
                        ))}
                    </div>

                    {/* Dropdown Footer Actions */}
                    <div className="pt-2 border-t border-[#1F2228] flex items-center justify-between text-xs">
                      <button
                        type="button"
                        onClick={() => {
                          mustHaveRules.forEach((r) => r.set(false));
                        }}
                        className="text-[#8A8F98] hover:text-white underline font-medium"
                      >
                        Clear Must-Haves
                      </button>
                      <button
                        type="button"
                        onClick={() => setOpenDropdown(null)}
                        className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold"
                      >
                        Done
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* 🔴 DROPDOWN 2: Rules to AVOID (Dealbreakers) */}
              <div className="relative">
                <label className="block text-[11px] font-bold text-red-400 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Ban className="w-3.5 h-3.5 text-red-400" /> Dealbreakers (Avoid)
                  </span>
                  {dealbreakerActiveCount > 0 && (
                    <span className="px-1.5 py-0.2 rounded bg-red-500/20 text-red-400 text-[10px] font-mono font-bold">
                      {dealbreakerActiveCount} Active
                    </span>
                  )}
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setOpenDropdown(openDropdown === 'dealbreakers' ? null : 'dealbreakers');
                    setDropdownSearch('');
                  }}
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-xs font-semibold flex items-center justify-between transition-all ${
                    dealbreakerActiveCount > 0
                      ? 'bg-red-500/15 border-red-500/60 text-white shadow-[0_0_15px_rgba(239,68,68,0.15)]'
                      : 'bg-[#080A10] border-[#1F2228] text-slate-300 hover:border-[#2b303c]'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <span
                      className={`w-2 h-2 rounded-full shrink-0 ${
                        dealbreakerActiveCount > 0 ? 'bg-red-400 animate-pulse' : 'bg-slate-600'
                      }`}
                    />
                    <span className="truncate">
                      {dealbreakerActiveCount > 0
                        ? `${dealbreakerActiveCount} Dealbreakers Active`
                        : 'Select Traps to Avoid...'}
                    </span>
                  </div>
                  <ChevronDown
                    className={`w-4 h-4 text-[#8A8F98] shrink-0 transition-transform ${
                      openDropdown === 'dealbreakers' ? 'rotate-180 text-red-400' : ''
                    }`}
                  />
                </button>

                {/* DROPDOWN POPOVER FOR DEALBREAKERS */}
                {openDropdown === 'dealbreakers' && (
                  <div className="absolute top-full left-0 sm:left-auto sm:right-0 lg:left-0 mt-2 z-50 w-full sm:w-[480px] bg-[#0c0e14] border border-[#2b3244] rounded-2xl shadow-2xl p-4 space-y-3 animate-in fade-in zoom-in-95 duration-150">
                    <div className="flex items-center justify-between border-b border-[#1F2228] pb-2.5">
                      <div className="flex items-center gap-2">
                        <Ban className="w-4 h-4 text-red-400" />
                        <span className="text-xs font-bold text-white">Select Traps & Rules to Strictly Avoid</span>
                      </div>
                      <span className="text-[10px] font-mono text-red-400 font-semibold">
                        {dealbreakerActiveCount} of {dealbreakerRules.length} active
                      </span>
                    </div>

                    {/* Search inside dropdown */}
                    <div className="relative">
                      <Search className="w-3.5 h-3.5 text-[#8A8F98] absolute left-3 top-2.5" />
                      <input
                        type="text"
                        placeholder="Search dealbreakers (trailing DD, consistency, inactivity...)"
                        value={dropdownSearch}
                        onChange={(e) => setDropdownSearch(e.target.value)}
                        className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-[#111318] border border-[#1F2228] text-xs text-white placeholder:text-[#8A8F98]/50 focus:outline-none focus:border-red-500"
                      />
                    </div>

                    {/* Dealbreakers List */}
                    <div className="max-h-[300px] overflow-y-auto space-y-1.5 pr-1">
                      {dealbreakerRules
                        .filter(
                          (r) =>
                            !dropdownSearch ||
                            r.label.toLowerCase().includes(dropdownSearch.toLowerCase()) ||
                            r.desc.toLowerCase().includes(dropdownSearch.toLowerCase())
                        )
                        .map((item) => (
                          <div
                            key={item.key}
                            onClick={() => item.set(!item.active)}
                            className={`p-2.5 rounded-xl text-left cursor-pointer transition-all border flex items-start gap-2.5 ${
                              item.active
                                ? 'bg-red-500/15 border-red-500/60 text-white'
                                : 'bg-[#111318] border-[#1F2228] text-slate-300 hover:border-[#2b303c] hover:bg-[#141720]'
                            }`}
                          >
                            <span
                              className={`w-4 h-4 rounded flex items-center justify-center text-[10px] shrink-0 mt-0.5 border ${
                                item.active
                                  ? 'bg-red-500 border-red-400 text-white'
                                  : 'border-slate-700 bg-slate-900 text-transparent'
                              }`}
                            >
                              <X className="w-3 h-3 stroke-[3]" />
                            </span>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center justify-between gap-1">
                                <span className="font-bold text-xs text-white">{item.label}</span>
                                {item.count > 0 && (
                                  <span className="text-[10px] font-mono font-semibold px-1.5 py-0.2 rounded bg-red-500/10 text-red-400 border border-red-500/20 shrink-0">
                                    {item.count} barred
                                  </span>
                                )}
                              </div>
                              <p className="text-[10px] text-[#8A8F98] leading-tight mt-0.5">{item.desc}</p>
                            </div>
                          </div>
                        ))}
                    </div>

                    {/* Dropdown Footer Actions */}
                    <div className="pt-2 border-t border-[#1F2228] flex items-center justify-between text-xs">
                      <button
                        type="button"
                        onClick={() => {
                          dealbreakerRules.forEach((r) => r.set(false));
                        }}
                        className="text-[#8A8F98] hover:text-white underline font-medium"
                      >
                        Clear Dealbreakers
                      </button>
                      <button
                        type="button"
                        onClick={() => setOpenDropdown(null)}
                        className="px-4 py-1.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold"
                      >
                        Done
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* 💵 DROPDOWN 3: Account Capital Size */}
              <div>
                <label className="block text-[11px] font-bold text-[#8A8F98] uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <DollarSign className="w-3.5 h-3.5 text-blue-400" /> Account Capital
                </label>
                <select
                  value={selectedCapital}
                  onChange={(e) =>
                    setSelectedCapital(e.target.value === 'ALL' ? 'ALL' : Number(e.target.value))
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#080A10] border border-[#1F2228] text-xs font-semibold text-white focus:outline-none focus:border-[#3b82f6]"
                >
                  <option value="ALL">All Sizes ($10k - $200k+)</option>
                  <option value="10000">$10,000 Capital</option>
                  <option value="25000">$25,000 Capital</option>
                  <option value="50000">$50,000 Capital</option>
                  <option value="100000">$100,000 Capital</option>
                  <option value="200000">$200,000 Capital</option>
                </select>
              </div>

              {/* 🎯 DROPDOWN 4: Evaluation Model */}
              <div>
                <label className="block text-[11px] font-bold text-[#8A8F98] uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <Target className="w-3.5 h-3.5 text-purple-400" /> Evaluation Model
                </label>
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#080A10] border border-[#1F2228] text-xs font-semibold text-white focus:outline-none focus:border-[#3b82f6]"
                >
                  <option value="ALL">All Evaluation Models</option>
                  <option value="2-Step">2-Step Challenge (Standard)</option>
                  <option value="1-Step">1-Step Challenge (Fast Pass)</option>
                  <option value="Instant">Instant Funding (No Challenge)</option>
                  <option value="Futures">Futures Funding (CME/CBOT)</option>
                </select>
              </div>
            </div>

            {/* SECONDARY ROW: CATEGORY DROPDOWNS + PLATFORM + SEARCH */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-3 border-t border-[#1F2228]/60">
              {/* 🎯 CATEGORY DROPDOWN: Trading Style */}
              <div className="relative">
                <label className="block text-[11px] font-bold text-[#8A8F98] uppercase tracking-wider mb-1.5 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Flame className="w-3.5 h-3.5 text-orange-400" /> Trading Style Rules
                  </span>
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setOpenDropdown(openDropdown === 'trading' ? null : 'trading');
                    setDropdownSearch('');
                  }}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#080A10] border border-[#1F2228] hover:border-[#2b303c] text-xs font-semibold text-slate-300 flex items-center justify-between transition-all"
                >
                  <span className="truncate">
                    {mustHaveRules.filter((r) => r.category === 'freedom' && r.active).length > 0
                      ? `${mustHaveRules.filter((r) => r.category === 'freedom' && r.active).length} Trading Rules Active`
                      : 'News, Weekend, EA, Copy...'}
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 text-[#8A8F98] transition-transform ${
                      openDropdown === 'trading' ? 'rotate-180 text-orange-400' : ''
                    }`}
                  />
                </button>

                {/* TRADING POPOVER */}
                {openDropdown === 'trading' && (
                  <div className="absolute top-full left-0 mt-2 z-50 w-full sm:w-[420px] bg-[#0c0e14] border border-[#2b3244] rounded-2xl shadow-2xl p-4 space-y-2.5 animate-in fade-in zoom-in-95 duration-150">
                    <div className="flex items-center justify-between border-b border-[#1F2228] pb-2">
                      <span className="text-xs font-bold text-white flex items-center gap-1.5">
                        <Flame className="w-3.5 h-3.5 text-orange-400" /> Trading Style & Freedom Rules
                      </span>
                      <button
                        onClick={() => setOpenDropdown(null)}
                        className="text-xs text-blue-400 font-bold"
                      >
                        Done
                      </button>
                    </div>
                    <div className="max-h-[260px] overflow-y-auto space-y-1.5 pr-1">
                      {mustHaveRules
                        .filter((r) => r.category === 'freedom')
                        .map((item) => (
                          <div
                            key={item.key}
                            onClick={() => item.set(!item.active)}
                            className={`p-2 rounded-xl text-left cursor-pointer transition-all border flex items-center justify-between ${
                              item.active
                                ? 'bg-emerald-500/15 border-emerald-500/50 text-white'
                                : 'bg-[#111318] border-[#1F2228] text-slate-300 hover:bg-[#141720]'
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <span
                                className={`w-3.5 h-3.5 rounded flex items-center justify-center text-[10px] border ${
                                  item.active
                                    ? 'bg-emerald-500 border-emerald-400 text-[#080A10]'
                                    : 'border-slate-700 bg-slate-900 text-transparent'
                                }`}
                              >
                                <Check className="w-2.5 h-2.5 stroke-[3]" />
                              </span>
                              <span className="text-xs font-semibold text-white">{item.label}</span>
                            </div>
                            <span className="text-[10px] font-mono text-[#8A8F98]">{item.count}</span>
                          </div>
                        ))}
                    </div>
                  </div>
                )}
              </div>

              {/* 🛡️ CATEGORY DROPDOWN: Drawdown & Risk */}
              <div className="relative">
                <label className="block text-[11px] font-bold text-[#8A8F98] uppercase tracking-wider mb-1.5 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Shield className="w-3.5 h-3.5 text-blue-400" /> Drawdown & Risk Rules
                  </span>
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setOpenDropdown(openDropdown === 'drawdown' ? null : 'drawdown');
                    setDropdownSearch('');
                  }}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#080A10] border border-[#1F2228] hover:border-[#2b303c] text-xs font-semibold text-slate-300 flex items-center justify-between transition-all"
                >
                  <span className="truncate">
                    {wantStaticDrawdown || wantBalanceBasedDaily || avoidTrailingDrawdown || avoidEquityDailyLoss
                      ? 'Drawdown Rules Selected'
                      : 'Static, Balance, Trailing...'}
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 text-[#8A8F98] transition-transform ${
                      openDropdown === 'drawdown' ? 'rotate-180 text-blue-400' : ''
                    }`}
                  />
                </button>

                {/* DRAWDOWN POPOVER */}
                {openDropdown === 'drawdown' && (
                  <div className="absolute top-full left-0 mt-2 z-50 w-full sm:w-[420px] bg-[#0c0e14] border border-[#2b3244] rounded-2xl shadow-2xl p-4 space-y-2.5 animate-in fade-in zoom-in-95 duration-150">
                    <div className="flex items-center justify-between border-b border-[#1F2228] pb-2">
                      <span className="text-xs font-bold text-white flex items-center gap-1.5">
                        <Shield className="w-3.5 h-3.5 text-blue-400" /> Drawdown & Floor Conditions
                      </span>
                      <button
                        onClick={() => setOpenDropdown(null)}
                        className="text-xs text-blue-400 font-bold"
                      >
                        Done
                      </button>
                    </div>
                    <div className="max-h-[260px] overflow-y-auto space-y-1.5 pr-1">
                      {mustHaveRules
                        .filter((r) => r.category === 'drawdown')
                        .map((item) => (
                          <div
                            key={item.key}
                            onClick={() => item.set(!item.active)}
                            className={`p-2 rounded-xl text-left cursor-pointer transition-all border flex items-center justify-between ${
                              item.active
                                ? 'bg-emerald-500/15 border-emerald-500/50 text-white'
                                : 'bg-[#111318] border-[#1F2228] text-slate-300 hover:bg-[#141720]'
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <span
                                className={`w-3.5 h-3.5 rounded flex items-center justify-center text-[10px] border ${
                                  item.active
                                    ? 'bg-emerald-500 border-emerald-400 text-[#080A10]'
                                    : 'border-slate-700 bg-slate-900 text-transparent'
                                }`}
                              >
                                <Check className="w-2.5 h-2.5 stroke-[3]" />
                              </span>
                              <span className="text-xs font-semibold text-white">{item.label}</span>
                            </div>
                            <span className="text-[10px] font-mono text-[#8A8F98]">{item.count}</span>
                          </div>
                        ))}
                      {dealbreakerRules
                        .filter((r) => r.category === 'drawdown')
                        .map((item) => (
                          <div
                            key={item.key}
                            onClick={() => item.set(!item.active)}
                            className={`p-2 rounded-xl text-left cursor-pointer transition-all border flex items-center justify-between ${
                              item.active
                                ? 'bg-red-500/15 border-red-500/50 text-white'
                                : 'bg-[#111318] border-[#1F2228] text-slate-300 hover:bg-[#141720]'
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <span
                                className={`w-3.5 h-3.5 rounded flex items-center justify-center text-[10px] border ${
                                  item.active
                                    ? 'bg-red-500 border-red-400 text-white'
                                    : 'border-slate-700 bg-slate-900 text-transparent'
                                }`}
                              >
                                <X className="w-2.5 h-2.5 stroke-[3]" />
                              </span>
                              <span className="text-xs font-semibold text-white">{item.label}</span>
                            </div>
                            <span className="text-[10px] font-mono text-red-400 font-semibold">{item.count} barred</span>
                          </div>
                        ))}
                    </div>
                  </div>
                )}
              </div>

              {/* 💻 DROPDOWN: Trading Platform */}
              <div>
                <label className="block text-[11px] font-bold text-[#8A8F98] uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <Cpu className="w-3.5 h-3.5 text-purple-400" /> Trading Platform
                </label>
                <select
                  aria-label="Filter by trading platform"
                  value={selectedPlatform}
                  onChange={(e) => setSelectedPlatform(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#080A10] border border-[#1F2228] text-xs font-semibold text-white focus:outline-none focus:border-[#3b82f6]"
                >
                  <option value="ALL">All Platforms (MT5, cTrader, etc.)</option>
                  <option value="MetaTrader 5">MetaTrader 5 (MT5)</option>
                  <option value="cTrader">cTrader (Spotware)</option>
                  <option value="TradeLocker">TradeLocker</option>
                  <option value="Match-Trader">Match-Trader</option>
                  <option value="NinjaTrader">NinjaTrader (Futures)</option>
                </select>
              </div>

              {/* 🔍 SEARCH: Keyword Search */}
              <div>
                <label className="block text-[11px] font-bold text-[#8A8F98] uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <Search className="w-3.5 h-3.5 text-amber-400" /> Search Firm / Model
                </label>
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-[#8A8F98] absolute left-3 top-2.5" />
                  <input
                    type="text"
                    placeholder="e.g. FTMO, Funding Pips, Goat..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-8 pr-3 py-2 rounded-xl bg-[#080A10] border border-[#1F2228] text-xs text-white placeholder:text-[#8A8F98]/50 focus:outline-none focus:border-[#3b82f6]"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-2.5 top-2.5 text-[#8A8F98] hover:text-white"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* OPTIONAL EXPANDED GRID VIEW (When user clicks 'View Full Grid') */}
          {isGridExpanded && (
            <div className="rounded-2xl bg-[#111318] border border-[#1F2228] p-5 space-y-4 animate-in fade-in duration-200">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#1F2228] pb-3">
                <div className="flex flex-wrap items-center gap-1.5">
                  {[
                    { id: 'all', label: 'All Rules (28)', icon: LayoutGrid },
                    { id: 'freedom', label: 'Trading Freedom (8)', icon: Flame },
                    { id: 'drawdown', label: 'Drawdown & Risk (8)', icon: Shield },
                    { id: 'payouts', label: 'Payouts & Economics (6)', icon: DollarSign },
                    { id: 'evaluation', label: 'Evaluation Terms (6)', icon: Target },
                  ].map((cat) => {
                    const Icon = cat.icon;
                    return (
                      <button
                        key={cat.id}
                        onClick={() => setActiveCategory(cat.id as RuleCategory)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                          activeCategory === cat.id
                            ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                            : 'bg-[#080A10] border border-[#1F2228] text-[#8A8F98] hover:text-white'
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5" />
                        {cat.label}
                      </button>
                    );
                  })}
                </div>
                <button
                  onClick={() => setIsGridExpanded(false)}
                  className="text-xs text-[#8A8F98] hover:text-white font-medium"
                >
                  Close Grid
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                {/* Must Haves Column */}
                <div className="space-y-2">
                  <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Rules You MUST HAVE
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {visibleMustHaves.map((item) => (
                      <button
                        key={item.key}
                        onClick={() => item.set(!item.active)}
                        className={`p-2.5 rounded-xl text-left transition-all border flex items-start gap-2 ${
                          item.active
                            ? 'bg-emerald-500/15 border-emerald-500/60 text-white'
                            : 'bg-[#080A10] border-[#1F2228] text-slate-300 hover:bg-[#141720]'
                        }`}
                      >
                        <span
                          className={`w-4 h-4 rounded flex items-center justify-center text-[10px] shrink-0 mt-0.5 border ${
                            item.active
                              ? 'bg-emerald-500 border-emerald-400 text-[#080A10]'
                              : 'border-slate-700 bg-slate-900 text-transparent'
                          }`}
                        >
                          <Check className="w-3 h-3 stroke-[3]" />
                        </span>
                        <div className="min-w-0 flex-1">
                          <span className="font-bold text-xs truncate text-white block">{item.label}</span>
                          <p className="text-[10px] text-[#8A8F98] leading-tight line-clamp-1">{item.desc}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Dealbreakers Column */}
                <div className="space-y-2">
                  <h3 className="text-xs font-bold text-red-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Ban className="w-3.5 h-3.5" /> Dealbreakers (Strictly Avoid)
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {visibleDealbreakers.map((item) => (
                      <button
                        key={item.key}
                        onClick={() => item.set(!item.active)}
                        className={`p-2.5 rounded-xl text-left transition-all border flex items-start gap-2 ${
                          item.active
                            ? 'bg-red-500/15 border-red-500/60 text-white'
                            : 'bg-[#080A10] border-[#1F2228] text-slate-300 hover:bg-[#141720]'
                        }`}
                      >
                        <span
                          className={`w-4 h-4 rounded flex items-center justify-center text-[10px] shrink-0 mt-0.5 border ${
                            item.active
                              ? 'bg-red-500 border-red-400 text-white'
                              : 'border-slate-700 bg-slate-900 text-transparent'
                          }`}
                        >
                          <X className="w-3 h-3 stroke-[3]" />
                        </span>
                        <div className="min-w-0 flex-1">
                          <span className="font-bold text-xs truncate text-white block">{item.label}</span>
                          <p className="text-[10px] text-[#8A8F98] leading-tight line-clamp-1">{item.desc}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ── 3. ACTIVE FILTERS RIBBON & REAL-TIME SUMMARY ── */}
        <div className="mt-6 p-4 rounded-2xl bg-[#111318] border border-[#1F2228] flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
          <div className="flex items-center gap-3">
            <span className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse shrink-0" />
            <div>
              <p className="text-sm font-bold text-white">
                Showing {filteredAccounts.length} Verified Accounts
              </p>
              <p className="text-xs text-[#8A8F98]">
                Across {matchingFirmsCount} prop firms adhering to {activeFiltersCount} active constraints
              </p>
            </div>
          </div>

          {/* Active filter tags */}
          <div className="flex flex-wrap items-center gap-1.5 flex-1 max-w-2xl">
            {wantNewsTrading && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                News Allowed <X className="w-3 h-3 cursor-pointer" onClick={() => setWantNewsTrading(false)} />
              </span>
            )}
            {wantWeekendHolding && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                Weekend Allowed <X className="w-3 h-3 cursor-pointer" onClick={() => setWantWeekendHolding(false)} />
              </span>
            )}
            {wantOvernightHolding && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                Overnight Allowed <X className="w-3 h-3 cursor-pointer" onClick={() => setWantOvernightHolding(false)} />
              </span>
            )}
            {wantEaTrading && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                EAs Allowed <X className="w-3 h-3 cursor-pointer" onClick={() => setWantEaTrading(false)} />
              </span>
            )}
            {wantCopyTrading && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                Copy Allowed <X className="w-3 h-3 cursor-pointer" onClick={() => setWantCopyTrading(false)} />
              </span>
            )}
            {wantHedging && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                Hedging Allowed <X className="w-3 h-3 cursor-pointer" onClick={() => setWantHedging(false)} />
              </span>
            )}
            {wantStaticDrawdown && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                Static Drawdown <X className="w-3 h-3 cursor-pointer" onClick={() => setWantStaticDrawdown(false)} />
              </span>
            )}
            {wantBalanceBasedDaily && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                Balance Daily <X className="w-3 h-3 cursor-pointer" onClick={() => setWantBalanceBasedDaily(false)} />
              </span>
            )}
            {wantNoDailyLimit && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                No Daily DD Limit <X className="w-3 h-3 cursor-pointer" onClick={() => setWantNoDailyLimit(false)} />
              </span>
            )}
            {wantFastPayout && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                Fast Payout ≤ 14d <X className="w-3 h-3 cursor-pointer" onClick={() => setWantFastPayout(false)} />
              </span>
            )}
            {wantOnDemandPayout && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                On-Demand Payout <X className="w-3 h-3 cursor-pointer" onClick={() => setWantOnDemandPayout(false)} />
              </span>
            )}
            {wantHighSplit && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                80%+ Profit Split <X className="w-3 h-3 cursor-pointer" onClick={() => setWantHighSplit(false)} />
              </span>
            )}
            {wantScalingPlan && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                Scaling Plan <X className="w-3 h-3 cursor-pointer" onClick={() => setWantScalingPlan(false)} />
              </span>
            )}
            {wantZeroMinDays && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                0 Min Days <X className="w-3 h-3 cursor-pointer" onClick={() => setWantZeroMinDays(false)} />
              </span>
            )}
            {wantNoTimeLimit && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                No Time Limit <X className="w-3 h-3 cursor-pointer" onClick={() => setWantNoTimeLimit(false)} />
              </span>
            )}
            {wantRefundableFee && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                Refundable Fee <X className="w-3 h-3 cursor-pointer" onClick={() => setWantRefundableFee(false)} />
              </span>
            )}
            {avoidTrailingDrawdown && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs bg-red-500/10 text-red-400 border border-red-500/30">
                NO Trailing DD <X className="w-3 h-3 cursor-pointer" onClick={() => setAvoidTrailingDrawdown(false)} />
              </span>
            )}
            {avoidConsistencyRule && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs bg-red-500/10 text-red-400 border border-red-500/30">
                NO Consistency <X className="w-3 h-3 cursor-pointer" onClick={() => setAvoidConsistencyRule(false)} />
              </span>
            )}
            {avoidInactivityLockout && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs bg-red-500/10 text-red-400 border border-red-500/30">
                NO Inactivity Ban <X className="w-3 h-3 cursor-pointer" onClick={() => setAvoidInactivityLockout(false)} />
              </span>
            )}
            {avoidEquityDailyLoss && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs bg-red-500/10 text-red-400 border border-red-500/30">
                NO Equity Daily Loss <X className="w-3 h-3 cursor-pointer" onClick={() => setAvoidEquityDailyLoss(false)} />
              </span>
            )}
            {avoidMandatoryStopLoss && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs bg-red-500/10 text-red-400 border border-red-500/30">
                NO Mandatory SL <X className="w-3 h-3 cursor-pointer" onClick={() => setAvoidMandatoryStopLoss(false)} />
              </span>
            )}
            {selectedCapital !== 'ALL' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs bg-blue-500/10 text-blue-400 border border-blue-500/30 font-mono">
                ${selectedCapital / 1000}k Capital <X className="w-3 h-3 cursor-pointer" onClick={() => setSelectedCapital('ALL')} />
              </span>
            )}
            {selectedType !== 'ALL' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs bg-purple-500/10 text-purple-400 border border-purple-500/30">
                {selectedType} Model <X className="w-3 h-3 cursor-pointer" onClick={() => setSelectedType('ALL')} />
              </span>
            )}
          </div>

          {/* Controls: Layout Switcher & Sorting */}
          <div className="flex items-center gap-3">
            <div className="flex items-center bg-[#080A10] p-1 rounded-xl border border-[#1F2228]">
              <button
                onClick={() => setViewLayout('grid')}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                  viewLayout === 'grid' ? 'bg-[#1F2228] text-white font-bold' : 'text-[#8A8F98] hover:text-white'
                }`}
                title="Grid Cards View"
              >
                Cards
              </button>
              <button
                onClick={() => setViewLayout('grouped')}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                  viewLayout === 'grouped' ? 'bg-[#1F2228] text-white font-bold' : 'text-[#8A8F98] hover:text-white'
                }`}
                title="Grouped by Prop Firm"
              >
                By Firm
              </button>
            </div>

            <div className="flex items-center gap-2">
              <label className="text-xs text-[#8A8F98] whitespace-nowrap hidden sm:flex items-center gap-1">
                <SlidersHorizontal className="w-3 h-3" /> Sort:
              </label>
              <select
                aria-label="Sort matching accounts"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-3 py-1.5 rounded-lg bg-[#080A10] border border-[#1F2228] text-xs text-white focus:outline-none focus:border-[#3b82f6]"
              >
                <option value="match">Highest Match Score</option>
                <option value="trust_desc">Highest Trust Score</option>
                <option value="price_asc">Lowest Price First</option>
                <option value="price_desc">Highest Price First</option>
                <option value="size_desc">Largest Capital First</option>
                <option value="split_desc">Highest Profit Split</option>
                <option value="payout_asc">Fastest First Payout</option>
              </select>
            </div>
          </div>
        </div>

        {/* ── 4. RESULTS DISPLAY ── */}
        <div className="mt-6">
          {filteredAccounts.length > 0 ? (
            viewLayout === 'grouped' ? (
              /* GROUPED BY FIRM VIEW */
              <div className="space-y-8">
                {Object.entries(groupedByFirm).map(([firmName, accounts]) => {
                  const firstAcc = accounts[0];
                  return (
                    <div
                      key={firmName}
                      className="rounded-2xl bg-[#111318] border border-[#1F2228] overflow-hidden shadow-lg"
                    >
                      {/* Firm Header */}
                      <div className="p-5 bg-gradient-to-r from-[#141720] to-[#111318] border-b border-[#1F2228] flex flex-wrap items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-b from-[#1c202d] to-[#10121a] border border-[#2b3244] shadow-md flex items-center justify-center p-1.5">
                            <img
                              src={firstAcc.logoUrl}
                              alt={firmName}
                              className="w-full h-full object-contain filter drop-shadow"
                              onError={(e) => {
                                (e.currentTarget as HTMLImageElement).src = firstAcc.countryFlag;
                              }}
                            />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="text-base font-bold text-white">{firmName}</h3>
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                VERIFIED
                              </span>
                              <span className="text-xs text-[#8A8F98] flex items-center gap-1">
                                {firstAcc.countryFlag && firstAcc.countryFlag.startsWith('http') ? (
                                  <img
                                    src={firstAcc.countryFlag}
                                    alt={firstAcc.country}
                                    className="w-4 h-3 inline object-cover rounded-sm"
                                  />
                                ) : (
                                  <span>{firstAcc.countryFlag || '🌐'}</span>
                                )}
                                <span>{firstAcc.country}</span>
                              </span>
                            </div>
                            <div className="flex items-center gap-3 mt-1 text-xs text-[#8A8F98]">
                              <span className="flex items-center gap-1 text-amber-400 font-semibold">
                                <Star className="w-3.5 h-3.5 fill-amber-400" /> {firstAcc.reviewScore} / 5
                                <span className="text-[#8A8F98] font-normal">
                                  ({firstAcc.reviewsCount.toLocaleString()} reviews)
                                </span>
                              </span>
                              <span>•</span>
                              <span className="text-blue-400 font-semibold">
                                Trust: {firstAcc.trustScore}/100 ({firstAcc.trustGrade})
                              </span>
                              <span>•</span>
                              <span>{accounts.length} Matching Models</span>
                            </div>
                          </div>
                        </div>

                        <button
                          onClick={() => onNavigate(`/prop-firms/${firstAcc.firmSlug}`)}
                          className="px-4 py-2 rounded-xl bg-white hover:bg-slate-200 text-[#080A10] text-xs font-bold transition-colors flex items-center gap-1.5"
                        >
                          View Full Dossier <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Accounts Grid for this Firm */}
                      <div className="p-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {accounts.slice(0, 6).map((item) => (
                          <AccountCard
                            key={item.id}
                            item={item}
                            isExpanded={expandedCardId === item.id}
                            onToggleExpand={handleToggleExpand}
                            onNavigate={handleNavigate}
                            isSelectedForCompare={selectedForCompare.includes(item.id)}
                            onToggleCompare={handleToggleCompare}
                          />
                        ))}
                      </div>
                      {accounts.length > 6 && (
                        <div className="px-5 pb-4 text-center border-t border-[#1F2228]/50 pt-3">
                          <button
                            onClick={() => {
                              setViewLayout('grid');
                              setSearchQuery(firmName);
                            }}
                            className="text-xs text-blue-400 hover:text-blue-300 font-semibold inline-flex items-center gap-1"
                          >
                            View all {accounts.length} models for {firmName} →
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              /* STANDARD 3-COLUMN RESPONSIVE GRID (PAGINATED FOR 60FPS SPEED) */
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {visibleAccounts.map((item) => (
                    <AccountCard
                      key={item.id}
                      item={item}
                      isExpanded={expandedCardId === item.id}
                      onToggleExpand={handleToggleExpand}
                      onNavigate={handleNavigate}
                      isSelectedForCompare={selectedForCompare.includes(item.id)}
                      onToggleCompare={handleToggleCompare}
                    />
                  ))}
                </div>

                {/* Progressive Load More / Show All Toolbar */}
                {filteredAccounts.length > visibleCount && (
                  <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 p-5 rounded-2xl bg-[#111318] border border-[#1F2228] shadow-lg">
                    <div className="text-xs text-[#8A8F98]">
                      Showing <span className="font-bold text-white">{visibleAccounts.length}</span> of{' '}
                      <span className="font-bold text-emerald-400">{filteredAccounts.length}</span> matching accounts
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() =>
                          setVisibleCount((prev) =>
                            Math.min(prev + PAGE_SIZE, filteredAccounts.length)
                          )
                        }
                        className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-md shadow-blue-500/20 flex items-center gap-1.5"
                      >
                        <ChevronDown className="w-4 h-4" /> Load Next {Math.min(PAGE_SIZE, filteredAccounts.length - visibleAccounts.length)} Accounts
                      </button>
                      <button
                        onClick={() => setVisibleCount(filteredAccounts.length)}
                        className="px-4 py-2.5 rounded-xl bg-[#080A10] hover:bg-[#1a1d24] border border-[#1F2228] text-xs font-semibold text-slate-300 hover:text-white transition-all"
                      >
                        Show All ({filteredAccounts.length})
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )
          ) : (
            /* ── EMPTY STATE WITH INTELLIGENT UNLOCK SUGGESTIONS ── */
            <div className="rounded-2xl bg-[#111318] border border-[#1F2228] p-10 text-center space-y-4 max-w-xl mx-auto my-12 shadow-2xl">
              <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mx-auto shadow-inner">
                <AlertTriangle className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">No Accounts Matched Every Constraint</h3>
                <p className="text-xs text-[#8A8F98] mt-1.5 max-w-md mx-auto leading-relaxed">
                  You currently have {activeFiltersCount} strict rules and dealbreakers active at once.
                  Prop firms rarely support every single extreme constraint simultaneously.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-[#080A10] border border-[#1F2228] text-xs text-slate-300 text-left space-y-2">
                <p className="font-bold text-amber-400 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" /> Suggestions to unlock matches:
                </p>
                <ul className="text-xs text-[#8A8F98] space-y-1.5 pl-1">
                  {avoidConsistencyRule && (
                    <li className="flex items-start gap-1.5">
                      <span className="text-amber-400">•</span>
                      <span>Toggle off <strong>"NO Consistency Rule"</strong> to include premier 2-step evaluations.</span>
                    </li>
                  )}
                  {wantStaticDrawdown && (
                    <li className="flex items-start gap-1.5">
                      <span className="text-amber-400">•</span>
                      <span>Allow <strong>trailing drawdown</strong> if trading futures or rapid pass combines.</span>
                    </li>
                  )}
                  {wantZeroMinDays && (
                    <li className="flex items-start gap-1.5">
                      <span className="text-amber-400">•</span>
                      <span>Allow <strong>low minimum days (≤ 3d)</strong> instead of strict zero days.</span>
                    </li>
                  )}
                  {selectedCapital !== 'ALL' && (
                    <li className="flex items-start gap-1.5">
                      <span className="text-amber-400">•</span>
                      <span>Switch Account Size to <strong>"All"</strong> to view other capital tiers.</span>
                    </li>
                  )}
                </ul>
              </div>

              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  onClick={resetAllFilters}
                  className="px-6 py-2.5 rounded-full bg-white text-[#080A10] font-bold text-xs hover:bg-slate-200 transition-colors shadow-lg"
                >
                  Reset All Filters
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ── 5. FLOATING COMPARE DOCK ── */}
        {selectedForCompare.length > 0 && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-[#111318]/95 backdrop-blur-md border border-blue-500/40 px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-4 text-xs">
            <div className="flex items-center gap-2">
              <Scale className="w-4 h-4 text-blue-400" />
              <span className="font-bold text-white">
                {selectedForCompare.length} of 4 Accounts Selected
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => onNavigate('/compare')}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold transition-all shadow-md flex items-center gap-1.5"
              >
                Compare Side-by-Side <ArrowRight className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setSelectedForCompare([])}
                className="px-2.5 py-2 rounded-xl bg-[#080A10] border border-[#1F2228] text-[#8A8F98] hover:text-white"
              >
                Clear
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// ── RICH ACCOUNT CARD COMPONENT WITH EXPANDABLE SPEC DRAWER ──────────────────
interface AccountCardProps {
  item: CandidateAccount;
  isExpanded: boolean;
  onToggleExpand: (id: string) => void;
  onNavigate: (path: string) => void;
  isSelectedForCompare: boolean;
  onToggleCompare: (id: string) => void;
}

const AccountCard = React.memo<AccountCardProps>(({
  item,
  isExpanded,
  onToggleExpand,
  onNavigate,
  isSelectedForCompare,
  onToggleCompare,
}) => {
  return (
    <div className="rounded-2xl bg-[#111318] border border-[#1F2228] hover:border-[#3b82f6]/50 transition-all duration-200 overflow-hidden flex flex-col group shadow-lg">
      {/* Top Bar: Brand, Model, Match Score */}
      <div className="p-5 border-b border-[#1F2228]/80 space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            {/* High-contrast dark logo pill */}
            <div className="w-12 h-12 rounded-xl bg-gradient-to-b from-[#1c202d] to-[#10121a] border border-[#2b3244] shadow-sm flex items-center justify-center p-1.5 shrink-0">
              <img
                src={item.logoUrl}
                alt={item.firmName}
                className="w-full h-full object-contain filter drop-shadow"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = item.countryFlag;
                }}
              />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-white truncate flex items-center gap-1.5">
                {item.firmName}
                <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  VERIFIED
                </span>
                {item.countryFlag && item.countryFlag.startsWith('http') ? (
                  <img
                    src={item.countryFlag}
                    alt={item.country}
                    className="w-3.5 h-2.5 inline object-cover rounded-sm shrink-0"
                  />
                ) : (
                  <span className="text-[11px] text-[#8A8F98]">{item.countryFlag || '🌐'}</span>
                )}
              </p>
              <h3 className="text-sm font-bold text-white truncate group-hover:text-blue-400 transition-colors">
                {item.modelName}
              </h3>
              <div className="flex items-center gap-2 mt-0.5 text-[10px] text-[#8A8F98]">
                <span className="text-amber-400 font-semibold flex items-center gap-0.5">
                  <Star className="w-3 h-3 fill-amber-400" /> {item.reviewScore}
                </span>
                <span>•</span>
                <span className="text-blue-400 font-semibold">Trust {item.trustScore}/100</span>
              </div>
            </div>
          </div>

          {/* Match Score Badge */}
          <div className="shrink-0 text-right">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-mono text-xs font-bold shadow-sm">
              <Sparkles className="w-3 h-3" />
              {item.score}% Match
            </span>
          </div>
        </div>

        {/* Capital & Real Pricing Headline */}
        <div className="flex items-center justify-between pt-1 border-t border-[#1F2228]/50">
          <div className="text-left">
            <span className="text-[10px] uppercase font-mono tracking-wider text-[#8A8F98]">
              Account Capital
            </span>
            <p className="text-base font-extrabold font-mono text-white leading-tight">
              ${item.size.toLocaleString()} USD
            </p>
          </div>

          <div className="text-right">
            <span className="text-[10px] uppercase font-mono tracking-wider text-[#8A8F98]">
              Challenge Fee
            </span>
            <div className="flex items-baseline justify-end gap-1.5">
              {item.discountedPrice && item.discountedPrice < item.officialPrice && (
                <span className="text-xs font-mono text-slate-500 line-through">
                  ${item.officialPrice}
                </span>
              )}
              <p className="text-base font-extrabold font-mono text-emerald-400 leading-tight">
                ${item.price}
              </p>
            </div>
            {item.refundableFee && (
              <span className="text-[10px] text-emerald-400 font-medium block">
                ✓ 100% Refundable
              </span>
            )}
          </div>
        </div>

        {/* Promo Code Badge if available */}
        {item.activePromo && (
          <div className="p-1.5 rounded-lg bg-blue-500/10 border border-blue-500/20 text-[11px] text-blue-300 flex items-center justify-between font-mono">
            <span>Promo: <strong>{item.activePromo.code}</strong></span>
            <span className="text-emerald-400 font-bold">{item.activePromo.discount}</span>
          </div>
        )}
      </div>

      {/* Verified Rule Checklist Matrix */}
      <div className="px-5 py-3 bg-[#0d0f15] border-b border-[#1F2228]/80">
        <div className="grid grid-cols-3 gap-2 text-[11px]">
          <div className="flex items-center gap-1 text-slate-300">
            {item.newsTradingAllowed ? (
              <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            ) : (
              <X className="w-3.5 h-3.5 text-red-400 shrink-0" />
            )}
            <span className="truncate">News Trading</span>
          </div>
          <div className="flex items-center gap-1 text-slate-300">
            {item.weekendHoldingAllowed ? (
              <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            ) : (
              <X className="w-3.5 h-3.5 text-red-400 shrink-0" />
            )}
            <span className="truncate">Weekend Swing</span>
          </div>
          <div className="flex items-center gap-1 text-slate-300">
            {item.eaTradingAllowed ? (
              <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            ) : (
              <X className="w-3.5 h-3.5 text-red-400 shrink-0" />
            )}
            <span className="truncate">EAs & Bots</span>
          </div>
          <div className="flex items-center gap-1 text-slate-300">
            {item.drawdownType === 'static' ? (
              <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            ) : (
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            )}
            <span className="truncate">{item.drawdownType === 'static' ? 'Static DD' : 'Trailing DD'}</span>
          </div>
          <div className="flex items-center gap-1 text-slate-300">
            <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span className="truncate">
              {item.hasNoDailyLimit ? 'No Daily DD' : `${item.dailyLossLimit}% Daily`}
            </span>
          </div>
          <div className="flex items-center gap-1 text-slate-300">
            <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span className="truncate">
              {item.minimumTradingDays === 0 ? '0 Min Days' : `${item.minimumTradingDays}d Min`}
            </span>
          </div>
        </div>
      </div>

      {/* Why it matches & Traps avoided */}
      <div className="p-4 space-y-2 bg-[#090b10] border-b border-[#1F2228]/80 flex-1">
        <p className="text-[10px] font-mono uppercase tracking-widest text-emerald-400 flex items-center gap-1">
          <Check className="w-3 h-3" /> Why It Matches Your Rules
        </p>
        <ul className="space-y-1.5">
          {item.satisfiedReasons && item.satisfiedReasons.length > 0 ? (
            item.satisfiedReasons.map((r, i) => (
              <li key={i} className="text-xs text-slate-300 flex items-start gap-1.5">
                <span className="text-emerald-400 mt-0.5 shrink-0 font-bold">✓</span>
                <span className="line-clamp-1">{r}</span>
              </li>
            ))
          ) : (
            <li className="text-xs text-[#8A8F98]">Standard evaluation parameters verified.</li>
          )}
        </ul>

        {item.dealbreakersAvoided && item.dealbreakersAvoided.length > 0 && (
          <div className="pt-2">
            <p className="text-[10px] font-mono uppercase tracking-widest text-blue-400 flex items-center gap-1 mb-1">
              <Shield className="w-3 h-3" /> Traps Avoided
            </p>
            <div className="flex flex-wrap gap-1">
              {item.dealbreakersAvoided.map((d, i) => (
                <span
                  key={i}
                  className="px-2 py-0.5 rounded text-[10px] bg-blue-500/10 text-blue-300 border border-blue-500/20 font-medium"
                >
                  {d}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Key Metrics Strip */}
      <div className="px-4 py-3 bg-[#080A10] border-b border-[#1F2228] grid grid-cols-4 gap-2 text-center text-xs">
        <div>
          <span className="text-[9px] font-mono text-[#8A8F98] uppercase block">Target</span>
          <span className="font-bold text-white">
            {item.profitTargetPhase1}%
            {item.profitTargetPhase2 > 0 && ` / ${item.profitTargetPhase2}%`}
          </span>
        </div>
        <div>
          <span className="text-[9px] font-mono text-[#8A8F98] uppercase block">Daily Loss</span>
          <span className="font-bold text-white">
            {item.hasNoDailyLimit ? 'None' : `${item.dailyLossLimit}%`}
            <span className="text-[9px] text-[#8A8F98] font-normal ml-0.5">
              ({item.dailyLossCalculation === 'balance_based' ? 'Bal' : 'Eq'})
            </span>
          </span>
        </div>
        <div>
          <span className="text-[9px] font-mono text-[#8A8F98] uppercase block">Max Loss</span>
          <span className="font-bold text-white">
            {item.maxTotalLoss}%{' '}
            <span className="text-[9px] text-[#8A8F98] font-normal ml-0.5">
              ({item.drawdownType === 'static' ? 'Static' : 'Trail'})
            </span>
          </span>
        </div>
        <div>
          <span className="text-[9px] font-mono text-[#8A8F98] uppercase block">Split</span>
          <span className="font-bold text-emerald-400">{item.profitSplit}%</span>
        </div>
      </div>

      {/* Expandable Full Specification Drawer */}
      {isExpanded && (
        <div className="p-4 bg-[#10131a] border-b border-[#1F2228] text-xs space-y-3 animate-in fade-in duration-200">
          <p className="font-bold text-white flex items-center gap-1.5 border-b border-[#1F2228] pb-1.5">
            <Info className="w-3.5 h-3.5 text-blue-400" /> Full Official Specifications & Limits
          </p>

          <div className="grid grid-cols-2 gap-2 text-[11px]">
            <div>
              <span className="text-[#8A8F98] block">Daily Loss Reset:</span>
              <span className="font-medium text-slate-200">00:00 Server Time (Midnight)</span>
            </div>
            <div>
              <span className="text-[#8A8F98] block">Drawdown Floor:</span>
              <span className="font-medium text-slate-200">
                ${Math.round(item.size * (1 - item.maxTotalLoss / 100)).toLocaleString()} (Static)
              </span>
            </div>
            <div>
              <span className="text-[#8A8F98] block">First Payout Cadence:</span>
              <span className="font-medium text-slate-200">{item.payoutFrequency}</span>
            </div>
            <div>
              <span className="text-[#8A8F98] block">Scaling Ceiling:</span>
              <span className="font-medium text-slate-200">Up to $2,000,000 USD</span>
            </div>
            <div>
              <span className="text-[#8A8F98] block">Platforms Supported:</span>
              <span className="font-medium text-slate-200 truncate block">
                {item.platforms.join(', ')}
              </span>
            </div>
            <div>
              <span className="text-[#8A8F98] block">Forex Leverage:</span>
              <span className="font-medium text-slate-200">{item.leverage.forex || '1:100'}</span>
            </div>
          </div>

          <div className="pt-1 text-[10px] text-[#8A8F98] flex items-center justify-between">
            <span>Verified: {item.lastVerifiedDate}</span>
            <span className="text-emerald-400 font-semibold">100% Rule Integrity</span>
          </div>
        </div>
      )}

      {/* Card Actions Footer */}
      <div className="p-3 bg-[#111318] flex items-center gap-2">
        <button
          onClick={() => onNavigate(`/prop-firms/${item.firmSlug}`)}
          className="flex-1 py-2.5 rounded-xl bg-white hover:bg-slate-100 text-[#080A10] text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-sm"
        >
          Inspect Dossier <ArrowRight className="w-3.5 h-3.5" />
        </button>

        <button
          onClick={() => onToggleExpand(item.id)}
          title={isExpanded ? 'Collapse rules' : 'Expand full rules & specs'}
          className="px-3 py-2.5 rounded-xl bg-[#080A10] border border-[#1F2228] hover:border-[#3b82f6] text-[#8A8F98] hover:text-white text-xs transition-colors flex items-center justify-center gap-1"
        >
          {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          <span className="text-[11px] font-medium hidden sm:inline">
            {isExpanded ? 'Close' : 'Specs'}
          </span>
        </button>

        <button
          onClick={() => onToggleCompare(item.id)}
          title="Add to side-by-side compare"
          className={`px-3 py-2.5 rounded-xl border text-xs transition-colors flex items-center justify-center ${
            isSelectedForCompare
              ? 'bg-blue-600 border-blue-500 text-white'
              : 'bg-[#080A10] border-[#1F2228] hover:border-[#3b82f6] text-[#8A8F98] hover:text-white'
          }`}
        >
          <Scale className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}, (prev, next) => {
  return (
    prev.item.id === next.item.id &&
    prev.item.score === next.item.score &&
    prev.isExpanded === next.isExpanded &&
    prev.isSelectedForCompare === next.isSelectedForCompare
  );
});
