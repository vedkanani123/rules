(function () {
    'use strict';

    var STORAGE_KEY = 'pfm_cookie_consent';

    // Storage access throws "SecurityError: The operation is insecure" in
    // restricted-storage contexts (Safari Private Browsing, and crucially the
    // in-app browsers used by ChatGPT / iOS WebViews - a large slice of our
    // referral flood). An unguarded localStorage call at the top of this IIFE
    // aborts the whole script and never wires the banner. These wrappers
    // degrade gracefully: a blocked read returns null (banner re-shows, which
    // is acceptable), a blocked write is swallowed.
    function safeGet(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
    function safeSet(k, v) { try { localStorage.setItem(k, v); } catch (e) { /* storage blocked - ignore */ } }

    // Already responded - don't show
    if (safeGet(STORAGE_KEY)) return;

    // Build banner from template in the DOM
    var banner = document.getElementById('cookieConsent');
    if (!banner) return;

    // The banner is a full-width fixed slab at z-index 10000, so while it is open
    // it covers every bottom-anchored floating control (feedback FAB, back-to-top,
    // coupon toast) and their clicks land on the banner instead. Publish the
    // measured height so global.css can lift that stack clear of it. Measured
    // rather than hard-coded because the copy wraps to a different height by
    // viewport (114px at 375px wide, 104px at 1440px).
    var OPEN_CLASS = 'pfm-cookie-banner-open';

    function publishHeight() {
        if (!document.body.classList.contains(OPEN_CLASS)) return;
        document.documentElement.style.setProperty(
            '--pfm-cookie-banner-h', banner.offsetHeight + 'px'
        );
    }

    function clearBannerOffset() {
        document.body.classList.remove(OPEN_CLASS);
        document.documentElement.style.removeProperty('--pfm-cookie-banner-h');
    }

    // Show with a slight delay so the page renders first
    setTimeout(function () {
        banner.classList.add('visible');
        document.body.classList.add(OPEN_CLASS);
        publishHeight();
    }, 800);

    window.addEventListener('resize', publishHeight);

    banner.addEventListener('click', function (e) {
        var btn = e.target.closest('[data-cookie-action]');
        if (!btn) return;

        var action = btn.getAttribute('data-cookie-action');
        safeSet(STORAGE_KEY, action); // 'accept' or 'decline'

        banner.classList.remove('visible');
        clearBannerOffset();
        // Remove from DOM after animation
        setTimeout(function () {
            banner.remove();
        }, 500);
    });
})();
