// ===== CRM ENDPOINT =====
// Точка приёма заявок с лендинга. Если переедем на другой домен — менять только тут.
window.CRM_URL = 'https://malyar-crm-production.up.railway.app';

// ===== GOOGLE ADS CONVERSION TRACKING =====
(function() {
    var CONV_ID = 'AW-18095965049';
    var LABELS = {
        call:     '9pHpCI2Av68cEPmG6rRD',
        whatsapp: 'N1RnCNGdv68cEPmG6rRD',
        calc:     '5o-ICLPVpa8cEPmG6rRD',
        form:     '3TD5CMrDv68cEPmG6rRD'
    };

    // --- Enhanced Conversions normalizers ---
    // KZ phone → E.164. Returns null on invalid.
    window.normalizePhone = function(raw) {
        if (!raw) return null;
        var digits = String(raw).replace(/\D/g, '');
        if (digits.length < 10) return null;
        // 8XXXXXXXXXX → 7XXXXXXXXXX
        var normalized = digits.charAt(0) === '8' ? '7' + digits.slice(1) : digits;
        return '+' + normalized;
    };

    // Lowercase + trim. Returns null if empty.
    window.normalizeText = function(raw) {
        if (!raw) return null;
        var s = String(raw).trim().toLowerCase();
        return s.length ? s : null;
    };

    // Lowercase + trim. Returns null if not email-shaped.
    window.normalizeEmail = function(raw) {
        if (!raw) return null;
        var s = String(raw).trim().toLowerCase();
        return s.indexOf('@') > 0 ? s : null;
    };

    // Set user_data for Enhanced Conversions. Pass {phone, email, firstName, lastName}.
    // Skips empty/null fields. address.country always 'KZ' when address present.
    // Must be called BEFORE trackConversion.
    window.setUserData = function(data) {
        if (typeof gtag !== 'function' || !data) return;
        var u = {};
        if (data.email) u.email = data.email;
        if (data.phone) u.phone_number = data.phone;
        var addr = {};
        if (data.firstName) addr.first_name = data.firstName;
        if (data.lastName)  addr.last_name  = data.lastName;
        if (addr.first_name || addr.last_name) {
            addr.country = 'KZ';
            u.address = addr;
        }
        if (!Object.keys(u).length) return;
        try { gtag('set', 'user_data', u); } catch (_) {}
    };

    // Send conversion. value optional (number). Currency always USD per Ads account setup.
    window.trackConversion = function(type, value) {
        if (typeof gtag !== 'function') return;
        var label = LABELS[type];
        if (!label) return;
        try {
            gtag('event', 'conversion', {
                send_to:  CONV_ID + '/' + label,
                value:    typeof value === 'number' ? value : 0,
                currency: 'USD'
            });
        } catch (_) {}
    };

    // Auto-track tel: and WhatsApp link clicks (works site-wide for any link).
    // No user_data — we don't know who's clicking.
    document.addEventListener('click', function(e) {
        var link = e.target.closest && e.target.closest('a');
        if (!link) return;
        var href = link.getAttribute('href') || '';
        if (href.indexOf('tel:') === 0) {
            window.trackConversion('call', 0);
        } else if (href.indexOf('wa.me/') !== -1 || href.indexOf('api.whatsapp.com') !== -1) {
            window.trackConversion('whatsapp', 0);
        }
    }, true);
})();

// ===== ANIMATE-UP OBSERVER (нужен на ВСЕХ страницах, не только тех что грузят main.js) =====
(function() {
    function initAnimateUp() {
        const animatedElements = document.querySelectorAll('.animate-up');
        if (!animatedElements.length) return;

        if (!('IntersectionObserver' in window)) {
            animatedElements.forEach(el => el.classList.add('visible'));
            return;
        }

        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

        animatedElements.forEach(el => observer.observe(el));

        // Safety net: после 1.5с принудительно показать всё, что ещё скрыто.
        setTimeout(() => {
            document.querySelectorAll('.animate-up:not(.visible)').forEach(el => el.classList.add('visible'));
        }, 1500);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initAnimateUp);
    } else {
        initAnimateUp();
    }
})();

// ===== THEME & LANGUAGE TOGGLE =====

(function() {
    // ===== THEME =====
    const savedTheme = localStorage.getItem('mp-theme') || 'dark';
    if (savedTheme === 'light') document.body.classList.add('light');

    window.initThemeToggle = function(btn) {
        if (!btn) return;
        updateThemeIcon(btn);
        btn.addEventListener('click', () => {
            document.body.classList.toggle('light');
            const isLight = document.body.classList.contains('light');
            localStorage.setItem('mp-theme', isLight ? 'light' : 'dark');
            updateThemeIcon(btn);
        });
    };

    function updateThemeIcon(btn) {
        const isLight = document.body.classList.contains('light');
        btn.innerHTML = isLight
            ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/></svg>'
            : '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>';
    }

    // ===== LANGUAGE =====
    const savedLang = localStorage.getItem('mp-lang') || 'ru';

    window.initLangToggle = function(btn) {
        if (!btn) return;
        updateLangBtn(btn);
        btn.addEventListener('click', () => {
            const current = localStorage.getItem('mp-lang') || 'ru';
            const next = current === 'ru' ? 'kz' : 'ru';
            localStorage.setItem('mp-lang', next);
            updateLangBtn(btn);
            applyLang(next);
        });
        applyLang(savedLang);
    };

    function updateLangBtn(btn) {
        const lang = localStorage.getItem('mp-lang') || 'ru';
        btn.textContent = lang === 'ru' ? 'ҚАЗ' : 'РУС';
    }

    function applyLang(lang) {
        document.querySelectorAll('[data-ru]').forEach(el => {
            const text = lang === 'kz' ? (el.getAttribute('data-kz') || el.getAttribute('data-ru')) : el.getAttribute('data-ru');
            if ((el.tagName === 'INPUT' && el.type !== 'checkbox') || el.tagName === 'TEXTAREA') {
                if (el.placeholder) el.placeholder = text;
            } else if (el.tagName === 'OPTION') {
                el.textContent = text;
            } else {
                el.innerHTML = text;
            }
        });
        document.documentElement.lang = lang === 'kz' ? 'kk' : 'ru';
    }
})();
