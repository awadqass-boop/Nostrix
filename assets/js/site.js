/* Nostrix — shared behaviour: language, theme, navigation, reveal, scroll progress, sheets, lightbox. */
(function () {
  'use strict';

  var root = document.documentElement;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var NX = window.NX = window.NX || {};
  NX.reduce = reduce;
  NX.wa = '971561195226';
  NX.waLink = function (text) {
    return 'https://wa.me/' + NX.wa + (text ? '?text=' + encodeURIComponent(text) : '');
  };

  function $(sel, ctx) { return (ctx || document).querySelector(sel); }
  function $$(sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); }
  NX.$ = $; NX.$$ = $$;

  function store(key, value) {
    try {
      if (value === undefined) return localStorage.getItem(key);
      localStorage.setItem(key, value);
    } catch (e) { /* storage unavailable */ }
    return null;
  }

  /* =====================================================
     Language (English / Arabic)
     The Arabic dictionary is only downloaded when Arabic is chosen.
     ===================================================== */
  var LANG_KEY = 'nostrix_language_v1';
  var lang = 'en';
  var dict = null;
  var dictLoading = null;
  var orig = new WeakMap();
  var out = new WeakMap();
  var attrOrig = new WeakMap();
  var ATTRS = ['placeholder', 'aria-label', 'title', 'alt'];
  var SKIP = /^(SCRIPT|STYLE|NOSCRIPT|TEXTAREA|CODE|PRE)$/;
  var langListeners = [];

  function compact(s) { return String(s == null ? '' : s).replace(/\s+/g, ' ').trim(); }

  var UNITS = { '/ month': ' / شهرياً', '/ project': ' / للمشروع', '/ 2 hours': ' / ساعتين', 'one-time': ' مرة واحدة', '': '' };

  function money(s) {
    var m = String(s).match(/^(From\s+)?(\+\s*)?AED\s*([\d,.]+(?:\s*[–-]\s*[\d,.]+)?\+?)\s*(.*)$/i);
    if (!m) return s;
    var unit = UNITS[m[4]];
    if (unit === undefined) unit = ' ' + (dict[m[4]] || m[4]);
    return (m[1] ? 'ابتداءً من ' : '') + (m[2] ? '+ ' : '') + m[3] + ' درهم' + unit;
  }

  function dyn(raw) {
    var s = compact(raw);
    if (!s || !dict) return raw;
    if (dict[s] !== undefined) return dict[s];
    var m;
    if ((m = s.match(/^Planning range:\s*(.+)$/i))) return 'النطاق التقديري: ' + m[1].split('–').map(money).join(' – ');
    if ((m = s.match(/^(\d+(?:\.\d+)?)\s+hours$/i))) return m[1] + ' ساعات';
    if ((m = s.match(/^(\d+)\s+extra applications$/i))) return m[1] + ' تطبيقات إضافية';
    if ((m = s.match(/^(\d+)\s+extra content assets$/i))) return m[1] + ' مواد محتوى إضافية';
    if ((m = s.match(/^(\d+)\s+creator sessions?$/i))) return m[1] + ' جلسات للمبدعين';
    if ((m = s.match(/^(\d+)\s+photos above included volume$/i))) return m[1] + ' صور إضافية فوق العدد المشمول';
    if ((m = s.match(/^(\d+)\s+extra Reels?$/i))) return m[1] + ' ريلز إضافية';
    if ((m = s.match(/^View (.+)$/i)) && dict[m[1]]) return 'عرض ' + dict[m[1]];
    if ((m = s.match(/^Play (.+)$/i)) && dict[m[1]]) return 'تشغيل ' + dict[m[1]];
    if ((m = s.match(/^(\d+) of (\d+)$/))) return m[1] + ' من ' + m[2];
    if ((m = s.match(/^(\d) out of 5 stars$/))) return m[1] + ' من 5 نجوم';
    if (/^(From )?AED\s/i.test(s) || /^[+−]\s*AED\s/i.test(s)) return s.charAt(0) === '−' ? '− ' + money(s.slice(1).trim()) : money(s);
    if ((m = s.match(/^(\d+) × (.+)$/))) return m[1] + ' × ' + (dict[compact(m[2])] || compact(m[2]));
    return raw;
  }

  function t(s) { return lang === 'ar' && dict ? dyn(s) : s; }

  function trText(n) {
    var p = n.parentElement;
    if (!p || SKIP.test(p.tagName) || p.closest('[translate="no"]')) return;
    var cur = n.nodeValue;
    var o = orig.get(n);
    if (o === undefined || cur !== out.get(n)) { o = cur; orig.set(n, o); }
    var next = o;
    if (lang === 'ar' && dict) {
      var lead = o.match(/^\s*/)[0];
      var trail = o.match(/\s*$/)[0];
      var core = o.slice(lead.length, o.length - trail.length);
      if (core) next = lead + dyn(core) + trail;
    }
    out.set(n, next);
    if (cur !== next) n.nodeValue = next;
  }

  function trAttrs(el) {
    if (el.closest('[translate="no"]')) return;
    var cache = attrOrig.get(el);
    for (var i = 0; i < ATTRS.length; i++) {
      var a = ATTRS[i];
      if (!el.hasAttribute(a)) continue;
      if (!cache) { cache = {}; attrOrig.set(el, cache); }
      var cur = el.getAttribute(a);
      if (cache[a] === undefined || (cur !== cache[a] && cur !== cache['>' + a])) cache[a] = cur;
      var next = lang === 'ar' && dict ? dyn(cache[a]) : cache[a];
      cache['>' + a] = next;
      if (cur !== next) el.setAttribute(a, next);
    }
  }

  function walk(node) {
    if (!node) return;
    if (node.nodeType === 3) { trText(node); return; }
    if (node.nodeType !== 1) return;
    trAttrs(node);
    var w = document.createTreeWalker(node, NodeFilter.SHOW_TEXT);
    var n;
    while ((n = w.nextNode())) trText(n);
    var els = node.querySelectorAll('[placeholder],[aria-label],[title],[alt]');
    for (var i = 0; i < els.length; i++) trAttrs(els[i]);
  }

  var enTitle = document.title;

  function applyLang() {
    root.lang = lang;
    root.dir = lang === 'ar' ? 'rtl' : 'ltr';
    walk(document.body);
    document.title = lang === 'ar' && dict ? (dict[enTitle] || enTitle) : enTitle;
    $$('[data-lang-toggle]').forEach(function (b) {
      b.textContent = lang === 'ar' ? 'EN' : 'ع';
      b.setAttribute('aria-label', lang === 'ar' ? 'Switch website to English' : 'تحويل الموقع إلى العربية');
    });
    root.classList.remove('i18n-wait');
    langListeners.forEach(function (fn) { try { fn(lang); } catch (e) { /* keep going */ } });
  }

  function loadDict() {
    if (dict) return Promise.resolve();
    if (dictLoading) return dictLoading;
    dictLoading = new Promise(function (resolve) {
      var s = document.createElement('script');
      s.src = '/assets/i18n/ar.js';
      s.onload = function () { dict = window.NOSTRIX_AR || {}; resolve(); };
      s.onerror = function () { dict = null; dictLoading = null; resolve(); };
      document.head.appendChild(s);
    });
    return dictLoading;
  }

  function setLang(next, save) {
    lang = next === 'ar' ? 'ar' : 'en';
    if (save) store(LANG_KEY, lang);
    if (lang === 'ar') {
      loadDict().then(function () {
        if (!dict) lang = 'en';
        applyLang();
      });
    } else {
      applyLang();
    }
  }

  NX.t = t;
  NX.lang = function () { return lang; };
  NX.onLang = function (fn) { langListeners.push(fn); };

  /* Runs a DOM change inside a view transition when the browser supports it. */
  NX.transition = function (change) {
    if (!document.startViewTransition || reduce || document.visibilityState !== 'visible') { change(); return null; }
    var vt = document.startViewTransition(change);
    vt.ready.catch(function () { /* skipped transitions are fine */ });
    vt.finished.catch(function () { /* skipped transitions are fine */ });
    return vt;
  };

  /* =====================================================
     Theme
     ===================================================== */
  function setTheme(next, ev) {
    var apply = function () {
      root.dataset.theme = next;
      store('nostrix_theme', next);
      var meta = $('meta[name="theme-color"]');
      if (meta) meta.content = next === 'light' ? '#ffffff' : '#000000';
      $$('[data-theme-toggle]').forEach(function (b) {
        b.setAttribute('aria-label', next === 'light' ? 'Switch to dark mode' : 'Switch to light mode');
      });
    };
    if (ev && ev.clientX) {
      root.style.setProperty('--vt-x', ev.clientX + 'px');
      root.style.setProperty('--vt-y', ev.clientY + 'px');
    }
    root.classList.add('theme-vt');
    var vt = NX.transition(apply);
    var done = function () { root.classList.remove('theme-vt'); };
    if (vt) vt.finished.then(done, done); else done();
  }

  /* =====================================================
     Sheets and lightbox
     ===================================================== */
  function lock(on) { root.style.overflow = on ? 'hidden' : ''; }

  NX.openSheet = function (dlg) {
    if (!dlg || dlg.open) return;
    dlg.showModal();
    lock(true);
  };
  NX.closeSheet = function (dlg) { if (dlg && dlg.open) dlg.close(); };

  document.addEventListener('click', function (e) {
    var closer = e.target.closest('[data-close]');
    if (closer) { NX.closeSheet(closer.closest('dialog')); return; }
    if (e.target.tagName === 'DIALOG' && e.target.classList.contains('sheet')) NX.closeSheet(e.target);
  });
  document.addEventListener('close', function (e) {
    if (e.target.tagName === 'DIALOG') lock(!!$('dialog[open]'));
  }, true);

  var lb = null, lbItems = [], lbIndex = 0;

  function icon(id, cls) {
    return '<svg class="ic ' + (cls || '') + '" aria-hidden="true"><use href="#i-' + id + '"/></svg>';
  }
  NX.icon = icon;

  function buildLightbox() {
    lb = document.createElement('dialog');
    lb.className = 'lb';
    lb.setAttribute('aria-label', 'Portfolio viewer');
    lb.innerHTML =
      '<div class="lb-bar"><span class="lb-count" aria-live="polite"></span>' +
      '<button class="lb-btn" type="button" data-close aria-label="Close">' + icon('x') + '</button></div>' +
      '<div class="lb-stage">' +
      '<button class="lb-btn lb-nav lb-prev" type="button" aria-label="Previous">' + icon('chev-l', 'ic-flip') + '</button>' +
      '<div class="lb-slot" style="display:contents"></div>' +
      '<button class="lb-btn lb-nav lb-next" type="button" aria-label="Next">' + icon('chev-r', 'ic-flip') + '</button>' +
      '</div><p class="lb-cap"></p>';
    document.body.appendChild(lb);
    walk(lb);
    $('.lb-prev', lb).addEventListener('click', function () { lbGo(-1); });
    $('.lb-next', lb).addEventListener('click', function () { lbGo(1); });
    lb.addEventListener('keydown', function (e) {
      var flip = root.dir === 'rtl' ? -1 : 1;
      if (e.key === 'ArrowRight') lbGo(flip);
      if (e.key === 'ArrowLeft') lbGo(-flip);
    });
    lb.addEventListener('close', function () { $('.lb-slot', lb).innerHTML = ''; });
    lb.addEventListener('click', function (e) {
      if (e.target === lb || e.target.classList.contains('lb-stage')) lb.close();
    });
    var x0 = null, y0 = 0;
    var stage = $('.lb-stage', lb);
    stage.addEventListener('pointerdown', function (e) { if (e.pointerType !== 'mouse') { x0 = e.clientX; y0 = e.clientY; } }, { passive: true });
    stage.addEventListener('pointerup', function (e) {
      if (x0 === null) return;
      var dx = e.clientX - x0, dy = e.clientY - y0;
      x0 = null;
      if (Math.abs(dx) > 48 && Math.abs(dx) > Math.abs(dy) * 1.3) lbGo((dx < 0 ? 1 : -1) * (root.dir === 'rtl' ? -1 : 1));
    }, { passive: true });
  }

  function lbRender() {
    var it = lbItems[lbIndex];
    var slot = $('.lb-slot', lb);
    var stage = $('.lb-stage', lb);
    stage.classList.toggle('is-tall', !!it.video && it.h > it.w);
    if (it.video) {
      slot.innerHTML = '<iframe src="' + it.video + '" allow="autoplay; fullscreen" allowfullscreen title="' + (it.label || 'Video') + '"></iframe>';
    } else {
      slot.innerHTML = '<img src="' + it.src + '" alt="' + (it.alt || it.label || '') + '" width="' + it.w + '" height="' + it.h + '">';
    }
    $('.lb-cap', lb).textContent = it.label || '';
    $('.lb-count', lb).textContent = (lbIndex + 1) + ' of ' + lbItems.length;
    var many = lbItems.length > 1;
    $('.lb-prev', lb).hidden = !many;
    $('.lb-next', lb).hidden = !many;
    if (many && !lbItems[(lbIndex + 1) % lbItems.length].video) {
      var pre = new Image();
      pre.src = lbItems[(lbIndex + 1) % lbItems.length].src;
    }
  }

  function lbGo(step) {
    if (lbItems.length < 2) return;
    lbIndex = (lbIndex + step + lbItems.length) % lbItems.length;
    lbRender();
  }

  NX.lightbox = function (items, index) {
    if (!items || !items.length) return;
    if (!lb) buildLightbox();
    lbItems = items;
    lbIndex = Math.max(0, Math.min(items.length - 1, index || 0));
    lbRender();
    if (!lb.open) { lb.showModal(); lock(true); }
  };

  /* =====================================================
     Scroll progress: sets --p (0 to 1) on [data-progress] while visible.
       view   0 when the top enters the viewport, 1 when the bottom leaves
       exit   0 at rest, 1 when scrolled past
       read   0 to 1 as the element crosses the 78% line
     ===================================================== */
  var tracked = [];
  var ticking = false;

  function measure() {
    ticking = false;
    var vh = window.innerHeight;
    for (var i = 0; i < tracked.length; i++) {
      var o = tracked[i];
      if (!o.on) continue;
      var r = o.el.getBoundingClientRect();
      var mode = o.mode, p;
      if (mode === 'exit') p = -r.top / Math.max(r.height, 1);
      else if (mode === 'read') p = (vh * 0.78 - r.top) / Math.max(r.height, 1);
      else p = (vh - r.top) / (vh + r.height);
      p = p < 0 ? 0 : p > 1 ? 1 : p;
      if (Math.abs(p - o.p) > 0.002) {
        o.p = p;
        o.el.style.setProperty('--p', p.toFixed(3));
        if (o.fn) o.fn(p, o.el);
      }
    }
  }
  function onScroll() { if (!ticking) { ticking = true; requestAnimationFrame(measure); } }

  NX.track = function (el, mode, fn) {
    if (!el) return;
    var o = { el: el, mode: mode || el.getAttribute('data-progress') || 'view', fn: fn, on: true, p: -1 };
    tracked.push(o);
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (es) {
        o.on = es[0].isIntersecting;
        if (o.on) onScroll();
      }, { rootMargin: '20% 0px 20% 0px' }).observe(el);
    }
    onScroll();
  };

  /* =====================================================
     Init
     ===================================================== */
  function init() {
    // Navigation
    var nav = $('.nav');
    var menuBtn = $('.menu-btn');
    var setScrolled = function () { if (nav) nav.classList.toggle('is-scrolled', window.scrollY > 8); };
    var closeMenu = function () {
      root.classList.remove('menu-open');
      if (menuBtn) { menuBtn.setAttribute('aria-expanded', 'false'); menuBtn.setAttribute('aria-label', 'Open menu'); }
    };
    if (menuBtn) {
      menuBtn.addEventListener('click', function () {
        var open = !root.classList.contains('menu-open');
        root.classList.toggle('menu-open', open);
        menuBtn.setAttribute('aria-expanded', String(open));
        menuBtn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
      });
      $$('.nav-links a').forEach(function (a, i) {
        a.style.setProperty('--n', i);
        a.addEventListener('click', closeMenu);
      });
      document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeMenu(); });
      window.matchMedia('(min-width: 801px)').addEventListener('change', closeMenu);
    }
    var path = location.pathname.replace(/index\.html$/, '');
    $$('.nav-links a').forEach(function (a) {
      var href = a.getAttribute('href');
      if (href.indexOf('#') === -1 && href !== '/' && path.indexOf(href) === 0) a.setAttribute('aria-current', 'page');
    });

    // Theme and language controls
    document.addEventListener('click', function (e) {
      var th = e.target.closest('[data-theme-toggle]');
      if (th) { setTheme(root.dataset.theme === 'light' ? 'dark' : 'light', e); return; }
      var lg = e.target.closest('[data-lang-toggle]');
      if (lg) setLang(lang === 'ar' ? 'en' : 'ar', true);
    });
    $$('[data-theme-toggle]').forEach(function (b) {
      b.setAttribute('aria-label', root.dataset.theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode');
    });

    // Reveal on scroll
    var reveals = $$('[data-reveal]');
    if (reduce || !('IntersectionObserver' in window)) {
      reveals.forEach(function (el) { el.classList.add('is-in'); });
    } else {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); }
        });
      }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
      reveals.forEach(function (el) { io.observe(el); });
    }

    // Scroll-linked progress
    $$('[data-progress]').forEach(function (el) { NX.track(el); });

    // WhatsApp float
    var wa = $('.wa-float');
    var setWa = function () {
      if (!wa) return;
      var fromEnd = document.documentElement.scrollHeight - window.innerHeight - window.scrollY;
      wa.classList.toggle('is-on', window.scrollY > 520 && fromEnd > 140);
    };

    window.addEventListener('scroll', function () { onScroll(); setScrolled(); setWa(); }, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    setScrolled(); setWa();

    $$('[data-year]').forEach(function (el) { el.textContent = new Date().getFullYear(); });

    // Language: translate now, and keep translating content added later
    var saved = store(LANG_KEY) === 'ar' ? 'ar' : 'en';
    if ('MutationObserver' in window) {
      new MutationObserver(function (muts) {
        if (lang !== 'ar' || !dict) return;
        for (var i = 0; i < muts.length; i++) {
          var m = muts[i];
          if (m.type === 'characterData') trText(m.target);
          else if (m.type === 'attributes') trAttrs(m.target);
          else for (var j = 0; j < m.addedNodes.length; j++) walk(m.addedNodes[j]);
        }
      }).observe(document.body, { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: ATTRS });
    }
    setLang(saved, false);
    window.addEventListener('storage', function (e) { if (e.key === LANG_KEY) setLang(e.newValue === 'ar' ? 'ar' : 'en', false); });
    setTimeout(function () { root.classList.remove('i18n-wait'); }, 1500);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
}());
