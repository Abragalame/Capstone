/* Shared state, helpers, icons, theme & accessibility (from the original demo). */

try{const D=document.documentElement.dataset;D.theme=localStorage.getItem("mcpi-theme")||(matchMedia("(prefers-color-scheme:dark)").matches?"dark":"light");D.fs=localStorage.getItem("mcpi-fs")||"0";if(localStorage.getItem("mcpi-hc")=="1")D.hc="1"}catch(e){}
const P={home:"M3 11l9-8 9 8M5 10v10h14V10",menu:"M7 3v8M5 3v5a2 2 0 004 0V3M7 11v10M17 21V3c-2 1-3 4-3 8h3",orders:"M6 3h12v18l-3-2-3 2-3-2-3 2zM9 8h6M9 12h6",user:"M12 12a4 4 0 100-8 4 4 0 000 8M4 21a8 8 0 0116 0",cart:"M3 4h2l2 11h10l2-8H6M9 20h.01M17 20h.01",back:"M15 5l-7 7 7 7",check:"M5 12l5 5 9-10",search:"M11 4a7 7 0 100 14 7 7 0 000-14M21 21l-5-5",bell:"M6 16V11a6 6 0 0112 0v5l2 2H4zM10 21h4",arrow:"M5 12h14M13 6l6 6-6 6",trash:"M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13",sun:"M12 8a4 4 0 100 8 4 4 0 000-8M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4",moon:"M21 12.8A9 9 0 1111.2 3a7 7 0 009.8 9.8z"};
const I=(n,s=22)=>`<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="${P[n]}"/></svg>`;
/* f = photo file name in the /images folder (images/<f>.jpg). If a photo is missing, the emoji is shown instead. */
let MENU = []; /* loaded from Appwrite (js/services/menu.service.js) */
const CATS=["Meals","Noodles","Snacks","Drinks"],CI={Meals:"🍛",Noodles:"🍜",Snacks:"🥟",Drinks:"🧃"};
const stat=o=>o.mode=="pickup"?["Order received","Preparing","Ready for pickup","Picked up"]:["Order received","Preparing","Out for delivery","Delivered"];
let S={user:"",uid:"",email:"",role:"student",grade:9,sid:"",room:"",rn:"",cart:{},orders:[],allOrders:[],count:0};
/* new UI state: browse-by-stall, staff tabs, menu editor, login/register toggle, pref sync */
let stall=0,staffTab="orders",staffStall=0,editId=null,authMode="login",prefSig="",prefT=null;
/* The classroom is stored as a grade (S.grade) plus a room number (S.rn). S.room is the text built from them. */
const roomText=(g,n)=>n?"Grade "+g+" – Room "+n:"";
const cleanRn=v=>String(v||"").replace(/[^A-Za-z0-9-]/g,"").slice(0,8);
const syncRoom=()=>{S.room=roomText(S.grade,S.rn)};
const load=()=>{try{Object.assign(S,JSON.parse(localStorage.getItem("mcpi")||"{}"))}catch(e){}
 if(!S.rn&&S.room){const m=String(S.room).match(/room\s*([A-Za-z0-9-]+)\s*$/i)||String(S.room).match(/([A-Za-z0-9-]*\d[A-Za-z0-9-]*)\s*$/);S.rn=m?cleanRn(m[1]):""}
 syncRoom()};load();
const save=()=>{try{const{user,uid,email,role,orders,allOrders,...keep}=S;localStorage.setItem("mcpi",JSON.stringify(keep))}catch(e){}syncPrefs()};
/* grade / room / student ID follow the account (saved to Appwrite prefs) */
function syncPrefs(){if(!S.uid)return;const p={grade:S.grade,rn:S.rn,sid:S.sid},sg=JSON.stringify(p);if(sg==prefSig)return;prefSig=sg;clearTimeout(prefT);prefT=setTimeout(()=>AuthService.savePrefs(p).catch(()=>{}),800)}
const $=id=>document.getElementById(id),A=$("app");
const peso=n=>"₱"+n.toLocaleString();const item=id=>MENU.find(m=>m.id==id);
const cartN=()=>Object.values(S.cart).reduce((a,b)=>a+b,0),cartT=()=>Object.entries(S.cart).reduce((a,[i,q])=>a+item(i).p*q,0);
const cur=()=>S.orders[S.orders.length-1];
const esc=s=>String(s==null?"":s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
let cat="All",q="",mode="delivery",gm="delivery",pick="ASAP (about 15 min)",note="",timer=null,lastH="",dq=1,dqId=0;
const greet=()=>{const h=new Date().getHours();return h<12?"Good morning":h<18?"Good afternoon":"Good evening"};
const slots=()=>{const d=new Date();d.setMinutes(Math.ceil((d.getMinutes()+10)/10)*10,0,0);return[...Array(7)].map((_,i)=>new Date(d.getTime()+i*6e5).toLocaleTimeString("en-US",{hour:"numeric",minute:"2-digit"}))};
const isDark=()=>document.documentElement.dataset.theme=="dark";
function toggleTheme(){const t=isDark()?"light":"dark";document.documentElement.dataset.theme=t;try{localStorage.setItem("mcpi-theme",t)}catch(e){}const y=scrollY;go();scrollTo(0,y)}
const themeBtn=c=>`<button class="ib ${c||""}" onclick="toggleTheme()" aria-label="Switch light or dark mode" title="Light / dark mode">${I(isDark()?"sun":"moon")}</button>`;

let fs=+document.documentElement.dataset.fs||0,hc=document.documentElement.dataset.hc=="1";
const keep=()=>{const y=scrollY;go();scrollTo(0,y)};
function setFS(n){fs=n;document.documentElement.dataset.fs=n;try{localStorage.setItem("mcpi-fs",n)}catch(e){}keep()}
function cycleFS(){setFS((fs+1)%3)}
function toggleHC(){hc=!hc;if(hc)document.documentElement.dataset.hc="1";else delete document.documentElement.dataset.hc;try{localStorage.setItem("mcpi-hc",hc?"1":"0")}catch(e){}keep()}
const fsBtn=()=>`<button class="ib fs" onclick="cycleFS()" aria-label="Change text size" title="Text size">Aa${["","+","++"][fs]}</button>`;
function toast(m){const t=document.createElement("div");t.className="toast";t.setAttribute("role","status");t.textContent=m;document.body.appendChild(t);setTimeout(()=>t.remove(),1900)}
