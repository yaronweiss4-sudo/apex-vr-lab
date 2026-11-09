/* lab 20 – same code as the website */
{




/* ===================== Chapter 20 – closed-loop systems (sims 54, 55) ===================== */

/* ---------- chapter symbols ---------- */
/* over-centre pump: the platform pump + a second triangle (flow both ways) */
SYM.pumpbi={ports:SYM.pump.ports,bb:SYM.pump.bb,draw(g,o){const u=SYM.pump.draw(g,o);SP(g,'M0,18 L-7,6 L7,6Z','syf');return u;}};B3.pumpbi=B3.pump;
/* flushing (hot-oil) shuttle: vertical 3-position spool. A top, B bottom, O right. cs:{s:+1 A high … −1 B high} */
SYM.flush={ports:o=>({A:[0,-30],B:[0,30],O:[26,0]}),bb:o=>[-24,-30,28,30],
  draw(g,o){SL(g,0,-30,0,-8);SL(g,0,30,0,8);SL(g,26,0,12,0);SP(g,'M0,-26 H-20 V-24','sy pil');SP(g,'M0,26 H-20 V24','sy pil');
    const sg=sv('g',{class:'spool'},g);[-16,0,16].forEach(yc=>{SR(sg,-12,yc-8,24,16,'syb');});
    SA(sg,0,-8,11,-16,'sy',3.5);SL(sg,0,-24,0,-21);SL(sg,-3,-21,3,-21);                    // section y=-16: B→O (A high)
    SL(sg,0,-8,0,-4);SL(sg,-3,-4,3,-4);SL(sg,0,8,0,4);SL(sg,-3,4,3,4);SL(sg,12,0,8,0);SL(sg,8,-3,8,3);  // neutral
    SA(sg,0,8,11,16,'sy',3.5);SL(sg,0,24,0,21);SL(sg,-3,21,3,21);                          // section y=+16: A→O (B high)
    SP(g,zig(-12,-30,-12,-26,2,2),'sy thin');
    return cs=>{const s=clamp(cs?cs.s:0,-1,1);sg.setAttribute('transform',`translate(0,${16*s})`);};}};
B3.flush=(c,o)=>{const M=m3(),g=new THREE.Group();g.add(edges(at(box3(24,52,18,M.alu),0,0,9)));const ind=at(box3(18,4,3,M.red),0,0,19);g.add(ind);return {g,upd(cs){ind.position.y=-16*clamp(cs?cs.s:0,-1,1);}};};
/* road wheel driven by the motor shaft. cs:{ang rad, gr grade %} */
SYM.veh={ports:o=>({}),bb:o=>[-36,-26,32,30],
  draw(g,o){SL(g,-34,0,-22,0,'sy thick');const wg=sv('g',{},g);SC(wg,0,0,22,'syb');SC(wg,0,0,15,'sy thin');[0,60,120].forEach(a=>{const r=a*PI/180;SL(wg,-15*Math.cos(r),-15*Math.sin(r),15*Math.cos(r),15*Math.sin(r),'sy');});
    const gr=SL(g,-30,23,30,23,'sy');return cs=>{wg.setAttribute('transform',`rotate(${((cs&&cs.ang)||0)*57.3})`);gr.setAttribute('transform',`rotate(${-Math.atan((cs&&cs.gr)||0)*57.3})`);};}};
B3.veh=(c,o)=>{const M=m3(),g=new THREE.Group();g.add(at(cyl3(3,14,M.steel,'x'),-28,0,15));const w=new THREE.Group();w.position.set(0,0,15);w.add(cyl3(22,14,M.black,'z'));w.add(at(cyl3(12,15,M.alu,'z'),0,0,0));
  w.add(at(box3(4,20,16,M.orange),0,0,0));g.add(w);return {g,upd(cs){w.rotation.z=-((cs&&cs.ang)||0);}};};
/* parallel-hybrid driveline: diesel → shaft → wheel, with the pump/motor geared on at the middle. cs:{ang, eu 0…1 engine load, brk 0…1} */
SYM.drive={ports:o=>({}),bb:o=>[-188,-36,184,28],
  draw(g,o){const eb=SR(g,-185,-17,56,34,'syb');ST(g,-157,4,'דיזל','st s');SL(g,-129,0,126,0,'sy thick');SL(g,0,-34,0,-7,'sy thick');SC(g,0,0,7,'syb');SC(g,0,-12,5,'syb');
    const wg=sv('g',{},g);SC(wg,150,0,24,'syb');[0,60,120].forEach(a=>{const r=a*PI/180;SL(wg,150-16*Math.cos(r),-16*Math.sin(r),150+16*Math.cos(r),16*Math.sin(r),'sy');});
    const bk=SR(g,170,-8,8,16,'syf2');SL(g,112,26,184,26,'sy thin');
    return cs=>{wg.setAttribute('transform',`rotate(${((cs&&cs.ang)||0)*57.3},150,0)`);eb.style.fill=cs&&cs.eu>.02?`rgba(234,88,12,${.15+.6*clamp(cs.eu,0,1)})`:'';bk.style.fill=cs&&cs.brk>.02?'#dc2626':'';};}};
B3.drive=(c,o)=>{const M=m3(),g=new THREE.Group();const eng=edges(at(box3(56,34,30,M.dark),-157,0,15));g.add(eng);g.add(at(cyl3(3.5,255,M.steel,'x'),-1,0,15));g.add(at(cyl3(8,6,M.alu,'z'),0,0,15));
  const w=new THREE.Group();w.position.set(150,0,15);w.add(cyl3(24,16,M.black,'z'));w.add(at(box3(4,24,18,M.orange),0,0,0));g.add(w);const bk=at(box3(8,16,10,M.red),174,0,15);g.add(bk);
  return {g,upd(cs){w.rotation.z=-((cs&&cs.ang)||0);bk.visible=!!(cs&&cs.brk>.02);}};};

/* ---------- 54 · hydrostatic transmission (closed loop) ---------- */
/* dynamic loop: two line volumes (compressibility), motor + vehicle inertia, charge node solved each sub-step */
function hst54(P,st,dt,f){const n=Math.max(1,Math.ceil(dt/4e-4)),h=dt/n,K=14000,VL=P.VL;
  const J=P.m*P.rw*P.rw/(P.ig*P.ig)+.05,th=Math.atan(P.gr/100),TLg=P.m*9.81*Math.sin(th)*P.rw/P.ig,TLr=P.m*9.81*Math.cos(th)*P.crr*P.rw/P.ig;
  const pHA=f==='hpr'?120:P.phr,pHB=P.phr,Qc=f==='charge'?1.5:P.Qc,Ci=.015,Ce=.004,kr=3,km=6,kf=f==='flush'?0:1.2,kcr=3;
  const A={Qr:0,Qf:0,Qe:0,Pl:0,Qp:0,cav:false,pc:st.pc||P.pch,mk:0,Pm:0};
  for(let i=0;i<n;i++){st.al+=clamp(st.ac-st.al,-P.ramp*h,P.ramp*h);
    const pA=st.pA,pB=st.pB,dp=pA-pB,plow=Math.min(pA,pB);const fill=plow<2?clamp((plow+.9)/2.9,.25,1):1;if(fill<1&&Math.abs(st.al)>.05)A.cav=true;
    const Qp=st.al*P.Vp*P.ne/1000*fill,Qm=P.Vm*st.w*60/(2*PI)/1000,Qi=Ci*dp,Qe=Ce*Math.max(pA,pB,0);
    const QrA=kr*Math.max(0,pA-pHA),QrB=kr*Math.max(0,pB-pHB),hiA=pA>=pB,Qf=Math.abs(dp)>8?kf*Math.max(0,plow-P.pfr):0;
    const out=pc=>km*Math.max(0,pc-pA)+km*Math.max(0,pc-pB)+kcr*Math.max(0,pc-P.pch);const pc=H.bisect(pc=>Qc-out(pc),-.9,P.pch+Qc/kcr+5,30);
    const mkA=km*Math.max(0,pc-pA),mkB=km*Math.max(0,pc-pB);
    const dA=Qp-Qm-Qi-QrA+QrB+mkA-(hiA?Qe:0)-(hiA?0:Qf),dB=-Qp+Qm+Qi+QrA-QrB+mkB-(hiA?0:Qe)-(hiA?Qf:0);
    st.pA=Math.max(-.9,pA+K*dA/60/VL*h);st.pB=Math.max(-.9,pB+K*dB/60/VL*h);
    const Tm=dp*P.Vm/(20*PI);let Tl=TLg+TLr*Math.sign(st.w);
    if(Math.abs(st.w)<.3&&Math.abs(Tm-TLg)<=TLr){st.w=0;}else{if(Math.abs(st.w)<.3)Tl=TLg+TLr*Math.sign(Tm-TLg);st.w+=(Tm-Tl-.02*st.w)/J*h;}
    const k=h/(dt||1);A.Qr+=(QrA+QrB)*k;A.Qf+=Qf*k;A.Qe+=Qe*k;A.Qp+=Qp*k;A.mk+=(mkA+mkB)*k;A.Pm+=Tm*st.w/1000*k;
    A.Pl+=(Math.abs(Qi*dp)+(QrA+QrB)*Math.abs(dp)+Qe*Math.max(pA,pB,0))/600*k;A.pc=pc;}
  if(!dt){const pA=st.pA,pB=st.pB;A.Qp=st.al*P.Vp*P.ne/1000;A.Qe=Ce*Math.max(pA,pB,0);}
  st.pc=A.pc;A.Pb=.15+.5*Math.abs(A.Qp)/(P.Vp*P.ne/1000);const dTe=(A.Pl+A.Pb)*36.4/Math.max(A.Qf+A.Qe,1);st.T+=(P.Ta+dTe-st.T)*Math.min(1,dt/6);st.T=Math.min(st.T,140);
  return A;}
const SIM_HST={id:'hst',n:54,t:'תמסורת הידרוסטטית',d:'משאבה משתנה עוברת-מרכז ומנוע במעגל סגור: מהירות וכיוון בידית אחת, משאבת הזנה, ביטחונים מצולבים, שטיפה ובלימה הידרוסטטית',
  P:{auto:true,ac:0,ramp:.8,gr:0,m:3000,ne:2200,Vp:45,Vm:45,Qc:12,pch:20,pfr:14,phr:380,VL:1,rw:.4,ig:20,crr:.03,Ta:45},
  key:P=>'h',
  ui(U,P){U.grp('נהיגה');U.chk(P,'auto','מחזור נסיעה אוטומטי');U.num(P,'ac','ידית נסיעה (דיסקה נטויה)','−1…1',{min:-1,max:1,step:.1});U.num(P,'gr','שיפוע (+ עלייה)','%',{min:-20,max:25,step:1});U.num(P,'ramp','קצב שינוי הידית','1/s',{min:.2,max:5,step:.1});
    U.grp('נתונים',false);U.num(P,'m','מסת רכב','kg',{min:500,max:15000,step:100});U.num(P,'ne','סיבובי מנוע דיזל','rpm',{min:800,max:3000,step:100});U.num(P,'Vp','נפח סגולי מרבי','cm³/rev',{min:10,max:250,step:1});U.num(P,'Vm','נפח מנוע','cm³/rev',{min:10,max:250,step:1});
    U.num(P,'Qc','ספיקת משאבת הזנה','L/min',{min:1,max:40,step:1});U.num(P,'pch','שסתום פריקה טעינה','bar',{min:8,max:35,step:1});U.num(P,'phr','ביטחונים מצולבים','bar',{min:100,max:450,step:10});},
  circuit:P=>({comps:[
      {id:'P1',type:'pumpbi',x:130,y:220,o:{var:true},name:'משאבה משתנה עוברת-מרכז (דיסקה נטויה)',lbl:'משאבה ראשית',lblAt:[-40,40]},
      {id:'CP',type:'pump',x:175,y:262,o:{motor:false},name:'משאבת הזנה (על אותו ציר)',lbl:'טעינה',lblAt:[0,38]},{id:'T5',type:'tank',x:175,y:292,name:'מיכל'},
      {id:'CA',type:'check',x:210,y:135,name:'אל-חוזר טעינה לצד A'},{id:'CB',type:'check',x:210,y:305,rot:180,name:'אל-חוזר טעינה לצד B'},
      {id:'CR',type:'pv',x:255,y:220,rot:90,o:{kind:'relief'},name:'שסתום פריקה טעינה',lbl:'פריקה טעינה',lblAt:[0,-24]},{id:'T6',type:'tank',x:290,y:238,name:'מיכל'},
      {id:'RA',type:'pv',x:340,y:220,rot:180,o:{kind:'relief'},name:'שסתום פריקה A→B',lbl:'A→B',lblAt:[-30,0]},{id:'RB',type:'pv',x:410,y:220,o:{kind:'relief'},name:'שסתום פריקה B→A',lbl:'B→A',lblAt:[30,0]},
      {id:'FV',type:'flush',x:490,y:220,name:'שסתום שטיפה (Hot-oil shuttle)',lbl:'שטיפה',lblAt:[0,-42]},{id:'FR',type:'pv',x:545,y:220,rot:90,o:{kind:'relief'},name:'שסתום פריקה שטיפה (לפני המצנן)',lbl:'',lblAt:[0,-24]},{id:'T7',type:'tank',x:575,y:238,name:'מיכל דרך מצנן'},
      {id:'M1',type:'motor',x:620,y:220,o:{bi:true},name:'מנוע הידראולי',lbl:'מנוע',lblAt:[0,40]},{id:'W1',type:'veh',x:712,y:220,name:'גלגל הרכב'},
      {id:'GA',type:'gauge',x:270,y:88,net:'A',name:'מד לחץ A'},{id:'GB',type:'gauge',x:270,y:328,net:'B',name:'מד לחץ B'},{id:'GC',type:'gauge',x:186,y:180,net:'C',name:'מד לחץ טעינה'},
      {id:'CH',type:'chart',x:250,y:470,o:{w:230,h:100,xl:'זמן',yl:'km/h',t:'מהירות (כחול) · ידית ×מהירות מרבית (כתום)'},name:'גרף מהירות'},
      {id:'CP2',type:'chart',x:540,y:470,o:{w:230,h:100,xl:'זמן',yl:'bar',t:'לחץ A (אדום) · B (כחול)'},name:'גרף לחצים'}],
    lines:[{id:'LA',net:'A',pts:['P1.out',[130,100],[620,100],'M1.A']},{id:'LB',net:'B',pts:['P1.in',[130,340],[620,340],'M1.B']},
      {id:'LGA',net:'A',pts:[[270,100],'GA.p'],nodot:true},{id:'LGB',net:'B',pts:[[270,340],'GB.p'],nodot:true},
      {id:'LCS',net:'S',pts:['T5.t','CP.in']},{id:'LCP',net:'C',pts:['CP.out',[175,220],[210,220]]},{id:'LCG',net:'C',pts:['CA.in','CB.in']},{id:'LGC',net:'C',pts:[[210,192],'GC.p'],nodot:true},
      {id:'LCA',net:'A',pts:['CA.out',[210,100]]},{id:'LCB',net:'B',pts:['CB.out',[210,340]]},{id:'LCR',net:'C',pts:[[210,220],'CR.P']},{id:'LCT',net:'T',pts:['CR.T',[290,220],'T6.t']},
      {id:'LRA1',net:'A',pts:[[340,100],'RA.P']},{id:'LRA2',net:'B',pts:['RA.T',[340,340]]},{id:'LRB1',net:'B',pts:[[410,340],'RB.P']},{id:'LRB2',net:'A',pts:['RB.T',[410,100]]},
      {id:'LFA',net:'A',kind:'pilot',pts:[[490,100],'FV.A']},{id:'LFB',net:'B',kind:'pilot',pts:[[490,340],'FV.B']},{id:'LFO',net:'F',pts:['FV.O','FR.P']},{id:'LFT',net:'T',pts:['FR.T',[575,220],'T7.t']}]}),
  init:P=>({t:0,al:0,ac:0,w:0,ang:0,wa:0,pA:P.pch,pB:P.pch,pc:P.pch,T:P.Ta,h:[]}),
  step(P,st,dt,ctx){const f=ctx.fault;st.t+=dt;if(P.auto){const ph=st.t%20;P.ac=ph<1?0:ph<8?1:ph<11?0:ph<16?-.6:0;}st.ac=P.ac;
    const A=hst54(P,st,dt,f);const dp=st.pA-st.pB,nm=st.w*60/(2*PI),v=st.w/P.ig*P.rw*3.6,vmax=P.Vp*P.ne/P.Vm*2*PI/60/P.ig*P.rw*3.6;
    st.wa=(st.wa+st.w*dt*.12)%(2*PI*1000);KIT.rpmAng(st,dt,P.ne);
    if(!st.h.length||st.t-st.h.at(-1)[0]>.1){st.h.push([st.t,v,st.al*vmax,st.pA,st.pB]);if(st.h.length>200)st.h.shift();}
    const pm=KIT.nice(P.phr*1.05),t0=st.h[0][0],tx=[t0,Math.max(t0+12,st.t)],vm=KIT.nice(Math.max(5,vmax)*1.05);const brk=A.Pm<-.2;
    const hiA=st.pA>=st.pB,lowAvg=Math.min(st.pA,st.pB);
    return {p:{A:st.pA,B:st.pB,C:A.pc,S:-.05,T:.5,F:A.Qf>.05?P.pfr:.5},
      q:{LA:A.Qp,LB:-A.Qp,LGA:0,LGB:0,LCS:f==='charge'?1.5:P.Qc,LCP:f==='charge'?1.5:P.Qc,LCG:0,LGC:0,LCA:hiA?0:A.mk,LCB:hiA?A.mk:0,LCR:Math.max(0,(f==='charge'?1.5:P.Qc)-A.mk),LCT:Math.max(0,(f==='charge'?1.5:P.Qc)-A.mk),
        LRA1:0,LRA2:0,LRB1:0,LRB2:0,LFA:0,LFB:0,LFO:A.Qf,LFT:A.Qf},
      pmax:pm,qref:P.Vp*P.ne/1000,vac:A.cav,A,v,nm,dp,brk,vmax,
      c:{P1:{on:true,ang:st.ang},CP:{on:true,ang:st.ang},M1:{ang:st.wa},W1:{ang:st.wa/P.ig*4,gr:P.gr/100},FV:{s:Math.abs(dp)>8?(hiA?1:-1):0},CA:{open:!hiA&&A.mk>.1?1:0},CB:{open:hiA&&A.mk>.1?1:0},
        CH:{s:[{p:st.h.map(a=>[a[0],a[1]]),c:'#0b72d9'},{p:st.h.map(a=>[a[0],a[2]]),c:'#ea580c',d:true}],x:tx,y:[-vm,vm]},
        CP2:{s:[{p:st.h.map(a=>[a[0],a[3]]),c:'#dc2626'},{p:st.h.map(a=>[a[0],a[4]]),c:'#0b72d9'}],x:tx,y:[0,pm]}},
      read:[{k:'ידית (α)',v:st.al*100,u:'%',max:100},{k:'מהירות רכב',v:v,u:'km/h'},{k:'סיבובי מנוע',v:nm,u:'rpm'},{k:'לחץ A',v:st.pA,u:'bar',max:P.phr,w:A.Qr>.5&&hiA},{k:'לחץ B',v:st.pB,u:'bar',max:P.phr,w:A.Qr>.5&&!hiA},
        {k:'לחץ טעינה',v:A.pc,u:'bar',max:P.pch*1.5,w:A.pc<P.pch*.6},{k:'ספיקת שטיפה',v:A.Qf,u:'L/min'},{k:'ספיקה בשסתום הפריקה',v:A.Qr,u:'L/min',w:A.Qr>.5},{k:'טמפ׳ בלולאה',v:st.T,u:'°C',dg:0,max:100,w:st.T>85}]};},
  ins(P,R){const A=R.A,L=[];
    L.push({ic:'🔄',at:'P1',h:`מעגל סגור: השמן שיוצא מהמנוע חוזר ישר לכניסת המשאבה. הטיית לוח הסחרור – עכשיו ${fmt(R.read[0].v,0)}% – קובעת מהירות <b>וכיוון</b> – בלי שסתום פיקוד.`});
    if(R.brk)L.push({ic:'🛑',at:'M1',h:`הרכב דוחף את המנוע: הוא עובד כמשאבה והלחץ עולה בצד ${R.dp<0?'B':'A'} (${fmt(Math.max(R.p.A,R.p.B),0)} bar) – בלימה הידרוסטטית בלי בלמים.`,c:'בלימה הידרוסטטית'});
    if(A.Qr>.5)L.push({ic:'🛡',at:R.dp>0?'RA':'RB',w:true,h:`ביטחון מצולב פתוח: ${fmt(A.Qr,1)} L/min עוברים מהצד הגבוה לנמוך – המומנט מוגבל והשמן מתחמם.`});
    L.push({ic:'⛽',at:'CP',h:`משאבת ההזנה משלימה דרך האל-חוזרים את מה שיוצא מהלולאה (דליפה ${fmt(A.Qe,1)} + שטיפה ${fmt(A.Qf,1)} L/min). הצד הנמוך נשאר ב-${fmt(A.pc,0)} bar.`});
    if(A.cav)L.push({ic:'🫧',at:'P1',w:true,h:'הצד הנמוך בוואקום: משאבת ההזנה לא מספיקה, המשאבה הראשית לא מתמלאת – רעש, איבוד מהירות ונזק.',c:'קוויטציה'});
    if(R.read[8].v>85)L.push({ic:'🌡',at:'FV',w:true,h:`הלולאה מתחממת (${fmt(R.read[8].v,0)}°C): אותו שמן מסתובב שוב ושוב, ובלי שטיפה החום לא יוצא.`,c:'חם מדי'});
    else if(A.Qf>.5)L.push({ic:'🌡',at:'FV',h:`שסתום השטיפה מוציא ${fmt(A.Qf,1)} L/min חמים מהצד הנמוך למצנן, ומשאבת ההזנה מכניסה שמן קר.`});
    return L;},
  calc(P,R){const A=R.A;const T=R.dp*P.Vm/(20*PI);return `<div class="kpis">${kpi('ספיקת משאבה',fmt(A.Qp,1),'L/min')}${kpi('סיבובי מנוע',fmt(R.nm,0),'rpm')}${kpi('מהירות',fmt(R.v,1),'km/h')}${kpi('Δp',fmt(R.dp,0),'bar')}</div>`+
    det('מהירות',row('',`Q_p = α·V_p·n_e = ${fmt(R.read[0].v/100,2)}·${P.Vp}·${P.ne}/1000 = ${V(A.Qp,'L/min')}`)+row('',`n_m ≈ (Q_p − דליפות)/V_m → אידאלי ${V(A.Qp*1000/P.Vm,'rpm',0)}, בפועל ${V(R.nm,'rpm',0)}`)+row('',`v = n_m/i·2π·r = ${V(R.v,'km/h')} (i = ${P.ig}, r = ${P.rw} m)`),true)+
    det('מומנט ולחץ',row('',`T = Δp·V_m/(20π) = ${fmt(R.dp,1)}·${P.Vm}/62.8 = ${V(T,'N·m')} (עומס + חיכוך צמיג 0.02·ω)`)+row('',`עומס בשיפוע: T_L = m·g·(sinθ + C_rr·cosθ)·r/i = ${V(P.m*9.81*(Math.sin(Math.atan(P.gr/100))+P.crr*Math.cos(Math.atan(P.gr/100)))*P.rw/P.ig,'N·m')}`))+
    det('טעינה ושטיפה',row('',`Q_flush = k·(p_low − p_FR) = ${V(A.Qf,'L/min')}`)+row('',`ΔT ≈ P_הפסד/(ρ·c·Q) = (${fmt(A.Pl+A.Pb,2)} kW)·36.4/${fmt(Math.max(A.Qf+A.Qe,1),1)} = ${V((A.Pl+A.Pb)*36.4/Math.max(A.Qf+A.Qe,1),'K')}`));},
  demo:[{t:'ידית אחת',x:'הידית מטה את לוח הסחרור של המשאבה. α חיובי – השמן יוצא ל-A והרכב נוסע קדימה; α שלילי – ל-B ואחורה. אין שסתום פיקוד.',reset:true,set:{auto:true,gr:0},hl:['P1','M1'],dur:8},
    {t:'בלימה הידרוסטטית',x:'מחזירים את הידית לאפס: הרכב ממשיך לסובב את המנוע, הלחץ קופץ בצד השני והרכב נבלם – בלי בלמים.',hl:['CP2','M1'],dur:6},
    {t:'משאבת הזנה',x:'הלולאה מאבדת שמן (דליפות ושטיפה). משאבת ההזנה מחזיקה את הצד הנמוך בלחץ דרך שני אל-חוזרים.',hl:['CP','CA','CB'],dur:6},
    {t:'שטיפה',x:'שסתום השטיפה מוציא שמן חם מהצד הנמוך דרך המצנן. בלי שטיפה, אותו שמן מסתובב ומתחמם.',hl:['FV','FR'],dur:6},
    {t:'עלייה ושיפוע',x:'בשיפוע 15% המומנט גדל, Δp עולה, והביטחונים המצולבים מגנים מעומס יתר.',set:{gr:15},hl:['RA','GA'],dur:8}],
  predict:[{q:'בנסיעה מלאה מחזירים את הידית לאפס. מה יקרה?',set:{auto:false,ac:1,gr:0},opts:['הרכב ימשיך בגלגול חופשי','הרכב ייבלם – הלחץ יעלה בצד B','הלחץ יעלה בצד A'],a:1,why:'המנוע ממשיך להסתובב מכוח האינרציה ודוחף שמן ל-B; המשאבה (α = 0) לא מקבלת אותו – הלחץ עולה ובולם.'},
    {q:'משאבת ההזנה נשחקת (1.5 L/min). מה יקרה בנסיעה?',set:{auto:true,gr:0},opts:['שום דבר – היא רק משלימה','הצד הנמוך יורד לוואקום – קוויטציה ואיבוד מהירות','הלחץ הגבוה יעלה'],a:1,why:'הלולאה מאבדת יותר שמן ממה שנכנס; הצד הנמוך מתרוקן.'}],
  tasks:[{q:P=>`V_p = ${P.Vp} cm³/rev, n_e = ${P.ne} rpm, α = ${fmt(P.ac,1)}, V_m = ${P.Vm} cm³/rev. מה מהירות המנוע (אידאלית)?`,a:P=>P.ac*P.Vp*P.ne/P.Vm,u:'rpm',hint:'n_m = α·V_p·n_e/V_m.',set:{auto:false},rand:P=>{P.ac=pick([.4,.5,.6,.8,1]);P.Vp=pick([28,45,56,71]);P.Vm=pick([28,45,56,80]);}},
    {q:P=>`מומנט נדרש במנוע ${fmt(P.m*.025,0)} N·m, V_m = ${P.Vm} cm³/rev. מה Δp?`,a:P=>20*PI*P.m*.025/P.Vm,u:'bar',hint:'Δp = 20π·T/V_m.',rand:P=>{P.m=rnd(2000,8000,500);P.Vm=pick([28,45,56,80]);}},
    {q:P=>`הפסדים בלולאה ${fmt(P.Qc/4,1)} kW וספיקת שטיפה ${P.Qc-4} L/min. בכמה מעלות השמן מתחמם?`,a:P=>P.Qc/4*36.4/(P.Qc-4),u:'K',hint:'ΔT = P/(ρ·c·Q), ρ·c ≈ 1.65 MJ/(m³·K) → ΔT = 36.4·P[kW]/Q[L/min].',rand:P=>{P.Qc=rnd(8,20,1);}}],
  faults:[{id:'charge',t:'משאבת הזנה שחוקה',sym:'"המכונה מרעישה ומאבדת כוח, במיוחד כשהשמן חם."',hint:'בדקו את לחץ הטעינה והצד הנמוך.',why:'ספיקת הטעינה קטנה מהדליפות + השטיפה: הצד הנמוך יורד לוואקום.',set:{auto:true,gr:0}},
    {id:'hpr',t:'שסתום פריקה A→B מכויל נמוך (120 bar)',sym:'"קדימה הרכב חלש ולא מאיץ, אחורה תקין."',hint:'מה הלחץ המרבי בצד A בזמן האצה?',why:'שסתום הפריקה נפתח ב-120 bar: המומנט קדימה מוגבל והשמן מתחמם.',set:{auto:true,gr:8}},
    {id:'flush',t:'שסתום השטיפה תקוע במרכז',sym:'"אחרי כמה דקות עבודה השמן רותח ויש ריח."',hint:'כמה שמן עובר למצנן?',why:'בלי שטיפה, החום שנוצר בלולאה לא יוצא – אותו שמן מסתובב.',set:{auto:true,gr:10}}],
  qaT:12,
  test(H){const P=clone(this.P);P.auto=false;const st=this.init(P);st.ac=1;hst54(P,st,10,null);for(let i=0;i<60;i++)hst54(P,st,.1,null);
    const dp=st.pA-st.pB,Qp=P.Vp*P.ne/1000,Qm=P.Vm*st.w*60/(2*PI)/1000,TL=P.m*9.81*P.crr*P.rw/P.ig;
    return [['רציפות: Q_m = Q_p − C_i·Δp − C_e·p_A',Qm,Qp-.015*dp-.004*st.pA,.01],['מומנט: Δp = 20π·(T_L + c·ω)/V_m',dp,20*PI*(TL+.02*st.w)/P.Vm,.03],['לחץ טעינה ≈ p_ch + עודף/k',st.pc,P.pch,.25],
      ['מהירות אידאלית ≈ α·V_p·n_e/V_m',st.w*60/(2*PI),P.Vp*P.ne/P.Vm,.03]];}};

/* ---------- 55 · hydraulic hybrid vehicle (parallel, accumulator) ---------- */
function acc55(P,Voil){const pa=(P.p0+1)*(P.V0/Math.max(P.V0-Voil,.5))**1.4;return {p:pa-1,E:Voil>0?((pa*(P.V0-Voil))-(P.p0+1)*P.V0)/(.4)*100/1000:0};}  // bar, kJ
function cycle55(P,t){const c=P.T1+P.T2+P.T3+P.T4,ph=t%c,vm=P.vmax/3.6;if(ph<P.T1)return {v:vm*ph/P.T1,a:vm/P.T1};if(ph<P.T1+P.T2)return {v:vm,a:0};if(ph<P.T1+P.T2+P.T3){const x=ph-P.T1-P.T2;return {v:vm*(1-x/P.T3),a:-vm/P.T3};}return {v:0,a:0};}
function hyb55(P,st,f,v,a,dt){const Vmax=f==='pm'?P.Vmax*.3:P.Vmax,Fres=P.m*9.81*.008+.5*1.2*P.CdA*v*v,Freq=P.m*a+(v>.05?Fres:0),w=v/P.rw*P.i;
  const ac=acc55(P,st.Vo),dp=Math.max(1,ac.p-P.pLP),Fmax=dp*Vmax/(20*PI)*P.i/P.rw;let Fh=0,Ff=0,Fe=0,mode='';
  const can=f!=='sv';
  if(Freq<0){if(can&&ac.p<P.pmax-.5&&v>.3)Fh=-Math.min(-Freq,Fmax);Ff=Freq-Fh;mode=Fh<0?'charge':'fric';}
  else{if(can&&ac.p>P.p0+3&&v>.05)Fh=Math.min(Freq,Fmax);Fe=Freq-Fh;mode=Fh>0?'assist':'engine';}
  const Ph=Fh*v,dV=Ph<0?-P.eta*Ph*dt/(dp*1e5)*1000:Ph>0?-Ph*dt/(P.eta*dp*1e5)*1000:0;
  return {Freq,Fh,Ff,Fe,Ph,dV,dp,Fmax,ac,w,mode,Q:Math.abs(dV)/Math.max(dt,1e-9)*60,x:Fmax>0?Math.abs(Fh)/Fmax:0};}
const SIM_HYB={id:'hyb',n:55,t:'רכב היברידי הידראולי',d:'משאית חלוקה בעצור-וסע: אנרגיית הבלימה נאגרת במצבר לחץ ומשמשת להאצה הבאה – וחוסכת דלק',
  P:{m:15000,vmax:40,T1:12,T2:6,T3:8,T4:4,Vmax:180,i:10,rw:.5,p0:150,V0:50,pmax:345,pLP:8,eta:.9,ee:.35,CdA:6},
  key:P=>'y',
  ui(U,P){U.grp('מחזור נסיעה');U.num(P,'vmax','מהירות שיוט','km/h',{min:10,max:80,step:5});U.num(P,'T1','זמן האצה','s',{min:4,max:30,step:1});U.num(P,'T3','זמן בלימה','s',{min:3,max:30,step:1});U.num(P,'m','מסת רכב','kg',{min:3000,max:40000,step:1000});
    U.grp('מערכת הידראולית',false);U.num(P,'p0','לחץ טעינה מוקדמת (גז)','bar',{min:30,max:250,step:5});U.num(P,'V0','נפח מצבר לחץ','L',{min:10,max:200,step:5});U.num(P,'pmax','לחץ מרבי','bar',{min:150,max:420,step:5});U.num(P,'Vmax','נפח משאבה/מנוע','cm³/rev',{min:40,max:500,step:10});},
  circuit:P=>({comps:[
      {id:'DR',type:'drive',x:300,y:350,name:'שרשרת הנעה: מנוע דיזל → ציר → גלגלים, עם משאבה/מנוע על תיבת העברה',lbl:'',lblAt:[0,0]},
      {id:'PM',type:'motor',x:300,y:270,rot:90,o:{bi:true,var:true},name:'משאבה/מנוע משתנה (P/M)',lbl:'P/M',lblAt:[40,16]},
      {id:'SV',type:'sv',x:450,y:220,name:'שסתום בידוד (פתוח כשהמערכת פעילה)',lbl:'בידוד',lblAt:[30,0]},
      {id:'HA',type:'accum',x:450,y:150,name:'מצבר לחץ גבוה (חנקן)',lbl:'מצבר HP',lblAt:[40,-10]},{id:'LA',type:'accum',x:150,y:150,name:'מצבר לחץ נמוך',lbl:'מצבר LP',lblAt:[-42,-10]},
      {id:'RH',type:'pv',x:300,y:215,rot:-90,o:{kind:'relief'},name:'שסתום פריקה',lbl:'פריקה',lblAt:[0,-26]},
      {id:'GH',type:'gauge',x:478,y:183,net:'H',name:'מד לחץ מצבר'},{id:'GL',type:'gauge',x:120,y:240,net:'L',name:'מד לחץ LP'},
      {id:'CH',type:'chart',x:190,y:480,o:{w:220,h:100,xl:'זמן',yl:'km/h',t:'מהירות (כחול) · לחץ מצבר/10 (אדום)'},name:'גרף מהירות ולחץ'},
      {id:'CF',type:'chart',x:460,y:480,o:{w:220,h:100,xl:'זמן',yl:'mL',t:'דלק מצטבר: היברידי (כתום) · רגיל (אפור)'},name:'גרף דלק'}],
    lines:[{id:'LPA',net:'A',pts:['PM.A',[450,270],'SV.in']},{id:'LSH',net:'H',pts:['SV.out','HA.p']},{id:'LGH',net:'H',pts:[[450,195],'GH.p'],nodot:true},
      {id:'LPB',net:'L',pts:['PM.B',[150,270],'LA.p']},{id:'LGL',net:'L',pts:[[150,252],'GL.p'],nodot:true},
      {id:'LRP',net:'A',pts:[[340,270],[340,215],'RH.P']},{id:'LRT',net:'L',pts:['RH.T',[260,215],[260,270]]}]}),
  init:P=>({t:0,Vo:0,ang:0,pa:0,Eh:0,Ec:0,Erec:0,Ebr:0,h:[]}),
  step(P,st,dt,ctx){const f=ctx.fault,p0=f==='p0'?40:P.p0,Pf={...P,p0};st.t+=dt;const cy=cycle55(P,st.t);const r=hyb55(Pf,st,f,cy.v,cy.a,dt);
    const Vmx=P.V0*(1-((p0+1)/(P.pmax+1))**(1/1.4));st.Vo=clamp(st.Vo+r.dV,0,Vmx);
    const ef=P.ee*.9;st.Eh+=Math.max(0,r.Fe)*cy.v*dt/ef;st.Ec+=Math.max(0,r.Freq)*cy.v*dt/ef;if(r.Freq<0){st.Ebr+=-r.Freq*cy.v*dt;st.Erec+=-r.Fh*cy.v*dt*P.eta;}
    st.ang+=r.w*dt*.15;st.pa+=r.w*dt*.15;const mL=E=>E/36e6*1000;const sav=st.Ec>1?1-st.Eh/st.Ec:0;
    if(!st.h.length||st.t-st.h.at(-1)[0]>.15){st.h.push([st.t,cy.v*3.6,r.ac.p/10,mL(st.Eh),mL(st.Ec)]);if(st.h.length>200)st.h.shift();}
    const pm=KIT.nice(P.pmax*1.05),t0=st.h[0][0],tx=[t0,Math.max(t0+30,st.t)];const ac2=acc55(Pf,st.Vo);const open=Math.abs(r.Fh)>1;
    const qf=r.Q;return {p:{A:open?ac2.p:P.pLP+2,H:ac2.p,L:P.pLP},q:{LPA:r.Ph<0?qf:-qf,LSH:r.Ph<0?qf:-qf,LGH:0,LPB:r.Ph<0?qf:-qf,LGL:0,LRP:0,LRT:0},
      pmax:pm,qref:200,r,cy,sav,ac:ac2,Vmx,Vo:st.Vo,mL:mL(st.Eh),mLc:mL(st.Ec),
      c:{DR:{ang:st.ang,eu:r.Fe>0?r.Fe/(P.m*1.2):0,brk:r.Ff<-1?1:0},PM:{ang:st.pa},SV:{closed:!open},HA:{fill:st.Vo/P.V0*1.6,u:ac2.p/pm},LA:{fill:.6-st.Vo/P.V0*.6,u:P.pLP/pm},
        CH:{s:[{p:st.h.map(a=>[a[0],a[1]]),c:'#0b72d9'},{p:st.h.map(a=>[a[0],a[2]]),c:'#dc2626',d:true}],x:tx,y:[0,KIT.nice(Math.max(P.vmax,P.pmax/10)*1.05)]},
        CF:{s:[{p:st.h.map(a=>[a[0],a[3]]),c:'#ea580c'},{p:st.h.map(a=>[a[0],a[4]]),c:'#64748b',d:true}],x:tx,y:[0,KIT.nice(Math.max(5,st.h.at(-1)[4])*1.1)]}},
      read:[{k:'מהירות',v:cy.v*3.6,u:'km/h'},{k:'כוח נדרש',v:r.Freq/1000,u:'kN'},{k:'כוח הידראולי',v:r.Fh/1000,u:'kN'},{k:'בלמי חיכוך',v:-r.Ff/1000,u:'kN',w:r.Ff<-1},{k:'לחץ מצבר',v:ac2.p,u:'bar',max:P.pmax},
        {k:'אנרגיה במצבר לחץ',v:ac2.E,u:'kJ',dg:0},{k:'הספק דיזל',v:r.Fe*cy.v/1000/.9,u:'kW'},{k:'אנרגיית בלימה שנאגרה',v:st.Ebr>1?st.Erec/st.Ebr*100:0,u:'%',max:100},{k:'חיסכון בדלק',v:sav*100,u:'%',max:100}]};},
  ins(P,R){const r=R.r,L=[];
    if(r.mode==='charge')L.push({ic:'🔋',at:'PM',h:`בלימה: ה-P/M עובד כמשאבה ודוחף שמן ממצבר LP למצבר HP. ${fmt(-r.Fh/1000,1)} kN מתוך ${fmt(-r.Freq/1000,1)} kN נבלמים הידראולית – והאנרגיה נשמרת.`});
    if(r.mode==='fric'&&R.cy.v>.3)L.push({ic:'🔥',at:'DR',w:true,h:R.ac.p>=P.pmax-1?'מצבר הלחץ מלא: שאר הבלימה בבלמי חיכוך – האנרגיה הופכת לחום.':'הבלימה כולה בבלמי חיכוך – האנרגיה הולכת לאיבוד כחום.',c:'בלמי חיכוך'});
    if(r.mode==='assist')L.push({ic:'🚀',at:'HA',h:`האצה: מצבר הלחץ (${fmt(R.ac.p,0)} bar) מניע את ה-P/M כמנוע ונותן ${fmt(r.Fh/1000,1)} kN. הדיזל משלים רק ${fmt(r.Fe/1000,1)} kN.`});
    if(Math.abs(r.Fh)>1&&r.x>.98)L.push({ic:'📏',at:'PM',h:`ה-P/M בנפח מרבי: הכוח מוגבל ל-Δp·V/(20π)·i/r = ${fmt(r.Fmax/1000,1)} kN.`});
    L.push({ic:'⛽',at:'CF',h:`עד עכשיו ההיברידי שרף ${fmt(R.mL,0)} mL, והרכב הרגיל ${fmt(R.mLc,0)} mL – חיסכון של ${fmt(R.sav*100,0)}%.`});return L;},
  calc(P,R){const r=R.r;return `<div class="kpis">${kpi('לחץ מצבר',fmt(R.ac.p,0),'bar')}${kpi('אנרגיה במצבר לחץ',fmt(R.ac.E,0),'kJ')}${kpi('אנרגיה קינטית',fmt(.5*P.m*R.cy.v**2/1000,0),'kJ')}${kpi('חיסכון',fmt(R.sav*100,1),'%')}</div>`+
    det('מצבר לחץ',row('',`p·V_gas^1.4 = p₀·V₀^1.4 (מוחלט): p = (${P.p0}+1)·(${P.V0}/(${P.V0} − ${fmt(R.Vo,1)}))^1.4 − 1 = ${V(R.ac.p,'bar')}`)+row('',`E = (p₂V₂ − p₁V₁)/(n − 1) = ${V(R.ac.E,'kJ')} · נפח שמן מרבי ${V(R.Vmx,'L')}`),true)+
    det('כוחות',row('',`F = m·a + m·g·C_rr + ½ρC_dA·v² = ${V(r.Freq/1000,'kN')}`)+row('',`F_P/M max = Δp·V/(20π)·i/r = ${fmt(r.dp,0)}·${P.Vmax}/62.8·${P.i}/${P.rw} = ${V(r.Fmax/1000,'kN')}`))+
    det('דלק',row('',`E_דלק = ∫F_דיזל·v dt/(η_מנוע·η_הנעה) ; היברידי ${V(R.mL,'mL',0)} מול רגיל ${V(R.mLc,'mL',0)}`));},
  demo:[{t:'עצור וסע',x:'משאית חלוקה מאיצה ל-40 km/h, נוסעת, ובולמת עד עצירה – שוב ושוב. הגרף התחתון סופר דלק מול משאית רגילה.',reset:true,hl:['DR','CF'],dur:6},
    {t:'בלימה = טעינה',x:'בבלימה ה-P/M הופך למשאבה: שמן עובר ממצבר LP למצבר HP והגז נדחס. מה שלא נכנס – לבלמי חיכוך.',hl:['PM','HA'],dur:10},
    {t:'האצה בחינם',x:'בהאצה הבאה מצבר הלחץ מחזיר את האנרגיה: ה-P/M הוא מנוע והדיזל עובד פחות (הצבע הכתום חלש).',hl:['HA','DR'],dur:10},
    {t:'החיסכון',x:'החיסכון גדל ככל שיש יותר עצירות ומסה גדולה יותר. בנסיעה רצופה בכביש מהיר כמעט אין חיסכון.',hl:['CF'],dur:6}],
  predict:[{q:'מכפילים את נפח מצבר הלחץ (100 L). אחוז אנרגיית הבלימה שנאגרת –',set:{V0:100},opts:['יגדל','יקטן','לא ישתנה'],a:0,why:'מצבר הלחץ לא מתמלא באמצע הבלימה, והלחץ עולה לאט יותר – נאגרת יותר אנרגיה.'},
    {q:'לחץ הטעינה המוקדמת של הגז נפל ל-40 bar. מה יקרה?',set:{},opts:['יותר אנרגיה','בתחילת הבלימה הלחץ נמוך – כוח הבלימה ההידראולי קטן והחיסכון יורד','אין השפעה'],a:1,why:'הכוח פרופורציונלי ללחץ: בלחץ נמוך ה-P/M נותן מומנט קטן גם בנפח מרבי.'}],
  tasks:[{q:P=>`מצבר לחץ ${P.V0} L, טעינה מוקדמת ${P.p0} bar, מגיע ל-${P.pmax} bar (n = 1.4, מוחלט). כמה שמן נכנס?`,a:P=>P.V0*(1-((P.p0+1)/(P.pmax+1))**(1/1.4)),u:'L',hint:'V₂ = V₀·(p₀/p₂)^(1/n) בלחצים מוחלטים; שמן = V₀ − V₂.',rand:P=>{P.V0=pick([30,50,80]);P.p0=rnd(100,200,10);P.pmax=rnd(300,350,10);}},
    {q:P=>`רכב ${fmt(P.m,0)} kg ב-${P.vmax} km/h. מה האנרגיה הקינטית?`,a:P=>.5*P.m*(P.vmax/3.6)**2/1000,u:'kJ',hint:'E = ½·m·v², v ב-m/s.',rand:P=>{P.m=rnd(8000,25000,1000);P.vmax=pick([30,40,50]);}},
    {q:P=>`Δp = ${P.pmax-P.pLP} bar, V = ${P.Vmax} cm³/rev. מה המומנט המרבי של ה-P/M?`,a:P=>(P.pmax-P.pLP)*P.Vmax/(20*PI),u:'N·m',hint:'T = Δp·V/(20π).',rand:P=>{P.Vmax=pick([125,180,250]);}}],
  faults:[{id:'p0',t:'גז דלף ממצבר הלחץ (p₀ = 40 bar)',sym:'"החיסכון בדלק ירד מאוד והמשאית מאיצה בלי הסיוע."',hint:'בדקו את לחץ המצבר כשהוא "ריק".',why:'בלחץ נמוך ה-P/M נותן כוח קטן – רוב הבלימה עוברת לחיכוך.',set:{}},
    {id:'sv',t:'שסתום הבידוד תקוע סגור',sym:'"אין שום סיוע הידראולי, והבלמים מתחממים."',hint:'האם מצבר הלחץ נטען בבלימה?',why:'השמן לא מגיע למצבר לחץ – המערכת ההידראולית מנותקת.',set:{}},
    {id:'pm',t:'בקרת הנפח הסגולי של ה-P/M תקועה ב-30%',sym:'"הסיוע חלש, גם כשמצבר הלחץ מלא."',hint:'השוו את הכוח ההידראולי לכוח המרבי האפשרי.',why:'בנפח 30% הכוח המרבי קטן פי 3.',set:{}}],
  qaT:30,
  test(H){const P=clone(this.P);const st=this.init(P);for(let k=0;k<6500;k++)this.step(P,st,.01,{fault:null});const R=this.step(P,st,0,{fault:null});const a0=acc55(P,0),Vm=P.V0*(1-(151/346)**(1/1.4)),aM=acc55(P,Vm);
    return [['מצבר לחץ ריק: p = p₀',a0.p,150],['מצבר לחץ מלא: p = p_max',aM.p,345],['אנרגיה מרבית (p₂V₂−p₁V₁)/0.4',aM.E,(346*(50-Vm)-151*50)/.4*100/1000],['יש חיסכון בדלק',+(R.sav>.1),1],['שימור אנרגיה: נאגר ≤ בלימה',+(st.Erec<=st.Ebr),1]];}};

LABS.push({ch:20,title:'מערכות במעגל סגור',sims:[SIM_HST,SIM_HYB]});
}
