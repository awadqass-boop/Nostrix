// Nostrix scheduler: a free Cloudflare Worker with a Cron Trigger (every 15 minutes).
// It only knocks on the website's /api/cron door with the secret key; the website decides what is due
// (daily lead search, scheduled Instagram posts) and respects the Pause switches in the Marketing hub.
// Setup: Cloudflare → Workers & Pages → Create → Worker "nostrix-scheduler" → paste this code →
// Settings → Variables and secrets → Secret CRON_SECRET (same value as on the nostrix Pages project) →
// Settings → Trigger events → Cron "*/15 * * * *".
export default {
  async scheduled(event, env, ctx) {
    ctx.waitUntil(fetch('https://nostrix.ae/api/cron', { method: 'POST', headers: { 'x-cron-key': env.CRON_SECRET, 'content-type': 'application/json' }, body: '{}' })
      .then((r) => console.log('cron', r.status)).catch((e) => console.error('cron', e.message)));
  },
  async fetch() { return new Response('Nostrix scheduler is running.', { headers: { 'content-type': 'text/plain' } }); }
};
