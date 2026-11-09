/* Nostrix — portfolio: category filter and full-screen viewer. */
(function () {
  'use strict';

  var NX = window.NX;
  var $ = NX.$, $$ = NX.$$;
  var cells = $$('.g-item');
  var tabs = $$('[data-filter]');
  var count = $('#g-count');
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

  $('#gallery').addEventListener('click', function (e) {
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

  NX.onLang(function () { apply(current); });
  var start = location.hash.slice(1);
  apply(tabs.some(function (b) { return b.getAttribute('data-filter') === start; }) ? start : 'featured');
}());
