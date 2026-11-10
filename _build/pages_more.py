"""Pricing, portfolio, review, legal and 404 pages."""
import re

from build import (EMAIL, ORG_LD, code_select, e, ic, load, page, service_fields, wa)
from pages import CAT_LABEL, G, T

# ------------------------------------------------------------------ Pricing


def pcard(c, span=False):
    cls = 'pcard' + (' is-featured' if c['featured'] else '') + (' span-2' if span else '')
    top = '<span class="pcard-kicker">%s</span>' % e(c['kicker'])
    if c['badge']:
        top += '<span class="badge">%s</span>' % e(c['badge'])
    out = ['<article class="%s">' % cls, '<div class="pcard-top">%s</div>' % top,
           '<h3 class="pcard-name">%s</h3>' % e(c['name']),
           '<p class="pcard-price"><strong>%s</strong>%s</p>' % (e(c['price']), ' <span>%s</span>' % e(c['unit']) if c['unit'] else '')]
    if c['desc']:
        out.append('<p class="pcard-desc">%s</p>' % e(c['desc']))
    if c['fit']:
        out.append('<p class="pcard-fit">%s</p>' % e(c['fit']))
    out.append('<ul class="pcard-list">%s</ul>' % ''.join('<li>%s<span>%s</span></li>' % (ic('check'), e(f)) for f in c['features']))
    kind = 'btn-primary' if c['featured'] else 'btn-ghost'
    if c['builder']:
        out.append('<button class="btn %s btn-block" type="button" data-builder="%s">%s%s</button>' % (kind, c['builder'], ic('sliders'), e(c['cta'])))
    else:
        out.append('<button class="btn %s btn-block" type="button" data-package="%s" data-price="%s">%s</button>'
                   % (kind, e(c['package']), e(c['data_price']), e(c['cta'])))
    if c['note']:
        out.append('<p class="pcard-note">%s</p>' % e(c['note']))
    out.append('</article>')
    return '\n'.join(out)


def pgrid(cards):
    return '<div class="pgrid">\n%s\n</div>' % '\n'.join(
        pcard(c, span=bool(c['builder']) and len(cards) % 3 == 2) for c in cards)


def panel_head(d, heading):
    return ('<div class="panel-head"><div><h2 class="h2">%s</h2><p class="lead">%s</p></div><p class="panel-note">%s</p></div>'
            % (e(heading), e(d['copy']), e(d['note'])))


def sel(id_, options, selected=None):
    return '<select class="control calc" id="%s">%s</select>' % (id_, ''.join(
        '<option value="%s"%s>%s</option>' % (v, ' selected' if v == selected else '', e(t)) for v, t in options))


def bfield(label, control, hint=''):
    for_ = re.search(r'id="([^"]+)"', control).group(1)
    return '<div class="field"><label for="%s">%s</label>%s%s</div>' % (for_, e(label), control, '<small>%s</small>' % e(hint) if hint else '')


def bcheck(id_, label):
    return '<label class="bcheck"><input class="calc" id="%s" type="checkbox"><span>%s</span></label>' % (id_, e(label))


def num(id_, lo, hi, val):
    return '<input class="control calc" id="%s" type="number" inputmode="numeric" min="%d" max="%d" value="%d">' % (id_, lo, hi, val)


def date(id_):
    return '<input class="control calc" id="%s" type="date">' % id_


def builder_sheet():
    branding = '''<div class="builder-pane" data-pane="branding">
<div class="bgroup"><h4>Brand project</h4><div class="bgrid">
''' + bfield('Project type', sel('brandType', [('new', 'New brand'), ('rebrand', 'Full rebrand'), ('refresh', 'Brand refresh / upgrade'), ('launch', 'Launch-focused identity')])) + '''
''' + bfield('Strategy depth', sel('brandStrategy', [('standard', 'Strategy session included'), ('deep', 'Deep positioning workshop (+AED 650)')])) + '''
</div></div>
<div class="bgroup"><h4>Identity scope</h4><div class="bchecks">
''' + bcheck('brandNaming', 'Naming / naming direction (+AED 650)') + bcheck('brandSocialKit', 'Social template kit (+AED 550)') + bcheck('brandPackaging', 'Packaging concept (+AED 750)') + bcheck('brandArtDirection', 'Photo/media art direction (+AED 600)') + bcheck('brandExtendedGuide', 'Extended 25–35 page guide (+AED 650)') + '''
</div>
''' + bfield('Extra brand applications', num('brandApps', 0, 12, 0), 'Menu, signage, stationery, uniforms, presentation covers, etc. AED 180 each.') + '''
</div>
<div class="bgroup"><h4>Delivery</h4><div class="bgrid">
''' + bfield('Turnaround', sel('brandRush', [('standard', 'Standard delivery'), ('rush', 'Priority / rush (+25%)')])) + bfield('Target launch date', date('brandDate')) + '''
</div></div>
</div>'''
    marketing = '''<div class="builder-pane" data-pane="marketing">
<div class="bgroup"><h4>Monthly scope</h4><div class="bgrid">
''' + bfield('Platforms', sel('mktPlatforms', [('1', '1 platform'), ('2', '2 platforms'), ('3', '3 platforms')], '2')) + bfield('Content assets / month', num('mktAssets', 8, 30, 12)) + bfield('Strategy cadence', sel('mktStrategy', [('monthly', 'Monthly strategy'), ('biweekly', 'Bi-weekly strategy (+AED 350)')])) + '''
</div></div>
<div class="bgroup"><h4>Management</h4><div class="bgrid">
''' + bfield('Community management', sel('mktCommunity', [('light', 'Light support included'), ('none', 'No community management'), ('standard', 'Standard support (+AED 450)')])) + bfield('Reporting', sel('mktReporting', [('standard', 'Standard monthly report'), ('detailed', 'Detailed report + review (+AED 250)')])) + '''
</div><div class="bchecks">
''' + bcheck('mktCompetitor', 'Competitor/content monitoring (+AED 300)') + bcheck('mktLaunch', 'Launch/campaign planning layer (+AED 450)') + '''
</div></div>
<div class="bgroup"><h4>Production add-on</h4><div class="bgrid">
''' + bfield('Creator/content sessions', sel('mktShoots', [('0', 'No production included'), ('1', '1 creator session (+AED 850)'), ('2', '2 creator sessions (+AED 1,700)')]), 'For larger production, use the Production builder instead.') + bfield('Preferred start date', date('mktDate')) + '''
</div></div>
<p class="summary-note">Paid ad spend, advanced SEO, external media buying and third-party costs are not included in this estimator.</p>
</div>'''
    production = '''<div class="builder-pane" data-pane="production">
<div class="bgroup"><h4>What do you need?</h4>
<div class="opts" role="radiogroup" aria-label="What do you need?">
<label class="opt"><input class="calc" type="radio" name="prodService" value="photo" checked><span>Photography</span></label>
<label class="opt"><input class="calc" type="radio" name="prodService" value="video"><span>Videography</span></label>
<label class="opt"><input class="calc" type="radio" name="prodService" value="both"><span>Both</span></label>
</div>
<div class="bgrid">
''' + bfield('Project category', sel('prodCategory', [('event', 'Event / corporate coverage'), ('creator', 'Creator / influencer'), ('popup', 'Pop-up / retail activation'), ('product', 'Product / e-commerce'), ('realestate', 'Real estate'), ('automotive', 'Automotive')])) + bfield('Coverage hours', num('prodHours', 2, 12, 3), 'Minimum custom production booking: 2 hours.') + '''
</div></div>
<div class="bgroup" id="photoOptions"><h4>Photography</h4><div class="bgrid">
''' + bfield('Final edited photos', num('prodPhotos', 0, 500, 60)) + bfield('Editing level', sel('prodPhotoEdit', [('essential', 'Essential colour / WB'), ('enhanced', 'Enhanced retouching'), ('advanced', 'Advanced retouching')])) + bfield('Photo delivery', sel('prodPhotoDelivery', [('gallery', 'Online gallery'), ('social', 'Social + high-resolution')])) + '''
</div></div>
<div class="bgroup" id="videoOptions" hidden><h4>Video deliverables</h4><div class="bgrid">
''' + bfield('Main edit', sel('prodVideoEdit', [('none', 'Capture / selected clips only'), ('simple', 'Simple Reel (+AED 250)'), ('pro', 'Professional Reel (+AED 400)'), ('h60', '60 sec highlight (+AED 550)'), ('h90', '90 sec highlight (+AED 750)')])) + bfield('Extra Reels', num('prodExtraReels', 0, 10, 0)) + bfield('Video format', sel('prodFormat', [('vertical', 'Vertical / social'), ('landscape', 'Landscape / corporate'), ('mixed', 'Mixed deliverables')])) + '''
</div></div>
<div class="bgroup"><h4>Production details</h4><div class="bgrid">
''' + bfield('Crew', sel('prodCrew', [('one', '1 operator'), ('duo', '2-person crew')])) + bfield('Turnaround', sel('prodTurnaround', [('standard', 'Standard delivery'), ('48', '48 hours (+20%)'), ('24', '24 hours (+30%)'), ('same', 'Same-day (+50%)')])) + bfield('Emirate / area', sel('prodLocation', [('rak', 'Ras Al Khaimah'), ('uaq', 'Umm Al Quwain'), ('ajman', 'Ajman'), ('sharjah', 'Sharjah'), ('dubai', 'Dubai'), ('abudhabi', 'Abu Dhabi'), ('alain', 'Al Ain')])) + bfield('Studio', sel('prodStudio', [('no', 'No / on-location'), ('client', 'Client-provided studio'), ('arrange', 'Nostrix to arrange (quoted separately)')])) + bfield('Preferred shoot date', date('prodDate')) + bfield('Venue / exact location', '<input class="control calc" id="prodVenue" type="text" placeholder="Cafe, hotel, venue, property...">') + '''
</div></div>
</div>'''
    return '''<dialog class="sheet sheet-wide" id="builder-sheet" aria-labelledby="builderTitle">
<div class="sheet-panel">
<button class="sheet-close" type="button" data-close aria-label="Close">''' + ic('x') + '''</button>
<div class="sheet-head">
<p class="eyebrow">Estimate builder</p>
<h2 class="h3" id="builderTitle">Build a custom package</h2>
<p class="muted small">Adjust the scope. The estimate updates as you change it.</p>
</div>
<div class="sheet-body">
<div class="seg" role="tablist" aria-label="Estimate builder" style="margin-block-end:22px">
<button type="button" role="tab" data-btab="production" aria-selected="true">Production</button>
<button type="button" role="tab" data-btab="marketing" aria-selected="false">Marketing</button>
<button type="button" role="tab" data-btab="branding" aria-selected="false">Branding</button>
</div>
<div class="builder">
<div>
''' + production + marketing + branding + '''
</div>
<aside class="summary" aria-live="polite">
<div><p class="summary-label">Planning estimate</p>
<p class="summary-total" id="builderEstimate">AED 0</p>
<p class="summary-range" id="builderRange"></p></div>
<div><p class="summary-label">Scope summary</p><div id="scopeSummary"></div></div>
<div class="smeta" id="summaryMeta"></div>
<div><p class="summary-label">Price build-up</p><div id="priceBuildUp"></div></div>
<a class="btn btn-wa" id="builder-whatsapp" href="#" target="_blank" rel="noopener noreferrer">''' + ic('whatsapp') + '''Send estimate on WhatsApp</a>
<a class="btn btn-ghost" id="builder-email" href="#">''' + ic('mail') + '''Email estimate</a>
<p class="summary-note">No payment is required here. This is a planning estimate only; the final quotation confirms scope, availability and any project-specific requirements. <span id="builderNote"></span></p>
<p class="summary-note">Website booking benefit: 15% off eligible Nostrix add-ons only. Main package/coverage price, travel and third-party/pass-through costs are not discounted.</p>
</aside>
</div>
</div>
</div>
</dialog>'''


def pricing():
    d = load('pricing.json')
    prod, mkt, br, launch, rates = d['production'], d['marketing'], d['branding'], d['launch'], d['rates']
    sub_tabs = ''.join('<button type="button" role="tab" data-sub="%s" aria-selected="%s">%s</button>'
                       % (s['key'], 'true' if i == 0 else 'false', e(s['label'])) for i, s in enumerate(prod['subtabs']))
    sub_panels = '\n'.join('<div class="subpanel%s" data-subpanel="%s">\n%s\n</div>'
                           % (' is-on' if i == 0 else '', s['key'], pgrid(s['cards'])) for i, s in enumerate(prod['subtabs']))
    cols = ''.join('<div class="l360-col"><h3>%s</h3><ul>%s</ul></div>' % (
        e(c['title']), ''.join('<li>%s<span>%s</span></li>' % (ic('check'), e(x)) for x in c['items'])) for c in launch['columns'])
    rate_cards = ''.join('<div class="rate" data-reveal><h3 class="h3">%s</h3><p>%s</p><div class="rows">%s</div></div>' % (
        e(c['title']), e(c['copy']), ''.join('<div><span>%s</span><strong>%s</strong></div>' % (e(a), e(b)) for a, b in c['rows']))
        for c in rates['cards'])
    terms = ''.join('<span class="chip">%s</span>' % e(t) for t in rates['terms'])

    body = '''
<section class="page-hero center">
<div class="wrap">
<p class="eyebrow">Pricing</p>
<h1 class="h1">Clear prices.</h1>
<p class="lead">Compare packages, add extras or build an estimate. Final prices are confirmed in a written quote.</p>
<div class="btn-row" style="margin-block-start:28px">
<button class="btn btn-primary" type="button" data-builder="production">Build an estimate</button>
<a class="btn btn-ghost" href="#rates">Travel and add-ons</a>
</div>
</div>
</section>

<section class="wrap">
<div class="facts">
<div class="fact">''' + ic('pin') + '''<div><strong>UAE-based</strong><span>Coverage across the Emirates</span></div></div>
<div class="fact">''' + ic('doc') + '''<div><strong>Clear scope</strong><span>Deliverables confirmed before booking</span></div></div>
<div class="fact">''' + ic('sliders') + '''<div><strong>Planning estimate</strong><span>Build a realistic starting range</span></div></div>
<div class="fact">''' + ic('card') + '''<div><strong>Final quote first</strong><span>No online payment required</span></div></div>
</div>
<div class="offer">
<p><strong>Website booking benefit</strong> Receive 15% off eligible Nostrix add-ons on your first qualifying booking made through this page. Main package prices stay as shown. Travel, permits, studios, ad spend, rentals and third-party/pass-through costs are excluded. Terms apply.</p>
<a class="btn btn-ghost btn-sm" href="#rates">View add-ons</a>
</div>
</section>

<div class="tabbar" id="packages">
<div class="seg" role="tablist" aria-label="Choose a service">
<button type="button" role="tab" data-tab="production" aria-selected="true">Production</button>
<button type="button" role="tab" data-tab="marketing" aria-selected="false">Marketing Solutions</button>
<button type="button" role="tab" data-tab="branding" aria-selected="false">Branding</button>
</div>
</div>

<section class="section" style="padding-block-start:28px">
<div class="wrap">
<div class="panel is-on" data-panel="production">
''' + panel_head(prod, 'Production') + '''
<div class="seg subtabs" role="tablist" aria-label="Production">''' + sub_tabs + '''</div>
''' + sub_panels + '''
</div>
<div class="panel" data-panel="marketing">
''' + panel_head(mkt, 'Marketing Solutions') + '''
''' + pgrid(mkt['cards']) + '''
</div>
<div class="panel" data-panel="branding">
''' + panel_head(br, 'Branding / Visual Identity') + '''
''' + pgrid(br['cards']) + '''
</div>
</div>
</section>

<section class="section section-tint" id="launch">
<div class="wrap">
<div class="l360" data-reveal>
<div>
<p class="eyebrow">Launch package</p>
<h2 class="l360-title">Launch <span class="grad">360</span></h2>
<p class="lead">''' + e(launch['copy']) + '''</p>
<div class="l360-price"><small>Starting price</small><strong>''' + e(launch['price']) + '''</strong></div>
<button class="btn btn-primary" type="button" data-package="Nostrix Launch 360" data-price="From AED 7,900">''' + e(launch['cta']) + '''</button>
</div>
<div class="l360-cols">''' + cols + '''</div>
</div>
</div>
</section>

<section class="section" id="rates">
<div class="wrap">
<div class="head" data-reveal>
<p class="eyebrow">Extras</p>
<h2 class="h2">Travel and add-ons</h2>
<p class="lead">''' + e(rates['copy']) + '''</p>
</div>
<div class="rates">''' + rate_cards + '''</div>
<div class="terms" data-reveal>''' + terms + '''</div>
<p class="footnote">''' + e(rates['footnote']) + '''</p>
</div>
</section>

<section class="section section-tint">
<div class="wrap">
<div class="band" data-reveal>
<p class="eyebrow">Package help</p>
<h2 class="h2">Not sure which package fits?</h2>
<p class="lead">Tell us what you are planning and we will recommend the closest-fit scope. The goal is to match the job properly, not push you into a larger package than you need.</p>
<div class="btn-row">
<a class="btn btn-wa" href="''' + wa("Hi Nostrix, I'm not sure which package fits my project. Can you help me choose the right scope?") + '''" target="_blank" rel="noopener noreferrer">''' + ic('whatsapp') + '''Talk to Nostrix</a>
<a class="btn btn-ghost" href="/#contact">Start a project</a>
</div>
</div>
</div>
</section>

<dialog class="sheet" id="package-sheet" aria-labelledby="modalTitle">
<div class="sheet-panel">
<button class="sheet-close" type="button" data-close aria-label="Close">''' + ic('x') + '''</button>
<div class="sheet-head">
<p class="eyebrow">Selected package</p>
<h2 class="h3" id="modalTitle">Package</h2>
<p class="sheet-price" id="modalPrice"></p>
</div>
<div class="sheet-body">
<div id="order-choice">
<p class="muted">Order this package with a few details, or send it to Nostrix on WhatsApp or email. Final availability and scope are confirmed in the quotation.</p>
<button class="btn btn-primary order-start" id="order-start" type="button">Order now</button>
<div class="sheet-actions">
<a class="btn btn-wa" id="modalWhatsApp" href="#" target="_blank" rel="noopener noreferrer">''' + ic('whatsapp') + '''Continue on WhatsApp</a>
<a class="btn btn-ghost" id="modalEmail" href="#">''' + ic('mail') + '''Email Enquiry</a>
</div>
</div>
<form class="order-form" id="order-form" novalidate hidden>
<div class="field">
<label for="order-name">Name</label>
<input class="control" id="order-name" name="name" type="text" maxlength="120" autocomplete="name" required>
</div>
<div class="field">
<label for="order-phone">Phone number</label>
<div class="phone-row">''' + code_select('order-phone-code') + '''<input class="control" id="order-phone" name="phone" type="tel" inputmode="tel" autocomplete="tel-national" placeholder="50 123 4567" maxlength="30" required></div>
</div>
<div class="field">
<label for="order-email">Email <span class="hint">Optional</span></label>
<input class="control" id="order-email" name="email" type="email" inputmode="email" autocomplete="email" maxlength="200" placeholder="name@company.com">
</div>
<div class="field">
<label for="order-date">Preferred date <span class="hint">Optional</span></label>
<input class="control" id="order-date" name="date" type="date">
</div>
<div class="field">
<label for="order-notes">Notes <span class="hint">Optional</span></label>
<textarea class="control" id="order-notes" name="notes" maxlength="2000" placeholder="Location, brand and anything we should know"></textarea>
</div>
<input class="hp" type="text" name="website" tabindex="-1" autocomplete="off" aria-hidden="true">
<label class="check" for="order-privacy">
<input id="order-privacy" name="privacy" type="checkbox" required>
<span>I agree to share these details with Nostrix so the team can reply to my enquiry. <a href="/privacy/" target="_blank">Privacy policy</a></span>
</label>
<div class="order-buttons">
<button class="btn btn-ghost" id="order-back" type="button">Back</button>
<button class="btn btn-primary" id="order-send" type="submit">Send order</button>
</div>
<p class="status" id="order-status" role="status" aria-live="polite"></p>
</form>
<p class="summary-note">Prices shown on this page are planning rates. Final availability, deliverables, usage requirements and any excluded project costs are confirmed in the written quotation before booking.</p>
</div>
</div>
</dialog>
''' + builder_sheet()
    return page('pricing/index.html', 'Pricing — Nostrix Marketing Services',
                'Nostrix prices for photography, video, events, monthly content, social media and branding in the UAE. '
                'Compare packages or build an estimate.', body, css=['pages'], js=['pricing'], ld=[ORG_LD])


# ------------------------------------------------------------------ Portfolio

FILTERS = [('featured', 'Featured'), ('all', 'All Work'), ('modelling', 'Modelling'), ('events', 'Events'), ('wedding', 'Wedding'),
           ('automotive', 'Automotive'), ('products', 'Products'), ('real-estate', 'Real Estate'), ('videography', 'Videography')]


def portfolio():
    items = load('portfolio.json')
    cells = []
    for i, it in enumerate(items):
        hidden = '' if it['featured'] else ' hidden'
        eager = ' fetchpriority="high"' if i == 0 else ' loading="lazy"'
        img = '<img src="%s%s.webp" width="%d" height="%d" alt="Nostrix %s"%s decoding="async">' % (
            T, it['name'], it['tw'], it['th'], e(CAT_LABEL[it['cat']].lower()), eager)
        if it['video']:
            cells.append('<button class="g-item is-video" type="button" data-cat="%s" data-featured="%s" data-label="%s" data-video="%s" '
                         'data-w="%d" data-h="%d" aria-label="Play %s"%s>%s<span class="g-cap"><span class="g-play">%s</span><span>%s</span></span></button>'
                         % (it['cat'], str(it['featured']).lower(), e(it['label']), e(it['video']), it['w'], it['h'], e(it['label']), hidden, img, ic('play'), e(it['label'])))
        else:
            cells.append('<button class="g-item" type="button" data-cat="%s" data-featured="%s" data-label="%s" data-src="%s%s.webp" '
                         'data-w="%d" data-h="%d" aria-label="View %s"%s>%s<span class="g-cap"><span>%s</span></span></button>'
                         % (it['cat'], str(it['featured']).lower(), e(it['label']), G, it['name'], it['w'], it['h'], e(it['label']), hidden, img, e(it['label'])))
    tabs = ''.join('<button type="button" role="tab" data-filter="%s" aria-selected="%s">%s</button>' % (k, 'true' if k == 'featured' else 'false', e(l))
                   for k, l in FILTERS)
    body = '''
<section class="page-hero">
<div class="wrap">
<p class="eyebrow">Portfolio</p>
<h1 class="h1">Our work.</h1>
<p class="lead">Select a category. Open any item to view it full screen.</p>
</div>
</section>
<div class="tabbar"><div class="seg" role="tablist" aria-label="Portfolio categories">''' + tabs + '''</div></div>
<section class="wrap" style="padding-block:18px var(--section)">
<p class="g-count" id="g-count" aria-live="polite"></p>
<div class="gallery" id="gallery">
''' + '\n'.join(cells) + '''
</div>
</section>
<section class="section section-tint">
<div class="wrap">
<div class="band" data-reveal>
<h2 class="h2">Start a project.</h2>
<p class="lead">Tell us what you need. Send it on WhatsApp or submit it to our team.</p>
<div class="btn-row">
<a class="btn btn-primary" href="/#contact">Start a project</a>
<a class="btn btn-wa" href="''' + wa('Hello Nostrix, I was looking through your portfolio and would like to discuss a project.') + '''" target="_blank" rel="noopener noreferrer">''' + ic('whatsapp') + '''WhatsApp</a>
</div>
</div>
</div>
</section>
'''
    return page('portfolio/index.html', 'Nostrix Portfolio — Photography & Videography UAE',
                'Nostrix photography and video work: fashion, events, weddings, automotive, products and real estate in the UAE.',
                body, css=['pages'], js=['portfolio'], ld=[ORG_LD])


# ------------------------------------------------------------------ Review

def review():
    body = '''
<section class="page-hero">
<div class="wrap-narrow">
<p class="eyebrow">Reviews</p>
<h1 class="h1">Leave a review</h1>
<p class="lead">Rate your project and write a short review. It appears on our website right away.</p>
<div class="notice">''' + ic('lock') + '''<span><strong>Your improvement feedback stays private.</strong> Only your rating, public testimonial and chosen display name appear on the website.</span></div>
</div>
</section>
<section class="wrap-narrow" style="padding-block-end:var(--section)">
<form class="form-card" id="review-form" novalidate>
<fieldset class="field">
<legend>Overall rating</legend>
<div class="stars" role="radiogroup" aria-label="Choose a rating from one to five stars">
<input type="radio" id="star-5" name="rating" value="5" required><label for="star-5" title="5 stars">★</label>
<input type="radio" id="star-4" name="rating" value="4"><label for="star-4" title="4 stars">★</label>
<input type="radio" id="star-3" name="rating" value="3"><label for="star-3" title="3 stars">★</label>
<input type="radio" id="star-2" name="rating" value="2"><label for="star-2" title="2 stars">★</label>
<input type="radio" id="star-1" name="rating" value="1"><label for="star-1" title="1 star">★</label>
</div>
</fieldset>
<div class="form-grid">
<div class="field"><label for="name">Your name</label><input class="control" id="name" name="name" type="text" maxlength="100" autocomplete="name"></div>
<div class="field"><label for="email">Email address <span class="hint">Private — never published</span></label><input class="control" id="email" name="email" type="email" maxlength="160" autocomplete="email" required placeholder="you@example.com"></div>
<div class="field wide"><label for="company">Company or brand <span class="hint">Optional</span></label><input class="control" id="company" name="company" type="text" maxlength="120" autocomplete="organization"></div>
</div>
''' + service_fields(received=True) + '''
<div class="field">
<label for="instagram">Instagram username <span class="hint">Optional</span></label>
<input class="control ltr" id="instagram" name="instagram" type="text" maxlength="31" autocomplete="off" pattern="@?[A-Za-z0-9._]{1,30}" placeholder="@yourusername">
<span class="hint">Add only your username, such as @yourbrand. It stays private unless you tick the option below.</span>
<label class="check" for="showInstagram"><input id="showInstagram" name="showInstagram" type="checkbox" value="yes" disabled><span>Show my Instagram @ with my testimonial.</span></label>
</div>
<div class="field"><label for="liked">What did you like most about working with Nostrix?</label><textarea class="control" id="liked" name="liked" maxlength="1200" required placeholder="Tell us what worked well..."></textarea></div>
<div class="field"><label for="improve">What could we improve or fix? <span class="hint">Private — this will never be displayed publicly</span></label><textarea class="control" id="improve" name="improve" maxlength="1200" required placeholder="Please be honest. Write “Nothing” if you have no suggestions."></textarea></div>
<div class="field"><label for="testimonial">Short public testimonial</label><textarea class="control" id="testimonial" name="testimonial" maxlength="700" required placeholder="Write the review you would be happy for us to publish..."></textarea><span class="hint">Nostrix may correct minor spelling or punctuation, but will not change the meaning without your approval.</span></div>
<fieldset class="field">
<legend>How should your review be displayed?</legend>
<div class="choices">
<label class="opt"><input id="display-name" type="radio" name="displayPreference" value="name" required><span>Use my name</span></label>
<label class="opt"><input id="display-company" type="radio" name="displayPreference" value="company"><span>Use my company or brand name</span></label>
<label class="opt"><input id="display-anonymous" type="radio" name="displayPreference" value="anonymous"><span>Keep my identity anonymous</span></label>
</div>
</fieldset>
<label class="check" for="publishConsent"><input id="publishConsent" name="publishConsent" type="checkbox" value="yes" required><span>I confirm that this feedback reflects my experience and give Nostrix permission to publish the public testimonial, rating, selected display name and Instagram username when I choose that option.</span></label>
<div class="hp" aria-hidden="true"><label for="website">Website</label><input id="website" name="website" type="text" tabindex="-1" autocomplete="off"></div>
<div>
<button class="btn btn-primary" type="submit" id="submit-review">''' + ic('send') + '''Submit review</button>
<p class="status" id="review-status" role="status" aria-live="polite" style="margin-block-start:12px"></p>
</div>
</form>
</section>
'''
    return page('review/index.html', 'Leave a Review | Nostrix Marketing Services',
                'Rate your Nostrix project and leave a short review. Reviews appear on the site right away.',
                body, css=['pages'], js=['review'])


# ------------------------------------------------------------------ Legal and 404

def legal(name, title, desc):
    main = load(name + '.html')
    inner = main[main.index('>') + 1:main.rindex('</main>')]
    inner = inner.replace('class="page-hero legal-hero"', 'class="page-hero"').replace('class="container"', 'class="wrap"')
    inner = inner.replace('<h1>', '<p class="eyebrow">Legal</p>\n<h1 class="h1">', 1)
    body = '<div class="legal">' + inner + '</div>'
    return page(name + '/index.html', title, desc, body, css=['pages'], config=True)


def notfound():
    body = '''
<section class="lost">
<p class="lost-code grad" aria-hidden="true">404</p>
<h1 class="h2">Page not found</h1>
<p class="lead">This page doesn’t exist or has moved.</p>
<div class="btn-row">
<a class="btn btn-primary" href="/">Back to home</a>
<a class="btn btn-ghost" href="/portfolio/">See the work</a>
</div>
</section>
'''
    return page('404.html', 'Page Not Found — Nostrix', 'This page doesn’t exist or has moved.', body, css=['pages'], noindex=True)


def redirect(path, target):
    """Old flat URLs (privacy.html, review.html) keep working."""
    import os
    from build import SITE, ORIGIN
    html_ = ('<!DOCTYPE html>\n<html lang="en">\n<head>\n<meta charset="utf-8">\n<title>Nostrix</title>\n'
             '<link rel="canonical" href="%s%s">\n<meta http-equiv="refresh" content="0; url=%s">\n</head>\n'
             '<body><a href="%s">Continue</a></body>\n</html>\n' % (ORIGIN, target, target, target))
    with open(os.path.join(SITE, path), 'w', encoding='utf-8') as f:
        f.write(html_)


def sitemap():
    import os
    from build import SITE, ORIGIN
    rows = [('/', 'weekly', '1.0'), ('/pricing/', 'monthly', '0.9'), ('/portfolio/', 'monthly', '0.9'),
            ('/review/', 'monthly', '0.5'), ('/privacy/', 'yearly', '0.3'), ('/terms/', 'yearly', '0.3')]
    xml = ['<?xml version="1.0" encoding="UTF-8"?>', '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">']
    xml += ['  <url><loc>%s%s</loc><changefreq>%s</changefreq><priority>%s</priority></url>' % (ORIGIN, p, c, pr) for p, c, pr in rows]
    xml.append('</urlset>\n')
    with open(os.path.join(SITE, 'sitemap.xml'), 'w', encoding='utf-8') as f:
        f.write('\n'.join(xml))
    with open(os.path.join(SITE, 'robots.txt'), 'w', encoding='utf-8') as f:
        f.write('User-agent: *\nAllow: /\nDisallow: /staff/\n\nSitemap: %s/sitemap.xml\n' % ORIGIN)


def build():
    out = {
        'pricing/index.html': pricing(),
        'portfolio/index.html': portfolio(),
        'review/index.html': review(),
        'privacy/index.html': legal('privacy', 'Privacy Policy — Nostrix Marketing Services',
                                    'How Nostrix Marketing Services collects, uses, shares and protects personal data.'),
        'terms/index.html': legal('terms', 'Terms & Conditions — Nostrix Marketing Services',
                                  'Terms for using the Nostrix website and online enquiry tools.'),
        '404.html': notfound(),
    }
    redirect('privacy.html', '/privacy/')
    redirect('review.html', '/review/')
    os_makedirs_services()
    sitemap()
    return out


def os_makedirs_services():
    import os
    from build import SITE
    os.makedirs(os.path.join(SITE, 'services'), exist_ok=True)
    redirect('services/index.html', '/#services')
