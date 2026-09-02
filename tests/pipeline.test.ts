import { describe, it, expect } from 'vitest';
import { calculateEasyToMissRisk, detectRuleConflicts } from '../src/core/pipeline/ruleExtractor.ts';

describe('Rule Pipeline & Conflict Engine', () => {
  it('identifies high easy-to-miss risk when visibility is low and impact is high', () => {
    // e.g. Inactivity lockout: visibilityScore = 3 (buried in terms), impactScore = 85
    const result = calculateEasyToMissRisk(3, 85);
    expect(result.score).toBe(255);
    expect(result.isEasyToMiss).toBe(true);
    expect(result.severity).toBe('CRITICAL');
  });

  it('detects conflict between promotional claim and support policy', () => {
    const conflicts = detectRuleConflicts([
      {
        topic: 'News Trading',
        rawText: 'News Trading Allowed across all accounts',
        sourceUrl: 'https://www.goatfundedtrader.com/',
        sourceTitle: 'Home',
        sourceType: 'OFFICIAL_PROMOTIONAL',
      },
      {
        topic: 'News Trading',
        rawText: 'Restricted 2-minute buffer execution on funded accounts',
        sourceUrl: 'https://help.goatfundedtrader.com/articles/news',
        sourceTitle: 'Help Center',
        sourceType: 'OFFICIAL_SUPPORT',
      },
    ]);

    expect(conflicts.length).toBeGreaterThan(0);
    expect(conflicts[0].id).toBe('conflict-news-trading');
    expect(conflicts[0].sourceA.sourceType).toBe('OFFICIAL_PROMOTIONAL');
    expect(conflicts[0].sourceB.sourceType).toBe('OFFICIAL_SUPPORT');
  });
});
