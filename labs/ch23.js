/* lab 23 – same code as the website */
{




/* ===================== Chapter 23 – modelling, simulation and design (sims 60, 61) ===================== */

/* design scorecard symbol. cs:{rows:[[text,ok|null]]} */
SYM.score={ports:o=>({}),bb:o=>[-(o.w||200)/2-4,-(o.h||140)/2-16,(o.w||200)/2+4,(o.h||140)/2+4],
  draw(g,o){const w=o.w||200,h=o.h||140;sv('rect',{x:-w/2,y:-h/2,width:w,height:h,rx:6,fill:'#fff',stroke:'#cbd5e1','stroke-width':1},g);const t=ST(g,0,-h/2-5,o.t||'','st s');t.style.fontWeight='700';
    const R=[];for(let i=0;i<7;i++){const y=-h/2+16+i*18;const m=ST(g,w/2-8,y+4,'','st s');m.style.textAnchor='start';m.style.fontSize='9.5px';m.style.direction='rtl';
      const vv=ST(g,-w/2+24,y+4,'','st s');vv.style.textAnchor='start';vv.style.fontSize='9.5px';vv.style.direction='ltr';vv.style.unicodeBidi='normal';vv.style.fontFamily='var(--fm,monospace)';
      const k=ST(g,-w/2+12,y+4,'','st s');k.style.fontSize='12px';k.style.fontWeight='800';R.push([m,vv,k]);}
    let last='';return cs=>{if(!cs||!cs.rows)return;const key=JSON.stringify(cs.rows);if(key===last)return;last=key;R.forEach(([m,vv,k],i)=>{const r=cs.rows[i];m.textContent=r?r[0]:'';vv.textContent=r?r[1]:'';k.textContent=r?(r[2]===true?'✓':r[2]===false?'✗':'·'):'';k.style.fill=r&&r[2]===true?'#16a34a':'#dc2626';});};}};
B3.score=()=>({g:new THREE.Group()});

/* ---------- 60 · sandbox: build-your-own single-actuator circuit ---------- */
const CTR60={closed:'מרכז סגור',open:'מרכז פתוח',tandem:'מרכז טנדם',float:'מרכז צף'};
function solve60(P,f,u,x){const A1=H.A(P.D),A2=H.Aann(P.D,P.d),W=P.F,hang=P.load==='hang',pr=f==='relief'?P.pr*.45:P.pr,pc=P.pump==='pc';const kb=P.speed==='bleed'?P.k:0;
  const leakP=f==='seal'?.06:0;let r,v=0,pBP=0,stall=false,drift=0,mode='';
  if(u>0){if(x>=P.S-.5){stall=true;}else{r=H.lin({Qp:P.Q,pr,Ain:A1,Aout:A2,F:W+(leakP?0:0),kIn:P.speed==='min'?P.k:1e9,kOut:P.speed==='mout'?P.k:1e9,kBleed:kb});v=r.v;if(leakP)v=Math.max(0,v-H.v(leakP*r.pIn,A1));}}
  else if(u<0){if(x<=.5){stall=true;}else{const F=hang?-W:.05*W;let o={Qp:P.Q,pr,Ain:A2,Aout:A1,F,kBleed:kb,vRun:H.v(P.Q,A2)*8};r=H.lin(o);
      if(P.hold==='cbv'){const pIs=(P.pcb*A1+10*F)/(A2+P.R*A1);pBP=Math.max(0,P.pcb-P.R*Math.max(pIs,0));r=H.lin({...o,pBP});}v=-r.v;}}
  if(stall||u===0){const ps=u===0?((P.center==='open'||P.center==='tandem')?3:(pc?pr:pr)):pr;const Qr=(u!==0||P.center==='closed'||P.center==='float')&&!pc?P.Q-(kb?kb*Math.sqrt(ps):0):0;
    r={v:0,ps,pIn:0,pOut:0,Qin:0,Qout:0,Qr:Math.max(0,Qr),Qb:kb?kb*Math.sqrt(ps):0,Qp:P.Q,stall:true,Ploss:H.kW(ps,u===0&&(P.center==='open'||P.center==='tandem')?P.Q:(pc?.5:P.Q)),Pin:0,Puse:0};
    if(u===0&&hang){const pA=H.p(W,A1);const lk=(P.hold==='none'||f==='hold')?((P.center==='open'||P.center==='float')&&P.hold==='none'?2.5*Math.sqrt(pA):.04*pA/100):0;drift=-H.v(lk+(leakP&&P.hold!=='none'?0:0),A1);r.pIn=pA;mode='hold';}
    if(stall){r.pIn=u>0?pr:0;r.pOut=u<0?pr:0;}}
  if(pc&&r.Qr){r.Ploss-=H.kW(r.ps,r.Qr);r.Qr=0;}
  return {...r,v:u===0?drift:v,pBP,A1,A2,pr,u};}
const SIM_SAND={id:'sand',n:60,t:'ארגז חול – מעבדה פתוחה',d:'בונים מעגל מצילינדר אחד: סוג משאבה, מרכז השסתום, בקרת מהירות, שסתום החזקה וסוג עומס – ורואים מהירות, לחצים, שקיעה והספק מבוזבז',
  P:{pump:'fixed',center:'tandem',speed:'none',hold:'none',load:'hang',auto:true,lev:0,Q:20,pr:160,k:3,pcb:130,R:4,D:63,d:36,S:300,F:20000},
  key:P=>[P.pump,P.center,P.speed,P.hold].join(),
  ui(U,P){U.grp('בניית מעגל');U.seg(P,'pump','משאבה',[['fixed','קבועה'],['pc','משתנה + ווסת']],true);U.sel(P,'center','מרכז שסתום',Object.entries(CTR60),true);
    U.sel(P,'speed','בקרת מהירות (ביציאה)',[['none','ללא'],['min','Meter-in'],['mout','Meter-out'],['bleed','Bleed-off']],true);U.sel(P,'hold','שסתום החזקה',[['none','ללא'],['check','אל-חוזר מפוקד'],['cbv','שסתום איזון עומס']],true);
    U.seg(P,'load','עומס',[['hang','תלוי (כובד)'],['press','לחיצה']]);U.chk(P,'auto','מחזור אוטומטי');U.seg(P,'lev','ידית',[[-1,'⬇'],[0,'0'],[1,'⬆']]);
    U.grp('נתונים',false);U.num(P,'F','עומס','N',{min:0,max:100000,step:1000});U.num(P,'Q','ספיקת משאבה','L/min',{min:2,max:100,step:1});U.num(P,'pr','שסתום פריקה / ווסת','bar',{min:30,max:300,step:5});U.num(P,'k','פתיחת צמצם k','L/min/√bar',{min:.3,max:20,step:.1});U.num(P,'pcb','כיול שסתום איזון עומס','bar',{min:20,max:300,step:5});U.num(P,'D','קוטר בוכנה','mm',{min:25,max:200,step:1});},
  circuit:P=>{const comps=[{id:'C1',type:'cyl',x:330,y:130,rot:-90,o:{load:{t:P.load==='hang'?'W':'⇩'}},name:'צילינדר אנכי (מוט בוכנה למעלה)',lbl:'צילינדר',lblAt:[-46,0]},
      {id:'V1',type:'dcv',x:407,y:350,o:{box:KIT.D43[P.center],L:'lever',center:true},name:`שסתום 4/3 – ${CTR60[P.center]}`,lbl:CTR60[P.center],lblAt:[110,0]},
      {id:'P1',type:'pump',x:400,y:450,o:{var:P.pump==='pc'},name:P.pump==='pc'?'משאבה בעלת נפח משתנה מפוצת לחץ':'משאבה קבועה',lbl:P.pump==='pc'?'משאבה משתנה':'משאבה קבועה',lblAt:[60,26]},{id:'T1',type:'tank',x:400,y:482,name:'מיכל'},
      {id:'RV',type:'pv',x:356,y:415,rot:-90,o:{kind:'relief'},name:'שסתום פריקה',lbl:'פריקה',lblAt:[0,-26]},{id:'T2',type:'tank',x:326,y:427,name:'מיכל'},{id:'T3',type:'tank',x:445,y:391,name:'מיכל'},
      {id:'GA',type:'gauge',x:372,y:168,net:'A',name:'מד לחץ צד מלא'},{id:'GB',type:'gauge',x:385,y:68,net:'B',name:'מד לחץ צד מוט'},
      {id:'CH',type:'chart',x:170,y:120,o:{w:200,h:100,xl:'זמן',yl:'mm',t:'מהלך (כחול) · מהירות ×0.5 (כתום)'},name:'גרף מהלך'},
      {id:'CP',type:'chart',x:170,y:320,o:{w:200,h:100,xl:'זמן',yl:'kW',t:'הספק מבוזבז (אדום) · שימושי (ירוק)'},name:'גרף הספקים'}];
    const lines=[{id:'LS',net:'S',pts:['T1.t','P1.in']},{id:'LP',net:'P',pts:['P1.out',[400,405],'V1.P']},{id:'LRV',net:'P',pts:[[400,415],'RV.P']},{id:'LRT',net:'T',pts:['RV.T',[326,415],'T2.t']},
      {id:'LT',net:'T',pts:['V1.T',[414,385],[445,385],'T3.t']},{id:'LGA',net:'A',pts:[[372,180],'GA.p'],nodot:true},{id:'LGB',net:'B',pts:[[385,80],'GB.p'],nodot:true}];
    if(P.speed==='bleed'){comps.push({id:'TBL',type:'throttle',x:470,y:435,rot:180,name:'צמצם ויסות במעקף (Bleed-off)',lbl:'Bleed-off',lblAt:[40,0]},{id:'T4',type:'tank',x:470,y:463,name:'מיכל'});lines.push({id:'LBL',net:'P',pts:[[400,405],[470,405],'TBL.in']},{id:'LBT',net:'T',pts:['TBL.out','T4.t']});}
    let a='V1.A',an='AV';const hasHold=P.hold!=='none';if(!hasHold&&P.speed!=='min')an='A';
    if(P.speed==='min'){comps.push({id:'TH',type:'throttle1',x:400,y:290,o:{free:'down'},name:'צמצם אל-חוזר – ויסות בכניסה (Meter-in)',lbl:'Meter-in',lblAt:[-46,0]});lines.push({id:'LA0',net:'AV',pts:[a,'TH.in']});a='TH.out';if(!hasHold)an='A';}
    if(P.hold==='check'){comps.push({id:'HV',type:'check',x:400,y:230,flip:true,o:{pilot:true},name:'אל-חוזר מפוקד',lbl:'אל-חוזר מפוקד',lblAt:[-30,0]});lines.push({id:'LA1',net:'AV',pts:[a,'HV.in']},{id:'LXP',net:'B',kind:'pilot',pts:[[450,230],'HV.X']});a='HV.out';an='A';}
    if(P.hold==='cbv'){comps.push({id:'CB',type:'cbv',x:400,y:215,rot:180,name:'שסתום איזון עומס',lbl:'איזון עומס',lblAt:[-52,0]});lines.push({id:'LA1',net:'AV',pts:[a,'CB.V']},{id:'LXP',net:'B',kind:'pilot',pts:[[450,193],'CB.X']});a='CB.L';an='A';}
    lines.push({id:'LA',net:'A',pts:[a,[400,180],'C1.A']});
    if(P.speed==='mout'){comps.push({id:'TB',type:'throttle1',x:450,y:200,o:{free:'up'},name:'צמצם אל-חוזר – ויסות ביציאה (Meter-out)',lbl:'Meter-out',lblAt:[52,0]});lines.push({id:'LB0',net:'BV',pts:['V1.B',[414,315],[450,315],'TB.in']},{id:'LB',net:'B',pts:['TB.out',[450,80],'C1.B']});}
    else lines.push({id:'LB',net:'B',pts:['V1.B',[414,315],[450,315],[450,80],'C1.B']});
    return {comps,lines};},
  init:()=>({t:0,x:0,ph:'w0',pt:0,si:1,E:0,h:[]}),
  step(P,st,dt,ctx){const f=ctx.fault;st.t+=dt;st.pt+=dt;let u=+P.lev;
    if(P.auto){const S=P.S;if(st.ph==='w0'&&st.pt>1){st.ph='ext';st.pt=0;}else if(st.ph==='ext'&&(st.x>=S-.5||st.pt>12)){st.ph='h1';st.pt=0;}else if(st.ph==='h1'&&st.pt>3){st.ph='ret';st.pt=0;}else if(st.ph==='ret'&&(st.x<=.5||st.pt>12)){st.ph='w0';st.pt=0;}
      u=st.ph==='ext'?1:st.ph==='ret'?-1:0;P.lev=u;}
    const r=solve60(P,f,u,st.x);st.x=clamp(st.x+r.v*dt,0,P.S);st.E+=r.Ploss*dt;KIT.ease(st,'si',u>0?0:u<0?2:1,dt);KIT.rpmAng(st,dt,1450);
    if(!st.h.length||st.t-st.h.at(-1)[0]>.1){st.h.push([st.t,st.x,Math.abs(r.v)*.5,r.Ploss,r.Puse]);if(st.h.length>200)st.h.shift();}
    const t0=st.h[0][0],tx=[t0,Math.max(t0+16,st.t)],pm=KIT.nice(P.pr*1.05),hang=P.load==='hang',A1=r.A1;
    const pA=u>0?(r.stall?r.pr:r.pIn):u<0?(r.stall?.5:r.pOut):(hang?(P.hold!=='none'||P.center==='closed'||P.center==='tandem'?H.p(P.F,A1):Math.max(.5,H.p(P.F,A1)*.15)):.5);
    const pB=u>0?(r.stall?.5:r.pOut):u<0?(r.stall?r.pr:r.pIn):.5;const pAV=P.hold!=='none'?(u>0?r.ps:u<0?Math.max(.5,r.pOut-r.pBP):.5):pA;
    const Qa=u>0?r.Qin:u<0?-(r.Qout||0):(r.v<0?-H.Q(-r.v,A1):0),Qb=u>0?-(r.Qout||0):u<0?r.Qin:0;
    return {p:{S:-.05,P:r.ps,A:pA,AV:P.speed==='min'&&u>0?r.ps:pAV,B:pB,BV:P.speed==='mout'&&u>0?.8:pB,T:.5},
      q:{LS:P.Q,LP:P.Q-r.Qr-(r.Qb||0),LRV:r.Qr,LRT:r.Qr,LBL:r.Qb||0,LBT:r.Qb||0,LT:Math.abs(u?(u>0?r.Qout:r.Qout):0)+(u===0&&(P.center==='open'||P.center==='tandem')?P.Q:0),LA0:Qa,LA1:Qa,LA:Qa,LB0:Qb,LB:Qb,LGA:0,LGB:0,LXP:0},
      pmax:pm,qref:P.Q,vac:!!r.cav,r,u,
      c:{C1:{x:st.x/P.S,uA:pA/pm,uB:pB/pm},V1:{i:st.si},P1:{on:true,ang:st.ang},HV:{open:u<0?1:0},
        CH:{s:[{p:st.h.map(a=>[a[0],a[1]]),c:'#0b72d9'},{p:st.h.map(a=>[a[0],a[2]]),c:'#ea580c',d:true}],x:tx,y:[0,P.S*1.05]},
        CP:{s:[{p:st.h.map(a=>[a[0],a[3]]),c:'#dc2626'},{p:st.h.map(a=>[a[0],a[4]]),c:'#16a34a'}],x:tx,y:[0,KIT.nice(Math.max(1,H.kW(P.pr,P.Q))*1.05)]}},
      read:[{k:'מהירות',v:r.v,u:'mm/s'},{k:'לחץ משאבה',v:r.ps,u:'bar',max:P.pr},{k:'לחץ צד מלא (A)',v:pA,u:'bar',max:P.pr},{k:'לחץ צד מוט (B)',v:pB,u:'bar',max:P.pr},
        {k:'הספק מבוזבז',v:r.Ploss,u:'kW',w:r.Ploss>H.kW(P.pr,P.Q)*.6},{k:'נצילות',v:r.Pin>0?r.Puse/Math.max(r.Pin,1e-6)*100:0,u:'%',max:100},{k:'שקיעה בנייטרל',v:u===0?-r.v:0,u:'mm/s',w:u===0&&r.v<-.5},{k:'אנרגיה מבוזבזת',v:st.E,u:'kJ',dg:0}]};},
  ins(P,R){const r=R.r,L=[],hang=P.load==='hang';
    if(R.vac)L.push({ic:'🫧',at:'C1',w:true,h:'העומס "בורח" למטה מהר יותר ממה שהמשאבה ממלאת את צד המוט – קוויטציה ונפילה. צריך שסתום איזון עומס (או ויסות ביציאה (Meter-out) בירידה).',c:'עומס בורח'});
    if(R.u===0&&hang&&R.read[6].v>.5)L.push({ic:'⬇',at:'V1',w:true,h:P.hold==='none'&&(P.center==='open'||P.center==='float')?`${CTR60[P.center]} מחבר את A ו-B למיכל – העומס צונח ב-${fmt(R.read[6].v,0)} mm/s.`:'השמן דולף דרך מרווח הספול (מגופה) – העומס שוקע לאט. שסתום החזקה (אל-חוזר פיקוד) עוצר את זה.',c:'שקיעה'});
    if(R.u===0&&!(P.center==='open'||P.center==='tandem')&&P.pump==='fixed')L.push({ic:'🔥',at:'RV',w:true,h:`בהמתנה, משאבה קבועה ומרכז ${P.center==='closed'?'סגור':'צף'}: כל ${P.Q} L/min עוברים בשסתום הפריקה ב-${P.pr} bar – ${fmt(H.kW(P.pr,P.Q),1)} kW הופכים לחום.`,c:'חום בהמתנה'});
    if(R.u===0&&P.pump==='pc')L.push({ic:'💤',at:'P1',h:'משאבה משתנה בהמתנה: הלחץ נשמר, הספיקה כמעט אפס – כמעט בלי חום.'});
    if(R.u>0&&P.speed==='min')L.push({ic:'🎚',at:'TH',h:'Meter-in: הצמצם מגביל את השמן שנכנס. העודף עובר בשסתום הפריקה – פשוט, אבל מבזבז.'});
    if(R.u>0&&P.speed==='mout')L.push({ic:'🎚',at:'TB',h:'Meter-out: הצמצם מגביל את השמן שיוצא – הבוכנה "תפוסה" בין שני עמודי שמן, טוב לעומס שמושך.'});
    if(R.u>0&&P.speed==='bleed')L.push({ic:'🎚',at:'TBL',h:'Bleed-off: חלק מהשמן חוזר למיכל בלחץ העומס בלבד – חסכוני, אבל המהירות תלויה בעומס.'});
    if(R.u<0&&P.hold==='cbv')L.push({ic:'⚖️',at:'CB',h:`שסתום איזון העומס מחזיק לחץ נגדי (${fmt(r.pBP,0)} bar) בצד המלא, והעומס יורד בשליטה.`});
    if(r.stall&&R.u!==0)L.push({ic:'🛡',at:'RV',h:'סוף מהלך: השמן עובר בשסתום הפריקה.'});
    if(!L.length)L.push({ic:'🧪',at:'V1',h:'שנו רכיבים בפאנל: כל שינוי בונה מחדש את השרטוט ואת החישוב.'});return L;},
  calc(P,R){const r=R.r;return `<div class="kpis">${kpi('מהירות',fmt(r.v,1),'mm/s')}${kpi('לחץ משאבה',fmt(r.ps,1),'bar')}${kpi('הספק מבוזבז',fmt(r.Ploss,2),'kW')}${kpi('נצילות',fmt(R.read[5].v,0),'%')}</div>`+
    det('מאזן ספיקה',row('',`Q_p = Q_צילינדר + Q_שסתום פריקה + Q_bleed = ${fmt(r.Qin||0,1)} + ${fmt(r.Qr||0,1)} + ${fmt(r.Qb||0,1)} = ${V(P.Q,'L/min')}`),true)+
    det('לחצים',row('',`p_A·A₁ = F + p_B·A₂ → p_A = ${V(R.p.A,'bar')} , p_B = ${V(R.p.B,'bar')}`)+row('',`עומס תלוי בהחזקה: p = W/A₁ = ${fmt(P.F,0)}·10/${fmt(r.A1,0)} = ${V(H.p(P.F,r.A1),'bar')}`))+
    det('הספק',row('',`P_in = p·Q/600 = ${V(r.Pin||0,'kW')} ; P_use = F·v = ${V(r.Puse||0,'kW')} ; P_loss = ${V(r.Ploss,'kW')}`));},
  demo:[{t:'המעגל הבסיסי',x:'משאבה קבועה, מרכז טנדם, בלי בקרת מהירות ובלי שסתום החזקה. עומס תלוי של 2 טון עולה ויורד.',reset:true,set:{pump:'fixed',center:'tandem',speed:'none',hold:'none',load:'hang',auto:true},hl:['C1','V1'],dur:8},
    {t:'ירידה בלי שליטה',x:'בירידה הכובד דוחף – העומס בורח וצד המוט בוואקום (סגול).',hl:['C1'],dur:6},
    {t:'שסתום איזון עומס',x:'מוסיפים שסתום איזון עומס: הוא מחזיק לחץ נגדי בצד המלא, והירידה בשליטה.',set:{hold:'cbv'},hl:['CB'],dur:9},
    {t:'מרכז פתוח',x:'מחליפים למרכז פתוח בלי שסתום החזקה: בנייטרל העומס פשוט צונח.',set:{hold:'none',center:'open'},hl:['V1'],dur:8},
    {t:'חום בהמתנה',x:'מרכז סגור עם משאבה קבועה: בהמתנה כל השמן בשסתום הפריקה. משאבה משתנה פותרת את זה.',set:{center:'closed',hold:'check',pump:'fixed'},hl:['RV','CP'],dur:8}],
  predict:[{q:'עומס תלוי, מרכז פתוח, בלי שסתום החזקה. מעבירים את הידית לנייטרל –',set:{pump:'fixed',center:'open',speed:'none',hold:'none',load:'hang',auto:true},opts:['העומס נשאר במקום','העומס צונח','העומס עולה'],a:1,why:'במרכז פתוח A ו-B מחוברים למיכל – אין מה שיחזיק את השמן מתחת לבוכנה.'},
    {q:'משאבה קבועה ומרכז סגור. בהמתנה ההספק –',set:{pump:'fixed',center:'closed',hold:'check',load:'hang',auto:true},opts:['קרוב לאפס','מלא – כולו לחום בשסתום הפריקה'],a:1,why:'המשאבה ממשיכה לדחוף את כל הספיקה, והדרך היחידה היא שסתום הפריקה: Q·p/600.'}],
  tasks:[{q:P=>`עומס תלוי ${fmt(P.F,0)} N על בוכנה Ø${P.D} mm. מה הלחץ בצד המלא בהחזקה?`,a:P=>H.p(P.F,H.A(P.D)),u:'bar',hint:'p = F/A, 1 bar = 0.1 N/mm².',rand:P=>{P.F=rnd(5000,50000,1000);P.D=pick([40,50,63,80,100]);}},
    {q:P=>`משאבה ${P.Q} L/min, שסתום פריקה ${P.pr} bar, מרכז סגור. כמה הספק הופך לחום בהמתנה?`,a:P=>H.kW(P.pr,P.Q),u:'kW',hint:'P = p·Q/600.',rand:P=>{P.Q=rnd(10,60,5);P.pr=rnd(100,250,10);}}],
  faults:[{id:'seal',t:'אטם בוכנה דולף',sym:'"העומס עולה לאט יותר מבעבר."',hint:'השוו את המהירות למהירות התאורטית Q/A.',why:'חלק מהשמן עובר מצד לצד דרך האטם.',set:{pump:'fixed',center:'tandem',speed:'none',hold:'check',load:'hang',auto:true}},
    {id:'relief',t:'שסתום פריקה מכויל נמוך',sym:'"עם עומס מלא הצילינדר לא עולה."',hint:'מה הלחץ המרבי בזמן הרמה?',why:'שסתום הפריקה נפתח לפני שהלחץ מגיע ללחץ העומס.',set:{pump:'fixed',center:'tandem',speed:'none',hold:'check',load:'hang',auto:true,F:40000}},
    {id:'hold',t:'אל-חוזר הפיקוד דולף',sym:'"בבוקר העומס למטה, למרות שיש אל-חוזר."',hint:'מה קורה בנייטרל?',why:'הפופט לא אוטם – השמן זולג דרך הספול.',set:{pump:'fixed',center:'tandem',speed:'none',hold:'check',load:'hang',auto:true}}],
  qaT:12,
  test(H){const P=clone(this.P);const A1=H.A(63);const r=solve60(P,null,1,10);const r0={...P,center:'open'};const d=solve60(r0,null,0,100);const P2={...P,hold:'cbv'};const c=solve60(P2,null,-1,100);
    return [['יציאה: v = Q/A',r.v,H.v(20,A1),.02],['לחץ עומס W/A',r.pIn,H.p(20000,A1),.03],['מרכז פתוח: העומס צונח',+(d.v<-5),1],['שסתום איזון עומס: לחץ נגדי',+(c.pBP>0),1],['שסתום איזון עומס: ירידה בשליטה',+(Math.abs(c.v)<=H.v(20,H.Aann(63,36))*1.02),1]];}};

/* ---------- 61 · design project: log splitter ---------- */
const LOG61={soft:['אורן',80e3],oak:['אלון',150e3],knot:['גזע מסוקס',220e3]};
function load61(P,x){const F=LOG61[P.log][1];if(x<200)return 500;if(x<260)return 500+(F-500)*(x-200)/60;if(x<450)return F*(1-.8*(x-260)/190);return 500;}
function pump61(P,p,f){const Q2=f==='pump'?P.Q2*.5:P.Q2;const two=P.pump==='two';const hi=two&&p<P.pu;const Q=two?(hi?P.Q1+Q2:Q2):P.Q1;const Pd=(p*Q+(two&&!hi?2*P.Q1:0))/600/P.eta;
  const fe=Pd>P.Peng?P.Peng/Pd:1;return {Q:Q*fe,Pd:Math.min(Pd,P.Peng),Pd0:Pd,fe,hi};}
function design61(P){const A1=H.A(P.D),A2=H.Aann(P.D,P.d),Fmax=P.pr*A1/10,Fpk=LOG61[P.log][1];let t=0,Pmax=0,stall=false,minFe=1;
  for(let x=0;x<P.S;x+=2){const p=H.p(load61(P,x),A1)+2;if(p>P.pr){stall=true;break;}const q=pump61(P,p);Pmax=Math.max(Pmax,q.Pd0);minFe=Math.min(minFe,q.fe);t+=2/H.v(q.Q,A1);}
  const pr2=H.p(300,A2)+3,qr=pump61(P,pr2);const tr=P.S/H.v(qr.Q,A2);const I=PI*P.d**4/64,L=P.S+250,Fcr=PI*PI*210e3*I/(L*L),SF=Fcr/Fmax;
  return {A1,A2,Fmax,Fpk,te:t,tr,tc:stall?Infinity:t+tr,Pmax,stall,minFe,SF,Fcr,
    rows:[['כוח מרבי (בול + 10%)',`${fmt(Fmax/1000,0)} ≥ ${fmt(Fpk*1.1/1000,0)} kN`,Fmax>=Fpk*1.1],['לחץ שסתום פריקה (צנרת)',`${P.pr} ≤ 250 bar`,P.pr<=250],['הספק מנוע נדרש',`${fmt(Pmax,1)} ≤ ${P.Peng} kW`,Pmax<=P.Peng*1.001],
      ['זמן מחזור',`${stall?'∞':fmt(t+tr,1)} ≤ ${P.tgt} s`,!stall&&t+tr<=P.tgt],['קריסת מוט (מקדם)',`${fmt(SF,1)} ≥ 3.5`,SF>=3.5],['הבול מתפצל',stall?'NO':'OK',!stall]]};}
const SIM_SPLIT={id:'split',n:61,t:'פרויקט מסכם: מפצל בולי עץ',d:'מתכננים מפצל של 20 טון למנוע בנזין קטן: קוטר צילינדר, משאבה דו-שלבית, שסתום פריקה ומוט – ובודקים כוח, הספק, זמן מחזור וקריסה',
  P:{D:110,d:50,S:600,pump:'two',Q1:30,Q2:9,pu:50,pr:210,Peng:4.5,eta:.8,log:'oak',tgt:25,auto:true,go:0},
  key:P=>P.pump,
  ui(U,P){U.grp('תכנון');U.num(P,'D','קוטר בוכנה','mm',{min:50,max:200,step:5});U.num(P,'d','קוטר מוט','mm',{min:25,max:120,step:5});U.seg(P,'pump','משאבה',[['single','אחת'],['two','דו-שלבית']],true);
    U.num(P,'Q1','ספיקה גבוהה (שלב 1)','L/min',{min:2,max:60,step:1});U.num(P,'Q2','ספיקה נמוכה (שלב 2)','L/min',{min:1,max:20,step:.5});U.num(P,'pu','לחץ מעבר בין שלבים','bar',{min:20,max:150,step:5});U.num(P,'pr','שסתום פריקה','bar',{min:80,max:300,step:5});
    U.grp('דרישות',false);U.sel(P,'log','בול',Object.entries(LOG61).map(([k,v])=>[k,v[0]+' – '+v[1]/1000+' kN']));U.num(P,'Peng','הספק מנוע בנזין','kW',{min:1,max:20,step:.5});U.num(P,'tgt','זמן מחזור יעד','s',{min:5,max:60,step:1});U.chk(P,'auto','מחזור אוטומטי');U.btn('▶ מחזור אחד',()=>{P.go++;},'');},
  circuit:P=>{const two=P.pump==='two';const comps=[{id:'SC',type:'score',x:150,y:110,o:{w:230,h:130,t:'כרטיס בדיקות התכנון'},name:'כרטיס בדיקות'},
      {id:'C1',type:'cyl',x:440,y:80,o:{load:{t:'🪵'}},name:'צילינדר מפצל',lbl:'צילינדר',lblAt:[-80,-24]},
      {id:'V1',type:'dcv',x:440,y:210,o:{box:KIT.D43.tandem,L:'lever',center:true},name:'שסתום ידית 4/3 טנדם',lbl:'ידית',lblAt:[100,0]},
      {id:'RV',type:'pv',x:480,y:320,rot:90,o:{kind:'relief'},name:'שסתום פריקה',lbl:'פריקה',lblAt:[0,26]},{id:'T2',type:'tank',x:510,y:332,name:'מיכל'},{id:'T4',type:'tank',x:480,y:276,name:'מיכל'},
      {id:'G1',type:'gauge',x:400,y:250,net:'P',name:'מד לחץ'},
      {id:'CH',type:'chart',x:150,y:330,o:{w:230,h:110,xl:'מהלך mm',yl:'bar',t:'לחץ לאורך המהלך (כחול) · שסתום פריקה (אדום)'},name:'גרף לחץ-מהלך'}];
    const lines=[{id:'LA',net:'A',pts:['V1.A',[433,130],[390,130],'C1.A']},{id:'LB',net:'B',pts:['V1.B',[447,130],[490,130],'C1.B']},{id:'LT',net:'T',pts:['V1.T',[447,262],[480,262],'T4.t']},
      {id:'LRV',net:'P',pts:[[433,320],'RV.P']},{id:'LRT',net:'T',pts:['RV.T',[510,320],'T2.t']},{id:'LG',net:'P',pts:[[433,262],'G1.p'],nodot:true}];
    if(two){comps.push({id:'P2',type:'pump',x:433,y:380,o:{motor:false},name:'משאבה שלב 2 (לחץ גבוה, ספיקה קטנה)',lbl:'שלב 2',lblAt:[40,30]},{id:'T3',type:'tank',x:433,y:412,name:'מיכל'},
        {id:'P1',type:'pump',x:330,y:380,name:'משאבה שלב 1 (ספיקה גבוהה) + מנוע בנזין',lbl:'שלב 1',lblAt:[0,40]},{id:'T1',type:'tank',x:330,y:412,name:'מיכל'},
        {id:'CV',type:'check',x:380,y:300,rot:90,name:'אל-חוזר בין השלבים'},{id:'UV',type:'pv',x:280,y:300,rot:-90,o:{kind:'unload'},name:'שסתום פריקה מפוקד לשלב 1',lbl:'פריקה מפוקד',lblAt:[0,-26]},{id:'T5',type:'tank',x:250,y:312,name:'מיכל'});
      lines.push({id:'LP',net:'P',pts:['P2.out','V1.P']},{id:'LS2',net:'S',pts:['T3.t','P2.in']},{id:'LS1',net:'S',pts:['T1.t','P1.in']},{id:'LP1',net:'P1',pts:['P1.out',[330,300],'CV.in']},{id:'LCV',net:'P',pts:['CV.out',[433,300]]},
        {id:'LUV',net:'P1',pts:[[330,300],'UV.P']},{id:'LUT',net:'T',pts:['UV.T',[250,300],'T5.t']},{id:'LUX',net:'P',kind:'pilot',pts:[[433,340],[296,340],'UV.X']});}
    else{comps.push({id:'P1',type:'pump',x:433,y:380,name:'משאבה + מנוע בנזין',lbl:'משאבה',lblAt:[50,30]},{id:'T1',type:'tank',x:433,y:412,name:'מיכל'});lines.push({id:'LP',net:'P',pts:['P1.out','V1.P']},{id:'LS1',net:'S',pts:['T1.t','P1.in']});}
    return {comps,lines};},
  init:()=>({t:0,x:0,ph:'idle',pt:0,go:null,si:1,tc0:0,tcy:0,cyc:0,hx:[],fe:1}),
  step(P,st,dt,ctx){const f=ctx.fault;st.t+=dt;st.pt+=dt;if(st.go==null)st.go=P.go;const D=design61(P);const A1=D.A1,A2=D.A2;
    if(st.ph==='idle'&&((P.auto&&st.pt>1.2)||P.go!==st.go)){st.go=P.go;st.ph='ext';st.pt=0;st.tc0=st.t;st.hx=[];}
    let p=3,q={Q:f==='pump'?P.Q1*.5:P.Q1,Pd:0,fe:1,hi:true},v=0,F=0,stall=false;const pr=f==='relief'?P.pr*.6:P.pr;
    if(st.ph==='ext'){F=load61(P,st.x);p=H.p(F,A1)+2;if(f==='seal')p+=0;if(p>pr){p=pr;stall=true;q=pump61(P,p,f);v=0;}else{q=pump61(P,p,f);v=H.v(q.Q*(f==='seal'?.75:1),A1);}
      st.x=Math.min(P.S,st.x+v*dt);if(!st.hx.length||st.x-st.hx.at(-1)[0]>3)st.hx.push([st.x,p]);if(st.x>=P.S||(stall&&st.pt>2)){st.ph='ret';st.pt=0;}}
    else if(st.ph==='ret'){F=300;p=H.p(F,A2)+3;q=pump61(P,p,f);v=-H.v(q.Q,A2);st.x=Math.max(0,st.x+v*dt);if(st.x<=0){st.ph='idle';st.pt=0;st.cyc++;st.tcy=st.t-st.tc0;}}
    else q=pump61(P,3,f);
    st.fe=q.fe;KIT.ease(st,'si',st.ph==='ext'?0:st.ph==='ret'?2:1,dt);KIT.rpmAng(st,dt,3000*q.fe);const pm=KIT.nice(Math.max(P.pr,250)*1.05),two=P.pump==='two';
    const Qrv=stall?q.Q:0;const Qp1=two?(q.hi?P.Q1*q.fe:0):0;
    return {p:{P:p,P1:two?(q.hi?p:2):p,A:st.ph==='ext'?p:.5,B:st.ph==='ret'?p:.5,T:.5,S:-.05},
      q:{LP:two?q.Q-(q.hi?P.Q1*q.fe:0):q.Q,LP1:Qp1,LCV:Qp1,LUV:two&&!q.hi?P.Q1*q.fe:0,LUT:two&&!q.hi?P.Q1*q.fe:0,LS1:two?P.Q1*q.fe:q.Q,LS2:two?P.Q2*q.fe:0,LA:st.ph==='ext'?q.Q-Qrv:st.ph==='ret'?-q.Q*A1/A2:0,LB:st.ph==='ext'?-(q.Q-Qrv)*A2/A1:st.ph==='ret'?q.Q:0,
        LT:st.ph==='idle'?q.Q:Math.abs(st.ph==='ext'?(q.Q-Qrv)*A2/A1:q.Q*A1/A2),LRV:Qrv,LRT:Qrv,LG:0,LUX:0},
      pmax:pm,qref:P.Q1+P.Q2,D,q,F,v,stall,p,
      c:{SC:{rows:D.rows},C1:{x:st.x/P.S,uA:(st.ph==='ext'?p:.5)/pm,uB:(st.ph==='ret'?p:.5)/pm,lt:'🪵'},V1:{i:st.si},P1:{on:q.fe>.05,ang:st.ang},P2:{on:true,ang:st.ang},CV:{open:q.hi&&st.ph!=='idle'?1:0},
        CH:{s:[{p:st.hx,c:'#0b72d9'},{p:[[0,pr],[P.S,pr]],c:'#dc2626',d:true}],x:[0,P.S],y:[0,pm]}},
      read:[{k:'מהלך',v:st.x,u:'mm',max:P.S},{k:'כוח בול',v:F/1000,u:'kN'},{k:'לחץ',v:p,u:'bar',max:P.pr,w:stall},{k:'ספיקה',v:q.Q,u:'L/min'},{k:'הספק מנוע נדרש',v:q.Pd0??q.Pd,u:'kW',max:P.Peng,w:q.fe<1},
        {k:'זמן מחזור (מדוד)',v:st.tcy,u:'s',w:st.tcy>P.tgt},{k:'זמן מחזור (מחושב)',v:isFinite(D.tc)?D.tc:0,u:'s'},{k:'בדיקות שעברו',v:D.rows.filter(r=>r[2]).length,u:'/6',dg:0,max:6}]};},
  ins(P,R){const D=R.D,L=[];const fails=D.rows.filter(r=>!r[2]);
    if(!fails.length)L.push({ic:'🏆',at:'SC',h:`כל הבדיקות עברו: ${fmt(D.Fmax/1000,0)} kN, מחזור ${fmt(D.tc,1)} s, מנוע ${fmt(D.Pmax,1)} kW. תכנון מוכן!`});
    else L.push({ic:'📋',at:'SC',w:true,h:'לא עבר: '+fails.map(r=>r[0]).join(' · ')+'. שנו את הנתונים בפאנל.',c:`${fails.length} בדיקות נכשלו`});
    if(R.q.fe<1)L.push({ic:'🐌',at:'P1',w:true,h:`המנוע לא מספיק: נדרשים ${fmt(R.q.Pd0,1)} kW – הסיבובים יורדים והספיקה קטנה פי ${fmt(1/R.q.fe,1)}.`,c:'המנוע נחנק'});
    if(P.pump==='two')L.push({ic:'2️⃣',at:'UV',h:`משאבה דו-שלבית: עד ${P.pu} bar שני השלבים (${fmt(P.Q1+P.Q2,0)} L/min) – גישה מהירה; מעל זה שלב 1 נפרק למיכל ורק ${P.Q2} L/min בלחץ גבוה. כך מנוע קטן מספיק.`});
    if(R.stall)L.push({ic:'🪵',at:'C1',w:true,h:`הבול לא מתפצל: נדרש ${fmt(H.p(LOG61[P.log][1],D.A1),0)} bar ושסתום הפריקה ${P.pr} bar.`,c:'עצירה'});
    if(D.SF<3.5)L.push({ic:'📏',at:'C1',w:true,h:`המוט דק מדי למהלך ${P.S} mm: מקדם קריסה ${fmt(D.SF,1)}.`});return L;},
  calc(P,R){const D=R.D;return `<div class="kpis">${kpi('כוח מרבי',fmt(D.Fmax/1000,0),'kN')}${kpi('זמן מחזור',isFinite(D.tc)?fmt(D.tc,1):'∞','s')}${kpi('הספק מרבי',fmt(D.Pmax,2),'kW')}${kpi('מקדם קריסה',fmt(D.SF,1))}</div>`+
    det('כוח',row('',`F = p_r·A₁ = ${P.pr}·${fmt(D.A1,0)}/10 = ${V(D.Fmax/1000,'kN')} ; דרוש ${fmt(D.Fpk/1000,0)} kN + 10%`,D.Fmax>=D.Fpk*1.1),true)+
    det('משאבה ומנוע',row('',`P = p·Q/(600·η): בשיא ${fmt(H.p(D.Fpk,D.A1),0)} bar × ${P.pump==='two'?P.Q2:P.Q1} L/min → ${V(D.Pmax,'kW')} מול ${P.Peng} kW`,D.Pmax<=P.Peng*1.001)+row('',P.pump==='two'?`מתחת ל-${P.pu} bar: Q = ${P.Q1}+${P.Q2} ; מעל: Q = ${P.Q2} (שלב 1 נפרק)`:`Q = ${P.Q1} קבוע`))+
    det('זמן מחזור',row('',`t = ∫dx/v (יציאה) + S/v (חזרה) = ${fmt(D.te,1)} + ${fmt(D.tr,1)} = ${V(D.tc,'s')}`,D.tc<=P.tgt))+
    det('קריסת מוט (אוילר, ציר–ציר)',row('',`F_cr = π²·E·I/L², I = π·d⁴/64, L = S + 250 = ${P.S+250} mm → ${V(D.Fcr/1000,'kN',0)} ; מקדם = ${fmt(D.SF,1)}`,D.SF>=3.5));},
  demo:[{t:'הדרישה',x:'מפצל 20 טון למנוע בנזין של 4.5 kW, מחזור עד 25 שניות. כרטיס הבדיקות בודק כל שינוי.',reset:true,set:{pump:'single',Q1:20,Q2:9,D:110,d:50,pr:210,auto:true,log:'oak'},hl:['SC'],dur:7},
    {t:'משאבה אחת',x:'משאבה של 20 L/min ב-210 bar צריכה יותר מ-8 kW – המנוע נחנק בזמן הפיצול.',hl:['P1','SC'],dur:8},
    {t:'משאבה דו-שלבית',x:'שלב גדול לגישה מהירה ושלב קטן ללחץ גבוה: ההספק בשיא נשאר קטן, והמחזור קצר.',set:{pump:'two',Q1:30,Q2:9,pu:50},hl:['UV','CH'],dur:10},
    {t:'כוח וקריסה',x:'מחליפים לבול מסוקס (220 kN): צריך בוכנה גדולה יותר או לחץ גבוה יותר – ולבדוק את המוט.',set:{log:'knot'},hl:['SC','C1'],dur:8}],
  predict:[{q:'משאבה אחת של 20 L/min ומנוע 4.5 kW. בזמן הפיצול (~160 bar) –',set:{pump:'single',Q1:20,log:'oak',auto:true},opts:['הכול תקין','המנוע נחנק והפיצול מאט','שסתום הפריקה נפתח'],a:1,why:'P = 160·20/600/0.8 ≈ 6.7 kW > 4.5 kW.'},
    {q:'מגדילים את קוטר הבוכנה מ-110 ל-130 mm (אותה משאבה). זמן המחזור –',set:{pump:'two',D:130},opts:['יקטן','יגדל','לא ישתנה'],a:1,why:'שטח גדול יותר → מהירות קטנה יותר באותה ספיקה.'}],
  tasks:[{q:P=>`מפצל של ${fmt(LOG61[P.log][1]/1000,0)} kN בלחץ ${P.pr} bar. מה הקוטר המינימלי (בלי מרווח)?`,a:P=>Math.sqrt(4*LOG61[P.log][1]*10/P.pr/PI),u:'mm',hint:'A = F/p, D = √(4A/π).',rand:P=>{P.pr=rnd(150,250,10);P.log=pick(['soft','oak','knot']);}},
    {q:P=>`שלב 2: ${P.Q2} L/min ב-${P.pr} bar, η = ${P.eta}. כמה הספק דרוש?`,a:P=>P.pr*P.Q2/600/P.eta,u:'kW',hint:'P = p·Q/(600·η).',rand:P=>{P.Q2=pick([3,4,5,6]);P.pr=rnd(150,250,10);}}],
  faults:[{id:'pump',t:'שלב 2 של המשאבה שחוק',sym:'"הפיצול איטי מאוד, אבל הגישה לבול מהירה."',hint:'השוו את הספיקה בלחץ גבוה לספיקה הנומינלית.',why:'שלב הלחץ הגבוה נותן חצי מהספיקה.',set:{pump:'two',auto:true}},
    {id:'relief',t:'שסתום פריקה מכויל נמוך',sym:'"בולי אלון לא מתפצלים, אורן כן."',hint:'מה הלחץ המרבי בזמן פיצול?',why:'שסתום הפריקה נפתח ב-60% מהכיול – חסר כוח.',set:{pump:'two',auto:true,log:'oak'}},
    {id:'seal',t:'אטם בוכנה דולף',sym:'"היציאה איטית יותר, והמוט נסוג קצת תחת עומס."',hint:'השוו את מהירות היציאה למחושבת.',why:'25% מהשמן עובר דרך האטם לצד המוט.',set:{pump:'two',auto:true}}],
  qaT:14,
  test(H){const P=clone(this.P);const D=design61(P);const st=this.init(P);for(let k=0;k<8000&&st.cyc<1;k++)this.step(P,st,.01,{fault:null});const P1=clone(P);P1.pump='single';P1.Q1=20;const D1=design61(P1);
    return [['כוח = p·A',D.Fmax,210*H.A(110)/10],['זמן מחזור: מחושב = מדוד',st.tcy,D.tc,.03],['דו-שלבית בתוך הספק המנוע',+(D.Pmax<=4.5),1],['משאבה אחת חונקת את המנוע',+(D1.Pmax>4.5),1],['אוילר',D.Fcr,PI*PI*210e3*(PI*50**4/64)/(850*850)]];}};

LABS.push({ch:23,title:'מידול, סימולציה ותכנון',sims:[SIM_SAND,SIM_SPLIT]});
}
