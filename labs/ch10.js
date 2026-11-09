/* lab 10 – same code as the website */
{




/* ===================== Chapter 10 – pressure control circuits (sims 36, 37, 38) ===================== */

/* ---------- 36 · pressure stages and remote control ---------- */
const SIM_STAGES={id:'stages',n:36,t:'דרגות לחץ ושליטה מרוחקת',d:'סולנואיד בוחר בין שסתומי פריקה מרוחקים ופותח אוורור: לחץ המערכת קופץ בין דרגות',
  P:{pmain:160,p1:60,p2:110,sel:'0',vent:false,Q:30,load:.05,auto:true},
  ui(U,P){U.grp('בחירת דרגה');U.seg(P,'sel','בורר',[['a','R1'],['0','ראשי'],['b','R2']]);U.chk(P,'vent','אוורור (פריקה)');U.chk(P,'auto','מחזור אוטומטי בין הדרגות');
    U.grp('כיולים');U.num(P,'pmain','שסתום פריקה ראשי','bar',{min:20,max:300,step:5});U.num(P,'p1','שסתום פריקה מרוחק R1','bar',{min:5,max:300,step:5});U.num(P,'p2','שסתום פריקה מרוחק R2','bar',{min:5,max:300,step:5});
    U.grp('עומס',false);U.num(P,'Q','ספיקה','L/min',{min:5,max:150,step:5});U.num(P,'load','פתיחת שסתום העומס','0–1',{min:0,max:1,step:.01});},
  circuit:P=>({comps:[{id:'P1',type:'pump',x:100,y:300,name:'משאבה',lbl:'משאבה',lblAt:[-46,30]},{id:'T1',type:'tank',x:100,y:345,name:'מיכל'},
      {id:'RM',type:'pv',x:200,y:240,rot:180,o:{kind:'relief',X:true},name:'שסתום פריקה ראשי מפוקד עם פתח אוורור X',lbl:'פריקה ראשי',lblAt:[-52,0]},{id:'T2',type:'tank',x:200,y:282,name:'מיכל'},
      {id:'VS',type:'dcv',x:300,y:300,o:{ways:4,box:['P>A B| T|','P| A| B| T|','P>B A| T|'],L:'sol',R:'sol',center:true},name:'שסתום בורר דרגות 4/3 (פיקוד X אל R1 או R2)',lbl:'בורר',lblAt:[0,34]},
      {id:'R1',type:'pv',x:262,y:230,o:{kind:'relief'},name:'שסתום פריקה מרוחק R1 (שסתום קטן – זרימת פיקוד בלבד)',lbl:'R1',lblAt:[-30,6]},{id:'R2',type:'pv',x:345,y:230,o:{kind:'relief'},name:'שסתום פריקה מרוחק R2',lbl:'R2',lblAt:[44,6]},
      {id:'T3',type:'tank',x:236,y:226,name:'מיכל'},{id:'T4',type:'tank',x:372,y:226,name:'מיכל'},
      {id:'VV',type:'dcv',x:160,y:420,o:{ways:2,box:['P>A','P| A|'],n0:1,L:'sol',R:'spring'},name:'שסתום אוורור 2/2',lbl:'אוורור',lblAt:[70,0]},{id:'T5',type:'tank',x:120,y:402,name:'מיכל'},
      {id:'LV',type:'throttle',x:430,y:230,name:'צרכן (שסתום עומס)',lbl:'צרכן',lblAt:[24,4]},{id:'T6',type:'tank',x:430,y:292,name:'מיכל'},
      {id:'G1',type:'gauge',x:300,y:160,net:'P',name:'מד לחץ מערכת',valAt:[14,-6]},
      {id:'CH',type:'chart',x:600,y:260,o:{w:190,h:110,xl:'זמן',yl:'p [bar]',t:'לחץ המערכת'},name:'גרף לחץ מול זמן'}],
    lines:[{id:'LS',net:'S',pts:['T1.t','P1.in']},{id:'LP',net:'P',pts:['P1.out',[100,190],[430,190],'LV.out']},{id:'LRM',net:'P',pts:[[200,190],'RM.P']},{id:'LRT',net:'T',pts:['RM.T','T2.t']},
      {id:'LG',net:'P',pts:[[300,190],'G1.p'],nodot:true},{id:'LT',net:'T',pts:['LV.in',[430,286]],nodot:true},
      {id:'LX',net:'X',kind:'pilot',pts:['RM.X',[230,340],[293,340],'VS.P']},{id:'LX1',net:'X1',kind:'pilot',pts:['VS.A',[293,262],[262,262],'R1.P']},{id:'LX2',net:'X2',kind:'pilot',pts:['VS.B',[307,262],[345,262],'R2.P']},
      {id:'LXV',net:'X',kind:'pilot',pts:[[230,340],[230,460],[160,460],'VV.P']},{id:'LV1',net:'T',kind:'pilot',pts:['VV.A',[160,390],[120,390],[120,396]],nodot:true},
      {id:'LR1',net:'T',kind:'drain',pts:['R1.T',[236,214],[236,220]],nodot:true},{id:'LR2',net:'T',kind:'drain',pts:['R2.T',[372,214],[372,220]],nodot:true}]}),
  init:()=>({t:0,hist:[],cyc:0,si:1,sv:1}),
  click(id,P){if(id==='VS'){P.sel=P.sel==='a'?'0':P.sel==='0'?'b':'a';P.auto=false;return true;}if(id==='VV'){P.vent=!P.vent;P.auto=false;return true;}},
  step(P,st,dt,ctx){const f=ctx.fault;st.t+=dt;if(P.auto){st.cyc+=dt;const ph=Math.floor(st.cyc/3)%4;P.sel=['0','a','b','0'][ph];P.vent=ph===3;}
    const vent=P.vent&&f!=='ventblock';const r1=f==='r1'?P.p1*.5:P.p1;
    let pset=P.pmain;if(P.sel==='a')pset=Math.min(pset,r1);if(P.sel==='b')pset=Math.min(pset,P.p2);if(vent)pset=f==='main'?Math.min(pset,P.pmain):5;
    const ov=Math.max(2,.03*pset);const k=PB2.k(P.load);const g=p=>P.Q-H.orQ(k,Math.max(p,0))-H.reliefQ(p,pset,ov,P.Q);const p=k>1e5?0:H.bisect(g,0,pset+ov*1.5);const Ql=H.orQ(k,p),Qr=P.Q-Ql;
    const qPil=Qr>.05&&pset<P.pmain-.5?1.2:0;KIT.ease(st,'si',P.sel==='a'?0:P.sel==='b'?2:1,dt);KIT.ease(st,'sv',P.vent?0:1,dt);KIT.rpmAng(st,dt,1450);
    if(!st.hist.length||st.t-st.hist.at(-1)[0]>.1){st.hist.push([st.t,p]);if(st.hist.length>150)st.hist.shift();}const pm=KIT.nice(Math.max(P.pmain,P.p1,P.p2)*1.05);
    const lvl=vent?'אוורור':P.sel==='a'?'R1':P.sel==='b'?'R2':'ראשי';
    return {p:{S:-.05,P:p,X:p,X1:P.sel==='a'?p:.3,X2:P.sel==='b'?p:.3,T:.5},q:{LS:P.Q,LP:P.Q,LRM:Qr,LRT:Qr,LT:Ql,LX:qPil,LX1:P.sel==='a'?qPil:0,LX2:P.sel==='b'?qPil:0},pmax:pm,qref:P.Q,pS:p,pset,lvl,Qr,
      c:{P1:{on:true,ang:st.ang},RM:{open:clamp(Qr/P.Q,0,1)},R1:{open:P.sel==='a'&&Qr>.05?1:0},R2:{open:P.sel==='b'&&Qr>.05?1:0},VS:{i:st.si},VV:{i:st.sv},LV:{knob:P.load},
        CH:{s:[{p:st.hist,c:'#dc2626'}],x:[st.hist.length?st.hist[0][0]:0,Math.max(st.t,15)],y:[0,pm]}},
      read:[{k:'דרגה פעילה',v:pset,u:'bar'},{k:'לחץ מערכת',v:p,u:'bar'},{k:'ספיקה דרך שסתום הפריקה הראשי',v:Qr,u:'L/min',max:P.Q},{k:'ספיקת פיקוד לשסתום המרוחק',v:qPil,u:'L/min',max:3},{k:'חום בשסתום הפריקה',v:H.kW(p,Qr),u:'kW'}]};},
  ins(P,R){const L=[{ic:'🎚️',at:'RM',h:`הדרגה הפעילה: <b>${R.lvl}</b> – הלחץ מוגבל ל-${fmt(R.pset,0)} bar. השסתום הראשי מעביר את כל הספיקה; המרוחק רק "מכוון" אותו דרך קו הפיקוד X.`}];
    L.push({ic:'🪶',at:'R1',h:'השסתומים המרוחקים קטנים: עוברת בהם רק ספיקת פיקוד (כ-1 L/min) – אפשר להתקין אותם בלוח הפיקוד, רחוק מהיחידה.'});
    if(R.lvl==='אוורור')L.push({ic:'😌',at:'VV',h:`אוורור: קו X פתוח למיכל – הבוכנה הראשית נפתחת בלחץ הקפיץ שלה בלבד (כ-5 bar). המשאבה פורקת בלי לכבות את המנוע: ${fmt(H.kW(R.pS,R.Qr),2)} kW בלבד.`});
    if(P.p1>P.pmain||P.p2>P.pmain)L.push({ic:'⚠️',w:true,at:'RM',h:'מרוחק שמכויל מעל הראשי לא משפיע – הראשי תמיד מגביל ראשון.',c:'כיול מרוחק מעל הראשי'});return L;},
  calc(P,R){return `<div class="kpis">${kpi('דרגה',R.lvl)}${kpi('לחץ',fmt(R.pS,1),'bar')}${kpi('חום',fmt(H.kW(R.pS,R.Qr),2),'kW')}${kpi('חיסכון באוורור',fmt(H.kW(P.pmain,P.Q)-H.kW(5,P.Q),2),'kW')}</div>`+
    det('לחץ הדרגה',row('',`p = min(p_ראשי, p_מרוחק) = ${V(R.pset,'bar')}`),true)+det('חום בהמתנה',row('שסתום פריקה ראשי',`P = ${P.pmain}·${P.Q}/600 = ${V(H.kW(P.pmain,P.Q),'kW')}`)+row('אוורור',`P ≈ 5·${P.Q}/600 = ${V(H.kW(5,P.Q),'kW')}`));},
  demo:[{t:'שסתום פריקה ראשי מפוקד',x:'שסתום הפריקה הראשי הוא דו-שלבי: בוכנה גדולה מאוזנת ופיקוד קטן. לפתח הפיקוד שלו (X) מחברים שסתומים קטנים אחרים.',reset:true,set:{auto:false,sel:'0',vent:false},hl:['RM']},
    {t:'דרגה R1',x:'הבורר מחבר את X לשסתום R1 (60 bar): הלחץ במערכת יורד מיד ל-60 bar.',set:{sel:'a'},hl:['VS','R1','CH']},
    {t:'דרגה R2',x:'מעבירים ל-R2 (110 bar). הלחץ קופץ לדרגה השנייה.',set:{sel:'b'},hl:['R2','CH']},
    {t:'אוורור',x:'שסתום האוורור מחבר את X למיכל: המשאבה פורקת בלחץ נמוך – כמעט בלי חום.',set:{vent:true},hl:['VV','CH']},
    {t:'מחזור',x:'במחזור האוטומטי רואים בגרף את הלחץ קופץ בין הדרגות.',set:{auto:true,vent:false},hl:['CH'],dur:12}],
  predict:[{q:'R1 מכויל ל-60 bar והראשי ל-160 bar. בוחרים R1. מה יהיה הלחץ?',set:{auto:false,sel:'a',vent:false},opts:['160 bar','60 bar','220 bar'],a:1,why:'R1 מגביל את לחץ הפיקוד, והבוכנה הראשית נפתחת כשהלחץ עובר אותו.'},
    {q:'R2 מכויל ל-200 bar והראשי ל-160 bar. בוחרים R2. הלחץ –',set:{auto:false,sel:'b',p2:200,vent:false},opts:['200 bar','160 bar'],a:1,why:'המגביל הנמוך קובע: הפיקוד של הראשי נפתח ב-160.'},
    {q:'פותחים אוורור. מה יעשה המנוע?',set:{auto:false,vent:true},opts:['ייעצר','ימשיך לסובב את המשאבה בלחץ נמוך'],a:1,why:'אוורור פורק את המשאבה בלי לכבות את המנוע – מתאים להמתנות קצרות.'}],
  tasks:[{q:P=>`משאבה ${P.Q} L/min ממתינה על שסתום פריקה ${P.pmain} bar. כמה kW נחסכים באוורור (5 bar)?`,a:P=>H.kW(P.pmain-5,P.Q),u:'kW',hint:'ΔP = (p₁ − p₂)·Q/600.',rand:P=>{P.Q=rnd(10,100,5);P.pmain=rnd(100,250,10);}}],
  faults:[{id:'r1',t:'שסתום R1 מכויל נמוך / דולף',sym:'"בדרגה הנמוכה המכבש לא מגיע ללחץ שנקבע."',hint:'השוו את הלחץ בדרגה R1 לכיול שלה.',why:'R1 נפתח בחצי מהכיול.',set:{auto:false,sel:'a',vent:false}},
    {id:'ventblock',t:'שסתום האוורור לא נפתח (סליל שרוף)',sym:'"בזמן המתנה השמן מתחמם, למרות שהאוורור מופעל."',hint:'מה הלחץ כשהאוורור מופעל?',why:'הסליל לא מזיז את השסתום – X חסום והמערכת ממתינה על שסתום הפריקה.',set:{auto:false,vent:true,sel:'0'}}],
  qaT:6,
  test(H){const P=clone(this.P);P.auto=false;P.sel='a';const R=this.step(P,this.init(P),.02,{});const P2=clone(P);P2.sel='b';P2.p2=200;const R2=this.step(P2,this.init(P2),.02,{});
    return [['דרגה R1',R.pset,60],['המגביל הנמוך',R2.pset,160],['רציפות',R.Qr+H.orQ(PB2.k(P.load),R.pS),P.Q,.002],['UI',R.read[1].v,R.pS]];}};
const PB2={k:o=>o>=1?1e9:o<=0?0:H.orK(80*o*o)};

/* ---------- 37 · Hi-Lo system ---------- */
const SIM_HILO={id:'hilo',n:37,t:'מערכת שתי משאבות (לחץ גבוה–נמוך)',d:'מהלך מהיר בשתי המשאבות; במגע עם החלק הגדולה פורקת – חיסכון בהספק',
  P:{Q1:8,Q2:40,pun:30,pr:200,D:100,dr:56,S:300,xc:220,kpart:8,F0:2000,auto:true,pos:'a'},
  ui(U,P){U.grp('משאבות');U.num(P,'Q1','משאבה קטנה','L/min',{min:1,max:50,step:1});U.num(P,'Q2','משאבה גדולה','L/min',{min:5,max:200,step:5});
    U.num(P,'pun','כיול שסתום הפריקה המפוקד','bar',{min:5,max:200,step:5});U.num(P,'pr','כיול שסתום פריקה','bar',{min:50,max:350,step:10});
    U.grp('מכבש',false);U.num(P,'xc','מגע עם החלק במהלך','mm',{min:20,max:290,step:5});U.num(P,'kpart','קשיחות החלק','kN/mm',{min:1,max:50,step:1});U.seg(P,'pos','ידית',KIT.pos3);U.chk(P,'auto','מחזור אוטומטי');},
  circuit:P=>({comps:[{id:'C1',type:'cyl',x:340,y:60,o:{load:{t:'⬛'}},name:'צילינדר מכבש',lbl:'מכבש',lblAt:[-82,-22],l3:[0,-34]},
      {id:'V1',type:'dcv',x:340,y:170,o:{box:KIT.D43.tandem,L:'lever',center:true},name:'שסתום 4/3 מרכז טנדם',lbl:'4/3',lblAt:[82,4]},
      {id:'PS',type:'pump',x:240,y:330,o:{motor:false},name:'משאבה קטנה – לחץ גבוה',lbl:'קטנה',lblAt:[30,8]},{id:'PL',type:'pump',x:120,y:330,name:'משאבה גדולה – לחץ נמוך (שתיהן על אותו מנוע)',lbl:'גדולה',lblAt:[-46,30]},
      {id:'T1',type:'tank',x:240,y:375,name:'מיכל'},{id:'T0',type:'tank',x:120,y:375,name:'מיכל'},
      {id:'CK',type:'check',x:120,y:260,name:'אל-חוזר – מבודד את הגדולה כשהיא פורקת',lbl:'אל-חוזר',lblAt:[28,-4]},
      {id:'UV',type:'pv',x:60,y:280,rot:-90,o:{kind:'unload'},name:'שסתום פריקה מפוקד (פיקוד חיצוני מקו המערכת)',lbl:'פריקה מפוקד',lblAt:[0,-34]},{id:'T2',type:'tank',x:24,y:292,name:'מיכל'},
      {id:'RV',type:'pv',x:290,y:280,rot:90,o:{kind:'relief'},name:'שסתום פריקה',lbl:'פריקה',lblAt:[0,-30]},{id:'T3',type:'tank',x:326,y:292,name:'מיכל'},{id:'T4',type:'tank',x:420,y:236,name:'מיכל'},
      {id:'G1',type:'gauge',x:200,y:200,net:'P',name:'מד לחץ מערכת'},
      {id:'CH',type:'chart',x:610,y:200,o:{w:190,h:130,xl:'מהלך [mm]',yl:'',t:'לחץ (אדום) ומהירות (כחול) מול מהלך'},name:'גרף לחץ ומהירות מול מהלך'}],
    lines:[{id:'LS1',net:'S',pts:['T1.t','PS.in']},{id:'LS2',net:'S',pts:['T0.t','PL.in']},{id:'LPS',net:'P',pts:['PS.out',[240,240],[333,240],'V1.P']},{id:'LPL',net:'L',pts:['PL.out','CK.in']},{id:'LCK',net:'P',pts:['CK.out',[120,240],[240,240]]},
      {id:'LUV',net:'L',pts:[[120,280],'UV.P']},{id:'LUT',net:'T',pts:['UV.T',[24,280],'T2.t']},{id:'LX',net:'P',kind:'pilot',pts:[[180,240],[180,310],'UV.X']},
      {id:'LRV',net:'P',pts:[[274,240],'RV.P']},{id:'LRT',net:'T',pts:['RV.T',[326,280],'T3.t']},{id:'LG',net:'P',pts:[[200,240],'G1.p'],nodot:true},
      {id:'LA',net:'A',pts:['V1.A',[333,120],[290,120],'C1.A']},{id:'LB',net:'B',pts:['V1.B',[347,120],[390,120],'C1.B']},{id:'LT',net:'T',pts:['V1.T',[347,215],[420,215],'T4.t']}]}),
  init:P=>({x:0,si:KIT.idx[P.pos],cv:[],dw:0,E:0,E2:0,t:0}),
  click(id,P){if(id==='V1'){P.pos=P.pos==='a'?'0':P.pos==='0'?'b':'a';P.auto=false;return true;}},
  step(P,st,dt,ctx){const f=ctx.fault;const A1=H.A(P.D),A2=H.Aann(P.D,P.dr);const dir=KIT.dirOf(P.pos);const pun=f==='unlow'?P.pun*.3:f==='unstuck'?1e9:P.pun;
    const Fpart=x=>x>P.xc?P.kpart*1000*(x-P.xc):0;const atEnd=(dir>0&&(st.x>=P.S-1e-6||H.p(Fpart(st.x)+P.F0,A1)>=P.pr))||(dir<0&&st.x<=1e-6);
    const F=dir>0?P.F0+Fpart(st.x):dir<0?-P.F0*.5:0;const pLoad=dir>0?H.p(F,A1):dir<0?0:0;
    const big=pLoad<pun&&!(f==='ckleak');const Qp=P.Q1+(big?P.Q2:0);
    let r={v:0,ps:0,Qr:0,stall:true};if(dir!==0)r=H.lin({Qp,pr:P.pr,Ain:dir>0?A1:A2,Aout:dir>0?A2:A1,F:atEnd?1e9:Math.abs(F)*(dir>0?1:0)});else r={v:0,ps:2,Qr:0,stall:true};
    if(f==='ckleak'&&r.ps>pun){r.ps=Math.min(r.ps,pun*1.05);}
    const v=r.v;st.x=clamp(st.x+dir*v*dt,0,P.S);KIT.autoCycle(P,st,dt,atEnd&&dir!==0,1);KIT.ease(st,'si',KIT.idx[P.pos],dt);KIT.rpmAng(st,dt,1450);
    const pS=r.ps,pL=big?pS:3;const Pin=(H.kW(pS,P.Q1)+H.kW(big?pS:3,P.Q2))/.85;const Pbig=H.kW(Math.max(pS,0),P.Q1+P.Q2)/.85;
    if(dir>0&&!atEnd){const xr=Math.round(st.x/5)*5;if(!st.cv.length||st.cv.at(-1)[0]!==xr){st.cv.push([xr,pS,v]);if(st.cv.length>80)st.cv.shift();}}if(dir<0&&st.x<5)st.cv=[];
    if(dt>0){st.E+=Pin*dt;st.E2+=Pbig*dt;}const pm=KIT.nice(P.pr*1.05);const vmax=H.v(P.Q1+P.Q2,A1);
    return {p:{S:-.05,P:pS,L:pL,A:dir>0?pS:.5,B:dir<0?pS:.5,T:.5},q:{LS1:P.Q1,LS2:P.Q2,LPS:P.Q1,LPL:big?P.Q2:0,LCK:big?P.Q2:0,LUV:big?0:P.Q2,LUT:big?0:P.Q2,LRV:r.Qr,LRT:r.Qr,LA:dir>0?r.Qin:-(r.Qout||0),LB:dir>0?-(r.Qout||0):r.Qin||0,LT:r.Qout||0},pmax:pm,qref:P.Q1+P.Q2,
      big,pS,v,Pin,Pbig,F,A1,dir,
      c:{C1:{x:st.x/P.S,uA:(dir>0?pS:.5)/pm,uB:(dir<0?pS:.5)/pm,lt:Fpart(st.x)>0?'⬛':'⬜'},V1:{i:st.si},PS:{on:true,ang:st.ang},PL:{on:true,ang:st.ang},CK:{open:big?1:0},UV:{open:big?0:1},RV:{open:clamp(r.Qr/Math.max(P.Q1,1),0,1)},
        CH:{s:[{p:st.cv.map(c=>[c[0],c[1]]),c:'#dc2626'},{p:st.cv.map(c=>[c[0],c[2]/vmax*pm]),c:'#0b72d9'}],x:[0,P.S],y:[0,pm]}},
      read:[{k:'לחץ מערכת',v:pS,u:'bar'},{k:'מהירות',v:v,u:'mm/s',max:vmax},{k:'כוח לחיצה',v:Math.max(F,0)/1000,u:'kN'},{k:'משאבה גדולה',v:big?1:0,u:big?' מזינה':' פורקת',dg:0},{k:'הספק כניסה במערכת שתי המשאבות',v:Pin,u:'kW'},{k:'הספק – משאבה גדולה אחת',v:Pbig,u:'kW',w:Pbig>Pin*1.5}]};},
  ins(P,R){const L=[];if(R.dir>0)L.push(R.big?{ic:'🏃',at:'C1',h:`גישה מהירה: שתי המשאבות (${fmt(P.Q1+P.Q2,0)} L/min) בלחץ נמוך – ${fmt(R.v,0)} mm/s.`}:{ic:'💪',at:'UV',h:`הלחץ (${fmt(R.pS,0)} bar) עבר את כיול הפריקה (${fmt(P.pun,0)}): הגדולה פורקת למיכל, האל-חוזר נסגר, והקטנה ממשיכה לבד ללחץ גבוה.`});
    L.push({ic:'⚡',at:'PS',h:`הספק כניסה עכשיו: <b>${fmt(R.Pin,2)} kW</b>. משאבה גדולה אחת באותו מצב הייתה צורכת ${fmt(R.Pbig,2)} kW – מנוע גדול פי ${fmt(R.Pbig/Math.max(R.Pin,.01),1)}.`});
    L.push({ic:'📈',at:'CH',h:'בגרף: המהירות (כחול) נופלת בבת אחת ברגע הפריקה, והלחץ (אדום) ממשיך לעלות עם הלחיצה.'});return L;},
  calc(P,R){return `<div class="kpis">${kpi('מהירות גישה',fmt(H.v(P.Q1+P.Q2,R.A1),1),'mm/s')}${kpi('מהירות לחיצה',fmt(H.v(P.Q1,R.A1),1),'mm/s')}${kpi('כוח מרבי',fmt(H.F(P.pr,R.A1)/1000,1),'kN')}${kpi('הספק מרבי במערכת שתי המשאבות',fmt(H.kW(P.pr,P.Q1)/.85+H.kW(3,P.Q2)/.85,2),'kW')}</div>`+
    det('מהירויות',row('גישה',`v = (Q₁+Q₂)/A₁ = ${V(H.v(P.Q1+P.Q2,R.A1),'mm/s')}`)+row('לחיצה',`v = Q₁/A₁ = ${V(H.v(P.Q1,R.A1),'mm/s')}`),true)+det('הספק',row('במערכת שתי המשאבות בלחץ מרבי',`P = (p·Q₁ + 3·Q₂)/600/η = ${V(H.kW(P.pr,P.Q1)/.85+H.kW(3,P.Q2)/.85,'kW')}`)+row('משאבה אחת',`P = p·(Q₁+Q₂)/600/η = ${V(H.kW(P.pr,P.Q1+P.Q2)/.85,'kW')}`));},
  demo:[{t:'שתי משאבות על מנוע אחד',x:'משאבה גדולה (ספיקה, לחץ נמוך) וקטנה (לחץ גבוה). הגדולה מחוברת דרך אל-חוזר ושסתום פריקה מפוקד.',reset:true,set:{auto:false,pos:'0'},hl:['PS','PL']},
    {t:'גישה מהירה',x:'השתיים יחד מזיזות את המכבש מהר כל עוד אין התנגדות.',set:{pos:'a',auto:true},hl:['C1','CK'],dur:6},
    {t:'מגע עם החלק',x:'הלחץ עולה, שסתום הפריקה המפוקד נפתח והגדולה פורקת. האל-חוזר נסגר כדי שהקטנה לא תדחוף שמן אחורה.',hl:['UV','CK'],dur:7},
    {t:'חיסכון',x:'בשלב הלחיצה עובדת רק המשאבה הקטנה בלחץ גבוה – המנוע קטן בהרבה מזה שהיה נדרש למשאבה גדולה אחת.',hl:['PS'],dur:8}],
  predict:[{q:'מורידים את כיול הפריקה מ-30 ל-5 bar. מה יקרה בגישה?',set:{pun:5},opts:['מהירה יותר','איטית – הגדולה פורקת כבר בגישה','אין שינוי'],a:1,why:'גם חיכוך קטן יוצר 5 bar – הגדולה פורקת מוקדם.'},
    {q:'בשלב הלחיצה, למה צריך את האל-חוזר?',opts:['כדי שהקטנה לא תדחוף שמן דרך הפריקה למיכל','כדי להגביל לחץ'],a:0,why:'בלי האל-חוזר הספיקה של הקטנה הייתה בורחת דרך שסתום הפריקה המפוקד הפתוח.'}],
  tasks:[{q:P=>`Q₁ = ${P.Q1}, Q₂ = ${P.Q2} L/min, בוכנה Ø${P.D}. מהירות הגישה?`,a:P=>H.v(P.Q1+P.Q2,H.A(P.D)),u:'mm/s',hint:'v = (Q₁+Q₂)/A.',rand:P=>{P.Q1=rnd(4,16,1);P.Q2=rnd(20,80,5);P.D=pick([63,80,100,125]);}},
    {q:P=>`לחץ ${P.pr} bar עם המשאבה הקטנה בלבד (${P.Q1} L/min), η = 0.85. הספק כניסה?`,a:P=>H.kW(P.pr,P.Q1)/.85,u:'kW',hint:'P = p·Q/600/η.',rand:P=>{P.pr=rnd(100,300,10);P.Q1=rnd(4,16,1);}}],
  faults:[{id:'unlow',t:'שסתום הפריקה המפוקד מכויל נמוך מדי',sym:'"הגישה איטית מהרגיל."',hint:'מתי עוברת המשאבה הגדולה לפריקה?',why:'הפריקה נפתחת ב-30% מהכיול – כבר בגישה.',set:{auto:true}},
    {id:'unstuck',t:'שסתום הפריקה המפוקד תקוע סגור',sym:'"המנוע נעצר בסוף הלחיצה (עומס יתר), והשמן חם."',hint:'השוו את הספק הכניסה לזה של במערכת שתי המשאבות תקין.',why:'שתי המשאבות דוחפות ללחץ הגבוה – הספק כפול ושסתום הפריקה מעביר את כל העודף.',set:{auto:true}},
    {id:'ckleak',t:'אל-חוזר דולף',sym:'"המכבש לא מגיע ללחץ הלחיצה."',hint:'מה הלחץ המרבי בשלב הלחיצה?',why:'שמן מהקטנה חוזר דרך האל-חוזר לשסתום הפריקה המפוקד הפתוח – הלחץ נתקע בכיול הפריקה.',set:{auto:true}}],
  qaT:8,
  test(H){const P=clone(this.P);P.auto=false;const st=this.init(P);let R;for(let t=0;t<.5;t+=.02)R=this.step(P,st,.02,{});
    return [['גישה: v = (Q₁+Q₂)/A',R.v,H.v(P.Q1+P.Q2,H.A(P.D)),.02],['F = p·A בגישה',R.pS,H.p(P.F0,H.A(P.D)),.03],['UI',R.read[1].v,R.v]];}};

/* ---------- 38 · clamp and machining: branch pressure reduction ---------- */
const SIM_CLAMP={id:'clamp',n:38,t:'מהדק ועיבוד – הפחתת לחץ בענף',d:'שני לחצים שונים מאותה משאבה; החלק שנמעך מסוכנות של רכיב',
  P:{Q:24,pr:150,pred:40,Dc:40,Dw:63,Fcut:12000,mu:.3,crush:9000,auto:true,stage:0},
  ui(U,P){U.grp('ווסת לחץ (מהדק)');U.num(P,'pred','כיול ווסת הלחץ','bar',{min:5,max:150,step:5});U.num(P,'Dc','קוטר צילינדר הידוק','mm',{min:20,max:100,step:5});
    U.grp('עיבוד');U.num(P,'Fcut','כוח עיבוד','N',{min:0,max:50000,step:500});U.num(P,'mu','מקדם חיכוך במלחציים','',{min:.05,max:.8,step:.05});U.num(P,'crush','כוח מעיכת החלק','N',{min:1000,max:50000,step:500});
    U.grp('מחזור',false);U.chk(P,'auto','מחזור אוטומטי: הידוק → עיבוד → שחרור');U.num(P,'pr','כיול שסתום פריקה','bar',{min:50,max:300,step:5});},
  circuit:P=>({comps:[{id:'CC',type:'cyl',x:150,y:60,o:{load:{t:'▣'}},name:'צילינדר הידוק',lbl:'הידוק',lblAt:[-82,-22],l3:[0,-34]},{id:'CW',type:'cyl',x:440,y:60,o:{load:{t:'⚙'}},name:'צילינדר עבודה (הזנת כלי)',lbl:'עבודה',lblAt:[-82,-22],l3:[0,-34]},
      {id:'V1',type:'dcv',x:150,y:170,o:{box:KIT.D43.closed,L:'sol',R:'sol',center:true},name:'שסתום 4/3 הידוק',lbl:'V1',lblAt:[78,4]},{id:'V2',type:'dcv',x:440,y:170,o:{box:KIT.D43.closed,L:'sol',R:'sol',center:true},name:'שסתום 4/3 עבודה',lbl:'V2',lblAt:[78,4]},
      {id:'RD',type:'pv',x:150,y:255,o:{kind:'reduce'},name:'ווסת לחץ לענף ההידוק',lbl:'ווסת לחץ',lblAt:[-40,4]},{id:'TD',type:'tank',x:200,y:300,name:'ניקוז'},
      {id:'P1',type:'pump',x:300,y:370,name:'משאבה',lbl:'משאבה',lblAt:[34,6]},{id:'T1',type:'tank',x:300,y:415,name:'מיכל'},{id:'RV',type:'pv',x:250,y:320,rot:-90,o:{kind:'relief'},name:'שסתום פריקה',lbl:'פריקה',lblAt:[0,-30]},{id:'T2',type:'tank',x:210,y:332,name:'מיכל'},
      {id:'T3',type:'tank',x:225,y:226,name:'מיכל'},{id:'T4',type:'tank',x:515,y:226,name:'מיכל'},
      {id:'G1',type:'gauge',x:345,y:300,net:'P',name:'מד לחץ מערכת',valAt:[14,-6]},{id:'G2',type:'gauge',x:100,y:220,net:'R',name:'מד לחץ אחרי ווסת הלחץ',valAt:[-14,-6]}],
    lines:[{id:'LS',net:'S',pts:['T1.t','P1.in']},{id:'LP',net:'P',pts:['P1.out',[300,320],[300,290]]},{id:'LR',net:'P',pts:[[300,320],'RV.P']},{id:'LRT',net:'T',pts:['RV.T',[210,320],'T2.t']},{id:'LGx',net:'P',pts:[[300,312],[345,312]],nodot:true},
      {id:'LP1',net:'P',pts:[[300,290],[150,290],'RD.P']},{id:'LRD',net:'R',pts:['RD.T','V1.P']},{id:'LG2',net:'R',pts:[[143,232],[100,232]],nodot:true},{id:'LDR',net:'T',kind:'drain',pts:['RD.L',[180,271],[200,271],'TD.t']},
      {id:'LP2',net:'P',pts:[[300,290],[433,290],'V2.P']},
      {id:'LA1',net:'A1',pts:['V1.A',[143,120],[100,120],'CC.A']},{id:'LB1',net:'B1',pts:['V1.B',[157,120],[200,120],'CC.B']},{id:'LT1',net:'T',pts:['V1.T',[157,215],[225,215],'T3.t']},
      {id:'LA2',net:'A2',pts:['V2.A',[433,120],[390,120],'CW.A']},{id:'LB2',net:'B2',pts:['V2.B',[447,120],[490,120],'CW.B']},{id:'LT2',net:'T',pts:['V2.T',[447,215],[515,215],'T4.t']}]}),
  init:()=>({xc:0,xw:0,ph:0,t:0,s1:1,s2:1,slip:0,crushed:false}),
  step(P,st,dt,ctx){const f=ctx.fault;const Ac=H.A(P.Dc),Aw=H.A(P.Dw),Awr=H.Aann(P.Dw,P.Dw*.56);st.t+=dt;
    // auto sequence: 0 clamp → 1 feed → 2 return tool → 3 unclamp
    if(P.auto){const done=[st.xc>=.999,st.xw>=.999,st.xw<=.001,st.xc<=.001][st.ph];if(done){st.dw=(st.dw||0)+dt;if(st.dw>.8){st.dw=0;st.ph=(st.ph+1)%4;if(st.ph===0){st.slip=0;st.crushed=false;}}}else st.dw=0;}
    const c1=st.ph===0?1:st.ph===3?-1:0,c2=st.ph===1?1:st.ph===2?-1:0;
    const pRedSet=f==='drain'?P.pr:f==='rclosed'?0:P.pred;const Sc=60,Sw=150;
    let pP=0,pR=0,pA1=0,pB1=0,pA2=0,pB2=0,qc=0,qw=0,Qr=0;
    if(c1){const atE=(c1>0&&st.xc>=1)||(c1<0&&st.xc<=0);const pa=Math.min(pRedSet,P.pr);const r=H.lin({Qp:pa>0?P.Q:0,pr:pa||.1,Ain:c1>0?Ac:H.Aann(P.Dc,P.Dc*.5),Aout:0,F:atE?1e9:300});st.xc=clamp(st.xc+c1*r.v/Sc*dt,0,1);pR=c1>0?(atE?pa:r.pIn):r.pIn;pP=Math.min(P.pr,Math.max(pR+5,atE&&c1>0?P.pr:pR+5));qc=atE?0:P.Q;Qr=atE?P.Q:0;pA1=c1>0?pR:0;pB1=c1<0?pR:0;if(!atE)pP=pR+5;}
    else{pR=st.xc>.99?Math.min(pRedSet,P.pr):0;pA1=pR;}
    if(c2){const atE=(c2>0&&st.xw>=1)||(c2<0&&st.xw<=0);const r=H.lin({Qp:P.Q,pr:P.pr,Ain:c2>0?Aw:Awr,Aout:c2>0?Awr:Aw,F:atE?1e9:(c2>0?P.Fcut:0)});st.xw=clamp(st.xw+c2*r.v/Sw*dt,0,1);pP=r.ps;pA2=c2>0?r.pIn:r.pOut;pB2=c2<0?r.pIn:r.pOut;qw=atE?0:P.Q;Qr=r.Qr;
      if(st.xc>.99){pR=Math.min(pRedSet,pP);pA1=pR;}}
    if(!c1&&!c2){pP=P.pr;Qr=P.Q;}
    const Fcl=H.F(pA1,Ac);const Fhold=P.mu*Fcl*2;const cutting=c2>0&&st.xw>.3&&st.xw<1;if(cutting&&Fhold<P.Fcut)st.slip=Math.min(1,st.slip+dt*.8);if(Fcl>P.crush)st.crushed=true;
    KIT.ease(st,'s1',c1>0?0:c1<0?2:1,dt);KIT.ease(st,'s2',c2>0?0:c2<0?2:1,dt);KIT.rpmAng(st,dt,1450);const pm=KIT.nice(P.pr*1.05);
    return {p:{S:-.05,P:pP,R:pR,A1:pA1,B1:pB1,A2:pA2,B2:pB2,T:.5},q:{LS:P.Q,LP:P.Q,LR:Qr,LRT:Qr,LP1:qc,LRD:qc,LA1:c1*qc,LB1:-c1*qc*.7,LT1:qc*.7,LP2:qw,LA2:c2*qw,LB2:-c2*qw*.7,LT2:qw*.7},pmax:pm,qref:P.Q,
      Fcl,Fhold,pR,pP,ph:st.ph,slip:st.slip,crushed:st.crushed,Ac,
      c:{CC:{x:st.xc,uA:pA1/pm,uB:pB1/pm,lt:st.crushed?'✖':'▣'},CW:{x:st.xw,uA:pA2/pm,uB:pB2/pm,lt:'⚙'},V1:{i:st.s1},V2:{i:st.s2},RD:{open:pR<pP-1?.4:1},P1:{on:true,ang:st.ang},RV:{open:clamp(Qr/P.Q,0,1)},G2:{p:pR}},
      read:[{k:'לחץ מערכת',v:pP,u:'bar'},{k:'לחץ הידוק (אחרי ווסת הלחץ)',v:pR,u:'bar'},{k:'כוח הידוק',v:Fcl/1000,u:'kN',max:P.crush/1000*1.5,w:Fcl>P.crush},{k:'כוח אחיזה μ·F·2',v:Fhold/1000,u:'kN',w:Fhold<P.Fcut&&st.xc>.99},{k:'כוח עיבוד',v:P.Fcut/1000,u:'kN'},{k:'החלקה',v:st.slip*100,u:'%',max:100,w:st.slip>0}]};},
  ins(P,R){const L=[{ic:'🎯',at:'RD',h:`ווסת הלחץ שומר על <b>${fmt(R.pR,0)} bar</b> בענף ההידוק, בזמן שצילינדר העבודה מקבל עד ${fmt(P.pr,0)} bar מאותה משאבה.`}];
    if(R.crushed)L.push({ic:'💥',w:true,at:'CC',h:`כוח ההידוק ${fmt(R.Fcl/1000,1)} kN עבר את חוזק החלק (${fmt(P.crush/1000,1)} kN) – החלק נמעך! הורידו את כיול ווסת הלחץ.`,c:'החלק נמעך'});
    if(R.slip>0)L.push({ic:'🫳',w:true,at:'CC',h:`כוח האחיזה ${fmt(R.Fhold/1000,1)} kN קטן מכוח העיבוד – החלק מחליק במלחציים.`,c:'החלק מחליק'});
    const lo=P.Fcut/(P.mu*2)/1000,hi=P.crush/1000;L.push({ic:'📏',h:`חלון הכיוון: כוח הידוק בין ${fmt(lo,1)} ל-${fmt(hi,1)} kN, כלומר ${fmt(H.p(lo*1000,R.Ac),0)} עד ${fmt(H.p(hi*1000,R.Ac),0)} bar בווסת לחץ.`});return L;},
  calc(P,R){const Ac=R.Ac;const lo=P.Fcut/(P.mu*2),hi=P.crush;return `<div class="kpis">${kpi('כוח הידוק',fmt(R.Fcl/1000,2),'kN')}${kpi('כיול מינימלי',fmt(H.p(lo,Ac),1),'bar')}${kpi('כיול מרבי',fmt(H.p(hi,Ac),1),'bar')}${kpi('לחץ מערכת',fmt(R.pP,0),'bar')}</div>`+
    det('כוח הידוק',row('',`F = p_red·A = ${fmt(R.pR,1)}·${fmt(Ac,0)}/10 = ${V(R.Fcl,'N')}`),true)+det('חלון כיוון',row('מניעת החלקה',`2·μ·F ≥ F_cut → F ≥ ${V(lo,'N')} → p ≥ ${V(H.p(lo,Ac),'bar')}`)+row('מניעת מעיכה',`F ≤ ${V(hi,'N')} → p ≤ ${V(H.p(hi,Ac),'bar')}`),true);},
  demo:[{t:'שני ענפים, משאבה אחת',x:'ענף ההידוק עובר דרך ווסת לחץ; ענף העבודה מקבל את לחץ המערכת המלא.',reset:true,set:{auto:false},hl:['RD','P1']},
    {t:'הידוק',x:'הצילינדר מהדק את החלק. הלחץ בענף נעצר בכיול ווסת הלחץ – 40 bar.',set:{auto:true},hl:['CC','G2'],dur:6},
    {t:'עיבוד בלחץ מלא',x:'צילינדר העבודה דוחף בכוח 12 kN בלחץ גבוה – ההידוק נשאר 40 bar.',hl:['CW','G1'],dur:8},
    {t:'כיול גבוה מדי',x:'מעלים את ווסת הלחץ ל-100 bar: הכוח עובר את חוזק החלק והוא נמעך.',set:{pred:100},hl:['CC'],dur:8}],
  predict:[{q:'צילינדר העבודה עולה ל-120 bar. מה יקרה ללחץ ההידוק (כיול 40)?',set:{auto:true},opts:['יעלה ל-120','יישאר 40'],a:1,why:'ווסת הלחץ חש את היציאה וסוגר – ההידוק נשאר בכיול.'},
    {q:'ניקוז ווסת הלחץ נחסם. מה יקרה?',opts:['כלום','הלחץ בענף יעלה עד לחץ המערכת'],a:1,why:'בלי ניקוז, השמן שדולף לתא הקפיץ לא יוצא – הספול (מגופה) לא יכול להיסגר כראוי.'}],
  tasks:[{q:P=>`ווסת לחץ מכויל ל-${P.pred} bar, צילינדר הידוק Ø${P.Dc}. כוח ההידוק?`,a:P=>H.F(P.pred,H.A(P.Dc)),u:'N',hint:'F = p·A.',rand:P=>{P.pred=rnd(20,100,5);P.Dc=pick([32,40,50,63]);}},
    {q:P=>`כוח עיבוד ${P.Fcut} N, μ = ${P.mu}, שתי לסתות. כוח הידוק מינימלי?`,a:P=>P.Fcut/(2*P.mu),u:'N',hint:'2·μ·F ≥ F_cut.',rand:P=>{P.Fcut=rnd(4000,20000,500);P.mu=pick([.2,.25,.3,.4]);}}],
  faults:[{id:'drain',t:'קו הניקוז של ווסת הלחץ חסום',sym:'"מאז ההחלפה החלקים נמעכים במלחציים."',hint:'השוו את הלחץ אחרי ווסת הלחץ לכיול שלו בזמן העיבוד.',why:'בלי ניקוז ווסת הלחץ לא מווסת: לחץ ההידוק עולה ללחץ המערכת.',set:{auto:true}},
    {id:'rclosed',t:'ספול ווסת הלחץ תקוע סגור',sym:'"צילינדר ההידוק לא זז."',hint:'מה הלחץ אחרי ווסת הלחץ?',why:'הספול סגור – אין זרימה לענף ההידוק.',set:{auto:true}}],
  qaT:8,
  test(H){const P=clone(this.P);const st=this.init(P);let R;for(let t=0;t<4;t+=.02)R=this.step(P,st,.02,{});return [['F = p_red·A',R.Fcl,H.F(R.pR,H.A(P.Dc)),.01],['לחץ הידוק = כיול',st.xc>.99?R.pR:P.pred,P.pred,.01],['UI כוח',R.read[2].v*1000,R.Fcl]];}};

LABS.push({ch:10,title:'מעגלי בקרת לחץ',sims:[SIM_STAGES,SIM_HILO,SIM_CLAMP]});
}
