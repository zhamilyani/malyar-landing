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

    // === PRICING ===
    const HOLE_PRICE = 1000; // ₸ за одно отверстие присадки

    // База — матовая эмаль МДФ, ₸/м²
    const BASE_MDF = {
        8:  { straight: 21500, milled: 23500 },
        10: { straight: 22500, milled: 24500 },
        12: { straight: 23500, milled: 25500 },
        16: { straight: 24500, milled: 26500 },
        18: { straight: 25500, milled: 27500 },
        22: { straight: 27500, milled: 29500 },
    };
    // Шпон — матовый лак, ₸/м²
    const BASE_VENEER = { straight: 17000, milled: 19000 };
    // Готовые фасады — покраска, ₸/м²
    const BASE_READY = { straight: 20000, milled: 22000 };

    // Доплаты для МДФ и готовых фасадов, ₸/м²
    const SURCHARGE = {
        gloss: 20000,
        lac: 9000,
        patina_simple: 13000,
        patina_gloss50: 22000,
        patina_gloss100: 28000,
    };
    // Доплаты для шпона, ₸/м²
    const SURCHARGE_VENEER = {
        gloss: 20000,       // глянцевый лак
        patina: 8000,       // патина+лак (единый вариант)
    };

    const MATERIAL_LABELS = { mdf: 'МДФ', veneer: 'Шпон', ready: 'Готовые фасады' };
    const FRES_LABELS = { straight: 'прямые', milled: 'фрезерованные' };
    const PATINA_VARIANT_LABELS = {
        simple: 'Простое патинирование',
        gloss50: 'Патина + глянец 50%',
        gloss100: 'Патина + глянец 100%',
    };
    const CNC_LABELS = { '': '—', our_mdf: 'Наш МДФ', your_mdf: 'Ваш МДФ' };

    // Вычисление базовой цены ₸/м²
    function getBasePrice(material, thickness, fres) {
        if (material === 'mdf') return (BASE_MDF[thickness] || BASE_MDF[16])[fres] || 0;
        if (material === 'veneer') return BASE_VENEER[fres] || 0;
        if (material === 'ready') return BASE_READY[fres] || 0;
        return 0;
    }

    // Вычисление доплат ₸/м² по выбранным опциям
    function getSurcharge(material, opts) {
        let sum = 0;
        if (material === 'veneer') {
            if (opts.gloss) sum += SURCHARGE_VENEER.gloss;
            if (opts.patina) sum += SURCHARGE_VENEER.patina;
        } else {
            if (opts.gloss) sum += SURCHARGE.gloss;
            if (opts.lac) sum += SURCHARGE.lac;
            if (opts.patina) {
                const v = opts.patinaVariant || 'simple';
                sum += SURCHARGE['patina_' + v] || SURCHARGE.patina_simple;
            }
        }
        return sum;
    }

    function getBaseLabel(material) {
        if (material === 'mdf') return 'Матовая эмаль';
        if (material === 'veneer') return 'Матовый лак';
        if (material === 'ready') return 'Покраска фасада';
        return '—';
    }

    let editingRow = null;

    function formatPrice(num) {
        return num.toLocaleString('ru-RU') + ' ₸';
    }

    // --- Row data stored on TR element ---
    function createRow() {
        const tr = document.createElement('tr');
        const idx = calcTbody.querySelectorAll('tr').length + 1;
        tr.dataset.room = '';
        tr.dataset.material = 'mdf';
        tr.dataset.thickness = '16';
        tr.dataset.fres = 'straight';
        tr.dataset.height = '';
        tr.dataset.width = '';
        tr.dataset.qty = '1';
        tr.dataset.frezSample = '';
        tr.dataset.frezComment = '';
        tr.dataset.colorSample = '';
        tr.dataset.colorComment = '';
        tr.dataset.cnc = '';
        tr.dataset.gloss = 'false';
        tr.dataset.patina = 'false';
        tr.dataset.patinaVariant = 'simple';
        tr.dataset.lac = 'false';
        tr.dataset.prisadka = 'false';
        tr.dataset.holes = '';
        tr.dataset.holesDrawing = 'false';
        tr.dataset.combined = 'false';
        tr.dataset.color2Sample = '';
        tr.dataset.color2Comment = '';

        tr.innerHTML = `
            <td class="cell-num">${idx}</td>
            <td class="cell-room">—</td>
            <td class="cell-height">—</td>
            <td class="cell-width">—</td>
            <td class="cell-qty">1</td>
            <td class="cell-sqm">—</td>
            <td class="cell-coating">МДФ 16 мм, прямые</td>
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

    function buildCoatingSummary(d) {
        const parts = [];
        if (d.material === 'mdf') parts.push('МДФ ' + (d.thickness || '16') + ' мм');
        else parts.push(MATERIAL_LABELS[d.material] || 'МДФ');
        parts.push(FRES_LABELS[d.fres] || 'прямые');
        const add = [];
        if (d.gloss === 'true') add.push('глянец');
        if (d.patina === 'true') {
            const v = d.material === 'veneer' ? 'патина+лак' : (PATINA_VARIANT_LABELS[d.patinaVariant] || 'патина').toLowerCase();
            add.push(v);
        }
        if (d.lac === 'true' && d.material !== 'veneer') add.push('лак');
        if (add.length) parts.push('+ ' + add.join(', '));
        return parts.join(', ');
    }

    function updateRowDisplay(tr) {
        const d = tr.dataset;
        tr.querySelector('.cell-room').textContent = d.room || '—';
        tr.querySelector('.cell-height').textContent = d.height || '—';
        tr.querySelector('.cell-width').textContent = d.width || '—';
        tr.querySelector('.cell-qty').textContent = d.qty || '1';
        tr.querySelector('.cell-coating').textContent = buildCoatingSummary(d);
    }

    function updateBaseInfo() {
        const material = document.getElementById('rm-material').value;
        document.getElementById('rm-base-info').textContent = getBaseLabel(material);
        // Toggle thickness visibility
        document.getElementById('rm-thickness-wrap').style.display = material === 'mdf' ? '' : 'none';
        // Toggle lac visibility (шпон не имеет отдельного лака)
        document.getElementById('rm-lac-wrap').style.display = material === 'veneer' ? 'none' : '';
        // For шпон — скрываем селект варианта патины (единая опция)
        const patinaChecked = document.getElementById('rm-patina').checked;
        document.getElementById('rm-patina-variant-wrap').style.display =
            (patinaChecked && material !== 'veneer') ? '' : 'none';
    }

    // --- Modal open/close ---
    function openRowModal(tr) {
        editingRow = tr;
        const d = tr.dataset;
        const idx = Array.from(calcTbody.querySelectorAll('tr')).indexOf(tr) + 1;
        document.getElementById('row-modal-num').textContent = '№' + idx;

        document.getElementById('rm-room').value = d.room;
        document.getElementById('rm-material').value = d.material || 'mdf';
        document.getElementById('rm-thickness').value = d.thickness || '16';
        document.getElementById('rm-fres').value = d.fres || 'straight';
        document.getElementById('rm-height').value = d.height;
        document.getElementById('rm-width').value = d.width;
        document.getElementById('rm-qty').value = d.qty || '1';
        document.getElementById('rm-frez-sample').value = d.frezSample;
        document.getElementById('rm-frez-comment').value = d.frezComment;
        document.getElementById('rm-color-sample').value = d.colorSample;
        document.getElementById('rm-color-comment').value = d.colorComment;
        document.getElementById('rm-gloss').checked = d.gloss === 'true';
        document.getElementById('rm-patina').checked = d.patina === 'true';
        document.getElementById('rm-patina-variant').value = d.patinaVariant || 'simple';
        document.getElementById('rm-lac').checked = d.lac === 'true';
        document.getElementById('rm-cnc').value = d.cnc;
        document.getElementById('rm-prisadka').checked = d.prisadka === 'true';
        document.getElementById('rm-holes').value = d.holes;
        document.getElementById('rm-holes-drawing').checked = d.holesDrawing === 'true';
        document.getElementById('rm-holes').disabled = d.holesDrawing === 'true';
        document.getElementById('rm-holes').placeholder = d.holesDrawing === 'true' ? 'Согласно чертежа' : '0';
        document.getElementById('rm-holes-wrap').style.display = d.prisadka === 'true' ? '' : 'none';
        document.getElementById('rm-combined').checked = d.combined === 'true';
        document.getElementById('rm-color2-sample').value = d.color2Sample;
        document.getElementById('rm-color2-comment').value = d.color2Comment;
        const showCombined = d.combined === 'true' ? '' : 'none';
        document.getElementById('rm-color2-sample-wrap').style.display = showCombined;
        document.getElementById('rm-color2-sample-field').style.display = showCombined;
        document.getElementById('rm-color2-comment-field').style.display = showCombined;
        updateBaseInfo();

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
        d.material = document.getElementById('rm-material').value;
        d.thickness = document.getElementById('rm-thickness').value;
        d.fres = document.getElementById('rm-fres').value;
        d.height = document.getElementById('rm-height').value;
        d.width = document.getElementById('rm-width').value;
        d.qty = document.getElementById('rm-qty').value || '1';
        d.frezSample = document.getElementById('rm-frez-sample').value;
        d.frezComment = document.getElementById('rm-frez-comment').value;
        d.colorSample = document.getElementById('rm-color-sample').value;
        d.colorComment = document.getElementById('rm-color-comment').value;
        d.gloss = document.getElementById('rm-gloss').checked ? 'true' : 'false';
        d.patina = document.getElementById('rm-patina').checked ? 'true' : 'false';
        d.patinaVariant = document.getElementById('rm-patina-variant').value;
        d.lac = document.getElementById('rm-lac').checked ? 'true' : 'false';
        if (d.material === 'veneer') d.lac = 'false';
        d.cnc = document.getElementById('rm-cnc').value;
        d.prisadka = document.getElementById('rm-prisadka').checked ? 'true' : 'false';
        d.holesDrawing = document.getElementById('rm-holes-drawing').checked ? 'true' : 'false';
        d.holes = d.prisadka === 'true' ? (d.holesDrawing === 'true' ? 'согласно чертежа' : document.getElementById('rm-holes').value) : '';
        d.combined = document.getElementById('rm-combined').checked ? 'true' : 'false';
        d.color2Sample = d.combined === 'true' ? document.getElementById('rm-color2-sample').value : '';
        d.color2Comment = d.combined === 'true' ? document.getElementById('rm-color2-comment').value : '';

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
    document.getElementById('rm-holes-drawing').addEventListener('change', (e) => {
        const holesInput = document.getElementById('rm-holes');
        if (e.target.checked) {
            holesInput.value = '';
            holesInput.disabled = true;
            holesInput.placeholder = 'Согласно чертежа';
        } else {
            holesInput.disabled = false;
            holesInput.placeholder = '0';
        }
    });
    document.getElementById('rm-combined').addEventListener('change', (e) => {
        const show = e.target.checked ? '' : 'none';
        document.getElementById('rm-color2-sample-wrap').style.display = show;
        document.getElementById('rm-color2-sample-field').style.display = show;
        document.getElementById('rm-color2-comment-field').style.display = show;
    });
    document.getElementById('rm-material').addEventListener('change', updateBaseInfo);
    document.getElementById('rm-thickness').addEventListener('change', updateBaseInfo);
    document.getElementById('rm-fres').addEventListener('change', updateBaseInfo);
    document.getElementById('rm-patina').addEventListener('change', updateBaseInfo);
    document.getElementById('rm-save').addEventListener('click', saveRowModal);

    // --- Calculations ---
    function calcRowCost(d) {
        const h = parseFloat(d.height) || 0;
        const w = parseFloat(d.width) || 0;
        const qty = parseInt(d.qty) || 0;
        const thickness = parseInt(d.thickness) || 16;
        const sqm = (h * w * qty) / 1000000;
        const base = getBasePrice(d.material || 'mdf', thickness, d.fres || 'straight');
        const surch = getSurcharge(d.material || 'mdf', {
            gloss: d.gloss === 'true',
            patina: d.patina === 'true',
            patinaVariant: d.patinaVariant || 'simple',
            lac: d.lac === 'true',
        });
        const holes = parseInt(d.holes) || 0;
        const holesCost = (d.prisadka === 'true' && d.holesDrawing !== 'true') ? holes * HOLE_PRICE : 0;
        const cost = sqm * (base + surch) + holesCost;
        return { sqm, qty, cost, base, surch, holesCost };
    }

    function recalcAll() {
        let totalQty = 0;
        let totalSqm = 0;
        let totalCost = 0;

        calcTbody.querySelectorAll('tr').forEach(tr => {
            const d = tr.dataset;
            const { sqm, qty, cost } = calcRowCost(d);

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
            if (!d.height && !d.width) return;

            const sqm = tr.querySelector('.cell-sqm').textContent;
            const cost = tr.querySelector('.cell-cost').textContent;
            const parts = [];
            if (d.room) parts.push(d.room);
            parts.push(`${d.height}×${d.width}мм ×${d.qty || 1}шт = ${sqm}м²`);
            parts.push(buildCoatingSummary(d));
            if (d.colorSample) parts.push(`цвет: ${d.colorSample}`);
            if (d.colorComment) parts.push(`(${d.colorComment})`);
            if (d.frezSample) parts.push(`фрезеровка: ${d.frezSample}`);
            if (d.frezComment) parts.push(`(${d.frezComment})`);
            if (d.cnc) parts.push(`ЧПУ: ${CNC_LABELS[d.cnc]}`);
            if (d.combined === 'true') {
                let c2 = 'цвет 2: ' + (d.color2Sample || '—');
                if (d.color2Comment) c2 += ` (${d.color2Comment})`;
                parts.push(c2);
            }
            if (d.prisadka === 'true') parts.push(`присадка: ${d.holes || '—'} отв.`);
            parts.push(cost);
            rows.push(`${rows.length + 1}. ${parts.join(', ')}`);
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

    // ===== CRM INTEGRATION =====
    const CRM_URL = 'https://malyar-crm-production.up.railway.app';

    function sendToCRM() {
        const rows = [];
        calcTbody.querySelectorAll('tr').forEach(tr => {
            const d = tr.dataset;
            if (!d.height && !d.width) return;
            const h = parseFloat(d.height) || 0;
            const w = parseFloat(d.width) || 0;
            const qty = parseInt(d.qty) || 1;
            const { sqm, cost } = calcRowCost(d);
            rows.push({
                room: d.room || '',
                height: h, width: w, qty: qty,
                material: d.material || 'mdf',
                thickness: parseInt(d.thickness) || 16,
                fres: d.fres || 'straight',
                gloss: d.gloss === 'true',
                patina: d.patina === 'true',
                patinaVariant: d.patinaVariant || 'simple',
                lac: d.lac === 'true',
                coatingSummary: buildCoatingSummary(d),
                colorSample: d.colorSample || '',
                colorComment: d.colorComment || '',
                frezSample: d.frezSample || '',
                frezComment: d.frezComment || '',
                cnc: d.cnc || '',
                combined: d.combined === 'true',
                color2Sample: d.color2Sample || '',
                color2Comment: d.color2Comment || '',
                prisadka: d.prisadka === 'true',
                holes: d.holes || '',
                holesDrawing: d.holesDrawing === 'true',
                sqm: Math.round(sqm * 1000) / 1000,
                cost: Math.round(cost)
            });
        });
        if (!rows.length) return;

        const totalSqm = rows.reduce((s, r) => s + r.sqm, 0);
        const totalCost = rows.reduce((s, r) => s + r.cost, 0);

        // Build same message as WhatsApp
        const msgRows = [];
        rows.forEach((r, i) => {
            const parts = [];
            if (r.room) parts.push(r.room);
            parts.push(`${r.height}\u00d7${r.width}мм \u00d7${r.qty}шт = ${r.sqm}м\u00b2`);
            parts.push(r.coatingSummary);
            if (r.colorSample) parts.push('цвет: ' + r.colorSample);
            if (r.frezSample) parts.push('фрезеровка: ' + r.frezSample);
            parts.push(formatPrice(r.cost));
            msgRows.push((i + 1) + '. ' + parts.join(', '));
        });

        fetch(CRM_URL + '/api/orders/submit', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                source: 'calculator',
                rows: rows,
                totalSqm: Math.round(totalSqm * 1000) / 1000,
                totalCost: Math.round(totalCost),
                message: msgRows.join('\n') + '\n\nИТОГО: ' + totalSqm.toFixed(3) + ' м\u00b2, ' + formatPrice(Math.round(totalCost))
            })
        }).catch(() => {});  // silent — не блокируем WhatsApp если CRM недоступна
    }

    // Min order check on WhatsApp button
    document.getElementById('calc-order').addEventListener('click', (e) => {
        const totalSqm = parseFloat(document.getElementById('total-sqm').textContent) || 0;
        if (totalSqm < 2) {
            e.preventDefault();
            showAlertModal('Минимальный заказ не достигнут', 'Общая квадратура заказа не должна составлять менее 2 кв.м. Добавьте ещё фасады или увеличьте размеры.');
        } else {
            sendToCRM();
        }
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
            showNotification('Заполните имя и телефон', 'error');
            return;
        }

        let msg = `Заявка с сайта malyarkapro.kz\n\nИмя: ${name}\nТелефон: ${phone}`;
        if (service) msg += `\nУслуга: ${service}`;
        if (comment) msg += `\nКомментарий: ${comment}`;

        window.open(`https://wa.me/77074014040?text=${encodeURIComponent(msg)}`, '_blank');

        // Send to CRM
        fetch(CRM_URL + '/api/orders/submit', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                source: 'website_form',
                clientName: name,
                clientPhone: phone,
                message: (service ? 'Услуга: ' + service + '\n' : '') + (comment ? 'Комментарий: ' + comment : '')
            })
        }).catch(() => {});

        contactForm.reset();
    });

    // ===== GALLERY MODAL =====
    const galleryModal = document.getElementById('gallery-modal');
    const galleryImg = document.getElementById('gallery-img');
    const galleryCounter = document.getElementById('gallery-counter');
    let currentGallery = [];
    let currentIndex = 0;

    function openGallery(category, startIndex) {
        currentGallery = (typeof GALLERY_DATA !== 'undefined' && GALLERY_DATA[category]) || [];
        if (!currentGallery.length) return;
        currentIndex = startIndex || 0;
        showSlide();
        galleryModal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function closeGallery() {
        galleryModal.classList.remove('active');
        document.body.style.overflow = '';
    }

    function showSlide() {
        galleryImg.src = currentGallery[currentIndex];
        galleryCounter.textContent = (currentIndex + 1) + ' / ' + currentGallery.length;
    }

    function nextSlide() {
        currentIndex = (currentIndex + 1) % currentGallery.length;
        showSlide();
    }

    function prevSlide() {
        currentIndex = (currentIndex - 1 + currentGallery.length) % currentGallery.length;
        showSlide();
    }

    // Click handlers
    document.querySelectorAll('.portfolio-card--gallery').forEach(card => {
        card.addEventListener('click', () => {
            const category = card.dataset.gallery;
            openGallery(category, 0);
        });
    });

    if (galleryModal) {
        galleryModal.querySelector('.gallery-modal__close').addEventListener('click', closeGallery);
        galleryModal.querySelector('.gallery-modal__backdrop').addEventListener('click', closeGallery);
        galleryModal.querySelector('.gallery-modal__arrow--next').addEventListener('click', nextSlide);
        galleryModal.querySelector('.gallery-modal__arrow--prev').addEventListener('click', prevSlide);

        // Keyboard
        document.addEventListener('keydown', (e) => {
            if (!galleryModal.classList.contains('active')) return;
            if (e.key === 'Escape') closeGallery();
            if (e.key === 'ArrowRight') nextSlide();
            if (e.key === 'ArrowLeft') prevSlide();
        });

        // Swipe support (mobile)
        let touchStartX = 0;
        galleryModal.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
        }, { passive: true });
        galleryModal.addEventListener('touchend', (e) => {
            const diff = e.changedTouches[0].screenX - touchStartX;
            if (Math.abs(diff) > 50) {
                diff < 0 ? nextSlide() : prevSlide();
            }
        }, { passive: true });
    }

    // ===== SAMPLES MODAL =====
    const samplesModal = document.getElementById('samples-modal');
    const samplesPreview = document.getElementById('samples-preview');
    const samplesPreviewImg = document.getElementById('samples-preview-img');
    const samplesPreviewNum = document.getElementById('samples-preview-num');
    const samplesPreviewCounter = document.getElementById('samples-preview-counter');
    const sampleThumbs = Array.from(samplesModal.querySelectorAll('.sample-thumb'));
    let currentSampleIdx = 0;

    function showSamplePreview(idx) {
        currentSampleIdx = idx;
        const thumb = sampleThumbs[idx];
        samplesPreviewImg.src = thumb.querySelector('img').src;
        samplesPreviewNum.textContent = 'Образец ' + thumb.dataset.num;
        samplesPreviewCounter.textContent = (idx + 1) + ' / ' + sampleThumbs.length;
        samplesPreview.classList.add('active');
    }

    function nextSample() {
        showSamplePreview((currentSampleIdx + 1) % sampleThumbs.length);
    }

    function prevSample() {
        showSamplePreview((currentSampleIdx - 1 + sampleThumbs.length) % sampleThumbs.length);
    }

    function closeSamplePreview() {
        samplesPreview.classList.remove('active');
    }

    document.getElementById('btn-show-samples').addEventListener('click', () => {
        samplesModal.classList.add('active');
        document.body.style.overflow = 'hidden';
    });

    function closeSamplesModal() {
        samplesModal.classList.remove('active');
        closeSamplePreview();
        document.body.style.overflow = '';
    }

    samplesModal.querySelector('.samples-modal__close').addEventListener('click', closeSamplesModal);
    samplesModal.querySelector('.samples-modal__backdrop').addEventListener('click', closeSamplesModal);

    // Preview arrows
    samplesPreview.querySelector('.samples-preview__arrow--next').addEventListener('click', (e) => { e.stopPropagation(); nextSample(); });
    samplesPreview.querySelector('.samples-preview__arrow--prev').addEventListener('click', (e) => { e.stopPropagation(); prevSample(); });
    samplesPreview.querySelector('.samples-preview__close').addEventListener('click', (e) => { e.stopPropagation(); closeSamplePreview(); });

    // Keyboard
    document.addEventListener('keydown', (e) => {
        if (!samplesModal.classList.contains('active')) return;
        if (e.key === 'Escape') {
            if (samplesPreview.classList.contains('active')) {
                closeSamplePreview();
            } else {
                closeSamplesModal();
            }
        }
        if (samplesPreview.classList.contains('active')) {
            if (e.key === 'ArrowRight') nextSample();
            if (e.key === 'ArrowLeft') prevSample();
        }
    });

    // Click/tap on thumbnail → open preview carousel
    sampleThumbs.forEach((thumb, idx) => {
        thumb.addEventListener('click', () => {
            showSamplePreview(idx);
        });
    });

    // Select button in preview
    document.getElementById('samples-preview-select').addEventListener('click', (e) => {
        e.stopPropagation();
        const num = sampleThumbs[currentSampleIdx].dataset.num;
        document.getElementById('rm-frez-sample').value = num;
        closeSamplesModal();
        showNotification('Выбран образец ' + num, 'info');
    });

    // Swipe on preview (mobile)
    let sampleTouchX = 0;
    samplesPreview.addEventListener('touchstart', (e) => {
        sampleTouchX = e.changedTouches[0].screenX;
    }, { passive: true });
    samplesPreview.addEventListener('touchend', (e) => {
        const diff = e.changedTouches[0].screenX - sampleTouchX;
        if (Math.abs(diff) > 50) {
            diff < 0 ? nextSample() : prevSample();
        }
    }, { passive: true });

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

    // ===== ALERT MODAL =====
    const alertModal = document.getElementById('alert-modal');
    function showAlertModal(title, text) {
        document.getElementById('alert-modal-title').textContent = title;
        document.getElementById('alert-modal-text').textContent = text;
        alertModal.classList.add('active');
        document.body.style.overflow = 'hidden';
        requestAnimationFrame(() => {
            requestAnimationFrame(() => alertModal.classList.add('visible'));
        });
    }
    function closeAlertModal() {
        alertModal.classList.remove('visible');
        setTimeout(() => {
            alertModal.classList.remove('active');
            document.body.style.overflow = '';
        }, 300);
    }
    document.getElementById('alert-modal-close').addEventListener('click', closeAlertModal);
    document.getElementById('alert-modal-ok').addEventListener('click', closeAlertModal);
    alertModal.addEventListener('click', (e) => { if (e.target === e.currentTarget) closeAlertModal(); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && alertModal.classList.contains('active')) closeAlertModal(); });
    window.showAlertModal = showAlertModal;

    // ===== NOTIFICATION (replaces alert) =====
    window.showNotification = function(text, type) {
        const el = document.createElement('div');
        el.className = 'notification notification--' + (type || 'info');
        el.textContent = text;
        document.body.appendChild(el);
        requestAnimationFrame(() => el.classList.add('visible'));
        setTimeout(() => {
            el.classList.remove('visible');
            setTimeout(() => el.remove(), 300);
        }, 3000);
    };

});
