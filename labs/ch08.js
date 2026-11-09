/* lab 8 – same code as the website */
{




/* ===================== Chapter 8 – accessories: pressure intensifier (sim 32b) and accumulator (sim 33) ===================== */

/* ---------- extra symbol: single-acting pressure intensifier (big LP piston + small HP plunger on one rod) ----------
   ports A = LP cap side, B = LP annulus side, H = HP outlet. cs:{x 0..1, uA, uB, uH} */
SYM.intens={ports:o=>({A:[-62,22],B:[-12,22],H:[78,0]}),bb:o=>[-74,-26,80,26],
  draw(g,o){const cA=SR(g,-70,-20,10,40,'oil'),cB=SR(g,-60,-20,60,40,'oil'),cH=SR(g,0,-8,72,16,'oil');
    SR(g,-70,-20,70,40,'syb nofill');SL(g,-70,-20,-70,20,'sy thick');SR(g,0,-8,72,16,'syb nofill');SL(g,72,-8,72,8,'sy thick');
    const pis=SR(g,-66,-19,6,38,'syf2'),pl=SR(g,-60,-6,64,12,'syb');
    SL(g,-62,20,-62,22);SL(g,-12,20,-12,22);SL(g,72,0,78,0);ST(g,-35,-24,'A₁','st s');ST(g,40,-12,'A₂','st s');
    return cs=>{const x=clamp((cs&&cs.x)||0,0,1),xp=-66+x*58;pis.setAttribute('x',xp);pl.setAttribute('x',xp+6);
      cA.setAttribute('width',Math.max(xp+70+3,0));cB.setAttribute('x',xp+3);cB.setAttribute('width',Math.max(-xp-3,0));
      const hx=xp+70;cH.setAttribute('x',hx);cH.setAttribute('width',Math.max(72-hx,0));
      cA.style.fill=pCss(cs?cs.uA:0);cB.style.fill=pCss(cs?cs.uB:0);cH.style.fill=pCss(cs?cs.uH:0);};}};
B3.intens=(c,o)=>{const M=m3(),g=new THREE.Group();const z=18;
  g.add(at(cyl3(19,70,M.glass,'x'),-35,0,z));g.add(at(cyl3(7.5,72,M.glass,'x'),36,0,z));
  g.add(edges(at(box3(8,44,44,M.alu),-72,0,z)));g.add(edges(at(box3(8,44,44,M.alu),0,0,z)));g.add(edges(at(box3(8,22,22,M.alu),74,0,z)));
  const oA=at(cyl3(18,1,oilMat(),'x'),0,0,z),oB=at(cyl3(18,1,oilMat(),'x'),0,0,z),oH=at(cyl3(6.8,1,oilMat(),'x'),0,0,z);g.add(oA,oB,oH);
  const pis=at(cyl3(18.6,6,M.dark,'x'),0,0,z);g.add(pis);const pl=at(cyl3(6,64,M.steel,'x'),0,0,z);g.add(pl);
  g.add(at(cyl3(4,10,M.steel),-62,-23,z));g.add(at(cyl3(4,10,M.steel),-12,-23,z));g.add(at(cyl3(3.5,8,M.steel,'x'),80,0,z));
  return {g,upd(cs){const x=clamp((cs&&cs.x)||0,0,1),xp=-66+x*58+3;pis.position.x=xp;pl.position.x=xp+35;
    const la=Math.max(xp+68,.5),lb=Math.max(-xp-3,.5);oA.scale.x=la;oA.position.x=-68+la/2;oB.scale.x=lb;oB.position.x=-3-lb/2;
    const hx=xp+67,lh=Math.max(72-hx,.5);oH.scale.x=lh;oH.position.x=72-lh/2;setOil(oA.material,cs?cs.uA:0);setOil(oB.material,cs?cs.uB:0);setOil(oH.material,cs?cs.uH:0);}};};

/* ---------- 32b · pressure intensifier driving a press ram ---------- */
const C8_K=14000;                     // bulk modulus of oil [bar]
const C8_FS0=2000,C8_KS=20;           // ram return spring: preload [N], rate [N/mm]
function c8Hp(P,Vd,C){const A3=H.A(P.D3),xc=P.xc,xe=P.xc+P.dp;const Fsp=x=>C8_FS0+C8_KS*x;const pS=x=>Fsp(x)*10/A3,pP=x=>(Fsp(x)+P.Fp*1000)*10/A3;
  if(Vd<=C*pS(0))return {xr:0,p2:Vd/C,reg:Vd<0?'vac':'build'};
  const g1=x=>A3*x+C*pS(x);if(Vd<=g1(xc))return {xr:H.bisect(x=>g1(x)-Vd,0,xc,40),p2:0,reg:'app',f:pS};
  if(Vd<=A3*xc+C*pP(xc))return {xr:xc,p2:(Vd-A3*xc)/C,reg:'contact'};
  const g2=x=>A3*x+C*pP(x);if(Vd<=g2(xe))return {xr:H.bisect(x=>g2(x)-Vd,xc,xe,40),p2:0,reg:'press',f:pP};
  return {xr:xe,p2:(Vd-A3*xe)/C,reg:'stop'};}
function c8HpS(P,Vd,C){const s=c8Hp(P,Vd,C);if(s.f)s.p2=s.f(s.xr);return s;}
const C8_INT={id:'intens',n:32,t:'מגביר לחץ',d:'לחץ גבוה מספיקה קטנה: p₂ = p₁·A₁/A₂; ספיקת היציאה קטנה באותו יחס',
  P:{Q:10,pr:100,D1:100,D2:40,D3:63,Si:200,xc:30,dp:10,Fp:150,eta:.95,pos:'a',auto:true},
  key:()=>'i',
  ui(U,P){U.grp('משאבה ושסתום פריקה');U.num(P,'Q','ספיקת משאבה','L/min',{min:1,max:60,step:1});U.num(P,'pr','כיול שסתום פריקה p₁max','bar',{min:20,max:250,step:5});
    U.grp('מגביר');U.num(P,'D1','קוטר בוכנה גדולה D₁','mm',{min:40,max:250,step:5});U.num(P,'D2','קוטר בוכנה קטנה D₂','mm',{min:10,max:120,step:2});U.num(P,'Si','מהלך המגביר','mm',{min:50,max:500,step:10});
    U.grp('מכבש וחלק');U.num(P,'D3','קוטר בוכנת המכבש','mm',{min:25,max:200,step:1});U.num(P,'Fp','כוח לחיצת החלק','kN',{min:5,max:600,step:5});U.num(P,'xc','מרווח עד החלק','mm',{min:0,max:100,step:1});
    U.grp('הפעלה',false);U.seg(P,'pos','שסתום',KIT.pos3);U.chk(P,'auto','מחזור אוטומטי');},
  circuit(){return {comps:[{id:'P1',type:'pump',x:120,y:300,name:'משאבה קבועה + מנוע',lbl:'משאבה',lblAt:[32,6]},{id:'T1',type:'tank',x:120,y:345,name:'מיכל'},
      {id:'RV',type:'pv',x:60,y:250,rot:-90,o:{kind:'relief'},name:'שסתום פריקה – קובע את p₁ המקסימלי',lbl:'פריקה',lblAt:[0,-30]},{id:'T2',type:'tank',x:20,y:280,name:'מיכל'},
      {id:'V1',type:'dcv',x:200,y:180,o:{box:KIT.D43.tandem,L:'lever',center:true},name:'שסתום פיקוד 4/3 מרכז טנדם (המשאבה פורקת במרכז)',lbl:'4/3',lblAt:[82,4]},{id:'T3',type:'tank',x:262,y:240,name:'מיכל'},
      {id:'IN',type:'intens',x:262,y:90,name:'מגביר לחץ: בוכנה גדולה A₁ (לחץ נמוך) מחוברת לבוכנה קטנה A₂ (לחץ גבוה)',lbl:'מגביר לחץ',lblAt:[0,-34],l3:[-30,-40]},
      {id:'CK',type:'check',x:372,y:150,name:'אל-חוזר מילוי – משלים שמן לצד הלחץ הגבוה בחזרה',lbl:'מילוי',lblAt:[-22,4]},{id:'T4',type:'tank',x:372,y:190,name:'מיכל מילוי קטן'},
      {id:'RAM',type:'ram',x:450,y:150,o:{w:34},name:'בוכנת מכבש חד-פעולה עם קפיץ חזרה',lbl:'מכבש',lblAt:[40,-20],l3:[0,-150]},
      {id:'G1',type:'gauge',x:150,y:222,net:'P',name:'מד לחץ משאבה p₁',l3:[0,-30],valAt:[-16,-2]},{id:'G2',type:'gauge',x:352,y:58,net:'H',name:'מד לחץ גבוה p₂',l3:[0,-30],valAt:[-16,-2]},
      {id:'CH',type:'chart',x:592,y:150,o:{w:140,h:96,t:'לחץ לאורך זמן',xl:'t [s]',yl:'bar'},name:'גרף חי: p₁ (כחול) ו-p₂ (אדום)'}],
     lines:[{id:'LS',net:'S',pts:['T1.t','P1.in']},{id:'LP',net:'P',pts:['P1.out',[120,250],[193,250],'V1.P'],tag:{at:[160,272],t:'q'}},{id:'LRV',net:'P',pts:[[120,250],'RV.P']},{id:'LRT',net:'T',pts:['RV.T',[20,250],'T2.t']},
      {id:'LA',net:'A',pts:['V1.A',[193,138],[200,138],'IN.A']},{id:'LB',net:'B',pts:['V1.B',[207,144],[250,144],'IN.B']},{id:'LT',net:'T',pts:['V1.T',[207,215],[262,215],'T3.t']},
      {id:'LH',net:'H',pts:['IN.H',[400,90],[400,200],[450,200],'RAM.p'],tag:{at:[430,226],t:'q'}},{id:'LM',net:'M',pts:['T4.t','CK.in']},{id:'LM2',net:'H',pts:['CK.out',[372,90]]}]};},
  init:P=>({xi:0,Vadd:0,xr:0,p2:0,t:0,hist:[],si:KIT.idx[P.pos],mk:0}),
  click(id,P){if(id==='V1'){P.pos=P.pos==='a'?'0':P.pos==='0'?'b':'a';P.auto=false;return true;}},
  step(P,st,dt,ctx){const f=ctx.fault;const A1=H.A(P.D1),A2=H.A(Math.min(P.D2,P.D1-4)),A3=H.A(P.D3),Aa=A1-A2,xe=P.xc+P.dp;const dir=KIT.dirOf(P.pos);
    const pr=f==='relief'?P.pr*.55:P.pr,eta=P.eta;const Qp=P.Q;const V0=60e3;
    const Cof=xr=>(A2*(P.Si-st.xi)+A3*xr+V0)/C8_K*(f==='air'?8:1);let C=Cof(st.xr);
    const kL=f==='makeup'?2.5:f==='leakhp'?.0012:0;   // leak from the HP chamber [L/min/√bar]
    const solve=(xi,Vadd)=>c8HpS(P,A2*xi+Vadd,C);
    const leak=(xi)=>{if(!kL)return;const g=Vn=>Vn-st.Vadd+kL*Math.sqrt(Math.max(solve(xi,Vn).p2,0))*1e6/60*dt;const lo=st.Vadd-kL*Math.sqrt(Math.max(solve(xi,st.Vadd).p2,0))*1e6/60*dt;
      if(g(lo)<0)st.Vadd=H.bisect(g,lo,st.Vadd,40);else st.Vadd=lo;};
    let stall=false,end=false,p1=1,pB=.4,qi=0,qmk=0;const xi0=st.xi;
    if(dir>0){const vi=H.v(Qp,A1);let xt=Math.min(P.Si,st.xi+vi*dt);leak(xt);const p1of=x=>solve(x,st.Vadd).p2*A2/(A1*eta);
      if(p1of(xt)>pr){stall=true;xt=p1of(xi0)>=pr?xi0:H.bisect(x=>p1of(x)-pr,xi0,xt,40);}
      if(xt>=P.Si-1e-6&&!stall){end=true;stall=true;}st.xi=xt;p1=stall?pr:Math.max(p1of(xt),.3);qi=dt>0?(st.xi-xi0)/dt:(st.qi||0);}
    else if(dir<0){const vi=H.v(Qp,Aa);st.xi=Math.max(0,st.xi-vi*dt);qi=dt>0?(st.xi-xi0)/dt:(st.qi||0);leak(st.xi);if(st.xi<=0&&xi0<=0){stall=true;end=true;}}
    else leak(st.xi);
    let s=solve(st.xi,st.Vadd);if(s.p2<-.3){const need=-.3*C-(A2*st.xi+st.Vadd);st.Vadd+=need;qmk=dt>0?need/dt*60/1e6:0;s=solve(st.xi,st.Vadd);}st.mk=KIT.ease(st,'mkE',qmk>0?1:0,dt,10);
    st.xr=s.xr;st.p2=s.p2;st.qi=qi;C=Cof(st.xr);
    if(dir<0){pB=stall?pr:Math.max(.5,3+(-s.p2*A2)/Math.max(Aa,1));p1=pB;}if(dir===0)p1=.6;
    const pA=dir>0?p1:dir<0?.4:st.p2*A2/A1;const pBv=dir>0?.4:dir<0?pB:.3;
    KIT.autoCycle(P,st,dt,(stall&&dir!==0)||(dir>0&&s.reg==='stop'&&stall),1.2);KIT.ease(st,'si',KIT.idx[P.pos],dt);KIT.rpmAng(st,dt,1450);
    st.t+=dt;if(!st.ht||st.t-st.ht>.1){st.ht=st.t;st.hist.push([st.t,p1,st.p2]);if(st.hist.length>110)st.hist.shift();}
    const Fr=Math.max(st.p2,0)*A3/10,p2max=pr*A1/A2*eta,Fmax=p2max*A3/10;const pm=KIT.nice(Math.max(p2max,P.Fp*1000*10/A3)*1.05);
    const vr=dir?(qi*A2/A3):0;const Qh=H.Q(Math.abs(qi),A2)*Math.sign(qi);const ymax=KIT.nice(Math.max(p2max,pr)*1.1);const t0=st.hist.length?st.hist[0][0]:0;
    return {p:{P:p1,A:pA,B:pBv,T:.3,S:-.05,H:st.p2,M:qmk>0?-.3:0},q:{LS:Qp,LP:dir&&!stall?H.Q(Math.abs(qi),dir>0?A1:Aa):0,LRV:stall?Qp:0,LRT:stall?Qp:0,LA:dir>0?H.Q(qi,A1):dir<0?H.Q(qi,A1):0,LB:dir?-H.Q(qi,Aa):0,LT:dir?Math.abs(H.Q(qi,dir>0?Aa:A1)):0,
        LH:Qh*(s.reg==='app'||s.reg==='press'||dir<0?1:.05),LM:qmk,LM2:qmk},pmax:pm,qref:Math.max(Qp,1)*.5,vac:st.p2<0,
      A1,A2,A3,stall,end,reg:s.reg,p1,p2:st.p2,Fr,p2max,Fmax,dir,xi:st.xi,xr:st.xr,C,
      c:{P1:{on:true,ang:st.ang},RV:{open:stall?1:0},V1:{i:st.si},IN:{x:st.xi/P.Si,uA:pA/pm,uB:pBv/pm,uH:st.p2/pm},CK:{open:st.mk},
        RAM:{x:clamp(st.xr/(xe+6),0,1),u:st.p2/pm,lt:`${fmt(Fr/1000,1)} kN`},G1:{p:p1},G2:{p:st.p2},
        CH:{x:[t0,Math.max(t0+10,st.t)],y:[0,ymax],s:[{p:st.hist.map(h=>[h[0],h[1]]),c:'#2563eb'},{p:st.hist.map(h=>[h[0],h[2]]),c:'#dc2626'}]}},
      read:[{k:'לחץ משאבה p₁',v:p1,u:'bar'},{k:'לחץ גבוה p₂',v:st.p2,u:'bar'},{k:'יחס הגברה A₁/A₂',v:A1/A2,u:'',dg:2},{k:'כוח המכבש',v:Fr/1000,u:'kN',max:Fmax/1000},{k:'מהלך המכבש',v:st.xr,u:'mm',max:xe},{k:'מהלך המגביר שנוצל',v:st.xi/P.Si*100,u:'%',max:100,w:st.xi>=P.Si-1e-6}]};},
  ins(P,R){const L=[],r=R.A1/R.A2;
    L.push({ic:'✖️',h:`יחס השטחים <b>A₁/A₂ = ${fmt(r,2)}</b>: כל bar בצד הנמוך הופך ל-${fmt(r*P.eta,2)} bar בצד הגבוה (עם נצילות ${fmt(P.eta*100,0)}%).`,at:'IN'});
    if(R.dir>0&&R.reg==='app')L.push({ic:'➡️',h:`גישה: המכבש נע ב-<b>${fmt(H.v(P.Q,R.A1)*R.A2/R.A3,1)} mm/s</b> – רק ${fmt(R.A2/R.A1*100,0)}% מהספיקה "עוברת" לצד הגבוה. ההגברה עולה במהירות.`,at:'RAM'});
    if(R.dir>0&&(R.reg==='press'||R.reg==='contact'))L.push({ic:'🔨',h:`לחיצה: p₂ = ${fmt(R.p2,0)} bar, ובצד המשאבה רק p₁ = ${fmt(R.p1,0)} bar. אותו כוח על הציר: p₁·A₁·η = p₂·A₂.`,at:'G2'});
    if(R.end&&R.dir>0)L.push({ic:'⚠️',w:true,at:'IN',h:`המגביר הגיע לסוף המהלך לפני שהחלק נלחץ עד הסוף. צריך מהלך ארוך יותר או D₂ גדול יותר (נפח A₂·s).`,c:'נגמר המהלך של המגביר'});
    else if(R.stall&&R.dir>0)L.push({ic:'🛑',at:'RV',w:R.Fmax<P.Fp*1000,h:R.Fmax<P.Fp*1000?`p₁ הגיע לכיול (${fmt(P.pr,0)} bar) ו-p₂ נעצר ב-${fmt(R.p2max,0)} bar: כוח מקסימלי ${fmt(R.Fmax/1000,0)} kN – פחות מ-${fmt(P.Fp,0)} kN שהחלק דורש.`:`החלק נלחץ עד הסוף. p₂ עלה עד ${fmt(R.p2max,0)} bar – הלחץ המקסימלי שהמגביר יכול לתת (p₁max·A₁/A₂·η).`,c:R.Fmax<P.Fp*1000?'הכוח לא מספיק ללחיצת החלק':'הגענו ללחץ המקסימלי'});
    if(R.reg==='contact'&&R.dir>0)L.push({ic:'🧊',h:'במגע עם החלק הבוכנה כמעט עומדת והלחץ עולה בזכות דחיסת השמן: המגביר ממשיך לנוע מעט בלי שהמכבש זז.'});
    if(R.dir<0)L.push({ic:'⬅️',h:'חזרה: קפיץ המכבש מחזיר את השמן לתא הגבוה. אם חסר שמן – אל-חוזר המילוי משלים מהמיכל הקטן.',at:'CK'});
    if(R.dir===0)L.push({ic:'⏸',h:'מרכז טנדם: המשאבה פורקת למיכל בלחץ נמוך, והתא הגבוה נשאר נעול – כך מחזיקים לחץ בלי לחמם את השמן.'});return L;},
  calc(P,R){const A1=R.A1,A2=R.A2,A3=R.A3,F=P.Fp*1000+C8_FS0+C8_KS*(P.xc+P.dp);const p2n=F*10/A3,p1n=p2n*A2/(A1*P.eta);const Vh=A2*P.Si,Vn=A3*(P.xc+P.dp);
    return `<div class="kpis">${kpi('יחס הגברה',fmt(A1/A2,2))}${kpi('p₂ מקסימלי',fmt(R.p2max,0),'bar')}${kpi('כוח מקסימלי',fmt(R.Fmax/1000,1),'kN')}${kpi('p₁ דרוש ללחיצה',fmt(p1n,1),'bar',p1n<=P.pr?'מתחת לכיול ✓':'מעל הכיול ✗')}</div>`+
    det('שטחים',row('',`A₁ = π·${P.D1}²/4 = ${V(A1,'mm²')}`)+row('',`A₂ = π·${P.D2}²/4 = ${V(A2,'mm²')}`)+row('',`A₃ = π·${P.D3}²/4 = ${V(A3,'mm²')}`),true)+
    det('שיווי כוחות על הציר',row('',`p₁·A₁·η = p₂·A₂  ⇒  p₂ = p₁·${fr('A₁','A₂')}·η`)+row('בכיול',`p₂max = ${P.pr}·${fmt(A1/A2,3)}·${P.eta} = ${V(R.p2max,'bar')}`)+row('כוח מכבש מקסימלי',`F = p₂·A₃ = ${V(R.Fmax/1000,'kN')}`),true)+
    det('לחיצת החלק',row('כוח דרוש (חלק + קפיץ)',`F = ${fmt(F/1000,2)} kN ⇒ p₂ = F/A₃ = ${V(p2n,'bar')}`)+row('',`p₁ = p₂·A₂/(A₁·η) = ${V(p1n,'bar')}`,p1n<=P.pr))+
    det('נפח ומהירות',row('נפח התא הגבוה',`V = A₂·s = ${fmt(Vh/1000,1)} cm³`)+row('נפח שהמכבש צריך',`A₃·(מרווח + לחיצה) = ${fmt(Vn/1000,1)} cm³`,Vh>Vn)+row('מהירות המכבש',`v₃ = ${fr('Q','A₁')}·${fr('A₂','A₃')} = ${V(H.v(P.Q,A1)*A2/A3,'mm/s')}`))+
    det('דחיסות השמן',row('',`ΔV = V·Δp/K, K ≈ 14,000 bar ⇒ ב-${fmt(Math.max(R.p2,0),0)} bar נדחסים ${fmt(R.C*Math.max(R.p2,0)/1000,2)} cm³`))+
    `<div class="note">הספק נשמר: ההגברה בלחץ באה על חשבון ספיקה – Q₂ = Q₁·A₂/A₁. η מייצגת חיכוך באטמים.</div>`;},
  demo:[{t:'מה זה מגביר לחץ',x:'שתי בוכנות על ציר אחד: בוכנה <b>גדולה A₁</b> בצד המשאבה ובוכנה <b>קטנה A₂</b> בצד הלחץ הגבוה. הלחץ הגבוה מזין מכבש.',reset:true,set:{pos:'0',auto:false},hl:['IN']},
    {t:'שיווי כוחות',x:'הכוח על הציר זהה משני הצדדים: <b>p₁·A₁ = p₂·A₂</b>. כאן A₁/A₂ = 6.25, ולכן 80 bar מהמשאבה הופכים לכ-480 bar.',hl:['IN','G1','G2']},
    {t:'גישה מהירה יחסית',x:'מזיזים לידית a. המגביר נע, והשמן מהבוכנה הקטנה דוחף את המכבש לעבר החלק. כל עוד אין התנגדות – גם p₂ נמוך.',set:{pos:'a'},hl:['RAM','IN'],dur:6},
    {t:'מגע ולחיצה',x:'המכבש פוגש את החלק. p₂ עולה מהר, ו-p₁ עולה פי 6.25 לאט יותר. שימו לב לגרף: הקו האדום מעל הכחול.',hl:['G2','CH'],dur:7},
    {t:'הגבול: כיול שסתום הפריקה',x:'בסוף הלחיצה p₁ מגיע ל-100 bar ושסתום הפריקה נפתח. p₂ לא יכול לעבור את p₁max·A₁/A₂·η ≈ 594 bar.',hl:['RV','G2'],dur:6},
    {t:'המחיר: ספיקה קטנה',x:'הספק נשמר. הלחץ עלה פי 6.25 – והספיקה בצד הגבוה קטנה פי 6.25. לכן המכבש איטי והמגביר צריך מהלך ארוך.',hl:['IN','RAM']},
    {t:'חזרה ומילוי',x:'במצב b המגביר חוזר, הקפיץ מחזיר את המכבש, ואל-חוזר המילוי משלים שמן שאבד לצד הגבוה.',set:{pos:'b'},hl:['CK'],dur:7}],
  predict:[{q:'מחליפים את הבוכנה הקטנה ל-D₂ = 20 מ"מ (במקום 40). מה יקרה ל-p₂ המקסימלי?',set:{D2:20,pos:'a',auto:false},opts:['פי 2','פי 4','לא ישתנה','יירד בחצי'],a:1,dur:5,why:'p₂ = p₁·A₁/A₂ ושטח תלוי בריבוע הקוטר: A₂ קטן פי 4, ולכן p₂max גדל פי 4. אבל המכבש יתקדם לאט פי 4 וצריך מהלך ארוך פי 4.'},
    {q:'בזמן הגישה (לפני המגע), מה מהיר יותר – בוכנת המגביר או בוכנת המכבש?',set:{pos:'a',auto:false},opts:['המגביר','המכבש','אותה מהירות'],a:0,dur:3,why:'הספיקה מהבוכנה הקטנה היא v₁·A₂, והיא נכנסת לשטח A₃ = Ø63 שגדול מ-A₂. לכן v₃ = v₁·A₂/A₃ < v₁.'},
    {q:'מעלים את כוח הלחיצה ל-250 kN. מה יקרה?',set:{Fp:250,pos:'a',auto:false},opts:['החלק יילחץ לאט יותר','המכבש ייעצר במגע ושסתום הפריקה ייפתח','p₂ יעלה ללא הגבלה'],a:1,dur:7,why:'250 kN על A₃ דורשים כ-805 bar, אבל המגביר יכול לתת רק 594 bar (כוח 185 kN). p₁ מגיע לכיול ושסתום הפריקה נפתח.'},
    {q:'מקצרים את מהלך המגביר ל-80 מ"מ. מה יקרה בלחיצה?',set:{Si:80,pos:'a',auto:false},opts:['הכול יעבוד כרגיל','המגביר ייגמר לפני שהחלק נלחץ','הלחץ יעלה מהר יותר'],a:1,dur:8,why:'נפח הבוכנה הקטנה A₂·s = 1257·80 ≈ 100 cm³, והמכבש צריך A₃·40 ≈ 125 cm³. השמן נגמר לפני סוף הלחיצה.'}],
  tasks:[{q:P=>`p₁ = ${P.pr} bar, D₁ = ${P.D1} מ"מ, D₂ = ${P.D2} מ"מ, η = 1. מה p₂?`,a:P=>P.pr*(P.D1/P.D2)**2,u:'bar',hint:'p₂ = p₁·A₁/A₂ = p₁·(D₁/D₂)².',rand:P=>{P.pr=rnd(40,160,10);P.D1=pick([63,80,100,125]);P.D2=pick([20,25,32,40]);}},
    {q:P=>`צריך 500 bar מ-p₁ = ${P.pr} bar (η = 0.95). מה יחס השטחים A₁/A₂ המינימלי?`,a:P=>500/(P.pr*.95),u:'',hint:'A₁/A₂ = p₂/(p₁·η).',rand:P=>{P.pr=rnd(60,200,10);}},
    {q:P=>`ספיקת המשאבה ${P.Q} L/min, D₁ = ${P.D1}, D₂ = ${P.D2}. מה הספיקה בצד הגבוה?`,a:P=>P.Q*(P.D2/P.D1)**2,u:'L/min',hint:'Q₂ = Q₁·A₂/A₁ – הספק נשמר.',rand:P=>{P.Q=rnd(5,40,1);P.D1=pick([80,100,125]);P.D2=pick([25,32,40,50]);}},
    {q:P=>`p₂ = 480 bar על בוכנת מכבש Ø${P.D3}. מה כוח המכבש? (kN)`,a:P=>480*H.A(P.D3)/10/1000,u:'kN',hint:'F = p·A, ו-1 bar = 0.1 N/mm².',rand:P=>{P.D3=pick([40,50,63,80,100]);}}],
  faults:[{id:'makeup',t:'אל-חוזר המילוי תקוע פתוח',sym:'"המגביר זז עד הסוף, אבל המכבש לא יורד בכלל, ומד הלחץ הגבוה כמעט על אפס."',hint:'לאן הולך השמן שהבוכנה הקטנה דוחפת?',why:'השמן מהתא הגבוה בורח דרך אל-חוזר המילוי חזרה למיכל, ולכן אין לחץ שיניע את המכבש.'},
    {id:'leakhp',t:'אטם הבוכנה הקטנה דולף',sym:'"הלחיצה מגיעה ללחץ, אבל כשמחזיקים בידית במרכז הלחץ הגבוה יורד לאט, וכשמחזיקים ב-a המגביר זוחל קדימה."',hint:'העבירו למרכז אחרי הלחיצה וצפו במד p₂ ובגרף.',why:'שמן בלחץ גבוה דולף מעבר לאטם. במרכז p₂ יורד; ב-a המשאבה מפצה והמגביר ממשיך לזחול.'},
    {id:'air',t:'אוויר בצד הלחץ הגבוה',sym:'"הלחיצה ספוגית: המגביר עובר הרבה יותר מהלך מהצפוי ולפעמים נגמר לפני שהחלק נלחץ."',hint:'השוו את מהלך המגביר שנוצל לחישוב הנפח.',why:'אוויר דחיס הרבה יותר משמן. חלק מנפח הבוכנה הקטנה "הולך" לדחיסת האוויר במקום להזיז את המכבש. מנקזים אוויר מהנקודה הגבוהה.'},
    {id:'relief',t:'שסתום הפריקה מכויל נמוך',sym:'"המכבש מגיע לחלק ונעצר. מד המשאבה מראה רק 55 bar."',hint:'מה הלחץ המקסימלי ב-G1? ומה p₂ המקסימלי שמתקבל ממנו?',why:'p₂max = p₁max·A₁/A₂·η. עם 55 bar מתקבלים רק כ-327 bar – כוח של כ-102 kN, פחות מ-150 kN שהחלק דורש.'}],
  test(H){const P=clone(this.P);P.auto=false;const A1=H.A(100),A2=H.A(40),A3=H.A(63);const r1=runSim(this,P,2).R;const r2=runSim(this,P,30).R;
    const vexp=H.v(10,A1)*A2/A3;const P3=clone(this.P);P3.auto=false;P3.Fp=250;const r3=runSim(this,P3,30).R;
    return [['יחס A₁/A₂',A1/A2,6.25],['מהירות המכבש בגישה = v₁·A₂/A₃',r1.xr/(2-0.02),vexp,.03],['נפח: A₃·x₃ + C·p₂ = A₂·x₁',A3*r1.xr+r1.C*r1.p2,A2*r1.xi,.01],
      ['p₂max = p₁max·A₁/A₂·η (חלק נלחץ עד הסוף)',r2.p2,100*6.25*.95,.03],['p₁ בעצירה = כיול',r2.p1,100],['F = p₂·A₃',r2.Fr,r2.p2*A3/10],['250 kN: עצירה במגע, p₂ = p₂max',r3.p2,100*6.25*.95,.03],['UI p₂',r2.read[1].v,r2.p2]];}};

/* ---------- 33 · gas accumulator: charge, discharge, p–V curve ---------- */
const c8Pg=(P,Vo,p0)=>{const Vg=Math.max(P.V0-Vo,1e-6);return (p0+1)*(P.V0/Vg)**P.n-1;};                   // bar (gauge) from oil volume [L]
const c8Vo=(P,p,p0)=>p<=p0?0:P.V0*(1-((p0+1)/(p+1))**(1/P.n));                                       // oil volume [L] at gauge pressure p
const C8_ACC={id:'accum',n:33,t:'מצבר לחץ',d:'עקומת לחץ-נפח של מצבר לחץ גז; כמה שמן זמין בין לחץ מינימלי למקסימלי',
  P:{V0:4,p0:50,pr:150,pmin:80,n:1,Qp:8,A0:3,pump:true,open:false,auto:true},
  key:()=>'a',
  ui(U,P){U.grp('מצבר לחץ');U.num(P,'V0','נפח מצבר הלחץ V₀','L',{min:.5,max:50,step:.5});U.num(P,'p0','לחץ טעינת גז p₀','bar',{min:0,max:250,step:5});U.seg(P,'n','תהליך',[[1,'n=1','איזותרמי – טעינה ופריקה איטיות'],[1.4,'n=1.4','אדיאבטי – מהיר']]);
    U.grp('מעגל');U.num(P,'pr','לחץ מקסימלי (שסתום פריקה)','bar',{min:20,max:350,step:5});U.num(P,'pmin','לחץ עבודה מינימלי','bar',{min:5,max:300,step:5});U.num(P,'Qp','ספיקת משאבה','L/min',{min:1,max:60,step:1});U.num(P,'A0','פתח הצרכן (צמצם)','mm²',{min:.2,max:30,step:.2});
    U.grp('הפעלה',false);U.chk(P,'pump','משאבה פועלת');U.chk(P,'open','ברז לצרכן פתוח');U.chk(P,'auto','מחזור אוטומטי: טעינה ↔ פריקה');},
  circuit(){return {comps:[{id:'P1',type:'pump',x:100,y:290,name:'משאבה קבועה + מנוע',lbl:'משאבה',lblAt:[32,6]},{id:'T1',type:'tank',x:100,y:335,name:'מיכל'},
      {id:'RV',type:'pv',x:40,y:240,rot:-90,o:{kind:'relief'},name:'שסתום פריקה – לחץ הטעינה המקסימלי',lbl:'פריקה',lblAt:[0,-30]},{id:'T2',type:'tank',x:0,y:270,name:'מיכל'},
      {id:'CK',type:'check',x:100,y:190,name:'שסתום אל-חוזר – מונע ממצבר הלחץ להתרוקן דרך המשאבה',lbl:'אל-חוזר',lblAt:[-30,4]},
      {id:'AC',type:'accum',x:220,y:58,name:'מצבר לחץ גז (חנקן) – הגז נדחס כשהשמן נכנס',lbl:'מצבר',lblAt:[34,-6],l3:[0,-46]},{id:'G1',type:'gauge',x:172,y:92,net:'A',name:'מד לחץ המצבר',l3:[0,-30],valAt:[-16,-2]},
      {id:'SV',type:'sv',x:300,y:120,rot:90,name:'ברז לצרכן (לחיצה פותחת/סוגרת)',lbl:'ברז',lblAt:[0,-22]},{id:'TH',type:'throttle',x:362,y:120,rot:90,name:'צרכן – מיוצג ע"י צמצם',lbl:'צרכן',lblAt:[0,-24]},{id:'T3',type:'tank',x:420,y:215,name:'מיכל'},
      {id:'CH',type:'chart',x:545,y:150,o:{w:150,h:110,t:'עקומת לחץ-נפח של מצבר הלחץ',xl:'V שמן [L]',yl:'bar'},name:'p–V: העקומה, טווח העבודה והמצב הנוכחי'}],
     lines:[{id:'LS',net:'S',pts:['T1.t','P1.in']},{id:'LP',net:'P',pts:['P1.out','CK.in'],tag:{at:[140,232],t:'q'}},{id:'LRV',net:'P',pts:[[100,240],'RV.P']},{id:'LRT',net:'T',pts:['RV.T',[0,240],'T2.t']},
      {id:'L1',net:'A',pts:['CK.out',[100,120],[220,120]]},{id:'L2',net:'A',pts:[[220,120],'AC.p'],tag:{at:[250,100],t:'q'}},{id:'L3',net:'A',pts:[[220,120],'SV.in']},{id:'L4',net:'C',pts:['SV.out','TH.in']},
      {id:'L5',net:'T',pts:['TH.out',[420,120],'T3.t'],tag:{at:[450,150],t:'q'}}]};},
  init:P=>({Vo:0,ph:'charge',dw:0,t:0,cyc:null,last:null,Vstart:null}),
  click(id,P){if(id==='SV'){P.open=!P.open;P.auto=false;return true;}if(id==='P1'){P.pump=!P.pump;P.auto=false;return true;}},
  step(P,st,dt,ctx){const f=ctx.fault;const p0=f==='lowpre'?8:f==='highpre'?Math.min(P.pr-8,140):P.p0;const k=H.orK(P.A0);const ov=Math.max(1,.01*P.pr);
    if(P.auto){const p=st.Vo>0?c8Pg(P,st.Vo,p0):0;if(st.ph==='charge'){P.pump=true;P.open=false;if(p>=P.pr-.5){st.dw+=dt;if(st.dw>1){st.ph='dis';st.dw=0;st.Vstart=st.Vo;}}}
      else{P.pump=false;P.open=true;if(p<=P.pmin){st.last=Math.max(0,(st.Vstart??st.Vo)-st.Vo);st.ph='charge';}}}
    const pOf=Vo=>Vo>1e-9?c8Pg(P,Vo,p0):null;
    let p=pOf(st.Vo);const Qo=pp=>P.open?H.orQ(k,Math.max(pp,0)):0;const Qb=pp=>f==='checkleak'&&!P.pump?.04*Math.sqrt(Math.max(pp,0)):0;
    const Qi=pp=>P.pump?P.Qp-H.reliefQ(pp,P.pr,ov,P.Qp):0;
    if(p==null){ // accumulator empty: line pressure set by pump vs consumer
      const pl=P.pump?(P.open?Math.min(p0,(P.Qp/k)**2):p0):0;if(P.pump&&(!P.open||(P.Qp/k)**2>p0))st.Vo=1e-6;p=pl;}
    const q=Qi(p)-Qo(p)-Qb(p);st.Vo=clamp(st.Vo+q/60*dt,0,P.V0*.97);
    if(st.Vo>1e-9){p=c8Pg(P,st.Vo,p0);if(P.pump&&p>P.pr){const g=pp=>Qi(pp)-Qo(pp);const pe=g(P.pr+ov)>=0?P.pr+ov:H.bisect(g,P.pr,P.pr+ov,40);if(p>pe){st.Vo=c8Vo(P,pe,p0);p=pe;}}}
    else if(!P.pump)p=0;
    KIT.rpmAng(st,dt,P.pump?1450:0);st.t+=dt;
    const qin=Math.max(Qi(p),0),qout=Qo(p),qr=P.pump?H.reliefQ(p,P.pr,ov,P.Qp):0,qacc=qin-qout-Qb(p);const Vu=c8Vo(P,P.pr,p0)-c8Vo(P,P.pmin,p0);
    const ymax=KIT.nice(P.pr*1.15);const curve=(n,pp0)=>{const pts=[];for(let i=0;i<=40;i++){const pp=pp0+(ymax-pp0)*i/40;pts.push([P.V0*(1-((pp0+1)/(pp+1))**(1/n)),pp]);}return pts;};
    const PP={...P,n:P.n};const Vmin=c8Vo(PP,P.pmin,p0),Vmax=c8Vo(PP,P.pr,p0);
    return {p:{P:P.pump?(p>0?p:p0)+(P.pump?.3:0):.2,A:p,C:P.open?p*.5:0,T:.3,S:-.05},q:{LS:P.pump?P.Qp:0,LP:qin,LRV:qr,LRT:qr,L1:qin-Qb(p),L2:qacc,L3:qout,L4:qout,L5:qout},pmax:KIT.nice(P.pr*1.05),qref:Math.max(P.Qp,1),
      p,Vo:st.Vo,Vu,p0,qin,qout,qr,last:st.last,ph:st.ph,
      c:{P1:{on:P.pump,ang:st.ang},RV:{open:clamp(qr/P.Qp,0,1)},CK:{open:qin>.05?1:0},AC:{fill:st.Vo/P.V0,u:p/KIT.nice(P.pr*1.05)},SV:{closed:!P.open},TH:{knob:P.A0/10},G1:{p},
        CH:{x:[0,P.V0],y:[0,ymax],s:[{p:curve(P.n,p0),c:'#0b72d9'},{p:curve(P.n===1?1.4:1,p0),c:'#94a3b8',d:true},{p:[[Vmin,0],[Vmin,P.pmin],[0,P.pmin]],c:'#f59e0b',d:true},{p:[[Vmax,0],[Vmax,P.pr],[0,P.pr]],c:'#dc2626',d:true}],m:[st.Vo,p]}},
      read:[{k:'לחץ במצבר',v:p,u:'bar'},{k:'נפח שמן במצבר לחץ',v:st.Vo,u:'L',dg:2,max:P.V0},{k:'נפח גז',v:P.V0-st.Vo,u:'L',dg:2,max:P.V0},{k:'ספיקה נטו למצבר לחץ',v:qacc,u:'L/min'},{k:'נפח שימושי',v:Vu,u:'L',dg:2,max:P.V0},
        {k:'נמסר בפריקה',v:st.last??0,u:'L',dg:2,max:P.V0}]};},
  ins(P,R){const L=[];const ratio=R.Vu/P.V0;
    L.push({ic:'📦',h:`בין ${fmt(P.pmin,0)} ל-${fmt(P.pr,0)} bar מצבר הלחץ נותן <b>${fmt(R.Vu,2)} L</b> – רק ${fmt(ratio*100,0)}% מהנפח שלו. השאר תפוס בגז.`,at:'AC'});
    if(R.p0>=P.pmin)L.push({ic:'⚠️',w:true,at:'AC',h:`לחץ הטעינה (${fmt(R.p0,0)} bar) גבוה מהלחץ המינימלי – שמן נכנס רק מעל p₀ והנפח השימושי קטן. מקובל p₀ ≈ 0.9·p_min.`,c:'p₀ גבוה מדי – כמעט אין נפח שימושי'});
    else if(R.p0<.8*P.pmin)L.push({ic:'💡',h:`p₀ = ${fmt(R.p0,0)} bar נמוך מ-0.9·p_min = ${fmt(.9*P.pmin,0)} bar. אפשר להעלות אותו ולקבל יותר נפח שימושי, ולהגן על הממברנה.`});
    else L.push({ic:'✅',h:`p₀ ≈ ${fmt(R.p0/P.pmin,2)}·p_min – קרוב לכלל האצבע 0.9·p_min.`});
    if(R.p>0&&R.Vo>0)L.push({ic:'🎈',h:`חוק הגזים: (p+1)·V_gas^n קבוע. עכשיו V_gas = ${fmt(P.V0-R.Vo,2)} L ב-${fmt(R.p,0)} bar.`});
    if(P.n>1)L.push({ic:'🔥',h:'טעינה מהירה (n = 1.4): הגז מתחמם, הלחץ עולה מהר יותר ופחות שמן נכנס לאותו לחץ.'});
    if(!P.pump&&P.open)L.push({ic:'⬇️',h:`המשאבה כבויה – מצבר הלחץ לבדו מזין את הצרכן (${fmt(R.qout,1)} L/min). האל-חוזר מונע ממנו להתרוקן דרך המשאבה.`,at:'CK'});
    if(R.last!=null)L.push({ic:'📏',h:`בפריקה האחרונה נמסרו <b>${fmt(R.last,2)} L</b> עד ${fmt(P.pmin,0)} bar (החישוב: ${fmt(R.Vu,2)} L).`});return L;},
  calc(P,R){const p0=R.p0,a=p0+1,b=P.pmin+1,c=P.pr+1;const V1=P.V0*a/b,V2=P.V0*a/c;
    return `<div class="kpis">${kpi('נפח שימושי',fmt(R.Vu,2),'L')}${kpi('שמן בלחץ מקסימלי',fmt(c8Vo(P,P.pr,p0),2),'L')}${kpi('p₀ מומלץ',fmt(.9*P.pmin,0),'bar','0.9·p_min')}${kpi('לחץ עכשיו',fmt(R.p,1),'bar')}</div>`+
    det('חוק הגזים',row('לחצים מוחלטים (bar abs = bar + 1)',`(p₀+1)·V₀ⁿ = (p+1)·V_gasⁿ`)+row('נפח גז',`V_gas = V₀·(${fr('p₀+1','p+1')})^(1/n)`),true)+
    det('נפח שימושי',row('גז בלחץ מינימלי',`V₁ = ${P.V0}·(${fmt(a,0)}/${fmt(b,0)})^(1/${P.n}) = ${V(P.V0*(a/b)**(1/P.n),'L',3)}`)+row('גז בלחץ מקסימלי',`V₂ = ${P.V0}·(${fmt(a,0)}/${fmt(c,0)})^(1/${P.n}) = ${V(P.V0*(a/c)**(1/P.n),'L',3)}`)+row('',`ΔV = V₁ − V₂ = ${V(R.Vu,'L',3)}`),true)+
    det('בחירת מצבר לחץ (הפוך)',row('לקבלת ΔV = 1 L באיזותרמי',`V₀ = ${fr('ΔV','(p₀+1)/(p₁+1) − (p₀+1)/(p₂+1)')} = ${V(1/((a/b)-(a/c)),'L')}`))+
    det('זמן פריקה',row('',`Q = k·√p , k = 0.637·A₀ = ${V(H.orK(P.A0),'',3)} ; בלחץ ${fmt(P.pr,0)} bar Q = ${V(H.orQ(H.orK(P.A0),P.pr),'L/min')}`))+
    `<div class="note">החישוב בלחצים מוחלטים. n = 1 לתהליך איטי (הגז מספיק להתקרר), n = 1.4 לתהליך מהיר. אסור לטעון מצבר לחץ בחמצן או באוויר – רק בחנקן.</div>`;},
  demo:[{t:'מצבר לחץ גז',x:'בתוך מצבר הלחץ יש <b>גז חנקן</b> מופרד מהשמן (בממברנה או בוכנה). השמן שנכנס דוחס את הגז – כמו קפיץ שאוגר אנרגיה.',reset:true,set:{auto:false,pump:false,open:false},hl:['AC']},
    {t:'טעינה',x:'מפעילים את המשאבה. שמן נכנס דרך האל-חוזר, הגז נדחס והלחץ עולה לאורך העקומה בגרף.',set:{pump:true},hl:['P1','CK','CH'],dur:8},
    {t:'לחץ מקסימלי',x:'בלחץ שסתום הפריקה מצבר הלחץ מלא ככל האפשר. שימו לב: גם עכשיו רוב הנפח הוא עדיין גז.',hl:['RV','AC'],dur:5},
    {t:'מקור אנרגיה בלי משאבה',x:'מכבים את המשאבה ופותחים את הברז: מצבר הלחץ לבדו מזין את הצרכן. הלחץ יורד לאורך אותה עקומה.',set:{pump:false,open:true},hl:['SV','AC','CH'],dur:9},
    {t:'הנפח השימושי',x:'הצרכן צריך לפחות 80 bar. רק השמן שבין הקו הכתום (p_min) לאדום (p_max) שימושי – כ-1.2 L מתוך 4 L.',hl:['CH']},
    {t:'לחץ טעינת הגז',x:'מעלים את p₀ ל-75 bar (≈0.9·p_min): הנפח השימושי גדל. אבל p₀ מעל p_min – כמעט אין נפח.',set:{p0:72,pump:true,open:false},hl:['CH'],dur:8},
    {t:'מחזור אוטומטי',x:'המחזור טוען עד שסתום הפריקה ופורק עד p_min, ומודד כמה שמן נמסר בפועל.',set:{p0:50,auto:true},hl:['AC','CH'],dur:10}],
  predict:[{q:'מצבר לחץ 4 L ב-p₀ = 50 bar טעון עד 150 bar. כמה מנפחו מלא בשמן?',set:{auto:false,pump:true,open:false},opts:['כ-90%','כ-66%','כ-33%','100%'],a:1,dur:7,why:'V_gas = 4·51/151 = 1.35 L, ולכן שמן = 2.65 L ≈ 66%. הגז תמיד תופס חלק מהנפח.'},
    {q:'מורידים את p₀ ל-10 bar (p_min = 80). מה יקרה לנפח השימושי בין 80 ל-150 bar?',set:{p0:10,auto:true},opts:['יגדל','יקטן','לא ישתנה'],a:1,dur:3,why:'ΔV = V₀·(p₀+1)·(1/(p_min+1) − 1/(p_max+1)) – יחסי ל-(p₀+1). p₀ נמוך = פחות גז דחוס בטווח העבודה.'},
    {q:'מצבר הלחץ מלא, המשאבה כבויה והברז פתוח. מה יקרה ללחץ?',set:{auto:false,pump:false,open:true},act:(P,st)=>{st.Vo=c8Vo(P,150,50);},opts:['יישאר 150 bar','יירד בהדרגה לאורך העקומה','יירד מיד ל-0'],a:1,dur:6,why:'השמן יוצא, הגז מתפשט והלחץ יורד לפי (p+1)·Vⁿ = קבוע – בהדרגה, לא בבת אחת.'},
    {q:'טוענים מהר מאוד (n = 1.4) במקום לאט (n = 1). לאותו לחץ 150 bar – כמה שמן ייכנס?',set:{n:1.4,auto:false,pump:true,open:false},opts:['יותר','פחות','אותו דבר'],a:1,dur:7,why:'בדחיסה מהירה הגז מתחמם ולחצו עולה מהר יותר – לאותו לחץ נכנס פחות שמן.'}],
  tasks:[{q:P=>`מצבר לחץ ${P.V0} L, p₀ = ${P.p0} bar. מה נפח הגז ב-${P.pr} bar? (איזותרמי, לחצים מוחלטים)`,a:P=>P.V0*(P.p0+1)/(P.pr+1),u:'L',hint:'(p₀+1)·V₀ = (p+1)·V_gas.',rand:P=>{P.V0=pick([1,2.5,4,10,20]);P.p0=rnd(20,90,5);P.pr=rnd(120,250,10);P.n=1;}},
    {q:P=>`V₀ = ${P.V0} L, p₀ = ${P.p0}, p_min = ${P.pmin}, p_max = ${P.pr} bar, n = 1. מה הנפח השימושי?`,a:P=>P.V0*(P.p0+1)*(1/(P.pmin+1)-1/(P.pr+1)),u:'L',hint:'ΔV = V₀·(p₀+1)·[1/(p_min+1) − 1/(p_max+1)].',rand:P=>{P.n=1;P.V0=pick([2.5,4,10]);P.pmin=rnd(60,120,10);P.p0=Math.round(P.pmin*.9);P.pr=rnd(150,250,10);}},
    {q:P=>`p_min = ${P.pmin} bar. מה לחץ טעינת הגז המומלץ?`,a:P=>.9*P.pmin,u:'bar',tol:.06,hint:'כלל אצבע: p₀ ≈ 0.9·p_min.',rand:P=>{P.pmin=rnd(40,200,10);}},
    {q:P=>`צריך 1.5 L בין ${P.pmin} ל-${P.pr} bar, p₀ = ${P.p0} bar, n = 1. מה נפח מצבר הלחץ המינימלי?`,a:P=>1.5/((P.p0+1)*(1/(P.pmin+1)-1/(P.pr+1))),u:'L',hint:'V₀ = ΔV / [(p₀+1)·(1/(p_min+1) − 1/(p_max+1))].',rand:P=>{P.pmin=rnd(60,120,10);P.p0=Math.round(P.pmin*.9);P.pr=rnd(150,250,10);}}],
  faults:[{id:'lowpre',t:'לחץ הגז במצבר לחץ אבד (p₀ נמוך)',sym:'"מצבר הלחץ מתרוקן מהר מאוד; בטעינה הלחץ עולה כמעט מיד ומעט מאוד שמן נכנס בין 80 ל-150 bar."',hint:'מדדו את הנפח שנמסר בפריקה והשוו לחישוב לפי p₀ על השלט.',why:'הגז דלף והטעינה ירדה ל-8 bar. הנפח השימושי ∝ (p₀+1) – כמעט פי 6 פחות. בודקים p₀ עם ערכת טעינה כשמצבר הלחץ ריק משמן.'},
    {id:'highpre',t:'טעינת גז גבוהה מדי',sym:'"בטעינה הלחץ קופץ מיד לכ-140 bar, ובפריקה מצבר הלחץ מתרוקן כמעט בבת אחת."',hint:'מאיזה לחץ מתחיל שמן להיכנס? הסתכלו על הגרף.',why:'p₀ (140 bar) גבוה מ-p_min: שמן נכנס רק מעל 140 bar, ובפריקה הוא נגמר כבר ב-140 – הצרכן לא מקבל כמעט כלום.'},
    {id:'checkleak',t:'שסתום האל-חוזר דולף',sym:'"כשהמשאבה כבויה והברז סגור, הלחץ במצבר יורד לאט מעצמו."',hint:'כבו את המשאבה, סגרו את הברז וצפו במד.',why:'השמן חוזר ממצבר הלחץ דרך האל-חוזר והמשאבה למיכל. כשהמשאבה פועלת לא רואים את זה.',set:{auto:false,pump:false,open:false}}],
  test(H){const P=clone(this.P);P.auto=false;P.open=false;const {R}=runSim(this,P,60);const Vexp=4*(1-51/151);
    const P2=clone(this.P);P2.auto=true;const s=this.init(P2);let R2;for(let t=0;t<200&&!(s.last!=null);t+=.02)R2=this.step(P2,s,.02,{});const Vu=4*51*(1/81-1/151);
    const P3=clone(this.P);P3.n=1.4;const V14=4*(1-(51/151)**(1/1.4));
    return [['p בסוף טעינה ≈ כיול',R.p,150+Math.max(3,9)*0,.07],['נפח שמן ב-150 bar (בויל)',c8Vo(P,150,50),Vexp,.002],['בסימולציה',R.Vo,c8Vo(P,R.p,50),.002],['נפח שימושי 80→150 (נוסחה)',R2?R2.Vu:0,Vu,.002],
      ['נמסר בפריקה בסימולציה',s.last??0,Vu,.04],['n = 1.4 – פחות שמן',c8Vo(P3,150,50),V14,.002],['UI לחץ',R.read[0].v,R.p]];}};

LABS.push({ch:8,title:'אביזרים',sims:[C8_INT,C8_ACC]});
}
