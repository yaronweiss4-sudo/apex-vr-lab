/* lab 7 – same code as the website */
{




/* ===================== Chapter 7 part A – check valves, DCV spools, two-stage DCV, direct relief (sims 21–24) ===================== */
/* ---------- shared symbols / helpers (prefix A7_ / a7_) ---------- */
const A7_R=(g,x,y,w,h,fill,cls='sy thin')=>{const r=SR(g,x,y,w,h,cls);if(fill)r.style.fill=fill;return r;};
const A7_MET='#dfe5ec';
/* pressure source (ISO: circle + filled triangle), one port on top */
SYM.a7_src={ports:o=>({o:[0,-17]}),bb:o=>[-15,-17,15,15],draw(g,o){SC(g,0,0,13,'syb');SP(g,'M0,-13 L-6,-3 L6,-3Z','syf');SL(g,0,-13,0,-17);adjArrow(g,-11,9,11,-11);if(o.t)ST(g,0,10,o.t,'st s');}};
B3.a7_src=(c,o)=>{const M=m3(),g=new THREE.Group();g.add(edges(at(cyl3(13,22,M.blue,'z'),0,0,12)));g.add(at(cyl3(4,8,M.steel),0,16,12));return {g};};
/* dashed assembly frame */
SYM.a7_frame={ports:o=>({}),bb:o=>[-o.w/2,-o.h/2,o.w/2,o.h/2],draw(g,o){SR(g,-o.w/2,-o.h/2,o.w,o.h,'sy dash thin');if(o.t)ST(g,0,-o.h/2+10,o.t,'st s');}};
/* small live x–y chart: o={w,h,t,xl,yl,col[],dash[],sw[]}; cs={xm,ym,L:[[[x,y],..],..],dot:[x,y]} */
SYM.a7_chart={ports:o=>({}),bb:o=>[-30,-16,o.w+6,o.h+24],
  draw(g,o){A7_R(g,0,0,o.w,o.h,'#fff','syb');ST(g,o.w/2,-5,o.t||'','st b');ST(g,o.w/2,o.h+21,o.xl||'','st s');const yl=ST(g,-24,o.h/2,o.yl||'','st s');yl.setAttribute('transform',`rotate(-90 -24 ${o.h/2})`);
    for(let k=1;k<4;k++){SL(g,o.w*k/4,0,o.w*k/4,o.h,'sy thin').style.opacity=.15;SL(g,0,o.h*k/4,o.w,o.h*k/4,'sy thin').style.opacity=.15;}
    const tx=[0,1,2].map(k=>ST(g,o.w*k/2,o.h+10,'','st s')),ty=[0,1,2].map(k=>ST(g,-10,o.h-o.h*k/2+3,'','st s'));
    const cols=o.col||['#0b72d9'];const ps=cols.map((c,k)=>{const p=SP(g,'','sy');p.style.stroke=c;p.style.strokeWidth=(o.sw&&o.sw[k])||1.8;if(o.dash&&o.dash[k])p.style.strokeDasharray=o.dash[k];return p;});
    const dot=SC(g,0,0,3.8,'syf');dot.style.fill='#dc2626';
    return cs=>{if(!cs)return;const x0=cs.x0||0,y0=cs.y0||0,X=x=>clamp((x-x0)/cs.xm,0,1.02)*o.w,Y=y=>o.h-clamp((y-y0)/cs.ym,0,1.06)*o.h;
      tx.forEach((t,k)=>t.textContent=fmt(x0+cs.xm*k/2,cs.xd??0));ty.forEach((t,k)=>t.textContent=fmt(y0+cs.ym*k/2,cs.yd??0));
      ps.forEach((p,k)=>{const L=cs.L[k];p.setAttribute('d',L&&L.length>1?'M'+L.map(q=>X(q[0]).toFixed(1)+','+Y(q[1]).toFixed(1)).join(' L'):'');});
      if(cs.dot){dot.style.display='';dot.setAttribute('cx',X(cs.dot[0]));dot.setAttribute('cy',Y(cs.dot[1]));}else dot.style.display='none';};}};
/* auto sequence a → 0 → b → 0 (user change of P.pos switches auto off) */
function A7_seq(P,st,dt,atEnd,hold=1.2){if(st.cp!=null&&P.pos!==st.cp)P.auto=false;if(!P.auto){st.cp=P.pos;return;}
  const ord=['a','0','b','0'];if(st.sq==null||ord[st.sq]!==P.pos)st.sq=Math.max(0,ord.indexOf(P.pos));
  if(P.pos!=='0'){st.dw=atEnd?(st.dw||0)+dt:0;if(st.dw>.5){st.sq=(st.sq+1)%4;P.pos=ord[st.sq];st.dw=0;}}
  else{st.dw=(st.dw||0)+dt;if(st.dw>hold){st.sq=(st.sq+1)%4;P.pos=ord[st.sq];st.dw=0;}}st.cp=P.pos;}

/* ---------- 21 · check valve, pilot-operated check, dual POCV ---------- */
/* cut-away of a (pilot operated) poppet check: X | pilot piston | Y | chamber 1 | seat | chamber 2 + spring. cs={L lift 0..1,d pilot travel px,u1,u2,uX} */
SYM.a7_cut={ports:o=>({}),bb:o=>[-104,-44,104,54].map(v=>v*(o.s||1)),
  draw(g0,o){const pil=!!o.pilot;const g=sv('g',{transform:`scale(${o.s||1})`},g0);A7_R(g,-100,-30,200,60,A7_MET,'syb');
    const fl=(x,y,w,h)=>A7_R(g,x,y,w,h,'#93c5fd','sy thin');
    const c1=[fl(-40,-11,22,22),fl(-34,11,10,19),fl(-18,-5,6,10)],c2=[fl(-12,-14,74,28),fl(20,-30,10,16)];
    let cX=[],cY=[],pis=null,pin=null;
    if(pil){cX=[fl(-92,-14,30,28),fl(-84,14,8,16)];cY=[fl(-58,-14,12,28),fl(-55,-30,6,16)];pis=A7_R(g,-66,-14,8,28,'#475569','syf2');pin=A7_R(g,-58,-1.6,36,3.2,'#cbd5e1','sy thin');
      ST(g,-80,42,'X','st b');ST(g,-52,-34,'Y','st s');}
    const sp=SP(g,'','sy thin');const pop=sv('g',{},g);SP(pop,'M-17,0 L-6,-10 L6,-10 L6,10 L-6,10 Z','syf2');
    ST(g,-29,42,'1','st b');ST(g,25,-34,'2','st b');ST(g,48,48,o.t||'חתך','st s');
    return cs=>{cs=cs||{};const L=clamp(cs.L||0,0,1)*8,d=cs.d||0;pop.setAttribute('transform',`translate(${L},0)`);sp.setAttribute('d',zig(6+L,0,62,0,6,7));
      c1.forEach(r=>r.style.fill=pCss(cs.u1||0));c2.forEach(r=>r.style.fill=pCss(cs.u2||0));
      if(pil){cX.forEach(r=>r.style.fill=pCss(cs.uX||0));cY.forEach(r=>r.style.fill=pCss(0));pis.setAttribute('x',-66+d);pin.setAttribute('x',-58+d);}};}};
const A7_kV=8,A7_kL=4.2,A7_kLk=.07,A7_RES=1/A7_kV**2+2/A7_kL**2;
function A7_bench(P,st,dt,f){const pil=P.type==='pocv';st.t=(st.t||0)+dt;const on=!P.auto||(st.t%4)>=2;
  KIT.ease(st,'px',pil&&on?P.pX:0,dt,6);const pXs=st.px,pXv=f==='pilot'?0:pXs,phi=f==='ratio'?P.phi*.75:P.phi;
  const d=P.p1-P.p2,need=(P.p2-P.p1+P.pc)/P.phi;let Q=0,mode='closed',L=0;
  const held=pil&&pXv>.3&&pXv*phi>=P.p2-P.p1+P.pc;
  if(held){Q=Math.sign(d)*Math.sqrt(Math.abs(d)/A7_RES);mode=d<0?'rev':'pushed';L=1;}
  else if(d>P.pc){Q=Math.sqrt((d-P.pc)/A7_RES);mode='fwd';L=clamp(Q/15,.15,1);}
  else if(f==='seat'&&d!==0){Q=Math.sign(d)*A7_kLk*Math.sqrt(Math.abs(d));mode='leak';}
  const g1=P.p1-H.orDp(A7_kL,Q),g2=P.p2+H.orDp(A7_kL,Q);const dpx=pil?(held?5+8*L:clamp(pXv/1.5,0,1)*5):0;
  const pm=Math.ceil(Math.max(P.p1,P.p2,pil?P.pX:0,10)*1.15/10)*10;const r=[{k:'מד בצד 1 – p₁',v:g1,u:'bar'},{k:'מד בצד 2 – p₂',v:g2,u:'bar'}];
  if(pil)r.push({k:'פיקוד ליד השסתום p_X',v:pXv,u:'bar'});r.push({k:'ספיקה 1→2',v:Q,u:'L/min',max:30,dg:2});
  if(pil)r.push({k:'פיקוד נדרש',v:Math.max(need,0),u:'bar',w:pXv<need});r.push({k:'הרמת הפופט',v:L*100,u:'%',max:100,dg:0});
  return {bench:true,mode,Q,g1,g2,pXv,pXs,need,held,L,pil,p:{n1:g1,n2:g2,nX:pXv,nXs:pXs},q:{L1:Q,L1b:Q,L2:Q},pmax:pm,qref:20,
    c:{CV:{open:L},GX:{p:pXv},CUT:{L,d:dpx,u1:g1/pm,u2:g2/pm,uX:pXv/pm}},read:r};}
function A7_dual(P,st,dt,f){const A1=H.A(P.D),A2=H.Aann(P.D,Math.min(P.dr,P.D-4)),S=250,phi=f==='ratio'?P.phi*.75:P.phi,kD=P.Q/Math.sqrt(3),F=P.F,hold=10*F/A1,a=A2/A1;
  const dir0=KIT.dirOf(P.pos);const atEnd0=(dir0>0&&st.x>=S-1e-6)||(dir0<0&&st.x<=1e-6);A7_seq(P,st,dt,atEnd0);
  const dir=KIT.dirOf(P.pos);const atEnd=(dir>0&&st.x>=S-1e-6)||(dir<0&&st.x<=1e-6);
  let ps=P.pr,pA1=0,pB1=0,pAc=st.x>0?hold:0,pBc=0,v=0,qA=0,qB=0,Qr=P.Q,oA=0,oB=0,stall=false,pPil=null,lock=false;
  if(dir>0){const r=H.lin({Qp:P.Q,pr:P.pr,Ain:A1,Aout:A2,F:atEnd?1e9:F+P.pc*A1/10,kIn:kD,kOut:kD/Math.SQRT2});
    ps=r.ps;pA1=r.stall?r.ps:r.pIn;pAc=Math.max(pA1-P.pc,0);pBc=r.pOut;pB1=r.pOut/2;v=r.v;qA=r.Qin;qB=-r.Qout;Qr=r.Qr;oA=r.stall?0:1;oB=1;stall=r.stall;}
  else if(dir<0){const vR=H.v(P.Q,A2),Qa=P.Q/a,pA1v=(Qa/kD)**2,den=phi-a;
    pPil=den>0?(hold+P.pc*(1-a)-pA1v)/den:Infinity;const pMove=P.pc+(pA1v*A1-10*F)/A2;pB1=Math.max(pPil,pMove,P.pc+.2);const psN=pB1+(P.Q/kD)**2;
    if(f==='pilot'||!isFinite(pPil)||psN>P.pr||atEnd){stall=true;ps=P.pr;pB1=P.pr;pBc=atEnd?P.pr:P.pr-P.pc;lock=!atEnd;pAc=atEnd?0:hold+pBc*a;oB=0;}
    else{ps=psN;pBc=pB1-P.pc;pAc=(10*F+pBc*A2)/A1;pA1=pA1v;v=-vR;qB=P.Q;qA=-Qa;Qr=0;oA=1;oB=1;}}
  else if(f==='seat'&&st.x>0){const Qd=A7_kLk*.4*Math.sqrt(hold);v=-H.v(Qd,A1);qA=-Qd;oA=.12;}
  st.x=clamp(st.x+v*dt,0,S);KIT.ease(st,'si',KIT.idx[P.pos],dt);KIT.rpmAng(st,dt,1450);
  const pm=P.pr;const pT=Math.min(1,Math.abs(qA)/20);
  return {dual:true,A1,A2,a,hold,ps,pA1,pB1,pAc,pBc,v,stall,lock,pPil,phi,dir,S,
    p:{P:ps,A1:pA1,B1:pB1,CA:pAc,CB:pBc,T:pT,S:-.05},q:{LS:P.Q,LP:P.Q-Qr,LRV:Qr,LRT:Qr,LA1:qA,LCA:qA,LB1:qB,LCB:qB,LT:Math.abs(qA)+Math.abs(dir>0?qB:0)},pmax:pm,qref:P.Q,
    c:{C1:{x:st.x/S,uA:pAc/pm,uB:pBc/pm,lt:`F ${fmt(F/1000,1)} kN`},V1:{i:st.si},P1:{on:true,ang:st.ang},RV:{open:clamp(Qr/P.Q,0,1)},CA:{open:oA},CB:{open:oB}},
    read:[{k:'לחץ משאבה',v:ps,u:'bar'},{k:'קו A (פיקוד ל-B)',v:pA1,u:'bar'},{k:'קו B (פיקוד ל-A)',v:pB1,u:'bar'},{k:'צילינדר צד מלא',v:pAc,u:'bar',w:pAc>P.pr},{k:'צילינדר צד מוט בוכנה',v:pBc,u:'bar'},{k:'מהירות (+ יציאה)',v:v,u:'mm/s',max:H.v(P.Q,A2)},{k:'מיקום',v:st.x,u:'mm',max:S}]};}
const A7_SIM_CHECK={id:'check',n:21,t:'אל-חוזר ומפוקד',d:'לחץ פתיחה, יחס פיקוד ופתיחה בכיוון ההפוך; גם אל-חוזר כפול מפוקד',
  P:{type:'pocv',p1:20,p2:100,pX:25,pc:2,phi:4,auto:true,pos:'a',F:15000,D:63,dr:36,Q:16,pr:160},
  key:P=>P.type,
  ui(U,P){U.grp('סוג השסתום');U.seg(P,'type','סוג',[['plain','רגיל'],['pocv','מפוקד'],['dual','כפול']],true);
    U.num(P,'pc','לחץ פתיחה (קפיץ) p_c','bar',{min:.2,max:10,step:.1});if(P.type!=='plain')U.num(P,'phi','יחס פיקוד φ = A_X/A_s','',{min:1,max:12,step:.5});
    if(P.type!=='dual'){U.grp('לחצים על השסתום');U.num(P,'p1','לחץ מקור בצד 1','bar',{min:0,max:250,step:1});U.num(P,'p2','לחץ מקור בצד 2','bar',{min:0,max:250,step:1});
      if(P.type==='pocv'){U.num(P,'pX','לחץ מקור הפיקוד','bar',{min:0,max:150,step:1});U.chk(P,'auto','פולס פיקוד (2 s כבוי / 2 s פועל)');}
      U.note('צד 1 = כניסה (זרימה חופשית 1→2). מקורות הלחץ מחוברים דרך צנרת עם התנגדות.');}
    else{U.grp('מעגל ועומס');U.num(P,'F','עומס הדוחף את המוט פנימה','N',{min:0,max:60000,step:500});U.num(P,'Q','ספיקת משאבה','L/min',{min:2,max:60,step:1});U.seg(P,'pos','ידית',KIT.pos3);U.chk(P,'auto','מחזור אוטומטי');
      U.grp('צילינדר ושסתום פריקה',false);U.num(P,'D','קוטר בוכנה D','mm',{min:25,max:160,step:1});U.num(P,'dr','קוטר מוט d','mm',{min:12,max:110,step:1});U.num(P,'pr','כיול שסתום פריקה','bar',{min:20,max:350,step:5});}},
  circuit(P){if(P.type==='dual')return {comps:[{id:'FR',type:'a7_frame',x:300,y:158,o:{w:236,h:82,t:'אל-חוזר כפול מפוקד'}},
      {id:'C1',type:'cyl',x:300,y:50,o:{load:{t:'F'}},name:'צילינדר עם עומס שדוחף את המוט פנימה',lbl:'צילינדר',lblAt:[-84,-20],l3:[0,-34]},
      {id:'CA',type:'check',x:240,y:150,o:{pilot:true,spring:true},name:'אל-חוזר A – מחזיק את העומס; נפתח בפיקוד מקו B',lbl:'A',lblAt:[14,-10]},
      {id:'CB',type:'check',x:360,y:150,flip:true,o:{pilot:true,spring:true},name:'אל-חוזר B – נפתח בפיקוד מקו A',lbl:'B',lblAt:[-14,-10]},
      {id:'GCA',type:'gauge',x:214,y:100,net:'CA',name:'מד לחץ – צד מלא של הצילינדר (לחץ ההחזקה)',valAt:[-16,-2],l3:[0,-30]},{id:'GCB',type:'gauge',x:386,y:100,net:'CB',name:'מד לחץ – צד המוט'},
      {id:'V1',type:'dcv',x:300,y:250,o:{box:KIT.D43.float,L:'lever',center:true},name:'שסתום פיקוד 4/3, מרכז צף (A,B→T) – לחיצה מחליפה מצב',lbl:'4/3 צף',lblAt:[88,4]},
      {id:'P1',type:'pump',x:200,y:330,name:'משאבה',lbl:'משאבה',lblAt:[32,6]},{id:'T1',type:'tank',x:200,y:374,name:'מיכל'},
      {id:'RV',type:'pv',x:150,y:290,rot:-90,o:{kind:'relief'},name:'שסתום פריקה',lbl:'פריקה',lblAt:[0,-28]},{id:'T2',type:'tank',x:110,y:320,name:'מיכל'},{id:'T3',type:'tank',x:380,y:314,name:'מיכל'},
      {id:'GP',type:'gauge',x:245,y:278,net:'P',name:'מד לחץ משאבה'}],
     lines:[{id:'LS',net:'S',pts:['T1.t','P1.in']},{id:'LP',net:'P',pts:['P1.out',[200,290],[293,290],'V1.P']},{id:'LRV',net:'P',pts:[[200,290],'RV.P']},{id:'LRT',net:'T',pts:['RV.T',[110,290],'T2.t']},
      {id:'LT',net:'T',pts:['V1.T',[307,290],[380,290],'T3.t']},
      {id:'LA1',net:'A1',pts:['V1.A',[293,205],[240,205],'CA.in']},{id:'LB1',net:'B1',pts:['V1.B',[307,205],[360,205],'CB.in']},
      {id:'LCA',net:'CA',pts:['CA.out',[240,112],[250,112],'C1.A']},{id:'LCB',net:'CB',pts:['CB.out',[360,112],[350,112],'C1.B']},
      {id:'LGA',net:'CA',pts:[[240,112],'GCA.p'],nodot:true},{id:'LGB',net:'CB',pts:[[360,112],'GCB.p'],nodot:true},
      {id:'LXA',net:'B1',kind:'pilot',pts:[[330,205],[330,190],[200,190],[200,150],'CA.X']},{id:'LXB',net:'A1',kind:'pilot',pts:[[270,205],[270,180],[400,180],[400,150],'CB.X']}]};
    const pil=P.type==='pocv';
    return {comps:[{id:'S1',type:'a7_src',x:150,y:310,o:{t:'1'},name:'מקור לחץ מכוון – צד 1',lbl:'מקור 1',lblAt:[-40,4],val:R=>`${fmt(P.p1,0)} bar`,valAt:[18,4]},
      {id:'FM',type:'flowm',x:150,y:252,name:'מד ספיקה (חיובי = 1→2)',val:R=>`${fmt(R.Q,1)} L/min`,valAt:[16,0]},
      {id:'G1',type:'gauge',x:162,y:212,rot:90,net:'n1',name:'מד לחץ בפתח 1',valAt:[18,-2]},
      {id:'CV',type:'check',x:150,y:170,o:{pilot:pil,spring:true},name:pil?'אל-חוזר מפוקד (POCV)':'שסתום אל-חוזר עם קפיץ',lbl:pil?'POCV':'אל-חוזר',lblAt:[40,4],l3:[0,-30]},
      {id:'G2',type:'gauge',x:162,y:110,rot:90,net:'n2',name:'מד לחץ בפתח 2',valAt:[18,-2]},
      {id:'S2',type:'a7_src',x:150,y:40,rot:180,o:{t:'2'},name:'מקור לחץ מכוון – צד 2 (למשל עומס)',lbl:'מקור 2',lblAt:[-42,0],val:R=>`${fmt(P.p2,0)} bar`,valAt:[18,4]},
      ...(pil?[{id:'SX',type:'a7_src',x:60,y:290,o:{t:'X'},name:'מקור לחץ פיקוד',lbl:'פיקוד',lblAt:[-34,4],val:R=>`${fmt(R.pXs,0)} bar`,valAt:[18,4]},
        {id:'GX',type:'gauge',x:100,y:158,net:'nX',name:'מד לחץ פיקוד – בכניסת X של השסתום',valAt:[-14,-16]}]:[]),
      {id:'CUT',type:'a7_cut',x:390,y:172,o:{pilot:pil,s:1.45,t:'חתך השסתום'},name:'חתך: פופט, קפיץ'+(pil?' ובוכנת פיקוד':'')}],
     lines:[{id:'L1',net:'n1',pts:['S1.o','FM.in']},{id:'L1b',net:'n1',pts:['FM.out','CV.in']},{id:'L2',net:'n2',pts:['CV.out','S2.o']},
      ...(pil?[{id:'LX1',net:'nXs',kind:'pilot',nodot:true,pts:['SX.o',[60,170],[80,170]]},{id:'LX2',net:'nX',kind:'pilot',nodot:true,pts:[[80,170],'CV.X']}]:[])]};},
  init:P=>({x:P.type==='dual'?125:0,t:0,px:P.type==='pocv'&&!P.auto?P.pX:0,si:KIT.idx[P.pos]}),
  click(id,P){if(id==='V1'&&P.type==='dual'){P.pos=P.pos==='a'?'0':P.pos==='0'?'b':'a';P.auto=false;return true;}},
  step(P,st,dt,ctx){return P.type==='dual'?A7_dual(P,st,dt,ctx.fault):A7_bench(P,st,dt,ctx.fault);},
  ins(P,R){const L=[];if(R.dual){
      if(R.dir===0)L.push({ic:'🔒',at:'CA',h:`מרכז צף: קווי A ו-B פתוחים למיכל, שני קווי הפיקוד ב-0 ושני האל-חוזרים סגורים. העומס ${fmt(P.F/1000,1)} kN מוחזק בלחץ <b>${fmt(R.pAc,1)} bar</b> בצד המלא – בלי זליגה דרך מרווחי הספול (מגופה).`});
      if(R.dir>0&&!R.stall)L.push({ic:'➡️',h:`יציאה: השמן פותח את A בכיוון החופשי (p_c = ${fmt(P.pc,1)} bar), ולחץ קו A (${fmt(R.pA1,1)} bar) פותח בפיקוד את B כדי לשחרר את צד המוט.`});
      if(R.dir<0&&!R.stall)L.push({ic:'⬇️',h:`חזרה עם עומס מסייע: כדי לפתוח את A צריך בקו B <b>${fmt(R.pB1,1)} bar</b> = (p_hold + p_c(1−A₂/A₁) − p_A)/(φ − A₂/A₁). הלחץ בצד המלא יורד ל-${fmt(R.pAc,1)} bar.`});
      if(R.dir<0&&!R.stall)L.push({ic:'〰️',h:'השסתום "מווסת" כאן: אם העומס בורח, לחץ קו B יורד, A נסגר וחוזר חלילה – תנועה קופצנית. לעומס מכני אינרציאלי משתמשים בשסתום איזון עומס.'});
      if(R.lock)L.push({ic:'⚠️',w:true,at:'GCA',h:`A לא נפתח והמשאבה דוחפת לצד המוט: הלחץ בצד המלא מוכפל – <b>${fmt(R.pAc,0)} bar</b> (יותר מכיול שסתום הפריקה ${fmt(P.pr,0)} bar)! זו הגברת לחץ מסוכנת.`,c:`${fmt(R.pAc,0)} bar בצד המלא – הגברת לחץ`});
      if(R.phi<=R.a)L.push({ic:'⛔',w:true,h:`φ = ${fmt(R.phi,1)} קטן מ-A₂/A₁ = ${fmt(R.a,2)}: אי אפשר לפתוח את A בלחץ קו B בכלל.`});
      L.push({ic:'💡',h:'עם אל-חוזר מפוקד משתמשים במרכז צף (A,B→T) – כדי ששני קווי הפיקוד יתרוקנו והשסתומים ייסגרו מיד.'});return L;}
    if(R.mode==='fwd')L.push({ic:'➡️',at:'CUT',h:`כיוון חופשי: p₁ − p₂ = ${fmt(P.p1-P.p2,1)} bar גדול מלחץ הפתיחה ${fmt(P.pc,1)} bar. הפופט מורם והספיקה ${fmt(R.Q,1)} L/min.`});
    else if(R.mode==='closed'||R.mode==='leak'){if(P.p2>P.p1)L.push({ic:'🔒',at:'CUT',h:`הלחץ בצד 2 (${fmt(P.p2,0)} bar) דוחף את הפופט לתושבת – אטימה ללא דליפה. ככל שהלחץ ההפוך גבוה יותר, האטימה חזקה יותר.`});
      else L.push({ic:'⏸',at:'CUT',h:`p₁ − p₂ = ${fmt(P.p1-P.p2,1)} bar עדיין קטן מלחץ הפתיחה ${fmt(P.pc,1)} bar – הקפיץ מחזיק את הפופט סגור.`});}
    if(R.pil){if(R.held&&R.mode==='rev')L.push({ic:'🔓',at:'CUT',h:`פיקוד ${fmt(R.pXv,1)} bar × φ ${fmt(P.phi,1)} = ${fmt(R.pXv*P.phi,0)} bar ≥ ${fmt(P.p2-P.p1+P.pc,0)} bar: בוכנת הפיקוד דוחפת את הפופט וזרימה הפוכה 2→1 של <b>${fmt(-R.Q,1)} L/min</b>.`});
      else if(P.p2>P.p1)L.push({ic:'🎯',w:R.pXs>R.need&&!R.held,at:'GX',h:`לפתיחה הפוכה צריך p_X ≥ (p₂ − p₁ + p_c)/φ = <b>${fmt(R.need,1)} bar</b>. כרגע ליד השסתום: ${fmt(R.pXv,1)} bar.`,c:'הפיקוד לא פותח למרות שהלחץ מספיק'});
      L.push({ic:'📐',h:`יחס פיקוד φ = ${fmt(P.phi,1)}: שטח בוכנת הפיקוד גדול פי ${fmt(P.phi,1)} משטח התושבת, ולכן לחץ פיקוד קטן פותח לחץ עומס גדול.`});}
    if(R.mode==='leak')L.push({ic:'💧',w:true,at:'FM',h:`יש ספיקה של ${fmt(Math.abs(R.Q),2)} L/min כשהשסתום אמור להיות סגור!`,c:'ספיקה דרך שסתום סגור'});
    if(!R.pil)L.push({ic:'💡',h:'אל-חוזר רגיל אי אפשר לפתוח בכיוון ההפוך – בשביל זה צריך אל-חוזר מפוקד.'});return L;},
  calc(P,R){if(R.dual){const a=R.a;return `<div class="kpis">${kpi('לחץ החזקה',fmt(R.hold,1),'bar')}${kpi('פיקוד להורדה',fmt(isFinite(R.pPil??NaN)?R.pPil:(R.hold+P.pc*(1-a))/Math.max(P.phi-a,1e-6),1),'bar')}${kpi('A₂/A₁',fmt(a,3))}${kpi('φ',fmt(P.phi,1))}</div>`+
      det('לחץ ההחזקה',row('',`A₁ = π·${P.D}²/4 = ${V(R.A1,'mm²')} · A₂ = ${V(R.A2,'mm²')}`)+row('',`p_hold = ${fr('F','A₁')} = ${fr(fmt(P.F,0)+'·10',fmt(R.A1,0))} = ${V(R.hold,'bar')}`),true)+
      det('פיקוד הדרוש להורדה (עומס מסייע)',row('איזון בוכנת הפיקוד',`p_B·φ = p_cyl,A − p_A + p_c`)+row('איזון הבוכנה',`p_cyl,A·A₁ = F + (p_B − p_c)·A₂`)+row('ביחד',`p_B = ${fr('p_hold + p_c(1 − A₂/A₁) − p_A','φ − A₂/A₁')}`)+
        row('',`p_B = ${fr(fmt(R.hold,1)+' + '+fmt(P.pc,1)+'·'+fmt(1-a,3)+' − p_A',fmt(P.phi,1)+' − '+fmt(a,3))} = ${V(R.dir<0&&!R.stall?R.pB1:(R.hold+P.pc*(1-a))/Math.max(P.phi-a,1e-6),'bar')}`),true)+
      det('הגברת לחץ כש-A נעול',row('',`p_cyl,A = p_hold + p_B·A₂/A₁ – למשל ${fmt(P.pr,0)} bar בקו B נותן ${V(R.hold+(P.pr-P.pc)*a,'bar')}`))+`<div class="note">p_A = מפל הלחץ בקו A בדרך למיכל. ההחזקה מניחה שהאל-חוזר אוטם לגמרי.</div>`;}
    const ds=10,As=H.A(ds),AX=As*P.phi;return `<div class="kpis">${kpi('Δp על השסתום',fmt(P.p1-P.p2,1),'bar')}${kpi('ספיקה',fmt(R.Q,2),'L/min')}${R.pil?kpi('פיקוד נדרש',fmt(R.need,1),'bar'):''}${kpi('לחץ פתיחה',fmt(P.pc,1),'bar')}</div>`+
      det('תנאי פתיחה בכיוון החופשי',row('',`p₁ − p₂ > p_c  ⇒  ${fmt(P.p1,1)} − ${fmt(P.p2,1)} = ${fmt(P.p1-P.p2,1)} ${P.p1-P.p2>P.pc?'>':'≤'} ${fmt(P.pc,1)} bar`,P.p1-P.p2>P.pc)+row('כוח הקפיץ',`F_s = p_c·A_s = ${fmt(P.pc,1)}·${fmt(As,1)}/10 = ${V(P.pc*As/10,'N')} (תושבת Ø${ds})`),true)+
      (R.pil?det('פתיחה הפוכה בפיקוד',row('יחס פיקוד',`φ = A_X/A_s ⇒ A_X = ${fmt(P.phi,1)}·${fmt(As,1)} = ${V(AX,'mm²')} (Ø${fmt(Math.sqrt(4*AX/PI),1)} mm)`)+row('איזון כוחות',`p_X·A_X ≥ (p₂ − p₁)·A_s + F_s`)+row('',`p_X ≥ ${fr('p₂ − p₁ + p_c','φ')} = ${fr(fmt(P.p2,0)+' − '+fmt(P.p1,0)+' + '+fmt(P.pc,1),fmt(P.phi,1))} = ${V(R.need,'bar')}`,R.pXv>=R.need),true):'')+
      det('ספיקה',row('התנגדויות',`Δp = p_c + (Q/k_v)² + 2(Q/k_L)², k_v = ${A7_kV}, k_L = ${A7_kL} L/min/√bar`)+row('',`Q = ${sq('(|Δp| − p_c)/(1/k_v² + 2/k_L²)')} = ${V(Math.abs(R.Q),'L/min')}`)+row('כשהפיקוד מחזיק את הפופט פתוח',`אין קיזוז p_c: Q = ${sq('|Δp|/(1/k_v² + 2/k_L²)')}`))+
      `<div class="note">ההנחה: בוכנת פיקוד עם ניקוז חיצוני Y ושטח הפין זניח.</div>`;},
  demo:[{t:'אל-חוזר רגיל',x:'שסתום אל-חוזר נותן לשמן לעבור רק בכיוון אחד (1→2). כאן הלחץ בצד 2 גבוה יותר – והוא עצמו לוחץ את הפופט לתושבת.',reset:true,set:{type:'plain'},hl:['CV','CUT']},
    {t:'זרימה בכיוון החופשי',x:'מעלים את p₁ ל-60 bar ומורידים את p₂ ל-20: הלחץ מרים את הפופט נגד הקפיץ והשמן זורם. מפל הלחץ = <b>p_c</b> + מפל הזרימה.',set:{p1:60,p2:20},hl:['CUT','FM']},
    {t:'לחץ הפתיחה',x:'הפרש של 1.5 bar בלבד קטן מלחץ הפתיחה (2 bar): הקפיץ עדיין מנצח ואין זרימה. כך אל-חוזר עם קפיץ חזק משמש גם ליצירת לחץ גב.',set:{p1:21.5,p2:20},hl:['CUT','G1','G2']},
    {t:'מפוקד – פיקוד חלש',x:'עכשיו אל-חוזר מפוקד, p₂ = 100 bar. לחץ פיקוד של 10 bar לא מספיק: צריך (100 − 20 + 2)/4 = 20.5 bar. הפין נוגע בפופט אך לא מזיז אותו.',reset:true,set:{type:'pocv',auto:false,pX:10},hl:['GX','CUT']},
    {t:'הפיקוד פותח',x:'25 bar פיקוד × φ = 4 → 100 bar "כוח שקול" – יותר מ-82 bar הדרושים. הבוכנה דוחפת את הפופט והשמן זורם הפוך 2→1.',set:{pX:25},hl:['CUT','FM'],dur:7},
    {t:'יחס פיקוד גדול',x:'φ = 8: אותו עומס נפתח כבר ב-10.25 bar. יחס גדול = פתיחה קלה, אבל רגיש יותר לרעידות.',set:{phi:8,pX:12},hl:['CUT','GX']},
    {t:'אל-חוזר כפול',x:'שני שסתומים בבלוק אחד, וכל אחד נפתח בפיקוד מהקו של השני. במרכז הצף שניהם סגורים והצילינדר נעול בשני הכיוונים.',reset:true,set:{type:'dual'},hl:['CA','CB','FR'],dur:10},
    {t:'הורדה עם עומס',x:'במצב b לחץ קו B פותח את A. הלחץ הדרוש תלוי בעומס, ב-φ ובשטחים: p_B = (p_hold + p_c(1−A₂/A₁) − p_A)/(φ − A₂/A₁).',set:{pos:'b',auto:false},act:(P,st)=>{st.x=240;},hl:['CA','GCA','V1'],dur:8}],
  predict:[{q:'p₁ = 0, p₂ = 120 bar, p_c = 3 bar, φ = 4. מפעילים פיקוד של 25 bar. מה יקרה?',set:{type:'pocv',auto:false,p1:0,p2:120,pc:3,pX:25},opts:['נפתח וזורם 2→1','נשאר סגור','זורם 1→2'],a:1,why:'צריך p_X ≥ (120 − 0 + 3)/4 = 30.75 bar. 25 bar לא מספיקים – הפין נוגע בפופט אבל לא מרים אותו.'},
    {q:'אל-חוזר רגיל עם p_c = 2 bar: p₁ = 21 bar, p₂ = 20 bar. האם יש זרימה?',set:{type:'plain',p1:21,p2:20,pc:2},opts:['כן, 1→2','לא','כן, 2→1'],a:1,why:'ההפרש 1 bar קטן מלחץ הפתיחה 2 bar – הקפיץ מחזיק את הפופט סגור.'},
    {q:'אל-חוזר כפול, הורדת עומס במצב b. מקטינים את φ מ-4 ל-1.5. מה יקרה ללחץ המשאבה בזמן ההורדה?',set:{type:'dual',auto:false,pos:'b',phi:1.5},act:(P,st)=>{st.x=240;},opts:['כמעט לא ישתנה','יעלה פי 3–4','יירד'],a:1,why:'p_B = (p_hold + …)/(φ − A₂/A₁). המכנה קטן מ-3.33 ל-0.83 – לחץ קו B עולה פי 4 (כ-13 ← כ-51 bar) ולחץ המשאבה מכ-16 לכ-54 bar.'},
    {q:'במצב פיקוד 0 bar, p₁ = 50 bar ו-p₂ = 20 bar. מה יעשה האל-חוזר המפוקד?',set:{type:'pocv',auto:false,p1:50,p2:20,pX:0},opts:['יעביר זרימה 1→2 כרגיל','ייחסם – אין פיקוד','יעביר 2→1'],a:0,why:'בכיוון החופשי הוא מתנהג כמו אל-חוזר רגיל. הפיקוד נדרש רק לפתיחה בכיוון ההפוך.'}],
  tasks:[{q:P=>`עומס יוצר ${P.p2} bar בצד 2, צד 1 פתוח למיכל (0 bar). p_c = ${P.pc} bar, φ = ${P.phi}. איזה לחץ פיקוד פותח את השסתום?`,a:P=>(P.p2+P.pc)/P.phi,u:'bar',hint:'p_X = (p₂ − p₁ + p_c)/φ.',rand:P=>{P.type='pocv';P.p2=rnd(60,250,5);P.p1=0;P.pc=pick([1,2,3,5]);P.phi=pick([3,4,5,8,10]);}},
    {q:P=>`קוטר התושבת ${P.D>60?12:10} מ"מ, קוטר בוכנת הפיקוד ${P.dr} מ"מ. מה יחס הפיקוד φ?`,a:P=>(P.dr/(P.D>60?12:10))**2,u:'',hint:'φ = A_X/A_s = (d_X/d_s)².',rand:P=>{P.D=pick([50,63,80]);P.dr=pick([20,22,25,28,32]);}},
    {q:P=>`p₂ = ${P.p2} bar, לחץ הפתיחה ${P.pc} bar. מה הלחץ המינימלי בצד 1 שמתחיל זרימה 1→2?`,a:P=>P.p2+P.pc,u:'bar',hint:'צריך p₁ − p₂ > p_c.',rand:P=>{P.p2=rnd(5,150,5);P.pc=pick([.5,1,2,3,5]);}},
    {q:P=>`צילינדר Ø${P.D}/${P.dr}, עומס ${P.F} N דוחף פנימה, φ = ${P.phi}, p_c = ${P.pc} bar, p_A ≈ 0. איזה לחץ בקו B פותח את A להורדה?`,a:P=>{const A1=H.A(P.D),a=H.Aann(P.D,P.dr)/A1;return (10*P.F/A1+P.pc*(1-a))/(P.phi-a);},u:'bar',tol:.03,hint:'p_B = (F/A₁ + p_c(1 − A₂/A₁))/(φ − A₂/A₁).',rand:P=>{P.type='dual';P.D=pick([50,63,80,100]);P.dr=Math.round(P.D*pick([.5,.56,.63]));P.F=rnd(5000,40000,500);P.phi=pick([3,4,5,8]);P.pc=pick([1,2,3]);}}],
  faults:[{id:'seat',t:'תושבת פגומה – האל-חוזר דולף',sym:'"הצילינדר שוקע לאט כשהידית באמצע, ובספסל רואים ספיקה גם כשהשסתום סגור."',hint:'הסתכלו על מד הספיקה בזמן שהפיקוד כבוי.',why:'שריטה או לכלוך על התושבת: הפופט לא אוטם, ולכן עוברת ספיקה קטנה בכל הפרש לחץ. בצילינדר – העומס שוקע במרכז.'},
    {id:'pilot',t:'קו הפיקוד חסום',sym:'"מכוונים לחץ פיקוד גבוה, ובכל זאת השסתום לא נפתח בכיוון ההפוך."',hint:'השוו את לחץ מקור הפיקוד ללחץ במד X שליד השסתום.',why:'החיבור לפתח X סתום: המקור מראה לחץ, אבל המד ליד השסתום נשאר על 0 ובוכנת הפיקוד לא זזה.'},
    {id:'ratio',t:'יחס פיקוד שגוי (שסתום מסוג אחר / בוכנה שחוקה)',sym:'"הפיקוד מגיע לשסתום, לפי החישוב הוא מספיק – אבל השסתום לא נפתח."',hint:'המד ליד X מראה לחץ גבוה מהנדרש לפי φ שבקטלוג. העלו את הפיקוד בהדרגה – באיזה לחץ הוא כן נפתח?',why:'יחס הפיקוד בפועל קטן ב-25% מהמתוכנן (3 במקום 4): הלחץ הנדרש עולה ל-(p₂−p₁+p_c)/3.'}],
  test(H){const P=clone(this.P);P.auto=false;const {R}=runSim(this,P,3);const P2=clone(this.P);P2.auto=false;P2.p1=60;P2.p2=20;P2.pX=0;const R2=runSim(this,P2,.5).R;
    const P3=clone(this.P);P3.type='dual';P3.auto=false;P3.pos='b';const s3=this.init(P3);let R3;for(let t=0;t<.5;t+=.02)R3=this.step(P3,s3,.02,{});
    const A1=H.A(63),a=H.Aann(63,36)/A1,pAv=(16/a/(16/Math.sqrt(3)))**2,res=1/64+2/4.2**2;
    return [['זרימה הפוכה Q = √(Δp/R)',R.Q,-Math.sqrt(80/res)],['זרימה חופשית Q = √((Δp−p_c)/R)',R2.Q,Math.sqrt(38/res)],['פיקוד נדרש (p₂−p₁+p_c)/φ',R.need,(100-20+2)/4],
      ['לחץ קו B בהורדה',R3.pB1,(10*15000/A1+2*(1-a)-pAv)/(4-a)],['p החזקה = F/A₁',R3.hold,15000*10/A1],['UI ספיקה',R.read[3].v,R.Q]];}};

/* ---------- 22 · DCV spool lab ---------- */
const A7_FS=400,A7_VG=20;
function A7_boxes(P){return P.ways==='43'?KIT.D43[P.cen]:P.ways==='42'?['P>A B>T','P>B A>T']:P.ways==='32'?['P>A T|','A>T P|']:['P>A','P| A|'];}
function A7_conn(sp){return sp.split(/\s+/).filter(Boolean).map(t=>{let m;if((m=/^(\w)>(\w)$/.exec(t)))return `${m[1]}→${m[2]}`;if((m=/^(\w)-(\w)$/.exec(t)))return `${m[1]}→${m[2]}`;if((m=/^(\w)\|$/.exec(t)))return `${m[1]}⊥`;return t.split('+').join('↔');}).join(' · ');}
/* spool geometry in the cut-away: chambers [name,x], lands [x0,x1] (spool coords), s(i) spool offset for box index i */
function A7_geo(w,cen){if(w==='43'||w==='42'){const ch=[['T',-68],['A',-34],['P',0],['B',34],['T',68]];let L=[[-46,-22],[22,46]];
    if(w==='43'&&cen==='open')L=[[-40,-28],[28,40]];if(w==='43'&&cen==='float')L=[[-38,-22],[22,38]];
    return {ch,L:[[-96,-80],...L,[80,96]],s:w==='42'?i=>lerp(-12,12,i):i=>(i-1)*12,byp:w==='43'&&cen==='tandem'};}
  if(w==='32')return {ch:[['P',-34],['A',0],['T',34]],L:[[-96,-54],[-12,12],[54,96]],s:i=>lerp(12,-12,i)};
  return {ch:[['P',-17],['A',17]],L:[[-96,-40],[5,29],[52,96]],s:i=>lerp(12,0,i)};}
/* cut-away of the valve body + spool. o={ways,cen,act,s}; cs={s,u:{P,A,B,T},eL,eR,uL,uR} */
SYM.a7_spool={ports:o=>({}),bb:o=>[-152,-48,152,50].map(v=>v*(o.s||1)),
  draw(g0,o){const g=sv('g',{transform:`scale(${o.s||1})`},g0);const G=A7_geo(o.ways,o.cen),two=o.ways!=='43';
    A7_R(g,-122,-36,244,72,A7_MET,'syb');const bore=A7_R(g,-120,-9,240,18,'#e2e8f0','sy thin');
    const chs=G.ch.map(([n,x])=>{const top=n==='A'||n==='B';const r=[A7_R(g,x-8,-20,16,40,'#93c5fd','sy thin'),A7_R(g,x-4,top?-36:20,8,16,'#93c5fd','sy thin')];ST(g,x,top?-40:47,n,'st b');return {n,x,r};});
    const sg=sv('g',{},g);const grooves=[];for(let k=0;k<G.L.length-1;k++){grooves.push({x0:G.L[k][1],x1:G.L[k+1][0],r:A7_R(sg,G.L[k][1],-9,G.L[k+1][0]-G.L[k][1],18,'#93c5fd','')});}
    A7_R(sg,-96,-3,192,6,'#94a3b8','sy thin');G.L.forEach(([a,b])=>A7_R(sg,a,-9,b-a,18,'#64748b','sy thin'));
    let byp=null;if(G.byp){byp=SP(sg,'M0,0 V-1 M0,0 H-68','sy');byp.style.strokeWidth=3;byp.style.stroke='#0b72d9';SP(sg,'M0,-3 V3 M-68,-3 V3','sy thin');}
    const spL=SP(g,'','sy thin'),spR=SP(g,'','sy thin');bore.style.fill='none';
    const act=(side,kind)=>{const x=side*122,e={};if(kind==='sol'){e.b=A7_R(g,side<0?-146:122,-14,24,28,'#fff','syb');SL(g,side*126,10,side*142,-10,'sy thin');ST(g,side*134,-18,side<0?'a':'b','st s');}
      else if(kind==='pilot'){e.b=A7_R(g,side<0?-140:122,-12,18,24,'#fff','syb');ST(g,side*131,-16,'X','st s');}
      else if(kind==='lever'){e.l=sv('g',{},g);SL(e.l,x,0,x+side*8,0,'sy thick');SL(e.l,x+side*8,0,x+side*20,-22,'sy thick');SC(e.l,x+side*21,-24,3.5,'syf');}
      else if(kind==='spring'){ST(g,side*136,4,'קפיץ','st s');}return e;};
    const eL=act(-1,o.act),eR=act(1,two?'spring':o.act);
    return cs=>{cs=cs||{};const s=cs.s||0,u=cs.u||{};sg.setAttribute('transform',`translate(${s},0)`);
      spL.setAttribute('d',two?'':zig(-120,0,-96+s,0,4,6));spR.setAttribute('d',zig(96+s,0,120,0,4,6));
      chs.forEach(c=>{const col=pCss(u[c.n]||0);c.r.forEach(r=>r.style.fill=col);});
      grooves.forEach(gr=>{let m=null;const a=gr.x0+s,b=gr.x1+s;G.ch.forEach(([n,x])=>{if(Math.min(b,x+8)-Math.max(a,x-8)>.5)m=Math.max(m??-1,u[n]||0);});gr.r.style.fill=m==null?'#e2e8f0':pCss(m);});
      if(byp)byp.style.opacity=Math.abs(s)<4?1:.15;
      [[eL,cs.eL,cs.uL],[eR,cs.eR,cs.uR]].forEach(([e,on,up])=>{if(e.b){e.b.style.fill=o.act==='pilot'?pCss(up||0):on?'#fca5a5':'#fff';}if(e.l)e.l.setAttribute('transform',`rotate(${-s*1.6} ${e===eL?-122:122} 0)`);});};}};
function A7_dead(Q,pr,kW){const ov=Math.max(3,.06*pr);return H.bisect(p=>H.reliefQ(p,pr,ov,Q)+kW*Math.sqrt(p)-Q,0,pr+ov*1.3);}
const A7_SIM_SPOOL={id:'spool',n:22,t:'מעבדת ספולים',d:'2/2, 3/2, 4/2, 4/3 ומצבי אמצע: הספול בחתך מול סמל ISO והשפעה על הצרכן',
  P:{ways:'43',cen:'closed',act:'sol',pos:'a',auto:true,Q:20,D:50,dr:28,F:1000,Tq:10,pr:100},
  key:P=>`${P.ways}|${P.cen}|${P.act}`,
  ui(U,P){U.grp('השסתום');U.seg(P,'ways','דרכים/מצבים',[['22','2/2'],['32','3/2'],['42','4/2'],['43','4/3']],true);
    if(P.ways==='43')U.sel(P,'cen','מצב אמצעי',[['closed','סגור'],['open','פתוח (הכול מחובר)'],['tandem','טנדם (P→T)'],['float','צף (A,B→T)']]);
    U.seg(P,'act','הפעלה',[['lever','ידית'],['sol','סולנואיד'],['pilot','פיקוד']]);
    U.seg(P,'pos','מצב',P.ways==='43'?KIT.pos3:[['a','a – מופעל','מצב מופעל'],['0','0 – קפיץ','מצב רגיל (קפיץ)']]);U.chk(P,'auto','מחזור אוטומטי');
    U.grp('צרכן ומשאבה');if(P.ways==='22')U.num(P,'Tq','מומנט על המנוע','N·m',{min:0,max:60,step:1});else{U.num(P,'F','עומס הדוחף את המוט פנימה','N',{min:0,max:20000,step:100});U.num(P,'D','קוטר בוכנה D','mm',{min:25,max:125,step:1});}
    U.num(P,'Q','ספיקת משאבה','L/min',{min:2,max:80,step:1});
    U.grp('עוד',false);U.num(P,'dr','קוטר מוט d','mm',{min:10,max:90,step:1});U.num(P,'pr','כיול שסתום פריקה','bar',{min:20,max:300,step:5});},
  circuit(P){const W=P.ways,box=A7_boxes(P),two=W!=='43',w=+W[0];
    const dcv={id:'V1',type:'dcv',x:300,y:250,o:{box,ways:w,n0:1,L:P.act,R:two?'spring':P.act,center:!two},name:`שסתום פיקוד ${W[0]}/${W[1]} – לחיצה מחליפה מצב`,lbl:`${W[0]}/${W[1]}`,lblAt:[two?-70:-92,4],l3:[0,-34]};
    const pP=w===2?[300,290]:[293,290];
    const comps=[dcv,{id:'P1',type:'pump',x:170,y:330,name:'משאבה',lbl:'משאבה',lblAt:[32,6]},{id:'T1',type:'tank',x:170,y:374,name:'מיכל'},
      {id:'RV',type:'pv',x:120,y:290,rot:-90,o:{kind:'relief'},name:'שסתום פריקה',lbl:'פריקה',lblAt:[0,-28]},{id:'T2',type:'tank',x:84,y:320,name:'מיכל'},
      {id:'GP',type:'gauge',x:230,y:278,net:'P',name:'מד לחץ משאבה',l3:[0,-30]},
      {id:'SP',type:'a7_spool',x:535,y:250,o:{ways:W,cen:P.cen,act:P.act,s:.95},name:'חתך: גוף השסתום והספול – הצבע מראה את הלחץ בכל תא'}];
    const lines=[{id:'LS',net:'S',pts:['T1.t','P1.in']},{id:'LP',net:'P',pts:['P1.out',[170,290],pP,'V1.P']},{id:'LRV',net:'P',pts:[[170,290],'RV.P']},{id:'LRT',net:'T',pts:['RV.T',[84,290],'T2.t']}];
    if(w>=3){comps.push({id:'T3',type:'tank',x:345,y:314,name:'מיכל'});lines.push({id:'LT',net:'T',pts:['V1.T',[307,290],[345,290],'T3.t'],tag:{at:[300,318],t:'q'}});}
    if(w===4){comps.push({id:'C1',type:'cyl',x:300,y:60,o:{load:{t:'F'}},name:'צילינדר דו-פעולה',lbl:'צילינדר',lblAt:[-84,-20],l3:[0,-34]},{id:'GA',type:'gauge',x:265,y:138,net:'A',name:'מד לחץ קו A',valAt:[-16,-2]},{id:'GB',type:'gauge',x:335,y:138,net:'B',name:'מד לחץ קו B'});
      lines.push({id:'LA',net:'A',pts:['V1.A',[293,150],[250,150],'C1.A']},{id:'LB',net:'B',pts:['V1.B',[307,150],[350,150],'C1.B']});}
    if(w===3){comps.push({id:'C1',type:'cyl',x:300,y:60,o:{load:{t:'F'},single:true,spring:true},name:'צילינדר חד-פעולה עם קפיץ חזרה',lbl:'חד-פעולה',lblAt:[-84,-20],l3:[0,-34]},{id:'GA',type:'gauge',x:270,y:138,net:'A',name:'מד לחץ קו A'});
      lines.push({id:'LA',net:'A',pts:['V1.A',[300,150],[250,150],'C1.A']});}
    if(w===2){comps.push({id:'M1',type:'motor',x:300,y:140,rot:180,name:'מנוע הידראולי',lbl:'מנוע',lblAt:[30,0],l3:[0,-30]},{id:'GA',type:'gauge',x:312,y:195,rot:90,net:'A',name:'מד לחץ בכניסה למנוע',valAt:[18,-2]},{id:'T4',type:'tank',x:380,y:130,name:'מיכל'});
      lines.push({id:'LA',net:'A',pts:['V1.A','M1.A']},{id:'LM',net:'T',pts:['M1.B',[300,96],[380,96],'T4.t']});}
    return {comps,lines};},
  init:P=>({x:0,si:P.pos==='a'?0:P.pos==='b'?2:1,dir:0,tm:0}),
  click(id,P){if(id==='V1'||id==='SP'){P.pos=P.ways==='43'?(P.pos==='a'?'0':P.pos==='0'?'b':'a'):(P.pos==='a'?'0':'a');P.auto=false;return true;}},
  step(P,st,dt,ctx){const f=ctx.fault,W=P.ways,two=W!=='43',mot=W==='22',S=200;if(two&&P.pos==='b')P.pos='0';
    const A1=H.A(P.D),A2=H.Aann(P.D,Math.min(P.dr,P.D-4)),box=A7_boxes(P),G=A7_geo(W,P.cen);
    if(st.lp!==P.pos){st.lp=P.pos;st.tm=0;}st.tm+=dt;
    const end0=mot?st.tm>2:(st.dir>0&&st.x>=S-1e-6)||(st.dir<0&&st.x<=1e-6);A7_seq(P,st,dt,end0,1.2,two?['a','0']:['a','0','b','0'],two);
    const cmd=P.pos==='a'?0:P.pos==='b'?2:1;let tgt=cmd;if(f==='stuck')tgt=1;if(f==='coilb'&&(two?cmd===0:cmd===2))tgt=1;
    KIT.ease(st,'si',tgt,dt,P.act==='lever'?9:P.act==='sol'?14:5);const i=st.si,ir=Math.round(i),op=clamp(1-Math.abs(i-ir)*2.2,0,1),sp=box[ir];
    const Q=P.Q,kV=Math.max(Q/Math.sqrt(3)*op,1e-3),kC=Q/Math.sqrt(3)*.3,kU=Q/Math.sqrt(3)*.6,kW=f==='wear'?.6*Q/Math.sqrt(P.pr):0,F=P.F;
    let ps,pA=0,pB=0,v=0,qA=0,qB=0,qT=0,Qr=0,rpm=0,cav=false,dir=0,lock=false,kind='';const hold=10*F/A1;
    const dead=()=>{ps=A7_dead(Q,P.pr,kW);Qr=Q-kW*Math.sqrt(ps);};
    const drift=(pn,k)=>{if(st.x<=1e-6){pA=pn;return;}pA=(10*F+pn*A2)/A1;const Qd=k*Math.sqrt(Math.max(pA-pn,0));v=-H.v(Qd,A1);qA=-Qd;qB=Qd*A2/A1;dir=-1;};
    if(mot){if(sp==='P>A'){kind='run';const pL=20*PI*P.Tq/A7_VG;ps=H.bisect(p=>pL+((Q-kW*Math.sqrt(p))/kV)**2-p,pL,pL+400);if(ps>P.pr){dead();}else{const Qm=Q-kW*Math.sqrt(ps);qA=Qm;pA=pL;rpm=Qm*1000/A7_VG;}}else{kind='stop';dead();pA=0;}}
    else if(sp==='P>A B>T'||sp==='P>A T|'){kind='ext';dir=1;const end=st.x>=S-1e-6;const r=H.lin({Qp:Q,pr:P.pr,Ain:A1,Aout:sp==='P>A T|'?0:A2,F:end?1e9:F+(W==='32'?A7_FS:0),kIn:kV,kOut:kV,kBleed:kW});
      ps=r.ps;pA=r.stall?r.ps:r.pIn;pB=W==='32'?0:r.pOut;v=r.v;qA=r.Qin;qB=-r.Qout;qT=r.Qout;Qr=r.Qr;cav=!!r.cav;}
    else if(sp==='P>B A>T'){kind='ret';dir=-1;const end=st.x<=1e-6;const r=H.lin({Qp:Q,pr:P.pr,Ain:A2,Aout:A1,F:end?1e9:-F,kIn:kV,kOut:kV,kBleed:kW,vRun:H.v(Q,A2)*3});
      ps=r.ps;pB=r.stall?r.ps:r.pIn;pA=r.pOut;v=-r.v;qB=r.Qin;qA=-r.Qout;qT=r.Qout;Qr=r.Qr;cav=!!r.cav;}
    else if(sp==='A>T P|'){kind='spr';dir=-1;dead();if(st.x>1e-6){pA=10*(F+A7_FS)/A1;const Qd=kV*Math.sqrt(pA);v=-H.v(Qd,A1);qA=-Qd;qT=Qd;}}
    else if(sp==='P| T| A| B|'){kind='closed';dead();lock=true;pA=st.x>1e-6?hold:0;if(f==='wear'&&st.x>1e-6){drift(0,kW*.5);qT=-qA;}}
    else if(sp==='P+A+B+T'){kind='open';ps=(Q/kU)**2;drift(ps,kC);pB=ps;qT=Q+Math.max(-qA-qB,0);}
    else if(sp==='P-T A| B|'){kind='tandem';ps=(Q/kU)**2;lock=true;pA=st.x>1e-6?hold:0;qT=Q;if(f==='wear'&&st.x>1e-6)drift(0,kW*.5);}
    else if(sp==='P| A+B+T'){kind='float';dead();drift(0,kC);qT=-qA-qB;}
    st.x=clamp(st.x+v*dt,0,S);if(dir)st.dir=dir;KIT.rpmAng(st,dt,1450);KIT.rpmAng(st,dt,rpm,'ma');
    const pm=P.pr;const pil=30;
    return {kind,sp,ir,ps,pA,pB,v,rpm,Qr,cav,lock,A1,A2,hold,S,
      p:{P:ps,A:pA,B:pB,T:Math.min(1,Math.abs(qT)/Q),S:-.05},q:{LS:Q,LP:Q-Qr,LRV:Qr,LRT:Qr,LA:qA,LB:qB,LT:Math.abs(qT),LM:qA},pmax:pm,qref:Q,cav:cav?{LA:true,LB:true}:null,
      c:{C1:{x:st.x/S,uA:pA/pm,uB:pB/pm,lt:`F ${fmt(F/1000,1)} kN`},V1:{i},P1:{on:true,ang:st.ang},M1:{ang:st.ma},RV:{open:clamp(Qr/Q,0,1)},
        SP:{s:G.s(i),u:{P:ps/pm,A:pA/pm,B:pB/pm,T:0},eL:P.act==='sol'&&cmd===0,eR:P.act==='sol'&&cmd===2,uL:P.act==='pilot'&&cmd===0?pil/pm:0,uR:P.act==='pilot'&&cmd===2?pil/pm:0}},
      read:[{k:'לחץ משאבה',v:ps,u:'bar'},{k:'לחץ קו A',v:pA,u:'bar'},...(W==='42'||W==='43'?[{k:'לחץ קו B',v:pB,u:'bar'}]:[]),
        mot?{k:'מהירות מנוע',v:rpm,u:'rpm',max:Q*1000/A7_VG,dg:0}:{k:'מהירות בוכנה',v:v,u:'mm/s',max:H.v(Q,A2)},...(mot?[]:[{k:'מיקום הבוכנה',v:st.x,u:'mm',max:S}]),
        {k:'ספיקה בשסתום הפריקה',v:Qr,u:'L/min',max:Q,w:Qr>Q*.5},{k:'חום',v:H.kW(ps,Qr)+H.kW(ps,kW*Math.sqrt(Math.max(ps,0))),u:'kW',dg:2,max:H.kW(P.pr,Q)}]};},
  ins(P,R){const L=[],nm=P.ways==='43'?['a','0 (אמצע)','b'][R.ir]:['a (מופעל)','0 (קפיץ)'][R.ir];
    L.push({ic:'🔀',at:'SP',h:`מצב ${nm}: <b dir="ltr">${A7_conn(R.sp)}</b>. בחתך רואים אילו תאים מחוברים דרך החריצים שבין צווארוני הספול (⊥ = פתח חסום).`});
    if(R.kind==='ext'&&R.v>0)L.push({ic:'➡️',h:`יציאה: v = Q/A₁ = ${fmt(P.Q,0)} L/min ÷ ${fmt(R.A1,0)} mm² = <b>${fmt(R.v,1)} mm/s</b>${P.ways==='32'?` (הקפיץ ${A7_FS} N מוסיף לעומס)`:''}.`});
    if(R.kind==='ret'&&R.v<0)L.push({ic:'⬅️',h:`חזרה: השמן נכנס לצד המוט, v = ${fmt(-R.v,1)} mm/s. מהצד המלא יוצאים ${fmt(H.Q(-R.v,R.A1),1)} L/min למיכל.`});
    if(R.kind==='spr'&&R.v<0)L.push({ic:'🌀',h:`קפיץ ועומס (${fmt(P.F+A7_FS,0)} N) מחזירים את הבוכנה: הלחץ ${fmt(R.pA,1)} bar דוחף את השמן מ-A ל-T. המשאבה חסומה ב-P.`});
    if(R.lock)L.push({ic:'🔒',at:'C1',h:`A ו-B חסומים: הצילינדר נעול והעומס מוחזק ב-${fmt(R.pA,1)} bar (בפועל יש זליגה קטנה דרך מרווח הספול).`});
    if(R.kind==='open'||R.kind==='float'){if(R.v<-.5)L.push({ic:'⚠️',w:true,at:'C1',h:`מרכז ${R.kind==='open'?'פתוח':'צף'}: A ו-B מחוברים למיכל, והעומס ${fmt(P.F,0)} N דוחף את הבוכנה פנימה ב-${fmt(-R.v,1)} mm/s.`,c:'הצילינדר "צף" – העומס מזיז אותו'});
      else L.push({ic:'🪶',h:'A ו-B מחוברים למיכל: אפשר להזיז את הבוכנה ביד (למשל לכוונון), אבל אין החזקת עומס.'});}
    if(R.kind==='open'||R.kind==='tandem')L.push({ic:'💤',at:'GP',h:`P מחובר ל-T: המשאבה פורקת ב-${fmt(R.ps,1)} bar בלבד – כמעט ללא חום (${fmt(H.kW(R.ps,P.Q),2)} kW).`});
    if(R.Qr>P.Q*.5)L.push({ic:'🔥',w:true,at:'P1',h:`כל הספיקה (${fmt(R.Qr,1)} L/min) עוברת בשסתום הפריקה ב-${fmt(R.ps,0)} bar → <b>${fmt(H.kW(R.ps,R.Qr),2)} kW</b> חום.`,c:`${fmt(H.kW(R.ps,R.Qr),1)} kW הופכים לחום`});
    if(R.cav)L.push({ic:'💥',w:true,at:'C1',h:'העומס מושך את הבוכנה מהר יותר מהספיקה – תת-לחץ וקוויטציה בצד הנכנס. צריך שסתום איזון עומס או צמצם ביציאה.'});
    if(R.kind==='run')L.push({ic:'⚙️',h:`המנוע מסתובב: n = Q/V_g = ${fmt(P.Q,0)}·1000/${A7_VG} = <b>${fmt(R.rpm,0)} rpm</b>, Δp = 20π·T/V_g = ${fmt(20*PI*P.Tq/A7_VG,1)} bar.`});
    L.push({ic:'🎛️',h:{lever:'ידית: המפעיל מזיז את הספול ישירות ומרגיש את הכוחות. מתאים לשסתומים קטנים ולמכונות ניידות.',sol:'סולנואיד: אות חשמלי מזיז את הספול בכ-30–60 ms. כוח הסולנואיד מוגבל, ולכן בספיקות גדולות משתמשים בשסתום דו-שלבי.',pilot:'פיקוד: לחץ הידראולי על קצה הספול – כוח גדול, מעבר רך ואיטי יותר.'}[P.act]});return L;},
  calc(P,R){const box=A7_boxes(P),n=P.ways==='43'?['a','0','b']:['a','0'];const A1=R.A1,A2=R.A2;
    return `<div class="kpis">${kpi('לחץ משאבה',fmt(R.ps,1),'bar')}${P.ways==='22'?kpi('מנוע',fmt(R.rpm,0),'rpm'):kpi('מהירות',fmt(R.v,1),'mm/s')}${kpi('חום בשסתום הפריקה',fmt(H.kW(R.ps,R.Qr),2),'kW')}${kpi('מצב',n[R.ir])}</div>`+
      det('טבלת חיבורים',box.map((b,k)=>row(`מצב ${n[k]}`,`<span dir="ltr">${A7_conn(b)}</span>`,k===R.ir?true:undefined)).join(''),true)+
      (P.ways==='22'?det('מנוע',row('',`n = Q·1000/V_g = ${P.Q}·1000/${A7_VG} = ${V(P.Q*1000/A7_VG,'rpm')}`)+row('',`Δp = 20π·T/V_g = 20π·${P.Tq}/${A7_VG} = ${V(20*PI*P.Tq/A7_VG,'bar')}`),true):
      det('צילינדר',row('',`A₁ = ${V(A1,'mm²')} · A₂ = ${V(A2,'mm²')}`)+row('יציאה',`v = Q/A₁ = ${fr(P.Q+'·10⁶/60',fmt(A1,0))} = ${V(H.v(P.Q,A1),'mm/s')}`)+(P.ways!=='32'?row('חזרה',`v = Q/A₂ = ${V(H.v(P.Q,A2),'mm/s')}`):row('חזרה בקפיץ',`p_A = 10(F + F_s)/A₁ = ${V(10*(P.F+A7_FS)/A1,'bar')}`))+row('לחץ החזקה',`p = 10F/A₁ = ${V(R.hold,'bar')}`),true))+
      det('מפלי לחץ בשסתום',row('מעבר מלא',`k_v = Q/√3 ⇒ Δp = 3 bar בספיקה נומינלית`)+row('פריקה P→T (פתוח/טנדם)',`Δp = (Q/k_u)², k_u = 0.6·k_v ⇒ ${V((P.Q/(P.Q/Math.sqrt(3)*.6))**2,'bar')}`)+row('ספיקה דרך שסתום הפריקה',`P_heat = p·Q/600 = ${fmt(R.ps,1)}·${fmt(R.Qr,1)}/600 = ${V(H.kW(R.ps,R.Qr),'kW',3)}`))+
      `<div class="note">החתך פשטני: 5 תאים (T A P B T) וצווארונים בכיסוי חיובי (overlap). בטנדם המעבר P→T במרכז מסומן כקדח בספול.</div>`;},
  demo:[{t:'סמל וחתך',x:'משמאל סמל ISO של שסתום 4/3, מימין חתך הגוף והספול. כל ריבוע בסמל הוא <b>מצב</b> אחד של הספול, וכל פתח (P, T, A, B) הוא <b>דרך</b>.',reset:true,set:{auto:false,pos:'0'},hl:['V1','SP'],dur:9},
    {t:'מצב a – יציאה',x:'הסולנואיד a מושך את הספול: החריץ מחבר P→A ו-B→T. השמן נכנס לצד המלא והבוכנה יוצאת.',set:{pos:'a'},hl:['SP','C1'],dur:7},
    {t:'מרכז סגור',x:'בלי זרם הקפיצים ממרכזים את הספול. כל הפתחים חסומים: הצילינדר נעול, אבל המשאבה דוחפת הכול דרך שסתום הפריקה – חום.',set:{pos:'0'},hl:['SP','RV','GP']},
    {t:'מרכז פתוח',x:'צווארונים צרים מהתאים – הכול מחובר במרכז. המשאבה פורקת בלחץ נמוך, אבל העומס דוחף את הבוכנה פנימה.',set:{cen:'open'},act:(P,st)=>{st.x=200;},hl:['SP','C1','GP']},
    {t:'מרכז טנדם',x:'P→T דרך קדח בספול, A ו-B חסומים: גם פריקת משאבה וגם נעילת הצילינדר. נפוץ במכונות ניידות.',set:{cen:'tandem'},act:(P,st)=>{st.x=200;},hl:['SP','GP','C1']},
    {t:'מרכז צף',x:'P חסום, A ו-B מחוברים ל-T: הצילינדר חופשי לזוז (למשל לפני אל-חוזר מפוקד), והמשאבה על שסתום הפריקה.',set:{cen:'float'},act:(P,st)=>{st.x=200;},hl:['SP','C1']},
    {t:'3/2 וצילינדר חד-פעולה',x:'שלוש דרכים: P, A, T. מופעל – P→A והבוכנה יוצאת; בלי זרם – A→T והקפיץ מחזיר. בצד P אין לאן לזרום: המשאבה על שסתום הפריקה.',reset:true,set:{ways:'32'},hl:['V1','SP','C1'],dur:9},
    {t:'2/2 ומנוע',x:'שתי דרכים: פתוח או סגור. כאן השסתום מפעיל ועוצר מנוע הידראולי.',reset:true,set:{ways:'22'},hl:['V1','M1'],dur:8}],
  predict:[{q:'4/3 עם מרכז טנדם, הידית במרכז. מה יראה מד לחץ המשאבה?',set:{cen:'tandem',pos:'0',auto:false},opts:['לחץ הכיול של שסתום הפריקה','לחץ נמוך – המשאבה פורקת','0 בדיוק'],a:1,why:'במרכז טנדם P מחובר ל-T, ולכן הלחץ הוא רק מפל הלחץ במעבר (כ-8 bar כאן).'},
    {q:'מרכז צף, הבוכנה בחוץ ויש עומס של 1000 N שדוחף פנימה. מה יקרה במרכז?',set:{cen:'float',pos:'0',auto:false},act:(P,st)=>{st.x=200;},opts:['הבוכנה תישאר במקום','הבוכנה תיכנס פנימה','הבוכנה תצא'],a:1,why:'A ו-B מחוברים למיכל – שום דבר לא מחזיק את השמן בצד המלא, והעומס דוחף אותו החוצה.'},
    {q:'שסתום 3/2 עם צילינדר חד-פעולה. מנתקים את הזרם כשהבוכנה בחוץ. מה יעשה מד המשאבה?',set:{ways:'32',pos:'0',auto:false},act:(P,st)=>{st.x=200;st.si=0;},opts:['יירד ל-0','יעלה לכיול שסתום הפריקה','לא ישתנה'],a:1,why:'במצב הרגיל A→T ו-P חסום. המשאבה ממשיכה לדחוף, ולכן הלחץ עולה עד ששסתום הפריקה נפתח.'},
    {q:'שסתום 4/2 עם קפיץ. מפסיקים את הזרם כשהבוכנה באמצע. מה יקרה?',set:{ways:'42',pos:'a',auto:false},act:(P,st)=>{st.x=100;P.pos='0';},opts:['תעצור באמצע','תחזור פנימה עד הסוף','תמשיך לצאת'],a:1,why:'ל-4/2 אין מצב אמצע. הקפיץ מחזיר את הספול למצב P→B, A→T – והבוכנה חוזרת.'}],
  tasks:[{q:P=>`Q = ${P.Q} L/min, צילינדר Ø${P.D}. מה מהירות היציאה במצב a?`,a:P=>H.v(P.Q,H.A(P.D)),u:'mm/s',hint:'v = Q/A₁.',rand:P=>{P.Q=rnd(8,60,1);P.D=pick([40,50,63,80]);P.dr=Math.round(P.D*.56);}},
    {q:P=>`מרכז סגור, Q = ${P.Q} L/min, שסתום הפריקה פתוח ב-${P.pr} bar. כמה הספק הופך לחום (בלי תוספת פתיחה)?`,a:P=>P.pr*P.Q/600,u:'kW',hint:'P = p·Q/600.',rand:P=>{P.Q=rnd(10,80,5);P.pr=rnd(80,250,10);}},
    {q:P=>`במצב b (חזרה) בצילינדר Ø${P.D}/${P.dr} עם Q = ${P.Q} L/min. כמה שמן יוצא לקו T?`,a:P=>P.Q*H.A(P.D)/H.Aann(P.D,P.dr),u:'L/min',hint:'Q_T = Q·A₁/A₂.',rand:P=>{P.D=pick([40,50,63,80]);P.dr=Math.round(P.D*pick([.5,.56,.7]));P.Q=rnd(10,50,1);}},
    {q:P=>`עומס ${P.F} N על צילינדר Ø${P.D} במרכז סגור. איזה לחץ יראה מד קו A?`,a:P=>10*P.F/H.A(P.D),u:'bar',hint:'p = F/A₁ (×10 ל-bar).',rand:P=>{P.F=rnd(500,15000,100);P.D=pick([40,50,63,80,100]);}}],
  faults:[{id:'stuck',t:'ספול תקוע (לכלוך / עיוות גוף)',sym:'"הנורית של הסולנואיד דולקת, אבל הצילינדר לא זז לשום כיוון, והמשאבה מרעישה."',hint:'הסתכלו על הספול בחתך כשהסולנואיד מופעל, ועל לחץ המשאבה.',why:'הסולנואיד מקבל זרם אך הספול לא זז ממרכז סגור – כל הספיקה עוברת בשסתום הפריקה. מפרקים, מנקים ובודקים שהברגים לא מעקמים את הגוף.'},
    {id:'wear',t:'ספול שחוק – זליגה פנימית גדולה',sym:'"הצילינדר איטי יותר, ובמרכז העומס שוקע לאט."',hint:'השוו את מהירות היציאה ל-Q/A₁, ובדקו את המיקום כשהשסתום במרכז.',why:'מרווח גדול בין הספול לגוף: חלק מהספיקה זולג P→T ו-A→T. המהירות יורדת והצילינדר לא מחזיק עומס במרכז.'},
    {id:'coilb',t:'סליל סולנואיד b שרוף',sym:'"הבוכנה יוצאת, אבל לא חוזרת. כשמבקשים חזרה – המשאבה עולה ללחץ מלא."',hint:'בדקו מה עושה הספול בחתך בכל אחד מהמצבים.',why:'במצב a הספול זז, אבל בפקודה b הוא נשאר באמצע: הסליל לא מושך. מודדים התנגדות הסליל ומתח במחבר.'}],
  test(H){const P=clone(this.P);P.auto=false;const {R}=runSim(this,P,.5);const P2=clone(this.P);P2.auto=false;P2.pos='0';const s2=this.init(P2);s2.x=100;let R2;for(let t=0;t<.5;t+=.02)R2=this.step(P2,s2,.02,{});
    const P3=clone(this.P);P3.auto=false;P3.pos='0';P3.cen='tandem';const R3=runSim(this,P3,.5).R;
    const P4=clone(this.P);P4.auto=false;P4.ways='32';P4.pos='0';const s4=this.init(P4);s4.x=150;s4.si=1;let R4;for(let t=0;t<.1;t+=.02)R4=this.step(P4,s4,.02,{});
    const A1=H.A(50),pA4=10*(1000+A7_FS)/A1;
    return [['v יציאה = Q/A₁',R.v,H.v(20,A1)],['מרכז סגור: p = p_r + Δp_ov',R2.ps,106],['טנדם: Δp = (Q/k_u)²',R3.ps,3/.36],['החזקה p = F/A₁',R2.pA,10*1000/A1],
      ['3/2 חזרה בקפיץ',-R4.v,H.v(20/Math.sqrt(3)*Math.sqrt(pA4),A1)],['UI מהירות',R.read[3].v,R.v]];}};

/* ---------- 23 · pilot-operated (two-stage) DCV ---------- */
const A7_AS=H.A(16),A7_XS=8,A7_OV=2;
const A7_ch=c=>Math.max(.004,.3*c/100);             // choke opening % → area mm²
function A7_vSh(k,p){return p>0?H.v(k*Math.sqrt(p),A7_AS):0;} // spool speed mm/s from ויסות ביציאה (meter-out) flow
function A7_tShift(pX,c,F0,ks,fr=.95){let t=0;const n=400,k=H.orK(A7_ch(c)),X=fr*A7_XS;for(let i=0;i<n;i++){const x=(i+.5)*X/n;const v=A7_vSh(k,pX-10*(F0+ks*x)/A7_AS);if(v<=0)return Infinity;t+=X/n/v;}return t;} // time to 95 % stroke
const A7_SIM_PDCV={id:'pilotdcv',n:23,t:'שסתום פיקוד דו-שלבי',d:'סולנואיד קטן מזיז ספול ראשי גדול בעזרת פיקוד; צמצמי פיקוד קובעות את זמן המעבר',
  P:{pos:'a',auto:true,pX:30,cA:30,cB:30,F0:100,ks:15,Q:60,D:80,dr:45,F:5000,pr:150},
  ui(U,P){U.grp('פיקוד');U.seg(P,'pos','סולנואידים',[['a','◀ a','סולנואיד a מופעל'],['0','■ 0','ללא זרם'],['b','b ▶','סולנואיד b מופעל']]);U.chk(P,'auto','מחזור אוטומטי');
    U.num(P,'pX','לחץ פיקוד p_X','bar',{min:2,max:100,step:1});
    U.grp('צמצמי פיקוד (meter-out)');U.num(P,'cA','פתיחת צמצם צד a','%',{min:1,max:100,step:1});U.num(P,'cB','פתיחת צמצם צד b','%',{min:1,max:100,step:1});
    U.grp('ספול ראשי וקפיצים',false);U.num(P,'F0','כוח דריכה מוקדמת F₀','N',{min:0,max:400,step:10});U.num(P,'ks','קשיחות קפיץ','N/mm',{min:0,max:60,step:1});U.note('ספול ראשי Ø16 (A = 201 mm²), מהלך ±8 mm, כיסוי 2 mm.');
    U.grp('צרכן',false);U.num(P,'Q','ספיקת משאבה','L/min',{min:5,max:200,step:5});U.num(P,'F','עומס','N',{min:0,max:40000,step:500});U.num(P,'pr','כיול שסתום פריקה','bar',{min:30,max:300,step:5});},
  circuit(P){return {comps:[{id:'C1',type:'cyl',x:300,y:50,o:{load:{t:'F'}},name:'צילינדר',lbl:'צילינדר',lblAt:[-84,-20],l3:[0,-34]},
      {id:'GA',type:'gauge',x:270,y:88,net:'A',name:'מד לחץ קו A',valAt:[-16,-2]},{id:'GB',type:'gauge',x:330,y:88,net:'B',name:'מד לחץ קו B'},
      {id:'V1',type:'dcv',x:300,y:170,o:{box:KIT.D43.closed,L:'pilot',R:'pilot',center:true},name:'שלב ראשי: ספול גדול מפוקד',lbl:'שלב ראשי',lblAt:[0,-24],l3:[0,-34]},
      {id:'TA',type:'throttle1',x:160,y:170,rot:90,name:'צמצם פיקוד צד a (זרימה חופשית פנימה, צמצם ביציאה)',lbl:'צמצם a',lblAt:[0,-42]},
      {id:'TB',type:'throttle1',x:440,y:170,rot:-90,name:'צמצם פיקוד צד b',lbl:'צמצם b',lblAt:[0,-42]},
      {id:'GXA',type:'gauge',x:204,y:158,net:'Xa',name:'מד לחץ בתא a של הספול הראשי',valAt:[14,-16]},{id:'GXB',type:'gauge',x:396,y:158,net:'Xb',name:'מד לחץ בתא b של הספול הראשי',valAt:[-14,-16]},
      {id:'V2',type:'dcv',x:300,y:270,o:{box:KIT.D43.float,L:'sol',R:'sol',center:true},name:'שלב פיקוד: שסתום סולנואיד קטן (מרכז Y: A,B→T)',lbl:'שלב פיקוד',lblAt:[0,40],l3:[0,-30]},
      {id:'SX',type:'a7_src',x:293,y:342,o:{t:'X'},name:'אספקת פיקוד (X)',lbl:'X',lblAt:[-22,4],val:R=>`${fmt(R.pXs,0)} bar`,valAt:[18,4]},{id:'T4',type:'tank',x:340,y:322,name:'ניקוז פיקוד Y'},
      {id:'P1',type:'pump',x:200,y:340,name:'משאבה ראשית',lbl:'משאבה',lblAt:[-30,32]},{id:'T1',type:'tank',x:200,y:382,name:'מיכל'},
      {id:'RV',type:'pv',x:150,y:290,rot:-90,o:{kind:'relief'},name:'שסתום פריקה',lbl:'פריקה',lblAt:[0,-28]},{id:'T2',type:'tank',x:100,y:320,name:'מיכל'},{id:'T3',type:'tank',x:520,y:240,name:'מיכל'},
      {id:'GP',type:'gauge',x:212,y:255,rot:90,net:'P',name:'מד לחץ משאבה',valAt:[16,10]},
      {id:'CH',type:'a7_chart',x:405,y:288,o:{w:140,h:58,t:'מיקום הספול הראשי x(t)',xl:'זמן [s]',yl:'x [mm]',col:['#94a3b8','#0b72d9'],dash:['4 3',''],sw:[1.3,2]},name:'גרף: פקודה (מקווקו) ומיקום הספול הראשי'}],
     lines:[{id:'LS',net:'S',pts:['T1.t','P1.in']},{id:'LP',net:'P',pts:['P1.out',[200,215],[293,215],'V1.P']},{id:'LRV',net:'P',pts:[[200,290],'RV.P']},{id:'LRT',net:'T',pts:['RV.T',[100,290],'T2.t']},
      {id:'LT',net:'T',pts:['V1.T',[307,215],[520,215],'T3.t']},{id:'LA',net:'A',pts:['V1.A',[293,100],[250,100],'C1.A']},{id:'LB',net:'B',pts:['V1.B',[307,100],[350,100],'C1.B']},
      {id:'LXA1',net:'Ya',kind:'pilot',pts:['V2.A',[293,236],[110,236],[110,170],'TA.in']},{id:'LXA2',net:'Xa',kind:'pilot',pts:['TA.out',[219,170]],nodot:true},
      {id:'LXB1',net:'Yb',kind:'pilot',pts:['V2.B',[307,236],[490,236],[490,170],'TB.in']},{id:'LXB2',net:'Xb',kind:'pilot',pts:['TB.out',[381,170]],nodot:true},
      {id:'LXP',net:'X',kind:'pilot',pts:['SX.o','V2.P']},{id:'LXT',net:'T',kind:'drain',pts:['V2.T',[307,302],[340,302],'T4.t']}]};},
  init:P=>({xm:0,y:0,tc:0,t:0,tr:[],pi:KIT.idx[P.pos],cmd:null,tsh:null,tret:null}),
  click(id,P){if(id==='V2'||id==='V1'){P.pos=P.pos==='a'?'0':P.pos==='0'?'b':'a';P.auto=false;return true;}},
  step(P,st,dt,ctx){const f=ctx.fault,S=300,A1=H.A(P.D),A2=H.Aann(P.D,Math.min(P.dr,P.D-4));
    const e0=(st.dir>0&&st.y>=S-1e-6)||(st.dir<0&&st.y<=1e-6)||(st.dir===0&&st.tc>1.5);A7_seq(P,st,dt,e0,1.2);
    const cmd=KIT.dirOf(P.pos);if(st.cmd!==cmd){st.cmd=cmd;st.tc=0;st.done=false;}st.tc+=dt;st.t+=dt;KIT.ease(st,'pi',KIT.idx[P.pos],dt,25);
    const pX=f==='lowpx'?8:P.pX,kA=H.orK(A7_ch(P.cA)),kB=H.orK(A7_ch(P.cB)*(f==='clog'?.06:1));
    const Fs=x=>(f==='spring'&&x>0)?0:P.F0+P.ks*Math.abs(x);let x=st.xm,v=0,pa=0,pb=0,qa=0,qb=0;
    if(cmd>0){pa=pX;const p=pX-10*(x>=0?Fs(x):-Fs(x))/A7_AS;if(x<A7_XS&&p>0){v=A7_vSh(kB,p);pb=p;qb=kB*Math.sqrt(p);}}
    else if(cmd<0){pb=pX;const p=pX-10*(x<=0?Fs(x):-Fs(x))/A7_AS;if(x>-A7_XS&&p>0){v=-A7_vSh(kA,p);pa=p;qa=kA*Math.sqrt(p);}}
    else if(x>1e-6){const p=10*Fs(x)/A7_AS;v=-A7_vSh(kA,p);pa=p;qa=kA*Math.sqrt(p);}
    else if(x<-1e-6){const p=10*Fs(x)/A7_AS;v=A7_vSh(kB,p);pb=p;qb=kB*Math.sqrt(p);}
    let xn=clamp(x+v*dt,-A7_XS,A7_XS);if(cmd===0&&x*xn<0)xn=0;if(cmd===0&&Math.abs(xn)<1e-3)xn=0;st.xm=xn;x=xn;
    if(!st.done&&dt>0){if(cmd!==0&&Math.abs(x)>=.95*A7_XS){st.tsh=st.tc;st.done=true;}else if(cmd===0&&Math.abs(x)<.2&&st.tc>dt){st.tret=st.tc;st.done=true;}}
    const o=clamp((Math.abs(x)-A7_OV)/(A7_XS-A7_OV),0,1),kM=P.Q/Math.sqrt(5)*o,hold=10*P.F/A1;let ps,pA=st.y>0?hold:0,pB=0,vc=0,qA=0,qB=0,qT=0,Qr=0;
    if(o<.01){ps=A7_dead(P.Q,P.pr,0);Qr=P.Q;}
    else if(x>0){const end=st.y>=S-1e-6;const r=H.lin({Qp:P.Q,pr:P.pr,Ain:A1,Aout:A2,F:end?1e9:P.F,kIn:kM,kOut:kM});ps=r.ps;pA=r.stall?r.ps:r.pIn;pB=r.pOut;vc=r.v;qA=r.Qin;qB=-r.Qout;qT=r.Qout;Qr=r.Qr;st.dir=1;}
    else{const end=st.y<=1e-6;const r=H.lin({Qp:P.Q,pr:P.pr,Ain:A2,Aout:A1,F:end?1e9:-P.F,kIn:kM,kOut:kM,vRun:H.v(P.Q,A2)*3});ps=r.ps;pB=r.stall?r.ps:r.pIn;pA=r.pOut;vc=-r.v;qB=r.Qin;qA=-r.Qout;qT=r.Qout;Qr=r.Qr;st.dir=-1;}
    if(cmd===0&&o<.01)st.dir=0;st.y=clamp(st.y+vc*dt,0,S);KIT.rpmAng(st,dt,1450);
    if(dt>0){st.trT=(st.trT||0)+dt;if(st.trT>.03){st.trT=0;st.tr.push([st.t,x,cmd*A7_XS]);while(st.tr.length&&st.tr[0][0]<st.t-5)st.tr.shift();}}
    const t0=Math.max(0,st.t-5),pm=P.pr,Fpil=pX*A7_AS/10;
    return {x,o,ps,pA,pB,pa,pb,vc,cmd,Fpil,pX,tsh:st.tsh,tret:st.tret,A1,A2,hold,kA,kB,
      p:{P:ps,A:pA,B:pB,T:Math.min(1,qT/P.Q),S:-.05,X:pX,Xa:pa,Xb:pb,Ya:cmd>0?pX:pa*.3,Yb:cmd<0?pX:pb*.3},pXs:pX,
      q:{LS:P.Q,LP:P.Q-Qr,LRV:Qr,LRT:Qr,LA:qA,LB:qB,LT:qT},pmax:pm,qref:P.Q,
      c:{C1:{x:st.y/S,uA:pA/pm,uB:pB/pm,lt:`F ${fmt(P.F/1000,1)} kN`},V1:{i:1-x/A7_XS},V2:{i:st.pi},P1:{on:true,ang:st.ang},RV:{open:clamp(Qr/P.Q,0,1)},TA:{knob:P.cA/25,chk:cmd>0?1:0},TB:{knob:P.cB/25,chk:cmd<0?1:0},
        CH:{xm:5,ym:2*A7_XS,y0:-A7_XS,xd:1,L:[st.tr.map(q=>[q[0]-t0,q[2]]),st.tr.map(q=>[q[0]-t0,q[1]])],dot:[st.t-t0,x]}},
      read:[{k:'מיקום ספול ראשי x',v:x,u:'mm',max:A7_XS,dg:2},{k:'זמן מעבר אחרון',v:st.tsh??0,u:'s',dg:2,max:2},{k:'זמן חזרה למרכז',v:st.tret??0,u:'s',dg:2,max:2},
        {k:'לחץ בתא a',v:pa,u:'bar'},{k:'לחץ בתא b',v:pb,u:'bar'},{k:'מהירות בוכנה',v:vc,u:'mm/s',max:H.v(P.Q,A2)},{k:'לחץ משאבה',v:ps,u:'bar'}]};},
  ins(P,R){const L=[];L.push({ic:'💪',h:`הפיקוד (${fmt(R.pX,0)} bar) על קצה ספול Ø16 נותן <b>${fmt(R.Fpil,0)} N</b>. סולנואיד ישיר נותן רק כ-50–100 N – לכן בספיקה של ${fmt(P.Q,0)} L/min משתמשים בשני שלבים.`,at:'V1'});
    const ta=A7_tShift(R.pX,P.cB,P.F0,P.ks),tb=A7_tShift(R.pX,P.cA,P.F0,P.ks);
    L.push({ic:'⏱',h:`מעבר ל-a: השמן יוצא מתא b דרך צמצם b (${P.cB}%) – כ-<b>${isFinite(ta)?fmt(ta,2)+' s':'לא מגיע לסוף'}</b>. מעבר ל-b נקבע בצמצם a (${P.cA}%) – ${isFinite(tb)?fmt(tb,2)+' s':'לא מגיע'}.`,at:R.cmd>0?'TB':'TA'});
    if(R.cmd!==0&&Math.abs(R.x)<.95*A7_XS&&(R.cmd>0?R.pb:R.pa)===0)L.push({ic:'⚠️',w:true,at:'V1',h:`הספול נעצר ב-${fmt(R.x,1)} mm: הפיקוד לא מתגבר על הקפיץ (צריך ${fmt(10*(P.F0+P.ks*A7_XS)/A7_AS,1)} bar למהלך מלא). השסתום פתוח רק ${fmt(R.o*100,0)}%.`,c:'הספול הראשי לא מגיע לסוף המהלך'});
    if(R.cmd===0&&Math.abs(R.x)>A7_OV)L.push({ic:'⚠️',w:true,at:'V1',h:`אין פקודה, אבל הספול הראשי עדיין ב-${fmt(R.x,1)} mm – הצילינדר ממשיך לקבל שמן.`,c:'הספול לא חוזר למרכז'});
    L.push({ic:'🐢',h:`מעבר איטי = האצה רכה של הצילינדר ופחות מכות לחץ. החזרה למרכז נעשית רק בכוח הקפיץ (${fmt(10*P.F0/A7_AS,1)}–${fmt(10*(P.F0+P.ks*A7_XS)/A7_AS,1)} bar), ולכן היא איטית יותר מהמעבר.`});
    L.push({ic:'🔁',h:'בשלב הפיקוד מרכז Y (A,B→T): בלי זרם שני תאי הספול הראשי מתרוקנים למיכל והקפיצים ממרכזים אותו.',at:'V2'});return L;},
  calc(P,R){const As=A7_AS,pf=10*(P.F0+P.ks*A7_XS)/As,ta=A7_tShift(R.pX,P.cB,P.F0,P.ks),kB=H.orK(A7_ch(P.cB));
    return `<div class="kpis">${kpi('כוח פיקוד',fmt(R.Fpil,0),'N')}${kpi('פיקוד למהלך מלא',fmt(pf,1),'bar')}${kpi('זמן מעבר ל-a',isFinite(ta)?fmt(ta,2):'∞','s')}${kpi('פתיחת שסתום',fmt(R.o*100,0),'%')}</div>`+
      det('כוחות על הספול הראשי',row('שטח',`A_s = π·16²/4 = ${V(As,'mm²')}`)+row('כוח פיקוד',`F = p_X·A_s/10 = ${fmt(R.pX,0)}·${fmt(As,0)}/10 = ${V(R.Fpil,'N')}`)+row('קפיץ',`F_s = F₀ + k·x = ${P.F0} + ${P.ks}·x ⇒ במהלך מלא ${V(P.F0+P.ks*A7_XS,'N')}`)+row('פיקוד מינימלי למהלך מלא',`p = 10·F_s/A_s = ${V(pf,'bar')}`,R.pX>pf),true)+
      det('מהירות הספול (צמצם ביציאה)',row('לחץ בתא היוצא',`p_out = p_X − 10·F_s(x)/A_s`)+row('ספיקה בצמצם',`Q = k·√p_out, k = 0.637·A₀ = 0.637·${fmt(A7_ch(P.cB),3)} = ${V(kB,'L/min/√bar',4)}`)+row('מהירות',`v = Q/A_s ⇒ באמצע המהלך (x = 4): ${V(A7_vSh(kB,R.pX-10*(P.F0+P.ks*4)/As),'mm/s')}`)+row('זמן (עד 95% מהמהלך)',`t = ∫dx/v ≈ ${isFinite(ta)?V(ta,'s',3):'∞'}`),true)+
      det('פתיחת המעבר הראשי',row('',`כיסוי ${A7_OV} mm: פתיחה = (|x| − ${A7_OV})/${A7_XS-A7_OV} = ${V(R.o*100,'%',0)}`)+row('',`k_main = (Q/√5)·פתיחה – Δp = 5 bar בפתיחה מלאה`))+`<div class="note">פתח הצמצם: A₀ = 0.3 mm² × אחוז הפתיחה. בגרף: קו מקווקו = פקודה, קו כחול = מיקום הספול.</div>`;},
  demo:[{t:'שני שלבים',x:'למטה <b>שלב פיקוד</b>: שסתום סולנואיד קטן. למעלה <b>שלב ראשי</b>: ספול גדול שמופעל בלחץ פיקוד. ביניהם צמצמי פיקוד.',reset:true,set:{pos:'0',auto:false},hl:['V2','V1'],dur:8},
    {t:'מפעילים סולנואיד a',x:'השסתום הקטן שולח לחץ פיקוד לתא a של הספול הראשי. הכוח (כ-600 N) גדול פי 6–10 מכוח סולנואיד – והספול הגדול זז.',set:{pos:'a'},hl:['V2','GXA','V1'],dur:7},
    {t:'מי קובע את הקצב?',x:'השמן שבתא b חייב לצאת דרך <b>צמצם b</b>. הצמצם מגביל את הספיקה – ולכן את מהירות הספול. ראו את הגרף.',hl:['TB','CH'],dur:7},
    {t:'מחזור אוטומטי',x:'המחזור a → 0 → b → 0. בגרף רואים את הפקודה (מקווקו) ואת הספול שמגיע אחריה בהשהיה.',set:{auto:true},reset:false,hl:['CH'],dur:9},
    {t:'סוגרים את צמצם b',x:'צמצם b ב-5%: המעבר ל-a נמשך יותר משתי שניות, אבל המעבר ל-b לא השתנה. כך מכוונים "רכות" שונה לכל כיוון.',set:{cB:5},hl:['TB','CH','C1'],dur:10},
    {t:'לחץ פיקוד נמוך',x:'p_X = 9 bar: הפיקוד בקושי מתגבר על הקפיץ. הספול לא מגיע לסוף המהלך והצילינדר איטי.',set:{cB:30,pX:9},hl:['SX','V1'],dur:9}],
  predict:[{q:'סוגרים את צמצם b ל-5% ומפעילים סולנואיד a. מה יקרה לזמן המעבר של הספול הראשי?',set:{pos:'0',auto:false,cB:5},go:P=>{P.pos='a';},opts:['יתקצר','יתארך מאוד','לא ישתנה – הצמצם בצד השני'],a:1,dur:5,why:'במעבר ל-a השמן יוצא מתא b דרך צמצם b. פתח קטן = ספיקה קטנה = ספול איטי (בערך פי 6).'},
    {q:'סוגרים את צמצם a ל-5% ומפעילים סולנואיד a. מה יקרה לזמן המעבר?',set:{pos:'0',auto:false,cA:5},go:P=>{P.pos='a';},opts:['יתארך מאוד','כמעט לא ישתנה','הספול לא יזוז'],a:1,why:'בכיוון הכניסה לצמצם a יש אל-חוזר שעוקף אותו. הוא משפיע רק כשהשמן יוצא מתא a – בחזרה למרכז או במעבר ל-b.'},
    {q:'מורידים את לחץ הפיקוד ל-8 bar (למהלך מלא צריך כ-11 bar). מה יקרה כשמפעילים a?',set:{pos:'0',auto:false,pX:8},go:P=>{P.pos='a';},opts:['הספול יגיע לסוף לאט','הספול ייעצר באמצע והצילינדר איטי','הספול לא יזוז בכלל'],a:1,why:'הספול זז עד שכוח הקפיץ שווה לכוח הפיקוד: x = (p_X·A_s/10 − F₀)/k ≈ 4 mm. הפתיחה חלקית והספיקה לצילינדר קטנה.'}],
  tasks:[{q:P=>`ספול ראשי Ø${P.dr>40?20:16} מ"מ, לחץ פיקוד ${P.pX} bar. מה כוח הפיקוד על הספול?`,a:P=>P.pX*H.A(P.dr>40?20:16)/10,u:'N',hint:'F = p·A/10 (bar, mm² → N).',rand:P=>{P.pX=rnd(10,60,5);P.dr=pick([36,45]);}},
    {q:P=>`קפיץ מרכוז: F₀ = ${P.F0} N, k = ${P.ks} N/mm, מהלך 8 mm, ספול Ø16. מה לחץ הפיקוד המינימלי למהלך מלא?`,a:P=>10*(P.F0+P.ks*8)/A7_AS,u:'bar',hint:'p = 10·(F₀ + k·8)/A_s.',rand:P=>{P.F0=rnd(50,250,10);P.ks=rnd(5,40,1);}},
    {q:P=>`בצמצם הפיקוד עוברים ${fmt(P.Q/100,2)} L/min. מה מהירות הספול Ø16?`,a:P=>H.v(P.Q/100,A7_AS),u:'mm/s',hint:'v = Q/A_s, A_s = 201 mm².',rand:P=>{P.Q=rnd(20,150,5);}},
    {q:P=>`צמצם עם k = ${fmt(P.cB/100,2)} L/min/√bar ומפל לחץ של 16 bar. כמה זמן ייקח לספול Ø16 לעבור 8 mm (מפל קבוע)?`,a:P=>8/H.v(P.cB/100*4,A7_AS),u:'s',hint:'Q = k·√Δp, v = Q/A_s, t = s/v.',rand:P=>{P.cB=rnd(5,40,1);}}],
  faults:[{id:'clog',t:'צמצם פיקוד b סתום',sym:'"הצילינדר יוצא באיחור של כמה שניות, אבל חוזר בזמן."',hint:'השוו את זמן המעבר לכל כיוון ואת הלחץ בתא b בזמן המעבר.',why:'במעבר ל-a השמן יוצא מתא b דרך צמצם b. לכלוך סוגר את הפתח, הספיקה זעירה והספול זוחל. בכיוון השני הצמצם עקוף באל-חוזר.'},
    {id:'spring',t:'קפיץ מרכוז שבור (צד a)',sym:'"ניתקנו את הזרם – והצילינדר ממשיך לצאת עד הסוף."',hint:'מה מראה מיקום הספול הראשי כשאין פקודה?',why:'אחרי מצב a אין כוח שמחזיר את הספול למרכז. הספול נשאר פתוח, המעבר P→A נשאר פתוח והצילינדר לא נעצר.'},
    {id:'lowpx',t:'לחץ פיקוד נמוך (מקור X / ווסת לחץ)',sym:'"בזמן תנועה לחץ המשאבה גבוה בהרבה מהרגיל, השמן מתחמם, ועם עומס כבד הצילינדר מאט."',hint:'בדקו את הלחץ בתאי הספול ואת מיקום הספול הראשי בזמן פקודה.',why:'רק 8 bar פיקוד: הספול נעצר בכ-4 mm, שם כוח הקפיץ שווה לכוח הפיקוד. המעבר הראשי פתוח רק כשליש – מפל לחץ גדול (חום), ובעומס גבוה הלחץ מגיע לשסתום הפריקה והמהירות יורדת.'}],
  test(H){const P=clone(this.P);P.auto=false;P.pos='a';const {R,st}=runSim(this,P,1.2,.002);const P2=clone(this.P);P2.auto=false;P2.pos='a';P2.pX=8;const R2=runSim(this,P2,3,.01).R;
    const xeq=(8*A7_AS/10-100)/15;return [['זמן מעבר = ∫dx/v',st.tsh,A7_tShift(30,30,100,15),.03],['כוח פיקוד F = p·A',R.Fpil,30*PI*16*16/4/10],['שיווי משקל בפיקוד נמוך',R2.x,xeq,.03],
      ['v צילינדר = Q/A₁ בפתיחה מלאה',R.vc,H.v(60,H.A(80))],['UI מיקום ספול',R.read[0].v,R.x]];}};

/* ---------- 24 · direct-acting relief valve ---------- */
/* vertical cut-away: inlet P from below, cone poppet on seat, spring + adjusting screw above. cs={L 0..1,u,adj 0..1} */
SYM.a7_rvcut={ports:o=>({}),bb:o=>[-44,-108,44,74],
  draw(g,o){A7_R(g,-30,-78,60,140,A7_MET,'syb');const fl=(x,y,w,h)=>A7_R(g,x,y,w,h,'#93c5fd','sy thin');
    const pin=[fl(-6,24,12,38)],out=[fl(-22,-12,44,34),fl(22,4,8,12)];A7_R(g,-22,-62,44,50,'#f8fafc','sy thin');
    const jet=fl(-9,18,18,6);const pop=sv('g',{},g);SP(pop,'M0,26 L-13,12 L-13,-6 L13,-6 L13,12 Z','syf2');
    const sp=SP(g,'','sy thin');const plate=A7_R(g,-16,-60,32,5,'#64748b','sy thin');const scr=A7_R(g,-4,-94,8,40,'#94a3b8','sy thin');
    ST(g,0,70,'P','st b');ST(g,38,13,'T','st b');ST(g,0,-100,o.t||'','st s');
    return cs=>{cs=cs||{};const L=clamp(cs.L||0,0,1)*9,adj=clamp(cs.adj??.5,0,1)*16,yp=-60+adj;pop.setAttribute('transform',`translate(0,${-L})`);
      plate.setAttribute('y',yp);scr.setAttribute('y',yp-34);sp.setAttribute('d',zig(0,yp+5,0,-6-L,6,10));
      const c=pCss(cs.u||0);pin.forEach(r=>r.style.fill=c);jet.style.fill=c;jet.style.opacity=L>.3?1:0;out.forEach(r=>r.style.fill=pCss(L>.3?.05:0));};}};
const A7_DS=8,A7_ASR=H.A(A7_DS),A7_XMX=1.5;
const A7_kx=x=>H.orK(PI*A7_DS*Math.max(x,0));
function A7_rvPar(P,f){return {F0:P.pc*A7_ASR/10*(f==='weak'?.7:1),ks:P.ks,Ff:P.Ff*(f==='sticky'?6:1),kLk:f==='leak'?.25:0};}
const A7_pO=(c,x)=>10*(c.F0+c.ks*x+c.Ff)/A7_ASR,A7_pC=(c,x)=>10*(c.F0+c.ks*x-c.Ff)/A7_ASR;
/* quasi-static relief with Coulomb friction (stick–slip hysteresis). x0 = previous lift [mm], kL load k. */
function A7_relief(Q,kL,c,x0){const kt=x=>kL+A7_kx(x)+c.kLk;const ps=Q/Math.max(kt(x0),1e-9);const pS=ps*ps;let x=x0,p=pS;
  if(pS>A7_pO(c,x0)){const g=x=>kt(x)*Math.sqrt(A7_pO(c,x))-Q;if(g(A7_XMX)<0){x=A7_XMX;p=(Q/kt(x))**2;}else{x=H.bisect(g,x0,A7_XMX);p=A7_pO(c,x);}}
  else if(x0>0&&pS<A7_pC(c,x0)){const h=x=>kt(x)*Math.sqrt(Math.max(A7_pC(c,x),0))-Q;if(h(0)>0){x=0;p=(Q/Math.max(kt(0),1e-9))**2;}else{x=H.bisect(h,0,x0);p=A7_pC(c,x);}}
  return {x,p,QR:A7_kx(x)*Math.sqrt(p),QL:kL*Math.sqrt(p),Qk:c.kLk*Math.sqrt(p)};}
function A7_full(Q,c){const x=H.bisect(x=>A7_kx(x)*Math.sqrt(A7_pO(c,x))-Q,0,A7_XMX);return {x,p:A7_pO(c,x)};}
const A7_SIM_RELIEF={id:'relief',n:24,t:'שסתום פריקה ישיר',d:'לחץ פתיחה מול לחץ בספיקה מלאה, היסטרזיס וחום; עקום p–Q חי',
  P:{pc:100,ks:250,Ff:10,Q:30,AL:8,sweep:true,V:40},
  ui(U,P){U.grp('שסתום הפריקה');U.num(P,'pc','לחץ פתיחה (דריכת קפיץ)','bar',{min:10,max:300,step:5});U.num(P,'ks','קשיחות הקפיץ','N/mm',{min:20,max:1500,step:10});U.num(P,'Ff','חיכוך בפופט','N',{min:0,max:100,step:1});
    U.grp('מעגל');U.num(P,'Q','ספיקת משאבה','L/min',{min:2,max:120,step:1});U.num(P,'AL','פתח שסתום העומס (מקסימלי)','mm²',{min:0,max:40,step:.5});U.chk(P,'sweep','סגירה ופתיחה אוטומטית של העומס (8 s)');
    U.grp('מיכל',false);U.num(P,'V','נפח שמן במיכל','L',{min:5,max:500,step:5});U.note('תושבת Ø8 (A = 50.3 mm²). כוחות זרימה על הפופט לא נכללים.');},
  circuit(P){return {comps:[{id:'P1',type:'pump',x:100,y:300,name:'משאבה',lbl:'משאבה',lblAt:[34,6]},{id:'T1',type:'tank',x:100,y:344,name:'מיכל'},
      {id:'GP',type:'gauge',x:140,y:138,net:'P',name:'מד לחץ המערכת',valAt:[-14,-16],l3:[0,-30]},
      {id:'RV',type:'pv',x:200,y:190,rot:180,o:{kind:'relief'},name:'שסתום פריקה ישיר',lbl:'פריקה',lblAt:[-40,24],l3:[0,-30]},
      {id:'FR',type:'flowm',x:200,y:236,rot:180,name:'מד ספיקה – דרך שסתום הפריקה',val:R=>`${fmt(R.QR+R.Qk,1)} L/min`,valAt:[-16,0]},{id:'T2',type:'tank',x:200,y:272,name:'מיכל'},
      {id:'TH',type:'throttle',x:320,y:190,rot:180,name:'שסתום עומס (מדמה את הצרכן)',lbl:'עומס',lblAt:[30,0]},
      {id:'FL',type:'flowm',x:320,y:236,rot:180,name:'מד ספיקה – לצרכן',val:R=>`${fmt(R.QL,1)} L/min`,valAt:[16,0]},{id:'T3',type:'tank',x:320,y:272,name:'מיכל'},
      {id:'RC',type:'a7_rvcut',x:460,y:110,o:{t:'חתך (הרמה מוגדלת)'},name:'חתך: פופט חרוטי, קפיץ ובורג כיוון'},
      {id:'CH',type:'a7_chart',x:250,y:318,o:{w:250,h:80,t:'אופיין p–Q של שסתום הפריקה',xl:'p [bar]',yl:'Q [L/min]',col:['#0b72d9','#94a3b8','#dc2626'],dash:['','5 3',''],sw:[2,1.6,1.1]},name:'עקום p–Q: כחול פתיחה, אפור סגירה, אדום – המסלול בפועל'}],
     lines:[{id:'LS',net:'S',pts:['T1.t','P1.in']},{id:'LP',net:'P',pts:['P1.out',[100,150],[320,150],'TH.in'],tag:{at:[260,128],t:'pq'}},{id:'LRV',net:'P',pts:[[200,150],'RV.P']},
      {id:'LR2',net:'T',pts:['RV.T','FR.in']},{id:'LR3',net:'T',pts:['FR.out','T2.t']},{id:'LL2',net:'T',pts:['TH.out','FL.in']},{id:'LL3',net:'T',pts:['FL.out','T3.t']},
      {id:'LGP',net:'P',pts:[[140,150],'GP.p'],nodot:true}]};},
  init:P=>({x:0,t:0,tr:[]}),
  step(P,st,dt,ctx){const f=ctx.fault,c=A7_rvPar(P,f);st.t+=dt;const ph=(st.t%8)/8,tri=ph<.5?ph*2:2-ph*2;const AL=P.sweep?P.AL*(1-tri):P.AL;const kL=H.orK(AL);
    const r=A7_relief(P.Q,kL,c,st.x||0);st.x=r.x;const p=r.p,heat=H.kW(p,r.QR+r.Qk),dT=60*heat/(.87*P.V*1.9);
    if(dt>0){st.trT=(st.trT||0)+dt;if(st.trT>.05){st.trT=0;st.tr.push([p,r.QR]);if(st.tr.length>170)st.tr.shift();}}
    const cn=A7_rvPar(P,null),fu=A7_full(P.Q,cn),pm=Math.ceil(Math.max(fu.p,p,P.pc)*1.1/10)*10;const pO=A7_pO(cn,0),x0=Math.max(0,Math.floor(pO*.85/10)*10),x1=Math.ceil((fu.p+Math.max(10,.5*(fu.p-pO)))/10)*10;
    const crv=(fn)=>{const L=[];for(let i=0;i<=30;i++){const x=fu.x*1.3*i/30,pp=fn(cn,x);L.push([pp,A7_kx(x)*Math.sqrt(Math.max(pp,0))]);}return L;};
    return {pp:p,x:r.x,QR:r.QR,QL:r.QL,Qk:r.Qk,AL,kL,heat,dT,pc:A7_pO(cn,0)-10*cn.Ff/A7_ASR,pOpen:A7_pO(cn,0),pClose:A7_pC(cn,0),pfull:fu.p,xfull:fu.x,band:20*cn.Ff/A7_ASR,F0:cn.F0,
      p:{P:p,T:Math.min(1,(r.QR+r.QL)/P.Q),S:-.05},q:{LS:P.Q,LP:r.QL,LRV:r.QR+r.Qk,LR2:r.QR+r.Qk,LR3:r.QR+r.Qk,LL2:r.QL,LL3:r.QL},pmax:pm,qref:P.Q,
      c:{P1:{on:true,ang:KIT.rpmAng(st,dt,1450)},RV:{open:clamp(r.x/Math.max(fu.x,1e-6),0,1)},TH:{knob:AL/10},RC:{L:r.x/Math.max(fu.x,1e-6),u:p/pm,adj:clamp(P.pc/300,0,1)},
        CH:{x0,xm:x1-x0,ym:Math.ceil(P.Q*1.25/5)*5,L:[crv(A7_pO),crv(A7_pC),st.tr],dot:[p,r.QR]}},
      read:[{k:'לחץ במערכת',v:p,u:'bar'},{k:'ספיקה בשסתום הפריקה',v:r.QR+r.Qk,u:'L/min',max:P.Q},{k:'ספיקה לצרכן',v:r.QL,u:'L/min',max:P.Q},{k:'הרמת הפופט',v:r.x,u:'mm',dg:3,max:fu.x},
        {k:'לחץ בספיקה מלאה',v:fu.p,u:'bar'},{k:'חום בשסתום',v:heat,u:'kW',dg:2,max:H.kW(fu.p,P.Q),w:heat>.5*H.kW(fu.p,P.Q)},{k:'חימום השמן',v:dT,u:'K/min',dg:2,max:Math.max(dT,1)}]};},
  ins(P,R){const L=[];const ov=R.pfull-R.pOpen;
    L.push({ic:'🎯',at:'RV',h:`הקפיץ דרוך ל-<b>${fmt(R.F0,0)} N</b>: השסתום נפתח ב-${fmt(R.pOpen,1)} bar, וכדי להעביר את כל ${fmt(P.Q,0)} L/min הלחץ עולה ל-<b>${fmt(R.pfull,1)} bar</b> (עקיפה ${fmt(ov,1)} bar).`});
    if(R.QR>.05)L.push({ic:'🔥',w:R.QR>.5*P.Q,at:'FR',h:`${fmt(R.QR,1)} L/min עוברים דרך שסתום הפריקה ב-${fmt(R.pp,0)} bar → <b>${fmt(R.heat,2)} kW</b> חום. השמן (${P.V} L) מתחמם ב-${fmt(R.dT,1)} K/min.`,c:`${fmt(R.heat,1)} kW חום`});
    else L.push({ic:'✅',h:`השסתום סגור: כל הספיקה (${fmt(R.QL,1)} L/min) הולכת לצרכן, הלחץ ${fmt(R.pp,1)} bar נקבע בעומס.`});
    L.push({ic:'↔️',at:'CH',h:`חיכוך ${P.Ff} N בפופט יוצר היסטרזיס של <b>${fmt(R.band,1)} bar</b>: בעלייה הוא נפתח ב-${fmt(R.pOpen,1)} bar ובירידה נסגר רק ב-${fmt(R.pClose,1)} bar.`});
    L.push({ic:'🧷',h:`קפיץ קשיח (${P.ks} N/mm) = עקיפה גדולה. בשסתום ישיר ההרמה קטנה (${fmt(R.xfull,3)} mm), אבל כל מילימטר עולה ${fmt(10*P.ks/A7_ASR,1)} bar.`});
    if(R.Qk>.05&&R.x===0)L.push({ic:'💧',w:true,at:'FR',h:`יש ספיקה דרך שסתום הפריקה (${fmt(R.Qk,2)} L/min) למרות שהלחץ ${fmt(R.pp,0)} bar נמוך מלחץ הפתיחה!`,c:'זרימה דרך שסתום סגור'});
    L.push({ic:'💡',h:'שסתום פריקה ישיר מגיב מהר (מילישניות) – מתאים להגנה מפני שיאי לחץ. לספיקות גדולות ועקיפה קטנה משתמשים בשסתום מפוקד.'});return L;},
  calc(P,R){const c=A7_rvPar(P,null);return `<div class="kpis">${kpi('לחץ פתיחה',fmt(R.pOpen,1),'bar')}${kpi('ספיקה מלאה',fmt(R.pfull,1),'bar')}${kpi('היסטרזיס',fmt(R.band,1),'bar')}${kpi('חום',fmt(R.heat,2),'kW')}</div>`+
    det('דריכה ולחץ פתיחה',row('שטח התושבת',`A = π·${A7_DS}²/4 = ${V(A7_ASR,'mm²')}`)+row('דריכה מוקדמת',`F₀ = p_c·A/10 = ${P.pc}·${fmt(A7_ASR,1)}/10 = ${V(c.F0,'N')}`)+row('פתיחה (עם חיכוך)',`p_open = 10(F₀ + F_f)/A = ${V(R.pOpen,'bar')}`),true)+
    det('ספיקה מלאה (עקיפה)',row('פתח',`A₀ = π·d·x ⇒ Q = 0.637·π·${A7_DS}·x·√p`)+row('איזון כוחות',`p·A/10 = F₀ + k·x + F_f`)+row('פתרון ל-Q = '+P.Q+' L/min',`x = ${V(R.xfull,'mm',3)} ⇒ p = 10(${fmt(c.F0,0)} + ${P.ks}·${fmt(R.xfull,3)} + ${P.Ff})/${fmt(A7_ASR,1)} = ${V(R.pfull,'bar')}`)+row('עקיפה',`Δp_ov = ${fmt(R.pfull,1)} − ${fmt(R.pOpen,1)} = ${V(R.pfull-R.pOpen,'bar')}`),true)+
    det('היסטרזיס',row('',`Δp = 2·10·F_f/A = 2·10·${P.Ff}/${fmt(A7_ASR,1)} = ${V(R.band,'bar')}`)+row('סגירה',`p_close = 10(F₀ − F_f)/A = ${V(R.pClose,'bar')}`))+
    det('חום',row('הספק',`P = p·Q_R/600 = ${fmt(R.pp,1)}·${fmt(R.QR+R.Qk,1)}/600 = ${V(R.heat,'kW',3)}`)+row('חימום',`ΔT/min = 60·P/(m·c) = 60·${fmt(R.heat,2)}/(0.87·${P.V}·1.9) = ${V(R.dT,'K/min')}`)+row('מצב נוכחי',`Q_load = k_L·√p, k_L = 0.637·${fmt(R.AL,1)} = ${V(R.kL,'L/min/√bar',3)}`))+
    `<div class="note">ההנחות: C_d = 0.7, ρ = 870 kg/m³, c = 1.9 kJ/(kg·K), ללא קירור וללא כוחות זרימה.</div>`;},
  demo:[{t:'השסתום סגור',x:'העומס פתוח והלחץ נמוך (כ-35 bar). הקפיץ לוחץ את הפופט לתושבת וכל הספיקה הולכת לצרכן.',reset:true,set:{sweep:false},hl:['RV','RC','GP']},
    {t:'סוגרים את העומס – פתיחה',x:'פתח עומס 3 mm²: הלחץ מגיע לכ-105 bar, הכוח על הפופט עובר את הדריכה והוא מתרומם מעט. חלק מהספיקה הולך למיכל.',set:{AL:3},hl:['RC','FR']},
    {t:'ספיקה מלאה – עקיפה',x:'העומס סגור לגמרי: כל 30 L/min עוברים בשסתום. כדי לפתוח מספיק הקפיץ נדחס עוד – והלחץ גבוה מלחץ הפתיחה.',set:{AL:0},hl:['RV','GP','CH']},
    {t:'מפל לחץ = חום',x:'כ-5.5 kW נעלמים בשסתום והופכים לחום. במיכל של 40 L השמן מתחמם ביותר מ-4 מעלות בדקה!',hl:['FR','RV']},
    {t:'עקום p–Q והיסטרזיס',x:'במחזור האוטומטי העומס נסגר ונפתח. בגרף: עלייה על הקו הכחול, ירידה על האפור – הפער נובע מחיכוך.',set:{AL:8,sweep:true},hl:['CH'],dur:10},
    {t:'קפיץ קשיח יותר',x:'k = 800 N/mm: אותה דריכה, אבל עקיפה גדולה בהרבה. השסתום "פחות מדויק" ככל שהספיקה גדלה.',set:{ks:800},hl:['CH','RC'],dur:9},
    {t:'חיכוך גבוה',x:'חיכוך 40 N: לולאת ההיסטרזיס מתרחבת ל-16 bar. השסתום נפתח מאוחר ונסגר מאוחר – הלחץ "קופץ".',set:{ks:250,Ff:40},hl:['CH'],dur:10}],
  predict:[{q:'העומס סגור לגמרי וכל הספיקה עוברת בשסתום (p_c = 100 bar). מה יראה מד הלחץ?',set:{sweep:false,AL:0},opts:['בדיוק 100 bar','יותר מ-100 bar','פחות מ-100 bar'],a:1,why:'כדי להעביר ספיקה הפופט חייב להתרומם, והקפיץ נדחס עוד. לכן הלחץ = לחץ פתיחה + עקיפה (כאן כ-111 bar).'},
    {q:'מכפילים את קשיחות הקפיץ (250 → 500 N/mm) באותה דריכה. מה יקרה לעקיפה בספיקה מלאה?',set:{sweep:false,AL:0,ks:500},opts:['לא תשתנה','תגדל בערך פי 2','תקטן'],a:1,why:'העקיפה ≈ k·x/A. ההרמה כמעט זהה, ולכן העקיפה גדלה בערך פי 2 (חיכוך מוסיף עוד מעט).'},
    {q:'מעלים את לחץ הפתיחה מ-100 ל-150 bar כשהעומס סגור. מה יקרה לחום בשסתום?',set:{sweep:false,AL:0,pc:150},opts:['יגדל בכ-50%','לא ישתנה','יקטן'],a:0,why:'P = p·Q/600 ואותה ספיקה עוברת בלחץ גבוה פי 1.5 בערך.'},
    {q:'מגדילים את החיכוך בפופט. מה יקרה ללחץ שבו השסתום נסגר כשהעומס נפתח?',set:{sweep:true,Ff:40},opts:['יהיה גבוה יותר','יהיה נמוך יותר מלחץ הפתיחה','זהה ללחץ הפתיחה'],a:1,dur:8,why:'בסגירה החיכוך פועל נגד הקפיץ: p_close = 10(F₀ − F_f)/A. ההפרש בין פתיחה לסגירה הוא 2·F_f/A.'}],
  tasks:[{q:P=>`תושבת Ø${A7_DS} מ"מ, לחץ פתיחה ${P.pc} bar. מה כוח הדריכה של הקפיץ?`,a:P=>P.pc*A7_ASR/10,u:'N',hint:'F = p·A/10.',rand:P=>{P.pc=rnd(50,300,10);}},
    {q:P=>`p_c = ${P.pc} bar, k = ${P.ks} N/mm, תושבת Ø8, הרמה 0.2 mm (ללא חיכוך). מה הלחץ?`,a:P=>P.pc+10*P.ks*.2/A7_ASR,u:'bar',hint:'p = p_c + 10·k·x/A.',rand:P=>{P.pc=rnd(50,250,10);P.ks=rnd(100,800,50);}},
    {q:P=>`${P.Q} L/min עוברים בשסתום פריקה ב-${P.pc} bar. כמה חום נוצר?`,a:P=>P.pc*P.Q/600,u:'kW',hint:'P = p·Q/600.',rand:P=>{P.Q=rnd(10,100,5);P.pc=rnd(80,250,10);}},
    {q:P=>`${fmt(P.pc*P.Q/600,2)} kW חום נכנסים ל-${P.V} L שמן (ρ = 870, c = 1.9 kJ/kg·K). כמה מעלות לדקה?`,a:P=>60*(P.pc*P.Q/600)/(.87*P.V*1.9),u:'K/min',hint:'ΔT/t = P/(m·c), m = 0.87·V.',rand:P=>{P.Q=rnd(10,60,5);P.pc=rnd(80,200,10);P.V=rnd(20,200,10);}},
    {q:P=>`חיכוך ${P.Ff} N בפופט עם תושבת Ø8. מה רוחב ההיסטרזיס בין פתיחה לסגירה?`,a:P=>20*P.Ff/A7_ASR,u:'bar',hint:'Δp = 2·F_f/A (×10 ל-bar).',rand:P=>{P.Ff=rnd(5,60,1);}}],
  faults:[{id:'weak',t:'קפיץ עייף / בורג כיוון השתחרר',sym:'"המכונה לא מגיעה לכוח המלא, והשמן חם מהרגיל."',hint:'סגרו את העומס והשוו את הלחץ המקסימלי ללחץ שכוון.',why:'דריכת הקפיץ קטנה ב-30%: השסתום נפתח כבר בכ-70 bar. הלחץ המקסימלי נמוך, ושמן חוזר למיכל גם בעבודה רגילה – חום.'},
    {id:'leak',t:'פופט או תושבת שחוקים – דליפה',sym:'"גם בלחץ נמוך יוצא שמן מקו המיכל של שסתום הפריקה."',hint:'הסתכלו על מד הספיקה של שסתום הפריקה כשהלחץ נמוך מלחץ הפתיחה.',why:'התושבת לא אוטמת: ספיקה עוברת דרך השסתום הסגור (Q ∝ √p). הצרכן מקבל פחות שמן והשמן מתחמם.'},
    {id:'sticky',t:'פופט נתקע (לכלוך / שריטות)',sym:'"הלחץ קופץ ומשקשק, ולפעמים עובר את הכיול לפני שהשסתום נפתח."',hint:'השוו את עקום ה-p–Q בפועל (אדום) לכחול ולאפור.',why:'חיכוך גבוה פי 6: השסתום נפתח מאוחר (מעל הכיול) ונסגר מאוחר. לולאת ההיסטרזיס רחבה והלחץ לא יציב. מנקים ומחליפים שמן/מסנן.'}],
  test(H){const P=clone(this.P);P.sweep=false;P.AL=0;const R=runSim(this,P,.2).R;const P2=clone(this.P);P2.sweep=false;P2.AL=8;const R2=runSim(this,P2,.2).R;
    const F0=100*PI*16/10;return [['איזון כוחות p·A = F₀ + k·x + F_f',R.pp*A7_ASR/10,F0+250*R.x+10],['ספיקה בפתח Q = k·√p',R.QR,.637*PI*8*R.x*Math.sqrt(R.pp)],['כל הספיקה בשסתום הפריקה',R.QR,30],
      ['עומס פתוח p = (Q/k_L)²',R2.pp,(30/(.637*8))**2],['חום P = p·Q/600',R.heat,R.pp*30/600],['UI לחץ',R.read[0].v,R.pp]];}};

const SIMS_7A=[A7_SIM_CHECK,A7_SIM_SPOOL,A7_SIM_PDCV,A7_SIM_RELIEF];

/* ===================== Chapter 7 part B – pressure valves: pilot relief, reducing, sequence, unloading (sims 25–28) ===================== */
/* ---------- shared symbols / helpers (prefix B7_ / b7_) ---------- */
const B7_R=(g,x,y,w,h,fill,cls='sy thin')=>{const r=SR(g,x,y,w,h,cls);if(fill)r.style.fill=fill;return r;};
const B7_MET='#dfe5ec',B7_OIL='#93c5fd';
/* dashed assembly frame (detailed ISO symbol border) */
SYM.b7_frame={ports:o=>({}),bb:o=>[-o.w/2,-o.h/2,o.w/2,o.h/2],draw(g,o){SR(g,-o.w/2,-o.h/2,o.w,o.h,'sy dash thin');}};
/* live x–y chart. o={w,h,t,xl,yl,s:[{c,w,d,n}],leg:true}; cs={x0,xm,y0,ym,xd,yd,L:[[[x,y]..]..],dot:[x,y]} */
SYM.b7_chart={ports:o=>({}),bb:o=>[-30,-16,o.w+8,o.h+(o.leg?34:26)],
  draw(g,o){B7_R(g,0,0,o.w,o.h,'#fff','syb');ST(g,o.w/2,-5,o.t||'','st b');ST(g,o.w/2,o.h+21,o.xl||'','st s');
    const yl=ST(g,-25,o.h/2,o.yl||'','st s');yl.setAttribute('transform',`rotate(-90 -25 ${o.h/2})`);
    for(let k=1;k<4;k++){SL(g,o.w*k/4,0,o.w*k/4,o.h,'sy thin').style.opacity=.15;SL(g,0,o.h*k/4,o.w,o.h*k/4,'sy thin').style.opacity=.15;}
    const tx=[0,1,2].map(k=>ST(g,o.w*k/2,o.h+10,'','st s')),ty=[0,1,2].map(k=>ST(g,-11,o.h-o.h*k/2+3,'','st s'));
    const S=o.s||[];const ps=S.map(s=>{const p=SP(g,'','sy');p.style.stroke=s.c;p.style.strokeWidth=s.w||1.8;if(s.d)p.style.strokeDasharray=s.d;return p;});
    if(o.leg){const n=S.filter(s=>s.n).length;let k=0;S.forEach(s=>{if(!s.n)return;const t=ST(g,o.w*(k+.5)/n,o.h+31,s.n,'st s');t.style.fill=s.c;k++;});}
    const dot=SC(g,0,0,3.6,'syf');dot.style.fill='#dc2626';
    return cs=>{if(!cs)return;const x0=cs.x0||0,y0=cs.y0||0,X=x=>clamp((x-x0)/cs.xm,0,1.02)*o.w,Y=y=>o.h-clamp((y-y0)/cs.ym,0,1.05)*o.h;
      tx.forEach((t,k)=>t.textContent=fmt(x0+cs.xm*k/2,cs.xd??0));ty.forEach((t,k)=>t.textContent=fmt(y0+cs.ym*k/2,cs.yd??0));
      ps.forEach((p,k)=>{const L=cs.L[k];p.setAttribute('d',L&&L.length>1?'M'+L.map(q=>X(q[0]).toFixed(1)+','+Y(q[1]).toFixed(1)).join(' L'):'');});
      if(cs.dot){dot.style.display='';dot.setAttribute('cx',X(cs.dot[0]));dot.setAttribute('cy',Y(cs.dot[1]));}else dot.style.display='none';};}};
/* small comparison table. o={cw:[label col, col1, col2], rh, head:[..], rows:n}; cs={t:[[..],..],c:[[colour..]..]} (column 0 drawn on the right – RTL) */
SYM.b7_tbl={ports:o=>({}),bb:o=>{const w=o.cw.reduce((a,b)=>a+b,0),h=o.rh*(o.rows+1);return [-w/2,-h/2,w/2,h/2];},
  draw(g,o){const w=o.cw.reduce((a,b)=>a+b,0),h=o.rh*(o.rows+1),x0=w/2,y0=-h/2;B7_R(g,-w/2,y0,w,h,'#fff','syb');B7_R(g,-w/2,y0,w,o.rh,'#eef2f7','sy thin');
    const cx=[];let x=x0;o.cw.forEach(c=>{cx.push(x-c/2);x-=c;if(x>-w/2+1)SL(g,x,y0,x,y0+h,'sy thin');});
    for(let r=1;r<=o.rows;r++)SL(g,-w/2,y0+r*o.rh,w/2,y0+r*o.rh,'sy thin').style.opacity=.5;
    o.head.forEach((t,k)=>ST(g,cx[k],y0+o.rh*.7,t,'st b'));
    const T=[];for(let r=0;r<o.rows;r++){T.push(o.cw.map((c,k)=>ST(g,cx[k],y0+o.rh*(r+1.7),'',k?'st':'st b')));}
    return cs=>{if(!cs)return;T.forEach((row,r)=>row.forEach((t,k)=>{const s=(cs.t[r]&&cs.t[r][k])??'';if(t.textContent!==s)t.textContent=s;const c=cs.c&&cs.c[r]&&cs.c[r][k];t.style.fill=c||'';}));};}};
/* two horizontal power bars. o={w,t,n:[label1,label2]}; cs={v:[a,b],max,u} */
SYM.b7_bars={ports:o=>({}),bb:o=>[-o.w/2-4,-26,o.w/2+4,30],
  draw(g,o){ST(g,0,-14,o.t||'','st b');const lw=58,bw=o.w-lw-34,bx=-o.w/2+34;const bars=[0,1].map(k=>{const y=-4+k*18;ST(g,o.w/2-lw/2,y+9,o.n[k],'st');B7_R(g,bx,y,bw,12,'#f1f5f9','sy thin');
      const b=B7_R(g,bx,y,0,12,k?'#dc2626':'#16a34a','');const t=ST(g,bx-17,y+9,'','st b');return {b,t};});
    return cs=>{if(!cs)return;bars.forEach((o2,k)=>{const v=cs.v[k]||0;o2.b.setAttribute('width',Math.max(0,bw*clamp(v/(cs.max||1),0,1)));o2.t.textContent=fmt(v,2);});};}};
/* auto cycle a ⇄ b with dwell at each end (user change of P.pos switches auto off) */
function B7_cyc(P,st,dt,endA,endB,hA=1.2,hB=.8){if(st.cp!=null&&P.pos!==st.cp&&st.ca===P.auto)P.auto=false;st.ca=P.auto;
  if(P.auto){if(P.pos==='0')P.pos='a';const e=P.pos==='a'?endA:endB;st.dw=e?(st.dw||0)+dt:0;if(st.dw>(P.pos==='a'?hA:hB)){P.pos=P.pos==='a'?'b':'a';st.dw=0;}}st.cp=P.pos;}
const B7_trace=(st,dt,item,win,every=.05)=>{if(dt<=0)return;st.tt=(st.tt||0)+dt;st.trT=(st.trT||0)+dt;if(st.trT>=every){st.trT=0;st.tr.push([st.tt,...item]);while(st.tr.length&&st.tr[0][0]<st.tt-win)st.tr.shift();}};

/* ---------- 25 · pilot-operated relief valve ---------- */
/* main stage: balanced piston Ø16 with soft spring; nozzle 0.5 mm² through the piston; pilot poppet seat Ø2.5; vent port X */
SYM.b7_main={ports:o=>({P:[0,-16],T:[0,16],C:[-30,-12]}),bb:o=>[-32,-22,26,18],
  draw(g,o){SR(g,-16,-16,32,32,'syb');SL(g,0,-16,0,-11);SL(g,0,16,0,11);const ar=sv('g',{},g);SA(ar,0,-11,0,11,'sy',5);
    SP(g,zig(-16,5,-30,5,4,4),'sy thin');SP(g,'M0,-22 H24 V0 H16','sy pil');SP(g,'M16,0 l5,-3 v6z','syf');SP(g,'M-30,-12 V-5 H-16','sy pil');SP(g,'M-16,-5 l-5,-3 v6z','syf');
    return cs=>{const op=clamp((cs&&cs.open)||0,0,1);ar.setAttribute('transform',`translate(${lerp(-8,0,op)},0)`);};}};
B3.b7_main=(c,o)=>B3.pv(c,{kind:'relief'});
/* fixed orifice (nozzle) with "blocked" marker */
SYM.b7_or={ports:o=>({in:[0,12],out:[0,-12]}),bb:o=>[-10,-12,10,12],
  draw(g,o){SL(g,0,12,0,-12);SP(g,'M-6,-7 Q-1,0 -6,7');SP(g,'M6,-7 Q1,0 6,7');const x=sv('g',{},g);[[-7,-7,7,7],[7,-7,-7,7]].forEach(a=>{const l=SL(x,...a,'sy thick');l.style.stroke='#dc2626';});
    return cs=>{x.style.display=cs&&cs.blk?'':'none';};}};
B3.b7_or=(c,o)=>B3.throttle(c,o);
/* cut-away: main piston with nozzle, spring chamber, pilot poppet + adjusting screw, vent X, internal drain. cs={Lm,Lp,up,uc,ut,blk,adj} */
SYM.b7_pcut={ports:o=>({}),bb:o=>[-80,-76,84,82].map(v=>v*(o.s||1)),
  draw(g0,o){const g=sv('g',{transform:`scale(${o.s||1})`},g0);B7_R(g,-62,-66,124,130,B7_MET,'syb');const fl=(x,y,w,h)=>B7_R(g,x,y,w,h,B7_OIL,'sy thin');
    const cP=[fl(-7,34,14,30),fl(-15,24,30,12)],cT=[fl(18,2,30,22),fl(48,8,14,10),fl(36,-42,6,46),fl(22,-60,32,20)],cC=[fl(-18,-34,36,58),fl(-3,-50,6,16),fl(-3,-53,25,6),fl(-62,-53,59,6)];
    const gap=fl(-18,24,36,0);const pis=sv('g',{},g);B7_R(pis,-18,-6,36,30,'#475569','syf2');const dr=B7_R(pis,-1.6,-6,3.2,30,B7_OIL,'sy thin');
    const bx=sv('g',{},pis);[[-6,3,6,15],[6,3,-6,15]].forEach(a=>{SL(bx,...a,'sy thick').style.stroke='#dc2626';});
    const msp=SP(g,'','sy thin');const pp=sv('g',{},g);SP(pp,'M22,-50 L30,-57 L37,-57 L37,-43 L30,-43 Z','syf2');
    const psp=SP(g,'','sy thin');const plate=B7_R(g,52,-57,4,14,'#64748b','sy thin');const scr=B7_R(g,56,-53,20,6,'#94a3b8','sy thin');
    ST(g,0,76,'P','st b');ST(g,70,17,'T','st b');ST(g,-70,-46,'X','st b');ST(g,-36,12,'צמצם קבוע','st s');ST(g,32,-70,'פיקוד','st s');ST(g,-36,-22,'תא הקפיץ','st s');
    return cs=>{cs=cs||{};const Lm=clamp(cs.Lm||0,0,1)*7,Lp=clamp(cs.Lp||0,0,1)*4,adj=clamp(cs.adj??.4,0,1)*10;
      pis.setAttribute('transform',`translate(0,${-Lm})`);gap.setAttribute('y',24-Lm);gap.setAttribute('height',Lm);msp.setAttribute('d',zig(0,-6-Lm,0,-34,5,8));
      pp.setAttribute('transform',`translate(${Lp},0)`);plate.setAttribute('x',52-adj);scr.setAttribute('x',56-adj);psp.setAttribute('d',zig(37+Lp,-50,52-adj,-50,4,5));
      const a=pCss(cs.up||0),b=pCss(cs.uc||0),c=pCss(cs.ut||0);cP.forEach(r=>r.style.fill=a);gap.style.fill=a;cC.forEach(r=>r.style.fill=b);cT.forEach(r=>r.style.fill=c);
      dr.style.fill=cs.blk?'#1e293b':pCss(((cs.up||0)+(cs.uc||0))/2);bx.style.display=cs.blk?'':'none';};}};
const B7_AMN=H.A(16),B7_FM0=80,B7_KM=40,B7_XMM=4,B7_AOR=.5,B7_AP=H.A(2.5),B7_KP=30,B7_XPM=1,B7_ADS=H.A(8),B7_KDS=250,B7_AVT=6;
const B7_PM0=10*B7_FM0/B7_AMN;                       // ≈ 3.98 bar: Δp that lifts the balanced main piston
const B7_kM=x=>H.orK(PI*16*x),B7_kP=x=>H.orK(PI*2.5*x),B7_kD=x=>H.orK(PI*8*x);
function B7_prvCfg(P,f){return {pps:P.pset,kor:(P.blk||f==='orif')?0:H.orK(B7_AOR),kv:P.vent?H.orK(B7_AVT):0,kpl:f==='pilotleak'?.082:0,kml:f==='mainseat'?1.5:0};}
function B7_prvAt(pc,p,kL,c){const s=Math.sqrt(Math.max(pc,0)),xp=clamp((pc-c.pps)*B7_AP/10/B7_KP,0,B7_XPM),qp=B7_kP(xp)*s,qk=c.kpl*s,qv=c.kv*s;
  const xm=clamp((p-pc-B7_PM0)*B7_AMN/10/B7_KM,0,B7_XMM),sp=Math.sqrt(Math.max(p,0)),qm=B7_kM(xm)*sp,qml=c.kml*sp,qL=kL*sp;
  return {pc,p,xp,xm,qp,qk,qv,qx:qp+qk+qv,qm,qml,qL,tot:qp+qk+qv+qm+qml+qL};}
/* quasi-static solution: pump flow Q = nozzle flow (to pilot/vent) + main stage flow + load flow */
function B7_prvSolve(Q,kL,c){if(c.kor<=0){const p=H.bisect(p=>B7_prvAt(0,p,kL,c).tot-Q,0,2000);return B7_prvAt(0,p,kL,c);}
  const ev=pc=>{const a=B7_prvAt(pc,pc,kL,c);return B7_prvAt(pc,pc+(a.qx/c.kor)**2,kL,c);};return ev(H.bisect(pc=>ev(pc).tot-Q,0,2000));}
function B7_prvCrack(pps){const kor=H.orK(B7_AOR),q=kor*Math.sqrt(B7_PM0);const pc=H.bisect(pc=>B7_kP(clamp((pc-pps)*B7_AP/10/B7_KP,0,B7_XPM))*Math.sqrt(pc)-q,pps,pps+60);return {pc,p:pc+B7_PM0,q};}
function B7_prvCurve(pps,ym){const c={pps,kor:H.orK(B7_AOR),kv:0,kpl:0,kml:0};const ev=pc=>{const a=B7_prvAt(pc,pc,0,c);return B7_prvAt(pc,pc+(a.qx/c.kor)**2,0,c);};
  const hi=H.bisect(pc=>ev(pc).tot-ym*1.05,pps,pps+60),L=[[pps-60,0],[pps,0]];for(let i=1;i<=60;i++){const r=ev(pps+(hi-pps)*i/60);L.push([r.p,r.tot]);}return L;}
const B7_dirP=(pps,x)=>pps+10*B7_KDS*x/B7_ADS;
const B7_dirX=(pps,Q)=>H.bisect(x=>B7_kD(x)*Math.sqrt(B7_dirP(pps,x))-Q,0,8);
function B7_dirCurve(pps,ym){const xh=B7_dirX(pps,ym*1.05),L=[[pps-60,0],[pps,0]];for(let i=1;i<=24;i++){const x=xh*i/24,p=B7_dirP(pps,x);L.push([p,B7_kD(x)*Math.sqrt(p)]);}return L;}
const B7_SIM_PRV={id:'pilotrv',n:25,t:'שסתום פריקה דו-שלבי (מפוקד)',d:'שלב פיקוד קטן ובוכנה ראשית מאוזנת: צמצם קבוע, פתח ניקוז ואופיין p–Q שטוח לעומת שסתום ישיר',
  P:{pset:100,Q:40,AL:8,sweep:true,vent:false,blk:false,tD:16,tF:80,tA0:.5,tdp:4,tk:250},
  ui(U,P){U.grp('שלב הפיקוד');U.num(P,'pset','כיוון קפיץ הפיקוד p_ps','bar',{min:20,max:300,step:5});U.chk(P,'vent','פתח ניקוז (X) פתוח למיכל');U.chk(P,'blk','הצמצם הקבוע בבוכנה הראשית סתום');
    U.grp('מעגל');U.num(P,'Q','ספיקת משאבה','L/min',{min:5,max:150,step:5});U.num(P,'AL','פתח שסתום העומס (מקסימלי)','mm²',{min:0,max:40,step:.5});U.chk(P,'sweep','סגירה ופתיחה אוטומטית של העומס (8 s)');
    U.note('ראשי Ø16 עם קפיץ רך 80 N · צמצם קבוע 0.5 mm² · פיקוד Ø2.5. להשוואה: ישיר Ø8, קפיץ 250 N/mm.');},
  circuit(P){return {comps:[{id:'P1',type:'pump',x:110,y:300,name:'משאבה',lbl:'משאבה',lblAt:[-2,40]},{id:'T1',type:'tank',x:110,y:344,name:'מיכל'},
      {id:'GP',type:'gauge',x:150,y:68,net:'P',name:'מד לחץ המערכת (כניסת השסתום)',l3:[0,-30]},
      {id:'FRM',type:'b7_frame',x:290,y:161,o:{w:216,h:130},name:'גבול השסתום: שלב ראשי, צמצם קבוע ושלב פיקוד בגוף אחד',lbl:'פריקה דו-שלבי',lblAt:[-60,-52]},
      {id:'MV',type:'b7_main',x:360,y:200,name:'שלב ראשי: בוכנה מאוזנת עם קפיץ רך (לחץ הכניסה מלמטה, לחץ תא הקפיץ מלמעלה)',lbl:'שלב ראשי',lblAt:[46,4],l3:[0,-30]},
      {id:'OR',type:'b7_or',x:280,y:135,rot:180,name:'צמצם קבוע (קדח זעיר בבוכנה הראשית) – לחיצה: סתימה/פתיחה',lbl:'צמצם קבוע',lblAt:[-22,4],val:R=>`${fmt(R.r.qx,2)} L/min`,valAt:[12,-8]},
      {id:'PV',type:'pv',x:220,y:170,rot:-90,o:{kind:'relief'},name:'שלב פיקוד: שסתום פריקה ישיר קטן – הכיוון קובע את לחץ השסתום',lbl:'פיקוד',lblAt:[-30,-30],l3:[0,-30]},
      {id:'GC',type:'gauge',x:305,y:176,net:'C',name:'מד לחץ – תא הקפיץ של הבוכנה הראשית',valAt:[2,-20],l3:[0,-30]},
      {id:'VV',type:'dcv',x:280,y:262,o:{box:['P-A','P| A|'],ways:2,n0:1,L:'sol',R:'spring'},name:'שסתום ניקוז 2/2 על פתח X – לחיצה פותחת/סוגרת',lbl:'vent (X)',lblAt:[-80,24]},
      {id:'T3',type:'tank',x:165,y:196,name:'מיכל (ניקוז הפיקוד)'},{id:'T4',type:'tank',x:280,y:306,name:'מיכל'},
      {id:'FR',type:'flowm',x:360,y:246,rot:180,name:'מד ספיקה – יציאת השלב הראשי',val:R=>`${fmt(R.r.qm+R.r.qml,1)} L/min`,valAt:[16,0]},{id:'T2',type:'tank',x:360,y:286,name:'מיכל'},
      {id:'TH',type:'throttle',x:440,y:120,rot:180,name:'שסתום עומס (מדמה את הצרכן)',lbl:'עומס',lblAt:[-30,0]},
      {id:'FL',type:'flowm',x:440,y:166,rot:180,name:'מד ספיקה – לצרכן',val:R=>`${fmt(R.r.qL,1)} L/min`,valAt:[-16,0]},{id:'T5',type:'tank',x:440,y:206,name:'מיכל'},
      {id:'CUT',type:'b7_pcut',x:552,y:128,o:{s:1},name:'חתך: בוכנה ראשית עם צמצם קבוע, תא קפיץ, פופט פיקוד ובורג כיוון'},
      {id:'CH',type:'b7_chart',x:480,y:262,o:{w:152,h:74,t:'אופיין p–Q',xl:'p [bar]',yl:'Q [L/min]',leg:true,s:[{c:'#0b72d9',w:2.2,n:'מפוקד'},{c:'#94a3b8',d:'5 3',w:1.8,n:'ישיר'},{c:'#dc2626',w:1.1,n:'בפועל'}]},name:'עקום p–Q: כחול – מפוקד, אפור – ישיר באותו כיוון, אדום – המסלול בפועל'}],
     lines:[{id:'LS',net:'S',pts:['T1.t','P1.in']},{id:'LP1',net:'P',pts:['P1.out',[110,80],[360,80]],tag:{at:[236,62],t:'q'}},{id:'LP2',net:'P',pts:[[360,80],[440,80],'TH.in']},
      {id:'LM',net:'P',pts:[[360,80],'MV.P']},{id:'LTP',net:'P',kind:'pilot',pts:[[360,110],[280,110],'OR.in']},
      {id:'LC1',net:'C',kind:'pilot',pts:['OR.out',[280,188],'MV.C']},{id:'LC2',net:'C',kind:'pilot',pts:[[280,170],'PV.P']},{id:'LX',net:'C',kind:'pilot',pts:[[280,188],'VV.A']},
      {id:'LPD',net:'T',kind:'drain',pts:['PV.T',[165,170],'T3.t']},{id:'LVT',net:'T',kind:'drain',pts:['VV.P','T4.t']},
      {id:'LT1',net:'T',pts:['MV.T','FR.in']},{id:'LT2',net:'T',pts:['FR.out','T2.t']},{id:'LL1',net:'T',pts:['TH.out','FL.in']},{id:'LL2',net:'T',pts:['FL.out','T5.t']}]};},
  init:P=>({t:0,tr:[]}),
  click(id,P){if(id==='VV'){P.vent=!P.vent;return true;}if(id==='OR'){P.blk=!P.blk;return true;}},
  step(P,st,dt,ctx){const f=ctx.fault,c=B7_prvCfg(P,f);st.t+=dt;const ph=(st.t%8)/8,tri=ph<.5?ph*2:2-ph*2;const AL=P.sweep?P.AL*(1-tri):P.AL,kL=H.orK(AL);
    const r=B7_prvSolve(P.Q,kL,c),QR=r.qx+r.qm+r.qml,heat=H.kW(r.p,QR);
    if(dt>0){st.trT=(st.trT||0)+dt;if(st.trT>.05){st.trT=0;st.tr.push([r.p,QR]);if(st.tr.length>170)st.tr.shift();}}
    const cn={pps:P.pset,kor:H.orK(B7_AOR),kv:0,kpl:0,kml:0},full=B7_prvSolve(P.Q,0,cn),xd=B7_dirX(P.pset,P.Q),pdir=B7_dirP(P.pset,xd),crk=B7_prvCrack(P.pset);
    const pv=B7_prvSolve(P.Q,0,Object.assign({},cn,{kv:H.orK(B7_AVT)})).p,pm=Math.ceil(Math.max(pdir,r.p,10)*1.08/10)*10,ym=Math.ceil(P.Q*1.25/10)*10;KIT.rpmAng(st,dt,1450);
    return {r,QR,heat,AL,kL,full,pdir,xd,crk,pv,vent:P.vent,blk:c.kor<=0,
      p:{P:r.p,C:r.pc,T:Math.min(1,QR/P.Q)*.3,S:-.05},q:{LS:P.Q,LP1:P.Q,LP2:r.qL,LM:QR,LT1:r.qm+r.qml,LT2:r.qm+r.qml,LL1:r.qL,LL2:r.qL},pmax:pm,qref:P.Q,
      c:{P1:{on:true,ang:st.ang},MV:{open:clamp(Math.sqrt(r.xm/.8),0,1)},PV:{open:clamp(Math.sqrt(r.xp/.02),0,1)},OR:{blk:c.kor<=0},VV:{i:P.vent?0:1},TH:{knob:AL/10},
        CUT:{Lm:Math.sqrt(r.xm/.8),Lp:Math.sqrt(r.xp/.02),up:r.p/pm,uc:r.pc/pm,ut:QR>.05?.06:0,blk:c.kor<=0,adj:P.pset/300},
        CH:{x0:P.pset-15,xm:35,ym,L:[B7_prvCurve(P.pset,ym),B7_dirCurve(P.pset,ym),st.tr],dot:[r.p,QR]}},
      read:[{k:'לחץ במערכת',v:r.p,u:'bar'},{k:'לחץ בתא הקפיץ',v:r.pc,u:'bar'},{k:'ספיקה בצמצם הקבוע',v:r.qx,u:'L/min',dg:2,max:1},{k:'ספיקה בשסתום',v:QR,u:'L/min',max:P.Q},
        {k:'ספיקה לצרכן',v:r.qL,u:'L/min',max:P.Q},{k:'הרמת הבוכנה',v:r.xm,u:'mm',dg:3,max:.8},{k:'חום בשסתום',v:heat,u:'kW',dg:2,max:H.kW(full.p,P.Q),w:heat>.5*H.kW(full.p,P.Q)}]};},
  ins(P,R){const L=[],r=R.r;
    L.push({ic:'🎯',at:'PV',h:`קפיץ הפיקוד מכוון ל-<b>${fmt(P.pset,0)} bar</b>. הבוכנה הראשית מתרוממת ב-${fmt(R.crk.p,1)} bar, וכל ${fmt(P.Q,0)} L/min עוברים ב-<b>${fmt(R.full.p,1)} bar</b>. שסתום ישיר באותו כיוון היה מגיע ל-<b>${fmt(R.pdir,1)} bar</b>.`});
    if(R.blk)L.push({ic:'⛔',w:true,at:'OR',h:`הצמצם הקבוע סתום: שום שמן לא מגיע לתא הקפיץ (${fmt(r.pc,1)} bar). הבוכנה הראשית מוחזקת רק בקפיץ הרך ונפתחת ב-${fmt(r.p,1)} bar – המערכת לא בונה לחץ.`,c:'הצמצם הקבוע סתום – תא הקפיץ ריק'});
    else if(P.vent)L.push({ic:'🔓',at:'VV',h:`פתח X פתוח למיכל: תא הקפיץ ב-${fmt(r.pc,2)} bar, דרך הצמצם הקבוע זורמים ${fmt(r.qx,2)} L/min והבוכנה נפתחת ב-<b>${fmt(r.p,1)} bar</b>. המשאבה פורקת ב-${fmt(H.kW(r.p,P.Q),2)} kW במקום ${fmt(H.kW(R.full.p,P.Q),2)} kW.`});
    else if(r.qx<.005)L.push({ic:'⚖️',at:'GC',h:`אין זרימה בצמצם הקבוע, ולכן p_c = p = ${fmt(r.p,1)} bar: <b>הבוכנה הראשית מאוזנת</b> – אותו לחץ משני צדדיה, והקפיץ הרך (${B7_FM0} N) מחזיק אותה סגורה.`});
    else L.push({ic:'⚖️',at:'OR',h:`הפיקוד פתוח ו-${fmt(r.qx,2)} L/min זורמים דרך הצמצם הקבוע. מפל הלחץ עליו – <b>${fmt(r.p-r.pc,2)} bar</b> – הוא מה שמרים את הבוכנה (צריך ${fmt(B7_PM0,2)} bar).`});
    if(R.QR>.05&&!R.blk&&!P.vent)L.push({ic:'🔥',w:R.QR>.5*P.Q,at:'FR',h:`${fmt(R.QR,1)} L/min עוברים בשסתום ב-${fmt(r.p,0)} bar → <b>${fmt(R.heat,2)} kW</b> חום.`,c:`${fmt(R.heat,1)} kW חום`});
    if(R.QR>.3&&r.p<P.pset-5&&!R.blk&&!P.vent)L.push({ic:'💧',w:true,at:'FR',h:`זורם שמן למיכל (${fmt(R.QR,1)} L/min) כשהלחץ ${fmt(r.p,0)} bar – נמוך מכיוון הפיקוד!`,c:'זרימה למיכל מתחת לכיוון'});
    L.push({ic:'📈',at:'CH',h:`העקיפה מפתיחת הפיקוד ועד ספיקה מלאה: <b>${fmt(R.full.p-P.pset,1)} bar</b> במפוקד, לעומת ${fmt(R.pdir-P.pset,1)} bar בשסתום הישיר. הקפיץ הראשי רך, ולכן העקום כמעט אנכי.`});
    L.push({ic:'💡',h:'הפיקוד מטפל רק בפחות מ-1 L/min, ולכן קפיץ קטן מספיק גם ללחץ גבוה. המחיר: תגובה איטית יותר (עשרות ms) מאשר שסתום ישיר.'});return L;},
  calc(P,R){const r=R.r,Fp0=P.pset*B7_AP/10,kor=H.orK(B7_AOR);return `<div class="kpis">${kpi('פתיחת הפיקוד',fmt(P.pset,0),'bar')}${kpi('פתיחת הראשי',fmt(R.crk.p,1),'bar')}${kpi('ספיקה מלאה – פיקוד',fmt(R.full.p,1),'bar')}${kpi('ספיקה מלאה – ישיר',fmt(R.pdir,1),'bar')}</div>`+
    det('שלב הפיקוד',row('שטח התושבת',`A_p = π·2.5²/4 = ${V(B7_AP,'mm²',2)}`)+row('דריכת הקפיץ',`F_p0 = p_ps·A_p/10 = ${P.pset}·${fmt(B7_AP,2)}/10 = ${V(Fp0,'N')}`)+row('איזון',`p_c·A_p/10 = F_p0 + k_p·x_p ⇒ x_p = ${V(r.xp,'mm',4)}, ספיקה ${V(r.qp,'L/min',3)}`),true)+
    det('הבוכנה הראשית המאוזנת',row('שטח',`A_m = π·16²/4 = ${V(B7_AMN,'mm²')}`)+row('תנאי פתיחה',`(p − p_c)·A_m/10 ≥ F_m0 ⇒ p − p_c ≥ ${fr('10·'+B7_FM0,fmt(B7_AMN,0))} = ${V(B7_PM0,'bar')}`)+
      row('עכשיו',`p − p_c = ${fmt(r.p,2)} − ${fmt(r.pc,2)} = ${V(r.p-r.pc,'bar')}`,r.p-r.pc>=B7_PM0)+row('הרמה',`x_m = (Δp − ${fmt(B7_PM0,2)})·A_m/(10·k_m) = ${V(r.xm,'mm',3)}, Q_m = 0.637·π·16·x_m·√p = ${V(r.qm,'L/min')}`),true)+
    det('הצמצם הקבוע',row('',`q = 0.637·A₀·${sq('p − p_c')} = 0.637·${B7_AOR}·${sq(fmt(Math.max(r.p-r.pc,0),2))} = ${V(R.blk?0:kor*Math.sqrt(Math.max(r.p-r.pc,0)),'L/min',3)}`)+row('ספיקה שפותחת את הראשי',`q = ${fmt(kor,3)}·√${fmt(B7_PM0,2)} = ${V(R.crk.q,'L/min',3)}`))+
    det('השוואה לשסתום ישיר',row('איזון',`p = p_ps + 10·k·x/A = ${P.pset} + 10·${B7_KDS}·x/${fmt(B7_ADS,1)}`)+row(`ספיקה ${P.Q} L/min`,`0.637·π·8·x·√p = ${P.Q} ⇒ x = ${V(R.xd,'mm',3)} ⇒ p = ${V(R.pdir,'bar')}`)+row('עקיפה',`ישיר ${V(R.pdir-P.pset,'bar')} · מפוקד ${V(R.full.p-P.pset,'bar')}`))+
    det('חום',row('',`P = p·Q_R/600 = ${fmt(r.p,1)}·${fmt(R.QR,1)}/600 = ${V(R.heat,'kW',3)}`)+row('עם פתח הניקוז פתוח',`p = ${fmt(R.pv,2)} bar ⇒ P = ${fmt(R.pv,2)}·${P.Q}/600 = ${V(H.kW(R.pv,P.Q),'kW',3)}`))+
    `<div class="note">C_d = 0.7. כוחות זרימה ושטח הפין של הפיקוד לא נכללים; תא הקפיץ מתנקז רק דרך הפיקוד ופתח X.</div>`;},
  demo:[{t:'שני שלבים בגוף אחד',x:'בתוך המסגרת המקווקוות: <b>שלב ראשי</b> (בוכנה גדולה עם קפיץ רך), <b>צמצם קבוע</b> זעיר דרך הבוכנה, ו<b>שלב פיקוד</b> – שסתום פריקה ישיר קטן. העומס פתוח והלחץ (כ-62 bar) נקבע בו.',reset:true,set:{sweep:false},hl:['FRM','MV','OR','PV'],dur:9},
    {t:'הבוכנה הראשית מאוזנת',x:'אין זרימה בצמצם הקבוע, ולכן הלחץ בתא הקפיץ שווה ללחץ הכניסה – שני המדים מראים אותו ערך. הכוחות על הבוכנה מתקזזים והקפיץ הרך מחזיק אותה.',hl:['GP','GC','CUT']},
    {t:'סוגרים את העומס',x:'הלחץ עולה ל-100 bar, הפיקוד נפתח ושמן זורם דרך הצמצם הקבוע (כ-0.64 L/min). מפל הלחץ בצמצם הקבוע – 4 bar – מרים את הבוכנה, וכל הספיקה עוברת למיכל.',set:{AL:0},hl:['PV','OR','CUT'],dur:9},
    {t:'אופיין שטוח',x:'במחזור האוטומטי העומס נסגר ונפתח. נקודת העבודה נעה על הקו הכחול – כמעט אנכי. הקו האפור הוא שסתום ישיר באותו כיוון: הלחץ שלו עולה ב-12 bar.',set:{AL:8,sweep:true},hl:['CH'],dur:10},
    {t:'פתח ניקוז',x:'מחברים את פתח X למיכל: תא הקפיץ מתרוקן, הבוכנה נפתחת כבר בכ-5 bar – פריקת משאבה בלחץ נמוך בעזרת שסתום קטן בלבד.',set:{sweep:false,AL:0,vent:true},hl:['VV','GC','GP']},
    {t:'צמצם קבוע סתום',x:'הצמצם הקבוע נסתם: גם כאן הלחץ כ-5 bar בלבד, אבל מד תא הקפיץ על 0 ואין ספיקה בצמצם הקבוע. הסימן המובהק לתקלה הזו.',set:{vent:false,blk:true},hl:['OR','GC','CUT']},
    {t:'כיוון הפיקוד',x:'משחררים את הצמצם הקבוע ומכוונים את הפיקוד ל-160 bar: כל העקום זז ימינה, אבל נשאר שטוח. בורג קטן שולט בשסתום של 40 L/min.',set:{blk:false,pset:160,sweep:true},hl:['PV','CH','CUT'],dur:9}],
  predict:[{q:'העומס סגור לגמרי, הפיקוד מכוון ל-100 bar ו-40 L/min עוברים בשסתום. מה יראה מד המערכת?',set:{sweep:false,AL:0},opts:['בדיוק 100 bar','כ-105 bar','כ-112 bar','כ-140 bar'],a:1,why:'הפיקוד נפתח ב-100 bar, צריך עוד כ-0.8 bar כדי להעביר את ספיקת הצמצם הקבוע, ועוד 4 bar הפרש על הבוכנה הראשית. הקפיץ הראשי רך – כ-105 bar. שסתום ישיר היה מגיע לכ-112.'},
    {q:'העומס סגור ופותחים את פתח הניקוז (X) למיכל. מה יקרה ללחץ המערכת?',set:{sweep:false,AL:0,vent:true},opts:['יישאר כ-105 bar','יירד לכ-5 bar','יעלה מעל הכיוון'],a:1,why:'תא הקפיץ מתרוקן דרך X. הבוכנה הראשית רואה את כל לחץ הכניסה מלמטה ורק קפיץ רך מלמעלה – היא נפתחת ב-4 bar, ועם ההרמה הלחץ כ-5 bar.'},
    {q:'הצמצם הקבוע בבוכנה הראשית נסתם. מה יראו שני המדים כשהעומס סגור?',set:{sweep:false,AL:0,blk:true},opts:['שניהם כ-105 bar','מערכת כ-5 bar, תא הקפיץ 0','מערכת עולה בלי הגבלה'],a:1,why:'בלי צמצם קבוע שום שמן לא מגיע לתא הקפיץ, ולכן p_c = 0. הבוכנה הראשית נפתחת ברגע שלחץ הכניסה מתגבר על הקפיץ הרך.'},
    {q:'העומס סגור. מכפילים את ספיקת המשאבה מ-40 ל-80 L/min. בכמה יעלה הלחץ?',set:{sweep:false,AL:0,Q:80},opts:['פחות מ-1 bar','כ-11 bar','פי 2'],a:0,why:'הבוכנה הראשית צריכה להתרומם עוד כ-0.12 mm, והקפיץ הרך מוסיף רק כ-0.3 bar. בשסתום ישיר אותה הכפלה מוסיפה כ-11 bar.'}],
  tasks:[{q:P=>`בוכנה ראשית Ø${P.tD} מ"מ, קפיץ דרוך ל-${P.tF} N. איזה הפרש לחצים p − p_c דרוש כדי להתחיל להרים אותה?`,a:P=>10*P.tF/H.A(P.tD),u:'bar',hint:'Δp = F/A (×10 ל-bar).',rand:P=>{P.tD=pick([12,16,20,25]);P.tF=rnd(40,200,10);}},
    {q:P=>`צמצם קבוע בשטח ${P.tA0} mm² (C_d = 0.7). מה הספיקה דרכו כשהפרש הלחצים עליו ${P.tdp} bar?`,a:P=>.637*P.tA0*Math.sqrt(P.tdp),u:'L/min',hint:'q = 0.637·A₀·√Δp.',rand:P=>{P.tA0=pick([.3,.5,.8,1]);P.tdp=pick([2,3,4,5,6,8]);}},
    {q:P=>`תושבת פיקוד Ø2.5 מ"מ, כיוון ${P.pset} bar. מה כוח הדריכה של קפיץ הפיקוד?`,a:P=>P.pset*B7_AP/10,u:'N',hint:'F = p·A/10, A = π·2.5²/4.',rand:P=>{P.pset=rnd(50,300,10);}},
    {q:P=>`${P.Q} L/min עוברים בשסתום ב-${P.pset} bar. פותחים את פתח הניקוז והלחץ יורד ל-5 bar. כמה הספק נחסך?`,a:P=>(P.pset-5)*P.Q/600,u:'kW',hint:'P = p·Q/600, לפני ואחרי.',rand:P=>{P.Q=rnd(20,120,5);P.pset=rnd(80,250,10);}},
    {q:P=>`שסתום ישיר עם תושבת Ø8 וקפיץ ${P.tk} N/mm. בכמה עולה הלחץ לכל 0.1 mm הרמה?`,a:P=>10*P.tk*.1/B7_ADS,u:'bar',hint:'Δp = 10·k·x/A, A = π·8²/4.',rand:P=>{P.tk=rnd(100,600,50);}}],
  faults:[{id:'orif',t:'הצמצם הקבוע בבוכנה הראשית סתום (לכלוך)',sym:'"המשאבה עובדת, אבל אין לחץ – המד בקושי מגיע ל-5 bar, גם כשסוגרים את העומס."',hint:'השוו את מד תא הקפיץ למד המערכת, ובדקו את הספיקה דרך הצמצם הקבוע.',why:'לכלוך סוגר את הצמצם הקבוע: שמן לא מגיע לתא הקפיץ (0 bar), והבוכנה הראשית מוחזקת רק בקפיץ הרך – היא נפתחת בכ-5 bar. מפרקים ומנקים את הצמצם הקבוע (כיוון הפיקוד לא יעזור).'},
    {id:'pilotleak',t:'תושבת הפיקוד שחוקה – דליפה',sym:'"הלחץ המקסימלי ירד לכ-69 bar, וסיבוב בורג הכיוון כמעט לא משנה."',hint:'מה מראה הספיקה דרך הצמצם הקבוע כשהלחץ נמוך בהרבה מהכיוון?',why:'שמן דולף דרך תושבת הפיקוד גם מתחת לכיוון. הזרימה בצמצם הקבוע יוצרת הפרש לחצים, וכשהוא מגיע ל-4 bar הבוכנה הראשית נפתחת – מוקדם מדי.'},
    {id:'mainseat',t:'לכלוך מתחת לבוכנה הראשית – לא נסגרת',sym:'"הצרכן איטי והשמן חם, אפילו כשאין עומס. הצינור מהשסתום למיכל חם."',hint:'הסתכלו על מד הספיקה ביציאת השלב הראשי כשהלחץ נמוך מהכיוון.',why:'הבוכנה לא יושבת על התושבת: שמן עובר למיכל בכל לחץ (Q ∝ √p). הלחץ המקסימלי כמעט תקין, אבל הצרכן מקבל פחות שמן.'}],
  test(H){const P=clone(this.P);P.sweep=false;P.AL=0;const R=runSim(this,P,.2).R,r=R.r;const P2=clone(this.P);P2.sweep=false;const R2=runSim(this,P2,.2).R;
    const P3=clone(this.P);P3.sweep=false;P3.AL=0;P3.vent=true;const R3=runSim(this,P3,.2).R;const xd=B7_dirX(100,40);
    return [['כל הספיקה בשסתום',R.QR,40],['איזון הראשי (p−p_c)·A/10 = F₀ + k·x',(r.p-r.pc)*PI*64/10,80+40*r.xm],['צמצם קבוע q = 0.637·A₀·√Δp',r.qx,.637*.5*Math.sqrt(r.p-r.pc)],
      ['איזון הפיקוד p_c·A_p/10 = F_p0 + k_p·x_p',r.pc*PI*6.25/4/10,100*PI*6.25/4/10+30*r.xp],['עומס פתוח p = (Q/k_L)²',R2.r.p,(40/(.637*8))**2],
      ['vent: p ≈ Δp פתיחת הראשי + הרמה',R3.r.p,10*80/(PI*64)+10*40*(40/(.637*PI*16*Math.sqrt(R3.r.p)))/(PI*64)+R3.r.pc,.02],['ישיר: Q = 0.637·π·d·x·√p',.637*PI*8*xd*Math.sqrt(100+10*250*xd/(PI*16)),40],['UI לחץ',R.read[0].v,r.p]];}};

/* ---------- 26 · pressure reducing valve ---------- */
/* cut-away of a direct 2-way reducing valve (normally open). spring left (drained to L), outlet pressure on the right end closes the spool. cs={o open 0..1,ui,uo,ul} */
SYM.b7_rcut={ports:o=>({}),bb:o=>[-86,-52,86,54].map(v=>v*(o.s||1)),
  draw(g0,o){const g=sv('g',{transform:`scale(${o.s||1})`},g0);B7_R(g,-80,-36,160,72,B7_MET,'syb');const fl=(x,y,w,h)=>B7_R(g,x,y,w,h,B7_OIL,'sy thin');
    B7_R(g,-76,-8,152,16,'#e2e8f0','sy thin');
    const cI=[fl(0,-14,20,28),fl(6,14,8,22)],cO=[fl(-36,-14,20,28),fl(-32,-36,8,22),fl(-20,-22,84,4),fl(60,-22,4,14),fl(44,-8,32,16)],cL=[fl(-76,-8,20,16),fl(-70,8,6,28)];
    const sg=sv('g',{},g);const grv=B7_R(sg,-40,-8,50,16,B7_OIL,'');B7_R(sg,-56,-3,96,6,'#94a3b8','sy thin');B7_R(sg,-56,-8,16,16,'#64748b','sy thin');B7_R(sg,10,-8,30,16,'#64748b','sy thin');
    const sp=SP(g,'','sy thin');
    ST(g,10,48,'P','st b');ST(g,-28,-40,'A','st b');ST(g,-67,48,'L','st b');ST(g,58,30,'משוב מהיציאה','st s');ST(g,-54,-28,'קפיץ','st s');
    return cs=>{cs=cs||{};const s=-10*(1-clamp(cs.o??1,0,1));sg.setAttribute('transform',`translate(${s},0)`);sp.setAttribute('d',zig(-76,0,-56+s,0,5,6));
      const a=pCss(cs.ui||0),b=pCss(cs.uo||0),c=pCss(cs.ul||0);cI.forEach(r=>r.style.fill=a);cO.forEach(r=>r.style.fill=b);cL.forEach(r=>r.style.fill=c);grv.style.fill=b;};}};
const B7_RAS=H.A(10),B7_RKS=40,B7_RY0=1,B7_ROV=4,B7_RD=50,B7_Rd=28,B7_RST=120,B7_RFF=400;
const B7_kR=y=>H.orK(PI*10*y);
function B7_rdCfg(P,f){const F0=Math.max(P.pset*B7_RAS/10-B7_RKS*B7_RY0,0);return {F0:f==='spring'?F0*.55:F0,blk:f==='drain',pin:f==='relief'?Math.min(P.pin,30):P.pin};}
const B7_rdClose=c=>10*(c.F0+B7_RKS*B7_RY0)/B7_RAS;   // outlet pressure that closes the spool (zero flow)
const B7_rdY=(po,c)=>c.blk?B7_RY0:clamp(B7_RY0-(po*B7_RAS/10-c.F0)/B7_RKS,0,B7_RY0);
function B7_rdRun(Q,Ain,F,c,end){const pst=c.pin+B7_ROV,pcl=B7_rdClose(c);
  const hold=()=>{const po=c.blk?pst:Math.min(pst,pcl);return {v:0,Qi:0,po,pin:pst,y:B7_rdY(po,c),Qr:Q,stall:true};};
  if(end)return hold();const po=10*F/Ain,y=B7_rdY(po,c);if(y<1e-6)return hold();
  const k=B7_kR(y),pinOf=Qi=>po+(Qi/k)**2,need=v=>{const Qi=H.Q(v,Ain);return Qi+H.reliefQ(pinOf(Qi),c.pin,B7_ROV,Q);};
  if(need(0)>=Q)return hold();const v=H.bisect(v=>need(v)-Q,0,H.v(Q,Ain)),Qi=H.Q(v,Ain),pin=pinOf(Qi);return {v,Qi,po,pin,y,Qr:H.reliefQ(pin,c.pin,B7_ROV,Q),stall:false};}
const B7_SIM_RED={id:'reduce',n:26,t:'ווסת לחץ',d:'שסתום פתוח במצב רגיל שחש בלחץ היציאה: ענף הידוק בלחץ נמוך ממעגל ראשי, והשוואה לשסתום פריקה',
  P:{pset:40,pin:100,Q:12,pos:'a',auto:true,tp:40,tD:50,tF:8},
  ui(U,P){U.grp('ווסת הלחץ');U.num(P,'pset','לחץ יציאה מכוון','bar',{min:10,max:200,step:5});
    U.grp('מעגל ראשי (כניסה)');U.num(P,'pin','לחץ המערכת (כיול שסתום הפריקה הראשי)','bar',{min:10,max:250,step:5});U.num(P,'Q','ספיקת משאבה','L/min',{min:2,max:40,step:1});
    U.grp('צילינדר הידוק');U.seg(P,'pos','שסתום פיקוד',KIT.pos3);U.chk(P,'auto','מחזור אוטומטי (הידוק – שחרור)');U.note('צילינדר Ø50/28, מהלך 120 mm, חיכוך 400 N. החלק נמצא בסוף המהלך.');},
  circuit(P){return {comps:[{id:'C1',type:'cyl',x:300,y:40,o:{load:{t:''}},name:'צילינדר הידוק',lbl:'צילינדר הידוק',lblAt:[-86,-20],l3:[0,-34]},
      {id:'WP',type:'box',x:513,y:40,o:{w:20,h:44,t:''},name:'החלק המהודק (בסוף המהלך)',lbl:'חלק',lblAt:[0,-30]},
      {id:'V1',type:'dcv',x:307,y:125,o:{box:KIT.D43.closed,L:'sol',R:'sol',center:true},name:'שסתום פיקוד 4/3 – לחיצה מחליפה מצב',lbl:'4/3',lblAt:[-100,4]},
      {id:'G2',type:'gauge',x:288,y:180,rot:-90,net:'O',name:'מד לחץ מופחת (יציאת ווסת הלחץ)',valAt:[-16,0],l3:[0,-30]},
      {id:'PRV',type:'pv',x:300,y:225,o:{kind:'reduce'},name:'ווסת לחץ ישיר: פתוח במצב רגיל, חש בלחץ היציאה, ניקוז חיצוני L',lbl:'ווסת לחץ',lblAt:[-46,4],l3:[0,-30]},
      {id:'T3',type:'tank',x:360,y:165,name:'מיכל'},{id:'T4',type:'tank',x:355,y:253,name:'מיכל (ניקוז L)'},
      {id:'G1',type:'gauge',x:240,y:258,net:'P',name:'מד לחץ המערכת (כניסת ווסת הלחץ)',valAt:[-14,-16],l3:[0,-30]},
      {id:'MB',type:'box',x:440,y:270,o:{w:70,h:24,t:'מעגל ראשי',ports:{i:[-35,0]}},name:'שאר המעגל הראשי (למשל מכבש) – עובד בלחץ המלא'},
      {id:'P1',type:'pump',x:200,y:340,name:'משאבה',lbl:'משאבה',lblAt:[32,6]},{id:'T1',type:'tank',x:200,y:384,name:'מיכל'},
      {id:'RV',type:'pv',x:150,y:295,rot:-90,o:{kind:'relief'},name:'שסתום פריקה ראשי: סגור במצב רגיל, חש בלחץ הכניסה',lbl:'פריקה',lblAt:[0,-30],l3:[0,-30]},{id:'T2',type:'tank',x:110,y:325,name:'מיכל'},
      {id:'CUT',type:'b7_rcut',x:482,y:172,o:{s:1.05},name:'חתך ווסת הלחץ: ספול פתוח, קפיץ משמאל (מנוקז ל-L), לחץ היציאה דוחף מימין וסוגר'},
      {id:'TBL',type:'b7_tbl',x:470,y:338,o:{cw:[66,70,70],rh:15,rows:5,head:['','שסתום פריקה ראשי','ווסת לחץ']},name:'השוואה חיה בין שסתום הפריקה לווסת הלחץ'}],
     lines:[{id:'LS',net:'S',pts:['T1.t','P1.in']},{id:'LP1',net:'P',pts:['P1.out',[200,270],[300,270]]},{id:'LP2',net:'P',pts:[[300,270],'MB.i']},
      {id:'LRV',net:'P',pts:[[200,295],'RV.P']},{id:'LRT',net:'T',pts:['RV.T',[110,295],'T2.t']},
      {id:'LPR',net:'P',pts:[[300,270],'PRV.P']},{id:'LO',net:'O',pts:['PRV.T','V1.P'],tag:{at:[338,190],t:'q'}},{id:'LDR',net:'L',kind:'drain',pts:['PRV.L',[355,241],'T4.t']},
      {id:'LT',net:'T',pts:['V1.T',[314,145],[360,145],'T3.t']},{id:'LA',net:'A',pts:['V1.A',[300,80],[250,80],'C1.A']},{id:'LB',net:'B',pts:['V1.B',[314,80],[350,80],'C1.B']}]};},
  init:P=>({x:0,si:KIT.idx[P.pos],pAl:0,pBl:0}),
  click(id,P){if(id==='V1'){P.pos=P.pos==='a'?'0':P.pos==='0'?'b':'a';P.auto=false;return true;}},
  step(P,st,dt,ctx){const f=ctx.fault,c=B7_rdCfg(P,f),A1=H.A(B7_RD),A2=H.Aann(B7_RD,B7_Rd),S=B7_RST;
    B7_cyc(P,st,dt,st.x>=S-1e-6,st.x<=1e-6,2,.8);const dir=KIT.dirOf(P.pos);
    const r=dir>0?B7_rdRun(P.Q,A1,B7_RFF,c,st.x>=S-1e-6):dir<0?B7_rdRun(P.Q,A2,B7_RFF,c,st.x<=1e-6):B7_rdRun(P.Q,A1,0,c,true);
    st.x=clamp(st.x+dir*r.v*dt,0,S);KIT.ease(st,'si',KIT.idx[P.pos],dt);KIT.rpmAng(st,dt,1450);
    let pA=st.pAl,pB=st.pBl;if(dir>0){pA=r.po;pB=0;}else if(dir<0){pB=r.po;pA=0;}st.pAl=pA;st.pBl=pB;
    const Fcl=st.x>=S-1e-6?pA*A1/10:0,open=r.y/B7_RY0,pcl=B7_rdClose(c),pm=Math.ceil((P.pin+B7_ROV)/10)*10,rvOpen=clamp(r.Qr/P.Q,0,1);
    const qA=dir>0?r.Qi:dir<0?-H.Q(r.v,A1):0,qB=dir>0?-H.Q(r.v,A2):dir<0?r.Qi:0;
    return {r,pA,pB,Fcl,open,pcl,dir,A1,A2,c,
      p:{P:r.pin,O:r.po,A:pA,B:pB,T:Math.min(1,Math.abs(qA)/P.Q)*.3,L:c.blk?r.po:0,S:-.05},q:{LS:P.Q,LP1:P.Q,LP2:0,LRV:r.Qr,LRT:r.Qr,LPR:r.Qi,LO:r.Qi,LA:qA,LB:qB,LT:Math.abs(dir>0?qB:qA)},pmax:pm,qref:P.Q,
      c:{C1:{x:st.x/S,uA:pA/pm,uB:pB/pm,lt:Fcl>0?`F ${fmt(Fcl/1000,1)} kN`:''},V1:{i:st.si},P1:{on:true,ang:st.ang},RV:{open:rvOpen},PRV:{open},
        CUT:{o:open,ui:r.pin/pm,uo:r.po/pm,ul:c.blk?r.po/pm:0},
        TBL:{t:[['במצב רגיל','סגור','פתוח'],['חש בלחץ','הכניסה','היציאה'],['ניקוז הקפיץ','פנימי','חיצוני – L'],['גבול [bar]',fmt(P.pin+B7_ROV,0),fmt(pcl,0)],['פתוח כעת',`${fmt(rvOpen*100,0)}%`,`${fmt(open*100,0)}%`]],
          c:[[],[],[],[],['',rvOpen>.02?'#dc2626':'#16a34a',open>.02?'#16a34a':'#dc2626']]}},
      read:[{k:'לחץ כניסה',v:r.pin,u:'bar'},{k:'לחץ מופחת',v:r.po,u:'bar',w:r.po>pcl+1},{k:'כוח הידוק',v:Fcl/1000,u:'kN',dg:2,max:Math.max(pcl,P.pset)*A1/1e4*1.3},{k:'פתיחת ווסת הלחץ',v:open*100,u:'%',dg:0,max:100},
        {k:'ספיקה בווסת לחץ',v:r.Qi,u:'L/min',max:P.Q},{k:'ספיקה בשסתום הפריקה',v:r.Qr,u:'L/min',max:P.Q},{k:'מיקום הבוכנה',v:st.x,u:'mm',max:S}]};},
  ins(P,R){const L=[],r=R.r,A1=R.A1;
    if(R.dir!==0&&!r.stall)L.push({ic:'🟢',at:'PRV',h:`תנועה: הצילינדר צריך רק ${fmt(r.po,1)} bar, הרבה מתחת לכיוון – ווסת הלחץ <b>פתוח לגמרי</b> (מצב רגיל פתוח) ומפל הלחץ עליו ${fmt(r.pin-r.po,2)} bar בלבד.`});
    if(R.Fcl>0&&r.po<=R.pcl+.5&&r.pin>R.pcl+1)L.push({ic:'🗜️',at:'CUT',h:`החלק מהודק: הלחץ ביציאה עלה ל-${fmt(r.po,1)} bar והספול נסגר. בכניסה – <b>${fmt(r.pin,0)} bar</b>, ובצילינדר רק ${fmt(r.po,1)} bar: כוח הידוק ${fmt(R.Fcl/1000,2)} kN = p·A₁.`});
    if(r.pin<=R.pcl+.5&&r.stall)L.push({ic:'⚠️',w:true,at:'G1',h:`לחץ הכניסה (${fmt(r.pin,1)} bar) נמוך מהכיוון (${fmt(R.pcl,0)} bar): ווסת הלחץ פתוח לגמרי והיציאה שווה לכניסה. <b>ווסת לחץ לא יכול להעלות לחץ</b>.`,c:'הכניסה נמוכה מהכיוון – ווסת הלחץ פתוח'});
    if(r.po>R.pcl+1)L.push({ic:'⚠️',w:true,at:'G2',h:`הלחץ ביציאה ${fmt(r.po,0)} bar – גבוה מהכיוון (${fmt(R.pcl,0)} bar)! משהו מונע מהספול לזוז ולסגור.`,c:'הלחץ המופחת גבוה מהכיוון'});
    L.push({ic:'↔️',at:'TBL',h:'<b>שסתום פריקה</b>: סגור במצב רגיל, חש בכניסה ונפתח למיכל – מגביל את הלחץ <i>לפניו</i>. <b>ווסת לחץ</b>: פתוח במצב רגיל, חש ביציאה ונסגר – שומר על לחץ <i>אחריו</i> ולא מעביר שמן למיכל.'});
    L.push({ic:'🔩',at:'PRV',h:'הקפיץ של ווסת הלחץ בצד שבו יש לחץ ביציאה, לכן תא הקפיץ חייב <b>ניקוז חיצוני (L)</b> למיכל. בשסתום פריקה היציאה היא המיכל, והניקוז פנימי.'});
    L.push({ic:'💡',h:`ענף ההידוק לא "מבזבז" את הלחץ: כשהחלק מהודק אין ספיקה בווסת לחץ, אבל המשאבה עדיין עובדת ב-${fmt(r.pin,0)} bar וכל ${fmt(P.Q,0)} L/min עוברים בשסתום הפריקה הראשי – ${fmt(H.kW(r.pin,r.Qr),2)} kW חום.`});return L;},
  calc(P,R){const c=R.c,A1=R.A1,pcl=R.pcl,r=R.r;return `<div class="kpis">${kpi('לחץ סגירה',fmt(pcl,1),'bar')}${kpi('כוח הידוק צפוי',fmt(Math.min(pcl,P.pin+B7_ROV)*A1/1e4,2),'kN')}${kpi('לחץ כניסה',fmt(r.pin,1),'bar')}${kpi('פתיחה',fmt(R.open*100,0),'%')}</div>`+
    det('כוחות על ספול ווסת הלחץ',row('שטח',`A_s = π·10²/4 = ${V(B7_RAS,'mm²')}`)+row('דריכה',`F₀ = p_set·A_s/10 − k·y₀ = ${P.pset}·${fmt(B7_RAS,1)}/10 − ${B7_RKS}·${B7_RY0} = ${V(c.F0,'N')}`)+
      row('פתיחה',`y = y₀ − (p_A·A_s/10 − F₀)/k = ${V(r.y,'mm',3)}`)+row('סגירה מלאה',`p_A = 10(F₀ + k·y₀)/A_s = ${V(pcl,'bar')}`),true)+
    det('ענף ההידוק',row('',`A₁ = π·${B7_RD}²/4 = ${V(A1,'mm²')}`)+row('כוח הידוק',`F = p_A·A₁/10 = ${fmt(Math.min(pcl,P.pin+B7_ROV),1)}·${fmt(A1,0)}/10 = ${V(Math.min(pcl,P.pin+B7_ROV)*A1/10,'N',0)}`)+
      row('בתנועה',`p_A = F_f/A₁ = 10·${B7_RFF}/${fmt(A1,0)} = ${V(10*B7_RFF/A1,'bar')}; Δp = (Q/k)² = (${fmt(P.Q,1)}/${fmt(B7_kR(B7_RY0),1)})² = ${V((P.Q/B7_kR(B7_RY0))**2,'bar')}`),true)+
    det('המעגל הראשי',row('לחץ הכניסה בהידוק',`p_P = p_relief + עקיפה = ${P.pin} + ${B7_ROV} = ${V(P.pin+B7_ROV,'bar')}`)+row('חום בשסתום הפריקה',`P = ${fmt(r.pin,1)}·${fmt(r.Qr,1)}/600 = ${V(H.kW(r.pin,r.Qr),'kW',3)}`))+
    `<div class="note">פתח ווסת הלחץ: 0.637·π·10·y (y עד 1 mm). מפלי לחץ בשסתום הפיקוד ובצנרת לא נכללים.</div>`;},
  demo:[{t:'ענף הידוק במעגל של 100 bar',x:'המשאבה ושסתום הפריקה הראשי מחזיקים 100 bar למעגל הראשי. ענף ההידוק מקבל שמן דרך <b>ווסת לחץ</b> שמכוון ל-40 bar.',reset:true,set:{auto:false,pos:'0'},hl:['PRV','MB','RV'],dur:7},
    {t:'מהלך ההידוק',x:'במצב a הצילינדר נע בלחץ נמוך (כ-2 bar). ווסת הלחץ <b>פתוח במצב רגיל</b> – הספול בחתך משאיר את המעבר P→A פתוח לגמרי.',set:{pos:'a'},hl:['PRV','CUT','C1'],dur:4},
    {t:'מגע בחלק',x:'הבוכנה נעצרת על החלק. הלחץ ביציאה עולה ל-40 bar, דוחף את הספול נגד הקפיץ וסוגר את המעבר. בכניסה – 104 bar, ביציאה – 40 bar.',set:{pos:'a'},act:(P,st)=>{st.x=Math.max(st.x,B7_RST-12);},hl:['G1','G2','CUT'],dur:7},
    {t:'חש ביציאה',x:'שימו לב לתעלה בחתך: לחץ היציאה (A) מוזן לקצה הספול. שסתום פריקה, לעומת זאת, חש בלחץ הכניסה שלו.',hl:['CUT','PRV']},
    {t:'השוואה לשסתום פריקה',x:'בטבלה: שסתום הפריקה הראשי <b>סגור במצב רגיל</b> וכעת פתוח 100% (כל הספיקה למיכל), ווסת הלחץ <b>פתוח במצב רגיל</b> וכעת סגור.',hl:['TBL','RV','PRV']},
    {t:'כניסה נמוכה מהכיוון',x:'מורידים את לחץ המערכת ל-30 bar: ווסת הלחץ פתוח לגמרי והיציאה שווה לכניסה (34 bar). ווסת לחץ לא יכול לייצר לחץ.',set:{pin:30},act:(P,st)=>{st.x=B7_RST;},hl:['G1','G2'],dur:7},
    {t:'מכוונים 70 bar',x:'לחץ מערכת 100 bar וווסת לחץ ב-70 bar: כוח ההידוק עולה ל-13.7 kN. הכיוון קובע את הכוח, לא לחץ המשאבה.',set:{pin:100,pset:70},act:(P,st)=>{st.x=B7_RST;},hl:['C1','G2'],dur:7},
    {t:'מחזור אוטומטי',x:'הידוק – החזקה – שחרור. בכל הידוק הלחץ ביציאה נעצר בכיוון, והכניסה קופצת ללחץ המערכת.',set:{pset:40,auto:true,pos:'a'},hl:['G1','G2','C1'],dur:10}],
  predict:[{q:'הצילינדר מהדק את החלק, לחץ המערכת 100 bar וווסת הלחץ מכוון ל-40 bar. מה יראה המד ביציאת ווסת הלחץ?',set:{auto:false,pos:'a'},act:(P,st)=>{st.x=B7_RST-20;},opts:['כ-104 bar','כ-40 bar','0 bar'],a:1,why:'כשאין זרימה הספול נסגר בדיוק כשלחץ היציאה מגיע לכיוון – 40 bar. הכניסה עולה ללחץ שסתום הפריקה הראשי.'},
    {q:'מורידים את לחץ המערכת ל-30 bar (ווסת הלחץ עדיין על 40). מה יהיה הלחץ בצילינדר בזמן ההידוק?',set:{auto:false,pos:'a',pin:30},act:(P,st)=>{st.x=B7_RST-20;},opts:['40 bar','כ-34 bar – כמו בכניסה','0 bar'],a:1,why:'ווסת הלחץ רק מוריד לחץ. כשהכניסה (30 + 4 עקיפה) נמוכה מהכיוון, הוא פתוח לגמרי והיציאה שווה לכניסה.'},
    {q:'בזמן מהלך ההידוק (לפני המגע) – באיזה מצב נמצא ספול ווסת הלחץ?',set:{auto:false,pos:'a'},opts:['סגור – כמו שסתום פריקה','פתוח לגמרי','חצי פתוח'],a:1,why:'הצילינדר צריך רק כ-2 bar, הרבה פחות מ-40. ווסת לחץ פתוח במצב רגיל ומתחיל להיסגר רק כשהיציאה מתקרבת לכיוון.'},
    {q:'מעלים את כיוון ווסת הלחץ מ-40 ל-80 bar. מה יקרה לכוח ההידוק?',set:{auto:false,pos:'a',pset:80},act:(P,st)=>{st.x=B7_RST-20;},opts:['לא ישתנה','יוכפל בערך','יגדל פי 4'],a:1,why:'F = p·A₁. הלחץ ביציאה מוכפל (40 → 80) ולכן גם הכוח: כ-7.9 → 15.7 kN.'}],
  tasks:[{q:P=>`ווסת לחץ מכוון ל-${P.tp} bar מזין צילינדר Ø${P.tD}. מה כוח ההידוק?`,a:P=>P.tp*H.A(P.tD)/10/1000,u:'kN',hint:'F = p·A/10 (N), חלקו ב-1000.',rand:P=>{P.tp=rnd(20,120,5);P.tD=pick([32,40,50,63,80]);}},
    {q:P=>`נדרש כוח הידוק של ${P.tF} kN בצילינדר Ø${P.tD}. לאיזה לחץ יש לכוון את ווסת הלחץ?`,a:P=>P.tF*1000*10/H.A(P.tD),u:'bar',hint:'p = 10·F/A.',rand:P=>{P.tF=rnd(2,25,1);P.tD=pick([40,50,63,80]);}},
    {q:P=>`ספול Ø10, לחץ סגירה ${P.tp} bar, קפיץ 40 N/mm, פתיחה מלאה 1 mm. מה כוח הדריכה F₀?`,a:P=>P.tp*B7_RAS/10-40,u:'N',hint:'בסגירה: p·A/10 = F₀ + k·y₀.',rand:P=>{P.tp=rnd(20,150,5);}},
    {q:P=>`שסתום הפריקה הראשי פתוח ב-${P.pin} bar ו-${P.Q} L/min עוברים בו בזמן ההידוק. כמה חום נוצר?`,a:P=>P.pin*P.Q/600,u:'kW',hint:'P = p·Q/600.',rand:P=>{P.pin=rnd(60,200,10);P.Q=rnd(8,40,1);}}],
  faults:[{id:'drain',t:'קו הניקוז L של ווסת הלחץ חסום',sym:'"החלקים נמעכים – הצילינדר לוחץ הרבה יותר חזק ממה שכוון."',hint:'השוו את מד היציאה למד הכניסה בזמן ההידוק.',why:'השמן שזולג לתא הקפיץ לא יכול לצאת. הלחץ שנכלא שם דוחף את הספול יחד עם הקפיץ, השסתום נשאר פתוח ולחץ היציאה עולה עד לחץ המערכת.'},
    {id:'spring',t:'קפיץ ווסת הלחץ עייף / שבור',sym:'"החלקים זזים בזמן העיבוד – כוח ההידוק חלש, למרות שלא נגענו בכיוון."',hint:'מה מראה מד היציאה בהידוק לעומת הכיוון? ומה מראה מד הכניסה?',why:'דריכת הקפיץ קטנה: הספול נסגר כבר בכ-24 bar. מד הכניסה תקין (104 bar), כך שהבעיה בווסת לחץ ולא במעגל הראשי.'},
    {id:'relief',t:'שסתום הפריקה הראשי מכויל נמוך / דולף',sym:'"כוח ההידוק חלש, וגם המכבש הראשי לא מגיע לכוח שלו."',hint:'הסתכלו על מד הכניסה בזמן ההידוק – האם הוא מעל כיוון ווסת הלחץ?',why:'הלחץ במערכת מוגבל לכ-34 bar – פחות מכיוון ווסת הלחץ. ווסת הלחץ פתוח לגמרי ולא יכול לעזור: היציאה שווה לכניסה.'}],
  test(H){const P=clone(this.P);P.auto=false;P.pos='a';const {R,st}=runSim(this,P,3);const P2=clone(this.P);P2.auto=false;P2.pos='a';const R2=runSim(this,P2,.3).R;
    const P3=clone(this.P);P3.auto=false;P3.pos='a';P3.pin=30;const R3=runSim(this,P3,3).R;const A1=H.A(50),Ar=PI*100/4;
    return [['לחץ סגירה = כיוון',R.r.po,40],['כוח הידוק F = p·A₁',R.Fcl,40*A1/10],['כניסה = כיול + עקיפה',R.r.pin,104],['תנועה: v = Q/A₁',R2.r.v,H.v(12,A1)],
      ['תנועה: Δp = (Q/k)²',R2.r.pin-R2.r.po,(12/(.637*PI*10))**2],['כניסה נמוכה: יציאה = כניסה',R3.r.po,34],['F₀ = p·A_s/10 − k·y₀',B7_rdCfg(P,null).F0,40*Ar/10-40],['UI לחץ מופחת',R.read[1].v,R.r.po]];}};

/* ---------- 27 · sequence valve ---------- */
const B7_SQA=H.A(8),B7_SQK=25,B7_SQY=1.5,B7_SOV=4,B7_PCK=.5,B7_F2R=500;
const B7_kS=y=>H.orK(PI*8*y);
const B7_C1={D:40,d:22,S:100},B7_C2={D:50,d:28,S:150};
function B7_sqCfg(P,f){return {ps:f==='lowset'?6:P.pseq,lock:f==='drain'||P.drain==='blk',pr:f==='relief'?35:P.pr};}
const B7_sqY=(p,c)=>c.lock?0:clamp((p-c.ps)*B7_SQA/10/B7_SQK,0,B7_SQY);
const B7_SIM_SEQ={id:'seq',n:27,t:'שסתום רצף',d:'הענף השני מקבל שמן רק אחרי שהלחץ בכניסה עובר את הכיוון; ניקוז חיצוני ותקלת ניקוז חסום',
  P:{pseq:50,F1:2500,F2:2000,Q:12,pr:100,pos:'a',auto:true,drain:'ext',tD:40},
  ui(U,P){U.grp('שסתום הרצף');U.num(P,'pseq','לחץ פתיחה (כיוון)','bar',{min:5,max:150,step:5});U.sel(P,'drain','קו ניקוז L',[['ext','מחובר למיכל'],['blk','חסום (ניסוי)']]);
    U.grp('עומסים');U.num(P,'F1','כוח להזזת צילינדר 1 (הידוק)','N',{min:0,max:10000,step:100});U.num(P,'F2','עומס על צילינדר 2 (עבודה)','N',{min:0,max:20000,step:250});
    U.grp('הפעלה');U.seg(P,'pos','שסתום פיקוד',KIT.pos3);U.chk(P,'auto','מחזור אוטומטי');
    U.grp('משאבה ושסתום פריקה',false);U.num(P,'Q','ספיקת משאבה','L/min',{min:2,max:40,step:1});U.num(P,'pr','כיול שסתום פריקה','bar',{min:20,max:250,step:5});},
  circuit(P){return {comps:[{id:'C1',type:'cyl',x:100,y:50,o:{load:{t:''}},name:'צילינדר 1 – הידוק (נע ראשון)',lbl:'1 · הידוק',lblAt:[-36,-24],l3:[0,-34]},
      {id:'C2',type:'cyl',x:480,y:50,flip:true,name:'צילינדר 2 – עבודה (נע אחרי שהלחץ עובר את הכיוון)',lbl:'2 · עבודה',lblAt:[40,-24],val:R=>`F₂ ${fmt(P.F2/1000,1)} kN`,valAt:[-74,-24],l3:[0,-34]},
      {id:'SQ',type:'pv',x:530,y:140,o:{kind:'seq'},name:'שסתום רצף: חש בלחץ הכניסה, ניקוז חיצוני L',lbl:'רצף',lblAt:[34,-10],l3:[0,-30]},
      {id:'CK',type:'check',x:490,y:140,rot:180,o:{spring:true},name:'אל-חוזר עוקף – לחזרת צילינדר 2',lbl:'עוקף',lblAt:[-26,4]},
      {id:'G1',type:'gauge',x:200,y:193,net:'A',name:'מד 1 – לחץ כניסה (קו A)',valAt:[-16,-2],l3:[0,-30]},{id:'G2',type:'gauge',x:542,y:82,rot:90,net:'O',name:'מד 2 – לחץ לצילינדר 2',valAt:[18,-2],l3:[0,-30]},
      {id:'T4',type:'tank',x:580,y:176,name:'מיכל (ניקוז L)'},
      {id:'V1',type:'dcv',x:240,y:250,o:{box:KIT.D43.closed,L:'sol',R:'sol',center:true},name:'שסתום פיקוד 4/3 – לחיצה מחליפה מצב',lbl:'4/3',lblAt:[-100,4]},
      {id:'P1',type:'pump',x:160,y:330,name:'משאבה',lbl:'משאבה',lblAt:[32,6]},{id:'T1',type:'tank',x:160,y:374,name:'מיכל'},
      {id:'RV',type:'pv',x:110,y:290,rot:-90,o:{kind:'relief'},name:'שסתום פריקה',lbl:'פריקה',lblAt:[0,-28]},{id:'T2',type:'tank',x:70,y:320,name:'מיכל'},{id:'T3',type:'tank',x:290,y:296,name:'מיכל'},
      {id:'CH',type:'b7_chart',x:345,y:268,o:{w:190,h:64,t:'לחץ לאורך זמן',xl:'זמן [s]',yl:'p [bar]',leg:true,s:[{c:'#94a3b8',d:'5 3',w:1.4,n:'כיוון'},{c:'#0b72d9',w:2,n:'מד 1 כניסה'},{c:'#ea580c',w:1.6,n:'מד 2 צילינדר 2'}]},name:'גרף לחץ–זמן: כניסה, צילינדר 2 וקו הכיוון'}],
     lines:[{id:'LS',net:'S',pts:['T1.t','P1.in']},{id:'LP',net:'P',pts:['P1.out',[160,290],[233,290],'V1.P']},{id:'LRV',net:'P',pts:[[160,290],'RV.P']},{id:'LRT',net:'T',pts:['RV.T',[70,290],'T2.t']},
      {id:'LT',net:'T',pts:['V1.T',[247,278],[290,278],'T3.t']},
      {id:'LA1',net:'A',pts:['V1.A',[233,205],[50,205],'C1.A']},{id:'LA2',net:'A',pts:[[233,205],[530,205],'SQ.P']},{id:'LCK1',net:'A',pts:['CK.out',[490,205]]},
      {id:'LO',net:'O',pts:['SQ.T','C2.A']},{id:'LCK2',net:'O',pts:['CK.in',[490,100],[530,100]]},{id:'LDR',net:'L',kind:'drain',pts:['SQ.L',[580,156],'T4.t']},
      {id:'LB1',net:'B',pts:['V1.B',[247,175],[150,175],'C1.B']},{id:'LB2',net:'B',pts:[[247,175],[430,175],'C2.B']}]};},
  init:P=>({x1:0,x2:0,po:0,si:KIT.idx[P.pos],tr:[]}),
  click(id,P){if(id==='V1'){P.pos=P.pos==='a'?'0':P.pos==='0'?'b':'a';P.auto=false;return true;}},
  step(P,st,dt,ctx){const f=ctx.fault,c=B7_sqCfg(P,f),Q=P.Q;const A11=H.A(B7_C1.D),A12=H.Aann(B7_C1.D,B7_C1.d),A21=H.A(B7_C2.D),A22=H.Aann(B7_C2.D,B7_C2.d),S1=B7_C1.S,S2=B7_C2.S;
    const e1=st.x1>=S1-1e-6,e2=st.x2>=S2-1e-6,h1=st.x1<=1e-6,h2=st.x2<=1e-6;B7_cyc(P,st,dt,e1&&e2,h1&&h2,1,.8);const dir=KIT.dirOf(P.pos);
    const Qr=p=>H.reliefQ(p,c.pr,B7_SOV,Q),pst=c.pr+B7_SOV;let pin=0,pB=0,po=st.po,Q1=0,Q2=0,QR=0,v1=0,v2=0,y=0;const p1=10*P.F1/A11,p2=10*P.F2/A21;
    if(dir>0){const Q2f=p=>{if(e2)return 0;const yy=B7_sqY(p,c);return yy>0&&p>p2?B7_kS(yy)*Math.sqrt(p-p2):0;};
      if(!e1&&Q2f(p1)+Qr(p1)<Q){pin=p1;Q2=Q2f(p1);QR=Qr(p1);Q1=Q-Q2-QR;}else{pin=H.bisect(p=>Q2f(p)+Qr(p)-Q,0,pst+B7_SOV);Q2=Q2f(pin);QR=Qr(pin);}
      y=B7_sqY(pin,c);v1=H.v(Q1,A11);v2=H.v(Q2,A21);po=Q2>1e-6?p2:y>0?pin:e2?st.po:0;pB=0;}
    else if(dir<0){const n1=10*P.F1/A12,n2=(10*B7_F2R+B7_PCK*A21)/A22,cand=[];if(!h1)cand.push([n1,1]);if(!h2)cand.push([n2,2]);cand.sort((a,b)=>a[0]-b[0]);
      if(cand.length&&cand[0][0]<c.pr){pB=cand[0][0];if(cand[0][1]===1)v1=-H.v(Q,A12);else{v2=-H.v(Q,A22);}}else{pB=pst;QR=Q;}
      pin=0;po=v2<0?B7_PCK:0;y=0;}
    else{QR=Q;pin=st.pin0??0;}
    st.x1=clamp(st.x1+v1*dt,0,S1);st.x2=clamp(st.x2+v2*dt,0,S2);st.po=po;if(dir>0)st.pin0=pin;KIT.ease(st,'si',KIT.idx[P.pos],dt);KIT.rpmAng(st,dt,1450);
    const pP=dir>0?pin:dir<0?pB:pst;B7_trace(st,dt,[pin,po],6);const tt=st.tt||0,t0=Math.max(0,tt-6);
    const F1c=st.x1>=S1-1e-6&&dir>0?pin*A11/10:0,pm=P.pr+B7_SOV,ymx=Math.ceil((Math.max(P.pr,P.pseq)+10)/20)*20;
    const qA1=dir>0?Q1:-H.Q(-v1,A11),qO=dir>0?Q2:-H.Q(-v2,A21);
    return {pin,po,pB,pP,Q1,Q2,QR,y,v1,v2,p1,p2,F1c,dir,c,A11,A21,e1:st.x1>=S1-1e-6,e2:st.x2>=S2-1e-6,
      p:{P:pP,A:pin,O:po,B:pB,T:Math.min(1,Math.abs(qA1)/Q+Math.abs(qO)/Q)*.3,L:c.lock&&dir>0?Math.min(pin,po+5):0,S:-.05},
      q:{LS:Q,LP:Q,LRV:QR,LRT:QR,LA1:qA1+(dir>0?Q2:0),LA2:dir>0?Q2:0,LCK1:dir<0?-qO:0,LO:qO,LCK2:dir<0?qO:0,LB1:dir>0?-H.Q(v1,A12):H.Q(-v1,A12),LB2:dir>0?-H.Q(v2,A22):H.Q(-v2,A22),LT:Math.abs(qA1)+Math.abs(qO)},pmax:pm,qref:Q,
      c:{C1:{x:st.x1/S1,uA:pin/pm,uB:pB/pm,lt:F1c>0?`F ${fmt(F1c/1000,1)} kN`:''},C2:{x:st.x2/S2,uA:po/pm,uB:pB/pm},SQ:{open:y/B7_SQY},CK:{open:dir<0&&v2<0?1:0},V1:{i:st.si},P1:{on:true,ang:st.ang},RV:{open:clamp(QR/Q,0,1)},
        CH:{x0:0,xm:6,ym:ymx,L:[[[0,c.ps],[6,c.ps]],st.tr.map(q=>[q[0]-t0,q[1]]),st.tr.map(q=>[q[0]-t0,q[2]])],dot:[tt-t0,pin]}},
      read:[{k:'מד 1 – כניסה',v:pin,u:'bar'},{k:'מד 2 – צילינדר 2',v:po,u:'bar'},{k:'פתיחת שסתום הרצף',v:y/B7_SQY*100,u:'%',dg:0,max:100},{k:'ספיקה לענף 2',v:Q2,u:'L/min',max:Q},
        {k:'מיקום צילינדר 1',v:st.x1,u:'mm',max:S1},{k:'מיקום צילינדר 2',v:st.x2,u:'mm',max:S2},{k:'כוח הידוק צילינדר 1',v:F1c/1000,u:'kN',dg:2,max:P.pr*A11/1e4}]};},
  ins(P,R){const L=[],c=R.c;
    if(R.dir>0&&R.v1>0&&R.Q2<1e-3)L.push({ic:'1️⃣',at:'C1',h:`שלב 1: צילינדר ההידוק נע ב-${fmt(R.p1,1)} bar. זה פחות מכיוון שסתום הרצף (${fmt(P.pseq,0)} bar), ולכן הענף השני סגור.`});
    if(R.dir>0&&R.Q2>1e-3&&R.v1===0)L.push({ic:'2️⃣',at:'SQ',h:`שלב 2: צילינדר 1 נעצר, הלחץ עלה ל-<b>${fmt(R.pin,1)} bar</b> ושסתום הרצף נפתח. צילינדר 2 צריך ${fmt(R.p2,1)} bar – ${R.pin-R.po>3?`השסתום מצר ומפיל ${fmt(R.pin-R.po,1)} bar (${fmt(H.kW(R.pin-R.po,R.Q2),2)} kW חום), וכך שומר על לחץ ההידוק`:'השסתום פתוח לגמרי והכניסה עוקבת אחרי העומס'}.`});
    if(R.dir>0&&R.Q2>1e-3&&R.v1>0)L.push({ic:'⚠️',w:true,at:'C2',h:`שני הצילינדרים זזים יחד: הלחץ שצילינדר 1 צריך (${fmt(R.p1,1)} bar) כבר פותח את שסתום הרצף. הסדר נשבר!`,c:'צילינדר 2 זז לפני סוף ההידוק'});
    if(R.dir>0&&R.Q2>1e-3&&R.v1===0&&!R.e1)L.push({ic:'⚠️',w:true,at:'C2',h:`צילינדר 2 נע <b>לפני</b> שצילינדר 1 סיים: הלחץ בכניסה (${fmt(R.pin,1)} bar) נמוך מ-${fmt(R.p1,1)} bar שצילינדר 1 צריך. שסתום הרצף נפתח מוקדם מדי.`,c:'הסדר התהפך – צילינדר 2 ראשון'});
    if(R.dir>0&&R.Q2<1e-3&&R.v1===0&&R.v2===0&&!R.e2&&R.QR>.5&&R.pin>c.ps+2)L.push({ic:'⛔',w:true,at:'SQ',h:`הלחץ בכניסה ${fmt(R.pin,0)} bar – מעל הכיוון – ובכל זאת השסתום סגור וצילינדר 2 לא זז. הספול לא מצליח לזוז.`,c:'הלחץ מעל הכיוון והשסתום סגור'});
    if(R.dir>0&&R.Q2<1e-3&&R.v1===0&&!R.e2&&R.pin<c.ps-1&&R.QR>.5)L.push({ic:'⛔',w:true,at:'G1',h:`הלחץ בכניסה נעצר ב-${fmt(R.pin,0)} bar – מתחת לכיוון שסתום הרצף (${fmt(P.pseq,0)} bar). הספיקה בורחת דרך שסתום הפריקה לפני שהשסתום נפתח.`,c:'הלחץ לא מגיע לכיוון'});
    if(R.dir>0&&R.p2>P.pseq&&R.Q2>1e-3)L.push({ic:'📈',at:'G2',h:`העומס בענף 2 (${fmt(R.p2,1)} bar) גבוה מהכיוון: השסתום פתוח לגמרי והלחץ ביציאה <b>גבוה מהכיוון</b>. בגלל זה תא הקפיץ חייב ניקוז חיצוני – אחרת לחץ היציאה היה נדחף מאחורי הספול.`});
    if(R.dir<0)L.push({ic:'↩️',at:'CK',h:`חזרה: השמן מצילינדר 2 עוקף את שסתום הרצף דרך האל-חוזר. הצילינדר שצריך פחות לחץ חוזר ראשון (צילינדר 2: ${fmt((10*B7_F2R+B7_PCK*R.A21)/H.Aann(B7_C2.D,B7_C2.d),1)} bar, צילינדר 1: ${fmt(10*P.F1/H.Aann(B7_C1.D,B7_C1.d),1)} bar).`});
    L.push({ic:'🎯',h:`כלל אצבע: כיוון שסתום הרצף לפחות 10–15% (או 5–10 bar) מעל הלחץ המקסימלי של השלב הראשון – כאן ${fmt(R.p1,1)} bar, והכיוון ${fmt(P.pseq,0)} bar.`});
    L.push({ic:'🔩',at:'SQ',h:'שסתום רצף דומה בסמל לשסתום הפריקה, אבל היציאה שלו היא קו עבודה בלחץ ולא מיכל – לכן הקפיץ מנוקז בנפרד (L).'});return L;},
  calc(P,R){const c=R.c,A11=R.A11,A21=R.A21,A12=H.Aann(B7_C1.D,B7_C1.d),A22=H.Aann(B7_C2.D,B7_C2.d),yp=B7_sqY(R.pin,c);
    return `<div class="kpis">${kpi('צילינדר 1 צריך',fmt(R.p1,1),'bar')}${kpi('כיוון הסדר',fmt(P.pseq,0),'bar')}${kpi('צילינדר 2 צריך',fmt(R.p2,1),'bar')}${kpi('הידוק בשלב 2',fmt(Math.max(R.pin,P.pseq)*A11/1e4,2),'kN')}</div>`+
      det('שלב 1 – הידוק',row('',`A₁ = π·${B7_C1.D}²/4 = ${V(A11,'mm²')}`)+row('לחץ',`p₁ = 10·F₁/A₁ = 10·${P.F1}/${fmt(A11,0)} = ${V(R.p1,'bar')}`)+row('תנאי סדר',`p₁ < p_seq: ${fmt(R.p1,1)} ${R.p1<P.pseq?'<':'≥'} ${fmt(P.pseq,0)}`,R.p1<P.pseq)+row('מהירות',`v₁ = Q/A₁ = ${V(H.v(P.Q,A11),'mm/s')}`),true)+
      det('שלב 2 – עבודה',row('לחץ העומס',`p₂ = 10·F₂/A₂ = 10·${P.F2}/${fmt(A21,0)} = ${V(R.p2,'bar')}`)+row('פתיחת השסתום',`y = (p_in − p_seq)·A_s/(10·k) = ${V(yp,'mm',3)} (מלא ${B7_SQY} mm)`)+
        row('ספיקה',`Q = 0.637·π·8·y·${sq('p_in − p₂')} = ${V(R.Q2,'L/min')}`)+row('מהירות',`v₂ = Q/A₂ = ${V(H.v(R.Q2,A21),'mm/s')}`)+row('הפסד בשסתום',`P = (p_in − p₂)·Q/600 = ${V(H.kW(Math.max(R.pin-R.po,0),R.Q2),'kW',3)}`),true)+
      det('חזרה',row('צילינדר 2 (דרך האל-חוזר)',`p = (10·${B7_F2R} + ${B7_PCK}·${fmt(A21,0)})/${fmt(A22,0)} = ${V((10*B7_F2R+B7_PCK*A21)/A22,'bar')}`)+row('צילינדר 1',`p = 10·${P.F1}/${fmt(A12,0)} = ${V(10*P.F1/A12,'bar')}`))+
      `<div class="note">ספול Ø8, קפיץ 25 N/mm, פתיחה מלאה 1.5 mm (כ-7.5 bar מעל הכיוון). מפלי לחץ בשסתום הפיקוד ובצנרת לא נכללים.</div>`;},
  demo:[{t:'שני צילינדרים, סדר קבוע',x:'צילינדר 1 מהדק, צילינדר 2 עובד. ביניהם <b>שסתום רצף</b> בקו של צילינדר 2. בלי השסתום, צילינדר 2 (10 bar) היה זז לפני צילינדר 1 (20 bar).',reset:true,set:{auto:false,pos:'0'},hl:['C1','C2','SQ'],dur:8},
    {t:'שלב 1: הידוק',x:'שסתום הפיקוד במצב a. צילינדר 1 נע ב-20 bar – פחות מ-50 bar, ולכן שסתום הרצף סגור והענף השני מחכה.',set:{pos:'a'},hl:['C1','G1','SQ'],dur:4},
    {t:'הלחץ עולה עד הכיוון',x:'צילינדר 1 נעצר על החלק, הלחץ עולה ל-50 bar והשסתום נפתח. הכניסה נשארת כ-51 bar לכל אורך התנועה של צילינדר 2 – ההידוק נשמר.',set:{pos:'a'},act:(P,st)=>{if(st.x1<B7_C1.S-8){st.x1=B7_C1.S-8;st.x2=0;}},hl:['SQ','CH','C2'],dur:6},
    {t:'ניקוז חיצוני',x:'הקו המנוקד L מנקז את תא הקפיץ למיכל. אם הוא נחסם, השמן הכלוא נועל את הספול – השסתום לא נפתח והמשאבה עולה על שסתום הפריקה.',hl:['SQ','T4']},
    {t:'כיוון נמוך מדי',x:'כיוון 15 bar – פחות ממה שצילינדר 1 צריך. השסתום נפתח מוקדם וצילינדר 2 נע <b>ראשון</b>. הסדר נשבר.',set:{pseq:15},act:(P,st)=>{st.x1=0;st.x2=0;P.pos='a';},hl:['C2','SQ','G1'],dur:6},
    {t:'עומס כבד בענף 2',x:'כיוון 50 bar ועומס 12 kN על צילינדר 2 (61 bar): השסתום פתוח לגמרי, הלחץ ביציאה <b>מעל</b> הכיוון. בשונה מווסת לחץ – שסתום רצף לא מגביל את היציאה.',set:{pseq:50,F2:12000},act:(P,st)=>{st.x1=0;st.x2=0;P.pos='a';},hl:['G2','SQ','CH'],dur:7},
    {t:'חזרה דרך האל-חוזר',x:'במצב b השמן מצילינדר 2 חוזר דרך האל-חוזר העוקף. צילינדר 2 צריך פחות לחץ – ולכן חוזר ראשון.',set:{F2:2000,pos:'b'},act:(P,st)=>{st.x1=B7_C1.S;st.x2=B7_C2.S;},hl:['CK','C2'],dur:6},
    {t:'מחזור אוטומטי',x:'בגרף: הכניסה מטפסת מ-20 bar לכיוון, נשארת בו בזמן תנועת צילינדר 2, וקופצת לשסתום הפריקה בסוף.',set:{auto:true,pos:'a'},hl:['CH'],dur:10}],
  predict:[{q:'מורידים את כיוון שסתום הרצף ל-15 bar (צילינדר 1 צריך 20 bar, צילינדר 2 צריך 10 bar). איזה צילינדר ינוע ראשון?',set:{pseq:15,auto:false,pos:'a'},opts:['צילינדר 1, כרגיל','צילינדר 2','שניהם לא זזים'],a:1,why:'הלחץ עולה, ב-15 bar השסתום נפתח, ולצילינדר 2 (10 bar) מספיק כ-16.5 bar בכניסה כדי לקבל את כל הספיקה. צילינדר 1 מחכה עד שצילינדר 2 יגיע לסוף.'},
    {q:'קו הניקוז L של שסתום הרצף חסום. מה יקרה כשצילינדר 1 יגיע לסוף המהלך?',set:{drain:'blk',auto:false,pos:'a'},opts:['צילינדר 2 יזוז רגיל','צילינדר 2 לא יזוז והלחץ יעלה לשסתום הפריקה','צילינדר 2 יזוז מהר יותר'],a:1,dur:5,why:'השמן בתא הקפיץ לא יכול לצאת, הספול נעול. הלחץ בכניסה עולה עד שסתום הפריקה וצילינדר 2 נשאר במקום.'},
    {q:'עומס של 12 kN על צילינדר 2 (61 bar), הכיוון 50 bar. מה יראה מד 1 (כניסה) בזמן שצילינדר 2 נע?',set:{F2:12000,auto:false,pos:'a'},act:(P,st)=>{st.x1=B7_C1.S;},opts:['50 bar בדיוק','כ-61 bar – לפי העומס','100 bar'],a:1,why:'השסתום פתוח לגמרי כי הכניסה מעל הכיוון. הלחץ נקבע בעומס של צילינדר 2 (61.1 bar) ועוד מפל קטן בשסתום.'},
    {q:'צילינדר 2 נע (עומס 10 bar) והכיוון 50 bar. מה כוח ההידוק של צילינדר 1 (Ø40) בזמן הזה?',set:{auto:false,pos:'a'},act:(P,st)=>{st.x1=B7_C1.S;},opts:['כ-2.5 kN (כמו בתנועה)','כ-6.4 kN','0'],a:1,why:'הכניסה נשארת ב-~51 bar כי השסתום מצר את הזרימה. F = 51·1257/10 ≈ 6.4 kN.'}],
  tasks:[{q:P=>`צילינדר הידוק Ø${P.tD} צריך ${P.F1} N כדי לנוע. מה הלחץ שלו בתנועה?`,a:P=>10*P.F1/H.A(P.tD),u:'bar',hint:'p = 10·F/A.',rand:P=>{P.F1=rnd(500,8000,100);P.tD=pick([32,40,50,63]);}},
    {q:P=>`שלב 1 צריך ${fmt(10*P.F1/H.A(40),1)} bar. מה הכיוון המינימלי של שסתום הרצף עם מרווח של 15%?`,a:P=>1.15*10*P.F1/H.A(40),u:'bar',hint:'p_seq = 1.15·p₁.',rand:P=>{P.F1=rnd(1000,8000,100);}},
    {q:P=>`שסתום הרצף מכוון ל-${P.pseq} bar וצילינדר 1 (Ø40) מהדק. מה כוח ההידוק כשצילינדר 2 נע?`,a:P=>P.pseq*H.A(40)/10/1000,u:'kN',hint:'בזמן שלב 2 הכניסה נשארת בערך בכיוון: F = p·A/10.',tol:.05,rand:P=>{P.pseq=rnd(20,120,5);}},
    {q:P=>`הכניסה ${P.pseq} bar, צילינדר 2 צריך ${fmt(10*P.F2/H.A(50),1)} bar ו-${P.Q} L/min עוברים בשסתום. כמה הספק הופך לחום בשסתום?`,a:P=>Math.max(P.pseq-10*P.F2/H.A(50),0)*P.Q/600,u:'kW',hint:'P = Δp·Q/600.',rand:P=>{P.pseq=rnd(40,120,5);P.F2=rnd(500,6000,250);P.Q=rnd(5,30,1);}}],
  faults:[{id:'drain',t:'קו הניקוז L חסום',sym:'"צילינדר ההידוק יוצא, אבל צילינדר העבודה לא זז אף פעם, והמשאבה מרעישה."',hint:'מה מראה מד 1 כשצילינדר 1 בסוף המהלך – מעל הכיוון או מתחתיו?',why:'הלחץ בכניסה מגיע לכיול שסתום הפריקה – הרבה מעל הכיוון – ובכל זאת השסתום סגור. השמן הכלוא בתא הקפיץ נועל את הספול. פותחים את קו הניקוז למיכל (ולא לקו לחץ!).'},
    {id:'lowset',t:'קפיץ שסתום הרצף שבור / הכיוון השתחרר',sym:'"לפעמים המקדח יורד לפני שהחלק מהודק."',hint:'עקבו אחרי מד 1 ומיקומי הצילינדרים בתחילת המחזור.',why:'השסתום נפתח כבר בכ-6 bar. צילינדר 2 צריך פחות לחץ מצילינדר 1, ולכן הוא נע ראשון – לפני ההידוק.'},
    {id:'relief',t:'שסתום הפריקה מכויל נמוך מהכיוון',sym:'"ההידוק עובד, אבל צילינדר העבודה לא זז והשמן מתחמם."',hint:'השוו את הלחץ המקסימלי במד 1 לכיוון שסתום הרצף.',why:'שסתום הפריקה נפתח בכ-35 bar – לפני שהלחץ מגיע ל-50 bar. השסתום תקין, אבל לעולם לא מגיע לכיוון שלו. כיול שסתום הפריקה חייב להיות מעל כיוון הסדר.'}],
  test(H){const mk=(o,t)=>{const P=Object.assign(clone(this.P),{auto:false,pos:'a'},o);return runSim(this,P,t);};
    const a=mk({},.3).R,b=mk({},2).R,c=mk({},6).R,d=mk({drain:'blk'},3).R;const A11=H.A(40),A21=H.A(50),p2=10*2000/A21;
    const y=(b.pin-50)*B7_SQA/10/B7_SQK;
    return [['שלב 1: p = F₁/A₁',a.pin,10*2500/A11],['שלב 1: v = Q/A₁',a.v1,H.v(12,A11)],['שלב 2: Q = 0.637·π·8·y·√(p−p₂)',b.Q2,.637*PI*8*y*Math.sqrt(b.pin-p2)],['שלב 2: כל הספיקה לענף',b.Q2,12],
      ['הידוק בשלב 2 = p·A₁',b.F1c,b.pin*A11/10],['סוף מחזור: שסתום פריקה',c.pin,104],['ניקוז חסום: צילינדר 2 לא זז',d.v2,0],['UI מד 1',b.read[0].v,b.pin]];}};

/* ---------- 28 · unloading valve (accumulator charging circuit) ---------- */
const B7_KLK=.6,B7_PUN=4,B7_VGM=10,B7_ROVU=5,B7_PMIN=15;
const B7_acP=(V,p0,V0)=>V>1e-9?(p0+1)*V0/Math.max(V0-V,1e-6)-1:0,B7_acV=(p,p0,V0)=>p>p0?V0*(1-(p0+1)/(p+1)):0;
function B7_unExp(P,p0){const pon=P.poff*(1-P.dif/100),V1=B7_acV(pon,p0,P.V0),V2=B7_acV(P.poff,p0,P.V0),dV=V2-V1,Qn=P.Q-P.Qc;if(Qn<=0||dV<=0||P.Qc<=0)return null;
  const tch=dV/(Qn/60),tun=dV/(P.Qc/60),I=(p0+1)*P.V0*Math.log((P.V0-V1)/(P.V0-V2))-dV,Ech=P.Q/600*60/Qn*(I+(B7_PCK+1)*dV),Eun=H.kW(B7_PUN,P.Q)*tun;  // ∫p·dV for the isothermal gas
  return {dV,tch,tun,avg:(Ech+Eun)/(tch+tun),uf:tun/(tch+tun)};}
function B7_unCh(pa,Q,prv){const g=p=>{const qi=Math.max(Q-H.reliefQ(p,prv,B7_ROVU,Q),0);return p-pa-B7_PCK-(qi/Q)**2;};const pp=H.bisect(g,pa,pa+60);const Qr=Math.min(H.reliefQ(pp,prv,B7_ROVU,Q),Q);return {pp,Qr,Qin:Q-Qr};}
const B7_SIM_UNL={id:'unload',n:28,t:'שסתום פריקה מפוקד',d:'פיקוד חיצוני ממצבר הלחץ פורק את המשאבה למיכל בלחץ נמוך; חיסכון בהספק לעומת שסתום פריקה רגיל',
  P:{type:'unload',Q:20,Qc:6,poff:120,dif:15,p0:60,V0:4,prv:140},
  key:P=>P.type,
  ui(U,P){U.grp('מעגל');U.seg(P,'type','שסתום',[['unload','פריקה (X)'],['relief','שסתום פריקה רגיל']],true);U.num(P,'Q','ספיקת משאבה','L/min',{min:5,max:60,step:1});U.num(P,'Qc','צריכת המנוע','L/min',{min:0,max:40,step:1});
    U.grp('שסתום הפריקה המפוקד');U.num(P,'poff','לחץ פריקה (פיקוד X)','bar',{min:30,max:250,step:5});U.num(P,'dif','הפרש חזרה לטעינה','%',{min:3,max:40,step:1});
    U.grp('מצבר לחץ ושסתום פריקה',false);U.num(P,'p0','לחץ טעינת גז p₀','bar',{min:5,max:200,step:5});U.num(P,'V0','נפח מצבר הלחץ','L',{min:.5,max:40,step:.5});U.num(P,'prv','כיול שסתום הפריקה של המשאבה','bar',{min:50,max:300,step:5});},
  circuit(P){const un=P.type==='unload';return {comps:[{id:'P1',type:'pump',x:100,y:330,name:'משאבה',lbl:'משאבה',lblAt:[32,6],l3:[0,-30]},{id:'T1',type:'tank',x:100,y:374,name:'מיכל'},
      {id:'GP',type:'gauge',x:140,y:238,net:'PP',name:'מד לחץ משאבה',valAt:[-14,-16],l3:[0,-30]},
      un?{id:'UV',type:'pv',x:170,y:290,rot:180,o:{kind:'unload'},name:'שסתום פריקה מפוקד: נפתח לגמרי כשלחץ הפיקוד החיצוני X מגיע לכיוון',lbl:'פריקה מפוקד',lblAt:[42,26],l3:[0,-30]}
        :{id:'UV',type:'pv',x:170,y:290,rot:180,o:{kind:'relief'},name:'שסתום פריקה רגיל (להשוואה) – מכויל ללחץ הפריקה',lbl:'פריקה',lblAt:[42,26],l3:[0,-30]},
      {id:'T2',type:'tank',x:170,y:330,name:'מיכל'},
      {id:'RV',type:'pv',x:55,y:290,rot:-90,o:{kind:'relief'},name:'שסתום פריקה של המשאבה (הגנה)',lbl:'פריקה',lblAt:[0,-28]},{id:'T5',type:'tank',x:20,y:320,name:'מיכל'},
      {id:'CK',type:'check',x:250,y:250,rot:90,o:{spring:true},name:'שסתום אל-חוזר: מחזיק את מצבר הלחץ כשהמשאבה פורקת',lbl:'אל-חוזר',lblAt:[0,-16]},
      {id:'AC',type:'accum',x:330,y:215,name:'מצבר לחץ הידראולי (גז)',lbl:'מצבר',lblAt:[-28,-12],l3:[0,-40]},
      {id:'GA',type:'gauge',x:380,y:238,net:'A',name:'מד לחץ המצבר (= לחץ הפיקוד X)',valAt:[2,-20],l3:[0,-30]},
      {id:'FC',type:'fcv',x:440,y:210,name:'ווסת זרימה – מזין את המנוע בספיקה קבועה',lbl:'ווסת',lblAt:[30,4]},
      {id:'M1',type:'motor',x:440,y:150,rot:180,name:'מנוע הידראולי – הצרכן',lbl:'צרכן',lblAt:[26,0],l3:[0,-30]},{id:'T3',type:'tank',x:490,y:130,name:'מיכל'},
      {id:'BAR',type:'b7_bars',x:180,y:150,o:{w:190,t:'הספק משאבה ממוצע [kW]',n:['פריקה','שסתום פריקה רגיל']},name:'השוואת הספק: עם שסתום פריקה מפוקד מול שסתום פריקה רגיל'},
      {id:'CH',type:'b7_chart',x:290,y:305,o:{w:200,h:62,t:'לחץ לאורך זמן',xl:'זמן [s]',yl:'p [bar]',leg:true,s:[{c:'#94a3b8',d:'5 3',w:1.2,n:'פריקה/טעינה'},{c:'#94a3b8',d:'5 3',w:1.2},{c:'#0b72d9',w:2,n:'מצבר לחץ'},{c:'#ea580c',w:1.6,n:'משאבה'}]},name:'גרף: לחץ המצבר ולחץ המשאבה; קווים מקווקווים – לחץ הפריקה והחזרה לטעינה'}],
     lines:[{id:'LS',net:'S',pts:['T1.t','P1.in']},{id:'LP',net:'PP',pts:['P1.out',[100,250],'CK.in']},{id:'LRV',net:'PP',pts:[[100,290],'RV.P']},{id:'LRT',net:'T',pts:['RV.T',[20,290],'T5.t']},
      {id:'LUV',net:'PP',pts:[[170,250],'UV.P']},{id:'LUT',net:'T',pts:['UV.T','T2.t']},
      ...(un?[{id:'LX',net:'X',kind:'pilot',pts:['UV.X',[300,274],[300,250]]}]:[]),
      {id:'LA1',net:'A',pts:['CK.out',[330,250]]},{id:'LAC',net:'A',pts:[[330,250],'AC.p']},{id:'LA2',net:'A',pts:[[330,250],[440,250],'FC.in']},
      {id:'LM1',net:'M',pts:['FC.out','M1.A']},{id:'LM2',net:'T',pts:['M1.B',[440,110],[490,110],'T3.t']}]};},
  init:P=>({V:B7_acV(P.poff*(1-P.dif/100),P.p0,P.V0),m:'ch',E:0,T:0,Tu:0,tr:[],ema:null}),
  step(P,st,dt,ctx){const f=ctx.fault,un=P.type==='unload',Q=P.Q,poff=P.poff,pon=poff*(1-P.dif/100),p0=f==='gas'?5:P.p0,V0=P.V0,prv=un?P.prv:P.poff;
    if(st.V0!==V0||st.p0!==p0){if(st.V0!=null&&st.p0!=null){const pa0=B7_acP(st.V,st.p0,st.V0);st.V=Math.min(B7_acV(pa0,p0,V0),V0*.98);}st.V0=V0;st.p0=p0;}
    const ex=un?B7_unExp(P,p0):null,pref=poff+B7_ROVU*Math.max(Q-P.Qc,0)/Q,Pref=H.kW(pref,Q);if(st.ema==null)st.ema=ex?ex.avg:Pref;
    const n=dt>0?Math.max(1,Math.ceil(dt/.004)):1,h=dt/n;let o=null;
    for(let i=0;i<n;i++){const pa=B7_acP(st.V,p0,V0);
      if(un){const pX=f==='pilot'?0:pa;if(st.m==='ch'&&pX>=poff)st.m='un';else if(st.m==='un'&&pX<=pon)st.m='ch';}else st.m='ch';
      let pp,Qin=0,Qr=0,Qun=0,Qlk=0;
      if(st.m==='un'){pp=B7_PUN;Qun=Q;if(f==='check'&&pa>pp)Qlk=B7_KLK*Math.sqrt(pa-pp);}
      else{const s=B7_unCh(pa,Q,prv);pp=s.pp;Qin=s.Qin;Qr=s.Qr;if(!un){Qun=Qr;Qr=0;}}
      const Qc=pa>B7_PMIN?P.Qc:P.Qc*Math.max(pa,0)/B7_PMIN;
      if(h>0){const was=st.prevM;st.V=clamp(st.V+(Qin-Qc-Qlk)/60*h,0,V0*.999);const Pw=H.kW(pp,Q);st.E+=Pw*h;st.T+=h;if(st.m==='un')st.Tu+=h;
        st.ema+=(Pw-st.ema)*h/8;
        if(un&&was==='un'&&st.m==='ch'&&st.T>0){st.avg=st.E/st.T;st.uf=st.Tu/st.T;st.tc=st.T;st.E=0;st.T=0;st.Tu=0;}st.prevM=st.m;}
      o={pa,pp,Qin,Qr,Qun,Qlk,Qc};}
    const pa=B7_acP(st.V,p0,V0);o.pa=pa;KIT.rpmAng(st,dt,1450);KIT.rpmAng(st,dt,o.Qc*1000/B7_VGM,'ma');B7_trace(st,dt,[o.pa,o.pp],10);
    const Pnow=H.kW(o.pp,Q),avg=un?(st.avg??st.ema):st.ema,uf=un?(st.uf??(st.T>.2?st.Tu/st.T:0)):0;
    const pm=Math.ceil(Math.max(P.prv,poff)/10)*10+10,tt=st.tt||0,t0=Math.max(0,tt-10),ym=Math.ceil((Math.max(P.prv,poff)+10)/20)*20;
    const pM=Math.min(pa,40);
    return {ex,un,m:st.m,pa,pp:o.pp,Qin:o.Qin,Qr:o.Qr,Qun:o.Qun,Qlk:o.Qlk,Qc:o.Qc,Pnow,avg,uf,Pref,pref,pon,poff,p0,V:st.V,tc:st.tc,
      p:{PP:o.pp,A:pa,X:f==='pilot'?0:pa,M:pM,T:.15,S:-.05},
      q:{LS:Q,LP:Q,LRV:o.Qr,LRT:o.Qr,LUV:o.Qun,LUT:o.Qun,LA1:o.Qin-o.Qlk,LAC:o.Qin-o.Qlk-o.Qc,LA2:o.Qc,LM1:o.Qc,LM2:o.Qc},pmax:pm,qref:Q,
      c:{P1:{on:true,ang:st.ang},M1:{ang:st.ma},UV:{open:o.Qun/Q},RV:{open:clamp(o.Qr/Q,0,1)},CK:{open:o.Qin>.05?1:0},AC:{fill:st.V/V0,u:pa/pm},
        BAR:{v:[un?avg:Pref,Pref],max:Math.max(Pref,avg)*1.1},
        CH:{x0:0,xm:10,ym,L:[[[0,poff],[10,poff]],un?[[0,pon],[10,pon]]:[],st.tr.map(q=>[q[0]-t0,q[1]]),st.tr.map(q=>[q[0]-t0,q[2]])],dot:[tt-t0,pa]}},
      read:[{k:'לחץ המצבר',v:pa,u:'bar'},{k:'לחץ משאבה',v:o.pp,u:'bar'},{k:'שמן במצבר לחץ',v:st.V,u:'L',dg:2,max:V0},{k:'הספק עכשיו',v:Pnow,u:'kW',dg:2,max:Pref*1.2},
        {k:'הספק ממוצע',v:avg,u:'kW',dg:2,max:Pref*1.2},{k:'שסתום פריקה רגיל',v:Pref,u:'kW',dg:2,max:Pref*1.2},{k:'זמן בפריקה',v:uf*100,u:'%',dg:0,max:100}]};},
  ins(P,R){const L=[];const dV=B7_acV(R.poff,R.p0,P.V0)-B7_acV(R.pon,R.p0,P.V0);
    if(R.un&&R.m==='ch')L.push({ic:'⬆️',at:'AC',h:`טעינה: המשאבה דוחפת ${fmt(R.Qin,1)} L/min דרך האל-חוזר, ${fmt(R.Qin-R.Qc,1)} L/min נכנסים למצבר לחץ. לחץ המשאבה ${fmt(R.pp,1)} bar = לחץ המצבר + מפל באל-חוזר → ${fmt(R.Pnow,2)} kW.`});
    if(R.un&&R.m==='un')L.push({ic:'💤',at:'UV',h:`פריקה: הפיקוד X (${fmt(R.pa,0)} bar) הגיע ל-${fmt(R.poff,0)} bar והשסתום פתוח לגמרי. המשאבה מסחררת שמן למיכל ב-${fmt(R.pp,0)} bar בלבד – <b>${fmt(R.Pnow,2)} kW</b>. האל-חוזר סגור ומצבר הלחץ מזין את המנוע.`});
    if(R.un)L.push({ic:'↕️',at:'CH',h:`פריקה ב-${fmt(R.poff,0)} bar וחזרה לטעינה ב-${fmt(R.pon,0)} bar. בין שני הלחצים מצבר הלחץ נותן ${fmt(dV,2)} L. בלי הפרש כזה השסתום היה נפתח ונסגר ללא הפסקה (רטט).`});
    L.push({ic:'⚡',at:'BAR',h:`הספק ממוצע <b>${fmt(R.un?R.avg:R.Pref,2)} kW</b>${R.un?` לעומת ${fmt(R.Pref,2)} kW עם שסתום פריקה רגיל – חיסכון של <b>${fmt(100*(1-R.avg/R.Pref),0)}%</b> (${fmt((R.Pref-R.avg)*8,1)} kWh במשמרת של 8 שעות)`:` – כל הספיקה העודפת עוברת בשסתום הפריקה ב-${fmt(R.pref,0)} bar והופכת לחום`}.`});
    if(!R.un)L.push({ic:'🔥',w:true,at:'UV',h:`שסתום פריקה רגיל: מצבר הלחץ מלא והמשאבה עובדת כל הזמן ב-${fmt(R.pp,0)} bar. ${fmt(R.Qun,1)} L/min עוברים בשסתום → ${fmt(H.kW(R.pp,R.Qun),2)} kW חום.`,c:`${fmt(H.kW(R.pp,R.Qun),1)} kW חום בשסתום`});
    if(R.un&&R.pa>R.poff+3)L.push({ic:'⚠️',w:true,at:'UV',h:`לחץ המצבר ${fmt(R.pa,0)} bar – מעל לחץ הפריקה (${fmt(R.poff,0)}), והמשאבה עדיין לא פורקת. השסתום לא "רואה" את לחץ המצבר.`,c:'עבר את לחץ הפריקה – לא פורק'});
    if(R.un&&R.tc&&R.tc<1.5)L.push({ic:'⚠️',w:true,at:'AC',h:`מחזור טעינה–פריקה קצר מאוד (${fmt(R.tc,2)} s): המיתוג תכוף מדי, והשסתום והמשאבה נשחקים.`,c:'מיתוג תכוף מדי'});
    L.push({ic:'💡',h:'שסתום פריקה מפוקד לא מגביל את לחץ המשאבה – הוא פותח אותה למיכל לפי לחץ <b>חיצוני</b> (כאן מצבר הלחץ, אחרי האל-חוזר). לכן תמיד יש גם שסתום פריקה.'});return L;},
  calc(P,R){const p0=R.p0,V1=B7_acV(R.pon,p0,P.V0),V2=B7_acV(R.poff,p0,P.V0),dV=V2-V1,tch=dV/((P.Q-P.Qc)/60),tun=P.Qc>0?dV/(P.Qc/60):Infinity,ex=R.ex;
    return `<div class="kpis">${kpi('נפח שימושי',fmt(dV,3),'L')}${kpi('זמן טעינה',fmt(tch,2),'s')}${kpi('זמן פריקה',fmt(tun,2),'s')}${kpi('חיסכון צפוי',ex?fmt(100*(1-ex.avg/R.Pref),0):'0','%')}</div>`+
      det('מצבר הלחץ (איזותרמי)',row('',`(p₀+1)·V₀ = (p+1)·V_gas ⇒ V_oil = V₀·(1 − ${fr('p₀+1','p+1')})`)+row(`ב-${fmt(R.pon,0)} bar`,`V₁ = ${P.V0}·(1 − ${fmt(p0+1,0)}/${fmt(R.pon+1,1)}) = ${V(V1,'L',3)}`)+row(`ב-${fmt(R.poff,0)} bar`,`V₂ = ${V(V2,'L',3)}`)+row('נפח שימושי',`ΔV = ${V(dV,'L',3)}`),true)+
      det('זמני המחזור',row('טעינה',`t = ΔV/(Q − Q_c) = ${fmt(dV,3)}/(${P.Q} − ${P.Qc})·60 = ${V(tch,'s')}`)+row('פריקה',`t = ΔV/Q_c = ${isFinite(tun)?V(tun,'s'):'∞'}`)+row('אחוז זמן בפריקה',`${V(isFinite(tun)?100*tun/(tch+tun):100,'%',0)}`),true)+
      det('הספק',row('בטעינה',`P ≈ (p + ${B7_PCK+1})·Q/600 = ${fmt((R.pon+R.poff)/2+B7_PCK+1,0)}·${P.Q}/600 = ${V(H.kW((R.pon+R.poff)/2+B7_PCK+1,P.Q),'kW')}`)+row('בפריקה',`P = ${B7_PUN}·${P.Q}/600 = ${V(H.kW(B7_PUN,P.Q),'kW',3)}`)+
        row('ממוצע צפוי',`P̄ = (E_טעינה + E_פריקה)/(t_טעינה + t_פריקה) = ${ex?V(ex.avg,'kW'):'—'}`)+row('ממוצע מדוד',`${V(R.avg,'kW')}`,ex?Math.abs(R.avg/ex.avg-1)<.05:undefined)+row('שסתום פריקה רגיל',`P = ${fmt(R.pref,1)}·${P.Q}/600 = ${V(R.Pref,'kW')}`),true)+
      `<div class="note">מפל באל-חוזר: ${B7_PCK} bar + (Q/Q)² ≈ 1.5 bar. מפל בשסתום הפריקה המפוקד הפתוח: ${B7_PUN} bar. המנוע עובד כל עוד מצבר הלחץ מעל ${B7_PMIN} bar.</div>`;},
  demo:[{t:'מעגל טעינת מצבר לחץ',x:'משאבה קבועה טוענת <b>מצבר לחץ</b> דרך <b>אל-חוזר</b>. המנוע צורך 6 L/min ממצבר הלחץ. <b>שסתום הפריקה המפוקד</b> על קו המשאבה מקבל פיקוד חיצוני X ממצבר הלחץ.',reset:true,hl:['UV','AC','CK'],dur:8},
    {t:'טעינה',x:'השסתום סגור. המשאבה דוחפת 20 L/min: 6 למנוע ו-14 למצבר לחץ. לחץ המשאבה = לחץ המצבר + 1.5 bar, וההספק 3.5–4 kW.',hl:['P1','AC','GP'],dur:3},
    {t:'הפיקוד מגיע לכיוון',x:'כשלחץ המצבר מגיע ל-120 bar, הפיקוד X פותח את השסתום לגמרי. לחץ המשאבה צונח ל-4 bar, האל-חוזר נסגר ומצבר הלחץ מזין את המנוע לבד.',act:(P,st)=>{if(st.m==='ch')st.V=Math.max(st.V,B7_acV(119,P.p0,P.V0));},hl:['UV','GP','CK'],dur:6},
    {t:'הפרש מיתוג',x:'בגרף: מצבר הלחץ יורד מ-120 ל-102 bar ורק אז השסתום נסגר והטעינה חוזרת. ההפרש מונע רטט של השסתום.',hl:['CH','GA'],dur:9},
    {t:'חיסכון בהספק',x:'רוב הזמן המשאבה פורקת. ההספק הממוצע כ-1.2 kW במקום 4.1 kW – פחות חום ופחות קירור.',hl:['BAR'],dur:7},
    {t:'השוואה: שסתום פריקה רגיל',x:'מחליפים לשסתום פריקה רגיל: אחרי שמצבר הלחץ מתמלא כל העודף עובר בשסתום הפריקה ב-120 bar. המשאבה עובדת במלוא ההספק כל הזמן.',reset:true,set:{type:'relief'},hl:['UV','BAR'],dur:8},
    {t:'צריכה גדולה',x:'חזרה לשסתום פריקה מפוקד עם צריכה של 14 L/min: הטעינה ארוכה והפריקה קצרה – החיסכון קטן. שסתום פריקה מפוקד משתלם כשהצריכה קטנה ולסירוגין.',reset:true,set:{Qc:14},hl:['M1','BAR','CH'],dur:10}],
  predict:[{q:'מצבר הלחץ הגיע ל-120 bar והשסתום פורק. מה יראה מד המשאבה?',set:{},act:(P,st)=>{st.V=B7_acV(119.5,P.p0,P.V0);},opts:['כ-120 bar','כ-4 bar','0 bar בדיוק'],a:1,dur:3,why:'השסתום פתוח לגמרי למיכל, והמשאבה רואה רק את מפל הלחץ בשסתום (כ-4 bar). האל-חוזר מחזיק את 120 bar במצבר לחץ.'},
    {q:'מחליפים את שסתום הפריקה המפוקד בשסתום פריקה רגיל ב-120 bar. מה יקרה להספק הממוצע של המשאבה?',set:{type:'relief'},opts:['יירד','יעלה לכ-4 kW','לא ישתנה'],a:1,dur:5,why:'בשסתום הפריקה רגיל המשאבה תמיד בלחץ הכיול ועוד העקיפה: P = 123.5·20/600 ≈ 4.1 kW, וכל העודף הופך לחום.'},
    {q:'הגז במצבר לחץ דלף (p₀ ירד ל-5 bar). מה יקרה למחזורי הטעינה–פריקה?',set:{p0:5},opts:['יתארכו','יתקצרו מאוד – מיתוג תכוף','לא ישתנו'],a:1,dur:5,why:'בלי כרית גז מצבר הלחץ כמעט לא אוגר שמן בין 102 ל-120 bar (כ-0.03 L). השסתום נפתח ונסגר פעמיים בכל שנייה.'},
    {q:'מגדילים את הפרש החזרה לטעינה מ-15% ל-30%. מה יקרה לזמן כל מחזור?',set:{dif:30},opts:['יתארך – יותר שמן בין המיתוגים','יתקצר','לא ישתנה'],a:0,dur:6,why:'החזרה לטעינה רק ב-84 bar: הנפח השימושי גדל (כ-0.35 → 0.8 L) – פחות מיתוגים בדקה.'}],
  tasks:[{q:P=>`משאבה ${P.Q} L/min פורקת ב-${B7_PUN} bar. מה ההספק ההידראולי שלה?`,a:P=>B7_PUN*P.Q/600,u:'kW',hint:'P = p·Q/600.',rand:P=>{P.Q=rnd(10,80,5);}},
    {q:P=>`מצבר לחץ ${P.V0} L, טעינת גז ${P.p0} bar. כמה שמן יש בו ב-${P.poff} bar (איזותרמי)?`,a:P=>B7_acV(P.poff,P.p0,P.V0),u:'L',hint:'V_oil = V₀·(1 − (p₀+1)/(p+1)), לחצים מוחלטים.',rand:P=>{P.V0=pick([2,4,6,10]);P.p0=rnd(30,90,5);P.poff=rnd(100,200,10);}},
    {q:P=>`נפח שימושי 0.35 L, משאבה ${P.Q} L/min וצריכה ${P.Qc} L/min. כמה זמן נמשכת הטעינה?`,a:P=>.35/((P.Q-P.Qc)/60),u:'s',hint:'t = ΔV/(Q − Q_c), עם Q ב-L/s.',rand:P=>{P.Q=rnd(10,40,1);P.Qc=rnd(2,8,1);}},
    {q:P=>`שסתום פריקה רגיל ב-${P.poff} bar מול פריקה ב-${B7_PUN} bar, משאבה ${P.Q} L/min. כמה הספק נחסך בזמן הפריקה?`,a:P=>(P.poff-B7_PUN)*P.Q/600,u:'kW',hint:'ΔP = (p₁ − p₂)·Q/600.',rand:P=>{P.poff=rnd(80,250,10);P.Q=rnd(10,60,5);}}],
  faults:[{id:'pilot',t:'קו הפיקוד X חסום',sym:'"המשאבה לא נרגעת אף פעם, השמן חם ושסתום הפריקה שורק."',hint:'מה מראה מד מצבר הלחץ לעומת לחץ הפריקה, והאם לחץ המשאבה יורד אי פעם?',why:'לחץ המצבר לא מגיע לשסתום הפריקה המפוקד, לכן הוא לא נפתח. הלחץ עולה עד שסתום הפריקה של המשאבה (140 bar) וכל הספיקה העודפת הופכת לחום.'},
    {id:'check',t:'האל-חוזר דולף',sym:'"המשאבה עוברת מפריקה לטעינה הרבה יותר מהר מבעבר, למרות שהצריכה לא השתנתה."',hint:'כמה מהר יורד הלחץ במצבר בזמן פריקה, לעומת הצריכה של המנוע?',why:'בזמן פריקה שמן ממצבר הלחץ חוזר דרך האל-חוזר הדולף אל שסתום הפריקה המפוקד הפתוח. מצבר הלחץ מתרוקן מהר יותר מהצריכה, והמחזורים מתקצרים.'},
    {id:'gas',t:'לחץ הגז במצבר לחץ אבד',sym:'"השסתום מקשקש כל הזמן ולחץ המערכת קופץ."',hint:'כמה שמן יש במצבר לחץ, וכמה זמן נמשך כל מחזור?',why:'בלי טעינת גז מצבר הלחץ כמעט מלא שמן ולא אוגר נפח בין לחץ הפריקה ללחץ החזרה. השסתום ממתג בתדירות גבוהה. בודקים ומטעינים חנקן.'}],
  test(H){const P=clone(this.P);const s=this.init(P);let R;for(let t=0;t<40;t+=.005)R=this.step(P,s,.005,{});
    const p0=60,V0=4,pon=102,poff=120,V1=B7_acV(pon,p0,V0),V2=B7_acV(poff,p0,V0),dV=V2-V1,tch=dV/(14/60),tun=dV/(6/60);
    const Ich=(p0+1)*V0*Math.log((V0-V1)/(V0-V2))-dV;const Ech=20/600*60/14*(Ich+1.5*dV),Eun=H.kW(4,20)*tun,avg=(Ech+Eun)/(tch+tun);
    const P2=clone(this.P);P2.type='relief';const R2=runSim(this,P2,20,.01).R;
    return [['מחזור = t_טעינה + t_פריקה',s.tc,tch+tun,.02],['הספק ממוצע (אינטגרל p·dV)',R.avg,avg,.02],['אחוז פריקה',R.uf,tun/(tch+tun),.02],['פריקה: P = 4·20/600',H.kW(B7_PUN,20),.1333],
      ['שסתום פריקה רגיל: p = p_off + ov·(Q−Q_c)/Q',R2.pp,120+5*14/20,.01],['V_oil(120) איזותרמי',B7_acV(120,60,4),4*(1-61/121)],['UI לחץ מצבר',R.read[0].v,R.pa]];}};

const SIMS_7B=[B7_SIM_PRV,B7_SIM_RED,B7_SIM_SEQ,B7_SIM_UNL];

/* ===================== Chapter 7 part C – counterbalance, throttles, pressure-compensated FCV, flow divider (sims 29–32) ===================== */
/* ---------- shared symbols / helpers (prefix C7_ / c7_) ---------- */
const C7_R=(g,x,y,w,h,fill,cls='sy thin')=>{const r=SR(g,x,y,w,h,cls);if(fill)r.style.fill=fill;return r;};
const C7_MET='#dfe5ec',C7_OR='#f59e0b',C7_BL='#0b72d9';
const C7_L=s=>`<span dir="ltr">${s}</span>`;
const C7_POSV=[['a','▲ a','הרמה'],['0','■ 0','עצירה'],['b','▼ b','הורדה']];
/* auto sequence a → 0 → b → 0 (a user change of P.pos switches auto off) */
function C7_seq(P,st,dt,atEnd,hold=1.2){if(st.cp!=null&&P.pos!==st.cp)P.auto=false;if(!P.auto){st.cp=P.pos;return;}
  const ord=['a','0','b','0'];if(st.sq==null||ord[st.sq]!==P.pos)st.sq=Math.max(0,ord.indexOf(P.pos));
  if(P.pos!=='0'){st.dw=atEnd?(st.dw||0)+dt:0;if(st.dw>.5){st.sq=(st.sq+1)%4;P.pos=ord[st.sq];st.dw=0;}}
  else{st.dw=(st.dw||0)+dt;if(st.dw>hold){st.sq=(st.sq+1)%4;P.pos=ord[st.sq];st.dw=0;}}st.cp=P.pos;}
function C7_trace(st,dt,row,win){if(dt<=0)return;st.trT=(st.trT||0)+dt;if(st.trT>.04){st.trT=0;st.tr.push(row);while(st.tr.length&&st.tr[0][0]<row[0]-win)st.tr.shift();}}
/* vertical cylinder, rod up, load box on top (text stays upright). ports A (cap, low) B (rod side, high) on the right (o.left: on the left).
   cs={x 0..1,uA,uB,lt,dy (visual bounce px)} */
const C7_VS=80;
SYM.c7_vcyl={ports:o=>{const s=o.left?-1:1,P={A:[26*s,40]};if(!o.single)P.B=[26*s,-40];return P;},bb:o=>[-26,-170,26,52],
  draw(g,o){const s=o.left?-1:1;const cA=C7_R(g,-18,0,36,1,null,'oil'),cB=C7_R(g,-18,-48,36,1,null,'oil');SR(g,-20,-50,40,100,'syb nofill');SL(g,-20,50,20,50,'sy thick');
    SL(g,20*s,40,26*s,40);if(!o.single)SL(g,20*s,-40,26*s,-40);
    const rod=SR(g,-5,0,10,100,'syb'),pis=SR(g,-18,0,36,6,'syf2');
    const lg=sv('g',{},g);SR(lg,-22,-26,44,26,'load');const lt=ST(lg,0,-9,o.t||'','st b');lt.style.direction='ltr';
    return cs=>{cs=cs||{};const x=clamp(cs.x||0,0,1),yp=44-x*C7_VS;pis.setAttribute('y',yp);rod.setAttribute('y',yp-100);
      cA.setAttribute('y',yp+6);cA.setAttribute('height',Math.max(44-yp,0));cB.setAttribute('y',-48);cB.setAttribute('height',Math.max(yp+48,0));
      cA.style.fill=pCss(cs.uA||0);cB.style.fill=pCss(cs.uB||0);lg.setAttribute('transform',`translate(0,${yp-100+(cs.dy||0)})`);if(cs.lt!=null)lt.textContent=cs.lt;};}};
B3.c7_vcyl=(c,o)=>{const g=new THREE.Group(),r=B3.cyl(c,{load:{t:''},single:o.single,pside:o.left?-1:1});r.g.rotation.z=PI/2;r.g.scale.setScalar(.8);g.add(r.g);return {g,upd:r.upd};};
/* live x–y chart. o={w,h,t,xl,yl,col[],dash[],sw[],leg:[[text,col,dash]]}; cs={x0,xm,y0,ym,xd,yd,L:[[[x,y],..],..],dots:[[x,y,col],..]} */
SYM.c7_chart={ports:o=>({}),bb:o=>[-30,-16,o.w+6,o.h+(o.leg?36:24)],
  draw(g,o){C7_R(g,0,0,o.w,o.h,'#fff','syb');ST(g,o.w/2,-5,o.t||'','st b');ST(g,o.w/2,o.h+21,o.xl||'','st s');const yl=ST(g,-24,o.h/2,o.yl||'','st s');yl.setAttribute('transform',`rotate(-90 -24 ${o.h/2})`);
    for(let k=1;k<4;k++){SL(g,o.w*k/4,0,o.w*k/4,o.h,'sy thin').style.opacity=.15;SL(g,0,o.h*k/4,o.w,o.h*k/4,'sy thin').style.opacity=.15;}
    const tx=[0,1,2].map(k=>ST(g,o.w*k/2,o.h+10,'','st s')),ty=[0,1,2].map(k=>ST(g,-10,o.h-o.h*k/2+3,'','st s'));
    const cols=o.col||[C7_BL];const ps=cols.map((c,k)=>{const p=SP(g,'','sy');p.style.stroke=c;p.style.strokeWidth=(o.sw&&o.sw[k])||1.8;if(o.dash&&o.dash[k])p.style.strokeDasharray=o.dash[k];return p;});
    if(o.leg){const n=o.leg.length,sg=o.w/n;o.leg.forEach(([t,c,d],k)=>{const x=sg*(k+.5);const l=SL(g,x+sg/2-20,o.h+31,x+sg/2-6,o.h+31,'sy');l.style.stroke=c;l.style.strokeWidth=2;if(d)l.style.strokeDasharray=d;ST(g,x-10,o.h+34,t,'st s');});}
    const dots=[0,1,2].map(()=>{const d=SC(g,0,0,3.8,'syf');d.style.display='none';return d;});
    return cs=>{if(!cs)return;const x0=cs.x0||0,y0=cs.y0||0,X=x=>clamp((x-x0)/cs.xm,0,1.02)*o.w,Y=y=>o.h-clamp((y-y0)/cs.ym,-.02,1.06)*o.h;
      tx.forEach((t,k)=>t.textContent=fmt(x0+cs.xm*k/2,cs.xd??0));ty.forEach((t,k)=>t.textContent=fmt(y0+cs.ym*k/2,cs.yd??0));
      ps.forEach((p,k)=>{const L=cs.L[k];p.setAttribute('d',L&&L.length>1?'M'+L.map(q=>X(q[0]).toFixed(1)+','+Y(q[1]).toFixed(1)).join(' L'):'');});
      dots.forEach((d,k)=>{const q=cs.dots&&cs.dots[k];if(!q){d.style.display='none';return;}d.style.display='';d.setAttribute('cx',X(q[0]));d.setAttribute('cy',Y(q[1]));d.style.fill=q[2]||'#dc2626';});};}};

/* ---------- 29 · counterbalance valve ---------- */
/* opening balance of the counterbalance: load part + pilot part against the spring setting. cs={pL,pR,pset,max} */
SYM.c7_fbar={ports:o=>({}),bb:o=>[-4,-34,o.w+4,34],
  draw(g,o){const w=o.w,h=14;ST(g,w/2,-22,o.t||'','st b');C7_R(g,0,-h/2,w,h,'#fff','syb');
    const b1=C7_R(g,0,-h/2,0,h,'#60a5fa',''),b2=C7_R(g,0,-h/2,0,h,C7_OR,'');const mk=SL(g,0,-h/2-5,0,h/2+5,'sy thick');mk.style.stroke='#dc2626';
    const t1=ST(g,0,h/2+11,'','st s'),t2=ST(g,0,h/2+21,'','st s'),t3=ST(g,0,-h/2-7,'','st s');t3.style.fill='#b91c1c';t2.style.fill='#b45309';t1.style.fill='#1d4ed8';
    return cs=>{if(!cs)return;const X=p=>clamp(p/cs.max,0,1)*w,x1=X(cs.pL),x2=X(cs.pL+cs.pR),xm=X(cs.pset);
      b1.setAttribute('width',x1);b2.setAttribute('x',x1);b2.setAttribute('width',Math.max(x2-x1,0));mk.setAttribute('x1',xm);mk.setAttribute('x2',xm);
      t3.setAttribute('x',xm);t3.textContent=`כיול ${fmt(cs.pset,0)}`;t1.setAttribute('x',clamp(x1/2,22,w-22));t1.textContent=`עומס ${fmt(cs.pL,1)}`;
      t2.setAttribute('x',clamp((x1+x2)/2,30,w-30));t2.textContent=cs.pR>.05?`פיקוד × R = ${fmt(cs.pR,1)}`:'פיקוד × R = 0';};}};
const C7_CBK=40/Math.sqrt(10),C7_CBB=30,C7_CBC=1,C7_CBS=250,C7_CBL=.15;
const C7_zeta=R=>clamp(.62-.065*R,.03,.9),C7_wn=m=>2*PI*clamp(1.6*Math.sqrt(2000/Math.max(m,1)),.7,3.5);
function C7_cbGeo(P){const A1=H.A(P.D),A2=H.Aann(P.D,Math.min(P.dr,P.D-4));return {A1,A2,a:A2/A1,W:P.m*G,pW:10*P.m*G/A1};}
/* quasi-static lowering through the counterbalance: pump fills the rod side, pilot = rod-side pressure p_B */
function C7_cbLower(P,g,pset,R,kV,pr){const QAn=P.Q/g.a,pVn=(QAn/kV)**2,pBmax=pr-(P.Q/kV)**2;
  const op=pB=>clamp((g.pW+g.a*pB+R*pB-pset)/C7_CBB,0,1);
  const QA=(pB,pV)=>C7_CBK*op(pB)*Math.sqrt(Math.max(g.pW+g.a*pB-pV,0));
  if(QA(0,pVn)>=QAn){const y=op(0);const q=H.bisect(q=>C7_CBK*y*Math.sqrt(Math.max(g.pW-(q/kV)**2,0))-q,0,C7_CBK*Math.sqrt(g.pW)+1);
    return {mode:'run',pB:-.4,pA:g.pW-.4*g.a,pV:(q/kV)**2,y,QA:q,v:-H.v(q,g.A1),Qr:0};}
  if(QA(pBmax,pVn)<QAn){const y=op(pBmax);const q=H.bisect(q=>C7_CBK*y*Math.sqrt(Math.max(g.pW+g.a*pBmax-(q/kV)**2,0))-q,0,QAn);const v=H.v(q,g.A1);
    return {mode:'slow',pB:pBmax,pA:g.pW+g.a*pBmax,pV:(q/kV)**2,y,QA:q,v:-v,Qr:Math.max(P.Q-H.Q(v,g.A2),0)};}
  const pB=H.bisect(p=>QA(p,pVn)-QAn,0,pBmax);return {mode:'ctl',pB,pA:g.pW+g.a*pB,pV:pVn,y:op(pB),QA:QAn,v:-H.v(P.Q,g.A2),Qr:0};}
const C7_SIM_CBV={id:'cbv',n:29,t:'שסתום איזון עומס',d:'פתיחה בשילוב לחץ העומס ולחץ הפיקוד; יחס פיקוד – יעילות מול יציבות',
  P:{m:2000,R:3,ps:100,Q:10,pos:'0',auto:true,D:63,dr:36,pr:160},
  ui(U,P){U.grp('עומס ושסתום איזון עומס');U.num(P,'m','מסת העומס','kg',{min:100,max:5000,step:50});
    U.seg(P,'R','יחס פיקוד R',[[1.5,'1.5:1'],[3,'3:1'],[4.5,'4.5:1'],[8,'8:1']]);U.num(P,'ps','כיול השסתום p_set','bar',{min:20,max:300,step:5});
    U.grp('הפעלה');U.seg(P,'pos','ידית',C7_POSV);U.chk(P,'auto','מחזור אוטומטי');U.num(P,'Q','ספיקת משאבה','L/min',{min:2,max:40,step:1});
    U.grp('צילינדר ושסתום פריקה',false);U.num(P,'D','קוטר בוכנה D','mm',{min:32,max:160,step:1});U.num(P,'dr','קוטר מוט d','mm',{min:16,max:110,step:1});U.num(P,'pr','כיול שסתום פריקה','bar',{min:50,max:350,step:5});
    U.note('הצילינדר אנכי והעומס דוחף את הבוכנה מטה. שסתום איזון העומס יושב על הצד המלא, הפיקוד נלקח מקו B.');},
  circuit(P){return {comps:[{id:'C1',type:'c7_vcyl',x:90,y:200,name:'צילינדר אנכי עם עומס תלוי (המשקל לוחץ על הצד המלא)',lbl:'צילינדר',lblAt:[-44,40],l3:[0,-60]},
      {id:'GA',type:'gauge',x:142,y:252,rot:180,net:'CA',name:'מד לחץ בצד העומס (בין הצילינדר לשסתום איזון העומס)',valAt:[-14,12],l3:[0,30]},
      {id:'CB',type:'cbv',x:200,y:240,rot:90,name:'שסתום איזון עומס: שסתום לחץ עם סיוע פיקוד + אל-חוזר עוקף',lbl:'איזון עומס',lblAt:[-46,58],l3:[0,-34]},
      {id:'GX',type:'gauge',x:289,y:222,rot:90,net:'X',name:'מד לחץ פיקוד (קו B – צד המוט)',valAt:[16,-2]},
      {id:'V1',type:'dcv',x:270,y:320,o:{box:KIT.D43.float,L:'lever',center:true},name:'שסתום פיקוד 4/3, מרכז צף (A,B→T) – לחיצה מחליפה מצב',lbl:'4/3 צף',lblAt:[74,4],l3:[0,-30]},
      {id:'P1',type:'pump',x:210,y:420,name:'משאבה',lbl:'משאבה',lblAt:[34,6]},{id:'T1',type:'tank',x:210,y:464,name:'מיכל'},
      {id:'RV',type:'pv',x:160,y:360,rot:-90,o:{kind:'relief'},name:'שסתום פריקה',lbl:'פריקה',lblAt:[0,-28]},{id:'T2',type:'tank',x:120,y:386,name:'מיכל'},{id:'T3',type:'tank',x:320,y:386,name:'מיכל'},
      {id:'GP',type:'gauge',x:240,y:348,net:'P',name:'מד לחץ משאבה'},
      {id:'CH',type:'c7_chart',x:384,y:44,o:{w:170,h:78,t:'מהירות העומס |v| לאורך הזמן',xl:'זמן [s]',yl:'mm/s',col:['#94a3b8',C7_BL],dash:['4 3',''],sw:[1.3,2],leg:[['יעד Q/A','#94a3b8','4 3'],['בפועל',C7_BL,'']]},name:'גרף: מהירות העומס בפועל מול המהירות שהמשאבה קובעת'},
      {id:'FB',type:'c7_fbar',x:374,y:250,o:{w:180,t:'תנאי פתיחה (bar)'},name:'מאזן הפתיחה: לחץ העומס + יחס הפיקוד × לחץ הפיקוד מול כיול הקפיץ'}],
     lines:[{id:'LS',net:'S',pts:['T1.t','P1.in']},{id:'LP',net:'P',pts:['P1.out',[210,360],[263,360],'V1.P']},{id:'LRV',net:'P',pts:[[210,360],'RV.P']},{id:'LRT',net:'T',pts:['RV.T',[120,360],'T2.t']},
      {id:'LT',net:'T',pts:['V1.T',[277,360],[320,360],'T3.t']},
      {id:'LCA',net:'CA',pts:['C1.A','CB.L']},
      {id:'LA1',net:'A1',pts:['CB.V',[263,240],'V1.A']},
      {id:'LB',net:'B',pts:['C1.B',[277,160],'V1.B']},
      {id:'LX',net:'X',kind:'pilot',pts:[[277,190],[178,190],'CB.X']}]};},
  init:P=>({x:150,t:0,e:0,ed:0,tr:[],si:KIT.idx[P.pos],lm:'',idle:0}),
  click(id,P){if(id==='V1'){P.pos=P.pos==='a'?'0':P.pos==='0'?'b':'a';P.auto=false;return true;}},
  step(P,st,dt,ctx){const f=ctx.fault,g=C7_cbGeo(P),S=C7_CBS,kV=P.Q/Math.sqrt(3),pset=f==='weak'?.6*P.ps:P.ps,R=f==='pilot'?0:P.R;st.t+=dt;
    const d0=KIT.dirOf(P.pos);C7_seq(P,st,dt,(d0>0&&st.x>=S-1e-6)||(d0<0&&st.x<=1e-6)||st.idle>1);
    const dir=KIT.dirOf(P.pos),top=st.x>=S-1e-6,bot=st.x<=1e-6,ovr=Math.max(3,.06*P.pr);
    let ps=P.pr+ovr,pV=0,pA=st.x>0?g.pW:0,pB=0,v=0,QA=0,y=0,chk=0,Qr=P.Q,mode='hold',qB=0,qA1=0,vss=0,L=null,leak=0,qT=0;
    if(dir>0){mode=top?'end':'up';const r=H.lin({Qp:P.Q,pr:P.pr,Ain:g.A1,Aout:g.A2,F:top?1e9:g.W+C7_CBC*g.A1/10,kIn:kV,kOut:kV});
      ps=r.ps;pV=r.stall?r.ps:r.pIn;pA=Math.max(pV-C7_CBC,top?g.pW:0);pB=r.pOut;v=r.v;vss=v;qA1=-r.Qin;qB=r.Qout;qT=r.Qout;Qr=r.Qr;chk=r.stall?0:1;}
    else if(dir<0&&!bot){L=C7_cbLower(P,g,pset,R,kV,P.pr);mode=L.mode;vss=L.v;}
    else if(dir<0){mode='bottom';pB=P.pr;pA=0;y=1;}
    else{const y0=clamp((g.pW-pset)/C7_CBB,0,1);if(st.x>0){y=y0;leak=f==='leak'?C7_CBL*Math.sqrt(g.pW):0;QA=C7_CBK*y*Math.sqrt(g.pW)+leak;v=-H.v(QA,g.A1);qA1=QA;qB=-QA*g.a;qT=QA;}}
    /* load / valve oscillation (2nd order, damping falls with the pilot ratio) – excited when controlled lowering starts */
    const z=f==='pilot'?.8:C7_zeta(P.R),w=C7_wn(P.m);
    if(mode==='ctl'){if(st.lm!=='ctl'){st.e=-1;st.ed=0;}if(dt>0){st.ed+=(-w*w*st.e-2*z*w*st.ed)*dt;st.e+=st.ed*dt;}}else{st.e=0;st.ed=0;}st.lm=mode;
    if(L){const e=st.e;v=Math.min(L.v*(1+e),0);pB=mode==='ctl'?Math.max(L.pB-(L.pB+3)*e,-.3):L.pB;pA=g.pW+g.a*pB;y=clamp(L.y*(1+e),0,1);QA=L.QA*(1+e);pV=L.pV*(1+e)**2;Qr=L.Qr;
      ps=mode==='slow'?P.pr:Math.max(pB,0)+(P.Q/kV)**2;qA1=QA;qB=-H.Q(-v,g.A2);if(mode==='run')qB=-P.Q;qT=QA;}
    if(dir===0&&st.x<=0)pA=0;
    st.x=clamp(st.x+v*dt,0,S);st.idle=dir!==0&&Math.abs(v)<1e-3?st.idle+dt:0;KIT.ease(st,'si',KIT.idx[P.pos],dt);KIT.rpmAng(st,dt,1450);
    const pX=Math.max(pB,0),pXc=Math.max((P.ps-g.pW)/(P.R+g.a),0),pm=P.pr,vT=H.v(P.Q,g.A2);
    C7_trace(st,dt,[st.t,Math.abs(v),Math.abs(vss)],6);const t0=Math.max(0,st.t-6);
    const fmx=Math.max(P.ps*1.45,pA+R*pX)*1.04;
    return {g,mode,ps,pV,pA,pB,pX,pXc,v,vss,QA,y,Qr,z,pset,leak,Lc:L,selfOpen:g.pW>=pset,cav:mode==='run'?{LB:true}:null,
      p:{P:ps,A1:pV,CA:pA,B:pB,X:pX,T:Math.min(1,qT/Math.max(P.Q,1)),S:-.05},q:{LS:P.Q,LP:P.Q-Qr,LRV:Qr,LRT:Qr,LT:qT,LCA:qA1,LA1:qA1,LB:qB},pmax:pm,qref:P.Q/g.a,vac:mode==='run',
      c:{C1:{x:st.x/S,uA:pA/pm,uB:pB/pm,lt:`${fmt(P.m,0)} kg`,dy:mode==='ctl'?clamp(st.e*7,-7,7):0},CB:{open:y,chk},V1:{i:st.si},P1:{on:true,ang:st.ang},RV:{open:clamp(Qr/P.Q,0,1)},GX:{p:pX},
        CH:{xm:6,ym:KIT.nice(vT*1.9),L:[st.tr.map(q=>[q[0]-t0,q[2]]),st.tr.map(q=>[q[0]-t0,q[1]])],dots:[[st.t-t0,Math.abs(v)]]},FB:{pL:pA,pR:R*pX,pset,max:fmx}},
      read:[{k:'לחץ משאבה',v:ps,u:'bar'},{k:'לחץ העומס p_L',v:pA,u:'bar',w:pA>P.pr},{k:'פיקוד p_X',v:pX,u:'bar'},{k:'פיקוד לפתיחה',v:pXc,u:'bar'},
        {k:'מהירות ↑',v:v,u:'mm/s',max:vT*1.6,w:-v>vT*1.25},{k:'ספיקה בשסתום',v:Math.max(QA,0),u:'L/min',max:P.Q/g.a},{k:'גובה העומס',v:st.x,u:'mm',max:S}]};},
  ins(P,R){const L=[],g=R.g,kV=P.Q/Math.sqrt(3);
    if(R.mode==='hold'){if(R.selfOpen)L.push({ic:'⚠️',w:true,at:'CB',h:`העומס לבדו יוצר <b>${fmt(g.pW,1)} bar</b> – לא פחות מהכיול בפועל (${fmt(R.pset,0)} bar). השסתום נפתח בלי פיקוד והעומס <b>יורד בלי פקודה</b> (${fmt(-R.v,1)} mm/s).`,c:'העומס פותח את שסתום איזון העומס בעצמו'});
      else L.push({ic:'🔒',at:'CB',h:`ידית במרכז: העומס (${fmt(P.m,0)} kg) יוצר <b>${fmt(g.pW,1)} bar</b> בצד המלא. השסתום מכויל ל-${fmt(P.ps,0)} bar ולכן סגור – העומס מוחזק. יחס כיול/עומס = ${fmt(P.ps/g.pW,2)} (מקובל ≥ 1.3).`});
      if(R.leak>.01)L.push({ic:'💧',w:true,at:'C1',h:`העומס שוקע ${fmt(-R.v,1)} mm/s למרות שהשסתום סגור: ${fmt(R.leak,2)} L/min עוברים דרך המושב.`,c:'העומס שוקע כשהידית במרכז'});}
    if(R.mode==='up')L.push({ic:'⬆️',at:'CB',h:`הרמה: השמן עובר דרך האל-חוזר הפנימי (V→L) בלי לפתוח את שסתום הלחץ. לחץ בצד העומס ${fmt(R.pA,1)} bar, מהירות Q/A₁ = <b>${fmt(R.v,1)} mm/s</b>.`});
    if(R.mode==='ctl'||R.mode==='slow'){const Lc=R.Lc;
      L.push({ic:'⚖️',at:'FB',h:`הורדה: השסתום נפתח כאשר ${C7_L('<b>p_L + R·p_X ≥ p_set</b>')}. צד המוט בלחץ, ולכן p_L עולה ל-${fmt(Lc.pA,1)} bar. פתיחה ראשונה: ${C7_L(`p_X = (p_set − p_W)/(R + A₂/A₁) = (${fmt(P.ps,0)} − ${fmt(g.pW,1)})/(${fmt(P.R,1)} + ${fmt(g.a,2)}) = <b>${fmt(R.pXc,1)} bar</b>`)}. בתנועה ${fmt(Lc.pB,1)} bar – כדי לפתוח מספיק ל-${fmt(Lc.QA,1)} L/min.`});
      const c3=C7_cbLower(P,g,P.ps,3,kV,P.pr),c8=C7_cbLower(P,g,P.ps,8,kV,P.pr),pp=x=>Math.max(x.pB,0)+(P.Q/kV)**2;const psN=R.mode==='slow'?P.pr:pp(Lc);
      L.push({ic:'⚡',at:'GP',h:`המשאבה דוחפת את העומס מטה ב-<b>${fmt(psN,1)} bar</b> → ${fmt(H.kW(psN,P.Q),2)} kW שהופכים לחום בשסתום. ביחס 3:1 נדרשים ${fmt(pp(c3),1)} bar, ביחס 8:1 רק ${fmt(pp(c8),1)} bar.`});
      if(R.z<.2&&R.mode==='ctl')L.push({ic:'〰️',w:true,at:'CH',h:`יחס ${fmt(P.R,1)}:1 – כל 1 bar בפיקוד שווה ${fmt(P.R,1)} bar "של עומס": השסתום רגיש מאוד, נפתח ונסגר שוב ושוב והעומס מתנדנד (ריסון ζ ≈ ${fmt(R.z,2)}). ראו את הגרף.`,c:'יחס פיקוד גבוה – העומס מתנדנד'});
      else if(R.mode==='ctl')L.push({ic:'🛡️',at:'CH',h:`יחס ${fmt(P.R,1)}:1 – ריסון ζ ≈ ${fmt(R.z,2)}: העומס מתייצב מהר. המחיר – לחץ משאבה גבוה יותר בהורדה.`});
      if(R.mode==='slow')L.push({ic:'🔥',w:true,at:'RV',h:`גם בלחץ שסתום הפריקה (${fmt(P.pr,0)} bar) השסתום לא נפתח מספיק – ההורדה איטית (${fmt(-R.v,1)} mm/s) ו-${fmt(R.Qr,1)} L/min עוברים בשסתום הפריקה.`,c:'ההורדה דורשת לחץ שסתום פריקה'});}
    if(R.mode==='run')L.push({ic:'💥',w:true,at:'C1',h:`העומס פותח את השסתום בעצמו ויורד מהר (${fmt(-R.v,0)} mm/s) מכפי שהמשאבה ממלאת את צד המוט – תת-לחץ וקוויטציה בקו B. הכיול בפועל (${fmt(R.pset,0)} bar) נמוך מלחץ העומס.`,c:'העומס בורח – קוויטציה בצד המוט'});
    if(R.mode==='bottom'||R.mode==='end')L.push({ic:'⏹',h:'סוף מהלך: כל הספיקה עוברת בשסתום הפריקה.'});
    L.push({ic:'💡',h:'מרכז צף (A,B→T): בעצירה קו הפיקוד מתרוקן מיד ושסתום איזון העומס נסגר. במרכז סגור הפיקוד עלול להישאר כלוא.'});return L;},
  calc(P,R){const g=R.g,kV=P.Q/Math.sqrt(3),Lc=C7_cbLower(P,g,P.ps,P.R,kV,P.pr),pp=x=>x.mode==='slow'?P.pr:Math.max(x.pB,0)+(P.Q/kV)**2;
    const rows=[1.5,3,4.5,8].map(r=>{const x=C7_cbLower(P,g,P.ps,r,kV,P.pr);return row(`R = ${r}:1`,`פתיחה ב-${fmt(Math.max((P.ps-g.pW)/(r+g.a),0),1)} bar · בתנועה p_X = ${fmt(x.pB,1)} bar · משאבה ${fmt(pp(x),1)} bar (${fmt(H.kW(pp(x),P.Q),2)} kW) · ζ ≈ ${fmt(C7_zeta(r),2)}`,r===P.R?true:undefined);}).join('');
    return `<div class="kpis">${kpi('לחץ העומס p_W',fmt(g.pW,1),'bar')}${kpi('פיקוד לפתיחה',fmt(R.pXc,1),'bar')}${kpi('משאבה בהורדה',fmt(pp(Lc),1),'bar')}${kpi('יחס כיול/עומס',fmt(P.ps/g.pW,2))}</div>`+
      det('שטחים ולחץ העומס',row('',`A₁ = π·${P.D}²/4 = ${V(g.A1,'mm²')} · A₂ = π(${P.D}² − ${P.dr}²)/4 = ${V(g.A2,'mm²')}`)+row('',`p_W = ${fr('m·g','A₁')} = ${fr(fmt(P.m,0)+'·9.81·10',fmt(g.A1,0))} = ${V(g.pW,'bar')}`)+row('החזקה',`p_W < p_set ⇒ ${fmt(g.pW,1)} ${g.pW<P.ps?'<':'≥'} ${fmt(P.ps,0)} bar`,g.pW<P.ps)+row('כיול מומלץ',`p_set ≥ 1.3·p_W = ${V(1.3*g.pW,'bar')}`,P.ps>=1.3*g.pW),true)+
      det('תנאי הפתיחה בהורדה',row('איזון השסתום',`p_L + R·p_X ≥ p_set`)+row('איזון הבוכנה',`p_L·A₁ = W + p_X·A₂ ⇒ p_L = p_W + (A₂/A₁)·p_X`)+row('ביחד',`p_X = ${fr('p_set − p_W','R + A₂/A₁')} = ${fr(fmt(P.ps,0)+' − '+fmt(g.pW,1),fmt(P.R,1)+' + '+fmt(g.a,3))} = ${V(R.pXc,'bar')}`)+
        row('כפי שבקטלוג',`p_X = (p_set − p_L)/R, עם p_L בפועל = ${fmt(Lc.pA,1)} bar ⇒ ${V((P.ps-Lc.pA)/P.R,'bar')} + תוספת לפתיחה`),true)+
      det('ספיקה והפתיחה הנדרשת',row('מהירות ההורדה',`v = Q/A₂ = ${V(H.v(P.Q,g.A2),'mm/s')} ⇒ Q_L = Q·A₁/A₂ = ${V(P.Q/g.a,'L/min')}`)+row('פתיחה',`y = (p_L + R·p_X − p_set)/${C7_CBB} bar, Q_L = ${fmt(C7_CBK,2)}·y·${sq('p_L − p_V')}`)+row('בפועל',`y = ${V(Lc.y*100,'%',0)}, p_X = ${V(Lc.pB,'bar')}, משאבה ${V(pp(Lc),'bar')}`))+
      det('השוואת יחסי פיקוד – יעילות מול יציבות',rows,true)+`<div class="note">ζ הוא מקדם ריסון משוער להמחשה: יחס גבוה = הגבר גבוה של לחץ הפיקוד על הפתיחה = פחות ריסון. k_max = ${fmt(C7_CBK,2)} L/min/√bar, פס פתיחה ${C7_CBB} bar.</div>`;},
  demo:[{t:'עומס תלוי על צילינדר',x:'העומס דוחף את הבוכנה מטה ויוצר לחץ בצד המלא. שסתום איזון העומס על קו זה <b>סגור</b> כל עוד לחץ העומס נמוך מהכיול שלו – והעומס מוחזק גם אם צינור נקרע.',reset:true,set:{pos:'0',auto:false},act:(P,st)=>{st.x=150;},hl:['C1','CB','GA']},
    {t:'הרמה – דרך האל-חוזר',x:'במצב a השמן נכנס לצד המלא דרך האל-חוזר הפנימי (V→L) – בלי לפתוח את שסתום הלחץ.',set:{pos:'a'},hl:['CB','C1'],dur:6},
    {t:'הורדה – הפיקוד פותח',x:'במצב b המשאבה ממלאת את צד המוט. לחץ קו B מגיע לפתח X ועוזר ללחץ העומס לפתוח את השסתום: <b>p_L + R·p_X ≥ p_set</b>.',set:{pos:'b'},act:(P,st)=>{st.x=230;},hl:['GX','CB','FB'],dur:8},
    {t:'מאזן הפתיחה',x:'בפס למטה: כחול – לחץ העומס, כתום – הפיקוד כפול R. כשהסכום עובר את הקו האדום השסתום נפתח בדיוק כדי להעביר Q·A₁/A₂ – לא יותר.',hl:['FB'],dur:8},
    {t:'יחס 8:1 – יעיל אבל עצבני',x:'אותו עומס עם R = 8: לחץ המשאבה בהורדה יורד כמעט לחצי. אבל השסתום רגיש פי 8 ללחץ הפיקוד – העומס מתנדנד לפני שהוא מתייצב (ראו בגרף).',set:{R:8,pos:'b'},act:(P,st)=>{st.x=240;st.lm='';},hl:['CH','C1','GP'],dur:9},
    {t:'עומס כבד – פחות פיקוד',x:'2800 kg: לחץ העומס קרוב יותר לכיול, ולכן צריך <b>פחות</b> פיקוד. לכן מכיילים p_set ≥ 1.3·p_W של העומס הכבד ביותר.',set:{R:3,m:2800},act:(P,st)=>{st.x=240;st.lm='';},hl:['FB','GX'],dur:8},
    {t:'כיול נמוך מדי',x:'p_set = 60 bar עם עומס של 63 bar: העומס פותח את השסתום בעצמו ויורד גם כשהידית במרכז.',set:{m:2000,ps:60,pos:'0',auto:false},act:(P,st)=>{st.x=230;},hl:['CB','C1'],dur:7}],
  predict:[{q:'בזמן הורדה מחליפים יחס פיקוד מ-3:1 ל-8:1. מה יקרה ללחץ המשאבה?',set:{pos:'b',auto:false},act:(P,st)=>{st.x=245;},go:P=>{P.R=8;},opts:['יעלה','יירד','לא ישתנה'],a:1,dur:2.4,why:'p_X = (p_set − p_W)/(R + A₂/A₁): R במכנה. מ-3 ל-8 הפיקוד הנדרש יורד מכ-11 לכ-5 bar, ואיתו לחץ המשאבה.'},
    {q:'יחס 8:1, העומס עומד למעלה. מעבירים ידית להורדה. איך ייראה גרף המהירות?',set:{R:8,pos:'0',auto:false},act:(P,st)=>{st.x=240;},go:P=>{P.pos='b';},opts:['עלייה חלקה למהירות הקבועה','קפיצות ונדנוד סביב המהירות לפני התייצבות','העומס לא יזוז'],a:1,dur:3,why:'ביחס גבוה שינוי קטן בלחץ הפיקוד פותח הרבה: העומס מאיץ, לחץ קו B צונח, השסתום נסגר, וחוזר חלילה – נדנוד בריסון נמוך.'},
    {q:'יחס 3:1. מגדילים את המסה מ-2000 ל-2800 kg. איזה לחץ פיקוד יידרש להורדה?',set:{pos:'b',auto:false},act:(P,st)=>{st.x=245;},go:P=>{P.m=2800;},dur:2.4,act:(P,st)=>{st.x=240;},opts:['יותר','פחות','אותו דבר'],a:1,why:'לחץ העומס עולה ל-88 bar, וחסרים רק 12 bar עד הכיול: (100 − 88)/3.67 ≈ 3.3 bar במקום 10.1 bar.'},
    {q:'עומס של 2000 kg (63 bar). מורידים את כיול שסתום איזון העומס ל-60 bar והידית במרכז. מה יקרה?',set:{ps:60,pos:'0',auto:false},act:(P,st)=>{st.x=230;},opts:['העומס מוחזק','העומס יורד בעצמו','הלחץ במד עולה ל-60 bar ונעצר'],a:1,why:'לחץ העומס לבדו גבוה מהכיול: p_L ≥ p_set גם בלי פיקוד. השסתום נפתח והעומס שוקע.'}],
  tasks:[{q:P=>`מסה ${P.m} kg על צילינדר אנכי Ø${P.D}. מה לחץ העומס בצד המלא?`,a:P=>10*P.m*G/H.A(P.D),u:'bar',hint:'p = m·g/A₁ (×10 ל-bar).',rand:P=>{P.m=rnd(500,4000,50);P.D=pick([50,63,80,100]);P.dr=Math.round(P.D*.56);}},
    {q:P=>`לחץ בצד העומס ${fmt(10*P.m*G/H.A(P.D),1)} bar, כיול ${P.ps} bar, יחס פיקוד ${P.R}:1. כמה פיקוד פותח את השסתום (נוסחת קטלוג)?`,a:P=>(P.ps-10*P.m*G/H.A(P.D))/P.R,u:'bar',hint:'p_X = (p_set − p_L)/R.',rand:P=>{P.m=rnd(800,2500,50);P.D=63;P.ps=rnd(110,200,10);P.R=pick([3,4.5,8]);}},
    {q:P=>`צילינדר Ø${P.D}/${P.dr}, מסה ${P.m} kg, p_set = ${P.ps} bar, R = ${P.R}. איזה לחץ בקו B פותח את השסתום (כולל השפעת A₂/A₁)?`,a:P=>{const g=C7_cbGeo(P);return (P.ps-g.pW)/(P.R+g.a);},u:'bar',hint:'p_X = (p_set − p_W)/(R + A₂/A₁).',rand:P=>{P.D=pick([50,63,80]);P.dr=Math.round(P.D*pick([.5,.56,.63]));P.m=rnd(800,2500,50);P.ps=rnd(110,200,10);P.R=pick([3,4.5,8]);}},
    {q:P=>`העומס הכבד ביותר יוצר ${fmt(10*P.m*G/H.A(P.D),1)} bar. מה כיול שסתום איזון העומס המינימלי המומלץ (×1.3)?`,a:P=>1.3*10*P.m*G/H.A(P.D),u:'bar',hint:'p_set ≥ 1.3·p_W.',rand:P=>{P.m=rnd(800,3500,50);P.D=pick([63,80]);}},
    {q:P=>`בזמן הורדה המשאבה עובדת ב-${P.ps} bar עם ${P.Q} L/min. כמה הספק הופך לחום?`,a:P=>P.ps*P.Q/600,u:'kW',hint:'P = p·Q/600.',rand:P=>{P.ps=rnd(5,40,1);P.Q=rnd(5,40,1);}}],
  faults:[{id:'weak',t:'קפיץ שסתום איזון העומס עייף / כיול השתחרר',sym:'"העומס שוקע לאט כשהידית במרכז, ובהורדה הוא כמעט לא צריך לחץ."',hint:'השוו את לחץ המשאבה בהורדה לחישוב הפיקוד, ובדקו את הגובה כשהידית במרכז.',why:'הכיול בפועל ירד ל-60% (60 bar) – קרוב ללחץ העומס (63 bar). השסתום נפתח כמעט מהעומס עצמו: בהורדה כמעט אין צורך בפיקוד, ובמרכז העומס יורד.'},
    {id:'pilot',t:'קו הפיקוד סתום (חנק / לכלוך בפתח X)',sym:'"הורדת העומס איטית, המשאבה צועקת והשמן מתחמם. ההרמה תקינה."',hint:'מד הפיקוד מראה לחץ גבוה מאוד – האם הוא מגיע לשסתום? השוו לחישוב "פיקוד לפתיחה".',why:'הלחץ לא מגיע לבוכנת הפיקוד. השסתום נפתח רק כשלחץ העומס לבדו מגיע לכיול: p_L = p_W + (A₂/A₁)·p_B ⇒ p_B ≈ 60 bar במקום 11. (לפעמים "יציב" מאוד – אבל בזבזני.)'},
    {id:'leak',t:'מושב שסתום איזון העומס דולף',sym:'"העומס שוקע כמה מילימטרים כל פעם שעוצרים, ההרמה וההורדה נראות תקינות."',hint:'הסתכלו על הספיקה דרך השסתום ועל הגובה בזמן שהידית במרכז.',why:'שריטה או לכלוך במושב: גם כשהשסתום סגור עובר שמן L→V (Q ∝ √p) – העומס שוקע במרכז. בתנועה ההשפעה זניחה.'}],
  test(H){const P=clone(this.P);P.pos='b';P.auto=false;const {R}=runSim(this,P,1.6,.01);const g=C7_cbGeo(P),kV=10/Math.sqrt(3);
    const QAn=10/g.a,pVn=(QAn/kV)**2,yN=QAn/(C7_CBK*Math.sqrt(R.pA-pVn)),pBh=(100+C7_CBB*yN-g.pW)/(3+g.a);
    const P2=clone(this.P);P2.auto=false;P2.pos='0';const R2=runSim(this,P2,.3).R;const P3=clone(this.P);P3.auto=false;P3.pos='a';const R3=runSim(this,P3,.5).R;
    return [['p_W = m·g/A₁',R2.pA,10*2000*9.81/H.A(63)],['פיקוד לפתיחה (p_set − p_W)/(R + A₂/A₁)',R.pXc,(100-g.pW)/(3+g.a)],['מהירות הורדה v = Q/A₂',-R.v,H.v(10,g.A2)],
      ['p_X בהורדה (מאזן השסתום)',R.pB,pBh,.02],['p_L = p_W + (A₂/A₁)·p_X',R.pA,g.pW+g.a*R.pB],['הרמה v = Q/A₁',R3.v,H.v(10,g.A1)],['UI p_L',R.read[1].v,R.pA]];}};

/* ---------- 30 · throttle and one-way throttle ---------- */
/* needle + check cut-away: left = port 1 (from the DCV), right = port 2 (to the cylinder). cs={op 0..1,chk 0..1,u1,u2} */
SYM.c7_needle={ports:o=>({}),bb:o=>[-78,-70,78,52],
  draw(g,o){C7_R(g,-74,-34,148,72,C7_MET,'syb');const fl=(x,y,w,h)=>C7_R(g,x,y,w,h,'#93c5fd','sy thin');
    const c1=[fl(-74,-18,74,14),fl(-66,-4,10,22),fl(-66,16,58,12)],c2=[fl(0,-18,74,14),fl(56,-4,10,22),fl(8,16,58,12)];
    const ng=sv('g',{},g);C7_R(ng,-5,-62,10,46,'#94a3b8','sy thin');SP(ng,'M-5,-16 L0,-6 L5,-16Z','syf2');C7_R(ng,-12,-68,24,7,'#334155','sy thin');
    C7_R(g,-74,-4,8,2,C7_MET,'');SP(g,'M-2,16 L4,21 L-2,28','sy thin');C7_R(g,-8,16,4,2,C7_MET,'');C7_R(g,-8,26,4,2,C7_MET,'');
    const ball=SC(g,-8,22,5.5,'syf2');ST(g,-60,48,'1','st b');ST(g,60,48,'2','st b');ST(g,26,-42,'מחט','st s');ST(g,-36,46,'אל-חוזר','st s');ST(g,0,62,o.t||'','st s');
    return cs=>{cs=cs||{};const op=clamp(cs.op??.5,0,1);ng.setAttribute('transform',`translate(0,${-12+12*(1-op)})`);ball.setAttribute('cx',-8-14*clamp(cs.chk||0,0,1));
      c1.forEach(r=>r.style.fill=pCss(cs.u1||0));c2.forEach(r=>r.style.fill=pCss(cs.u2||0));};}};
const C7_TKC=12,C7_TS=200,C7_TFR=200;
const C7_SIM_THR={id:'throttle',n:30,t:'צמצם וצמצם אל-חוזר',d:'Q ∝ √Δp: העומס משנה את מפל הלחץ ואת המהירות; האל-חוזר משחרר את זרימת החזרה',
  P:{type:'one',A0:2,F:5000,Q:20,pos:'a',auto:true,pr:100,D:50,dr:28},
  key:P=>P.type,
  ui(U,P){U.grp('הצמצם');U.seg(P,'type','סוג',[['one','חד-כיווני (עם אל-חוזר)'],['plain','צמצם רגיל']],true);U.num(P,'A0','פתח המחט A₀','mm²',{min:.2,max:12,step:.1});
    U.grp('מעגל');U.num(P,'F','עומס המתנגד ליציאה','N',{min:0,max:30000,step:500});U.num(P,'Q','ספיקת משאבה','L/min',{min:2,max:60,step:1});U.seg(P,'pos','ידית',KIT.pos3);U.chk(P,'auto','מחזור אוטומטי');
    U.grp('שסתום פריקה וצילינדר',false);U.num(P,'pr','כיול שסתום פריקה','bar',{min:20,max:300,step:5});U.num(P,'D','קוטר בוכנה D','mm',{min:25,max:125,step:1});U.num(P,'dr','קוטר מוט d','mm',{min:10,max:90,step:1});
    U.note('הצמצם בקו A (צד הכניסה ביציאה). העומס פועל רק ביציאה (למשל כלי עיבוד); בחזרה יש רק חיכוך של 200 N.');},
  circuit(P){const one=P.type==='one';return {comps:[{id:'C1',type:'cyl',x:330,y:60,o:{load:{t:'F'}},name:'צילינדר דו-פעולה עם עומס מתנגד',lbl:'צילינדר',lblAt:[-84,-20],l3:[0,-34]},
      one?{id:'TV',type:'throttle1',x:230,y:160,o:{free:'down'},name:'צמצם אל-חוזר: צמצם ביציאה, זרימה חופשית בחזרה דרך האל-חוזר',lbl:'צמצם אל-חוזר',lblAt:[58,26],l3:[0,-34]}
         :{id:'TV',type:'throttle',x:230,y:160,name:'צמצם (שסתום מחט) – מגביל בשני הכיוונים',lbl:'צמצם',lblAt:[34,-8],l3:[0,-30]},
      {id:'GA',type:'gauge',x:218,y:112,rot:-90,net:'A',name:'מד לחץ אחרי הצמצם (צד הצילינדר)',valAt:[-14,-14]},{id:'G0',type:'gauge',x:270,y:203,net:'A0',name:'מד לחץ לפני הצמצם (צד השסתום)'},
      {id:'GB',type:'gauge',x:349,y:150,rot:90,net:'B',name:'מד לחץ קו B',valAt:[16,-2]},
      {id:'V1',type:'dcv',x:330,y:250,o:{box:KIT.D43.closed,L:'lever',center:true},name:'שסתום פיקוד 4/3 מרכז סגור – לחיצה מחליפה מצב',lbl:'4/3',lblAt:[78,4]},
      {id:'P1',type:'pump',x:230,y:370,name:'משאבה',lbl:'משאבה',lblAt:[34,6]},{id:'T1',type:'tank',x:230,y:414,name:'מיכל'},
      {id:'RV',type:'pv',x:180,y:320,rot:-90,o:{kind:'relief'},name:'שסתום פריקה',lbl:'פריקה',lblAt:[0,-28],l3:[0,-30]},{id:'T2',type:'tank',x:140,y:346,name:'מיכל'},{id:'T3',type:'tank',x:400,y:320,name:'מיכל'},
      {id:'GP',type:'gauge',x:275,y:308,net:'P',name:'מד לחץ משאבה',l3:[0,-30]},
      {id:'CUT',type:'c7_needle',x:96,y:214,o:{t:one?'חתך: מחט + אל-חוזר עוקף':'חתך: מחט (האל-חוזר חסום)'},name:'חתך הצמצם: המחט קובעת את הפתח; האל-חוזר נפתח רק בזרימה 2→1'},
      {id:'CH',type:'c7_chart',x:432,y:146,o:{w:160,h:76,t:'אופיין הצמצם Q–Δp',xl:'Δp [bar]',yl:'Q [L/min]',col:[C7_BL,'#16a34a'],dash:['','5 3'],leg:one?[['דרך המחט',C7_BL,''],['חופשי (אל-חוזר)','#16a34a','5 3']]:[['דרך המחט',C7_BL,'']]},name:'גרף: Q = k·√Δp – הנקודה האדומה היא מצב העבודה הנוכחי'}],
     lines:[{id:'LS',net:'S',pts:['T1.t','P1.in']},{id:'LP',net:'P',pts:['P1.out',[230,320],[323,320],'V1.P']},{id:'LRV',net:'P',pts:[[230,320],'RV.P']},{id:'LRT',net:'T',pts:['RV.T',[140,320],'T2.t']},
      {id:'LT',net:'T',pts:['V1.T',[337,295],[400,295],'T3.t']},
      {id:'LA0',net:'A0',pts:['V1.A',[323,215],[230,215],'TV.in']},{id:'LA',net:'A',pts:['TV.out',[230,100],[280,100],'C1.A'],tag:{at:[255,124],t:'q'}},
      {id:'LB',net:'B',pts:['V1.B',[337,100],[380,100],'C1.B']}]};},
  init:P=>({x:0,si:KIT.idx[P.pos],tr:[]}),
  click(id,P){if(id==='V1'){P.pos=P.pos==='a'?'0':P.pos==='0'?'b':'a';P.auto=false;return true;}},
  step(P,st,dt,ctx){const f=ctx.fault,one=P.type==='one',A1=H.A(P.D),A2=H.Aann(P.D,Math.min(P.dr,P.D-4)),S=C7_TS,pr=f==='relief'?.6*P.pr:P.pr;
    const k=H.orK(P.A0*(f==='clog'?.4:1)),kc=one?C7_TKC:0,kBy=one&&f==='chk'?C7_TKC:0,dir=KIT.dirOf(P.pos);
    const atEnd=(dir>0&&st.x>=S-1e-6)||(dir<0&&st.x<=1e-6);let ps,pA0=0,pA=0,pB=0,v=0,qA=0,qB=0,qT=0,Qr=0,Qn=0,Qc=0,dp=0,mode='hold',chk=0;
    if(dir>0){mode='ext';const r=H.lin({Qp:P.Q,pr,Ain:A1,Aout:A2,F:atEnd?1e9:P.F,kIn:k+kBy});ps=r.ps;pA0=ps;pA=r.stall?r.ps:r.pIn;pB=r.pOut;v=r.v;dp=ps-pA;Qn=k*Math.sqrt(Math.max(dp,0));Qc=kBy*Math.sqrt(Math.max(dp,0));
      qA=r.Qin;qB=-r.Qout;qT=r.Qout;Qr=r.Qr;if(r.stall){Qn=0;Qc=0;mode='end';}chk=kBy?.6:0;}
    else if(dir<0){mode='ret';const r=H.lin({Qp:P.Q,pr,Ain:A2,Aout:A1,F:atEnd?1e9:C7_TFR,kOut:k+kc});ps=r.ps;pB=r.stall?r.ps:r.pIn;pA=r.pOut;v=-r.v;dp=pA;
      Qn=k*Math.sqrt(Math.max(pA,0));Qc=kc*Math.sqrt(Math.max(pA,0));qA=-r.Qout;qB=r.Qin;qT=r.Qout;Qr=r.Qr;chk=kc&&!r.stall?1:0;if(r.stall){Qn=0;Qc=0;mode='end';}}
    else{const ov=Math.max(3,.06*pr);ps=pr+ov;Qr=P.Q;}
    st.x=clamp(st.x+v*dt,0,S);KIT.autoCycle(P,st,dt,atEnd&&dir!==0);KIT.ease(st,'si',KIT.idx[P.pos],dt);KIT.rpmAng(st,dt,1450);
    const pm=P.pr,xm=KIT.nice(P.pr*1.05),ym=KIT.nice(P.Q*1.25),cv=kk=>{const L=[];for(let i=0;i<=80;i++){const d=xm*i/80,q=kk*Math.sqrt(d);if(q>ym){L.push([(ym/kk)**2,ym]);break;}L.push([d,q]);}return L;};
    const Qv=Qn+Qc;
    return {mode,one,ps,pA,pB,pA0,dp,Qn,Qc,Qv,v,Qr,k,A1,A2,pr,
      p:{P:ps,A0:dir>0?pA0:0,A:pA,B:pB,T:Math.min(1,qT/P.Q),S:-.05},q:{LS:P.Q,LP:P.Q-Qr,LRV:Qr,LRT:Qr,LA0:qA,LA:qA,LB:qB,LT:qT},pmax:pm,qref:P.Q,
      c:{C1:{x:st.x/S,uA:pA/pm,uB:pB/pm,lt:dir>0?`\u200e${fmt(P.F/1000,1)} kN`:'0'},V1:{i:st.si},P1:{on:true,ang:st.ang},RV:{open:clamp(Qr/P.Q,0,1)},TV:{knob:P.A0/3,chk},
        CUT:{op:clamp(P.A0/10,0,1),chk,u1:(dir>0?ps:0)/pm,u2:pA/pm},
        CH:{xm,ym,L:[cv(k),one?cv(k+kc):[]],dots:mode==='hold'?[]:[[dp,Qv,dir<0&&one?'#16a34a':'#dc2626']]}},
      read:[{k:'לחץ משאבה',v:ps,u:'bar'},{k:'לחץ בצילינדר',v:pA,u:'bar'},{k:'Δp על המחט',v:dp,u:'bar'},{k:'ספיקה במחט',v:Qn,u:'L/min',max:P.Q},
        {k:'מהירות',v:v,u:'mm/s',max:H.v(P.Q,A2)},{k:'ספיקה בשסתום הפריקה',v:Qr,u:'L/min',max:P.Q,w:Qr>.6*P.Q&&dir!==0},{k:'מיקום',v:st.x,u:'mm',max:S}]};},
  ins(P,R){const L=[],pL=10*P.F/R.A1;
    if(R.mode==='ext'){L.push({ic:'🎯',at:'TV',h:`יציאה: ${C7_L(`Q = k·√Δp = ${fmt(R.k,2)}·√${fmt(R.dp,1)} = <b>${fmt(R.Qn,2)} L/min</b>`)}. כאן k = 0.637·A₀, ומפל הלחץ ${C7_L(`Δp = p_s − p_A = ${fmt(R.ps,1)} − ${fmt(R.pA,1)} bar`)}. המהירות ${fmt(R.v,1)} mm/s.`});
      if(R.Qr>.05)L.push({ic:'🔥',at:'RV',h:`העודף (${fmt(R.Qr,1)} L/min) חוזר דרך שסתום הפריקה ב-${fmt(R.ps,0)} bar – ${fmt(H.kW(R.ps,R.Qr),2)} kW חום. בצמצם עוד ${fmt(H.kW(R.dp,R.Qn),2)} kW.`});
      else L.push({ic:'⚠️',w:true,at:'TV',h:`המחט פתוחה מדי: כל ספיקת המשאבה עוברת (${fmt(P.Q,0)} L/min) והמהירות נקבעת במשאבה – הצמצם לא שולט.`,c:'הצמצם פתוח מדי – אין שליטה'});
      const v0=H.v(Math.min(R.k*Math.sqrt(R.pr),P.Q),R.A1);L.push({ic:'⚖️',at:'C1',h:`העומס (${fmt(P.F/1000,1)} kN → ${fmt(pL,1)} bar) "גונב" מפל לחץ מהצמצם: בלי עומס אותה מחט נותנת ${fmt(v0,0)} mm/s, עכשיו ${fmt(R.v,0)} mm/s. צמצם רגיל לא מפצה על שינויי עומס.`});}
    if(R.mode==='ret'&&R.one)L.push({ic:'↩️',at:'TV',h:`חזרה: האל-חוזר נפתח – ${fmt(R.Qc,1)} L/min עוקפים את המחט ורק ${fmt(R.Qn,1)} L/min דרכה. Δp = ${fmt(R.dp,2)} bar בלבד, v = Q/A₂ = <b>${fmt(-R.v,0)} mm/s</b>.`});
    if(R.mode==='ret'&&!R.one)L.push({ic:'🐢',w:true,at:'TV',h:`צמצם רגיל מגביל גם בחזרה: ${fmt(R.Qn,1)} L/min מהצד המלא דרך המחט צריכים Δp = ${fmt(R.dp,0)} bar. בצד המוט ${fmt(R.pB,0)} bar ${R.Qr>.1?'– המשאבה על שסתום הפריקה':''}, והחזרה איטית (${fmt(-R.v,0)} mm/s).`,c:'הצמצם מגביל גם את החזרה'});
    if(R.mode==='end')L.push({ic:'⏹',h:'סוף מהלך: אין זרימה בצמצם, ולכן אין מפל לחץ – הלחץ משני צדי המחט משתווה.'});
    L.push({ic:'📐',at:'CH',h:'בגרף: הספיקה עולה כשורש מפל הלחץ. כדי להכפיל ספיקה צריך פי 4 מפל לחץ – או פי 2 שטח מחט.'});
    L.push({ic:'💡',h:'צמצם בכניסה (meter-in) מתאים לעומס מתנגד. לעומס מכני אינרציאלי משתמשים בצמצם ביציאה (meter-out), שמחזיק את העומס מאחור.'});return L;},
  calc(P,R){const A1=R.A1,pL=10*P.F/A1,k=R.k;return `<div class="kpis">${kpi('מקדם המחט k',fmt(k,3),'L/min/√bar')}${kpi('Δp',fmt(R.dp,1),'bar')}${kpi('ספיקה במחט',fmt(R.Qn,2),'L/min')}${kpi('מהירות',fmt(R.v,1),'mm/s')}</div>`+
    det('מקדם המחט',row('נוסחת פתח',`Q = C_d·A₀·${sq('2Δp/ρ')} ⇒ Q = k·${sq('Δp')}`)+row('',`k = 0.637·A₀ = 0.637·${fmt(P.A0,2)} = ${V(k,'L/min/√bar',3)}`),true)+
    det('יציאה – מפל הלחץ קובע',row('לחץ העומס',`p_A = F/A₁ = ${fmt(P.F,0)}·10/${fmt(A1,0)} = ${V(pL,'bar')}`)+row('לחץ המשאבה',`p_s = כיול + עקיפה לפי ספיקת שסתום הפריקה = ${V(R.mode==='ext'?R.ps:R.pr,'bar')}`)+
      row('ספיקה',`Q = k·√(p_s − p_A) = ${fmt(k,3)}·${sq(fmt(R.mode==='ext'?R.ps:R.pr,1)+' − '+fmt(pL,1))} = ${V(k*Math.sqrt(Math.max((R.mode==='ext'?R.ps:R.pr)-pL,0)),'L/min')}`)+row('מהירות',`v = Q/A₁ = ${V(H.v(Math.min(k*Math.sqrt(Math.max(R.pr-pL,0)),P.Q),A1),'mm/s')} (בערך)`),true)+
    det('חזרה',R.one?row('חד-כיווני',`k_check = ${C7_TKC} ⇒ Δp = (Q_A/(k + k_c))² ≈ ${V((H.Q(H.v(P.Q,R.A2),A1)/(k+C7_TKC))**2,'bar')}, v = Q/A₂ = ${V(H.v(P.Q,R.A2),'mm/s')}`):
      row('צמצם רגיל',`Q_A = k·√p_A, p_B·A₂ = p_A·A₁ + F_f ⇒ בלחץ שסתום פריקה v = ${V(H.v(k*Math.sqrt((R.pr*R.A2-10*C7_TFR)/A1),A1),'mm/s')}`))+
    det('חום',row('בצמצם',`P = Δp·Q/600 = ${V(H.kW(R.dp,R.Qn),'kW',3)}`)+row('בשסתום הפריקה',`P = p·Q_r/600 = ${V(H.kW(R.ps,R.Qr),'kW',3)}`))+`<div class="note">C_d = 0.7, ρ = 870 kg/m³. שסתום הפיקוד מניחים אידאלי (ללא מפל לחץ).</div>`;},
  demo:[{t:'צמצם אל-חוזר בקו A',x:'בקו A יש צמצם עם אל-חוזר עוקף. בכיוון אחד השמן חייב לעבור דרך המחט, ובכיוון השני האל-חוזר נפתח.',reset:true,set:{pos:'0',auto:false},hl:['TV','CUT']},
    {t:'יציאה – המחט קובעת',x:'במצב a המשאבה דוחפת 20 L/min, אבל המחט מעבירה רק <b>Q = k·√Δp</b> – כ-11 L/min. העודף עולה בלחץ ויוצא דרך שסתום הפריקה.',set:{pos:'a',auto:true},hl:['TV','RV','G0','GA'],dur:7},
    {t:'סוגרים את המחט',x:'A₀ = 1 mm²: k קטן בחצי, הספיקה והמהירות קטנות בחצי, ויותר שמן חוזר דרך שסתום הפריקה.',set:{A0:1},hl:['CUT','RV'],dur:7},
    {t:'העומס משנה את המהירות',x:'אותה מחט, עומס 12 kN: לחץ הצילינדר עולה ל-61 bar ומפל הלחץ על המחט יורד – והמהירות יורדת. זו המגבלה של צמצם רגיל.',set:{A0:2,F:12000},hl:['GA','CH'],dur:8},
    {t:'חזרה חופשית',x:'במצב b השמן מהצד המלא חוזר דרך האל-חוזר: מפל לחץ זעיר, ומהירות מלאה Q/A₂.',set:{F:5000,pos:'b',auto:false},act:(P,st)=>{st.x=200;},hl:['TV','CUT'],dur:6},
    {t:'צמצם רגיל – גם החזרה מוגבלת',x:'בלי אל-חוזר כל השמן החוזר עובר במחט. הלחץ בצד המוט מטפס לשסתום הפריקה והחזרה איטית.',reset:true,set:{type:'plain',pos:'b',auto:false},act:(P,st)=>{st.x=200;},hl:['TV','GB','RV'],dur:7},
    {t:'האופיין Q–Δp',x:'בגרף רואים שורש: מעבר מ-25 ל-100 bar מכפיל את הספיקה בלבד. הנקודה האדומה – מצב העבודה הנוכחי.',reset:true,set:{auto:true},hl:['CH'],dur:8}],
  predict:[{q:'אותה מחט (2 mm²). מגדילים את העומס מ-5 kN ל-12 kN. מה יקרה למהירות היציאה?',set:{F:5000,pos:'a',auto:false},go:P=>{P.F=12000;},opts:['תגדל','תקטן','לא תשתנה'],a:1,dur:1.6,why:'הלחץ בצילינדר עולה ל-61 bar. מפל הלחץ על המחט קטן מ-77 ל-42 bar, ו-Q = k·√Δp קטנה בכ-25% (11.2 → 8.3 L/min).'},
    {q:'מכפילים את פתח המחט מ-1 ל-2 mm² (עומס 5 kN). מה יקרה לספיקה דרך המחט?',set:{A0:1,pos:'a',auto:false},go:P=>{P.A0=2;},opts:['תוכפל בערך','תגדל פי 4','לא תשתנה'],a:0,dur:1.6,why:'k = 0.637·A₀ – ביחס ישר לשטח. מפל הלחץ כמעט זהה (כ-78 bar), ולכן הספיקה גדלה מ-5.7 ל-11.2 L/min. (כל עוד היא קטנה מספיקת המשאבה.)'},
    {q:'בלי עומס (F = 0) מורידים את כיול שסתום הפריקה מ-100 ל-25 bar. פי כמה תקטן הספיקה במחט?',set:{F:0,pos:'a',auto:false},go:P=>{P.pr=25;},opts:['פי 4','פי 2','לא תשתנה'],a:1,dur:1.6,why:'Δp ירד בערך פי 4 (מ-~100 ל-~25 bar). Q ∝ √Δp – הספיקה קטנה פי 2 בלבד.'},
    {q:'צמצם רגיל (ללא אל-חוזר). מה יראה מד לחץ המשאבה בזמן חזרה?',set:{type:'plain',pos:'b',auto:false},act:(P,st)=>{st.x=200;},opts:['לחץ נמוך – חזרה חופשית','לחץ שסתום הפריקה – השמן החוזר נחנק במחט','0'],a:1,dur:1.8,why:'השמן מהצד המלא חייב לעבור במחט. כדי לדחוף אותו הלחץ בצד המוט עולה (מוכפל ב-A₁/A₂) עד ששסתום הפריקה נפתח.'}],
  tasks:[{q:P=>`מחט עם פתח ${P.A0} mm² (C_d = 0.7), מפל לחץ ${P.F} bar. מה הספיקה?`,a:P=>.637*P.A0*Math.sqrt(P.F),u:'L/min',hint:'Q = 0.637·A₀·√Δp.',rand:P=>{P.A0=pick([.8,1,1.5,2,3,4]);P.F=rnd(10,120,5);}},
    {q:P=>`נדרשים ${P.Q} L/min במפל לחץ של 50 bar. מה שטח פתח המחט?`,a:P=>P.Q/(.637*Math.sqrt(50)),u:'mm²',hint:'A₀ = Q/(0.637·√Δp).',rand:P=>{P.Q=rnd(4,30,1);}},
    {q:P=>`צמצם בכניסה: A₀ = ${P.A0} mm², שסתום פריקה ${P.pr} bar, עומס ${P.F} N על Ø${P.D}. מה מהירות היציאה (הזניחו עקיפה)?`,a:P=>H.v(.637*P.A0*Math.sqrt(P.pr-10*P.F/H.A(P.D)),H.A(P.D)),u:'mm/s',tol:.04,hint:'p_A = F/A₁, Q = k·√(p_s − p_A), v = Q/A₁.',rand:P=>{P.A0=pick([1,1.5,2,2.5]);P.pr=rnd(80,160,10);P.D=pick([40,50,63]);P.F=rnd(1000,8000,500);}},
    {q:P=>`ספיקה של ${P.Q} L/min דרך מחט עם k = ${fmt(P.A0,1)} L/min/√bar. מה מפל הלחץ?`,a:P=>(P.Q/P.A0)**2,u:'bar',hint:'Δp = (Q/k)².',rand:P=>{P.Q=rnd(3,20,1);P.A0=pick([1,1.5,2,2.5,3]);}},
    {q:P=>`המשאבה נותנת ${P.Q} L/min, המחט מעבירה ${fmt(P.Q/2,1)} L/min, שסתום הפריקה ב-${P.pr} bar. כמה חום נוצר בשסתום הפריקה?`,a:P=>P.pr*P.Q/2/600,u:'kW',hint:'P = p·Q_r/600, Q_r = Q − Q_מחט.',rand:P=>{P.Q=rnd(10,60,2);P.pr=rnd(80,200,10);}}],
  faults:[{id:'clog',t:'לכלוך במחט (הפתח בפועל קטן)',sym:'"לא נגענו בכיוון, אבל הצילינדר יוצא הרבה יותר לאט. החזרה בסדר."',hint:'השוו את הספיקה במחט ל-k·√Δp לפי השטח המכויל.',why:'Δp זהה אבל הספיקה רק 40% – הפתח האפקטיבי קטן. מנקים את הצמצם ומוסיפים סינון.'},
    {id:'chk',t:'אל-חוזר לא אוטם (כדור חסר / תקוע פתוח)',sym:'"הכפתור של הצמצם לא משנה כלום – הצילינדר יוצא תמיד מהר."',hint:'האם הספיקה ביציאה מתאימה ל-k·√Δp של המחט? שנו את A₀ וראו אם משהו משתנה.',why:'האל-חוזר עוקף את המחט גם בכיוון המבוקר. כמעט כל השמן עובר דרכו, והמחט "לא שולטת".'},
    {id:'relief',t:'שסתום הפריקה מכויל נמוך',sym:'"היציאה איטית יותר מהרגיל ועם עומס כבד הצילינדר נעצר."',hint:'מה מראה מד המשאבה בזמן יציאה, לעומת הכיול?',why:'לחץ המשאבה רק 60 bar במקום 100: מפל הלחץ על המחט קטן (60 − 25) והספיקה יורדת. עם עומס גבוה לא נשאר מפל בכלל.'}],
  test(H){const P=clone(this.P);P.auto=false;const R=runSim(this,P,.4).R;const A1=H.A(50),A2=H.Aann(50,28),k=.637*2;
    const P2=clone(this.P);P2.auto=false;P2.pos='b';const s2=this.init(P2);s2.x=150;let R2;for(let t=0;t<.3;t+=.02)R2=this.step(P2,s2,.02,{});
    const P3=clone(this.P);P3.auto=false;P3.pos='b';P3.type='plain';const s3=this.init(P3);s3.x=150;let R3;for(let t=0;t<.3;t+=.02)R3=this.step(P3,s3,.02,{});
    return [['p_A = F/A₁',R.pA,10*5000/A1],['Q = k·√Δp',R.Qn,k*Math.sqrt(R.ps-R.pA)],['v = Q/A₁',R.v,H.v(R.Qn,A1)],['איזון ספיקות Q_p = Q + Q_r',R.Qn+R.Qr,20],
      ['חזרה חופשית v = Q/A₂',-R2.v,H.v(20,A2)],['צמצם רגיל בחזרה Q_A = k·√p_A',R3.Qn,k*Math.sqrt(R3.pA)],['UI Δp',R.read[2].v,R.dp]];}};

/* ---------- 31 · pressure-compensated flow control vs plain throttle ---------- */
/* compensator cut-away: inlet p_s → spool metering edge → p_m → fixed orifice → outlet p_L; spring + p_L push the spool open, p_m pushes it closed. cs={y,us,um,uL,ts,tm,tL} */
SYM.c7_pcut={ports:o=>({}),bb:o=>[-90,-58,90,60],
  draw(g,o){C7_R(g,-86,-34,172,76,C7_MET,'syb');const fl=(x,y,w,h)=>C7_R(g,x,y,w,h,'#93c5fd','sy thin');
    const ins=[fl(-28,-34,16,24)],bore=fl(-74,-10,148,20),mid=[bore,fl(2,10,10,10)],outs=[fl(4,20,6,4),fl(2,24,10,8),fl(2,32,84,8),fl(68,10,8,22)];
    const rc=fl(66,-10,8,20);const sp=SP(g,'','sy thin');
    const sg=sv('g',{},g);C7_R(sg,-66,-10,46,20,'#64748b','sy thin');C7_R(sg,-20,-3,50,6,'#94a3b8','sy thin');C7_R(sg,30,-10,36,20,'#64748b','sy thin');
    C7_R(g,-74,-1,4,2,C7_MET,'');
    const ts=ST(g,-20,-38,'','st s'),tm=ST(g,-44,30,'','st s'),tL=ST(g,48,52,'','st s');[ts,tm,tL].forEach(t=>t.style.direction='ltr');ST(g,30,24,'פתח קבוע','st s');ST(g,46,-40,o.t||'','st b');
    return cs=>{cs=cs||{};const s=8-16*clamp(cs.y??.5,0,1);sg.setAttribute('transform',`translate(${s},0)`);rc.setAttribute('x',66+s);rc.setAttribute('width',Math.max(8-s,0));sp.setAttribute('d',zig(66+s,0,74,0,3,5));
      ins.forEach(r=>r.style.fill=pCss(cs.us||0));mid.forEach(r=>r.style.fill=pCss(cs.um||0));outs.forEach(r=>r.style.fill=pCss(cs.uL||0));rc.style.fill=pCss(cs.uL||0);
      ts.textContent=cs.ts||'';tm.textContent=cs.tm||'';tL.textContent=cs.tL||'';};}};
const C7_VG=10,C7_KCF=4;
function C7_fcvQ(p,pL,k2,dpc,stuck){const d=p-pL;if(d<=0)return 0;const full=Math.sqrt(d/(1/k2**2+1/C7_KCF**2));return stuck?full:Math.min(k2*Math.sqrt(dpc),full);}
const C7_SIM_PCFCV={id:'pcfcv',n:31,t:'ווסת זרימה מפוצה לחץ',d:'הספול המפצה שומר Δp קבוע על הפתח – ספיקה קבועה למרות שינוי עומס; מול צמצם רגיל',
  P:{T:8,sweep:false,Ath:1.8,Qs:8,Q:24,pr:100,dpc:8},
  ui(U,P){U.grp('עומס על שני המנועים');U.num(P,'T','מומנט עומס T','N·m',{min:0,max:18,step:.5});U.chk(P,'sweep','שינוי עומס תוך כדי עבודה (±60%, 8 s)');
    U.grp('כיוון השסתומים');U.num(P,'Ath','פתח הצמצם (ענף 1)','mm²',{min:.2,max:8,step:.1});U.num(P,'Qs','כיוון הווסת (ענף 2)','L/min',{min:1,max:20,step:.5});
    U.grp('משאבה ושסתום פריקה');U.num(P,'Q','ספיקת משאבה','L/min',{min:5,max:60,step:1});U.num(P,'pr','כיול שסתום פריקה','bar',{min:30,max:250,step:5});
    U.grp('המפצה',false);U.num(P,'dpc','Δp שקובע קפיץ המפצה','bar',{min:2,max:20,step:.5});U.note('שני מנועים זהים (10 cm³/rev) עם אותו עומס. ענף 1 – צמצם רגיל, ענף 2 – ווסת זרימה מפוצה לחץ (מפצה דו-דרכי לפני הפתח).');},
  circuit(P){return {comps:[{id:'P1',type:'pump',x:90,y:330,name:'משאבה',lbl:'משאבה',lblAt:[34,22]},{id:'T1',type:'tank',x:90,y:374,name:'מיכל'},
      {id:'RV',type:'pv',x:160,y:282,rot:180,o:{kind:'relief'},name:'שסתום פריקה',lbl:'פריקה',lblAt:[34,30]},{id:'T2',type:'tank',x:160,y:318,name:'מיכל'},
      {id:'GS',type:'gauge',x:210,y:238,net:'S',name:'מד לחץ אספקה',valAt:[-14,-14],l3:[0,-30]},
      {id:'TH',type:'throttle',x:260,y:190,name:'ענף 1: צמצם רגיל',lbl:'צמצם',lblAt:[-32,4],l3:[0,-30]},
      {id:'FC',type:'fcv',x:430,y:190,name:'ענף 2: ווסת זרימה מפוצה לחץ',lbl:'ווסת מפוצה',lblAt:[-48,4],l3:[0,-30]},
      {id:'M1',type:'motor',x:260,y:110,rot:180,name:'מנוע 1 (מוזן דרך הצמצם)',lbl:'מנוע 1',lblAt:[-46,-28],val:R=>`${fmt(R.n1,0)} rpm`,valAt:[22,4]},
      {id:'M2',type:'motor',x:430,y:110,rot:180,name:'מנוע 2 (מוזן דרך הווסת)',lbl:'מנוע 2',lblAt:[-46,-28],val:R=>`${fmt(R.n2,0)} rpm`,valAt:[22,4]},
      {id:'GL1',type:'gauge',x:272,y:151,rot:90,net:'L1',name:'מד לחץ עומס – מנוע 1'},{id:'GL2',type:'gauge',x:442,y:151,rot:90,net:'L2',name:'מד לחץ עומס – מנוע 2'},
      {id:'T4',type:'tank',x:300,y:86,name:'מיכל'},{id:'T5',type:'tank',x:470,y:86,name:'מיכל'},
      {id:'CUT',type:'c7_pcut',x:578,y:196,o:{t:'חתך הווסת'},name:'חתך: ספול מפצה (שמאל) ופתח קבוע. הקפיץ + p_L פותחים, p_m סוגר ⇒ Δp = p_m − p_L קבוע'},
      {id:'CH',type:'c7_chart',x:262,y:296,o:{w:200,h:68,t:'ספיקה מול לחץ העומס',xl:'p_L [bar]',yl:'Q [L/min]',col:[C7_OR,C7_BL],sw:[2,2],leg:[['צמצם',C7_OR,''],['ווסת זרימה מפוצה לחץ',C7_BL,'']]},name:'גרף: Q מול לחץ העומס לשני הענפים; הנקודות – מצב נוכחי'}],
     lines:[{id:'LS',net:'S0',pts:['T1.t','P1.in']},{id:'LP1',net:'S',pts:['P1.out',[90,250],[160,250]]},{id:'LP2',net:'S',pts:[[160,250],[260,250]]},{id:'LP3',net:'S',pts:[[260,250],[430,250],'FC.in'],tag:{at:[350,236],t:'pq'}},
      {id:'LTH',net:'S',pts:[[260,250],'TH.in']},{id:'LRV',net:'S',pts:[[160,250],'RV.P']},{id:'LRT',net:'T',pts:['RV.T','T2.t']},
      {id:'L1',net:'L1',pts:['TH.out','M1.A']},{id:'L2',net:'L2',pts:['FC.out','M2.A']},
      {id:'R1',net:'T',pts:['M1.B',[260,70],[300,70],'T4.t']},{id:'R2',net:'T',pts:['M2.B',[430,70],[470,70],'T5.t']}]};},
  init:P=>({t:0,tr:[]}),
  step(P,st,dt,ctx){const f=ctx.fault;st.t+=dt;const T=Math.max(0,P.sweep?P.T*(1+.6*Math.sin(2*PI*st.t/8)):P.T),pL=20*PI*T/C7_VG;
    const k1=H.orK(P.Ath),dpc=f==='spring'?3:P.dpc,k2=P.Qs/Math.sqrt(P.dpc),stuck=f==='stuck',Qp=P.Q*(f==='pump'?.45:1),ov=Math.max(3,.06*P.pr);
    const Q1=p=>p>pL?k1*Math.sqrt(p-pL):0,Q2=p=>C7_fcvQ(p,pL,k2,dpc,stuck);
    const ps=H.bisect(p=>Q1(p)+Q2(p)+H.reliefQ(p,P.pr,ov,Qp)-Qp,0,P.pr+ov*1.3);const q1=Q1(ps),q2=Q2(ps),Qr=H.reliefQ(ps,P.pr,ov,Qp);
    const dpo=(q2/k2)**2,pm=pL+dpo,dcomp=ps-pm,y=stuck?1:q2>0?clamp(q2/(C7_KCF*Math.sqrt(Math.max(dcomp,1e-6))),0,1):0,reg=!stuck&&q2>=k2*Math.sqrt(dpc)*.999;
    const n1=q1*1000/C7_VG,n2=q2*1000/C7_VG;KIT.rpmAng(st,dt,1450);KIT.rpmAng(st,dt,n1,'a1');KIT.rpmAng(st,dt,n2,'a2');
    const pmx=P.pr,xm=KIT.nice(P.pr*1.05),ym=KIT.nice(Math.max(k1*Math.sqrt(ps),P.Qs,4)*1.1),cv=fn=>{const L=[];for(let i=0;i<=40;i++){const x=xm*i/40;L.push([x,fn(x)]);}return L;};
    const c1=x=>ps>x?k1*Math.sqrt(ps-x):0,c2=x=>C7_fcvQ(ps,x,k2,dpc,stuck);const lim=ps-dpc-(k2*Math.sqrt(dpc)/C7_KCF)**2;
    return {T,pL,ps,q1,q2,Qr,dpo,pm,dcomp,y,reg,n1,n2,k1,k2,dpc,lim,Qp,
      p:{S:ps,L1:pL,L2:pL,T:.15,S0:-.05},q:{LS:Qp,LP1:Qp,LP2:q1+q2,LP3:q2,LTH:q1,LRV:Qr,LRT:Qr,L1:q1,L2:q2,R1:q1,R2:q2},pmax:pmx,qref:Math.max(P.Qs,6),
      c:{P1:{on:true,ang:st.ang},M1:{ang:st.a1},M2:{ang:st.a2},RV:{open:clamp(Qr/Qp,0,1)},TH:{knob:P.Ath/2},FC:{knob:P.Qs/4},
        CUT:{y,us:ps/pmx,um:pm/pmx,uL:pL/pmx,ts:`p_s ${fmt(ps,0)}`,tm:`p_m ${fmt(pm,1)}`,tL:`p_L ${fmt(pL,1)} bar`},
        CH:{xm,ym,L:[cv(c1),cv(c2)],dots:[[pL,q1,C7_OR],[pL,q2,C7_BL]]}},
      read:[{k:'לחץ אספקה',v:ps,u:'bar'},{k:'לחץ עומס',v:pL,u:'bar'},{k:'Q צמצם',v:q1,u:'L/min',max:P.Q},{k:'Q ווסת',v:q2,u:'L/min',max:P.Q,w:!reg},
        {k:'מנוע 1',v:n1,u:'rpm',dg:0,max:P.Q*1000/C7_VG},{k:'מנוע 2',v:n2,u:'rpm',dg:0,max:P.Q*1000/C7_VG},{k:'Δp על הפתח',v:dpo,u:'bar',max:20}]};},
  ins(P,R){const L=[];
    if(R.reg)L.push({ic:'🎯',at:'CUT',h:`הקפיץ המפצה מחזיק <b>Δp = ${fmt(R.dpo,1)} bar</b> על הפתח הקבוע, ולכן ${C7_L(`Q = k·√Δp = ${fmt(R.k2,2)}·√${fmt(R.dpo,1)} = <b>${fmt(R.q2,2)} L/min</b>`)} – בלי קשר ללחץ העומס (${fmt(R.pL,1)} bar).`});
    else L.push({ic:'⚠️',w:true,at:'FC',h:`p_s − p_L = ${fmt(R.ps-R.pL,1)} bar – פחות מ-${fmt(R.dpc+(R.k2*Math.sqrt(R.dpc)/C7_KCF)**2,1)} bar שהווסת צריך (Δp קפיץ + מפל בספול פתוח). הספול פתוח עד הסוף והספיקה יורדת ל-${fmt(R.q2,2)} L/min.`,c:'הווסת יצא מתחום הוויסות'});
    L.push({ic:'🔧',at:'CUT',h:`הספול "בולע" את עודף הלחץ: ${C7_L(`p_s − p_m = ${fmt(R.dcomp,1)} bar`)} נופלים בקצה הספול (פתוח ${fmt(R.y*100,0)}%). עלה העומס – הספול נפתח; ירד – נסגר.`});
    L.push({ic:'⚖️',at:'M1',h:`בצמצם ${C7_L(`Δp = p_s − p_L = ${fmt(R.ps-R.pL,1)} bar`)}, ולכן ${fmt(R.q1,2)} L/min (${fmt(R.n1,0)} rpm). כל שינוי עומס משנה את המהירות שלו; מנוע 2 נשאר על ${fmt(R.n2,0)} rpm.`});
    L.push({ic:'🔥',at:'RV',h:`הווסת לא חוסך אנרגיה: בענף 2 נופלים ${fmt(R.ps-R.pL,1)} bar → ${fmt(H.kW(R.ps-R.pL,R.q2),2)} kW חום, ובשסתום הפריקה עוד ${fmt(H.kW(R.ps,R.Qr),2)} kW (${fmt(R.Qr,1)} L/min).`});
    if(P.sweep)L.push({ic:'📈',at:'CH',h:'בגרף: הנקודה הכתומה (צמצם) רצה על עקום יורד, הכחולה (ווסת) נשארת על הקו השטוח – עד גבול הוויסות מימין.'});return L;},
  calc(P,R){const k1=R.k1,k2=R.k2,dmin=(k2*Math.sqrt(R.dpc)/C7_KCF)**2;return `<div class="kpis">${kpi('ספיקה – ווסת',fmt(R.q2,2),'L/min')}${kpi('ספיקה – צמצם',fmt(R.q1,2),'L/min')}${kpi('Δp על הפתח',fmt(R.dpo,2),'bar')}${kpi('גבול ויסות p_L',fmt(R.lim,1),'bar')}</div>`+
    det('לחץ העומס של המנוע',row('',`Δp = 20π·T/V_g = 20π·${fmt(R.T,2)}/${C7_VG} = ${V(R.pL,'bar')}`),true)+
    det('ענף 1 – צמצם',row('',`k₁ = 0.637·${fmt(P.Ath,2)} = ${V(k1,'L/min/√bar',3)}`)+row('',`Q₁ = k₁·√(p_s − p_L) = ${fmt(k1,3)}·${sq(fmt(R.ps,1)+' − '+fmt(R.pL,1))} = ${V(R.q1,'L/min')} ⇒ n = Q·1000/V_g = ${V(R.n1,'rpm',0)}`),true)+
    det('ענף 2 – ווסת זרימה מפוצה לחץ',row('איזון הספול',`p_m·A = p_L·A + F_s ⇒ p_m − p_L = F_s/A = Δp_c = ${V(R.dpc,'bar')}`)+row('הפתח הקבוע',`k₂ = Q_set/√Δp_c = ${fmt(P.Qs,1)}/√${fmt(P.dpc,1)} = ${V(k2,'L/min/√bar',3)}`)+
      row('ספיקה',`Q₂ = k₂·√Δp_c = ${V(k2*Math.sqrt(R.dpc),'L/min')}`,R.reg)+row('תחום ויסות',`p_s − p_L ≥ Δp_c + (Q₂/k_c)² = ${fmt(R.dpc,1)} + ${fmt(dmin,1)} ⇒ p_L ≤ ${V(R.lim,'bar')}`),true)+
    det('אספקה וחום',row('מאזן',`Q_p = Q₁ + Q₂ + Q_r ⇒ ${fmt(R.Qp,1)} = ${fmt(R.q1,2)} + ${fmt(R.q2,2)} + ${fmt(R.Qr,2)}`)+row('חום',`ענף 1: ${V(H.kW(R.ps-R.pL,R.q1),'kW',3)} · ענף 2: ${V(H.kW(R.ps-R.pL,R.q2),'kW',3)} · שסתום פריקה: ${V(H.kW(R.ps,R.Qr),'kW',3)}`))+
    `<div class="note">k_c = ${C7_KCF} L/min/√bar – מקדם הספול כשהוא פתוח לגמרי. מנועים אידאליים (ללא דליפה), צנרת חזרה ללא מפל לחץ.</div>`;},
  demo:[{t:'שני ענפים, אותו עומס',x:'משאבה אחת מזינה שני מנועים זהים באותו עומס. משמאל – <b>צמצם רגיל</b>, מימין – <b>ווסת זרימה מפוצה לחץ</b>. בעומס 8 N·m שניהם מכוונים ל-8 L/min.',reset:true,hl:['TH','FC','M1','M2'],dur:8},
    {t:'מעלים את העומס',x:'T = 12 N·m: לחץ העומס עולה ל-75 bar. בצמצם נשאר מפל לחץ קטן – מנוע 1 מאט. מנוע 2 כמעט לא מרגיש.',set:{T:12},hl:['M1','M2','CH'],dur:8},
    {t:'מה קורה בתוך הווסת',x:'הספול המפצה נפתח: הוא "מוותר" על מפל לחץ כדי שעל הפתח הקבוע יישארו בדיוק 8 bar. Δp קבוע ⇒ Q קבוע.',hl:['CUT'],dur:8},
    {t:'מורידים את העומס',x:'T = 3 N·m: מנוע 1 מאיץ, והספול בווסת נסגר כמעט – הוא בולע את כל עודף הלחץ.',set:{T:3},hl:['CUT','M1'],dur:8},
    {t:'עומס משתנה תוך כדי עבודה',x:'הפעלנו שינוי עומס אוטומטי. בגרף: הנקודה הכתומה רצה על העקום, הכחולה עומדת על הקו השטוח.',set:{T:8,sweep:true},hl:['CH'],dur:10},
    {t:'גבול הוויסות',x:'T = 15.5 N·m: לחץ העומס 97 bar. אין מספיק הפרש לחצים (צריך כ-12 bar) – הספול פתוח לגמרי, הווסת מתנהג כמו צמצם והספיקה יורדת.',set:{T:15.5,sweep:false},hl:['FC','CUT'],dur:8},
    {t:'מעלים את כיול שסתום הפריקה',x:'כיול 140 bar: הצמצם מעביר יותר (מפל לחץ גדול יותר), הווסת – בדיוק אותו דבר. אבל יותר לחץ = יותר חום.',set:{T:8,pr:140},hl:['RV','M1','M2'],dur:8}],
  predict:[{q:'מעלים את מומנט העומס מ-4 ל-12 N·m. מה יקרה למהירות מנוע 2 (ווסת זרימה מפוצה לחץ)?',set:{T:4},go:P=>{P.T=12;},opts:['תרד כמו מנוע 1','תישאר כמעט קבועה','תעלה'],a:1,why:'הספול שומר 8 bar על הפתח הקבוע. Q = k·√8 לא תלוי בלחץ העומס כל עוד יש מספיק הפרש לחצים.'},
    {q:'באותו שינוי (4 → 12 N·m), מה יקרה למנוע 1 (צמצם)?',set:{T:4},go:P=>{P.T=12;},opts:['כמעט קבוע','יאט בבירור','יעצור לגמרי'],a:1,why:'Δp = p_s − p_L יורד מ-75 ל-25 bar בערך, וה-Q יורד כשורש – בערך פי 1.7.'},
    {q:'מעלים את כיול שסתום הפריקה מ-100 ל-150 bar. מה יקרה לספיקה דרך הווסת?',set:{pr:150},opts:['תגדל','לא תשתנה','תקטן'],a:1,why:'הלחץ הנוסף נבלע בספול המפצה. Δp על הפתח הקבוע נשאר 8 bar – הספיקה זהה. (הצמצם דווקא יעביר יותר.)'},
    {q:'עומס של 15 N·m (לחץ עומס 94 bar), שסתום פריקה 100 bar. מה יעשה הווסת?',set:{T:15},opts:['ימשיך לתת 8 L/min','הספיקה תרד – אין מספיק מפל לחץ לוויסות','הספיקה תעלה'],a:1,why:'צריך p_s − p_L ≥ Δp_c + מפל בספול הפתוח ≈ 12 bar. יש רק כ-9 bar – הספול פתוח לגמרי והספיקה יורדת לכ-7 L/min.'}],
  tasks:[{q:P=>`פתח קבוע ${fmt(P.Ath,1)} mm² (C_d = 0.7) וקפיץ מפצה של ${P.dpc} bar. מה ספיקת הווסת?`,a:P=>.637*P.Ath*Math.sqrt(P.dpc),u:'L/min',hint:'Q = 0.637·A₀·√Δp_c.',rand:P=>{P.Ath=pick([2,3,4,5,6]);P.dpc=pick([5,6,8,10]);}},
    {q:P=>`צמצם עם k = ${fmt(.637*P.Ath,3)} L/min/√bar, לחץ אספקה ${P.pr} bar, לחץ עומס ${fmt(20*PI*P.T/C7_VG,1)} bar. מה הספיקה?`,a:P=>.637*P.Ath*Math.sqrt(P.pr-20*PI*P.T/C7_VG),u:'L/min',hint:'Q = k·√(p_s − p_L).',rand:P=>{P.Ath=pick([1.5,1.8,2,2.5]);P.pr=rnd(80,160,10);P.T=rnd(2,10,.5);}},
    {q:P=>`מנוע ${C7_VG} cm³/rev עם מומנט ${P.T} N·m. מה לחץ העומס?`,a:P=>20*PI*P.T/C7_VG,u:'bar',hint:'Δp = 20π·T/V_g.',rand:P=>{P.T=rnd(2,15,.5);}},
    {q:P=>`ווסת עם Δp_c = ${P.dpc} bar ועוד ${fmt(P.Ath,1)} bar מפל בספול כשהוא פתוח. לחץ אספקה ${P.pr} bar. עד איזה לחץ עומס הספיקה נשמרת?`,a:P=>P.pr-P.dpc-P.Ath,u:'bar',hint:'p_L,max = p_s − Δp_c − Δp_ספול.',rand:P=>{P.dpc=pick([5,6,8,10]);P.Ath=pick([2,3,4,5]);P.pr=rnd(80,200,10);}},
    {q:P=>`אספקה ${P.pr} bar, לחץ עומס ${fmt(20*PI*P.T/C7_VG,1)} bar, Δp_c = 8 bar, ${P.Qs} L/min. כמה הספק נשרף בספול המפצה?`,a:P=>(P.pr-20*PI*P.T/C7_VG-8)*P.Qs/600,u:'kW',hint:'P = (p_s − p_L − Δp_c)·Q/600.',rand:P=>{P.pr=rnd(80,180,10);P.T=rnd(2,8,.5);P.Qs=rnd(4,16,1);}}],
  faults:[{id:'stuck',t:'ספול המפצה תקוע פתוח',sym:'"מנוע 2 מתנהג בדיוק כמו מנוע 1 – מאט כשיש עומס, ובלי עומס הוא מהיר מדי."',hint:'מה מראה Δp על הפתח הקבוע כשהעומס משתנה?',why:'הספול לא זז: אין פיצוי, והווסת הוא רק שני פתחים בטור. Δp על הפתח משתנה עם העומס – הספיקה כבר לא קבועה.'},
    {id:'spring',t:'קפיץ המפצה חלש / שבור חלקית',sym:'"מנוע 2 שומר על מהירות קבועה – אבל איטית בהרבה ממה שכיוונו."',hint:'השוו את Δp על הפתח הקבוע לערך הנומינלי (8 bar).',why:'הקפיץ מחזיק רק 3 bar במקום 8: Q = k·√3 ≈ 61% מהכיוון. הספיקה עדיין לא תלויה בעומס.'},
    {id:'pump',t:'משאבה שחוקה (ספיקה נמוכה)',sym:'"שני המנועים איטיים, מנוע 1 כמעט עומד, ושסתום הפריקה שקט."',hint:'מה לחץ האספקה לעומת כיול שסתום הפריקה? לאן הולכת הספיקה?',why:'המשאבה נותנת רק 45% (10.8 L/min). שסתום הפריקה סגור והלחץ נקבע בצרכנים. הווסת "לוקח קודם" את הספיקה שלו – הצמצם נשאר עם השארית.'}],
  test(H){const P=clone(this.P);const R=this.step(P,{t:0,tr:[]},0,{});const pL=20*PI*8/10,k1=.637*1.8;const P2=clone(this.P);P2.T=12;const R2=this.step(P2,{t:0,tr:[]},0,{});
    return [['p_L = 20πT/V_g',R.pL,pL],['ווסת: Q = k₂·√Δp_c',R.q2,8],['ווסת בעומס 12 N·m',R2.q2,8],['צמצם: Q = k·√(p_s − p_L)',R.q1,k1*Math.sqrt(R.ps-pL)],['Δp על הפתח = Δp_c',R.dpo,8],
      ['מאזן ספיקות',R.q1+R.q2+R.Qr,24],['n = Q·1000/V_g',R.n2,800],['UI ספיקה ווסת',R.read[3].v,R.q2]];}};

/* ---------- 32 · flow divider ---------- */
/* flow divider symbol: o.kind 'gear' (two coupled gear sections) | 'spool' (orifices + compensating spool). ports in (bottom), o1, o2 (top) */
SYM.c7_div={ports:o=>({in:[0,28],o1:[-30,-28],o2:[30,-28]}),bb:o=>[-36,-30,36,30],
  draw(g,o){SL(g,0,28,0,20);SL(g,-30,-28,-30,-22);SL(g,30,-28,30,-22);let m1=null,m2=null;
    if(o.kind==='spool'){SR(g,-26,-18,52,36,'syb');SL(g,0,20,0,18);SL(g,0,18,0,8);SL(g,-13,8,13,8);SL(g,-13,8,-13,-18);SL(g,13,8,13,-18);
      SP(g,'M-17,-9 Q-14,-4 -17,1 M-9,-9 Q-12,-4 -9,1 M9,-9 Q12,-4 9,1 M17,-9 Q14,-4 17,1','sy thin');SR(g,-5,-14,10,6,'syb');SP(g,'M-13,-11 H-5 M5,-11 H13','sy pil');
      SL(g,-13,-18,-13,-22);SL(g,13,-18,13,-22);SL(g,-30,-22,-13,-22);SL(g,30,-22,13,-22);}
    else{SL(g,-14,20,14,20);SL(g,-14,20,-14,11);SL(g,14,20,14,11);SC(g,-14,0,11,'syb');SC(g,14,0,11,'syb');SP(g,'M-14,-11 L-18,-4 L-10,-4Z M14,-11 L10,-4 L18,-4Z','syf');
      SL(g,-3,-1.5,3,-1.5);SL(g,-3,1.5,3,1.5);SL(g,-14,-11,-14,-22);SL(g,14,-11,14,-22);SL(g,-30,-22,-14,-22);SL(g,30,-22,14,-22);
      m1=SL(g,-14,0,-14,7,'sy thin');m2=SL(g,14,0,14,7,'sy thin');}
    SR(g,-34,-25,68,47,'sy dash thin');
    return cs=>{const a=((cs&&cs.ang)||0)*57.3;if(m1)m1.setAttribute('transform',`rotate(${a} -14 0)`);if(m2)m2.setAttribute('transform',`rotate(${-a} 14 0)`);};}};
B3.c7_div=(c,o)=>{const M=m3(),g=new THREE.Group();let r1=null,r2=null;
  if(o.kind==='spool'){g.add(edges(at(box3(56,34,22,M.alu),0,0,11)));g.add(at(cyl3(5,10,M.steel,'x'),-32,4,11));g.add(at(cyl3(5,10,M.steel,'x'),32,4,11));}
  else{[-1,1].forEach(s=>{g.add(edges(at(cyl3(12,20,M.blue,'z'),s*14,0,10)));});g.add(at(cyl3(2.5,16,M.steel,'x'),0,0,10));
    r1=at(box3(2,16,2,M.white),-14,0,21);r2=at(box3(2,16,2,M.white),14,0,21);g.add(r1,r2);}
  return {g,upd(cs){const a=(cs&&cs.ang)||0;if(r1){r1.rotation.z=a;r2.rotation.z=-a;}}};};
/* dashed "platform level" line between the two loads. o={x1,x2,y0,y1}; cs={y1,y2,t} */
SYM.c7_level={ports:o=>({}),bb:o=>[o.x1,o.y0,o.x2,o.y1],
  draw(g,o){const ln=SL(g,o.x1,0,o.x2,0,'sy dash');ln.style.stroke='#7c3aed';ln.style.strokeWidth=1.6;const t=ST(g,(o.x1+o.x2)/2,0,'','st b');t.style.fill='#6d28d9';t.style.direction='ltr';
    return cs=>{if(!cs)return;ln.setAttribute('y1',cs.y1);ln.setAttribute('y2',cs.y2);t.setAttribute('y',Math.min(cs.y1,cs.y2)-7);t.textContent=cs.t||'';};}};
const C7_DS=250,C7_DKL=20/Math.sqrt(5),C7_DKO=20/Math.sqrt(50),C7_DC=.012,C7_DLK=.3;
const C7_C1X=139,C7_C2X=251,C7_CY=190;
const C7_SIM_DIV={id:'divider',n:32,t:'מחלק זרימה',d:'שני צילינדרים עם עומסים שונים עולים יחד; שגיאת חלוקה של אחוזים בודדים; מול חיבור פשוט',
  P:{type:'gear',m1:800,m2:1400,Q:20,pos:'a',auto:true,D:50,pr:120},
  key:P=>P.type,
  ui(U,P){U.grp('מחלק הזרימה');U.seg(P,'type','סוג',[['none','ללא (הסתעפות)'],['gear','גלגלי שיניים'],['spool','ספול']],true);
    U.grp('עומסים');U.num(P,'m1','מסה על צילינדר 1','kg',{min:0,max:3000,step:50});U.num(P,'m2','מסה על צילינדר 2','kg',{min:0,max:3000,step:50});
    U.grp('הפעלה');U.seg(P,'pos','ידית',C7_POSV);U.chk(P,'auto','מחזור אוטומטי');U.num(P,'Q','ספיקת משאבה','L/min',{min:4,max:60,step:1});
    U.grp('עוד',false);U.num(P,'D','קוטר הבוכנות D','mm',{min:25,max:100,step:1});U.num(P,'pr','כיול שסתום פריקה','bar',{min:40,max:250,step:5});U.note('צילינדרים חד-פעולה; ההורדה בכוח המשקל דרך צמצם קבוע. במחלק יש שסתומי סנכרון פנימיים שמשלימים את המהלך בסוף.');},
  circuit(P){const t=P.type,c1x=C7_C1X,c2x=C7_C2X;const comps=[{id:'C1',type:'c7_vcyl',x:c1x,y:C7_CY,o:{single:true},name:'צילינדר 1 (חד-פעולה)',lbl:'1',lblAt:[-30,40],l3:[0,-60]},
      {id:'C2',type:'c7_vcyl',x:c2x,y:C7_CY,o:{single:true,left:true},name:'צילינדר 2 (חד-פעולה)',lbl:'2',lblAt:[30,40],l3:[0,-60]},
      {id:'LV',type:'c7_level',x:0,y:0,o:{x1:c1x+22,x2:c2x-22,y0:20,y1:140},name:'קו פלס בין שני העומסים – ההפרש בגובה Δx'},
      {id:'G1',type:'gauge',x:153,y:246,rot:-90,net:'n1',name:'מד לחץ צילינדר 1',valAt:[-14,12]},{id:'G2',type:'gauge',x:237,y:246,rot:90,net:'n2',name:'מד לחץ צילינדר 2',valAt:[16,12]},
      {id:'V1',type:'dcv',x:195,y:355,o:{box:['P>A T|','P| A| T|','A>T P|'],ways:3,L:'lever',center:true},name:'שסתום פיקוד 3/3 – לחיצה מחליפה מצב',lbl:'3/3',lblAt:[-62,4],l3:[0,-30]},
      {id:'P1',type:'pump',x:120,y:436,name:'משאבה',lbl:'משאבה',lblAt:[34,6]},{id:'T1',type:'tank',x:120,y:480,name:'מיכל'},
      {id:'RV',type:'pv',x:75,y:398,rot:-90,o:{kind:'relief'},name:'שסתום פריקה',lbl:'פריקה',lblAt:[0,-28]},{id:'T2',type:'tank',x:35,y:424,name:'מיכל'},
      {id:'GP',type:'gauge',x:150,y:386,net:'in',name:'מד לחץ משאבה / כניסה למחלק',l3:[0,-30]},
      {id:'TH',type:'throttle',x:260,y:428,rot:180,o:{adj:false},name:'צמצם קבוע להורדה',lbl:'צמצם הורדה',lblAt:[48,0]},{id:'T3',type:'tank',x:260,y:464,name:'מיכל'},
      {id:'CH',type:'c7_chart',x:334,y:44,o:{w:210,h:110,t:'גובה הבוכנות לאורך הזמן',xl:'זמן [s]',yl:'x [mm]',col:[C7_BL,C7_OR],sw:[2,2],leg:[['צילינדר 1',C7_BL,''],['צילינדר 2',C7_OR,'']]},name:'גרף: מיקום שני הצילינדרים (10 s אחרונות)'}];
    const lines=[{id:'LS',net:'S',pts:['T1.t','P1.in']},{id:'LP',net:'in',pts:['P1.out',[120,398],[188,398],'V1.P']},{id:'LRV',net:'in',pts:[[120,398],'RV.P']},{id:'LRT',net:'T',pts:['RV.T',[35,398],'T2.t']},
      {id:'LT1',net:'T1',pts:['V1.T',[202,398],[260,398],'TH.in']},{id:'LT2',net:'T',pts:['TH.out','T3.t']}];
    if(t==='none'){lines.push({id:'N1',net:'n1',pts:['C1.A',[165,290],[195,290]]},{id:'N2',net:'n2',pts:['C2.A',[225,290],[195,290]]},{id:'IN',net:'in',pts:[[195,290],'V1.A']});}
    else{comps.push({id:'DV',type:'c7_div',x:195,y:290,o:{kind:t},name:t==='gear'?'מחלק זרימה גלגלי שיניים: שתי יחידות על ציר משותף (+ שסתומי סנכרון)':'מחלק זרימה ספול: שני פתחים + ספול מפצה',lbl:t==='gear'?'מחלק גלגלי שיניים':'מחלק ספול',lblAt:[-82,30],l3:[0,-30]});
      lines.push({id:'N1',net:'n1',pts:['C1.A','DV.o1']},{id:'N2',net:'n2',pts:['C2.A','DV.o2']},{id:'IN',net:'in',pts:['DV.in','V1.A']});}
    return {comps,lines};},
  init:P=>({x1:0,x2:0,t:0,tr:[],si:KIT.idx[P.pos],idle:0}),
  click(id,P){if(id==='V1'){P.pos=P.pos==='a'?'0':P.pos==='0'?'b':'a';P.auto=false;return true;}},
  step(P,st,dt,ctx){const f=ctx.fault,A=H.A(P.D),S=C7_DS,typ=P.type;st.t+=dt;
    const p1=10*P.m1*G/A,p2=10*P.m2*G/A,Qp=P.Q*(f==='pump'?.6:1),ov=Math.max(3,.06*P.pr),prb=.75*P.pr;
    const d0=KIT.dirOf(P.pos);C7_seq(P,st,dt,(d0>0&&st.x1>=S-1e-6&&st.x2>=S-1e-6)||(d0<0&&st.x1<=1e-6&&st.x2<=1e-6)||st.idle>1);
    const dir=KIT.dirOf(P.pos),top1=st.x1>=S-1e-6,top2=st.x2>=S-1e-6,bot1=st.x1<=1e-6,bot2=st.x2<=1e-6;
    const err=(dpp,Q)=>typ==='gear'?.005+C7_DC*(f==='wear'?6:1)*dpp/Math.max(Q,1):typ==='spool'?(.004+.012*Math.tanh(dpp/15))*Math.sqrt(20/Math.max(Q,2))*(f==='wear'?5:1):0;
    const Qb=(p,pk,x)=>{const d=p-pk;if(d>0)return x>=S-1e-6?0:C7_DKL*Math.sqrt(d);return x<=1e-6?0:-C7_DKL*Math.sqrt(-d);};
    let q1=0,q2=0,pin=P.pr+ov,Qr=Qp,n1=st.x1>0?p1:0,n2=st.x2>0?p2:0,e=0,qT=0,pj=0,lk=0,qrb=0,mode='hold';
    if(dir>0){mode='up';
      if(typ==='none'){pin=H.bisect(p=>Qb(p,p1,st.x1)+Qb(p,p2,st.x2)+H.reliefQ(p,P.pr,ov,Qp)-Qp,0,P.pr+ov*1.3);q1=Qb(pin,p1,st.x1);q2=Qb(pin,p2,st.x2);Qr=H.reliefQ(pin,P.pr,ov,Qp);
        n1=q1!==0?p1:pin;n2=q2!==0?p2:pin;}
      else{e=err(p2-p1,Qp);const Q1=Qp/2*(1+e),Q2=Qp/2*(1-e),dl=typ==='gear'?3:6;Qr=0;
        if(top1&&top2){pin=prb+dl;n1=n2=prb;qrb=Qp;e=0;}
        else{n1=top1?prb:p1;n2=top2?prb:p2;pin=typ==='gear'?(n1+n2)/2+dl:Math.max(n1,n2)+dl;
          if(pin>P.pr){pin=P.pr+ov;Qr=Qp;e=0;}else{q1=top1?0:Q1;q2=top2?0:Q2;qrb=(top1?Q1:0)+(top2?Q2:0);if(f==='relief'&&!top2){lk=C7_DLK*Math.sqrt(n2);q2-=lk;qrb+=lk;}}}}}
    else if(dir<0){mode='down';
      if(typ==='none'){const h=p=>-Qb(p,p1,st.x1)-Qb(p,p2,st.x2)-C7_DKO*Math.sqrt(p);pj=H.bisect(h,0,Math.max(p1,p2,1));q1=Qb(pj,p1,st.x1);q2=Qb(pj,p2,st.x2);n1=q1!==0?p1:(bot1?pj:p1);n2=q2!==0?p2:(bot2?pj:p2);}
      else{const dl=typ==='gear'?3:6;pj=Math.max(typ==='gear'?(p1+p2)/2-dl:Math.min(p1,p2)-dl,0);const Qt=C7_DKO*Math.sqrt(pj);e=err(p1-p2,Qt);
        q1=bot1?0:-Qt/2*(1+e);q2=bot2?0:-Qt/2*(1-e);if(f==='relief'&&!bot2){lk=C7_DLK*Math.sqrt(p2);q2-=lk;}}
      qT=-(q1+q2)-lk;}
    else{if(typ==='none'){const d=p2-p1;if(d>0&&st.x2>0&&st.x1<S)q1=C7_DKL/Math.SQRT2*Math.sqrt(d);else if(d<0&&st.x1>0&&st.x2<S)q1=-C7_DKL/Math.SQRT2*Math.sqrt(-d);q2=-q1;if(q1!==0){n1=n2=(p1+p2)/2;}}
      else if(typ==='gear'&&st.x1>0&&st.x2>0){q1=C7_DC*(p2-p1)/2;q2=-q1;}
      if(f==='relief'&&st.x2>0){lk=C7_DLK*Math.sqrt(p2);q2-=lk;}}
    st.x1=clamp(st.x1+H.v(q1,A)*dt,0,S);st.x2=clamp(st.x2+H.v(q2,A)*dt,0,S);if(st.x1<=0)n1=dir>0?n1:0;if(st.x2<=0)n2=dir>0?n2:0;
    st.idle=dir!==0&&Math.abs(q1)+Math.abs(q2)<.01?st.idle+dt:0;KIT.ease(st,'si',KIT.idx[P.pos],dt);KIT.rpmAng(st,dt,1450);KIT.rpmAng(st,dt,(Math.abs(q1)+Math.abs(q2))*60,'da');
    const dx=st.x1-st.x2,both=Math.abs(q1)>.01&&Math.abs(q2)>.01,erp=both?(Math.abs(q1)-Math.abs(q2))/(Math.abs(q1)+Math.abs(q2))*100:0,pm=P.pr;
    C7_trace(st,dt,[st.t,st.x1,st.x2],10);const t0=Math.max(0,st.t-10),yc=x=>C7_CY+44-80*x/S-113;
    const ps=dir>0?pin:P.pr+ov;
    return {mode,typ,p1,p2,n1,n2,pin:dir>0?pin:0,ps,pj,q1,q2,e,erp,dx,lk,qrb,Qr,Qp,A,
      p:{in:ps,n1,n2,T1:dir<0?pj:0,T:Math.min(1,qT/Math.max(P.Q,1)),S:-.05},q:{LS:Qp,LP:dir>0?Qp-Qr:0,LRV:dir>0?Qr:Qp,LRT:dir>0?Qr:Qp,N1:-q1,N2:-q2,IN:-(q1+q2),LT1:qT,LT2:qT},pmax:pm,qref:Math.max(P.Q/2,4),
      c:{C1:{x:st.x1/S,uA:n1/pm,lt:`${fmt(P.m1/1000,2)} t`},C2:{x:st.x2/S,uA:n2/pm,lt:`${fmt(P.m2/1000,2)} t`},V1:{i:st.si},P1:{on:true,ang:st.ang},RV:{open:clamp(Qr/Qp,0,1)},DV:{ang:st.da},
        LV:{y1:yc(st.x1),y2:yc(st.x2),t:`Δx = ${fmt(dx,1)} mm`},
        CH:{xm:10,ym:S,L:[st.tr.map(q=>[q[0]-t0,q[1]]),st.tr.map(q=>[q[0]-t0,q[2]])],dots:[]}},
      read:[{k:'לחץ כניסה',v:ps,u:'bar'},{k:'לחץ צילינדר 1',v:n1,u:'bar'},{k:'לחץ צילינדר 2',v:n2,u:'bar'},{k:'Q לצילינדר 1',v:q1,u:'L/min',max:P.Q},{k:'Q לצילינדר 2',v:q2,u:'L/min',max:P.Q},
        {k:'הפרש גובה Δx',v:dx,u:'mm',max:S,w:Math.abs(dx)>10},{k:'שגיאת חלוקה',v:erp,u:'%',dg:2,max:10,w:Math.abs(erp)>5}]};},
  ins(P,R){const L=[];
    if(R.typ==='none'){if(R.mode==='up'&&Math.abs(R.q1)>.01&&Math.abs(R.q2)<.01)L.push({ic:'⚠️',w:true,at:'C2',h:`בלי מחלק השמן בוחר את הדרך הקלה: צילינדר 1 צריך ${fmt(R.p1,1)} bar וצילינדר 2 ${fmt(R.p2,1)} bar. הלחץ נעצר ב-${fmt(R.ps,1)} bar – כל ${fmt(R.q1,1)} L/min הולכים לצילינדר 1.`,c:'צילינדר 2 מחכה – כל השמן הולך לקל'});
      else if(R.mode==='up'&&Math.abs(R.q2)>.01&&Math.abs(R.q1)<.01)L.push({ic:'⏳',at:'C2',h:`צילינדר 1 הגיע לסוף – רק עכשיו הלחץ עולה ל-${fmt(R.ps,1)} bar וצילינדר 2 זז.`});
      if(R.mode==='down')L.push({ic:'⬇️',at:'C2',h:`בהורדה ההפך: הכבד (${fmt(R.p2,1)} bar) דוחף ראשון. צומת הצנרת ב-${fmt(R.pj,1)} bar – ${R.pj>R.p1?'יותר מלחץ צילינדר 1, שנשאר במקום (או אפילו עולה!)':'גם צילינדר 1 יורד'}.`});
      if(R.mode==='hold'&&Math.abs(R.q1)>.01)L.push({ic:'⚠️',w:true,at:'LV',h:`גם בעצירה הצילינדרים מחוברים: הכבד דוחף שמן לקל (${fmt(Math.abs(R.q1),2)} L/min) עד שאחד מגיע לסוף.`,c:'העומס הכבד דוחף את הקל'});}
    else{const g=R.typ==='gear';
      if(R.mode==='up'&&Math.abs(R.q1)>.01&&Math.abs(R.q2)>.01){L.push({ic:'⚖️',at:'DV',h:g?`שתי יחידות גלגלי שיניים על ציר אחד: כל סיבוב מעביר נפח שווה לכל צד ⇒ Q₁ ≈ Q₂ ≈ ${fmt(R.Qp/2,1)} L/min, למרות ${fmt(R.p1,1)} מול ${fmt(R.p2,1)} bar.`:`הספול המפצה חונק את הצד הקל כך שעל שני הפתחים אותו Δp ⇒ ספיקות שוות (${fmt(R.q1,2)} / ${fmt(R.q2,2)} L/min).`});
        L.push({ic:'📏',at:'LV',h:`שגיאת חלוקה <b>${fmt(R.erp,2)}%</b>${g?` – דליפה פנימית ∝ Δp = ${fmt(R.p2-R.p1,1)} bar`:''}. ההפרש מצטבר: כרגע Δx = ${fmt(R.dx,1)} mm, ובסוף מהלך כ-${fmt(2*R.erp/100*C7_DS,1)} mm. שסתומי הסנכרון מיישרים בסוף המהלך.`});
        if(g)L.push({ic:'🔀',at:'GP',h:`לחץ הכניסה רק ${fmt(R.ps,1)} bar – פחות מ-${fmt(Math.max(R.p1,R.p2),1)} bar של הצילינדר הכבד! היחידה של הצד הקל עובדת כמנוע ומניעה את היחידה של הצד הכבד כמשאבה (הגברת לחץ).`});
        else L.push({ic:'🔥',at:'DV',h:`במחלק ספול הכניסה גבוהה מהצילינדר הכבד (${fmt(R.ps,1)} bar): עודף הלחץ של הצד הקל נשרף בספול – ${fmt(H.kW(R.ps-R.p1,R.q1),2)} kW.`});}
      if(R.mode==='up'&&R.qrb>.01&&(Math.abs(R.q1)>.01||Math.abs(R.q2)>.01))L.push({ic:'🔁',at:'DV',h:`צילינדר אחד בסוף המהלך: החלק שלו (${fmt(R.qrb,1)} L/min) יוצא דרך שסתום הסנכרון והשני משלים את המהלך.`});
      if(R.mode==='down')L.push({ic:'⬇️',at:'DV',h:`בהורדה המחלק עובד כ<b>מאחד</b> זרימה: שני הצילינדרים מוציאים ספיקות שוות (${fmt(-R.q1,1)} / ${fmt(-R.q2,1)} L/min) למרות העומסים השונים.`});}
    if(R.lk>.01)L.push({ic:'💧',w:true,at:'C2',h:`${fmt(R.lk,2)} L/min בורחים מענף 2 למיכל – צילינדר 2 מפגר ושוקע.`,c:'צילינדר 2 מאבד שמן'});
    L.push({ic:'💡',h:'מחלק גלגלי שיניים מדויק יותר בספיקות גבוהות; מחלק ספול זול ופשוט אבל מבזבז לחץ ודורש ספיקה מינימלית. שגיאה טיפוסית: 1–5%.'});return L;},
  calc(P,R){const A=R.A,d=R.p2-R.p1;const eg=.005+C7_DC*d/P.Q,es=(.004+.012*Math.tanh(d/15))*Math.sqrt(20/P.Q);
    return `<div class="kpis">${kpi('לחץ צילינדר 1',fmt(R.p1,1),'bar')}${kpi('לחץ צילינדר 2',fmt(R.p2,1),'bar')}${kpi('שגיאת חלוקה',fmt(R.erp,2),'%')}${kpi('מהירות ממוצעת',fmt(H.v(P.Q/2,A),1),'mm/s')}</div>`+
      det('לחצי העומס',row('',`A = π·${P.D}²/4 = ${V(A,'mm²')}`)+row('',`p₁ = 10·m₁·g/A = ${V(R.p1,'bar')} · p₂ = ${V(R.p2,'bar')}`),true)+
      det('ללא מחלק',row('',`השמן זורם לפי ההתנגדות: Q_i = k_l·√(p_in − p_i), k_l = ${fmt(C7_DKL,2)}`)+row('',`אם p₂ − p₁ = ${fmt(d,1)} bar > (Q/k_l)² = ${fmt((P.Q/C7_DKL)**2,1)} bar ⇒ כל הספיקה לצילינדר הקל`,d>(P.Q/C7_DKL)**2?true:undefined))+
      det('מחלק גלגלי שיניים',row('נפח לסיבוב',`Q₁ = Q₂ = n·V_g = Q/2 = ${V(P.Q/2,'L/min')}`)+row('דליפה',`Q₁ − Q₂ = e₀·Q + C·(p₂ − p₁), C = ${C7_DC} L/min/bar ⇒ e = ${fmt(eg*100,2)}%`)+row('איזון מומנטים',`(p_in − p₁)·V_g + (p_in − p₂)·V_g = 0 ⇒ p_in = (p₁ + p₂)/2 + Δp_חיכוך = ${V((R.p1+R.p2)/2+3,'bar')}`),R.typ==='gear')+
      det('מחלק ספול',row('',`שני פתחים שווים + ספול שמאזן את הלחץ אחריהם ⇒ Δp שווה ⇒ Q שווה`)+row('',`p_in = max(p₁, p₂) + Δp_פתח = ${V(Math.max(R.p1,R.p2)+6,'bar')}, e ≈ ${fmt(es*100,2)}%`),R.typ==='spool')+
      det('הפרש הגובה',row('',`Δx = (v₁ − v₂)·t = 2·e·x_ממוצע ⇒ בסוף מהלך ${C7_DS} mm: ${V(2*(R.typ==='spool'?es:R.typ==='gear'?eg:0)*C7_DS,'mm')}`)+row('כרגע',`Δx = ${V(R.dx,'mm')}`))+`<div class="note">e₀ = 0.5% סבולת ייצור. שסתומי הסנכרון (re-phasing) מכוילים ל-75% מכיול שסתום הפריקה.</div>`;},
  demo:[{t:'בלי מחלק – הסתעפות פשוטה',x:'שני צילינדרים מחוברים לאותו קו. צילינדר 1 נושא 800 kg (40 bar), צילינדר 2 – 1400 kg (70 bar). השמן הולך לדרך הקלה: צילינדר 1 עולה לבד.',reset:true,set:{type:'none'},hl:['C1','C2','G1','G2'],dur:9},
    {t:'רק אחרי הסוף',x:'רק כשצילינדר 1 מגיע לסוף המהלך הלחץ עולה ל-70 bar וצילינדר 2 מתחיל לזוז. בגרף רואים שני מהלכים נפרדים.',hl:['CH','GP'],dur:8},
    {t:'מחלק גלגלי שיניים',x:'שתי יחידות גלגלי שיניים על ציר אחד: כל סיבוב שולח אותו נפח לכל צד. שני הצילינדרים עולים יחד למרות העומסים השונים.',reset:true,set:{type:'gear'},hl:['DV','C1','C2'],dur:9},
    {t:'שגיאת חלוקה',x:'דליפה פנימית מהצד הכבד לצד הקל יוצרת שגיאה של כ-2%. ההפרש מצטבר – קו הפלס נוטה וה-Δx גדל עם המהלך.',hl:['LV','CH'],dur:8},
    {t:'הגברת לחץ',x:'מד המשאבה מראה כ-58 bar – פחות מ-70 bar של צילינדר 2. הצד הקל מניע את הצד הכבד דרך הציר המשותף.',hl:['GP','G2','DV'],dur:8},
    {t:'מחלק ספול',x:'מחלק ספול: לחץ הכניסה גבוה מהצילינדר הכבד, ועודף הלחץ של הצד הקל נשרף בספול. החלוקה דומה.',reset:true,set:{type:'spool'},hl:['DV','GP'],dur:8},
    {t:'הורדה – מאחד זרימה',x:'בהורדה המחלק מאחד: ספיקות שוות יוצאות משני הצילינדרים אל הצמצם הקבוע, והעומסים יורדים יחד.',set:{type:'gear',pos:'b',auto:false},act:(P,st)=>{st.x1=st.x2=240;},hl:['DV','TH','LV'],dur:8}],
  predict:[{q:'בלי מחלק: 800 kg על צילינדר 1, 1400 kg על צילינדר 2. מעבירים להרמה. מה יקרה?',set:{type:'none',pos:'a',auto:false},opts:['שניהם עולים יחד','צילינדר 1 עולה לבד, ואז צילינדר 2','צילינדר 2 עולה ראשון'],a:1,why:'הלחץ עולה רק עד מה שצריך לצילינדר הקל (40 bar). לצילינדר 2 צריך 70 bar – הוא יזוז רק כשצילינדר 1 ייעצר.'},
    {q:'מחלק גלגלי שיניים, 40 ו-70 bar בצילינדרים. מה יראה מד המשאבה?',set:{type:'gear',pos:'a',auto:false},opts:['יותר מ-70 bar','בערך 58 bar – פחות מהצילינדר הכבד','בדיוק 40 bar'],a:1,why:'היחידות מחוברות בציר: p_in = (p₁ + p₂)/2 + חיכוך ≈ 55 + 3. הצד הקל מניע את הכבד – הגברת לחץ.'},
    {q:'מחלק גלגלי שיניים. מעלים את ספיקת המשאבה מ-20 ל-40 L/min. מה יקרה לשגיאת החלוקה?',set:{type:'gear',pos:'a',auto:false,Q:40},opts:['תגדל','תקטן','לא תשתנה'],a:1,why:'הדליפה תלויה במפל הלחץ ולא בספיקה. אותה דליפה מתוך ספיקה גדולה יותר = אחוז שגיאה קטן יותר (כ-2.3% → כ-1.4%).'},
    {q:'מחלק גלגלי שיניים, עומסים שווים (800 kg בשניהם). מה תהיה שגיאת החלוקה?',set:{type:'gear',pos:'a',auto:false,m2:800},opts:['כ-0.5% – רק סבולת ייצור','כ-5%','0 בדיוק'],a:0,why:'בלי הפרש לחצים אין דליפה בין הצדדים; נשארת רק סבולת הייצור של היחידות (0.5% כאן).'}],
  tasks:[{q:P=>`מסה ${P.m1} kg על צילינדר Ø${P.D}. מה הלחץ הדרוש להרמה?`,a:P=>10*P.m1*G/H.A(P.D),u:'bar',hint:'p = m·g/A (×10 ל-bar).',rand:P=>{P.m1=rnd(300,2500,50);P.D=pick([40,50,63,80]);}},
    {q:P=>`מחלק גלגלי שיניים מקבל ${P.Q} L/min. בכמה mm/s יעלו צילינדרים Ø${P.D} (אידאלי)?`,a:P=>H.v(P.Q/2,H.A(P.D)),u:'mm/s',hint:'כל צד מקבל Q/2; v = Q/A.',rand:P=>{P.Q=rnd(8,60,2);P.D=pick([40,50,63,80]);}},
    {q:P=>`מחלק גלגלי שיניים: Q = ${P.Q} L/min, דליפה C = 0.012 L/min/bar, p₁ = ${fmt(10*P.m1*G/H.A(50),1)} bar, p₂ = ${fmt(10*P.m2*G/H.A(50),1)} bar. מה Q₁ (ללא סבולת ייצור)?`,a:P=>P.Q/2+.012*(10*P.m2*G/H.A(50)-10*P.m1*G/H.A(50))/2,u:'L/min',hint:'Q₁ = Q/2 + C·(p₂ − p₁)/2.',rand:P=>{P.Q=rnd(10,40,2);P.m1=rnd(300,1200,50);P.m2=rnd(1200,2500,50);}},
    {q:P=>`Q₁ = ${fmt(P.Q/2*1.02,2)} L/min, Q₂ = ${fmt(P.Q/2*.98,2)} L/min, צילינדרים Ø${P.D}. מה ההפרש בגובה אחרי 3 s?`,a:P=>H.v(P.Q*.02,H.A(P.D))*3,u:'mm',hint:'Δx = (Q₁ − Q₂)/A · t.',rand:P=>{P.Q=rnd(10,40,2);P.D=pick([40,50,63]);}},
    {q:P=>`מחלק גלגלי שיניים אידאלי, p₁ = ${fmt(10*P.m1*G/H.A(50),1)} bar, p₂ = ${fmt(10*P.m2*G/H.A(50),1)} bar. מה לחץ הכניסה (בלי חיכוך)?`,a:P=>(10*P.m1*G+10*P.m2*G)/H.A(50)/2,u:'bar',hint:'איזון מומנטים: p_in = (p₁ + p₂)/2.',rand:P=>{P.m1=rnd(300,1500,50);P.m2=rnd(800,2500,50);}}],
  faults:[{id:'wear',t:'מחלק שחוק – דליפה פנימית גדולה',sym:'"הצילינדרים עולים יחד בהתחלה, אבל בסוף המהלך הצד הכבד מפגר בכמה סנטימטרים."',hint:'השוו את שגיאת החלוקה לערך שבקטלוג (1–3%).',why:'מרווחים גדולים בין גלגלי השיניים לגוף: הדליפה מהצד הכבד לקל גדלה פי 6, והשגיאה עוברת 10%.'},
    {id:'relief',t:'שסתום סנכרון בענף 2 דולף',sym:'"צילינדר 2 תמיד מפגר, וכשעוצרים הוא שוקע לאט."',hint:'השוו את סכום Q₁ + Q₂ לספיקת המשאבה, ובדקו את גובה צילינדר 2 בעצירה.',why:'שמן מענף 2 בורח למיכל דרך שסתום הסנכרון: Q₂ קטן מ-Q₁ בהרבה יותר משגיאת המחלק, ובעצירה העומס שוקע.'},
    {id:'pump',t:'משאבה שחוקה',sym:'"ההרמה איטית יותר מבעבר, אבל שני הצילינדרים עדיין עולים יחד."',hint:'מדדו את Q₁ + Q₂ והשוו לספיקה הנומינלית.',why:'המשאבה נותנת 60% מהספיקה. המחלק מחלק נכון את מה שהוא מקבל – לכן הסנכרון תקין והמהירות נמוכה.'}],
  test(H){const P=clone(this.P);P.auto=false;const R=runSim(this,P,1).R;const A=H.A(50),p1=10*800*9.81/A,p2=10*1400*9.81/A,e=.005+.012*(p2-p1)/20;
    const P2=clone(this.P);P2.auto=false;P2.type='none';const R2=runSim(this,P2,.5).R;
    return [['p = m·g/A',R.p1,p1],['גלגלי שיניים: Q₁ + Q₂ = Q',R.q1+R.q2,20],['Q₁ − Q₂ = e·Q',R.q1-R.q2,e*20],['p_in = (p₁+p₂)/2 + 3',R.ps,(p1+p2)/2+3],['v₁ = Q₁/A',H.v(R.q1,A),H.v(10*(1+e),A)],
      ['ללא מחלק: הכול לקל',R2.q1,20,.02],['ללא מחלק: p_in = p₁ + (Q/k_l)²',R2.ps,p1+(20/C7_DKL)**2],['UI Δx',R.read[5].v,R.dx]];}};

const SIMS_7C=[C7_SIM_CBV,C7_SIM_THR,C7_SIM_PCFCV,C7_SIM_DIV];

LABS.push({ch:7,title:'שסתומים',sims:[...(typeof SIMS_7A!=='undefined'?SIMS_7A:[]),...(typeof SIMS_7B!=='undefined'?SIMS_7B:[]),...(typeof SIMS_7C!=='undefined'?SIMS_7C:[])]});
}
