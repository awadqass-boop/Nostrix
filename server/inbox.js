// Inbox: Instagram DMs (read and reply through the connected Instagram account) and WhatsApp (free Cloud API).
// Instagram is read live from Meta. WhatsApp messages arrive by webhook and are kept in the private database.
import { db, audit, setting } from './db.js';
import { requireMarketing, requireAdmin } from './auth.js';
import { fail, now, uuid, str, randomHex, safeEqual } from './util.js';
import { notify } from './push.js';

const GRAPH = 'v23.0';
const enc = new TextEncoder();

async function account(env, platform) {
  const row = await db(env).prepare('SELECT data FROM social_accounts WHERE platform=?').bind(platform).first();
  try { return row ? JSON.parse(row.data) : null; } catch { return null; }
}
async function getJson(url, init) {
  const res = await fetch(url, init);
  let body = null;
  try { body = await res.json(); } catch { body = null; }
  if (!res.ok || body?.error) { const e = new Error(body?.error?.message || 'HTTP ' + res.status); e.status = res.status; throw e; }
  return body;
}
const igHost = (a) => (a.mode === 'ig' ? 'https://graph.instagram.com' : 'https://graph.facebook.com');

// ---------- Instagram ----------
async function igThreads(env) {
  const a = await account(env, 'instagram');
  if (!a) return { connected: false, threads: [] };
  const fields = 'id,updated_time,participants,messages.limit(1){message,from,created_time}';
  const tok = encodeURIComponent(a.token);
  const urls = [`${igHost(a)}/${GRAPH}/${a.igId}/conversations?platform=instagram&fields=${fields}&limit=30&access_token=${tok}`,
    `https://graph.instagram.com/${GRAPH}/${a.igId}/conversations?platform=instagram&fields=${fields}&limit=30&access_token=${tok}`];
  let last = '';
  for (const u of urls) {
    try {
      const r = await getJson(u);
      const threads = (r.data || []).map((c) => {
        const other = (c.participants?.data || []).find((p) => p.username !== a.username && p.id !== a.igId) || {};
        const m = c.messages?.data?.[0] || {};
        return { id: c.id, name: other.username || other.name || 'Instagram user', contactId: other.id || '', last: m.message || '', lastFromMe: m.from?.id === a.igId || m.from?.username === a.username, at: m.created_time || c.updated_time };
      });
      return { connected: true, threads };
    } catch (e) { last = e.message; }
  }
  return { connected: true, threads: [], error: 'Meta did not share Instagram messages yet: ' + last.slice(0, 200) };
}

async function igThread(env, id) {
  const a = await account(env, 'instagram');
  if (!a) fail(409, 'notConnected');
  const r = await getJson(`${igHost(a)}/${GRAPH}/${encodeURIComponent(id)}?fields=participants,messages.limit(40){id,message,from,created_time}&access_token=${encodeURIComponent(a.token)}`);
  const other = (r.participants?.data || []).find((p) => p.username !== a.username && p.id !== a.igId) || {};
  const messages = (r.messages?.data || []).map((m) => ({ id: m.id, text: m.message || '', mine: m.from?.id === a.igId || m.from?.username === a.username, at: m.created_time })).reverse();
  return { id, name: other.username || 'Instagram user', contactId: other.id || '', messages };
}

async function igSend(env, to, text) {
  const a = await account(env, 'instagram');
  if (!a) fail(409, 'notConnected');
  const r = await getJson(`${igHost(a)}/${GRAPH}/${a.igId}/messages?access_token=${encodeURIComponent(a.token)}`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ recipient: { id: to }, message: { text } })
  }).catch((e) => fail(502, 'sendFailed', 'Instagram did not send the message: ' + e.message.slice(0, 160)));
  return r;
}

// ---------- WhatsApp (Cloud API) ----------
async function waConfig(env) { return account(env, 'whatsapp'); }

async function waThreads(env) {
  const cfg = await waConfig(env);
  const { results } = await db(env).prepare(`SELECT contact_id, MAX(contact_name) AS name, MAX(at) AS at,
      (SELECT text FROM inbox_msgs m2 WHERE m2.channel='whatsapp' AND m2.contact_id=m.contact_id ORDER BY at DESC LIMIT 1) AS last,
      (SELECT direction FROM inbox_msgs m3 WHERE m3.channel='whatsapp' AND m3.contact_id=m.contact_id ORDER BY at DESC LIMIT 1) AS dir
    FROM inbox_msgs m WHERE channel='whatsapp' GROUP BY contact_id ORDER BY at DESC LIMIT 50`).all();
  return { connected: !!cfg, number: cfg?.number || '', threads: results.map((r) => ({ id: r.contact_id, name: r.name || '+' + r.contact_id, contactId: r.contact_id, last: r.last || '', lastFromMe: r.dir === 'out', at: r.at })) };
}

async function waThread(env, id) {
  const { results } = await db(env).prepare("SELECT id, direction, text, at, contact_name FROM inbox_msgs WHERE channel='whatsapp' AND contact_id=? ORDER BY at DESC LIMIT 60").bind(id).all();
  return { id, name: results.find((r) => r.contact_name)?.contact_name || '+' + id, contactId: id, messages: results.reverse().map((m) => ({ id: m.id, text: m.text, mine: m.direction === 'out', at: m.at })) };
}

async function waSend(env, to, text) {
  const cfg = await waConfig(env);
  if (!cfg) fail(409, 'notConnected', 'Connect WhatsApp first.');
  await getJson(`https://graph.facebook.com/${GRAPH}/${cfg.phoneId}/messages`, {
    method: 'POST', headers: { Authorization: 'Bearer ' + cfg.token, 'Content-Type': 'application/json' },
    body: JSON.stringify({ messaging_product: 'whatsapp', to, type: 'text', text: { body: text } })
  }).catch((e) => fail(502, 'sendFailed', 'WhatsApp did not send the message: ' + e.message.slice(0, 160) + ' (Free replies work within 24 hours of the customer\'s last message.)'));
  await db(env).prepare('INSERT INTO inbox_msgs(id,channel,contact_id,contact_name,direction,text,at) VALUES(?,?,?,?,?,?,?)').bind(uuid(), 'whatsapp', to, null, 'out', text, now()).run();
}

async function verifyToken(env) {
  let v = await setting(env, 'wa_verify');
  if (!v) { v = randomHex(16); await db(env).prepare("INSERT OR IGNORE INTO settings(key,value) VALUES('wa_verify',?)").bind(v).run(); v = await setting(env, 'wa_verify'); }
  return v;
}

// ---------- Routes ----------
export async function list(ctx) {
  const user = await requireMarketing(ctx);
  const [instagram, whatsapp] = await Promise.all([igThreads(ctx.env).catch((e) => ({ connected: true, threads: [], error: e.message })), waThreads(ctx.env)]);
  const origin = new URL(ctx.request.url).origin;
  if (user.is_admin) whatsapp.setup = { webhookUrl: origin + '/api/wa/webhook', verifyToken: await verifyToken(ctx.env) };
  return { instagram, whatsapp };
}

export async function thread(ctx, url) {
  await requireMarketing(ctx);
  const channel = url.searchParams.get('channel'), id = str(url.searchParams.get('id'), 200);
  if (!id) fail(400, 'missing');
  if (channel === 'instagram') return igThread(ctx.env, id);
  if (channel === 'whatsapp') return waThread(ctx.env, id);
  fail(400, 'badChannel');
}

export async function send(ctx, input) {
  const user = await requireMarketing(ctx);
  const text = str(input.text, 2000) || fail(400, 'missing', 'Write a message first.');
  const to = str(input.to, 100) || fail(400, 'missing');
  if (input.channel === 'instagram') await igSend(ctx.env, to, text);
  else if (input.channel === 'whatsapp') await waSend(ctx.env, to, text);
  else fail(400, 'badChannel');
  await audit(ctx.env, user, 'inbox', 'Replied on ' + input.channel, null, text.slice(0, 80));
  return { ok: true };
}

export async function connectWhatsApp(ctx, input) {
  const user = await requireAdmin(ctx);
  const phoneId = str(input.phoneId, 40), token = str(input.token, 1000);
  if (!phoneId || !/^\d{6,30}$/.test(phoneId)) fail(400, 'badId', 'The Phone number ID is only numbers.');
  if (!token || token.length < 40) fail(400, 'badToken', 'Paste the full token from Meta.');
  const info = await getJson(`https://graph.facebook.com/${GRAPH}/${phoneId}?fields=display_phone_number,verified_name&access_token=${encodeURIComponent(token)}`)
    .catch((e) => fail(400, 'tokenRejected', 'Meta did not accept this token for that number: ' + e.message.slice(0, 160)));
  await db(ctx.env).prepare('INSERT INTO social_accounts(platform,data,updated_at) VALUES(?,?,?) ON CONFLICT(platform) DO UPDATE SET data=excluded.data, updated_at=excluded.updated_at')
    .bind('whatsapp', JSON.stringify({ phoneId, token, number: info.display_phone_number || '', name: info.verified_name || '', connectedAt: now() }), now()).run();
  await audit(ctx.env, user, 'inbox', 'Connected WhatsApp', info.display_phone_number || phoneId);
  return { ok: true, number: info.display_phone_number || '' };
}

// Meta calls these. GET verifies the webhook once; POST delivers incoming WhatsApp messages.
export async function webhookVerify(ctx, url) {
  const mode = url.searchParams.get('hub.mode'), token = url.searchParams.get('hub.verify_token'), challenge = url.searchParams.get('hub.challenge') || '';
  if (mode === 'subscribe' && token && safeEqual(token, await verifyToken(ctx.env))) return new Response(challenge, { headers: { 'content-type': 'text/plain' } });
  return new Response('Forbidden', { status: 403 });
}

export async function webhook(ctx) {
  const raw = await ctx.request.text();
  const sig = (ctx.request.headers.get('x-hub-signature-256') || '').replace(/^sha256=/, '');
  if (!ctx.env.META_APP_SECRET) return new Response('not configured', { status: 503 });
  const key = await crypto.subtle.importKey('raw', enc.encode(ctx.env.META_APP_SECRET), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const mac = [...new Uint8Array(await crypto.subtle.sign('HMAC', key, enc.encode(raw)))].map((b) => b.toString(16).padStart(2, '0')).join('');
  if (!sig || !safeEqual(sig, mac)) return new Response('bad signature', { status: 401 });
  let body = {};
  try { body = JSON.parse(raw); } catch { return new Response('ok'); }
  for (const entry of body.entry || []) for (const ch of entry.changes || []) {
    const v = ch.value || {};
    const names = Object.fromEntries((v.contacts || []).map((c) => [c.wa_id, c.profile?.name || '']));
    for (const m of v.messages || []) {
      const text = m.type === 'text' ? m.text?.body : m.type === 'button' ? m.button?.text : m.type === 'interactive' ? (m.interactive?.button_reply?.title || m.interactive?.list_reply?.title) : `[${m.type}]`;
      await db(ctx.env).prepare('INSERT OR IGNORE INTO inbox_msgs(id,channel,contact_id,contact_name,direction,text,at) VALUES(?,?,?,?,?,?,?)')
        .bind(m.id || uuid(), 'whatsapp', m.from, names[m.from] || null, 'in', str(text, 4000) || '', new Date((+m.timestamp || Date.now() / 1000) * 1000).toISOString()).run();
      ctx.waitUntil?.(notify(ctx.env, 'enquiry', 'WhatsApp: ' + (names[m.from] || '+' + m.from), str(text, 140) || '', '/staff/marketing/#inbox'));
    }
  }
  return new Response('ok');
}
