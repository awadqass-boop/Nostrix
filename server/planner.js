// Post planner and idea list for the Marketing hub, plus the prepared publishing path.
import { db, audit } from './db.js';
import { requireMarketing as requireWebsite, requireAdmin } from './auth.js';
import { fail, now, uuid, str, randomHex } from './util.js';

const STATUSES = ['idea', 'draft', 'ready', 'scheduled', 'posted'];
const PLATFORMS = ['instagram', 'tiktok'];
const FIELDS = 'id,title,caption_en,caption_ar,platforms,status,scheduled_at,notes,media_url,media_key,kind,published,created_by,created_at,updated_at';

const row = (r) => ({ ...r, platforms: safe(r.platforms, []), published: safe(r.published, {}) });
function safe(v, d) { try { return v ? JSON.parse(v) : d; } catch { return d; } }

export async function list(ctx) {
  await requireWebsite(ctx);
  const { results } = await db(ctx.env).prepare(`SELECT ${FIELDS} FROM posts ORDER BY COALESCE(scheduled_at, '9999') ASC, created_at DESC LIMIT 1000`).all();
  return { posts: results.map(row) };
}

function clean(input, base = {}) {
  const out = {};
  if ('title' in input) out.title = str(input.title, 200) || base.title || 'Untitled';
  for (const k of ['caption_en', 'caption_ar']) if (k in input) out[k] = str(input[k], 4000);
  if ('notes' in input) out.notes = str(input.notes, 2000);
  if ('status' in input) { if (!STATUSES.includes(input.status)) fail(400, 'badStatus'); out.status = input.status; }
  if ('kind' in input) out.kind = ['reel', 'photo', 'carousel', 'story', 'video'].includes(input.kind) ? input.kind : 'photo';
  if ('platforms' in input) out.platforms = JSON.stringify((Array.isArray(input.platforms) ? input.platforms : []).filter((p) => PLATFORMS.includes(p)));
  if ('scheduled_at' in input) {
    const v = str(input.scheduled_at, 40);
    if (v && Number.isNaN(Date.parse(v))) fail(400, 'badDate');
    out.scheduled_at = v ? new Date(v).toISOString() : null;
  }
  return out;
}

export async function create(ctx, input) {
  const user = await requireWebsite(ctx);
  const c = clean({ status: 'idea', platforms: ['instagram'], kind: 'reel', ...input });
  const id = uuid(), stamp = now();
  await db(ctx.env).prepare('INSERT INTO posts(id,title,caption_en,caption_ar,platforms,status,scheduled_at,notes,kind,created_by,created_at,updated_at) VALUES(?,?,?,?,?,?,?,?,?,?,?,?)')
    .bind(id, c.title || 'Untitled', c.caption_en || null, c.caption_ar || null, c.platforms, c.status, c.scheduled_at || null, c.notes || null, c.kind, user.id, stamp, stamp).run();
  await audit(ctx.env, user, 'planner', c.status === 'idea' ? 'Added an idea' : 'Planned a post', c.title);
  return row(await db(ctx.env).prepare(`SELECT ${FIELDS} FROM posts WHERE id=?`).bind(id).first());
}

export async function update(ctx, id, input) {
  const user = await requireWebsite(ctx);
  const cur = await db(ctx.env).prepare('SELECT title FROM posts WHERE id=?').bind(id).first();
  if (!cur) fail(404, 'notFound');
  const c = clean(input, cur);
  const keys = Object.keys(c);
  if (!keys.length) fail(400, 'nothing');
  await db(ctx.env).prepare(`UPDATE posts SET ${keys.map((k) => k + '=?').join(',')}, updated_at=? WHERE id=?`).bind(...keys.map((k) => c[k] ?? null), now(), id).run();
  if ('status' in c) await audit(ctx.env, user, 'planner', 'Moved post to ' + c.status, c.title || cur.title);
  return row(await db(ctx.env).prepare(`SELECT ${FIELDS} FROM posts WHERE id=?`).bind(id).first());
}

export async function remove(ctx, id) {
  const user = await requireWebsite(ctx);
  const cur = await db(ctx.env).prepare('SELECT title, media_key FROM posts WHERE id=?').bind(id).first();
  if (cur?.media_key && ctx.env.MEDIA) await ctx.env.MEDIA.delete(cur.media_key);
  await db(ctx.env).prepare('DELETE FROM posts WHERE id=?').bind(id).run();
  if (cur) await audit(ctx.env, user, 'planner', 'Deleted a post', cur.title);
  return { ok: true };
}

// A JPEG for the post (resized in the browser). Served publicly at an unguessable URL so Instagram can fetch it when publishing.
export async function putImage(ctx, id) {
  await requireWebsite(ctx);
  if (!ctx.env.MEDIA) fail(503, 'notConfigured');
  const cur = await db(ctx.env).prepare('SELECT media_key FROM posts WHERE id=?').bind(id).first();
  if (!cur) fail(404, 'notFound');
  if ((ctx.request.headers.get('content-type') || '') !== 'image/jpeg') fail(415, 'badType', 'Send a JPEG image.');
  const buf = await ctx.request.arrayBuffer();
  if (!buf.byteLength || buf.byteLength > 8 * 1024 * 1024) fail(413, 'tooLarge', 'Images up to 8 MB.');
  const key = 'pl/' + randomHex(12) + '.jpg';
  await ctx.env.MEDIA.put(key, buf, { metadata: { type: 'image/jpeg' } });
  if (cur.media_key) await ctx.env.MEDIA.delete(cur.media_key);
  const url = '/api/media/' + key;
  await db(ctx.env).prepare('UPDATE posts SET media_key=?, media_url=?, updated_at=? WHERE id=?').bind(key, url, now(), id).run();
  return { media_url: url };
}

// Publishing is prepared but switched on per platform only after Meta and TikTok approve the app.
export async function publishStatus(ctx) {
  await requireWebsite(ctx);
  const ig = await db(ctx.env).prepare("SELECT 1 FROM social_accounts WHERE platform='instagram'").first();
  const tt = await db(ctx.env).prepare("SELECT 1 FROM social_accounts WHERE platform='tiktok'").first();
  return {
    instagram: { connected: !!ig, enabled: ctx.env.PUBLISH_INSTAGRAM === 'on', needs: ['Instagram connected in Social', 'Meta app review for instagram_content_publish (or tester access)', 'Owner turns on PUBLISH_INSTAGRAM'] },
    tiktok: { connected: !!tt, enabled: ctx.env.PUBLISH_TIKTOK === 'on', needs: ['TikTok app review (Content Posting API audit) for public posts', 'Reconnect TikTok with posting permission', 'Owner turns on PUBLISH_TIKTOK'] }
  };
}

export async function publish(ctx, id, input) {
  const user = await requireAdmin(ctx);
  const post = await db(ctx.env).prepare(`SELECT ${FIELDS} FROM posts WHERE id=?`).bind(id).first();
  if (!post) fail(404, 'notFound');
  const platform = input.platform;
  if (platform === 'instagram') {
    if (ctx.env.PUBLISH_INSTAGRAM !== 'on') fail(409, 'notEnabled', 'Instagram publishing is prepared but not switched on yet. It needs Meta approval first.');
    const acc = await db(ctx.env).prepare("SELECT data FROM social_accounts WHERE platform='instagram'").first();
    if (!acc) fail(409, 'notConnected', 'Connect Instagram in Social first.');
    if (!post.media_url) fail(400, 'noMedia', 'Add an image to the post first.');
    const a = JSON.parse(acc.data);
    const host = a.mode === 'ig' ? 'https://graph.instagram.com' : 'https://graph.facebook.com';
    const igId = a.mode === 'ig' ? 'me' : a.igId;
    const imageUrl = new URL(ctx.request.url).origin + post.media_url;
    const caption = [post.caption_en, post.caption_ar].filter(Boolean).join('\n\n');
    const make = await fetch(`${host}/v23.0/${igId}/media`, { method: 'POST', body: new URLSearchParams({ image_url: imageUrl, caption, access_token: a.token }) }).then((r) => r.json());
    if (!make.id) fail(502, 'publishFailed', make.error?.message || 'Instagram did not accept the post.');
    const done = await fetch(`${host}/v23.0/${igId}/media_publish`, { method: 'POST', body: new URLSearchParams({ creation_id: make.id, access_token: a.token }) }).then((r) => r.json());
    if (!done.id) fail(502, 'publishFailed', done.error?.message || 'Instagram did not publish the post.');
    const published = { ...safe(post.published, {}), instagram: { id: done.id, at: now() } };
    await db(ctx.env).prepare("UPDATE posts SET published=?, status='posted', updated_at=? WHERE id=?").bind(JSON.stringify(published), now(), id).run();
    await audit(ctx.env, user, 'planner', 'Published to Instagram', post.title);
    return { ok: true };
  }
  if (platform === 'tiktok') fail(409, 'notEnabled', 'TikTok publishing is prepared but needs TikTok to approve the app first. Until then, post from the TikTok app.');
  fail(400, 'badPlatform');
}
