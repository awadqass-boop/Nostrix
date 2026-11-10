/* Nostrix — portfolio: category filter and full-screen viewer.
   The page ships with the gallery built in; when the Nostrix API answers, the gallery is refreshed
   from the staff portfolio manager (published photos only, in the order set there). */
(function () {
  'use strict';

  var NX = window.NX;
  var $ = NX.$, $$ = NX.$$;
  var gallery = $('#gallery');
  var tabs = $$('[data-filter]');
  var count = $('#g-count');
  var cells = [];
  var current = 'featured';

  function matches(cell, filter) {
    if (filter === 'all') return true;
    if (filter === 'featured') return cell.getAttribute('data-featured') === 'true';
    return cell.getAttribute('data-cat') === filter;
  }

  function apply(filter) {
    current = filter;
    var shown = 0;
    cells.forEach(function (c) {
      var on = matches(c, filter);
      c.hidden = !on;
      if (on) shown++;
    });
    tabs.forEach(function (b) { b.setAttribute('aria-selected', String(b.getAttribute('data-filter') === filter)); });
    if (count) count.textContent = NX.lang() === 'ar' ? 'عدد الأعمال: ' + shown : shown + (shown === 1 ? ' item' : ' items');
  }

  function setFilter(filter, push) {
    if (!tabs.some(function (b) { return b.getAttribute('data-filter') === filter; })) filter = 'featured';
    NX.transition(function () { apply(filter); });
    if (push) history.replaceState(null, '', filter === 'featured' ? location.pathname : '#' + filter);
  }

  tabs.forEach(function (b) {
    b.addEventListener('click', function () { setFilter(b.getAttribute('data-filter'), true); });
  });

  gallery.addEventListener('click', function (e) {
    var cell = e.target.closest('.g-item');
    if (!cell) return;
    var visible = cells.filter(function (c) { return !c.hidden; });
    var items = visible.map(function (c) {
      return {
        src: c.getAttribute('data-src'), video: c.getAttribute('data-video'), label: NX.t(c.getAttribute('data-label')),
        w: +c.getAttribute('data-w'), h: +c.getAttribute('data-h')
      };
    });
    NX.lightbox(items, visible.indexOf(cell));
  });

  function el(tag, attrs, children) {
    var node = document.createElement(tag);
    Object.keys(attrs || {}).forEach(function (k) { if (attrs[k] !== null && attrs[k] !== undefined) node.setAttribute(k, attrs[k]); });
    (children || []).forEach(function (c) { node.appendChild(typeof c === 'string' ? document.createTextNode(c) : c); });
    return node;
  }

  function cellFor(it, i, names) {
    var label = it.label || names[it.category] || 'Nostrix';
    var img = el('img', {
      src: it.thumb, width: it.tw || 640, height: it.th || 960, alt: 'Nostrix ' + String(names[it.category] || '').toLowerCase(),
      loading: i === 0 ? null : 'lazy', fetchpriority: i === 0 ? 'high' : null, decoding: 'async'
    });
    var cap = el('span', { 'class': 'g-cap' });
    if (it.video) {
      var play = el('span', { 'class': 'g-play' });
      play.innerHTML = '<svg class="ic " aria-hidden="true"><use href="#i-play"/></svg>';
      cap.appendChild(play);
    }
    cap.appendChild(el('span', {}, [label]));
    return el('button', {
      'class': 'g-item' + (it.video ? ' is-video' : ''), type: 'button', 'data-cat': it.category, 'data-featured': String(!!it.featured),
      'data-label': label, 'data-src': it.video ? null : it.src, 'data-video': it.video || null,
      'data-w': it.w || 1200, 'data-h': it.h || 1600, 'aria-label': (it.video ? 'Play ' : 'View ') + label
    }, [img, cap]);
  }

  function refresh() {
    fetch(String(window.NOSTRIX_API || '/api') + '/portfolio', { headers: { Accept: 'application/json' } })
      .then(function (res) { if (!res.ok) throw new Error('HTTP ' + res.status); return res.json(); })
      .then(function (data) {
        var items = data && Array.isArray(data.items) ? data.items : [];
        if (!items.length) return;
        var signature = items.map(function (it) { return it.thumb + '|' + it.category + '|' + !!it.featured; }).join(',');
        var existing = cells.map(function (c) { return c.querySelector('img').getAttribute('src') + '|' + c.getAttribute('data-cat') + '|' + c.getAttribute('data-featured'); }).join(',');
        if (signature === existing) return;
        var names = {};
        (data.categories || []).forEach(function (c) { names[c.id] = c.en; });
        var frag = document.createDocumentFragment();
        items.forEach(function (it, i) { frag.appendChild(cellFor(it, i, names)); });
        gallery.replaceChildren(frag);
        cells = $$('.g-item', gallery);
        apply(current);
      })
      .catch(function () { /* keep the built-in gallery */ });
  }

  cells = $$('.g-item', gallery);
  NX.onLang(function () { apply(current); });
  var start = location.hash.slice(1);
  apply(tabs.some(function (b) { return b.getAttribute('data-filter') === start; }) ? start : 'featured');
  refresh();
}());
