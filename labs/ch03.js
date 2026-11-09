/* lab 3 – same code as the website */
{




/* ===================== Chapter 3 – the hydraulic fluid (sims 7, 8) ===================== */

/* ---------- shared fluid helpers ---------- */
const FL={VG:[22,32,46,68,100,150],N100:{22:4.3,32:5.4,46:6.8,68:8.6,100:11.1,150:14.5},
  /* Walther (ASTM D341): log log(ν+0.7) = A − B·log T, fitted through ν40 = VG and ν100 (VI ≈ 100) */
  wal(vg){const L=Math.log10,t1=L(313.15),t2=L(373.15),y1=L(L(vg+.7)),y2=L(L(FL.N100[vg]+.7));const B=(y1-y2)/(t2-t1);return {A:y1+B*t1,B};},
  nu(vg,T){const {A,B}=FL.wal(vg);return 10**(10**(A-B*Math.log10(T+273.15)))-.7;},   // cSt
  K:1.6e9,      // bulk modulus of mineral oil [Pa]
  RHO:870};

/* ---------- 7 · viscosity and temperature ---------- */
/* quasi-static actuator solver with LAMINAR/TURBULENT hose losses (H.pipe) and viscosity-dependent pump leakage */
function visSolve(o){ // o:{Qth,pr,ov,Ain,Aout,F,L,d,nu,cL}  → {v,ps,pIn,pOut,dpIn,dpOut,Qleak,Qr,Qin,Qout}
  const leak=p=>Math.min(o.Qth,o.cL*Math.max(p,0)*46/o.nu);
  const st=v=>{const Qin=H.Q(v,o.Ain),Qout=H.Q(v,o.Aout);const dpOut=H.pipe(Qout,o.d,o.L,o.nu).dp;const dpIn=H.pipe(Qin,o.d,o.L,o.nu).dp;
    const pOut=dpOut;const pIn=(10*o.F+pOut*o.Aout)/o.Ain;const ps=pIn+dpIn;return {v,Qin,Qout,dpIn,dpOut,pOut,pIn,ps};};
  const qeff=ps=>o.Qth-leak(ps)-H.reliefQ(ps,o.pr,o.ov,o.Qth);
  const s0=st(0);let r;
  if(o.F>=1e8||qeff(Math.min(s0.ps,o.pr))<=0||s0.ps>=o.pr){const ps=H.bisect(p=>o.Qth-leak(p)-H.reliefQ(p,o.pr,o.ov,o.Qth),0,o.pr+o.ov*1.3);r={...s0,v:0,ps,stall:true};}
  else{const vmax=H.v(o.Qth,o.Ain);const v=H.bisect(v=>{const s=st(v);return s.Qin-qeff(s.ps);},0,vmax);r={...st(v),stall:false};}
  r.Qleak=leak(r.ps);r.Qr=H.reliefQ(r.ps,o.pr,o.ov,o.Qth);r.eta=1-r.Qleak/o.Qth;return r;}
function visCycle(P,nu,cL,pr){const A1=H.A(P.D),A2=H.Aann(P.D,Math.min(P.dr,P.D-2));const base={Qth:P.Q,pr,ov:Math.max(3,.06*pr),L:P.L*1000,d:P.dh,nu,cL};
  const e=visSolve({...base,Ain:A1,Aout:A2,F:P.F}),b=visSolve({...base,Ain:A2,Aout:A1,F:P.Fr});
  const t=(e.v>0.05?P.S/e.v:999)+(b.v>0.05?P.S/b.v:999)+2*P.dw;return {e,b,t:Math.min(t,999),A1,A2};}
const SIM_VISC={id:'visc',n:7,t:'צמיגות וטמפרטורה',d:'זמן מחזור בבוקר קר מול אחרי חימום; מפלי לחץ ודליפות פנימיות',
  P:{VG:46,T:40,Tmode:'fixed',Tamb:5,Q:20,pr:120,D:50,dr:28,S:250,F:15000,Fr:500,L:6,dh:8,dw:.6,pos:'a',auto:true},
  key:P=>'0',
  ui(U,P){U.grp('שמן');U.sel(P,'VG','דרגת צמיגות',FL.VG.map(v=>[v,'ISO VG '+v]));U.seg(P,'Tmode','טמפרטורה',[['fixed','קבועה','טמפרטורה קבועה שבוחרים'],['warm','חימום','מתחילים קר והשמן מתחמם מההפסדים']],true);
    if(P.Tmode==='fixed')U.num(P,'T','טמפרטורת שמן','°C',{min:-20,max:110,step:1});else U.num(P,'Tamb','טמפרטורת התחלה','°C',{min:-20,max:40,step:1});
    U.grp('משאבה וצילינדר');U.num(P,'Q','ספיקה תאורטית','L/min',{min:2,max:120,step:1});U.num(P,'pr','כיול שסתום פריקה','bar',{min:20,max:350,step:5});U.num(P,'D','קוטר בוכנה','mm',{min:25,max:200,step:5});U.num(P,'F','עומס ביציאה','N',{min:0,max:200000,step:500});
    U.grp('צנרת',false);U.num(P,'L','אורך צינור (כל קו)','m',{min:.5,max:30,step:.5});U.num(P,'dh','קוטר פנימי','mm',{min:4,max:40,step:1});U.num(P,'dr','קוטר מוט בוכנה','mm',{min:10,max:140,step:2});U.num(P,'S','מהלך','mm',{min:50,max:1000,step:10});},
  onChange(P,st){if(st.mode!==P.Tmode){st.mode=P.Tmode;if(P.Tmode==='warm')st.Tm=P.Tamb;}},
  circuit(P){return {comps:[{id:'C1',type:'cyl',x:300,y:60,o:{load:{t:'F'}},name:'צילינדר דו-פעולה',lbl:'צילינדר',lblAt:[-82,-22],l3:[0,-34]},
      {id:'V1',type:'dcv',x:300,y:190,o:{box:KIT.D43.closed,L:'lever',center:true},name:'שסתום פיקוד 4/3 (לחיצה מחליפה מצב)',lbl:'4/3',lblAt:[82,4]},
      {id:'P1',type:'pump',x:200,y:310,name:'משאבה קבועה – דליפה פנימית תלויה בצמיגות',lbl:'משאבה',lblAt:[34,6]},{id:'T1',type:'tank',x:200,y:356,name:'מיכל שמן'},
      {id:'RV',type:'pv',x:150,y:260,rot:-90,o:{kind:'relief'},name:'שסתום פריקה',lbl:'פריקה',lblAt:[0,-30]},{id:'T2',type:'tank',x:110,y:272,name:'מיכל'},{id:'T3',type:'tank',x:390,y:256,name:'מיכל'},
      {id:'G1',type:'gauge',x:250,y:240,net:'P',name:'מד לחץ משאבה',valAt:[-14,-8]},{id:'G2',type:'gauge',x:225,y:96,net:'A2',name:'מד לחץ בכניסה לצילינדר',valAt:[-14,-4]},
      {id:'CH',type:'chart',x:560,y:150,o:{w:170,h:110,xl:'T [°C]',yl:'t [s]',t:'זמן מחזור מול טמפרטורת השמן'},name:'גרף חי: זמן מחזור מול טמפרטורה'}],
    lines:[{id:'LS',net:'S',pts:['T1.t','P1.in']},{id:'LP',net:'P',pts:['P1.out',[200,260],[293,260],'V1.P'],tag:{at:[246,282],t:R=>`${fmt(R.Qeff,1)} L/min`}},{id:'LR',net:'P',pts:[[200,260],'RV.P']},{id:'LRT',net:'T',pts:['RV.T',[110,260],'T2.t']},{id:'LG1',net:'P',pts:[[250,260],'G1.p']},
      {id:'LA',net:'A',pts:['V1.A',[293,140],[250,140]],tag:{at:[196,150],t:R=>`Δp ${fmt(R.dpA,1)} bar · Re ${fmt(R.Re,0)}`}},{id:'LA2',net:'A2',pts:[[250,140],[250,110],'C1.A']},{id:'LG2',net:'A2',pts:[[250,110],[225,110],'G2.p']},
      {id:'LB',net:'B',pts:['V1.B',[307,140],[350,140],'C1.B']},{id:'LT',net:'T',pts:['V1.T',[307,232],[390,232],'T3.t']}]};},
  init:P=>({x:0,si:KIT.idx[P.pos],Tm:P.Tamb,mode:P.Tmode,tt:0}),
  click(id,P){if(id==='V1'){P.pos=P.pos==='a'?'0':P.pos==='0'?'b':'a';P.auto=false;return true;}},
  step(P,st,dt,ctx){const f=ctx.fault;const vg=f==='vg'?150:P.VG;const cL=(f==='wear'?4:1)*.05*P.Q/100;
    if(P.Tmode==='fixed')st.Tm=P.T;else if(st.Tm==null)st.Tm=P.Tamb;const T=st.Tm;const nu=FL.nu(vg,T);
    const A1=H.A(P.D),A2=H.Aann(P.D,Math.min(P.dr,P.D-2));const dir=KIT.dirOf(P.pos);const atEnd=(dir>0&&st.x>=P.S-1e-6)||(dir<0&&st.x<=1e-6);
    const base={Qth:P.Q,pr:P.pr,ov:Math.max(3,.06*P.pr),L:P.L*1000,d:P.dh,nu,cL};
    const r=dir>0?visSolve({...base,Ain:A1,Aout:A2,F:atEnd?1e9:P.F}):dir<0?visSolve({...base,Ain:A2,Aout:A1,F:atEnd?1e9:P.Fr}):visSolve({...base,Ain:A1,Aout:A2,F:1e9});
    st.x=clamp(st.x+dir*r.v*dt,0,P.S);KIT.autoCycle(P,st,dt,atEnd&&dir!==0,P.dw);KIT.ease(st,'si',KIT.idx[P.pos],dt);KIT.rpmAng(st,dt,1450);
    // heat balance (accelerated ×200): losses = relief + leakage + hose friction; cooler ∝ (T − 20°C)
    const Ploss=H.kW(Math.max(r.ps,0),r.Qr+r.Qleak)+H.kW(Math.abs(r.dpIn),r.Qin)+H.kW(Math.abs(r.dpOut),r.Qout);
    const hc=(f==='cooler'?.15:1)*.05;if(P.Tmode==='warm'){st.Tm+=(Ploss-hc*(T-20))/78*dt*200;st.Tm=clamp(st.Tm,-20,140);}
    const pS=-(H.pipe(P.Q,25,600,nu).dp+(nu>200?.05*nu/200:.02));      // suction: 0.6 m Ø25 + strainer
    let pA=0,pB=0,pA2=0,qA=0,qB=0,qT=0;
    if(dir>0){pA=r.stall?r.ps:r.pIn+r.dpIn;pA2=r.stall?r.ps:r.pIn;pB=r.pOut;qA=r.Qin;qB=-r.Qout;qT=r.Qout;}
    else if(dir<0){pB=r.stall?r.ps:r.pIn+r.dpIn;pA=r.pOut;pA2=r.pOut;qB=r.Qin;qA=-r.Qout;qT=r.Qout;}
    const pm=KIT.nice(P.pr*1.05);const cyc=visCycle(P,nu,cL,P.pr);
    // live curve: cycle time across −10…100 °C (recomputed when inputs change)
    const key=[vg,cL,P.Q,P.pr,P.D,P.dr,P.S,P.F,P.L,P.dh].join();if(st.ck!==key){st.ck=key;st.curve=[];for(let t=-10;t<=100;t+=5)st.curve.push([t,visCycle(P,FL.nu(vg,t),cL,P.pr).t]);}
    const ymin=Math.min(...st.curve.map(c=>c[1]));const ymax=KIT.nice(Math.min(Math.max(...st.curve.map(c=>c[1])),ymin*2.5));
    const Qline=Math.abs(qA)||H.Q(cyc.e.v,A1);const pipe=H.pipe(Qline,P.dh,P.L*1000,nu);
    return {p:{P:r.stall&&dir===0?r.ps:(dir?(r.stall?r.ps:r.ps):r.ps),A:pA,A2:pA2,B:pB,T:Math.min(1,qT/P.Q),S:pS},q:{LS:P.Q,LP:dir?r.Qin:0,LR:r.Qr,LRT:r.Qr,LA:qA,LA2:qA,LB:qB,LT:qT},pmax:pm,qref:P.Q,vac:pS<-.3,
      T,nu,vg,r,dir,cyc,Ploss,pS,Qeff:P.Q-r.Qleak-r.Qr,dpA:Math.abs(dir>0?r.dpIn:dir<0?r.dpOut:pipe.dp),Re:pipe.Re,lam:pipe.lam,A1,A2,
      c:{C1:{x:st.x/P.S,uA:pA2/pm,uB:pB/pm,lt:`${fmt(P.F/1000,1)} kN`},V1:{i:st.si},P1:{on:true,ang:st.ang},RV:{open:clamp(r.Qr/P.Q,0,1)},
        CH:{s:[{p:st.curve,c:'#0b72d9'}],m:[clamp(T,-10,100),Math.min(cyc.t,ymax)],x:[-10,100],y:[0,ymax]}},
      read:[{k:'טמפרטורת שמן',v:T,u:'°C',max:100,w:T>80||T<5},{k:'צמיגות ν',v:nu,u:'cSt',dg:0,w:nu>400||nu<10},{k:'ריינולדס בקו A',v:pipe.Re,u:'',dg:0},{k:'מפל לחץ בצינור A',v:Math.abs(dir>0?r.dpIn:pipe.dp),u:'bar'},
        {k:'נצילות נפחית',v:r.eta*100,u:'%',max:100,w:r.eta<.85},{k:'מהירות יציאה',v:cyc.e.v,u:'mm/s',max:H.v(P.Q,A1)},{k:'זמן מחזור',v:cyc.t,u:'s',dg:2},{k:'לחץ יניקה',v:pS,u:'bar',w:pS<-.3}]};},
  ins(P,R){const L=[];const nu=R.nu;
    L.push({ic:'🌡️',h:`שמן ISO VG ${R.vg} בטמפרטורה ${fmt(R.T,0)} °C: צמיגות <b>${fmt(nu,0)} cSt</b>. (בטמפרטורה 40 °C היא ${R.vg} cSt.)`});
    if(nu>300)L.push({ic:'🧊',w:true,at:'C1',h:`שמן קר וסמיך: מפל הלחץ בצינורות גדל (${fmt(R.dpA,1)} bar בקו A), והמחזור לוקח ${fmt(R.cyc.t,1)} s.`,c:`שמן סמיך – ${fmt(R.dpA,1)} bar הולכים בצינור`});
    if(R.pS<-.3)L.push({ic:'🫧',w:true,at:'P1',h:`לחץ היניקה ${fmt(R.pS,2)} bar – סכנת קוויטציה. בבוקר קר מפעילים בלחץ נמוך עד שהשמן מתחמם.`,c:'יניקה בתת-לחץ – סכנת קוויטציה'});
    if(nu<15)L.push({ic:'💧',w:R.r.eta<.85,at:'P1',h:`שמן חם ודליל: הדליפה הפנימית במשאבה גדלה – נצילות נפחית ${fmt(R.r.eta*100,0)}%, ונשארים רק ${fmt(R.Qeff,1)} L/min.`,c:`דליפה פנימית – η = ${fmt(R.r.eta*100,0)}%`});
    L.push({ic:'📈',at:'CH',h:`הגרף מראה צורת U: בקור – מפלי לחץ (זרימה ${R.lam?'למינרית':'טורבולנטית'}, Re = ${fmt(R.Re,0)}); בחום – דליפות. תחום העבודה המומלץ: כ-16 עד 36 cSt.`});
    if(P.Tmode==='warm')L.push({ic:'🔥',h:`ההפסדים מחממים את השמן (${fmt(R.Ploss,2)} kW). הזמן בחימום מואץ פי 200.`});return L;},
  calc(P,R){const nu=R.nu,Q=H.Q(R.cyc.e.v,R.A1),d=P.dh/1000,A=PI*d*d/4,v=Q/60000/A,mu=FL.RHO*nu*1e-6;const pp=H.pipe(Q,P.dh,P.L*1000,nu);
    return `<div class="kpis">${kpi('צמיגות',fmt(nu,1),'cSt')}${kpi('Re בקו A',fmt(pp.Re,0),'',pp.lam?'למינרי':'טורבולנטי')}${kpi('נצילות נפחית',fmt(R.cyc.e.eta*100,1),'%')}${kpi('זמן מחזור',fmt(R.cyc.t,2),'s')}</div>`+
    det('צמיגות לפי טמפרטורה (Walther / ASTM D341)',row('',`log log(ν+0.7) = A − B·log T`)+row('נקודות כיול',`ν₄₀ = ${R.vg} cSt · ν₁₀₀ = ${FL.N100[R.vg]} cSt`)+row(`ב-${fmt(R.T,0)} °C`,`ν = ${V(nu,'cSt')}`),true)+
    det('ריינולדס ומפל לחץ בצינור',row('מהירות',`v = Q/A = ${V(v,'m/s')}`)+row('',`Re = ${fr('v·d','ν')} = ${fr(fmt(v,3)+'·'+fmt(d,4),fmt(nu*1e-6,8))} = ${V(pp.Re,'')}`)+
      (pp.lam?row('למינרי (Hagen–Poiseuille)',`Δp = ${fr('128·μ·L·Q','π·d⁴')} = ${V(128*mu*P.L*(Q/60000)/(PI*d**4)/1e5,'bar')}`):row('טורבולנטי (Blasius)',`f = 0.316·Re^−0.25 = ${V(pp.f,'')} → Δp = f·(L/d)·ρv²/2 = ${V(pp.dp,'bar')}`)),true)+
    det('דליפה פנימית במשאבה',row('',`Q_leak = c·p·${fr('46','ν')} = ${V(R.cyc.e.Qleak,'L/min')} ב-${fmt(R.cyc.e.ps,1)} bar`)+row('',`η_v = 1 − Q_leak/Q_th = ${V(R.cyc.e.eta*100,'%')}`))+
    det('זמן מחזור',row('יציאה',`v = ${V(R.cyc.e.v,'mm/s')} → t = ${V(P.S/Math.max(R.cyc.e.v,.05),'s')}`)+row('חזרה',`v = ${V(R.cyc.b.v,'mm/s')} → t = ${V(P.S/Math.max(R.cyc.b.v,.05),'s')}`)+row('כולל השהיות',`t = ${V(R.cyc.t,'s')}`))+
    `<div class="note">מודל לימודי: הדליפה במשאבה ∝ p/ν (כוילה ל-5% בלחץ 100 bar ובצמיגות 46 cSt). מפל הלחץ בצינור לפי Darcy (למינרי 64/Re, טורבולנטי Blasius).</div>`;},
  demo:[{t:'אותו מעגל, שמן אחר',x:'המעגל קבוע: משאבה, שסתום פיקוד, צינורות באורך 6 מ\' וצילינדר עם עומס של 15 kN. משנים רק את טמפרטורת השמן ורואים כמה הכול משתנה.',reset:true,hl:['P1','C1']},
    {t:'40 °C – תחום העבודה',x:'בטמפרטורה 40 °C לשמן VG46 יש 46 cSt. מפל הלחץ בצינור קטן, הדליפה במשאבה קטנה – והמחזור מהיר.',set:{T:40},hl:['CH']},
    {t:'בוקר קר: 0 °C',x:'הצמיגות קופצת לכ-<b>580 cSt</b>. מפל הלחץ בצינורות גדל פי 12, המשאבה מגיעה ללחץ שסתום הפריקה – וחלק מהספיקה בורח דרכו.',set:{T:0},hl:['G1','G2','RV'],dur:9},
    {t:'יניקה בקור',x:'גם קו היניקה סובל: הלחץ בכניסה למשאבה יורד אל מתחת ל-0.3- bar – וזו סכנת קוויטציה. לכן מחממים או מפעילים בלחץ נמוך.',set:{T:-10},hl:['P1']},
    {t:'שמן חם: 90 °C',x:'עכשיו הצמיגות רק כ-9 cSt. מפלי הלחץ זניחים, אבל הדליפה הפנימית במשאבה גדלה – והנצילות הנפחית יורדת.',set:{T:90},hl:['P1'],dur:9},
    {t:'חימום אמיתי',x:'במצב <b>חימום</b> מתחילים ב-5 °C וההפסדים (שסתום פריקה, דליפות, צנרת) מחממים את השמן. עקבו אחרי הנקודה בגרף.',set:{Tmode:'warm',Tamb:5},act:(P,st)=>{st.Tm=5;},hl:['CH'],dur:12}],
  predict:[{q:'השמן (VG46) קר: טמפרטורה 0 °C במקום 40 °C. מה יקרה לזמן המחזור?',set:{T:0},opts:['יתקצר','כמעט לא ישתנה','יתארך משמעותית'],a:2,why:'הצמיגות גדלה פי 12: מפלי לחץ בצנרת גדלים, הלחץ במשאבה מגיע לשסתום הפריקה וחלק מהספיקה בורח.'},
    {q:'מחממים מ-40 °C ל-90 °C. מה יקרה למהירות הצילינדר?',set:{T:90},opts:['תגדל מעט כי השמן זורם בקלות','תקטן מעט בגלל דליפה פנימית','לא תשתנה בכלל'],a:1,why:'מפלי הלחץ היו קטנים כבר ב-40 °C, אבל הדליפה במשאבה ∝ 1/ν גדלה – פחות ספיקה מגיעה לצילינדר.'},
    {q:'ב-40 °C מחליפים VG46 ב-VG100 (הזרימה למינרית). מפל הלחץ בצינור יהיה בערך –',set:{T:40,VG:100},opts:['כמו קודם','פי 2.2','פי 4.7'],a:1,why:'בזרימה למינרית Δp ∝ ν: ‏100/46 ≈ 2.2.'}],
  tasks:[{q:P=>`ספיקה ${P.Q} L/min בצינור Ø${P.dh} מ"מ, ν = ${fmt(FL.nu(P.VG,P.T),1)} cSt. מה מספר ריינולדס?`,a:P=>H.pipe(P.Q,P.dh,1000,FL.nu(P.VG,P.T)).Re,u:'',tol:.03,hint:'Re = v·d/ν, עם v = Q/A ב-m/s ו-ν ב-m²/s (1 cSt = 10⁻⁶ m²/s).',rand:P=>{P.Q=rnd(5,60,1);P.dh=pick([8,10,12,16]);P.T=rnd(0,80,5);}},
    {q:P=>`זרימה למינרית: Q = ${P.Q} L/min, צינור Ø${P.dh} מ"מ באורך ${P.L} m, ν = ${fmt(FL.nu(P.VG,P.T),1)} cSt, ρ = 870 kg/m³. מה מפל הלחץ (bar)?`,a:P=>{const nu=FL.nu(P.VG,P.T),d=P.dh/1000;return 128*FL.RHO*nu*1e-6*P.L*(P.Q/60000)/(PI*d**4)/1e5;},u:'bar',hint:'Δp = 128·μ·L·Q/(π·d⁴), μ = ρ·ν.',rand:P=>{P.Q=rnd(5,30,1);P.dh=pick([10,12,16]);P.L=rnd(2,10,1);P.T=rnd(0,40,5);}},
    {q:P=>`משאבה ${P.Q} L/min דולפת ${fmt(P.Q*.05*120/100*46/FL.nu(P.VG,P.T),2)} L/min בלחץ 120 bar. מה הנצילות הנפחית (%)?`,a:P=>100*(1-.05*120/100*46/FL.nu(P.VG,P.T)),u:'%',hint:'η_v = (Q_th − Q_leak)/Q_th.',rand:P=>{P.T=rnd(30,90,5);P.Q=rnd(10,60,5);}}],
  faults:[{id:'vg',t:'מילאו שמן סמיך מדי (VG150 במקום VG46)',sym:'"בבוקר המכונה איטית מאוד והמשאבה רועשת. אחרי שהיא מתחממת – כמעט תקין."',hint:'השוו את הצמיגות שבמדידות לזו שאמורה להיות לשמן שבלוח באותה טמפרטורה.',why:'בפועל יש בטנק VG150: ב-5 °C הצמיגות פי 3 מהצפוי – מפלי לחץ, יניקה בתת-לחץ וזמן מחזור ארוך.',set:{T:5}},
    {id:'wear',t:'משאבה שחוקה',sym:'"בבוקר הכול בסדר, אבל אחרי שעה של עבודה הצילינדר זוחל."',hint:'הסתכלו על הנצילות הנפחית כשהשמן חם.',why:'מרווחים גדולים במשאבה: הדליפה פי 4, והיא גדלה עוד כשהשמן דליל – בחום הנצילות צונחת.',set:{T:75}},
    {id:'cooler',t:'מקרר שמן לא עובד',sym:'"השמן מתחמם יותר ויותר במשך המשמרת, והמכונה מאטה."',hint:'הפעילו מצב חימום וצפו לאן מגיעה הטמפרטורה.',why:'המקרר מפנה רק 15% מהחום: הטמפרטורה עולה מעל 90 °C, הצמיגות צונחת והדליפות גדלות.',set:{Tmode:'warm',Tamb:20}}],
  qaT:8,
  test(H){const P=clone(this.P);P.auto=false;const {R}=runSim(this,P,1.5);const nu=FL.nu(46,40);const Q=H.Q(R.cyc.e.v,R.A1);const d=.008,mu=870*nu*1e-6;
    const hp=128*mu*6*(Q/60000)/(PI*d**4)/1e5;const e=R.cyc.e;
    return [['ν(40°C) = VG',nu,46,.002],['ν(100°C) = ν₁₀₀',FL.nu(46,100),6.8,.002],['Hagen–Poiseuille = H.pipe',H.pipe(Q,8,6000,nu).dp,hp,.01],
      ['רציפות: Q_eff = v·A₁',H.Q(e.v,R.A1),P.Q-e.Qleak-e.Qr,.01],['איזון כוחות',e.pIn*R.A1,10*P.F+e.pOut*R.A2,.01],['UI ν',R.read[1].v,R.nu],['UI זמן מחזור',R.read[6].v,R.cyc.t]];}};

/* ---------- 8 · water hammer (method of characteristics) ---------- */
const WH_N=24,WH_SEG=12;
function whParams(P,f){const D=P.d/1000,A=PI*D*D/4,rho=FL.RHO;const wall=P.wall==='hose'?1.5e-9:D/(2.1e11*0.002);
  const air=(f==='air'?1:P.air)/100;const pabs=(P.p0+1)*1e5;const iK=1/FL.K+wall+air/(1.4*pabs);const a=Math.sqrt(1/iK/rho);
  const L=P.L,dx=L/WH_N,nu=46e-6,Rl=128*rho*nu*dx/(PI*D**4)*P.damp;const B=rho*a/A;const Q0=P.Q/60000;return {D,A,a,L,dx,Rl,B,Q0,rho,v0:Q0/A,dJ:B*Q0/1e5,T2:2*L/a};}
function whInit(P,f){const w=whParams(P,f);const p=[],Q=[];const p0=P.p0*1e5;for(let i=0;i<=WH_N;i++){p.push(p0-w.Rl*w.Q0*i);Q.push(w.Q0);}
  const Kv=w.Q0/Math.sqrt(Math.max(p[WH_N],1e3));return {w,p,Q,Kv,t:0,acc:0,ph:'open',pt:0,tau:1,peak:P.p0,hist:[],cross:[],per:0,last:p[WH_N],tcl:0};}
function whStep(P,s,dtSim,f){const w=s.w,N=WH_N,B=w.B,R=w.Rl,p0=P.p0*1e5;const dtm=w.dx/w.a;s.acc+=dtSim;let n=0;
  const tc=(f==='fastvalve'?3:P.tc)/1000;const rvOn=P.rv;const prv=(f==='rvstuck'?1e9:P.prv*1e5);const Qn=w.Q0*1.2;
  while(s.acc>=dtm&&n<4000){s.acc-=dtm;n++;s.t+=dtm;
    if(s.ph==='closing'){s.tcl+=dtm;s.tau=Math.max(0,1-s.tcl/Math.max(tc,1e-6));if(s.tau<=0){s.ph='closed';}}
    const pn=s.p.slice(),Qn2=s.Q.slice();
    for(let i=1;i<N;i++){const Cp=s.p[i-1]+B*s.Q[i-1]-R*s.Q[i-1],Cm=s.p[i+1]-B*s.Q[i+1]+R*s.Q[i+1];Qn2[i]=(Cp-Cm)/(2*B);pn[i]=(Cp+Cm)/2;}
    {const Cm=s.p[1]-B*s.Q[1]+R*s.Q[1];pn[0]=p0;Qn2[0]=(p0-Cm)/B;}
    {const Cp=s.p[N-1]+B*s.Q[N-1]-R*s.Q[N-1];const out=p=>s.Kv*s.tau*Math.sqrt(Math.max(p,0))+(rvOn?Math.max(0,(p-prv)/(.06*prv+3e5))*Qn:0);
      let pv;if(Cp<=0){pv=Math.max(Cp,-.95e5);}else{pv=H.bisect(p=>p-Cp+B*out(p),0,Cp,50);}Qn2[N]=pv>0?out(pv):0;pn[N]=Math.max(pv,-.95e5);s.qrv=rvOn&&pv>prv?(pv-prv)/(.06*prv+3e5)*Qn:0;}
    s.p=pn;s.Q=Qn2;const pv=s.p[N]/1e5;if(s.ph!=='open'){s.peak=Math.max(s.peak,pv);if(s.last<P.p0&&pv>=P.p0&&s.tcl>tc)s.cross.push(s.t);if(s.cross.length>=2)s.per=s.cross.at(-1)-s.cross.at(-2);
      if(s.hist.length<900&&(s.hist.length===0||s.t-s.t0-s.hist.at(-1)[0]/1000>=dtm*.99))s.hist.push([(s.t-s.t0)*1000,pv]);}
    s.last=pv;}}
const SIM_HAMMER={id:'hammer',n:8,t:'מכת מים',d:'גל לחץ שרץ בצינור ושיא הלחץ במד; דחיסות השמן',
  P:{p0:80,Q:60,L:20,d:16,wall:'steel',air:0,tc:5,rv:false,prv:130,damp:1.5,auto:true},
  key:P=>P.rv?'rv':'0',
  ui(U,P){U.grp('שסתום');U.num(P,'tc','זמן סגירה','ms',{min:1,max:1000,step:1});U.chk(P,'auto','סגירה ופתיחה במחזור');U.btn('▶ סגור עכשיו',()=>{APP.st&&(APP.st.req=true);});
    U.grp('צינור וזרימה');U.num(P,'p0','לחץ אספקה','bar',{min:10,max:300,step:5});U.num(P,'Q','ספיקה','L/min',{min:5,max:300,step:5});U.num(P,'L','אורך צינור','m',{min:2,max:200,step:1});U.num(P,'d','קוטר פנימי','mm',{min:6,max:50,step:1});
    U.seg(P,'wall','דופן',[['steel','פלדה'],['hose','צינור גמיש']],true);U.num(P,'air','אוויר מעורב','%',{min:0,max:3,step:.1});
    U.grp('הגנה',false);U.chk(P,'rv','שסתום פריקה ליד השסתום',true);U.num(P,'prv','כיול שסתום הפריקה','bar',{min:20,max:400,step:5});},
  onChange(P,st){st.reinit=true;},
  circuit(P){const x0=170,x1=500,y=210;const seg=[];const sx=k=>x0+(x1-x0)*k/WH_SEG;
    for(let k=0;k<WH_SEG;k++)seg.push({id:'H'+k,net:'h'+k,pts:[[sx(k),y],[sx(k+1),y]],nodot:true});
    seg[0].tag={at:[200,236],t:R=>`${fmt(R.p.h0,0)} bar`};seg[WH_SEG-1].tag={at:[478,236],t:R=>`${fmt(R.p['h'+(WH_SEG-1)],0)} bar`};seg[6].tag={at:[335,236],t:R=>`L = ${fmt(R.L,0)} m · a = ${fmt(R.a,0)} m/s`};
    const comps=[{id:'P1',type:'pump',x:90,y:330,name:'משאבה',lbl:'משאבה',lblAt:[-46,26]},{id:'T1',type:'tank',x:90,y:376,name:'מיכל'},
      {id:'RV',type:'pv',x:50,y:280,rot:-90,o:{kind:'relief'},name:'שסתום פריקה של המשאבה',lbl:'פריקה',lblAt:[0,-30]},{id:'T2',type:'tank',x:14,y:292,name:'מיכל'},
      {id:'AC',type:'accum',x:130,y:258,name:'מצבר לחץ גדול – שומר לחץ אספקה קבוע',lbl:'מצבר',lblAt:[24,-6]},
      {id:'G1',type:'gauge',x:150,y:176,net:'h0',name:'מד לחץ בתחילת הצינור',valAt:[-14,-4]},
      {id:'G2',type:'gauge',x:500,y:176,net:'hv',name:'מד לחץ ליד השסתום (עם מחוג שיא ▲)',valAt:[-14,-4],val:R=>`${fmt(R.pv,0)} bar ▲${fmt(R.peak,0)}`},
      {id:'SV',type:'sv',x:540,y:210,rot:90,name:'שסתום סגירה מהיר (לחיצה סוגרת)',lbl:'שסתום',lblAt:[0,-24]},{id:'T3',type:'tank',x:585,y:236,name:'מיכל'},
      {id:'CH',type:'chart',x:345,y:92,o:{w:280,h:100,xl:'t [ms]',yl:'p [bar]',t:'לחץ ליד השסתום מרגע הסגירה'},name:'גרף חי: לחץ ליד השסתום מול זמן'}];
    const lines=[{id:'LS',net:'S',pts:['T1.t','P1.in']},{id:'LP',net:'h0',pts:['P1.out',[90,280],[90,210],[x0,210]]},{id:'LR',net:'h0',pts:[[90,280],'RV.P']},{id:'LRT',net:'T',pts:['RV.T',[14,280],'T2.t']},{id:'LAC',net:'h0',pts:[[130,280],'AC.p']},
      {id:'LG1',net:'h0',pts:[[150,210],'G1.p']},...seg,{id:'LV',net:'hv',pts:[[x1,y],'SV.in']},{id:'LG2',net:'hv',pts:[[x1,y],'G2.p'],nodot:true},{id:'LO',net:'T',pts:['SV.out',[585,210],'T3.t']}];
    if(P.rv){comps.push({id:'RV2',type:'pv',x:460,y:278,rot:0,o:{kind:'relief'},name:'שסתום פריקה מהיר ליד השסתום',lbl:'פריקה 2',lblAt:[40,6]},{id:'T4',type:'tank',x:460,y:244,name:'מיכל'});
      lines.push({id:'LRV',net:'hv',pts:[[490,210],[490,312],[460,312],'RV2.P']},{id:'LRV2',net:'T',pts:['RV2.T','T4.t']});}
    return {comps,lines};},
  init(P){return Object.assign(whInit(P,null),{cyc:0,t0:0});},
  click(id,P,st){if(id==='SV'){st.req=true;return true;}},
  step(P,st,dt,ctx){const f=ctx.fault;if(st.reinit||st.f!==f){Object.assign(st,whInit(P,f),{cyc:0,t0:0,reinit:false,f});}const w=st.w;
    // slow motion: one pressure round trip 4L/a ≈ 2.4 s on screen
    const slow=4*w.L/w.a/2.4;st.cyc+=dt;
    if(st.ph==='open'&&((P.auto&&st.cyc>1.2)||st.req)){st.req=false;st.ph='closing';st.tcl=0;st.t0=st.t;st.peak=P.p0;st.hist=[];st.cross=[];st.per=0;st.cyc=0;}
    else if(st.ph!=='open'&&P.auto&&st.cyc>Math.max(6,(P.tc/1000)/slow+4)){Object.assign(st,whInit(P,f),{cyc:0,t0:0,f});}
    else if(st.req&&st.ph!=='open'){st.req=false;Object.assign(st,whInit(P,f),{cyc:0,t0:0,f});}
    if(dt>0)whStep(P,st,dt*slow,f);
    const pr={};for(let k=0;k<WH_SEG;k++){const i0=Math.floor(k*WH_N/WH_SEG),i1=Math.floor((k+1)*WH_N/WH_SEG);let s=0;for(let i=i0;i<=i1;i++)s+=st.p[i];pr['h'+k]=s/(i1-i0+1)/1e5;}
    const pv=st.p[WH_N]/1e5;pr.hv=pv;pr.h0=P.p0;pr.S=-.05;pr.T=.5;
    const qs={};for(let k=0;k<WH_SEG;k++){const i=Math.round((k+.5)*WH_N/WH_SEG);qs['H'+k]=st.Q[i]*60000;}
    const qv=st.Q[WH_N]*60000;const dJ=w.dJ;const tcS=(f==='fastvalve'?3:P.tc)/1000;const est=tcS<=w.T2?dJ:2*FL.RHO*w.L*w.v0/tcS/1e5;
    const pm=KIT.nice(Math.max(P.p0+dJ*1.05,P.p0*1.6));const xr=Math.max(4*w.L/w.a*1000*2.2,tcS*1000*1.4);
    return {p:pr,q:Object.assign(qs,{LS:P.Q,LP:P.Q,LV:qv,LO:Math.max(qv,0),LRV:st.qrv*60000||0,LRV2:st.qrv*60000||0,LG2:0}),pmax:pm,qref:P.Q,vac:pv<0,pv,peak:st.peak,dJ,est,a:w.a,L:w.L,T2:w.T2,v0:w.v0,per:st.per,ph:st.ph,slow,
      c:{SV:{closed:st.ph!=='open'},P1:{on:true,ang:KIT.rpmAng(st,dt,1450)},AC:{fill:.6,u:P.p0/pm},RV:{open:0},RV2:{open:clamp((st.qrv||0)/(w.Q0*.5),0,1)},G2:{p:pv},
        CH:{s:[{p:st.hist,c:'#dc2626'},{p:[[0,P.p0+dJ],[xr,P.p0+dJ]],c:'#7e22ce',d:true},{p:[[0,P.p0],[xr,P.p0]],c:'#64748b',d:true}],x:[0,xr],y:[Math.min(0,...st.hist.map(h=>h[1])),pm]}},
      read:[{k:'לחץ ליד השסתום',v:pv,u:'bar'},{k:'שיא לחץ ▲',v:st.peak,u:'bar',w:st.peak>P.p0*1.5},{k:'קפיצת ז\'וקובסקי',v:dJ,u:'bar'},{k:'מהירות גל a',v:w.a,u:'m/s',dg:0},
        {k:'זמן קריטי <bdi dir=ltr>2L/a</bdi>',v:w.T2*1000,u:'ms'},{k:'מחזור גל נמדד',v:st.per*1000,u:'ms'},{k:'מהירות שמן v₀',v:w.v0,u:'m/s'}]};},
  ins(P,R){const L=[];const rise=R.peak-P.p0;
    if(R.ph==='open')L.push({ic:'➡️',h:`השמן זורם ב-<b>${fmt(R.v0,2)} m/s</b>. כשהשסתום ייסגר, עמוד השמן ייעצר וייווצר גל לחץ שנע במהירות הקול בשמן: <b>${fmt(R.a,0)} m/s</b>.`});
    else L.push({ic:'🌊',at:'G2',h:`גל הלחץ רץ מהשסתום אל מצבר הלחץ וחוזר כל <b>${fmt(4*R.L/R.a*1000,1)} ms</b> (4L/a). ההדמיה מואטת כ-×${fmt(1/R.slow,0)}.`});
    if(P.tc/1000<=R.T2)L.push({ic:'⚡',w:rise>P.p0*.5,at:'SV',h:`סגירה מהירה: ${fmt(P.tc,0)} ms < 2L/a = ${fmt(R.T2*1000,1)} ms – מקבלים את מלוא מכת ז'וקובסקי: Δp = ρ·a·v = <b>${fmt(R.dJ,0)} bar</b>.`,c:`סגירה מהירה – קפיצה של ${fmt(R.dJ,0)} bar`});
    else L.push({ic:'🐢',at:'SV',h:`סגירה איטית (${fmt(P.tc,0)} ms > ${fmt(R.T2*1000,1)} ms): הגל החוזר מקזז חלק מהלחץ. הערכה: Δp ≈ 2ρLv/t_c = ${fmt(R.est,0)} bar.`});
    if(P.wall==='hose')L.push({ic:'🧵',h:'הצינור הגמיש מתרחב: מהירות הגל יורדת ואיתה שיא הלחץ.'});
    if(P.air>0)L.push({ic:'🫧',h:`${fmt(P.air,1)}% אוויר מוריד את מודול הדחיסות האפקטיבי – הגל איטי והמערכת "ספוגית".`});
    if(P.rv&&R.peak>P.prv*1.02)L.push({ic:'⚠️',w:true,at:'RV2',h:`השיא (${fmt(R.peak,0)} bar) עבר את כיול שסתום הפריקה ליד השסתום – בדקו אותו.`,c:'שסתום הפריקה לא קוטם את השיא'});
    else if(P.rv)L.push({ic:'🛡️',at:'RV2',h:`שסתום פריקה ליד השסתום קוטם את השיא ב-${fmt(P.prv,0)} bar.`});return L;},
  calc(P,R){const D=P.d/1000,A=PI*D*D/4;return `<div class="kpis">${kpi('מהירות גל a',fmt(R.a,0),'m/s')}${kpi('Δp ז\'וקובסקי',fmt(R.dJ,1),'bar')}${kpi('זמן קריטי 2L/a',fmt(R.T2*1000,2),'ms')}${kpi('שיא נמדד',fmt(R.peak,1),'bar')}</div>`+
    det('מהירות הגל',row('מודול דחיסות אפקטיבי',`${fr('1','K_e')} = ${fr('1','K')} + ${fr('D','E·e')} + ${fr('α','1.4·p')}`)+row('',`a = ${sq('K_e/ρ')} = ${V(R.a,'m/s')}`),true)+
    det('מכת ז\'וקובסקי (סגירה מהירה)',row('מהירות השמן',`v₀ = Q/A = ${fmt(P.Q,0)}/60000 ÷ ${fmt(A,6)} = ${V(R.v0,'m/s')}`)+row('',`Δp = ρ·a·v₀ = 870·${fmt(R.a,0)}·${fmt(R.v0,3)} = ${V(R.dJ,'bar')}`)+row('שיא צפוי',`p = p₀ + Δp = ${V(P.p0+R.dJ,'bar')}`),true)+
    det('סגירה איטית',row('זמן קריטי',`T = 2L/a = ${V(R.T2*1000,'ms')}`)+row('אם t_c > T (Michaud)',`Δp ≈ ${fr('2·ρ·L·v₀','t_c')} = ${V(2*FL.RHO*P.L*R.v0/(P.tc/1000)/1e5,'bar')}`))+
    `<div class="note">פתרון בשיטת הקווים האופייניים (MOC) על ${WH_N} מקטעים, עם חיכוך למינרי מוגבר פי ${P.damp} כדי לדמות דעיכה. הלחץ ליד השסתום יכול לרדת לתת-לחץ אחרי ההחזרה הראשונה.</div>`;},
  demo:[{t:'עמוד שמן בתנועה',x:'מצבר לחץ גדול מחזיק לחץ קבוע בתחילת צינור פלדה באורך 20 מ\'. השמן זורם דרך שסתום פתוח למיכל.',reset:true,set:{auto:false},hl:['AC','SV']},
    {t:'סוגרים בבת אחת',x:'השסתום נסגר תוך 5 ms. השמן שליד השסתום נעצר והלחץ קופץ ב-<b>ρ·a·v</b> – גל אדום מתחיל לרוץ אחורה בצינור.',act:(P,st)=>{st.req=true;},hl:['SV','G2'],dur:9},
    {t:'הגל חוזר',x:'כשהגל מגיע למצבר לחץ הוא מתהפך וחוזר כגל של לחץ נמוך. כל מחזור לוקח 4L/a – רואים את זה בגרף.',hl:['CH'],dur:9},
    {t:'סגירה איטית',x:'אותו מעגל, אבל השסתום נסגר ב-200 ms – הרבה יותר מ-2L/a. הגל החוזר מספיק לבטל את רוב העלייה.',set:{tc:200,auto:true},hl:['CH','SV'],dur:10},
    {t:'צינור גמיש',x:'החלפת קטע פלדה בצינור גמיש מורידה את מהירות הגל, ולכן גם את Δp = ρ·a·v.',set:{tc:5,wall:'hose'},hl:['G2'],dur:9},
    {t:'שסתום פריקה ליד השסתום',x:'שסתום פריקה מהיר ליד המקום שנסגר קוטם את השיא בכיול שלו.',set:{wall:'steel',rv:true,prv:110},hl:['RV2','G2'],dur:9}],
  predict:[{q:'השסתום נסגר תוך 5 ms (2L/a ≈ 30 ms). מה יראה מחוג השיא?',set:{auto:false,tc:5},go:(P,st)=>{st.req=true;},dur:5,opts:['כמעט אין שינוי','קפיצה של כ-ρ·a·v מעל לחץ האספקה','לחץ כפול מלחץ האספקה בדיוק'],a:1,why:'כשהסגירה מהירה מ-2L/a, השמן ליד השסתום נעצר לפני שהגל חוזר: Δp = ρ·a·v₀.'},
    {q:'מכפילים את אורך הצינור (20 → 40 m), הסגירה עדיין 5 ms. השיא –',set:{auto:false,tc:5,L:40},go:(P,st)=>{st.req=true;},dur:6,opts:['יוכפל','יישאר כמעט אותו דבר','ייחצה'],a:1,why:'במכת ז\'וקובסקי השיא לא תלוי באורך: Δp = ρ·a·v. האורך משנה רק את זמן המחזור.'},
    {q:'מכפילים את הספיקה (60 → 120 L/min). מה יקרה לקפיצת הלחץ?',set:{auto:false,tc:5,Q:120},go:(P,st)=>{st.req=true;},dur:5,opts:['תוכפל','תגדל פי 4','לא תשתנה'],a:0,why:'Δp ∝ v₀: מהירות כפולה – קפיצה כפולה.'},
    {q:'סגירה ב-300 ms במקום 5 ms. השיא יהיה –',set:{auto:false,tc:300},go:(P,st)=>{st.req=true;},dur:6,opts:['כמו קודם','נמוך בהרבה','גבוה יותר'],a:1,why:'כש-t_c ≫ 2L/a הגלים החוזרים מקזזים את העלייה: Δp ≈ 2ρLv/t_c.'}],
  tasks:[{q:P=>`ספיקה ${P.Q} L/min בצינור Ø${P.d} מ"מ, a = ${fmt(whParams(P).a,0)} m/s, ρ = 870. מה קפיצת הלחץ בסגירה מהירה (bar)?`,a:P=>whParams(P).dJ,u:'bar',hint:'Δp = ρ·a·v₀, v₀ = Q/A. 1 bar = 10⁵ Pa.',rand:P=>{P.Q=rnd(20,200,10);P.d=pick([10,12,16,20,25]);}},
    {q:()=>`מודול הדחיסות של שמן 1.6·10⁹ Pa ו-ρ = 870 kg/m³. מה מהירות הקול בשמן (צינור קשיח)?`,a:()=>Math.sqrt(1.6e9/870),u:'m/s',hint:'a = √(K/ρ).'},
    {q:P=>`צינור ${P.L} m, a = ${fmt(whParams(P).a,0)} m/s. מה הזמן הקריטי 2L/a (ms)?`,a:P=>whParams(P).T2*1000,u:'ms',hint:'הזמן שלוקח לגל להגיע לקצה ולחזור.',rand:P=>{P.L=rnd(5,100,5);}},
    {q:P=>`סגירה איטית: L = ${P.L} m, v₀ = ${fmt(whParams(P).v0,2)} m/s, t_c = ${P.tc} ms. הערכת Δp (bar)?`,a:P=>2*870*P.L*whParams(P).v0/(P.tc/1000)/1e5,u:'bar',hint:'Δp ≈ 2·ρ·L·v₀/t_c (נוסחת Michaud).',rand:P=>{P.L=rnd(10,60,5);P.tc=rnd(100,500,50);P.Q=rnd(30,120,10);}}],
  faults:[{id:'fastvalve',t:'הותקן שסתום סולנואיד מהיר במקום שסתום עם סגירה מרוסנת',sym:'"קבענו סגירה איטית, אבל המד ליד השסתום קופץ ונשמעת דפיקה בצנרת."',hint:'השוו את השיא הנמדד להערכה לסגירה איטית ולמכת ז\'וקובסקי.',why:'השסתום נסגר תוך 3 ms ללא קשר לכיוון – מתקבלת מכת ז\'וקובסקי המלאה.',set:{tc:200}},
    {id:'rvstuck',t:'שסתום הפריקה ליד השסתום תקוע סגור',sym:'"למרות שסתום הפריקה, צינורות נסדקים ליד השסתום."',hint:'השוו את השיא לכיול שסתום הפריקה.',why:'שסתום הפריקה לא נפתח: השיא עובר את הכיול שלו.',set:{rv:true,prv:110,tc:5}},
    {id:'air',t:'אוויר בשמן',sym:'"המערכת ספוגית, הדפיקות עמומות ואיטיות, ומשהו מקציף במיכל."',hint:'מדדו את מחזור הגל והשוו ל-4L/a של שמן נקי.',why:'אוויר (1%) מוריד את מודול הדחיסות: מהירות הגל נמוכה בהרבה, השיא קטן והמחזור ארוך.',set:{tc:5}}],
  qaT:7,
  test(H){const P=clone(this.P);P.auto=false;const st=this.init(P);st.req=true;let R;for(let t=0;t<6;t+=.01)R=this.step(P,st,.01,{});
    const w=whParams(P);return [['a = √(K_e/ρ)',w.a,Math.sqrt(1/(1/1.6e9+.016/(2.1e11*.002))/870),.001],['ז\'וקובסקי ρav',w.dJ,870*w.a*(60/60000)/(PI*.016**2/4)/1e5,.001],
      ['שיא MOC ≈ p₀ + ρav',R.peak-P.p0,w.dJ,.08],['מחזור 4L/a',R.per,4*w.L/w.a,.04],['UI שיא',R.read[1].v,R.peak]];}};

LABS.push({ch:3,title:'הנוזל ההידראולי',sims:[SIM_VISC,SIM_HAMMER]});
}
