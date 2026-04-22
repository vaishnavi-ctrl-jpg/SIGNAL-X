// SIGNAL CONTROLLER
// ═══════════════════════════════════════════════
const PC={green:'var(--green)',yellow:'var(--warn)',red:'var(--red)'};
function tickSig(){
  const ns=S.ns, ew=S.ew;
  if(ns.ph!=='yellow') ns.t=Math.max(0,ns.t-1);
  if(ew.ph!=='yellow') ew.t=Math.max(0,ew.t-1);
  // NS green → yellow → red → EW green
  if(ns.t<=0&&ns.ph==='green'){ns.ph='yellow';ns.t=3}
  else if(ns.t<=0&&ns.ph==='yellow'){
    ns.ph='red'; ew.ph='green';
    ew.t=S._ewGreen||18;
    addLog('action',`Signal → EW GREEN ${ew.t}s · AI decision based on E:${Math.round(S.lane.e)} W:${Math.round(S.lane.w)} veh`);
  }
  if(ew.t<=0&&ew.ph==='green'){ew.ph='yellow';ew.t=3}
  else if(ew.t<=0&&ew.ph==='yellow'){
    ew.ph='red'; ns.ph='green';
    ns.t=S._nsGreen||35;
    addLog('action',`Signal → NS GREEN ${ns.t}s · AI decision based on N:${Math.round(S.lane.n)} S:${Math.round(S.lane.s)} veh`);
  }
  // Countdown scenario change
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
  {t:'decide',m:'Density N:{n} S:{s} E:{e} W:{w} — priority: {top} corridor'},
  {t:'action', m:'SignalAPI.set({dir}=GREEN, dur={dur}s, conf=0.{cf})'},
  {t:'pred',   m:'Forecast: {top} +{dp}% in {tm}min — pre-staging buffer'},
  {t:'lrf',    m:'Cycle review: {dir} avg wait ↓{pct}% — strategy {adj}'},
  {t:'lw',     m:'Threshold alert: {lane} approaching HIGH ({v} veh)'},
  {t:'decide', m:'Multi-step: Detect→Predict→Adjust in {ms}ms'},
  {t:'action', m:'Redis publish: {{ns:{ns},ew:{ew},conf:0.{cf}}}'},
  {t:'lrf',    m:'Feedback: throughput +{pct}% vs last cycle'},
  {t:'pred',   m:'Demand spike: {top} +{dp}% predicted at T+{tm}min'},
  {t:'action', m:'Ambulance channel: STANDBY armed — priority override ready'},
];
let li=0;
function autoLog(){
  const tmpl=TMPLS[li%TMPLS.length]; li++;
  const dirs=['NORTH','SOUTH','EAST','WEST'];
  const vals=Object.values(S.lane);
  const top=dirs[vals.indexOf(Math.max(...vals))];
  const msg=tmpl.m
    .replace('{n}',Math.round(S.lane.n)).replace('{s}',Math.round(S.lane.s))
    .replace('{e}',Math.round(S.lane.e)).replace('{w}',Math.round(S.lane.w))
    .replace('{top}',top).replace('{dir}',S.ns.ph==='green'?'NS':'EW')
    .replace('{dur}',S.ns.ph==='green'?S.ns.t:S.ew.t)
    .replace('{cf}',Math.floor(80+Math.random()*18))
    .replace('{dp}',Math.floor(5+Math.random()*25))
    .replace('{tm}',Math.floor(2+Math.random()*8))
    .replace('{pct}',Math.floor(5+Math.random()*20))
    .replace('{adj}',Math.random()>.5?'effective ✓':'recalibrating')
    .replace('{lane}',dirs[Math.floor(Math.random()*4)])
    .replace('{v}',Math.floor(15+Math.random()*8))
    .replace('{ms}',Math.floor(28+Math.random()*40))
    .replace('{ns}',S.ns.t).replace('{ew}',S.ew.t);
  addLog(tmpl.t,msg);
}
const TCLS={decide:'ld',action:'la',pred:'lp',lrf:'lrf',lw:'lw'};
function addLog(type,msg){
  const now=new Date();
  const ts=`${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
  S.logs.unshift({c:TCLS[type]||'ld',msg,ts});
  if(S.logs.length>80) S.logs.pop();
  const el=document.getElementById('agentLog'); if(!el)return;
  el.innerHTML=S.logs.map(l=>`<div class="lr"><span class="lt">[${l.ts}]</span> <span class="${l.c}">${l.msg}</span></div>`).join('');
}