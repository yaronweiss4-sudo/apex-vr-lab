/* lab 16 – same code as the website */
{




/* ===================== Chapter 16 – accumulator circuits: emergency / flow-supplement source (47), shock absorption (48) ===================== */
const c16Pg=(V0,p0,n,Vo)=>(p0+1)*(V0/Math.max(V0-Vo,1e-6))**n-1;          // gauge bar from oil volume [L]
const c16Vo=(V0,p0,n,p)=>p<=p0?0:V0*(1-((p0+1)/(p+1))**(1/n));            // oil volume [L] at gauge pressure p

/* ---------- 47 · accumulator as an emergency source and flow supplement ---------- */
const C16_SRC={id:'src',n:47,t:'מצבר לחץ כמקור חירום',d:'משאבה קטנה + מצבר לחץ מול משאבה גדולה; כמה מהלכים אפשר לבצע בלי משאבה',
  P:{Qp:12,V0:10,p0:70,pr:160,D:63,d:36,S:400,F:20,Fr:5,Qn:60,pump:true,auto:true,pos:'0'},
  key:()=>'s',
  ui(U,P){U.grp('מצבר לחץ ומשאבה');U.num(P,'V0','נפח מצבר הלחץ V₀','L',{min:.5,max:100,step:.5});U.num(P,'p0','לחץ טעינת גז p₀','bar',{min:0,max:250,step:5});U.num(P,'Qp','ספיקת משאבה','L/min',{min:0,max:120,step:1});U.num(P,'pr','לחץ מקסימלי (שסתום פריקה)','bar',{min:20,max:350,step:5});
    U.grp('צילינדר (שער)');U.num(P,'F','עומס ביציאה','kN',{min:0,max:200,step:1});U.num(P,'S','מהלך','mm',{min:50,max:2000,step:10});U.num(P,'Qn','גודל שסתום (Q ב-5 bar)','L/min',{min:5,max:400,step:5});
    U.grp('הפעלה',false);U.chk(P,'pump','חשמל למשאבה (כיבוי = הפסקת חשמל)');U.chk(P,'auto','מחזור אוטומטי');U.seg(P,'pos','שסתום',KIT.pos3);
    U.grp('צילינדר – מידות',false);U.num(P,'D','קוטר בוכנה','mm',{min:20,max:200,step:1});U.num(P,'d','קוטר מוט בוכנה','mm',{min:8,max:150,step:1});U.num(P,'Fr','עומס בחזרה','kN',{min:0,max:200,step:1});},
  circuit(){return {comps:[{id:'C1',type:'cyl',x:330,y:20,o:{load:{t:'שער'}},name:'צילינדר שמזיז שער כבד',lbl:'צילינדר',lblAt:[-80,-22],l3:[0,-34]},
      {id:'V1',type:'dcv',x:330,y:130,o:{box:KIT.D43.closed,L:'lever',center:true},name:'שסתום פיקוד 4/3 מרכז סגור',lbl:'4/3',lblAt:[82,4]},{id:'T3',type:'tank',x:410,y:200,name:'מיכל'},
      {id:'P1',type:'pump',x:100,y:300,name:'משאבה קטנה + מנוע חשמלי',lbl:'משאבה',lblAt:[32,6]},{id:'T1',type:'tank',x:100,y:345,name:'מיכל'},
      {id:'CK',type:'check',x:100,y:220,name:'אל-חוזר – מונע ממצבר הלחץ להתרוקן דרך המשאבה',lbl:'אל-חוזר',lblAt:[-30,4]},
      {id:'RV',type:'pv',x:180,y:250,rot:90,o:{kind:'relief'},name:'שסתום פריקה',lbl:'פריקה',lblAt:[0,-24]},{id:'T2',type:'tank',x:220,y:280,name:'מיכל'},
      {id:'AC',type:'accum',x:200,y:120,name:'מצבר לחץ גז – אוגר שמן בלחץ',lbl:'מצבר',lblAt:[32,-4],l3:[0,-46]},{id:'G1',type:'gauge',x:150,y:150,net:'A',name:'מד לחץ המערכת',valAt:[-16,-2],l3:[0,-30]},
      {id:'CH1',type:'chart',x:560,y:40,o:{w:150,h:80,t:'לחץ המערכת',xl:'t [s]',yl:'bar'},name:'לחץ לאורך זמן; הקו המקווקו – הלחץ שהעומס דורש'},
      {id:'CH2',type:'chart',x:560,y:190,o:{w:150,h:80,t:'ספיקות',xl:'t [s]',yl:'L/min'},name:'ספיקת המשאבה (כחול) מול הספיקה שהצילינדר צורך (אדום)'}],
     lines:[{id:'LS',net:'S',pts:['T1.t','P1.in']},{id:'LP',net:'P',pts:['P1.out','CK.in'],tag:{at:[60,262],t:'q'}},{id:'L1',net:'A',pts:['CK.out',[100,170],[323,170],'V1.P']},{id:'L2',net:'A',pts:[[200,170],'AC.p'],tag:{at:[240,150],t:'q'}},
      {id:'LR',net:'A',pts:[[150,170],[150,250],'RV.P']},{id:'LR2',net:'T',pts:['RV.T',[220,250],'T2.t']},
      {id:'LA',net:'CA',pts:['V1.A',[323,70],[280,70],'C1.A']},{id:'LB',net:'CB',pts:['V1.B',[337,70],[380,70],'C1.B']},{id:'LT',net:'T',pts:['V1.T',[337,175],[410,175],'T3.t']}]};},
  init:P=>({Vo:c16Vo(P.V0,P.p0,1.4,P.pr*.99),x:0,ph:0,t:0,hist:[],si:1,strokes:0,pf:null,stall:false,dw:0,want:'a'}),
  click(id,P){if(id==='V1'){P.pos=P.pos==='a'?'0':P.pos==='0'?'b':'a';P.auto=false;return true;}if(id==='P1'){P.pump=!P.pump;return true;}},
  step(P,st,dt,ctx){const f=ctx.fault;const n=1.4;const p0=f==='lowpre'?6:P.p0;const A1=H.A(P.D),A2=H.Aann(P.D,Math.min(P.d,P.D-2));const kv=P.Qn/Math.sqrt(5);
    const Qp=P.pump?(f==='pumpwear'?P.Qp*.5:P.Qp):0;
    if(P.auto){const atEnd=(P.pos==='a'&&st.x>=P.S-1e-6)||(P.pos==='b'&&st.x<=1e-6);
      if(P.pos==='0'){st.dw+=dt;if(st.dw>5){P.pos=st.want;st.dw=0;}}else if(atEnd){P.pos='0';st.want=st.want==='a'?'b':'a';st.dw=0;}else if(st.stall){st.dw+=dt;}}
    const dir=KIT.dirOf(P.pos);let p=st.Vo>1e-9?c16Pg(P.V0,p0,n,st.Vo):0;
    const pL=dir>0?P.F*1e4/A1:dir<0?P.Fr*1e4/A2:0;const Ain=dir>0?A1:A2;
    let Qc=0;const atEnd=(dir>0&&st.x>=P.S-1e-6)||(dir<0&&st.x<=1e-6);
    if(dir&&!atEnd){if(st.Vo>1e-9)Qc=p>pL?kv*Math.sqrt(p-pL):0;else{Qc=Qp;p=Qp>0?pL+(Qp/kv)**2:0;}}
    st.stall=dir!==0&&!atEnd&&Qc<.02;
    const Qb=f==='checkleak'&&!P.pump?.03*Math.sqrt(Math.max(p,0)):0;
    let Qin=Qp;let Qr=0;if(p>=P.pr&&Qp>Qc){Qr=Qp-Qc;Qin=Qc;}
    st.Vo=clamp(st.Vo+(Qin-Qc-Qb)/60*dt,0,P.V0*.98);if(st.Vo>1e-9)p=c16Pg(P.V0,p0,n,st.Vo);
    const v=H.v(Qc,Ain);const x0=st.x;st.x=clamp(st.x+dir*v*dt,0,P.S);
    if(!P.pump&&st.pf==null){st.pf={strokes:0,t:0};}if(P.pump)st.pf=null;
    if(st.pf){st.pf.t+=dt;if((dir>0&&x0<P.S&&st.x>=P.S)||(dir<0&&x0>0&&st.x<=0))st.pf.strokes+=1;}
    KIT.ease(st,'si',KIT.idx[P.pos],dt);KIT.rpmAng(st,dt,P.pump?1450:0);st.t+=dt;
    if(dt>0&&(!st.ht||st.t-st.ht>.1)){st.ht=st.t;st.hist.push([st.t,p,Qp,Qc]);if(st.hist.length>200)st.hist.shift();}
    const pm=KIT.nice(P.pr*1.05);const t0=st.hist.length?st.hist[0][0]:0,t1=Math.max(t0+20,st.t);const qmax=KIT.nice(Math.max(Qp,...st.hist.map(h=>h[3]),5)*1.1);
    const Vu=c16Vo(P.V0,p0,n,P.pr)-c16Vo(P.V0,p0,n,P.F*1e4/A1+2);const Vc=(A1+A2)*P.S/1e6;
    const pA=dir>0?pL:dir<0?.5:0,pB=dir<0?pL:dir>0?.5:0;
    return {p:{P:P.pump?p+.3:.2,A:p,CA:dir>0&&!atEnd?pA:dir>0?p:pA,CB:dir<0&&!atEnd?pB:dir<0?p:pB,T:.3,S:-.05},q:{LS:Qp,LP:Qin,L1:Qc,L2:Qin-Qc-Qb,LR:Qr,LR2:Qr,LA:dir>0?Qc:-H.Q(v,A1)*(dir<0?1:0),LB:dir<0?Qc:-H.Q(v,A2)*(dir>0?1:0),LT:dir?H.Q(v,dir>0?A2:A1):0},pmax:pm,qref:Math.max(P.Qp,5),
      p0,pL:P.F*1e4/A1,Vu,Vc,Qc,Qp,v,st:st.stall,pf:st.pf,A1,A2,dir,
      c:{P1:{on:P.pump,ang:st.ang},CK:{open:Qin>.05?1:0},RV:{open:clamp(Qr/Math.max(P.Qp,1),0,1)},AC:{fill:st.Vo/P.V0,u:p/pm},V1:{i:st.si},C1:{x:st.x/P.S,uA:(dir>0?pA:.02*pm)/pm,uB:(dir<0?pB:.02*pm)/pm},G1:{p},
        CH1:{x:[t0,t1],y:[0,pm],s:[{p:st.hist.map(h=>[h[0],h[1]]),c:'#2563eb'},{p:[[t0,P.F*1e4/A1],[t1,P.F*1e4/A1]],c:'#f59e0b',d:true}]},
        CH2:{x:[t0,t1],y:[0,qmax],s:[{p:st.hist.map(h=>[h[0],h[2]]),c:'#2563eb'},{p:st.hist.map(h=>[h[0],h[3]]),c:'#dc2626'}]}},
      read:[{k:'לחץ המערכת',v:p,u:'bar'},{k:'שמן במצבר לחץ',v:st.Vo,u:'L',dg:2,max:P.V0},{k:'ספיקת הצילינדר',v:Qc,u:'L/min',max:qmax},{k:'ספיקת המשאבה',v:Qp,u:'L/min',max:qmax},{k:'מהירות הבוכנה',v:v,u:'mm/s'},
        {k:'מהלכים בלי חשמל',v:st.pf?st.pf.strokes:0,u:'',dg:0},{k:'נפח למחזור',v:Vc,u:'L',dg:2}]};},
  ins(P,R){const L=[];const cyc=R.Vc;const nCyc=R.Vu/cyc;
    L.push({ic:'📦',h:`נפח שימושי במצבר לחץ (מ-${fmt(P.pr,0)} עד ${fmt(R.pL+2,0)} bar): <b>${fmt(R.Vu,2)} L</b>; מחזור מלא צורך ${fmt(cyc,2)} L ⇒ כ-<b>${fmt(Math.floor(nCyc*2)/2,1)} מחזורים</b> בלי משאבה.`,at:'AC'});
    if(R.Qc>R.Qp+.5)L.push({ic:'➕',h:`הצילינדר צורך ${fmt(R.Qc,0)} L/min והמשאבה נותנת רק ${fmt(R.Qp,0)} – <b>מצבר הלחץ משלים ${fmt(R.Qc-R.Qp,0)} L/min</b>. משאבה קטנה + מצבר לחץ במקום משאבה גדולה.`,at:'AC'});
    if(R.dir===0&&P.pump)L.push({ic:'🔋',h:'בהמתנה המשאבה הקטנה טוענת מחדש את מצבר הלחץ, עד לשסתום הפריקה.'});
    if(!P.pump)L.push({ic:'⚡',w:true,at:'P1',h:`הפסקת חשמל! השער ממשיך לעבוד מאנרגיית מצבר הלחץ. האל-חוזר שומר שהשמן לא יברח דרך המשאבה.`,c:'בלי משאבה – רק מצבר הלחץ'});
    if(R.st)L.push({ic:'🛑',w:true,at:'C1',h:`הלחץ ירד מתחת ל-${fmt(R.pL,0)} bar שהעומס דורש – הצילינדר עומד. מצבר הלחץ "ריק" מבחינה שימושית, גם אם יש בו עוד שמן.`,c:'הלחץ לא מספיק לעומס'});
    if(R.p0>=R.pL)L.push({ic:'💡',h:`p₀ = ${fmt(R.p0,0)} bar ≥ לחץ העומס – בסדר: כל השמן במצבר לחץ שימושי. הנפח השימושי גדל כש-p₀ קרוב ל-p_min.`});return L;},
  calc(P,R){const n=1.4,a=R.p0+1;const pmin=R.pL+2;return `<div class="kpis">${kpi('נפח שימושי',fmt(R.Vu,2),'L')}${kpi('נפח למחזור',fmt(R.Vc,2),'L')}${kpi('מחזורים בלי משאבה',fmt(R.Vu/R.Vc,1))}${kpi('זמן טעינה מחדש',fmt(R.Vc/Math.max(P.Qp,.01)*60,1),'s')}</div>`+
    det('נפח שימושי (n = 1.4)',row('',`V₁ = V₀·(${fr('p₀+1','p_min+1')})^(1/n) = ${P.V0}·(${fmt(a,0)}/${fmt(pmin+1,0)})^(0.714) = ${V(P.V0*(a/(pmin+1))**(1/n),'L',3)}`)+row('',`V₂ = ${P.V0}·(${fmt(a,0)}/${fmt(P.pr+1,0)})^(0.714) = ${V(P.V0*(a/(P.pr+1))**(1/n),'L',3)}`)+row('',`ΔV = V₁ − V₂ = ${V(R.Vu,'L',3)}`),true)+
    det('צריכת הצילינדר',row('',`V = (A₁ + A₂)·s = (${fmt(R.A1,0)} + ${fmt(R.A2,0)})·${P.S} = ${V(R.Vc,'L',3)}`)+row('לחץ העומס',`p = F/A₁ = ${V(R.pL,'bar')}`),true)+
    det('משאבה קטנה + מצבר לחץ',row('',`ספיקת שיא = k·√(p − p_L) ≈ ${V(P.Qn/Math.sqrt(5)*Math.sqrt(Math.max(P.pr-R.pL,0)),'L/min')}`)+row('ממוצע למחזור',`Q = V_cycle/T = ${V(R.Vc/(2*(P.S/Math.max(R.v,1))+4)*60,'L/min')} (בערך)`))+`<div class="note">n = 1.4: פריקה מהירה (אדיאבטית). השסתום מיוצג כפתח: Q = k·√Δp.</div>`;},
  demo:[{t:'שער כבד, משאבה קטנה',x:'משאבה של 12 L/min בלבד, אבל הצילינדר צריך ספיקה גבוהה בזמן התנועה. <b>מצבר לחץ</b> אוגר שמן בזמן ההמתנה ומשחרר אותו בזמן התנועה.',reset:true,hl:['P1','AC','C1'],dur:8},
    {t:'השלמת ספיקה',x:'בגרף הספיקות: הקו האדום (צריכת הצילינדר) גבוה בהרבה מהכחול (המשאבה). ההפרש מגיע ממצבר הלחץ – ולכן הלחץ יורד בזמן התנועה, ועולה שוב בהמתנה.',hl:['CH2','CH1'],dur:10},
    {t:'טעינה מחדש',x:'בזמן ההמתנה בין המהלכים המשאבה ממלאת את מצבר הלחץ בחזרה עד שסתום הפריקה.',hl:['AC','RV'],dur:8},
    {t:'הפסקת חשמל',x:'מכבים את המשאבה. השער ממשיך לנוע – כל עוד הלחץ במצבר מעל מה שהעומס דורש. סופרים כמה מהלכים יצאו.',set:{pump:false},hl:['AC','C1','CK'],dur:14},
    {t:'מצבר לחץ גדול יותר',x:'מצבר לחץ של 20 L: כפול הנפח השימושי – כפול מהלכים בחירום.',set:{V0:20,pump:true},hl:['AC'],dur:8}],
  predict:[{q:'כמה מחזורים מלאים (יציאה + חזרה) אפשר לבצע בלי משאבה, עם הנתונים כאן?',set:{pump:false,auto:true},opts:['אף אחד','כ-2','כ-5','יותר מ-10'],a:1,dur:16,why:'נפח שימושי ≈ 4.4 L ומחזור צורך ≈ 2.1 L ⇒ כ-2 מחזורים (ועוד מעט, כי החזרה דורשת לחץ נמוך יותר).'},
    {q:'מגדילים את עומס השער ל-40 kN. מספר המהלכים בחירום:',set:{F:40,pump:false,auto:true},opts:['יגדל','יקטן','לא ישתנה'],a:1,dur:10,why:'עומס גבוה = לחץ מינימלי גבוה יותר, ולכן פחות מהנפח במצבר לחץ שימושי.'},
    {q:'המשאבה פועלת. בזמן היציאה, מאיפה מגיעה רוב הספיקה לצילינדר?',set:{auto:false,pos:'a'},opts:['מהמשאבה','ממצבר הלחץ','חצי-חצי'],a:1,dur:3,why:'הצילינדר צורך עשרות L/min והמשאבה נותנת 12 – רוב הספיקה מגיעה ממצבר הלחץ.'}],
  tasks:[{q:P=>`V₀ = ${P.V0} L, p₀ = ${P.p0} bar, פריקה מ-${P.pr} ל-${fmt(P.F*1e4/H.A(P.D)+2,0)} bar, n = 1.4. מה הנפח השימושי?`,a:P=>c16Vo(P.V0,P.p0,1.4,P.pr)-c16Vo(P.V0,P.p0,1.4,P.F*1e4/H.A(P.D)+2),u:'L',hint:'V = V₀·[((p₀+1)/(p_min+1))^(1/n) − ((p₀+1)/(p_max+1))^(1/n)].',rand:P=>{P.V0=pick([4,10,20]);P.p0=rnd(40,90,5);P.pr=rnd(140,210,10);P.F=rnd(10,40,5);}},
    {q:P=>`צילינדר D${P.D}/${P.d}, מהלך ${P.S} מ"מ. מה נפח השמן למחזור מלא? (L)`,a:P=>(H.A(P.D)+H.Aann(P.D,P.d))*P.S/1e6,u:'L',hint:'V = (A₁ + A₂)·s.',rand:P=>{P.D=pick([50,63,80,100]);P.d=Math.round(P.D*.56);P.S=rnd(200,1000,50);}},
    {q:P=>`מחזור צורך ${fmt((H.A(P.D)+H.Aann(P.D,P.d))*P.S/1e6,2)} L, והמשאבה נותנת ${P.Qp} L/min. כמה זמן לטעון מחדש? (s)`,a:P=>(H.A(P.D)+H.Aann(P.D,P.d))*P.S/1e6/P.Qp*60,u:'s',hint:'t = V/Q.',rand:P=>{P.Qp=rnd(4,20,1);P.S=rnd(200,800,50);}}],
  faults:[{id:'lowpre',t:'לחץ הגז במצבר לחץ אבד',sym:'"בהפסקת חשמל השער עושה רק חצי מהלך ונעצר; בעבודה רגילה הלחץ צונח מהר בכל תנועה."',hint:'השוו את מספר המהלכים בחירום לחישוב הנפח השימושי.',why:'p₀ ירד ל-6 bar: יש מעט מאוד גז דחוס בטווח העבודה, והנפח השימושי קטן מאוד.'},
    {id:'checkleak',t:'שסתום האל-חוזר דולף',sym:'"אחרי הפסקת חשמל, גם בלי להפעיל את השער, הלחץ במצבר יורד לאט."',hint:'השסתום באמצע והמשאבה כבויה – צפו במד ובגרף.',why:'השמן חוזר ממצבר הלחץ דרך האל-חוזר והמשאבה הדוממת למיכל.',set:{auto:false,pos:'0',pump:false}},
    {id:'pumpwear',t:'משאבה שחוקה – חצי ספיקה',sym:'"עם הזמן הלחץ בין המהלכים לא חוזר לשסתום הפריקה, והשער מאט."',hint:'צפו בגרף הלחץ לאורך כמה מחזורים.',why:'המשאבה לא מספיקה למלא את מצבר הלחץ בזמן ההמתנה – הלחץ הממוצע יורד ממחזור למחזור.'}],
  test(H){const P=clone(this.P);P.pump=false;const st=this.init(P);let R;for(let t=0;t<60;t+=.02)R=this.step(P,st,.02,{});const A1=H.A(63),A2=H.Aann(63,36);const Vc=(A1+A2)*400/1e6;
    const pL=20000*10/A1;const Vu=c16Vo(10,70,1.4,160)-c16Vo(10,70,1.4,pL+2);
    let V=c16Vo(10,70,1.4,160*.99),k=0;const pR=5000*10/A2;for(;k<40;k++){const ext=k%2===0;const need=ext?A1*400/1e6:A2*400/1e6;const floor=c16Vo(10,70,1.4,(ext?pL:pR)+.5);if(V-need<floor)break;V-=need;}
    return [['נפח למחזור (A₁+A₂)·s',R.Vc,Vc],['נפח שימושי (פוליטרופי)',R.Vu,Vu],['מהלכים בחירום (ספירת נפחים)',R.pf.strokes,k,.01],['UI לחץ',R.read[0].v,st.Vo>1e-9?c16Pg(10,70,1.4,st.Vo):0,.01]];}};

/* ---------- 48 · shock absorption: fast valve closure with / without an accumulator ---------- */
/* Lumped line: inertance I = ρL/A, compliance C_line = A·L/K (+ C_gas = V_gas/(n·p_abs)). Two models run side by side: with accumulator (per settings) and the same line without it. */
function c16Line(P,f){const A=PI*(P.dp/1000)**2/4,L=P.L,rho=870;const I=rho*L/A;const Cl=A*L/1.4e9;const mu=46e-6*rho;const R=128*mu*L/(PI*(P.dp/1000)**4)*3;return {A,I,Cl,R};}
function c16Cacc(P,p,f){if(!P.acc||f==='iso')return 0;const p0=f==='lowpre'?3:f==='highpre'?Math.max(P.p0,P.ps*1.6):P.p0;const n=1.4;const Vg=P.V0/1000*Math.min(1,((p0+1)/(Math.max(p,p0)+1))**(1/n));return Vg/(n*(Math.max(p,p0)+1)*1e5)*(p>=p0-1e-9?1:0.02);}
const C16_SHK={id:'shock',n:48,t:'ריסון זעזועים',d:'סגירה חדה של שסתום עם ובלי מצבר לחץ: שיא הלחץ, וטעינה מתאימה של הגז',
  P:{ps:100,Q:60,L:10,dp:16,tc:20,acc:true,V0:.5,p0:70,auto:true},
  key:P=>P.acc?'a':'n',
  ui(U,P){U.grp('מצבר לחץ ריסון');U.chk(P,'acc','מצבר לחץ ליד השסתום',true);U.num(P,'V0','נפח מצבר הלחץ','L',{min:.05,max:10,step:.05});U.num(P,'p0','לחץ טעינת גז p₀','bar',{min:0,max:300,step:5});
    U.grp('קו ושסתום');U.num(P,'ps','לחץ עבודה','bar',{min:10,max:300,step:5});U.num(P,'Q','ספיקה','L/min',{min:5,max:300,step:5});U.num(P,'L','אורך הצינור','m',{min:1,max:100,step:1});U.num(P,'dp','קוטר פנימי','mm',{min:6,max:50,step:1});U.num(P,'tc','זמן סגירת השסתום','ms',{min:1,max:500,step:1});
    U.grp('הפעלה',false);U.chk(P,'auto','סגירה אוטומטית חוזרת');U.btn('⚡ סגור עכשיו',()=>{APP.st.trig=true;});},
  circuit(P){const comps=[{id:'P1',type:'pump',x:60,y:220,name:'משאבה',lbl:'משאבה',lblAt:[32,6]},{id:'T1',type:'tank',x:60,y:265,name:'מיכל'},
      {id:'RV',type:'pv',x:10,y:150,rot:-90,o:{kind:'relief'},name:'שסתום פריקה – מחזיק את לחץ העבודה',lbl:'פריקה',lblAt:[0,-28]},{id:'T2',type:'tank',x:-30,y:180,name:'מיכל'},
      {id:'SV',type:'sv',x:400,y:120,rot:90,name:'שסתום שנסגר מהר (לחיצה סוגרת)',lbl:'שסתום מהיר',lblAt:[0,-22]},{id:'T3',type:'tank',x:450,y:175,name:'צרכן / מיכל'},
      {id:'G1',type:'gauge',x:360,y:80,net:'V',name:'מד לחץ ליד השסתום',l3:[0,-30],valAt:[-16,-2]},
      {id:'CH',type:'chart',x:610,y:120,o:{w:170,h:110,t:'לחץ ליד השסתום בזמן הסגירה',xl:'t [ms]',yl:'bar'},name:'אדום מקווקו – בלי מצבר לחץ; כחול – עם מצבר הלחץ כפי שהוגדר'}];
    if(P.acc)comps.push({id:'AC',type:'accum',x:340,y:20,name:'מצבר לחץ ריסון ליד השסתום',lbl:'מצבר',lblAt:[32,-4],l3:[0,-46]});
    const lines=[{id:'LS',net:'S',pts:['T1.t','P1.in']},{id:'LP',net:'U',pts:['P1.out',[60,120],[110,120]]},{id:'LR',net:'U',pts:[[60,150],'RV.P']},{id:'LR2',net:'T',pts:['RV.T',[-30,150],'T2.t']},
      {id:'LL',net:'M',pts:[[110,120],[384,120]],tag:{at:[240,146],t:R=>`L = ${P.L} m · Ø${P.dp} · ${fmt(R.v,1)} m/s`}},{id:'LO',net:'T',pts:['SV.out',[450,120],'T3.t'],tag:{at:[470,100],t:'q'}}];
    if(P.acc)lines.push({id:'LAC',net:'V',pts:[[340,120],'AC.p']});return {comps,lines};},
  init:P=>({t:0,ph:'open',tp:0,a:{Q:P.Q/6e4,p:P.ps},b:{Q:P.Q/6e4,p:P.ps},hist:[],pkA:P.ps,pkB:P.ps,lastA:null,lastB:null,trig:false,clk:0}),
  click(id,P,st){if(id==='SV'){APP.st.trig=true;return true;}},
  step(P,st,dt,ctx){const f=ctx.fault;const ln=c16Line(P,f);const slow=1/25;const sdt=dt*slow;st.clk+=dt;
    if(P.auto&&st.ph==='open'&&st.clk>1.2)st.trig=true;
    if(st.trig&&st.ph==='open'){st.ph='closing';st.tp=0;st.trig=false;st.pkA=st.pkB=P.ps;st.hist=[];st.pre={a:st.a.p,b:st.b.p};}
    const kOpen=(P.Q/6e4)/Math.sqrt(Math.max(P.ps-5,1)*1e5);   // valve sized for 5 bar back-pressure at the consumer
    const n=Math.ceil(sdt/2e-5);const h=n?sdt/n:0;
    for(let i=0;i<n;i++){st.tp+=h;let open=1;if(st.ph==='closing'||st.ph==='closed'){open=clamp(1-st.tp/(P.tc/1000),0,1);if(open===0)st.ph='closed';}
      const kv=kOpen*open;
      for(const [m,useAcc] of [[st.a,true],[st.b,false]]){const Qv=kv*Math.sqrt(Math.max(m.p*1e5-5e5,0));const C=ln.Cl+(useAcc?c16Cacc(P,m.p,f):0);
        m.Q+=((P.ps*1e5-m.p*1e5)-ln.R*m.Q)/ln.I*h;m.p+=(m.Q-Qv)/C*h/1e5;m.p=Math.max(m.p,-.9);m.Qv=Qv;}
      if(st.ph!=='open'){st.pkA=Math.max(st.pkA,st.a.p);st.pkB=Math.max(st.pkB,st.b.p);}}
    if(st.ph!=='open'&&dt>0){if(!st.hist.length||st.tp*1000-st.hist.at(-1)[0]>=1)st.hist.push([st.tp*1000,st.a.p,st.b.p]);}
    if(st.ph==='closed'&&st.tp>.45){st.lastA=st.pkA;st.lastB=st.pkB;st.ph='open';st.clk=0;}
    const pm=KIT.nice(Math.max(P.ps*1.3,st.pkB,st.lastB||0)*1.05);const show=st.hist;const ymax=KIT.nice(Math.max(st.pkB,st.lastB||0,P.ps)*1.1);
    const pkA=st.ph==='open'?(st.lastA??P.ps):st.pkA,pkB=st.ph==='open'?(st.lastB??P.ps):st.pkB;const v=(P.Q/6e4)/ln.A;
    const Q=st.a.Q*6e4,Qv=(st.a.Qv??P.Q/6e4)*6e4;const wn=1/Math.sqrt(ln.I*(ln.Cl+(P.acc?c16Cacc(P,P.ps,f):0)));
    return {p:{U:P.ps+.5,M:(P.ps+st.a.p)/2,V:st.a.p,T:.3,S:-.05},q:{LS:P.Q,LP:P.Q,LR:Math.max(0,P.Q-Q),LR2:Math.max(0,P.Q-Q),LL:Q,LO:Qv,LAC:Q-Qv},pmax:pm,qref:P.Q,v,
      pkA,pkB,wn,ln,closed:st.ph!=='open',
      c:{P1:{on:true,ang:KIT.rpmAng(st,dt,1450)},RV:{open:clamp((P.Q-Q)/P.Q,0,1)},SV:{closed:st.ph!=='open'},G1:{p:st.a.p},AC:{fill:clamp(.3+(st.a.p-P.ps)/Math.max(P.ps,1)*.5,0,1),u:st.a.p/pm},
        CH:{x:[0,450],y:[0,ymax],s:[{p:show.map(h=>[h[0],h[2]]),c:'#dc2626',d:true},{p:show.map(h=>[h[0],h[1]]),c:'#2563eb'},{p:[[0,P.ps],[450,P.ps]],c:'#94a3b8',d:true}]}},
      read:[{k:'לחץ ליד השסתום',v:st.a.p,u:'bar'},{k:'שיא עם מצבר לחץ',v:pkA,u:'bar',w:pkA>1.5*P.ps},{k:'שיא בלי מצבר לחץ',v:pkB,u:'bar'},{k:'הפחתת השיא',v:pkB>P.ps+.1?(1-(pkA-P.ps)/(pkB-P.ps))*100:0,u:'%',max:100},{k:'מהירות השמן בצינור',v:v,u:'m/s'},{k:'ספיקה בשסתום',v:Qv,u:'L/min',max:P.Q}]};},
  ins(P,R){const L=[];const c=Math.sqrt(1.4e9/870);const dJ=870*c*R.v/1e5;const T=2*P.L/c*1000;
    L.push({ic:'🌊',h:`סגירה מיידית: Δp = ρ·c·v = 870·${fmt(c,0)}·${fmt(R.v,2)} ≈ <b>${fmt(dJ,0)} bar</b> (ז'וקובסקי). זמן החזרה של הגל 2L/c = ${fmt(T,1)} ms.`});
    if(P.tc>T*1.5)L.push({ic:'🐢',h:`השסתום נסגר ב-${P.tc} ms – לאט מזמן החזרה, ולכן השיא קטן מהערך המיידי.`});
    if(P.acc)L.push({ic:'🎈',h:`מצבר הלחץ "בולע" את השמן שממשיך לזרום: השיא ירד מ-${fmt(R.pkB,0)} ל-<b>${fmt(R.pkA,0)} bar</b> (כחול מול אדום בגרף).`,at:'AC'});
    if(P.acc&&P.p0>P.ps)L.push({ic:'⚠️',w:true,at:'AC',h:`p₀ (${fmt(P.p0,0)} bar) גבוה מלחץ העבודה – מצבר הלחץ לא מקבל שמן עד שהלחץ עובר את p₀. השיא עד שם לא מרוסן. מקובל p₀ ≈ 0.6–0.9 מלחץ העבודה.`,c:'p₀ גבוה מלחץ העבודה'});
    if(P.acc&&P.p0<.3*P.ps)L.push({ic:'💡',h:'p₀ נמוך מאוד – הגז דחוס מאוד כבר בלחץ העבודה ונשאר מעט "קפיץ". העלו את p₀ לכ-0.7·p.'});
    if(!P.acc)L.push({ic:'🔨',w:true,at:'SV',h:'בלי מצבר לחץ רק דחיסות השמן והצינור "בולמים" את העצירה – שיא גבוה ותנודות.',c:'בלי ריסון – שיא לחץ'});return L;},
  calc(P,R){const c=Math.sqrt(1.4e9/870),pa=P.ps+1,Vg=P.V0*((P.p0+1)/pa)**(1/1.4);const Ca=Vg/1000/(1.4*pa*1e5);const Q=P.Q/6e4;
    return `<div class="kpis">${kpi('ז׳וקובסקי',fmt(870*c*R.v/1e5,0),'bar')}${kpi('שיא בלי מצבר לחץ',fmt(R.pkB,0),'bar')}${kpi('שיא עם מצבר לחץ',fmt(R.pkA,0),'bar')}${kpi('נפח גז בלחץ עבודה',fmt(Vg,3),'L')}</div>`+
    det('גל לחץ בצינור',row('מהירות הקול',`c = √(K/ρ) = √(1.4·10⁹/870) = ${V(c,'m/s',0)}`)+row('',`Δp = ρ·c·v = 870·${fmt(c,0)}·${fmt(R.v,2)} = ${V(870*c*R.v/1e5,'bar')}`)+row('זמן חזרה',`2L/c = ${V(2*P.L/c*1000,'ms')}`),true)+
    det('מודל מקובץ (קו + מצבר לחץ)',row('',`I = ρL/A = ${V(R.ln.I/1e6,'·10⁶ kg/m⁴',2)} ; C_line = AL/K = ${V(R.ln.Cl*1e12,'·10⁻¹² m³/Pa',2)}`)+row('מצבר לחץ',`C_acc = V_gas/(n·p) = ${V(Ca*1e12,'·10⁻¹² m³/Pa',0)}`)+row('שיא משוער',`Δp ≈ Q·√(I/C) = ${V(Q*Math.sqrt(R.ln.I/(R.ln.Cl+(P.acc?Ca:0)))/1e5,'bar')}`),true)+
    `<div class="note">מודל מקובץ (מסה + קפיץ) עם חיכוך; גל הלחץ המלא בשיטת הקווים האופייניים מופיע בפרק 3. ההדמיה מואטת פי 25.</div>`;},
  demo:[{t:'שמן בתנועה',x:'60 L/min זורמים בצינור באורך 10 m במהירות של כ-5 m/s. לשמן הזה יש מסה ותנע.',reset:true,set:{acc:false,auto:false},hl:['P1']},
    {t:'סגירה חדה',x:'סוגרים את השסתום ב-20 ms. השמן נעצר בבת אחת ודוחס את עצמו – <b>שיא לחץ</b> ותנודות (הקו האדום). ההדמיה מואטת פי 25.',act:(P,st)=>{st.trig=true;},hl:['SV','G1','CH'],dur:9},
    {t:'מצבר לחץ ליד השסתום',x:'מוסיפים מצבר לחץ קטן ליד השסתום: השמן שממשיך לזרום נכנס למצבר לחץ במקום להידחס – השיא (כחול) נמוך בהרבה.',set:{acc:true},act:(P,st)=>{st.trig=true;},hl:['AC','CH'],dur:9},
    {t:'לחץ הטעינה',x:'p₀ גבוה מלחץ העבודה (150 bar): מצבר הלחץ "נרדם" עד שהלחץ עובר את p₀. מקובל p₀ ≈ 0.6–0.9 מלחץ העבודה.',set:{p0:150},act:(P,st)=>{st.trig=true;},hl:['AC'],dur:9},
    {t:'סגירה איטית',x:'גם סגירה איטית עוזרת: 200 ms – כמעט אין שיא, גם בלי מצבר לחץ.',set:{p0:70,tc:200,acc:false},act:(P,st)=>{st.trig=true;},hl:['SV','CH'],dur:9}],
  predict:[{q:'מכפילים את הספיקה ל-120 L/min (בלי מצבר לחץ). שיא הלחץ מעל לחץ העבודה:',set:{Q:120,acc:false,auto:false},act:(P,st)=>{},go:(P,st)=>{APP.st.trig=true;},opts:['יוכפל בערך','לא ישתנה','יקטן'],a:0,dur:6,why:'Δp ∝ v (ז\'וקובסקי): כפליים ספיקה = כפליים מהירות = כפליים קפיצה.'},
    {q:'מעלים את p₀ ל-200 bar (לחץ עבודה 100). מה יקרה לשיא עם מצבר הלחץ?',set:{p0:200,auto:false},go:(P,st)=>{APP.st.trig=true;},opts:['יירד עוד','יעלה כמעט כמו בלי מצבר לחץ','לא ישתנה'],a:1,dur:6,why:'מצבר הלחץ מתחיל לקבל שמן רק מעל 200 bar – עד שם הוא לא קיים מבחינת הקו.'}],
  tasks:[{q:P=>`v = ${fmt((P.Q/6e4)/(PI*(P.dp/1000)**2/4),2)} m/s, c = 1270 m/s, ρ = 870. מה Δp בסגירה מיידית? (bar)`,a:P=>870*1270*(P.Q/6e4)/(PI*(P.dp/1000)**2/4)/1e5,u:'bar',hint:'Δp = ρ·c·v, ו-1 bar = 10⁵ Pa.',rand:P=>{P.Q=rnd(20,150,10);P.dp=pick([10,12,16,20,25]);}},
    {q:P=>`צינור באורך ${P.L} m, c = 1270 m/s. מה זמן החזרה של הגל 2L/c? (ms)`,a:P=>2*P.L/1270*1000,u:'ms',hint:'t = 2L/c.',rand:P=>{P.L=rnd(2,60,1);}},
    {q:P=>`מצבר לחץ ${P.V0} L, p₀ = ${P.p0}, לחץ עבודה ${P.ps} bar, n = 1.4. מה נפח הגז בלחץ העבודה? (L)`,a:P=>P.V0*((P.p0+1)/(P.ps+1))**(1/1.4),u:'L',hint:'V = V₀·((p₀+1)/(p+1))^(1/n).',rand:P=>{P.V0=pick([.16,.32,.5,1]);P.ps=rnd(80,200,10);P.p0=Math.round(P.ps*pick([.6,.7,.8]));}}],
  faults:[{id:'iso',t:'ברז הבידוד של מצבר הלחץ נשאר סגור',sym:'"התקנו מצבר לחץ ריסון, ובכל זאת יש מכות חזקות בצנרת כמו קודם."',hint:'השוו את השיא עם מצבר הלחץ לשיא בלי מצבר לחץ.',why:'מצבר הלחץ מבודד מהקו – הוא לא משתתף בכלל. פותחים את ברז הבידוד.'},
    {id:'lowpre',t:'הגז במצבר לחץ דלף (p₀ ≈ 3 bar)',sym:'"המכות פחתו רק מעט אחרי התקנת מצבר הלחץ."',hint:'מה נפח הגז שנשאר בלחץ העבודה כש-p₀ נמוך מאוד?',why:'עם p₀ נמוך הגז דחוס לנפח זעיר כבר בלחץ העבודה – "קפיץ" קשיח שבולע מעט.'},
    {id:'highpre',t:'מצבר הלחץ נטען בלחץ גבוה מדי',sym:'"יש מכה בתחילת הסגירה, ורק אחריה מצבר הלחץ מתחיל לעבוד."',hint:'מאיזה לחץ הקו הכחול מתחיל להתכופף?',why:'p₀ גבוה מלחץ העבודה: עד שהלחץ עובר את p₀, מצבר הלחץ סגור והשיא עולה.'}],
  test(H){const P=clone(this.P);P.auto=false;const run=(acc,tc)=>{const Q=Object.assign(clone(P),{acc,tc});const st=this.init(Q);st.trig=true;let R;for(let i=0;i<300;i++)R=this.step(Q,st,.02,{});st.trig=true;for(let i=0;i<700;i++)R=this.step(Q,st,.02,{});return st;};
    const s1=run(false,1),s2=run(true,1);const ln=c16Line(P);const Q=P.Q/6e4;const dpLump=Q*Math.sqrt(ln.I/ln.Cl)/1e5;const pa=101,Vg=.5*(71/101)**(1/1.4);const Ca=Vg/1000/(1.4*pa*1e5);const dpAcc=Q*Math.sqrt(ln.I/(ln.Cl+Ca))/1e5;
    return [['סגירה מיידית בלי מצבר לחץ: Δp ≈ Q√(I/C) (החיכוך מוריד מעט)',s1.lastB-s1.pre.b,dpLump,.15],['עם מצבר לחץ: Δp ≈ Q√(I/(C+C_acc)) (הגז מתקשח עם הלחץ)',s2.lastA-s2.pre.a,dpAcc,.35],['מצבר הלחץ מוריד את השיא לפחות פי 3',(s1.lastB-s1.pre.b)/(s2.lastA-s2.pre.a)>3?1:0,1],['ז\'וקובסקי ρcv = Q√(I/C)',870*Math.sqrt(1.4e9/870)*Q/ln.A/1e5,dpLump,.01]];}};

LABS.push({ch:16,title:'מעגלי מצבר לחץ',sims:[C16_SRC,C16_SHK]});
}
