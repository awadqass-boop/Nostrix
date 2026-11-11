// Request router for /api/*.
import { ensureSchema } from './db.js';
import { HttpError, json, body } from './util.js';
import * as auth from './auth.js';
import * as team from './team.js';
import * as site from './site.js';
import * as pub from './public.js';
import * as ai from './ai.js';

const routes = [];
const on = (method, pattern, fn) => routes.push({ method, re: new RegExp('^' + pattern.replace(/:(\w+)/g, '(?<$1>[^/]+)') + '$'), fn });
const withCookie = (r, status = 200) => json(r.user ? { user: r.user } : { ok: true }, status, { 'set-cookie': r.cookie });

// Session and accounts
on('GET', '/auth/me', (c) => auth.me(c));
on('POST', '/auth/login', async (c) => withCookie(await auth.login(c, await body(c.request))));
on('POST', '/auth/setup', async (c) => withCookie(await auth.setup(c, await body(c.request))));
on('POST', '/auth/logout', async (c) => json({ ok: true }, 200, { 'set-cookie': await auth.logout(c) }));
on('POST', '/auth/password', async (c) => withCookie(await auth.changePassword(c, await body(c.request))));
on('GET', '/admin/users', (c) => auth.listUsers(c));
on('POST', '/admin/users', async (c) => auth.createUser(c, await body(c.request)));
on('PATCH', '/admin/users/:id', async (c, p) => auth.updateUser(c, p.id, await body(c.request)));
on('DELETE', '/admin/users/:id', (c, p) => auth.deleteUser(c, p.id));
on('GET', '/admin/signins', (c) => auth.signIns(c));

// Team workspace
on('POST', '/team/query', async (c) => team.query(c, await body(c.request)));
on('POST', '/team/recurring', (c) => team.materializeRecurring(c));
on('GET', '/team/rev', (c) => team.revision(c));
on('POST', '/team/import', async (c) => team.importTeam(c, await body(c.request, 8 * 1024 * 1024)));
on('PUT', '/team/storage', (c, p, url) => team.putFile(c, url.searchParams.get('path')));
on('GET', '/team/storage', (c, p, url) => team.getFile(c, url.searchParams.get('path')));
on('POST', '/team/storage/delete', async (c) => team.deleteFiles(c, (await body(c.request)).paths));

// Website management
on('GET', '/site/stats', (c, p, url) => site.stats(c, url));
on('GET', '/site/map', (c, p, url) => site.visitorMap(c, url));
on('GET', '/site/clicks', (c, p, url) => site.clicks(c, url));
on('GET', '/site/enquiries', (c) => site.enquiries(c));
on('PATCH', '/site/enquiries/:id', async (c, p) => site.setEnquiry(c, p.id, await body(c.request)));
on('DELETE', '/site/enquiries/:id', (c, p) => site.deleteEnquiry(c, p.id));
on('GET', '/site/reviews', (c) => site.reviews(c));
on('DELETE', '/site/reviews/:id', (c, p) => site.removeReview(c, p.id));
on('POST', '/site/reviews/import', async (c) => site.importReviews(c, await body(c.request, 2 * 1024 * 1024)));
on('GET', '/site/notes', (c) => site.notes(c));
on('GET', '/site/log', (c, p, url) => site.activityLog(c, url));
on('POST', '/site/notes', async (c) => site.addNote(c, await body(c.request)));
on('PATCH', '/site/notes/:id', async (c, p) => site.updateNote(c, p.id, await body(c.request)));
on('DELETE', '/site/notes/:id', (c, p) => site.deleteNote(c, p.id));
on('GET', '/site/portfolio', (c) => site.portfolio(c));
on('POST', '/site/portfolio', async (c) => site.createPhoto(c, await body(c.request)));
on('PUT', '/site/portfolio/:id/:kind', (c, p) => site.putPhoto(c, p.id, p.kind));
on('PATCH', '/site/portfolio/:id', async (c, p) => site.updatePhoto(c, p.id, await body(c.request)));
on('DELETE', '/site/portfolio/:id', (c, p) => site.deletePhoto(c, p.id));
on('POST', '/site/portfolio-order', async (c) => site.reorderPhotos(c, await body(c.request)));

// Leads and AI (key stays on the server)
on('GET', '/ai/leads', (c) => ai.leads(c));
on('GET', '/ai/profile', (c) => ai.getProfile(c));
on('PUT', '/ai/profile', async (c) => ai.saveProfile(c, await body(c.request)));
on('POST', '/ai/leads/hunt', async (c) => ai.hunt(c, await body(c.request)));
on('PATCH', '/ai/leads/:id', async (c, p) => ai.updateLead(c, p.id, await body(c.request)));
on('DELETE', '/ai/leads/:id', (c, p) => ai.deleteLead(c, p.id));
on('POST', '/ai/leads/:id/message', async (c, p) => ai.writeMessage(c, p.id, await body(c.request)));

// Public website
on('POST', '/collect', async (c) => pub.collect(c, await body(c.request, 4096)));
on('GET', '/reviews', async (c) => json(await pub.listReviews(c), 200, { 'cache-control': 'public, max-age=20' }));
on('POST', '/reviews', async (c) => pub.submitReview(c, await body(c.request)));
on('POST', '/enquiries', async (c) => pub.submitEnquiry(c, await body(c.request)));
on('GET', '/portfolio', async (c) => json(await pub.publicPortfolio(c), 200, { 'cache-control': 'public, max-age=30' }));
on('GET', '/media/pf/:file', (c, p) => pub.media(c, 'pf/' + p.file));
on('GET', '/health', () => ({ ok: true }));

export async function handle(context) {
  const { request } = context;
  const url = new URL(request.url);
  const path = url.pathname.replace(/^\/api/, '') || '/';
  const ctx = { request, env: context.env, waitUntil: context.waitUntil?.bind(context) };
  try {
    const match = routes.map((r) => ({ r, m: r.method === request.method && path.match(r.re) })).find((x) => x.m);
    if (!match) {
      const exists = routes.some((r) => path.match(r.re));
      return json({ error: exists ? 'methodNotAllowed' : 'notFound' }, exists ? 405 : 404);
    }
    if (path !== '/health') await ensureSchema(ctx.env);
    const result = await match.r.fn(ctx, match.m.groups || {}, url);
    return result instanceof Response ? result : json(result);
  } catch (e) {
    if (e instanceof HttpError) return json({ error: e.code, message: e.message }, e.status);
    console.error(e && e.stack || e);
    return json({ error: 'serverError', message: 'Something went wrong. Try again.' }, 500);
  }
}
