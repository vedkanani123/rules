/* Marks up horizontally-overflowing data tables so the hidden columns are
   discoverable. See table-scroll-affordance.css for the measurements that
   motivated this.

   Discovery walks UP from each <table> to its nearest scrolling ancestor rather
   than matching wrapper class names: there are 27 different wrapper classes on
   the site (.cat-table-wrap, .dcat-table-wrap, .vs-hub__scroll, .tm-tablewrap
   ...) and a name-based selector would silently miss the next one. Starting
   from the table also keeps the cost proportional to the number of tables
   instead of the number of elements.

   Requiring a <table> is the scope limit: losing columns of data is the failure
   this fixes. A partially visible row of pills or cards already reads as
   continuing, so those scrollers are deliberately left alone. */
(function () {
    'use strict';

    var MAX_DEPTH = 6;

    function scrollingAncestor(table) {
        var node = table.parentElement;
        for (var i = 0; i < MAX_DEPTH && node && node !== document.body; i++) {
            var ox = window.getComputedStyle(node).overflowX;
            if (ox === 'auto' || ox === 'scroll') return node;
            node = node.parentElement;
        }
        return null;
    }

    function opaqueBackground(el) {
        /* Walk up until something actually paints, so the fade matches the real
           surface instead of assuming white. */
        var node = el;
        while (node && node !== document.documentElement) {
            var bg = window.getComputedStyle(node).backgroundColor;
            if (bg && bg !== 'transparent' && !/^rgba\([^)]*,\s*0\s*\)$/.test(bg)) {
                return bg;
            }
            node = node.parentElement;
        }
        return '#fff';
    }

    function label(el) {
        var node = el;
        for (var i = 0; i < 4 && node; i++) {
            var h = node.querySelector ? node.querySelector('h1, h2, h3') : null;
            if (h && h.textContent.trim()) {
                return h.textContent.trim().slice(0, 90) + ' (scrollable table)';
            }
            node = node.parentElement;
        }
        return 'Scrollable comparison table';
    }

    function apply(el) {
        if (el.scrollWidth <= el.clientWidth + 2) {
            el.classList.remove('pfm-xscroll');
            if (el.getAttribute('data-pfm-xscroll-owned') === '1') {
                el.removeAttribute('tabindex');
                el.removeAttribute('role');
                el.removeAttribute('aria-label');
                el.removeAttribute('data-pfm-xscroll-owned');
            }
            return;
        }

        if (!el.classList.contains('pfm-xscroll')) {
            /* An existing background image would be replaced by the shadow
               layers, so leave those wrappers visually untouched. */
            if (window.getComputedStyle(el).backgroundImage === 'none') {
                el.style.setProperty('--pfm-xscroll-bg', opaqueBackground(el));
                el.classList.add('pfm-xscroll');
            }
        }

        /* Without this the hidden columns are unreachable by keyboard: the
           wrapper has no focusable child of its own (WCAG 2.1.1). Only claim
           the attributes if the template did not already set them. */
        if (!el.hasAttribute('tabindex') && !el.hasAttribute('role')) {
            el.setAttribute('tabindex', '0');
            el.setAttribute('role', 'region');
            el.setAttribute('aria-label', label(el));
            el.setAttribute('data-pfm-xscroll-owned', '1');
        }
    }

    function scan() {
        var tables = document.querySelectorAll('table');
        var seen = [];
        for (var i = 0; i < tables.length; i++) {
            var wrap = scrollingAncestor(tables[i]);
            if (!wrap || seen.indexOf(wrap) !== -1) continue;
            seen.push(wrap);
            apply(wrap);
        }
    }

    var pending = null;
    function rescan() {
        if (pending) return;
        pending = window.setTimeout(function () {
            pending = null;
            scan();
        }, 150);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', scan);
    } else {
        scan();
    }

    /* Column widths settle after webfonts land, and several of these tables are
       sorted and filtered client-side after first paint. */
    window.addEventListener('resize', rescan);
    window.addEventListener('load', rescan);
    if (document.fonts && document.fonts.ready && document.fonts.ready.then) {
        document.fonts.ready.then(rescan);
    }
})();
