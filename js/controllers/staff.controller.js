/* Staff actions: move orders along, and add / edit / delete menu items with photos. */
async function sa(no) {
  const o = S.allOrders.find((x) => x.no == no); if (!o) return;
  const patch = o.st == 0 && !o.acc ? { acc: true } : o.st < 3 ? { st: o.st + 1, acc: true } : null;
  if (!patch) return;
  try { await OrdersService.update(o.id, patch); Object.assign(o, patch); go(); }
  catch (e) { toast('Could not update: ' + (e.message || 'try again')); }
}

async function refreshStaffOrders() {
  try {
    const fresh = await OrdersService.listAll();
    if (orderSig(fresh) != orderSig(S.allOrders)) { S.allOrders = fresh; go(); }
  } catch (e) { /* try again next tick */ }
}

function setStaffTab(t) { staffTab = t; editId = null; go(); }
function setStaffStall(n) { staffStall = n; go(); }
function editMenuItem(id) { editId = id; go(); scrollTo(0, 0); }
function cancelMenuEdit() { editId = null; go(); }
function previewPhoto(inp) {
  const f = inp.files && inp.files[0], p = $('mPv');
  if (f && p) { p.src = URL.createObjectURL(f); p.hidden = false; }
}

async function saveMenuItem() {
  const old = editId ? item(editId) : null;
  const data = {
    name: $('mName').value.trim(), description: $('mDesc').value.trim(), price: Number($('mPrice').value),
    stall: Number($('mStall').value), category: $('mCat').value, emoji: $('mEmoji').value.trim() || '🍽️',
    status: $('mStatus').value, popular: $('mPop').checked, prepMin: Math.max(1, Number($('mTime').value) || 5),
    imageId: old ? old.img : '', legacyPhoto: old ? old.f : '',
  };
  if (!data.name) { toast('Please enter a dish name'); return; }
  if (!(data.price >= 0) || $('mPrice').value === '') { toast('Please enter a price'); return; }
  const btn = $('mSave'); btn.disabled = true;
  try {
    const file = $('mPhoto').files[0];
    if (file) {
      const newId = await StorageService.upload(file);
      if (old && old.img) await StorageService.remove(old.img);
      data.imageId = newId;
    }
    if (old) await MenuService.update(old.id, data); else await MenuService.create(data, S.uid);
    MENU = await MenuService.list();
    toast(old ? 'Dish updated' : 'Dish added');
    editId = null; go();
  } catch (e) {
    toast('Could not save: ' + (e.message || 'try again')); btn.disabled = false;
  }
}

async function delMenuItem(id) {
  const m = item(id); if (!m || !confirm('Delete "' + m._raw.name + '"?')) return;
  try {
    await MenuService.remove(id);
    if (m.img) await StorageService.remove(m.img);
    MENU = await MenuService.list();
    if (editId == id) editId = null;
    toast('Dish deleted'); go();
  } catch (e) { toast('Could not delete: ' + (e.message || 'try again')); }
}
