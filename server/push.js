// Phone alerts (Web Push) for the dashboard app on staff phones and laptops.
// VAPID keys are generated once and kept in the private database. Messages are encrypted per RFC 8291 (aes128gcm).
import { db, setting } from './db.js';
import { requireStaffArea as requireWebsite } from './auth.js';
import { fail, now, uuid, str } from './util.js';

const KINDS = ['order', 'enquiry', 'review', 'lead', 'invoice'];
const enc = new TextEncoder();
const b64u = (buf) => btoa(String.fromCharCode(...new Uint8Array(buf))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
const unb64u = (s) => Uint8Array.from(atob(String(s).replace(/-/g, '+').replace(/_/g, '/') + '==='.slice((String(s).length + 3) % 4)), (c) => c.charCodeAt(0));
const concat = (...parts) => { const out = new Uint8Array(parts.reduce((n, p) => n + p.length, 0)); let o = 0; for (const p of parts) { out.set(p, o); o += p.length; } return out; };

async function vapid(env) {
  let v = null;
  try { v = JSON.parse(await setting(env, 'vapid') || 'null'); } catch { v = null; }
  if (v) return v;
  const pair = await crypto.subtle.generateKey({ name: 'ECDSA', namedCurve: 'P-256' }, true, ['sign', 'verify']);
  v = { publicKey: b64u(await crypto.subtle.exportKey('raw', pair.publicKey)), privateJwk: await crypto.subtle.exportKey('jwk', pair.privateKey) };
  await db(env).prepare("INSERT OR IGNORE INTO settings(key,value) VALUES('vapid',?)").bind(JSON.stringify(v)).run();
  return JSON.parse(await setting(env, 'vapid'));
}

async function vapidHeader(env, endpoint) {
  const v = await vapid(env);
  const key = await crypto.subtle.importKey('jwk', v.privateJwk, { name: 'ECDSA', namedCurve: 'P-256' }, false, ['sign']);
  const head = b64u(enc.encode(JSON.stringify({ typ: 'JWT', alg: 'ES256' })));
  const claims = b64u(enc.encode(JSON.stringify({ aud: new URL(endpoint).origin, exp: Math.floor(Date.now() / 1000) + 12 * 3600, sub: 'mailto:marketing@nostrix.ae' })));
  const sig = await crypto.subtle.sign({ name: 'ECDSA', hash: 'SHA-256' }, key, enc.encode(head + '.' + claims));
  return `vapid t=${head}.${claims}.${b64u(sig)}, k=${v.publicKey}`;
}

const hkdf = async (salt, ikm, info, bytes) => new Uint8Array(await crypto.subtle.deriveBits(
  { name: 'HKDF', hash: 'SHA-256', salt, info }, await crypto.subtle.importKey('raw', ikm, 'HKDF', false, ['deriveBits']), bytes * 8));

async function encrypt(sub, payload) {
  const uaPublic = unb64u(sub.p256dh), auth = unb64u(sub.auth);
  const local = await crypto.subtle.generateKey({ name: 'ECDH', namedCurve: 'P-256' }, true, ['deriveBits']);
  const asPublic = new Uint8Array(await crypto.subtle.exportKey('raw', local.publicKey));
  const uaKey = await crypto.subtle.importKey('raw', uaPublic, { name: 'ECDH', namedCurve: 'P-256' }, false, []);
  const shared = new Uint8Array(await crypto.subtle.deriveBits({ name: 'ECDH', public: uaKey }, local.privateKey, 256));
  const ikm = await hkdf(auth, shared, concat(enc.encode('WebPush: info\0'), uaPublic, asPublic), 32);
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const cek = await hkdf(salt, ikm, enc.encode('Content-Encoding: aes128gcm\0'), 16);
  const nonce = await hkdf(salt, ikm, enc.encode('Content-Encoding: nonce\0'), 12);
  const key = await crypto.subtle.importKey('raw', cek, 'AES-GCM', false, ['encrypt']);
  const body = new Uint8Array(await crypto.subtle.encrypt({ name: 'AES-GCM', iv: nonce }, key, concat(enc.encode(payload), new Uint8Array([2]))));
  const header = new Uint8Array(21); header.set(salt); new DataView(header.buffer).setUint32(16, 4096); header[20] = 65;
  return concat(header, asPublic, body);
}

async function sendOne(env, sub, message) {
  const res = await fetch(sub.endpoint, {
    method: 'POST',
    headers: { Authorization: await vapidHeader(env, sub.endpoint), 'Content-Encoding': 'aes128gcm', 'Content-Type': 'application/octet-stream', TTL: '86400', Urgency: 'high' },
    body: await encrypt(sub, JSON.stringify(message))
  });
  if (res.status === 404 || res.status === 410) await db(env).prepare('DELETE FROM push_subs WHERE id=?').bind(sub.id).run();
  return res.status;
}

// Send an alert to every device that turned on this kind of alert. Never throws.
export async function notify(env, kind, title, bodyText, url = '/staff/website/') {
  try {
    const { results } = await db(env).prepare('SELECT * FROM push_subs').all();
    const targets = results.filter((s) => { try { return (JSON.parse(s.kinds || '[]')).includes(kind); } catch { return false; } });
    await Promise.all(targets.map((s) => sendOne(env, s, { title: str(title, 80), body: str(bodyText, 180) || '', url, tag: kind }).catch((e) => console.error('push', e.message))));
  } catch (e) { console.error('notify', e.message); }
}

export async function publicKey(ctx) {
  await requireWebsite(ctx);
  return { key: (await vapid(ctx.env)).publicKey, kinds: KINDS };
}

export async function subscribe(ctx, input) {
  const user = await requireWebsite(ctx);
  const sub = input.subscription || {};
  const endpoint = str(sub.endpoint, 1000), p256dh = str(sub.keys?.p256dh, 200), auth = str(sub.keys?.auth, 100);
  if (!endpoint || !/^https:\/\//.test(endpoint) || !p256dh || !auth) fail(400, 'badSubscription');
  const kinds = JSON.stringify((Array.isArray(input.kinds) ? input.kinds : KINDS).filter((k) => KINDS.includes(k)));
  await db(ctx.env).prepare('INSERT INTO push_subs(id,user_id,endpoint,p256dh,auth,kinds,device,created_at) VALUES(?,?,?,?,?,?,?,?) ON CONFLICT(endpoint) DO UPDATE SET user_id=excluded.user_id, p256dh=excluded.p256dh, auth=excluded.auth, kinds=excluded.kinds')
    .bind(uuid(), user.id, endpoint, p256dh, auth, kinds, str(input.device, 80), now()).run();
  return { ok: true };
}

export async function unsubscribe(ctx, input) {
  await requireWebsite(ctx);
  await db(ctx.env).prepare('DELETE FROM push_subs WHERE endpoint=?').bind(str(input.endpoint, 1000)).run();
  return { ok: true };
}

export async function test(ctx, input) {
  const user = await requireWebsite(ctx);
  const sub = await db(ctx.env).prepare('SELECT * FROM push_subs WHERE endpoint=? AND user_id=?').bind(str(input.endpoint, 1000), user.id).first();
  if (!sub) fail(404, 'notFound', 'Alerts are not on for this device.');
  const status = await sendOne(ctx.env, sub, { title: 'Nostrix alerts are on ✅', body: 'You will get new orders, enquiries, reviews and leads here.', url: '/staff/website/', tag: 'test' });
  return { ok: status >= 200 && status < 300, status };
}
