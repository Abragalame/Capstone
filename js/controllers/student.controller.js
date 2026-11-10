/* Student actions that talk to Appwrite (placing, confirming and refreshing orders).
   setMode / add / chg are the original demo functions, kept in js/controllers/student.original.js */
let placing = false;

async function place() {
  if (mode == 'delivery' && !S.rn) {
    const r = $('coR'); if (r) { r.classList.add('inerr'); r.focus(); }
    toast('Please type your room number'); return;
  }
  if (placing) return;
  placing = true;
  const order = {
    no: OrdersService.newNumber(), name: S.user, grade: S.grade, mode: mode,
    room: mode == 'delivery' ? S.room : '',
    items: Object.entries(S.cart).map(([i, n]) => { const m = item(i); return { id: m.id, n: m.n, p: m.p, q: n, stall: m.stall }; }),
    total: cartT(), time: pick, notes: note,
  };
  try {
    S.orders.push(await OrdersService.create(order, S.uid));
    S.cart = {}; note = ''; save();
    location.hash = '#/done';
  } catch (e) {
    toast('Could not place order: ' + (e.message || 'try again'));
  } finally { placing = false; }
}

async function done() {
  const o = cur();
  try { await OrdersService.update(o.id, { st: 3 }); o.st = 3; go(); }
  catch (e) { toast('Could not confirm: ' + (e.message || 'try again')); }
}

const orderSig = (L) => JSON.stringify(L.map((o) => [o.id, o.st, o.acc]));
async function refreshMyOrders() {
  try {
    const fresh = await OrdersService.listMine(S.uid);
    if (orderSig(fresh) != orderSig(S.orders)) { S.orders = fresh; go(); }
  } catch (e) { /* offline - try again next tick */ }
}
