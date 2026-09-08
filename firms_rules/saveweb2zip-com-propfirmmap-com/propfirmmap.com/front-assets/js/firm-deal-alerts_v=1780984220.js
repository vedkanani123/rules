/**
 * Per-firm Deal Alerts - front-end behaviors
 *
 * Two surfaces:
 *  1. Bell-icon trigger buttons (rendered by partials/firm-deal-alert-button.blade.php)
 *     anywhere a firm card lives. Clicking opens a small inline popover anchored
 *     to the button with an email field.
 *
 *  2. Embedded subscribe forms (rendered by partials/firm-deal-alert-card.blade.php)
 *     that already have the email input visible inline (firm show page slot).
 *     We just attach a submit handler that posts via fetch.
 */
(function () {
    'use strict';

    function getXsrfTokenFromCookie() {
        var match = document.cookie.match(/(?:^|;\s*)XSRF-TOKEN=([^;]+)/);
        return match ? decodeURIComponent(match[1]) : null;
    }

    function track(eventType, metadata) {
        var meta = metadata || {};
        if (window.pfmTrack) {
            window.pfmTrack(eventType, { metadata: meta });
        } else {
            (window._pfmQ = window._pfmQ || []).push([eventType, { metadata: meta }]);
        }
    }

    function postSubscribe(slug, email, source) {
        var url = '/firm-deal-alerts/' + encodeURIComponent(slug) + '/subscribe';
        var body = new FormData();
        body.append('email', email);
        body.append('source', source || 'firm_card');

        var headers = {
            'Accept': 'application/json',
            'X-Requested-With': 'XMLHttpRequest'
        };
        var xsrf = getXsrfTokenFromCookie();
        if (xsrf) {
            headers['X-XSRF-TOKEN'] = xsrf;
        }

        return fetch(url, {
            method: 'POST',
            headers: headers,
            credentials: 'same-origin',
            body: body
        }).then(function (resp) {
            return resp.json().then(function (data) {
                return { status: resp.status, body: data };
            }).catch(function () {
                return { status: resp.status, body: { success: false, message: 'Unexpected response.' } };
            });
        });
    }

    // ------------------------------------------------------------------
    // 1. POPOVER - bell button → inline mini form
    // ------------------------------------------------------------------
    var openPopover = null;

    function closeAllPopovers() {
        Array.prototype.forEach.call(document.querySelectorAll('.firm-deal-alert-popover'), function (el) {
            el.remove();
        });
        openPopover = null;
    }

    function buildPopover(btn) {
        var slug = btn.getAttribute('data-firm-slug');
        var firmName = btn.getAttribute('data-firm-name') || 'this firm';
        var source = btn.getAttribute('data-source') || 'firm_card';

        var popover = document.createElement('div');
        popover.className = 'firm-deal-alert-popover';
        popover.setAttribute('role', 'dialog');
        popover.setAttribute('aria-label', 'Subscribe to ' + firmName + ' deal alerts');
        popover.innerHTML =
            '<div class="firm-deal-alert-popover__title">' +
                '<i class="bx bxs-bell-ring" aria-hidden="true"></i>' +
                'Get ' + escapeHtml(firmName) + ' deal alerts' +
            '</div>' +
            '<div class="firm-deal-alert-popover__sub">' +
                "We'll email you the next time " + escapeHtml(firmName) + ' adds a deal or raises a discount.' +
            '</div>' +
            '<form class="firm-deal-alert-popover__form" novalidate>' +
                '<input type="email" required placeholder="your@email.com" autocomplete="email" class="firm-deal-alert-popover__input" aria-label="Email address">' +
                '<button type="submit" class="firm-deal-alert-popover__btn">Alert me</button>' +
            '</form>' +
            '<div class="firm-deal-alert-popover__msg" aria-live="polite"></div>' +
            '<button type="button" class="firm-deal-alert-popover__close" aria-label="Close">&times;</button>';

        document.body.appendChild(popover);
        positionPopover(popover, btn);

        var form = popover.querySelector('form');
        var input = popover.querySelector('input[type=email]');
        var msg = popover.querySelector('.firm-deal-alert-popover__msg');
        var submitBtn = popover.querySelector('button[type=submit]');
        var closeBtn = popover.querySelector('.firm-deal-alert-popover__close');

        setTimeout(function () { input.focus(); }, 30);

        closeBtn.addEventListener('click', closeAllPopovers);

        form.addEventListener('submit', function (e) {
            e.preventDefault();
            var email = input.value.trim();
            if (!email) return;
            submitBtn.disabled = true;
            var oldText = submitBtn.textContent;
            submitBtn.textContent = '...';
            msg.innerHTML = '';

            track('firm_deal_alert_attempt', { firm_slug: slug, source: source });

            postSubscribe(slug, email, source).then(function (res) {
                submitBtn.disabled = false;
                submitBtn.textContent = oldText;
                if (res.status >= 200 && res.status < 300 && res.body.success) {
                    msg.innerHTML = '<div class="firm-deal-alert-popover__alert is-success"><i class="bx bx-check-circle" aria-hidden="true"></i> ' + escapeHtml(res.body.message) + '</div>';
                    input.value = '';
                    btn.classList.add('is-subscribed');
                    track('firm_deal_alert_signup', {
                        firm_slug: slug,
                        source: source,
                        outcome: res.body.already ? 'already' : 'success'
                    });
                    setTimeout(closeAllPopovers, 2400);
                } else {
                    var m = (res.body && res.body.message) || 'Could not subscribe. Please try again.';
                    msg.innerHTML = '<div class="firm-deal-alert-popover__alert is-error"><i class="bx bx-error-circle" aria-hidden="true"></i> ' + escapeHtml(m) + '</div>';
                    track('firm_deal_alert_error', { firm_slug: slug, source: source, status: res.status });
                }
            }).catch(function () {
                submitBtn.disabled = false;
                submitBtn.textContent = oldText;
                msg.innerHTML = '<div class="firm-deal-alert-popover__alert is-error"><i class="bx bx-error-circle" aria-hidden="true"></i> Network error. Please try again.</div>';
                track('firm_deal_alert_error', { firm_slug: slug, source: source, status: 0 });
            });
        });

        return popover;
    }

    function positionPopover(popover, btn) {
        var rect = btn.getBoundingClientRect();
        var popoverWidth = 320;
        var top = rect.bottom + window.scrollY + 8;
        var left = rect.left + window.scrollX + (rect.width / 2) - (popoverWidth / 2);
        var maxLeft = window.scrollX + window.innerWidth - popoverWidth - 12;
        if (left > maxLeft) left = maxLeft;
        if (left < window.scrollX + 12) left = window.scrollX + 12;
        popover.style.top = top + 'px';
        popover.style.left = left + 'px';
    }

    function escapeHtml(s) {
        return String(s == null ? '' : s)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    document.addEventListener('click', function (e) {
        var btn = e.target.closest('[data-action="firm-deal-alert"]');
        if (btn) {
            e.preventDefault();
            e.stopPropagation();
            // Toggle: if popover open for this button, close it
            if (openPopover && openPopover._owner === btn) {
                closeAllPopovers();
                return;
            }
            closeAllPopovers();
            openPopover = buildPopover(btn);
            openPopover._owner = btn;
            track('firm_deal_alert_open', {
                firm_slug: btn.getAttribute('data-firm-slug'),
                source: btn.getAttribute('data-source') || 'firm_card'
            });
            return;
        }

        // click outside an open popover closes it
        if (openPopover && !e.target.closest('.firm-deal-alert-popover')) {
            closeAllPopovers();
        }
    });

    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && openPopover) {
            closeAllPopovers();
        }
    });

    window.addEventListener('resize', function () {
        if (openPopover && openPopover._owner) {
            positionPopover(openPopover, openPopover._owner);
        }
    });

    // ------------------------------------------------------------------
    // 2. INLINE form on firm show page (data-firm-deal-alert-form)
    // ------------------------------------------------------------------
    document.addEventListener('DOMContentLoaded', function () {
        Array.prototype.forEach.call(document.querySelectorAll('[data-firm-deal-alert-form]'), function (form) {
            var card = form.closest('.firm-deal-alert-card');
            if (!card) return;
            var slug = card.getAttribute('data-firm-slug');
            var source = card.getAttribute('data-source') || 'firm_show';
            var msg = card.querySelector('[data-firm-deal-alert-msg]');
            var submitBtn = form.querySelector('button[type=submit]');
            var input = form.querySelector('input[type=email]');

            form.addEventListener('submit', function (e) {
                e.preventDefault();
                var email = input.value.trim();
                if (!email) return;
                var oldHtml = submitBtn.innerHTML;
                submitBtn.disabled = true;
                submitBtn.innerHTML = '<i class="bx bx-loader-alt bx-spin" aria-hidden="true"></i><span>Subscribing...</span>';
                if (msg) msg.innerHTML = '';

                track('firm_deal_alert_attempt', { firm_slug: slug, source: source });

                postSubscribe(slug, email, source).then(function (res) {
                    submitBtn.disabled = false;
                    submitBtn.innerHTML = oldHtml;
                    if (res.status >= 200 && res.status < 300 && res.body.success) {
                        if (msg) {
                            msg.innerHTML = '<div class="firm-deal-alert-card__alert is-success"><i class="bx bx-check-circle" aria-hidden="true"></i> ' + escapeHtml(res.body.message) + '</div>';
                        }
                        input.value = '';
                        track('firm_deal_alert_signup', {
                            firm_slug: slug,
                            source: source,
                            outcome: res.body.already ? 'already' : 'success'
                        });
                    } else {
                        var m = (res.body && res.body.message) || 'Could not subscribe. Please try again.';
                        if (msg) {
                            msg.innerHTML = '<div class="firm-deal-alert-card__alert is-error"><i class="bx bx-error-circle" aria-hidden="true"></i> ' + escapeHtml(m) + '</div>';
                        }
                        track('firm_deal_alert_error', { firm_slug: slug, source: source, status: res.status });
                    }
                }).catch(function () {
                    submitBtn.disabled = false;
                    submitBtn.innerHTML = oldHtml;
                    if (msg) {
                        msg.innerHTML = '<div class="firm-deal-alert-card__alert is-error"><i class="bx bx-error-circle" aria-hidden="true"></i> Network error. Please try again.</div>';
                    }
                });
            });
        });
    });
})();
