"""Builds assets/i18n/ar.js: the Arabic dictionary, limited to strings the site actually uses.

Sources, in priority order:
  1. ar_new.py      Arabic written for this site
  2. ar-legacy.json Arabic carried over from the previous site (packages, legal text)
Strings with no Arabic are listed at the end of the build so they can be added to ar_new.py.
"""
import json
import os
import re
from html.parser import HTMLParser

HERE = os.path.dirname(os.path.abspath(__file__))
SITE = os.path.dirname(HERE)

VOID = {'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'source', 'track', 'wbr', 'use', 'path',
        'circle', 'rect', 'stop'}
ATTRS = ('placeholder', 'aria-label', 'title', 'alt', 'data-label', 'data-text')

# Text set from JavaScript (status messages and labels).
JS_STRINGS = [
    'Loading posts…', 'Posts could not load here.', 'Open Instagram', 'Open TikTok', 'Show posts',
    'Select at least one service.', 'Select at least one event type.',
    'Add your name and phone number, and accept the privacy notice.', 'Opening WhatsApp with your brief…',
    'The form is not connected yet. Send it on WhatsApp instead.', 'Sending your brief…',
    'Brief sent. Nostrix will contact you to confirm the details.', 'The brief could not be sent. Send it on WhatsApp instead.',
    'Anonymous client', 'Close', 'Previous', 'Next', 'Portfolio viewer', 'Open menu', 'Close menu',
    'Switch to light mode', 'Switch to dark mode', 'Video',
    'We plan, shoot and edit the photos, reels and campaigns your brand needs. On location or in a studio, anywhere in the Emirates.',
    # analytics.js
    'Analytics.', 'We use Google Analytics to see which pages are useful. It only runs if you accept.', 'Privacy policy',
    'Decline', 'Accept', 'Analytics settings',
    # pricing.js (order form)
    'Sending your order…', 'Order received', 'Nostrix will contact you soon to confirm the details and send your quotation.',
    'The order could not be sent. Try again or continue on WhatsApp.',
    # review.js
    'Complete the required fields.', 'The review form is not connected yet.', 'Submitting your review…',
    'Thank you. Your review is now live on the Nostrix website.', 'Sending your brief…',
    'The review could not be submitted. Please try again or contact Support@nostrix.ae.',
    # pricing.js (estimate builder)
    'Rebrand complexity', 'Launch identity layer', 'Deep positioning workshop', 'Naming support', 'Social template kit',
    'Packaging concept', 'Photo/media art direction', 'Extended brand guide', 'Priority delivery', 'Project', 'Base custom scope',
    'Revision rounds', 'Target launch', 'To be confirmed', 'Category', 'Branding / Visual Identity', 'Turnaround', 'Priority',
    'Standard', '3rd platform', 'Bi-weekly strategy', 'Standard community support', 'Detailed reporting', 'Competitor monitoring',
    'Launch/campaign planning', 'Platforms', 'Monthly assets', 'Community', 'None', 'Light', 'Start date', 'Marketing Solutions',
    'Billing', 'Monthly retainer', 'Photography + video', 'Event / corporate', 'Creator / influencer', 'Pop-up / retail',
    'Product / e-commerce', 'Real estate', 'Automotive', 'Enhanced photo retouching', 'Advanced photo retouching', 'Final photos',
    'Photo editing', 'Essential colour / WB', 'Enhanced retouching', 'Advanced retouching', 'Main video edit', 'Video edit',
    'Selected clips only', 'Simple Reel', 'Professional Reel', '60 sec highlight', '90 sec highlight', 'Video format',
    'UAE travel fee', 'Rush turnaround', 'Services', 'Project category', 'Coverage', 'Crew', '2-person crew', '1 operator',
    'Location', 'Studio', 'Nostrix to arrange · quoted separately', 'Client-provided', 'No / on-location', 'Shoot date', 'Venue',
    'Custom brand scope', 'Custom retainer base', 'Coverage / crew', '15% website saving on eligible add-ons', 'Estimated total',
    'Custom Brand Build', 'Custom Marketing Retainer', 'Custom Production', 'New brand', 'Full rebrand', 'Brand refresh / upgrade',
    'Launch-focused identity',
    'Custom brand scopes include strategy, a complete logo system, colour/typography and a structured handover. Naming, packaging and extended applications are added only when selected.',
    'Ad spend, advanced SEO and third-party media are excluded. Professional production is included only when selected above.',
    'One-operator hybrid means the creator switches between photo and video. Dedicated simultaneous coverage requires the 2-person crew option.',
    'Travel is shown separately. Studio, permits, rentals and specialist equipment are quoted separately when required.',
]


def compact(s):
    return re.sub(r'\s+', ' ', s or '').strip()


def dynamic(s):
    """True when site.js translates the string by pattern, so no dictionary entry is needed."""
    return bool(
        re.match(r'^(From )?AED\s', s) or re.match(r'^\+\s*AED\s', s) or re.match(r'^Planning range:', s)
        or re.match(r'^\d+ (hours|extra applications|extra content assets|creator sessions?|photos above included volume|extra Reels?)$', s)
        or re.match(r'^\d+ of \d+$', s) or re.match(r'^\d out of 5 stars$', s))


class Collector(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.stack = []      # (tag, skip)
        self.found = []

    def skipping(self):
        return any(skip for _, skip in self.stack)

    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        skip = tag in ('script', 'style', 'textarea') or a.get('translate') == 'no'
        if not self.skipping() and a.get('translate') != 'no':
            for name in ATTRS:
                if a.get(name):
                    self.found.append(compact(a[name]))
        if tag not in VOID:
            self.stack.append((tag, skip))

    def handle_startendtag(self, tag, attrs):
        pass

    def handle_endtag(self, tag):
        for i in range(len(self.stack) - 1, -1, -1):
            if self.stack[i][0] == tag:
                del self.stack[i:]
                break

    def handle_data(self, data):
        if not self.skipping():
            self.found.append(compact(data))


def collect(pages):
    seen = []
    for text in pages.values():
        c = Collector()
        c.feed(text)
        seen += c.found
    seen += JS_STRINGS
    out = []
    for s in seen:
        if s and re.search(r'[A-Za-z]', s) and s not in out:
            out.append(s)
    return out


def write(pages):
    import importlib
    import ar_new
    importlib.reload(ar_new)
    with open(os.path.join(HERE, 'data', 'ar-legacy.json'), encoding='utf-8') as f:
        legacy = json.load(f)
    used = collect(pages)
    final, missing = {}, []
    for s in used:
        if s in ar_new.AR:
            if ar_new.AR[s] is not None:
                final[s] = ar_new.AR[s]
        elif s in legacy:
            final[s] = legacy[s]
        elif not dynamic(s):
            missing.append(s)
    # Words the pattern rules look up (View <label>, Play <label>, 2 × <item>).
    for s in list(used):
        m = re.match(r'^(?:View|Play) (.+)$', s) or re.match(r'^\d+ × (.+)$', s)
        if m:
            key = m.group(1)
            if key in ar_new.AR:
                final[key] = ar_new.AR[key]
            elif key in legacy:
                final[key] = legacy[key]
            if s in missing and key in final:
                missing.remove(s)
    os.makedirs(os.path.join(SITE, 'assets', 'i18n'), exist_ok=True)
    with open(os.path.join(SITE, 'assets', 'i18n', 'ar.js'), 'w', encoding='utf-8') as f:
        f.write('window.NOSTRIX_AR=' + json.dumps(final, ensure_ascii=False, separators=(',', ':')) + ';\n')
    print('arabic: %d strings in use, %d translated, %d missing' % (len(used), len(final), len(missing)))
    with open(os.path.join(HERE, 'data', 'missing-ar.txt'), 'w', encoding='utf-8') as f:
        f.write('\n'.join(missing) + '\n')
    return missing
