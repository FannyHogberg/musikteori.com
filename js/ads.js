/*
 * Annonshantering för Musikteori.com
 *
 * INSTRUKTIONER:
 * 1. Logga in på AdSense: https://www.google.com/adsense
 * 2. Gå till "Annonser" → "Per annonsenhet" → "Visningsannonser"
 * 3. Namnge den t.ex. "Musikteori responsiv" och välj "Responsiv"
 * 4. Klicka "Skapa" och kopiera värdet från data-ad-slot="XXXXXXX"
 * 5. Klistra in det nedan istället för XXXXXXX
 * 6. Stäng av "Automatiska annonser" i AdSense under Annonser → Per webbplats
 */

const AD_CONFIG = {
    publisherId: 'ca-pub-1639643062450532',
    slotId: '1920229472'
};

(function () {
    'use strict';

    // Ladda inte annonser om slot-ID inte är konfigurerat
    if (AD_CONFIG.slotId === 'XXXXXXX') {
        console.warn('Ads: Slot-ID är inte konfigurerat. Uppdatera AD_CONFIG.slotId i js/ads.js');
        return;
    }

    // Ladda Google Analytics
    var gaScript = document.createElement('script');
    gaScript.async = true;
    gaScript.src = 'https://www.googletagmanager.com/gtag/js?id=G-WSGNXEB4WC';
    document.head.appendChild(gaScript);
    gaScript.addEventListener('load', function () {
        window.dataLayer = window.dataLayer || [];
        function gtag() { window.dataLayer.push(arguments); }
        gtag('js', new Date());
        gtag('config', 'G-WSGNXEB4WC');
    });

    // Ladda AdSense-skriptet
    var script = document.createElement('script');
    script.async = true;
    script.crossOrigin = 'anonymous';
    script.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=' + AD_CONFIG.publisherId;
    document.head.appendChild(script);

    function createAdUnit() {
        var wrapper = document.createElement('div');
        wrapper.className = 'ad-container';
        wrapper.style.width = '100%';
        wrapper.style.maxWidth = '900px';
        wrapper.style.margin = '1rem auto';

        var ins = document.createElement('ins');
        ins.className = 'adsbygoogle';
        ins.style.display = 'block';
        ins.style.width = '100%';
        ins.setAttribute('data-ad-client', AD_CONFIG.publisherId);
        ins.setAttribute('data-ad-slot', AD_CONFIG.slotId);
        ins.setAttribute('data-ad-format', 'auto');
        ins.setAttribute('data-full-width-responsive', 'true');
        wrapper.appendChild(ins);

        return wrapper;
    }

    function pushAd() {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
    }

    document.addEventListener('DOMContentLoaded', function () {
        var header = document.querySelector('header');
        var footer = document.querySelector('footer');

        // Annons under page-header (den gröna sektionen), eller under navbaren om ingen finns
        var isHomePage = window.location.pathname === '/' || window.location.pathname.endsWith('/index.html');
        var isContactPage = window.location.pathname.endsWith('/kontakt.html');
        if (!isHomePage && !isContactPage) {
            var pageHeader = document.querySelector('.page-header');
            var topAd = createAdUnit();
            if (pageHeader) {
                pageHeader.parentNode.insertBefore(topAd, pageHeader.nextSibling);
            } else if (header && header.nextSibling) {
                header.parentNode.insertBefore(topAd, header.nextSibling);
            }
        }

        // Annons före footern
        if (!isContactPage && footer) {
            var bottomAd = createAdUnit();
            footer.parentNode.insertBefore(bottomAd, footer);
        }

        script.addEventListener('load', function () {
            var ads = document.querySelectorAll('.adsbygoogle');
            ads.forEach(function () { pushAd(); });
        });
    });
})();
