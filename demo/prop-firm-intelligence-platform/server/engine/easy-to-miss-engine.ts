import { RuleEvidenceItem } from '../../src/types';

export class EasyToMissEngine {
  /**
   * Calculates visibility score (0-4), impact score (0-100), and easy-to-miss risk
   */
  static calculateScore(visibility: number, impact: number): {
    score: number;
    is_easy_to_miss: boolean;
    tier: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL_TRAP';
  } {
    const score = visibility * impact;
    const is_easy_to_miss = score >= 120 || visibility >= 2;
    let tier: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL_TRAP' = 'LOW';

    if (score >= 250) tier = 'CRITICAL_TRAP';
    else if (score >= 180) tier = 'HIGH';
    else if (score >= 100) tier = 'MODERATE';

    return { score, is_easy_to_miss, tier };
  }

  /**
   * Returns list of verified easy-to-miss rules for a firm
   */
  static getKnownEasyToMissRules(firmId: string): RuleEvidenceItem[] {
    if (firmId === 'goat-funded-trader') {
      return [
        {
          id: 'etm-gft-01',
          firm_id: 'goat-funded-trader',
          category: 'TRADING',
          rule_key: 'margin_80_rule',
          name: '80% Max Combined Margin Usage Limit',
          official_wording: 'We define gambling-style trading as any trade where more than 80% of available margin is used in a trading idea. Such excessive risk exposure indicates a lack of proper risk management, which goes against the principles we uphold.',
          normalized_value: 'Max 80% margin utilization',
          stage_scope: 'ALL',
          importance: 'CRITICAL',
          importance_reason: 'Violating this rule can result in total profit deduction or account reset even if you never breached your drawdown limits.',
          simple_explanation: 'You cannot use more than 80% of your account margin across all simultaneous open trades in a single currency pair or trade idea.',
          example: 'On a $100K account with 1:50 leverage, opening multiple lots that utilize $1,650 out of $2,000 required margin equates to 82.5% margin usage, triggering an automatic profit forfeiture.',
          why_it_matters: 'Many swing and scalping traders open 3-4 split positions on Gold or Indices and easily cross 80% margin without realizing it.',
          accidental_violation_risk: 'High during high-volatility events when placing split position sizes.',
          visibility_score: 3,
          impact_score: 95,
          easy_to_miss_score: 285,
          is_easy_to_miss: true,
          easy_to_miss_reason: 'Only mentioned in deep FAQ articles under "Gambling and Prohibited Trading Behavior", not shown on main pricing table.',
          source_id: 'src-faq-margin',
          source_url: 'https://help.goatfundedtrader.com/en/articles/margin-and-gambling-policy',
          source_title: 'FAQ - Prohibited Trading Practices & Margin Rules',
          source_type: 'OFFICIAL_SUPPORT',
          source_quote: 'We define gambling-style trading as any trade where more than 80% of available margin is used in a trading idea.',
          source_section: 'Risk Management Guidelines',
          retrieved_at: '2026-08-28',
          effective_date: '2025-01-01',
          confidence: 'A',
          verification_status: 'VERIFIED',
          calculation_formula: 'Margin_Usage_Pct = (Total_Margin_Used / Available_Margin) * 100 <= 80%'
        },
        {
          id: 'etm-gft-02',
          firm_id: 'goat-funded-trader',
          category: 'PAYOUT',
          rule_key: 'no_open_positions_or_pending_orders',
          name: 'Zero Open Positions & Zero Pending Orders at Payout Request',
          official_wording: 'Before submitting a reward/payout request, all open trades and all pending limit/stop orders must be completely closed. Requests submitted with active pending orders will be automatically rejected.',
          normalized_value: 'Zero active positions and pending orders',
          stage_scope: 'PAYOUT',
          importance: 'HIGH',
          importance_reason: 'Having a forgotten limit order or open micro-lot when pressing the Payout button results in instant denial and resets your payout submission window.',
          simple_explanation: 'You must ensure your terminal is 100% flat (no trades, no buy/sell limits, no stop orders) before requesting your withdrawal.',
          example: 'A trader with $4,500 profit requests payout but has a pending Buy Limit on EURUSD placed days ago. The payout is denied, requiring an additional review cycle.',
          why_it_matters: 'Prop firms lock your balance at payout time; unexecuted orders complicate equity snapshots.',
          accidental_violation_risk: 'Very common if you use grid EAs or leave limit orders across multiple charts.',
          visibility_score: 2,
          impact_score: 90,
          easy_to_miss_score: 180,
          is_easy_to_miss: true,
          easy_to_miss_reason: 'Documented in the Payout Guidelines and Terms, but missing from promotional overview cards.',
          source_id: 'src-payout-rules',
          source_url: 'https://help.goatfundedtrader.com/en/articles/how-to-request-a-payout',
          source_title: 'Help Center - Payout Request Checklist',
          source_type: 'OFFICIAL_SUPPORT',
          source_quote: 'All positions and pending orders must be closed prior to requesting a reward.',
          source_section: 'Withdrawal Requirements',
          retrieved_at: '2026-08-30',
          effective_date: '2025-06-01',
          confidence: 'A',
          verification_status: 'VERIFIED'
        },
        {
          id: 'etm-gft-03',
          firm_id: 'goat-funded-trader',
          category: 'PAYOUT',
          rule_key: 'funded_min_trading_days_cycle',
          name: 'Funded Stage Minimum 4 Trading Days per Payout Cycle',
          official_wording: 'Traders must log a minimum of 4 distinct trading days in the funded stage for each payout cycle (updated from 3 days for accounts purchased after July 25, 2026).',
          normalized_value: '4 minimum trading days per payout cycle',
          stage_scope: 'FUNDED',
          importance: 'HIGH',
          importance_reason: 'Even if you reach your profit target in 1 or 2 days, you cannot withdraw until 4 distinct trading days have elapsed with executed trades.',
          simple_explanation: 'You must place at least one trade on 4 separate calendar days during each payout period.',
          example: 'If you make $5,000 on Day 1, you must trade on 3 additional days (even with micro-lots according to risk rules) before submitting your withdrawal request.',
          why_it_matters: 'Prevents one-hit-wonder lottery payouts and enforces disciplined session participation.',
          accidental_violation_risk: 'Traders requesting payouts after 2 strong days will be blocked by the dashboard.',
          visibility_score: 2,
          impact_score: 85,
          easy_to_miss_score: 170,
          is_easy_to_miss: true,
          easy_to_miss_reason: 'Recently increased from 3 days to 4 days on July 25, 2026. Different rules apply based on your purchase date.',
          source_id: 'src-faq-trading-days',
          source_url: 'https://help.goatfundedtrader.com/en/articles/minimum-trading-days-funded',
          source_title: 'FAQ - Funded Stage Trading Requirements',
          source_type: 'OFFICIAL_SUPPORT',
          source_quote: 'For accounts purchased on or after July 25, 2026, 4 active trading days are required per payout cycle.',
          source_section: 'Funded Accounts Rules',
          retrieved_at: '2026-08-25',
          effective_date: '2026-07-25',
          confidence: 'A',
          verification_status: 'VERIFIED'
        },
        {
          id: 'etm-gft-04',
          firm_id: 'goat-funded-trader',
          category: 'ACCOUNT',
          rule_key: 'single_profile_email_rule',
          name: 'Strict Single-Profile Registration Rule (No Multi-Email)',
          official_wording: 'Each trader is permitted exactly one client profile. Creating a new profile with a different email address instead of updating your existing profile will result in payout refusal without refund of challenge fees.',
          normalized_value: 'Strict 1 Profile per Individual',
          stage_scope: 'ALL',
          importance: 'CRITICAL',
          importance_reason: 'Several traders who purchased a second challenge under a new email had thousands of dollars in payouts denied and accounts terminated.',
          simple_explanation: 'Never sign up with a second email address. If your email changes, contact support to change it on your existing profile.',
          example: 'A trader who created a second account under a personal Gmail rather than work email passed the challenge and made $4,000 in profit. GFT denied payout and refused fee refund.',
          why_it_matters: 'Anti-fraud systems tie KYC and payments strictly to one master ID.',
          accidental_violation_risk: 'High for traders who use multiple personal email addresses.',
          visibility_score: 3,
          impact_score: 95,
          easy_to_miss_score: 285,
          is_easy_to_miss: true,
          easy_to_miss_reason: 'Outlined in the Terms & Conditions under Account Management, but traders routinely create secondary signups.',
          source_id: 'src-terms-profile',
          source_url: 'https://www.goatfundedtrader.com/terms-and-conditions',
          source_title: 'Terms and Conditions - Section 4: Account Registration',
          source_type: 'OFFICIAL_TERMS',
          source_quote: 'Customers must maintain a single profile. Duplicate registrations under separate email addresses are strictly prohibited.',
          source_section: 'Section 4.2',
          retrieved_at: '2026-08-30',
          effective_date: '2024-01-01',
          confidence: 'A',
          verification_status: 'VERIFIED'
        },
        {
          id: 'etm-gft-05',
          firm_id: 'goat-funded-trader',
          category: 'RISK',
          rule_key: 'consistency_33_rule',
          name: 'Consistency Rule on Instant & Funded Accounts (33% Top Day Cap)',
          official_wording: 'To ensure steady performance and mitigate all-or-nothing trading, no single trading day can generate more than 33% of your total net profit across the payout period.',
          normalized_value: 'Max 33% profit from single day',
          stage_scope: 'FUNDED',
          importance: 'HIGH',
          importance_reason: 'If one huge trade made $3,000 out of $4,000 total profit (75%), you cannot withdraw until you generate more consistent profit on subsequent days.',
          simple_explanation: 'Your best day of trading cannot account for more than one-third of the total profit you request for payout.',
          example: 'If your biggest day is $1,000, you need at least $3,030 total profit across all days before requesting a payout.',
          why_it_matters: 'Forces traders to demonstrate repeatability rather than gambling on a single high-risk announcement.',
          accidental_violation_risk: 'High for news traders or breakout traders who catch a single mega-trend.',
          visibility_score: 2,
          impact_score: 85,
          easy_to_miss_score: 170,
          is_easy_to_miss: true,
          easy_to_miss_reason: 'Documented in the FAQ under "What is the Consistency Rule?", but dynamic calculation confuses many users.',
          source_id: 'src-faq-consistency',
          source_url: 'https://help.goatfundedtrader.com/en/articles/what-is-the-consistency-rule',
          source_title: 'FAQ - Consistency Rule Explained',
          source_type: 'OFFICIAL_SUPPORT',
          source_quote: 'The calculation is based on the highest-profit trading day relative to the total profit for the relevant payout period.',
          source_section: 'Profit Consistency Guidelines',
          retrieved_at: '2026-08-29',
          effective_date: '2025-01-01',
          confidence: 'A',
          verification_status: 'VERIFIED',
          calculation_formula: '(Top_Day_Profit / Total_Profit) * 100 <= 33%'
        },
        {
          id: 'etm-gft-06',
          firm_id: 'goat-funded-trader',
          category: 'ACCOUNT',
          rule_key: 'inactivity_30_days',
          name: '30-Day Account Inactivity Expiration',
          official_wording: 'Trading accounts with no executed trades for 30 consecutive calendar days are automatically marked inactive and terminated without refund.',
          normalized_value: '30 Days Max Inactivity',
          stage_scope: 'ALL',
          importance: 'MEDIUM',
          importance_reason: 'Taking an extended vacation or taking a break from markets without placing a micro trade will delete the account.',
          simple_explanation: 'You must place at least one trade every 30 days to keep the account active.',
          example: 'A funded trader who goes on a 5-week holiday without placing a trade returns to find their account disabled.',
          why_it_matters: 'Server maintenance and risk tracking de-provisions dormant server accounts.',
          accidental_violation_risk: 'Moderate for swing traders with infrequent setups.',
          visibility_score: 2,
          impact_score: 75,
          easy_to_miss_score: 150,
          is_easy_to_miss: true,
          easy_to_miss_reason: 'Common across the industry, but often forgotten by funded traders taking breaks.',
          source_id: 'src-faq-inactivity',
          source_url: 'https://help.goatfundedtrader.com/en/articles/inactivity-period',
          source_title: 'Help Center - Account Expiration & Inactivity',
          source_type: 'OFFICIAL_SUPPORT',
          source_quote: 'Accounts must remain active with at least one transaction every 30 days.',
          source_section: 'Account Management',
          retrieved_at: '2026-08-25',
          effective_date: '2024-01-01',
          confidence: 'A',
          verification_status: 'VERIFIED'
        }
      ];
    }
    return [];
  }
}
