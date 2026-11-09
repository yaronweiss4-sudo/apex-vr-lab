/* lab 4 – same code as the website */
{




/* ===================== Chapter 4 – symbols and reading drawings (sims 9, 10) ===================== */

/* ---------- cutaway (section) drawings that move with the ISO symbol ---------- */
const CUTC={metal:'#d5dbe3',edge:'#475569',part:'#64748b',spring:'#334155'};
const cR=(g,x,y,w,h,fill,st=CUTC.edge,sw=1.2)=>sv('rect',{x,y,width:w,height:h,fill,stroke:st,'stroke-width':sw},g);
const cP=(g,d,fill,st=CUTC.edge,sw=1.2)=>sv('path',{d,fill,stroke:st,'stroke-width':sw,'stroke-linejoin':'round'},g);
const cT=(g,x,y,t)=>{const e=sv('text',{x,y,class:'st s'},g);e.textContent=t;e.style.fontSize='9px';return e;};
/* moving oil dots along polylines; q in −1…1 (sign = direction, size = speed) */
function cutDots(g,paths){const D=paths.map(pts=>{const {L,cum}=plen(pts);const n=Math.max(3,Math.floor(L/16));return {pts,L,cum,off:0,c:[...Array(n)].map(()=>sv('circle',{r:2.6,fill:'#fff',stroke:'#0f172a','stroke-width':.8},g))};});let t0=performance.now();
  return qs=>{const t=performance.now(),dt=Math.min(.05,(t-t0)/1000);t0=t;D.forEach((d,k)=>{const q=(qs&&qs[k])||0;const on=Math.abs(q)>.02;d.off=(d.off+q*90*dt+1e5)%16;
    d.c.forEach((c,i)=>{c.style.display=on?'':'none';if(!on)return;const s=((i*16+d.off)%d.L+d.L)%d.L;const p=pAt(d.pts,d.cum,s);c.setAttribute('cx',p[0]);c.setAttribute('cy',p[1]);});});};}
const zz=(x1,y1,x2,y2,n=6,a=7)=>zig(x1,y1,x2,y2,n,a);
const CUT={
  check(g){cR(g,-125,-48,250,96,CUTC.metal);const cin=cR(g,-125,-13,98,26,'#93c5fd',CUTC.edge,.8);const cout=cP(g,'M-28,-32 H60 V-13 H125 V13 H60 V32 H-28 Z','#93c5fd',CUTC.edge,.8);
    cP(g,'M-30,-32 L-30,-13 L-14,-6 M-30,32 L-30,13 L-14,6','none',CUTC.edge,2);const spr=sv('path',{fill:'none',stroke:CUTC.spring,'stroke-width':1.6},g);const ball=sv('circle',{r:15,fill:CUTC.part,stroke:'#0f172a','stroke-width':1.2},g);
    cT(g,-100,-20,'כניסה');cT(g,100,-20,'יציאה');const dots=cutDots(g,[[[-120,0],[-40,0],[-14,-24],[40,-24],[70,0],[122,0]]]);
    return cs=>{if(!cs)return;cin.style.fill=pCss(cs.uIn);cout.style.fill=pCss(cs.uOut);const x=-14+cs.lift*16;ball.setAttribute('cx',x);ball.setAttribute('cy',0);spr.setAttribute('d',zz(x+15,0,58,0,6,9));dots([cs.q]);};},
  relief(g){cR(g,-95,-95,190,180,CUTC.metal);const cp=cR(g,-13,30,26,55,'#93c5fd',CUTC.edge,.8);const ct=cP(g,'M-40,-62 H40 V-2 H95 V22 H40 V30 H13 M-13,30 H-40 Z','#93c5fd',CUTC.edge,.8);
    cP(g,'M-13,30 L-20,30 M13,30 L20,30','none',CUTC.edge,2.2);const pop=sv('path',{fill:CUTC.part,stroke:'#0f172a','stroke-width':1.2},g);const spr=sv('path',{fill:'none',stroke:CUTC.spring,'stroke-width':1.6},g);
    const scr=cR(g,-9,-95,18,40,'#94a3b8','#0f172a',1);cT(g,0,92,'P – כניסה');cT(g,70,-8,'T – למיכל');cT(g,-62,-70,'קפיץ');const dots=cutDots(g,[[[0,82],[0,36],[26,12],[92,12]]]);
    return cs=>{if(!cs)return;cp.style.fill=pCss(cs.uP);ct.style.fill=pCss(cs.uT);const y=30-cs.lift*14;pop.setAttribute('d',`M-20,${y-14} H20 V${y-6} L0,${y+6} L-20,${y-6} Z`);const sy=-95+40+cs.screw*16;scr.setAttribute('height',40+cs.screw*16);
      spr.setAttribute('d',zz(0,sy,0,y-14,7,10));dots([cs.q]);};},
  dcv(g){cR(g,-140,-70,280,140,CUTC.metal);const X={T1:-92,A:-46,P:0,B:46,T2:92};const ch={};
    ch.A=cR(g,X.A-9,-70,18,52,'#93c5fd',CUTC.edge,.8);ch.B=cR(g,X.B-9,-70,18,52,'#93c5fd',CUTC.edge,.8);ch.P=cR(g,X.P-9,18,18,52,'#93c5fd',CUTC.edge,.8);
    ch.T=cP(g,`M${X.T1-9},18 V60 H${X.T2+9} V18 H${X.T2-9} V50 H${X.T1+9} V18 Z`,'#93c5fd',CUTC.edge,.8);
    const gal=[0,1,2].map(()=>cR(g,0,-16,10,32,'#93c5fd',CUTC.edge,.6));const lands=[0,1,2,3].map(()=>cR(g,0,-17,30,34,CUTC.part,'#0f172a',1));const stem=cR(g,-150,-4,300,8,'#94a3b8','#0f172a',.8);g.insertBefore(stem,lands[0]);
    Object.entries({T:[X.T1,66],A:[X.A,-58],P:[X.P,66],B:[X.B,-58]}).forEach(([k,[x,y]])=>cT(g,x+16,y,k));cT(g,X.T2+16,66,'T');
    const dots=cutDots(g,[[[0,66],[0,0],[-46,0],[-46,-66]],[[46,-66],[46,0],[92,0],[92,62]],[[0,66],[0,0],[46,0],[46,-66]],[[-46,-66],[-46,0],[-92,0],[-92,62]]]);
    return cs=>{if(!cs)return;const s=cs.s*24;const L=[-118,-46,46,118].map(x=>x+s);lands.forEach((l,k)=>l.setAttribute('x',L[k]-15));
      const gs=[[L[0]+15,L[1]-15],[L[1]+15,L[2]-15],[L[2]+15,L[3]-15]];gal.forEach((r,k)=>{r.setAttribute('x',gs[k][0]);r.setAttribute('width',Math.max(gs[k][1]-gs[k][0],0));r.style.fill=pCss(cs.ug[k]);});
      ch.A.style.fill=pCss(cs.uA);ch.B.style.fill=pCss(cs.uB);ch.P.style.fill=pCss(cs.uP);ch.T.style.fill=pCss(cs.uT);dots([cs.qa,cs.qa,cs.qb,cs.qb]);};},
  reduce(g){cR(g,-105,-95,210,190,CUTC.metal);const cin=cR(g,-105,8,87,24,'#93c5fd',CUTC.edge,.8);const cout=cP(g,'M18,8 H105 V32 H44 V-80 H-18 V-62 H26 V8 Z','#93c5fd',CUTC.edge,.8);
    const bore=cR(g,-18,-62,36,150,'#93c5fd',CUTC.edge,.6);const sp=cR(g,-17,0,34,10,CUTC.part,'#0f172a',1.2);const spr=sv('path',{fill:'none',stroke:CUTC.spring,'stroke-width':1.6},g);const dr=cR(g,-18,60,36,28,'#93c5fd',CUTC.edge,.6);
    cT(g,-70,0,'P1 – כניסה');cT(g,72,0,'P2 – יציאה');cT(g,72,-88,'חישה מהיציאה');cT(g,-55,82,'ניקוז');const dots=cutDots(g,[[[-102,20],[-4,20],[6,20],[102,20]]]);
    return cs=>{if(!cs)return;cin.style.fill=pCss(cs.uIn);cout.style.fill=pCss(cs.uOut);bore.style.fill=pCss(cs.uOut);dr.style.fill=pCss(0);const top=-62,bot=8+(1-cs.open)*24;sp.setAttribute('y',top);sp.setAttribute('height',bot-top);
      spr.setAttribute('d',zz(0,bot,0,86,5,10));dots([cs.q]);};},
  throttle1(g){cR(g,-125,-62,250,124,CUTC.metal);const cl=cP(g,'M-125,-10 H-80 V-40 H-8 V-28 H-80 V28 H-30 V40 H-80 V10 H-125 Z','#93c5fd',CUTC.edge,.8);const cr=cP(g,'M125,-10 H80 V-40 H8 V-28 H80 V28 H30 V40 H80 V10 H125 Z','#93c5fd',CUTC.edge,.8);
    const gap=cR(g,-8,-40,16,12,'#93c5fd',CUTC.edge,.4);const nd=cP(g,'','#475569','#0f172a',1);const ball=sv('circle',{r:9,fill:CUTC.part,stroke:'#0f172a','stroke-width':1},g);cP(g,'M-30,26 L-30,42','none',CUTC.edge,2.2);
    cT(g,0,-50,'מחט צמצם');cT(g,0,56,'אל-חוזר עוקף');cT(g,-105,-18,'1');cT(g,105,-18,'2');const dots=cutDots(g,[[[-122,0],[-90,0],[-90,-34],[90,-34],[90,0],[122,0]],[[122,0],[90,0],[90,34],[-90,34],[-90,0],[-122,0]]]);
    return cs=>{if(!cs)return;cl.style.fill=pCss(cs.u1);cr.style.fill=pCss(cs.u2);gap.style.fill=pCss((cs.u1+cs.u2)/2);const y=-62+22-12*(1-cs.open);nd.setAttribute('d',`M-6,-62 V${y-4} L0,${y+4} L6,${y-4} V-62 Z`);
      ball.setAttribute('cx',-21+cs.chk*12);ball.setAttribute('cy',34);dots([cs.qn,cs.qc]);};},
  cyl(g){cR(g,-135,-46,270,92,CUTC.metal);const ca=cR(g,-125,-34,10,68,'#93c5fd',CUTC.edge,.6),cb=cR(g,-110,-34,10,68,'#93c5fd',CUTC.edge,.6);cR(g,-125,-34,250,68,'none',CUTC.edge,1);
    const pis=cR(g,0,-34,18,68,CUTC.part,'#0f172a',1.2);const rod=cR(g,0,-9,170,18,'#cbd5e1','#0f172a',1);const sl=[0,1].map(()=>cR(g,0,-34,3,68,'#111827','none'));
    cR(g,-118,-58,12,14,CUTC.metal);cR(g,106,-58,12,14,CUTC.metal);cT(g,-112,-62,'A');cT(g,112,-62,'B');const arr=sv('path',{fill:'#dc2626',stroke:'none'},g);
    return cs=>{if(!cs)return;const xp=-120+cs.x*222;pis.setAttribute('x',xp);rod.setAttribute('x',xp+18);sl.forEach((s,k)=>s.setAttribute('x',xp+3+k*9));ca.setAttribute('width',Math.max(xp+125,0));ca.style.fill=pCss(cs.uA);
      cb.setAttribute('x',xp+18);cb.setAttribute('width',Math.max(125-xp-18,0));cb.style.fill=pCss(cs.uB);const f=clamp(cs.f,-1,1)*40;arr.setAttribute('d',Math.abs(f)<2?'':`M${xp+188},0 h${f} v-6 l${Math.sign(f)*10},6 l${-Math.sign(f)*10},6 v-6 Z`);};},
  pocv(g){cR(g,-135,-55,270,110,CUTC.metal);const cx=cR(g,-135,-18,40,36,'#93c5fd',CUTC.edge,.8);const cin=cP(g,'M-75,-24 H-24 V24 H-75 Z M-58,24 H-42 V55 H-58 Z','#93c5fd',CUTC.edge,.8);const cout=cP(g,'M-12,-30 H80 V-10 H135 V10 H80 V30 H-12 Z','#93c5fd',CUTC.edge,.8);
    const pp=cR(g,-120,-17,14,34,CUTC.part,'#0f172a',1);const pin=cR(g,-106,-3,60,6,'#94a3b8','#0f172a',.8);cP(g,'M-24,-24 V-10 M-24,24 V10','none',CUTC.edge,2.4);const pop=sv('path',{fill:CUTC.part,stroke:'#0f172a','stroke-width':1.2},g);const spr=sv('path',{fill:'none',stroke:CUTC.spring,'stroke-width':1.6},g);
    cT(g,-115,-26,'X – פיקוד');cT(g,-50,62,'A – מהשסתום');cT(g,108,-18,'לצילינדר');const dots=cutDots(g,[[[-50,52],[-50,0],[-14,-20],[70,-20],[90,0],[132,0]]]);
    return cs=>{if(!cs)return;cx.style.fill=pCss(cs.uX);cin.style.fill=pCss(cs.uIn);cout.style.fill=pCss(cs.uOut);const pv=-120+cs.pil*24;pp.setAttribute('x',pv);pin.setAttribute('x',pv+14);pin.setAttribute('width',Math.max(48+cs.pil*0,10));
      const x=-22+cs.lift*16;pop.setAttribute('d',`M${x},0 L${x+16},-18 H${x+30} V18 H${x+16} Z`);spr.setAttribute('d',zz(x+30,0,78,0,6,9));dots([cs.q]);};}};
SYM.cut={ports:o=>({}),bb:o=>({check:[-128,-52,128,52],relief:[-98,-98,98,96],dcv:[-142,-72,142,72],reduce:[-108,-98,108,98],throttle1:[-128,-64,128,64],cyl:[-138,-62,215,50],pocv:[-138,-58,138,66]}[o.kind]),draw(g,o){return CUT[o.kind](g);}};
B3.cut=(c,o)=>{const r=B3[o.m](c,o.mo||{});r.g.scale.setScalar(o.sc||2.6);return {g:r.g,upd(cs,R){if(r.upd)r.upd(cs&&cs.m,R);}};};
SYM.big={ports:o=>({}),bb:o=>SYM[o.t].bb(o.o||{}).map(v=>v*o.s),draw(g,o){const gg=sv('g',{transform:`scale(${o.s})`},g);return SYM[o.t].draw(gg,o.o||{});}};

/* component library */
const S9C={check:{t:'שסתום אל-חוזר',sym:'i_check',so:{spring:true},m:'check',why:'הכדור נלחץ לבית על ידי קפיץ חלש. לחץ בכניסה שגדול מלחץ היציאה + לחץ הקפיץ מרים אותו.'},
  relief:{t:'שסתום פריקה ישיר',sym:'i_pv',so:{kind:'relief'},m:'pv',mo:{kind:'relief'},why:'הפופט נלחץ לבית על ידי קפיץ מתכוונן. הלחץ בכניסה פועל על שטח הבית ומרים אותו כשהכוח עובר את כוח הקפיץ.'},
  dcv:{t:'שסתום פיקוד 4/3 מרכז סגור',sym:'i_dcv',so:{box:KIT.D43.closed,L:'lever',center:true},m:'dcv',mo:{box:KIT.D43.closed,L:'lever',center:true},why:'ספול (מגופה) עם בליטות (Lands) זז בתוך קדח עם חריצים. כל ריבוע בסמל = מצב אחד של הספול.'},
  reduce:{t:'ווסת לחץ',sym:'i_pv',so:{kind:'reduce'},m:'pv',mo:{kind:'reduce'},why:'פתוח במצב רגיל. לחץ היציאה מוזן לקצה הספול ודוחף אותו נגד הקפיץ – וסוגר את המעבר כשהיציאה מגיעה לכיול.'},
  throttle1:{t:'צמצם אל-חוזר',sym:'i_throttle1',so:{free:'down'},m:'throttle1',mo:{free:'down'},why:'שני מסלולים במקביל: מחט צמצם, ואל-חוזר שעוקף אותה בכיוון אחד בלבד.'},
  cyl:{t:'צילינדר דו-פעולה',sym:'i_cyl',so:{},m:'cyl',mo:{},why:'בוכנה עם אטמים מחלקת את הצילינדר לשני תאים. הכוח = p_A·A₁ − p_B·A₂.'},
  pocv:{t:'אל-חוזר מפוקד',sym:'i_check',so:{pilot:true,spring:true},m:'check',mo:{pilot:true},why:'כמו אל-חוזר, ובנוסף בוכנת פיקוד שדוחפת פין ופותחת את הפופט גם כנגד הזרימה.'}};
const SIM_SYM={id:'sym2cut',n:9,t:'מסמל לחתך',d:'סמל ISO וחתך פיזי זזים יחד – מה כל קו בסמל אומר',
  P:{comp:'check',pIn:20,pOut:5,crack:1,pset:80,pP:60,pos:'0',pA:80,pB:10,pX:0,ratio:4,open:.5,dir:1,qd:10,D:63,dr:36},
  key:P=>P.comp,
  ui(U,P){U.grp('רכיב');U.sel(P,'comp','בחרו רכיב',Object.entries(S9C).map(([k,v])=>[k,v.t]),true);U.grp('הפעלה');const c=P.comp;
    if(c==='check'){U.num(P,'pIn','לחץ כניסה','bar',{min:0,max:300,step:1});U.num(P,'pOut','לחץ יציאה','bar',{min:0,max:300,step:1});U.num(P,'crack','לחץ פתיחה (קפיץ)','bar',{min:.1,max:10,step:.1});}
    if(c==='relief'){U.num(P,'pIn','לחץ בכניסה P','bar',{min:0,max:350,step:1});U.num(P,'pset','כיול הקפיץ','bar',{min:10,max:350,step:5});}
    if(c==='dcv'){U.seg(P,'pos','מצב הידית',KIT.pos3);U.num(P,'pP','לחץ משאבה','bar',{min:0,max:300,step:5});U.note('לחיצה על הסמל או על החתך מחליפה מצב.');}
    if(c==='reduce'){U.num(P,'pIn','לחץ כניסה P1','bar',{min:0,max:350,step:5});U.num(P,'pset','כיול יציאה','bar',{min:5,max:300,step:5});U.num(P,'qd','צריכה ביציאה','L/min',{min:0,max:60,step:1});}
    if(c==='throttle1'){U.num(P,'open','פתיחת מחט','×',{min:0,max:1,step:.05});U.seg(P,'dir','כיוון זרימה',[[1,'1→2'],[-1,'2→1']]);U.num(P,'pIn','מפל לחץ','bar',{min:0,max:100,step:1});}
    if(c==='cyl'){U.num(P,'pA','לחץ בתא A','bar',{min:0,max:300,step:5});U.num(P,'pB','לחץ בתא B','bar',{min:0,max:300,step:5});U.num(P,'D','קוטר בוכנה','mm',{min:20,max:200,step:5});U.num(P,'dr','קוטר מוט בוכנה','mm',{min:10,max:140,step:2});}
    if(c==='pocv'){U.num(P,'pOut','לחץ עומס (צד הצילינדר)','bar',{min:0,max:300,step:5});U.num(P,'pIn','לחץ בקו A','bar',{min:0,max:300,step:5});U.num(P,'pX','לחץ פיקוד X','bar',{min:0,max:300,step:5});U.num(P,'ratio','יחס פיקוד','',{min:2,max:12,step:.5});}},
  circuit(P){const c=S9C[P.comp];const sc={dcv:1.5,cyl:1.15}[P.comp]||2.4;const comps=[{id:'S',type:'big',x:P.comp==='dcv'?60:70,y:0,o:{t:c.sym.slice(2),o:c.so,s:sc},name:'סמל ISO 1219: '+c.t,lbl:'סמל ISO',lblAt:[0,P.comp==='cyl'?-34:-80]},
      {id:'X',type:'cut',x:P.comp==='cyl'?420:400,y:0,o:{kind:P.comp,m:c.m,mo:c.mo||c.so},name:'חתך: '+c.t,lbl:'חתך',lblAt:[0,P.comp==='relief'||P.comp==='reduce'?-108:-80]}];
    if(P.comp==='cyl'){comps[0].x=-60;comps[0].y=0;}if(P.comp==='dcv')comps[0].x=-40;return {comps,lines:[]};},
  init:()=>({x:.3,t:0}),
  click(id,P){if(P.comp==='dcv'&&(id==='S'||id==='X')){P.pos=P.pos==='a'?'0':P.pos==='0'?'b':'a';return true;}},
  step(P,st,dt,ctx){const f=ctx.fault;const c=P.comp;const rel={check:[P.pIn,P.pOut],relief:[P.pIn,P.pset],dcv:[P.pP],reduce:[P.pIn,P.pset],throttle1:[P.pIn],cyl:[P.pA,P.pB],pocv:[P.pIn,P.pOut,P.pX]}[c];let pm=KIT.nice(Math.max(...rel,10)*1.1);const u=p=>p/pm;let cs={},sc={},rd=[],x={};
    if(c==='check'){const crack=f==='spring'?0:P.crack;const dp=P.pIn-P.pOut;const lift=clamp((dp-crack)/(crack*2+2),0,1);const q=lift>0?Math.sqrt(Math.max(dp-crack,0))*4:0;
      cs={uIn:u(P.pIn),uOut:u(P.pOut),lift,q:clamp(q/20,0,1)};sc={open:lift};x={dp,lift,q,crack};rd=[{k:'מפל לחץ Δp',v:dp,u:'bar'},{k:'הרמת הכדור',v:lift*100,u:'%',max:100},{k:'ספיקה',v:q,u:'L/min'}];}
    if(c==='relief'){const ov=Math.max(3,.06*P.pset);const lift=f==='stuck'?Math.max(.35,clamp((P.pIn-P.pset)/ov,0,1)):clamp((P.pIn-P.pset)/ov,0,1);const q=lift*30;
      cs={uP:u(P.pIn),uT:u(.3),lift,screw:P.pset/350,q:lift};sc={open:lift,set:P.pset};x={lift,q,ov};rd=[{k:'לחץ כניסה',v:P.pIn,u:'bar'},{k:'כיול',v:P.pset,u:'bar'},{k:'הרמת הפופט',v:lift*100,u:'%',max:100},{k:'ספיקה למיכל',v:q,u:'L/min'}];}
    if(c==='dcv'){KIT.ease(st,'s',P.pos==='a'?-1:P.pos==='b'?1:0,dt,6);const s=st.s;const leak=f==='notch'?.5:0;const pa=s<-.4?P.pP:s>.4?.5:(leak?P.pP*.4:P.pA*0+40),pb=s>.4?P.pP:s<-.4?.5:(leak?.5:40);
      const qa=s<-.4?1:s>.4?-1:(leak?.25:0),qb=s>.4?1:s<-.4?-1:0;cs={s,uA:u(pa),uB:u(pb),uP:u(P.pP),uT:u(.5),ug:[u(s<-.4?.5:s>.4?pa:.5),u(P.pP),u(s>.4?.5:s<-.4?pb:.5)],qa:s<-.4?1:0,qb:s>.4?1:0};
      if(leak&&Math.abs(s)<.4){cs.qa=.3;cs.ug[0]=u(.5);}
      sc={i:1+s};x={pa,pb,s};rd=[{k:'לחץ משאבה P',v:P.pP,u:'bar'},{k:'לחץ ביציאה A',v:pa,u:'bar'},{k:'לחץ ביציאה B',v:pb,u:'bar'},{k:'מיקום ספול',v:s*100,u:'%'}];}
    if(c==='reduce'){const set=P.pset;const stuck=f==='rstuck';let pOut,open;if(stuck){open=1;pOut=P.pIn;}else{pOut=Math.min(P.pIn,set);open=P.pIn<=set?1:clamp(.05+P.qd/60*.5,0,1);}
      cs={uIn:u(P.pIn),uOut:u(pOut),open,q:P.qd/30};sc={open:open};x={pOut,open};rd=[{k:'לחץ כניסה P1',v:P.pIn,u:'bar'},{k:'לחץ יציאה P2',v:pOut,u:'bar'},{k:'פתיחת המעבר',v:open*100,u:'%',max:100}];}
    if(c==='throttle1'){const A0=P.open*12,k=H.orK(A0);const chkOK=f!=='chkstuck';const dp=P.pIn;let qn=H.orQ(k,dp),qc=0,chk=0;if(P.dir<0){chk=chkOK?1:0;qc=chkOK?20+qn:0;}
      const q=qn+qc;const p1=P.dir>0?dp:0,p2=P.dir>0?0:(chkOK?Math.min(dp,2):dp);pm=KIT.nice(Math.max(dp,10)*1.1);cs={u1:p1/pm,u2:p2/pm,open:P.open,chk,qn:P.dir*clamp(qn/20,0,1),qc:chk?clamp(qc/30,.3,1):0};sc={chk,knob:P.open};x={qn,qc,q,k};
      rd=[{k:'פתח המחט',v:A0,u:'mm²'},{k:'ספיקה דרך המחט',v:qn,u:'L/min'},{k:'ספיקה דרך האל-חוזר',v:qc,u:'L/min'}];}
    if(c==='cyl'){const A1=H.A(P.D),A2=H.Aann(P.D,Math.min(P.dr,P.D-2));const pA=f==='seal'?(P.pA+P.pB)/2:P.pA,pB=f==='seal'?(P.pA+P.pB)/2:P.pB;const F=H.F(pA,A1)-H.F(pB,A2);
      st.x=clamp(st.x+Math.sign(F)*(Math.abs(F)>200?.15:0)*dt,0,1);if(st.x>=1||st.x<=0)st.dw=(st.dw||0)+dt;cs={x:st.x,uA:u(pA),uB:u(pB),f:F/Math.max(H.F(pm,A1),1)};sc={x:st.x,uA:u(pA),uB:u(pB)};x={A1,A2,F,pA,pB};
      rd=[{k:'שטח צד מלא A₁',v:A1,u:'mm²',dg:0},{k:'שטח טבעתי A₂',v:A2,u:'mm²',dg:0},{k:'כוח נטו',v:F/1000,u:'kN',dg:2},{k:'מיקום',v:st.x*100,u:'%',max:100}];}
    if(c==='pocv'){const crack=1;const pil=clamp((P.pX*P.ratio-P.pOut)/(P.ratio*5)+(P.pX*P.ratio>P.pOut?.5:0),0,1);const fwd=P.pIn-P.pOut>crack;const leak=f==='pleak';
      const lift=fwd?clamp((P.pIn-P.pOut-crack)/6,0,1):(P.pX*P.ratio>=P.pOut&&P.pX>0?1:(leak?.15:0));const q=fwd?lift:(lift>0?-lift:0);
      cs={uX:u(P.pX),uIn:u(P.pIn),uOut:u(P.pOut),pil:P.pX*P.ratio>=P.pOut&&P.pX>0?1:clamp(P.pX/Math.max(P.pOut/P.ratio,1),0,.9),lift,q};sc={open:lift};x={lift,need:P.pOut/P.ratio};
      rd=[{k:'לחץ עומס',v:P.pOut,u:'bar'},{k:'לחץ פיקוד',v:P.pX,u:'bar'},{k:'פיקוד דרוש p/יחס',v:P.pOut/P.ratio,u:'bar'},{k:'פתיחה',v:lift*100,u:'%',max:100}];}
    return {p:{},q:{},pmax:pm,qref:10,x,c:{S:sc,X:Object.assign({m:sc},cs)},read:rd};},
  ins(P,R){const c=S9C[P.comp],x=R.x,L=[{ic:'🔎',at:'X',h:`<b>${c.t}</b>: ${c.why}`}];
    if(P.comp==='check')L.push(x.lift>0?{ic:'✅',at:'X',h:`Δp = ${fmt(x.dp,1)} bar גדול מלחץ הפתיחה (${fmt(x.crack,1)} bar) – הכדור עלה והשמן זורם. בסמל: החץ מראה את כיוון הזרימה החופשית.`}:{ic:'⛔',at:'X',h:`Δp = ${fmt(x.dp,1)} bar – לא מספיק כדי להרים את הכדור${x.dp<0?' (לחץ הפוך רק לוחץ אותו חזק יותר לבית)':''}.`});
    if(P.comp==='relief')L.push(x.lift>0?{ic:'🔥',at:'X',h:`הלחץ עבר את הכיול – הפופט עלה ${fmt(x.lift*100,0)}% והשמן בורח למיכל. בסמל החץ זז מול הפתחים.`}:{ic:'🔒',h:'מתחת לכיול הפופט סגור: בסמל החץ מוסט מהפתחים – "סגור במצב רגיל".'});
    if(P.comp==='dcv')L.push({ic:'↔️',at:'S',h:P.pos==='0'?'מצב אמצעי: שתי הבליטות מכסות את החריצים של A ו-B – הכול חסום, כמו הריבוע האמצעי בסמל.':`מצב ${P.pos}: הספול זז ${P.pos==='a'?'שמאלה':'ימינה'} ומחבר P→${P.pos==='a'?'A':'B'} ו-${P.pos==='a'?'B':'A'}→T – בדיוק החצים שבריבוע ${P.pos}.`});
    if(P.comp==='reduce')L.push({ic:'🎯',at:'X',h:P.pIn<=P.pset?'לחץ הכניסה נמוך מהכיול – המעבר פתוח לגמרי והיציאה שווה לכניסה.':`היציאה נשמרת על ${fmt(R.x.pOut,0)} bar: הספול נע עד שכוח הלחץ ביציאה מאזן את הקפיץ. הקו המקווקו בסמל = החישה מהיציאה.`});
    if(P.comp==='throttle1')L.push(P.dir>0?{ic:'🎚️',at:'X',h:`בכיוון 1→2 האל-חוזר סגור וכל הספיקה עוברת במחט: Q = k·√Δp = ${fmt(R.x.qn,1)} L/min.`}:{ic:'➡️',at:'X',h:'בכיוון 2→1 האל-חוזר נפתח ועוקף את המחט – זרימה חופשית.'});
    if(P.comp==='cyl')L.push({ic:'💪',at:'X',h:`F = p_A·A₁ − p_B·A₂ = ${fmt(R.x.F/1000,2)} kN. בסמל: הקו העבה = הבוכנה, הקו הכפול = המוט.`});
    if(P.comp==='pocv')L.push(R.x.lift>0&&P.pIn<=P.pOut?{ic:'🔓',at:'X',h:`לחץ הפיקוד × ${P.ratio} עבר את לחץ העומס – הפין דחף את הפופט והשמן יכול לחזור מהצילינדר.`}:{ic:'🔒',h:`כדי לפתוח נגד עומס של ${fmt(P.pOut,0)} bar צריך פיקוד של לפחות ${fmt(R.x.need,1)} bar (יחס ${P.ratio}:1).`});return L;},
  calc(P,R){const c=P.comp,x=R.x;let h='';
    if(c==='check'){const ds=8,As=H.A(ds);h=det('כוח על הכדור',row('שטח הבית (Ø8)',`A = ${V(As,'mm²')}`)+row('כוח הקפיץ',`F_s = p_crack·A = ${fmt(x.crack,1)}·${fmt(As,1)}/10 = ${V(H.F(x.crack,As),'N')}`)+row('כוח הלחץ',`F = Δp·A = ${V(H.F(Math.max(x.dp,0),As),'N')}`,x.dp>x.crack),true);}
    if(c==='relief'){const ds=10,As=H.A(ds);h=det('כוח הקפיץ הנדרש',row('שטח הבית (Ø10)',`A = ${V(As,'mm²')}`)+row('',`F_s = p_set·A = ${fmt(P.pset,0)}·${fmt(As,1)}/10 = ${V(H.F(P.pset,As),'N')}`),true)+det('עליית לחץ מעל לחץ הפתיחה',row('',`פתיחה מלאה ב-p = p_set + Δp_ov = ${V(P.pset+x.ov,'bar')}`));}
    if(c==='dcv')h=det('חיבורים לפי מצב',row('a','P→A, B→T')+row('0','P, A, B, T חסומים')+row('b','P→B, A→T'),true);
    if(c==='reduce')h=det('איזון הספול',row('',`p₂·A_s = F_קפיץ → p₂ = ${V(Math.min(P.pIn,P.pset),'bar')}`),true);
    if(c==='throttle1')h=det('ספיקה במחט',row('',`k = 0.637·A₀ = ${V(R.x.k,'L/min/√bar')}`)+row('',`Q = k·√Δp = ${V(R.x.qn,'L/min')}`),true);
    if(c==='cyl')h=det('כוח',row('',`A₁ = ${V(x.A1,'mm²')}, A₂ = ${V(x.A2,'mm²')}`)+row('',`F = (${fmt(x.pA,0)}·${fmt(x.A1,0)} − ${fmt(x.pB,0)}·${fmt(x.A2,0)})/10 = ${V(x.F,'N')}`),true);
    if(c==='pocv')h=det('פתיחה בפיקוד',row('',`p_X ≥ ${fr('p_load','יחס')} = ${fr(fmt(P.pOut,0),fmt(P.ratio,1))} = ${V(R.x.need,'bar')}`,P.pX>=R.x.need),true);
    return `<div class="kpis">${R.read.slice(0,4).map(r=>kpi(r.k,fmt(r.v,1),r.u)).join('')}</div>`+h;},
  demo:[{t:'סמל וחתך',x:'משמאל סמל ISO 1219, מימין חתך של אותו רכיב. שניהם מונעים מאותם נתונים – כל תזוזה בחתך מופיעה גם בסמל.',reset:true,hl:['S','X']},
    {t:'אל-חוזר נפתח',x:'לחץ כניסה 20 bar מול 5 bar ביציאה: הכדור עולה מהבית. בסמל – הכדור מעל המשולש זז.',hl:['X']},
    {t:'אל-חוזר נסגר',x:'הופכים את הלחצים: הכדור נלחץ לבית והזרימה נעצרת.',set:{pIn:5,pOut:20},hl:['X']},
    {t:'שסתום פיקוד',x:'בחתך רואים ספול עם בליטות; בסמל – שלוש קופסאות. לחיצה מחליפה מצב, והקופסה הפעילה זזה מול הפתחים.',reset:true,set:{comp:'dcv',pos:'a'},hl:['S','X'],dur:9},
    {t:'שסתום פריקה',x:'כשהלחץ עובר את כיול הקפיץ, הפופט עולה – והחץ בסמל זז מול הפתחים.',reset:true,set:{comp:'relief',pIn:90,pset:80},hl:['X'],dur:9}],
  predict:[{q:'אל-חוזר: 30 bar בכניסה, 40 bar ביציאה. מה יקרה?',set:{comp:'check',pIn:30,pOut:40},opts:['הכדור עולה','הכדור נשאר על הבית'],a:1,why:'הלחץ ההפוך רק לוחץ את הכדור לבית – אל-חוזר עובר בכיוון אחד בלבד.'},
    {q:'שסתום פיקוד 4/3 במצב b. לאן מחובר P?',set:{comp:'dcv',pos:'b'},opts:['ל-A','ל-B','חסום'],a:1,why:'בריבוע b החצים מחברים P→B ו-A→T; הספול זז והחריץ B נפתח לגלריה שבה P.'},
    {q:'ווסת לחץ מכויל ל-60 bar, בכניסה 150 bar. מה יהיה ביציאה?',set:{comp:'reduce',pIn:150,pset:60},opts:['150 bar','60 bar','0 bar'],a:1,why:'הספול חש את היציאה ומצמצם את המעבר עד שהיציאה מגיעה לכיול.'},
    {q:'אל-חוזר מפוקד עם יחס 4:1 ועומס 120 bar. פיקוד של 25 bar –',set:{comp:'pocv',pOut:120,pIn:0,pX:25,ratio:4},opts:['פותח','לא פותח'],a:1,why:'צריך לפחות 120/4 = 30 bar.'}],
  tasks:[{q:P=>`אל-חוזר עם בית Ø8 מ"מ ולחץ פתיחה ${P.crack} bar. מה כוח הקפיץ (N)?`,a:P=>H.F(P.crack,H.A(8)),u:'N',hint:'F = p·A, A = π·d²/4.',set:{comp:'check'},rand:P=>{P.crack=pick([.5,1,2,3,5]);}},
    {q:P=>`שסתום פריקה עם בית Ø10 מ"מ מכויל ל-${P.pset} bar. מה כוח הקפיץ (N)?`,a:P=>H.F(P.pset,H.A(10)),u:'N',hint:'F = p·A.',set:{comp:'relief'},rand:P=>{P.pset=rnd(50,300,10);}},
    {q:P=>`צילינדר Ø${P.D}/${P.dr}, p_A = ${P.pA} bar, p_B = ${P.pB} bar. מה הכוח נטו (kN)?`,a:P=>(H.F(P.pA,H.A(P.D))-H.F(P.pB,H.Aann(P.D,P.dr)))/1000,u:'kN',hint:'F = p_A·A₁ − p_B·A₂.',set:{comp:'cyl'},rand:P=>{P.D=pick([40,50,63,80]);P.dr=Math.round(P.D*.56);P.pA=rnd(50,200,10);P.pB=rnd(0,60,5);}},
    {q:P=>`POCV ביחס ${P.ratio}:1 מחזיק עומס של ${P.pOut} bar. מה לחץ הפיקוד המינימלי?`,a:P=>P.pOut/P.ratio,u:'bar',hint:'p_X = p_load / יחס.',set:{comp:'pocv'},rand:P=>{P.ratio=pick([3,4,5,8]);P.pOut=rnd(60,250,10);}}],
  faults:[{id:'spring',t:'קפיץ האל-חוזר שבור',sym:'"האל-חוזר נפתח גם בהפרש לחץ זעיר, ולפעמים מרפרף."',hint:'השוו את ה-Δp שבו הכדור עולה ללחץ הפתיחה בלוח.',why:'בלי קפיץ הכדור עולה בכל Δp חיובי – לחץ הפתיחה אפס.',set:{comp:'check',pIn:5.5,pOut:5}},
    {id:'stuck',t:'פופט שסתום הפריקה תקוע פתוח',sym:'"המשאבה לא בונה לחץ, ושמן חם חוזר למיכל כל הזמן."',hint:'מה מצב הפופט כשהלחץ נמוך מהכיול?',why:'לכלוך על הבית מחזיק את הפופט פתוח גם מתחת לכיול.',set:{comp:'relief',pIn:40,pset:80}},
    {id:'rstuck',t:'ספול ווסת הלחץ תקוע פתוח',sym:'"המלחציים לוחצים חזק מדי ומעוותים את החלק."',hint:'השוו את לחץ היציאה לכיול.',why:'הספול לא זז: היציאה שווה לכניסה.',set:{comp:'reduce',pIn:150,pset:60}},
    {id:'notch',t:'ספול שחוק (דליפה במצב אמצעי)',sym:'"הצילינדר זוחל כשהידית באמצע."',hint:'בדקו את הלחץ ב-A כשהספול במרכז.',why:'הבליטה שחוקה ושמן עובר מ-P ל-A גם במצב אמצעי.',set:{comp:'dcv',pos:'0'}},
    {id:'seal',t:'אטם בוכנה דולף',sym:'"הצילינדר חלש – לא מגיע לכוח שחישבנו."',hint:'השוו את הכוח נטו ל-p_A·A₁ − p_B·A₂.',why:'שמן עובר בין התאים, והלחצים מתקרבים זה לזה – הכוח נופל.',set:{comp:'cyl'}}],
  test(H){const P=clone(this.P);const R1=this.step(P,{},0,{});const P2=Object.assign(clone(P),{comp:'cyl'});const R2=this.step(P2,this.init(P2),0,{});const P3=Object.assign(clone(P),{comp:'pocv',pOut:120,pX:30,ratio:4,pIn:0});const R3=this.step(P3,{},0,{});
    return [['Δp אל-חוזר',R1.x.dp,15],['F = pA·A1 − pB·A2',R2.x.F,H.F(80,H.A(63))-H.F(10,H.Aann(63,36))],['אל-חוזר מפוקד נפתח ב-p/יחס',R3.x.lift,1],['UI כוח',R2.read[2].v*1000,R2.x.F]];}};

/* ---------- 10 · reading a circuit drawing ---------- */
const S10K=[['?','?','#94a3b8'],['P','לחץ','#dc2626'],['W','עבודה','#ea580c'],['T','חזרה','#2563eb'],['S','יניקה','#7e22ce'],['X','פיקוד/ניקוז','#0f766e']];
const S10LINES={LS:'S',LP:'P',LR:'P',LRT:'T',LP1:'P',LP2:'P',LA1:'W',LB1:'W',LA2:'W',LB2:'W',LT1:'T',LT2:'T',LDR:'X',LPR:'P'};
const SEQ=[['V1','a','A+'],['V2','a','B+'],['V2','b','B−'],['V1','b','A−']];
SYM.badge={ports:o=>({}),bb:o=>[-11,-9,11,9],draw(g,o){const r=sv('rect',{x:-11,y:-8,width:22,height:16,rx:8,fill:'#fff',stroke:'#94a3b8','stroke-width':1.4},g);const t=sv('text',{x:0,y:3.5,class:'st'},g);t.style.fontSize='9px';t.style.fontWeight='800';
  return cs=>{if(!cs)return;const k=S10K[cs.k||0];t.textContent=cs.k?k[0]:String(o.n);r.setAttribute('stroke',cs.ok===true?'#15803d':cs.ok===false?'#dc2626':k[2]);r.setAttribute('fill',cs.ok===true?'#ecfbf2':cs.ok===false?'#fdeeee':'#fff');t.style.fill=k[2];};}};
B3.badge=()=>({g:new THREE.Group()});
const SIM_READ={id:'read',n:10,t:'קריאת שרטוט',d:'מסמנים קווי לחץ, עבודה, חזרה ופיקוד – ובודקים מול ההפעלה; דיאגרמת מהלך-צעד',
  P:{Q:24,pr:120,D1:50,D2:40,S1:200,S2:150,F1:3000,F2:6000,pred:50,run:false,marks:{},check:false,mode2:'mark'},
  ui(U,P){U.grp('סימון קווים');U.note('לחצו על העיגול שעל כל קו כדי לבחור: לחץ / עבודה / חזרה / יניקה / פיקוד-ניקוז.');U.btn('✔ בדיקת הסימון',()=>{P.check=true;});U.btn('↺ ניקוי סימון',()=>{P.marks={};P.check=false;});
    U.grp('הפעלת הרצף');U.chk(P,'run','הפעלת רצף A+ B+ B− A−');U.num(P,'Q','ספיקת משאבה','L/min',{min:2,max:100,step:1});U.num(P,'pred','כיול ווסת לחץ','bar',{min:10,max:150,step:5});
    U.grp('צילינדרים',false);U.num(P,'D1','קוטר A','mm',{min:25,max:125,step:5});U.num(P,'D2','קוטר B','mm',{min:25,max:125,step:5});U.num(P,'F1','עומס A','N',{min:0,max:50000,step:500});U.num(P,'F2','עומס B','N',{min:0,max:50000,step:500});},
  circuit(P){const b=(id,n,x,y)=>({id,type:'badge',x,y,o:{n},name:'קו '+n+' – לחצו לסימון'});return {comps:[
      {id:'C1',type:'cyl',x:150,y:50,o:{},name:'צילינדר A – הידוק',lbl:'A',lblAt:[-72,-20],l3:[0,-34]},{id:'C2',type:'cyl',x:430,y:50,o:{},name:'צילינדר B – עבודה',lbl:'B',lblAt:[-72,-20],l3:[0,-34]},
      {id:'V1',type:'dcv',x:150,y:175,o:{box:KIT.D43.tandem,L:'sol',R:'sol',center:true},name:'שסתום 4/3 מרכז טנדם, סולנואידים (צילינדר A)',lbl:'V1',lblAt:[78,4]},
      {id:'V2',type:'dcv',x:430,y:175,o:{box:KIT.D43.closed,L:'sol',R:'sol',center:true},name:'שסתום 4/3 מרכז סגור, סולנואידים (צילינדר B)',lbl:'V2',lblAt:[78,4]},
      {id:'RD',type:'pv',x:430,y:262,o:{kind:'reduce'},name:'ווסת לחץ לענף B',lbl:'ווסת לחץ',lblAt:[-44,4]},
      {id:'P1',type:'pump',x:290,y:380,name:'משאבה',lbl:'משאבה',lblAt:[34,6]},{id:'T1',type:'tank',x:290,y:426,name:'מיכל'},
      {id:'RV',type:'pv',x:240,y:330,rot:-90,o:{kind:'relief'},name:'שסתום פריקה',lbl:'פריקה',lblAt:[0,-30]},{id:'T2',type:'tank',x:200,y:342,name:'מיכל'},
      {id:'T3',type:'tank',x:230,y:236,name:'מיכל'},{id:'T4',type:'tank',x:510,y:236,name:'מיכל'},{id:'T5',type:'tank',x:520,y:300,name:'מיכל ניקוז'},
      {id:'G1',type:'gauge',x:330,y:318,net:'P',name:'מד לחץ משאבה',valAt:[14,-6],val:R=>R.showP?`${fmt(R.pP,1)} bar`:'? bar'},
      {id:'CH',type:'chart',x:690,y:200,o:{w:150,h:120,xl:'צעד',yl:'מהלך',t:'דיאגרמת מהלך-צעד'},name:'דיאגרמת מהלך-צעד: A (כתום) ו-B (סגול)'},
      b('b1','1',290,350),b('b2','2',265,330),b('b3','3',195,225),b('b4','4',143,120),b('b5','5',157,100),b('b6','6',430,300),b('b7','7',423,120),b('b8','8',437,100),b('b9','9',470,214),b('b10','10',290,402),b('b11','11',490,278)],
    lines:[{id:'LS',net:'S',pts:['T1.t','P1.in']},{id:'LP',net:'P',pts:['P1.out',[290,330],[290,300]]},{id:'LR',net:'P',pts:[[290,330],'RV.P']},{id:'LRT',net:'T',pts:['RV.T',[200,330],'T2.t']},{id:'LGx',net:'P',pts:[[290,330],[330,330]],nodot:true},
      {id:'LP1',net:'P',pts:[[290,300],[143,300],'V1.P']},{id:'LP2',net:'P',pts:[[290,300],[430,300],'RD.P']},{id:'LPR',net:'PR',pts:['RD.T','V2.P']},
      {id:'LA1',net:'A1',pts:['V1.A',[143,120],[100,120],'C1.A']},{id:'LB1',net:'B1',pts:['V1.B',[157,100],[200,100],'C1.B']},{id:'LT1',net:'T',pts:['V1.T',[157,225],[230,225],'T3.t']},
      {id:'LA2',net:'A2',pts:['V2.A',[423,120],[380,120],'C2.A']},{id:'LB2',net:'B2',pts:['V2.B',[437,100],[480,100],'C2.B']},{id:'LT2',net:'T',pts:['V2.T',[437,214],[510,214],'T4.t']},
      {id:'LDR',net:'T',kind:'drain',pts:['RD.L',[490,278],[520,278],'T5.t']}]};},
  init:P=>({x1:0,x2:0,i:0,dw:0,hist:[[0,0,0]],step:0,si1:1,si2:1}),
  click(id,P){if(id.startsWith('b')){const ln={b1:'LP',b2:'LR',b3:'LT1',b4:'LA1',b5:'LB1',b6:'LP2',b7:'LA2',b8:'LB2',b9:'LT2',b10:'LS',b11:'LDR'}[id];P.marks=Object.assign({},P.marks);P.marks[ln]=((P.marks[ln]||0)+1)%S10K.length;P.check=false;return true;}},
  step(P,st,dt,ctx){const f=ctx.fault;const A1=H.A(P.D1),A1r=H.Aann(P.D1,P.D1*.56),A2=H.A(P.D2),A2r=H.Aann(P.D2,P.D2*.56);let v1=0,v2=0,ps=0,pos1='0',pos2='0',r=null,dir=0;const pr2=Math.min(P.pred,P.pr);
    if(P.run){const [V,pos]=SEQ[st.i];const target=V==='V1'?(pos==='a'?1:0):(pos==='a'?1:0);let swap=f==='swap'&&V==='V2'?-1:1;dir=(pos==='a'?1:-1)*swap;
      if(V==='V1'){pos1=pos;const F=P.F1*(dir>0?1:-.2);r=H.lin({Qp:P.Q,pr:P.pr,Ain:dir>0?A1:A1r,Aout:dir>0?A1r:A1,F:(dir>0?st.x1>=1:st.x1<=0)?1e9:Math.abs(F)*(dir>0?1:0)});v1=dir*r.v/P.S1;st.x1=clamp(st.x1+v1*dt,0,1);}
      else{pos2=pos;const atE=dir>0?st.x2>=1:st.x2<=0;const pAvail=f==='rdlow'?pr2*.4:pr2;r=H.lin({Qp:P.Q,pr:pAvail,Ain:dir>0?A2:A2r,Aout:dir>0?A2r:A2,F:atE?1e9:(dir>0?P.F2:0)});v2=dir*r.v/P.S2;st.x2=clamp(st.x2+v2*dt,0,1);}
      const x=V==='V1'?st.x1:st.x2;const done=(target===1&&x>=1)||(target===0&&x<=0);const stall=r&&r.stall&&!done;
      if(done||stall&&st.tt>4){st.dw+=dt;if(st.dw>.6){st.dw=0;st.tt=0;st.i=(st.i+1)%4;st.step++;if(st.i===0){st.hist=[[0,st.x1,st.x2]];st.step=0;}else st.hist.push([st.step,st.x1,st.x2]);}}else{st.tt=(st.tt||0)+dt;}
      ps=r?r.ps:0;}
    else{const rr=H.lin({Qp:P.Q,pr:P.pr,Ain:A1,Aout:A1r,F:1e9});ps=f==='tandem'?rr.ps:.8;}
    KIT.ease(st,'si1',KIT.idx[pos1],dt);KIT.ease(st,'si2',KIT.idx[pos2],dt);KIT.rpmAng(st,dt,1450);
    // V1 has a tandem centre: P→T at idle → pump unloaded
    const V=P.run?SEQ[st.i][0]:'';const pIdle=f==='tandem'?Math.min(P.pr,P.pr):.8;const pP=P.run?ps:pIdle;const pRed=Math.min(pP,f==='rdlow'?pr2*.4:pr2);
    const pa1=V==='V1'&&dir>0?pP:V==='V1'&&dir<0?.5:H.p(P.F1*0,A1)+.5,pb1=V==='V1'&&dir<0?pP:.5,pa2=V==='V2'&&dir>0?pRed:.5,pb2=V==='V2'&&dir<0?pRed:.5;
    const pm=KIT.nice(P.pr*1.05);const Q=P.Q,qp=P.run?Q:Q;const live=[...st.hist,[st.step+(P.run?.5:0),st.x1,st.x2]];
    const marks=P.marks||{};const cB={};const lid={b1:'LP',b2:'LR',b3:'LT1',b4:'LA1',b5:'LB1',b6:'LP2',b7:'LA2',b8:'LB2',b9:'LT2',b10:'LS',b11:'LDR'};let ok=0,tot=0;
    for(const b in lid){const k=marks[lid[b]]||0;const want=S10LINES[lid[b]];const good=S10K[k][0]===want;if(k)tot++;if(good)ok++;cB[b]={k,ok:P.check?good:null};}
    const allMarked=Object.keys(lid).every(b=>marks[lid[b]]);
    const showP=P.check||P.run||ctx.mode!=='explore'||allMarked;
    const PP={S:-.05,P:pP,PR:pRed,A1:pa1,B1:pb1,A2:pa2,B2:pb2,T:.6};if(!showP)for(const k in PP)PP[k]=pm*.3;
    return {p:PP,q:showP?{LS:Q,LP:Q,LR:r?r.Qr:(P.run?0:0),LRT:r?r.Qr:0,LP1:V==='V1'?Q:(P.run?0:(f==='tandem'?0:Q)),LP2:V==='V2'?Q:0,LPR:V==='V2'?Q:0,LA1:V==='V1'?dir*Q:0,LB1:V==='V1'?-dir*Q*A1r/A1:0,LA2:V==='V2'?dir*Q:0,LB2:V==='V2'?-dir*Q*A2r/A2:0,LT1:V==='V1'?Q:(P.run?0:Q),LT2:V==='V2'?Q:0}:{},
      pmax:pm,qref:Q,ok,tot,n:Object.keys(lid).length,showP,colorsOff:!showP,step:st.i,dir,pP,pRed,v1,v2,
      c:{C1:{x:st.x1,uA:pa1/pm,uB:pb1/pm},C2:{x:st.x2,uA:pa2/pm,uB:pb2/pm},V1:{i:st.si1},V2:{i:st.si2},P1:{on:true,ang:st.ang},RV:{open:r?clamp(r.Qr/Q,0,1):0},RD:{open:pRed<pP?.4:1},G1:{p:showP?pP:0},...cB,
        CH:{s:[{p:live.map(h=>[h[0],h[1]]),c:'#ea580c'},{p:live.map(h=>[h[0],h[2]+1.3]),c:'#7e22ce'}],x:[0,4],y:[0,2.4]}},
      read:[{k:'סימונים נכונים',v:ok,u:`/${Object.keys(lid).length}`,max:Object.keys(lid).length},{k:'לחץ משאבה',v:pP,u:'bar'},{k:'לחץ אחרי ווסת הלחץ',v:pRed,u:'bar'},{k:'מהלך A',v:st.x1*P.S1,u:'mm',max:P.S1},{k:'מהלך B',v:st.x2*P.S2,u:'mm',max:P.S2},{k:'צעד ברצף',v:P.run?st.i+1:0,u:'/4'}]};},
  ins(P,R){const L=[];if(!P.run&&!P.check)L.push({ic:'✏️',h:`סמנו את 11 הקווים (לחיצה על העיגולים). אחר כך <b>בדיקת הסימון</b> ו<b>הפעלת הרצף</b>. סומנו ${R.tot} מתוך ${R.n}.`});
    if(P.check)L.push({ic:R.ok===R.n?'🏆':'🔍',w:R.ok<R.n,h:`${R.ok} מתוך ${R.n} נכונים. ירוק = נכון, אדום = לבדוק שוב. רמז: קווי עבודה (A/B) מחליפים תפקיד – פעם לחץ ופעם חזרה.`});
    L.push({ic:'🎨',h:'מוסכמה: קו רציף = קו עבודה/לחץ/חזרה; קו מקווקו ארוך = פיקוד; מקווקו קצר = ניקוז. ההבדל בין לחץ לחזרה לא מסומן בשרטוט – מבינים אותו מהחיבורים.'});
    if(P.run)L.push({ic:'🪜',at:'CH',h:`צעד ${R.step+1}: ${SEQ[R.step][2]}. בדיאגרמת מהלך-צעד: קו עולה = יציאה, קו יורד = חזרה.`});
    L.push({ic:'🔄',at:'V1',h:'V1 עם מרכז טנדם: במנוחה P מחובר ל-T והמשאבה פורקת בלחץ נמוך. V2 סגור במרכז ומקבל לחץ דרך ווסת הלחץ.'});return L;},
  calc(P,R){const A1=H.A(P.D1),A1r=H.Aann(P.D1,P.D1*.56),A2=H.A(P.D2),A2r=H.Aann(P.D2,P.D2*.56);const t=[P.S1/H.v(P.Q,A1),P.S2/H.v(P.Q,A2),P.S2/H.v(P.Q,A2r),P.S1/H.v(P.Q,A1r)];
    return `<div class="kpis">${kpi('זמן A+',fmt(t[0],2),'s')}${kpi('זמן B+',fmt(t[1],2),'s')}${kpi('זמן B−',fmt(t[2],2),'s')}${kpi('זמן A−',fmt(t[3],2),'s')}</div>`+
    det('זמני צעדים',SEQ.map((s,k)=>row(s[2],`t = S/v = S·A/Q = ${V(t[k],'s')}`)).join(''),true)+det('לחצי עבודה',row('A+',`p = F_A/A₁ = ${V(H.p(P.F1,A1),'bar')}`)+row('B+',`p = F_B/A₁ = ${V(H.p(P.F2,A2),'bar')} (מוגבל ע"י ווסת הלחץ ל-${fmt(P.pred,0)} bar)`,H.p(P.F2,A2)<=P.pred));},
  demo:[{t:'שרטוט עם שני צילינדרים',x:'משאבה עם שסתום פריקה מזינה שני שסתומי 4/3 עם סולנואידים. לענף של צילינדר B יש ווסת לחץ עם קו ניקוז (מקווקו קצר).',reset:true,hl:['P1','V1','V2']},
    {t:'קווי לחץ',x:'מהמשאבה דרך שסתום הפריקה ועד כניסת P של השסתומים – <b>קווי לחץ</b>. הם בלחץ בכל פעם שמשהו עובד.',hl:['P1','RV'],act:P=>{P.marks={LP:1,LR:1,LP2:1};}},
    {t:'קווי עבודה',x:'A ו-B שבין השסתום לצילינדר הם <b>קווי עבודה</b>: פעם הם מקבלים לחץ ופעם מחזירים שמן.',hl:['C1','C2'],act:P=>{Object.assign(P.marks,{LA1:2,LB1:2,LA2:2,LB2:2});}},
    {t:'חזרה, יניקה וניקוז',x:'מ-T של השסתומים ושל שסתום הפריקה למיכל – <b>חזרה</b>. מהמיכל למשאבה – <b>יניקה</b>. מווסת הלחץ למיכל במקווקו – <b>ניקוז</b>.',act:P=>{Object.assign(P.marks,{LT1:3,LT2:3,LRT:3,LS:4,LDR:5});P.check=true;},hl:['RD']},
    {t:'הפעלה ובדיקה',x:'מפעילים את הרצף A+ B+ B− A−: צבעי הלחץ מופיעים ודיאגרמת מהלך-צעד נבנית.',set:{run:true},hl:['CH'],dur:14}],
  predict:[{q:'הרצף בצעד A+. איזה קו עבודה בלחץ גבוה?',set:{run:true},opts:['קו A של צילינדר A','קו B של צילינדר A','קו A של צילינדר B'],a:0,why:'ב-A+ השסתום V1 במצב a: P→A והצד המלא מקבל לחץ; B חוזר למיכל.'},
    {q:'שני השסתומים במרכז. מה הלחץ במשאבה?',set:{run:false},opts:['לחץ שסתום הפריקה','כמעט אפס'],a:1,why:'V1 עם מרכז טנדם מחבר P→T – המשאבה פורקת בלחץ נמוך.'},
    {q:'עומס B דורש 70 bar, ווסת הלחץ מכויל ל-50 bar. מה יקרה בצעד B+?',set:{run:true,F2:9000,pred:50},opts:['B יוצא רגיל','B לא יוצא – נעצר','B יוצא מהר יותר'],a:1,why:'ווסת הלחץ מגביל את הלחץ בענף ל-50 bar – לא מספיק לעומס.'}],
  tasks:[{q:P=>`Q = ${P.Q} L/min, צילינדר A Ø${P.D1}, מהלך ${P.S1} mm. כמה זמן לוקח A+?`,a:P=>P.S1/H.v(P.Q,H.A(P.D1)),u:'s',hint:'t = S·A/Q.',rand:P=>{P.Q=rnd(10,50,2);P.D1=pick([40,50,63]);P.S1=rnd(100,300,25);}},
    {q:P=>`עומס B = ${P.F2} N על Ø${P.D2}. איזה לחץ צריך בצעד B+?`,a:P=>H.p(P.F2,H.A(P.D2)),u:'bar',hint:'p = F/A.',rand:P=>{P.F2=rnd(2000,12000,500);P.D2=pick([32,40,50]);}}],
  faults:[{id:'swap',t:'צינורות A ו-B של צילינדר B הוחלפו',sym:'"ברצף, צילינדר B זז הפוך: נכנס כשצריך לצאת."',hint:'הסתכלו בדיאגרמת מהלך-צעד על הקו הסגול בצעד B+.',why:'הצינורות מחוברים הפוך: מצב a מכניס את המוט במקום להוציא.',set:{run:true}},
    {id:'rdlow',t:'ווסת הלחץ מכויל נמוך מדי',sym:'"צילינדר B לא מסיים את המהלך כשיש עליו עומס."',hint:'השוו את הלחץ אחרי ווסת הלחץ ללחץ הדרוש לעומס B.',why:'ווסת הלחץ מוציא רק 40% מהכיול – לא מספיק לעומס.',set:{run:true,F2:8000}},
    {id:'tandem',t:'הותקן שסתום V1 עם מרכז סגור במקום טנדם',sym:'"במנוחה המשאבה נשארת בלחץ גבוה והשמן מתחמם."',hint:'מה הלחץ במשאבה כשהרצף כבוי?',why:'בלי מרכז טנדם אין פריקה: כל הספיקה עוברת בשסתום הפריקה.',set:{run:false}}],
  qaT:8,
  test(H){const P=clone(this.P);P.run=true;const st=this.init(P);let R;for(let t=0;t<.5;t+=.02)R=this.step(P,st,.02,{});const A1=H.A(50);
    return [['v = Q/A (A+)',R.v1*P.S1,H.v(P.Q,A1),.02],['לחץ A+ = F/A',R.pP,P.F1*10/A1,.03],['UI מהלך A',R.read[3].v,st.x1*P.S1]];}};

LABS.push({ch:4,title:'סמלים וקריאת שרטוטים',sims:[SIM_SYM,SIM_READ]});
}
