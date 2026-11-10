/* Pickup QR code, campus route map and the grade/room helpers (original demo). */
/* QR code for https://youtu.be/DsfI42EeoTo (verified to scan) */
const QR_URL="https://youtu.be/DsfI42EeoTo";
const QR_ROWS=["1111111011110111001111111", "1000001010010010101000001", "1011101001000110001011101", "1011101000010111001011101", "1011101010011100101011101", "1000001011101100101000001", "1111111010101010101111111", "0000000011011010100000000", "1110011011001001111110011", "0111110010011001101101011", "1110111001111001100011101", "1101000100101001011011000", "1011111111110101101000001", "0001110001101101111100011", "1111001001110111101001101", "0001100001011011110111000", "1110111100001010111110010", "0000000011111010100010001", "1111111000110100101010001", "1000001011001000100010000", "1011101001011011111110000", "1011101000011011010010110", "1011101011110010100111011", "1000001010101001110110000", "1111111011011100111001001"];
function QR(){let p="";QR_ROWS.forEach((r,y)=>{for(let x=0;x<r.length;x++)if(r[x]=="1")p+=`M${x} ${y}h1v1h-1z`});
 return `<a href="${QR_URL}" target="_blank" rel="noopener" title="Open demo video" style="display:block"><svg viewBox="-4 -4 33 33" shape-rendering="crispEdges"><rect x="-4" y="-4" width="33" height="33" fill="#fff"/><path d="${p}" fill="#123B72"/></svg></a>`}

function gradeInfo(g){g=+g||9;const a="Your order is prepared at the Canteen.",z="The runner delivers it to your classroom.",pz="The Canteen is right beside JHS. Show your QR code at the pickup counter.";
 if(g==7)return{k:"g7",x:150,y:190,lx:160,ly:180,s:[a,"The runner takes the walkway toward the Grade 7 Building.",z],p:["Leave the Grade 7 Building and take the walkway up.","Turn right, past the JHS Building.",pz]};
 if(g<=10)return{k:"jhs",x:143,y:114,lx:100,ly:168,s:[a,"The runner walks along the walkway to the JHS Building, right beside the Canteen.",z],p:["Leave the JHS Building onto the walkway.","Turn right. The Canteen is the next building.","Show your QR code at the pickup counter."]};
 return{k:"shs",x:51,y:114,lx:8,ly:168,s:[a,"The runner walks along the walkway, past the JHS Building, to the SHS Building.",z],p:["Leave the SHS Building onto the walkway.","Walk right, past the JHS Building.",pz]}}
function map(g,md){g=+(g||S.grade)||9;md=md||"delivery";const i=gradeInfo(g),bs=k=>md!="none"&&i.k==k?'#e8452c" stroke-width="4':'#123B72" stroke-width="2';
 const pk=md=="pickup";
 const route=md=="none"?"":`<path d="${pk?`M${i.x} ${i.y} L${i.x} 150 L232 150 L232 114`:`M232 114 L232 150 L${i.x} 150 L${i.x} ${i.y}`}" fill="none" stroke="#f0961e" stroke-width="4" stroke-dasharray="8 6" stroke-linecap="round" stroke-linejoin="round"/>
<circle cx="232" cy="114" r="7" fill="#f0961e"/><text x="242" y="138" font-size="11" font-weight="700" fill="#a35a00">${pk?"② Pickup counter":"① Canteen"}</text>
<circle cx="${i.x}" cy="${i.y}" r="7" fill="#f0961e"/><text x="${i.lx}" y="${i.ly}" font-size="11" font-weight="700" fill="#a35a00">${pk?"① You are here (Gr "+g+")":"② Your classroom (Gr "+g+")"}</text>`;
 return `<div class="mapw"><svg viewBox="0 0 360 310" style="background:#e8f4e0">
<rect x="0" y="262" width="360" height="48" fill="#cfd6df"/><text x="90" y="290" text-anchor="middle" font-size="11" fill="#456">Street</text>
<rect x="8" y="14" width="86" height="100" rx="6" fill="#9ec3ea" stroke="${bs("shs")}"/><text x="51" y="58" text-anchor="middle" font-size="13" font-weight="700" fill="#123B72">SHS</text><text x="51" y="74" text-anchor="middle" font-size="9" fill="#123B72">Senior High</text>
<rect x="100" y="14" width="86" height="100" rx="6" fill="#9ec3ea" stroke="${bs("jhs")}"/><text x="143" y="58" text-anchor="middle" font-size="13" font-weight="700" fill="#123B72">JHS</text><text x="143" y="74" text-anchor="middle" font-size="9" fill="#123B72">Junior High</text>
<rect x="192" y="14" width="80" height="100" rx="6" fill="#2878D0" stroke="#123B72" stroke-width="3"/><text x="232" y="60" text-anchor="middle" font-size="22">🍽️</text><text x="232" y="82" text-anchor="middle" font-size="13" font-weight="700" fill="#fff">CANTEEN</text>
<rect x="278" y="14" width="76" height="100" rx="6" fill="#f1d9a8" stroke="#123B72" stroke-width="2"/><text x="316" y="58" text-anchor="middle" font-size="12" font-weight="700" fill="#123B72">OPEN</text><text x="316" y="73" text-anchor="middle" font-size="12" font-weight="700" fill="#123B72">STAGE</text>
<rect x="95" y="190" width="170" height="62" rx="6" fill="#9ec3ea" stroke="${bs("g7")}"/><text x="104" y="214" font-size="12" font-weight="700" fill="#123B72">GRADE 7 BUILDING</text><text x="104" y="230" font-size="9" fill="#123B72">Bottom floor = MAIN GATE</text>
<rect x="216" y="244" width="32" height="18" fill="#fff" stroke="#123B72" stroke-width="2"/><text x="232" y="257" text-anchor="middle" font-size="9" font-weight="700" fill="#123B72">GATE</text>${route}</svg></div>`}
const steps=(g,md)=>gradeInfo(g)[md=="pickup"?"p":"s"].map((t,i)=>`<div class="st"><span class="nm o">${i+1}</span><span>${t}</span></div>`).join("");
const gradeChips=()=>`<div class="chips wrap">${[7,8,9,10,11,12].map(g=>`<button class="ch ${g==S.grade?"on":""}" onclick="setGrade(${g})">Grade ${g}</button>`).join("")}</div>`;
function setGrade(g){S.grade=+g;syncRoom();save();const y=scrollY;go();scrollTo(0,y)}
function setGM(m){gm=m;const y=scrollY;go();scrollTo(0,y)}

const gradeOpts=sel=>[7,8,9,10,11,12].map(g=>`<option value="${g}" ${g==sel?"selected":""}>Grade ${g}</option>`).join("");
