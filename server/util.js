// Shared helpers for the Nostrix API (Cloudflare Pages Functions).

export class HttpError extends Error {
  constructor(status, code, message) {
    super(message || code);
    this.status = status;
    this.code = code;
  }
}

export const fail = (status, code, message) => { throw new HttpError(status, code, message); };

export function json(data, status = 200, headers = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store', ...headers }
  });
}

export async function body(request, limit = 64 * 1024) {
  const type = request.headers.get('content-type') || '';
  if (!type.includes('application/json') && !type.includes('text/plain')) fail(415, 'badType');
  const text = await request.text();
  if (text.length > limit) fail(413, 'tooLarge');
  try { return text ? JSON.parse(text) : {}; } catch { fail(400, 'badJson'); }
}

export const now = () => new Date().toISOString();
// Calendar day in the UAE (UTC+4, no daylight saving), used for daily stats.
export const dubaiDay = (iso = now()) => new Date(Date.parse(iso) + 4 * 3600e3).toISOString().slice(0, 10);
export const today = () => dubaiDay();
export const uuid = () => crypto.randomUUID();

const enc = new TextEncoder();
export const hex = (buf) => [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');
export const b64 = (buf) => btoa(String.fromCharCode(...new Uint8Array(buf)));
export const unb64 = (s) => Uint8Array.from(atob(s), (c) => c.charCodeAt(0));
export async function sha256(text) { return hex(await crypto.subtle.digest('SHA-256', enc.encode(text))); }
export const randomHex = (bytes = 32) => hex(crypto.getRandomValues(new Uint8Array(bytes)));

export function safeEqual(a, b) {
  a = String(a); b = String(b);
  let diff = a.length ^ b.length;
  for (let i = 0; i < Math.max(a.length, b.length); i++) diff |= (a.charCodeAt(i) || 0) ^ (b.charCodeAt(i) || 0);
  return diff === 0;
}

// Trimmed string with a maximum length; empty becomes null.
export function str(value, max = 500) {
  if (value === undefined || value === null) return null;
  const s = String(value).replace(/\u0000/g, '').trim();
  return s ? s.slice(0, max) : null;
}
export const bool = (v) => (v === true || v === 1 || v === '1' || v === 'true' ? 1 : 0);
export const email = (v) => {
  const s = str(v, 200);
  return s && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s) ? s.toLowerCase() : null;
};

export function device(ua = '') {
  if (/iPad|Tablet|PlayBook|Silk|Android(?!.*Mobile)/i.test(ua)) return 'tablet';
  if (/Mobi|iPhone|iPod|Android|Windows Phone/i.test(ua)) return 'mobile';
  return 'desktop';
}
export const isBot = (ua = '') => !ua || /bot|crawl|spider|slurp|preview|headless|lighthouse|monitor|curl|wget|python|httpclient/i.test(ua);

export function geo(request) {
  const cf = request.cf || {};
  const round = (v) => (v === undefined || v === null || v === '' || isNaN(+v) ? null : Math.round(+v * 100) / 100);
  return { country: cf.country || null, city: cf.city || null, lat: round(cf.latitude), lon: round(cf.longitude) };
}

// The request must come from this site (blocks cross-site form posts).
export function sameOrigin(request) {
  const origin = request.headers.get('origin');
  if (!origin) return true;
  try {
    const o = new URL(origin), u = new URL(request.url);
    return o.host === u.host;
  } catch { return false; }
}
