import {
  GFTModel,
  GFTPricingEntry,
  GFTWarningItem,
  GFTCommunityItem,
  GFTChangeHistoryItem,
  GFTDecisionRecommendation,
  GFTFuturesModel,
} from './goatCanonicalData.ts';

export interface FirmCorporateEntity {
  name: string;
  role: string;
  jurisdiction: string;
  crNo?: string;
  address: string;
  scope: string;
}

export interface FirmCanonicalProfile {
  slug: string;
  name: string;
  brandName: string;
  logoUrl: string;
  country: string;
  countryFlag: string;
  headquarters: string;
  foundedYear: number;
  ceoFounder: string;
  website: string;
  supportEmail: string;
  trustScore: number;
  reviewScore: number;
  reviewsCount: number;
  totalPayoutsReported: string;
  activeTradersReported: string;
  confidenceRating: 'A' | 'A+' | 'B' | 'B+' | 'C' | 'D';
  passRateDisclaimer?: string;
  activePromo?: {
    code: string;
    discount: string;
    details: string;
  };
  entities: FirmCorporateEntity[];
  models: GFTModel[];
  pricingRegistry: GFTPricingEntry[];
  warnings: GFTWarningItem[];
  reviews: GFTCommunityItem[];
  changeHistory: GFTChangeHistoryItem[];
  recommendations: GFTDecisionRecommendation[];
  futuresModels: GFTFuturesModel[];
}
