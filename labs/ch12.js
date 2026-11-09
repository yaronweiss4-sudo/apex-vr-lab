/* lab 12 – same code as the website */
{




/* ===================== Chapter 12 – differential (regenerative) circuit (sim 41 · three tabs) ===================== */
/* ---------- shared constants, geometry and solver (prefix C12_ / c12_) ---------- */
const C12_kV=20,C12_kV2=40,C12_kC=40,C12_PC=1,C12_RAMP=20,C12_HYS=.15,C12_FF=400;
const C12_ser=(...k)=>1/Math.sqrt(k.reduce((s,x)=>s+1/(x*x),0));
const C12_geo=(D,d)=>{const A1=H.A(D),A2=H.Aann(D,Math.min(d,D-2));return {A1,A2,Ar:A1-A2,phi:A1/A2,d:Math.min(d,D-2)};};
const C12_dOf=(D,phi)=>D*Math.sqrt(1-1/phi);
const C12_kR0=C12_ser(C12_kV2,C12_kC);
/* quasi-static cylinder + regen solver.
   o:{dir,rg,Qp,pr,A1,A2,F(N, opposes extension),Ff(N, retraction friction),end,kS(seal-bypass k),pcR,kR}
   signs: v + extend · Q1 + into the cap · Q2 + out of the rod chamber */
function C12_core(o){const {A1,A2}=o,Ar=A1-A2,Qp=o.Qp,pr=o.pr,ov=Math.max(3,.06*pr),kS=o.kS||0,kf=o.kf||1,kV=C12_kV*kf,kV2=C12_kV2*kf,kC=C12_kC*kf;
  const Qr=p=>H.reliefQ(p,pr,ov,Qp),dead=()=>H.bisect(p=>Qr(p)-Qp,0,pr+ov*1.3);
  const r={v:0,ps:0,pA:0,pB:0,pN:0,Qin:0,Q1:0,Q2:0,Qr:0,Qb:0,QT:0,dr:0,stall:false,Qp,mode:o.dir>0?(o.rg?'regen':'norm'):o.dir<0?'ret':'hold'};
  if(o.dir===0){r.ps=dead();r.Qr=Qp;return r;}
  if(r.mode==='norm'){const kO=C12_ser(kV2,kV);const x=H.lin({Qp,pr,ov,Ain:A1,Aout:A2,F:o.end?1e9:o.F,kIn:kV,kOut:kO,kBleed:kS});
    Object.assign(r,{v:x.v,ps:x.ps,pA:x.stall?x.ps:x.pIn,Qin:x.Qin+x.Qb,Q1:x.Qin+x.Qb,Q2:x.Qout+x.Qb,Qr:x.Qr,Qb:x.Qb,stall:x.stall});
    r.pB=H.orDp(kO,r.Q2);r.pN=H.orDp(kV,r.Q2);r.QT=r.Q2;return r;}
  if(r.mode==='ret'){const kI=C12_ser(kV,kV2);const x=H.lin({Qp,pr,ov,Ain:A2,Aout:A1,F:o.end?1e9:(o.Ff??C12_FF),kIn:kI,kOut:kV,kBleed:kS});
    Object.assign(r,{v:-x.v,ps:x.ps,pB:x.stall?x.ps:x.pIn,Qin:x.Qin+x.Qb,Q1:-(x.Qout+x.Qb),Q2:-(x.Qin+x.Qb),Qr:x.Qr,Qb:x.Qb,stall:x.stall});
    r.pA=H.orDp(kV,-r.Q1);r.pN=r.ps-H.orDp(kV,-r.Q2);r.QT=-r.Q1;return r;}
  /* regenerative extension: rod oil -> 3/2 valve -> check -> joins the pump line ahead of the 4/3 (P→A carries Q + Q₂) */
  const pc=o.pcR??C12_PC,kR=C12_ser(kV2,o.kR??kC);
  const s=v=>{const Q2=H.Q(v,A2),Qin=H.Q(v,Ar),Q1=Qin+Q2,dr=pc+(Q2/kR)**2,dA=(Q1/kV)**2,pJ=(10*o.F+dr*A2+dA*A1)/Ar;return {Q2,Qin,Q1,dr,dA,pJ,pA:pJ-dA,ps:pJ};};
  const need=v=>{const q=s(v);return q.Qin+Qr(q.ps);};
  if(o.end||need(0)>=Qp){const ps=dead();Object.assign(r,{ps,pA:ps,pB:o.end?ps:clamp((ps*A1-10*o.F)/A2,0,ps+pc),Qr:Qp,stall:true});}
  else{const v=H.bisect(v=>need(v)-Qp,0,H.v(Qp,Ar));const q=s(v);Object.assign(r,{v,ps:q.ps,pA:q.pA,pB:q.pJ+q.dr,Qin:q.Qin,Q1:q.Q1,Q2:q.Q2,Qr:Qr(q.ps),dr:q.dr,dA:q.dA});}
  return r;}
/* time integration with small sub-steps (switching events stay sharp). o: {A1,A2,Qp,pr,F:x=>N,Ff,kS,pcR,kR,rg:st=>bool,after(st,r,h,dir)} */
function C12_run(P,st,dt,o){const n=Math.max(1,Math.ceil(dt/(o.h||.004))),h=dt/n;let r,atEnd=false,dir=0;
  for(let i=0;i<n;i++){dir=KIT.dirOf(P.pos);atEnd=(dir>0&&st.x>=P.S-1e-6)||(dir<0&&st.x<=1e-6);
    r=C12_core({dir,rg:o.rg(st),Qp:o.Qp,pr:o.pr,A1:o.A1,A2:o.A2,F:o.F(st.x),Ff:o.Ff,end:atEnd,kS:o.kS,pcR:o.pcR,kR:o.kR,kf:o.kf});r.atEnd=atEnd;
    st.x=clamp(st.x+r.v*h,0,P.S);st.t=(st.t||0)+h;if(o.after)o.after(st,r,h,dir);}
  KIT.autoCycle(P,st,dt,atEnd&&dir!==0);KIT.ease(st,'si',KIT.idx[P.pos],dt);KIT.rpmAng(st,dt,1450);return r;}
/* common result: pressures per net, signed flows per line, component states */
function C12_R(P,st,r,g,pm,ex={}){const regen=r.mode==='regen',byp=!!ex.byp&&r.mode==='ret';const Qp=r.Qp;
  return {r,g,pmax:pm,qref:Math.max(P.Q,1),atEnd:r.atEnd,v:r.v,Fp:(r.pA*g.A1-r.pB*g.A2)/10,
    p:{S:-.05,P:r.ps,A:r.pA,B:r.pB,R:regen?r.pB:0,N:r.pN,T:Math.min(1.2,(r.QT||0)/40)},
    q:{LS:Qp,LP1:Qp-r.Qr,LP2:Qp-r.Qr+(regen?r.Q2:0),LRV:r.Qr,LRT:r.Qr,LA:r.Q1,LR1:regen?r.Q2:0,LR2:regen?r.Q2:0,LB1:r.Q2,LB1b:byp?0:r.Q2,LB2a:regen||byp?0:r.Q2,LB2b:regen?0:r.Q2,LBP1:byp?-r.Q2:0,LBP2:byp?-r.Q2:0,LT:r.QT},
    c:Object.assign({C1:{x:st.x/P.S,uA:r.pA/pm,uB:r.pB/pm,lt:ex.lt},V1:{i:st.si},V2:{rg:regen||!!ex.rgShow,coil:!!ex.coil},CV:{open:regen&&r.v>0?1:0},
      P1:{on:true,ang:st.ang},RV:{open:clamp(r.Qr/Math.max(Qp,1e-6),0,1)}},ex.c||{})};}

/* ---------- symbols ---------- */
/* regen selector valve 3/2. ports C (cylinder rod side) top, R (regen line) bottom-left, N (to main DCV) bottom-right, X pilot (pilot version).
   solenoid version: spring position = normal, Y1 energised = regen. pilot version: spring position = regen, pilot pressure = normal.  cs={rg,coil} */
SYM.c12_v32={ports:o=>Object.assign({C:[0,-20],R:[-7,20],N:[7,20]},o.act==='pilot'?{X:[-66,0]}:{}),bb:o=>[-66,-20,32,20],
  draw(g,o){const pil=o.act==='pilot';const bL=SR(g,-45,-15,30,30,'syb'),bR=SR(g,-15,-15,30,30,'syb');
    const reg=cx=>{SA(g,cx,-12,cx-7,11,'sy',4.5);SL(g,cx+7,15,cx+7,8);SL(g,cx+3,8,cx+11,8);},
      nor=cx=>{SL(g,cx,-15,cx+7,15);SL(g,cx-7,15,cx-7,8);SL(g,cx-11,8,cx-3,8);};
    if(pil){nor(-30);reg(0);}else{reg(-30);nor(0);}
    SL(g,0,-15,0,-20);SL(g,-7,15,-7,20);SL(g,7,15,7,20);SP(g,zig(15,0,31,0,4,5),'sy thin');
    let coil=null;if(pil){SL(g,-66,0,-53,0,'sy pil');SP(g,'M-45,0 l-8,-5 v10z','syf');}
    else{coil=SR(g,-57,-8,12,16,'syb');SL(g,-55,6,-47,-6,'sy thin');ST(g,-51,-11,'Y1','st s');}
    return cs=>{const rg=!!(cs&&cs.rg);const left=pil?!rg:rg;bL.style.fill=left?'#dbeafe':'#fff';bR.style.fill=left?'#fff':'#dbeafe';
      if(coil)coil.style.fill=cs&&cs.coil?'#fca5a5':'#fff';};}};
B3.c12_v32=(c,o)=>{const M=m3(),g=new THREE.Group();g.add(at(box3(60,26,24,M.glass),-15,0,12));g.add(edges(at(box3(60,26,24,new THREE.MeshBasicMaterial({visible:false})),-15,0,12),.55));
  g.add(at(box3(64,8,28,M.dark),-15,-17,14));const sp=new THREE.Group();at(sp,-15,0,12);g.add(sp);sp.add(cyl3(2.6,70,M.steel,'x'));[-14,14].forEach(x=>sp.add(at(cyl3(7,9,M.steel,'x'),x,0,0)));
  let coil=null;if(o.act==='pilot')g.add(at(cyl3(8,12,M.blue,'x'),-51,0,12));else{g.add(edges(at(box3(14,20,20,M.black),-52,0,12)));coil=at(cyl3(6.5,8,mat(0x7f1d1d),'x'),-56,0,12);g.add(coil);}
  g.add(at(cyl3(6,12,M.alu,'x'),21,0,12));
  return {g,upd(cs){const rg=!!(cs&&cs.rg);const sh=o.act==='pilot'?!rg:rg;sp.position.x=-15+(sh?9:0);if(coil){const on=!!(cs&&cs.coil);coil.material.emissive.setHex(on?0xff3b30:0);coil.material.emissiveIntensity=on?.7:0;}}};};
/* pressure switch (port at the bottom, electrical terminal on top at [0,-16]). cs={on: contact closed} */
SYM.c12_ps={ports:o=>({p:[0,14]}),bb:o=>[-12,-17,12,14],
  draw(g,o){SL(g,0,14,0,9);SR(g,-11,-11,22,20,'syb');SP(g,'M-5,8 L0,3 L5,8','sy thin');SL(g,0,3,0,-1,'sy thin');SC(g,-6,-4,1.5,'syf');SC(g,6,-4,1.5,'syf');
    const sw=SL(g,-6,-4,5,-9,'sy');SL(g,0,-11,0,-16,'sy thin');
    return cs=>{const on=!!(cs&&cs.on);sw.setAttribute('x2',on?6:5);sw.setAttribute('y2',on?-4:-9);sw.style.stroke=on?'#dc2626':'';};}};
B3.c12_ps=(c,o)=>{const M=m3(),g=new THREE.Group();g.add(at(cyl3(2.5,8,M.steel),0,-9,10));g.add(edges(at(box3(18,16,16,M.blue),0,0,10)));g.add(at(cyl3(3,8,M.black),0,11,10));return {g};};
/* electrical wire (absolute points). cs={on} */
SYM.c12_wire={ports:o=>({}),bb:o=>{const xs=o.pts.map(p=>p[0]),ys=o.pts.map(p=>p[1]);return [Math.min(...xs),Math.min(...ys),Math.max(...xs),Math.max(...ys)];},
  draw(g,o){const p=SP(g,'M'+o.pts.map(q=>q.join(',')).join(' L'),'sy thin');p.style.strokeDasharray='2 2';if(o.t)ST(g,o.pts[0][0]+(o.tx||0),o.pts[0][1]+(o.ty||-4),o.t,'st s');
    return cs=>{p.style.stroke=cs&&cs.on?'#dc2626':'#1e293b';};}};
/* workpiece block met by the moving load at x = xc. placed at the cylinder centre. cs={off,on} */
SYM.c12_work={ports:o=>({}),bb:o=>[95,-22,225,22],
  draw(g0,o){const g=sv('g',{},g0);const r=SR(g,0,-20,16,40,'syb');for(let k=-16;k<20;k+=8)SL(g,1,k+6,15,k,'sy thin');SL(g,16,-24,16,24,'sy thick');
    const t=ST(g,8,-25,'חלק','st s');
    return cs=>{if(!cs)return;g.setAttribute('transform',`translate(${cs.off||0},0)`);r.style.fill=cs.on?'#fde68a':'#fff';};}};
B3.c12_work=(c,o)=>{const M=m3(),g=new THREE.Group();const b=edges(at(box3(16,40,30,M.dark),0,0,16));g.add(b);return {g,upd(cs){if(cs)b.position.x=(cs.off||0)+13;}};};
/* small live x–y chart. o={w,h,t,xl,yl,col[],dash[],sw[],leg[],nd,nm}; cs={x0,xm,y0,ym,xd,yd,L:[[[x,y]..]..],dots:[[x,y,k]],mks:[[x,y]],vx} */
SYM.c12_chart={ports:o=>({}),bb:o=>[-30,-16,o.w+6,o.h+(o.leg?38:24)],
  draw(g,o){SR(g,0,0,o.w,o.h,'syb');ST(g,o.w/2,-5,o.t||'','st b');ST(g,o.w/2,o.h+20,o.xl||'','st s');
    const yl=ST(g,-24,o.h/2,o.yl||'','st s');yl.setAttribute('transform',`rotate(-90 -24 ${o.h/2})`);
    for(let k=1;k<4;k++){SL(g,o.w*k/4,0,o.w*k/4,o.h,'sy thin').style.opacity=.15;SL(g,0,o.h*k/4,o.w,o.h*k/4,'sy thin').style.opacity=.15;}
    const tx=[0,1,2].map(k=>ST(g,o.w*k/2,o.h+10,'','st s')),ty=[0,1,2].map(k=>ST(g,-11,o.h-o.h*k/2+3,'','st s'));
    const cols=o.col||['#0b72d9'];const vx=SL(g,0,0,0,o.h,'sy thin');vx.style.stroke='#7c3aed';vx.style.strokeDasharray='3 2';
    const ps=cols.map((c,k)=>{const p=SP(g,'','sy');p.style.stroke=c;p.style.strokeWidth=(o.sw&&o.sw[k])||1.8;if(o.dash&&o.dash[k])p.style.strokeDasharray=o.dash[k];return p;});
    if(o.leg){const n=o.leg.length,stp=o.w/n;o.leg.forEach((t,k)=>{const x=stp*(k+.5);const l=SL(g,x+stp/2-14,o.h+31,x+stp/2-4,o.h+31,'sy');l.style.stroke=cols[k];l.style.strokeWidth=2.4;if(o.dash&&o.dash[k])l.style.strokeDasharray=o.dash[k];ST(g,x-5,o.h+34,t,'st s');});}
    const dots=[...Array(o.nd||0)].map(()=>SC(g,0,0,3.4,'syf'));
    const mks=[...Array(o.nm||0)].map(()=>{const c=SC(g,0,0,3.6,'sy');c.style.fill='#fff';c.style.stroke='#0f172a';c.style.strokeWidth=1.7;return c;});
    return cs=>{if(!cs)return;const x0=cs.x0||0,y0=cs.y0||0,X=x=>clamp((x-x0)/cs.xm,0,1.02)*o.w,Y=y=>o.h-clamp((y-y0)/cs.ym,0,1.06)*o.h;
      tx.forEach((t,k)=>t.textContent=fmt(x0+cs.xm*k/2,cs.xd??0));ty.forEach((t,k)=>t.textContent=fmt(y0+cs.ym*k/2,cs.yd??0));
      ps.forEach((p,k)=>{const L=cs.L[k];p.setAttribute('d',L&&L.length>1?'M'+L.map(q=>X(q[0]).toFixed(1)+','+Y(q[1]).toFixed(1)).join(' L'):'');});
      if(cs.vx!=null){vx.style.display='';vx.setAttribute('x1',X(cs.vx));vx.setAttribute('x2',X(cs.vx));}else vx.style.display='none';
      dots.forEach((d,k)=>{const q=cs.dots&&cs.dots[k];if(!q){d.style.display='none';return;}d.style.display='';d.setAttribute('cx',X(q[0]));d.setAttribute('cy',Y(q[1]));d.style.fill=cols[q[2]||0];});
      mks.forEach((d,k)=>{const q=cs.mks&&cs.mks[k];if(!q){d.style.display='none';return;}d.style.display='';d.setAttribute('cx',X(q[0]));d.setAttribute('cy',Y(q[1]));});};}};
/* normal vs regen comparison bars. cs={v:[vn,vr],F:[Fn,Fr],act:0|1|-1} */
SYM.c12_bars={ports:o=>({}),bb:o=>[-4,-16,(o.w||160)+4,84],
  draw(g,o){const W=o.w||160,L=38,BW=W-L-34;ST(g,W/2,-5,'רגילה מול מחזורית','st b');
    const grp=(y0,t)=>{ST(g,W/2,y0,t,'st s');return [0,1].map(k=>{const y=y0+5+k*13;ST(g,L/2,y+8,k?'מחזורית':'רגילה','st s');const bg=SR(g,L,y,BW,10,'sy thin');bg.style.fill='#f1f5f9';
      const b=SR(g,L,y,0,10,'');b.style.fill=k?'#dc2626':'#0b72d9';const v=ST(g,L+BW+17,y+8,'','st s');return {b,v};});};
    const rv=grp(8,'מהירות יציאה [mm/s]'),rf=grp(46,'כוח מרבי בכיול שסתום הפריקה [kN]');
    return cs=>{if(!cs)return;[[rv,cs.v],[rf,cs.F]].forEach(([rows,val])=>{const m=Math.max(val[0],val[1],1e-9);rows.forEach((o,k)=>{o.b.setAttribute('width',(BW*clamp(val[k]/m,0,1)).toFixed(1));o.b.style.opacity=cs.act<0||cs.act===k?1:.35;o.v.textContent=fmt(val[k],val[k]>=100?0:1);});});};}};

/* ---------- shared circuit: pump + relief + 4/3 + regen 3/2 + check + cylinder ---------- */
function C12_circ(o={}){const act=o.act||'sol';
  return {comps:[{id:'C1',type:'cyl',x:300,y:50,o:{load:{t:o.lt||'F'}},name:'צילינדר דו-פעולה עם עומס נגד היציאה',lbl:'צילינדר',lblAt:[-84,-22],l3:[0,-34]},
    {id:'V2',type:'c12_v32',x:400,y:140,o:{act},name:act==='pilot'?'שסתום מחזור 3/2 מפוקד: במנוחה – מחזורי; לחץ בקו A מעל p_sw מעביר למצב רגיל':'שסתום מחזור 3/2 מופעל סולנואיד Y1: במנוחה – רגיל, Y1 מופעל – מחזורי (לחיצה מחליפה)',lbl:'שסתום מחזור',lblAt:act==='pilot'?[-38,-25]:[50,-24]},
    {id:'CV',type:'check',x:350,y:180,rot:-90,o:{spring:true},name:'אל-חוזר המחזור: מעביר שמן רק מצד המוט בוכנה אל קו הלחץ של המשאבה (לפני ה-4/3)',lbl:'אל-חוזר',lblAt:[0,20]},
    {id:'V1',type:'dcv',x:300,y:250,o:{box:KIT.D43.closed,L:'lever',center:true},name:'שסתום פיקוד 4/3 ראשי, מרכז סגור (לחיצה מחליפה מצב)',lbl:'4/3',lblAt:[96,4]},
    {id:'P1',type:'pump',x:200,y:350,name:'משאבה קבועה + מנוע חשמלי',lbl:'משאבה',lblAt:[32,6]},{id:'T1',type:'tank',x:200,y:392,name:'מיכל'},
    {id:'RV',type:'pv',x:150,y:295,rot:-90,o:{kind:'relief'},name:'שסתום פריקה',lbl:'פריקה',lblAt:[0,-28]},{id:'T2',type:'tank',x:110,y:325,name:'מיכל'},{id:'T3',type:'tank',x:420,y:310,name:'מיכל'},
    {id:'GP',type:'gauge',x:240,y:283,net:'P',name:'מד לחץ משאבה',valAt:[16,22],l3:[0,-30]},{id:'GA',type:'gauge',x:271,y:108,net:'A',name:'מד לחץ p_A – צד מלא',valAt:[-2,27],l3:[0,-30]},{id:'GB',type:'gauge',x:375,y:88,net:'B',name:'מד לחץ p_B – צד המוט',l3:[0,-30]},...(o.extra||[])],
   lines:[{id:'LS',net:'S',pts:['T1.t','P1.in']},{id:'LP1',net:'P',pts:['P1.out',[200,295],[210,295]],nodot:true},{id:'LP2',net:'P',pts:[[210,295],[293,295],'V1.P'],nodot:true},{id:'LRV',net:'P',pts:[[200,295],'RV.P']},{id:'LRT',net:'T',pts:['RV.T',[110,295],'T2.t']},
    {id:'LT',net:'T',pts:['V1.T',[307,282],[420,282],'T3.t']},
    {id:'LA',net:'A',pts:['V1.A',[293,120],[250,120],'C1.A'],tag:{at:[256,157],t:'q'}},
    {id:'LB1',net:'B',pts:['C1.B',[350,100],[400,100]],nodot:true},{id:'LB1b',net:'B',pts:[[400,100],'V2.C'],nodot:true},{id:'LB2a',net:'N',pts:['V2.N',[407,190]],nodot:true},{id:'LB2b',net:'N',pts:[[407,190],[407,212],[307,212],'V1.B'],nodot:true},
    {id:'LR1',net:'R',pts:['V2.R',[393,180],'CV.in']},{id:'LR2',net:'P',pts:['CV.out',[210,180],[210,295]],tag:{at:[250,193],t:'q'}},...(o.xlines||[])]};}
function C12_v1click(id,P){if(id==='V1'){P.pos=P.pos==='a'?'0':P.pos==='0'?'b':'a';P.auto=false;return true;}return false;}

/* ---------- 41a · differential (regenerative) circuit ---------- */
const C12_A={id:'regen',n:41,t:'מעגל דיפרנציאלי',d:'יציאה רגילה מול יציאה מחזורית: השמן מצד המוט חוזר לצד המלא – המהירות עולה והכוח יורד',
  P:{mode:'regen',pos:'a',auto:true,D:63,d:45,F:10,Q:20,pr:120,S:300},
  ui(U,P){U.grp('מצב היציאה');U.seg(P,'mode','יציאה',[['norm','רגילה'],['regen','מחזורית']]);U.seg(P,'pos','ידית 4/3',KIT.pos3);U.chk(P,'auto','מחזור אוטומטי בסוף מהלך');
    U.grp('צילינדר ועומס');U.num(P,'D','קוטר בוכנה D','mm',{min:25,max:200,step:1});U.num(P,'d','קוטר מוט d','mm',{min:10,max:180,step:1});U.num(P,'F','עומס נגד היציאה','kN',{min:0,max:200,step:.5});
    U.grp('משאבה ושסתום פריקה');U.num(P,'Q','ספיקת משאבה Q','L/min',{min:2,max:200,step:1});U.num(P,'pr','כיול שסתום פריקה','bar',{min:20,max:350,step:5});
    U.grp('מהלך',false);U.num(P,'S','אורך מהלך','mm',{min:50,max:1500,step:10});U.note('לחיצה על שסתום המחזור בשרטוט מחליפה רגילה/מחזורית.');},
  circuit:P=>C12_circ({extra:[{id:'BAR',type:'c12_bars',x:452,y:172,o:{w:160},name:'השוואה חיה: מהירות וכוח מרבי ביציאה רגילה ומחזורית'}]}),
  init:P=>({x:0,si:KIT.idx[P.pos],t:0}),
  click(id,P){if(C12_v1click(id,P))return true;if(id==='V2'){P.mode=P.mode==='regen'?'norm':'regen';return true;}},
  step(P,st,dt,ctx){const f=ctx.fault;const g=C12_geo(P.D,P.d);const want=P.mode==='regen';
    const r=C12_run(P,st,dt,{A1:g.A1,A2:g.A2,Qp:P.Q,pr:P.pr,F:()=>P.F*1000,kS:f==='seal'?1.2:0,pcR:f==='chk'?15:undefined,kR:f==='chk'?8:undefined,rg:()=>want&&P.pos==='a'&&f!=='stuck'});
    const coil=want&&P.pos==='a';const R=C12_R(P,st,r,g,P.pr,{coil,lt:`\u200E${fmt(P.F,1)} kN`});
    const vn=H.v(P.Q,g.A1),vr=H.v(P.Q,g.Ar),vb=H.v(P.Q,g.A2);R.vn=vn;R.vr=vr;R.vb=vb;R.coil=coil;
    R.c.BAR={v:[vn,vr],F:[H.F(P.pr,g.A1)/1000,H.F(P.pr,g.Ar)/1000],act:r.mode==='norm'?0:r.mode==='regen'?1:-1};
    R.read=[{k:'לחץ משאבה',v:r.ps,u:'bar'},{k:'p_A – צד מלא',v:r.pA,u:'bar'},{k:'p_B – צד המוט',v:r.pB,u:'bar'},{k:'מהירות',v:r.v,u:'mm/s',max:Math.max(vr,vb)*1.05},
      {k:'Q₁ לצד המלא',v:r.Q1,u:'L/min',max:Math.max(P.Q*g.A1/g.Ar,P.Q*g.phi)},{k:'Q₂ מצד המוט',v:r.Q2,u:'L/min',max:Math.max(P.Q*g.A2/g.Ar,P.Q)},{k:'מיקום הבוכנה',v:st.x,u:'mm',max:P.S}];
    return R;},
  ins(P,R){const L=[],g=R.g,r=R.r,FrM=H.F(P.pr,g.Ar)/1000,FnM=H.F(P.pr,g.A1)/1000;
    if(r.mode==='regen'&&!r.stall){L.push({ic:'🔁',at:'CV',h:`יציאה מחזורית: <b>${fmt(r.Q2,1)} L/min</b> יוצאים מצד המוט, עוברים באל-חוזר ומצטרפים ל-${fmt(r.Qin,1)} L/min מהמשאבה – לצד המלא נכנסים <b>${fmt(r.Q1,1)} L/min</b>.`});
      L.push({ic:'⚡',h:`מהירות <b>${fmt(r.v,0)} mm/s</b> = Q/(A₁−A₂): המשאבה "ממלאת" רק את נפח המוט (${fmt(g.Ar,0)} mm²). ביציאה רגילה: ${fmt(R.vn,0)} mm/s – פי ${fmt(R.vr/R.vn,2)}.`});
      L.push({ic:'⚖️',at:'GB',h:`p_A = ${fmt(r.pA,1)} bar ו-p_B = ${fmt(r.pB,1)} bar – כמעט אותו לחץ משני צדי הבוכנה. הכוח נטו הוא רק <b>p·A_מוט</b>, ולכן ל-${fmt(P.F,1)} kN צריך פי ${fmt(g.A1/g.Ar,2)} יותר לחץ מביציאה רגילה.`});}
    if(r.mode==='regen'&&r.stall&&!R.atEnd)L.push({ic:'⛔',w:true,at:'C1',c:`${fmt(P.F,1)} kN > ${fmt(FrM,1)} kN – אין מספיק כוח במחזורי`,h:`העומס ${fmt(P.F,1)} kN גדול מהכוח המרבי במחזורי p·A_מוט = <b>${fmt(FrM,1)} kN</b>. הבוכנה נעצרת וכל הספיקה עוברת בשסתום הפריקה. ביציאה רגילה אפשר עד ${fmt(FnM,1)} kN.`});
    if(r.mode==='norm'&&!r.stall)L.push({ic:'➡️',h:`יציאה רגילה: שסתום המחזור במנוחה, והשמן מצד המוט (${fmt(r.Q2,1)} L/min) חוזר למיכל דרך B→T. v = Q/A₁ = <b>${fmt(r.v,0)} mm/s</b>, הכוח המרבי ${fmt(FnM,1)} kN.`});
    if(r.mode==='norm'&&r.stall&&!R.atEnd)L.push({ic:'⛔',w:true,at:'C1',c:'העומס גדול מהכוח המרבי',h:`גם ביציאה רגילה הכוח המרבי הוא ${fmt(FnM,1)} kN – פחות מ-${fmt(P.F,1)} kN. מגדילים קוטר או לחץ.`});
    if(r.mode==='ret'&&!r.stall)L.push({ic:'⬅️',h:`חזרה: שסתום המחזור במנוחה, v = Q/A₂ = <b>${fmt(-r.v,0)} mm/s</b>. ${Math.abs(g.phi-2)<.15?`כי φ = ${fmt(g.phi,2)} ≈ 2, החזרה כמעט שווה ליציאה המחזורית (${fmt(R.vr,0)} mm/s).`:`ביציאה מחזורית ${fmt(R.vr,0)} mm/s; השוויון מתקבל רק ב-φ = 2 (כאן φ = ${fmt(g.phi,2)}).`}`});
    if(R.atEnd&&r.mode==='regen')L.push({ic:'🧱',at:'GA',h:`סוף מהלך במחזורי: שני הצדדים ב-${fmt(r.ps,0)} bar, והבוכנה לוחצת רק ב-p·A_מוט = <b>${fmt(R.Fp/1000,1)} kN</b>. לכוח מלא (${fmt(H.F(r.ps,g.A1)/1000,1)} kN) צריך לעבור לרגיל.`});
    if(r.mode==='hold')L.push({ic:'⏸',at:'RV',h:'מרכז סגור: הצילינדר נעול וכל ספיקת המשאבה עוברת בשסתום הפריקה.'});
    if(g.phi<1.45)L.push({ic:'🚰',w:r.mode==='regen',at:'GA',c:'ספיקה גדולה בקו A',h:`מוט דק (φ = ${fmt(g.phi,2)}): במחזורי נכנסים לצד המלא Q·A₁/A_מוט = <b>${fmt(P.Q*g.A1/g.Ar,0)} L/min</b> – פי ${fmt(g.A1/g.Ar,1)} מספיקת המשאבה. הקו והאל-חוזר צריכים להתאים לזה.`});
    L.push({ic:'💡',h:`אותו הספק משאבה בשני המצבים: מרוויחים מהירות פי ${fmt(g.A1/g.Ar,2)} ומשלמים בכוח – ${fmt(FrM,1)} kN במקום ${fmt(FnM,1)} kN.`});return L;},
  calc(P,R){const g=R.g,Q=P.Q,vn=R.vn,vr=R.vr,vb=R.vb;
    return `<div class="kpis">${kpi('v רגילה',fmt(vn,1),'mm/s')}${kpi('v מחזורית',fmt(vr,1),'mm/s')}${kpi('F מרבי רגיל',fmt(H.F(P.pr,g.A1)/1000,1),'kN')}${kpi('F מרבי מחזורי',fmt(H.F(P.pr,g.Ar)/1000,1),'kN')}</div>`+
      det('שטחים',row('צד מלא',`A₁ = π·D²/4 = π·${P.D}²/4 = ${V(g.A1,'mm²')}`)+row('טבעת (צד המוט)',`A₂ = π·(D²−d²)/4 = ${V(g.A2,'mm²')}`)+row('שטח המוט',`A_מוט = A₁ − A₂ = π·${fmt(g.d,1)}²/4 = ${V(g.Ar,'mm²')}`)+row('יחס שטחים',`φ = A₁/A₂ = ${V(g.phi,'',3)}`),true)+
      det('מהירויות',row('יציאה רגילה',`v = ${fr('Q','A₁')} = ${fr(fmt(Q)+'·10⁶/60',fmt(g.A1,0))} = ${V(vn,'mm/s')}`)+row('יציאה מחזורית',`v = ${fr('Q','A₁ − A₂')} = ${fr(fmt(Q)+'·10⁶/60',fmt(g.Ar,0))} = ${V(vr,'mm/s')}`)+row('חזרה',`v = ${fr('Q','A₂')} = ${V(vb,'mm/s')}`)+row('יחס',`${fr('v_מחזורי','v_רגיל')} = ${fr('A₁','A₁ − A₂')} = ${fr('φ','φ − 1')} = ${V(g.A1/g.Ar,'',3)}`),true)+
      det('ספיקות ביציאה מחזורית',row('מצד המוט (דרך האל-חוזר)',`Q₂ = v·A₂ = Q·${fr('A₂','A₁ − A₂')} = ${V(Q*g.A2/g.Ar,'L/min')}`)+row('לצד המלא',`Q₁ = Q + Q₂ = Q·${fr('A₁','A₁ − A₂')} = ${V(Q*g.A1/g.Ar,'L/min')}`))+
      det('כוח ולחץ',row('רגילה',`F_max = p·A₁ = ${fmt(P.pr)}·${fmt(g.A1,0)}/10 = ${V(H.F(P.pr,g.A1)/1000,'kN')}`)+row('מחזורית',`p_A ≈ p_B ⇒ F = p·A₁ − p·A₂ = p·A_מוט ⇒ F_max = ${V(H.F(P.pr,g.Ar)/1000,'kN')}`)+
        row(`לחץ לעומס ${fmt(P.F,1)} kN`,`רגילה: p = F/A₁ = ${V(H.p(P.F*1000,g.A1),'bar')} · מחזורית: p = F/A_מוט = ${V(H.p(P.F*1000,g.Ar),'bar')}`,H.p(P.F*1000,g.Ar)<P.pr)+
        row('מדידה חיה (כולל הפסדים)',`F = (p_A·A₁ − p_B·A₂)/10 = (${fmt(R.r.pA,1)}·${fmt(g.A1,0)} − ${fmt(R.r.pB,1)}·${fmt(g.A2,0)})/10 = ${V(R.Fp/1000,'kN')}`),true)+
      det('הפסדים בלולאת המחזור',row('3/2 + אל-חוזר',`Δp_R = p_c + (Q₂/k_R)² = ${fmt(C12_PC,1)} + (${fmt(Q*g.A2/g.Ar,1)}/${fmt(C12_kR0,1)})² = ${V(C12_PC+(Q*g.A2/g.Ar/C12_kR0)**2,'bar')}`)+
        row('4/3 P→A (עובר בו Q₁)',`Δp = (Q₁/k_V)² = (${fmt(Q*g.A1/g.Ar,1)}/${C12_kV})² = ${V((Q*g.A1/g.Ar/C12_kV)**2,'bar')}`)+row('השפעה על הלחץ',`p_B − p_A = Δp_L ⇒ p_A = ${fr('F + Δp_L·A₂','A₁ − A₂')} – ההפסד "מוגבר" פי A₂/A_מוט = ${fmt(g.A2/g.Ar,2)}`))+
      det('זמני מהלך',row('',`t = S/v: רגילה ${V(P.S/vn,'s')} · מחזורית ${V(P.S/vr,'s')} · חזרה ${V(P.S/vb,'s')}`))+
      `<div class="note">מהירות חיובית = יציאה. ההספק זהה בשני המצבים (P = p·Q/600): מה שמרוויחים במהירות משלמים בכוח. p_c = לחץ פתיחת האל-חוזר, k = התנגדות שסתום 3/2 + אל-חוזר בטור.</div>`;},
  demo:[{t:'המעגל',x:'משאבה, שסתום פריקה, 4/3 ראשי וצילינדר. הרכיבים החדשים: <b>שסתום מחזור 3/2</b> בקו צד המוט, ו<b>אל-חוזר</b> שמחבר את צד המוט אל קו A.',reset:true,set:{mode:'norm',pos:'0',auto:false},hl:['V2','CV']},
    {t:'יציאה רגילה',x:'ידית במצב a. שסתום המחזור במנוחה: השמן מצד המוט עובר דרכו ודרך B→T למיכל. v = Q/A₁ ≈ <b>107 mm/s</b>, ול-10 kN צריך כ-32 bar.',set:{pos:'a'},act:(P,st)=>{st.x=0;},hl:['V1','V2','GA'],dur:6},
    {t:'מפעילים את Y1 – יציאה מחזורית',x:'שסתום המחזור מחבר את צד המוט לאל-חוזר. כ-<b>19 L/min</b> מצד המוט מצטרפים ל-20 L/min של המשאבה, ולצד המלא נכנסים כ-39 L/min. המהירות כמעט מוכפלת: <b>≈ 210 mm/s</b>.',set:{mode:'regen',pos:'a'},act:(P,st)=>{st.x=0;},hl:['V2','CV','C1'],dur:5},
    {t:'אותו לחץ משני הצדדים',x:'p_A ≈ 68 bar ו-p_B ≈ 73 bar. הלחץ דוחף את הבוכנה מצד אחד ובולם אותה מהצד השני, ונשאר כוח נטו של <b>p·(A₁−A₂) = p·A_מוט</b>. לכן לאותו עומס הלחץ הוכפל (ועוד כ-5 bar הפסדים בלולאת המחזור).',act:(P,st)=>{st.x=0;},hl:['GA','GB'],dur:5},
    {t:'הכוח המרבי במחזורי',x:'עומס 25 kN: במחזורי אפשר לכל היותר 120 bar × 1590 mm² ≈ <b>19.1 kN</b>. הבוכנה נעצרת והספיקה עוברת בשסתום הפריקה. ביציאה רגילה – עד 37.4 kN.',set:{F:25,mode:'regen',pos:'a'},act:(P,st)=>{st.x=60;},hl:['RV','C1'],dur:5},
    {t:'החזרה',x:'במצב b שסתום המחזור במנוחה: v = Q/A₂ ≈ <b>218 mm/s</b>. כי φ = A₁/A₂ ≈ 2, מהירות החזרה כמעט שווה ליציאה המחזורית.',set:{F:10,pos:'b',auto:false},act:(P,st)=>{st.x=P.S;},hl:['V1','C1'],dur:5},
    {t:'מוט דק יותר',x:'d = 36 מ"מ, עומס 6 kN: שטח המוט 1018 mm² – במחזורי ≈ <b>330 mm/s</b>, אבל הכוח המרבי רק 12.2 kN, ו-6 kN דורשים כבר ≈ 85 bar (כולל הפסדים של 61 L/min בלולאה). מוט דק = מהיר וחלש.',set:{d:36,F:6,mode:'regen',pos:'a',auto:true},act:(P,st)=>{st.x=0;},hl:['C1','GA'],dur:6}],
  predict:[{q:'עוברים מיציאה רגילה ליציאה מחזורית באותה ספיקה (Ø63/Ø45). מהירות היציאה:',set:{mode:'regen',pos:'a',auto:false},opts:['כמעט לא משתנה','בערך מוכפלת','בערך נחצית','גדלה פי 4'],a:1,why:'במחזורי v = Q/(A₁−A₂) = Q/A_מוט. שטח המוט (1590 mm²) הוא כמחצית מ-A₁ (3117 mm²), ולכן כ-210 mm/s במקום 107.'},
    {q:'עומס 10 kN. ביציאה רגילה מד p_A מראה כ-32 bar. כמה יראה ביציאה מחזורית?',set:{mode:'regen',pos:'a',auto:false},opts:['כ-32 bar','כ-68 bar','כ-16 bar','כמעט 0'],a:1,why:'במחזורי הכוח נטו הוא p·A_מוט, ושטח המוט כמחצית מ-A₁. לאותו כוח צריך כפול לחץ: 10000 N / 1590 mm² ≈ 63 bar, ועוד כ-5 bar הפסדים בלולאת המחזור.'},
    {q:'מעלים את העומס ל-25 kN ונשארים במחזורי (שסתום פריקה 120 bar). מה יקרה?',set:{F:25,mode:'regen',pos:'a',auto:false},opts:['הצילינדר יזוז לאט יותר','הצילינדר ייעצר והלחץ יעלה לכיול שסתום הפריקה','שום שינוי'],a:1,why:'הכוח המרבי במחזורי הוא 120 bar × 1590 mm² ≈ 19.1 kN < 25 kN. אין תנועה, והמשאבה מזרימה הכול דרך שסתום הפריקה.'},
    {q:'ביציאה מחזורית, כמה שמן עובר באל-חוזר המחזור?',set:{mode:'regen',pos:'a',auto:false},opts:['0 – הוא סגור','כ-19 L/min','בדיוק 20 L/min (ספיקת המשאבה)','כ-39 L/min'],a:1,why:'דרכו עובר כל השמן שיוצא מצד המוט: Q₂ = Q·A₂/(A₁−A₂) = 20·1527/1590 ≈ 19.2 L/min. לצד המלא נכנסים Q + Q₂ ≈ 39 L/min.'}],
  tasks:[{q:P=>`משאבה ${P.Q} L/min, צילינדר Ø${P.D}/Ø${P.d}. מה מהירות היציאה המחזורית?`,a:P=>H.v(P.Q,H.A(P.d)),u:'mm/s',hint:'v = Q/(A₁−A₂) = Q/(πd²/4). המירו Q·10⁶/60 ל-mm³/s.',rand:P=>{P.Q=rnd(10,60,1);P.D=pick([40,50,63,80,100]);P.d=Math.round(P.D*pick([.5,.56,.63,.7]));}},
    {q:P=>`כיול שסתום הפריקה ${P.pr} bar, קוטר מוט ${P.d} מ"מ. מה הכוח המרבי ביציאה מחזורית? (kN)`,a:P=>H.F(P.pr,H.A(P.d))/1000,u:'kN',hint:'F = p·A_מוט, ו-1 bar = 0.1 N/mm².',rand:P=>{P.pr=pick([80,100,120,160,200]);P.d=pick([25,28,36,45,56]);}},
    {q:P=>`Ø${P.D}/Ø${P.d}, Q = ${P.Q} L/min, יציאה מחזורית. כמה L/min חוזרים מצד המוט דרך האל-חוזר?`,a:P=>{const g=C12_geo(P.D,P.d);return P.Q*g.A2/g.Ar;},u:'L/min',hint:'Q₂ = v·A₂ = Q·A₂/(A₁−A₂).',rand:P=>{P.Q=rnd(10,60,1);P.D=pick([50,63,80,100]);P.d=Math.round(P.D*pick([.56,.63,.7]));}},
    {q:P=>`עומס ${P.F} kN, מוט Ø${P.d}, יציאה מחזורית. איזה לחץ נדרש? (בלי הפסדים)`,a:P=>H.p(P.F*1000,H.A(P.d)),u:'bar',hint:'p = F/A_מוט.',rand:P=>{P.F=rnd(2,30,.5);P.d=pick([28,36,45,56,70]);}}],
  faults:[{id:'stuck',t:'שסתום המחזור תקוע במצב רגיל (הספול (מגופה) לא זז)',sym:'"בחרנו יציאה מחזורית, נורית הסולנואיד דולקת – אבל הצילינדר יוצא באותה מהירות כמו ביציאה רגילה."',hint:'השוו את המהירות ל-Q/A₁ ול-Q/(A₁−A₂). מה מראה p_B, ולאן זורם השמן מצד המוט?',why:'הסליל מקבל מתח אבל הספול לא זז (לכלוך או ספול תפוס). השמן מצד המוט ממשיך למיכל, p_B כמעט 0 והמהירות Q/A₁. האבחנה: מהירות "רגילה" ו-p_B נמוך למרות פיקוד מחזורי.'},
    {id:'chk',t:'אל-חוזר המחזור תקוע חלקית – מפל לחץ גדול',sym:'"המהירות במצב מחזורי תקינה, אבל המשאבה חמה, והלחץ ביציאה גבוה בהרבה ממה שהיה."',hint:'בדקו את ההפרש p_B − p_A ביציאה מחזורית. כמה הוא צריך להיות?',why:'הפופט לא נפתח עד הסוף: p_B גבוה מ-p_A בכ-20 bar במקום 1–2 bar. כי p_A = (F + Δp·A₂)/A_מוט, ההפסד מעלה גם את לחץ המשאבה, והאנרגיה הופכת לחום.'},
    {id:'seal',t:'דליפה פנימית באטם הבוכנה',sym:'"היציאה המהירה בסדר גמור, אבל החזרה איטית, וביציאה רגילה עם עומס הצילינדר כמעט זוחל."',hint:'השוו את מהירות החזרה ל-Q/A₂. נסו גם יציאה רגילה עם עומס.',why:'במחזורי שני התאים כמעט באותו לחץ, ולכן דליפה דרך הבוכנה כמעט לא מורגשת. בחזרה וביציאה רגילה יש הפרש לחץ על הבוכנה – השמן עוקף אותה והמהירות יורדת.'}],
  test(H){const g=C12_geo(63,45);const P=clone(this.P);P.auto=false;const R=runSim(this,P,.4).R;
    const P2=clone(this.P);P2.auto=false;P2.mode='norm';const R2=runSim(this,P2,.4).R;
    const P3=clone(this.P);P3.auto=false;P3.pos='b';const s3=this.init(P3);s3.x=P3.S;let R3;for(let t=0;t<.4;t+=.02)R3=this.step(P3,s3,.02,{});
    const P4=clone(this.P);P4.auto=false;const R4=runSim(this,P4,3).R;
    const Q2=20*g.A2/g.Ar,dL=C12_PC+(Q2/C12_kR0)**2+((20+Q2)/C12_kV)**2;
    return [['v מחזורי = Q/(A₁−A₂)',R.v,H.v(20,g.Ar)],['v רגיל = Q/A₁',R2.v,H.v(20,g.A1)],['v חזרה = Q/A₂',R3.v,-H.v(20,g.A2)],
      ['Q₂ = Q·A₂/(A₁−A₂)',R.r.Q2,Q2],['Q₁ = Q + Q₂',R.r.Q1,20+Q2],['p_A = (F + Δp_L·A₂)/A_מוט',R.r.pA,(10*10000+dL*g.A2)/g.Ar],['p_B − p_A = Δp_L',R.r.pB-R.r.pA,dL],['שיווי כוחות p_A·A₁ − p_B·A₂ = F',R.Fp,10000],
      ['סוף מהלך מחזורי: F = p·A_מוט',R4.Fp,H.F(R4.r.ps,g.Ar)],['UI מהירות',R.read[3].v,R.v],['UI Q₂',R.read[5].v,R.r.Q2]];}};

/* ---------- 41b · area ratio study ---------- */
const C12_COL=['#0b72d9','#dc2626','#16a34a'];
const C12_B={id:'ratio',n:41,t:'השפעת יחס השטחים',d:'φ = A₁/A₂: לחץ, כוח, מהירות וזמן מהלך – יציאה רגילה, מחזורית וחזרה',
  P:{phi:2,D:63,Q:20,pr:120,F:4,S:300,mode:'both',pos:'a',auto:true},
  ui(U,P){U.grp('יחס השטחים φ = A₁/A₂');U.seg(P,'phi','φ',[[1.25,'1.25'],[1.6,'1.6'],[2,'2'],[2.5,'2.5'],[3,'3']]);U.num(P,'phi','φ – ערך חופשי','',{min:1.1,max:5,step:.05});
    U.grp('הפעלה');U.seg(P,'mode','יציאה',[['norm','רגילה'],['regen','מחזורית'],['both','לסירוגין']]);U.seg(P,'pos','ידית 4/3',KIT.pos3);U.chk(P,'auto','מחזור אוטומטי');
    U.grp('נתונים');U.num(P,'D','קוטר בוכנה D','mm',{min:25,max:200,step:1});U.num(P,'Q','ספיקת משאבה','L/min',{min:2,max:200,step:1});U.num(P,'pr','כיול שסתום פריקה','bar',{min:20,max:350,step:5});U.num(P,'F','עומס נגד היציאה','kN',{min:0,max:200,step:.5});
    U.grp('מהלך',false);U.num(P,'S','אורך מהלך','mm',{min:50,max:1500,step:10});},
  circuit:P=>C12_circ({extra:[{id:'CHV',type:'c12_chart',x:540,y:30,o:{w:150,h:78,t:'מהירות מול φ',xl:'φ = A₁/A₂',yl:'v [mm/s]',col:C12_COL,leg:['רגילה','מחזורית','חזרה'],nd:3,nm:3},name:'גרף: מהירות יציאה רגילה, מחזורית וחזרה כפונקציה של φ. נקודות מלאות – חישוב, עיגולים ריקים – מדידה'},
    {id:'CHF',type:'c12_chart',x:540,y:200,o:{w:150,h:78,t:'כוח מרבי מול φ',xl:'φ = A₁/A₂',yl:'F [kN]',col:C12_COL,leg:['רגילה','מחזורית','חזרה'],nd:3},name:'גרף: כוח מרבי בכיול שסתום הפריקה כפונקציה של φ'}]}),
  init:P=>({x:0,si:KIT.idx[P.pos],t:0,lp:null,alt:false,tE:{r:0,n:0},tR:0,tm:0,ok:false,rgC:true}),
  click(id,P){if(C12_v1click(id,P))return true;if(id==='V2'){P.mode=P.mode==='regen'?'norm':'regen';return true;}},
  step(P,st,dt,ctx){const f=ctx.fault;const d=C12_dOf(P.D,P.phi),g=C12_geo(P.D,d),ga=f==='rod'?C12_geo(P.D,d*.8):g;
    const Qp=f==='pump'?P.Q*.65:P.Q,pr=f==='relief'?P.pr*.45:P.pr;
    if(st.lp!==P.pos){if(P.pos==='a'){st.rgC=P.mode==='regen'||(P.mode==='both'&&!st.alt);st.tm=0;st.ok=st.x<1;}
      else if(P.pos==='b'){st.tm=0;st.ok=st.x>P.S-1;if(P.mode==='both'&&st.lp==='a')st.alt=!st.alt;}st.lp=P.pos;}
    const rgNow=()=>P.pos==='a'&&(P.mode==='both'?st.rgC:P.mode==='regen');
    const r=C12_run(P,st,dt,{A1:ga.A1,A2:ga.A2,Qp,pr,F:()=>P.F*1000,kf:3,rg:rgNow,after:(s,r,h,dir)=>{if(!s.ok||dir===0)return;s.tm+=h;
      if(dir>0&&s.x>=P.S-1e-6){s.tE[r.mode==='regen'?'r':'n']=s.tm;s.ok=false;}if(dir<0&&s.x<=1e-6){s.tR=s.tm;s.ok=false;}}});
    const R=C12_R(P,st,r,ga,P.pr,{coil:rgNow(),lt:`\u200E${fmt(P.F,1)} kN`});R.gN=g;R.d=d;R.Qp=Qp;
    const A1=g.A1,vn=H.v(P.Q,A1),vr=H.v(P.Q,g.Ar),vb=H.v(P.Q,g.A2);Object.assign(R,{vn,vr,vb,Fn:H.F(P.pr,A1)/1000,Fr:H.F(P.pr,g.Ar)/1000,Fb:H.F(P.pr,g.A2)/1000});
    const xs=[];for(let p=1.08;p<=4.001;p+=.04)xs.push(p);const vN=Q=>H.v(Q,A1);
    R.c.CHV={x0:1,xm:3,y0:0,ym:KIT.nice(vn*4),xd:1,L:[xs.map(p=>[p,vn]),xs.map(p=>[p,vn*p/(p-1)]),xs.map(p=>[p,vn*p])],dots:[[P.phi,vn,0],[P.phi,vr,1],[P.phi,vb,2]],vx:P.phi,
      mks:[st.tE.n?[P.phi,P.S/st.tE.n]:null,st.tE.r?[P.phi,P.S/st.tE.r]:null,st.tR?[P.phi,P.S/st.tR]:null]};
    R.c.CHF={x0:1,xm:3,y0:0,ym:KIT.nice(R.Fn*1.05),xd:1,L:[xs.map(p=>[p,R.Fn]),xs.map(p=>[p,R.Fn*(1-1/p)]),xs.map(p=>[p,R.Fn/p])],dots:[[P.phi,R.Fn,0],[P.phi,R.Fr,1],[P.phi,R.Fb,2]],vx:P.phi};
    R.phiM=st.tE.n&&st.tR?st.tE.n/st.tR:0;
    R.read=[{k:'לחץ משאבה',v:r.ps,u:'bar'},{k:'מהירות',v:r.v,u:'mm/s',max:Math.max(vr,vb)*1.05},{k:'מיקום הבוכנה',v:st.x,u:'mm',max:P.S},
      {k:'זמן יציאה מחזורית',v:st.tE.r,u:'s',dg:2},{k:'זמן יציאה רגילה',v:st.tE.n,u:'s',dg:2},{k:'זמן חזרה',v:st.tR,u:'s',dg:2},{k:'φ בפועל (מהזמנים)',v:R.phiM,u:'',dg:2}];
    return R;},
  ins(P,R){const L=[],g=R.gN,ph=P.phi;
    L.push({ic:'📐',h:`φ = ${fmt(ph,2)} ⇒ מוט Ø<b>${fmt(R.d,1)}</b> בצילינדר Ø${P.D}: A₂ = A₁/φ = ${fmt(g.A2,0)} mm², A_מוט = A₁(1 − 1/φ) = ${fmt(g.Ar,0)} mm².`});
    if(Math.abs(ph-2)<.03)L.push({ic:'🟰',at:'C1',h:`ב-φ = 2 שטח המוט שווה לשטח הטבעת, ולכן <b>יציאה מחזורית = חזרה</b>: ${fmt(R.vr,0)} mm/s לשני הכיוונים, ו-${fmt(R.Fr,1)} kN כוח מרבי לשניהם.`});
    else if(ph<2)L.push({ic:'🏎️',h:`φ < 2 (מוט דק): היציאה המחזורית (${fmt(R.vr,0)} mm/s) <b>מהירה</b> מהחזרה (${fmt(R.vb,0)} mm/s), אבל הכוח במחזורי רק ${fmt(R.Fr,1)} kN – ${fmt(100*(1-1/ph),0)}% מהרגיל.`});
    else L.push({ic:'🐢',h:`φ > 2 (מוט עבה): היציאה המחזורית (${fmt(R.vr,0)} mm/s) <b>איטית</b> מהחזרה (${fmt(R.vb,0)} mm/s), אבל הכוח במחזורי גדול יותר – ${fmt(R.Fr,1)} kN (${fmt(100*(1-1/ph),0)}% מהרגיל).`});
    L.push({ic:'⏱️',h:`זמני מהלך מחושבים: רגילה ${fmt(P.S/R.vn,2)} s · מחזורית ${fmt(P.S/R.vr,2)} s · חזרה ${fmt(P.S/R.vb,2)} s. מחזור שלם עם יציאה מחזורית קצר ב-${fmt(100*(1-(P.S/R.vr+P.S/R.vb)/(P.S/R.vn+P.S/R.vb)),0)}%.`});
    if(P.F>R.Fr*.98)L.push({ic:'⛔',w:true,at:'C1',c:`${fmt(P.F,1)} kN – יותר מהכוח המחזורי`,h:`העומס ${fmt(P.F,1)} kN גדול מהכוח המרבי במחזורי (${fmt(R.Fr,1)} kN): יציאה מחזורית תיעצר. צריך φ גדול יותר, לחץ גבוה יותר או יציאה רגילה.`});
    const Q1=P.Q*ph/(ph-1);if(Q1>P.Q*3)L.push({ic:'🚰',w:true,at:'GA',c:`${fmt(Q1,0)} L/min בקו A`,h:`φ = ${fmt(ph,2)}: במחזורי נכנסים לצד המלא Q·φ/(φ−1) = <b>${fmt(Q1,0)} L/min</b> – פי ${fmt(ph/(ph-1),1)} מהמשאבה. קו A, האל-חוזר והשסתום חייבים להתאים.`});
    if(R.phiM)L.push({ic:'🔎',at:'CHV',h:`מהמדידה: t רגילה / t חזרה = <b>${fmt(R.phiM,2)}</b> – זה φ בפועל (שני הזמנים באותה ספיקה, ולכן היחס תלוי רק בשטחים).`});
    else L.push({ic:'🔎',h:'עיגולים ריקים בגרף = מהירויות שנמדדו מזמני המהלך. אחרי מחזור מלא אפשר לחשב φ בפועל = t רגילה / t חזרה.'});return L;},
  calc(P,R){const g=R.gN,Q=P.Q,p=P.pr,ph=P.phi;
    return `<div class="kpis">${kpi('d מוט',fmt(R.d,1),'mm')}${kpi('v מחזורית',fmt(R.vr,0),'mm/s')}${kpi('v חזרה',fmt(R.vb,0),'mm/s')}${kpi('F מחזורי',fmt(R.Fr,1),'kN')}</div>`+
      det('מ-φ לקוטר המוט',row('',`A₂ = A₁/φ ⇒ A_מוט = A₁(1 − 1/φ) ⇒ d = D·${sq('1 − 1/φ')} = ${P.D}·${sq('1 − 1/'+fmt(ph,2))} = ${V(R.d,'mm')}`)+row('',`A₁ = ${V(g.A1,'mm²')} · A₂ = ${V(g.A2,'mm²')} · A_מוט = ${V(g.Ar,'mm²')}`),true)+
      det('שלוש התנועות',row('יציאה רגילה',`v = Q/A₁ = ${V(R.vn,'mm/s')} · F = p·A₁ = ${V(R.Fn,'kN')} · t = ${V(P.S/R.vn,'s')}`)+row('יציאה מחזורית',`v = Q/(A₁−A₂) = v_רגיל·${fr('φ','φ−1')} = ${V(R.vr,'mm/s')} · F = p·A_מוט = F_רגיל·(1 − 1/φ) = ${V(R.Fr,'kN')} · t = ${V(P.S/R.vr,'s')}`)+
        row('חזרה',`v = Q/A₂ = v_רגיל·φ = ${V(R.vb,'mm/s')} · F = p·A₂ = F_רגיל/φ = ${V(R.Fb,'kN')} · t = ${V(P.S/R.vb,'s')}`)+row('יחס מחזורית/חזרה',`${fr('v_מחזורי','v_חזרה')} = ${fr('A₂','A₁ − A₂')} = ${fr('1','φ − 1')} = ${V(1/(ph-1),'',3)} ⇒ שוויון ב-φ = 2`),true)+
      det('לחץ לעומס הנוכחי',row(`עומס ${fmt(P.F,1)} kN`,`רגילה p = F/A₁ = ${V(H.p(P.F*1000,g.A1),'bar')} · מחזורית p = F/A_מוט = ${V(H.p(P.F*1000,g.Ar),'bar')}`,H.p(P.F*1000,g.Ar)<p))+
      det('ספיקות',row('לצד המלא במחזורי',`Q₁ = Q·${fr('φ','φ − 1')} = ${V(Q*ph/(ph-1),'L/min')}`)+row('מהצד המלא בחזרה',`Q = Q_p·φ = ${V(Q*ph,'L/min')}`))+
      det('מדידה מול חישוב',row('',`t נמדד: מחזורית ${V(R.read[3].v,'s',2)} · רגילה ${V(R.read[4].v,'s',2)} · חזרה ${V(R.read[5].v,'s',2)}`)+row('φ נמדד',`t_רגילה / t_חזרה = A₁/A₂ = ${V(R.phiM,'',3)}`))+
      `<div class="note">ההספק זהה בשלוש התנועות (p·Q); φ רק "מחלק" אותו אחרת בין כוח למהירות. צילינדרים תקניים מגיעים בדרך כלל עם φ בין 1.25 ל-2.5. בלשונית זו השסתומים והצנרת מותאמים לספיקה Q₁ (הפסדים קטנים).</div>`;},
  demo:[{t:'ניסוי φ',x:'אותו צילינדר Ø63 ואותה משאבה; משנים רק את קוטר המוט דרך <b>φ = A₁/A₂</b>. המעגל מחליף לסירוגין: יציאה מחזורית ← חזרה ← יציאה רגילה ← חזרה.',reset:true,hl:['C1','V2'],dur:7},
    {t:'φ = 2 – נקודת השוויון',x:'שטח המוט שווה לשטח הטבעת: יציאה מחזורית וחזרה ב-<b>214 mm/s</b>, ובשתיהן אותו כוח מרבי (18.7 kN). בגרף – הקו האדום והירוק נחתכים.',set:{phi:2},hl:['CHV','CHF'],dur:7},
    {t:'מוט דק – φ = 1.25',x:'המחזורית קופצת ל-<b>535 mm/s</b> (פי 5 מהרגילה), אבל הכוח במחזורי רק 20% – 7.5 kN. לצד המלא נכנסים 100 L/min!',set:{phi:1.25},act:(P,st)=>{st.x=0;P.pos='a';st.lp=null;st.alt=false;},hl:['CHV','GA'],dur:6},
    {t:'מוט עבה – φ = 3',x:'המחזורית איטית מהחזרה (160 מול 321 mm/s), אבל הכוח במחזורי 2/3 מהרגיל – 24.9 kN.',set:{phi:3},act:(P,st)=>{st.x=0;P.pos='a';st.lp=null;st.alt=false;},hl:['CHF','C1'],dur:6},
    {t:'מודדים φ',x:'אחרי מחזור מלא: <b>t רגילה / t חזרה = A₁/A₂</b>. זה φ האמיתי של הצילינדר – בלי למדוד את המוט. העיגולים הריקים בגרף הם המהירויות שנמדדו.',set:{phi:2,auto:true},act:(P,st)=>{st.x=0;P.pos='a';st.lp=null;st.alt=false;},hl:['CHV'],dur:9},
    {t:'עומס כבד',x:'עומס 22 kN ב-φ = 2: יותר מהכוח המחזורי (18.7 kN). הבוכנה נעצרת במחזורי – בדיוק המקום שבו מעגל אוטומטי עובר ליציאה רגילה (הלשונית הבאה).',set:{F:22,mode:'regen'},act:(P,st)=>{st.x=0;P.pos='a';st.lp=null;},hl:['RV','CHF'],dur:6}],
  predict:[{q:'φ = 2. איך תשווה מהירות היציאה המחזורית למהירות החזרה?',set:{phi:2,mode:'both'},opts:['המחזורית מהירה יותר','שוות','החזרה מהירה יותר'],a:1,dur:6,why:'במחזורי v = Q/A_מוט ובחזרה v = Q/A₂. ב-φ = 2 מתקיים A₂ = A₁/2 = A_מוט, ולכן המהירויות שוות.'},
    {q:'מקטינים את φ מ-2 ל-1.25 (מוט דק), באותו D ו-Q. מהירות היציאה המחזורית:',set:{phi:1.25,mode:'regen'},opts:['כמעט לא משתנה','גדלה פי 2.5','גדלה פי 5','קטנה'],a:1,why:'v_מחזורי = v_רגיל·φ/(φ−1). ב-φ = 2: פי 2; ב-φ = 1.25: פי 5. כלומר פי 2.5 יותר מקודם.'},
    {q:'φ = 3. מה הכוח המרבי ביציאה מחזורית ביחס ליציאה רגילה?',set:{phi:3,mode:'regen'},opts:['1/3','1/2','2/3','שווה'],a:2,why:'F_מחזורי/F_רגיל = A_מוט/A₁ = 1 − 1/φ = 2/3.'},
    {q:'מכפילים את ספיקת המשאבה ל-40 L/min. מה יקרה ל-φ הנמדד (t רגילה / t חזרה)?',set:{Q:40},opts:['יוכפל','לא ישתנה','ייחצה'],a:1,dur:8,why:'שני הזמנים מתקצרים פי 2, והיחס ביניהם נשאר A₁/A₂ – תכונה של הצילינדר בלבד.'}],
  tasks:[{q:P=>`צילינדר Ø${P.D}, נדרש φ = ${P.phi}. מה קוטר המוט?`,a:P=>C12_dOf(P.D,P.phi),u:'mm',hint:'A₂ = A₁/φ ⇒ d = D·√(1 − 1/φ).',rand:P=>{P.D=pick([40,50,63,80,100,125]);P.phi=pick([1.25,1.4,1.6,2,2.5]);}},
    {q:P=>`φ = ${P.phi}. פי כמה מהירה היציאה המחזורית מהיציאה הרגילה?`,a:P=>P.phi/(P.phi-1),u:'',hint:'v_מחזורי/v_רגיל = A₁/(A₁−A₂) = φ/(φ−1).',rand:P=>{P.phi=pick([1.25,1.4,1.6,2,2.5,3]);}},
    {q:P=>`Ø${P.D}, φ = ${P.phi}, כיול ${P.pr} bar. מה הכוח המרבי ביציאה מחזורית? (kN)`,a:P=>H.F(P.pr,H.A(P.D)*(1-1/P.phi))/1000,u:'kN',hint:'F = p·A₁·(1 − 1/φ).',rand:P=>{P.D=pick([50,63,80,100]);P.phi=pick([1.25,1.6,2,2.5]);P.pr=pick([100,120,160,200]);}},
    {q:P=>`Ø${P.D}, φ = ${P.phi}, Q = ${P.Q} L/min, מהלך ${P.S} מ"מ. כמה זמן נמשכת היציאה המחזורית?`,a:P=>P.S/H.v(P.Q,H.A(P.D)*(1-1/P.phi)),u:'s',hint:'t = S/v, v = Q/(A₁(1 − 1/φ)).',rand:P=>{P.D=pick([50,63,80]);P.phi=pick([1.6,2,2.5]);P.Q=rnd(10,60,1);P.S=rnd(200,800,50);}},
    {q:P=>`במדידה: יציאה רגילה ${fmt(P.S/H.v(P.Q,H.A(P.D)),2)} s, חזרה ${fmt(P.S/H.v(P.Q,H.A(P.D)/P.phi),2)} s. מה φ של הצילינדר?`,a:P=>P.phi,u:'',hint:'φ = t_רגילה / t_חזרה (אותה ספיקה, אותו מהלך).',rand:P=>{P.phi=pick([1.4,1.6,2,2.5]);P.Q=rnd(10,40,1);P.D=pick([50,63,80]);}}],
  faults:[{id:'rod',t:'הותקן צילינדר עם מוט דק מהמתוכנן (φ בפועל קטן)',sym:'"אחרי החלפת הצילינדר היציאה המהירה מהירה יותר מבעבר, אבל החזרה איטית יותר. הספק טוען שזה אותו דגם."',hint:'השוו את זמני המהלך הנמדדים לזמנים המחושבים מ-φ. העיגולים הריקים בגרף – האם הם על הקווים?',why:'מוט קטן ב-20%: A_מוט קטן ו-A₂ גדל. המחזורית מהירה יותר והחזרה איטית יותר מהחישוב, ו-t רגילה / t חזרה נותן φ ≈ 1.5 במקום 2. כל זמן לבד לא מספיק – היחס מגלה את הגאומטריה.'},
    {id:'pump',t:'משאבה שחוקה – ספיקה נמוכה',sym:'"הכול איטי – גם היציאה המהירה, גם הרגילה וגם החזרה. הלחצים נראים רגילים."',hint:'חלקו כל זמן נמדד בזמן המחושב. האם היחס זהה בכל התנועות? ומה φ הנמדד?',why:'ספיקה נמוכה ב-35% מאריכה את כל הזמנים באותו יחס (×1.54). φ הנמדד נשאר נכון – הצילינדר תקין, הבעיה במקור הספיקה.'},
    {id:'relief',t:'שסתום פריקה מכויל נמוך',sym:'"המהירויות תקינות, אבל בסוף מהלך מד המשאבה לא מגיע ללחץ שכיילנו, ועומס כבד נתקע ביציאה המהירה."',hint:'מה מראה מד המשאבה כשהבוכנה בקצה המהלך?',why:'השסתום נפתח בכ-54 bar במקום 120. בתנועה עם עומס קטן לא רואים כלום, אבל הלחץ בסוף מהלך – וגם הכוח המרבי, במיוחד במחזורי (p·A_מוט) – נמוכים מהחישוב.'}],
  test(H){const P=clone(this.P);const {R,st}=runSim(this,P,8);const g=C12_geo(63,C12_dOf(63,2));const vr=H.v(20,g.Ar),vb=H.v(20,g.A2),vn=H.v(20,g.A1);
    return [['d = D·√(1−1/φ)',C12_dOf(63,2),44.548],['A₂ = A₁/φ',g.A2,g.A1/2],['t מחזורית = S·A_מוט/Q',st.tE.r,300/vr,.015],['t חזרה = S·A₂/Q',st.tR,300/vb,.015],['t רגילה = S·A₁/Q',st.tE.n,300/vn,.015],
      ['φ נמדד = A₁/A₂',R.phiM,2,.015],['F מחזורי = p·A₁(1−1/φ)',R.Fr*1000,H.F(120,g.A1)*(1-1/2)],['F חזרה = F רגיל/φ',R.Fb,R.Fn/2],['UI φ נמדד',R.read[6].v,R.phiM]];}};

/* ---------- 41c · automatic switch: rapid regen approach -> full-force stroke ---------- */
const C12_C={id:'auto',n:41,t:'מהיר מחזורי ← מהלך כוח',d:'מעבר אוטומטי מגישה מחזורית מהירה למהלך כוח מלא כשהלחץ עולה – מתג לחץ או שסתום 3/2 מפוקד',
  P:{sw:'ps',psw:50,Fw:30,xc:200,pos:'a',auto:true,D:63,d:45,Q:20,pr:160,Fa:1,S:300},
  key:P=>P.sw,
  ui(U,P){U.grp('מיתוג אוטומטי');U.seg(P,'sw','מיתוג',[['ps','מתג לחץ'],['pil','פיקוד 3/2']],true);U.num(P,'psw','לחץ מיתוג p_sw','bar',{min:2,max:350,step:1});
    U.grp('חלק העבודה');U.num(P,'Fw','כוח לחיצה נדרש','kN',{min:0,max:200,step:1});U.num(P,'xc','מגע בחלק במיקום','mm',{min:10,max:1400,step:10});
    U.grp('הפעלה');U.seg(P,'pos','ידית 4/3',KIT.pos3);U.chk(P,'auto','מחזור אוטומטי');
    U.grp('צילינדר, משאבה ועומס גישה',false);U.num(P,'D','קוטר בוכנה D','mm',{min:25,max:200,step:1});U.num(P,'d','קוטר מוט d','mm',{min:10,max:180,step:1});U.num(P,'Q','ספיקת משאבה','L/min',{min:2,max:200,step:1});
    U.num(P,'pr','כיול שסתום פריקה','bar',{min:20,max:350,step:5});U.num(P,'Fa','עומס בגישה (חיכוך)','kN',{min:0,max:50,step:.1});U.num(P,'S','אורך מהלך','mm',{min:50,max:1500,step:10});},
  circuit(P){const pil=P.sw==='pil';
    const ex=[{id:'W1',type:'c12_work',x:300,y:50,name:'החלק המעובד – המגע מתחיל ב-x_c'},
      {id:'CHP',type:'c12_chart',x:540,y:30,o:{w:150,h:78,t:'p_A לאורך המהלך',xl:'x [mm]',yl:'p [bar]',col:['#dc2626','#7c3aed','#94a3b8'],dash:['','5 3','2 3'],sw:[2,1.4,1.2],leg:['p_A','p_sw','מגע']},name:'גרף: לחץ הצד המלא לאורך מהלך היציאה הנוכחי, קו מיתוג וקו המגע'},
      {id:'CHV',type:'c12_chart',x:540,y:200,o:{w:150,h:78,t:'מהירות לאורך המהלך',xl:'x [mm]',yl:'v [mm/s]',col:['#0b72d9','#dc2626','#16a34a'],dash:['','4 3','4 3'],sw:[2,1.2,1.2],leg:['נמדד','מחזורי','רגיל']},name:'גרף: מהירות הבוכנה לאורך מהלך היציאה הנוכחי'}];
    const xl=[];
    if(pil){ex.push({id:'CB',type:'check',x:450,y:140,o:{spring:true},name:'אל-חוזר עוקף: בחזרה מעביר שמן מה-4/3 לצד המוט (שסתום המחזור במנוחה – מחזורי)',lbl:'עוקף',lblAt:[26,4]});
      xl.push({id:'LX',net:'A',kind:'pilot',pts:[[293,140],'V2.X']},{id:'LBP1',net:'N',pts:[[407,190],[450,190],'CB.in']},{id:'LBP2',net:'B',pts:['CB.out',[450,100],[400,100]]});}
    else{ex.push({id:'PS',type:'c12_ps',x:322,y:126,name:'מתג לחץ על קו A: מנתק את Y1 כש-p_A ≥ p_sw (נעילה עד סוף המהלך)',lbl:'מתג לחץ',lblAt:[0,-27]},{id:'WR',type:'c12_wire',x:0,y:0,o:{pts:[[322,110],[337,110],[337,140],[343,140]]},name:'חיבור חשמלי: מתג הלחץ ← בקר ← סולנואיד Y1'});
      xl.push({id:'LPS',net:'A',pts:[[293,140],'PS.p']});}
    return C12_circ({act:pil?'pilot':'sol',lt:'כלי',extra:ex,xlines:xl});},
  init:P=>({x:0,si:KIT.idx[P.pos],t:0,lp:null,rg:true,xsw:null,psa:0,nsw:0,swT:9,tr:[],tv:[],tm:0,ok:false,tE:0}),
  click(id,P){return C12_v1click(id,P);},
  step(P,st,dt,ctx){const f=ctx.fault;const g=C12_geo(P.D,P.d);const xc=Math.min(P.xc,P.S-5),Fw=P.Fw*1000,Fa=P.Fa*1000;
    const F=x=>Fa+(x>xc?Fw*Math.min(1,(x-xc)/C12_RAMP):0);
    if(st.lp!==P.pos){if(P.pos==='a'){st.rg=f!=='early';st.xsw=null;st.psa=0;st.nsw=0;st.tr=[[st.x,0]];st.tv=[[st.x,0]];st.tm=0;st.ok=st.x<1;}else if(P.pos==='b'){st.ok=false;}st.lp=P.pos;}
    if(P.pos!=='a')st.rg=false;
    const r=C12_run(P,st,dt,{A1:g.A1,A2:g.A2,Qp:P.Q,pr:P.pr,F,Ff:Fa,h:.001,kS:f==='seal'?1.2:0,rg:s=>s.rg,after:(s,r,h,dir)=>{if(dir<=0)return;s.swT+=h;
      if(s.rg){if(f!=='nosw'&&r.pA>=P.psw&&s.swT>.08){s.rg=false;s.nsw++;s.swT=0;if(s.xsw==null){s.xsw=s.x;s.psa=r.pA;}}}
      else if(P.sw==='pil'&&f!=='early'&&r.pA<P.psw*(1-C12_HYS)&&s.swT>.08&&!r.atEnd){s.rg=true;s.nsw++;s.swT=0;}
      if(s.ok){s.tm+=h;if(s.x>=P.S-1e-6){s.tE=s.tm;s.ok=false;}}
      const lt=s.tr[s.tr.length-1];if(!lt||Math.abs(s.x-lt[0])>1.5||Math.abs(r.pA-lt[1])>2){if(s.tr.length<600){s.tr.push([s.x,r.pA]);s.tv.push([s.x,r.v]);}}}});
    const coil=P.sw==='ps'&&st.rg;const Fx=F(st.x);
    const pil=P.sw==='pil';const R=C12_R(P,st,r,g,P.pr,{coil,byp:pil,rgShow:pil&&P.pos!=='a'&&r.pA<P.psw});R.F=Fx;R.xc=xc;
    const vn=H.v(P.Q,g.A1),vr=H.v(P.Q,g.Ar),ap=C12_core({dir:1,rg:true,Qp:P.Q,pr:P.pr,A1:g.A1,A2:g.A2,F:Fa});
    Object.assign(R,{vn,vr,pApp:ap.pA,dL:(ap.dr||0)+(ap.dA||0),pReg:(10*(Fa+Fw)+C12_PC*g.A2)/g.Ar,
      tPlan:xc/vr+(P.S-xc)/vn,tNorm:P.S/vn,xsw:st.xsw,psa:st.psa,nsw:st.nsw,rg:st.rg});
    R.c.W1={off:-55+xc/P.S*104+153,on:st.x>xc+.5};R.c.PS={on:st.rg&&P.pos==='a'};R.c.WR={on:coil&&P.pos==='a'};
    const pm=KIT.nice(P.pr*1.1);
    R.c.CHP={x0:0,xm:P.S,y0:0,ym:pm,L:[st.tr,[[0,P.psw],[P.S,P.psw]],[[xc,0],[xc,pm]]],dots:[[st.x,r.pA,0]]};
    R.c.CHV={x0:0,xm:P.S,y0:0,ym:KIT.nice(vr*1.15),L:[st.tv,[[0,vr],[P.S,vr]],[[0,vn],[P.S,vn]]],dots:[[st.x,Math.max(r.v,0),0]]};
    R.read=[{k:'p_A – צד מלא',v:r.pA,u:'bar'},{k:'p_B – צד המוט',v:r.pB,u:'bar'},{k:'מהירות',v:r.v,u:'mm/s',max:Math.max(vr,H.v(P.Q,g.A2))*1.05},{k:'כוח הבוכנה',v:R.Fp/1000,u:'kN',max:H.F(P.pr,g.A1)/1000},
      {k:'מיקום הבוכנה',v:st.x,u:'mm',max:P.S},{k:'מיקום המיתוג',v:st.xsw??0,u:'mm',max:P.S},{k:'זמן יציאה (נמדד)',v:st.tE,u:'s',dg:2}];
    return R;},
  ins(P,R){const L=[],g=R.g,r=R.r,FrM=(H.F(P.pr,g.Ar)-C12_PC*g.A2/10)/1000;
    if(P.pos==='a'&&R.rg&&r.mode==='regen'&&!r.stall&&r.v>0)L.push({ic:'🏎️',h:`גישה מחזורית: ${fmt(r.v,0)} mm/s, p_A = <b>${fmt(r.pA,1)} bar</b> – מתחת ל-p_sw = ${fmt(P.psw,0)} bar, ולכן שסתום המחזור נשאר במחזורי.`});
    if(R.xsw!=null)L.push({ic:'🔀',at:'V2',h:`המיתוג קרה ב-x = <b>${fmt(R.xsw,0)} mm</b> כש-p_A הגיע ל-${fmt(R.psa,0)} bar (כוח ≈ ${fmt(H.F(R.psa,g.Ar)/1000,1)} kN). מיד אחריו p_A ירד – אותו כוח מתחלק עכשיו על A₁ שלם.`});
    if(r.mode==='norm'&&!r.stall)L.push({ic:'💪',h:`מהלך כוח: v = Q/A₁ = ${fmt(r.v,0)} mm/s, p_A = ${fmt(r.pA,0)} bar לכוח ${fmt(R.F/1000,1)} kN. זמין עד <b>${fmt(H.F(P.pr,g.A1)/1000,1)} kN</b> בכיול ${fmt(P.pr,0)} bar.`});
    if(P.psw<=R.pApp*1.05)L.push({ic:'⚠️',w:true,at:'V2',c:`p_sw ${fmt(P.psw,0)} bar – נמוך מלחץ הגישה`,h:`p_sw = ${fmt(P.psw,0)} bar נמוך מלחץ הגישה (${fmt(R.pApp,1)} bar): המיתוג קורה כבר בתחילת המהלך והגישה איטית${P.sw==='pil'?', ובשסתום פיקוד הוא גם "מקשקש" הלוך וחזור':''}. כוונו לפחות 20–30% מעל לחץ הגישה.`});
    else if(P.psw>=P.pr*.97&&R.pReg>P.psw)L.push({ic:'⛔',w:true,at:'RV',c:'p_sw לא יושג – נתקע במחזורי',h:`p_sw = ${fmt(P.psw,0)} bar קרוב לכיול שסתום הפריקה (${fmt(P.pr,0)} bar) או מעליו: הלחץ לא יגיע אליו, הצילינדר יישאר במחזורי וייעצר על החלק בכוח ${fmt(FrM,1)} kN בלבד.`});
    else if(R.pReg<P.psw)L.push({ic:'ℹ️',h:`לחיצה של ${fmt(P.Fw,0)} kN דורשת במחזורי רק ${fmt(R.pReg,0)} bar < p_sw – כל המהלך יבוצע במחזורי, בלי מיתוג.`});
    if(r.stall&&!R.atEnd&&P.pos==='a')L.push({ic:'⛔',w:true,at:'C1',c:'הבוכנה נעצרה על החלק',h:`הבוכנה נעצרה ב-x = ${fmt(R.read[4].v,0)} mm: הלחץ בכיול שסתום הפריקה ${R.rg?`ועדיין במחזורי – הכוח המרבי p·A_מוט ≈ ${fmt(FrM,1)} kN`:`בכוח מלא ${fmt(H.F(P.pr,g.A1)/1000,1)} kN`}.`});
    if(P.sw==='pil'&&R.nsw>2)L.push({ic:'〰️',w:true,at:'V2',c:'השסתום "מקשקש" בין המצבים',h:`השסתום עבר ${R.nsw} פעמים במהלך אחד: אחרי המיתוג הלחץ יורד מתחת ל-${fmt(P.psw*(1-C12_HYS),0)} bar (ההפרש החוזר של הקפיץ) והוא חוזר למחזורי. במתג לחץ עם נעילה בבקר זה לא קורה.`});
    L.push({ic:'⏱️',h:`זמן יציאה מתוכנן: ${fmt(R.tPlan,2)} s במקום ${fmt(R.tNorm,2)} s ביציאה רגילה לכל אורך המהלך – חיסכון של ${fmt(100*(1-R.tPlan/R.tNorm),0)}%, ובסוף עדיין <b>כוח מלא</b>.`});
    L.push({ic:'🎯',h:`חלון כיוון p_sw: מעל לחץ הגישה (${fmt(R.pApp,1)} bar) ומתחת ללחץ שהלחיצה דורשת במחזורי (${fmt(Math.min(R.pReg,P.pr),0)} bar), עם מרווח מכיול שסתום הפריקה.`});return L;},
  calc(P,R){const g=R.g,dr=R.dL,Fsw=(P.psw*g.Ar-dr*g.A2)/10;
    return `<div class="kpis">${kpi('v גישה',fmt(R.vr,0),'mm/s')}${kpi('v כוח',fmt(R.vn,0),'mm/s')}${kpi('F מיתוג',fmt(Fsw/1000,1),'kN')}${kpi('F מרבי סופי',fmt(H.F(P.pr,g.A1)/1000,1),'kN')}</div>`+
      det('שלב 1 – גישה מחזורית',row('מהירות',`v = Q/(A₁−A₂) = ${V(R.vr,'mm/s')}`)+row('לחץ הגישה',`p_A = ${fr('F_גישה + Δp_L·A₂','A₁ − A₂')} = ${fr(fmt(P.Fa*1000,0)+'·10 + '+fmt(dr,2)+'·'+fmt(g.A2,0),fmt(g.Ar,0))}·0.1 = ${V(R.pApp,'bar')}`,P.psw>R.pApp),true)+
      det('נקודת המיתוג',row('כוח במיתוג',`F_sw = (p_sw·A_מוט − Δp_L·A₂)/10 = (${fmt(P.psw)}·${fmt(g.Ar,0)} − ${fmt(dr,2)}·${fmt(g.A2,0)})/10 = ${V(Fsw/1000,'kN')}`)+
        row('לחץ מיד אחרי המיתוג',`p_A ≈ F_sw/A₁ = ${V(H.p(Fsw,g.A1),'bar')} (≈ p_sw·(1 − 1/φ))`)+row('בסימולציה',R.xsw!=null?`מיתוג ב-x = ${V(R.xsw,'mm',0)}, p_A = ${V(R.psa,'bar')}`:'עדיין לא היה מיתוג במהלך הנוכחי'),true)+
      det('שלב 2 – מהלך כוח',row('מהירות',`v = Q/A₁ = ${V(R.vn,'mm/s')}`)+row('לחץ ללחיצה',`p = F/A₁ = ${fr(fmt((P.Fa+P.Fw)*1000,0)+'·10',fmt(g.A1,0))} = ${V(H.p((P.Fa+P.Fw)*1000,g.A1),'bar')}`,H.p((P.Fa+P.Fw)*1000,g.A1)<P.pr)+row('כוח מרבי',`F = p_r·A₁ = ${V(H.F(P.pr,g.A1)/1000,'kN')} (במחזורי רק ${V(H.F(P.pr,g.Ar)/1000,'kN')})`),true)+
      det('זמן מחזור',row('',`t = x_c/v_גישה + (S − x_c)/v_כוח = ${fmt(R.xc,0)}/${fmt(R.vr,0)} + ${fmt(P.S-R.xc,0)}/${fmt(R.vn,0)} = ${V(R.tPlan,'s')}`)+row('בלי מחזורי',`t = S/v_רגיל = ${V(R.tNorm,'s')}`))+
      det('כללי כיוון p_sw',row('',`p_גישה (${fmt(R.pApp,1)}) < p_sw < min(p_לחיצה במחזורי ${fmt(R.pReg,0)}, p_r ${fmt(P.pr,0)}) bar`,P.psw>R.pApp&&P.psw<Math.min(R.pReg,P.pr*.97)||R.pReg<P.psw&&P.psw<P.pr)+row('שסתום פיקוד',`חוזר למחזורי כש-p_A < p_sw·(1 − ${C12_HYS}) = ${V(P.psw*(1-C12_HYS),'bar')}`))+
      `<div class="note">Δp_L = הפסדי לולאת המחזור בגישה (שסתום 3/2 + אל-חוזר + 4/3 P→A) = ${fmt(dr,2)} bar. העומס מהחלק עולה לאורך ${C12_RAMP} מ"מ מרגע המגע ואז נשאר קבוע.</div>`;},
  demo:[{t:'מכבש עם גישה מהירה',x:'הצילינדר צריך לעבור 200 מ"מ באוויר ואז ללחוץ חלק ב-30 kN. במחזורי הגישה מהירה, אבל הכוח המרבי רק ≈ 25 kN – לא מספיק ללחיצה.',reset:true,set:{auto:false,pos:'0'},hl:['C1','W1']},
    {t:'גישה מחזורית',x:'Y1 מופעל: שסתום המחזור מחזיר את שמן צד המוט לקו A. מהירות ≈ <b>210 mm/s</b> והלחץ רק כ-11 bar (חיכוך + הפסדי הלולאה).',set:{pos:'a'},act:(P,st)=>{st.x=0;st.lp=null;},hl:['V2','CV','CHV'],dur:4},
    {t:'מגע – הלחץ עולה',x:'הכלי פוגש את החלק והעומס עולה. במחזורי הלחץ עולה מהר (הכוח מתחלק רק על A_מוט). כשהוא מגיע ל-<b>p_sw = 50 bar</b> מתג הלחץ מנתק את Y1.',act:(P,st)=>{st.x=120;st.lp=null;},hl:['PS','GA','CHP'],dur:4,run:true},
    {t:'מהלך כוח',x:'שסתום המחזור חוזר לרגיל: צד המוט פתוח למיכל. הלחץ יורד רגע (אותו כוח על A₁ שלם) ואז עולה עם העומס לכ-100 bar. המהירות ≈ <b>107 mm/s</b>.',act:(P,st)=>{st.x=185;st.lp=null;},hl:['V2','CHP','CHV'],dur:5},
    {t:'סוף מהלך – כוח מלא',x:'בסוף המהלך הלחץ מגיע לכיול שסתום הפריקה וכוח הלחיצה כ-53 kN = p·A₁ – פי 2 מהמחזורי.',act:(P,st)=>{st.x=280;},hl:['RV','C1'],dur:4},
    {t:'p_sw גבוה מדי',x:'p_sw = 170 bar – מעל הכיול. הלחץ לא מגיע אליו, הצילינדר נשאר במחזורי ונעצר על החלק בכוח ≈ 27 kN. החלק לא נלחץ.',set:{psw:170,pos:'a'},act:(P,st)=>{st.x=150;st.lp=null;},hl:['RV','C1','CHP'],dur:6},
    {t:'שסתום פיקוד במקום מתג',x:'אותו רעיון בלי חשמל: לחץ קו A מגיע לפיקוד של שסתום 3/2 ומעביר אותו למצב רגיל. אבל אין נעילה – אם הלחץ צונח מתחת ל-85% מ-p_sw השסתום חוזר למחזורי.',set:{sw:'pil',psw:50,pos:'a',auto:true},act:(P,st)=>{st.x=0;st.lp=null;},hl:['V2'],dur:7}],
  predict:[{q:'מכוונים p_sw = 5 bar – פחות מלחץ הגישה (≈ 11 bar). איך תיראה הגישה?',set:{psw:5,auto:false},opts:['מהירה כמו קודם','איטית – עוברת לרגיל כבר בהתחלה','הצילינדר לא יזוז'],a:1,why:'כבר בתחילת התנועה p_A > p_sw, מתג הלחץ מנתק את Y1 והגישה מתבצעת ב-Q/A₁ ≈ 107 mm/s.'},
    {q:'מכוונים p_sw = 170 bar (שסתום הפריקה 160 bar). הכלי מגיע לחלק. מה יקרה?',set:{psw:170,auto:false},act:(P,st)=>{st.x=150;},opts:['ימתג וילחץ בכוח מלא','ייעצר על החלק – הלחץ בכיול והכוח רק p·A_מוט ≈ 27 kN','שסתום הפריקה לא ייפתח'],a:1,why:'הלחץ לעולם לא יגיע ל-170 bar. הצילינדר נשאר במחזורי, והכוח המרבי (169.6 bar × 1590 mm²) קטן מ-31 kN הדרושים.'},
    {q:'ברגע המיתוג ממחזורי לרגיל – מה קורה ל-p_A?',set:{auto:false},act:(P,st)=>{st.x=170;},opts:['קופץ למעלה','יורד לכמחצית ואז עולה עם העומס','לא משתנה'],a:1,dur:4,why:'באותו כוח, במחזורי הלחץ פועל נטו על A_מוט ובמצב רגיל על A₁ ≈ 2·A_מוט, ולכן הלחץ נחצה (כ-50 → כ-25 bar) ואז עולה עם הלחיצה.'},
    {q:'שסתום 3/2 מפוקד עם p_sw = 6 bar. מה יקרה בגישה?',set:{sw:'pil',psw:6,auto:false},opts:['גישה איטית וחלקה','השסתום "מקשקש" בין מחזורי לרגיל','גישה מהירה וחלקה'],a:1,dur:4,why:'במחזורי p_A ≈ 11 bar > 6 ⇒ עובר לרגיל; ברגיל p_A ≈ 3.4 bar < 5.1 (85%) ⇒ חוזר למחזורי – וחוזר חלילה. לכן מכוונים p_sw הרבה מעל לחץ הגישה, או משתמשים בנעילה חשמלית.'}],
  tasks:[{q:P=>`p_sw = ${P.psw} bar, מוט Ø${P.d}. באיזה כוח חיצוני יתבצע המיתוג? (kN, בלי הפסדים)`,a:P=>H.F(P.psw,H.A(P.d))/1000,u:'kN',hint:'במחזורי F = p·A_מוט.',rand:P=>{P.psw=rnd(30,120,5);P.d=pick([28,36,45,56]);}},
    {q:P=>`Ø${P.D}/Ø${P.d}, p_sw = ${P.psw} bar. מה p_A מיד אחרי המיתוג, באותו כוח? (בלי הפסדים)`,a:P=>P.psw*H.A(P.d)/H.A(P.D),u:'bar',hint:'אותו כוח: p_sw·A_מוט = p·A₁ ⇒ p = p_sw·A_מוט/A₁.',rand:P=>{P.psw=rnd(30,120,5);P.D=pick([50,63,80,100]);P.d=Math.round(P.D*pick([.56,.63,.7]));}},
    {q:P=>`Ø${P.D}/Ø${P.d}, Q = ${P.Q} L/min, מהלך ${P.S} מ"מ, מגע ב-${P.xc} מ"מ (מיתוג במגע). מה זמן היציאה הכולל?`,a:P=>P.xc/H.v(P.Q,H.A(P.d))+(P.S-P.xc)/H.v(P.Q,H.A(P.D)),u:'s',hint:'t = x_c/(Q/A_מוט) + (S − x_c)/(Q/A₁).',rand:P=>{P.D=pick([50,63,80]);P.d=Math.round(P.D*pick([.63,.7]));P.Q=rnd(10,40,1);P.S=rnd(250,600,50);P.xc=Math.round(P.S*pick([.5,.6,.7,.8])/10)*10;}},
    {q:P=>`כיול שסתום פריקה ${P.pr} bar, Ø${P.D}/Ø${P.d}. פי כמה גדול הכוח הסופי במהלך כוח מהכוח המרבי במחזורי?`,a:P=>H.A(P.D)/H.A(P.d),u:'',hint:'F_רגיל/F_מחזורי = A₁/A_מוט = (D/d)².',rand:P=>{P.D=pick([50,63,80,100]);P.d=Math.round(P.D*pick([.5,.56,.63,.7]));}}],
  faults:[{id:'nosw',t:'המיתוג לא מתבצע (מתג לחץ תקול / קו פיקוד חסום)',sym:'"הגישה מהירה כרגיל, אבל המכבש נעצר על החלק, המד קופץ למקסימום והחלק לא נלחץ עד הסוף."',hint:'האם p_A עבר את p_sw? מה מצב שסתום המחזור אחרי זה? השוו את הכוח שנמדד ל-p·A_מוט.',why:'הלחץ עובר את p_sw אבל שסתום המחזור נשאר במחזורי. הכוח מוגבל ל-p·A_מוט ≈ 27 kN, פחות מ-31 kN הדרושים, ולכן הצילינדר נעצר בכיול שסתום הפריקה.'},
    {id:'early',t:'מיתוג מוקדם (מתג תקוע סגור / קפיץ שבור בשסתום)',sym:'"המכבש איטי כל הדרך – גם בגישה באוויר. הלחיצה עצמה בסדר."',hint:'השוו את מהירות הגישה ל-Q/(A₁−A₂) ול-Q/A₁. מתי היה המיתוג?',why:'שסתום המחזור במצב רגיל כבר מתחילת המהלך: הגישה ב-Q/A₁ ≈ 107 mm/s במקום ≈ 210 mm/s, וזמן המחזור מתארך. כוח הלחיצה תקין.'},
    {id:'seal',t:'דליפה פנימית באטם הבוכנה',sym:'"הגישה מהירה, אבל הלחיצה איטית מאוד, וגם החזרה לוקחת יותר זמן."',hint:'השוו את המהירות במהלך הכוח ל-Q/A₁. מתי הדליפה גדלה?',why:'במחזורי שני התאים כמעט באותו לחץ ואין דליפה מורגשת. במהלך הכוח יש כ-100 bar הפרש על הבוכנה – השמן עוקף אותה דרך האטם והמהירות צונחת.'}],
  test(H){const g=C12_geo(63,45);const P=clone(this.P);P.auto=false;const s=this.init(P);let R,Rap=null,Rpr=null;
    for(let t=0;t<2.6;t+=.02){R=this.step(P,s,.02,{});if(!Rap&&s.x>100)Rap=R;if(!Rpr&&s.x>260)Rpr=R;}
    const Q2=20*g.A2/g.Ar,dL=C12_PC+(Q2/C12_kR0)**2+((20+Q2)/C12_kV)**2,Fsw=(50*g.Ar-dL*g.A2)/10,xsw=200+C12_RAMP*(Fsw-1000)/30000;
    const P2=clone(this.P);P2.auto=false;const s2=this.init(P2);let R2;for(let t=0;t<3;t+=.02)R2=this.step(P2,s2,.02,{fault:'nosw'});
    const ps=169.6,Fst=(ps*g.Ar-C12_PC*g.A2)/10,xst=200+C12_RAMP*(Fst-1000)/30000;
    return [['v גישה = Q/(A₁−A₂)',Rap.v,H.v(20,g.Ar)],['x מיתוג (p_A = p_sw)',s.xsw,xsw],['v מהלך כוח = Q/A₁',Rpr.v,H.v(20,g.A1)],['כוח סופי = p·A₁',R.Fp,H.F(R.r.ps,g.A1)],
      ['תקוע במחזורי: עצירה ב-F = p·A_מוט',s2.x,xst,.01],['זמן יציאה',s.tE,R.tPlan,.03],['UI כוח',R.read[3].v,R.Fp/1000],['UI x מיתוג',R.read[5].v,s.xsw]];}};

LABS.push({ch:12,title:'מעגל דיפרנציאלי (מחזורי)',sims:[C12_A,C12_B,C12_C]});
}
