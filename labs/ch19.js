/* lab 19 – same code as the website */
{




/* ===================== Chapter 19 – hydrostatic steering (sim 53) ===================== */

/* ---------- chapter symbols: steering unit (orbitrol), priority valve, double-rod steering cylinder ---------- */
/* steering unit: 3-position rotary valve + metering motor + steering wheel. cs:{i:0 left/1 neutral/2 right, th:wheel deg, vac} */
SYM.scu={ports:o=>({L:[-8,-30],R:[8,-30],T:[-11,30],P:[0,30],LS:[11,30]}),bb:o=>[-124,-28,96,34],
  draw(g,o){SL(g,-8,-30,-8,-25);SL(g,8,-30,8,-25);SL(g,-11,30,-11,25);SL(g,0,30,0,25);SL(g,11,30,11,25,'sy pil');
    const sg=sv('g',{class:'spool'},g);
    for(let k=0;k<3;k++){const cx=(k-1)*30,b=sv('g',{transform:`translate(${cx},0)`},sg);SR(b,-15,-25,30,50,'syb');
      if(k===1){SL(b,0,25,0,17);SL(b,-4,17,4,17);SL(b,-8,-25,-8,-18);SL(b,-11,-18,-5,-18);SL(b,8,-25,8,-18);SL(b,5,-18,11,-18);SP(b,'M11,25 V10 H-11 V25','sy thin');}
      else{const s=k===0?-1:1;SA(b,0,22,8*s,-21,'sy',4);SA(b,-8*s,-21,-11*s>0?-11:-11,21,'sy',4);SL(b,11,22,2,12,'sy thin');}}
    SL(g,45,0,62,0,'sy thin');SC(g,76,0,13,'syb');SP(g,'M70,-12 L82,-12 L76,-5Z','syf');SP(g,'M70,12 L82,12 L76,5Z','syf');
    SL(g,-77,0,-45,0,'sy');const wg=sv('g',{},g);SC(wg,-100,0,20,'syb');SC(wg,-100,0,4,'syf');[90,210,330].forEach(a=>{const r=a*PI/180;SL(wg,-100,0,-100+19*Math.cos(r),-19*Math.sin(r),'sy');});
    return cs=>{const i=cs?cs.i:1;sg.setAttribute('transform',`translate(${(1-i)*30},0)`);wg.setAttribute('transform',`rotate(${cs?cs.th:0},-100,0)`);};}};
/* priority valve: P in, CF to steering, EF to work. cs:{u:0 all to CF … 1 all to EF} */
SYM.prio={ports:o=>({P:[0,18],CF:[-7,-18],EF:[7,-18],LS:[-52,6]}),bb:o=>[-54,-18,54,18],
  draw(g,o){SL(g,0,18,0,13);SL(g,-7,-18,-7,-13);SL(g,7,-18,7,-13);SL(g,-52,6,-44,6,'sy pil');
    const sg=sv('g',{class:'spool'},g);SR(sg,-13,-13,26,26,'syb');SA(sg,0,10,-7,-10,'sy',4);SL(sg,7,-13,7,-6);SL(sg,3,-6,11,-6);
    SR(sg,13,-13,26,26,'syb');SA(sg,26,10,33,-10,'sy',4);SL(sg,19,-13,19,-6);SL(sg,15,-6,23,-6);
    SP(sg,zig(-29,0,-13,0,4,4),'sy thin');SP(sg,'M39,0 l8,-5 v10z','syf');
    return cs=>{const u=clamp(cs?cs.u:0,0,1);sg.setAttribute('transform',`translate(${-26*u},0)`);};}};
/* double-rod steering cylinder with steered wheel at the right. cs:{x:0…1, uA,uB, d:wheel angle deg} */
SYM.cyl2={ports:o=>({A:[-38,16],B:[38,16]}),bb:o=>[-100,-22,142,22],
  draw(g,o){const cA=SR(g,-50,-11,50,22,'oil'),cB=SR(g,0,-11,50,22,'oil');SR(g,-50,-11,100,22,'syb nofill');SL(g,-50,-11,-50,11,'sy thick');SL(g,50,-11,50,11,'sy thick');
    const rL=SR(g,-100,-3.5,50,7,'syb'),rR=SR(g,0,-3.5,50,7,'syb'),pis=SR(g,-3,-10,6,20,'syf2');const arm=SL(g,0,0,113,0,'sy');
    const wg=sv('g',{},g);sv('rect',{x:120,y:-17,width:11,height:34,rx:3,class:'syf2'},wg);SL(wg,125.5,0,113,0,'sy');SC(g,125.5,0,2.2,'syf');
    return cs=>{const x=clamp(cs?cs.x:.5,0,1),xp=-44+88*x;pis.setAttribute('x',xp-3);rL.setAttribute('x',xp-53);rR.setAttribute('x',xp+3);
      cA.setAttribute('width',Math.max(xp-3+50,0));cB.setAttribute('x',xp+3);cB.setAttribute('width',Math.max(50-xp-3,0));cA.style.fill=pCss(cs?cs.uA:0);cB.style.fill=pCss(cs?cs.uB:0);
      const d=cs?cs.d:0,r=d*PI/180;arm.setAttribute('x1',xp+53);arm.setAttribute('x2',125.5-12.5*Math.cos(r));arm.setAttribute('y2',-12.5*Math.sin(r));wg.setAttribute('transform',`rotate(${d},125.5,0)`);};}};
B3.scu=(c,o)=>{const M=m3(),g=new THREE.Group();g.add(edges(at(box3(90,50,22,M.alu),0,0,11)));g.add(edges(at(cyl3(13,16,M.blue,'z'),76,0,8)));
  g.add(at(cyl3(3,32,M.steel,'x'),-62,0,18));const w=new THREE.Group();w.position.set(-100,0,22);w.add(new THREE.Mesh(new THREE.TorusGeometry(19,2.4,10,36),M.black));
  [90,210,330].forEach(a=>{const s=at(box3(19,2.4,2,M.black),9.5,0,0);const p=new THREE.Group();p.add(s);p.rotation.z=a*PI/180;w.add(p);});w.add(at(cyl3(4,4,M.dark,'z'),0,0,0));g.add(w);
  const ind=at(box3(26,4,3,M.red),0,0,23);g.add(ind);return {g,upd(cs){w.rotation.z=-(cs?cs.th:0)*PI/180;ind.position.x=((cs?cs.i:1)-1)*18;}};};
B3.prio=(c,o)=>{const M=m3(),g=new THREE.Group();g.add(edges(at(box3(56,26,20,M.yellow),0,0,10)));g.add(at(cyl3(5,10,M.steel,'x'),-33,0,10));
  const ind=at(box3(4,20,3,M.red),0,0,21);g.add(ind);return {g,upd(cs){ind.position.x=-13+26*clamp(cs?cs.u:0,0,1);}};};
B3.cyl2=(c,o)=>{const M=m3(),g=new THREE.Group();const z=14;g.add(at(cyl3(12,100,M.glass,'x'),0,0,z));g.add(edges(at(box3(6,28,28,M.alu),-52,0,z)));g.add(edges(at(box3(6,28,28,M.alu),52,0,z)));
  const cA=at(cyl3(11,1,oilMat(),'x'),0,0,z),cB=at(cyl3(11,1,oilMat(),'x'),0,0,z);g.add(cA,cB);const pis=at(cyl3(11.6,6,M.dark,'x'),0,0,z);g.add(pis);const rod=at(cyl3(3.5,106,M.steel,'x'),0,0,z);g.add(rod);
  const arm=at(cyl3(1.6,40,M.steel,'x'),0,0,z);g.add(arm);const w=new THREE.Group();w.position.set(125.5,0,z);const tire=cyl3(16,10,M.black,'x');w.add(tire);w.add(at(cyl3(8,11,M.alu,'x'),0,0,0));g.add(w);
  g.add(at(cyl3(3.5,10,M.steel),-38,-16,z));g.add(at(cyl3(3.5,10,M.steel),38,-16,z));
  return {g,upd(cs){const x=clamp(cs?cs.x:.5,0,1),xp=-44+88*x;pis.position.x=xp;rod.position.x=xp;const la=Math.max(xp-3+50,.5),lb=Math.max(50-xp-3,.5);
    cA.scale.x=la;cA.position.x=-50+la/2;cB.scale.x=lb;cB.position.x=50-lb/2;setOil(cA.material,cs?cs.uA:0);setOil(cB.material,cs?cs.uB:0);
    const L=113-(xp+53);arm.scale.x=Math.max(L,1)/40;arm.position.x=xp+53+L/2;w.rotation.z=-(cs?cs.d:0)*PI/180;}};};

/* ---------- physics: one quasi-static solve ---------- */
const ENG53={run:['פועל',1],idle:['סרק',0],off:['כבוי',0]};
function solve53(P,f,nw,uw,endS,endW){
  const As=H.Aann(P.Ds,P.ds),Aw=H.A(P.Dw),Aw2=H.Aann(P.Dw,P.dw);const ef=P.eng==='run'?1:P.eng==='idle'?P.idle:0;const Qp=P.Q*ef;
  const ps=H.p(P.Fs,As),Qd=P.Vs*Math.abs(nw)/1000,Tm=p=>p*P.Vs/(20*PI),leak=f==='meter'?P.Cl:0;
  let CF=0,Qc=0,pLS=0,pCF=0,T=0,def=0,man=false,stall=false,vac=false,relS=false,turn=nw!==0&&!endS,need=0;
  if(Qp>0){need=(nw?Qd:0)+P.qdyn;CF=Math.min(Qp,need,f==='prio'?2:1e9);
    if(nw&&endS){pLS=P.prS;relS=true;T=Math.min(P.Tmax,Tm(P.prS));}
    else if(nw){pLS=ps;if(pLS>P.prS){pLS=P.prS;relS=true;turn=false;}const sup=Math.max(0,CF-P.qdyn);
      Qc=relS?0:Math.max(0,Math.min(Qd,sup)-leak*pLS);def=Qd>0?clamp(1-sup/Qd,0,1):0;T=1.5+def*Tm(pLS+3);if(relS)T=P.Tmax;}
    pCF=pLS+P.dpc*(need>0?Math.min(1,CF/need)**2:1);}
  else{man=true;if(nw){pLS=ps;const Tn=Tm(ps+3);
      if(endS){T=P.Tmax;stall=true;turn=false;}
      else if(f==='check'){Qc=Qd*.15;vac=true;T=2+Tn*.15;}
      else if(Tn>P.Tmax){Qc=0;stall=true;turn=false;T=P.Tmax;}
      else{Qc=Math.max(0,Qd-leak*ps);T=Tn;}}}
  const EF=Math.max(0,Qp-CF);let pW=Qp>0?4:0,Qw=0,Qrv=0;
  if(uw!==0&&Qp>0){if(endW){pW=P.prM;Qrv=EF;}else{pW=uw>0?H.p(P.Fw,Aw):8;Qw=EF*Math.abs(uw);}}
  let pP=Qp>0?Math.min(P.prM,Math.max(pCF,pW+1)):0;
  return {As,Aw,Aw2,Qp,ps,Qd,CF,EF,Qc,pLS,pCF,pW,pP,Qw,Qrv,T,Tn:Tm(ps+3),def,man,stall,vac,relS,turn,need,
    vS:H.v(Qc,As),vW:Qw>0?H.v(Qw,uw>0?Aw:Aw2):0,N:As*P.S/1000/P.Vs,rim:T/(P.rim/1000)};}

const SIM_STEER={id:'steer',n:53,t:'היגוי הידרוסטטי עם שסתום עדיפות הידראולי',d:'מסובבים את ההגה בזמן שהזרוע עובדת: יחידת המדידה, שסתום העדיפות, והיגוי חירום כשהמנוע כבוי',
  P:{eng:'run',auto:true,nw:60,wauto:true,uw:0,Tmax:70,Q:25,idle:.3,Vs:80,Ds:50,ds:28,S:200,Fs:6000,dpc:7,qdyn:.6,prS:150,prM:190,Dw:63,dw:35,Sw:400,Fw:25000,Cl:.04,rim:190},
  key:P=>'s',
  ui(U,P){U.grp('נהיגה');U.seg(P,'eng','מנוע',[['run','פועל'],['idle','סרק'],['off','כבוי']]);U.chk(P,'auto','הגה אוטומטי (סלאלום)');U.num(P,'nw','סיבוב הגה (+ ימינה)','rpm',{min:-150,max:150,step:10});
    U.num(P,'Tmax','מומנט מרבי של הנהג','N·m',{min:20,max:150,step:5});
    U.grp('הידראוליקת עבודה',false);U.chk(P,'wauto','מחזור זרוע אוטומטי');U.num(P,'uw','ידית זרוע (+ הרמה)','−1…1',{min:-1,max:1,step:.25});U.num(P,'Fw','עומס זרוע','N',{min:0,max:80000,step:1000});
    U.grp('נתונים',false);U.num(P,'Q','ספיקת משאבה (מנוע מלא)','L/min',{min:5,max:120,step:1});U.num(P,'Vs','נפח יחידת מדידה','cm³/rev',{min:40,max:400,step:5});U.num(P,'Fs','כוח היגוי בצילינדר','N',{min:0,max:30000,step:500});
    U.num(P,'Ds','קוטר צילינדר היגוי','mm',{min:30,max:100,step:1});U.num(P,'ds','קוטר מוט בוכנה','mm',{min:16,max:60,step:1});U.num(P,'S','מהלך היגוי','mm',{min:100,max:400,step:10});
    U.num(P,'dpc','קפיץ שסתום עדיפות הידראולי','bar',{min:3,max:15,step:1});U.num(P,'prS','שסתום פריקה להיגוי','bar',{min:50,max:250,step:5});U.num(P,'prM','שסתום פריקה ראשי','bar',{min:80,max:300,step:5});},
  circuit:P=>({comps:[
      {id:'SC',type:'cyl2',x:200,y:60,name:'צילינדר היגוי דו-מוטי + גלגל מוגה',lbl:'צילינדר היגוי',lblAt:[-60,-30]},
      {id:'SU',type:'scu',x:200,y:190,name:'יחידת היגוי (Orbitrol): שסתום סיבובי + מנוע מדידה + הגה',lbl:'יחידת היגוי',lblAt:[60,-36]},
      {id:'PR',type:'prio',x:320,y:300,name:'שסתום עדיפות (Priority valve)',lbl:'שסתום עדיפות',lblAt:[76,4]},
      {id:'P1',type:'pump',x:320,y:400,name:'משאבה קבועה – מונעת ע"י מנוע הטרקטור',lbl:'משאבה',lblAt:[50,30]},{id:'T1',type:'tank',x:320,y:432,name:'מיכל'},
      {id:'RV',type:'pv',x:386,y:350,rot:90,o:{kind:'relief'},name:'שסתום פריקה ראשי',lbl:'פריקה ראשי',lblAt:[0,30]},{id:'T2',type:'tank',x:420,y:362,name:'מיכל'},
      {id:'T3',type:'tank',x:168,y:238,name:'מיכל'},{id:'T4',type:'tank',x:530,y:242,name:'מיכל'},
      {id:'V1',type:'dcv',x:480,y:200,o:{box:KIT.D43.tandem,L:'lever',center:true},name:'שסתום ידית לזרוע (מרכז טנדם)',lbl:'ידית זרוע',lblAt:[100,4]},
      {id:'WC',type:'cyl',x:480,y:70,o:{load:{t:'⛏'}},name:'צילינדר הרמת זרוע',lbl:'זרוע',lblAt:[-82,-22]},
      {id:'G1',type:'gauge',x:282,y:352,net:'P',name:'מד לחץ משאבה'},{id:'G2',type:'gauge',x:236,y:232,net:'LS',name:'מד לחץ LS (לחץ ההיגוי)'},{id:'G3',type:'gauge',x:450,y:118,net:'W',name:'מד לחץ זרוע'},
      {id:'CH',type:'chart',x:700,y:110,o:{w:200,h:120,xl:'זמן',yl:'°',t:'זווית גלגלים: לפי ההגה (כתום) · בפועל (כחול)'},name:'גרף זווית מבוקשת מול בפועל'},
      {id:'CQ',type:'chart',x:700,y:300,o:{w:200,h:110,xl:'זמן',yl:'L/min',t:'משאבה (אפור) · CF להיגוי (ירוק) · EF לעבודה (כתום)'},name:'גרף חלוקת ספיקה'}],
    lines:[{id:'LSU',net:'S',pts:['T1.t','P1.in']},{id:'LP',net:'P',pts:['P1.out',[320,350],'PR.P']},{id:'LRV',net:'P',pts:[[320,350],'RV.P']},{id:'LRT',net:'T',pts:['RV.T',[420,350],'T2.t']},
      {id:'LG1',net:'P',pts:[[320,364],'G1.p'],nodot:true},
      {id:'LCF',net:'CF',pts:['PR.CF',[313,256],[200,256],'SU.P'],tag:{at:[262,266],t:'CF'}},{id:'LLS',net:'LS',kind:'pilot',pts:['SU.LS',[211,244],[256,244],[256,306],'PR.LS']},{id:'LG2',net:'LS',kind:'pilot',pts:[[236,244],'G2.p'],nodot:true},
      {id:'LL',net:'L',pts:['SU.L',[192,110],[162,110],'SC.A']},{id:'LR',net:'R',pts:['SU.R',[208,110],[238,110],'SC.B']},{id:'LT3',net:'T',pts:['SU.T',[189,226],[168,226],'T3.t']},
      {id:'LEF',net:'EF',pts:['PR.EF',[327,256],[473,256],'V1.P'],tag:{at:[400,266],t:'EF'}},{id:'LVT',net:'T',pts:['V1.T',[487,236],[530,236],'T4.t']},
      {id:'LWA',net:'W',pts:['V1.A',[473,130],[430,130],'WC.A']},{id:'LG3',net:'W',pts:[[450,130],'G3.p'],nodot:true},{id:'LWB',net:'WB',pts:['V1.B',[487,130],[530,130],'WC.B']}]}),
  init:()=>({t:0,x:0,xc:0,xw:0,th:0,si:1,wi:1,side:0,h:[],ang:0}),
  step(P,st,dt,ctx){const f=ctx.fault;st.t+=dt;
    if(P.auto)P.nw=Math.round(60*Math.cos(2*PI*st.t/8));
    if(P.wauto){const ph=st.t%10;P.uw=ph<1?0:ph<6?1:ph<7?0:ph<10?-1:0;}
    const nw=P.nw,uw=P.uw,h=P.S/2;const endS=(nw>0&&st.x<=-h+.3)||(nw<0&&st.x>=h-.3);const endW=(uw>0&&st.xw>=P.Sw-.5)||(uw<0&&st.xw<=.5);
    const r=solve53(P,f,nw,uw,endS,endW);const s=Math.sign(nw);
    st.x=clamp(st.x-s*r.vS*dt,-h,h);if(r.turn){st.xc=clamp(st.xc-s*H.v(r.Qd,r.As)*dt,-h,h);st.th+=nw*6*dt;}if(s)st.side=s;
    st.xw=clamp(st.xw+Math.sign(uw)*r.vW*dt,0,P.Sw);KIT.ease(st,'si',s<0?0:s>0?2:1,dt);KIT.ease(st,'wi',uw>0?0:uw<0?2:1,dt);KIT.rpmAng(st,dt,r.Qp>0?1500*(r.Qp/P.Q):0);
    const d=-40*st.x/h,dc=-40*st.xc/h;
    if(!st.h.length||st.t-st.h.at(-1)[0]>.1){st.h.push([st.t,dc,d,r.Qp,r.CF,Math.max(0,r.EF-r.Qrv)]);if(st.h.length>160)st.h.shift();}
    const pm=KIT.nice(P.prM*1.05),t0=st.h[0][0],tx=[t0,Math.max(t0+12,st.t)];
    const held=r.ps*.9,pR=nw>0?r.pLS+(r.man?3:1):nw<0?.5:(st.side>0?held:.5),pL=nw<0?r.pLS+(r.man?3:1):nw>0?.5:(st.side<0?held:.5);
    const pLv=r.vac&&nw<0?-.7:pL,pRv=r.vac&&nw>0?-.7:pR;const Aw=r.Aw,Aw2=r.Aw2;
    const ret=uw>0?r.Qw*Aw2/Aw:uw<0?r.Qw*Aw/Aw2:0;const qLR=s*r.Qc;
    return {p:{S:-.05,P:r.pP,CF:r.man?(r.vac?-.7:0):r.pCF,LS:r.pLS,L:pLv,R:pRv,T:.5,EF:r.Qp>0?(r.Qrv>0?r.pP:r.pW):0,W:uw>0?(r.Qp>0?r.pW:0):(uw<0?2:H.p(P.Fw,Aw)),WB:uw<0&&r.Qp>0?r.pW:.5},
      q:{LSU:r.Qp,LP:r.Qp-r.Qrv,LRV:r.Qrv,LRT:r.Qrv,LG1:0,LCF:r.man?0:r.CF,LLS:r.man?0:-P.qdyn,LG2:0,LL:-qLR,LR:qLR,LT3:r.man?0:r.Qc+P.qdyn,
        LEF:r.EF-r.Qrv,LVT:r.EF-r.Qrv-r.Qw+ret,LWA:uw>0?r.Qw:-ret,LG3:0,LWB:uw<0?r.Qw:-ret},
      pmax:pm,qref:P.Q,vac:r.vac,r,d,dc,nw,uw,
      c:{SC:{x:(st.x+h)/P.S,uA:pLv/pm,uB:pRv/pm,d},SU:{i:st.si,th:st.th},PR:{u:r.Qp>0?r.EF/r.Qp:0},P1:{on:r.Qp>0,ang:st.ang},V1:{i:st.wi},
        WC:{x:st.xw/P.Sw,uA:(uw>0?r.pW:H.p(P.Fw,Aw)*.9)/pm,uB:(uw<0?r.pW:.5)/pm},
        CH:{s:[{p:st.h.map(a=>[a[0],a[1]]),c:'#ea580c',d:true},{p:st.h.map(a=>[a[0],a[2]]),c:'#0b72d9'}],x:tx,y:[-45,45]},
        CQ:{s:[{p:st.h.map(a=>[a[0],a[3]]),c:'#64748b',d:true},{p:st.h.map(a=>[a[0],a[4]]),c:'#16a34a'},{p:st.h.map(a=>[a[0],a[5]]),c:'#ea580c'}],x:tx,y:[0,KIT.nice(P.Q*1.05)]}},
      read:[{k:'סיבוב הגה',v:nw,u:'rpm'},{k:'זווית גלגלים',v:d,u:'°'},{k:'ספיקת משאבה',v:r.Qp,u:'L/min',max:P.Q},{k:'CF להיגוי',v:r.CF,u:'L/min'},{k:'EF לעבודה',v:r.EF,u:'L/min'},
        {k:'לחץ היגוי (LS)',v:r.pLS,u:'bar',max:P.prS,w:r.relS},{k:'לחץ משאבה',v:r.pP,u:'bar',max:P.prM,w:r.Qrv>0},{k:'מומנט בהגה',v:r.T,u:'N·m',max:P.Tmax,w:r.T>P.Tmax*.9},
        {k:'פיגור גלגלים',v:Math.abs(st.xc-st.x)*r.As/1000/P.Vs,u:'rev',w:Math.abs(st.xc-st.x)>10}]};},
  ins(P,R){const r=R.r,L=[];
    if(!r.man){L.push({ic:'🎯',at:'SU',h:`ההגה לא מחובר מכנית לגלגלים: הוא מסובב את יחידת המדידה, וכל סיבוב שולח ${fmt(P.Vs,0)} cm³ לצילינדר – <b>${fmt(r.N,1)} סיבובים</b> מנעילה לנעילה.`});
      L.push({ic:'🥇',at:'PR',h:`שסתום העדיפות נותן להיגוי קודם: CF = ${fmt(r.CF,1)} L/min (כולל ${fmt(P.qdyn,1)} זרימת LS דינמית), והשאר – EF = ${fmt(r.EF,1)} L/min – הולך לזרוע.`});
      if(r.Qrv>0)L.push({ic:'🛡',at:'RV',w:true,h:`הזרוע בסוף מהלך והמשאבה בשסתום הפריקה ${fmt(P.prM,0)} bar – וההיגוי ממשיך כרגיל, כי שסתום העדיפות מחנק את ה-EF ולא את ה-CF.`,c:'ההיגוי לא נפגע'});
      if(r.def>.02&&R.nw)L.push({ic:'🐢',at:'CH',w:true,h:`ההגה דורש ${fmt(r.Qd+P.qdyn,1)} L/min אבל יש רק ${fmt(r.CF,1)}: הגלגלים מפגרים אחרי ההגה וההגה כבד (${fmt(r.T,0)} N·m).`,c:'חסרה ספיקה'});
      if(r.relS)L.push({ic:'🧱',at:'SU',w:true,h:`הגלגלים בנעילה: שסתום הפריקה של ההיגוי (${fmt(P.prS,0)} bar) מגביל את לחץ ה-LS וההגה נעצר.`});}
    else{if(r.vac)L.push({ic:'🫧',at:'SU',w:true,h:'המנוע כבוי ואל-חוזר היניקה לא נפתח: יחידת המדידה לא מצליחה לשאוב שמן מקו T – קוויטציה, ההגה קל אבל הגלגלים כמעט לא זזים.',c:'קוויטציה'});
      else if(r.stall)L.push({ic:'💪',at:'SU',w:true,h:`היגוי חירום: נדרש ${fmt(r.Tn,0)} N·m (כוח ${fmt(r.Tn/(P.rim/1000),0)} N בחישוק) – יותר ממה שהנהג יכול (${fmt(P.Tmax,0)} N·m). הגלגלים לא זזים.`,c:'כבד מדי'});
      else L.push({ic:'✋',at:'SU',h:`המנוע כבוי: יחידת המדידה הופכת למשאבה ידנית. T = p·Vs/2π = ${fmt(r.Tn,0)} N·m – כבד, אבל אפשר להגות ולעצור בצד.`});}
    return L;},
  calc(P,R){const r=R.r;return `<div class="kpis">${kpi('ספיקה מהגה',fmt(r.Qd,2),'L/min')}${kpi('CF / EF',fmt(r.CF,1)+' / '+fmt(r.EF,1),'L/min')}${kpi('סיבובים נעילה-נעילה',fmt(r.N,2))}${kpi('מומנט חירום',fmt(r.Tn,1),'N·m')}</div>`+
    det('יחידת המדידה',row('',`Q = V_s·n = ${fmt(P.Vs,0)}·${fmt(Math.abs(R.nw),0)}/1000 = ${V(r.Qd,'L/min')}`)+row('',`A = π/4·(D² − d²) = ${V(r.As,'mm²',0)} → v = Q/A = ${V(H.v(r.Qd,r.As),'mm/s')}`)+row('',`N = A·S/V_s = ${fmt(r.As,0)}·${P.S}/1000/${P.Vs} = ${V(r.N,'סיבובים')}`),true)+
    det('שסתום עדיפות הידראולי',row('',`CF = min(Q_p, Q_הגה + q_dyn) = min(${fmt(r.Qp,1)}, ${fmt(r.need,1)}) = ${V(r.CF,'L/min')}`)+row('',`EF = Q_p − CF = ${V(r.EF,'L/min')}`)+row('',`p_CF = p_LS + Δp_קפיץ = ${fmt(r.pLS,1)} + ${P.dpc} → p_pump = max(p_CF, p_זרוע) = ${V(r.pP,'bar')}`))+
    det('היגוי חירום (מנוע כבוי)',row('',`p = F/A + 3 = ${fmt(r.ps,1)} + 3 bar`)+row('',`T = p·V_s/(20π) = ${V(r.Tn,'N·m')} · בחישוק r = ${P.rim} mm: F = ${V(r.Tn/(P.rim/1000),'N',0)}`,r.Tn<=P.Tmax));},
  demo:[{t:'הגה בלי מוט',x:'ההגה מסובב יחידת היגוי: שסתום סיבובי ומנוע מדידה קטן. השמן שעובר דרך המנוע נמדד – וזה מה שמזיז את צילינדר ההיגוי.',reset:true,set:{eng:'run',auto:true,wauto:false,uw:0},hl:['SU','SC'],dur:8},
    {t:'עדיפות להיגוי',x:'משאבה אחת לשתי מערכות. שסתום העדיפות מרגיש את לחץ ה-LS (קו מקווקו) ושולח להיגוי בדיוק מה שהוא צריך. השאר הולך לזרוע.',set:{wauto:true},hl:['PR','CQ'],dur:9},
    {t:'זרוע בשסתום הפריקה',x:'כשהזרוע מגיעה לסוף מהלך, לחץ המשאבה קופץ לשסתום הפריקה הראשי – אבל הקו הירוק בגרף הספיקה לא זז. ההיגוי מוגן.',hl:['RV','CQ'],dur:8},
    {t:'סרק והגה מהיר',x:'בסרק המשאבה נותנת רק 30%. מסובבים מהר: ההגה מבקש יותר שמן ממה שיש, הגלגלים מפגרים (הקו הכחול מאחורי הכתום) וההגה מתקשה.',set:{eng:'idle',auto:false,nw:120,wauto:false,uw:0},hl:['CH'],dur:6},
    {t:'מנוע כבוי',x:'בלי משאבה, יחידת המדידה עובדת כמשאבה ידנית ושואבת שמן דרך אל-חוזר יניקה. כבד – אבל אפשר להגות עד שעוצרים בבטחה.',set:{eng:'off',nw:-30},hl:['SU'],dur:7}],
  predict:[{q:'המנוע בסרק (30% ספיקה). מסובבים את ההגה ב-120 rpm. מה יקרה?',set:{eng:'idle',auto:false,nw:120,wauto:false,uw:0},opts:['הגלגלים יסתובבו כרגיל','הגלגלים יפגרו וההגה יהיה כבד','ההיגוי ייעצר לגמרי'],a:1,why:'הדרישה 80·120/1000 = 9.6 L/min + 0.6 גדולה מ-7.5 L/min שיש בסרק. מה שיש עובר להיגוי, אבל לא מספיק.'},
    {q:'הזרוע מגיעה לסוף מהלך והמשאבה בשסתום הפריקה. ההיגוי –',set:{eng:'run',auto:true,wauto:false,uw:1},opts:['נעצר','ממשיך כרגיל','מאט לחצי'],a:1,why:'שסתום העדיפות שומר Δp על יחידת ההיגוי ומחנק את ה-EF. הספיקה להיגוי לא תלויה בלחץ הזרוע.'},
    {q:'המנוע כבה בנסיעה. אפשר עדיין להגות?',set:{eng:'off',auto:true,wauto:false,uw:0},opts:['לא – אין לחץ','כן – ההגה עצמו הופך למשאבה ידנית'],a:1,why:'מנוע המדידה (גרוטור) שואב שמן דרך אל-חוזר יניקה ודוחף אותו לצילינדר. המומנט T = p·Vs/2π.'}],
  tasks:[{q:P=>`צילינדר היגוי דו-מוטי ${P.Ds}/${P.ds} mm, מהלך ${P.S} mm, יחידת מדידה ${P.Vs} cm³/rev. כמה סיבובי הגה מנעילה לנעילה?`,a:P=>H.Aann(P.Ds,P.ds)*P.S/1000/P.Vs,u:'סיבובים',hint:'N = A·S/Vs (A בטבעת, mm² → cm³ ÷1000).',rand:P=>{P.Vs=pick([63,80,100,125]);P.Ds=pick([40,50,63]);P.ds=pick([22,25,28]);P.S=rnd(160,260,20);}},
    {q:P=>`יחידת מדידה ${P.Vs} cm³/rev, מסובבים את ההגה ב-${Math.abs(P.nw)} rpm. כמה שמן נדרש?`,a:P=>P.Vs*Math.abs(P.nw)/1000,u:'L/min',hint:'Q = Vs·n.',set:{auto:false},rand:P=>{P.Vs=pick([63,80,100,125,160]);P.nw=rnd(30,120,10);}},
    {q:P=>`מנוע כבוי. כוח היגוי ${fmt(P.Fs,0)} N בצילינדר ${P.Ds}/${P.ds}, Vs = ${P.Vs} cm³/rev, +3 bar הפסדים. מה המומנט בהגה?`,a:P=>(H.p(P.Fs,H.Aann(P.Ds,P.ds))+3)*P.Vs/(20*PI),u:'N·m',hint:'p = F/A + 3 ; T = p·Vs/(20π) (bar·cm³ → N·m).',rand:P=>{P.Fs=rnd(2000,10000,500);P.Vs=pick([63,80,100]);}}],
  faults:[{id:'prio',t:'שסתום העדיפות תקוע לכיוון EF',sym:'"ההגה כבד ואיטי בסרק, והגלגלים לא עונים כשמסובבים מהר."',hint:'השוו את CF לספיקה שההגה מבקש.',why:'הספול (מגופה) לא פותח מספיק ל-CF: ההיגוי מקבל כ-2 L/min בלבד והשאר בורח ל-EF.',set:{eng:'idle',auto:true,wauto:false,uw:0}},
    {id:'meter',t:'יחידת המדידה שחוקה (דליפה פנימית)',sym:'"צריך לסובב יותר את ההגה, ומיקום ההגה לא תואם את הגלגלים."',hint:'השוו את הזווית לפי ההגה לזווית בפועל בגרף.',why:'דליפה בגרוטור תלויה בלחץ: חלק מהשמן שנמדד לא מגיע לצילינדר – "החלקת הגה".',set:{eng:'run',auto:true,wauto:false,uw:0}},
    {id:'check',t:'אל-חוזר היניקה ביחידת ההיגוי תקוע',sym:'"כשהמנוע כבה – ההגה מסתובב בקלות אבל הגלגלים לא זזים."',hint:'כבו את המנוע ובדקו את הלחץ בקו P של יחידת ההיגוי.',why:'בלי אל-חוזר היניקה מנוע המדידה לא יכול לשאוב שמן מקו T: קוויטציה ואין היגוי חירום.',set:{eng:'off',auto:true,wauto:false,uw:0}}],
  qaT:10,
  test(H){const P=clone(this.P);P.auto=false;P.wauto=false;const r=solve53(P,null,60,0,false,false);const As=H.Aann(50,28);
    const rw=solve53(P,null,60,1,false,true);const Pi=clone(P);Pi.eng='idle';const ri=solve53(Pi,null,120,0,false,false);const Po=clone(P);Po.eng='off';const ro=solve53(Po,null,30,0,false,false);
    return [['Q = Vs·n',r.Qc,4.8],['סיבובים נעילה-נעילה',r.N,As*200/1000/80],['CF = Q_הגה + q_dyn',r.CF,5.4],['EF = Qp − CF',r.EF,19.6],['עדיפות: CF לא משתנה כשהזרוע בשסתום הפריקה',rw.CF,5.4],
      ['לחץ משאבה = שסתום פריקה ראשי',rw.pP,190],['סרק: Qc = Qp − q_dyn',ri.Qc,7.5-.6],['חירום: T = p·Vs/2π',ro.T,(H.p(6000,As)+3)*80/(20*PI)],['חירום: ספיקה = Vs·n',ro.Qc,2.4]];}};

LABS.push({ch:19,title:'היגוי הידרוסטטי',sims:[SIM_STEER]});
}
