/* lab 11 – same code as the website */
{




/* ===================== Chapter 11 – speed control circuits (sims 39, 40) ===================== */
/* ---------- shared constants / helpers (prefix C11_ / c11_) ---------- */
const C11_DPM=6;        // pressure-compensated FCV: minimum Δp for full regulation [bar]
const C11_KD=16;        // DCV + piping, each path [L/min/√bar]  (≈1.6 bar at 20 L/min)
const C11_FR=300;       // seal friction [N]
const C11_KBY=11;       // open 2/2 bypass valve [L/min/√bar]
const C11_KLK=.35;      // leaking check in the rectifier [L/min/√bar]
const C11_S1=250,C11_S2=150,C11_XC=90,C11_XB=140;   // strokes, workpiece surface, breakthrough [mm]
const C11_COL={in:'#0b72d9',out:'#e08a2e',bleed:'#15803d'};
const C11_R=(g,x,y,w,h,fill,cls='sy thin')=>{const r=SR(g,x,y,w,h,cls);if(fill)r.style.fill=fill;return r;};
const C11_T=(g,x,y,t,cls='st',anc='middle',col)=>{const e=ST(g,x,y,t,cls);e.style.textAnchor=anc;e.style.direction='ltr';if(col)e.style.fill=col;return e;};
/* valve descriptor: null | {k} orifice | {q} pressure-compensated FCV (setpoint) ; optional kl = parallel leak/bypass orifice */
function C11_ke(v,dp){if(!v)return 1e9;const k=v.q!=null?v.q/Math.sqrt(Math.max(dp,C11_DPM)):v.k;return Math.max(k,0)+(v.kl||0);}
function C11_fq(v,dp){if(!v)return 0;dp=Math.max(dp,0);return v.q!=null?v.q*Math.min(1,Math.sqrt(dp/C11_DPM)):v.k*Math.sqrt(dp);} // flow through the valve itself (no leak)
/* H.lin + FCVs (effective-k fixed point) + realistic overrun (pump side still fed through the ויסות בכניסה (meter-in) valve) + per-element heat */
function C11_lin(o){const kD=o.kD??C11_KD,ov=Math.max(3,.06*o.pr);let kI=C11_ke(o.inV,C11_DPM),kO=C11_ke(o.outV,C11_DPM),kB=o.blV?C11_ke(o.blV,C11_DPM):0,r;
  const fc=[o.inV,o.outV,o.blV].some(v=>v&&v.q!=null),N=fc?40:1;
  for(let i=0;i<N;i++){
    r=H.lin({Qp:o.Qp,pr:o.pr,ov,Ain:o.Ain,Aout:o.Aout,F:o.F,kIn:o.inV?kI:1e9,kOut:o.outV?kO:1e9,kBleed:kB,kLine:kD,vRun:o.vRun});
    if(r.cav){const kS=o.inV?1/Math.sqrt(1/kI**2+1/kD**2):kD;
      const g=p=>kS*Math.sqrt(Math.max(p-H.PVAC,0))+(kB>0?kB*Math.sqrt(Math.max(p,0)):0)+H.reliefQ(p,o.pr,ov,o.Qp)-o.Qp;
      const ps=H.bisect(g,H.PVAC,o.pr+ov*1.3);r.ps=ps;r.Qin=kS*Math.sqrt(Math.max(ps-H.PVAC,0));r.Qb=kB>0?kB*Math.sqrt(Math.max(ps,0)):0;r.Qr=H.reliefQ(ps,o.pr,ov,o.Qp);}
    r.dpI=o.inV?(r.Qin/kI)**2:0;r.dpO=o.outV?(r.Qout/kO)**2:0;
    if(!fc)break;
    if(o.inV&&o.inV.q!=null)kI=Math.sqrt(kI*C11_ke(o.inV,r.dpI));
    if(o.outV&&o.outV.q!=null)kO=Math.sqrt(kO*C11_ke(o.outV,r.dpO));
    if(o.blV&&o.blV.q!=null)kB=Math.sqrt(kB*C11_ke(o.blV,Math.max(r.ps,0)));}
  r.dDi=H.orDp(kD,r.Qin);r.dDo=H.orDp(kD,r.Qout);const ps=Math.max(r.ps,0);
  r.hr=H.kW(ps,r.Qr);r.hv=H.kW(r.dpI,r.Qin)+H.kW(r.dpO,r.Qout)+H.kW(ps,r.Qb);r.hd=H.kW(r.dDi,r.Qin)+H.kW(r.dDo,r.Qout);
  r.use=o.F<1e8?o.F*r.v/1e6:0;r.Pin=H.kW(ps,o.Qp);r.heat=r.hr+r.hv+r.hd;return r;}

/* one-way throttle / one-way pressure-compensated FCV (check bypass). in bottom, out top; o.free 'up'|'down', o.fcv */
SYM.c11_v1={ports:o=>({in:[0,30],out:[0,-30]}),bb:o=>[-17,-30,o.fcv?40:36,30],
  draw(g,o){SL(g,0,30,0,-30);
    if(o.fcv){SR(g,-12,-15,24,30,'syb');SA(g,4,10,4,-10,'sy',4);SP(g,'M-7,-8 Q-3,0 -7,8 M-1,-8 Q-5,0 -1,8','sy thin');adjArrow(g,-11,10,10,-12);SP(g,'M-12,10 h-4','sy');}
    else{SP(g,'M-7,-10 Q-1,0 -7,10');SP(g,'M7,-10 Q1,0 7,10');adjArrow(g,-12,10,12,-11);}
    const bx=o.fcv?27:22;SP(g,`M0,20 H${bx} V8 M${bx},-8 V-20 H0`);const s=o.free!=='down'?1:-1;
    SP(g,`M${bx-8},${-4*s} L${bx},${6*s} L${bx+8},${-4*s}`);const b=SC(g,bx,-1*s,5,'syb');SL(g,bx,8*s,bx,6*s);SL(g,bx,-8*s,bx,-6*s);
    SR(g,-15,-24,bx+12,48,'sy dash thin');SC(g,0,20,2.2,'syf');SC(g,0,-20,2.2,'syf');
    return cs=>{b.setAttribute('cy',(-1-4*clamp((cs&&cs.chk)||0,0,1))*s);};}};
B3.c11_v1=(c,o)=>{const M=m3(),g=new THREE.Group();g.add(edges(at(box3(32,44,18,M.alu),9,0,9)));const k=at(cyl3(6,8,M.black,'z'),0,0,22);g.add(k);g.add(at(box3(2,8,1,M.white),0,2,26.3));
  if(o.fcv)g.add(at(cyl3(4.5,14,M.steel,'x'),-14,-12,12));g.add(at(cyl3(4,10,M.steel,'z'),22,0,20));return {g,upd(cs){k.rotation.z=-((cs&&cs.knob)||0)*4;}};};
/* live x–y chart with several series + legend. o={w,h,t,xl,yl,ser:[{t,c,d}]}; cs={x0,xm,ym,L:[[[x,y]..]..],w:[..],op:[..],dot} */
SYM.c11_chart={ports:o=>({}),bb:o=>[-32,-28,o.w+6,o.h+24],
  draw(g,o){const W=o.w,Hh=o.h;C11_R(g,0,0,W,Hh,'#fff','syb');C11_T(g,W/2,-17,o.t,'st b');const n=o.ser.length;
    o.ser.forEach((s,k)=>C11_T(g,W*(k+.5)/n,-5,s.t,'st s','middle',s.c));
    for(let k=1;k<4;k++){SL(g,W*k/4,0,W*k/4,Hh,'sy thin').style.opacity=.13;SL(g,0,Hh*k/4,W,Hh*k/4,'sy thin').style.opacity=.13;}
    const z=SL(g,0,0,0,Hh,'sy thin dash');z.style.opacity=.55;C11_T(g,W/2,Hh+20,o.xl,'st s');
    const yl=C11_T(g,-25,Hh/2,o.yl,'st s');yl.setAttribute('transform',`rotate(-90 -25 ${Hh/2})`);
    const tx=[0,1,2].map(k=>C11_T(g,W*k/2,Hh+10,'','st s')),ty=[0,1,2].map(k=>C11_T(g,-4,Hh-Hh*k/2+3,'','st s','end'));
    const ps=o.ser.map(s=>{const p=SP(g,'','sy');p.style.stroke=s.c;if(s.d)p.style.strokeDasharray=s.d;return p;});
    const dot=SC(g,0,0,4,'syf');dot.style.fill='#dc2626';dot.style.stroke='#fff';dot.style.strokeWidth=1.2;
    return cs=>{if(!cs)return;const X=x=>clamp((x-cs.x0)/cs.xm,0,1)*W,Y=y=>Hh-clamp(y/cs.ym,-.02,1.06)*Hh;
      const zx=X(0);z.setAttribute('x1',zx);z.setAttribute('x2',zx);tx.forEach((t,k)=>t.textContent=fmt(cs.x0+cs.xm*k/2,0));ty.forEach((t,k)=>t.textContent=fmt(cs.ym*k/2,0));
      ps.forEach((p,k)=>{const L=cs.L[k];p.setAttribute('d',L&&L.length>1?'M'+L.map(q=>X(q[0]).toFixed(1)+','+Y(q[1]).toFixed(1)).join(' L'):'');p.style.strokeWidth=(cs.w&&cs.w[k])||1.4;p.style.opacity=(cs.op&&cs.op[k])??1;});
      if(cs.dot){dot.style.display='';dot.setAttribute('cx',X(cs.dot[0]));dot.setAttribute('cy',Y(cs.dot[1]));}else dot.style.display='none';};}};
/* power bars: where does the pump power go. o={w,t,rows:[..],col:[..]}; cs={t,v:[kW..],max} */
SYM.c11_heat={ports:o=>({}),bb:o=>[-4,-18,o.w+4,o.rows.length*15+4],
  draw(g,o){const bw=o.w-114;const tt=C11_T(g,o.w/2,-6,o.t,'st b');
    const rows=o.rows.map((lb,k)=>{const y=k*15;C11_R(g,0,y+2,bw,10,'#eef2f7');const bar=C11_R(g,0,y+2,0,10,o.col[k],'');const vt=C11_T(g,bw+4,y+10.5,'','st','start');C11_T(g,o.w,y+10.5,lb,'st','end',o.col[k]);return {bar,vt};});
    return cs=>{if(!cs)return;tt.textContent=cs.t||o.t;rows.forEach((r,k)=>{const v=cs.v[k]||0;r.bar.setAttribute('width',(clamp(v/cs.max,0,1)*bw).toFixed(1));r.vt.textContent=fmt(v,2)+' kW';});};}};
/* position–time + step (function) diagram. o={w,h,t,yl,xl,rows:[{t,c}],marks:[{t,c}]}; cs={tw,t0,ym,L:[[t,x,s1,s2,s3]..],marks:[y..],ph,dot} */
SYM.c11_trend={ports:o=>({}),bb:o=>[-40,-16,o.w+6,o.h+o.rows.length*11+30],
  draw(g,o){const W=o.w,Hh=o.h,nr=o.rows.length;C11_R(g,0,0,W,Hh,'#fff','syb');const tt=C11_T(g,W/2,-5,o.t,'st b');
    for(let k=1;k<4;k++){SL(g,W*k/4,0,W*k/4,Hh,'sy thin').style.opacity=.13;SL(g,0,Hh*k/2,W,Hh*k/2,'sy thin').style.opacity=.13;}
    const yl=C11_T(g,-28,Hh/2,o.yl,'st s');yl.setAttribute('transform',`rotate(-90 -28 ${Hh/2})`);
    const ty=[0,1,2].map(k=>C11_T(g,-4,Hh-Hh*k/2+3,'','st s','end'));
    const mk=(o.marks||[]).map(m=>{const l=SL(g,0,0,W,0,'sy thin dash');l.style.stroke=m.c;const t=C11_T(g,m.x??W-2,0,m.t,'st s','end',m.c);return {l,t,dy:m.dy??-2};});
    const px=SP(g,'','sy');px.style.stroke='#0b72d9';px.style.strokeWidth=2.2;
    const rows=o.rows.map((r,k)=>{const y=Hh+8+k*11;SL(g,0,y+8,W,y+8,'sy thin').style.opacity=.25;C11_T(g,-4,y+7,r.t,'st s','end',r.c);const p=SP(g,'','sy');p.style.stroke=r.c;p.style.strokeWidth=1.6;return {y,p};});
    const tx=[0,1,2].map(k=>C11_T(g,W*k/2,Hh+8+nr*11+9,'','st s'));C11_T(g,W/2,Hh+8+nr*11+19,o.xl,'st s');
    const dot=SC(g,0,0,3.6,'syf');dot.style.fill='#dc2626';
    return cs=>{if(!cs)return;const X=t=>clamp(t/cs.tw,0,1)*W,Y=x=>Hh-clamp(x/cs.ym,0,1.04)*Hh;tt.textContent=cs.ph?`${o.t} · ${cs.ph}`:o.t;
      ty.forEach((t,k)=>t.textContent=fmt(cs.ym*k/2,0));tx.forEach((t,k)=>t.textContent=fmt(cs.t0+cs.tw*k/2,0));
      mk.forEach((m,k)=>{const y=Y(cs.marks[k]);m.l.setAttribute('y1',y);m.l.setAttribute('y2',y);m.t.setAttribute('y',y+m.dy);});
      px.setAttribute('d',cs.L.length>1?'M'+cs.L.map(q=>X(q[0]).toFixed(1)+','+Y(q[1]).toFixed(1)).join(' L'):'');
      rows.forEach((r,k)=>{let d='';cs.L.forEach((q,i)=>{const x=X(q[0]).toFixed(1),y=q[2+k]?r.y:r.y+8;d+=i?` H${x} V${y}`:`M${x},${y}`;});r.p.setAttribute('d',d);});
      if(cs.dot){dot.style.display='';dot.setAttribute('cx',X(cs.dot[0]));dot.setAttribute('cy',Y(cs.dot[1]));}else dot.style.display='none';};}};
/* limit switch (roller + body), lights when actuated */
SYM.c11_ls={ports:o=>({}),bb:o=>[-9,-8,9,24],draw(g,o){SC(g,0,-3,3.2,'syb');SL(g,0,0,0,4,'sy thin');const b=SR(g,-7,4,14,8,'syb');C11_T(g,0,22,o.t||'','st s');return cs=>{b.style.fill=cs&&cs.on?'#f87171':'#fff';};}};
B3.c11_ls=(c,o)=>{const M=m3(),g=new THREE.Group();g.add(edges(at(box3(12,10,10,M.dark),0,-8,8)));const lamp=at(new THREE.Mesh(new THREE.SphereGeometry(3.4,14,10),new THREE.MeshStandardMaterial({color:0x334155})),0,1,8);g.add(lamp);
  return {g,upd(cs){const on=!!(cs&&cs.on);lamp.material.emissive.setHex(on?0xff3b30:0);lamp.material.emissiveIntensity=on?.9:0;}};};
/* workpiece block with a growing drilled hole */
SYM.c11_work={ports:o=>({}),bb:o=>[-o.w/2,-o.h/2-12,o.w/2,o.h/2],
  draw(g,o){const r=C11_R(g,-o.w/2,-o.h/2,o.w,o.h,'rgba(148,163,184,.55)','sy');for(let x=-o.w/2+6;x<o.w/2;x+=7)SL(g,x,-o.h/2,x-6,o.h/2,'sy thin').style.opacity=.35;
    const hole=C11_R(g,-o.w/2,-4,0,8,'#fff','sy thin');C11_T(g,0,-o.h/2-4,'חלק עבודה','st s');return cs=>{hole.setAttribute('width',clamp((cs&&cs.d)||0,0,o.w).toFixed(1));};}};
B3.c11_work=(c,o)=>{const M=m3(),g=new THREE.Group();g.add(edges(at(box3(o.w,o.h,30,mat(0x94a3b8,{metalness:.5,roughness:.5})),0,0,16)));return {g};};
/* dashed assembly frame */
SYM.c11_frame={ports:o=>({}),bb:o=>[-o.w/2,-o.h/2,o.w/2,o.h/2],draw(g,o){SR(g,-o.w/2,-o.h/2,o.w,o.h,'sy dash thin');}};

/* ---------- 39 · ויסות בכניסה (meter-in) / ויסות ביציאה (meter-out) / ויסות במעקף (bleed-off) ---------- */
const C11_MN={in:'Meter-in',out:'Meter-out',bleed:'Bleed-off'};
function C11_areas(P){return [H.A(P.D),H.Aann(P.D,Math.min(P.dr,P.D-4))];}
function C11_s39(P,f,mode,valve,FN){const [A1,A2]=C11_areas(P),pr=f==='relief'?P.pr*.6:P.pr;
  const vd=valve==='fcv'?{q:P.Qs*(f==='clog'?.45:1)}:{k:H.orK(P.A0)*(f==='clog'?.45:1)},kl=f==='chk'?.9:0;
  return C11_lin({Qp:P.Q,pr,Ain:A1,Aout:A2,F:FN,inV:mode==='in'?{...vd,kl}:null,outV:mode==='out'?{...vd,kl}:null,blV:mode==='bleed'?vd:null,vRun:H.v(P.Q,A1)*2.5});}
function C11_curves(P){const key=[P.Q,P.pr,P.D,P.dr,P.A0,P.Qs,P.valve,P.mode].join('|');if(C11_curves.k===key)return C11_curves.c;
  const A1=H.A(P.D),Fst=P.pr*A1/10/1000,n=24,ov=P.valve==='fcv'?'thr':'fcv';
  const cur=(mode,valve)=>{const L=[];for(let i=0;i<=n;i++){const F=-Fst+2*Fst*i/n;L.push([F,C11_s39(P,null,mode,valve,F*1000+C11_FR).v]);}return L;};
  const c={Fst,L:[cur('in',P.valve),cur('out',P.valve),cur('bleed',P.valve),cur(P.mode,ov)]};C11_curves.k=key;C11_curves.c=c;return c;}
const C11_SIM_MIO={id:'meterio',n:39,t:'ויסות בכניסה, ביציאה ובמעקף',d:'אותו מעגל בשלוש שיטות בקרת מהירות, עם עומס מתנגד ועומס מושך: מהירות, חום, הגברת לחץ ובריחת עומס',
  P:{mode:'in',valve:'thr',A0:1.5,Qs:8,load:'push',F:15,pos:'a',auto:true,Q:20,pr:100,D:63,dr:36},
  key:P=>`${P.mode}|${P.valve}|${P.load}`,
  ui(U,P){U.grp('שיטת בקרת המהירות');U.seg(P,'mode','מיקום הצמצם',[['in','כניסה','Meter-in – צמצם בכניסה לצילינדר'],['out','יציאה','Meter-out – צמצם ביציאה מהצילינדר'],['bleed','עוקף','Bleed-off – צמצם בענף למיכל']]);
    U.seg(P,'valve','סוג השסתום',[['thr','צמצם'],['fcv','ווסת זרימה מפוצה לחץ']],true);
    if(P.valve==='thr')U.num(P,'A0','פתח הצמצם A₀','mm²',{min:.2,max:20,step:.1});else U.num(P,'Qs','ספיקה מכוונת Q_set','L/min',{min:.5,max:60,step:.5});
    U.grp('עומס (פועל במהלך היציאה)');U.seg(P,'load','סוג העומס',[['push','מתנגד ←','העומס דוחף נגד היציאה'],['pull','מושך →','העומס גורר את המוט בוכנה החוצה']]);U.num(P,'F','גודל העומס F','kN',{min:0,max:60,step:.5});
    U.grp('שסתום פיקוד');U.seg(P,'pos','מצב',KIT.pos3);U.chk(P,'auto','מחזור אוטומטי');
    U.grp('משאבה וצילינדר',false);U.num(P,'Q','ספיקת משאבה','L/min',{min:2,max:100,step:1});U.num(P,'pr','כיול שסתום פריקה','bar',{min:20,max:315,step:5});
    U.num(P,'D','קוטר בוכנה D','mm',{min:25,max:160,step:1});U.num(P,'dr','קוטר מוט d','mm',{min:12,max:110,step:1});},
  circuit(P){const m=P.mode,fcv=P.valve==='fcv';const by=fcv?20:16;
    const comps=[{id:'NF',type:'note',x:300,y:12,o:{t:P.load==='pull'?'עומס מכני אינרציאלי: גורר את המוט החוצה →':'עומס מתנגד: דוחף נגד היציאה ←'}},
      {id:'C1',type:'cyl',x:260,y:50,o:{load:{t:'F'}},name:`צילינדר דו-פעולה Ø${P.D}/${P.dr} עם עומס`,lbl:'צילינדר',lblAt:[-84,-20],l3:[0,-34]},
      {id:'GA',type:'gauge',x:198,y:84,rot:-90,net:'A',name:'מד לחץ – צד מלא של הצילינדר (p_A)',valAt:[-19,-2],l3:[-20,-30]},
      {id:'GB',type:'gauge',x:322,y:84,rot:90,net:'B',name:'מד לחץ – צד המוט (p_B)',valAt:[18,-2],l3:[20,-30]},
      {id:'V1',type:'dcv',x:260,y:215,o:{box:KIT.D43.closed,L:'lever',center:true},name:'שסתום פיקוד 4/3 מרכז סגור (לחיצה מחליפה מצב)',lbl:'4/3',lblAt:[80,4]},
      {id:'P1',type:'pump',x:160,y:330,name:'משאבה קבועה',lbl:'משאבה',lblAt:[32,32]},{id:'T1',type:'tank',x:160,y:372,name:'מיכל'},
      {id:'RV',type:'pv',x:110,y:265,rot:-90,o:{kind:'relief'},name:'שסתום פריקה',lbl:'פריקה',lblAt:[0,-30]},{id:'T2',type:'tank',x:70,y:295,name:'מיכל'},{id:'T3',type:'tank',x:330,y:272,name:'מיכל'},
      {id:'GP',type:'gauge',x:200,y:253,net:'P',name:'מד לחץ משאבה (p_s)',l3:[0,-30]},
      {id:'CH',type:'c11_chart',x:396,y:124,o:{w:180,h:78,t:'מהירות יציאה מול עומס v(F)',xl:'F [kN]   (− מושך | + מתנגד)',yl:'v [mm/s]',
        ser:[{t:'Meter-in',c:C11_COL.in},{t:'Meter-out',c:C11_COL.out},{t:'Bleed-off',c:C11_COL.bleed},{t:fcv?'┄ צמצם':'┄ ווסת זרימה מפוצה לחץ',c:'#64748b',d:'4 3'}]},name:`עקומי v(F) לשלוש השיטות (${fcv?'ווסת זרימה מפוצה לחץ':'צמצם'}); מקווקו – אותה שיטה עם ${fcv?'צמצם':'ווסת זרימה מפוצה לחץ'}. הנקודה האדומה – מצב העבודה הנוכחי`},
      {id:'HEAT',type:'c11_heat',x:372,y:264,o:{w:192,t:'לאן הולך ההספק',rows:['הספק משאבה','שסתום פריקה','צמצם / ווסת','שסתום פיקוד','עבודה F·v'],col:['#1e3a8a','#dc2626','#e08a2e','#64748b','#15803d']},name:'פירוק הספק המשאבה: חום בכל רכיב מול עבודה מועילה'}];
    const lines=[{id:'LS',net:'S',pts:['T1.t','P1.in']},{id:'LP0',net:'P',pts:['P1.out',[160,265]]},{id:'LP1',net:'P',nodot:true,pts:[[160,265],[230,265]]},{id:'LP2',net:'P',nodot:true,pts:[[230,265],[253,265],'V1.P']},
      {id:'LRV',net:'P',pts:[[160,265],'RV.P']},{id:'LRT',net:'T',pts:['RV.T',[70,265],'T2.t']},{id:'LT',net:'T',pts:['V1.T',[267,250],[330,250],'T3.t']}];
    if(m==='in'){comps.push({id:'TA',type:'c11_v1',x:210,y:130,o:{free:'down',fcv},name:fcv?'ווסת זרימה מפוצה לחץ חד-כיווני – ויסות בכניסה (Meter-in) (אל-חוזר לזרימה חופשית בחזרה)':'צמצם אל-חוזר – ויסות בכניסה (Meter-in) (אל-חוזר לזרימה חופשית בחזרה)',lbl:'Meter-in',lblAt:[-46,34],l3:[0,-40]});
      lines.push({id:'LA1',net:'A0',pts:['V1.A',[253,175],[210,175],'TA.in']},{id:'LA2',net:'A',pts:['TA.out','C1.A']});}
    else lines.push({id:'LA',net:'A',pts:['V1.A',[253,175],[210,175],'C1.A']});
    if(m==='out'){comps.push({id:'TB',type:'c11_v1',x:310,y:130,o:{free:'up',fcv},name:fcv?'ווסת זרימה מפוצה לחץ חד-כיווני – ויסות ביציאה (Meter-out)':'צמצם אל-חוזר – ויסות ביציאה (Meter-out) (אל-חוזר לזרימה חופשית בחזרה)',lbl:'Meter-out',lblAt:[-48,30],l3:[0,-40]});
      lines.push({id:'LB1',net:'B0',pts:['V1.B',[267,175],[310,175],'TB.in']},{id:'LB2',net:'B',pts:['TB.out','C1.B']});}
    else lines.push({id:'LB',net:'B',pts:['V1.B',[267,175],[310,175],'C1.B']});
    if(m==='bleed'){comps.push({id:'TBL',type:fcv?'fcv':'throttle',x:230,y:300,rot:180,name:fcv?'ווסת זרימה מפוצה לחץ בענף עוקף למיכל (Bleed-off)':'צמצם בענף עוקף למיכל (Bleed-off)',lbl:'Bleed-off',lblAt:[44,4],l3:[0,-34]},{id:'T4',type:'tank',x:230,y:300+by+16,name:'מיכל'});
      lines.push({id:'LBL1',net:'P',pts:[[230,265],'TBL.in']},{id:'LBL2',net:'T',pts:['TBL.out','T4.t'],tag:{at:[278,330],t:'q'}});}
    return {comps,lines};},
  init:P=>({x:0,si:KIT.idx[P.pos]}),
  click(id,P){if(id==='V1'){P.pos=P.pos==='a'?'0':P.pos==='0'?'b':'a';P.auto=false;return true;}},
  step(P,st,dt,ctx){const f=ctx.fault,S=C11_S1,[A1,A2]=C11_areas(P),m=P.mode;
    const dir=KIT.dirOf(P.pos),atEnd=(dir>0&&st.x>=S-1e-6)||(dir<0&&st.x<=1e-6);const Fl=(P.load==='pull'?-1:1)*P.F*1000,FN=Fl+C11_FR;
    const vd=P.valve==='fcv'?{q:P.Qs*(f==='clog'?.45:1)}:{k:H.orK(P.A0)*(f==='clog'?.45:1)},pr=f==='relief'?P.pr*.6:P.pr;
    let r;if(dir>0)r=C11_s39(P,f,m,P.valve,atEnd?1e9:FN);
    else r=C11_lin({Qp:P.Q,pr,Ain:dir<0?A2:A1,Aout:dir<0?A1:A2,F:dir<0&&!atEnd?C11_FR:1e9,blV:m==='bleed'?vd:null,vRun:H.v(P.Q,A2)*12});
    const v=dir*r.v;st.x=clamp(st.x+v*dt,0,S);KIT.autoCycle(P,st,dt,atEnd&&dir!==0);KIT.ease(st,'si',KIT.idx[P.pos],dt);KIT.rpmAng(st,dt,1450);
    let pA,pB,pA0,pB0,qA=0,qB=0,qT=0;const ps=r.ps;
    if(dir>0){pA=r.stall?ps:r.pIn;pB=r.stall?0:r.pOut;pA0=r.stall?ps:ps-r.dDi;pB0=r.stall?0:r.dDo;if(!r.stall){qA=r.Qin;qB=-r.Qout;qT=r.Qout;}}
    else if(dir<0){pB=r.stall?ps:r.pIn;pA=r.stall?0:r.pOut;pB0=r.stall?ps:ps-r.dDi;pA0=r.stall?0:r.dDo;if(!r.stall){qB=r.Qin;qA=-r.Qout;qT=r.Qout;}}
    else{pA=pA0=Fl>0&&st.x>0?10*Fl/A1:0;pB=pB0=Fl<0?-10*Fl/A2:0;}
    const pm=P.pr,cav=!!(r.cav&&dir>0),Qin=dir&&!r.stall?r.Qin:0;if(cav){st.cavT=3;st.vrun=r.v;}else st.cavT=Math.max(0,(st.cavT||0)-dt);
    const cv=C11_curves(P),ym=Math.ceil(H.v(P.Q,A1)*1.35/10)*10,cur={in:0,out:1,bleed:2}[m];
    const Pmax=KIT.nice(Math.max(H.kW(P.pr,P.Q)*1.05,r.heat+Math.max(r.use,0)));const eta=r.Pin>.005&&r.use>0?100*r.use/r.Pin:0;
    return {A1,A2,v,dir,r,ps,pA,pB,run:cav,ran:!cav&&st.cavT>0,vrun:st.vrun,Fext:FN,Qin,heat:r.heat,Pin:r.Pin,Puse:r.use,eta,atEnd,vac:true,
      p:{P:ps,A:pA,A0:pA0,B:pB,B0:pB0,T:Math.min(1,(qT+r.Qr+r.Qb)/P.Q),S:-.05},
      q:{LS:P.Q,LP0:P.Q,LP1:P.Q-r.Qr,LP2:Qin,LRV:r.Qr,LRT:r.Qr,LBL1:r.Qb,LBL2:r.Qb,LA:qA,LA1:qA,LA2:qA,LB:qB,LB1:qB,LB2:qB,LT:qT},
      cav:cav?{LA:true,LA2:true}:{},pmax:pm,qref:P.Q,
      c:{C1:{x:st.x/S,uA:pA<0?-.2:pA/pm,uB:pB/pm,lt:'\u202A'+fmt(P.F,0)+' kN\u202C'},V1:{i:st.si},P1:{on:true,ang:st.ang},RV:{open:clamp(r.Qr/P.Q,0,1)},
        TA:{chk:dir<0?1:0,knob:P.A0/4},TB:{chk:dir<0?1:0,knob:P.A0/4},TBL:{knob:P.A0/4},
        CH:{x0:-cv.Fst,xm:2*cv.Fst,ym,L:cv.L,w:[0,1,2].map(k=>k===cur?2.6:1.1).concat([1.4]),op:[0,1,2].map(k=>k===cur?1:.45).concat([.9]),dot:dir>0&&!atEnd?[Fl/1000,Math.min(r.v,ym*1.05)]:null},
        HEAT:{v:[r.Pin,r.hr,r.hv,r.hd,Math.max(r.use,0)],max:Pmax}},
      read:[{k:'מהירות',v,u:'mm/s',max:ym,w:cav},{k:'לחץ משאבה',v:ps,u:'bar'},{k:'צד מלא p_A',v:pA,u:'bar',w:pA<0},{k:'צד מוט p_B',v:pB,u:'bar',w:pB>P.pr*1.02},
        {k:'ספיקה בשסתום הפריקה',v:r.Qr,u:'L/min',max:P.Q},{k:'חום (הפסדים)',v:r.heat,u:'kW',dg:2,max:Pmax},{k:'נצילות',v:eta,u:'%',dg:0,max:100}]};},
  ins(P,R){const L=[],m=P.mode,r=R.r,fcv=P.valve==='fcv',vn=fcv?'הווסת':'הצמצם',vid=m==='in'?'TA':m==='out'?'TB':'TBL';
    if(R.run)L.push({ic:'💨',w:true,at:'GA',h:`העומס המושך (${fmt(P.F,1)} kN) "בורח": הבוכנה זזה מהר יותר ממה שהמשאבה ממלאת, ובצד המלא ואקום של <b>${fmt(R.pA,2)} bar</b> (סגול) – קוויטציה. ב-${C11_MN[m]} אין שום התנגדות בקו היוצא שתבלום את העומס.`,c:'העומס בורח – ואקום בצד המלא'});
    else if(R.ran)L.push({ic:'💨',w:true,at:'C1',h:`העומס המושך ברח לסוף המהלך במהירות של כ-<b>${fmt(R.vrun,0)} mm/s</b> – פי ${fmt(R.vrun/H.v(P.Q,R.A1),1)} ממה שהמשאבה יכולה למלא. בדרך הצד המלא היה בוואקום (קוויטציה), והבוכנה נחבטה בסוף המהלך. הפתרון: ויסות ביציאה (Meter-out) או שסתום איזון עומס.`,c:'העומס ברח – הבוכנה נחבטה בסוף המהלך'});
    if(R.dir>0&&R.pB>P.pr*1.02)L.push({ic:'⚠️',w:true,at:'GB',h:`הגברת לחץ: בצד המוט <b>${fmt(R.pB,0)} bar</b> – יותר מכיול שסתום הפריקה (${fmt(P.pr,0)} bar). p_B = (p_A·A₁ − F)/A₂ והיחס A₁/A₂ = ${fmt(R.A1/R.A2,2)}. הצינור, האטמים והצמצם צריכים לעמוד בלחץ הזה.`,c:`${fmt(R.pB,0)} bar בצד המוט – הגברת לחץ`});
    if(R.dir>0&&!r.stall&&!R.run){
      if(m==='in')L.push({ic:'➡️',at:vid,h:`Meter-in: ${vn} מגביל את הספיקה הנכנסת ל-<b>${fmt(R.Qin,1)} L/min</b> ⇒ v = Q/A₁ = ${fmt(R.v,1)} mm/s. מפל הלחץ עליו: ${fmt(r.dpI,1)} bar = p_s − p_A − Δp_כיוון.`});
      if(m==='out')L.push({ic:'⬅️',at:vid,h:`Meter-out: ${vn} מגביל את השמן היוצא מצד המוט (${fmt(r.Qout,1)} L/min) ⇒ v = Q_out/A₂ = ${fmt(R.v,1)} mm/s. הצילינדר "נלחץ" בין שני עמודי שמן – לכן גם עומס מכני אינרציאלי נשאר בשליטה.`});
      if((m==='in'||m==='out')&&r.Qr<.05)L.push({ic:'🔓',w:true,at:vid,h:`${vn} פתוח מדי לעומס הזה: כל ${fmt(P.Q,0)} L/min של המשאבה נכנסים לצילינדר ושסתום הפריקה סגור. המהירות (${fmt(R.v,0)} mm/s) נקבעת כרגע במשאבה – לא ב${vn}. ${fcv?'הקטינו את Q_set':'סגרו את הצמצם'} כדי לקבל שליטה.`,c:`${vn} לא שולט – המשאבה קובעת את המהירות`});
      if(m==='bleed'){const c=C11_curves(P).L[2],vAt=F=>{let b=c[0];c.forEach(q=>{if(Math.abs(q[0]-F)<Math.abs(b[0]-F))b=q;});return b[1];};
        L.push({ic:'↘️',h:`Bleed-off: ${fmt(r.Qb,1)} L/min חוזרים למיכל ב-${fmt(R.ps,1)} bar בלבד – לחץ המשאבה הוא לחץ העומס ועוד קצת. ${fcv?'הווסת מעביר ספיקה קבועה, ולכן המהירות כמעט לא תלויה בעומס.':`אבל המהירות תלויה בעומס: בכ-${fmt(Math.min(5,C11_curves(P).Fst*.2),0)} kN בערך ${fmt(vAt(Math.min(5,C11_curves(P).Fst*.2)),0)} mm/s, ובכ-${fmt(C11_curves(P).Fst*.8,0)} kN רק ${fmt(vAt(C11_curves(P).Fst*.8),0)} mm/s.`}`,at:'CH'});}}
    if(r.Qr>.05&&R.dir!==0)L.push({ic:'🔥',at:'RV',h:`${fmt(r.Qr,1)} L/min עוברים בשסתום הפריקה ב-${fmt(R.ps,0)} bar: <b>${fmt(r.hr,2)} kW</b> חום. בויסות בכניסה (Meter-in) ובויסות ביציאה (Meter-out) המשאבה תמיד עובדת בלחץ הכיול – זה המחיר של השיטה.`});
    if(R.dir>0&&!r.stall)L.push({ic:'📊',at:'HEAT',h:`מאזן הספק: המשאבה נותנת ${fmt(R.Pin,2)} kW, ${R.Puse>0?`רק ${fmt(R.Puse,2)} kW הופכים לעבודה (נצילות ${fmt(R.eta,0)}%)`:`והעומס המושך <b>מוסיף</b> ${fmt(-R.Puse,2)} kW`} – כל השאר (${fmt(R.heat,2)} kW) הופך לחום בשמן.`});
    L.push({ic:fcv?'🎯':'🔧',at:'CH',h:fcv?`ווסת זרימה מפוצה לחץ: מפל הלחץ על הצמצם הפנימי נשמר קבוע (~${C11_DPM} bar), ולכן Q = ${fmt(P.Qs,1)} L/min בכל עומס – כל עוד יש מספיק לחץ. העקומים בגרף שטוחים.`:`צמצם פשוט: Q = k·√Δp. כשהעומס משתנה Δp משתנה – והמהירות איתו. השוו לעקום המקווקו (ווסת זרימה מפוצה לחץ).`});
    if(R.dir<0)L.push({ic:'↩️',h:`חזרה: השמן עוקף את ${vn} דרך האל-חוזר ${m==='bleed'?'– אבל בויסות במעקף (Bleed-off) הענף העוקף ממשיך לגנוב ספיקה גם בחזרה.':'וחוזר במהירות מלאה.'}`});
    return L;},
  calc(P,R){const m=P.mode,fcv=P.valve==='fcv',k=H.orK(P.A0),A1=R.A1,A2=R.A2,FN=(P.load==='pull'?-1:1)*P.F*1000+C11_FR;const r=C11_s39(P,null,m,P.valve,FN);
    let h=`<div class="kpis">${kpi('מהירות יציאה',r.cav?'בורח':fmt(r.v,1),r.cav?'':'mm/s')}${kpi('לחץ משאבה',fmt(r.ps,1),'bar')}${kpi('צד מוט p_B',fmt(r.pOut,1),'bar')}${kpi('חום',fmt(r.heat,2),'kW')}</div>`;
    h+=det('שטחים, עומס ושסתום',row('',`A₁ = π·${P.D}²/4 = ${V(A1,'mm²')} · A₂ = π·(${P.D}² − ${P.dr}²)/4 = ${V(A2,'mm²')}`)+row('כוח ביציאה',`F = ${P.load==='pull'?'−':''}${fmt(P.F*1000,0)} + ${C11_FR} (חיכוך) = ${V(FN,'N')}`)+
      row('שסתום',fcv?`ווסת זרימה מפוצה לחץ: Q = Q_set = ${fmt(P.Qs,1)} L/min כל עוד Δp ≥ ${C11_DPM} bar; מתחת לזה Q = Q_set·√(Δp/${C11_DPM})`:`צמצם: k = 0.637·A₀ = 0.637·${P.A0} = ${V(k,'L/min/√bar',3)} ⇒ Q = k·√Δp`)+row('שסתום פיקוד',`Δp = (Q/k_D)², k_D = ${C11_KD} L/min/√bar`),true);
    if(r.cav)h+=det('בריחת עומס',row('לחץ שנדרש בצד המלא',`p_A = (F + p_B·A₂)/A₁ < 0 – הבוכנה "מושכת" את השמן מהר יותר מהמשאבה`)+row('מגבלה',`p_A לא יורד מתחת לכ-${fmt(H.PVAC,2)} bar (אדי שמן). המהירות נקבעת רק בהתנגדות קו היציאה (במודל מוגבלת ל-2.5·Q/A₁): v ≈ ${V(r.v,'mm/s',0)}`,false),true);
    else if(m==='in')h+=det('Meter-in – שלב אחר שלב',row('צד המוט',`p_B = (Q_out/k_D)² = ${V(r.pOut,'bar')}`)+row('צד מלא',`p_A = (F·10 + p_B·A₂)/A₁ = (${fmt(FN*10,0)} + ${fmt(r.pOut,2)}·${fmt(A2,0)})/${fmt(A1,0)} = ${V(r.pIn,'bar')}`)+
      row('לחץ משאבה (שסתום פריקה פתוח)',`p_s = ${V(r.ps,'bar')}`)+row('מפל על השסתום',`Δp = p_s − p_A − Δp_D = ${fmt(r.ps,1)} − ${fmt(r.pIn,1)} − ${fmt(r.dDi,2)} = ${V(r.dpI,'bar')}`,r.dpI>=C11_DPM||!fcv)+
      row('ספיקה',fcv?`Q = ${V(r.Qin,'L/min')}`:`Q = k·√Δp = ${fmt(k,3)}·√${fmt(r.dpI,1)} = ${V(r.Qin,'L/min')}`)+row('מהירות',`v = Q/A₁ = ${V(r.v,'mm/s')}`)+row('עודף לשסתום הפריקה',`Q_r = Q_p − Q = ${V(r.Qr,'L/min')}`),true);
    else if(m==='out')h+=det('Meter-out – שלב אחר שלב',row('לחץ משאבה',`p_s = ${V(r.ps,'bar')} ⇒ p_A = p_s − Δp_D = ${V(r.pIn,'bar')}`)+row('הגברת לחץ בצד המוט',`p_B = (p_A·A₁ − F·10)/A₂ = (${fmt(r.pIn,1)}·${fmt(A1,0)} − ${fmt(FN*10,0)})/${fmt(A2,0)} = ${V(r.pOut,'bar')}`,r.pOut<=P.pr)+
      row('מפל על השסתום',`Δp = p_B − Δp_D = ${V(r.dpO,'bar')}`)+row('ספיקה יוצאת',fcv?`Q_out = ${V(r.Qout,'L/min')}`:`Q_out = k·√Δp = ${V(r.Qout,'L/min')}`)+row('מהירות',`v = Q_out/A₂ = ${V(r.v,'mm/s')}`)+row('נכנס מהמשאבה',`Q = v·A₁ = ${V(r.Qin,'L/min')} · לשסתום הפריקה ${V(r.Qr,'L/min')}`),true);
    else h+=det('Bleed-off – שלב אחר שלב',row('לחץ העומס',`p_A = (F·10 + p_B·A₂)/A₁ = ${V(r.pIn,'bar')}`)+row('לחץ משאבה',`p_s = p_A + Δp_D = ${V(r.ps,'bar')}`)+row('ספיקה עוקפת',fcv?`Q_b = ${V(r.Qb,'L/min')}`:`Q_b = k·√p_s = ${fmt(k,3)}·√${fmt(r.ps,1)} = ${V(r.Qb,'L/min')}`)+
      row('לצילינדר',`Q = Q_p − Q_b − Q_r = ${fmt(P.Q,1)} − ${fmt(r.Qb,2)} − ${fmt(r.Qr,2)} = ${V(r.Qin,'L/min')}`)+row('מהירות',`v = Q/A₁ = ${V(r.v,'mm/s')}`),true);
    h+=det('לאן הולך ההספק',row('הספק משאבה',`P = p_s·Q_p/600 = ${fmt(r.ps,1)}·${fmt(P.Q,1)}/600 = ${V(r.Pin,'kW',3)}`)+row('שסתום פריקה',`p_s·Q_r/600 = ${V(r.hr,'kW',3)}`)+row('צמצם / ווסת',`Δp·Q/600 = ${V(r.hv,'kW',3)}`)+row('שסתום פיקוד',`${V(r.hd,'kW',3)}`)+row('עבודה',`F·v = ${fmt(FN,0)}·${fmt(r.v,1)}/10⁶ = ${V(r.use,'kW',3)}`)+(r.cav?'':row('מאזן',`ΣP = ${V(r.heat+r.use,'kW',3)} = P_משאבה`,Math.abs(r.heat+r.use-r.Pin)<.01)));
    return h+`<div class="note">החישוב מתייחס למהלך היציאה עם הערכים שבלוח. שסתום הפריקה: עקיפה של ${fmt(Math.max(3,.06*P.pr),0)} bar מלחץ הפתיחה עד ספיקה מלאה.</div>`;},
  demo:[{t:'אותו מעגל – שלוש שיטות',x:'צילינדר Ø63 עם עומס מתנגד של 15 kN. את המהירות מגבילים בצמצם אחד שיכול לשבת <b>בכניסה</b> (Meter-in), <b>ביציאה</b> (Meter-out) או <b>בענף עוקף</b> למיכל (Bleed-off). מתחילים בויסות בכניסה (Meter-in).',reset:true,hl:['TA','C1'],dur:9},
    {t:'העודף הולך לשסתום הפריקה',x:'הצמצם מכניס לצילינדר רק כ-7 L/min מתוך 20. השאר (כ-13 L/min) עובר בשסתום הפריקה בכ-104 bar והופך לחום – כ-2.2 kW, הפס האדום הארוך.',hl:['RV','HEAT','GP'],dur:8},
    {t:'Meter-out – הגברת לחץ',x:'אותו צמצם בקו היציאה. הצד המלא מקבל את לחץ המשאבה, וצד המוט נדחס: <b>p_B = (p_A·A₁ − F)/A₂</b> ≈ 78 bar.',set:{mode:'out'},hl:['TB','GB'],dur:8},
    {t:'בלי עומס – מעל הכיול',x:'F = 0: כל הכוח של הצד המלא נבלם בצד המוט: p_B ≈ 100·3117/2100 ≈ 147 bar – הרבה יותר מכיול שסתום הפריקה!',set:{F:0},hl:['GB'],dur:7},
    {t:'עומס מכני אינרציאלי בויסות ביציאה (Meter-out)',x:'עומס מכני אינרציאלי 15 kN: הצמצם ביציאה בולם את העומס והוא לא בורח – אבל p_B מגיע לכ-200 bar, פי 2 מכיול שסתום הפריקה.',set:{load:'pull',F:15},hl:['GB','C1','CH'],dur:8},
    {t:'עומס מכני אינרציאלי בויסות בכניסה (Meter-in) – בורח',x:'אותו עומס, הצמצם בכניסה: שום דבר לא מחזיק את השמן היוצא. העומס בורח, הצד המלא בוואקום (סגול) – קוויטציה.',set:{mode:'in'},act:(P,st)=>{st.x=0;},hl:['GA','C1'],dur:6},
    {t:'Bleed-off – לחץ לפי העומס',x:'עומס מתנגד, הצמצם בענף למיכל: לחץ המשאבה רק כ-50 bar – פחות חום. אבל המהירות תלויה בעומס: ראו את העקום הירוק יורד.',set:{mode:'bleed',load:'push',F:15},act:(P,st)=>{st.x=0;},hl:['TBL','CH','HEAT'],dur:9},
    {t:'ווסת זרימה מפוצה לחץ',x:'מחליפים את הצמצם בווסת זרימה מפוצה לחץ: Q קבוע כל עוד יש מספיק מפל לחץ – העקומים שטוחים והמהירות לא תלויה בעומס.',reset:true,set:{mode:'bleed',valve:'fcv'},hl:['TBL','CH'],dur:9}],
  predict:[{q:'Meter-out, בלי עומס (F = 0), שסתום פריקה 100 bar, A₁/A₂ = 1.48. מה יראה המד בצד המוט בזמן היציאה?',set:{mode:'out',F:0,auto:false,pos:'a'},opts:['כ-0 bar','כ-100 bar','כ-150 bar','כ-50 bar'],a:2,why:'p_B = p_A·A₁/A₂ ≈ 100·3117/2100 ≈ 147 bar. בצד המוט הלחץ גבוה מכיול שסתום הפריקה – הגברת לחץ.'},
    {q:'Meter-in עם עומס מכני אינרציאלי של 10 kN. מה יקרה בזמן היציאה?',set:{mode:'in',load:'pull',F:10,auto:false,pos:'a'},opts:['המהירות נשמרת כמו בעומס מתנגד','העומס בורח והצד המלא נכנס לוואקום','הצילינדר נעצר'],a:1,dur:3,why:'הצמצם בכניסה לא בולם את השמן היוצא. העומס מושך מהר יותר ממה שהמשאבה ממלאת – ואקום בצד המלא וקוויטציה.'},
    {q:'Bleed-off עם צמצם: מגדילים את העומס מ-15 ל-25 kN. מה יקרה למהירות היציאה?',set:{mode:'bleed',F:25,auto:false,pos:'a'},opts:['תגדל','לא תשתנה','תקטן'],a:2,why:'הלחץ עולה עם העומס, והצמצם העוקף מעביר יותר: Q_b = k·√p. נשאר פחות לצילינדר – המהירות יורדת.'},
    {q:'ווסת זרימה מפוצה לחץ בויסות בכניסה (Meter-in). מכפילים את העומס מ-10 ל-20 kN. המהירות:',set:{mode:'in',valve:'fcv',F:20,auto:false,pos:'a'},opts:['קטנה בערך פי √2','לא משתנה','גדלה'],a:1,why:'המפצה שומר מפל לחץ קבוע על הצמצם הפנימי, ולכן Q = Q_set כל עוד יש לפחות כ-6 bar על הווסת. v = Q_set/A₁ ≈ 42.8 mm/s.'}],
  tasks:[{q:P=>`Meter-in: צילינדר Ø${P.D}, עומס מתנגד ${P.F} kN, לחץ המשאבה ${P.pr} bar (שסתום הפריקה פתוח). צמצם בכניסה עם פתח ${P.A0} mm² (k = 0.637·A₀). מה מהירות היציאה? (הזניחו מפלים אחרים)`,
      a:P=>{const A1=H.A(P.D);return H.v(H.orK(P.A0)*Math.sqrt(P.pr-P.F*1e4/A1),A1);},u:'mm/s',hint:'p_A = F/A₁; Δp = p_s − p_A; Q = k·√Δp; v = Q/A₁.',rand:P=>{P.D=pick([40,50,63,80]);P.pr=pick([80,100,120,160]);P.F=rnd(2,H.A(P.D)*P.pr/1e4*.7,.5);P.A0=pick([1,1.5,2,2.5,3]);}},
    {q:P=>`Meter-out: צילינדר Ø${P.D}/${P.dr}, בצד המלא ${P.pr} bar, עומס מכני אינרציאלי ${P.F} kN. מה הלחץ בצד המוט?`,a:P=>{const [A1,A2]=C11_areas(P);return (P.pr*A1+P.F*1e4)/A2;},u:'bar',hint:'איזון כוחות: p_A·A₁ + F_מושך = p_B·A₂.',rand:P=>{P.D=pick([50,63,80,100]);P.dr=Math.round(P.D*pick([.5,.56,.63]));P.pr=pick([80,100,120]);P.F=rnd(0,20,1);}},
    {q:P=>`Bleed-off: Q_p = ${P.Q} L/min, עומס ${P.F} kN על בוכנה Ø${P.D} (p_s ≈ F/A₁), צמצם עוקף עם פתח ${P.A0} mm². מה מהירות היציאה?`,a:P=>{const A1=H.A(P.D);return H.v(P.Q-H.orK(P.A0)*Math.sqrt(P.F*1e4/A1),A1);},u:'mm/s',hint:'Q_b = k·√p_s, ונשאר לצילינדר Q_p − Q_b.',rand:P=>{P.D=pick([50,63,80]);P.Q=rnd(15,40,1);P.F=rnd(3,20,1);P.A0=pick([1,1.5,2]);}},
    {q:P=>`Meter-in: Q_p = ${P.Q} L/min, שסתום פריקה ${P.pr} bar, לצילינדר נכנסים ${P.Qs} L/min. כמה הספק הופך לחום בשסתום הפריקה?`,a:P=>P.pr*(P.Q-P.Qs)/600,u:'kW',hint:'P = p·Q_r/600, Q_r = Q_p − Q.',rand:P=>{P.Q=rnd(15,60,1);P.Qs=rnd(3,P.Q-3,1);P.pr=pick([80,100,140,160]);}},
    {q:P=>`ווסת זרימה מפוצה לחץ בויסות ביציאה (Meter-out) מכוון ל-${P.Qs} L/min, צילינדר Ø${P.D}/${P.dr}. מה מהירות היציאה?`,a:P=>H.v(P.Qs,C11_areas(P)[1]),u:'mm/s',hint:'הווסת קובע את הספיקה היוצאת מצד המוט: v = Q/A₂.',rand:P=>{P.D=pick([40,50,63,80]);P.dr=Math.round(P.D*pick([.5,.56,.63]));P.Qs=rnd(2,15,.5);}}],
  faults:[{id:'clog',t:'לכלוך בצמצם (פתח קטן מהמכויל)',sym:'"לא נגענו בכיוון, אבל הצילינדר יוצא לאט – כמעט חצי מהרגיל."',hint:'השוו את המהירות לחישוב בלוח החישוב. האם לחץ המשאבה ולחץ הצד המלא השתנו?',why:'הלחצים נשארו כרגיל (שסתום הפריקה פתוח ו-p_A נקבע בעומס), אבל הספיקה דרך הפתח הקטן נמוכה: Q = k·√Δp עם k קטן ב-55%. מנקים או מחליפים את הצמצם.'},
    {id:'relief',t:'שסתום פריקה מכויל נמוך',sym:'"היציאה איטית, ומד המשאבה מראה פחות ממה שכיילנו."',hint:'מה מראה מד המשאבה בזמן היציאה לעומת כיול שסתום הפריקה?',why:'ב-Meter-in לחץ המשאבה הוא לחץ שסתום הפריקה. כשהוא נמוך (60 bar), מפל הלחץ על הצמצם קטן מאוד – והמהירות יורדת, למרות שהצמצם תקין.'},
    {id:'chk',t:'אל-חוזר העוקף בצמצם החד-כיווני דולף',sym:'"הצילינדר יוצא מהר מדי ולא מגיב לסגירת הצמצם."',hint:'סגרו את הצמצם: האם המהירות יורדת כמו בחישוב? מה עוד מחובר במקביל לצמצם?',why:'האל-חוזר שאמור לעבוד רק בחזרה לא אוטם, ושמן עובר דרכו גם ביציאה – במקביל לצמצם. המהירות גבוהה מהמחושב ולא יורדת עד 0 כשסוגרים.'}],
  test(H){const S=this,go=(o,t=.6)=>{const P=Object.assign(clone(S.P),{auto:false,pos:'a'},o);return runSim(S,P,t).R;};
    const A1=H.A(63),A2=H.Aann(63,36),kD=C11_KD,k=H.orK(S.P.A0),Qo=R=>H.Q(R.v,A2);
    const R1=go({}),R2=go({mode:'out',load:'pull',F:10}),R3=go({mode:'bleed',F:20}),R4=go({valve:'fcv'}),R5=go({mode:'out',valve:'fcv'}),R6=go({mode:'bleed',valve:'fcv'}),R7=go({load:'pull',F:10},.06),R8=go({mode:'out',F:0});
    return [['v = Q/A (20 L/min, Ø63)',H.v(20,A1),106.95],
      ['Meter-in: p_A = (F + p_B·A₂)/A₁',R1.pA,(10*15300+(Qo(R1)/kD)**2*A2)/A1],
      ['Meter-in: Q = k·√(p_s − p_A − Δp_D)',H.Q(R1.v,A1),k*Math.sqrt(R1.ps-R1.pA-(H.Q(R1.v,A1)/kD)**2)],
      ['Meter-out מושך: p_B = (p_A·A₁ − F)/A₂',R2.pB,(R2.pA*A1-10*(-10000+C11_FR))/A2],
      ['Meter-out: v = k·√(p_B − Δp_D)/A₂',R2.v,H.v(k*Math.sqrt(R2.pB-(Qo(R2)/kD)**2),A2)],
      ['Meter-out בלי עומס: p_B ≈ p_A·A₁/A₂',R8.pB,(R8.pA*A1-10*C11_FR)/A2],
      ['Bleed-off: v = (Q_p − k·√p_s)/A₁',R3.v,H.v(20-k*Math.sqrt(R3.ps),A1)],
      ['ווסת ויסות בכניסה (Meter-in): v = Q_set/A₁',R4.v,H.v(8,A1)],['ווסת ויסות ביציאה (Meter-out): v = Q_set/A₂',R5.v,H.v(8,A2)],['ווסת ויסות במעקף (Bleed-off): v = (Q_p − Q_set)/A₁',R6.v,H.v(12,A1)],
      ['עומס מכני אינרציאלי בויסות בכניסה (Meter-in): ואקום בצד המלא',R7.pA,H.PVAC],
      ['מאזן הספק: p_s·Q_p/600 = Σחום + F·v',R1.Pin,R1.heat+R1.Puse],['מאזן הספק ויסות ביציאה (Meter-out)',R2.Pin,R2.heat+R2.Puse],
      ['UI מהירות',R1.read[0].v,R1.v],['UI צד מוט',R2.read[3].v,R2.pB]];}};

/* ---------- 40 · rectifier bridge + rapid traverse / feed (drill feed unit) ---------- */
const C11_PHN={adv:'התקרבות מהירה',feed:'הזנת קדיחה',end:'סוף מהלך',rets:'יציאה איטית מהחור',ret:'חזרה מהירה',home:'המתנה'};
const C11_SIM_RECT={id:'rectifier',n:40,t:'מיישר ומהלך מהיר-עבודה',d:'יחידת קדיחה: התקרבות מהירה, קדיחה איטית וחזרה מהירה; גשר אל-חוזרים מעביר את השמן תמיד באותו כיוון דרך ווסת זרימה מפוצה לחץ אחד',
  P:{Q:16,Qf:1.6,xf:80,Fd:6,slowRet:true,D:50,dr:28,pr:80,vt:20},
  key:P=>String(P.xf),
  ui(U,P){U.grp('מחזור קדיחה');U.num(P,'Q','ספיקת משאבה','L/min',{min:4,max:60,step:1});U.num(P,'Qf','ספיקת הווסת Q_f','L/min',{min:.2,max:10,step:.1});
    U.num(P,'xf','מיקום LS1','mm',{min:10,max:C11_S2-10,step:5});U.num(P,'Fd','כוח קדיחה','kN',{min:0,max:25,step:.5});U.chk(P,'slowRet','יציאה איטית מהחור (דרך אותו ווסת)');
    U.note(`פני החומר ב-${C11_XC} mm, פריצת הקדח ב-${C11_XB} mm, מהלך ${C11_S2} mm.`);
    U.grp('צילינדר ושסתום פריקה',false);U.num(P,'D','קוטר בוכנה D','mm',{min:25,max:125,step:1});U.num(P,'dr','קוטר מוט d','mm',{min:12,max:90,step:1});U.num(P,'pr','כיול שסתום פריקה','bar',{min:20,max:250,step:5});},
  circuit(P){const S=C11_S2,X=x=>284+104*x/S,ww=104*(C11_XB-C11_XC)/S;
    return {comps:[{id:'C1',type:'cyl',x:200,y:50,o:{load:{t:'מקדח'}},name:`צילינדר הזנה של יחידת קדיחה Ø${P.D}/${P.dr}`,lbl:'יחידת קדיחה',lblAt:[-84,-22],l3:[0,-34]},
      {id:'WP',type:'c11_work',x:298+104*C11_XC/S+ww/2,y:50,o:{w:ww,h:40},name:`חלק העבודה: פני החומר ב-${C11_XC} mm, פריצה ב-${C11_XB} mm`},
      {id:'LS1',type:'c11_ls',x:X(P.xf),y:80,o:{t:'LS1'},name:'מפסק גבול LS1 – מעבר ממהלך מהיר להזנה (וחזרה למהיר ביציאה מהחור)',l3:[0,-24]},
      {id:'LS2',type:'c11_ls',x:X(S),y:80,o:{t:'LS2'},name:'מפסק גבול LS2 – סוף קדיחה → חזרה'},
      {id:'GA',type:'gauge',x:138,y:160,rot:-90,net:'A',name:'מד לחץ – צד מלא (p_A)',valAt:[-19,-2],l3:[-20,-30]},
      {id:'GB',type:'gauge',x:262,y:92,rot:90,net:'X',name:'מד לחץ – צד המוט (p_B)',valAt:[18,-2],l3:[20,-30]},
      {id:'FR',type:'c11_frame',x:290,y:170,o:{w:112,h:84},name:'מיישר (גשר גרץ): ארבעה אל-חוזרים מכוונים את הזרימה תמיד משמאל לימין דרך הווסת',lbl:'מיישר + ווסת',lblAt:[-94,4]},
      {id:'K1',type:'check',x:268,y:140,rot:-90,name:'K1 – פתוח בהזנה (מהצילינדר אל הווסת)'},{id:'K3',type:'check',x:312,y:140,rot:-90,name:'K3 – פתוח ביציאה האיטית (מהווסת אל הצילינדר)'},
      {id:'K2',type:'check',x:268,y:200,rot:-90,name:'K2 – פתוח ביציאה האיטית (משסתום הפיקוד אל הווסת)'},{id:'K4',type:'check',x:312,y:200,rot:-90,name:'K4 – פתוח בהזנה (מהווסת אל שסתום הפיקוד)'},
      {id:'FV',type:'fcv',x:290,y:170,rot:90,name:'ווסת זרימה מפוצה לחץ – קובע את מהירות ההזנה',l3:[0,-34]},
      {id:'BY',type:'dcv',x:400,y:170,o:{box:['P-A','P| A|'],n0:0,ways:2,L:'spring',R:'sol'},name:'שסתום 2/2 עוקף (Y3), פתוח במנוחה: פתוח = מהלך מהיר, סגור = דרך הווסת',lbl:'2/2 עוקף',lblAt:[22,-34],l3:[0,-30]},
      {id:'V1',type:'dcv',x:200,y:280,o:{box:KIT.D43.tandem,L:'sol',R:'sol',center:true},name:'שסתום פיקוד 4/3 סולנואידים Y1/Y2, מרכז טנדם (המשאבה פורקת במנוחה)'},
      {id:'P1',type:'pump',x:130,y:370,name:'משאבה קבועה',lbl:'משאבה',lblAt:[34,30]},{id:'T1',type:'tank',x:130,y:412,name:'מיכל'},
      {id:'RV',type:'pv',x:85,y:322,rot:-90,o:{kind:'relief'},name:'שסתום פריקה',lbl:'פריקה',lblAt:[0,-30]},{id:'T2',type:'tank',x:45,y:344,name:'מיכל'},{id:'T3',type:'tank',x:250,y:330,name:'מיכל'},
      {id:'GP',type:'gauge',x:165,y:310,net:'P',name:'מד לחץ משאבה',l3:[0,-30]},
      {id:'CH',type:'c11_trend',x:340,y:250,o:{w:200,h:64,t:'דיאגרמת מקום-זמן',yl:'x [mm]',xl:'זמן [s]',rows:[{t:'Y1 קדימה',c:'#0b72d9'},{t:'Y2 אחורה',c:'#e08a2e'},{t:'Y3 איטי',c:'#15803d'}],marks:[{t:'LS1',c:'#7c3aed',dy:8},{t:'חומר',c:'#64748b'},{t:'פריצה',c:'#b45309',dy:8}]},name:'דיאגרמת מקום-זמן: מיקום הצילינדר ומצב הסולנואידים Y1, Y2 ו-Y3 (2/2 סגור)'}],
     lines:[{id:'LS',net:'S',pts:['T1.t','P1.in']},{id:'LP0',net:'P',pts:['P1.out',[130,322]]},{id:'LP1',net:'P',pts:[[130,322],[193,322],'V1.P']},
      {id:'LRV',net:'P',pts:[[130,322],'RV.P']},{id:'LRT',net:'T',pts:['RV.T',[45,322],'T2.t']},{id:'LT',net:'T',pts:['V1.T',[207,312],[250,312],'T3.t']},
      {id:'LA',net:'A',pts:['V1.A',[193,244],[150,244],'C1.A']},
      {id:'LB1',net:'X',pts:['C1.B',[250,110],[290,110],[290,140]]},
      {id:'LBy1',net:'X',pts:[[290,122],[400,122],'BY.A']},{id:'LBy2',net:'Y',pts:['BY.P',[400,220],[290,220]]},
      {id:'Lk1a',net:'X',nodot:true,pts:[[290,140],'K1.in']},{id:'Lk3b',net:'X',nodot:true,pts:['K3.out',[290,140]]},
      {id:'Lk1b',net:'U',pts:['K1.out',[246,140],[246,170],'FV.in'],nodot:true},{id:'Lk2b',net:'U',pts:['K2.out',[246,200],[246,170]]},
      {id:'LW',net:'W',pts:['FV.out',[334,170]]},{id:'Lk3a',net:'W',nodot:true,pts:[[334,170],[334,140],'K3.in']},{id:'Lk4a',net:'W',nodot:true,pts:[[334,170],[334,200],'K4.in']},
      {id:'Lk4b',net:'Y',nodot:true,pts:['K4.out',[290,200]]},{id:'Lk2a',net:'Y',nodot:true,pts:[[290,200],'K2.in']},
      {id:'LB2',net:'Y',pts:[[290,200],[290,236],[207,236],'V1.B']}]};},
  init:P=>({x:0,t:0,ph:'adv',tw:0,tr:[],trT:0,si:KIT.idx.a,sb:0,tc0:0,cyc:null,dmax:0,vc:null}),
  step(P,st,dt,ctx){const f=ctx.fault,S=C11_S2,[A1,A2]=C11_areas(P),xf=Math.min(P.xf+(f==='cam'?25:0),S-5);st.t+=dt;
    if(st.ph==='adv'&&st.x>=xf)st.ph='feed';
    if(st.ph==='feed'&&st.x>=S-1e-6){st.ph='end';st.tw=0;}
    if(st.ph==='end'){st.tw+=dt;if(st.tw>.35)st.ph=P.slowRet&&st.x>xf?'rets':'ret';}
    if(st.ph==='rets'&&st.x<=xf)st.ph='ret';
    if(st.ph==='ret'&&st.x<=1e-6){st.ph='home';st.tw=0;}
    if(st.ph==='home'){st.tw+=dt;if(st.tw>.8){st.ph='adv';st.cyc=st.t-st.tc0;st.tc0=st.t;st.dmax=0;st.vc=null;}}
    const pos=st.ph==='adv'||st.ph==='feed'||st.ph==='end'?'a':st.ph==='rets'||st.ph==='ret'?'b':'0',cl=st.ph==='feed'||st.ph==='end'||st.ph==='rets';
    const dir=KIT.dirOf(pos),atEnd=(dir>0&&st.x>=S-1e-6)||(dir<0&&st.x<=1e-6);
    const fv=f==='comp'?{k:P.Qf/Math.sqrt(C11_DPM)}:{q:P.Qf};const thrust=dir>0&&st.x>=C11_XC&&st.x<C11_XB?P.Fd*1000:0;
    let r,Qt=0,dpV=0;
    if(dir>0){r=C11_lin({Qp:P.Q,pr:P.pr,Ain:A1,Aout:A2,F:atEnd?1e9:C11_FR+thrust,outV:{...fv,kl:(cl?0:C11_KBY)+(f==='chk'?C11_KLK:0)},vRun:H.v(P.Q,A1)*12});dpV=r.dpO;Qt=r.stall?0:r.Qout;}
    else if(dir<0){r=C11_lin({Qp:P.Q,pr:P.pr,Ain:A2,Aout:A1,F:atEnd?1e9:C11_FR,inV:{...fv,kl:cl?0:C11_KBY},vRun:H.v(P.Q,A2)*12});dpV=r.dpI;Qt=r.stall?0:r.Qin;}
    else{const ps=(P.Q/C11_KD)**2;r={v:0,ps,pIn:0,pOut:0,Qin:0,Qout:0,Qr:0,Qb:0,stall:true,dDi:0,dDo:0};}
    const Qv=Math.min(Qt,C11_fq(fv,dpV)),Qby=cl?0:Math.min(Qt-Qv,C11_KBY*Math.sqrt(Math.max(dpV,0))),Qlk=Math.max(Qt-Qv-Qby,0);
    const x0=st.x,v=dir*r.v;st.x=clamp(st.x+v*dt,0,S);if(dir>0&&x0<C11_XC&&st.x>=C11_XC)st.vc=r.v;st.dmax=Math.max(st.dmax,st.x);
    KIT.ease(st,'si',KIT.idx[pos],dt,12);KIT.ease(st,'sb',cl?1:0,dt,12);KIT.rpmAng(st,dt,1450);
    const ps=r.ps;let pA=0,pX=0,pY=0,pU=0,pW=0;
    if(dir>0){pA=r.stall?ps:r.pIn;pX=r.stall?0:r.pOut;pY=r.stall?0:r.dDo;pU=pX;pW=pY;}
    else if(dir<0){pY=r.stall?ps:ps-r.dDi;pX=r.stall?ps:r.pIn;pA=r.stall?0:r.pOut;pU=pY;pW=pX;}
    const e=dir>0,b=dir<0,qIn=r.stall?0:r.Qin,qOut=r.stall?0:r.Qout;
    if(dt>0){st.trT+=dt;if(st.trT>=.05){st.trT=0;st.tr.push([st.t,st.x,pos==='a'?1:0,pos==='b'?1:0,cl?1:0]);while(st.tr.length&&st.tr[0][0]<st.t-10)st.tr.shift();}}
    const t0=Math.max(0,st.t-10),pm=P.pr,vF=H.v(P.Qf,A2);
    return {A1,A2,r,ph:st.ph,v,ps,pA,pB:pX,Qv,Qby,Qlk,dpV,thrust,vF,cl,
      p:{P:ps,A:pA,X:pX,Y:pY,U:pU,W:pW,T:pos==='0'?.4:Math.min(1,(qOut+r.Qr)/P.Q),S:-.05},
      q:{LS:P.Q,LP0:P.Q,LP1:P.Q-r.Qr,LRV:r.Qr,LRT:r.Qr,LT:pos==='0'?P.Q:qOut+0,LA:e?qIn:b?-qOut:0,LB1:e?qOut:b?-qIn:0,LB2:e?qOut:b?-qIn:0,
        LBy1:e?Qby:-Qby,LBy2:e?Qby:-Qby,Lk1a:e?Qv:0,Lk1b:e?Qv:0,Lk2a:b?Qv:0,Lk2b:b?Qv:0,LW:Qv,Lk3a:b?Qv:-Qlk,Lk3b:b?Qv:-Qlk,Lk4a:e?Qv+Qlk:0,Lk4b:e?Qv+Qlk:0},
      pmax:pm,qref:P.Q*.6,
      c:{C1:{x:st.x/S,uA:pA/pm,uB:pX/pm,lt:'מקדח'},V1:{i:st.si},BY:{i:st.sb},P1:{on:true,ang:st.ang},RV:{open:clamp(r.Qr/P.Q,0,1)},
        K1:{open:e?clamp(Qv/P.Qf,0,1):0},K4:{open:e?clamp((Qv+Qlk)/P.Qf,0,1):0},K2:{open:b?clamp(Qv/P.Qf,0,1):0},K3:{open:b?clamp(Qv/P.Qf,0,1):0},FV:{knob:P.Qf/4},
        LS1:{on:st.x>=xf-.5&&st.ph!=='home'&&st.ph!=='adv'&&st.ph!=='ret'},LS2:{on:st.x>=S-.5},WP:{d:104*clamp(st.dmax-C11_XC,0,C11_XB-C11_XC)/S},
        CH:{tw:10,t0,ym:S,L:st.tr.map(q=>[q[0]-t0,q[1],q[2],q[3],q[4]]),marks:[P.xf,C11_XC,C11_XB],ph:C11_PHN[st.ph],dot:[st.t-t0,st.x]}},
      read:[{k:'מיקום x',v:st.x,u:'mm',max:S},{k:'מהירות',v,u:'mm/s',max:H.v(P.Q,A2)},{k:'לחץ משאבה',v:ps,u:'bar'},{k:'צד מלא p_A',v:pA,u:'bar'},{k:'צד מוט p_B',v:pX,u:'bar',w:pX>P.pr*1.02},
        {k:'ספיקה בווסת',v:Qv,u:'L/min',dg:2,max:Math.max(P.Qf*1.5,.1)},{k:'זמן מחזור',v:st.cyc??0,u:'s',max:15}]};},
  ins(P,R,st){const L=[],ph=R.ph,vF=R.vF;
    if(ph==='adv')L.push({ic:'⏩',at:'BY',h:`התקרבות מהירה: Y1 מופעל ו-2/2 פתוח, שמן צד המוט עוקף את המיישר. v = Q/A₁ = ${fmt(P.Q,0)} L/min ÷ ${fmt(R.A1,0)} mm² = <b>${fmt(R.v,0)} mm/s</b>.`});
    if(ph==='feed'||ph==='end')L.push({ic:'🐢',at:'FV',h:`הזנה: LS1 הפעיל את Y3 וה-2/2 נסגר. השמן היוצא מצד המוט עובר <b>K1 → ווסת → K4</b>. v = Q_f/A₂ = ${fmt(P.Qf,2)} L/min ÷ ${fmt(R.A2,0)} mm² = <b>${fmt(vF,1)} mm/s</b> (נמדד: ${fmt(R.v,1)}).`});
    if(ph==='rets')L.push({ic:'🔁',at:'FV',h:`יציאה איטית מהחור: השמן נכנס לצד המוט דרך <b>K2 → ווסת → K3</b> – אותו ווסת ובאותו כיוון כמו בהזנה (${fmt(-R.v,1)} mm/s). בלי המיישר היה צריך שני ווסתים, כל אחד עם אל-חוזר עוקף.`});
    if(ph==='ret')L.push({ic:'⏪',at:'BY',h:`חזרה מהירה: Y2 מופעל ו-2/2 פתוח – כל ספיקת המשאבה לשטח הטבעתי: v = Q/A₂ = <b>${fmt(-R.v,0)} mm/s</b>.`});
    if(ph==='home')L.push({ic:'⏸',at:'V1',h:`המתנה: מרכז טנדם מחבר P→T, המשאבה פורקת ב-${fmt(R.ps,1)} bar בלבד – כמעט בלי חום.`});
    if(R.pB>P.pr*1.02)L.push({ic:'⚠️',w:true,at:'GB',h:`הגברת לחץ בויסות ביציאה (Meter-out): בצד המוט <b>${fmt(R.pB,0)} bar</b> – יותר מכיול שסתום הפריקה (${fmt(P.pr,0)} bar). בלי עומס קדיחה כל הכוח של הצד המלא נבלם בצד המוט: p_B = (p_A·A₁ − F)/A₂.`,c:`${fmt(R.pB,0)} bar בצד המוט`});
    if(st&&st.vc!=null&&st.vc>1.5*vF)L.push({ic:'💥',w:true,at:'WP',h:`המקדח פגע בחומר במהירות <b>${fmt(st.vc,0)} mm/s</b> – פי ${fmt(st.vc/vF,0)} ממהירות ההזנה! ההזנה צריכה להתחיל לפני פני החומר (${C11_XC} mm); LS1 מכוון ל-${fmt(P.xf,0)} mm.`,c:'המקדח נכנס לחומר במהלך המהיר'});
    if(ph==='feed'&&R.thrust>0)L.push({ic:'🎯',h:`בקדיחה העומס ${fmt(P.Fd,1)} kN מוריד את p_B ל-${fmt(R.pB,0)} bar, אבל על הווסת עדיין ${fmt(R.dpV,0)} bar (> ${C11_DPM} bar) – המפצה שומר על ${fmt(P.Qf,2)} L/min והמהירות לא משתנה.`});
    if(ph==='feed'&&st&&st.x>=C11_XB-8)L.push({ic:'🕳️',at:'WP',h:'פריצת הקדח: כוח הקדיחה נעלם בבת אחת. בגלל שהווסת בויסות ביציאה (Meter-out), השמן בצד המוט "מחזיק" את הצילינדר – אין קפיצה קדימה שתשבור את המקדח.'});
    if((ph==='feed'||ph==='rets')&&R.r.Qr>.05)L.push({ic:'🔥',at:'RV',h:`בזמן ההזנה ${fmt(R.r.Qr,1)} L/min עוברים בשסתום הפריקה ב-${fmt(R.ps,0)} bar: ${fmt(H.kW(R.ps,R.r.Qr),2)} kW חום. במכונות אמיתיות משתמשים כאן במשאבה כפולה או משתנה.`});
    if(st&&st.cyc)L.push({ic:'⏱',h:`זמן מחזור: <b>${fmt(st.cyc,1)} s</b>. רוב הזמן הוא ההזנה – לכן מקרבים את LS1 לחומר ככל האפשר (בלי להיכנס אליו מהר).`});
    return L;},
  calc(P,R){const A1=R.A1,A2=R.A2,S=C11_S2,va=H.v(P.Q,A1),vF=H.v(P.Qf,A2),vr=H.v(P.Q,A2),ps=P.pr+Math.max(3,.06*P.pr)*.85;
    const tA=P.xf/va,tF=(S-P.xf)/vF,tS=P.slowRet?(S-P.xf)/vF:0,tR=(P.slowRet?P.xf:S)/vr,tot=tA+tF+.35+tS+tR+.8;
    const pB0=(ps*A1-10*C11_FR)/A2,pBd=(ps*A1-10*(C11_FR+P.Fd*1000))/A2;
    return `<div class="kpis">${kpi('מהלך מהיר',fmt(va,0),'mm/s')}${kpi('הזנה',fmt(vF,1),'mm/s')}${kpi('חזרה מהירה',fmt(vr,0),'mm/s')}${kpi('מחזור משוער',fmt(tot,1),'s')}</div>`+
      det('שטחים ומהירויות',row('',`A₁ = π·${P.D}²/4 = ${V(A1,'mm²')} · A₂ = π·(${P.D}² − ${P.dr}²)/4 = ${V(A2,'mm²')}`)+row('התקרבות (2/2 פתוח)',`v = Q/A₁ = ${fmt(P.Q,1)}·10⁶/60/${fmt(A1,0)} = ${V(va,'mm/s')}`)+
        row('הזנה (Meter-out דרך הווסת)',`v = Q_f/A₂ = ${fmt(P.Qf,2)}·10⁶/60/${fmt(A2,0)} = ${V(vF,'mm/s')}`)+row('יציאה איטית (Meter-in, אותו ווסת)',`v = Q_f/A₂ = ${V(vF,'mm/s')}`)+row('חזרה מהירה',`v = Q/A₂ = ${V(vr,'mm/s')}`),true)+
      det('זמני המחזור',row('התקרבות',`t = ${fmt(P.xf,0)}/${fmt(va,1)} = ${V(tA,'s',2)}`)+row('הזנה',`t = (${S} − ${fmt(P.xf,0)})/${fmt(vF,2)} = ${V(tF,'s',2)}`)+(P.slowRet?row('יציאה איטית',`t = ${V(tS,'s',2)}`):'')+row('חזרה מהירה',`t = ${fmt(P.slowRet?P.xf:S,0)}/${fmt(vr,1)} = ${V(tR,'s',2)}`)+
        row('סה"כ (כולל השהיות 0.35 + 0.8 s)',`T ≈ ${V(tot,'s')}`+(R.ph&&APP.st&&APP.st.cyc?` · נמדד: ${V(APP.st.cyc,'s')}`:'')),true)+
      det('לחצים בהזנה (שסתום פריקה פתוח, p_s ≈ '+fmt(ps,1)+' bar)',row('לפני המגע',`p_B = (p_s·A₁ − F_חיכוך)/A₂ = (${fmt(ps,1)}·${fmt(A1,0)} − ${C11_FR*10})/${fmt(A2,0)} = ${V(pB0,'bar')}`,pB0<=P.pr)+
        row('בזמן קדיחה',`p_B = (p_s·A₁ − 10·(${fmt(P.Fd*1000,0)} + ${C11_FR}))/A₂ = ${V(pBd,'bar')}`)+row('מפל על הווסת',`Δp ≈ p_B − Δp_D ≥ ${C11_DPM} bar ⇒ ${pBd>C11_DPM+1?'הווסת מווסת – מהירות קבועה':'לא מספיק לחץ – המהירות תרד'}`,pBd>C11_DPM+1)+
        row('כוח קדיחה מקסימלי',`F ≈ p_s·A₁ − (${C11_DPM} + Δp_D)·A₂ = ${V((ps*A1-(C11_DPM+.5)*A2)/10000-C11_FR/1000,'kN')}`),true)+
      det('מסלולי הזרימה במיישר',row('הזנה (מהצילינדר החוצה)',`צד מוט → K1 → ווסת → K4 → שסתום פיקוד`)+row('יציאה איטית (אל הצילינדר)',`שסתום פיקוד → K2 → ווסת → K3 → צד מוט`)+row('תמיד',`הווסת רואה זרימה משמאל לימין – כך ווסת זרימה מפוצה לחץ אחד שולט בשני הכיוונים`))+
      `<div class="note">ווסת זרימה מפוצה לחץ: Q = Q_f כל עוד Δp ≥ ${C11_DPM} bar. 2/2 פתוח: k = ${C11_KBY} L/min/√bar. החישוב מזניח את מפלי הלחץ בשסתום הפיקוד (כ-1 bar).</div>`;},
  demo:[{t:'יחידת קדיחה',x:'צילינדר מזיז ראש קדיחה: <b>התקרבות מהירה</b> עד LS1, <b>קדיחה איטית</b> דרך החומר, ו<b>חזרה מהירה</b>. בגרף – מקום-זמן והסולנואידים.',reset:true,hl:['C1','WP','CH'],dur:9},
    {t:'מהלך מהיר',x:'Y1 מופעל, ה-2/2 פתוח (במנוחה): השמן מצד המוט עוקף את המיישר. v = Q/A₁ ≈ 136 mm/s.',act:(P,st)=>{st.x=30;st.ph='adv';},run:false,hl:['BY','V1'],dur:7},
    {t:'LS1 – מעבר להזנה',x:'הפין על המגררה לוחץ את LS1: Y3 סוגר את ה-2/2. עכשיו כל השמן מצד המוט עובר <b>K1 → ווסת → K4</b>. v = Q_f/A₂ ≈ 19.8 mm/s.',act:(P,st)=>{st.x=81;st.ph='feed';},hl:['LS1','K1','FV','K4'],dur:8},
    {t:'הגברת לחץ בצד המוט',x:'לפני המגע אין עומס: הצד המלא דוחף ב-84 bar על 1963 mm², וצד המוט "בולם" על 1348 mm² – <b>כ-120 bar</b>, מעל כיול שסתום הפריקה.',act:(P,st)=>{st.x=83;st.ph='feed';},run:false,hl:['GB'],dur:7},
    {t:'פריצה – בלי קפיצה',x:'בפריצת הקדח הכוח נעלם בבת אחת. בגלל שהווסת בצד היוצא (Meter-out), המהירות לא קופצת – המקדח לא נשבר.',act:(P,st)=>{st.x=128;st.ph='feed';},hl:['WP','CH'],dur:8},
    {t:'יציאה איטית – אותו ווסת',x:'בחזרה מתוך החור השמן זורם הפוך בצילינדר, אבל הגשר מכוון אותו <b>K2 → ווסת → K3</b> – באותו כיוון בווסת. מהירות זהה להזנה.',act:(P,st)=>{st.x=146;st.ph='rets';},hl:['K2','FV','K3'],dur:8},
    {t:'מחזור בלי יציאה איטית',x:'מבטלים את היציאה האיטית: בסוף הקדיחה ה-2/2 נפתח מיד והחזרה כולה מהירה. המחזור קצר יותר – ראו בגרף.',set:{slowRet:false},act:(P,st)=>{st.x=0;st.ph='home';st.tw=0;},hl:['CH','BY'],dur:10},
    {t:'עומס כפול – אותה מהירות',x:'מקדח קהה: 12 kN במקום 6. p_B יורד, אבל על הווסת נשארים מספיק bar – הוא מפצה והמהירות נשארת 19.8 mm/s.',set:{Fd:12,slowRet:true},act:(P,st)=>{st.x=92;st.ph='feed';},hl:['FV','GB','CH'],dur:8}],
  predict:[{q:'מקדח קהה: כוח הקדיחה עולה מ-6 ל-12 kN. מה יקרה למהירות ההזנה?',set:{Fd:12},act:(P,st)=>{st.x=95;st.ph='feed';},opts:['תרד בערך לחצי','לא תשתנה','תעלה'],a:1,why:'הווסת זרימה מפוצה לחץ. p_B יורד מכ-76 לכ-31 bar, אבל זה עדיין הרבה יותר מ-6 bar – הווסת שומר על Q_f, ו-v = Q_f/A₂ לא משתנה.'},
    {q:'ביציאה האיטית מהחור, באיזה כיוון זורם השמן דרך הווסת?',act:(P,st)=>{st.x=150;st.ph='end';st.tw=0;},opts:['הפוך מכיוון ההזנה','באותו כיוון כמו בהזנה','השמן לא עובר בווסת'],a:1,dur:5,why:'הגשר מכוון: בהזנה K1 → ווסת → K4, ביציאה K2 → ווסת → K3. הווסת תמיד רואה זרימה באותו כיוון – לכן ווסת זרימה מפוצה לחץ אחד מספיק.'},
    {q:'מזיזים את LS1 ל-100 mm (פני החומר ב-90 mm). מה יקרה?',set:{xf:100},act:(P,st)=>{st.x=0;st.ph='adv';},opts:['רק ההזנה תתקצר','המקדח ייכנס לחומר במהירות המהלך המהיר','הצילינדר ייעצר ב-LS1'],a:1,dur:3,why:'ההזנה מתחילה רק ב-100 mm, אבל המגע ב-90 mm. 10 mm ראשונים של הקדח נקדחים בכ-136 mm/s – שבירת מקדח.'},
    {q:'בהזנה לפני המגע (בלי עומס), מה הלחץ בצד המוט?',act:(P,st)=>{st.x=81;st.ph='feed';},opts:['כ-0 bar','כמו לחץ המשאבה (כ-84 bar)','יותר מלחץ המשאבה (כ-120 bar)'],a:2,dur:3,why:'p_B = (p_s·A₁ − F)/A₂ = (84·1963 − 3000)/1348 ≈ 120 bar. בויסות ביציאה (Meter-out) בלי עומס צד המוט תמיד גבוה מהמשאבה.'}],
  tasks:[{q:P=>`ווסת זרימה מפוצה לחץ בצד המוט מכוון ל-${P.Qf} L/min, צילינדר Ø${P.D}/${P.dr}. מה מהירות ההזנה?`,a:P=>H.v(P.Qf,C11_areas(P)[1]),u:'mm/s',hint:'v = Q_f/A₂, A₂ = π(D² − d²)/4.',rand:P=>{P.D=pick([40,50,63,80]);P.dr=Math.round(P.D*pick([.5,.56,.63]));P.Qf=rnd(.5,5,.1);}},
    {q:P=>`Q = ${P.Q} L/min, צילינדר Ø${P.D}, LS1 ב-${P.xf} mm. כמה זמן נמשכת ההתקרבות המהירה?`,a:P=>P.xf/H.v(P.Q,H.A(P.D)),u:'s',hint:'t = s/v, v = Q/A₁.',rand:P=>{P.Q=rnd(8,40,1);P.D=pick([40,50,63]);P.xf=rnd(40,120,5);}},
    {q:P=>`רוצים הזנה של ${P.vt} mm/s בצילינדר Ø${P.D}/${P.dr} (ווסת בצד המוט). לאיזו ספיקה מכוונים את הווסת?`,a:P=>H.Q(P.vt,C11_areas(P)[1]),u:'L/min',hint:'Q = v·A₂·60/10⁶.',rand:P=>{P.vt=rnd(5,40,1);P.D=pick([40,50,63,80]);P.dr=Math.round(P.D*pick([.5,.56,.63]));}},
    {q:P=>`הזנה בלי עומס: לחץ המשאבה ${P.pr} bar, צילינדר Ø${P.D}/${P.dr}, ווסת בויסות ביציאה (Meter-out). מה הלחץ בצד המוט? (הזניחו חיכוך)`,a:P=>{const [A1,A2]=C11_areas(P);return P.pr*A1/A2;},u:'bar',hint:'p_B·A₂ = p_A·A₁.',rand:P=>{P.pr=pick([60,80,100,120]);P.D=pick([40,50,63,80]);P.dr=Math.round(P.D*pick([.5,.56,.63,.7]));}},
    {q:P=>`מהלך ${C11_S2} mm, LS1 ב-${P.xf} mm, Q_f = ${P.Qf} L/min, Ø${P.D}/${P.dr}. כמה זמן נמשכת ההזנה?`,a:P=>(C11_S2-P.xf)/H.v(P.Qf,C11_areas(P)[1]),u:'s',hint:'מרחק ההזנה (S − x_LS1) חלקי v = Q_f/A₂.',rand:P=>{P.xf=rnd(40,110,5);P.Qf=rnd(.8,4,.1);P.D=pick([40,50,63]);P.dr=Math.round(P.D*.56);}}],
  faults:[{id:'cam',t:'פין LS1 זז – ההזנה מתחילה מאוחר',sym:'"מקדחים נשברים בכניסה לחומר, והמהירות יורדת רק כשהמקדח כבר בתוך החלק."',hint:'בגרף x(t): באיזה מיקום השיפוע משתנה, ביחס לקו LS1 ולקו החומר? מתי נדלקת נורית LS1?',why:'ההזנה מתחילה ב-105 mm במקום 80 – אחרי פני החומר (90 mm). המקדח נכנס לחומר במהירות המהלך המהיר. מכוונים מחדש את הפין על המגררה.'},
    {id:'chk',t:'אל-חוזר K3 במיישר לא אוטם',sym:'"ההזנה מהירה מדי ותלויה בחומר, אבל היציאה האיטית מהחור תקינה."',hint:'השוו את מהירות ההזנה למהירות היציאה האיטית – הן אמורות להיות שוות. איזה אל-חוזר עוקף את הווסת רק בכיוון אחד?',why:'בהזנה השמן מצד המוט עובר דרך K3 הפגום ישר ל-K4 – בלי לעבור בווסת. ביציאה האיטית K3 עובד בכיוון החופשי שלו, ולכן רק כיוון אחד נפגע.'},
    {id:'comp',t:'בוכנת המפצה בווסת תקועה (הווסת = צמצם)',sym:'"המהירות משתנה עם קשיות החומר, קופצת בפריצה – וגם היציאה מהחור מהירה מדי."',hint:'האם מהירות ההזנה משתנה במגע ובפריצה? האם גם היציאה האיטית מהירה מהחישוב?',why:'בלי פיצוי הווסת הוא צמצם רגיל: Q = k·√Δp. על הווסת יש עד כ-120 bar במקום 6 – הספיקה גדלה פי 3–4 ותלויה בעומס, בשני הכיוונים.'}],
  test(H){const S=this,P=clone(S.P),st=S.init(P),A1=H.A(50),A2=H.Aann(50,28);let Ra,Rf,Rd,Rs,Rr;
    for(let t=0;t<14;t+=.01){const R=S.step(P,st,.01,{});const x=st.x;
      if(!Ra&&R.ph==='adv'&&x>20)Ra=R;if(!Rf&&R.ph==='feed'&&x>83&&x<88)Rf=R;if(!Rd&&R.ph==='feed'&&x>105&&x<130)Rd=R;if(!Rs&&R.ph==='rets'&&x<130)Rs=R;if(!Rr&&R.ph==='ret'&&x<60&&x>10)Rr=R;}
    return [['התקרבות מהירה v = Q/A₁',Ra.v,H.v(16,A1)],['הזנה לפני מגע v = Q_f/A₂',Rf.v,H.v(1.6,A2)],['בקדיחה (6 kN) v = Q_f/A₂',Rd.v,H.v(1.6,A2)],
      ['הגברת לחץ p_B = (p_A·A₁ − F)/A₂',Rf.pB,(Rf.pA*A1-10*C11_FR)/A2],['בקדיחה p_B = (p_A·A₁ − F)/A₂',Rd.pB,(Rd.pA*A1-10*(6000+C11_FR))/A2],
      ['יציאה איטית v = −Q_f/A₂ (אותו ווסת)',Rs.v,-H.v(1.6,A2)],['חזרה מהירה v = −Q/A₂',Rr.v,-H.v(16,A2)],['ספיקה בווסת = Q_f',Rd.Qv,1.6],
      ['UI מהירות',Rd.read[1].v,Rd.v],['UI צד מוט',Rf.read[4].v,Rf.pB]];}};

LABS.push({ch:11,title:'מעגלי בקרת מהירות',sims:[C11_SIM_MIO,C11_SIM_RECT]});
}
