/* lab 6 – same code as the website */
{




/* ===================== Chapter 6 – actuators: double-acting cylinder (18), end cushioning (19), hydraulic motor (20) ===================== */

/* shared layout: pump + relief + 4/3 lever valve + horizontal cylinder */
function c6Cyl(o={}){return {comps:[{id:'C1',type:'cyl',x:300,y:60,o:Object.assign({},o.cyl||{}),name:o.cname||'צילינדר דו-פעולה',lbl:'צילינדר',lblAt:[-80,-22],l3:[0,-34]},
    {id:'V1',type:'dcv',x:300,y:170,o:{box:o.box||KIT.D43.closed,L:'lever',center:true},name:'שסתום פיקוד 4/3 מופעל ידית (לחיצה מחליפה מצב)',lbl:'4/3',lblAt:[80,4]},
    {id:'P1',type:'pump',x:200,y:290,name:'משאבה קבועה + מנוע חשמלי',lbl:'משאבה',lblAt:[30,6]},{id:'T1',type:'tank',x:200,y:335,name:'מיכל'},
    {id:'RV',type:'pv',x:150,y:240,rot:-90,o:{kind:'relief'},name:'שסתום פריקה',lbl:'פריקה',lblAt:[0,-30]},{id:'T2',type:'tank',x:110,y:270,name:'מיכל'},{id:'T3',type:'tank',x:380,y:240,name:'מיכל'},
    {id:'G1',type:'gauge',x:245,y:228,net:'P',name:'מד לחץ משאבה',l3:[0,-30]},{id:'G2',type:'gauge',x:228,y:100,net:'A',name:'מד לחץ – צד מלא (A)',valAt:[-16,-2]},{id:'G3',type:'gauge',x:372,y:100,net:'B',name:'מד לחץ – צד המוט (B)'},...(o.extra||[])],
   lines:[{id:'LS',net:'S',pts:['T1.t','P1.in']},{id:'LP',net:'P',pts:['P1.out',[200,240],[293,240],'V1.P'],tag:{at:[248,262],t:'q'}},{id:'LRV',net:'P',pts:[[200,240],'RV.P']},{id:'LRT',net:'T',pts:['RV.T',[110,240],'T2.t']},
    {id:'LA',net:'A',pts:['V1.A',[293,120],[250,120],'C1.A']},{id:'LB',net:'B',pts:['V1.B',[307,120],[350,120],'C1.B']},{id:'LT',net:'T',pts:['V1.T',[307,215],[380,215],'T3.t'],tag:{at:[350,232],t:'q'}},...(o.xlines||[])]};}
const C6_E=210000;const C6_TAPER=15;   // cushion spear taper gap at entry [mm²], closes to zero at the end of the cushion
          // steel E [N/mm²]
const C6_MOUNT=[[2,'חופשי–מקובע (מקרה 1)'],[1,'ציר–ציר (מקרה 2)'],[.7,'ציר–מקובע (מקרה 3)'],[.5,'מקובע–מקובע (מקרה 4)']];
const c6Fcr=(d,L,K)=>PI*PI*C6_E*(PI*d**4/64)/((K*L)**2);   // N

/* ---------- 18 · double-acting cylinder: forces, speeds, buckling ---------- */
const C6_CYL={id:'cyl',n:18,t:'צילינדר דו-פעולה',d:'כוח ומהירות שונים ביציאה ובחזרה בגלל שטח המוט בוכנה; בדיקת קריסה של המוט',
  P:{D:63,d:36,S:500,Q:20,pr:160,Fe:30,Fr:5,K:1,L0:200,pos:'a',auto:true},
  ui(U,P){U.grp('צילינדר');U.num(P,'D','קוטר בוכנה D','mm',{min:20,max:250,step:1});U.num(P,'d','קוטר מוט d','mm',{min:8,max:200,step:1});U.num(P,'S','מהלך','mm',{min:50,max:3000,step:10});
    U.grp('משאבה ועומס');U.num(P,'Q','ספיקה Q','L/min',{min:1,max:200,step:1});U.num(P,'pr','לחץ מקסימלי (שסתום פריקה)','bar',{min:20,max:350,step:5});U.num(P,'Fe','עומס ביציאה','kN',{min:0,max:500,step:1});U.num(P,'Fr','עומס בחזרה','kN',{min:0,max:500,step:1});
    U.grp('קריסת המוט',false);U.sel(P,'K','אופן התקנה (אוילר)',C6_MOUNT.map(([k,t])=>[k,t]));U.num(P,'L0','אורך נוסף (מוט + תושבות)','mm',{min:0,max:1000,step:10});
    U.grp('הפעלה',false);U.seg(P,'pos','שסתום',KIT.pos3);U.chk(P,'auto','מחזור אוטומטי');},
  circuit(){const o=c6Cyl({extra:[{id:'CH',type:'chart',x:560,y:150,o:{w:150,h:100,t:'כוח קריסה מול מהלך',xl:'mm',yl:'kN'},name:'כוח הקריסה (כחול), הכוח המקסימלי ×3.5 (אדום), והמהלך הנוכחי'}]});
    o.comps[0].o={load:{t:'F'}};return o;},
  init:P=>({x:0,si:KIT.idx[P.pos]}),
  click(id,P){if(id==='V1'){P.pos=P.pos==='a'?'0':P.pos==='0'?'b':'a';P.auto=false;return true;}},
  step(P,st,dt,ctx){const f=ctx.fault;const d=Math.min(P.d,P.D-2);const A1=H.A(P.D),A2=H.Aann(P.D,d);let dir=KIT.dirOf(P.pos);if(f==='swap')dir=-dir;
    const Ff=f==='bent'?12000:300;const kb=f==='bypass'?.035*P.Q:0;const atEnd=(dir>0&&st.x>=P.S-1e-6)||(dir<0&&st.x<=1e-6);
    let r;if(dir===0)r=H.lin({Qp:P.Q,pr:P.pr,Ain:A1,Aout:A2,F:1e12});
    else if(dir>0)r=H.lin({Qp:P.Q,pr:P.pr,Ain:A1,Aout:A2,F:atEnd?1e12:P.Fe*1000+Ff,kBleed:kb,kOut:P.Q*4});
    else r=H.lin({Qp:P.Q,pr:P.pr,Ain:A2,Aout:A1,F:atEnd?1e12:P.Fr*1000+Ff,kBleed:kb,kOut:P.Q*4});
    st.x=clamp(st.x+dir*r.v*dt,0,P.S);KIT.autoCycle(P,st,dt,atEnd&&dir!==0);KIT.ease(st,'si',KIT.idx[P.pos],dt);KIT.rpmAng(st,dt,1450);
    let pA=.4,pB=.4,qA=0,qB=0,qT=0;if(dir>0){pA=r.stall?r.ps:r.pIn;pB=r.pOut;qA=r.Qin;qB=-r.Qout;qT=r.Qout;}else if(dir<0){pB=r.stall?r.ps:r.pIn;pA=r.pOut;qB=r.Qin;qA=-r.Qout;qT=r.Qout;}
    const pm=KIT.nice(P.pr*1.05);const Fe=P.pr*A1/10,Fr=P.pr*A2/10;const L=(P.S+P.L0);const Fcr=c6Fcr(d,L,P.K);const nu=Fcr/Fe;
    const smax=Math.max(P.S*2,1000);const cur=[];for(let i=0;i<=40;i++){const s=50+(smax-50)*i/40;cur.push([s,c6Fcr(d,s+P.L0,P.K)/1000]);}const ymax=KIT.nice(Math.max(Fe*3.5,Fcr)*1.2/1000);
    return {p:{P:r.ps,A:pA,B:pB,T:.3,S:-.05},q:{LS:P.Q,LP:dir?r.Qin:0,LRV:r.Qr+r.Qb,LRT:r.Qr+r.Qb,LA:qA,LB:qB,LT:qT},pmax:pm,qref:P.Q,r,dir,A1,A2,d,Fcr,nu,Fe,Fr,v:r.v,
      c:{C1:{x:st.x/P.S,uA:pA/pm,uB:pB/pm,lt:`${fmt(dir<0?P.Fr:P.Fe,0)} kN`},V1:{i:st.si},P1:{on:true,ang:st.ang},RV:{open:clamp((r.Qr+r.Qb)/P.Q,0,1)},
        CH:{x:[0,smax],y:[0,ymax],s:[{p:cur,c:'#0b72d9'},{p:[[0,Fe*3.5/1000],[smax,Fe*3.5/1000]],c:'#dc2626',d:true},{p:[[P.S,0],[P.S,ymax]],c:'#94a3b8',d:true}],m:[P.S,Fcr/1000]}},
      read:[{k:'לחץ צד מלא A',v:pA,u:'bar'},{k:'לחץ צד המוט B',v:pB,u:'bar'},{k:'מהירות הבוכנה',v:r.v,u:'mm/s',max:H.v(P.Q,A2)},{k:'כוח מקסימלי ביציאה',v:Fe/1000,u:'kN',dg:1},{k:'כוח מקסימלי בחזרה',v:Fr/1000,u:'kN',dg:1},{k:'מקדם ביטחון לקריסה',v:nu,u:'',dg:2,w:nu<3.5}]};},
  ins(P,R){const L=[],phi=R.A1/R.A2;
    L.push({ic:'⚖️',h:`יחס השטחים <b>φ = A₁/A₂ = ${fmt(phi,2)}</b>: ביציאה כוח גדול פי ${fmt(phi,2)} ומהירות קטנה פי ${fmt(phi,2)} מאשר בחזרה.`,at:'C1'});
    if(R.dir>0&&!R.r.stall)L.push({ic:'➡️',h:`יציאה: p_A = ${fmt(R.p.A,0)} bar מספיק לדחוף ${fmt(P.Fe,0)} kN. v = Q/A₁ = <b>${fmt(R.v,0)} mm/s</b>.`});
    if(R.dir<0&&!R.r.stall)L.push({ic:'⬅️',h:`חזרה: אותה ספיקה על A₂ – <b>${fmt(R.v,0)} mm/s</b>, ויוצאים ${fmt(P.Q*phi,1)} L/min מהצד המלא.`});
    if(R.r.stall&&R.dir!==0&&R.r.v===0&&!((R.dir>0&&R.p.A>=P.pr*.99)||(R.dir<0&&R.p.B>=P.pr*.99)))L.push({ic:'🛑',h:'סוף מהלך: הלחץ עולה לכיול שסתום הפריקה.'});
    if(P.Fe*1000>R.Fe)L.push({ic:'⛔',w:true,at:'C1',h:`העומס ביציאה (${fmt(P.Fe,0)} kN) גדול מהכוח המקסימלי (${fmt(R.Fe/1000,1)} kN) – הצילינדר לא יזוז ושסתום הפריקה פתוח.`,c:'העומס גדול מהכוח המקסימלי'});
    if(R.nu<3.5)L.push({ic:'⚠️',w:true,at:'C1',h:`סכנת קריסה: כוח הקריסה ${fmt(R.Fcr/1000,1)} kN – רק פי ${fmt(R.nu,2)} מהכוח המקסימלי. מקובל לפחות 3.5. הגדילו את קוטר המוט או שנו התקנה.`,c:`מקדם קריסה ${fmt(R.nu,2)} – נמוך מ-3.5`});
    else L.push({ic:'🦴',h:`קריסה: F_cr = π²EI/(K·L)² = ${fmt(R.Fcr/1000,0)} kN, מקדם ביטחון ${fmt(R.nu,1)} ✓. קוטר המוט משפיע בחזקה רביעית.`});return L;},
  calc(P,R){const A1=R.A1,A2=R.A2,d=R.d,I=PI*d**4/64,L=P.S+P.L0;return `<div class="kpis">${kpi('כוח יציאה מקס׳',fmt(R.Fe/1000,1),'kN')}${kpi('כוח חזרה מקס׳',fmt(R.Fr/1000,1),'kN')}${kpi('מהירות יציאה',fmt(H.v(P.Q,A1),0),'mm/s')}${kpi('מהירות חזרה',fmt(H.v(P.Q,A2),0),'mm/s')}</div>`+
    det('שטחים',row('',`A₁ = π·${P.D}²/4 = ${V(A1,'mm²')}`)+row('',`A₂ = π·(${P.D}² − ${d}²)/4 = ${V(A2,'mm²')}`)+row('',`φ = A₁/A₂ = ${V(A1/A2,'',3)}`),true)+
    det('כוחות ולחצים',row('יציאה',`F = p·A₁ = ${P.pr}·${fmt(A1,0)}/10 = ${V(R.Fe/1000,'kN')}`)+row('חזרה',`F = p·A₂ = ${V(R.Fr/1000,'kN')}`)+row('לחץ לעומס ביציאה',`p = F/A₁ = ${fmt(P.Fe*1000,0)}·10/${fmt(A1,0)} = ${V(P.Fe*1e4/A1,'bar')}`),true)+
    det('מהירויות',row('',`v₁ = Q/A₁ = ${V(H.v(P.Q,A1),'mm/s')} ; v₂ = Q/A₂ = ${V(H.v(P.Q,A2),'mm/s')}`)+row('זמני מהלך',`t₁ = ${V(P.S/H.v(P.Q,A1),'s')} ; t₂ = ${V(P.S/H.v(P.Q,A2),'s')}`))+
    det('קריסה (אוילר)',row('מומנט התמד',`I = π·d⁴/64 = ${V(I,'mm⁴',0)}`)+row('אורך קריסה',`L_k = K·(s + L₀) = ${P.K}·${fmt(L,0)} = ${V(P.K*L,'mm',0)}`)+row('',`F_cr = π²·E·I/L_k² = ${V(R.Fcr/1000,'kN')}`)+row('מקדם ביטחון',`ν = F_cr/F_max = ${V(R.nu,'',2)}`,R.nu>=3.5),true)+
    `<div class="note">E = 210,000 N/mm². הבדיקה לפי אוילר מתאימה למוטות ארוכים ודקים; בצילינדר קצר קובע חוזק החומר.</div>`;},
  demo:[{t:'צילינדר דו-פעולה',x:'שני תאים: הצד <b>המלא A₁</b> (כל שטח הבוכנה) והצד <b>של המוט A₂</b> (טבעת). שסתום הפיקוד קובע לאיזה תא נכנס השמן.',reset:true,set:{pos:'0',auto:false},hl:['C1','V1']},
    {t:'יציאה',x:'מצב a: השמן נכנס ל-A₁. הלחץ נקבע מהעומס: <b>p = F/A₁</b> ≈ 96 bar עבור 30 kN.',set:{pos:'a'},hl:['C1','G2'],dur:6},
    {t:'חזרה',x:'מצב b: אותה ספיקה נכנסת לשטח הקטן A₂ – החזרה מהירה פי φ, אבל הכוח המקסימלי קטן פי φ.',set:{pos:'b'},hl:['C1','G3'],dur:6},
    {t:'סוף מהלך',x:'בקצה הבוכנה עוצרת, הלחץ עולה לכיול שסתום הפריקה וכל הספיקה עוברת בו.',set:{pos:'a',auto:false},hl:['RV','G1'],dur:7},
    {t:'קריסת המוט',x:'מוט ארוך ודק בלחיצה עלול לקרוס. בגרף: כוח הקריסה יורד בריבוע האורך. הנקודה האדומה צריכה להיות מעל הקו המקווקו (3.5 × הכוח המקסימלי).',set:{S:1200},hl:['CH','C1']},
    {t:'מוט עבה יותר',x:'מוט Ø45 במקום Ø36: I גדל פי 2.4 (d⁴) והמקדם עולה – אבל השטח A₂ קטן והחזרה מהירה עוד יותר.',set:{d:45},hl:['CH']}],
  predict:[{q:'מעבירים מיציאה לחזרה באותה ספיקה (D63/36). המהירות:',set:{pos:'b',auto:false},act:(P,st)=>{st.x=P.S;},opts:['זהה','גדלה פי ~1.5','קטנה'],a:1,why:'φ = A₁/A₂ = 63²/(63²−36²) ≈ 1.48. אותה ספיקה על שטח קטן יותר → מהירה יותר.'},
    {q:'מכפילים את קוטר המוט (באותו מהלך והתקנה). כוח הקריסה:',set:{d:28},opts:['פי 2','פי 4','פי 16'],a:2,why:'F_cr ∝ I ∝ d⁴. הכפלת d מגדילה את כוח הקריסה פי 16.'},
    {q:'עומס של 60 kN ביציאה, לחץ מקסימלי 160 bar ו-D63. מה יקרה?',set:{Fe:60,pos:'a',auto:false},opts:['ייצא לאט','ייעצר ושסתום הפריקה ייפתח','ייצא במהירות רגילה'],a:1,why:'F_max = 160·3117/10 ≈ 49.9 kN < 60 kN. הלחץ מגיע לכיול והצילינדר עומד.'},
    {q:'מחליפים התקנה מ"ציר–ציר" ל"חופשי–מקובע" (צילינדר שהמוט שלו לא מובל). כוח הקריסה:',set:{K:2},opts:['קטן פי 4','גדל פי 2','לא משתנה'],a:0,why:'אורך הקריסה K·L גדל פי 2 (1→2), ו-F_cr ∝ 1/L_k² – קטן פי 4.'}],
  tasks:[{q:P=>`D = ${P.D}, p = ${P.pr} bar. מה הכוח המקסימלי ביציאה? (kN)`,a:P=>P.pr*H.A(P.D)/10/1000,u:'kN',hint:'F = p·A₁, 1 bar = 0.1 N/mm².',rand:P=>{P.D=pick([40,50,63,80,100,125]);P.pr=rnd(100,250,10);}},
    {q:P=>`D = ${P.D}, d = ${P.d}, p = ${P.pr} bar. מה הכוח המקסימלי בחזרה? (kN)`,a:P=>P.pr*H.Aann(P.D,P.d)/10/1000,u:'kN',hint:'F = p·A₂, A₂ = π(D²−d²)/4.',rand:P=>{P.D=pick([50,63,80,100]);P.d=Math.round(P.D*pick([.5,.56,.63,.7]));P.pr=rnd(100,250,10);}},
    {q:P=>`נדרש כוח דחיפה 80 kN ב-${P.pr} bar. מה קוטר הבוכנה המינימלי? (mm)`,a:P=>Math.sqrt(80000*10/P.pr*4/PI),u:'mm',hint:'A = F/p, D = √(4A/π).',rand:P=>{P.pr=rnd(100,250,10);}},
    {q:P=>`מוט Ø${P.d}, אורך קריסה K·L = ${P.K*(P.S+P.L0)} mm. מה כוח הקריסה? (kN, E = 210 GPa)`,a:P=>c6Fcr(P.d,P.S+P.L0,P.K)/1000,u:'kN',hint:'F_cr = π²EI/L_k², I = πd⁴/64.',rand:P=>{P.d=pick([20,25,28,36,45]);P.S=rnd(300,1500,50);P.K=pick([.5,.7,1,2]);}}],
  faults:[{id:'bypass',t:'אטם הבוכנה דולף (מעקף פנימי)',sym:'"בלי עומס הצילינדר מהיר כרגיל, אבל עם עומס הוא איטי מאוד, ולפעמים זוחל אחורה."',hint:'השוו את המהירות עם עומס ובלי עומס.',why:'שמן עובר מהתא בלחץ לתא השני דרך האטם. ככל שהלחץ גבוה יותר – הדליפה גדולה יותר והמהירות יורדת.'},
    {id:'bent',t:'מוט עקום – חיכוך גבוה',sym:'"הלחץ גבוה בכ-40 bar ממה שהעומס מצדיק, בשני הכיוונים."',hint:'חשבו p = F/A ביציאה ובחזרה והשוו למדים.',why:'חיכוך של כ-12 kN באטמים ובתותב מוסיף לחץ בשני הכיוונים. בודקים ישרות המוט ושחיקת תותב.'},
    {id:'swap',t:'צינורות A ו-B הוחלפו',sym:'"אחרי החלפת צינורות, הידית במצב יציאה מכניסה את הצילינדר."',hint:'הזיזו את הידית ל-a: לאיזה כיוון הבוכנה זזה, ואיזה מד עולה?',why:'קו A של השסתום מחובר לצד המוט. הכיוון הפוך ושטחי העבודה מתחלפים – גם הכוחות והמהירויות.'}],
  test(H){const P=clone(this.P);P.auto=false;const {R}=runSim(this,P,.5);const A1=H.A(63),A2=H.Aann(63,36);const P2=clone(this.P);P2.auto=false;P2.pos='b';const s2=this.init(P2);s2.x=P2.S;let R2;for(let t=0;t<.5;t+=.02)R2=this.step(P2,s2,.02,{});
    const P3=clone(this.P);P3.auto=false;P3.Fe=60;const R3=runSim(this,P3,.5).R;
    return [['F = p·A₁ (160 bar, Ø63)',R.Fe,160*A1/10],['p_A = (F + p_B·A₂)/A₁',R.p.A,(30300*10+R.p.B*A2)/A1,.01],['v = Q/A₁',R.v,H.v(20,A1),.005],['v חזרה = Q/A₂',R2.v,H.v(20,A2),.005],
      ['קריסה אוילר (d36, L700, K1)',R.Fcr,PI*PI*210000*(PI*36**4/64)/(700**2)],['עומס 60 kN → עצירה בכיול',R3.p.A,160+9.6*0,.07],['UI p_A',R.read[0].v,R.p.A]];}};

/* ---------- 19 · end-of-stroke cushioning (rod end) – dynamic with moving mass ---------- */
const C6_CUSH={id:'cush',n:19,t:'ריסון בסוף מהלך',d:'שרוול הריסון נכנס, הלחץ קופץ והמהירות יורדת; מה קורה בלי ריסון',
  P:{m:800,Q:40,D:63,d:36,S:400,pr:120,A0:.5,Lc:30,cush:true,pos:'a',auto:true},
  key:P=>P.cush?'c':'n',
  ui(U,P){U.grp('עומס ותנועה');U.num(P,'m','מסה נעה','kg',{min:10,max:10000,step:50});U.num(P,'Q','ספיקה','L/min',{min:2,max:200,step:1});U.num(P,'pr','כיול שסתום פריקה','bar',{min:20,max:300,step:5});
    U.grp('ריסון');U.chk(P,'cush','צילינדר עם ריסון',true);U.num(P,'A0','פתח מחט הריסון','mm²',{min:.1,max:40,step:.1});U.num(P,'Lc','אורך שרוול הריסון','mm',{min:5,max:80,step:1});
    U.grp('צילינדר',false);U.num(P,'D','קוטר בוכנה','mm',{min:25,max:200,step:1});U.num(P,'d','קוטר מוט','mm',{min:10,max:150,step:1});U.num(P,'S','מהלך','mm',{min:100,max:2000,step:10});
    U.grp('הפעלה',false);U.seg(P,'pos','שסתום',KIT.pos3);U.chk(P,'auto','מחזור אוטומטי');},
  circuit(P){const o=c6Cyl({cname:P.cush?'צילינדר עם ריסון בצד המוט: שרוול + מחט מתכווננת + אל-חוזר':'צילינדר ללא ריסון',
      extra:[{id:'CH',type:'chart',x:610,y:150,o:{w:150,h:100,t:'מהירות ולחץ לאורך המהלך',xl:'x [mm]',yl:'mm/s · bar'},name:'מהירות (כחול) ולחץ בתא המוט (אדום) לאורך מהלך היציאה האחרון'},
        ...(P.cush?[{id:'NV',type:'throttle',x:470,y:98,rot:90,name:'מחט הריסון – כאן יוצא השמן אחרי שהשרוול נכנס',lbl:'מחט ריסון',lblAt:[0,24]}]:[])],
      xlines:P.cush?[{id:'LN',net:'B',pts:[[350,98],'NV.in']},{id:'LN2',net:'BV',pts:['NV.out',[500,98],[500,138],[330,138],[330,120]]}]:[]});
    o.comps[0].o={load:{t:'m'}};if(P.cush)o.lines.find(l=>l.id==='LB').net='BV';return o;},
  init:P=>({x:0,v:0,si:KIT.idx[P.pos],hist:[],cur:[],vimp:0,pk:0,pkc:0,E:0}),
  click(id,P){if(id==='V1'){P.pos=P.pos==='a'?'0':P.pos==='0'?'b':'a';P.auto=false;return true;}},
  step(P,st,dt,ctx){const f=ctx.fault;const d=Math.min(P.d,P.D-2);const A1=H.A(P.D),A2=H.Aann(P.D,d);const dir=KIT.dirOf(P.pos);const Ff=300;
    const cush=P.cush&&f!=='nocush';const k0=H.orK(P.A0*(f==='clog'?.12:1))+(f==='seal'?H.orK(3):0);const kOf=x=>k0+H.orK(C6_TAPER*(1-clamp((x-(P.S-P.Lc))/P.Lc,0,1))**1.5);const k=k0;const vP=H.v(P.Q,A1);
    let pA=.4,pB=.4,pP=.4,qr=0,inC=false;
    if(dir>0){const n=Math.max(1,Math.ceil(dt/.0005));const h=dt/n;
      for(let i=0;i<n;i++){if(st.x>=P.S){st.v=0;break;}inC=cush&&st.x>P.S-P.Lc;const kx=kOf(st.x);const pb=v=>2+(inC?H.orDp(kx,H.Q(v,A2)):0);
        pB=pb(st.v);const pAflow=(pB*A2/10+Ff)*10/A1;
        if(st.v>=vP-1e-9&&pAflow<=P.pr){st.v=vP;pA=pAflow;}
        else{pA=P.pr;const v0=st.v;const g=vn=>P.m*(vn-v0)/h/1000-(((pA*A1-pb(vn)*A2)/10)-Ff);st.v=g(0)>=0?0:g(vP)<=0?vP:H.bisect(g,0,vP,50);pB=pb(st.v);}  // implicit in v: the cushion orifice is stiff
        st.x+=st.v*h;if(st.x>=P.S){st.x=P.S;if(st.v>0){st.vimp=st.v;st.E=.5*P.m*(st.v/1000)**2;}st.v=0;}}
      if(h>0&&st.x>=P.S){pA=P.pr;pB=.4;}
      pP=pA;qr=Math.max(0,P.Q-H.Q(st.v,A1));
      if(dt>0){st.pk=Math.max(st.pk,pB);st.cur.push([st.x,st.v,pB]);if(st.cur.length>300)st.cur.splice(0,st.cur.length-300);}
    }else if(dir<0){if(!st.retr){st.retr=true;}const r=H.lin({Qp:P.Q,pr:P.pr,Ain:A2,Aout:A1,F:st.x<=1e-6?1e12:Ff,kOut:P.Q*4});st.v=0;st.x=Math.max(0,st.x-r.v*dt);pB=r.stall?r.ps:r.pIn;pA=r.pOut;pP=r.ps;qr=r.Qr;
      if(st.cur.length&&st.x<P.S-5){st.hist=st.cur;st.cur=[];st.pkc=st.pk;st.pk=0;}}
    else{pP=P.pr;qr=P.Q;st.v=0;}
    const atEnd=(dir>0&&st.x>=P.S-1e-6)||(dir<0&&st.x<=1e-6);KIT.autoCycle(P,st,dt,atEnd&&dir!==0,.8);KIT.ease(st,'si',KIT.idx[P.pos],dt);KIT.rpmAng(st,dt,1450);
    const pm=KIT.nice(Math.max(P.pr,st.pk,st.pkc||0)*1.05);const show=st.cur.length>5?st.cur:st.hist;const ymax=KIT.nice(Math.max(vP*1.1,...show.map(c=>c[2]),10));
    const qB=dir>0?-H.Q(st.v,A2):dir<0?H.Q(H.v(P.Q,A2),A2):0;
    return {p:{P:pP,A:pA,B:pB,BV:inC?2:pB,T:.3,S:-.05},q:{LS:P.Q,LP:P.Q-qr,LRV:qr,LRT:qr,LA:dir>0?H.Q(st.v,A1):dir<0?-P.Q*A1/A2:0,LB:inC?0:qB,LN:inC?qB:0,LN2:inC?qB:0,LT:dir>0?H.Q(st.v,A2):dir<0?P.Q*A1/A2:0},pmax:pm,qref:P.Q,
      v:st.v,inC,vimp:st.vimp,E:st.E,pk:Math.max(st.pk,st.pkc||0),A1,A2,vP,k,dir,
      c:{C1:{x:st.x/P.S,uA:pA/pm,uB:pB/pm,lt:`${fmt(P.m,0)} kg`},V1:{i:st.si},P1:{on:true,ang:st.ang},RV:{open:clamp(qr/P.Q,0,1)},NV:{knob:P.A0/10},
        CH:{x:[0,P.S],y:[0,ymax],s:[{p:show.map(c=>[c[0],c[1]]),c:'#2563eb'},{p:show.map(c=>[c[0],c[2]]),c:'#dc2626'},...(P.cush?[{p:[[P.S-P.Lc,0],[P.S-P.Lc,ymax]],c:'#94a3b8',d:true}]:[])]}},
      read:[{k:'מהירות הבוכנה',v:st.v,u:'mm/s',max:vP},{k:'לחץ צד מלא A',v:pA,u:'bar'},{k:'לחץ בתא המוט',v:pB,u:'bar',w:pB>1.5*P.pr},{k:'שיא לחץ הריסון',v:Math.max(st.pk,st.pkc||0),u:'bar'},{k:'מהירות פגיעה בסוף',v:st.vimp,u:'mm/s',max:vP,w:st.vimp>.3*vP},{k:'אנרגיית פגיעה',v:st.E,u:'J',dg:2,max:Math.max(.5*P.m*(vP/1000)**2,.01)}]};},
  ins(P,R){const L=[];const E0=.5*P.m*(R.vP/1000)**2;
    L.push({ic:'🏃',h:`אנרגיה קינטית במהירות מלאה: ½·m·v² = ½·${P.m}·${fmt(R.vP/1000,3)}² = <b>${fmt(E0,1)} J</b>. את זה הריסון צריך "לבלוע".`});
    if(R.inC)L.push({ic:'🛡️',h:`השרוול נכנס: השמן מתא המוט יוצא דרך המרווח שהולך ונסגר ודרך המחט. הלחץ בתא עולה ל-${fmt(R.p.B,0)} bar ובולם את המסה.`,at:'NV'});
    if(!P.cush||ctxNoCush(P,R))L.push({ic:'💥',w:true,at:'C1',h:`בלי ריסון הבוכנה פוגעת במכסה ב-${fmt(R.vimp,0)} mm/s – מכה, רעש ושחיקה של המכסה והאטמים.`,c:'פגיעה במכסה במהירות מלאה'});
    if(R.pk>250)L.push({ic:'⚠️',w:true,at:'NV',h:`שיא לחץ ריסון ${fmt(R.pk,0)} bar – מעל 250 bar, הלחץ המותר לצילינדר טיפוסי. המסה גדולה מדי לריסון הזה: הורידו מהירות או הגדילו את אורך הריסון.`,c:'לחץ ריסון גבוה מדי'});
    else if(P.cush&&R.vimp<.2*R.vP&&R.vimp>0)L.push({ic:'✅',h:`ריסון טוב: מהירות פגיעה ${fmt(R.vimp,0)} mm/s ושיא לחץ ${fmt(R.pk,0)} bar.`});
    else if(P.cush&&R.vimp>=.3*R.vP)L.push({ic:'🔧',h:'המחט פתוחה מדי או השרוול קצר – הבוכנה עדיין פוגעת חזק. סגרו מעט את המחט.',at:'NV'});
    L.push({ic:'📉',h:'בגרף: הקו הכחול (מהירות) יורד אחרי הקו המקווקו (תחילת הריסון) והאדום (לחץ בתא המוט) קופץ.'});return L;},
  calc(P,R){const E0=.5*P.m*(R.vP/1000)**2;const pAv=E0/(R.A2*P.Lc/1000)*10/1000;return `<div class="kpis">${kpi('אנרגיה קינטית',fmt(E0,1),'J')}${kpi('לחץ ריסון ממוצע דרוש',fmt(E0*1000/(R.A2*P.Lc)*10+P.pr*R.A1/R.A2,0),'bar')}${kpi('שיא בסימולציה',fmt(R.pk,0),'bar')}${kpi('מהירות פגיעה',fmt(R.vimp,0),'mm/s')}</div>`+
    det('אנרגיה לבלימה',row('',`E = ½·m·v² = ½·${P.m}·(${fmt(R.vP,0)}/1000)² = ${V(E0,'J')}`)+row('בנוסף – המשאבה ממשיכה לדחוף',`F_p = p_r·A₁ = ${V(P.pr*R.A1/10/1000,'kN')} לאורך ${P.Lc} mm`),true)+
    det('לחץ ריסון ממוצע',row('',`p_c·A₂·L_c = E + p_r·A₁·L_c ⇒ p_c = ${fr('E','A₂·L_c')} + p_r·${fr('A₁','A₂')}`)+row('',`p_c = ${fmt(E0*1000/(R.A2*P.Lc)*10,1)} + ${fmt(P.pr*R.A1/R.A2,1)} = ${V(E0*1000/(R.A2*P.Lc)*10+P.pr*R.A1/R.A2,'bar')}`),true)+
    det('המחט',row('',`Q = v·A₂ ; Δp = (Q/k)², k = 0.637·A₀ = ${V(H.orK(P.A0),'',3)}`)+row('בכניסה לריסון',`Δp = (${fmt(H.Q(R.vP,R.A2),1)}/${fmt(H.orK(P.A0),2)})² = ${V((H.Q(R.vP,R.A2)/H.orK(P.A0))**2,'bar')}`))+
    `<div class="note">המסה נעה אופקית; חיכוך 300 N. הלחץ בתא המוט יכול לעלות מעל כיול שסתום הפריקה – הוא לא מחובר לשסתום הפריקה בזמן הריסון.</div>`;},
  demo:[{t:'מסה בתנועה',x:'הצילינדר מזיז מסה של 800 ק"ג ב-214 mm/s. בלי ריסון היא תיעצר בבת אחת על המכסה.',reset:true,set:{cush:false,auto:true},hl:['C1'],dur:8},
    {t:'מה זה ריסון',x:'עם ריסון: <b>שרוול</b> על המוט נכנס לפתח בסוף המהלך וחוסם את היציאה הראשית. השמן נאלץ לעבור דרך <b>מחט</b> קטנה.',set:{cush:true},hl:['NV','C1'],dur:8},
    {t:'הלחץ בולם',x:'השרוול חרוטי: המרווח נסגר בהדרגה, הלחץ בתא המוט עולה (קו אדום) ויוצר כוח בלימה. המהירות (קו כחול) יורדת לפני המכסה.',hl:['CH','G3'],dur:8},
    {t:'מחט סגורה מדי',x:'פתח 0.1 mm²: הבוכנה זוחלת לאט מאוד בסוף המהלך ומאריכה את זמן המחזור. גם זה לא טוב.',set:{A0:.1},hl:['NV','CH'],dur:9},
    {t:'מחט פתוחה מדי',x:'פתח 5 mm²: המחט מעבירה כמעט את כל הספיקה – הבוכנה עדיין פוגעת חזק.',set:{A0:5},hl:['NV'],dur:8},
    {t:'כיוון נכון',x:'מכוונים את המחט כך שהבוכנה מגיעה למכסה לאט, והשיא נשאר בגבולות. בדרך כלל מכוונים בשטח עם המסה האמיתית.',set:{A0:.5},hl:['NV','CH'],dur:8}],
  predict:[{q:'מכפילים את המסה ל-1600 ק"ג (אותה מחט). מה יקרה לשיא הלחץ בריסון?',set:{m:1600,auto:true},opts:['יעלה','יירד','לא ישתנה'],a:0,dur:6,why:'יותר אנרגיה קינטית לבלום על אותו אורך – הלחץ בתא המוט עולה.'},
    {q:'מוציאים את הריסון (שרוול שבור). מה יקרה בסוף המהלך?',set:{cush:false,auto:true},opts:['הבוכנה תאט מעצמה','פגיעה במכסה במהירות מלאה','שסתום הפריקה יבלום אותה'],a:1,dur:5,why:'בלי ריסון אין התנגדות לפני המכסה – הבוכנה נעצרת בבת אחת על המכסה.'},
    {q:'סוגרים את המחט מ-0.5 ל-0.2 mm². מהירות הפגיעה:',set:{A0:.2,auto:true},opts:['תגדל','תקטן','לא תשתנה'],a:1,dur:6,why:'פתח קטן = לחץ ריסון גבוה יותר = בלימה חזקה יותר, ולכן מהירות קטנה יותר בסוף (ושיא לחץ גבוה יותר).'}],
  tasks:[{q:P=>`מסה ${P.m} ק"ג נעה ב-${fmt(H.v(P.Q,H.A(P.D)),0)} mm/s. מה האנרגיה הקינטית? (J)`,a:P=>.5*P.m*(H.v(P.Q,H.A(P.D))/1000)**2,u:'J',hint:'E = ½·m·v², v ב-m/s.',rand:P=>{P.m=rnd(100,3000,50);P.Q=rnd(10,80,5);}},
    {q:P=>`ספיקה של 20 L/min יוצאת דרך מחט ${P.A0} mm² (k = 0.637·A₀). מה מפל הלחץ?`,a:P=>(20/H.orK(P.A0))**2,u:'bar',hint:'Δp = (Q/k)².',rand:P=>{P.A0=pick([1,1.5,2,3,4,5]);}},
    {q:P=>`E = 40 J, A₂ = ${fmt(H.Aann(P.D,P.d),0)} mm², שרוול ${P.Lc} mm. מה הלחץ הממוצע הדרוש רק לבלימת האנרגיה? (bar)`,a:P=>40*1000/(H.Aann(P.D,P.d)*P.Lc)*10,u:'bar',hint:'p = E/(A₂·L_c), J = N·m → N·mm ×1000.',rand:P=>{P.Lc=pick([20,25,30,40]);P.D=pick([50,63,80]);P.d=Math.round(P.D*.56);}}],
  faults:[{id:'nocush',t:'שרוול הריסון שבור',sym:'"מכה חזקה בסוף כל מהלך, גם כשהמחט כמעט סגורה."',hint:'סובבו את המחט – האם משהו משתנה? מה מראה המד בצד המוט בסוף המהלך?',why:'בלי שרוול השמן לא מופנה למחט, ולכן אין לחץ ריסון בכלל וכיוון המחט לא משנה דבר.'},
    {id:'clog',t:'מחט הריסון סתומה (לכלוך)',sym:'"בסוף המהלך הצילינדר כמעט נעצר וזוחל לאט מאוד, וזמן המחזור התארך."',hint:'השוו את מהירות הפגיעה לזו שמתקבלת עם הפתח שכוון (נסו לפתוח את המחט).',why:'לכלוך מקטין את הפתח האפקטיבי של המחט: בסוף הריסון כמעט אין דרך לשמן לצאת והבוכנה זוחלת. מנקים את המחט ומחליפים מסנן.'},
    {id:'seal',t:'אטם השרוול דולף',sym:'"הריסון חלש – מכה בסוף המהלך, וסגירת המחט עוזרת רק מעט."',hint:'סגרו את המחט כמעט עד הסוף. האם הלחץ בתא המוט עולה כצפוי?',why:'שמן עוקף את המחט דרך האטם השחוק, ולכן הלחץ לא מגיע לערך הנדרש.'}],
  test(H){const P=clone(this.P);P.auto=false;const {R}=runSim(this,P,3,.01);const A1=H.A(63);const P2=clone(this.P);P2.auto=false;P2.cush=false;const R2=runSim(this,P2,3,.01).R;
    const P3=clone(this.P);P3.auto=false;const R3=runSim(this,P3,.6,.01).R;
    return [['מהירות לפני הריסון = Q/A₁',R3.v,H.v(40,A1),.005],['בלי ריסון: פגיעה במהירות מלאה',R2.vimp,H.v(40,A1),.01],['עם ריסון: פגיעה איטית',R.vimp<.3*H.v(40,A1)?1:0,1],['E = ½mv²',R2.E,.5*800*(H.v(40,A1)/1000)**2,.02],['UI מהירות פגיעה',R.read[4].v,R.vimp]];}};
function ctxNoCush(P,R){return P.cush&&R.vimp>.9*R.vP;}

/* ---------- 20 · hydraulic motor: torque from pressure, speed from flow (gear / gerotor cutaway) ---------- */
SYM.gmotor=SYM.motor;
B3.gmotor=(c,o)=>{const M=m3(),g=new THREE.Group();const z=14;const house=at(cyl3(19,16,M.glass,'z'),0,0,z);g.add(house);g.add(edges(at(box3(42,42,4,M.alu),0,0,z-9)));
  const mkGear=(r,n,mat)=>{const G=new THREE.Group();G.add(cyl3(r,10,mat,'z'));for(let i=0;i<n;i++){const t=box3(3.2,3.6,10,mat);const a=i/n*2*PI;t.position.set(Math.cos(a)*(r+1.4),Math.sin(a)*(r+1.4),0);t.rotation.z=a;G.add(t);}return G;};
  const gearA=at(mkGear(6.5,12,M.steel),-8,0,z),gearB=at(mkGear(6.5,12,M.dark),8.6,0,z);gearB.rotation.z=PI/12;
  const outer=new THREE.Group();at(outer,0,0,z);for(let i=0;i<7;i++){const a=i/7*2*PI;outer.add(at(cyl3(3.2,10,M.dark,'z'),Math.cos(a)*13,Math.sin(a)*13,0));}const ring=new THREE.Mesh(new THREE.TorusGeometry(15,1.6,8,40),M.alu);outer.add(ring);
  const inner=new THREE.Group();at(inner,2.2,0,z);inner.add(cyl3(6,10,M.steel,'z'));for(let i=0;i<6;i++){const a=i/6*2*PI;inner.add(at(cyl3(3.1,10,M.steel,'z'),Math.cos(a)*8,Math.sin(a)*8,0));}
  g.add(gearA,gearB,outer,inner);g.add(at(cyl3(3,30,M.steel,'x'),30,0,z));const fw=new THREE.Group();at(fw,46,0,z);fw.add(cyl3(14,8,M.dark,'x'));fw.add(at(box3(9,24,3,M.orange),5,0,0));g.add(fw);
  g.add(at(cyl3(4,10,M.steel),0,22,z));g.add(at(cyl3(4,10,M.steel),0,-22,z));
  return {g,upd(cs){const a=(cs&&cs.ang)||0,ty=(cs&&cs.type)||'gear';gearA.visible=gearB.visible=ty==='gear';outer.visible=inner.visible=ty!=='gear';
    gearA.rotation.z=a;gearB.rotation.z=-a+PI/12;inner.rotation.z=a;inner.position.x=2.2*Math.cos(-a/6);inner.position.y=2.2*Math.sin(-a/6);outer.rotation.z=a*6/7;fw.rotation.x=-a;}};};
const C6_MOT={id:'motor',n:20,t:'מנוע הידראולי',d:'מומנט תלוי בלחץ ומהירות בספיקה; גלגלי שיניים וגרוטור בחתך',
  P:{Vg:50,Q:30,pr:160,TL:80,leak:2,eta:.9,type:'gear',pos:'a'},
  ui(U,P){U.grp('מנוע');U.seg(P,'type','סוג',[['gear','שיניים','מנוע גלגלי שיניים חיצוניים'],['gero','גרוטור','מנוע גרוטור (רוטור פנימי)']]);U.num(P,'Vg','נפח סגולי Vg','cm³/rev',{min:2,max:1000,step:1});
    U.num(P,'eta','נצילות הידרומכנית','',{min:.5,max:1,step:.01});U.num(P,'leak','דליפה ב-100 bar','L/min',{min:0,max:30,step:.5});
    U.grp('הזנה ועומס');U.num(P,'Q','ספיקה Q','L/min',{min:1,max:300,step:1});U.num(P,'pr','כיול שסתום פריקה','bar',{min:20,max:350,step:5});U.num(P,'TL','מומנט עומס','N·m',{min:0,max:3000,step:5});
    U.grp('הפעלה',false);U.seg(P,'pos','כיוון',[['a','◀ a','סיבוב קדימה'],['0','■ 0','עצירה'],['b','b ▶','סיבוב אחורה']]);},
  circuit(){return {comps:[{id:'P1',type:'pump',x:100,y:300,name:'משאבה קבועה + מנוע חשמלי',lbl:'משאבה',lblAt:[32,6]},{id:'T1',type:'tank',x:100,y:345,name:'מיכל'},
      {id:'RV',type:'pv',x:40,y:250,rot:-90,o:{kind:'relief'},name:'שסתום פריקה – קובע את המומנט המקסימלי',lbl:'פריקה',lblAt:[0,-30]},{id:'T2',type:'tank',x:0,y:280,name:'מיכל'},
      {id:'V1',type:'dcv',x:180,y:190,o:{box:KIT.D43.tandem,L:'lever',center:true},name:'שסתום פיקוד 4/3 מרכז טנדם',lbl:'4/3',lblAt:[82,4]},{id:'T3',type:'tank',x:250,y:250,name:'מיכל'},
      {id:'M1',type:'gmotor',x:180,y:90,rot:-90,o:{bi:true},name:'מנוע הידראולי דו-כיווני עם עומס (תוף/גלגל תנופה)',lbl:'מנוע',lblAt:[34,14],l3:[30,-50],val:R=>`${fmt(R.n,0)} rpm`,valAt:[24,-38]},
      {id:'G2',type:'gauge',x:118,y:110,net:'A',name:'מד לחץ – כניסה A',valAt:[-16,-2]},{id:'G3',type:'gauge',x:244,y:110,net:'B',name:'מד לחץ – יציאה B'},
      {id:'CH',type:'chart',x:420,y:150,o:{w:150,h:100,t:'מהירות מול מומנט',xl:'T [N·m]',yl:'rpm'},name:'אופיין המנוע: המהירות יורדת מעט עם המומנט (דליפה) עד העצירה בכיול שסתום הפריקה'}],
     lines:[{id:'LS',net:'S',pts:['T1.t','P1.in']},{id:'LP',net:'P',pts:['P1.out',[100,250],[173,250],'V1.P'],tag:{at:[140,272],t:'q'}},{id:'LRV',net:'P',pts:[[100,250],'RV.P']},{id:'LRT',net:'T',pts:['RV.T',[0,250],'T2.t']},
      {id:'LA',net:'A',pts:['V1.A',[173,140],[140,140],[140,90],'M1.A']},{id:'LB',net:'B',pts:['V1.B',[187,140],[220,140],[220,90],'M1.B']},{id:'LT',net:'T',pts:['V1.T',[187,225],[250,225],'T3.t']}]};},
  init:P=>({si:KIT.idx[P.pos],n:0}),
  click(id,P){if(id==='V1'){P.pos=P.pos==='a'?'0':P.pos==='0'?'b':'a';return true;}},
  step(P,st,dt,ctx){const f=ctx.fault;const dir=KIT.dirOf(P.pos);const pr=f==='relief'?P.pr*.5:P.pr;const Ci=(f==='wear'?P.leak*6:P.leak)/100;const TL=P.TL+(f==='brake'?.5*P.TL+40:0);const ov=Math.max(3,.06*pr);
    const pT=1.5;const dpN=20*PI*TL/(P.Vg*P.eta);const Tmax=Math.max(pr-pT,0)*P.Vg*P.eta/(20*PI);
    let dp,n,Qr=0;if(dir===0){dp=0;n=0;Qr=0;}
    else if(dpN+pT<=pr){dp=dpN;n=Math.max(0,(P.Q-Ci*dp)*1000/P.Vg);}
    else{dp=pr-pT;n=0;Qr=P.Q-Ci*dp;}
    if(dir!==0&&n===0&&dpN+pT<=pr){Qr=0;}
    const nT=dir*n;KIT.ease(st,'n',nT,dt,4);KIT.rpmAng(st,dt,st.n,'ma');KIT.rpmAng(st,dt,1450);KIT.ease(st,'si',KIT.idx[P.pos],dt);
    const pin=dir?dp+pT:.5;const pA=dir>0?pin:dir<0?pT:.3,pB=dir<0?pin:dir>0?pT:.3;const pP=dir?pin:.6;const Qm=dir?P.Q-Qr:0;const T=dir?Math.min(TL,Tmax):0;const Pw=T*2*PI*Math.abs(n)/60/1000;
    const pm=KIT.nice(P.pr*1.05);const nmax=P.Q*1000/P.Vg;const Tx=KIT.nice(Math.max(Tmax,TL)*1.2);const curve=[[0,nmax],[Tmax,Math.max(0,(P.Q-Ci*(pr-pT))*1000/P.Vg)],[Tmax,0],[Tx,0]];
    return {p:{P:pP,A:pA,B:pB,T:.3,S:-.05},q:{LS:P.Q,LP:dir?P.Q:0,LRV:Qr,LRT:Qr,LA:dir*Qm,LB:-dir*Qm,LT:Qm},pmax:pm,qref:P.Q,
      n,dp,Tmax,T,Pw,dpN,nmax,Ci,
      c:{P1:{on:true,ang:st.ang},RV:{open:clamp(Qr/P.Q,0,1)},V1:{i:st.si},M1:{ang:st.ma,type:P.type},
        CH:{x:[0,Tx],y:[0,KIT.nice(nmax*1.1)],s:[{p:curve,c:'#0b72d9'},{p:[[TL,0],[TL,KIT.nice(nmax*1.1)]],c:'#94a3b8',d:true}],m:[Math.min(TL,Tx),n]}},
      read:[{k:'מהירות סיבוב',v:n,u:'rpm',max:nmax},{k:'הפרש לחצים Δp',v:dp,u:'bar'},{k:'מומנט',v:T,u:'N·m',max:Tmax},{k:'מומנט מקסימלי',v:Tmax,u:'N·m'},{k:'הספק מכני',v:Pw,u:'kW',dg:2,max:H.kW(P.pr,P.Q)},{k:'ספיקה דרך שסתום הפריקה',v:Qr,u:'L/min',max:P.Q}]};},
  ins(P,R){const L=[];L.push({ic:'🔄',h:`<b>מהירות מהספיקה:</b> n = Q/Vg = ${fmt(P.Q,0)}·1000/${fmt(P.Vg,0)} = ${fmt(R.nmax,0)} rpm (פחות דליפה: ${fmt(R.n,0)} rpm).`,at:'M1'});
    L.push({ic:'💪',h:`<b>מומנט מהלחץ:</b> T = Δp·Vg·η/(20π). העומס ${fmt(P.TL,0)} N·m דורש Δp = <b>${fmt(R.dpN,0)} bar</b>.`});
    if(R.n===0&&KIT.dirOf(P.pos)!==0)L.push({ic:'🛑',w:true,at:'RV',h:`המומנט הדרוש גדול מ-${fmt(R.Tmax,0)} N·m שהלחץ המקסימלי נותן – המנוע עומד והספיקה עוברת בשסתום הפריקה.`,c:'המנוע נעצר – הלחץ לא מספיק לעומס'});
    if(R.Ci*R.dp>.05*P.Q)L.push({ic:'💧',h:`דליפה פנימית ${fmt(R.Ci*R.dp,1)} L/min בלחץ הזה – המהירות יורדת ככל שהעומס גדל.`});
    if(P.type==='gero')L.push({ic:'⚙️',h:'גרוטור: רוטור פנימי עם שן אחת פחות מהטבעת. התאים בין השיניים גדלים בצד הכניסה וקטנים בצד היציאה – מומנט גבוה במהירות נמוכה.'});
    else L.push({ic:'⚙️',h:'גלגלי שיניים: השמן נדחף סביב ההיקף בין השיניים לבית ודוחף את השיניים. פשוט, זול ומהיר.'});
    if(KIT.dirOf(P.pos)===0)L.push({ic:'⏸',h:'מרכז טנדם: המשאבה פורקת למיכל; קווי המנוע חסומים והמנוע נעצר.'});return L;},
  calc(P,R){return `<div class="kpis">${kpi('מהירות',fmt(R.n,0),'rpm')}${kpi('Δp לעומס',fmt(R.dpN,1),'bar')}${kpi('מומנט מקסימלי',fmt(R.Tmax,0),'N·m')}${kpi('הספק',fmt(R.Pw,2),'kW')}</div>`+
    det('מהירות',row('תאורטית',`n = ${fr('Q·1000','Vg')} = ${fr(fmt(P.Q)+'·1000',fmt(P.Vg))} = ${V(R.nmax,'rpm',0)}`)+row('עם דליפה',`n = ${fr('(Q − C·Δp)·1000','Vg')} = ${V(R.n,'rpm',0)}`),true)+
    det('מומנט',row('',`T = ${fr('Δp·Vg','20π')}·η  (Δp ב-bar, Vg ב-cm³)`)+row('לעומס',`Δp = ${fr('20π·T','Vg·η')} = ${fr('20π·'+fmt(P.TL,0),fmt(P.Vg,0)+'·'+P.eta)} = ${V(R.dpN,'bar')}`)+row('מקסימלי',`T_max = (p_r − p_T)·Vg·η/(20π) = ${V(R.Tmax,'N·m',0)}`),true)+
    det('הספק',row('',`P = T·ω = T·2π·n/60 = ${V(R.Pw,'kW',3)}`)+row('הספק הידראולי נכנס',`P = Δp·Q/600 = ${V(H.kW(R.dp,P.Q),'kW',3)}`))+`<div class="note">20π מגיע מ: T = Δp·Vg/(2π) עם Δp ב-N/mm² (bar/10) ו-Vg ב-mm³ (cm³·1000) → N·mm → N·m.</div>`;},
  demo:[{t:'מנוע הידראולי',x:'מנוע הידראולי הפוך למשאבה: שמן בלחץ נכנס, מסובב את הציר ויוצא בלחץ נמוך. בתלת-ממד רואים את גלגלי השיניים בחתך.',reset:true,set:{pos:'0'},hl:['M1'],view:'front'},
    {t:'ספיקה = מהירות',x:'מזיזים לידית a: <b>n = Q/Vg</b>. 30 L/min במנוע של 50 cm³/סיבוב = 600 rpm.',set:{pos:'a'},hl:['M1','P1'],dur:6},
    {t:'עומס = לחץ',x:'מומנט העומס קובע את הלחץ: <b>Δp = 20π·T/(Vg·η)</b>. 80 N·m → כ-112 bar.',hl:['G2','M1'],dur:6},
    {t:'עומס כבד',x:'מעלים את העומס ל-130 N·m: הלחץ עולה, והמהירות יורדת מעט – יותר דליפה פנימית בלחץ גבוה.',set:{TL:130},hl:['CH','G2'],dur:6},
    {t:'מעבר למקסימום',x:'200 N·m דורשים יותר מכיול שסתום הפריקה: המנוע נעצר והספיקה עוברת בשסתום הפריקה. זה גם המומנט המקסימלי של המערכת.',set:{TL:200},hl:['RV','M1'],dur:6},
    {t:'גרוטור',x:'מנוע גרוטור: רוטור פנימי מסתובב בתוך טבעת עם שן אחת יותר. נפח גדול בגודל קטן – מומנט גבוה.',set:{type:'gero',TL:80,Vg:160},hl:['M1'],dur:7},
    {t:'כיוון הפוך',x:'מצב b מחליף בין הכניסה ליציאה – המנוע מסתובב לכיוון השני באותה מהירות.',set:{pos:'b'},hl:['V1','M1']}],
  predict:[{q:'מחליפים את המנוע לנפח כפול (100 cm³) באותה ספיקה ועומס. מה יקרה?',set:{Vg:100,pos:'a'},opts:['מהירות חצי, לחץ חצי','מהירות כפולה, לחץ כפול','מהירות חצי, לחץ כפול'],a:0,why:'n = Q/Vg קטנה פי 2, ו-Δp = 20πT/Vg לאותו מומנט קטן פי 2.'},
    {q:'מכפילים את מומנט העומס (80→160 N·m). מה יקרה למהירות?',set:{TL:160,pos:'a'},opts:['תרד בחצי','כמעט לא תשתנה','המנוע ייעצר'],a:2,dur:3,why:'160 N·m דורשים Δp ≈ 223 bar, מעל הכיול (160 bar). המנוע ייעצר והספיקה תעבור בשסתום הפריקה.'},
    {q:'מכפילים את הספיקה ל-60 L/min. מה יקרה ללחץ?',set:{Q:60,pos:'a'},opts:['יוכפל','כמעט לא ישתנה','ייחצה'],a:1,dur:3,why:'הלחץ נקבע מהמומנט, לא מהספיקה. המהירות מוכפלת, הלחץ נשאר.'}],
  tasks:[{q:P=>`Q = ${P.Q} L/min, Vg = ${P.Vg} cm³/rev (ללא דליפה). מה מהירות המנוע?`,a:P=>P.Q*1000/P.Vg,u:'rpm',hint:'n = Q·1000/Vg.',rand:P=>{P.Q=rnd(10,120,5);P.Vg=pick([8,16,25,32,50,80,125,200]);}},
    {q:P=>`Δp = ${P.pr} bar, Vg = ${P.Vg} cm³/rev, η = ${P.eta}. מה המומנט? (N·m)`,a:P=>P.pr*P.Vg*P.eta/(20*PI),u:'N·m',hint:'T = Δp·Vg·η/(20π).',rand:P=>{P.pr=rnd(50,250,10);P.Vg=pick([16,25,50,80,160,250]);P.eta=pick([.85,.9,.95]);}},
    {q:P=>`צריך ${P.TL} N·m ב-${P.pr} bar (η = ${P.eta}). מה הנפח הסגולי המינימלי? (cm³/rev)`,a:P=>20*PI*P.TL/(P.pr*P.eta),u:'cm³/rev',hint:'Vg = 20π·T/(Δp·η).',rand:P=>{P.TL=rnd(20,800,10);P.pr=rnd(100,250,10);P.eta=pick([.85,.9]);}},
    {q:P=>`מומנט ${P.TL} N·m ב-${fmt(P.Q*1000/P.Vg,0)} rpm. מה ההספק המכני? (kW)`,a:P=>P.TL*2*PI*(P.Q*1000/P.Vg)/60/1000,u:'kW',hint:'P = T·2πn/60.',rand:P=>{P.TL=rnd(20,400,10);P.Q=rnd(10,80,5);P.Vg=pick([25,50,80]);}}],
  faults:[{id:'wear',t:'מנוע שחוק – דליפה פנימית גבוהה',sym:'"בלי עומס המהירות תקינה, אבל עם עומס היא נופלת הרבה; קו הניקוז חם."',hint:'השוו את המהירות בעומס נמוך ובעומס גבוה לחישוב Q/Vg.',why:'הדליפה ∝ Δp: ככל שהעומס (והלחץ) גבוה יותר, יותר שמן עוקף את גלגלי השיניים והמהירות יורדת.'},
    {id:'relief',t:'שסתום הפריקה מכויל נמוך',sym:'"המנוע נעצר בעומס שהיה מסובב בעבר בלי בעיה. המד לא עולה מעל 80 bar."',hint:'מה הלחץ המקסימלי במד הכניסה?',why:'הכיול 80 bar במקום 160 – המומנט המקסימלי ירד בחצי.'},
    {id:'brake',t:'בלם העומס גורר',sym:'"המנוע איטי מעט ולחץ הכניסה גבוה בהרבה מהצפוי למשקל העומס."',hint:'חשבו את Δp לעומס הנקוב והשוו למדים.',why:'בלם שלא משתחרר מוסיף מומנט. הלחץ גבוה – אבל המנוע עצמו תקין.'}],
  test(H){const P=clone(this.P);const {R}=runSim(this,P,1);const dp=20*PI*80/(50*.9);
    return [['Δp = 20πT/(Vg·η)',R.dp,dp,.001],['n = (Q − C·Δp)·1000/Vg',R.n,(30-.02*dp)*1000/50,.001],['T = Δp·Vg·η/20π',R.T,80,.001],['T_max בכיול',R.Tmax,(160-1.5)*50*.9/(20*PI),.001],['P = T·ω',R.Pw,80*2*PI*R.n/60/1000,.001],['UI rpm',R.read[0].v,R.n]];}};

LABS.push({ch:6,title:'מפעילים',sims:[C6_CYL,C6_CUSH,C6_MOT]});
}
