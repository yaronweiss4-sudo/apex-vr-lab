/* lab 17 – same code as the website */
{




/* ===================== Chapter 17 – hydraulic motor circuits: inertia load (49) and cross-port braking (50) ===================== */
/* Dynamic model: motor + flywheel (J), two compressible line volumes A and B (K/V), pump with relief, 4/3 valve, optional cross-port reliefs + makeup checks. */
const C17_K=14000;   // effective bulk modulus [bar]
const C17_CEN={tandem:['P>A B>T','P-T A| B|','P>B A>T'],closed:KIT.D43.closed,float:KIT.D43.float};
const c17Q=(k,dp,p0=.5)=>Math.abs(dp)<p0?k*dp/Math.sqrt(p0):Math.sign(dp)*k*Math.sqrt(Math.abs(dp));   // orifice, linearised near 0
function c17Init(P){return {n:0,pA:0,pB:0,pP:0,t:0,hist:[],stop:null,last:null,si:KIT.idx[P.pos],ang:0,ma:0,cav:0};}
function c17Step(P,st,dt,o){ // o:{cen, cross, pc, pcA, pcB, mkA, mkB, pr, Cl}
  const Vg=P.Vg,J=P.J,Qp=P.Q,pr=o.pr,ov=Math.max(3,.06*pr),kv=Qp/Math.sqrt(3),V=.6,KV=C17_K/V;const dir=KIT.dirOf(P.pos);const cen=o.cen;const pv=-.9;
  const n0=st.n;let pk=st.stop?st.stop.pk:0,pmin=st.stop?st.stop.pmin:0;
  if(dir===0&&!st.stop&&Math.abs(st.n)>5)st.stop={t:0,n0:st.n,pk:0,pmin:0,done:false};
  if(dir!==0&&st.stop){st.last=st.stop.done?st.stop:st.last;st.stop=null;}
  const nsub=Math.ceil(dt/1e-4);const h=nsub?dt/nsub:0;let Qr=0,Qcr1=0,Qcr2=0,QmA=0,QmB=0,Qm=0;
  for(let i=0;i<nsub;i++){const w=st.n*2*PI/60;Qm=Vg*st.n/1000;const QL=o.Cl*(st.pA-st.pB);
    let inA=0,inB=0;Qr=0;
    if(dir>0){Qr=H.reliefQ(st.pA,pr,ov,Qp);inA=Qp-Qr;inB=-c17Q(kv,st.pB);st.pP=st.pA;}
    else if(dir<0){Qr=H.reliefQ(st.pB,pr,ov,Qp);inB=Qp-Qr;inA=-c17Q(kv,st.pA);st.pP=st.pB;}
    else{if(cen==='float'){inA=-c17Q(kv,st.pA);inB=-c17Q(kv,st.pB);}st.pP=cen==='closed'?pr:1;Qr=cen==='closed'?Qp:0;}
    Qcr1=o.cross?H.reliefQ(st.pA-st.pB,o.pcA,ov,Qp*1.5):0;Qcr2=o.cross?H.reliefQ(st.pB-st.pA,o.pcB,ov,Qp*1.5):0;
    const Ce=.004;let dA=inA-Qm-QL-Qcr1+Qcr2-Ce*Math.max(st.pA,0),dB=inB+Qm+QL+Qcr1-Qcr2-Ce*Math.max(st.pB,0);   // Ce: case-drain leakage of each line
    st.pA+=KV*dA/60*h;st.pB+=KV*dB/60*h;QmA=QmB=0;
    if(o.mkA&&st.pA<-.3){QmA=(-.3-st.pA)/KV*60/h;st.pA=-.3;}if(o.mkB&&st.pB<-.3){QmB=(-.3-st.pB)/KV*60/h;st.pB=-.3;}
    if(st.pA<pv){st.pA=pv;st.cav=1;}if(st.pB<pv){st.pB=pv;st.cav=1;}
    const Th=(st.pA-st.pB)*Vg/(20*PI);const Tf=P.TL*Math.tanh(st.n/3)+.002*P.J*st.n;let w2=w+(Th-Tf)/J*h;
    if(Math.sign(w2)!==Math.sign(w)&&w!==0&&Math.abs(Th)<P.TL)w2=0;st.n=w2*60/(2*PI);
    if(st.stop){pk=Math.max(pk,st.pA,st.pB);pmin=Math.min(pmin,st.pA,st.pB);}}
  st.cav=Math.max(0,st.cav-dt*2);
  if(st.stop){if(!st.stop.done)st.stop.t+=dt;st.stop.pk=pk;st.stop.pmin=pmin;if(!st.stop.done&&(Math.abs(st.n)<2||Math.sign(st.n)!==Math.sign(st.stop.n0))){st.stop.done=true;st.last=st.stop;}}
  st.t+=dt;KIT.rpmAng(st,dt,st.n,'ma');KIT.rpmAng(st,dt,1450);KIT.ease(st,'si',KIT.idx[P.pos],dt);
  if(dt>0&&(!st.ht||st.t-st.ht>.05)){st.ht=st.t;st.hist.push([st.t,st.pA,st.pB,st.n]);if(st.hist.length>170)st.hist.shift();}
  return {Qr,Qcr1,Qcr2,QmA,QmB,Qm,dir};}
function c17Circuit(P,cross){const comps=[{id:'P1',type:'pump',x:100,y:300,name:'משאבה קבועה + מנוע חשמלי',lbl:'משאבה',lblAt:[32,6]},{id:'T1',type:'tank',x:100,y:345,name:'מיכל'},
    {id:'RV',type:'pv',x:40,y:250,rot:-90,o:{kind:'relief'},name:'שסתום פריקה של המשאבה',lbl:'פריקה',lblAt:[0,-30]},{id:'T2',type:'tank',x:0,y:280,name:'מיכל'},
    {id:'V1',type:'dcv',x:180,y:190,o:{box:C17_CEN[P.cen||'tandem'],L:'lever',center:true},name:`שסתום פיקוד 4/3 – מרכז ${({tandem:'טנדם',closed:'סגור',float:'צף'})[P.cen||'tandem']} (לחיצה מחליפה מצב)`,lbl:'4/3',lblAt:[82,4]},{id:'T3',type:'tank',x:250,y:250,name:'מיכל'},
    {id:'M1',type:'motor',x:180,y:10,rot:-90,o:{bi:true},name:'מנוע הידראולי + גלגל תנופה (אינרציה J)',lbl:'מנוע + תנופה',lblAt:[52,20],l3:[30,-60],val:R=>`${fmt(R.n,0)} rpm`,valAt:[22,-40]},
    {id:'G2',type:'gauge',x:72,y:30,net:'A',name:'מד לחץ קו A',valAt:[-16,-2]},{id:'G3',type:'gauge',x:288,y:30,net:'B',name:'מד לחץ קו B'},
    {id:'CH1',type:'chart',x:430,y:30,o:{w:150,h:80,t:'לחץ בקווים',xl:'t [s]',yl:'bar'},name:'p_A (כחול) ו-p_B (אדום) לאורך זמן'},{id:'CH2',type:'chart',x:430,y:170,o:{w:150,h:80,t:'מהירות המנוע',xl:'t [s]',yl:'rpm'},name:'מהירות המנוע לאורך זמן'}];
  const lines=[{id:'LS',net:'S',pts:['T1.t','P1.in']},{id:'LP',net:'P',pts:['P1.out',[100,250],[173,250],'V1.P'],tag:{at:[140,272],t:'q'}},{id:'LRV',net:'P',pts:[[100,250],'RV.P']},{id:'LRT',net:'T',pts:['RV.T',[0,250],'T2.t']},
    {id:'LA',net:'A',pts:['V1.A',[173,140],[120,140],[120,10],'M1.A']},{id:'LB',net:'B',pts:['V1.B',[187,140],[240,140],[240,10],'M1.B']},{id:'LT',net:'T',pts:['V1.T',[187,225],[250,225],'T3.t']}];
  if(cross){comps.push({id:'CR1',type:'pv',x:180,y:52,rot:90,o:{kind:'relief'},name:'ביטחון מצולב A→B – בולם כשהלחץ ב-A גבוה',lbl:'A→B',lblAt:[0,-22]},{id:'CR2',type:'pv',x:180,y:98,rot:-90,o:{kind:'relief'},name:'ביטחון מצולב B→A – בולם כשהלחץ ב-B גבוה',lbl:'B→A',lblAt:[0,26]},
      {id:'CKA',type:'check',x:92,y:112,name:'אל-חוזר מילוי לקו A – מונע ואקום',lbl:'מילוי',lblAt:[-22,4]},{id:'T5',type:'tank',x:92,y:150,name:'מיכל'},{id:'CKB',type:'check',x:268,y:112,name:'אל-חוזר מילוי לקו B – מונע ואקום',lbl:'מילוי',lblAt:[24,4]},{id:'T6',type:'tank',x:268,y:150,name:'מיכל'});
    lines.push({id:'LC1',net:'A',pts:[[120,52],'CR1.P']},{id:'LC1b',net:'B',pts:['CR1.T',[240,52]]},{id:'LC2',net:'B',pts:[[240,98],'CR2.P']},{id:'LC2b',net:'A',pts:['CR2.T',[120,98]]},
      {id:'LMA0',net:'T',pts:['T5.t','CKA.in']},{id:'LMA',net:'A',pts:['CKA.out',[92,80],[120,80]]},{id:'LMB0',net:'T',pts:['T6.t','CKB.in']},{id:'LMB',net:'B',pts:['CKB.out',[268,80],[240,80]]});}
  return {comps,lines};}
function c17Out(P,st,f,cross,extra){const pm=KIT.nice(Math.max(P.pr,cross?P.pc:0,(st.last&&st.last.pk)||0,(st.stop&&st.stop.pk)||0)*1.05);const dir=f.dir;const nmax=P.Q*1000/P.Vg;
  const t0=st.hist.length?st.hist[0][0]:0,t1=Math.max(t0+8,st.t);const py=KIT.nice(Math.max(pm,10));const ny=KIT.nice(nmax*1.15);
  const Qa=dir>0?P.Q-f.Qr:dir<0?-Math.max(f.Qm,0):0,Qb=dir<0?P.Q-f.Qr:dir>0?-f.Qm:0;const S=st.stop||st.last;
  return {p:{P:st.pP,A:st.pA,B:st.pB,T:.3,S:-.05},q:{LS:P.Q,LP:dir?P.Q:(P.cen==='tandem'?P.Q:0),LRV:f.Qr,LRT:f.Qr,LA:dir>0?f.Qm:dir<0?-f.Qm:0,LB:dir>0?-f.Qm:dir<0?f.Qm:0,LT:dir?Math.abs(f.Qm):(P.cen==='tandem'?P.Q:0),
      LC1:f.Qcr1,LC1b:f.Qcr1,LC2:f.Qcr2,LC2b:f.Qcr2,LMA0:f.QmA,LMA:f.QmA,LMB0:f.QmB,LMB:f.QmB},pmax:pm,qref:P.Q,vac:st.pA<-.2||st.pB<-.2,cav:{LA:st.pA<-.8,LB:st.pB<-.8},
    n:st.n,nmax,S,dir,
    c:{P1:{on:true,ang:st.ang},RV:{open:clamp(f.Qr/P.Q,0,1)},V1:{i:st.si},M1:{ang:st.ma},CR1:{open:clamp(f.Qcr1/P.Q,0,1)},CR2:{open:clamp(f.Qcr2/P.Q,0,1)},CKA:{open:f.QmA>.05?1:0},CKB:{open:f.QmB>.05?1:0},
      CH1:{x:[t0,t1],y:[-5,py],s:[{p:st.hist.map(h=>[h[0],h[1]]),c:'#2563eb'},{p:st.hist.map(h=>[h[0],h[2]]),c:'#dc2626'}]},CH2:{x:[t0,t1],y:[-ny,ny],s:[{p:st.hist.map(h=>[h[0],h[3]]),c:'#0f766e'},{p:[[t0,0],[t1,0]],c:'#94a3b8',d:true}]}},
    read:[{k:'מהירות המנוע',v:st.n,u:'rpm',max:nmax},{k:'לחץ קו A',v:st.pA,u:'bar'},{k:'לחץ קו B',v:st.pB,u:'bar'},{k:'שיא לחץ',v:S?S.pk:0,u:'bar',w:S&&S.pk>350},{k:'לחץ מינימום',v:S?S.pmin:0,u:'bar',w:S&&S.pmin<-.5},{k:'זמן עצירה',v:S&&S.done?S.t:0,u:'s',dg:2},...(extra||[])]};}
const C17_TT=(P)=>[['a','◀ a','סיבוב קדימה'],['0','■ 0','עצירה – שסתום במרכז'],['b','b ▶','סיבוב אחורה']];

/* ---------- 49 · motor with an inertia load: start, run, stop ---------- */
const C17_INER={id:'iner',n:49,t:'מנוע עם עומס אינרציה',d:'בהאצה הלחץ מגיע לכיול; בעצירה האינרציה הופכת את המנוע למשאבה – קפיצת לחץ וואקום',
  P:{J:1.5,Vg:50,Q:30,pr:160,TL:20,cen:'tandem',pos:'a',auto:true},
  key:P=>P.cen,
  ui(U,P){U.grp('עומס ומנוע');U.num(P,'J','מומנט התמד J','kg·m²',{min:.05,max:20,step:.05});U.num(P,'TL','מומנט חיכוך','N·m',{min:0,max:300,step:5});U.num(P,'Vg','נפח המנוע Vg','cm³/rev',{min:5,max:500,step:1});
    U.grp('משאבה ושסתום');U.num(P,'Q','ספיקה','L/min',{min:2,max:200,step:1});U.num(P,'pr','כיול שסתום פריקה','bar',{min:20,max:300,step:5});U.sel(P,'cen','מרכז השסתום',[['tandem','טנדם (A,B חסומים)'],['closed','סגור'],['float','צף (A,B למיכל)']],true);
    U.grp('הפעלה',false);U.seg(P,'pos','מצב',C17_TT(P));U.chk(P,'auto','מחזור אוטומטי (הפעלה–עצירה)');},
  circuit:P=>c17Circuit(P,false),
  init:P=>c17Init(P),
  click(id,P){if(id==='V1'){P.pos=P.pos==='a'?'0':P.pos==='0'?'b':'a';P.auto=false;return true;}},
  step(P,st,dt,ctx){const f=ctx.fault;if(P.auto){st.cyc=(st.cyc||0)+dt;const T=8;const ph=st.cyc%T;const want=ph<4?'a':'0';if(P.pos!==want)P.pos=want;}
    const cen=f==='float'?'float':P.cen;const r=c17Step(P,st,dt,{cen,cross:false,pr:f==='relief'?P.pr*.5:P.pr,Cl:f==='worn'?.08:.012});
    return c17Out(P,st,r,false);},
  ins(P,R){const L=[];const Td=P.pr*P.Vg/(20*PI),w=P.Q*1000/P.Vg*2*PI/60;const ta=P.J*w/Math.max(Td-P.TL,1);
    L.push({ic:'🚀',h:`האצה: המנוע נותן עד ${fmt(Td,0)} N·m בכיול. זמן האצה ≈ J·ω/(T − T_f) = <b>${fmt(ta,2)} s</b>. בזמן הזה הלחץ בקו A צמוד לכיול.`,at:'M1'});
    if(R.dir!==0&&Math.abs(R.n)>.9*R.nmax)L.push({ic:'🔄',h:`ריצה יציבה: הלחץ ירד ל-${fmt(Math.abs(R.p.A-R.p.B),0)} bar – רק מה שהחיכוך דורש.`});
    if(R.dir===0&&Math.abs(R.n)>5&&P.cen!=='float')L.push({ic:'⚠️',w:true,at:'M1',h:'עצירה: הקווים חסומים, אבל הגלגל ממשיך להסתובב. המנוע הופך למשאבה – דוחס את קו B וריק את קו A.',c:'המנוע שואב את קו A ודוחס את קו B'});
    const S=R.S;if(S&&S.pk>300)L.push({ic:'💥',w:true,at:'G3',h:`שיא לחץ ${fmt(S.pk,0)} bar – מסכן צנרת ואטמים. פתרון: ביטחון מצולב (סימולציה 50).`});
    if(S&&S.pmin<-.5)L.push({ic:'🫧',w:true,at:'G2',h:`ואקום (${fmt(S.pmin,2)} bar) בקו היניקה – קוויטציה ורעש. פתרון: אל-חוזר מילוי מהמיכל.`});
    if(P.cen==='float')L.push({ic:'🌀',h:'מרכז צף: שני הקווים פתוחים למיכל – המנוע "מסתובב חופשי" ונעצר רק מהחיכוך. אין קפיצת לחץ, אבל גם אין בלימה.'});return L;},
  calc(P,R){const Td=P.pr*P.Vg/(20*PI),w=P.Q*1000/P.Vg*2*PI/60,E=.5*P.J*w*w;return `<div class="kpis">${kpi('מהירות',fmt(P.Q*1000/P.Vg,0),'rpm')}${kpi('מומנט מקס׳',fmt(Td,0),'N·m')}${kpi('אנרגיה בגלגל',fmt(E/1000,2),'kJ')}${kpi('זמן האצה',fmt(P.J*w/Math.max(Td-P.TL,1),2),'s')}</div>`+
    det('מומנט ותאוצה',row('',`T = Δp·Vg/(20π) = ${P.pr}·${P.Vg}/(20π) = ${V(Td,'N·m')}`)+row('',`α = (T − T_f)/J = ${V((Td-P.TL)/P.J,'rad/s²')}`)+row('',`t = ω/α = ${fmt(w,1)}/${fmt((Td-P.TL)/P.J,1)} = ${V(P.J*w/Math.max(Td-P.TL,1),'s')}`),true)+
    det('אנרגיה קינטית',row('',`ω = 2π·n/60 = ${V(w,'rad/s')}`)+row('',`E = ½·J·ω² = ${V(E,'J',0)}`),true)+
    det('קפיצת לחץ בעצירה',row('',`בלי שסתום – רק דחיסות השמן בולמת: Δp ≈ ${sq('2·K·E/V')}`)+row('',`K = 14,000 bar, V = 0.6 L ⇒ גבוה מאוד; בפועל מוגבל ע"י דליפות וצנרת`))+`<div class="note">המודל: מנוע + גלגל תנופה, שני קווים דחיסים (K/V), חיכוך קבוע. נצילות המנוע לא נלקחת בחשבון.</div>`;},
  demo:[{t:'מנוע וגלגל תנופה',x:'מנוע הידראולי מסובב גלגל תנופה כבד. האינרציה <b>J</b> שומרת את הגלגל בתנועה – גם כשמנסים לעצור.',reset:true,set:{auto:false,pos:'0'},hl:['M1']},
    {t:'האצה',x:'מזיזים ל-a: הגלגל לא מגיע מיד למהירות. הלחץ בקו A קופץ לכיול – כל הכוח הולך להאצה – והספיקה העודפת עוברת בשסתום הפריקה.',set:{pos:'a'},hl:['G2','RV','CH1'],dur:6},
    {t:'ריצה',x:'במהירות מלאה הלחץ יורד – רק החיכוך דורש מומנט.',hl:['CH2','G2'],dur:4},
    {t:'עצירה פתאומית',x:'מרכז טנדם: הקווים A ו-B נחסמים. הגלגל ממשיך להסתובב ודוחף שמן לקו B – <b>הלחץ שם קופץ מאוד</b>, ובקו A נוצר ואקום (סגול).',set:{pos:'0'},hl:['G3','G2','CH1'],dur:7},
    {t:'מרכז צף',x:'עם מרכז צף שני הקווים פתוחים למיכל: אין קפיצת לחץ, אבל הגלגל נעצר רק מהחיכוך – לאט.',set:{cen:'float',pos:'a',auto:true},hl:['V1','CH2'],dur:9},
    {t:'הבעיה – והפתרון',x:'צריך לבלום – אבל בלחץ מבוקר, ולמלא את צד היניקה. זה מה שעושים ביטחון מצולב ואל-חוזרי מילוי (סימולציה 50).',hl:['M1']}],
  predict:[{q:'המנוע מסתובב, ומעבירים את השסתום (מרכז טנדם) לאמצע. מה יקרה בקו B?',set:{auto:false,pos:'a'},act:(P,st)=>{st.n=P.Q*1000/P.Vg;st.pA=8;st.pB=1;},go:P=>{P.pos='0';},opts:['הלחץ יירד לאפס','הלחץ יקפוץ מאוד','לא ישתנה'],a:1,dur:3,why:'הגלגל ממשיך להסתובב ומנוע משמש כמשאבה לתוך קו חסום – הלחץ קופץ עד שהאנרגיה נבלמת.'},
    {q:'מכפילים את J (גלגל כבד פי 2). זמן ההאצה:',set:{J:3,auto:false,pos:'0'},go:P=>{P.pos='a';},opts:['פי 2','חצי','לא משתנה'],a:0,dur:5,why:'t = J·ω/(T − T_f): המומנט מוגבל ע"י הכיול, ולכן כפליים אינרציה = כפליים זמן.'},
    {q:'במרכז צף, מעבירים לאמצע בזמן ריצה. מה יקרה?',set:{cen:'float',auto:false,pos:'a'},act:(P,st)=>{st.n=P.Q*1000/P.Vg;},go:P=>{P.pos='0';},opts:['עצירה חדה','הגלגל ימשיך להסתובב ויאט לאט','הלחץ יקפוץ'],a:1,dur:4,why:'שני הקווים פתוחים למיכל, כך שאין מה שיבלום מלבד חיכוך.'}],
  tasks:[{q:P=>`Δp = ${P.pr} bar, Vg = ${P.Vg} cm³/rev. מה המומנט? (N·m)`,a:P=>P.pr*P.Vg/(20*PI),u:'N·m',hint:'T = Δp·Vg/(20π).',rand:P=>{P.pr=rnd(80,250,10);P.Vg=pick([16,25,50,80,125]);}},
    {q:P=>`J = ${P.J} kg·m², n = ${fmt(P.Q*1000/P.Vg,0)} rpm. מה האנרגיה הקינטית? (J)`,a:P=>.5*P.J*(P.Q*1000/P.Vg*2*PI/60)**2,u:'J',hint:'E = ½Jω², ω = 2πn/60.',rand:P=>{P.J=pick([.5,1,1.5,2,4]);P.Q=rnd(10,60,5);P.Vg=pick([25,50,80]);}},
    {q:P=>`J = ${P.J}, מומנט נטו ${fmt(P.pr*P.Vg/(20*PI)-P.TL,0)} N·m. כמה זמן להגיע ל-${fmt(P.Q*1000/P.Vg,0)} rpm?`,a:P=>P.J*(P.Q*1000/P.Vg*2*PI/60)/(P.pr*P.Vg/(20*PI)-P.TL),u:'s',hint:'t = J·ω/T_net.',rand:P=>{P.J=pick([.5,1,2,3]);P.pr=rnd(100,200,10);P.TL=rnd(0,40,5);}}],
  faults:[{id:'relief',t:'שסתום הפריקה מכויל נמוך',sym:'"הגלגל לוקח הרבה יותר זמן להגיע למהירות, אבל בסוף מגיע."',hint:'מה הלחץ בקו A בזמן ההאצה?',why:'הכיול (80 bar) מגביל את המומנט בהאצה – זמן ההאצה מוכפל. במהירות קבועה הכול רגיל.'},
    {id:'worn',t:'מנוע שחוק – דליפה פנימית גבוהה',sym:'"המהירות במצב יציב קצת נמוכה, ובעצירה הגלגל נעצר מהר יותר מבעבר."',hint:'השוו מהירות למחושבת Q/Vg, ובדקו את זמן העצירה.',why:'דליפה מ-B ל-A דרך המנוע "מנקזת" את הלחץ בבלימה, ובריצה מקטינה את המהירות.'},
    {id:'float',t:'הותקן שסתום עם מרכז צף במקום טנדם',sym:'"כשמזיזים לאמצע, הגלגל ממשיך להסתובב הרבה זמן."',hint:'מה הלחץ בשני הקווים כשהשסתום באמצע?',why:'במרכז צף A ו-B מחוברים למיכל – אין בלימה הידראולית בכלל.'}],
  test(H){const P=clone(this.P);P.auto=false;const st=this.init(P);let R;for(let t=0;t<5;t+=.02)R=this.step(P,st,.02,{});const nrun=st.n,dpr=st.pA-st.pB;const dp=20*PI*P.TL/P.Vg;const nexp=(P.Q-.012*dp)*1000/P.Vg;
    const P2=clone(this.P);P2.auto=false;const s2=this.init(P2);let ta=null;for(let t=0;t<5;t+=.005){this.step(P2,s2,.005,{});if(ta==null&&s2.n>=.95*(P2.Q*1000/P2.Vg))ta=t;}const w=P2.Q*1000/P2.Vg*.95*2*PI/60;const taE=P2.J*w/(P2.pr*P2.Vg/(20*PI)-P2.TL);
    P.pos='0';for(let t=0;t<2;t+=.02)R=this.step(P,st,.02,{});
    return [['n יציב = (Q − C·Δp)·1000/Vg',nrun,nexp,.01],['Δp יציב = 20π(T_f + b·n)/Vg',dpr,20*PI*(P.TL+.002*P.J*nrun)/P.Vg,.01],['זמן האצה ≈ J·ω/(T_max − T_f)',ta,taE,.15],['עצירה בטנדם: קפיצת לחץ מעל הכיול',R.S.pk>P.pr?1:0,1],['ואקום בצד היניקה',R.S.pmin<-.5?1:0,1]];}};

/* ---------- 50 · cross-port relief braking with makeup checks ---------- */
const C17_CROSS={id:'cross',n:50,t:'בלימה בשסתומי ביטחון מצולבים',d:'שסתומי ביטחון מצולבים ושסתומי מילוי: בלימה מבוקרת בלי שבר ובלי קוויטציה',
  P:{J:1.5,Vg:50,Q:30,pr:100,TL:20,pc:140,mk:true,cross:true,cen:'tandem',pos:'a',auto:true},
  key:P=>(P.cross?'c':'n')+(P.mk?'m':'x'),
  ui(U,P){U.grp('בלימה');U.chk(P,'cross','ביטחון מצולב',true);U.num(P,'pc','לחץ פתיחת שסתום הפריקה המצולב','bar',{min:10,max:350,step:5});U.chk(P,'mk','אל-חוזרי מילוי',true);
    U.grp('עומס ומנוע');U.num(P,'J','מומנט התמד J','kg·m²',{min:.05,max:20,step:.05});U.num(P,'Vg','נפח המנוע','cm³/rev',{min:5,max:500,step:1});U.num(P,'TL','מומנט חיכוך','N·m',{min:0,max:300,step:5});
    U.grp('משאבה',false);U.num(P,'Q','ספיקה','L/min',{min:2,max:200,step:1});U.num(P,'pr','כיול שסתום הפריקה של המשאבה','bar',{min:20,max:300,step:5});
    U.grp('הפעלה',false);U.seg(P,'pos','מצב',C17_TT(P));U.chk(P,'auto','מחזור אוטומטי (קדימה – עצירה – אחורה – עצירה)');},
  circuit(P){const c=c17Circuit(P,P.cross);if(!P.mk&&P.cross){c.comps=c.comps.filter(x=>!['CKA','CKB','T5','T6'].includes(x.id));c.lines=c.lines.filter(l=>!/^LM/.test(l.id));}return c;},
  init:P=>c17Init(P),
  click(id,P){if(id==='V1'){P.pos=P.pos==='a'?'0':P.pos==='0'?'b':'a';P.auto=false;return true;}},
  step(P,st,dt,ctx){const f=ctx.fault;if(P.auto){st.cyc=(st.cyc||0)+dt;const ph=st.cyc%16;const want=ph<4?'a':ph<8?'0':ph<12?'b':'0';if(P.pos!==want)P.pos=want;}
    const pcB=f==='crhi'?Math.max(P.pc*2.5,300):f==='crlo'?P.pc*.25:P.pc,pcA=P.pc;
    const r=c17Step(P,st,dt,{cen:P.cen,cross:P.cross,pcA,pcB,mkA:P.mk&&f!=='mkA',mkB:P.mk,pr:P.pr,Cl:.012});
    const w=P.Q*1000/P.Vg*2*PI/60;const tb=P.J*w/(P.pc*P.Vg/(20*PI)+P.TL);
    return c17Out(P,st,r,P.cross,[{k:'זמן בלימה מחושב',v:P.cross?tb:0,u:'s',dg:2}]);},
  ins(P,R){const L=[];const w=P.Q*1000/P.Vg*2*PI/60;const Tb=P.pc*P.Vg/(20*PI);
    if(P.cross)L.push({ic:'🛑',h:`בבלימה הלחץ מוגבל ל-${fmt(P.pc,0)} bar ⇒ מומנט בלימה ${fmt(Tb,0)} N·m. זמן עצירה ≈ J·ω/(T_b + T_f) = <b>${fmt(P.J*w/(Tb+P.TL),2)} s</b>.`,at:R.n>=0?'CR2':'CR1'});
    else L.push({ic:'⚠️',w:true,h:'בלי ביטחון מצולב, בעצירה הלחץ מוגבל רק ע"י דחיסות השמן – שיאים מסוכנים.',at:'M1'});
    if(R.dir===0&&Math.abs(R.n)>5&&P.cross)L.push({ic:'🔁',h:`בולמים: השמן עובר בשסתום הפריקה המצולב מהצד הגבוה לצד הנמוך ${P.mk?'והמילוי משלים את מה שחסר.':'– אבל בלי מילוי, הצד הנמוך נכנס לוואקום.'}`,at:R.n>=0?'CR2':'CR1'});
    if(!P.mk)L.push({ic:'🫧',w:true,at:'G2',h:'בלי אל-חוזרי מילוי: דליפות המנוע גורמות לחוסר שמן בצד היניקה בזמן בלימה – ואקום וקוויטציה.',c:'חסר מילוי – ואקום בבלימה'});
    if(P.pc>P.pr*1.2)L.push({ic:'💡',h:`שסתום הפריקה המצולב (${fmt(P.pc,0)} bar) גבוה מכיול המשאבה – בסדר, אבל ודאו שהצנרת והמנוע מתאימים ללחץ.`});
    if(P.pc<P.pr*.9&&P.cross)L.push({ic:'⚠️',w:true,at:'CR1',h:`שסתום הפריקה המצולב (${fmt(P.pc,0)} bar) נמוך מכיול המשאבה – בהאצה הוא ייפתח לפני שהמנוע מקבל את מלוא המומנט, והשמן יעקוף את המנוע.`});
    const S=R.S;if(S&&S.done)L.push({ic:'⏱',h:`עצירה אחרונה: ${fmt(S.t,2)} s, שיא ${fmt(S.pk,0)} bar, מינימום ${fmt(S.pmin,2)} bar. אחרי העצירה הלחץ הכלוא מסובב מעט אחורה (קפיצה חוזרת) עד שהדליפה משווה לחצים.`});return L;},
  calc(P,R){const w=P.Q*1000/P.Vg*2*PI/60,Tb=P.pc*P.Vg/(20*PI),E=.5*P.J*w*w;return `<div class="kpis">${kpi('מומנט בלימה',fmt(Tb,0),'N·m')}${kpi('זמן בלימה',fmt(P.J*w/(Tb+P.TL),2),'s')}${kpi('אנרגיה',fmt(E,0),'J')}${kpi('זווית עצירה',fmt(w*P.J*w/(Tb+P.TL)/2/(2*PI),2),'סיבובים')}</div>`+
    det('מומנט בלימה',row('',`T_b = p_c·Vg/(20π) = ${P.pc}·${P.Vg}/(20π) = ${V(Tb,'N·m')}`),true)+det('זמן וזווית עצירה',row('',`t = J·ω/(T_b + T_f) = ${P.J}·${fmt(w,1)}/(${fmt(Tb,0)} + ${P.TL}) = ${V(P.J*w/(Tb+P.TL),'s')}`)+row('',`θ = ω·t/2 = ${V(w*P.J*w/(Tb+P.TL)/2,'rad')}`),true)+
    det('חום בבלימה',row('',`כל האנרגיה E = ½Jω² = ${V(E,'J',0)} הופכת לחום בשסתום המצולב`))+`<div class="note">בחירת p_c: מעט מעל לחץ העבודה (כדי לא לפתוח בהאצה) ומתחת ללחץ המותר לרכיבים.</div>`;},
  demo:[{t:'הבעיה מ-49',x:'בלי הגנה, עצירה פתאומית של גלגל תנופה יוצרת שיא לחץ בקו אחד וואקום בשני.',reset:true,set:{cross:false,mk:false,auto:true},hl:['M1','CH1'],dur:9},
    {t:'ביטחון מצולב',x:'שני שסתומי פריקה בין הקווים, אחד לכל כיוון. כשהלחץ בצד הדוחס מגיע ל-<b>p_c</b>, השמן עובר לצד השני – והלחץ לא עולה יותר.',set:{cross:true,mk:false},hl:['CR1','CR2'],dur:9},
    {t:'אל-חוזרי מילוי',x:'בגלל דליפות במנוע, חוזר פחות שמן ממה שנשאב. אל-חוזרי המילוי מוסיפים שמן מהמיכל לצד היניקה – ואין ואקום.',set:{mk:true},hl:['CKA','CKB'],dur:9},
    {t:'זמן הבלימה',x:'לחץ הפתיחה קובע את מומנט הבלימה: <b>T_b = p_c·Vg/(20π)</b>. הגדלה של p_c – עצירה מהירה יותר, אבל עומס גבוה יותר.',set:{pc:200},hl:['CR2','CH2'],dur:9},
    {t:'בשני הכיוונים',x:'במחזור האוטומטי המנוע מסתובב קדימה ואחורה – כל פעם שסתום אחר בולם ואל-חוזר אחר ממלא.',set:{pc:140},hl:['CR1','CR2','CKA','CKB'],dur:12}],
  predict:[{q:'מורידים את p_c מ-140 ל-70 bar. זמן העצירה:',set:{pc:70,auto:false,pos:'a'},act:(P,st)=>{st.n=P.Q*1000/P.Vg;},go:P=>{P.pos='0';},opts:['יתקצר','יתארך','לא ישתנה'],a:1,dur:4,why:'מומנט הבלימה ∝ p_c. חצי לחץ ⇒ כמעט פי 2 זמן עצירה.'},
    {q:'מנתקים את אל-חוזרי המילוי. מה יקרה בעצירה?',set:{mk:false,auto:false,pos:'a'},act:(P,st)=>{st.n=P.Q*1000/P.Vg;},go:P=>{P.pos='0';},opts:['שום דבר','ואקום בצד היניקה','שיא לחץ גבוה יותר'],a:1,dur:4,why:'שסתום הפריקה המצולב מחזיר פחות ממה שהמנוע שואב (בגלל דליפות) – צד היניקה נכנס לוואקום.'}],
  tasks:[{q:P=>`p_c = ${P.pc} bar, Vg = ${P.Vg} cm³/rev. מה מומנט הבלימה? (N·m)`,a:P=>P.pc*P.Vg/(20*PI),u:'N·m',hint:'T = p·Vg/(20π).',rand:P=>{P.pc=rnd(60,250,10);P.Vg=pick([25,50,80,125]);}},
    {q:P=>`J = ${P.J}, n = ${fmt(P.Q*1000/P.Vg,0)} rpm, T_b = ${fmt(P.pc*P.Vg/(20*PI),0)} N·m, T_f = ${P.TL}. מה זמן הבלימה?`,a:P=>P.J*(P.Q*1000/P.Vg*2*PI/60)/(P.pc*P.Vg/(20*PI)+P.TL),u:'s',hint:'t = J·ω/(T_b + T_f).',rand:P=>{P.J=pick([.5,1,2,4]);P.pc=rnd(80,200,10);P.TL=rnd(0,40,5);}},
    {q:P=>`צריך לעצור תוך 0.5 s: J = ${P.J}, n = ${fmt(P.Q*1000/P.Vg,0)} rpm, Vg = ${P.Vg}, T_f = 0. מה p_c?`,a:P=>P.J*(P.Q*1000/P.Vg*2*PI/60)/.5*20*PI/P.Vg,u:'bar',hint:'T_b = J·ω/t, ואז p = 20π·T/Vg.',rand:P=>{P.J=pick([.5,1,2]);P.Vg=pick([50,80,125]);}}],
  faults:[{id:'mkA',t:'אל-חוזר המילוי בקו A תקוע סגור',sym:'"בעצירה מסיבוב קדימה יש רעש של חצץ, ובעצירה מסיבוב אחורה – לא."',hint:'עקבו אחרי הלחץ המינימלי בקו A בזמן עצירה מסיבוב קדימה.',why:'בעצירה מקדימה המנוע שואב מקו A. בלי מילוי מקו המיכל, קו A נכנס לוואקום – קוויטציה ורעש.'},
    {id:'crhi',t:'שסתום הפריקה המצולב B→A מכויל גבוה מאוד',sym:'"העצירה מסיבוב קדימה חדה מאוד ויש מכה בצנרת; אחורה – רגיל."',hint:'השוו את שיא הלחץ בעצירה בשני הכיוונים.',why:'ה-B→A בולם בעצירה מקדימה. כיול גבוה מדי = לחץ ומומנט בלימה גבוהים מדי.'},
    {id:'crlo',t:'שסתום הפריקה המצולב B→A מכויל נמוך מאוד',sym:'"אחרי סיבוב קדימה הגלגל ממשיך להסתובב הרבה זמן; אחורה – נעצר רגיל."',hint:'השוו את זמן העצירה בשני הכיוונים.',why:'כיול נמוך = מומנט בלימה קטן. העצירה מקדימה ארוכה מאוד.'}],
  test(H){const P=clone(this.P);P.auto=false;const st=this.init(P);for(let t=0;t<3;t+=.01)this.step(P,st,.01,{});P.pos='0';let R;for(let t=0;t<4;t+=.005)R=this.step(P,st,.005,{});const w=(P.Q-.012*20*PI*20/50)*1000/P.Vg*2*PI/60;
    const tb=P.J*w/(P.pc*P.Vg/(20*PI)+P.TL);
    return [['זמן בלימה ≈ J·ω/(T_b + T_f)',R.S.t,tb,.15],['שיא הלחץ ≈ p_c (ועוד חריגה)',R.S.pk,P.pc+Math.max(3,.06*P.pr),.08],['מילוי: אין ואקום',R.S.pmin>-.5?1:0,1],['T_b = p_c·Vg/20π',P.pc*P.Vg/(20*PI),140*50/(20*PI)]];}};

LABS.push({ch:17,title:'מעגלי מנוע הידראולי',sims:[C17_INER,C17_CROSS]});
}
