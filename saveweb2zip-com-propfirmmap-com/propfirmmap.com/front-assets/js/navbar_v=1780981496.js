/* OWNER-MANAGED NAVBAR - DO NOT EDIT (autonomous bots: skip this file).
   PropFirmMap floating navbar: search toggle + mobile menu + accordions. */
(function () {
    "use strict";

    function ready(fn) {
        if (document.readyState !== "loading") { fn(); }
        else { document.addEventListener("DOMContentLoaded", fn); }
    }

    ready(function () {
        // --- expanding search ---
        var searchBtn = document.getElementById("pfmSearchBtn");
        var searchPanel = document.getElementById("pfmSearch");
        if (searchBtn && searchPanel) {
            searchBtn.addEventListener("click", function (e) {
                e.preventDefault();
                var open = searchPanel.classList.toggle("pfm-search--open");
                searchBtn.setAttribute("aria-expanded", open ? "true" : "false");
                if (open) {
                    var inp = searchPanel.querySelector("input");
                    if (inp) { setTimeout(function () { inp.focus(); }, 60); }
                }
            });
        }

        // --- mobile menu toggle ---
        var burger = document.getElementById("pfmBurger");
        var mobile = document.getElementById("pfmMobile");
        function closeMobile() {
            if (!mobile || !burger) return;
            mobile.classList.remove("is-open");
            burger.classList.remove("is-open");
            burger.setAttribute("aria-expanded", "false");
            document.body.style.overflow = "";
        }
        if (burger && mobile) {
            burger.addEventListener("click", function () {
                var open = mobile.classList.toggle("is-open");
                burger.classList.toggle("is-open", open);
                burger.setAttribute("aria-expanded", open ? "true" : "false");
                document.body.style.overflow = open ? "hidden" : "";
            });
        }

        // --- mobile accordions (Tools / Top Lists) ---
        var accBtns = document.querySelectorAll(".pfm-mobile__accbtn");
        for (var i = 0; i < accBtns.length; i++) {
            accBtns[i].addEventListener("click", function () {
                var acc = this.closest(".pfm-mobile__acc");
                if (acc) { acc.classList.toggle("is-open"); }
            });
        }

        // --- escape closes search + mobile ---
        document.addEventListener("keydown", function (e) {
            if (e.key === "Escape") {
                if (searchPanel && searchPanel.classList.contains("pfm-search--open")) {
                    searchPanel.classList.remove("pfm-search--open");
                    if (searchBtn) searchBtn.setAttribute("aria-expanded", "false");
                }
                closeMobile();
            }
        });

        // --- close mobile when a real link is tapped ---
        if (mobile) {
            mobile.addEventListener("click", function (e) {
                var a = e.target.closest("a");
                if (a && a.getAttribute("href")) { closeMobile(); }
            });
        }
    });
})();
