// Universal Prop-Firm Intelligence Platform Schema & Types
// Designed to support ANY prop firm with strict evidence separation

export type EvidenceClass =
  | 'OFFICIAL'               // Directly published by prop firm primary pages
  | 'OFFICIAL_SUPPORT'       // Firm support/help-center/FAQ content
  | 'OFFICIAL_TERMS'         // Legal terms, policies, disclosures
  | 'OFFICIAL_PROMOTIONAL'   // Marketing/landing page claims
  | 'TRADER_REPORT'          // Individual trader statement / review
  | 'REVIEW_PLATFORM'        // Trustpilot, PropFirmMatch, TradingPilot
  | 'FIRM_RESPONSE'          // Official response to a trader complaint
  | 'THIRD_PARTY_ANALYSIS'   // Independent benchmark analysis
  | 'INFERENCE'              // Deterministically calculated interpretation
  | 'UNVERIFIED'             // Cannot currently be verified
  | 'CONFLICTING';           // Multiple official/semi-official sources disagree

export type ConfidenceRating = 'A' | 'B' | 'C' | 'D' | 'E';
// A = direct official source
// B = official secondary source
// C = multiple credible third-party sources
// D = single third-party report
// E = unverified

export type VerificationStatus =
  | 'VERIFIED'
  | 'PARTIALLY_VERIFIED'
  | 'CONFLICTING'
  | 'OUTDATED'
  | 'UNVERIFIED';

export type StageScope =
  | 'PURCHASE'
  | 'EVALUATION'
  | 'STEP_1'
  | 'STEP_2'
  | 'STEP_3'
  | 'FUNDED'
  | 'PAYOUT'
  | 'SCALING'
  | 'ALL';

export type RuleCategory =
  | 'RISK'
  | 'TRADING'
  | 'PAYOUT'
  | 'EVALUATION'
  | 'ACCOUNT'
  | 'COMMERCIAL'
  | 'LEGAL';

export type RuleImportance = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type DrawdownType =
  | 'static'
  | 'trailing_balance'
  | 'trailing_equity'
  | 'end_of_day'
  | 'intraday_equity';

export type URLCategory =
  | 'HOME'
  | 'PRODUCT'
  | 'MODEL'
  | 'CHALLENGE'
  | 'ACCOUNT'
  | 'PRICING'
  | 'FAQ'
  | 'HELP'
  | 'RULES'
  | 'PAYOUT'
  | 'REWARD'
  | 'TRADING'
  | 'PLATFORM'
  | 'ABOUT'
  | 'BLOG'
  | 'NEWS'
  | 'ANNOUNCEMENT'
  | 'TERMS'
  | 'REFUND'
  | 'COMPLAINTS'
  | 'PRIVACY'
  | 'DISCLAIMER'
  | 'CONTACT'
  | 'AFFILIATE'
  | 'REVIEW'
  | 'SOCIAL'
  | 'EXTERNAL'
  | 'UNKNOWN';

export interface SourceEvidence {
  id: string;
  sourceUrl: string;
  sourceTitle: string;
  sourceType: EvidenceClass;
  sourceExcerpt: string;
  sourceSection?: string;
  retrievedAt: string;
  effectiveDate?: string;
  confidence: ConfidenceRating;
  verificationStatus: VerificationStatus;
}

export interface RuleException {
  condition: string;
  description: string;
  appliesToStages?: StageScope[];
  effectiveDate?: string;
}

export interface RuleCalculationFormula {
  formulaName: string;
  formulaExpression: string;
  variables: Record<string, string>;
  exampleInput: Record<string, number | string>;
  exampleOutput: string;
  explanation: string;
}

export interface Rule {
  id: string;
  category: RuleCategory;
  name: string;
  slug: string;
  headlineValue: string;
  normalizedValue: number | string | boolean;
  unit?: string;
  stageScope: StageScope;
  accountModelScope?: string[]; // e.g. ['2-step', 'instant']
  importance: RuleImportance;
  importanceReason: string;
  visibilityScore: number; // 0 = prominent, 1 = normal, 2 = secondary, 3 = buried, 4 = terms-only
  impactScore: number;     // 0 - 100
  easyToMissRisk: number;  // visibilityScore * impactScore
  isEasyToMiss: boolean;
  whyEasyToMiss?: string;
  officialWording: string;
  plainEnglish: string;
  formula?: RuleCalculationFormula;
  howTradersViolate: string;
  primaryRiskRating: 'SAFE' | 'MODERATE' | 'HIGH' | 'EXTREME';
  exceptions?: RuleException[];
  sources: SourceEvidence[];
  effectiveFrom?: string;
  effectiveTo?: string;
  lastVerified: string;
}

export interface AccountTier {
  id: string;
  programId: string;
  name: string;
  nominalSize: number;
  currency: string;
  price: number;
  discountedPrice?: number;
  discountCode?: string;
  refundableFee: boolean;
  activationFee?: number;
  profitTargetPhase1?: number; // percentage
  profitTargetPhase2?: number; // percentage
  profitTargetPhase3?: number;
  dailyLossLimit: number;      // percentage
  dailyLossCalculation: 'equity_based' | 'balance_based' | 'higher_of_equity_balance';
  maxTotalLoss: number;        // percentage
  drawdownType: DrawdownType;
  minimumTradingDays: number;
  maximumTradingDays: number | 'Unlimited';
  profitSplit: number;         // percentage
  profitSplitMaxWithAddon?: number;
  payoutFrequency: string;     // e.g. 'Bi-weekly', 'On-Demand (First)', 'Every 14 Days'
  firstPayoutConditions: string;
  payoutMinimum: number;
  payoutCap?: string;
  consistencyRule?: string;
  newsTradingRule: 'Allowed' | 'Restricted' | 'Prohibited';
  newsTradingDetail: string;
  weekendHolding: boolean;
  overnightHolding: boolean;
  eaAllowed: boolean;
  copyTradingAllowed: boolean;
  hedgingAllowed: boolean;
  inactivityLimitDays: number; // e.g. 30 days before lock
  leverage: string;            // e.g. '1:100'
  platforms: string[];         // e.g. ['MetaTrader 5', 'TradeLocker', 'cTrader']
  instruments: string[];       // e.g. ['Forex', 'Indices', 'Crypto', 'Commodities']
  rules: Rule[];
  sources: SourceEvidence[];
  lastVerified: string;
}

export interface ProgramModel {
  id: string;
  firmId: string;
  name: string;
  slug: string;
  programType: '1-Step' | '2-Step' | '3-Step' | 'Instant' | 'Futures' | 'Hybrid';
  description: string;
  stagesCount: number;
  accounts: AccountTier[];
  keyAdvantages: string[];
  primaryWatchouts: string[];
}

export interface LegalEntity {
  name: string;
  companyNumber: string;
  jurisdiction: string;
  registeredAddress: string;
  role: string;
}

export interface FirmScorecard {
  riskScore: number;          // 0-100
  payoutScore: number;        // 0-100
  tradingFreedomScore: number;// 0-100
  ruleComplexityScore: number;// 0-100 (lower is simpler)
  transparencyScore: number;  // 0-100
  traderExperienceScore: number; // 0-100
  overallScore: number;       // 0-100
  scoreExplanations: Record<string, string>;
}

export interface PropFirm {
  id: string;
  name: string;
  slug: string;
  legalEntities: LegalEntity[];
  brandName: string;
  website: string;
  supportUrl: string;
  helpCenterUrl?: string;
  headquarters: string;
  country: string;
  countryFlag: string;
  foundedYear: number;
  ceoName: string;
  status: 'ACTIVE' | 'CAUTION' | 'RESTRICTED' | 'DISCONTINUED';
  confidenceRating: ConfidenceRating;
  payoutGuarantee?: string;   // e.g. '$1,000 extra if delayed beyond 2 business days'
  totalPayoutsReported?: string;
  activeTradersReported?: string;
  platforms: string[];
  supportedCountriesCount: number;
  restrictedCountries: string[];
  marketType?: 'Forex' | 'Futures' | 'Crypto' | 'Multi-Asset';
  tagline?: string;
  highlights?: string[];
  cautionFlags?: string[];
  activePromo?: {
    code: string;
    discount: string;
    details: string;
  };
  scorecard: FirmScorecard;
  programs: ProgramModel[];
  rules: Rule[];
  easyToMissRules: Rule[];
  conflicts: RuleConflict[];
  reviewsOverview: ReviewsOverview;
  recentChanges: RuleChange[];
  lastVerified: string;
}

export interface RuleConflict {
  id: string;
  topic: string;
  sourceA: {
    claim: string;
    url: string;
    sourceType: EvidenceClass;
    context: string;
  };
  sourceB: {
    claim: string;
    url: string;
    sourceType: EvidenceClass;
    context: string;
  };
  discrepancy: string;
  practicalMeaning: string;
  recommendedTraderAction: string;
  confidence: ConfidenceRating;
}

export interface TraderReview {
  id: string;
  firmId: string;
  author: string;
  source: 'Trustpilot' | 'PropFirmMatch' | 'DirectSubmission';
  reviewUrl: string;
  date: string;
  rating: number; // 1-5
  traderCountry?: string;
  accountTypeMentioned?: string;
  accountSizeMentioned?: string;
  payoutStatus?: 'Received' | 'Denied' | 'Delayed' | 'Not Reached';
  complaintCategory?:
    | 'PAYOUT'
    | 'RULES'
    | 'RISK'
    | 'SUPPORT'
    | 'PLATFORM'
    | 'EXECUTION'
    | 'KYC'
    | 'REFUND'
    | 'ACCOUNT_CLOSURE'
    | 'COPY_TRADING'
    | 'NEWS'
    | 'MARGIN'
    | 'INACTIVITY'
    | 'OTHER';
  traderAllegation: string;
  firmResponse?: {
    responderName: string;
    responderTitle?: string;
    responseDate: string;
    responseText: string;
  };
  platformNeutralAnalysis: string;
  evidenceStrength: 'HIGH' | 'MEDIUM' | 'UNVERIFIABLE';
}

export interface ReviewsOverview {
  totalReviews: number;
  averageRating: number;
  sentimentDistribution: {
    positive: number; // percentage
    neutral: number;
    negative: number;
  };
  complaintThemeBreakdown: {
    category: string;
    percentage: number;
    count: number;
    description: string;
  }[];
  recentReviews: TraderReview[];
}

export interface RuleChange {
  id: string;
  firmId: string;
  firmName: string;
  ruleName: string;
  oldValue: string;
  newValue: string;
  effectiveDate: string;
  changeType: 'ADDED' | 'MODIFIED' | 'REMOVED' | 'RESTRICTED';
  impactLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  whoIsAffected: string;
  plainEnglishSummary: string;
  sourceUrl: string;
  sourceTitle: string;
}

export interface CrawlSnapshotNode {
  url: string;
  title: string;
  category: URLCategory;
  httpStatus: number;
  depth: number;
  contentHash: string;
  discoveredFrom: string;
  crawledAt: string;
  extractedRulesCount: number;
  internalLinksCount: number;
  externalLinksCount: number;
}

export interface CrawlRunSummary {
  firmId: string;
  firmName: string;
  startUrl: string;
  startedAt: string;
  completedAt: string;
  totalDiscovered: number;
  totalCrawled: number;
  totalFailed: number;
  totalSkipped: number;
  jsRenderedCount: number;
  duplicateCount: number;
  documentsFoundCount: number;
  averageResponseTimeMs: number;
  discoveredNodes: CrawlSnapshotNode[];
}

export interface SimulationInput {
  nominalSize: number;
  startingBalance: number;
  currentBalance: number;
  currentEquity: number;
  todayStartEquity: number;
  highWaterEquityToday: number;
  dailyLossLimitPct: number;
  maxLossLimitPct: number;
  drawdownType: DrawdownType;
  openLotsRisked: number;
  tradeRiskPercent: number;
}

export interface SimulationResult {
  overallStatus: 'SAFE' | 'WARNING' | 'BREACH';
  dailyLossFloor: number;
  dailyLossDistance: number;
  dailyLossStatus: 'SAFE' | 'WARNING' | 'BREACH';
  maxLossFloor: number;
  maxLossDistance: number;
  maxLossStatus: 'SAFE' | 'WARNING' | 'BREACH';
  triggeredRules: string[];
  explanation: string;
  remainingSafeLoss: number;
  safetyBufferPercentage: number;
}

export interface RuleGuideItem {
  slug: string;
  name: string;
  category: string;
  shortDefinition: string;
  detailedExplanation: string;
  formula: string;
  example: string;
  howFirmsCalculate: {
    title: string;
    description: string;
  }[];
  commonMistakes: string[];
  firmsUsing: {
    firmName: string;
    modelVariation: string;
  }[];
}
