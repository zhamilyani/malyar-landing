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
