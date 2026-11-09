/* lab 26 – same code as the website */
{




/* ===================== Chapter 26 – maintenance and troubleshooting: faulty machine, 10-step search (65), fault library healthy-vs-faulty (66) ===================== */
/* One press machine: fixed pump → suction strainer, flow test point, relief, 4/3 tandem DCV, Ø80/45 cylinder, return filter, cooler.
   Faults change the component characteristics; the quasi-static solver finds speed and pressures for every fault. */
const C26={A1:H.A(80),A2:H.Aann(80,45),kd:17,CEN:['P>A B>T','P-T A| B|','P>B A>T']};
const C26_F={none:'מכונה תקינה',pump:'משאבה שחוקה (דליפה פנימית)',relief:'שסתום פריקה מכויל נמוך / דולף',seal:'אטם בוכנה עוקף בצילינדר',spool:'ספול (מגופה) שחוק בשסתום הפיקוד (דליפה P→T)',coil:'סולנואיד a שרוף / לא מחובר',
  suction:'מסנן יניקה סתום',retfilter:'מסנן חוזר סתום (עוקף פתוח)',reverse:'מנוע מסתובב הפוך (אחרי חיווט)',lowoil:'מפלס שמן נמוך – אוויר נשאב',cooler:'מקרר לא עובד (מאוורר תקוע)',air:'אוויר כלוא בצילינדר ובקווים'};
/* pump / valve characteristics for fault f at oil temperature T [°C]; flows L/min, pressures bar */
function c26Sys(P,f,T){const kv=clamp(1+(T-45)/35,.6,2.5);
  const Qg=f==='reverse'?0:P.Q*(f==='suction'?.7:f==='lowoil'?.85:1);const cpl=(f==='pump'?.12:.01)*kv;
  const pr=f==='relief'?70:P.pr;const ov=Math.max(3,.06*pr);const ks=(f==='spool'?1.4:.03)*kv;const kl=(f==='seal'?2.5:.002)*kv;const pT=.9+(f==='retfilter'?6:0);
  return {kv,Qg,cpl,pr,ov,ks,kl,pT,Qp:p=>Math.max(0,Qg-cpl*Math.max(p,0)),Qr:p=>H.reliefQ(p,pr,ov,P.Q),Qs:p=>ks*Math.sqrt(Math.max(p-pT,0)),QL:dp=>kl*Math.sqrt(Math.max(dp,0))};}
/* dir +1 extend (load P.F), −1 retract (P.Fr), 0 centre; blocked = end of stroke */
function c26Solve(P,f,T,dir,blocked){const S=c26Sys(P,f,T);const A1=C26.A1,A2=C26.A2,kd=C26.kd;let r;
  if(dir===0||(f==='coil'&&dir>0)){let ps=S.pT;for(let i=0;i<5;i++)ps=S.pT+H.orDp(kd,S.Qp(ps));
    r={v:0,ps,pIn:.5,pOut:.5,Qin:0,QL:0,stall:false,center:true};}
  else{const Ain=dir>0?A1:A2,Aout=dir>0?A2:A1,Fl=dir>0?P.F:P.Fr;
    const st=v=>{let QL=0,pOut=S.pT,pIn=0;for(let i=0;i<8;i++){pOut=S.pT+H.orDp(kd,H.Q(v,Aout)+QL);pIn=(Fl*1e4+pOut*Aout)/Ain;QL=S.QL(pIn-pOut);}const Qin=H.Q(v,Ain)+QL;return {v,Qin,QL,pIn,pOut,ps:pIn+H.orDp(kd,Qin)};};
    const sup=p=>S.Qp(p)-S.Qr(p)-S.Qs(p);const g=v=>{const s=st(v);return sup(s.ps)-s.Qin;};
    if(blocked||g(0)<=0){const h=p=>sup(p)-S.QL(p-S.pT);const ps=H.bisect(h,0,S.pr+S.ov*1.5+5);const QL=S.QL(ps-S.pT);
      r={v:0,ps,pIn:ps,pOut:S.pT+H.orDp(kd,QL),Qin:QL,QL,stall:!blocked};}
    else{const v=H.bisect(g,0,H.v(P.Q*1.3,Ain));r={...st(v),stall:false};}
    r.Qout=H.Q(r.v,Aout)+r.QL;}
  r.S=S;r.dir=dir;r.Qpump=S.Qp(r.ps);r.Qr=S.Qr(r.ps);r.Qs=r.center?0:S.Qs(r.ps);r.Qout=r.Qout||0;
  r.pA=dir>=0?r.pIn:r.pOut;r.pB=dir>=0?r.pOut:r.pIn;if(r.center){r.pA=r.pB=.5;}
  r.Ploss=H.kW(r.ps,r.Qr)+H.kW(Math.max(r.ps-S.pT,0),r.Qs)+H.kW(Math.max(r.pIn-r.pOut,0),r.QL)+H.kW(Math.max(r.ps-r.pIn,0),r.center?0:r.Qin)+H.kW(Math.max(r.pOut-S.pT,0),r.Qout)+H.kW(Math.max(r.ps,0),S.Qg-r.Qpump)+(r.center?H.kW(r.ps,r.Qpump):0);
  r.pin=-(.06+(f==='suction'?.5:0)+(f==='lowoil'?.12:0))*(S.Qg>0?1:.1);r.noise=(S.Qg>0?68:72)+(f==='suction'?18:0)+(f==='lowoil'?11:0)+(f==='reverse'?9:0)+(f==='air'?5:0)+Math.max(r.ps,0)/40;
  return r;}
/* one machine (state m: x, T, pos, timers) advanced by dt */
function c26Run(P,f,m,dt,useP){const pos=useP?P.pos:m.pos;const dir=KIT.dirOf(pos);const atEnd=(dir>0&&m.x>=P.S-1e-6)||(dir<0&&m.x<=1e-6);
  const r=c26Solve(P,f,m.T,dir,atEnd);let v=r.v;
  if(f==='air'&&v>0){m.ph=(m.ph||0)+dt;v*=1+.45*Math.sin(2*PI*3.5*m.ph);r.ps*=1+.12*Math.sin(2*PI*3.5*m.ph+1);}
  m.x=clamp(m.x+dir*v*dt,0,P.S);r.vs=dir*v;
  const Kth=f==='cooler'?42:f==='lowoil'?18:12;m.T+=(25+r.Ploss*Kth-m.T)*Math.min(1,dt/20);
  /* operator logic: auto cycle at the stroke ends; a stalled stroke is reversed after 3 s */
  m.sl=(r.stall||(dir>0&&f==='coil')||(dir!==0&&r.S.Qg===0))?(m.sl||0)+dt:0;
  if(P.auto&&dt>0){const end=atEnd||m.sl>3;if(end){m.dw=(m.dw||0)+dt;if(m.dw>.7){const np=pos==='a'?'b':'a';if(useP)P.pos=np;else m.pos=np;m.dw=0;m.sl=0;if(np==='a'){if(m.ta!=null)m.tc=m.t-m.ta;m.ta=m.t;}}}else m.dw=0;}
  m.t=(m.t||0)+dt;return r;}
const C26_STEPS=[['שיחה עם המפעיל ותיעוד','C1',5,'שיחה'],['בדיקה חזותית: מפלס, דליפות, חום','T1',5,'מבט'],['מסננים: ואקום ביניקה ומחוון מסנן חוזר','FS',10,'מסננים'],['משאבה: כיוון סיבוב ורעש','P1',5,'משאבה'],['לחץ מערכת בעבודה ובקצה מהלך','G1',10,'לחץ'],
  ['ספיקת משאבה עם מד ספיקה וצמצם עומס','FM',20,'ספיקה'],['שסתום פריקה: לחץ פתיחה','RV',15,'שסתום פריקה'],['שסתום פיקוד: סולנואידים ודליפת ספול','V1',20,'שסתום פיקוד'],['מפעיל: בדיקת עקיפה (Bypass)','C1',25,'מפעיל']];
function c26Find(n,P,R){const f=R.f,T=R.T;
  switch(n){
  case 1:return f==='none'?'"המכונה עובדת כמו תמיד."':(C26_FAULTS.find(x=>x.id===f)||{}).sym||'';
  case 2:return f==='lowoil'?`מפלס השמן מתחת לסימון המינימום וקצף לבן במיכל. טמפ׳ השמן ${fmt(T,0)}°C.`:`מפלס תקין, אין דליפות חיצוניות. טמפ׳ השמן <b>${fmt(T,0)}°C</b>${T>58?' – חם מהרגיל: הספק הופך לחום איפשהו (דליפה פנימית או שסתום פריקה פתוח).':' – תקין.'}`;
  case 3:return `ואקום ביניקה <b>${fmt(R.pin,2)} bar</b> ${R.pin<-.25?'– גבוה מדי (מותר עד ‎−0.25): מסנן היניקה סתום!':'– תקין'}; מחוון מסנן חוזר: ${f==='retfilter'?'<b>אדום</b>, Δp ≈ 6 bar – המסנן סתום והעוקף פתוח.':'ירוק.'}`;
  case 4:return f==='reverse'?'<b>המנוע מסתובב הפוך</b> לחץ הכיוון שעל בית המשאבה – החיווט הוחלף בתחזוקה האחרונה.':f==='suction'?'רעש יללה חד ורציף מהמשאבה – <b>קוויטציה</b>.':f==='lowoil'?'רעש גרגור לא אחיד – <b>אוויר נשאב</b> עם השמן.':'כיוון סיבוב נכון, רעש רגיל.';
  case 5:return `בזמן יציאה עם העומס: <b>${fmt(R.pExt,0)} bar</b> (נדרש ${fmt(R.pNeed,0)}). בקצה מהלך: <b>${fmt(R.pEnd,0)} bar</b> (כיול ${P.pr} bar)${R.pEnd<P.pr-10?' – <b>הלחץ לא מגיע לכיול!</b>':' – תקין.'}`;
  case 6:return `ב-0 bar: <b>${fmt(R.Q0,1)}</b> L/min · ב-100 bar: <b>${fmt(R.Q100,1)}</b> L/min – נצילות נפחית ${fmt(R.Q0>0?R.Q100/P.Q*100:0,0)}%${R.Q0<P.Q*.95?' – <b>ספיקה נמוכה כבר בלי לחץ</b> (בעיית יניקה או כיוון)':R.Q100<P.Q*.85?' – <b>המשאבה דולפת בלחץ!</b>':' – תקין.'}`;
  case 7:return R.Q0<1?'אין ספיקה – אי אפשר לבדוק את שסתום הפריקה.':`שסתום הפריקה נפתח ב-<b>${fmt(R.prEff,0)} bar</b> (כיול נדרש ${P.pr} bar)${R.prEff<P.pr-10?' – <b>מכויל נמוך / דולף!</b>':' – תקין.'}`;
  case 8:return f==='coil'?'סולנואיד a: <b>אין משיכה מגנטית</b> והנורית בתקע כבויה. במעקף מופעל ידנית (כפתור על הסולנואיד) הצילינדר יוצא.':`סולנואידים תקינים. דליפה P→T כשהספול במרכז והיציאות פקוקות: <b>${fmt(R.Qs100,2)} L/min</b> ב-100 bar${R.Qs100>1?' – <b>הספול שחוק!</b>':' (תקין < 0.5).'}`;
  case 9:return R.Q0<1?'אין ספיקה – אי אפשר לבדוק את הצילינדר.':`בקצה מהלך יציאה, קו B מנותק לדלי: <b>${fmt(R.QLb,2)} L/min</b>${R.QLb>1?' – <b>האטם עוקף!</b>':' – טיפות בודדות, תקין.'}`;}
  return '';}
const C26_FAULTS=[
  {id:'pump',t:C26_F.pump,sym:'"המכונה איטית, בעיקר כשהעומס גבוה. בלי עומס היא כמעט רגילה, והשמן חם."',hint:'השוו את המהירות בעומס 0 ובעומס 60 kN, ומדדו ספיקה במשאבה.',why:'דליפה פנימית במשאבה גדלה עם הלחץ: Q = Q_g − c·p. בבדיקת ספיקה ב-100 bar חסרים ~12 L/min.'},
  {id:'relief',t:C26_F.relief,sym:'"המכבש לא מצליח ללחוץ חלקים כבדים – נעצר באמצע. חלקים קלים עוברים."',hint:'מה הלחץ בקצה מהלך לעומת הכיול?',why:'שסתום הפריקה נפתח ב-70 bar במקום 160 – כל הספיקה חוזרת למיכל לפני שהעומס זז. מכיילים או מחליפים.'},
  {id:'seal',t:C26_F.seal,sym:'"היציאה איטית בעומס, והלחץ בקצה המהלך לא מגיע לכיול."',hint:'בדיקת עקיפה: בקצה מהלך מנתקים את קו B ומודדים זרימה.',why:'השמן עובר דרך אטם הבוכנה מתא A לתא B ולמיכל. בעומס גבוה Δp גדול ⇒ דליפה גדולה.'},
  {id:'spool',t:C26_F.spool,sym:'"המכונה איטית ומתחממת, אבל המשאבה הוחלפה לפני חודש."',hint:'אם ספיקת המשאבה תקינה – איפה עוד השמן יכול לחזור למיכל?',why:'ספול שחוק מעביר שמן ישירות מ-P ל-T. ספיקת המשאבה תקינה, אבל לצילינדר מגיע פחות.'},
  {id:'coil',t:C26_F.coil,sym:'"לוחצים על יציאה – כלום לא זז. חזרה עובדת."',hint:'האם הספול זז? בדקו את הסולנואיד ואת המעקף המופעל ידנית.',why:'אין זרם בסולנואיד a – השסתום נשאר במרכז (טנדם) והמשאבה פורקת למיכל. בודקים פיוז, מחבר וסליל.'},
  {id:'suction',t:C26_F.suction,sym:'"המשאבה מייללת, והמכונה איטית בכל עומס – גם בלי עומס."',hint:'מדדו ואקום בכניסת המשאבה.',why:'מסנן יניקה סתום: ואקום גבוה, קוויטציה והמשאבה לא מתמלאת – הספיקה נמוכה כבר ב-0 bar. מחליפים מסנן לפני שהמשאבה נהרסת.'},
  {id:'retfilter',t:C26_F.retfilter,sym:'"הכול עובד, אבל מחוון המסנן אדום כבר שבוע."',hint:'מה קורה כשמסנן חוזר סתום? לאן הולך השמן?',why:'העוקף נפתח והשמן חוזר למיכל בלי סינון – לחץ גב ~6 bar וזיהום שמשחק את כל הרכיבים. מחליפים אלמנט.'},
  {id:'reverse',t:C26_F.reverse,sym:'"אחרי החלפת המנוע החשמלי – אין שום תנועה והמשאבה רועשת."',hint:'בדקו את כיוון הסיבוב מול החץ על המשאבה.',why:'שני פאזות הוחלפו – המשאבה מסתובבת הפוך ולא שואבת. מחליפים פאזות מיד, לפני שהמשאבה נשרפת.'},
  {id:'lowoil',t:C26_F.lowoil,sym:'"התנועה ספוגית, יש רעש גרגור וקצף במיכל."',hint:'הסתכלו על מפלס השמן ועל המיכל.',why:'מפלס נמוך: צינור היניקה שואב אוויר. מוסיפים שמן ומחפשים דליפה חיצונית.'}];

function c26Circuit(P,lib){const comps=[
    {id:'C1',type:'cyl',x:330,y:30,o:{load:{t:'F'}},name:'צילינדר המכבש Ø80/45 עם עומס',lbl:'צילינדר',lblAt:[-80,-22],l3:[0,-34]},
    {id:'V1',type:'dcv',x:330,y:150,o:{box:C26.CEN,L:'sol',R:'sol',center:true},name:'שסתום פיקוד 4/3 – מרכז טנדם (פריקה)',lbl:'4/3',lblAt:[0,34]},
    {id:'P1',type:'pump',x:230,y:305,name:'משאבה קבועה + מנוע חשמלי',lbl:'משאבה',lblAt:[34,6]},
    {id:'FS',type:'filter',x:230,y:352,name:'מסנן יניקה',lbl:'מסנן יניקה',lblAt:[-42,4]},{id:'T1',type:'tank',x:230,y:386,name:'מיכל ראשי'},
    {id:'GV',type:'gauge',x:275,y:318,net:'S',name:'מד ואקום בכניסת המשאבה',o:{max:1,unit:'bar'}},
    {id:'FM',type:'flowm',x:230,y:262,name:'נקודת בדיקה: מד ספיקה במוצא המשאבה',val:R=>`${fmt(R.Qpump,1)} L/min`},
    {id:'RV',type:'pv',x:170,y:250,rot:-90,o:{kind:'relief'},name:'שסתום פריקה',lbl:'פריקה',lblAt:[0,-30]},{id:'T2',type:'tank',x:130,y:280,name:'מיכל'},
    {id:'G1',type:'gauge',x:200,y:196,net:'P',name:'מד לחץ משאבה',o:{max:250}},{id:'G2',type:'gauge',x:258,y:78,net:'A',name:'מד לחץ A'},{id:'G3',type:'gauge',x:402,y:78,net:'B',name:'מד לחץ B'},
    {id:'FR',type:'filter',x:410,y:232,rot:180,name:'מסנן חוזר עם מחוון סתימה',lbl:'מסנן חוזר',lblAt:[40,4]},
    {id:'CL',type:'box',x:410,y:275,o:{w:52,h:18,t:'מקרר',ports:{i:[0,-9],o:[0,9]}},name:'מקרר שמן (מאוורר)'},{id:'T3',type:'tank',x:410,y:306,name:'מיכל'},
    {id:'CH1',type:'chart',x:640,y:40,o:{w:150,h:80,t:lib?'מהירות: תקולה (כחול) מול תקינה (אפור)':'לחץ משאבה (אדום) ומהירות (כחול), % מנומינלי',xl:'t [s]',yl:lib?'mm/s':'%'},name:'גרף לאורך זמן'},
    {id:'CH2',type:'chart',x:640,y:190,o:{w:150,h:80,t:lib?'טמפ׳ שמן: תקולה (אדום) מול תקינה (אפור)':'בדיקת משאבה: ספיקה מול לחץ',xl:lib?'t [s]':'p [bar]',yl:lib?'°C':'L/min'},name:lib?'טמפרטורת השמן לאורך זמן':'אופיין המשאבה: נומינלי (מקווקו) ונמדד (אדום, אחרי שלב 6)'}];
  const lines=[{id:'LS',net:'S',pts:['T1.t','FS.in']},{id:'LS2',net:'S',pts:['FS.out','P1.in']},{id:'LGV',net:'S',pts:['GV.p',[275,332],[230,332]]},
    {id:'LP1',net:'P',pts:['P1.out','FM.in']},{id:'LP',net:'P',pts:['FM.out',[230,230],[323,230],'V1.P']},{id:'LRV',net:'P',pts:[[230,230],[170,230],'RV.P']},{id:'LG1',net:'P',pts:['G1.p',[200,230]]},
    {id:'LRT',net:'T',pts:['RV.T',[130,250],'T2.t']},
    {id:'LA',net:'A',pts:['V1.A',[323,110],[280,110],'C1.A']},{id:'LB',net:'B',pts:['V1.B',[337,110],[380,110],'C1.B']},
    {id:'LT',net:'T',pts:['V1.T',[337,205],[410,205],'FR.in']},{id:'LT2',net:'R',pts:['FR.out','CL.i']},{id:'LT3',net:'R',pts:['CL.o','T3.t']}];
  return {comps,lines};}
const c26Hist=(st,t,vals,n,dtS)=>{if(st.ht==null||t-st.ht>=dtS){st.ht=t;st.hist.push([t,...vals]);if(st.hist.length>n)st.hist.shift();}};
/* shared output: pressures/flows/component states for the schematic and 3D */
function c26Out(P,r,m,pm,dt,f){const Qp=r.Qpump;const dir=r.dir;const vA=r.vs;
  return {p:{S:r.pin,P:Math.max(r.ps,0),A:r.pA,B:r.pB,T:r.S.pT,R:.3},
    q:{LS:Qp,LS2:Qp,LGV:0,LP1:Qp,LP:r.center?Qp:r.Qin,LRV:r.Qr,LG1:0,LRT:r.Qr,LA:dir>0?r.Qin:-r.Qout,LB:dir>0?-r.Qout:r.Qin,LT:r.center?Qp:r.Qout+r.Qs,LT2:Qp,LT3:Qp},pmax:pm,qref:P.Q,
    cav:f==='suction'||f==='lowoil'||f==='air',vac:r.pin<-.25,
    c:{C1:{x:m.x/P.S,uA:r.pA/pm,uB:r.pB/pm,lt:`${fmt(dir<0?P.Fr:P.F,0)} kN`},V1:{i:KIT.idx[f==='coil'&&P.pos==='a'?'0':(m.pos||P.pos)]},P1:{on:true,ang:KIT.rpmAng(m,dt,f==='reverse'?-1450:1450)},RV:{open:clamp(r.Qr/P.Q,0,1)},FM:{u:Qp/(P.Q*1.2)}}};}

/* ---------- 65 · faulty machine: 10-step troubleshooting ---------- */
const C26_FIX=[['pump','משאבה'],['relief','שסתום פריקה'],['seal','אטם בוכנה'],['spool','ספול שסתום פיקוד'],['coil','סולנואיד a'],['suction','מסנן יניקה'],['retfilter','מסנן חוזר'],['reverse','כיוון סיבוב המנוע'],['lowoil','מפלס שמן']];
const C26_HUNT={id:'hunt',n:65,t:'מכונה תקולה – איתור בן 10 שלבים',d:'תקלה נסתרת: בודקים לפי הסדר, מהפשוט אל המדידות, ומתקנים',
  P:{hid:'pump',stp:1,done:'',dx:'',tmin:0,res:'',F:40,Fr:2,Q:30,pr:160,S:400,pos:'a',auto:true},
  key:()=>'m',
  ui(U,P){U.grp('איתור תקלה – 10 שלבים');U.sel(P,'stp','בדיקה',C26_STEPS.map((s,i)=>[i+1,`${i+1}. ${s[3]}`]));
    U.btn('▶ ביצוע הבדיקה',()=>{const d=P.done?P.done.split(',').map(Number):[];if(!d.includes(P.stp)){d.push(P.stp);P.tmin+=C26_STEPS[P.stp-1][2];}P.done=d.join(',');P.stp=Math.min(9,P.stp+1);});
    U.sel(P,'dx','10. אבחנה',[['','— בחרו רכיב —'],...C26_FIX]);
    U.btn('🔧 תיקון ובדיקה חוזרת',()=>{if(!P.dx)return;P.tmin+=40;if(P.dx===P.hid){P.res='ok:'+P.dx;P.hid='none';}else P.res='bad:'+P.dx;});
    U.btn('🎲 מכונה חדשה – תקלה אקראית',()=>{let h=pick(C26_FIX)[0];if(h===P.hid)h=pick(C26_FIX)[0];Object.assign(P,{hid:h,done:'',tmin:0,res:'',dx:'',stp:1});});
    
    U.grp('מכונה',false);U.num(P,'F','עומס ביציאה','kN',{min:0,max:75,step:1});U.num(P,'Q','ספיקת משאבה נומינלית','L/min',{min:10,max:60,step:1});U.num(P,'pr','כיול שסתום פריקה נדרש','bar',{min:60,max:250,step:5});U.chk(P,'auto','מחזור אוטומטי');},
  circuit:P=>c26Circuit(P,false),
  init:P=>({x:0,T:45,t:0,hist:[],pos:null}),
  step(P,st,dt,ctx){const f=ctx.fault||P.hid||'none';st.pos=null;const r=c26Run(P,f,st,dt,true);const pm=KIT.nice(Math.max(P.pr,160)*1.1);
    const vn=H.v(P.Q,C26.A1);c26Hist(st,st.t,[Math.max(r.ps,0)/P.pr*100,Math.abs(r.vs)/vn*100],170,.05);const t0=st.hist.length?st.hist[0][0]:0;
    const S=r.S;const rEnd=c26Solve(P,f,st.T,1,true),rExt=c26Solve(P,f,st.T,1,false);const done=P.done?P.done.split(',').map(Number):[];
    const curve=[];for(let p=0;p<=P.pr;p+=P.pr/20)curve.push([p,S.Qp(p)]);const qm=KIT.nice(P.Q*1.15);
    const o=c26Out(P,r,st,pm,dt,f);
    o.c.CH1={x:[t0,Math.max(t0+8,st.t)],y:[0,120],s:[{p:st.hist.map(h=>[h[0],h[1]]),c:'#dc2626'},{p:st.hist.map(h=>[h[0],h[2]]),c:'#2563eb'}]};
    o.c.CH2={x:[0,P.pr],y:[0,qm],s:[{p:[[0,P.Q],[P.pr,P.Q-.01*P.pr]],c:'#94a3b8',d:true},...(done.includes(6)?[{p:curve,c:'#dc2626'}]:[])],...(done.includes(6)?{m:[Math.max(r.ps,0),r.Qpump]}:{})};
    const tc=st.tc||0;
    return Object.assign(o,{f,r,T:st.T,v:r.vs,ps:r.ps,Qpump:r.Qpump,pin:r.pin,pEnd:rEnd.ps,pExt:rExt.ps,pNeed:(P.F*1e4+S.pT*C26.A2)/C26.A1,Q0:S.Qp(0),Q100:S.Qp(100),prEff:S.pr,Qs100:S.ks*Math.sqrt(100-S.pT),QLb:S.QL(rEnd.ps),fm:!!ctx.fault,tc,
      read:[{k:'לחץ משאבה',v:Math.max(r.ps,0),u:'bar',max:pm},{k:'מהירות הבוכנה',v:r.vs,u:'mm/s'},{k:'זמן מחזור',v:tc,u:'s',dg:1},{k:'טמפ׳ שמן',v:st.T,u:'°C',dg:0,max:100,w:st.T>60},{k:'ואקום ביניקה',v:r.pin,u:'bar',dg:2,w:r.pin<-.25},{k:'רעש משאבה',v:r.noise,u:'dB',dg:0,w:r.noise>80},{k:'בדיקות / זמן עבודה',v:done.length,u:`/9 · ${P.tmin} דק׳`,dg:0,max:9}]});},
  ins(P,R){const L=[];const done=P.done?P.done.split(',').map(Number):[];
    if(P.res&&!R.fm){const [k,id]=P.res.split(':');const nm=(C26_FIX.find(x=>x[0]===id)||[])[1];
      L.push(k==='ok'?{ic:'✅',h:`<b>תוקן!</b> החלפתם/תיקנתם: ${nm}. המכונה חזרה לעבוד – ${done.length} בדיקות, ${P.tmin} דקות עבודה${done.length<=5?' – איתור יעיל מאוד.':'.'}`}:{ic:'❌',w:true,h:`החלפתם ${nm} – אבל התקלה נשארה (40 דקות וחלק תקין לפח). חזרו לבדיקות: איזו מדידה עדיין חריגה?`});}
    if(R.fm)L.push({ic:'🔧',h:'מצב תקלה: השתמשו בבדיקות שבלוח (שלבים 1–9) כדי לאסוף ממצאים, ובחרו את התשובה בכרטיס התקלה.'});
    if(!done.length&&!P.res)L.push({ic:'🧭',h:'במכונה יש <b>תקלה נסתרת</b>. בצעו בדיקות לפי הסדר – מהפשוט והזול (שיחה, מבט, האזנה) אל המדידות – ואז בחרו אבחנה. כל בדיקה עולה זמן.'});
    [...done].reverse().forEach(n=>{const s=C26_STEPS[n-1];L.push({ic:'🔎',at:s[1],h:`<b>${n}. ${s[0]}:</b> ${c26Find(n,P,R)}`});});
    if(R.r.stall)L.push({ic:'🛑',w:true,at:'C1',h:'הצילינדר נעצר באמצע המהלך – הלחץ לא מספיק לעומס. המפעיל מחזיר אחרי 3 שניות.',c:'נעצר באמצע'});
    return L;},
  calc(P,R){const A1=C26.A1;const pN=P.F*1e4/A1;return `<div class="kpis">${kpi('לחץ נדרש לעומס',fmt(pN,0),'bar')}${kpi('מהירות נומינלית',fmt(H.v(P.Q,A1),0),'mm/s')}${kpi('ספיקה ב-100 bar',fmt(R.Q100,1),'L/min')}${kpi('טמפ׳ שמן',fmt(R.T,0),'°C')}</div>`+
    det('שלב 5 – לחץ',row('',`p = F/A₁ + p_B·A₂/A₁ = ${P.F*1000}·10/${fmt(A1,0)} + ${fmt(R.r.S.pT,1)}·${fmt(C26.A2,0)}/${fmt(A1,0)} = ${V(R.pNeed,'bar')}`)+row('בקצה מהלך',`Q_p(p) = Q_שסתום פריקה + Q_דליפות ⇒ p = ${V(R.pEnd,'bar')}`),true)+
    det('שלב 6 – משאבה',row('',`Q(p) = Q_g − c·p ; η_v = Q(100)/Q_n = ${fmt(R.Q100,1)}/${P.Q} = ${V(R.Q100/P.Q*100,'%',0)}`),true)+
    det('מהירות עם דליפות',row('',`v = (Q_p − Q_שסתום פריקה − Q_ספול − Q_אטם)/A₁ = ${V(Math.abs(R.v),'mm/s')}`))+
    det('סדר עשרת השלבים',`<div class="note">1 שיחה ותיעוד · 2 מבט (מפלס, דליפות, חום) · 3 מסננים · 4 משאבה (כיוון, רעש) · 5 לחץ · 6 ספיקה · 7 שסתום פריקה · 8 שסתום פיקוד · 9 מפעיל · 10 תיקון ובדיקה חוזרת. קודם מה שמהיר וזול, ואז מדידות – ולא מחליפים חלקים "על עיוור".</div>`);},
  demo:[{t:'מכונה תקולה',x:'מכבש שעובד <b>לאט מדי</b>. לא מחליפים חלקים לפי ניחוש – עוברים <b>10 שלבים</b> לפי הסדר.',reset:true,set:{hid:'pump'},hl:['C1']},
    {t:'שיחה ומבט',x:'שלב 1: המפעיל מספר שהמכונה איטית בעיקר בעומס. שלב 2: מפלס תקין, אבל השמן חם מהרגיל.',set:{done:'1,2',tmin:10,stp:3},hl:['C1','T1'],dur:6},
    {t:'מסננים ומשאבה',x:'שלבים 3–4: ואקום ביניקה תקין, מחוון המסנן ירוק, כיוון סיבוב נכון. הבעיה לא ביניקה.',set:{done:'1,2,3,4',tmin:25,stp:5},hl:['FS','P1'],dur:6},
    {t:'לחץ',x:'שלב 5: הלחץ מגיע לכיול בקצה המהלך – שסתום הפריקה בסדר, אבל המהירות נמוכה.',set:{done:'1,2,3,4,5',tmin:35,stp:6},hl:['G1'],dur:6},
    {t:'ספיקת משאבה',x:'שלב 6: מד הספיקה מראה 30 L/min ב-0 bar אבל רק <b>18 ב-100 bar</b>. הגרף האדום יורד בחדות – המשאבה דולפת פנימית.',set:{done:'1,2,3,4,5,6',tmin:55,stp:7},hl:['FM','CH2'],dur:7},
    {t:'תיקון ובדיקה חוזרת',x:'מחליפים את המשאבה ומודדים שוב: המהירות חזרה, השמן מתקרר. שלב 10 – תמיד מוודאים.',set:{hid:'none',res:'ok:pump',dx:'pump'},hl:['P1','CH1'],dur:8}],
  predict:[{q:'משאבה שחוקה. המהירות יורדת יותר:',set:{hid:'pump',F:60},opts:['בלי עומס','בעומס גבוה','אותו דבר בשני המקרים'],a:1,dur:4,why:'הדליפה הפנימית במשאבה גדלה עם הלחץ. בעומס 60 kN הלחץ גבוה ⇒ חסר יותר שמן לצילינדר.'},
    {q:'אטם בוכנה עוקף. מה יראה מד הלחץ בקצה מהלך יציאה?',set:{hid:'seal',F:40},opts:['את כיול שסתום הפריקה המלא','פחות מהכיול','אפס'],a:1,dur:7,why:'בקצה המהלך השמן ממשיך לזרום דרך האטם לתא B ולמיכל. המשאבה מגיעה לשיווי משקל עם הדליפה לפני ששסתום הפריקה נפתח.'},
    {q:'מסנן יניקה סתום. ספיקת המשאבה ב-0 bar:',set:{hid:'suction'},opts:['תקינה – הבעיה רק בלחץ','נמוכה כבר בלי לחץ','גבוהה מהנומינלי'],a:1,dur:4,why:'המשאבה לא מתמלאת (קוויטציה) – חסר שמן בכל לחץ. זה מבדיל אותה ממשאבה שחוקה, שבה הספיקה יורדת רק עם הלחץ.'}],
  tasks:[{q:P=>`בדיקת משאבה: ${P.Q} L/min ב-0 bar ו-${fmt(P.Q-P.F/4,1)} L/min ב-100 bar. מהי הנצילות הנפחית ב-100 bar? (%)`,a:P=>(P.Q-P.F/4)/P.Q*100,u:'%',hint:'η_v = Q(100)/Q(0).',rand:P=>{P.Q=pick([20,30,40]);P.F=pick([8,16,24,32]);}},
    {q:P=>`ספיקה ${P.Q} L/min לצילינדר Ø80. מה מהירות היציאה? (mm/s)`,a:P=>H.v(P.Q,C26.A1),u:'mm/s',hint:'v = Q/A₁; A₁ = π·80²/4.',rand:P=>{P.Q=pick([15,20,30,45]);}},
    {q:P=>`עומס ${P.F} kN על Ø80. איזה לחץ דרוש ליציאה? (bar, בלי לחץ גב)`,a:P=>P.F*1e4/C26.A1,u:'bar',hint:'p = F/A; 1 bar = 0.1 N/mm².',rand:P=>{P.F=rnd(20,70,5);}},
    {q:P=>`בבדיקת עקיפה נמדדו ${fmt(P.Q/5,1)} L/min דליפה מהצילינדר, ספיקת משאבה ${P.Q} L/min. בכמה אחוזים תרד מהירות היציאה?`,a:P=>20,u:'%',hint:'האחוז = Q_דליפה / Q_משאבה.',rand:P=>{P.Q=pick([20,30,40,50]);}}],
  faults:C26_FAULTS,
  test(H){const P=clone(this.P);const A1=C26.A1,A2=C26.A2;const r=c26Solve(P,'none',45,1,false);const S=r.S;
    const rs=c26Solve(P,'seal',45,1,true);const Ss=rs.S;const rr=c26Solve(P,'relief',45,1,true);const rc=c26Solve(P,'coil',45,1,false);const rw=c26Solve(clone(Object.assign(P,{F:60})),'pump',45,1,false);P.F=40;
    const P2=clone(this.P);P2.auto=false;P2.hid='none';const st=this.init(P2);let R;for(let t=0;t<1;t+=.02)R=this.step(P2,st,.02,{});
    return [['v = (Q_in − Q_L)/A₁',r.v,H.v(r.Qin-r.QL,A1),.001],['p_A = (F + p_B·A₂)/A₁',r.pIn,(40e4+r.pOut*A2)/A1,.001],['Q_supply = Q_in',S.Qp(r.ps)-S.Qr(r.ps)-S.Qs(r.ps),r.Qin,.01],
      ['משאבה שחוקה: Q(100 bar) = 30 − 12',c26Sys(P,'pump',45).Qp(100),18,.001],['אטם: Q_p = Q_שסתום פריקה + Q_ספול + Q_L בקצה',Ss.Qp(rs.ps)-Ss.Qr(rs.ps)-Ss.Qs(rs.ps),Ss.QL(rs.ps-Ss.pT),.02],['אטם: לחץ קצה < כיול',rs.ps<150?1:0,1],
      ['שסתום פריקה נמוך: לחץ קצה 70–75 bar',rr.ps>70&&rr.ps<75?1:0,1],['סולנואיד: אין תנועה',rc.v,0],['משאבה שחוקה ב-60 kN איטית מ-75%',rw.v<.75*H.v(30,A1)?1:0,1],['UI מהירות',R.read[1].v,R.v,.001]];}};

/* ---------- 66 · fault library: healthy and faulty machine side by side ---------- */
const C26_LIB=[
  {id:'pump',s:['slow','hot'],cause:'בלאי פנימי במשאבה – מרווחים גדלו, שמן חוזר מצד הלחץ ליניקה.',test:'מד ספיקה במוצא המשאבה וצמצם עומס: ספיקה ב-0 וב-100 bar.',fix:'שיפוץ או החלפת משאבה; לבדוק סינון וניקיון השמן (הסיבה לבלאי).'},
  {id:'relief',s:['weak','hot'],cause:'שסתום פריקה מכויל נמוך, קפיץ עייף או לכלוך על המושב.',test:'חוסמים את הקו אחרי השסתום (או קצה מהלך) וקוראים את המד.',fix:'ניקוי ומכיול מחדש; אם הלחץ לא עולה – החלפת שסתום.'},
  {id:'seal',s:['slow','weak'],cause:'אטם בוכנה פגוע – שמן עובר מתא לתא.',test:'בדיקת עקיפה: בקצה מהלך מנתקים את הקו מהתא השני ומודדים זרימה.',fix:'החלפת אטמים ובדיקת הקנה לשריטות.'},
  {id:'spool',s:['slow','hot'],cause:'ספול שחוק – מרווח גדול בין הספול לגוף, דליפה P→T.',test:'פוקקים A ו-B, הספול במרכז/בעבודה, מודדים זרימה בקו T.',fix:'החלפת שסתום; לשפר סינון.'},
  {id:'coil',s:['none'],cause:'סולנואיד שרוף, פיוז, מחבר או כבל.',test:'נורית בתקע, מגנט על הסליל, מדידת התנגדות; מעקף מופעל ידנית של הספול.',fix:'החלפת סליל/מחבר; לבדוק מתח ותדירות הפעלה.'},
  {id:'suction',s:['noise','slow'],cause:'מסנן יניקה סתום או צינור יניקה צר – ואקום וקוויטציה.',test:'מד ואקום בכניסת המשאבה (מותר עד ‎−0.25 bar).',fix:'ניקוי/החלפת מסנן, להגדיל צינור יניקה.'},
  {id:'retfilter',s:['dirty'],cause:'מסנן חוזר סתום – העוקף נפתח והשמן חוזר בלי סינון.',test:'מחוון סתימה, Δp על המסנן.',fix:'החלפת אלמנט; לבדוק מקור הזיהום ולדגום שמן.'},
  {id:'reverse',s:['none','noise'],cause:'כיוון סיבוב הפוך אחרי עבודת חשמל.',test:'מבט על המאוורר מול החץ על בית המשאבה.',fix:'החלפת שתי פאזות, ובדיקה שהמשאבה לא ניזוקה.'},
  {id:'lowoil',s:['noise','erratic','hot'],cause:'מפלס נמוך – היניקה שואבת אוויר.',test:'מד מפלס, קצף במיכל, רעש גרגור.',fix:'מילוי שמן ואיתור הדליפה החיצונית.'},
  {id:'cooler',s:['hot'],cause:'מקרר לא עובד – מאוורר תקוע או צלעות מלוכלכות.',test:'מדחום לפני ואחרי המקרר; בדיקת המאוורר.',fix:'ניקוי צלעות, תיקון מאוורר; לבדוק תרמוסטט.'},
  {id:'air',s:['erratic','noise'],cause:'אוויר כלוא בצילינדר ובקווים (אחרי פירוק).',test:'תנועה קופצנית ולא אחידה, לחץ רועד; שמן עכור.',fix:'ניקוז אוויר בנקודות הגבוהות, כמה מהלכים מלאים בלחץ נמוך.'}];
const C26_SYM=[['all','הכול'],['slow','איטי'],['none','לא זז'],['weak','כוח חלש'],['hot','מתחמם'],['noise','רעש'],['erratic','תנועה לא אחידה'],['dirty','זיהום / מסנן']];
const c26LibList=P=>C26_LIB.filter(c=>P.sym==='all'||c.s.includes(P.sym));
const C26_LIBSIM={id:'lib',n:66,t:'מאגר תקלות',d:'בוחרים סימפטום וסיבה – ורואים מכונה תקולה לצד תקינה',
  P:{sym:'all',cause:'pump',F:40,Fr:2,Q:30,pr:160,S:400,pos:'a',auto:true},
  key:()=>'m',
  onChange(P){const L=c26LibList(P);if(!L.find(c=>c.id===P.cause))P.cause=L[0].id;},
  ui(U,P){U.grp('מאגר תקלות');U.sel(P,'sym','סימפטום',C26_SYM,true);U.sel(P,'cause','סיבה',c26LibList(P).map(c=>[c.id,C26_F[c.id]]));
    U.grp('מכונה');U.num(P,'F','עומס ביציאה','kN',{min:0,max:75,step:1});U.num(P,'Q','ספיקת משאבה','L/min',{min:10,max:60,step:1});U.num(P,'pr','כיול שסתום פריקה','bar',{min:60,max:250,step:5});U.chk(P,'auto','מחזור אוטומטי');},
  circuit:P=>c26Circuit(P,true),
  init:P=>({x:0,T:40,t:0,hist:[],th:[],pos:null,h:{x:0,T:40,t:0,pos:'a'}}),
  step(P,st,dt,ctx){const f=ctx.fault||P.cause;st.pos=null;const r=c26Run(P,f,st,dt,true);const rh=c26Run(P,'none',st.h,dt,false);const pm=KIT.nice(Math.max(P.pr,160)*1.1);
    st.pk=Math.max((st.pk||0)*(1-Math.min(1,dt/6)),r.ps);st.h.pk=Math.max((st.h.pk||0)*(1-Math.min(1,dt/6)),rh.ps);
    c26Hist(st,st.t,[r.vs,rh.vs],170,.05);if(!st.tht||st.t-st.tht>=.25){st.tht=st.t;st.th.push([st.t,st.T,st.h.T]);if(st.th.length>240)st.th.shift();}
    const t0=st.hist.length?st.hist[0][0]:0,u0=st.th.length?st.th[0][0]:0;const vm=KIT.nice(H.v(P.Q,C26.A2)*1.15);const o=c26Out(P,r,st,pm,dt,f);
    o.c.CH1={x:[t0,Math.max(t0+8,st.t)],y:[-vm,vm],s:[{p:st.hist.map(h=>[h[0],h[2]]),c:'#94a3b8',d:true},{p:st.hist.map(h=>[h[0],h[1]]),c:'#2563eb'}]};
    o.c.CH2={x:[u0,Math.max(u0+60,st.t)],y:[20,100],s:[{p:st.th.map(h=>[h[0],h[2]]),c:'#94a3b8',d:true},{p:st.th.map(h=>[h[0],h[1]]),c:'#dc2626'},{p:[[u0,60],[u0+1e4,60]],c:'#f59e0b',d:true}]};
    const ve=c26Solve(P,f,st.T,1,false),vh=c26Solve(P,'none',st.h.T,1,false);const pe=c26Solve(P,f,st.T,1,true),ph=c26Solve(P,'none',st.h.T,1,true);
    return Object.assign(o,{f,r,T:st.T,Th:st.h.T,v:r.vs,ve:ve.v,vh:vh.v,Qpump:r.Qpump,pe:pe.ps,ph:ph.ps,Ploss:r.Ploss,fm:!!ctx.fault,noise:r.noise,
      read:[{k:'v יציאה – תקולה',v:ve.v,u:'mm/s',max:vm},{k:'v יציאה – תקינה',v:vh.v,u:'mm/s',max:vm},{k:'p קצה – תקולה',v:pe.ps,u:'bar',max:pm},{k:'p קצה – תקינה',v:ph.ps,u:'bar',max:pm},{k:'טמפ׳ – תקולה',v:st.T,u:'°C',dg:0,max:100,w:st.T>60},{k:'רעש משאבה',v:r.noise,u:'dB',dg:0,w:r.noise>80}]});},
  ins(P,R){const L=[];const c=C26_LIB.find(x=>x.id===R.f);
    if(!R.fm&&c){L.push({ic:'📋',h:`<b>${C26_F[c.id]}</b> – ${c.cause}`});L.push({ic:'🔬',h:`<b>איך בודקים:</b> ${c.test}`});L.push({ic:'🛠️',h:`<b>תיקון:</b> ${c.fix}`});}
    const dv=R.vh>0?(1-R.ve/R.vh)*100:0;
    L.push({ic:'⚖️',at:'C1',h:`מהירות יציאה: <b>${fmt(R.ve,0)}</b> mm/s מול ${fmt(R.vh,0)} במכונה תקינה${Math.abs(dv)>3?` (${dv>0?'−':'+'}${fmt(Math.abs(dv),0)}%)`:''}. לחץ בקצה מהלך: <b>${fmt(R.pe,0)}</b> מול ${fmt(R.ph,0)} bar.`});
    if(R.T>60)L.push({ic:'🌡️',w:true,at:'CL',h:`השמן מגיע ל-${fmt(R.T,0)}°C (תקינה: ${fmt(R.Th,0)}°C). הפסד הספק ממוצע הופך לחום; שמן חם דליל יותר ודולף יותר – בלאי מואץ.`,c:'שמן חם'});
    if(R.noise>80)L.push({ic:'🔊',w:true,at:'P1',h:`רעש משאבה ${fmt(R.noise,0)} dB – קוויטציה או אוויר. עוצרים מהר: המשאבה נהרסת.`});
    if(R.f==='retfilter')L.push({ic:'🧪',w:true,at:'FR',h:'המכונה כמעט לא מושפעת – וזו הסכנה: השמן חוזר בלי סינון. תקלה "שקטה" שמתגלה רק במחוון.',c:'עוקף פתוח'});
    return L;},
  calc(P,R){return `<div class="kpis">${kpi('הפסד הספק עכשיו',fmt(R.Ploss,2),'kW')}${kpi('טמפ׳ תקולה',fmt(R.T,0),'°C')}${kpi('מהירות תקולה',fmt(R.ve,0),'mm/s')}${kpi('מהירות תקינה',fmt(R.vh,0),'mm/s')}</div>`+
    det('מאזן ספיקה',row('',`Q_צילינדר = Q_משאבה(p) − Q_שסתום פריקה − Q_ספול − Q_אטם`)+row('',`v = Q_צילינדר/A₁ = ${V(R.ve,'mm/s')}`),true)+
    det('חום',row('',`P_הפסד = Σ p·Q (שסתום פריקה, דליפות, מפלי לחץ) = ${V(R.Ploss,'kW')}`)+row('טמפ׳ יציבה',`T = T_סביבה + P_הפסד·R_th`),true)+
    det('טבלת סימפטום–סיבה',`<div class="note">${C26_SYM.slice(1).map(([k,t])=>`<b>${t}:</b> ${C26_LIB.filter(c=>c.s.includes(k)).map(c=>C26_F[c.id]).join(' · ')}`).join('<br>')}</div>`);},
  demo:[{t:'מאגר תקלות',x:'בצד אחד מכונה תקינה (קווים אפורים), בצד שני אותה מכונה עם תקלה. בוחרים <b>סימפטום</b> ו<b>סיבה</b>.',reset:true,set:{sym:'all',cause:'pump'},hl:['CH1']},
    {t:'איטי',x:'משאבה שחוקה: הקו הכחול נמוך מהאפור – בעיקר ביציאה, בעומס.',set:{sym:'slow',cause:'pump'},hl:['CH1','P1'],dur:8},
    {t:'כוח חלש',x:'שסתום פריקה מכויל נמוך: הצילינדר נעצר באמצע – הלחץ לא עולה מעל 70 bar.',set:{sym:'weak',cause:'relief'},hl:['RV','G1'],dur:8},
    {t:'מתחמם',x:'מקרר לא עובד: הטמפרטורה (אדום) מטפסת מעל 60°C בזמן שהמכונה התקינה יציבה.',set:{sym:'hot',cause:'cooler'},hl:['CH2','CL'],dur:10},
    {t:'רעש',x:'מסנן יניקה סתום: ואקום, קוויטציה, בועות בקו היניקה – והספיקה נמוכה בכל עומס.',set:{sym:'noise',cause:'suction'},hl:['FS','GV'],dur:8},
    {t:'תנועה לא אחידה',x:'אוויר כלוא: המהירות "קופצת" – השמן עם האוויר מתנהג כקפיץ.',set:{sym:'erratic',cause:'air'},hl:['CH1','C1'],dur:8}],
  predict:[{q:'המקרר הפסיק לעבוד. מה יקרה לטמפרטורת השמן לאורך זמן?',set:{sym:'hot',cause:'cooler'},opts:['תישאר כמו במכונה התקינה','תעלה מעל 60°C','תרד'],a:1,dur:14,why:'אותו הפסד הספק, אבל החום לא מסולק. הטמפרטורה עולה עד שיווי משקל חדש וגבוה.'},
    {q:'מסנן חוזר סתום והעוקף נפתח. מהירות המכונה:',set:{sym:'dirty',cause:'retfilter'},opts:['כמעט לא משתנה','יורדת בחצי','המכונה נעצרת'],a:0,dur:5,why:'לחץ הגב עולה רק ב-~6 bar. התקלה "שקטה" – הנזק הוא זיהום שמגיע לכל הרכיבים.'}],
  tasks:[{q:P=>`הפסד הספק ממוצע ${fmt(P.Q/10,1)} kW. כמה חום נוצר בשעה? (kJ)`,a:P=>P.Q/10*3600,u:'kJ',hint:'Q = P·t; 1 kW = 1 kJ/s.',rand:P=>{P.Q=pick([15,20,30,40]);}},
    {q:P=>`דליפה פנימית ${fmt(P.Q/3,1)} L/min ב-${P.pr} bar. כמה הספק הופך לחום? (kW)`,a:P=>P.pr*P.Q/3/600,u:'kW',hint:'P = p·Q/600 (bar, L/min → kW).',rand:P=>{P.Q=pick([15,30,45]);P.pr=rnd(100,200,10);}},
    {q:P=>`ספיקה ${P.Q} L/min, דליפה בספול 6 L/min. מה מהירות היציאה ב-Ø80? (mm/s)`,a:P=>H.v(P.Q-6,C26.A1),u:'mm/s',hint:'v = (Q − Q_דליפה)/A₁.',rand:P=>{P.Q=pick([20,30,40]);}}],
  faults:[...C26_FAULTS,{id:'cooler',t:C26_F.cooler,sym:'"אחרי שעה של עבודה השמן חם מאוד והמכונה מאטה מעט."',hint:'השוו את גרף הטמפרטורה למכונה התקינה. האם המהירות שונה בהתחלה?',why:'אין סילוק חום: הטמפרטורה עולה, השמן דליל ודולף יותר. מנקים את המקרר ומתקנים את המאוורר.'},
    {id:'air',t:C26_F.air,sym:'"אחרי החלפת צינור – הצילינדר קופץ ורועד בזמן יציאה."',hint:'הסתכלו על גרף המהירות – האם הוא חלק?',why:'אוויר כלוא דחיס – התנועה לא אחידה. מנקזים אוויר בנקודות הגבוהות.'}],
  test(H){const P=clone(this.P);const A1=C26.A1;const rp=c26Solve(P,'retfilter',45,1,false),rh=c26Solve(P,'none',45,1,false);
    const P2=clone(this.P);P2.cause='cooler';const st=this.init(P2);let R;for(let t=0;t<120;t+=.05)R=this.step(P2,st,.05,{});
    const sp=c26Solve(P,'spool',45,1,false);
    return [['מקרר תקול ⇒ T > 60°C אחרי 120 s',R.T>60?1:0,1],['מכונה תקינה < 55°C',R.Th<55?1:0,1],['מסנן חוזר: מהירות כמעט זהה (<5%)',Math.abs(1-rp.v/rh.v)<.05?1:0,1],
      ['ספול: v = (Q_in − Q_L)/A₁',sp.v,H.v(sp.Qin-sp.QL,A1),.001],['ספול: Q_s = k_s·√(p − p_T)',sp.Qs,sp.S.ks*Math.sqrt(sp.ps-sp.S.pT),.001],['UI מהירות תקינה',R.read[1].v,R.vh,.001]];}};

LABS.push({ch:26,title:'תחזוקה ואיתור תקלות',sims:[C26_HUNT,C26_LIBSIM]});
}
