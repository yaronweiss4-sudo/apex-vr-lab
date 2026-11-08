/* lab 1 – same code as the website */
{




/* ===================== Chapter 1 – introduction to fluid power (sims 1, 2) ===================== */
/* ---------- shared helpers / symbols (prefix C1_ / c1_) ---------- */
const C1_R=(g,x,y,w,h,fill,cls='sy thin')=>{const r=SR(g,x,y,w,h,cls);if(fill)r.style.fill=fill;return r;};
const C1_T=(g,x,y,t,cls='st',anc='middle',dir)=>{const e=ST(g,x,y,t,cls);e.style.textAnchor=anc;if(dir)e.style.direction=dir;return e;};
const C1_set=(e,t)=>{if(e.textContent!==t)e.textContent=t;};
/* keep "number unit" pairs left-to-right inside Hebrew sentences */
const C1_bd=h=>h.replace(/-?\d[\d,]*(?:\.\d+)?(?:[–-]\d[\d,]*(?:\.\d+)?)?\s?(?:bar|kN|N|mm\/s|mm²|mm|L\/min|kW|kJ|kg|J|m\/s|m|s|L|K\/min)(?![A-Za-z])/g,m=>`<bdi>${m}</bdi>`);
const C1_txt=(t,x)=>`<div class="row"><div class="lbl2"><b>${t}</b> – ${C1_bd(x)}</div></div>`;
const C1_bdL=L=>L.map(o=>{o.h=C1_bd(o.h);if(o.c)o.c=C1_bd(o.c);return o;});
/* numbered badge for the oil-path walk. cs={show,on,t} */
SYM.c1_num={ports:o=>({}),bb:o=>[-10,-10,10,10],
  draw(g,o){const c=SC(g,0,0,8,'syb');c.style.stroke='#7c3aed';c.style.strokeWidth=1.5;const t=ST(g,0,3.6,o.t||'','st b');t.style.fill='#6d28d9';
    return cs=>{cs=cs||{};g.style.display=cs.show?'':'none';const on=!!cs.on;c.style.fill=on?'#7c3aed':'#f5f3ff';t.style.fill=on?'#fff':'#6d28d9';c.setAttribute('r',on?10:8);if(cs.t!=null)C1_set(t,String(cs.t));};}};
/* horizontal bar chart (bars grow from the right, RTL). cs={rows:[[label,value,valueText,colour]],f} */
SYM.c1_bars={ports:o=>({}),bb:o=>[0,0,o.w,o.h],
  draw(g,o){C1_R(g,0,0,o.w,o.h,'#f8fafc','syb');ST(g,o.w/2,15,o.t||'','st b');const n=o.n||3,rh=(o.h-44)/n;
    const rows=[];for(let k=0;k<n;k++){const y=24+k*rh;const lab=C1_T(g,o.w-8,y+9,'','st','start','rtl');C1_R(g,8,y+12,o.w-16,9,'#e2e8f0','');const bar=C1_R(g,o.w-8,y+12,1,9,'#0b72d9','');const val=C1_T(g,8,y+9,'','st','start','ltr');rows.push({lab,bar,val});}
    const ft=ST(g,o.w/2,o.h-7,o.f||'','st s');
    return cs=>{if(!cs||!cs.rows)return;const mx=Math.max(...cs.rows.map(r=>r[1]),1e-9);rows.forEach((R,k)=>{const r=cs.rows[k];if(!r)return;C1_set(R.lab,r[0]);C1_set(R.val,r[2]);const w=Math.max((o.w-16)*clamp(r[1]/mx,0,1),1.5);R.bar.setAttribute('x',o.w-8-w);R.bar.setAttribute('width',w);R.bar.style.fill=r[3]||'#0b72d9';});if(cs.f!=null)C1_set(ft,cs.f);};}};
/* electrical main isolator with padlock + tag. o.lx = dashed cable length to the motor. cs={on,lock} */
SYM.c1_iso={ports:o=>({}),bb:o=>[-15,-22,(o.lx||24)+14,34],
  draw(g,o){C1_R(g,-13,-18,26,32,'#e5e7eb','syb');SP(g,`M13,-2 H${13+(o.lx||24)}`,'sy dash thin');ST(g,-7,-9,'0','st s');ST(g,7,-9,'I','st s');
    const h=sv('g',{},g);SC(h,0,3,6.5,'syb');const hl=SL(h,0,3,0,-7,'sy thick');hl.style.stroke='#dc2626';
    const lk=sv('g',{},g);const sh=SP(lk,'M-4,20 v-5 a4,4 0 0 1 8,0 v5','sy');sh.style.strokeWidth=2;C1_R(lk,-6,19,12,10,'#facc15','syb');C1_R(lk,8,17,11,15,'#dc2626','sy thin');const ex=ST(lk,13.5,28,'!','st b');ex.style.fill='#fff';
    return cs=>{cs=cs||{};h.setAttribute('transform',`rotate(${cs.on?40:-40} 0 3)`);lk.style.display=cs.lock?'':'none';};}};
/* hose fitting on a horizontal line (ports l / r). cs={open,jet} – jet draws an oil spray */
SYM.c1_fit={ports:o=>({l:[-9,0],r:[9,0]}),bb:o=>[-12,-36,12,9],
  draw(g,o){const nL=C1_R(g,-9,-6,8,12,'#cbd5e1','syb'),nR=C1_R(g,1,-6,8,12,'#cbd5e1','syb');const sp=sv('g',{},g);
    [[-16,-30],[-8,-34],[0,-36],[8,-34],[16,-30],[-12,-22],[12,-22]].forEach(([x,y])=>{const l=SL(sp,0,-6,x,y,'sy');l.style.stroke='#d97706';l.style.strokeWidth=2.2;});
    [[-18,-26],[18,-25],[-4,-33],[5,-28]].forEach(([x,y])=>{const c=SC(sp,x,y,1.8,'syf');c.style.fill='#b45309';});
    return cs=>{cs=cs||{};const op=!!cs.open;nL.setAttribute('x',op?-12:-9);nR.setAttribute('x',op?4:1);sp.style.display=cs.jet?'':'none';
      if(cs.jet)sp.setAttribute('transform',`scale(${(.8+.25*Math.random()).toFixed(2)},${(.8+.3*Math.random()).toFixed(2)})`);};}};
/* procedure checklist board. cs={rows:[{s,v}],f,fc} */
const C1_ZSTEPS=[['הורדת העומס עד הסוף','lower'],['עצירת המשאבה','stop'],['נעילה ותיוג של המפסק הראשי','lock'],['פריקת מצבר הלחץ (מד G2 על 0)','bleed'],['ניסיון הפעלה – המנוע לא מניע','tried'],['אימות: כל המדים על 0','verify'],['פתיחת המחבר – תחילת העבודה','work']];
const C1_SCOL={ok:['#16a34a','#fff','✓'],next:['#fde68a','#92400e',null],bad:['#dc2626','#fff','✗'],todo:['#fff','#64748b',null]};
SYM.c1_list={ports:o=>({}),bb:o=>[0,-8,o.w,o.h],
  draw(g,o){C1_R(g,0,0,o.w,o.h,'#fffbeb','syb');C1_R(g,o.w/2-24,-7,48,13,'#94a3b8','syb');ST(g,o.w/2,21,'נוהל אפס אנרגיה – לפני פתיחת המעגל','st b');
    const rh=(o.h-56)/C1_ZSTEPS.length;
    const rows=C1_ZSTEPS.map((s,k)=>{const y=31+k*rh+rh/2;const bg=C1_R(g,4,y-rh/2+1,o.w-8,rh-2,'none','');const c=SC(g,o.w-15,y,7,'syb');const n=ST(g,o.w-15,y+3.4,String(k+1),'st b');
      const t=C1_T(g,o.w-27,y+3.6,s[0],'st','start','rtl');t.style.fontSize='10px';const v=C1_T(g,9,y+3.3,'','st s','start','ltr');v.style.fontSize='8.5px';return {bg,c,n,t,v,k};});
    const fb=C1_R(g,5,o.h-22,o.w-10,17,'#f1f5f9','sy thin');const ft=ST(g,o.w/2,o.h-10,'','st b');
    return cs=>{if(!cs||!cs.rows)return;rows.forEach(r=>{const q=cs.rows[r.k]||{s:'todo',v:''};const col=C1_SCOL[q.s]||C1_SCOL.todo;r.c.style.fill=col[0];r.n.style.fill=col[1];C1_set(r.n,col[2]||String(r.k+1));
        r.bg.style.fill=q.s==='next'?'#fef3c7':q.s==='bad'?'#fee2e2':'none';C1_set(r.v,q.v||'');});C1_set(ft,cs.f||'');ft.style.fill=cs.fc||'#0f172a';fb.style.fill=cs.fb||'#f1f5f9';};}};
/* 3D: canvas sign lying on the board (same top-left origin as the SVG symbol) */
function C1_sign(w,h,draw){const g=new THREE.Group();const S=3;const cv=document.createElement('canvas');cv.width=w*S;cv.height=h*S;const x=cv.getContext('2d');const tex=new THREE.CanvasTexture(cv);tex.colorSpace=THREE.SRGBColorSpace;
  const m=new THREE.Mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshBasicMaterial({map:tex}));m.position.set(w/2,-h/2,1.5);g.add(m);let last='',lt=0;
  return {g,upd(cs){if(!cs)return;const k=JSON.stringify(cs);if(k===last)return;const now=performance.now();if(last&&now-lt<250)return;last=k;lt=now;x.setTransform(S,0,0,S,0,0);x.clearRect(0,0,w,h);draw(x,cs,w,h);tex.needsUpdate=true;}};}
function C1_cvText(x,t,px,py,size,col,align='right',wt=600){x.font=`${wt} ${size}px Heebo,Arial,sans-serif`;x.fillStyle=col;x.textAlign=align;x.textBaseline='middle';x.direction=align==='left'?'ltr':'rtl';x.fillText(t,px,py);}
B3.c1_bars=(c,o)=>C1_sign(o.w,o.h,(x,cs,w,h)=>{x.fillStyle='#f8fafc';x.fillRect(0,0,w,h);x.strokeStyle='#1e293b';x.lineWidth=1.2;x.strokeRect(.6,.6,w-1.2,h-1.2);C1_cvText(x,o.t||'',w/2,12,10.5,'#0f172a','center',800);
  const n=o.n||3,rh=(h-44)/n,mx=Math.max(...cs.rows.map(r=>r[1]),1e-9);cs.rows.forEach((r,k)=>{const y=24+k*rh;C1_cvText(x,r[0],w-8,y+6,9.5,'#0f172a');C1_cvText(x,r[2],8,y+6,9.5,'#0f172a','left');x.fillStyle='#e2e8f0';x.fillRect(8,y+12,w-16,9);const bw=Math.max((w-16)*r[1]/mx,1.5);x.fillStyle=r[3]||'#0b72d9';x.fillRect(w-8-bw,y+12,bw,9);});
  C1_cvText(x,cs.f||o.f||'',w/2,h-8,8,'#475569','center');});
B3.c1_list=(c,o)=>C1_sign(o.w,o.h,(x,cs,w,h)=>{x.fillStyle='#fffbeb';x.fillRect(0,0,w,h);x.strokeStyle='#1e293b';x.lineWidth=1.2;x.strokeRect(.6,.6,w-1.2,h-1.2);C1_cvText(x,'נוהל אפס אנרגיה',w/2,14,11,'#0f172a','center',800);
  const rh=(h-56)/C1_ZSTEPS.length;C1_ZSTEPS.forEach((s,k)=>{const y=31+k*rh+rh/2,q=cs.rows[k]||{s:'todo'},col=C1_SCOL[q.s]||C1_SCOL.todo;x.beginPath();x.arc(w-15,y,7,0,2*PI);x.fillStyle=col[0];x.fill();x.strokeStyle='#1e293b';x.stroke();
    C1_cvText(x,col[2]||String(k+1),w-15,y+.5,9,col[1],'center',800);C1_cvText(x,s[0],w-27,y,9.5,'#0f172a');C1_cvText(x,q.v||'',9,y,8,'#475569','left');});
  x.fillStyle=cs.fb||'#f1f5f9';x.fillRect(5,h-22,w-10,17);C1_cvText(x,cs.f||'',w/2,h-13,9.5,cs.fc||'#0f172a','center',800);});
B3.c1_iso=(c,o)=>{const M=m3(),g=new THREE.Group();g.add(edges(at(box3(24,30,14,M.alu),0,0,7)));const h=new THREE.Group();at(h,0,0,15);h.add(at(cyl3(7,3,M.dark,'z'),0,0,0));h.add(at(box3(4,15,4,M.red),0,5,2));g.add(h);
  const lk=new THREE.Group();at(lk,0,-23,10);lk.add(at(box3(12,10,6,M.yellow),0,0,0));const sh=new THREE.Mesh(new THREE.TorusGeometry(4,1,8,16,PI),M.steel);at(sh,0,5,0);lk.add(sh);lk.add(at(box3(10,14,1.2,M.red),13,-2,0));g.add(lk);
  return {g,upd(cs){h.rotation.z=cs&&cs.on?-.7:.7;lk.visible=!!(cs&&cs.lock);}};};
B3.c1_fit=(c,o)=>{const M=m3(),g=new THREE.Group();const n1=at(cyl3(5.5,8,M.steel,'x',6),-5,0,7),n2=at(cyl3(5.5,8,M.steel,'x',6),5,0,7);g.add(n1,n2);
  const jm=new THREE.MeshStandardMaterial({color:0xd97706,emissive:0x7c2d12,emissiveIntensity:.4,transparent:true,opacity:.8,side:THREE.DoubleSide,depthWrite:false});const jet=new THREE.Mesh(new THREE.ConeGeometry(9,32,14,1,true),jm);jet.rotation.z=PI;at(jet,0,19,7);g.add(jet);
  return {g,upd(cs){const op=!!(cs&&cs.open);n1.position.x=op?-8:-5;n2.position.x=op?8:5;jet.visible=!!(cs&&cs.jet);if(jet.visible)jet.scale.set(.85+.3*Math.random(),.85+.3*Math.random(),1);}};};

/* ---------- 1 · the first hydraulic system ---------- */
const C1_KV=4,C1_FF=250,C1_RLOW=20,C1_KLK=.35,C1_PNEU=6;
const C1_ROLE={T1:['מיכל השמן','מאגר השמן של המערכת: ממנו המשאבה יונקת ואליו השמן חוזר. במיכל השמן מתקרר, בועות אוויר עולות ולכלוך שוקע.'],
  F1:['מסנן יניקה','עוצר חלקיקים לפני שהם נכנסים למשאבה. לכלוך הוא הגורם הראשון לתקלות במערכות הידראוליות.'],
  P1:['משאבה + מנוע חשמלי','המנוע מסובב את המשאבה, והמשאבה דוחפת ספיקה של שמן (L/min). המשאבה לא "מייצרת לחץ" – הלחץ נוצר כשהשמן פוגש התנגדות. לחיצה מפעילה / מכבה.'],
  RV:['שסתום פריקה','מגביל את הלחץ המקסימלי: כשהלחץ מגיע לכיול הוא נפתח ומחזיר שמן למיכל. מגן על המשאבה, הצנרת והמפעיל.'],
  G1:['מד לחץ 1 – קו המשאבה','מראה את הלחץ שהמשאבה צריכה לייצר כדי לדחוף את השמן הלאה.'],
  GA:['מד לחץ 2 – מתחת לבוכנה','מראה את הלחץ בצד המלא של הצילינדר – זה הלחץ שנושא את העומס.'],
  V1:['שסתום פיקוד 4/3 בהפעלת ידית','"ההגה" של המערכת: מחליט לאן השמן הולך. a – לצד המלא (הרמה), b – לצד המוט (הורדה), 0 – כל הפתחים חסומים והעומס נעצר. לחיצה מזיזה את הידית.'],
  C1:['צילינדר דו-פעולה','המפעיל: הופך לחץ וספיקה לכוח ותנועה. הכוח F = p·A, המהירות v = Q/A.'],
  T2:['מיכל (חזרה משסתום הפריקה)','השמן שעבר בשסתום הפריקה חוזר למיכל – חם, כי כל האנרגיה שלו הפכה לחום.'],
  T3:['מיכל (קו חזרה)','השמן שנדחק מהצילינדר חוזר דרך שסתום הפיקוד למיכל.'],
  CH:['השוואה: הידראוליקה מול פנאומטיקה','אותו צילינדר, לחץ שונה: F = p·A. לחץ גבוה = כוח גדול בגודל קטן.']};
function C1_seq(P,st,dt,atEnd,hold=1.2){if(st.cp!=null&&P.pos!==st.cp)P.auto=false;if(!P.auto){st.cp=P.pos;return;}
  const ord=['a','0','b','0'];if(st.sq==null||ord[st.sq]!==P.pos)st.sq=Math.max(0,ord.indexOf(P.pos));
  if(P.pos!=='0'){st.dw=atEnd?(st.dw||0)+dt:0;if(st.dw>.5){st.sq=(st.sq+1)%4;P.pos=ord[st.sq];st.dw=0;}}
  else{st.dw=(st.dw||0)+dt;if(st.dw>hold){st.sq=(st.sq+1)%4;P.pos=ord[st.sq];st.dw=0;}}st.cp=P.pos;}
function C1_path(dir,on){if(!on)return [];const s=[['NT1','T1','השמן יוצא מהמיכל'],['NF1','F1','עובר במסנן היניקה – הלכלוך נשאר במסנן'],['NP1','P1','המשאבה דוחפת אותו לקו הלחץ']];
  if(dir>0)return [...s,['NV1','V1','שסתום הפיקוד (מצב a) מפנה אותו מ-P ל-A'],['NC1','C1','השמן נכנס מתחת לבוכנה ודוחף אותה למעלה – העומס עולה'],['NV2','V1','השמן שמעל הבוכנה נדחק החוצה ועובר בשסתום מ-B ל-T'],['NT3','T3','וחוזר למיכל – המעגל נסגר']];
  if(dir<0)return [...s,['NV1','V1','שסתום הפיקוד (מצב b) מפנה אותו מ-P ל-B'],['NC1','C1','השמן נכנס מעל הבוכנה – העומס יורד'],['NV2','V1','השמן שמתחת לבוכנה יוצא בשסתום מ-A ל-T'],['NT3','T3','וחוזר למיכל']];
  return [...s,['NRV','RV','שסתום הפיקוד חוסם את P – הלחץ עולה עד ששסתום הפריקה נפתח'],['NT2','T2','השמן חוזר למיכל דרך שסתום הפריקה, וכל ההספק הופך לחום']];}
const C1_BADGES={NT1:[226,384],NF1:[226,352],NP1:[176,288],NRV:[274,262],NT2:[312,300],NV1:[232,182],NC1:[22,200],NV2:[288,240],NT3:[350,262]};
function C1_live(id,P,R){const b=v=>`<b>${v}</b>`;return {P1:`עכשיו: ${P.on?'פועל':'כבוי'}, ${b(fmt(R.Qp,1)+' L/min')}.`,RV:`כיול ${b(fmt(R.pr,0)+' bar')}, עובר דרכו ${b(fmt(R.Qr,1)+' L/min')}.`,G1:`עכשיו ${b(fmt(R.ps,1)+' bar')}.`,GA:`עכשיו ${b(fmt(R.pA,1)+' bar')} (לחץ ההחזקה W/A₁ = ${fmt(R.hold,1)} bar).`,
  V1:`מצב: ${b({a:'a – הרמה','0':'0 – חסום',b:'b – הורדה'}[P.pos])}.`,C1:`Ø${P.D} מ"מ: A₁ = ${fmt(R.A1,0)} mm². מהירות ${b(fmt(R.v,0)+' mm/s')}, גובה ${fmt(R.x,0)} mm.`,F1:`עובר דרכו ${b(fmt(R.Qp,1)+' L/min')}.`,
  T1:'',T2:`חום שנוצר עכשיו: ${b(fmt(H.kW(R.ps,R.Qr),2)+' kW')}.`,T3:'',CH:`ב-${P.pr} bar: ${b(fmt(H.F(P.pr,R.A1)/1000,1)+' kN')}; ב-${C1_PNEU} bar: ${fmt(H.F(C1_PNEU,R.A1)/1000,2)} kN.`}[id]||'';}
const C1_SIM_FIRST={id:'first',n:1,t:'המערכת ההידראולית הראשונה',d:'משאבה, שסתום פיקוד וצילינדר מרימים משקולת – המסלול של השמן והתפקיד של כל רכיב',
  P:{on:true,pos:'a',auto:true,path:true,m:300,Q:12,D:50,dr:28,S:300,pr:120},
  ui(U,P){U.grp('הפעלה');U.seg(P,'on','מנוע המשאבה',[[true,'▶ פועל','הפעלת המנוע'],[false,'■ כבוי','כיבוי המנוע']]);U.seg(P,'pos','ידית השסתום',[['a','▲ a','מצב a – הרמה'],['0','■ 0','מצב 0 – הכול חסום'],['b','▼ b','מצב b – הורדה']]);
    U.chk(P,'auto','מחזור אוטומטי');U.chk(P,'path','מסלול השמן צעד-אחר-צעד');
    U.grp('העומס והמערכת');U.num(P,'m','מסת העומס','kg',{min:0,max:2000,step:10});U.num(P,'Q','ספיקת המשאבה','L/min',{min:1,max:60,step:1});U.num(P,'D','קוטר הבוכנה','mm',{min:25,max:125,step:1});U.num(P,'pr','כיול שסתום הפריקה','bar',{min:20,max:350,step:5});
    U.grp('עוד',false);U.num(P,'dr','קוטר המוט בוכנה','mm',{min:10,max:90,step:1});U.num(P,'S','מהלך','mm',{min:100,max:600,step:10});
    U.note('💡 לחצו על רכיב בשרטוט כדי לראות את התפקיד שלו. לחיצה על המשאבה מפעילה/מכבה, לחיצה על השסתום מזיזה את הידית.');},
  circuit(P){const bd=Object.entries(C1_BADGES).map(([id,[x,y]])=>({id,type:'c1_num',x,y,o:{t:''},name:'שלב במסלול השמן'}));
    return {comps:[{id:'C1',type:'cyl',x:60,y:200,rot:-90,o:{load:{t:'m'}},name:'צילינדר דו-פעולה (אנכי) עם עומס',lbl:'צילינדר',lblAt:[-30,96],l3:[40,-150]},
      {id:'GA',type:'gauge',x:122,y:215,rot:90,net:'A',name:'מד לחץ 2 – מתחת לבוכנה',lbl:'2',lblAt:[4,-16],valAt:[14,-14],l3:[0,-30]},
      {id:'V1',type:'dcv',x:260,y:200,o:{box:KIT.D43.closed,L:'lever',center:true},name:'שסתום פיקוד 4/3, מרכז סגור, הפעלת ידית',lbl:'שסתום פיקוד',lblAt:[114,4],l3:[0,-34]},
      {id:'P1',type:'pump',x:200,y:316,name:'משאבה + מנוע חשמלי',lbl:'משאבה',lblAt:[-80,4],l3:[0,-34]},
      {id:'F1',type:'filter',x:200,y:352,name:'מסנן יניקה',lbl:'מסנן',lblAt:[-30,6]},{id:'T1',type:'tank',x:200,y:385,name:'מיכל',lbl:'מיכל',lblAt:[-30,4]},
      {id:'RV',type:'pv',x:240,y:284,rot:90,o:{kind:'relief'},name:'שסתום פריקה',lbl:'פריקה',lblAt:[0,40]},{id:'T2',type:'tank',x:285,y:302,name:'מיכל'},
      {id:'T3',type:'tank',x:320,y:252,name:'מיכל'},
      {id:'G1',type:'gauge',x:225,y:236,net:'P',name:'מד לחץ 1 – קו המשאבה',lbl:'1',lblAt:[-14,-12],valAt:[-14,-16],l3:[0,-30]},
      {id:'CH',type:'c1_bars',x:300,y:-6,o:{w:228,h:118,n:3,t:'כוח מקסימלי מאותו צילינדר',f:'F = p·A'},name:'השוואה: כוח מאותו צילינדר בהידראוליקה ובפנאומטיקה'},...bd],
     lines:[{id:'LS1',net:'S',pts:['T1.t','F1.in']},{id:'LS2',net:'S',pts:['F1.out','P1.in']},{id:'LP',net:'P',pts:['P1.out',[200,248],[253,248],'V1.P'],},
      {id:'LRV',net:'P',pts:[[200,284],'RV.P']},{id:'LRT',net:'T',pts:['RV.T',[285,284],'T2.t']},
      {id:'LA',net:'A',pts:['V1.A',[253,166],[110,166],[110,250],'C1.A']},{id:'LB',net:'B',pts:['V1.B',[267,150],'C1.B']},
      {id:'LT',net:'T',pts:['V1.T',[267,234],[320,234],'T3.t']}]};},
  init:P=>({x:0,si:KIT.idx[P.pos],pw:0,sel:null}),
  click(id,P,st){if(id==='V1'){P.pos=P.pos==='a'?'0':P.pos==='0'?'b':'a';P.auto=false;}if(id==='P1')P.on=!P.on;if(C1_ROLE[id]){st.sel=id;return true;}if(id[0]==='N'&&C1_BADGES[id]){return false;}return id==='V1'||id==='P1';},
  tip(id,P,R){const r=C1_ROLE[id];return r?C1_bd(`${r[1]}<br>${C1_live(id,P,R)}`):'';},
  step(P,st,dt,ctx){const f=ctx.fault,A1=H.A(P.D),A2=H.Aann(P.D,Math.min(P.dr,P.D-4)),W=P.m*G,S=P.S,hold=10*W/A1;
    if(!P.on&&P.auto)P.auto=false;
    const d0=KIT.dirOf(P.pos);C1_seq(P,st,dt,(d0>0&&st.x>=S-1e-6)||(d0<0&&st.x<=1e-6));
    const dir=KIT.dirOf(P.pos),atEnd=(dir>0&&st.x>=S-1e-6)||(dir<0&&st.x<=1e-6);
    const Qp=P.on?(f==='pump'?P.Q*.55:P.Q):0,pr=f==='relief'?Math.min(P.pr,C1_RLOW):P.pr,ov=Math.max(3,.06*pr);
    let ps=0,pA=0,pB=0,v=0,qA=0,qB=0,qT=0,Qr=0,cav=false;
    if(P.on&&dir>0){const r=H.lin({Qp,pr,Ain:A1,Aout:A2,F:atEnd?1e9:W+C1_FF,kIn:C1_KV,kOut:C1_KV});ps=r.ps;pA=r.stall?r.ps:r.pIn;pB=r.pOut;v=r.v;qA=r.Qin;qB=-r.Qout;qT=r.Qout;Qr=r.Qr;}
    else if(P.on&&dir<0){const r=H.lin({Qp,pr,Ain:A2,Aout:A1,F:atEnd?1e9:-W+C1_FF,kIn:C1_KV,kOut:C1_KV,vRun:H.v(P.Q,A2)*4});ps=r.ps;pB=r.stall?r.ps:r.pIn;pA=r.pOut;v=-r.v;qB=r.Qin;qA=-r.Qout;qT=r.Qout;Qr=r.Qr;cav=!!r.cav;}
    else if(P.on){ps=pr+ov;Qr=Qp;pA=st.x>1e-6?hold:0;}
    else if(dir>0){pA=st.x>1e-6?hold:0;ps=pA;}                                  // A joined to the stopped pump line – load held
    else if(dir<0&&st.x>1e-6){const pAg=Math.max((10*(W-C1_FF)+H.PVAC*A2)/A1,0);const Qd=C1_KV*Math.sqrt(pAg);v=-H.v(Qd,A1);pA=pAg;pB=H.PVAC;ps=H.PVAC;qA=-Qd;qT=Qd;qB=H.Q(-v,A2);cav=true;}
    else pA=st.x>1e-6?hold:0;
    if(f==='leak'&&dir===0&&st.x>1e-6){const Qd=C1_KLK*Math.sqrt(hold);v=-H.v(Qd,A1);qA=-Qd;qT=Qd;qB=H.Q(-v,A2);}
    if(dt>0)st.x=clamp(st.x+v*dt,0,S);KIT.ease(st,'si',KIT.idx[P.pos],dt);if(P.on)KIT.rpmAng(st,dt,1450);
    st.pw=(st.pw||0)+dt;const path=P.path?C1_path(dir,P.on):[];const pk=path.length?Math.floor(st.pw/1.6)%path.length:-1;
    const c={C1:{x:st.x/S,uA:pA/P.pr,uB:pB/P.pr,lt:`${fmt(P.m,0)} kg`},V1:{i:st.si},P1:{on:P.on,ang:st.ang||0},RV:{open:Qp>0?clamp(Qr/Qp,0,1):0},GA:{p:pA},
      CH:{rows:[['הידראוליקה',H.F(P.pr,A1),`${fmt(P.pr,0)} bar → ${fmt(H.F(P.pr,A1)/1000,1)} kN`,'#0b72d9'],['פנאומטיקה',H.F(C1_PNEU,A1),`${C1_PNEU} bar → ${fmt(H.F(C1_PNEU,A1)/1000,2)} kN`,'#16a34a'],['משקל העומס',W,`${fmt(P.m,0)} kg → ${fmt(W/1000,2)} kN`,'#f59e0b']],f:`F = p·A,  A₁ = ${fmt(A1,0)} mm²`}};
    Object.keys(C1_BADGES).forEach(id=>{const k=path.findIndex(s=>s[0]===id);c[id]={show:k>=0,on:k===pk,t:k+1};});
    const Puse=W*Math.max(v,0)/1e6;
    return {A1,A2,W,hold,ps,pA,pB,v,x:st.x,Qp,Qr,pr,dir,cav,path,pk,Puse,on:P.on,
      p:{P:ps,A:pA,B:pB,T:Math.min(1,Math.abs(qT)/Math.max(P.Q,1)),S:-.05},q:{LS1:Qp,LS2:Qp,LP:Qp-Qr,LRV:Qr,LRT:Qr,LA:qA,LB:qB,LT:Math.abs(qT)},pmax:P.pr,qref:P.Q,vac:ps<0,cav:cav?{LB:true}:null,c,
      read:[{k:'לחץ משאבה',v:ps,u:'bar'},{k:'לחץ בצילינדר',v:pA,u:'bar'},{k:'מהירות העומס',v,u:'mm/s',max:H.v(P.Q,A2)},{k:'גובה העומס',v:st.x,u:'mm',max:S},
        {k:'ספיקה לצילינדר',v:Math.abs(dir>0?qA:qB),u:'L/min',max:P.Q},{k:'ספיקה בשסתום הפריקה',v:Qr,u:'L/min',max:P.Q,w:Qp>0&&Qr>.5*Qp},{k:'הספק מועיל',v:Puse,u:'kW',dg:2,max:Math.max(H.kW(P.pr,P.Q),.1)}]};},
  ins(P,R,st){const L=[];const Fh=H.F(P.pr,R.A1),Fp=H.F(C1_PNEU,R.A1);
    if(st.sel&&C1_ROLE[st.sel]){const [n,t]=C1_ROLE[st.sel];L.push({ic:'🔎',at:st.sel,h:`<b>${n}</b> – ${t} ${C1_live(st.sel,P,R)}`});}
    if(R.pk>=0){const s=R.path[R.pk];L.push({ic:'🛢️',at:s[1],h:`מסלול השמן ${R.pk+1}/${R.path.length}: ${s[2]}.`});}
    if(!R.on){if(R.v<-1)L.push({ic:'⚠️',w:true,at:'C1',h:`המנוע כבוי, אבל הידית במצב הורדה: העומס יורד בכוח הכובד (<b>${fmt(-R.v,0)} mm/s</b>) והשמן מתחת לבוכנה זורם למיכל. אנרגיית הגובה עדיין במערכת – לכן לפני תחזוקה מורידים את העומס עד הסוף.`,c:'העומס יורד – גם בלי משאבה!'});
      else L.push({ic:'⏹',at:'V1',h:`המנוע כבוי: אין ספיקה – אין תנועה. ${R.x>1?`העומס מוחזק כי שסתום הפיקוד חוסם את קו A: השמן הכלוא נושא אותו ב-<b>${fmt(R.hold,1)} bar</b>.`:'העומס למטה.'}`});}
    else if(R.dir>0&&R.v>.5)L.push({ic:'⬆️',h:`הרמה: מתחת לבוכנה <b>${fmt(R.pA,1)} bar</b> – ${fmt(R.hold,1)} bar למשקל ${fmt(R.W/1000,2)} kN, והשאר לחיכוך ולמפלי לחץ. המהירות <span dir="ltr">v = Q/A₁ = ${fmt(R.Qp,0)} L/min ÷ ${fmt(R.A1,0)} mm² = <b>${fmt(R.v,0)} mm/s</b></span>.`});
    else if(R.dir<0&&R.v<-.5)L.push({ic:'⬇️',h:`הורדה: השמן נכנס לצד המוט (שטח קטן יותר, ${fmt(R.A2,0)} mm²) ולכן ההורדה מהירה יותר – <b>${fmt(-R.v,0)} mm/s</b>. העומס עוזר, ולחץ המשאבה נמוך (${fmt(R.ps,1)} bar).`});
    else if(R.dir===0&&R.x>1)L.push({ic:'⏸',at:'GA',h:`מצב 0: כל הפתחים חסומים. העומס מוחזק בשמן הכלוא – המד מתחת לבוכנה מראה <b>${fmt(R.hold,1)} bar</b> = W/A₁.`});
    if(R.on&&R.Qr>.5*R.Qp)L.push({ic:'🔥',w:true,at:'RV',h:`כל הספיקה (${fmt(R.Qr,1)} L/min) חוזרת דרך שסתום הפריקה ב-${fmt(R.ps,0)} bar → <b>${fmt(H.kW(R.ps,R.Qr),2)} kW</b> של חום. המשאבה עובדת קשה – והשמן מתחמם.`,c:'כל הספיקה עוברת כאן – חום'});
    if(R.on&&R.dir>0&&R.v<.5&&R.x<P.S-1)L.push({ic:'⛔',w:true,at:'C1',h:`העומס לא עולה: הלחץ הדרוש גבוה מכיול שסתום הפריקה (${fmt(R.pr,0)} bar). הגדילו את הכיול או את קוטר הבוכנה.`,c:'הלחץ לא מספיק להרמה'});
    if(R.cav&&R.on)L.push({ic:'💥',w:true,at:'C1',h:'העומס כבד ו"בורח" בהורדה – מהר יותר מהמשאבה. בצד המוט נוצר תת-לחץ. בהמשך הקורס נלמד על שסתום איזון עומס שמונע זאת.'});
    L.push({ic:'⚖️',at:'CH',h:`למה הידראוליקה? צילינדר Ø${P.D} ב-${fmt(P.pr,0)} bar דוחף <b>${fmt(Fh/1000,1)} kN</b> (כ-${fmt(Fh/G/1000,1)} טון; ב-200 bar – ${fmt(H.F(200,R.A1)/1000,1)} kN). אותו צילינדר באוויר דחוס (${C1_PNEU} bar) – רק ${fmt(Fp/1000,2)} kN: פי ${fmt(P.pr/C1_PNEU,0)} פחות.`});
    if(!st.sel)L.push({ic:'👆',h:'לחצו על רכיב בשרטוט – התפקיד שלו יופיע כאן.'});return C1_bdL(L);},
  calc(P,R){const A1=R.A1,A2=R.A2,W=R.W,v1=H.v(P.Q,A1),v2=H.v(P.Q,A2),Fh=H.F(P.pr,A1),F2=H.F(200,A1),Fp=H.F(C1_PNEU,A1);
    return `<div class="kpis">${kpi('לחץ להחזקה',fmt(R.hold,1),'bar')}${kpi('כוח מקסימלי',fmt(Fh/1000,1),'kN')}${kpi('מהירות הרמה',fmt(v1,0),'mm/s')}${kpi('הספק הידראולי',fmt(H.kW(Math.max(R.ps,0),R.Qp-R.Qr),2),'kW')}</div>`+
    det('העומס והלחץ',row('משקל',`W = m·g = ${P.m}·9.81 = ${V(W,'N')}`)+row('שטח הבוכנה',`A₁ = π·D²/4 = π·${P.D}²/4 = ${V(A1,'mm²')}`)+row('לחץ להחזקה',`p = ${fr('W','A₁')} = ${fr(fmt(W,0),fmt(A1,0))} = ${V(W/A1,'N/mm²',3)} = ${V(R.hold,'bar')}`)+
      row(`לחץ בזמן הרמה (חיכוך F_f = ${C1_FF} N)`,`p = ${fr('W + F_f + p_B·A₂','A₁')} ≈ ${V((10*(W+C1_FF)+Math.max(R.pB,0)*A2)/A1,'bar')}`),true)+
    det('כוח מקסימלי – F = p·A',row('בכיול שסתום הפריקה',`F = p·A₁ = ${P.pr}·${fmt(A1,0)}/10 = ${V(Fh,'N')} = ${V(Fh/1000,'kN')}`)+row('ב-200 bar (כמה טון אפשר להרים)',`F = 200·${fmt(A1,0)}/10 = ${V(F2/1000,'kN')}  ⇒  m = F/g ≈ ${V(F2/G/1000,'t',1)}`)+row('מסה מקסימלית',`m = F/g = ${V(Fh/G,'kg',0)}`,Fh>W),true)+
    det('מהירות וזמן',row('המרה',`1 L/min = 10⁶ mm³ / 60 s`)+row('הרמה',`v = ${fr('Q','A₁')} = ${fr(P.Q+'·10⁶/60',fmt(A1,0))} = ${V(v1,'mm/s')} ⇒ t = ${P.S}/${fmt(v1,1)} = ${V(P.S/v1,'s')}`)+row('הורדה',`v = ${fr('Q','A₂')} = ${V(v2,'mm/s')} (A₂ = ${fmt(A2,0)} mm²)`))+
    det('הספק',row('הידראולי',`P = ${fr('p·Q','600')} = ${fr(fmt(Math.max(R.ps,0),1)+'·'+fmt(R.Qp-R.Qr,1),'600')} = ${V(H.kW(Math.max(R.ps,0),R.Qp-R.Qr),'kW',3)}`)+row('מועיל (הרמה)',`P = W·v = ${fmt(W,0)}·${fmt(Math.max(R.v,0),1)}/10⁶ = ${V(R.Puse,'kW',3)}`)+row('חום בשסתום הפריקה',`P = p·Q_R/600 = ${V(H.kW(Math.max(R.ps,0),R.Qr),'kW',3)}`))+
    det('1.1 – הידראוליקה מול מערכות אחרות',C1_txt('הידראוליקה',`בדרך כלל 100–350 bar. כוח והספק גדולים ברכיב קטן, שליטה רכה במהירות והחזקת עומס. חסרונות: דליפות, חום, רעש וסכנת סילון.`)+
      C1_txt('פנאומטיקה',`בדרך כלל 6–8 bar. זולה, מהירה ונקייה, אבל האוויר נדחס – קשה לעצור באמצע. כאן: ${fmt(Fp/1000,2)} kN מול ${fmt(Fh/1000,1)} kN – פי ${fmt(P.pr/C1_PNEU,0)}.`)+
      C1_txt('חשמל',`נצילות גבוהה ושליטה מדויקת (סרוו). כוח קווי גדול דורש תמסורת כמו בורג כדורי – כבד וגדול יותר לאותו כוח.`)+C1_txt('צפיפות הספק','מנוע הידראולי של כ-10 ק"ג יכול למסור עשרות kW; מנוע חשמלי תעשייתי באותו הספק שוקל בערך פי 10 יותר. הסיבה: לחץ גבוה = כוח גדול בשטח קטן.')+C1_txt('מכניקה',`גלגלי שיניים, מנופים ושרשראות: פשוט ויעיל, אבל היחס קבוע וקשה להעביר כוח למרחק ומסביב לפינות.`)+
      row('יחס הכוחות באותו צילינדר',`F_hyd/F_pneu = p_hyd/p_pneu = ${P.pr}/${C1_PNEU} = ${V(P.pr/C1_PNEU,'',1)}`),true)+
    det('1.2 – הידראוליקה נייחת מול ניידת',C1_txt('נייחת (תעשייה)',`מכבשים, מכונות הזרקה וכלי עיבוד: מנוע חשמלי, מיכל גדול, סינון וקירור טובים, סביבה נקייה וקבועה.`)+C1_txt('ניידת (שטח)',`מחפרים, עגורנים וטרקטורים: מנוע דיזל, מיכל קטן, מגבלות משקל ומקום, אבק, רעידות וטמפרטורות קיצוניות.`))+
    `<div class="note">${C1_bd(`g = 9.81 m/s², 1 bar = 0.1 N/mm². חיכוך האטמים ${C1_FF} N; מפל הלחץ בשסתום Δp = (Q/${C1_KV})².`)}</div>`;},
  demo:[{t:'הכירו את המעגל',x:'זו מערכת הידראולית שלמה: <b>מיכל</b>, <b>מסנן</b>, <b>משאבה</b> עם מנוע, <b>שסתום פריקה</b>, <b>שסתום פיקוד</b> ו<b>צילינדר</b> שמרים משקולת. כרגע המנוע כבוי. רחפו עם העכבר מעל רכיב כדי לקרוא עליו.',reset:true,set:{on:false,pos:'0',auto:false},act:(P,st)=>{st.x=0;},hl:['T1','F1','P1','RV','V1','C1'],dur:10},
    {t:'מפעילים את המנוע',x:'המנוע מסובב את המשאבה והשמן נשאב מהמיכל דרך המסנן. הידית במצב 0 – הדרך לצילינדר חסומה, ולכן הלחץ עולה עד ששסתום הפריקה נפתח ומחזיר את השמן למיכל.',set:{on:true},hl:['P1','F1','RV'],dur:9},
    {t:'מזיזים את הידית – הרמה',x:'מצב <b>a</b>: השסתום מחבר P→A. השמן נכנס מתחת לבוכנה והעומס עולה. עקבו אחרי המספרים הסגולים – זה המסלול של השמן.',set:{pos:'a'},hl:['V1','C1'],dur:9},
    {t:'השמן גם חוזר',x:'השמן שמעל הבוכנה נדחק החוצה, עובר בשסתום מ-B ל-T וחוזר למיכל. במערכת הידראולית השמן תמיד זורם <b>במעגל סגור</b>.',hl:['V1','T3'],dur:7},
    {t:'העומס קובע את הלחץ',x:'מכפילים את המסה ל-600 ק"ג: המד מתחת לבוכנה כמעט מוכפל, אבל המהירות כמעט לא משתנה. <b>הספיקה קובעת מהירות, העומס קובע לחץ.</b>',set:{m:600},act:(P,st)=>{st.x=0;},hl:['GA','G1'],dur:9},
    {t:'עצירה באמצע',x:'מחזירים את הידית ל-0: כל הפתחים חסומים, השמן כלוא מתחת לבוכנה והעומס נשאר באוויר. המשאבה שוב דוחפת הכול דרך שסתום הפריקה – חום.',set:{pos:'0'},act:(P,st)=>{st.x=Math.max(st.x,160);},hl:['V1','GA','RV'],dur:8},
    {t:'מכבים את המנוע',x:'אין ספיקה – אבל העומס עדיין למעלה, נשען על שמן כלוא בלחץ. יש כאן <b>אנרגיה אגורה</b>, גם כשהמכונה "כבויה".',set:{on:false},hl:['P1','GA','C1'],dur:8},
    {t:'זהירות: הורדה בלי משאבה',x:'מזיזים את הידית ל-b כשהמנוע כבוי: העומס יורד בכוח הכובד! לכן בנוהל בטיחות (הסימולציה הבאה) מורידים את העומס עד הסוף לפני כל עבודה.',set:{pos:'b'},hl:['C1','V1'],dur:9}],
  predict:[{q:'המנוע פועל והידית במצב 0 (הכול חסום). מה יראה מד הלחץ של המשאבה?',set:{on:true,pos:'0',auto:false},act:(P,st)=>{st.x=150;},opts:['0 bar – אין לאן לזרום','כ-15 bar – הלחץ של העומס','כ-127 bar – לחץ הפתיחה של שסתום הפריקה'],a:2,why:'המשאבה ממשיכה לדחוף ספיקה, אבל הדרך חסומה. הלחץ עולה עד ששסתום הפריקה נפתח (120 bar + עקיפה קטנה) ומחזיר את כל השמן למיכל.'},
    {q:'בזמן הרמה מכפילים את מסת העומס (300 → 600 ק"ג). מה יקרה למהירות ההרמה?',set:{on:true,pos:'a',auto:false,m:600},act:(P,st)=>{st.x=20;},opts:['תקטן לחצי','כמעט לא תשתנה – רק הלחץ יעלה','העומס לא יעלה בכלל'],a:1,why:'כל עוד הלחץ הדרוש נמוך מכיול שסתום הפריקה, כל ספיקת המשאבה נכנסת לצילינדר: v = Q/A₁. העומס הכבד משנה רק את הלחץ.'},
    {q:'העומס למעלה, הידית ב-0. מכבים את המנוע. מה יקרה לעומס?',set:{on:false,pos:'0',auto:false},act:(P,st)=>{st.x=200;},opts:['ייפול למטה','יישאר במקום','יעלה לאט'],a:1,why:'שסתום הפיקוד חוסם את קו A. השמן כלוא מתחת לבוכנה ונושא את העומס – גם בלי משאבה.'},
    {q:'המנוע כבוי והעומס למעלה. מזיזים את הידית ל-b (הורדה). מה יקרה?',set:{on:false,pos:'0',auto:false},act:(P,st)=>{st.x=200;},go:P=>{P.pos='b';},opts:['כלום – אין משאבה','העומס יירד בכוח הכובד','העומס יעלה'],a:1,why:'במצב b קו A מחובר למיכל. המשקל דוחף את השמן מתחת לבוכנה החוצה והעומס יורד – גם בלי משאבה. זו אנרגיה אגורה!'}],
  tasks:[{q:P=>`צילינדר בקוטר ${P.D} מ"מ, לחץ ${P.pr} bar. מה הכוח שהוא מפעיל? (ב-kN)`,a:P=>H.F(P.pr,H.A(P.D))/1000,u:'kN',hint:'F = p·A. A = π·D²/4, ו-1 bar = 0.1 N/mm².',rand:P=>{P.D=pick([32,40,50,63,80,100]);P.pr=pick([100,150,200,250]);}},
    {q:P=>`משקולת של ${P.m} ק"ג על צילינדר אנכי בקוטר ${P.D} מ"מ. איזה לחץ צריך כדי להחזיק אותה?`,a:P=>10*P.m*G/H.A(P.D),u:'bar',hint:'p = W/A₁, W = m·g. כפלו ב-10 כדי לעבור מ-N/mm² ל-bar.',rand:P=>{P.m=rnd(100,2000,50);P.D=pick([40,50,63,80,100]);}},
    {q:P=>`משאבה של ${P.Q} L/min מזינה צילינדר בקוטר ${P.D} מ"מ. מה מהירות ההרמה?`,a:P=>H.v(P.Q,H.A(P.D)),u:'mm/s',hint:'v = Q/A₁. המירו: Q·10⁶/60 = mm³/s.',rand:P=>{P.Q=rnd(4,40,1);P.D=pick([32,40,50,63,80]);}},
    {q:P=>`אותו צילינדר, פעם בהידראוליקה (${P.pr} bar) ופעם בפנאומטיקה (${C1_PNEU} bar). פי כמה גדול הכוח ההידראולי?`,a:P=>P.pr/C1_PNEU,u:'',hint:'השטח זהה, ולכן יחס הכוחות = יחס הלחצים.',rand:P=>{P.pr=pick([60,90,120,150,180,210,240]);}},
    {q:P=>`משאבה נותנת ${P.Q} L/min בלחץ ${P.pr} bar. מה ההספק ההידראולי?`,a:P=>H.kW(P.pr,P.Q),u:'kW',hint:'P = p·Q/600 (bar, L/min → kW).',rand:P=>{P.Q=rnd(5,80,1);P.pr=rnd(50,250,10);}}],
  faults:[{id:'pump',t:'משאבה שחוקה (דליפה פנימית)',sym:'"המשקולת עולה ויורדת לאט יותר מבעבר, אבל מגיעה למעלה ומחזיקה מצוין."',hint:'השוו את מהירות ההרמה ל-Q/A₁. מה מראה מד 1 כשהידית ב-0?',why:'המשאבה מחזירה חלק מהשמן פנימה ומספקת רק כ-55% מהספיקה. המהירות יורדת בשני הכיוונים, אבל שסתום הפריקה תקין – ב-0 הלחץ מגיע לכיול.'},
    {id:'relief',t:'שסתום פריקה תקוע פתוח חלקית / מכויל נמוך',sym:'"המנוע עובד, אבל המשקולת עולה לאט מאוד, ועם משקל גדול היא לא עולה בכלל."',hint:'מה מראה מד 1 כשהידית ב-0? האם הוא מגיע ל-120 bar?',why:'השסתום נפתח כבר בכ-20 bar ומחזיר חלק גדול מהשמן למיכל. הלחץ המקסימלי נמוך – אין מספיק כוח, והמהירות יורדת.'},
    {id:'leak',t:'דליפה פנימית בשסתום הפיקוד (ספול (מגופה) שחוק)',sym:'"עצרנו את המשקולת באמצע – והיא שוקעת לאט למטה."',hint:'הסתכלו על גובה העומס ועל מהירותו כשהידית ב-0.',why:'דרך המרווח בין הספול לגוף השמן זולג מ-A ל-T. במצב 0 העומס לא באמת נעול ושוקע לאט – אסור לעבוד מתחת לעומס שמוחזק רק בשמן.'}],
  test(H){const P=clone(this.P);P.auto=false;P.path=false;const s=this.init(P);s.x=50;let R;for(let t=0;t<.3;t+=.02)R=this.step(P,s,.02,{});
    const A1=H.A(50),A2=H.Aann(50,28),W=300*G;
    const P2=clone(this.P);P2.auto=false;P2.pos='0';const s2=this.init(P2);s2.x=150;const R2=this.step(P2,s2,.02,{});
    const P3=clone(this.P);P3.auto=false;P3.on=false;P3.pos='b';const s3=this.init(P3);s3.x=150;const R3=this.step(P3,s3,.02,{});const pg=(10*(W-C1_FF)+H.PVAC*A2)/A1;
    return [['F = p·A (200 bar, Ø50)',H.F(200,A1)/1000,39.27],['הרמה: v = Q/A₁',R.v,H.v(12,A1)],['איזון כוחות בהרמה',(R.pA*A1-R.pB*A2)/10,W+C1_FF],['מצב 0: p החזקה = W/A₁',R2.pA,10*W/A1],
      ['מצב 0: p משאבה = כיול + עקיפה',R2.ps,120+Math.max(3,.06*120)],['הורדה בלי משאבה: v = k√p/A₁',R3.v,-H.v(C1_KV*Math.sqrt(pg),A1)],['UI לחץ משאבה',R.read[0].v,R.ps],['UI גובה',R2.read[3].v,150]];}};

/* ---------- 2 · zero-energy (lockout) procedure ---------- */
const C1_ZS=300,C1_ZKV=1.6,C1_ZKBL=2.2,C1_ZPHI=4,C1_ZPCR=2,C1_ZFF=250,C1_ZKLK=.25,C1_ZKJ=5;
const C1_zPacc=(Vo,P)=>Vo>1e-9?(P.p0+1)*P.V0/Math.max(P.V0-Vo,1e-6)-1:0;            // Boyle (isothermal), absolute = gauge + 1
const C1_zVo=(p,P)=>p>P.p0?P.V0*(1-(P.p0+1)/(p+1)):0;
const C1_zE=(Vo,P)=>Vo>0?(P.p0+1)*.1*P.V0*Math.log(P.V0/Math.max(P.V0-Vo,1e-6)):0;   // kJ
const C1_zEq=P=>P.pr+Math.max(3,.06*P.pr);
function C1_zTbleed(P,Vo){let t=0,V=Vo;const dt=.01;while(V>1e-5&&t<120){V-=C1_ZKBL*Math.sqrt(Math.max(C1_zPacc(V,P),0))*dt/60;t+=dt;}return t;}
const C1_ZROLE={ISO:['מפסק ראשי עם מנעול ותווית','מנתק את החשמל למנוע. בנוהל: נועלים במנעול אישי ותולים תווית "אין להפעיל" – כך אף אחד לא יפעיל את המשאבה בזמן העבודה. לחיצה נועלת / משחררת.'],
  P1:['משאבה + מנוע','מקור האנרגיה הראשי. לחיצה מפעילה / עוצרת (אם המפסק נעול – המנוע לא יניע).'],
  CV:['שסתום אל-חוזר אחרי המשאבה','מונע ממצבר הלחץ להחזיר שמן דרך המשאבה. בגללו הלחץ נשאר כלוא בקו גם כשהמשאבה עומדת.'],
  RV:['שסתום פריקה','מגביל את לחץ המשאבה. הוא לפני האל-חוזר – ולכן לא יכול לפרוק את מצבר הלחץ!'],
  AC:['מצבר לחץ הידראולי','בלון עם גז (חנקן) דחוס ושמן. אוגר אנרגיה ומחזיר אותה גם כשהמשאבה כבויה – מקור תנועה מסוכן בזמן תחזוקה.'],
  SVB:['ברז פריקת מצבר הלחץ','מחבר את מצבר הלחץ למיכל כדי לרוקן ממנו את השמן בלחץ. לחיצה פותחת / סוגרת.'],
  G1:['מד לחץ G1 – קו המערכת','הלחץ בקו שבין האל-חוזר לשסתום הפיקוד (מחובר גם למצבר לחץ).'],GA:['מד לחץ G2 – מצבר לחץ','הלחץ במצבר. צריך להראות אותו דבר כמו G1 – הם על אותו קו.'],GC:['מד לחץ G3 – בין האל-חוזר לצילינדר','מראה לחץ כלוא: האל-חוזר המפוקד מחזיק כאן את העומס גם כשכל השאר פרוק.'],
  V1:['שסתום פיקוד 4/3, מרכז צף','במצב 0: P חסום, A ו-B פתוחים למיכל – כך הפיקוד מתרוקן והאל-חוזר נסגר. לחיצה מזיזה את הידית.'],
  PC:['אל-חוזר מפוקד (POCV)','נועל את העומס: שמן נכנס לצילינדר בחופשיות, ויוצא רק כשיש לחץ פיקוד מקו B.'],
  FT:['מחבר הצינור של הצילינדר','כאן הטכנאי צריך לעבוד (להחליף צינור). לחיצה פותחת / סוגרת את המחבר.'],
  C1:['צילינדר אנכי עם עומס','עומס מורם = אנרגיית גובה (m·g·h). כל עוד הוא למעלה – השמן מתחתיו בלחץ.'],LIST:['רשימת הביצוע של הנוהל','ירוק = בוצע, צהוב = הצעד הבא, אדום = בעיה. הציון מחושב כשפותחים את המחבר.']};
function C1_zCond(P,st){return {lower:st.x<=1,stop:!P.on,lock:P.lock,bleed:(st.gA??99)<=1,tried:!!st.tried,verify:!!(st.ver&&st.ver.ok)};}
function C1_zTrue(P,st){return {lower:st.x<=1,stop:!P.on,lock:P.lock,bleed:(st.pS??99)<=1,tried:!!st.tried,verify:!!(st.ver&&st.ver.ok)};}
const C1_ZPTS={lower:20,stop:10,lock:20,bleed:20,tried:10,verify:20};
function C1_zScore(st){if(!st.base)return null;let s=0;for(const k in C1_ZPTS)if(st.base[k])s+=C1_ZPTS[k];return Math.max(0,s-25*st.acc.length);}
function C1_zVerify(P,st,R){const g=[R.ps,R.gA,R.gC];const ok=g.every(x=>Math.abs(x)<=1)&&P.lock&&!P.on;st.ver={t:st.t,ok,g:g.map(x=>+x.toFixed(1)),lock:P.lock,on:P.on};return st.ver;}
function C1_zEvents(P,st){const pv=st.prev;
  if(P.lock&&P.on){P.on=false;if(pv.lock){st.tried=true;st.msg='try';}else st.msg='lockrun';}
  if(P.on!==pv.on||P.lock!==pv.lock||P.bleed!==pv.bleed||P.pos!==pv.pos){if(st.ver)st.ver=null;}
  if(P.lock!==pv.lock)st.mvLog=false;
  st.prev={on:P.on,lock:P.lock,pos:P.pos,bleed:P.bleed,open:pv.open};}
function C1_zOpenEdge(P,st){const pv=st.prev;if(P.open&&!pv.open){st.open0=st.t;st.base=C1_zTrue(P,st);st.jetLog=false;}if(!P.open&&pv.open){st.open0=null;st.base=null;}pv.open=P.open;}
const C1_SIM_LOTO={id:'loto',n:2,t:'נוהל אפס אנרגיה',d:'נעילה ותיוג לפני תחזוקה: היכן נשארת אנרגיה (עומס מורם, מצבר לחץ, לחץ כלוא) ומה קורה כשמדלגים על צעד',
  P:{on:true,pos:'0',lock:false,bleed:false,open:false,m:400,pr:150,Q:12,V0:2,p0:60,D:50,dr:28,hh:240,df:10},
  ui(U,P,A){U.grp('פעולות במכונה – לפי הסדר');U.seg(P,'on','מנוע המשאבה',[[true,'▶ הפעלה','הפעלת המנוע'],[false,'■ עצירה','עצירת המנוע']]);
    U.seg(P,'pos','ידית השסתום',[['a','▲ a','מצב a – הרמה'],['0','■ 0','מצב 0 – מרכז צף'],['b','▼ b','מצב b – הורדה']]);
    U.chk(P,'lock','🔒 מנעול ותווית על המפסק הראשי');U.chk(P,'bleed','ברז פריקת מצבר הלחץ פתוח');
    U.btn('🔍 אימות: כל המדים על 0?',()=>{const S=APP.sim;const R=S.step(APP.P,APP.st,0,{fault:APP.fault?APP.fault.id:null});C1_zVerify(APP.P,APP.st,R);});
    U.btn('🔧 פתיחה / סגירה של מחבר הצילינדר',()=>{APP.P.open=!APP.P.open;});
    U.btn('↺ התחלת הנוהל מחדש',()=>{Object.assign(APP.P,{on:true,pos:'0',lock:false,bleed:false,open:false});APP.st=APP.sim.init(APP.P);});
    U.note('אפשר גם ללחוץ על הרכיבים בשרטוט: מפסק, משאבה, ידית, ברז הפריקה והמחבר.');
    U.grp('נתוני המכונה',false);U.num(P,'m','מסת העומס','kg',{min:50,max:2000,step:10});U.num(P,'pr','כיול שסתום הפריקה','bar',{min:40,max:300,step:5});U.num(P,'V0','נפח מצבר הלחץ','L',{min:.5,max:20,step:.5});U.num(P,'p0','לחץ טעינה מוקדמת (גז)','bar',{min:20,max:120,step:5});},
  circuit(P){return {comps:[{id:'C1',type:'cyl',x:60,y:200,rot:-90,o:{load:{t:'m'}},name:'צילינדר אנכי עם עומס',lbl:'צילינדר',lblAt:[-30,96],l3:[40,-150]},
      {id:'PC',type:'check',x:150,y:205,rot:180,flip:true,o:{pilot:true,spring:true},name:'אל-חוזר מפוקד (POCV) – מחזיק את העומס',lbl:'אל-חוזר מפוקד',lblAt:[24,4],l3:[0,-28]},
      {id:'FT',type:'c1_fit',x:105,y:250,name:'מחבר הצינור של הצילינדר – כאן עובדים',lbl:'מחבר',lblAt:[0,22]},
      {id:'GC',type:'gauge',x:132,y:238,net:'C',name:'מד G3 – לחץ כלוא בצילינדר',lbl:'G3',lblAt:[0,-16],valAt:[-14,-4],l3:[0,-30]},
      {id:'V1',type:'dcv',x:260,y:200,o:{box:KIT.D43.float,L:'lever',center:true},name:'שסתום פיקוד 4/3, מרכז צף (A,B→T)',lbl:'שסתום פיקוד',lblAt:[0,-24],l3:[0,-34]},
      {id:'P1',type:'pump',x:200,y:330,name:'משאבה + מנוע',lbl:'משאבה',lblAt:[-30,32],l3:[0,-34]},{id:'T1',type:'tank',x:200,y:368,name:'מיכל'},
      {id:'ISO',type:'c1_iso',x:105,y:330,o:{lx:24},name:'מפסק ראשי עם מנעול ותווית',lbl:'מפסק',lblAt:[-30,4],l3:[0,-30]},
      {id:'CV',type:'check',x:200,y:272,name:'אל-חוזר אחרי המשאבה',lbl:'',lblAt:[0,0]},
      {id:'RV',type:'pv',x:240,y:296,rot:90,o:{kind:'relief'},name:'שסתום פריקה',lbl:'פריקה',lblAt:[0,44]},{id:'T2',type:'tank',x:285,y:314,name:'מיכל'},
      {id:'T3',type:'tank',x:320,y:252,name:'מיכל'},
      {id:'G1',type:'gauge',x:225,y:236,net:'PA',name:'מד G1 – קו המערכת',lbl:'G1',lblAt:[-16,-12],valAt:[-16,-2],l3:[0,-30]},
      {id:'AC',type:'accum',x:380,y:226,name:'מצבר לחץ הידראולי',lbl:'מצבר',lblAt:[30,-8],l3:[0,-34]},
      {id:'GA',type:'gauge',x:405,y:258,name:'מד G2 – מצבר לחץ',lbl:'G2',lblAt:[-16,-12],valAt:[14,-10],l3:[0,-30]},
      {id:'SVB',type:'sv',x:430,y:290,name:'ברז פריקת מצבר הלחץ',lbl:'ברז פריקה',lblAt:[36,4]},{id:'T4',type:'tank',x:430,y:322,name:'מיכל'},
      {id:'LIST',type:'c1_list',x:300,y:-6,o:{w:240,h:176},name:'רשימת הביצוע של הנוהל'}],
     lines:[{id:'LS',net:'S',pts:['T1.t','P1.in']},{id:'LP',net:'P',pts:['P1.out','CV.in']},{id:'LRV',net:'P',pts:[[200,296],'RV.P']},{id:'LRT',net:'T',pts:['RV.T',[285,296],'T2.t']},
      {id:'LPA1',net:'PA',pts:['CV.out',[200,248],[253,248]]},{id:'LPA2',net:'PA',pts:[[253,248],'V1.P'],nodot:true},{id:'LPA3',net:'PA',pts:[[253,248],[253,270],[380,270]],nodot:true},
      {id:'LAC',net:'PA',pts:[[380,270],'AC.p']},{id:'LBL',net:'PA',pts:[[380,270],[430,270],'SVB.out'],nodot:true},{id:'LBT',net:'T',pts:['SVB.in','T4.t']},
      {id:'LT',net:'T',pts:['V1.T',[267,234],[320,234],'T3.t']},
      {id:'LA1',net:'A1',pts:['V1.A',[253,166],[150,166],'PC.in']},{id:'LC1',net:'C',pts:['PC.out',[150,250],'FT.r']},{id:'LC2',net:'C',pts:['FT.l','C1.A']},
      {id:'LB',net:'B',pts:['V1.B',[267,150],'C1.B']},{id:'LX',net:'B',kind:'pilot',pts:[[126,150],'PC.X']}]};},
  init(P){const A1=H.A(P.D),hold=10*P.m*G/A1;const Vo=C1_zVo(C1_zEq(P),P);return {x:240,Vo,pS:C1_zPacc(Vo,P),gA:C1_zPacc(Vo,P),pC:hold,t:0,tried:false,ver:null,acc:[],open0:null,base:null,msg:'',si:KIT.idx[P.pos],mvLog:false,jetLog:false,
    prev:{on:P.on,lock:P.lock,pos:P.pos,bleed:P.bleed,open:false}};},
  click(id,P,st){if(id==='ISO'){P.lock=!P.lock;return true;}if(id==='P1'){P.on=!P.on;return true;}if(id==='V1'){P.pos=P.pos==='a'?'0':P.pos==='0'?'b':'a';return true;}
    if(id==='SVB'){P.bleed=!P.bleed;return true;}if(id==='FT'){P.open=!P.open;return true;}return false;},
  tip(id,P,R){const r=C1_ZROLE[id];return r?r[1]:'';},
  step(P,st,dt,ctx){const f=ctx.fault,A1=H.A(P.D),A2=H.Aann(P.D,Math.min(P.dr,P.D-4)),a=A2/A1,W=P.m*G,hold=10*W/A1,S=C1_ZS,kV=C1_ZKV;
    st.t+=dt;C1_zEvents(P,st);
    const on=P.on,Qp=on?P.Q:0,pr=P.pr,ov=Math.max(3,.06*pr),dir=KIT.dirOf(P.pos),open=P.open;
    const up=st.x<S-1e-6,dn=st.x>1e-6,c=10*(W+C1_ZFF)/A1+C1_ZPCR,need=(hold+C1_ZPCR)/C1_ZPHI;
    const cyl=p=>{if(open){if(dir>0&&p>0)return {q:kV*Math.sqrt(p),m:'jet'};return {q:0,m:'open'};}
      if(dir>0&&up&&p>c)return {q:kV*Math.sqrt((p-c)/(1+a**3)),m:'up'};
      if(dir<0&&dn&&p>need){let Qo=kV*Math.sqrt(Math.max(10*(W-C1_ZFF)+p*A2,0)/(A1+a*a*A2));Qo=Math.min(Qo,kV/a*Math.sqrt(Math.max(p-need,0)));return {q:a*Qo,Qo,m:'down'};}
      return {q:0,m:'none'};};
    const Qbl=p=>P.bleed?C1_ZKBL*Math.sqrt(Math.max(p,0)):0,Qin=p=>Qp>0?Math.max(Qp-H.reliefQ(p+.5,pr,ov,Qp),0):0;
    let p;if(st.Vo>1e-7)p=C1_zPacc(st.Vo,P);else if(Qp>0){const g=pp=>Qin(pp)-cyl(pp).q-Qbl(pp);p=g(P.p0)>=0?P.p0:H.bisect(g,0,P.p0);}else p=0;
    const cy=cyl(p),qb=Qbl(p),qi=Qin(p);
    if(dt>0){const dV=(qi-cy.q-qb)*dt/60;if(st.Vo>1e-7||(dV>0&&p>=P.p0-1e-6))st.Vo=clamp(st.Vo+dV,0,P.V0*.97);}
    let v=0,qA1=0,qC=0,qB=0,qT=0,pA1=0,pB=0,jet=0,oP=0,leak=0;
    if(open){if(dn){const Qj=C1_ZKJ*Math.sqrt(hold);v=-H.v(Qj,A1);jet+=Qj;qC=-Qj;st.pC=hold;}else st.pC=0;
      if(cy.m==='jet'){jet+=cy.q;qA1=cy.q;qC+=cy.q;pA1=p/2;oP=1;}if(dir<0)pB=p;}
    else if(cy.m==='up'){const Qi=cy.q,pO=(a*Qi/kV)**2;v=H.v(Qi,A1);qA1=Qi;qC=Qi;pA1=p-(Qi/kV)**2;pB=pO;qB=-a*Qi;qT=a*Qi;st.pC=(10*(W+C1_ZFF)+pO*A2)/A1;oP=1;}
    else if(cy.m==='down'){const Qo=cy.Qo;v=-H.v(Qo,A1);qA1=-Qo;qC=-Qo;pA1=(Qo/kV)**2;pB=p-(cy.q/kV)**2;qB=cy.q;qT=Qo;st.pC=(10*(W-C1_ZFF)+pB*A2)/A1;oP=1;}
    else{if(dir>0)pA1=p;if(dir<0)pB=p;
      if(!dn){if(dir<0&&p*C1_ZPHI>st.pC+C1_ZPCR){st.pC=0;oP=1;}}
      else if(!up)st.pC=Math.max(st.pC,hold,dir>0?p-C1_ZPCR:0);
      else st.pC=hold;
      const pAin=dir>0?p:0;
      if((f==='pocv'||f==='seal')&&dn&&st.pC>.5&&pAin<st.pC&&!(f==='seal'&&dir<0)){leak=C1_ZKLK*Math.sqrt(st.pC);v=-H.v(leak,A1);
        if(f==='pocv'){qA1=-leak;qC=-leak;qB=a*leak;qT=dir===0?leak:0;}else{qB=-(1-a)*leak;qT=(1-a)*leak;}}}
    if(dt>0){st.x=clamp(st.x+v*dt,0,S);if(st.x<=1e-6&&(leak>0||open))st.pC=0;}
    KIT.ease(st,'si',KIT.idx[P.pos],dt);if(on)KIT.rpmAng(st,dt,1450);
    st.pS=p;C1_zOpenEdge(P,st);
    if(P.lock&&Math.abs(v)>2&&!open&&!st.mvLog&&dt>0){st.mvLog=true;st.acc.push({k:'motion',t:st.t,p,x:st.x,v});}
    if(open&&jet>.3&&!st.jetLog&&dt>0){st.jetLog=true;st.acc.push({k:'jet',t:st.t,p:Math.max(hold,dir>0?p:0),x:st.x});}
    const gA=f==='gauge'?0:p,gC=open?0:st.pC;st.gA=gA;
    const Eacc=C1_zE(st.Vo,P),Eload=W*st.x/1e6,pP=on?p+.5:0;
    /* checklist (as the technician sees it) */
    const cd=C1_zCond(P,st);let nxt=null;const rows=C1_ZSTEPS.map(([t,k])=>{if(k==='work'){const sc=C1_zScore(st);return {s:st.open0!=null?(sc===100?'ok':'bad'):(nxt==null?'next':'todo'),v:st.open0!=null?`${sc}/100`:''};}
      const ok=cd[k];if(!ok&&nxt==null)nxt=k;const vv={lower:`${Math.round(st.x)} mm`,stop:on?'פועלת':'עומדת',lock:P.lock?'נעול':'—',bleed:`G2 ${fmt(gA,0)} bar`,tried:st.tried?'לא הניע':'—',verify:st.ver?(st.ver.ok?'עבר':'נכשל'):'—'}[k];
      return {s:ok?'ok':(st.ver&&k==='verify'&&!st.ver.ok)?'bad':nxt===k?'next':'todo',v:vv};});
    const sc=C1_zScore(st);const fl=st.open0!=null?(sc===100?['ציון: 100/100 – מצב אפס אנרגיה ✓','#166534','#dcfce7']:[`ציון: ${sc}/100 – אנרגיה נשארה במערכת!`,'#991b1b','#fee2e2']):[st.acc.length?'⚠ אירוע מסוכן נרשם':'הציון יחושב כשתפתחו את המחבר',st.acc.length?'#991b1b':'#334155',st.acc.length?'#fee2e2':'#f1f5f9'];
    const pm=pr,Etot=Eacc+Eload;
    return {A1,A2,a,W,hold,ps:p,pC:st.pC,gA,gC,pA1,pB,v,x:st.x,Vo:st.Vo,Eacc,Eload,Etot,qb,qi,Qr:Qp-qi,jet,cy:cy.m,dir,leak,next:nxt,score:sc,
      p:{S:-.05,P:pP,PA:p,A1:pA1,C:gC,B:pB,T:0},
      q:{LS:Qp,LP:Qp,LRV:Qp-qi,LRT:Qp-qi,LPA1:qi,LPA2:cy.q,LPA3:qi-cy.q,LAC:qi-cy.q-qb,LBL:qb,LBT:qb,LT:Math.abs(qT),LA1:qA1,LC1:qC,LC2:qC,LB:qB},pmax:pm,qref:P.Q,
      c:{C1:{x:st.x/S,uA:st.pC/pm,uB:pB/pm,lt:`${fmt(P.m,0)} kg`},V1:{i:st.si},P1:{on,ang:st.ang||0},RV:{open:Qp>0?clamp((Qp-qi)/Qp,0,1):0},PC:{open:oP},CV:{open:qi>.05?1:0},
        AC:{fill:st.Vo/P.V0,u:p/pm},SVB:{closed:!P.bleed},GA:{p:gA},GC:{p:gC},ISO:{on,lock:P.lock},FT:{open,jet:jet>.3},LIST:{rows,f:fl[0],fc:fl[1],fb:fl[2]}},
      read:[{k:'G1 – מערכת',v:p,u:'bar'},{k:'G2 – מצבר לחץ',v:gA,u:'bar'},{k:'G3 – צילינדר',v:gC,u:'bar',w:gC>1&&!on},{k:'גובה העומס',v:st.x,u:'mm',max:S},
        {k:'אנרגיה אגורה',v:Etot,u:'kJ',dg:2,max:C1_zE(C1_zVo(C1_zEq(P),P),P)+W*S/1e6,w:Etot>.05&&!on},{k:'ספיקה בקו A',v:qA1,u:'L/min',dg:2,max:P.Q},{k:'ספיקה בקו B',v:qB,u:'L/min',dg:2,max:P.Q}]};},
  ins(P,R,st){const L=[];const lab=k=>C1_ZSTEPS.find(s=>s[1]===k)[0];
    st.acc.slice(-2).reverse().forEach(e=>{if(e.k==='jet')L.push({ic:'🚨',w:true,at:'FT',h:`<b>תאונה!</b> פתחתם את המחבר כשבצילינדר היו כלואים <b>${fmt(e.p,0)} bar</b>: סילון שמן ${e.x>1?'והעומס נופל':''}. סילון דק בלחץ כזה חודר לעור – פגיעה שדורשת טיפול רפואי מיידי.`,c:'סילון שמן בלחץ!'});
      else L.push({ic:'🚨',w:true,at:'C1',h:`<b>תנועה לא צפויה!</b> המפסק נעול – ובכל זאת העומס זז (${fmt(Math.abs(e.v),0)} mm/s). נעילת החשמל לא מספיקה: ${R.ps>1?`מצבר הלחץ (${fmt(R.ps,0)} bar) הוא מקור אנרגיה בפני עצמו.`:'יש עוד אנרגיה במערכת – בדקו את המדים.'}`,c:'העומס זז אחרי הנעילה!'});});
    if(st.open0!=null){const b=st.base,miss=Object.keys(C1_ZPTS).filter(k=>!b[k]);L.push({ic:R.score===100?'🏆':'📋',h:R.score===100?'<b>100/100</b> – כל מקורות האנרגיה נוטרלו לפני פתיחת המעגל. עבודה בטוחה!':`ציון <b>${R.score}/100</b>. ${miss.length?'לא בוצע לפני הפתיחה: '+miss.map(lab).join(' · ')+'.':''}${st.acc.length?` ${st.acc.length} אירועים מסוכנים (−25 כל אחד).`:''}`});}
    else if(R.next){const how={lower:['V1','הזיזו את הידית להורדה (▼) עד שהעומס למטה – כל עוד המשאבה פועלת.'],stop:['P1','עצרו את המשאבה בלחצן הרגיל.'],lock:['ISO','נעלו את המפסק הראשי במנעול אישי ותלו תווית.'],bleed:['SVB','פתחו את ברז הפריקה וחכו שמד G2 יגיע ל-0.'],tried:['P1','נסו להפעיל את המשאבה – אם המנוע לא מניע, הנעילה עובדת.'],verify:['G1','לחצו "אימות" ובדקו ש-G1, G2 ו-G3 כולם על 0.']}[R.next];
      L.push({ic:'👉',at:how[0],h:`הצעד הבא: <b>${lab(R.next)}</b> – ${how[1]}`});}
    else L.push({ic:'✅',at:'FT',h:'כל הבדיקות עברו. עכשיו אפשר לפתוח את המחבר ולהתחיל לעבוד.'});
    if(st.msg==='try'&&P.lock)L.push({ic:'🔒',h:'ניסיון הפעלה: המנוע לא הניע – הנעילה עובדת.'});
    if(st.msg==='lockrun')L.push({ic:'ℹ️',h:'נעלתם כשהמשאבה פעלה: המפסק עצר אותה. עדיף לעצור קודם בלחצן הרגיל – ניתוק תחת עומס שוחק את המגעים.'});
    if(st.ver)L.push({ic:st.ver.ok?'✅':'❌',at:'G1',h:st.ver.ok?`אימות עבר: G1 = ${st.ver.g[0]}, G2 = ${st.ver.g[1]}, G3 = ${st.ver.g[2]} bar, המפסק נעול.`:`אימות נכשל: G1 = ${st.ver.g[0]}, G2 = ${st.ver.g[1]}, G3 = ${st.ver.g[2]} bar${st.ver.lock?'':', המפסק לא נעול'}${st.ver.on?', המשאבה פועלת':''}.`});
    if(R.pC>1&&!P.on&&!P.open)L.push({ic:'⚠️',w:true,at:'GC',h:`לחץ כלוא <b>${fmt(R.pC,0)} bar</b> בין האל-חוזר לצילינדר – המשאבה ${P.lock?'נעולה':'כבויה'}, אבל העומס עדיין "יושב" על השמן. פתיחת המחבר כאן = סילון שמן ונפילת העומס.`,c:`${fmt(R.pC,0)} bar כלואים כאן`});
    if(R.ps>1&&!P.on)L.push({ic:'🔋',w:true,at:'AC',h:`מצבר הלחץ עדיין טעון: ${fmt(R.ps,0)} bar, <b>${fmt(R.Eacc,1)} kJ</b>. הזזת הידית תזיז את הצילינדר גם כשהמשאבה נעולה. הפתרון: ברז הפריקה.`,c:'מצבר הלחץ טעון – מקור תנועה!'});
    L.push({ic:'⚡',h:`אנרגיה אגורה: מצבר לחץ <b>${fmt(R.Eacc,2)} kJ</b> + עומס מורם <b>${fmt(R.Eload,2)} kJ</b>${R.Etot>.02?` – כמו משקולת של 100 ק"ג שנופלת מגובה ${fmt(R.Etot*1000/(100*G),1)} m.`:' – כמעט אפס ✓'}`});
    if(R.ps<=1&&P.bleed)L.push({ic:'🎈',h:`המד על 0, אבל בצד הגז נשאר לחץ הטעינה המוקדמת (${P.p0} bar חנקן). זה תקין – אסור לפרק את מצבר הלחץ עצמו בלי נוהל מיוחד.`});
    return C1_bdL(L);},
  calc(P,R,st){const Vg=P.V0-R.Vo,t=C1_zTbleed(P,R.Vo),b=st&&st.base,dF=10,Ff=H.F(Math.max(R.pC,R.ps),H.A(dF));
    return `<div class="kpis">${kpi('אנרגיה במצבר לחץ',fmt(R.Eacc,2),'kJ')}${kpi('אנרגיית העומס',fmt(R.Eload,2),'kJ')}${kpi('לחץ החזקה',fmt(R.hold,1),'bar')}${kpi('זמן פריקה',fmt(t,1),'s')}</div>`+
    det('מצבר הלחץ – חוק בויל (תהליך איזותרמי)',row('לחצים מוחלטים',`p_abs = p + 1 bar`)+row('נפח הגז',`V_g = V₀·${fr('p₀ + 1','p + 1')} = ${P.V0}·${fr(P.p0+1,fmt(R.ps+1,1))} = ${V(Vg,'L',3)}`)+row('שמן במצבר לחץ',`V_oil = V₀ − V_g = ${V(R.Vo,'L',3)}`)+
      row('אנרגיה',`E = (p₀+1)·V₀·ln${fr('V₀','V_g')} = ${fmt(P.p0+1,0)}·10⁵·${P.V0}·10⁻³·ln(${fmt(P.V0/Math.max(Vg,1e-6),3)}) = ${V(R.Eacc,'kJ',3)}`),true)+
    det('העומס המורם',row('לחץ ההחזקה',`p = ${fr('m·g','A₁')} = ${fr(fmt(R.W,0),fmt(R.A1,0))}·10 = ${V(R.hold,'bar')}`)+row('אנרגיית גובה',`E = m·g·h = ${fmt(R.W,0)}·${fmt(R.x/1000,3)} = ${V(R.Eload*1000,'J',0)}`)+
      row(`כוח על פקק/מחבר Ø${dF} – הוא "נורה" כשמשחררים את ההברגה`,`F = p·A = ${fmt(Math.max(R.pC,R.ps),0)}·${fmt(H.A(dF),1)}/10 = ${V(Ff,'N',0)}`),true)+
    det('פריקת מצבר הלחץ',row('ספיקה בברז',`Q = k·√p, k = ${C1_ZKBL} L/min/√bar ⇒ עכשיו ${V(C1_ZKBL*Math.sqrt(Math.max(R.ps,0)),'L/min')}`)+row(`זמן עד 0 (מתחת ל-p₀ = ${P.p0} bar מצבר הלחץ ריק והלחץ צונח ל-0)`,`t = ∫dV/Q ≈ ${V(t,'s')}`))+
    (b?det('ציון הנוהל',Object.keys(C1_ZPTS).map(k=>row(C1_ZSTEPS.find(s=>s[1]===k)[0],`${b[k]?'+'+C1_ZPTS[k]:'0'} / ${C1_ZPTS[k]}`,!!b[k])).join('')+row('אירועים מסוכנים',`${st.acc.length} × (−25)`,st.acc.length===0)+row('סה"כ',`${R.score}/100`),true):'')+
    det('1.3 – כללי בטיחות',C1_txt('דליפות','לעולם לא מחפשים דליפה ביד – סילון דק חודר לעור גם בלחץ של עשרות bar. מחפשים בעזרת קרטון.')+C1_txt('עומס מורם','לא עובדים מתחת לעומס שמוחזק רק בהידראוליקה: מורידים אותו או תומכים בו מכנית.')+C1_txt('מקורות אנרגיה','מצבר לחץ, עומס מורם, לחץ כלוא וקפיצים. הנוהל = לנטרל את כולם ולאמת.')+C1_txt('חום וצינורות','שמן חם (מעל כ-60°C) גורם לכוויות; צינור גמיש שנקרע מצליף בכוח.'))+
    `<div class="note">${C1_bd(`הנחות: גז איזותרמי, מפל לחץ בשסתום Δp = (Q/${C1_ZKV})², יחס פיקוד ${C1_ZPHI}, חיכוך ${C1_ZFF} N.`)}</div>`;},
  demo:[{t:'אנרגיה שנשארת במכונה',x:'הטכנאי צריך להחליף את הצינור של הצילינדר. אבל במכונה אגורה אנרגיה: <b>עומס מורם</b>, <b>מצבר לחץ טעון</b> ו<b>לחץ כלוא</b> בין האל-חוזר לצילינדר. נוהל אפס אנרגיה מנטרל את כולם – לפי הסדר.',reset:true,hl:['C1','AC','GC','LIST'],dur:11},
    {t:'1 · הורדת העומס',x:'כל עוד יש לחץ – מורידים את העומס עד הסוף (ידית ▼). לחץ קו B פותח את האל-חוזר בפיקוד, והשמן מתחת לבוכנה יוצא למיכל.',set:{pos:'b'},hl:['V1','PC','C1'],dur:7},
    {t:'2–3 · עצירה ונעילה',x:'מחזירים את הידית ל-0, עוצרים את המשאבה ונועלים את המפסק הראשי במנעול אישי עם תווית. אבל שימו לב: <b>מד G1 עדיין מראה לחץ</b> – מצבר הלחץ טעון.',set:{pos:'0',on:false,lock:true},act:(P,st)=>{st.x=0;st.pC=0;},hl:['P1','ISO','G1'],dur:9},
    {t:'4 · פריקת מצבר הלחץ',x:'פותחים את ברז הפריקה: השמן יוצא למיכל והלחץ יורד. מתחת ללחץ הטעינה המוקדמת מצבר הלחץ ריק – והמד צונח ל-0.',set:{bleed:true},hl:['SVB','GA','AC'],dur:9},
    {t:'5 · ניסיון הפעלה',x:'מנסים להפעיל את המשאבה. המנוע לא מניע – הנעילה עובדת. (תמיד מחזירים אחר כך את המתג למצב כבוי.)',act:(P,st)=>{st.prev.lock=P.lock;P.on=true;},hl:['ISO','P1'],dur:7},
    {t:'6 · אימות',x:'בודקים את <b>כל</b> המדים: G1, G2 ו-G3 על 0. רק עכשיו המערכת במצב אפס אנרגיה.',act:(P,st)=>{st.Vo=0;const R=C1_SIM_LOTO.step(P,st,0,{});C1_zVerify(P,st,R);},hl:['G1','GA','GC','LIST'],dur:8},
    {t:'7 · עובדים בבטחה',x:'פותחים את המחבר: אין לחץ, אין סילון, העומס על הקרקע. ציון 100.',act:P=>{P.open=true;},hl:['FT','LIST'],dur:8},
    {t:'ומה אם מדלגים?',x:'אותו מצב – אבל בלי להוריד את העומס. המשאבה נעולה ומצבר הלחץ פרוק, ובכל זאת פתיחת המחבר משחררת סילון בלחץ של כ-20 bar והעומס נופל.',reset:true,set:{on:false,lock:true,bleed:true},act:(P,st)=>{st.Vo=0;st.tried=true;P.open=true;},hl:['FT','C1','GC'],dur:10}],
  predict:[{q:'המשאבה עצורה והמפסק נעול, אבל מצבר הלחץ עדיין טעון. מזיזים את הידית להרמה (▲). מה יקרה?',set:{on:false,lock:true},opts:['כלום – המשאבה נעולה','העומס יעלה – מצבר הלחץ דוחף שמן לצילינדר','רק המד יזוז'],a:1,go:P=>{P.pos='a';},why:'מצבר הלחץ הוא מקור אנרגיה עצמאי: השמן בלחץ זורם דרך שסתום הפיקוד לצילינדר והעומס עולה – למרות שהחשמל נעול.'},
    {q:'המשאבה נעולה ומצבר הלחץ פרוק, אבל העומס נשאר למעלה. מה יראה מד G3 (בין האל-חוזר לצילינדר)?',set:{on:false,lock:true,bleed:true},act:(P,st)=>{st.Vo=0;},opts:['0 bar','כ-20 bar – העומס עדיין לוחץ על השמן','כ-150 bar'],a:1,why:'האל-חוזר המפוקד סגור ומחזיק את השמן. הלחץ = W/A₁ = 400·9.81/1963 mm² ≈ 20 bar – לחץ כלוא שלא רואים ב-G1 וב-G2.'},
    {q:'אותו מצב (משאבה נעולה, מצבר לחץ פרוק, עומס למעלה). מזיזים את הידית להורדה (▼). מה יקרה?',set:{on:false,lock:true,bleed:true},act:(P,st)=>{st.Vo=0;},go:P=>{P.pos='b';},opts:['העומס יירד בכוח הכובד','העומס יישאר – אין לחץ פיקוד לפתוח את האל-חוזר','העומס יעלה'],a:1,why:'כדי לפתוח את האל-חוזר המפוקד צריך לחץ בקו B (כאן כ-5.5 bar). בלי משאבה ובלי מצבר לחץ אין לחץ – והעומס נשאר למעלה עם לחץ כלוא.'},
    {q:'משאבה נעולה, מצבר לחץ פרוק, אבל העומס למעלה. פותחים את מחבר הצילינדר. מה יקרה?',set:{on:false,lock:true,bleed:true},act:(P,st)=>{st.Vo=0;},go:P=>{P.open=true;},opts:['כלום – הכול פרוק','סילון שמן והעומס נופל','רק טפטוף קטן'],a:1,why:'המחבר נמצא בין האל-חוזר לצילינדר – בדיוק איפה שהלחץ כלוא. המשקל דוחף את השמן החוצה בסילון והעומס נופל.'}],
  tasks:[{q:P=>`עומס של ${P.m} ק"ג על צילינדר אנכי בקוטר ${P.D} מ"מ, מוחזק באל-חוזר. איזה לחץ כלוא יראה המד?`,a:P=>10*P.m*G/H.A(P.D),u:'bar',hint:'p = m·g/A₁ (כפול 10 ל-bar).',rand:P=>{P.m=rnd(100,2000,50);P.D=pick([40,50,63,80,100]);}},
    {q:P=>`מצבר לחץ ${P.V0} L, טעינה מוקדמת ${P.p0} bar, לחץ ${P.pr} bar. כמה ליטר שמן יש בו? (איזותרמי, לחץ מוחלט = p + 1)`,a:P=>P.V0*(1-(P.p0+1)/(P.pr+1)),u:'L',hint:'V_g = V₀·(p₀+1)/(p+1), V_oil = V₀ − V_g.',rand:P=>{P.V0=pick([1,2,4,6,10]);P.p0=pick([30,50,60,80]);P.pr=pick([120,150,180,210]);}},
    {q:P=>`עומס של ${P.m} ק"ג מורם לגובה ${P.hh} מ"מ. כמה אנרגיה אגורה בו? (ב-kJ)`,a:P=>P.m*G*P.hh/1e6,u:'kJ',hint:'E = m·g·h (h במטרים, התשובה ב-J; חלקו ב-1000).',rand:P=>{P.m=rnd(100,2000,50);P.hh=rnd(100,2000,50);}},
    {q:P=>`מצבר לחץ ${P.V0} L, p₀ = ${P.p0} bar, טעון ל-${P.pr} bar. כמה אנרגיה אגורה בו? (איזותרמי, ב-kJ)`,a:P=>(P.p0+1)*.1*P.V0*Math.log((P.pr+1)/(P.p0+1)),u:'kJ',hint:'E = (p₀+1)·V₀·ln((p+1)/(p₀+1)), עם 1 bar·L = 0.1 kJ.',rand:P=>{P.V0=pick([1,2,4,6,10]);P.p0=pick([30,50,60,80]);P.pr=pick([120,150,180,210]);}},
    {q:P=>`לחץ כלוא של ${P.pr} bar מאחורי פקק בקוטר ${P.df} מ"מ. איזה כוח פועל על הפקק?`,a:P=>H.F(P.pr,H.A(P.df)),u:'N',hint:'F = p·A (A = π·d²/4, חלקו ב-10).',rand:P=>{P.pr=rnd(40,300,10);P.df=pick([6,8,10,12,16]);}}],
  faults:[{id:'pocv',t:'אל-חוזר מפוקד דולף (תושבת פגומה)',sym:'"העומס לא נשאר למעלה – הוא זוחל למטה כשהידית באמצע."',hint:'כשהעומס שוקע – באיזה קו זורם שמן אל המיכל: A או B?',why:'השמן עובר דרך התושבת הפגומה של האל-חוזר המפוקד לקו A ומשם למיכל (ספיקה שלילית בקו A). צד המוט "שואב" שמן מקו B. אסור לסמוך על הידראוליקה להחזקת עומס בזמן עבודה.'},
    {id:'seal',t:'אטם הבוכנה דולף',sym:'"אחרי הרמה העומס לא מחזיק – הוא יורד לאט כשהידית ב-0."',hint:'כשהעומס שוקע – באיזה קו זורם שמן אל המיכל: A או B?',why:'השמן עובר מתחת לבוכנה אל צד המוט דרך האטם. קו A נשאר בלי זרימה (האל-חוזר המפוקד אוטם), אבל מקו B יוצא שמן למיכל – העודף שנובע מההפרש בין השטחים.'},
    {id:'gauge',t:'מד הלחץ של מצבר הלחץ (G2) תקוע על 0',sym:'"לפי המד מצבר הלחץ תמיד ריק – אז אין צורך לפרוק אותו, נכון?"',hint:'השוו את G2 ל-G1. שניהם על אותו קו – הם צריכים להראות אותו לחץ.',why:'המחוג תקוע (או ברז המד סגור). G1 מראה את הלחץ האמיתי. לכן מאמתים אפס אנרגיה בכמה מדים ובפעולה (פתיחת ברז ובדיקת זרימה) – לא לפי מד אחד.'}],
  test(H){const P=clone(this.P);const {R,st}=runSim(this,P,1);const A1=H.A(50),W=400*G,pe=150+Math.max(3,.06*150);
    const P2=clone(this.P);P2.on=false;P2.lock=true;P2.bleed=true;const r2=runSim(this,P2,15);
    const P3=clone(this.P);P3.on=false;P3.lock=true;P3.pos='b';const s3=this.init(P3);s3.Vo=0;let R3;for(let t=0;t<1;t+=.02)R3=this.step(P3,s3,.02,{});
    const P4=clone(this.P);P4.pos='b';const s4=this.init(P4);let R4;for(let t=0;t<.1;t+=.02)R4=this.step(P4,s4,.02,{});
    const Vo=2*(1-61/(R.ps+1));
    return [['מצבר לחץ: לחץ שיווי משקל = כיול + עקיפה',R.ps,pe,.01],['חוק בויל: V_oil',st.Vo,Vo],['E = (p₀+1)V₀ln(V₀/V_g)',R.Eacc,61*.1*2*Math.log(2/(2-Vo))],['לחץ כלוא = m·g/A₁',R.pC,10*W/A1],
      ['פריקה: מד G1 → 0',r2.R.ps,0,.5],['בלי פיקוד האל-חוזר המפוקד מחזיק',R3.x,240],['הורדה: איזון כוחות',(R4.pC*A1-R4.pB*H.Aann(50,28))/10,W-C1_ZFF],['UI מד G1',R.read[0].v,R.ps],['UI אנרגיה',R.read[4].v,R.Eacc+R.Eload]];}};

LABS.push({ch:1,title:'מבוא למערכות הספק נוזלי',sims:[C1_SIM_FIRST,C1_SIM_LOTO]});
}
