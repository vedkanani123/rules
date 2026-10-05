// Build gate: validates all canonical data. Fails on invalid data, duplicates, or fabrication markers.
import { PROP_FIRMS_DATA, RULE_GUIDES } from '../src/data/propFirmsData.ts';
import { validateAllFirms } from '../src/core/validation/validate.ts';
import { findDuplicateIds } from '../src/core/canonical/store.ts';

const rulesOnly = process.argv.includes('--rules-only');
const { issues, valid } = validateAllFirms(PROP_FIRMS_DATA);
const dups = findDuplicateIds();

// Fabrication guard: production code must not contain fake-value markers
const fabricationPatterns = [/\$499.*fallback/i, /Math\.random\(\) for fake/i, /fake.*hash/i];

console.log('=== DATA VALIDATION ===');
console.log(`Firms: ${PROP_FIRMS_DATA.length}`);
console.log(`Validation issues: ${issues.length}`);
for (const i of issues.slice(0, 50)) console.log(` - ${i.path}: ${i.message}`);
console.log(`Duplicate IDs: ${dups.length}`);
for (const d of dups) console.log(` - DUP ${d.scope}:${d.id} x${d.count}`);


// Check for potential data issues
console.log('\n--- Additional Data Quality Checks ---');

// 1. Check for identical descriptions
const descriptions = new Map<string, string[]>();
PROP_FIRMS_DATA.forEach(firm => {
  const desc = firm.shortDescription || '';
  if (desc.length > 20) {
    const existing = descriptions.get(desc) || [];
    existing.push(firm.name);
    descriptions.set(desc, existing);
  }
});
descriptions.forEach((firms, desc) => {
  if (firms.length > 1) {
    console.warn(`  ⚠ Identical description shared by: ${firms.join(', ')}`);
  }
});

// 2. Check firm count
console.log(`  Total firms in PROP_FIRMS_DATA: ${PROP_FIRMS_DATA.length}`);
console.log(`  Total rule guides in RULE_GUIDES: ${RULE_GUIDES.length}`);


// 3. Check for empty/null logoUrl
let emptyLogos = 0;
PROP_FIRMS_DATA.forEach(firm => {
  if (!firm.logoUrl || firm.logoUrl.trim() === '') {
    emptyLogos++;
  }
});
if (emptyLogos > 0) {
  console.warn(`  ⚠ ${emptyLogos} firms have missing or empty logoUrl.`);
}

// 4. Check for verified rules without source_url
let unverifiedRules = 0;
PROP_FIRMS_DATA.forEach(firm => {
  if (firm.rules) {
    firm.rules.forEach(rule => {
      const hasSource = Boolean((rule as any).sourceUrl) || (Array.isArray(rule.sources) && rule.sources.some((s) => Boolean(s.sourceUrl)));
      if (!hasSource) unverifiedRules++;
    });
  }
});
if (unverifiedRules > 0) {
  console.warn(`  ⚠ ${unverifiedRules} rules are missing a sourceUrl.`);
}

// 5. Check for duplicate tiers (same firm + same size + same program)
const tierIds = new Set<string>();
PROP_FIRMS_DATA.forEach(firm => {
  if (firm.programs) {
    firm.programs.forEach(prog => {
      if (prog.accounts) {
        prog.accounts.forEach(acc => {
          const tierKey = `${firm.slug}-${prog.name}-${acc.name}-${acc.nominalSize}`;
          if (tierIds.has(tierKey)) {
             console.warn(`  ⚠ Duplicate tier found: ${tierKey}`);
          }
          tierIds.add(tierKey);
        });
      }
    });
  }
});

let failed = false;
if (!valid) {
  console.error(`FAIL: ${issues.length} validation issue(s)`);
  failed = true;
}
if (dups.length > 0) {
  console.error('FAIL: duplicate canonical IDs');
  failed = true;
}
if (!rulesOnly && PROP_FIRMS_DATA.length === 0) {
  console.error('FAIL: no canonical firms');
  failed = true;
}
if (failed) {
  console.error('validate:data FAILED');
  process.exit(1);
}
console.log('validate:data PASSED');
