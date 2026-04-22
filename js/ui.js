// CLOCK
// ═══════════════════════════════════════════════
function pad(n){return String(n).padStart(2,'0')}
function tickClock(){
  const now=new Date();
  const ts=`${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
  ['ssTime','sbClock'].forEach(id=>{const e=document.getElementById(id);if(e)e.textContent=ts});
  const ht=document.getElementById('hudTs'); if(ht)ht.textContent=ts;
  const ha=document.getElementById('hudAg');
  if(ha)ha.textContent=['REASONING','PREDICTING','REFLECTING','DECIDING'][Math.floor(Date.now()/3200)%4];
  if(S.startTime){
    const el=Math.floor((Date.now()-S.startTime)/1000);
    const re=document.getElementById('fhRun');
    if(re)re.textContent=`Running time: ${Math.floor(el/3600)}:${pad(Math.floor((el%3600)/60))}:${pad(el%60)}`;
  }
}
setInterval(tickClock,1000); tickClock();

// ═══════════════════════════════════════════════
// SEARCH
// ═══════════════════════════════════════════════
document.getElementById('ssChips').innerHTML=PRESETS.map(p=>`<div class="ss-chip" onclick="fillLoc('${p}')">${p}</div>`).join('');
function fillLoc(v){document.getElementById('streetInput').value=v;closeDd();document.getElementById('streetInput').focus()}
function onSearch(v){
  if(!v.trim()){closeDd();return}
  const m=LOCS.filter(l=>l.toLowerCase().includes(v.toLowerCase())).slice(0,8);
  const dd=document.getElementById('ssDd');
  if(!m.length){dd.innerHTML=`<div class="dd-empty">No results for "${v}"</div>`;dd.classList.add('open');ddHi=-1;return}
  const re=new RegExp(`(${v.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')})`,'gi');
  dd.innerHTML=m.map((loc,i)=>`<div class="dd-item" data-loc="${loc}" onmousedown="fillLoc('${loc}')" id="ddi${i}"><span class="dico">⊙</span>${loc.replace(re,'<mark>$1</mark>')}</div>`).join('');
  dd.classList.add('open');ddHi=-1;
}
function closeDd(){document.getElementById('ssDd').classList.remove('open');ddHi=-1}
function onKey(e){
  const items=document.querySelectorAll('.dd-item');
  if(e.key==='ArrowDown'){e.preventDefault();items.forEach(it=>it.classList.remove('hi'));ddHi=Math.min(ddHi+1,items.length-1);if(items[ddHi]){items[ddHi].classList.add('hi');document.getElementById('streetInput').value=items[ddHi].dataset.loc}}
  else if(e.key==='ArrowUp'){e.preventDefault();items.forEach(it=>it.classList.remove('hi'));ddHi=Math.max(ddHi-1,-1);if(ddHi>=0&&items[ddHi]){items[ddHi].classList.add('hi');document.getElementById('streetInput').value=items[ddHi].dataset.loc}}
  else if(e.key==='Enter'){closeDd();startFeed()}
  else if(e.key==='Escape'){closeDd()}
}
document.addEventListener('click',e=>{if(!e.target.closest('.ss-wrap'))closeDd()});

// ═══════════════════════════════════════════════
// START / BOOT / LAUNCH
// ═══════════════════════════════════════════════
function startFeed(){
  const v=document.getElementById('streetInput').value.trim();
  if(!v){const i=document.getElementById('streetInput');i.style.borderColor='var(--red)';setTimeout(()=>i.style.borderColor='',1500);return}
  closeDd(); S.loc=v;
  document.getElementById('searchScreen').classList.add('out');
  setTimeout(runBoot,450);
}
function goBack(){
  S.timers.forEach(clearInterval); S.timers=[];
  if(S.fid){cancelAnimationFrame(S.fid);S.fid=null}
  S.logs=[];S.chartLabels=[];S.chartData={n:[],s:[],e:[],w:[]};
  S.startTime=0;S.vehicles=[];S.ns={ph:'green',t:38};S.ew={ph:'red',t:18};
  scenarioIdx=0; scenarioChangeTimer=0;
  document.getElementById('dashboard').classList.remove('on'); // back to display:none
  document.getElementById('bootScreen').classList.add('gone');
  document.getElementById('blFill').style.width='0';
  for(let i=0;i<6;i++){const e=document.getElementById('bl'+i);if(e)e.classList.remove('on')}
  document.getElementById('blLoc').classList.remove('on');
  document.getElementById('searchScreen').classList.remove('out');
  document.getElementById('streetInput').value='';
  if(analyInst){analyInst.destroy();analyInst=null}
}
function runBoot(){
  const bs=document.getElementById('bootScreen');
  bs.classList.remove('gone');
  requestAnimationFrame(()=>bs.classList.add('vis'));
  const bl=document.getElementById('blLoc');
  bl.textContent=S.loc.toUpperCase();
  setTimeout(()=>bl.classList.add('on'),80);
  setTimeout(()=>document.getElementById('blFill').style.width='100%',180);
  for(let i=0;i<6;i++)setTimeout(()=>document.getElementById('bl'+i).classList.add('on'),300+i*440);
  setTimeout(launch,3100);
}
function launch(){
  S.startTime=Date.now();
  const bs=document.getElementById('bootScreen');
  bs.classList.remove('vis'); setTimeout(()=>bs.classList.add('gone'),320);

  // Show dashboard — display:flex is immediate (no opacity transition)
  document.getElementById('dashboard').classList.add('on');

  initCharts();
  updateSigUI(); updateFcast();
  addLog('decide',`Connected to ${S.loc} — scanning all lanes`);
  addLog('action','YOLOv8 loaded: 640×640 · conf≥0.45 · 80 classes');
  addLog('pred','Scenario 1/6: North heavy — AI extending NS green time');

  S.timers.push(setInterval(tickSig,1000));
  S.timers.push(setInterval(softUpdateData,2800));
  S.timers.push(setInterval(autoLog,4200));
  S.timers.push(setInterval(()=>{
    document.getElementById('sbLat').textContent=(7+Math.floor(Math.random()*18))+'ms';
    const fps=22+Math.floor(Math.random()*4);
    document.getElementById('sbFps').textContent='FPS: '+fps;
    document.getElementById('hudFps').textContent=fps;
    document.getElementById('hudCf').textContent=(0.85+Math.random()*.12).toFixed(2);
  },2100));

  // Use 200ms timeout — by then the browser has painted and layout dimensions are real
  setTimeout(()=>{
    initCanvas();          // sets canvas.width/height from clientWidth/clientHeight
    applyScenario(SCENARIOS[0]);  // spawns vehicles using real G values
    drawLoop();            // starts rAF loop
  }, 200);
}

// ═══════════════════════════════════════════════
// DATA UPDATES (soft drift between scenarios)
// ═══════════════════════════════════════════════
function softUpdateData(){
  // Gentle drift around scenario target
  const sc=currentScenario;
  const d=()=>(Math.random()-.5)*1.5;
  S.lane.n=Math.max(3,Math.min(32,sc.n+d()*2));
  S.lane.s=Math.max(3,Math.min(28,sc.s+d()*2));
  S.lane.e=Math.max(2,Math.min(24,sc.e+d()*2));
  S.lane.w=Math.max(2,Math.min(22,sc.w+d()*2));
  S.veh=Math.round((S.lane.n+S.lane.s+S.lane.e+S.lane.w)*2.1);
  S.wait=Math.max(25,S.wait+(Math.random()-.5)*6);
  updateDensityDisplay();
  updateChartData();
  updateFcast();
  updateHudVeh();
}
function updateHudVeh(){
  S.veh=Math.round((S.lane.n+S.lane.s+S.lane.e+S.lane.w)*2.1);
  document.getElementById('hudV').textContent=S.veh;
  document.getElementById('smV').textContent=S.veh;
  const wm=Math.floor(S.wait/60),ws=Math.round(S.wait%60);
  document.getElementById('hudWt').textContent=wm+'m '+ws+'s';
  document.getElementById('smW').textContent=wm+'m '+ws+'s';
}

function cls(v){return v>=20?'hi':v>=12?'med':'lo'}
function clrOf(c){return{hi:'var(--red)',med:'var(--warn)',lo:'var(--green)'}[c]}
function lblOf(c){return{hi:'HIGH',med:'MED',lo:'LOW'}[c]}

function updateDensityDisplay(){
  document.getElementById('densityRows').innerHTML=
    [['LANE NORTH',S.lane.n],['LANE SOUTH',S.lane.s],['LANE EAST',S.lane.e],['LANE WEST',S.lane.w]].map(([nm,v])=>{
      const c=cls(v),col=clrOf(c),lbl=lblOf(c),pct=Math.round(v/32*100);
      return `<div class="dn-row">
        <div class="dn-name">${nm}</div>
        <div class="dn-bar"><div class="dn-fill" style="width:${pct}%;background:${col}"></div></div>
        <div class="dn-count" style="color:${col}">${lbl} - ${Math.round(v)} vehicles</div>
      </div>`;
    }).join('');
}
function updateChartData(){
  if(S.chartLabels.length>30){S.chartLabels.shift();['n','s','e','w'].forEach(k=>S.chartData[k].shift())}
  const now=new Date();
  S.chartLabels.push(pad(now.getMinutes())+':'+pad(now.getSeconds()));
  S.chartData.n.push(Math.round(S.lane.n)); S.chartData.s.push(Math.round(S.lane.s));
  S.chartData.e.push(Math.round(S.lane.e)); S.chartData.w.push(Math.round(S.lane.w));
  if(analyInst) analyInst.update('none');
}
function updateFcast(){
  S.fcast=Array(10).fill(0).map(()=>Math.random());
  document.getElementById('fcBars').innerHTML=S.fcast.map(v=>{
    const col=v>.65?'var(--red)':v>.4?'var(--warn)':'var(--green)';
    const h=Math.max(5,Math.round(v*44));
    return `<div class="fc-bar" style="height:${h}px;background:${col};opacity:.82"></div>`;
  }).join('');
}

// ═══════════════════════════════════════════════
// CHART
// ═══════════════════════════════════════════════
function initCharts(){
  // Seed initial data
  for(let i=30;i>=0;i--){
    S.chartLabels.push('-'+i+'s');
    S.chartData.n.push(10+Math.random()*18); S.chartData.s.push(8+Math.random()*14);
    S.chartData.e.push(5+Math.random()*12);  S.chartData.w.push(4+Math.random()*11);
  }
  const ac=document.getElementById('analyticsChart').getContext('2d');
  analyInst=new Chart(ac,{
    type:'line',
    data:{labels:S.chartLabels, datasets:[
      {label:'Lane A (NB)',data:S.chartData.n,borderColor:'#00CFFF',backgroundColor:'rgba(0,207,255,.06)',borderWidth:1.5,pointRadius:0,tension:.45,fill:true},
      {label:'Lane B (SB)',data:S.chartData.s,borderColor:'#FFB300',backgroundColor:'rgba(255,179,0,.06)',borderWidth:1.5,pointRadius:0,tension:.45,fill:true},
      {label:'Lane (SG)', data:S.chartData.e,borderColor:'#FF3D3D',backgroundColor:'rgba(255,61,61,.06)', borderWidth:1.5,pointRadius:0,tension:.45,fill:true},
      {label:'West',      data:S.chartData.w,borderColor:'#39FF87',backgroundColor:'rgba(57,255,135,.06)',borderWidth:1.5,pointRadius:0,tension:.45,fill:true},
    ]},
    options:{
      responsive:true, maintainAspectRatio:false,
      animation:{duration:350},
      layout:{padding:{top:4,bottom:2,left:2,right:4}},
      plugins:{
        legend:{display:true,position:'top',
          labels:{color:'#6A8BA8',boxWidth:22,boxHeight:1.5,font:{size:10,family:'Share Tech Mono'},padding:14,usePointStyle:false}},
        tooltip:{mode:'index',intersect:false,backgroundColor:'rgba(7,8,13,.94)',
          borderColor:'#17222F',borderWidth:1,titleColor:'#C4D8EE',bodyColor:'#6A8BA8',
          titleFont:{family:'Share Tech Mono',size:10},bodyFont:{family:'Share Tech Mono',size:9}}
      },
      scales:{
        x:{display:true,ticks:{display:false,maxTicksLimit:0},grid:{color:'rgba(23,34,47,.5)',lineWidth:.5},border:{display:false}},
        y:{display:true,min:0,max:35,
          ticks:{color:'#35495E',font:{size:9,family:'Share Tech Mono'},stepSize:5,maxTicksLimit:8},
          grid:{color:'rgba(23,34,47,.5)',lineWidth:.5},border:{display:false}}
      }
    }
  });
}

// ═══════════════════════════════════════════════