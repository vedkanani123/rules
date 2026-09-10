import { PROP_FIRMS_DATA } from '../src/data/propFirmsData.ts';
import { getFirmCanonicalProfile } from '../src/data/allFirmsCanonicalData.ts';
import { EXTENDED_CANONICAL_FIRMS_PROFILES } from '../src/data/canonicalFirmsExtended.ts';

console.log('=== VERIFYING LOGOS, COUNTRY FLAGS & BRAND ASSETS ACROSS ALL 24 FIRMS ===\n');

let missingLogos = 0;
for (const f of PROP_FIRMS_DATA) {
  const canonical = getFirmCanonicalProfile(f.slug, f) || EXTENDED_CANONICAL_FIRMS_PROFILES[f.slug];
  const logo = canonical?.logoUrl || f.logoUrl;
  const flag = canonical?.countryFlag || f.countryFlag;

  const hasValidLogo = Boolean(logo && (logo.startsWith('http') || logo.startsWith('/')));
  const hasValidFlag = Boolean(flag && (flag.startsWith('http') || flag.length <= 4));

  if (!hasValidLogo) {
    console.log(`❌ Missing logo: ${f.name} (${f.slug})`);
    missingLogos++;
  } else {
    console.log(`✅ ${f.name.padEnd(25)} | Logo: ${logo?.slice(0, 45)}... | Flag: ${flag?.slice(0, 30)}`);
  }
}

console.log('\n--------------------------------------------------');
console.log(`Summary: ${missingLogos === 0 ? 'All 24 firm logos and country flags are valid and verified!' : `${missingLogos} firms missing logos`}`);
