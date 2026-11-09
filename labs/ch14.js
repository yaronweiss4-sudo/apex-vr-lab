/* lab 14 – same code as the website */
{




/* ===================== Chapter 14 – holding and lowering a load (sims 43, 44) ===================== */
/* ---------- shared constants, helpers and symbols (prefix C14_ / c14_) ---------- */
const C14_KV=8,C14_KU=8,C14_PC=2,C14_KCB=9,C14_CL=.0004,C14_KS=.006,C14_KR=.25,C14_BETA=250,C14_KW=.5,C14_KC=12;
const C14_ser=(...k)=>1/Math.sqrt(k.reduce((s,x)=>s+1/(x*x),0));   // orifices in series → one k
const C14_ovr=pr=>Math.max(3,.06*pr);
const C14_ltr=t=>{t.style.direction='ltr';t.style.unicodeBidi='plaintext';return t;};
const C14_m=s=>`<span dir="ltr" style="unicode-bidi:isolate">${s}</span>`;   // keep a formula in LTR order inside Hebrew text
const C14_he=t=>/[\u0590-\u05FF]/.test(t||'');
/* live x–y chart. o={w,h,t,xl,yl,col[],dash[],sw[]}; cs={x0,xm,y0,ym,xd,yd,L:[[[x,y]..]..],dot:[x,y]} – zero line drawn when the y range crosses 0 */
SYM.c14_chart={ports:o=>({}),bb:o=>[-36,-18,o.w+8,o.h+26],
  draw(g,o){const w=o.w,h=o.h;SR(g,0,0,w,h,'syb');ST(g,w/2,-6,o.t||'','st b');const xl=ST(g,w/2,h+22,o.xl||'','st s');if(!C14_he(o.xl))C14_ltr(xl);
    const yl=ST(g,-28,h/2,o.yl||'','st s');if(!C14_he(o.yl))C14_ltr(yl);yl.setAttribute('transform',`rotate(-90 -28 ${h/2})`);
    for(let k=1;k<4;k++){SL(g,w*k/4,0,w*k/4,h,'sy thin').style.opacity=.13;SL(g,0,h*k/4,w,h*k/4,'sy thin').style.opacity=.13;}
    const z=SL(g,0,0,w,0,'sy thin');z.style.stroke='#475569';
    const tx=[0,1,2].map(k=>C14_ltr(ST(g,w*k/2,h+10,'','st s'))),ty=[0,1,2].map(k=>{const t=C14_ltr(ST(g,-4,h-h*k/2+3,'','st s'));t.setAttribute('text-anchor','end');return t;});
    const ps=(o.col||['#0b72d9']).map((c,k)=>{const p=SP(g,'','sy');p.style.stroke=c;p.style.strokeWidth=(o.sw&&o.sw[k])||1.8;if(o.dash&&o.dash[k])p.style.strokeDasharray=o.dash[k];return p;});
    const dot=SC(g,0,0,3.6,'syf');dot.style.fill='#dc2626';
    return cs=>{if(!cs)return;const x0=cs.x0||0,y0=cs.y0||0,X=x=>clamp((x-x0)/cs.xm,0,1)*w,Y=y=>h-clamp((y-y0)/cs.ym,-.02,1.02)*h;
      tx.forEach((t,k)=>t.textContent=fmt(x0+cs.xm*k/2,cs.xd??0));ty.forEach((t,k)=>t.textContent=fmt(y0+cs.ym*k/2,cs.yd??0));
      const zy=Y(0);z.style.display=y0<0&&y0+cs.ym>0?'':'none';z.setAttribute('y1',zy);z.setAttribute('y2',zy);
      ps.forEach((p,k)=>{const L=cs.L[k];p.setAttribute('d',L&&L.length>1?'M'+L.map(q=>X(q[0]).toFixed(1)+','+Y(q[1]).toFixed(1)).join(' L'):'');});
      if(cs.dot){dot.style.display='';dot.setAttribute('cx',X(cs.dot[0]));dot.setAttribute('cy',Y(cs.dot[1]));}else dot.style.display='none';};}};
/* vertical cylinder hung from a beam, rod down, mass on the rod. Ports on the left: A (cap, top), B (rod side, bottom). cs={x 0..1,uA,uB,lt} */
SYM.c14_vcyl={ports:o=>({A:[-14,-47],B:[-14,47]}),bb:o=>[-34,-70,34,188],
  draw(g,o){SR(g,-32,-62,64,7,'syf2');for(let i=0;i<8;i++)SL(g,-30+i*8,-62,-24+i*8,-70,'sy thin');SL(g,0,-55,0,-50,'sy thick');
    const cA=SR(g,-13,-50,26,6,'oil'),cB=SR(g,-13,-38,26,88,'oil');SR(g,-14,-50,28,100,'syb nofill');SL(g,-14,-50,14,-50,'sy thick');
    const pis=SR(g,-13,-44,26,6,'syf2'),rod=SR(g,-4,-38,8,100,'syb');
    const ld=sv('g',{},g);SR(ld,-27,0,54,28,'load');const lt=C14_ltr(ST(ld,0,18,o.t||'m','st b'));SA(ld,0,28,0,44,'sy',4);ST(ld,9,42,'W','st s');
    return cs=>{const x=clamp((cs&&cs.x)||0,0,1),yp=-44+x*80;pis.setAttribute('y',yp);rod.setAttribute('y',yp+6);
      cA.setAttribute('height',Math.max(yp+50,0));cB.setAttribute('y',yp+6);cB.setAttribute('height',Math.max(44-yp,0));
      cA.style.fill=pCss(cs?cs.uA:0);cB.style.fill=pCss(cs?cs.uB:0);ld.setAttribute('transform',`translate(0,${yp+106})`);if(cs&&cs.lt!=null)lt.textContent=cs.lt;};}};
B3.c14_vcyl=(c,o)=>{const M=m3(),inner=B3.cyl(c,{load:true}),g=new THREE.Group();inner.g.rotation.z=-PI/2;g.add(inner.g);
  g.add(edges(at(box3(76,8,44,M.dark),0,70,18)));return {g,upd:(cs,R)=>inner.upd(cs,R)};};
/* back-pressure (brake) valve without external pilot: internally piloted pressure valve + bypass check, ports L (load) / V (to DCV) */
SYM.c14_bpv={ports:o=>({L:[0,30],V:[0,-30]}),bb:o=>[-30,-30,54,30],
  draw(g,o){SR(g,-16,-16,32,32,'syb');SL(g,0,30,0,16);SL(g,0,-30,0,-16);const ar=sv('g',{},g);SA(ar,0,11,0,-11,'sy',5);SL(g,0,16,0,11);SL(g,0,-16,0,-11);
    SP(g,zig(16,0,30,0,4,4),'sy thin');adjArrow(g,15,9,32,-10);SP(g,'M0,24 H-24 V0 H-16','sy pil');SP(g,'M-16,0 l-5,-3 v6z','syf');
    SP(g,'M0,24 H38 V8 M38,-8 V-24 H0');SP(g,'M30,-4 L38,6 L46,-4','sy');const b=SC(g,38,-1,5,'syb');SR(g,-30,-28,84,56,'sy dash thin');SC(g,0,24,2,'syf');SC(g,0,-24,2,'syf');
    return cs=>{const op=clamp((cs&&cs.open)||0,0,1);ar.setAttribute('transform',`translate(${lerp(-8,0,op)},0)`);b.setAttribute('cy',-1+4*clamp((cs&&cs.chk)||0,0,1));};}};
B3.c14_bpv=(c,o)=>B3.cbv(c,o);
/* auto sequence through `ord`; a manual change of P.pos switches auto off */
function C14_seq(P,st,dt,atEnd,ord,hold){if(st.cp!=null&&P.pos!==st.cp)P.auto=false;if(!P.auto){st.cp=P.pos;return;}
  if(st.sq==null||ord[st.sq]!==P.pos)st.sq=Math.max(0,ord.indexOf(P.pos));
  const mid=P.pos==='hold'||P.pos==='0';st.dw=(mid||atEnd)?(st.dw||0)+dt:0;
  if(st.dw>(mid?hold:.4)){st.sq=(st.sq+1)%ord.length;P.pos=ord[st.sq];st.dw=0;}st.cp=P.pos;}
/* motion through a counterbalance (phi > 0) or back-pressure valve (phi = 0) on the outlet line.
   Pilot = inlet-line pressure. Balance: p_out = p_set + p_V − φ·p_X ; p_in·A_in = 10F + p_out·A_out  (F + = opposes motion) */
function C14_cbvMove(o){const {Q,pr,Ain,Aout,F,pset,phi,kV}=o,ov=C14_ovr(pr),kIn=o.chkIn?C14_ser(kV,C14_KCB):kV,pcIn=o.chkIn?C14_PC:0;
  if(F>=1e8){const ps=pr+ov,pIn=ps-pcIn,pl=Math.max(0,-10*(o.Fr||0)/Aout);return {v:0,ps,pIn,pOut:phi>0?0:Math.min(pset,pl),Qin:0,Qout:0,Qr:Q,stall:true,open:0,pX:ps};}
  const v=H.v(Q,Ain),Qout=H.Q(v,Aout),pV=(Qout/kV)**2,dIn=pcIn+(o.chkIn?(Q/C14_KCB)**2:0),pD=(Q/kV)**2;
  let pA=(10*F+(pset+pV-phi*dIn)*Aout)/(Ain+phi*Aout);
  if(pA<0){ // the load pressure exceeds the setting: pilot collapses and the valve only acts as a relief at p_set → the load runs ahead
    const r=H.lin({Qp:Q,pr,Ain,Aout,F,kIn,kOut:kV,pBP:pset,vRun:o.vRun});if(r.cav)r.ps=Math.max(0,r.pIn+H.orDp(kIn,r.Qin));return Object.assign(r,{open:1,pX:Math.max(r.pIn,0)+dIn,over:true});}
  let pB=pset+pV-phi*(pA+dIn),full=false;const pBo=pV+(Qout/C14_KCB)**2;
  if(pB<pBo){pB=pBo;pA=(10*F+pB*Aout)/Ain;full=true;}
  const ps=pA+dIn+pD;
  if(ps>pr){const ps2=pr+ov,pIn=ps2-pcIn;return {v:0,ps:ps2,pIn:pIn,pOut:Math.max(0,Math.min(pset,(pIn*Ain-10*F)/Aout)),Qin:0,Qout:0,Qr:Q,stall:true,open:0,pX:ps2};}
  return {v,ps,pIn:pA,pOut:pB,Qin:Q,Qout,Qr:0,stall:false,cav:false,open:full?1:clamp(.3+.7*phi*(pA+dIn)/Math.max(pset,1),.3,1),pX:pA+dIn,full,pV};}

/* ---------- 43 · four ways to hold a load ---------- */
const C14_S43=300,C14_I43={down:0,hold:1,up:2};
function C14_g43(P){const A1=H.A(P.D),A2=H.Aann(P.D,Math.min(P.dr,P.D-4)),W=P.m*G;return {A1,A2,a:A1/A2,W,pL:10*W/A2};}
const C14_pset43=(P,g,f)=>f==='cbvlow'&&(P.meth==='cbv'||P.meth==='bpv')?Math.min(P.pset,.92*g.pL):P.pset;
function C14_creep43(P,g,f,pset){const m=P.meth;let Q=0;   // leakage out of the rod side while stopped → creep
  if(m==='dcv')Q=C14_CL*g.pL;else{if(f==='seat')Q+=C14_KS*Math.sqrt(g.pL);if((m==='cbv'||m==='bpv')&&g.pL>pset)Q+=C14_KR*(g.pL-pset);}
  return {Q,v:H.v(Q,g.A2)*60};}
/* analytic comparison of the four methods at the current load / flow (used in the calc drawer) */
function C14_cmp43(P,g){const Q=P.Q,vQ=H.v(Q,g.A1),Qo=H.Q(vQ,g.A2),pV=(Qo/C14_KV)**2,pD=(Q/C14_KV)**2,o={};
  const r=H.lin({Qp:Q,pr:P.pr,Ain:g.A1,Aout:g.A2,F:-g.W,kIn:C14_KV,kOut:C14_KV,vRun:vQ*12});
  const ps0=r.cav?Math.max(0,H.PVAC+pD):r.ps;o.dcv={creep:H.v(C14_CL*g.pL,g.A2)*60,v:r.v,ps:ps0,cav:!!r.cav,heat:H.kW(ps0,Q)+g.W*r.v/1e6};
  const pO=P.phi>g.a?(g.pL+C14_PC)/(P.phi-g.a):Infinity;o.pocv={creep:0,v:vQ,ps:pO+pD,pOpen:pO,heat:H.kW(.65*pO+pD,Q)+g.W*vQ/1e6};
  const bp=phi=>{const pa=(P.pset+pV-g.pL)/(phi+g.a);if(pa<0)return {fail:true,creep:H.v(C14_KR*Math.max(g.pL-P.pset,0),g.A2)*60,ps:0,v:NaN,heat:NaN,pa};return {creep:0,v:vQ,pa,ps:pa+pD,heat:H.kW(pa+pD,Q)+g.W*vQ/1e6};};
  o.bpv=bp(0);o.cbv=bp(P.phi);o.pV=pV;o.pD=pD;o.vQ=vQ;return o;}
const C14_SIM_HOLD={id:'hold4',n:43,t:'ארבע דרכים להחזיק עומס',d:'אותו עומס תלוי עם שסתום פיקוד, אל-חוזר מפוקד, שסתום לחץ גב ושסתום איזון עומס: זחילה, קפיצות, קוויטציה ובזבוז אנרגיה',
  P:{meth:'cbv',pos:'hold',auto:true,m:2000,Q:12,pset:130,phi:4,D:63,dr:36,pr:160,pLt:95},
  key:P=>P.meth,
  ui(U,P){U.grp('שיטת ההחזקה');U.sel(P,'meth','מה מחזיק',[['dcv','שסתום פיקוד בלבד'],['pocv','אל-חוזר מפוקד'],['bpv','שסתום לחץ גב'],['cbv','שסתום איזון עומס']],true);
    U.seg(P,'pos','ידית',[['down','הורדה ▼','הורדת המטען (P→A)'],['hold','עצירה','מרכז – החזקה'],['up','הרמה ▲','הרמת המטען (P→B)']]);U.chk(P,'auto','מחזור אוטומטי');
    U.grp('עומס ומשאבה');U.num(P,'m','מסה תלויה','kg',{min:0,max:6000,step:50});U.num(P,'Q','ספיקת משאבה','L/min',{min:2,max:40,step:1});
    if(P.meth!=='dcv'){U.grp('כיוון השסתום');if(P.meth!=='pocv')U.num(P,'pset','לחץ כיול p_set','bar',{min:10,max:300,step:5});if(P.meth!=='bpv')U.num(P,'phi','יחס פיקוד φ','',{min:1,max:12,step:.5});}
    U.grp('צילינדר ושסתום פריקה',false);U.num(P,'D','קוטר בוכנה D','mm',{min:32,max:125,step:1});U.num(P,'dr','קוטר מוט בוכנה d','mm',{min:16,max:90,step:1});U.num(P,'pr','כיול שסתום פריקה','bar',{min:50,max:300,step:5});},
  circuit(P){const m=P.meth,cen=m==='dcv'?'tandem':'open';
    const comps=[{id:'C1',type:'c14_vcyl',x:460,y:70,name:'צילינדר אנכי – המטען תלוי על המוט ולוחץ על צד המוט',lbl:'צילינדר',lblAt:[50,-40],l3:[0,-80]},
      {id:'V1',type:'dcv',x:300,y:260,o:{box:KIT.D43[cen],L:'lever',center:true},name:`שסתום פיקוד 4/3, מרכז ${KIT.CEN[cen]} – לחיצה מחליפה מצב`,lbl:`4/3 ${KIT.CEN[cen]}`,lblAt:[92,4]},
      {id:'P1',type:'pump',x:220,y:350,name:'משאבה',lbl:'משאבה',lblAt:[34,6]},{id:'T1',type:'tank',x:220,y:394,name:'מיכל'},
      {id:'RV',type:'pv',x:160,y:300,rot:-90,o:{kind:'relief'},name:'שסתום פריקה',lbl:'פריקה',lblAt:[0,-28]},{id:'T2',type:'tank',x:110,y:330,name:'מיכל'},{id:'T3',type:'tank',x:380,y:325,name:'מיכל'},
      {id:'GA',type:'gauge',x:238,y:90,rot:-90,net:'A',o:{max:160},name:'מד לחץ – צד מלא (A). תת-לחץ = קוויטציה',valAt:[-14,-16],l3:[-20,-30]},
      {id:'GB',type:'gauge',x:400,y:105,net:'B',o:{max:160},name:'מד לחץ – צד המוט (B), בין הצילינדר לשסתום ההחזקה',valAt:[-14,-16],l3:[0,-30]},
      {id:'GP',type:'gauge',x:250,y:288,net:'P',o:{max:160},name:'מד לחץ משאבה',valAt:[-16,22],l3:[0,-30]},
      {id:'CH',type:'c14_chart',x:470,y:285,o:{w:150,h:62,t:'מהירות המטען v(t)',xl:'זמן [s]',yl:'v [mm/s]',col:['#94a3b8','#0b72d9'],dash:['4 3',''],sw:[1.3,1.9]},name:'גרף: מהירות המטען (+ = הורדה). מקווקו = Q/A₁, מה שהמשאבה ממלאת'}];
    const lines=[{id:'LS',net:'S',pts:['T1.t','P1.in']},{id:'LP',net:'P',pts:['P1.out',[220,300],[293,300],'V1.P']},{id:'LRV',net:'P',pts:[[220,300],'RV.P']},{id:'LRT',net:'T',pts:['RV.T',[110,300],'T2.t']},
      {id:'LT',net:'T',pts:['V1.T',[307,300],[380,300],'T3.t']},{id:'LA',net:'A',pts:['C1.A',[250,23],[250,225],'V1.A']}];
    if(m==='dcv')lines.push({id:'LB1',net:'B',pts:['C1.B',[340,117],[340,175]],nodot:true},{id:'LB2',net:'B',pts:[[340,175],[340,222],'V1.B'],nodot:true});
    else{const pv=m==='pocv';
      if(pv)comps.push({id:'HV',type:'check',x:340,y:175,o:{pilot:true,spring:true},name:'אל-חוזר מפוקד (POCV) – פופט על מושב; נפתח בלחץ קו A',lbl:'אל-חוזר מפוקד',lblAt:[30,4],l3:[0,-30]});
      else comps.push({id:'HV',type:m==='cbv'?'cbv':'c14_bpv',x:340,y:175,rot:180,flip:true,o:{},name:m==='cbv'?'שסתום איזון עומס: שסתום לחץ עם פיקוד מקו A ואל-חוזר עוקף להרמה':'שסתום לחץ גב: נפתח רק כשלחץ צד המוט עובר את הכיול; אל-חוזר עוקף להרמה',lbl:m==='cbv'?'שסתום איזון עומס':'לחץ גב',lblAt:[0,-36],l3:[0,-34]});
      lines.push({id:'LB1',net:'B',pts:['C1.B',[340,117],pv?'HV.out':'HV.L']},{id:'LB2',net:'Bv',pts:[pv?'HV.in':'HV.V',[340,222],'V1.B']});
      if(m!=='bpv')lines.push({id:'LX',net:'A',kind:'pilot',pts:[[250,pv?175:153],'HV.X']});}
    return {comps,lines};},
  init:P=>({x:60,si:C14_I43[P.pos],t:0,tr:[],pa:0,po:false,spk:0,dir:0}),
  click(id,P){if(id==='V1'){P.pos=P.pos==='down'?'hold':P.pos==='hold'?'up':'down';P.auto=false;return true;}},
  step(P,st,dt,ctx){const f=ctx.fault,g=C14_g43(P),{A1,A2,a,W,pL}=g,S=C14_S43,m=P.meth,ov=C14_ovr(P.pr);
    const end0=(st.dir>0&&st.x>=S-1e-6)||(st.dir<0&&st.x<=1e-6);C14_seq(P,st,dt,end0,['hold','down','hold','up'],1.5);
    const dir=P.pos==='down'?1:P.pos==='up'?-1:0;st.dir=dir;const atEnd=(dir>0&&st.x>=S-1e-6)||(dir<0&&st.x<=1e-6);
    const Q=P.Q,vQ=H.v(Q,A1),pset=C14_pset43(P,g,f),phi=m==='cbv'?(f==='pilot'?0:P.phi):m==='pocv'?P.phi:0,pD=(Q/C14_KV)**2;
    const cr=C14_creep43(P,g,f,pset);let ps,pA=0,pB=pL,pBv=0,v=0,Qr=0,Qin=0,Qout=0,cav=false,mode='',open=0,chk=0,pOpen=null,lock=false,pX=0;
    if(dir!==1||st.x>=S-1e-6){st.po=false;st.pa=0;}
    if(dir===0){mode='hold';ps=(Q/C14_KU)**2;v=cr.v/60;Qout=cr.Q;pA=v>.5?-Math.min(.85,(H.Q(v,A1)/C14_KV)**2):0;pBv=m==='dcv'?pL:0;open=m!=='pocv'&&m!=='dcv'&&cr.Q>.05?.5:0;}
    else if(dir>0){
      if(atEnd){mode='end';ps=P.pr+ov;Qr=Q;pA=ps;pB=m==='bpv'?Math.min(pset,pL):0;pX=ps;}
      else if(m==='dcv'){const r=H.lin({Qp:Q,pr:P.pr,Ain:A1,Aout:A2,F:-W,kIn:C14_KV,kOut:C14_KV,vRun:vQ*12});mode=r.cav?'run':'ctl';cav=!!r.cav;
        ps=cav?Math.max(0,H.PVAC+pD):r.ps;pA=r.pIn;pB=r.pOut;pBv=pB;v=r.v;Qin=r.Qin;Qout=r.Qout;Qr=r.Qr;}
      else if(m==='pocv'){pOpen=phi>a?(pL+C14_PC)/(phi-a):Infinity;
        if(!isFinite(pOpen)||pOpen+pD>P.pr){mode='lock';lock=true;ps=P.pr+ov;Qr=Q;pA=P.pr;pB=pL+pA*a;pX=pA;}
        else{const C=(.3+A1*st.x*1e-6)/C14_BETA;   // cap-side compliance (lines + oil) [L/bar]
          if(!st.po){mode='build';st.pa=Math.max(st.pa,0)+Q/60/C*dt;pA=st.pa;pB=pL+pA*a;ps=pA+pD;Qin=Q;if(st.pa>=pOpen)st.po=true;}
          else{mode='jump';const kO=C14_ser(C14_KV,C14_KCB);pA=Math.max(st.pa,H.PVAC);pB=Math.max((pA*A1+10*W)/A2,0);Qout=kO*Math.sqrt(pB);v=H.v(Qout,A2);Qin=Q;pBv=(Qout/C14_KV)**2;open=1;
            st.pa+=(Q-H.Q(v,A1))/60/C*dt;cav=st.pa<0;ps=Math.max(pA,0)+pD;if(st.pa<=.3*pOpen){st.po=false;st.spk=Math.max(st.spk,10*P.m*(v/1000)/.03/A2);}}
          pX=pA;}}
      else{const r=C14_cbvMove({Q,pr:P.pr,Ain:A1,Aout:A2,F:-W,Fr:-W,pset,phi,kV:C14_KV,vRun:vQ*12});cav=!!r.cav;mode=r.stall?'lock':r.over?'run':'ctl';lock=!!r.stall;
        ps=r.ps;pA=r.pIn;pB=r.pOut;v=r.v;Qin=r.Qin;Qout=r.Qout;Qr=r.Qr;open=r.open;pX=r.pX;pBv=(Qout/C14_KV)**2;}}
    else{chk=m==='dcv'?0:1;const ci=m!=='dcv';
      if(atEnd){mode='top';ps=P.pr+ov;Qr=Q;pB=ps-(ci?C14_PC:0);pBv=ps;pA=0;}
      else{const r=H.lin({Qp:Q,pr:P.pr,Ain:A2,Aout:A1,F:W+(ci?C14_PC*A2/10:0),kIn:ci?C14_ser(C14_KV,C14_KCB):C14_KV,kOut:C14_KV});mode=r.stall?'lock':'lift';
        ps=r.ps;pB=Math.max(0,r.pIn-(ci?C14_PC:0));pBv=ps-(r.Qin/C14_KV)**2;pA=r.pOut;v=-r.v;Qin=r.Qin;Qout=r.Qout;Qr=r.Qr;}}
    if(dt>0){st.spk*=Math.exp(-dt/.18);st.x=clamp(st.x+v*dt,0,S);st.t+=dt;st.tr.push([st.t,v]);while(st.tr.length&&st.tr[0][0]<st.t-6)st.tr.shift();}
    KIT.ease(st,'si',C14_I43[P.pos],dt,8);KIT.rpmAng(st,dt,1450);
    const pBd=pB+st.spk,pm=P.pr,heat=Math.max(0,H.kW(Math.max(ps,0),Q)+W*v/1e6),creep=cr.v;
    const vm=Math.max(vQ*1.6,...st.tr.map(q=>q[1])),Yd=Math.ceil(vm*1.1/20)*20,Yu=Math.ceil(H.v(Q,A2)*1.15/20)*20,Y=Math.max(Yd,Yu),t0=Math.max(0,st.t-6);
    const qA=dir>0?-Qin:dir<0?Qout:0,qB=dir>0?Qout:dir<0?-Qin:Qout;
    return {g,mode,ps,pA,pB:pBd,pB0:pB,v,vQ,creep,cr,heat,cav,lock,pOpen,pset,phi,pX,open,dir,S,
      p:{P:ps,A:pA,B:pBd,Bv:pBv,T:Math.min(1,Math.abs(qB)/Q),S:-.05},q:{LS:Q,LP:Q-Qr,LRV:Qr,LRT:Qr,LA:qA,LB1:qB,LB2:qB,LT:Math.abs(dir>0?Qout:dir<0?Qout:qB)},pmax:pm,qref:Q,vac:true,cav:cav?{LA:true}:null,
      c:{C1:{x:st.x/S,uA:pA/pm,uB:pBd/pm,lt:`${fmt(P.m,0)} kg`},V1:{i:st.si},P1:{on:true,ang:st.ang},RV:{open:clamp(Qr/Q,0,1)},HV:{open:m==='pocv'?(open||chk):open,chk},
        CH:{x0:t0,xm:6,y0:-Y,ym:2*Y,xd:0,L:[[[t0,vQ],[t0+6,vQ]],st.tr],dot:[st.t,v]}},
      read:[{k:'לחץ משאבה',v:ps,u:'bar'},{k:'צד מלא p_A',v:pA,u:'bar',w:pA<-.3,dg:2},{k:'צד המוט p_B',v:pBd,u:'bar',w:pBd>P.pr},{k:'מהירות (+ הורדה)',v:v,u:'mm/s',max:vQ*2,w:v>vQ*1.15},
        {k:'שקיעה בעצירה',v:creep,u:'mm/min',max:60,w:creep>5},{k:'חום במעגל',v:heat,u:'kW',dg:2,max:Math.max(1,H.kW(P.pr,Q))},{k:'מיקום המטען',v:st.x,u:'mm',max:S}]};},
  ins(P,R){const L=[],g=R.g,mt=P.meth,c=C14_cmp43(P,g);
    L.push({ic:'⚖️',at:'GB',h:`${fmt(P.m,0)} ק"ג תלויים על המוט ודוחסים את השמן בצד המוט: <b>${C14_m(`p_L = W/A₂ = ${fmt(g.W,0)} N ÷ ${fmt(g.A2,0)} mm² = ${fmt(g.pL,1)} bar`)}</b>. את השמן הזה צריך לכלוא כדי שהמטען לא ירד.`});
    if(mt==='dcv'){L.push({ic:'💧',w:R.creep>5,at:'V1',h:`רק הספול (מגופה) מחזיק: דרך המרווח שלו זולגים כ-<b>${fmt(R.cr.Q*1000,0)} cm³/min</b>, והמטען שוקע ${fmt(R.creep,1)} mm/min – ${fmt(R.creep*60/1000,2)} m בשעה. ספול אף פעם לא אוטם לגמרי.`,c:`זחילה ${fmt(R.creep,1)} mm/min דרך הספול`});
      if(R.dir>0&&R.cav)L.push({ic:'💥',w:true,at:'C1',h:`בהורדה המטען בורח: <b>${fmt(R.v,0)} mm/s</b> – פי ${fmt(R.v/R.vQ,1)} ממה שהמשאבה ממלאת (${fmt(R.vQ,0)} mm/s). הצד המלא בתת-לחץ (${fmt(R.pA,2)} bar): קוויטציה ומכות.`,c:'המטען מקדים את המשאבה – תת-לחץ בצד המלא'});
      else if(R.dir>0)L.push({ic:'⬇️',h:`המטען קל: מפל הלחץ בספול (${fmt(R.pB0,1)} bar) מספיק כדי לבלום אותו, והמשאבה קובעת את המהירות.`});}
    if(mt==='pocv'){L.push({ic:'🔒',at:'HV',h:`פופט על מושב לא זולג: בעצירה השקיעה <b>${fmt(R.creep,1)} mm/min</b>. במרכז פתוח קו A מחובר למיכל, הפיקוד מתרוקן והשסתום נסגר מיד.`});
      if(R.lock)L.push({ic:'⛔',w:true,at:'HV',h:`φ = ${fmt(P.phi,1)} לא גדול מספיק מ-A₁/A₂ = ${fmt(g.a,2)}: הלחץ בצד המלא דוחף גם את צד המוט, והפיקוד לא מצליח לפתוח. צד המוט מגיע ל-${fmt(R.pB0,0)} bar – הגברת לחץ!`,c:'הפיקוד לא פותח – הגברת לחץ בצד המוט'});
      else if(R.dir>0)L.push({ic:'〰️',w:true,at:'CH',h:`ההורדה בקפיצות: הפיקוד פותח רק כש-${C14_m(`p_A = (p_L + p_c)/(φ − A₁/A₂) = <b>${fmt(R.pOpen,1)} bar</b>`)}. המטען צונח, p_A קורס, השסתום נטרק – ושיאי לחץ בצד המוט (עד ${fmt(g.pL+10*P.m*.5/.03/g.A2,0)} bar).`,c:'הורדה בקפיצות – השסתום נפתח ונטרק'});}
    if(mt==='bpv'||mt==='cbv'){const cm=c[mt],ph=mt==='cbv'?P.phi:0;
      if(g.pL>=P.pset)L.push({ic:'⚠️',w:true,at:'HV',h:`הכיול (${fmt(P.pset,0)} bar) נמוך מלחץ העומס (${fmt(g.pL,1)} bar): השסתום נפתח מעצמו והמטען יורד גם בלי פקודה. מכיילים לפחות ${fmt(1.3*g.pL,0)} bar (×1.3).`,c:'הכיול נמוך מלחץ העומס'});
      else{L.push({ic:mt==='cbv'?'🧭':'🧱',at:'GP',h:mt==='cbv'?`בהורדה הפיקוד מקו A עוזר לפתוח: ${C14_m(`<b>p_A = (p_set + p_V − p_L)/(φ + A₁/A₂)</b> = (${fmt(P.pset,0)} + ${fmt(c.pV,1)} − ${fmt(g.pL,1)})/(${fmt(ph,1)} + ${fmt(g.a,2)}) = <b>${fmt(cm.pa,1)} bar</b>`)}. בלי פיקוד היו נדרשים ${fmt(c.bpv.pa,1)} bar.`:
          `בהורדה המשאבה צריכה "לעזור" לעומס לפתוח את השסתום: ${C14_m(`<b>p_A = (p_set + p_V − p_L)·A₂/A₁</b> = ${fmt(cm.pa,1)} bar`)}. כל הספיקה החוזרת נחנקת ב-${fmt(P.pset,0)} bar – כאן חום.`});
        if(mt==='cbv')L.push({ic:'📘',h:`בקטלוג: פיקוד לפתיחה ${C14_m(`p_X = (p_set − p_L)/φ = (${fmt(P.pset,0)} − ${fmt(g.pL,1)})/${fmt(ph,1)} = ${fmt((P.pset-g.pL)/ph,1)} bar`)}. במעגל הוא נמוך יותר, כי לחץ A דוחף גם את הבוכנה.`});
        if(P.pset<1.2*g.pL)L.push({ic:'📏',h:`הכיול רק ${fmt(P.pset/g.pL,2)}× מלחץ העומס. המלצה מקובלת: p_set ≈ 1.3·p_L = ${fmt(1.3*g.pL,0)} bar, כדי שזעזוע לא יפתח את השסתום.`});}
      L.push({ic:'🔒',h:`בעצירה הפופט אוטם: שקיעה ${fmt(R.creep,1)} mm/min. השסתום יושב צמוד לצילינדר, כך שגם צינור שנקרע לא מפיל את המטען.`});}
    if(R.dir>0&&!R.cav&&!R.lock&&R.v>0)L.push({ic:'🔥',h:`הורדה: האנרגיה של המטען (W·v = ${fmt(g.W*R.v/1e6,2)} kW) ועוד הספק המשאבה (${fmt(H.kW(Math.max(R.ps,0),P.Q),2)} kW) הופכים לחום – <b>${fmt(R.heat,2)} kW</b>.`});
    if(R.lock&&mt!=='pocv'&&R.dir>0)L.push({ic:'⛔',w:true,at:'GP',h:`המשאבה לא מצליחה לפתוח את השסתום (נדרש יותר מ-${fmt(P.pr,0)} bar) – הכול עובר בשסתום הפריקה.`,c:'המשאבה בכיול שסתום הפריקה – אין הורדה'});
    L.push({ic:'🗂️',h:{dcv:'שסתום פיקוד לבד: זול, אבל זוחל ולא בולם עומס מכני אינרציאלי.',pocv:'אל-חוזר מפוקד: אוטם מצוין לעצירה, אבל לא שסתום בקרה – ההורדה קופצנית.',bpv:'לחץ גב: הורדה חלקה, אבל המשאבה דוחפת נגד הכיול גם כשהמטען קל.',cbv:'שסתום איזון עומס: אוטם, בולם וחוסך – הפיקוד מוריד את הלחץ הדרוש מהמשאבה.'}[mt]});return L;},
  calc(P,R){const g=R.g,c=C14_cmp43(P,g),mt=P.meth,cm=c[mt],nm={dcv:'שסתום פיקוד',pocv:'POCV',bpv:'לחץ גב',cbv:'שסתום איזון עומס'};
    const cmpRow=k=>{const o=c[k];return row(nm[k],k==='pocv'?`שקיעה 0 · הורדה בקפיצות; פתיחה ב-p_A = ${V(o.pOpen,'bar')} · חום ≈ ${V(o.heat,'kW',2)}`:o.fail?`הכיול ${fmt(P.pset,0)} bar < p_L – לא מחזיק! שקיעה ${V(o.creep,'mm/min')}`:k==='dcv'?`שקיעה ${V(o.creep,'mm/min')} · הורדה ${V(o.v,'mm/s')}${o.cav?' (בורח, תת-לחץ ב-A)':''} · משאבה ${V(o.ps,'bar')} · חום ${V(o.heat,'kW',2)}`:`שקיעה 0 · הורדה ${V(o.v,'mm/s')} · משאבה ${V(o.ps,'bar')} · חום ${V(o.heat,'kW',2)}`,k===mt?true:undefined);};
    let cur='';
    if(mt==='dcv')cur=row('זליגה בספול (למינרית)',`Q_L = c·p_L = ${C14_CL}·${fmt(g.pL,1)} = ${V(c.dcv.creep*g.A2*60/1e6/60,'L/min',4)}`)+row('שקיעה',`v = Q_L/A₂ = ${V(c.dcv.creep,'mm/min')}`)+row('בהורדה',`העומס מושך: p_A = −0.85 bar ⇒ p_B = (W + p_A·A₁)/A₂ = ${V((10*g.W+H.PVAC*g.A1)/g.A2,'bar')} ⇒ Q = k·√p_B`);
    else if(mt==='pocv')cur=row('פתיחה בפיקוד',`p_A·φ ≥ p_B − p_T + p_c,  p_B = p_L + p_A·A₁/A₂`)+row('',`p_A = ${fr('p_L + p_c','φ − A₁/A₂')} = ${fr(fmt(g.pL,1)+' + '+C14_PC,fmt(P.phi,1)+' − '+fmt(g.a,3))} = ${V(c.pocv.pOpen,'bar')}`,isFinite(c.pocv.pOpen))+row('אחרי הפתיחה',`צד המוט פתוח למיכל ⇒ המטען צונח, p_A יורד מתחת ל-${fmt(.3*c.pocv.pOpen,1)} bar והשסתום נסגר`);
    else if(!cm.fail)cur=row('איזון השסתום',`p_B = p_set + p_V − φ·p_A`)+row('איזון הבוכנה',`p_A·A₁ + W = p_B·A₂`)+row('ביחד',`p_A = ${fr('p_set + p_V − p_L','φ + A₁/A₂')} = ${fr(fmt(P.pset,0)+' + '+fmt(c.pV,2)+' − '+fmt(g.pL,1),fmt(mt==='cbv'?P.phi:0,1)+' + '+fmt(g.a,3))} = ${V(cm.pa,'bar')}`)+
      row('לחץ משאבה',`p_P = p_A + Δp_DCV = ${fmt(cm.pa,1)} + ${fmt(c.pD,2)} = ${V(cm.ps,'bar')}`)+(mt==='cbv'?row('פיקוד לפי הקטלוג',`p_X = (p_set − p_L)/φ = ${V((P.pset-g.pL)/P.phi,'bar')}`):'')+row('חום',`P = p_P·Q/600 + W·v = ${fmt(H.kW(cm.ps,P.Q),2)} + ${fmt(g.W*cm.v/1e6,2)} = ${V(cm.heat,'kW',2)}`);
    else cur=row('',`p_set = ${fmt(P.pset,0)} bar < p_L = ${fmt(g.pL,1)} bar – השסתום לא מסוגל להחזיק את המטען`,false);
    return `<div class="kpis">${kpi('לחץ החזקה p_L',fmt(g.pL,1),'bar')}${kpi('שקיעה',fmt(R.creep,1),'mm/min')}${kpi('משאבה בהורדה',cm.fail?'—':fmt(cm.ps,1),'bar')}${kpi('מהירות הורדה',fmt(mt==='pocv'?c.vQ:cm.v,0),'mm/s',mt==='pocv'?'ממוצע':'')}</div>`+
      det('לחץ ההחזקה',row('שטחים',`A₁ = π·${P.D}²/4 = ${V(g.A1,'mm²')} · A₂ = π(${P.D}² − ${Math.min(P.dr,P.D-4)}²)/4 = ${V(g.A2,'mm²')}`)+row('משקל',`W = m·g = ${P.m}·9.81 = ${V(g.W,'N')}`)+row('לחץ בצד המוט',`p_L = ${fr('W','A₂')} = ${fr(fmt(g.W,0)+'·10',fmt(g.A2,0))} = ${V(g.pL,'bar')}`),true)+
      det(`הורדה – ${nm[mt]}`,cur+row('מהירות מבוקרת',`v = Q/A₁ = ${fr(P.Q+'·10⁶/60',fmt(g.A1,0))} = ${V(c.vQ,'mm/s')}`),true)+
      det('השוואה – אותו מטען, אותה ספיקה',['dcv','pocv','bpv','cbv'].map(cmpRow).join(''),true)+
      `<div class="note">p_V = מפל הלחץ בשסתום הפיקוד בדרך למיכל (k = ${C14_KV} L/min/√bar), p_c = ${C14_PC} bar. "חום" כולל את האנרגיה הפוטנציאלית של המטען היורד. ההנחה: מצב מתמיד, ללא חיכוך.</div>`;},
  demo:[{t:'מטען תלוי על צילינדר אנכי',x:'2000 ק"ג תלויים על מוט הצילינדר ולוחצים על השמן <b>בצד המוט</b> – כ-94 bar. כדי שהמטען לא ירד, צריך לכלוא את השמן הזה. נשווה ארבע דרכים.',reset:true,set:{pos:'hold',auto:false},hl:['C1','GB']},
    {t:'רק שסתום פיקוד',x:'ספול במרכז טנדם חוסם את A ו-B, אבל ספול תמיד זולג דרך המרווח שלו. מדידת <b>השקיעה</b> מראה כ-18 mm/min – מטען שנשאר כך לילה שלם יגיע לרצפה.',reset:true,set:{meth:'dcv',pos:'hold',auto:false},hl:['V1','C1']},
    {t:'הורדה בלי בלימה',x:'מעבירים להורדה: המטען מושך את הבוכנה מהר יותר ממה שהמשאבה ממלאת. בצד המלא תת-לחץ (סגול) – <b>קוויטציה</b> – והמהירות בגרף גבוהה בהרבה מהקו המקווקו.',reset:true,set:{meth:'dcv',pos:'down',auto:false},act:(P,st)=>{st.x=10;},hl:['C1','GA','CH'],dur:7},
    {t:'אל-חוזר מפוקד – אוטם',x:'אל-חוזר מפוקד: פופט על מושב לא זולג, והשקיעה <b>0</b>. במרכז פתוח קו A מחובר למיכל, הפיקוד מתרוקן והשסתום נסגר מיד.',reset:true,set:{meth:'pocv',pos:'hold',auto:false},hl:['HV','GB']},
    {t:'…אבל ההורדה בקפיצות',x:'לחץ A עולה עד שהפיקוד פותח (כ-38 bar). צד המוט נפתח למיכל, המטען צונח, p_A קורס והשסתום נטרק – וחוזר חלילה. ראו את הקוצים בגרף ואת שיאי הלחץ בצד המוט.',reset:true,set:{meth:'pocv',pos:'down',auto:false},act:(P,st)=>{st.x=10;},hl:['HV','CH','GB'],dur:9},
    {t:'שסתום לחץ גב',x:'שסתום לחץ מכויל ל-130 bar בקו B נפתח רק כשהלחץ עובר את הכיול. ההורדה חלקה (v = Q/A₁), אבל המשאבה צריכה לדחוף כ-28 bar כדי לעזור לעומס לפתוח אותו.',reset:true,set:{meth:'bpv',pos:'down',auto:false},act:(P,st)=>{st.x=10;},hl:['HV','GP','GA'],dur:8},
    {t:'שסתום איזון עומס',x:'אותו כיול, אבל עם פיקוד מקו A ביחס 4:1. הפיקוד עוזר לפתוח, ולחץ המשאבה יורד לכ-9 bar. התנועה חלקה ובעצירה אין שקיעה.',reset:true,set:{meth:'cbv',pos:'down',auto:false},act:(P,st)=>{st.x=10;},hl:['HV','GA','GP'],dur:8},
    {t:'מטען קל – ההבדל גדל',x:'500 ק"ג בלבד: בשסתום איזון העומס המשאבה צריכה כ-22 bar, ובשסתום לחץ גב היו נדרשים כ-75 bar. הכיול נקבע לפי המטען הכבד, והפיקוד מפצה כשהמטען קל. פתחו את "חישוב מלא" להשוואה.',reset:true,set:{meth:'cbv',m:500,pos:'down',auto:false},act:(P,st)=>{st.x=10;},hl:['GP','HV'],dur:9}],
  predict:[{q:'שסתום פיקוד בלבד (מרכז טנדם), המטען תלוי והידית באמצע. מה יקרה לאורך זמן?',set:{meth:'dcv',pos:'hold',auto:false},opts:['המטען יישאר בדיוק במקום','המטען ישקע לאט','המטען יעלה לאט'],a:1,why:'לספול יש מרווח של כמה מיקרונים. בלחץ של 94 bar זולגים דרכו כ-37 cm³/min, והמטען שוקע כ-18 mm/min.'},
    {q:'אל-חוזר מפוקד (φ = 4). מורידים את המטען. איך תיראה התנועה?',set:{meth:'pocv',pos:'down',auto:false},act:(P,st)=>{st.x=10;},opts:['חלקה ובמהירות קבועה','בקפיצות – נעצרת ונפתחת שוב ושוב','המטען לא יזוז בכלל'],a:1,dur:5,why:'הפיקוד פותח בכ-38 bar, צד המוט מתרוקן בבת אחת והמטען צונח. לחץ A קורס, השסתום נסגר, הלחץ נבנה שוב – וחוזר חלילה.'},
    {q:'מסה 500 ק"ג, שסתום לחץ גב מכויל ל-130 bar. כמה לחץ תצטרך המשאבה בהורדה, בהשוואה לשסתום איזון העומס עם אותו כיול ו-φ = 4?',set:{meth:'bpv',m:500,pos:'down',auto:false},act:(P,st)=>{st.x=10;},opts:['פחות משסתום איזון העומס','כמעט 0','פי 3–4 יותר משסתום איזון העומס'],a:2,why:'בלי פיקוד: p_A = (p_set + p_V − p_L)·A₂/A₁ ≈ 72 bar. עם פיקוד 4:1 המכנה גדל ל-φ + A₁/A₂ ≈ 5.5 ו-p_A יורד לכ-20 bar.'},
    {q:'שסתום פיקוד בלבד, מורידים 2000 ק"ג. מה יראה המד בצד המלא (A)?',set:{meth:'dcv',pos:'down',auto:false},act:(P,st)=>{st.x=10;},opts:['לחץ גבוה – המשאבה דוחפת','בערך 0.85− bar – תת-לחץ','בדיוק 0 bar'],a:1,dur:3,why:'המטען מושך את הבוכנה מהר יותר ממה שהמשאבה ממלאת. בצד המלא נוצר ריק – כמעט ואקום מלא – ושמן מתאדה: קוויטציה.'}],
  tasks:[{q:P=>`${P.m} ק"ג תלויים על מוט של צילינדר Ø${P.D}/${P.dr}. מה הלחץ בצד המוט?`,a:P=>10*P.m*G/H.Aann(P.D,P.dr),u:'bar',hint:'p = W/A₂, A₂ = π(D² − d²)/4, ו-1 bar = 0.1 N/mm².',rand:P=>{P.D=pick([50,63,80,100]);P.dr=Math.round(P.D*pick([.5,.56,.63]));P.m=rnd(500,5000,100);}},
    {q:P=>`שסתום איזון עומס מכויל ל-${P.pset} bar, יחס פיקוד ${P.phi}:1, לחץ העומס על השסתום ${P.pLt} bar. איזה לחץ פיקוד פותח אותו (נוסחת הקטלוג)?`,a:P=>(P.pset-P.pLt)/P.phi,u:'bar',hint:'p_X = (p_set − p_L)/φ.',rand:P=>{P.pLt=rnd(60,180,5);P.pset=Math.round(P.pLt*pick([1.2,1.3,1.4])/5)*5;P.phi=pick([3,4,5,8]);}},
    {q:P=>`צילינדר Ø${P.D}/${P.dr}, מטען ${P.m} ק"ג, שסתום איזון עומס ${P.pset} bar, φ = ${P.phi}. מה לחץ קו A בהורדה (מזניחים מפלי לחץ בצנרת)?`,a:P=>{const A1=H.A(P.D),A2=H.Aann(P.D,P.dr);return (P.pset-10*P.m*G/A2)/(P.phi+A1/A2);},u:'bar',tol:.03,hint:'p_A = (p_set − p_L)/(φ + A₁/A₂).',rand:P=>{P.D=pick([50,63,80]);P.dr=Math.round(P.D*pick([.5,.56]));P.m=rnd(800,3000,100);P.pset=Math.ceil(13*P.m*G/H.Aann(P.D,P.dr)/5)*5;P.phi=pick([3,4,5]);}},
    {q:P=>`אותו מצב עם שסתום לחץ גב (בלי פיקוד): Ø${P.D}/${P.dr}, ${P.m} ק"ג, כיול ${P.pset} bar. מה לחץ קו A בהורדה?`,a:P=>{const A1=H.A(P.D),A2=H.Aann(P.D,P.dr);return (P.pset*A2-10*P.m*G)/A1;},u:'bar',tol:.03,hint:'p_A·A₁ + W = p_set·A₂.',rand:P=>{P.D=pick([50,63,80]);P.dr=Math.round(P.D*pick([.5,.56]));P.m=rnd(300,3000,100);P.pset=pick([100,120,130,150]);if(P.pset*H.Aann(P.D,P.dr)<=10*P.m*G*1.1)P.m=Math.floor(P.pset*H.Aann(P.D,P.dr)/(10*G*1.3)/50)*50;}},
    {q:P=>`שסתום לחץ גב מכויל ל-${P.pset} bar. מורידים בספיקת משאבה ${P.Q} L/min, צילינדר Ø${P.D}/${P.dr}. כמה הספק נחנק בשסתום?`,a:P=>P.pset*P.Q*H.Aann(P.D,P.dr)/H.A(P.D)/600,u:'kW',hint:'הספיקה דרך השסתום (מצד המוט) היא Q·A₂/A₁, ו-P = p·Q/600.',rand:P=>{P.D=pick([50,63,80,100]);P.dr=Math.round(P.D*pick([.5,.56,.7]));P.Q=rnd(8,40,1);P.pset=rnd(80,200,10);}}],
  faults:[{id:'cbvlow',t:'שסתום איזון עומס מכויל נמוך / קפיץ עייף',sym:'"כשעוצרים, המטען יורד לאט מעצמו. בהורדה הוא ממהר ונשמעות מכות."',hint:'השוו את לחץ צד המוט בעצירה למה שהשסתום אמור להחזיק, ובדקו את מד A בהורדה.',why:'הכיול האפקטיבי ירד מתחת ללחץ העומס (p_set < p_L). השסתום נפתח כשסתום פריקה: בעצירה המטען זוחל, ובהורדה הפיקוד קורס, המטען מקדים את המשאבה והצד המלא בתת-לחץ. מכיילים ל-1.3·p_L או מחליפים קפיץ.',set:{meth:'cbv',auto:true,pos:'hold'}},
    {id:'seat',t:'מושב שחוק בשסתום ההחזקה (דליפה)',sym:'"המכונה עומדת והמטען שוקע כמה מילימטרים בדקה. הרמה והורדה נראות תקינות."',hint:'מה מראה מדידת השקיעה בעצירה? ולחץ צד המוט?',why:'לחץ צד המוט נשאר p_L (השסתום מכויל נכון), אבל שריטה או לכלוך על המושב מעבירים כ-58 cm³/min. בתנועה זה לא מורגש, בעצירה המטען זוחל. מחליפים/מנקים את המחסנית.',set:{meth:'cbv',auto:true,pos:'hold'}},
    {id:'pilot',t:'חריר הפיקוד של שסתום איזון העומס סתום',sym:'"ההורדה חלקה, אבל המשאבה עובדת קשה מהרגיל והשמן מתחמם."',hint:'מה לחץ המשאבה וקו A בזמן ההורדה, לעומת החישוב עם φ?',why:'בלי פיקוד השסתום מתנהג כשסתום לחץ גב: p_A = (p_set + p_V − p_L)·A₂/A₁ ≈ 25 bar במקום כ-7 bar. התנועה מבוקרת, אבל המשאבה דוחפת פי 3–4 וחום נוסף נוצר בשסתום.',set:{meth:'cbv',auto:true,pos:'hold'}}],
  test(H){const g=C14_g43(this.P),{A1,A2,W,pL,a}=g,vQ=H.v(12,A1),pV=(H.Q(vQ,A2)/C14_KV)**2;
    const run=(set,x,sec)=>{const P=Object.assign(clone(this.P),{auto:false},set);const s=this.init(P);s.x=x;let R;for(let t=0;t<sec;t+=.02)R=this.step(P,s,.02,{});return R;};
    const R1=run({pos:'hold'},60,.3),R2=run({pos:'down'},20,.4),R3=run({meth:'bpv',pos:'down'},20,.4),R4=run({meth:'dcv',pos:'hold'},60,.3),R5=run({meth:'dcv',pos:'down'},20,.1),R6=run({meth:'pocv',pos:'down'},20,.04);
    return [['p_hold = W/A₂',R1.pB,10*W/A2],['v הורדה = Q/A₁',R2.v,vQ],['שסתום איזון עומס: p_A = (p_set + p_V − p_L)/(φ + A₁/A₂)',R2.pA,(130+pV-pL)/(4+a)],
      ['לחץ גב: p_A = (p_set + p_V − p_L)·A₂/A₁',R3.pA,(130+pV-pL)/a],['שקיעה דרך הספול Q = c·p_L',R4.creep,H.v(C14_CL*pL,A2)*60],['בריחה: p_B = (W + p_vac·A₁)/A₂',R5.pB,(10*W+H.PVAC*A1)/A2],
      ['אל-חוזר מפוקד: פתיחה ב-(p_L + p_c)/(φ − A₁/A₂)',R6.pOpen,(pL+2)/(4-a)],['UI מהירות',R2.read[3].v,R2.v],['UI p_A',R3.read[1].v,R3.pA]];}};

/* ---------- 44 · overrunning load: an arm that rotates past its dead centre ---------- */
/* geometry [mm, y up]: arm pivot O = (0,0); cylinder base pivot B; rod eye on the arm at radius a. θ from the horizontal. */
const C14_ARM={a:350,bx:544,by:-254,t0:15,t1:130,s:.16};
const C14_L=th=>{const t=th*PI/180,A=C14_ARM;return Math.hypot(A.a*Math.cos(t)-A.bx,A.a*Math.sin(t)-A.by);};
const C14_h=th=>{const t=th*PI/180,A=C14_ARM,px=A.a*Math.cos(t),py=A.a*Math.sin(t),dx=px-A.bx,dy=py-A.by;return (px*dy-py*dx)/Math.hypot(dx,dy);}; // = dL/dθ [mm/rad]
const C14_L0=C14_L(C14_ARM.t0),C14_S44=C14_L(C14_ARM.t1)-C14_L0;
const C14_th=x=>H.bisect(t=>C14_L(t)-C14_L0-x,C14_ARM.t0,C14_ARM.t1,50);
const C14_xAt=th=>C14_L(th)-C14_L0;
const C14_F=(P,th)=>P.m*G*P.r*Math.cos(th*PI/180)/C14_h(th);   // N, + = pushes the rod in (opposes extension)
function C14_curve(P,st){const k=`${P.m}|${P.r}|${P.D}|${P.dr}`;if(st.ck!==k){st.ck=k;const A2=H.Aann(P.D,Math.min(P.dr,P.D-4));let mx=0,pr=0;st.cv=[];
    for(let t=C14_ARM.t0;t<=C14_ARM.t1+1e-9;t+=2.5){const F=C14_F(P,t);st.cv.push([t,F/1000]);mx=Math.max(mx,Math.abs(F));pr=Math.max(pr,-10*F/A2);}st.Fmx=mx;st.pRod=pr;}return st;}
/* mechanism drawing: ground, post with pivot O, cylinder from B to the arm, arm + mass at its CG, gravity arrow, torque arc. cs={th,r,M,F,col,uA} */
SYM.c14_arm={ports:o=>({}),bb:o=>[-140,-146,140,110],
  draw(g,o){const s=o.s,Bx=o.bx*s,By=-o.by*s;
    SL(g,-70,70,140,70,'sy thick');for(let x=-66;x<140;x+=9)SL(g,x,70,x-6,77,'sy thin');
    const dc=SL(g,0,-4,0,-134,'sy dash thin');dc.style.stroke='#64748b';ST(g,0,-138,'אנך – נקודה מתה','st s');
    SP(g,'M-12,70 L0,0 L12,70','syb');SP(g,`M${Bx-9},70 L${Bx},${By} L${Bx+9},70`,'syb');
    const bar=SL(g,0,0,0,0,'sy');bar.style.strokeWidth=12;bar.style.stroke='#334155';const oil=SL(g,0,0,0,0,'sy');oil.style.strokeWidth=8;
    const rod=SL(g,0,0,0,0,'sy');rod.style.strokeWidth=4;rod.style.stroke='#94a3b8';SC(g,Bx,By,3.4,'syb');
    const arm=sv('g',{},g);const ab=SR(arm,-7,-5,100,10,'syb');ab.style.fill='#fde68a';const eye=SC(arm,0,0,3,'syb');SC(g,0,0,4.5,'syb');
    const mg=sv('g',{},g);SR(mg,-13,-13,26,26,'load');ST(mg,0,4,'m','st b');SA(mg,0,13,0,34,'sy',4);ST(mg,8,32,'W','st s');
    const arc=SP(g,'','sy');arc.style.strokeWidth=2.4;const ah=SP(g,'','syf');
    const t1=C14_ltr(ST(g,35,94,'','st')),t2=C14_ltr(ST(g,35,107,'','st'));
    return cs=>{if(!cs)return;const t=cs.th*PI/180,c=Math.cos(t),sn=Math.sin(t),R=cs.r*s,A=o.a*s,ax=A*c,ay=-A*sn;
      arm.setAttribute('transform',`rotate(${-cs.th})`);ab.setAttribute('width',R+22);eye.setAttribute('cx',A);mg.setAttribute('transform',`translate(${R*c},${-R*sn})`);
      const dx=ax-Bx,dy=ay-By,L=Math.hypot(dx,dy),ux=dx/L,uy=dy/L,Lb=o.Lmin*s*.92;
      [bar,oil].forEach(e=>{e.setAttribute('x1',Bx);e.setAttribute('y1',By);e.setAttribute('x2',Bx+ux*Lb);e.setAttribute('y2',By+uy*Lb);});oil.style.stroke=pCss(cs.uA||0);
      rod.setAttribute('x1',Bx+ux*(Lb-3));rod.setAttribute('y1',By+uy*(Lb-3));rod.setAttribute('x2',ax);rod.setAttribute('y2',ay);
      const sg=c>=0?-1:1,R2=R+22,t2a=t+sg*.38,p1=[R2*c,-R2*sn],p2=[R2*Math.cos(t2a),-R2*Math.sin(t2a)];
      arc.setAttribute('d',Math.abs(c)<.02?'':`M${p1[0].toFixed(1)},${p1[1].toFixed(1)} A${R2},${R2} 0 0,${sg<0?1:0} ${p2[0].toFixed(1)},${p2[1].toFixed(1)}`);
      const tx=sg<0?Math.sin(t2a):-Math.sin(t2a),ty=sg<0?Math.cos(t2a):-Math.cos(t2a),nx=-ty,ny=tx;
      ah.setAttribute('d',Math.abs(c)<.02?'':`M${(p2[0]+tx*7).toFixed(1)},${(p2[1]+ty*7).toFixed(1)} L${(p2[0]+nx*4).toFixed(1)},${(p2[1]+ny*4).toFixed(1)} L${(p2[0]-nx*4).toFixed(1)},${(p2[1]-ny*4).toFixed(1)}Z`);
      arc.style.stroke=cs.col;ah.style.fill=cs.col;
      t1.textContent=`θ = ${fmt(cs.th,0)}°   M = ${fmt(cs.M/1000,2)} kN·m`;t2.textContent=`F = ${fmt(cs.F/1000,2)} kN`;t2.style.fill=cs.F>=0?'#0f172a':'#b91c1c';};}};
B3.c14_arm=(c,o)=>{const M=m3(),g=new THREE.Group(),s=o.s,z=34,Bx=o.bx*s,By=o.by*s,Y=new THREE.Vector3(0,1,0);
  g.add(edges(at(box3(220,6,46,M.alu),35,-73,z)));g.add(edges(at(box3(14,70,16,M.dark),0,-35,z)));g.add(edges(at(box3(12,70+By,14,M.dark),Bx,(-70+By)/2,z)));
  g.add(at(cyl3(4,40,M.steel,'z'),0,0,z));g.add(at(cyl3(3.5,30,M.steel,'z'),Bx,By,z));
  const arm=new THREE.Group();at(arm,0,0,z+12);g.add(arm);const bar=edges(at(box3(1,10,10,M.yellow),0,0,0));arm.add(bar);const mass=edges(at(box3(26,26,26,M.orange),0,0,0));arm.add(mass);
  const barrel=at(cyl3(6.5,1,M.blue),0,0,z);g.add(barrel);const rod=at(cyl3(2.6,1,M.steel),0,0,z);g.add(rod);
  const seg=(m,x1,y1,x2,y2)=>{const d=new THREE.Vector3(x2-x1,y2-y1,0),L=Math.max(d.length(),.1);m.position.set((x1+x2)/2,(y1+y2)/2,z);m.scale.set(1,L,1);m.quaternion.setFromUnitVectors(Y,d.normalize());};
  const Lb=o.Lmin*s*.92;
  return {g,upd(cs){if(!cs)return;const t=cs.th*PI/180,R=cs.r*s;arm.rotation.z=t;bar.scale.x=R+22;bar.position.x=(R+22)/2-7;mass.position.x=R;
    const ax=o.a*s*Math.cos(t),ay=o.a*s*Math.sin(t),dx=ax-Bx,dy=ay-By,L=Math.hypot(dx,dy),ux=dx/L,uy=dy/L;seg(barrel,Bx,By,Bx+ux*Lb,By+uy*Lb);seg(rod,Bx+ux*(Lb-4),By+uy*(Lb-4),ax,ay);}};};
const C14_PN={none:'בלי הגנה',meterin:'צמצמים בכניסה',meterout:'צמצמים ביציאה',cbv:'שסתום איזון עומס כפול'};
const C14_SIM_OVR={id:'overrun',n:44,t:'עומס מכני אינרציאלי',d:'זרוע שעוברת את מרכז הכובד: הכוח מחליף סימן, העומס מתחיל למשוך – ומה מחזיק אותו בשליטה',
  P:{prot:'cbv',pos:'a',auto:true,m:400,r:700,Q:16,pset:120,phi:4,thr:1.6,D:63,dr:36,pr:160,ta:30,hm:250,Ft:12000,Qo:12,pb:90,pLt:90},
  key:P=>P.prot,
  ui(U,P){U.grp('הגנה מפני עומס מכני אינרציאלי');U.sel(P,'prot','מה בולם',[['none','שסתום פיקוד בלבד'],['meterin','צמצמים בכניסה (meter-in)'],['meterout','צמצמים ביציאה (meter-out)'],['cbv','שסתום איזון עומס כפול']],true);
    U.seg(P,'pos','ידית',[['a','יציאה','הזרוע עולה ועוברת את האנך (P→A)'],['0','עצירה','מרכז'],['b','חזרה','הזרוע חוזרת (P→B)']]);U.chk(P,'auto','מחזור אוטומטי');
    U.grp('זרוע ועומס');U.num(P,'m','מסה בקצה הזרוע','kg',{min:0,max:1500,step:10});U.num(P,'r','מרחק מרכז הכובד r','mm',{min:300,max:1100,step:10});U.num(P,'Q','ספיקת משאבה','L/min',{min:2,max:40,step:1});
    if(P.prot==='cbv'){U.grp('שסתום איזון עומס');U.num(P,'pset','לחץ כיול p_set','bar',{min:10,max:300,step:5});U.num(P,'phi','יחס פיקוד φ','',{min:1,max:12,step:.5});}
    else if(P.prot!=='none'){U.grp('צמצמים');U.num(P,'thr','פתח הצמצם A₀','mm²',{min:.2,max:12,step:.1});}
    U.grp('צילינדר ושסתום פריקה',false);U.num(P,'D','קוטר בוכנה D','mm',{min:40,max:125,step:1});U.num(P,'dr','קוטר מוט d','mm',{min:16,max:90,step:1});U.num(P,'pr','כיול שסתום פריקה','bar',{min:50,max:300,step:5});},
  circuit(P){const pr=P.prot,cen=pr==='cbv'?'open':'tandem',A=C14_ARM;
    const comps=[{id:'ARM',type:'c14_arm',x:130,y:125,o:{s:A.s,a:A.a,bx:A.bx,by:A.by,Lmin:C14_L0},name:'המנגנון: זרוע על ציר O, צילינדר מנקודה B על הקרקע. החץ הצבעוני = הכיוון שהכובד מסובב את הזרוע'},
      {id:'C1',type:'cyl',x:420,y:60,name:'צילינדר הזרוע (סמל) – יציאה מסובבת את הזרוע מעלה ומעבר לאנך',lbl:'צילינדר',lblAt:[-84,-20],l3:[0,-34]},
      {id:'V1',type:'dcv',x:420,y:260,o:{box:KIT.D43[cen],L:'lever',center:true},name:`שסתום פיקוד 4/3, מרכז ${KIT.CEN[cen]} – לחיצה מחליפה מצב`,lbl:`4/3 ${KIT.CEN[cen]}`,lblAt:[92,4]},
      {id:'P1',type:'pump',x:350,y:350,name:'משאבה',lbl:'משאבה',lblAt:[34,6]},{id:'T1',type:'tank',x:350,y:394,name:'מיכל'},
      {id:'RV',type:'pv',x:300,y:300,rot:-90,o:{kind:'relief'},name:'שסתום פריקה',lbl:'פריקה',lblAt:[0,-28]},{id:'T2',type:'tank',x:250,y:330,name:'מיכל'},{id:'T3',type:'tank',x:500,y:325,name:'מיכל'},
      {id:'GA',type:'gauge',x:360,y:88,net:'A',o:{max:160},name:'מד לחץ – צד מלא (A)',valAt:[-14,-16],l3:[0,-30]},{id:'GB',type:'gauge',x:490,y:98,net:'B',o:{max:160},name:'מד לחץ – צד המוט (B)',valAt:[14,-16],l3:[0,-30]},
      {id:'GP',type:'gauge',x:390,y:288,net:'P',o:{max:160},name:'מד לחץ משאבה',valAt:[-16,22],l3:[0,-30]},
      {id:'CH',type:'c14_chart',x:50,y:268,o:{w:170,h:70,t:'הכוח הנדרש בצילינדר F(θ)',xl:'θ [°]',yl:'F [kN]',col:['#0b72d9'],sw:[2]},name:'גרף: הכוח שהעומס מפעיל על הצילינדר לאורך המהלך. מעל 0 = דוחף פנימה (מתנגד ליציאה), מתחת ל-0 = מושך החוצה'}];
    const lines=[{id:'LS',net:'S',pts:['T1.t','P1.in']},{id:'LP',net:'P',pts:['P1.out',[350,300],[413,300],'V1.P']},{id:'LRV',net:'P',pts:[[350,300],'RV.P']},{id:'LRT',net:'T',pts:['RV.T',[250,300],'T2.t']},
      {id:'LT',net:'T',pts:['V1.T',[427,300],[500,300],'T3.t']}];
    if(pr==='none')lines.push({id:'LA1',net:'A',pts:['C1.A',[370,100],[350,100],[350,155]],nodot:true},{id:'LA2',net:'Av',pts:[[350,155],[350,215],'V1.A'],nodot:true},
      {id:'LB1',net:'B',pts:['C1.B',[470,110],[510,110],[510,171]],nodot:true},{id:'LB2',net:'Bv',pts:[[510,171],[510,222],'V1.B'],nodot:true});
    else{const cb=pr==='cbv',up=pr==='meterout'?'up':'down',iL=cb?'L':'out',iV=cb?'V':'in';
      if(cb)comps.push({id:'HA',type:'cbv',x:350,y:155,rot:180,o:{},name:'שסתום איזון עומס A: בולם את הזרוע בחזרה (העומס מושך את המוט פנימה); פיקוד מקו B',lbl:'שסתום A',lblAt:[-82,4],l3:[0,-34]},
        {id:'HB',type:'cbv',x:510,y:171,rot:180,flip:true,o:{},name:'שסתום איזון עומס B: בולם את הזרוע ביציאה, אחרי האנך; פיקוד מקו A',lbl:'שסתום B',lblAt:[84,4],l3:[0,-34]});
      else comps.push({id:'HA',type:'throttle1',x:350,y:155,o:{free:up},name:pr==='meterout'?'צמצם אל-חוזר בקו A: חונק את השמן היוצא מהצד המלא':'צמצם אל-חוזר בקו A: חונק את השמן הנכנס לצד המלא',lbl:'צמצם A',lblAt:[-58,4],l3:[0,-34]},
        {id:'HB',type:'throttle1',x:510,y:171,o:{free:up},name:pr==='meterout'?'צמצם אל-חוזר בקו B: חונק את השמן היוצא מצד המוט':'צמצם אל-חוזר בקו B: חונק את השמן הנכנס לצד המוט',lbl:'צמצם B',lblAt:[66,4],l3:[0,-34]});
      lines.push({id:'LA1',net:'A',pts:['C1.A',[370,100],[350,100],'HA.'+iL]},{id:'LA2',net:'Av',pts:['HA.'+iV,[350,215],'V1.A']},
        {id:'LB1',net:'B',pts:['C1.B',[470,110],[510,110],'HB.'+iL]},{id:'LB2',net:'Bv',pts:['HB.'+iV,[510,222],'V1.B']});
      if(cb)lines.push({id:'LXA',net:'Bv',kind:'pilot',pts:[[450,222],[450,133],'HA.X']},{id:'LXB',net:'Av',kind:'pilot',pts:[[395,215],[395,149],'HB.X']});}
    return {comps,lines};},
  init:P=>({x:C14_xAt(60),si:KIT.idx[P.pos],t:0,ps:0,dir:0}),
  click(id,P){if(id==='V1'){P.pos=P.pos==='a'?'0':P.pos==='0'?'b':'a';P.auto=false;return true;}},
  step(P,st,dt,ctx){const f=ctx.fault,A1=H.A(P.D),A2=H.Aann(P.D,Math.min(P.dr,P.D-4)),S=C14_S44,pm=P.pr,pr=P.prot,kV=C14_KV;C14_curve(P,st);
    const end0=(st.dir>0&&st.x>=S-1e-6)||(st.dir<0&&st.x<=1e-6);C14_seq(P,st,dt,end0,['a','0','b','0'],.8);
    const dir=KIT.dirOf(P.pos);st.dir=dir;const atEnd=(dir>0&&st.x>=S-1e-6)||(dir<0&&st.x<=1e-6);
    const th=C14_th(st.x),h=C14_h(th),F0=C14_F(P,th),M=P.m*G*P.r/1000*Math.cos(th*PI/180),vQ=H.v(P.Q,A1);
    const leak=f==='spool'?C14_KW:0,Qe=Math.max(0,P.Q-leak*Math.sqrt(Math.max(st.ps||0,0))),psetB=f==='cbvlow'?Math.min(P.pset,.6*st.pRod):P.pset,phiB=f==='pilot'?0:P.phi;
    let r=null,ps,pA,pB,pAv,pBv,v=0,Qr=0,qA=0,qB=0,cav=false,stall=false,oA=0,oB=0,cA=0,cB=0,pX=0;
    if(dir===0){ps=(P.Q/C14_KU)**2;pA=F0>0?10*F0/A1:0;pB=F0<0?-10*F0/A2:0;pAv=pBv=0;}
    else{const ext=dir>0,Ain=ext?A1:A2,Aout=ext?A2:A1,Fl=ext?F0:-F0,F=atEnd?1e9:Fl,vR=H.v(P.Q,Ain)*8;
      if(pr==='cbv'){r=C14_cbvMove({Q:Qe,pr:P.pr,Ain,Aout,F,Fr:Fl,pset:ext?psetB:P.pset,phi:ext?phiB:P.phi,kV,chkIn:true,vRun:vR});if(leak)r.ps=Math.max(r.ps,0);if(r.stall)r.Qr=Qe;pX=r.pX;}
      else{const kT=H.orK(P.thr),kIn=pr==='meterin'?C14_ser(kV,kT):pr==='meterout'?C14_ser(kV,C14_KC):kV,kOut=pr==='meterout'?C14_ser(kV,kT):pr==='meterin'?C14_ser(kV,C14_KC):kV;
        r=H.lin({Qp:P.Q,pr:P.pr,Ain,Aout,F,kIn,kOut,kBleed:leak,vRun:vR});if(r.cav)r.ps=Math.max(0,r.pIn+H.orDp(kIn,r.Qin));}
      ps=r.ps;v=dir*r.v;cav=!!r.cav;stall=!!r.stall;Qr=r.Qr||0;
      const pIn=r.pIn,pOut=r.pOut,pInV=pr==='none'?pIn:Math.max(pIn,ps-((r.Qin||0)/kV)**2),pOutV=pr==='none'?pOut:((r.Qout||0)/kV)**2;
      if(ext){pA=pIn;pB=pOut;pAv=pInV;pBv=pOutV;qA=-(r.Qin||0);qB=r.Qout||0;oB=r.open??1;cA=1;}else{pB=pIn;pA=pOut;pBv=pInV;pAv=pOutV;qB=-(r.Qin||0);qA=r.Qout||0;oA=r.open??1;cB=1;}
      if(stall){qA=qB=0;}}
    if(dt>0){st.x=clamp(st.x+v*dt,0,S);st.t+=dt;}st.ps=ps;KIT.ease(st,'si',KIT.idx[P.pos],dt,8);KIT.rpmAng(st,dt,1450);
    const heat=Math.max(0,H.kW(Math.max(ps,0),P.Q)-F0*v/1e6),ov=dir!==0&&F0*dir<0,col=dir===0?'#64748b':ov?'#dc2626':'#16a34a',Y=KIT.nice(st.Fmx/1000*1.1);
    const cavL=cav?(dir>0?{LA1:true,LA2:true}:{LB1:true,LB2:true}):null,vMx=H.v(P.Q,dir<0?A2:A1);
    return {th,h,F0,M,pA,pB,ps,v,vQ,cav,stall,dir,ov,heat,A1,A2,S,pRod:st.pRod,psetB,pX,r,
      p:{P:ps,A:pA,B:pB,Av:pAv,Bv:pBv,T:Math.min(1,(Math.abs(qA)+Math.abs(qB))/P.Q/2),S:-.05},
      q:{LS:P.Q,LP:P.Q-Qr,LRV:Qr,LRT:Qr,LA1:qA,LA2:qA,LB1:qB,LB2:qB,LT:dir>0?Math.abs(qB):dir<0?Math.abs(qA):0},pmax:pm,qref:P.Q,vac:true,cav:cavL,
      c:{ARM:{th,r:P.r,M,F:F0,col,uA:(dir<0?pB:pA)/pm},C1:{x:st.x/S,uA:pA/pm,uB:pB/pm},V1:{i:st.si},P1:{on:true,ang:st.ang},RV:{open:clamp(Qr/P.Q,0,1)},
        HA:pr==='cbv'?{open:oA,chk:cA}:{knob:P.thr/3,chk:pr==='meterout'?cA:pr==='meterin'?(dir<0?1:0):0},HB:pr==='cbv'?{open:oB,chk:cB}:{knob:P.thr/3,chk:pr==='meterout'?cB:pr==='meterin'?(dir>0?1:0):0},
        CH:{x0:C14_ARM.t0,xm:C14_ARM.t1-C14_ARM.t0,y0:-Y,ym:2*Y,xd:0,yd:Y<10?1:0,L:[st.cv],dot:[th,F0/1000]}},
      read:[{k:'זווית הזרוע θ',v:th,u:'°',max:C14_ARM.t1,dg:0},{k:'כוח בצילינדר F',v:F0/1000,u:'kN',dg:2,w:ov},{k:'צד מלא p_A',v:pA,u:'bar',w:pA<-.3,dg:2},{k:'צד המוט p_B',v:pB,u:'bar',w:pB<-.3,dg:2},
        {k:'לחץ משאבה',v:ps,u:'bar'},{k:'מהירות בוכנה',v:v,u:'mm/s',max:vMx*1.6,w:Math.abs(v)>vMx*1.15},{k:'חום במעגל',v:heat,u:'kW',dg:2,max:Math.max(1,H.kW(P.pr,P.Q))}]};},
  ins(P,R){const L=[],pr=P.prot,side=R.dir>0?'המלא (A)':'המוט (B)',pin=R.dir>0?R.pA:R.pB,pout=R.dir>0?R.pB:R.pA,Aout=R.dir>0?R.A2:R.A1;
    L.push({ic:'📐',at:'ARM',h:`${C14_m(`θ = ${fmt(R.th,0)}°`)}: מומנט הכובד ${C14_m(`<b>M = m·g·r·cosθ</b> = ${fmt(P.m,0)}·9.81·${fmt(P.r/1000,2)}·${fmt(Math.cos(R.th*PI/180),3)} = <b>${fmt(R.M/1000,2)} kN·m</b>`)}. זרוע הצילינדר ${C14_m(`h = ${fmt(R.h,0)} mm`)}, ולכן ${C14_m(`<b>F = M/h = ${fmt(R.F0/1000,2)} kN</b>`)} ${R.F0>=0?'– העומס דוחף את המוט פנימה.':'– העומס מושך את המוט החוצה!'}`});
    if(Math.abs(R.th-90)<5)L.push({ic:'🎯',at:'CH',h:'הזרוע כמעט אנכית: המומנט מתאפס, והכוח בצילינדר עובר דרך 0 – כאן העומס "מחליף צד".'});
    if(R.dir!==0&&!R.ov&&!R.stall)L.push({ic:'💪',h:`כרגע העומס <b>מתנגד</b> לתנועה: הלחץ נבנה בצד ${side} – ${fmt(pin,1)} bar, והמשאבה דוחפת ב-${fmt(R.ps,1)} bar.`});
    if(R.ov){const run=Math.abs(R.v)>R.vQ*1.1*(R.dir<0?R.A1/R.A2:1);
      if(R.cav)L.push({ic:'💥',w:true,at:pr==='meterin'?(R.dir>0?'HA':'HB'):'C1',h:`העומס <b>מושך</b> (${fmt(Math.abs(R.F0)/1000,2)} kN) ואין מה שיבלום את היציאה: הבוכנה רצה ${fmt(Math.abs(R.v),0)} mm/s והצד ${side} בתת-לחץ (${fmt(pin,2)} bar) – קוויטציה.${pr==='meterin'?' צמצם בכניסה רק מגביל כמה שמן נכנס – הוא לא בולם את מה שיוצא.':''}`,c:pr==='meterin'?'צמצם בכניסה לא בולם עומס מכני אינרציאלי':'העומס מקדים את המשאבה – תת-לחץ'});
      else if(pr==='meterout')L.push({ic:'🛑',at:R.dir>0?'HB':'HA',h:`הצמצם ביציאה בולם: לחץ גב של <b>${fmt(pout,1)} bar</b> בצד היוצא מחזיק את העומס המושך, והמהירות נשארת Q/A (${fmt(Math.abs(R.v),0)} mm/s).`});
      else if(pr==='cbv')L.push({ic:'🛑',at:R.dir>0?'HB':'HA',h:`שסתום איזון העומס בולם: הוא נפתח רק כמה שהפיקוד מאפשר. לחץ הכניסה <b>${fmt(pin,1)} bar</b> = (p_set + p_V − φ·Δp_chk − p_load)/(φ + A_in/A_out), והעומס לא בורח.`});
      else if(!run)L.push({ic:'⬇️',h:`העומס מושך, אבל מפל הלחץ בשסתום הפיקוד עדיין מספיק לבלום אותו.`});}
    if(pr==='meterout')L.push({ic:'🔥',at:'GP',h:`המחיר של ויסות ביציאה (meter-out): הצמצם חונק גם כשהעומס מתנגד. בתחילת המהלך המשאבה צריכה לדחוף נגד ${fmt((R.vQ*R.A2*60/1e6/H.orK(P.thr))**2,0)} bar לחץ גב – הרבה חום. לצמצם שמחזיק גם בסוף המהלך צריך A₀ ≤ ${fmt(H.Q(R.vQ,R.A2)/(.637*Math.sqrt(Math.max(R.pRod,1))),2)} mm².`});
    if(pr==='cbv'){if(P.pset<R.pRod)L.push({ic:'⚠️',w:true,at:'HB',h:`הכיול (${fmt(P.pset,0)} bar) נמוך מהלחץ שהעומס יוצר בצד המוט בסוף המהלך (${fmt(R.pRod,0)} bar) – שם הזרוע תיפול קדימה.`,c:'הכיול נמוך מלחץ העומס המושך'});
      else L.push({ic:'📏',h:`העומס המושך יוצר עד <b>${fmt(R.pRod,0)} bar</b> בצד המוט (בסוף המהלך). הכיול ${fmt(P.pset,0)} bar = ${fmt(P.pset/Math.max(R.pRod,1),2)}× ממנו (מקובל ×1.3).`});
      L.push({ic:'🔁',h:'שני שסתומים בהצלבה: B בולם ביציאה אחרי האנך, A בולם בחזרה כשהזרוע חוזרת מעבר לאנך. הפיקוד של כל אחד מגיע מהקו של השני.'});}
    if(pr==='none'||pr==='meterin')L.push({ic:'💡',h:'עומס מכני אינרציאלי נבלם רק בצד <b>היוצא</b>: צמצם ביציאה (meter-out) או שסתום איזון עומס. צמצם בכניסה לא עוזר.'});
    L.push({ic:'🌡️',h:`חום במעגל: ${fmt(R.heat,2)} kW (הספק המשאבה ${R.ov?'ועוד האנרגיה שהעומס משחרר':'פחות העבודה שנאגרת בהרמה'}).`});return L;},
  calc(P,R){const A=C14_ARM,t=R.th*PI/180,px=A.a*Math.cos(t),py=A.a*Math.sin(t),Lc=C14_L(R.th),Qo=H.Q(R.vQ,R.A2),pV=(Qo/C14_KV)**2,dIn=C14_PC+(P.Q/C14_KCB)**2,kT=H.orK(P.thr);
    const pAc=(10*R.F0+(P.pset+pV-P.phi*dIn)*R.A2)/(R.A1+P.phi*R.A2),pBm=(Qo/C14_ser(C14_KV,kT))**2,pAm=(10*R.F0+pBm*R.A2)/R.A1;
    return `<div class="kpis">${kpi('זווית',fmt(R.th,0),'°')}${kpi('מומנט',fmt(R.M/1000,2),'kN·m')}${kpi('כוח בצילינדר',fmt(R.F0/1000,2),'kN')}${kpi('לחץ מושך מקסימלי',fmt(R.pRod,0),'bar','צד המוט')}</div>`+
      det('גאומטריה',row('נקודת החיבור',`P = a(cosθ, sinθ) = (${fmt(px,0)}, ${fmt(py,0)}) mm; B = (${A.bx}, ${A.by})`)+row('אורך הצילינדר',`L = |P − B| = ${V(Lc,'mm')} (מהלך ${fmt(R.S,0)} mm)`)+row('זרוע המומנט',`h = ${fr('x_P·Δy − y_P·Δx','L')} = dL/dθ = ${V(R.h,'mm')}`),true)+
      det('מומנט וכוח',row('מומנט הכובד',`M = m·g·r·cosθ = ${P.m}·9.81·${fmt(P.r/1000,3)}·${fmt(Math.cos(t),3)} = ${V(R.M,'N·m')}`)+row('כוח בצילינדר',`F = M/h = ${fr(fmt(R.M,0),fmt(R.h/1000,4))} = ${V(R.F0,'N')}`,R.F0>=0?undefined:false)+
        row('לחץ שהעומס יוצר',R.F0>=0?`צד מלא: p = F/A₁ = ${V(10*R.F0/R.A1,'bar')}`:`צד המוט: p = |F|/A₂ = ${V(-10*R.F0/R.A2,'bar')} – העומס מושך`),true)+
      det('לחצים ביציאה – במיקום הנוכחי',row('צמצם ביציאה',`p_B = (Q_out/k)² = (${fmt(Qo,2)}/${fmt(C14_ser(C14_KV,kT),3)})² = ${V(pBm,'bar')} ⇒ p_A = (F + p_B·A₂)/A₁ = ${V(pAm,'bar')}`)+
        row('שסתום איזון עומס',`p_A = ${fr('F + (p_set + p_V − φ·Δp_chk)·A₂','A₁ + φ·A₂')} = ${V(pAc,'bar')}`)+row('בלי בלימה',R.F0<0?`אם (F + p_vac·A₁) < 0 העומס בורח – קוויטציה בצד המלא`:'העומס מתנגד – אין בריחה'),true)+
      det('תכנון ההגנה',row('כיול שסתום איזון עומס',`p_set ≥ 1.3·p_max = 1.3·${fmt(R.pRod,1)} = ${V(1.3*R.pRod,'bar')}`,P.pset>=1.3*R.pRod)+row('פיקוד (קטלוג)',`p_X = (p_set − p_L)/φ`)+row('צמצם ביציאה',`A₀ ≤ ${fr('Q_out','0.637·√p_max')} = ${V(Qo/(.637*Math.sqrt(Math.max(R.pRod,1))),'mm²',3)}`))+
      `<div class="note">a = ${A.a} mm, B = (${A.bx}, ${A.by}) mm, θ = ${A.t0}°…${A.t1}°. Δp_chk = p_c + (Q/k)² באל-חוזר של השסתום השני, p_V = מפל בשסתום הפיקוד. מצב מתמיד, ללא אינרציה.</div>`;},
  demo:[{t:'זרוע שעוברת את האנך',x:'צילינדר מסובב זרוע עם מסה של 400 ק"ג סביב ציר O. החץ הצבעוני מראה לאן הכובד מסובב את הזרוע. בגרף: הכוח שהצילינדר צריך לאורך המהלך.',reset:true,set:{prot:'none',pos:'0',auto:false},act:(P,st)=>{st.x=C14_xAt(35);},hl:['ARM','CH'],dur:8},
    {t:'עד האנך – העומס מתנגד',x:'ביציאה הזרוע עולה. לפני האנך הכובד מושך אותה חזרה: הכוח חיובי, הלחץ בצד המלא והמשאבה עובדת.',reset:true,set:{prot:'none',pos:'a',auto:false},act:(P,st)=>{st.x=C14_xAt(35);},hl:['ARM','GA','GP'],dur:4},
    {t:'אחרי האנך – העומס מושך',x:'ב-90° המומנט מתאפס. מעבר לו הכובד מושך את הזרוע קדימה: הכוח שלילי, הבוכנה בורחת והצד המלא נכנס לתת-לחץ (סגול).',reset:true,set:{prot:'none',pos:'a',auto:false},act:(P,st)=>{st.x=C14_xAt(84);},hl:['ARM','C1','GA'],dur:6},
    {t:'צמצמים בכניסה – לא עוזרים',x:'צמצם חונק את השמן <b>הנכנס</b>. אבל העומס המושך לא צריך את השמן מהמשאבה – הוא בורח בכל זאת, והצד המלא בתת-לחץ.',reset:true,set:{prot:'meterin',pos:'a',auto:false},act:(P,st)=>{st.x=C14_xAt(84);},hl:['HA','GA'],dur:7},
    {t:'צמצמים ביציאה – בולמים',x:'הצמצם חונק את השמן <b>היוצא</b> מצד המוט ויוצרת לחץ גב שמחזיק את העומס. המהירות נשארת Q/A₁ גם אחרי האנך.',reset:true,set:{prot:'meterout',pos:'a',auto:false},act:(P,st)=>{st.x=C14_xAt(84);},hl:['HB','GB'],dur:7},
    {t:'המחיר של ויסות ביציאה (meter-out)',x:'בתחילת המהלך העומס מתנגד, אבל הצמצם עדיין חונק: המשאבה דוחפת כ-100 bar במקום כ-30. כל ההפרש הופך לחום.',reset:true,set:{prot:'meterout',pos:'a',auto:false},act:(P,st)=>{st.x=C14_xAt(18);},hl:['GP','HB'],dur:7},
    {t:'שסתום איזון עומס כפול',x:'שני שסתומי איזון עומס בהצלבה. כשהעומס מתנגד הפיקוד פותח את השסתום והמשאבה דוחפת רק כ-34 bar; כשהעומס מושך – השסתום בולם.',reset:true,set:{prot:'cbv',pos:'a',auto:false},act:(P,st)=>{st.x=C14_xAt(18);},hl:['HA','HB','GP'],dur:9},
    {t:'גם בחזרה',x:'בחזרה הזרוע עוברת שוב את האנך – והפעם העומס מושך את המוט פנימה. עכשיו שסתום A בולם את השמן שיוצא מהצד המלא.',reset:true,set:{prot:'cbv',pos:'b',auto:false},act:(P,st)=>{st.x=C14_xAt(100);},hl:['HA','GA','ARM'],dur:9}],
  predict:[{q:'בלי הגנה, הזרוע עולה (יציאה) ומתקרבת לאנך. מה יקרה כשתעבור אותו?',set:{prot:'none',pos:'a',auto:false},act:(P,st)=>{st.x=C14_xAt(78);},opts:['תמשיך באותה מהירות','תאיץ ותקדים את המשאבה – תת-לחץ בצד המלא','תיעצר באנך'],a:1,dur:4,why:'אחרי האנך הכובד מושך את הזרוע קדימה. רק מפל הלחץ בשסתום הפיקוד בולם אותה – לא מספיק. הבוכנה רצה, והמשאבה לא מספיקה למלא את הצד המלא.'},
    {q:'מתקינים צמצמים אל-חוזרים בכניסה (meter-in). האם התנועה תישאר מבוקרת אחרי האנך?',set:{prot:'meterin',pos:'a',auto:false},act:(P,st)=>{st.x=C14_xAt(78);},opts:['כן – הצמצם מגביל את הספיקה','לא – העומס בורח והצד המלא בתת-לחץ','הזרוע תיעצר'],a:1,dur:4,why:'צמצם בכניסה מגבילה רק את השמן שהמשאבה שולחת. העומס המושך דוחף את השמן החוצה מצד המוט בלי התנגדות, והצד המלא נשאר ריק.'},
    {q:'הזרוע עוצרת בדיוק באנך (θ = 90°). איזה כוח צריך הצילינדר להפעיל כדי להחזיק אותה?',set:{prot:'cbv',pos:'0',auto:false},act:(P,st)=>{st.x=C14_xAt(90);},opts:['הכי גדול – זו הנקודה הגבוהה','אפס – המומנט מתאפס','כמו בתחילת המהלך'],a:1,dur:3,why:'M = m·g·r·cosθ ו-cos 90° = 0. מרכז הכובד בדיוק מעל הציר – הכובד לא מסובב את הזרוע.'},
    {q:'בתחילת המהלך (θ ≈ 20°), עם צמצמים ביציאה של 1.6 mm². לחץ המשאבה לעומת שסתום איזון עומס יהיה:',set:{prot:'meterout',pos:'a',auto:false},act:(P,st)=>{st.x=C14_xAt(18);},opts:['נמוך יותר','בערך זהה','גבוה פי 3 בערך'],a:2,dur:3,why:'הצמצם יוצר כ-110 bar לחץ גב גם כשהעומס לא מושך, ולכן המשאבה צריכה כ-100 bar. שסתום איזון העומס נפתח בפיקוד ודורש כ-34 bar בלבד.'}],
  tasks:[{q:P=>`מסה ${P.m} ק"ג, מרכז הכובד ${P.r} מ"מ מהציר, הזרוע בזווית ${P.ta}° מהאופק. מה מומנט הכובד?`,a:P=>P.m*G*P.r/1000*Math.cos(P.ta*PI/180),u:'N·m',hint:'M = m·g·r·cosθ (r במטרים).',rand:P=>{P.m=rnd(100,1200,10);P.r=rnd(300,1100,10);P.ta=pick([15,20,30,40,50,60,70]);}},
    {q:P=>`מומנט כובד של ${P.Ft} N·m וזרוע צילינדר h = ${P.hm} מ"מ. איזה כוח צריך הצילינדר (ב-kN)?`,a:P=>P.Ft/(P.hm/1000)/1000,u:'kN',hint:'F = M/h, עם h במטרים.',rand:P=>{P.Ft=rnd(500,8000,50);P.hm=rnd(60,400,5);}},
    {q:P=>`אחרי האנך העומס מושך את המוט החוצה בכוח ${P.Ft} N. צילינדר Ø${P.D}/${P.dr}. איזה לחץ נוצר בצד המוט?`,a:P=>10*P.Ft/H.Aann(P.D,P.dr),u:'bar',hint:'p = F/A₂.',rand:P=>{P.Ft=rnd(3000,30000,500);P.D=pick([50,63,80,100]);P.dr=Math.round(P.D*pick([.5,.56,.63]));}},
    {q:P=>`צריך לחץ גב של ${P.pb} bar בספיקה יוצאת של ${P.Qo} L/min. מה שטח הפתח המקסימלי של צמצם היציאה?`,a:P=>P.Qo/(.637*Math.sqrt(P.pb)),u:'mm²',hint:'Q = 0.637·A₀·√Δp ⇒ A₀ = Q/(0.637·√Δp).',rand:P=>{P.pb=rnd(40,200,5);P.Qo=rnd(5,40,1);}},
    {q:P=>`שסתום איזון עומס מכויל ל-${P.pset} bar, φ = ${P.phi}, העומס יוצר ${P.pLt} bar. איזה לחץ פיקוד פותח אותו (נוסחת הקטלוג)?`,a:P=>(P.pset-P.pLt)/P.phi,u:'bar',hint:'p_X = (p_set − p_L)/φ.',rand:P=>{P.pLt=rnd(40,160,5);P.pset=Math.round(P.pLt*1.3/5)*5;P.phi=pick([3,4,5,8]);}}],
  faults:[{id:'cbvlow',t:'שסתום איזון עומס B מכויל נמוך / קפיץ שבור',sym:'"עד האמצע הכול חלק, אבל אחרי שהזרוע עוברת את האנך היא נופלת קדימה ונשמעת חבטה."',hint:'עקבו אחרי מד צד המוט ומד A כשהזרוע עוברת את האנך, והשוו ללחץ שהעומס יוצר.',why:'הכיול האפקטיבי של B נמוך מהלחץ שהעומס המושך יוצר בצד המוט. מעבר לזווית מסוימת השסתום נפתח כמו שסתום פריקה, הפיקוד קורס והזרוע בורחת – והצד המלא בתת-לחץ.',set:{prot:'cbv',auto:true,pos:'a'}},
    {id:'pilot',t:'קו הפיקוד לשסתום B סתום',sym:'"הזרוע זזה חלק, אבל בתחילת היציאה המשאבה מגיעה כמעט לכיול והמנוע מתאמץ."',hint:'השוו את לחץ קו A ביציאה לחישוב שסתום איזון העומס עם φ.',why:'בלי פיקוד שסתום B הוא שסתום לחץ גב: המשאבה צריכה לדחוף נגד p_set·A₂/A₁ ועוד העומס – כ-100 bar במקום כ-30. התנועה בטוחה, אבל בזבזנית ועלולה לעצור על שסתום הפריקה.',set:{prot:'cbv',auto:true,pos:'a'}},
    {id:'spool',t:'ספול שסתום הפיקוד שחוק (זליגה P→T)',sym:'"הזרוע איטית יותר מבעבר בשני הכיוונים, והשמן חם."',hint:'השוו את מהירות הבוכנה ל-Q/A. האם הלחצים חריגים?',why:'חלק מספיקת המשאבה זולג בתוך הספול ישר למיכל (k·√p). הלחצים כמעט תקינים, אבל המהירות נמוכה מ-Q/A וככל שהלחץ עולה – הזליגה גדלה.',set:{prot:'cbv',auto:true,pos:'a'}}],
  test(H){const run=(set,th,sec)=>{const P=Object.assign(clone(this.P),{auto:false,pos:'a'},set);const s=this.init(P);s.x=C14_xAt(th);let R;for(let t=0;t<sec;t+=.02)R=this.step(P,s,.02,{});return R;};
    const R=run({},40,.2),R2=run({prot:'meterout'},110,.2),A1=H.A(63),A2=H.Aann(63,36),th=R.th,h=C14_h(th),dL=(C14_L(th+.01)-C14_L(th-.01))/(.02*PI/180);
    const M=400*G*.7*Math.cos(th*PI/180),F=M*1000/h,Qo=H.Q(H.v(16,A1),A2),pV=(Qo/C14_KV)**2,dIn=C14_PC+(16/C14_KCB)**2,A=C14_ARM,rho=Math.hypot(A.bx,A.by),phi=Math.atan2(-A.by,A.bx);
    return [['h = dL/dθ',h,dL],['h = a·ρ·sin(θ+φ_B)/L',h,A.a*rho*Math.sin(th*PI/180+phi)/C14_L(th)],['M = m·g·r·cosθ',R.M,M],['F = M/h',R.F0,F],
      ['שסתום איזון עומס: p_A = (F + (p_set + p_V − φΔp)·A₂)/(A₁ + φA₂)',R.pA,(10*F+(120+pV-4*dIn)*A2)/(A1+4*A2)],['v = Q/A₁',R.v,H.v(16,A1)],
      ['meter-out: p_B = (Q_out/k)²',R2.pB,(Qo/C14_ser(C14_KV,H.orK(1.6)))**2],['meter-out: p_A = (F + p_B·A₂)/A₁',R2.pA,(10*R2.F0+R2.pB*A2)/A1],['UI זווית',R.read[0].v,R.th],['UI כוח',R.read[1].v,R.F0/1000]];}};

LABS.push({ch:14,title:'החזקה והורדה של עומס',sims:[C14_SIM_HOLD,C14_SIM_OVR]});
}
