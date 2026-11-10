// Nostrix staff data client. Talks to the Nostrix API on Cloudflare (/api) with the signed-in session cookie.
// It mirrors the small part of the old Supabase client the workspace uses, so the workspace code stays the same.
const API = '/api';

async function call(path, options = {}) {
  const res = await fetch(API + path, {
    credentials: 'same-origin',
    ...options,
    headers: { ...(options.body && !(options.body instanceof Blob) && !(options.body instanceof File) ? { 'Content-Type': 'application/json' } : {}), ...(options.headers || {}) }
  });
  let data = null;
  const type = res.headers.get('content-type') || '';
  if (type.includes('application/json')) data = await res.json();
  if (!res.ok) {
    const error = { status: res.status, code: data?.error || 'error', message: data?.message || 'Something went wrong. Try again.' };
    if (res.status === 401) window.dispatchEvent(new CustomEvent('nostrix:signed-out'));
    return { data: null, error };
  }
  return { data, error: null };
}

class Query {
  constructor(table) { this.q = { table, action: 'select', filters: [], order: [] }; this.mode = 'many'; }
  select() { if (this.q.action === 'select') return this; this.q.returning = true; return this; }
  insert(values) { this.q.action = 'insert'; this.q.values = values; return this; }
  update(values) { this.q.action = 'update'; this.q.values = values; return this; }
  delete() { this.q.action = 'delete'; return this; }
  eq(col, val) { this.q.filters.push([col, 'eq', val]); return this; }
  neq(col, val) { this.q.filters.push([col, 'neq', val]); return this; }
  is(col, val) { this.q.filters.push([col, 'is', val]); return this; }
  in(col, val) { this.q.filters.push([col, 'in', val]); return this; }
  order(col, opts = {}) { this.q.order.push([col, opts.ascending !== false]); return this; }
  limit(n) { this.q.limit = n; return this; }
  single() { this.mode = 'single'; this.q.returning = true; return this; }
  maybeSingle() { this.mode = 'maybe'; this.q.returning = true; return this; }
  async run() {
    const { data, error } = await call('/team/query', { method: 'POST', body: JSON.stringify(this.q) });
    if (error) return { data: null, error };
    const rows = data.data;
    if (this.mode === 'many') return { data: rows, error: null };
    const list = Array.isArray(rows) ? rows : [];
    if (this.mode === 'single' && list.length !== 1) return { data: null, error: { message: 'Expected one row' } };
    return { data: list[0] || null, error: null };
  }
  then(resolve, reject) { return this.run().then(resolve, reject); }
}

function channel() {
  const handlers = [];
  let timer = null, rev = null, lastNote = null;
  const api = {
    on(_type, filter, fn) { handlers.push({ table: filter.table, event: filter.event, fn }); return api; },
    subscribe() {
      const tick = async () => {
        if (document.hidden) return;
        const { data } = await call('/team/rev');
        if (!data) return;
        if (rev !== null && data.rev !== rev)
          for (const h of handlers) if (h.table !== 'notifications') await h.fn({});
        const note = data.notification;
        if (lastNote !== null && note && note.id !== lastNote)
          for (const h of handlers) if (h.table === 'notifications') await h.fn({ new: note, eventType: 'INSERT' });
        rev = data.rev;
        lastNote = note ? note.id : '';
      };
      tick();
      timer = setInterval(tick, 12000);
      document.addEventListener('visibilitychange', () => { if (!document.hidden) tick(); });
      return api;
    },
    stop() { clearInterval(timer); }
  };
  return api;
}

export function createClient() {
  const listeners = [];
  const emit = (event, session) => listeners.forEach((fn) => fn(event, session));
  const sessionOf = (user) => (user ? { user: { id: user.id, email: user.email } } : null);
  return {
    from: (table) => new Query(table),
    rpc: async (name) => (name === 'materialize_recurring_tasks' ? call('/team/recurring', { method: 'POST', body: '{}' }) : { data: null, error: { message: 'Unknown function' } }),
    channel,
    removeChannel: async (ch) => { ch?.stop?.(); },
    auth: {
      me: () => call('/auth/me'),
      async getSession() {
        const { data } = await call('/auth/me');
        return { data: { session: sessionOf(data?.user), needsSetup: !!data?.needsSetup, user: data?.user || null } };
      },
      async signInWithPassword({ email, password }) {
        const r = await call('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) });
        if (!r.error) emit('SIGNED_IN', sessionOf(r.data.user));
        return r;
      },
      async setupOwner(input) {
        const r = await call('/auth/setup', { method: 'POST', body: JSON.stringify(input) });
        if (!r.error) emit('SIGNED_IN', sessionOf(r.data.user));
        return r;
      },
      changePassword: (current, next) => call('/auth/password', { method: 'POST', body: JSON.stringify({ current, next }) }),
      async signOut() { await call('/auth/logout', { method: 'POST', body: '{}' }); emit('SIGNED_OUT', null); return { error: null }; },
      onAuthStateChange(fn) { listeners.push(fn); return { data: { subscription: { unsubscribe() {} } } }; }
    },
    storage: {
      from: () => ({
        async upload(path, file) {
          return call('/team/storage?path=' + encodeURIComponent(path), { method: 'PUT', body: file, headers: { 'Content-Type': file.type || 'application/octet-stream' } });
        },
        async createSignedUrl(path) { return { data: { signedUrl: API + '/team/storage?path=' + encodeURIComponent(path) }, error: null }; },
        async remove(paths) { return call('/team/storage/delete', { method: 'POST', body: JSON.stringify({ paths }) }); }
      })
    },
    admin: {
      users: () => call('/admin/users'),
      createUser: (input) => call('/admin/users', { method: 'POST', body: JSON.stringify(input) }),
      updateUser: (id, input) => call('/admin/users/' + encodeURIComponent(id), { method: 'PATCH', body: JSON.stringify(input) }),
      deleteUser: (id) => call('/admin/users/' + encodeURIComponent(id), { method: 'DELETE' }),
      signIns: () => call('/admin/signins')
    }
  };
}
