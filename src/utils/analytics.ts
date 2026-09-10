/**
 * Google Ads & Analytics Conversion Tracking Utility
 * Supports Google Consent Mode v2, Google Tag (gtag.js), Google Analytics 4, and dataLayer.
 */

declare global {
  interface Window {
    dataLayer?: any[];
    gtag?: (...args: any[]) => void;
  }
}

/**
 * Dispatch an event to Google Analytics / Google Ads and dataLayer
 */
export function trackEvent(eventName: string, params: Record<string, any> = {}) {
  try {
    if (typeof window !== 'undefined') {
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({
        event: eventName,
        ...params,
        timestamp: new Date().toISOString(),
      });

      if (typeof window.gtag === 'function') {
        window.gtag('event', eventName, params);
      }
    }
  } catch (err) {
    // Fail silently in non-browser or sandbox environments
  }
}

/**
 * Track conversion actions (e.g. Lead, Calculator Usage, Firm Outbound Click)
 */
export function trackConversion(conversionLabel: string, value: number = 0, currency: string = 'USD') {
  trackEvent('conversion', {
    send_to: conversionLabel,
    value,
    currency,
  });
}

/**
 * Outbound click tracking for prop firm referral / official source links
 */
export function trackOutboundClick(firmName: string, destinationUrl: string) {
  trackEvent('outbound_firm_click', {
    firm_name: firmName,
    destination_url: destinationUrl,
  });
}
