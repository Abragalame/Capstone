/* Original demo cart helpers, unchanged. */
function setMode(m){mode=m;keep()}
function add(id){S.cart[id]=1;save();toast(item(id).n+" added to cart");go()}
function chg(id,d){const n=(S.cart[id]||0)+d;if(n<=0)delete S.cart[id];else S.cart[id]=n;save();go()}
