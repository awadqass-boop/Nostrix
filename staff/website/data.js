/* Nostrix Website section — data adapter. Every function talks to the Nostrix API on Cloudflare (/api)
   using the signed-in staff session cookie. No names, emails or other records are stored in this file. */
window.NostrixWebsite = (() => {
  "use strict";
  const API = "/api";
  const both = v => [v ?? "", v ?? ""];
  const color = s => { let h = 0; for (const c of String(s || "")) h = (h * 31 + c.charCodeAt(0)) >>> 0; return h % 5; };
  let me = null, meAt = 0;

  async function call(path, options = {}) {
    const isBinary = options.body instanceof Blob;
    const res = await fetch(API + path, {
      credentials: "same-origin", ...options,
      headers: { ...(options.body && !isBinary ? { "Content-Type": "application/json" } : {}), ...(options.headers || {}) }
    });
    const data = (res.headers.get("content-type") || "").includes("application/json") ? await res.json() : null;
    if (!res.ok) {
      if (res.status === 401) { me = null; meAt = 0; }
      const e = new Error(res.status === 401 ? "signedOut" : data?.error || "unavailable");
      e.detail = data?.message || "";
      throw e;
    }
    return data;
  }
  const post = (path, body, method = "POST") => call(path, { method, body: JSON.stringify(body || {}) });

  async function session(force) {
    if (!force && me !== null && Date.now() - meAt < 8000) return me;
    const r = await call("/auth/me");
    me = r.user ? { ...r.user, name: both(r.user.display_name || r.user.email.split("@")[0]), color: color(r.user.email) } : false;
    meAt = Date.now();
    return me;
  }

  function poll(load, listener, onError, every) {
    let stopped = false, timer;
    const tick = async () => {
      if (stopped) return;
      if (!document.hidden) { try { listener(await load()); } catch (e) { onError?.(e); if (e.message === "signedOut" || e.message === "noAccess") return; } }
      timer = setTimeout(tick, every);
    };
    tick();
    return () => { stopped = true; clearTimeout(timer); };
  }

  // Image helpers: resize in the browser and convert to WebP before upload.
  async function toWebp(file, longEdge, quality) {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, longEdge / Math.max(bitmap.width, bitmap.height));
    const w = Math.max(1, Math.round(bitmap.width * scale)), h = Math.max(1, Math.round(bitmap.height * scale));
    const canvas = document.createElement("canvas");
    canvas.width = w; canvas.height = h;
    canvas.getContext("2d").drawImage(bitmap, 0, 0, w, h);
    bitmap.close?.();
    const blob = await new Promise(r => canvas.toBlob(r, "image/webp", quality));
    if (!blob || blob.type !== "image/webp") throw new Error("badPhoto");
    return { blob, w, h };
  }

  return {
    async initializePreview() {},
    async getWorkspaceLinks() { return { website: "/", staff: "/staff/" }; },
    async getSession() { return (await session()) || null; },
    async getDemoAccount() { return { email: "" }; },
    async signIn(identity, password) {
      await post("/auth/login", { email: identity, password });
      await session(true);
    },
    async signOut() { try { await post("/auth/logout"); } finally { me = false; meAt = Date.now(); } },
    async canAccessWebsiteArea() { const s = await session(); return !!(s && (s.website_access || s.is_admin)); },
    async isAdmin() { const s = await session(); return !!(s && s.is_admin); },

    getVisitorStats(range = {}) {
      const q = new URLSearchParams(); if (range.from) q.set("from", range.from); if (range.to) q.set("to", range.to);
      return call("/site/stats" + (q.toString() ? "?" + q : ""));
    },
    async getVisitorMap() {
      const r = await call("/site/map?days=7");
      return { days: r.days, live: r.live, sites: r.sites.map(s => ({ ...s, key: s.country + "|" + s.city, code: s.country || "", city: both(s.city || s.country || "") })) };
    },
    subscribeVisitorMap(listener, onError) { return poll(() => this.getVisitorMap(), listener, onError, 15000); },

    async getPricingClicks() {
      const r = await call("/site/clicks?days=30");
      return { ...r, packages: r.packages.map(p => ({ name: both(p.name || "—"), count: p.count })) };
    },

    async getEnquiries() {
      return (await call("/site/enquiries")).map(r => {
        const order = r.source === "package-order";
        const message = [r.needs, r.services && "Services: " + r.services, r.event_types && "Events: " + r.event_types,
          r.budget && "Budget: " + r.budget, r.timeline && (order ? "Preferred date: " : "Timeline: ") + r.timeline, r.company && "Company: " + r.company].filter(Boolean).join(" · ");
        const pkg = order ? ["Order: " + (r.package || "") + (r.price ? " (" + r.price + ")" : ""), "طلب: " + (r.package || "") + (r.price ? " (" + r.price + ")" : "")] : both(r.package || r.source || "—");
        return { id: r.id, name: both(r.name || "—"), contact: [r.phone, r.email].filter(Boolean).join(" · "), package: pkg,
          message: both(message || "—"), date: r.created_at, handled: r.handled, color: color(r.email || r.phone || r.name) };
      });
    },
    setEnquiryHandled(id, handled) { return post("/site/enquiries/" + encodeURIComponent(id), { handled }, "PATCH"); },

    async getReviews() {
      return (await call("/site/reviews")).map(r => ({
        id: r.id, name: both(r.display_name || "Anonymous client"), stars: Math.max(0, Math.min(5, r.rating || 0)), text: both(r.testimonial),
        date: r.created_at, color: color(r.display_name), email: r.email || "", service: r.service || "", liked: r.liked || "", improve: r.improve || "",
        instagram: r.instagram || "", source: r.source || ""
      }));
    },
    removeReview(id) { return call("/site/reviews/" + encodeURIComponent(id), { method: "DELETE" }); },

    async getAccounts() { return call("/admin/users"); },
    createAccount(input) { return post("/admin/users", input); },
    updateAccount(id, input) { return post("/admin/users/" + encodeURIComponent(id), input, "PATCH"); },
    deleteAccount(id) { return call("/admin/users/" + encodeURIComponent(id), { method: "DELETE" }); },
    async getSignIns() { return call("/admin/signins"); },
    async getActivityLog() { return call("/site/log?limit=500"); },

    async getNotes() {
      const s = await session();
      return (await call("/site/notes")).map(n => ({ id: n.id, name: both(n.display_name || (n.email || "").split("@")[0] || "Staff"), color: color(n.email),
        text: both(n.text), at: n.created_at, pinned: n.pinned, mine: !!s && n.user_id === s.id, canDelete: !!s && (n.user_id === s.id || s.is_admin) }));
    },
    async addNote(text) {
      const value = String(text || "").trim();
      if (!value || value.length > 2000) throw new Error("invalidNote");
      return post("/site/notes", { text: value });
    },
    deleteNote(id) { return call("/site/notes/" + encodeURIComponent(id), { method: "DELETE" }); },
    pinNote(id, pinned) { return post("/site/notes/" + encodeURIComponent(id), { pinned }, "PATCH"); },
    subscribeNotes(listener, onError) { return poll(() => this.getNotes(), listener, onError, 6000); },

    async getPortfolio() {
      const r = await call("/site/portfolio");
      return {
        categories: r.categories.map(c => ({ id: c.id, name: [c.en, c.ar] })),
        photos: r.items.map(p => ({ id: p.id, src: p.thumb, full: p.src, category: p.category, caption: both(p.label || ""), published: p.published, featured: p.featured, video: p.video || "" }))
      };
    },
    async uploadPhotos(files, category, captions = []) {
      const ids = [];
      for (let i = 0; i < files.length; i++) {
        const cat = Array.isArray(category) ? category[i] : category;
        const full = await toWebp(files[i], 2400, 0.86), thumb = await toWebp(files[i], 960, 0.8);
        const { id } = await post("/site/portfolio", { category: cat, label: captions[i] || "", w: full.w, h: full.h, tw: thumb.w, th: thumb.h });
        await call(`/site/portfolio/${encodeURIComponent(id)}/full`, { method: "PUT", body: full.blob, headers: { "Content-Type": "image/webp" } });
        await call(`/site/portfolio/${encodeURIComponent(id)}/thumb`, { method: "PUT", body: thumb.blob, headers: { "Content-Type": "image/webp" } });
        ids.push(id);
      }
      return ids;
    },
    updatePhoto(id, changes) {
      const body = {};
      if ("caption" in changes) body.label = changes.caption;
      for (const k of ["category", "published", "featured"]) if (k in changes) body[k] = changes[k];
      return post("/site/portfolio/" + encodeURIComponent(id), body, "PATCH");
    },
    deletePhoto(id) { return call("/site/portfolio/" + encodeURIComponent(id), { method: "DELETE" }); },
    reorderPhotos(category, ids) { return post("/site/portfolio-order", { category, ids }); },
    async getPublishStatus() { return { status: "live", progress: 100 }; },
    async retryPublish() { return { status: "live", progress: 100 }; }
  };
})();
