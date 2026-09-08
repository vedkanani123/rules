/**
 * Universal Types for Prop Firm Intelligence Platform
 * Built for universal prop firm analysis and evidence-first intelligence
 */

export type EvidenceClass =
  | 'OFFICIAL'
  | 'OFFICIAL_SUPPORT'
  | 'OFFICIAL_TERMS'
  | 'OFFICIAL_PROMOTIONAL'
  | 'TRADER_REPORT'
  | 'REVIEW_PLATFORM'
  | 'FIRM_RESPONSE'
  | 'THIRD_PARTY_ANALYSIS'
  | 'INFERENCE'
  | 'UNVERIFIED'
  | 'CONFLICTING';

export type ConfidenceGrade = 'A' | 'B' | 'C' | 'D' | 'E';

export type RuleImportance = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

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

export type UrlCategory =
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

export type RuleCategory =
  | 'RISK'
  | 'TRADING'
  | 'PAYOUT'
  | 'EVALUATION'
  | 'ACCOUNT'
  | 'COMMERCIAL'
  | 'LEGAL';

export interface SourceDocument {
  id: string;
  firm_id: string;
  url: string;
  normalized_url: string;
  title: string;
  category: UrlCategory;
  evidence_class: EvidenceClass;
  http_status: number;
  content_type: string;
  content_hash: string;
  depth: number;
  crawled_at: string;
  page_section?: string;
  raw_html_snippet?: string;
  clean_text_snippet?: string;
  extracted_tables?: Array<{
    title?: string;
    headers: string[];
    rows: string[][];
  }>;
  discovered_from?: string;
}

export interface RuleException {
  condition: string;
  applies_to: string;
  description: string;
  source_id: string;
}

export interface RuleEvidenceItem {
  id: string;
  firm_id: string;
  program_id?: string;
  account_id?: string;
  category: RuleCategory;
  rule_key: string;
  name: string;
  official_wording: string;
  normalized_value: string;
  unit?: string;
  stage_scope: StageScope;
  importance: RuleImportance;
  importance_reason: string;
  simple_explanation: string;
  example: string;
  why_it_matters: string;
  accidental_violation_risk: string;
  visibility_score: number; // 0 (prominent) to 4 (buried)
  impact_score: number; // 0 to 100
  easy_to_miss_score: number; // visibility * impact
  is_easy_to_miss: boolean;
  easy_to_miss_reason?: string;
  source_id: string;
  source_url: string;
  source_title: string;
  source_type: EvidenceClass;
  source_quote: string;
  source_section: string;
  retrieved_at: string;
  effective_date: string;
  confidence: ConfidenceGrade;
  verification_status: VerificationStatus;
  exceptions?: RuleException[];
  notes?: string;
  calculation_formula?: string;
  consequence?: 'HARD_BREACH' | 'SOFT_BREACH' | 'PROFIT_DEDUCTION' | 'PAYOUT_DENIAL' | 'WARNING';
  pass_scenario?: string;
  fail_scenario?: string;
  math_breakdown?: Array<{ step: string; calculation: string; note: string }>;
  is_hidden_rule?: boolean;
  applicable_models?: string[];
  tags?: string[];
  rule_type?: 'STANDARD' | 'HIDDEN_TRAP' | 'HIGH_RISK_POLICY' | 'PLATFORM_RESTRICTION';
}

export interface RuleConflict {
  id: string;
  firm_id: string;
  rule_name: string;
  category: string;
  headline: string;
  description: string;
  source_a_label?: string;
  source_a_url?: string;
  source_a_quote?: string;
  source_b_label?: string;
  source_b_url?: string;
  source_b_quote?: string;
  source_a?: {
    title: string;
    url: string;
    evidence_class: EvidenceClass;
    quote: string;
    claim: string;
  };
  source_b?: {
    title: string;
    url: string;
    evidence_class: EvidenceClass;
    quote: string;
    claim: string;
  };
  what_this_means: string;
  recommended_trader_action?: string;
  recommended_action?: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  detected_at: string;
}

export interface RuleVersionChange {
  id: string;
  firm_id: string;
  rule_name: string;
  category: string;
  old_value?: string;
  new_value?: string;
  previous_value?: string;
  effective_date: string;
  source_url: string;
  source_title: string;
  change_type: 'ADDED' | 'MODIFIED' | 'REMOVED';
  impact: RuleImportance;
  who_is_affected?: string;
  affected_accounts?: string[];
  explanation?: string;
  human_explanation?: string;
  diff_summary?: string;
}

export type RuleChangeHistory = RuleVersionChange;

export interface ReviewTheme {
  theme: string;
  count: number;
  percentage: number;
  summary: string;
  sentiment: 'CRITICAL_RISK' | 'HIGH_RISK' | 'MODERATE_RISK' | 'POSITIVE';
}

export interface ReviewComplaint {
  id: string;
  firm_id: string;
  review_source?: 'Trustpilot' | 'PropFirmMatch' | 'DirectSubmission';
  platform?: string;
  reviewer_name?: string;
  author?: string;
  reviewer_country?: string;
  review_date?: string;
  date?: string;
  rating: number; // 1 to 5
  title?: string;
  program?: string;
  account_size?: string;
  payout_reached?: boolean;
  payout_amount?: string;
  payout_denied?: boolean;
  complaint_category: string;
  trader_claim?: string;
  complaint_text?: string;
  trader_evidence_details?: string;
  firm_response?: string;
  firm_response_date?: string;
  platform_analysis?: string;
  independent_analysis?: string;
  verification_status: string;
  helpful_votes?: number;
  upvotes?: number;
}

export interface DataQualityStats {
  total_rules: number;
  verified_percentage: number;
  sources_count: number;
  unverified_count: number;
  conflicts_detected: number;
  last_crawled_at: string;
}

export type CrawledDocument = SourceDocument;
export type CrawlerStatus = CrawlRunStats;

export interface PropAccountModel {
  id: string;
  program_id: string;
  firm_id: string;
  name: string;
  account_size: number;
  currency: string;
  price: number;
  discounted_price?: number;
  discount_code?: string;
  fee_type: 'One-Time' | 'Monthly' | 'Activation';
  refundable: boolean;
  refund_policy_notes: string;
  profit_target_step1?: number; // percentage, e.g. 8
  profit_target_step2?: number; // percentage, e.g. 5
  profit_target_step3?: number;
  daily_drawdown: number; // e.g. 4 or 5%
  daily_drawdown_type: 'Balance-Based' | 'Equity-Based' | 'Trailing' | 'Static';
  max_drawdown: number; // e.g. 8 or 10%
  max_drawdown_type: 'Static' | 'Trailing' | 'EOD' | 'Intraday';
  minimum_trading_days_eval: number;
  minimum_trading_days_funded: number;
  maximum_trading_days: string; // "Unlimited" or days
  profit_split: string; // e.g. "Up to 95%" or "80/20"
  payout_frequency: string; // e.g. "Bi-weekly" or "On Demand"
  first_payout_days: number;
  payout_minimum: number;
  payout_cap?: string;
  consistency_rule: string;
  news_trading: string;
  weekend_holding: string;
  overnight_holding: string;
  ea_allowed: boolean;
  copy_trading: string;
  leverage: string;
  platforms: string[];
  instruments: string[];
  biggest_risks: Array<{
    title: string;
    description: string;
    how_to_avoid: string;
    severity: RuleImportance;
  }>;
  easy_to_miss_rules: string[];
  payout_conditions: string[];
  rules_summary: Array<{
    label: string;
    value: string;
    importance: RuleImportance;
    source_ref: string;
  }>;
}

export interface PropProgram {
  id: string;
  firm_id: string;
  name: string;
  type: '1-Step' | '2-Step' | '3-Step' | 'Instant' | 'Futures' | 'Blitz' | 'Custom';
  description: string;
  status: 'ACTIVE' | 'ARCHIVED';
  accounts: PropAccountModel[];
}

export interface PropFirm {
  id: string;
  name: string;
  legal_name: string;
  brand_name: string;
  website: string;
  logo_url: string;
  country: string;
  country_code: string;
  headquarters: string;
  founded: string;
  ceo?: string;
  trustpilot_rating: number;
  trustpilot_reviews_count: number;
  propfirmmatch_rating: number;
  propfirmmatch_reviews_count: number;
  overall_score: number;
  data_confidence: ConfidenceGrade;
  last_verified: string;
  status: 'ACTIVE' | 'WARNING_FLAGS' | 'UNDER_REVIEW';
  scores: {
    risk_score: number; // 0-100 (higher = safer / less restrictive)
    payout_score: number;
    trading_freedom: number;
    rule_simplicity: number;
    transparency: number;
    trader_experience: number;
  };
  score_reasons: {
    risk: string;
    payout: string;
    trading_freedom: string;
    rule_simplicity: string;
    transparency: string;
    trader_experience: string;
  };
  programs: PropProgram[];
  active_offer?: {
    code: string;
    discount: string;
    perk: string;
    details: string;
  };
  ai_summary: {
    verdict: 'POSITIVE' | 'MIXED' | 'CAUTION';
    title: string;
    text: string;
  };
}

export interface CrawlQueueItem {
  id: string;
  url: string;
  normalized_url: string;
  domain: string;
  parent_url?: string;
  depth: number;
  priority: number;
  status: 'QUEUED' | 'FETCHING' | 'PARSED' | 'FAILED' | 'SKIPPED';
  category: UrlCategory;
  attempt_count: number;
  last_attempt_at?: string;
  http_status?: number;
  content_type?: string;
  response_time_ms?: number;
  error?: string;
  content_hash?: string;
  discovered_at: string;
  processed_at?: string;
}

export interface CrawlRunStats {
  crawl_id: string;
  start_url: string;
  started_at: string;
  completed_at?: string;
  status: 'RUNNING' | 'COMPLETED' | 'PAUSED' | 'FAILED';
  pages_discovered: number;
  pages_crawled: number;
  pages_failed: number;
  pages_skipped: number;
  external_domains_discovered: number;
  documents_discovered: number;
  js_rendered_count: number;
  duplicate_pages_detected: number;
  avg_response_time_ms: number;
  rules_extracted_count: number;
  conflicts_detected_count: number;
}

export interface StrategyProfile {
  id: string;
  name: string;
  description: string;
  icon: string;
  key_needs: string[];
  key_risks: string[];
}

export interface StrategyMatchResult {
  program_id: string;
  account_id: string;
  program_name: string;
  account_name: string;
  match_percentage: number;
  verdict: 'EXCELLENT' | 'GOOD' | 'COMPATIBLE_WITH_CAUTION' | 'NOT_RECOMMENDED';
  pros: string[];
  cons: string[];
  rule_warnings: string[];
}

export interface SimulatorState {
  account_size: number;
  initial_balance: number;
  current_balance: number;
  current_equity: number;
  day_start_balance: number;
  day_high_water_equity: number;
  daily_drawdown_limit_pct: number;
  max_drawdown_limit_pct: number;
  drawdown_calc_type: 'Balance-Based' | 'Equity-Based' | 'High-Water-Trailing';
  open_floating_pnl: number;
  margin_used: number;
  total_margin_available: number;
  top_single_day_profit: number;
  total_profit: number;
  consistency_threshold_pct: number;
}

export interface SimulatorEvaluation {
  daily_loss_status: 'SAFE' | 'WARNING' | 'BREACHED';
  daily_loss_amount: number;
  daily_loss_allowed: number;
  daily_loss_remaining: number;
  daily_loss_floor: number;
  
  max_loss_status: 'SAFE' | 'WARNING' | 'BREACHED';
  max_loss_amount: number;
  max_loss_allowed: number;
  max_loss_remaining: number;
  max_loss_floor: number;

  margin_status: 'SAFE' | 'WARNING' | 'GAMBLING_FLAG_BREACH';
  margin_usage_pct: number;
  margin_limit_pct: number;

  consistency_status: 'SAFE' | 'WARNING' | 'FAILED_THRESHOLD';
  consistency_pct: number;
  consistency_max_allowed_pct: number;

  overall_verdict: 'ACCOUNT_HEALTHY' | 'APPROACHING_RISK_LIMIT' | 'ACCOUNT_BREACHED';
  critical_warnings: string[];
  responsible_rules: string[];
}
