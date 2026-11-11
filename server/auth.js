// Staff accounts: email + password, stored hashed (PBKDF2-SHA256). Sessions use an HttpOnly cookie.
import { db, allow, audit } from './db.js';
import { fail, now, uuid, sha256, randomHex, b64, unb64, safeEqual, email as cleanEmail, str, device, geo, sameOrigin } from './util.js';

// One-time owner setup code (only its SHA-256 is stored here). Works only while no account exists.
const SETUP_HASH = '814f927cd474f9eba98b0359f5cae92cb0d593f43f18688bac17672d7fec746b';
const ITERATIONS = 60000;
const COOKIE = 'nx_s';
const SESSION_DAYS = 30;

async function derive(password, salt, iterations) {
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveBits']);
  return b64(await crypto.subtle.deriveBits({ name: 'PBKDF2', hash: 'SHA-256', salt: unb64(salt), iterations }, key, 256));
}

export async function hashPassword(password) {
  if (typeof password !== 'string' || password.length < 8 || password.length > 200) fail(400, 'weakPassword', 'Use a password of at least 8 characters.');
  const salt = b64(crypto.getRandomValues(new Uint8Array(16)));
  return { pass_hash: await derive(password, salt, ITERATIONS), pass_salt: salt, pass_iter: ITERATIONS };
}

export const publicUser = (u) => u && ({
  id: u.id, email: u.email, display_name: u.display_name, job_title: u.job_title,
  is_admin: !!u.is_admin, website_access: !!(u.website_access || u.is_admin), marketing_access: !!(u.marketing_access || u.is_admin), active: !!u.active,
  created_at: u.created_at, last_sign_in_at: u.last_sign_in_at
});

function readCookie(request) {
  const raw = request.headers.get('cookie') || '';
  const m = raw.match(new RegExp('(?:^|;\\s*)' + COOKIE + '=([a-f0-9]{64})'));
  return m ? m[1] : null;
}
const cookie = (value, maxAge) => `${COOKIE}=${value}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${maxAge}`;

export async function currentUser(ctx) {
  if (ctx.user !== undefined) return ctx.user;
  ctx.user = null;
  const token = readCookie(ctx.request);
  if (!token) return null;
  const row = await db(ctx.env).prepare(
    'SELECT u.* FROM sessions s JOIN users u ON u.id=s.user_id WHERE s.token_hash=? AND s.expires_at>? AND u.active=1'
  ).bind(await sha256(token), now()).first();
  ctx.user = row || null;
  return ctx.user;
}

export async function requireUser(ctx) {
  const u = await currentUser(ctx);
  if (!u) fail(401, 'signedOut');
  if (ctx.request.method !== 'GET' && !sameOrigin(ctx.request)) fail(403, 'badOrigin');
  return u;
}
export async function requireAdmin(ctx) {
  const u = await requireUser(ctx);
  if (!u.is_admin) fail(403, 'adminOnly');
  return u;
}
export async function requireMarketing(ctx) {
  const u = await requireUser(ctx);
  if (!u.is_admin && !u.marketing_access) fail(403, 'noAccess');
  return u;
}
// Either dashboard (Website or Marketing hub), used by phone alerts.
export async function requireStaffArea(ctx) {
  const u = await requireUser(ctx);
  if (!u.is_admin && !u.website_access && !u.marketing_access) fail(403, 'noAccess');
  return u;
}
export async function requireWebsite(ctx) {
  const u = await requireUser(ctx);
  if (!u.is_admin && !u.website_access) fail(403, 'noAccess');
  return u;
}

async function startSession(ctx, user) {
  const DB = db(ctx.env), token = randomHex(32), stamp = now();
  const expires = new Date(Date.now() + SESSION_DAYS * 864e5).toISOString();
  await DB.batch([
    DB.prepare('INSERT INTO sessions(token_hash,user_id,created_at,expires_at) VALUES(?,?,?,?)').bind(await sha256(token), user.id, stamp, expires),
    DB.prepare('UPDATE users SET last_sign_in_at=? WHERE id=?').bind(stamp, user.id),
    DB.prepare('DELETE FROM sessions WHERE expires_at<?').bind(stamp)
  ]);
  return cookie(token, SESSION_DAYS * 86400);
}

async function logSignIn(ctx, userId, address, ok) {
  const g = geo(ctx.request);
  await db(ctx.env).prepare('INSERT INTO sign_ins(id,user_id,email,ok,at,country,city,device) VALUES(?,?,?,?,?,?,?,?)')
    .bind(uuid(), userId, address, ok ? 1 : 0, now(), g.country, g.city, device(ctx.request.headers.get('user-agent') || '')).run();
}

const ipKey = async (ctx) => 'ip:' + (await sha256(ctx.request.headers.get('cf-connecting-ip') || 'unknown')).slice(0, 24);

export async function me(ctx) {
  const u = await currentUser(ctx);
  const count = (await db(ctx.env).prepare('SELECT COUNT(*) AS n FROM users').first()).n;
  return { user: publicUser(u), needsSetup: count === 0 };
}

export async function login(ctx, input) {
  if (!sameOrigin(ctx.request)) fail(403, 'badOrigin');
  const address = cleanEmail(input.email), password = String(input.password || '');
  if (!address || !password) fail(400, 'missing', 'Enter your email and password.');
  const okIp = await allow(ctx.env, await ipKey(ctx), 25, 900);
  const okMail = await allow(ctx.env, 'login:' + address, 8, 900);
  if (!okIp || !okMail) fail(429, 'tooMany', 'Too many attempts. Wait 15 minutes and try again.');
  const user = await db(ctx.env).prepare('SELECT * FROM users WHERE email=? AND active=1').bind(address).first();
  const hash = user ? await derive(password, user.pass_salt, user.pass_iter) : await derive(password, 'AAAAAAAAAAAAAAAAAAAAAA==', ITERATIONS);
  if (!user || !safeEqual(hash, user.pass_hash)) {
    await logSignIn(ctx, user?.id || null, address, false);
    fail(401, 'badLogin', 'The email or password is incorrect.');
  }
  await logSignIn(ctx, user.id, address, true);
  return { user: publicUser(user), cookie: await startSession(ctx, user) };
}

export async function logout(ctx) {
  const token = readCookie(ctx.request);
  if (token) await db(ctx.env).prepare('DELETE FROM sessions WHERE token_hash=?').bind(await sha256(token)).run();
  return cookie('', 0);
}

export async function setup(ctx, input) {
  if (!sameOrigin(ctx.request)) fail(403, 'badOrigin');
  if (!(await allow(ctx.env, await ipKey(ctx), 10, 3600))) fail(429, 'tooMany', 'Too many attempts. Try again later.');
  const DB = db(ctx.env);
  const count = (await DB.prepare('SELECT COUNT(*) AS n FROM users').first()).n;
  if (count > 0) fail(409, 'setupDone', 'The owner account already exists. Sign in instead.');
  const code = String(input.code || '').trim().toUpperCase();
  if (!safeEqual(await sha256(code), SETUP_HASH)) fail(403, 'badCode', 'The setup code is not correct.');
  const address = cleanEmail(input.email);
  if (!address) fail(400, 'badEmail', 'Enter a valid email address.');
  const user = { id: uuid(), email: address, display_name: str(input.name, 80) || address.split('@')[0], ...(await hashPassword(String(input.password || ''))) };
  await DB.prepare('INSERT INTO users(id,email,display_name,pass_hash,pass_salt,pass_iter,is_admin,website_access,active,created_at) VALUES(?,?,?,?,?,?,1,1,1,?)')
    .bind(user.id, user.email, user.display_name, user.pass_hash, user.pass_salt, user.pass_iter, now()).run();
  const row = await DB.prepare('SELECT * FROM users WHERE id=?').bind(user.id).first();
  await logSignIn(ctx, row.id, row.email, true);
  await audit(ctx.env, row, 'accounts', 'Created the owner account', row.email);
  return { user: publicUser(row), cookie: await startSession(ctx, row) };
}

export async function changePassword(ctx, input) {
  const u = await requireUser(ctx);
  const hash = await derive(String(input.current || ''), u.pass_salt, u.pass_iter);
  if (!safeEqual(hash, u.pass_hash)) fail(400, 'badPassword', 'Your current password is not correct.');
  const next = await hashPassword(String(input.next || ''));
  const DB = db(ctx.env);
  await DB.batch([
    DB.prepare('UPDATE users SET pass_hash=?,pass_salt=?,pass_iter=?,updated_at=? WHERE id=?').bind(next.pass_hash, next.pass_salt, next.pass_iter, now(), u.id),
    DB.prepare('DELETE FROM sessions WHERE user_id=?').bind(u.id)
  ]);
  await audit(ctx.env, u, 'accounts', 'Changed own password', u.email);
  return { cookie: await startSession(ctx, u) };
}

// ---- Account management (admins) ----
export async function listUsers(ctx) {
  await requireAdmin(ctx);
  const { results } = await db(ctx.env).prepare('SELECT * FROM users ORDER BY created_at').all();
  return results.map(publicUser);
}

export async function createUser(ctx, input) {
  const admin = await requireAdmin(ctx);
  const address = cleanEmail(input.email);
  if (!address) fail(400, 'badEmail', 'Enter a valid email address.');
  const DB = db(ctx.env);
  if (await DB.prepare('SELECT id FROM users WHERE email=?').bind(address).first()) fail(409, 'duplicateEmail', 'This email already has an account.');
  const pw = await hashPassword(String(input.password || ''));
  // Reuse the id this person had in the imported old workspace, so their old tasks stay theirs.
  const legacy = JSON.parse((await DB.prepare("SELECT value FROM settings WHERE key='legacy_people'").first())?.value || '{}')[address] || null;
  const taken = legacy && (await DB.prepare('SELECT id FROM users WHERE id=?').bind(legacy.id).first());
  const id = legacy && !taken ? legacy.id : uuid();
  await DB.prepare('INSERT INTO users(id,email,display_name,job_title,pass_hash,pass_salt,pass_iter,is_admin,website_access,marketing_access,active,created_at) VALUES(?,?,?,?,?,?,?,?,?,?,1,?)')
    .bind(id, address, str(input.name, 80) || legacy?.name || address.split('@')[0], str(input.job_title, 80) || legacy?.job || null, pw.pass_hash, pw.pass_salt, pw.pass_iter,
      input.is_admin ? 1 : 0, input.website_access ? 1 : 0, input.marketing_access ? 1 : 0, now()).run();
  await audit(ctx.env, admin, 'accounts', 'Created account', address, [input.is_admin ? 'admin' : 'staff', input.website_access || input.is_admin ? 'Website section' : 'team only', input.marketing_access || input.is_admin ? 'Marketing hub' : ''].filter(Boolean).join(' · '));
  return publicUser(await DB.prepare('SELECT * FROM users WHERE id=?').bind(id).first());
}

export async function updateUser(ctx, id, input) {
  const admin = await requireAdmin(ctx);
  const DB = db(ctx.env);
  const target = await DB.prepare('SELECT * FROM users WHERE id=?').bind(id).first();
  if (!target) fail(404, 'notFound');
  const sets = [], args = [];
  if ('name' in input) { sets.push('display_name=?'); args.push(str(input.name, 80) || target.email.split('@')[0]); }
  if ('job_title' in input) { sets.push('job_title=?'); args.push(str(input.job_title, 80)); }
  if ('website_access' in input) { sets.push('website_access=?'); args.push(input.website_access ? 1 : 0); }
  if ('marketing_access' in input) { sets.push('marketing_access=?'); args.push(input.marketing_access ? 1 : 0); }
  if ('is_admin' in input || 'active' in input) {
    const demoting = ('is_admin' in input && !input.is_admin) || ('active' in input && !input.active);
    if (demoting && target.is_admin) {
      const admins = (await DB.prepare('SELECT COUNT(*) AS n FROM users WHERE is_admin=1 AND active=1').first()).n;
      if (admins <= 1) fail(400, 'lastAdmin', 'Keep at least one active admin.');
    }
    if ('is_admin' in input) { sets.push('is_admin=?'); args.push(input.is_admin ? 1 : 0); }
    if ('active' in input) { sets.push('active=?'); args.push(input.active ? 1 : 0); }
  }
  const batch = [];
  if (input.password) {
    const pw = await hashPassword(String(input.password));
    sets.push('pass_hash=?', 'pass_salt=?', 'pass_iter=?'); args.push(pw.pass_hash, pw.pass_salt, pw.pass_iter);
    if (target.id !== admin.id) batch.push(DB.prepare('DELETE FROM sessions WHERE user_id=?').bind(target.id));
  }
  if ('active' in input && !input.active) batch.push(DB.prepare('DELETE FROM sessions WHERE user_id=?').bind(target.id));
  if (!sets.length) return publicUser(target);
  sets.push('updated_at=?'); args.push(now());
  await DB.batch([DB.prepare(`UPDATE users SET ${sets.join(',')} WHERE id=?`).bind(...args, id), ...batch]);
  const changes = [];
  if (input.password) changes.push('set a new password');
  if ('is_admin' in input) changes.push('admin ' + (input.is_admin ? 'on' : 'off'));
  if ('website_access' in input) changes.push('Website section ' + (input.website_access ? 'on' : 'off'));
  if ('marketing_access' in input) changes.push('Marketing hub ' + (input.marketing_access ? 'on' : 'off'));
  if ('active' in input) changes.push(input.active ? 'enabled' : 'disabled');
  if ('name' in input || 'job_title' in input) changes.push('edited name/title');
  await audit(ctx.env, admin, 'accounts', 'Updated account', target.email, changes.join(' · '));
  return publicUser(await DB.prepare('SELECT * FROM users WHERE id=?').bind(id).first());
}

export async function deleteUser(ctx, id) {
  const admin = await requireAdmin(ctx);
  if (admin.id === id) fail(400, 'notSelf', 'You cannot delete your own account.');
  const DB = db(ctx.env);
  const target = await DB.prepare('SELECT * FROM users WHERE id=?').bind(id).first();
  if (!target) fail(404, 'notFound');
  await DB.batch([DB.prepare('DELETE FROM sessions WHERE user_id=?').bind(id), DB.prepare('DELETE FROM users WHERE id=?').bind(id)]);
  await audit(ctx.env, admin, 'accounts', 'Deleted account', target.email);
  return { ok: true };
}

export async function signIns(ctx) {
  await requireAdmin(ctx);
  const { results } = await db(ctx.env).prepare('SELECT email,ok,at,country,city,device FROM sign_ins ORDER BY at DESC LIMIT 100').all();
  return results;
}
