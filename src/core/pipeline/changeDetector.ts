// Snapshot Change Detection Engine
// Tracks historical modifications to prop firm rules between crawl snapshots.

import { Rule, RuleChange } from '../../types/schema.ts';

export function detectRuleChanges(
  firmId: string,
  firmName: string,
  previousRules: Rule[],
  currentRules: Rule[]
): RuleChange[] {
  const changes: RuleChange[] = [];
  const prevMap = new Map(previousRules.map((r) => [r.id, r]));
  const currMap = new Map(currentRules.map((r) => [r.id, r]));

  // Check for MODIFIED or REMOVED rules
  for (const [id, prev] of prevMap.entries()) {
    const curr = currMap.get(id);
    if (!curr) {
      changes.push({
        id: `change-removed-${id}-${Date.now()}`,
        firmId,
        firmName,
        ruleName: prev.name,
        oldValue: prev.headlineValue,
        newValue: 'REMOVED',
        effectiveDate: new Date().toISOString().split('T')[0],
        changeType: 'REMOVED',
        impactLevel: 'HIGH',
        whoIsAffected: 'All traders relying on previous term',
        plainEnglishSummary: `The rule "${prev.name}" was removed from official documentation.`,
        sourceUrl: prev.sources[0]?.sourceUrl || '',
        sourceTitle: prev.sources[0]?.sourceTitle || 'Official Terms',
      });
    } else if (prev.headlineValue !== curr.headlineValue || prev.normalizedValue !== curr.normalizedValue) {
      changes.push({
        id: `change-mod-${id}-${Date.now()}`,
        firmId,
        firmName,
        ruleName: curr.name,
        oldValue: prev.headlineValue,
        newValue: curr.headlineValue,
        effectiveDate: curr.effectiveFrom || new Date().toISOString().split('T')[0],
        changeType: 'MODIFIED',
        impactLevel: curr.importance === 'CRITICAL' || curr.importance === 'HIGH' ? 'HIGH' : 'MEDIUM',
        whoIsAffected: curr.stageScope === 'FUNDED' ? 'Funded account holders' : 'All account participants',
        plainEnglishSummary: `Changed from ${prev.headlineValue} to ${curr.headlineValue}.`,
        sourceUrl: curr.sources[0]?.sourceUrl || '',
        sourceTitle: curr.sources[0]?.sourceTitle || 'Official FAQ Update',
      });
    }
  }

  // Check for ADDED rules
  for (const [id, curr] of currMap.entries()) {
    if (!prevMap.has(id)) {
      changes.push({
        id: `change-added-${id}-${Date.now()}`,
        firmId,
        firmName,
        ruleName: curr.name,
        oldValue: 'None',
        newValue: curr.headlineValue,
        effectiveDate: curr.effectiveFrom || new Date().toISOString().split('T')[0],
        changeType: 'ADDED',
        impactLevel: curr.importance === 'CRITICAL' ? 'HIGH' : 'MEDIUM',
        whoIsAffected: 'New account purchasers',
        plainEnglishSummary: `New rule introduced: ${curr.name} set to ${curr.headlineValue}.`,
        sourceUrl: curr.sources[0]?.sourceUrl || '',
        sourceTitle: curr.sources[0]?.sourceTitle || 'Official Announcement',
      });
    }
  }

  return changes;
}
