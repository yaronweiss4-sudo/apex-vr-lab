/* =====================================================================
   APEX VR LAB · board.js
   Builds a lab's trainer board for VR from the same component models the
   website uses (B3.*), then makes it light enough for a standalone headset:
   - physical (clear-coat) materials → standard materials
   - outline edges removed (except the see-through valve bodies)
   - every component's static parts merged into one mesh per material
     (moving parts found automatically by watching what the component's
     update function touches)
   - oil particles drawn as one instanced mesh per pipe
   ===================================================================== */
(()=>{
const VRP=window.VRP=window.VRP||{};
const T=window.THREE;const {mergeGeometries}=window.THREE_ADDONS;

/* ---------- material conversion (cached) ---------- */
const convCache=new Map();
function toStd(m){if(!m||!m.isMeshPhysicalMaterial)return m;if(convCache.has(m))return convCache.get(m);
  const n=new T.MeshStandardMaterial({color:m.color.clone(),metalness:m.metalness,roughness:Math.max(.18,m.roughness*.9),map:m.map,transparent:m.transparent,opacity:m.opacity,depthWrite:m.depthWrite,side:m.side,emissive:m.emissive.clone(),emissiveIntensity:m.emissiveIntensity});
  n.userData=Object.assign({},m.userData);convCache.set(m,n);return n;}
function convertTree(root){root.traverse(o=>{if(o.isMesh&&o.material){if(Array.isArray(o.material))o.material=o.material.map(toStd);else o.material=toStd(o.material);}});}
function dropEdges(root){const rm=[];root.traverse(o=>{if(o.isLineSegments&&!(o.parent&&o.parent.userData.shell))rm.push(o);});rm.forEach(o=>{o.parent.remove(o);o.geometry.dispose();});}

/* ---------- find the parts a component's update function moves ---------- */
const WATCH=['position','rotation','quaternion','scale','visible','material','geometry','matrix'];
function probeDynamic(group,upd,samples){
  const dyn=new Set();if(!upd)return dyn;const objs=[];group.traverse(o=>objs.push(o));
  const saved=[];let on=true;
  for(const o of objs)for(const k of WATCH){const d=Object.getOwnPropertyDescriptor(o,k);if(!d)continue;saved.push([o,k,d]);let v=o[k];
    Object.defineProperty(o,k,{configurable:true,enumerable:true,get(){if(on)dyn.add(o);return v;},set(n){if(on)dyn.add(o);v=n;}});}
  /* materials changed through closures (not through the mesh) */
  const mats=new Map();for(const o of objs){if(!o.isMesh)continue;const m=saved.find(s=>s[0]===o&&s[1]==='material');const mat=m?m[2].value:null;if(mat&&!Array.isArray(mat)){if(!mats.has(mat))mats.set(mat,[]);mats.get(mat).push(o);}}
  const snap=m=>[m.color&&m.color.getHex(),m.emissive&&m.emissive.getHex(),m.emissiveIntensity,m.opacity,m.visible,m.map&&m.map.version].join('|');
  const s0=new Map();mats.forEach((_,m)=>s0.set(m,snap(m)));
  for(const [cs,R] of samples){try{upd(cs,R);}catch(e){}mats.forEach((os,m)=>{if(snap(m)!==s0.get(m))os.forEach(o=>dyn.add(o));});}
  /* restore plain data properties with the final values */
  on=false;
  for(const [o,k,d] of saved){const cur=(()=>{const g=Object.getOwnPropertyDescriptor(o,k);return g.get?g.get.call(o):g.value;})();Object.defineProperty(o,k,{configurable:true,enumerable:d.enumerable,writable:d.writable!==false,value:cur});}
  dyn.forEach(o=>{if(!objs.includes(o))dyn.delete(o);});return dyn;}

/* ---------- merge static meshes of a component, one mesh per material ---------- */
function mergeStatic(group,dyn,keep=()=>false){
  group.updateMatrixWorld(true);const inv=new T.Matrix4().copy(group.matrixWorld).invert();
  /* an object is "frozen" if neither it nor any ancestor below the component root is dynamic */
  const frozen=o=>{let p=o;while(p&&p!==group){if(dyn.has(p))return false;p=p.parent;}return true;};
  const byMat=new Map();const victims=[];
  group.traverse(o=>{if(!o.isMesh||o.isInstancedMesh||o.isSkinnedMesh||Array.isArray(o.material))return;const m=o.material;
    if(!m||m.transparent||o.userData.shell||keep(o)||!frozen(o)||o.children.some(c=>!c.isMesh||dyn.has(c)))return;
    if(o.children.length)return;/* parents of other meshes stay (keeps hierarchies intact) */
    if(!byMat.has(m))byMat.set(m,[]);byMat.get(m).push(o);});
  let merged=0;
  byMat.forEach((list,mat)=>{if(list.length<2)return;const geos=[];
    for(const o of list){let g=o.geometry.index?o.geometry.toNonIndexed():o.geometry.clone();const keepA=['position','normal','uv'];Object.keys(g.attributes).forEach(k=>{if(!keepA.includes(k))g.deleteAttribute(k);});
      if(!g.attributes.normal)g.computeVertexNormals();if(!g.attributes.uv)g.setAttribute('uv',new T.BufferAttribute(new Float32Array(g.attributes.position.count*2),2));
      g.morphAttributes={};g.clearGroups();
      const mx=new T.Matrix4().multiplyMatrices(inv,o.matrixWorld);g.applyMatrix4(mx);
      if(mx.determinant()<0){/* mirrored: flip triangle winding */for(const k of ['position','normal','uv']){const a=g.attributes[k],is=a.itemSize;for(let t=0;t<a.count;t+=3){for(let c=0;c<is;c++){const i1=(t+1)*is+c,i2=(t+2)*is+c;const tmp=a.array[i1];a.array[i1]=a.array[i2];a.array[i2]=tmp;}}}}
      geos.push(g);victims.push(o);}
    let mg=null;try{mg=mergeGeometries(geos,false);}catch(e){mg=null;}
    geos.forEach(g=>g.dispose&&g!==mg&&g.dispose());
    if(!mg){victims.splice(victims.length-list.length,list.length);return;}
    const mesh=new T.Mesh(mg,mat);mesh.name='merged';mesh.castShadow=false;mesh.receiveShadow=false;mesh.userData.merged=true;
    /* place in the component's local frame */
    group.add(mesh);merged+=list.length-1;});
  victims.forEach(o=>{o.parent&&o.parent.remove(o);});
  return merged;}

VRP.mergeStatic=mergeStatic;
/* ---------- build ---------- */
/* sim, P: the station's simulation; sch: snapshot of the schematic (vb, lines, circ) */
VRP.buildBoard=function(sim,P,circ,sch,samples){
  const M=m3();const root=new T.Group();root.name='board';
  /* board bounds from the 3D components and pipes only (2D charts/lists are shown on the schematic panel) */
  const box=new T.Box3();
  const comps={};
  for(const c of circ.comps){const b=B3[c.type];if(!b)continue;BCTX.shells=[];BCTX.inner=[];let r;try{r=b(c,c.o||{});}catch(e){console.warn('B3',c.type,e);continue;}
    r.shells=BCTX.shells;r.inner=BCTX.inner;BCTX.shells=[];BCTX.inner=[];
    r.g.position.set(c.x,-c.y,0);r.g.rotation.z=-(c.rot||0)*Math.PI/180;if(c.flip)r.g.scale.x=-1;root.add(r.g);
    convertTree(r.g);dropEdges(r.g);
    /* own material copies so one component can glow alone */
    const mm=new Map();r.g.traverse(o=>{if(!o.isMesh||!o.material||o.userData.shell||Array.isArray(o.material))return;if(o.material.isMeshStandardMaterial&&!o.material.transparent){if(!mm.has(o.material))mm.set(o.material,o.material.clone());o.material=mm.get(o.material);}});
    r.g.userData.comp=c.id;r.g.updateMatrixWorld(true);const bb=new T.Box3().setFromObject(r.g);box.union(bb);
    comps[c.id]={c,...r,bb0:bb};}
  /* pipes */
  const pipes=buildPipes(sch.lines);const pr=new T.Group();root.add(pr);
  pipes.forEach(Pp=>{pr.add(Pp.g);convertTree(Pp.g);Pp.mt=toStd(Pp.mt);Pp.g.traverse(o=>{if(o.isMesh&&o.material&&o.material.isMeshPhysicalMaterial)o.material=toStd(o.material);});});
  /* particles → one instanced mesh per pipe */
  pipes.forEach(Pp=>{if(!Pp.parts.length){Pp.inst=null;return;}const n=Pp.parts.length;Pp.parts.forEach(m=>m.parent&&m.parent.remove(m));
    const inst=new T.InstancedMesh(new T.SphereGeometry(1.3,8,6),new T.MeshBasicMaterial({color:0xffffff,toneMapped:false}),n);inst.frustumCulled=false;inst.count=0;pr.add(inst);Pp.inst=inst;Pp.off=Math.random()*20;});
  pr.updateMatrixWorld(true);pipes.forEach(Pp=>{box.union(new T.Box3().setFromObject(Pp.g));});
  /* merge static pipe parts per material (tube colour changes with pressure but its shape never moves) */
  mergeStatic(pr,new Set(pipes.filter(p=>p.inst).map(p=>p.inst)));
  pipes.forEach(Pp=>{/* the merged tube keeps the pipe's own material object, so colouring still works */});
  /* probe and merge every component */
  let mergedTotal=0;
  for(const id in comps){const o=comps[id];const S=samples.map(s=>[s.c?s.c[id]||null:null,s]);S.push([null,samples[0]||{p:{},q:{},c:{}}]);
    o.dyn=probeDynamic(o.g,o.upd,S);mergedTotal+=mergeStatic(o.g,o.dyn,m=>BCTX&&false);}
  /* aluminium T-slot board, frame and feet – sized to the components */
  if(box.isEmpty())box.set(new T.Vector3(0,-300,0),new T.Vector3(400,0,30));
  const pad=26;const x0=box.min.x-pad,x1=box.max.x+pad,y0=box.min.y-pad,y1=box.max.y+pad;const bw=x1-x0,bh=y1-y0,cx=(x0+x1)/2,cy=(y0+y1)/2;
  const bg=new T.Group();bg.name='panel';root.add(bg);
  const brd=at(box3(bw,bh,6,M.board),cx,cy,-3);bg.add(brd);
  for(let y=-bh/2+15;y<bh/2-4;y+=30){bg.add(at(box3(bw-6,4.4,.8,M.slot),cx,cy+y,.1));[-2.9,2.9].forEach(o2=>bg.add(at(box3(bw-6,1.4,1.2,M.lip),cx,cy+y+o2,.3)));}
  const fr=12;[[cx,cy+bh/2+fr/2,bw+2*fr,fr],[cx,cy-bh/2-fr/2,bw+2*fr,fr]].forEach(([x,y,w,h])=>bg.add(at(rbox3(w,h,14,M.frame,2),x,y,0)));
  [cx-bw/2-fr/2,cx+bw/2+fr/2].forEach(x=>bg.add(at(rbox3(fr,bh,14,M.frame,2),x,cy,0)));
  convertTree(bg);dropEdges(bg);mergeStatic(bg,new Set());
  /* shells see-through (explore mode) */
  setXray(comps,true);
  const info={root,comps,pipes,cx,cy,bw:bw+2*fr,bh:bh+2*fr,merged:mergedTotal};
  /* value tags for gauges and labelled components */
  info.tags=[];for(const id in comps){const o=comps[id];const c=o.c;if(c.type!=='gauge'&&!c.l3)continue;const tg=new VRP.ValueTag(.03);o.g.updateMatrixWorld(true);
    const bb=new T.Box3().setFromObject(o.g);const p=new T.Vector3((bb.min.x+bb.max.x)/2,bb.max.y+10,bb.max.z+6);tg.sprite.position.copy(p);tg.sprite.scale.multiplyScalar(1);tg.sprite.userData.board=true;root.add(tg.sprite);info.tags.push({id,c,tg});}
  return info;};

function setXray(comps,on){for(const id in comps){const r=comps[id];(r.shells||[]).forEach(m=>{const mt=m.material;mt.transparent=on;mt.opacity=on?.2:1;mt.depthWrite=!on;mt.needsUpdate=true;m.children.forEach(e=>{if(e.isLineSegments)e.visible=on;});});(r.inner||[]).forEach(o=>o.visible=on);}}
VRP.setXray=setXray;

/* ---------- per-frame update ---------- */
const _m=new T.Matrix4(),_p=new T.Vector3(),_q=new T.Quaternion(),_s=new T.Vector3();
VRP.updateBoard=function(B,R,dt,view,hl,clock){
  for(const id in B.comps){const o=B.comps[id];if(o.upd){try{o.upd((R.c&&R.c[id])||null,R);}catch(e){}}}
  const pm=R.pmax||100,qr=R.qref||10;
  B.pipes.forEach(P=>{const l=P.L.l;const p=R.p[l.net]??0;const u=view.colors?(p<0?p*.2:p/pm):.3;if(Math.abs(u-P.last)>.004){P.last=u;if(view.colors){P.mt.color.setHex(pHex(u));P.mt.emissive.setHex(pHex(u));P.mt.emissiveIntensity=.12;}else{P.mt.color.setHex(0x8792a2);P.mt.emissiveIntensity=0;}}
    if(P.inst){const q=(R.q&&R.q[l.id])??0;const on=view.parts&&Math.abs(q)>qr*.015;if(!on){P.inst.count=0;return;}
      const sp=Math.sign(q)*clamp(Math.abs(q)/qr,0,1.6)*85;P.off=((P.off+sp*dt)%20+20)%20;const L=P.L;const n=P.inst.instanceMatrix.count,step=L.L/n;
      for(let i=0;i<n;i++){const s=(i*step+P.off*(step/20))%L.L;const pt=pAt(L.pts,L.cum,s);_p.set(pt[0],-pt[1],PZ+P.r*.75);_m.compose(_p,_q,_s.setScalar(1));P.inst.setMatrixAt(i,_m);}
      P.inst.count=n;P.inst.instanceMatrix.needsUpdate=true;}});
  /* highlight: touched / hovered components glow orange */
  const pulse=.16+.1*Math.sin(clock*5);
  for(const id in B.comps){const o=B.comps[id];const on=hl.has(id);if(!on&&!o._hl)continue;o._hl=on;
    o.g.traverse(m=>{if(!m.isMesh||!m.material||!m.material.emissive||m.material.transparent)return;if(m.userData.e0==null){m.userData.e0=m.material.emissive.getHex();m.userData.ei0=m.material.emissiveIntensity;}
      if(on){m.material.emissive.setHex(0xff8a1a);m.material.emissiveIntensity=pulse;}else{m.material.emissive.setHex(m.userData.e0);m.material.emissiveIntensity=m.userData.ei0;}});}
};
VRP.updateTags=function(B,R,view){
  for(const t of B.tags){if(!view.vals){t.tg.set('');continue;}const c=t.c,cs=R.c&&R.c[t.id];let s='';
    if(c.type==='gauge'){const p=cs&&cs.p!=null?cs.p:(R.p[c.net]??0);s=`${fmt(p,1)} bar`;}
    else if(c.l3t)s=c.l3t(R)||'';else if(cs&&cs.lt!=null&&typeof cs.lt!=='object')s=String(cs.lt);
    t.tg.set(VRP.strip(s),c.type==='gauge'?'#0b72d9':'#334155');}
};
})();
