// Public endpoints used by nostrix.ae: visit tracking, reviews, enquiries and the portfolio.
import { db, allow, setting, CATEGORIES } from './db.js';
import { fail, now, today, uuid, sha256, str, bool, device, isBot, geo, sameOrigin } from './util.js';

function source(ref, host) {
  if (!ref) return 'direct';
  let h;
  try { h = new URL(ref).hostname.toLowerCase(); } catch { return 'direct'; }
  if (h === host || h.endsWith('nostrix.ae') || h.endsWith('nostrix.pages.dev')) return 'internal';
  if (/instagram\./.test(h)) return 'instagram';
  if (/tiktok\./.test(h)) return 'tiktok';
  if (/(^|\.)google\./.test(h)) return 'google';
  return 'other';
}

async function visitor(ctx) {
  const ip = ctx.request.headers.get('cf-connecting-ip') || '';
  const ua = ctx.request.headers.get('user-agent') || '';
  return (await sha256((await setting(ctx.env, 'salt')) + today() + ip + ua)).slice(0, 16);
}

const NAMES = new Set(['package', 'whatsapp', 'call', 'email', 'estimate', 'instagram', 'tiktok', 'review', 'enquiry', 'outbound']);

export async function collect(ctx, input) {
  const ua = ctx.request.headers.get('user-agent') || '';
  if (isBot(ua) || !sameOrigin(ctx.request)) return { ok: false };
  const type = input.t === 'click' ? 'click' : 'view';
  const name = type === 'click' ? str(input.n, 30) : null;
  if (type === 'click' && !NAMES.has(name)) return { ok: false };
  const path = (str(input.p, 200) || '/').split(/[?#]/)[0];
  const g = geo(ctx.request), stamp = now();
  await db(ctx.env).prepare('INSERT INTO events(at,day,type,path,name,label,source,device,lang,country,city,lat,lon,visitor) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?)')
    .bind(stamp, stamp.slice(0, 10), type, path, name, str(input.l, 120), type === 'view' ? source(str(input.r, 400), new URL(ctx.request.url).hostname) : null,
      device(ua), input.lang === 'ar' ? 'ar' : 'en', g.country, g.city, g.lat, g.lon, await visitor(ctx)).run();
  return { ok: true };
}

const reviewOut = (r) => ({
  id: r.id, displayName: r.display_name || 'Anonymous client', testimonial: r.testimonial, rating: r.rating,
  service: r.service, instagram: r.show_instagram ? r.instagram : '', created_at: r.created_at
});

export async function listReviews(ctx) {
  const { results } = await db(ctx.env).prepare('SELECT * FROM reviews WHERE deleted_at IS NULL ORDER BY created_at DESC LIMIT 200').all();
  return results.map(reviewOut);
}

const ipKey = async (ctx, kind) => kind + ':' + (await sha256(ctx.request.headers.get('cf-connecting-ip') || 'unknown')).slice(0, 24);

export async function submitReview(ctx, input) {
  if (!sameOrigin(ctx.request)) fail(403, 'badOrigin');
  if (str(input.website)) return { ok: true }; // spam trap
  if (!(await allow(ctx.env, await ipKey(ctx, 'review'), 3, 3600))) fail(429, 'tooMany', 'Too many reviews from this connection. Try again later.');
  const testimonial = str(input.testimonial, 1200);
  const rating = Math.round(+input.rating);
  if (!testimonial || testimonial.length < 10) fail(400, 'shortReview', 'Write a review of at least 10 characters.');
  if (!(rating >= 1 && rating <= 5)) fail(400, 'badRating', 'Choose a rating.');
  if (input.publishConsent !== 'yes' && input.publishConsent !== true) fail(400, 'consent', 'Agree to publishing your review.');
  const pref = ['name', 'company', 'anonymous'].includes(input.displayPreference) ? input.displayPreference : 'anonymous';
  const name = str(input.name, 80), company = str(input.company, 80);
  const display = pref === 'name' && name ? name : pref === 'company' && company ? company : 'Anonymous client';
  const handle = (str(input.instagram, 60) || '').replace(/^https?:\/\/(www\.)?instagram\.com\//i, '').replace(/^@/, '').split(/[/?#]/)[0];
  const id = uuid();
  await db(ctx.env).prepare('INSERT INTO reviews(id,display_name,name,company,display_pref,email,instagram,show_instagram,service,rating,testimonial,liked,improve,invoice,source,created_at) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)')
    .bind(id, display, name, company, pref, str(input.email, 200), /^[A-Za-z0-9._]{1,30}$/.test(handle) ? handle : null,
      bool(input.showInstagram === 'yes' || input.showInstagram === true), str(input.service, 300), rating, testimonial,
      str(input.liked, 1200), str(input.improve, 1200), str(input.invoice, 60), 'website', now()).run();
  return { ok: true, id };
}

export async function submitEnquiry(ctx, input) {
  if (!sameOrigin(ctx.request)) fail(403, 'badOrigin');
  if (str(input.website)) return { ok: true };
  if (!(await allow(ctx.env, await ipKey(ctx, 'enquiry'), 6, 3600))) fail(429, 'tooMany', 'Too many requests from this connection. Try again later.');
  const name = str(input.name, 120), phone = str(input.phone, 40), mail = str(input.email, 200);
  if (!name || (!phone && !mail)) fail(400, 'missing', 'Add your name and a phone number or email.');
  await db(ctx.env).prepare('INSERT INTO enquiries(id,source,package,price,name,company,email,phone,services,event_types,budget,timeline,needs,page_url,created_at) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)')
    .bind(uuid(), str(input.source, 60), str(input.package, 120), str(input.price, 60), name, str(input.company, 120), mail, phone,
      str(input.services, 500), str(input.eventTypes, 300), str(input.budget, 80), str(input.timeline, 120), str(input.needs, 4000),
      str(input.pageUrl, 300), now()).run();
  return { ok: true };
}

export async function publicPortfolio(ctx) {
  const { results } = await db(ctx.env).prepare('SELECT id,category,label,src,thumb,video,w,h,tw,th,featured FROM portfolio WHERE published=1 ORDER BY sort,created_at').all();
  return { categories: CATEGORIES, items: results.map((r) => ({ ...r, featured: !!r.featured })) };
}

export async function media(ctx, key) {
  if (!/^pf\/[\w-]{1,80}\.webp$/.test(key || '')) fail(404, 'notFound');
  const cache = caches.default, hit = await cache.match(ctx.request);
  if (hit) return hit;
  if (!ctx.env.MEDIA) fail(503, 'notConfigured');
  const value = await ctx.env.MEDIA.get(key, { type: 'stream' });
  if (!value) fail(404, 'notFound');
  const res = new Response(value, { headers: { 'content-type': 'image/webp', 'cache-control': 'public, max-age=31536000, immutable', 'x-content-type-options': 'nosniff' } });
  ctx.waitUntil?.(cache.put(ctx.request, res.clone()));
  return res;
}
