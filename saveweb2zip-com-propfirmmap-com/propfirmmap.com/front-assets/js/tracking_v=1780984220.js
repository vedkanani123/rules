(function() {
    'use strict';

    var TRACKING_URL = '/api/track';
    var UTM_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'];
    var ATTR_STORAGE_KEY = 'pfm_attribution';

    // Capture UTM params from current URL and persist for the session.
    // Subsequent page-views inherit the attribution so we attribute the
    // ENTIRE session (not just the landing page) to its source.
    function captureAttribution() {
        try {
            var params = new URLSearchParams(window.location.search);
            var attr = {};
            var hasUtm = false;
            UTM_KEYS.forEach(function(k) {
                var v = params.get(k);
                if (v) { attr[k] = v.slice(0, 100); hasUtm = true; }
            });
            // Only overwrite session attribution if THIS page has fresh UTM params
            // (so click-through-then-internal-navigation keeps the original source).
            if (hasUtm) {
                attr.first_seen_at = new Date().toISOString();
                attr.landing_page = window.location.pathname;
                sessionStorage.setItem(ATTR_STORAGE_KEY, JSON.stringify(attr));
                return attr;
            }
            // No UTM on this page - try to inherit from session
            var stored = sessionStorage.getItem(ATTR_STORAGE_KEY);
            return stored ? JSON.parse(stored) : null;
        } catch (e) {
            return null;
        }
    }

    var attribution = captureAttribution();

    function sendEvent(eventType, extra) {
        // Cookie consent gate REMOVED 2026-05-09 per owner spec - banner is purely visual; tracking fires for every visitor regardless of accept/decline choice.

        var data = {
            event_type: eventType,
            page_url: window.location.pathname + window.location.search,
            page_title: document.title,
            referrer: document.referrer || null
        };

        // Inject attribution into every event's metadata (when present)
        var meta = (extra && extra.metadata) ? extra.metadata : {};
        if (attribution) meta.attribution = attribution;
        if (extra) {
            for (var key in extra) {
                if (extra.hasOwnProperty(key) && key !== 'metadata') data[key] = extra[key];
            }
        }
        if (Object.keys(meta).length > 0) data.metadata = meta;

        if (navigator.sendBeacon) {
            var blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
            navigator.sendBeacon(TRACKING_URL, blob);
        } else {
            var xhr = new XMLHttpRequest();
            xhr.open('POST', TRACKING_URL, true);
            xhr.setRequestHeader('Content-Type', 'application/json');
            xhr.setRequestHeader('Accept', 'application/json');
            xhr.send(JSON.stringify(data));
        }
    }

    sendEvent('page_view');

    document.addEventListener('click', function(e) {
        var link = e.target.closest('a[href*="firms/"]');
        if (link && link.href) {
            var match = link.href.match(/\/firms\/([^\/\?#]+)/);
            if (match && match[1] !== 'search' && match[1] !== 'most-voted' && match[1] !== 'request') {
                sendEvent('firm_click', { metadata: { firm_slug: match[1] } });
            }
        }

        var outbound = e.target.closest('a[target="_blank"], a[rel*="nofollow"]');
        if (outbound && outbound.href && outbound.href.indexOf(window.location.host) === -1 && outbound.href.indexOf('trustpilot.com') === -1) {
            var firmSlug = outbound.getAttribute('data-firm');
            if (!firmSlug) {
                var firmContainer = outbound.closest('[data-firm]');
                if (firmContainer) firmSlug = firmContainer.getAttribute('data-firm');
            }
            if (!firmSlug) {
                var pageMatch = window.location.pathname.match(/^\/firms\/([^\/\?#]+)/);
                if (pageMatch && pageMatch[1] !== 'search' && pageMatch[1] !== 'most-voted' && pageMatch[1] !== 'request') {
                    firmSlug = pageMatch[1];
                }
            }
            var meta = { url: outbound.href };
            if (firmSlug) meta.firm_slug = firmSlug;
            sendEvent('outbound_click', { metadata: meta });
        }
    });

    window.pfmTrack = sendEvent;

    if (window._pfmQ && window._pfmQ.length) {
        window._pfmQ.forEach(function(args) { sendEvent(args[0], args[1]); });
        window._pfmQ = [];
    }
})();
