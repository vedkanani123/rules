/* PropFirmMap compare tray - add up to 4 firms from cards, compare side-by-side.
   State in localStorage so it persists across pages. No dependencies. */
(function () {
    var KEY = 'pfm_compare', CAP = 4, bar, liveRegion;

    // Screen-reader announcer: a persistent visually-hidden polite live region.
    // The tray itself is injected dynamically, so without this an assistive-tech
    // user gets no feedback when a firm is added/removed or the cap is hit.
    function announce(msg) {
        if (!liveRegion) {
            liveRegion = document.createElement('div');
            liveRegion.className = 'visually-hidden';
            liveRegion.setAttribute('aria-live', 'polite');
            liveRegion.setAttribute('aria-atomic', 'true');
            document.body.appendChild(liveRegion);
        }
        // Clear then set on the next frame so repeated identical messages
        // (e.g. hitting the cap twice) are still re-announced.
        liveRegion.textContent = '';
        window.requestAnimationFrame(function () { liveRegion.textContent = msg; });
    }
    function countLabel(n) { return n + (n === 1 ? ' firm' : ' firms') + ' selected for comparison'; }

    // Storage throws "SecurityError: The operation is insecure" in restricted
    // contexts (Safari Private, ChatGPT/iOS in-app browsers). safeSetItem
    // swallows the failure so add-to-compare still updates the UI in-memory
    // instead of aborting the script (get() is already guarded).
    function safeSetItem(k, v) { try { localStorage.setItem(k, v); } catch (e) { /* storage blocked - ignore */ } }
    function get() { try { return JSON.parse(localStorage.getItem(KEY)) || []; } catch (e) { return []; } }
    function save(a) { safeSetItem(KEY, JSON.stringify(a.slice(0, CAP))); render(); syncButtons(); }
    function has(slug) { return get().some(function (f) { return f.slug === slug; }); }
    function esc(s) { return (s || '').replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
    function onCompare() { return location.pathname.replace(/\/+$/, '') === '/compare'; }
    function url(a) { return '/compare?firms=' + a.map(function (f) { return encodeURIComponent(f.slug); }).join(','); }

    function toggle(slug, name, logo) {
        var a = get(), i = a.findIndex(function (f) { return f.slug === slug; });
        if (i >= 0) {
            a.splice(i, 1);
            save(a);
            announce('Removed ' + name + ' from comparison. ' + countLabel(a.length) + '.');
            return;
        }
        if (a.length >= CAP) {
            // toast() carries role="status", so it is announced on its own;
            // don't also fire announce() or the message double-speaks.
            toast('You can compare up to ' + CAP + ' firms. Remove one to add another.');
            return;
        }
        a.push({ slug: slug, name: name, logo: logo });
        save(a);
        announce('Added ' + name + ' to comparison. ' + countLabel(a.length) + '.');
    }
    function remove(slug) {
        var removed = get().find(function (f) { return f.slug === slug; });
        var next = get().filter(function (f) { return f.slug !== slug; });
        save(next);
        announce('Removed ' + (removed ? removed.name : 'firm') + ' from comparison. ' + countLabel(next.length) + '.');
        if (onCompare()) { location.href = next.length ? url(next) : '/firms'; }
    }
    function clear() {
        save([]);
        announce('Comparison cleared.');
        if (onCompare()) location.href = '/firms';
    }

    function seedFromUrl() {
        if (!onCompare()) return;
        var f = new URLSearchParams(location.search).get('firms');
        if (!f) return;
        var known = {}; get().forEach(function (x) { known[x.slug] = x; });
        var slugs = f.split(',').map(function (s) { return s.trim(); }).filter(Boolean).slice(0, CAP);
        safeSetItem(KEY, JSON.stringify(slugs.map(function (s) { return known[s] || { slug: s, name: s, logo: '' }; })));
    }

    function syncButtons() {
        var full = get().length >= CAP;
        document.querySelectorAll('[data-compare-add]').forEach(function (b) {
            var on = has(b.getAttribute('data-compare-add'));
            b.classList.toggle('is-selected', on);
            b.classList.toggle('is-disabled', full && !on);
            var lbl = b.querySelector('.cmp-lbl');
            if (lbl) lbl.textContent = on ? 'Added' : 'Compare';
        });
    }

    function render() {
        var a = get();
        if (!bar) {
            bar = document.createElement('div');
            bar.className = 'cmp-tray';
            bar.setAttribute('role', 'region');
            bar.setAttribute('aria-label', 'Firm comparison tray');
            document.body.appendChild(bar);
        }
        if (!a.length) { bar.classList.remove('is-on'); bar.innerHTML = ''; return; }
        bar.classList.add('is-on');
        var chips = a.map(function (f) {
            return '<span class="cmp-tray__chip">' + (f.logo ? '<img src="' + esc(f.logo) + '" alt="">' : '') +
                '<span>' + esc(f.name) + '</span><button type="button" data-cmp-rm="' + esc(f.slug) + '" aria-label="Remove ' + esc(f.name) + ' from comparison">&times;</button></span>';
        }).join('');
        bar.innerHTML = '<div class="cmp-tray__inner"><span class="cmp-tray__title">Compare</span><div class="cmp-tray__chips">' + chips +
            '</div><div class="cmp-tray__actions"><button type="button" class="cmp-tray__clear" data-cmp-clear>Clear</button>' +
            '<a class="cmp-tray__go" href="' + url(a) + '">Compare (' + a.length + ') &rarr;</a></div></div>';
    }

    var toastEl;
    function toast(m) {
        if (!toastEl) { toastEl = document.createElement('div'); toastEl.className = 'cmp-toast'; toastEl.setAttribute('role', 'status'); document.body.appendChild(toastEl); }
        toastEl.textContent = m; toastEl.classList.add('is-on');
        clearTimeout(toastEl._t); toastEl._t = setTimeout(function () { toastEl.classList.remove('is-on'); }, 2200);
    }

    document.addEventListener('click', function (e) {
        var add = e.target.closest && e.target.closest('[data-compare-add]');
        if (add) { e.preventDefault(); toggle(add.getAttribute('data-compare-add'), add.getAttribute('data-compare-name'), add.getAttribute('data-compare-logo')); return; }
        var rm = e.target.closest && e.target.closest('[data-cmp-rm]');
        if (rm) { e.preventDefault(); remove(rm.getAttribute('data-cmp-rm')); return; }
        if (e.target.closest && e.target.closest('[data-cmp-clear]')) { e.preventDefault(); clear(); }
    });

    function init() { seedFromUrl(); render(); syncButtons(); }
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
