(function () {
    'use strict';

    const measurementId = String(
        window.NOSTRIX_GA_MEASUREMENT_ID || ''
    ).trim();

    if (!/^G-[A-Z0-9]+$/i.test(measurementId)) return;

    const consentKey = 'nostrix_analytics_consent_v1';
    const acceptedValue = 'accepted';
    const declinedValue = 'declined';

    let analyticsLoaded = false;
    let trackingInstalled = false;
    const scrollMilestones = new Set();

    window.dataLayer = window.dataLayer || [];

    window.gtag = window.gtag || function () {
        window.dataLayer.push(arguments);
    };

    window.gtag('consent', 'default', {
        analytics_storage: 'denied',
        ad_storage: 'denied',
        ad_user_data: 'denied',
        ad_personalization: 'denied',
        wait_for_update: 500
    });


    /* =========================
       CONSENT
       ========================= */

    function readConsent() {
        try {
            return localStorage.getItem(consentKey) || '';
        } catch (error) {
            return '';
        }
    }

    function writeConsent(value) {
        try {
            localStorage.setItem(consentKey, value);
        } catch (error) {
            // Continue without local storage.
        }
    }


    /* =========================
       GOOGLE ANALYTICS EVENTS
       ========================= */

    function sendEvent(eventName, parameters) {
        if (
            !analyticsLoaded ||
            readConsent() !== acceptedValue ||
            typeof window.gtag !== 'function'
        ) {
            return;
        }

        window.gtag('event', eventName, {
            page_path: window.location.pathname,
            ...(parameters || {})
        });
    }

    window.nostrixTrack = sendEvent;


    /* =========================
       IMPORTANT CLICK TRACKING
       ========================= */

    function trackImportantClick(element) {
        const href =
            element.getAttribute('href') || '';

        const text = (
            element.getAttribute('aria-label') ||
            element.textContent ||
            element.value ||
            ''
        )
            .replace(/\s+/g, ' ')
            .trim();

        const lowerText = text.toLowerCase();
        const lowerHref = href.toLowerCase();


        /* VIEW PORTFOLIO */

        if (
            lowerHref === '/portfolio/' ||
            lowerHref === '/portfolio' ||
            lowerText.includes('view portfolio') ||
            lowerText.includes('explore portfolio')
        ) {
            sendEvent('view_portfolio', {
                button_text: text
            });
        }


        /* BUILD YOUR ESTIMATE */

        if (
            lowerText.includes('build your estimate') ||
            lowerText.includes('build your shoot') ||
            element.classList.contains('custom-package-contact') ||
            element.classList.contains('custom-builder-trigger')
        ) {
            sendEvent('build_estimate', {
                button_text: text,
                pricing_category: element.getAttribute('data-builder') || ''
            });
        }

        if (element.classList.contains('package-contact')) {
            sendEvent('pricing_package_select', {
                package_name: element.getAttribute('data-package') || text,
                package_price: element.getAttribute('data-price') || ''
            });
        }


        /* WHATSAPP */

        if (
            lowerHref.includes('wa.me') ||
            lowerHref.includes('whatsapp') ||
            lowerText.includes('whatsapp')
        ) {
            let source = 'website';

            if (element.id === 'builderWhatsApp') {
                source = 'pricing_estimator';
            } else if (element.id === 'photo-calc-whatsapp') {
                source = 'pricing_calculator';
            } else if (
                element.id === 'portfolio-whatsapp' ||
                window.location.pathname.startsWith('/portfolio')
            ) {
                source = 'portfolio';
            } else if (element.closest('#project-form')) {
                source = 'project_form';
            } else if (element.closest('#package-form')) {
                source = 'package_enquiry';
            }

            sendEvent('whatsapp_click', {
                source: source
            });
        }


        /* START A PROJECT */

        if (lowerText.includes('start a project')) {
            sendEvent('start_project', {
                button_text: text
            });
        }


        /* SUBMIT ENQUIRY */

        if (element.id === 'package-direct-send') {
            sendEvent('submit_enquiry', {
                enquiry_type: 'package'
            });
        }

        if (element.id === 'photo-calc-submit') {
            sendEvent('submit_enquiry', {
                enquiry_type: 'pricing_estimate'
            });
        }

        if (element.id === 'email-project') {
            sendEvent('submit_enquiry', {
                enquiry_type: 'project_brief'
            });
        }
    }


    /* =========================
       GENERAL WEBSITE TRACKING
       ========================= */

    function installTracking() {
        if (trackingInstalled) return;

        trackingInstalled = true;

        document.addEventListener(
            'click',
            function (event) {
                const element = event.target.closest('a, button');

                if (!element) return;

                if (
                    element.hasAttribute(
                        'data-nostrix-consent-control'
                    )
                ) {
                    return;
                }

                trackImportantClick(element);

                sendEvent('site_click', {
                    click_label: (
                        element.getAttribute('aria-label') ||
                        element.textContent ||
                        element.value ||
                        ''
                    )
                        .replace(/\s+/g, ' ')
                        .trim()
                        .slice(0, 100),

                    element_type:
                        element.tagName.toLowerCase()
                });
            },
            true
        );


        document.addEventListener(
            'submit',
            function (event) {
                const form = event.target;

                if (!(form instanceof HTMLFormElement)) {
                    return;
                }

                sendEvent('form_submit_attempt', {
                    form_name:
                        form.id ||
                        form.getAttribute('name') ||
                        'website_form'
                });
            },
            true
        );


        window.addEventListener(
            'scroll',
            function () {
                const pageHeight = Math.max(
                    document.documentElement.scrollHeight -
                        window.innerHeight,
                    1
                );

                const percentage = Math.round(
                    (window.scrollY / pageHeight) * 100
                );

                [25, 50, 75, 90].forEach(function (milestone) {
                    if (
                        percentage >= milestone &&
                        !scrollMilestones.has(milestone)
                    ) {
                        scrollMilestones.add(milestone);

                        sendEvent('scroll_depth', {
                            percent_scrolled: milestone
                        });
                    }
                });
            },
            { passive: true }
        );
    }


    /* =========================
       LOAD GOOGLE ANALYTICS
       ========================= */

    function loadAnalytics() {
        if (analyticsLoaded) return;

        analyticsLoaded = true;

        window.gtag('consent', 'update', {
            analytics_storage: 'granted',
            ad_storage: 'denied',
            ad_user_data: 'denied',
            ad_personalization: 'denied'
        });

        const script = document.createElement('script');

        script.async = true;

        script.src =
            'https://www.googletagmanager.com/gtag/js?id=' +
            encodeURIComponent(measurementId);

        document.head.appendChild(script);

        window.gtag('js', new Date());

        window.gtag('config', measurementId, {
            send_page_view: true,
            allow_google_signals: false,
            allow_ad_personalization_signals: false,
            transport_type: 'beacon'
        });

        installTracking();
    }


    /* =========================
       COOKIE / ANALYTICS BANNER
       ========================= */

    function injectStyles() {
        if (
            document.getElementById(
                'nostrix-analytics-styles'
            )
        ) {
            return;
        }

        const style =
            document.createElement('style');

        style.id =
            'nostrix-analytics-styles';

        style.textContent = `
            .nostrix-consent-banner {
                position: fixed;
                left: 1rem;
                right: 1rem;
                bottom: 1rem;
                z-index: 9999;
                display: grid;
                grid-template-columns: minmax(0, 1fr) auto;
                gap: 1rem;
                align-items: center;
                max-width: 72rem;
                margin: 0 auto;
                padding: 1rem 1.1rem;
                border: 1px solid rgba(255,255,255,.14);
                border-radius: 1rem;
                color: #fff;
                background: rgba(10,10,15,.96);
                box-shadow: 0 1rem 3rem rgba(0,0,0,.45);
                backdrop-filter: blur(18px);
                font-family: Inter, Arial, sans-serif;
            }

            .nostrix-consent-copy {
                margin: 0;
                color: #d4d4d8;
                font-size: .82rem;
                line-height: 1.55;
            }

            .nostrix-consent-copy strong {
                color: #fff;
            }

            .nostrix-consent-copy a {
                color: #bac8ff;
            }

            .nostrix-consent-actions {
                display: flex;
                flex-wrap: wrap;
                gap: .65rem;
            }

            .nostrix-consent-button {
                min-height: 2.65rem;
                border: 1px solid rgba(255,255,255,.16);
                border-radius: 999px;
                padding: 0 1rem;
                color: #fff;
                background: rgba(255,255,255,.06);
                font: inherit;
                font-size: .72rem;
                font-weight: 700;
                letter-spacing: .08em;
                text-transform: uppercase;
                cursor: pointer;
            }

            .nostrix-consent-button.primary {
                color: #08080b;
                border-color: transparent;
                background: linear-gradient(
                    135deg,
                    #bac8ff,
                    #d28bff
                );
            }

            .nostrix-analytics-settings {
                border: 0;
                padding: 0;
                color: inherit;
                background: none;
                font: inherit;
                cursor: pointer;
                text-decoration: underline;
                text-underline-offset: .18em;
            }

            @media (max-width: 700px) {
                .nostrix-consent-banner {
                    grid-template-columns: 1fr;
                }

                .nostrix-consent-actions {
                    width: 100%;
                }

                .nostrix-consent-button {
                    flex: 1;
                }
            }
        `;

        document.head.appendChild(style);
    }


    function closeBanner() {
        document
            .getElementById(
                'nostrix-consent-banner'
            )
            ?.remove();
    }


    function setConsent(value) {
        writeConsent(value);

        closeBanner();

        if (value === acceptedValue) {
            loadAnalytics();
        } else {
            window.gtag(
                'consent',
                'update',
                {
                    analytics_storage: 'denied',
                    ad_storage: 'denied',
                    ad_user_data: 'denied',
                    ad_personalization: 'denied'
                }
            );
        }
    }


    function showBanner() {
        closeBanner();

        injectStyles();

        const banner =
            document.createElement('aside');

        banner.id =
            'nostrix-consent-banner';

        banner.className =
            'nostrix-consent-banner';

        banner.setAttribute(
            'role',
            'dialog'
        );

        banner.setAttribute(
            'aria-label',
            'Analytics preferences'
        );

        banner.innerHTML = `
            <p class="nostrix-consent-copy">
                <strong>Private website analytics</strong><br>
                Nostrix would like to measure anonymous page views,
                scroll depth and clicks so we can improve the website.
                We do not send form answers, names, email addresses
                or phone numbers to Analytics.
                Read our
                <a href="/privacy/">privacy policy</a>.
            </p>

            <div class="nostrix-consent-actions">

                <button
                    type="button"
                    class="nostrix-consent-button"
                    data-consent="declined"
                    data-nostrix-consent-control
                >
                    Decline
                </button>

                <button
                    type="button"
                    class="nostrix-consent-button primary"
                    data-consent="accepted"
                    data-nostrix-consent-control
                >
                    Allow analytics
                </button>

            </div>
        `;

        banner
            .querySelectorAll('[data-consent]')
            .forEach(function (button) {
                button.addEventListener(
                    'click',
                    function () {
                        setConsent(
                            button.getAttribute(
                                'data-consent'
                            )
                        );
                    }
                );
            });

        document.body.appendChild(banner);
    }


    /* =========================
       ANALYTICS SETTINGS LINK
       ========================= */

    function addSettingsControl() {
        injectStyles();

        if (
            document.querySelector(
                '[data-nostrix-analytics-settings]'
            )
        ) {
            return;
        }

        const button =
            document.createElement('button');

        button.type = 'button';

        button.className =
            'nostrix-analytics-settings';

        button.textContent =
            'Analytics settings';

        button.setAttribute(
            'data-nostrix-analytics-settings',
            ''
        );

        button.setAttribute(
            'data-nostrix-consent-control',
            ''
        );

        button.addEventListener(
            'click',
            showBanner
        );

        const footerExplore =
            document.querySelector(
                '.site-footer-grid > div:last-child'
            );

        if (footerExplore) {
            button.classList.add('footer-link');

            footerExplore.appendChild(button);

            return;
        }

        const footer =
            document.querySelector('footer');

        if (footer) {
            const wrapper =
                document.createElement('p');

            wrapper.style.marginTop = '1rem';

            wrapper.appendChild(button);

            footer.appendChild(wrapper);
        }
    }


    /* =========================
       START
       ========================= */

    function start() {
        addSettingsControl();

        const consent =
            readConsent();

        if (consent === acceptedValue) {
            loadAnalytics();
        } else if (
            consent !== declinedValue
        ) {
            showBanner();
        }
    }


    if (
        document.readyState === 'loading'
    ) {
        document.addEventListener(
            'DOMContentLoaded',
            start,
            { once: true }
        );
    } else {
        start();
    }

})();
