// Meta Pixel — malyarkapro.kz
// Замени PIXEL_ID_PLACEHOLDER на свой Pixel ID после получения в Events Manager
(function() {
    var PIXEL_ID = 'PIXEL_ID_PLACEHOLDER';
    if (PIXEL_ID === 'PIXEL_ID_PLACEHOLDER') return; // не загружаем без реального ID

    !function(f,b,e,v,n,t,s){
        if(f.fbq)return;
        n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};
        if(!f._fbq)f._fbq=n;
        n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];
        t=b.createElement(e);t.async=!0;t.src=v;
        s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s);
    }(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');

    fbq('init', PIXEL_ID);
    fbq('track', 'PageView');

    // Авто-трекинг кликов
    document.addEventListener('click', function(e) {
        var link = e.target.closest('a');
        if (!link) return;
        // calc-order трекается отдельно в main.js (с value)
        if (link.id === 'calc-order') return;
        var href = link.getAttribute('href') || '';
        if (href.indexOf('tel:') === 0) {
            try { fbq('track', 'Contact', { method: 'phone' }); } catch (err) {}
            return;
        }
        if (href.indexOf('wa.me') !== -1 || href.indexOf('whatsapp.com') !== -1) {
            try { fbq('track', 'Contact', { method: 'whatsapp' }); } catch (err) {}
        }
    });

    // ViewContent на странице калькулятора (показатель глубокого интереса)
    if (location.pathname.indexOf('/kalkulyator') !== -1) {
        fbq('track', 'ViewContent', { content_name: 'calculator' });
    }
})();
