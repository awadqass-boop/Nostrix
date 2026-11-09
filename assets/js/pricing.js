/* Nostrix — pricing page: service tabs, package enquiry and the estimate builder.
   The pricing rules below match the published Nostrix rates. */
(function () {
  'use strict';

  var NX = window.NX;
  var $ = NX.$, $$ = NX.$$;
  var MAIL = 'marketing@nostrix.ae';

  /* ---------- Tabs ---------- */
  var tabs = $$('[data-tab]');
  var subs = $$('[data-sub]');

  function showTab(key, scroll) {
    tabs.forEach(function (b) { b.setAttribute('aria-selected', String(b.getAttribute('data-tab') === key)); });
    $$('[data-panel]').forEach(function (p) { p.classList.toggle('is-on', p.getAttribute('data-panel') === key); });
    if (scroll) {
      var bar = $('#packages');
      var y = bar.getBoundingClientRect().top + window.scrollY - 52;
      if (window.scrollY > y) window.scrollTo({ top: y, behavior: NX.reduce ? 'auto' : 'smooth' });
    }
  }
  function showSub(key) {
    subs.forEach(function (b) { b.setAttribute('aria-selected', String(b.getAttribute('data-sub') === key)); });
    $$('[data-subpanel]').forEach(function (p) { p.classList.toggle('is-on', p.getAttribute('data-subpanel') === key); });
  }
  tabs.forEach(function (b) { b.addEventListener('click', function () { showTab(b.getAttribute('data-tab'), true); }); });
  subs.forEach(function (b) { b.addEventListener('click', function () { showSub(b.getAttribute('data-sub')); }); });

  /* ---------- Package enquiry ---------- */
  var packageSheet = $('#package-sheet');
  function openPackage(name, price) {
    $('#modalTitle').textContent = name;
    $('#modalPrice').textContent = price;
    var msg = "Hi Nostrix, I'm interested in the " + name + ' package (' + price + "). I'd like to discuss the scope, availability and next steps.";
    $('#modalWhatsApp').href = NX.waLink(msg);
    $('#modalEmail').href = 'mailto:' + MAIL + '?subject=' + encodeURIComponent('Nostrix enquiry — ' + name) + '&body=' + encodeURIComponent(msg);
    NX.openSheet(packageSheet);
  }

  /* ---------- Estimate builder ---------- */
  var builderSheet = $('#builder-sheet');
  var active = 'production';
  var NAMES = { branding: 'Custom Brand Build', marketing: 'Custom Marketing Retainer', production: 'Custom Production' };

  var aed = function (n) { return 'AED ' + Math.round(n).toLocaleString('en-AE'); };
  var val = function (id) { var el = document.getElementById(id); return el ? el.value : ''; };
  var checked = function (id) { var el = document.getElementById(id); return !!(el && el.checked); };
  var optionText = function (id) { var el = document.getElementById(id); return el && el.selectedOptions[0] ? el.selectedOptions[0].textContent : ''; };
  var service = function () { var r = $('input[name="prodService"]:checked'); return r ? r.value : 'photo'; };

  function buildBranding() {
    var base = 3490, addons = 0, rush = 0, items = [], scope = [];
    var type = val('brandType');
    var typeLabel = { 'new': 'New brand', rebrand: 'Full rebrand', refresh: 'Brand refresh / upgrade', launch: 'Launch-focused identity' }[type];
    if (type === 'rebrand') { base += 400; items.push(['Rebrand complexity', 'AED 400']); }
    if (type === 'launch') { base += 550; items.push(['Launch identity layer', 'AED 550']); }
    if (val('brandStrategy') === 'deep') { addons += 650; items.push(['Deep positioning workshop', 'AED 650']); }
    [['brandNaming', 'Naming support', 650], ['brandSocialKit', 'Social template kit', 550], ['brandPackaging', 'Packaging concept', 750],
      ['brandArtDirection', 'Photo/media art direction', 600], ['brandExtendedGuide', 'Extended brand guide', 650]].forEach(function (x) {
      if (checked(x[0])) { addons += x[2]; items.push([x[1], aed(x[2])]); }
    });
    var apps = Math.max(0, Number(val('brandApps') || 0));
    if (apps) { addons += apps * 180; items.push([apps + ' extra applications', aed(apps * 180)]); }
    var subtotal = base + addons;
    if (val('brandRush') === 'rush') { rush = subtotal * 0.25; items.push(['Priority delivery', aed(rush)]); }
    var webSave = addons * 0.15;
    scope.push(['Project', typeLabel], ['Base custom scope', aed(base)], ['Revision rounds', '3'], ['Target launch', val('brandDate') || 'To be confirmed']);
    return {
      base: base, total: subtotal + rush - webSave, webSave: webSave, scope: scope, items: items, baseLabel: 'Custom brand scope',
      meta: [['Category', 'Branding / Visual Identity'], ['Turnaround', val('brandRush') === 'rush' ? 'Priority' : 'Standard']],
      note: 'Custom brand scopes include strategy, a complete logo system, colour/typography and a structured handover. Naming, packaging and extended applications are added only when selected.'
    };
  }

  function buildMarketing() {
    var base = 3490, addons = 0, items = [], scope = [];
    var platforms = Number(val('mktPlatforms') || 2), assets = Math.max(8, Number(val('mktAssets') || 12));
    if (platforms === 3) { addons += 450; items.push(['3rd platform', aed(450)]); }
    var extraAssets = Math.max(0, assets - 12);
    if (extraAssets) { addons += extraAssets * 85; items.push([extraAssets + ' extra content assets', aed(extraAssets * 85)]); }
    if (val('mktStrategy') === 'biweekly') { addons += 350; items.push(['Bi-weekly strategy', aed(350)]); }
    if (val('mktCommunity') === 'standard') { addons += 450; items.push(['Standard community support', aed(450)]); }
    if (val('mktReporting') === 'detailed') { addons += 250; items.push(['Detailed reporting', aed(250)]); }
    if (checked('mktCompetitor')) { addons += 300; items.push(['Competitor monitoring', aed(300)]); }
    if (checked('mktLaunch')) { addons += 450; items.push(['Launch/campaign planning', aed(450)]); }
    var shoots = Number(val('mktShoots') || 0);
    if (shoots) { addons += shoots * 850; items.push([shoots + ' creator session' + (shoots > 1 ? 's' : ''), aed(shoots * 850)]); }
    var webSave = addons * 0.15;
    var community = val('mktCommunity');
    scope.push(['Platforms', String(platforms)], ['Monthly assets', String(assets)],
      ['Community', community === 'standard' ? 'Standard' : community === 'none' ? 'None' : 'Light'], ['Start date', val('mktDate') || 'To be confirmed']);
    return {
      base: base, total: base + addons - webSave, webSave: webSave, scope: scope, items: items, baseLabel: 'Custom retainer base',
      meta: [['Category', 'Marketing Solutions'], ['Billing', 'Monthly retainer']],
      note: 'Ad spend, advanced SEO and third-party media are excluded. Professional production is included only when selected above.'
    };
  }

  function prodBase(svc, category, hours, crew) {
    var lite = category === 'creator' || category === 'popup', base = 0;
    if (svc === 'photo') base = lite ? 650 + Math.max(0, hours - 2) * 250 : 900 + Math.min(Math.max(0, hours - 2), 2) * 325 + Math.max(0, hours - 4) * 300;
    if (svc === 'video') base = lite ? 750 + Math.max(0, hours - 2) * 300 : 1100 + Math.min(Math.max(0, hours - 2), 2) * 375 + Math.max(0, hours - 4) * 350;
    if (svc === 'both') {
      if (crew === 'duo') base = hours <= 4 ? 1750 + Math.max(0, hours - 2) * 450 : 2650 + (hours - 4) * 525;
      else base = 1350 + Math.max(0, hours - 2) * 400;
    }
    if (svc !== 'both' && crew === 'duo') base += hours * 350;
    if (category === 'product' || category === 'realestate' || category === 'automotive') base += 150;
    return base;
  }

  function buildProduction() {
    var svc = service(), cat = val('prodCategory'), h = Math.max(2, Number(val('prodHours') || 2)), crew = val('prodCrew');
    var base = prodBase(svc, cat, h, crew), addons = 0, travel = 0, rush = 0, items = [], scope = [];
    var serviceLabel = { photo: 'Photography', video: 'Videography', both: 'Photography + video' }[svc];
    var categoryLabel = { event: 'Event / corporate', creator: 'Creator / influencer', popup: 'Pop-up / retail', product: 'Product / e-commerce', realestate: 'Real estate', automotive: 'Automotive' }[cat];
    if (svc !== 'video') {
      var photos = Math.max(0, Number(val('prodPhotos') || 0));
      var included = (cat === 'creator' || cat === 'popup') ? Math.max(10, Math.round(h * 6)) : Math.max(35, Math.round(h * 18));
      var extra = Math.max(0, photos - included);
      if (extra) { addons += extra * 12; items.push([extra + ' photos above included volume', aed(extra * 12)]); }
      var pe = val('prodPhotoEdit');
      if (pe === 'enhanced') { addons += photos * 5; items.push(['Enhanced photo retouching', aed(photos * 5)]); }
      if (pe === 'advanced') { addons += photos * 20; items.push(['Advanced photo retouching', aed(photos * 20)]); }
      scope.push(['Final photos', String(photos)], ['Photo editing', pe === 'essential' ? 'Essential colour / WB' : pe === 'enhanced' ? 'Enhanced retouching' : 'Advanced retouching']);
    }
    if (svc !== 'photo') {
      var edit = val('prodVideoEdit');
      var editPrice = { none: 0, simple: 250, pro: 400, h60: 550, h90: 750 }[edit] || 0;
      if (editPrice) { addons += editPrice; items.push(['Main video edit', aed(editPrice)]); }
      var reels = Math.max(0, Number(val('prodExtraReels') || 0));
      if (reels) { addons += reels * 250; items.push([reels + ' extra Reel' + (reels > 1 ? 's' : ''), aed(reels * 250)]); }
      scope.push(['Video edit', { none: 'Selected clips only', simple: 'Simple Reel', pro: 'Professional Reel', h60: '60 sec highlight', h90: '90 sec highlight' }[edit]],
        ['Video format', optionText('prodFormat')]);
    }
    travel = { rak: 0, uaq: 75, ajman: 125, sharjah: 150, dubai: 200, abudhabi: 300, alain: 350 }[val('prodLocation')] || 0;
    if (travel) items.push(['UAE travel fee', aed(travel)]);
    var pct = { standard: 0, '48': 0.20, '24': 0.30, same: 0.50 }[val('prodTurnaround')] || 0;
    if (pct) { rush = (base + addons) * pct; items.push(['Rush turnaround', aed(rush)]); }
    var webSave = addons * 0.15;
    scope.unshift(['Services', serviceLabel], ['Project category', categoryLabel], ['Coverage', h + ' hours'], ['Crew', crew === 'duo' ? '2-person crew' : '1 operator']);
    var studio = val('prodStudio');
    return {
      base: base, total: base + addons + rush + travel - webSave, webSave: webSave, scope: scope, items: items, baseLabel: 'Coverage / crew',
      meta: [['Location', optionText('prodLocation')], ['Turnaround', optionText('prodTurnaround')],
        ['Studio', studio === 'arrange' ? 'Nostrix to arrange · quoted separately' : studio === 'client' ? 'Client-provided' : 'No / on-location'],
        ['Shoot date', val('prodDate') || 'To be confirmed'], ['Venue', val('prodVenue') || 'To be confirmed']],
      note: svc === 'both' && crew === 'one'
        ? 'One-operator hybrid means the creator switches between photo and video. Dedicated simultaneous coverage requires the 2-person crew option.'
        : 'Travel is shown separately. Studio, permits, rentals and specialist equipment are quoted separately when required.'
    };
  }

  function rowsInto(el, rows) {
    el.replaceChildren();
    rows.forEach(function (r) {
      var row = document.createElement('div');
      row.className = 'srow' + (r[2] ? ' ' + r[2] : '');
      var a = document.createElement('span'); a.textContent = r[0];
      var b = document.createElement('strong'); b.textContent = r[1];
      row.append(a, b);
      el.appendChild(row);
    });
  }

  function update() {
    var svc = service();
    $('#photoOptions').hidden = svc === 'video';
    $('#videoOptions').hidden = svc === 'photo';
    var r = active === 'branding' ? buildBranding() : active === 'marketing' ? buildMarketing() : buildProduction();
    var rounded = Math.round(r.total / 10) * 10;
    var lo = Math.round(r.total * 0.92 / 10) * 10, hi = Math.round(r.total * 1.08 / 10) * 10;
    $('#builderEstimate').textContent = aed(rounded);
    $('#builderRange').textContent = 'Planning range: ' + aed(lo) + '–' + aed(hi);
    rowsInto($('#scopeSummary'), r.scope);
    var build = [[r.baseLabel, aed(r.base)]].concat(r.items);
    if (r.webSave > 0) build.push(['15% website saving on eligible add-ons', '− ' + aed(r.webSave), 'is-discount']);
    build.push(['Estimated total', aed(rounded), 'is-total']);
    rowsInto($('#priceBuildUp'), build);
    var meta = $('#summaryMeta');
    meta.replaceChildren();
    r.meta.forEach(function (m) {
      var box = document.createElement('div');
      var a = document.createElement('span'); a.textContent = m[0];
      var b = document.createElement('strong'); b.textContent = m[1] || 'To be confirmed';
      box.append(a, b);
      meta.appendChild(box);
    });
    $('#builderNote').textContent = r.note;
    var summary = r.scope.map(function (x) { return x[0] + ': ' + x[1]; }).join(' | ');
    var msg = 'Hi Nostrix, I built a ' + NAMES[active] + ' estimate on your website. Estimated price: ' + aed(rounded) + '. ' + summary + '. Please confirm the scope and availability.';
    $('#builder-whatsapp').href = NX.waLink(msg);
    $('#builder-email').href = 'mailto:' + MAIL + '?subject=' + encodeURIComponent('Custom Nostrix estimate — ' + NAMES[active]) + '&body=' + encodeURIComponent(msg);
  }

  function setBuilder(type) {
    active = NAMES[type] ? type : 'production';
    $$('[data-btab]').forEach(function (b) { b.setAttribute('aria-selected', String(b.getAttribute('data-btab') === active)); });
    $$('[data-pane]').forEach(function (p) { p.classList.toggle('is-on', p.getAttribute('data-pane') === active); });
    $('#builderTitle').textContent = NAMES[active];
    update();
    var body = $('.sheet-body', builderSheet);
    if (body) body.scrollTop = 0;
  }
  function openBuilder(type) { setBuilder(type); NX.openSheet(builderSheet); }

  $$('[data-btab]').forEach(function (b) { b.addEventListener('click', function () { setBuilder(b.getAttribute('data-btab')); }); });
  $$('.calc', builderSheet).forEach(function (el) {
    el.addEventListener('input', update);
    el.addEventListener('change', update);
  });

  document.addEventListener('click', function (e) {
    var b = e.target.closest('[data-builder]');
    if (b) { openBuilder(b.getAttribute('data-builder')); return; }
    var p = e.target.closest('[data-package]');
    if (p) openPackage(p.getAttribute('data-package'), p.getAttribute('data-price'));
  });

  /* ---------- Deep links: /pricing/#events, #branding, #estimate ---------- */
  function fromHash() {
    var h = location.hash.replace('#', '');
    if (!h) return;
    if (h === 'production' || h === 'marketing' || h === 'branding') {
      showTab(h);
      $('#packages').scrollIntoView();
    } else if (h === 'creator' || h === 'events' || h === 'monthly') {
      showTab('production'); showSub(h);
      $('#packages').scrollIntoView();
    } else if (h === 'estimate') {
      openBuilder('production');
    }
  }
  window.addEventListener('hashchange', fromHash);
  setBuilder('production');
  fromHash();
}());
