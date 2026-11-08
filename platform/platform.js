/* =====================================================================
   APEX VR LAB · platform.js
   The room, the headset session, hands/controllers/mouse, interaction,
   teleport, wrist menu, toasts. Stations are listed in stations.js.
   ===================================================================== */
(()=>{
const VRP=window.VRP=window.VRP||{};
const T=window.THREE,AD=window.THREE_ADDONS;
const app=VRP.app={stations:[],queue:[],ptrs:[]};
const V=(x=0,y=0,z=0)=>new T.Vector3(x,y,z);
const tmpM=new T.Matrix4(),tmpV=V(),tmpV2=V(),tmpQ=new T.Quaternion();

/* ===================== boot ===================== */
app.start=function(cfg){app.cfg=cfg;
  const renderer=app.renderer=new T.WebGLRenderer({antialias:true,powerPreference:'high-performance'});
  renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.setSize(innerWidth,innerHeight);renderer.outputColorSpace=T.SRGBColorSpace;
  renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.0;renderer.xr.enabled=true;renderer.xr.setReferenceSpaceType('local-floor');
  try{renderer.xr.setFoveation(1);}catch(e){}
  document.getElementById('stage').appendChild(renderer.domElement);
  const scene=app.scene=new T.Scene();scene.background=new T.Color(0x0e1522);
  try{const pm=new T.PMREMGenerator(renderer);scene.environment=pm.fromScene(new AD.RoomEnvironment(),.04).texture;}catch(e){}
  scene.add(new T.HemisphereLight(0xffffff,0x3c4658,.9));const sun=new T.DirectionalLight(0xffffff,1.3);sun.position.set(3,7,5);scene.add(sun);
  const cam=app.camera=new T.PerspectiveCamera(68,innerWidth/innerHeight,.02,80);scene.add(cam);
  app.spawn={x:cfg.start.pos[0],z:cfg.start.pos[1],yaw:cfg.start.yaw||0};
  app.desk={x:app.spawn.x,z:app.spawn.z,yaw:app.spawn.yaw,pitch:-.12};
  buildRoom(cfg);
  /* stations */
  for(const sc of cfg.stations){const lab=(window.LABS||[]).find(L=>String(L.ch)===String(sc.lab));if(!lab){console.warn('lab not loaded',sc.lab);continue;}
    try{app.stations.push(new VRP.Station(app,sc,lab));}catch(e){console.error('station',sc.id,e);}}
  buildToast();buildWelcome(cfg);buildKiosk(cfg);setupXR();setupDesktop();buildWristMenu(cfg);
  addEventListener('resize',()=>{cam.aspect=innerWidth/innerHeight;cam.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight);});
  app.clock=new T.Clock();renderer.setAnimationLoop(loop);
  document.body.classList.add('ready');};
app.later=fn=>app.queue.push(fn);
/* test hook: stop the automatic loop and advance frames by hand */
app.manual=function(){app.renderer.setAnimationLoop(null);app.clock.getDelta();};app.frames=function(n=1,dt=1/30){for(let i=0;i<n;i++){app._dt=dt;loop(performance.now(),null);}};

/* ===================== room ===================== */
function canvasTexture(w,h,draw,rep){const c=document.createElement('canvas');c.width=w;c.height=h;draw(c.getContext('2d'),w,h);const t=new T.CanvasTexture(c);t.colorSpace=T.SRGBColorSpace;t.anisotropy=8;if(rep){t.wrapS=t.wrapT=T.RepeatWrapping;t.repeat.set(...rep);}return t;}
function buildRoom(cfg){const S0=app.scene;const S=new T.Group();S.name='room';S0.add(S);const RW=cfg.room?cfg.room.w:14,RD=cfg.room?cfg.room.d:12,RH=4.2;app.room={w:RW,d:RD};
  /* epoxy floor with 1 m tiles */
  const ft=canvasTexture(512,512,(x,w,h)=>{x.fillStyle='#c9ced6';x.fillRect(0,0,w,h);for(let i=0;i<1800;i++){x.fillStyle=`rgba(90,100,115,${Math.random()*.05})`;x.fillRect(Math.random()*w,Math.random()*h,2,2);}x.strokeStyle='#b3b9c3';x.lineWidth=3;x.strokeRect(0,0,w,h);},[RW,RD]);
  const floor=new T.Mesh(new T.PlaneGeometry(RW,RD),new T.MeshStandardMaterial({map:ft,roughness:.55,metalness:.05}));floor.rotation.x=-Math.PI/2;floor.name='floor';S.add(floor);app.floor=floor;
  /* walls */
  const wm=new T.MeshStandardMaterial({color:0xe9ecf1,roughness:.9});const band=new T.MeshStandardMaterial({color:0x0b4f9c,roughness:.6});const base=new T.MeshStandardMaterial({color:0x374151,roughness:.6});
  [[0,-RD/2,0,RW],[0,RD/2,Math.PI,RW],[-RW/2,0,Math.PI/2,RD],[RW/2,0,-Math.PI/2,RD]].forEach(([x,z,r,L])=>{const w=new T.Mesh(new T.PlaneGeometry(L,RH),wm);w.position.set(x,RH/2,z);w.rotation.y=r;S.add(w);
    const b=new T.Mesh(new T.PlaneGeometry(L,.12),band);b.position.set(x,1.25,z);b.rotation.y=r;b.position.addScaledVector(V(Math.sin(r),0,Math.cos(r)),.005);S.add(b);
    const bb=new T.Mesh(new T.PlaneGeometry(L,.12),base);bb.position.set(x,.06,z);bb.rotation.y=r;bb.position.addScaledVector(V(Math.sin(r),0,Math.cos(r)),.005);S.add(bb);});
  /* ceiling + light panels */
  const ce=new T.Mesh(new T.PlaneGeometry(RW,RD),new T.MeshStandardMaterial({color:0x8d96a3,roughness:1}));ce.rotation.x=Math.PI/2;ce.position.y=RH;S.add(ce);
  const lp=new T.MeshBasicMaterial({color:0xf8fbff});for(let x=-RW/2+2;x<RW/2-1;x+=3)for(let z=-RD/2+2;z<RD/2-1;z+=3){const p=new T.Mesh(new T.PlaneGeometry(1.2,.6),lp);p.rotation.x=Math.PI/2;p.position.set(x,RH-.01,z);S.add(p);}
  /* title banner + logo on the back wall */
  const ban=new VRP.Panel(5.2,.62,{ppm:420,css:`.root{display:flex;align-items:center;justify-content:center;background:#0b2440;border-radius:26px;border:4px solid #1d4f86;color:#fff;font-size:96px;font-weight:800}`});
  ban.set('מעבדה במערכות הידראוליות ופנאומטיות');ban.mesh.position.set(0,3.35,-RD/2+.02);S0.add(ban.mesh);
  VRP.mergeStatic(S,new Set([floor]));
  if(cfg.logo){new T.TextureLoader().load(cfg.logo,t=>{t.colorSpace=T.SRGBColorSpace;const a=t.image.width/t.image.height;const m=new T.Mesh(new T.PlaneGeometry(.55*a,.55),new T.MeshBasicMaterial({map:t,transparent:true,toneMapped:false}));const bg=new T.Mesh(new T.PlaneGeometry(.55*a+.16,.71),new T.MeshBasicMaterial({color:0xffffff}));bg.position.set(-3.3-(.55*a)/2,3.35,-RD/2+.015);m.position.copy(bg.position).setZ(-RD/2+.02);S0.add(bg,m);});}
}

/* ===================== toast (follows the head, lazily) ===================== */
function buildToast(){const p=app.toastP=new VRP.Panel(.74,.12,{ppm:1000,css:`.root{display:flex;align-items:center;justify-content:center;background:rgba(11,114,217,.95);border-radius:30px;border:3px solid #93c5fd;font-size:40px;font-weight:700;color:#fff;padding:0 26px;text-align:center}`});
  p.mesh.material.depthTest=false;p.mesh.renderOrder=20;p.mesh.visible=false;app.scene.add(p.mesh);app.toastUntil=0;}
app.toast=function(text,ms=4200){const t=String(text);app.toastP.set(VRP.bidi(t.length>110?t.slice(0,108)+'…':t));app.toastUntil=performance.now()+ms;app.toastP.mesh.visible=true;app.toastNew=true;};
function updateToast(now){const m=app.toastP.mesh;if(!m.visible)return;const cam=app.camera;const hp=V().setFromMatrixPosition(cam.matrixWorld);const fw=V(0,0,-1).applyQuaternion(cam.getWorldQuaternion(tmpQ));fw.y=0;if(fw.lengthSq()<1e-4)fw.set(0,0,-1);fw.normalize();
  const target=hp.clone().addScaledVector(fw,.85);target.y=hp.y-.30;if(app.toastNew){m.position.copy(target);app.toastNew=false;}else m.position.lerp(target,.06);m.lookAt(hp.x,m.position.y+.05,hp.z);
  const left=app.toastUntil-now;m.material.opacity=clamp(left/500,0,1);if(left<=0)m.visible=false;}

/* ===================== welcome / help panel ===================== */
function buildWelcome(cfg){const g=app.welcome=new T.Group();app.scene.add(g);
  const p=new VRP.Panel(1.25,.92,{ppm:900,css:`.root{background:linear-gradient(180deg,#0f1f38,#0a1424);border:4px solid #2b5a99;border-radius:34px;padding:40px 46px}h1{font-size:54px;color:#fff;margin-bottom:14px}
    .r{display:flex;gap:18px;align-items:flex-start;margin:14px 0;font-size:34px}.i{font-size:46px;width:62px;text-align:center}.r b{color:#93c5fd}`});
  p.set(`<h1>ברוכים הבאים למעבדה</h1>
   <div class="r"><span class="i">👆</span><div><b>גע ברכיב</b> באצבע המורה – תופיע הודעה מה הוא ומה הוא עושה עכשיו.</div></div>
   <div class="r"><span class="i">🔘</span><div><b>לחיצה על כפתור</b> – דחוף אותו עם האצבע, כמו כפתור אמיתי.</div></div>
   <div class="r"><span class="i">🤏</span><div><b>צביטה</b> (אגודל + אצבע) ליד ידית, מחוון או כפתור סיבובי – תופסת אותם. הזז או סובב את היד ושחרר.</div></div>
   <div class="r"><span class="i">🧭</span><div><b>מעבר במעבדה</b> – הלך ברגל, או הצבע על הרצפה וצבוט כדי לקפוץ לשם.</div></div>
   <div class="r"><span class="i">✋</span><div><b>תפריט</b> – הפוך את כף היד השמאלית כלפיך: מעבר בין עמדות, חזרה לכאן ועוד.</div></div>`);
  g.add(p.mesh);const b=new VRP.Button3D({r:.04,col:0x22c55e,label:'✓',name:'welcome-ok',onPress:()=>{g.visible=false;app.toast('בהצלחה! גשו לעמדה שמולכם',3000);}});b.obj.position.set(0,-.56,.01);g.add(b.obj);app.welcomeBtn=b;
  const bl=VRP.textPlane('הבנתי – מתחילים',.6,.07,{font:'700 54px Heebo, Arial'});bl.position.set(0,-.65,.01);g.add(bl);
  placeWelcome();}
function placeWelcome(){const s=app.spawn;const g=app.welcome;const fw=V(-Math.sin(s.yaw),0,-Math.cos(s.yaw));const rt=V(Math.cos(s.yaw),0,-Math.sin(s.yaw));
  g.position.set(s.x,1.5,s.z).addScaledVector(fw,1.45).addScaledVector(rt,-.15);g.lookAt(s.x,1.5,s.z);g.visible=true;}
app.showHelp=()=>{placeWelcome();};

/* ===================== kiosk at the entrance: go to a station ===================== */
function buildKiosk(cfg){const s=app.spawn;const g=new T.Group();app.scene.add(g);const fw=V(-Math.sin(s.yaw),0,-Math.cos(s.yaw)),rt=V(Math.cos(s.yaw),0,-Math.sin(s.yaw));
  g.position.set(s.x,0,s.z).addScaledVector(fw,.55).addScaledVector(rt,1.05);g.lookAt(s.x,0,s.z);app.kioskBtns=[];
  const post=new T.Mesh(new T.BoxGeometry(.08,1.05,.08),new T.MeshStandardMaterial({color:0x2a3442,metalness:.6,roughness:.4}));post.position.y=.52;g.add(post);
  const head=new T.Group();head.position.set(0,1.12,0);head.rotation.x=-.55;g.add(head);
  const n=app.stations.length;const H=.16+.075*(n+1);const plate=new T.Mesh(new T.BoxGeometry(.5,H,.03),new T.MeshStandardMaterial({color:0x1f2937,metalness:.5,roughness:.45}));plate.position.y=H/2;head.add(plate);
  const t=VRP.textPlane('מעבר לעמדה',.4,.06,{font:'800 52px Heebo, Arial'});t.position.set(0,H-.05,.017);head.add(t);
  [...app.stations.map((st,i)=>[`פרק ${st.lab.ch} · ${st.lab.title}`,()=>app.goStation(i)]),['עזרה – איך משתמשים',()=>app.showHelp()]].forEach(([lab,fn],i)=>{const y=H-.12-i*.075;
    const b=new VRP.Button3D({r:.02,col:i<n?0x0ea5e9:0x64748b,name:'kiosk'+i,onPress:fn});b.obj.position.set(.19,y,.015);head.add(b.obj);app.kioskBtns.push(b);
    const tp=VRP.textPlane(lab,.36,.05,{font:'600 40px Heebo, Arial',align:'right',w:900,h:125});tp.position.set(-.03,y,.017);head.add(tp);});}

/* ===================== teleport ===================== */
app.headBase=V();app.headYawBase=0;app.worldYaw=0;
app.teleport=function(x,z,yaw=null){const r=app.renderer;
  if(r.xr.isPresenting&&app.baseRef){if(yaw!=null)app.worldYaw=yaw-app.headYawBase;const th=app.worldYaw;
    const qi=new T.Quaternion().setFromAxisAngle(V(0,1,0),-th);const pr=V(x,0,z).applyQuaternion(qi);const hb=V(app.headBase.x,0,app.headBase.z);const p=hb.sub(pr);
    const tr=new XRRigidTransform({x:p.x,y:0,z:p.z,w:1},{x:qi.x,y:qi.y,z:qi.z,w:qi.w});r.xr.setReferenceSpace(app.baseRef.getOffsetReferenceSpace(tr));app._tp={x,z,th,hb:V(app.headBase.x,0,app.headBase.z)};}
  else{app.desk.x=x;app.desk.z=z;if(yaw!=null)app.desk.yaw=yaw;}};
/* room ↔ tracking-space coordinates (used by the automated tests) */
app.worldToBase=function(w){const t=app._tp;if(!t)return w.clone();return w.clone().sub(V(t.x,0,t.z)).applyAxisAngle(V(0,1,0),-t.th).add(t.hb);};
app.goStation=function(i){const st=app.stations[i];if(!st)return;const g=st.group;const yaw=g.rotation.y;const p=V(0,0,1.05).applyAxisAngle(V(0,1,0),yaw).add(g.position);
  app.later(()=>{app.teleport(p.x,p.z,yaw);app.toast(`📍 פרק ${st.lab.ch} · ${st.sim.t}`,3000);});};

/* ===================== XR session + inputs ===================== */
function setupXR(){const r=app.renderer,S=app.scene;
  const hf=new AD.XRHandModelFactory();hf.setPath(app.cfg.handsPath||'assets/hands/');
  let cf=null;try{cf=new AD.XRControllerModelFactory();cf.path=(app.cfg.profilesPath||'assets/profiles');}catch(e){}
  for(let i=0;i<2;i++){const ctl=r.xr.getController(i),grip=r.xr.getControllerGrip(i),hand=r.xr.getHand(i);S.add(ctl,grip,hand);
    if(cf)try{grip.add(cf.createControllerModel(grip));}catch(e){}
    try{hand.add(hf.createHandModel(hand,'mesh'));}catch(e){}
    const P={i,ctl,grip,hand,connected:false,isHand:false,handed:'',tip:V(),pinchPt:V(),prevTip:V(),q:new T.Quaternion(),pinch:false,was:false,sel:false,sq:false,pk:{},grab:null,
      ray:new T.Ray(),line:null,cursor:null,tp:null,src:null};
    ctl.addEventListener('connected',e=>{P.connected=true;P.src=e.data;P.isHand=!!e.data.hand;P.handed=e.data.handedness||'';});
    ctl.addEventListener('disconnected',()=>{P.connected=false;P.src=null;endGrab(P);});
    ctl.addEventListener('selectstart',()=>{P.sel=true;});ctl.addEventListener('selectend',()=>{P.sel=false;});
    ctl.addEventListener('squeezestart',()=>{P.sq=true;});ctl.addEventListener('squeezeend',()=>{P.sq=false;});
    /* ray line + cursor */
    const lg=new T.BufferGeometry().setFromPoints([V(),V(0,0,-1)]);P.line=new T.Line(lg,new T.LineBasicMaterial({color:0x93c5fd,transparent:true,opacity:.75}));P.line.visible=false;S.add(P.line);
    P.cursor=new T.Mesh(new T.SphereGeometry(.008,12,8),new T.MeshBasicMaterial({color:0xffffff}));P.cursor.visible=false;S.add(P.cursor);
    app.ptrs.push(P);}
  /* teleport marker */
  const tm=app.tpMark=new T.Group();const ring=new T.Mesh(new T.RingGeometry(.18,.24,40),new T.MeshBasicMaterial({color:0x38bdf8,side:T.DoubleSide,transparent:true,opacity:.85}));ring.rotation.x=-Math.PI/2;tm.add(ring);
  const dot=new T.Mesh(new T.CircleGeometry(.05,24),new T.MeshBasicMaterial({color:0x38bdf8}));dot.rotation.x=-Math.PI/2;dot.position.y=.002;tm.add(dot);tm.visible=false;app.scene.add(tm);
  r.xr.addEventListener('sessionstart',()=>{app.baseRef=r.xr.getReferenceSpace();app.worldYaw=0;app.headBase.set(0,0,0);app.headYawBase=0;app._needSpawn=2;document.body.classList.add('xr');});
  r.xr.addEventListener('sessionend',()=>{app.baseRef=null;document.body.classList.remove('xr');app.ptrs.forEach(P=>{P.connected=false;endGrab(P);});});
  /* "enter VR" button */
  const btn=document.getElementById('enterVR');
  if(navigator.xr&&navigator.xr.isSessionSupported){navigator.xr.isSessionSupported('immersive-vr').then(ok=>{if(!ok){btn.textContent='VR לא זמין בדפדפן הזה – אפשר להסתובב עם העכבר';btn.disabled=true;return;}
    btn.disabled=false;btn.onclick=async()=>{if(r.xr.isPresenting){r.xr.getSession().end();return;}
      try{const s=await navigator.xr.requestSession('immersive-vr',{optionalFeatures:['local-floor','bounded-floor','hand-tracking']});await r.xr.setSession(s);btn.textContent='יציאה מ-VR';s.addEventListener('end',()=>{btn.textContent='כניסה ל-VR 🥽';});}
      catch(e){console.error(e);btn.textContent='לא הצלחנו להיכנס ל-VR: '+(e.message||e);}};}).catch(()=>{btn.disabled=true;});}
  else{btn.textContent='VR לא זמין בדפדפן הזה (צריך כתובת https במשקפיים) – אפשר להסתובב עם העכבר';btn.disabled=true;}}

/* hand / controller state for this frame */
const J=['index-finger-tip','thumb-tip','wrist'];
function readPointer(P,frame){P.ok=false;if(!P.connected)return;
  if(P.isHand){const jt=P.hand.joints;if(!jt||!jt['index-finger-tip']||!jt['thumb-tip']||!jt['wrist']||!jt['index-finger-tip'].visible)return;
    jt['index-finger-tip'].getWorldPosition(P.tip);const th=jt['thumb-tip'].getWorldPosition(tmpV);P.pinchPt.copy(P.tip).add(th).multiplyScalar(.5);
    const d=P.tip.distanceTo(th);P.pinchD=d;P.pinch=P.pinch?d<.042:d<.022;jt['wrist'].getWorldQuaternion(P.q);P.wristPos=(P.wristPos||V()).setFromMatrixPosition(jt['wrist'].matrixWorld);
    P.tipR=jt['index-finger-tip'].jointRadius||.008;}
  else{if(!P.grip.visible&&!P.ctl.visible)return;P.grip.getWorldPosition(tmpV);P.grip.getWorldQuaternion(P.q);P.tip.copy(V(0,-.02,-.06).applyQuaternion(P.q).add(tmpV));P.pinchPt.copy(P.tip);P.pinch=P.sel||P.sq;P.tipR=.01;}
  P.ctl.updateMatrixWorld(true);P.ray.origin.setFromMatrixPosition(P.ctl.matrixWorld);P.ray.direction.set(0,0,-1).transformDirection(P.ctl.matrixWorld);P.ok=true;}

/* ===================== interaction ===================== */
function visibleChain(o){while(o){if(!o.visible)return false;o=o.parent;}return true;}
function interLocal(I,wp){I.obj.updateMatrixWorld();return I.obj.worldToLocal(wp.clone()).sub(V(I.cx||0,I.cy||0,I.cz||0));}
function distToBox(I,wp){const l=interLocal(I,wp);const c=V(clamp(l.x,-I.hx,I.hx),clamp(l.y,-I.hy,I.hy),clamp(l.z,-I.hz,I.hz));const w=I.obj.localToWorld(c.add(V(I.cx||0,I.cy||0,I.cz||0)));return w.distanceTo(wp);}
function rayBox(I,ray){I.obj.updateMatrixWorld();const inv=tmpM.copy(I.obj.matrixWorld).invert();const lr=ray.clone().applyMatrix4(inv);const c=V(I.cx||0,I.cy||0,I.cz||0);
  const b=new T.Box3(V(c.x-I.hx,c.y-I.hy,c.z-I.hz),V(c.x+I.hx,c.y+I.hy,c.z+I.hz));const hit=lr.intersectBox(b,V());if(!hit)return null;const w=I.obj.localToWorld(hit);return {d:w.distanceTo(ray.origin),point:w};}
function compAt(wp,infl=.012){for(const st of app.stations){if(!st.compBoxes)continue;for(const id in st.compBoxes){const b=st.compBoxes[id];if(wp.x>b.min.x-infl&&wp.x<b.max.x+infl&&wp.y>b.min.y-infl&&wp.y<b.max.y+infl&&wp.z>b.min.z-infl&&wp.z<b.max.z+infl)return {st,id};}}return null;}
function rayHit(ray,P){let best=null;const take=(h)=>{if(h&&(!best||h.d<best.d))best=h;};
  for(const I of VRP.inter){if(!visibleChain(I.obj))continue;const h=rayBox(I,ray);if(h)take({d:h.d,point:h.point,I});}
  for(const st of app.stations){if(!st.compBoxes)continue;for(const id in st.compBoxes){const p=ray.intersectBox(st.compBoxes[id],V());if(p)take({d:p.distanceTo(ray.origin),point:p,comp:{st,id}});}}
  /* floor (inside the room) */
  if(ray.direction.y<-.05){const t=-ray.origin.y/ray.direction.y;if(t>0&&t<12){const p=ray.origin.clone().addScaledVector(ray.direction,t);const R=app.room;if(Math.abs(p.x)<R.w/2-.4&&Math.abs(p.z)<R.d/2-.4)take({d:t,point:p,floor:true});}}
  /* panels block the ray */
  return best;}
function beginGrab(P,I,mode,point){P.grab=I;P.grabMode=mode;P.q0=P.q.clone();P.qPrev=P.q.clone();P.twist=0;try{I.begin&&I.begin({point})}catch(e){console.warn(e);}haptic(P,.4,25);}
function endGrab(P){if(!P.grab)return;const I=P.grab;P.grab=null;try{I.end&&I.end();}catch(e){console.warn(e);}}
function haptic(P,v,ms){try{const h=P.src&&P.src.gamepad&&P.src.gamepad.hapticActuators;if(h&&h[0])h[0].pulse(v,ms);}catch(e){}}
function twistDelta(P,axis){/* rotation of the hand around the axis since last frame (swing–twist) */const dq=P.q.clone().multiply(P.qPrev.clone().invert());const v=V(dq.x,dq.y,dq.z);let a=2*Math.atan2(v.dot(axis),dq.w);if(a>Math.PI)a-=2*Math.PI;if(a<-Math.PI)a+=2*Math.PI;P.qPrev.copy(P.q);return a;}

function interactPointer(P,dt){const started=P.pinch&&!P.was,ended=!P.pinch&&P.was;P.was=P.pinch;
  P.line.visible=false;P.cursor.visible=false;
  /* 1 · holding something */
  if(P.grab){const I=P.grab;if(!P.pinch||!visibleChain(I.obj)){endGrab(P);return;}
    let point=null,twist=null;
    if(P.grabMode==='near'){point=P.pinchPt.clone();if(I.twistAxis){P.twist+=twistDelta(P,I.twistAxis());twist=-P.twist;}}
    else{const pl=I.rayPlane?I.rayPlane():null;if(pl){const p=P.ray.intersectPlane(pl,V());if(p)point=p;}showRay(P,point?point.distanceTo(P.ray.origin):1);}
    if(point||twist!=null)try{I.drag({point:point||P.pinchPt.clone(),twist});}catch(e){console.warn(e);}return;}
  /* 2 · fingertip pokes buttons (near) */
  let nearSomething=false;
  for(const I of VRP.inter){if(I.kind!=='press'||!visibleChain(I.obj))continue;const l=interLocal(I,P.tip);const k=I.name+'#'+(I.obj.id);
    const inFoot=Math.abs(l.x)<I.hx&&Math.abs(l.y)<I.hy;const z=l.z-(P.tipR||.008);
    if(inFoot&&l.z<.12&&l.z>-.05)nearSomething=true;
    let s=P.pk[k]||0;/* 0 away · 1 armed (in front) · 2 pressed */
    if(!inFoot||l.z>.07||l.z<-.06){s=0;}else if(s===0&&z>.016)s=1;else if(s===1&&z<.010){s=2;try{I.press(P);}catch(e){console.warn(e);}haptic(P,.6,30);}else if(s===2&&z>.02)s=1;
    P.pk[k]=s;}
  /* 3 · fingertip touches a component → what is it */
  if(P.isHand||true){const c=compAt(P.tip);if(c){nearSomething=true;c.st.touch(c.id);}}
  /* 4 · pinch: near grab, else far (ray) */
  let nearGrab=null,nd=1e9;for(const I of VRP.inter){if(I.kind!=='grab'||!visibleChain(I.obj))continue;const d=distToBox(I,P.pinchPt);if(d<.045&&d<nd){nd=d;nearGrab=I;}if(d<.15)nearSomething=true;}
  if(started&&nearGrab){beginGrab(P,nearGrab,'near',P.pinchPt.clone());return;}
  /* far pointing: only when the hand is not busy near something */
  const pointing=!nearSomething&&(!P.isHand||handPointsAway(P));
  if(!pointing){if(P.tp){P.tp=null;app.tpMark.visible=false;}return;}
  const h=rayHit(P.ray,P);showRay(P,h?h.d:1.6,h);
  if(P.tp){if(h&&h.floor){app.tpMark.position.copy(h.point);app.tpMark.visible=true;P.tp=h.point.clone();}else{app.tpMark.visible=false;P.tp=null;}
    if(ended){app.tpMark.visible=false;if(P.tp)app.teleport(P.tp.x,P.tp.z);P.tp=null;}return;}
  if(started&&h){if(h.I&&h.I.kind==='press'){try{h.I.press(P);}catch(e){}haptic(P,.6,30);}
    else if(h.I&&h.I.kind==='grab'){beginGrab(P,h.I,'ray',h.point);}
    else if(h.comp){h.comp.st.touch(h.comp.id,'ray');}
    else if(h.floor){P.tp=h.point.clone();app.tpMark.position.copy(h.point);app.tpMark.visible=true;}}}
function handPointsAway(P){/* palm not facing the head, fingers forward */const palm=V(0,-1,0).applyQuaternion(P.q);const hp=V().setFromMatrixPosition(app.camera.matrixWorld);const toHead=hp.sub(P.wristPos||P.tip).normalize();return palm.dot(toHead)<.35;}
function showRay(P,len,h){P.line.visible=true;const o=P.ray.origin,d=P.ray.direction;P.line.position.copy(o);P.line.quaternion.setFromUnitVectors(V(0,0,-1),d);P.line.scale.set(1,1,len);
  P.line.material.color.setHex(h&&(h.I||h.comp)?0x86efac:h&&h.floor?0x38bdf8:0x93c5fd);if(h){P.cursor.visible=true;P.cursor.position.copy(h.point);}}

/* ===================== wrist menu (left palm facing you) ===================== */
function buildWristMenu(cfg){const g=app.wrist=new T.Group();g.visible=false;app.scene.add(g);
  const items=[...app.stations.map((st,i)=>[`פרק ${st.lab.ch}`,0x0ea5e9,()=>app.goStation(i)]),['נקודת התחלה',0x64748b,()=>app.later(()=>{app.teleport(app.spawn.x,app.spawn.z,app.spawn.yaw);app.toast('🏠 חזרת לנקודת ההתחלה',2500);})],
    ['שסתומים שקופים',0xf59e0b,()=>{app.xray=!app.xray;app.stations.forEach(s=>VRP.setXray(s.board.comps,app.xray));app.toast(app.xray?'🔍 גוף השסתומים שקוף – רואים את החלקים הפנימיים':'גוף השסתומים אטום',3000);}],
    ['עזרה',0x8b5cf6,()=>app.showHelp()]];
  app.xray=true;const H=.035+items.length*.05;const bg=new T.Mesh(new T.BoxGeometry(.19,H,.01),new T.MeshStandardMaterial({color:0x111827,metalness:.4,roughness:.5,transparent:true,opacity:.92}));bg.position.y=H/2;g.add(bg);
  items.forEach(([lab,col,fn],i)=>{const y=H-.035-i*.05;const b=new VRP.Button3D({r:.014,col,name:'wrist'+i,onPress:fn,lit:()=>lab==='שסתומים שקופים'&&app.xray});b.obj.position.set(.07,y,.005);g.add(b.obj);app.wristBtns=(app.wristBtns||[]).concat(b);
    const tp=VRP.textPlane(lab,.13,.032,{font:'700 44px Heebo, Arial',align:'right',w:520,h:128});tp.position.set(-.02,y,.0065);g.add(tp);});}
function updateWrist(){const g=app.wrist;const L=app.ptrs.find(P=>P.ok&&P.isHand&&P.handed==='left');if(!L){g.visible=false;return;}
  const palm=V(0,-1,0).applyQuaternion(L.q);const hp=V().setFromMatrixPosition(app.camera.matrixWorld);const toHead=hp.clone().sub(L.wristPos).normalize();const show=palm.dot(toHead)>.6&&!L.grab;
  if(show&&!g.visible){g.visible=true;}else if(!show&&g.visible&&palm.dot(toHead)<.45)g.visible=false;
  if(g.visible){const thumbSide=V(L.handed==='left'?1:-1,0,0).applyQuaternion(L.q);g.position.copy(L.wristPos).addScaledVector(palm,.05).addScaledVector(thumbSide,.02);g.lookAt(hp);}
  (app.wristBtns||[]).forEach(b=>b.update(1/72));}

/* ===================== desktop (mouse + keyboard) ===================== */
function setupDesktop(){const el=app.renderer.domElement;const M=app.mouse={x:0,y:0,down:false,look:false,P:null};const keys=app.keys={};
  const P=M.P={isHand:false,mouse:true,ok:true,tip:V(1e6,1e6,1e6),pinchPt:V(),q:new T.Quaternion(),pinch:false,was:false,pk:{},grab:null,ray:new T.Ray(),line:new T.Line(),cursor:new T.Mesh(),src:null,tp:null};
  P.line.visible=false;P.cursor.visible=false;
  const rc=new T.Raycaster();const upd=e=>{const b=el.getBoundingClientRect();M.x=(e.clientX-b.left)/b.width*2-1;M.y=-(e.clientY-b.top)/b.height*2+1;rc.setFromCamera({x:M.x,y:M.y},app.camera);P.ray.copy(rc.ray);};
  el.addEventListener('contextmenu',e=>e.preventDefault());
  el.addEventListener('pointerdown',e=>{upd(e);el.setPointerCapture(e.pointerId);M.sx=e.clientX;M.sy=e.clientY;M.moved=false;
    if(e.button===2){M.look=true;return;}const h=rayHit(P.ray,P);M.h=h;
    if(h&&h.I){P.pinch=true;}else{M.look=true;M.floorH=h&&h.floor?h:null;}});
  el.addEventListener('pointermove',e=>{const dx=e.movementX||0,dy=e.movementY||0;upd(e);if(Math.hypot(e.clientX-(M.sx||0),e.clientY-(M.sy||0))>4)M.moved=true;
    if(M.look){app.desk.yaw-=dx*.004;app.desk.pitch=clamp(app.desk.pitch-dy*.004,-1.2,1.2);}});
  el.addEventListener('pointerup',e=>{upd(e);if(M.look){M.look=false;if(!M.moved){const h=rayHit(P.ray,P);if(h&&h.comp)h.comp.st.touch(h.comp.id,'ray');else if(h&&h.floor){app.desk.x=h.point.x;app.desk.z=h.point.z;}}}P.pinch=false;});
  el.addEventListener('wheel',e=>{e.preventDefault();const f=V(-Math.sin(app.desk.yaw),0,-Math.cos(app.desk.yaw));const s=-Math.sign(e.deltaY)*.25;app.desk.x+=f.x*s;app.desk.z+=f.z*s;},{passive:false});
  addEventListener('keydown',e=>{keys[e.code]=true;});addEventListener('keyup',e=>{keys[e.code]=false;});}
function desktopFrame(dt){const d=app.desk,k=app.keys;const f=V(-Math.sin(d.yaw),0,-Math.cos(d.yaw)),r=V(Math.cos(d.yaw),0,-Math.sin(d.yaw));const sp=2.2*dt;
  if(k.KeyW||k.ArrowUp){d.x+=f.x*sp;d.z+=f.z*sp;}if(k.KeyS||k.ArrowDown){d.x-=f.x*sp;d.z-=f.z*sp;}if(k.KeyA){d.x-=r.x*sp;d.z-=r.z*sp;}if(k.KeyD){d.x+=r.x*sp;d.z+=r.z*sp;}
  if(k.ArrowLeft)d.yaw+=1.6*dt;if(k.ArrowRight)d.yaw-=1.6*dt;const R=app.room;d.x=clamp(d.x,-R.w/2+.4,R.w/2-.4);d.z=clamp(d.z,-R.d/2+.4,R.d/2-.4);
  const c=app.camera;c.position.set(d.x,1.62,d.z);c.rotation.set(d.pitch,d.yaw,0,'YXZ');c.updateMatrixWorld();
  /* mouse acts like a ray pointer with a "pinch" while the button is down on a control */
  const P=app.mouse.P;const started=P.pinch&&!P.was,ended=!P.pinch&&P.was;P.was=P.pinch;
  if(P.grab){if(!P.pinch){endGrab(P);}else{const I=P.grab;const pl=I.rayPlane?I.rayPlane():null;const p=pl?P.ray.intersectPlane(pl,V()):null;if(p)try{I.drag({point:p,twist:null});}catch(e){}}}
  else if(started){const h=app.mouse.h;if(h&&h.I){if(h.I.kind==='press'){h.I.press(P);P.pinch=false;}else beginGrab(P,h.I,'ray',h.point);}}
  const hv=rayHit(P.ray,P);app.renderer.domElement.style.cursor=P.grab?'grabbing':hv&&(hv.I)?'pointer':hv&&hv.comp?'help':'default';}

/* ===================== frame loop ===================== */
function loop(t,frame){const dt=app._dt!=null?app._dt:(Math.min(.05,app.clock.getDelta())||0);app._dt=null;const now=performance.now();const r=app.renderer;
  if(r.xr.isPresenting&&frame&&app.baseRef){const vp=frame.getViewerPose(app.baseRef);if(vp){const p=vp.transform.position,o=vp.transform.orientation;app.headBase.set(p.x,p.y,p.z);const fw=V(0,0,-1).applyQuaternion(new T.Quaternion(o.x,o.y,o.z,o.w));app.headYawBase=Math.atan2(-fw.x,-fw.z);}
    if(app._needSpawn){app._needSpawn--;if(app._needSpawn===0)app.teleport(app.spawn.x,app.spawn.z,app.spawn.yaw);}
    for(const P of app.ptrs){readPointer(P,frame);if(P.ok)interactPointer(P,dt);else{P.line.visible=false;P.cursor.visible=false;}}
    if(!app.ptrs.some(P=>P.tp))app.tpMark.visible=false;updateWrist();}
  else desktopFrame(dt);
  for(const st of app.stations){try{st.update(dt,now);}catch(e){console.warn('station',e);}}
  if(app.welcome.visible)app.welcomeBtn.update(dt);(app.kioskBtns||[]).forEach(b=>b.update(dt));
  updateToast(now);
  while(app.queue.length){const fn=app.queue.shift();try{fn();}catch(e){console.error(e);}}
  r.render(app.scene,app.camera);}
})();
