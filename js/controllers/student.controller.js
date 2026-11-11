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
  try { Object.assign(o, await OrdersService.finishAll(o)); go(); } /* closes every stall's part */
  catch (e) { toast('Could not confirm: ' + (e.message || 'try again')); }
}

const orderSig = (L) => JSON.stringify(L.map((o) => [o.id, o.st, o.acc, o.parts]));
async function refreshMyOrders() {
  try {
    const fresh = await OrdersService.listMine(S.uid);
    if (orderSig(fresh) != orderSig(S.orders)) {
      const before = Object.fromEntries(S.orders.map((o) => [o.id, o.parts]));
      fresh.forEach((o) => Object.entries(o.parts).forEach(([s, v]) => {
        const was = (before[o.id] || {})[s];
        if (v == 2 && was != null && was < 2) {
          toast(stallName(+s) + (o.mode == 'pickup' ? ' is ready – collect at the ' + stallName(+s) + ' counter' : ' is ready'));
          if (navigator.vibrate) navigator.vibrate(200);
        }
      }));
      S.orders = fresh; go();
    }
  } catch (e) { /* offline - try again next tick */ }
}
