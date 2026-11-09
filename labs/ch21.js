/* lab 21 – same code as the website */
{




/* ===================== Chapter 21 – electro-hydraulic control (sims 56, 57) ===================== */

/* ---------- ladder diagram: shared runner + live symbol ---------- */
/* rung = {st:[stage…]} ; stage = {k:'no'|'nc'|'coil'|'lamp'|'tmr', id, t} or {par:[[stage…],[stage…]]} */
const LAD_LOAD={coil:1,lamp:1,tmr:1};
const ladPass=(e,on)=>e.k==='no'?!!on[e.id]:e.k==='nc'?!on[e.id]:true;
function ladRun(rungs,on,pw){const out={};rungs.forEach(r=>{let p=pw;r.st.forEach(s=>{if(s.par)p=p&&s.par.some(row=>row.every(e=>ladPass(e,on)));else{if(LAD_LOAD[s.k])out[s.id]=!!(out[s.id]||p);p=p&&ladPass(s,on);}});});return out;}
function ladLay(o){let y=0;const L=o.rungs.map(r=>{const q={r,y,sw:o.w/r.st.length};y+=r.st.some(s=>s.par)?62:40;return q;});return {L,h:y-40};}
function ladEl(g,e,xc,y){const R={};
  if(e.k==='no'||e.k==='nc'){R.f=SR(g,xc-4,y-7,8,14,'oil');R.f.style.fill='#bbf7d0';SL(g,xc-10,y,xc-4,y);SL(g,xc+4,y,xc+10,y);SL(g,xc-4,y-8,xc-4,y+8,'sy thick');SL(g,xc+4,y-8,xc+4,y+8,'sy thick');if(e.k==='nc')SL(g,xc-7,y+7,xc+7,y-7,'sy');}
  else if(e.k==='coil'||e.k==='lamp'){R.f=SC(g,xc,y,8,'syb');if(e.k==='lamp'){SL(g,xc-5.5,y-5.5,xc+5.5,y+5.5,'sy thin');SL(g,xc-5.5,y+5.5,xc+5.5,y-5.5,'sy thin');}SL(g,xc-10,y,xc-8,y);SL(g,xc+8,y,xc+10,y);}
  else if(e.k==='tmr'){R.f=SR(g,xc-8,y-7,16,14,'syb');ST(g,xc,y+3.5,'T','st s');SL(g,xc-10,y,xc-8,y);SL(g,xc+8,y,xc+10,y);}
  const t=ST(g,xc,y-11,e.t||e.id,'st s');t.style.fontSize='8.5px';return R;}
SYM.ladder={ports:o=>({}),bb:o=>{const {h}=ladLay(o);return [-12,-22,o.w+12,h+30];},
  draw(g,o){const {L,h}=ladLay(o);const rl=SL(g,0,-16,0,h+16,'sy thick'),rr=SL(g,o.w,-16,o.w,h+16,'sy thick');const t1=ST(g,0,-18,'+24V','st s'),t2=ST(g,o.w,-18,'0V','st s');
    const W=[],E=[];const wire=(x1,y1,x2,y2,get)=>{if(Math.abs(x2-x1)<.5&&Math.abs(y2-y1)<.5)return;W.push({l:SL(g,x1,y1,x2,y2,'sy'),get});};
    L.forEach((q,ri)=>{const y=q.y;q.r.st.forEach((s,si)=>{const xa=si*q.sw,xb=xa+q.sw,xc=(xa+xb)/2;
      if(s.par){const m=Math.max(...s.par.map(r=>r.length));s.par.forEach((row,k)=>{const yy=y+26*k,sw=q.sw/row.length;row.forEach((e,j)=>{const cx=xa+(j+.5)*sw;E.push({e,R:ladEl(g,e,cx,yy),ri,si,k,j});
          wire(j===0?xa:cx-sw/2,yy,cx-10,yy,P=>P.n[ri][si].row[k][j]);wire(cx+10,yy,j===row.length-1?xb:cx+sw/2,yy,P=>P.n[ri][si].row[k][j+1]);});});
        wire(xa,y,xa,y+26,P=>P.n[ri][si].in);wire(xb,y,xb,y+26,P=>P.n[ri][si].out);}
      else{E.push({e:s,R:ladEl(g,s,xc,y),ri,si});wire(xa,y,xc-10,y,P=>P.n[ri][si].in);wire(xc+10,y,xb,y,P=>LAD_LOAD[s.k]?false:P.n[ri][si].out);}});});
    const pc=(l,on)=>{l.style.stroke=on?'#dc2626':'#94a3b8';l.style.strokeWidth=on?2.2:1.4;};
    return cs=>{if(!cs)return;const on=cs.on||{},pw=!!cs.pw;const N={n:[]};
      L.forEach((q,ri)=>{let p=pw;N.n[ri]=q.r.st.map(s=>{const o={in:p};if(s.par){o.row=s.par.map(row=>{let rp=p;const a=[rp];row.forEach(e=>{rp=rp&&ladPass(e,on);a.push(rp);});return a;});p=p&&o.row.some(a=>a.at(-1));}else p=p&&ladPass(s,on);o.out=p;return o;});});
      W.forEach(w=>pc(w.l,!!w.get(N)));pc(rl,pw);
      E.forEach(x=>{const n=N.n[x.ri][x.si];if(LAD_LOAD[x.e.k]){const en=x.k!=null?false:n.in;x.R.f.style.fill=en?(x.e.k==='lamp'?'#fde047':'#fca5a5'):'#fff';}else x.R.f.style.display=ladPass(x.e,on)?'':'none';});};}};
B3.ladder=()=>({g:new THREE.Group()});
/* limit switch (roller lever). cs:{on} */
SYM.lsw={ports:o=>({}),bb:o=>[-9,-10,9,16],draw(g,o){SR(g,-8,8,16,8,'syb');SL(g,0,8,0,0,'sy');const r=SC(g,0,-4,4,'syb');return cs=>{r.style.fill=cs&&cs.on?'#16a34a':'#fff';};}};
B3.lsw=(c,o)=>{const M=m3(),g=new THREE.Group();g.add(edges(at(box3(14,8,10,M.dark),0,-10,8)));const r=at(cyl3(4,6,M.steel,'z'),0,-2,8);g.add(r);return {g,upd(cs){r.material=cs&&cs.on?M.green:M.steel;}};};
/* step chain (GRAFCET-like). o:{t:[labels]} cs:{k:active index} */
SYM.steps={ports:o=>({}),bb:o=>[-10,-30,o.t.length*56,24],draw(g,o){const B=o.t.map((t,i)=>{const x=i*56;const r=sv('rect',{x,y:-14,width:46,height:28,rx:4,class:'syb'},g);const tx=ST(g,x+23,4,t,'st s');tx.style.fontSize='9px';if(i)SA(g,x-10,0,x-1,0,'sy',3);if(o.tr&&o.tr[i])ST(g,x-5,-17,o.tr[i],'st s').style.fontSize='8px';return r;});
  return cs=>{B.forEach((r,i)=>{r.style.fill=cs&&cs.k===i?'#fde68a':'#fff';r.style.strokeWidth=cs&&cs.k===i?2:1;});};}};
B3.steps=()=>({g:new THREE.Group()});

/* ---------- 56 · ladder lab + hydraulics ---------- */
const LMODE56={direct:'הפעלה ישירה',indirect:'הפעלה עקיפה (ממסר)',latch:'החזקה עצמית'};
function rungs56(P){const ES={k:'nc',id:'ES',t:'ES חירום'},S1={k:'no',id:'S1',t:'S1 הפעלה'};
  if(P.mode==='direct')return [{st:[ES,S1,{k:'coil',id:'Y1',t:'Y1'}]}];
  if(P.mode==='indirect')return [{st:[ES,S1,{k:'coil',id:'K1',t:'K1'}]},{st:[{k:'no',id:'K1',t:'K1'},{k:'coil',id:'Y1',t:'Y1'}]},{st:[{k:'no',id:'K1',t:'K1'},{k:'lamp',id:'H1',t:'H1'}]}];
  const r1=[ES,{k:'nc',id:'S0',t:'S0 עצירה'},{par:[[S1],[{k:'no',id:'K1s',t:'K1'}]]}];if(P.aret)r1.push({k:'nc',id:'a1',t:'a1'});r1.push({k:'coil',id:'K1',t:'K1'});
  return [{st:r1},{st:[{k:'no',id:'K1',t:'K1'},{k:'coil',id:'Y1',t:'Y1'}]},{st:[{k:'no',id:'K1',t:'K1'},{k:'lamp',id:'H1',t:'H1 פועל'}]}];}
const SIM_LAD={id:'ladder',n:56,t:'מעבדת סולם + הידראוליקה',d:'לחצנים, ממסר, החזקה עצמית ועצירת חירום: הזרם בסולם זורם במקביל לשמן בצילינדר',
  P:{mode:'latch',aret:true,auto:true,hold:false,es:false,s1p:0,s0p:0,Q:12,D:50,dr:28,S:300,F:5000,pr:100},
  key:P=>P.mode+(P.aret?1:0),
  ui(U,P){U.grp('סולם');U.seg(P,'mode','חיווט',[['direct','ישירה'],['indirect','ממסר'],['latch','החזקה']],true);U.btn('▶ הפעלה (S1)',()=>{P.s1p++;},'');U.btn('■ עצירה (S0)',()=>{P.s0p++;},'');
    U.chk(P,'hold','להחזיק את לחצן ההפעלה לחוץ');U.chk(P,'es','🛑 עצירת חירום (ES) לחוצה');U.chk(P,'aret','חזרה אוטומטית ב-a1');U.chk(P,'auto','לחיצה אוטומטית על לחצן ההפעלה');
    U.grp('הידראוליקה',false);U.num(P,'Q','ספיקת משאבה','L/min',{min:2,max:60,step:1});U.num(P,'F','עומס','N',{min:0,max:50000,step:500});U.num(P,'S','מהלך','mm',{min:50,max:800,step:10});U.num(P,'pr','שסתום פריקה','bar',{min:20,max:250,step:5});},
  circuit:P=>({comps:[
      {id:'LD',type:'ladder',x:20,y:50,o:{w:270,rungs:rungs56(P)},name:`דיאגרמת סולם – ${LMODE56[P.mode]}`},
      {id:'C1',type:'cyl',x:470,y:70,o:{load:{t:'m'}},name:'צילינדר דו-פעולה',lbl:'צילינדר',lblAt:[-80,-24]},
      {id:'A0',type:'lsw',x:514,y:36,name:'מפסק גבול a0 (צילינדר בפנים)',lbl:'a0',lblAt:[-14,0]},{id:'A1',type:'lsw',x:618,y:36,name:'מפסק גבול a1 (צילינדר בחוץ)',lbl:'a1',lblAt:[14,0]},
      {id:'V1',type:'dcv',x:470,y:190,o:{ways:4,box:['P>A B>T','P>B A>T'],n0:1,L:'sol',R:'spring'},name:'שסתום 4/2 סולנואיד Y1 / קפיץ',lbl:'Y1',lblAt:[-82,-14]},
      {id:'P1',type:'pump',x:463,y:330,name:'משאבה',lbl:'משאבה',lblAt:[50,30]},{id:'T1',type:'tank',x:463,y:360,name:'מיכל'},
      {id:'RV',type:'pv',x:400,y:270,rot:-90,o:{kind:'relief'},name:'שסתום פריקה',lbl:'פריקה',lblAt:[0,-26]},{id:'T2',type:'tank',x:370,y:282,name:'מיכל'},{id:'T3',type:'tank',x:520,y:238,name:'מיכל'},
      {id:'G1',type:'gauge',x:500,y:288,net:'P',name:'מד לחץ'},
      {id:'CH',type:'chart',x:150,y:330,o:{w:230,h:90,xl:'זמן',yl:'mm',t:'מהלך (כחול) · זרם ב-Y1 ×S (כתום)'},name:'גרף מהלך וזרם'}],
    lines:[{id:'LA',net:'A',pts:['V1.A',[463,120],[420,120],'C1.A']},{id:'LB',net:'B',pts:['V1.B',[477,120],[520,120],'C1.B']},{id:'LP',net:'P',pts:['P1.out',[463,270],'V1.P']},{id:'LS',net:'S',pts:['T1.t','P1.in']},
      {id:'LRV',net:'P',pts:[[463,270],'RV.P']},{id:'LRT',net:'T',pts:['RV.T',[370,270],'T2.t']},{id:'LT',net:'T',pts:['V1.T',[477,226],[520,226],'T3.t']},{id:'LG',net:'P',pts:[[463,300],'G1.p'],nodot:true}]}),
  init:()=>({t:0,x:0,si:1,s1:0,s0:0,s1p:null,s0p:null,idle:0,K1:false,h:[],cyc:0}),
  step(P,st,dt,ctx){const f=ctx.fault;st.t+=dt;if(st.s1p==null){st.s1p=P.s1p;st.s0p=P.s0p;}
    if(P.s1p!==st.s1p){st.s1p=P.s1p;st.s1=.6;}if(P.s0p!==st.s0p){st.s0p=P.s0p;st.s0=.6;}
    if(P.auto&&!st.K1&&st.x<=1&&!P.es){st.idle+=dt;if(st.idle>2.5){st.idle=0;st.s1=.6;}}else st.idle=0;
    st.s1=Math.max(0,st.s1-dt);st.s0=Math.max(0,st.s0-dt);
    const a0=st.x<=1,a1=f==='ls'?false:st.x>=P.S-1;const on={S1:P.hold||st.s1>0,S0:st.s0>0,ES:P.es,a0,a1,K1:st.K1,K1s:f==='seal'?false:st.K1};
    const R=rungs56(P);let out={};for(let k=0;k<3;k++){out=ladRun(R,on,true);on.K1=!!out.K1;on.K1s=f==='seal'?false:on.K1;}st.K1=on.K1;
    const Y1=!!out.Y1&&f!=='coil';const A1=H.A(P.D),A2=H.Aann(P.D,P.dr);
    KIT.ease(st,'si',Y1?0:1,dt,10);const ext=Y1,end=ext?st.x>=P.S-.5:st.x<=.5;const v=end?0:H.v(P.Q,ext?A1:A2);st.x=clamp(st.x+(ext?1:-1)*v*dt,0,P.S);
    const pL=end?P.pr:ext?H.p(P.F,A1):H.p(P.F*.3,A2);KIT.rpmAng(st,dt,1450);
    const I=(out.Y1?(f==='coil'?0:1.0):0)+(out.K1?.1:0)+(out.H1?.05:0);
    if(!st.h.length||st.t-st.h.at(-1)[0]>.1){st.h.push([st.t,st.x,Y1?P.S:0]);if(st.h.length>160)st.h.shift();}const t0=st.h[0][0],pm=KIT.nice(P.pr*1.05);
    return {p:{P:pL,A:ext?pL:.5,B:ext?.5:pL,T:.5,S:-.05},q:{LA:ext?(end?0:P.Q):-(end?0:P.Q*A1/A2),LB:ext?-(end?0:P.Q*A2/A1):(end?0:P.Q),LP:P.Q*(end?0:1),LS:P.Q,LRV:end?P.Q:0,LRT:end?P.Q:0,LT:end?0:(ext?P.Q*A2/A1:P.Q*A1/A2),LG:0},
      pmax:pm,qref:P.Q,out,on,Y1,I,a0,a1,v,end,ext,
      c:{LD:{pw:true,on},C1:{x:st.x/P.S,uA:(ext?pL:.5)/pm,uB:(ext?.5:pL)/pm},V1:{i:st.si},P1:{on:true,ang:st.ang},A0:{on:a0},A1:{on:a1},
        CH:{s:[{p:st.h.map(a=>[a[0],a[1]]),c:'#0b72d9'},{p:st.h.map(a=>[a[0],a[2]]),c:'#ea580c',d:true}],x:[t0,Math.max(t0+14,st.t)],y:[0,P.S*1.05]}},
      read:[{k:'לחצן ההפעלה (S1)',v:on.S1?1:0,u:'',max:1},{k:'ממסר K1',v:out.K1?1:0,u:'',max:1},{k:'סולנואיד Y1',v:Y1?1:0,u:'',max:1},{k:'זרם בסולם',v:I,u:'A',max:1.2},{k:'מהלך',v:st.x,u:'mm',max:P.S},{k:'מהירות',v:ext?v:-v,u:'mm/s'},{k:'לחץ משאבה',v:pL,u:'bar',max:P.pr}]};},
  ins(P,R){const L=[];const o=R.out;
    if(P.es)L.push({ic:'🛑',at:'LD',w:true,h:'עצירת חירום: מגע ES נפתח, Y1 מאבד זרם והקפיץ מחזיר את השסתום – הצילינדר חוזר פנימה. (בשסתום 4/3 מרכז סגור הוא היה נעצר במקום.)',c:'חירום'});
    if(P.mode==='direct')L.push({ic:'👆',at:'LD',h:'הפעלה ישירה: הלחצן נמצא בקו של הסולנואיד. הצילינדר יוצא <b>רק כל עוד</b> לוחצים – לחצן רגעי לא "זוכר".'});
    if(P.mode==='indirect')L.push({ic:'🔁',at:'LD',h:'הפעלה עקיפה: הלחצן מפעיל רק ממסר K1 (זרם קטן, ~0.1 A), ומגע של K1 מפעיל את Y1 (~1 A). עדיין צריך להחזיק את הלחצן.'});
    if(P.mode==='latch')L.push({ic:'🔒',at:'LD',h:`החזקה עצמית: מגע K1 במקביל ל-לחצן ההפעלה "מחזיק" את הממסר אחרי שעוזבים את הלחצן. לחצן העצירה${P.aret?' או a1':''} שוברים את השרשרת.`});
    if(o.Y1&&!R.Y1)L.push({ic:'⚡',at:'V1',w:true,h:'הסולם מפעיל את Y1 אבל אין זרם בסליל – השסתום לא זז.',c:'סליל פתוח'});
    else if(R.Y1)L.push({ic:'💧',at:'C1',h:`Y1 מופעל → השסתום עובר לריבוע P→A והשמן דוחף את הבוכנה החוצה ב-${fmt(R.v,0)} mm/s. הזרם בסולם (${fmt(R.I,2)} A) והשמן זורמים יחד.`});
    if(R.end&&R.ext)L.push({ic:'🛡',at:'RV',h:'בסוף מהלך השמן עובר בשסתום הפריקה – כדאי a1 שיחזיר את הצילינדר.'});return L;},
  calc(P,R){const A1=H.A(P.D);return `<div class="kpis">${kpi('זרם בסולם',fmt(R.I,2),'A')}${kpi('הספק סולנואיד',fmt(R.Y1?24:0,0),'W')}${kpi('מהירות יציאה',fmt(H.v(P.Q,A1),0),'mm/s')}${kpi('זמן מהלך',fmt(P.S/H.v(P.Q,A1),2),'s')}</div>`+
    det('לוגיקה',row('',P.mode==='latch'?`K1 = ¬ES · ¬S0 · (S1 + K1)${P.aret?' · ¬a1':''} ; Y1 = K1`:P.mode==='indirect'?'K1 = ¬ES · S1 ; Y1 = K1':'Y1 = ¬ES · S1'),true)+
    det('זרם וחשמל',row('',`I = I_Y1 + I_K1 + I_H1 = 1.0 + 0.1 + 0.05 A (24 V DC) → ${V(R.I,'A')}`))+det('הידראוליקה',row('',`v = Q/A = ${P.Q}·10⁶/60/${fmt(A1,0)} = ${V(H.v(P.Q,A1),'mm/s')}`));},
  demo:[{t:'הפעלה ישירה',x:'הלחצן מחובר ישר לסולנואיד: לוחצים – הצילינדר יוצא; עוזבים – הקפיץ מחזיר אותו.',reset:true,set:{mode:'direct',auto:true,hold:false,es:false},hl:['LD','C1'],dur:7},
    {t:'ממסר',x:'אותו דבר דרך ממסר K1: זרם קטן בלחצן, זרם גדול בסליל. נורית H1 מראה שהממסר עובד.',set:{mode:'indirect'},hl:['LD'],dur:7},
    {t:'החזקה עצמית',x:'מגע K1 במקביל ללחצן: לחיצה קצרה מספיקה. הקו האדום נשאר דרך המגע של K1.',set:{mode:'latch',aret:false},hl:['LD','V1'],dur:8},
    {t:'חזרה אוטומטית',x:'מגע a1 (NC) בשרשרת: כשהצילינדר מגיע החוצה a1 נפתח, K1 נופל והצילינדר חוזר – מחזור אחד.',set:{aret:true},hl:['A1','LD'],dur:9},
    {t:'עצירת חירום',x:'לוחצים ES: כל הסולם נכבה. עם שסתום קפיץ הצילינדר חוזר – בתכנון צריך לבדוק מה בטוח למכונה.',set:{es:true},hl:['LD'],dur:5}],
  predict:[{q:'בהפעלה ישירה לוחצים על לחצן ההפעלה לחצי שנייה ועוזבים. מה יקרה?',set:{mode:'direct',auto:false,hold:false,es:false},opts:['הצילינדר ייצא עד הסוף','הצילינדר יזוז קצת ויחזור','לא יקרה כלום'],a:1,why:'הסולנואיד מקבל זרם רק כל עוד הלחצן לחוץ; הקפיץ מחזיר את השסתום.'},
    {q:'בהחזקה עצמית לוחצים לחצן העצירה באמצע היציאה. הצילינדר –',set:{mode:'latch',auto:false,es:false},opts:['ממשיך החוצה','חוזר פנימה','נעצר במקום'],a:1,why:'K1 נופל, Y1 נכבה והקפיץ מחזיר את שסתום 4/2 – השמן הולך לצד B.'}],
  tasks:[{q:P=>`בסולם: סולנואיד 24 V, ${fmt(1.0,1)} A, ממסר 0.1 A ונורית 0.05 A פועלים יחד. מה הזרם הכולל?`,a:()=>1.15,u:'A',hint:'זרמים במקביל מתחברים.'},
    {q:P=>`Q = ${P.Q} L/min, Ø${P.D} mm, מהלך ${P.S} mm. כמה זמן המהלך החוצה?`,a:P=>P.S/H.v(P.Q,H.A(P.D)),u:'s',hint:'t = S/v, v = Q/A.',rand:P=>{P.Q=rnd(6,30,2);P.S=rnd(150,600,50);}}],
  faults:[{id:'seal',t:'מגע ההחזקה של K1 לא נסגר (חוט קטוע)',sym:'"הצילינדר זז רק כשמחזיקים את לחצן ההפעלה."',hint:'האם K1 נשאר מופעל אחרי שעוזבים את הלחצן?',why:'בלי מגע ההחזקה אין זיכרון – K1 נופל כשהלחצן משתחרר.',set:{mode:'latch',auto:true,hold:false,es:false}},
    {id:'coil',t:'סליל Y1 שרוף',sym:'"הנורית דולקת אבל הצילינדר לא זז."',hint:'בדקו את הזרם בסולם כשהנורית דולקת.',why:'הסולם מפעיל את Y1 אבל הסליל פתוח – אין זרם ואין כוח לספול (מגופה).',set:{mode:'latch',auto:true,hold:false,es:false}},
    {id:'ls',t:'מפסק a1 זז ממקומו (לא נלחץ)',sym:'"הצילינדר יוצא ונשאר בחוץ, והשמן מתחמם."',hint:'האם a1 נדלק בסוף המהלך?',why:'a1 לא נפתח – K1 נשאר מופעל והמשאבה עובדת דרך שסתום הפריקה.',set:{mode:'latch',aret:true,auto:true,hold:false,es:false}}],
  qaT:10,
  test(H){const P=clone(this.P);P.mode='latch';P.aret=true;const R=rungs56(P);const o1=ladRun(R,{S1:true,K1s:false},true),o2=ladRun(R,{S1:false,K1s:true,K1:true},true),o3=ladRun(R,{S1:false,K1s:true,K1:true,S0:true},true),o4=ladRun(R,{K1:true,K1s:true,a1:true},true);
    return [['לחצן ההפעלה מפעיל את K1',+!!o1.K1,1],['החזקה עצמית',+!!o2.K1,1],['לחצן העצירה מפיל',+!!o3.K1,0],['a1 מפיל (חזרה אוטומטית)',+!!o4.K1,0],['v = Q/A',H.v(12,H.A(50)),12e6/60/(PI*625)]];}};

/* ---------- 57 · two-cylinder automatic cycle ---------- */
const SEQ57={ABab:{t:['0','A+','B+','A−','B−'],tr:['','לחצן ההפעלה','a1','b1·T','a0'],sol:['Y1','Y3','Y2','Y4'],end:['a1','b1','a0','b0']},
  ABba:{t:['0','A+','B+','B−','A−'],tr:['','לחצן ההפעלה','a1','b1·T','b0'],sol:['Y1','Y3','Y4','Y2'],end:['a1','b1','b0','a0']}};
function rungs57(P){const st0={par:[[{k:'no',id:'S1',t:'לחצן ההפעלה'}],[{k:'no',id:'CONT',t:'רציף'}]]};
  if(P.logic==='casc'){const q=SEQ57[P.seq];return [{st:[{k:'no',id:'K1',t:'K1'},{k:'coil',id:q.sol[0],t:q.sol[0]}]},{st:[{k:'no',id:'K2',t:'K2'},{k:'coil',id:q.sol[1],t:q.sol[1]}]},{st:[{k:'no',id:'K2',t:'K2'},{k:'no',id:'b1',t:P.ps?'PS':'b1'},{k:'tmr',id:'T1',t:'T1'}]},
    {st:[{k:'no',id:'K3',t:'K3'},{k:'coil',id:q.sol[2],t:q.sol[2]}]},{st:[{k:'no',id:'K4',t:'K4'},{k:'coil',id:q.sol[3],t:q.sol[3]}]}];}
  const b1={k:'no',id:'b1',t:P.ps?'PS':'b1'};
  if(P.seq==='ABab')return [{st:[st0,{k:'no',id:'a0',t:'a0'},{k:'no',id:'b0',t:'b0'},{k:'coil',id:'Y1',t:'Y1 A+'}]},{st:[{k:'no',id:'a1',t:'a1'},{k:'coil',id:'Y3',t:'Y3 B+'}]},{st:[b1,{k:'tmr',id:'T1',t:'T1'}]},{st:[{k:'no',id:'T1',t:'T1'},{k:'coil',id:'Y2',t:'Y2 A−'}]},{st:[{k:'no',id:'a0',t:'a0'},{k:'coil',id:'Y4',t:'Y4 B−'}]}];
  return [{st:[st0,{k:'no',id:'b0',t:'b0'},{k:'coil',id:'Y1',t:'Y1 A+'}]},{st:[{k:'no',id:'a1',t:'a1'},{k:'coil',id:'Y3',t:'Y3 B+'}]},{st:[b1,{k:'tmr',id:'T1',t:'T1'}]},{st:[{k:'no',id:'T1',t:'T1'},{k:'coil',id:'Y4',t:'Y4 B−'}]},{st:[{k:'no',id:'b0',t:'b0'},{k:'coil',id:'Y2',t:'Y2 A−'}]}];}
const SIM_SEQ={id:'seq',n:57,t:'מחזור אוטומטי של שני צילינדרים',d:'מפסקי גבול, מתג לחץ וטיימר: מחזור יחיד או רציף, דיאגרמת מקום-זמן, וחפיפת אותות כשהלוגיקה פשוטה מדי',
  P:{seq:'ABab',logic:'direct',cyc:'cont',ps:false,tdw:1,auto:true,s1p:0,Q:16,DA:50,DB:40,dr:25,S:200,FB:4000,pps:80,pr:100},
  key:P=>P.seq+P.logic+(P.ps?1:0),
  ui(U,P){U.grp('רצף ולוגיקה');U.seg(P,'seq','רצף',[['ABab','A+ B+ A− B−'],['ABba','A+ B+ B− A−']],true);U.seg(P,'logic','לוגיקה',[['direct','ישירה מחיישנים'],['casc','שלבים (זיכרון)']],true);
    U.seg(P,'cyc','מחזור',[['single','יחיד'],['cont','רציף']]);U.btn('▶ הפעלה',()=>{P.s1p++;},'');U.chk(P,'ps','מתג לחץ PS במקום b1',true);U.num(P,'tdw','השהיה בטיימר T1','s',{min:0,max:5,step:.5});U.chk(P,'auto','לחיצה אוטומטית על לחצן ההפעלה');
    U.grp('הידראוליקה',false);U.num(P,'Q','ספיקת משאבה','L/min',{min:4,max:60,step:1});U.num(P,'FB','כוח הידוק B','N',{min:0,max:30000,step:500});U.num(P,'pps','כיול מתג לחץ','bar',{min:10,max:200,step:5});U.num(P,'pr','שסתום פריקה','bar',{min:30,max:250,step:5});},
  circuit:P=>{const q=SEQ57[P.seq];return {comps:[
      {id:'LD',type:'ladder',x:20,y:40,o:{w:260,rungs:rungs57(P)},name:'סולם הבקרה'},
      {id:'SQ',type:'steps',x:30,y:300,o:{t:q.t,tr:q.tr},name:'שרשרת שלבים'},
      {id:'CA',type:'cyl',x:490,y:40,o:{load:{t:'A'}},name:'צילינדר A (הזנה)',lbl:'A',lblAt:[-74,-20]},{id:'CB',type:'cyl',x:490,y:130,o:{load:{t:'B'}},name:'צילינדר B (הידוק/לחיצה)',lbl:'B',lblAt:[-74,-20]},
      {id:'LA0',type:'lsw',x:574,y:8,name:'a0',lbl:'a0',lblAt:[-13,0]},{id:'LA1',type:'lsw',x:678,y:8,name:'a1',lbl:'a1',lblAt:[13,0]},{id:'LB0',type:'lsw',x:574,y:98,name:'b0',lbl:'b0',lblAt:[-13,0]},{id:'LB1',type:'lsw',x:678,y:98,name:'b1',lbl:'b1',lblAt:[13,0]},
      {id:'VA',type:'dcv',x:390,y:240,o:{ways:4,box:['P>A B>T','P>B A>T'],n0:1,L:'sol',R:'sol'},name:'שסתום A: Y1 (A+) / Y2 (A−)',lbl:'Y1 · Y2',lblAt:[0,-30]},
      {id:'VB',type:'dcv',x:580,y:240,o:{ways:4,box:['P>A B>T','P>B A>T'],n0:1,L:'sol',R:'sol'},name:'שסתום B: Y3 (B+) / Y4 (B−)',lbl:'Y3 · Y4',lblAt:[0,-30]},
      {id:'P1',type:'pump',x:480,y:370,name:'משאבה',lbl:'משאבה',lblAt:[50,30]},{id:'T1',type:'tank',x:480,y:402,name:'מיכל'},
      {id:'RV',type:'pv',x:520,y:330,rot:90,o:{kind:'relief'},name:'שסתום פריקה',lbl:'פריקה',lblAt:[0,26]},{id:'T2',type:'tank',x:550,y:342,name:'מיכל'},{id:'T3',type:'tank',x:420,y:286,name:'מיכל'},{id:'T4',type:'tank',x:610,y:286,name:'מיכל'},
      {id:'GB',type:'gauge',x:470,y:168,net:'BA',name:'מד לחץ B (מתג לחץ)'},
      {id:'CH',type:'chart',x:150,y:420,o:{w:240,h:80,xl:'זמן',yl:'',t:'דיאגרמת מקום-זמן: A (כתום, עליון) · B (כחול)'},name:'דיאגרמת מקום-זמן'}],
    lines:[{id:'LAA',net:'AA',pts:['VA.A',[383,90],[440,90],'CA.A']},{id:'LAB',net:'AB',pts:['VA.B',[397,100],[540,100],'CA.B']},
      {id:'LBA',net:'BA',pts:['VB.A',[573,180],[440,180],'CB.A']},{id:'LBB',net:'BB',pts:['VB.B',[587,170],[540,170],'CB.B']},{id:'LGB',net:'BA',pts:[[470,180],'GB.p'],nodot:true},
      {id:'LP',net:'P',pts:['P1.out',[480,300]]},{id:'LPA',net:'P',pts:[[480,300],[383,300],'VA.P']},{id:'LPB',net:'P',pts:[[480,300],[573,300],'VB.P']},{id:'LS',net:'S',pts:['T1.t','P1.in']},
      {id:'LRV',net:'P',pts:[[480,330],'RV.P']},{id:'LRT',net:'T',pts:['RV.T',[550,330],'T2.t']},{id:'LTA',net:'T',pts:['VA.T',[397,280],'T3.t']},{id:'LTB',net:'T',pts:['VB.T',[587,280],'T4.t']}]};},
  init:()=>({t:0,xa:0,xb:0,vA:-1,vB:-1,k:0,tT:0,s1:0,s1p:null,idle:0,h:[],cyc:0,tc0:0,tcy:0,cf:false,iA:1,iB:1,stuck:0}),
  step(P,st,dt,ctx){const f=ctx.fault;st.t+=dt;if(st.s1p==null)st.s1p=P.s1p;if(P.s1p!==st.s1p){st.s1p=P.s1p;st.s1=.5;}
    const S=P.S,a0=f==='a0'?true:st.xa<=1,a1=st.xa>=S-1,b0=st.xb<=1,AB=H.A(P.DB),AA=H.A(P.DA);
    const bEnd=st.xb>=S-1,pBA=st.vB>0?(bEnd?P.pr:H.p(P.FB,AB)):.5;const PS=pBA>=P.pps;const b1=f==='b1'?false:(P.ps?PS:bEnd);
    const idle=(P.logic==='casc'?st.k===0:true)&&a0&&b0&&st.vA<0&&st.vB<0;
    if(P.auto&&P.cyc==='single'&&idle){st.idle+=dt;if(st.idle>2){st.idle=0;st.s1=.5;}}else st.idle=0;if(P.auto&&P.cyc==='cont'&&st.t<.1)st.s1=.5;
    st.s1=Math.max(0,st.s1-dt);const S1=st.s1>0,CONT=P.cyc==='cont'&&(P.auto||st.tcy>0||st.cyc>0||st.started);if(S1)st.started=true;
    const on={S1,CONT:P.cyc==='cont'&&!!st.started,a0,a1,b0,b1,T1:st.tT>=P.tdw};
    if(P.logic==='casc'){const q=SEQ57[P.seq],ok=n=>({a0,a1,b0,b1}[n]);
      if(st.k===0&&(S1||on.CONT)&&a0&&b0){st.k=1;st.tc0=st.t;}
      else if(st.k===1&&ok(q.end[0]))st.k=2;else if(st.k===2&&b1&&on.T1)st.k=3;else if(st.k===3&&ok(q.end[2]))st.k=4;else if(st.k===4&&ok(q.end[3])){st.k=0;st.cyc++;st.tcy=st.t-st.tc0;}
      [1,2,3,4].forEach(n=>on['K'+n]=st.k===n);}
    const out=ladRun(rungs57(P),on,true);st.tT=out.T1?st.tT+dt:0;
    const Y1=!!out.Y1,Y2=!!out.Y2&&f!=='y2',Y3=!!out.Y3,Y4=!!out.Y4;const cA=Y1&&Y2,cB=Y3&&Y4;
    if(Y1&&!Y2)st.vA=1;else if(Y2&&!Y1)st.vA=-1;if(Y3&&!Y4)st.vB=1;else if(Y4&&!Y3)st.vB=-1;
    const mA=st.vA>0?st.xa<S:st.xa>0,mB=st.vB>0?st.xb<S:st.xb>0;const n=(mA?1:0)+(mB?1:0),Qe=n?P.Q/n:0;
    const was=st.xa>=S-1&&st.xb<=1;st.xa=clamp(st.xa+st.vA*(mA?H.v(Qe,st.vA>0?AA:H.Aann(P.DA,P.dr)):0)*dt,0,S);st.xb=clamp(st.xb+st.vB*(mB?H.v(Qe,st.vB>0?AB:H.Aann(P.DB,P.dr)):0)*dt,0,S);
    if(P.logic==='direct'&&st.xa<=1&&st.xb<=1&&st.wasOut){st.cyc++;st.tcy=st.t-st.tc0;st.tc0=st.t;st.wasOut=false;}if(st.xa>=S-1)st.wasOut=true;if(P.logic==='direct'&&S1&&st.xa<=1)st.tc0=st.t;
    st.stuck=(!mA&&!mB&&!idle)?st.stuck+dt:0;
    KIT.ease(st,'iA',st.vA>0?0:1,dt,10);KIT.ease(st,'iB',st.vB>0?0:1,dt,10);KIT.rpmAng(st,dt,1450);
    if(!st.h.length||st.t-st.h.at(-1)[0]>.1){st.h.push([st.t,1.25+st.xa/S,st.xb/S]);if(st.h.length>220)st.h.shift();}const t0=st.h[0][0],pm=KIT.nice(P.pr*1.05);
    const pA=st.vA>0?(mA?8:P.pr):.5,pP=n?Math.max(mA?8:0,mB?(st.vB>0?H.p(P.FB,AB):6):0):P.pr;
    return {p:{P:pP,AA:st.vA>0?(mA?pP:P.pr):.5,AB:st.vA<0?(mA?pP:P.pr):.5,BA:pBA,BB:st.vB<0?(mB?pP:P.pr):.5,T:.5,S:-.05},
      q:{LP:P.Q,LS:P.Q,LPA:mA?Qe:0,LPB:mB?Qe:0,LAA:mA?st.vA*Qe:0,LAB:mA?-st.vA*Qe*.75:0,LBA:mB?st.vB*Qe:0,LBB:mB?-st.vB*Qe*.6:0,LRV:n?0:P.Q,LRT:n?0:P.Q,LTA:mA?Qe*.8:0,LTB:mB?Qe*.8:0,LGB:0},
      pmax:pm,qref:P.Q,out,on,Y:[Y1,Y2,Y3,Y4],cA,cB,mA,mB,PS,pBA,
      c:{LD:{pw:true,on},SQ:{k:P.logic==='casc'?st.k:-1},CA:{x:st.xa/S,uA:(st.vA>0?pP:.5)/pm,uB:(st.vA<0?pP:.5)/pm},CB:{x:st.xb/S,uA:pBA/pm,uB:(st.vB<0?pP:.5)/pm},VA:{i:st.iA},VB:{i:st.iB},P1:{on:true,ang:st.ang},
        LA0:{on:a0},LA1:{on:a1},LB0:{on:b0},LB1:{on:b1},CH:{s:[{p:st.h.map(a=>[a[0],a[1]]),c:'#ea580c'},{p:st.h.map(a=>[a[0],a[2]]),c:'#0b72d9'}],x:[t0,Math.max(t0+20,st.t)],y:[-.05,2.3]}},
      read:[{k:'שלב (לוגיקת שלבים)',v:P.logic==='casc'?st.k:0,u:'',dg:0},{k:'Y1 A+',v:Y1?1:0,u:'',max:1,w:cA},{k:'Y2 A−',v:Y2?1:0,u:'',max:1,w:cA},{k:'Y3 B+',v:Y3?1:0,u:'',max:1,w:cB},{k:'Y4 B−',v:Y4?1:0,u:'',max:1,w:cB},
        {k:'לחץ B (מתג לחץ)',v:pBA,u:'bar',max:P.pr},{k:'מחזורים',v:st.cyc,u:'',dg:0},{k:'זמן מחזור אחרון',v:st.tcy||0,u:'s'}]};},
  ins(P,R){const L=[];
    if(R.cA||R.cB)L.push({ic:'⚠️',at:R.cA?'VA':'VB',w:true,h:`חפיפת אותות: שני הסולנואידים של שסתום ${R.cA?'A':'B'} מופעלים יחד (${R.cA?'Y1+Y2':'Y3+Y4'}). הספול נשאר במקום והמחזור נתקע. פתרון: לוגיקת שלבים (זיכרון) או ביטול האות הישן.`,c:'חפיפת אותות'});
    if(P.logic==='casc')L.push({ic:'🪜',at:'SQ',h:'לוגיקת שלבים: בכל רגע רק ממסר שלב אחד פעיל (K1…K4), ולכן רק סולנואיד אחד מקבל זרם – אין חפיפה בשום רצף.'});
    else L.push({ic:'🔌',at:'LD',h:P.seq==='ABab'?'ב-A+ B+ A− B− כל חיישן מפעיל סולנואיד אחד, ואף פעם לא שני סולנואידים של אותו שסתום – הלוגיקה הישירה עובדת.':'ב-A+ B+ B− A− החיישנים a1 ו-b1 פעילים יחד, וגם b0 פעיל בהתחלה – לכן שני סולנואידים "מושכים" נגד זה את זה.'});
    if(P.ps)L.push({ic:'📈',at:'GB',h:`מתג לחץ: B נחשב "סגור" רק כשהלחץ מגיע ל-${fmt(P.pps,0)} bar – הוכחה שההידוק באמת חזק, לא רק שהבוכנה במקום.`});
    if(R.mA&&R.mB)L.push({ic:'➗',at:'P1',h:'שני הצילינדרים זזים יחד: הספיקה מתחלקת וכל אחד זז לאט יותר.'});return L;},
  calc(P,R){const AA=H.A(P.DA),AB=H.A(P.DB);const tA=P.S/H.v(P.Q,AA),tAr=P.S/H.v(P.Q,H.Aann(P.DA,P.dr)),tB=P.S/H.v(P.Q,AB),tBr=P.S/H.v(P.Q,H.Aann(P.DB,P.dr));
    return `<div class="kpis">${kpi('A+',fmt(tA,2),'s')}${kpi('B+',fmt(tB,2),'s')}${kpi('A−',fmt(tAr,2),'s')}${kpi('B−',fmt(tBr,2),'s')}</div>`+
    det('זמן מחזור',row('',`t = t_A+ + t_B+ + T1 + t_A− + t_B− = ${fmt(tA,2)} + ${fmt(tB,2)} + ${P.tdw} + ${fmt(tAr,2)} + ${fmt(tBr,2)} = ${V(tA+tB+P.tdw+tAr+tBr,'s')}`),true)+
    det('לוגיקה',row('',P.logic==='casc'?'שלב n פעיל → סולנואיד אחד; מעבר שלב כשחיישן הסיום של השלב פעיל':P.seq==='ABab'?'Y1 = (הפעלה+רציף)·a0·b0 ; Y3 = a1 ; T1 = b1 ; Y2 = T1 ; Y4 = a0':'Y1 = (הפעלה+רציף)·b0 ; Y3 = a1 ; T1 = b1 ; Y4 = T1 ; Y2 = b0 ← חפיפה'))+
    det('מתג לחץ',row('',`p_B = F/A = ${fmt(P.FB,0)}·10/${fmt(AB,0)} = ${V(H.p(P.FB,AB),'bar')} בזמן תנועה; בסוף מהלך → ${P.pr} bar`));},
  demo:[{t:'A+ B+ A− B−',x:'A מזין, B מהדק, A חוזר, B משחרר. כל חיישן מפעיל את הסולנואיד הבא בסולם, והדיאגרמה מתחת מציירת את המחזור.',reset:true,set:{seq:'ABab',logic:'direct',cyc:'cont',ps:false,auto:true},hl:['LD','CH'],dur:10},
    {t:'מתג לחץ',x:'במקום b1, מתג לחץ: B "גמר" רק כשהלחץ עולה לכיול – ההידוק מוכח בכוח.',set:{ps:true},hl:['GB','CB'],dur:8},
    {t:'חפיפת אותות',x:'רצף A+ B+ B− A− באותה לוגיקה ישירה: b0 ו-לחצן ההפעלה מפעילים את Y1 ו-Y2 יחד – שום דבר לא זז.',set:{seq:'ABba',ps:false},hl:['VA','LD'],dur:7},
    {t:'לוגיקת שלבים',x:'עם זיכרון שלבים (K1…K4) רק סולנואיד אחד פעיל בכל רגע – אותו רצף עובד.',set:{logic:'casc'},hl:['SQ','LD'],dur:12}],
  predict:[{q:'רצף A+ B+ B− A− בלוגיקה ישירה מחיישנים. מה יקרה כשלוחצים לחצן ההפעלה?',set:{seq:'ABba',logic:'direct',cyc:'single',auto:false},opts:['המחזור יעבוד','A לא יזוז – Y1 ו-Y2 פעילים יחד','B ייצא ראשון'],a:1,why:'b0 פעיל במצב התחלה ומפעיל את Y2 (A−) בזמן ש-לחצן ההפעלה מפעיל את Y1 (A+).'},
    {q:'מגדילים את כיול מתג הלחץ מעל לחץ שסתום הפריקה. מה יקרה?',set:{seq:'ABab',logic:'direct',ps:true,pps:120,pr:100,cyc:'cont'},opts:['המחזור יימשך רגיל','המחזור ייתקע עם B בחוץ'],a:1,why:'הלחץ לא יכול לעלות מעל שסתום הפריקה – המתג אף פעם לא נסגר.'}],
  tasks:[{q:P=>`Q = ${P.Q} L/min, A: Ø${P.DA}, B: Ø${P.DB}, מוט בוכנה ${P.dr}, מהלך ${P.S} mm, T1 = ${P.tdw} s. מה זמן המחזור?`,a:P=>P.S/H.v(P.Q,H.A(P.DA))+P.S/H.v(P.Q,H.A(P.DB))+P.tdw+P.S/H.v(P.Q,H.Aann(P.DA,P.dr))+P.S/H.v(P.Q,H.Aann(P.DB,P.dr)),u:'s',hint:'סכום ארבעת המהלכים + ההשהיה.',rand:P=>{P.Q=rnd(8,30,2);P.tdw=pick([0,.5,1,2]);}}],
  faults:[{id:'b1',t:'חיישן b1 תקול (לא נדלק)',sym:'"B יוצא ונשאר בחוץ, המחזור נעצר."',hint:'בדקו אילו חיישנים דולקים כשהמחזור עומד.',why:'בלי b1 הטיימר לא מתחיל ו-A− לא מופעל.',set:{seq:'ABab',logic:'direct',cyc:'cont',ps:false,auto:true}},
    {id:'y2',t:'סליל Y2 (A−) שרוף',sym:'"A לא חוזר אף פעם."',hint:'השוו את מה שהסולם מפעיל למה שהשסתום עושה.',why:'Y2 לא מושך – שסתום A נשאר במצב A+.',set:{seq:'ABab',logic:'direct',cyc:'cont',ps:false,auto:true}},
    {id:'a0',t:'חיישן a0 תקוע במצב פעיל',sym:'"B לא יוצא, ולפעמים שומעים את השסתום מזמזם."',hint:'מה מצב Y3 ו-Y4 כש-A בחוץ?',why:'a0 תקוע מפעיל את Y4 כל הזמן – יחד עם Y3 יש חפיפה ו-B לא זז.',set:{seq:'ABab',logic:'direct',cyc:'cont',ps:false,auto:true}}],
  qaT:14,
  test(H){const P=clone(this.P);const st=this.init(P);for(let k=0;k<3000;k++)this.step(P,st,.01,{fault:null});const P2=clone(P);P2.seq='ABba';const s2=this.init(P2);let conf=0;for(let k=0;k<800;k++){const R=this.step(P2,s2,.01,{fault:null});if(R.cA||R.cB)conf=1;}
    const P3=clone(P2);P3.logic='casc';const s3=this.init(P3);for(let k=0;k<3000;k++)this.step(P3,s3,.01,{fault:null});
    const tc=P.S/H.v(P.Q,H.A(P.DA))+P.S/H.v(P.Q,H.A(P.DB))+P.tdw+P.S/H.v(P.Q,H.Aann(P.DA,P.dr))+P.S/H.v(P.Q,H.Aann(P.DB,P.dr));
    return [['A+B+A−B− ישיר: מחזורים רצים',+(st.cyc>=2),1],['זמן מחזור = סכום המהלכים',st.tcy,tc,.04],['A+B+B−A− ישיר: חפיפת אותות',conf,1],['A+B+B−A− בשלבים: עובד',+(s3.cyc>=2),1]];}};

LABS.push({ch:21,title:'בקרה אלקטרו-הידראולית',sims:[SIM_LAD,SIM_SEQ]});
}
