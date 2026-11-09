const L=require('./_lib');const path=require('path');
const {chromium}=require('playwright');
(async()=>{await L.serve(L.DIST_VR,8765);const b=await chromium.launch();const p=await b.newPage({viewport:{width:900,height:560}});const errs=[];
p.on('pageerror',e=>errs.push('PAGEERR '+e.message));p.on('console',m=>{const t=m.text();if((m.type()==='error'||m.type()==='warning')&&!/ERR_FAILED|fonts|GL Driver|WebGL|GPU stall/.test(t))errs.push(m.type()+': '+t.slice(0,220));});
await p.route(/fonts\.(googleapis|gstatic)\.com/,r=>r.abort());await p.goto('http://localhost:8765/index.html',{waitUntil:'domcontentloaded'});
await p.waitForFunction(()=>document.body.classList.contains('ready'),null,{timeout:90000});await p.evaluate(()=>VRP.app.manual());
console.log('labs loaded',await p.evaluate(()=>LABS.length),'stations',await p.evaluate(()=>VRP.app.stations.length));
const res=[];
for(let i=0;i<26;i++){const e0=errs.length;const t0=Date.now();
  const r=await p.evaluate(async(i)=>{const a=VRP.app;a.goStation(i);a.frames(2);const st=a.stations[i];const out={ch:st.lab.ch,sims:[]};
    for(let k=0;k<st.lab.sims.length;k++){try{if(k)st.setSim(k);a.frames(3);out.sims.push(`${st.sim.id}:${st.board?Object.keys(st.board.comps).length:'X'}c/${st.ctrls.length}u`);}catch(e){out.sims.push('ERR '+e.message);}}
    out.active=a.stations.filter(s=>s.active).map(s=>s.lab.ch);return out;},i);
  res.push(`ch${r.ch} ${Date.now()-t0}ms ${r.sims.join(' ')} active=[${r.active}] ${errs.length>e0?'ERRORS:'+errs.slice(e0).join(' | ').slice(0,300):''}`);}
console.log(res.join('\n'));
console.log('total errors',errs.length);
await p.evaluate(()=>{const a=VRP.app;a.desk.x=0;a.desk.z=15.6;a.desk.yaw=0;a.desk.pitch=-.12;a.welcome.visible=false;a.frames(4);});
await p.screenshot({path:path.join(L.OUT,'vr_lobby.png'),timeout:120000});
await b.close();})();
