/* Staff dashboard: Orders tab (original demo markup, now live) + Manage menu tab (new). */
let stfPage = 'staff';
const stfAside = () => {
  const n = (k) => S.allOrders.filter((o) => o.st == k).length;
  return `<aside><div style="display:flex;gap:10px;align-items:center"><img class="lgl" style="width:44px;height:44px" src="logo.png" alt=""><b>Canteen ${S.role == 'admin' ? 'Admin' : 'Staff'}</b></div>
<a href="#/staff" class="snav ${staffTab == 'orders' && stfPage == 'staff' ? 'on' : ''}" onclick="setStaffTab('orders')">🧾 Orders</a>
<a href="#/staff" class="snav ${staffTab == 'menu' && stfPage == 'staff' ? 'on' : ''}" onclick="setStaffTab('menu')">🍽️ Manage menu</a>
${S.role == 'admin' ? `<a href="#/admin" class="snav ${stfPage == 'admin' ? 'on' : ''}">👥 Users</a>` : ''}
<span>🆕 Received: ${n(0)}</span><span>👩‍🍳 Preparing: ${n(1)}</span><span>🛵 On the way / ready: ${n(2)}</span><span>✅ Completed: ${n(3)}</span>${themeBtn()}<a href="#/home">← Student view</a></aside>`;
};
const stfTop = () => `<div class="topline">${roleBadge()}<button class="btn ol sm" onclick="logout()">Log out</button></div>`;

const staffOrdersHtml=()=>{const L=S.allOrders.slice().reverse();return `<h1 class="t">Incoming orders</h1><p>Orders from students appear here automatically.</p>${L.length?`<div class="gx">${L.map(o=>{const pk=o.mode=="pickup";return `<div class="c"><div class="rw"><b style="font-size:1.25rem;color:var(--hd)">${o.no}</b><span class="pl b">${stat(o)[o.st]}</span></div><div><b>${esc(o.name)}</b> · Grade ${o.grade}<br>${pk?"🏃 <b>Pickup at canteen</b>":"📍 <b>"+esc(o.room)+"</b>"}<br><small class="rmark">${pk?"Pickup":"Delivery"} ${o.time}</small></div>${o.items.map(x=>`<div class="rw" style="padding:2px 0"><span>${x.q}× ${x.n}</span></div>`).join("")}${o.notes?`<small>📝 ${esc(o.notes)}</small>`:""}${o.st==0&&!o.acc?`<button class="btn" onclick="sa('${o.no}')">Accept Order</button>`:o.st==0?`<button class="btn" onclick="sa('${o.no}')">Mark as Preparing</button>`:o.st==1?`<button class="btn g" onclick="sa('${o.no}')">${pk?"Mark as Ready for Pickup":"Mark as Out for Delivery"}</button>`:o.st==2?`<button class="btn g" onclick="sa('${o.no}')">${pk?"Mark as Picked up":"Mark as Delivered"}</button>`:`<button class="btn" disabled>Completed</button>`}</div>`}).join("")}</div>`:`<div class="c">No orders yet. Place a pre-order in the student app and it will show up here.</div>`}`};

function staffMenuHtml() {
  const e = editId ? item(editId) : null, r = e ? e._raw : {};
  const sel = (v, cur) => (v == cur ? 'selected' : '');
  const list = MENU.filter((m) => !staffStall || m.stall == staffStall);
  const chips = [0, ...STALLS.map((s) => s.id)].map((id) => `<button class="ch ${id == staffStall ? 'on' : ''}" onclick="setStaffStall(${id})">${id ? esc(stallName(id)) : 'All stalls'}</button>`).join('');
  return `<h1 class="t">Manage menu</h1><p>Add, edit or remove dishes. Pick which stall (1–7) each dish belongs to.</p>
<div class="c"><h2>${e ? 'Edit dish' : 'Add a dish'}</h2>
<div class="rf"><div><label class="l" for="mStall">Stall</label><select class="in" id="mStall">${STALLS.map((s) => `<option value="${s.id}" ${e ? sel(s.id, e.stall) : ''}>${esc(s.name)}</option>`).join('')}</select></div>
<div><label class="l" for="mCat">Category</label><select class="in" id="mCat">${CATS.map((c) => `<option ${e ? sel(c, e.c) : ''}>${c}</option>`).join('')}</select></div></div>
<label class="l" for="mName">Dish name</label><input class="in" id="mName" maxlength="120" value="${esc(r.name || '')}">
<label class="l" for="mDesc">Description</label><textarea class="in" id="mDesc" rows="3" maxlength="1000">${esc(r.description || '')}</textarea>
<div class="rf"><div><label class="l" for="mPrice">Price (₱)</label><input class="in" id="mPrice" type="number" min="0" step="1" value="${e ? e.p : ''}"></div>
<div><label class="l" for="mTime">Prep time (min)</label><input class="in" id="mTime" type="number" min="1" step="1" value="${e ? e.t : 5}"></div></div>
<div class="rf"><div><label class="l" for="mStatus">Availability</label><select class="in" id="mStatus"><option value="ok" ${e ? sel('ok', e.s) : ''}>Available</option><option value="few" ${e ? sel('few', e.s) : ''}>Few left</option><option value="out" ${e ? sel('out', e.s) : ''}>Sold out</option></select></div>
<div><label class="l" for="mEmoji">Emoji (shown if no photo)</label><input class="in" id="mEmoji" maxlength="4" value="${esc(r.emoji || '')}" placeholder="🍛"></div></div>
<label class="chk"><input type="checkbox" id="mPop" ${e && e.pop ? 'checked' : ''}> Show as “Popular”</label>
<label class="l" for="mPhoto">Photo</label>
<img id="mPv" class="mpv" alt="Photo preview" ${e && photoSrc(e) ? `src="${photoSrc(e)}"` : 'hidden'}>
<input class="in" id="mPhoto" type="file" accept="image/*" onchange="previewPhoto(this)">
<button class="btn" id="mSave" onclick="saveMenuItem()">${e ? 'Save changes' : 'Add to menu'}</button>${e ? '<button class="btn ol" onclick="cancelMenuEdit()">Cancel</button>' : ''}</div>
<h2 class="sec" style="margin-top:18px">Current menu</h2><div class="chips">${chips}</div>
<div class="gx">${list.map((m) => `<div class="fc">${photo(m)}<div class="fb"><b>${m.n}</b><div class="rw"><span class="pr">${peso(m.p)}</span>${pill(m)}</div><small class="rmark">${esc(stallName(m.stall))} · ${m.c}</small><div class="rw"><button class="btn sm ol" onclick="editMenuItem(${m.id})">Edit</button><button class="btn sm rd" onclick="delMenuItem(${m.id})">Delete</button></div></div></div>`).join('') || '<div class="c">No dishes here yet.</div>'}</div>`;
}

R.staff = () => {
  stfPage = 'staff';
  return `<div class="stf">${stfAside()}<section>${stfTop()}${staffTab == 'menu' ? staffMenuHtml() : staffOrdersHtml()}</section></div>`;
};
