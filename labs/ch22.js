/* lab 22 – same code as the website */
{




/* ===================== Chapter 22 – proportional and servo hydraulics: proportional valve + amplifier (58), closed-loop position control (59) ===================== */
function c22Circuit(P,servo){const comps=[{id:'C1',type:'cyl',x:330,y:30,o:{load:{t:servo?'m':'F'}},name:'צילינדר דו-פעולה עם עומס',lbl:'צילינדר',lblAt:[-80,-22],l3:[0,-34]},
    {id:'V1',type:'dcv',x:330,y:150,o:{box:KIT.D43.closed,L:'sol',R:'sol',center:true},name:servo?'שסתום סרוו/פרופורציונלי 4/3 – מרכז קריטי':'שסתום פרופורציונלי 4/3 – הספול (מגופה) נע ביחס לזרם',lbl:servo?'סרוו':'פרופורציונלי',lblAt:[0,34]},
    {id:'AMP',type:'box',x:150,y:150,o:{w:62,h:30,t:servo?'בקר P':'מגבר'},name:servo?'בקר: u = Kp·(x_יעד − x_נמדד)':'כרטיס מגבר: רמפה, פיצוי שטח מת, זרם לסולנואידים'},
    {id:'P1',type:'pump',x:230,y:300,name:'משאבה + שסתום פריקה (לחץ אספקה קבוע)',lbl:'משאבה',lblAt:[32,6]},{id:'T1',type:'tank',x:230,y:345,name:'מיכל'},
    {id:'RV',type:'pv',x:170,y:250,rot:-90,o:{kind:'relief'},name:'שסתום פריקה – קובע את לחץ האספקה',lbl:'פריקה',lblAt:[0,-30]},{id:'T2',type:'tank',x:130,y:280,name:'מיכל'},{id:'T3',type:'tank',x:410,y:240,name:'מיכל'},
    {id:'G2',type:'gauge',x:258,y:78,net:'A',name:'מד לחץ A',valAt:[-16,-2]},{id:'G3',type:'gauge',x:402,y:78,net:'B',name:'מד לחץ B'},
    {id:'CH1',type:'chart',x:640,y:40,o:{w:150,h:80,t:servo?'מיקום: יעד (מקווקו) ובפועל':'פקודה (כחול) ומיקום הספול (אדום)',xl:'t [s]',yl:servo?'mm':'%'},name:'גרף לאורך זמן'},
    {id:'CH2',type:'chart',x:640,y:190,o:{w:150,h:80,t:servo?'שגיאה מוגדלת (1.5 s אחרונות)':'אופיין ספיקה–פקודה',xl:servo?'t [s]':'u [V]',yl:servo?'mm':'L/min'},name:servo?'השגיאה יעד − מיקום, בהגדלה – כאן רואים רטט':'הספיקה כפונקציה של הפקודה, בעומס הנוכחי'}];
  const lines=[{id:'LS',net:'S',pts:['T1.t','P1.in']},{id:'LP',net:'P',pts:['P1.out',[230,230],[323,230],'V1.P'],tag:{at:[276,252],t:'q'}},{id:'LRV',net:'P',pts:[[230,230],[170,230],'RV.P']},{id:'LRT',net:'T',pts:['RV.T',[130,250],'T2.t']},
    {id:'LA',net:'A',pts:['V1.A',[323,110],[280,110],'C1.A']},{id:'LB',net:'B',pts:['V1.B',[337,110],[380,110],'C1.B']},{id:'LT',net:'T',pts:['V1.T',[337,205],[410,205],'T3.t']},
    {id:'LE1',net:'E',kind:'drain',pts:[[181,150],[275,150]]}];
  if(servo){comps.push({id:'XS',type:'box',x:330,y:-20,o:{w:70,h:16,t:'חיישן מיקום'},name:'חיישן מיקום ליניארי – משוב לבקר'});lines.push({id:'LE2',net:'E',kind:'drain',pts:[[295,-20],[150,-20],[150,135]]});}
  return {comps,lines};}
const c22Hist=(st,t,vals,n=160)=>{if(!st.ht||t-st.ht>.04){st.ht=t;st.hist.push([t,...vals]);if(st.hist.length>n)st.hist.shift();}};

/* ---------- 58 · proportional valve with amplifier: ramp, deadband, load-dependent flow ---------- */
const C22_PROP={id:'prop',n:58,t:'שסתום פרופורציונלי ומגבר',d:'הפקודה מזיזה את הספול באופן רציף; רמפה, שטח מת ותלות הספיקה בעומס',
  P:{u:6,ramp:.6,db:15,comp:false,Qn:10,pr:120,F:10,D:50,d:28,S:400,auto:true},
  ui(U,P){U.grp('פקודה ומגבר');U.num(P,'u','פקודה u','V',{min:-10,max:10,step:.5});U.num(P,'ramp','זמן רמפה (0→100%)','s',{min:0,max:5,step:.1});U.num(P,'db','שטח מת','%',{min:0,max:40,step:1});U.chk(P,'comp','פיצוי שטח מת במגבר');
    U.grp('שסתום ועומס');U.num(P,'Qn','ספיקה נומינלית Q_n','L/min',{min:2,max:100,step:1});U.num(P,'pr','לחץ אספקה','bar',{min:20,max:300,step:5});U.num(P,'F','עומס ביציאה','kN',{min:0,max:100,step:1});
    U.grp('הפעלה',false);U.chk(P,'auto','פקודה אוטומטית (+u / 0 / −u)');},
  circuit:P=>c22Circuit(P,false),
  init:P=>({uc:0,y:0,x:P.S*.3,t:0,hist:[],ph:0}),
  step(P,st,dt,ctx){const f=ctx.fault;const A1=H.A(P.D),A2=H.Aann(P.D,P.d);const db=(f==='db'?40:P.db)/100;const tau=.03;const Qp=P.Qn*3.5;
    st.t+=dt;let u=P.u;if(P.auto){const ph=Math.floor(st.t/3)%4;u=[Math.abs(P.u),0,-Math.abs(P.u),0][ph];if((ph===0&&st.x>=P.S-1)||(ph===2&&st.x<=1))u=0;}
    const rate=P.ramp>0?10/P.ramp:1e9;st.uc+=clamp(u-st.uc,-rate*dt,rate*dt);
    let out=P.comp?(Math.abs(st.uc)>.2?Math.sign(st.uc)*(db+(1-db)*Math.abs(st.uc)/10):0):st.uc/10;if(f==='offset')out+=.25*(db>0?1:1);if(f==='coilB'&&out<0)out=0;
    st.y+=(clamp(out,-1,1)-st.y)*Math.min(1,dt/tau);const open=Math.sign(st.y)*Math.max(Math.abs(st.y)-db,0)/(1-db);
    const pL=open>=0?P.F*1e4/A1:500*10/A2;const dpv=Math.max(P.pr-pL-2,0);let Q=P.Qn*Math.abs(open)*Math.sqrt(dpv/10);Q=Math.min(Q,Qp);
    const atEnd=(open>0&&st.x>=P.S-1e-6)||(open<0&&st.x<=1e-6);if(atEnd||dpv<=0)Q=0;const v=Math.sign(open)*H.v(Q,open>=0?A1:A2);st.x=clamp(st.x+v*dt,0,P.S);
    c22Hist(st,st.t,[st.uc*10,st.y*100]);
    const curve=[];for(let i=0;i<=40;i++){const uu=-10+i/2;const o=P.comp?(Math.abs(uu)>.2?Math.sign(uu)*(db+(1-db)*Math.abs(uu)/10):0):uu/10;const op=Math.sign(o)*Math.max(Math.abs(o)-db,0)/(1-db);const pl=op>=0?P.F*1e4/A1:500*10/A2;curve.push([uu,Math.sign(op)*Math.min(P.Qn*Math.abs(op)*Math.sqrt(Math.max(P.pr-pl-2,0)/10),Qp)]);}
    const pm=KIT.nice(P.pr*1.05);const t0=st.hist.length?st.hist[0][0]:0;const qm=KIT.nice(Math.max(...curve.map(c=>Math.abs(c[1])),1)*1.1);
    const pA=open>0?pL:open<0?2:P.F*1e4/A1*.5,pB=open<0?pL:open>0?2:.5;
    return {p:{P:P.pr,A:pA,B:pB,T:.3,S:-.05,E:0},q:{LS:Qp,LP:Q,LRV:Qp-Q,LRT:Qp-Q,LA:open>0?Q:-H.Q(Math.abs(v),A1)*(open<0?1:0),LB:open<0?Q:-H.Q(Math.abs(v),A2)*(open>0?1:0),LT:H.Q(Math.abs(v),open>0?A2:A1)},pmax:pm,qref:Qp,
      Q,v,open,y:st.y,uc:st.uc,db,pL,
      c:{C1:{x:st.x/P.S,uA:pA/pm,uB:pB/pm,lt:`${fmt(P.F,0)} kN`},V1:{i:1-st.y},P1:{on:true,ang:KIT.rpmAng(st,dt,1450)},RV:{open:clamp((Qp-Q)/Qp,0,1)},
        CH1:{x:[t0,Math.max(t0+6,st.t)],y:[-100,100],s:[{p:st.hist.map(h=>[h[0],h[1]]),c:'#2563eb'},{p:st.hist.map(h=>[h[0],h[2]]),c:'#dc2626'},{p:[[t0,db*100],[t0+1e3,db*100]],c:'#f59e0b',d:true},{p:[[t0,-db*100],[t0+1e3,-db*100]],c:'#f59e0b',d:true}]},
        CH2:{x:[-10,10],y:[-qm,qm],s:[{p:curve,c:'#0b72d9'},{p:[[-10,0],[10,0]],c:'#94a3b8',d:true}],m:[st.uc,Math.sign(open)*Q]}},
      read:[{k:'פקודה (אחרי רמפה)',v:st.uc,u:'V',dg:1},{k:'מיקום הספול',v:st.y*100,u:'%',dg:0},{k:'פתיחה אפקטיבית',v:open*100,u:'%',dg:0},{k:'ספיקה לצילינדר',v:Q,u:'L/min',max:Qp},{k:'מהירות הבוכנה',v:v,u:'mm/s'},{k:'מפל לחץ בשסתום',v:dpv,u:'bar'}]};},
  ins(P,R){const L=[];L.push({ic:'🎚️',h:`הפקודה ${fmt(R.uc,1)} V מזיזה את הספול ל-${fmt(R.y*100,0)}% – <b>הספיקה רציפה</b>, לא רק פתוח/סגור.`,at:'V1'});
    if(Math.abs(R.y)>0&&Math.abs(R.y)<=R.db)L.push({ic:'🕳️',w:true,at:'V1',h:`הספול זז אבל עדיין בתוך השטח המת (${fmt(R.db*100,0)}%) – אין ספיקה. פיצוי שטח מת במגבר "קופץ" מעליו.`,c:'בתוך השטח המת – אין ספיקה'});
    if(P.ramp>0)L.push({ic:'📈',h:`רמפה של ${fmt(P.ramp,1)} s: הפקודה עולה בהדרגה – התנעה ועצירה רכות, בלי מכות.`});
    L.push({ic:'⚖️',h:`Q = Q_n·פתיחה·√(Δp/10). עם עומס ${fmt(P.F,0)} kN נשארים לשסתום ${fmt(Math.max(P.pr-R.pL-2,0),0)} bar – ככל שהעומס גדל, אותה פקודה נותנת פחות ספיקה.`});
    if(P.F*1e4/H.A(P.D)>P.pr-5)L.push({ic:'🛑',w:true,at:'C1',h:'העומס דורש כמעט את כל לחץ האספקה – אין מפל לחץ על השסתום ואין תנועה.'});return L;},
  calc(P,R){const A1=H.A(P.D);const pL=P.F*1e4/A1;return `<div class="kpis">${kpi('ספיקה',fmt(R.Q,1),'L/min')}${kpi('מהירות',fmt(R.v,0),'mm/s')}${kpi('Δp בשסתום',fmt(Math.max(P.pr-pL-2,0),0),'bar')}${kpi('פתיחה אפקטיבית',fmt(R.open*100,0),'%')}</div>`+
    det('שטח מת',row('',`פתיחה = (|y| − d)/(1 − d) = (${fmt(Math.abs(R.y),2)} − ${fmt(R.db,2)})/(1 − ${fmt(R.db,2)}) = ${V(Math.max(Math.abs(R.y)-R.db,0)/(1-R.db),'',3)}`),true)+
    det('ספיקה תלוית עומס',row('',`Q = Q_n·פתיחה·√(Δp/Δp_n) , Δp = p_s − p_L − p_T`)+row('',`p_L = F/A₁ = ${V(pL,'bar')} ; Δp = ${P.pr} − ${fmt(pL,1)} − 2 = ${V(Math.max(P.pr-pL-2,0),'bar')}`)+row('',`Q = ${P.Qn}·${fmt(Math.abs(R.open),3)}·√(${fmt(Math.max(P.pr-pL-2,0),1)}/10) = ${V(R.Q,'L/min')}`),true)+
    det('רמפה',row('',`קצב = 10 V / ${P.ramp} s = ${V(P.ramp>0?10/P.ramp:0,'V/s')}`))+`<div class="note">Q_n נמדד ב-Δp = 10 bar על כל השסתום (5 bar לכל שפה). זמן התגובה של הספול: 30 ms.</div>`;},
  demo:[{t:'שסתום פרופורציונלי',x:'בשסתום רגיל הספול קופץ לקצה. כאן <b>זרם הסולנואיד קובע את מיקום הספול</b> – וכך את הספיקה ואת המהירות.',reset:true,set:{auto:false,u:0},hl:['V1','AMP']},
    {t:'פקודה חלקית',x:'u = 4 V: הספול זז 40% והצילינדר נע לאט. מגדילים את הפקודה – הוא מאיץ.',set:{u:4},hl:['V1','C1','CH2'],dur:6},
    {t:'רמפה',x:'המגבר מעלה את הפקודה בהדרגה (קו כחול בגרף): התנעה ועצירה רכות.',set:{auto:true,u:8,ramp:1},hl:['AMP','CH1'],dur:9},
    {t:'שטח מת',x:'הספול חופף את הפתחים ב-15% הראשונים – אין ספיקה עד שהוא יוצא מהחפיפה. רואים "מדרגה" באופיין.',set:{ramp:.3},hl:['CH2'],dur:6},
    {t:'פיצוי שטח מת',x:'המגבר קופץ ישר לקצה החפיפה – האופיין רציף מאפס.',set:{comp:true},hl:['AMP','CH2'],dur:6},
    {t:'השפעת העומס',x:'עומס של 40 kN: נשאר פחות מפל לחץ על השסתום, ואותה פקודה נותנת פחות ספיקה – האופיין נמוך יותר.',set:{F:40},hl:['CH2','C1'],dur:7}],
  predict:[{q:'u = 1 V עם שטח מת של 15% ובלי פיצוי. מה יקרה?',set:{auto:false,u:1,comp:false},opts:['הצילינדר יזוז לאט','הצילינדר לא יזוז','הצילינדר יזוז מהר'],a:1,dur:3,why:'1 V = 10% מהלך ספול – עדיין בתוך החפיפה של 15%. אין ספיקה.'},
    {q:'מעלים את העומס מ-10 ל-50 kN באותה פקודה. מהירות היציאה:',set:{auto:false,u:6,F:50},opts:['תעלה','תרד','לא תשתנה'],a:1,dur:4,why:'בשסתום פרופורציונלי ללא פיצוי לחץ Q ∝ √Δp. עומס גבוה = Δp קטן = פחות ספיקה.'}],
  tasks:[{q:P=>`Q_n = ${P.Qn} L/min (ב-10 bar), פתיחה 50%, Δp = 40 bar. מה הספיקה?`,a:P=>P.Qn*.5*Math.sqrt(4),u:'L/min',hint:'Q = Q_n·פתיחה·√(Δp/10).',rand:P=>{P.Qn=pick([5,10,20,40]);}},
    {q:P=>`שטח מת ${P.db}%, הספול ב-50%. מה הפתיחה האפקטיבית? (%)`,a:P=>(50-P.db)/(100-P.db)*100,u:'%',hint:'(|y| − d)/(1 − d).',rand:P=>{P.db=pick([5,10,15,20,25]);}},
    {q:P=>`לחץ אספקה ${P.pr} bar, עומס ${P.F} kN על Ø${P.D}, p_T = 2 bar. מה Δp על השסתום?`,a:P=>P.pr-P.F*1e4/H.A(P.D)-2,u:'bar',hint:'Δp = p_s − F/A₁ − p_T.',rand:P=>{P.pr=rnd(80,200,10);P.F=rnd(5,30,1);P.D=pick([50,63,80]);}}],
  faults:[{id:'offset',t:'היסט אפס במגבר',sym:'"בפקודה 0 הצילינדר זוחל לאט ליציאה."',hint:'שימו פקודה 0 וצפו במיקום הספול.',why:'המגבר מוציא 25% גם בפקודה 0 – הספול יוצא מהחפיפה. מכיילים את האפס בכרטיס.',set:{auto:false,u:0}},
    {id:'coilB',t:'סולנואיד b מנותק',sym:'"היציאה עובדת רגיל, אבל בפקודה שלילית הצילינדר לא חוזר."',hint:'מה מיקום הספול בפקודה שלילית?',why:'אין זרם לסולנואיד b – הספול לא זז לצד השלילי.'},
    {id:'db',t:'שטח מת גדול (ספול שגוי / פרמטר)',sym:'"צריך פקודה גדולה מאוד עד שהצילינדר מתחיל לזוז, ואז הוא קופץ."',hint:'הסתכלו על האופיין: מאיזו פקודה מתחילה ספיקה?',why:'שטח מת של 40% – רק פקודות מעל 4 V נותנות ספיקה. בודקים סוג ספול ופרמטר פיצוי.'}],
  test(H){const P=clone(this.P);P.auto=false;P.u=6;P.ramp=0;const {R}=runSim(this,P,.3);const A1=H.A(50);const pL=10000*10/A1;const op=(.6-.15)/.85;const Qe=10*op*Math.sqrt((120-pL-2)/10);
    const P2=clone(this.P);P2.auto=false;P2.u=1;const R2=runSim(this,P2,.5).R;
    return [['Q = Q_n·פתיחה·√(Δp/10)',R.Q,Qe,.01],['v = Q/A₁',R.v,H.v(Qe,A1),.01],['בתוך השטח המת אין ספיקה',R2.Q,0,.001],['UI ספיקה',R.read[3].v,R.Q]];}};

/* ---------- 59 · closed-loop position control (P controller) with hydraulic stiffness ---------- */
const BETA_AIR=700,C_VISC=.4,C_LEAK=.003;
const C22_SERVO={id:'servo',n:59,t:'בקרת מיקום בלולאה סגורה',d:'הגבר הבקר מול מסה ונוקשות השמן: תגובה איטית, מדויקת – או תנודות',
  P:{Kp:.3,m:200,xt:250,ps:100,Qn:20,F:0,D:50,d:28,S:400,auto:true},
  ui(U,P){U.grp('בקר');U.num(P,'Kp','הגבר Kp','V/mm',{min:.01,max:5,step:.01});U.num(P,'xt','מיקום יעד','mm',{min:0,max:400,step:5});U.chk(P,'auto','צעדים אוטומטיים בין 100 ל-300 mm');
    U.grp('מערכת');U.num(P,'m','מסה נעה','kg',{min:10,max:5000,step:10});U.num(P,'F','כוח חיצוני','kN',{min:-20,max:20,step:1});U.num(P,'ps','לחץ אספקה','bar',{min:20,max:300,step:5});U.num(P,'Qn','ספיקה נומינלית','L/min',{min:2,max:100,step:1});},
  circuit:P=>c22Circuit(P,true),
  init:P=>({x:150,x0:150,v:0,pA:30,pB:40,y:0,t:0,hist:[],xt:P.xt,peak:null,stp:0}),
  step(P,st,dt,ctx){const f=ctx.fault;const A1=H.A(P.D),A2=H.Aann(P.D,P.d);const beta=f==='air'?BETA_AIR:14000;const tau=.012;const kv=P.Qn/Math.sqrt(5);const V0=.15;const c=C_VISC;const Cl=C_LEAK;
    st.t+=dt;if(P.auto){const ph=Math.floor(st.t/4)%2;const tg=ph?300:100;if(tg!==st.xt){st.xt=tg;st.stp=st.t;st.x0=st.x;st.peak=null;}}else if(st.xt!==P.xt){st.xt=P.xt;st.stp=st.t;st.x0=st.x;st.peak=null;}
    const n=Math.ceil(dt/5e-5);const h=n?dt/n:0;let u=0;
    for(let i=0;i<n;i++){const xm=f==='sensor'?st.x*1.0+12:st.x;u=clamp(P.Kp*(st.xt-xm),-10,10);let target=u/10;if(f==='sticky'&&Math.abs(target-st.y)<.06)target=st.y;st.y+=(target-st.y)*h/tau;
      const y=st.y;let QA,QB;if(y>=0){QA=kv*y*Math.sqrt(Math.max(P.ps-st.pA,0));QB=-kv*y*Math.sqrt(Math.max(st.pB,0));}else{QA=-kv*(-y)*Math.sqrt(Math.max(st.pA,0));QB=kv*(-y)*Math.sqrt(Math.max(P.ps-st.pB,0));}
      QA+=Cl*(P.ps/2-st.pA);QB+=Cl*(P.ps/2-st.pB);
      const VA=V0+A1*st.x/1e6,VB=V0+A2*(P.S-st.x)/1e6;st.pA+=beta/VA*(QA/60-A1*st.v*1e-6)*h;st.pB+=beta/VB*(QB/60+A2*st.v*1e-6)*h;st.pA=clamp(st.pA,-.9,P.ps*3);st.pB=clamp(st.pB,-.9,P.ps*3);
      const Fn=(st.pA*A1-st.pB*A2)/10-P.F*1000-c*st.v;st.v+=Fn/P.m*1000*h;st.x+=st.v*h;if(st.x<0){st.x=0;st.v=Math.max(st.v,0);}if(st.x>P.S){st.x=P.S;st.v=Math.min(st.v,0);}
      st.wt=(st.wt||0)+h;st.wmn=Math.min(st.wmn??1e9,st.x);st.wmx=Math.max(st.wmx??-1e9,st.x);if(st.wt>.5){st.amp=st.t-st.stp>1?(st.wmx-st.wmn)/2:0;st.wt=0;st.wmn=1e9;st.wmx=-1e9;}
      st.et=(st.et||0)+h;if(st.et>=.004){st.et=0;(st.eh=st.eh||[]).push([st.t-dt+i*h,st.xt-st.x]);if(st.eh.length>375)st.eh.shift();}}
    st.u=u;const dir=Math.sign(st.xt-(st.x0??st.x));const over=(st.x-st.xt)*dir;if(st.t-st.stp>.05)st.peak=Math.max(st.peak??-1e9,over);
    c22Hist(st,st.t,[st.x,st.xt,st.u],200);const t0=st.hist.length?st.hist[0][0]:0,t1=Math.max(t0+8,st.t);
    const kh=1.4e9*(beta/14000)*((A1*1e-6)**2/((V0+A1*st.x/1e6)*1e-3)+(A2*1e-6)**2/((V0+A2*(P.S-st.x)/1e6)*1e-3));const wh=Math.sqrt(kh/P.m);
    const qv=kv*Math.sqrt(P.ps/2)/10;const Kv=P.Kp*1000*qv/60*1e-3/(A1*1e-6);
    const pm=KIT.nice(P.ps*1.1);const step=Math.abs(st.xt-(st.x0??st.xt))||1;
    return {p:{P:P.ps,A:st.pA,B:st.pB,T:.3,S:-.05,E:0},q:{LS:P.Qn*3,LP:Math.abs(st.v)*A1*60/1e6,LA:H.Q(st.v,A1),LB:-H.Q(st.v,A2),LT:Math.abs(H.Q(st.v,st.v>0?A2:A1))},pmax:pm,qref:P.Qn*2,
      x:st.x,xt:st.xt,u:st.u,wh,Kv,amp:st.amp||0,over:st.peak!=null?Math.max(st.peak,0)/step*100:0,err:st.xt-st.x,
      c:{C1:{x:st.x/P.S,uA:st.pA/pm,uB:st.pB/pm,lt:`${fmt(P.m,0)} kg`},V1:{i:1-st.y},P1:{on:true,ang:KIT.rpmAng(st,dt,1450)},RV:{open:.5},
        CH1:{x:[t0,t1],y:[0,P.S],s:[{p:st.hist.map(h=>[h[0],h[2]]),c:'#94a3b8',d:true},{p:st.hist.map(h=>[h[0],h[1]]),c:'#2563eb'}]},CH2:(()=>{const E=st.eh||[];const e0=E.length?E[0][0]:0,e1=Math.max(e0+1.5,E.length?E.at(-1)[0]:1.5);const tl=E.length?E.at(-1)[0]-.4:0;const ya=Math.max(3,Math.min(60,Math.max(...E.filter(a=>a[0]>=tl).map(a=>Math.abs(a[1])),0)*1.4));return {x:[e0,e1],y:[-ya,ya],s:[{p:E,c:'#9333ea'},{p:[[e0,0],[e1,0]],c:'#94a3b8',d:true}]};})()},
      read:[{k:'מיקום',v:st.x,u:'mm',max:P.S},{k:'יעד',v:st.xt,u:'mm',max:P.S},{k:'שגיאה',v:st.xt-st.x,u:'mm',w:Math.abs(st.xt-st.x)>5&&st.t-st.stp>2},{k:'חריגה (Overshoot)',v:st.peak!=null?Math.max(st.peak,0)/step*100:0,u:'%',max:50},{k:'משרעת רטט',v:st.amp||0,u:'mm',dg:2,w:(st.amp||0)>.3},{k:'תדר טבעי הידראולי',v:wh/(2*PI),u:'Hz',dg:1}]};},
  ins(P,R){const L=[];const lim=.35*R.wh;
    L.push({ic:'🔁',h:`לולאה סגורה: החיישן מודד, הבקר משווה ליעד ושולח u = Kp·שגיאה = ${fmt(R.u,2)} V לשסתום. ככל שמתקרבים – הספול נסגר.`,at:'AMP'});
    L.push({ic:'🎵',h:`השמן מתנהג כקפיץ: עם המסה ${fmt(P.m,0)} kg התדר הטבעי ≈ <b>${fmt(R.wh/(2*PI),1)} Hz</b>. הגבר המהירות K_v ≈ ${fmt(R.Kv,1)} 1/s – ${R.Kv<lim?'יציב ✓':'קרוב מדי לגבול היציבות!'} (כלל אצבע K_v < ${fmt(lim,0)} 1/s).`});
    if(R.amp>.3)L.push({ic:'〰️',w:true,at:'C1',h:`רטט של ±${fmt(R.amp,1)} mm סביב היעד (בגרף השגיאה המוגדל) – הגבר הלולאה גבוה מדי ביחס לתדר הטבעי. הורידו Kp, או הגדילו נוקשות (צילינדר קצר, צנרת קשיחה, בלי אוויר).`,c:'רטט – הגבר גבוה מדי'});
    else if(Math.abs(R.err)>3&&R.over<1)L.push({ic:'🐢',h:'התגובה איטית: הגבר נמוך – הבקר "מתקרב בזהירות". העלו Kp בזהירות.'});
    if(P.F!==0)L.push({ic:'⚖️',h:'כוח חיצוני כמעט לא יוצר שגיאה קבועה: שסתום סרוו עם מרכז קריטי חוסם את הזרימה בשגיאה אפס, והלחצים בתאים מאזנים את הכוח.'});return L;},
  calc(P,R){const A1=H.A(P.D);return `<div class="kpis">${kpi('תדר טבעי',fmt(R.wh/(2*PI),1),'Hz')}${kpi('K_v',fmt(R.Kv,1),'1/s')}${kpi('גבול מומלץ',fmt(.35*R.wh,0),'1/s')}${kpi('חריגה',fmt(R.over,0),'%')}</div>`+
    det('נוקשות הידראולית',row('',`k_h = β·(A₁²/V_A + A₂²/V_B)`)+row('',`ω_h = √(k_h/m) = ${V(R.wh,'rad/s')} = ${V(R.wh/(2*PI),'Hz')}`),true)+
    det('הגבר הלולאה',row('',`K_v = Kp·(dQ/du)/A₁ ≈ ${V(R.Kv,'1/s')}`)+row('קבוע זמן משוער',`τ ≈ 1/K_v = ${V(1000/Math.max(R.Kv,.01),'ms',0)}`)+row('כלל אצבע',`K_v < (0.3–0.4)·ω_h ≈ ${V(.35*R.wh,'1/s',0)}`),true)+`<div class="note">מודל: מסה, דחיסות בשני התאים (β = 14,000 bar), שסתום מרכז קריטי עם זמן תגובה 12 ms, דליפה קטנה וחיכוך צמיגי.</div>`;},
  demo:[{t:'מערכת סרוו',x:'חיישן מודד את מיקום הבוכנה, <b>הבקר</b> משווה ליעד ושולח פקודה לשסתום. זו לולאה סגורה.',reset:true,set:{auto:true},hl:['XS','AMP','V1']},
    {t:'צעד ביעד',x:'היעד קופץ בין 100 ל-300 mm. הבוכנה מגיעה ונעצרת בדיוק – הספול נסגר כשהשגיאה מתאפסת.',hl:['CH1'],dur:8},
    {t:'הגבר נמוך',x:'Kp = 0.05: התגובה איטית ו"עצלה".',set:{Kp:.05},hl:['CH1'],dur:8},
    {t:'הגבר גבוה',x:'Kp = 4: מהיר – אבל השמן הוא קפיץ, והמסה רוטטת סביב היעד בתדר גבוה. בגרף השגיאה המוגדל רואים את הרטט.',set:{Kp:4},hl:['CH2','C1'],dur:8},
    {t:'מסה גדולה',x:'מסה של 1000 ק"ג מורידה את התדר הטבעי – גם ההגבר הרגיל כבר מרטיט.',set:{Kp:.3,m:1000},hl:['CH2'],dur:8}],
  predict:[{q:'מעלים את Kp מ-0.3 ל-4. מה יקרה?',set:{Kp:4},opts:['תגובה מהירה ויציבה','רטט סביב היעד','שום שינוי'],a:1,dur:8,why:'הגבר הלולאה עובר את הגבול שקובעים המסה ונוקשות השמן – המערכת מתנדנדת.'},
    {q:'יש אוויר בשמן (נוקשות נמוכה). באותו Kp:',set:{},opts:['יציב יותר','פחות יציב','אין השפעה'],a:1,dur:2,why:'אוויר מוריד את β ואת התדר הטבעי – אותו הגבר קרוב יותר לגבול היציבות.'}],
  tasks:[{q:P=>`k_h = 1.4·10⁷ N/m, m = ${P.m} kg. מה התדר הטבעי? (Hz)`,a:P=>Math.sqrt(1.4e7/P.m)/(2*PI),u:'Hz',hint:'f = √(k/m)/(2π).',rand:P=>{P.m=pick([50,100,200,500,1000]);}},
    {q:P=>`ω_h = ${fmt(Math.sqrt(1.4e7/P.m),0)} rad/s. מה K_v המקסימלי לפי 0.35·ω_h?`,a:P=>.35*Math.sqrt(1.4e7/P.m),u:'1/s',hint:'K_v,max ≈ 0.35·ω_h.',rand:P=>{P.m=pick([100,200,500]);}}],
  faults:[{id:'air',t:'אוויר בשמן',sym:'"הצילינדר רוטט סביב המיקום, למרות שלא שינו פרמטרים בבקר."',hint:'השוו את התדר הטבעי לחישוב עם β = 14,000 bar.',why:'אוויר מוריד את מודול הנפח פי ~8 – התדר הטבעי יורד והגבר הקיים כבר לא יציב. מנקזים אוויר.'},
    {id:'sensor',t:'היסט בחיישן המיקום',sym:'"הצילינדר עוצר יציב, אבל תמיד 12 mm לפני היעד."',hint:'השוו את המיקום בפועל ליעד אחרי שהתנועה נרגעה.',why:'החיישן מודד 12 mm יותר – הבקר "חושב" שהגיע. מכיילים את החיישן.'},
    {id:'sticky',t:'ספול נתקע (חיכוך / לכלוך)',sym:'"הצילינדר עוצר כמה מילימטרים לפני היעד, ובכל פעם במקום אחר."',hint:'הסתכלו על השגיאה אחרי שהתנועה נרגעת – היא לא מתאפסת.',why:'הספול זז רק כשהפקודה משתנה ביותר מ-6% – שגיאה קטנה לא מספיקה להזיז אותו. מנקים את השסתום ובודקים את הסינון.'}],
  test(H){const P=clone(this.P);P.auto=false;P.xt=250;const st=this.init(P);let R;for(let t=0;t<3;t+=.01)R=this.step(P,st,.01,{});const e1=Math.abs(R.err);
    const P2=clone(this.P);P2.auto=false;P2.xt=250;P2.Kp=4;const s2=this.init(P2);let R2;for(let t=0;t<3;t+=.01)R2=this.step(P2,s2,.01,{});
    const A1=H.A(50),A2=H.Aann(50,28);const kh=1.4e9*((A1*1e-6)**2/((.15+A1*R.x/1e6)*1e-3)+(A2*1e-6)**2/((.15+A2*(400-R.x)/1e6)*1e-3));
    return [['P מגיע ליעד (שגיאה < 1 mm)',e1<1?1:0,1],['הגבר נומינלי: אין רטט',(st.amp||0)<.1?1:0,1],['הגבר גבוה ⇒ רטט > 0.5 mm',(s2.amp||0)>.5?1:0,1],['ω_h = √(k_h/m)',R.wh,Math.sqrt(kh/200),.001],['UI מיקום',R.read[0].v,R.x]];}};

LABS.push({ch:22,title:'הידראוליקה פרופורציונלית וסרוו',sims:[C22_PROP,C22_SERVO]});
}
