const L=require('./_lib');const path=require('path');
// Hand-tracking test of the APEX VR lab in Meta's Quest 3 emulator (IWER)
const {chromium}=require('playwright');const fs=require('fs');
const IWER=fs.readFileSync(path.join(L.VENDOR,'iwer.min.js'),'utf8');
(async()=>{await L.serve(L.DIST_VR,8765);const b=await chromium.launch();const p=await b.newPage({viewport:{width:1000,height:640}});const errs=[];
p.on('requestfailed',r=>{if(!/fonts/.test(r.url()))errs.push('REQFAIL '+r.url().slice(0,150));});p.on('pageerror',e=>errs.push('PAGEERR '+e.message+' | '+(e.stack||'').split('\n').slice(1,3).join(' ')));
p.on('console',m=>{const t=m.text();if(m.type()==='error'&&!/ERR_FAILED|fonts/.test(t))errs.push('console: '+t.slice(0,240));});
await p.route(/fonts\.(googleapis|gstatic)\.com/,r=>r.abort());
await p.addInitScript(IWER);
await p.addInitScript(()=>{const d=new IWER.XRDevice(IWER.metaQuest3);d.installRuntime({forceInstall:true});d.primaryInputMode='hand';window.__xr=d;});
await p.goto('http://localhost:8765/index.html',{waitUntil:'domcontentloaded'});
await p.waitForFunction(()=>document.body.classList.contains('ready'),null,{timeout:60000});
await p.waitForFunction(()=>!document.getElementById('enterVR').disabled,null,{timeout:20000});
await p.click('#enterVR');
await p.waitForFunction(()=>VRP.app.renderer.xr.isPresenting,null,{timeout:20000});
const R={};const ok=(k,v)=>{R[k]=v;console.log(k.padEnd(28),v);};
const wait=(ms)=>p.waitForTimeout(ms);
await p.waitForFunction(()=>VRP.app._tp,null,{timeout:20000});ok('entered VR + spawned',true);
/* helpers in the page */
await p.evaluate(()=>{const A=VRP.app;window.XT={
  base:(v)=>{const b=A.worldToBase(v);return [b.x,b.y,b.z];},
  pin:(hand,anchor,w,rot)=>{const h=__xr.hands[hand];const o={anchor,target:XT.base(w)};if(rot)o.wristRotation=rot;h.setPin(o);},
  dir:(fingers,palm,hand='right')=>{const F=new THREE.Vector3(...fingers).normalize();let Pm=new THREE.Vector3(...palm);Pm.addScaledVector(F,-Pm.dot(F)).normalize();const Z=F.clone().negate(),Y=Pm.clone().negate(),X=new THREE.Vector3().crossVectors(Y,Z);const m=new THREE.Matrix4().makeBasis(X,Y,Z);const q=new THREE.Quaternion().setFromRotationMatrix(m);return [q.x,q.y,q.z,q.w];},
  st:()=>A.stations[0],
  wp:(o,x=0,y=0,z=0)=>{o.updateMatrixWorld(true);return o.localToWorld(new THREE.Vector3(x,y,z));},
  /* base-space direction from a world direction */
  bdir:(d)=>{const t=A._tp;const v=d.clone().applyAxisAngle(new THREE.Vector3(0,1,0),-t.th);return [v.x,v.y,v.z];},
};});
/* go to the station */
await p.evaluate(()=>{VRP.app.welcome.visible=false;VRP.app.goStation(0);});await wait(1500);
ok('at station (cam z≈-2.35)',await p.evaluate(()=>{const c=new THREE.Vector3().setFromMatrixPosition(VRP.app.renderer.xr.getCamera().matrixWorld);return [+c.x.toFixed(2),+c.y.toFixed(2),+c.z.toFixed(2)].join(',');}));
await p.evaluate(()=>{__xr.hands.left.setPin({anchor:'wrist',target:[-.4,.6,0]});});

/* 1 · poke the green START button on the pump box */
await p.evaluate(()=>{const s=XT.st();s.P.on=false;__xr.hands.right.poseId='point';});
const pokeSeq=async(objExpr,label)=>{for(let k=0;k<=12;k++){await p.evaluate(([e,k])=>{const o=eval(e);const n=new THREE.Vector3(0,0,1).transformDirection(o.matrixWorld);const w=XT.wp(o,0,0,.026).addScaledVector(n,.05-k*.006);
    const into=n.clone().negate();XT.pin('right','index-tip',w,XT.dir(XT.bdir(into),XT.bdir(new THREE.Vector3(0,-1,0))));},[objExpr,k]);await wait(110);}
  for(let k=0;k<5;k++){await p.evaluate(([e])=>{const o=eval(e);const n=new THREE.Vector3(0,0,1).transformDirection(o.matrixWorld);XT.pin('right','index-tip',XT.wp(o,0,0,.026).addScaledVector(n,.08),XT.dir(XT.bdir(n.clone().negate()),XT.bdir(new THREE.Vector3(0,-1,0))));},[objExpr]);await wait(110);}};
await pokeSeq('XT.st().bctrls[0].obj','start');
ok('poke START → motor on',await p.evaluate(()=>XT.st().P.on===true));
ok('  message',await p.evaluate(()=>XT.st().lastAct&&XT.st().lastAct.t));

/* 2 · touch the cylinder with the fingertip → component info */
await p.evaluate(()=>{const s=XT.st();const b=s.compBoxes['C1'];const c=b.getCenter(new THREE.Vector3());c.z=b.max.z+.03;XT.pin('right','index-tip',c,XT.dir(XT.bdir(new THREE.Vector3(0,0,-1)),XT.bdir(new THREE.Vector3(0,-1,0))));});await wait(400);
await p.evaluate(()=>{const s=XT.st();const b=s.compBoxes['C1'];const c=b.getCenter(new THREE.Vector3());c.z=b.max.z-.005;XT.pin('right','index-tip',c,XT.dir(XT.bdir(new THREE.Vector3(0,0,-1)),XT.bdir(new THREE.Vector3(0,-1,0))));});await wait(700);
ok('touch cylinder → info',await p.evaluate(()=>XT.st().touched&&XT.st().touched.id));
/* pull the hand back */
await p.evaluate(()=>{const s=XT.st();XT.pin('right','index-tip',XT.wp(s.group,.3,1.2,.7));});await wait(500);

/* 3 · pinch the valve lever and push it to position b (lowering) */
await p.evaluate(()=>{const s=XT.st();s.P.pos='0';s.P.auto=false;__xr.hands.right.poseId='default';__xr.hands.right.setPinchValueImmediate(0);});
const lev=async(ang,pinch)=>{await p.evaluate(([ang,pinch])=>{const s=XT.st();const piv=s.lever.piv;const w=XT.wp(piv,-30*Math.sin(ang),30*Math.cos(ang),0);XT.pin('right','grasp',w,XT.dir(XT.bdir(new THREE.Vector3(0,0,-1)),XT.bdir(new THREE.Vector3(-1,0,0))));if(pinch!=null)__xr.hands.right.setPinchValueImmediate(pinch);},[ang,pinch]);await wait(130);};
await lev(0,0);await lev(0,0);await lev(0,1);await wait(200);
ok('  lever grabbed',await p.evaluate(()=>!!VRP.app.ptrs.find(P=>P.grab&&/lever/.test(P.grab.name))));
for(let a=0;a>=-0.5;a-=0.07)await lev(a,null);
ok('lever → b',await p.evaluate(()=>XT.st().P.pos));
for(let a=-0.5;a<=0.5;a+=0.07)await lev(a,null);
ok('lever → a',await p.evaluate(()=>XT.st().P.pos));
ok('  message',await p.evaluate(()=>XT.st().lastAct.t));
await lev(.5,0);await wait(300);
ok('  released',await p.evaluate(()=>!VRP.app.ptrs.some(P=>P.grab)));

/* 4 · twist the relief valve knob (pinch + rotate wrist clockwise) */
const pr0=await p.evaluate(()=>XT.st().P.pr);
const knob=async(deg,pinch)=>{await p.evaluate(([deg,pinch])=>{const s=XT.st();const I=VRP.inter.find(i=>i.name==='knob-RV');const ax=I.twistAxis();const w=XT.wp(I.obj,0,0,6);
    const up=new THREE.Vector3(0,1,0);const fingers=ax.clone().negate();const palm=up.clone().applyAxisAngle(ax,-deg*Math.PI/180);
    XT.pin('right','grasp',w,XT.dir(XT.bdir(fingers),XT.bdir(palm.sub(ax.clone().multiplyScalar(palm.dot(ax))).normalize())));if(pinch!=null)__xr.hands.right.setPinchValueImmediate(pinch);},[deg,pinch]);await wait(130);};
await knob(0,0);await knob(0,0);await knob(0,1);await wait(200);
ok('  knob grabbed',await p.evaluate(()=>!!VRP.app.ptrs.find(P=>P.grab&&/knob/.test(P.grab.name))));
for(let d=0;d<=120;d+=12)await knob(d,null);
const pr1=await p.evaluate(()=>XT.st().P.pr);ok('twist knob → relief setting',`${pr0} → ${pr1} bar`);
await knob(120,0);await wait(300);

/* 5 · desk slider: pinch the "load mass" thumb and slide it */
const m0=await p.evaluate(()=>XT.st().P.m);
const sl=async(t,pinch)=>{await p.evaluate(([t,pinch])=>{const I=VRP.inter.find(i=>i.name==='num-m');const th=I.obj;const tr=th.parent;const w=XT.wp(tr,th.position.x*(1-t)+(-.135)*t,0,.012);const n=new THREE.Vector3(0,0,1).transformDirection(tr.matrixWorld);
    XT.pin('right','grasp',w.addScaledVector(n,.005),XT.dir(XT.bdir(n.clone().negate()),XT.bdir(new THREE.Vector3(0,0,-1))));if(pinch!=null)__xr.hands.right.setPinchValueImmediate(pinch);},[t,pinch]);await wait(130);};
await p.evaluate(()=>{__xr.hands.right.poseId='default';__xr.hands.right.setPinchValueImmediate(0);});await wait(200);
await sl(0,0);await sl(0,0);await sl(0,1);await wait(150);
ok('  slider grabbed',await p.evaluate(()=>!!VRP.app.ptrs.find(P=>P.grab&&/num-m/.test(P.grab.name))));
for(let t=0;t<=1;t+=.2)await sl(t,null);
const m1=await p.evaluate(()=>XT.st().P.m);ok('slide load mass',`${m0} → ${m1} kg`);
await sl(1,0);await wait(1300);
ok('  message',await p.evaluate(()=>XT.st().lastAct.t));

/* 6 · wrist menu: left palm toward the face, poke "start point" with the right index */
await p.evaluate(()=>{__xr.hands.right.setPinchValueImmediate(0);__xr.hands.right.poseId='point';});
await p.evaluate(()=>{const cam=VRP.app.renderer.xr.getCamera();const hp=new THREE.Vector3().setFromMatrixPosition(cam.matrixWorld);const fw=new THREE.Vector3(0,0,-1).applyQuaternion(cam.getWorldQuaternion(new THREE.Quaternion()));fw.y=0;fw.normalize();
  const w=hp.clone().addScaledVector(fw,.32);w.y=hp.y-.22;const toHead=hp.clone().sub(w).normalize();__xr.hands.left.poseId='flat';
  XT.pin('left','wrist',w,XT.dir(XT.bdir(new THREE.Vector3(0,1,0).addScaledVector(fw,.2).normalize()),XT.bdir(toHead.clone()),'left'));});
await wait(700);
ok('wrist menu visible',await p.evaluate(()=>VRP.app.wrist.visible));
const homeIdx=0;
const wb=`VRP.app.wristBtns[${homeIdx}].obj`;
await pokeSeq(wb,'home');await wait(600);
ok('wrist "start point" → teleport',await p.evaluate(()=>{const c=new THREE.Vector3().setFromMatrixPosition(VRP.app.renderer.xr.getCamera().matrixWorld);return [+c.x.toFixed(2),+c.z.toFixed(2)].join(',');}));

/* 7 · point at the floor and pinch → teleport there */
await p.evaluate(()=>{__xr.hands.left.setPin({anchor:'wrist',target:[-.4,.5,.1]});__xr.hands.right.poseId='default';__xr.hands.right.setPinchValueImmediate(0);});
const aim=async(pinch)=>{await p.evaluate(([pinch])=>{const cam=VRP.app.renderer.xr.getCamera();const hp=new THREE.Vector3().setFromMatrixPosition(cam.matrixWorld);const w=hp.clone().add(new THREE.Vector3(.18,-.35,-.25));
  const tgt=hp.clone().add(new THREE.Vector3(1.2,-hp.y,-1.6));const f=tgt.clone().sub(w).normalize();XT.pin('right','wrist',w,XT.dir(XT.bdir(f),XT.bdir(new THREE.Vector3(0,-1,0).addScaledVector(f,-f.y).normalize())));if(pinch!=null)__xr.hands.right.setPinchValueImmediate(pinch);},[pinch]);await wait(150);};
await aim(0);await aim(0);await aim(0);
ok('  ray shown',await p.evaluate(()=>VRP.app.ptrs.some(P=>P.line.visible)));
await aim(1);await aim(1);ok('  floor marker',await p.evaluate(()=>VRP.app.tpMark.visible));
await aim(0);await wait(500);
ok('pinch on floor → teleport',await p.evaluate(()=>{const c=new THREE.Vector3().setFromMatrixPosition(VRP.app.renderer.xr.getCamera().matrixWorld);return [+c.x.toFixed(2),+c.z.toFixed(2)].join(',');}));

/* 8 · switch to simulation 2 (lockout) via the desk and back is covered by station API */
await p.evaluate(()=>{VRP.app.goStation(0);});await wait(800);
await p.evaluate(()=>{XT.st().setSim(1);});await wait(1500);
ok('sim 2 built (lockout)',await p.evaluate(()=>XT.st().sim.id+' binds:'+VRP.inter.filter(i=>/^(bind|lever|knob)/.test(i.name)).length));
await p.evaluate(()=>{__xr.hands.right.poseId='point';__xr.hands.right.setPinchValueImmediate(0);XT.st().P.lock=false;});
await pokeSeq('XT.st().bctrls[2].obj','lock');await wait(400);
ok('sim 2: poke padlock → locked',await p.evaluate(()=>XT.st().P.lock));
ok('  message',await p.evaluate(()=>XT.st().lastAct.t));
await pokeSeq('XT.st().bctrls[0].obj','start');await wait(600);
ok('  start while locked → motor stays off',await p.evaluate(()=>XT.st().P.on===false));
const fps=await p.evaluate(()=>new Promise(res=>{let n=0;const s=VRP.app.renderer.xr.getSession();const t0=performance.now();const f=()=>{n++;if(performance.now()-t0<3000)s.requestAnimationFrame(f);else res((n/3).toFixed(1));};s.requestAnimationFrame(f);}));
ok('emulator fps (software GPU)',fps);
ok('draw calls per frame',await p.evaluate(()=>VRP.app.renderer.info.render.calls));
console.log('\nERRORS:',errs.length?'\n'+errs.slice(0,12).join('\n'):'none');
fs.writeFileSync(path.join(L.OUT,'xrtest.json'),JSON.stringify(R));await b.close();})();
