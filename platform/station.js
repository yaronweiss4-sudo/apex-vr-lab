/* =====================================================================
   APEX VR LAB · station.js
   One lab station in the room. Works for ANY lab of the website:
   - trainer board built from the lab's circuit (board.js)
   - control desk generated automatically from the lab's controls (sim.ui)
   - hand-operated parts on the real components (levers, knobs, buttons)
     from the station's "bind" list in stations.js
   - panels: what you just did · what is happening now · the component
     you touched · gauges/readouts · live ISO schematic
   ===================================================================== */
(()=>{
const VRP=window.VRP=window.VRP||{};
const T=window.THREE;const strip=VRP.strip;

/* ---------- component roles (same texts as the website's automatic enrichment) ---------- */
function centerName(o){if(!o||!o.box||o.box.length!==3)return '';for(const k in KIT.D43){if(KIT.D43[k][1]===o.box[1])return KIT.CEN[k]||'';}return '';}
function roleOf(c){const o=c.o||{};switch(c.type){
  case 'pump':return o.var?'משאבה בעלת נפח משתנה: אפשר לשנות את הספיקה בלי לשנות את מהירות המנוע.':'משאבה בעלת נפח קבוע: דוחפת ספיקה קבועה של שמן בכל סיבוב. היא לא "מייצרת לחץ" – הלחץ נוצר כשהשמן פוגש התנגדות.';
  case 'motor':return 'מנוע הידראולי: הופך לחץ וספיקה למומנט ולמהירות סיבוב.';
  case 'tank':return 'מיכל שמן (קו חזרה): השמן חוזר למיכל בלחץ קרוב לאפס.';
  case 'gauge':return 'מד לחץ: מראה את הלחץ בנקודה שאליה הוא מחובר, ב-bar.';
  case 'flowm':return 'מד ספיקה: מראה את ספיקת השמן בקו, ב-L/min.';
  case 'filter':return 'מסנן: עוצר חלקיקי לכלוך לפני שהם מגיעים לרכיבים.';
  case 'accum':return 'מצבר לחץ: אוגר שמן בלחץ מול כרית גז דחוס (חנקן), ומחזיר אותו למערכת כשהלחץ יורד.';
  case 'sv':return 'ברז ניתוק: פותח או סוגר את הקו לגמרי.';
  case 'check':return o.pilot?'שסתום אל-חוזר מפוקד: זרימה חופשית בכיוון אחד, והכיוון ההפוך נפתח רק בלחץ פיקוד.':'שסתום אל-חוזר: מאפשר זרימה בכיוון אחד וחוסם את הכיוון ההפוך.';
  case 'throttle':return 'צמצם: מגביל את הספיקה. Q = k·√Δp.';
  case 'fcv':return 'ווסת זרימה מפוצה לחץ: שומר על ספיקה קבועה גם כשהעומס משתנה.';
  case 'pv':return {relief:'שסתום פריקה: סגור במצב רגיל. כשהלחץ מגיע לכיול הוא נפתח ומחזיר שמן למיכל – כך הוא מגביל את הלחץ המרבי.',reduce:'ווסת לחץ: שומר על לחץ מוצא קבוע ונמוך מלחץ המערכת.',seq:'שסתום סדר פעולות: פותח קו שני רק אחרי שהלחץ בקו הראשון מגיע לכיול.'}[o.kind]||'שסתום לחץ.';
  case 'cbv':return 'שסתום איזון עומס: מחזיק עומס שמושך את המפעיל.';
  case 'dcv':{const cn=centerName(o);return `שסתום פיקוד: קובע לאן זורם השמן – מחבר את P ו-T לפתחי המפעיל A ו-B לפי מצב הספול.${cn?` במצב האמצעי: מרכז ${cn}.`:''}`;}
  case 'cyl':return o.single?'צילינדר חד-פעולה: הלחץ דוחף לכיוון אחד, והחזרה בכוח קפיץ או משקל.':'צילינדר דו-פעולה: הופך לחץ וספיקה לכוח ולתנועה קווית. F = p·A, v = Q/A.';
  case 'ram':return 'בוכנה (ראם) חד-פעולה: הלחץ מרים את העומס, והירידה בכוח המשקל.';}
  return '';}
function shortName(c){if(c.lbl&&c.lbl.length>1&&!/^\d+$/.test(c.lbl))return c.lbl;const n=strip(c.name||c.id);return n.split(/[:–(]/)[0].trim().slice(0,34);}
VRP.roleOf=roleOf;VRP.shortName=shortName;

/* ---------- record a lab's control panel (sim.ui) as data ---------- */
function recordUI(sim,P){const groups=[];let g=null;const cur=()=>{if(!g){g={t:'',open:true,items:[]};groups.push(g);}return g;};
  const U={host:null,grp(t,open=true){g={t,open,items:[]};groups.push(g);return {};},_p(){return {};},
    num(obj,key,label,unit,o={}){cur().items.push({k:'num',obj,key,label,unit:unit||'',o});return {};},
    sel(obj,key,label,opts,rebuild){cur().items.push({k:'sel',obj,key,label,opts,rebuild});return {};},
    seg(obj,key,label,opts,rebuild){cur().items.push({k:'seg',obj,key,label,opts,rebuild});return {};},
    chk(obj,key,label,rebuild){cur().items.push({k:'chk',obj,key,label,rebuild});return {};},
    btn(label,fn,cls){cur().items.push({k:'btn',label,fn});return {};},
    note(html){cur().items.push({k:'note',html});return {};}};
  try{sim.ui(U,P,window.APP);}catch(e){console.warn('ui record',e);}return groups;}

/* ---------- schematic → texture ---------- */
class SvgTex{constructor(w,h){this.w=w;this.h=h;const c=this.c=document.createElement('canvas');c.width=w;c.height=h;this.x=c.getContext('2d');this.tex=new T.CanvasTexture(c);this.tex.colorSpace=T.SRGBColorSpace;this.tex.anisotropy=4;this.busy=false;}
  async draw(svg){if(this.busy)return;this.busy=true;try{const vb=svg.getAttribute('viewBox').split(/[\s,]+/).map(Number);const cl=svg.cloneNode(true);
      cl.querySelectorAll('.hit').forEach(n=>n.remove());cl.setAttribute('xmlns','http://www.w3.org/2000/svg');const ar=vb[2]/vb[3];let W=this.w-40,H=W/ar;if(H>this.h-40){H=this.h-40;W=H*ar;}
      cl.setAttribute('width',W);cl.setAttribute('height',H);const st=document.createElementNS('http://www.w3.org/2000/svg','style');st.textContent=VRP.SCH_CSS||'';cl.insertBefore(st,cl.firstChild);
      const img=new Image();img.src='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(new XMLSerializer().serializeToString(cl));await img.decode();
      const x=this.x;x.clearRect(0,0,this.w,this.h);x.fillStyle='#ffffff';x.beginPath();x.roundRect(0,0,this.w,this.h,26);x.fill();x.drawImage(img,(this.w-W)/2,(this.h-H)/2,W,H);this.tex.needsUpdate=true;}
    catch(e){}finally{this.busy=false;}}}

const CSS_MSG=`.root{background:linear-gradient(180deg,rgba(17,27,46,.96),rgba(10,17,30,.96));border:3px solid #2b4c7e;border-radius:28px;padding:30px 34px}
.h{font-size:30px;color:#93c5fd;font-weight:700;margin-bottom:6px}
.act{font-size:40px;font-weight:700;color:#fff;background:#0b72d9;border-radius:18px;padding:14px 20px;margin:4px 0 16px}
.act.old{background:#1e3a5f;color:#cfe0f5}
.sec{font-size:27px;color:#93c5fd;font-weight:700;margin:14px 0 6px;border-top:2px solid #22385a;padding-top:12px}
.ins{font-size:31px;margin:6px 0;padding:8px 14px;border-radius:12px;background:rgba(255,255,255,.05)}
.ins.w{background:rgba(234,88,12,.22);border-right:6px solid #fb923c}
.cmp{font-size:31px;background:rgba(147,51,234,.18);border-right:6px solid #a855f7;border-radius:12px;padding:10px 14px}
.cmp .n{font-size:36px;font-weight:800;color:#fff;display:block;margin-bottom:4px}
.log{font-size:24px;color:#9fb0c6;margin-top:4px}.log div{margin:3px 0}`;
const CSS_READ=`.root{background:rgba(10,17,30,.95);border:3px solid #2b4c7e;border-radius:28px;padding:22px 30px}
.h{font-size:28px;color:#93c5fd;font-weight:700;margin-bottom:10px}
table{width:100%;border-collapse:collapse;font-size:30px}td{padding:5px 6px;border-bottom:1px solid #1e3352}
td.v{text-align:left;direction:ltr;font-weight:800;color:#fff;white-space:nowrap;width:30%}
td.b{width:26%}.bar{height:14px;border-radius:7px;background:#1e3352;overflow:hidden}.bar i{display:block;height:100%;background:#38bdf8;border-radius:7px}
tr.w td{color:#fdba74}tr.w .bar i{background:#fb923c}`;
const CSS_DESK=`.root{background:#0f1726;border-radius:20px}
.l{position:absolute;transform:translate(50%,-50%);white-space:nowrap;font-size:24px;color:#cfe0f5;font-weight:600;text-align:center}
.l.s{font-size:20px;color:#9fb0c6;font-weight:500}.l.v{font-size:24px;color:#fff;font-weight:800;background:#0b2440;border:2px solid #1d4f86;border-radius:10px;padding:1px 10px}
.g{position:absolute;transform:translate(50%,0);font-size:22px;color:#60a5fa;font-weight:700;border-bottom:2px solid #1e3a5f;text-align:center}
.t{position:absolute;right:28px;top:14px;font-size:28px;font-weight:800;color:#fff}`;

/* =====================================================================
   Station
   ===================================================================== */
class Station{
  constructor(app,cfg,lab){this.app=app;this.cfg=cfg;this.lab=lab;this.id=cfg.id;
    const g=this.group=new T.Group();g.name='station-'+cfg.id;g.position.set(cfg.pos[0],0,cfg.pos[1]);g.rotation.y=cfg.rotY||0;app.scene.add(g);
    this.view={colors:true,parts:true,vals:true};this.hl=new Set();this.hlT={};this.log=[];this.lastAct=null;this.touched=null;this.clock=0;
    this.schHost=document.createElement('div');Object.assign(this.schHost.style,{position:'fixed',left:'0',top:'0',width:'1200px',height:'900px',pointerEvents:'none',opacity:'0',zIndex:'-1',overflow:'hidden'});document.body.appendChild(this.schHost);
    this._furniture();this.setSim(cfg.sim||0,true);}

  /* ---------- static furniture ---------- */
  _furniture(){const g=this.group;const A=this.app;
    /* rubber floor mat with yellow safety edge */
    const mat=new T.Mesh(new T.PlaneGeometry(3.6,2.6),new T.MeshStandardMaterial({color:0x1b2230,roughness:.92,metalness:0}));mat.rotation.x=-Math.PI/2;mat.position.set(0,.004,.55);g.add(mat);
    const edge=new T.Mesh(new T.RingGeometry(1,1.04,4,1),new T.MeshBasicMaterial({color:0xfacc15}));edge.rotation.set(-Math.PI/2,0,Math.PI/4);edge.scale.set(1.8*1.414,1.3*1.414,1);edge.position.set(0,.006,.55);g.add(edge);
    /* footprints: where to stand */
    const fp=VRP.textPlane(['👣  עמדו כאן'],.5,.14,{font:'700 54px Heebo, Arial',fg:'#facc15'});fp.rotation.x=-Math.PI/2;fp.position.set(0,.008,1.05);g.add(fp);
    /* trainer stand: two posts, feet, top beam */
    const fm=new T.MeshStandardMaterial({color:0x2a3442,metalness:.6,roughness:.4});
    this.stand=new T.Group();g.add(this.stand);
    /* sign above the board */
    this.sign=new VRP.Panel(1.7,.24,{ppm:700,css:`.root{background:#0b2440;border:3px solid #1d4f86;border-radius:22px;display:flex;align-items:center;justify-content:center;font-size:58px;font-weight:800;color:#fff}.root small{font-size:40px;color:#93c5fd;font-weight:600;margin-inline-start:18px}`});
    g.add(this.sign.mesh);this._fm=fm;
    /* left: messages + readouts. right: schematic + desk */
    const yaw=.42;
    this.msg=new VRP.Panel(.95,.92,{ppm:1050,css:CSS_MSG});this.msg.mesh.position.set(-1.33,1.62,.32);this.msg.mesh.rotation.y=yaw;g.add(this.msg.mesh);
    this.read=new VRP.Panel(.95,.5,{ppm:1050,css:CSS_READ});this.read.mesh.position.set(-1.33,.88,.32);this.read.mesh.rotation.y=yaw;g.add(this.read.mesh);
    this.schT=new SvgTex(1400,1000);const sp=new T.Mesh(new T.PlaneGeometry(.98,.7),new T.MeshBasicMaterial({map:this.schT.tex,toneMapped:false}));sp.position.set(1.36,1.98,.22);sp.rotation.y=-yaw;g.add(sp);this.schMesh=sp;
    const sl=VRP.textPlane(['שרטוט ISO – מתעדכן בזמן אמת'],.6,.06,{font:'600 40px Heebo, Arial',fg:'#93c5fd'});sl.position.set(1.36,2.37,.22);sl.rotation.y=-yaw;g.add(sl);
    /* the control desk (filled per simulation) */
    this.desk=new T.Group();this.desk.position.set(1.3,0,.42);this.desk.rotation.y=-yaw;g.add(this.desk);
  }

  /* ---------- simulation ---------- */
  setSim(i,first){this.si=i;this.sim=this.lab.sims[i];this.P=clone(this.sim.P);this.st=this.sim.init?this.sim.init(this.P):{};this.fault=null;this.ckey=null;this.R=null;
    this.binds=(this.cfg.bind&&this.cfg.bind[this.sim.id])||[];
    this._step(0);this._buildBoard();this._buildDesk();this._sign();
    if(!first)this.act(`עברת לסימולציה ${this.sim.n}: ${this.sim.t}`,'🔀');
    else this.lastAct={t:`ברוכים הבאים לעמדה: ${this.sim.t}. גשו ללוח, געו ברכיבים והפעילו את המערכת בידיים.`,ic:'👋',at:performance.now(),intro:true};
    this._msgDirty=true;}
  _ctx(){window.APP=window.APP||{};Object.assign(window.APP,{sim:this.sim,P:this.P,st:this.st,fault:this.fault,R:this.R,mode:'explore'});return window.APP;}
  _step(dt){this.R=this.sim.step(this.P,this.st,dt,{fault:this.fault?this.fault.id:null,mode:'explore'});const R=this.R;R.p=R.p||{};R.q=R.q||{};R.c=R.c||{};}
  /* samples of the circuit state for the moving-part probe */
  _samples(){const S=[];const sim=this.sim;const P0=clone(this.P);const ui=recordUI(sim,P0);const vars=[{}];
    ui.forEach(g=>g.items.forEach(it=>{if(it.obj!==P0)return;if(it.k==='seg'||it.k==='sel')it.opts.forEach(([v])=>vars.push({[it.key]:v}));if(it.k==='chk'){vars.push({[it.key]:true});vars.push({[it.key]:false});}}));
    for(const v of vars.slice(0,14)){const P=Object.assign(clone(this.P),v);let st;try{st=sim.init?sim.init(P):{};}catch(e){continue;}for(let k=0;k<40;k++){try{const R=sim.step(P,st,.025,{mode:'explore'});R.p=R.p||{};R.q=R.q||{};R.c=R.c||{};if(k%13===12)S.push(R);}catch(e){break;}}}
    return S.length?S:[this.R];}
  _buildBoard(){const circ=this.sim.circuit(this.P);this.ckey=this.sim.key?this.sim.key(this.P):'0';
    schBuild(circ,this.schHost);this.sch={svg:SCH.svg,lines:SCH.lines,comps:SCH.comps,circ:SCH.circ,host:SCH.host,vb:SCH.vb};
    if(this.board){VRP.removeInterOf(this.board.root);this.group.remove(this.boardWrap);this.board.root.traverse(o=>{if(o.geometry)o.geometry.dispose();});}
    (this.bindObjs||[]).forEach(o=>{VRP.removeInterOf(o);o.parent&&o.parent.remove(o);});this.bindObjs=[];
    const B=this.board=VRP.buildBoard(this.sim,this.P,circ,this.sch,this._samples());
    /* scale: fit inside 1.5 m × 1.2 m, bottom edge at 0.80 m */
    const s=this.scale=Math.min(1.5/B.bw,1.2/B.bh,.0042);const wrap=this.boardWrap=new T.Group();wrap.add(B.root);this.group.add(wrap);
    B.root.scale.setScalar(s);B.root.position.set(-B.cx*s,-B.cy*s,0);B.tags.forEach(t=>t.tg.sprite.scale.set(.13/s,.0325/s,1));wrap.position.set(0,.80+B.bh*s/2,0);
    /* stand behind the board */
    this.stand.clear();const fm=this._fm;const H=.80+B.bh*s,W=B.bw*s;
    [-1,1].forEach(sd=>{const post=new T.Mesh(new T.BoxGeometry(.05,H+.08,.05),fm);post.position.set(sd*(W/2+.03),(H+.08)/2,-.04);this.stand.add(post);const ft=new T.Mesh(new T.BoxGeometry(.08,.04,.62),fm);ft.position.set(sd*(W/2+.03),.02,-.04);this.stand.add(ft);});
    const shelf=new T.Mesh(new T.BoxGeometry(W+.1,.04,.32),fm);shelf.position.set(0,.62,.06);this.stand.add(shelf);
    const drip=new T.Mesh(new T.BoxGeometry(W*.96,.03,.26),new T.MeshStandardMaterial({color:0x9aa5b4,metalness:.8,roughness:.35}));drip.position.set(0,.655,.06);this.stand.add(drip);
    this.sign.mesh.position.set(0,H+.24,0);this.boardTop=H;
    this.group.updateMatrixWorld(true);
    /* component touch boxes (station-local) */
    this.compBoxes={};for(const id in B.comps){const o=B.comps[id];if(o.c.type==='tank'&&false)continue;const bb=new T.Box3().setFromObject(o.g);if(bb.isEmpty())continue;this.compBoxes[id]=bb;}
    this._bindings();
    this._schDirty=true;}
  boardPoint(x,y,z=0){/* board coordinates → world */return this.board.root.localToWorld(new T.Vector3(x,-y,z));}

  /* ---------- hand-operated parts on the real components ---------- */
  _bindings(){const B=this.board;this.lever=null;this.bctrls=[];
    for(const b of this.binds){const o=B.comps[b.comp];if(!o)continue;const c=o.c;
      if(b.type==='lever'&&c.type==='dcv'){const side=c.o&&c.o.L==='lever'?-1:1;const N=c.o.box.length,n0=c.o.n0??Math.floor(N/2);
        /* the lever group built by B3.dcv sits at (side·31, 0, 26) */
        let lv=null;o.g.traverse(m=>{if(!lv&&m.isGroup&&m!==o.g&&Math.abs(m.position.x-side*31)<.5&&Math.abs(m.position.z-26)<.5)lv=m;});
        const piv=new T.Group();piv.position.set(side*31,0,26);o.g.add(piv);this.bindObjs.push(piv);
        const vals=b.values||Object.keys(KIT.idx);const rots=vals.map(v=>(n0-(KIT.idx[v]??n0))*.45);
        const L={b,lv,piv,vals,rots,grab:false,ang:0};this.lever=L;
        VRP.addInter({obj:piv,kind:'grab',cx:0,cy:30,cz:0,hx:14,hy:14,hz:14,name:'lever-'+b.comp,station:this,
          begin:()=>{L.grab=true;this._touchHL(b.comp,6);},
          drag:(p)=>{const l=piv.worldToLocal(p.point.clone());let a=Math.atan2(-l.x,Math.max(4,l.y));a=clamp(a,-.6,.6);L.ang=a;
            let best=0;rots.forEach((r,k)=>{if(Math.abs(a-r)<Math.abs(a-rots[best]))best=k;});if(Math.abs(a-rots[best])<.2){const v=vals[best];if(String(this.P[b.key])!==String(v)){this.P[b.key]=v;if('auto' in this.P)this.P.auto=false;this._changed();this._actSeg(b.key,v,'ידית');}}},
          end:()=>{L.grab=false;},rayPlane:()=>{const n=new T.Vector3(0,0,1).transformDirection(piv.matrixWorld);return new T.Plane().setFromNormalAndCoplanarPoint(n,new T.Vector3().setFromMatrixPosition(piv.matrixWorld));}});}
      else if(b.type==='knob'){/* twist the real adjusting knob (e.g. relief valve setting) */
        const piv=new T.Group();piv.position.set(...b.local);if(b.axis==='x')piv.rotation.y=Math.PI/2;else if(b.axis==='-x')piv.rotation.y=-Math.PI/2;else if(b.axis==='y')piv.rotation.x=-Math.PI/2;o.g.add(piv);this.bindObjs.push(piv);
        const K={v0:0};const sp=b.perTurn||((b.max-b.min)/3);
        VRP.addInter({obj:piv,kind:'grab',cx:0,cy:0,cz:0,hx:12,hy:12,hz:16,name:'knob-'+b.comp,station:this,
          begin:()=>{K.v0=+this.P[b.key];K.x0=null;this._touchHL(b.comp,6);},
          drag:(p)=>{let d=0;if(p.twist!=null)d=p.twist;else{const l=piv.worldToLocal(p.point.clone());if(K.x0==null)K.x0=l.x;d=(K.x0-l.x)/40*Math.PI;}
            let v=K.v0+d/(2*Math.PI)*sp;v=clamp(Math.round(v/b.step)*b.step,b.min,b.max);if(v!==this.P[b.key]){this.P[b.key]=+v.toFixed(4);this._changed();this._actNum(b.key,b.label,v,b.unit,true);}},
          end:()=>{this._actNum(b.key,b.label,this.P[b.key],b.unit,false);},twistAxis:()=>new T.Vector3(0,0,1).transformDirection(piv.matrixWorld),
          rayPlane:()=>{const n=new T.Vector3(0,0,1).transformDirection(piv.matrixWorld);return new T.Plane().setFromNormalAndCoplanarPoint(n,new T.Vector3().setFromMatrixPosition(piv.matrixWorld));}});}
      else if(b.type==='buttons'||b.type==='toggle'){/* a small control box screwed to the board next to the component */
        const box=new T.Group();this.group.add(box);this.bindObjs.push(box);const wp=this.boardPoint(c.x+(b.at?b.at[0]:0),c.y+(b.at?b.at[1]:0),20);box.position.copy(this.group.worldToLocal(wp));box.position.z=.03;
        const items=b.type==='toggle'?[[null,b.label||'',b.col||0xf59e0b]]:b.items;const w=.075*items.length+.03;
        const plate=new T.Mesh(new T.BoxGeometry(w,.085,.03),new T.MeshStandardMaterial({color:0xd4a017,metalness:.3,roughness:.5}));plate.position.z=-.012;box.add(plate);
        items.forEach(([v,lab,col],k)=>{const bt=new VRP.Button3D({r:.022,col,label:null,name:'bind-'+b.comp+k,
            lit:()=>b.type==='toggle'?!!this.P[b.key]:String(this.P[b.key])===String(v),
            onPress:()=>{if(b.type==='toggle'){this.P[b.key]=!this.P[b.key];this._changed();this.act(`${this.P[b.key]?b.on:b.off}`,b.icon||'🔘');}
              else if(String(this.P[b.key])!==String(v)){this.P[b.key]=v;this._changed();this._actSeg(b.key,v,'');}}});
          bt.obj.position.set(w/2-.05-.075*k,.006,.004);box.add(bt.obj);this.bctrls.push(bt);
          const lp=VRP.textPlane(lab,.07,.024,{font:'700 44px Heebo, Arial',w:300,h:100,fg:'#111827'});lp.position.set(w/2-.05-.075*k,-.03,.0045);box.add(lp);});
        if(b.title){const tp=VRP.textPlane(b.title,w,.022,{font:'700 40px Heebo, Arial',w:600,h:90,fg:'#111827'});tp.position.set(0,.052,.004);box.add(tp);plate.scale.y=1.25;plate.position.y=.008;}}
    }}

  /* ---------- the control desk, generated from sim.ui ---------- */
  _buildDesk(){const D=this.desk;VRP.removeInterOf(D);D.clear();this.ctrls=[];this.deskLabels=[];
    const ui=this.ui=recordUI(this.sim,this.P);
    /* lay controls out right-to-left in rows */
    const W=.92;const rows=[];let row=null,x=0;const tw=t=>strip(t||'').length*.0118+.03;const cellW=it=>it.k==='seg'?Math.max(.15,it.opts.length*.066,tw(it.label)):it.k==='sel'?Math.max(.2,Math.min(it.opts.length,4)*.066,tw(it.label)):it.k==='chk'?Math.max(.12,tw(it.label)):it.k==='btn'?Math.max(.13,Math.min(.22,tw(it.label)*.62)):it.k==='num'?.42:0;
    const sims=this.lab.sims;
    const head={k:'head'};rows.push({items:[head],h:.085,title:true});
    ui.forEach(g=>{if(!g.items.some(it=>it.k!=='note'))return;rows.push({grp:g.t,h:.045,items:[]});row=null;
      g.items.forEach(it=>{const w=cellW(it);if(!w)return;if(!row||x+w>W-.04){row={items:[],h:.098};rows.push(row);x=0;}it._x=x+w/2;it._w=w;x+=w+.012;row.items.push(it);});row=null;});
    const Hd=rows.reduce((a,r)=>a+r.h,0)+.05;this.deskH=Hd;
    /* desk body: tilted top (35°), cabinet below */
    const tilt=.85;const top=new T.Group();top.position.set(0,.98,0);top.rotation.x=-tilt;D.add(top);
    const slab=new T.Mesh(new T.BoxGeometry(W+.06,Hd+.06,.04),new T.MeshStandardMaterial({color:0x273142,metalness:.5,roughness:.45}));slab.position.set(0,Hd/2,-.025);top.add(slab);
    const cab=new T.Mesh(new T.BoxGeometry(W+.02,.9,.4),new T.MeshStandardMaterial({color:0x1d2633,metalness:.45,roughness:.5}));cab.position.set(0,.49,-.22);D.add(cab);
    const face=new VRP.Panel(W,Hd,{ppm:1000,css:CSS_DESK});face.mesh.position.set(0,Hd/2,.0015);top.add(face.mesh);this.face=face;
    /* place controls */
    let y=Hd-.025;const lbl=[];const px=(xx)=>Math.round(xx*1000),py=(yy)=>Math.round((Hd-yy)*1000);
    const put=(obj,xx,yy)=>{obj.position.set(W/2-xx,yy,0);top.add(obj);};
    rows.forEach(r=>{const yc=y-r.h/2;
      if(r.title){/* simulation switcher + reset */lbl.push(`<div class="t">${this.lab.ch?`פרק ${this.lab.ch} · `:''}לוח בקרה</div>`);
        sims.forEach((s,k)=>{const b=new VRP.Button3D({r:.02,col:0x6366f1,label:String(s.n),name:'sim'+k,lit:()=>this.si===k,onPress:()=>{if(this.si!==k)this.app.later(()=>this.setSim(k));}});put(b.obj,.42+k*.06,yc-.005);this.ctrls.push(b);});
        lbl.push(`<div class="l s" style="right:${px(.42+(sims.length-1)*.03)-0}px;top:${py(yc+.035)}px">סימולציה</div>`);
        const rb=new VRP.Button3D({r:.02,col:0x64748b,label:'↺',name:'reset',onPress:()=>this.app.later(()=>this.reset())});put(rb.obj,.80,yc-.005);this.ctrls.push(rb);
        lbl.push(`<div class="l s" style="right:${px(.80)}px;top:${py(yc+.035)}px">איפוס</div>`);}
      else if(r.grp!=null&&!r.items.length){if(r.grp)lbl.push(`<div class="g" style="right:${px(W/2)}px;top:${py(yc+.012)}px;width:${Math.round((W-.06)*1000)}px">${r.grp}</div>`);}
      else r.items.forEach(it=>{const cx=it._x+.03;
        if(it.k==='seg'||it.k==='sel'){const n=it.opts.length;const sp=Math.min(.066,(it._w-.01)/n);lbl.push(`<div class="l" style="right:${px(cx)}px;top:${py(yc+.036)}px">${it.label}</div>`);
          it.opts.forEach(([v,h,tt],k)=>{const bx=cx-(n-1)*sp/2+k*sp;const col=v===false?0xef4444:v===true?0x22c55e:0x0ea5e9;
            const b=new VRP.Button3D({r:.019,col,name:'seg-'+it.key+k,lit:()=>String(it.obj[it.key])===String(v),onPress:()=>{if(String(it.obj[it.key])!==String(v)){it.obj[it.key]=(typeof it.obj[it.key]==='number'&&it.k==='sel')?+v:v;if(it.key==='pos'&&'auto' in it.obj)it.obj.auto=false;this._changed(it.rebuild);this._actSeg(it.key,v,'',it);}}});
            put(b.obj,bx,yc-.004);this.ctrls.push(b);lbl.push(`<div class="l s" style="right:${px(bx)}px;top:${py(yc-.038)}px">${strip(h)}</div>`);});}
        else if(it.k==='chk'){const b=new VRP.Button3D({r:.019,col:0xf59e0b,name:'chk-'+it.key,lit:()=>!!it.obj[it.key],onPress:()=>{it.obj[it.key]=!it.obj[it.key];this._changed(it.rebuild);this.act(`${it.obj[it.key]?'הפעלת':'כיבית'}: ${strip(it.label)}`,it.obj[it.key]?'✅':'⬜');}});
          put(b.obj,cx,yc-.004);this.ctrls.push(b);lbl.push(`<div class="l" style="right:${px(cx)}px;top:${py(yc+.036)}px">${it.label}</div>`);}
        else if(it.k==='btn'){const b=new VRP.Button3D({r:.021,col:0x8b5cf6,name:'btn',onPress:()=>{this._ctx();try{it.fn();}catch(e){console.warn(e);}const A=window.APP;if(A.P&&A.P!==this.P)this.P=A.P;if(A.st&&A.st!==this.st)this.st=A.st;this._changed(true);this.act(`לחצת: ${strip(it.label)}`,'🔘');}});
          put(b.obj,cx,yc-.004);this.ctrls.push(b);lbl.push(`<div class="l s" style="right:${px(cx)}px;top:${py(yc+.036)}px;max-width:150px;white-space:normal;line-height:1.05">${it.label}</div>`);}
        else if(it.k==='num'){const o=it.o||{};const mn=isFinite(o.min)?o.min:0,mx=isFinite(o.max)?o.max:Math.max(1,+it.obj[it.key]*3),st=o.step||1;
          const sl=new VRP.Slider3D({len:.27,min:mn,max:mx,step:st,name:'num-'+it.key,get:()=>+it.obj[it.key],set:(v)=>{it.obj[it.key]=o.int?Math.round(v):v;this._changed(o.rebuild);this._actNum(it.key,it.label,it.obj[it.key],it.unit,true);},onCommit:()=>this._actNum(it.key,it.label,it.obj[it.key],it.unit,false)});
          put(sl.obj,cx,yc-.012);this.ctrls.push(sl);it._lab={x:cx,y:yc+.03};this.deskLabels.push(it);}
      });
      y-=r.h;});
    this.faceStatic=lbl.join('');this._faceDirty=true;
    /* one mesh per material for the static parts of the desk (bezels, tracks, plates) */
    const dyn=new Set();top.traverse(o=>{if(o.userData.dyn)dyn.add(o);});VRP.mergeStatic(top,dyn);}
  _faceHtml(){const Hd=this.deskH;const px=(xx)=>Math.round(xx*1000),py=(yy)=>Math.round((Hd-yy)*1000);
    return this.faceStatic+this.deskLabels.map(it=>`<div class="l" style="right:${px(it._lab.x)}px;top:${py(it._lab.y)}px">${it.label} <span class="v">${fmt(+it.obj[it.key],3)} ${it.unit}</span></div>`).join('');}

  /* ---------- messages ---------- */
  act(text,ic='•',toast=true){const now=performance.now();this.lastAct={t:text,ic,at:now};this.log.unshift({t:text,ic,at:now});this.log.length=Math.min(this.log.length,5);this._msgDirty=true;this._insDue=now+650;
    if(toast)this.app.toast(`${ic} ${text}`);}
  _optOf(key,v,it){const items=(this.ui||[]).flatMap(g=>g.items);const f=it||items.find(x=>(x.k==='seg'||x.k==='sel')&&x.key===key);if(!f)return null;const o=f.opts.find(o=>String(o[0])===String(v));return {it:f,o};}
  _actSeg(key,v,via,it){const r=this._optOf(key,v,it);if(!r){this.act(`שינית: ${key} = ${v}`,'🔧');return;}const [,h,tt]=r.o;this.act(`${strip(r.it.label)}: ${strip(tt||h)}`,via==='ידית'?'🕹️':'🔘');}
  _actNum(key,label,v,unit,live){const now=performance.now();if(live){this._numPend={key,label,v,unit};this._numT=now;return;}
    this._numPend=null;this.act(`שינית את ${strip(label)} ל-${fmt(+v,3)} ${unit||''}`,'🎚️');}
  touch(id,how='touch'){const c=this.sch.circ.comps.find(c=>c.id===id);if(!c)return;const now=performance.now();if(this.touched&&this.touched.id===id&&now-this.touched.at<1500)return;
    this.touched={id,at:now};this._touchHL(id,4);this._msgDirty=true;const nm=strip(c.name||shortName(c));this.app.toast(`👆 ${nm}`,2600);}
  _touchHL(id,sec){this.hl.add(id);this.hlT[id]=performance.now()+sec*1000;}
  _changed(rebuild){if(this.sim.onChange)try{this.sim.onChange(this.P,this.st);}catch(e){}
    if(rebuild){const key=this.sim.key?this.sim.key(this.P):'0';if(key!==this.ckey)this.app.later(()=>{this._buildBoard();});}
    this._msgDirty=true;this._faceDirty=true;this._insDue=performance.now()+650;}
  reset(){this.P=clone(this.sim.P);this.st=this.sim.init?this.sim.init(this.P):{};this._step(0);this._buildBoard();this._buildDesk();this.act('איפסת את העמדה – כל הערכים חזרו להתחלה','↺');}

  _sign(){this.sign.set(`<span>פרק ${this.lab.ch} · ${this.sim.t}</span><small>${this.si+1}/${this.lab.sims.length}</small>`);}
  _msgHtml(){const R=this.R,P=this.P,now=performance.now();let h='';
    const a=this.lastAct;if(a){const old=now-a.at>9000&&!a.intro;h+=`<div class="h">הפעולה האחרונה שלך</div><div class="act${old?' old':''}">${a.ic} ${VRP.bidi(a.t)}</div>`;}
    let L=[];try{L=(this.sim.ins?this.sim.ins(P,R,this.st):[])||[];}catch(e){}
    L=L.filter(x=>!/👆/.test(x.ic||'')&&!/לחצו על רכיב/.test(x.h||''));L.sort((p,q)=>(q.w?1:0)-(p.w?1:0));L=L.slice(0,2);
    if(L.length)h+=`<div class="sec">מה קורה עכשיו</div>`+L.map(x=>`<div class="ins${x.w?' w':''}">${x.ic||''} ${VRP.bidi(x.h)}</div>`).join('');
    const t=this.touched;if(t&&now-t.at<20000){const c=this.sch.circ.comps.find(c=>c.id===t.id);if(c){let tip='';try{tip=this.sim.tip?this.sim.tip(c.id,P,R):'';}catch(e){}const role=roleOf(c);
      h+=`<div class="sec">הרכיב שנגעת בו</div><div class="cmp"><span class="n">${strip(c.name||shortName(c))}</span>${VRP.bidi(tip||role||'')}</div>`;}}
    else h+=`<div class="sec">טיפ</div><div class="ins">👆 געו באצבע בכל רכיב על הלוח כדי לדעת מה הוא עושה. צבטו ידית או כפתור סיבובי כדי להפעיל אותם.</div>`;
    return h;}
  _readHtml(){const R=this.R;const rd=(R&&R.read)||[];if(!rd.length)return '<div class="h">מדידות</div><div>—</div>';
    return `<div class="h">מדים ומדידות – בזמן אמת</div><table>${rd.slice(0,7).map(r=>{const u=r.max?clamp(Math.abs(r.v)/r.max,0,1):null;return `<tr class="${r.w?'w':''}"><td>${r.k}</td><td class="v">${fmt(r.v,r.dg??2)} ${r.u||''}</td><td class="b">${u!=null?`<div class="bar"><i style="width:${Math.round(u*100)}%"></i></div>`:''}</td></tr>`;}).join('')}</table>`;}

  /* ---------- frame update ---------- */
  update(dt,now){this.clock+=dt;const n=Math.max(1,Math.ceil(dt/.01));for(let k=0;k<n;k++){try{this._step(dt/n);}catch(e){console.warn(e);break;}}
    const R=this.R;
    /* lever follows the hand while grabbed */
    for(const id in this.hlT)if(now>this.hlT[id]){this.hl.delete(id);delete this.hlT[id];}
    VRP.updateBoard(this.board,R,dt,this.view,this.hl,this.clock);
    if(this.lever&&this.lever.grab&&this.lever.lv)this.lever.lv.rotation.z=this.lever.ang;
    this.ctrls.forEach(c=>c.update(dt));(this.bctrls||[]).forEach(c=>c.update(dt));
    /* schematic: advance flow dots every frame, redraw the texture ~2×/s */
    Object.assign(SCH,this.sch);try{schUpdate(R,dt,this.view);}catch(e){}
    if(now-(this._schT||0)>480||this._schDirty){this._schT=now;this._schDirty=false;this.schT.draw(this.sch.svg);}
    if(now-(this._tagT||0)>200){this._tagT=now;VRP.updateTags(this.board,R,this.view);}
    if(this._numPend&&now-this._numT>900){const p=this._numPend;this._actNum(p.key,p.label,p.v,p.unit,false);}
    if(now-(this._uiT||0)>330){this._uiT=now;
      if(this._msgDirty||(this._insDue&&now>this._insDue)||now-(this._msgT||0)>1000){this._msgT=now;this._msgDirty=false;this._insDue=0;this.msg.set(this._msgHtml());}
      this.read.set(this._readHtml());if(this._faceDirty||this.deskLabels.length){this._faceDirty=false;this.face.set(this._faceHtml());}}}
}
VRP.Station=Station;
})();
