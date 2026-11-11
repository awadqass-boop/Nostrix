// Cache only the known static app shell. Never cache staff pages or API responses.
const base = new URL("./", self.location.href);
const prefix = "nostrix-website-shell:" + base.pathname + ":";
const version = prefix + "8";
const shell = ["index.html", "styles.css", "theme.css", "app.js", "data.js", "maps/flatmap.js", "manifest.webmanifest",
  "icons/icon-192.png", "icons/icon-512.png", "icons/apple-touch-icon.png"];
const urls = shell.map(path => new URL(path, base).href);
self.addEventListener("install", event => {
  event.waitUntil(caches.open(version).then(cache => cache.addAll(urls)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(
    keys.filter(key => key.startsWith(prefix) && key !== version).map(key => caches.delete(key))
  )).then(() => self.clients.claim()));
});
self.addEventListener("fetch", event => {
  if (event.request.method !== "GET") return;
  const url = new URL(event.request.url);
  const path = url.href.split("?")[0];
  const resource = path === base.href ? urls[0] : path;
  if (!urls.includes(resource)) return;
  event.respondWith((async () => {
    try {
      const response = await fetch(event.request);
      if (response.ok && !response.redirected) {
        const cache = await caches.open(version);
        await cache.put(resource, response.clone());
      }
      return response;
    } catch {
      return await (await caches.open(version)).match(resource) || Response.error();
    }
  })());
});
