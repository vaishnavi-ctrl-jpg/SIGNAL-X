// SCENARIO ENGINE
// Cycles through 6 scenarios. Each scenario sets lane vehicle counts.
// AI agent then decides signal timings based on congestion.
// ═══════════════════════════════════════════════
function applyScenario(sc){
  currentScenario = {...sc};
  
  // 6. Peak Hour Simulation Mode (logic only)
  // Time-based traffic patterns influence base counts
  const hour = new Date().getHours();
  let peakMod = 1.0;
  if (hour >= 8 && hour <= 10) peakMod = 1.3; // Morning Rush
  if (hour >= 17 && hour <= 19) peakMod = 1.4; // Evening Rush

  // 7. Noise Handling / Randomness
  const noise = () => 1 + (Math.random() * 0.2 - 0.1); // +/- 10%
  
  S.lane = {
    n: sc.n * peakMod * noise(), 
    s: sc.s * peakMod * noise(), 
    e: sc.e * peakMod * noise(), 
    w: sc.w * peakMod * noise()
  };

  scenarioChangeTimer = 35 + Math.floor(Math.random()*15); 
  
  // Rebuild vehicles for new scenario
  spawnVehicles();
  updateDensityDisplay();
  updateChartData();
  updateHudVeh();
  addLog('pred',`Context Shift: "${sc.name}" pattern detected. Adaptive recalibration initiated.`);
}
function nextScenario(){
  scenarioIdx = (scenarioIdx+1) % SCENARIOS.length;
  applyScenario(SCENARIOS[scenarioIdx]);
}

// ═══════════════════════════════════════════════
// VEHICLE ENGINE — simple, proven, on-screen
// ══════════════════════════════════════════════
const VTYPES=[
  {t:'car',  w:28,h:14,spd:2.2,clr:'#00CFFF'},
  {t:'car',  w:24,h:12,spd:2.6,clr:'#00CFFF'},
  {t:'car',  w:26,h:13,spd:2.0,clr:'#00CFFF'},
  {t:'truck',w:40,h:18,spd:1.6,clr:'#FF6B2B'},
  {t:'bus',  w:48,h:19,spd:1.4,clr:'#FF6B2B'},
  {t:'bike', w:16,h:9, spd:3.0,clr:'#39FF87'},
  {t:'auto', w:20,h:11,spd:2.4,clr:'#FFB300'},
];
function pickType(){
  const r=Math.random();
  if(r<0.50)return VTYPES[Math.floor(Math.random()*3)];
  if(r<0.65)return VTYPES[3];
  if(r<0.72)return VTYPES[4];
  if(r<0.85)return VTYPES[5];
  return VTYPES[6];
}

function spawnVehicles(){
  if(!G.W||!G.H)return;
  S.vehicles=[];
  const sc=currentScenario;
  // Count per direction — always at least 2, max 7
  const nC=Math.min(7,Math.max(2,Math.round(sc.n/4)));
  const sC=Math.min(7,Math.max(2,Math.round(sc.s/4)));
  const eC=Math.min(7,Math.max(2,Math.round(sc.e/3.5)));
  const wC=Math.min(7,Math.max(2,Math.round(sc.w/3.5)));

  // Spawn vehicles SPREAD ACROSS the visible canvas from entry edge
  // North-bound (up): start staggered from bottom of canvas going up
  for(let i=0;i<nC;i++){
    const vt=pickType();
    const lx=G.nsLaneX2-vt.w/2;
    // Spread evenly from bottom edge upward so some are always visible
    const startY=G.H - 10 - i*(Math.round(G.H/(nC+1)));
    S.vehicles.push({dir:'north',t:vt.t,w:vt.w,h:vt.h,spd:vt.spd,clr:vt.clr,
      x:lx, y:startY, stopped:false});
  }
  // South-bound (down): staggered from top
  for(let i=0;i<sC;i++){
    const vt=pickType();
    const lx=G.nsLaneX1-vt.w/2;
    const startY=10+i*(Math.round(G.H/(sC+1)));
    S.vehicles.push({dir:'south',t:vt.t,w:vt.w,h:vt.h,spd:vt.spd,clr:vt.clr,
      x:lx, y:startY, stopped:false});
  }
  // East-bound (right): staggered from left
  for(let i=0;i<eC;i++){
    const vt=pickType();
    const ly=G.ewLaneY1-vt.h/2;
    const startX=10+i*(Math.round(G.W/(eC+1)));
    S.vehicles.push({dir:'east',t:vt.t,w:vt.w,h:vt.h,spd:vt.spd,clr:vt.clr,
      x:startX, y:ly, stopped:false});
  }
  // West-bound (left): staggered from right
  for(let i=0;i<wC;i++){
    const vt=pickType();
    const ly=G.ewLaneY2-vt.h/2;
    const startX=G.W-10-i*(Math.round(G.W/(wC+1)));
    S.vehicles.push({dir:'west',t:vt.t,w:vt.w,h:vt.h,spd:vt.spd,clr:vt.clr,
      x:startX, y:ly, stopped:false});
  }
}

function updateVehicles(){
  if(!G.W)return;
  const nsG=S.ns.ph==='green';
  const ewG=S.ew.ph==='green';
  // Stop lines: front of vehicle stops here
  const SL={
    east:  G.rx-6,        // front (right edge) stops before intersection left
    west:  G.rx+G.rw+6,   // front (left edge) stops after intersection right
    south: G.ry-6,        // front (bottom edge) stops before intersection top
    north: G.ry+G.rh+6,   // front (top edge) stops after intersection bottom
  };

  S.vehicles.forEach(v=>{
    let blocked=false;

    // Red light: stop when front reaches stop line
    if(v.dir==='east' && !ewG){
      if(v.x+v.w >= SL.east-v.spd && v.x < G.rx) blocked=true;
    }
    if(v.dir==='west' && !ewG){
      if(v.x <= SL.west+v.spd && v.x+v.w > G.rx+G.rw) blocked=true;
    }
    if(v.dir==='south' && !nsG){
      if(v.y+v.h >= SL.south-v.spd && v.y < G.ry) blocked=true;
    }
    if(v.dir==='north' && !nsG){
      if(v.y <= SL.north+v.spd && v.y+v.h > G.ry+G.rh) blocked=true;
    }

    // Bumper-to-bumper: stop if another stopped vehicle is close ahead
    if(!blocked){
      for(const o of S.vehicles){
        if(o===v||o.dir!==v.dir||!o.stopped)continue;
        const gap=8;
        if(v.dir==='east'  && o.x-(v.x+v.w)<gap+v.spd && o.x>v.x){blocked=true;break}
        if(v.dir==='west'  && (v.x-(o.x+o.w))<gap+v.spd && o.x<v.x){blocked=true;break}
        if(v.dir==='south' && o.y-(v.y+v.h)<gap+v.spd && o.y>v.y){blocked=true;break}
        if(v.dir==='north' && (v.y-(o.y+o.h))<gap+v.spd && o.y<v.y){blocked=true;break}
      }
    }

    v.stopped=blocked;
    if(!blocked){
      if(v.dir==='east')  v.x+=v.spd;
      if(v.dir==='west')  v.x-=v.spd;
      if(v.dir==='south') v.y+=v.spd;
      if(v.dir==='north') v.y-=v.spd;
    }

    // Wrap: when fully off screen, respawn at opposite entry
    if(v.dir==='east'  && v.x > G.W+10)  { v.x=-v.w-Math.random()*40; v.y=G.ewLaneY1-v.h/2; v.stopped=false; const vt=pickType();Object.assign(v,{t:vt.t,w:vt.w,h:vt.h,spd:vt.spd,clr:vt.clr}); }
    if(v.dir==='west'  && v.x+v.w < -10) { v.x=G.W+Math.random()*40;  v.y=G.ewLaneY2-v.h/2; v.stopped=false; const vt=pickType();Object.assign(v,{t:vt.t,w:vt.w,h:vt.h,spd:vt.spd,clr:vt.clr}); }
    if(v.dir==='south' && v.y > G.H+10)  { v.y=-v.h-Math.random()*40; v.x=G.nsLaneX1-v.w/2; v.stopped=false; const vt=pickType();Object.assign(v,{t:vt.t,w:vt.w,h:vt.h,spd:vt.spd,clr:vt.clr}); }
    if(v.dir==='north' && v.y+v.h < -10) { v.y=G.H+Math.random()*40;  v.x=G.nsLaneX2-v.w/2; v.stopped=false; const vt=pickType();Object.assign(v,{t:vt.t,w:vt.w,h:vt.h,spd:vt.spd,clr:vt.clr}); }
  });
}
