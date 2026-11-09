#!/usr/bin/env python3
"""Builds the static Nostrix pages.

Run:  python3 _build/build.py
Output: plain HTML files in the site folder. No runtime dependencies.
The _build folder is not published by GitHub Pages (folders starting with _ are skipped).
"""
import html
import json
import os
import re
import sys
from html.parser import HTMLParser

HERE = os.path.dirname(os.path.abspath(__file__))
SITE = os.path.dirname(HERE)
DATA = os.path.join(HERE, 'data')
sys.path.insert(0, HERE)

ORIGIN = 'https://nostrix.ae'
WA = '971561195226'
PHONE = '+971 56 119 5226'
EMAIL = 'marketing@nostrix.ae'
IG = 'https://www.instagram.com/nostrix.ae/'
TT = 'https://www.tiktok.com/@nostrix.ae'
MAPS = ('https://www.google.com/maps/search/?api=1&amp;query=American%20University%20of%20Ras%20Al%20Khaimah'
        '%20-%20American%20University%20of%20Ras%20Al%20Khaimah%20Road%20-%20Road%20-%20Ras%20Al%20Khaimah')
ADDRESS = 'AURAK, Building H, Office 15, Ras Al Khaimah, UAE'


def load(name):
    with open(os.path.join(DATA, name), encoding='utf-8') as f:
        return json.load(f) if name.endswith('.json') else f.read()


def e(s):
    return html.escape(str(s), quote=True)


def wa(text=''):
    from urllib.parse import quote
    return 'https://wa.me/' + WA + ('?text=' + quote(text, safe='') if text else '')


def ic(name, cls=''):
    return '<svg class="ic %s" aria-hidden="true"><use href="#i-%s"/></svg>' % (cls, name)


LOGO_PATH = ('M1714.1,411.8h-802.5c-39.9,0-72.2,32.3-72.2,72.2v817.1c0,19.9,16.2,36.1,36.1,36.1h791.8V490.1'
             'c0-18.4,14.9-33.3,33.3-33.3h27.4c8.5,0,4.9-2.1,6,34.1l31.2,846.3h732.9l-9.2-201.4c-64.6-446-324.3-724-774.9-724Z')

SPRITE = '''<svg class="sprite" aria-hidden="true" focusable="false"><defs>
<linearGradient id="nx-g" x1="0" y1="1" x2="1" y2="0"><stop offset="0" stop-color="#D388FF"/><stop offset="1" stop-color="#B9CCFF"/></linearGradient>
<symbol id="i-logo" viewBox="830 402 2180 945"><path fill="url(#nx-g)" d="''' + LOGO_PATH + '''"/><circle fill="url(#nx-g)" cx="2537.9" cy="874.5" r="462.7"/></symbol>
<symbol id="i-arrow" viewBox="0 0 24 24"><path d="M5 12h14M13 6l6 6-6 6"/></symbol>
<symbol id="i-arrow-ur" viewBox="0 0 24 24"><path d="M7 17 17 7M8 7h9v9"/></symbol>
<symbol id="i-chev-r" viewBox="0 0 24 24"><path d="m9 5 7 7-7 7"/></symbol>
<symbol id="i-chev-l" viewBox="0 0 24 24"><path d="m15 5-7 7 7 7"/></symbol>
<symbol id="i-x" viewBox="0 0 24 24"><path d="M6 6l12 12M18 6 6 18"/></symbol>
<symbol id="i-check" viewBox="0 0 24 24"><path d="m5 12.5 4.5 4.5L19 7.5"/></symbol>
<symbol id="i-play" viewBox="0 0 24 24"><path fill="currentColor" stroke="none" d="M8 5v14l11-7z"/></symbol>
<symbol id="i-sun" viewBox="0 0 24 24"><circle cx="12" cy="12" r="4"/><path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.3 5.3l1.4 1.4M17.3 17.3l1.4 1.4M5.3 18.7l1.4-1.4M17.3 6.7l1.4-1.4"/></symbol>
<symbol id="i-moon" viewBox="0 0 24 24"><path d="M20 14.2A8 8 0 0 1 9.8 4 7.5 7.5 0 1 0 20 14.2Z"/></symbol>
<symbol id="i-mail" viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="14" rx="3"/><path d="m4 7.5 8 6 8-6"/></symbol>
<symbol id="i-phone" viewBox="0 0 24 24"><path d="M5.5 4h3l1.8 4.6-2.3 1.5a11.5 11.5 0 0 0 5.9 5.9l1.5-2.3L20 15.5v3a2 2 0 0 1-2.2 2A15.5 15.5 0 0 1 3.5 6.2 2 2 0 0 1 5.5 4Z"/></symbol>
<symbol id="i-pin" viewBox="0 0 24 24"><path d="M12 21s7-6.1 7-11a7 7 0 1 0-14 0c0 4.9 7 11 7 11Z"/><circle cx="12" cy="10" r="2.5"/></symbol>
<symbol id="i-instagram" viewBox="0 0 24 24"><rect x="3.5" y="3.5" width="17" height="17" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.3" cy="6.7" r=".7" fill="currentColor"/></symbol>
<symbol id="i-tiktok" viewBox="0 0 16 16"><path fill="currentColor" stroke="none" d="M9 0h1.98c.144.715.54 1.617 1.235 2.512C12.895 3.389 13.797 4 15 4v2c-1.753 0-3.07-.814-4-1.829V11a5 5 0 1 1-5-5v2a3 3 0 1 0 3 3V0Z"/></symbol>
<symbol id="i-whatsapp" viewBox="0 0 16 16"><path fill="currentColor" stroke="none" d="M13.601 2.326A7.854 7.854 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.933 7.933 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.898 7.898 0 0 0 13.6 2.326zM7.994 14.521a6.573 6.573 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.557 6.557 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592zm3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.346.1-.114.133-.198.198-.33.065-.134.034-.248-.015-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.34-.114-.007-.247-.007-.38-.007a.729.729 0 0 0-.529.247c-.182.198-.691.677-.691 1.654 0 .977.71 1.916.81 2.049.098.133 1.394 2.132 3.383 2.992.47.205.84.326 1.129.418.475.152.904.129 1.246.08.38-.058 1.171-.48 1.338-.943.164-.464.164-.86.114-.943-.049-.084-.182-.133-.38-.232z"/></symbol>
<symbol id="i-lock" viewBox="0 0 24 24"><rect x="5" y="10.5" width="14" height="10" rx="2.5"/><path d="M8 10.5V8a4 4 0 0 1 8 0v2.5"/></symbol>
<symbol id="i-doc" viewBox="0 0 24 24"><path d="M7 3h7l4 4v14H7zM14 3v4h4M10 12.5h5M10 16.5h5"/></symbol>
<symbol id="i-clock" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></symbol>
<symbol id="i-card" viewBox="0 0 24 24"><rect x="3" y="5.5" width="18" height="13" rx="2.5"/><path d="M3 10h18"/></symbol>
<symbol id="i-send" viewBox="0 0 24 24"><path d="M21 3 10.5 13.5M21 3l-6.5 18-4-7.5-7.5-4z"/></symbol>
<symbol id="i-sliders" viewBox="0 0 24 24"><path d="M4 7h10M18 7h2M4 17h2M10 17h10"/><circle cx="16" cy="7" r="2"/><circle cx="8" cy="17" r="2"/></symbol>
<symbol id="i-star" viewBox="0 0 24 24"><path fill="currentColor" stroke="none" d="m12 3 2.7 5.6 6.1.8-4.5 4.3 1.1 6.1L12 16.9l-5.4 2.9 1.1-6.1L3.2 9.4l6.1-.8z"/></symbol>
</defs></svg>'''

BOOT = ("(function(){var d=document.documentElement;d.classList.add('js');try{var t=localStorage.getItem('nostrix_theme');"
        "if(t==='light'||t==='dark')d.dataset.theme=t;if(localStorage.getItem('nostrix_language_v1')==='ar')"
        "{d.lang='ar';d.dir='rtl';d.classList.add('i18n-wait')}}catch(e){}})();")

ORG_LD = {
    '@context': 'https://schema.org', '@type': 'ProfessionalService', 'name': 'Nostrix Marketing Services',
    'url': ORIGIN + '/', 'logo': ORIGIN + '/logo.png', 'image': ORIGIN + '/assets/img/og.jpg',
    'email': EMAIL, 'telephone': '+971561195226', 'areaServed': 'United Arab Emirates',
    'address': {'@type': 'PostalAddress', 'streetAddress': 'AURAK, Building H, Office 15',
                'addressLocality': 'Ras Al Khaimah', 'addressCountry': 'AE'},
    'sameAs': [IG, TT],
    'description': 'Photography, videography, social content, event coverage and branding for brands in the UAE.',
}


def brand():
    return ('<a class="brand" href="/" aria-label="Nostrix home" translate="no">'
            '<svg viewBox="0 0 34 15" aria-hidden="true"><use href="#i-logo"/></svg><span>NOSTRIX</span></a>')


def nav():
    return '''<header class="nav">
<div class="wrap nav-in">
''' + brand() + '''
<nav class="nav-links" id="menu" aria-label="Primary navigation">
<a href="/#services">Services</a>
<a href="/portfolio/">Work</a>
<a href="/pricing/">Pricing</a>
<a href="/#social">Social</a>
<a href="/#faq">Questions</a>
<div class="nav-mobile-only nav-menu-foot btn-row">
<a class="btn btn-primary" href="/#contact">Start a project</a>
<a class="btn btn-wa" href="''' + wa() + '''" target="_blank" rel="noopener noreferrer">''' + ic('whatsapp') + '''WhatsApp</a>
<button class="btn btn-ghost" type="button" data-theme-toggle>''' + ic('sun', 'ic-sun') + ic('moon', 'ic-moon') + '''<span>Appearance</span></button>
</div>
</nav>
<div class="nav-tools">
<button class="icon-btn lang-btn" type="button" data-lang-toggle translate="no" aria-label="تحويل الموقع إلى العربية">ع</button>
<button class="icon-btn nav-desktop-only" type="button" data-theme-toggle aria-label="Switch to light mode">''' + ic('sun', 'ic-sun') + ic('moon', 'ic-moon') + '''</button>
<a class="btn btn-primary btn-sm" href="/#contact">Start a project</a>
<button class="icon-btn menu-btn" type="button" aria-controls="menu" aria-expanded="false" aria-label="Open menu"><i></i><i></i></button>
</div>
</div>
</header>'''


def footer():
    return '''<footer class="footer">
<div class="wrap">
<div class="footer-grid">
<div>
''' + brand() + '''
<p>Made to be seen.</p>
<div class="footer-social">
<a href="''' + IG + '''" target="_blank" rel="noopener noreferrer" aria-label="Nostrix on Instagram">''' + ic('instagram') + '''</a>
<a href="''' + TT + '''" target="_blank" rel="noopener noreferrer" aria-label="Nostrix on TikTok">''' + ic('tiktok') + '''</a>
<a href="''' + wa() + '''" target="_blank" rel="noopener noreferrer" aria-label="Chat with Nostrix on WhatsApp">''' + ic('whatsapp') + '''</a>
<a href="mailto:''' + EMAIL + '''" aria-label="Email Nostrix">''' + ic('mail') + '''</a>
</div>
</div>
<div>
<h2>Explore</h2>
<ul>
<li><a href="/#services">Services</a></li>
<li><a href="/portfolio/">Portfolio</a></li>
<li><a href="/pricing/">Pricing</a></li>
<li><a href="/review/">Leave a review</a></li>
</ul>
</div>
<div>
<h2>Contact</h2>
<ul>
<li><a class="ltr" href="mailto:''' + EMAIL + '''">''' + EMAIL + '''</a></li>
<li><a class="ltr" href="tel:+971561195226">''' + PHONE + '''</a></li>
<li><a href="''' + MAPS + '''" target="_blank" rel="noopener noreferrer">''' + ADDRESS + '''</a></li>
</ul>
</div>
<div>
<h2>Legal</h2>
<ul>
<li><a href="/privacy/">Privacy Policy</a></li>
<li><a href="/terms/">Terms &amp; Conditions</a></li>
<li data-analytics-settings hidden><button type="button">Analytics settings</button></li>
</ul>
</div>
</div>
<div class="footer-base">
<p>© <span data-year>2026</span> Nostrix Marketing Services. All rights reserved.</p>
<p>Ras Al Khaimah, UAE</p>
</div>
</div>
</footer>
<a class="wa-float" href="''' + wa() + '''" target="_blank" rel="noopener noreferrer" aria-label="Chat with Nostrix on WhatsApp">''' + ic('whatsapp') + '''<span>WhatsApp</span></a>'''


def page(path, title, desc, body, css=(), js=(), head='', ld=None, noindex=False, canonical=None, config=True):
    url = ORIGIN + (canonical if canonical is not None else '/' + path.replace('index.html', ''))
    out = ['<!DOCTYPE html>', '<html lang="en" dir="ltr" data-theme="dark">', '<head>', '<meta charset="utf-8">',
           '<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">',
           '<title>%s</title>' % e(title), '<meta name="description" content="%s">' % e(desc),
           '<meta name="theme-color" content="#000000">', '<meta name="color-scheme" content="dark light">']
    if noindex:
        out.append('<meta name="robots" content="noindex">')
    else:
        out.append('<link rel="canonical" href="%s">' % url)
    out += ['<link rel="icon" type="image/png" href="/favicon.png">', '<link rel="apple-touch-icon" href="/favicon.png">',
            '<meta property="og:type" content="website">', '<meta property="og:site_name" content="Nostrix Marketing Services">',
            '<meta property="og:title" content="%s">' % e(title), '<meta property="og:description" content="%s">' % e(desc),
            '<meta property="og:url" content="%s">' % url, '<meta property="og:image" content="%s/assets/img/og.jpg">' % ORIGIN,
            '<meta name="twitter:card" content="summary_large_image">', '<script>%s</script>' % BOOT,
            '<link rel="stylesheet" href="/assets/css/site.css">']
    out += ['<link rel="stylesheet" href="/assets/css/%s.css">' % c for c in css]
    if head:
        out.append(head)
    for block in (ld or []):
        out.append('<script type="application/ld+json">%s</script>' % json.dumps(block, ensure_ascii=False, separators=(',', ':')))
    out += ['</head>', '<body>', '<a class="skip" href="#main">Skip to content</a>', SPRITE, nav(),
            '<main id="main">', body.strip(), '</main>', footer()]
    if config:
        out.append('<script src="/site-config.js"></script>')
    out.append('<script defer src="/assets/js/site.js"></script>')
    out += ['<script defer src="/assets/js/%s.js"></script>' % j for j in js]
    out += ['<script defer src="/analytics.js"></script>', '</body>', '</html>', '']
    full = os.path.join(SITE, path)
    os.makedirs(os.path.dirname(full), exist_ok=True)
    with open(full, 'w', encoding='utf-8') as f:
        f.write('\n'.join(out))
    return '\n'.join(out)


SERVICES = ['Photography', 'Videography', 'Content Creation', 'Social Media', 'Event Coverage', 'Brand Strategy', 'Other']
EVENTS = ['Corporate Event', 'Conference / Seminar', 'Product Launch', 'Grand Opening', 'Exhibition / Trade Show',
          'Wedding / Engagement', 'Birthday / Private Celebration', 'Graduation', 'Fashion Show', 'Sports Event',
          'Concert / Live Performance', 'Community / Cultural Event', 'Other Event']
CODES = [('+971', '🇦🇪'), ('+966', '🇸🇦'), ('+974', '🇶🇦'), ('+965', '🇰🇼'), ('+973', '🇧🇭'), ('+968', '🇴🇲'), ('+1', '🇺🇸'),
         ('+44', '🇬🇧'), ('+33', '🇫🇷'), ('+49', '🇩🇪'), ('+39', '🇮🇹'), ('+34', '🇪🇸'), ('+31', '🇳🇱'), ('+41', '🇨🇭'),
         ('+90', '🇹🇷'), ('+91', '🇮🇳'), ('+92', '🇵🇰'), ('+880', '🇧🇩'), ('+63', '🇵🇭'), ('+62', '🇮🇩'), ('+60', '🇲🇾'),
         ('+65', '🇸🇬'), ('+86', '🇨🇳'), ('+852', '🇭🇰'), ('+81', '🇯🇵'), ('+82', '🇰🇷'), ('+61', '🇦🇺'), ('+64', '🇳🇿'),
         ('+27', '🇿🇦'), ('+20', '🇪🇬'), ('+212', '🇲🇦'), ('+213', '🇩🇿'), ('+216', '🇹🇳'), ('+962', '🇯🇴'), ('+961', '🇱🇧'),
         ('+964', '🇮🇶'), ('+963', '🇸🇾'), ('+967', '🇾🇪'), ('+235', '🇹🇩'), ('+234', '🇳🇬'), ('+254', '🇰🇪'), ('+233', '🇬🇭')]


def opts(name, values, ids=None):
    ids = ids or {}
    return '\n'.join('<label class="opt"><input type="checkbox" name="%s" value="%s"%s><span>%s</span></label>'
                     % (name, e(v), ' id="%s"' % ids[v] if v in ids else '', e(v)) for v in values)


def code_select(id_, name='phone_code'):
    return ('<select class="control" id="%s" name="%s" aria-label="Phone country code" translate="no">' % (id_, name)
            + ''.join('<option value="%s">%s %s</option>' % (c, f, c) for c, f in CODES) + '</select>')


def service_fields(received=False):
    """Service and event-type pickers shared by the brief and review forms."""
    return '''<fieldset class="field" id="services-field">
<legend>''' + ('Services received' if received else 'Services') + ''' <span class="hint">Select all that apply.</span></legend>
<div class="opts" id="service-options">
''' + opts('services', SERVICES, {'Event Coverage': 'event-coverage-service', 'Other': 'other-service-checkbox'}) + '''
</div>
<p class="err" id="services-error" aria-live="polite"></p>
</fieldset>
<div class="field" id="custom-service-field" hidden>
<label for="custom-service">Other service</label>
<input class="control" id="custom-service" name="custom_service" type="text" maxlength="160" placeholder="Type the service">
</div>
<fieldset class="field" id="event-types-field" hidden>
<legend>Event type <span class="hint">Select all that apply.</span></legend>
<div class="opts" id="event-options">
''' + opts('event_types', EVENTS, {'Other Event': 'other-event-checkbox'}) + '''
</div>
<p class="err" id="event-types-error" aria-live="polite"></p>
</fieldset>
<div class="field" id="custom-event-field" hidden>
<label for="custom-event">Other event type</label>
<input class="control" id="custom-event" name="custom_event" type="text" maxlength="160" placeholder="Type the event">
</div>'''


if __name__ == '__main__':
    import pages
    pages.build_all()
