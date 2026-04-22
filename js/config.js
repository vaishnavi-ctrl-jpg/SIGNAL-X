// ═══════════════════════════════════════════════
// LOCATION DATA
// ═══════════════════════════════════════════════
const LOCS=['Wardha Road Junction, Nagpur','Zero Mile Chowk, Nagpur','Sitabuldi Flyover, Nagpur','Dharampeth Square, Nagpur','Bajaj Nagar Square, Nagpur','Hingna Road Signal, Nagpur','Amravati Road Flyover, Nagpur','Trimurti Nagar Square, Nagpur','Cotton Market Signal, Nagpur','Itwari Station Square, Nagpur','Sadar Square, Nagpur','Silk Board Junction, Bengaluru','Hebbal Flyover, Bengaluru','KR Puram Signal, Bengaluru','MG Road Junction, Bengaluru','Marathahalli Bridge, Bengaluru','Electronic City Toll, Bengaluru','Whitefield Signal, Bengaluru','FC Road Signal, Pune','Shivajinagar, Pune','MG Road Junction, Pune','Hinjewadi Junction, Pune','Kothrud Signal, Pune','Marine Drive Signal, Mumbai','Andheri Flyover, Mumbai','Thane Junction, Mumbai','Dadar TT Circle, Mumbai','Bandra Signal, Mumbai','Connaught Place, Delhi','India Gate Roundabout, Delhi','Nehru Place Signal, Delhi','Dwarka Expressway, Delhi','Rajiv Chowk, Delhi','T. Nagar Junction, Chennai','Guindy Signal, Chennai','Koyambedu Junction, Chennai','Anna Salai Signal, Chennai','Hitech City Signal, Hyderabad','Jubilee Hills Checkpost, Hyderabad','Secunderabad Station, Hyderabad','Kukatpally Y Junction, Hyderabad','Salt Lake Sector V, Kolkata','Park Street Signal, Kolkata','Howrah Bridge, Kolkata','Rashbehari Avenue, Kolkata'];
const PRESETS=['Wardha Road Junction, Nagpur','Zero Mile Chowk, Nagpur','Silk Board Junction, Bengaluru','MG Road Junction, Pune','Marine Drive Signal, Mumbai','Connaught Place, Delhi','T. Nagar Junction, Chennai','Hitech City Signal, Hyderabad'];

// ═══════════════════════════════════════════════
// CONGESTION SCENARIOS — 6 random patterns
// Each pattern: which lanes are heavy (H), medium (M), low (L)
// This drives both vehicle spawn count AND signal green time
// ═══════════════════════════════════════════════
const SCENARIOS = [
  {name:'North heavy',   n:28, s:10, e:8,  w:7 },
  {name:'South heavy',   n:9,  s:27, e:11, w:8 },
  {name:'East heavy',    n:10, s:9,  e:26, w:8 },
  {name:'West heavy',    n:8,  s:10, e:9,  w:25},
  {name:'NS both heavy', n:24, s:22, e:7,  w:6 },
  {name:'EW both heavy', n:7,  s:8,  e:23, w:22},
];
let scenarioIdx = 0;
let currentScenario = {...SCENARIOS[0]};
let scenarioChangeTimer = 0; // seconds until next scenario change

// ═══════════════════════════════════════════════
// STATE
// ═══════════════════════════════════════════════
const S={
  loc:'',
  lane:{n:24, s:10, e:8, w:7},
  ns:{ph:'green', t:38}, ew:{ph:'red', t:18},
  veh:0, wait:130,
  logs:[], logIdx:0,
  chartLabels:[], chartData:{n:[],s:[],e:[],w:[]},
  fcast:Array(10).fill(0).map(()=>Math.random()),
  vehicles:[], fid:null, timers:[], startTime:0,
};
let analyInst, canvas, ctx2;
let ddHi=-1;
// Canvas intersection geometry (computed on resize)
let G = {};

// ═══════════════════════════════════════════════