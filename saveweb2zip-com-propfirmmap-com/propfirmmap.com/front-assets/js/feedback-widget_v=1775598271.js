(function () {
    'use strict';

    var selectedType = 'suggestion';
    var isOpen = false;
    var isSubmitting = false;

    function getCSRFToken() {
        var meta = document.querySelector('meta[name="csrf-token"]');
        return meta ? meta.getAttribute('content') : '';
    }

    function openWidget() {
        var modal = document.getElementById('feedbackModal');
        var overlay = document.getElementById('feedbackOverlay');
        if (!modal || !overlay) return;
        modal.classList.add('active');
        overlay.classList.add('active');
        isOpen = true;
    }

    function closeWidget() {
        var modal = document.getElementById('feedbackModal');
        var overlay = document.getElementById('feedbackOverlay');
        if (!modal || !overlay) return;
        modal.classList.remove('active');
        overlay.classList.remove('active');
        isOpen = false;
    }

    function resetForm() {
        var textarea = document.getElementById('feedbackMessage');
        var email = document.getElementById('feedbackEmail');
        var errorEl = document.getElementById('feedbackError');
        var charcount = document.getElementById('feedbackCharcount');
        if (textarea) textarea.value = '';
        if (email) email.value = '';
        if (errorEl) {
            errorEl.textContent = '';
            errorEl.classList.remove('visible');
        }
        if (charcount) charcount.textContent = '0 / 2000';
        selectedType = 'suggestion';
        updateTypeButtons();
    }

    function showSuccess() {
        var body = document.getElementById('feedbackBody');
        if (!body) return;
        body.innerHTML =
            '<div class="feedback-success">' +
            '  <div class="feedback-success__icon">' +
            '    <svg viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>' +
            '  </div>' +
            '  <div class="feedback-success__title">Thank you!</div>' +
            '  <div class="feedback-success__text">Your feedback helps us improve PropFirmMap.</div>' +
            '</div>';

        setTimeout(function () {
            closeWidget();
            setTimeout(function () {
                rebuildForm();
            }, 300);
        }, 2200);
    }

    function rebuildForm() {
        var body = document.getElementById('feedbackBody');
        if (!body) return;
        body.innerHTML =
            '<div class="feedback-types">' +
            '  <button class="feedback-type-btn" data-type="bug">Bug</button>' +
            '  <button class="feedback-type-btn selected" data-type="suggestion">Suggestion</button>' +
            '  <button class="feedback-type-btn" data-type="compliment">Compliment</button>' +
            '  <button class="feedback-type-btn" data-type="other">Other</button>' +
            '</div>' +
            '<textarea class="feedback-textarea" id="feedbackMessage" placeholder="Please describe your feedback in detail (min 50 characters)..." maxlength="2000" minlength="50"></textarea>' +
            '<div class="feedback-charcount" id="feedbackCharcount">0 / 2000</div>' +
            '<input type="email" class="feedback-email" id="feedbackEmail" placeholder="Email (optional, for follow-up)">' +
            '<div class="feedback-error" id="feedbackError"></div>' +
            '<button class="feedback-submit" id="feedbackSubmit">Send Feedback</button>';

        selectedType = 'suggestion';
        bindFormEvents();
    }

    function updateTypeButtons() {
        var btns = document.querySelectorAll('.feedback-type-btn');
        for (var i = 0; i < btns.length; i++) {
            if (btns[i].getAttribute('data-type') === selectedType) {
                btns[i].classList.add('selected');
            } else {
                btns[i].classList.remove('selected');
            }
        }
    }

    function showError(msg) {
        var errorEl = document.getElementById('feedbackError');
        if (!errorEl) return;
        errorEl.textContent = msg;
        errorEl.classList.add('visible');
    }

    function hideError() {
        var errorEl = document.getElementById('feedbackError');
        if (!errorEl) return;
        errorEl.textContent = '';
        errorEl.classList.remove('visible');
    }

    function submitFeedback() {
        if (isSubmitting) return;

        var textarea = document.getElementById('feedbackMessage');
        var email = document.getElementById('feedbackEmail');
        var submitBtn = document.getElementById('feedbackSubmit');
        var message = textarea ? textarea.value.trim() : '';
        var emailVal = email ? email.value.trim() : '';

        hideError();

        if (message.length < 50) {
            showError('Please write at least 50 characters so we can understand and act on your feedback.');
            return;
        }

        if (emailVal && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailVal)) {
            showError('Please enter a valid email address.');
            return;
        }

        isSubmitting = true;
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.textContent = 'Sending...';
        }

        var data = JSON.stringify({
            type: selectedType,
            message: message,
            email: emailVal || null
        });

        var xhr = new XMLHttpRequest();
        xhr.open('POST', '/api/feedback', true);
        xhr.setRequestHeader('Content-Type', 'application/json');
        xhr.setRequestHeader('Accept', 'application/json');
        xhr.setRequestHeader('X-CSRF-TOKEN', getCSRFToken());

        xhr.onload = function () {
            isSubmitting = false;
            if (xhr.status >= 200 && xhr.status < 300) {
                showSuccess();
            } else if (xhr.status === 422) {
                try {
                    var resp = JSON.parse(xhr.responseText);
                    var firstError = Object.values(resp.errors || {})[0];
                    showError(firstError ? firstError[0] : 'Validation error.');
                } catch (e) {
                    showError('Something went wrong. Please try again.');
                }
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.textContent = 'Send Feedback';
                }
            } else if (xhr.status === 429) {
                showError('Too many submissions. Please try again later.');
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.textContent = 'Send Feedback';
                }
            } else {
                showError('Something went wrong. Please try again.');
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.textContent = 'Send Feedback';
                }
            }
        };

        xhr.onerror = function () {
            isSubmitting = false;
            showError('Network error. Please check your connection.');
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.textContent = 'Send Feedback';
            }
        };

        xhr.send(data);
    }

    function bindFormEvents() {
        // Type buttons
        document.addEventListener('click', function (e) {
            if (e.target.classList.contains('feedback-type-btn')) {
                selectedType = e.target.getAttribute('data-type');
                updateTypeButtons();
            }
        });

        // Character count
        var textarea = document.getElementById('feedbackMessage');
        var charcount = document.getElementById('feedbackCharcount');
        if (textarea && charcount) {
            textarea.addEventListener('input', function () {
                charcount.textContent = textarea.value.length + ' / 2000';
            });
        }

        // Submit
        var submitBtn = document.getElementById('feedbackSubmit');
        if (submitBtn) {
            submitBtn.addEventListener('click', function (e) {
                e.preventDefault();
                submitFeedback();
            });
        }
    }

    // Initialize once DOM is ready
    function init() {
        // FAB click
        var fab = document.getElementById('feedbackFab');
        if (fab) {
            fab.addEventListener('click', function () {
                if (isOpen) {
                    closeWidget();
                } else {
                    openWidget();
                }
            });
        }

        // Overlay click
        var overlay = document.getElementById('feedbackOverlay');
        if (overlay) {
            overlay.addEventListener('click', closeWidget);
        }

        // Close button
        var closeBtn = document.getElementById('feedbackClose');
        if (closeBtn) {
            closeBtn.addEventListener('click', closeWidget);
        }

        // Escape key
        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape' && isOpen) {
                closeWidget();
            }
        });

        bindFormEvents();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
