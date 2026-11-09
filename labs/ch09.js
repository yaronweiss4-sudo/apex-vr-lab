/* lab 9 – same code as the website */
{




/* ===================== Chapter 9 – basic actuator circuits (sims 34, 35) ===================== */

/* ---------- 34 · safe first start-up ---------- */
const S34=[['c1','בדיקת מפלס, מסננים וחיבורים'],['c2','שסתום הפיקוד במצב אמצעי'],['c3','כיול שסתום הפריקה במינימום'],['c4','הפעלה קצרה (Jog) – בדיקת כיוון סיבוב'],['c5','ניקוז אוויר: מחזורים איטיים בלחץ נמוך'],['c6','העלאת לחץ בהדרגה לכיול העבודה'],['c7','בדיקת דליפות בלחץ עבודה']];
const SIM_START={id:'start',n:34,t:'הפעלה ראשונה בטוחה',d:'רשימת תיוג: שסתום פריקה מינימלי, הפעלה, ניקוז אוויר, העלאת לחץ – ומה קורה כשמדלגים על שלב',
  P:{pos:'b',knob:140,target:100,Q:20,D:63,dr:36,S:300,F:4000,pump:false,bleed:false,auto:false},
  ui(U,P){U.grp('פעולות');U.btn('🔍 בדיקת מפלס ומסננים',()=>{APP.st.done.c1=true;});U.btn('⚡ הפעלה קצרה (Jog)',()=>{APP.st.jog=1.2;APP.st.done.c4=APP.st.done.c4||APP.st.dirOK;});U.chk(P,'pump','משאבה פועלת');
    U.seg(P,'pos','ידית שסתום',KIT.pos3);U.chk(P,'auto','מחזור אוטומטי');U.num(P,'knob','כיול שסתום פריקה (ידית)','bar',{min:5,max:200,step:5});U.chk(P,'bleed','בורג ניקוז אוויר פתוח');U.btn('💧 בדיקת דליפות',()=>{if(APP.R&&APP.R.pP>=P.target*.9)APP.st.done.c7=true;});
    U.grp('נתונים',false);U.num(P,'target','לחץ עבודה מתוכנן','bar',{min:30,max:200,step:5});U.num(P,'F','עומס','N',{min:0,max:50000,step:500});U.btn('↺ התחלה מחדש',()=>{Object.assign(APP.P,clone(SIM_START.P));APP.st=SIM_START.init(APP.P);});},
  circuit:P=>({comps:[{id:'C1',type:'cyl',x:300,y:60,o:{load:{t:'F'}},name:'צילינדר חדש – מלא אוויר',lbl:'צילינדר',lblAt:[-80,-22],l3:[0,-34]},
      {id:'V1',type:'dcv',x:300,y:170,o:{box:KIT.D43.closed,L:'lever',center:true},name:'שסתום 4/3 מרכז סגור (לחיצה מחליפה מצב)',lbl:'4/3',lblAt:[80,4]},
      {id:'P1',type:'pump',x:200,y:290,name:'משאבה + מנוע (לחיצה מפעילה/מפסיקה)',lbl:'משאבה',lblAt:[30,6]},{id:'T1',type:'tank',x:200,y:335,name:'מיכל'},
      {id:'RV',type:'pv',x:150,y:240,rot:-90,o:{kind:'relief'},name:'שסתום פריקה – ידית הכיול',lbl:'פריקה',lblAt:[0,-30]},{id:'T2',type:'tank',x:110,y:270,name:'מיכל'},{id:'T3',type:'tank',x:380,y:240,name:'מיכל'},
      {id:'BS',type:'sv',x:385,y:100,name:'בורג ניקוז אוויר בצד המוט בוכנה',lbl:'ניקוז',lblAt:[24,4]},{id:'T4',type:'tank',x:385,y:126,name:'כלי איסוף'},
      {id:'G1',type:'gauge',x:245,y:228,net:'P',name:'מד לחץ משאבה'},{id:'G2',type:'gauge',x:270,y:108,net:'A',name:'מד לחץ קו A'}],
    lines:[{id:'LS',net:'S',pts:['T1.t','P1.in']},{id:'LP',net:'P',pts:['P1.out',[200,240],[293,240],'V1.P']},{id:'LRV',net:'P',pts:[[200,240],'RV.P']},{id:'LRT',net:'T',pts:['RV.T',[110,240],'T2.t']},
      {id:'LA',net:'A',pts:['V1.A',[293,120],[250,120],'C1.A']},{id:'LB',net:'B',pts:['V1.B',[307,120],[350,120],'C1.B']},{id:'LBS',net:'B',pts:[[350,120],[385,120],[385,112]],nodot:true},{id:'LT',net:'T',pts:['V1.T',[307,215],[380,215],'T3.t']}]}),
  init:P=>({x:0,xc:0,si:KIT.idx[P.pos],air:.85,buf:0,done:{},haz:[],last:0,pumpWas:false,jog:0,dirOK:true,pt:[],steps:[],tmax:0,ph:0,ang:0,mist:0}),
  click(id,P){if(id==='V1'){P.pos=P.pos==='a'?'0':P.pos==='0'?'b':'a';P.auto=false;return true;}if(id==='P1'){P.pump=!P.pump;return true;}if(id==='BS'){P.bleed=!P.bleed;return true;}},
  step(P,st,dt,ctx){const f=ctx.fault;const A1=H.A(P.D),A2=H.Aann(P.D,P.dr);const haz=(k,t)=>{if(!st.haz.find(h=>h[0]===k))st.haz.push([k,t]);};
    const running=P.pump||st.jog>0;if(st.jog>0)st.jog-=dt;
    if(running&&!st.pumpWas){ // start-up moment
      if(P.pos!=='0')haz('shift','הופעל כשהשסתום לא במרכז – הצילינדר זינק מיד.');else st.done.c2=true;
      if(P.knob>40)haz('high','הופעל עם שסתום פריקה מכויל גבוה – אם משהו חסום, הלחץ קופץ מיד לכיול.');else st.done.c3=true;
      if(f==='rot')st.dirOK=false;}
    st.pumpWas=running;
    const dir=running?KIT.dirOf(P.pos):0;const atEnd=(dir>0&&st.x>=P.S-1e-6)||(dir<0&&st.x<=1e-6);const pr=P.knob;const Qp=running&&st.dirOK?P.Q:0;
    let r={v:0,ps:0,Qr:0,pIn:0,pOut:0,stall:true};if(Qp>0)r=dir>0?H.lin({Qp,pr,Ain:A1,Aout:A2,F:atEnd?1e9:P.F}):dir<0?H.lin({Qp,pr,Ain:A2,Aout:A1,F:atEnd?1e9:-P.F*.2}):H.lin({Qp,pr,Ain:A1,Aout:A2,F:1e9});
    // trapped air: oil first compresses the air, then the piston "jumps" (stick–slip)
    const v=r.v;st.xc=clamp(st.xc+dir*v*dt,0,P.S);const lag=st.xc-st.x;const thr=2+st.air*(r.ps>40?12:30);let jump=false;
    if(Math.abs(lag)>thr||st.air<.12){const d=st.air<.12?lag:lag;st.x+=d;if(Math.abs(d)>8&&st.air>.3){jump=true;if(r.ps>50)haz('jump','אוויר לא נוקז והלחץ הועלה – הצילינדר קפץ בבת אחת.');}}
    if(dir!==0&&atEnd&&Math.abs(st.xc-st.x)<1)st.cyc=(st.cyc||0)+(st.endWas?0:1);st.endWas=atEnd&&dir!==0;
    if(running&&dir!==0&&r.ps<35&&atEnd)st.air=Math.max(0,st.air-dt*.12);   // full slow strokes at low pressure purge air to the tank
    if(P.bleed&&running&&r.ps<40)st.air=Math.max(0,st.air-dt*.25);if(P.bleed&&r.ps>=40){haz('bleedhp','בורג הניקוז נפתח בלחץ גבוה – סילון שמן מסוכן.');st.mist=1;}
    if(st.air<.1&&running)st.done.c5=true;
    // pressure raising: count steps of the knob while running
    if(running&&Math.abs(P.knob-st.last)>=5){if(P.knob-st.last>60&&st.done.c3)haz('leap','הלחץ הועלה בקפיצה אחת – אין הזדמנות לגלות דליפה או בעיה.');st.steps.push(P.knob);st.last=P.knob;}
    if(!running)st.last=P.knob;
    if(running&&P.knob>=P.target*.95&&st.steps.length>=3&&!st.haz.find(h=>h[0]==='leap'))st.done.c6=true;
    KIT.autoCycle(P,st,dt,atEnd&&dir!==0,.6);KIT.ease(st,'si',KIT.idx[P.pos],dt);if(running)KIT.rpmAng(st,dt,st.dirOK?1450:-1450);
    const pP=running?r.ps:0;const pm=200;let pA=0,pB=0,qA=0,qB=0;if(dir>0){pA=r.stall?pP:r.pIn;pB=r.pOut;qA=r.Qin;qB=-r.Qout;}else if(dir<0){pB=r.stall?pP:r.pIn;pA=r.pOut;qB=r.Qin;qA=-r.Qout;}
    if(!running){pA=0;pB=0;}
    st.tmax=Math.max(st.tmax,pP);const score=Object.keys(st.done).length;
    return {p:{P:pP,A:pA,B:pB,T:.4,S:running?-.05:0},q:{LS:Qp,LP:dir?r.Qin:0,LRV:r.Qr,LRT:r.Qr,LA:qA,LB:qB,LT:dir?r.Qout:0,LBS:P.bleed&&running?2:0},pmax:pm,qref:P.Q,pP,r,jump,score,haz:st.haz,air:st.air,
      c:{C1:{x:st.x/P.S,uA:pA/pm,uB:pB/pm,lt:`${fmt(P.F/1000,1)} kN`},V1:{i:st.si},P1:{on:running,ang:st.ang},RV:{open:clamp(r.Qr/Math.max(P.Q,1),0,1),set:P.knob},BS:{closed:!P.bleed},G1:{p:pP},G2:{p:pA}},
      read:[{k:'שלבים שבוצעו',v:score,u:'/7',max:7},{k:'אירועי סכנה',v:st.haz.length,u:'',dg:0,w:st.haz.length>0},{k:'אוויר בצילינדר',v:st.air*100,u:'%',max:100,w:st.air>.3},{k:'לחץ משאבה',v:pP,u:'bar'},{k:'כיול שסתום פריקה',v:P.knob,u:'bar'},{k:'מיקום',v:st.x,u:'mm',max:P.S}]};},
  ins(P,R){const L=[];const st=APP.st||{done:{}};const next=S34.find(([k])=>!(st.done||{})[k]);
    if(next)L.push({ic:'📋',h:`השלב הבא ברשימה: <b>${next[1]}</b>.`});else L.push({ic:'🏆',h:'כל שבעת השלבים בוצעו – המערכת מוכנה לעבודה.'});
    R.haz.forEach(([k,t])=>L.push({ic:'⚠️',w:true,at:k==='bleedhp'?'BS':k==='jump'?'C1':k==='shift'?'V1':'RV',h:t,c:t}));
    if(R.air>.3&&P.pump)L.push({ic:'🫧',at:'C1',h:`יש עוד ${fmt(R.air*100,0)}% אוויר: השמן דוחס אותו קודם, והצילינדר מתקדם בקפיצות. מנקזים במחזורים איטיים בלחץ נמוך.`});
    if(!st.dirOK)L.push({ic:'🔄',w:true,at:'P1',h:'המשאבה מסתובבת הפוך – אין ספיקה. החליפו שני פאזות במנוע לפני הפעלה מלאה.',c:'כיוון סיבוב הפוך'});
    L.push({ic:'✅',h:S34.map(([k,t])=>`<div dir="rtl">${(st.done||{})[k]?'☑':'☐'} ${t}</div>`).join('')});return L;},
  calc(P,R){const A1=H.A(P.D);return `<div class="kpis">${kpi('לחץ להזזת העומס',fmt(H.p(P.F,A1),1),'bar')}${kpi('מהירות יציאה',fmt(H.v(P.Q,A1),1),'mm/s')}${kpi('כיול מינימלי מומלץ',fmt(H.p(P.F,A1)*1.2+5,0),'bar')}${kpi('לחץ שיא שנמדד',fmt(APP.st?APP.st.tmax:0,0),'bar')}</div>`+
    det('למה מתחילים בשסתום הפריקה נמוך',row('',`לחץ להזזת העומס: p = F/A₁ = ${fmt(P.F,0)}·10/${fmt(A1,0)} = ${V(H.p(P.F,A1),'bar')}`)+row('','מספיק כיול מעט מעל זה כדי לנקז אוויר. כל עודף רק מגדיל את הנזק אם משהו חסום.'),true)+
    det('אוויר כקפיץ',row('',`נפח האוויר נדחס לפי pV = const – בלחץ גבוה הוא מתכווץ פתאום והבוכנה "קופצת".`));},
  demo:[{t:'מערכת חדשה',x:'צילינדר חדש מלא אוויר, ושסתום הפריקה כויל במפעל ל-140 bar. לפני שמפעילים – רשימת תיוג.',reset:true,hl:['C1','RV']},
    {t:'שסתום במרכז, שסתום פריקה למטה',x:'מעבירים את הידית למרכז ומורידים את כיול שסתום הפריקה ל-20 bar. כך גם אם משהו חסום – הלחץ נמוך.',set:{pos:'0',knob:20},act:(P,st)=>{st.done.c1=true;},hl:['V1','RV']},
    {t:'הפעלה וניקוז אוויר',x:'מפעילים את המשאבה ומריצים מחזורים איטיים בלחץ נמוך – האוויר נדחף החוצה עם השמן. בורג הניקוז מזרז את זה.',set:{pump:true,auto:true,bleed:true},hl:['C1','BS'],dur:10},
    {t:'העלאת לחץ בהדרגה',x:'סוגרים את הניקוז ומעלים את הכיול בצעדים: 40, 70, 100 bar – ובודקים דליפות בכל צעד.',set:{bleed:false,knob:40},act:(P,st)=>{setTimeout(()=>{P.knob=70;},1500);setTimeout(()=>{P.knob=100;},3000);},hl:['RV','G1'],dur:8},
    {t:'מה קורה אם מדלגים',x:'אם מפעילים בלחץ גבוה עם אוויר בצילינדר, הבוכנה נעצרת, האוויר נדחס, ואז היא קופצת קדימה בבת אחת – מסוכן לאנשים ולמכונה.',reset:true,set:{pos:'a',knob:140,pump:true},hl:['C1'],dur:8}],
  predict:[{q:'מפעילים משאבה כשהידית במצב a. מה יקרה?',set:{pos:'a',knob:20},go:P=>{P.pump=true;},opts:['שום דבר','הצילינדר יזוז מיד','רק הלחץ יעלה'],a:1,why:'השסתום כבר מחבר P→A – ברגע שיש ספיקה הצילינדר זז, ואולי מישהו עומד בדרך.'},
    {q:'יש 80% אוויר בצילינדר ושסתום הפריקה על 140 bar. איך ינוע הצילינדר?',set:{pos:'0',knob:140},go:P=>{P.pump=true;P.pos='a';},opts:['חלק ורציף','בקפיצות פתאומיות','לא יזוז'],a:1,why:'האוויר נדחס ואז משתחרר – תנועת "Stick-slip" עם קפיצות.'}],
  tasks:[{q:P=>`עומס ${P.F} N על בוכנה Ø${P.D}. מה הלחץ המינימלי להזזתו?`,a:P=>H.p(P.F,H.A(P.D)),u:'bar',hint:'p = F/A.',rand:P=>{P.F=rnd(2000,30000,500);P.D=pick([40,50,63,80]);}},
    {q:()=>'בועת אוויר של 20 cm³ ב-1 bar מוחלט נדחסת ל-101 bar מוחלט. מה נפחה (cm³)?',a:()=>20/101,u:'cm³',hint:'p₁V₁ = p₂V₂ (איזותרמי).'}],
  faults:[{id:'rot',t:'המנוע מחובר בכיוון סיבוב הפוך',sym:'"הפעלנו, המשאבה מרעישה ולא קורה כלום."',hint:'מה מראה מד הלחץ אחרי ה-Jog? והספיקה?',why:'המשאבה מסתובבת הפוך ולא שואבת – לכן בודקים כיוון סיבוב בהפעלה קצרה.',set:{pos:'0',knob:20,pump:true}}],
  qaT:6,
  test(H){const P=clone(this.P);P.pos='0';P.knob=20;P.pump=true;const st=this.init(P);let R;for(let t=0;t<.6;t+=.02)R=this.step(P,st,.02,{});const P2=clone(P);P2.pos='a';P2.knob=200;const st2=this.init(P2);st2.air=0;let R2;for(let t=0;t<.5;t+=.02)R2=this.step(P2,st2,.02,{});
    return [['הפעלה נכונה: בלי סכנות',R.haz.length,0],['מרכז סגור: לחץ = כיול',R.pP,H.lin({Qp:20,pr:20,Ain:H.A(63),Aout:H.Aann(63,36),F:1e9}).ps,.01],['v = Q/A בלי אוויר',R2.r.v,H.v(20,H.A(63)),.02]];}};

/* ---------- 35 · 4/3 centre conditions with a hanging load ---------- */
const CEN4={closed:['סגור','A, B, P, T חסומים'],open:['פתוח','הכול מחובר ל-T'],tandem:['טנדם','P→T, A ו-B חסומים'],float:['צף','A, B→T, P חסום']};
const SIM_CENTERS={id:'centers',n:35,t:'מרכזי 4/3 תחת עומס',d:'במצב מרכזי: העומס נעול או צונח, והמשאבה פורקת או עובדת על שסתום פריקה; מד חום',
  P:{cen:'closed',pos:'0',m:800,D:50,dr:28,S:300,Q:20,pr:120,leak:1},
  key:P=>P.cen,
  ui(U,P){U.grp('מרכז השסתום');U.seg(P,'cen','סוג',Object.entries(CEN4).map(([k,v])=>[k,v[0],v[1]]),true);U.seg(P,'pos','ידית',KIT.pos3);
    U.grp('עומס וצילינדר');U.num(P,'m','מסה תלויה','kg',{min:0,max:5000,step:50});U.num(P,'D','קוטר בוכנה','mm',{min:25,max:150,step:5});
    U.grp('משאבה',false);U.num(P,'Q','ספיקה','L/min',{min:2,max:100,step:1});U.num(P,'pr','כיול שסתום פריקה','bar',{min:20,max:300,step:5});U.btn('↺ איפוס טמפרטורה',()=>{APP.st.T=30;APP.st.hist=[];});},
  circuit:P=>({comps:[{id:'C1',type:'cyl',x:330,y:70,rot:-90,o:{load:{t:'m'}},name:'צילינדר אנכי עם עומס תלוי על המוט',lbl:'עומס',lblAt:[-40,-110],l3:[0,-60]},
      {id:'V1',type:'dcv',x:300,y:240,o:{box:KIT.D43[P.cen],L:'lever',center:true},name:`שסתום 4/3 מרכז ${CEN4[P.cen][0]} (לחיצה מחליפה מצב)`,lbl:'4/3 '+CEN4[P.cen][0],lblAt:[96,4]},
      {id:'P1',type:'pump',x:200,y:360,name:'משאבה קבועה',lbl:'משאבה',lblAt:[30,6]},{id:'T1',type:'tank',x:200,y:405,name:'מיכל'},
      {id:'RV',type:'pv',x:150,y:310,rot:-90,o:{kind:'relief'},name:'שסתום פריקה',lbl:'פריקה',lblAt:[0,-30]},{id:'T2',type:'tank',x:110,y:340,name:'מיכל'},{id:'T3',type:'tank',x:390,y:312,name:'מיכל'},
      {id:'G1',type:'gauge',x:245,y:298,net:'P',name:'מד לחץ משאבה'},{id:'G2',type:'gauge',x:262,y:183,net:'A',name:'מד לחץ צד מלא (מחזיק את העומס)',valAt:[-14,-6]},
      {id:'CH',type:'chart',x:520,y:150,o:{w:170,h:100,xl:'זמן',yl:'°C',t:'טמפרטורת השמן'},name:'גרף טמפרטורת השמן'}],
    lines:[{id:'LS',net:'S',pts:['T1.t','P1.in']},{id:'LP',net:'P',pts:['P1.out',[200,310],[293,310],'V1.P']},{id:'LRV',net:'P',pts:[[200,310],'RV.P']},{id:'LRT',net:'T',pts:['RV.T',[110,310],'T2.t']},
      {id:'LA',net:'A',pts:['V1.A',[293,195],[350,195],[350,120],'C1.A']},{id:'LG2',net:'A',pts:[[293,195],'G2.p'],nodot:true},{id:'LB',net:'B',pts:['V1.B',[307,212],[370,212],[370,20],'C1.B']},{id:'LT',net:'T',pts:['V1.T',[307,285],[390,285],'T3.t']}]}),
  init:P=>({x:.6*P.S,si:1,T:30,hist:[],th:0}),
  click(id,P){if(id==='V1'){P.pos=P.pos==='a'?'0':P.pos==='0'?'b':'a';return true;}},
  step(P,st,dt,ctx){const f=ctx.fault;const cen=f==='wrong'?'float':P.cen;const A1=H.A(P.D),A2=H.Aann(P.D,P.dr);const W=P.m*G;const pL=W*10/A1;const dir=KIT.dirOf(P.pos);
    const atEnd=(dir>0&&st.x>=P.S-1e-6)||(dir<0&&st.x<=1e-6);let pP=0,pA=pL,pB=0,v=0,Qr=0,qA=0,qB=0,qT=0,qP=0,heat=0;const pr=f==='relief'?P.pr*.4:P.pr;
    if(dir!==0){const r=dir>0?H.lin({Qp:P.Q,pr,Ain:A1,Aout:A2,F:atEnd?1e9:W}):H.lin({Qp:P.Q,pr,Ain:A2,Aout:A1,F:atEnd?1e9:-W,kOut:H.orK(25)});v=dir*r.v;pP=r.ps;Qr=r.Qr;
      if(dir>0){pA=r.stall&&!atEnd?r.ps:(atEnd?r.ps:r.pIn);pB=r.pOut;qA=r.Qin;qB=-r.Qout;qT=r.Qout;}else{pB=r.stall?r.ps:Math.max(r.pIn,H.PVAC);pA=r.pOut;qB=r.Qin;qA=-r.Qout;qT=r.Qout;}qP=r.Qin;heat=r.Ploss+H.kW(Math.max(r.ps,0),r.Qr);}
    else{const kSp=f==='worn'?.25:.006*P.leak;const blockA=cen==='closed'||cen==='tandem';const unload=cen==='open'||cen==='tandem';
      if(blockA){const ql=H.orQ(kSp,pL);v=st.x>0?-H.v(ql,A1):0;pA=st.x>0?pL:0;qA=-ql;}else{const k=H.orK(18);const ql=H.orQ(k,pL);v=st.x>0?-H.v(ql,A1):0;pA=st.x>0?Math.max((ql/k)**2,0):0;pA=st.x>0?pL:0;qA=st.x>0?-ql:0;qT=-qA;pB=cen==='float'||cen==='open'?(st.x>0?H.PVAC*.6:0):0;}
      if(unload){pP=f==='tandemleak'?pr*.5:3;heat=H.kW(pP,P.Q);qT+=P.Q;}else{pP=pr+Math.max(3,.06*pr)*.5;Qr=P.Q;heat=H.kW(pP,P.Q);}}
    st.x=clamp(st.x+v*dt,0,P.S);KIT.ease(st,'si',KIT.idx[P.pos],dt);KIT.rpmAng(st,dt,1450);
    st.T+=(heat-.04*P.Q/20*(st.T-30))/2.5*dt*3;st.T=clamp(st.T,10,120);st.th+=dt;if(!st.hist.length||st.th-st.hist.at(-1)[0]>=.25){st.hist.push([st.th,st.T]);if(st.hist.length>240)st.hist.shift();}
    const pm=KIT.nice(Math.max(pr,pL)*1.1);const t0=st.hist.length?st.hist[0][0]:0;
    return {p:{P:pP,A:pA,B:pB,T:.5,S:-.05},q:{LS:P.Q,LP:qP||(cen==='open'||cen==='tandem'?P.Q:0),LRV:Qr,LRT:Qr,LA:qA,LB:qB,LT:qT},pmax:pm,qref:P.Q,vac:pB<0,pL,heat,v,cen,A1,
      c:{C1:{x:st.x/P.S,uA:pA/pm,uB:pB/pm,lt:`${fmt(P.m,0)} kg`},V1:{i:st.si},P1:{on:true,ang:st.ang},RV:{open:clamp(Qr/P.Q,0,1)},G2:{p:pA},CH:{s:[{p:st.hist,c:'#dc2626'}],x:[t0,Math.max(t0+20,st.th)],y:[20,100]}},
      read:[{k:'מיקום העומס',v:st.x,u:'mm',max:P.S},{k:'מהירות',v:v,u:'mm/s'},{k:'לחץ החזקה F/A₁',v:pL,u:'bar'},{k:'לחץ משאבה',v:pP,u:'bar'},{k:'הספק שהופך לחום',v:heat,u:'kW',w:heat>2},{k:'טמפרטורת שמן',v:st.T,u:'°C',max:100,w:st.T>65}]};},
  ins(P,R){const L=[];const c=CEN4[R.cen];if(P.pos==='0'){const hold=R.cen==='closed'||R.cen==='tandem',unl=R.cen==='open'||R.cen==='tandem';
      L.push({ic:hold?'🔒':'⬇️',w:!hold,at:'C1',h:hold?`מרכז ${c[0]}: A חסום – העומס מוחזק בלחץ ${fmt(R.pL,1)} bar (זחילה איטית בגלל דליפת ספול (מגופה)).`:`מרכז ${c[0]}: A מחובר למיכל – העומס <b>צונח</b> במהירות ${fmt(Math.abs(R.v),1)} mm/s.`,c:hold?null:'העומס צונח!'});
      L.push({ic:unl?'😌':'🔥',w:!unl,at:unl?'P1':'RV',h:unl?`P מחובר ל-T: המשאבה פורקת בלחץ נמוך – רק ${fmt(R.heat,2)} kW חום.`:`P חסום: כל הספיקה עוברת בשסתום הפריקה – <b>${fmt(R.heat,2)} kW</b> הופכים לחום, והשמן מתחמם.`,c:unl?null:`${fmt(R.heat,1)} kW חום בשסתום הפריקה`});
      L.push({ic:'💡',h:'למעגל עם עומס תלוי ומשאבה קבועה, מרכז טנדם הוא הבחירה הטבעית: מחזיק את העומס ופורק את המשאבה. להחזקה ארוכה מוסיפים אל-חוזר מפוקד או שסתום איזון עומס.'});}
    else L.push({ic:'↕️',at:'C1',h:P.pos==='a'?`הרמה: הלחץ בצד המלא ${fmt(R.pL,1)} bar נדרש רק כדי לשאת את המסה.`:'הורדה: העומס מושך – הצמצם בקו מגביל את המהירות.'});return L;},
  calc(P,R){const hp=H.kW(P.pr,P.Q);return `<div class="kpis">${kpi('לחץ החזקה',fmt(R.pL,1),'bar')}${kpi('חום – P חסום',fmt(hp,2),'kW')}${kpi('חום – פריקה',fmt(H.kW(3,P.Q),2),'kW')}${kpi('חום עכשיו',fmt(R.heat,2),'kW')}</div>`+
    det('לחץ החזקה',row('',`p = m·g/A₁ = ${P.m}·9.81·10/${fmt(R.A1,0)} = ${V(R.pL,'bar')}`),true)+det('חום',row('P חסום (סגור/צף)',`P = p_set·Q/600 = ${P.pr}·${P.Q}/600 = ${V(hp,'kW')}`)+row('P→T (פתוח/טנדם)',`P ≈ 3·${P.Q}/600 = ${V(H.kW(3,P.Q),'kW')}`),true)+
    det('צניחה דרך הספול',row('',`Q = k·√p → v = Q/A₁`));},
  demo:[{t:'עומס תלוי',x:'צילינדר אנכי מחזיק מסה של 800 kg. כשהשסתום במרכז – מה מחזיק את העומס ולאן הולכת הספיקה של המשאבה?',reset:true,hl:['C1','V1']},
    {t:'מרכז סגור',x:'הכול חסום: העומס מוחזק, אבל המשאבה דוחפת לשסתום הפריקה – הטמפרטורה עולה.',set:{cen:'closed'},hl:['RV','CH'],dur:8},
    {t:'מרכז פתוח',x:'הכול מחובר למיכל: המשאבה פורקת – אבל העומס צונח!',set:{cen:'open'},act:(P,st)=>{st.x=.8*P.S;},hl:['C1'],dur:7},
    {t:'מרכז צף',x:'A ו-B למיכל, P חסום: העומס צונח וגם המשאבה על שסתום הפריקה – הגרוע מכולם כאן.',set:{cen:'float'},act:(P,st)=>{st.x=.8*P.S;},hl:['C1','RV'],dur:7},
    {t:'מרכז טנדם',x:'A ו-B חסומים, P→T: העומס מוחזק והמשאבה פורקת בלחץ נמוך – הטמפרטורה יציבה.',set:{cen:'tandem'},act:(P,st)=>{st.x=.8*P.S;},hl:['V1','CH'],dur:9}],
  predict:[{q:'מרכז פתוח, העומס למעלה. מה יקרה כשהידית באמצע?',set:{cen:'open',pos:'0'},act:(P,st)=>{st.x=.8*P.S;},opts:['העומס יישאר','העומס יצנח','העומס יעלה'],a:1,why:'A מחובר ל-T – אין מה שיחזיק את השמן בצד המלא.'},
    {q:'באיזה מרכז השמן מתחמם הכי מהר בזמן המתנה?',set:{cen:'closed',pos:'0'},opts:['פתוח','טנדם','סגור'],a:2,why:'P חסום – כל הספיקה עוברת בשסתום הפריקה בלחץ מלא.'},
    {q:'מרכז טנדם: לחץ המשאבה בזמן המתנה יהיה –',set:{cen:'tandem',pos:'0'},opts:['כיול שסתום הפריקה','כמה bar בלבד','לחץ החזקת העומס'],a:1,why:'P מחובר ל-T דרך הספול – רק מפל הלחץ בספול.'}],
  tasks:[{q:P=>`מסה ${P.m} kg על בוכנה Ø${P.D}. מה לחץ ההחזקה?`,a:P=>P.m*G*10/H.A(P.D),u:'bar',hint:'p = m·g/A.',rand:P=>{P.m=rnd(200,4000,50);P.D=pick([40,50,63,80]);}},
    {q:P=>`משאבה ${P.Q} L/min בהמתנה על שסתום פריקה ${P.pr} bar. כמה kW חום?`,a:P=>P.pr*P.Q/600,u:'kW',hint:'P = p·Q/600.',rand:P=>{P.Q=rnd(10,80,5);P.pr=rnd(80,250,10);}}],
  faults:[{id:'worn',t:'ספול שחוק – דליפה מ-A ל-T',sym:'"במרכז סגור העומס יורד לאט כמה מ"מ בדקה."',hint:'עקבו אחרי מיקום העומס במרכז.',why:'מרווח גדול בספול – השמן בורח מהצד המלא.',set:{cen:'closed',pos:'0'}},
    {id:'wrong',t:'הורכב שסתום עם מרכז צף במקום טנדם',sym:'"העומס יורד כשמשחררים את הידית, והשמן חם."',hint:'מה קורה ללחץ החזקה ולמשאבה במרכז?',why:'השסתום שהותקן הוא צף: A→T (צניחה) ו-P חסום (חום).',set:{cen:'tandem',pos:'0'}},
    {id:'tandemleak',t:'מעבר P→T בספול חלקית סתום',sym:'"במרכז טנדם המשאבה עדיין חמה ומרעישה."',hint:'מה לחץ המשאבה במרכז?',why:'המעבר P→T סתום חלקית – המשאבה עובדת בלחץ גבוה במקום לפרוק.',set:{cen:'tandem',pos:'0'}}],
  qaT:6,
  test(H){const P=clone(this.P);const st=this.init(P);const R=this.step(P,st,.02,{});const P2=clone(P);P2.cen='open';const st2=this.init(P2);const R2=this.step(P2,st2,.02,{});
    return [['p = mg/A',R.pL,800*G*10/H.A(50)],['חום מרכז סגור ≈ p·Q/600',R.heat,H.kW(120+Math.max(3,.06*120)*.5,20)],['מרכז פתוח: v = k√p/A',-R2.v,H.v(H.orQ(H.orK(18),R2.pL),H.A(50)),.01],['UI לחץ החזקה',R.read[2].v,R.pL]];}};

LABS.push({ch:9,title:'מעגלי בסיס – הפעלת מפעיל',sims:[SIM_START,SIM_CENTERS]});
}
