// Quotes, invoices, clients and follow-ups (owner only), plus the client-facing document page.
import { db, audit, setting } from './db.js';
import { requireAdmin } from './auth.js';
import { fail, now, uuid, str, today, randomHex } from './util.js';
import { notify } from './push.js';

const STATUSES = { quote: ['draft', 'sent', 'accepted', 'declined', 'expired'], invoice: ['draft', 'sent', 'paid', 'partial', 'cancelled'] };
const VAT_RATE = 0.05;

const num = (v, d = 0) => { const n = Number(v); return Number.isFinite(n) ? n : d; };
const round2 = (n) => Math.round(n * 100) / 100;
function safe(v, d) { try { return v ? JSON.parse(v) : d; } catch { return d; } }

function totals(items, vat, discount) {
  const subtotal = round2(items.reduce((s, i) => s + num(i.qty, 1) * num(i.price), 0));
  const disc = round2(Math.min(subtotal, Math.max(0, num(discount))));
  const taxable = subtotal - disc;
  const tax = vat ? round2(taxable * VAT_RATE) : 0;
  return { subtotal, discount: disc, tax, total: round2(taxable + tax) };
}

const docOut = (d) => {
  const items = safe(d.items, []), client = safe(d.client, {});
  const t = totals(items, d.vat, d.discount);
  let status = d.status;
  if (d.kind === 'invoice' && ['sent', 'partial'].includes(status) && d.due_date && d.due_date < today()) status = 'overdue';
  if (d.kind === 'quote' && status === 'sent' && d.due_date && d.due_date < today()) status = 'expired';
  return { ...d, items, client, ...t, balance: round2(t.total - num(d.paid)), status, vat: !!d.vat };
};

async function business(env) { return safe(await setting(env, 'business'), {}); }

export async function overview(ctx) {
  await requireAdmin(ctx);
  const DB = db(ctx.env);
  const clients = (await DB.prepare('SELECT * FROM clients ORDER BY name').all()).results;
  const docs = (await DB.prepare('SELECT * FROM docs ORDER BY created_at DESC LIMIT 1000').all()).results.map(docOut);
  const leads = (await DB.prepare("SELECT id,name,instagram,phone,email,updated_at,message_en FROM leads WHERE status='contacted' AND updated_at < ?").bind(new Date(Date.now() - 4 * 864e5).toISOString()).all()).results;
  const followups = [
    ...docs.filter((d) => d.kind === 'invoice' && ['overdue', 'sent', 'partial'].includes(d.status) && d.balance > 0 && (d.status === 'overdue' || (d.due_date && d.due_date <= today())))
      .map((d) => ({ type: 'invoice', id: d.id, name: d.client.name || 'Client', phone: d.client.phone || '', email: d.client.email || '', title: d.number, amount: d.balance, currency: d.currency, since: d.due_date, details: `Invoice ${d.number}, ${d.currency} ${d.balance} unpaid, due ${d.due_date}` })),
    ...docs.filter((d) => d.kind === 'quote' && d.status === 'sent' && d.sent_at && Date.now() - Date.parse(d.sent_at) > 3 * 864e5)
      .map((d) => ({ type: 'quote', id: d.id, name: d.client.name || 'Client', phone: d.client.phone || '', email: d.client.email || '', title: d.number, amount: d.total, currency: d.currency, since: d.sent_at.slice(0, 10), details: `Quote ${d.number} for ${d.currency} ${d.total}, sent ${d.sent_at.slice(0, 10)}` })),
    ...leads.map((l) => ({ type: 'lead', id: l.id, name: l.name, phone: l.phone || '', email: l.email || '', title: l.instagram ? '@' + l.instagram : 'Lead', since: l.updated_at.slice(0, 10), details: 'We sent a first message and have not heard back.' }))
  ];
  const paid = docs.filter((d) => d.kind === 'invoice' && d.status !== 'cancelled');
  const stats = {
    outstanding: round2(paid.reduce((s, d) => s + (d.status === 'draft' ? 0 : d.balance), 0)),
    overdue: round2(paid.filter((d) => d.status === 'overdue').reduce((s, d) => s + d.balance, 0)),
    paidThisMonth: round2(paid.filter((d) => d.paid_at && d.paid_at.slice(0, 7) === today().slice(0, 7)).reduce((s, d) => s + num(d.paid), 0)),
    openQuotes: round2(docs.filter((d) => d.kind === 'quote' && d.status === 'sent').reduce((s, d) => s + d.total, 0))
  };
  return { clients, docs, followups, stats, business: await business(ctx.env), vatRate: VAT_RATE };
}

export async function saveBusiness(ctx, input) {
  const user = await requireAdmin(ctx);
  const out = {};
  for (const k of ['name', 'address', 'trn', 'email', 'phone', 'bank', 'iban', 'terms', 'logo']) out[k] = str(input[k], k === 'terms' ? 1500 : 300) || '';
  await db(ctx.env).prepare("INSERT INTO settings(key,value) VALUES('business',?) ON CONFLICT(key) DO UPDATE SET value=excluded.value").bind(JSON.stringify(out)).run();
  await audit(ctx.env, user, 'sales', 'Updated business details');
  return { ok: true };
}

function cleanClient(input) {
  return { name: str(input.name, 160) || fail(400, 'missing', 'Add the client name.'), company: str(input.company, 160), email: str(input.email, 200),
    phone: str(input.phone, 40), trn: str(input.trn, 40), address: str(input.address, 400), notes: str(input.notes, 1000) };
}
export async function createClient(ctx, input) {
  const user = await requireAdmin(ctx);
  const c = cleanClient(input), id = uuid();
  await db(ctx.env).prepare('INSERT INTO clients(id,name,company,email,phone,trn,address,notes,created_at) VALUES(?,?,?,?,?,?,?,?,?)')
    .bind(id, c.name, c.company, c.email, c.phone, c.trn, c.address, c.notes, now()).run();
  await audit(ctx.env, user, 'sales', 'Added client', c.name);
  return { id, ...c };
}
export async function updateClient(ctx, id, input) {
  await requireAdmin(ctx);
  const c = cleanClient(input);
  await db(ctx.env).prepare('UPDATE clients SET name=?,company=?,email=?,phone=?,trn=?,address=?,notes=? WHERE id=?').bind(c.name, c.company, c.email, c.phone, c.trn, c.address, c.notes, id).run();
  return { ok: true };
}
export async function deleteClient(ctx, id) {
  const user = await requireAdmin(ctx);
  await db(ctx.env).prepare('DELETE FROM clients WHERE id=?').bind(id).run();
  await audit(ctx.env, user, 'sales', 'Deleted client');
  return { ok: true };
}

async function nextNumber(env, kind) {
  const year = today().slice(0, 4), prefix = kind === 'quote' ? `NX-Q-${year}-` : `NX-INV-${year}-`;
  const last = await db(env).prepare('SELECT number FROM docs WHERE kind=? AND number LIKE ? ORDER BY number DESC LIMIT 1').bind(kind, prefix + '%').first();
  const n = last ? parseInt(last.number.slice(prefix.length), 10) + 1 : 1;
  return prefix + String(n).padStart(4, '0');
}

function cleanDoc(input, kind) {
  const items = (Array.isArray(input.items) ? input.items : []).slice(0, 50).map((i) => ({ desc: str(i.desc, 300) || '', qty: round2(Math.max(0, num(i.qty, 1))), price: round2(Math.max(0, num(i.price))) })).filter((i) => i.desc || i.price);
  const status = STATUSES[kind].includes(input.status) ? input.status : 'draft';
  return {
    items, status, vat: input.vat ? 1 : 0, discount: round2(Math.max(0, num(input.discount))), currency: ['AED', 'USD'].includes(input.currency) ? input.currency : 'AED',
    issue_date: str(input.issue_date, 10) || today(), due_date: str(input.due_date, 10), notes: str(input.notes, 2000),
    paid: round2(Math.max(0, num(input.paid))), client: input.client || {}
  };
}

async function clientSnapshot(env, input) {
  if (input.client_id) {
    const c = await db(env).prepare('SELECT * FROM clients WHERE id=?').bind(input.client_id).first();
    if (c) return { id: c.id, name: c.name, company: c.company, email: c.email, phone: c.phone, trn: c.trn, address: c.address };
  }
  const c = input.client || {};
  return { name: str(c.name, 160) || 'Client', company: str(c.company, 160), email: str(c.email, 200), phone: str(c.phone, 40), trn: str(c.trn, 40), address: str(c.address, 400) };
}

export async function createDoc(ctx, input) {
  const user = await requireAdmin(ctx);
  const kind = input.kind === 'invoice' ? 'invoice' : 'quote';
  const d = cleanDoc(input, kind), id = uuid(), stamp = now(), number = await nextNumber(ctx.env, kind), client = await clientSnapshot(ctx.env, input);
  await db(ctx.env).prepare('INSERT INTO docs(id,kind,number,client_id,client,issue_date,due_date,currency,items,vat,discount,notes,status,paid,token,quote_id,created_by,created_at,updated_at) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)')
    .bind(id, kind, number, client.id || null, JSON.stringify(client), d.issue_date, d.due_date || null, d.currency, JSON.stringify(d.items), d.vat, d.discount, d.notes, d.status, d.paid, randomHex(16), str(input.quote_id, 40), user.id, stamp, stamp).run();
  await audit(ctx.env, user, 'sales', 'Created ' + kind, number);
  return docOut(await db(ctx.env).prepare('SELECT * FROM docs WHERE id=?').bind(id).first());
}

export async function updateDoc(ctx, id, input) {
  const user = await requireAdmin(ctx);
  const cur = await db(ctx.env).prepare('SELECT * FROM docs WHERE id=?').bind(id).first();
  if (!cur) fail(404, 'notFound');
  const d = cleanDoc({ ...docOut(cur), ...input, status: input.status || cur.status }, cur.kind);
  const client = input.client || input.client_id ? await clientSnapshot(ctx.env, input) : safe(cur.client, {});
  const sentAt = d.status === 'sent' && !cur.sent_at ? now() : cur.sent_at;
  const t = totals(d.items, d.vat, d.discount);
  const paidAt = (d.status === 'paid' || d.paid >= t.total) && !cur.paid_at ? now() : cur.paid_at;
  const paid = d.status === 'paid' ? t.total : d.paid;
  const status = cur.kind === 'invoice' && paid > 0 && paid < t.total && ['sent', 'paid'].includes(d.status) ? 'partial' : d.status;
  await db(ctx.env).prepare('UPDATE docs SET client=?,client_id=?,issue_date=?,due_date=?,currency=?,items=?,vat=?,discount=?,notes=?,status=?,paid=?,sent_at=?,paid_at=?,updated_at=? WHERE id=?')
    .bind(JSON.stringify(client), client.id || null, d.issue_date, d.due_date || null, d.currency, JSON.stringify(d.items), d.vat, d.discount, d.notes, status, paid, sentAt, paidAt, now(), id).run();
  if (status !== cur.status) await audit(ctx.env, user, 'sales', `Marked ${cur.number} ${status}`);
  return docOut(await db(ctx.env).prepare('SELECT * FROM docs WHERE id=?').bind(id).first());
}

export async function deleteDoc(ctx, id) {
  const user = await requireAdmin(ctx);
  const cur = await db(ctx.env).prepare('SELECT number FROM docs WHERE id=?').bind(id).first();
  await db(ctx.env).prepare('DELETE FROM docs WHERE id=?').bind(id).run();
  if (cur) await audit(ctx.env, user, 'sales', 'Deleted ' + cur.number);
  return { ok: true };
}

export async function convert(ctx, id) {
  await requireAdmin(ctx);
  const q = await db(ctx.env).prepare("SELECT * FROM docs WHERE id=? AND kind='quote'").bind(id).first();
  if (!q) fail(404, 'notFound');
  const due = new Date(Date.now() + 7 * 864e5).toISOString().slice(0, 10);
  const inv = await createDoc(ctx, { kind: 'invoice', client: safe(q.client, {}), client_id: q.client_id, items: safe(q.items, []), vat: q.vat, discount: q.discount, currency: q.currency, notes: q.notes, due_date: due, quote_id: q.id });
  await db(ctx.env).prepare("UPDATE docs SET status='accepted', updated_at=? WHERE id=?").bind(now(), id).run();
  return inv;
}

// ---------- The page the client sees (no login, unguessable link) ----------
const esc = (v) => String(v ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const money = (cur, v) => cur + ' ' + num(v).toLocaleString('en-AE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export async function publicDoc(ctx, token) {
  if (!/^[a-f0-9]{32}$/.test(token || '')) fail(404, 'notFound');
  const raw = await db(ctx.env).prepare('SELECT * FROM docs WHERE token=?').bind(token).first();
  if (!raw || raw.status === 'draft') fail(404, 'notFound');
  const d = docOut(raw), b = await business(ctx.env), isQuote = d.kind === 'quote';
  const canAccept = isQuote && d.status === 'sent';
  const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex">
<title>${esc(d.number)} · ${esc(b.name || 'Nostrix')}</title><style>
:root{--ink:#16151a;--muted:#6b6a75;--line:#e6e5ec;--brand:linear-gradient(105deg,#D388FF,#B9CCFF)}*{box-sizing:border-box}
body{margin:0;background:#f4f3f8;color:var(--ink);font:15px/1.5 -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Arial,sans-serif}
.sheet{max-width:820px;margin:32px auto;background:#fff;border-radius:20px;padding:48px;box-shadow:0 20px 60px rgba(20,10,40,.08);position:relative;overflow:hidden}
.sheet:before{content:"";position:absolute;inset:0 0 auto;height:6px;background:var(--brand)}
.top{display:flex;justify-content:space-between;gap:24px;flex-wrap:wrap}.brand{font-weight:800;letter-spacing:.3em;font-size:18px}
h1{margin:0;font-size:30px;letter-spacing:-.02em}.muted{color:var(--muted)}.tag{display:inline-block;padding:3px 10px;border-radius:99px;background:#f1ecfb;color:#6b3fa0;font-size:12px;font-weight:600;text-transform:capitalize}
.cols{display:grid;grid-template-columns:1fr 1fr;gap:24px;margin:32px 0}.cols h3{margin:0 0 6px;font-size:11px;letter-spacing:.12em;text-transform:uppercase;color:var(--muted)}
table{width:100%;border-collapse:collapse}th{text-align:left;font-size:11px;letter-spacing:.1em;text-transform:uppercase;color:var(--muted);padding:10px 0;border-bottom:1px solid var(--line)}
td{padding:12px 0;border-bottom:1px solid var(--line)}.r{text-align:right}.sum{margin-left:auto;width:min(320px,100%);margin-top:16px}.sum div{display:flex;justify-content:space-between;padding:6px 0}
.sum .total{font-size:20px;font-weight:800;border-top:2px solid var(--ink);margin-top:6px;padding-top:12px}.foot{margin-top:36px;padding-top:20px;border-top:1px solid var(--line);font-size:13px;color:var(--muted);white-space:pre-line}
.actions{max-width:820px;margin:0 auto 40px;display:flex;gap:10px;justify-content:flex-end;padding:0 8px}button{font:inherit;font-weight:600;border:0;border-radius:99px;padding:12px 22px;cursor:pointer;background:#16151a;color:#fff}button.alt{background:#fff;color:#16151a;border:1px solid var(--line)}
@media(max-width:640px){.sheet{padding:28px;margin:12px;border-radius:16px}.cols{grid-template-columns:1fr}}@media print{body{background:#fff}.sheet{box-shadow:none;margin:0;max-width:none}.actions{display:none}}
</style></head><body><main class="sheet">
<div class="top"><div><div class="brand">${esc((b.name || 'NOSTRIX').toUpperCase())}</div><div class="muted">${esc(b.address || '')}${b.trn ? '<br>TRN ' + esc(b.trn) : ''}</div></div>
<div style="text-align:right"><h1>${isQuote ? 'Quotation' : (d.vat ? 'Tax invoice' : 'Invoice')}</h1><div class="muted">${esc(d.number)}</div><span class="tag">${esc(d.status)}</span></div></div>
<div class="cols"><div><h3>${isQuote ? 'Prepared for' : 'Bill to'}</h3><strong>${esc(d.client.name)}</strong><br>${esc(d.client.company || '')}${d.client.trn ? '<br>TRN ' + esc(d.client.trn) : ''}<br><span class="muted">${esc([d.client.email, d.client.phone].filter(Boolean).join(' · '))}</span></div>
<div style="text-align:right"><h3>Details</h3>Date: ${esc(d.issue_date)}<br>${d.due_date ? (isQuote ? 'Valid until: ' : 'Due: ') + esc(d.due_date) : ''}</div></div>
<table><thead><tr><th>Description</th><th class="r">Qty</th><th class="r">Price</th><th class="r">Amount</th></tr></thead><tbody>
${d.items.map((i) => `<tr><td>${esc(i.desc)}</td><td class="r">${esc(i.qty)}</td><td class="r">${esc(money(d.currency, i.price))}</td><td class="r">${esc(money(d.currency, i.qty * i.price))}</td></tr>`).join('')}
</tbody></table><div class="sum"><div><span>Subtotal</span><span>${esc(money(d.currency, d.subtotal))}</span></div>${d.discount ? `<div><span>Discount</span><span>− ${esc(money(d.currency, d.discount))}</span></div>` : ''}${d.vat ? `<div><span>VAT 5%</span><span>${esc(money(d.currency, d.tax))}</span></div>` : ''}
<div class="total"><span>Total</span><span>${esc(money(d.currency, d.total))}</span></div>${!isQuote && d.paid ? `<div><span>Paid</span><span>${esc(money(d.currency, d.paid))}</span></div><div><strong>Balance</strong><strong>${esc(money(d.currency, d.balance))}</strong></div>` : ''}</div>
<div class="foot">${d.notes ? esc(d.notes) + '\n\n' : ''}${!isQuote && (b.bank || b.iban) ? 'Payment: ' + esc([b.bank, b.iban && 'IBAN ' + b.iban].filter(Boolean).join(' · ')) + '\n' : ''}${esc(b.terms || '')}${b.email || b.phone ? '\n' + esc([b.email, b.phone].filter(Boolean).join(' · ')) : ''}</div>
</main><div class="actions">${canAccept ? `<button id="accept">Accept quote</button>` : ''}<button class="alt" onclick="print()">Download PDF / Print</button></div>
${canAccept ? `<script>document.getElementById('accept').onclick=async function(){this.disabled=true;const r=await fetch(location.pathname+'/accept',{method:'POST',headers:{'Content-Type':'application/json'},body:'{}'});this.textContent=r.ok?'Accepted. Thank you!':'Please try again';};</script>` : ''}
</body></html>`;
  return new Response(html, { headers: { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store', 'x-robots-tag': 'noindex', 'referrer-policy': 'no-referrer' } });
}

export async function acceptQuote(ctx, token) {
  if (!/^[a-f0-9]{32}$/.test(token || '')) fail(404, 'notFound');
  const d = await db(ctx.env).prepare("SELECT id, number, client FROM docs WHERE token=? AND kind='quote' AND status='sent'").bind(token).first();
  if (!d) fail(404, 'notFound');
  await db(ctx.env).prepare("UPDATE docs SET status='accepted', updated_at=? WHERE id=?").bind(now(), d.id).run();
  const who = safe(d.client, {}).name || 'A client';
  await audit(ctx.env, null, 'sales', 'Client accepted ' + d.number, who);
  ctx.waitUntil?.(notify(ctx.env, 'invoice', 'Quote accepted 🎉', `${who} accepted ${d.number}.`, '/staff/marketing/#sales'));
  return { ok: true };
}
