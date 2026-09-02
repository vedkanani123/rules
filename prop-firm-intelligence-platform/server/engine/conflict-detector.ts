import { RuleConflict, EvidenceClass } from '../../src/types';

export class ConflictDetector {
  /**
   * Scans rule statements and source evidence to find contradictions,
   * hidden qualifications, or discrepancies between marketing and terms.
   */
  static getKnownConflicts(firmId: string): RuleConflict[] {
    if (firmId === 'goat-funded-trader') {
      return [
        {
          id: 'conflict-gft-01',
          firm_id: 'goat-funded-trader',
          rule_name: 'Refundable Evaluation Fee Timing',
          category: 'COMMERCIAL / PAYOUT',
          headline: 'Promotional "1st Payout Refund" vs Standard Terms "4th Payout Refund"',
          description: 'Promotional campaigns (such as CANADA50 email and banner offers) advertise that the evaluation fee is refunded with the 1st payout, whereas standard Help Center FAQs state refunds occur only on the 4th payout.',
          source_a: {
            title: 'Promotional Campaign (CANADA50)',
            url: 'https://www.goatfundedtrader.com/promotions/canada50',
            evidence_class: 'OFFICIAL_PROMOTIONAL',
            quote: 'Your evaluation fee comes straight back with your first payout.',
            claim: 'Fee refunded on 1st payout'
          },
          source_b: {
            title: 'Help Center - When do I get my refundable fee?',
            url: 'https://help.goatfundedtrader.com/en/articles/refundable-fee-payout-cycle',
            evidence_class: 'OFFICIAL_SUPPORT',
            quote: 'Refundable evaluation fee is credited back alongside your 4th successful withdrawal request.',
            claim: 'Fee refunded on 4th payout'
          },
          what_this_means: 'If you purchase using a promo code promising a 1st-payout refund, retain screenshots of the purchase invoice and promotional email; support agents default to the 4th-payout rule unless explicitly escalated.',
          recommended_trader_action: 'Save all promotional material and confirmation emails before purchasing.',
          severity: 'HIGH',
          detected_at: '2026-08-25'
        },
        {
          id: 'conflict-gft-02',
          firm_id: 'goat-funded-trader',
          rule_name: '80% Margin Rule vs Headline Daily Drawdown',
          category: 'RISK / TRADING',
          headline: 'Headline 4-5% Daily Drawdown vs 80% Margin Usage "Gambling" Penalty',
          description: 'Landing pages advertise a 4% to 5% daily drawdown limit as the risk boundary. However, buried in the FAQ is an 80% margin exposure rule where using >80% margin across open positions is labeled "gambling" and leads to profit deductions even if drawdown was never reached.',
          source_a: {
            title: 'Main Model Comparison Table',
            url: 'https://www.goatfundedtrader.com/model',
            evidence_class: 'OFFICIAL',
            quote: 'Daily Drawdown: 4% (2-Step) / 3% (Instant) based on starting equity.',
            claim: 'Accounts are measured purely against the daily loss percentage.'
          },
          source_b: {
            title: 'FAQ - Risk Management & Prohibited Trading Behaviors',
            url: 'https://help.goatfundedtrader.com/en/articles/80-margin-usage-policy',
            evidence_class: 'OFFICIAL_SUPPORT',
            quote: 'We define gambling-style trading as any trade where more than 80% of available margin is used in a trading idea. Such exposure results in profit deductions or account resets.',
            claim: 'Margin exceeding 80% breaches trading conduct even with positive balance.'
          },
          what_this_means: 'Traders with multiple open positions or high lot sizes can have their profits wiped or account reset even when well within the daily drawdown limit.',
          recommended_trader_action: 'Always calculate total margin requirements across open trades and never exceed 60-70% total margin.',
          severity: 'CRITICAL',
          detected_at: '2026-08-20'
        },
        {
          id: 'conflict-gft-03',
          firm_id: 'goat-funded-trader',
          rule_name: 'Independent Manual Trading vs Coordinated Trading Classification',
          category: 'COMPLIANCE / RISK',
          headline: 'Permitted Manual Retail Trading vs Automated Risk Linking on Popular Pairs',
          description: 'The firm permits manual trading and retail execution. However, multiple traders report payout denials where manual trades executed within 1-5 minutes of other users on popular pairs (e.g. XAUUSD) were automatically flagged as "coordinated/copy group trading".',
          source_a: {
            title: 'Trading Rules - Copy Trading & Manual Trading',
            url: 'https://www.goatfundedtrader.com/rules',
            evidence_class: 'OFFICIAL',
            quote: 'Manual trading with your own original strategies is fully permitted. You may trade any session and any valid instrument.',
            claim: 'Manual independent strategies are permitted.'
          },
          source_b: {
            title: 'Risk Department Review Responses & Trustpilot Disclosures',
            url: 'https://www.trustpilot.com/review/goatfundedtrader.com',
            evidence_class: 'FIRM_RESPONSE',
            quote: 'The Risk Team considers overall patterns and timing comparisons. Manual execution or personal devices does not, by itself, rule out coordinated trading when entry/exit clusters match.',
            claim: 'Similar entry/exit times across different users trigger coordinated trading denials.'
          },
          what_this_means: 'Trading standard breakout or news setups on highly liquid pairs like XAUUSD during major sessions risks overlapping with other traders, potentially triggering algorithmic copy-trade flags.',
          recommended_trader_action: 'Avoid generic signal-provider entries or popular discord copy setups; keep detailed trading journals with screenshots of your chart analysis.',
          severity: 'CRITICAL',
          detected_at: '2026-08-30'
        },
        {
          id: 'conflict-gft-04',
          firm_id: 'goat-funded-trader',
          rule_name: '5K Instant Account Risk Limit vs Headline Drawdown',
          category: 'ACCOUNT RULES',
          headline: 'Advertised $150 Daily Limit vs Real $50 Loss Breach Threshold',
          description: 'Traders report purchasing $5K Instant accounts expecting the standard advertised 3% ($150) daily limit, but experiencing account breaches at $50 loss due to account-specific per-trade risk constraints.',
          source_a: {
            title: 'Instant Model Specifications',
            url: 'https://www.goatfundedtrader.com/model/instant',
            evidence_class: 'OFFICIAL',
            quote: '$5,000 Instant Account: Max Daily Loss 3% ($150), Max Overall Loss 6% ($300).',
            claim: 'Daily loss limit is $150.'
          },
          source_b: {
            title: 'Official Firm Reply to Trader Dispute',
            url: 'https://www.trustpilot.com/reviews/gft-instant-5k',
            evidence_class: 'FIRM_RESPONSE',
            quote: 'The applicable risk limits depend on the specific account type. A daily drawdown limit is not necessarily the only risk requirement that can apply to an Instant account.',
            claim: 'Additional risk thresholds exist beyond the headline daily drawdown percentage.'
          },
          what_this_means: 'Instant accounts have tighter sub-limits that may not be displayed on the high-level comparison matrix.',
          recommended_trader_action: 'Check the specific knowledgebase article for your exact account tier before sizing positions.',
          severity: 'HIGH',
          detected_at: '2026-08-31'
        }
      ];
    }
    return [];
  }
}
