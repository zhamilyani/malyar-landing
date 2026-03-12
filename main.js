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

    // ===== CALCULATOR (TABLE) =====
    const coatingSelect = document.getElementById('calc-coating');
    const primerCheckbox = document.getElementById('calc-primer');
    const calcTbody = document.getElementById('calc-tbody');
    const addRowBtn = document.getElementById('calc-add-row');

    const PRIMER_PRICE = 6000;

    function formatPrice(num) {
        return num.toLocaleString('ru-RU') + ' ₸';
    }

    function createRow() {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><input type="text" placeholder="Кухня" class="row-room"></td>
            <td><select class="row-thickness">
                <option value="16">16 мм</option>
                <option value="19">19 мм</option>
                <option value="22">22 мм</option>
            </select></td>
            <td><input type="number" min="1" placeholder="716" class="row-height"></td>
            <td><input type="number" min="1" placeholder="396" class="row-width"></td>
            <td><input type="number" min="1" value="1" class="row-qty"></td>
            <td class="cell-sqm">—</td>
            <td><input type="text" placeholder="—" class="row-frez-sample"></td>
            <td><input type="text" placeholder="—" class="row-frez-comment"></td>
            <td><input type="text" placeholder="RAL 9003" class="row-color-sample"></td>
            <td><input type="text" placeholder="—" class="row-color-comment"></td>
            <td class="cell-checkbox"><input type="checkbox" class="row-prisadka"></td>
            <td class="cell-cost">—</td>
            <td><button type="button" class="row-delete-btn" title="Удалить">✕</button></td>
        `;
        calcTbody.appendChild(tr);

        // Bind events
        tr.querySelectorAll('input, select').forEach(el => {
            el.addEventListener('input', recalcAll);
            el.addEventListener('change', recalcAll);
        });
        tr.querySelector('.row-delete-btn').addEventListener('click', () => {
            tr.remove();
            recalcAll();
        });

        recalcAll();
        return tr;
    }

    function getCoatingPrice() {
        const opt = coatingSelect.options[coatingSelect.selectedIndex];
        return parseInt(opt.dataset.price) || 0;
    }

    function recalcAll() {
        const pricePerM2 = getCoatingPrice();
        const needPrimer = primerCheckbox.checked;
        let totalQty = 0;
        let totalSqm = 0;
        let totalCost = 0;

        calcTbody.querySelectorAll('tr').forEach(tr => {
            const h = parseFloat(tr.querySelector('.row-height').value) || 0;
            const w = parseFloat(tr.querySelector('.row-width').value) || 0;
            const qty = parseInt(tr.querySelector('.row-qty').value) || 0;

            const sqm = (h * w * qty) / 1000000;
            const unitPrice = pricePerM2 + (needPrimer ? PRIMER_PRICE : 0);
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

        // Update WhatsApp link
        updateWhatsApp(totalSqm, totalCost);
    }

    function updateWhatsApp(totalSqm, totalCost) {
        const coatingName = coatingSelect.options[coatingSelect.selectedIndex].text.split(' —')[0];
        const primerText = primerCheckbox.checked ? 'Да' : 'Нет';
        const rows = [];
        calcTbody.querySelectorAll('tr').forEach((tr, i) => {
            const room = tr.querySelector('.row-room').value || '—';
            const h = tr.querySelector('.row-height').value || '—';
            const w = tr.querySelector('.row-width').value || '—';
            const qty = tr.querySelector('.row-qty').value || '—';
            const sqm = tr.querySelector('.cell-sqm').textContent;
            const cost = tr.querySelector('.cell-cost').textContent;
            const color = tr.querySelector('.row-color-sample').value || '—';
            rows.push(`${i+1}. ${room}: ${h}×${w}мм ×${qty}шт = ${sqm}м², цвет: ${color}, ${cost}`);
        });

        let msg = `Здравствуйте! Заказ на покраску фасадов.\n\nПокрытие: ${coatingName}\nГрунтовка: ${primerText}\n\n`;
        msg += rows.join('\n');
        msg += `\n\nИТОГО: ${totalSqm.toFixed(3)} м², ${formatPrice(Math.round(totalCost))}`;

        document.getElementById('calc-order').href =
            `https://wa.me/77001234567?text=${encodeURIComponent(msg)}`;
    }

    // Bind settings changes
    coatingSelect.addEventListener('change', recalcAll);
    primerCheckbox.addEventListener('change', recalcAll);
    addRowBtn.addEventListener('click', () => createRow());

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

        window.open(`https://wa.me/77001234567?text=${encodeURIComponent(msg)}`, '_blank');

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
