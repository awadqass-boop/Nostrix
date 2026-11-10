// Website management data for /staff/website/ (needs Website access).
import { db, CATEGORIES, audit } from './db.js';
import { requireWebsite, requireAdmin } from './auth.js';
import { fail, now, today, uuid, str } from './util.js';

const catName = (id) => CATEGORIES.find((c) => c.id === id)?.en || id;
const day = (offset, base = today()) => new Date(Date.parse(base + 'T12:00:00Z') + offset * 864e5).toISOString().slice(0, 10);
const span = (from, to) => Math.round((Date.parse(to) - Date.parse(from)) / 864e5) + 1;
const change = (value, prev) => (prev ? Math.round(((value - prev) / prev) * 1000) / 10 : value ? 100 : 0);
const share = (rows) => {
  const total = rows.reduce((s, r) => s + r.count, 0) || 1;
  return rows.map((r) => ({ ...r, percent: Math.round((r.count / total) * 100) }));
};

export async function stats(ctx, url) {
  await requireWebsite(ctx);
  const DB = db(ctx.env), t = today();
  let to = url.searchParams.get('to') || t, from = url.searchParams.get('from') || day(-6, to);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(from) || !/^\d{4}-\d{2}-\d{2}$/.test(to) || from > to || span(from, to) > 366) fail(400, 'invalidRange');
  const n = span(from, to), prevFrom = day(-n, from);
  const earliest = [prevFrom, day(-59, t)].sort()[0];
  const { results: daily } = await DB.prepare("SELECT day, COUNT(DISTINCT visitor) AS n FROM events WHERE type='view' AND day>=? AND day<=? GROUP BY day")
    .bind(earliest, [to, t].sort().at(-1)).all();
  const per = Object.fromEntries(daily.map((r) => [r.day, r.n]));
  const sum = (a, b) => { let s = 0; for (let d = a; d <= b; d = day(1, d)) s += per[d] || 0; return s; };
  const series = Array.from({ length: n }, (_, i) => ({ date: day(i, from), count: per[day(i, from)] || 0, previous: per[day(i, prevFrom)] || 0 }));
  const totals = {
    today: { value: per[t] || 0, change: change(per[t] || 0, per[day(-1, t)] || 0) },
    week: { value: sum(day(-6, t), t), change: change(sum(day(-6, t), t), sum(day(-13, t), day(-7, t))) },
    month: { value: sum(day(-29, t), t), change: change(sum(day(-29, t), t), sum(day(-59, t), day(-30, t))) }
  };
  const group = async (col, extra = '') => (await DB.prepare(`SELECT ${col} AS id, COUNT(DISTINCT day||visitor) AS count FROM events WHERE type='view' AND day>=? AND day<=? ${extra} GROUP BY ${col}`).bind(from, to).all()).results;
  const src = { instagram: 0, tiktok: 0, google: 0, direct: 0 };
  for (const r of await group('source', "AND source!='internal'")) src[src[r.id] !== undefined ? r.id : 'direct'] += r.count;
  const dev = { mobile: 0, desktop: 0, tablet: 0 };
  for (const r of await group('device')) if (dev[r.id] !== undefined) dev[r.id] += r.count;
  const { results: pages } = await DB.prepare("SELECT path AS id, COUNT(*) AS count FROM events WHERE type='view' AND day>=? AND day<=? GROUP BY path ORDER BY count DESC LIMIT 10").bind(from, to).all();
  return {
    today: t, from, to, count: series.reduce((s, r) => s + r.count, 0), totals, series,
    traffic: share(Object.entries(src).map(([id, count]) => ({ id, count }))),
    devices: share(Object.entries(dev).map(([id, count]) => ({ id, count }))),
    pages: share(pages)
  };
}

export async function visitorMap(ctx, url) {
  await requireWebsite(ctx);
  const DB = db(ctx.env), days = Math.min(Math.max(+url.searchParams.get('days') || 7, 1), 90);
  const since = new Date(Date.now() - days * 864e5).toISOString(), live = new Date(Date.now() - 5 * 60e3).toISOString();
  const { results } = await DB.prepare("SELECT country, city, ROUND(AVG(lat),2) AS lat, ROUND(AVG(lon),2) AS lon, MAX(at) AS at, COUNT(DISTINCT day||visitor) AS count, SUM(at>?) AS recent FROM events WHERE type='view' AND at>? AND lat IS NOT NULL GROUP BY country, city ORDER BY at DESC LIMIT 500")
    .bind(live, since).all();
  const now5 = (await DB.prepare("SELECT COUNT(DISTINCT visitor) AS n FROM events WHERE at>?").bind(live).first()).n;
  return { days, live: now5, sites: results.map((r) => ({ ...r, recent: !!r.recent })) };
}

export async function clicks(ctx, url) {
  await requireWebsite(ctx);
  const DB = db(ctx.env), days = Math.min(Math.max(+url.searchParams.get('days') || 30, 1), 366);
  const from = day(1 - days), to = today();
  const { results: packages } = await DB.prepare("SELECT label AS name, COUNT(*) AS count FROM events WHERE type='click' AND name='package' AND day>=? GROUP BY label ORDER BY count DESC LIMIT 30").bind(from).all();
  const { results: names } = await DB.prepare("SELECT name AS id, COUNT(*) AS count FROM events WHERE type='click' AND name!='package' AND day>=? GROUP BY name").bind(from).all();
  const by = Object.fromEntries(names.map((r) => [r.id, r.count]));
  return { from, to, packages, actions: ['whatsapp', 'call', 'email', 'estimate', 'instagram', 'tiktok'].map((id) => ({ id, count: by[id] || 0 })) };
}

// ---- Enquiries ----
export async function enquiries(ctx) {
  await requireWebsite(ctx);
  return (await db(ctx.env).prepare('SELECT * FROM enquiries ORDER BY created_at DESC LIMIT 1000').all()).results.map((r) => ({ ...r, handled: !!r.handled }));
}
export async function setEnquiry(ctx, id, input) {
  const u = await requireWebsite(ctx);
  await db(ctx.env).prepare('UPDATE enquiries SET handled=? WHERE id=?').bind(input.handled ? 1 : 0, id).run();
  const e = await db(ctx.env).prepare('SELECT name FROM enquiries WHERE id=?').bind(id).first();
  await audit(ctx.env, u, 'website', input.handled ? 'Marked enquiry handled' : 'Reopened enquiry', e?.name);
  return { ok: true };
}
export async function deleteEnquiry(ctx, id) {
  const u = await requireAdmin(ctx);
  const e = await db(ctx.env).prepare('SELECT name, phone, email FROM enquiries WHERE id=?').bind(id).first();
  await db(ctx.env).prepare('DELETE FROM enquiries WHERE id=?').bind(id).run();
  if (e) await audit(ctx.env, u, 'website', 'Deleted enquiry', e.name, [e.phone, e.email].filter(Boolean).join(' · '));
  return { ok: true };
}

// ---- Reviews (published immediately; staff can only remove spam) ----
export async function reviews(ctx) {
  await requireWebsite(ctx);
  return (await db(ctx.env).prepare('SELECT * FROM reviews WHERE deleted_at IS NULL ORDER BY created_at DESC LIMIT 1000').all()).results;
}
export async function removeReview(ctx, id) {
  const u = await requireWebsite(ctx);
  const r = await db(ctx.env).prepare('SELECT display_name, rating, testimonial FROM reviews WHERE id=?').bind(id).first();
  await db(ctx.env).prepare('UPDATE reviews SET deleted_at=?, deleted_by=? WHERE id=? AND deleted_at IS NULL').bind(now(), u.id, id).run();
  if (r) await audit(ctx.env, u, 'website', 'Removed review', r.display_name, (r.rating ? r.rating + '★ · ' : '') + String(r.testimonial || '').slice(0, 160));
  return { ok: true };
}
export async function importReviews(ctx, input) {
  const u = await requireAdmin(ctx);
  const DB = db(ctx.env), stmts = [];
  for (const r of (Array.isArray(input.reviews) ? input.reviews : []).slice(0, 500)) {
    const text = str(r.testimonial, 1200);
    if (!text) continue;
    const sid = str(r.id, 80) || text.slice(0, 60);
    const created = /^\d{4}-\d{2}-\d{2}/.test(r.created_at || '') ? r.created_at : now();
    stmts.push(DB.prepare("INSERT INTO reviews(id,display_name,service,rating,testimonial,instagram,show_instagram,source,source_id,created_at) SELECT ?,?,?,?,?,?,?,'google-sheet',?,? WHERE NOT EXISTS (SELECT 1 FROM reviews WHERE source_id=?)")
      .bind(uuid(), str(r.displayName, 80) || 'Anonymous client', str(r.service, 300), Math.max(0, Math.min(5, Math.round(+r.rating || 0))) || null, text,
        str(r.instagram, 60), r.instagram ? 1 : 0, sid, created, sid));
  }
  if (stmts.length) await DB.batch(stmts);
  await audit(ctx.env, u, 'website', 'Imported old reviews', null, stmts.length + ' reviews');
  return { imported: stmts.length };
}

// ---- Notes ----
export async function notes(ctx) {
  await requireWebsite(ctx);
  return (await db(ctx.env).prepare('SELECT n.*, u.display_name, u.email FROM notes n LEFT JOIN users u ON u.id=n.user_id ORDER BY n.pinned DESC, n.created_at DESC LIMIT 300').all()).results.map((r) => ({ ...r, pinned: !!r.pinned }));
}
export async function addNote(ctx, input) {
  const u = await requireWebsite(ctx);
  const text = str(input.text, 2000);
  if (!text) fail(400, 'invalidNote');
  const id = uuid();
  await db(ctx.env).prepare('INSERT INTO notes(id,user_id,text,created_at) VALUES(?,?,?,?)').bind(id, u.id, text, now()).run();
  await audit(ctx.env, u, 'website', 'Posted note', null, text.slice(0, 160));
  return { id };
}
export async function updateNote(ctx, id, input) {
  const u = await requireWebsite(ctx);
  const DB = db(ctx.env), note = await DB.prepare('SELECT * FROM notes WHERE id=?').bind(id).first();
  if (!note) fail(404, 'notFound');
  if ('text' in input) {
    if (note.user_id !== u.id) fail(403, 'notAuthor');
    const text = str(input.text, 2000);
    if (!text) fail(400, 'invalidNote');
    await DB.prepare('UPDATE notes SET text=?, updated_at=? WHERE id=?').bind(text, now(), id).run();
    await audit(ctx.env, u, 'website', 'Edited note', null, text.slice(0, 160));
  }
  if ('pinned' in input) {
    await DB.prepare('UPDATE notes SET pinned=? WHERE id=?').bind(input.pinned ? 1 : 0, id).run();
    await audit(ctx.env, u, 'website', input.pinned ? 'Pinned note' : 'Unpinned note', null, String(note.text).slice(0, 160));
  }
  return { ok: true };
}
export async function deleteNote(ctx, id) {
  const u = await requireWebsite(ctx);
  const DB = db(ctx.env), note = await DB.prepare('SELECT * FROM notes WHERE id=?').bind(id).first();
  if (!note) return { ok: true };
  if (note.user_id !== u.id && !u.is_admin) fail(403, 'notAuthor');
  await DB.prepare('DELETE FROM notes WHERE id=?').bind(id).run();
  await audit(ctx.env, u, 'website', 'Deleted note', null, String(note.text).slice(0, 160));
  return { ok: true };
}

// ---- Portfolio ----
export async function portfolio(ctx) {
  await requireWebsite(ctx);
  const { results } = await db(ctx.env).prepare('SELECT * FROM portfolio ORDER BY sort, created_at').all();
  return { categories: CATEGORIES, items: results.map((r) => ({ ...r, featured: !!r.featured, published: !!r.published })) };
}
export async function createPhoto(ctx, input) {
  const u = await requireWebsite(ctx);
  const category = CATEGORIES.some((c) => c.id === input.category) ? input.category : null;
  if (!category) fail(400, 'badCategory');
  const id = 'up-' + uuid().slice(0, 18), num = (v, max) => Math.max(1, Math.min(Math.round(+v) || 1, max));
  const DB = db(ctx.env);
  const top = (await DB.prepare('SELECT MIN(sort) AS s FROM portfolio WHERE category=?').bind(category).first())?.s ?? 0;
  await DB.prepare('INSERT INTO portfolio(id,category,label,src,thumb,w,h,tw,th,featured,published,sort,media_key,created_by,created_at) VALUES(?,?,?,?,?,?,?,?,?,0,0,?,?,?,?)')
    .bind(id, category, str(input.label, 120) || CATEGORIES.find((c) => c.id === category).en,
      '/api/media/pf/' + id + '.webp', '/api/media/pf/' + id + '-t.webp', num(input.w, 8000), num(input.h, 8000), num(input.tw, 2000), num(input.th, 2000),
      top - 1, id, u.id, now()).run();
  await audit(ctx.env, u, 'website', 'Uploaded photo (hidden)', str(input.label, 120) || catName(category), catName(category));
  return { id };
}
export async function putPhoto(ctx, id, kind) {
  await requireWebsite(ctx);
  if (!/^up-[\w-]{1,40}$/.test(id) || !['full', 'thumb'].includes(kind)) fail(400, 'badPath');
  const row = await db(ctx.env).prepare('SELECT id FROM portfolio WHERE id=?').bind(id).first();
  if (!row) fail(404, 'notFound');
  if ((+ctx.request.headers.get('content-length') || 0) > 8 * 1024 * 1024) fail(413, 'tooLarge');
  if (!ctx.env.MEDIA) fail(503, 'notConfigured');
  await ctx.env.MEDIA.put('pf/' + id + (kind === 'thumb' ? '-t' : '') + '.webp', ctx.request.body);
  return { ok: true };
}
export async function updatePhoto(ctx, id, input) {
  const u = await requireWebsite(ctx);
  const sets = [], args = [];
  if ('label' in input) { sets.push('label=?'); args.push(str(input.label, 120)); }
  if ('category' in input) {
    if (!CATEGORIES.some((c) => c.id === input.category)) fail(400, 'badCategory');
    sets.push('category=?'); args.push(input.category);
  }
  if ('featured' in input) { sets.push('featured=?'); args.push(input.featured ? 1 : 0); }
  if ('published' in input) { sets.push('published=?'); args.push(input.published ? 1 : 0); }
  if (!sets.length) return { ok: true };
  await db(ctx.env).prepare(`UPDATE portfolio SET ${sets.join(',')}, updated_at=? WHERE id=?`).bind(...args, now(), id).run();
  const p = await db(ctx.env).prepare('SELECT label, category FROM portfolio WHERE id=?').bind(id).first();
  const what = 'published' in input ? (input.published ? 'Published photo' : 'Hid photo') : 'featured' in input ? (input.featured ? 'Added photo to Featured' : 'Removed photo from Featured') : 'Edited photo';
  await audit(ctx.env, u, 'website', what, p?.label || id, p ? catName(p.category) : null);
  return { ok: true };
}
export async function deletePhoto(ctx, id) {
  const u = await requireWebsite(ctx);
  const DB = db(ctx.env), row = await DB.prepare('SELECT * FROM portfolio WHERE id=?').bind(id).first();
  if (!row) return { ok: true };
  if (row.media_key && ctx.env.MEDIA) await Promise.all([ctx.env.MEDIA.delete('pf/' + row.media_key + '.webp'), ctx.env.MEDIA.delete('pf/' + row.media_key + '-t.webp')]);
  await DB.prepare('DELETE FROM portfolio WHERE id=?').bind(id).run();
  await audit(ctx.env, u, 'website', 'Deleted photo', row.label || id, catName(row.category));
  return { ok: true };
}
export async function reorderPhotos(ctx, input) {
  const u = await requireWebsite(ctx);
  const ids = (Array.isArray(input.ids) ? input.ids : []).slice(0, 500).map(String);
  const DB = db(ctx.env);
  if (ids.length) await DB.batch(ids.map((id, i) => DB.prepare('UPDATE portfolio SET sort=? WHERE id=?').bind(i, id)));
  await audit(ctx.env, u, 'website', 'Reordered photos', catName(input.category));
  return { ok: true };
}

// ---- Activity log (admins) ----
export async function activityLog(ctx, url) {
  await requireAdmin(ctx);
  const limit = Math.min(Math.max(+url.searchParams.get('limit') || 400, 1), 1000);
  const { results } = await db(ctx.env).prepare(`
    SELECT at, email, name, area, action, target, detail FROM audit_log
    UNION ALL
    SELECT s.at, s.email, u.display_name, 'login', CASE s.ok WHEN 1 THEN 'Signed in' ELSE 'Failed sign-in attempt' END, NULL,
      TRIM(COALESCE(s.city || ', ', '') || COALESCE(s.country, '') || COALESCE(' · ' || s.device, ''))
    FROM sign_ins s LEFT JOIN users u ON u.id = s.user_id
    ORDER BY at DESC LIMIT ?`).bind(limit).all();
  return results;
}
