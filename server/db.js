// Database schema (Cloudflare D1, SQLite). Created automatically on first use.
import seed from '../_build/data/portfolio.json';
import { fail, now, randomHex } from './util.js';

const VERSION = '9';

export const CATEGORIES = [
  { id: 'modelling', en: 'Modelling', ar: 'الأزياء' },
  { id: 'events', en: 'Events', ar: 'الفعاليات' },
  { id: 'wedding', en: 'Wedding', ar: 'الزفاف' },
  { id: 'automotive', en: 'Automotive', ar: 'السيارات' },
  { id: 'products', en: 'Products', ar: 'المنتجات' },
  { id: 'real-estate', en: 'Real Estate', ar: 'العقارات' },
  { id: 'videography', en: 'Videography', ar: 'تصوير الفيديو' }
];

const SCHEMA = `
CREATE TABLE IF NOT EXISTS settings (key TEXT PRIMARY KEY, value TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS users (id TEXT PRIMARY KEY, email TEXT NOT NULL UNIQUE COLLATE NOCASE, display_name TEXT, job_title TEXT, pass_hash TEXT NOT NULL, pass_salt TEXT NOT NULL, pass_iter INTEGER NOT NULL, is_admin INTEGER NOT NULL DEFAULT 0, website_access INTEGER NOT NULL DEFAULT 0, active INTEGER NOT NULL DEFAULT 1, created_at TEXT NOT NULL, updated_at TEXT, last_sign_in_at TEXT);
CREATE TABLE IF NOT EXISTS sessions (token_hash TEXT PRIMARY KEY, user_id TEXT NOT NULL, created_at TEXT NOT NULL, expires_at TEXT NOT NULL);
CREATE INDEX IF NOT EXISTS sessions_user ON sessions(user_id);
CREATE TABLE IF NOT EXISTS rate (key TEXT NOT NULL, at INTEGER NOT NULL);
CREATE INDEX IF NOT EXISTS rate_key ON rate(key, at);
CREATE TABLE IF NOT EXISTS sign_ins (id TEXT PRIMARY KEY, user_id TEXT, email TEXT NOT NULL, ok INTEGER NOT NULL, at TEXT NOT NULL, country TEXT, city TEXT, device TEXT);
CREATE INDEX IF NOT EXISTS sign_ins_at ON sign_ins(at);
CREATE TABLE IF NOT EXISTS projects (id TEXT PRIMARY KEY, name TEXT NOT NULL, client_name TEXT, due_date TEXT, status TEXT NOT NULL DEFAULT 'active', created_by TEXT, created_at TEXT NOT NULL, updated_at TEXT);
CREATE TABLE IF NOT EXISTS tasks (id TEXT PRIMARY KEY, title TEXT NOT NULL, details TEXT, project_id TEXT, assigned_to TEXT, assigned_to_all INTEGER NOT NULL DEFAULT 0, due_date TEXT, due_end_date TEXT, start_time TEXT, end_time TEXT, priority TEXT NOT NULL DEFAULT 'medium', status TEXT NOT NULL DEFAULT 'todo', repeat_rule TEXT NOT NULL DEFAULT 'none', recurred INTEGER NOT NULL DEFAULT 0, created_by TEXT, created_at TEXT NOT NULL, updated_at TEXT);
CREATE TABLE IF NOT EXISTS task_comments (id TEXT PRIMARY KEY, task_id TEXT NOT NULL, user_id TEXT, body TEXT NOT NULL, created_at TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS task_links (id TEXT PRIMARY KEY, task_id TEXT NOT NULL, label TEXT, url TEXT NOT NULL, created_by TEXT, created_at TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS task_files (id TEXT PRIMARY KEY, task_id TEXT NOT NULL, file_name TEXT NOT NULL, storage_path TEXT NOT NULL, mime_type TEXT, size_bytes INTEGER, created_by TEXT, created_at TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS task_activity (id TEXT PRIMARY KEY, task_id TEXT, project_id TEXT, actor_id TEXT, action TEXT, detail TEXT, created_at TEXT NOT NULL);
CREATE INDEX IF NOT EXISTS task_children ON task_comments(task_id);
CREATE TABLE IF NOT EXISTS notifications (id TEXT PRIMARY KEY, user_id TEXT NOT NULL, type TEXT, title TEXT, body TEXT, task_id TEXT, project_id TEXT, is_read INTEGER NOT NULL DEFAULT 0, created_at TEXT NOT NULL);
CREATE INDEX IF NOT EXISTS notifications_user ON notifications(user_id, created_at);
CREATE TABLE IF NOT EXISTS announcements (id TEXT PRIMARY KEY, title TEXT NOT NULL, body TEXT, level TEXT NOT NULL DEFAULT 'info', expires_on TEXT, active INTEGER NOT NULL DEFAULT 1, created_by TEXT, created_at TEXT NOT NULL, updated_at TEXT);
CREATE TABLE IF NOT EXISTS quick_links (id TEXT PRIMARY KEY, label TEXT NOT NULL, url TEXT NOT NULL, icon TEXT, sort_order INTEGER NOT NULL DEFAULT 0, active INTEGER NOT NULL DEFAULT 1, created_by TEXT, created_at TEXT NOT NULL, updated_at TEXT);
CREATE TABLE IF NOT EXISTS reviews (id TEXT PRIMARY KEY, display_name TEXT, name TEXT, company TEXT, display_pref TEXT, email TEXT, instagram TEXT, show_instagram INTEGER NOT NULL DEFAULT 0, service TEXT, rating INTEGER, testimonial TEXT NOT NULL, liked TEXT, improve TEXT, invoice TEXT, source TEXT, source_id TEXT, created_at TEXT NOT NULL, deleted_at TEXT, deleted_by TEXT);
CREATE INDEX IF NOT EXISTS reviews_created ON reviews(created_at);
CREATE TABLE IF NOT EXISTS enquiries (id TEXT PRIMARY KEY, source TEXT, package TEXT, price TEXT, name TEXT, company TEXT, email TEXT, phone TEXT, services TEXT, event_types TEXT, budget TEXT, timeline TEXT, needs TEXT, page_url TEXT, handled INTEGER NOT NULL DEFAULT 0, created_at TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS events (id INTEGER PRIMARY KEY AUTOINCREMENT, at TEXT NOT NULL, day TEXT NOT NULL, type TEXT NOT NULL, path TEXT, name TEXT, label TEXT, source TEXT, device TEXT, lang TEXT, country TEXT, city TEXT, lat REAL, lon REAL, visitor TEXT);
CREATE INDEX IF NOT EXISTS events_day ON events(day, type);
CREATE INDEX IF NOT EXISTS events_at ON events(at);
CREATE TABLE IF NOT EXISTS notes (id TEXT PRIMARY KEY, user_id TEXT NOT NULL, text TEXT NOT NULL, pinned INTEGER NOT NULL DEFAULT 0, created_at TEXT NOT NULL, updated_at TEXT);
CREATE TABLE IF NOT EXISTS audit_log (id INTEGER PRIMARY KEY AUTOINCREMENT, at TEXT NOT NULL, user_id TEXT, email TEXT, name TEXT, area TEXT NOT NULL, action TEXT NOT NULL, target TEXT, detail TEXT);
CREATE INDEX IF NOT EXISTS audit_at ON audit_log(at);
CREATE TABLE IF NOT EXISTS posts (id TEXT PRIMARY KEY, title TEXT NOT NULL, caption_en TEXT, caption_ar TEXT, platforms TEXT, status TEXT NOT NULL DEFAULT 'idea', scheduled_at TEXT, notes TEXT, media_url TEXT, media_key TEXT, kind TEXT, published TEXT, created_by TEXT, created_at TEXT NOT NULL, updated_at TEXT);
CREATE INDEX IF NOT EXISTS posts_when ON posts(scheduled_at);
CREATE TABLE IF NOT EXISTS clients (id TEXT PRIMARY KEY, name TEXT NOT NULL, company TEXT, email TEXT, phone TEXT, trn TEXT, address TEXT, notes TEXT, created_at TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS docs (id TEXT PRIMARY KEY, kind TEXT NOT NULL, number TEXT NOT NULL UNIQUE, client_id TEXT, client TEXT, issue_date TEXT, due_date TEXT, currency TEXT NOT NULL DEFAULT 'AED', items TEXT, vat INTEGER NOT NULL DEFAULT 0, discount REAL NOT NULL DEFAULT 0, notes TEXT, status TEXT NOT NULL DEFAULT 'draft', paid REAL NOT NULL DEFAULT 0, token TEXT NOT NULL UNIQUE, quote_id TEXT, created_by TEXT, created_at TEXT NOT NULL, updated_at TEXT, sent_at TEXT, paid_at TEXT);
CREATE TABLE IF NOT EXISTS push_subs (id TEXT PRIMARY KEY, user_id TEXT NOT NULL, endpoint TEXT NOT NULL UNIQUE, p256dh TEXT NOT NULL, auth TEXT NOT NULL, kinds TEXT, device TEXT, created_at TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS inbox_msgs (id TEXT PRIMARY KEY, channel TEXT NOT NULL, contact_id TEXT NOT NULL, contact_name TEXT, direction TEXT NOT NULL, text TEXT, at TEXT NOT NULL);
CREATE INDEX IF NOT EXISTS inbox_contact ON inbox_msgs(channel, contact_id, at);
CREATE TABLE IF NOT EXISTS social_accounts (platform TEXT PRIMARY KEY, data TEXT NOT NULL, updated_at TEXT);
CREATE TABLE IF NOT EXISTS social_snapshots (day TEXT NOT NULL, platform TEXT NOT NULL, followers INTEGER, posts INTEGER, likes INTEGER, PRIMARY KEY(day, platform));
CREATE TABLE IF NOT EXISTS oauth_states (state TEXT PRIMARY KEY, platform TEXT NOT NULL, user_id TEXT NOT NULL, created_at TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS leads (id TEXT PRIMARY KEY, name TEXT NOT NULL, kind TEXT, emirate TEXT, area TEXT, why TEXT, score INTEGER, service TEXT, instagram TEXT, website TEXT, phone TEXT, email TEXT, source_url TEXT, status TEXT NOT NULL DEFAULT 'new', notes TEXT, message_channel TEXT, message_en TEXT, message_ar TEXT, message_subject TEXT, created_by TEXT, created_at TEXT NOT NULL, updated_at TEXT);
CREATE INDEX IF NOT EXISTS leads_status ON leads(status, score);
CREATE TABLE IF NOT EXISTS ai_usage (id TEXT PRIMARY KEY, at TEXT NOT NULL, day TEXT NOT NULL, month TEXT NOT NULL, user_id TEXT, feature TEXT NOT NULL, model TEXT NOT NULL, input_tokens INTEGER, output_tokens INTEGER, searches INTEGER, cost REAL NOT NULL);
CREATE INDEX IF NOT EXISTS ai_usage_month ON ai_usage(month);
CREATE INDEX IF NOT EXISTS ai_usage_day ON ai_usage(day, feature);
CREATE TABLE IF NOT EXISTS portfolio (id TEXT PRIMARY KEY, category TEXT NOT NULL, label TEXT, src TEXT NOT NULL, thumb TEXT NOT NULL, video TEXT, w INTEGER, h INTEGER, tw INTEGER, th INTEGER, featured INTEGER NOT NULL DEFAULT 0, published INTEGER NOT NULL DEFAULT 0, sort INTEGER NOT NULL DEFAULT 0, media_key TEXT, created_by TEXT, created_at TEXT NOT NULL, updated_at TEXT);
`;

let ready = null;

export function db(env) {
  if (!env.DB) fail(503, 'notConfigured', 'The database is not connected yet.');
  return env.DB;
}

export async function ensureSchema(env) {
  const DB = db(env);
  if (ready) return ready;
  ready = (async () => {
    let version = null;
    try { version = (await DB.prepare("SELECT value FROM settings WHERE key='schema'").first())?.value; } catch { /* first run */ }
    if (version === VERSION) return;
    for (const statement of SCHEMA.split(';').map((s) => s.trim()).filter(Boolean)) await DB.prepare(statement).run();
    try { await DB.prepare('ALTER TABLE users ADD COLUMN marketing_access INTEGER NOT NULL DEFAULT 0').run(); } catch { /* column already there */ }
    await DB.prepare("INSERT OR IGNORE INTO settings(key,value) VALUES('salt',?)").bind(randomHex(32)).run();
    await DB.prepare("INSERT OR IGNORE INTO settings(key,value) VALUES('team_rev','0')").run();
    const count = (await DB.prepare('SELECT COUNT(*) AS n FROM portfolio').first()).n;
    if (!count) {
      const stamp = now();
      const rows = seed.map((it, i) => DB.prepare('INSERT INTO portfolio(id,category,label,src,thumb,video,w,h,tw,th,featured,published,sort,created_at) VALUES(?,?,?,?,?,?,?,?,?,?,?,1,?,?)')
        .bind(it.name, it.cat, it.label, '/portfolio/gallery/' + it.name + '.webp', '/portfolio/gallery/thumbs/' + it.name + '.webp',
          it.video || null, it.w, it.h, it.tw, it.th, it.featured ? 1 : 0, i, stamp));
      for (let i = 0; i < rows.length; i += 50) await DB.batch(rows.slice(i, i + 50));
    }
    await DB.prepare("INSERT INTO settings(key,value) VALUES('schema',?) ON CONFLICT(key) DO UPDATE SET value=excluded.value").bind(VERSION).run();
  })().catch((e) => { ready = null; throw e; });
  return ready;
}

export async function setting(env, key) {
  return (await db(env).prepare('SELECT value FROM settings WHERE key=?').bind(key).first())?.value ?? null;
}

export async function bumpTeam(env) {
  await db(env).prepare("UPDATE settings SET value=CAST(CAST(value AS INTEGER)+1 AS TEXT) WHERE key='team_rev'").run();
}

// Activity log: who did what. Never blocks the action it records.
export async function audit(env, user, area, action, target = null, detail = null) {
  try {
    await db(env).prepare('INSERT INTO audit_log(at,user_id,email,name,area,action,target,detail) VALUES(?,?,?,?,?,?,?,?)')
      .bind(now(), user?.id || null, user?.email || null, user?.display_name || null, area, action,
        target ? String(target).slice(0, 200) : null, detail ? String(detail).slice(0, 300) : null).run();
  } catch (e) { console.error('audit', e); }
}

// Simple sliding-window limiter. Returns false when the limit is reached.
export async function allow(env, key, max, windowSeconds) {
  const DB = db(env), t = Math.floor(Date.now() / 1000);
  const n = (await DB.prepare('SELECT COUNT(*) AS n FROM rate WHERE key=? AND at>?').bind(key, t - windowSeconds).first()).n;
  if (n >= max) return false;
  await DB.batch([
    DB.prepare('INSERT INTO rate(key,at) VALUES(?,?)').bind(key, t),
    DB.prepare('DELETE FROM rate WHERE at<?').bind(t - 86400)
  ]);
  return true;
}
