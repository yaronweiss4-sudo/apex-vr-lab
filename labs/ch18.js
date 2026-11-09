/* lab 18 – same code as the website */
{




/* ===================== Chapter 18 – mobile work hydraulics (sims 51, 52) ===================== */

/* ---------- 51 · open centre, closed centre and load sensing ---------- */
const SYS51={oc:['מרכז פתוח','משאבה קבועה; במרכז השמן עובר דרך השסתום למיכל'],cc:['מרכז סגור','משאבה בעלת נפח משתנה מפוצת לחץ קבוע'],ls:['Load Sensing','משאבה משתנה שלחצה = לחץ העומס + מרווח']};
/* solve one system for a lever opening u (0…1) and load pressure pL. returns {p,Q,Qp,v,loss} */
function sys51(kind,o){const Qmax=o.Q,pL=o.pL,u=clamp(o.u,0,1),km=u*o.kmax;   // km: metering orifice k at full lever
  if(kind==='oc'){const kb=o.kb*(1-u)**2+.02;   // open-centre bypass closes as the lever opens
    const g=p=>Qmax-H.orQ(kb,Math.max(p,0))-(p>pL?H.orQ(km,p-pL):0)-H.reliefQ(p,o.pr,6,Qmax);const p=H.bisect(g,0,o.pr+10);const Q=p>pL?H.orQ(km,p-pL):0;return {p,Q,Qp:Qmax,loss:H.kW(p,Qmax)-H.kW(pL,Q)};}
  if(kind==='cc'){const pc=o.pc;const Q=Math.min(Qmax,pc>pL?H.orQ(km,pc-pL):0);const leak=.6;return {p:pc,Q,Qp:Q+leak,loss:H.kW(pc,Q+leak)-H.kW(pL,Q)};}
  const dpm=o.dpm;let Q=H.orQ(km,dpm);let p=pL+dpm;if(Q>Qmax){Q=Qmax;p=pL+(km>0?(Q/km)**2:0);}if(p>o.pr){p=o.pr;Q=p>pL?H.orQ(km,p-pL):0;}if(u<=0){p=dpm;Q=0;}const leak=.6;return {p,Q,Qp:Q+leak,loss:H.kW(p,Q+leak)-H.kW(pL,Q)};}
const SIM_OCLS={id:'ocls',n:51,t:'LS מול מרכז פתוח וסגור',d:'אותו מחזור עבודה בשלוש מערכות: הספק מבוזבז, חום, ולמה LS שומרת מפל לחץ קבוע',
  P:{sys:'ls',Q:60,pr:250,pc:210,dpm:20,lev:.5,F:40000,D:80,dr:45,S:400,auto:true,kmax:12},
  key:P=>P.sys,
  ui(U,P){U.grp('מערכת');U.seg(P,'sys','סוג',[['oc','פתוח'],['cc','סגור'],['ls','LS']],true);U.chk(P,'auto','מחזור עבודה אוטומטי');U.num(P,'lev','ידית (פתיחה)','0–1',{min:0,max:1,step:.05});
    U.grp('עומס',false);U.num(P,'F','עומס על הצילינדר','N',{min:0,max:150000,step:1000});U.num(P,'D','קוטר בוכנה','mm',{min:40,max:200,step:5});
    U.grp('משאבה',false);U.num(P,'Q','ספיקה מרבית','L/min',{min:10,max:300,step:5});U.num(P,'pc','לחץ ווסת (מרכז סגור)','bar',{min:50,max:350,step:5});U.num(P,'dpm','מרווח LS','bar',{min:5,max:40,step:1});U.num(P,'pr','שסתום פריקה','bar',{min:50,max:350,step:5});},
  circuit(P){const var_=P.sys!=='oc';const comps=[{id:'C1',type:'cyl',x:330,y:60,o:{load:{t:'⛏'}},name:'צילינדר זרוע',lbl:'זרוע',lblAt:[-82,-22],l3:[0,-34]},
      {id:'V1',type:'dcv',x:330,y:180,o:{box:P.sys==='oc'?KIT.D43.tandem:KIT.D43.closed,L:'lever',center:true},name:`שסתום ידית – ${SYS51[P.sys][0]}`,lbl:SYS51[P.sys][0],lblAt:[100,4]},
      {id:'P1',type:'pump',x:200,y:320,o:{var:var_},name:var_?'משאבה משתנה':'משאבה קבועה',lbl:var_?'משאבה משתנה':'משאבה קבועה',lblAt:[50,30]},{id:'T1',type:'tank',x:200,y:365,name:'מיכל'},
      {id:'RV',type:'pv',x:150,y:260,rot:-90,o:{kind:'relief'},name:'שסתום פריקה',lbl:'פריקה',lblAt:[0,-30]},{id:'T2',type:'tank',x:110,y:272,name:'מיכל'},{id:'T3',type:'tank',x:420,y:252,name:'מיכל'},
      {id:'G1',type:'gauge',x:250,y:248,net:'P',name:'מד לחץ משאבה'},{id:'G2',type:'gauge',x:285,y:108,net:'A',name:'מד לחץ עומס'},
      {id:'CH',type:'chart',x:610,y:190,o:{w:200,h:130,xl:'זמן',yl:'kW',t:'הספק מבוזבז: פתוח (כתום) · סגור (אדום) · חישת עומס – LS (ירוק)'},name:'השוואת הספק מבוזבז'}];
    const lines=[{id:'LS',net:'S',pts:['T1.t','P1.in']},{id:'LP',net:'P',pts:['P1.out',[200,260],[323,260],'V1.P']},{id:'LRV',net:'P',pts:[[200,260],'RV.P']},{id:'LRT',net:'T',pts:['RV.T',[110,260],'T2.t']},{id:'LG',net:'P',pts:[[250,260],'G1.p'],nodot:true},
      {id:'LA',net:'A',pts:['V1.A',[323,120],[280,120],'C1.A']},{id:'LG2',net:'A',pts:[[285,120],'G2.p'],nodot:true},{id:'LB',net:'B',pts:['V1.B',[337,120],[380,120],'C1.B']},{id:'LT',net:'T',pts:['V1.T',[337,230],[420,230],'T3.t']}];
    if(P.sys==='ls')lines.push({id:'LLS',net:'A',kind:'pilot',pts:[[300,120],[300,150],[240,150],[240,300],[218,300]],nodot:true});
    if(P.sys==='cc')lines.push({id:'LPC',net:'P',kind:'pilot',pts:[[230,260],[230,300],[218,300]],nodot:true});
    return {comps,lines};},
  init:()=>({x:0,t:0,hist:{oc:[],cc:[],ls:[]},E:{oc:0,cc:0,ls:0},si:1,dir:1,ang:0}),
  step(P,st,dt,ctx){const f=ctx.fault;st.t+=dt;const A1=H.A(P.D),A2=H.Aann(P.D,P.dr);
    let u=P.lev;if(P.auto){const ph=(st.t%12);u=ph<1?0:ph<4?.35:ph<7?1:ph<8?0:ph<11?.6:0;P.lev=u;}
    if(st.x>=P.S-1)st.dir=-1;if(st.x<=1)st.dir=1;const dir=u>0?st.dir:0;const pL=dir>0?H.p(P.F,A1):dir<0?H.p(P.F*.15,A2):0;const Ain=dir>=0?A1:A2;
    const o={Q:f==='pump'?P.Q*.6:P.Q,pL,u,kmax:P.kmax,kb:P.Q/Math.sqrt(8),pr:P.pr,pc:f==='comp'?P.pr+10:P.pc,dpm:f==='lsline'?2:P.dpm};
    const R3={};['oc','cc','ls'].forEach(k=>{R3[k]=sys51(k,o);if(u<=0){if(k==='oc'){const kb=o.kb+.02;const p=(o.Q/kb)**2;R3[k]={p,Q:0,Qp:o.Q,loss:H.kW(p,o.Q)};}if(k==='cc')R3[k]={p:o.pc,Q:0,Qp:.6,loss:H.kW(o.pc,.6)};if(k==='ls')R3[k]={p:o.dpm,Q:0,Qp:.6,loss:H.kW(o.dpm,.6)};}st.E[k]+=R3[k].loss*dt;});
    const r=R3[P.sys];const v=H.v(r.Q,Ain);st.x=clamp(st.x+dir*v*dt,0,P.S);KIT.ease(st,'si',dir>0?0:dir<0?2:1,dt);KIT.rpmAng(st,dt,1800);
    if(!st.hist.ls.length||st.t-st.hist.ls.at(-1)[0]>.15){['oc','cc','ls'].forEach(k=>{st.hist[k].push([st.t,R3[k].loss]);if(st.hist[k].length>160)st.hist[k].shift();});}
    const pm=KIT.nice(P.pr*1.05);const t0=st.hist.ls[0][0];const ymax=KIT.nice(Math.max(1,...['oc','cc','ls'].map(k=>Math.max(...st.hist[k].map(h=>h[1])))));
    return {p:{S:-.05,P:r.p,A:dir>0?pL:.5,B:dir<0?pL:.5,T:.5},q:{LS:r.Qp,LP:r.Qp,LRV:0,LRT:0,LA:dir*r.Q,LB:-dir*r.Q*A2/A1,LT:P.sys==='oc'?r.Qp:r.Q,LLS:0,LPC:0},pmax:pm,qref:P.Q,R3,u,pL,v,st,
      c:{C1:{x:st.x/P.S,uA:(dir>0?pL:.5)/pm,uB:(dir<0?pL:.5)/pm,lt:'⛏'},V1:{i:st.si},P1:{on:true,ang:st.ang},
        CH:{s:[{p:st.hist.oc,c:'#ea580c'},{p:st.hist.cc,c:'#dc2626'},{p:st.hist.ls,c:'#16a34a'}],x:[t0,Math.max(t0+12,st.t)],y:[0,ymax]}},
      read:[{k:'פתיחת ידית',v:u*100,u:'%',max:100},{k:'לחץ עומס',v:pL,u:'bar'},{k:'לחץ משאבה',v:r.p,u:'bar'},{k:'מהירות',v:v,u:'mm/s'},{k:'מבוזבז – פתוח',v:R3.oc.loss,u:'kW',w:P.sys==='oc'},{k:'מבוזבז – סגור',v:R3.cc.loss,u:'kW',w:P.sys==='cc'},{k:'מבוזבז – LS',v:R3.ls.loss,u:'kW',w:P.sys==='ls'},{k:'אנרגיה מבוזבזת (נבחרת)',v:st.E[P.sys],u:'kJ',dg:0}]};},
  ins(P,R){const L=[];const r=R.R3[P.sys];
    if(P.sys==='oc')L.push({ic:'🔁',at:'V1',h:`מרכז פתוח: כל ${fmt(P.Q,0)} L/min עוברים כל הזמן. בפתיחה חלקית השמן מתחלק בין המעבר למיכל לבין הצילינדר – והמהירות תלויה בעומס.`});
    if(P.sys==='cc')L.push({ic:'🧱',at:'P1',h:`מרכז סגור: המשאבה תמיד ב-${fmt(P.pc,0)} bar. בעומס קטן רוב הלחץ "נשרף" על השסתום: ${fmt(R.R3.cc.loss,1)} kW.`});
    if(P.sys==='ls')L.push({ic:'🎯',at:'P1',h:`LS: המשאבה מרגישה את לחץ העומס (קו מקווקו) ומוסיפה רק ${fmt(P.dpm,0)} bar. מפל הלחץ על השסתום קבוע – לכן המהירות תלויה רק בפתיחת הידית, לא בעומס.`});
    L.push({ic:'⚡',at:'CH',h:`ברגע זה: פתוח ${fmt(R.R3.oc.loss,1)} · סגור ${fmt(R.R3.cc.loss,1)} · LS ${fmt(R.R3.ls.loss,1)} kW – החום הזה נכנס לשמן.`});
    if(R.u<=0)L.push({ic:'⏸',h:'בהמתנה: פתוח מבזבז על זרימה דרך המרכז, סגור – על דליפות בלחץ מלא, LS – רק על לחץ ההמתנה.'});return L;},
  calc(P,R){const r=R.R3[P.sys];return `<div class="kpis">${kpi('לחץ משאבה',fmt(r.p,1),'bar')}${kpi('ספיקה לצילינדר',fmt(r.Q,1),'L/min')}${kpi('הספק שימושי',fmt(H.kW(R.pL,r.Q),2),'kW')}${kpi('הספק מבוזבז',fmt(r.loss,2),'kW')}</div>`+
    det('הספק',row('',`P_pump = p·Q_p/600 = ${fmt(r.p,1)}·${fmt(r.Qp,1)}/600 = ${V(H.kW(r.p,r.Qp),'kW')}`)+row('',`P_use = p_L·Q/600 = ${V(H.kW(R.pL,r.Q),'kW')}`)+row('',`P_loss = ${V(r.loss,'kW')}`),true)+
    det('LS',row('',`p_pump = p_L + Δp_m = ${fmt(R.pL,0)} + ${P.dpm} → Q = k·√Δp_m (לא תלוי בעומס)`));},
  demo:[{t:'אותו מחזור, שלוש מערכות',x:'זרוע של מחפר עולה ויורדת לפי מחזור ידית קבוע. הגרף מחשב את ההספק המבוזבז בשלוש המערכות באותו זמן.',reset:true,hl:['CH']},
    {t:'מרכז פתוח',x:'משאבה קבועה: כל הספיקה זורמת כל הזמן, גם בהמתנה. בפתיחה חלקית – הרבה שמן חוזר למיכל בלחץ העומס.',set:{sys:'oc'},hl:['P1','V1'],dur:9},
    {t:'מרכז סגור',x:'משאבה משתנה בלחץ קבוע גבוה: בהמתנה כמעט אין זרימה, אבל בעבודה עם עומס קטן הלחץ העודף נשרף על השסתום.',set:{sys:'cc'},hl:['P1'],dur:9},
    {t:'Load Sensing',x:'המשאבה מתאימה גם ספיקה וגם לחץ: לחץ העומס + 20 bar. הקו הירוק בגרף הנמוך ביותר.',set:{sys:'ls'},hl:['P1','CH'],dur:10}],
  predict:[{q:'בעומס קטן, איזו מערכת מבזבזת הכי הרבה הספק בזמן תנועה איטית?',set:{F:5000,auto:false,lev:.3},opts:['פתוח','סגור','LS'],a:1,why:'במרכז סגור הלחץ תמיד גבוה, וההפרש בין לחץ הווסת ללחץ העומס נשרף בשסתום.'},
    {q:'מכפילים את העומס במערכת LS. המהירות באותה פתיחת ידית –',set:{sys:'ls',auto:false,lev:.5,F:80000},opts:['תקטן משמעותית','כמעט לא תשתנה','תגדל'],a:1,why:'LS שומרת Δp קבוע על השסתום – הספיקה תלויה רק בפתיחה.'}],
  tasks:[{q:P=>`LS: לחץ עומס ${fmt(H.p(P.F,H.A(P.D)),0)} bar, מרווח ${P.dpm} bar. מה לחץ המשאבה?`,a:P=>H.p(P.F,H.A(P.D))+P.dpm,u:'bar',hint:'p = p_L + Δp_m.',rand:P=>{P.F=rnd(10000,100000,5000);P.dpm=pick([15,20,25]);}},
    {q:P=>`מרכז סגור ${P.pc} bar, עומס דורש 60 bar, ספיקה 40 L/min. הספק מבוזבז?`,a:P=>H.kW(P.pc-60,40),u:'kW',hint:'(p_c − p_L)·Q/600.',rand:P=>{P.pc=rnd(150,280,10);}}],
  faults:[{id:'lsline',t:'קו ה-LS סדוק/דולף',sym:'"המכונה איטית מאוד בכל הפונקציות, למרות שהמשאבה תקינה."',hint:'השוו את לחץ המשאבה ללחץ העומס.',why:'אות ה-LS לא מגיע במלואו: המרווח קטן מאוד והספיקה דרך השסתום נמוכה.',set:{sys:'ls',auto:true}},
    {id:'pump',t:'משאבה שחוקה – ספיקה מרבית נמוכה',sym:'"בפתיחה מלאה הזרוע לא מגיעה למהירות הרגילה."',hint:'השוו את המהירות בפתיחה מלאה לספיקה המרבית.',why:'המשאבה נותנת רק 60% מהספיקה – הרוויה מוקדמת.',set:{sys:'ls',auto:true}}],
  qaT:12,
  test(H){const o={Q:60,pL:80,u:.5,kmax:12,kb:60/Math.sqrt(8),pr:250,pc:210,dpm:20};const ls=sys51('ls',o),cc=sys51('cc',o);
    return [['LS: p = p_L + Δp',ls.p,100],['LS: Q = k√Δp',ls.Q,6*Math.sqrt(20)],['CC: Q = k√(pc−pL)',cc.Q,Math.min(60,6*Math.sqrt(130))],['LS חוסך מול CC',+(ls.loss<cc.loss),1]];}};

/* ---------- 52 · LS bank with two consumers: pre- vs post-compensation ---------- */
const SIM_LSBANK={id:'lsbank',n:52,t:'בנק חישת עומס (LS) עם שני צרכנים',d:'שתי פונקציות יחד עד רוויית המשאבה: מווסת לפני (הכבד נעצר) מול מווסת אחרי (שניהם מאטים יחד)',
  P:{comp:'pre',Qmax:80,dpm:22,dpc:15,u1:.8,u2:.8,F1:90000,F2:20000,D1:100,D2:80,auto:true},
  key:P=>P.comp,
  ui(U,P){U.grp('בנק');U.seg(P,'comp','מווסתים',[['pre','לפני השסתום'],['post','אחרי (חלוקת ספיקה יחסית)']],true);U.chk(P,'auto','פתיחה הדרגתית של שתי הידיות');
    U.num(P,'u1','ידית 1 – זרוע (כבד)','0–1',{min:0,max:1,step:.05});U.num(P,'u2','ידית 2 – כף (קל)','0–1',{min:0,max:1,step:.05});
    U.grp('נתונים',false);U.num(P,'Qmax','ספיקה מרבית','L/min',{min:20,max:300,step:5});U.num(P,'F1','עומס זרוע','N',{min:0,max:200000,step:5000});U.num(P,'F2','עומס כף','N',{min:0,max:200000,step:5000});U.num(P,'dpm','מרווח LS','bar',{min:5,max:40,step:1});},
  circuit:P=>({comps:[{id:'C1',type:'cyl',x:170,y:60,o:{load:{t:'⛏'}},name:'צילינדר זרוע (עומס כבד)',lbl:'זרוע',lblAt:[-82,-22],l3:[0,-34]},{id:'C2',type:'cyl',x:460,y:60,o:{load:{t:'🪣'}},name:'צילינדר כף (עומס קל)',lbl:'כף',lblAt:[-82,-22],l3:[0,-34]},
      {id:'V1',type:'dcv',x:170,y:200,o:{box:KIT.D43.closed,L:'lever',center:true},name:'קטע שסתום 1',lbl:'1',lblAt:[78,4]},{id:'V2',type:'dcv',x:460,y:200,o:{box:KIT.D43.closed,L:'lever',center:true},name:'קטע שסתום 2',lbl:'2',lblAt:[78,4]},
      {id:'K1',type:'fcv',x:163,y:265,name:P.comp==='pre'?'מווסת לחץ לפני השסתום (שומר Δp קבוע על הספול (מגופה))':'מווסת אחרי השסתום (חלוקת ספיקה יחסית)',lbl:'מווסת',lblAt:[-36,0]},{id:'K2',type:'fcv',x:453,y:265,name:'מווסת קטע 2',lbl:'מווסת',lblAt:[-36,0]},
      {id:'P1',type:'pump',x:310,y:390,o:{var:true},name:'משאבה משתנה עם חישת עומס (LS)',lbl:'משאבת LS',lblAt:[50,30]},{id:'T1',type:'tank',x:310,y:435,name:'מיכל'},{id:'T3',type:'tank',x:240,y:246,name:'מיכל'},{id:'T4',type:'tank',x:530,y:246,name:'מיכל'},
      {id:'G1',type:'gauge',x:355,y:318,net:'P',name:'מד לחץ משאבה'},
      {id:'CH',type:'chart',x:680,y:220,o:{w:190,h:130,xl:'זמן',yl:'mm/s',t:'מהירות זרוע (כתום) וכף (כחול)'},name:'גרף מהירויות'}],
    lines:[{id:'LS',net:'S',pts:['T1.t','P1.in']},{id:'LP',net:'P',pts:['P1.out',[310,320],[310,300]]},{id:'LG',net:'P',pts:[[310,330],[355,330]],nodot:true},
      {id:'LP1',net:'P',pts:[[310,300],[163,300],'K1.in']},{id:'LK1',net:'K1',pts:['K1.out','V1.P']},{id:'LP2',net:'P',pts:[[310,300],[453,300],'K2.in']},{id:'LK2',net:'K2',pts:['K2.out','V2.P']},
      {id:'LA1',net:'A1',pts:['V1.A',[163,120],[120,120],'C1.A']},{id:'LB1',net:'T',pts:['V1.B',[177,120],[220,120],'C1.B']},{id:'LT1',net:'T',pts:['V1.T',[177,226],[240,226],'T3.t']},
      {id:'LA2',net:'A2',pts:['V2.A',[453,120],[410,120],'C2.A']},{id:'LB2',net:'T',pts:['V2.B',[467,120],[510,120],'C2.B']},{id:'LT2',net:'T',pts:['V2.T',[467,226],[530,226],'T4.t']},
      {id:'LLS',net:'L',kind:'pilot',pts:[[120,140],[100,140],[100,360],[292,360]],nodot:true},{id:'LLS2',net:'L',kind:'pilot',pts:[[410,140],[390,140],[390,360],[328,360]],nodot:true}]}),
  init:()=>({x1:0,x2:0,t:0,hist:[],s1:1,s2:1}),
  solve(P,f){const A1=H.A(P.D1),A2=H.A(P.D2);const pL1=H.p(P.F1,A1),pL2=H.p(P.F2,A2);const k1=P.u1*14,k2=P.u2*14;const Qmax=f==='sat'?P.Qmax*.6:P.Qmax;const dpc=P.dpc;const pmaxL=Math.max(P.u1>0?pL1:0,P.u2>0?pL2:0);
    let Q1=0,Q2=0,pp;
    if(P.comp==='pre'){const d1=H.orQ(k1,dpc),d2=H.orQ(k2,dpc);if(d1+d2<=Qmax){Q1=d1;Q2=d2;pp=pmaxL+P.dpm;}
      else{const q=(p)=>H.orQ(k1,clamp(p-pL1,0,dpc))+H.orQ(k2,clamp(p-pL2,0,dpc));pp=H.bisect(p=>q(p)-Qmax,Math.min(pL1,pL2),pmaxL+dpc);Q1=H.orQ(k1,clamp(pp-pL1,0,dpc));Q2=H.orQ(k2,clamp(pp-pL2,0,dpc));}}
    else{const ks=k1+k2;const dpS=f==='share'?null:null;let dps=P.dpm;let Q=ks*Math.sqrt(dps);if(Q>Qmax){Q=Qmax;dps=(Q/ks)**2;}Q1=k1*Math.sqrt(dps);Q2=k2*Math.sqrt(dps);pp=pmaxL+dps;if(ks<=0){Q1=Q2=0;pp=P.dpm;}}
    if(P.u1<=0&&P.u2<=0)pp=P.dpm;
    if(f==='comp1'&&P.comp==='pre'){Q1=H.orQ(k1,Math.max(pp-pL1,0));}
    return {Q1,Q2,pp,pL1,pL2,A1,A2,v1:H.v(Q1,A1),v2:H.v(Q2,A2),sat:Q1+Q2>=Qmax-.5,Qmax};},
  step(P,st,dt,ctx){const f=ctx.fault;st.t+=dt;if(P.auto){const ph=st.t%10;const u=ph<1?0:ph<6?clamp((ph-1)/4,0,1):ph<8?1:0;P.u1=u;P.u2=u;}
    const r=this.solve(P,f);const S=400;st.x1+=r.v1*dt;st.x2+=r.v2*dt;if(st.x1>S)st.x1=0;if(st.x2>S)st.x2=0;KIT.ease(st,'s1',P.u1>0?0:1,dt);KIT.ease(st,'s2',P.u2>0?0:1,dt);KIT.rpmAng(st,dt,1800);
    if(!st.hist.length||st.t-st.hist.at(-1)[0]>.1){st.hist.push([st.t,r.v1,r.v2]);if(st.hist.length>150)st.hist.shift();}const pm=KIT.nice(Math.max(r.pp,r.pL1)*1.1);const t0=st.hist[0][0];
    const vmax=KIT.nice(Math.max(10,...st.hist.map(h=>Math.max(h[1],h[2]))));
    return {p:{S:-.05,P:r.pp,K1:P.comp==='pre'?r.pL1+Math.min(P.dpc,r.pp-r.pL1):r.pp,K2:P.comp==='pre'?r.pL2+Math.min(P.dpc,r.pp-r.pL2):r.pp,A1:r.pL1,A2:r.pL2,T:.5,L:Math.max(r.pL1,r.pL2)},
      q:{LS:r.Q1+r.Q2,LP:r.Q1+r.Q2,LP1:r.Q1,LK1:r.Q1,LP2:r.Q2,LK2:r.Q2,LA1:r.Q1,LA2:r.Q2,LB1:-r.Q1*.7,LB2:-r.Q2*.7,LT1:r.Q1*.7,LT2:r.Q2*.7},pmax:pm,qref:P.Qmax,r,
      c:{C1:{x:st.x1/S,uA:r.pL1/pm,uB:.02},C2:{x:st.x2/S,uA:r.pL2/pm,uB:.02},V1:{i:st.s1},V2:{i:st.s2},P1:{on:true,ang:st.ang},CH:{s:[{p:st.hist.map(h=>[h[0],h[1]]),c:'#ea580c'},{p:st.hist.map(h=>[h[0],h[2]]),c:'#0b72d9'}],x:[t0,Math.max(t0+10,st.t)],y:[0,vmax]}},
      read:[{k:'ידיות',v:P.u1*100,u:'%',max:100},{k:'ספיקת משאבה',v:r.Q1+r.Q2,u:'L/min',max:r.Qmax,w:r.sat},{k:'לחץ משאבה',v:r.pp,u:'bar'},{k:'מהירות זרוע',v:r.v1,u:'mm/s'},{k:'מהירות כף',v:r.v2,u:'mm/s'},{k:'לחץ עומס זרוע',v:r.pL1,u:'bar'},{k:'לחץ עומס כף',v:r.pL2,u:'bar'}]};},
  ins(P,R){const r=R.r,L=[];if(!r.sat)L.push({ic:'✅',at:'P1',h:`המשאבה עוד לא ברוויה (${fmt(r.Q1+r.Q2,0)} מתוך ${fmt(r.Qmax,0)} L/min): כל פונקציה מקבלת לפי הידית שלה, בלי קשר לעומס.`});
    else if(P.comp==='pre')L.push({ic:'⛔',w:true,at:'C1',h:`רוויה עם מווסתים לפני השסתום: לחץ המשאבה יורד מתחת ללחץ העומס הכבד + Δp – <b>הזרוע מאטה/נעצרת</b> והכף ממשיכה כמעט רגיל.`,c:'הזרוע הכבדה נעצרת'});
    else L.push({ic:'⚖️',at:'CH',h:'רוויה עם חלוקת ספיקה יחסית: אותו Δp על שני הספולים – שתי הפונקציות מאטות באותו יחס, והמפעיל שומר על התנועה המשולבת.'});
    L.push({ic:'📶',at:'P1',h:`הקו המקווקו מעביר למשאבה את לחץ העומס הגבוה (${fmt(Math.max(r.pL1,r.pL2),0)} bar) – והיא מוסיפה ${fmt(P.dpm,0)} bar.`});return L;},
  calc(P,R){const r=R.r;return `<div class="kpis">${kpi('Q זרוע',fmt(r.Q1,1),'L/min')}${kpi('Q כף',fmt(r.Q2,1),'L/min')}${kpi('לחץ משאבה',fmt(r.pp,1),'bar')}${kpi('רוויה',r.sat?'כן':'לא')}</div>`+
    det('מווסת לפני',row('',`Q_i = k_i·√Δp_c כל עוד p_pump − p_Li ≥ Δp_c`)+row('ברוויה',`ΣQ_i = Q_max → הכבד מקבל Δp קטן יותר`),true)+det('מווסת אחרי',row('',`Δp משותף: Q_i = k_i·√Δp_s, Δp_s = (Q_max/Σk)²`));},
  demo:[{t:'שני צרכנים',x:'זרוע כבדה וכף קלה על משאבת LS אחת. הידיות נפתחות יחד בהדרגה.',reset:true,set:{comp:'pre'},hl:['C1','C2']},
    {t:'עד הרוויה',x:'כל עוד הספיקה המבוקשת קטנה מהמרבית – כל פונקציה מקבלת בדיוק מה שהידית מבקשת.',hl:['CH'],dur:6},
    {t:'רוויה – מווסת לפני',x:'כשהבקשה עוברת את הספיקה המרבית, הלחץ יורד והזרוע הכבדה נעצרת. הכף ממשיכה.',hl:['C1','CH'],dur:8},
    {t:'חלוקת ספיקה יחסית',x:'עם מווסתים אחרי השסתום שתיהן מאטות יחד – בלי שפונקציה אחת "תיתקע".',set:{comp:'post'},hl:['CH'],dur:10}],
  predict:[{q:'מווסתים לפני, המשאבה ברוויה. מי יאט?',set:{comp:'pre',auto:false,u1:1,u2:1},opts:['הזרוע הכבדה','הכף הקלה','שתיהן באותו יחס'],a:0,why:'הלחץ נקבע ע"י הספיקה הזמינה – הוא נופל מתחת ללחץ הכבד + Δp.'},
    {q:'מווסתים אחרי (חלוקת ספיקה יחסית), ברוויה –',set:{comp:'post',auto:false,u1:1,u2:1},opts:['רק הכבד נעצר','שתיהן מאטות באותו יחס'],a:1,why:'אותו Δp על כל הספולים.'}],
  tasks:[{q:P=>`חלוקת ספיקה יחסית: k₁ = k₂ = ${fmt(P.u1*14,1)}, Q_max = ${P.Qmax} L/min. מה Δp המשותף?`,a:P=>Math.min(P.dpm,(P.Qmax/(P.u1*14*2))**2),u:'bar',hint:'Δp = (Q/Σk)², לא יותר מהמרווח.',set:{u1:1,u2:1},rand:P=>{P.Qmax=rnd(40,120,5);}}],
  faults:[{id:'comp1',t:'מווסת קטע 1 תקוע פתוח',sym:'"הזרוע מהירה מדי בעומס קל ואיטית בכבד – תלויה בעומס."',hint:'האם מהירות הזרוע משתנה עם העומס?',why:'בלי מווסת אין Δp קבוע – הספיקה תלויה ב-p_pump − p_L.',set:{comp:'pre',auto:true}},
    {id:'sat',t:'ספיקה מרבית נמוכה (משאבה שחוקה)',sym:'"רק כשמפעילים שתי פונקציות – הזרוע נעצרת."',hint:'מתי מגיעים לרוויה?',why:'המשאבה מגיעה לרוויה מוקדם מדי.',set:{comp:'pre',auto:true}}],
  qaT:10,
  test(H){const P=clone(this.P);P.u1=.3;P.u2=.3;const r=this.solve(P,null);const P2=clone(this.P);P2.comp='post';P2.u1=1;P2.u2=1;const r2=this.solve(P2,null);
    return [['לפני רוויה: Q = k√Δp_c',r.Q1,4.2*Math.sqrt(15)],['p = p_Lmax + Δp_m',r.pp,Math.max(r.pL1,r.pL2)+22],['flow sharing: Q₁+Q₂ = Q_max',r2.Q1+r2.Q2,80],['flow sharing: יחס שווה',r2.Q1/r2.Q2,1]];}};

LABS.push({ch:18,title:'הידראוליקת עבודה ניידת',sims:[SIM_OCLS,SIM_LSBANK]});
}
