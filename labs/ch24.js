/* lab 24 – same code as the website */
{




/* ===================== Chapter 24 – pneumatics: basics and logic (62), sequence A+ B+ A− B− with limit valves (63) ===================== */
/* Pneumatic ISO 1219 symbols defined in this chapter: air source, 5/2 and 3/2 valves with numbered ports (1 supply, 2/4 outlets, 3/5 exhaust),
   pushbutton / roller / idle-return roller / pneumatic pilot / spring actuators, AND (two-pressure) and OR (shuttle) valves.
   Cylinder speed: ויסות ביציאה (meter-out) exhaust through a sonic conductance C (ISO 6358, b = 0.4) – choked flow makes the speed almost load-independent. */
const PV_PX={'52':{'1':[0,15],'4':[-7,-15],'2':[7,-15],'5':[-11,15],'3':[11,15]},'32':{'1':[-7,15],'2':[-7,-15],'3':[7,15]}};
const PV_EX={'52':['5','3'],'32':['3']};
function pvBox(g,spec,t){const px=PV_PX[t];spec.split(/\s+/).filter(Boolean).forEach(tk=>{let m;
  if((m=/^(\d)>(\d)$/.exec(tk))){const a=px[m[1]],b=px[m[2]];const ya=a[1]+(a[1]<0?3:-3),yb=b[1]+(b[1]<0?3:-3);SA(g,a[0],ya,b[0],yb,'sy',4.5);}
  else if((m=/^(\d)\|$/.exec(tk))){const a=px[m[1]];const yy=a[1]<0?-8:8;SL(g,a[0],a[1],a[0],yy);SL(g,a[0]-4,yy,a[0]+4,yy);}});}
function pvAct(g,kind,x,dir,o){
  if(kind==='btn'){SL(g,x,0,x+dir*6,0);SP(g,`M${x+dir*6},-8 A8,8 0 0,${dir>0?1:0} ${x+dir*6},8`);return dir*12;}
  if(kind==='roller'){SL(g,x,0,x+dir*8,0);SC(g,x+dir*12,0,4,'syb');if(o&&o.idle)SP(g,`M${x+dir*5},-6 l${dir*4},6`,'sy thin');return dir*16;}
  if(kind==='pilot'){SP(g,`M${x},0 l${dir*8},-5 v10z`,'syb');SL(g,x+dir*8,0,x+dir*14,0,'sy pil');return dir*14;}
  if(kind==='spring'){SP(g,zig(x,0,x+dir*16,0,4,5),'sy thin');return dir*16;}
  return 0;}
SYM.pvalve={ports:o=>{const t=o.t||'52',N=2,n0=o.n0??1;const P={};const px=PV_PX[t];for(const k in px)if(!PV_EX[t].includes(k))P[k]=[px[k][0],px[k][1]+(px[k][1]<0?-5:5)];
    const xl=-n0*30-15,xr=(N-1-n0)*30+15;if(o.L==='pilot')P['14']=[xl-14,0];if(o.R==='pilot')P['12']=[xr+14,0];return P;},
  bb:o=>{const n0=o.n0??1;return [-n0*30-15-34,-22,(1-n0)*30+15+34,30];},
  draw(g,o){const t=o.t||'52',n0=o.n0??1;const sg=sv('g',{class:'spool'},g);
    for(let k=0;k<2;k++){const bx=sv('g',{transform:`translate(${(k-n0)*30},0)`},sg);SR(bx,-15,-15,30,30,'syb');pvBox(bx,o.box[k],t);}
    const xl=-n0*30-15,xr=(1-n0)*30+15;if(o.L)pvAct(sg,o.L,xl,-1,o);if(o.R)pvAct(sg,o.R,xr,1,o);
    const px=PV_PX[t];for(const k in px){const [x,y]=px[k];SL(g,x,y,x,y+(y<0?-5:5),'sy');ST(g,x+(x<=0?-5:5),y+(y<0?-7:12),k,'st s');
      if(PV_EX[t].includes(k))SP(g,`M${x},${y+5} l-4,6 h8 z`,'syb');}
    if(o.L==='pilot')ST(g,xl-10,-8,'14','st s');if(o.R==='pilot')ST(g,xr+10,-8,'12','st s');
    return cs=>{const i=cs&&cs.i!=null?cs.i:n0;sg.setAttribute('transform',`translate(${(n0-i)*30},0)`);};}};
/* logic valves: kind 'and' (two-pressure) | 'or' (shuttle); inputs x (left) y (right), output o (top) */
SYM.plog={ports:o=>({x:[-24,0],y:[24,0],o:[0,-14]}),bb:o=>[-24,-14,24,9],
  draw(g,o){SR(g,-14,-7,28,14,'syb');SL(g,-24,0,-14,0);SL(g,14,0,24,0);SL(g,0,-7,0,-14);
    if(o.kind==='or'){SP(g,'M-10,-5 L-6,0 L-10,5','sy thin');SP(g,'M10,-5 L6,0 L10,5','sy thin');const b=SC(g,0,0,3.4,'syf');return cs=>{b.setAttribute('cx',clamp((cs&&cs.b)||0,-1,1)*5);};}
    SR(g,-11,-4,7,8,'syb');SR(g,4,-4,7,8,'syb');ST(g,0,3,'&','st s');return null;}};
SYM.psrc={ports:o=>({o:[0,-14]}),bb:o=>[-10,-14,10,10],draw(g){SC(g,0,0,9,'syb');SP(g,'M0,-6 L-5,3 H5Z','syb');SL(g,0,-9,0,-14);}};
B3.pvalve=(c,o)=>B3.dcv(c,{box:o.box,n0:o.n0??1,L:o.L==='spring'?'spring':o.L?'lever':undefined,R:o.R==='spring'?'spring':o.R?'lever':undefined});
B3.plog=(c,o)=>B3.box(c,{w:28,h:14});B3.psrc=(c,o)=>B3.pump(c,{});
const C24={b:.4,Cv:80,Cmax:60};
const c24Psi=r=>r<=C24.b?1:Math.sqrt(Math.max(0,1-((r-C24.b)/(1-C24.b))**2));
/* quasi-static stroke: supply ps on the inlet side, exhaust side meters out through conductance C [Nl/min/bar] */
function c24Move(ps,D,d,F,dir,C){const A1=H.A(D),A2=H.Aann(D,d);const Ain=dir>0?A1:A2,Aout=dir>0?A2:A1;const Ffr=.03*ps*A1/10+10;
  const pOut=(ps*Ain/10-F-Ffr)*10/Aout;if(pOut<0||C<=0)return {v:0,pIn:ps,pOut:0,stall:pOut<0,Qn:0,Ffr};
  const Ce=1/Math.sqrt(1/C**2+1/C24.Cv**2);const Qn=Ce*(pOut+1)*c24Psi(1/(pOut+1));return {v:H.v(Qn/(pOut+1),Aout),pIn:ps,pOut,stall:false,Qn,Ffr,choked:1/(pOut+1)<=C24.b};}
const c24Air=(D,d,S,ps)=>(H.A(D)+H.Aann(D,d))*S*(ps+1)/1e6;
const c24H=(st,vals,n,dtS)=>{if(st.ht==null||st.t-st.ht>=dtS){st.ht=st.t;st.hist.push([st.t,...vals]);if(st.hist.length>n)st.hist.shift();}};
const V52S={t:'52',box:['1>4 2>3 5|','1>2 4>5 3|'],n0:1};

/* ---------- 62 · basic pneumatics and logic: two pushbuttons, AND / OR, 5/2 valve, ויסות ביציאה (meter-out) ---------- */
const C24_LOGIC={id:'logic',n:62,t:'פנאומטיקה בסיסית ולוגיקה',d:'שני לחצנים, שסתום AND או OR, שסתום 5/2 וצילינדר עם צמצמי פליטה',
  P:{logic:'and',s1:false,s2:false,auto:true,ps:6,D:32,d:12,S:100,F:100,thr:30},
  key:()=>'p',
  click(id,P){if(id==='S1'){P.s1=!P.s1;P.auto=false;return true;}if(id==='S2'){P.s2=!P.s2;P.auto=false;return true;}return false;},
  ui(U,P){U.grp('לחצנים ולוגיקה');U.seg(P,'logic','אלמנט',[['and','AND','שסתום דו-לחצי – שני הלחצנים יחד (הפעלה בשתי ידיים)'],['or','OR','שסתום חילופין – כל אחד מהלחצנים']]);
    U.chk(P,'s1','לחצן S1 לחוץ');U.chk(P,'s2','לחצן S2 לחוץ');U.chk(P,'auto','רצף לחיצות אוטומטי');U.note('אפשר גם ללחוץ על S1 / S2 בשרטוט.');
    U.grp('אוויר וצילינדר',false);U.num(P,'ps','לחץ אספקה (ווסת)','bar',{min:1,max:10,step:.5});U.num(P,'F','עומס ביציאה','N',{min:0,max:600,step:10});U.num(P,'thr','פתיחת צמצם פליטה','%',{min:1,max:100,step:1});U.num(P,'D','קוטר בוכנה','mm',{min:12,max:100,step:2});},
  circuit(P){const comps=[{id:'PS',type:'psrc',x:60,y:340,name:'מקור אוויר דחוס (מדחס + מיכל)',lbl:'אוויר',lblAt:[-24,4]},{id:'FRL',type:'box',x:60,y:298,o:{w:40,h:18,t:'FRL',ports:{i:[0,9],o:[0,-9]}},name:'יחידת טיפול באוויר: מסנן, ווסת לחץ, משמן'},
      {id:'G0',type:'gauge',x:105,y:262,net:'S',name:'מד לחץ אספקה'},
      {id:'S1',type:'pvalve',x:150,y:200,o:{t:'32',box:['1>2 3|','2>3 1|'],n0:1,L:'btn',R:'spring'},name:'S1 – לחצן 3/2 רגיל סגור (לחיצה בשרטוט)',lbl:'S1',lblAt:[0,40]},
      {id:'S2',type:'pvalve',x:270,y:200,o:{t:'32',box:['1>2 3|','2>3 1|'],n0:1,L:'btn',R:'spring'},name:'S2 – לחצן 3/2 רגיל סגור (לחיצה בשרטוט)',lbl:'S2',lblAt:[0,40]},
      {id:'LG',type:'plog',x:205,y:150,o:{kind:P.logic},name:P.logic==='and'?'שסתום AND (דו-לחצי) – יציאה רק כששתי הכניסות בלחץ':'שסתום OR (חילופין) – יציאה מכל אחת מהכניסות',lbl:P.logic==='and'?'AND':'OR',lblAt:[0,22]},
      {id:'V1',type:'pvalve',x:400,y:160,o:Object.assign({},V52S,{L:'pilot',R:'spring'}),name:'שסתום 5/2 מופעל אוויר (פיקוד 14), חזרת קפיץ',lbl:'5/2',lblAt:[30,38]},
      {id:'C1',type:'cyl',x:400,y:30,o:{load:{t:'F'}},name:'צילינדר פנאומטי דו-פעולה',lbl:'צילינדר A',lblAt:[-80,-22],l3:[0,-34]},
      {id:'F1',type:'throttle1',x:350,y:94,o:{free:'up'},name:'צמצם אל-חוזר – חונק את האוויר היוצא בחזרה (meter-out)'},{id:'F2',type:'throttle1',x:450,y:94,o:{free:'up'},name:'צמצם אל-חוזר – חונק את האוויר היוצא ביציאה (meter-out)'},
      {id:'GA',type:'gauge',x:310,y:72,net:'A',name:'מד לחץ בתא הבוכנה'},{id:'GB',type:'gauge',x:492,y:72,net:'B',name:'מד לחץ בתא המוט בוכנה'},
      {id:'CH1',type:'chart',x:640,y:50,o:{w:160,h:85,t:'מהלך (כחול), p_A (אדום), p_B (כתום) – %',xl:'t [s]',yl:'%'},name:'מהלך ולחצים לאורך זמן'},
      {id:'CH2',type:'chart',x:640,y:215,o:{w:160,h:85,t:'מהירות יציאה מול עומס',xl:'F [N]',yl:'mm/s'},name:'עם צמצם פליטה המהירות כמעט לא תלויה בעומס – עד קרוב לעצירה'}];
    const lines=[{id:'L0',net:'S',pts:['PS.o','FRL.i']},{id:'LH',net:'S',pts:['FRL.o',[60,250],[400,250],'V1.1']},{id:'LG0',net:'S',pts:['G0.p',[105,250]]},
      {id:'LS1',net:'S',pts:[[143,250],'S1.1']},{id:'LS2',net:'S',pts:[[263,250],'S2.1']},
      {id:'LX',net:'X',pts:['S1.2',[143,150],'LG.x']},{id:'LY',net:'Y',pts:['S2.2',[263,150],'LG.y']},{id:'LZ',net:'Z',kind:'pilot',pts:['LG.o',[205,118],[320,118],[320,160],'V1.14']},
      {id:'LA',net:'A',pts:['V1.4',[393,128],[350,128],'F1.in']},{id:'LA2',net:'A',pts:['F1.out',[350,44]]},{id:'LB',net:'B',pts:['V1.2',[407,128],[450,128],'F2.in']},{id:'LB2',net:'B',pts:['F2.out',[450,44]]},
      {id:'LGA',net:'A',pts:['GA.p',[310,100],[350,100]]},{id:'LGB',net:'B',pts:['GB.p',[492,100],[450,100]]}];
    return {comps,lines};},
  init:P=>({x:0,t:0,hist:[],va:false,pA:0,pB:0,ph:0,mem:false}),
  step(P,st,dt,ctx){const f=ctx.fault;st.t+=dt;const ps=f==='lowp'?2.5:P.ps;
    if(P.auto){const ph=((Math.floor(st.t/2.5)%6)+6)%6;const pat=[[1,0],[0,0],[1,1],[0,0],[0,1],[0,0]][ph];P.s1=!!pat[0];P.s2=!!pat[1];}
    const lg=(f==='andor'||P.logic==='or')?(P.s1||P.s2):(P.s1&&P.s2);let a=lg;if(f==='spring'){if(lg)st.mem=true;a=a||st.mem;}
    const dir=a?1:-1;const C=(f==='thr'&&dir<0?.05:P.thr/100)*C24.Cmax;const Cx=f==='silencer'?Math.min(C,6):C;
    const m=c24Move(ps,P.D,P.d,dir>0?P.F:20,dir,Cx);const atEnd=(dir>0&&st.x>=P.S)||(dir<0&&st.x<=0);
    if(!atEnd)st.x=clamp(st.x+dir*m.v*dt,0,P.S);const end2=(dir>0&&st.x>=P.S)||(dir<0&&st.x<=0);
    const tA=dir>0?ps:(end2?0:m.pOut),tB=dir>0?(end2||m.stall?0:m.pOut):ps;if(m.stall){}
    KIT.ease(st,'pA',dir>0?ps:tA,dt,14);KIT.ease(st,'pB',dir>0?tB:ps,dt,14);
    c24H(st,[st.x/P.S*100,st.pA/ps*100,st.pB/ps*100],180,.05);const t0=st.hist.length?st.hist[0][0]:0;
    const A1=H.A(P.D);const Fmax=ps*A1/10;const curve=[];for(let k=0;k<=30;k++){const F=Fmax*k/30;curve.push([F,c24Move(ps,P.D,P.d,F,1,(P.thr/100)*C24.Cmax).v]);}
    const vm=KIT.nice(Math.max(...curve.map(c=>c[1]),10)*1.15);const pm=KIT.nice(Math.max(P.ps,6)*1.25);const mv=end2?0:m.v;
    const air=c24Air(P.D,P.d,P.S,ps);
    return {p:{S:ps,X:P.s1?ps:0,Y:P.s2?ps:0,Z:a?ps:0,A:st.pA,B:st.pB},q:{L0:mv?40:2,LH:mv?40:2,LG0:0,LS1:P.s1?5:0,LS2:P.s2?5:0,LX:P.s1?3:0,LY:P.s2?3:0,LZ:a?3:0,LA:dir>0?mv*2:-mv*2,LA2:dir>0?mv*2:-mv*2,LB:dir<0?mv*2:-mv*2,LB2:dir<0?mv*2:-mv*2,LGA:0,LGB:0},pmax:pm,qref:400,
      x:st.x,v:mv,dir,m,lg,a,ps,air,Fmax,
      c:{C1:{x:st.x/P.S,uA:st.pA/pm,uB:st.pB/pm,lt:`${fmt(P.F,0)} N`},S1:{i:P.s1?0:1},S2:{i:P.s2?0:1},V1:{i:a?0:1},LG:{b:P.s1&&!P.s2?1:P.s2&&!P.s1?-1:0},F1:{},F2:{},PS:{on:true,ang:KIT.rpmAng(st,dt,600)},
        CH1:{x:[t0,Math.max(t0+9,st.t)],y:[0,110],s:[{p:st.hist.map(h=>[h[0],h[1]]),c:'#2563eb'},{p:st.hist.map(h=>[h[0],h[2]]),c:'#dc2626'},{p:st.hist.map(h=>[h[0],h[3]]),c:'#f59e0b'}]},
        CH2:{x:[0,Fmax],y:[0,vm],s:[{p:curve,c:'#0b72d9'}],m:[P.F,c24Move(ps,P.D,P.d,P.F,1,(P.thr/100)*C24.Cmax).v]}},
      read:[{k:'S1 · S2 → פיקוד 14',v:(P.s1?10:0)+(P.s2?1:0),u:a?'→ 1':'→ 0',dg:0},{k:'מהלך',v:st.x,u:'mm',max:P.S},{k:'מהירות',v:dir*mv,u:'mm/s'},{k:'לחץ תא A',v:st.pA,u:'bar',max:pm},{k:'לחץ תא B (גב)',v:st.pB,u:'bar',max:pm},{k:'צריכת אוויר למחזור',v:air,u:'Nl',dg:2}]};},
  ins(P,R){const L=[];
    L.push({ic:'🔣',at:'LG',h:P.logic==='and'?`<b>AND</b>: הפיקוד מקבל אוויר רק כש-S1 <b>וגם</b> S2 לחוצים – הפעלה בשתי ידיים, הידיים מחוץ לאזור הסכנה.`:`<b>OR</b>: S1 <b>או</b> S2 מפעילים – למשל לחצן בשתי עמדות. הכדור חוסם את הכניסה השנייה כדי שהאוויר לא יברח דרך הלחצן השני.`});
    if(P.logic==='and'&&R.a&&!(P.s1&&P.s2))L.push({ic:'⛔',w:true,at:'LG',h:'בחרתם AND – אבל הצילינדר יוצא עם לחצן אחד! שסתום ה-AND הוחלף או עוקף. זו תקלת בטיחות.',c:'AND לא עובד!'});
    if(R.m.stall&&R.dir>0)L.push({ic:'🛑',w:true,at:'C1',h:`העומס ${fmt(P.F,0)} N גדול מהכוח הזמין (${fmt(R.ps*H.A(P.D)/10-R.m.Ffr,0)} N אחרי חיכוך) – הצילינדר לא זז.`,c:'עומס גדול מדי'});
    else if(R.v>0)L.push({ic:'💨',at:'F2',h:`צמצם פליטה: האוויר בתא ${R.dir>0?'B':'A'} נדחס ל-${fmt(R.m.pOut,1)} bar ויוצא ${R.m.choked?'<b>בזרימה חנוקה</b> – המהירות כמעט לא תלויה בעומס':'בזרימה תת-קולית – המהירות תלויה בעומס'}.`});
    L.push({ic:'🫧',h:`צריכת אוויר למחזור כפול: (A₁ + A₂)·s·(p+1) = <b>${fmt(R.air,2)} Nl</b> – אוויר דחוס יקר; מקטינים לחץ, קוטר ומהלך כשאפשר.`});
    return L;},
  calc(P,R){const A1=H.A(P.D),A2=H.Aann(P.D,P.d);const m=c24Move(R.ps,P.D,P.d,P.F,1,(P.thr/100)*C24.Cmax);
    return `<div class="kpis">${kpi('כוח יציאה תאורטי',fmt(R.ps*A1/10,0),'N')}${kpi('כוח חזרה',fmt(R.ps*A2/10,0),'N')}${kpi('מהירות יציאה',fmt(m.v,0),'mm/s')}${kpi('אוויר למחזור',fmt(R.air,2),'Nl')}</div>`+
    det('כוחות',row('',`F = p·A/10 = ${R.ps}·${fmt(A1,0)}/10 = ${V(R.ps*A1/10,'N')}`)+row('חיכוך (הערכה)',`F_ח = 3%·F + 10 = ${V(m.Ffr,'N')}`),true)+
    det('צמצם פליטה (ISO 6358)',row('לחץ גב',`p_B = (p·A₁ − F − F_ח)/A₂ = ${V(m.pOut,'bar')}`)+row('יחס לחצים',`r = 1/(p_B+1) = ${fmt(1/(m.pOut+1),3)} ${1/(m.pOut+1)<=C24.b?'≤':'>'} b = ${C24.b} ⇒ ${m.choked?'חנוקה':'תת-קולית'}`)+row('',`Q_N = C·(p_B+1)·ψ ; v = Q_N/((p_B+1)·A₂) = ${V(m.v,'mm/s')}`),true)+
    det('צריכת אוויר',row('',`V_N = (A₁ + A₂)·s·(p+1) = (${fmt(A1,0)} + ${fmt(A2,0)})·${P.S}·${R.ps+1}/10⁶ = ${V(R.air,'Nl',3)}`))+`<div class="note">בזרימה חנוקה Q_N ∝ (p_B+1), ולכן v = Q_N/((p_B+1)·A₂) לא תלוי בלחץ הגב – זו הסיבה שצמצם פליטה נותן מהירות יציבה בפנאומטיקה.</div>`;},
  demo:[{t:'מעגל פנאומטי',x:'מקור אוויר, יחידת טיפול באוויר (FRL), שני לחצנים 3/2, שסתום לוגי, שסתום 5/2 מופעל אוויר וצילינדר. בפנאומטיקה האוויר <b>נפלט לאטמוספירה</b> (משולשים ריקים) – אין קו חזרה.',reset:true,set:{auto:false,s1:false,s2:false},hl:['PS','FRL']},
    {t:'AND – שתי ידיים',x:'לוחצים רק על S1: האוויר מגיע ל-AND – ונעצר. אין פיקוד, הצילינדר לא זז.',set:{s1:true},hl:['S1','LG'],dur:4},
    {t:'שני הלחצנים',x:'S1 + S2: ה-AND פותח, הפיקוד 14 מעביר את ה-5/2, והצילינדר יוצא.',set:{s2:true},hl:['LG','V1','C1'],dur:4},
    {t:'OR',x:'מחליפים ל-OR: כל לחצן לבד מפעיל. הכדור במרכז חוסם את הצד השני.',set:{logic:'or',s2:false},hl:['LG'],dur:5},
    {t:'צמצם פליטה',x:'מורידים את פתיחת הצמצם ל-10% – הצילינדר זז לאט. בגרף הימני: המהירות כמעט קבועה עד שהעומס כמעט עוצר אותו.',set:{auto:true,thr:10},hl:['F2','CH2'],dur:8}],
  predict:[{q:'מצב AND. לוחצים רק על S1. מה יקרה?',set:{logic:'and',auto:false,s1:true,s2:false},opts:['הצילינדר יוצא','הצילינדר לא זז','הצילינדר יוצא לאט'],a:1,dur:3,why:'שסתום AND צריך לחץ בשתי הכניסות. בלי S2 אין פיקוד ל-5/2.'},
    {q:'צמצם פליטה, העומס עולה מ-100 ל-250 N. מהירות היציאה:',set:{auto:true,F:250},opts:['יורדת בחצי','כמעט לא משתנה','עולה'],a:1,dur:6,why:'האוויר יוצא בזרימה חנוקה: Q_N ∝ (p_B+1) ולכן המהירות לא תלויה בלחץ הגב – כל עוד יחס הלחצים נמוך מ-b.'},
    {q:'מעלים את לחץ האספקה מ-6 ל-8 bar. צריכת האוויר למחזור:',set:{ps:8},opts:['לא משתנה','עולה בערך ב-30%','עולה פי 2'],a:1,dur:3,why:'הצריכה ∝ (p+1): (8+1)/(6+1) = 1.29.'}],
  tasks:[{q:P=>`לחץ ${P.ps} bar, בוכנה Ø${P.D}. מה כוח היציאה התאורטי? (N)`,a:P=>P.ps*H.A(P.D)/10,u:'N',hint:'F = p·A/10 (bar, mm² → N).',rand:P=>{P.ps=pick([4,5,6,7]);P.D=pick([20,25,32,40,50]);}},
    {q:P=>`Ø${P.D}/${P.d}, מהלך ${P.S} mm, ${P.ps} bar. צריכת אוויר למחזור כפול? (Nl)`,a:P=>c24Air(P.D,P.d,P.S,P.ps),u:'Nl',hint:'V_N = (A₁ + A₂)·s·(p+1)/10⁶.',rand:P=>{P.D=pick([25,32,40]);P.d=P.D===25?10:P.D===32?12:16;P.S=pick([50,100,200]);P.ps=pick([5,6,7]);}},
    {q:P=>`לחץ ${P.ps} bar, Ø${P.D}/${P.d}. מה כוח החזרה? (N)`,a:P=>P.ps*H.Aann(P.D,P.d)/10,u:'N',hint:'F = p·(A₁ − A_מוט)/10.',rand:P=>{P.ps=pick([4,6,8]);P.D=pick([32,40,50]);P.d=P.D===32?12:P.D===40?16:20;}}],
  faults:[{id:'andor',t:'שסתום AND הוחלף ב-OR',sym:'"המפעיל מספר שהמכבש יוצא גם כשלוחצים רק על לחצן אחד."',hint:'לחצו רק על S1 במצב AND. מה קורה?',why:'אלמנט הלוגיקה הוא בפועל OR – הפעלה ביד אחת. תקלת בטיחות חמורה: מחליפים מיד.',set:{logic:'and',auto:true}},
    {id:'spring',t:'קפיץ שבור בשסתום 5/2',sym:'"הצילינדר יוצא – ונשאר בחוץ גם כשעוזבים את הלחצנים."',hint:'מה מחזיר את השסתום למצב הרגיל?',why:'בלי קפיץ השסתום נשאר במצב a (התנהגות "זיכרון"). מחליפים קפיץ או שסתום.'},
    {id:'thr',t:'צמצם F1 סגור כמעט לגמרי',sym:'"היציאה רגילה, אבל החזרה איטית מאוד."',hint:'איזה צמצם חונק את האוויר היוצא בחזרה?',why:'בחזרה האוויר יוצא מתא A דרך F1 (meter-out). כמעט סגור ⇒ חזרה איטית.'},
    {id:'lowp',t:'ווסת לחץ מכוון נמוך (2.5 bar)',sym:'"עם עומס כבד הצילינדר לא יוצא, בלי עומס הוא עובד."',hint:'מה מראה מד לחץ האספקה?',why:'בלחץ נמוך הכוח קטן מהעומס + חיכוך. מכוונים את הווסת.',set:{F:300}},
    {id:'silencer',t:'משתיק פליטה סתום',sym:'"שתי התנועות איטיות, גם כשהצמצמים פתוחים לגמרי."',hint:'פתחו את הצמצמים ל-100%. האם המהירות עולה?',why:'האוויר לא מצליח לצאת מפתחי הפליטה (3/5). מנקים או מחליפים משתיק.',set:{thr:100}}],
  test(H){const P=clone(this.P);const A1=H.A(32),A2=H.Aann(32,12);const m=c24Move(6,32,12,100,1,18);const Ffr=.03*6*A1/10+10;const pB=(6*A1/10-100-Ffr)*10/A2;const Ce=1/Math.sqrt(1/18**2+1/80**2);
    const m2=c24Move(6,32,12,250,1,18);const P2=clone(this.P);P2.auto=false;P2.s1=true;P2.s2=false;const R1=runSim(this,P2,1).R;P2.s2=true;const st=this.init(P2);let R2;for(let t=0;t<2;t+=.02)R2=this.step(P2,st,.02,{});
    return [['p_B = (pA₁ − F − F_ח)/A₂',m.pOut,pB,.001],['חנוקה: v = C_e/A₂',m.v,H.v(Ce,A2),.001],['עומס ×2.5 ⇒ אותה מהירות (חנוקה)',m2.v,m.v,.001],['AND עם S1 בלבד: לא יוצא',R1.x,0],['AND עם שניהם: מגיע לסוף',R2.x,100,.001],
      ['אוויר: (A₁+A₂)·s·(p+1)',c24Air(32,12,100,6),(A1+A2)*100*7/1e6,.001],['UI מהלך',R2.read[1].v,R2.x,.001]];}};

/* ---------- 63 · sequence with roller limit valves: A+ B+ A− B− (and A+ B+ B− A− with idle-return rollers) ---------- */
const C24_MAP={abab:{A14:'b0',A12:'b1',B14:'a1',B12:'a0'},abba:{A14:'a0',A12:'b0',B14:'a1',B12:'b1'}};
const C24_SEQ={id:'seq',n:63,t:'רצף פנאומטי A+ B+ A− B−‎',d:'שני צילינדרים, שני שסתומי זיכרון 5/2 וארבעה שסתומי גלגלת: דיאגרמת מהלך–צעד וחסימת אותות',
  P:{seq:'abab',idle:false,cont:true,ps:6,FA:80,FB:150,thr:30,S:100,go:0,tva:200,tvb:150},
  key:P=>P.seq+(P.idle?'i':''),
  ui(U,P){U.grp('רצף');U.seg(P,'seq','רצף',[['abab','A+B+A−B−‎','רצף ללא חסימת אותות'],['abba','A+B+B−A−‎','רצף עם חסימת אותות']],true);
    if(P.seq==='abba')U.chk(P,'idle','גלגלות חד-כיווניות ב-a1 ו-b0',true);U.chk(P,'cont','התחלה רציפה (מחזור חוזר)');U.btn('▶ התחלה (מחזור אחד)',()=>{P.go=(P.go||0)+1;});
    U.grp('אוויר ועומסים',false);U.num(P,'ps','לחץ אספקה','bar',{min:2,max:10,step:.5});U.num(P,'FA','עומס A','N',{min:0,max:400,step:10});U.num(P,'FB','עומס B','N',{min:0,max:400,step:10});U.num(P,'thr','פתיחת צמצמים','%',{min:5,max:100,step:5});},
  circuit(P){const mp=C24_MAP[P.seq];const idle=P.seq==='abba'&&P.idle;const rl=k=>({t:'32',box:['1>2 3|','2>3 1|'],n0:1,L:'roller',R:'spring',idle:idle&&(k==='a1'||k==='b0')});
    const comps=[{id:'PS',type:'psrc',x:20,y:350,name:'מקור אוויר דחוס'},{id:'FRL',type:'box',x:20,y:318,o:{w:34,h:16,t:'FRL',ports:{i:[0,8],o:[0,-8]}},name:'יחידת טיפול באוויר'},
      {id:'CA',type:'cyl',x:130,y:40,name:'צילינדר A',lbl:'A',lblAt:[-70,-20],l3:[0,-30]},{id:'CB',type:'cyl',x:400,y:40,name:'צילינדר B',lbl:'B',lblAt:[-70,-20],l3:[0,-30]},
      {id:'NA0',type:'note',x:92,y:14,o:{t:'a0'}},{id:'NA1',type:'note',x:226,y:14,o:{t:'a1'}},{id:'NB0',type:'note',x:362,y:14,o:{t:'b0'}},{id:'NB1',type:'note',x:496,y:14,o:{t:'b1'}},
      {id:'VA',type:'pvalve',x:130,y:150,o:Object.assign({},V52S,{L:'pilot',R:'pilot'}),name:'שסתום זיכרון (דו-יציב) 5/2 של A (קווי פיקוד 14 ו-12)',lbl:'VA',lblAt:[0,38]},
      {id:'VB',type:'pvalve',x:400,y:150,o:Object.assign({},V52S,{L:'pilot',R:'pilot'}),name:'שסתום זיכרון 5/2 של B',lbl:'VB',lblAt:[0,38]},
      {id:'ST',type:'pvalve',x:30,y:240,o:{t:'32',box:['1>2 3|','2>3 1|'],n0:1,L:'btn',R:'spring'},name:'לחצן התחלה',lbl:'START',lblAt:[0,40]},
      {id:'R1',type:'pvalve',x:80,y:240,o:rl(mp.A14),name:`גלגלת ${mp.A14} → פיקוד A+ (בטור עם לחצן ההפעלה)`,lbl:mp.A14,lblAt:[0,40]},
      {id:'R2',type:'pvalve',x:180,y:240,o:rl(mp.A12),name:`גלגלת ${mp.A12} → פיקוד A−`,lbl:mp.A12,lblAt:[0,40]},
      {id:'R3',type:'pvalve',x:330,y:240,o:rl(mp.B14),name:`גלגלת ${mp.B14} → פיקוד B+`,lbl:mp.B14,lblAt:[0,40]},
      {id:'R4',type:'pvalve',x:460,y:240,o:rl(mp.B12),name:`גלגלת ${mp.B12} → פיקוד B−`,lbl:mp.B12,lblAt:[0,40]},
      {id:'CH1',type:'chart',x:660,y:60,o:{w:170,h:90,t:'דיאגרמת מקום–זמן: A (למעלה) B (למטה)',xl:'t [s]',yl:''},name:'דיאגרמת מקום–זמן'},
      {id:'CH2',type:'chart',x:660,y:235,o:{w:170,h:90,t:'אותות פיקוד: A+ A− B+ B− (מלמעלה)',xl:'t [s]',yl:''},name:'אותות הפיקוד – חפיפה של A+ ו-A− = חסימת אותות'}];
    const lines=[{id:'L0',net:'S',pts:['PS.o','FRL.i']},{id:'LH',net:'S',pts:['FRL.o',[20,292],[453,292]]},{id:'LVA',net:'S',pts:[[130,292],'VA.1']},{id:'LVB',net:'S',pts:[[400,292],'VB.1']},
      {id:'LST',net:'S',pts:[[23,292],'ST.1']},{id:'LR2',net:'S',pts:[[173,292],'R2.1']},{id:'LR3',net:'S',pts:[[323,292],'R3.1']},{id:'LR4',net:'S',pts:[[453,292],'R4.1']},
      {id:'LSR',net:'G',pts:['ST.2',[23,206],[50,206],[50,275],[73,275],'R1.1']},
      {id:'LP1',net:'P1',kind:'pilot',pts:['R1.2',[73,196],[52,196],[52,150],'VA.14']},{id:'LP2',net:'P2',kind:'pilot',pts:['R2.2',[173,150],'VA.12']},
      {id:'LP3',net:'P3',kind:'pilot',pts:['R3.2',[323,150],'VB.14']},{id:'LP4',net:'P4',kind:'pilot',pts:['R4.2',[453,150],'VB.12']},
      {id:'LAa',net:'Aa',pts:['VA.4',[123,108],[80,108],'CA.A']},{id:'LAb',net:'Ab',pts:['VA.2',[137,98],[180,98],'CA.B']},
      {id:'LBa',net:'Ba',pts:['VB.4',[393,108],[350,108],'CB.A']},{id:'LBb',net:'Bb',pts:['VB.2',[407,98],[450,98],'CB.B']}];
    return {comps,lines};},
  init:P=>({xA:0,xB:0,va:'b',vb:'b',t:0,hist:[],sh:[],pa1:0,pb0:0,go:P.go||0,gp:0,tc:0,ta:null,conf:0,cyc:0}),
  step(P,st,dt,ctx){const f=ctx.fault;st.t+=dt;const ps=f==='lowp'?2.2:P.ps;const S=P.S;const mp=C24_MAP[P.seq];const idle=P.seq==='abba'&&P.idle;
    if((P.go||0)!==st.go){st.go=P.go||0;st.gp=.6;}st.gp=Math.max(0,st.gp-dt);const start=P.cont||st.gp>0;
    const C=(P.thr/100)*C24.Cmax;const dA=st.va==='a'?1:-1,dB=st.vb==='a'?1:-1;
    const mA=c24Move(ps,32,12,dA>0?P.FA:10,dA,f==='silencer'?Math.min(C,4):C),mB=c24Move(ps,32,12,dB>0?P.FB:10,dB,C);
    const pxA=st.xA,pxB=st.xB;st.xA=clamp(st.xA+dA*mA.v*dt,0,S);st.xB=clamp(st.xB+dB*mB.v*dt,0,S);
    if(dA>0&&pxA<.92*S&&st.xA>=.92*S)st.pa1=.25;if(dB<0&&pxB>.08*S&&st.xB<=.08*S)st.pb0=.25;st.pa1=Math.max(0,st.pa1-dt);st.pb0=Math.max(0,st.pb0-dt);
    const sw={a0:st.xA<=.5,a1:st.xA>=S-.5,b0:st.xB<=.5,b1:st.xB>=S-.5};if(idle){sw.a1=st.pa1>0;sw.b0=st.pb0>0;}if(f==='a1miss')sw.a1=false;if(f==='b1stuck')sw.b1=true;
    const sig={A14:start&&sw[mp.A14],A12:sw[mp.A12],B14:sw[mp.B14],B12:sw[mp.B12]};
    const upd=(v,p14,p12)=>p14&&!p12?'a':p12&&!p14?'b':v;const ova=st.va;st.va=upd(st.va,sig.A14,sig.A12);st.vb=upd(st.vb,sig.B14,sig.B12);
    const conf=(sig.A14&&sig.A12)||(sig.B14&&sig.B12);st.conf=conf?st.conf+dt:0;
    if(ova==='b'&&st.va==='a'){if(st.ta!=null){st.tc=st.t-st.ta;st.cyc++;}st.ta=st.t;}
    c24H(st,[1.25+st.xA/S,st.xB/S],240,.05);if(st.sht==null||st.t-st.sht>=.05){st.sht=st.t;st.sh.push([st.t,sig.A14?3.9:3.3,sig.A12?2.8:2.2,sig.B14?1.7:1.1,sig.B12?.6:0]);if(st.sh.length>240)st.sh.shift();}
    const t0=st.hist.length?st.hist[0][0]:0,t1=Math.max(t0+12,st.t);const pm=KIT.nice(Math.max(P.ps,6)*1.25);
    const pc=(m,d,x)=>{const end=(d>0&&x>=S)||(d<0&&x<=0);return d>0?[ps,end?0:m.pOut]:[end?0:m.pOut,ps];};const [pAa,pAb]=pc(mA,dA,st.xA),[pBa,pBb]=pc(mB,dB,st.xB);
    const vA=(dA>0&&st.xA>=S)||(dA<0&&st.xA<=0)?0:mA.v,vB=(dB>0&&st.xB>=S)||(dB<0&&st.xB<=0)?0:mB.v;const air=2*c24Air(32,12,S,ps);
    return {p:{S:ps,G:start?ps:0,P1:sig.A14?ps:0,P2:sig.A12?ps:0,P3:sig.B14?ps:0,P4:sig.B12?ps:0,Aa:pAa,Ab:pAb,Ba:pBa,Bb:pBb},
      q:{L0:5,LH:5,LVA:vA?20:0,LVB:vB?20:0,LST:0,LR2:0,LR3:0,LR4:0,LSR:0,LP1:sig.A14?2:0,LP2:sig.A12?2:0,LP3:sig.B14?2:0,LP4:sig.B12?2:0,LAa:dA*vA/10,LAb:-dA*vA/10,LBa:dB*vB/10,LBb:-dB*vB/10},pmax:pm,qref:30,
      sig,sw,conf,xA:st.xA,xB:st.xB,vA,vB,air,tc:st.tc,ps,
      c:{CA:{x:st.xA/S,uA:pAa/pm,uB:pAb/pm},CB:{x:st.xB/S,uA:pBa/pm,uB:pBb/pm},VA:{i:st.va==='a'?0:1},VB:{i:st.vb==='a'?0:1},ST:{i:start?0:1},
        R1:{i:sw[mp.A14]?0:1},R2:{i:sw[mp.A12]?0:1},R3:{i:sw[mp.B14]?0:1},R4:{i:sw[mp.B12]?0:1},PS:{on:true,ang:KIT.rpmAng(st,dt,600)},
        CH1:{x:[t0,t1],y:[-.1,2.4],s:[{p:st.hist.map(h=>[h[0],h[1]]),c:'#2563eb'},{p:st.hist.map(h=>[h[0],h[2]]),c:'#ea580c'},{p:[[t0,1.25],[t0+1e4,1.25]],c:'#cbd5e1',d:true}]},
        CH2:{x:[t0,t1],y:[-.1,4.1],s:[1,2,3,4].map((k,j)=>({p:st.sh.map(h=>[h[0],h[k]]),c:['#2563eb','#93c5fd','#ea580c','#fdba74'][j]}))}},
      read:[{k:'מהלך A',v:st.xA,u:'mm',max:S},{k:'מהלך B',v:st.xB,u:'mm',max:S},{k:'זמן מחזור',v:st.tc,u:'s',dg:2},{k:'חסימת אותות',v:conf?1:0,u:conf?'כן':'לא',dg:0,w:st.conf>.5},{k:'אוויר למחזור',v:air,u:'Nl',dg:2}]};},
  ins(P,R){const L=[];const mp=C24_MAP[P.seq];
    L.push({ic:'🔁',at:'CH1',h:P.seq==='abab'?`לחצן ההפעלה ו-${mp.A14} מפעילים את A+. אחר כך ${mp.B14} מפעילה את B+, ‏${mp.A12} את A−, ו-${mp.B12} את B−. כל גלגלת "מדווחת" שהצעד הקודם הסתיים.`:`לחצן ההפעלה ו-a0 מפעילים את A+. אחר כך a1 מפעילה את B+, ‏b1 את B−, ו-b0 את A−.`});
    if(R.conf)L.push({ic:'⛔',w:true,at:R.sig.A14&&R.sig.A12?'VA':'VB',h:`<b>חסימת אותות</b>: לשסתום ${R.sig.A14&&R.sig.A12?'VA':'VB'} מגיע אוויר לשני קווי הפיקוד (14 ו-12) יחד – הוא לא מחליף מצב והרצף נתקע. בגרף האותות רואים שני קווים "למעלה" באותו זמן.`,c:'חסימת אותות!'});
    if(P.seq==='abba'&&!P.idle)L.push({ic:'💡',h:'פתרון: גלגלת חד-כיוונית (Idle return) ב-a1 ו-b0 – היא נותנת פולס קצר רק כשהמוט עובר בכיוון אחד, ולא מחזיקה אות. פתרון נוסף: Cascade.'});
    if(P.seq==='abba'&&P.idle)L.push({ic:'✅',at:'R3',h:'הגלגלות החד-כיווניות נותנות פולס בלבד – אין חפיפה בין קווי הפיקוד, והרצף רץ. שימו לב: הגלגלת מותקנת מעט לפני סוף המהלך.'});
    if(R.tc>0)L.push({ic:'⏱️',h:`זמן מחזור ${fmt(R.tc,2)} s. אוויר: ${fmt(R.air,2)} Nl למחזור.`});
    return L;},
  calc(P,R){const A1=H.A(32),A2=H.Aann(32,12);const vA=c24Move(P.ps,32,12,P.FA,1,(P.thr/100)*C24.Cmax).v,vAr=c24Move(P.ps,32,12,10,-1,(P.thr/100)*C24.Cmax).v,vB=c24Move(P.ps,32,12,P.FB,1,(P.thr/100)*C24.Cmax).v,vBr=c24Move(P.ps,32,12,10,-1,(P.thr/100)*C24.Cmax).v;
    const T=P.S/vA+P.S/vAr+P.S/vB+P.S/vBr;
    return `<div class="kpis">${kpi('זמן מחזור מחושב',fmt(T,2),'s')}${kpi('נמדד',fmt(R.tc,2),'s')}${kpi('אוויר למחזור',fmt(R.air,2),'Nl')}${kpi('כוח A (Ø32)',fmt(P.ps*A1/10,0),'N')}</div>`+
    det('זמן מחזור',row('',`T = s/v_A+ + s/v_B+ + s/v_A− + s/v_B− = ${P.S}/${fmt(vA,0)} + ${P.S}/${fmt(vB,0)} + ${P.S}/${fmt(vAr,0)} + ${P.S}/${fmt(vBr,0)} = ${V(T,'s',2)}`),true)+
    det('טבלת אותות',`<div class="note">${Object.entries(C24_MAP[P.seq]).map(([k,v])=>`${k} ← ${k==='A14'?'לחצן ההפעלה·':''}${v}`).join(' · ')}<br>חסימה: אם אות של צעד מסוים עדיין קיים כשצריך את הצעד ההפוך באותו שסתום.</div>`)+
    det('צריכת אוויר',row('',`V_N = 2·(A₁ + A₂)·s·(p+1) = ${V(R.air,'Nl',3)}`));},
  demo:[{t:'רצף A+ B+ A− B−',x:'שני צילינדרים עם שסתומי <b>זיכרון</b> 5/2 (פיקוד בכל צד) וארבע גלגלות: a0/a1 בקצוות של A, b0/b1 בקצוות של B.',reset:true,set:{seq:'abab',cont:true},hl:['CA','CB','VA','VB']},
    {t:'הגלגלות מחליטות',x:'A יוצא ולוחץ על a1, ואז B יוצא ולוחץ על b1, ואז A חוזר ללחוץ על a0, ואז B חוזר. כל צעד מתחיל רק כשהקודם הסתיים.',hl:['R3','R2','R4'],dur:8},
    {t:'דיאגרמת מקום–זמן',x:'הגרף העליון: A (כחול) ו-B (כתום). זו השפה המקובלת לתיאור רצפים.',hl:['CH1'],dur:6},
    {t:'רצף עם חסימה',x:'A+ B+ B− A−: כבר בהתחלה b0 לוחץ על A− יחד עם לחצן ההפעלה על A+ – <b>חסימת אותות</b>. כלום לא זז.',set:{seq:'abba',idle:false},hl:['VA','CH2'],dur:6},
    {t:'גלגלת חד-כיוונית',x:'מחליפים את a1 ו-b0 לגלגלות חד-כיווניות: פולס בלבד – הרצף רץ.',set:{idle:true},hl:['R1','R3','CH1'],dur:9}],
  predict:[{q:'רצף A+ B+ B− A− עם גלגלות רגילות. מה יקרה כשמתחילים?',set:{seq:'abba',idle:false},opts:['המחזור רץ רגיל','A לא יוצא – שני קווי הפיקוד של VA פעילים','B יוצא ראשון'],a:1,dur:3,why:'b0 לחוץ (B בבית) ומפעיל את A−, ו-לחצן ההפעלה מפעיל את A+. שסתום זיכרון עם שני קווי פיקוד לא זז.'},
    {q:'ברצף A+ B+ A− B−, מה מפעיל את B+?',set:{seq:'abab'},opts:['b1','a1','a0'],a:1,dur:4,why:'כש-A מגיע לסוף המהלך הוא לוחץ על a1, שמפעיל את פיקוד 14 של VB.'}],
  tasks:[{q:P=>`מהירויות: A ${P.tva} mm/s בשני הכיוונים, B ${P.tvb} mm/s, מהלך ${P.S} mm. מה זמן המחזור (בלי השהיות)? (s)`,a:P=>2*P.S/P.tva+2*P.S/P.tvb,u:'s',hint:'T = Σ s/v לכל ארבעת הצעדים.',rand:P=>{P.tva=pick([100,200,250]);P.tvb=pick([100,150,200]);P.S=pick([50,100,150]);}},
    {q:P=>`שני צילינדרים Ø32/12, מהלך ${P.S} mm, ${P.ps} bar. צריכת אוויר למחזור? (Nl)`,a:P=>2*c24Air(32,12,P.S,P.ps),u:'Nl',hint:'V_N = 2·(A₁+A₂)·s·(p+1)/10⁶.',rand:P=>{P.S=pick([50,100,200]);P.ps=pick([5,6,7]);}}],
  faults:[{id:'a1miss',t:'גלגלת a1 לא מכוונת (המוט לא נוגע בה)',sym:'"A יוצא – ושם הכול נעצר."',hint:'מה אמור להפעיל את B+? האם האות מגיע?',why:'a1 לא מופעלת – אין אות ל-B+. מכוונים את מיקום הגלגלת.',set:{seq:'abab'}},
    {id:'b1stuck',t:'גלגלת b1 תקועה לחוצה',sym:'"אחרי החלפת חלקים המכונה לא מתחילה בכלל."',hint:'הסתכלו בגרף האותות: אילו קווי פיקוד פעילים ביחד?',why:'b1 נותנת אות A− כל הזמן – יחד עם A+ זו חסימה. משחררים/מחליפים את הגלגלת.',set:{seq:'abab'}},
    {id:'lowp',t:'לחץ אספקה נמוך (2.2 bar)',sym:'"A זז, אבל B (העומס הכבד) לא יוצא."',hint:'השוו את הכוח של B לעומס.',why:'בלחץ נמוך הכוח של B קטן מהעומס + חיכוך – B לא מגיע ל-b1 והרצף נתקע.',set:{seq:'abab',FB:200}},
    {id:'silencer',t:'משתיק פליטה סתום בשסתום A',sym:'"זמן המחזור התארך מאוד – A איטי בשני הכיוונים."',hint:'מה מגביל את יציאת האוויר מ-A?',why:'האוויר של A לא מצליח לצאת דרך הפליטה – מנקים או מחליפים משתיק.',set:{seq:'abab'}}],
  test(H){const P=clone(this.P);const st=this.init(P);let R,seen={};for(let t=0;t<6;t+=.02){R=this.step(P,st,.02,{});seen[R.sig.B14?'B14':'']=1;}
    const P2=clone(this.P);P2.seq='abba';const s2=this.init(P2);let R2;for(let t=0;t<3;t+=.02)R2=this.step(P2,s2,.02,{});
    const P3=clone(this.P);P3.seq='abba';P3.idle=true;const s3=this.init(P3);let R3;for(let t=0;t<8;t+=.02)R3=this.step(P3,s3,.02,{});
    const vA=c24Move(6,32,12,80,1,18).v,vAr=c24Move(6,32,12,10,-1,18).v,vB=c24Move(6,32,12,150,1,18).v,vBr=c24Move(6,32,12,10,-1,18).v;
    return [['A+B+A−B− רץ (מחזורים ≥ 1)',st.cyc>=1?1:0,1],['זמן מחזור ≈ Σ s/v',st.tc,100/vA+100/vB+100/vAr+100/vBr,.08],['A+B+B−A− ללא פתרון: חסימה, A לא זז',R2.conf&&R2.xA===0?1:0,1],['עם גלגלות חד-כיווניות: רץ',s3.cyc>=1?1:0,1],['UI מהלך A',R.read[0].v,R.xA,.001]];}};

LABS.push({ch:24,title:'פנאומטיקה',sims:[C24_LOGIC,C24_SEQ]});
}
