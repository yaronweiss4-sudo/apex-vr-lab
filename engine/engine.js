/* APEX hydraulics engine – shared by the website and the VR lab */

const THREE=window.THREE;
const {OrbitControls}=window.THREE_ADDONS;
const {CSS2DRenderer, CSS2DObject}=window.THREE_ADDONS;

/* ===================== APEX HYDRAULICS ENGINE · core ===================== */
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const el=(tag,cls,html)=>{const e=document.createElement(tag);if(cls)e.className=cls;if(html!=null)e.innerHTML=html;return e;};
const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
const lerp=(a,b,t)=>a+(b-a)*t;
const PI=Math.PI;
const clone=o=>JSON.parse(JSON.stringify(o));
function fmt(x,dg=2){if(x==null||!isFinite(x))return '—';const a=Math.abs(x);const d=a>=1000?0:a>=100?1:a>=10?Math.min(dg,1):a>=1?dg:a>=.01?Math.max(dg,2):3;let s=x.toLocaleString('en-US',{maximumFractionDigits:d});if(s==='-0')s='0';return s;}
const fr=(a,b)=>`<span class="fr"><span>${a}</span><span class="de">${b}</span></span>`;
const sq=x=>`<span class="sqw">√<span class="sq">${x}</span></span>`;
const V=(x,u='',dg)=>`<b class="val">${fmt(x,dg)}</b>${u?` <span class="uu">${u}</span>`:''}`;
const det=(t,b,open=false)=>`<details ${open?'open':''}><summary><span>${t}</span></summary><div>${b}</div></details>`;
const row=(label,formula,ok)=>`<div class="row">${label?`<div class="lbl2">${label}</div>`:''}<div class="f">${formula}${ok===true?' <span class="ok">✓</span>':ok===false?' <span class="bad">✗</span>':''}</div></div>`;
const kpi=(k,v,u='',s='')=>`<div class="kpi"><div class="k">${k}</div><div class="v">${v}${u?`<small>${u}</small>`:''}</div>${s?`<div class="s">${s}</div>`:''}</div>`;
const rnd=(a,b,st=1)=>Math.round((a+Math.random()*(b-a))/st)*st;
const pick=a=>a[Math.floor(Math.random()*a.length)];

/* ---------- pressure colour map (bar relative to the scale max) ---------- */
const PSTOPS=[[-.2,[147,51,234]],[0,[37,99,235]],[.18,[14,165,233]],[.38,[16,185,129]],[.58,[234,179,8]],[.78,[249,115,22]],[1,[220,38,38]],[1.25,[153,27,27]]];
function pRGB(u){if(!isFinite(u))u=0;u=clamp(u,-.2,1.25);for(let k=1;k<PSTOPS.length;k++){if(u<=PSTOPS[k][0]){const [a,ca]=PSTOPS[k-1],[b,cb]=PSTOPS[k];const t=(u-a)/(b-a);return ca.map((c,j)=>Math.round(lerp(c,cb[j],t)));}}return PSTOPS.at(-1)[1];}
const pCss=u=>`rgb(${pRGB(u).join(',')})`;
const pHex=u=>{const c=pRGB(u);return (c[0]<<16)|(c[1]<<8)|c[2];};

/* ===================== physics library (SI-friendly units) =====================
   p [bar] · Q [L/min] · d, x [mm] · A [mm²] · v [mm/s] · F [N] · P [kW]                */
const H={
  RHO:870, PVAC:-0.85,
  A:d=>PI*d*d/4,                       // mm²
  Aann:(D,d)=>PI*(D*D-d*d)/4,          // annulus mm²
  F:(p,A)=>p*A/10,                     // N   (1 bar = 0.1 N/mm²)
  p:(F,A)=>F*10/A,                     // bar
  v:(Q,A)=>Q*1e6/60/A,                 // mm/s
  Q:(v,A)=>v*A*60/1e6,                 // L/min
  kW:(p,Q)=>p*Q/600,                   // hydraulic power
  /* sharp-edged orifice: Q = k·√Δp ;  k = 0.637·A0·(Cd/0.7) [L/min/√bar, A0 in mm²] */
  orK:(A0,Cd=.7)=>0.637*A0*Cd/.7,
  orQ:(k,dp)=>Math.sign(dp)*k*Math.sqrt(Math.abs(dp)),
  orDp:(k,Q)=>k>1e6?0:k<=1e-9?(Q?1e6:0):Math.sign(Q)*(Q/k)**2,
  /* pipe friction (Darcy). nu in cSt. returns dp [bar], Re, vel [m/s], lam */
  pipe(Q,d,L,nu=46,rho=870){const A=PI*(d/1000)**2/4,v=Math.abs(Q)/60000/A,Re=v*(d/1000)/(nu*1e-6);
    let f;if(Re<1)f=0;else if(Re<2300)f=64/Re;else if(Re>4000)f=.316*Re**-.25;else{const t=(Re-2300)/1700;f=lerp(64/2300,.316*4000**-.25,t);}
    const dp=f*(L/d)*rho*v*v/2/1e5;return {dp:Math.sign(Q)*dp,Re,vel:v,f,lam:Re<2300};},
  /* relief characteristic: closed below pc, passes Qn at pc+ov */
  reliefQ:(p,pc,ov,Qn)=>p<=pc?0:Qn*(p-pc)/Math.max(ov,1e-6),
  bisect(f,a,b,n=60){let fa=f(a);for(let i=0;i<n;i++){const m=(a+b)/2,fm=f(m);if((fm>0)===(fa>0)){a=m;fa=fm;}else b=m;}return (a+b)/2;},
  /* ---------- generic linear-actuator circuit (quasi-static) ----------
     o: {Qp, pr, ov, Ain, Aout (mm²), F (N, +opposes motion), kIn, kOut, kBleed, pT, pBP, kLine, vRun}
     Inlet chamber fed through ויסות בכניסה (meter-in) k (kIn), outlet chamber drains through ויסות ביציאה (meter-out) k (kOut) + back-pressure pBP.
     ויסות במעקף (Bleed-off) orifice kBleed from pump line to tank. Relief at pump. */
  lin(o){
    const Qp=o.Qp,pr=o.pr,ov=o.ov??Math.max(3,.06*pr),Ain=o.Ain,Aout=o.Aout||0,F=o.F||0,pT=o.pT||0,pBP=o.pBP||0;
    const kIn=o.kIn??1e9,kOut=o.kOut??1e9,kB=o.kBleed||0,kL=o.kLine??1e9;
    const Qb=ps=>kB>0?kB*Math.sqrt(Math.max(ps,0)):0, Qr=ps=>H.reliefQ(ps,pr,ov,Qp);
    const st=v=>{const Qin=H.Q(v,Ain),Qout=H.Q(v,Aout);const pOut=pT+pBP+H.orDp(kOut,Qout)+H.orDp(kL,Qout);
      const pIn=(10*F+pOut*Aout)/Ain;const ps=pIn+H.orDp(kIn,Qin)+H.orDp(kL,Qin);return {v,Qin,Qout,pOut,pIn,ps};};
    const need=v=>{const s=st(v);return s.Qin+Qb(s.ps)+Qr(s.ps);};
    const vMax=H.v(Qp,Ain);let r;
    if(need(0)>=Qp){ // stall: pump flow goes over relief / bleed
      const ps=H.bisect(p=>Qb(p)+Qr(p)-Qp,0,pr+ov*1.2+1);const s=st(0);
      r={...s,v:0,ps,pIn:Math.min(ps,Math.max(s.pIn,0)),stall:true};
      if(s.pIn>ps){r.pIn=ps;}
    }else{
      const v=H.bisect(v=>need(v)-Qp,0,vMax);r={...st(v),stall:false};
      if(r.pIn<H.PVAC){ // overrunning load: runs faster than the pump can fill
        const vR=o.vRun??vMax*6;const g=v=>st(v).pIn-H.PVAC;
        let v2=g(vR)<0?vR:H.bisect(g,v,vR);r={...st(v2),pIn:H.PVAC,ps:Math.max(0,H.PVAC+0.3),cav:true,run:g(vR)<0};r.Qin=Qp;
      }
    }
    r.Qb=Qb(Math.max(r.ps,0));r.Qr=Qr(r.ps);r.Qp=Qp;
    r.Ploss=H.kW(r.ps,r.Qr)+H.kW(Math.max(r.ps,0),r.Qb)+H.kW(Math.max(r.ps-r.pIn,0),r.Qin)+H.kW(Math.max(r.pOut-pT,0),r.Qout);
    r.Pin=H.kW(Math.max(r.ps,0),Qp);r.Puse=Math.abs(F*r.v/1e6);
    return r;
  },
  hz:{}
};

/* ===================== lab kit: shared circuit helpers ===================== */
const KIT={
  D43:{closed:['P>A B>T','P| T| A| B|','P>B A>T'],open:['P>A B>T','P+A+B+T','P>B A>T'],tandem:['P>A B>T','P-T A| B|','P>B A>T'],float:['P>A B>T','P| A+B+T','P>B A>T'],regen:['P>A B>T','P| T| A| B|','P+A+B T|']},
  CEN:{closed:'סגור',open:'פתוח',tandem:'טנדם',float:'צף'},
  idx:{a:0,'0':1,b:2},
  ease(st,k,target,dt,rate=7){if(st[k]==null)st[k]=target;st[k]+=(target-st[k])*Math.min(1,dt*rate);if(Math.abs(st[k]-target)<1e-3)st[k]=target;return st[k];},
  pipeV:(Q,d)=>Math.abs(Q)/60000/(PI*(d/1000)**2/4),               // m/s
  nice(x){if(x<=0)return 10;const e=10**Math.floor(Math.log10(x));const m=x/e;return (m<=1?1:m<=2?2:m<=2.5?2.5:m<=5?5:10)*e;},
  rpmAng(st,dt,rpm,k='ang'){st[k]=((st[k]||0)+rpm/60*2*PI*dt*.12)%(2*PI*1000);return st[k];},
  pos3:[['a','◀ a','מצב a – יציאה'],['0','■ 0','מצב אמצעי'],['b','b ▶','מצב b – חזרה']],
  dirOf:pos=>pos==='a'?1:pos==='b'?-1:0,
  /* auto-cycle a 4/3 valve between a and b at the stroke ends */
  autoCycle(P,st,dt,atEnd,dwell=.7){if(!P.auto)return;if(atEnd){st.dw=(st.dw||0)+dt;if(st.dw>dwell){P.pos=P.pos==='a'?'b':'a';st.dw=0;}}else st.dw=0;}
};
const G=9.81;
const runSim=(sim,P,secs,dt=.02,fault=null)=>{const st=sim.init?sim.init(P):{};let R;for(let t=0;t<secs;t+=dt)R=sim.step(P,st,dt,{fault});return {R,st};};


/* ===================== ISO 1219 symbols + schematic renderer ===================== */
const SVGNS='http://www.w3.org/2000/svg';
const sv=(tag,attrs={},parent)=>{const e=document.createElementNS(SVGNS,tag);for(const k in attrs)e.setAttribute(k,attrs[k]);if(parent)parent.appendChild(e);return e;};
const SL=(g,x1,y1,x2,y2,c='sy')=>sv('line',{x1,y1,x2,y2,class:c},g);
const SP=(g,d,c='sy')=>sv('path',{d,class:c},g);
const SR=(g,x,y,w,h,c='sy')=>sv('rect',{x,y,width:w,height:h,class:c},g);
const SC=(g,cx,cy,r,c='sy')=>sv('circle',{cx,cy,r,class:c},g);
const ST=(g,x,y,t,c='st')=>{const e=sv('text',{x,y,class:c},g);e.textContent=t;return e;};
function SA(g,x1,y1,x2,y2,c='sy',hs=5){ // line with arrow head at (x2,y2)
  SL(g,x1,y1,x2,y2,c);const a=Math.atan2(y2-y1,x2-x1);
  sv('path',{d:`M${x2},${y2} L${x2-hs*Math.cos(a-.4)},${y2-hs*Math.sin(a-.4)} L${x2-hs*Math.cos(a+.4)},${y2-hs*Math.sin(a+.4)}Z`,class:'syf'},g);}
const zig=(x1,y1,x2,y2,n=5,amp=4)=>{const L=Math.hypot(x2-x1,y2-y1),ux=(x2-x1)/L,uy=(y2-y1)/L;let d=`M${x1},${y1}`;for(let i=1;i<=n*2;i++){const t=i/(n*2+1)*L,s=(i%2?1:-1)*amp;d+=` L${x1+ux*t-uy*s},${y1+uy*t+ux*s}`;}return d+` L${x2},${y2}`;};
const adjArrow=(g,x1,y1,x2,y2)=>SA(g,x1,y1,x2,y2,'sy thin',4);

const SYM={};
/* pump: in bottom, out top. o.var, o.motor (default true), o.hand */
SYM.pump={ports:o=>({in:[0,18],out:[0,-18]}),bb:o=>[o.motor===false?-20:-60,-22,22,22],
  draw(g,o){SC(g,0,0,18);SP(g,'M0,-18 L-7,-6 L7,-6Z','syf');
    if(o.var)adjArrow(g,-16,14,16,-14);
    const ring=SC(g,0,0,23,'sy run');
    if(o.motor!==false){SC(g,-46,0,12);ST(g,-46,4,'M','st b');SL(g,-34,-2,-18,-2);SL(g,-34,2,-18,2);}
    return cs=>{ring.style.display=cs&&cs.on?'':'none';if(cs&&cs.on)ring.style.strokeDashoffset=(-(cs.ang||0)*12)%100;};}};
/* hydraulic motor: A top (inlet for +), B bottom */
SYM.motor={ports:o=>({A:[0,-18],B:[0,18]}),bb:o=>[-22,-22,62,22],
  draw(g,o){SC(g,0,0,18);SP(g,'M-7,-17 L7,-17 L0,-6Z','syf');if(o.bi)SP(g,'M-7,17 L7,17 L0,6Z','syf');if(o.var)adjArrow(g,-16,14,16,-14);
    SL(g,18,-2,34,-2);SL(g,18,2,34,2);SC(g,46,0,12,'syb');const sp=SL(g,46,0,46,-11,'sy thick');
    return cs=>{sp.setAttribute('transform',`rotate(${((cs&&cs.ang)||0)*57.3} 46 0)`);};}};
SYM.tank={ports:o=>({t:[0,-6]}),bb:o=>[-13,-7,13,7],draw(g){SP(g,'M-12,-6 V6 H12 V-6');}};
SYM.dot={ports:o=>({c:[0,0]}),bb:o=>[-3,-3,3,3],draw(g){SC(g,0,0,3,'syf');}};
SYM.gauge={ports:o=>({p:[0,12]}),bb:o=>[-11,-13,11,12],draw(g){SL(g,0,12,0,8);SC(g,0,-2,10,'syb');SA(g,-6,5,6,-9,'sy',4);}};
SYM.flowm={ports:o=>({in:[0,14],out:[0,-14]}),bb:o=>[-11,-14,11,14],draw(g){SL(g,0,14,0,10);SL(g,0,-14,0,-10);SC(g,0,0,10,'syb');SA(g,0,7,0,-7,'sy',4);SP(g,'M-5,-4 Q0,0 5,-4','sy thin');}};
SYM.filter={ports:o=>({in:[0,13],out:[0,-13]}),bb:o=>[-13,-13,13,13],draw(g){SP(g,'M0,-13 L13,0 L0,13 L-13,0Z','syb');SL(g,0,-13,0,13,'sy dash');}};
SYM.accum={ports:o=>({p:[0,22]}),bb:o=>[-13,-22,13,22],
  draw(g){SL(g,0,22,0,16);const oil=SR(g,-10,-4,20,19,'oil');SR(g,-11,-18,22,34,'sy rr');SL(g,-11,-4,11,-4);SP(g,'M-4,-10 L4,-10 L0,-15Z','syf');
    return cs=>{const f=clamp((cs&&cs.fill)||0,0,1);const h=f*18;oil.setAttribute('y',15-h);oil.setAttribute('height',h);oil.style.fill=pCss((cs&&cs.u)||0);
      g.querySelector('line:nth-of-type(2)')?.setAttribute('y1',15-h-1);};}};
SYM.sv={ports:o=>({in:[0,12],out:[0,-12]}),bb:o=>[-9,-12,9,12],draw(g){const p=SP(g,'M-8,-10 L8,10 L-8,10 L8,-10Z','syb');return cs=>{p.classList.toggle('closed',!!(cs&&cs.closed));};}};
/* check valve: free flow in(bottom) -> out(top). o.pilot => POCV with pilot port X (left) */
SYM.check={ports:o=>Object.assign({in:[0,14],out:[0,-14]},o.pilot?{X:[-24,0]}:{}),bb:o=>[o.pilot?-24:-10,-14,o.spring?14:10,14],
  draw(g,o){SL(g,0,14,0,6);SL(g,0,-14,0,-6);SP(g,'M-8,-4 L0,6 L8,-4');const b=SC(g,0,-1,5,'syb');
    if(o.spring)SP(g,zig(0,-6,0,-13,3,3),'sy thin');
    if(o.pilot){SP(g,'M-24,0 H-9','sy pil');SP(g,'M-9,0 l-5,-3 v6z','syf');}
    return cs=>{b.setAttribute('cy',-1-4*clamp((cs&&cs.open)||0,0,1));};}};
/* throttle (needle) o.adj ; one-way throttle 'throttle1' (o.free:'up'|'down') */
SYM.throttle={ports:o=>({in:[0,16],out:[0,-16]}),bb:o=>[-13,-16,13,16],
  draw(g,o){SL(g,0,16,0,-16);SP(g,'M-7,-10 Q-1,0 -7,10');SP(g,'M7,-10 Q1,0 7,10');if(o.adj!==false)adjArrow(g,-12,10,12,-11);}};
SYM.throttle1={ports:o=>({in:[0,30],out:[0,-30]}),bb:o=>[-17,-30,34,30],
  draw(g,o){SL(g,0,30,0,-30);SP(g,'M-7,-10 Q-1,0 -7,10');SP(g,'M7,-10 Q1,0 7,10');adjArrow(g,-12,10,12,-11);
    SP(g,'M0,20 H22 V8 M22,-8 V-20 H0');const up=o.free!=='down';const s=up?1:-1;
    SP(g,`M14,${-4*s} L22,${6*s} L30,${-4*s}`);const b=SC(g,22,-1*s,5,'syb');SL(g,22,8*s,22,6*s);SL(g,22,-8*s,22,-6*s);
    SR(g,-15,-24,48,48,'sy dash thin');SC(g,0,20,2.2,'syf');SC(g,0,-20,2.2,'syf');
    return cs=>{b.setAttribute('cy',(-1-4*clamp((cs&&cs.chk)||0,0,1))*s);};}};
SYM.fcv={ports:o=>({in:[0,20],out:[0,-20]}),bb:o=>[-15,-20,15,20],
  draw(g,o){SR(g,-14,-18,28,36,'syb');SL(g,0,20,0,18);SL(g,0,-20,0,-18);SA(g,4,12,4,-12,'sy',4);SP(g,'M-8,-9 Q-3,0 -8,9 M0,-9 Q-5,0 0,9','sy thin');adjArrow(g,-12,10,10,-12);SP(g,'M-14,14 l-4,0','sy');}};
/* pressure valves: kind relief | reduce | seq | unload. P bottom, T top. */
SYM.pv={ports:o=>Object.assign({P:[0,16],T:[0,-16]},o.kind==='unload'||o.X?{X:[-30,16]}:{},o.kind==='seq'||o.kind==='reduce'?{L:[30,16]}:{}),bb:o=>[-30,-17,34,24],
  draw(g,o){SR(g,-16,-16,32,32,'syb');SL(g,0,16,0,11);SL(g,0,-16,0,-11);
    const ar=sv('g',{},g);SA(ar,0,11,0,-11,'sy',5);
    SP(g,zig(16,0,30,0,4,4),'sy thin');if(o.adj!==false)adjArrow(g,15,9,32,-10);
    if(o.kind==='reduce')SP(g,'M0,-22 H-24 V0 H-16','sy pil');
    else if(o.kind==='unload'||o.X)SP(g,'M-30,16 V0 H-16','sy pil');
    else SP(g,'M0,22 H-24 V0 H-16','sy pil');
    SP(g,'M-16,0 l-5,-3 v6z','syf');
    if(o.kind==='seq'||o.kind==='reduce')SP(g,'M30,0 V16','sy drn');
    const nc=o.kind!=='reduce';
    return cs=>{const op=clamp((cs&&cs.open)||0,0,1);const ax=nc?lerp(-8,0,op):lerp(8,0,op);ar.setAttribute('transform',`translate(${ax},0)`);};}};
/* counterbalance: relief (pilot assisted) + check bypass. ports load (bottom, to cylinder), dcv (top), X pilot */
SYM.cbv={ports:o=>({L:[0,30],V:[0,-30],X:[-34,22]}),bb:o=>[-34,-30,42,30],
  draw(g,o){SR(g,-16,-16,32,32,'syb');SL(g,0,30,0,16);SL(g,0,-30,0,-16);const ar=sv('g',{},g);SA(ar,0,11,0,-11,'sy',5);SL(g,0,16,0,11);SL(g,0,-16,0,-11);
    SP(g,zig(16,0,30,0,4,4),'sy thin');adjArrow(g,15,9,32,-10);SP(g,'M0,24 H-24 V-4 H-16','sy pil');SP(g,'M-34,22 V4 H-16','sy pil');SP(g,'M-16,-4 l-5,-3 v6z M-16,4 l-5,-3 v6z','syf');
    SP(g,'M0,24 H38 V8 M38,-8 V-24 H0');SP(g,'M30,-4 L38,6 L46,-4','sy');/* check: free flow from V(top) to L(bottom) => drawn reversed */
    const b=SC(g,38,-1,5,'syb');SR(g,-36,-28,90,56,'sy dash thin');SC(g,0,24,2,'syf');SC(g,0,-24,2,'syf');
    return cs=>{const op=clamp((cs&&cs.open)||0,0,1);ar.setAttribute('transform',`translate(${lerp(-8,0,op)},0)`);b.setAttribute('cy',-1+4*clamp((cs&&cs.chk)||0,0,1));};}};
/* cylinder: horizontal, rod to +x. ports A (cap) B (rod). cs.x = 0..1, pA, pB */
SYM.cyl={ports:o=>{const s=o.pside??1;const P={A:[-50,14*s]};if(!o.single)P.B=[50,14*s];return P;},bb:o=>[-62,-16,o.load?205:178,16],
  draw(g,o){const cA=SR(g,-60,-14,10,28,'oil'),cB=SR(g,-50,-14,110,28,'oil');SR(g,-60,-14,120,28,'syb nofill');SL(g,-60,-14,-60,14,'sy thick');
    const pis=SR(g,-55,-13,6,26,'syf2');const rod=SR(g,-49,-4,119,8,'syb');let spr=null;if(o.spring)spr=SP(g,'','sy thin');
    let load=null,ft=null;if(o.load){load=sv('g',{},g);SR(load,0,-15,28,30,'load');ft=ST(load,14,4,o.load.t||'m','st b');}
        return cs=>{const x=clamp((cs&&cs.x)||0,0,1),xp=-55+x*104;pis.setAttribute('x',xp);rod.setAttribute('x',xp+6);
      cA.setAttribute('width',Math.max(xp-(-60)+3,0));cB.setAttribute('x',xp+3);cB.setAttribute('width',Math.max(60-xp-3,0));
      cA.style.fill=pCss(cs?cs.uA:0);cB.style.fill=pCss(cs?cs.uB:0);
      if(spr)spr.setAttribute('d',zig(xp+6,9,59,9,5,3.5));
      if(load){load.setAttribute('transform',`translate(${xp+125},0)`);if(cs&&cs.lt!=null)ft.textContent=cs.lt;}};}};
/* plunger/ram (single-acting, for Pascal press / jack): vertical, opens down. o.w width (bore drawing), port p bottom */
SYM.ram={ports:o=>({p:[0,24]}),bb:o=>[-(o.w||30)/2-14,-140,(o.w||30)/2+14,24],
  draw(g,o){const w=o.w||30;const oil=SR(g,-w/2,0,w,24,'oil');SP(g,`M${-w/2-3},-60 V24 H${w/2+3} V-60`,'sy thick');const pis=SR(g,-w/2,-6,w,6,'syf2');const rod=SR(g,-w/6,-70,w/3,64,'syb');
    const pl=SR(g,-w/2-10,-80,w+20,8,'load');const tx=ST(g,0,-86,'','st');
    return cs=>{const y=-(clamp((cs&&cs.x)||0,0,1))*50;pis.setAttribute('y',y-6);rod.setAttribute('y',y-70);pl.setAttribute('y',y-80);tx.setAttribute('y',y-86);
      oil.setAttribute('y',y);oil.setAttribute('height',24-y);oil.style.fill=pCss(cs?cs.u:0);if(cs&&cs.lt!=null)tx.textContent=cs.lt;};}};
/* directional control valve. o.n names; o.box specs; o.n0 normal; o.ways 4|3|2; o.L, o.R actuators; o.center springs */
const DCV_PX={4:{A:[-7,-15],B:[7,-15],P:[-7,15],T:[7,15]},3:{A:[0,-15],P:[-7,15],T:[7,15]},2:{A:[0,-15],P:[0,15]}};
function dcvBox(g,spec,ways){const px=DCV_PX[ways];spec.split(/\s+/).filter(Boolean).forEach(tk=>{
    let m;if((m=/^(\w)>(\w)$/.exec(tk))){const a=px[m[1]],b=px[m[2]];const sh=3;const ya=a[1]+(a[1]<0?sh:-sh),yb=b[1]+(b[1]<0?sh:-sh);SA(g,a[0],ya,b[0],yb,'sy',4.5);}
    else if((m=/^(\w)-(\w)$/.exec(tk))){const a=px[m[1]],b=px[m[2]];if(a[1]===b[1]){const yy=a[1]<0?-6:6;SP(g,`M${a[0]},${a[1]} V${yy} H${b[0]} V${b[1]}`);}else SL(g,a[0],a[1],b[0],b[1]);}
    else if((m=/^(\w)\|$/.exec(tk))){const a=px[m[1]];const yy=a[1]<0?-8:8;SL(g,a[0],a[1],a[0],yy);SL(g,a[0]-4,yy,a[0]+4,yy);}
    else if(tk.includes('+')){const ps=tk.split('+');const c=[0,ps.every(p=>px[p][1]>0)?6:ps.every(p=>px[p][1]<0)?-6:0];ps.forEach(p=>SL(g,px[p][0],px[p][1],px[p][0],c[1]===0?c[1]:c[1]));SL(g,Math.min(...ps.map(p=>px[p][0])),c[1],Math.max(...ps.map(p=>px[p][0])),c[1]);SC(g,0,c[1],1.8,'syf');}
  });}
function dcvAct(g,kind,x,dir,lab){ // dir -1 left end, +1 right end
  const e=x+dir*12;
  if(kind==='sol'){SR(g,Math.min(x,e),-8,12,16,'syb');SL(g,Math.min(x,e)+2,6,Math.min(x,e)+10,-6,'sy thin');if(lab)ST(g,e+dir*5,-11,lab,'st s');}
  else if(kind==='lever'){SL(g,x,0,x+dir*6,0);SL(g,x+dir*6,0,x+dir*16,-12);SC(g,x+dir*17,-13,2.6,'syf');}
  else if(kind==='spring'){SP(g,zig(x,0,x+dir*16,0,4,5),'sy thin');}
  else if(kind==='pilot'){SP(g,`M${x+dir*12},0 l${-dir*8},-5 v10z`,'syf');SL(g,x+dir*12,0,x+dir*20,0,'sy pil');}
  else if(kind==='btn'){SL(g,x,0,x+dir*6,0);SP(g,`M${x+dir*6},-8 A8,8 0 0,${dir>0?1:0} ${x+dir*6},8`);}
  else if(kind==='det'){SL(g,x,0,x+dir*8,0);SP(g,`M${x+dir*4},6 l${dir*4},-6 l${dir*4},6`,'sy thin');}
  return dir*(kind==='spring'?16:kind==='lever'?16:12);}
SYM.dcv={ports:o=>{const w=o.ways||4;const P={};for(const k in DCV_PX[w])P[k]=[DCV_PX[w][k][0],DCV_PX[w][k][1]+(DCV_PX[w][k][1]<0?-5:5)];return P;},
  bb:o=>{const N=o.box.length,n0=o.n0??Math.floor(N/2);return [(-n0)*30-15-40,-22,(N-1-n0)*30+15+40,22];},
  draw(g,o){const N=o.box.length,n0=o.n0??Math.floor(N/2),w=o.ways||4;const sg=sv('g',{class:'spool'},g);
    for(let k=0;k<N;k++){const bx=sv('g',{transform:`translate(${(k-n0)*30},0)`},sg);SR(bx,-15,-15,30,30,'syb');dcvBox(bx,o.box[k],w);}
    const xl=-n0*30-15,xr=(N-1-n0)*30+15;let ol=0,orr=0;
    if(o.center){ol=dcvAct(sg,'spring',xl,-1);orr=dcvAct(sg,'spring',xr,1);}
    if(o.L)dcvAct(sg,o.L,xl+ol,-1,o.L==='sol'?'a':'');if(o.R)dcvAct(sg,o.R,xr+orr,1,o.R==='sol'?'b':'');
    const px=DCV_PX[w];for(const k in px){const [x,y]=px[k];SL(g,x,y,x,y+(y<0?-5:5),'sy');ST(g,x+(x<0?-5:5),y+(y<0?-7:12),k,'st s');}
    return cs=>{const i=cs&&cs.i!=null?cs.i:n0;sg.setAttribute('transform',`translate(${(n0-i)*30},0)`);};}};
SYM.note={ports:o=>({}),bb:o=>[-40,-8,40,8],draw(g,o){ST(g,0,4,o.t||'','st n');}};
SYM.box={ports:o=>o.ports||{},bb:o=>[-(o.w||40)/2,-(o.h||30)/2,(o.w||40)/2,(o.h||30)/2],draw(g,o){SR(g,-(o.w||40)/2,-(o.h||30)/2,o.w||40,o.h||30,'syb');ST(g,0,4,o.t||'','st s');}};
/* live x–y chart drawn inside the schematic (platform v1.1). o:{w,h,x:[min,max],y:[min,max],xl,yl,t}
   updater cs:{s:[{p:[[x,y],…],c:'#hex',d:true}], m:[x,y] marker, x:[..], y:[..] range override} */
SYM.chart={ports:o=>({}),bb:o=>[-(o.w||120)/2-14,-(o.h||80)/2-14,(o.w||120)/2+6,(o.h||80)/2+16],
  draw(g,o){const w=o.w||120,h=o.h||80,x0=-w/2,y0=h/2;sv('rect',{x:x0,y:-h/2,width:w,height:h,fill:'#fff',stroke:'#cbd5e1','stroke-width':.8},g);
    for(let k=1;k<4;k++){SL(g,x0+w*k/4,-h/2,x0+w*k/4,h/2,'sy drn');SL(g,x0,-h/2+h*k/4,x0+w,-h/2+h*k/4,'sy drn');}
    g.querySelectorAll('line').forEach(l=>{l.style.stroke='#e2e8f0';});
    SL(g,x0,y0,x0+w,y0,'sy thin');SL(g,x0,y0,x0,-h/2,'sy thin');
    if(o.t)ST(g,0,-h/2-4,o.t,'st s');const xl=ST(g,x0+w,y0+11,o.xl||'','st s');xl.setAttribute('text-anchor','end');const yl=ST(g,x0-3,-h/2-4,o.yl||'','st s');yl.setAttribute('text-anchor','start');
    const tx0=ST(g,x0,y0+11,'','st s'),tx1=ST(g,x0+w-28,y0+11,'','st s'),ty1=ST(g,x0-3,-h/2+7,'','st s');tx0.setAttribute('text-anchor','start');ty1.setAttribute('text-anchor','end');
    const paths=[0,1,2,3].map(()=>{const p=sv('path',{fill:'none','stroke-width':1.8,'stroke-linejoin':'round'},g);return p;});
    const mk=sv('circle',{r:3.2,fill:'#dc2626',stroke:'#fff','stroke-width':1},g);let last='';
    return cs=>{if(!cs)return;const X=cs.x||o.x||[0,1],Y=cs.y||o.y||[0,1];const fx=v=>x0+w*clamp((v-X[0])/(X[1]-X[0]||1),-.02,1.02),fy=v=>y0-h*clamp((v-Y[0])/(Y[1]-Y[0]||1),-.02,1.04);
      const key=JSON.stringify([cs.s&&cs.s.map(q=>q.p.length+':'+(q.p.at(-1)||[]).join()),X,Y]);if(key!==last){last=key;
        (cs.s||[]).forEach((q,k)=>{if(!paths[k])return;paths[k].setAttribute('d',q.p.length?'M'+q.p.map(a=>fx(a[0]).toFixed(1)+','+fy(a[1]).toFixed(1)).join(' L'):'');paths[k].setAttribute('stroke',q.c||'#0b72d9');paths[k].setAttribute('stroke-dasharray',q.d?'4 3':'');});
        for(let k=(cs.s||[]).length;k<4;k++)paths[k].setAttribute('d','');tx0.textContent=fmt(X[0],1);tx1.textContent=fmt(X[1],1);ty1.textContent=fmt(Y[1],1);}
      if(cs.m){mk.style.display='';mk.setAttribute('cx',fx(cs.m[0]));mk.setAttribute('cy',fy(cs.m[1]));}else mk.style.display='none';};}};

/* ---------- schematic renderer ---------- */
const SCH={};
function rotPt(p,rot,flip){let [x,y]=p;if(flip)x=-x;const r=rot*PI/180,c=Math.round(Math.cos(r)*1e6)/1e6,s=Math.round(Math.sin(r)*1e6)/1e6;return [x*c-y*s,x*s+y*c];}
function portXY(c,name){const pp=SYM[c.type].ports(c.o||{})[name];if(!pp){console.warn('no port',c.id,name);return [c.x,c.y];}const q=rotPt(pp,c.rot||0,c.flip);return [c.x+q[0],c.y+q[1]];}
function resolvePts(circ,pts){const out=[];pts.forEach(p=>{let q;if(typeof p==='string'){const [id,pn]=p.split('.');const c=circ.comps.find(c=>c.id===id);q=c?portXY(c,pn):[0,0];}else q=p;
    if(out.length){const l=out.at(-1);if(Math.abs(l[0]-q[0])>.5&&Math.abs(l[1]-q[1])>.5)out.push([q[0],l[1]]);}out.push(q);});return out;}
function plen(pts){let L=0;const cum=[0];for(let i=1;i<pts.length;i++){L+=Math.hypot(pts[i][0]-pts[i-1][0],pts[i][1]-pts[i-1][1]);cum.push(L);}return {L,cum};}
function pAt(pts,cum,s){for(let i=1;i<pts.length;i++){if(s<=cum[i]||i===pts.length-1){const t=(s-cum[i-1])/Math.max(cum[i]-cum[i-1],1e-9);return [lerp(pts[i-1][0],pts[i][0],t),lerp(pts[i-1][1],pts[i][1],t)];}}return pts[0];}
function schBuild(circ,host){
  host.innerHTML='';const svg=sv('svg',{class:'schsvg',role:'img'});host.appendChild(svg);
  svg.setAttribute('aria-label','שרטוט סכמתי לפי ISO 1219: '+circ.comps.filter(c=>c.name).map(c=>c.name).join(', '));
  const defs=sv('defs',{},svg);defs.innerHTML='<filter id="hlf" x="-50%" y="-50%" width="200%" height="200%"><feDropShadow dx="0" dy="0" stdDeviation="3.2" flood-color="#9333ea" flood-opacity=".95"/></filter>';
  const gL=sv('g',{},svg),gP=sv('g',{},svg),gC=sv('g',{},svg),gT=sv('g',{},svg);
  const lines=circ.lines.map(l=>{const pts=resolvePts(circ,l.pts);const {L,cum}=plen(pts);
    const d='M'+pts.map(p=>p.join(',')).join(' L');const kind=l.kind||'p';
    const halo=sv('path',{d,class:'plh'+(kind!=='p'?' pk':'')},gL);const path=sv('path',{d,class:'pl '+(kind==='pilot'?'pil2':kind==='drain'?'drn2':'')},gL);
    const dots=[];l.pts.forEach((p,i)=>{if(typeof p!=='string'&&(i===0||i===l.pts.length-1)&&!l.nodot)dots.push(sv('circle',{cx:p[0],cy:p[1],r:3.2,class:'jd'},gL));});
    const parts=[];if(kind==='p'&&L>=1){const n=Math.max(2,Math.floor(L/20));for(let i=0;i<n;i++)parts.push(sv('circle',{r:2.3,class:'pt'},gP));}
    let tag=null,lead=null;if(l.tag){const [tx,ty]=l.tag.at;let best=null,bd=1e9;for(let s=0;s<=L;s+=2){const q=pAt(pts,cum,s);const dd=Math.hypot(q[0]-tx,q[1]-ty);if(dd<bd){bd=dd;best=q;}}
      if(bd>9){lead=sv('line',{x1:best[0],y1:best[1],x2:tx,y2:ty,class:'lead'},gT);}tag=sv('g',{class:'tagg'},gT);const bg=sv('rect',{class:'tagbg',rx:3},tag);const tt=sv('text',{x:tx,y:ty+3.5,class:'tagt'},tag);tag._bg=bg;tag._t=tt;tag._a=[tx,ty];}
    return {l,pts,L,cum,path,halo,dots,parts,off:Math.random()*20,tag,lead,last:''};});
  const comps={};circ.comps.forEach(c=>{const g=sv('g',{class:'cmp',transform:`translate(${c.x},${c.y}) rotate(${c.rot||0})${c.flip?' scale(-1,1)':''}`,'data-id':c.id},gC);
    if(c.name){const t=sv('title',{},g);t.textContent=c.name;}
    const hit=SYM[c.type].bb(c.o||{});sv('rect',{x:hit[0]-4,y:hit[1]-4,width:hit[2]-hit[0]+8,height:hit[3]-hit[1]+8,class:'hit'},g);
    const upd=SYM[c.type].draw(g,c.o||{},c);
    let lab=null;if(c.lbl){const [lx,ly]=c.lblAt||[0,0];lab=sv('text',{x:c.x+(c.lblAt?lx:0),y:c.y+(c.lblAt?ly:-26),class:'clbl'},gT);lab.textContent=c.lbl;}
    let val=null;if(c.type==='gauge'||c.val){const off=c.valAt||[16,-2];val=sv('g',{class:'tagg'},gT);const bg=sv('rect',{class:'tagbg gv',rx:3},val);const tt=sv('text',{x:c.x+off[0],y:c.y+off[1]+3.5,class:'tagt'},val);val._bg=bg;val._t=tt;val._anchor=off[0]<0?'end':'start';tt.setAttribute('text-anchor',val._anchor);}
    comps[c.id]={c,g,upd,val,last:''};});
  // bbox
  let x0=1e9,y0=1e9,x1=-1e9,y1=-1e9;const ex=(x,y)=>{x0=Math.min(x0,x);y0=Math.min(y0,y);x1=Math.max(x1,x);y1=Math.max(y1,y);};
  circ.comps.forEach(c=>{const b=SYM[c.type].bb(c.o||{});[[b[0],b[1]],[b[2],b[1]],[b[0],b[3]],[b[2],b[3]]].forEach(p=>{const q=rotPt(p,c.rot||0,c.flip);ex(c.x+q[0],c.y+q[1]);});});
  circ.comps.forEach(c=>{if(c.lbl){const [lx,ly]=c.lblAt||[0,-26];const w=c.lbl.length*3.3+4;ex(c.x+lx-w,c.y+ly-10);ex(c.x+lx+w,c.y+ly+4);}});
  lines.forEach(L=>{L.pts.forEach(p=>ex(p[0],p[1]));if(L.l.tag)ex(L.l.tag.at[0]+30,L.l.tag.at[1]+8),ex(L.l.tag.at[0]-30,L.l.tag.at[1]-8);});
  Object.values(comps).forEach(o=>{if(o.val){const [ax,ay]=[o.c.x+(o.c.valAt||[16,-2])[0],o.c.y+(o.c.valAt||[16,-2])[1]];ex(ax+(o.val._anchor==='end'?-60:60),ay);}});
  const pad=22;SCH.vb=[x0-pad,y0-pad-6,x1-x0+2*pad,y1-y0+2*pad+6];svg.setAttribute('viewBox',SCH.vb.join(' '));svg.setAttribute('preserveAspectRatio','xMidYMid meet');
  Object.assign(SCH,{svg,lines,comps,circ,host});
  svg.addEventListener('click',e=>{const g=e.target.closest('.cmp');if(g&&APP.onComp)APP.onComp(g.dataset.id,e);});
  return SCH;
}
function setTag(tag,txt,anchor){if(tag._txt===txt)return;tag._txt=txt;tag._t.textContent=txt;const bb=tag._t.getBBox();tag._bg.setAttribute('x',bb.x-3);tag._bg.setAttribute('y',bb.y-1);tag._bg.setAttribute('width',bb.width+6);tag._bg.setAttribute('height',bb.height+2);}
function schUpdate(R,dt,view){
  if(!SCH.lines)return;const pm=R.pmax||100,qr=R.qref||10;
  SCH.lines.forEach(L=>{const l=L.l;const p=R.p[l.net]??0;const u=p<0?p*.2:p/pm;const col=view.colors?pCss(u):'#475569';
    if(col!==L.last){L.path.style.stroke=col;L.dots.forEach(d=>d.style.fill=col);L.last=col;}
    const q=(R.q&&R.q[l.id])??0;const on=view.parts&&Math.abs(q)>qr*.015;
    if(L.parts.length){const bub=!!(R.cav&&R.cav[l.id]);if(bub!==L.bub){L.bub=bub;L.parts.forEach(c=>c.classList.toggle('bub',bub));}const sp=Math.sign(q)*clamp(Math.abs(q)/qr,0,1.6)*85;L.off=(L.off+sp*dt+1e6)%20;const n=L.parts.length,step=L.L/n;
      L.parts.forEach((c,i)=>{if(!on){c.style.display='none';return;}c.style.display='';const s=(i*step+L.off*(step/20))%L.L;const pt=pAt(L.pts,L.cum,s);c.setAttribute('cx',pt[0]);c.setAttribute('cy',pt[1]);});}
    if(L.tag){const show=view.vals;L.tag.style.display=show?'':'none';if(L.lead)L.lead.style.display=show?'':'none';
      if(show){const t=l.tag.t||'p';let s='';if(typeof t==='function')s=t(R);else{if(t.includes('p'))s+=`${fmt(p,1)} bar`;if(t.includes('q'))s+=(s?' · ':'')+`${fmt(Math.abs(q),1)} L/min`;}setTag(L.tag,s);}}
  });
  for(const id in SCH.comps){const o=SCH.comps[id];const cs=R.c&&R.c[id];if(o.upd)o.upd(cs||null);
    if(o.val){o.val.style.display=view.vals?'':'none';if(view.vals){let s='';if(cs&&cs.lt!=null&&o.c.type!=='cyl'&&o.c.type!=='ram')s=cs.lt;else if(o.c.type==='gauge'){const p=cs&&cs.p!=null?cs.p:R.p[o.c.net]??0;s=`${fmt(p,1)} bar`;}if(o.c.val)s=o.c.val(R)||s;setTag(o.val,s);}}}
}
function schHighlight(ids){if(!SCH.comps)return;for(const id in SCH.comps)SCH.comps[id].g.classList.toggle('hl',!!ids&&ids.includes(id));}
function compScreen(id){const o=SCH.comps&&SCH.comps[id];if(!o)return null;const b=o.g.getBoundingClientRect();return b;}


/* ===================== 3D trainer board (Three.js) · engine 2.0 =====================
   Same coordinates as the schematic: (x, y) -> (x, -y, z). Components stand on an aluminium T-slot board.
   2.0: physically based materials, room environment, soft shadows, bent tubes with fittings,
   detailed components and see-through valve bodies ("x-ray") for training modes. */
const T3={ok:false,xray:true,hl:new Set(),clock:0};
const {RoomEnvironment,RoundedBoxGeometry}=window.THREE_ADDONS;
function t3Init(host){
  try{
    const renderer=new THREE.WebGLRenderer({antialias:true,alpha:true});renderer.setPixelRatio(Math.min(devicePixelRatio,2));host.appendChild(renderer.domElement);
    renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=.95;renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
    renderer.domElement.setAttribute('aria-label','מודל תלת-ממדי של המעגל על לוח אימון');renderer.domElement.setAttribute('role','img');
    const lbl=new CSS2DRenderer();lbl.domElement.className='lbl3';host.appendChild(lbl.domElement);
    const scene=new THREE.Scene();const camera=new THREE.PerspectiveCamera(32,1,1,50000);
    try{const pm=new THREE.PMREMGenerator(renderer);scene.environment=pm.fromScene(new RoomEnvironment(),.04).texture;}catch(e){}
    const controls=new OrbitControls(camera,renderer.domElement);controls.enableDamping=true;controls.dampingFactor=.09;controls.rotateSpeed=.7;
    controls.mouseButtons={LEFT:THREE.MOUSE.ROTATE,MIDDLE:THREE.MOUSE.ROTATE,RIGHT:THREE.MOUSE.PAN};
    /* front half only: the board can be seen from the sides, above and below – never from behind */
    controls.minAzimuthAngle=-PI*85/180;controls.maxAzimuthAngle=PI*85/180;controls.minPolarAngle=PI*12/180;controls.maxPolarAngle=PI*122/180;
    /* wheel zoom: fixed gentle step per notch, independent of browser/frame delta size */
    controls.enableZoom=false;renderer.domElement.addEventListener('wheel',e=>{e.preventDefault();const d=e.deltaY*(e.deltaMode===1?33:e.deltaMode===2?800:1);const s=Math.max(-1,Math.min(1,d/100));const off=camera.position.clone().sub(controls.target);const L=off.length();const nl=Math.min(controls.maxDistance,Math.max(controls.minDistance,L*Math.pow(1.1,s)));off.setLength(nl);camera.position.copy(controls.target).add(off);controls.update();},{passive:false});
    controls.addEventListener('change',()=>{if(!T3.center)return;const t=controls.target,c=T3.center,r=T3.radius||300;t.x=clamp(t.x,c.x-r*.8,c.x+r*.8);t.y=clamp(t.y,c.y-r*.7,c.y+r*.7);t.z=clamp(t.z,-10,r*.4);});
    scene.add(new THREE.HemisphereLight(0xffffff,0x8a97ab,.55));
    const key=new THREE.DirectionalLight(0xffffff,1.55);key.castShadow=true;key.shadow.mapSize.set(2048,2048);key.shadow.bias=-.0004;key.shadow.normalBias=.4;key.shadow.radius=4;scene.add(key);scene.add(key.target);
    const fill=new THREE.DirectionalLight(0xdbe8ff,.45);scene.add(fill);
    Object.assign(T3,{ok:true,renderer,lbl,scene,camera,controls,host,root:null,view:'iso',key,fill});
    renderer.domElement.addEventListener('webglcontextlost',e=>{e.preventDefault();},false);
  }catch(e){T3.ok=false;host.innerHTML='<div class="no3d">התצוגה התלת-ממדית אינה זמינה בדפדפן זה. השרטוט ממשיך לעבוד.</div>';}
}
const M3={};
function mat(color,o={}){return new THREE.MeshStandardMaterial(Object.assign({color,metalness:.35,roughness:.45},o));}
function pmat(color,o={}){return new THREE.MeshPhysicalMaterial(Object.assign({color,metalness:.3,roughness:.36,clearcoat:.6,clearcoatRoughness:.25},o));}
function m3(){if(M3.steel)return M3;Object.assign(M3,{steel:mat(0xc3cad3,{metalness:.9,roughness:.28}),alu:pmat(0xd3d9e1,{metalness:.75,roughness:.32,clearcoat:.2}),dark:mat(0x2b323c,{metalness:.45,roughness:.45}),
  blue:pmat(0x245a9e,{metalness:.35,roughness:.36}),yellow:pmat(0xc99a2c,{metalness:.5,roughness:.34}),red:pmat(0xc62828,{metalness:.1,roughness:.3,clearcoat:.9}),black:mat(0x16191e,{metalness:.2,roughness:.6}),white:mat(0xf4f6f9,{metalness:0,roughness:.6}),
  glass:new THREE.MeshPhysicalMaterial({color:0xe4eef9,metalness:0,roughness:.06,transparent:true,opacity:.22,depthWrite:false,side:THREE.DoubleSide,clearcoat:1}),orange:pmat(0xe07b2a,{metalness:.15,roughness:.4}),green:pmat(0x2e7d4f,{metalness:.35,roughness:.36}),
  board:mat(0x8f9aa8,{metalness:.45,roughness:.62}),slot:mat(0x5c6673,{metalness:.4,roughness:.7}),lip:mat(0xaab3be,{metalness:.6,roughness:.4}),frame:mat(0xa7b1bf,{metalness:.8,roughness:.3}),
  chrome:mat(0xf0f4f8,{metalness:1,roughness:.08}),brass:mat(0xc8a24a,{metalness:.9,roughness:.3}),paint:pmat(0x3e4c60,{metalness:.35,roughness:.4}),navy:pmat(0x2d4f7c,{metalness:.4,roughness:.35}),graph:pmat(0x3b4656,{metalness:.55,roughness:.35})});return M3;}
const cyl3=(r,h,m,ax='y',seg=28,r2)=>{const g=new THREE.CylinderGeometry(r,r2??r,h,seg);if(ax==='x')g.rotateZ(PI/2);if(ax==='z')g.rotateX(PI/2);return new THREE.Mesh(g,m);};
const box3=(w,h,d,m)=>new THREE.Mesh(new THREE.BoxGeometry(w,h,d),m);
const rbox3=(w,h,d,m,r)=>{const rr=Math.min(r??Math.min(w,h,d)*.14,w/2.05,h/2.05,d/2.05);return new THREE.Mesh(new RoundedBoxGeometry(w,h,d,3,Math.max(rr,.01)),m);};
const hex3=(r,h,m,ax='y')=>cyl3(r,h,m||m3().steel,ax,6);
const at=(o,x,y,z)=>{o.position.set(x,y,z);return o;};
function edges(m,op=.14){m.add(new THREE.LineSegments(new THREE.EdgesGeometry(m.geometry,25),new THREE.LineBasicMaterial({color:0x1e293b,transparent:true,opacity:op})));return m;}
function oilMat(){return new THREE.MeshStandardMaterial({color:0x2563eb,metalness:.05,roughness:.35,transparent:true,opacity:.88});}
function setOil(m,u){m.color.setHex(pHex(u));m.emissive.setHex(pHex(u));m.emissiveIntensity=.16;}
function spring3(r,len,turns,wire,m,ax='x'){const pts=[];const n=turns*20;for(let i=0;i<=n;i++){const t=i/n,a=t*turns*2*PI;pts.push(new THREE.Vector3(t*len,Math.cos(a)*r,Math.sin(a)*r));}
  const g=new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts),n,wire,6,false);if(ax==='y')g.rotateZ(PI/2);if(ax==='z')g.rotateY(-PI/2);return new THREE.Mesh(g,m||m3().chrome);}
function canvasTex(w,h,draw){const c=document.createElement('canvas');c.width=w;c.height=h;draw(c.getContext('2d'),w,h);const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=8;return t;}
function gaugeTex(max,unit='bar'){return canvasTex(512,512,(x)=>{const g=x.createRadialGradient(256,230,40,256,256,256);g.addColorStop(0,'#ffffff');g.addColorStop(1,'#e8ecf1');x.fillStyle=g;x.beginPath();x.arc(256,256,250,0,2*PI);x.fill();
  x.lineCap='round';x.strokeStyle='#d63a2f';x.lineWidth=16;x.beginPath();x.arc(256,256,206,PI*.75+PI*1.5*.85,PI*.75+PI*1.5);x.stroke();
  x.strokeStyle='#14202f';x.fillStyle='#14202f';x.textAlign='center';x.textBaseline='middle';x.font='bold 52px Arial';
  for(let i=0;i<=50;i++){const a=PI*.75+i/50*PI*1.5;const big=i%10===0,mid=i%5===0;const r1=big?176:mid?188:198;x.lineWidth=big?7:mid?4:2;x.beginPath();x.moveTo(256+r1*Math.cos(a),256+r1*Math.sin(a));x.lineTo(256+216*Math.cos(a),256+216*Math.sin(a));x.stroke();
    if(big)x.fillText(String(Math.round(max*i/50)),256+130*Math.cos(a),256+130*Math.sin(a));}
  x.font='bold 40px Arial';x.fillStyle='#5d6b80';x.fillText(unit,256,355);});}
function label3(text,cls='l3'){const d=el('div',cls,text);const o=new CSS2DObject(d);o.center.set(.5,1);return o;}
/* build context: valve bodies registered as shells (see-through in training), internals shown only in x-ray */
const BCTX={shells:[],inner:[]};
function XR(m){m.material=m.material.clone();m.userData.shell=true;const e=new THREE.LineSegments(new THREE.EdgesGeometry(m.geometry,30),new THREE.LineBasicMaterial({color:0x33465f,transparent:true,opacity:.6}));e.visible=false;e.userData.noShadow=true;m.add(e);m.userData.edge=e;BCTX.shells.push(m);return m;}
function IN(o){BCTX.inner.push(o);return o;}
function t3SetXray(on){T3.xray=!!on;if(!T3.comps)return;for(const id in T3.comps){const r=T3.comps[id];(r.shells||[]).forEach(m=>{const mt=m.material;mt.transparent=on;mt.opacity=on?.2:1;mt.depthWrite=!on;mt.needsUpdate=true;m.userData.edge.visible=on;m.castShadow=!on;});(r.inner||[]).forEach(o=>o.visible=on);}}

/* component builders: return {g, upd(cs,R,ctx)} */
const B3={};
B3.pump=(c,o)=>{const M=m3(),g=new THREE.Group();
  const body=at(rbox3(30,32,28,M.alu,4),0,0,15);g.add(body);const cv=at(rbox3(30,32,5,pmat(0xa9b2bd,{metalness:.8,roughness:.35,clearcoat:.2}),2),0,0,31);g.add(cv);
  [[-10,-11],[10,-11],[-10,11],[10,11]].forEach(([x,y])=>g.add(at(hex3(1.8,2,M.steel,'z'),x,y,34.4)));
  [[19,5,M.steel],[-19,6,M.steel]].forEach(([y,r])=>{g.add(at(cyl3(r,8,M.steel),0,y,15));g.add(at(hex3(r+1.6,3,M.steel),0,y+Math.sign(y)*3.5,15));});
  const disc=new THREE.Group();at(disc,0,0,34);disc.add(at(cyl3(8,1.5,M.dark,'z'),0,0,0));disc.add(at(box3(2,8,1.6,M.red),0,3.6,1));g.add(disc);
  let fan=null;
  if(o.motor!==false){const bell=at(cyl3(10,14,M.alu,'x',28,12),-22,0,15);g.add(bell);
    const mot=at(cyl3(15,40,M.blue,'x',40),-50,0,15);g.add(mot);
    for(let i=0;i<14;i++){const a=i/14*2*PI;const f=at(box3(36,2,3.2,M.blue),-50,Math.cos(a)*15.6,15+Math.sin(a)*15.6);f.rotation.x=a;g.add(f);}
    [-30.5,-69.5].forEach(x=>g.add(at(cyl3(16,3,M.blue,'x',40),x,0,15)));
    g.add(at(cyl3(16.5,10,M.dark,'x',40),-76,0,15));g.add(at(cyl3(13,.8,M.black,'x',40),-81.3,0,15));
    const tb=at(rbox3(13,8,13,M.blue,2),-50,18,15);g.add(tb);g.add(at(cyl3(2,4,M.black,'z'),-50,18,22.5));
    g.add(at(rbox3(42,3,26,M.dark,1),-50,-17,15));
    fan=new THREE.Group();at(fan,-83,0,15);g.add(fan);fan.add(cyl3(4,2,M.alu,'x'));const blade=box3(1.6,22,4,M.red);fan.add(blade);fan.add(box3(1.6,4,22,M.red));}
  return {g,upd(cs){const a=(cs&&cs.ang)||0;if(fan)fan.rotation.x=a;disc.rotation.z=-a;}};};
B3.motor=(c,o)=>{const M=m3(),g=new THREE.Group();g.add(at(cyl3(18,24,M.navy,'z',40),0,0,15));g.add(at(rbox3(36,36,4,M.graph,3),0,0,2.5));
  [[-14,-14],[14,-14],[-14,14],[14,14]].forEach(([x,y])=>g.add(at(hex3(1.8,2,M.steel,'z'),x,y,5)));g.add(at(cyl3(10,4,M.alu,'z',32),0,0,28.5));
  [[19,4],[-19,4]].forEach(([y,r])=>{g.add(at(cyl3(r,8,M.steel),0,y,15));g.add(at(hex3(r+1.6,3),0,y+Math.sign(y)*3.5,15));});
  g.add(at(cyl3(3.5,40,M.chrome,'x'),30,0,15));const fw=new THREE.Group();at(fw,46,0,15);fw.add(cyl3(14,8,M.dark,'x',36));fw.add(at(box3(9,22,3,M.orange),5,0,0));g.add(fw);
  return {g,upd(cs){fw.rotation.x=-((cs&&cs.ang)||0);}};};
B3.tank=(c,o)=>{const M=m3(),g=new THREE.Group();g.add(at(rbox3(26,14,22,M.paint,2),0,-1,11));g.add(at(rbox3(28,2.4,24,M.dark,1),0,6.4,11));
  g.add(at(rbox3(12,7,1,M.alu,.6),0,-1.5,22.2));const win=at(box3(10,5,.6,new THREE.MeshPhysicalMaterial({color:0xcfe4ff,transparent:true,opacity:.5,roughness:.05})),0,-1.5,22.8);g.add(win);
  const oil=at(box3(9.6,3,.5,mat(0xd9a520,{metalness:0,roughness:.3,emissive:0x5a3500,emissiveIntensity:.35})),0,-2.5,22.6);g.add(oil);return {g};};
B3.dot=()=>({g:new THREE.Group()});
B3.note=()=>({g:new THREE.Group()});
B3.chart=()=>({g:new THREE.Group()});
B3.box=(c,o)=>{const M=m3(),g=new THREE.Group();g.add(at(rbox3(o.w||40,o.h||30,20,M.alu,3),0,0,10));return {g};};
B3.gauge=(c,o)=>{const M=m3(),g=new THREE.Group();const cy=2;
  g.add(at(cyl3(2.2,8,M.brass),0,-8,9));g.add(at(hex3(3.4,3,M.brass),0,-10.5,9));
  g.add(at(cyl3(11.5,6,M.dark,'z',48),0,cy,9));g.add(at(new THREE.Mesh(new THREE.TorusGeometry(11.2,1.1,14,56),M.chrome),0,cy,12.2));
  const face=new THREE.Mesh(new THREE.CircleGeometry(10.6,56),new THREE.MeshStandardMaterial({map:gaugeTex(o.max||100,o.unit||'bar'),roughness:.6,metalness:0}));at(face,0,cy,12.1);g.add(face);
  g.add(at(new THREE.Mesh(new THREE.CircleGeometry(10.8,56),new THREE.MeshPhysicalMaterial({color:0xffffff,transparent:true,opacity:.1,roughness:0,clearcoat:1,depthWrite:false})),0,cy,12.9));
  const nd=new THREE.Group();at(nd,0,cy,12.5);nd.add(at(box3(1.1,8.6,.5,mat(0xd63a2f,{roughness:.4})),0,3.6,0));nd.add(cyl3(1.3,1,M.black,'z'));g.add(nd);
  return {g,max:o.max||100,upd(cs,R){const p=cs&&cs.p!=null?cs.p:(R.p[c.net]??0);const u=clamp(p/(o.max||100),-.05,1.05);nd.rotation.z=-1.25*PI-1.5*PI*u;}};};
B3.flowm=(c,o)=>{const M=m3(),g=new THREE.Group();g.add(at(cyl3(8,20,M.glass,'y',32),0,0,10));[-12,12].forEach(y=>g.add(at(rbox3(20,4,20,M.alu,1.5),0,y,10)));
  const f=at(cyl3(5.5,3,M.orange),0,0,10);g.add(f);for(let k=0;k<5;k++)g.add(at(box3(3,.5,.3,M.dark),-6,-8+k*4,18.2));return {g,upd(cs){f.position.y=-8+16*clamp((cs&&cs.u)||0,0,1);}};};
B3.filter=(c,o)=>{const M=m3(),g=new THREE.Group();g.add(at(rbox3(24,7,24,M.alu,2),0,10,12));g.add(at(cyl3(10,20,M.navy,'y',36),0,-3,12));g.add(at(hex3(3,3,M.steel),0,-14.5,12));
  g.add(at(cyl3(2.6,3,M.red,'z',16),8,10,24.6));return {g};};
B3.accum=(c,o)=>{const M=m3(),g=new THREE.Group();const sh=at(cyl3(12,30,M.glass,'y',40),0,-2,14);g.add(sh);
  g.add(at(new THREE.Mesh(new THREE.SphereGeometry(12,32,16,0,2*PI,0,PI/2),M.red),0,13,14));g.add(at(cyl3(2.4,5,M.brass),0,26,14));g.add(at(hex3(4,3,M.steel),0,-18,14));
  const oil=at(cyl3(11,1,oilMat()),0,0,14);g.add(oil);const gas=at(cyl3(11,1,mat(0xfde68a,{transparent:true,opacity:.6})),0,0,14);g.add(gas);
  return {g,upd(cs){const f=clamp((cs&&cs.fill)||0,0,1);const h=Math.max(f*28,.5);oil.scale.y=h;oil.position.y=-16+h/2;gas.scale.y=Math.max(28-h,.5);gas.position.y=-16+h+(28-h)/2;setOil(oil.material,(cs&&cs.u)||0);}};};
B3.sv=(c,o)=>{const M=m3(),g=new THREE.Group();g.add(at(cyl3(5,22,M.brass),0,0,9));g.add(at(new THREE.Mesh(new THREE.SphereGeometry(8,24,16),M.brass),0,0,9));[-9,9].forEach(y=>g.add(at(hex3(6.4,4,M.brass),0,y,9)));
  g.add(at(cyl3(2,6,M.steel,'z'),0,0,17));const h=at(rbox3(26,4,3,M.red,1.2),0,0,20);g.add(h);return {g,upd(cs){h.rotation.z=(cs&&cs.closed)?PI/2:0;}};};
B3.check=(c,o)=>{const M=m3(),g=new THREE.Group();const b=XR(at(cyl3(8,22,M.yellow,'y',32),0,0,10));g.add(b);[-12,12].forEach(y=>g.add(at(hex3(9,3,M.steel),0,y,10)));
  const ball=IN(at(new THREE.Mesh(new THREE.SphereGeometry(5,20,14),M.steel),0,0,10));g.add(ball);
  const seat=IN(at(new THREE.Mesh(new THREE.ConeGeometry(7,7,20,1,true),M.alu),0,-6,10));seat.rotation.x=PI;g.add(seat);
  if(o.spring||o.pilot){const sp=IN(at(spring3(3.4,8,5,.5,M.chrome,'y'),0,4,10));g.add(sp);}
  if(o.pilot){g.add(at(cyl3(3.6,16,M.steel,'x'),-16,0,10));g.add(at(hex3(4.6,3,M.steel,'x'),-23,0,10));}
  return {g,upd(cs){ball.position.y=1+4*clamp((cs&&cs.open)||0,0,1);}};};
function knob3(M,z){const k=new THREE.Group();k.add(cyl3(6,7,M.black,'z',24));for(let i=0;i<12;i++){const a=i/12*2*PI;k.add(at(box3(1.2,1.2,7,M.black),Math.cos(a)*6,Math.sin(a)*6,0));}k.add(at(box3(1.6,6,.6,M.white),0,2.4,3.8));k.position.z=z;return k;}
B3.throttle=(c,o)=>{const M=m3(),g=new THREE.Group();g.add(XR(at(rbox3(18,26,16,M.alu,2.5),0,0,8)));g.add(at(cyl3(5,4,M.steel,'z'),0,0,17.5));const k=knob3(M,22);g.add(k);
  const nd=IN(at(new THREE.Mesh(new THREE.ConeGeometry(3,10,16),M.steel),0,0,9));nd.rotation.x=-PI/2;g.add(nd);g.add(IN(at(cyl3(2.6,26,oilMat()),0,0,8)));
  return {g,upd(cs){k.rotation.z=-((cs&&cs.knob)||0)*4;}};};
B3.throttle1=(c,o)=>{const M=m3(),g=new THREE.Group();g.add(XR(at(rbox3(30,44,16,M.alu,3),8,0,8)));g.add(at(cyl3(5,4,M.steel,'z'),0,0,17.5));const k=knob3(M,22);g.add(k);
  const nd=IN(at(new THREE.Mesh(new THREE.ConeGeometry(3,10,16),M.steel),0,0,9));nd.rotation.x=-PI/2;g.add(nd);g.add(at(hex3(4,8,M.steel,'z'),20,0,19));
  const ball=IN(at(new THREE.Mesh(new THREE.SphereGeometry(3.6,16,12),M.steel),20,0,8));g.add(ball);
  return {g,upd(cs){k.rotation.z=-((cs&&cs.knob)||0)*4;ball.position.y=(o.free==='down'?-1:1)*3*clamp((cs&&cs.chk)||0,0,1);}};};
B3.fcv=(c,o)=>{const M=m3(),g=new THREE.Group();g.add(XR(at(rbox3(26,34,18,M.alu,3),0,0,9)));g.add(at(cyl3(5,4,M.steel,'z'),0,4,19.5));const k=knob3(M,24);k.position.y=4;g.add(k);
  g.add(at(cyl3(4,10,M.steel,'x'),-16,-8,12));const sp=IN(at(cyl3(4,16,M.steel,'x'),0,-8,9));g.add(sp);g.add(IN(at(spring3(3,7,4,.45,M.chrome),5,-8,9)));
  return {g,upd(cs){k.rotation.z=-((cs&&cs.knob)||0)*4;}};};
/* pressure valves: kind relief | reduce | seq | unload. P bottom, T top. Poppet + spring inside, along +x toward the bonnet. */
B3.pv=(c,o)=>{const M=m3(),g=new THREE.Group();const body=XR(at(rbox3(28,30,22,o.kind==='reduce'?M.green:M.yellow,3),0,0,11));g.add(body);
  const bon=XR(at(cyl3(7,14,M.alu,'x',28),20,0,11));g.add(bon);g.add(at(hex3(8.6,3,M.steel,'x'),27.5,0,11));const knob=at(cyl3(7.5,6,M.navy,'x',28),31.5,0,11);g.add(knob);
  [[-10,-11],[10,-11],[-10,11],[10,11]].forEach(([x,y])=>g.add(at(hex3(1.7,2,M.steel,'z'),x,y,22.4)));
  g.add(IN(at(cyl3(3,14,oilMat()),0,-8,11)));g.add(IN(at(cyl3(3,14,oilMat()),0,8,11)));
  g.add(IN(at(new THREE.Mesh(new THREE.TorusGeometry(4.4,1,10,24),M.steel),-1,0,11)).rotateY(PI/2));
  const pop=IN(new THREE.Group());const cone=new THREE.Mesh(new THREE.ConeGeometry(5,8,24),M.red);cone.rotation.z=PI/2;pop.add(cone);pop.add(at(cyl3(2.6,6,M.steel,'x'),6,0,0));at(pop,3,0,11);g.add(pop);
  const spr=IN(at(spring3(3.6,1,6,.55,M.chrome),9,0,11));g.add(spr);
  const lamp=at(new THREE.Mesh(new THREE.SphereGeometry(3,16,10),new THREE.MeshStandardMaterial({color:0x334155,emissive:0x000000,roughness:.3})),-8,8,22.4);g.add(lamp);
  return {g,upd(cs){const op=clamp((cs&&cs.open)||0,0,1);lamp.material.emissive.setRGB(op*.95,op*.35,0);lamp.material.color.setRGB(.2+op*.8,.25+op*.3,.33);knob.rotation.x=((cs&&cs.set)||0)*.05;
    pop.position.x=3+op*3.5;spr.position.x=9+op*3.5;spr.scale.x=Math.max(4,17-op*3.5);}};};
B3.cbv=(c,o)=>{const M=m3(),g=new THREE.Group();g.add(XR(at(rbox3(70,52,22,M.yellow,3),12,0,11)));const knob=at(cyl3(8,6,M.navy,'x',28),52,0,11);g.add(knob);g.add(at(hex3(9,3,M.steel,'x'),48,0,11));
  const pop=IN(new THREE.Group());const cone=new THREE.Mesh(new THREE.ConeGeometry(5,8,24),M.red);cone.rotation.z=PI/2;pop.add(cone);at(pop,4,0,11);g.add(pop);const spr=IN(at(spring3(3.6,1,6,.55,M.chrome),10,0,11));g.add(spr);
  const ball=IN(at(new THREE.Mesh(new THREE.SphereGeometry(4,16,12),M.steel),38,0,11));g.add(ball);
  const lamp=at(new THREE.Mesh(new THREE.SphereGeometry(3.4,16,10),new THREE.MeshStandardMaterial({color:0x334155,roughness:.3})),-14,18,22.4);g.add(lamp);
  return {g,upd(cs){const op=clamp((cs&&cs.open)||0,0,1);lamp.material.emissive.setRGB(op*.95,op*.35,0);pop.position.x=4+op*4;spr.position.x=10+op*4;spr.scale.x=Math.max(4,30-op*4);ball.position.y=-4*clamp((cs&&cs.chk)||0,0,1);}};};
function loadTex(t){return canvasTex(256,256,(x)=>{x.fillStyle='#e07b2a';x.fillRect(0,0,256,256);x.fillStyle='#fff';x.font='bold 150px Heebo,Arial';x.textAlign='center';x.textBaseline='middle';x.fillText(t||'F',128,136);});}
B3.cyl=(c,o)=>{const M=m3(),g=new THREE.Group();const z=16;
  const barrel=at(cyl3(14,116,M.glass,'x',40),0,0,z);g.add(barrel);
  [-62,62].forEach(x=>g.add(at(rbox3(10,34,34,M.graph,2.5),x,0,z)));
  [-1,1].forEach(sy=>[-1,1].forEach(sz=>{g.add(at(cyl3(1.2,132,M.steel,'x',10),0,sy*12.5,z+sz*12.5));[-68,68].forEach(x=>g.add(at(hex3(2.4,2.6,M.steel,'x'),x,sy*12.5,z+sz*12.5)));}));
  g.add(at(cyl3(7,6,M.dark,'x',24),69.5,0,z));
  const cA=at(cyl3(12.6,1,oilMat(),'x',32),0,0,z),cB=at(cyl3(12.6,1,oilMat(),'x',32),0,0,z);g.add(cA,cB);
  const pis=at(cyl3(13.5,6,M.dark,'x',36),0,0,z);g.add(pis);pis.add(new THREE.Mesh(new THREE.TorusGeometry(13.4,.7,8,32),M.black).rotateY(PI/2));
  const rod=at(cyl3(4.5,125,M.chrome,'x',28),0,0,z);g.add(rod);
  let load=null;if(o.load){load=at(rbox3(30,30,30,M.orange,3),0,0,z);g.add(load);const lp=new THREE.Mesh(new THREE.PlaneGeometry(16,16),new THREE.MeshBasicMaterial({map:loadTex(typeof o.load==='object'?o.load.t:'F')}));lp.position.z=15.2;load.add(lp);}
  let spr=null;if(o.spring){spr=at(spring3(9,1,9,.8,M.chrome),0,0,z);g.add(spr);}
  const s=o.pside??1;[[-50,1],[50,!o.single]].forEach(([x,on])=>{if(!on)return;g.add(at(cyl3(4,8,M.steel),x,-19*s,z));g.add(at(hex3(5.4,3,M.steel),x,-22*s,z));});
  return {g,upd(cs){const x=clamp((cs&&cs.x)||0,0,1),xp=-55+x*104+3;pis.position.x=xp;rod.position.x=xp+3+62.5;
    const la=Math.max(xp-(-58),.5),lb=Math.max(58-xp,.5);cA.scale.x=la;cA.position.x=-58+la/2;cB.scale.x=lb;cB.position.x=58-lb/2;
    setOil(cA.material,cs?cs.uA:0);setOil(cB.material,cs?cs.uB:0);if(load)load.position.x=xp+3+125+12;if(spr){spr.position.x=xp+4;spr.scale.x=Math.max(1,57-xp-4);}}};};
B3.ram=(c,o)=>{const M=m3(),g=new THREE.Group();const w=o.w||30,r=w/2;const z=r+4;
  g.add(at(cyl3(r+2,84,M.glass,'y',40),0,18,z));g.add(at(rbox3(w+10,7,w+10,M.graph,2),0,-27,z));g.add(at(new THREE.Mesh(new THREE.TorusGeometry(r+2.2,1.2,10,40),M.dark),0,60,z).rotateX(PI/2));
  const oil=at(cyl3(r,1,oilMat()),0,0,z);g.add(oil);const pis=at(cyl3(r,6,M.dark),0,0,z);g.add(pis);const rod=at(cyl3(r/3,64,M.chrome),0,0,z);g.add(rod);
  const pl=at(rbox3(w+20,8,w+20,M.orange,2),0,0,z);g.add(pl);
  return {g,upd(cs){const y=clamp((cs&&cs.x)||0,0,1)*50;pis.position.y=y+3;rod.position.y=y+38;pl.position.y=y+74;const h=Math.max(y+24,.5);oil.scale.y=h;oil.position.y=-24+h/2;setOil(oil.material,cs?cs.u:0);}};};
B3.dcv=(c,o)=>{const M=m3(),g=new THREE.Group();const N=o.box.length,n0=o.n0??Math.floor(N/2);
  const body=XR(at(rbox3(62,30,26,M.navy,3),0,0,13));g.add(body);g.add(at(rbox3(68,8,30,M.dark,1.5),0,-19,15));
  [[-24,-11],[24,-11],[-24,11],[24,11]].forEach(([x,y])=>g.add(at(hex3(1.7,2,M.steel,'z'),x,y,26.4)));
  g.add(IN(at(cyl3(6.5,60,new THREE.MeshStandardMaterial({color:0x1c2b3f,transparent:true,opacity:.25,depthWrite:false}),'x',24),0,0,13)));
  const spool=IN(new THREE.Group());at(spool,0,0,13);g.add(spool);spool.add(cyl3(3,90,M.steel,'x'));[-20,0,20].forEach(x=>spool.add(at(cyl3(6.2,10,M.chrome,'x',24),x,0,0)));
  const ends=[];const mk=(kind,side)=>{const x=side*(31+8);if(kind==='sol'){g.add(at(rbox3(16,22,22,M.black,2.5),x,0,13));const coil=at(cyl3(7,10,pmat(0x7f1d1d,{clearcoat:.4}),'x',24),x+side*2,0,13);g.add(coil);
      g.add(at(rbox3(10,6,10,mat(0x8a94a3,{metalness:.2,roughness:.5}),1.5),x,14,13));const led=at(new THREE.Mesh(new THREE.SphereGeometry(1.8,12,8),new THREE.MeshStandardMaterial({color:0x553333,emissive:0})),x,14,18.5);g.add(led);ends.push({kind,side,coil,led});}
    else if(kind==='lever'){g.add(at(rbox3(10,24,22,M.navy,2),side*35,0,13));const lv=new THREE.Group();at(lv,side*31,0,26);g.add(lv);lv.add(at(cyl3(3,6,M.dark,'z'),0,0,0));const bar=at(cyl3(1.8,30,M.chrome),0,15,0);lv.add(bar);lv.add(at(new THREE.Mesh(new THREE.SphereGeometry(4.5,20,14),M.red),0,30,0));ends.push({kind,side,lv});}
    else if(kind==='spring'){g.add(at(cyl3(7,12,M.alu,'x',28),side*37,0,13));g.add(at(hex3(7.6,2,M.steel,'x'),side*43.5,0,13));}
    else{g.add(at(cyl3(7,10,M.alu,'x',28),side*36,0,13));}};
  if(o.L)mk(o.L,-1);if(o.R)mk(o.R,1);if(o.center){if(o.L!=='spring'&&o.L!=='sol'&&o.L!=='lever')g.add(at(cyl3(6,6,M.alu,'x'),-34,0,13));}
  return {g,upd(cs){const i=cs&&cs.i!=null?cs.i:n0;const sh=(n0-i)*10;spool.position.x=sh;ends.forEach(e=>{if(e.coil){const on=(e.side<0&&i<n0-.5)||(e.side>0&&i>n0+.5);e.coil.material.emissive.setHex(on?0xff3b30:0);e.coil.material.emissiveIntensity=on?.7:0;e.led.material.emissive.setHex(on?0x22ff55:0);e.led.material.emissiveIntensity=on?1.2:0;}
    if(e.lv){e.lv.rotation.z=(n0-i)*.45;}});}};};

/* pipes: steel tubes with bends + fittings, coloured by pressure; particles flow along the front of each tube */
const PZ=7;
function bentPath(pts,r=5){const v=pts.map(p=>new THREE.Vector3(p[0],-p[1],PZ));const path=new THREE.CurvePath();let cur=v[0].clone();
  for(let i=1;i<v.length;i++){const a=v[i-1],b=v[i];if(a.distanceTo(b)<.05)continue;if(i<v.length-1){const cN=v[i+1];if(b.distanceTo(cN)<.05){path.add(new THREE.LineCurve3(cur,b.clone()));cur=b.clone();continue;}
      const d1=b.clone().sub(a).normalize(),d2=cN.clone().sub(b).normalize();if(Math.abs(d1.dot(d2))>.999){path.add(new THREE.LineCurve3(cur,b.clone()));cur=b.clone();continue;}
      const rr=Math.min(r,a.distanceTo(b)/2,b.distanceTo(cN)/2);const p1=b.clone().addScaledVector(d1,-rr),p2=b.clone().addScaledVector(d2,rr);if(cur.distanceTo(p1)>.01)path.add(new THREE.LineCurve3(cur,p1));path.add(new THREE.QuadraticBezierCurve3(p1,b.clone(),p2));cur=p2;}
    else if(cur.distanceTo(b)>.01)path.add(new THREE.LineCurve3(cur,b.clone()));}
  return path;}
function buildPipes(lines){const M=m3();const out=[];const pg=new THREE.SphereGeometry(1,8,6);const ends=[];
  lines.forEach(L=>{const kind=L.l.kind||'p';const r=kind==='p'?2.4:1.1;const mt=new THREE.MeshPhysicalMaterial({color:0x64748b,metalness:.25,roughness:.3,clearcoat:.8,clearcoatRoughness:.2});
    const g=new THREE.Group();
    if(kind!=='p'){for(let i=1;i<L.pts.length;i++){const a=new THREE.Vector3(L.pts[i-1][0],-L.pts[i-1][1],PZ),b=new THREE.Vector3(L.pts[i][0],-L.pts[i][1],PZ);const len=a.distanceTo(b);if(len<.1)continue;
      const n=Math.max(1,Math.floor(len/6));for(let k=0;k<n;k+=2){const s=a.clone().lerp(b,k/n),e=a.clone().lerp(b,Math.min((k+1)/n,1));const m=new THREE.Mesh(new THREE.CylinderGeometry(r,r,s.distanceTo(e),6),mt);m.position.copy(s).lerp(e,.5);m.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),e.clone().sub(s).normalize());g.add(m);}}}
    else if(L.L>=.5){const path=bentPath(L.pts);if(path.curves.length){const tube=new THREE.Mesh(new THREE.TubeGeometry(path,Math.max(8,Math.round(path.getLength()/2)),r,12,false),mt);g.add(tube);}
      /* fittings where the line meets a component port */
      const src=L.l.pts;[[0,1],[L.pts.length-1,L.pts.length-2]].forEach(([i,j],k)=>{const isPort=typeof src[k===0?0:src.length-1]==='string';const p=L.pts[i],q=L.pts[j];if(!p||!q)return;
        const P=new THREE.Vector3(p[0],-p[1],PZ),Q=new THREE.Vector3(q[0],-q[1],PZ);if(P.distanceTo(Q)<.5)return;const dir=P.clone().sub(Q).normalize();
        if(isPort){const n=hex3(3.9,3.6,M.steel);n.position.copy(P).addScaledVector(dir,-1.6);n.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),dir);g.add(n);
          const sl=cyl3(3,4,M.steel,'y',14);sl.position.copy(P).addScaledVector(dir,-4.6);sl.quaternion.copy(n.quaternion);g.add(sl);}
        else ends.push({P,mt,r});});}
    const parts=[];if(kind==='p'&&L.L>=1){const n=Math.max(2,Math.floor(L.L/20));const pm=new THREE.MeshBasicMaterial({color:0xffffff});for(let i=0;i<n;i++){const p=new THREE.Mesh(pg,pm);p.scale.setScalar(1.25);p.userData.noShadow=true;g.add(p);parts.push(p);}}
    out.push({L,g,mt,parts,last:-1,r});});
  /* tees / junctions: a free line end that touches another line */
  const tg=new THREE.SphereGeometry(1,16,12);ends.forEach(e=>{const m=new THREE.Mesh(tg,e.mt);m.scale.setScalar(e.r*1.45);m.position.copy(e.P);out[0]&&out[0].g.add(m);});
  /* pipe clamps on long straight runs */
  lines.forEach((L,k)=>{if((L.l.kind||'p')!=='p')return;for(let i=1;i<L.pts.length;i++){const a=L.pts[i-1],b=L.pts[i];const len=Math.hypot(b[0]-a[0],b[1]-a[1]);if(len<70)continue;const mx=(a[0]+b[0])/2,my=(a[1]+b[1])/2;const hor=Math.abs(b[1]-a[1])<.5;
    const cl=at(rbox3(hor?4:9,hor?9:4,6,M.dark,1),mx,-my,PZ-2);out[k].g.add(cl);}});
  return out;}
function t3Build(circ){if(!T3.ok)return;const M=m3();if(T3.root){T3.root.traverse(o=>{if(o.isCSS2DObject&&o.element.parentNode)o.element.parentNode.removeChild(o.element);if(o.geometry)o.geometry.dispose();});T3.scene.remove(T3.root);}
  const root=new THREE.Group();T3.root=root;T3.scene.add(root);
  const [vx,vy,vw,vh]=SCH.vb;const bw=vw+40,bh=vh+40,cx=vx+vw/2,cy=-(vy+vh/2);
  /* aluminium T-slot board with frame and feet */
  const board=at(box3(bw,bh,6,M.board),cx,cy,-3);board.receiveShadow=true;root.add(board);
  for(let y=-bh/2+15;y<bh/2-4;y+=30){const s=at(box3(bw-6,4.4,.8,M.slot),cx,cy+y,.1);s.receiveShadow=true;root.add(s);[-2.9,2.9].forEach(o2=>{const l=at(box3(bw-6,1.4,1.2,M.lip),cx,cy+y+o2,.3);l.receiveShadow=true;root.add(l);});}
  const fr=12;[[cx,cy+bh/2+fr/2,bw+2*fr,fr],[cx,cy-bh/2-fr/2,bw+2*fr,fr]].forEach(([x,y,w,h])=>root.add(at(rbox3(w,h,14,M.frame,2),x,y,0)));
  [cx-bw/2-fr/2,cx+bw/2+fr/2].forEach(x=>{root.add(at(rbox3(fr,bh,14,M.frame,2),x,cy,0));root.add(at(rbox3(18,8,Math.max(70,bh*.28),M.graph,2),x,cy-bh/2-fr-4,Math.max(70,bh*.28)/2-10));});
  const floor=new THREE.Mesh(new THREE.PlaneGeometry(bw*3,bh*2),new THREE.ShadowMaterial({opacity:.1}));floor.rotation.x=-PI/2;at(floor,cx,cy-bh/2-fr-8,bh*.3);floor.receiveShadow=true;root.add(floor);
  T3.comps={};SCH.circ.comps.forEach(c=>{const b=B3[c.type];if(!b)return;BCTX.shells=[];BCTX.inner=[];const r=b(c,c.o||{});r.shells=BCTX.shells;r.inner=BCTX.inner;BCTX.shells=[];BCTX.inner=[];
    r.g.position.set(c.x,-c.y,0);r.g.rotation.z=-(c.rot||0)*PI/180;if(c.flip)r.g.scale.x=-1;root.add(r.g);
    /* own material copies so a component can be highlighted alone */
    const mm=new Map();r.g.traverse(o=>{if(!o.isMesh||!o.material||o.userData.shell)return;if(o.material.isMeshStandardMaterial&&!o.material.transparent){if(!mm.has(o.material))mm.set(o.material,o.material.clone());o.material=mm.get(o.material);}});
    r.g.traverse(o=>{if(o.isMesh&&o.material){o.castShadow=!o.userData.noShadow&&!(o.material.transparent);o.receiveShadow=true;if(o.material.emissive){o.userData.e0=o.material.emissive.getHex();o.userData.ei0=o.material.emissiveIntensity;}}});
    r.g.userData.comp=c.id;
    if(c.l3){const lb=label3('');const wrap=new THREE.Object3D();wrap.position.set(c.x+(c.l3[0]||0),-c.y-(c.l3[1]||-30),40);root.add(wrap);wrap.add(lb);r.lbl=lb;}
    const bb=new THREE.Box3().setFromObject(r.g);r.anchor=new THREE.Vector3((bb.min.x+bb.max.x)/2,(bb.min.y+bb.max.y)/2,bb.max.z);
    T3.comps[c.id]={c,...r};});
  T3.pipes=buildPipes(SCH.lines);T3.pipes.forEach(p=>{root.add(p.g);p.g.traverse(o=>{if(o.isMesh){o.castShadow=!o.userData.noShadow;o.receiveShadow=true;}});});
  T3.center=new THREE.Vector3(cx,cy,10);T3.radius=Math.hypot(bw,bh)/2;T3.bw=bw;T3.bh=bh;
  {const fb=new THREE.Box3();Object.values(T3.comps).forEach(o=>fb.expandByObject(o.g));T3.pipes.forEach(p=>fb.expandByObject(p.g));
   if(fb.isEmpty()){fb.min.set(cx-bw/2,cy-bh/2,0);fb.max.set(cx+bw/2,cy+bh/2,20);}
   const sz=fb.getSize(new THREE.Vector3());T3.fit={c:fb.getCenter(new THREE.Vector3()).setZ(10),w:Math.min(bw,Math.max(sz.x,bw*.35))*1.08,h:Math.min(bh,Math.max(sz.y,bh*.35))*1.08};}
  /* lights follow the board size */
  const R=T3.radius;T3.key.position.set(cx+R*.45,cy+R*.95,R*1.7);T3.key.target.position.set(cx,cy,0);const sc=T3.key.shadow.camera;Object.assign(sc,{left:-bw*.65,right:bw*.65,top:bh*.75,bottom:-bh*.75,near:R*.3,far:R*5});sc.updateProjectionMatrix();
  T3.fill.position.set(cx-R*1.2,cy+R*.2,R);
  t3SetXray(T3.xray);t3SetView(T3.view,true);
}
const VIEW3={front:[0,.06,1],iso:[.42,.3,1],top:[0,1.6,.5],side:[1,.25,.5]};
function t3SetView(k,instant){if(!T3.ok||!T3.center)return;T3.view=k;const d=VIEW3[k]||VIEW3.iso;const dir=new THREE.Vector3(...d).normalize();
  const asp=T3.camera.aspect||1;const tf=Math.tan(T3.camera.fov*PI/360);const F=T3.fit||{c:T3.center,w:T3.bw,h:T3.bh};
  const dist=Math.max(F.w/2/(tf*asp),F.h/2/tf)*(k==='front'?1.1:1.38);
  T3.controls.target.copy(F.c);T3.camera.position.copy(F.c.clone().add(dir.multiplyScalar(dist)));T3.camera.up.set(0,1,0);T3.camera.near=dist/100;T3.camera.far=dist*20;T3.camera.updateProjectionMatrix();T3.controls.update();
  T3.controls.minDistance=dist*.15;T3.controls.maxDistance=Math.max(dist*2.2,T3.radius*4);}
function t3Resize(w,h,offX=0,offY=0){if(!T3.ok)return;T3.renderer.setSize(w,h);T3.lbl.setSize(w,h);T3.camera.aspect=w/h;if(offX||offY)T3.camera.setViewOffset(w,h,offX,offY,w,h);else T3.camera.clearViewOffset();T3.camera.updateProjectionMatrix();}
function t3Update(R,dt,view){if(!T3.ok||!T3.root)return;const pm=R.pmax||100,qr=R.qref||10;T3.clock+=dt;
  for(const id in T3.comps){const o=T3.comps[id];const cs=R.c&&R.c[id];if(o.upd)o.upd(cs||null,R);
    if(o.lbl){const sh=view.vals;o.lbl.visible=sh;if(sh){const t=o.c.l3t?o.c.l3t(R):(o.c.type==='gauge'?`${fmt((cs&&cs.p!=null?cs.p:R.p[o.c.net])??0,1)} bar`:'');if(o.lbl.element._t!==t){o.lbl.element._t=t;o.lbl.element.innerHTML=t;}}}}
  T3.pipes.forEach(P=>{const l=P.L.l;const p=R.p[l.net]??0;const u=view.colors?(p<0?p*.2:p/pm):.3;if(Math.abs(u-P.last)>.004){P.last=u;if(view.colors){P.mt.color.setHex(pHex(u));P.mt.emissive.setHex(pHex(u));P.mt.emissiveIntensity=.1;}else{P.mt.color.setHex(0x8792a2);P.mt.emissiveIntensity=0;}}
    if(P.parts.length){const q=(R.q&&R.q[l.id])??0;const on=view.parts&&Math.abs(q)>qr*.015;const L=P.L;const n=P.parts.length,step=L.L/n;
      P.parts.forEach((m,i)=>{m.visible=on;if(!on)return;const s=(i*step+L.off*(step/20))%L.L;const pt=pAt(L.pts,L.cum,s);m.position.set(pt[0],-pt[1],PZ+P.r*.75);});}});
  /* highlighted components pulse orange */
  const pulse=.14+.1*Math.sin(T3.clock*4);
  for(const id in T3.comps){const o=T3.comps[id];const on=T3.hl.has(id)||T3.hover===id;if(!on&&!o._hl)continue;o._hl=on;
    o.g.traverse(m=>{if(!m.isMesh||!m.material||!m.material.emissive||m.material.transparent||m.userData.e0==null)return;if(on){m.material.emissive.setHex(0xff8a1a);m.material.emissiveIntensity=T3.hl.has(id)?pulse:.1;}else{m.material.emissive.setHex(m.userData.e0);m.material.emissiveIntensity=m.userData.ei0;}});}
}
function t3Render(){if(!T3.ok)return;T3.controls.update();T3.renderer.render(T3.scene,T3.camera);T3.lbl.render(T3.scene,T3.camera);}
function t3Highlight(ids){T3.hl=new Set(ids||[]);}
/* screen position of a component (for callout arrows) relative to the 3D canvas */
const _v3=new THREE.Vector3?null:null;
function t3Screen(id){if(!T3.ok||!T3.comps||!T3.comps[id])return null;const o=T3.comps[id];const v=o.anchor.clone();if(o.g.parent)v.applyMatrix4(new THREE.Matrix4().makeTranslation(0,0,0));
  v.project(T3.camera);const cv=T3.renderer.domElement;if(v.z>1)return null;return {x:(v.x+1)/2*cv.clientWidth,y:(1-v.y)/2*cv.clientHeight};}
function t3Pick(ev){if(!T3.ok||!T3.comps)return null;const cv=T3.renderer.domElement,b=cv.getBoundingClientRect();const m=new THREE.Vector2((ev.clientX-b.left)/b.width*2-1,-(ev.clientY-b.top)/b.height*2+1);
  const rc=new THREE.Raycaster();rc.setFromCamera(m,T3.camera);const hits=rc.intersectObjects(Object.values(T3.comps).map(o=>o.g),true);for(const h of hits){let o=h.object;while(o&&o.userData.comp==null)o=o.parent;if(o)return o.userData.comp;}return null;}
