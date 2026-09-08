import { RuleVersionChange } from '../../src/types';

export class ChangeDetector {
  /**
   * Returns verified historical rule changes for the firm
   */
  static getKnownRuleChanges(firmId: string): RuleVersionChange[] {
    if (firmId === 'goat-funded-trader') {
      return [
        {
          id: 'change-gft-01',
          firm_id: 'goat-funded-trader',
          rule_name: 'Funded Stage Minimum Trading Days per Payout',
          category: 'PAYOUT / TRADING',
          old_value: '3 active trading days',
          new_value: '4 active trading days',
          effective_date: '2026-07-25',
          source_url: 'https://help.goatfundedtrader.com/en/articles/minimum-trading-days-funded',
          source_title: 'Help Center - Minimum Trading Days Requirement',
          change_type: 'MODIFIED',
          impact: 'HIGH',
          who_is_affected: 'All funded traders on accounts purchased on or after July 25, 2026.',
          explanation: 'The firm increased the mandatory trading days required before submitting each payout request from 3 to 4 distinct calendar days.',
          diff_summary: '3 Days → 4 Days (+1 trading day required)'
        },
        {
          id: 'change-gft-02',
          firm_id: 'goat-funded-trader',
          rule_name: 'Challenge Time Limits (2-Step & 1-Step)',
          category: 'EVALUATION',
          old_value: 'Phase 1: 30 days / Phase 2: 60 days',
          new_value: 'No Time Limit (Unlimited Days)',
          effective_date: '2025-03-10',
          source_url: 'https://www.goatfundedtrader.com/model',
          source_title: 'Official Model Guidelines',
          change_type: 'MODIFIED',
          impact: 'MEDIUM',
          who_is_affected: 'All evaluation challenge traders.',
          explanation: 'Removed the calendar day deadline to reach profit targets. Traders can take as long as necessary provided the 30-day inactivity rule is respected.',
          diff_summary: '30/60 Days Max → Unlimited Time'
        },
        {
          id: 'change-gft-03',
          firm_id: 'goat-funded-trader',
          rule_name: 'Profit Split Scaling Tier',
          category: 'COMMERCIAL / REWARD',
          old_value: '80% standard / 90% scaled',
          new_value: 'Up to 95% with scaling plan',
          effective_date: '2025-08-01',
          source_url: 'https://www.goatfundedtrader.com/rewards',
          source_title: 'GFT Rewards & Scaling Plan',
          change_type: 'MODIFIED',
          impact: 'MEDIUM',
          who_is_affected: 'Consistent funded traders meeting scaling milestones.',
          explanation: 'Introduced an upgraded tier allowing profit share up to 95% after consecutive profitable payout cycles.',
          diff_summary: '90% Max → 95% Max Split'
        },
        {
          id: 'change-gft-04',
          firm_id: 'goat-funded-trader',
          rule_name: 'Weekly Live Stream Competition Rules',
          category: 'COMMUNITY / COMPETITION',
          old_value: 'Direct prize allocation',
          new_value: 'Mandatory verification & eligibility review before prize distribution',
          effective_date: '2026-08-15',
          source_url: 'https://www.goatfundedtrader.com/competitions',
          source_title: 'Live Stream Competition Terms',
          change_type: 'MODIFIED',
          impact: 'LOW',
          who_is_affected: 'Participants in weekly trading competitions.',
          explanation: 'Added account verification requirements before competition challenge prizes are released.',
          diff_summary: 'Added eligibility review step'
        }
      ];
    }
    return [];
  }
}
