/* Admin page: promote students to staff, import the original sample menu. */
const AdminController = {
  rowHtml(u) {
    const role = AuthService.roleFromLabels(u.labels);
    const pill = `<span class="rolebadge rb-${role}">${ROLE_LABEL[role]}</span>`;
    const btn = role === 'admin' ? '' :
      `<button class="btn sm ${role === 'staff' ? 'ol' : ''}" onclick="AdminController.setRole('${u.id}','${role === 'staff' ? 'student' : 'staff'}')">${role === 'staff' ? 'Make student' : 'Make staff'}</button>`;
    const cur = (u.labels || []).map((l) => /^stall([1-7])$/i.exec(String(l))).filter(Boolean).map((m) => +m[1])[0] || 0;
    const stallSel = role === 'staff'
      ? `<select class="in sm" aria-label="Stall for ${esc(u.name || u.email)}" onchange="AdminController.setStall('${u.id}',this.value)"><option value="0" ${cur ? '' : 'selected'}>All stalls</option>${STALLS.map((s) => `<option value="${s.id}" ${cur == s.id ? 'selected' : ''}>${esc(s.name)}</option>`).join('')}</select>` : '';
    return `<div class="c urow"><div><b>${esc(u.name || '(no name)')}</b><small class="rmark">${esc(u.email)}</small></div><div class="ctl">${stallSel}${pill}${btn}</div></div>`;
  },
  async load() {
    const host = $('adm'); if (!host) return;
    try {
      const users = await AdminService.listUsers();
      host.innerHTML = users.map((u) => this.rowHtml(u)).join('') || '<div class="c">No users yet.</div>';
    } catch (e) {
      host.innerHTML = `<div class="c">${esc(e.message)}<br><small class="rmark">Check that the manage-users function is deployed (see README).</small></div>`;
    }
  },
  async setRole(id, role) {
    try { await AdminService.setRole(id, role); toast('Role updated'); this.load(); }
    catch (e) { toast(e.message || 'Could not update role'); }
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
