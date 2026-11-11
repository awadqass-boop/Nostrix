// Automation: the daily lead search and auto-publishing of scheduled posts.
// A free Cloudflare scheduled worker calls POST /api/cron every 15 minutes with the CRON_SECRET header.
// Everything can be paused from Agent settings or the Leads page; nothing runs while paused.
import { db, audit, setting } from './db.js';
import { requireMarketing, requireAdmin } from './auth.js';
import { fail, now, today, safeEqual, str } from './util.js';
import { scheduledHunt } from './ai.js';
import { publishInstagramPost, instagramEnabled } from './planner.js';
import { notify } from './push.js';

const DEFAULTS = { leadsOn: false, leadsHour: 9, leadsDays: [0, 1, 2, 3, 4, 5, 6], publishInstagram: false };

async function load(env) {
  let s = {};
  try { s = JSON.parse(await setting(env, 'automation') || '{}'); } catch { s = {}; }
  return { ...DEFAULTS, ...s };
}
async function store(env, key, value) {
  await db(env).prepare('INSERT INTO settings(key,value) VALUES(?,?) ON CONFLICT(key) DO UPDATE SET value=excluded.value').bind(key, JSON.stringify(value)).run();
}
const uaeNow = () => { const d = new Date(Date.now() + 4 * 3600e3); return { hour: d.getUTCHours(), dow: d.getUTCDay() }; };

export async function get(ctx) {
  await requireMarketing(ctx);
  const a = await load(ctx.env);
  let status = {};
  try { status = JSON.parse(await setting(ctx.env, 'automation_status') || '{}'); } catch { status = {}; }
  return { ...a, status, schedulerReady: !!ctx.env.CRON_SECRET, schedulerSeen: status.seen || null };
}

export async function save(ctx, input) {
  const user = await requireAdmin(ctx);
  const a = await load(ctx.env), changes = [];
  if ('leadsOn' in input) { a.leadsOn = !!input.leadsOn; changes.push('daily lead search ' + (a.leadsOn ? 'on' : 'paused')); }
  if ('leadsHour' in input) { const h = Math.round(+input.leadsHour); if (h >= 0 && h <= 23) a.leadsHour = h; }
  if (Array.isArray(input.leadsDays)) a.leadsDays = [...new Set(input.leadsDays.map(Number).filter((d) => d >= 0 && d <= 6))];
  if ('publishInstagram' in input) { a.publishInstagram = !!input.publishInstagram; changes.push('Instagram publishing ' + (a.publishInstagram ? 'on' : 'off')); }
  await store(ctx.env, 'automation', a);
  if (changes.length) await audit(ctx.env, user, 'automation', 'Changed automation', null, changes.join(' · '));
  return { ok: true };
}

// Called by the scheduled worker. Never needs a signed-in user.
export async function cron(ctx) {
  const key = ctx.request.headers.get('x-cron-key') || '';
  if (!ctx.env.CRON_SECRET || !key || !(await safeEqual(key, ctx.env.CRON_SECRET))) fail(401, 'unauthorized');
  const env = ctx.env, a = await load(env), { hour, dow } = uaeNow(), out = {};
  let status = {};
  try { status = JSON.parse(await setting(env, 'automation_status') || '{}'); } catch { status = {}; }
  status.seen = now();

  // 1. Scheduled Instagram posts that are due.
  if (a.publishInstagram || env.PUBLISH_INSTAGRAM === 'on') {
    const due = (await db(env).prepare("SELECT * FROM posts WHERE status='scheduled' AND scheduled_at IS NOT NULL AND scheduled_at <= ? ORDER BY scheduled_at LIMIT 3").bind(now()).all()).results;
    for (const post of due) {
      let platforms = [];
      try { platforms = JSON.parse(post.platforms || '[]'); } catch { platforms = []; }
      if (!platforms.includes('instagram') || JSON.parse(post.published || '{}').instagram) continue;
      try {
        await publishInstagramPost(env, 'https://nostrix.ae', post, null);
        out.published = (out.published || 0) + 1;
        ctx.waitUntil?.(notify(env, 'lead', 'Posted to Instagram ✅', str(post.title, 100), '/staff/marketing/#planner'));
      } catch (e) {
        await db(env).prepare("UPDATE posts SET status='ready', notes=COALESCE(notes,'') || ? , updated_at=? WHERE id=?").bind('\n[Auto-publish failed: ' + String(e.message).slice(0, 160) + ']', now(), post.id).run();
        ctx.waitUntil?.(notify(env, 'lead', 'Instagram post not published ⚠️', str(post.title, 60) + ': ' + String(e.message).slice(0, 90), '/staff/marketing/#planner'));
      }
    }
  }

  // 2. The daily lead search, once a day at the chosen UAE hour.
  if (a.leadsOn && a.leadsDays.includes(dow) && hour >= a.leadsHour && status.leadsDay !== today()) {
    status.leadsDay = today();
    await store(env, 'automation_status', status);
    try {
      const r = await scheduledHunt(ctx);
      status.leadsResult = r.skipped ? 'Skipped: ' + r.skipped : `${r.added} new leads · $${(r.cost || 0).toFixed(2)}`;
      out.leads = r;
    } catch (e) {
      status.leadsResult = 'Failed: ' + String(e.message || e).slice(0, 160);
      await audit(env, null, 'leads', 'Daily lead search failed', null, status.leadsResult);
    }
    status.leadsAt = now();
  }
  await store(env, 'automation_status', status);
  return { ok: true, ...out };
}
