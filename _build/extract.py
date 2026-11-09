#!/usr/bin/env python3
"""One-time extraction of content from the previous Nostrix site copy.

Reads ../../Nostrix-redesign-2 and writes plain data files into _build/data/.
build.py only needs those data files, so this script does not need to run again.
"""
import html
import json
import os
import re
import struct

HERE = os.path.dirname(os.path.abspath(__file__))
SITE = os.path.dirname(HERE)
SRC = os.path.join(os.path.dirname(SITE), 'Nostrix-redesign-2')
OUT = os.path.join(HERE, 'data')
os.makedirs(OUT, exist_ok=True)


def read(path):
    with open(path, encoding='utf-8') as f:
        return f.read()


def text(fragment):
    return re.sub(r'\s+', ' ', html.unescape(re.sub(r'<[^>]+>', ' ', fragment))).strip()


def first(pattern, s, default=''):
    m = re.search(pattern, s, flags=re.S)
    return text(m.group(1)) if m else default


# ---------- Pricing ----------
p = read(os.path.join(SRC, 'pricing', 'index.html'))


def parse_card(block):
    btn = re.search(r'<button class="([^"]*)"([^>]*)>(.*?)</button>', block, flags=re.S)
    attrs = dict(re.findall(r'data-([\w-]+)="([^"]*)"', btn.group(2)))
    return {
        'kicker': first(r'class="pricing-kicker">(.*?)</span>', block),
        'badge': first(r'class="pricing-badge">(.*?)</span>', block),
        'name': first(r'class="pricing-name">(.*?)</h4>', block),
        'price': first(r'class="pricing-price"><strong>(.*?)</strong>', block),
        'unit': first(r'class="pricing-price"><strong>.*?</strong><span>(.*?)</span>', block),
        'desc': first(r'class="pricing-description">(.*?)</p>', block),
        'fit': first(r'class="pricing-fit">(.*?)</div>', block),
        'features': [text(x) for x in re.findall(r'class="pricing-feature">(.*?)</div>', block, flags=re.S)],
        'cta': text(btn.group(3)),
        'package': html.unescape(attrs.get('package', '')),
        'data_price': html.unescape(attrs.get('price', '')),
        'builder': attrs.get('builder', ''),
        'featured': 'is-featured' in block[:120],
        'note': first(r'class="custom-note">(.*?)</p>', block),
    }


def cards(fragment):
    return [parse_card(b) for b in re.findall(r'<article class="pricing-card.*?</article>', fragment, flags=re.S)]


def panel(key):
    start = p.index('data-panel="%s"' % key)
    nxt = re.search(r'<div class="package-panel[^>]*data-panel="', p[start + 10:])
    end = start + 10 + nxt.start() if nxt else p.index('id="launch360"')
    frag = p[start:end]
    data = {
        'title': first(r'class="panel-title">(.*?)</h3>', frag),
        'copy': first(r'class="section-copy">(.*?)</p>', frag),
        'note': first(r'class="panel-note">(.*?)</p>', frag),
    }
    subs = re.findall(r'<button class="subtab[^"]*" data-subtab="([^"]+)">(.*?)</button>', frag, flags=re.S)
    if subs:
        data['subtabs'] = []
        for sk, label in subs:
            a = frag.index('data-subpanel="%s"' % sk)
            m = re.search(r'data-subpanel="', frag[a + 10:])
            b = a + 10 + m.start() if m else len(frag)
            data['subtabs'].append({'key': sk, 'label': text(label), 'cards': cards(frag[a:b])})
    else:
        data['cards'] = cards(frag)
    return data


pricing = {k: panel(k) for k in ('production', 'marketing', 'branding')}

l = p[p.index('id="launch360"'):p.index('id="rates"')]
pricing['launch'] = {
    'copy': first(r'class="section-copy">(.*?)</p>', l),
    'detail': first(r'class="flagship-copy">(.*?)</p>', l),
    'price': first(r'class="flagship-price"><small>.*?</small><strong>(.*?)</strong>', l),
    'cta': first(r'<button class="primary-button package-contact"[^>]*>(.*?)</button>', l),
    'columns': [
        {'title': text(t), 'items': [text(x) for x in re.findall(r'<li>(.*?)</li>', body, flags=re.S)]}
        for t, body in re.findall(r'<div class="flagship-col">.*?<h4>(.*?)</h4><ul>(.*?)</ul>', l, flags=re.S)
    ],
}

r = p[p.index('id="rates"'):p.index('class="fit-guidance')]
pricing['rates'] = {
    'copy': first(r'class="section-copy">(.*?)</p>', r),
    'cards': [
        {
            'title': text(t), 'copy': text(c),
            'rows': [[text(a), text(b)] for a, b in re.findall(r'class="price-row"><span>(.*?)</span><strong>(.*?)</strong>', rows, flags=re.S)],
        }
        for t, c, rows in re.findall(r'class="info-card"><h3>(.*?)</h3><p>(.*?)</p><div class="price-list">(.*?)</div></div>', r, flags=re.S)
    ],
    'terms': [text(x) for x in re.findall(r'class="term-chip">(.*?)</span>', r, flags=re.S)],
    'footnote': first(r'class="rates-footnote[^"]*">(.*?)</p>', r),
}
json.dump(pricing, open(os.path.join(OUT, 'pricing.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
n = sum(len(st['cards']) for st in pricing['production']['subtabs']) + len(pricing['marketing']['cards']) + len(pricing['branding']['cards'])
print('pricing cards:', n)


# ---------- Portfolio ----------
def dims(path):
    with open(path, 'rb') as f:
        d = f.read(40)
    kind = d[12:16]
    if kind == b'VP8 ':
        w, h = struct.unpack('<HH', d[26:30])
        return w & 0x3fff, h & 0x3fff
    if kind == b'VP8L':
        b = struct.unpack('<I', d[21:25])[0]
        return (b & 0x3fff) + 1, ((b >> 14) & 0x3fff) + 1
    return int.from_bytes(d[24:27], 'little') + 1, int.from_bytes(d[27:30], 'little') + 1


g = read(os.path.join(SRC, 'portfolio', 'index.html'))
items = []
for b in re.findall(r'<button[^>]*class="gallery-item[^>]*>.*?</button>', g, flags=re.S):
    a = dict(re.findall(r'([\w-]+)="([^"]*)"', b[:b.index('>') + 1]))
    name = re.search(r'<img[^>]*src="/portfolio/gallery/([^"]+)\.webp"', b).group(1)
    w, h = dims(os.path.join(SITE, 'portfolio', 'gallery', name + '.webp'))
    tw, th = dims(os.path.join(SITE, 'portfolio', 'gallery', 'thumbs', name + '.webp'))
    items.append({
        'name': name, 'cat': a['data-category'], 'featured': a.get('data-featured') == 'true',
        'label': html.unescape(a.get('data-label', '')), 'video': a.get('data-video', ''),
        'w': w, 'h': h, 'tw': tw, 'th': th,
    })
json.dump(items, open(os.path.join(OUT, 'portfolio.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
print('portfolio items:', len(items))

# ---------- Legal pages ----------
for name in ('privacy', 'terms'):
    s = read(os.path.join(SRC, name, 'index.html'))
    main = s[s.index('<main'):s.index('</main>') + 7]
    open(os.path.join(OUT, name + '.html'), 'w', encoding='utf-8').write(main)
    print(name, len(main))

# ---------- Arabic dictionary from the previous site ----------
s = read(os.path.join(SRC, 'language.js'))
a = s.index('const T=') + len('const T=')
b = s.index('};', a)
T = json.loads(s[a:b + 1])
pair = re.compile(r'("(?:[^"\\]|\\.)*")\s*:\s*("(?:[^"\\]|\\.)*")')
for blk in re.finditer(r'Object\.assign\(T,\{(.*?)\}\);', s[b:], flags=re.S):
    for k, v in pair.findall(blk.group(1)):
        T[json.loads(k)] = json.loads(v)
json.dump(T, open(os.path.join(OUT, 'ar-legacy.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=0)
print('arabic entries:', len(T))
