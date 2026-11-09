/* lab 15 – same code as the website */
{




/* ===================== Chapter 15 – multiple actuators: series / parallel / tandem (45), synchronizing two cylinders (46) ===================== */
/* parallel branches: flow from one supply pressure ps into n branches, branch i needs p_i, small line resistance k: Q_i = k·√(ps − p_i)⁺ */
function c15Par(Qp,pr,need,k){const ov=Math.max(3,.06*pr);const f=ps=>need.reduce((a,p)=>a+(p==null?0:k*Math.sqrt(Math.max(ps-p,0))),0)+H.reliefQ(ps,pr,ov,Qp)-Qp;
  const ps=H.bisect(f,0,pr+ov*1.5+1,60);return {ps,Q:need.map(p=>p==null?0:k*Math.sqrt(Math.max(ps-p,0))),Qr:H.reliefQ(ps,pr,ov,Qp)};}
const C15_CEN={tandem:['P>A B>T','P-T A| B|','P>B A>T']};
const c15Pos=[['a','◀ a','יציאה'],['0','■ 0','עצירה'],['b','b ▶','חזרה']];

/* ---------- 45 · series, parallel and tandem connections of two cylinders ---------- */
const C15_SPT={id:'spt',n:45,t:'טורי, מקבילי וטנדם',d:'מקבילי: הקל זז ראשון; טורי: הלחצים מצטברים; טנדם: השסתום הראשון מקבל עדיפות',
  P:{mode:'par',F1:10,F2:25,D1:63,D2:63,S:300,Q:20,pr:160,pos:'a',pos2:'0',auto:true},
  key:P=>P.mode,
  ui(U,P){U.grp('חיבור');U.seg(P,'mode','שיטה',[['par','מקבילי','שני הצילינדרים מוזנים יחד מאותו קו'],['ser','טורי','יציאת הראשון מזינה את השני'],['tan','טנדם','שני שסתומים עם מרכז טנדם בטור']],true);
    U.grp('עומסים וצילינדרים');U.num(P,'F1','עומס צילינדר 1','kN',{min:0,max:200,step:1});U.num(P,'F2','עומס צילינדר 2','kN',{min:0,max:200,step:1});U.num(P,'D1','קוטר צילינדר 1','mm',{min:25,max:160,step:1});U.num(P,'D2','קוטר צילינדר 2','mm',{min:25,max:160,step:1});
    U.grp('משאבה',false);U.num(P,'Q','ספיקה','L/min',{min:2,max:150,step:1});U.num(P,'pr','כיול שסתום פריקה','bar',{min:20,max:350,step:5});
    U.grp('הפעלה',false);U.seg(P,'pos',P.mode==='tan'?'שסתום 1':'שסתום',c15Pos);if(P.mode==='tan')U.seg(P,'pos2','שסתום 2',c15Pos);U.chk(P,'auto','מחזור אוטומטי');},
  circuit(P){const m=P.mode;const comps=[{id:'C1',type:'cyl',x:200,y:20,o:{load:{t:'1'}},name:'צילינדר 1',lbl:'צילינדר 1',lblAt:[-80,-22],l3:[0,-34]},{id:'C2',type:'cyl',x:470,y:20,o:{load:{t:'2'}},name:'צילינדר 2',lbl:'צילינדר 2',lblAt:[-80,-22],l3:[0,-34]},
      {id:'P1',type:'pump',x:90,y:310,name:'משאבה',lbl:'משאבה',lblAt:[32,6]},{id:'T1',type:'tank',x:90,y:355,name:'מיכל'},{id:'RV',type:'pv',x:30,y:260,rot:-90,o:{kind:'relief'},name:'שסתום פריקה',lbl:'פריקה',lblAt:[0,-30]},{id:'T2',type:'tank',x:-10,y:290,name:'מיכל'},
      {id:'G1',type:'gauge',x:130,y:230,net:'P',name:'מד לחץ משאבה',l3:[0,-30]},{id:'G2',type:'gauge',x:126,y:60,net:'A1',name:'מד לחץ צילינדר 1',valAt:[-16,-2]},{id:'G3',type:'gauge',x:396,y:60,net:'A2',name:'מד לחץ צילינדר 2',valAt:[-16,-2]}];
    const lines=[{id:'LS',net:'S',pts:['T1.t','P1.in']},{id:'LRV',net:'P',pts:[[90,260],'RV.P']},{id:'LRT',net:'T',pts:['RV.T',[-10,260],'T2.t']}];
    if(m==='tan'){comps.push({id:'V1',type:'dcv',x:200,y:170,o:{box:C15_CEN.tandem,L:'lever',center:true},name:'שסתום 1 – מרכז טנדם (לחיצה מחליפה מצב)',lbl:'V1',lblAt:[-80,4]},{id:'V2',type:'dcv',x:470,y:170,o:{box:C15_CEN.tandem,L:'lever',center:true},name:'שסתום 2 – מרכז טנדם; מוזן מה-T של שסתום 1',lbl:'V2',lblAt:[80,4]},{id:'T3',type:'tank',x:540,y:245,name:'מיכל'});
      lines.push({id:'LP',net:'P',pts:['P1.out',[90,260],[193,260],'V1.P'],tag:{at:[140,282],t:'q'}},{id:'L1A',net:'A1',pts:['V1.A',[193,110],[150,110],'C1.A']},{id:'L1B',net:'B1',pts:['V1.B',[207,110],[250,110],'C1.B']},
        {id:'LM',net:'M',pts:['V1.T',[207,225],[330,225],[330,240],[463,240],'V2.P'],tag:{at:[330,206],t:'q'}},{id:'L2A',net:'A2',pts:['V2.A',[463,110],[420,110],'C2.A']},{id:'L2B',net:'B2',pts:['V2.B',[477,110],[520,110],'C2.B']},{id:'LT',net:'T',pts:['V2.T',[477,225],[540,225],'T3.t']});}
    else{comps.push({id:'V1',type:'dcv',x:300,y:190,o:{box:KIT.D43.closed,L:'lever',center:true},name:'שסתום פיקוד 4/3 (לחיצה מחליפה מצב)',lbl:'4/3',lblAt:[80,4]},{id:'T3',type:'tank',x:380,y:250,name:'מיכל'});
      lines.push({id:'LP',net:'P',pts:['P1.out',[90,260],[293,260],'V1.P'],tag:{at:[200,282],t:'q'}},{id:'LT',net:'T',pts:['V1.T',[307,235],[380,235],'T3.t']});
      if(m==='par')lines.push({id:'L1A',net:'A1',pts:['V1.A',[293,130],[150,130],'C1.A']},{id:'L2A',net:'A2',pts:[[293,130],[420,130],'C2.A']},{id:'L1B',net:'B',pts:['C1.B',[250,110],[307,110],'V1.B']},{id:'L2B',net:'B',pts:['C2.B',[520,110],[520,120],[307,120]]});
      else lines.push({id:'L1A',net:'A1',pts:['V1.A',[293,130],[150,130],'C1.A']},{id:'L1B',net:'A2',pts:['C1.B',[250,90],[420,90],'C2.A']},{id:'L2B',net:'B2',pts:['C2.B',[520,140],[307,140],'V1.B']});}
    return {comps,lines};},
  init:P=>({x1:0,x2:0,si:KIT.idx[P.pos],si2:KIT.idx[P.pos2],dw:0}),
  click(id,P){if(id==='V1'){P.pos=P.pos==='a'?'0':P.pos==='0'?'b':'a';P.auto=false;return true;}if(id==='V2'){P.pos2=P.pos2==='a'?'0':P.pos2==='0'?'b':'a';P.auto=false;return true;}},
  step(P,st,dt,ctx){const f=ctx.fault;const A11=H.A(P.D1),A21=H.Aann(P.D1,P.D1*.56),A12=H.A(P.D2),A22=H.Aann(P.D2,P.D2*.56);const S=P.S;const Ff=f==='stick'?6000:300;
    const pr=f==='relief'?P.pr*.45:P.pr;const k=P.Q/Math.sqrt(2);const m=P.mode;let d1=KIT.dirOf(P.pos),d2=m==='tan'?KIT.dirOf(P.pos2):d1;
    if(P.auto){const e1=(d1>0&&st.x1>=S-1e-6)||(d1<0&&st.x1<=1e-6)||d1===0,e2=(d2>0&&st.x2>=S-1e-6)||(d2<0&&st.x2<=1e-6)||d2===0;
      if(e1&&e2){st.dw+=dt;if(st.dw>1){const nx=(m==='tan'?(P.pos!=='0'?P.pos:P.pos2):P.pos)==='a'?'b':'a';P.pos=nx;if(m==='tan')P.pos2=nx;st.dw=0;}}else st.dw=0;d1=KIT.dirOf(P.pos);d2=m==='tan'?KIT.dirOf(P.pos2):d1;}
    const end1=(d1>0&&st.x1>=S-1e-6)||(d1<0&&st.x1<=1e-6),end2=(d2>0&&st.x2>=S-1e-6)||(d2<0&&st.x2<=1e-6);
    const F1=P.F1*1000+Ff,F2=P.F2*1000+Ff;let v1=0,v2=0,ps=.5,pA1=.3,pA2=.3,pM=.3,Qr=0,q={};
    const ser=(m==='ser')||(m==='tan'&&d1!==0&&d2!==0&&d1===d2);
    if(m==='par'&&d1!==0){const need=d1>0?[end1?null:F1*10/A11,end2?null:F2*10/A12]:[end1?null:Ff*10/A21,end2?null:Ff*10/A22];const r=c15Par(P.Q,pr,need,k);ps=r.ps;Qr=r.Qr;
      v1=H.v(r.Q[0],d1>0?A11:A21);v2=H.v(r.Q[1],d1>0?A12:A22);pA1=d1>0?(end1?ps:need[0]):.4;pA2=d1>0?(end2?ps:need[1]):.4;q={LP:P.Q-Qr,L1A:d1*H.Q(v1,A11),L2A:d1*H.Q(v2,A12),L1B:d1*H.Q(v1,A21),L2B:d1*H.Q(v2,A22),LT:H.Q(v1,d1>0?A21:A11)+H.Q(v2,d1>0?A22:A12)};}
    else if(ser){const dd=d1;// cylinder 1 first, its outlet feeds cylinder 2
      if(dd>0){const pmid=F2*10/A12;const p=(F1+pmid*A21)*10/A11/10;const need=(F1*10+pmid*A21)/A11;const blocked=end1||end2;
        if(!blocked&&need<pr){v1=H.v(P.Q,A11);v2=v1*A21/A12;ps=need;Qr=0;pA1=need;pM=pmid;}else{ps=pr;Qr=P.Q;pA1=pr;pM=end2?Math.min(pr*A11/A21,999):pmid;}}
      else{const p2=Ff*10/A22;const pmid=Ff*10/A21;const need=(Ff*10+pmid*A12)/A22;const blocked=end1||end2;
        if(!blocked&&need<pr){v2=H.v(P.Q,A22);v1=v2*A12/A21;ps=need;pM=pmid;}else{ps=pr;Qr=P.Q;pM=pmid;}}
      pA2=pM;const Q1=H.Q(v1,A11);q={LP:P.Q-Qr,L1A:dd*Q1,L1B:dd*H.Q(v1,A21),LM:dd*H.Q(v1,A21),L2A:dd*H.Q(v2,A12),L2B:dd*H.Q(v2,A22),LT:H.Q(v2,dd>0?A22:A12)};}
    else if(m==='tan'&&(d1!==0||d2!==0)){// only one valve actuated (or opposite directions → treat valve 1 priority)
      if(d1!==0){const need=d1>0?F1*10/A11:Ff*10/A21;if(!end1&&need<pr){v1=H.v(P.Q,d1>0?A11:A21);ps=need;}else{ps=pr;Qr=P.Q;}pA1=d1>0?ps:.4;pM=.5;q={LP:P.Q-Qr,L1A:d1*H.Q(v1,A11),L1B:d1*H.Q(v1,A21),LM:P.Q-Qr,LT:P.Q-Qr};
        if(d2!==0){const need2=d2>0?F2*10/A12:Ff*10/A22;}}
      else{const need=d2>0?F2*10/A12:Ff*10/A22;if(!end2&&need<pr){v2=H.v(P.Q,d2>0?A12:A22);ps=need+.5;pM=need;}else{ps=pr;pM=pr;Qr=P.Q;}pA2=d2>0?pM:.4;q={LP:P.Q-Qr,LM:P.Q-Qr,L2A:d2*H.Q(v2,A12),L2B:d2*H.Q(v2,A22),LT:P.Q-Qr};}}
    else{ps=m==='tan'?.6:pr;Qr=m==='tan'?0:P.Q;q={LP:m==='tan'?P.Q:0,LM:m==='tan'?P.Q:0,LT:m==='tan'?P.Q:0};}
    st.x1=clamp(st.x1+d1*v1*dt,0,S);st.x2=clamp(st.x2+(m==='tan'?d2:d1)*v2*dt,0,S);KIT.ease(st,'si',KIT.idx[P.pos],dt);KIT.ease(st,'si2',KIT.idx[P.pos2],dt);KIT.rpmAng(st,dt,1450);
    const pm=KIT.nice(Math.max(pr,ps)*1.05);
    return {p:{P:ps,A1:pA1,A2:pA2,M:pM,B:.4,B1:(m==='ser'||ser)?pM:.4,B2:.4,T:.3,S:-.05},q:Object.assign({LS:P.Q,LRV:Qr,LRT:Qr},q),pmax:pm,qref:P.Q,ps,v1,v2,ser,A11,A21,A12,A22,F1,F2,pr,mode:m,d1,d2,
      c:{C1:{x:st.x1/S,uA:pA1/pm,uB:(m==='ser'||ser?pM:.4)/pm,lt:`${fmt(P.F1,0)} kN`},C2:{x:st.x2/S,uA:pA2/pm,uB:.4/pm,lt:`${fmt(P.F2,0)} kN`},V1:{i:st.si},V2:{i:st.si2},P1:{on:true,ang:st.ang},RV:{open:clamp(Qr/P.Q,0,1)}},
      read:[{k:'לחץ משאבה',v:ps,u:'bar'},{k:'לחץ צילינדר 1',v:pA1,u:'bar'},{k:'לחץ צילינדר 2',v:pA2,u:'bar'},{k:'מהירות צילינדר 1',v:v1,u:'mm/s',max:H.v(P.Q,Math.min(A21,A22))},{k:'מהירות צילינדר 2',v:v2,u:'mm/s',max:H.v(P.Q,Math.min(A21,A22))},{k:'הפרש מיקום 1−2',v:st.x1-st.x2,u:'mm',dg:0}]};},
  ins(P,R){const L=[];const p1=R.F1*10/R.A11,p2=R.F2*10/R.A12;
    if(R.mode==='par'){L.push({ic:'🔀',h:`מקבילי: השמן הולך בדרך הקלה. צילינדר 1 צריך ${fmt(p1,0)} bar וצילינדר 2 – ${fmt(p2,0)} bar, ולכן <b>${p1<p2?'צילינדר 1':'צילינדר 2'} זז ראשון</b>, והשני מתחיל רק כשהראשון מגיע לסוף.`,at:p1<p2?'C1':'C2'});
      L.push({ic:'⚡',h:'לחץ המשאבה = הלחץ של הצילינדר שזז עכשיו. הספיקה מתחלקת לפי העומסים, לא שווה בשווה.'});}
    if(R.ser){const pmid=R.F2*10/R.A12;L.push({ic:'➕',h:`טורי: הלחץ בצילינדר 2 (${fmt(pmid,0)} bar) "נשען" על צד המוט בוכנה של צילינדר 1. לחץ המשאבה = (F₁ + p₂·A₂₁)/A₁₁ = <b>${fmt((R.F1*10+pmid*R.A21)/R.A11,0)} bar</b> – הלחצים מצטברים.`,at:'G1'});
      L.push({ic:'🔗',h:`המהירויות קשורות: v₂ = v₁·A₂₁/A₁₂ = v₁·${fmt(R.A21/R.A12,2)}. ${Math.abs(R.A21/R.A12-1)<.03?'השטחים שווים – תנועה מסונכרנת.':'השטחים לא שווים – הצילינדרים לא יגיעו לסוף יחד.'}`});}
    if(R.mode==='tan'&&!R.ser){L.push({ic:'🚦',h:'טנדם: שסתום במרכז מעביר את כל הספיקה הלאה (P→T) לשסתום הבא. מפעילים כל צילינדר בנפרד במהירות מלאה, או את שניהם יחד – ואז הם בטור.'});
      if(R.d1!==0&&R.d2!==0)L.push({ic:'🥇',w:true,at:'V1',h:'שני השסתומים בכיוונים שונים: שסתום 1 מקבל עדיפות – השני מקבל רק את מה שחוזר מהראשון.'});}
    if(R.ps>=R.pr*.98&&(R.v1+R.v2)<1&&(R.d1||R.d2))L.push({ic:'🛑',w:true,at:'RV',h:`הלחץ הדרוש עבר את הכיול (${fmt(P.pr,0)} bar) או שצילינדר הגיע לסוף – שסתום הפריקה פתוח.`,c:'שסתום הפריקה פתוח'});return L;},
  calc(P,R){const p1=R.F1*10/R.A11,p2=R.F2*10/R.A12;return `<div class="kpis">${kpi('p צילינדר 1',fmt(p1,1),'bar')}${kpi('p צילינדר 2',fmt(p2,1),'bar')}${kpi('טורי: p משאבה',fmt((R.F1*10+p2*R.A21)/R.A11,1),'bar')}${kpi('טורי: v₂/v₁',fmt(R.A21/R.A12,3))}</div>`+
    det('לחצים לכל צילינדר',row('',`p₁ = F₁/A₁₁ = ${fmt(R.F1,0)}·10/${fmt(R.A11,0)} = ${V(p1,'bar')}`)+row('',`p₂ = F₂/A₁₂ = ${V(p2,'bar')}`),true)+
    det('חיבור מקבילי',row('',`הצילינדר עם הלחץ הנמוך זז קודם: v = Q/A = ${V(H.v(P.Q,p1<p2?R.A11:R.A12),'mm/s')}`))+
    det('חיבור טורי',row('',`p_pump·A₁₁ = F₁ + p₂·A₂₁  ⇒  p = ${V((R.F1*10+p2*R.A21)/R.A11,'bar')}`)+row('',`v₁ = Q/A₁₁ = ${V(H.v(P.Q,R.A11),'mm/s')} ; v₂ = v₁·A₂₁/A₁₂ = ${V(H.v(P.Q,R.A11)*R.A21/R.A12,'mm/s')}`),true)+`<div class="note">מוטות: d = 0.56·D. עומסים פועלים נגד היציאה בלבד; חיכוך 300 N.</div>`;},
  demo:[{t:'שני צילינדרים, משאבה אחת',x:'שני צילינדרים עם עומסים שונים: 10 kN ו-25 kN. איך מחברים אותם?',reset:true,set:{mode:'par',auto:false,pos:'0'},hl:['C1','C2']},
    {t:'מקבילי',x:'שניהם מחוברים לאותו קו. השמן תמיד בוחר את הדרך הקלה: <b>הצילינדר הקל זז ראשון</b>, והכבד רק אחריו.',set:{pos:'a',auto:true},hl:['C1','C2','G1'],dur:10},
    {t:'טורי',x:'השמן שיוצא מצד המוט של צילינדר 1 נכנס לצילינדר 2. שניהם זזים יחד, אבל <b>הלחצים מצטברים</b> – כאן כ-88 bar במקום 81.',set:{mode:'ser'},hl:['G1','C1','C2'],dur:10},
    {t:'טנדם',x:'שני שסתומים עם מרכז טנדם בטור: כשאחד במרכז הוא מעביר את כל הספיקה לשני. כל צילינדר יכול לזוז לבד במהירות מלאה.',set:{mode:'tan',pos:'0',pos2:'a',auto:false},hl:['V1','V2','C2'],dur:9},
    {t:'שני השסתומים יחד',x:'מפעילים את שני השסתומים: השמן שחוזר מצילינדר 1 מזין את צילינדר 2 – בדיוק כמו בטורי.',set:{pos:'a',pos2:'a',auto:true},hl:['V1','V2','G1'],dur:10}],
  predict:[{q:'מקבילי: עומס 10 kN על צילינדר 1 ו-25 kN על צילינדר 2 (שניהם Ø63). מי יזוז ראשון?',set:{mode:'par',D2:63,auto:false,pos:'0'},go:P=>{P.pos='a';},opts:['צילינדר 1','צילינדר 2','שניהם יחד'],a:0,dur:5,why:'לצילינדר 1 צריך פחות לחץ. כל עוד הוא זז, הלחץ במערכת לא מגיע למה שצילינדר 2 צריך.'},
    {q:'טורי: מה יהיה לחץ המשאבה לעומת חיבור מקבילי?',set:{mode:'ser',auto:false,pos:'0'},go:P=>{P.pos='a';},opts:['נמוך יותר','גבוה יותר','זהה'],a:1,dur:4,why:'בטורי הצילינדר הראשון דוחף גם את העומס שלו וגם את הלחץ של השני (דרך שטח המוט) – הלחצים מצטברים.'}],
  tasks:[{q:P=>`טורי: F₁ = ${P.F1} kN, F₂ = ${P.F2} kN, D₁ = ${P.D1}, D₂ = ${P.D2} (d = 0.56·D). מה לחץ המשאבה?`,a:P=>{const A11=H.A(P.D1),A21=H.Aann(P.D1,P.D1*.56),A12=H.A(P.D2);const p2=(P.F2*1000+300)*10/A12;return ((P.F1*1000+300)*10+p2*A21)/A11;},u:'bar',tol:.04,hint:'p₂ = F₂/A₁₂, ואז p = (F₁ + p₂·A₂₁)/A₁₁.',rand:P=>{P.F1=rnd(5,30,1);P.F2=rnd(5,30,1);P.D1=pick([63,80]);P.D2=pick([40,50,63]);}},
    {q:P=>`טורי: D₁ = ${P.D1} (d₁ = ${fmt(P.D1*.56,1)}), D₂ = ${P.D2}. מה היחס v₂/v₁?`,a:P=>H.Aann(P.D1,P.D1*.56)/H.A(P.D2),u:'',hint:'v₂ = v₁·A₂₁/A₁₂.',rand:P=>{P.D1=pick([63,80,100]);P.D2=pick([40,50,63,80]);}},
    {q:P=>`מקבילי: Q = ${P.Q} L/min, הקל זז ראשון: Ø${P.D1}. מה מהירותו?`,a:P=>H.v(P.Q,H.A(P.D1)),u:'mm/s',hint:'כל הספיקה הולכת לצילינדר שזז: v = Q/A.',rand:P=>{P.Q=rnd(10,60,5);P.D1=pick([40,50,63,80]);}}],
  faults:[{id:'relief',t:'שסתום פריקה מכויל נמוך',sym:'"בחיבור הטורי שני הצילינדרים לא זזים בכלל, ובמקבילי רק הקל זז."',hint:'השוו את הלחץ הדרוש בטורי לכיול.',why:'הכיול ירד ל-72 bar: בטורי צריך כ-88 bar, ובמקבילי הכבד צריך כ-81 bar.',set:{mode:'ser'}},
    {id:'stick',t:'חיכוך גבוה באטמים',sym:'"הלחצים גבוהים מהמחושב בשני הצילינדרים, גם בחזרה."',hint:'בחזרה אין עומס – מה הלחץ שם?',why:'חיכוך של 6 kN בכל צילינדר מוסיף לחץ קבוע, גם בכיוון שבו אין עומס.',set:{mode:'par'}}],
  test(H){const P=clone(this.P);P.auto=false;P.mode='ser';const {R}=runSim(this,P,.3);const A11=H.A(63),A21=H.Aann(63,63*.56),A12=H.A(63);const p2=(25300)*10/A12;
    const P2=clone(this.P);P2.auto=false;const R2=runSim(this,P2,.3).R;
    return [['טורי: p = (F₁ + p₂·A₂₁)/A₁₁',R.ps,(10300*10+p2*A21)/A11,.005],['טורי: v₂ = v₁·A₂₁/A₁₂',R.v2,R.v1*A21/A12,.001],['טורי: v₁ = Q/A₁₁',R.v1,H.v(20,A11),.005],['מקבילי: הקל זז, הכבד עומד',R2.v2<1&&R2.v1>H.v(20,A11)*.95?1:0,1],['מקבילי: p ≈ p₁ + מפל קו',R2.ps,10300*10/A11,.08]];}};

/* ---------- 46 · synchronizing two cylinders lifting a platform ---------- */
SYM.plat={ports:o=>({}),bb:o=>[-125,-150,125,10],
  draw(g,o){const bar=sv('line',{class:'sy thick'},g);bar.style.strokeWidth=6;bar.style.stroke='#9a5b14';const box=sv('rect',{class:'load',width:34,height:22},g);const t=ST(g,0,0,'','st b');const ang=ST(g,0,0,'','st n');
    return cs=>{if(!cs)return;const {xl,yl,xr,yr,fx,lt,a}=cs;bar.setAttribute('x1',xl);bar.setAttribute('y1',yl);bar.setAttribute('x2',xr);bar.setAttribute('y2',yr);const bx=lerp(xl,xr,fx),by=lerp(yl,yr,fx);
      box.setAttribute('x',bx-17);box.setAttribute('y',by-26);box.setAttribute('transform',`rotate(${a} ${bx} ${by})`);t.setAttribute('x',bx);t.setAttribute('y',by-11);t.textContent=lt||'';ang.setAttribute('x',(xl+xr)/2);ang.setAttribute('y',Math.min(yl,yr)-34);ang.textContent=cs.at||'';};}};
B3.plat=(c,o)=>{const M=m3(),g=new THREE.Group();const bar=at(box3(1,8,40,M.orange),0,0,20);g.add(bar);const box=edges(at(box3(34,22,30,M.yellow),0,0,20));g.add(box);
  return {g,upd(cs){if(!cs)return;const {xl,yl,xr,yr,fx}=cs;const L=Math.hypot(xr-xl,yr-yl),a=Math.atan2(-(yr-yl),xr-xl);bar.scale.x=L;bar.position.set((xl+xr)/2,-(yl+yr)/2,20);bar.rotation.z=a;
    box.position.set(lerp(xl,xr,fx)-Math.sin(a)*15,-lerp(yl,yr,fx)+Math.cos(a)*15,20);box.rotation.z=a;}};};
const C15_SYNC={id:'sync',n:46,t:'סנכרון שני צילינדרים',d:'מרים פלטה עם עומס לא סימטרי – בלי סנכרון, עם מחלק זרימה, ובחיבור טורי (Master–Slave)',
  P:{meth:'div',F1:8,F2:20,e:3,Q:24,pr:160,S:300,pos:'a',auto:true},
  key:P=>P.meth,
  ui(U,P){U.grp('שיטת סנכרון');U.seg(P,'meth','שיטה',[['none','בלי','חיבור מקבילי פשוט'],['div','מחלק','מחלק זרימה גלגלי שיניים'],['ser','טורי','Master–Slave: A₂ של הראשון = A₁ של השני']],true);if(P.meth==='div')U.num(P,'e','אי-דיוק המחלק','%',{min:0,max:20,step:.5});
    U.grp('עומס על הפלטה');U.num(P,'F1','עומס בצד שמאל','kN',{min:0,max:60,step:1});U.num(P,'F2','עומס בצד ימין','kN',{min:0,max:60,step:1});
    U.grp('משאבה',false);U.num(P,'Q','ספיקה','L/min',{min:4,max:100,step:1});U.num(P,'pr','כיול שסתום פריקה','bar',{min:20,max:350,step:5});
    U.grp('הפעלה',false);U.seg(P,'pos','כיוון',[['a','▲ הרמה','הרמה'],['0','■','עצירה'],['b','▼ הורדה','הורדה']]);U.chk(P,'auto','מחזור אוטומטי');},
  geo(P){if(P.meth==='ser')return {D1:80,d1:45,D2:Math.sqrt(80*80-45*45),d2:36};return {D1:63,d1:36,D2:63,d2:36};},
  circuit(P){const g=this.geo(P);const comps=[{id:'C1',type:'cyl',x:180,y:200,rot:-90,name:`צילינדר שמאלי Ø${fmt(g.D1,1)}/${g.d1}`,lbl:'שמאל',lblAt:[-30,30],l3:[-30,0]},{id:'C2',type:'cyl',x:380,y:200,rot:-90,name:`צילינדר ימני Ø${fmt(g.D2,1)}/${g.d2}`,lbl:'ימין',lblAt:[34,30],l3:[30,0]},
      {id:'PL',type:'plat',x:280,y:0,name:'פלטה עם עומס'},
      {id:'P1',type:'pump',x:60,y:370,name:'משאבה',lbl:'משאבה',lblAt:[32,6]},{id:'T1',type:'tank',x:60,y:415,name:'מיכל'},{id:'RV',type:'pv',x:0,y:320,rot:-90,o:{kind:'relief'},name:'שסתום פריקה',lbl:'פריקה',lblAt:[0,-30]},{id:'T2',type:'tank',x:-40,y:350,name:'מיכל'},
      {id:'V1',type:'dcv',x:280,y:330,o:{box:KIT.D43.closed,L:'lever',center:true},name:'שסתום פיקוד 4/3',lbl:'4/3',lblAt:[80,4]},{id:'T3',type:'tank',x:360,y:400,name:'מיכל'},
      {id:'G1',type:'gauge',x:120,y:300,net:'P',name:'מד לחץ משאבה',valAt:[-16,-2]}];
    const lines=[{id:'LS',net:'S',pts:['T1.t','P1.in']},{id:'LP',net:'P',pts:['P1.out',[60,320],[273,320],'V1.P']},{id:'LRV',net:'P',pts:[[60,320],'RV.P']},{id:'LRT',net:'T',pts:['RV.T',[-40,320],'T2.t']},{id:'LT',net:'T',pts:['V1.T',[287,380],[360,380],'T3.t']}];
    if(P.meth==='none')lines.push({id:'LA',net:'A1',pts:['V1.A',[273,280],[194,280],'C1.A']},{id:'LA2',net:'A2',pts:[[273,280],[394,280],'C2.A']},{id:'LB',net:'B',pts:['C1.B',[214,150],[214,120],[440,120],[440,290],[287,290],'V1.B']},{id:'LB2',net:'B',pts:['C2.B',[414,150],[414,120]]});
    else if(P.meth==='div'){comps.push({id:'DV',type:'box',x:290,y:262,o:{w:56,h:22,t:'מחלק זרימה'},name:'מחלק זרימה – שני גלגלי שיניים על ציר משותף'});
      lines.push({id:'LA',net:'P2',pts:['V1.A',[273,280],[290,280],[290,273]]},{id:'LA1',net:'A1',pts:[[268,262],[194,262],'C1.A']},{id:'LA2',net:'A2',pts:[[312,262],[394,262],'C2.A']},{id:'LB',net:'B',pts:['C1.B',[214,150],[214,120],[440,120],[440,290],[287,290],'V1.B']},{id:'LB2',net:'B',pts:['C2.B',[414,150],[414,120]]});}
    else lines.push({id:'LA',net:'A1',pts:['V1.A',[273,280],[194,280],'C1.A']},{id:'LM',net:'M',pts:['C1.B',[214,140],[330,140],[330,262],[394,262],'C2.A']},{id:'LB',net:'B',pts:['C2.B',[440,150],[440,290],[287,290],'V1.B']});
    return {comps,lines};},
  init:P=>({x1:0,x2:0,si:KIT.idx[P.pos],dw:0,leakd:0}),
  click(id,P){if(id==='V1'){P.pos=P.pos==='a'?'0':P.pos==='0'?'b':'a';P.auto=false;return true;}},
  step(P,st,dt,ctx){const f=ctx.fault;const g=this.geo(P);const A11=H.A(g.D1),A21=H.Aann(g.D1,g.d1),A12=H.A(g.D2),A22=H.Aann(g.D2,g.d2);const S=P.S;const Ff=300;
    const pr=f==='relief'?P.pr*.35:P.pr;const e=(f==='divwear'?12:P.e)/100;const dir=KIT.dirOf(P.pos);const F1=P.F1*1000+Ff,F2=P.F2*1000+Ff;const k=P.Q/Math.sqrt(2);
    if(P.auto){const e1=(dir>0&&st.x1>=S-1e-6&&st.x2>=S-1e-6)||(dir<0&&st.x1<=1e-6&&st.x2<=1e-6);if(e1||st.stuck){st.dw+=dt;if(st.dw>1.2){P.pos=P.pos==='a'?'b':'a';st.dw=0;}}else st.dw=0;}
    const end1=(dir>0&&st.x1>=S-1e-6)||(dir<0&&st.x1<=1e-6),end2=(dir>0&&st.x2>=S-1e-6)||(dir<0&&st.x2<=1e-6);let v1=0,v2=0,ps=.5,p1=.3,p2=.3,pM=0,Qr=0,q={};
    if(dir>0){if(P.meth==='none'){const r=c15Par(P.Q,pr,[end1?null:F1*10/A11,end2?null:F2*10/A12],k);ps=r.ps;Qr=r.Qr;v1=H.v(r.Q[0],A11);v2=H.v(r.Q[1],A12);p1=end1?ps:F1*10/A11;p2=end2?ps:F2*10/A12;q={LA:H.Q(v1,A11),LA2:H.Q(v2,A12)};}
      else if(P.meth==='div'){const Qa=P.Q/2*(1+e),Qb=P.Q/2*(1-e);const n1=F1*10/A11,n2=F2*10/A12;const dpd=4;const need=Math.max(end1?0:n1,end2?0:n2)+dpd;
        if(need<pr&&!(end1&&end2)){v1=end1?0:H.v(Qa,A11);v2=end2?0:H.v(Qb,A12);if(end1)v2=H.v(P.Q/2,A12);if(end2)v1=H.v(P.Q/2,A11);ps=need;}else{ps=pr;Qr=P.Q;}p1=end1?ps:n1;p2=end2?ps:n2;q={LA:P.Q-Qr,LA1:H.Q(v1,A11),LA2:H.Q(v2,A12)};}
      else{pM=F2*10/A12;const need=(F1*10+pM*A21)/A11;if(!end1&&!end2&&need<pr){v1=H.v(P.Q,A11);v2=v1*A21/A12;ps=need;}else{ps=pr;Qr=P.Q;}p1=ps;p2=pM;q={LA:H.Q(v1,A11),LM:H.Q(v1,A21)};}}
    else if(dir<0){// lowering: each side metered equally (counterbalance / flow control on each side) – the platform levels at the bottom
      const vd=H.v(P.Q,A21+A22)*1.2;v1=end1?0:vd;v2=end2?0:vd;ps=20;p1=p2=.5;q={LA:-H.Q(v1,A11)-(P.meth!=='ser'?H.Q(v2,A12):0)};}
    else{ps=pr;Qr=P.Q;}
    if(f==='leak'&&dir===0)st.x2=Math.max(0,st.x2-1.5*dt);
    st.stuck=dir>0&&Qr>.5*P.Q&&!(end1&&end2);
    st.x1=clamp(st.x1+dir*v1*dt,0,S);st.x2=clamp(st.x2+dir*v2*dt,0,S);KIT.ease(st,'si',KIT.idx[P.pos],dt);KIT.rpmAng(st,dt,1450);
    const pm=KIT.nice(Math.max(pr,ps)*1.05);const tipY=x=>200-(70+104*x/S);const yl=tipY(st.x1),yr=tipY(st.x2);const dx=st.x1-st.x2;const span=1500;const ang=Math.atan2(dx,span)*180/PI;
    const fx=(P.F2)/(P.F1+P.F2||1);
    return {p:{P:ps,P2:ps-2,A1:p1,A2:p2,M:pM,B:.4,T:.3,S:-.05},q:Object.assign({LS:P.Q,LP:P.Q-Qr,LRV:Qr,LRT:Qr,LB:-(H.Q(v1,A21)+(P.meth!=='ser'?H.Q(v2,A22):0))*dir,LB2:-H.Q(v2,A22)*dir,LT:dir?(P.Q-Qr)*.8:0},q),pmax:pm,qref:P.Q,
      ps,v1,v2,dx,ang,p1,p2,dir,A11,A21,A12,A22,
      c:{C1:{x:st.x1/S,uA:p1/pm,uB:(P.meth==='ser'?pM:.4)/pm},C2:{x:st.x2/S,uA:p2/pm,uB:.4/pm},PL:{xl:-100,yl:yl,xr:100,yr:yr,fx,lt:`${fmt(P.F1+P.F2,0)} kN`,a:Math.atan2(yr-yl,200)*180/PI,at:`הטיה ${fmt(Math.abs(ang),2)}°`},V1:{i:st.si},P1:{on:true,ang:st.ang},RV:{open:clamp(Qr/P.Q,0,1)}},
      read:[{k:'גובה שמאל',v:st.x1,u:'mm',max:S},{k:'גובה ימין',v:st.x2,u:'mm',max:S},{k:'הפרש גבהים',v:dx,u:'mm',w:Math.abs(dx)>.05*S},{k:'שגיאת סנכרון',v:Math.abs(dx)/S*100,u:'%',max:20},{k:'לחץ משאבה',v:ps,u:'bar'},{k:'לחץ שמאל / ימין',v:p1,u:'bar'}]};},
  ins(P,R){const L=[];
    if(P.meth==='none')L.push({ic:'↗️',w:Math.abs(R.dx)>.05*P.S,at:'PL',h:`בלי סנכרון השמן הולך לצד הקל: ${P.F1<=P.F2?'שמאל':'ימין'} עולה ראשון והפלטה נטויה (${fmt(Math.abs(R.dx),0)} mm).`,c:'הפלטה נטויה – הצד הקל עולה ראשון'});
    if(P.meth==='div')L.push({ic:'⚙️',h:`מחלק זרימה: שני גלגלי שיניים על ציר אחד מחלקים את הספיקה לשניים כמעט שווים – בלי קשר לעומס. אי-דיוק של ${fmt(P.e,1)}% ⇒ הפרש של כ-${fmt(P.S*P.e/100*2/(2+P.e/100*0),0)} mm במהלך מלא.`,at:'DV'});
    if(P.meth==='ser'){const r=R.A21/R.A12;L.push({ic:'🔗',h:`Master–Slave: השמן מצד המוט של השמאלי ממלא את הימני. A₂₁ = ${fmt(R.A21,0)} mm² = A₁₂ = ${fmt(R.A12,0)} mm² ⇒ סנכרון מדויק (יחס ${fmt(r,3)}).`,at:'C2'});
      L.push({ic:'➕',h:`המחיר: הלחצים מצטברים – המשאבה צריכה ${fmt(R.ps,0)} bar לעומס שבמקבילי היה דורש ${fmt(Math.max(R.p2,(P.F1*1000+300)*10/R.A11),0)} bar.`});}
    if(Math.abs(R.dx)>.05*P.S&&P.meth!=='none')L.push({ic:'⚠️',w:true,at:'PL',h:`הפרש של ${fmt(Math.abs(R.dx),0)} mm – יותר מ-5% מהמהלך. בדקו את המחלק או דליפות.`,c:'שגיאת סנכרון גבוהה'});
    L.push({ic:'⬇️',h:'בהורדה כל צד מבוקר בנפרד (שסתום איזון עומס/צמצם בכל צד), והפלטה מתיישרת בתחתית.'});return L;},
  calc(P,R){const e=P.e/100;return `<div class="kpis">${kpi('לחץ שמאל',fmt((P.F1*1000+300)*10/R.A11,1),'bar')}${kpi('לחץ ימין',fmt((P.F2*1000+300)*10/R.A12,1),'bar')}${kpi('מחלק: הפרש בסוף',fmt(P.S*2*e/(1+e),1),'mm')}${kpi('טורי: יחס',fmt(R.A21/R.A12,3))}</div>`+
    det('בלי סנכרון',row('',`p_שמאל = ${V((P.F1*1000+300)*10/R.A11,'bar')} ; p_ימין = ${V((P.F2*1000+300)*10/R.A12,'bar')} – הנמוך זז ראשון`),true)+
    det('מחלק זרימה',row('',`Q₁ = Q/2·(1+e) = ${V(P.Q/2*(1+e),'L/min')} ; Q₂ = Q/2·(1−e) = ${V(P.Q/2*(1-e),'L/min')}`)+row('כשהמהיר מגיע לסוף',`Δx = s·(1 − (1−e)/(1+e)) = ${V(P.S*(1-(1-e)/(1+e)),'mm')}`),true)+
    det('Master–Slave',row('',`תנאי סנכרון: A₂₁ = A₁₂ ⇒ D₂ = √(D₁² − d₁²) = √(80² − 45²) = ${V(Math.sqrt(80*80-45*45),'mm')}`)+row('לחץ',`p = (F₁ + p₂·A₂₁)/A₁₁`))+`<div class="note">בטורי נדרש גם שסתום יישור בסוף המהלך, כי דליפות קטנות מצטברות ממחזור למחזור.</div>`;},
  demo:[{t:'פלטה עם עומס לא סימטרי',x:'שני צילינדרים מרימים פלטה. העומס קרוב לצד ימין: 20 kN מימין ו-8 kN משמאל.',reset:true,set:{meth:'none',auto:false,pos:'0'},hl:['PL']},
    {t:'בלי סנכרון',x:'חיבור מקבילי פשוט: הצד השמאלי הקל עולה עד הסוף, ורק אז הימני – <b>הפלטה נטויה מאוד</b>.',set:{pos:'a',auto:true},hl:['C1','C2','PL'],dur:10},
    {t:'מחלק זרימה',x:'מחלק זרימה מחלק את הספיקה לשניים כמעט שווים, בלי קשר לעומס. נשאר הפרש קטן – אי-הדיוק של המחלק.',set:{meth:'div'},hl:['DV','PL'],dur:10},
    {t:'Master–Slave',x:'חיבור טורי עם שטחים מותאמים: השמן מצד המוט של השמאלי נכנס לימני. אותו נפח ⇒ אותה מהירות – סנכרון כמעט מושלם, במחיר לחץ גבוה.',set:{meth:'ser'},hl:['C1','C2','G1'],dur:10}],
  predict:[{q:'בלי סנכרון, עומס 8 kN משמאל ו-20 kN מימין. מה יקרה בהרמה?',set:{meth:'none',auto:false,pos:'0'},go:P=>{P.pos='a';},opts:['שני הצדדים יחד','שמאל ראשון','ימין ראשון'],a:1,dur:6,why:'השמן הולך לצד שדורש פחות לחץ – הצד הקל עולה ראשון.'},
    {q:'במחלק זרימה מכפילים את העומס בצד ימין. מה יקרה להפרש הגבהים?',set:{meth:'div',F2:40,auto:false,pos:'0'},go:P=>{P.pos='a';},opts:['יגדל מאוד','כמעט לא ישתנה','יתהפך'],a:1,dur:7,why:'מחלק גלגלי שיניים קובע ספיקה (נפח לסיבוב), לא לחץ – הוא כמעט לא מושפע מהעומס.'}],
  tasks:[{q:P=>`מחלק עם אי-דיוק ${P.e}%, מהלך ${P.S} mm. מה הפרש הגבהים כשהצד המהיר מגיע לסוף?`,a:P=>P.S*(1-(1-P.e/100)/(1+P.e/100)),u:'mm',hint:'Δx = s·(1 − (1−e)/(1+e)).',rand:P=>{P.e=pick([1,2,3,5,8]);P.S=rnd(200,1000,50);}},
    {q:P=>`Master–Slave: D₁ = ${P.S>500?100:80}, d₁ = ${P.S>500?56:45}. מה צריך להיות קוטר הצילינדר השני?`,a:P=>P.S>500?Math.sqrt(100*100-56*56):Math.sqrt(80*80-45*45),u:'mm',hint:'A₁₂ = A₂₁ ⇒ D₂ = √(D₁² − d₁²).',rand:P=>{P.S=pick([300,800]);}}],
  faults:[{id:'divwear',t:'מחלק הזרימה שחוק',sym:'"הפלטה עולה עם הטיה הולכת וגדלה, יותר מבעבר."',hint:'השוו את שגיאת הסנכרון לאי-הדיוק שעל השלט (3%).',why:'גלגלי שיניים שחוקים דולפים – החלוקה כבר לא שווה (12%).',set:{meth:'div'}},
    {id:'leak',t:'הצילינדר הימני דולף פנימית',sym:'"כשעוצרים באמצע, הצד הימני שוקע לאט והפלטה נטויה."',hint:'עצרו את השסתום באמצע והסתכלו על הגבהים.',why:'שמן עובר מעבר לאטם בוכנת הצילינדר הימני, והוא שוקע תחת העומס.',set:{meth:'div',auto:false,pos:'a'}},
    {id:'relief',t:'שסתום פריקה מכויל נמוך',sym:'"בחיבור הטורי הפלטה לא עולה בכלל, אבל עם מחלק היא עולה."',hint:'חשבו את הלחץ הדרוש בטורי והשוו לכיול.',why:'הכיול 56 bar – בטורי הלחצים מצטברים ודורשים יותר.',set:{meth:'ser'}}],
  test(H){const P=clone(this.P);P.auto=false;P.meth='ser';const g=this.geo(P);const {R}=runSim(this,P,1);const A11=H.A(80),A21=H.Aann(80,45),A12=H.A(g.D2);
    const P2=clone(this.P);P2.auto=false;const R2=runSim(this,P2,1).R;const P3=clone(this.P);P3.auto=false;P3.meth='none';const R3=runSim(this,P3,1).R;
    return [['Master–Slave: A₂₁ = A₁₂',A21,A12,.001],['טורי: v₂ = v₁',R.v2,R.v1,.001],['טורי: p = (F₁ + p₂·A₂₁)/A₁₁',R.ps,(8300*10+20300*10/A12*A21)/A11,.005],['מחלק: v₁/v₂ = (1+e)/(1−e)',R2.v1/R2.v2,1.03/.97,.002],['בלי סנכרון: רק השמאלי זז',R3.v2<1&&R3.v1>10?1:0,1]];}};

LABS.push({ch:15,title:'מעגלים עם מספר מפעילים',sims:[C15_SPT,C15_SYNC]});
}
