/* =====================================================================
   APEX VR LAB · ui.js
   Text panels rendered from HTML (Hebrew, RTL, bold, mixed numbers),
   value tags, and the physical 3D controls (buttons, toggles, sliders,
   knobs) that hands can press, pinch and turn.
   ===================================================================== */
(()=>{
const VRP=window.VRP=window.VRP||{};
const T=window.THREE;

/* ---------- helpers ---------- */
const strip=h=>String(h??'').replace(/<[^>]+>/g,'');
VRP.strip=strip;
const BIDI_RE=/(?:(?<![֐-׿])[≈~=<>≤≥−+-]\s?)?\d[\d,]*(?:\.\d+)?(?:\s?[×x·]\s?10[⁰¹²³⁴⁵⁶⁷⁸⁹⁻]+)?\s?(?:bar|kW|kJ|J|L\/min|mm\/s|m\/s|mm²|mm³|mm|cm³\/rev|kN|N·m|Nm|N|kg|rpm|cSt|Hz|K\/min|°C|°|%|s|m|W|L)(?![A-Za-z֐-׿])/g;
/* keep "number + unit" runs left-to-right inside Hebrew text (string version of the 2D site's bidiFix) */
function bidi(html){return String(html??'').split(/(<[^>]+>)/).map((part,i,arr)=>{if(part.startsWith('<'))return part;
  /* do not touch text that is already inside <bdi> or dir=ltr */
  const before=arr.slice(0,i).join('');const openB=(before.match(/<bdi\b|<span[^>]*dir="ltr"/g)||[]).length,closeB=(before.match(/<\/bdi>|<\/span>/g)||[]).length;
  if(openB>closeB)return part;BIDI_RE.lastIndex=0;return part.replace(BIDI_RE,m=>`<bdi dir="ltr">${m}</bdi>`);}).join('');}
VRP.bidi=bidi;
const xs=new XMLSerializer();
const hdoc=document.implementation.createHTMLDocument('');
function xhtml(html){const d=hdoc.createElement('div');d.innerHTML=html;return [...d.childNodes].map(n=>xs.serializeToString(n)).join('');}

/* ---------- HTML → texture (SVG foreignObject) ---------- */
const BASE_CSS=`*{box-sizing:border-box;margin:0;padding:0}
.root{direction:rtl;text-align:right;font-family:Heebo,'Noto Sans Hebrew','Segoe UI',Arial,sans-serif;color:#e7edf6;width:100%;height:100%;overflow:hidden;line-height:1.42;-webkit-font-smoothing:antialiased}
b,strong{font-weight:700;color:#fff}bdi{unicode-bidi:isolate;direction:ltr}
.muted{color:#9fb0c6}.val{font-weight:700}.uu{color:#9fb0c6}
.fr{display:inline-flex;flex-direction:column;vertical-align:middle;text-align:center;font-size:.86em;line-height:1.1}.fr .de{border-top:1px solid currentColor}
.ok{color:#4ade80}.bad{color:#f87171}`;
VRP.BASE_CSS=BASE_CSS;
class HtmlTex{
  constructor(w,h,css=''){this.w=w;this.h=h;this.css=css;const c=this.canvas=document.createElement('canvas');c.width=w;c.height=h;this.ctx=c.getContext('2d');
    this.tex=new T.CanvasTexture(c);this.tex.colorSpace=T.SRGBColorSpace;this.tex.anisotropy=4;this.tex.generateMipmaps=true;this.tex.minFilter=T.LinearMipmapLinearFilter;
    this.busy=false;this.pending=null;this.last=null;this.ok=true;}
  set(html){if(html===this.last)return false;this.last=html;if(this.busy){this.pending=html;return true;}this._draw(html);return true;}
  async _draw(html){this.busy=true;const {w,h}=this;
    try{if(!this.ok)throw 0;
      const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}"><foreignObject x="0" y="0" width="${w}" height="${h}"><div xmlns="http://www.w3.org/1999/xhtml" class="root"><style>${BASE_CSS}${this.css}</style>${xhtml(html)}</div></foreignObject></svg>`;
      const img=new Image();img.decoding='async';img.src='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(svg);await img.decode();
      this.ctx.clearRect(0,0,w,h);this.ctx.drawImage(img,0,0);this.tex.needsUpdate=true;}
    catch(e){this.ok=false;this._plain(html);}
    finally{this.busy=false;if(this.pending!=null){const p=this.pending;this.pending=null;this.last=null;this.set(p);}}}
  /* fallback when the browser cannot rasterise HTML: plain wrapped text */
  _plain(html){const x=this.ctx,{w,h}=this;x.clearRect(0,0,w,h);x.fillStyle='rgba(15,23,38,.94)';x.fillRect(0,0,w,h);x.fillStyle='#e7edf6';x.direction='rtl';x.textAlign='right';
    const fs=Math.round(h/22);x.font=`${fs}px Arial`;const words=strip(html.replace(/<br\s*\/?>|<\/p>|<\/div>|<\/li>/g,'\n')).split(/\n/);let y=fs*1.6;
    for(const para of words){let line='';for(const wd of para.split(' ')){const t=line?line+' '+wd:wd;if(x.measureText(t).width>w-fs*2&&line){x.fillText(line,w-fs,y);y+=fs*1.35;line=wd;}else line=t;}if(line){x.fillText(line,w-fs,y);y+=fs*1.6;}if(y>h)break;}
    this.tex.needsUpdate=true;}
}
VRP.HtmlTex=HtmlTex;

/* a flat panel in the room showing HTML. size in metres */
class Panel{
  constructor(wm,hm,{ppm=1000,css='',name='panel'}={}){this.wm=wm;this.hm=hm;const W=Math.min(2048,Math.round(wm*ppm)),H=Math.min(2048,Math.round(hm*ppm));
    this.ht=new HtmlTex(W,H,css);const mat=new T.MeshBasicMaterial({map:this.ht.tex,transparent:true,toneMapped:false});
    this.mesh=new T.Mesh(new T.PlaneGeometry(wm,hm),mat);this.mesh.name=name;this.mesh.renderOrder=2;}
  set(html){return this.ht.set(html);}
}
VRP.Panel=Panel;

/* small always-readable value tag (canvas text, synchronous) */
class ValueTag{
  constructor(h=.032){this.c=document.createElement('canvas');this.c.width=256;this.c.height=64;this.x=this.c.getContext('2d');
    this.tex=new T.CanvasTexture(this.c);this.tex.colorSpace=T.SRGBColorSpace;
    this.sprite=new T.Sprite(new T.SpriteMaterial({map:this.tex,transparent:true,depthTest:false,toneMapped:false}));this.h=h;this.sprite.scale.set(h*4,h,1);this.sprite.renderOrder=3;this.last=null;}
  set(t,col='#0f172a'){if(t===this.last)return;this.last=t;const x=this.x;x.clearRect(0,0,256,64);this.sprite.visible=!!t;if(!t)return;
    x.font='700 38px Arial';const w=Math.min(250,x.measureText(t).width+28);x.fillStyle='rgba(255,255,255,.93)';x.strokeStyle=col;x.lineWidth=3;
    const r=14,x0=(256-w)/2;x.beginPath();x.roundRect(x0,8,w,48,r);x.fill();x.stroke();x.fillStyle=col;x.textAlign='center';x.textBaseline='middle';x.direction='ltr';x.fillText(t,128,33);this.tex.needsUpdate=true;}
}
VRP.ValueTag=ValueTag;

/* text drawn straight on a canvas (labels on 3D controls / signs) */
function textTex(lines,{w=512,h=128,bg=null,fg='#e7edf6',font='700 46px Heebo, Arial',align='center',rtl=true,pad=18}={}){
  const c=document.createElement('canvas');c.width=w;c.height=h;const x=c.getContext('2d');if(bg){x.fillStyle=bg;x.beginPath();x.roundRect(0,0,w,h,Math.min(w,h)*.18);x.fill();}
  x.fillStyle=fg;x.font=font;x.textAlign=align;x.textBaseline='middle';x.direction=rtl?'rtl':'ltr';const L=Array.isArray(lines)?lines:[lines];const lh=h/(L.length+.4);
  L.forEach((t,i)=>{const xx=align==='center'?w/2:align==='right'?w-pad:pad;x.fillText(t,xx,lh*(i+.7));});const tex=new T.CanvasTexture(c);tex.colorSpace=T.SRGBColorSpace;tex.anisotropy=4;return tex;}
VRP.textTex=textTex;
function textPlane(lines,wm,hm,opt={}){const ppm=opt.ppm||900;const tex=textTex(lines,Object.assign({w:Math.round(wm*ppm),h:Math.round(hm*ppm)},opt));
  const m=new T.Mesh(new T.PlaneGeometry(wm,hm),new T.MeshBasicMaterial({map:tex,transparent:true,toneMapped:false}));m.renderOrder=2;return m;}
VRP.textPlane=textPlane;

/* ---------- materials for controls ---------- */
const CM={
  bezel:new T.MeshStandardMaterial({color:0x1f2733,metalness:.6,roughness:.4}),
  steel:new T.MeshStandardMaterial({color:0xc4ccd6,metalness:.9,roughness:.28}),
  dark:new T.MeshStandardMaterial({color:0x111827,metalness:.3,roughness:.5}),
  track:new T.MeshStandardMaterial({color:0x0b1220,metalness:.2,roughness:.6}),
};
const capMat=(col)=>new T.MeshStandardMaterial({color:col,metalness:.15,roughness:.35,emissive:col,emissiveIntensity:0});
VRP.CM=CM;

/* =====================================================================
   Interactables. Every control registers here; the platform tests hands,
   controllers and the mouse against them every frame.
   - kind 'press'  : poked with a fingertip (or clicked with a ray)
   - kind 'grab'   : pinched and moved (sliders, levers, knobs)
   Each has a hit box in the object's local frame: hx,hy,hz half sizes.
   ===================================================================== */
VRP.inter=[];
VRP.addInter=o=>{VRP.inter.push(o);return o;};
VRP.removeInterOf=root=>{VRP.inter=VRP.inter.filter(i=>{let p=i.obj;while(p){if(p===root)return false;p=p.parent;}return true;});};

/* push button (round cap on a bezel). Local +Z is "out of the panel". */
class Button3D{
  constructor({r=.022,col=0x22c55e,label=null,onPress,lit=()=>false,enabled=()=>true,name='btn'}){
    const g=this.obj=new T.Group();g.name=name;this.col=col;
    const bz=new T.Mesh(new T.CylinderGeometry(r*1.32,r*1.4,.008,32),CM.bezel);bz.rotation.x=PI2;bz.position.z=.004;g.add(bz);
    this.mat=capMat(col);const cap=this.cap=new T.Mesh(new T.CylinderGeometry(r,r,.016,32),this.mat);cap.rotation.x=PI2;cap.position.z=.016;cap.userData.dyn=true;g.add(cap);
    if(label){const lp=this.lp=textPlane(label,r*1.7,r*1.7,{font:'800 150px Heebo, Arial',w:256,h:256,fg:'#ffffff',rtl:false});lp.position.z=.0246;lp.userData.dyn=true;g.add(lp);}
    this.onPress=onPress;this.lit=lit;this.enabled=enabled;this.down=0;
    VRP.addInter({obj:g,kind:'press',hx:r*1.15,hy:r*1.15,hz:.03,depth:.008,ctl:this,press:(src)=>{if(!this.enabled())return;this.down=.18;try{window.APEXSND&&APEXSND.click(.22,'tick');}catch(e){}this.onPress&&this.onPress(src);},name});}
  update(dt){const on=!!this.lit();this.mat.emissiveIntensity=on?.85:.06;this.down=Math.max(0,this.down-dt);this.cap.position.z=this.down>0?.009:.016;if(this.lp)this.lp.position.z=this.cap.position.z+.0086;}
}
const PI2=Math.PI/2;
VRP.Button3D=Button3D;

/* linear slider. The thumb moves along local X from -len/2 to +len/2. RTL: max on the LEFT (x<0) like the Hebrew UI. */
class Slider3D{
  constructor({len=.30,min=0,max=1,step=.01,get,set,name='slider',onCommit}){
    const g=this.obj=new T.Group();g.name=name;this.len=len;Object.assign(this,{min,max,step,get,set,onCommit});
    const tr=new T.Mesh(new T.BoxGeometry(len,.012,.006),CM.track);tr.position.z=.003;g.add(tr);
    this.fill=new T.Mesh(new T.BoxGeometry(1,.008,.004),new T.MeshStandardMaterial({color:0x0ea5e9,emissive:0x0ea5e9,emissiveIntensity:.5}));this.fill.position.z=.006;this.fill.userData.dyn=true;g.add(this.fill);
    const th=this.thumb=new T.Group();th.userData.dyn=true;g.add(th);const tm=new T.Mesh(new T.BoxGeometry(.026,.042,.022),new T.MeshStandardMaterial({color:0xe5e7eb,metalness:.3,roughness:.35}));tm.position.z=.012;th.add(tm);
    const gr=new T.Mesh(new T.BoxGeometry(.004,.03,.003),CM.dark);gr.position.z=.0235;th.add(gr);this.thumbMat=tm.material;
    this.dragging=false;
    VRP.addInter({obj:th,kind:'grab',hx:.03,hy:.035,hz:.035,ctl:this,name,
      begin:(p)=>{this.dragging=true;},drag:(p)=>{this._toValue(p.point);},end:()=>{this.dragging=false;this.onCommit&&this.onCommit();},
      rayPlane:()=>this._plane()});
    /* fine-step buttons at both ends */
    const mk=(sgn,x)=>{const b=new Button3D({r:.014,col:0x334155,label:sgn>0?'+':'−',name:name+(sgn>0?'+':'-'),onPress:()=>{this._stepBy(sgn);this.onCommit&&this.onCommit();}});b.obj.position.set(x,0,0);g.add(b.obj);return b;};
    this.bPlus=mk(1,-len/2-.032);this.bMinus=mk(-1,len/2+.032);}
  _plane(){const n=new T.Vector3(0,0,1).transformDirection(this.obj.matrixWorld);const p=new T.Vector3().setFromMatrixPosition(this.obj.matrixWorld);return new T.Plane().setFromNormalAndCoplanarPoint(n,p);}
  _toValue(world){const l=this.obj.worldToLocal(world.clone());const t=Math.max(0,Math.min(1,(this.len/2-l.x)/this.len));let v=this.min+t*(this.max-this.min);v=Math.round(v/this.step)*this.step;v=Math.max(this.min,Math.min(this.max,+v.toFixed(6)));if(v!==this.get())this.set(v);}
  _stepBy(s){let v=this.get()+s*this.step;v=Math.max(this.min,Math.min(this.max,+v.toFixed(6)));this.set(v);}
  update(dt){const v=this.get();const t=(v-this.min)/((this.max-this.min)||1);const x=this.len/2-t*this.len;this.thumb.position.x=x;
    const fw=Math.max(.001,this.len/2-x);this.fill.scale.x=fw;this.fill.position.x=this.len/2-fw/2;this.thumbMat.emissive.setHex(this.dragging?0x0ea5e9:0);this.thumbMat.emissiveIntensity=this.dragging?.35:0;
    this.bPlus.update(dt);this.bMinus.update(dt);}
}
VRP.Slider3D=Slider3D;

/* rotary knob turned by twisting the pinching hand (or dragging with a ray). axis = local Z. */
class Knob3D{
  constructor({r=.03,min=0,max=1,step=.01,perTurn=null,get,set,name='knob',onCommit,col=0x1e3a8a}){
    const g=this.obj=new T.Group();g.name=name;Object.assign(this,{min,max,step,get,set,onCommit});this.perTurn=perTurn||(max-min)*.75;
    const body=this.body=new T.Group();body.userData.dyn=true;g.add(body);const k=new T.Mesh(new T.CylinderGeometry(r,r*1.06,.03,32),new T.MeshStandardMaterial({color:col,metalness:.4,roughness:.35}));k.rotation.x=PI2;k.position.z=.015;body.add(k);
    for(let i=0;i<16;i++){const a=i/16*Math.PI*2;const rb=new T.Mesh(new T.BoxGeometry(.004,.004,.028),CM.dark);rb.position.set(Math.cos(a)*r*1.02,Math.sin(a)*r*1.02,.015);body.add(rb);}
    const mk=new T.Mesh(new T.BoxGeometry(.005,r*.8,.004),new T.MeshStandardMaterial({color:0xffffff,emissive:0xffffff,emissiveIntensity:.4}));mk.position.set(0,r*.5,.031);body.add(mk);
    this.active=false;
    VRP.addInter({obj:g,kind:'grab',hx:r*1.5,hy:r*1.5,hz:.06,ctl:this,name,
      begin:(p)=>{this.active=true;this.v0=this.get();this.a0=null;this.x0=null;},
      drag:(p)=>{let d=0;if(p.twist!=null){d=p.twist;}else if(p.point){const l=this.obj.worldToLocal(p.point.clone());if(this.x0==null)this.x0=l.x;d=(this.x0-l.x)/(.12)*Math.PI;}
        let v=this.v0+d/(Math.PI*2)*this.perTurn;v=Math.round(v/this.step)*this.step;v=Math.max(this.min,Math.min(this.max,+v.toFixed(6)));if(v!==this.get())this.set(v);},
      end:()=>{this.active=false;this.onCommit&&this.onCommit();},rayPlane:()=>{const n=new T.Vector3(0,0,1).transformDirection(this.obj.matrixWorld);return new T.Plane().setFromNormalAndCoplanarPoint(n,new T.Vector3().setFromMatrixPosition(this.obj.matrixWorld));},twistAxis:()=>new T.Vector3(0,0,1).transformDirection(this.obj.matrixWorld)});}
  update(){const v=this.get();const t=(v-this.min)/((this.max-this.min)||1);this.body.rotation.z=-t*Math.PI*1.5+Math.PI*.75;}
}
VRP.Knob3D=Knob3D;
})();
