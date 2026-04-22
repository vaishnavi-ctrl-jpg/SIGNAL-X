// CANVAS SETUP
// ═══════════════════════════════════════════════
function initCanvas(){
  canvas=document.getElementById('streetCanvas');
  ctx2=canvas.getContext('2d');
  resize(); window.addEventListener('resize',resize);
}
function resize(){
  const wrap=document.getElementById('cctvWrap');
  const W=wrap.clientWidth, H=wrap.clientHeight;
  // Guard: if container has no size yet, retry in 100ms
  if(!W || !H){ setTimeout(resize,100); return; }
  canvas.width=W; canvas.height=H;
  computeGeometry();
  spawnVehicles();
}
function computeGeometry(){
  const W=canvas.width, H=canvas.height;
  const rx=Math.round(W*0.40), rw=Math.round(W*0.20);
  const ry=Math.round(H*0.34), rh=Math.round(H*0.32);
  const halfRH=rh/2, halfRW=rw/2;
  G = {
    W,H,rx,rw,ry,rh,
    ewLaneY1: ry + halfRH*0.5,       // eastbound  — centre of top half of H-road
    ewLaneY2: ry + halfRH*1.5,       // westbound  — centre of bottom half
    nsLaneX1: rx + halfRW*0.5,       // southbound — centre of left half of V-road
    nsLaneX2: rx + halfRW*1.5,       // northbound — centre of right half
  };
}

// ══════════════════════════════════════════════
// ══ DRAW ══

// ═══════════════════════════════════════════════
// DRAW
// ═══════════════════════════════════════════════
function rr(c,x,y,w,h,r){
  c.beginPath();c.moveTo(x+r,y);c.lineTo(x+w-r,y);c.arcTo(x+w,y,x+w,y+r,r);c.lineTo(x+w,y+h-r);c.arcTo(x+w,y+h,x+w-r,y+h,r);c.lineTo(x+r,y+h);c.arcTo(x,y+h,x,y+h-r,r);c.lineTo(x,y+r);c.arcTo(x,y,x+r,y,r);c.closePath();
}

function drawScene(){
  if(!canvas||!ctx2||!G.W||!canvas.width||!canvas.height) return;
  const {W,H,rx,rw,ry,rh}=G;
  ctx2.fillStyle='#131A0B'; ctx2.fillRect(0,0,W,H);
  // Roads
  ctx2.fillStyle='#1B2315'; ctx2.fillRect(0,ry,W,rh); ctx2.fillRect(rx,0,rw,H);
  ctx2.fillStyle='#202C18'; ctx2.fillRect(rx,ry,rw,rh);
  // Lane divider lines (within road — middle of each road section)
  ctx2.save(); ctx2.strokeStyle='rgba(140,155,110,.22)'; ctx2.lineWidth=1; ctx2.setLineDash([14,12]);
  // H-road center divider (between east & west lanes)
  ctx2.beginPath(); ctx2.moveTo(0,ry+rh/2); ctx2.lineTo(rx,ry+rh/2); ctx2.stroke();
  ctx2.beginPath(); ctx2.moveTo(rx+rw,ry+rh/2); ctx2.lineTo(W,ry+rh/2); ctx2.stroke();
  // V-road center divider
  ctx2.beginPath(); ctx2.moveTo(rx+rw/2,0); ctx2.lineTo(rx+rw/2,ry); ctx2.stroke();
  ctx2.beginPath(); ctx2.moveTo(rx+rw/2,ry+rh); ctx2.lineTo(rx+rw/2,H); ctx2.stroke();
  ctx2.restore();
  // Yellow box
  ctx2.save(); ctx2.strokeStyle='rgba(185,138,0,.5)'; ctx2.lineWidth=1.5; ctx2.setLineDash([7,4]);
  ctx2.strokeRect(rx+3,ry+3,rw-6,rh-6); ctx2.restore();
  // Stop lines
  ctx2.save(); ctx2.strokeStyle='rgba(235,235,215,.5)'; ctx2.lineWidth=2.5;
  [[rx-1,ry,rx-1,ry+rh],[rx+rw+1,ry,rx+rw+1,ry+rh],[rx,ry-1,rx+rw,ry-1],[rx,ry+rh+1,rx+rw,ry+rh+1]]
    .forEach(([x1,y1,x2,y2])=>{ctx2.beginPath();ctx2.moveTo(x1,y1);ctx2.lineTo(x2,y2);ctx2.stroke()});
  ctx2.restore();
  // Lane labels (at actual lane positions)
  ctx2.save(); ctx2.fillStyle='rgba(140,165,120,.4)'; ctx2.font='bold 8px monospace';
  ctx2.textAlign='center';
  ctx2.fillText('LANE (SB)',G.nsLaneX1,ry-10);
  ctx2.fillText('LANE (NB)',G.nsLaneX2,ry-10);
  ctx2.fillText('LANE (SB)',G.nsLaneX1,ry+rh+14);
  ctx2.fillText('LANE (NB)',G.nsLaneX2,ry+rh+14);
  ctx2.textAlign='left';
  ctx2.fillText('LANE A',6,G.ewLaneY1-3);
  ctx2.fillText('LANE B',6,G.ewLaneY2-3);
  ctx2.fillText('LANE A',rx+rw+5,G.ewLaneY1-3);
  ctx2.fillText('LANE B',rx+rw+5,G.ewLaneY2-3);
  ctx2.restore();
  // Traffic lights on canvas (in sync with signal state)
  drawTL(rx+rw+4, ry-24, S.ns.ph,'v');
  drawTL(rx-16,   ry+rh+4, S.ns.ph,'v');
  drawTL(rx-16,   ry-24, S.ew.ph,'h');
  drawTL(rx+rw+4, ry+rh+4, S.ew.ph,'h');
  // Move vehicles and draw
  updateVehicles();
  S.vehicles.forEach(drawVeh);
  // Scanline
  ctx2.fillStyle='rgba(0,207,255,.007)';
  ctx2.fillRect(0,(Date.now()/15)%H,W,1.5);
}

let _dbFrame=0;
function drawLoop(){
  drawScene();
  _dbFrame++;
  if(_dbFrame%3===0) updateDetBoxes(); // update boxes every 3 frames = smooth but not every rAF
  S.fid=requestAnimationFrame(drawLoop);
}

function drawTL(x,y,ph,ori){
  const isV=ori==='v'; const W2=isV?12:24, H2=isV?24:12;
  ctx2.fillStyle='#060606'; ctx2.strokeStyle='#141414'; ctx2.lineWidth=.5;
  rr(ctx2,x,y,W2,H2,2); ctx2.fill(); ctx2.stroke();
  const off={red:'#1e0505',yellow:'#1a1000',green:'#001308'};
  const on={red:'#FF3D3D',yellow:'#FFB300',green:'#39FF87'};
  const clr={red:ph==='red'?on.red:off.red,yellow:ph==='yellow'?on.yellow:off.yellow,green:ph==='green'?on.green:off.green};
  const pts=isV?[[x+6,y+5,'red'],[x+6,y+12,'yellow'],[x+6,y+19,'green']]:[[x+5,y+6,'red'],[x+12,y+6,'yellow'],[x+19,y+6,'green']];
  pts.forEach(([bx,by,c])=>{
    ctx2.beginPath(); ctx2.arc(bx,by,3.5,0,Math.PI*2);
    ctx2.fillStyle=clr[c];
    if(clr[c]!==off[c]){ctx2.shadowColor=clr[c];ctx2.shadowBlur=10;}
    ctx2.fill(); ctx2.shadowBlur=0;
  });
}

function drawVeh(v){
  if(v.x+v.w<-2||v.x>G.W+2||v.y+v.h<-2||v.y>G.H+2)return; // skip off-screen
  const c=v.clr;
  ctx2.shadowColor=c; ctx2.shadowBlur=5; ctx2.shadowOffsetY=1;
  ctx2.fillStyle=c+'CC'; ctx2.strokeStyle=c+'55'; ctx2.lineWidth=.5;
  rr(ctx2,v.x,v.y,v.w,v.h,2); ctx2.fill(); ctx2.stroke();
  ctx2.shadowBlur=0; ctx2.shadowOffsetY=0;
  // Windshield (dark front window)
  ctx2.fillStyle='rgba(0,0,0,.5)';
  const isH=(v.dir==='east'||v.dir==='west');
  if(v.t==='car'||v.t==='auto'){
    if(isH) rr(ctx2,v.x+2,v.y+2,v.w-4,v.h*.42,1);
    else    rr(ctx2,v.x+2,v.y+2,v.w*.42,v.h-4,1);
    ctx2.fill();
  } else if(v.t==='truck'||v.t==='bus'){
    // cab box at front
    if(v.dir==='east')  rr(ctx2,v.x+v.w-12,v.y+1,11,v.h-2,1);
    if(v.dir==='west')  rr(ctx2,v.x+1,v.y+1,11,v.h-2,1);
    if(v.dir==='south') rr(ctx2,v.x+1,v.y+v.h-12,v.w-2,11,1);
    if(v.dir==='north') rr(ctx2,v.x+1,v.y+1,v.w-2,11,1);
    ctx2.fill();
  }
  // Brake lights on stopped vehicles
  if(v.stopped){
    ctx2.fillStyle='rgba(255,50,50,.85)';
    if(v.dir==='east')  ctx2.fillRect(v.x,      v.y+2, 4, v.h-4);
    if(v.dir==='west')  ctx2.fillRect(v.x+v.w-4,v.y+2, 4, v.h-4);
    if(v.dir==='south') ctx2.fillRect(v.x+2,    v.y,   v.w-4, 4);
    if(v.dir==='north') ctx2.fillRect(v.x+2,    v.y+v.h-4, v.w-4, 4);
  }
}

// Detection boxes track actual vehicle positions (canvas px = CSS px since canvas.width = clientWidth)
function updateDetBoxes(){
  if(!canvas||!G.W) return;
  const visible=S.vehicles.filter(v=>v.x+v.w>0&&v.x<G.W&&v.y+v.h>0&&v.y<G.H);
  document.getElementById('detOverlay').innerHTML=visible.map(v=>{
    // canvas.width == wrap.clientWidth so coords are 1:1 with overlay
    const px=Math.round(v.x), py=Math.round(v.y);
    const pw=Math.round(v.w), ph=Math.round(v.h);
    const conf=(.84+Math.random()*.13).toFixed(2);
    const dir=(v.dir==='east'||v.dir==='west')?'SB':'NB';
    const lbl={car:'CAR',truck:'TRUCK',bus:'BUS',bike:'BIKE',auto:'AUTO'}[v.t];
    return `<div class="dbox ${v.t}" style="left:${px}px;top:${py}px;width:${pw}px;height:${ph}px">
      <div class="dlbl">${lbl}[${dir}] ${conf}</div></div>`;
  }).join('');
}


// ═══════════════════════════════════════════════