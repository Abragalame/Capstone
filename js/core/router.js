/* Role-guarded hash router + top bar / bottom nav (original go(), extended for staff & admin). */
const NV=[["home","Home"],["menu","Menu"],["orders","Orders"],["profile","Profile"]];
const onk=r=>({home:"home",menu:"menu",item:"menu",cart:"menu",checkout:"menu",orders:"orders",track:"orders",receive:"orders",done:"orders",profile:"profile"}[r]);
const icn=(k,s)=>I(k=="home"?"home":k=="menu"?"menu":k=="orders"?"orders":"user",s);
function topBar(r){return `<div class="top"><a class="b" href="${S.user?"#/home":"#/"}"><img src="logo.png" alt="">MCPI Canteen</a>${S.user?`<div class="dn">${NV.map(([k,l])=>`<a href="#/${k}" class="${onk(r)==k?"on":""}">${icn(k,20)}${l}</a>`).join("")}</div>`:""}${S.user?roleBadge():""}${fsBtn()}${themeBtn()}${S.user?`<a class="ib" href="#/cart" aria-label="Cart">${I("cart")}${cartN()?`<span class="bd">${cartN()}</span>`:""}</a>`:""}</div>`}
function nav(r){return `<div class="bn">${NV.map(([k,l])=>`<a href="#/${k}" class="${onk(r)==k?"on":""}">${icn(k,22)}${l}</a>`).join("")}</div>`}
function go(){clearInterval(timer);closeSheet();
 const h=(location.hash||"#/").slice(2).split("/"),r=R[h[0]]?h[0]:"welcome";
 if(!S.user&&!["welcome","login","guide"].includes(r)){location.hash="#/login";return}
 if(S.user&&(r=="welcome"||r=="login")){location.hash=homeHash();return}
 if(!canView(r)){location.hash=homeHash();return}
 const full=r=="welcome"||r=="login",st=r=="staff"||r=="admin";let html=R[r](h[1]);
 if(!full&&!st)html=topBar(r)+viewBar()+`<div class="pad">${html}<footer class="ft">Maryknoll College of Panabo, Inc. · Capstone demo · No real payments</footer></div>`;
 if(S.user&&!full&&!st){if((r=="home"||r=="menu")&&cartN())html+=`<div class="fl"><span><b>${cartN()} item${cartN()>1?"s":""}</b><br>${peso(cartT())}</span><a class="btn w sm" href="#/cart">View cart ${I("arrow",16)}</a></div>`;html+=nav(r)}
 A.className="phone"+(full||st?" full":"");A.innerHTML=html;hsAll();setTimeout(hsAll,300);
 if(r=="admin")AdminController.load();
 if(r=="track"||r=="receive")timer=setInterval(refreshMyOrders,8000);
 if(r=="staff"&&staffTab=="orders")timer=setInterval(refreshStaffOrders,10000);
 if(location.hash!=lastH){scrollTo(0,0);lastH=location.hash}}
