/* lab 25 – same code as the website */
{




/* ===================== Chapter 25 – measurements and calculations: virtual test bench (64) ===================== */
/* One bench, four devices under test: pump (Q–p, efficiencies), relief valve (p–Q, override), throttle / flow control (Q–Δp), directional valve (Δp–Q).
   A sweep moves the operating point; every 5% a reading is logged with small instrument noise. The drawer fits the data like a lab report. */
/* chart with dot series (measured points): same look as the platform chart, up to 6 series; q.dots → round markers */
SYM.chartd={ports:SYM.chart.ports,bb:SYM.chart.bb,
  draw(g,o){const w=o.w||120,h=o.h||80,x0=-w/2,y0=h/2;sv('rect',{x:x0,y:-h/2,width:w,height:h,fill:'#fff',stroke:'#cbd5e1','stroke-width':.8},g);
    for(let k=1;k<4;k++){SL(g,x0+w*k/4,-h/2,x0+w*k/4,h/2,'sy drn');SL(g,x0,-h/2+h*k/4,x0+w,-h/2+h*k/4,'sy drn');}
    g.querySelectorAll('line').forEach(l=>{l.style.stroke='#e2e8f0';});
    SL(g,x0,y0,x0+w,y0,'sy thin');SL(g,x0,y0,x0,-h/2,'sy thin');
    if(o.t)ST(g,0,-h/2-4,o.t,'st s');const xl=ST(g,x0+w,y0+11,o.xl||'','st s');xl.setAttribute('text-anchor','end');const yl=ST(g,x0-3,-h/2-4,o.yl||'','st s');yl.setAttribute('text-anchor','start');
    const tx0=ST(g,x0,y0+11,'','st s'),tx1=ST(g,x0+w-28,y0+11,'','st s'),ty1=ST(g,x0-3,-h/2+7,'','st s');tx0.setAttribute('text-anchor','start');ty1.setAttribute('text-anchor','end');
    const paths=[0,1,2,3,4,5].map(()=>sv('path',{fill:'none','stroke-width':1.8,'stroke-linejoin':'round','stroke-linecap':'round'},g));
    const mk=sv('circle',{r:3.6,fill:'none',stroke:'#0f172a','stroke-width':1.2},g);let last='';
    return cs=>{if(!cs)return;const X=cs.x||o.x||[0,1],Y=cs.y||o.y||[0,1];const fx=v=>x0+w*clamp((v-X[0])/(X[1]-X[0]||1),-.02,1.02),fy=v=>y0-h*clamp((v-Y[0])/(Y[1]-Y[0]||1),-.02,1.04);
      const key=JSON.stringify([cs.s&&cs.s.map(q=>q.p.length+':'+(q.p.at(-1)||[]).join()),X,Y]);if(key!==last){last=key;
        (cs.s||[]).forEach((q,k)=>{if(!paths[k])return;const P=q.p.filter(a=>isFinite(a[0])&&isFinite(a[1]));
          paths[k].setAttribute('d',!P.length?'':q.dots?P.map(a=>`M${fx(a[0]).toFixed(1)},${fy(a[1]).toFixed(1)}h0`).join(''):'M'+P.map(a=>fx(a[0]).toFixed(1)+','+fy(a[1]).toFixed(1)).join(' L'));
          paths[k].setAttribute('stroke',q.c||'#0b72d9');paths[k].setAttribute('stroke-width',q.dots?4.6:1.8);paths[k].setAttribute('stroke-dasharray',q.d?'4 3':'');});
        for(let k=(cs.s||[]).length;k<6;k++)paths[k].setAttribute('d','');tx0.textContent=fmt(X[0],1);tx1.textContent=fmt(X[1],1);ty1.textContent=fmt(Y[1],1);}
      if(cs.m&&isFinite(cs.m[0])&&isFinite(cs.m[1])){mk.style.display='';mk.setAttribute('cx',fx(cs.m[0]));mk.setAttribute('cy',fy(cs.m[1]));}else mk.style.display='none';};}};
B3.chartd=()=>({g:new THREE.Group()});
const C25_DUT=[['pump','משאבה'],['relief','שסתום פריקה'],['throttle','צמצם'],['dcv','4/3']];
const C25_NAME={pump:'משאבת גלגלי שיניים',relief:'שסתום פריקה',throttle:'צמצם / ווסת זרימה',dcv:'שסתום פיקוד 4/3'};
const c25Noise=(i,seed)=>{const x=Math.sin(i*91.7+seed*7.31)*43758.5453;return (x-Math.floor(x)-.5)*2;};
/* one measured point at sweep position s (0..1); f = seeded fault id */
function c25Meas(P,f,s,i){const nz=k=>1+.006*c25Noise(i,k);
  if(P.dut==='pump'){const Qth=P.Vg*P.n/1000;const Cs=(f==='wornpump'?4:1)*P.lk/100;const p=s*P.pmax;const Q=Math.max(Qth-Cs*p,0);const T=p*P.Vg/(20*PI)+P.t0+.004*p;
    const Qm=Q*(f==='fmcal'?1.1:1)*nz(1),pm=p*nz(2),Tm=T*nz(3);const ev=Qm/Qth,ehm=pm>0?pm*P.Vg/(20*PI)/Tm:0;return {s,p,Q,T,pm,Qm,Tm,ev,ehm,et:ev*ehm,x:pm,y:Qm,Qth};}
  if(P.dut==='relief'){const Qn=40;const ov=(P.rk==='pilot'?.05:.2)*P.pc;let pc=P.pc-ov;if(f==='reltired')pc*=.7;const Q=s*P.Qmax;
    let p=Q<.02?pc*Math.min(1,s*400):pc+(P.pc-(P.pc-ov))*Q/Qn;if(f==='reltired')p=pc+ov*Q/Qn;if(f==='relstick'&&Q>.02)p*=1+.09*Math.sin(i*2.1);
    const pm=p*nz(2),Qm=Q*nz(1);return {s,p,Q,pm,Qm,pc,ov,Pl:pm*Qm/600,x:Qm,y:pm};}
  if(P.dut==='throttle'){const k=H.orK(P.A0)*(f==='needle'?.6:1);const dp=s*P.pmax;let Q=k*Math.sqrt(dp);if(P.comp)Q=Math.min(P.Qset*Math.sqrt(Math.min(dp,8)/8),P.Qset)*(f==='needle'?.6:1);
    const dpm=dp*nz(2),Qm=Q*nz(1);return {s,dp,Q,dpm,Qm,k,km:dpm>.5?Qm/Math.sqrt(dpm):null,x:dpm,y:Qm};}
  /* dcv: P→A and B→T in series through an A–B loop; Δp_n = 5 bar per path at Q_n */
  const kPA=P.Qn/Math.sqrt(5),kBT=kPA*1.15;const Q=s*P.Qmax;const leak=f==='dcvwear'?Math.min(Q,.35*Q+2*s):0;const Qa=Q-leak;
  const dPA=(Q/kPA)**2,dBT=(Qa/kBT)**2;const off=f==='gauge'?8:0;const p1m=(dPA+dBT)*nz(2)+off,pAm=dBT*nz(3);const Qm=Q*nz(1);
  return {s,Q,Qa,dPA,dBT,p1m,pAm,Qm,dPAm:p1m-pAm,dBTm:pAm,Pl:(dPA+dBT)*Q/600,x:Qm,y:p1m-pAm,y2:pAm,kPA,kBT};}
function c25Circuit(P){const d=P.dut;const comps=[{id:'P1',type:'pump',x:200,y:300,o:{var:d!=='pump'},name:d==='pump'?'המשאבה הנבדקת (מנוע במהירות קבועה)':'משאבת הספסל – מהירות משתנה (ממיר תדר)',lbl:d==='pump'?'משאבה נבדקת':'משאבת ספסל',lblAt:[52,6]},
    {id:'T1',type:'tank',x:200,y:345,name:'מיכל'},
    {id:'RV0',type:'pv',x:130,y:272,rot:-90,o:{kind:'relief'},name:d==='throttle'?'שסתום הפריקה של הספסל – כאן קובעים את לחץ האספקה':'שסתום הפריקה של הספסל (הגנה, מכויל גבוה)',lbl:d==='throttle'?'קובע p₁':'שסתום פריקה ספסל',lblAt:[0,-28]},{id:'T3',type:'tank',x:90,y:306,name:'מיכל'},
    {id:'G1',type:'gauge',x:250,y:195,net:'P',name:'מד לחץ p₁ (כניסה)',o:{max:250},val:R=>`p₁ ${fmt(R.g1,1)} bar`,valAt:[18,-4]},
    {id:'CH1',type:'chartd',x:440,y:70,o:{w:170,h:90,t:{pump:'Q מול p (נקודות = מדידה)',relief:'p מול Q – אופיין שסתום הפריקה',throttle:'Q מול Δp',dcv:'Δp: P→A אדום · B→T כחול'}[d],xl:{pump:'p [bar]',relief:'Q [L/min]',throttle:'Δp [bar]',dcv:'Q [L/min]'}[d],yl:{pump:'L/min',relief:'bar',throttle:'L/min',dcv:'bar'}[d]},name:'אופיין נמדד מול תאורטי'},
    {id:'CH2',type:'chartd',x:440,y:240,o:{w:170,h:90,t:{pump:'η_v כחול · η_hm כתום · η_t ירוק',relief:'הספק שהופך לחום',throttle:'k = Q/√Δp',dcv:'הספק אבוד בשסתום'}[d],xl:{pump:'p [bar]',relief:'Q [L/min]',throttle:'Δp [bar]',dcv:'Q [L/min]'}[d],yl:{pump:'%',relief:'kW',throttle:'k',dcv:'kW'}[d]},name:'גודל מחושב מהמדידות'}];
  const lines=[{id:'LS',net:'S',pts:['T1.t','P1.in']},{id:'LRV',net:'P',pts:[[200,272],[146,272],'RV0.P']},{id:'LRT',net:'T',pts:['RV0.T',[90,272],'T3.t']},{id:'LG1',net:'P',pts:['G1.p',[250,215],[200,215]]}];
  if(d==='pump')comps.push({id:'TM',type:'box',x:118,y:338,o:{w:70,h:16,t:'מד מומנט + סל״ד'},name:'מד מומנט וסל״ד על הציר – למדידת הספק מכני'});
  if(d==='dcv'){comps.push({id:'V1',type:'dcv',x:200,y:150,o:{box:KIT.D43.closed,L:'sol',R:'sol',center:true},name:'שסתום הפיקוד הנבדק – במצב a (P→A, B→T)',lbl:'נבדק',lblAt:[0,36]},
      {id:'FM',type:'flowm',x:200,y:245,name:'מד ספיקה',val:R=>`${fmt(R.m.Qm,1)} L/min`},{id:'G2',type:'gauge',x:120,y:75,net:'A',name:'מד לחץ בלולאה A–B',val:R=>`p_A ${fmt(R.m.pAm,1)}`,valAt:[-20,-14]},{id:'T2',type:'tank',x:300,y:215,name:'מיכל'});
    lines.push({id:'LP1',net:'P',pts:['P1.out','FM.in']},{id:'LP2',net:'P',pts:['FM.out',[200,205],[193,205],'V1.P']},{id:'LA',net:'A',pts:['V1.A',[193,95],[150,95],[150,60],[250,60],[250,95],[207,95],'V1.B']},
      {id:'LG2',net:'A',pts:['G2.p',[120,95],[150,95]]},{id:'LT',net:'T',pts:['V1.T',[207,190],[300,190],'T2.t']});}
  else{const dut=d==='pump'?{id:'DUT',type:'throttle',x:200,y:150,o:{adj:true},name:'שסתום עומס – נסגר בהדרגה ומעלה את הלחץ',lbl:'עומס',lblAt:[-30,0]}:
      d==='relief'?{id:'DUT',type:'pv',x:200,y:150,o:{kind:'relief'},name:'שסתום הפריקה הנבדק',lbl:'נבדק',lblAt:[-30,-22]}:
      P.comp?{id:'DUT',type:'fcv',x:200,y:150,name:'ווסת זרימה מפוצה לחץ – נבדק',lbl:'נבדק',lblAt:[-30,0]}:{id:'DUT',type:'throttle',x:200,y:150,o:{adj:true},name:'צמצם מחט – נבדק',lbl:'נבדק',lblAt:[-30,0]};
    comps.push(dut,{id:'FM',type:'flowm',x:300,y:150,rot:180,name:'מד ספיקה (אחרי הרכיב)',val:R=>`${fmt(R.m.Qm??R.m.Qm,1)} L/min`,valAt:[22,0]},{id:'T2',type:'tank',x:300,y:190,name:'מיכל'},
      {id:'G2',type:'gauge',x:250,y:80,net:'O',name:'מד לחץ p₂ (יציאה)'});
    lines.push({id:'LP',net:'P',pts:['P1.out','DUT.in']},{id:'LO',net:'O',pts:['DUT.out',[200,100],[300,100],'FM.in']},{id:'LO2',net:'T',pts:['FM.out','T2.t']},{id:'LG2',net:'O',pts:['G2.p',[250,100]]});}
  return {comps,lines};}
const C25_BENCH={id:'bench',n:64,t:'ספסל בדיקות וירטואלי',d:'סורקים נקודת עבודה, רושמים מדידות ומשווים לאופיין: משאבה, שסתום פריקה, צמצם ושסתום פיקוד',
  P:{dut:'pump',auto:true,s:50,clr:0,Vg:16,n:1450,lk:2,t0:1.2,pmax:200,pc:100,rk:'direct',Qmax:40,A0:4,comp:false,Qset:10,Qn:40},
  key:P=>P.dut+(P.comp?'c':''),
  ui(U,P){U.grp('רכיב בבדיקה');U.seg(P,'dut','רכיב',C25_DUT.map(([k,t])=>[k,t,C25_NAME[k]]),true);
    if(P.dut==='pump'){U.num(P,'Vg','נפח סגולי Vg','cm³',{min:2,max:100,step:.5});U.num(P,'n','מהירות סיבוב','rpm',{min:500,max:3000,step:50});U.num(P,'lk','דליפה ב-100 bar','L/min',{min:0,max:20,step:.5});U.num(P,'pmax','לחץ מרבי בסריקה','bar',{min:20,max:350,step:10});}
    if(P.dut==='relief'){U.seg(P,'rk','סוג',[['direct','ישיר','פעולה ישירה – קפיץ על הפופט'],['pilot','פיקוד','מפוקד – עליית לחץ קטנה מעל לחץ הפתיחה']]);U.num(P,'pc','כיול (בספיקה נומינלית)','bar',{min:20,max:315,step:5});U.num(P,'Qmax','ספיקה מרבית בסריקה','L/min',{min:5,max:80,step:5});}
    if(P.dut==='throttle'){U.chk(P,'comp','ווסת זרימה מפוצה לחץ',true);if(P.comp)U.num(P,'Qset','ספיקה מכוונת','L/min',{min:1,max:40,step:1});else U.num(P,'A0','שטח פתח המחט','mm²',{min:.5,max:30,step:.5});U.num(P,'pmax','Δp מרבי בסריקה','bar',{min:10,max:250,step:10});}
    if(P.dut==='dcv'){U.num(P,'Qn','ספיקה נומינלית (Δp = 5 bar)','L/min',{min:10,max:200,step:5});U.num(P,'Qmax','ספיקה מרבית בסריקה','L/min',{min:5,max:200,step:5});}
    U.grp('מדידה');U.chk(P,'auto','סריקה אוטומטית');U.num(P,'s','נקודת עבודה (ידני)','%',{min:0,max:100,step:5});U.btn('🗑 ניקוי הנקודות',()=>{P.clr=(P.clr||0)+1;});},
  circuit:P=>c25Circuit(P),
  init:P=>({s:0,pts:{},sig:'',hold:0,t:0}),
  step(P,st,dt,ctx){const f=ctx.fault;st.t+=dt;const ud=P.dut+P.comp;if(st.ud!==ud){if(st.ud!=null&&typeof buildPanel==='function')setTimeout(buildPanel,0);st.ud=ud;}
    const sig=JSON.stringify([P.dut,P.Vg,P.n,P.lk,P.t0,P.pmax,P.pc,P.rk,P.Qmax,P.A0,P.comp,P.Qset,P.Qn,P.clr,f]);if(sig!==st.sig){st.sig=sig;st.pts={};st.s=0;st.hold=0;}
    if(P.auto){if(st.s>=1){st.hold+=dt;if(st.hold>2){st.s=0;st.hold=0;st.pts={};}}else st.s=Math.min(1,st.s+dt/8);}else st.s=P.s/100;
    const i=Math.round(st.s*20);if(Math.abs(st.s*20-i)<.2&&!st.pts[i])st.pts[i]=c25Meas(P,f,i/20,i);
    const m=c25Meas(P,f,st.s,Math.round(st.s*97));const pts=Object.keys(st.pts).map(Number).sort((a,b)=>a-b).map(k=>st.pts[k]);
    const th=[];for(let k=0;k<=40;k++)th.push(c25Meas(P,null,k/40,0));const thx=th.map(o=>{const c=Object.assign({},o);return c;});
    let p1=1,pO=1,pA=0,Qp=0,Qr=0,Qd=0,c={};const pm=KIT.nice(Math.max(P.pmax||0,P.pc||0,40)*1.1);
    const pt=(a,k1,k2)=>a.map(o=>[o[k1],o[k2]]);let CH1,CH2,read=[];
    if(P.dut==='pump'){const Qth=P.Vg*P.n/1000;p1=m.p+1;Qp=m.Q;Qd=m.Q;const qm=KIT.nice(Qth*1.15);
      CH1={x:[0,P.pmax],y:[0,qm],s:[{p:th.map(o=>[o.p,o.Q]),c:'#94a3b8',d:true},{p:pt(pts,'pm','Qm'),c:'#dc2626',dots:true}],m:[m.pm,m.Qm]};
      CH2={x:[0,P.pmax],y:[0,110],s:[{p:pts.filter(o=>o.p>1).map(o=>[o.pm,o.ev*100]),c:'#2563eb'},{p:pts.filter(o=>o.p>1).map(o=>[o.pm,o.ehm*100]),c:'#f59e0b'},{p:pts.filter(o=>o.p>1).map(o=>[o.pm,o.et*100]),c:'#16a34a'},{p:[[0,100],[P.pmax,100]],c:'#cbd5e1',d:true}]};
      c={P1:{on:true,ang:KIT.rpmAng(st,dt,P.n)},DUT:{open:1-st.s},RV0:{open:0}};
      read=[{k:'לחץ p₁',v:m.pm,u:'bar',max:pm},{k:'ספיקה Q',v:m.Qm,u:'L/min',max:qm},{k:'מומנט',v:m.Tm,u:'N·m'},{k:'נצילות נפחית',v:m.ev*100,u:'%',dg:1,max:100},{k:'נצילות כוללת',v:m.et*100,u:'%',dg:1,max:100}];}
    else if(P.dut==='relief'){p1=m.p;Qp=m.Q;Qd=m.Q;const ym=Math.ceil(P.pc*1.2/10)*10;
      CH1={x:[0,P.Qmax],y:[0,ym],s:[{p:th.filter(o=>o.Q>.02).map(o=>[o.Q,o.p]),c:'#94a3b8',d:true},{p:pt(pts,'Qm','pm'),c:'#dc2626',dots:true},{p:[[0,P.pc],[P.Qmax,P.pc]],c:'#f59e0b',d:true}],m:[m.Qm,m.pm]};
      CH2={x:[0,P.Qmax],y:[0,KIT.nice(P.pc*1.3*P.Qmax/600)],s:[{p:pts.map(o=>[o.Qm,o.Pl]),c:'#dc2626'}]};
      c={P1:{on:true,ang:KIT.rpmAng(st,dt,300+1200*st.s)},DUT:{open:clamp(m.Q/P.Qmax,0,1)},RV0:{open:0}};
      read=[{k:'ספיקה Q',v:m.Qm,u:'L/min',max:P.Qmax},{k:'לחץ p₁',v:m.pm,u:'bar',max:pm},{k:'Cracking',v:pts.length?(pts.find(o=>o.Q>.02)||{}).pm??0:0,u:'bar'},{k:'הספק → חום',v:m.Pl,u:'kW',dg:2}];}
    else if(P.dut==='throttle'){p1=m.dp+1;const Qb=Math.max(60,(m.Q||0)*1.3);Qp=Qb;Qd=m.Q;Qr=Qb-m.Q;const qm=KIT.nice(Math.max(...th.map(o=>o.Q),1)*1.15);
      CH1={x:[0,P.pmax],y:[0,qm],s:[{p:th.map(o=>[o.dp,o.Q]),c:'#94a3b8',d:true},{p:pt(pts,'dpm','Qm'),c:'#dc2626',dots:true}],m:[m.dpm,m.Qm]};
      const km=Math.max(...th.filter(o=>o.dp>.5).map(o=>o.Q/Math.sqrt(o.dp)),.1);
      CH2={x:[0,P.pmax],y:[0,KIT.nice(km*1.3)],s:[{p:pts.filter(o=>o.km!=null).map(o=>[o.dpm,o.km]),c:'#7c3aed'}]};
      c={P1:{on:true,ang:KIT.rpmAng(st,dt,1450)},RV0:{open:clamp(Qr/Qb,0,1)}};
      read=[{k:'Δp על הרכיב',v:m.dpm,u:'bar',max:pm},{k:'ספיקה Q',v:m.Qm,u:'L/min',max:qm},{k:'k = Q/√Δp',v:m.km??0,u:'',dg:2}];}
    else{p1=m.dPA+m.dBT+.5;pA=m.dBT+.5;Qp=m.Q;Qd=m.Q;const ym=KIT.nice(Math.max((P.Qmax/m.kPA)**2,1)*1.15);
      CH1={x:[0,P.Qmax],y:[0,ym],s:[{p:th.map(o=>[o.Q,o.dPA]),c:'#fca5a5',d:true},{p:th.map(o=>[o.Q,o.dBT]),c:'#93c5fd',d:true},{p:pt(pts,'Qm','dPAm'),c:'#dc2626',dots:true},{p:pt(pts,'Qm','dBTm'),c:'#2563eb',dots:true}],m:[m.Qm,m.dPAm]};
      CH2={x:[0,P.Qmax],y:[0,KIT.nice(Math.max(th.at(-1).Pl,.05)*1.2)],s:[{p:pts.map(o=>[o.Qm,(o.dPAm+o.dBTm)*o.Qm/600]),c:'#dc2626'}]};
      c={P1:{on:true,ang:KIT.rpmAng(st,dt,300+1200*st.s)},V1:{i:0},RV0:{open:0}};
      read=[{k:'ספיקה Q',v:m.Qm,u:'L/min',max:P.Qmax},{k:'Δp P→A',v:m.dPAm,u:'bar',dg:2},{k:'Δp B→T',v:m.dBTm,u:'bar',dg:2},{k:'הספק אבוד',v:(m.dPAm+m.dBTm)*m.Qm/600,u:'kW',dg:2}];}
    read.push({k:'נקודות שנרשמו',v:pts.length,u:'/21',dg:0,max:21});
    c.CH1=CH1;c.CH2=CH2;c.FM={u:Qd/Math.max(Qp,1)};
    const g1=P.dut==='pump'?m.pm+1:P.dut==='relief'?m.pm:P.dut==='throttle'?m.dpm+1:m.p1m+.5;
    const q=P.dut==='dcv'?{LS:Qp,LP1:Qp,LP2:Qp,LA:m.Qa,LT:Qp,LRV:0,LRT:0,LG1:0,LG2:0}:{LS:Qp,LP:Qd,LO:Qd,LO2:Qd,LRV:Qr,LRT:Qr,LG1:0,LG2:0};
    return {p:{S:-.05,P:p1,O:pO,A:pA,T:.3},q,pmax:pm,qref:Math.max(Qp,10),c,m,pts,g1,f,read};},
  ins(P,R){const L=[];const pts=R.pts;const n=pts.length;
    if(n<3)L.push({ic:'📋',h:`הסריקה רושמת נקודה כל 5% (${n}/21). כל נקודה = קריאה של המדים עם רעש מכשיר קטן – כמו בבדיקה אמיתית.`});
    if(P.dut==='pump'){const Qth=P.Vg*P.n/1000;const last=pts.at(-1);
      L.push({ic:'⚙️',at:'P1',h:`ספיקה תאורטית Q_th = Vg·n = ${P.Vg}·${P.n}/1000 = <b>${fmt(Qth,1)} L/min</b>. ככל שהלחץ עולה – הדליפה הפנימית גדלה והספיקה יורדת.`});
      if(last&&last.p>P.pmax*.5)L.push({ic:'📉',at:'CH2',h:`ב-${fmt(last.pm,0)} bar: η_v = <b>${fmt(last.ev*100,1)}%</b>, η_hm = ${fmt(last.ehm*100,1)}%, η_t = <b>${fmt(last.et*100,1)}%</b>.`});
      if(pts.some(o=>o.ev>1.02))L.push({ic:'⚠️',w:true,at:'FM',h:'נצילות נפחית מעל 100% – זה בלתי אפשרי! מכשיר המדידה (מד הספיקה) לא מכויל.',c:'η_v > 100%?'});}
    if(P.dut==='relief'){const cr=pts.find(o=>o.Q>.02);const lastp=pts.at(-1);
      L.push({ic:'🔧',at:'DUT',h:`${P.rk==='pilot'?'שסתום מפוקד: הפופט הראשי נפתח כמעט בבת אחת – עליית לחץ קטנה מעל לחץ הפתיחה (~5%).':'שסתום ישיר: הקפיץ נדחס יותר ככל שהספיקה גדלה – עליית לחץ גדולה מעל לחץ הפתיחה (~20%).'}`});
      if(cr&&lastp&&lastp.Q>P.Qmax*.8)L.push({ic:'📏',at:'CH1',h:`Cracking ≈ <b>${fmt(cr.pm,0)}</b> bar, ב-${fmt(lastp.Qm,0)} L/min: <b>${fmt(lastp.pm,0)}</b> bar ⇒ עליית הלחץ מעל לחץ הפתיחה ≈ ${fmt(lastp.pm-cr.pm,0)} bar.`});
      if(R.f==='relstick'&&n>4)L.push({ic:'〰️',w:true,at:'CH1',h:'הנקודות מפוזרות סביב האופיין – הפופט "קופץ" (רטט/הידבקות).',c:'פיזור גדול'});}
    if(P.dut==='throttle'){L.push({ic:'💧',at:'DUT',h:P.comp?`ווסת זרימה מפוצה לחץ: מעל Δp ≈ 8 bar הספיקה קבועה (${P.Qset} L/min) – הקו שטוח, k יורד.`:`צמצם: Q = k·√Δp, k = ${fmt(H.orK(P.A0),2)} L/min/√bar. פי 4 לחץ ⇒ פי 2 ספיקה.`});
      const ks=pts.filter(o=>o.km!=null).map(o=>o.km);if(ks.length>3&&!P.comp)L.push({ic:'📐',at:'CH2',h:`k נמדד ≈ <b>${fmt(ks.reduce((a,b)=>a+b,0)/ks.length,2)}</b> (תאורטי ${fmt(H.orK(P.A0),2)}).`});}
    if(P.dut==='dcv'){L.push({ic:'🔀',at:'V1',h:`Δp ∝ Q²: בספיקה נומינלית ${P.Qn} L/min – 5 bar לכל מעבר. פי 2 ספיקה ⇒ פי 4 מפל לחץ.`});
      const z=pts.find(o=>o.Q<.01);if(z&&z.dPAm>2)L.push({ic:'⚠️',w:true,at:'G1',h:`בספיקה 0 המד מראה ${fmt(z.p1m,1)} bar – אמור להיות 0! למד הלחץ יש היסט אפס.`,c:'היסט אפס'});}
    return L;},
  calc(P,R){const pts=R.pts;const tbl=(hd,rows)=>`<table style="width:100%;font:11px var(--fm);direction:ltr;border-collapse:collapse">${'<tr>'+hd.map(h=>`<th style="border-bottom:1px solid #cbd5e1;text-align:right">${h}</th>`).join('')+'</tr>'}${rows.map(r=>'<tr>'+r.map(v=>`<td style="text-align:right">${v}</td>`).join('')+'</tr>').join('')}</table>`;
    const fitLin=(xs,ys)=>{const n=xs.length;if(n<2)return [0,0];const mx=xs.reduce((a,b)=>a+b,0)/n,my=ys.reduce((a,b)=>a+b,0)/n;let sxy=0,sxx=0;for(let i=0;i<n;i++){sxy+=(xs[i]-mx)*(ys[i]-my);sxx+=(xs[i]-mx)**2;}const b=sxx?sxy/sxx:0;return [my-b*mx,b];};
    let h='';
    if(P.dut==='pump'){const [a,b]=fitLin(pts.map(o=>o.pm),pts.map(o=>o.Qm));const Qth=P.Vg*P.n/1000;
      h+=`<div class="kpis">${kpi('Q_th',fmt(Qth,1),'L/min')}${kpi('Q(0) מההתאמה',fmt(a,1),'L/min')}${kpi('מקדם דליפה',fmt(-b,4),'L/min/bar')}${kpi('נקודות',pts.length,'/21')}</div>`+
        det('נוסחאות',row('',`Q_th = Vg·n/1000 ; η_v = Q/Q_th`)+row('',`T_th = p·Vg/(20π) ; η_hm = T_th/T ; η_t = η_v·η_hm`)+row('התאמה ליניארית',`Q = ${fmt(a,2)} − ${fmt(-b,4)}·p`),true)+
        det('טבלת מדידות',tbl(['p bar','Q L/min','T N·m','η_v %','η_t %'],pts.map(o=>[fmt(o.pm,1),fmt(o.Qm,2),fmt(o.Tm,2),fmt(o.ev*100,1),fmt(o.et*100,1)])));}
    else if(P.dut==='relief'){const cr=pts.find(o=>o.Q>.02);const lp=pts.at(-1);
      h+=`<div class="kpis">${kpi('Cracking',cr?fmt(cr.pm,0):'—','bar')}${kpi('p בספיקה מרבית',lp?fmt(lp.pm,0):'—','bar')}${kpi('עליית לחץ מעל הפתיחה',cr&&lp?fmt(lp.pm-cr.pm,0):'—','bar')}${kpi('הספק מרבי',lp?fmt(lp.Pl,2):'—','kW')}</div>`+
        det('נוסחאות',row('',`עליית לחץ = p(Q_max) − p_cracking`)+row('',`P_חום = p·Q/600`),true)+det('טבלת מדידות',tbl(['Q L/min','p bar','P kW'],pts.map(o=>[fmt(o.Qm,2),fmt(o.pm,1),fmt(o.Pl,2)])));}
    else if(P.dut==='throttle'){const ps=pts.filter(o=>o.dp>.5);let num=0,den=0;ps.forEach(o=>{const x=Math.sqrt(o.dpm);num+=x*o.Qm;den+=x*x;});const k=den?num/den:0;
      h+=`<div class="kpis">${kpi('k מההתאמה',fmt(k,3),'L/min/√bar')}${kpi('k תאורטי',P.comp?'—':fmt(H.orK(P.A0),3),'')}${kpi('A₀ מחושב',fmt(k/.637,2),'mm²')}${kpi('נקודות',pts.length,'/21')}</div>`+
        det('נוסחאות',row('',`Q = k·√Δp ; k = 0.637·A₀ (C_d = 0.7)`)+row('התאמה (ריבועים פחותים דרך הראשית)',`k = Σ(√Δp·Q)/Σ(Δp) = ${V(k,'',3)}`),true)+det('טבלת מדידות',tbl(['Δp bar','Q L/min','k'],pts.map(o=>[fmt(o.dpm,1),fmt(o.Qm,2),o.km!=null?fmt(o.km,3):'—'])));}
    else{const ps=pts.filter(o=>o.Q>1);let n1=0,d1=0;ps.forEach(o=>{n1+=o.Qm**2*o.dPAm;d1+=o.Qm**4;});const kfit=n1>0?Math.sqrt(d1/n1):0;
      h+=`<div class="kpis">${kpi('k P→A מההתאמה',fmt(kfit,2),'L/min/√bar')}${kpi('k תאורטי',fmt(P.Qn/Math.sqrt(5),2),'')}${kpi('Δp ב-Q_n',fmt(kfit?(P.Qn/kfit)**2:0,2),'bar')}${kpi('נקודות',pts.length,'/21')}</div>`+
        det('נוסחאות',row('',`Δp = (Q/k)² ; k = Q_n/√5`)+row('',`P_אבוד = (Δp_PA + Δp_BT)·Q/600`),true)+det('טבלת מדידות',tbl(['Q L/min','Δp P→A','Δp B→T'],pts.map(o=>[fmt(o.Qm,2),fmt(o.dPAm,2),fmt(o.dBTm,2)])));}
    return h+'<div class="note">רעש מדידה ±0.6% לכל מכשיר. בבדיקה אמיתית: שמן בטמפרטורה קבועה (40–50°C), מדים מכוילים, וכמה סריקות לממוצע.</div>';},
  demo:[{t:'ספסל בדיקות',x:'מנוע, משאבה, מדי לחץ, מד ספיקה ומד מומנט. סורקים נקודת עבודה ורושמים מדידות – כמו במעבדה.',reset:true,set:{dut:'pump',auto:true},hl:['P1','G1','FM'],dur:6},
    {t:'עקומת משאבה',x:'שסתום העומס נסגר בהדרגה, הלחץ עולה והספיקה יורדת מעט – <b>הדליפה הפנימית</b>. הנקודות האדומות נבנות על הקו התאורטי.',hl:['CH1','DUT'],dur:9},
    {t:'נצילויות',x:'η_v יורדת עם הלחץ; η_hm עולה (החיכוך הקבוע פחות משמעותי). הכוללת מגיעה לשיא באמצע.',hl:['CH2'],dur:6},
    {t:'שסתום פריקה',x:'עכשיו מגדילים ספיקה דרך שסתום פריקה ישיר: הלחץ ממשיך לעלות אחרי הפתיחה – <b>עליית לחץ מעל לחץ הפתיחה</b>.',set:{dut:'relief',rk:'direct'},hl:['DUT','CH1'],dur:10},
    {t:'שסתום פריקה דו-שלבי',x:'אותו כיול – הקו כמעט שטוח. לכן במערכות גדולות משתמשים בפיקוד.',set:{rk:'pilot'},hl:['CH1'],dur:10},
    {t:'צמצם ושסתום פיקוד',x:'בצמצם Q ∝ √Δp, ובשסתום פיקוד Δp ∝ Q². שני צדדים של אותה נוסחת פתח.',set:{dut:'dcv'},hl:['CH1','V1'],dur:10}],
  predict:[{q:'בבדיקת משאבה הלחץ עולה מ-0 ל-200 bar. הספיקה:',set:{dut:'pump',auto:true},opts:['נשארת בדיוק קבועה','יורדת מעט, בקו כמעט ישר','יורדת לאפס'],a:1,dur:9,why:'משאבה קבועה היא מקור ספיקה – רק הדליפה הפנימית (∝ p) מקטינה אותה.'},
    {q:'מגדילים פי 2 את הספיקה דרך שסתום פיקוד. מפל הלחץ יגדל פי:',set:{dut:'dcv',auto:true},opts:['2','4','√2'],a:1,dur:9,why:'Δp = (Q/k)² – פי 2 ספיקה ⇒ פי 4 מפל לחץ, ופי 8 הספק אבוד.'},
    {q:'שסתום פריקה ישיר מכויל ל-100 bar (בספיקה נומינלית). באיזה לחץ הוא מתחיל להיפתח?',set:{dut:'relief',rk:'direct',pc:100,auto:true},opts:['בדיוק 100 bar','פחות מ-100 bar','יותר מ-100 bar'],a:1,dur:10,why:'Cracking נמוך מהכיול: הקפיץ צריך להידחס עוד כדי להעביר את כל הספיקה. ההפרש = עליית הלחץ מעל לחץ הפתיחה (~20 bar בישיר).'}],
  tasks:[{q:P=>`משאבה Vg = ${P.Vg} cm³, n = ${P.n} rpm. מה הספיקה התאורטית? (L/min)`,a:P=>P.Vg*P.n/1000,u:'L/min',hint:'Q = Vg·n/1000.',rand:P=>{P.Vg=pick([8,10,16,25,32]);P.n=pick([1000,1450,1800]);},set:{dut:'pump'}},
    {q:P=>`נמדד Q = ${fmt(P.Vg*P.n/1000*.92,2)} L/min, Q_th = ${fmt(P.Vg*P.n/1000,2)}. מהי הנצילות הנפחית? (%)`,a:P=>92,u:'%',hint:'η_v = Q/Q_th.',rand:P=>{P.Vg=pick([10,16,25]);}},
    {q:P=>`p = ${P.pmax} bar, Vg = ${P.Vg} cm³, מומנט נמדד ${fmt(P.pmax*P.Vg/(20*PI)/.9,1)} N·m. מהי η_hm? (%)`,a:P=>90,u:'%',hint:'T_th = p·Vg/(20π); η_hm = T_th/T.',rand:P=>{P.pmax=rnd(100,250,10);P.Vg=pick([10,16,25]);}},
    {q:P=>`שסתום פיקוד: 5 bar ב-${P.Qn} L/min. מה Δp ב-${P.Qn*1.5} L/min? (bar)`,a:P=>5*2.25,u:'bar',hint:'Δp ∝ Q².',rand:P=>{P.Qn=pick([20,40,60,80]);}},
    {q:P=>`שסתום פריקה: ${P.Qmax} L/min ב-${P.pc} bar. כמה הספק הופך לחום? (kW)`,a:P=>P.pc*P.Qmax/600,u:'kW',hint:'P = p·Q/600.',rand:P=>{P.Qmax=pick([20,30,40,60]);P.pc=rnd(80,250,10);}}],
  faults:[{id:'wornpump',t:'משאבה שחוקה',sym:'"בדיקת קבלה למשאבה משופצת – האם היא תקינה?"',hint:'השוו את שיפוע הנקודות לקו התאורטי (מקווקו).',why:'מקדם הדליפה פי 4 – הספיקה צונחת עם הלחץ, η_v ב-200 bar נמוכה בהרבה מהקטלוג.',set:{dut:'pump'}},
    {id:'fmcal',t:'מד ספיקה לא מכויל (+10%)',sym:'"התוצאות של המשאבה נראות טובות מדי."',hint:'מה הנצילות הנפחית בלחץ נמוך? האם היא אפשרית?',why:'η_v > 100% אינה אפשרית – מכשיר המדידה מראה 10% יותר. מכיילים לפני שמסיקים מסקנות.',set:{dut:'pump'}},
    {id:'reltired',t:'קפיץ עייף בשסתום הפריקה',sym:'"שסתום פריקה חדש-ישן נבדק לפני התקנה."',hint:'השוו את לחץ הפתיחה לכיול (קו כתום).',why:'הקפיץ התעייף – השסתום נפתח ב-70% מהלחץ הצפוי. מחליפים קפיץ ומכיילים.',set:{dut:'relief'}},
    {id:'relstick',t:'פופט נדבק / רוטט',sym:'"השסתום רועש בזמן הבדיקה."',hint:'האם הנקודות יושבות על עקומה חלקה?',why:'הפופט נדבק ומשתחרר – הלחץ קופץ ±9%. מנקים מושב, בודקים בולם (Damping).',set:{dut:'relief',rk:'direct'}},
    {id:'needle',t:'מחט צמצם חסומה חלקית',sym:'"הצמצם מכוון לאותו פתח, אבל המכונה איטית."',hint:'השוו את k הנמדד ל-k התאורטי.',why:'לכלוך מצמצם את הפתח – k נמוך ב-40%. מנקים ומשפרים סינון.',set:{dut:'throttle',comp:false}},
    {id:'gauge',t:'מד לחץ עם היסט אפס',sym:'"מפל הלחץ בשסתום הפיקוד נראה גבוה מהקטלוג."',hint:'מה מראה מד p₁ כשהספיקה אפס?',why:'המד מראה 8 bar כשאין זרימה – היסט אפס. כל Δp P→A גבוה ב-8 bar. מכיילים או מחליפים מד.',set:{dut:'dcv'}},
    {id:'dcvwear',t:'ספול (מגופה) שחוק – דליפה P→T',sym:'"שסתום פיקוד ישן – Δp B→T נמוך מהמצופה."',hint:'השוו את Δp B→T לקו התאורטי. האם כל הספיקה עוברת בלולאה?',why:'חלק מהספיקה עוקף מ-P ישר ל-T דרך מרווח הספול – בלולאה עוברת פחות ספיקה ו-Δp B→T נמוך.',set:{dut:'dcv'}}],
  test(H){const P=clone(this.P);const a=c25Meas(P,null,.5,0);const Qth=16*1.45;
    const P2=clone(this.P);P2.dut='relief';const r1=c25Meas(P2,null,1,0);const P3=clone(this.P);P3.dut='throttle';const t1=c25Meas(P3,null,1,0);const P4=clone(this.P);P4.dut='dcv';const d1=c25Meas(P4,null,1,0);const d0=c25Meas(P4,'gauge',0,0);
    const st=this.init(P);let R;for(let t=0;t<9;t+=.02)R=this.step(P,st,.02,{});const fm=c25Meas(P,'fmcal',0,3);
    return [['Q = Vg·n − c·p',a.Q,Qth-.02*100,.001],['T = p·Vg/20π + T₀ + 0.004p',a.T,100*16/(20*PI)+1.2+.4,.001],['η_hm = T_th/T',a.ehm,a.pm*16/(20*PI)/a.Tm,.001],['רעש מדידה < 1%',Math.abs(a.Qm/a.Q-1)<.01?1:0,1],
      ['שסתום פריקה ישיר: p(Q_max=40) = כיול',r1.p,100,.001],['צמצם: Q = 0.637·A₀·√Δp',t1.Q,.637*4*Math.sqrt(200),.001],['שסתום פיקוד: Δp(40) = 5 bar',d1.dPA,5,.001],['היסט מד: 8 bar באפס',d0.p1m,8,.001],
      ['סריקה מלאה: 21 נקודות',R.pts.length,21],['מד לא מכויל ⇒ η_v > 100%',fm.ev>1.05?1:0,1],['UI ספיקה',R.read[1].v,R.m.Qm,.001]];}};

LABS.push({ch:25,title:'מדידות וחישובים',sims:[C25_BENCH]});
}
