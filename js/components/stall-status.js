/* Per-stall order tracking. An order has one status PER STALL (order.parts = {stallId: 0..3}):
   0 received · 1 preparing · 2 ready · 3 collected/delivered. order.st (overall) is derived from the parts. */
const PART_LBL = (pk) => pk ? ['Order received', 'Preparing', 'Ready – collect now', 'Collected'] : ['Order received', 'Preparing', 'Ready for delivery', 'Delivered'];
const partIds = (o) => Object.keys(o.parts).map(Number).sort((a, b) => a - b);
const partItems = (o, i) => o.items.filter((x) => !x.stall || x.stall == i);
const stallsText = (o) => partIds(o).map((i) => stallName(i)).join(' + ');
const readyStalls = (o) => partIds(o).filter((i) => o.parts[i] == 2).map((i) => stallName(i));
/* Pickup: the QR unlocks as soon as ANY stall is ready. Delivery: only when every stall is ready. */
const ready = (o) => (o.mode == 'pickup' ? Object.values(o.parts).some((v) => v >= 2) : o.st >= 2);
const partPill = (pk, v) => `<span class="pl ${v >= 3 ? 's' : v == 2 ? '' : 'b'}">${PART_LBL(pk)[v]}</span>`;
const nameList = (ids) => ids.map((i) => '<b>' + esc(stallName(i)) + '</b>').join(' &amp; ');

/* Student: "which counter do I go to?" */
const partsPanel = (o) => {
  const pk = o.mode == 'pickup', ids = partIds(o), multi = ids.length > 1;
  const rdy = ids.filter((i) => o.parts[i] == 2), wait = ids.filter((i) => o.parts[i] < 2);
  let hint = '';
  if (pk && o.st < 3) {
    if (multi && rdy.length && wait.length) hint = `✅ Ready now: ${nameList(rdy)}.<br>⏳ Still preparing: ${nameList(wait)}.<br>Collect the ready food now, or wait and collect everything in one trip. Show the same QR code at each stall.`;
    else if (rdy.length) hint = `✅ Go to the ${nameList(rdy)} counter${rdy.length > 1 ? 's' : ''} and show your QR code.`;
  } else if (!pk && multi && o.st < 2) hint = 'A runner brings everything to your classroom once every stall is ready.';
  return `<div class="c"><h3>${multi ? 'Your food comes from ' + ids.length + ' stalls' : 'Your stall'}</h3>${ids.map((i) =>
    `<div class="rw stp"><div><b>${esc(stallName(i))}</b><br><small class="rmark">${partItems(o, i).map((x) => x.q + '× ' + x.n).join(', ')}</small></div>${partPill(pk, o.parts[i])}</div>`).join('')}${hint ? `<p class="stall-hint">${hint}</p>` : ''}</div>`;
};
