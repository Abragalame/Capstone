/* Admin page: approve Teacher/Staff requests, change roles, assign stalls, import the sample menu. */
const ROLE_OPTS = [['student', 'Student'], ['teacher', 'Teacher'], ['staff', 'Staff'], ['admin', 'Admin (full access)']];
const stallOf = (labels) => (labels || []).map((l) => /^stall([1-7])$/i.exec(String(l))).filter(Boolean).map((m) => +m[1])[0] || 0;
const stallSelect = (id, cur, extra) =>
  `<select class="in sm" ${extra || ''} aria-label="Stall"><option value="0" ${cur ? '' : 'selected'}>All stalls</option>${STALLS.map((s) => `<option value="${s.id}" ${cur == s.id ? 'selected' : ''}>${esc(s.name)}</option>`).join('')}</select>`;

const AdminController = {
  users: [],
  isPending: (u) => AuthService.roleFromLabels(u.labels, u.prefs) === 'pending' && (u.prefs || {}).reqStatus === 'pending',

  /* one card per request: choose the role (and stall for staff), then Approve or Decline */
  requestHtml(u) {
    const p = u.prefs || {}, asked = p.req === 'teacher' ? 'Teacher' : 'Staff', id = esc(u.id);
    return `<div class="c reqc" id="rq-${id}"><div><b>${esc(u.name || '(no name)')}</b><small class="rmark">${esc(u.email)}</small>
<small class="rmark">Asked to be: <b>${asked}</b>${p.empId ? ' · Employee ID ' + esc(p.empId) : ''}</small></div>
<div class="ctl"><label class="l" style="margin:0">Give role</label>
<select class="in sm" id="rr-${id}" aria-label="Role for ${esc(u.name || u.email)}" onchange="AdminController.reqRoleChanged('${id}')">${ROLE_OPTS.slice(1).map(([k, l]) => `<option value="${k}" ${k === p.req ? 'selected' : ''}>${l}</option>`).join('')}</select>
<span id="rs-${id}" ${p.req === 'staff' ? '' : 'hidden'}>${stallSelect(u.id, 0, `id="rt-${id}"`)}</span></div>
<div class="ctl"><button class="btn sm" onclick="AdminController.approve('${id}')">Approve</button><button class="btn sm ol" onclick="AdminController.decline('${id}')">Decline</button></div></div>`;
  },
  reqRoleChanged(id) {
    $('rs-' + id).hidden = $('rr-' + id).value !== 'staff';
  },

  rowHtml(u) {
    const role = AuthService.roleFromLabels(u.labels, u.prefs), id = esc(u.id);
    const name = esc(u.name || u.email);
    if (role === 'admin') return `<div class="c urow"><div><b>${esc(u.name || '(no name)')}</b><small class="rmark">${esc(u.email)}</small></div><div class="ctl"><span class="rolebadge rb-admin">Admin</span></div></div>`;
    const pend = role === 'pending'
      ? `<span class="rolebadge rb-pending">${u.prefs.reqStatus === 'declined' ? 'Declined' : 'Pending'}</span>` : '';
    const sel = `<select class="in sm" aria-label="Role for ${name}" onchange="AdminController.setRole('${id}',this.value)">${ROLE_OPTS.map(([k, l]) => `<option value="${k}" ${k === (role === 'pending' ? 'student' : role) ? 'selected' : ''}>${l}</option>`).join('')}</select>`;
    const st = role === 'staff' ? stallSelect(u.id, stallOf(u.labels), `onchange="AdminController.setStall('${id}',this.value)"`) : '';
    return `<div class="c urow"><div><b>${esc(u.name || '(no name)')}</b><small class="rmark">${esc(u.email)}</small></div><div class="ctl">${st}${pend || (role === 'student' ? '' : `<span class="rolebadge rb-${role}">${ROLE_LABEL[role]}</span>`)}${sel}</div></div>`;
  },

  paint() {
    const req = $('req'), host = $('adm'); if (!host) return;
    const pend = this.users.filter((u) => this.isPending(u));
    S.pendingN = pend.length; this.badge();
    if (req) req.innerHTML = `<h3 style="margin:18px 0 8px">Waiting for approval (${pend.length})</h3>` +
      (pend.map((u) => this.requestHtml(u)).join('') || '<div class="c"><small class="rmark">No requests right now.</small></div>');
    host.innerHTML = this.users.map((u) => this.rowHtml(u)).join('') || '<div class="c">No users yet.</div>';
  },
  badge() {
    const b = $('pendN'); if (b) { b.textContent = S.pendingN || ''; b.hidden = !S.pendingN; }
  },
  async load() {
    const host = $('adm'); if (!host) return;
    try {
      this.users = await AdminService.listUsers();
      this.paint();
    } catch (e) {
      host.innerHTML = `<div class="c">${esc(e.message)}<br><small class="rmark">Check that the manage-users function is deployed and up to date (see README).</small></div>`;
    }
  },
  /* admin signs in somewhere other than the Users page: still show the "n waiting" badge */
  async refreshCount() {
    try {
      this.users = await AdminService.listUsers();
      S.pendingN = this.users.filter((u) => this.isPending(u)).length; this.badge();
      if (S.pendingN) toast(S.pendingN + ' account request' + (S.pendingN > 1 ? 's' : '') + ' waiting for approval');
    } catch (e) { /* function not deployed yet */ }
  },

  async approve(id) {
    const role = $('rr-' + id).value, stall = role === 'staff' ? $('rt-' + id).value : 0;
    if (role === 'admin' && !confirm('Give this person FULL admin access (users, menu, orders)?')) return;
    try { await AdminService.approve(id, role, stall); toast('Approved as ' + ROLE_LABEL[role]); this.load(); }
    catch (e) { toast(e.message || 'Could not approve'); }
  },
  async decline(id) {
    if (!confirm('Decline this request?')) return;
    try { await AdminService.decline(id); toast('Request declined'); this.load(); }
    catch (e) { toast(e.message || 'Could not decline'); }
  },
  async setRole(id, role) {
    if (role === 'admin' && !confirm('Give this person FULL admin access? Admins can only be removed in the Appwrite Console.')) { this.load(); return; }
    try { await AdminService.setRole(id, role); toast('Role updated'); this.load(); }
    catch (e) { toast(e.message || 'Could not update role'); this.load(); }
  },
  async setStall(id, stall) {
    try { await AdminService.setStall(id, stall); toast(stall > 0 ? 'Assigned to ' + stallName(stall) : 'Can see all stalls'); }
    catch (e) { toast(e.message || 'Could not assign stall'); this.load(); }
  },
  async seedMenu() {
    if (!confirm('Import the 18 sample dishes? Dishes that already exist are skipped.')) return;
    let added = 0;
    for (const m of SAMPLE_MENU) {
      try { await MenuService.create(m, S.uid, String(m.id)); added++; } catch (e) { /* exists */ }
    }
    try { MENU = await MenuService.list(); } catch (e) { /* ignore */ }
    toast(added + ' dishes imported');
  },
};
