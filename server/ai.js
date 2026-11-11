// AI features: the lead hunter and the message writer.
// The Anthropic API key lives only in the Cloudflare secret ANTHROPIC_API_KEY. It is read here, on the server,
// and never sent to the browser. Every call checks the signed-in user, a daily limit and a monthly spend cap,
// and records its cost in ai_usage.
import Anthropic from '@anthropic-ai/sdk';
import { db, audit, allow, setting } from './db.js';
import { requireMarketing as requireWebsite, requireAdmin } from './auth.js';
import { notify } from './push.js';
import { HttpError, fail, now, today, uuid, str, sameOrigin } from './util.js';

const WRITER = 'claude-sonnet-5-5';
const SORTER = 'claude-haiku-5-5';
// US dollars per million tokens [input, output], and per web search.
const PRICES = { [WRITER]: [2, 10], [SORTER]: [0.1, 0.5] };
const SEARCH_PRICE = 0.01;
const DEFAULT_MONTH_CAP = 25;
const LIMITS = { hunt: 3, message: 60, caption: 80, reply: 80, reminder: 60 };
const STATUSES = ['new', 'contacted', 'replied', 'won', 'lost'];

const NOSTRIX = `Nostrix Marketing Services is a small creative agency based in Ras Al Khaimah, UAE (website nostrix.ae).
Services: photography, videography, reels and content creation, social media management, event coverage, branding.
Typical starting prices: creator photo sessions from AED 650 for 2 hours, event coverage and monthly content packages on the website.
Clients include cafés, pop-up markets, brands and events across the UAE. Portfolio: nostrix.ae/portfolio/`;

// Business types and preferences the settings page offers as tap-to-pick chips.
export const TYPES = {
  cafe: 'cafés and specialty coffee shops', 'coffee-b2b': 'coffee roasteries, coffee carts and coffee suppliers',
  popup: 'pop-up markets and pop-up shops', event: 'events, festivals and brand activations', restaurant: 'restaurants and bakeries',
  fashion: 'fashion, beauty and salons', 'real-estate': 'real estate agencies and developers', automotive: 'car dealers, garages and detailing',
  wellness: 'gyms, studios and wellness', hospitality: 'hotels, resorts and tourism'
};
const PREFER = {
  new: 'newly opened or about to open', 'weak-ig': 'Instagram content that looks weak, old or irregular',
  events: 'announcing events, launches or seasonal offers', growing: 'growing (new branches, hiring, new menu or products)'
};

const DEFAULT_PROFILE = {
  about: NOSTRIX,
  types: ['cafe', 'coffee-b2b', 'popup', 'event'],
  prefer: ['new', 'weak-ig', 'events'],
  size: 30,
  emirate: 'Ras Al Khaimah',
  perRun: 8,
  avoid: 'Big chains and franchises with in-house marketing teams, businesses that closed, and anything outside the UAE.',
  huntRules: '',
  formal: 40,
  direct: 40,
  length: 35,
  energy: 55,
  emoji: false,
  rules: '',
  signoff: 'Nostrix Team'
};

const clamp = (v, lo, hi, d) => { const n = Math.round(+v); return Number.isFinite(n) ? Math.max(lo, Math.min(hi, n)) : d; };
function clean(input, base) {
  const out = { ...base };
  for (const k of ['about', 'avoid', 'huntRules', 'rules']) if (k in input) out[k] = str(input[k], 3000) || '';
  if ('signoff' in input) out.signoff = str(input.signoff, 80) || base.signoff;
  if ('emirate' in input) out.emirate = str(input.emirate, 40) || base.emirate;
  if (Array.isArray(input.types)) out.types = input.types.filter((t) => TYPES[t]);
  if (Array.isArray(input.prefer)) out.prefer = input.prefer.filter((t) => PREFER[t]);
  for (const k of ['size', 'formal', 'direct', 'length', 'energy']) if (k in input) out[k] = clamp(input[k], 0, 100, base[k]);
  if ('perRun' in input) out.perRun = clamp(input.perRun, 3, 10, base.perRun);
  if ('emoji' in input) out.emoji = !!input.emoji;
  return out;
}

// What the agent knows and how it writes. Admins edit this in Marketing hub → Agent settings.
async function profile(env) {
  let saved = {};
  try { saved = JSON.parse(await setting(env, 'ai_profile') || '{}'); } catch { saved = {}; }
  if (typeof saved.length === 'string') delete saved.length; // older text setting
  return clean(saved, DEFAULT_PROFILE);
}

const band = (v, low, mid, high) => (v < 34 ? low : v < 67 ? mid : high);
function huntBrief(p) {
  const types = p.types.length ? p.types.map((t) => TYPES[t]).join('; ') : 'any local business that needs photos, videos or social media content';
  return `Who to look for: ${types}.
Business size: ${band(p.size, 'small independent local businesses', 'small and mid-size businesses', 'established brands with bigger budgets')}.
${p.prefer.length ? 'Prefer businesses that are: ' + p.prefer.map((t) => PREFER[t]).join('; ') + '.' : ''}`;
}
function voice(p) {
  const words = band(p.length, [35, 60], [60, 90], [90, 130]);
  return `Formality: ${band(p.formal, 'casual and friendly, like a local creative talking to a business owner', 'friendly but professional', 'formal and polished')}.
Sales approach: ${band(p.direct, 'soft: start a conversation and show genuine interest, no hard pitch', 'mention how Nostrix could help and suggest one small next step', 'direct: pitch one specific service and clearly ask for a call or booking')}.
Energy: ${band(p.energy, 'calm and understated', 'balanced', 'upbeat and enthusiastic')}.
Length: Instagram and WhatsApp ${words[0]}-${words[1]} words; email ${words[0] + 40}-${words[1] + 50} words.
Emojis: ${p.emoji ? 'one or two fitting emojis at most' : 'no emojis'}.
Always mention one specific thing about the business.`;
}

export async function getProfile(ctx) {
  await requireWebsite(ctx);
  return { profile: await profile(ctx.env), defaults: DEFAULT_PROFILE, cap: await monthCap(ctx.env), spent: await monthSpend(ctx.env) };
}

export async function saveProfile(ctx, input) {
  const user = await requireAdmin(ctx);
  const out = clean(input, await profile(ctx.env));
  const DB = db(ctx.env);
  await DB.prepare("INSERT INTO settings(key,value) VALUES('ai_profile',?) ON CONFLICT(key) DO UPDATE SET value=excluded.value").bind(JSON.stringify(out)).run();
  if ('cap' in input) {
    const cap = clamp(input.cap, 1, 500, DEFAULT_MONTH_CAP);
    await DB.prepare("INSERT INTO settings(key,value) VALUES('ai_month_cap',?) ON CONFLICT(key) DO UPDATE SET value=excluded.value").bind(String(cap)).run();
  }
  await audit(ctx.env, user, 'leads', 'Changed the agent settings');
  return { ok: true };
}

function client(env) {
  if (!env.ANTHROPIC_API_KEY) fail(503, 'aiNotConfigured', 'The AI key is not set up in Cloudflare yet.');
  return new Anthropic({ apiKey: env.ANTHROPIC_API_KEY, maxRetries: 2, timeout: 5 * 60 * 1000 });
}

const month = () => today().slice(0, 7);

async function monthSpend(env) {
  return (await db(env).prepare('SELECT COALESCE(SUM(cost),0) AS c FROM ai_usage WHERE month=?').bind(month()).first()).c;
}

async function monthCap(env) {
  const v = Number(await setting(env, 'ai_month_cap'));
  return v > 0 ? v : DEFAULT_MONTH_CAP;
}

// Checks before any paid call: signed in, same site, under the monthly cap and the daily limit.
async function gate(ctx, feature) {
  if (!sameOrigin(ctx.request)) fail(403, 'badOrigin');
  const user = await requireWebsite(ctx);
  client(ctx.env);
  if ((await monthSpend(ctx.env)) >= (await monthCap(ctx.env))) fail(429, 'aiMonthCap', 'The monthly AI budget is used up. It resets on the 1st.');
  if (!(await allow(ctx.env, 'ai:' + feature + ':' + today(), LIMITS[feature], 86400))) fail(429, 'aiDailyLimit', 'The daily limit for this AI feature is reached. Try again tomorrow.');
  return user;
}

async function record(env, user, feature, model, usage) {
  const [pin, pout] = PRICES[model];
  const searches = usage?.server_tool_use?.web_search_requests || 0;
  const input = (usage?.input_tokens || 0) + (usage?.cache_creation_input_tokens || 0) + (usage?.cache_read_input_tokens || 0);
  const output = usage?.output_tokens || 0;
  const cost = (input * pin + output * pout) / 1e6 + searches * SEARCH_PRICE;
  await db(env).prepare('INSERT INTO ai_usage(id,at,day,month,user_id,feature,model,input_tokens,output_tokens,searches,cost) VALUES(?,?,?,?,?,?,?,?,?,?,?)')
    .bind(uuid(), now(), today(), month(), user?.id || null, feature, model, input, output, searches, cost).run();
  return cost;
}

const textOf = (message) => message.content.filter((b) => b.type === 'text').map((b) => b.text).join('\n').trim();

function stopCheck(message) {
  if (message.stop_reason === 'refusal') fail(422, 'aiRefused', 'The AI could not help with this request.');
  if (message.stop_reason === 'max_tokens') fail(502, 'aiTooLong', 'The AI answer was cut off. Try again.');
}

// A slow AI job: answer at once and keep the connection alive with spaces until the JSON result is ready.
function slowJob(ctx, work, feature) {
  const { readable, writable } = new TransformStream();
  const writer = writable.getWriter(), enc = new TextEncoder();
  const tick = setInterval(() => { writer.write(enc.encode(' ')).catch(() => {}); }, 8000);
  const job = (async () => {
    let out;
    try { out = await work(); } catch (e) {
      out = describe(e);
      if (feature) {
        // A failed attempt should not use up the daily limit.
        try { await db(ctx.env).prepare('DELETE FROM rate WHERE rowid = (SELECT MAX(rowid) FROM rate WHERE key=?)').bind('ai:' + feature + ':' + today()).run(); } catch { /* ignore */ }
      }
    }
    clearInterval(tick);
    try { await writer.write(enc.encode(JSON.stringify(out))); await writer.close(); } catch { /* browser left */ }
  })();
  ctx.waitUntil?.(job);
  return new Response(readable, { headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' } });
}

function describe(e) {
  if (e instanceof HttpError) return { error: e.code, message: e.message };
  if (e instanceof Anthropic.AuthenticationError) return { error: 'aiKey', message: 'The AI key in Cloudflare is not valid.' };
  if (e instanceof Anthropic.RateLimitError) return { error: 'aiBusy', message: 'The AI is busy. Try again in a minute.' };
  if (e instanceof Anthropic.APIError) {
    console.error('anthropic', e.status, e.message);
    // The provider's message never contains the key; showing it helps the owner fix settings.
    return { error: 'aiError', message: 'The AI service returned an error (' + (e.status || '?') + '): ' + String(e.message || '').slice(0, 300) };
  }
  console.error(e && e.stack || e);
  return { error: 'serverError', message: 'Something went wrong. Try again.' };
}

// ---------- Leads ----------
const LEAD_FIELDS = 'id,name,kind,emirate,area,why,score,service,instagram,website,phone,email,source_url,status,notes,message_channel,message_en,message_ar,message_subject,created_at,updated_at';

export async function leads(ctx) {
  await requireWebsite(ctx);
  const DB = db(ctx.env);
  const { results } = await DB.prepare(`SELECT ${LEAD_FIELDS} FROM leads ORDER BY CASE status WHEN 'new' THEN 0 WHEN 'contacted' THEN 1 WHEN 'replied' THEN 2 ELSE 3 END, score DESC, created_at DESC LIMIT 500`).all();
  const used = (await DB.prepare("SELECT feature, COUNT(*) AS n FROM ai_usage WHERE day=? GROUP BY feature").bind(today()).all()).results;
  const runs = Object.fromEntries(used.map((r) => [r.feature, r.n]));
  const lastHunt = (await DB.prepare("SELECT MAX(at) AS at FROM ai_usage WHERE feature='hunt-search'").first())?.at || null;
  return {
    leads: results,
    usage: { spent: await monthSpend(ctx.env), cap: await monthCap(ctx.env), hunts: runs['hunt-search'] || 0, huntLimit: LIMITS.hunt, messages: runs.message || 0, messageLimit: LIMITS.message, lastHunt },
    ready: !!ctx.env.ANTHROPIC_API_KEY
  };
}

export async function updateLead(ctx, id, input) {
  const user = await requireWebsite(ctx);
  const sets = [], args = [];
  if ('status' in input) { if (!STATUSES.includes(input.status)) fail(400, 'badStatus'); sets.push('status=?'); args.push(input.status); }
  if ('notes' in input) { sets.push('notes=?'); args.push(str(input.notes, 2000)); }
  for (const k of ['message_en', 'message_ar', 'message_subject']) if (k in input) { sets.push(k + '=?'); args.push(str(input[k], 4000)); }
  if (!sets.length) fail(400, 'nothing');
  sets.push('updated_at=?'); args.push(now());
  await db(ctx.env).prepare(`UPDATE leads SET ${sets.join(',')} WHERE id=?`).bind(...args, id).run();
  const lead = await db(ctx.env).prepare('SELECT name FROM leads WHERE id=?').bind(id).first();
  if (!lead) fail(404, 'notFound');
  if ('status' in input) await audit(ctx.env, user, 'leads', 'Marked lead ' + input.status, lead.name);
  return { ok: true };
}

export async function deleteLead(ctx, id) {
  const user = await requireWebsite(ctx);
  const lead = await db(ctx.env).prepare('SELECT name FROM leads WHERE id=?').bind(id).first();
  await db(ctx.env).prepare('DELETE FROM leads WHERE id=?').bind(id).run();
  if (lead) await audit(ctx.env, user, 'leads', 'Deleted lead', lead.name);
  return { ok: true };
}

const LEAD_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: ['leads'],
  properties: {
    leads: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['name', 'kind', 'emirate', 'area', 'why', 'score', 'service', 'instagram', 'website', 'phone', 'email', 'source_url'],
        properties: {
          name: { type: 'string' },
          kind: { type: 'string', enum: ['cafe', 'coffee-b2b', 'popup', 'event', 'brand', 'restaurant', 'retail', 'other'] },
          emirate: { type: 'string' },
          area: { type: 'string' },
          why: { type: 'string' },
          score: { type: 'integer' },
          service: { type: 'string' },
          instagram: { type: 'string' },
          website: { type: 'string' },
          phone: { type: 'string' },
          email: { type: 'string' },
          source_url: { type: 'string' }
        }
      }
    }
  }
};

const norm = (s) => String(s || '').toLowerCase().replace(/^@/, '').replace(/[^a-z0-9؀-ۿ]+/g, '');

export async function hunt(ctx, input) {
  const user = await gate(ctx, 'hunt');
  const focus = str(input.focus, 300);
  const p = await profile(ctx.env);
  const emirate = str(input.emirate, 40) || p.emirate;
  return slowJob(ctx, () => runHunt(ctx, user, emirate, focus), 'hunt');
}

// The lead search itself. Also run by the daily scheduler (user is null then).
export async function runHunt(ctx, user, emirate, focus) {
  const p = await profile(ctx.env);
    const DB = db(ctx.env), anthropic = client(ctx.env);
    const known = (await DB.prepare('SELECT name, instagram FROM leads ORDER BY created_at DESC LIMIT 200').all()).results;
    const skip = known.map((r) => r.name).join('; ');

    // 1. Research with web search (Sonnet).
    const request = {
      model: WRITER,
      max_tokens: 8000,
      output_config: { effort: 'medium' },
      system: `You research sales leads for a small UAE creative agency.\n${p.about}\n\nOnly list real businesses or event organisers you found in search results. Never invent names, accounts or contact details; leave a field empty when it is not published. Use only business contact details the business itself publishes (Instagram handle, website, business phone or email), never private people's details.`,
      tools: [{ type: 'web_search_20260209', name: 'web_search', max_uses: 8 }],
      messages: [{
        role: 'user',
        content: `Find up to ${p.perRun} new potential clients for Nostrix ${/^all/i.test(emirate) ? 'anywhere in the UAE' : 'in ' + emirate + ' (nearby emirates are fine if ' + emirate + ' runs short)'}.
${huntBrief(p)}
${focus ? 'Extra focus from the team: ' + focus + '\n' : ''}Avoid: ${p.avoid || 'nothing specific'}${p.huntRules ? '\nMore instructions: ' + p.huntRules : ''}
Skip these, we already have them: ${skip || 'none yet'}.

For each one write: name; type; emirate and area; one or two sentences on why it is a good fit and what Nostrix could offer; a fit score from 1 to 10; the best Nostrix service to pitch; Instagram handle; website; public business phone; public business email; the URL where you found it.`
      }]
    };
    let message = await anthropic.messages.stream(request).finalMessage();
    let cost = await record(ctx.env, user, 'hunt-search', WRITER, message.usage);
    for (let i = 0; i < 3 && message.stop_reason === 'pause_turn'; i++) {
      request.messages = [request.messages[0], { role: 'assistant', content: message.content }];
      message = await anthropic.messages.stream(request).finalMessage();
      cost += await record(ctx.env, user, 'hunt-search', WRITER, message.usage);
    }
    stopCheck(message);
    const research = textOf(message);
    if (!research) fail(502, 'aiEmpty', 'The AI did not find anything this time. Try again with a different focus.');

    // 2. Turn the research into clean records (Haiku, structured output).
    const sorted = await anthropic.messages.create({
      model: SORTER,
      max_tokens: 6000,
      output_config: { effort: 'low', format: { type: 'json_schema', schema: LEAD_SCHEMA } },
      messages: [{ role: 'user', content: `Convert these research notes into lead records. Copy facts exactly; use an empty string for anything missing. Instagram handles without the @. Score is 1-10.\n\n${research}` }]
    });
    cost += await record(ctx.env, user, 'hunt-sort', SORTER, sorted.usage);
    stopCheck(sorted);
    let found = [];
    try { found = JSON.parse(textOf(sorted)).leads || []; } catch { fail(502, 'aiFormat', 'The AI answer could not be read. Try again.'); }

    const seen = new Set(known.flatMap((r) => [norm(r.name), norm(r.instagram)]).filter(Boolean));
    const stamp = now(), added = [];
    for (const l of found) {
      const keys = [norm(l.name), norm(l.instagram)].filter(Boolean);
      if (!l.name || keys.some((k) => seen.has(k))) continue;
      keys.forEach((k) => seen.add(k));
      const id = uuid();
      await DB.prepare('INSERT INTO leads(id,name,kind,emirate,area,why,score,service,instagram,website,phone,email,source_url,status,created_by,created_at,updated_at) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)')
        .bind(id, str(l.name, 160), str(l.kind, 30), str(l.emirate, 60), str(l.area, 120), str(l.why, 800), Math.max(1, Math.min(10, Math.round(+l.score || 5))),
          str(l.service, 160), str(String(l.instagram || '').replace(/^@/, ''), 80), safeUrl(l.website), str(l.phone, 40), str(l.email, 160), safeUrl(l.source_url), 'new', user.id, stamp, stamp).run();
      added.push(id);
    }
    await audit(ctx.env, user, 'leads', user ? 'Ran the lead hunter' : 'Daily lead search ran', emirate, `${added.length} new leads · $${cost.toFixed(2)}`);
    if (added.length) ctx.waitUntil?.(notify(ctx.env, 'lead', `${added.length} new leads found`, `${emirate} · open the Leads page to review them.`, '/staff/marketing/#leads'));
    return { added: added.length, cost };
}


function safeUrl(v) {
  const s = str(v, 400);
  if (!s) return null;
  try { const u = new URL(/^https?:\/\//i.test(s) ? s : 'https://' + s); return /^https?:$/.test(u.protocol) ? u.href : null; } catch { return null; }
}

const MESSAGE_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: ['subject', 'en', 'ar'],
  properties: { subject: { type: 'string' }, en: { type: 'string' }, ar: { type: 'string' } }
};

const CHANNELS = {
  instagram: 'an Instagram direct message, with no subject',
  whatsapp: 'a WhatsApp message, with no subject',
  email: 'an email with a clear subject line'
};

export async function writeMessage(ctx, id, input) {
  const user = await gate(ctx, 'message');
  const channel = CHANNELS[input.channel] ? input.channel : 'instagram';
  const lead = await db(ctx.env).prepare('SELECT * FROM leads WHERE id=?').bind(id).first();
  if (!lead) fail(404, 'notFound');
  const note = str(input.note, 300);
  const p = await profile(ctx.env);
  return slowJob(ctx, async () => {
    const message = await client(ctx.env).messages.create({
      model: WRITER,
      max_tokens: 3000,
      output_config: { effort: 'low', format: { type: 'json_schema', schema: MESSAGE_SCHEMA } },
      system: `You write first-contact sales messages for Nostrix.\n${p.about}\n\n${voice(p)}\nOffer one clear, small next step (for example a quick call, a sample shoot idea or sending the portfolio).\n${p.rules ? 'More rules: ' + p.rules + '\n' : ''}Do not invent facts, prices, discounts or past work with this business. Sign off as "${p.signoff}". Write the Arabic version as natural Gulf-friendly Modern Standard Arabic, not a word-for-word translation. Leave subject empty unless it is an email.`,
      messages: [{
        role: 'user',
        content: `Write ${CHANNELS[channel]}, in English and in Arabic.\n\nBusiness: ${lead.name}\nType: ${lead.kind || ''}\nWhere: ${[lead.area, lead.emirate].filter(Boolean).join(', ')}\nWhy they fit: ${lead.why || ''}\nService to pitch: ${lead.service || ''}${note ? '\nExtra note from the team: ' + note : ''}`
      }]
    });
    const cost = await record(ctx.env, user, 'message', WRITER, message.usage);
    stopCheck(message);
    let out;
    try { out = JSON.parse(textOf(message)); } catch { fail(502, 'aiFormat', 'The AI answer could not be read. Try again.'); }
    await db(ctx.env).prepare('UPDATE leads SET message_channel=?, message_en=?, message_ar=?, message_subject=?, updated_at=? WHERE id=?')
      .bind(channel, str(out.en, 4000), str(out.ar, 4000), str(out.subject, 200), now(), id).run();
    await audit(ctx.env, user, 'leads', 'Wrote a message with AI', lead.name, channel);
    return { channel, en: out.en, ar: out.ar, subject: out.subject, cost };
  }, 'message');
}

// ---------- Short writing jobs: captions, customer replies, payment and follow-up reminders ----------
const PAIR_SCHEMA = {
  type: 'object', additionalProperties: false, required: ['en', 'ar', 'note'],
  properties: { en: { type: 'string' }, ar: { type: 'string' }, note: { type: 'string' } }
};

async function writePair(ctx, feature, system, prompt, maxTokens = 2500) {
  const user = await gate(ctx, feature);
  const p = await profile(ctx.env);
  return slowJob(ctx, async () => {
    const message = await client(ctx.env).messages.create({
      model: WRITER, max_tokens: maxTokens,
      output_config: { effort: 'low', format: { type: 'json_schema', schema: PAIR_SCHEMA } },
      system: `${system}\n\nAbout the business:\n${p.about}\n\nVoice:\n${voice(p)}\n${p.rules ? 'More rules: ' + p.rules + '\n' : ''}Never invent facts, prices, discounts or promises. Write the Arabic as natural Gulf-friendly Modern Standard Arabic, not a word-for-word translation. Put a one-line tip for the team in "note" (or leave it empty).`,
      messages: [{ role: 'user', content: prompt }]
    });
    const cost = await record(ctx.env, user, feature, WRITER, message.usage);
    stopCheck(message);
    let out;
    try { out = JSON.parse(textOf(message)); } catch { fail(502, 'aiFormat', 'The AI answer could not be read. Try again.'); }
    await audit(ctx.env, user, 'ai', 'Used the ' + feature + ' writer');
    return { ...out, cost };
  }, feature);
}

export async function writeCaption(ctx, input) {
  const platform = input.platform === 'tiktok' ? 'TikTok' : input.platform === 'both' ? 'Instagram and TikTok' : 'Instagram';
  const topic = str(input.topic, 400) || fail(400, 'missing', 'Describe the post first.');
  return writePair(ctx, 'caption',
    'You write social media captions for Nostrix, a creative agency. Captions are scroll-stopping in the first line, clear, and end with a soft call to action. Add 5-10 relevant hashtags at the end (mix of UAE/RAK local and niche tags).',
    `Write a ${platform} caption, in English and in Arabic.\nPost: ${topic}${input.notes ? '\nNotes from the team: ' + str(input.notes, 600) : ''}`);
}

export async function writeReply(ctx, input) {
  const msg = str(input.message, 3000) || fail(400, 'missing', 'Paste the customer message first.');
  const channel = { whatsapp: 'WhatsApp', instagram: 'Instagram DM', email: 'email', tiktok: 'TikTok' }[input.channel] || 'WhatsApp';
  return writePair(ctx, 'reply',
    'You draft replies to customer messages for the Nostrix team. Be helpful and specific, answer what was asked, and move the conversation one step forward (a question, a booking step, or sending the price list or portfolio). If the customer asks for a price that you were not given, say the team will confirm the exact quote. Keep it short enough for chat unless it is an email.',
    `Draft a ${channel} reply, in English and in Arabic. Reply in the same spirit as the customer.\nCustomer message:\n"""${msg}"""${input.context ? '\nWhat the team knows: ' + str(input.context, 800) : ''}`);
}

export async function writeReminder(ctx, input) {
  const kind = { invoice: 'a polite reminder that an invoice is unpaid', quote: 'a friendly follow-up on a quote we sent', lead: 'a short second message to a business that did not reply' }[input.kind] || 'a friendly follow-up';
  return writePair(ctx, 'reminder',
    'You write follow-up messages for the Nostrix team. Polite, warm, never pushy or guilt-tripping, and easy to answer in one line.',
    `Write ${kind}, for WhatsApp, in English and in Arabic.\nTo: ${str(input.name, 120) || 'the client'}\nDetails: ${str(input.details, 600) || ''}`, 1500);
}

// For the daily scheduler: same checks as a person pressing the button (budget and daily limit), without a signed-in user.
export async function scheduledHunt(ctx) {
  if (!ctx.env.ANTHROPIC_API_KEY) return { skipped: 'no AI key' };
  if ((await monthSpend(ctx.env)) >= (await monthCap(ctx.env))) return { skipped: 'monthly AI budget used up' };
  if (!(await allow(ctx.env, 'ai:hunt:' + today(), LIMITS.hunt, 86400))) return { skipped: 'daily limit reached' };
  const p = await profile(ctx.env);
  return runHunt(ctx, null, p.emirate, '');
}
