// Marketing hub background worker: phone alerts only (no offline cache).
const base = new URL("./", self.location.href);
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", event => event.waitUntil(self.clients.claim()));
self.addEventListener("push", event => {
  let data = {};
  try { data = event.data ? event.data.json() : {}; } catch { data = { title: "Nostrix", body: event.data ? event.data.text() : "" }; }
  event.waitUntil(self.registration.showNotification(data.title || "Nostrix", {
    body: data.body || "", tag: data.tag || "nostrix", renotify: true,
    icon: new URL("../website/icons/icon-192.png", base).href, badge: new URL("../website/icons/icon-192.png", base).href, data: { url: data.url || base.href }
  }));
});
self.addEventListener("notificationclick", event => {
  event.notification.close();
  const url = new URL(event.notification.data?.url || base.href, self.location.origin).href;
  event.waitUntil(self.clients.matchAll({ type: "window", includeUncontrolled: true }).then(list => {
    for (const c of list) if (c.url.startsWith(self.location.origin + "/staff/")) { c.focus(); return c.navigate(url); }
    return self.clients.openWindow(url);
  }));
});
