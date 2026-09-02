import { StrategyProfile, StrategyMatchResult, PropAccountModel } from '../../src/types';

export const SUPPORTED_STRATEGIES: StrategyProfile[] = [
  {
    id: 'SCALPER',
    name: 'Scalper',
    description: 'Executes rapid, short-duration trades capturing quick tick/pip moves.',
    icon: 'Zap',
    key_needs: ['Tight spreads on major pairs', 'Fast execution', 'No minimum trade duration rule', 'Flexible margin'],
    key_risks: ['80% Margin usage rule', 'Slippage during news', 'HFT / Tick-scalping restrictions']
  },
  {
    id: 'SWING_TRADER',
    name: 'Swing Trader',
    description: 'Holds positions over multiple days or weeks targeting broader macro trends.',
    icon: 'TrendingUp',
    key_needs: ['Overnight holding allowed', 'Weekend holding allowed', 'Unlimited evaluation time', 'Static drawdown'],
    key_risks: ['30-day inactivity expiration', 'Swap fees', 'Weekend gap slippage']
  },
  {
    id: 'NEWS_TRADER',
    name: 'News Trader',
    description: 'Trades high-impact economic releases (CPI, NFP, FOMC interest rates).',
    icon: 'Radio',
    key_needs: ['No news trading time restrictions', 'Fast execution', 'High slippage tolerance'],
    key_risks: ['Coordinated trading flag if entering alongside cluster', 'Spike slippage', 'Consistency rule cap']
  },
  {
    id: 'GOLD_TRADER',
    name: 'Gold (XAUUSD) Trader',
    description: 'Specializes in Gold and precious metals volatility.',
    icon: 'Coins',
    key_needs: ['Tight XAUUSD spreads', 'High commodity leverage', 'No sudden margin increases'],
    key_risks: ['Coordinated trading algorithm flags on Gold', '80% margin exposure on heavy lot sizing']
  },
  {
    id: 'CRYPTO_TRADER',
    name: 'Crypto Trader',
    description: 'Trades BTC, ETH and major altcoins during market hours and weekends.',
    icon: 'Bitcoin',
    key_needs: ['24/7 weekend crypto market availability', 'Reliable crypto spreads', 'Dedicated crypto platform'],
    key_risks: ['Wider crypto spreads during volatile sessions', 'Weekend liquidity drops']
  },
  {
    id: 'EA_TRADER',
    name: 'EA / Bot Trader',
    description: 'Uses MetaTrader Expert Advisors and automated rule-based bots.',
    icon: 'Bot',
    key_needs: ['EAs explicitly permitted', 'VPS allowed', 'No tick-scalping bans'],
    key_risks: ['Shared commercial EA flags (copy trading breach)', 'Latency arbitrage ban', 'Martingale/Grid limits']
  }
];

export class StrategyEngine {
  /**
   * Evaluates how an account matches a user's selected strategy profiles
   */
  static evaluateCompatibility(
    strategyId: string,
    account: PropAccountModel,
    programName: string
  ): StrategyMatchResult {
    let matchScore = 80;
    const pros: string[] = [];
    const cons: string[] = [];
    const rule_warnings: string[] = [];

    switch (strategyId) {
      case 'SCALPER':
        if (account.ea_allowed) {
          pros.push('Expert Advisors and rapid execution supported.');
          matchScore += 5;
        }
        pros.push('No arbitrary minimum trade duration (seconds) rule.');
        cons.push('80% Max Margin rule strictly caps heavy lot-stacking.');
        rule_warnings.push('Caution: Opening multiple split orders quickly can trigger the 80% margin exposure limit.');
        matchScore -= 5;
        break;

      case 'SWING_TRADER':
        if (account.weekend_holding.toLowerCase().includes('allowed') || account.weekend_holding.toLowerCase().includes('yes')) {
          pros.push('Weekend holding permitted without mandatory Friday close.');
          matchScore += 15;
        } else {
          cons.push('Weekend holding restricted or requires add-on.');
          matchScore -= 20;
        }
        pros.push('No maximum time limit to pass challenge (trade at your own pace).');
        rule_warnings.push('Must place at least one trade every 30 days to prevent inactivity account expiration.');
        break;

      case 'NEWS_TRADER':
        if (account.news_trading.toLowerCase().includes('allowed') || account.news_trading.toLowerCase().includes('yes')) {
          pros.push('News trading explicitly permitted during high-impact red-folder releases.');
          matchScore += 10;
        } else {
          cons.push('News bracket restrictions apply.');
          matchScore -= 25;
        }
        rule_warnings.push('Risk Warning: Entering simultaneously with public signals on XAUUSD/EURUSD during news has resulted in coordinated-trading algorithmic flags.');
        cons.push('33% Consistency rule means a massive news win cannot exceed 33% of total payout profit.');
        matchScore -= 10;
        break;

      case 'GOLD_TRADER':
        pros.push('XAUUSD available on MetaTrader 5 with standard leverage.');
        cons.push('Multiple traders report coordinated-trading disputes on Gold trades matching industry entry clusters.');
        rule_warnings.push('Keep detailed screenshots of your original chart analysis to dispute automated copy-trading false flags on Gold.');
        rule_warnings.push('Watch Gold lot sizing so margin never exceeds 80% of total available margin.');
        matchScore -= 10;
        break;

      case 'CRYPTO_TRADER':
        pros.push('Crypto assets available including BTCUSD and ETHUSD.');
        cons.push('Spreads on crypto pairs (BTC/ETH) are wider than dedicated crypto-native platforms.');
        rule_warnings.push('Verify weekend server maintenance windows before leaving crypto trades open over Sunday rollover.');
        matchScore -= 5;
        break;

      case 'EA_TRADER':
        if (account.ea_allowed) {
          pros.push('EAs and custom algorithms fully allowed.');
          matchScore += 15;
        } else {
          cons.push('EAs forbidden.');
          matchScore -= 40;
        }
        rule_warnings.push('Publicly purchased off-the-shelf commercial EAs will trigger copy-trading breach if used by multiple traders.');
        rule_warnings.push('Latency arbitrage, high-frequency tick spamming, and reverse hedging algorithms are prohibited.');
        break;

      default:
        pros.push('Flexible general conditions.');
        break;
    }

    matchScore = Math.min(98, Math.max(20, matchScore));

    let verdict: StrategyMatchResult['verdict'] = 'GOOD';
    if (matchScore >= 88) verdict = 'EXCELLENT';
    else if (matchScore >= 70) verdict = 'GOOD';
    else if (matchScore >= 50) verdict = 'COMPATIBLE_WITH_CAUTION';
    else verdict = 'NOT_RECOMMENDED';

    return {
      program_id: account.program_id,
      account_id: account.id,
      program_name: programName,
      account_name: account.name,
      match_percentage: matchScore,
      verdict,
      pros,
      cons,
      rule_warnings
    };
  }
}
