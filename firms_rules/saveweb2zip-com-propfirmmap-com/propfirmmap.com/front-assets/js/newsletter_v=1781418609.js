(function() {
    'use strict';

    // Read the XSRF-TOKEN cookie set on every Laravel response. This is
    // refreshed per-session even when full-page caching returns a stale
    // `_token` in the form HTML, so sending it as X-XSRF-TOKEN guarantees
    // CSRF validation always uses the live session's token.
    function getXsrfTokenFromCookie() {
        var match = document.cookie.match(/(?:^|;\s*)XSRF-TOKEN=([^;]+)/);
        return match ? decodeURIComponent(match[1]) : null;
    }

    // After a guest subscribes, offer a one-tap "create a free account" upsell
    // so the newsletter audience converts into durable registered users. Renders
    // nothing for logged-in users or when the config is absent.
    function maybeRenderBridge(msgContainer, source, already) {
        var cfg = window.PFM_NL_BRIDGE;
        if (!cfg || !cfg.guest || !cfg.url) return;
        if (msgContainer.querySelector('.newsletter-bridge')) return;

        function bridgeTrack(eventType) {
            var meta = { source: 'newsletter_register_bridge', placement: source || 'unknown' };
            if (window.pfmTrack) {
                window.pfmTrack(eventType, { metadata: meta });
            } else {
                (window._pfmQ = window._pfmQ || []).push([eventType, { metadata: meta }]);
            }
        }

        var sep = cfg.url.indexOf('?') === -1 ? '?' : '&';
        var href = cfg.url + sep + 'intent=alerts&source=newsletter_bridge&placement='
            + encodeURIComponent(source || 'unknown');

        var bridge = document.createElement('div');
        bridge.className = 'newsletter-bridge';
        bridge.innerHTML =
            '<div class="newsletter-bridge__icon"><i class="bx bxs-heart"></i></div>'
            + '<div class="newsletter-bridge__body">'
            + '<p class="newsletter-bridge__title">' + (already ? 'Get more from PropFirmMap' : 'You\u2019re in! Want more?') + '</p>'
            + '<p class="newsletter-bridge__sub">Create a free account to save firms, compare side by side, and get personalized price &amp; deal alerts.</p>'
            + '</div>'
            + '<a class="newsletter-bridge__btn" href="' + href + '">Create free account</a>';

        msgContainer.appendChild(bridge);
        bridgeTrack('newsletter_register_bridge_impression');

        var btn = bridge.querySelector('.newsletter-bridge__btn');
        if (btn) {
            btn.addEventListener('click', function() {
                bridgeTrack('newsletter_register_bridge_click');
            });
        }
    }

    document.addEventListener('DOMContentLoaded', function() {
        var forms = document.querySelectorAll('[id$="NewsletterForm"]');

        forms.forEach(function(form) {
            form.addEventListener('submit', function(e) {
                e.preventDefault();

                var btn = form.querySelector('button[type="submit"]');
                var msgContainer = form.nextElementSibling;
                var emailInput = form.querySelector('input[type="email"]');
                var email = emailInput.value.trim();

                if (!email) return;

                // Disable button
                var originalHTML = btn.innerHTML;
                btn.disabled = true;
                btn.innerHTML = '<i class="fa fa-spinner fa-spin"></i> Subscribing...';

                // Clear previous messages
                if (msgContainer) msgContainer.innerHTML = '';

                var formData = new FormData(form);
                var source = (form.querySelector('input[name="source"]') || {}).value || 'unknown';

                function track(eventType, extra) {
                    var meta = { source: source };
                    if (extra) { for (var k in extra) meta[k] = extra[k]; }
                    if (window.pfmTrack) {
                        window.pfmTrack(eventType, { metadata: meta });
                    } else {
                        (window._pfmQ = window._pfmQ || []).push([eventType, { metadata: meta }]);
                    }
                }

                track('newsletter_signup_attempt');

                var headers = {
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest'
                };
                var xsrf = getXsrfTokenFromCookie();
                if (xsrf) {
                    headers['X-XSRF-TOKEN'] = xsrf;
                    // The cached _token in the form is stale on LiteSpeed-cached pages
                    // and will fail token_match. Drop it so Laravel falls through to
                    // X-XSRF-TOKEN (decrypted from the live session cookie).
                    formData.delete('_token');
                }

                axios.post(form.action, formData, { headers: headers })
                    .then(function(response) {
                        var data = response.data;
                        if (msgContainer) {
                            msgContainer.innerHTML = '<div class="newsletter-alert newsletter-alert--success"><i class="fa fa-check-circle"></i> ' + data.message + '</div>';
                            maybeRenderBridge(msgContainer, source, data.already);
                        }
                        emailInput.value = '';
                        track('newsletter_signup', { outcome: data.already ? 'already' : 'success' });
                    })
                    .catch(function(error) {
                        var message = 'Something went wrong. Please try again.';
                        if (error.response && error.response.data && error.response.data.message) {
                            message = error.response.data.message;
                        }
                        if (msgContainer) {
                            msgContainer.innerHTML = '<div class="newsletter-alert newsletter-alert--error"><i class="fa fa-exclamation-circle"></i> ' + message + '</div>';
                        }
                        track('newsletter_signup_error', {
                            status: error.response ? error.response.status : 0,
                            error: message.substring(0, 120)
                        });
                    })
                    .finally(function() {
                        btn.disabled = false;
                        btn.innerHTML = originalHTML;
                    });
            });
        });
    });
})();
