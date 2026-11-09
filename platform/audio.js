/* APEX sound engine — synthesized (Web Audio, no files). Shared by the website labs and the VR platform.
   APEXSND.voice(out?) -> {update(comps,R,dt,running), stop()}  ;  APEXSND.setVol(v) / setOn(b) / unlock() */
(function(G){
'use strict';
const S={ctx:null,master:null,noise:null,on:true,vol:.55,voices:new Set()};
try{const v=localStorage.getItem('apexSndVol');if(v!=null)S.vol=+v;const o=localStorage.getItem('apexSndOn');if(o!=null)S.on=o==='1';}catch(e){}
const PUMP=/^(pump|pumpbi|gear|gearx|motor|gmotor|gero|axialx|vanex|psrc|drive|hpu)$/;
const RELIEF=/^(pv|relief|pvalve|unload|cbv|seq|reduce)$/;
const CYL=/^(cyl|ram|c7_vcyl|intens)$/;
const cl=(v,a,b)=>v<a?a:v>b?b:v;
function ctx(){if(S.ctx)return S.ctx;const AC=G.AudioContext||G.webkitAudioContext;if(!AC)return null;
  const c=new AC();S.ctx=c;
  const comp=c.createDynamicsCompressor();comp.threshold.value=-20;comp.ratio.value=4;comp.connect(c.destination);
  S.master=c.createGain();S.master.gain.value=S.on?S.vol*1.0:0;S.master.connect(comp);
  const n=c.sampleRate*2,b=c.createBuffer(1,n,c.sampleRate),d=b.getChannelData(0);let br=0;
  for(let i=0;i<n;i++){const w=Math.random()*2-1;br=(br+.02*w)/1.02;d[i]=w*.55+br*3.2;}  /* white + brown blend */
  S.noise=b;return c;}
function unlock(){const c=ctx();if(c&&c.state!=='running')c.resume().catch(()=>{});}
['pointerdown','keydown','touchstart'].forEach(e=>G.addEventListener&&G.addEventListener(e,unlock,{passive:true}));
function noiseSrc(c){const s=c.createBufferSource();s.buffer=S.noise;s.loop=true;s.loopStart=Math.random();s.start(0,Math.random()*1.5);return s;}
function setVol(v){S.vol=cl(v,0,1);try{localStorage.setItem('apexSndVol',S.vol);}catch(e){}apply();}
function setOn(b){S.on=!!b;try{localStorage.setItem('apexSndOn',S.on?'1':'0');}catch(e){}if(S.on)unlock();apply();}
function apply(){if(S.master)S.master.gain.setTargetAtTime(S.on?S.vol*1.0:0,S.ctx.currentTime,.05);}

/* one-shot sounds */
function click(out,amp,kind){const c=S.ctx;if(!c||c.state!=='running'||!S.on)return;S.nc=(S.nc|0)+1;const t=c.currentTime;
  const g=c.createGain();g.connect(out);
  const n=c.createBufferSource();n.buffer=S.noise;const f=c.createBiquadFilter();f.type='bandpass';
  f.frequency.value=kind==='tick'?4200:kind==='thud'?380:2600;f.Q.value=kind==='thud'?1.2:2.5;n.connect(f);f.connect(g);
  const dur=kind==='thud'?.16:kind==='tick'?.025:.05;
  g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(amp*(kind==='thud'?.9:.55),t+.002);g.gain.exponentialRampToValueAtTime(.0005,t+dur);
  n.start(t,Math.random());n.stop(t+dur+.02);
  /* low body: solenoid / steel-on-steel */
  const o=c.createOscillator(),og=c.createGain();o.type='sine';o.frequency.setValueAtTime(kind==='thud'?95:kind==='tick'?900:180,t);
  o.frequency.exponentialRampToValueAtTime(kind==='thud'?45:kind==='tick'?600:90,t+dur);
  og.gain.setValueAtTime(amp*(kind==='thud'?.9:kind==='tick'?.08:.35),t);og.gain.exponentialRampToValueAtTime(.0005,t+dur+.03);
  o.connect(og);og.connect(out);o.start(t);o.stop(t+dur+.05);}

function voice(outNode){const c=ctx();if(!c)return{update(){},stop(){},click(){}};
  const bus=c.createGain();bus.gain.value=1;bus.connect(outNode||S.master);
  /* pump / motor hum */
  const hum=c.createGain();hum.gain.value=0;const lp=c.createBiquadFilter();lp.type='lowpass';lp.frequency.value=260;lp.Q.value=.7;lp.connect(hum);hum.connect(bus);
  const o1=c.createOscillator();o1.type='sawtooth';o1.frequency.value=48;const o2=c.createOscillator();o2.type='sine';o2.frequency.value=96;
  const o3=c.createOscillator();o3.type='triangle';o3.frequency.value=24.2;const g2=c.createGain();g2.gain.value=.5;const g3=c.createGain();g3.gain.value=.35;
  o1.connect(lp);o2.connect(g2);g2.connect(lp);o3.connect(g3);g3.connect(lp);
  /* gear-mesh whine (pitch of pumping elements) */
  const wh=c.createGain();wh.gain.value=0;const ow=c.createOscillator();ow.type='sine';ow.frequency.value=430;ow.connect(wh);wh.connect(bus);
  /* oil flow: soft band-passed noise */
  const fl=c.createGain();fl.gain.value=0;const bp=c.createBiquadFilter();bp.type='bandpass';bp.frequency.value=700;bp.Q.value=.8;
  const ns=noiseSrc(c);ns.connect(bp);bp.connect(fl);fl.connect(bus);
  /* relief-valve hiss */
  const rl=c.createGain();rl.gain.value=0;const hp=c.createBiquadFilter();hp.type='highpass';hp.frequency.value=2400;const bp2=c.createBiquadFilter();bp2.type='peaking';bp2.frequency.value=4200;bp2.gain.value=6;
  const ns2=noiseSrc(c);ns2.connect(hp);hp.connect(bp2);bp2.connect(rl);rl.connect(bus);
  [o1,o2,o3,ow].forEach(o=>o.start());
  const mem={},V={dead:false};let lastP=0,tHit=0,wRef=8;
  const T=(p,v,tc)=>p.setTargetAtTime(v,c.currentTime,tc||.08);
  V.update=function(comps,R,dt,running){if(V.dead||!R)return;dt=dt||.016;const now=c.currentTime;
    const live=running!==false&&S.on;let run=0,w=0,pmF=0,relief=0,qF=0;
    const pm=R.pmax||100,qr=R.qref||10;
    for(const k in (R.p||{})){const v=R.p[k];if(v>0){const f=v/pm;if(f>pmF)pmF=f;}}
    for(const k in (R.q||{})){const f=Math.abs(R.q[k]||0)/qr;if(f>qF)qF=f;}
    for(const cm of comps||[]){const id=cm.id,cs=R.c&&R.c[id];if(!cs)continue;const m=mem[id]||(mem[id]={});const ty=cm.type||'';
      if(PUMP.test(ty)&&cs.ang!=null){let d=cs.ang-(m.ang??cs.ang);m.ang=cs.ang;if(Math.abs(d)>40)d=0;const ws=Math.abs(d)/dt;
        m.w=(m.w||0)*.85+ws*.15;if(m.w>.15){run=Math.max(run,1);w=Math.max(w,m.w);}}
      if(RELIEF.test(ty)&&cs.open!=null){const o=+cs.open||0;if(o>.02)relief=Math.max(relief,cl(o,0,1));}
      if(cs.i!=null){if(m.i!=null&&cs.i!==m.i&&live)click(bus,.55,'clack');m.i=cs.i;}
      if(cs.closed!=null){if(m.cl!=null&&!!cs.closed!==m.cl&&live)click(bus,.35,'clack');m.cl=!!cs.closed;}
      if(ty==='check'&&cs.open!=null){const o=(+cs.open||0)>.05;if(m.op!=null&&o!==m.op&&live&&now-(m.tk||0)>.18){click(bus,.18,'tick');m.tk=now;}m.op=o;}
      if(CYL.test(ty)&&cs.x!=null){const x=+cs.x||0;const v=m.x!=null?(x-m.x)/dt:0;
        if(live&&m.v!=null&&Math.abs(m.v)>.03&&((x<=.004&&m.v<0)||(x>=.996&&m.v>0))&&!m.end){click(bus,cl(.35+Math.abs(m.v)*1.2,.3,1),'thud');m.end=true;}
        if(x>.01&&x<.99)m.end=false;m.x=x;m.v=v;}}
    /* sudden pressure rise (shock / water hammer) */
    if(live&&pmF-lastP>.3&&now-tHit>.25){click(bus,cl(pmF-lastP,.3,1),'thud');tHit=now;}lastP=lastP*.6+pmF*.4;
    if(w>wRef)wRef=w;wRef=Math.max(4,wRef*.9995);
    const sp=cl(w/wRef,.35,1.3),on=live&&run?1:0,load=cl(pmF,0,1.2);
    const f=40+18*sp-3*load;T(o1.frequency,f,.15);T(o2.frequency,f*2,.15);T(o3.frequency,f*.5+.3,.15);
    T(lp.frequency,260+320*load+120*sp,.2);T(hum.gain,on*(.075+.05*load),.25);
    T(ow.frequency,f*9,.15);T(wh.gain,on*(.006+.016*load),.25);
    const qq=live?cl(qF,0,1.2):0;T(bp.frequency,450+1300*qq+400*load,.2);T(fl.gain,qq>.02?.02+.055*qq:0,.2);
    T(rl.gain,live?relief*(.025+.06*load):0,.12);V.st={nc:S.nc|0,on,f:+f.toFixed(1),load:+load.toFixed(2),q:+qq.toFixed(2),relief:+relief.toFixed(2)};};
  V.click=(amp,k)=>click(bus,amp,k);
  V.stop=function(){if(V.dead)return;V.dead=true;[hum,wh,fl,rl].forEach(g=>T(g.gain,0,.05));setTimeout(()=>{try{[o1,o2,o3,ow,ns,ns2].forEach(o=>o.stop());bus.disconnect();}catch(e){}},400);};
  S.voices.add(V);return V;}
G.APEXSND={voice,unlock,setVol,setOn,ctx,get voices(){return [...S.voices];},get ready(){return !!S.ctx;},get on(){return S.on;},get vol(){return S.vol;},get master(){ctx();return S.master;},click:(a,k)=>{const c=ctx();if(c)click(S.master,a,k);}};
})(typeof window!=='undefined'?window:globalThis);
