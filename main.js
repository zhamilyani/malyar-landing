// ===== MALYAR PRO — Main JS =====

document.addEventListener('DOMContentLoaded', () => {

    // ===== HEADER SCROLL =====
    const header = document.getElementById('header');
    let lastScroll = 0;

    window.addEventListener('scroll', () => {
        const scrollY = window.scrollY;
        header.classList.toggle('header--scrolled', scrollY > 50);
        lastScroll = scrollY;
    }, { passive: true });

    // ===== BURGER MENU =====
    const burger = document.getElementById('burger');
    const nav = document.getElementById('nav');

    burger.addEventListener('click', () => {
        burger.classList.toggle('active');
        nav.classList.toggle('active');
        document.body.style.overflow = nav.classList.contains('active') ? 'hidden' : '';
    });

    // Close menu on link click
    nav.querySelectorAll('.header__link').forEach(link => {
        link.addEventListener('click', () => {
            burger.classList.remove('active');
            nav.classList.remove('active');
            document.body.style.overflow = '';
        });
    });

    // ===== SCROLL ANIMATIONS (IntersectionObserver) =====
    const animatedElements = document.querySelectorAll('.animate-up');

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                // Stagger animations for siblings
                const parent = entry.target.parentElement;
                const siblings = parent.querySelectorAll('.animate-up');
                let delay = 0;

                siblings.forEach((sibling) => {
                    if (sibling === entry.target) {
                        setTimeout(() => {
                            entry.target.classList.add('visible');
                        }, delay);
                    }
                    delay += 100;
                });

                // Fallback: add visible after short delay
                setTimeout(() => {
                    entry.target.classList.add('visible');
                }, 150);

                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -40px 0px'
    });

    animatedElements.forEach(el => observer.observe(el));

    // ===== FAQ ACCORDION =====
    document.querySelectorAll('.faq-item__question').forEach(btn => {
        btn.addEventListener('click', () => {
            const item = btn.parentElement;
            const wasActive = item.classList.contains('active');

            // Close all
            document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('active'));

            // Toggle clicked
            if (!wasActive) {
                item.classList.add('active');
            }
        });
    });

    // ===== CALCULATOR =====
    const calcTbody = document.getElementById('calc-tbody');
    const addRowBtn = document.getElementById('calc-add-row');
    const rowModal = document.getElementById('row-modal');

    const PRIMER_PRICE = 6000;
    const COATING_LABELS = { matte: 'Матовая эмаль', gloss: 'Глянцевая эмаль', highgloss: 'Высокий глянец', patina: 'Патина', tint_lac: 'Тонировка + лак', lac: 'Лак' };
    const COATING_PRICES = { matte: 18000, gloss: 22000, highgloss: 30000, patina: 28000, tint_lac: 18000, lac: 10000 };
    const PAINTING_LABELS = { '': '—', straight: 'Прямые', milled: 'Фрезированные' };
    const CNC_LABELS = { '': '—', our_mdf: 'Наш МДФ', your_mdf: 'Ваш МДФ' };

    let editingRow = null;

    function formatPrice(num) {
        return num.toLocaleString('ru-RU') + ' ₸';
    }

    // --- Row data stored on TR element ---
    function createRow() {
        const tr = document.createElement('tr');
        const idx = calcTbody.querySelectorAll('tr').length + 1;
        tr.dataset.room = '';
        tr.dataset.thickness = '16';
        tr.dataset.height = '';
        tr.dataset.width = '';
        tr.dataset.qty = '1';
        tr.dataset.frezSample = '';
        tr.dataset.frezComment = '';
        tr.dataset.colorSample = '';
        tr.dataset.colorComment = '';
        tr.dataset.painting = '';
        tr.dataset.cnc = '';
        tr.dataset.coating = 'matte';
        tr.dataset.coatingPrice = '18000';
        tr.dataset.prisadka = 'false';
        tr.dataset.holes = '';

        tr.innerHTML = `
            <td class="cell-num">${idx}</td>
            <td class="cell-room">—</td>
            <td class="cell-height">—</td>
            <td class="cell-width">—</td>
            <td class="cell-qty">1</td>
            <td class="cell-sqm">—</td>
            <td class="cell-coating">Матовая эмаль</td>
            <td class="cell-cost">—</td>
            <td><button type="button" class="row-delete-btn" title="Удалить">✕</button></td>
        `;
        calcTbody.appendChild(tr);

        tr.addEventListener('click', (e) => {
            if (e.target.closest('.row-delete-btn')) return;
            openRowModal(tr);
        });
        tr.querySelector('.row-delete-btn').addEventListener('click', (e) => {
            e.stopPropagation();
            tr.remove();
            renumberRows();
            recalcAll();
        });

        recalcAll();
        return tr;
    }

    function renumberRows() {
        calcTbody.querySelectorAll('tr').forEach((tr, i) => {
            tr.querySelector('.cell-num').textContent = i + 1;
        });
    }

    function updateRowDisplay(tr) {
        const d = tr.dataset;
        tr.querySelector('.cell-room').textContent = d.room || '—';
        tr.querySelector('.cell-height').textContent = d.height || '—';
        tr.querySelector('.cell-width').textContent = d.width || '—';
        tr.querySelector('.cell-qty').textContent = d.qty || '1';
        tr.querySelector('.cell-coating').textContent = COATING_LABELS[d.coating] || 'Матовая эмаль';
    }

    // --- Modal open/close ---
    function openRowModal(tr) {
        editingRow = tr;
        const d = tr.dataset;
        const idx = Array.from(calcTbody.querySelectorAll('tr')).indexOf(tr) + 1;
        document.getElementById('row-modal-num').textContent = '№' + idx;

        document.getElementById('rm-room').value = d.room;
        document.getElementById('rm-thickness').value = d.thickness;
        document.getElementById('rm-height').value = d.height;
        document.getElementById('rm-width').value = d.width;
        document.getElementById('rm-qty').value = d.qty || '1';
        document.getElementById('rm-frez-sample').value = d.frezSample;
        document.getElementById('rm-frez-comment').value = d.frezComment;
        document.getElementById('rm-color-sample').value = d.colorSample;
        document.getElementById('rm-color-comment').value = d.colorComment;
        document.getElementById('rm-coating').value = d.coating;
        document.getElementById('rm-painting').value = d.painting;
        document.getElementById('rm-cnc').value = d.cnc;
        document.getElementById('rm-prisadka').checked = d.prisadka === 'true';
        document.getElementById('rm-holes').value = d.holes;
        document.getElementById('rm-holes-wrap').style.display = d.prisadka === 'true' ? '' : 'none';

        rowModal.classList.add('active');
        document.body.style.overflow = 'hidden';
        requestAnimationFrame(() => {
            requestAnimationFrame(() => rowModal.classList.add('visible'));
        });
    }

    function closeRowModal() {
        rowModal.classList.remove('visible');
        setTimeout(() => {
            rowModal.classList.remove('active');
            document.body.style.overflow = '';
        }, 300);
        editingRow = null;
    }

    function saveRowModal() {
        if (!editingRow) return;
        const d = editingRow.dataset;
        d.room = document.getElementById('rm-room').value;
        d.thickness = document.getElementById('rm-thickness').value;
        d.height = document.getElementById('rm-height').value;
        d.width = document.getElementById('rm-width').value;
        d.qty = document.getElementById('rm-qty').value || '1';
        d.frezSample = document.getElementById('rm-frez-sample').value;
        d.frezComment = document.getElementById('rm-frez-comment').value;
        d.colorSample = document.getElementById('rm-color-sample').value;
        d.colorComment = document.getElementById('rm-color-comment').value;
        const coatingEl = document.getElementById('rm-coating');
        d.coating = coatingEl.value;
        d.coatingPrice = coatingEl.options[coatingEl.selectedIndex].dataset.price;
        d.painting = document.getElementById('rm-painting').value;
        d.cnc = document.getElementById('rm-cnc').value;
        d.prisadka = document.getElementById('rm-prisadka').checked ? 'true' : 'false';
        d.holes = d.prisadka === 'true' ? document.getElementById('rm-holes').value : '';

        updateRowDisplay(editingRow);
        recalcAll();
        closeRowModal();
    }

    document.getElementById('row-modal-close').addEventListener('click', closeRowModal);
    rowModal.addEventListener('click', (e) => { if (e.target === e.currentTarget) closeRowModal(); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && rowModal.classList.contains('active')) closeRowModal(); });
    document.getElementById('rm-prisadka').addEventListener('change', (e) => {
        document.getElementById('rm-holes-wrap').style.display = e.target.checked ? '' : 'none';
    });
    document.getElementById('rm-save').addEventListener('click', saveRowModal);

    // --- Calculations ---
    function recalcAll() {
        let totalQty = 0;
        let totalSqm = 0;
        let totalCost = 0;

        calcTbody.querySelectorAll('tr').forEach(tr => {
            const d = tr.dataset;
            const h = parseFloat(d.height) || 0;
            const w = parseFloat(d.width) || 0;
            const qty = parseInt(d.qty) || 0;
            const hasPrimer = d.prisadka === 'true';
            const pricePerM2 = parseInt(d.coatingPrice) || COATING_PRICES[d.coating] || 18000;

            const sqm = (h * w * qty) / 1000000;
            const unitPrice = pricePerM2 + (hasPrimer ? PRIMER_PRICE : 0);
            const cost = sqm * unitPrice;

            tr.querySelector('.cell-sqm').textContent = sqm > 0 ? sqm.toFixed(3) : '—';
            tr.querySelector('.cell-cost').textContent = cost > 0 ? formatPrice(Math.round(cost)) : '—';

            totalQty += qty;
            totalSqm += sqm;
            totalCost += cost;
        });

        document.getElementById('total-qty').textContent = totalQty || 0;
        document.getElementById('total-sqm').textContent = totalSqm > 0 ? totalSqm.toFixed(3) : '0';
        document.getElementById('total-cost').innerHTML = '<strong>' + formatPrice(Math.round(totalCost)) + '</strong>';

        updateWhatsApp(totalSqm, totalCost);
    }

    function updateWhatsApp(totalSqm, totalCost) {
        const rows = [];
        calcTbody.querySelectorAll('tr').forEach((tr, i) => {
            const d = tr.dataset;
            const sqm = tr.querySelector('.cell-sqm').textContent;
            const cost = tr.querySelector('.cell-cost').textContent;
            const coating = COATING_LABELS[d.coating] || 'Матовая эмаль';
            let line = `${i+1}. ${d.room || '—'}: ${d.height || '—'}×${d.width || '—'}мм ×${d.qty || 1}шт = ${sqm}м²`;
            line += `, покрытие: ${coating}, цвет: ${d.colorSample || '—'}, ${cost}`;
            if (d.painting) line += `, покраска: ${PAINTING_LABELS[d.painting]}`;
            if (d.cnc) line += `, ЧПУ: ${CNC_LABELS[d.cnc]}`;
            if (d.prisadka === 'true') line += `, присадка: да (${d.holes || '—'} отв.)`;
            rows.push(line);
        });

        let msg = `Здравствуйте! Заказ на покраску фасадов.\n\n`;
        msg += rows.join('\n');
        msg += `\n\nИТОГО: ${totalSqm.toFixed(3)} м², ${formatPrice(Math.round(totalCost))}`;

        document.getElementById('calc-order').href =
            `https://wa.me/77074014040?text=${encodeURIComponent(msg)}`;
    }

    addRowBtn.addEventListener('click', () => createRow());

    document.getElementById('calc-upload').addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const msg = `Здравствуйте! Хочу отправить файл с деталями заказа: ${file.name}`;
        window.open(`https://wa.me/77074014040?text=${encodeURIComponent(msg)}`, '_blank');
        e.target.value = '';
    });

    // Init with 3 rows
    createRow();
    createRow();
    createRow();

    // ===== CONTACT FORM =====
    const contactForm = document.getElementById('contact-form');

    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const name = document.getElementById('form-name').value.trim();
        const phone = document.getElementById('form-phone').value.trim();
        const service = document.getElementById('form-service').value;
        const comment = document.getElementById('form-comment').value.trim();

        if (!name || !phone) {
            alert('Заполните имя и телефон');
            return;
        }

        let msg = `Заявка с сайта MALYAR PRO\n\nИмя: ${name}\nТелефон: ${phone}`;
        if (service) msg += `\nУслуга: ${service}`;
        if (comment) msg += `\nКомментарий: ${comment}`;

        window.open(`https://wa.me/77074014040?text=${encodeURIComponent(msg)}`, '_blank');

        contactForm.reset();
    });

    // ===== SMOOTH SCROLL for anchor links =====
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;

            const target = document.querySelector(targetId);
            if (target) {
                e.preventDefault();
                target.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });

});
