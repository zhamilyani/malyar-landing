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
    const materialSelect = document.getElementById('calc-material');
    const coatingSelect = document.getElementById('calc-coating');
    const areaInput = document.getElementById('calc-area');
    const primerCheckbox = document.getElementById('calc-primer');
    const calcBtn = document.getElementById('calc-btn');

    // Coating options per material
    const coatingOptions = {
        mdf: [
            { value: 'matte', label: 'Матовая эмаль' },
            { value: 'gloss', label: 'Глянцевая эмаль' },
            { value: 'highgloss', label: 'Высокий глянец (полиэфир)' },
            { value: 'patina', label: 'Патина' }
        ],
        veneer: [
            { value: 'tint_lac', label: 'Тонировка + лак' },
            { value: 'lac', label: 'Лак' }
        ],
        wood: [
            { value: 'matte', label: 'Матовая эмаль' },
            { value: 'tint_lac', label: 'Тонировка + лак' },
            { value: 'lac', label: 'Лак' }
        ]
    };

    // Price map: material_coating -> price per m²
    const priceMap = {
        'mdf_matte': 18000,
        'mdf_gloss': 22000,
        'mdf_highgloss': 30000,
        'mdf_patina': 28000,
        'veneer_tint_lac': 18000,
        'veneer_lac': 10000,
        'wood_matte': 20000,
        'wood_tint_lac': 20000,
        'wood_lac': 12000
    };

    const PRIMER_PRICE = 6000;
    const DELIVERY_FREE_MIN = 10;
    const DELIVERY_PRICE = 5000;

    // Time estimates
    const timeMap = {
        'mdf_matte': '3-5 дней',
        'mdf_gloss': '5-7 дней',
        'mdf_highgloss': '7-10 дней',
        'mdf_patina': '5-7 дней',
        'veneer_tint_lac': '3-5 дней',
        'veneer_lac': '3-5 дней',
        'wood_matte': '5-7 дней',
        'wood_tint_lac': '5-7 дней',
        'wood_lac': '3-5 дней'
    };

    // Update coating options when material changes
    materialSelect.addEventListener('change', updateCoatings);

    function updateCoatings() {
        const material = materialSelect.value;
        const options = coatingOptions[material];

        coatingSelect.innerHTML = '';
        options.forEach(opt => {
            const option = document.createElement('option');
            option.value = opt.value;
            option.textContent = opt.label;
            coatingSelect.appendChild(option);
        });

        // Auto-recalculate if result is visible
        if (document.getElementById('calc-data').style.display !== 'none') {
            calculate();
        }
    }

    // Real-time calculation on any change
    [materialSelect, coatingSelect, areaInput, primerCheckbox].forEach(el => {
        el.addEventListener('change', () => {
            if (document.getElementById('calc-data').style.display !== 'none') {
                calculate();
            }
        });
        if (el.type === 'number') {
            el.addEventListener('input', () => {
                if (document.getElementById('calc-data').style.display !== 'none') {
                    calculate();
                }
            });
        }
    });

    calcBtn.addEventListener('click', calculate);

    function formatPrice(num) {
        return num.toLocaleString('ru-RU') + ' ₸';
    }

    function calculate() {
        const material = materialSelect.value;
        const coating = coatingSelect.value;
        const area = parseFloat(areaInput.value) || 0;
        const needPrimer = primerCheckbox.checked;

        if (area <= 0) {
            alert('Укажите площадь (минимум 1 м²)');
            return;
        }

        const key = `${material}_${coating}`;
        const pricePerM2 = priceMap[key];

        if (!pricePerM2) {
            alert('Выберите корректную комбинацию материала и покрытия');
            return;
        }

        const paintCost = pricePerM2 * area;
        const primerCost = needPrimer ? PRIMER_PRICE * area : 0;
        const deliveryCost = area >= DELIVERY_FREE_MIN ? 0 : DELIVERY_PRICE;
        const total = paintCost + primerCost + deliveryCost;
        const timeEstimate = timeMap[key] || '3-5 дней';

        // Adjust time for large areas
        let adjustedTime = timeEstimate;
        if (area > 30) {
            const days = timeEstimate.match(/(\d+)-(\d+)/);
            if (days) {
                adjustedTime = `${parseInt(days[1]) + 2}-${parseInt(days[2]) + 3} дней`;
            }
        }

        // Show results
        document.querySelector('.calc__result-placeholder').style.display = 'none';
        document.getElementById('calc-data').style.display = 'block';

        document.getElementById('res-paint').textContent = formatPrice(paintCost);

        const primerRow = document.getElementById('res-primer-row');
        if (needPrimer) {
            primerRow.style.display = 'flex';
            document.getElementById('res-primer').textContent = formatPrice(primerCost);
        } else {
            primerRow.style.display = 'none';
        }

        document.getElementById('res-delivery').textContent =
            deliveryCost === 0 ? 'Бесплатно' : formatPrice(deliveryCost);
        document.getElementById('res-time').textContent = adjustedTime;
        document.getElementById('res-total').textContent = formatPrice(total);

        // Build WhatsApp message
        const materialName = materialSelect.options[materialSelect.selectedIndex].text;
        const coatingName = coatingSelect.options[coatingSelect.selectedIndex].text;
        const primerText = needPrimer ? ', с грунтовкой' : '';
        const msg = `Здравствуйте! Хочу заказать покраску.\n\nМатериал: ${materialName}\nПокрытие: ${coatingName}${primerText}\nПлощадь: ${area} м²\nСтоимость: ${formatPrice(total)}\nСрок: ${adjustedTime}`;

        document.getElementById('calc-order').href =
            `https://wa.me/77001234567?text=${encodeURIComponent(msg)}`;
    }

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
