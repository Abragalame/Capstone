/* Login / register / logout and loading everything a signed-in user needs. */
function setAuthMode(m) { authMode = m; go(); }

async function applyUser(u) {
  S.user = u.name || u.email; S.uid = u.id; S.email = u.email; S.role = u.role;
  const p = u.prefs || {};
  if (p.grade) S.grade = +p.grade;
  if (p.rn != null) S.rn = cleanRn(p.rn);
  S.sid = p.sid || S.sid || '';
  syncRoom();
  prefSig = JSON.stringify({ grade: S.grade, rn: S.rn, sid: S.sid });
  try { MENU = await MenuService.list(); } catch (e) { toast('Could not load the menu'); }
  Object.keys(S.cart).forEach((i) => { if (!item(i)) delete S.cart[i]; });
  try { S.orders = await OrdersService.listMine(u.id); } catch (e) { S.orders = []; }
  if (u.role !== 'student') {
    try { S.allOrders = await OrdersService.listAll(); } catch (e) { S.allOrders = []; }
  }
  save();
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
      await AuthService.register({ name, email, password: pw, prefs: { grade: +$('gr').value, rn: cleanRn($('rm').value), sid: $('sid').value.trim() } });
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
  S.user = ''; S.uid = ''; S.email = ''; S.role = 'student'; S.cart = {}; S.orders = []; S.allOrders = [];
  MENU = [];
  save();
  location.hash = '#/';
  go();
}
