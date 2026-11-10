// Team workspace data (tasks, projects, announcements…). A small, whitelisted query API used by /staff/.
import { db, bumpTeam, setting, audit } from './db.js';
import { requireUser, publicUser } from './auth.js';
import { fail, now, uuid } from './util.js';

const BOOLS = new Set(['assigned_to_all', 'is_read', 'active', 'is_admin', 'website_access']);
const TABLES = {
  projects: { cols: ['name', 'client_name', 'due_date', 'status', 'created_by'], owner: 'created_by' },
  tasks: { cols: ['title', 'details', 'project_id', 'assigned_to', 'assigned_to_all', 'due_date', 'due_end_date', 'start_time', 'end_time', 'priority', 'status', 'repeat_rule', 'created_by'], owner: 'created_by' },
  task_comments: { cols: ['task_id', 'user_id', 'body'], owner: 'user_id', noUpdate: true },
  task_links: { cols: ['task_id', 'label', 'url', 'created_by'], owner: 'created_by', noUpdate: true },
  task_files: { cols: ['task_id', 'file_name', 'storage_path', 'mime_type', 'size_bytes', 'created_by'], owner: 'created_by', noUpdate: true },
  task_activity: { cols: ['task_id', 'project_id', 'actor_id', 'action', 'detail'], owner: 'actor_id', noUpdate: true, noDelete: true },
  notifications: { cols: ['user_id', 'type', 'title', 'body', 'task_id', 'project_id', 'is_read'], mine: true, noDelete: true },
  announcements: { cols: ['title', 'body', 'level', 'expires_on', 'active', 'created_by'], owner: 'created_by', admin: true },
  quick_links: { cols: ['label', 'url', 'icon', 'sort_order', 'active', 'created_by'], owner: 'created_by', admin: true }
};
const LIVE = new Set(['projects', 'tasks', 'announcements', 'quick_links']);
// What the activity log calls each table, and which column names the item.
const LOG = {
  projects: ['project', 'name'], tasks: ['task', 'title'], task_comments: ['comment', 'body'], task_links: ['link', 'label'],
  task_files: ['file', 'file_name'], announcements: ['announcement', 'title'], quick_links: ['quick link', 'label']
};
async function logRows(ctx, user, verb, table, rows, detail) {
  const def = LOG[table];
  if (!def || !rows.length) return;
  const name = (r) => String(r?.[def[1]] ?? '').slice(0, 120) || null;
  const parentTask = table.startsWith('task_') && rows[0]?.task_id
    ? (await db(ctx.env).prepare('SELECT title FROM tasks WHERE id=?').bind(rows[0].task_id).first())?.title : null;
  for (const r of rows.slice(0, 20)) {
    const target = table.startsWith('task_') && table !== 'task_files' && table !== 'task_links' ? parentTask : name(r);
    const extra = table === 'task_comments' ? name(r) : table.startsWith('task_') && parentTask ? 'on task: ' + parentTask : detail;
    await audit(ctx.env, user, 'team', `${verb} ${def[0]}`, target, extra);
  }
}
const SYSTEM = ['id', 'created_at', 'updated_at'];

const toDb = (v) => (v === true ? 1 : v === false ? 0 : v === undefined ? null : v);
function out(row) {
  if (!row) return row;
  const r = { ...row };
  for (const k of Object.keys(r)) if (BOOLS.has(k)) r[k] = !!r[k];
  delete r.recurred;
  return r;
}

function where(filters, allowed) {
  const parts = [], args = [];
  for (const f of filters || []) {
    const [col, op, val] = f;
    if (!allowed.includes(col)) fail(400, 'badColumn', 'Unknown column ' + col);
    if (op === 'eq' || op === 'neq') {
      if (val === null) parts.push(`${col} IS ${op === 'eq' ? '' : 'NOT '}NULL`);
      else { parts.push(`${col}${op === 'eq' ? '=' : '!='}?`); args.push(toDb(val)); }
    } else if (op === 'is') {
      if (val === null) parts.push(`${col} IS NULL`); else { parts.push(`${col}=?`); args.push(toDb(val)); }
    } else if (op === 'in') {
      if (!Array.isArray(val) || !val.length) { parts.push('0'); continue; }
      parts.push(`${col} IN (${val.map(() => '?').join(',')})`); args.push(...val.map(toDb));
    } else fail(400, 'badOperator');
  }
  return { sql: parts.length ? ' WHERE ' + parts.join(' AND ') : '', args };
}

function orderBy(order, allowed) {
  const parts = (order || []).filter(([c]) => allowed.includes(c)).map(([c, asc]) => `${c} ${asc === false ? 'DESC' : 'ASC'}`);
  return parts.length ? ' ORDER BY ' + parts.join(',') : '';
}

async function profiles(ctx, q, user) {
  const DB = db(ctx.env);
  const map = (u) => ({ user_id: u.id, ...publicUser(u) });
  const filters = (q.filters || []).map(([c, o, v]) => [c === 'user_id' ? 'id' : c, o, v]);
  const allowed = ['id', 'email', 'display_name', 'job_title', 'is_admin', 'created_at'];
  if (q.action === 'select') {
    const w = where(filters, allowed);
    const sql = 'SELECT * FROM users' + (w.sql ? w.sql + ' AND active=1' : ' WHERE active=1') + orderBy((q.order || []).map(([c, a]) => [c === 'user_id' ? 'id' : c, a]), allowed) + (q.limit ? ' LIMIT ' + Math.min(+q.limit, 500) : '');
    return (await DB.prepare(sql).bind(...w.args).all()).results.map(map);
  }
  if (q.action !== 'update') fail(403, 'readOnly');
  const target = filters.find(([c, o]) => c === 'id' && o === 'eq')?.[2];
  if (!target) fail(400, 'needsId');
  const v = q.values || {}, sets = [], args = [];
  if (target === user.id) {
    if ('display_name' in v) { sets.push('display_name=?'); args.push(String(v.display_name || '').slice(0, 80) || user.email.split('@')[0]); }
    if ('job_title' in v) { sets.push('job_title=?'); args.push(v.job_title ? String(v.job_title).slice(0, 80) : null); }
  }
  if ('is_admin' in v) {
    if (!user.is_admin) fail(403, 'adminOnly');
    if (!v.is_admin) {
      const admins = (await DB.prepare('SELECT COUNT(*) AS n FROM users WHERE is_admin=1 AND active=1').first()).n;
      const isAdminNow = (await DB.prepare('SELECT is_admin FROM users WHERE id=?').bind(target).first())?.is_admin;
      if (isAdminNow && admins <= 1) fail(400, 'lastAdmin', 'Keep at least one admin.');
    }
    sets.push('is_admin=?'); args.push(v.is_admin ? 1 : 0);
  }
  if (!sets.length) fail(403, 'notAllowed');
  await DB.prepare(`UPDATE users SET ${sets.join(',')},updated_at=? WHERE id=?`).bind(...args, now(), target).run();
  const who = (await DB.prepare('SELECT email FROM users WHERE id=?').bind(target).first())?.email;
  await audit(ctx.env, user, 'team', 'is_admin' in v ? (v.is_admin ? 'Made team admin' : 'Removed team admin') : 'Edited profile', who);
  return [map(await DB.prepare('SELECT * FROM users WHERE id=?').bind(target).first())];
}

export async function query(ctx, q) {
  const user = await requireUser(ctx);
  if (q.table === 'profiles') return { data: await profiles(ctx, q, user) };
  const def = TABLES[q.table];
  if (!def) fail(400, 'badTable');
  const DB = db(ctx.env), all = [...SYSTEM, ...def.cols];
  const filters = [...(q.filters || [])];
  if (def.mine && q.action !== 'insert') filters.push(['user_id', 'eq', user.id]);
  const writes = q.action !== 'select';
  if (writes && def.admin && !user.is_admin) fail(403, 'adminOnly', 'Admin access required.');

  if (q.action === 'select') {
    const w = where(filters, all);
    const sql = `SELECT * FROM ${q.table}${w.sql}${orderBy(q.order, all)}${q.limit ? ' LIMIT ' + Math.min(+q.limit, 1000) : ''}`;
    return { data: (await DB.prepare(sql).bind(...w.args).all()).results.map(out) };
  }

  if (q.action === 'insert') {
    const rows = (Array.isArray(q.values) ? q.values : [q.values]).slice(0, 100);
    const ids = [], stamp = now();
    const stmts = rows.map((values) => {
      const id = uuid(), cols = ['id', 'created_at'], args = [id, stamp];
      for (const c of def.cols) {
        if (c === def.owner && !(def.mine)) { cols.push(c); args.push(user.id); continue; }
        if (values && c in values) { cols.push(c); args.push(toDb(values[c])); }
      }
      ids.push(id);
      return DB.prepare(`INSERT INTO ${q.table}(${cols.join(',')}) VALUES(${cols.map(() => '?').join(',')})`).bind(...args);
    });
    if (stmts.length) await DB.batch(stmts);
    if (LIVE.has(q.table)) await bumpTeam(ctx.env);
    const { results } = await DB.prepare(`SELECT * FROM ${q.table} WHERE id IN (${ids.map(() => '?').join(',')})`).bind(...ids).all();
    await logRows(ctx, user, q.table === 'task_comments' ? 'Commented on' : q.table === 'task_files' ? 'Attached' : 'Created', q.table, results);
    if (!q.returning) return { data: null };
    return { data: results.map(out) };
  }

  if (!filters.length) fail(400, 'needsFilter');
  const w = where(filters, all);

  if (q.action === 'update') {
    if (def.noUpdate) fail(403, 'readOnly');
    const sets = [], args = [];
    for (const [c, v] of Object.entries(q.values || {})) {
      if (!def.cols.includes(c) || c === def.owner) continue;
      sets.push(`${c}=?`); args.push(toDb(v));
    }
    if (!sets.length) return { data: [] };
    if (all.includes('updated_at') && TABLES[q.table].cols && ['projects', 'tasks', 'announcements', 'quick_links'].includes(q.table)) { sets.push('updated_at=?'); args.push(now()); }
    if (q.table === 'tasks' && 'status' in (q.values || {})) sets.push('recurred=0');
    const before = LOG[q.table] ? (await DB.prepare(`SELECT * FROM ${q.table}${w.sql} LIMIT 20`).bind(...w.args).all()).results : [];
    await DB.prepare(`UPDATE ${q.table} SET ${sets.join(',')}${w.sql}`).bind(...args, ...w.args).run();
    const v = q.values || {}, keys = Object.keys(v).filter((k) => def.cols.includes(k));
    const detail = keys.length === 1 && ['status', 'priority', 'active'].includes(keys[0]) ? `${keys[0]}: ${v[keys[0]]}` : 'changed ' + keys.map((k) => k.replace(/_/g, ' ')).join(', ');
    await logRows(ctx, user, keys.length === 1 && keys[0] === 'status' ? 'Moved' : 'Edited', q.table, before, detail);
    if (LIVE.has(q.table)) await bumpTeam(ctx.env);
    if (!q.returning) return { data: null };
    return { data: (await DB.prepare(`SELECT * FROM ${q.table}${w.sql}`).bind(...w.args).all()).results.map(out) };
  }

  if (q.action === 'delete') {
    if (def.noDelete) fail(403, 'readOnly');
    const doomedRows = (await DB.prepare(`SELECT * FROM ${q.table}${w.sql}`).bind(...w.args).all()).results;
    const doomed = doomedRows.map((r) => r.id);
    if (!doomed.length) return { data: [] };
    await logRows(ctx, user, q.table === 'task_files' ? 'Removed' : 'Deleted', q.table, doomedRows);
    const marks = doomed.map(() => '?').join(',');
    const stmts = [DB.prepare(`DELETE FROM ${q.table} WHERE id IN (${marks})`).bind(...doomed)];
    if (q.table === 'tasks') {
      const files = (await DB.prepare(`SELECT storage_path FROM task_files WHERE task_id IN (${marks})`).bind(...doomed).all()).results;
      if (ctx.env.MEDIA) await Promise.all(files.map((f) => ctx.env.MEDIA.delete('tf/' + f.storage_path)));
      for (const t of ['task_comments', 'task_links', 'task_files', 'task_activity', 'notifications'])
        stmts.push(DB.prepare(`DELETE FROM ${t} WHERE task_id IN (${marks})`).bind(...doomed));
    }
    if (q.table === 'projects') stmts.push(DB.prepare(`UPDATE tasks SET project_id=NULL WHERE project_id IN (${marks})`).bind(...doomed));
    await DB.batch(stmts);
    if (LIVE.has(q.table) || q.table === 'projects') await bumpTeam(ctx.env);
    return { data: doomed.map((id) => ({ id })) };
  }
  fail(400, 'badAction');
}

// Creates the next occurrence of finished repeating tasks.
export async function materializeRecurring(ctx) {
  await requireUser(ctx);
  const DB = db(ctx.env);
  const { results } = await DB.prepare("SELECT * FROM tasks WHERE status='done' AND repeat_rule IN ('daily','weekly','monthly') AND recurred=0 AND due_date IS NOT NULL").all();
  if (!results.length) return { created: 0 };
  const today = now().slice(0, 10), stamp = now(), stmts = [];
  const step = (d, rule) => {
    const x = new Date(d + 'T12:00:00Z');
    if (rule === 'daily') x.setUTCDate(x.getUTCDate() + 1);
    else if (rule === 'weekly') x.setUTCDate(x.getUTCDate() + 7);
    else x.setUTCMonth(x.getUTCMonth() + 1);
    return x.toISOString().slice(0, 10);
  };
  for (const t of results) {
    let next = step(t.due_date, t.repeat_rule);
    while (next < today) next = step(next, t.repeat_rule);
    const span = t.due_end_date ? Math.round((Date.parse(t.due_end_date) - Date.parse(t.due_date)) / 864e5) : 0;
    const end = span > 0 ? new Date(Date.parse(next + 'T12:00:00Z') + span * 864e5).toISOString().slice(0, 10) : next;
    stmts.push(DB.prepare('INSERT INTO tasks(id,title,details,project_id,assigned_to,assigned_to_all,due_date,due_end_date,start_time,end_time,priority,status,repeat_rule,created_by,created_at) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)')
      .bind(uuid(), t.title, t.details, t.project_id, t.assigned_to, t.assigned_to_all, next, end, t.start_time, t.end_time, t.priority, 'todo', t.repeat_rule, t.created_by, stamp));
    stmts.push(DB.prepare('UPDATE tasks SET recurred=1 WHERE id=?').bind(t.id));
  }
  await DB.batch(stmts);
  await bumpTeam(ctx.env);
  return { created: results.length };
}

export async function revision(ctx) {
  const user = await requireUser(ctx);
  const latest = await db(ctx.env).prepare('SELECT * FROM notifications WHERE user_id=? ORDER BY created_at DESC LIMIT 1').bind(user.id).first();
  return { rev: await setting(ctx.env, 'team_rev'), notification: out(latest) };
}

// ---- One-time import of the old Supabase workspace (admins) ----
// Rows keep their original ids; people are matched to the new accounts by email.
export async function importTeam(ctx, input) {
  const admin = await requireUser(ctx);
  if (!admin.is_admin) fail(403, 'adminOnly');
  const DB = db(ctx.env);
  const accounts = (await DB.prepare('SELECT id, email FROM users').all()).results;
  const byEmail = new Map(accounts.map((u) => [u.email.toLowerCase(), u.id]));
  // People without an account yet keep their old id; the account created later for that email reuses it.
  const legacy = JSON.parse((await setting(ctx.env, 'legacy_people')) || '{}');
  const profileBy = new Map((input.profiles || []).map((p) => [String(p.email || '').toLowerCase(), p]));
  const people = new Map((input.users || []).map((u) => {
    const mail = String(u.email || '').toLowerCase();
    const current = byEmail.get(mail);
    if (!current && /^[0-9a-f-]{36}$/.test(u.id)) legacy[mail] = { id: u.id, name: profileBy.get(mail)?.display_name || null, job: profileBy.get(mail)?.job_title || null };
    return [u.id, current || (/^[0-9a-f-]{36}$/.test(u.id) ? u.id : null)];
  }));
  await DB.prepare("INSERT INTO settings(key,value) VALUES('legacy_people',?) ON CONFLICT(key) DO UPDATE SET value=excluded.value").bind(JSON.stringify(legacy)).run();
  const person = (id) => (id ? people.get(id) ?? null : null);
  const PEOPLE = new Set(['created_by', 'assigned_to', 'user_id', 'actor_id']);
  const counts = {};
  for (const table of ['projects', 'tasks', 'task_comments', 'task_links', 'task_activity', 'announcements', 'quick_links']) {
    const def = TABLES[table], rows = Array.isArray(input[table]) ? input[table].slice(0, 5000) : [];
    const cols = ['id', 'created_at', ...def.cols];
    const stmts = [];
    for (const r of rows) {
      if (!r || !r.id) continue;
      const values = cols.map((c) => {
        let v = r[c];
        if (PEOPLE.has(c)) v = person(v);
        if (c === 'created_at') v = v || now();
        return toDb(v === undefined ? null : v);
      });
      stmts.push(DB.prepare(`INSERT OR IGNORE INTO ${table}(${cols.join(',')}) VALUES(${cols.map(() => '?').join(',')})`).bind(...values));
    }
    for (let i = 0; i < stmts.length; i += 50) await DB.batch(stmts.slice(i, i + 50));
    counts[table] = stmts.length;
  }
  const profileUpdates = (input.profiles || []).map((p) => ({ id: byEmail.get(String(p.email || '').toLowerCase()), p })).filter((x) => x.id)
    .map(({ id, p }) => DB.prepare('UPDATE users SET display_name=COALESCE(?,display_name), job_title=COALESCE(job_title,?) WHERE id=?')
      .bind(p.display_name ? String(p.display_name).slice(0, 80) : null, p.job_title ? String(p.job_title).slice(0, 80) : null, id));
  if (profileUpdates.length) await DB.batch(profileUpdates);
  counts.profiles = profileUpdates.length;
  await bumpTeam(ctx.env);
  await audit(ctx.env, admin, 'team', 'Imported old staff workspace', null, Object.entries(counts).filter(([, n]) => n).map(([k, n]) => `${n} ${k.replace(/_/g, ' ')}`).join(' · '));
  return { imported: counts, waitingForAccounts: Object.keys(legacy) };
}

// ---- Task file storage (Cloudflare KV) ----
const PATH = /^[\w-]{1,64}\/[\w.\-]{1,220}$/;
function media(env) { if (!env.MEDIA) fail(503, 'notConfigured', 'File storage is not connected yet.'); return env.MEDIA; }

export async function putFile(ctx, path) {
  const user = await requireUser(ctx);
  if (!PATH.test(path || '')) fail(400, 'badPath');
  const size = +ctx.request.headers.get('content-length') || 0;
  if (size > 20 * 1024 * 1024) fail(413, 'tooLarge', 'File exceeds 20 MB.');
  await media(ctx.env).put('tf/' + path, ctx.request.body, { metadata: { type: ctx.request.headers.get('content-type') || 'application/octet-stream', by: user.id } });
  return { path };
}

export async function getFile(ctx, path) {
  await requireUser(ctx);
  if (!PATH.test(path || '')) fail(400, 'badPath');
  const obj = await media(ctx.env).getWithMetadata('tf/' + path, { type: 'stream' });
  if (!obj.value) fail(404, 'notFound');
  const name = path.split('/').pop().replace(/^[0-9a-f-]{36}-/, '');
  return new Response(obj.value, { headers: {
    'content-type': obj.metadata?.type || 'application/octet-stream',
    'content-disposition': `inline; filename="${name.replace(/"/g, '')}"`,
    'cache-control': 'private, max-age=300', 'x-content-type-options': 'nosniff'
  } });
}

export async function deleteFiles(ctx, paths) {
  await requireUser(ctx);
  const list = (Array.isArray(paths) ? paths : []).filter((p) => PATH.test(p)).slice(0, 50);
  await Promise.all(list.map((p) => media(ctx.env).delete('tf/' + p)));
  return { removed: list.length };
}
