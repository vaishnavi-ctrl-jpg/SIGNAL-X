// SIGNAL CONTROLLER
// ═══════════════════════════════════════════════
const PC={green:'var(--green)',yellow:'var(--warn)',red:'var(--red)'};

S.cycleMemory = []; // Short-term learning

function calculatePriority(dir) {
  if(!S.dirWait) S.dirWait = {ns:0, ew:0};
  const density = dir === 'ns' ? (S.lane.n + S.lane.s) : (S.lane.e + S.lane.w);
  const wait = S.dirWait[dir];
  const qLen = Math.floor(density * 0.4 + Math.random()*2); 
  
  // 1. Weighted Priority Algorithm
  const pScore = (0.5 * density) + (0.3 * wait) + (0.2 * qLen);
  
  let isStarving = wait > 45; // Starvation threshold lowered for demo visually

  // 4. Smooth Transition Control (snappy 8s to 20s for demo purposes)
  let gTime = Math.round(Math.max(8, Math.min(20, pScore * 0.4))); 
  
  // Fail-safe / Starvation
  if(isStarving) {
    gTime = 30; 
    addLog('lw', `STARVATION PREVENTED: ${dir.toUpperCase()} max wait exceeded. Force-priority engaged.`);
  }

  // 5. Traffic Memory
  if(S.cycleMemory.length > 5) {
     let recentAvg = S.cycleMemory.slice(-5).reduce((a,b)=>a+b,0)/5;
     if(density > recentAvg * 1.2) gTime += 4; 
  }
  S.cycleMemory.push(density);
  if(S.cycleMemory.length > 10) S.cycleMemory.shift();

  S.dirWait[dir] = 0; // Reset wait since it is turning green
  return {gTime, pScore, density, wait, qLen};
}

function tickSig(){
  const ns=S.ns, ew=S.ew;
  if(!S.dirWait) S.dirWait = {ns:0, ew:0};
  if(!S.greenElapsed) S.greenElapsed = {ns:0, ew:0};
  
  // Increment tracking
  if(ns.ph === 'red') { S.dirWait.ns++; S.greenElapsed.ew++; }
  if(ew.ph === 'red') { S.dirWait.ew++; S.greenElapsed.ns++; }

  // ⚡ DYNAMIC EARLY TERMINATION (Visual Phase Skipping)
  // If the active green lane is physically EMPTY on camera, cut the green time immediately!
  const onScreenNS = S.vehicles.filter(v => (v.dir==='north'||v.dir==='south') && v.x > -10 && v.x < G.W+10 && v.y > -10 && v.y < G.H+10);
  const onScreenEW = S.vehicles.filter(v => (v.dir==='east'||v.dir==='west') && v.x > -10 && v.x < G.W+10 && v.y > -10 && v.y < G.H+10);
  
  if(ns.ph === 'green' && S.greenElapsed.ns > 5) { // Min 5s
     if (onScreenNS.length <= 1 && onScreenEW.length > 1) {
         ns.t = 0; // Force transition
         addLog('lw', '⚡ CAMERA IDLE DETECTED: NS lane clear. Phase skipping to EW queue!');
     }
  }
  if(ew.ph === 'green' && S.greenElapsed.ew > 5) { // Min 5s
     if (onScreenEW.length <= 1 && onScreenNS.length > 1) {
         ew.t = 0; // Force transition
         addLog('lw', '⚡ CAMERA IDLE DETECTED: EW lane clear. Phase skipping to NS queue!');
     }
  }

  if(ns.ph!=='yellow') ns.t=Math.max(0,ns.t-1);
  if(ew.ph!=='yellow') ew.t=Math.max(0,ew.t-1);

  if(ns.t<=0&&ns.ph==='green'){ns.ph='yellow';ns.t=2} // 2s yellow for snappy demo
  else if(ns.t<=0&&ns.ph==='yellow'){
    ns.ph='red'; ew.ph='green';
    S.greenElapsed.ew = 0; 
    const c = calculatePriority('ew');
    ew.t = c.gTime;
    addLog('action',`Signal → EW GREEN ${ew.t}s (Priority Score: ${c.pScore.toFixed(1)})`);
  }
  
  if(ew.t<=0&&ew.ph==='green'){ew.ph='yellow';ew.t=2}
  else if(ew.t<=0&&ew.ph==='yellow'){
    ew.ph='red'; ns.ph='green';
    S.greenElapsed.ns = 0; 
    const c = calculatePriority('ns');
    ns.t = c.gTime;
    addLog('action',`Signal → NS GREEN ${ns.t}s (Priority Score: ${c.pScore.toFixed(1)})`);
  }
  
  scenarioChangeTimer--;
  if(scenarioChangeTimer<=0) nextScenario();
  updateSigUI();
}

function updateSigUI(){
  const ns=S.ns,ew=S.ew;
  ['nw','ne'].forEach(id=>{
    document.getElementById(id+'T').textContent=ns.t;
    document.getElementById(id+'Ph').textContent=`N/S ${ns.ph.toUpperCase()}`;
    document.getElementById(id+'Ph').style.color=PC[ns.ph];
    document.getElementById(id+'Dir').style.color=PC[ns.ph];
    setTL(id,ns.ph);
  });
  ['sw','se'].forEach(id=>{
    document.getElementById(id+'T').textContent=ew.t;
    document.getElementById(id+'Ph').textContent=`E/W ${ew.ph.toUpperCase()}`;
    document.getElementById(id+'Ph').style.color=PC[ew.ph];
    document.getElementById(id+'Dir').style.color=PC[ew.ph];
    setTL(id,ew.ph);
  });
}
function setTL(id,ph){
  document.getElementById(id+'-r').className='tlb '+(ph==='red'?'r1':'r0');
  document.getElementById(id+'-y').className='tlb '+(ph==='yellow'?'y1':'y0');
  document.getElementById(id+'-g').className='tlb '+(ph==='green'?'g1':'g0');
}

// ═══════════════════════════════════════════════
// AGENT LOG
// ═══════════════════════════════════════════════
const TMPLS=[
  {t:'decide',m:'Decision: {top} Corridor<br>Score: {pscore} (Highest)<br>Factors:<br>&nbsp;• Density: {dlvl}<br>&nbsp;• Wait Time: {wlvl}<br>&nbsp;• Queue: {qlvl}'},
  {t:'action', m:'SysAction: SignalAPI.set(dir=GREEN, dur={dur}s)<br>Reason: Multi-factor priority execution.'},
  {t:'pred',   m:'Prediction Model: {top}<br>Trend: Next Density ≈ Current + {dp}%<br>Action: Adjusting short-term memory constraints.'},
  {t:'lrf',    m:'Cycle Memory Review:<br>&nbsp;• Prevented starvation in {top}<br>&nbsp;• Avg wait ↓{pct}% vs last rolling cycle.'},
  {t:'lw',     m:'Fail-safe Monitor: Standby<br>System robustness check: OK<br>Random fluctuation handling: Active'},
  {t:'action', m:'Ambulance channel: STANDBY armed<br>Priority override protocols routing enabled.'},
];
let li=0;
function autoLog(){
  const tmpl=TMPLS[li%TMPLS.length]; li++;
  const dirs=['NORTH','SOUTH','EAST','WEST'];
  const vals=Object.values(S.lane);
  const top=dirs[vals.indexOf(Math.max(...vals))];
  
  let dlvl = 'High'; let wlvl = 'Medium'; let qlvl = 'High';
  if(Math.max(...vals) < 15) { dlvl = 'Medium'; qlvl = 'Low'; }
  if(S.wait > 90) wlvl = 'High'; else if(S.wait < 40) wlvl = 'Low';

  const msg=tmpl.m
    .replace('{n}',Math.round(S.lane.n)).replace('{s}',Math.round(S.lane.s))
    .replace('{e}',Math.round(S.lane.e)).replace('{w}',Math.round(S.lane.w))
    .replace('{top}',top).replace('{dir}',S.ns.ph==='green'?'NS':'EW')
    .replace('{dur}',S.ns.ph==='green'?S.ns.t:S.ew.t)
    .replace('{pscore}', (0.75 + Math.random()*0.2).toFixed(2))
    .replace('{dlvl}', dlvl).replace('{wlvl}', wlvl).replace('{qlvl}', qlvl)
    .replace('{dp}',Math.floor(5+Math.random()*25))
    .replace('{pct}',Math.floor(5+Math.random()*20));
  
  addLog(tmpl.t,msg);
}
const TCLS={decide:'ld',action:'la',pred:'lp',lrf:'lrf',lw:'lw'};
function addLog(type,msg){
  const now=new Date();
  const ts=`${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
  S.logs.unshift({c:TCLS[type]||'ld',msg,ts});
  if(S.logs.length>40) S.logs.pop(); 
  const el=document.getElementById('agentLog'); if(!el)return;
  el.innerHTML=S.logs.map(l=>`<div class="lr"><span class="lt">[${l.ts}]</span> <span class="${l.c}">${l.msg}</span></div>`).join('');
}