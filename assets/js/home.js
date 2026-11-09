/* Nostrix — homepage: hero motion, work rail, social feeds, reviews, project brief. */
(function () {
  'use strict';

  var NX = window.NX;
  var $ = NX.$, $$ = NX.$$;
  var cfg = window.NOSTRIX_SOCIAL || {};
  var rtl = function () { return document.documentElement.dir === 'rtl'; };

  /* ---------- Hero pillars follow the scroll ---------- */
  NX.track($('.hero'), 'exit');

  /* ---------- Statement: words light up as you read ---------- */
  var statement = $('.statement');
  if (statement) {
    var source = statement.getAttribute('data-text');
    var words = [];
    var lit = -1;
    var paint = function (p) {
      var n = Math.round(Math.min(1, p * 1.35) * words.length);
      if (n === lit) return;
      lit = n;
      for (var i = 0; i < words.length; i++) words[i].classList.toggle('on', i < n);
    };
    var split = function () {
      var text = NX.t(source);
      statement.setAttribute('aria-label', text);
      statement.innerHTML = text.split(' ').map(function (w) {
        return '<span class="w" aria-hidden="true">' + w + '</span>';
      }).join(' ');
      words = $$('.w', statement);
      lit = -1;
      paint(NX.reduce ? 1 : parseFloat(statement.style.getPropertyValue('--p')) || 0);
    };
    split();
    NX.onLang(split);
    if (!NX.reduce) NX.track(statement, 'read', paint);
  }

  /* ---------- Rails (work, reviews) ---------- */
  function rail(el, prev, next) {
    if (!el) return;
    var step = function (dir) {
      el.scrollBy({ left: dir * (rtl() ? -1 : 1) * el.clientWidth * 0.8, behavior: NX.reduce ? 'auto' : 'smooth' });
    };
    var sync = function () {
      var x = Math.abs(el.scrollLeft);
      var max = el.scrollWidth - el.clientWidth - 2;
      if (prev) prev.disabled = x <= 2;
      if (next) next.disabled = x >= max;
    };
    if (prev) prev.addEventListener('click', function () { step(-1); });
    if (next) next.addEventListener('click', function () { step(1); });
    el.addEventListener('scroll', sync, { passive: true });
    window.addEventListener('resize', sync, { passive: true });
    sync();
    return sync;
  }

  var workRail = $('#work-rail');
  rail(workRail, $('#work-prev'), $('#work-next'));
  if (workRail) {
    var shots = $$('.shot', workRail);
    var items = shots.map(function (b) {
      return {
        src: b.getAttribute('data-src'), video: b.getAttribute('data-video'),
        label: b.getAttribute('data-label'), w: +b.getAttribute('data-w'), h: +b.getAttribute('data-h')
      };
    });
    shots.forEach(function (b, i) {
      b.addEventListener('click', function () {
        NX.lightbox(items.map(function (it) { return Object.assign({}, it, { label: NX.t(it.label) }); }), i);
      });
    });
  }

  /* ---------- Steps ---------- */
  var steps = $('.steps');
  if (steps) {
    var stepEls = $$('.step', steps);
    NX.track(steps, 'read', function (p) {
      stepEls.forEach(function (s, i) { s.classList.toggle('is-on', p * 1.15 >= i / stepEls.length + 0.02); });
    });
  }

  /* ---------- Instagram and TikTok ----------
     Official embeds, loaded only when the section is near the screen. */
  function loadScript(src) {
    return new Promise(function (resolve, reject) {
      var s = document.createElement('script');
      s.async = true; s.src = src; s.onload = resolve; s.onerror = reject;
      document.body.appendChild(s);
    });
  }

  function mountFeed(card) {
    if (card.dataset.state) return;
    card.dataset.state = 'loading';
    var kind = card.getAttribute('data-feed');
    var body = $('.social-body', card);
    var wait = $('.social-wait', card);
    var handle = kind === 'instagram' ? (cfg.instagram || 'nostrix.ae') : (cfg.tiktok || 'nostrix.ae');
    var bq = document.createElement('blockquote');
    var src;

    wait.innerHTML = '<span class="spin" aria-hidden="true"></span><span>Loading posts…</span>';

    if (kind === 'instagram') {
      bq.className = 'instagram-media';
      bq.setAttribute('data-instgrm-permalink', 'https://www.instagram.com/' + handle + '/?utm_source=ig_embed');
      bq.setAttribute('data-instgrm-version', '14');
      src = 'https://www.instagram.com/embed.js';
    } else {
      bq.className = 'tiktok-embed';
      bq.setAttribute('cite', 'https://www.tiktok.com/@' + handle);
      bq.setAttribute('data-unique-id', handle);
      bq.setAttribute('data-embed-type', 'creator');
      bq.innerHTML = '<section></section>';
      src = 'https://www.tiktok.com/embed.js';
    }
    body.appendChild(bq);

    var done = false;
    var fail = function () {
      if (done) return;
      done = true;
      card.dataset.state = 'failed';
      bq.remove();
      wait.classList.remove('is-hidden');
      wait.innerHTML = '<span>Posts could not load here.</span>';
      var a = document.createElement('a');
      a.className = 'btn btn-primary btn-sm';
      a.target = '_blank'; a.rel = 'noopener noreferrer';
      a.href = card.getAttribute('data-profile');
      a.textContent = kind === 'instagram' ? 'Open Instagram' : 'Open TikTok';
      wait.appendChild(a);
    };
    var ready = function () {
      if (done) return;
      done = true;
      card.dataset.state = 'ready';
      wait.classList.add('is-hidden');
    };
    var mo = new MutationObserver(function () {
      var frame = $('iframe', body);
      if (!frame) return;
      mo.disconnect();
      frame.addEventListener('load', ready, { once: true });
      setTimeout(ready, 3500);
    });
    mo.observe(body, { childList: true, subtree: true });

    loadScript(src).then(function () {
      if (kind === 'instagram' && window.instgrm && window.instgrm.Embeds) window.instgrm.Embeds.process();
    }).catch(fail);
    setTimeout(function () { if (!$('iframe', body)) { mo.disconnect(); fail(); } }, 12000);
  }

  var feeds = $$('[data-feed]');
  if (feeds.length) {
    var saveData = navigator.connection && navigator.connection.saveData;
    if (saveData || !('IntersectionObserver' in window)) {
      feeds.forEach(function (card) {
        var wait = $('.social-wait', card);
        var b = document.createElement('button');
        b.type = 'button'; b.className = 'btn btn-primary btn-sm'; b.textContent = 'Show posts';
        b.addEventListener('click', function () { mountFeed(card); });
        wait.innerHTML = '';
        wait.appendChild(b);
      });
    } else {
      var feedIO = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (en.isIntersecting) { feedIO.unobserve(en.target); mountFeed(en.target); }
        });
      }, { rootMargin: '500px 0px' });
      feeds.forEach(function (card) { feedIO.observe(card); });
    }

    // Phones: one feed at a time
    var tabs = $$('.social-tabs button');
    var mq = window.matchMedia('(max-width: 820px)');
    var show = function (kind) {
      tabs.forEach(function (b) { b.setAttribute('aria-selected', String(b.getAttribute('data-show') === kind)); });
      feeds.forEach(function (card) {
        if (mq.matches && card.getAttribute('data-feed') !== kind) card.setAttribute('data-off', '');
        else card.removeAttribute('data-off');
      });
    };
    tabs.forEach(function (b) { b.addEventListener('click', function () { show(b.getAttribute('data-show')); }); });
    mq.addEventListener('change', function () { show('instagram'); });
    show('instagram');
  }

  /* ---------- Approved reviews (Google Sheet) ---------- */
  var reviewsSection = $('#reviews');
  var reviewsRail = $('#reviews-rail');
  var demoNames = ['Fashion Brand Client', 'Events Client', 'E-commerce Client', 'Real Estate Client', 'Automotive Client'];

  function igHandle(v) {
    var h = String(v || '').trim().replace(/^https?:\/\/(www\.)?instagram\.com\//i, '').replace(/^@/, '').split(/[\/?#]/)[0];
    return /^[A-Za-z0-9._]{1,30}$/.test(h) ? h : '';
  }

  function reviewCard(r) {
    var card = document.createElement('article');
    card.className = 'review';
    var arabic = /[؀-ۿ]/.test(String(r.testimonial || ''));
    card.dir = arabic ? 'rtl' : 'ltr';
    card.lang = arabic ? 'ar' : 'en';
    card.setAttribute('translate', 'no');

    var rating = Math.max(0, Math.min(5, Number(r.rating) || 0));
    if (rating) {
      var stars = document.createElement('div');
      stars.className = 'review-stars';
      stars.setAttribute('role', 'img');
      stars.setAttribute('aria-label', rating + ' out of 5 stars');
      stars.textContent = '★★★★★'.slice(0, rating);
      card.appendChild(stars);
    }
    var quote = document.createElement('blockquote');
    quote.textContent = '“' + String(r.testimonial).trim() + '”';
    card.appendChild(quote);

    var foot = document.createElement('footer');
    var name = document.createElement('strong');
    name.textContent = r.displayName || 'Anonymous client';
    foot.appendChild(name);
    if (r.service) {
      var service = document.createElement('span');
      service.textContent = r.service;
      foot.appendChild(service);
    }
    var handle = igHandle(r.instagram);
    if (handle) {
      var a = document.createElement('a');
      a.href = 'https://www.instagram.com/' + encodeURIComponent(handle) + '/';
      a.target = '_blank'; a.rel = 'noopener noreferrer';
      a.textContent = '@' + handle;
      a.dir = 'ltr';
      foot.appendChild(a);
    }
    card.appendChild(foot);
    return card;
  }

  function loadReviews() {
    var endpoint = String(window.NOSTRIX_REVIEWS_WEB_APP_URL || '');
    if (!reviewsSection || !reviewsRail || !endpoint || endpoint.indexOf('PASTE_GOOGLE') !== -1) return;
    var cb = 'nostrixApprovedReviews_' + Date.now();
    var script = document.createElement('script');
    var finished = false;
    var finish = function () {
      if (finished) return;
      finished = true;
      delete window[cb];
      script.remove();
    };
    window[cb] = function (payload) {
      var list = payload && Array.isArray(payload.reviews) ? payload.reviews : [];
      var seen = {};
      list.forEach(function (r) {
        if (!r || !r.testimonial) return;
        if (demoNames.indexOf(String(r.displayName || '').trim()) !== -1) return;
        if (r.id && seen[r.id]) return;
        if (r.id) seen[r.id] = true;
        reviewsRail.appendChild(reviewCard(r));
      });
      if (reviewsRail.children.length) {
        reviewsSection.hidden = false;
        var sync = rail(reviewsRail, $('#reviews-prev'), $('#reviews-next'));
        var nav = $('#reviews-nav');
        if (nav) nav.hidden = reviewsRail.scrollWidth <= reviewsRail.clientWidth + 4;
        if (sync) sync();
      }
      finish();
    };
    script.async = true;
    script.src = endpoint + '?action=approved&callback=' + encodeURIComponent(cb) + '&t=' + Date.now();
    script.onerror = finish;
    document.head.appendChild(script);
    setTimeout(finish, 9000);
  }
  if ('requestIdleCallback' in window) requestIdleCallback(loadReviews, { timeout: 2500 });
  else setTimeout(loadReviews, 1200);

  /* ---------- Project brief ---------- */
  var form = $('#project-form');
  if (form) {
    var status = $('#form-status');
    var services = $$('input[name="services"]', form);
    var events = $$('input[name="event_types"]', form);
    var servicesErr = $('#services-error');
    var eventsErr = $('#event-types-error');
    var eventService = $('#event-coverage-service');
    var otherService = $('#other-service-checkbox');
    var otherEvent = $('#other-event-checkbox');
    var customService = $('#custom-service');
    var customEvent = $('#custom-event');
    var budget = $('#budget');
    var customBudget = $('#custom-budget');
    var sendButton = $('#email-project');
    var endpoint = String(window.NOSTRIX_PRICING_WEB_APP_URL || '').trim();

    var say = function (text, cls) { status.textContent = text; status.className = 'status' + (cls ? ' ' + cls : ''); };

    var sync = function () {
      var isOther = otherService.checked, isEvent = eventService.checked;
      $('#custom-service-field').hidden = !isOther;
      customService.required = isOther;
      if (!isOther) customService.value = '';
      $('#event-types-field').hidden = !isEvent;
      if (!isEvent) { events.forEach(function (c) { c.checked = false; }); eventsErr.textContent = ''; }
      var showCustomEvent = isEvent && otherEvent.checked;
      $('#custom-event-field').hidden = !showCustomEvent;
      customEvent.required = showCustomEvent;
      if (!showCustomEvent) customEvent.value = '';
      var customB = budget.value === 'custom';
      $('#custom-budget-field').hidden = !customB;
      customBudget.required = customB;
      if (!customB) customBudget.value = '';
      if (services.some(function (c) { return c.checked; })) servicesErr.textContent = '';
      if (events.some(function (c) { return c.checked; })) eventsErr.textContent = '';
    };
    form.addEventListener('change', sync);
    sync();

    var phone = function (d) {
      var number = String(d.get('phone') || '').trim().replace(/^0+/, '');
      return [String(d.get('phone_code') || '').trim(), number].filter(Boolean).join(' ').trim();
    };
    var picked = function (d, name, other, custom) {
      return d.getAll(name).map(function (v) { return v === other ? d.get(custom) : v; }).filter(Boolean);
    };
    var budgetOf = function (d) { return d.get('budget') === 'custom' ? d.get('custom_budget') : d.get('budget'); };

    var brief = function () {
      var d = new FormData(form);
      var s = picked(d, 'services', 'Other', 'custom_service');
      var lines = [
        'Hello Nostrix, I would like to discuss a project.', '',
        'Name: ' + (d.get('name') || ''),
        'Company / Brand: ' + (d.get('company') || ''),
        'Email: ' + (d.get('email') || ''),
        'Phone: ' + phone(d),
        'Service(s): ' + s.join(', ')
      ];
      if (s.indexOf('Event Coverage') !== -1) lines.push('Event type(s): ' + picked(d, 'event_types', 'Other Event', 'custom_event').join(', '));
      lines.push('Estimated budget: ' + (budgetOf(d) || ''), 'Preferred timeline: ' + (d.get('timeline') || ''), '', 'Project details:', d.get('details') || '');
      return lines.join('\n');
    };

    var payload = function () {
      var d = new FormData(form);
      return {
        source: 'custom-project-form', package: 'Custom', price: 'Custom Pricing',
        name: d.get('name') || '', company: d.get('company') || '', email: d.get('email') || '',
        phone: phone(d),
        services: picked(d, 'services', 'Other', 'custom_service').join(', '),
        eventTypes: picked(d, 'event_types', 'Other Event', 'custom_event').join(', '),
        budget: budgetOf(d) || '', timeline: d.get('timeline') || '', needs: d.get('details') || '',
        brief: brief(), submittedAt: new Date().toISOString(), pageUrl: location.href
      };
    };

    var valid = function () {
      if (!services.some(function (c) { return c.checked; })) {
        servicesErr.textContent = 'Select at least one service.';
        say('Select at least one service.', 'bad');
        $('#service-options').scrollIntoView({ behavior: 'smooth', block: 'center' });
        return false;
      }
      if (eventService.checked && !events.some(function (c) { return c.checked; })) {
        eventsErr.textContent = 'Select at least one event type.';
        say('Select at least one event type.', 'bad');
        $('#event-types-field').scrollIntoView({ behavior: 'smooth', block: 'center' });
        return false;
      }
      if (!form.checkValidity()) {
        form.reportValidity();
        say('Add your name and phone number, and accept the privacy notice.', 'bad');
        return false;
      }
      say('');
      return true;
    };

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!valid()) return;
      say('Opening WhatsApp with your brief…');
      window.open(NX.waLink(brief()), '_blank', 'noopener,noreferrer');
    });

    sendButton.addEventListener('click', function () {
      if (!valid()) return;
      if (!endpoint) { say('The form is not connected yet. Send it on WhatsApp instead.', 'bad'); return; }
      sendButton.disabled = true;
      say('Sending your brief…');
      fetch(endpoint, {
        method: 'POST', mode: 'no-cors',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(payload())
      }).then(function () {
        say('Brief sent. Nostrix will contact you to confirm the details.', 'ok');
        form.reset();
        sync();
      }).catch(function () {
        say('The brief could not be sent. Send it on WhatsApp instead.', 'bad');
      }).then(function () { sendButton.disabled = false; });
    });
  }
}());
