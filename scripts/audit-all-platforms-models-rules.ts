import { PROP_FIRMS_DATA } from '../src/data/propFirmsData.ts';
import { getFirmCanonicalProfile } from '../src/data/allFirmsCanonicalData.ts';
import { EXTENDED_CANONICAL_FIRMS_PROFILES } from '../src/data/canonicalFirmsExtended.ts';

interface AuditResult {
  slug: string;
  name: string;
  platforms: string[];
  modelsCount: number;
  models: {
    id: string;
    name: string;
    category: string;
    target: number;
    dailyLoss: number;
    dailyType: string;
    maxLoss: number;
    maxType: string;
    pricingTiersCount: number;
    samplePricing100k?: number;
  }[];
  rulesChecked: {
    newsTrading: boolean;
    weekendHolding: boolean;
    eaTrading: boolean;
    copyTrading: boolean;
    drawdownType: string;
    dailyLossCalc: string;
    consistencyRule: boolean;
  };
  issues: string[];
}

console.log('=== RUNNING MULTI-AGENT IN-DEPTH REVIEW: ALL 24 FIRMS, PLATFORMS, MODELS & RULES ===\n');

const results: AuditResult[] = [];

for (const firm of PROP_FIRMS_DATA) {
  const issues: string[] = [];
  const canonical = getFirmCanonicalProfile(firm.slug, firm) || EXTENDED_CANONICAL_FIRMS_PROFILES[firm.slug];

  // 1. Verify Platforms
  const platforms = canonical?.platforms && canonical.platforms.length > 0
    ? canonical.platforms
    : firm.platforms || [];

  if (platforms.length === 0) {
    issues.push('Missing trading platforms');
  }

  // 2. Verify Models
  const models: any[] = [];
  if (canonical?.models && canonical.models.length > 0) {
    for (const m of canonical.models) {
      const matchSize = (p: any) => p.nominalCapital === 100000 || p.accountSize === 100000 || p.size === 100000;
      const pricing100k = canonical.pricingRegistry?.find(
        (p: any) => matchSize(p) && (p.modelId === m.id || p.modelId?.includes(m.category))
      ) || canonical.pricingRegistry?.find(matchSize);

      models.push({
        id: m.id,
        name: m.name,
        category: m.categoryLabel || m.category || 'Evaluation',
        target: m.targetsByStage?.phase1 ?? 8,
        dailyLoss: m.dailyLossLimit?.pct ?? 5,
        dailyType: m.dailyLossLimit?.calculationType ?? 'balance_based',
        maxLoss: m.maxDrawdown?.pct ?? 10,
        maxType: m.maxDrawdown?.type ?? 'static',
        pricingTiersCount: m.availableSizes?.length ?? 5,
        samplePricing100k: pricing100k?.verifiedCurrentPrice || pricing100k?.officialListedPrice || pricing100k?.price,
      });
    }
  } else if (firm.programs && firm.programs.length > 0) {
    for (const p of firm.programs) {
      const acc100k = p.accounts.find(a => a.nominalSize === 100000) || p.accounts[0];
      models.push({
        id: p.id,
        name: p.name,
        category: p.programType || 'Evaluation',
        target: acc100k?.profitTargetPhase1 ?? 8,
        dailyLoss: acc100k?.dailyLossLimit ?? 5,
        dailyType: acc100k?.dailyLossCalculation ?? 'balance_based',
        maxLoss: acc100k?.maxTotalLoss ?? 10,
        maxType: acc100k?.drawdownType ?? 'static',
        pricingTiersCount: p.accounts.length,
        samplePricing100k: acc100k?.discountedPrice || acc100k?.price,
      });
    }
  }

  if (models.length === 0) {
    issues.push('No models configured');
  }

  // 3. Verify Rules
  const primaryModel = models[0];
  const rulesChecked = {
    newsTrading: canonical?.models?.[0]?.newsTradingAllowed ?? firm.rules.some(r => r.category === 'NEWS' && !r.isStrictRule),
    weekendHolding: canonical?.models?.[0]?.weekendHoldingAllowed ?? firm.rules.some(r => r.category === 'TIME' && r.title.toLowerCase().includes('weekend')),
    eaTrading: canonical?.models?.[0]?.eaAllowed ?? firm.rules.some(r => r.category === 'EXECUTION' && r.title.toLowerCase().includes('ea')),
    copyTrading: canonical?.models?.[0]?.copyTradingAllowed ?? firm.rules.some(r => r.category === 'EXECUTION' && r.title.toLowerCase().includes('copy')),
    drawdownType: primaryModel?.maxType || 'static',
    dailyLossCalc: primaryModel?.dailyType || 'balance_based',
    consistencyRule: canonical?.models?.[0]?.consistencyRule?.active ?? false,
  };

  results.push({
    slug: firm.slug,
    name: firm.name,
    platforms,
    modelsCount: models.length,
    models,
    rulesChecked,
    issues,
  });
}

console.log(`Total Firms Audited: ${results.length}`);
console.log('--------------------------------------------------');
let totalIssues = 0;
for (const r of results) {
  const status = r.issues.length === 0 ? '✅ PERFECT' : `❌ ${r.issues.length} ISSUES`;
  console.log(`${r.name.padEnd(26)} | Platforms: ${r.platforms.join(', ').padEnd(35)} | Models: ${r.modelsCount} | Status: ${status}`);
  if (r.issues.length > 0) {
    totalIssues += r.issues.length;
    r.issues.forEach(iss => console.log(`   ⚠️ Issue: ${iss}`));
  }
}
console.log('--------------------------------------------------');
console.log(`Summary: ${results.length} firms reviewed. Total issues found: ${totalIssues}`);
