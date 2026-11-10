/* Nostrix — review form. Sends to Nostrix's own API; the review appears on the site right away. */
(function () {
  'use strict';

  var NX = window.NX;
  var $ = NX.$, $$ = NX.$$;
  var form = $('#review-form');
  if (!form) return;

  var button = $('#submit-review');
  var status = $('#review-status');
  var nameInput = $('#name'), companyInput = $('#company');
  var services = $$('input[name="services"]', form);
  var events = $$('input[name="event_types"]', form);
  var servicesErr = $('#services-error'), eventsErr = $('#event-types-error');
  var eventService = $('#event-coverage-service'), otherService = $('#other-service-checkbox'), otherEvent = $('#other-event-checkbox');
  var customService = $('#custom-service'), customEvent = $('#custom-event');
  var instagram = $('#instagram'), showInstagram = $('#showInstagram');

  var say = function (text, cls) { status.textContent = text; status.className = 'status' + (cls ? ' ' + cls : ''); };

  function sync() {
    var choice = form.elements.displayPreference.value;
    nameInput.required = choice === 'name';
    companyInput.required = choice === 'company';

    var hasHandle = instagram.value.trim().length > 0;
    showInstagram.disabled = !hasHandle;
    if (!hasHandle) showInstagram.checked = false;

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
    if (services.some(function (c) { return c.checked; })) servicesErr.textContent = '';
    if (events.some(function (c) { return c.checked; })) eventsErr.textContent = '';
  }
  form.addEventListener('change', sync);
  instagram.addEventListener('input', sync);
  sync();

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    sync();
    var handle = instagram.value.trim();
    instagram.setCustomValidity(handle && !/^@?[A-Za-z0-9._]{1,30}$/.test(handle) ? 'Enter a valid Instagram username, for example @yourbrand.' : '');
    if (!form.reportValidity()) { say('Complete the required fields.', 'bad'); return; }
    if (!services.some(function (c) { return c.checked; })) {
      servicesErr.textContent = 'Select at least one service.';
      $('#services-field').scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
    if (eventService.checked && !events.some(function (c) { return c.checked; })) {
      eventsErr.textContent = 'Select at least one event type.';
      $('#event-types-field').scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
    var endpoint = String(window.NOSTRIX_API || '/api') + '/reviews';

    button.disabled = true;
    say('Submitting your review…');

    var data = new FormData(form);
    var selected = data.getAll('services').map(function (s) { return s === 'Other' ? customService.value.trim() : s; }).filter(Boolean);
    if (eventService.checked) {
      var types = events.filter(function (c) { return c.checked; }).map(function (c) { return c.value === 'Other Event' ? customEvent.value.trim() : c.value; }).filter(Boolean);
      var at = selected.indexOf('Event Coverage');
      if (at !== -1) selected[at] = 'Event Coverage — ' + types.join(', ');
    }
    ['services', 'event_types', 'custom_service', 'custom_event'].forEach(function (k) { data.delete(k); });
    data.set('service', selected.join(', '));
    var payload = {};
    data.forEach(function (value, key) { payload[key] = value; });

    fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    }).then(function (res) {
      if (!res.ok) throw new Error('HTTP ' + res.status);
      form.reset();
      sync();
      say('Thank you. Your review is now live on the Nostrix website.', 'ok');
    }).catch(function () {
      say('The review could not be submitted. Please try again or contact Support@nostrix.ae.', 'bad');
    }).then(function () { button.disabled = false; });
  });
}());
