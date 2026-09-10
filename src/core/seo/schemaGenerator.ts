// Schema.org Structured Data Generator for PropFirmRules.io
// Adheres strictly to Google Search Central guidelines with valid JSON-LD graphs

export interface BreadcrumbItem {
  name: string;
  url: string;
}

export const BASE_URL = 'https://www.fundedtradingrules.com';

export function generateOrganizationSchema() {
  return {
    '@type': 'Organization',
    '@id': `${BASE_URL}/#organization`,
    name: 'FundedTradingRules.com',
    alternateName: [
      'Funded Trading Rules',
      'FundedTradingRules',
      'Prop Firm Rules',
      'Prop Firm Trading Rules',
      'Funded Rules',
      'PropFirmRules'
    ],
    url: BASE_URL,
    logo: {
      '@type': 'ImageObject',
      url: `${BASE_URL}/logo.png`,
      width: 512,
      height: 512,
    },
    description: 'Independent, evidence-backed intelligence and deterministic rule calculation for funded trading accounts and proprietary trading firms.',
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer support',
      email: 'support@fundedtradingrules.com',
      availableLanguage: 'English',
    },
  };
}

export function generateWebSiteSchema() {
  return {
    '@type': 'WebSite',
    '@id': `${BASE_URL}/#website`,
    url: BASE_URL,
    name: 'Funded Trading Rules',
    alternateName: [
      'FundedTradingRules',
      'FundedTradingRules.com',
      'Funded Trading Rules Intelligence',
      'Prop Firm Rules',
      'Prop Firm Trading Rules',
      'Funded Rules',
      'PropFirmRules'
    ],
    description: 'Verified Prop Firm Rules, Restrictions & Evidence Intelligence',
    publisher: {
      '@id': `${BASE_URL}/#organization`,
    },
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${BASE_URL}/rules?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };
}

export function generateBreadcrumbSchema(items: BreadcrumbItem[]) {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url.startsWith('http') ? item.url : `${BASE_URL}${item.url}`,
    })),
  };
}

export function generateFAQSchema(faqs: { question: string; answer: string }[]) {
  if (!faqs || faqs.length === 0) return null;
  return {
    '@type': 'FAQPage',
    mainEntity: faqs.map(faq => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };
}

export function generateFirmSchema(firm: {
  name: string;
  slug: string;
  website: string;
  country: string;
  headquarters: string;
  foundedYear: number;
  description?: string;
  rating?: number;
  reviewsCount?: number;
}) {
  const schema: any = {
    '@type': 'Organization',
    '@id': `${BASE_URL}/prop-firms/${firm.slug}#entity`,
    name: firm.name,
    url: firm.website,
    address: {
      '@type': 'PostalAddress',
      addressCountry: firm.country,
      addressLocality: firm.headquarters,
    },
    foundingDate: firm.foundedYear ? `${firm.foundedYear}` : undefined,
    description: firm.description || `Verified trading rules, drawdown calculation, and evaluation terms for ${firm.name}.`,
  };

  if (firm.rating && firm.reviewsCount && firm.reviewsCount > 0) {
    schema.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: firm.rating,
      reviewCount: firm.reviewsCount,
      bestRating: '5',
      worstRating: '1',
    };
  }

  return schema;
}

export function generateRuleArticleSchema(rule: {
  name: string;
  slug: string;
  category: string;
  description: string;
  datePublished?: string;
  dateModified?: string;
}) {
  return {
    '@type': 'TechArticle',
    '@id': `${BASE_URL}/rules/${rule.slug}#article`,
    headline: `${rule.name} — Prop Firm Rule Intelligence & Calculation Guide`,
    description: rule.description,
    articleSection: rule.category,
    author: {
      '@type': 'Organization',
      name: 'PropFirmRules Research Desk',
      url: BASE_URL,
    },
    publisher: {
      '@id': `${BASE_URL}/#organization`,
    },
    datePublished: rule.datePublished || '2026-01-15',
    dateModified: rule.dateModified || '2026-09-10',
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${BASE_URL}/rules/${rule.slug}`,
    },
  };
}

export function generateItemListSchema(name: string, items: { name: string; url: string }[]) {
  return {
    '@type': 'ItemList',
    name,
    numberOfItems: items.length,
    itemListElement: items.map((item, idx) => ({
      '@type': 'ListItem',
      position: idx + 1,
      name: item.name,
      url: item.url.startsWith('http') ? item.url : `${BASE_URL}${item.url}`,
    })),
  };
}
