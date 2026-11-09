"""Page bodies for the Nostrix site. Used by build.py."""
from build import (ADDRESS, EMAIL, IG, MAPS, ORG_LD, PHONE, TT, code_select, e, ic, load, page, service_fields, wa)

G = '/portfolio/gallery/'
T = G + 'thumbs/'

PILLARS = [  # name, height %, parallax, stagger
    ('products-08', 56, 1, 0), ('automotive-01', 70, .66, 1), ('modelling-08', 85, .33, 2), ('modelling-01', 100, 0, 3),
    ('modelling-07', 85, .33, 2), ('automotive-02', 70, .66, 1), ('products-05', 56, 1, 0),
]

FAQ = [
    ('Where do you work?',
     'We are based in Ras Al Khaimah and shoot across the UAE. Travel outside Ras Al Khaimah is one fixed fee per booking: '
     'Umm Al Quwain AED 75, Ajman AED 125, Sharjah AED 150, Dubai AED 200, Abu Dhabi AED 300 and Al Ain AED 350.'),
    ('How do I book?',
     'Send a brief or message us on WhatsApp. We confirm the scope, deliverables, timeline and price in a written quote. '
     'A 50% deposit books the date. No online payment is needed on this website.'),
    ('When do I get my files?',
     'On the delivery date agreed in your quote. 24-hour delivery is available for an extra 30%.'),
    ('How many revisions are included?',
     'One revision round, unless your package states otherwise.'),
    ('Can I get the RAW files?',
     'Yes. RAW photo files are an extra AED 250. RAW video footage starts at an extra AED 500.'),
    ('Do you offer monthly content?',
     'Yes. Creator Monthly is AED 1,490 per month and Business Content is AED 2,490 per month. '
     'Both have a 3-month commitment and are prepaid monthly.'),
    ('What is not included in the price?',
     'Travel outside Ras Al Khaimah, venue permits, studio hire, rentals, ad spend and other third-party costs. '
     'Each one is listed separately in your quote.'),
]

STATEMENT = ('We plan, shoot and edit the photos, reels and campaigns your brand needs. '
             'On location or in a studio, anywhere in the Emirates.')

CAT_LABEL = {'modelling': 'Modelling', 'events': 'Events', 'wedding': 'Wedding', 'automotive': 'Automotive',
             'products': 'Products', 'real-estate': 'Real Estate', 'videography': 'Videography'}


def shot(it, i):
    ar = '%d / %d' % (it['w'], it['h'])
    wide = it['w'] > it['h']
    img = '<img src="%s%s.webp"' % (T, it['name'])
    if wide and not it['video']:
        img += ' srcset="%s%s.webp %dw, %s%s.webp %dw" sizes="(max-width: 700px) 86vw, 720px"' % (
            T, it['name'], it['tw'], G, it['name'], it['w'])
    img += ' width="%d" height="%d" alt="" loading="lazy" decoding="async">' % (it['tw'], it['th'])
    if it['video']:
        attrs = 'data-video="%s" aria-label="Play %s"' % (e(it['video']), e(it['label']))
        cap = '<span class="shot-play">%s</span><span>%s</span>' % (ic('play'), e(it['label']))
    else:
        attrs = 'data-src="%s%s.webp" aria-label="View %s"' % (G, it['name'], e(it['label']))
        cap = '<span>%s</span>' % e(it['label'])
    return ('<button class="shot" type="button" style="--ar:%s" data-w="%d" data-h="%d" data-label="%s" %s>%s'
            '<span class="shot-cap">%s</span></button>') % (ar, it['w'], it['h'], e(it['label']), attrs, img, cap)


def home():
    items = load('portfolio.json')
    featured = [it for it in items if it['featured']]
    pillars = '\n'.join(
        '<div class="pillar" style="--h:%d;--k:%s;--s:%d"><div class="pillar-in"><img src="%shero/%s.webp" alt="" width="480" height="720" decoding="async"%s></div></div>'
        % (h, k, s, T, name, ' fetchpriority="high"' if h >= 85 else '')
        for name, h, k, s in PILLARS)
    faq = '\n'.join(
        '<details%s><summary>%s<i aria-hidden="true"></i></summary><p class="faq-a">%s</p></details>'
        % (' open' if i == 0 else '', e(q), e(a)) for i, (q, a) in enumerate(FAQ))
    social_cells = ''.join(
        '<i style="--n:%d%s"></i>' % (n, ";background-image:url('%shero/%s.webp')" % (T, name) if name else '')
        for n, name in enumerate(['products-08', '', 'modelling-08', '', 'automotive-01', '', 'modelling-07', '', 'products-05']))

    body = '''
<section class="hero" id="top">
<div class="wrap hero-copy">
<p class="eyebrow hero-fade" style="--i:0">Photography · Video · Social content</p>
<h1 class="hero-title"><span class="line"><span style="--i:0">Made to</span></span><span class="line"><span class="grad" style="--i:1">be seen.</span></span></h1>
<p class="hero-sub hero-fade" style="--i:2">Photos, reels and social content for brands across the UAE.</p>
<div class="btn-row hero-fade" style="--i:3">
<a class="btn btn-primary" href="#contact">Start a project</a>
<a class="btn btn-ghost" href="/portfolio/">See the work</a>
</div>
<p class="hero-note hero-fade" style="--i:4"><span>''' + ic('check') + '''Free 15-minute call</span><span>''' + ic('check') + '''Written quote before booking</span><span>''' + ic('check') + '''No online payment</span></p>
</div>
<div class="pillars" aria-hidden="true">
''' + pillars + '''
</div>
</section>

<section class="wrap statement-wrap">
<p class="statement" translate="no" data-text="''' + e(STATEMENT) + '''">''' + e(STATEMENT) + '''</p>
</section>

<section class="section section-tint" id="services">
<div class="wrap">
<div class="head" data-reveal>
<p class="eyebrow">Services</p>
<h2 class="h2">What we do.</h2>
<p class="lead">Book one service or combine them. Every project starts with a written quote.</p>
</div>
<div class="bento">
<a class="tile tile-a tile-photo" href="/pricing/#production" data-reveal>
<div class="tile-media"><img src="''' + T + '''modelling-12-1280.webp" srcset="''' + T + '''modelling-12.webp 640w, ''' + T + '''modelling-12-1280.webp 1280w" sizes="(max-width: 620px) 100vw, 66vw" width="1280" height="854" alt="" loading="lazy" decoding="async"></div>
<h3 class="tile-title">Photography</h3>
<p class="tile-text">Brand, product, automotive, property and campaign shoots.</p>
<div class="tile-foot"><span class="tile-price">From AED 650</span><span class="tile-go">''' + ic('arrow') + '''</span></div>
</a>
<a class="tile tile-b tile-photo" href="/pricing/#production" data-reveal style="--d:1">
<div class="tile-media"><img src="''' + G + '''automotive-08.webp" srcset="''' + T + '''automotive-08.webp 640w, ''' + G + '''automotive-08.webp 1024w" sizes="(max-width: 620px) 100vw, 40vw" width="1024" height="683" alt="" loading="lazy" decoding="async"></div>
<h3 class="tile-title">Video and Reels</h3>
<p class="tile-text">Reels, highlight videos and brand films.</p>
<div class="tile-foot"><span class="tile-price">From AED 650</span><span class="tile-go">''' + ic('arrow') + '''</span></div>
</a>
<a class="tile tile-c tile-photo" href="/pricing/#production" data-reveal>
<div class="tile-media"><img src="''' + T + '''wedding-01.webp" srcset="''' + T + '''wedding-01.webp 640w, ''' + G + '''wedding-01.webp 1568w" sizes="(max-width: 620px) 100vw, 34vw" width="640" height="427" alt="" loading="lazy" decoding="async"></div>
<h3 class="tile-title">Event coverage</h3>
<p class="tile-text">Photos and video for launches, activations and celebrations.</p>
<div class="tile-foot"><span class="tile-price">From AED 900</span><span class="tile-go">''' + ic('arrow') + '''</span></div>
</a>
<a class="tile tile-c" href="/pricing/#marketing" data-reveal style="--d:1">
<div class="tile-art" aria-hidden="true"><div class="art-social">''' + social_cells + '''</div></div>
<h3 class="tile-title">Social media</h3>
<p class="tile-text">Content plans, designed posts, captions and scheduling.</p>
<div class="tile-foot"><span class="tile-price">From AED 1,490 / month</span><span class="tile-go">''' + ic('arrow') + '''</span></div>
</a>
<a class="tile tile-c" href="/pricing/#branding" data-reveal style="--d:2">
<div class="tile-art" aria-hidden="true"><div class="art-brand"><svg viewBox="0 0 34 15"><use href="#i-logo"/></svg><div class="art-swatches"><i style="background:#D388FF"></i><i style="background:#B9CCFF"></i><i style="background:#0b0b0e"></i></div></div></div>
<h3 class="tile-title">Branding</h3>
<p class="tile-text">Logo, colours, type and brand guidelines.</p>
<div class="tile-foot"><span class="tile-price">From AED 1,490</span><span class="tile-go">''' + ic('arrow') + '''</span></div>
</a>
<div class="tile tile-wide" data-reveal>
<div class="launch">
<div>
<p class="eyebrow">Launch 360</p>
<h3 class="tile-title">Brand, launch plan and first content in one project.</h3>
<p class="tile-text">For founders and new companies. From AED 7,900.</p>
<div class="btn-row"><a class="btn btn-ghost" href="/pricing/#launch">View Launch 360</a></div>
</div>
<div class="launch-list">
<div><strong>Branding</strong>Logo suite, colours, type and a 20+ page brand guide.</div>
<div><strong>Marketing</strong>30-day launch plan, 12 launch posts and captions.</div>
<div><strong>Production</strong>Up to 4 hours of shooting, 25–30 edited photos and 3 Reels.</div>
</div>
</div>
</div>
</div>
</div>
</section>

<section class="section" id="work">
<div class="wrap work-head">
<div class="head" data-reveal>
<p class="eyebrow">Work</p>
<h2 class="h2">Recent work.</h2>
<p class="lead">Fashion, events, weddings, automotive, products and real estate.</p>
</div>
</div>
<div class="rail" id="work-rail" tabindex="0" role="group" aria-label="Selected Nostrix work">
''' + '\n'.join(shot(it, i) for i, it in enumerate(featured)) + '''
</div>
<div class="wrap rail-foot">
<a class="link" href="/portfolio/">View full portfolio''' + ic('chev-r') + '''</a>
<div class="rail-nav">
<button class="paddle" type="button" id="work-prev" aria-label="Previous">''' + ic('chev-l', 'ic-flip') + '''</button>
<button class="paddle" type="button" id="work-next" aria-label="Next">''' + ic('chev-r', 'ic-flip') + '''</button>
</div>
</div>
</section>

<section class="section section-tint" id="social">
<div class="wrap">
<div class="head" data-reveal>
<p class="eyebrow">Social</p>
<h2 class="h2">Latest posts.</h2>
<p class="lead">New work goes on Instagram and TikTok first.</p>
</div>
<div class="seg social-tabs" role="tablist" aria-label="Social feed">
<button type="button" role="tab" data-show="instagram" aria-selected="true">Instagram</button>
<button type="button" role="tab" data-show="tiktok" aria-selected="false">TikTok</button>
</div>
<div class="social-grid">
<article class="social-card" data-feed="instagram" data-profile="''' + IG + '''" data-reveal>
<div class="social-top">
<span class="social-ava ig">''' + ic('instagram') + '''</span>
<div class="social-id"><strong translate="no">@nostrix.ae</strong><span>Instagram</span></div>
<a class="btn btn-ghost btn-sm" href="''' + IG + '''" target="_blank" rel="noopener noreferrer">Follow</a>
</div>
<div class="social-body"><div class="social-wait"><span>Loading posts…</span></div></div>
</article>
<article class="social-card" data-feed="tiktok" data-profile="''' + TT + '''" data-reveal style="--d:1">
<div class="social-top">
<span class="social-ava tt">''' + ic('tiktok') + '''</span>
<div class="social-id"><strong translate="no">@nostrix.ae</strong><span>TikTok</span></div>
<a class="btn btn-ghost btn-sm" href="''' + TT + '''" target="_blank" rel="noopener noreferrer">Follow</a>
</div>
<div class="social-body"><div class="social-wait"><span>Loading posts…</span></div></div>
</article>
</div>
</div>
</section>

<section class="section" id="process">
<div class="wrap">
<div class="head" data-reveal>
<p class="eyebrow">Process</p>
<h2 class="h2">How it works.</h2>
</div>
<ol class="steps">
<li class="step" data-reveal><span class="step-n">1</span><h3 class="h3">Send a brief</h3><p>Tell us what you need and when.</p></li>
<li class="step" data-reveal style="--d:1"><span class="step-n">2</span><h3 class="h3">Approve the quote</h3><p>We confirm scope, deliverables, timeline and price in writing.</p></li>
<li class="step" data-reveal style="--d:2"><span class="step-n">3</span><h3 class="h3">We shoot</h3><p>We work on location or in a studio.</p></li>
<li class="step" data-reveal style="--d:3"><span class="step-n">4</span><h3 class="h3">Get your files</h3><p>We deliver edited files on the agreed date.</p></li>
</ol>
</div>
</section>

<section class="section section-tint" id="pricing">
<div class="wrap">
<div class="head" data-reveal>
<p class="eyebrow">Pricing</p>
<h2 class="h2">Clear prices.</h2>
<p class="lead">Fixed packages for common jobs. Build an estimate for anything else.</p>
</div>
<div class="plans">
<a class="plan" href="/pricing/#production" data-reveal>
<span class="plan-kicker">Creator</span>
<span class="plan-name">Creator Photo</span>
<span class="plan-price">AED 650 <small>/ 2 hours</small></span>
<ul><li>''' + ic('check') + '''10 selected final photos</li><li>''' + ic('check') + '''Essential exposure, WB &amp; colour correction</li><li>''' + ic('check') + '''Online delivery</li></ul>
<span class="link">View package''' + ic('chev-r') + '''</span>
</a>
<a class="plan" href="/pricing/#events" data-reveal style="--d:1">
<span class="plan-kicker">Events</span>
<span class="plan-name">Event Duo 2H</span>
<span class="plan-price">AED 1,750</span>
<ul><li>''' + ic('check') + '''1 photographer + 1 videographer</li><li>''' + ic('check') + '''30–50 edited photos</li><li>''' + ic('check') + '''30–45 sec edited highlight</li></ul>
<span class="link">View package''' + ic('chev-r') + '''</span>
</a>
<a class="plan" href="/pricing/#monthly" data-reveal style="--d:2">
<span class="plan-kicker">Monthly</span>
<span class="plan-name">Business Content</span>
<span class="plan-price">AED 2,490 <small>/ month</small></span>
<ul><li>''' + ic('check') + '''2 × 2-hour content sessions</li><li>''' + ic('check') + '''30 edited photos</li><li>''' + ic('check') + '''4 professionally edited Reels</li></ul>
<span class="link">View package''' + ic('chev-r') + '''</span>
</a>
</div>
<div class="offer" data-reveal>
<p><strong>15% off eligible add-ons</strong> on your first booking through this website. Package prices, travel and third-party costs are not discounted. Terms apply.</p>
<div class="btn-row">
<a class="btn btn-primary" href="/pricing/">View all pricing</a>
<a class="btn btn-ghost" href="/pricing/#estimate">Build an estimate</a>
</div>
</div>
</div>
</section>

<section class="section" id="reviews" hidden>
<div class="wrap work-head">
<div class="head">
<p class="eyebrow">Reviews</p>
<h2 class="h2">Client reviews.</h2>
</div>
</div>
<div class="rail reviews-rail" id="reviews-rail" tabindex="0" role="group" aria-label="Client reviews"></div>
<div class="wrap rail-foot">
<a class="link" href="/review/">Leave a review''' + ic('chev-r') + '''</a>
<div class="rail-nav" id="reviews-nav">
<button class="paddle" type="button" id="reviews-prev" aria-label="Previous">''' + ic('chev-l', 'ic-flip') + '''</button>
<button class="paddle" type="button" id="reviews-next" aria-label="Next">''' + ic('chev-r', 'ic-flip') + '''</button>
</div>
</div>
</section>

<section class="section" id="faq">
<div class="wrap-narrow">
<div class="head" data-reveal>
<p class="eyebrow">Questions</p>
<h2 class="h2">Before you book.</h2>
</div>
<div class="faq" data-reveal>
''' + faq + '''
</div>
</div>
</section>

<section class="section section-tint" id="contact">
<div class="wrap contact">
<div class="contact-side">
<p class="eyebrow">Contact</p>
<h2 class="h2">Start a project.</h2>
<p class="lead">Tell us what you need. Send it on WhatsApp or submit it to our team.</p>
<div class="contact-list">
<a href="''' + wa() + '''" target="_blank" rel="noopener noreferrer"><span class="ci">''' + ic('whatsapp') + '''</span><span><small>WhatsApp</small><span class="ltr">''' + PHONE + '''</span></span></a>
<a href="mailto:''' + EMAIL + '''"><span class="ci">''' + ic('mail') + '''</span><span><small>Email</small><span class="ltr">''' + EMAIL + '''</span></span></a>
<a href="''' + IG + '''" target="_blank" rel="noopener noreferrer"><span class="ci">''' + ic('instagram') + '''</span><span><small>Instagram</small><span class="ltr" translate="no">@nostrix.ae</span></span></a>
<a href="''' + TT + '''" target="_blank" rel="noopener noreferrer"><span class="ci">''' + ic('tiktok') + '''</span><span><small>TikTok</small><span class="ltr" translate="no">@nostrix.ae</span></span></a>
<a href="''' + MAPS + '''" target="_blank" rel="noopener noreferrer"><span class="ci">''' + ic('pin') + '''</span><span><small>Office</small><span>''' + ADDRESS + '''</span></span></a>
</div>
<div class="call-card">
<h3 class="h3">Not sure what you need?</h3>
<p>Book a free 15-minute call. We recommend the right mix of photo, video and content.</p>
<a class="btn btn-ghost btn-sm" href="''' + wa("Hi Nostrix, I'd like to book a free 15-minute creative strategy call.") + '''" target="_blank" rel="noopener noreferrer">''' + ic('whatsapp') + '''Book on WhatsApp</a>
</div>
</div>
<form class="brief" id="project-form" novalidate data-reveal>
<div class="brief-step">
<p class="label"><b>1</b>What do you need?</p>
''' + service_fields() + '''
</div>
<div class="brief-step">
<p class="label"><b>2</b>Project details <span class="hint">Optional</span></p>
<div class="form-grid">
<div class="field">
<label for="budget">Budget</label>
<select class="control" id="budget" name="budget">
<option value="">Select a range</option>
<option>Below AED 2,500</option>
<option>AED 2,500–5,000</option>
<option>AED 5,000–10,000</option>
<option>AED 10,000–25,000</option>
<option>AED 25,000+</option>
<option>Not sure yet</option>
<option value="custom">Other amount</option>
</select>
</div>
<div class="field" id="custom-budget-field" hidden>
<label for="custom-budget">Your budget</label>
<input class="control" id="custom-budget" name="custom_budget" type="text" inputmode="decimal" placeholder="For example: AED 7,500">
</div>
<div class="field">
<label for="timeline">Timeline</label>
<input class="control" id="timeline" name="timeline" type="text" placeholder="For example: this month">
</div>
<div class="field wide">
<label for="project-details">Details</label>
<textarea class="control" id="project-details" name="details" placeholder="Dates, location and what you want delivered."></textarea>
</div>
</div>
</div>
<div class="brief-step">
<p class="label"><b>3</b>Your contact</p>
<div class="form-grid">
<div class="field">
<label for="client-name">Name</label>
<input class="control" id="client-name" name="name" type="text" autocomplete="name" required>
</div>
<div class="field">
<label for="company">Company or brand <span class="hint">Optional</span></label>
<input class="control" id="company" name="company" type="text" autocomplete="organization">
</div>
<div class="field">
<label for="project-phone">Phone number</label>
<div class="phone-row">''' + code_select('project-phone-code') + '''<input class="control" id="project-phone" name="phone" type="tel" inputmode="tel" autocomplete="tel-national" placeholder="50 123 4567" required></div>
</div>
<div class="field">
<label for="project-email">Email <span class="hint">Optional</span></label>
<input class="control" id="project-email" name="email" type="email" inputmode="email" autocomplete="email" placeholder="name@company.com">
</div>
</div>
</div>
<label class="check" for="privacy-consent">
<input id="privacy-consent" name="privacy" type="checkbox" required>
<span>I agree to share these details with Nostrix so the team can reply to my enquiry. <a href="/privacy/" target="_blank">Privacy policy</a></span>
</label>
<div class="brief-actions">
<button class="btn btn-wa" type="submit">''' + ic('whatsapp') + '''Send on WhatsApp</button>
<button class="btn btn-ghost" id="email-project" type="button">''' + ic('send') + '''Submit brief</button>
</div>
<p class="status" id="form-status" role="status" aria-live="polite"></p>
</form>
</div>
</section>
'''
    faq_ld = {'@context': 'https://schema.org', '@type': 'FAQPage',
              'mainEntity': [{'@type': 'Question', 'name': q, 'acceptedAnswer': {'@type': 'Answer', 'text': a}} for q, a in FAQ]}
    head = '<link rel="preload" as="image" href="%shero/modelling-01.webp" fetchpriority="high">' % T
    return page('index.html', 'Nostrix Marketing Services — Made to be seen.',
                'Nostrix is a UAE creative team for photography, video, reels, social content, event coverage and branding. '
                'Clear prices and a written quote before booking.',
                body, css=['home'], js=['home'], head=head, ld=[ORG_LD, faq_ld])


def build_all():
    out = {'index.html': home()}
    try:
        import pages_more
        out.update(pages_more.build())
    except ImportError:
        pass
    import i18n
    i18n.write(out)
    for name, text in out.items():
        print('%-24s %6.1f KB' % (name, len(text.encode('utf-8')) / 1024))
