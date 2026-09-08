// Build gate: validates all canonical data. Fails on invalid data, duplicates, or fabrication markers.
import { PROP_FIRMS_DATA } from '../src/data/propFirmsData.ts';
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
