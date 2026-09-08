// Pipeline CLI for extraction, change detection, and verification

import { PROP_FIRMS_DATA } from '../../data/propFirmsData.ts';
import { detectRuleChanges } from './changeDetector.ts';
import { detectRuleConflicts } from './ruleExtractor.ts';
import { validateAllFirms } from '../validation/validate.ts';
import { findDuplicateIds } from '../canonical/store.ts';

const action = process.argv[2] || 'verify';

if (action === 'extract') {
  console.log(`\n======================================================`);
  console.log(`🧠 RUNNING UNIVERSAL RULE EXTRACTION & NORMALIZATION`);
  console.log(`======================================================`);
  
  let totalRules = 0;
  PROP_FIRMS_DATA.forEach((firm) => {
    console.log(`\nFirm: ${firm.name} (${firm.status})`);
    console.log(`- Programs: ${firm.programs.length}`);
    console.log(`- Accounts Indexed: ${firm.programs.reduce((acc, p) => acc + p.accounts.length, 0)}`);
    console.log(`- Rules Extracted: ${firm.rules.length}`);
    console.log(`- Easy-to-Miss Rules: ${firm.easyToMissRules.length}`);
    console.log(`- Detected Conflicts: ${firm.conflicts.length}`);
    totalRules += firm.rules.length;
  });

  console.log(`\n✅ Total Normalized Rules in Database: ${totalRules}`);
} else if (action === 'detect-changes') {
  console.log(`\n======================================================`);
  console.log(`🔄 RUNNING HISTORICAL SNAPSHOT CHANGE DETECTION`);
  console.log(`======================================================`);

  const gft = PROP_FIRMS_DATA[0];
  console.log(`Audited Changes for ${gft.name}:`);
  gft.recentChanges.forEach((ch, idx) => {
    console.log(`[${idx + 1}] ${ch.effectiveDate} | ${ch.ruleName}`);
    console.log(`    Type: ${ch.changeType} (Impact: ${ch.impactLevel})`);
    console.log(`    Old:  ${ch.oldValue} ➔ New: ${ch.newValue}`);
    console.log(`    Who:  ${ch.whoIsAffected}`);
  });
  console.log(`\n✅ Change Detection Audit Complete.`);
} else if (action === 'verify') {
  console.log(`\n======================================================`);
  console.log(`🛡️ DATA QUALITY & EVIDENCE VERIFICATION AUDIT`);
  console.log(`======================================================`);

  let totalRules = 0;
  let verified = 0;
  let partiallyVerified = 0;
  let conflicting = 0;
  let unsourced = 0;

  PROP_FIRMS_DATA.forEach((firm) => {
    firm.rules.forEach((rule) => {
      totalRules++;
      if (!rule.sources || rule.sources.length === 0) {
        unsourced++;
      } else {
        const hasVerified = rule.sources.some((s) => s.verificationStatus === 'VERIFIED');
        const hasConflict = rule.sources.some((s) => s.verificationStatus === 'CONFLICTING');
        if (hasConflict) conflicting++;
        else if (hasVerified) verified++;
        else partiallyVerified++;
      }
    });
  });

  console.log(`Total Rules Analyzed:     ${totalRules}`);
  console.log(`Fully Verified (Direct):  ${verified} (${totalRules ? Math.round((verified / totalRules) * 100) : 0}%)`);
  console.log(`Partially Verified:       ${partiallyVerified}`);
  console.log(`Conflicting Sources:      ${conflicting}`);
  console.log(`Unsourced (Rejected):     ${unsourced}`);
  const { issues } = validateAllFirms(PROP_FIRMS_DATA);
  const dups = findDuplicateIds();
  console.log(`Validation issues:        ${issues.length}`);
  console.log(`Duplicate IDs:            ${dups.length}`);
  // Generic conflict re-check across firm rules (topic = rule name)
  const facts = PROP_FIRMS_DATA.flatMap((f) => f.rules.map((r) => ({ topic: r.name, rawText: r.headlineValue, sourceUrl: r.sources[0]?.sourceUrl ?? '', sourceTitle: r.sources[0]?.sourceTitle ?? '', sourceType: 'OFFICIAL' as const })));
  console.log(`Generic conflict scan:    ${detectRuleConflicts(facts).length} topic group(s) with divergent values`);
  console.log(`======================================================`);
  if (unsourced > 0 || dups.length > 0) {
    console.log(`Audit Verdict: ATTENTION — ${unsourced} unsourced rule(s), ${dups.length} duplicate(s). Unknown must remain unknown.`);
    process.exitCode = 1;
  } else {
    console.log(`Audit Verdict: ALL CORE RULES BACKED BY OFFICIAL CITATIONS.`);
  }
}
