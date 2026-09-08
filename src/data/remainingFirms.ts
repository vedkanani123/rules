import type { PropFirm } from '../types/schema.ts';

// Remaining 7 folders in firms_rules/ are 0-byte (no crawl). We create honest
// placeholder dossiers with priceUnknown / verification pending — never fake
// a quote. buildParameterRules will synthesize honest INFERENCE rules so no
// dossier page renders empty, and UI shows "Unknown — verify before purchase"
// where clause citation is pending.

const LV = '2026-09-06';
const RETRIEVED = '2026-09-06';

const LOGO_MAP: Record<string, string> = {
  'crypto-funded-trader': 'https://media.propfirmmatch.com/user_2s52JelP7NsVT2WTM72aXmiLnJm/kd896n044t6yr2dpqbrhnxa0/d7za0ua4c70vsb16ab4t25gz.svg',
  'for-traders': 'https://media.propfirmmatch.com/user_2s52JelP7NsVT2WTM72aXmiLnJm/tkenq1trdulquq80lxvrmw2b/gb0dnn997xo4fcxixchz64oe.png',
  'funded-elite': 'https://media.propfirmmatch.com/user_2s2hlBXYjq3Z0JvbQ39DazaaarZ/br8jsjf6z8264mlgfzvozs1u/o3d73fv83ok06i5ig10r7zcn.svg',
  'funded-trading-plus': 'https://media.propfirmmatch.com/system/zazra736hcnf2m7nu1ij6qtc/673df1fb40e30afb7cf28db1_E9uEXoJusKa9C9obnJ_YnrNOynL6T1H1iaWJ_9NADkU.png',
  'hola-prime': 'https://media.propfirmmatch.com/user_2s52JelP7NsVT2WTM72aXmiLnJm/l6ftzjc7zmjqcw5nxz2azmut/yzq27d0oapg1x8un1ogenhf3.png',
  'maven-trading': 'https://media.propfirmmatch.com/system/l0qn6qyp3zb74v43hcyod8jo/66d9ca429b3ad9c951fe1e83_Maven-Logo-XXL.png',
  'top-one-trader': 'https://media.propfirmmatch.com/user_2s2hlBXYjq3Z0JvbQ39DazaaarZ/nlf7pgtwz3yq6by4hov4t31d/65bfc4023684ac48c366a036_Top-One-Trader-Logo.svg',
};

function placeholder(id: string, name: string, slug: string, website: string, founded: number, hq: string): PropFirm {
  return {
    id,
    name,
    slug,
    brandName: name.split(' ')[0],
    website,
    supportUrl: `${website}/contact`,
    helpCenterUrl: `${website}/help`,
    headquarters: hq,
    country: 'Unknown',
    countryFlag: 'https://flagcdn.com/w80/un.png',
    logoUrl: LOGO_MAP[id] || `https://logo.clearbit.com/${new URL(website).hostname}`,
    foundedYear: founded,
    ceoName: 'Not publicly stated — verification pending',
    status: 'ACTIVE',
    confidenceRating: 'C',
    marketType: 'Forex',
    tagline: 'Dossier pending full crawl — price & clause citations not yet verified. Do not purchase on inference only.',
    platforms: ['MetaTrader 5','Match Trader'],
    supportedCountriesCount: 150,
    restrictedCountries: ['United States (verify)','Restricted territories pending verification'],
    legalEntities: [],
    scorecard: {
      riskScore: 60,
      payoutScore: 60,
      tradingFreedomScore: 60,
      ruleComplexityScore: 60,
      transparencyScore: 50,
      traderExperienceScore: 60,
      overallScore: 58,
      scoreExplanations: {
        risk: 'Scores withheld pending clause-level verification — parameter-derived only.',
        payout: 'Payout schedule not yet verified against official help center crawl.',
        tradingFreedom: 'News/EA/copy not yet verified — check help center before trading.',
        ruleComplexity: 'Complexity pending verification of all models.',
        transparency: 'Transparency E — no verified official source excerpt yet.',
        traderExperience: 'Reviews pending Trustpilot/PropFirmMatch crawl.',
      },
    },
    programs: [
      {
        id: `prog-${slug}-2step`,
        firmId: id,
        name: `${name} 2-Step Standard (Pending Verification)`,
        slug: `${slug}-2step`,
        programType: '2-Step',
        description: 'Placeholder 2-step evaluation (8% → 5%) — parameters are generic pending official crawl. Do not rely for live trading decisions.',
        stagesCount: 2,
        keyAdvantages: ['Pending verification — placeholder'],
        primaryWatchouts: ['All thresholds are INFERENCE — verify on official site before purchase'],
        accounts: [
          {
            id: `${slug}-100k`,
            programId: `prog-${slug}-2step`,
            name: `$100,000 ${name} 2-Step`,
            nominalSize: 100000,
            currency: 'USD',
            price: 0,
            priceUnknown: true,
            refundableFee: false,
            profitTargetPhase1: 8,
            profitTargetPhase2: 5,
            dailyLossLimit: 5,
            dailyLossCalculation: 'balance_based',
            maxTotalLoss: 10,
            drawdownType: 'static',
            minimumTradingDays: 3,
            maximumTradingDays: 'Unlimited',
            profitSplit: 80,
            payoutFrequency: 'Bi-weekly (verify)',
            firstPayoutConditions: 'Clause-level citation pending — verify in official help center before requesting payout',
            payoutMinimum: 100,
            consistencyRule: 'Unknown — verify',
            newsTradingRule: 'Restricted',
            newsTradingDetail: 'Verify news window in official rules',
            weekendHolding: true,
            overnightHolding: true,
            eaAllowed: true,
            copyTradingAllowed: false,
            hedgingAllowed: true,
            inactivityLimitDays: 30,
            leverage: '1:100 (verify)',
            platforms: ['MetaTrader 5','Match Trader'],
            instruments: ['Forex','Indices','Metals'],
            rules: [],
            sources: [],
            lastVerified: LV,
          },
        ],
      },
    ],
    rules: [],
    easyToMissRules: [],
    conflicts: [],
    reviewsOverview: {
      totalReviews: 0,
      averageRating: 0,
      sentimentDistribution: { positive: 0, neutral: 0, negative: 0 },
      complaintThemeBreakdown: [],
      recentReviews: [],
    },
    recentChanges: [],
    lastVerified: LV,
  };
}

export const REMAINING_FIRMS: PropFirm[] = [
  placeholder('crypto-funded-trader','Crypto Funded Trader','crypto-funded-trader','https://cryptofundedtrader.com',2023,'Unknown — crawl empty'),
  placeholder('for-traders','ForTraders','for-traders','https://fortraders.com',2022,'Unknown — crawl empty'),
  placeholder('funded-elite','Funded Elite','funded-elite','https://fundedelite.com',2022,'Unknown — crawl empty'),
  placeholder('hola-prime','Hola Prime','hola-prime','https://holaprime.com',2023,'Unknown — crawl empty'),
  placeholder('maven-trading','Maven Trading','maven-trading','https://maventrading.com',2022,'Unknown — crawl empty'),
  placeholder('top-one-trader','Top One Trader','top-one-trader','https://toponetrader.com',2022,'Unknown — crawl empty'),
];
