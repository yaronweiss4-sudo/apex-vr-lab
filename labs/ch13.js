/* lab 13 – same code as the website */
{




/* ===================== Chapter 13 – sequence circuits (sim 42) ===================== */
const SIM_SEQ={id:'seqdrill',n:42,t:'הידוק וקידוח בשסתום רצף',d:'מהדק קודם, קידוח רק אחרי עליית לחץ; כיוון שגוי = קידוח לפני הידוק',
  P:{ps1:50,ps2:30,pr:140,Q:16,Dc:50,Dd:63,Fcm:3000,Fcut:20000,Fdr:2500,pos:'a',auto:true},
  ui(U,P){U.grp('שסתומי רצף');U.num(P,'ps1','סדר 1 – התחלת קידוח','bar',{min:5,max:250,step:5});U.num(P,'ps2','סדר 2 – שחרור המהדק','bar',{min:5,max:250,step:5});U.num(P,'pr','כיול שסתום פריקה','bar',{min:20,max:300,step:5});
    U.grp('מכונה');U.seg(P,'pos','ידית',KIT.pos3);U.chk(P,'auto','מחזור אוטומטי');U.num(P,'Fcm','כוח להזזת המהדק','N',{min:0,max:20000,step:500});U.num(P,'Fcut','כוח קידוח','N',{min:0,max:60000,step:500});
    U.grp('צילינדרים',false);U.num(P,'Dc','קוטר מהדק','mm',{min:25,max:100,step:5});U.num(P,'Dd','קוטר קידוח','mm',{min:25,max:125,step:5});U.num(P,'Q','ספיקה','L/min',{min:2,max:60,step:1});U.btn('↺ איפוס אירועים',()=>{APP.st.haz=[];});},
  circuit:P=>({comps:[{id:'C1',type:'cyl',x:140,y:60,o:{load:{t:'▣'}},name:'צילינדר מהדק',lbl:'מהדק',lblAt:[-82,-22],l3:[0,-34]},{id:'C2',type:'cyl',x:430,y:60,o:{load:{t:'⚙'}},name:'צילינדר קידוח (הזנת המקדח)',lbl:'קידוח',lblAt:[-82,-22],l3:[0,-34]},
      {id:'V1',type:'dcv',x:300,y:230,o:{box:KIT.D43.tandem,L:'lever',center:true},name:'שסתום 4/3 מרכז טנדם (לחיצה מחליפה מצב)',lbl:'4/3',lblAt:[82,4]},
      {id:'SQ1',type:'pv',x:380,y:140,o:{kind:'seq'},name:'שסתום רצף 1 – פותח לקידוח רק אחרי שהמהדק סגור',lbl:'רצף 1',lblAt:[40,-20]},{id:'CK1',type:'check',x:340,y:140,rot:180,name:'אל-חוזר עוקף – חזרת המקדח',lbl:'',lblAt:[0,0]},
      {id:'SQ2',type:'pv',x:230,y:140,o:{kind:'seq'},name:'שסתום רצף 2 – משחרר את המהדק רק אחרי שהמקדח חזר',lbl:'רצף 2',lblAt:[-2,-28]},{id:'CK2',type:'check',x:200,y:140,rot:180,name:'אל-חוזר עוקף – יציאת המהדק',lbl:'',lblAt:[0,0]},
      {id:'T5',type:'tank',x:430,y:170,name:'ניקוז'},{id:'T6',type:'tank',x:262,y:176,name:'ניקוז'},
      {id:'P1',type:'pump',x:200,y:350,name:'משאבה',lbl:'משאבה',lblAt:[34,6]},{id:'T1',type:'tank',x:200,y:395,name:'מיכל'},{id:'RV',type:'pv',x:150,y:300,rot:-90,o:{kind:'relief'},name:'שסתום פריקה',lbl:'פריקה',lblAt:[0,-30]},{id:'T2',type:'tank',x:110,y:312,name:'מיכל'},
      {id:'T3',type:'tank',x:380,y:287,name:'מיכל'},{id:'G1',type:'gauge',x:245,y:288,net:'P',name:'מד לחץ משאבה'},{id:'G2',type:'gauge',x:60,y:120,net:'A',name:'מד לחץ במהדק (כוח הידוק)',valAt:[-14,-6]},{id:'G3',type:'gauge',x:415,y:100,net:'D',name:'מד לחץ בצילינדר הקידוח',valAt:[14,-6]},
      {id:'CH',type:'chart',x:640,y:200,o:{w:180,h:120,xl:'זמן',yl:'מהלך',t:'מהדק (כתום) וקידוח (סגול)'},name:'גרף מקום-זמן של שני הצילינדרים'}],
    lines:[{id:'LS',net:'S',pts:['T1.t','P1.in']},{id:'LP',net:'P',pts:['P1.out',[200,300],[293,300],'V1.P']},{id:'LRV',net:'P',pts:[[200,300],'RV.P']},{id:'LRT',net:'T',pts:['RV.T',[110,300],'T2.t']},{id:'LT',net:'T',pts:['V1.T',[307,275],[380,275],'T3.t']},
      {id:'LA',net:'A',pts:['V1.A',[293,190],[90,190],'C1.A']},{id:'LG2',net:'A',pts:[[90,132],'G2.p'],nodot:true},{id:'LA2',net:'A',pts:[[293,190],[380,190],'SQ1.P']},{id:'LD',net:'D',pts:['SQ1.T','C2.A']},{id:'LG3',net:'D',pts:[[380,112],'G3.p'],nodot:true},
      {id:'LC1',net:'D',pts:[[380,100],[340,100],'CK1.in']},{id:'LC1b',net:'A',pts:['CK1.out',[340,190]]},{id:'LDR1',net:'T',kind:'drain',pts:['SQ1.L',[430,156],[430,164]],nodot:true},
      {id:'LB',net:'B',pts:['V1.B',[307,200],[500,200],[500,74],'C2.B']},{id:'LB2',net:'B',pts:[[307,200],[230,200],'SQ2.P']},{id:'LCB',net:'C',pts:['SQ2.T',[230,74],'C1.B']},
      {id:'LC2',net:'C',pts:[[230,100],[200,100],'CK2.in']},{id:'LC2b',net:'B',pts:['CK2.out',[200,200],[230,200]],nodot:true},{id:'LDR2',net:'T',kind:'drain',pts:['SQ2.L',[262,170]],nodot:true}]}),
  init:()=>({xc:0,xd:0,si:0,haz:[],t:0,hist:[],dw:0}),
  click(id,P){if(id==='V1'){P.pos=P.pos==='a'?'0':P.pos==='0'?'b':'a';P.auto=false;return true;}},
  step(P,st,dt,ctx){const f=ctx.fault;const Sc=80,Sd=150;const A1c=H.A(P.Dc),A2c=H.Aann(P.Dc,P.Dc*.5),A1d=H.A(P.Dd),A2d=H.Aann(P.Dd,P.Dd*.56);st.t+=dt;
    const haz=(k,t)=>{if(!st.haz.find(h=>h[0]===k))st.haz.push([k,t]);};const ps1=f==='low'?P.ps1*.3:f==='drain'?1e9:P.ps1,ps2=P.ps2;const ov=3;
    const dir=KIT.dirOf(P.pos);const pcm=H.p(P.Fcm,A1c);const Fd=st.xd<Sd*.4?1500:P.Fcut;const pdrill=H.p(Fd,A1d);const Qp=P.Q;let p=3,pc=0,pd=0,pcb=0,pb=0,vc=0,vd=0,Qr=0,qA=0,qD=0,qB=0,qC=0;
    if(dir>0){const clampDone=st.xc>=Sc-1e-6,drillDone=st.xd>=Sd-1e-6;
      if(!clampDone&&pcm<ps1){vc=H.v(Qp,A1c);p=pcm;pc=p;qA=Qp;}
      else if(!clampDone){const pin=Math.max(pcm,ps1+ov,pdrill);if(pin>P.pr){p=P.pr;Qr=Qp;}else{vc=H.v(Qp/2,A1c);vd=H.v(Qp/2,A1d);p=pin;pc=p;pd=pdrill;qA=Qp;qD=Qp/2;if(st.xd>5)haz('early','המקדח התחיל לפני שהמהדק נסגר – שסתום הרצף מכויל נמוך מכוח הזזת המהדק.');}}
      else if(!drillDone){const pin=Math.max(ps1+ov,pdrill);if(pin>P.pr){p=P.pr;pc=p;Qr=Qp;if(f!=='drain'&&ps1+ov>P.pr)haz('stall','כיול הסדר גבוה מכיול שסתום הפריקה – הקידוח לא מתחיל.');}else{vd=H.v(Qp,A1d);p=pin;pc=p;pd=pdrill;qA=Qp;qD=Qp;}}
      else{p=P.pr;pc=p;pd=p;Qr=Qp;}
      qB=-(vc*A2c+vd*A2d)*60/1e6;qC=-vc*A2c*60/1e6;}
    else if(dir<0){const drillHome=st.xd<=1e-6,clampHome=st.xc<=1e-6;const pdr=H.p(P.Fdr,A2d);
      if(!drillHome&&pdr<ps2){vd=-H.v(Qp,A2d);p=pdr;pb=p;qB=Qp;}
      else if(!drillHome){vd=-H.v(Qp/2,A2d);vc=-H.v(Qp/2,A2c);p=Math.max(pdr,ps2+ov);pb=p;pcb=p;qB=Qp;if(st.xd>Sd*.4)haz('release','המהדק נפתח כשהמקדח עוד בתוך החלק – שסתום רצף 2 מכויל נמוך.');}
      else if(!clampHome){vc=-H.v(Qp,A2c);p=ps2+ov;pb=p;pcb=p;qB=Qp;qC=Qp;}
      else{p=P.pr;pb=p;pcb=p;Qr=Qp;}
      qA=(vc*A1c+vd*A1d)*60/1e6;qD=vd*A1d*60/1e6;
      if(st.xc>=Sc-1e-6&&vc===0)pc=0;}
    else{p=3;pc=st.xc>=Sc-1?Math.min(P.ps1,P.pr):0;}
    if(dir>0&&st.xc>=Sc-1e-6&&pc===0)pc=p;
    st.xc=clamp(st.xc+vc*dt,0,Sc);st.xd=clamp(st.xd+vd*dt,0,Sd);
    if(P.auto){const end=dir>0?(st.xd>=Sd-1e-6):dir<0?(st.xc<=1e-6&&st.xd<=1e-6):true;if(end){st.dw+=dt;if(st.dw>.8){st.dw=0;P.pos=P.pos==='a'?'b':'a';}}else st.dw=0;}
    KIT.ease(st,'si',KIT.idx[P.pos],dt);KIT.rpmAng(st,dt,1450);if(!st.hist.length||st.t-st.hist.at(-1)[0]>.1){st.hist.push([st.t,st.xc/Sc,st.xd/Sd]);if(st.hist.length>200)st.hist.shift();}
    const Fcl=st.xc>=Sc-1?H.F(pc,A1c):0;const pm=KIT.nice(P.pr*1.05);const t0=st.hist[0][0];
    return {p:{S:-.05,P:p,A:pc,D:pd,B:pb,C:pcb,T:.5},q:{LS:Qp,LP:Qp-Qr,LRV:Qr,LRT:Qr,LT:Qp-Qr,LA:qA,LA2:qD,LD:qD,LB:qB,LB2:qC,LCB:qC,LC1:dir<0?-qD:0,LC1b:dir<0?-qD:0,LC2:dir>0?-qC:0,LC2b:dir>0?-qC:0},pmax:pm,qref:Qp,
      p0:p,pcm,pdrill,Fcl,haz:st.haz,xc:st.xc,xd:st.xd,dir,A1c,A1d,
      c:{C1:{x:st.xc/Sc,uA:pc/pm,uB:pcb/pm,lt:'▣'},C2:{x:st.xd/Sd,uA:pd/pm,uB:pb/pm,lt:'⚙'},V1:{i:st.si},SQ1:{open:qD>0?1:0},SQ2:{open:dir<0&&qC>0?1:0},CK1:{open:dir<0&&vd<0?1:0},CK2:{open:dir>0&&vc>0?1:0},P1:{on:true,ang:st.ang},RV:{open:clamp(Qr/Qp,0,1)},G2:{p:pc},G3:{p:pd},
        CH:{s:[{p:st.hist.map(h=>[h[0],h[1]]),c:'#ea580c'},{p:st.hist.map(h=>[h[0],h[2]]),c:'#7e22ce'}],x:[t0,Math.max(t0+10,st.t)],y:[0,1.05]}},
      read:[{k:'לחץ משאבה',v:p,u:'bar'},{k:'כוח הידוק',v:Fcl/1000,u:'kN'},{k:'מהדק',v:st.xc,u:'mm',max:Sc},{k:'מקדח',v:st.xd,u:'mm',max:Sd},{k:'לחץ להזזת המהדק',v:pcm,u:'bar'},{k:'אירועי סכנה',v:st.haz.length,u:'',dg:0,w:st.haz.length>0}]};},
  ins(P,R){const L=[];const stage=R.dir>0?(R.xc<79?'1️⃣ המהדק נסגר – הלחץ נמוך (רק מה שצריך כדי להזיז אותו).':R.xd<149?`2️⃣ המהדק סגור, הלחץ עלה לכיול הסדר (${fmt(P.ps1,0)} bar) – הסדר נפתח והמקדח מתקדם.`:'3️⃣ סוף קידוח – הלחץ עולה לשסתום הפריקה.'):R.dir<0?(R.xd>0?'4️⃣ המקדח חוזר ראשון.':'5️⃣ המקדח בבית – הלחץ עולה לכיול סדר 2 והמהדק נפתח.'):'⏸ מרכז טנדם – המשאבה פורקת.';
    L.push({ic:'🪜',at:'CH',h:stage});
    L.push({ic:'💪',at:'C1',h:`בזמן הקידוח הלחץ בכניסה לסדר לא יורד מתחת ל-${fmt(P.ps1,0)} bar – ולכן כוח ההידוק לפחות <b>${fmt(H.F(P.ps1,R.A1c)/1000,1)} kN</b>.`});
    R.haz.forEach(([k,t])=>L.push({ic:'⚠️',w:true,at:k==='release'?'SQ2':'SQ1',h:t,c:t}));
    L.push({ic:'📏',h:`כלל כיוון: סדר 1 מעל לחץ הזזת המהדק (${fmt(R.pcm,0)} bar) בכ-10 bar, ומתחת לשסתום הפריקה בכ-15 bar.`});return L;},
  calc(P,R){return `<div class="kpis">${kpi('לחץ הזזת מהדק',fmt(R.pcm,1),'bar')}${kpi('כוח הידוק מינימלי',fmt(H.F(P.ps1,R.A1c)/1000,2),'kN')}${kpi('לחץ קידוח',fmt(H.p(P.Fcut,R.A1d),1),'bar')}${kpi('חלון כיוון סדר 1',`${fmt(R.pcm+10,0)}–${fmt(P.pr-15,0)}`,'bar')}</div>`+
    det('לחצים',row('הזזת המהדק',`p = F/A = ${fmt(P.Fcm,0)}·10/${fmt(R.A1c,0)} = ${V(R.pcm,'bar')}`)+row('קידוח',`p = ${fmt(P.Fcut,0)}·10/${fmt(R.A1d,0)} = ${V(H.p(P.Fcut,R.A1d),'bar')}`)+row('בכניסה לסדר בזמן קידוח',`p = max(p_seq, p_drill) = ${V(Math.max(P.ps1,H.p(P.Fcut,R.A1d)),'bar')}`),true)+
    det('כוח הידוק',row('',`F = p·A_c ≥ ${fmt(P.ps1,0)}·${fmt(R.A1c,0)}/10 = ${V(H.F(P.ps1,R.A1c),'N')}`));},
  demo:[{t:'מכונת קידוח',x:'מהדק וקידוח על אותו קו A. שסתום הרצף מונע מהמקדח לזוז עד שהמהדק סגור והלחץ עולה.',reset:true,set:{auto:false,pos:'0'},hl:['C1','C2','SQ1']},
    {t:'שלב 1: הידוק',x:'במצב a השמן הולך למהדק – הלחץ נמוך כי רק מזיזים אותו. שסתום הרצף סגור.',set:{pos:'a'},hl:['C1','SQ1'],dur:6},
    {t:'שלב 2: קידוח',x:'המהדק נעצר על החלק, הלחץ עולה לכיול הסדר – והשסתום נפתח למקדח.',hl:['SQ1','C2'],dur:9},
    {t:'חזרה בסדר הפוך',x:'במצב b המקדח חוזר ראשון; רק כשהוא בבית הלחץ עולה וסדר 2 משחרר את המהדק.',set:{pos:'b'},hl:['SQ2','C1'],dur:9},
    {t:'כיוון שגוי',x:'מורידים את סדר 1 מתחת ללחץ הזזת המהדק – המקדח מתחיל לפני שהחלק מהודק!',set:{ps1:10,auto:true},hl:['SQ1','CH'],dur:10}],
  predict:[{q:'סדר 1 מכויל ל-10 bar, ולהזזת המהדק צריך 15 bar. מה יקרה?',set:{ps1:10,auto:true},opts:['תקין','המקדח יזוז יחד עם המהדק'],a:1,why:'הלחץ להזזת המהדק כבר פותח את הסדר – אין "סדר".'},
    {q:'בזמן הקידוח (130 bar) – מה הלחץ במהדק?',set:{auto:true},opts:['רק כיול הסדר','אותו לחץ כמו בכניסה לסדר (130 bar)'],a:1,why:'המהדק מחובר לכניסה של שסתום הרצף – הוא מקבל את לחץ הכניסה, שהוא לפחות כיול הסדר.'},
    {q:'סדר 1 מכויל מעל כיול שסתום הפריקה. מה יקרה?',set:{ps1:160,pr:140},opts:['המקדח לא יתקדם','שסתום הפריקה ייסגר'],a:0,why:'הלחץ לא יכול לעלות מעל שסתום הפריקה – הסדר אף פעם לא נפתח.'}],
  tasks:[{q:P=>`כוח הזזת המהדק ${P.Fcm} N, צילינדר Ø${P.Dc}. מה הכיול המינימלי של סדר 1 (עם מרווח 10 bar)?`,a:P=>H.p(P.Fcm,H.A(P.Dc))+10,u:'bar',hint:'p = F/A + 10.',rand:P=>{P.Fcm=rnd(1000,8000,250);P.Dc=pick([32,40,50,63]);}},
    {q:P=>`סדר 1 מכויל ל-${P.ps1} bar, מהדק Ø${P.Dc}. כוח ההידוק המינימלי בזמן הקידוח?`,a:P=>H.F(P.ps1,H.A(P.Dc)),u:'N',hint:'F = p·A.',rand:P=>{P.ps1=rnd(30,100,5);P.Dc=pick([40,50,63]);}}],
  faults:[{id:'low',t:'כיול שסתום הרצף זז למטה',sym:'"לפעמים המקדח נוגע בחלק לפני שהוא מהודק."',hint:'בדקו בגרף מתי מתחיל המקדח ביחס לסגירת המהדק.',why:'הסדר נפתח ב-30% מהכיול – לפני שהמהדק סיים.',set:{auto:true}},
    {id:'drain',t:'ניקוז שסתום הרצף חסום',sym:'"המהדק נסגר, הלחץ עולה לשסתום הפריקה – והמקדח לא זז."',hint:'מה הלחץ במד הקידוח?',why:'בלי ניקוז, תא הקפיץ מתמלא והסדר לא נפתח.',set:{auto:true}}],
  qaT:10,
  test(H){const P=clone(this.P);P.auto=false;const st=this.init(P);let R;for(let t=0;t<.5;t+=.02)R=this.step(P,st,.02,{});const pcm=H.p(P.Fcm,H.A(P.Dc));
    return [['שלב 1: p = F_cm/A',R.p0,pcm,.01],['שלב 1: v = Q/A',st.xc/.5,H.v(P.Q,H.A(P.Dc)),.05],['המקדח עדיין בבית',st.xd,0],['UI',R.read[4].v,pcm]];}};

LABS.push({ch:13,title:'מעגלי סדר פעולות',sims:[SIM_SEQ]});
}
