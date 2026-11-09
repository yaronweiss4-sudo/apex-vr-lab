/* lab 5 – same code as the website */
{




/* ===================== Chapter 5 – power unit and pumps (sims 11–17) ===================== */
const CUTC={metal:"#d5dbe3",edge:"#475569",part:"#64748b",spring:"#334155"};

/* ---------- shared pump-bench model ----------
   Q_th = Vg·n/1000 [L/min] · leakage Q_L = cL·p·(46/ν) · load valve = orifice k (k from opening) · relief at pr
   η_v = Q/Q_th · η_hm = 1 − (T_friction + viscous)/T · input power P = 2π·n·T                                        */
const PB={
  solve(o){const leak=p=>Math.min(o.Qth,o.cL*Math.max(p,0));const rel=p=>H.reliefQ(p,o.pr,o.ov||Math.max(3,.06*o.pr),o.Qth);
    const f=p=>o.Qth-leak(p)-rel(p)-H.orQ(o.k,Math.max(p,0));const p=o.k>1e5?0:H.bisect(f,0,o.pr*1.3+5);const Qld=H.orQ(o.k,Math.max(p,0));
    return {p,Q:Math.min(Qld,o.Qth),QL:leak(p),Qr:rel(p)};},
  kOf:open=>open>=1?1e9:open<=0?0:H.orK(80*open**2),   // load valve: 0 = closed … 1 = fully open
  Tf:(Vg,n,wear=1)=>(.6+.0002*n)*wear*Math.max(Vg,1)/16};   // friction torque N·m
/* bench circuit: tank → pump → gauge/flowmeter → load valve → tank, relief to tank; o.extra adds components (a section view, a chart) */
function benchCircuit(o={}){return {comps:[{id:'P1',type:'pump',x:110,y:260,o:{var:!!o.var},name:o.pname||'משאבה',lbl:o.plbl||'משאבה',lblAt:[-46,30]},{id:'T1',type:'tank',x:110,y:300,name:'מיכל'},
    {id:'RV',type:'pv',x:60,y:190,rot:-90,o:{kind:'relief'},name:'שסתום פריקה',lbl:'פריקה',lblAt:[0,-30]},{id:'T2',type:'tank',x:20,y:202,name:'מיכל'},
    {id:'G1',type:'gauge',x:150,y:110,net:'P',name:'מד לחץ יציאת משאבה',valAt:[14,-6]},{id:'FM',type:'flowm',x:200,y:140,rot:90,name:'מד ספיקה',val:R=>`${fmt(R.r.Q,1)} L/min`,valAt:[-20,-20]},
    {id:'LV',type:'throttle',x:260,y:170,name:'שסתום עומס (צמצם מתכוונן)',lbl:'עומס',lblAt:[26,4]},{id:'T3',type:'tank',x:300,y:224,name:'מיכל'},...(o.extra||[])],
  lines:[{id:'LS',net:'S',pts:['T1.t','P1.in']},{id:'LP',net:'P',pts:['P1.out',[110,140],'FM.in']},{id:'LR',net:'P',pts:[[110,190],'RV.P']},{id:'LRT',net:'T',pts:['RV.T',[20,190],'T2.t']},
    {id:'LG',net:'P',pts:[[150,140],'G1.p'],nodot:true},{id:'LF',net:'P',pts:['FM.out',[260,140],'LV.out']},{id:'LT',net:'T',pts:['LV.in',[260,212],[300,212],'T3.t']},...(o.xlines||[])]};}
/* returns the readouts/state shared by every bench sim */
function benchStep(P,st,dt,o){const Qth=o.Vg*o.n/1000;const r=PB.solve({Qth,cL:o.cL,k:PB.kOf(P.load),pr:P.pr});const Th=o.Vg*Math.max(r.p,0)/(20*PI);const T=o.n>0?Th+PB.Tf(o.Vg,o.n,o.fw||1):0;const ehm=T>0?Th/T:0;const Pin=2*PI*o.n/60*T/1000;const Phyd=H.kW(r.p,r.Q+r.Qr);const ev=(r.Q+r.Qr)/Math.max(Qth,1e-9);
  st.ang=((st.ang||0)+o.n/60*2*PI*dt*.15)%(2*PI*1000);
  return Object.assign(r,{Qth,ehm,T,Pin,Phyd,ev,et:Pin>0?H.kW(r.p,r.Q)/Pin:0,ang:st.ang});}
const benchC=(P,r,pm)=>({P1:{on:true,ang:r.ang},RV:{open:clamp(r.Qr/Math.max(r.Qth,1e-6),0,1)},LV:{knob:P.load},FM:{u:r.Q/Math.max(r.Qth,1e-6)}});
const benchP=(r)=>({S:-.08,P:r.p,T:.5});
const benchQ=(r)=>({LS:r.Qth,LP:r.Q+r.Qr,LR:r.Qr,LRT:r.Qr,LF:r.Q,LT:r.Q});

/* ---------- section views of the pumps (SVG, driven by the same state) ---------- */
const gearPath=(R,z,ha,phase)=>{let d='';for(let i=0;i<z;i++){const a0=phase+i*2*PI/z,w=PI/z;const pts=[[R-ha,a0-w*.55],[R+ha,a0-w*.28],[R+ha,a0+w*.28],[R-ha,a0+w*.55],[R-ha,a0+w*1.45]];
  pts.forEach(([r,a],k)=>{d+=(i===0&&k===0?'M':'L')+(r*Math.cos(a)).toFixed(1)+','+(r*Math.sin(a)).toFixed(1);});}return d+'Z';};
SYM.gearx={ports:o=>({}),bb:o=>[-120,-95,120,95],draw(g){const R=34,z=10,ha=6,cx=R+1;
    sv('path',{d:`M-${cx+R+10},-48 A ${R+10} ${R+10} 0 1 0 -${cx+R+10},48 H ${cx+R+10} A ${R+10} ${R+10} 0 1 0 ${cx+R+10},-48 Z`,fill:'#e2e8f0',stroke:CUTC.edge,'stroke-width':1.4},g);
    const cin=sv('rect',{x:-22,y:30,width:44,height:60,fill:'#93c5fd'},g),cout=sv('rect',{x:-22,y:-90,width:44,height:60,fill:'#93c5fd'},g);
    const g1=sv('path',{fill:'#94a3b8',stroke:'#0f172a','stroke-width':1},g),g2=sv('path',{fill:'#cbd5e1',stroke:'#0f172a','stroke-width':1},g);
    sv('circle',{cx:-cx,cy:0,r:6,fill:'#334155'},g);sv('circle',{cx:cx,cy:0,r:6,fill:'#334155'},g);
    const pk=[...Array(14)].map(()=>sv('circle',{r:3.6,fill:'#1d4ed8',stroke:'#fff','stroke-width':1.2},g));const lk=[0,1].map(()=>sv('path',{fill:'none',stroke:'#dc2626','stroke-width':2,'stroke-dasharray':'3 2'},g));
    const t1=sv('text',{x:0,y:84,class:'st s'},g);t1.textContent='כניסה (יניקה)';const t2=sv('text',{x:0,y:-78,class:'st s'},g);t2.textContent='יציאה (לחץ)';
    return cs=>{if(!cs)return;const a=cs.ang||0;g1.setAttribute('d',gearPath(R,z,ha,a));g1.setAttribute('transform',`translate(${-cx},0)`);g2.setAttribute('d',gearPath(R,z,ha,-a+PI/z));g2.setAttribute('transform',`translate(${cx},0)`);
      cin.style.fill=pCss(cs.uIn);cout.style.fill=pCss(cs.uOut);
      // oil pockets travel around the outside of each gear from the inlet (bottom) to the outlet (top)
      pk.forEach((c,i)=>{const side=i<7?-1:1;const k=i%7;const ph=((a/(2*PI/z))%1+1)%1;const th=PI/2+side*(PI*(k+ph)/7);const ang=side<0?PI-th+PI:th;const r=R+ha*.2;
        const px=side*cx+r*Math.cos(side<0?PI/2+(k+ph)/7*PI:PI/2-(k+ph)/7*PI),py=r*Math.sin(side<0?PI/2+(k+ph)/7*PI:PI/2-(k+ph)/7*PI);c.setAttribute('cx',px.toFixed(1));c.setAttribute('cy',py.toFixed(1));c.style.display=cs.on?'':'none';});
      const L=clamp(cs.leak||0,0,1);lk.forEach((p,k)=>{const s=k?1:-1;p.setAttribute('d',L>.02?`M${s*(cx+R+4)},-40 Q${s*(cx+R+16)},0 ${s*(cx+R+4)},40`:'');p.style.strokeWidth=1+L*4;});};}};
SYM.vanex={ports:o=>({}),bb:o=>[-95,-95,95,95],draw(g,o){const N=8,Rr=30;const ring=sv('path',{fill:'#e2e8f0',stroke:CUTC.edge,'stroke-width':1.6},g);
    const kin=sv('path',{fill:'#93c5fd',opacity:.8},g),kout=sv('path',{fill:'#93c5fd',opacity:.8},g);const rot=sv('circle',{r:Rr,fill:'#94a3b8',stroke:'#0f172a','stroke-width':1.2},g);
    const vanes=[...Array(N)].map(()=>sv('line',{stroke:'#0f172a','stroke-width':4,'stroke-linecap':'round'},g));sv('circle',{r:7,fill:'#334155'},g);const arr=sv('path',{fill:'#dc2626'},g);
    const t1=sv('text',{x:-70,y:82,class:'st s'},g);t1.textContent='יניקה';const t2=sv('text',{x:70,y:82,class:'st s'},g);t2.textContent='לחץ';
    return cs=>{if(!cs)return;const bal=cs.bal,e=cs.e||0;const rf=th=>bal?46+5*Math.cos(2*th):null;
      const rAt=th=>{if(bal)return rf(th);const ux=Math.cos(th),uy=Math.sin(th);const cx=e,cy=0;const b=ux*cx+uy*cy;return b+Math.sqrt(b*b-(cx*cx+cy*cy)+46*46);};
      let d='';for(let i=0;i<=72;i++){const th=i/72*2*PI;const r=rAt(th);d+=(i?'L':'M')+(r*Math.cos(th)).toFixed(1)+','+(r*Math.sin(th)).toFixed(1);}ring.setAttribute('d',d+'Z');
      const arc=(a0,a1)=>{let s='';for(let i=0;i<=20;i++){const th=a0+(a1-a0)*i/20;const r=rAt(th)-3;s+=(i?'L':'M')+(r*Math.cos(th)).toFixed(1)+','+(r*Math.sin(th)).toFixed(1);}for(let i=20;i>=0;i--){const th=a0+(a1-a0)*i/20;s+='L'+((Rr+2)*Math.cos(th)).toFixed(1)+','+((Rr+2)*Math.sin(th)).toFixed(1);}return s+'Z';};
      kin.setAttribute('d',bal?arc(PI*.1,PI*.4)+arc(PI*1.1,PI*1.4):arc(PI*.15,PI*.85));kout.setAttribute('d',bal?arc(PI*.6,PI*.9)+arc(PI*1.6,PI*1.9):arc(PI*1.15,PI*1.85));kin.style.fill=pCss(cs.uIn);kout.style.fill=pCss(cs.uOut);
      vanes.forEach((v,i)=>{const th=(cs.ang||0)+i*2*PI/N;const r=rAt(th);v.setAttribute('x1',(Rr-12)*Math.cos(th));v.setAttribute('y1',(Rr-12)*Math.sin(th));v.setAttribute('x2',(r-1)*Math.cos(th));v.setAttribute('y2',(r-1)*Math.sin(th));});
      const F=clamp(cs.F||0,0,1)*40;arr.setAttribute('d',F<2?'':`M0,0 L${-4},${-F+8} L-9,${-F+8} L0,${-F} L9,${-F+8} L4,${-F+8} Z`);};}};
SYM.axialx={ports:o=>({}),bb:o=>[-140,-80,140,80],draw(g){const z=9;sv('rect',{x:-140,y:-75,width:280,height:150,rx:8,fill:'#eef2f7',stroke:CUTC.edge,'stroke-width':1.2},g);
    const sw=sv('rect',{x:-110,y:-64,width:14,height:128,fill:'#64748b',stroke:'#0f172a'},g);sv('rect',{x:-60,y:-58,width:150,height:116,fill:'#cbd5e1',stroke:'#0f172a','stroke-width':1.2},g);
    sv('rect',{x:-135,y:-4,width:260,height:8,fill:'#94a3b8',stroke:'#0f172a','stroke-width':.8},g);sv('rect',{x:90,y:-58,width:10,height:116,fill:'#475569'},g);
    const kin=sv('rect',{x:100,y:4,width:18,height:52,fill:'#93c5fd'},g),kout=sv('rect',{x:100,y:-56,width:18,height:52,fill:'#93c5fd'},g);
    const pis=[...Array(z)].map(()=>({b:sv('rect',{height:12,fill:'#93c5fd',stroke:'#0f172a','stroke-width':.6},g),p:sv('rect',{height:12,width:54,fill:'#475569',stroke:'#0f172a','stroke-width':.8},g)}));
    const t=sv('text',{x:-103,y:-68,class:'st s'},g);t.textContent='דיסקה נטויה';const t2=sv('text',{x:110,y:68,class:'st s'},g);t2.textContent='יניקה';const t3=sv('text',{x:110,y:-62,class:'st s'},g);t3.textContent='לחץ';
    return cs=>{if(!cs)return;const al=(cs.alpha||0)*PI/180;sw.setAttribute('transform',`rotate(${-(cs.alpha||0)} -103 0)`);kin.style.fill=pCss(cs.uIn);kout.style.fill=pCss(cs.uOut);
      const order=pis.map((q,i)=>{const ph=(cs.ang||0)+i*2*PI/z;return {q,ph,front:Math.cos(ph)};}).sort((a,b)=>a.front-b.front);
      order.forEach(({q,ph})=>{const y=46*Math.sin(ph);const xh=-96-y*Math.tan(al);q.p.setAttribute('x',xh.toFixed(1));q.p.setAttribute('y',(y-6).toFixed(1));
        q.b.setAttribute('x',(xh+54).toFixed(1));q.b.setAttribute('width',Math.max(90-(xh+54),2).toFixed(1));q.b.setAttribute('y',(y-6).toFixed(1));const fr=Math.cos(ph)>0;q.p.style.opacity=fr?1:.4;q.b.style.opacity=fr?1:.4;
        q.b.style.fill=pCss(y<0?cs.uOut:cs.uIn);});};}};
B3.gearx=B3.vanex=B3.axialx=()=>({g:new THREE.Group()});

/* ---------- 12 · gear pump ---------- */
const SIM_GEAR={id:'gear',n:12,t:'גלגלי שיניים',d:'תאי שמן שנעים סביב; ספיקה = נפח סגולי × סל"ד; דליפה פנימית עם שחיקה',
  P:{Vg:16,n:1450,clr:1,load:.4,pr:180,nu:46},
  ui(U,P){U.grp('משאבה');U.num(P,'Vg','נפח סגולי','cm³/rev',{min:1,max:100,step:1});U.num(P,'n','מהירות סיבוב','rpm',{min:0,max:3000,step:50});U.num(P,'clr','מרווח שיניים-בית (×חדש)','×',{min:1,max:4,step:.1});
    U.grp('עומס');U.num(P,'load','פתיחת שסתום העומס','0–1',{min:0,max:1,step:.02});U.num(P,'pr','כיול שסתום פריקה','bar',{min:20,max:300,step:5});U.num(P,'nu','צמיגות השמן','cSt',{min:10,max:200,step:1});},
  circuit:P=>benchCircuit({extra:[{id:'X',type:'gearx',x:430,y:170,name:'חתך משאבת גלגלי שיניים: השמן נישא בין השיניים לבית',lbl:'חתך',lblAt:[0,-104]}]}),
  init:()=>({ang:0}),
  step(P,st,dt,ctx){const f=ctx.fault;const clr=P.clr*(f==='wear'?2.6:1);const cL=.03*P.Vg*1.45/100*clr**3*46/P.nu;const n=f==='slip'?P.n*.7:P.n;
    const r=benchStep(P,st,dt,{Vg:P.Vg,n,cL,fw:clr>2?1.4:1});const pm=KIT.nice(P.pr*1.05);const pIn=f==='suction'?-.55:-.05-r.Qth*.002;
    return {p:Object.assign(benchP(r),{S:pIn}),q:benchQ(r),pmax:pm,qref:Math.max(r.Qth,1),vac:pIn<-.3,r,clr,pIn,
      c:Object.assign(benchC(P,r,pm),{X:{ang:r.ang,uIn:pIn/pm,uOut:r.p/pm,leak:r.QL/Math.max(r.Qth,1)*4,on:n>0}}),
      read:[{k:'ספיקה תאורטית V·n',v:r.Qth,u:'L/min'},{k:'ספיקה בפועל',v:r.Q+r.Qr,u:'L/min',max:r.Qth},{k:'דליפה פנימית',v:r.QL,u:'L/min',max:r.Qth*.3,w:r.QL>r.Qth*.15},{k:'לחץ יציאה',v:r.p,u:'bar'},{k:'נצילות נפחית',v:r.ev*100,u:'%',max:100},{k:'הספק כניסה',v:r.Pin,u:'kW'},{k:'לחץ יניקה',v:pIn,u:'bar',w:pIn<-.3}]};},
  ins(P,R){const r=R.r,L=[];L.push({ic:'⚙️',at:'X',h:`כל סיבוב מעביר <b>${fmt(P.Vg,0)} cm³</b> בין השיניים לבית: Q = V·n = ${fmt(P.Vg,0)}·${fmt(P.n,0)}/1000 = <b>${fmt(r.Qth,1)} L/min</b>.`});
    L.push({ic:'🎯',at:'G1',h:`המשאבה לא "יוצרת לחץ": היא דוחפת ספיקה, והלחץ (${fmt(r.p,0)} bar) נוצר מההתנגדות של שסתום העומס.`});
    if(r.QL>r.Qth*.08)L.push({ic:'💧',w:r.QL>r.Qth*.15,at:'X',h:`דליפה פנימית ${fmt(r.QL,1)} L/min חוזרת מהיציאה לכניסה דרך המרווחים – גדלה עם הלחץ, המרווח (∝ מרווח³) וירידת הצמיגות.`,c:'דליפה פנימית גדולה'});
    if(r.Qr>.1)L.push({ic:'🔥',at:'RV',h:'הלחץ הגיע לכיול – שסתום הפריקה פותח והספיקה העודפת הופכת לחום.'});
    if(R.pIn<-.3)L.push({ic:'🫧',w:true,at:'P1',h:'תת-לחץ גבוה ביניקה – סכנת קוויטציה.'});return L;},
  calc(P,R){const r=R.r;return `<div class="kpis">${kpi('Q תאורטי',fmt(r.Qth,1),'L/min')}${kpi('נצילות נפחית',fmt(r.ev*100,1),'%')}${kpi('מומנט',fmt(r.T,1),'N·m')}${kpi('הספק כניסה',fmt(r.Pin,2),'kW')}</div>`+
    det('ספיקה',row('תאורטית',`Q = V·n = ${P.Vg}·${P.n}/1000 = ${V(r.Qth,'L/min')}`)+row('דליפה',`Q_L = ${V(r.QL,'L/min')} (∝ p·מרווח³/ν)`)+row('בפועל',`Q = Q_th − Q_L = ${V(r.Q+r.Qr,'L/min')} → η_v = ${V(r.ev*100,'%')}`),true)+
    det('מומנט והספק',row('',`T = ${fr('V·p','20π·η_hm')} = ${fr(P.Vg+'·'+fmt(r.p,0),'20π·'+fmt(r.ehm,2))} = ${V(r.T,'N·m')}`)+row('',`P = 2π·n·T/60 = ${V(r.Pin,'kW')}`)+row('הידראולי',`P = p·Q/600 = ${V(r.Phyd,'kW')}`));},
  demo:[{t:'שני גלגלים בתוך בית',x:'גלגל מניע וגלגל מונע מסתובבים בכיוונים הפוכים. השמן נכנס מלמטה, <b>נישא בין השיניים לבית</b> ויוצא למעלה.',reset:true,hl:['X']},
    {t:'ספיקה = נפח סגולי × סל"ד',x:'מכפילים את המהירות ל-2900 rpm – הספיקה מוכפלת. הלחץ תלוי רק בעומס.',set:{n:2900},hl:['FM']},
    {t:'סוגרים את העומס',x:'שסתום העומס נסגר: הלחץ עולה, והדליפה הפנימית גדלה (אדום מקווקו בחתך).',set:{n:1450,load:.12},hl:['LV','X'],dur:9},
    {t:'משאבה שחוקה',x:'מרווח פי 2.5 מהחדש: הדליפה גדלה בערך פי 15 (∝ מרווח³) – הנצילות הנפחית צונחת.',set:{clr:2.5},hl:['X'],dur:9}],
  predict:[{q:'מכפילים את הסל"ד, העומס לא משתנה. מה יקרה לספיקה?',set:{n:2900},opts:['תוכפל','לא תשתנה','תקטן'],a:0,why:'Q = V·n: נפח קבוע לכל סיבוב.'},
    {q:'סוגרים את שסתום העומס חלקית. מה יקרה לספיקה בפועל?',set:{load:.1},opts:['תגדל','תקטן מעט – בגלל דליפה פנימית','תרד לאפס'],a:1,why:'המשאבה ממשיכה לדחוף, אבל בלחץ גבוה יותר יותר שמן דולף חזרה דרך המרווחים.'},
    {q:'המרווח בין השיניים לבית גדל פי 2. הדליפה תגדל בערך –',set:{clr:2},opts:['פי 2','פי 4','פי 8'],a:2,why:'זרימה למינרית במרווח צר ∝ h³.'}],
  tasks:[{q:P=>`משאבה ${P.Vg} cm³/rev ב-${P.n} rpm. מה הספיקה התאורטית?`,a:P=>P.Vg*P.n/1000,u:'L/min',hint:'Q = V·n/1000.',rand:P=>{P.Vg=pick([4,8,11,16,22,32]);P.n=pick([1000,1450,1800,2900]);}},
    {q:P=>`Q_th = ${fmt(P.Vg*P.n/1000,1)} L/min, נמדד ${fmt(P.Vg*P.n/1000*.88,1)} L/min. מה הנצילות הנפחית?`,a:()=>88,u:'%',hint:'η_v = Q/Q_th.'},
    {q:P=>`${P.Vg} cm³/rev, לחץ 150 bar, η_hm = 0.9. מה המומנט בציר?`,a:P=>P.Vg*150/(20*PI)/.9,u:'N·m',hint:'T = V·p/(20π·η_hm).',rand:P=>{P.Vg=pick([8,16,25,32]);}}],
  faults:[{id:'wear',t:'משאבה שחוקה – מרווחים גדולים',sym:'"בלחץ נמוך הכול בסדר, אבל בעומס המכונה מאטה מאוד."',hint:'השוו את הספיקה בפועל לתאורטית בלחץ נמוך ובגבוה.',why:'מרווחים גדולים: דליפה ∝ p·h³ – בלחץ גבוה הנצילות נופלת.',set:{load:.15}},
    {id:'slip',t:'מצמד מחליק – המשאבה מסתובבת לאט',sym:'"הספיקה נמוכה גם בלי עומס."',hint:'האם הבעיה תלויה בלחץ?',why:'המשאבה מסתובבת ב-70% מהמהירות: הספיקה נמוכה בכל לחץ, ולא בגלל דליפה.',set:{load:1}},
    {id:'suction',t:'צינור יניקה חסום',sym:'"רעש של חצץ מהמשאבה, ובועות במיכל."',hint:'הסתכלו על לחץ היניקה.',why:'תת-לחץ ביניקה – קוויטציה.'}],
  test(H){const P=clone(this.P);const R=this.step(P,{},0,{});const r=R.r;return [['Q = V·n',r.Qth,23.2],['רציפות',r.Q+r.QL+r.Qr,r.Qth,.002],['Δp עומס = (Q/k)²',r.p,(r.Q/PB.kOf(P.load))**2,.01],['T = Vp/20πη',r.T,P.Vg*r.p/(20*PI)/r.ehm],['UI ספיקה',R.read[1].v,r.Q+r.Qr]];}};

/* ---------- 13 · vane pump ---------- */
const SIM_VANE={id:'vane',n:13,t:'כנפיות',d:'נפח התאים משתנה עם האקסצנטריות; למה משאבה מאוזנת חוסכת עומס על המסבים',
  P:{bal:false,e:6,n:1450,W:20,load:.3,pr:160},
  key:P=>'0',
  ui(U,P){U.grp('משאבה');U.seg(P,'bal','סוג',[[false,'לא מאוזנת'],[true,'מאוזנת']],true);if(!P.bal)U.num(P,'e','אקסצנטריות e','mm',{min:0,max:10,step:.5});U.num(P,'W','רוחב הרוטור','mm',{min:5,max:60,step:1});U.num(P,'n','מהירות','rpm',{min:0,max:3000,step:50});
    U.grp('עומס');U.num(P,'load','פתיחת שסתום העומס','0–1',{min:0,max:1,step:.02});U.num(P,'pr','כיול שסתום פריקה','bar',{min:20,max:250,step:5});},
  circuit:P=>benchCircuit({var:!P.bal,extra:[{id:'X',type:'vanex',x:420,y:170,name:'חתך משאבת כנפיות: הכנפיות נלחצות לטבעת והתאים גדלים וקטנים',lbl:'חתך',lblAt:[0,-104]}]}),
  init:()=>({ang:0}),
  vg(P,f){const D=92;const e=P.bal?6:(f==='ring'?P.e*.5:P.e);return (P.bal?2:1)*2*PI*D/2*2*e*P.W/1000*(P.bal?.5:1)*.5;},   // cm³/rev ≈ 2π·R·2e·W (bal: two lobes with lift 6)
  step(P,st,dt,ctx){const f=ctx.fault;const Vg=this.vg(P,f);const cL=(f==='vanes'?.12:.035)*Math.max(Vg,1)*1.45/100;const r=benchStep(P,st,dt,{Vg,n:P.n,cL});const pm=KIT.nice(P.pr*1.05);
    const Frad=P.bal?0:r.p*.1*(92*P.W)*.6;const Fn=Frad/1000;
    return {p:benchP(r),q:benchQ(r),pmax:pm,qref:Math.max(r.Qth,1),r,Vg,Fn,
      c:Object.assign(benchC(P,r,pm),{X:{ang:r.ang,bal:P.bal,e:P.bal?0:(f==='ring'?P.e*.5:P.e)*2.2,uIn:-.04,uOut:r.p/pm,F:P.bal?0:clamp(Fn/20,0,1)}}),
      read:[{k:'נפח סגולי',v:Vg,u:'cm³/rev'},{k:'ספיקה בפועל',v:r.Q+r.Qr,u:'L/min',max:Math.max(r.Qth,1)},{k:'לחץ',v:r.p,u:'bar'},{k:'עומס רדיאלי על המסב',v:Fn,u:'kN',w:Fn>15},{k:'נצילות נפחית',v:r.ev*100,u:'%',max:100}]};},
  ins(P,R){const L=[];L.push(P.bal?{ic:'⚖️',at:'X',h:'משאבה מאוזנת: טבעת אליפטית ושני אזורי יניקה ולחץ מנוגדים – הכוחות הרדיאליים מתבטלים והמסבים כמעט לא עמוסים. אבל הנפח קבוע.'}:
      {ic:'↔️',at:'X',h:`הרוטור מוזז e = ${fmt(P.e,1)} מ"מ ממרכז הטבעת: כל תא גדל בצד היניקה וקטן בצד הלחץ. e = 0 → אין ספיקה; e גדול → יותר ספיקה (נפח ${fmt(R.Vg,1)} cm³/rev).`});
    if(!P.bal)L.push({ic:'🧲',w:R.Fn>15,at:'X',h:`הלחץ פועל רק על חצי מהרוטור – כוח רדיאלי של כ-${fmt(R.Fn,1)} kN על המסב (החץ האדום).`,c:`עומס מסב ${fmt(R.Fn,1)} kN`});
    L.push({ic:'💡',h:'הכנפיות נלחצות לטבעת בכוח צנטריפוגלי ובלחץ שמוזן מתחתיהן – לכן משאבות כנפיות צריכות מהירות מינימלית.'});return L;},
  calc(P,R){return `<div class="kpis">${kpi('נפח סגולי',fmt(R.Vg,2),'cm³/rev')}${kpi('Q',fmt(R.r.Q+R.r.Qr,1),'L/min')}${kpi('עומס רדיאלי',fmt(R.Fn,2),'kN')}${kpi('η_v',fmt(R.r.ev*100,1),'%')}</div>`+
    det('נפח סגולי (קירוב)',row('לא מאוזנת',`V ≈ 2π·R·2e·W/2 = ${V(this.vg({...P,bal:false},null),'cm³/rev')}`)+row('מאוזנת',`שני מחזורים בכל סיבוב, הרמה קבועה`),true)+det('עומס רדיאלי',row('',`F ≈ p·(D·W)·0.6 = ${V(R.Fn,'kN')}`));},
  demo:[{t:'רוטור, כנפיות וטבעת',x:'הרוטור מסתובב בתוך טבעת. הכנפיות מחליקות החוצה ונוגעות בטבעת, ויוצרות תאים סגורים.',reset:true,hl:['X']},
    {t:'אקסצנטריות',x:'כשהרוטור מוזז מהמרכז, התאים גדלים בצד היניקה (שמאל) וקטנים בצד הלחץ (ימין) – זו השאיבה.',set:{e:9},hl:['X']},
    {t:'e = 0',x:'ממרכזים את הרוטור: התאים לא משנים נפח – אין ספיקה. על העיקרון הזה בנויה משאבת כנפיות משתנה.',set:{e:0},hl:['X','FM']},
    {t:'עומס על המסב',x:'בלחץ גבוה הלחץ דוחף את הרוטור לצד אחד – עומס רדיאלי גדול.',set:{e:8,load:.08},hl:['X'],dur:8},
    {t:'משאבה מאוזנת',x:'בטבעת אליפטית יש שני אזורי לחץ מנוגדים – הכוחות מתבטלים.',set:{bal:true},hl:['X'],dur:8}],
  predict:[{q:'מקטינים את האקסצנטריות לאפס. מה תהיה הספיקה?',set:{e:0},opts:['מקסימלית','אפס','חצי'],a:1,why:'ללא אקסצנטריות נפח התאים לא משתנה.'},
    {q:'במשאבה לא מאוזנת מכפילים את הלחץ. העומס על המסב –',set:{load:.1},opts:['לא משתנה','מוכפל בערך','קטן'],a:1,why:'הכוח הרדיאלי ∝ p.'}],
  tasks:[{q:P=>`נפח סגולי ${fmt(SIM_VANE.vg(P),1)} cm³/rev ב-${P.n} rpm. ספיקה תאורטית?`,a:P=>SIM_VANE.vg(P)*P.n/1000,u:'L/min',hint:'Q = V·n/1000.',rand:P=>{P.e=rnd(2,10,1);P.n=pick([1000,1450,1800]);}},
    {q:P=>`רוטור Ø92, רוחב ${P.W} מ"מ, לחץ 100 bar, מקדם 0.6. מה העומס הרדיאלי (kN)?`,a:P=>100*.1*92*P.W*.6/1000,u:'kN',hint:'F ≈ p·D·W·0.6 (1 bar = 0.1 N/mm²).',rand:P=>{P.W=rnd(10,40,5);}}],
  faults:[{id:'vanes',t:'כנפיות שחוקות',sym:'"הספיקה יורדת ככל שהלחץ עולה, יותר ממה שהיה פעם."',hint:'השוו נצילות נפחית בלחץ נמוך וגבוה.',why:'כנפיות שחוקות לא אוטמות – הדליפה הפנימית גדלה מאוד.',set:{load:.15}},
    {id:'ring',t:'טבעת הכיוון זזה – אקסצנטריות קטנה',sym:'"הספיקה רק חצי ממה שמסומן, גם בלי עומס."',hint:'האם הבעיה תלויה בלחץ?',why:'האקסצנטריות בפועל חצי מהכיוון – הנפח הגיאומטרי חצי.',set:{load:1}}],
  test(H){const P=clone(this.P);const R=this.step(P,{},0,{});return [['Q = V·n',R.r.Qth,this.vg(P)*P.n/1000],['F ∝ p',R.Fn,R.r.p*.1*92*P.W*.6/1000],['UI לחץ',R.read[2].v,R.r.p]];}};

/* ---------- 14 · axial piston pump ---------- */
const SIM_AXIAL={id:'axial',n:14,t:'בוכנות צירית',d:'מהלך הבוכנות והספיקה משתנים עם זווית הדיסקה; פולסציה לפי מספר הבוכנות',
  P:{alpha:15,z:9,d:16,Dp:60,n:1500,load:.35,pr:250},
  ui(U,P){U.grp('משאבה');U.num(P,'alpha','זווית דיסקה α','°',{min:0,max:20,step:.5});U.num(P,'z','מספר בוכנות','',{min:3,max:11,step:1,int:true});U.num(P,'d','קוטר בוכנה','mm',{min:6,max:30,step:1});U.num(P,'Dp','קוטר מעגל הבוכנות','mm',{min:30,max:150,step:5});U.num(P,'n','מהירות','rpm',{min:0,max:3000,step:50});
    U.grp('עומס',false);U.num(P,'load','פתיחת שסתום העומס','0–1',{min:0,max:1,step:.02});U.num(P,'pr','כיול שסתום פריקה','bar',{min:20,max:350,step:5});},
  circuit:P=>benchCircuit({var:true,extra:[{id:'X',type:'axialx',x:440,y:150,name:'חתך משאבת בוכנות צירית: הבוכנות מסתובבות עם הבלוק ונעות על פלטת הסחרור',lbl:'חתך',lblAt:[0,-90]},
    {id:'CH',type:'chart',x:440,y:300,o:{w:220,h:70,xl:'זווית סיבוב',yl:'Q רגעי',t:'פולסציית ספיקה'},name:'ספיקה רגעית לאורך סיבוב'}]}),
  init:()=>({ang:0}),
  vg(P,f){const a=(f==='swash'?Math.min(P.alpha,6):P.alpha)*PI/180;return P.z*H.A(P.d)*P.Dp*Math.tan(a)/1000;},     // cm³/rev
  ripple(z){const N=360;let mn=1e9,mx=-1e9;const pts=[];for(let i=0;i<=N;i++){const th=i/N*2*PI/ z*2;let q=0;for(let k=0;k<z;k++){const s=Math.sin(th+k*2*PI/z);if(s>0)q+=s;}mn=Math.min(mn,q);mx=Math.max(mx,q);pts.push([i/N*720/z,q]);}return {pct:(mx-mn)/(z/PI)*100,pts,mx,mn};},
  step(P,st,dt,ctx){const f=ctx.fault;const Vg=this.vg(P,f);const cL=(f==='slipper'?.1:.012)*Math.max(Vg,1)*1.5/100;const r=benchStep(P,st,dt,{Vg,n:P.n,cL});const pm=KIT.nice(P.pr*1.05);const rp=this.ripple(P.z);
    const stroke=P.Dp*Math.tan((f==='swash'?Math.min(P.alpha,6):P.alpha)*PI/180);
    return {p:benchP(r),q:benchQ(r),pmax:pm,qref:Math.max(r.Qth,1),r,Vg,rp,stroke,
      c:Object.assign(benchC(P,r,pm),{X:{ang:r.ang,alpha:(f==='swash'?Math.min(P.alpha,6):P.alpha),uIn:-.04,uOut:r.p/pm},CH:{s:[{p:rp.pts,c:'#0b72d9'}],x:[0,720/P.z],y:[rp.mn*.9,rp.mx*1.03]}}),
      read:[{k:'מהלך בוכנה',v:stroke,u:'mm'},{k:'נפח סגולי',v:Vg,u:'cm³/rev'},{k:'ספיקה',v:r.Q+r.Qr,u:'L/min',max:Math.max(r.Qth,1)},{k:'לחץ',v:r.p,u:'bar'},{k:'פולסציית ספיקה',v:rp.pct,u:'%',max:30,w:rp.pct>10}]};},
  ins(P,R){const L=[{ic:'📐',at:'X',h:`זווית ${fmt(P.alpha,1)}°: מהלך כל בוכנה s = D·tanα = <b>${fmt(R.stroke,1)} מ"מ</b>, ונפח המשאבה ${fmt(R.Vg,1)} cm³/rev. α = 0 → אין מהלך ואין ספיקה.`}];
    L.push({ic:'〰️',at:'CH',h:`עם ${P.z} בוכנות הפולסציה ${fmt(R.rp.pct,1)}%. מספר אי-זוגי נותן פולסציה קטנה בהרבה ממספר זוגי סמוך – לכן משאבות בנויות עם 7 או 9 בוכנות.`});
    L.push({ic:'🔁',h:'הבוכנות בחצי הסיבוב שבו הן נכנסות לבלוק דוחפות שמן לפתח הלחץ; בחצי השני הן יוצאות ושואבות.'});return L;},
  calc(P,R){return `<div class="kpis">${kpi('מהלך',fmt(R.stroke,2),'mm')}${kpi('נפח סגולי',fmt(R.Vg,2),'cm³/rev')}${kpi('Q תאורטי',fmt(R.r.Qth,1),'L/min')}${kpi('פולסציה',fmt(R.rp.pct,1),'%')}</div>`+
    det('נפח סגולי',row('',`V = z·A·D·tanα = ${P.z}·${fmt(H.A(P.d),1)}·${P.Dp}·tan(${P.alpha}°)/1000 = ${V(R.Vg,'cm³/rev')}`)+row('',`Q = V·n/1000 = ${V(R.r.Qth,'L/min')}`),true)+det('פולסציה',row('',`(Q_max − Q_min)/Q_mean = ${V(R.rp.pct,'%')}`));},
  demo:[{t:'בלוק בוכנות מסתובב',x:'הבלוק מסתובב עם הציר, והבוכנות נשענות על דיסקה נטויה משופעת. בכל סיבוב כל בוכנה נכנסת ויוצאת פעם אחת.',reset:true,hl:['X']},
    {t:'זווית גדולה',x:'α = 18°: מהלך ארוך – ספיקה גדולה.',set:{alpha:18},hl:['X','FM']},
    {t:'זווית אפס',x:'α = 0: הדיסקה ניצבת, הבוכנות לא זזות – אין ספיקה גם כשהציר מסתובב.',set:{alpha:0},hl:['X','FM']},
    {t:'פולסציה',x:'משווים 8 בוכנות ל-9 בגרף: מספר אי-זוגי מחליק את הספיקה.',set:{alpha:15,z:8},hl:['CH'],dur:6},{t:'9 בוכנות',x:'עם 9 בוכנות הפולסציה קטנה פי 5 בערך (1.5% מול 7.8%).',set:{z:9},hl:['CH']}],
  predict:[{q:'מקטינים את α מ-15° ל-7.5°. הספיקה –',set:{alpha:7.5},opts:['חצי בערך','רבע','לא משתנה'],a:0,why:'Q ∝ tanα, ובזוויות קטנות tan כמעט ליניארי.'},
    {q:'8 או 9 בוכנות – למי פולסציה קטנה יותר?',set:{z:9},opts:['8','9'],a:1,why:'במספר אי-זוגי שיאי הבוכנות לא חופפים.'}],
  tasks:[{q:P=>`${P.z} בוכנות Ø${P.d}, מעגל Ø${P.Dp}, α = ${P.alpha}°. נפח סגולי?`,a:P=>SIM_AXIAL.vg(P),u:'cm³/rev',hint:'V = z·(πd²/4)·D·tanα /1000.',rand:P=>{P.z=pick([7,9]);P.d=pick([12,14,16,18]);P.Dp=pick([50,60,70]);P.alpha=rnd(5,18,1);}},
    {q:P=>`מהלך הבוכנה ב-α = ${P.alpha}°, D = ${P.Dp} מ"מ?`,a:P=>P.Dp*Math.tan(P.alpha*PI/180),u:'mm',hint:'s = D·tanα.',rand:P=>{P.alpha=rnd(5,18,1);P.Dp=pick([50,60,80]);}}],
  faults:[{id:'swash',t:'בורג עצירה של הדיסקה תקוע (α ≤ 6°)',sym:'"המשאבה לא נותנת יותר מ-40% ספיקה גם כשמכוונים זווית מלאה."',hint:'השוו את מהלך הבוכנה לחישוב לפי α.',why:'הדיסקה לא מגיעה לזווית – המהלך והנפח קטנים.',set:{alpha:18}},
    {id:'slipper',t:'נעלי בוכנה שחוקות',sym:'"בלחץ גבוה הספיקה צונחת והמשאבה מתחממת."',hint:'בדקו נצילות בלחץ גבוה.',why:'דליפה בין הנעליים לדיסקה ובין הבלוק ללוח השסתומים.',set:{load:.15}}],
  test(H){const P=clone(this.P);const R=this.step(P,{},0,{});return [['V = z·A·D·tanα',R.Vg,9*H.A(16)*60*Math.tan(15*PI/180)/1000],['s = D·tanα',R.stroke,60*Math.tan(15*PI/180)],['פולסציה z=9 ≈ 1.5%',this.ripple(9).pct,1.52,.08],['פולסציה z=8 ≈ 7.8%',this.ripple(8).pct,7.8,.05]];}};

/* ---------- 15 · pump curve and efficiency ---------- */
const SIM_CURVE={id:'curve',n:15,t:'עקומה ונצילות',d:'גרף Q–p שנבנה בזמן אמת; נצילות נפחית וכוללת',
  P:{Vg:16,n:1450,cond:'new',pr:200,sweep:true,load:1},
  ui(U,P){U.grp('משאבה');U.num(P,'Vg','נפח','cm³/rev',{min:2,max:100,step:1});U.num(P,'n','מהירות','rpm',{min:500,max:3000,step:50});U.seg(P,'cond','מצב',[['new','חדשה'],['worn','שחוקה']]);
    U.grp('מבחן');U.chk(P,'sweep','סגירה הדרגתית של שסתום העומס');U.num(P,'load','פתיחת שסתום העומס','0–1',{min:0,max:1,step:.02});U.num(P,'pr','כיול שסתום פריקה','bar',{min:50,max:300,step:5});U.btn('↺ מבחן חדש',()=>{APP.st.pts=[];APP.st.pts2=[];APP.P.load=1;});},
  circuit:P=>benchCircuit({extra:[{id:'CH',type:'chart',x:450,y:110,o:{w:230,h:130,xl:'p [bar]',yl:'Q [L/min]',t:'עקומת Q–p'},name:'עקומת ספיקה מול לחץ'},
    {id:'CH2',type:'chart',x:450,y:300,o:{w:230,h:110,xl:'p [bar]',yl:'η [%]',t:'נצילות נפחית (כחול) וכוללת (סגול)'},name:'נצילויות מול לחץ'}]}),
  init:()=>({pts:[],pts2:[],ev:[],et:[],ang:0}),
  step(P,st,dt,ctx){const f=ctx.fault;const wear=P.cond==='worn'?3:1;const cL=.04*P.Vg*P.n/1000/100*wear*(f==='leak'?2.5:1);
    if(P.sweep&&dt>0){P.load=Math.max(.04,P.load-dt*.09);if(P.load<=.041){P.load=1;st.pts=[];st.ev=[];st.et=[];}}
    const r=benchStep(P,st,dt,{Vg:P.Vg,n:P.n,cL,fw:f==='bearing'?3:1});const pm=KIT.nice(P.pr*1.05);const Qout=r.Q+r.Qr;
    if(dt>0&&r.Qr<.05&&(!st.pts.length||Math.abs(st.pts.at(-1)[0]-r.p)>1.5)){st.pts.push([r.p,Qout]);st.ev.push([r.p,r.ev*100]);st.et.push([r.p,r.et*100]);}
    const ref=[[0,r.Qth],[P.pr,r.Qth]];
    return {p:benchP(r),q:benchQ(r),pmax:pm,qref:Math.max(r.Qth,1),r,
      c:Object.assign(benchC(P,r,pm),{CH:{s:[{p:st.pts,c:'#0b72d9'},{p:ref,c:'#64748b',d:true}],m:[r.p,Qout],x:[0,P.pr],y:[0,KIT.nice(r.Qth*1.1)]},CH2:{s:[{p:st.ev,c:'#0b72d9'},{p:st.et,c:'#7e22ce'}],m:[r.p,r.et*100],x:[0,P.pr],y:[0,100]}}),
      read:[{k:'לחץ',v:r.p,u:'bar'},{k:'ספיקה',v:Qout,u:'L/min',max:r.Qth},{k:'נצילות נפחית η_v',v:r.ev*100,u:'%',max:100},{k:'נצילות מכנית η_hm',v:r.ehm*100,u:'%',max:100},{k:'נצילות כוללת η',v:r.et*100,u:'%',max:100},{k:'הספק כניסה',v:r.Pin,u:'kW'}]};},
  ins(P,R){const r=R.r;return [{ic:'📉',at:'CH',h:`ככל שהלחץ עולה הספיקה יורדת מעט: הדליפה הפנימית ∝ p. הקו המקווקו = הספיקה התאורטית ${fmt(r.Qth,1)} L/min.`},
    {ic:'⚖️',at:'CH2',h:`η = η_v·η_hm = ${fmt(r.ev*100,0)}%·${fmt(r.ehm*100,0)}% = <b>${fmt(r.et*100,0)}%</b>. בלחץ נמוך η_hm נמוכה (חיכוך קבוע מול מומנט קטן), בלחץ גבוה η_v יורדת.`},
    P.cond==='worn'?{ic:'🔧',w:true,h:'משאבה שחוקה: העקומה יורדת חד יותר – זו הדרך לזהות שחיקה במבחן.',at:'CH'}:{ic:'💡',h:'החליפו ל"שחוקה" והשוו את שתי העקומות.'}];},
  calc(P,R){const r=R.r;return `<div class="kpis">${kpi('η_v',fmt(r.ev*100,1),'%')}${kpi('η_hm',fmt(r.ehm*100,1),'%')}${kpi('η',fmt(r.et*100,1),'%')}${kpi('P כניסה',fmt(r.Pin,2),'kW')}</div>`+
    det('נצילויות',row('נפחית',`η_v = Q/Q_th = ${fmt(r.Q+r.Qr,2)}/${fmt(r.Qth,2)} = ${V(r.ev*100,'%')}`)+row('מכנית-הידראולית',`η_hm = T_th/T = ${V(r.ehm*100,'%')}`)+row('כוללת',`η = P_hyd/P_in = ${fmt(H.kW(r.p,r.Q+r.Qr),3)}/${fmt(r.Pin,3)} = ${V(r.et*100,'%')}`),true);},
  demo:[{t:'מבחן משאבה',x:'שסתום העומס נסגר בהדרגה והלחץ עולה. בכל נקודה נרשמים לחץ וספיקה – והעקומה נבנית.',reset:true,hl:['LV','CH'],dur:12},
    {t:'נצילויות',x:'בגרף התחתון: η_v (כחול) יורדת עם הלחץ; η הכוללת (סגול) עולה ואז יורדת.',hl:['CH2'],dur:10},
    {t:'משאבה שחוקה',x:'אותו מבחן במשאבה שחוקה: העקומה צונחת מהר יותר.',set:{cond:'worn',load:1},act:(P,st)=>{st.pts=[];st.ev=[];st.et=[];},hl:['CH'],dur:12}],
  predict:[{q:'במשאבה שחוקה, הספיקה בלחץ אפס בהשוואה לחדשה –',set:{cond:'worn',sweep:false,load:1},opts:['נמוכה הרבה יותר','כמעט זהה','גבוהה יותר'],a:1,why:'בלי לחץ אין דליפה – השחיקה נראית רק בלחץ.'},
    {q:'איפה הנצילות הכוללת מקסימלית?',opts:['בלחץ אפס','בלחץ בינוני-גבוה','רק בלחץ המקסימלי'],a:1,why:'בלחץ נמוך החיכוך שולט, בלחץ מקסימלי הדליפות – השיא באמצע.'}],
  tasks:[{q:()=>'Q_th = 23.2 L/min, נמדד 20.9 L/min ב-150 bar. מה η_v (%)?',a:()=>20.9/23.2*100,u:'%',hint:'η_v = Q/Q_th.'},
    {q:()=>'ב-150 bar ו-20.9 L/min המנוע מוסר 6.2 kW. מה הנצילות הכוללת (%)?',a:()=>150*20.9/600/6.2*100,u:'%',hint:'P_hyd = p·Q/600.'}],
  faults:[{id:'leak',t:'לוח צד שחוק (דליפה פנימית)',sym:'"העקומה צונחת מוקדם, השמן מתחמם."',hint:'השוו את η_v ל-90% שבנתוני היצרן.',why:'דליפה פי 2.5 – η_v נמוכה בלחץ גבוה.',set:{}},
    {id:'bearing',t:'מסב תפוס חלקית',sym:'"הספיקה תקינה, אבל המנוע מתחמם וצורך הרבה זרם."',hint:'השוו η_hm ו-η_v.',why:'חיכוך גבוה: η_hm נמוכה, הספק הכניסה גבוה – אבל הספיקה תקינה.',set:{}}],
  qaT:10,
  test(H){const P=clone(this.P);P.sweep=false;P.load=.2;const R=this.step(P,this.init(P),0,{});const r=R.r;return [['η = η_v·η_hm',r.et,r.ev*r.ehm,.01],['P_in = 2πnT',r.Pin,2*PI*P.n/60*r.T/1000],['UI η',R.read[4].v,r.et*100]];}};

/* ---------- 16 · variable pump with pressure compensator ---------- */
const SIM_COMP={id:'comp',n:16,t:'משאבה משתנה',d:'הדיסקה מתיישרת והספיקה יורדת לאפס בלחץ הכיוון; השוואת חום מול משאבה קבועה',
  P:{Vmax:28,n:1500,pc:150,band:8,load:.5,pr:180,F:1,sweep:true},
  ui(U,P){U.grp('משאבה');U.num(P,'Vmax','נפח מקסימלי','cm³/rev',{min:5,max:100,step:1});U.num(P,'n','מהירות','rpm',{min:500,max:3000,step:50});U.num(P,'pc','כיול הווסת','bar',{min:20,max:300,step:5});
    U.grp('עומס');U.chk(P,'sweep','סגירה הדרגתית עד עצירה');U.num(P,'load','פתיחת שסתום העומס','0–1',{min:0,max:1,step:.02});U.num(P,'pr','כיול שסתום פריקה (גיבוי)','bar',{min:50,max:350,step:5});},
  circuit:P=>{const c=benchCircuit({var:true,pname:'משאבה בעלת נפח משתנה מפוצת לחץ',extra:[{id:'X',type:'axialx',x:440,y:120,name:'חתך: הדיסקה מתיישרת כשהלחץ מגיע לכיול הווסת',lbl:'חתך',lblAt:[0,-90]},
      {id:'CH',type:'chart',x:440,y:290,o:{w:220,h:100,xl:'p [bar]',yl:'Q',t:'Q–p: משתנה (כחול) מול קבועה (אפור)'},name:'עקומות'}]});c.lines.push({id:'LX',net:'P',kind:'pilot',pts:[[130,140],[130,250],[128,250]],nodot:true});return c;},
  init:()=>({ang:0,a:1}),
  step(P,st,dt,ctx){const f=ctx.fault;const pc=f==='comp'?P.pr+10:P.pc;if(P.sweep&&dt>0){P.load=Math.max(0,P.load-dt*.08);if(P.load<=0){st.hold=(st.hold||0)+dt;if(st.hold>3){P.load=.6;st.hold=0;}}}
    const Qmax=P.Vmax*P.n/1000;const cL=.012*Qmax/100;const k=PB.kOf(P.load);const band=P.band;
    // compensator: displacement fraction a = clamp((pc + band − p)/band, 0, 1); solve Q_pump(p) = Q_load(p)
    const fr=p=>clamp((pc+band-p)/band,0,1);const g=p=>Qmax*fr(p)-cL*p-H.orQ(k,Math.max(p,0))-H.reliefQ(p,P.pr,Math.max(3,.06*P.pr),Qmax);
    const p=k>1e5?0:H.bisect(g,0,Math.max(P.pr,pc+band)*1.2+5);const a=fr(p);KIT.ease(st,'a',a,dt,8);const Ql=H.orQ(k,Math.max(p,0));const Qr=H.reliefQ(p,P.pr,Math.max(3,.06*P.pr),Qmax);
    st.ang=((st.ang||0)+P.n/60*2*PI*dt*.15)%(2*PI*1000);
    const PinV=H.kW(p,Qmax*a)/.88+.25,PinF=H.kW(Math.min(P.pr,Math.max(p,0)),Qmax)/.88;const lossV=PinV-H.kW(p,Ql),lossF=Math.max(PinF-H.kW(p,Ql),0);
    const pm=KIT.nice(Math.max(P.pr,pc+band)*1.05);const curV=[],curF=[];for(let i=0;i<=40;i++){const pp=i/40*P.pr*1.05;curV.push([pp,Qmax*fr(pp)]);curF.push([pp,pp<P.pr?Qmax:Qmax*Math.max(0,1-(pp-P.pr)/Math.max(3,.06*P.pr))]);}
    const r={p,Q:Ql,Qr,Qth:Qmax*a,ang:st.ang};
    return {p:benchP(r),q:{LS:Qmax*a,LP:Ql+Qr,LR:Qr,LRT:Qr,LF:Ql,LT:Ql},pmax:pm,qref:Qmax,r,a,Qmax,PinV,PinF,lossV,lossF,
      c:Object.assign(benchC(P,r,pm),{X:{ang:st.ang,alpha:18*st.a,uIn:-.04,uOut:p/pm},CH:{s:[{p:curF,c:'#94a3b8',d:true},{p:curV,c:'#0b72d9'}],m:[p,Ql],x:[0,P.pr*1.05],y:[0,KIT.nice(Qmax*1.1)]},P1:{on:true,ang:st.ang}}),
      read:[{k:'לחץ',v:p,u:'bar'},{k:'זווית דיסקה (חלק מהמקסימום)',v:a*100,u:'%',max:100},{k:'ספיקה לצרכן',v:Ql,u:'L/min',max:Qmax},{k:'הפסדים – משאבה משתנה',v:lossV,u:'kW',max:Math.max(lossF,1)},{k:'הפסדים – משאבה קבועה + שסתום פריקה',v:lossF,u:'kW',max:Math.max(lossF,1),w:lossF>3},{k:'ספיקה בשסתום הפריקה',v:Qr,u:'L/min',w:Qr>.5}]};},
  ins(P,R){const L=[];if(R.a<.98)L.push({ic:'📐',at:'X',h:`הלחץ (${fmt(R.r.p,0)} bar) הגיע לאזור הכיול (${fmt(P.pc,0)} bar): הווסת מיישר את הדיסקה ל-${fmt(R.a*100,0)}% – המשאבה מספקת רק את מה שהצרכן לוקח.`});
    else L.push({ic:'➡️',h:'מתחת לכיול הווסת המשאבה בזווית מלאה ומתנהגת כמו משאבה קבועה.'});
    L.push({ic:'🔥',at:'RV',h:`השוואת חום: משאבה קבועה עם שסתום פריקה הייתה מבזבזת <b>${fmt(R.lossF,2)} kW</b>, המשתנה – ${fmt(R.lossV,2)} kW בלבד.`});
    if(R.r.Qr>.5)L.push({ic:'⚠️',w:true,at:'RV',h:'שסתום הפריקה פתוח – הווסת לא מגביל כמו שצריך.',c:'שסתום הפריקה עובד – בדקו את הווסת'});return L;},
  calc(P,R){return `<div class="kpis">${kpi('לחץ',fmt(R.r.p,1),'bar')}${kpi('זווית',fmt(R.a*100,0),'%')}${kpi('הפסד משתנה',fmt(R.lossV,2),'kW')}${kpi('הפסד קבועה',fmt(R.lossF,2),'kW')}</div>`+
    det('ווסת לחץ',row('',`a = (p_c + Δp_band − p)/Δp_band = ${V(R.a*100,'%')}`)+row('',`Q = a·V_max·n = ${V(R.a*R.Qmax,'L/min')}`),true)+det('חום',row('קבועה + שסתום פריקה',`P_loss = P_in − p·Q_load = ${V(R.lossF,'kW')}`)+row('משתנה',`P_loss = ${V(R.lossV,'kW')}`));},
  demo:[{t:'משאבה משתנה',x:'משאבת בוכנות עם ווסת לחץ: קפיץ מחזיק את הדיסקה בזווית מלאה, ולחץ היציאה (קו פיקוד) דוחף אותה לאפס.',reset:true,set:{sweep:false,load:.6},hl:['P1','X']},
    {t:'מגיעים ללחץ הכיול',x:'סוגרים את העומס: כשהלחץ מגיע ל-150 bar הדיסקה מתחילה להתיישר – הספיקה יורדת.',set:{sweep:true},hl:['X','CH'],dur:12},
    {t:'עצירה מוחלטת',x:'הצרכן סגור: הדיסקה כמעט ישרה, הספיקה רק מכסה דליפות – והלחץ נשמר בלי חום.',hl:['X'],dur:6},
    {t:'מול משאבה קבועה',x:'במשאבה קבועה כל הספיקה הייתה עוברת בשסתום הפריקה והופכת לחום – השוו את שני ההפסדים.',hl:['RV'],dur:8}],
  predict:[{q:'הצרכן נסגר לגמרי. מה תעשה המשאבה המשתנה?',set:{sweep:false,load:0},opts:['תשאיר ספיקה מלאה דרך שסתום הפריקה','תקטין זווית כמעט לאפס','תיעצר'],a:1,why:'הווסת מיישר את הדיסקה – ספיקה כמעט אפס, לחץ נשמר.'},
    {q:'שסתום הפריקה מכויל ל-180 והווסת ל-150. מתי יפתח שסתום הפריקה?',set:{sweep:false,load:0},opts:['ב-150','כמעט אף פעם – הוא רק גיבוי'],a:1,why:'הווסת מגביל את הלחץ לפני שסתום הפריקה.'}],
  tasks:[{q:P=>`V_max = ${P.Vmax} cm³/rev ב-${P.n} rpm. ספיקה מקסימלית?`,a:P=>P.Vmax*P.n/1000,u:'L/min',hint:'Q = V·n/1000.',rand:P=>{P.Vmax=pick([18,28,45,71]);}},
    {q:P=>`משאבה קבועה ${fmt(P.Vmax*P.n/1000,1)} L/min, שסתום פריקה 180 bar, צרכן סגור. כמה kW הופכים לחום?`,a:P=>180*P.Vmax*P.n/1000/600,u:'kW',hint:'P = p·Q/600.'}],
  faults:[{id:'comp',t:'ווסת הלחץ תקוע',sym:'"השמן חם מאוד כשהמכונה ממתינה, ושומעים שריקה משסתום הפריקה."',hint:'מה הזווית כשהצרכן סגור? ומה עושה שסתום הפריקה?',why:'הווסת לא מיישר את הדיסקה עד לחץ שסתום הפריקה – כל הספיקה עוברת בשסתום הפריקה.',set:{sweep:false,load:0}}],
  test(H){const P=clone(this.P);P.sweep=false;P.load=0;const R=this.step(P,{a:1},0,{});return [['בעצירה: Q ≈ 0',R.r.Q,0],['a = (pc+band−p)/band',R.a,clamp((P.pc+P.band-R.r.p)/P.band,0,1),.01],['הפסד קבועה = p·Q/600/η',R.lossF,H.kW(Math.min(P.pr,R.r.p),R.Qmax)/.88]];}};

/* ---------- 17 · bottle jack ---------- */
const SIM_JACK={id:'jack',n:17,t:"ג'ק בקבוק",d:'שני שסתומי אל-חוזר, בוכנת שאיבה קטנה ובוכנה גדולה; יחס מהלכים',
  P:{d:12,D:40,s:25,lev:8,m:2000,F:300,auto:true,rel:false},
  ui(U,P){U.grp('ג\'ק');U.num(P,'d','קוטר בוכנת שאיבה','mm',{min:5,max:30,step:1});U.num(P,'D','קוטר בוכנה ראשית','mm',{min:20,max:120,step:2});U.num(P,'s','מהלך שאיבה','mm',{min:5,max:60,step:1});U.num(P,'lev','יחס ידית','',{min:1,max:20,step:.5});
    U.grp('הפעלה');U.num(P,'m','מסה','kg',{min:0,max:20000,step:100});U.num(P,'F','כוח יד','N',{min:0,max:1000,step:10});U.chk(P,'auto','שאיבה אוטומטית');U.chk(P,'rel','פתיחת ברג השחרור');},
  circuit:P=>({comps:[{id:'R1',type:'ram',x:120,y:120,o:{w:22},name:'בוכנת שאיבה (מונעת בידית)',lbl:'שאיבה',lblAt:[-36,10]},{id:'R2',type:'ram',x:360,y:120,o:{w:70},name:'בוכנה ראשית מרימה את המסה',lbl:'ראשית',lblAt:[60,10]},
      {id:'C1',type:'check',x:120,y:210,o:{spring:true},name:'אל-חוזר יניקה (מהמאגר)',lbl:'אל-חוזר 1',lblAt:[-40,4]},{id:'C2',type:'check',x:230,y:170,rot:90,o:{spring:true},name:'אל-חוזר דחיפה (לבוכנה הראשית)',lbl:'אל-חוזר 2',lblAt:[0,26]},
      {id:'RV',type:'sv',x:300,y:236,rot:90,name:'ברג שחרור (לחיצה פותחת/סוגרת)',lbl:'שחרור',lblAt:[0,22]},{id:'T1',type:'tank',x:120,y:268,name:'מאגר שמן'},{id:'T2',type:'tank',x:240,y:262,name:'מאגר'},
      {id:'G1',type:'gauge',x:300,y:150,net:'H',name:'מד לחץ בבוכנה הראשית',valAt:[-14,-6]}],
    lines:[{id:'LS',net:'S',pts:['T1.t','C1.in']},{id:'L1',net:'L',pts:['C1.out','R1.p']},{id:'L2',net:'L',pts:[[120,170],[200,170],'C2.in']},{id:'L3',net:'H',pts:['C2.out',[360,170],'R2.p']},
      {id:'LG',net:'H',pts:[[300,170],'G1.p']},{id:'LR',net:'H',pts:[[330,170],[330,236],'RV.out']},{id:'LR2',net:'T',pts:['RV.in',[240,236],'T2.t']}]}),
  init:()=>({x1:0,x2:0,ph:'down',strokes:0}),
  click(id,P){if(id==='RV'){P.rel=!P.rel;return true;}},
  step(P,st,dt,ctx){const f=ctx.fault;const a=H.A(P.d),A=H.A(P.D),W=P.m*G;const pL=W*10/A;const Fpl=P.F*P.lev;const pmax=Fpl*10/a;const v=P.auto?60:0;let pl=0,pH=pL,q1=0,q2=0,qr=0;
    if(P.rel){const k=H.orK(1.5);qr=H.orQ(k,Math.max(pL,0));st.x2=Math.max(0,st.x2-H.v(qr,A)*dt);if(st.x2<=0){qr=0;}pH=st.x2>0?pL:0;}
    if(P.auto&&dt>0){if(st.ph==='down'){if(pmax>=pL||P.rel||f==='c2'){const leakBack=f==='c1'?.5:1;st.x1=Math.min(P.s,st.x1+v*dt);pl=P.rel?Math.min(pmax,1):pL+.5;
          const dV=v*dt*a*leakBack;if(!P.rel&&f!=='c2')st.x2+=dV/A;q1=H.Q(v,a);q2=f==='c2'?0:q1*leakBack;if(f==='c2'){pl=pmax;q1=0;}}else{pl=pmax;}
        if(st.x1>=P.s){st.ph='up';st.strokes++;}}
      else{st.x1=Math.max(0,st.x1-v*1.5*dt);pl=-.3;q1=-H.Q(v*1.5,a);if(f==='c2'&&!P.rel)st.x2=Math.max(0,st.x2-.4*dt);if(st.x1<=0)st.ph='down';}}
    st.x2=clamp(st.x2,0,150);const pm=KIT.nice(Math.max(pL,pmax,10)*1.15);
    return {p:{S:-.05,L:pl,H:pH,T:.3},q:{LS:st.ph==='up'?-q1:0,L1:q1,L2:q1>0?q1:0,L3:q2,LR:qr,LR2:qr},pmax:pm,qref:H.Q(v,a)||1,vac:true,a,A,W,pL,pmax,ratio:A/a,stuck:pmax<pL&&!P.rel,
      c:{R1:{x:1-st.x1/P.s*.8,u:pl/pm,lt:`${fmt(P.F,0)} N`},R2:{x:clamp(st.x2/150,0,1),u:pH/pm,lt:`${fmt(P.m,0)} kg`},C1:{open:st.ph==='up'?1:0},C2:{open:st.ph==='down'&&pmax>=pL?1:0},RV:{closed:!P.rel},G1:{p:pH}},
      read:[{k:'לחץ בבוכנה ראשית',v:pH,u:'bar'},{k:'לחץ מרבי מהיד',v:pmax,u:'bar'},{k:'יחס שטחים A/a',v:A/a,u:''},{k:'הרמה בכל שאיבה',v:P.s*a/A,u:'mm',dg:2},{k:'גובה הרמה',v:st.x2,u:'mm',max:150},{k:'מספר שאיבות',v:st.strokes,u:'',dg:0}]};},
  ins(P,R){const L=[{ic:'⚖️',h:`יחס שטחים <b>${fmt(R.ratio,1)}</b> × יחס ידית ${fmt(P.lev,1)} = הכפלת כוח פי ${fmt(R.ratio*P.lev,0)}. כל שאיבה מרימה רק ${fmt(P.s/R.ratio,2)} מ"מ.`}];
    if(R.stuck)L.push({ic:'⛔',w:true,at:'R1',h:`כוח היד לא מספיק: צריך ${fmt(R.pL,0)} bar ואפשר להגיע רק ל-${fmt(R.pmax,0)} bar. הגדילו את יחס הידית או הקטינו את בוכנת השאיבה.`,c:'כוח היד לא מספיק'});
    L.push({ic:'🔁',at:'C1',h:'ירידה של הידית: אל-חוזר 2 נפתח ושמן נדחף לבוכנה הראשית. עליה: אל-חוזר 1 נפתח ושמן נשאב מהמאגר, ואל-חוזר 2 מחזיק את העומס.'});
    if(P.rel)L.push({ic:'⬇️',at:'RV',h:'ברג השחרור פתוח: השמן חוזר מהבוכנה הראשית למאגר והעומס יורד.'});return L;},
  calc(P,R){return `<div class="kpis">${kpi('לחץ עומס',fmt(R.pL,1),'bar')}${kpi('יחס כוחות',fmt(R.ratio*P.lev,1))}${kpi('הרמה לשאיבה',fmt(P.s/R.ratio,3),'mm')}${kpi('שאיבות ל-100 mm',fmt(100*R.ratio/P.s,0))}</div>`+
    det('כוחות',row('',`p = W/A = ${fmt(R.W,0)}·10/${fmt(R.A,0)} = ${V(R.pL,'bar')}`)+row('כוח על בוכנת השאיבה',`F_p = p·a = ${V(H.F(R.pL,R.a),'N')}`)+row('כוח יד',`F = F_p/יחס ידית = ${V(H.F(R.pL,R.a)/P.lev,'N')}`,P.F>=H.F(R.pL,R.a)/P.lev),true)+
    det('תזוזה',row('',`s₂ = s·a/A = ${V(P.s/R.ratio,'mm')} לשאיבה`));},
  demo:[{t:"ג'ק בקבוק",x:'בוכנת שאיבה קטנה, בוכנה ראשית גדולה, שני אל-חוזרים וברג שחרור – מכבש פסקל שעובד במנות.',reset:true,hl:['R1','R2']},
    {t:'ירידת הידית',x:'הבוכנה הקטנה דוחפת שמן דרך <b>אל-חוזר 2</b> לבוכנה הגדולה – העומס עולה מעט.',hl:['C2','R2']},
    {t:'עליית הידית',x:'אל-חוזר 2 נסגר ומחזיק את העומס; <b>אל-חוזר 1</b> נפתח ושואב שמן מהמאגר.',hl:['C1'],dur:6},
    {t:'שחרור',x:'פותחים את ברג השחרור – השמן חוזר למאגר והעומס יורד לאט.',set:{rel:true,auto:false},hl:['RV'],dur:7}],
  predict:[{q:'מגדילים את קוטר בוכנת השאיבה מ-12 ל-24 מ"מ. כוח היד הדרוש –',set:{d:24},opts:['פי 4','פי 2','זהה'],a:0,why:'השטח גדל פי 4 → F = p·a גדל פי 4 (אבל כל שאיבה מרימה פי 4 יותר).'},
    {q:'אל-חוזר 2 דולף. מה יקרה כשמפסיקים לשאוב?',opts:['העומס נשאר','העומס יורד לאט'],a:1,why:'אל-חוזר 2 הוא שמחזיק את העומס בין השאיבות.'}],
  tasks:[{q:P=>`מסה ${P.m} kg על בוכנה Ø${P.D}, בוכנת שאיבה Ø${P.d}, יחס ידית ${P.lev}. מה כוח היד?`,a:P=>H.F(P.m*G*10/H.A(P.D),H.A(P.d))/P.lev,u:'N',hint:'p = W/A, F = p·a/יחס.',rand:P=>{P.m=rnd(500,5000,100);P.D=pick([30,40,50]);P.d=pick([8,10,12]);P.lev=pick([6,8,10]);}},
    {q:P=>`כמה שאיבות של ${P.s} mm צריך כדי להרים 100 mm (Ø${P.d}/Ø${P.D})?`,a:P=>100*(P.D/P.d)**2/P.s,u:'',tol:.05,hint:'n = s₂·A/(s·a).'}],
  faults:[{id:'c1',t:'אל-חוזר יניקה דולף',sym:'"צריך הרבה יותר שאיבות מהרגיל."',hint:'השוו הרמה לשאיבה לחישוב s·a/A.',why:'חלק מהשמן חוזר למאגר בירידת הידית – רק חצי מגיע לבוכנה.',set:{}},
    {id:'c2',t:'אל-חוזר דחיפה תקוע סגור',sym:'"הידית קשה מאוד והעומס לא עולה; בין שאיבות הוא שוקע."',hint:'מה הלחץ בצד הבוכנה הקטנה?',why:'השמן לא עובר לבוכנה הראשית – הלחץ עולה רק בצד השאיבה.',set:{}}],
  qaT:6,
  test(H){const P=clone(this.P);const st=this.init(P);let R;for(let t=0;t<2;t+=.01)R=this.step(P,st,.01,{});const a=H.A(12),A=H.A(40);return [['p = W/A',R.pL,2000*G*10/A],['הרמה = n·s·a/A',st.x2,(st.strokes*P.s+(st.ph==='down'?st.x1:0))*a/A,.03],['UI יחס',R.read[2].v,A/a]];}};

/* ---------- 11 · hydraulic power unit (assemble / disassemble) ---------- */
SYM.cooler={ports:o=>({in:[0,14],out:[0,-14]}),bb:o=>[-16,-15,16,15],draw(g){SP(g,'M0,-14 L14,0 L0,14 L-14,0Z','syb');SL(g,-14,0,14,0);SA(g,0,-4,0,6,'sy thin',3);SA(g,6,2,10,-6,'sy thin',3);}};
SYM.breather={ports:o=>({p:[0,10]}),bb:o=>[-10,-10,10,10],draw(g){SP(g,'M0,-9 L9,0 L0,9 L-9,0Z','syb');SL(g,0,-9,0,9,'sy dash');}};
SYM.reservoir={ports:o=>({s:[-60,40],r:[60,40],b:[40,-40]}),bb:o=>[-80,-46,80,46],draw(g,o){const oil=sv('rect',{x:-78,y:-6,width:156,height:50,fill:'#93c5fd',opacity:.7},g);SP(g,'M-80,-44 V44 H80 V-44 Z','syb nofill');
    const baf=SL(g,0,44,0,-14,'sy thick');const bub=[...Array(8)].map(()=>SC(g,0,0,2.2,'sy thin'));const lvl=SR(g,-74,-30,8,60,'sy thin');const lv=sv('rect',{x:-73,width:6,fill:'#2563eb'},g);
    return cs=>{if(!cs)return;baf.style.display=cs.baffle?'':'none';const lev=clamp(cs.level??.7,0,1);oil.setAttribute('y',44-lev*86);oil.setAttribute('height',lev*86);oil.style.fill=cs.dirty>.5?'#a8a29e':'#93c5fd';
      lv.setAttribute('y',30-lev*60);lv.setAttribute('height',lev*60);const t=performance.now()/1000;bub.forEach((b,i)=>{const air=cs.air||0;b.style.display=air>.02*(i+1)?'':'none';const x=(cs.baffle?-50:-10)+((i*37)%60);b.setAttribute('cx',x);b.setAttribute('cy',40-((t*30+i*20)%60));});};}};
B3.cooler=(c,o)=>{const M=m3(),g=new THREE.Group();g.add(edges(at(box3(30,26,14,M.alu),0,0,10)));for(let i=0;i<6;i++)g.add(at(box3(1,24,16,M.dark),-12+i*5,0,10));const fan=new THREE.Group();at(fan,0,0,19);fan.add(box3(24,3,1,M.black));fan.add(box3(3,24,1,M.black));g.add(fan);return {g,upd(cs){fan.rotation.z=(cs&&cs.ang)||0;fan.visible=!(cs&&cs.off);}};};
B3.breather=(c,o)=>{const M=m3(),g=new THREE.Group();g.add(at(cyl3(6,10,M.dark),0,0,8));return {g,upd(cs){g.visible=!(cs&&cs.off);}};};
B3.reservoir=(c,o)=>{const M=m3(),g=new THREE.Group();g.add(at(box3(160,92,70,M.glass),0,0,36));g.add(edges(at(box3(160,92,70,new THREE.MeshBasicMaterial({visible:false})),0,0,36),.5));const oil=at(box3(156,1,66,oilMat()),0,0,36);g.add(oil);
  const baf=at(box3(3,58,66,M.alu),0,-15,36);g.add(baf);return {g,upd(cs){if(!cs)return;const lev=clamp(cs.level??.7,0,1);oil.scale.y=Math.max(lev*86,.5);oil.position.y=-44+lev*43;setOil(oil.material,cs.dirty>.5?.55:.05);baf.visible=!!cs.baffle;}};};
const HPU_PARTS=[['baffle','מחיצה במיכל','מפרידה בין החזרה ליניקה: זמן לבועות לעלות ולחלקיקים לשקוע.'],['strainer','מסנן יניקה','מגן על המשאבה מחלקיקים גסים.'],['rfilter','מסנן חזרה','מנקה את השמן מחלקיקים עדינים שנוצרים במערכת.'],
  ['cooler','מקרר שמן','מפנה את החום שנוצר מהפסדי לחץ.'],['breather','מסנן אוורור','מאפשר לאוויר להיכנס ולצאת כשהמפלס משתנה – בלי אבק.'],['relief','שסתום פריקה','מגביל את הלחץ המקסימלי.']];
const SIM_HPU={id:'hpu',n:11,t:'יחידת כוח הידראולית',d:'מנוע, מצמד, משאבה, מיכל עם מחיצה, מסננים, מקרר, מפריק אוויר – תפקיד ומיקום',
  P:{Q:30,load:.3,pr:120,V:120,baffle:true,strainer:true,rfilter:true,cooler:true,breather:true,relief:true,acc:120},
  key:P=>HPU_PARTS.map(p=>P[p[0]]?1:0).join(''),
  ui(U,P){U.grp('הרכבה – סמנו רכיב כדי להתקין');HPU_PARTS.forEach(([k,t])=>U.chk(P,k,t,true));U.note('לחיצה על רכיב בשרטוט מפרקת/מרכיבה אותו.');
    U.grp('עבודה',false);U.num(P,'Q','ספיקת משאבה','L/min',{min:5,max:150,step:5});U.num(P,'V','נפח מיכל','L',{min:20,max:600,step:10});U.num(P,'load','פתיחת שסתום העומס','0–1',{min:0,max:1,step:.02});U.num(P,'pr','כיול שסתום פריקה','bar',{min:20,max:300,step:5});},
  circuit(P){const off=k=>P[k]?'':' (מפורק)';const comps=[{id:'TK',type:'reservoir',x:200,y:330,name:'מיכל שמן'+(P.baffle?' עם מחיצה':' ללא מחיצה'),lbl:'מיכל',lblAt:[-96,-34]},
      {id:'P1',type:'pump',x:140,y:200,name:'משאבה + מנוע חשמלי (דרך מצמד ופעמון)',lbl:'משאבה',lblAt:[-46,30]},{id:'G1',type:'gauge',x:190,y:108,net:'P',name:'מד לחץ',valAt:[14,-6]},
      {id:'LV',type:'throttle',x:320,y:150,name:'צרכן (שסתום עומס)',lbl:'צרכן',lblAt:[24,4]}];
    if(P.strainer)comps.push({id:'SF',type:'filter',x:140,y:262,name:'מסנן יניקה',lbl:'מסנן יניקה',lblAt:[-46,4]});
    if(P.relief)comps.push({id:'RV',type:'pv',x:90,y:140,rot:-90,o:{kind:'relief'},name:'שסתום פריקה',lbl:'פריקה',lblAt:[0,-30]},{id:'T2',type:'tank',x:52,y:152,name:'מיכל'});
    if(P.rfilter)comps.push({id:'RF',type:'filter',x:320,y:230,name:'מסנן חזרה',lbl:'מסנן חזרה',lblAt:[42,4]});
    if(P.cooler)comps.push({id:'CO',type:'cooler',x:320,y:280,name:'מקרר שמן (מאוורר)',lbl:'מקרר',lblAt:[30,4]});
    if(P.breather)comps.push({id:'BR',type:'breather',x:240,y:270,name:'מסנן אוורור',lbl:'אוורור',lblAt:[24,-6]});
    const lines=[{id:'LS',net:'S',pts:[[160,370],[140,370],P.strainer?'SF.in':[140,300],...(P.strainer?[]:[[140,218]])].filter(Boolean)},{id:'LP',net:'P',pts:['P1.out',[140,132],[320,132],'LV.out']},{id:'LG',net:'P',pts:[[190,132],'G1.p'],nodot:true}];
    if(P.strainer)lines.push({id:'LS2',net:'S',pts:['SF.out','P1.in']});else lines[0].pts=[[160,370],[140,370],[140,218]];
    if(P.relief)lines.push({id:'LR',net:'P',pts:[[140,140],'RV.P']},{id:'LRT',net:'T',pts:['RV.T',[52,140],'T2.t']});
    let y0=166;const ret=['LV.in'];if(P.rfilter){lines.push({id:'LT1',net:'T',pts:['LV.in','RF.out']});}
    const last=P.rfilter?'RF.in':'LV.in';if(P.cooler){lines.push({id:'LT2',net:'T',pts:[last,'CO.out']},{id:'LT3',net:'T',pts:['CO.in',[320,345],[240,345]]});}else lines.push({id:'LT2',net:'T',pts:[last,[320,345],[240,345]]});
    if(P.breather)lines.push({id:'LB',net:'A',kind:'drain',pts:['BR.p',[240,290]],nodot:true});
    return {comps,lines};},
  init:P=>({T:25,c:16,air:0,ang:0,wear:0,tank:0}),
  click(id,P){const m={SF:'strainer',RV:'relief',RF:'rfilter',CO:'cooler',BR:'breather',TK:'baffle'}[id];if(m){P[m]=!P[m];APP.changed(true);return true;}},
  step(P,st,dt,ctx){const f=ctx.fault;const acc=dt*P.acc;
    const pr=P.relief?P.pr:400;const cL=.03*P.Q/100*(1+st.wear);const r=PB.solve({Qth:P.Q,cL,k:PB.kOf(P.load),pr});
    const kc=P.cooler&&f!=='fan'?.06*P.Q/30:0;const Ploss=H.kW(r.p,P.Q)*.25+H.kW(r.p,r.Q)*.6+H.kW(r.p,r.Qr+r.QL);
    st.T+=(Ploss-kc*(st.T-25)-.004*P.V/120*(st.T-25))/(P.V*.8)*acc;st.T=clamp(st.T,10,130);
    const resid=P.V/P.Q;const sep=(P.baffle?1:.25)*clamp(resid/3,.2,1.5);st.air+=(.004*P.Q/30*(P.baffle?.4:1)-st.air*.06*sep)*acc;st.air=clamp(st.air,0,.25);
    const ingress=(P.breather?.002:.03)+(f==='bypass'?0:0);const gen=.004*(1+(st.T>70?1:0));const filt=(P.rfilter&&f!=='bypass'?.05:0)+(P.strainer?.008:0);st.c+=(ingress+gen-filt*(st.c-12)/10)*acc;st.c=clamp(st.c,10,26);
    st.wear+=((P.strainer?0:.0006)+(st.c>20?.0004:0)+(st.T>80?.0003:0))*acc;st.wear=clamp(st.wear,0,3);
    const strDp=P.strainer?(f==='strainer'?.55:.05):0;const tankP=f==='breather'||!P.breather?(f==='breather'?-.25:0):0;const pIn=tankP-strDp-.04-st.air*.5;
    if(f==='breather'&&P.breather)st.tank=Math.min(.3,st.tank+.02*dt);KIT.rpmAng(st,dt,1450);const pm=KIT.nice(pr*1.05);
    return {p:{S:pIn,P:r.p,T:.4,A:0},q:{LS:P.Q,LS2:P.Q,LP:r.Q+r.Qr,LR:r.Qr,LRT:r.Qr,LT1:r.Q,LT2:r.Q,LT3:r.Q},pmax:pm,qref:P.Q,vac:pIn<-.2,r,T:st.T,air:st.air,cl:st.c,wear:st.wear,pIn,Ploss,kc,
      c:{TK:{baffle:P.baffle,level:.7-st.air*.4,air:st.air,dirty:clamp((st.c-17)/6,0,1)},P1:{on:true,ang:st.ang},RV:{open:clamp(r.Qr/P.Q,0,1)},LV:{knob:P.load},CO:{ang:st.ang*3,off:f==='fan'},BR:{}},
      read:[{k:'טמפרטורת שמן',v:st.T,u:'°C',max:100,w:st.T>65},{k:'אוויר בשמן',v:st.air*100,u:'%',max:10,w:st.air>.03},{k:'קוד ניקיון (ISO, קירוב)',v:st.c,u:'',dg:0,max:26,w:st.c>19},{k:'שחיקת משאבה',v:st.wear*33,u:'%',max:100,w:st.wear>.5},{k:'לחץ ביניקה',v:pIn,u:'bar',w:pIn<-.2},{k:'לחץ עבודה',v:r.p,u:'bar'}]};},
  ins(P,R){const L=[];HPU_PARTS.forEach(([k,t,why])=>{if(!P[k])L.push({ic:'🧩',w:true,h:`<b>${t} מפורק</b>: ${why}`});});
    if(R.T>65)L.push({ic:'🌡️',w:true,at:P.cooler?'CO':'TK',h:`השמן מגיע ל-${fmt(R.T,0)} °C. מעל ~60 °C השמן מזדקן והאטמים נפגעים.`,c:'השמן חם מדי'});
    if(R.air>.03)L.push({ic:'🫧',w:true,at:'TK',h:`אוויר ${fmt(R.air*100,1)}% – בלי מחיצה השמן החוזר נשאב מיד, לפני שהבועות עולות.`,c:'אוויר בשמן'});
    if(R.cl>19)L.push({ic:'🟤',w:true,at:'TK',h:`השמן מתלכלך (קוד ${fmt(R.cl,0)}). חלקיקים שוחקים את המשאבה והשסתומים.`,c:'שמן מלוכלך'});
    if(!L.length)L.push({ic:'✅',h:`היחידה שלמה: טמפרטורה ${fmt(R.T,0)} °C, קוד ניקיון ${fmt(R.cl,0)}, אוויר ${fmt(R.air*100,1)}%. נפח המיכל ${fmt(P.V,0)} L – פי ${fmt(P.V/P.Q,1)} מהספיקה לדקה (מומלץ פי 3 עד 5).`});
    L.push({ic:'⏱️',h:'הזמן ביחידה זו מואץ פי 120 – כל שנייה היא שתי דקות עבודה.'});return L;},
  calc(P,R){return `<div class="kpis">${kpi('הפסדי חום',fmt(R.Ploss,2),'kW')}${kpi('קירור',fmt(R.kc*(R.T-25),2),'kW')}${kpi('נפח/ספיקה',fmt(P.V/P.Q,1),'min')}${kpi('טמפרטורה',fmt(R.T,1),'°C')}</div>`+
    det('גודל מיכל',row('כלל אצבע',`V ≈ 3–5 × Q = ${fmt(3*P.Q,0)}–${fmt(5*P.Q,0)} L`)+row('בפועל',`V = ${P.V} L`,P.V>=3*P.Q),true)+det('מאזן חום',row('',`dT/dt = (P_loss − P_cool)/(m·c)`)+row('',`P_loss = ${V(R.Ploss,'kW')} · P_cool = k·(T − 25) = ${V(R.kc*(R.T-25),'kW')}`));},
  demo:[{t:'יחידת כוח הידראולית',x:'מיכל, משאבה עם מנוע (מחוברים במצמד ובפעמון), שסתום פריקה, מסנני יניקה וחזרה, מקרר ומסנן אוורור. הזמן מואץ פי 120.',reset:true,hl:['TK','P1']},
    {t:'בלי מחיצה',x:'מוציאים את המחיצה: השמן החוזר מגיע מיד ליניקה – אוויר וחום לא מספיקים להיפרד.',set:{baffle:false},hl:['TK'],dur:9},
    {t:'בלי מקרר',x:'מוציאים את המקרר: ההפסדים מחממים את השמן בלי הפסקה.',set:{baffle:true,cooler:false},hl:['TK'],dur:10},
    {t:'בלי מסנן חזרה',x:'החלקיקים שנוצרים במערכת לא מסוננים – קוד הניקיון עולה והמשאבה נשחקת.',set:{cooler:true,rfilter:false},hl:['TK'],dur:10}],
  predict:[{q:'מפרקים את מקרר השמן. מה יקרה לטמפרטורה?',set:{cooler:false},dur:6,opts:['תישאר','תעלה בהדרגה','תרד'],a:1,why:'החום מההפסדים נשאר במערכת.'},
    {q:'מוציאים את המחיצה. מה יעלה?',set:{baffle:false},dur:6,opts:['האוויר בשמן','לחץ העבודה'],a:0,why:'השמן החוזר נשאב מיד, לפני שהבועות עולות.'}],
  tasks:[{q:P=>`ספיקה ${P.Q} L/min. מה נפח המיכל המינימלי לפי 3×Q?`,a:P=>3*P.Q,u:'L',hint:'V ≈ 3–5 × Q.',rand:P=>{P.Q=rnd(10,120,5);}},
    {q:P=>`משאבה ${P.Q} L/min עובדת בשסתום הפריקה 120 bar בלי צרכן. כמה kW חום?`,a:P=>120*P.Q/600,u:'kW',hint:'P = p·Q/600.',rand:P=>{P.Q=rnd(10,80,5);}}],
  faults:[{id:'strainer',t:'מסנן יניקה סתום',sym:'"המשאבה מרעישה ושומעים \'חצץ\'."',hint:'לחץ ביניקה.',why:'מפל לחץ גבוה על המסנן – קוויטציה.',set:{}},
    {id:'fan',t:'מאוורר המקרר לא עובד',sym:'"אחרי שעה השמן חם מאוד."',hint:'האם המקרר מפנה חום?',why:'המאוורר תקוע – המקרר כמעט לא מקרר.',set:{}},
    {id:'breather',t:'מסנן אוורור סתום',sym:'"כשהצילינדרים יוצאים, המשאבה מרעישה."',hint:'לחץ ביניקה.',why:'המיכל נכנס לתת-לחץ – הלחץ ביניקה יורד.',set:{}},
    {id:'bypass',t:'עוקף מסנן החזרה תקוע פתוח',sym:'"השמן מתלכלך למרות שהמסנן חדש."',hint:'קוד הניקיון.',why:'השמן עוקף את המסנן.',set:{}}],
  qaT:8,
  test(H){const P=clone(this.P);const R=this.step(P,this.init(P),0,{});return [['רציפות',R.r.Q+R.r.QL+R.r.Qr,P.Q,.002],['UI לחץ',R.read[5].v,R.r.p]];}};

LABS.push({ch:5,title:'יחידת כוח הידראולית ומשאבות',sims:[SIM_HPU,SIM_GEAR,SIM_VANE,SIM_AXIAL,SIM_CURVE,SIM_COMP,SIM_JACK]});
}
