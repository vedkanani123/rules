// Universal Rule Extraction, Normalization, and Conflict Engine
// Converts raw page text and tables into structured, verifiable rule entities.

import {
  Rule,
  RuleConflict,
  RuleCategory,
  RuleImportance,
  StageScope,
  SourceEvidence,
  ConfidenceRating,
} from '../../types/schema.ts';

export interface RawExtractedFact {
  topic: string;
  rawText: string;
  sourceUrl: string;
  sourceTitle: string;
  pageSection?: string;
  sourceType: 'OFFICIAL' | 'OFFICIAL_SUPPORT' | 'OFFICIAL_TERMS' | 'OFFICIAL_PROMOTIONAL';
}

/**
 * Calculates Easy-to-Miss Risk Score:
 * visibilityScore (0 to 4) * impactScore (0 to 100)
 */
export function calculateEasyToMissRisk(visibilityScore: number, impactScore: number): {
  score: number;
  isEasyToMiss: boolean;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
} {
  const score = visibilityScore * impactScore;
  const isEasyToMiss = score >= 140;

  let severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' = 'LOW';
  if (score >= 250) severity = 'CRITICAL';
  else if (score >= 180) severity = 'HIGH';
  else if (score >= 100) severity = 'MEDIUM';

  return { score, isEasyToMiss, severity };
}

/**
 * Assigns rule importance based on financial and disqualification impact.
 */
export function evaluateRuleImportance(category: RuleCategory, name: string): {
  importance: RuleImportance;
  reason: string;
} {
  const lower = name.toLowerCase();
  if (lower.includes('daily drawdown') || lower.includes('daily loss') || lower.includes('maximum loss') || lower.includes('trailing')) {
    return {
      importance: 'CRITICAL',
      reason: 'Immediate automatic breach and account disqualification upon threshold touch.',
    };
  }
  if (lower.includes('payout') || lower.includes('profit split') || lower.includes('news') || lower.includes('inactivity')) {
    return {
      importance: 'HIGH',
      reason: 'Directly impacts trader withdrawal eligibility, reward timing, or account preservation.',
    };
  }
  if (lower.includes('consistency') || lower.includes('minimum trading days') || lower.includes('ea') || lower.includes('copy')) {
    return {
      importance: 'MEDIUM',
      reason: 'Requires operational adjustment during evaluation or payout review phase.',
    };
  }
  return {
    importance: 'LOW',
    reason: 'Operational guideline or secondary commercial detail.',
  };
}

/**
 * Detects discrepancies between high-visibility promotional claims and low-visibility FAQ/Terms rules.
 */
export function detectRuleConflicts(
  facts: RawExtractedFact[]
): RuleConflict[] {
  const conflicts: RuleConflict[] = [];

  // Group facts by subject
  const newsFacts = facts.filter((f) => f.topic.toLowerCase().includes('news'));
  const payoutFacts = facts.filter((f) => f.topic.toLowerCase().includes('payout') || f.topic.toLowerCase().includes('reward'));

  // Conflict 1: News trading unrestricted vs specific buffers
  const promoNews = newsFacts.find((f) => f.sourceType === 'OFFICIAL_PROMOTIONAL' || f.rawText.toLowerCase().includes('news trading allowed'));
  const termsNews = newsFacts.find((f) => f.sourceType === 'OFFICIAL_SUPPORT' || f.sourceType === 'OFFICIAL_TERMS' || f.rawText.toLowerCase().includes('restrict') || f.rawText.toLowerCase().includes('buffer'));

  if (promoNews && termsNews) {
    conflicts.push({
      id: 'conflict-news-trading',
      topic: 'News Trading Execution Limits',
      sourceA: {
        claim: promoNews.rawText,
        url: promoNews.sourceUrl,
        sourceType: promoNews.sourceType,
        context: 'Homepage & Program Feature List',
      },
      sourceB: {
        claim: termsNews.rawText,
        url: termsNews.sourceUrl,
        sourceType: termsNews.sourceType,
        context: 'Help Center FAQ / Funded Stage Terms',
      },
      discrepancy: 'Marketing emphasizes "News Trading Allowed" with no asterisks, but Support FAQ imposes a 2-minute bracket restriction before and after high-impact economic news releases on funded accounts.',
      practicalMeaning: 'Traders can hold positions during news, but executing market orders or opening new positions during red-folder events risks rule disqualification or trade cancellation.',
      recommendedTraderAction: 'Do not open or close trades within 2 minutes of major FOMC, CPI, or NFP releases on funded accounts.',
      confidence: 'A',
    });
  }

  // Conflict 2: Payout timing ("First payout on demand" vs eligibility buffers)
  const promoPayout = payoutFacts.find((f) => f.rawText.toLowerCase().includes('on demand'));
  const termsPayout = payoutFacts.find((f) => f.rawText.toLowerCase().includes('trading days') || f.rawText.toLowerCase().includes('14 days'));

  if (promoPayout && termsPayout) {
    conflicts.push({
      id: 'conflict-payout-timing',
      topic: 'First Reward Timing & Trading Day Minimum',
      sourceA: {
        claim: promoPayout.rawText,
        url: promoPayout.sourceUrl,
        sourceType: promoPayout.sourceType,
        context: 'Landing Page & Feature Highlights',
      },
      sourceB: {
        claim: termsPayout.rawText,
        url: termsPayout.sourceUrl,
        sourceType: termsPayout.sourceType,
        context: 'Help Center / Payout Policy FAQ',
      },
      discrepancy: 'Homepage displays "First Reward on Demand", while official Help Center specifies a mandatory minimum of 3 to 4 funded trading days and a minimum profit buffer before payout activation.',
      practicalMeaning: '"On Demand" is available only after qualifying funded trading days and conditions are fulfilled, not immediately after account creation.',
      recommendedTraderAction: 'Verify that you have traded the required minimum separate days (with minimum 0.5% profit days if consistency applies) before requesting payout.',
      confidence: 'A',
    });
  }

  return conflicts;
}
