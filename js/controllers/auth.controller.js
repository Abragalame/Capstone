/* Login / register / logout and loading everything a signed-in user needs. */
function setAuthMode(m) { authMode = m; go(); }

/* Switch Student / Teacher / Staff on the register form without losing what was typed. */
function setRegType(t) {
  regType = t;
  document.querySelectorAll('#regT button').forEach((b, i) => b.classList.toggle('on', ['student', 'teacher', 'staff'][i] == t));
  $('fEmp').hidden = t == 'student';
  $('fRoom').hidden = t != 'student';
  $('fSid').hidden = t != 'student';
  $('regNote').textContent = REG_NOTE[t];
  $('authBtn').textContent = t == 'student' ? 'Create account' : 'Request account';
}

async function applyUser(u) {
  S.user = u.name || u.email; S.uid = u.id; S.email = u.email; S.role = u.role; S.stalls = u.stalls || [];
  const p = u.prefs || {};
  S.req = p.req || ''; S.reqStatus = p.reqStatus || '';
  if (p.grade) S.grade = +p.grade;
  if (p.rn != null) S.rn = cleanRn(p.rn);
  S.sid = p.sid || S.sid || '';
  syncRoom();
  prefSig = JSON.stringify({ grade: S.grade, rn: S.rn, sid: S.sid });
  if (u.role === 'pending') { save(); return; } /* nothing to load until approved */
  try { MENU = await MenuService.list(); } catch (e) { toast('Could not load the menu'); }
  Object.keys(S.cart).forEach((i) => { if (!item(i)) delete S.cart[i]; });
  try { S.orders = await OrdersService.listMine(u.id); } catch (e) { S.orders = []; }
  if (u.role === 'staff' || u.role === 'admin') {
    try { S.allOrders = await OrdersService.listAll(); } catch (e) { S.allOrders = []; }
  }
  if (u.role === 'admin') AdminController.refreshCount();
  save();
}

/* Pending accounts: re-read the account; if the admin approved it, open the right home page. */
async function checkApproval(manual) {
  try {
    const u = await AuthService.current();
    if (!u) return;
    if (u.role !== 'pending') { await applyUser(u); location.hash = homeHash(); go(); return; }
    const was = S.reqStatus; S.reqStatus = (u.prefs || {}).reqStatus || '';
    if (was !== S.reqStatus) go();
    else if (manual === true) toast('Still waiting for the admin');
  } catch (e) { if (manual === true) toast('Could not check. Try again.'); }
}

async function useAsStudent() {
  try {
    await AuthService.savePrefs({ req: '', reqStatus: '' });
    const u = await AuthService.current();
    await applyUser(u); location.hash = homeHash(); go();
  } catch (e) { toast(AuthService.friendly(e)); }
}

async function submitAuth() {
  const reg = authMode === 'register', E = $('authE'), B = $('authBtn');
  E.textContent = '';
  const email = $('em').value.trim(), pw = $('pw').value;
  if (!email || !pw) { E.textContent = 'Please enter your email and password.'; return; }
  let name = '';
  if (reg) {
    name = $('nm').value.trim();
    if (!name) { E.textContent = 'Please type your name.'; return; }
    if (pw.length < 8) { E.textContent = 'Password must be at least 8 characters.'; return; }
  }
  B.disabled = true;
  try {
    if (reg) {
      let prefs;
      if (regType === 'student') {
        prefs = { grade: +$('gr').value, rn: cleanRn($('rm').value), sid: $('sid').value.trim() };
      } else {
        const emp = $('emp').value.trim(); /* optional */
        /* req/reqStatus only SHOW the waiting page. The real role is a label the admin adds. */
        prefs = { req: regType, reqStatus: 'pending' };
        if (emp) prefs.empId = emp;
      }
      await AuthService.register({ name, email, password: pw, prefs });
    } else {
      await AuthService.login(email, pw);
    }
    const u = await AuthService.current();
    if (!u) throw new Error('Could not start your session.');
    await applyUser(u);
    location.hash = homeHash();
  } catch (e) {
    E.textContent = AuthService.friendly(e);
    B.disabled = false;
  }
}

async function logout() {
  try { await AuthService.logout(); } catch (e) { /* already signed out */ }
  S.user = ''; S.uid = ''; S.email = ''; S.role = 'student'; S.req = ''; S.reqStatus = ''; S.pendingN = 0; S.stalls = []; S.cart = {}; S.orders = []; S.allOrders = [];
  MENU = [];
  save();
  location.hash = '#/';
  go();
}
