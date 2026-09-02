import { SimulatorState, SimulatorEvaluation } from '../../src/types';

export class CalculationEngine {
  /**
   * Safe rounded calculation to 2 decimal places
   */
  static round2(val: number): number {
    return Math.round((val + Number.EPSILON) * 100) / 100;
  }

  /**
   * Calculates daily loss limit based on balance/equity rules
   * Formula: daily_limit = day_start_balance * (daily_loss_pct / 100)
   * Floor: floor = day_start_balance - daily_limit
   */
  static calculateDailyDrawdown(
    dayStartBalance: number,
    dailyLossPct: number,
    currentEquity: number
  ): {
    limitAmount: number;
    floor: number;
    currentLoss: number;
    remainingBuffer: number;
    status: 'SAFE' | 'WARNING' | 'BREACHED';
  } {
    const limitAmount = this.round2(dayStartBalance * (dailyLossPct / 100));
    const floor = this.round2(dayStartBalance - limitAmount);
    const currentLoss = this.round2(Math.max(0, dayStartBalance - currentEquity));
    const remainingBuffer = this.round2(currentEquity - floor);

    let status: 'SAFE' | 'WARNING' | 'BREACHED' = 'SAFE';
    if (currentEquity <= floor) {
      status = 'BREACHED';
    } else if (remainingBuffer <= limitAmount * 0.25) {
      status = 'WARNING';
    }

    return {
      limitAmount,
      floor,
      currentLoss,
      remainingBuffer,
      status
    };
  }

  /**
   * Calculates maximum overall drawdown
   * Formula: max_limit = initial_balance * (max_loss_pct / 100)
   * Floor = initial_balance - max_limit (static) or high_water_equity - max_limit (trailing)
   */
  static calculateMaxDrawdown(
    initialBalance: number,
    maxLossPct: number,
    currentEquity: number,
    drawdownType: 'Static' | 'Trailing' | 'EOD' = 'Static',
    highWaterEquity: number = initialBalance
  ): {
    limitAmount: number;
    floor: number;
    currentLossFromPeak: number;
    remainingBuffer: number;
    status: 'SAFE' | 'WARNING' | 'BREACHED';
  } {
    const limitAmount = this.round2(initialBalance * (maxLossPct / 100));
    let floor = this.round2(initialBalance - limitAmount);

    if (drawdownType === 'Trailing') {
      const peak = Math.max(initialBalance, highWaterEquity);
      floor = this.round2(peak - limitAmount);
    }

    const peakRef = drawdownType === 'Trailing' ? Math.max(initialBalance, highWaterEquity) : initialBalance;
    const currentLossFromPeak = this.round2(Math.max(0, peakRef - currentEquity));
    const remainingBuffer = this.round2(currentEquity - floor);

    let status: 'SAFE' | 'WARNING' | 'BREACHED' = 'SAFE';
    if (currentEquity <= floor) {
      status = 'BREACHED';
    } else if (remainingBuffer <= limitAmount * 0.25) {
      status = 'WARNING';
    }

    return {
      limitAmount,
      floor,
      currentLossFromPeak,
      remainingBuffer,
      status
    };
  }

  /**
   * 80% Margin Usage Rule (Crucial rule in GOAT FAQ):
   * "We define gambling-style trading as any trade where more than 80% of available margin is used in a trading idea."
   */
  static calculateMarginUsage(
    marginUsed: number,
    totalMarginAvailable: number,
    marginThresholdPct: number = 80
  ): {
    marginUsagePct: number;
    status: 'SAFE' | 'WARNING' | 'GAMBLING_FLAG_BREACH';
    remainingMarginBeforeBreach: number;
  } {
    if (totalMarginAvailable <= 0) {
      return { marginUsagePct: 0, status: 'SAFE', remainingMarginBeforeBreach: 0 };
    }

    const marginUsagePct = this.round2((marginUsed / totalMarginAvailable) * 100);
    const maxAllowedMargin = this.round2(totalMarginAvailable * (marginThresholdPct / 100));
    const remainingMarginBeforeBreach = this.round2(Math.max(0, maxAllowedMargin - marginUsed));

    let status: 'SAFE' | 'WARNING' | 'GAMBLING_FLAG_BREACH' = 'SAFE';
    if (marginUsagePct >= marginThresholdPct) {
      status = 'GAMBLING_FLAG_BREACH';
    } else if (marginUsagePct >= marginThresholdPct - 15) {
      status = 'WARNING';
    }

    return {
      marginUsagePct,
      status,
      remainingMarginBeforeBreach
    };
  }

  /**
   * Consistency Rule Calculation:
   * e.g. Single highest profit day cannot exceed X% of total profit (e.g. 33% or 40% depending on program)
   */
  static calculateConsistency(
    topSingleDayProfit: number,
    totalProfit: number,
    maxAllowedRatioPct: number = 33
  ): {
    consistencyPct: number;
    status: 'SAFE' | 'WARNING' | 'FAILED_THRESHOLD';
    additionalProfitNeededToComply: number;
  } {
    if (totalProfit <= 0 || topSingleDayProfit <= 0) {
      return {
        consistencyPct: 0,
        status: 'SAFE',
        additionalProfitNeededToComply: 0
      };
    }

    const consistencyPct = this.round2((topSingleDayProfit / totalProfit) * 100);

    // If ratio exceeds allowed %, trader needs more distributed profit to dilute the top day
    // Required total profit: totalProfitRequired = topSingleDayProfit / (maxAllowedRatioPct / 100)
    const requiredTotalProfit = this.round2(topSingleDayProfit / (maxAllowedRatioPct / 100));
    const additionalProfitNeededToComply = this.round2(Math.max(0, requiredTotalProfit - totalProfit));

    let status: 'SAFE' | 'WARNING' | 'FAILED_THRESHOLD' = 'SAFE';
    if (consistencyPct > maxAllowedRatioPct) {
      status = 'FAILED_THRESHOLD';
    } else if (consistencyPct > maxAllowedRatioPct - 5) {
      status = 'WARNING';
    }

    return {
      consistencyPct,
      status,
      additionalProfitNeededToComply
    };
  }

  /**
   * Evaluates complete simulator state against all rules
   */
  static evaluateSimulator(state: SimulatorState): SimulatorEvaluation {
    const dailyRes = this.calculateDailyDrawdown(
      state.day_start_balance,
      state.daily_drawdown_limit_pct,
      state.current_equity
    );

    const isTrailing = state.drawdown_calc_type === 'High-Water-Trailing';
    const maxRes = this.calculateMaxDrawdown(
      state.initial_balance,
      state.max_drawdown_limit_pct,
      state.current_equity,
      isTrailing ? 'Trailing' : 'Static',
      state.day_high_water_equity
    );

    const marginRes = this.calculateMarginUsage(
      state.margin_used,
      state.total_margin_available,
      80
    );

    const consistencyRes = this.calculateConsistency(
      state.top_single_day_profit,
      state.total_profit,
      state.consistency_threshold_pct || 33
    );

    const critical_warnings: string[] = [];
    const responsible_rules: string[] = [];

    if (dailyRes.status === 'BREACHED') {
      critical_warnings.push(`Daily drawdown breached! Current equity ($${state.current_equity.toLocaleString()}) dropped past daily floor ($${dailyRes.floor.toLocaleString()}).`);
      responsible_rules.push(`${state.daily_drawdown_limit_pct}% Daily Drawdown Limit`);
    } else if (dailyRes.status === 'WARNING') {
      critical_warnings.push(`Caution: Only $${dailyRes.remainingBuffer.toLocaleString()} remaining before hitting the daily loss floor.`);
    }

    if (maxRes.status === 'BREACHED') {
      critical_warnings.push(`Maximum drawdown breached! Current equity ($${state.current_equity.toLocaleString()}) dropped below overall loss floor ($${maxRes.floor.toLocaleString()}).`);
      responsible_rules.push(`${state.max_drawdown_limit_pct}% Maximum Overall Drawdown`);
    } else if (maxRes.status === 'WARNING') {
      critical_warnings.push(`Caution: Only $${maxRes.remainingBuffer.toLocaleString()} remaining before maximum drawdown limit.`);
    }

    if (marginRes.status === 'GAMBLING_FLAG_BREACH') {
      critical_warnings.push(`Margin rule violated! Margin usage is ${marginRes.marginUsagePct}%, which exceeds the 80% maximum allowed. Firm classifies this as gambling-style exposure and can deduct profits or reset account.`);
      responsible_rules.push('80% Maximum Margin Usage Rule (FAQ)');
    } else if (marginRes.status === 'WARNING') {
      critical_warnings.push(`Warning: High margin utilization (${marginRes.marginUsagePct}%). Keep combined open margin under 80% to avoid automatic profit deduction.`);
    }

    if (consistencyRes.status === 'FAILED_THRESHOLD') {
      critical_warnings.push(`Consistency rule failed: Top trading day represents ${consistencyRes.consistencyPct}% of total profit (max allowed: ${state.consistency_threshold_pct}%). You need $${consistencyRes.additionalProfitNeededToComply.toLocaleString()} more profit across other days to qualify for payout.`);
      responsible_rules.push('Funded Payout Consistency Rule');
    }

    let overall_verdict: SimulatorEvaluation['overall_verdict'] = 'ACCOUNT_HEALTHY';
    if (dailyRes.status === 'BREACHED' || maxRes.status === 'BREACHED' || marginRes.status === 'GAMBLING_FLAG_BREACH') {
      overall_verdict = 'ACCOUNT_BREACHED';
    } else if (dailyRes.status === 'WARNING' || maxRes.status === 'WARNING' || marginRes.status === 'WARNING' || consistencyRes.status === 'FAILED_THRESHOLD') {
      overall_verdict = 'APPROACHING_RISK_LIMIT';
    }

    return {
      daily_loss_status: dailyRes.status,
      daily_loss_amount: dailyRes.currentLoss,
      daily_loss_allowed: dailyRes.limitAmount,
      daily_loss_remaining: dailyRes.remainingBuffer,
      daily_loss_floor: dailyRes.floor,

      max_loss_status: maxRes.status,
      max_loss_amount: maxRes.currentLossFromPeak,
      max_loss_allowed: maxRes.limitAmount,
      max_loss_remaining: maxRes.remainingBuffer,
      max_loss_floor: maxRes.floor,

      margin_status: marginRes.status,
      margin_usage_pct: marginRes.marginUsagePct,
      margin_limit_pct: 80,

      consistency_status: consistencyRes.status,
      consistency_pct: consistencyRes.consistencyPct,
      consistency_max_allowed_pct: state.consistency_threshold_pct || 33,

      overall_verdict,
      critical_warnings,
      responsible_rules
    };
  }
}
