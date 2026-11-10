/* Nostrix — first-party visit stats. Anonymous: no cookies and nothing stored on the device.
   Page views and key clicks go to Nostrix's own API (/api/collect), which keeps country/city only. */
(function () {
  'use strict';
  if (/^(localhost|127\.0\.0\.1|\[::1\])$/.test(location.hostname) || location.protocol === 'file:') return;
  if (location.pathname.indexOf('/staff/') === 0) return;
  var api = String(window.NOSTRIX_API || '/api');
  function beacon(data) {
    data.lang = document.documentElement.lang === 'ar' ? 'ar' : 'en';
    var payload = JSON.stringify(data);
    try {
      if (navigator.sendBeacon && navigator.sendBeacon(api + '/collect', new Blob([payload], { type: 'text/plain' }))) return;
    } catch (e) { /* fall through */ }
    try { fetch(api + '/collect', { method: 'POST', keepalive: true, headers: { 'Content-Type': 'text/plain' }, body: payload }); } catch (e) { /* offline */ }
  }
  window.nostrixStat = function (name, label) { beacon({ t: 'click', n: name, l: String(label || '').slice(0, 120), p: location.pathname }); };
  beacon({ t: 'view', p: location.pathname, r: document.referrer || '' });
  document.addEventListener('click', function (e) {
    var el = e.target.closest && e.target.closest('a, button');
    if (!el) return;
    var href = (el.getAttribute('href') || '').toLowerCase();
    if (href.indexOf('wa.me') !== -1 || href.indexOf('whatsapp') !== -1) window.nostrixStat('whatsapp', el.id || '');
    else if (href.indexOf('tel:') === 0) window.nostrixStat('call', '');
    else if (href.indexOf('mailto:') === 0) window.nostrixStat('email', '');
    else if (href.indexOf('instagram.com') !== -1) window.nostrixStat('instagram', '');
    else if (href.indexOf('tiktok.com') !== -1) window.nostrixStat('tiktok', '');
    if (el.hasAttribute('data-builder')) window.nostrixStat('estimate', el.getAttribute('data-builder') || '');
  }, true);
}());

/* Nostrix — Google Analytics 4 with consent.
   Nothing loads until the visitor accepts. Disabled on localhost. */
(function () {
  'use strict';

  var id = String(window.NOSTRIX_GA_MEASUREMENT_ID || '').trim();
  if (!/^G-[A-Z0-9]+$/i.test(id)) return;
  if (/^(localhost|127\.0\.0\.1|\[::1\])$/.test(location.hostname)) return;

  var KEY = 'nostrix_analytics_consent_v1';
  var loaded = false;
  var milestones = {};

  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function () { window.dataLayer.push(arguments); };
  window.gtag('consent', 'default', {
    analytics_storage: 'denied', ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied', wait_for_update: 500
  });

  function read() { try { return localStorage.getItem(KEY) || ''; } catch (e) { return ''; } }
  function write(v) { try { localStorage.setItem(KEY, v); } catch (e) { /* no storage */ } }

  function send(name, params) {
    if (!loaded || read() !== 'accepted') return;
    var data = { page_path: location.pathname };
    for (var k in params || {}) data[k] = params[k];
    window.gtag('event', name, data);
  }
  window.nostrixTrack = send;

  function label(el) {
    return (el.getAttribute('data-track') || el.getAttribute('aria-label') || el.textContent || '').replace(/\s+/g, ' ').trim();
  }

  function onClick(e) {
    var el = e.target.closest('a, button');
    if (!el || el.hasAttribute('data-consent')) return;
    var href = (el.getAttribute('href') || '').toLowerCase();
    var text = label(el);
    var low = text.toLowerCase();

    if (href === '/portfolio/' || low.indexOf('portfolio') !== -1 || low.indexOf('see the work') !== -1) send('view_portfolio', { button_text: text });
    if (low.indexOf('build an estimate') !== -1 || el.hasAttribute('data-builder')) send('build_estimate', { button_text: text });
    if (href.indexOf('wa.me') !== -1 || low.indexOf('whatsapp') !== -1) {
      var source = 'website';
      if (el.id === 'builder-whatsapp') source = 'pricing_calculator';
      else if (el.closest('#project-form')) source = 'project_form';
      else if (el.closest('#package-sheet')) source = 'package_enquiry';
      else if (location.pathname.indexOf('/portfolio') === 0) source = 'portfolio';
      send('whatsapp_click', { source: source });
    }
    if (low.indexOf('start a project') !== -1) send('start_project', { button_text: text });
    if (el.id === 'email-project') send('submit_enquiry', { enquiry_type: 'project_brief' });
    send('site_click', { click_label: text.slice(0, 100), element_type: el.tagName.toLowerCase() });
  }

  function onScroll() {
    var max = Math.max(document.documentElement.scrollHeight - window.innerHeight, 1);
    var pct = Math.round(window.scrollY / max * 100);
    [25, 50, 75, 90].forEach(function (m) {
      if (pct >= m && !milestones[m]) { milestones[m] = true; send('scroll_depth', { percent_scrolled: m }); }
    });
  }

  function load() {
    if (loaded) return;
    loaded = true;
    window.gtag('consent', 'update', { analytics_storage: 'granted', ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied' });
    var s = document.createElement('script');
    s.async = true;
    s.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(id);
    document.head.appendChild(s);
    window.gtag('js', new Date());
    window.gtag('config', id, { send_page_view: true, allow_google_signals: false, allow_ad_personalization_signals: false, transport_type: 'beacon' });
    document.addEventListener('click', onClick, true);
    document.addEventListener('submit', function (e) {
      if (e.target && e.target.tagName === 'FORM') send('form_submit_attempt', { form_name: e.target.id || 'website_form' });
    }, true);
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  var banner = null;
  function close() { if (banner) { banner.remove(); banner = null; } }

  function choose(value) {
    write(value);
    close();
    if (value === 'accepted') load();
    else window.gtag('consent', 'update', { analytics_storage: 'denied' });
  }

  function show() {
    if (banner) return;
    banner = document.createElement('div');
    banner.className = 'consent';
    banner.setAttribute('role', 'dialog');
    banner.setAttribute('aria-label', 'Analytics settings');
    var p = document.createElement('p');
    var strong = document.createElement('strong');
    strong.textContent = 'Analytics.';
    var text = document.createTextNode(' ');
    var span = document.createElement('span');
    span.textContent = 'We use Google Analytics to see which pages are useful. It only runs if you accept.';
    var link = document.createElement('a');
    link.href = '/privacy/#cookies';
    link.textContent = 'Privacy policy';
    p.append(strong, text, span, document.createTextNode(' '), link);
    var row = document.createElement('div');
    row.className = 'btn-row';
    var no = document.createElement('button');
    no.type = 'button'; no.className = 'btn btn-ghost btn-sm'; no.textContent = 'Decline'; no.setAttribute('data-consent', '');
    var yes = document.createElement('button');
    yes.type = 'button'; yes.className = 'btn btn-primary btn-sm'; yes.textContent = 'Accept'; yes.setAttribute('data-consent', '');
    no.addEventListener('click', function () { choose('declined'); });
    yes.addEventListener('click', function () { choose('accepted'); });
    row.append(no, yes);
    banner.append(p, row);
    document.body.appendChild(banner);
  }

  function start() {
    var settings = document.querySelector('[data-analytics-settings]');
    if (settings) {
      settings.hidden = false;
      settings.querySelector('button').addEventListener('click', show);
    }
    var state = read();
    if (state === 'accepted') load();
    else if (state !== 'declined') setTimeout(show, 1800);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, { once: true });
  else start();
}());
