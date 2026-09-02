/* pfmMono (monogram fallback for broken/no-logo images) is now defined inline in
   the layout <head> so it exists before any <img onerror> can fire. Do not
   re-add it here  -  a body-end definition races image load and throws
   "pfmMono is not defined" on logos that 404 early. */
/**
 * PropFirmMap - Main layout scripts (extracted from front.blade.php).
 * Cached by the browser after first load, saving ~5 KB per page view.
 */

/* ── Step Wizard ── */
var currentStep = 1;
var totalSteps = 3;

function showStep(step) {
    for (var i = 1; i <= totalSteps; i++) {
        var el = document.getElementById('step' + i);
        if (el) el.classList.remove('active');
    }
    var target = document.getElementById('step' + step);
    if (target) target.classList.add('active');
}

function nextStep() {
    if (currentStep < totalSteps) {
        currentStep++;
        showStep(currentStep);
    }
}

function prevStep() {
    if (currentStep > 1) {
        currentStep--;
        showStep(currentStep);
    }
}

/* ── Mobile Menu Toggle ── */
function toggleMenu() {
    var menu = document.getElementById("menu");
    var overlay = document.getElementById("menuOverlay");
    var hamburger = document.querySelector(".hamburger");
    if (!menu || !overlay || !hamburger) return;

    var isOpen = menu.classList.contains("active");

    if (isOpen) {
        menu.classList.remove("active");
        overlay.classList.remove("active");
        hamburger.classList.remove("active");
        document.body.style.overflow = "";
        hamburger.setAttribute("aria-expanded", "false");
    } else {
        menu.classList.add("active");
        overlay.classList.add("active");
        hamburger.classList.add("active");
        document.body.style.overflow = "hidden";
        hamburger.setAttribute("aria-expanded", "true");
    }
}

// Bind hamburger + overlay click handlers (2026-06-03 - replaces inline onclick="toggleMenu()"
// on the hamburger button; inline onclick fires before main.js loads on slow connections and
// throws "Uncaught ReferenceError: toggleMenu is not defined", spamming js_error analytics on
// the /best/* ChatGPT funnel pages and breaking mobile nav).
(function() {
    var hamburger = document.getElementById("navHamburger");
    if (hamburger) {
        hamburger.addEventListener("click", function() { toggleMenu(); });
    }
    var overlay = document.getElementById("menuOverlay");
    if (overlay) {
        overlay.addEventListener("click", function() { toggleMenu(); });
    }
})();

// Close menu on Escape key
document.addEventListener("keydown", function(e) {
    if (e.key === "Escape") {
        var menu = document.getElementById("menu");
        if (menu && menu.classList.contains("active")) {
            toggleMenu();
        }
    }
});

/* ── Nav Search (inner pages) ── */
(function() {
    var searchInput = document.getElementById('searchInput');
    var suggestionList = document.getElementById('suggestionList');

    if (!searchInput || !suggestionList) return;

    searchInput.addEventListener('input', function() {
        var query = this.value.toLowerCase();

        if (typeof axios === 'undefined') return;

        axios.get('/firms/search', { params: { search: query } })
            .then(function(response) {
                var firms = response.data.data.firms;

                if (firms.length > 0) {
                    suggestionList.innerHTML = '';
                    suggestionList.classList.remove('d-none');

                    firms.forEach(function(firm) {
                        var anchor = document.createElement('a');
                        anchor.href = '/firms/' + firm.slug;
                        anchor.className = 'suggestion-item';

                        var img = document.createElement('img');
                        img.src = firm.logo_webp_url || firm.logo_url;
                        img.alt = firm.name;
                        img.className = 'suggestion-item__logo';
                        anchor.appendChild(img);

                        var name = document.createElement('span');
                        name.innerText = firm.name;
                        anchor.appendChild(name);

                        suggestionList.appendChild(anchor);
                    });
                } else {
                    suggestionList.classList.add('d-none');
                }
            })
            .catch(function() {});
    });

    document.addEventListener('click', function(e) {
        if (!e.target.closest('.search')) {
            suggestionList.classList.add('d-none');
        }
    });
})();

/* ── Tooltips ── */
try {
    var tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]');
    if (typeof bootstrap !== 'undefined' && bootstrap.Tooltip) {
        tooltipTriggerList.forEach(function(el) { new bootstrap.Tooltip(el); });
    }
} catch(e) {}

/* ── Robust clipboard copy ──
   navigator.clipboard.writeText is unavailable in iOS in-app WebViews (the
   ChatGPT/Copilot referral browsers that are our flood) and on non-secure
   origins, where an unguarded call silently no-ops and a "copy code" button
   dead-clicks. pfmCopyText tries the async API first (inside the click gesture),
   then falls back to the legacy execCommand('copy') technique so the text always
   lands on the clipboard. Returns a Promise<boolean> (true = copied). */
function pfmLegacyCopy(text) {
    try {
        var ta = document.createElement('textarea');
        ta.value = text;
        ta.setAttribute('readonly', '');
        ta.style.position = 'fixed';
        ta.style.top = '-9999px';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.focus();
        ta.select();
        try { ta.setSelectionRange(0, ta.value.length); } catch (e) {}
        var ok = false;
        try { ok = document.execCommand('copy'); } catch (e) { ok = false; }
        document.body.removeChild(ta);
        return ok;
    } catch (e) { return false; }
}
window.pfmCopyText = function (text) {
    text = String(text == null ? '' : text);
    if (navigator.clipboard && navigator.clipboard.writeText && window.isSecureContext) {
        return navigator.clipboard.writeText(text).then(function () {
            return true;
        }, function () {
            return pfmLegacyCopy(text);
        });
    }
    return Promise.resolve(pfmLegacyCopy(text));
};

function copytoClipBoard(e) {
    window.pfmCopyText(e.textContent.trim());
}

/* ── Social Share: Copy Link ── */
function pfmCopyLink(btn) {
    var url = btn.getAttribute('data-url') || window.location.href;
    window.pfmCopyText(url).then(function (ok) {
        var icon = btn.querySelector('i');
        btn.classList.add(ok ? 'copied' : 'copy-failed');
        if (icon) { icon.className = ok ? 'bx bx-check' : 'bx bx-x'; }
        if (!ok) { btn.setAttribute('title', 'Copy failed - copy the address bar URL instead'); }
        setTimeout(function() {
            btn.classList.remove('copied', 'copy-failed');
            if (icon) { icon.className = 'bx bx-link-alt'; }
        }, 2000);
    });
}

/* ── Promo-code copy buttons ──
   Any [data-copy-code] element copies its code on click. Delegated, so it works
   for markup rendered after this script parses. Every click ends in a VISIBLE
   terminal state: when both clipboard paths fail (locked-down in-app WebViews)
   the code text is selected instead so the user can copy by hand. Returning
   silently on failure reads as a dead click and users re-click the button. */
(function () {
    /* A copy is the closest in-our-control signal to a coupon redemption: the
       code is in the user's clipboard, which only happens at checkout. Outbound
       clicks were proven not to be revenue (owner directive 2026-07-14), so this
       is the intent signal partnership pitches are measured on. Nothing here
       adds markup: the firm comes from attributes the card already carries, and
       failing that the server resolves it from the code. */

    /* Site-wide codes (PFMAP is on 5 firms) are ambiguous by code alone, and the
       server refuses to guess which one they belong to. The surrounding card
       already identifies its firm for other controls, so walk up to it and read
       that instead. Capped at 6 levels so a miss falls back to the code lookup
       rather than reaching a page-wide container and picking another card. */
    function findFirmSlug(btn) {
        for (var el = btn, i = 0; el && i < 6; el = el.parentElement, i++) {
            var own = el.getAttribute && (el.getAttribute('data-firm-slug') || el.getAttribute('data-firm'));
            if (own) return own;
            if (!el.querySelector) continue;
            var inner = el.querySelector('[data-firm-slug], [data-firm]');
            if (inner) return inner.getAttribute('data-firm-slug') || inner.getAttribute('data-firm');
            var urlEl = el.querySelector('[data-firm-url]');
            var m = urlEl && (urlEl.getAttribute('data-firm-url') || '').match(/\/firms\/([^\/?#]+)/);
            if (m) return m[1];
        }
        return null;
    }

    /* trigger separates the two ways a code reaches a clipboard. A manual copy is a
       deliberate act; a cta_auto copy rides an outbound click made for another
       reason. Blending them would make the cta_auto rollout read as a demand jump,
       so every report over this event must segment on this field. */
    function trackCopy(btn, code, ok, trigger) {
        var meta = { code: String(code).slice(0, 40), copied: !!ok, trigger: trigger || 'manual' };
        var slug = findFirmSlug(btn);
        if (slug) meta.firm_slug = slug;
        var evt = ['promo_code_copy', { metadata: meta }];
        try {
            if (window.pfmTrack) { window.pfmTrack(evt[0], evt[1]); }
            else { (window._pfmQ = window._pfmQ || []).push(evt); }
        } catch (e) { /* tracker must never break the copy */ }
    }

    function selectText(el) {
        try {
            var range = document.createRange();
            range.selectNodeContents(el);
            var sel = window.getSelection();
            sel.removeAllRanges();
            sel.addRange(range);
        } catch (e) {}
    }
    document.addEventListener('click', function (e) {
        var btn = e.target.closest('[data-copy-code]');
        if (!btn || btn.getAttribute('data-copy-busy') === '1') return;

        var code = btn.getAttribute('data-copy-code');
        var original = btn.innerHTML;
        btn.setAttribute('data-copy-busy', '1');

        window.pfmCopyText(code).then(function (ok) {
            trackCopy(btn, code, ok);
            if (ok) {
                btn.innerHTML = '<i class="bx bx-check"></i> <span>Copied!</span>';
                btn.classList.add('is-copied');
            } else {
                btn.innerHTML = '<span>' + code + '</span>';
                btn.classList.add('is-copyfail');
                btn.setAttribute('title', 'Select the code and copy it manually');
                selectText(btn);
            }
            setTimeout(function () {
                btn.innerHTML = original;
                btn.classList.remove('is-copied', 'is-copyfail');
                btn.removeAttribute('data-copy-busy');
            }, 2000);
        });
    });

    /* ── The deal CTA carries the code out with the click ──
       Measured 2026-08-11 over 30d: 697 of 955 real outbound clicks went to a firm
       holding an active promo code, but only 12 of 494 clicking sessions ever
       copied one. Cookie attribution was proven worthless (owner directive
       2026-07-14, ~800 partnered clicks -> $0), so the code entered at checkout is
       the only attribution path we have, and 97% of the traffic we send leaves
       without it. Copying on the CTA click puts it in the clipboard at the moment
       the user is on their way to the checkout field.

       The toast never claims the discount is applied: an affiliate link may already
       carry a better one, and which link does is not something we have verified per
       firm. It states what happened and leaves the choice with the user.

       EVERY coded CTA is target="_blank", so the click that triggers this toast also
       backgrounds the tab it renders on. Measured in Chromium 2026-08-12: the toast
       appeared, then hid itself 6s later while the user was still on the firm's site,
       and carried no control of any kind. So the success message was never read, and
       on a copy failure - the in-app WebViews that our best-qualified channel arrives
       in, where both clipboard paths can fail - the code itself was destroyed on a
       hidden tab and the trader reached the checkout field with nothing.

       Hence: the dismiss countdown only runs while the page is VISIBLE, so the toast
       is still there when the user comes back, which is the moment they need it; a
       failed copy never auto-dismisses at all; and the code is both selectable text
       and re-copyable from a fresh user gesture, which is the one thing most likely
       to succeed after a blocked clipboard. */
    var toastEl = null, toastCodeEl = null, toastTimer = null, toastMs = 0;

    function hideToast() {
        clearTimeout(toastTimer);
        toastMs = 0;
        if (toastEl) { toastEl.classList.remove('is-visible'); }
    }

    /* A background tab must not burn the countdown: setTimeout keeps running when
       the tab is hidden, which is exactly how the old toast expired unseen. */
    function armToastTimer(ms) {
        clearTimeout(toastTimer);
        toastMs = ms;
        if (!ms || document.hidden) return;
        toastTimer = setTimeout(hideToast, ms);
    }
    document.addEventListener('visibilitychange', function () {
        if (!toastEl || !toastEl.classList.contains('is-visible')) return;
        if (document.hidden) { clearTimeout(toastTimer); }
        else { armToastTimer(toastMs); }
    });

    function buildToast() {
        toastEl = document.createElement('div');
        toastEl.className = 'pfm-code-toast';
        toastEl.setAttribute('role', 'status');
        toastEl.setAttribute('aria-live', 'polite');

        var close = document.createElement('button');
        close.type = 'button';
        close.className = 'pfm-code-toast__close';
        close.setAttribute('aria-label', 'Dismiss');
        /* A glyph, not a boxicons <i>: the icon font is lazy-loaded, and a failed
           copy never auto-dismisses, so an icon that does not render would leave the
           toast on screen with no way to close it. */
        close.textContent = '\u00d7';
        close.addEventListener('click', hideToast);

        var title = document.createElement('strong');
        var row = document.createElement('div');
        row.className = 'pfm-code-toast__row';

        /* Selectable, so a user whose clipboard is locked down entirely can still
           highlight the code by hand rather than being left with nothing. */
        toastCodeEl = document.createElement('code');
        toastCodeEl.className = 'pfm-code-toast__code';

        var recopy = document.createElement('button');
        recopy.type = 'button';
        recopy.className = 'pfm-code-toast__recopy';
        recopy.textContent = 'Copy again';
        recopy.addEventListener('click', function () {
            var code = toastCodeEl.textContent;
            window.pfmCopyText(code).then(function (ok) {
                /* Its own trigger value on purpose. Folding it into manual would
                   inflate the demand signal, and into cta_auto the delivery signal;
                   a re-copy from the toast is neither. */
                trackCopy(recopy, code, ok, 'toast_recopy');
                recopy.textContent = ok ? 'Copied' : 'Select it above';
                if (ok) { armToastTimer(6000); }
                setTimeout(function () { recopy.textContent = 'Copy again'; }, 2000);
            });
        });

        row.appendChild(toastCodeEl);
        row.appendChild(recopy);
        var note = document.createElement('span');

        toastEl.appendChild(close);
        toastEl.appendChild(title);
        toastEl.appendChild(row);
        toastEl.appendChild(note);
        document.body.appendChild(toastEl);
        return { title: title, note: note };
    }

    var toastParts = null;
    function showCodeToast(code, ok) {
        if (!toastEl) { toastParts = buildToast(); }
        /* textContent, not innerHTML: the code is DB-authored and gets rendered
           back into the page, so it never goes through an HTML parser here. */
        toastParts.title.textContent = ok ? 'Code copied' : 'Your code';
        toastCodeEl.textContent = code;
        toastParts.note.textContent = ok
            ? 'Paste it at checkout if the discount is not already applied.'
            : 'Copy it now - enter it at checkout to get the discount.';
        toastEl.classList.toggle('pfm-code-toast--warn', !ok);
        toastEl.classList.add('is-visible');
        /* A failed copy is the one case where this toast holds the only copy of the
           code the user has, so it stays until they dismiss it. */
        armToastTimer(ok ? 6000 : 0);
    }

    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && toastEl && toastEl.classList.contains('is-visible')) { hideToast(); }
    });

    /* Any element, not just an anchor: the /awards rank rows navigate from a div
       via window.open, so an anchor-only selector would silently skip them. */
    document.addEventListener('click', function (e) {
        var cta = e.target.closest('[data-cta-code]');
        if (!cta) return;
        /* A manual copy button nested inside a CTA is a deliberate copy and is
           already counted by the handler above; counting it again here would
           report one act as both demand and delivery. */
        if (e.target.closest('[data-copy-code]')) return;
        var code = (cta.getAttribute('data-cta-code') || '').trim();
        if (!code) return;
        window.pfmCopyText(code).then(function (ok) {
            trackCopy(cta, code, ok, 'cta_auto');
            showCodeToast(code, ok);
        });
    });
})();

/* ── Deal-card research zone: whole-row clickable to the firm page ──
   Navigate only on a plain left-click that is NOT on an interactive element
   (inner links, the promo-copy button and the notify button keep their own
   behaviour) and not while text is being selected. The amber /out CTA strip
   below the zone is a real anchor and is untouched. */
document.addEventListener('click', function (e) {
    var zone = e.target.closest('.deal-card__research--clickable[data-firm-url]');
    if (!zone) return;
    if (e.button !== 0 || e.ctrlKey || e.metaKey || e.shiftKey || e.altKey) return;
    if (e.target.closest('a, button, input, select, label')) return;
    if (window.getSelection && String(window.getSelection())) return;
    window.location.href = zone.getAttribute('data-firm-url');
});

/* ── Scroll to Top ── */
(function() {
    var btn = document.getElementById('scrollTopBtn');
    if (!btn) return;
    var shown = false;
    function toggle() {
        var shouldShow = window.scrollY > 400;
        if (shouldShow !== shown) {
            shown = shouldShow;
            btn.classList.toggle('visible', shouldShow);
        }
    }
    window.addEventListener('scroll', toggle, { passive: true });
    btn.addEventListener('click', function() {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
})();

/* ── Global Image Error Handler ── */
(function() {
    var placeholder = document.body.getAttribute('data-img-placeholder') || '/front-assets/images/logo.png';
    function fixImg(img) {
        if (img.src && img.src.indexOf('logo.png') === -1) {
            img.onerror = null;
            img.src = placeholder;
        }
    }
    // Use Array.prototype.forEach.call so older Safari/iOS - where NodeList
    // doesn't carry .forEach - don't throw TypeError on every page load.
    Array.prototype.forEach.call(document.querySelectorAll('img'), function(img) {
        if (img.complete && img.naturalWidth === 0 && img.src && img.src !== '' && img.src !== window.location.href) {
            fixImg(img);
        }
        img.addEventListener('error', function() { fixImg(this); });
    });
})();

/* ── Clamped prose note (expand in place) ──
   Shared by the firm catalog drawdown badge/cell and the category comparison
   table's profit-split and payout-frequency cells. Delegated from the document
   so it covers rows that are re-ordered by client-side table sorting. Lives
   here rather than in a single view because several templates render the
   control; two copies of this listener would toggle aria-expanded twice and
   cancel each other out. */
document.addEventListener('click', function(e) {
    var btn = e.target.closest ? e.target.closest('[data-dd-toggle]') : null;
    if (!btn) return;
    e.preventDefault();
    e.stopPropagation();
    var expanded = btn.getAttribute('aria-expanded') === 'true';
    btn.setAttribute('aria-expanded', expanded ? 'false' : 'true');
    var label = btn.querySelector('.dd-note__toggle');
    if (label) label.textContent = expanded ? 'more' : 'less';
});

/* ── Chart.js availability guard ──
   chart.umd.min.js (Chart.js 4.x) ships 22 static class fields plus optional
   chaining, so Safari below 14.1 cannot parse the bundle at all and `Chart`
   never gets defined. Proven 2026-08-14 by a js_error pair from iOS 12.5.8:
   the parse SyntaxError and "Can't find variable: Chart" landed in the same
   second. An unguarded `new Chart()` then throws a ReferenceError that aborts
   the rest of its init callback and leaves an empty box on the page, so every
   chart init routes through this instead. Also covers the script simply not
   arriving (404, blocked by an extension, dropped connection).
   Returns the canvas when charting is usable and null otherwise, so call sites
   keep the `if (!canvas) return;` shape they already had.
   Re-entrant on purpose: calculators re-render their chart on each recompute,
   and the second call finds the notice already present and does nothing. */
window.pfmChartCanvas = function (canvasId) {
    var canvas = document.getElementById(canvasId);
    if (!canvas) return null;
    if (typeof Chart !== 'undefined') return canvas;
    var host = canvas.parentNode;
    if (host && !host.querySelector('.pfm-chart-fallback')) {
        // Hidden rather than removed: call sites keep a reference to the
        // canvas and some call destroy() on recompute.
        canvas.style.display = 'none';
        var note = document.createElement('p');
        note.className = 'pfm-chart-fallback';
        note.textContent = 'Chart unavailable. Reload the page, or update your browser if this keeps happening.';
        host.appendChild(note);
    }
    return null;
};
