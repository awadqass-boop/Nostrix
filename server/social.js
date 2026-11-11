// Instagram and TikTok connections for the Marketing hub.
// App keys live only in Cloudflare secrets (META_APP_ID, META_APP_SECRET, TIKTOK_CLIENT_KEY, TIKTOK_CLIENT_SECRET).
// Account tokens are stored in the private database table social_accounts and never sent to the browser.
import { db, audit } from './db.js';
import { requireMarketing as requireWebsite, requireAdmin } from './auth.js';
import { fail, now, randomHex, str, today } from './util.js';

const GRAPH = 'v23.0';
const META_CONFIG_ID = '1423798033157752'; // "Instagram API (Unified Login)" configuration in the Nostrix Hub Meta app
const TIKTOK_SCOPES = 'user.info.basic,user.info.profile,user.info.stats,video.list';
const CACHE_MS = 10 * 60 * 1000;
const BACK = '/staff/marketing/';

const callbackUrl = (ctx, platform) => new URL(ctx.request.url).origin + '/api/social/' + platform + '/callback';
const back = (ctx, params = {}) => {
  const q = new URLSearchParams(params).toString();
  return Response.redirect(new URL(ctx.request.url).origin + BACK + (q ? '?' + q : '') + '#social', 302);
};

async function account(env, platform) {
  const row = await db(env).prepare('SELECT data FROM social_accounts WHERE platform=?').bind(platform).first();
  try { return row ? JSON.parse(row.data) : null; } catch { return null; }
}
async function saveAccount(env, platform, data) {
  await db(env).prepare('INSERT INTO social_accounts(platform,data,updated_at) VALUES(?,?,?) ON CONFLICT(platform) DO UPDATE SET data=excluded.data, updated_at=excluded.updated_at')
    .bind(platform, JSON.stringify(data), now()).run();
}

async function getJson(url, init) {
  const res = await fetch(url, init);
  let body = null;
  try { body = await res.json(); } catch { body = null; }
  if (!res.ok || body?.error?.code && body.error.code !== 'ok') {
    const msg = body?.error?.message || body?.error_description || body?.error?.code || body?.error || ('HTTP ' + res.status);
    const e = new Error(typeof msg === 'string' ? msg : JSON.stringify(msg));
    e.status = res.status;
    throw e;
  }
  return body;
}

// ---------- Start and finish the connection (owner only) ----------
export async function connect(ctx, platform) {
  const user = await requireAdmin(ctx);
  const { env } = ctx;
  const state = randomHex(16);
  await db(env).prepare('DELETE FROM oauth_states WHERE created_at < ?').bind(new Date(Date.now() - 3600e3).toISOString()).run();
  await db(env).prepare('INSERT INTO oauth_states(state,platform,user_id,created_at) VALUES(?,?,?,?)').bind(state, platform, user.id, now()).run();
  if (platform === 'instagram') {
    if (!env.META_APP_ID || !env.META_APP_SECRET) fail(503, 'socialNotConfigured', 'The Meta app keys are not set up in Cloudflare yet.');
    const u = new URL(`https://www.facebook.com/${GRAPH}/dialog/oauth`);
    u.search = new URLSearchParams({ client_id: env.META_APP_ID, config_id: env.META_CONFIG_ID || META_CONFIG_ID, redirect_uri: callbackUrl(ctx, 'instagram'),
      response_type: 'code', override_default_response_type: 'true', state }).toString();
    return Response.redirect(u.href, 302);
  }
  if (platform === 'tiktok') {
    if (!env.TIKTOK_CLIENT_KEY || !env.TIKTOK_CLIENT_SECRET) fail(503, 'socialNotConfigured', 'The TikTok app keys are not set up in Cloudflare yet.');
    const u = new URL('https://www.tiktok.com/v2/auth/authorize/');
    u.search = new URLSearchParams({ client_key: env.TIKTOK_CLIENT_KEY, scope: TIKTOK_SCOPES, response_type: 'code', redirect_uri: callbackUrl(ctx, 'tiktok'), state }).toString();
    return Response.redirect(u.href, 302);
  }
  fail(404, 'notFound');
}

export async function callback(ctx, platform, url) {
  const user = await requireAdmin(ctx);
  const { env } = ctx;
  const state = url.searchParams.get('state') || '';
  const row = await db(env).prepare('SELECT * FROM oauth_states WHERE state=?').bind(state).first();
  await db(env).prepare('DELETE FROM oauth_states WHERE state=?').bind(state).run();
  if (!row || row.platform !== platform || row.user_id !== user.id || Date.now() - Date.parse(row.created_at) > 3600e3)
    return back(ctx, { social_error: 'The connection link expired. Try again.' });
  const code = url.searchParams.get('code');
  if (!code) return back(ctx, { social_error: str(url.searchParams.get('error_description') || url.searchParams.get('error') || 'The connection was cancelled.', 200) });
  try {
    if (platform === 'instagram') await finishInstagram(ctx, code);
    else if (platform === 'tiktok') await finishTiktok(ctx, code);
    else fail(404, 'notFound');
    await audit(env, user, 'social', 'Connected ' + (platform === 'tiktok' ? 'TikTok' : 'Instagram'));
    await db(env).prepare("DELETE FROM settings WHERE key='social_cache'").run();
    return back(ctx, { social_ok: platform });
  } catch (e) {
    console.error('social callback', platform, e.message);
    return back(ctx, { social_error: str(e.message, 200) || 'The connection failed.' });
  }
}

async function finishInstagram(ctx, code) {
  const { env } = ctx;
  const t = await getJson(`https://graph.facebook.com/${GRAPH}/oauth/access_token?` + new URLSearchParams({
    client_id: env.META_APP_ID, client_secret: env.META_APP_SECRET, redirect_uri: callbackUrl(ctx, 'instagram'), code }));
  const token = t.access_token;
  if (!token) throw new Error('Meta did not return an access token.');
  // Find the Instagram account this token can reach. Unified-login tokens can work on either Graph host.
  let found = null;
  try {
    const me = await getJson(`https://graph.instagram.com/${GRAPH}/me?fields=user_id,username&access_token=${encodeURIComponent(token)}`);
    if (me.username) found = { mode: 'ig', igId: me.user_id || me.id, username: me.username };
  } catch { /* try the Facebook route */ }
  if (!found) {
    const pages = await getJson(`https://graph.facebook.com/${GRAPH}/me/accounts?fields=name,instagram_business_account{id,username}&limit=50&access_token=${encodeURIComponent(token)}`).catch(() => ({ data: [] }));
    const page = (pages.data || []).find((p) => p.instagram_business_account);
    if (page) found = { mode: 'fb', igId: page.instagram_business_account.id, username: page.instagram_business_account.username };
  }
  if (!found) {
    const biz = await getJson(`https://graph.facebook.com/${GRAPH}/me?fields=instagram_accounts{id,username}&access_token=${encodeURIComponent(token)}`).catch(() => null);
    const ig = biz?.instagram_accounts?.data?.[0];
    if (ig) found = { mode: 'fb', igId: ig.id, username: ig.username };
  }
  if (!found) {
    // Business-login tokens: ask Meta which Instagram account each permission was granted for.
    const dbg = await getJson(`https://graph.facebook.com/${GRAPH}/debug_token?input_token=${encodeURIComponent(token)}&access_token=${encodeURIComponent(env.META_APP_ID + '|' + env.META_APP_SECRET)}`).catch((e) => { console.error('ig debug_token', e.message); return null; });
    const scopes = dbg?.data?.granular_scopes || [];
    const ids = [...new Set(scopes.filter((g) => /^instagram_/.test(g.scope)).flatMap((g) => g.target_ids || []))];
    for (const id of ids) {
      const ig = await getJson(`https://graph.facebook.com/${GRAPH}/${id}?fields=id,username&access_token=${encodeURIComponent(token)}`).catch((e) => { console.error('ig lookup', id, e.message); return null; });
      if (ig?.username) { found = { mode: 'fb', igId: ig.id, username: ig.username }; break; }
    }
    if (!found && ids.length) found = { mode: 'fb', igId: ids[0], username: '' };
    if (!found) console.error('ig: no account', JSON.stringify(scopes.map((g) => g.scope)));
  }
  if (!found) throw new Error('Connected to Meta, but no Instagram account was shared. Choose the Nostrix Instagram account when asked.');
  await saveAccount(env, 'instagram', { ...found, token, connectedAt: now(), expiresAt: t.expires_in ? new Date(Date.now() + t.expires_in * 1000).toISOString() : null });
}

async function finishTiktok(ctx, code) {
  const { env } = ctx;
  const t = await getJson('https://open.tiktokapis.com/v2/oauth/token/', {
    method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ client_key: env.TIKTOK_CLIENT_KEY, client_secret: env.TIKTOK_CLIENT_SECRET, code, grant_type: 'authorization_code', redirect_uri: callbackUrl(ctx, 'tiktok') })
  });
  if (!t.access_token) throw new Error(t.error_description || 'TikTok did not return an access token.');
  await saveAccount(env, 'tiktok', tiktokTokens(t, { connectedAt: now() }));
}

const tiktokTokens = (t, base) => ({
  ...base, openId: t.open_id || base.openId, token: t.access_token, refresh: t.refresh_token || base.refresh,
  expiresAt: new Date(Date.now() + (t.expires_in || 86400) * 1000).toISOString(),
  refreshExpiresAt: t.refresh_expires_in ? new Date(Date.now() + t.refresh_expires_in * 1000).toISOString() : base.refreshExpiresAt
});

// TikTok access tokens last a day; refresh them automatically.
async function tiktokToken(env) {
  const a = await account(env, 'tiktok');
  if (!a) return null;
  if (Date.parse(a.expiresAt) - Date.now() > 5 * 60e3) return a;
  const t = await getJson('https://open.tiktokapis.com/v2/oauth/token/', {
    method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ client_key: env.TIKTOK_CLIENT_KEY, client_secret: env.TIKTOK_CLIENT_SECRET, grant_type: 'refresh_token', refresh_token: a.refresh })
  });
  const next = tiktokTokens(t, a);
  await saveAccount(env, 'tiktok', next);
  return next;
}

export async function disconnect(ctx, platform) {
  const user = await requireAdmin(ctx);
  if (!['instagram', 'tiktok'].includes(platform)) fail(404, 'notFound');
  await db(ctx.env).prepare('DELETE FROM social_accounts WHERE platform=?').bind(platform).run();
  await db(ctx.env).prepare("DELETE FROM settings WHERE key='social_cache'").run();
  await audit(ctx.env, user, 'social', 'Disconnected ' + (platform === 'tiktok' ? 'TikTok' : 'Instagram'));
  return { ok: true };
}

// ---------- Stats ----------
async function instagramStats(env) {
  const a = await account(env, 'instagram');
  if (!a) return { connected: false };
  const host = a.mode === 'ig' ? 'https://graph.instagram.com' : 'https://graph.facebook.com';
  const id = a.mode === 'ig' ? 'me' : a.igId;
  const tok = encodeURIComponent(a.token);
  const p = await getJson(`${host}/${GRAPH}/${id}?fields=username,name,profile_picture_url,followers_count,follows_count,media_count&access_token=${tok}`);
  const m = await getJson(`${host}/${GRAPH}/${id}/media?fields=id,caption,media_type,media_product_type,media_url,thumbnail_url,permalink,timestamp,like_count,comments_count&limit=50&access_token=${tok}`).catch(() => ({ data: [] }));
  // Reach and profile views need an insights permission; show them when Meta allows it.
  let insights = null;
  try {
    const until = Math.floor(Date.now() / 1000), since = until - 28 * 86400;
    const r = await getJson(`${host}/${GRAPH}/${id}/insights?metric=reach,views,profile_views,accounts_engaged,total_interactions,website_clicks&period=day&metric_type=total_value&since=${since}&until=${until}&access_token=${tok}`);
    insights = Object.fromEntries((r.data || []).map((x) => [x.name, x.total_value?.value ?? null]));
  } catch { insights = null; }
  return {
    connected: true, username: p.username || a.username, name: p.name || '', avatar: p.profile_picture_url || '',
    followers: p.followers_count ?? null, following: p.follows_count ?? null, posts: p.media_count ?? null,
    url: 'https://www.instagram.com/' + (p.username || a.username) + '/',
    insights,
    items: (m.data || []).map((x) => ({ id: x.id, caption: (x.caption || '').slice(0, 160), image: x.media_type === 'VIDEO' ? x.thumbnail_url : x.media_url,
      video: x.media_type === 'VIDEO', kind: x.media_product_type === 'REELS' ? 'reel' : x.media_type === 'CAROUSEL_ALBUM' ? 'carousel' : x.media_type === 'VIDEO' ? 'video' : 'photo',
      url: x.permalink, at: x.timestamp, likes: x.like_count ?? null, comments: x.comments_count ?? null, views: null }))
  };
}

async function tiktokStats(env) {
  const a = await tiktokToken(env);
  if (!a) return { connected: false };
  const auth = { Authorization: 'Bearer ' + a.token };
  const u = await getJson('https://open.tiktokapis.com/v2/user/info/?fields=open_id,avatar_url,display_name,username,follower_count,following_count,likes_count,video_count,profile_deep_link', { headers: auth });
  const videos = [];
  let cursor = null;
  for (let page = 0; page < 2; page++) {
    const v = await getJson('https://open.tiktokapis.com/v2/video/list/?fields=id,title,video_description,cover_image_url,share_url,create_time,duration,view_count,like_count,comment_count,share_count', {
      method: 'POST', headers: { ...auth, 'Content-Type': 'application/json' }, body: JSON.stringify(cursor ? { max_count: 20, cursor } : { max_count: 20 })
    }).catch(() => null);
    videos.push(...(v?.data?.videos || []));
    if (!v?.data?.has_more) break;
    cursor = v.data.cursor;
  }
  const me = u.data?.user || {};
  return {
    connected: true, username: me.username || '', name: me.display_name || '', avatar: me.avatar_url || '',
    followers: me.follower_count ?? null, following: me.following_count ?? null, posts: me.video_count ?? null, likes: me.likes_count ?? null,
    url: me.profile_deep_link || (me.username ? 'https://www.tiktok.com/@' + me.username : ''),
    items: videos.map((x) => ({ id: x.id, caption: (x.title || x.video_description || '').slice(0, 160), image: x.cover_image_url, video: true, kind: 'video', duration: x.duration ?? null,
      url: x.share_url, at: x.create_time ? new Date(x.create_time * 1000).toISOString() : null, likes: x.like_count ?? null, comments: x.comment_count ?? null,
      shares: x.share_count ?? null, views: x.view_count ?? null }))
  };
}

export async function overview(ctx, url) {
  await requireWebsite(ctx);
  const { env } = ctx;
  const fresh = url.searchParams.get('fresh') === '1';
  if (!fresh) {
    const row = await db(env).prepare("SELECT value FROM settings WHERE key='social_cache'").first();
    try { const c = row && JSON.parse(row.value); if (c && Date.now() - c.at < CACHE_MS) return c.data; } catch { /* rebuild */ }
  }
  const safe = async (name, fn) => { try { return await fn(env); } catch (e) { console.error('social stats', name, e.message); return { connected: true, error: str(e.message, 200) || 'Could not load.' }; } };
  const data = {
    instagram: { ...(await safe('instagram', instagramStats)), ready: !!(env.META_APP_ID && env.META_APP_SECRET) },
    tiktok: { ...(await safe('tiktok', tiktokStats)), ready: !!(env.TIKTOK_CLIENT_KEY && env.TIKTOK_CLIENT_SECRET) },
    at: now()
  };
  // One snapshot per platform per UAE day builds the follower history.
  for (const platform of ['instagram', 'tiktok']) {
    const d = data[platform];
    if (d.connected && !d.error && d.followers != null)
      await db(env).prepare('INSERT INTO social_snapshots(day,platform,followers,posts,likes) VALUES(?,?,?,?,?) ON CONFLICT(day,platform) DO UPDATE SET followers=excluded.followers, posts=excluded.posts, likes=excluded.likes')
        .bind(today(), platform, d.followers, d.posts ?? null, d.likes ?? null).run();
    const { results } = await db(env).prepare('SELECT day, followers, posts, likes FROM social_snapshots WHERE platform=? ORDER BY day DESC LIMIT 365').bind(platform).all();
    d.history = results.reverse();
  }
  await db(env).prepare("INSERT INTO settings(key,value) VALUES('social_cache',?) ON CONFLICT(key) DO UPDATE SET value=excluded.value").bind(JSON.stringify({ at: Date.now(), data })).run();
  return data;
}
