// ─────────────────────────────────────────────────────────────────────────────
// COSMOVERSE · Solar System Explorer — main scene, camera, modes and controls
// 太阳系交互探索 —— 场景、相机、模式与交互
//   Modes: overview (orbits) · lineup (true sizes side by side) · focus (one body)
//   Inputs: mouse / touch, hand gestures (camera), voice + text (Ask Cosmo)
// ─────────────────────────────────────────────────────────────────────────────
import { setLanguage, initialLanguage, onLanguage, voiceCode } from './i18n.js';
import * as T from 'three';
import { SUN, PLANETS, byId, orbitUnits } from './data.js';
import { buildPlanet, buildSun, buildStars, buildAsteroidBelt, orbitLine, upgradeTexture, buildParticles, buildRingParticles, applyMaps, setVenusSurface } from './bodies.js';
import { loadMaps } from './maps.js';
import { HandTracker, GESTURE_COLORS } from './gestures.js';
import { initChat } from './chat.js';
import { VRC_UI, vrQuestions, placeId, panelText, errorLine, shouldCloseOnLower } from './vrcosmo.js';
import { EVENTS } from './events.js';
import { GUIDE_UI, GUIDES, GUIDE_MODES, guideMode } from './guide.js';
import { NEWS, NEWS_UI, newestNews, unseenCount } from './news.js';
import { WHAT_UI, whatQuestion } from './what.js';
import { CAL_UI, upcoming, countdown, fmtDate } from './calendar.js';
import { canListen, stopListening, stopSpeaking } from './voice.js';
import { buildHighlights, HIGHLIGHTS, moonPT } from './highlights.js';
import { initHabitability } from './habitability.js';
import { narrate, stopNarration, sfx, voiceStatus, speakingKey, setNarration, NARRATION_UI } from './narration.js';
import { createIntros } from './intros.js';
import { initHeadMenu } from './headmenu.js';
import { createFavs, FAV_UI } from './favs.js';
import { ringInfo } from './textures.js';
import { SCALES, UI as SUI, factorBetween, fmtFactor } from './scale.js';
import { initXR } from './xr.js';
import { MR_UI } from './mr.js';
import { LEVELS, createJourney, levelById, levelIndex, outerLevel, innerLevel, pathFrom, edgeStep, decayEdge, quad, tr, eyebrowText, ladderRows, ladderTarget, SCALE_NOTE, UI as JUI, pointsMaterial } from './journey.js';
import { PIECES } from './pieces/index.js';
import { initWelcome } from './welcome.js';
import { levelSpeech, firstSentence } from './voice-clips.js';
import { NARRATION } from './narration-text.js';
import { RANKS, LOG_UI, streakText, fill, rankOf, nextRank, dayKey, placeOfDay, tomorrowKey, nextStreak, liveStreak, addStamp } from './logbook.js';
import { MISSIONS, COLL_UI, COLLECTIONS, GALAXY_PIECES, NEBULA_PIECES, collectionProgress, newlyComplete, weekKey, weekMissions, completeMissions, doneCount } from './collections.js';
import { LANDMARKS } from './landmarks.js';
import { buildPack, SRC_UI } from './cosmofacts.js';
import { parseVoiceCommand, buildNames, VC_SAY, VC_UI } from './voicecmd.js';
import { UT_UI, UT_MAX_STOPS, UT_MAX_TEXT, UT_MAX_TITLE, encodeTour, tourFromHash, sanitizeTour } from './usertour.js';
import { createTour, TOUR_UI } from './tour.js';
import { PM_UI, PM_NOTES, PM_QUIZ, PM_SRC, PM_COLORS, PM_PRESETS, PM_MAX_NAME, KINDS, ATMOS, sanitizePlanet, planetResult, yearDays, planetAge } from './planetmaker.js';
import { demoSteps, DEMO_CARDS, DEMO_BIRTH_YEAR, DEMO_UI } from './demo.js';
import { REF_UI, REF_LICENCES, refsHTML } from './references.js';
import { BS_UI, BS_STARS, BS_MIN_YEAR, birthdayStar, validYear, bsFill, fmtLy } from './birthday.js';
import { ME_UI, ME_SRC, ME_LEVELS, roundPlace, namesFrom, placeLine, spherePoint, spinToFace } from './me.js';
import { MERGE_UI, MERGE_SRC, SIM_END, createMergerSim, gyrAt, stageAt, whenText } from './merger.js';
import { HARP_UI, HARP_PERIODS, HARP_PERIODS_SRC, RESONANCE_SRC, MOONS, noteForPeriod, noteName, crossed, ringDistance, moonBeats, createHarp } from './harp.js';
const $ = s => document.querySelector(s), clamp = T.MathUtils.clamp, bi = window.bi;
const cap = s => s.charAt(0) + s.slice(1).toLowerCase();
const nameOf = p => [cap(p.en), p.zh, cap(p.es), cap(p.pt)];   // [en, zh, es, pt]
const wrapPI = a => ((a + Math.PI) % (2 * Math.PI) + 2 * Math.PI) % (2 * Math.PI) - Math.PI;
const ease = t => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

/* ───────── Renderer & scene · 渲染与场景 ───────── */
const renderer = new T.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(devicePixelRatio, 1.75)); renderer.setSize(innerWidth, innerHeight);
renderer.outputColorSpace = T.SRGBColorSpace; renderer.toneMapping = T.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.1;
document.body.prepend(renderer.domElement);
const scene = new T.Scene(); scene.background = new T.Color('#02050b');
const camera = new T.PerspectiveCamera(42, innerWidth / innerHeight, 0.01, 8000);
scene.add(new T.AmbientLight(0x9fb4d0, 0.1));
scene.add(new T.PointLight(0xfff3e2, 3.1, 0, 0));          // the Sun lights everything, no fall-off
const stars = buildStars(); scene.add(stars);   // hidden in mixed reality (your room is the backdrop) · 混合现实中隐藏

/* ───────── Bodies · 天体 ───────── */
const sun = buildSun(SUN); scene.add(sun.anchor);
const planets = PLANETS.map((p, i) => {
  const b = buildPlanet(p); b.orbit = orbitUnits(p.au); b.angle = i * 2.39 + 0.6;
  b.line = orbitLine(b.orbit); scene.add(b.anchor, b.line); return b;
});
const bodies = [sun, ...planets], bodyById = Object.fromEntries(bodies.map(b => [b.p.id, b]));
const belt = buildAsteroidBelt(orbitUnits(2.2), orbitUnits(3.3)); scene.add(belt);
bodies.forEach(b => { b.tint = '#ffffff'; b.glow = 0.14; b.spinOn = true; b.anchor.position.set(b.orbit ? Math.cos(b.angle) * b.orbit : 0, 0, b.orbit ? Math.sin(b.angle) * b.orbit : 0); });

// Scale journey: zoom out past the Solar System to the universe · 尺度之旅
// Header buttons' rect for the journey label layout, re-read at most twice a second (language and size change it) · 顶部按钮区域（缓存）
let headBox = null, headAt = -1e9;
function headRect() {
  const now = performance.now(); if (now - headAt < 500) return headBox; headAt = now;
  const r = document.querySelector('.headbuttons')?.getBoundingClientRect();
  return headBox = r && r.width ? { x: r.left, y: r.top, w: r.width, h: r.height } : null;
}
const journey = createJourney({ T, scene, pieces: PIECES, sizeScale: () => xr.sizeScale(), onOpen: id => select('j:' + id),
  viewHeight: () => { const c = renderer.xr.isPresenting && renderer.xr.getCamera().cameras?.[0]; return c?.viewport?.w || renderer.domElement.height; },
  inXR: () => renderer.xr.isPresenting, hud: headRect });

// Line-up positions: true sizes side by side, starting at the Sun's edge · 按真实大小并排
const lineX = {}; { let x = sun.r + 1.6; for (const b of planets) { const half = b.ring && b.p.id === 'saturn' ? b.r * 2.4 : b.r; x += half; lineX[b.p.id] = x; x += half + 0.9; } lineX.end = x; }

/* ───────── State · 状态 ───────── */
let mode = 'overview', focus = null, paused = false, lineBlend = 0, orbitSpeed = 1;
let sliderSpread = 0, handSpread = 0, expansion = 0, last = performance.now();
const zooms = { overview: 1, lineup: 1, focus: 1, trajectory: 1, journey: 1 };
const rig = { target: new T.Vector3(), logDist: Math.log(300), yaw: 0.6, pitch: 0.55 }, goal = { yaw: 0.6, pitch: 0.55 };
const from = { target: new T.Vector3(), logDist: 0 }; let trans = 1;
const tanHalf = () => Math.tan(T.MathUtils.degToRad(camera.fov / 2));
const fitAspect = () => Math.min(camera.aspect, 1.8);
const baseDist = {
  trajectory: () => 205 / (tanHalf() * fitAspect()),
  overview: () => Math.max(170, 112 / (tanHalf() * fitAspect())),
  lineup: () => ((lineX.end - sun.r * 0.55) / 2) / (tanHalf() * fitAspect()),
  focus: () => {
    const near = focus.r * (focus.isSun ? 2.6 : focus.ring ? 4.6 : 3.3) / Math.min(1, camera.aspect * 0.9);
    if (xr.active()) return near;   // VR keeps its framing · VR 保持原取景
    // the globe (and Saturn's / Uranus's rings, out to their outer edge) must fit the free area: the globe radius stays under
    // ~36% of it, the ring span under ~92% of its width · 星球不超过可用区域的 36%，环的宽度不超过 92%
    const f = focusFrame(), ext = focus.ring ? ringInfo(focus.p.id)?.outer || 1 : 1;
    const R = Math.min(0.36 * Math.min(f.fw, f.fh), 0.46 * f.fw / ext);
    return Math.max(near, focus.r * innerHeight / (2 * R * tanHalf()));
  },
  journey: () => journey.viewRadius() * (journey.piece ? 2 : 1.6) / (tanHalf() * fitAspect()),
};
const zoomLimits = { trajectory: () => [0.45, 4], overview: () => [0.45, baseDist.overview() / (sun.r * 1.9)], lineup: () => [0.6, 6], focus: () => [0.45, focus?.isSun ? 2 : 5], journey: () => journey.piece ? [0.5, 3] : [0.5, 2.4] };
const clampZoom = (z, m = mode) => clamp(z, ...zoomLimits[m]());
const lineCenter = () => (sun.r * 0.55 + lineX.end) / 2;

function startTransition() { camera.fov=mode==='trajectory'?52:42;camera.updateProjectionMatrix(); from.target.copy(rig.target); from.logDist = rig.logDist; trans = 0; }
function goalTarget(out) {
  if (mode === 'focus') return out.copy(focus.anchor.position);
  if (mode === 'lineup') return out.set(lineCenter(), 0, 0);
  if (mode === 'journey') return journey.target(out);
  return out.set(0, 0, 0);
}
const goalDist = () => baseDist[mode]() / zooms[mode];

/* ───────── Labels on screen · 屏幕标签 ───────── */
bodies.forEach(b => {
  const el = document.createElement('button'); el.className = 'tag'; el.type = 'button';
  el.innerHTML = `<span class="ring" style="--c:${b.p.color}"></span><span class="name">${bi(b.p.en, b.p.zh, b.p.es, b.p.pt)}</span>`;
  el.onclick = () => select(b.p.id);
  el.onmouseenter = () => setHover(b.p.id); el.onmouseleave = () => setHover(null);
  document.body.append(el); b.tag = el;
});
let hoverId = null;
function setHover(id) {
  if (id === hoverId) return; hoverId = id; journey?.setHover(id?.startsWith('j:') ? id.slice(2) : null);
  bodies.forEach(b => { b.tag.classList.toggle('hover', b.p.id === id); if (b.line) b.line.material.opacity = b.p.id === id ? 0.75 : 0.3; });
  renderer.domElement.style.cursor = id ? 'pointer' : '';
}

/* ───────── Picking (works for tiny planets too) · 拾取 ───────── */
// Camera position in the world (in VR the camera sits inside the dolly) · 相机世界坐标
const camW = new T.Vector3(), camWorld = () => camera.getWorldPosition(camW);
const v3 = new T.Vector3(), flightPickRay=new T.Raycaster(), flightPickNdc=new T.Vector2();
function screenOf(b) {
  v3.copy(b.anchor.position).project(camera);
  const dist = camWorld().distanceTo(b.anchor.position);
  return { x: (v3.x * 0.5 + 0.5) * innerWidth, y: (-v3.y * 0.5 + 0.5) * innerHeight, r: b.r / (dist * tanHalf()) * innerHeight / 2, front: v3.z < 1 };
}
function pickAt(x, y, minPx = 22) {
  if (mode === 'focus') return null;
  if (mode === 'journey') { const id = journey.pick(camera, x, y, minPx); return id ? 'j:' + id : null; }
  if (mode === 'trajectory') {
    flight.updateMatrixWorld(true);
    flightPickNdc.set(x/innerWidth*2-1,1-y/innerHeight*2);flightPickRay.setFromCamera(flightPickNdc,camera);
    const hits=flightPickRay.intersectObjects(flightItems.map(it=>it.visual),true).filter(hit=>hit.object.material?.visible!==false);
    if(hits.length){let obj=hits[0].object;while(obj && obj.parent!==flight)obj=obj.parent;const item=flightItems.find(it=>it.mesh===obj);if(item)return item.p.id;}
    let best=null,score=Infinity;
    for(const item of flightItems){
      item.mesh.getWorldPosition(v3);const dist=camWorld().distanceTo(v3);v3.project(camera);
      if(v3.z < -1 || v3.z>1)continue;
      const px=(v3.x+1)*innerWidth/2,py=(1-v3.y)*innerHeight/2,reach=Math.max(minPx,item.size/(dist*tanHalf())*innerHeight/2),d=Math.hypot(px-x,py-y);
      const candidate=d/reach+(item.i?0:1);
      if(d<=reach && candidate<score){best=item.p.id;score=candidate;}
    }
    return best;
  }
  let best = null, bestScore = Infinity;
  for (const b of bodies) {
    const s = screenOf(b); if (!s.front) continue;
    const reach = Math.max(minPx, s.r * 1.05), d = Math.hypot(s.x - x, s.y - y);
    if (d > reach) continue;
    const score = d / reach + (b.isSun ? 1 : 0);              // prefer a planet over the Sun behind it
    if (score < bestScore) { bestScore = score; best = b.p.id; }
  }
  return best;
}

/* ───────── Modes · 模式 ───────── */

/* Motion trails: shared time axis, real relative orbital periods, illustrative
   galactic translation. Distances/radii compressed; not an ephemeris. */
const flight = new T.Group(); scene.add(flight); flight.visible = false;
const flightPanel = document.createElement('aside'); flightPanel.className = 'flight-panel';
flightPanel.innerHTML = `<div class="eyebrow">${bi('TRAJECTORY CONTROL','轨迹控制','CONTROL DE TRAYECTORIAS')}</div>
<div class="flight-time" id="flightTime">+0.00 yr</div>
<label>${bi('Time speed','时间速度','Velocidad')} <b id="flightRate">1×</b><input id="flightSpeed" aria-label="Motion speed" type="range" min="0.2" max="4" step="0.2" value="1"></label>
<div class="flight-actions"><button id="flightReset">${bi('Restart','重新开始','Reiniciar')}</button><button id="flightView">${bi('Change angle ↗','切换机位 ↗','Cambiar ángulo ↗')}</button></div>
<p>${bi('Drag for 360° · Scroll to zoom · Click a planet to explore','拖动 360° 旋转 · 滚轮缩放 · 点击行星或名字查看详情','Arrastra para girar · Rueda para zoom · Espacio para pausar')}</p>
<p>${bi('JPL J2000 eccentricities and inclinations, fixed Keplerian ellipses and relative periods. Earth uses the Earth–Moon barycenter approximation. Sizes/distances compressed. Straight solar travel and its direction are illustrative; not a live ephemeris or full Galactic model.','采用 JPL J2000 离心率、轨道倾角与固定开普勒椭圆，保留公转周期比例；地球采用地月质心近似。大小和距离经过压缩。太阳直线前进及其方向为示意，不是实时星历或完整银河运动模型。','Marco móvil ilustrativo. Períodos orbitales relativos reales; distancias comprimidas y cuerpos ampliados. Fases iniciales, velocidad de avance y trayectoria solar recta ilustrativas; no es una efeméride.')}</p>`;
document.body.append(flightPanel);
const trailCount = 1800, trailYears = 12;
let flightTime = 0, flightRate = 1, flightSide = false;

// Real planet surfaces, clouds, atmospheres and Saturn's textured rings.
const flightLight=new T.PointLight(0xffe6bb,700,500,1.3);flight.add(flightLight);
flight.add(new T.HemisphereLight(0xb3dfff,0x080e22,1.8));
const haloCanvas=document.createElement('canvas');haloCanvas.width=haloCanvas.height=128;
const haloCtx=haloCanvas.getContext('2d'), hg=haloCtx.createRadialGradient(64,64,0,64,64,64);
hg.addColorStop(0,'rgba(255,255,255,1)');hg.addColorStop(.08,'rgba(255,235,180,.9)');hg.addColorStop(.24,'rgba(255,184,70,.22)');hg.addColorStop(1,'rgba(255,154,30,0)');haloCtx.fillStyle=hg;haloCtx.fillRect(0,0,128,128);
const haloTexture=new T.CanvasTexture(haloCanvas);
const solarHalo=new T.Sprite(new T.SpriteMaterial({map:haloTexture,color:0xffd6a0,blending:T.AdditiveBlending,transparent:true,depthWrite:false}));solarHalo.scale.set(115,115,1);flight.add(solarHalo);
const flightItems = [SUN,...PLANETS].map((p,i) => {
  const radius = i ? 28 + 13*Math.sqrt(p.au) : 0;
  const original=bodyById[p.id];
  const mesh=new T.Group();flight.add(mesh);
  const visual=original.tilt.clone(true), size=1.6*Math.pow(p.radiusKm/6371,.55); // Compressed size scale preserves ordering and clear differences.
  visual.scale.setScalar(size/original.r);mesh.add(visual);
  const sourceNodes=[],copyNodes=[];original.tilt.traverse(n=>{if(n.isMesh)sourceNodes.push(n)});visual.traverse(n=>{if(n.isMesh)copyNodes.push(n)});
  const positions = new Float32Array(trailCount*3), colors=new Float32Array(trailCount*3), c=new T.Color(p.color);
  for(let j=0;j<trailCount;j++){const age=j/(trailCount-1),fade=Math.pow(age,2.3);colors[j*3]=c.r*fade;colors[j*3+1]=c.g*fade;colors[j*3+2]=c.b*fade;}
  const geo=new T.BufferGeometry();geo.setAttribute('position',new T.BufferAttribute(positions,3));geo.setAttribute('color',new T.BufferAttribute(colors,3));
  const line=new T.Line(geo,new T.LineBasicMaterial({vertexColors:true,transparent:true,opacity:.85,blending:T.AdditiveBlending,depthWrite:false}));line.frustumCulled=false;flight.add(line);
  const sparkCount=900, sparkGeo=new T.BufferGeometry();sparkGeo.setAttribute('position',new T.BufferAttribute(new Float32Array(sparkCount*3),3));
  const ages=new Float32Array(sparkCount);for(let j=0;j<sparkCount;j++)ages[j]=j/(sparkCount-1);sparkGeo.setAttribute('age',new T.BufferAttribute(ages,1));
  const sparks=new T.Points(sparkGeo,new T.ShaderMaterial({uniforms:{tint:{value:c},pulse:{value:0},pixelRatio:{value:Math.min(devicePixelRatio,1.75)}},vertexShader:`attribute float age; varying float vAge; uniform float pixelRatio; void main(){vAge=age;vec4 pos=modelViewMatrix*vec4(position,1.);gl_Position=projectionMatrix*pos;gl_PointSize=clamp((1.8+age*3.5)*pixelRatio*170./max(20.,-pos.z),1.,12.);}`,fragmentShader:`varying float vAge;uniform vec3 tint;uniform float pulse;void main(){float r=length(gl_PointCoord-.5)*2.;if(r>1.)discard;float glow=pow(1.-r,2.);float breathe=.72+.28*sin(vAge*34.-pulse*2.);float alpha=pow(vAge,1.7)*glow*breathe;gl_FragColor=vec4(mix(tint,vec3(1.),pow(vAge,16.)*.65),alpha*.85);}`,transparent:true,blending:T.AdditiveBlending,depthWrite:false}));sparks.frustumCulled=false;flight.add(sparks);
  const label=document.createElement('button');label.type='button';label.className='flight-label';label.innerHTML=bi(p.en.toUpperCase(),p.zh,p.es.toUpperCase(),p.pt.toUpperCase());label.setAttribute('aria-label','Explore '+p.en);label.onclick=()=>select(p.id);label.onmouseenter=()=>setHover(p.id);label.onmouseleave=()=>setHover(null);document.body.append(label);
  return {p,i,radius,size,mesh,line,label,visual,sourceNodes,copyNodes,sparks,sparkCount};
});
// A diagonal flight axis gives the trails a cinematic rising composition.
flight.rotation.set(.12,-.22,.38);
// NASA/JPL Table 1, J2000: e, inclination, mean longitude, perihelion longitude, node.
// Fixed-element educational Kepler model; no secular rates or N-body perturbations.
// https://ssd.jpl.nasa.gov/planets/approx_pos.html
const flightElements={
 mercury:[.20563593,7.00497902,252.25032350,77.45779628,48.33076593],
 venus:[.00677672,3.39467605,181.97909950,131.60246718,76.67984255],
 earth:[.01671123,-.00001531,100.46457166,102.93768193,0],
 mars:[.09339410,1.84969142,-4.55343205,-23.94362959,49.55953891],
 jupiter:[.04838624,1.30439695,34.39644051,14.72847983,100.47390909],
 saturn:[.05386179,2.48599187,49.95424423,92.59887831,113.66242448],
 uranus:[.04725744,.77263783,313.23810451,170.95427630,74.01692503],
 neptune:[.00859048,1.77004347,-55.12002969,44.96476227,131.78422574]
};
const flightOrbitBasis={};
for(const [id,[e,inc,L,peri,node]] of Object.entries(flightElements)){
 const d=Math.PI/180,I=inc*d,O=node*d,w=(peri-node)*d,cw=Math.cos(w),sw=Math.sin(w),co=Math.cos(O),so=Math.sin(O),ci=Math.cos(I),si=Math.sin(I);
 flightOrbitBasis[id]={e,M0:(L-peri)*d,u:[cw*co-sw*so*ci,cw*so+sw*co*ci,sw*si],v:[-sw*co-cw*so*ci,-sw*so+cw*co*ci,cw*si]};
}
// Look along the orbital plane's normal, rather than along translation.
// This changes only the viewpoint: circular orbits are not stretched to look round.
flight.updateMatrixWorld(true);
const orbitFacing=new T.Vector3(.5,0,-Math.sqrt(.75)).applyQuaternion(flight.quaternion).normalize();
const flightFaceYaw=Math.atan2(orbitFacing.x,orbitFacing.z),flightFacePitch=Math.asin(orbitFacing.y);
function flightPosition(item,t,out) {
 const drift=95+(t-flightTime)*22;
 if(!item.i)return out.set(drift,0,0);
 const o=flightOrbitBasis[item.p.id],M=wrapPI(o.M0+t*365.25/item.p.periodDays*Math.PI*2);
 let E=M;for(let k=0;k<5;k++)E-=(E-o.e*Math.sin(E)-M)/(1-o.e*Math.cos(E));
 const x=item.radius*(Math.cos(E)-o.e),y=item.radius*Math.sqrt(1-o.e*o.e)*Math.sin(E);
 const X=o.u[0]*x+o.v[0]*y,Y=o.u[1]*x+o.v[1]*y,Z=o.u[2]*x+o.v[2]*y;
 // Orthonormal basis: preserve orbital shape in 3D; translation stays illustrative.
 return out.set(drift+X*Math.sqrt(.75)+Z*.5,Y,X*.5-Z*Math.sqrt(.75));
}
function updateFlight(dt) {
  const active=mode==='trajectory'; flight.visible=active;flightPanel.style.display=active?'block':'none';
  $('#trajectory').classList.toggle('active',active);$('#trajectory').setAttribute('aria-pressed',active);
  bodies.forEach(b=>b.anchor.visible=!active&&mode!=='journey');belt.visible=!active&&mode!=='journey';
  flightItems.forEach(item=>item.label.style.display='none');
  if(!active)return;
  if(!paused) flightTime+=dt*.35*flightRate;
  $('#flightTime').textContent='+'+flightTime.toFixed(2)+' '+({zh:'年',es:'años',pt:'anos'}[document.documentElement.dataset.lang]||'yr');
  for(const item of flightItems){
    flightPosition(item,flightTime,item.mesh.position);
    item.visual.rotation.y=paused?item.visual.rotation.y:item.visual.rotation.y+dt*.16;
    item.sourceNodes.forEach((n,j)=>{if(item.copyNodes[j])item.copyNodes[j].material=n.material;});
    item.line.material.opacity=hoverId===item.p.id ? 1 : .62+.22*Math.sin(flightTime*1.8+item.i*.7);
    item.label.classList.toggle('hover',hoverId===item.p.id);
    item.sparks.material.uniforms.pulse.value=flightTime*3;
    const sparkArr=item.sparks.geometry.attributes.position.array;
    for(let j=0;j<item.sparkCount;j++){
      const age=j/(item.sparkCount-1),t=flightTime-trailYears*(1-age);flightPosition(item,t,tv);
      const spread=(1-age)*1.8,seed=j*12.9898+item.i*78.233;
      tv.x+=Math.sin(seed)*spread;tv.y+=Math.sin(seed*1.7)*spread;tv.z+=Math.cos(seed*2.3)*spread;tv.toArray(sparkArr,j*3);
    }
    item.sparks.geometry.attributes.position.needsUpdate=true;
    if(!item.i){solarHalo.position.copy(item.mesh.position);flightLight.position.copy(item.mesh.position);solarHalo.material.opacity=.7+.12*Math.sin(flightTime*4);}

    const arr=item.line.geometry.attributes.position.array;
    for(let j=0;j<trailCount;j++){flightPosition(item,flightTime-trailYears*(1-j/(trailCount-1)),tv);tv.toArray(arr,j*3);}
    item.line.geometry.attributes.position.needsUpdate=true;
    flight.updateMatrixWorld(true);item.mesh.getWorldPosition(tv);tv.project(camera);
    if(tv.z<1 && Math.abs(tv.x)<.98 && Math.abs(tv.y)<.95){
      item.mesh.getWorldPosition(orbitPos);
      const labelOffset=item.size/(camWorld().distanceTo(orbitPos)*tanHalf())*innerHeight/2+10;
      item.label.style.display='block';item.label.style.transform=`translate(${(tv.x+1)*innerWidth/2}px,${(1-tv.y)*innerHeight/2+labelOffset}px) translateX(-50%)`;
    }
  }
}
function trajectory(){
  if(mode==='trajectory'){home();return;}
  sfx('warp'); stopNarration();
  mode='trajectory';focus=null;planets.forEach(b=>{if(!b.hiRes)upgradeTexture(b,1024);});zooms.trajectory=1;startTransition();goal.yaw=flightFaceYaw;goal.pitch=flightFacePitch;flightPreset=0;
  document.body.className=document.body.className.replace(/\bmode-\w+/g,'')+' mode-trajectory';
  $('#info').classList.add('hidden');setHover(null);hideParticles();showHighlights(null);highlightNav(null);setIntro('trajectory');chat?.refresh();
}
$('#trajectory').onclick=trajectory;
$('#flightSpeed').oninput=e=>{flightRate=+e.target.value;$('#flightRate').textContent=flightRate.toFixed(1)+'×';};
$('#flightReset').onclick=()=>{flightTime=0;};
let flightPreset=0;
$('#flightView').onclick=()=>{const views=[[flightFaceYaw,flightFacePitch],[flightFaceYaw-.35,flightFacePitch+.2],[1.2,.55],[-.8,-.45],[.1,1.45]];flightPreset=(flightPreset+1)%views.length;[goal.yaw,goal.pitch]=views[flightPreset];};

let tour = null;   // Tour with Cosmo (created below) · 游览
let quietUntil = 0;   // ?start=<planet>: skip the planet's narration at load · 启动时不朗读
let whatNow = null, whatVR = false, whatHinted = false, guideVR = false, logVR = false, refsVR = false, pmVR = false, bsVR = false, harpOn = false, mergeOn = false;   // "What is this?": { b, it } in the card / on the VR panel (declared early: showHighlights runs at start) · 当前对象   // ?start=<planet>: skip the planet's narration at load · 启动时不朗读
function home() {
  if (mode === 'overview') return;
  sfx('whoosh-out'); stopNarration();
  mode = 'overview'; focus = null; startTransition(); zooms.overview = 1;
  goal.pitch = 0.55; goal.yaw = rig.yaw;
  $('#info').classList.add('hidden'); document.body.className = document.body.className.replace(/\bmode-\w+/g, '') + ' mode-overview';
  setIntro('overview'); highlightNav(null); hideParticles(); showHighlights(null); chat?.refresh();
}
function lineup() {
  if (mode === 'lineup') { home(); return; }
  sfx('warp'); stopNarration();
  mode = 'lineup'; focus = null; startTransition(); zooms.lineup = 1;
  goal.yaw = rig.yaw + wrapPI(0 - rig.yaw); goal.pitch = 0.06;
  $('#info').classList.add('hidden'); document.body.className = document.body.className.replace(/\bmode-\w+/g, '') + ' mode-lineup';
  setIntro('lineup'); highlightNav(null); hideParticles(); showHighlights(null); chat?.refresh();
}
function select(id) {
  guideVR = false;   // opening something closes the VR guide panel · 打开对象时关闭 VR 指南
  if (!id) return home();
  if (id.startsWith('j:')) return openPiece(id.slice(2));
  const b = bodyById[id]; if (!b) return;
  if (mode === 'focus' && focus === b) return;
  // Whoosh in, then Cosmo introduces the planet once the camera arrives · 飞入音效后语音介绍
  sfx('whoosh-in'); stopNarration(); setTimeout(() => { if (performance.now() > quietUntil && mode === 'focus' && focus === b && !(tour?.active && !tour.paused)) narrate(id); }, 1400);   // the tour speaks its own line · 游览时由游览朗读
  mode = 'focus'; focus = b; startTransition(); zooms.focus = 1; sliderSpread = 0; handSpread = 0;
  // Start on the sunlit side, a little off-axis, so the day/night line shows · 从向阳面略偏处观察
  // use the orbit position, not the line-up spot, so we land on the day side · 以轨道位置计算向阳面
  const px = b.orbit ? Math.cos(b.angle) * b.orbit : 0, pz = b.orbit ? Math.sin(b.angle) * b.orbit : 0, sunYaw = b.isSun ? rig.yaw : Math.atan2(-px, -pz) + (b.p.id === 'earth' ? 1.05 : 0.65);   // Earth: the day/night line across the globe (Pamela's wallpaper) · 地球：晨昏线横穿球面
  goal.yaw = rig.yaw + wrapPI(sunYaw - rig.yaw); goal.pitch = b.isSun ? 0.2 : b.p.id === 'earth' ? 0.05 : 0.16;
  document.body.className = document.body.className.replace(/\bmode-\w+/g, '') + ' mode-focus';
  setHover(null); highlightNav(id); renderInfo(b); setIntro('focus', b); hideParticles();
  setTimeout(() => showHighlights(b), 60);
  if (!b.isSun) setTimeout(() => { if (!b.realMap) upgradeTexture(b); ensureParticles(b); }, 30);
  chat?.refresh();
}
function cycle(step) {
  const ids = bodies.map(b => b.p.id), i = focus ? ids.indexOf(focus.p.id) : step > 0 ? -1 : 0;
  select(ids[(i + step + ids.length) % ids.length]);
}
function setPaused(v) { paused = v; $('#pause').innerHTML = paused ? bi('Resume Orbits', '恢复公转') : bi('Pause Orbits', '暂停公转'); }

function ensureParticles(b) {
  if (b.particles) return;
  b.particles = buildParticles(b.texCanvas, b.r, b.p.id === 'earth' || b.p.id === 'mars' ? 14000 : 10000);
  b.particles.material.opacity = b.glow; b.spin.add(b.particles);
  if (b.p.id === 'saturn') { b.ringParticles = buildRingParticles('saturn', b.r); b.tilt.add(b.ringParticles); }
}
// Rebuild a planet's particles after its texture changes (real maps, Venus radar view).
function refreshParticles(b) {
  if (!b.particles) return;
  b.spin.remove(b.particles); b.particles.geometry.dispose(); b.particles.material.dispose(); b.particles = null;
  if (b.ringParticles) { b.tilt.remove(b.ringParticles); b.ringParticles.geometry.dispose(); b.ringParticles = null; }
  ensureParticles(b); hideParticles();
}
/* Highlights: moons, living features, spacecraft (built the first time a body is opened) · 亮点 */
function showHighlights(b) {
  if (whatNow && whatNow.b !== b) closeWhat();   // the card belongs to the open planet · 卡片只属于当前行星
  if (whatNow && mode !== 'focus') closeWhat();
  if (whatVR && (!b || mode !== 'focus' || whatVR !== b.p.id)) whatVR = false;   // the VR list closes with its planet · VR 列表随行星关闭
  // once per visit, outside VR and tours: say the labels can be clicked · 每次访问提示一次
  if (b && mode === 'focus' && !whatHinted && !xr.active() && !tour?.active) { whatHinted = true; setTimeout(() => { if (mode === 'focus' && !whatNow) noticeQ(WHAT_UI.hint, 5000); }, 2600); }
  for (const x of bodies) if (x.hl) x.hl.setVisible(x === b && mode === 'focus' && focus === b);
  if (!b || mode !== 'focus' || focus !== b) return;
  if (!b.hl) {
    try {
      b.hl = buildHighlights(b);
      // every label is a button: click it (or point + hold with the webcam hand) for "What is this?" · 每个标签都可点击
      b.hl.items.forEach(it => { const el = document.createElement('button'); el.type = 'button'; el.className = 'mtag ' + it.type; el.innerHTML = bi(...it.label); el.onclick = () => openWhat(b, it); document.body.append(el); it.el = el; });
    } catch (e) { console.warn('Highlights failed for', b.p.id, e); b.hl = { items: [], setVisible() {}, update() {} }; }
  }
  b.hl.setVisible(true);
}
function hideParticles() { bodies.forEach(b => { if (b.particles) b.particles.visible = b === focus; if (b.ringParticles) b.ringParticles.visible = b === focus; }); }

/* ───────── Scale journey · 尺度之旅 ───────── */
const lang = () => document.documentElement.dataset.lang || 'en';
const edge = { out: 0, in: 0, lock: 0 };
// Zoom by a factor; pushing past the limit moves between levels · 缩放；越过边界则切换层级
const zoomKey = () => mode + ':' + (journey.level || '') + ':' + (journey.piece || '');
function zoomBy(f) {
  if (!(f > 0) || f === 1) return;
  const r = edgeStep(edge, zooms[mode], f, zoomLimits[mode]());
  zooms[mode] = r.z;
  if (!r.action || performance.now() < edge.lock || trans < 0.6 || journey.busy) return;
  if (mode === 'overview' && r.action === 'up') goLevel('neighbourhood', 'up');
  else if (mode === 'journey' && journey.piece) { if (r.action === 'up') closePiece(); }
  else if (mode === 'journey') {
    const next = r.action === 'up' ? outerLevel(journey.level) : innerLevel(journey.level);
    if (!next) { noticeQ(JUI.edge, 3000); return; }
    if (next === 'solar-system') home(); else goLevel(next, r.action);
  }
}
function noticeQ(o, ms = 4500) { const s = $('#status'); s.innerHTML = quad(o); s.style.display = 'block'; clearTimeout(notice.t); notice.t = setTimeout(() => s.style.display = 'none', ms); }
function goLevel(id, dir = 'up', quiet = false) {   // quiet: no sound or voice (the opening cover) · 静默：开场封面
  if (!levelById(id)) return;
  if (id === 'solar-system') return home();
  if (!quiet) sfx(dir === 'up' ? 'whoosh-out' : 'whoosh-in'); stopNarration();
  edge.lock = performance.now() + 1500; edge.out = edge.in = 0;
  const wasJourney = mode === 'journey';
  mode = 'journey'; focus = null; journey.go(id, dir); zooms.journey = 1; startTransition();
  if (!wasJourney) { goal.pitch = 0.5; goal.yaw = rig.yaw; }
  document.body.className = document.body.className.replace(/\bmode-\w+/g, '') + ' mode-journey';
  $('#info').classList.add('hidden'); setHover(null); hideParticles(); showHighlights(null); highlightNav(null); setIntro('journey'); chat?.refresh();
  if (!quiet) sayLevel(id);
}
// Cosmo reads the level's blurb once the view settles (skipped when passing through quickly) · 层级稳定后朗读简介
let sayTimer = 0;
function sayLevel(id, wait = 1700, tries = 6) {
  clearTimeout(sayTimer);
  sayTimer = setTimeout(() => {
    if (mode !== 'journey' || journey.level !== id || journey.piece || (tour?.active && !tour.paused)) return;
    if (journey.busy) { if (tries > 0) sayLevel(id, 500, tries - 1); return; }   // still flying: try again shortly · 仍在过渡
    narrate('level-' + id, levelSpeech(levelById(id)?.blurb));
  }, wait);
}
function openPiece(id) {
  const p = journey.pieceData(id); if (!p) return;
  // fly up when the piece's level is bigger than where you are (e.g. a favourite from a planet) · 目标层级更大时向外飞
  if (mode !== 'journey' || journey.level !== p.level) goLevel(p.level, levelIndex(p.level) < levelIndex(mode === 'journey' && journey.level ? journey.level : 'solar-system') ? 'up' : 'down');
  if (journey.piece === id) return;
  sfx('whoosh-in'); stopNarration();
  journey.open(id); zooms.journey = 1; startTransition(); edge.lock = performance.now() + 1200;
  setHover(null); renderPieceInfo(p); setIntro('journey');
  clearTimeout(sayTimer); sayTimer = setTimeout(() => { if (mode === 'journey' && journey.piece === id && !(tour?.active && !tour.paused)) narrate('piece-' + id, p.narration); }, 1400);   // the tour/demo speaks its own line · 游览时由游览朗读
}
function closePiece() {
  if (!journey.piece) return;
  sfx('whoosh-out'); stopNarration(); clearTimeout(sayTimer); journey.close(); zooms.journey = 1; startTransition(); edge.lock = performance.now() + 1200;
  $('#info').classList.add('hidden'); setIntro('journey');
}
// Fist / ⟵ Back / Esc: one step toward the universe cover (see back() above) · 返回：一步步回到宇宙封面
// ⟵ Back / fist during the tour only stops the tour (you stay where you are) · 游览中：返回只结束游览
// Universe cover (Pamela, Nov 16): the app opens on the observable universe; "home" is the cover · 宇宙封面：应用从可观测宇宙开始
// Back steps toward it: piece → level → the universe; planet / line-up / trails → Solar System → the universe · 返回逐步走向封面
const atCover = () => mode === 'journey' && journey.level === 'universe' && !journey.piece;
function cover(quiet) { if (!atCover()) goLevel('universe', 'up', quiet); }
function back() {
  if (tour?.active) { tour.stop(); return; }
  guideVR = false;   // stepping back closes the VR guide panel · 后退时关闭 VR 指南
  if (mode === 'journey' && journey.piece) closePiece(); else if (mode === 'journey' || mode === 'overview') cover(); else home();
}

function renderPieceInfo(p) {
  const accent = p.shape.colors[0];
  document.documentElement.style.setProperty('--accent', accent);
  const host = u => { try { return new URL(u).hostname.replace(/^www\./, ''); } catch { return ''; } };
  $('#info').innerHTML = `
    <div class="jtop"><div class="eyebrow">${quad(p.type)}</div><button id="pieceBack" class="jback">${quad(JUI.back)}</button></div>
    <h2>${quad(p.names)}</h2>
    ${p.whatIs ? `<p class="whatis"><small>${quad(JUI.whatIs)}</small> ${quad(p.whatIs)} ${[p.whatIs.source, ...(p.whatIs.also || [])].map(s => `<a class="src" href="${s.url}" target="_blank" rel="noopener" title="${host(s.url)}">${s.name} ↗</a>`).join(' ')}</p>` : ''}
    ${p.photo ? piecePhoto(p) : ''}
    <p>${quad(p.narration)}</p>
    <div class="facts">${p.facts.map(f => `<div><small>${quad(f.label)}</small><b>${quad(f.value)}</b>${[f.source, ...(f.also || [])].map(s => `<a class="src" href="${s.url}" target="_blank" rel="noopener" title="${host(s.url)}">${s.name} ↗</a>`).join(' ')}</div>`).join('')}</div>
    ${p.youAreHere ? `<p class="feature">◉ ${quad(p.youAreHere)}</p>` : ''}
    <small class="jnote">${quad(SCALE_NOTE)}</small>`;
  $('#info').classList.remove('hidden'); $('#info').scrollTop = 0;
  $('#pieceBack').onclick = closePiece;
  // An image that can't load (offline, host down) hides its figure: never a broken icon · 图片加载失败时隐藏
  const im = $('#info .jphoto img'); if (im) { const hide = () => im.closest('.jphoto').classList.add('gone'); im.onerror = hide; if (im.complete && !im.naturalWidth) hide(); }
}
// Real image of a piece: official screen-size copy, credit + licence as the source asks · 天体的真实图像，附署名与许可
function piecePhoto(p) {
  const ph = p.photo, attr = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const kind = JUI.kind[ph.kind] || JUI.kind.photo, by = [ph.by, ph.year].filter(Boolean).join(' · ');
  return `<figure class="jphoto"><a href="${attr(ph.page)}" target="_blank" rel="noopener" title="${attr(tr(JUI.imgOpen, 'en'))}">` +
    `<img src="${attr(ph.src)}" alt="${attr(tr(p.names, 'en') + (ph.note ? ' — ' + ph.note.en : ''))}" loading="lazy" decoding="async" referrerpolicy="no-referrer"></a>` +
    `<figcaption><b>${quad(kind)}${by ? ' · ' + attr(by) : ''}</b>${ph.note ? ' · ' + quad(ph.note) : ''}<br>` +
    `<span class="cr">${attr(ph.credit)} · <a href="${attr(ph.licenseUrl)}" target="_blank" rel="noopener">${attr(ph.license)}</a></span></figcaption></figure>`;
}
// "You are here" breadcrumb (screen) · 位置指示
const crumb = document.createElement('nav'); crumb.id = 'journeyCrumb'; crumb.className = 'jcrumb'; crumb.setAttribute('aria-label', 'Scale journey');
document.body.append(crumb); let crumbKey = '';
crumb.onclick = e => { const b = e.target.closest('button[data-level]'); if (!b) return; const id = b.dataset.level, cur = mode === 'journey' ? journey.level : 'solar-system';
  if (id === cur) { if (journey.piece) closePiece(); return; } const ids = pathFrom('universe'); goLevel(id, ids.indexOf(id) < ids.indexOf(cur) ? 'up' : 'down'); };
// Keep the breadcrumb on one line: current, next, …, Solar System · 面包屑保持一行
const shortPath = id => { const p = pathFrom(id); return p.length > 4 ? [p[0], p[1], '…', p[p.length - 1]] : p; };
function updateCrumb() {
  const show = mode === 'overview' || mode === 'journey', cur = mode === 'journey' ? journey.level : 'solar-system';
  const key = show + ':' + cur + ':' + mode;
  if (key === crumbKey) return; crumbKey = key;
  crumb.style.display = 'none'; return;   // the bottom bar now shows the levels · 底栏已显示各尺度
  const out = outerLevel(cur);
  crumb.innerHTML = `<span class="lbl">${quad(JUI.here)}:</span>` +
    shortPath(cur).map((id, i) => `${i ? '<i>▸</i>' : ''}${id === '…' ? '<i>…</i>' : `<button type="button" data-level="${id}" class="${id === cur ? 'on' : ''}">${quad(levelById(id).names)}</button>`}`).join('') +
    (out ? `<button type="button" data-level="${out}" class="upbtn" title="${tr(levelById(out).names, 'en')}">⤢</button>` : '') +
    `<small>${mode === 'overview' ? quad(JUI.out) : quad(SCALE_NOTE)}</small>`;
}
// Scale ladder: side menu from the observable universe down to the planets; one click travels there · 尺度阶梯侧边菜单
const ladderBodies = bodies.map(b => ({ id: b.p.id, color: b.p.color, names: Object.fromEntries(['en', 'zh', 'es', 'pt'].map((k, i) => [k, nameOf(b.p)[i]])) }));
const ladderState = () => ({ level: mode === 'journey' && journey.level ? journey.level : 'solar-system', piece: mode === 'journey' ? journey.piece : null,
  body: mode === 'focus' ? focus?.p.id : null, pieces: PIECES, bodies: ladderBodies });
let ladderPending = null;   // a click during a transition runs when it ends (the last click wins) · 过渡中的点击稍后执行
function ladderGo(id, queue = true) {
  if (id === 'toggle') return setLadderOpen(!ladder.classList.contains('open'));
  if (id === 'V:narration') return setNarration(!voiceStatus().enabled);
  if (id === 'U:down') { meDown(); return true; }   // VR: 🧭 Universe → Me · VR：从宇宙到我
  if (id === 'U:up') { meUp(); return true; }   // VR: 🗣 narration on/off · VR：讲解开关
  if (id.startsWith('C:')) return cosmoGo(id);   // VR: Ask Cosmo rows · VR：问 Cosmo
  if (id === 'N:news') { newsVR = !newsVR; if (newsVR) markNewsSeen(); return true; }   // VR: 📰 News · VR：新闻
  if (id.startsWith('N:f')) { const n = newsFlyable()[+id.slice(3)]; if (!n) return false; newsVR = false; id = newsFlyId(n); }
  if (!id.startsWith('N:') && newsVR) newsVR = false;
  if (id === 'R:refs') { refsVR = !refsVR; if (refsVR) logVR = guideVR = calVR = newsVR = false; return true; }   // VR: 📚 Sources & licences (the panels above it in the order close) · VR：来源与许可
  if (id !== 'R:refs' && refsVR) refsVR = false;
  if (!id.startsWith('Z:') && bsVR) bsVR = false;   // any other row closes 🎂 (before the rows that return early) · 其他行关闭生日星
  if (id.startsWith('Y:')) return pmGo(id);   // VR: 🪐 Your planet · VR：你的行星
  if (pmVR) pmVR = false;
  if (id.startsWith('Z:')) return bsGo(id);   // VR: 🎂 Birthday star · VR：生日星
  if (id.startsWith('H:')) return harpGo(id);   // VR: 🎵 Orbit harp · VR：轨道竖琴
  if (id.startsWith('X:')) return mergeGo(id);   // VR: 👏 Galaxy collision · VR：星系碰撞
  if (id === 'O:log') { logVR = !logVR; return true; }   // VR: 📔 Logbook · VR：日志
  if (id === 'O:fly') { logVR = false; id = dailyId() || 'L:universe'; }
  if (/^O:m\d$/.test(id)) { const m = weekMissions(weekKey())[+id.slice(3)]; if (!m) return false; logVR = false; spotHint(m); id = missionFly(m); }   // VR: a weekly mission row · VR：每周任务
  if (!id.startsWith('O:') && logVR) logVR = false;
  if (id === 'G:guide') { guideVR = !guideVR; if (guideVR) Object.assign(vrAsk, { open: false, q: null, a: null, err: null, state: null }); return true; }   // the guide replaces an open Ask panel · 指南替换问答面板   // VR: 🧭 How to move · VR：怎么操作
  if (!id.startsWith('G:') && guideVR) guideVR = false;
  if (id.startsWith('W:')) return whatGo(id);   // VR: ℹ What is this? · VR：这是什么？
  if (id === 'K:cal') { calVR = !calVR; return true; }   // VR: 📅 Coming up · VR：即将到来
  if (!id.startsWith('K:') && calVR) calVR = false;   // any other row closes it · 其他行会关闭它
  if (id.startsWith('K:f')) { const ev = upcoming(EVENTS, new Date(), 3)[+id.slice(3)]; if (!ev) return false; calVR = false; id = calFlyId(ev); }
  if (id === 'FAV:menu') { favOpen = !favOpen; return true; }   // ★ Favourites: open / close the drop-down · 打开/关闭收藏下拉
  if (id === 'S:fav') { toggleFav(); return true; }   // ☆ Save this place (drop-down, VR menu) · 收藏当前地点
  const fromFav = id.startsWith('F:'); if (fromFav) id = id.slice(2);   // a saved place: fly there · 飞往收藏地点
  if (id === 'T:tour') { if (!tour.active) startTour(); else tour.toggle(performance.now()); return true; }   // the tour row · 游览行
  if (!demoOn) tour?.pause(performance.now());   // the visitor picked a place: the tour waits (the video demo moves by itself) · 访客自选地点：游览暂停
  if (journey.busy || trans < 0.6) { if (queue) ladderPending = fromFav ? 'F:' + id : id; return false; }   // hands don't queue: they retry next frame · 手势不排队
  ladderPending = null;
  if (fromFav) favOpen = false;   // close the drop-down only once the pick runs (hands/VR retry next frame) · 真正执行后才关闭下拉
  if (id === 'L:solar-system' && mode !== 'overview') return home();   // from a planet, line-up or a journey level · 回到太阳系总览
  const t = ladderTarget(id, ladderState()); if (!t) return;
  if (t.select) select(t.select); else if (t.open) openPiece(t.open); else if (t.close) closePiece(); else if (t.go) goLevel(t.go, t.dir);
}
const ladder = document.createElement('nav'); ladder.id = 'ladder'; ladder.className = 'ladder'; ladder.setAttribute('aria-label', 'Scale ladder');
ladder.innerHTML = `<button type="button" class="ltoggle" data-go="toggle" aria-expanded="false"><b>⇕</b> <span>${quad(JUI.goTo)}</span></button>
  <div class="lbody"><div class="ltitle"><b>${quad(JUI.goTo)}</b> <span class="lsub">${quad(JUI.ladder)}</span></div><ol></ol><small>${quad(JUI.ladderHint)}</small></div>`;
document.body.append(ladder);
function setLadderOpen(on) { ladder.classList.toggle('open', on); ladder.querySelector('.ltoggle').setAttribute('aria-expanded', String(on)); }
const roomy = () => innerWidth > 760 && innerHeight > 620;
setLadderOpen(roomy());   // open on desktops, a button on phones · 桌面展开，手机折叠
// Desktop: if the open ladder would reach the title/intro, fold it into the button too (checked on resize / new rows only)
// 桌面：展开的阶梯若碰到标题，也折叠成按钮
const introEl = document.querySelector('.intro');
function fitLadder() {
  if (document.body.classList.contains('xr-on')) return;   // hidden in VR: measure again after exit · VR中隐藏，退出后再测
  if (!roomy()) { ladder.classList.remove('tight', 'compact'); return; }
  // 1) full ladder; 2) "compact": hide the planet chips away from the Solar System (the planet dock has them);
  // 3) "tight": fold into the button · 1) 完整 2) 紧凑：隐藏行星小标签 3) 折叠成按钮
  const wasTight = ladder.classList.contains('tight'), wasOpen = ladder.classList.contains('open');
  const bottom = introEl ? introEl.getBoundingClientRect().bottom : 0, fits = () => ladder.getBoundingClientRect().top >= bottom + 10;
  ladder.classList.remove('tight', 'compact'); ladder.classList.add('open');
  if (!fits()) ladder.classList.add('compact');
  const tight = !fits();
  if (tight) ladder.classList.remove('compact');
  ladder.classList.toggle('tight', tight);
  if (tight !== wasTight) setLadderOpen(!tight); else ladder.classList.toggle('open', wasOpen);
}
addEventListener('resize', () => { fitLadder(); });
/* ───────── Scale readout: "This view: about 100,000 light-years across", a "× 100" counter between levels, "Why not to scale?" ───────── */
/* 尺度读数：当前视野大小、层间倍数计数、“为什么不按比例？” */
const scaleEl = $('#scaleRead'), L4 = f => ({ en: f('en'), zh: f('zh'), es: f('es'), pt: f('pt') });
const srcLink = s => `<a class="src" href="${s.url}" target="_blank" rel="noopener" title="${new URL(s.url).hostname}">${s.name} ↗</a>`;
let scaleKey = null, scaleAnim = null;
const scaleLevel = () => mode === 'journey' ? journey.level : mode === 'overview' ? 'solar-system' : null;
function renderScale(id) {
  const s = SCALES[id]; scaleEl.hidden = !s;
  if (s) scaleEl.innerHTML = `<span class="sline"><small>${quad(SUI.view)}</small> ${quad(s.text)} ${srcLink(s.source)}</span>`;   // "Why not to scale?" lives in ☰ More → 📚 References (Pamela, Nov 18: keep it discreet) · 说明移到参考资料
  fitLadder();
}
function scaleTick(now) {
  const id = document.body.classList.contains('demo') ? null : scaleLevel();
  if (id !== scaleKey) {
    const f = scaleKey && id && factorBetween(scaleKey, id); scaleKey = id;
    if (f) scaleAnim = { f, t0: now }; else { scaleAnim = null; renderScale(id); }
  }
  if (!scaleAnim) return;
  const t = now - scaleAnim.t0, k = Math.min(1, t / 1000);   // count for 1 s, then hold the final factor ~0.7 s · 计数 1 秒后停留
  if (t >= 1700) { scaleAnim = null; return renderScale(scaleKey); }
  // Powers-of-ten feel: the factor grows from ×1 to ×N on a log scale · 按对数从 ×1 增长到 ×N
  const n = Math.pow(scaleAnim.f.times, 1 - Math.pow(1 - k, 3)), dir = scaleAnim.f.out ? SUI.out : SUI.in;
  scaleEl.hidden = false; scaleEl.innerHTML = `<span class="scount">${quad(L4(l => `× ${fmtFactor(n, l)} · ${dir[l]}`))}</span>`;
}
ladder.onclick = e => { const x = e.target.closest('[data-unfav]'); if (x) { favs.remove(x.dataset.unfav); noticeQ(FAV_UI.removed, 2200); ladderFocus = 'S:fav'; return; }
  const b = e.target.closest('button[data-go]'); if (b?.dataset.go === 'S:fav' || b?.dataset.go === 'FAV:menu') ladderFocus = b.dataset.go;   // keep keyboard focus across the rebuild · 重建后保持焦点
  if (b) { ladderGo(b.dataset.go); if (b.dataset.go !== 'toggle' && b.dataset.go !== 'S:fav' && b.dataset.go !== 'FAV:menu' && (innerWidth <= 760 || ladder.classList.contains('tight'))) setLadderOpen(false); } };
let ladderKey = '', ladderFocus = null;
let ladderLang = '';
function updateLadder() {
  refreshGuideBtn?.();
  if (ladderLang !== lang()) { ladderLang = lang(); ladder.setAttribute('aria-label', tr(JUI.ladder, ladderLang)); }
  refreshStars(); logTick(currentPlace());
  const here = currentPlace(), rows = ladderRows(ladderState()), key = tourKey() + 'S' + logCount() + 'F' + favs.version + (favOpen ? 'o' : '') + lang() + (here && favs.has(here) ? '*' : '') + (here || '') + rows.map(r => r.id + (r.on ? '*' : r.here ? '+' : '')).join(',');
  // re-fit when the rows, language, mode or webcam state (it hides the intro text) change · 行、语言、模式或摄像头变化时重新适配
  const fitKey = key + lang() + mode + document.body.className;
  if (fitKey !== updateLadder.fit) { updateLadder.fit = fitKey; if (key === ladderKey) fitLadder(); }
  if (key === ladderKey) return; ladderKey = key;
  const btn = r => `<button type="button" data-go="${r.id}"${r.on ? ' aria-current="true"' : ''} class="${r.on ? 'on' : ''}${logBook.stamps[r.id] ? ' seen' : ''}"><i${r.color ? ` style="--c:${r.color}"` : ''}></i>${quad(r.names)}</button>`;
  let html = `<li class="d0 tourrow${tour?.active ? ' on' : ''}"><button type="button" data-go="T:tour"${tour?.active && !tour.paused ? ' class="on"' : ''}><i style="--c:#8bd6ff"></i>${quad(tourLabel())}</button></li>`;   // ▶ Tour with Cosmo on top · 顶部游览按钮
  // a level is a row; its pieces / planets wrap as chips under it · 层级一行，子项为小标签
  rows.forEach((r, i) => {
    if (r.depth === 0) html += `<li class="d0${r.here ? ' here' : ''}${r.on ? ' on' : ''}${r.past ? ' past' : ''}">${btn(r)}`;
    else html += (rows[i - 1].depth === 0 ? '<div class="sub">' : '') + btn(r) + (rows[i + 1]?.depth ? '' : '</div>');
    if (!rows[i + 1]?.depth) html += '</li>';
  });
  html += favRowHTML(here);   // ★ Favourites, last row · 最后一行：收藏
  // keep keyboard focus on the same row across the rebuild (a removed chip's ✕ → "Save this place") · 重建后焦点留在同一行
  const refocus = ladderFocus && ladder.contains(document.activeElement) ? ladderFocus : null;   // only after ☆ / ✕ · 仅在收藏操作后
  ladder.querySelector('ol').innerHTML = html;
  ladder.querySelector('.lbody > small').innerHTML = `${quad(fill(LOG_UI.explored, { n: logCount(), t: logTotal() }))} · ${quad(rankOf(logCount()).name)}`;   // the logbook count · 日志计数
  fitLadder();
  // a scrolling (phone / folded) ladder keeps its bottom row, ★ Favourites, in place when the list opens above it · 滚动的阶梯保持底部行不动
  if (favOpen) { const lb = ladder.querySelector('.lbody'); if (lb && lb.scrollHeight > lb.clientHeight) lb.scrollTop = lb.scrollHeight; }
  if (refocus) {   // the same row, else the first favourites button, else ⇕ if the ladder folded · 同一行，否则第一个收藏按钮，否则 ⇕
    const t = [ladder.querySelector(`[data-go="${refocus}"]`), ladder.querySelector('.favrow button')].find(el => el?.offsetParent);
    (t || ladder.querySelector('.ltoggle'))?.focus();
  }
  ladderFocus = null;
}
/* ───────── My favourites ★: save any place, fly back with one click (ladder, VR menu) · 我的收藏 ───────── */
const favs = createFavs(), FAV_VR_ROWS = 5;
for (const id of favs.list) if (!placeInfo(id)) favs.remove(id);   // places that no longer exist · 移除已不存在的地点
const currentPlace = () => mode === 'focus' && focus ? 'B:' + focus.p.id : mode === 'journey' && journey.piece ? 'P:' + journey.piece
  : mode === 'journey' && journey.level ? 'L:' + journey.level : mode === 'overview' ? 'L:solar-system' : null;   // line-up / trails: no place · 对比/轨迹模式无地点
function placeInfo(id) {
  const k = id[0], v = id.slice(2);
  if (k === 'L') { const lv = levelById(v); return lv && { names: lv.names, color: '#8bd6ff' }; }
  if (k === 'B') { const b = ladderBodies.find(x => x.id === v); return b && { names: b.names, color: b.color }; }
  const p = PIECES.find(x => x.id === v); return p && { names: p.names, color: p.shape?.colors?.[0] };
}
function toggleFav(id = currentPlace()) {
  if (!id || !placeInfo(id)) return;
  const on = favs.toggle(id); noticeQ(on ? FAV_UI.added : FAV_UI.removed, 2600); if (on) sfx('chime');
}
const all4 = o => ['en', 'zh', 'es', 'pt'].map(l => o[l]).join(' / ');
// One row "★ Favourites" at the bottom of the ladder; it opens a drop-down (Pamela, Nov 17) · 阶梯底部一行“收藏”，点开下拉菜单
let favOpen = false;
function favRowHTML(here) {
  const l = lang(), n = favs.list.length, saved = here && favs.has(here);
  const head = `<button type="button" data-go="FAV:menu" class="favhead${favOpen ? ' on' : ''}" aria-expanded="${favOpen}" aria-controls="favMenu"><b aria-hidden="true">★</b> ${quad(FAV_UI.title)}${n ? ` <small>${n}</small>` : ''} <span class="caret" aria-hidden="true">${favOpen ? '▴' : '▾'}</span></button>`;
  if (!favOpen) return `<li class="d0 favrow">${head}</li>`;
  const save = here ? `<button type="button" data-go="S:fav" class="favsave${saved ? ' on' : ''}" aria-pressed="${!!saved}">${saved ? '★' : '☆'} ${quad(saved ? FAV_UI.savedHere : FAV_UI.saveHere)}</button>` : '';
  const items = favs.list.map(id => { const p = placeInfo(id); if (!p) return ''; const name = tr(p.names, l);
    return `<div class="favitem"><button type="button" data-go="F:${id}"><i style="--c:${p.color}"></i>${quad(p.names)}</button><button type="button" class="favx" data-unfav="${id}" aria-label="${tr(FAV_UI.remove, l)}: ${name}" title="${tr(FAV_UI.remove, l)}">✕</button></div>`; }).join('');
  return `<li class="d0 favrow open">${head}<div class="favmenu" id="favMenu" role="group" aria-label="${tr(FAV_UI.title, l)}">${save}${items || `<p class="favempty">${quad(FAV_UI.empty)}</p>`}</div></li>`;
}
// VR ladder panel: the same row last; open, it lists "☆ Save this place" and the newest saved places · VR：同一行，展开后列出
function favMenuRows(l) {
  const here = currentPlace(), saved = here && favs.has(here), n = favs.list.length;
  const head = { id: 'FAV:menu', text: '★ ' + tr(FAV_UI.title, l) + (n ? ` (${n})` : '') + (favOpen ? ' ▴' : ' ▾'), depth: 0, color: '#ffd27a', on: favOpen };
  if (!favOpen) return [head];
  return [head, ...(here ? [{ id: 'S:fav', text: (saved ? '★ ' : '☆ ') + tr(saved ? FAV_UI.savedHere : FAV_UI.saveHere, l), depth: 1, color: '#ffd27a', on: !!saved }] : []),
    // the newest few only, so every VR row stays big enough to point at · 只显示最新几个，保证 VR 行足够大
    ...favs.list.slice(0, FAV_VR_ROWS).map(id => { const p = placeInfo(id); return p && { id: 'F:' + id, text: tr(p.names, l), depth: 1, color: p.color }; }).filter(Boolean)];
}
// A click outside or Esc closes the drop-down · 点击外部或 Esc 关闭下拉
addEventListener('pointerdown', e => { if (favOpen && !e.target.closest?.('.favrow')) favOpen = false; }, true);
addEventListener('keydown', e => { if (favOpen && e.key === 'Escape') { favOpen = false; e.stopImmediatePropagation(); ladderFocus = 'FAV:menu'; } }, true);
// ★ next to the title (intro) and in the info panel (planets, pieces); one delegated click · 标题旁和信息面板中的星标
const favStar = document.createElement('button'); favStar.type = 'button'; favStar.id = 'favStar'; favStar.className = 'favstar';
$('#headline').after(favStar);
let starKey = '';
function refreshStars(force) {
  const id = currentPlace(), key = id + '|' + favs.version + '|' + lang();
  if (key === starKey && !force) return; starKey = key;
  for (const b of document.querySelectorAll('.favstar')) {
    const on = !!id && favs.has(id); b.hidden = !id; b.classList.toggle('on', on); b.setAttribute('aria-pressed', String(on));
    b.innerHTML = `<b aria-hidden="true">${on ? '★' : '☆'}</b> ${quad(on ? FAV_UI.saved : FAV_UI.save)}`;
  }
}
new MutationObserver(() => {   // #info is rebuilt for each planet / piece: put its ★ back under the title · 面板重建后补上星标
  const h = $('#info h2'); if (h && !$('#info .favstar')) { const b = document.createElement('button'); b.type = 'button'; b.className = 'favstar'; h.after(b); refreshStars(true); }
}).observe($('#info'), { childList: true });
document.addEventListener('click', e => { if (e.target.closest?.('.favstar')) toggleFav(); });
// Said once: the tour's first stop and the demo's Saturn stop (the ★ glows for a few seconds) · 只提示一次
const favTipEl = document.createElement('div'); favTipEl.className = 'favtip'; favTipEl.hidden = true; favTipEl.setAttribute('role', 'status'); document.body.append(favTipEl);
let favTipShown = (() => { try { return !!localStorage.getItem('cv-favtip'); } catch { return false; } })();   // the tour says it once per browser · 游览每个浏览器一次
// demo: always (it is a scripted recording) · 演示：每次都显示
function favTip(text, demo = false) {
  if (!tour.active || document.body.classList.contains('xr-on')) return;   // tour stopped meanwhile, or in VR (the toast can't be seen there) · 游览已停止或在 VR 中
  if (!demo) { if (favTipShown) return; favTipShown = true; try { localStorage.setItem('cv-favtip', '1'); } catch {} }
  favTipEl.innerHTML = quad(text); favTipEl.hidden = false; document.body.classList.add('fav-glow');
  clearTimeout(favTip.hide); favTip.hide = setTimeout(() => { favTipEl.hidden = true; document.body.classList.remove('fav-glow'); }, 6000);
}
// Webcam hands: the ladder row (or toggle) under the hand cursor · 手势光标下的阶梯行
ladderRowAt.inside = (x, y) => document.elementsFromPoint(x, y).some(el => el.closest?.('#ladder'));
function ladderRowAt(x, y) {
  for (const el of document.elementsFromPoint(x, y)) { const b = el.closest?.('#ladder button[data-go]'); if (b && b.offsetParent) return b.dataset.go; }
  return null;
}
// VR panel while journeying · VR 面板
function journeyPanel(hint, hintColor, g) {
  const l = lang(), p = journey.piece && journey.pieceData(journey.piece), here = tr(JUI.here, l) + ': ' + pathFrom(journey.level).map(id => tr(levelById(id).names, l)).join(' ▸ ');
  if (p) return { eyebrow: tr(p.type, l), title: tr(p.names, l), accent: p.shape.colors[0], text: p.whatIs ? tr(p.whatIs, l) : tr(p.narration, l), facts: p.facts.map(f => [tr(f.label, l), tr(f.value, l)]),
    hint: g === 'none' || g === 'other' ? tr(JUI.vrBack, l) : hint, hintColor };
  const lv = levelById(journey.level);
  // the readout replaces the long scale note: the panel shows 4 lines at most (xr.js) · 读数代替长说明（VR 面板最多 4 行）
  return { eyebrow: here, title: tr(lv.names, l), accent: '#cfe0ff', text: tr(lv.blurb, l) + ' ' + tr(SUI.view, l) + (l === 'zh' ? '：' : ': ') + tr(SCALES[lv.id].text, l) + (l === 'zh' ? '。' : '.'),
    facts: JUI.vrGuide.map(([a, b]) => [tr(a, l), tr(b, l)]), hint: g === 'none' || g === 'other' ? tr(JUI.vrHint, l) : hint, hintColor };
}

/* ───────── Panels & text · 面板与文字 ───────── */
const COVER = { eyebrow: Object.fromEntries(['en', 'zh', 'es', 'pt'].map(k => [k, JUI.coverEyebrow[k].toUpperCase()])), text: JUI.coverText };
// The intro eyebrow names the journey level; other modes get the original "Our cosmic neighbourhood" back · 旅程中显示所在层级
let introEyebrow = null;
function setEyebrow(names) {
  const el = $('.intro .eyebrow'); if (!el) return;
  if (introEyebrow == null) introEyebrow = el.innerHTML;
  el.innerHTML = names ? quad(names) : introEyebrow;
}
function setIntro(m, b) {
  document.body.classList.toggle('at-cover', m === 'journey' && journey.level === 'universe' && !journey.piece);
  if (m !== 'journey') setEyebrow(null);
  if (m === 'focus') {
    const idx = b.isSun ? 'STAR' : 'PLANET / ' + String(PLANETS.indexOf(b.p) + 1).padStart(2, '0'), idxZh = b.isSun ? '恒星' : '行星 / ' + String(PLANETS.indexOf(b.p) + 1).padStart(2, '0');
    $('#headline').innerHTML = bi(...nameOf(b.p)); $('#subtitle').innerHTML = bi(idx, idxZh, idx.replace('STAR', 'ESTRELLA').replace('PLANET', 'PLANETA'), idx.replace('STAR', 'ESTRELA').replace('PLANET', 'PLANETA'));
  } else if (m === 'journey') {
    const lv = levelById(journey.level || 'neighbourhood'), p = journey.piece && journey.pieceData(journey.piece), isCover = lv.id === 'universe' && !p;
    $('#headline').innerHTML = quad(p ? p.names : lv.names);
    $('#subtitle').innerHTML = quad(p ? p.type : isCover ? COVER.text : lv.blurb);   // the cover says what to do first · 封面说明从哪开始
    setEyebrow(isCover ? COVER.eyebrow : Object.fromEntries(['en', 'zh', 'es', 'pt'].map(k => [k, eyebrowText(lv.id, p, k)])));   // names the open piece too · 也显示打开的天体
  } else if (m === 'trajectory') {
    $('#headline').innerHTML = bi('Worlds in motion.', '群星，向前。', 'Mundos en movimiento.');
    $('#subtitle').innerHTML = bi('Our star moves. Eight worlds travel with it. Explore their luminous paths through a moving reference frame.', '太阳向前，八颗行星与它同行。旋转视角，探索运动参考系下交织的发光轨迹。', 'Nuestra estrella se mueve. Ocho mundos viajan con ella. Explora sus trayectorias luminosas.');
  } else if (m === 'lineup') {
    $('#headline').innerHTML = bi('True sizes, side by side.', '真实大小，并排比较。');
    $('#subtitle').innerHTML = bi('The Sun is 109 times wider than Earth. Jupiter is 11 times wider. Mercury is smaller than some moons.', '太阳的直径是地球的 109 倍，木星是地球的 11 倍，水星甚至比一些卫星还小。');
  } else {
    $('#headline').innerHTML = bi('Among the worlds.', '在群星之间。');
    $('#subtitle').innerHTML = bi('Eight worlds and their star, shown at their true sizes. Select a planet, use your hands, or just ask.', '八颗行星与太阳，按真实大小呈现。点击行星、用手势控制，或直接提问。');
  }
}
function highlightNav(id) { document.querySelectorAll('#navPlanets button').forEach(b => b.classList.toggle('active', b.dataset.id === id)); }

function highlightsHTML(id) {
  const h = HIGHLIGHTS[id]; if (!h) return '';
  const moons = h.moons.length
    ? h.moons.map(m => { const [ptName, ptFact] = moonPT(m); return `<li><b>${bi(m[0], m[1], m[2], ptName)}</b>${bi(m[7], m[8], m[9], ptFact)}</li>`; }).join('')
    : `<li>${bi('No moons.', '没有卫星。', 'Sin lunas.')}</li>`;
  return `<div class="hl">
    <div class="hlh">${bi('✦ Living feature', '✦ 动态现象', '✦ Fenómeno vivo')}</div><p>${bi(...h.feature)}</p>
    ${id === 'sun' ? '' : `<div class="hlh">${bi('◐ Moons', '◐ 卫星', '◐ Lunas')}</div><ul>${moons}</ul>`}
    <div class="hlh">${bi('🛰 Spacecraft moment', '🛰 航天器时刻', '🛰 Momento espacial')}</div><p><b>${bi(...h.craft.name)}</b> ${bi(...h.craft.text)}</p>
    <small>${bi('Moon sizes are true to scale; very small moons are drawn larger, and orbit distances are shortened. Spacecraft are enlarged to be visible.', '卫星大小按真实比例；很小的卫星画得更大，轨道距离也被缩短。航天器被放大以便看见。', 'Las lunas tienen tamaño real a escala; las muy pequeñas se dibujan más grandes y las órbitas se acortan. Las naves están ampliadas para que se vean.')}</small>
  </div>`;
}
function renderInfo(b) {
  const p = b.p, earthX = (p.radiusKm / 6371).toFixed(p.radiusKm < 6371 ? 2 : 1);
  document.documentElement.style.setProperty('--accent', p.color);
  $('#info').innerHTML = `
    <div class="eyebrow">${bi(p.type[0].toUpperCase(), p.type[1], window.esText(p.type[0]).toUpperCase(), window.ptText(p.type[0]).toUpperCase())}</div>
    <h2>${bi(...nameOf(p))}</h2>
    <div class="scale">${bi(`${earthX} × Earth’s width`, `宽度为地球的 ${earthX} 倍`, `${earthX.replace('.', ',')} × el ancho de la Tierra`, `${earthX.replace('.', ',')} × a largura da Terra`)}</div>
    <p>${bi(p.descEn, p.descZh)}</p>
    <div class="facts">${p.facts.map(f => `<div><small>${bi(f[0], f[1])}</small><b>${bi(f[2], f[3])}</b></div>`).join('')}</div>
    <p class="feature">${bi(p.featureEn, p.featureZh)}</p>
    ${highlightsHTML(p.id)}
    <button class="ask" id="askAbout">${bi(`Ask Cosmo about ${nameOf(p)[0]}`, `问 Cosmo 关于${p.zh}的问题`, `Pregunta a Cosmo sobre ${nameOf(p)[2]}`, `Pergunte ao Cosmo sobre ${nameOf(p)[3]}`)}</button>
    ${b.isSun ? '' : `<div class="controls">
      <div class="control"><span>${bi('Tint · keeps surface detail', '色调 · 保留表面细节')}</span><input aria-label="Tint" id="tint" type="color" value="${b.tint}"></div>
      <div class="control"><span>${bi('Particle glow', '粒子光感')}</span><span id="glowval">${Math.round(b.glow * 100)}%</span></div>
      <input id="glow" aria-label="Particle glow" type="range" min="0" max="1" step=".01" value="${b.glow}">
      <div class="control"><span>${bi('Particle spread', '粒子扩散')}</span><span>${bi('Open palm / fist', '张手 / 握拳')}</span></div>
      <input id="spread" aria-label="Particle spread" type="range" min="0" max="1" step=".01" value="0">
      ${p.id === 'venus' && maps.venusSurface ? `<div class="control"><span>${bi('View', '视图')}</span><button id="venusView">${b.venusSurface ? bi('Show clouds', '显示云层') : bi('Radar surface', '雷达地表')}</button></div>` : ''}
      <div class="control"><button id="spin">${b.spinOn ? bi('Pause spin', '暂停自转') : bi('Resume spin', '恢复自转')}</button><button id="reset">${bi('Reset look', '恢复外观')}</button></div>
    </div>`}`;
  $('#info').classList.remove('hidden'); $('#info').scrollTop = 0;
  $('#askAbout').onclick = () => chat.open();
  if (b.isSun) return;
  $('#tint').oninput = e => { b.tint = e.target.value; b.surface.material.color.set(b.tint); };
  $('#glow').oninput = e => { b.glow = +e.target.value; if (b.particles) b.particles.material.opacity = b.glow; $('#glowval').textContent = Math.round(b.glow * 100) + '%'; };
  $('#spread').oninput = e => { sliderSpread = +e.target.value; };
  if ($('#venusView')) $('#venusView').onclick = () => { setVenusSurface(b, maps, !b.venusSurface); refreshParticles(b); renderInfo(b); };
  $('#spin').onclick = () => { b.spinOn = !b.spinOn; $('#spin').innerHTML = b.spinOn ? bi('Pause spin', '暂停自转') : bi('Resume spin', '恢复自转'); };
  $('#reset').onclick = () => { b.tint = '#ffffff'; b.glow = 0.14; b.spinOn = true; b.surface.material.color.set('#fff'); if (b.particles) b.particles.material.opacity = 0.14; sliderSpread = 0; renderInfo(b); };
}

/* ───────── Nav & header · 导航与顶部按钮 ───────── */
// Bottom bar: the levels of the universe, largest first. Solar System has a ▾ list of the Sun and planets · 底栏：从大到小的尺度
const NAV_DOT = { universe: '#c9a8ff', supercluster: '#8bd6ff', 'local-group': '#ffb3c8', galaxy: '#a9c8ff', neighbourhood: '#ffe08a', 'solar-system': '#ffc861' };
for (const id of LEVELS.map(l => l.id)) {
  const btn = document.createElement('button'); btn.type = 'button'; btn.dataset.level = id;
  btn.innerHTML = `<i style="background:${NAV_DOT[id] || '#9fb2c4'}"></i>${quad(levelById(id).names)}`;
  btn.onclick = () => { closeNavPlanets(); ladderGo('L:' + id); };
  if (id !== 'solar-system') { $('#nav').append(btn); continue; }
  const grp = document.createElement('div'); grp.className = 'navsplit';
  const more = document.createElement('button'); more.type = 'button'; more.className = 'navmore'; more.id = 'navPlanetsBtn';
  more.setAttribute('aria-haspopup', 'true'); more.setAttribute('aria-expanded', 'false'); more.setAttribute('aria-label', 'Sun and planets'); more.textContent = '▾';
  more.onclick = e => { e.stopPropagation(); navPlanets.hidden ? openNavPlanets() : closeNavPlanets(); };
  grp.append(btn, more); $('#nav').append(grp);
  // 🧭 Universe → Me (▾: Me → Universe, change my place) · 从宇宙到我
  const meGrp = document.createElement('div'); meGrp.className = 'navsplit navme';
  const meB = document.createElement('button'); meB.type = 'button'; meB.id = 'meBtn'; meB.innerHTML = `<i style="background:#7dffcf"></i>${quad(ME_UI.down)}`;
  const meM = document.createElement('button'); meM.type = 'button'; meM.className = 'navmore'; meM.id = 'meMoreBtn'; meM.textContent = '▾';
  meM.setAttribute('aria-haspopup', 'true'); meM.setAttribute('aria-expanded', 'false'); meM.setAttribute('aria-label', ME_UI.up.en);
  meGrp.append(meB, meM); $('#nav').append(meGrp);
}
const navPlanets = document.createElement('div'); navPlanets.id = 'navPlanets'; navPlanets.className = 'navplanets'; navPlanets.hidden = true;
navPlanets.setAttribute('role', 'menu'); document.body.append(navPlanets);
bodies.forEach(b => {
  const btn = document.createElement('button'); btn.type = 'button'; btn.dataset.id = b.p.id; btn.setAttribute('role', 'menuitem');
  btn.innerHTML = `<i style="background:${b.p.color}"></i>${bi(...nameOf(b.p))}`;
  btn.onclick = () => { closeNavPlanets(); ladderGo('B:' + b.p.id); }; navPlanets.append(btn);
});
function openNavPlanets() {
  const r = $('#navPlanetsBtn').getBoundingClientRect(); navPlanets.hidden = false;
  const w = navPlanets.offsetWidth, x = Math.min(innerWidth - w - 8, Math.max(8, r.right - w));
  navPlanets.style.left = x + 'px'; navPlanets.style.bottom = (innerHeight - r.top + 8) + 'px';
  $('#navPlanetsBtn').setAttribute('aria-expanded', 'true');
}
function closeNavPlanets() { navPlanets.hidden = true; $('#navPlanetsBtn')?.setAttribute('aria-expanded', 'false'); }
addEventListener('pointerdown', e => { if (!navPlanets.hidden && !e.target.closest('#navPlanets, #navPlanetsBtn')) closeNavPlanets(); }, true);
addEventListener('keydown', e => { if (e.key === 'Escape' && !navPlanets.hidden) { closeNavPlanets(); e.stopImmediatePropagation(); } }, true);
addEventListener('resize', closeNavPlanets);
let navKey = '';
function updateNav() {   // light up the level you are at (and the planet, in the ▾ list) · 高亮当前尺度
  const cur = mode === 'journey' ? journey.level : 'solar-system', key = cur;
  if (key === navKey) return; navKey = key;
  document.querySelectorAll('#nav button[data-level]').forEach(b => b.classList.toggle('active', b.dataset.level === cur));
  const on = $(`#nav button[data-level="${cur}"]`), nav = $('#nav');   // phone: scroll the bar so the current level shows · 手机上滚动到当前尺度
  if (on && nav.scrollWidth > nav.clientWidth) nav.scrollTo({ left: on.offsetLeft - (nav.clientWidth - on.offsetWidth) / 2, behavior: 'smooth' });
}
$('#lineup').onclick = lineup; $('#pause').onclick = () => setPaused(!paused);

function notice(en, zh, es, ms = 4500, pt) { const s = $('#status'); s.innerHTML = bi(en, zh, es, pt); s.style.display = 'block'; clearTimeout(notice.t); notice.t = setTimeout(() => s.style.display = 'none', ms); }

/* ───────── Mouse & touch · 鼠标与触控 ───────── */
const canvas = renderer.domElement, pointers = new Map(); let down = null, moved = false, pinchDist = 0;
canvas.addEventListener('pointerdown', e => { pointers.set(e.pointerId, { x: e.clientX, y: e.clientY }); canvas.setPointerCapture(e.pointerId); down = { x: e.clientX, y: e.clientY }; moved = false; if (pointers.size === 2) { const [a, b] = [...pointers.values()]; pinchDist = Math.hypot(a.x - b.x, a.y - b.y); } });
canvas.addEventListener('pointermove', e => {
  if (harpOn) harpAt(e.clientX, e.clientY, 'mouse');   // 🎵 sweep across the orbits · 划过轨道
  if (!pointers.has(e.pointerId)) { if (e.pointerType === 'mouse') setHover(pickAt(e.clientX, e.clientY)); return; }
  const old = pointers.get(e.pointerId); if (Math.hypot(e.clientX - down.x, e.clientY - down.y) > 5) moved = true;
  if (pointers.size === 1) { goal.yaw -= (e.clientX - old.x) * 0.006; goal.pitch = mode === 'trajectory' ? goal.pitch + (e.clientY-old.y)*.005 : clamp(goal.pitch + (e.clientY - old.y) * 0.005, mode === 'focus' ? -1.35 : 0.02, 1.45); }
  pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
  if (pointers.size === 2) { const [a, b] = [...pointers.values()], d = Math.hypot(a.x - b.x, a.y - b.y); zoomBy(d / Math.max(1, pinchDist)); pinchDist = d; }
});
canvas.addEventListener('pointerup', e => { pointers.delete(e.pointerId); if (!moved && pointers.size === 0 && !harpOn && !mergeOn) { const id = pickAt(e.clientX, e.clientY, e.pointerType === 'touch' ? 34 : 22); if (id) select(id); } });
canvas.addEventListener('pointercancel', e => pointers.delete(e.pointerId));
canvas.addEventListener('pointerleave', () => { harpPrev.mouse = null; });
// Wheel anywhere on the scene, including over a planet's label ring · 滚轮缩放（含标签区域）
addEventListener('wheel', e => { if (!e.target.closest?.('canvas, .tag, .jtag, .mtag, .flight-label')) return; e.preventDefault(); tour?.pause(performance.now()); zoomBy(Math.exp(-e.deltaY * 0.0012)); }, { passive: false });
addEventListener('keydown', e => {
  if (e.target.closest?.('input,textarea,select')) return;
  if (e.key === ' ' && e.target.closest?.('button')) return;   // Space presses the focused button · 空格键按下聚焦按钮
  if (tour?.active) {   // tour: Space pauses/resumes, Esc stops, other keys pause · 游览快捷键
    if (e.key === ' ') { e.preventDefault(); tour.toggle(performance.now()); return; }
    if (e.key === 'Escape') { tour.stop(); return; }
    tour.pause(performance.now());
  }
  if (e.key === 'Escape') back(); else if (e.key === 'ArrowRight') cycle(1); else if (e.key === 'ArrowLeft') cycle(-1);
  else if (e.key.toLowerCase() === 'l') lineup(); else if (e.key === ' ') { e.preventDefault(); setPaused(!paused); }
});

/* ───────── Hand gestures · 手势 ───────── */
const cursorEl = $('#handCursor'), pill = $('#gpill');
const hand = { present: false, x: 0, y: 0, prev: 'none', since: 0, hoverId: null, hoverAt: 0, dwellId: null, dwellSince: 0, dwellDone: null, pinch: null, fistDone: false, vDone: false, lastSeen: 0 };
const T3 = (en, zh, es) => [en, zh, es];
const HINTS = {
  point: { browse: T3('Point · hold on a planet to open it', '指向 · 停留在行星上即可打开', 'Apunta · quédate sobre un planeta para abrirlo'), focus: T3('Point · move to look around', '指向 · 移动旋转视角', 'Apunta · muévete para mirar alrededor') },
  pinch: { browse: T3('Pinch · open · pinch + move up/down to zoom', '捏合 · 打开 · 捏住上下移动缩放', 'Pellizca · abrir · pellizca y sube/baja para zoom'), focus: T3('Pinch + move up/down · zoom', '捏住上下移动 · 缩放', 'Pellizca y sube/baja · zoom') },
  open: { browse: T3('Open palm · move to turn the system', '张开手掌 · 移动旋转太阳系', 'Palma abierta · muévela para girar el sistema'), focus: T3('Open palm · spread fingers to scatter particles', '张开手掌 · 张开手指让粒子扩散', 'Palma abierta · separa los dedos para dispersar partículas') },
  fist: { browse: T3('Hold fist · go back', '保持握拳 · 返回', 'Mantén el puño · volver'), focus: T3('Hold fist · gather, then go back', '保持握拳 · 聚合并返回', 'Mantén el puño · reunir y volver') },
  victory: { browse: T3('Victory ✌ · hold to talk to Cosmo', '剪刀手 ✌ · 保持以和 Cosmo 对话', 'Victoria ✌ · mantén para hablar con Cosmo'), focus: T3('Victory ✌ · hold to talk to Cosmo', '剪刀手 ✌ · 保持以和 Cosmo 对话', 'Victoria ✌ · mantén para hablar con Cosmo') },
  other: { browse: T3('Hand found · try ☝ 🤏 ✋ ✊ ✌', '已检测到手 · 试试 ☝ 🤏 ✋ ✊ ✌', 'Mano detectada · prueba ☝ 🤏 ✋ ✊ ✌'), focus: T3('Hand found · try ☝ 🤏 ✋ ✊ ✌', '已检测到手 · 试试 ☝ 🤏 ✋ ✊ ✌', 'Mano detectada · prueba ☝ 🤏 ✋ ✊ ✌') },
};
// Small, careful movements stay precise; quick sweeps travel further · 慢动作精确，快动作移动更远
const accel = (d, gain) => d * gain * (1 + Math.min(2, Math.abs(d) / 35) * 0.6);
let sensitivity = 3;
const dwellMs = () => [0, 1700, 1450, 1200, 1000, 850][sensitivity];

function onHand(u) {
  const now = performance.now();
  if (!u.present) {
    if (!hand.downAt) { hand.downAt = now; hand.absent = true; }   // no hand seen = lowered, but tracking can drop out: it needs longer · 看不到手 = 放下（需更久）
    hand.present = false; handSpread = 0; cursorEl.classList.add('hidden'); hand.prev = 'none'; hand.dwellId = null;
    pill.innerHTML = bi('Show one hand to the camera', '请把一只手放到镜头前', 'Muestra una mano a la cámara'); pill.style.color = GESTURE_COLORS.none; return;
  }
  const g = u.gesture, x = u.cursor.x * innerWidth, y = u.cursor.y * innerHeight, gain = u.gain || 1;
  // "lower your hand to close": a hand is down when it shows no gesture or hangs low (VR: resting at your side, xr.js `low`) · 手放下
  if (g !== 'none' && !u.low) { if (hand.downAt || !hand.upAt) hand.raiseAt = now; hand.upAt = now; hand.downAt = 0; hand.absent = false; }   // raiseAt: a fresh down → up · 重新举手
  else if (!hand.downAt) { hand.downAt = now; hand.absent = false; }
  const dx = hand.present ? x - hand.x : 0, dy = hand.present ? y - hand.y : 0, onset = g !== hand.prev;
  hand.present = true; hand.x = x; hand.y = y; hand.lastSeen = now; if (onset) hand.since = now;
  if (mergeOn && !renderer.xr.isPresenting && onset && g === 'pinch' && (!merge.sim || merge.done)) mergePlay();   // 👏 webcam only: a pinch starts the collision (VR: clap or the menu row) · 摄像头：捏合开始
  const held = now - hand.since, browsing = mode !== 'focus';
  let progress = 0;
  // Welcome card open: a pinch or point + hold closes it, nothing else happens · 欢迎卡片打开时：捏合或指向停留关闭
  if (document.body.classList.contains('xr-on')) welcome.vrHand(g, held, onset);
  if (welcome.isOpen()) {
    progress = welcome.hand(g, held, onset); hand.prev = g; hand.dwellId = null; hand.pinch = null;
    cursorEl.classList.remove('hidden'); cursorEl.dataset.g = g; cursorEl.style.transform = `translate(${x}px,${y}px)`;
    cursorEl.style.setProperty('--c', GESTURE_COLORS[g]); cursorEl.style.setProperty('--p', progress); return;
  }

  // Scale ladder: point at a row and hold to travel there (any mode) · 尺度阶梯：指向停留即前往
  const lrow = g === 'point' || g === 'other' ? ladderRowAt(x, y) : null;
  for (const b of ladder.querySelectorAll('button.hand')) if (b.dataset.go !== lrow) b.classList.remove('hand');
  if (lrow) {
    setHover(null); hand.dwellId = null; ladder.querySelector(`button[data-go="${lrow}"]`)?.classList.add('hand');
    if (hand.ladderId !== lrow) { hand.ladderId = lrow; hand.ladderSince = now; }
    // after a jump the rows reflow under the still hand: no new dwell until the hand leaves the ladder · 跳转后须移开手再选
    // ★ Favourites only opens a drop-down beside it (nothing reflows under the hand): the latch lets you go on to its rows · 收藏下拉不重排，可直接移到其中的行
    const latched = hand.ladderDone && !(hand.ladderDone === 'FAV:menu' && lrow !== 'FAV:menu');
    if (g === 'point' && !latched) { progress = Math.min(1, (now - hand.ladderSince) / dwellMs()); if (progress >= 1 && ladderGo(lrow, false) !== false) hand.ladderDone = lrow === 'FAV:menu' ? lrow : true; }
  } else if (!ladderRowAt.inside(x, y)) { hand.ladderId = null; hand.ladderDone = false; }   // gaps between rows keep the latch · 行间空隙不清除
  // Tour: a pinch, fist or ✌, or pointing at the scene for a moment, pauses it (not the tour row itself; not in the 1.5 s after
  // starting or resuming it, while the hand leaves the menu) · 手势暂停游览（开始/继续后 1.5 秒内不暂停）
  // The point hold counts from when the hand left the ladder (webcam); in VR pointing never pauses (the menu is pointed at) · 指向计时从离开阶梯开始
  if (lrow || ladderRowAt.inside(x, y)) hand.offLadder = now;
  const pointPause = g === 'point' && !document.body.classList.contains('xr-on') && now - Math.max(hand.since, hand.offLadder || 0) > 800;
  if (tour?.active && !tour.paused && !lrow && now - tour.state.since > 1500 && ((onset && (g === 'pinch' || g === 'fist' || g === 'victory')) || pointPause)) tour.pause(performance.now());
  // 🎵 Orbit harp: the hand cursor (webcam, or the VR fingertip aim) strums the orbits; a fist still goes back · 手势拨动轨道
  if (harpOn && !lrow && g !== 'fist') harpAt(x, y, 'hand'); else harpPrev.hand = null;
  // Aim: hover a planet with the cursor (bigger target area for hands) · 瞄准行星
  if (!lrow && browsing && (g === 'point' || g === 'open' || g === 'other')) {
    const id = pickAt(x, y, 54); setHover(id);
    if (id) { hand.hoverId = id; hand.hoverAt = now; }
    // Dwell to open: keep pointing at the same planet · 停留打开
    // While a journey piece is open, keep pointing from re-opening whatever drifts under the hand · 天体打开时不再停留触发
    if (g === 'point' && id && !harpOn && !mergeOn && !(mode === 'journey' && journey.piece)) {
      if (hand.dwellId !== id) { hand.dwellId = id; hand.dwellSince = now; }
      progress = Math.min(1, (now - hand.dwellSince) / dwellMs());
      if (progress >= 1 && hand.dwellDone !== id) { hand.dwellDone = id; select(id); }
    } else hand.dwellId = null;
  } else hand.dwellId = null;
  if (!hand.hoverId || hand.dwellId === null) { /* keep */ }
  if (browsing && hand.dwellDone && hand.hoverId !== hand.dwellDone) hand.dwellDone = null;

  // ☝ point + hold on a moon / spacecraft / landmark label: "What is this?" (the view holds still meanwhile) · 指向标签停留
  const mt = g === 'point' && !lrow && mode === 'focus' ? mtagAt(x, y) : null;
  if (mt) { if (hand.mtEl !== mt) { hand.mtEl = mt; hand.mtSince = now; } progress = Math.min(1, (now - hand.mtSince) / dwellMs()); if (progress >= 1 && !hand.mtDone) { hand.mtDone = true; mt.click(); } }
  else { hand.mtEl = null; hand.mtDone = false; }
  if (g === 'point' && !browsing && !lrow && !mt) { goal.yaw -= accel(dx, gain) / innerWidth * 4.4; goal.pitch = clamp(goal.pitch + accel(dy, gain) / innerHeight * 2.8, -1.35, 1.45); }
  if (g === 'pinch') {
    if (onset) {
      const recent = hand.hoverId && now - hand.hoverAt < 900;
      if (browsing && recent && mode !== 'journey' && !harpOn && !mergeOn) { select(hand.hoverId); hand.dwellDone = hand.hoverId; hand.pinch = null; }
      else hand.pinch = { y, last: 1, m: zoomKey() };
    } else if (hand.pinch && hand.pinch.m === zoomKey()) { const want = Math.exp((hand.pinch.y - y) / innerHeight * 3.4 * gain); zoomBy(want / hand.pinch.last); hand.pinch.last = want; }
  } else hand.pinch = null;
  if (g === 'open') {
    if (!browsing) handSpread = clamp((u.openness - 1.35) * 1.25, 0, 1);
    else { goal.yaw -= accel(dx, gain) / innerWidth * 3.8; goal.pitch = mode === 'trajectory' ? goal.pitch + accel(dy,gain)/innerHeight*2.2 : clamp(goal.pitch + accel(dy, gain) / innerHeight * 2.2, mode === 'lineup' ? -0.4 : 0.02, 1.45); }
  }
  if (g === 'fist') {
    handSpread = 0;
    if (!atCover() || tour?.active) { progress = Math.min(1, held / 1100); if (held > 1100 && !hand.fistDone) { hand.fistDone = true; back(); } }
  } else if (now - hand.since > 300) hand.fistDone = false;   // re-arm only after ~0.3 s of another gesture (tracking flickers) · 换手势 0.3 秒后才重新生效
  if (g === 'victory') { progress = Math.min(1, held / 500); if (held > 500 && !hand.vDone) { hand.vDone = true; chat.startVoice(); } } else hand.vDone = false;

  hand.prev = g; hand.progress = progress;
  cursorEl.classList.remove('hidden'); cursorEl.dataset.g = g;
  cursorEl.style.transform = `translate(${x}px,${y}px)`; cursorEl.style.setProperty('--c', GESTURE_COLORS[g]);
  cursorEl.style.setProperty('--p', progress);
  const h = (HINTS[g] || HINTS.other)[browsing ? 'browse' : 'focus']; pill.innerHTML = bi(...h); pill.style.color = GESTURE_COLORS[g];
}
const tracker = new HandTracker({ video: $('#video'), overlay: $('#handOverlay'), onUpdate: onHand, fpsEl: $('#handFps') });

/* ───────── VR (WebXR, Meta Quest) · VR 模式 ───────── */
// In VR the headset's own hand tracking drives onHand(), exactly like the webcam.
// VR panel hints in the four languages (they were English only) · VR 提示四种语言
const Q4 = (en, zh, es, pt) => ({ en, zh, es, pt });
const VR_HINTS4 = {
  point: Q4('Point at a planet and hold to open it', '指向行星并停留即可打开', 'Apunta a un planeta y mantén para abrirlo', 'Aponte para um planeta e segure para abri-lo'),
  pinch: Q4('Pinch + move up/down to zoom', '捏合并上下移动来缩放', 'Pellizca y sube/baja para hacer zoom', 'Pince e suba/desça para dar zoom'),
  open: Q4('Open palm: turn the view · spread to scatter', '张开手掌：旋转视角 · 张开手指让粒子散开', 'Palma abierta: gira la vista · abre para dispersar', 'Palma aberta: gira a vista · abra para espalhar'),
  fist: Q4('Hold a fist to go back', '保持握拳即可返回', 'Mantén el puño cerrado para volver', 'Mantenha o punho fechado para voltar'),
  victory: Q4('Victory: say a command or ask Cosmo', '剪刀手：说出指令或问 Cosmo', 'Victoria: di una orden o pregunta a Cosmo', 'Vitória: diga um comando ou pergunte ao Cosmo'),
  other: Q4('Try ☝ point · 🤏 pinch · ✋ palm · ✊ fist', '试试 ☝ 指向 · 🤏 捏合 · ✋ 手掌 · ✊ 握拳', 'Prueba ☝ apuntar · 🤏 pellizcar · ✋ palma · ✊ puño', 'Tente ☝ apontar · 🤏 pinça · ✋ palma · ✊ punho'),
  none: Q4('Raise a hand in front of you', '在面前举起一只手', 'Levanta una mano delante de ti', 'Levante uma mão à sua frente'),
  back: Q4('Keep pointing to go back', '保持指向即可返回', 'Sigue apuntando para volver', 'Continue apontando para voltar'),
  two: Q4('Both hands: pull apart to zoom · turn to rotate', '双手：拉开缩放 · 转动旋转', 'Dos manos: separa para hacer zoom · gira para rotar', 'Duas mãos: afaste para dar zoom · gire para rodar'),
  ret: Q4('Press ⟵ Back or hold a fist to return', '按 ⟵ 返回，或保持握拳返回', 'Pulsa ⟵ Volver o mantén el puño cerrado para regresar', 'Toque ⟵ Voltar ou mantenha o punho fechado para voltar'),
};
const VR_HINTS = new Proxy({}, { get: (_, k) => Object.hasOwn(VR_HINTS4, k) ? tr(VR_HINTS4[k], lang()) : undefined });   // same lookups as before, in the current language · 按当前语言
// planet panel text: Chinese from the data, Spanish/Portuguese from i18n.js (English if missing) · 行星面板文字
const vrTx = (en, zh) => { const l = lang(); return l === 'zh' ? (zh || en) : l === 'es' ? window.esText?.(en) ?? en : l === 'pt' ? window.ptText?.(en) ?? en : en; };
// Gesture guide shown on the VR panel in the overview · VR 手势指南
const VR_GUIDE4 = [[Q4('☝ Point + hold', '☝ 指向并停留', '☝ Apunta y mantén', '☝ Aponte e segure'), Q4('Open a planet', '打开行星', 'Abre un planeta', 'Abre um planeta')], [Q4('🤏 Pinch + up/down', '🤏 捏合上下移动', '🤏 Pellizca y sube/baja', '🤏 Pince e suba/desça'), Q4('Zoom', '缩放', 'Zoom', 'Zoom')],
  [Q4('🤏🤏 Both hands', '🤏🤏 双手', '🤏🤏 Dos manos', '🤏🤏 Duas mãos'), Q4('Zoom and turn', '缩放与旋转', 'Zoom y giro', 'Zoom e giro')], [Q4('✊ Hold a fist', '✊ 保持握拳', '✊ Mantén el puño cerrado', '✊ Mantenha o punho fechado'), Q4('Go back', '返回', 'Volver', 'Voltar')],
  [Q4('✋ Open palm', '✋ 张开手掌', '✋ Palma abierta', '✋ Palma aberta'), Q4('Turn the view', '旋转视角', 'Gira la vista', 'Gira a vista')], [Q4('✌ Victory', '✌ 剪刀手', '✌ Victoria', '✌ Vitória'), Q4('Voice: a command or Cosmo', '语音：指令或问 Cosmo', 'Voz: una orden o Cosmo', 'Voz: um comando ou o Cosmo')]];
const VR_VIEWS = { overview: Q4('The Solar System', '太阳系', 'El sistema solar', 'O Sistema Solar'), lineup: Q4('True sizes, side by side', '真实大小，并排比较', 'Tamaños reales, lado a lado', 'Tamanhos reais, lado a lado'), trajectory: Q4('Trajectories', '轨迹', 'Trayectorias', 'Trajetórias') };
const VR_INTRO = Q4('The universe in the palm of your hand. Use these gestures:', '掌中的宇宙。使用这些手势：', 'El universo en la palma de tu mano. Usa estos gestos:', 'O universo na palma da sua mão. Use estes gestos:');
let twoHand = null, vrEnterAt = 0, mrPlacedAt = -1e9;   // two-hand zoom/turn in progress · 双手手势状态
const xr = initXR({
  renderer, scene, camera, onHand,
  onEnter: isMR => { stars.visible = !isMR; if (tracker.active) $('#cam').click(); document.body.classList.add('xr-on'); vrEnterAt = performance.now(); welcome.close(); featureIntro('vr', 2500); },
  onExit: () => { if (harpOn) harpBar.hidden = false; if (mergeOn) mergeBar.hidden = false; guideVR = false; stars.visible = true; lastNear = 0; document.body.classList.remove('xr-on'); if (vrAsk.open) { Object.assign(vrAsk, { open: false, q: null, a: null, err: null, state: null }); stopListening(); stopSpeaking(); } },   // leave Ask Cosmo behind · 退出 VR 时关闭
  onBack: () => back(),
  backVisible: () => !atCover() || !!tour?.active,
  labels: () => [...bodies.map(b => ({ obj: b.anchor, text: nameOf(b.p)[Math.max(0, ['en', 'zh', 'es', 'pt'].indexOf(lang()))], color: b.isSun ? '#ffd27a' : '#ffffff', r: b.r, visible: () => mode === 'overview' || mode === 'lineup' })),
    ...journey.xrLabels(lang()).map(o => ({ ...o, visible: () => !merge.shown && o.visible() }))],   // the collision hides the Local Group labels · 碰撞时隐藏标签
  labelsVisible: () => mode === 'overview' || mode === 'lineup' || mode === 'journey',
  menu: () => vrMenu(),
  menuStamp: () => ladderKey + '|' + lang() + '|' + (voiceStatus().enabled ? 'n' : 'q') + '|' + (xr.mrState()?.placing ?? '-') + '|' + (vrAsk.open ? vrContextKey() : '-') + (vrAsk.state === 'listening' || vrAsk.state === 'transcribing' ? '|V' : '') + (calVR ? '|K' : '') + (refsVR ? '|R' : '') + (newsVR ? '|N' : '') + (guideVR ? '|G' : '') + (logVR ? '|O' + logCount() + '.' + doneCount(logBook.mission) : '') + (pmVR ? '|Y' + pmVer : '|y' + (myPlanet ? 1 : 0)) + (bsVR ? '|Z' + bsYear : '') + (harpOn ? '|H' : '') + (mergeOn ? '|X' + (merge.sim ? 1 : 0) : '') + (whatVR ? '|W' + (mode === 'focus' ? focus?.p.id : '') + (whatNow ? whatNow.it.key : '') : '') + (mode === 'focus' && focus?.hl ? '|h' : ''),   // changes only when the rows or the language change · 行或语言变化时改变
  onClap: () => mergeClap(),   // 👏 both palms together · 拍手
  onPlaced: () => { mrPlacedAt = performance.now(); },
  onMenu: id => { if (id === 'M:place') { xr.placeAgain(); return true; } return ladderGo(id, false); },
  onTwoHand: e => {
    if (e.phase === 'start') tour?.pause(performance.now());
    if (e.phase === 'start') twoHand = { last: 1, yaw: goal.yaw, m: zoomKey() };
    else if (e.phase === 'move' && twoHand && twoHand.m === zoomKey()) { zoomBy(e.ratio / twoHand.last); twoHand.last = e.ratio; goal.yaw = twoHand.yaw + e.dAngle; }
    else twoHand = null;
  },
  panelContent: g => {
    const m = xr.mrState?.();
    if (m?.placing) { const l = lang(); return { eyebrow: tr(MR_UI.eyebrow, l), title: tr(MR_UI.placeTitle, l), accent: '#9fe8c4', text: tr(MR_UI.placeText, l),
      facts: [], hint: tr(MR_UI.found[m.kind] || MR_UI.found.none, l) + ' · ' + tr(MR_UI.placeHint, l), hintColor: '#9fe8c4' }; }   // placing on the table · 正在放置
    const w = welcome.vrPanel(lang(), !(atCover() || mode === 'overview') || g === 'two' || g === 'menu' || performance.now() - vrEnterAt > 25000); if (w) return w;   // first VR panel · 首个 VR 面板
    const placedNow = performance.now() - mrPlacedAt < 3500;   // a few seconds of "Placed" after the pinch · 放置后短暂提示
    const hint = placedNow ? tr(MR_UI.placed, lang()) : g === 'menu' ? tr(JUI.vrMenu, lang()) : VR_HINTS[g] || VR_HINTS.other, hintColor = placedNow ? '#9fe8c4' : GESTURE_COLORS[g] || '#9fb2c4';
    // Ask Cosmo: the question and its answer, only for what you are looking at now (a new planet shows its own panel) · 只显示当前对象的问答
    if (vrAsk.open && !vrAsk.cmd && vrAsk.ctx !== vrContextKey()) Object.assign(vrAsk, { q: null, a: null, err: null, state: null, ctx: null });   // a voice command's reply stays (it moved you on purpose) · 指令的回复保留
    // lower your hand after the answer: Ask Cosmo closes (Pamela, Nov 17) · 回答后放下手即关闭
    if (g === 'two') { hand.downAt = 0; hand.absent = false; hand.raiseAt = 0; }   // a two-hand zoom is not "lowering" · 双手缩放不算放下
    else if (vrAsk.open && !vrAsk.state && shouldCloseOnLower({ shownAt: vrAsk.shownAt, raisedAt: hand.raiseAt, loweredAt: hand.downAt, now: performance.now(), ms: hand.absent ? 3000 : 1500 })) Object.assign(vrAsk, { open: false, q: null, a: null, err: null, state: null, ctx: null, shownAt: 0 });
    if (vrAsk.open && (vrAsk.q || vrAsk.state || vrAsk.err)) return cosmoPanel();
    if (whatNow && xr.active() && mode === 'focus' && whatNow.b === focus) return whatPanel();   // ℹ What is this? · 这是什么？
    if (pmVR) return pmPanel();   // 🪐 Your planet · 你的行星
    if (bsVR) return bsPanel();   // 🎂 Birthday star · 生日星
    if (harpOn) return harpPanel();   // 🎵 Orbit harp · 轨道竖琴
    if (mergeOn) return mergePanel();   // 👏 Galaxy collision · 星系碰撞
    if (mePin.on) return mePanel();   // 🧭 You are here · 你在这里
    if (logVR) return logPanel();   // 📔 Logbook · 日志
    if (guideVR) return guidePanel();   // 🧭 How to move · 怎么操作
    if (newsVR) return newsPanel();   // 📰 News · 新闻
    if (calVR) return calPanel();   // 📅 Coming up · 即将到来
    if (refsVR) return refsPanel();   // 📚 Sources & licences · 来源与许可
    if (tour?.active && !tour.paused) return tourPanel(g === 'menu' ? hint : null);   // paused: the normal panel (the menu row says ▶ Resume tour) · 暂停时显示普通面板
    if (mode === 'focus' && focus) {
      const p = focus.p;
      const li = ['en', 'zh', 'es', 'pt'].indexOf(lang());
      return { eyebrow: vrTx(p.type[0], p.type[1]), title: nameOf(p)[li < 0 ? 0 : li], accent: p.color, text: vrTx(p.descEn, p.descZh), facts: p.facts.map(f => [vrTx(f[0], f[1]), vrTx(f[2], f[3])]), hint: g === 'none' || g === 'other' ? VR_HINTS.ret : hint, hintColor };
    }
    if (mode === 'journey') return journeyPanel(hint, hintColor, g);
    const l = lang();
    return { eyebrow: 'CosmoVerse', title: VR_VIEWS[mode] ? tr(VR_VIEWS[mode], l) : 'CosmoVerse', accent: '#ffffff',
      text: tr(VR_INTRO, l), facts: VR_GUIDE4.map(([a, b]) => [tr(a, l), tr(b, l)]), hint, hintColor };
  },
});
{
  const vrBtn = document.createElement('button'); vrBtn.id = 'vr'; vrBtn.className = 'primary';
  vrBtn.innerHTML = bi('🥽 Enter VR', '🥽 进入 VR', '🥽 Entrar en VR');
  $('#cam').after(vrBtn);
  vrBtn.onclick = async () => {
    try { if (!(await xr.enter())) notice('VR needs a VR headset browser (e.g. Meta Quest) or the Immersive Web Emulator.', '需要 VR 头显浏览器（如 Meta Quest）或 Immersive Web Emulator。', 'La RV necesita el navegador de un visor (p. ej., Meta Quest) o el Immersive Web Emulator.', 6000); }
    catch (e) { console.error(e); notice('Could not start VR: ' + e.message, '无法启动 VR：' + e.message, 'No se pudo iniciar la RV: ' + e.message, 6000, 'Não foi possível iniciar a RV: ' + e.message); }
  };
  xr.supported().then(ok => { if (!ok) vrBtn.title = 'Open on a Meta Quest browser to use VR'; });
  // Mixed reality: shown only where the browser can do passthrough AR (Quest Browser, emulator) · 仅在支持 AR 的浏览器中显示
  const mrBtn = document.createElement('button'); mrBtn.id = 'mr'; mrBtn.className = 'primary'; mrBtn.style.display = 'none';
  mrBtn.innerHTML = bi(MR_UI.button.en, MR_UI.button.zh, MR_UI.button.es, MR_UI.button.pt); mrBtn.title = MR_UI.title.en;
  vrBtn.after(mrBtn);
  mrBtn.onclick = async () => {
    try { if (!(await xr.enter('ar'))) noticeQ(MR_UI.noAR, 6000); }
    catch (e) { console.error(e); notice('Could not start mixed reality: ' + e.message, '无法启动混合现实：' + e.message, 'No se pudo iniciar la realidad mixta: ' + e.message, 6000, 'Não foi possível iniciar a realidade mista: ' + e.message); }
  };
  // needs AR and VR (a headset with hands, e.g. Quest), not a phone's AR · 需要同时支持 AR 与 VR（头显），排除手机 AR
  Promise.all([xr.supportedAR(), xr.supported()]).then(([ar, vr]) => { if ((ar && vr) || /[?&]mr=1/.test(location.search)) mrBtn.style.display = ''; });
}
// Header: essentials + ☰ More (after Enter VR / MR exist) · 顶栏：常用按钮 + ☰ 更多
const headMenu = initHeadMenu({ quad });
// Hand sensitivity slider (remembered on this device) · 手势灵敏度
function setSensitivity(v) { sensitivity = clamp(Math.round(+v) || 3, 1, 5); tracker.setSensitivity(sensitivity); $('#sensitivity').value = sensitivity; $('#sensVal').textContent = sensitivity; try { localStorage.setItem('orbit-sens', sensitivity); } catch {} }
$('#sensitivity').oninput = e => setSensitivity(e.target.value);
try { setSensitivity(localStorage.getItem('orbit-sens') || 3); } catch { setSensitivity(3); }
let camStarting = false;
$('#cam').onclick = async () => {
  if (tracker.active) { tracker.stop(); document.body.classList.remove('cam-on'); $('#camera').classList.add('hidden'); $('#cam').innerHTML = bi('Enable Gestures', '启用手势'); return; }
  if (camStarting) return; camStarting = true; $('#cam').disabled = true; $('#cam').innerHTML = bi('Loading…', '加载中…');
  try {
    $('#camera').classList.remove('hidden'); document.body.classList.add('cam-on'); pill.innerHTML = bi('Starting camera…', '正在启动摄像头…');
    await tracker.start();
    $('#cam').innerHTML = bi('Disable Gestures', '关闭手势');
    featureIntro('gestures', 1200);   // after the 'Gestures on' notice · 在“手势已开启”提示之后
    notice('Gestures on: point ☝ at a planet and hold, or pinch 🤏, to open it. ✌ to talk.', '手势已开启：用 ☝ 指向行星并停留，或 🤏 捏合打开，✌ 开始对话。', 'Gestos activados: apunta ☝ a un planeta y espera, o pellizca 🤏, para abrirlo. ✌ para hablar.', 6500);
  } catch (e) {
    tracker.stop(); document.body.classList.remove('cam-on'); $('#camera').classList.add('hidden'); $('#cam').innerHTML = bi('Enable Gestures', '启用手势');
    if (e.name === 'NotAllowedError') notice('Camera permission denied. Mouse and voice still work.', '摄像头权限未开启，仍可使用鼠标和语音。', 'Permiso de cámara denegado. El ratón y la voz siguen funcionando.');
    else if (e.name === 'InsecureContext') notice('Open the page over https or http://localhost to use the camera.', '请通过 https 或 http://localhost 打开页面以使用摄像头。', 'Abre la página con https o http://localhost para usar la cámara.');
    else notice('Could not start hand tracking. Check the camera and the internet connection.', '手势追踪启动失败，请检查摄像头和网络连接。', 'No se pudo iniciar el seguimiento de la mano. Revisa la cámara y la conexión.');
  } finally { camStarting = false; $('#cam').disabled = false; }
};
addEventListener('pagehide', () => tracker.stop());

/* ───────── Ask Cosmo (AI + voice) · AI 向导 ───────── */
// 🔎 Cosmo's sourced fact pack: every body (NASA facts pages), pieces, landmarks, weekly missions, news and sky events; what you look at goes first
// Cosmo 的资料包：当前对象优先
function cosmoPack(planet) {
  const focusKey = mode === 'journey' && journey.piece ? 'p-' + journey.piece : mode === 'journey' && journey.level ? 'L:' + journey.level : planet && planet !== 'solar' ? 'b-' + planet : null;   // a level: its pieces first · 层级：其天体优先
  return buildPack({ bodies: [SUN, ...PLANETS], highlights: HIGHLIGHTS, pieces: PIECES, landmarks: LANDMARKS, missions: MISSIONS, news: NEWS, events: EVENTS, focus: focusKey });
}
const chat = initChat({ bi, getAsk: () => { const c = vrContext(); return c.kind === 'piece' || (c.kind === 'level' && c.id !== 'solar-system') ? vrQuestions(c) : null; }, getPlaceId: () => placeId(vrContext()), getContext: () => mode === 'focus' ? focus.p.id : 'solar', getPlace: () => { const id = currentPlace(); return id && id !== 'L:solar-system' && id[0] !== 'B' ? placeInfo(id)?.names || null : null; }, getPack: cosmoPack, onCommand: (t, l) => voiceCommand(t, l), actions: { select, home, lineup, pause: () => setPaused(true), resume: () => setPaused(false) },
  // the place is recorded when the question starts; an answer that arrives after you moved on is dropped · 提问时记录地点；离开后到达的回答不显示
  onExchange: e => { if (!xr.active()) return; if (e.state === 'thinking' || e.state === 'listening') vrAsk.ctx = vrContextKey(); else if (!e.cmd && vrAsk.ctx && vrAsk.ctx !== vrContextKey()) return;   // a command moves you on purpose: keep its reply · 指令会改变位置：保留回复
    vrAsk.open = true; vrAsk.shownAt = e.a || e.err ? performance.now() : 0; Object.assign(vrAsk, { q: e.q ?? (e.state === 'listening' ? null : vrAsk.q), a: e.a ?? null, links: e.links ?? null, err: e.err ?? null, state: e.state ?? null, cmd: !!e.cmd }); } });
// Keep the chat's "Talking about" line in step with the place on screen while the chat is open · 对话打开时同步当前地点
let chatPlaceKey = null; setInterval(() => { if (!chat.isOpen()) { chatPlaceKey = null; return; } const k = currentPlace(); if (k !== chatPlaceKey) { if (chatPlaceKey !== null) chat.refresh(); chatPlaceKey = k; } }, 700);
$('#talk').onclick = () => chat.startVoice();

/* ───────── Feature intros: the first open per visit, Cosmo says what it is · 功能介绍：每次访问首次打开时 ───────── */
const intros = createIntros();
function featureIntro(key, wait = 450) {
  const busy = () => tour?.active || document.body.classList.contains('demo');   // the tour/demo speaks its own lines · 游览/演示自带解说
  if (busy()) return;
  const it = intros.take(key); if (!it) return;
  if (it.voice === false) return chat.say(tr(it.text, lang()));           // mic is listening: written in the chat, not spoken · 麦克风在听：写在对话里
  setTimeout(() => {   // check again: never talk over the mic, a tour, or a planet's narration · 再次检查，不打断
    const now = speakingKey();   // another intro may be cut, a planet's narration may not · 可以打断另一段介绍，不打断天体解说
    if (busy() || $('#chatMic')?.classList.contains('live') || (now && !now.startsWith('intro-'))) return intros.release(key);
    narrate('intro-' + key, it.text);
  }, wait);
}
// Real user clicks only (the demo and VR entry click buttons from code); runs after each button's own handler · 仅响应真实点击
// Talk: only when THIS click started listening (a press can also stop it) · 只在这次点击开始收听时
let talkWasLive = false;
$('#talk').addEventListener('click', () => { talkWasLive = !!$('#chatMic')?.classList.contains('live'); }, { capture: true });
for (const [sel, key, opened] of [['#habitability', 'habitability'], ['#asteroidOpen', 'asteroids'], ['#resourcesOpen', 'resources'],
  ['#trajectory', 'trails', () => mode === 'trajectory'], ['#lineup', 'compare', () => mode === 'lineup'],
  ['#chatBtn', 'cosmo', () => chat.isOpen()], ['#talk', 'talk', () => !talkWasLive && $('#chatMic')?.classList.contains('live')]])
  $(sel)?.addEventListener('click', e => { if (e.isTrusted && (!opened || opened())) featureIntro(key); });
// The planet sheet's Ask Cosmo button is rebuilt with #info, so listen on #info · 面板里的按钮会重建，故在 #info 上监听
$('#info').addEventListener('click', e => { if (e.isTrusted && e.target.closest('#askAbout') && chat.isOpen()) featureIntro('cosmo'); });

/* ───────── First-visit welcome · 首次欢迎 ───────── */
const welcome = initWelcome({ quad, actions: { solar: () => ladderGo('L:solar-system'), zoom: () => ladderGo('L:universe'), planet: () => select('saturn'), cosmo: () => chat.open(), tour: () => startTour() } });
/* ───────── Tour with Cosmo · 跟 Cosmo 游览 ───────── */
// Universe → down the ladder → Solar System → each planet → land on Earth → back up to the universe → "where to start?"
// 宇宙 → 沿阶梯向下 → 太阳系 → 各行星 → 降落地球 → 回到宇宙 → “从哪里开始？”
const curLevel = () => mode === 'journey' && journey.level ? journey.level : 'solar-system';
tour = createTour({
  fly: st => {
    demoCard(st.card); if (demoOn && !st.chat) chat?.close?.();
    if (demoOn) demoAct(st);   // the new features (harp, birthday star, collision) and their clean-up · 演示新功能
    if (!st.what && whatNow) closeWhat();
    // demo: open a "What is this?" card once the planet's labels exist (the step's own line is spoken by the tour) · 演示：打开“这是什么？”卡片
    if (st.what) setTimeout(() => { const it = focus?.hl?.items.find(i => i.key === st.what); if (it && tour.step === st && !tour.paused) openWhat(focus, it, false); }, 800);   // as Cosmo starts the line · 与解说同时
    clearTimeout(favTip.show); if (!demoOn && tour.index === 0) favTip.show = setTimeout(() => favTip(FAV_UI.tip), 4000); else if (demoOn && st.key === 'tour-saturn') favTip.show = setTimeout(() => favTip(FAV_UI.demoTip, true), 2500);   // ★ once · 只说一次
    if (st.go) {
      if (mode === 'journey' && journey.level === st.go) { if (journey.piece) closePiece(); return; }
      goLevel(st.go, levelIndex(st.go) < levelIndex(curLevel()) ? 'up' : 'down');
    } else if (st.home) home();
    else if (st.piece) openPiece(st.piece);
    else if (st.act === 'nav' && st.select) {   // demo: open the bar's ▾ list, light the planet, then go · 演示：打开底栏列表再前往
      openNavPlanets(); highlightNav(st.select); demoNavUntil = performance.now() + 1700;
      setTimeout(() => { if (tour.step !== st) return; closeNavPlanets(); select(st.select); }, 1600);
    }
    else if (st.select) select(st.select);
  },
  busy: () => tour.step?.card === 'title' ? false : journey.busy || trans < 1 || performance.now() < demoNavUntil,   // the title card doesn't wait for the opening zoom · 标题卡不等开场动画
  say: st => {
    if (st.chat) { const l = lang(); chat.open({ focus: false }); if (!st.asked) st.asked = chat.ask(st.chat.q[l] || st.chat.q.en, false, st.chat.a[l] || st.chat.a.en) || true; }   // resuming says the line again but asks once · 继续时只问一次
    narrate(st.key, st.text); setTimeout(renderTourBar, 0);   // after the runner has switched to 'say' (the bar shows the line then) · 在切换到朗读阶段之后
    if (st.ask) { setLadderOpen(true); ladder.classList.add('beckon'); clearTimeout(tour.beckon); tour.beckon = setTimeout(() => ladder.classList.remove('beckon'), 9000); }
  },
  hush: () => stopNarration(),
  speaking: () => !!window.__stellarSpeaking,
  voiceOn: () => voiceStatus().enabled,
  lang: () => lang(),
  onChange: () => renderTourBar(),
  onEnd: finished => { renderTourBar(); if (demoOn) { demoAct({});  demoOn = false; document.body.classList.remove('demo'); if (!finished) demoCard(null); } },
});
/* ───────── Demo for the video (?demo=1) · 演示模式 ───────── */
// Same runner as the tour, another step list (demo.js): cards, the ladder, a piece, planets, Ask Cosmo · 与游览同一运行器
let demoOn = false;
const demoEl = document.createElement('section'); demoEl.id = 'demoCard'; demoEl.className = 'democard'; demoEl.hidden = true;
document.body.append(demoEl);
function demoCard(id) {
  const c = id && DEMO_CARDS[id];
  document.body.classList.toggle('demo-card', !!c);
  if (!c) { demoEl.classList.remove('show'); demoEl.hidden = true; return; }
  demoEl.innerHTML = `${c.logo ? `<img class="demologo" src="${c.logo}" alt="CosmoVerse">` : `<h1>${quad(c.head)}</h1>`}${c.video ? `<video src="${c.video}" autoplay muted playsinline preload="auto"></video>` : ''}${c.icons ? `<ol>${c.icons.map(([i, t]) => `<li><i>${i}</i><span>${quad(t)}</span></li>`).join('')}</ol>` : ''}${c.lines.map(t => `<p>${quad(t)}</p>`).join('')}`;
  demoEl.dataset.card = id; demoEl.hidden = false; requestAnimationFrame(() => demoEl.classList.add('show'));
}
// Demo actions for the new features; each step clears what the previous one opened · 演示动作；每步清理上一步
let demoBirth = null, demoNavUntil = 0;
function demoAct(st) {
  if (st.act !== 'harp' && harpOn) setHarp(false);
  if (st.act !== 'merge' && mergeOn) setMerge(false);
  const menuOpen = $('#moreBtn')?.getAttribute('aria-expanded') === 'true';
  if (st.act === 'more' ? !menuOpen : menuOpen) $('#moreBtn')?.click();   // ☰ More open only on its step · 只在该步打开“更多”
  if (st.act !== 'birthday' && demoBirth) { bsCard.hidden = true; bsYear = demoBirth.saved; demoBirth = null; }
  if (st.act === 'harp') {
    home(); setHarp(true);
    const t = setInterval(() => { if (tour.step !== st) return clearInterval(t);
      if (mode === 'overview' && trans >= 1) { clearInterval(t); harpAll(); setTimeout(() => { if (tour.step === st && harpOn) harpAll(); }, 2700); } }, 200);
  } else if (st.act === 'birthday') {   // shows 1998 without saving it on this device · 只显示，不保存
    demoBirth = { saved: bsYear }; bsYear = DEMO_BIRTH_YEAR; renderBS(); bsCard.hidden = false;
  } else if (st.act === 'merge') { setMerge(true); mergePlay(); }
}
function startDemo() {
  welcome.close(); chat?.close?.(); setLadderOpen(false);
  demoOn = true; document.body.classList.add('demo');
  tour.start(performance.now(), demoSteps());
}
// After the demo the closing card stays (for the last frames of the video) until a click or a key · 结束卡片保留到点击或按键
addEventListener('pointerdown', () => { if (!demoOn) demoCard(null); });
addEventListener('keydown', () => { if (!demoOn) demoCard(null); });
// Browsers keep sound off until the first click, so the demo waits for one (the title card says so) · 浏览器需要先点击才有声音
if (/[?&]demo=1/.test(location.search)) setTimeout(() => {
  if (navigator.userActivation?.isActive || navigator.userActivation?.hasBeenActive) return startDemo();
  demoCard('title'); demoEl.insertAdjacentHTML('beforeend', `<p class="democlick">${quad(DEMO_UI.click)}</p>`);
  const go = () => { removeEventListener('pointerdown', go, true); removeEventListener('keydown', go, true); setTimeout(startDemo, 600); };
  addEventListener('pointerdown', go, true); addEventListener('keydown', go, true);
}, 1500);
function startTour() {
  demoOn = false; document.body.classList.remove('demo'); demoCard(null);
  welcome.close(); chat?.close?.(); sfx('chime');
  if (innerWidth <= 760) setLadderOpen(false);
  tour.start(performance.now());
}
const tourLabel = () => !tour?.active ? TOUR_UI.start : tour.paused ? TOUR_UI.resume : TOUR_UI.pause;
const tourKey = () => !tour?.active ? 'T0|' : tour.paused ? 'T2|' : 'T1|';
const stepTitle = st => st.select ? Object.fromEntries(['en', 'zh', 'es', 'pt'].map((k, i) => [k, nameOf(bodyById[st.select].p)[i]])) : st.title || TOUR_UI.title;
// Bar on the page: where we are, pause/resume, stop; the line itself when the voice is off · 页面上的游览条
const tourBar = document.createElement('section'); tourBar.id = 'tourBar'; tourBar.className = 'tourbar'; tourBar.hidden = true; tourBar.setAttribute('aria-live', 'polite');
document.body.append(tourBar);
tourBar.onclick = e => { const b = e.target.closest('button'); if (!b) return; if (b.dataset.t === 'stop') tour.stop(); else tour.toggle(performance.now()); };
let tourBarKey = '';
function renderTourBar() {
  document.body.classList.toggle('tour-paused', !!tour?.paused);
  if (!tour?.active) { tourBar.hidden = true; tourBarKey = ''; document.body.classList.remove('touring'); return; }
  const st = tour.step, quiet = !voiceStatus().enabled, k = [tour.index, tour.paused, quiet, tour.state.phase === 'fly'].join();
  document.body.classList.add('touring');
  if (k === tourBarKey) return; tourBarKey = k; tourBar.hidden = false;
  tourBar.innerHTML = `<div class="eyebrow">◉ ${quad(TOUR_UI.title)} · ${tour.index + 1}/${tour.steps.length}${tour.paused ? ` · ${quad(TOUR_UI.paused)}` : ''}</div>
    <b class="ttitle">${quad(stepTitle(st))}</b>${(quiet || st.user) && tour.state.phase !== 'fly' ? `<p>${quad(st.text)}</p>${st.user ? `<small class="tuser">✎ ${quad(UT_UI.userNote)}</small>` : ''}` : ''}
    <div class="tbtns"><button type="button" class="primary" data-t="toggle">${quad(tour.paused ? TOUR_UI.resume : TOUR_UI.pause)}</button><button type="button" data-t="stop">${quad(TOUR_UI.stop)}</button></div>
    <small>${quad(TOUR_UI.hint)}</small>`;
}
// Any click elsewhere pauses the tour (the bar and the tour row don't) · 点击其他地方暂停
addEventListener('pointerdown', e => { if (tour.active && !tour.paused && !(e.target.closest?.('#moreMenu') && !e.target.closest('button')) && !e.target.closest?.('#tourBar, #vr, #mr, [data-go="T:tour"], #voiceToggle, #language, #moreBtn, .mg-settings, .favrow, .favstar, #ladder .ltoggle, #musicToggle, #musicOptions, #musicPanel, #helpBtn')) tour.pause(performance.now()); }, true);
// VR panel during the tour: the stop's name and line · VR 面板
// The VR ladder panel's rows (also used by the VR harness) · VR 阶梯面板的行
const vrMenu = () => { const l = lang(); return { title: tr(JUI.goTo, l), rows: [...(xr.mrState() ? [{ id: 'M:place', text: tr(MR_UI.menuRow, l), depth: 0, color: '#9fe8c4', on: xr.mrState().placing }] : []), { id: 'G:guide', text: tr(GUIDE_UI.button, l), depth: 0, color: '#7dffcf', on: guideVR }, { id: 'T:tour', text: tr(tourLabel(), l), depth: 0, color: '#8bd6ff', on: !!tour?.active && !tour.paused }, { id: 'U:down', text: tr(ME_UI.down, l), depth: 0, color: '#7dffcf' }, { id: 'U:up', text: tr(ME_UI.up, l), depth: 0, color: '#7dffcf' }, { id: 'V:narration', text: tr(voiceStatus().enabled ? NARRATION_UI.on : NARRATION_UI.off, l), depth: 0, color: '#c9d6e3', on: voiceStatus().enabled }, ...whatRows(l), ...cosmoRows(l), ...logRows(l), ...pmRows(l), ...bsRows(l), ...harpRows(l), ...mergeRows(l), ...newsRows(l), ...calRows(l), ...ladderRows(ladderState()).map(r => ({ id: r.id, text: tr(r.names, l), depth: r.depth, color: r.color, on: r.on, here: r.here })), { id: 'R:refs', text: tr(REF_UI.vrRow, l), depth: 0, color: '#c9d6e3', on: refsVR }, ...favMenuRows(l)] }; };   // 📚 after the ladder, before ★ (which stays last) · 放在阶梯之后
/* ───────── "What is this?": moons, spacecraft and surface landmarks in a close-up (click, point + hold, VR rows) · “这是什么？” ───────── */
const whatCard = document.createElement('section'); whatCard.id = 'whatCard'; whatCard.className = 'whatcard'; whatCard.hidden = true;
whatCard.setAttribute('role', 'dialog'); whatCard.setAttribute('aria-labelledby', 'whatName'); document.body.append(whatCard);
const arr4 = a => ({ en: a[0], zh: a[1], es: a[2] ?? a[0], pt: a[3] ?? a[0] });
function openWhat(b, it, speak = true) {
  whatNow = { b, it }; if (speak) seenTick(it.key); const kind = WHAT_UI[it.type] || WHAT_UI.spot, esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  whatCard.innerHTML = `<div class="jtop"><div class="eyebrow">${quad(WHAT_UI.title)} · ${quad(kind)}</div><button type="button" class="jback" id="whatClose" aria-label="${tr(WHAT_UI.close, lang())}">✕</button></div>
    <h3 id="whatName">${quad(arr4(it.label))}</h3><p>${quad(arr4(it.text || it.label))}${it.source ? ` <a class="src" href="${esc(it.source.url)}" target="_blank" rel="noopener">${esc(it.source.name)} ↗</a>` : ''}</p>
    <button type="button" class="whatask">💬 ${quad(WHAT_UI.ask)}</button>`;
  whatCard.hidden = false; if (speak) tour?.pause(performance.now());   // the demo opens it itself (speak = false) and must keep playing · 演示自己打开时不暂停
  if (speak && it.text) narrate(it.key, arr4(it.text));
}
function closeWhat() { whatCard.hidden = true; whatNow = null; }
whatCard.addEventListener('click', e => {
  if (e.target.closest('#whatClose')) return closeWhat();
  if (e.target.closest('.whatask') && whatNow) { const l = lang(), q = whatQuestion(arr4(whatNow.it.label), arr4(nameOf(whatNow.b.p)))[l]; closeWhat(); chat.open({ focus: false }); chat.ask(q, false); }
});
addEventListener('keydown', e => { if (e.key === 'Escape' && !whatCard.hidden) { closeWhat(); e.stopImmediatePropagation(); } }, true);
// Webcam hand: the label under the cursor (point + hold opens it) · 摄像头手势：光标下的标签
const mtagAt = (x, y) => { for (const el of document.elementsFromPoint(x, y)) if (el.closest?.('.mtag')) return el.closest('.mtag'); return null; };
// VR: "ℹ What is this?" row in a close-up; open, the planet's moons / spacecraft / landmarks are rows · VR：特写中的“这是什么？”行
const focusItems = () => mode === 'focus' && focus?.hl ? focus.hl.items : [];
function whatRows(l) {
  const items = focusItems(); if (!items.length) return [];
  const head = { id: 'W:open', text: tr(WHAT_UI.vrRow, l), depth: 0, color: '#9fe3ff', on: whatVR };
  if (!whatVR) return [head];
  return [head, ...(whatNow ? [{ id: 'W:ask', text: tr(WHAT_UI.vrAsk, l), depth: 1, color: '#b48cff' }] : []), ...items.map((it, i) => ({ id: 'W:' + i, text: `${tr(arr4(it.label), l)} · ${tr(WHAT_UI[it.type] || WHAT_UI.spot, l)}`, depth: 1, color: it.type === 'craft' ? '#9fe3ff' : it.type === 'spot' ? '#ffb36b' : '#d8dee8', on: whatNow?.it === it }))];
}
function whatGo(id) {
  if (id === 'W:open') { whatVR = whatVR ? false : focus?.p.id || false; if (!whatVR) whatNow = null; return true; }
  if (id === 'W:ask') { if (!whatNow) return false; const l = lang(); vrAsk.open = true; chat.ask(whatQuestion(arr4(whatNow.it.label), arr4(nameOf(whatNow.b.p)))[l], true); whatNow = null; return true; }
  const it = focusItems()[+id.slice(2)]; if (!it) return false;
  openWhat(focus, it); whatCard.hidden = true; return true;   // VR shows it on the panel, not the page card · VR 显示在面板上
}
function whatPanel() {
  const l = lang(), it = whatNow.it;
  return { eyebrow: `${tr(WHAT_UI.title, l)} · ${tr(WHAT_UI[it.type] || WHAT_UI.spot, l)}`.toUpperCase(), title: tr(arr4(it.label), l), accent: '#9fe3ff',
    text: tr(arr4(it.text || it.label), l) + (it.source ? ` (${it.source.name})` : ''), facts: [], hint: tr(WHAT_UI.vrHint, l), hintColor: '#9fe3ff' };
}
/* ───────── ✎ Make your own tour: stops + your own lines, shared as a link (#tour=…), played by the tour runner · 制作你的游览 ───────── */
const UT_KEY = 'cv-mytour', SOLAR_LINE = L4(l => ({ en: 'Back home: our Solar System.', zh: '回到家园：我们的太阳系。', es: 'De vuelta a casa: nuestro sistema solar.', pt: 'De volta para casa: o nosso Sistema Solar.' })[l]);   // app text, no facts · 应用文字，无事实
const LI = ['en', 'zh', 'es', 'pt'];
// Cosmo's own line for a stop (already sourced texts: level blurbs, planet and piece narration) · Cosmo 的默认台词（已有来源）
function defaultLine(id) {
  const k = id[0], v = id.slice(2);
  if (id === 'L:solar-system') return SOLAR_LINE;
  if (k === 'L') return levelSpeech(levelById(v)?.blurb) || SOLAR_LINE;
  if (k === 'B') return Object.fromEntries(LI.map((l, i) => [l, firstSentence(NARRATION[v]?.[i])]));
  const p = PIECES.find(x => x.id === v); return Object.fromEntries(LI.map(l => [l, firstSentence(p?.narration?.[l])]));
}
const utPlaces = () => [...LEVELS.map(lv => 'L:' + lv.id), ...ladderBodies.map(b => 'B:' + b.id), ...PIECES.map(p => 'P:' + p.id)].filter(id => placeInfo(id));
const utValid = id => !!placeInfo(id);
let utDraft = (() => { try { return sanitizeTour(JSON.parse(localStorage.getItem(UT_KEY) || 'null'), utValid) || { t: '', s: [] }; } catch { return { t: '', s: [] }; } })();
const utSave = () => { try { localStorage.setItem(UT_KEY, JSON.stringify(utDraft)); } catch {} };
// Steps for the tour runner · 给游览运行器的步骤
function utSteps(t) {
  return t.s.map(([id, text], i) => {
    const k = id[0], v = id.slice(2), line = text ? Object.fromEntries(LI.map(l => [l, text])) : defaultLine(id);
    const place = id === 'L:solar-system' ? { home: true } : k === 'L' ? { go: v } : k === 'B' ? { select: v } : { piece: v };
    // empty line: Cosmo's own key, so its recorded clip / server voice plays; a user line: 'ut-…' (browser voice) · 空行用 Cosmo 的语音
    const key = text ? 'ut-' + i : id === 'L:solar-system' ? 'ut-' + i : k === 'L' ? 'level-' + v : k === 'B' ? v : 'piece-' + v;
    return { key, text: line, title: placeInfo(id).names, user: !!text, ...place };
  });
}
function playUserTour(t) {
  utCard.hidden = true; utStart.hidden = true; welcome.close(); chat?.close?.(); demoOn = false;
  if (innerWidth <= 760) setLadderOpen(false);
  tour.start(performance.now(), utSteps(t));
}
const utCard = document.createElement('section'); utCard.id = 'utCard'; utCard.className = 'calcard utcard'; utCard.hidden = true;
utCard.setAttribute('role', 'dialog'); utCard.setAttribute('aria-labelledby', 'utTitle'); document.body.append(utCard);
function renderUT(focusSel) {
  const l = lang();
  utCard.innerHTML = `<div class="jtop"><div class="eyebrow" id="utTitle">${quad(UT_UI.title)}</div><button type="button" class="jback" id="utClose">✕ ${quad(UT_UI.close)}</button></div>
    <p class="calintro">${quad(UT_UI.intro)}</p>
    <label class="utname"><small>${quad(UT_UI.name)}</small><input id="utName" maxlength="${UT_MAX_TITLE}"></label>
    <ol class="utstops"></ol>
    <div class="utadd"><select id="utPick" aria-label="${tr(UT_UI.add, l)}"></select><button type="button" id="utAdd">＋ ${quad(UT_UI.add)}</button><button type="button" id="utHere">⌖ ${quad(UT_UI.addHere)}</button></div>
    <div class="utgo"><button type="button" class="primary" id="utPlay">${quad(UT_UI.play)}</button><button type="button" id="utCopy">${quad(UT_UI.copy)}</button></div>
    <input id="utLink" class="utlink" readonly hidden aria-label="${tr(UT_UI.copy, l)}">`;
  $('#utName').value = utDraft.t; $('#utName').placeholder = tr(UT_UI.namePh, l);
  const ol = utCard.querySelector('.utstops');
  if (!utDraft.s.length) { const p = document.createElement('p'); p.className = 'utempty'; p.innerHTML = quad(UT_UI.empty); ol.append(p); }
  utDraft.s.forEach(([id, text], i) => {   // user text only through .value / textContent · 用户文字只用 value / textContent
    const li = document.createElement('li'), info = placeInfo(id);
    li.innerHTML = `<div class="uthead"><i style="--c:${info.color}"></i><b>${quad(info.names)}</b><span class="utbtns"><button type="button" data-ut="up" aria-label="${tr(UT_UI.up, l)}">↑</button><button type="button" data-ut="down" aria-label="${tr(UT_UI.down, l)}">↓</button><button type="button" data-ut="del" aria-label="${tr(UT_UI.remove, l)}">✕</button></span></div><textarea rows="2" maxlength="${UT_MAX_TEXT}" aria-label="${tr(UT_UI.line, l)}"></textarea>`;
    li.dataset.i = i; const ta = li.querySelector('textarea'); ta.value = text; ta.placeholder = tr(defaultLine(id), l); ol.append(li);
  });
  const pick = $('#utPick');
  for (const id of utPlaces()) { const o = document.createElement('option'); o.value = id; o.textContent = tr(placeInfo(id).names, l); pick.append(o); }
  const full = utDraft.s.length >= UT_MAX_STOPS; $('#utAdd').disabled = full; $('#utHere').disabled = full || !currentPlace();
  $('#utPlay').disabled = $('#utCopy').disabled = !utDraft.s.length;
  if (full) { const p = document.createElement('p'); p.className = 'utempty'; p.innerHTML = quad(UT_UI.full); utCard.querySelector('.utadd').after(p); }
  if (focusSel) utCard.querySelector(focusSel)?.focus();
}
function openUT() { renderUT('#utName'); utCard.hidden = false; }
$('#tourMake').onclick = () => openUT();
utCard.addEventListener('input', e => {
  if (e.target.id === 'utName') utDraft.t = e.target.value.slice(0, UT_MAX_TITLE);
  const li = e.target.closest('li[data-i]'); if (li && e.target.tagName === 'TEXTAREA') utDraft.s[+li.dataset.i][1] = e.target.value.slice(0, UT_MAX_TEXT);
  utSave();
});
utCard.addEventListener('click', async e => {
  const b = e.target.closest('button'); if (!b) return;
  if (b.id === 'utClose') { utCard.hidden = true; $('#moreBtn')?.focus(); return; }
  const li = b.closest('li[data-i]'), i = li ? +li.dataset.i : -1, s = utDraft.s;
  if (b.dataset.ut === 'up' && i > 0) [s[i - 1], s[i]] = [s[i], s[i - 1]];
  else if (b.dataset.ut === 'down' && i < s.length - 1) [s[i + 1], s[i]] = [s[i], s[i + 1]];
  else if (b.dataset.ut === 'del') s.splice(i, 1);
  else if (b.id === 'utAdd' && s.length < UT_MAX_STOPS) s.push([$('#utPick').value, '']);
  else if (b.id === 'utHere' && s.length < UT_MAX_STOPS && currentPlace()) s.push([currentPlace(), '']);
  else if (b.id === 'utPlay') { const t = sanitizeTour(utDraft, utValid); if (t) playUserTour(t); return; }
  else if (b.id === 'utCopy') {
    const t = sanitizeTour(utDraft, utValid); if (!t) return;
    const url = location.href.split('#')[0].replace(/[?&]start=[^&]*/, '') + '#tour=' + encodeTour(t), box = $('#utLink');
    box.hidden = false; box.value = url; box.select();
    try { await navigator.clipboard.writeText(url); } catch {}   // the link stays selectable in the box too · 链接也可以在框中复制
    noticeQ(UT_UI.copied, 3000); return;
  } else return;
  utSave(); renderUT(b.id === 'utAdd' || b.id === 'utHere' ? '#utAdd' : null);
});
addEventListener('keydown', e => { if (e.key === 'Escape' && !utStart.hidden) { utStart.hidden = true; e.stopImmediatePropagation(); return; }
  if (e.key === 'Escape' && !utCard.hidden && !e.target.closest?.('textarea, input')) { utCard.hidden = true; e.stopImmediatePropagation(); $('#moreBtn')?.focus(); } }, true);
// Opening a shared link: a start card (voice needs a click first in most browsers) · 打开分享链接：开始卡片
const utStart = document.createElement('section'); utStart.id = 'utStart'; utStart.className = 'calcard utstart'; utStart.hidden = true;
utStart.setAttribute('role', 'dialog'); utStart.setAttribute('aria-labelledby', 'utStartTitle'); document.body.append(utStart);
function checkSharedTour() {
  const shared = tourFromHash(location.hash, utValid);
  if (shared === false) setTimeout(() => noticeQ(UT_UI.bad, 6000), 1500);
  else if (shared) {
    utStart.innerHTML = `<div class="eyebrow">${quad(UT_UI.shared)}</div><h3 id="utStartTitle"></h3><p class="utcount">${quad(L4(l => UT_UI.stops[l].replace('{n}', shared.s.length)))}</p>
      <button type="button" class="primary" id="utGo">${quad(UT_UI.start)}</button> <button type="button" class="jback" id="utNo">✕ ${quad(UT_UI.close)}</button>`;
    utStart.querySelector('#utStartTitle').textContent = shared.t || tr(UT_UI.title, lang());   // user text: textContent only · 用户文字只用 textContent
    utStart.hidden = false; welcome.close();
    utStart.onclick = e => { if (e.target.closest('#utGo')) playUserTour(shared); else if (e.target.closest('#utNo')) utStart.hidden = true; };
  }
}
checkSharedTour(); addEventListener('hashchange', checkSharedTour);   // a second link pasted into an open tab · 在已打开的页面中粘贴新链接
/* ───────── 📔 Explorer's logbook + 🌌 Cosmic daily: stamps, ranks, place of the day, streak (per browser) · 探险日志与每日宇宙 ───────── */
const LOG_KEY = 'cv-logbook';
const isDay = d => typeof d === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(d), isObj = v => !!v && typeof v === 'object' && !Array.isArray(v);
// Stored data is untrusted: keep only the expected shape (bad data must never stop the page) · 存储数据不可信：只保留预期结构
const logBook = (() => { let v = null; try { v = JSON.parse(localStorage.getItem(LOG_KEY) || 'null'); } catch {}
  const d = isObj(v?.daily) ? v.daily : {}, streak = Number.isInteger(d.streak) && d.streak > 0 && d.streak < 1e5 ? d.streak : 0;
  const m = isObj(v?.mission) ? v.mission : {}, wk = typeof m.week === 'string' && /^\d{4}-W\d{2}$/.test(m.week) ? m.week : null;
  return { stamps: isObj(v?.stamps) ? v.stamps : {}, daily: { last: isDay(d.last) ? d.last : null, streak: isDay(d.last) ? streak : 0, ...(isDay(d.got) ? { got: d.got } : {}) },
    seen: isObj(v?.seen) ? v.seen : {}, sets: isObj(v?.sets) ? v.sets : {},   // "What is this?" items found · completed collections · 已找到的对象 · 已集齐的收藏册
    mission: { week: wk, done: wk && Array.isArray(m.done) ? m.done.filter(x => weekMissions(wk).some(w => w.id === x)) : [] },   // only this stored week's mission ids · 只保留该周任务
    weeks: Array.isArray(v?.weeks) ? v.weeks.filter(x => typeof x === 'string' && /^\d{4}-W\d{2}$/.test(x)).slice(-200) : [] }; })();
for (const id of Object.keys(logBook.stamps)) if (!/^(L|B|P):[a-z0-9-]{1,40}$/.test(id) || !placeInfo(id) || !isDay(logBook.stamps[id])) delete logBook.stamps[id];   // stored data is untrusted · 存储数据不可信
// Collections: planets, moons, spacecraft (from highlights.js), galaxies, nebulae (journey pieces) · 收藏册的内容
const pieceItem = id => { const p = placeInfo(id); return p && { key: id, names: p.names, color: p.color }; };
const COLL_ITEMS = (() => { const moons = [], craft = [], uniq = (list, it) => { if (!list.some(x => x.key === it.key)) list.push(it); };
  for (const b of ladderBodies) { const H = HIGHLIGHTS[b.id]; if (!H) continue;
    for (const m of H.moons || []) uniq(moons, { key: 'moon-' + m[0].toLowerCase(), names: arr4([m[0], m[1], m[2], moonPT(m)[0]]), color: '#d8dee8', at: 'B:' + b.id });
    if (H.craft) uniq(craft, { key: 'craft-' + H.craft.kind, names: arr4(H.craft.name), color: '#9fe3ff', at: 'B:' + b.id }); }
  return { planets: ladderBodies.filter(b => PLANETS.some(p => p.id === b.id)).map(b => ({ key: 'B:' + b.id, names: b.names, color: b.color })),
    moons, craft, galaxies: GALAXY_PIECES.map(pieceItem).filter(Boolean), nebulae: NEBULA_PIECES.map(pieceItem).filter(Boolean) }; })();
const SEEN_KEYS = new Set([...COLL_ITEMS.moons, ...COLL_ITEMS.craft].map(x => x.key).concat(Object.values(LANDMARKS).flat().map(lm => 'spot-' + lm.id)));
for (const k of Object.keys(logBook.seen)) if (!SEEN_KEYS.has(k) || !isDay(logBook.seen[k])) delete logBook.seen[k];   // stored data is untrusted · 存储数据不可信
for (const k of Object.keys(logBook.sets)) if (!COLLECTIONS.some(c => c.id === k) || !isDay(logBook.sets[k])) delete logBook.sets[k];
const collProg = () => collectionProgress(COLL_ITEMS, k => !!(logBook.stamps[k] || logBook.seen[k]));
const missionFly = m => m.fly || m.target;
// A landmark mission flies to its planet; then say how to find the spot · 地标任务：飞到行星后提示如何找到
const spotHint = m => { if (m?.target.startsWith('spot-')) setTimeout(() => { if (mode === 'focus' && !whatNow) noticeQ(WHAT_UI.hint, 6000); }, 2600); };
const missionsNow = () => { const w = weekKey(); if (logBook.mission.week !== w) { logBook.mission.week = w; logBook.mission.done = []; } return weekMissions(w); };
// After a stamp or a "What is this?" find: collections and this week's missions · 印章或“这是什么？”之后：收藏册与本周任务
function progressTick(key, before) {
  const quiet = !!tour?.active || demoOn; missionsNow();
  for (const c of newlyComplete(before, collProg())) if (!logBook.sets[c.id]) { logBook.sets[c.id] = dayKey(); if (!quiet) celebrate(L4(l => `${c.icon} ${fill(COLL_UI.complete, { c: c.names })[l]}`)); }
  const fresh = completeMissions(logBook.mission, key, weekKey());
  if (fresh.length && !quiet) {
    if (doneCount(logBook.mission) >= missionsNow().length) celebrate(L4(l => `🎯 ${COLL_UI.weekDone[l]}`));
    else noticeQ(L4(l => `🎯 ${fill(COLL_UI.missionNew, { m: fresh[0].text })[l]}`), 3200);
  }
  if (fresh.length && doneCount(logBook.mission) >= missionsNow().length && !logBook.weeks.includes(logBook.mission.week)) logBook.weeks.push(logBook.mission.week);
}
function seenTick(key) {
  if (!SEEN_KEYS.has(key)) return; const before = collProg(), isNew = !logBook.seen[key];
  if (isNew) logBook.seen[key] = dayKey(); progressTick(key, before); logSave(); if (!logCard.hidden) openLog(false);
}
const logSave = () => { try { localStorage.setItem(LOG_KEY, JSON.stringify(logBook)); } catch {} };
const logCount = () => Object.keys(logBook.stamps).length, logTotal = () => utPlaces().length;
const dailyId = () => placeOfDay(utPlaces(), dayKey());
let logLast = null;
// Called every frame with the current place (cheap: only acts when the place changes) · 每帧调用，地点变化时才处理
function logTick(here) {
  if (here === logLast) return; logLast = here; if (!here) return;
  const before = rankOf(logCount()), quiet = !!tour?.active, today = dayKey(), collBefore = collProg();
  if (addStamp(logBook.stamps, here, today, id => !!placeInfo(id))) {
    const after = rankOf(logCount());
    if (after !== before) celebrate(fill(LOG_UI.rankUp, { r: after.name }));
    else if (!quiet) noticeQ(fill(LOG_UI.stamp, { p: placeInfo(here).names }), 2200);
  }
  if (here === dailyId() && logBook.daily.got !== today) {   // today's place: stamp of the day + streak · 今日地点
    Object.assign(logBook.daily, nextStreak(logBook.daily, today), { got: today });
    celebrate(L4(l => `🌌 ${LOG_UI.todayDone[l]} · 🔥 ${streakText(logBook.daily.streak)[l]}`)); renderDaily();
  }
  progressTick(here, collBefore); logSave();
}
// A short celebration: a glowing toast, a chime and a burst · 小小的庆祝
const celEl = document.createElement('div'); celEl.className = 'celebrate'; celEl.hidden = true; celEl.setAttribute('role', 'status'); document.body.append(celEl);
function celebrate(text) {
  celEl.innerHTML = `<span class="burst" aria-hidden="true">${'<i></i>'.repeat(12)}</span>${quad(text)}`; celEl.hidden = false; celEl.classList.remove('go'); void celEl.offsetWidth; celEl.classList.add('go');
  if (!tour?.active && !demoOn) sfx('chime'); clearTimeout(celebrate.t); celebrate.t = setTimeout(() => { celEl.hidden = true; }, 4200);
}
const logCard = document.createElement('section'); logCard.id = 'logCard'; logCard.className = 'calcard logcard'; logCard.hidden = true;
logCard.setAttribute('role', 'dialog'); logCard.setAttribute('aria-labelledby', 'logTitle'); document.body.append(logCard);
function dailyHTML() {
  const id = dailyId(), info = id && placeInfo(id), got = logBook.daily.got === dayKey(), st = liveStreak(logBook.daily);
  if (!info) return '';
  const tmr = placeInfo(placeOfDay(utPlaces(), tomorrowKey()));
  return `<div class="daily"><div class="dhead">🌌 ${quad(LOG_UI.today)}</div><b><i style="--c:${info.color}"></i>${quad(info.names)}</b>
    <p>${quad(defaultLine(id))}</p>
    <div class="drow">${got ? `<span class="dgot">✓ ${quad(LOG_UI.todayDone)}</span>` : `<button type="button" class="primary dfly" data-fly="${id}">${quad(LOG_UI.fly)}</button> <small>${quad(LOG_UI.todayAsk)}</small>`}</div>
    <div class="drow"><span class="dstreak">🔥 ${quad(streakText(st))}</span>${tmr ? ` <small class="dtmr">${quad(fill(LOG_UI.tomorrow, { p: tmr.names }))}</small>` : ''}</div></div>`;
}
// 🎯 This week's missions and 🏅 Collections in the logbook card · 日志卡片中的每周任务与收藏册
const logEsc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
function missionsHTML() {
  const list = missionsNow(), done = logBook.mission.done, n = list.filter(m => done.includes(m.id)).length;
  return `<div class="dhead">🎯 ${quad(COLL_UI.missions)} · ${quad(fill(COLL_UI.missionsDone, { n, t: list.length }))}</div><ol class="lmissions">${list.map(m => { const ok = done.includes(m.id);
    return `<li class="${ok ? 'ok' : ''}"><b aria-hidden="true">${ok ? '✓' : '○'}</b><span>${quad(m.text)} <a class="src" href="${logEsc(m.source.url)}" target="_blank" rel="noopener" title="${tr(COLL_UI.source, lang())}">${logEsc(m.source.name)} ↗</a></span>${ok ? '' : `<button type="button" class="dfly" data-fly="${missionFly(m)}" data-mission="${m.id}">${quad(COLL_UI.go)}</button>`}</li>`; }).join('')}</ol>
    <p class="lweeks">${quad(COLL_UI.newWeek)}${logBook.weeks.length ? ` · ${quad(fill(COLL_UI.weeks, { n: logBook.weeks.length }))}` : ''}</p>`;
}
function collectionsHTML() {
  return `<div class="dhead">🏅 ${quad(COLL_UI.collections)}</div><div class="lcolls">${collProg().map(c => `<details class="lcoll${c.done ? ' done' : ''}"><summary><span class="cic" aria-hidden="true">${c.icon}</span><span class="cname">${quad(c.names)}</span><small>${c.done ? `✓ ${quad(COLL_UI.done)}` : quad(fill(COLL_UI.found, { n: c.n, t: c.t }))}</small><i class="cbar"><i style="width:${Math.round(100 * c.n / Math.max(1, c.t))}%"></i></i></summary>
    <div class="stickers">${c.items.map(it => `<span class="sticker${it.got ? ' got' : ''}"><i style="--c:${it.color}"></i>${quad(it.names)}</span>`).join('')}</div>${c.id === 'moons' || c.id === 'craft' ? `<p class="chow">${quad(COLL_UI.howMoons)}</p>` : ''}</details>`).join('')}</div>`;
}
function openLog(focusIt = true) {
  const openSets = [...logCard.querySelectorAll('details.lcoll[open]')].map(d => d.querySelector('.cname')?.textContent);   // keep open drawers on refresh · 刷新时保持展开
  const n = logCount(), t = logTotal(), r = rankOf(n), nx = nextRank(n);
  const list = Object.entries(logBook.stamps).sort((a, b) => b[1].localeCompare(a[1]));
  const favLinks = favs.list.map(id => { const p = placeInfo(id); return p ? `<button type="button" class="lfav" data-fly="${id}"><i style="--c:${p.color}"></i>${quad(p.names)}</button>` : ''; }).filter(Boolean);
  logCard.innerHTML = `<div class="jtop"><div class="eyebrow" id="logTitle">${quad(LOG_UI.title)}</div><button type="button" class="jback" id="logClose">✕ ${quad(LOG_UI.close)}</button></div>
    <div class="lrank"><small>${quad(LOG_UI.rank)}</small><b>${quad(r.name)}</b><span>${quad(fill(LOG_UI.explored, { n, t }))}</span></div>
    <div class="lbar"><i style="width:${Math.round(100 * n / Math.max(1, t))}%"></i></div>
    <p class="lnext">${nx ? quad(fill(LOG_UI.next, { k: nx.at - n, r: nx.name })) : quad(LOG_UI.top)}</p>
    ${dailyHTML()}
    ${missionsHTML()}
    ${collectionsHTML()}
    <div class="dhead">${quad(LOG_UI.stamps)}</div>
    <ol class="lstamps">${list.length ? list.map(([id, d]) => { const p = placeInfo(id); return `<li><i style="--c:${p.color}"></i><span>${quad(p.names)}</span><small>${d}</small></li>`; }).join('') : `<li class="lnone">${quad(LOG_UI.none)}</li>`}</ol>
    ${favLinks.length ? `<div class="dhead">★ ${quad(FAV_UI.title)}</div><div class="lfavs">${favLinks.join('')}</div>` : ''}
    ${myPlanet && planetAge(myPlanet) ? `<div class="dhead">${quad(PM_UI.vrRow)}</div><div class="ltour"><i style="--c:${myPlanet.color}"></i><b id="logPlanetName"></b> <small>${planetAge(myPlanet).years ? `🎂×${planetAge(myPlanet).years} · ` : ''}${quad(L4(l => pmAgeLine(l)[1]))}</small> <button type="button" class="dfly" id="logPlanetOpen">${quad(PM_UI.show)}</button></div>` : ''}
    ${utDraft.s.length ? `<div class="dhead">✎ ${quad(LOG_UI.myTour)}</div><div class="ltour"><b id="logTourName"></b> <small>${quad(L4(l => UT_UI.stops[l].replace('{n}', utDraft.s.length)))}</small> <button type="button" class="dfly" id="logTourPlay">${quad(UT_UI.play)}</button></div>` : ''}`;
  const pn = logCard.querySelector('#logPlanetName'); if (pn) pn.textContent = pmName(myPlanet, lang());   // user text · 用户文字
  const tn = logCard.querySelector('#logTourName'); if (tn) tn.textContent = utDraft.t || tr(UT_UI.title, lang());   // user text: textContent only · 用户文字只用 textContent
  logCard.querySelectorAll('details.lcoll').forEach(d => { if (openSets.includes(d.querySelector('.cname')?.textContent)) d.open = true; });
  logCard.hidden = false; if (focusIt) $('#logClose').focus();
}
$('#logOpen').onclick = () => openLog();
const cardFly = (card, e) => { const f = e.target.closest('[data-fly]'); if (f) { card.hidden = true; ladderGo(f.dataset.fly); return true; } return false; };
logCard.addEventListener('click', e => { if (e.target.closest('#logClose')) { logCard.hidden = true; $('#moreBtn')?.focus(); return; }
  if (e.target.closest('#logPlanetOpen')) { logCard.hidden = true; openPM('result'); return; }
  if (e.target.closest('#logTourPlay')) { logCard.hidden = true; playUserTour(utDraft); return; }
  const mi = e.target.closest('[data-mission]'); if (mi) spotHint(weekMissions(weekKey()).find(m => m.id === mi.dataset.mission)); cardFly(logCard, e); });
// 🌌 Today in the universe: a small card once a day (not over the welcome card, a shared tour or the demo) · 每天一次的小卡片
const dailyCard = document.createElement('section'); dailyCard.id = 'dailyCard'; dailyCard.className = 'dailycard'; dailyCard.hidden = true;
dailyCard.setAttribute('role', 'dialog'); dailyCard.setAttribute('aria-label', all4(LOG_UI.today)); document.body.append(dailyCard);
function renderDaily() { if (!dailyCard.hidden) dailyCard.innerHTML = `<button type="button" class="jback dclose" aria-label="${tr(LOG_UI.close, lang())}">✕</button>${dailyHTML()}`; }
dailyCard.addEventListener('click', e => { if (e.target.closest('.dclose')) { dailyCard.hidden = true; return; } cardFly(dailyCard, e); });
addEventListener('keydown', e => { if (e.key !== 'Escape') return;
  if (!logCard.hidden) { logCard.hidden = true; e.stopImmediatePropagation(); $('#moreBtn')?.focus(); }
  else if (!dailyCard.hidden && dailyCard.contains(document.activeElement)) { dailyCard.hidden = true; e.stopImmediatePropagation(); } }, true);
setTimeout(function showDaily() {
  if (welcome.isOpen() || !utStart.hidden || demoOn || tour?.active || xr.active()) { if (!showDaily.n || showDaily.n++ < 20) { showDaily.n = showDaily.n || 1; setTimeout(showDaily, 3000); } return; }
  const today = dayKey(); let seen = null; try { seen = localStorage.getItem('cv-daily-seen'); } catch {}
  if (seen === today || logBook.daily.got === today) return;
  try { localStorage.setItem('cv-daily-seen', today); } catch {}
  dailyCard.hidden = false; renderDaily();
}, 4000);
// VR: a "📔 Logbook" row; open, the panel shows rank, count, today's place and streak; a row flies to today's place · VR：日志
function logRows(l) {
  const head = { id: 'O:log', text: `${tr(LOG_UI.vrRow, l)} · ${tr(rankOf(logCount()).name, l)} ${logCount()}/${logTotal()}`, depth: 0, color: '#ffcf6b', on: logVR };
  if (!logVR) return [head];
  const id = dailyId(), ms = missionsNow().map((m, i) => ({ m, i })).filter(({ m }) => !logBook.mission.done.includes(m.id));
  return [head, ...(id && logBook.daily.got !== dayKey() ? [{ id: 'O:fly', text: `🌌 ${tr(placeInfo(id).names, l)}`, depth: 1, color: '#ffcf6b' }] : []),
    ...ms.map(({ m, i }) => ({ id: 'O:m' + i, text: tr(fill(COLL_UI.vrRow, { n: i + 1 }), l), depth: 1, color: '#ffb36b' }))];   // short rows; the panel lists the full missions · 行文字简短，面板列出完整任务
}
function logPanel() {
  const l = lang(), n = logCount(), r = rankOf(n), nx = nextRank(n), id = dailyId(), nm = missionsNow().map((m, i) => ({ m, i })).find(({ m }) => !logBook.mission.done.includes(m.id));
  return { eyebrow: tr(LOG_UI.title, l).toUpperCase(), title: `${tr(r.name, l)} · ${tr(fill(LOG_UI.explored, { n, t: logTotal() }), l)}`, accent: '#ffcf6b',
    text: (nx ? tr(fill(LOG_UI.next, { k: nx.at - n, r: nx.name }), l) : tr(LOG_UI.top, l)) + (nm ? ` · 🎯 ${nm.i + 1}: ${tr(nm.m.text, l)}` : ''),   // the next mission in full (the panel wraps it) · 下一个任务全文
    facts: [[tr(LOG_UI.today, l), id ? tr(placeInfo(id).names, l) + (logBook.daily.got === dayKey() ? ' ✓' : '') : '—'], ['🔥', tr(streakText(liveStreak(logBook.daily)), l)],
      [tr(COLL_UI.vrMissions, l), tr(fill(COLL_UI.missionsDone, { n: doneCount(logBook.mission), t: missionsNow().length }), l)],
      [tr(COLL_UI.vrColl, l), collProg().map(c => `${c.icon} ${c.n}/${c.t}`).join('  ')]],
    hint: id && logBook.daily.got !== dayKey() ? tr(LOG_UI.todayAsk, l) : '', hintColor: '#ffcf6b' };
}
/* ───────── 📚 References & licences: sources, credits, licences, updates, reuse (☰ More → About; VR row) · 参考资料与许可 ───────── */
const refsCard = document.createElement('section'); refsCard.id = 'refsCard'; refsCard.className = 'calcard refscard'; refsCard.hidden = true;
refsCard.setAttribute('role', 'dialog'); refsCard.setAttribute('aria-labelledby', 'refsTitle'); document.body.append(refsCard);
function openRefs() { refsCard.innerHTML = refsHTML(quad, fill); refsCard.hidden = false; refsCard.scrollTop = 0; $('#refsClose').focus(); }
$('#refsOpen').onclick = () => openRefs();
refsCard.addEventListener('click', e => { if (e.target.closest('#refsClose')) { refsCard.hidden = true; $('#moreBtn')?.focus(); } });
addEventListener('keydown', e => { if (e.key === 'Escape' && !refsCard.hidden) { refsCard.hidden = true; e.stopImmediatePropagation(); $('#moreBtn')?.focus(); } }, true);
onLanguage(() => { if (!refsCard.hidden) refsCard.innerHTML = refsHTML(quad, fill); });
// VR: the panel shows the promise and the licences in short · VR：面板显示简短说明与许可
function refsPanel() {
  const l = lang();
  return { eyebrow: tr(REF_UI.title, l).toUpperCase(), title: tr(REF_UI.vrRow, l).replace(/^📚\s*/, ''), accent: '#c9d6e3', text: tr(REF_UI.vrText, l),
    facts: [0, 1, 2, 5, 6, 7].map(i => REF_LICENCES[i]).filter(Boolean).map(r => [typeof r.who === 'string' ? r.who : tr(r.who, l), tr(r.licence, l)]), hint: '', hintColor: '#c9d6e3' };
}
/* ───────── 🧭 How to move: an always-visible button in the bottom corner, the guide for the input in use (Pamela, Nov 17) · 怎么操作 ───────── */
let guideShown = null;
const coarseQ = matchMedia('(pointer: coarse)'), curGuide = () => guideMode({ xr: xr.active(), webcam: tracker.active, touch: coarseQ.matches });
const guideBtn = document.createElement('button'); guideBtn.type = 'button'; guideBtn.id = 'guideBtn'; guideBtn.className = 'guidebtn';
guideBtn.setAttribute('aria-haspopup', 'dialog'); guideBtn.setAttribute('aria-controls', 'guideCard');
const guideCard = document.createElement('section'); guideCard.id = 'guideCard'; guideCard.className = 'guidecard'; guideCard.hidden = true;
guideCard.setAttribute('role', 'dialog'); guideCard.setAttribute('aria-labelledby', 'guideTitle');
document.body.append(guideBtn, guideCard);
const stepsHTML = m => `<ol class="gsteps">${GUIDES[m].steps.map(([a, b]) => `<li><b>${quad(a)}</b><span>${quad(b)}</span></li>`).join('')}</ol>`;
function renderGuide(m = guideShown || curGuide()) {
  guideShown = m; const cur = curGuide();
  guideCard.innerHTML = `<div class="jtop"><div class="eyebrow" id="guideTitle">${quad(GUIDE_UI.title)}</div><button type="button" class="jback" id="guideClose">✕ ${quad(GUIDE_UI.close)}</button></div>
    <div class="gnow">${m === cur ? `${quad(GUIDE_UI.using)}: ` : ''}<b>${quad(GUIDES[m].name)}</b></div>${stepsHTML(m)}
    <div class="gother"><small>${quad(GUIDE_UI.others)}</small> ${GUIDE_MODES.filter(k => k !== m).map(k => `<button type="button" data-guide="${k}">${quad(GUIDES[k].name)}</button>`).join('')}</div>`;
}
function refreshGuideBtn() {
  const m = curGuide(), key = m + lang(); if (refreshGuideBtn.key === key) return; refreshGuideBtn.key = key;
  guideBtn.innerHTML = `${quad(GUIDE_UI.button)} <small>${quad(GUIDES[m].name)}</small>`;
  if (!guideCard.hidden && guideShown !== m) renderGuide(m);   // the input changed: show its guide · 输入方式改变：显示对应指南
}
guideBtn.onclick = () => { if (!guideCard.hidden) { guideCard.hidden = true; return; } guideShown = null; renderGuide(curGuide()); guideCard.hidden = false; $('#guideClose').focus(); };
guideCard.addEventListener('click', e => {
  if (e.target.closest('#guideClose')) { guideCard.hidden = true; guideBtn.focus(); return; }
  const b = e.target.closest('[data-guide]'); if (b) { renderGuide(b.dataset.guide); guideCard.querySelector('[data-guide]')?.focus(); }
});
addEventListener('keydown', e => { if (e.key === 'Escape' && !guideCard.hidden) { guideCard.hidden = true; e.stopImmediatePropagation(); guideBtn.focus(); } }, true);
refreshGuideBtn();   // then from updateLadder every frame (a cheap key check) · 之后每帧检查
// VR: the "🧭 How to move" row on top of the VR panel; open, the panel lists the hand gestures · VR：顶部一行，展开后面板列出手势
function guidePanel() {
  const l = lang(), g = GUIDES.vrHands, v = GUIDES.voice.steps;   // hands + the voice equivalents (✌ or 🎙) · 双手 + 语音说法
  return { eyebrow: tr(GUIDE_UI.title, l).toUpperCase(), title: tr(g.name, l), accent: '#7dffcf', text: `🎙 ${tr(GUIDES.voice.name, l)}: ${[v[0], v[1], v[2], v[3]].map(x => tr(x[0], l).split(' · ')[0]).join(' · ')}`, facts: g.steps.map(([a, b]) => [tr(a, l), tr(b, l)]),
    hint: `${tr(GUIDES.emulator.name, l).replace(/\s*\(.*\)/, '')}: 🤏 = ${tr(GUIDES.emulator.steps[1][0], l)}`, hintColor: '#7dffcf' };
}
/* ───────── 📰 News: recent discoveries from official news pages (news.js), "new since your last visit" dot · 新闻 ───────── */
let newsVR = false;
const NEWS_KEY = 'cv-news-seen', newsSeen = () => { try { return localStorage.getItem(NEWS_KEY); } catch { return null; } };
const newsFlyId = n => n.fly.startsWith('P:') ? n.fly : 'B:' + n.fly;
const newsFlyable = () => newestNews().filter(n => n.fly).slice(0, 3);
function newsDots() {
  const k = unseenCount(newsSeen()) > 0;
  $('#newsOpen .newdot')?.toggleAttribute('hidden', !k); $('#moreBtn')?.classList.toggle('hasnew', k);
}
function markNewsSeen() { try { localStorage.setItem(NEWS_KEY, newestNews()[0]?.date || ''); } catch {} newsDots(); }
const newsCard = document.createElement('section'); newsCard.id = 'newsCard'; newsCard.className = 'calcard newscard'; newsCard.hidden = true;
newsCard.setAttribute('role', 'dialog'); newsCard.setAttribute('aria-labelledby', 'newsTitle'); document.body.append(newsCard);
function openNews() {
  // first visit: no "new since" chips (everything is new), only the dot until opened · 首次访问只显示红点
  const seen = newsSeen(), esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const when = n => L4(l => new Intl.DateTimeFormat({ en: 'en-GB', zh: 'zh-CN', es: 'es-ES', pt: 'pt-BR' }[l], { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }).format(new Date(n.date + 'T00:00:00Z')));
  newsCard.innerHTML = `<div class="jtop"><div class="eyebrow" id="newsTitle">${quad(NEWS_UI.title)}</div><button type="button" class="jback" id="newsClose">✕ ${quad(NEWS_UI.close)}</button></div>
    <p class="calintro">${quad(NEWS_UI.intro)}</p>
    <ol class="callist">${newestNews().map(n => `<li><div class="cwhen"><span class="ckind">${esc(n.source.name)}</span> ${quad(when(n))}${seen && n.date > seen ? ` <span class="cnew">${quad(NEWS_UI.fresh)}</span>` : ''}</div>
      <b>${quad(n.title)}</b><p>${quad(n.summary)}</p>
      <a class="calfly newsread" href="${esc(n.source.url)}" target="_blank" rel="noopener">↗ ${quad(NEWS_UI.read)}</a>${n.fly ? ` <button type="button" class="calfly" data-fly="${esc(newsFlyId(n))}">✈ ${quad(NEWS_UI.fly)}</button>` : ''}</li>`).join('')}</ol>`;
  newsCard.hidden = false; $('#newsClose').focus(); markNewsSeen();
}
$('#newsOpen').onclick = () => openNews();
newsCard.addEventListener('click', e => {
  if (e.target.closest('#newsClose')) { newsCard.hidden = true; $('#moreBtn')?.focus(); return; }
  const f = e.target.closest('button.calfly'); if (f) { newsCard.hidden = true; ladderGo(f.dataset.fly); }
});
addEventListener('keydown', e => { if (e.key === 'Escape' && !newsCard.hidden) { newsCard.hidden = true; e.stopImmediatePropagation(); $('#moreBtn')?.focus(); } }, true);
newsDots();
// VR: one row; open, the newest stories that map to a place are rows (point + hold flies there) · VR：一行，展开后为可飞往的新闻
function newsRows(l) {
  const head = { id: 'N:news', text: tr(NEWS_UI.vrRow, l) + (unseenCount(newsSeen()) ? ' •' : ''), depth: 0, color: '#ff8fa3', on: newsVR };
  if (!newsVR) return [head];
  return [head, ...newsFlyable().map((n, i) => ({ id: 'N:f' + i, text: tr(n.title, l), depth: 1, color: '#ff8fa3' }))];
}
function newsPanel() {
  const l = lang();
  return { eyebrow: tr(NEWS_UI.vrRow, l).replace(/^📰\s*/, '').toUpperCase(), title: tr(NEWS_UI.title, l), accent: '#ff8fa3', text: '',
    facts: newsFlyable().map(n => [`${fmtDate({ date: n.date, precision: 'day' }, l)} · ${n.source.name}`, tr(n.title, l)]), hint: tr(NEWS_UI.vrHint, l), hintColor: '#ff8fa3' };   // the same 3 stories as the rows · 与行相同的 3 条
}
/* ───────── 📅 Coming up: sky events and mission milestones with countdowns (events.js, sourced) · 即将到来 ───────── */
let calVR = false;
const calFlyId = ev => ev.fly.startsWith('L:') ? ev.fly : 'B:' + ev.fly;   // a planet or a ladder level · 行星或阶梯层级
const calCard = document.createElement('section'); calCard.id = 'calCard'; calCard.className = 'calcard'; calCard.hidden = true;
calCard.setAttribute('role', 'dialog'); calCard.setAttribute('aria-labelledby', 'calTitle'); document.body.append(calCard);
function openCal() {
  const now = new Date(), list = upcoming(EVENTS, now), esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const date = ev => L4(l => `${fmtDate(ev, l)} · ${countdown(ev, now)[l]}`);
  calCard.innerHTML = `<div class="jtop"><div class="eyebrow" id="calTitle">${quad(CAL_UI.title)}</div><button type="button" class="jback" id="calClose">✕ ${quad(CAL_UI.close)}</button></div>
    <p class="calintro">${quad(CAL_UI.intro)}</p>
    <ol class="callist">${list.map(ev => `<li class="${ev.kind}"><div class="cwhen"><span class="ckind">${quad(CAL_UI[ev.kind])}</span> ${quad(date(ev))}</div>
      <b>${quad(ev.title)}</b><p>${quad(ev.line)} <a class="src" href="${esc(ev.source.url)}" target="_blank" rel="noopener">${esc(ev.source.name)} ↗</a></p>
      <button type="button" class="calfly" data-fly="${esc(calFlyId(ev))}">✈ ${quad(CAL_UI.fly)}</button></li>`).join('') || `<li>${quad(CAL_UI.none)}</li>`}</ol>`;
  calCard.hidden = false; $('#calClose').focus();
}
$('#calOpen').onclick = () => openCal();
calCard.addEventListener('click', e => {
  if (e.target.closest('#calClose')) { calCard.hidden = true; $('#moreBtn')?.focus(); return; }
  const f = e.target.closest('.calfly'); if (f) { calCard.hidden = true; ladderGo(f.dataset.fly); }
});
addEventListener('keydown', e => { if (e.key === 'Escape' && !calCard.hidden) { calCard.hidden = true; e.stopImmediatePropagation(); $('#moreBtn')?.focus(); } }, true);
// VR: one row on the ladder panel; open, the next 3 events as rows (point + hold flies there) and on the panel · VR：一行，展开后显示接下来 3 个事件
function calRows(l) {
  const head = { id: 'K:cal', text: tr(CAL_UI.vrRow, l), depth: 0, color: '#ffb36b', on: calVR };
  if (!calVR) return [head];
  const now = new Date();
  return [head, ...upcoming(EVENTS, now, 3).map((ev, i) => ({ id: 'K:f' + i, text: `${tr(ev.title, l)} · ${tr(countdown(ev, now), l)}`, depth: 1, color: '#ffb36b' }))];
}
function calPanel() {
  const l = lang(), now = new Date(), list = upcoming(EVENTS, now, 3);
  return { eyebrow: tr(CAL_UI.vrRow, l).replace(/^📅\s*/, '').toUpperCase(), title: tr(CAL_UI.title, l), accent: '#ffb36b', text: list.length ? '' : tr(CAL_UI.none, l),
    facts: list.map(ev => [`${fmtDate(ev, l)} · ${tr(countdown(ev, now), l)}`, `${tr(ev.title, l)} (${ev.source.name})`]), hint: tr(CAL_UI.vrHint, l), hintColor: '#ffb36b' };
}
/* ───────── Ask Cosmo in VR: suggested questions on the VR ladder panel, ✌ to ask by voice, the answer on the VR panel ───────── */
/* VR 中问 Cosmo：VR 阶梯面板上的推荐问题，✌ 语音提问，回答显示在 VR 面板 */
const vrAsk = { open: false, q: null, a: null, err: null, state: null, ctx: null };
function vrContext() {
  if (mode === 'focus' && focus) return { kind: 'body', names: Object.fromEntries(['en', 'zh', 'es', 'pt'].map((k, i) => [k, nameOf(focus.p)[i]])) };
  if (mode === 'journey' && journey.piece) { const p = journey.pieceData(journey.piece); return { kind: 'piece', id: p.id, names: p.names }; }
  if (mode === 'journey' && journey.level) return { kind: 'level', id: journey.level, names: levelById(journey.level).names };
  return { kind: 'solar' };
}
const vrContextKey = () => mode === 'focus' ? focus?.p.id : mode === 'journey' ? journey.piece || journey.level : 'solar';
function cosmoRows(l) {
  const head = { id: 'C:ask', text: tr(VRC_UI.row, l), depth: 0, color: '#b48cff', on: vrAsk.open };
  if (!vrAsk.open) return [head, ...(canListen ? [{ id: 'C:voice', text: tr(VC_UI.row, l), depth: 0, color: '#b48cff', on: vrAsk.state === 'listening' || vrAsk.state === 'transcribing' }] : [])];   // 🎙 voice commands from the top level too · 顶层也可语音
  return [head, ...vrQuestions(vrContext()).map((q, i) => ({ id: 'C:q' + i, text: tr(q, l), depth: 1, color: '#b48cff' })),
    ...(canListen ? [{ id: 'C:voice', text: tr(VRC_UI.voice, l), depth: 1, color: '#b48cff', on: vrAsk.state === 'listening' || vrAsk.state === 'transcribing' }] : []), { id: 'C:close', text: tr(VRC_UI.close, l), depth: 1, color: '#8f9bb5' }];
}
function cosmoGo(id) {
  const l = lang();
  if (id === 'C:ask') { vrAsk.open = !vrAsk.open; if (!vrAsk.open) Object.assign(vrAsk, { q: null, a: null, err: null, state: null }); return true; }
  if (id === 'C:close') { Object.assign(vrAsk, { open: false, q: null, a: null, err: null, state: null }); return true; }
  tour?.pause(performance.now());
  if (id === 'C:voice') { vrAsk.open = true; chat.startVoice(); return true; }
  const q = vrQuestions(vrContext())[+id.slice(3)]; if (!q) return false;
  vrAsk.open = true; chat.ask(tr(q, l), true);   // spoken reply (voice = true asks the server for a short answer) · 朗读回答
  return true;
}
function cosmoPanel() {
  const l = lang(), c = vrContext(), e = vrAsk.err;
  const text = e ? errorLine(e) : vrAsk.state === 'listening' ? VRC_UI.listening : vrAsk.state === 'transcribing' ? VRC_UI.transcribing : vrAsk.state === 'thinking' ? VRC_UI.thinking : vrAsk.a ? null : VRC_UI.pick;
  return { eyebrow: tr(VRC_UI.eyebrow, l), title: vrAsk.q ? panelText(vrAsk.q, 70) : c.names ? tr(c.names, l) : tr(VRC_UI.row, l).replace(/^💬\s*/, ''), accent: '#b48cff',
    text: text ? tr(text, l) : panelText(vrAsk.a), facts: !text && vrAsk.links?.length ? [[tr(SRC_UI.label, l), vrAsk.links.map(x => x.name).join(' · ')]] : [], hint: tr(vrAsk.shownAt ? VRC_UI.hintDone : VRC_UI.hint, l), hintColor: '#b48cff' };   // the lowering hint only once there is an answer · 有回答后才提示放下手
}
function tourPanel(menuHint) {
  const l = lang(), st = tour.step;
  return { eyebrow: `${tr(TOUR_UI.title, l)} · ${tour.index + 1}/${tour.steps.length}`, title: tr(stepTitle(st), l), accent: '#8bd6ff', text: tr(st.text, l), facts: [],
    hint: menuHint || tr(tour.paused ? TOUR_UI.vrPaused : TOUR_UI.vrHint, l), hintColor: '#8bd6ff' };
}


/* ───────── Language · 语言 · Idioma ───────── */
// All text is rendered in all four languages; switching only changes which one shows.
$('#language').onchange = e => setLanguage(e.target.value);
onLanguage(l => { chat.setVoiceLang(voiceCode(l)); xr.refreshLabels?.(); });
setLanguage(initialLanguage());

/* ───────── Background texture upgrades · 后台生成高清纹理 ───────── */
const order = ['earth', 'saturn', 'jupiter', 'mars', 'venus', 'neptune', 'uranus', 'mercury'];
function pump() { const b = order.map(id => bodyById[id]).find(b => !b.hiRes); if (!b) return; upgradeTexture(b); setTimeout(pump, 250); }

/* ───────── Real surface maps (team's realistic imagery) · 真实贴图 ───────── */
let maps = {};
loadMaps().then(m => {
  maps = m;
  for (const b of planets) if (applyMaps(b, m)) refreshParticles(b);
  if (focus && !focus.isSun) renderInfo(focus);
}).catch(e => console.warn('Surface maps unavailable, using procedural textures', e))
  .finally(() => setTimeout(pump, 400));   // procedural detail only for planets without a map

/* ───────── Animation loop · 动画循环 ───────── */
const camPos = new T.Vector3(), camUp = new T.Vector3(0, 1, 0);
const tv = new T.Vector3(), orbitPos = new T.Vector3(), linePos = new T.Vector3();
let lastNear = 0, viewShift = 0, viewShiftY = 0, focusFade = 0;
// Free screen area for a close-up: between the side ladder and the info panel on desktops, above the info sheet on phones
// 特写的可用区域：桌面在阶梯与信息面板之间，手机在信息面板上方
let frameBox = null, frameAt = -1e9;
addEventListener('resize', () => { frameBox = null; });   // measure again at once after a resize · 改变尺寸后立即重新测量
function focusFrame(now = performance.now()) {
  if (frameBox && now - frameAt < 250) return frameBox; frameAt = now;
  const W = innerWidth, H = innerHeight, info = $('#info');
  const ir = info && !info.classList.contains('hidden') && getComputedStyle(info).display !== 'none' ? info.getBoundingClientRect() : null;
  const head = document.querySelector('body > header')?.getBoundingClientRect(), shown = el => el && getComputedStyle(el).display !== 'none' && el.getBoundingClientRect().height ? el.getBoundingClientRect() : null;
  let x0 = 0, x1 = W, y0 = head ? head.bottom + 8 : 0, y1 = H;
  const cap = shown(document.querySelector('.caption'));
  if (W > 760) {
    if (ir && ir.width && ir.left > W / 2) x1 = ir.left - 24;
    // the left column: the open ladder and the help text under it · 左栏：展开的阶梯和下方说明
    const lb = ladder.classList.contains('open') && !ladder.classList.contains('tight') ? shown(ladder) : null, hint = shown(document.querySelector('.hint'));
    x0 = Math.max(lb ? lb.right + 24 : 0, hint && hint.right < W / 2 ? hint.right + 24 : 0);
    const dock = $('#nav')?.getBoundingClientRect(); if (dock && dock.height) y1 = dock.top - 8;
    if (cap && cap.top > H / 2) y1 = Math.min(y1, cap.top - 8);   // the spoken caption's box (kept even when faded out, so the framing doesn't jump) · 字幕区域（淡出时也保留，避免跳动）
  } else {
    const title = shown(document.querySelector('.intro'));   // journey pieces keep the title on phones · 手机上天体特写保留标题
    if (title && title.bottom < H / 2) y0 = Math.max(y0, title.bottom + 8);
    if (ir && ir.height) y1 = Math.max(ir.top, H * 0.45) - 8;   // a sheet dragged high still leaves room · 面板拉高时仍留空间
  }
  return frameBox = { cx: (x0 + x1) / 2, cy: (y0 + y1) / 2, fw: Math.max(160, x1 - x0), fh: Math.max(160, y1 - y0) };
}
function animate(now) {
  scaleTick(now);   // scale readout + level counter · 尺度读数
  const inXR = xr.active();
  const dt = Math.min((now - last) / 1000, 0.05); last = now;
  const k = 1 - Math.exp(-dt * 4.5);
  sun.surface.material.uniforms.time.value = now / 1000;
  orbitSpeed += ((paused ? 0 : mode === 'focus' ? 0.12 : mode === 'lineup' ? 0 : 1) - orbitSpeed) * k;
  lineBlend += ((mode === 'lineup' ? 1 : 0) - lineBlend) * (1 - Math.exp(-dt * 2.2));

  focusFade += ((mode === 'focus' ? 1 : 0) - focusFade) * k;
  for (const b of planets) {
    b.angle += dt * orbitSpeed * (Math.PI * 2 / 60) * (365.25 / b.p.periodDays);   // Earth: one orbit per minute
    orbitPos.set(Math.cos(b.angle) * b.orbit, 0, Math.sin(b.angle) * b.orbit); linePos.set(lineX[b.p.id], 0, 0);
    b.anchor.position.lerpVectors(orbitPos, linePos, ease(lineBlend));
    b.line.visible = mode !== 'trajectory' && mode !== 'journey' && lineBlend < 0.98 && focusFade < 0.97; b.line.material.opacity = Math.max(hoverId === b.p.id ? 0.75 : 0.3, 0.95 * (b.harpGlow || 0)) * (1 - lineBlend) * (1 - focusFade);
    if (b.spinOn) b.spin.rotation.y += dt * (Math.PI * 2 / 20) * (23.93 / b.p.rotationHours);     // Earth: one spin per 20 s
    if (b.clouds) b.clouds.rotation.y += dt * 0.012;
  }
  sun.spin.rotation.y += dt * 0.02; pmTick(dt); harpTick(dt, inXR, now); mergeTick(dt); mePinTick(dt);   // 🪐 your planet · 你的行星
  belt.rotation.y += dt * orbitSpeed * 0.02; belt.material.opacity = 0.5 * (1 - lineBlend) * (1 - focusFade * 0.7);

  // Particle spread for the focused planet · 当前行星的粒子扩散
  const target = mode === 'focus' && !focus.isSun ? Math.max(sliderSpread, hand.present ? handSpread : 0) : 0;
  expansion += (target - expansion) * (1 - Math.exp(-dt * 5));
  if (focus && !focus.isSun) {
    const m = focus.surface.material, op = 1 - expansion * 0.85;
    if ((op < 0.999) !== m.transparent) { m.transparent = op < 0.999; m.needsUpdate = true; }
    m.opacity = op; if (focus.clouds) focus.clouds.material.opacity = op;
    for (const pts of [focus.particles, focus.ringParticles]) {
      if (!pts) continue;
      const arr = pts.geometry.attributes.position.array, base = pts.userData.base, seed = pts.userData.seed;
      for (let i = 0, j = 0; i < arr.length; i += 3, j++) { const s = 1 + expansion * (0.25 + 0.65 * seed[j]); arr[i] = base[i] * s; arr[i + 1] = base[i + 1] * s; arr[i + 2] = base[i + 2] * s; }
      pts.geometry.attributes.position.needsUpdate = true;
      pts.material.size = (pts === focus.particles ? 0.011 : 0.01) * focus.r * (1 + expansion * 1.2) / xr.sizeScale();   // VR-aware · VR 尺寸修正
      pts.material.opacity = Math.min(1, focus.glow + expansion * 0.6) * (pts === focus.ringParticles ? 1.6 : 1);
    }
  }
  bodies.forEach(b => { if (b !== focus && b.surface.material.transparent && !b.isSun) { b.surface.material.opacity = 1; b.surface.material.transparent = false; b.surface.material.needsUpdate = true; } });

  // Camera rig · 相机
  trans = Math.min(1, trans + dt / (demoOn ? 1.05 : 1.7));   // the video demo moves a little faster · 演示稍快
  goalTarget(tv); const gl = Math.log(goalDist());
  if (trans < 1) { const e = ease(trans); rig.target.lerpVectors(from.target, tv, e); rig.logDist = from.logDist + (gl - from.logDist) * e; }
  else { rig.target.copy(tv); rig.logDist += (gl - rig.logDist) * k; }
  rig.yaw += (goal.yaw - rig.yaw) * k; rig.pitch += (goal.pitch - rig.pitch) * k;
  const d = Math.exp(rig.logDist), cp = Math.cos(rig.pitch);
  camPos.set(rig.target.x + d * cp * Math.sin(rig.yaw), rig.target.y + d * Math.sin(rig.pitch), rig.target.z + d * cp * Math.cos(rig.yaw));
  if(mode==='trajectory') camUp.set(-Math.sin(rig.yaw)*Math.sin(rig.pitch),Math.cos(rig.pitch),-Math.cos(rig.yaw)*Math.sin(rig.pitch)); else camUp.set(0,1,0);
  if (inXR) xr.placeRig(camPos, rig.target, camUp, d);   // VR: move the headset's dolly instead · VR：移动头显
  else { camera.position.copy(camPos); camera.up.copy(camUp); camera.lookAt(rig.target); }
  // Keep the focused planet clear of the info panel on wide screens · 让行星避开右侧信息面板
  // centre the close-up in the free area (clear of the ladder, the panel, the dock; above the sheet on phones) · 特写居中于可用区域
  const closeUp = (mode === 'focus' || (mode === 'journey' && journey.piece)) && !inXR, fr = closeUp ? focusFrame(now) : null;
  viewShift += ((fr ? innerWidth / 2 - fr.cx : 0) - viewShift) * k; viewShiftY += ((fr ? innerHeight / 2 - fr.cy : 0) - viewShiftY) * k;
  if (Math.abs(viewShift) > 0.5 || Math.abs(viewShiftY) > 0.5) camera.setViewOffset(innerWidth, innerHeight, viewShift, viewShiftY, innerWidth, innerHeight); else if (camera.view?.enabled) camera.clearViewOffset();
  const near = clamp(d * 0.008, 0.002, 4);
  if (!inXR && Math.abs(near - lastNear) / near > 0.05) { camera.near = near; camera.far = Math.max(8000, d * 40); camera.updateProjectionMatrix(); lastNear = near; }

  // Screen labels · 屏幕标签
  const showTags = mode !== 'trajectory' && mode !== 'journey' && (mode !== 'focus' || trans < 0.25);
  const placed = [];   // overview: name boxes already shown (the Sun's disk first) · 总览：已显示的名字区域
  for (const b of bodies) {
    if (!showTags) { b.tag.style.display = 'none'; continue; }
    const s = screenOf(b), size = Math.max(14, Math.min(s.r * 2 + 10, 400));
    const visible = s.front && s.x > -50 && s.x < innerWidth + 50 && s.y > -50 && s.y < innerHeight + 50;
    b.tag.style.display = visible ? 'block' : 'none'; if (!visible) continue;
    b.tag.style.transform = `translate(${s.x}px,${s.y}px)`;
    b.tag.style.setProperty('--size', size + 'px');
    const off = b.isSun ? -(s.r + 40) : Math.max(size / 2, s.r) + 6;
    b.tag.style.setProperty('--off', off + 'px');
    b.tag.classList.toggle('big', s.r > 26);
    b.tagBox = { x: s.x, y: s.y + off, r: s.r, sun: b.isSun };
  }
  // Overview: a planet's name that would sit on the Sun or on another name hides (its ring and the planet bar stay; hover shows it).
  // Outer planets first, so the crowded names near the Sun are the ones that hide (phones, Pamela Nov 18) · 名字重叠时隐藏（靠近太阳的先隐藏）
  if (showTags && mode === 'overview') {
    const lw = b => { const n = b.tag.lastElementChild, k = lang(); if (b.tagW?.k !== k) { const w = n.offsetWidth; if (w) b.tagW = { k, w }; } return b.tagW?.w || 60; };
    const shown = bodies.filter(b => b.tag.style.display !== 'none' && b.tagBox), sun = shown.find(b => b.isSun);
    if (sun) placed.push({ x0: sun.tagBox.x - sun.tagBox.r - 4, x1: sun.tagBox.x + sun.tagBox.r + 4, y0: sun.tagBox.y - 4, y1: sun.tagBox.y + 40 + 2 * sun.tagBox.r },   // the disk + its own name above it · 太阳圆盘及其名字
      { x0: sun.tagBox.x - lw(sun) / 2, x1: sun.tagBox.x + lw(sun) / 2, y0: sun.tagBox.y, y1: sun.tagBox.y + 14 });
    const far = b => sun ? Math.hypot(b.tagBox.x - sun.tagBox.x, b.tagBox.y - sun.tagBox.y) : 0;
    for (const b of shown.filter(b => !b.isSun).sort((a, c) => far(c) - far(a))) {
      const w = lw(b), r = { x0: b.tagBox.x - w / 2 - 3, x1: b.tagBox.x + w / 2 + 3, y0: b.tagBox.y - 1, y1: b.tagBox.y + 14 };
      const hit = placed.some(p => r.x0 < p.x1 && r.x1 > p.x0 && r.y0 < p.y1 && r.y1 > p.y0);
      b.tag.classList.toggle('noname', hit); if (!hit) placed.push(r);
    }
  } else for (const b of bodies) b.tag.classList.remove('noname');
  // Highlights and their labels · 亮点与标签
  for (const b of bodies) if (b.hl) b.hl.update(dt, now / 1000);
  for (const b of bodies) if (b.hl) for (const it of b.hl.items) {
    const on = b === focus && mode === 'focus' && trans > 0.6;
    if (!on) { it.el.style.display = 'none'; continue; }
    it.obj.getWorldPosition(hv); const behind = hv.distanceTo(camWorld()) > b.anchor.position.distanceTo(camWorld()) + b.r * 0.2 && rayHitsBody(b);
    hv.project(camera);
    const show = hv.z < 1 && !behind && Math.abs(hv.x) < 1.05 && Math.abs(hv.y) < 1.05;
    it.el.style.display = show ? 'block' : 'none';
    if (show) it.el.style.transform = `translate(${(hv.x + 1) / 2 * innerWidth}px,${(1 - hv.y) / 2 * innerHeight}px)`;
  }
  updateFlight(dt);
  // MR close-ups: only the open planet stays on the table (the Sun and the others would float around your room; updateFlight resets this every frame)
  // 混合现实特写：只保留当前行星（太阳等会飘在房间里）
  if (inXR && mode === 'focus' && xr.mrState()) { for (const b of bodies) if (b !== focus) b.anchor.visible = false; belt.visible = false; }
  tour.tick(performance.now());
  journey.update(dt, camera, mode === 'journey'); decayEdge(edge, dt); updateCrumb(); updateNav(); updateLadder();
  if (ladderPending && !journey.busy && trans >= 0.6) ladderGo(ladderPending);
  if (inXR) xr.update(hand.progress || 0);
  renderer.render(scene, camera);
}
const hv = new T.Vector3(), hd = new T.Vector3(), hc = new T.Vector3();
// Is the label's object hidden behind the planet? · 是否被行星挡住
function rayHitsBody(b) {
  hd.copy(hv).sub(camWorld()).normalize(); hc.copy(b.anchor.position).sub(camWorld());
  const t = hc.dot(hd); return hc.lengthSq() - t * t < b.r * b.r;
}
renderer.setAnimationLoop(animate);   // also drives VR frames · 同时驱动 VR 帧
addEventListener('resize', () => { camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix(); renderer.setSize(innerWidth, innerHeight); });

setIntro('overview'); document.body.classList.add('mode-overview');
// Open on the universe cover; ?start=solar (or a planet / level id) starts there instead · 从宇宙封面开始；?start=solar 从太阳系开始
{
  const start = new URLSearchParams(location.search).get('start');
  if (start && bodyById[start]) { quietUntil = performance.now() + 3000; select(start); }   // no voice before a click · 点击前不说话
  else if (start && start !== 'solar' && start !== 'solar-system' && levelById(start)) goLevel(start, 'up', true);
  else if (!start || !/^solar(-system)?$/.test(start)) cover(true);
}
initHabitability();
// Public hooks for teammates and the console · 供组员调用的接口
// simulateHand({present:true, gesture:'point', cursor:{x:.5,y:.5}, openness:1}) lets you test gestures without a camera.
/* ───────── 🪐 Create your planet: imaginary, but bound by real science (one per browser) · 创造你的行星 ───────── */
// Always labelled "Imaginary planet · made by you", dashed orbit; never in facts, tours, the logbook or the game · 始终标注为想象的行星
const PM_KEY = 'cv-myplanet', LOC = { en: 'en', zh: 'zh-CN', es: 'es', pt: 'pt-BR' };
const fmtN = (n, l) => Number(n).toLocaleString(LOC[l] || 'en');
let myPlanet = (() => { try { return sanitizePlanet(JSON.parse(localStorage.getItem(PM_KEY) || 'null')); } catch { return null; } })();
let pmVer = 0;
const pmSave = () => { pmVer++; try { if (myPlanet) localStorage.setItem(PM_KEY, JSON.stringify(myPlanet)); else localStorage.removeItem(PM_KEY); } catch {} };
if (myPlanet && !myPlanet.born) { myPlanet.born = Date.now(); myPlanet.seen = 0; pmSave(); }   // planets made before 🎂 ages start their calendar now · 旧行星从现在开始计时
const pmReal = PLANETS.map(p => ({ id: p.id, au: p.au, r: p.radiusKm / 6371 }));
const pmName = (p, l) => p?.name || tr(PM_UI.namePh, l);
const pm3d = { group: null, line: null, moons: [], angle: 2.1, r: 0, orbit: 0, period: 365 };
// A painted look: bands for giants, patches for rocky worlds · 简单的纹理
function pmTexture(p) {
  const c = document.createElement('canvas'); c.width = 256; c.height = 128; const g = c.getContext('2d'), base = new T.Color(p.color);
  const shade = k => '#' + base.clone().multiplyScalar(k).getHexString();
  g.fillStyle = shade(1); g.fillRect(0, 0, 256, 128);
  if (p.kind !== 'rocky') for (let y = 0; y < 128; y += 6 + (y * 7) % 9) { g.fillStyle = shade(0.75 + ((y * 13) % 5) / 10); g.fillRect(0, y, 256, 3 + (y % 4)); }
  else for (let i = 0; i < 60; i++) { g.fillStyle = shade(0.65 + (i % 6) / 10); g.beginPath(); g.arc((i * 97) % 256, (i * 53) % 128, 4 + (i * 7) % 14, 0, Math.PI * 2); g.fill(); }
  if (p.kind === 'rocky' && p.atmo === 'earth') { g.fillStyle = '#ffffff55'; for (let i = 0; i < 30; i++) g.fillRect((i * 71) % 256, (i * 37) % 128, 18 + (i % 5) * 6, 3); }
  const t = new T.CanvasTexture(c); t.colorSpace = T.SRGBColorSpace; return t;
}
function pmBuild() {
  if (pm3d.group) {
    scene.remove(pm3d.group, pm3d.line);
    pm3d.group.traverse(o => { o.geometry?.dispose(); o.material?.map?.dispose(); o.material?.dispose(); }); pm3d.line.geometry.dispose(); pm3d.line.material.dispose();
    pm3d.group = pm3d.line = null; pm3d.moons = [];
  }
  pmTag.style.display = 'none';
  if (!myPlanet) return;
  const p = myPlanet, r = p.r * 0.2, g = new T.Group();   // 1 Earth radius = 0.2 scene units (data.js) · 与 data.js 相同的比例
  const ball = new T.Mesh(new T.SphereGeometry(1, 48, 32), new T.MeshStandardMaterial({ map: pmTexture(p), roughness: 0.95, metalness: 0 }));
  ball.scale.setScalar(r); if (p.kind !== 'rocky') ball.scale.y = r * 0.94; g.add(ball);
  if (p.rings) { const ring = new T.Mesh(new T.RingGeometry(r * 1.35, r * 2.3, 96), new T.MeshBasicMaterial({ color: new T.Color(p.color).lerp(new T.Color('#ffffff'), 0.45), side: T.DoubleSide, transparent: true, opacity: 0.42, depthWrite: false })); ring.rotation.x = -Math.PI / 2 + 0.38; g.add(ring); }
  for (let i = 0; i < p.moons; i++) {
    const m = new T.Mesh(new T.SphereGeometry(1, 16, 12), new T.MeshStandardMaterial({ color: '#b9b4ac', roughness: 1 }));
    m.scale.setScalar(Math.max(r * 0.16, 0.03)); m.userData = { d: r * (2.7 + i * 0.9), s: 1.4 / (1 + i * 0.7), a: i * 1.9 }; g.add(m); pm3d.moons.push(m);
  }
  const orbit = orbitUnits(p.au), pts = Array.from({ length: 361 }, (_, k) => new T.Vector3(Math.cos(k / 360 * Math.PI * 2) * orbit, 0, Math.sin(k / 360 * Math.PI * 2) * orbit));
  const line = new T.Line(new T.BufferGeometry().setFromPoints(pts), new T.LineDashedMaterial({ color: p.color, dashSize: 1.1, gapSize: 0.9, transparent: true, opacity: 0.6, depthWrite: false }));
  line.computeLineDistances();
  Object.assign(pm3d, { group: g, line, r, orbit, period: yearDays(p.au) }); scene.add(g, line);
  pmTag.innerHTML = `<span class="ring" style="--c:${p.color}"></span><span class="name"><span class="pmn"></span><small class="pmbadge">${quad(PM_UI.badge)}</small></span>`;
  pmTag.querySelector('.pmn').textContent = pmName(p, lang());   // user text: textContent only · 用户文字只用 textContent
}
const pmTag = document.createElement('button'); pmTag.type = 'button'; pmTag.className = 'tag pmtag'; pmTag.style.display = 'none';
pmTag.setAttribute('aria-label', all4(PM_UI.badge)); pmTag.onclick = () => openPM('result'); document.body.append(pmTag);
// Every frame: orbit at its Kepler period (same clock as the planets), moons, the label; shown only in the Solar System view · 每帧更新
function pmTick(dt) {
  if (!pm3d.group) return;
  const show = mode === 'overview' && !xr.mrState();
  pm3d.group.visible = pm3d.line.visible = show;
  pm3d.angle += dt * orbitSpeed * (Math.PI * 2 / 60) * (365.25 / pm3d.period);
  pm3d.group.position.set(Math.cos(pm3d.angle) * pm3d.orbit, 0, Math.sin(pm3d.angle) * pm3d.orbit);
  pm3d.group.children[0].rotation.y += dt * 0.25;
  for (const m of pm3d.moons) { m.userData.a += dt * m.userData.s; m.position.set(Math.cos(m.userData.a) * m.userData.d, 0, Math.sin(m.userData.a) * m.userData.d); }
  if (!show || xr.active()) { pmTag.style.display = 'none'; return; }
  const s = screenOf({ anchor: pm3d.group, r: pm3d.r }), size = Math.max(14, Math.min(s.r * 2 + 10, 400));
  const vis = s.front && s.x > -50 && s.x < innerWidth + 50 && s.y > -50 && s.y < innerHeight + 50;
  pmTag.style.display = vis ? 'block' : 'none'; if (!vis) return;
  pmTag.style.transform = `translate(${s.x}px,${s.y}px)`; pmTag.style.setProperty('--size', size + 'px'); pmTag.style.setProperty('--off', Math.max(size / 2, s.r) + 6 + 'px');
}
// What the result card shows, in one language · 结果卡（单一语言）
function pmFacts(p, l) {
  const r = planetResult(p, pmReal), U = PM_UI, likeB = r.like && ladderBodies.find(b => b.id === r.like);
  return { r, rows: [
    [tr(U.temp, l), tr(fill(r.giant ? U.tempGiant : U.tempSurf, { t: fmtN(r.tC, l) }), l)],
    [tr(U.gravity, l), tr(fill(r.giant ? U.gCloud : U.gEarth, { g: fmtN(r.gravity, l) }), l)],
    [tr(U.year, l), tr(fill(r.useDays ? U.days : U.years, { n: fmtN(r.useDays ? r.days : r.years, l) }), l)],
    [tr(U.water, l), tr({ yes: U.wYes, frozen: U.wFrozen, boil: U.wBoil, noAir: U.wNoAir, thin: U.wThin, giant: U.wGiant }[r.water], l)],
    ...(likeB ? [[tr(U.like, l), tr(likeB.names, l)]] : []),
    ...(p === myPlanet && pmAgeLine(l) ? [pmAgeLine(l)] : []),
  ] };
}
const pmLink = src => `<a href="${PM_SRC[src]}" target="_blank" rel="noopener">${new URL(PM_SRC[src]).hostname.replace(/^www\./, '')}</a>`;
function pmLiveHTML(p) {
  const l = lang(), { r, rows } = pmFacts(p, l);
  return `<dl class="pmfacts">${rows.map(([k, v]) => `<div><dt>${esc4(k)}</dt><dd>${esc4(v)}</dd></div>`).join('')}</dl>
    <ul class="pmnotes">${r.notes.map(k => `<li>${quad(PM_NOTES[k][0])} <small>${pmLink(PM_NOTES[k][1])}</small></li>`).join('')}</ul>`;
}
const esc4 = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
// The card: 4 steps (Where · What · Air · Look) with live results, then the result view · 四步 + 实时结果
const pmCard = document.createElement('section'); pmCard.id = 'pmCard'; pmCard.className = 'calcard pmcard'; pmCard.hidden = true;
pmCard.setAttribute('role', 'dialog'); pmCard.setAttribute('aria-labelledby', 'pmTitle'); document.body.append(pmCard);
const pm = { draft: null, step: 0, view: 'edit', quiz: {} };
const PM_QUIZ_AT = [1, 2, null, 0];   // which question each step asks · 每一步的问题
const auFromSlider = v => +(0.1 * Math.pow(600, v / 1000)).toFixed(v < 400 ? 2 : 1), sliderFromAu = a => Math.round(1000 * Math.log(a / 0.1) / Math.log(600));
function pmQuizHTML(i) {
  if (i == null) return '';
  const q = PM_QUIZ[i], ans = pm.quiz[i];
  return `<div class="pmquiz"><div class="dhead">❓ ${quad(PM_UI.quiz)}</div><b>${quad(q.q)}</b><div class="pmopts">${q.a.map((a, k) => `<button type="button" data-quiz="${i}:${k}" class="${ans == null ? '' : k === q.ok ? 'ok' : k === ans ? 'no' : ''}" ${ans == null ? '' : 'disabled'}>${quad(a)}</button>`).join('')}</div>
    ${ans == null ? '' : `<p class="pmwhy"><b>${quad(ans === q.ok ? PM_UI.right : PM_UI.wrong)}</b> ${quad(q.why)} <small>${pmLink(q.src)}</small></p>`}</div>`;
}
const stepper = (act, label, val) => `<div class="pmstep"><button type="button" data-act="${act}-" aria-label="−">−</button>${val}<button type="button" data-act="${act}+" aria-label="+">+</button></div>`;
function pmStepHTML() {
  const d = pm.draft, U = PM_UI;
  if (pm.step === 0) return `<label class="pmlab">${quad(U.dist)}</label>
    ${stepper('au', U.dist, `<input type="range" id="pmAu" min="0" max="1000" value="${sliderFromAu(d.au)}" aria-label="${all4(U.dist)}">`)}<div class="pmval" id="pmAuVal"></div>`;
  if (pm.step === 1) { const K = KINDS[d.kind]; return `<label class="pmlab">${quad(U.kind)}</label><div class="pmopts">${Object.keys(KINDS).map(k => `<button type="button" data-kind="${k}" aria-pressed="${d.kind === k}" class="${d.kind === k ? 'on' : ''}">${quad(U.kinds[k])}</button>`).join('')}</div>
    <label class="pmlab">${quad(U.size)}</label>${stepper('r', U.size, `<input type="range" id="pmR" min="${K.min}" max="${K.max}" step="0.1" value="${d.r}" aria-label="${all4(U.size)}">`)}<div class="pmval" id="pmRVal"></div>`; }
  if (pm.step === 2) return d.kind !== 'rocky' ? `<p class="pmnote">${quad(U.airGiant)}</p>` : `<label class="pmlab">${quad(U.air)}</label><div class="pmopts col">${Object.keys(ATMOS).map(k => `<button type="button" data-atmo="${k}" aria-pressed="${d.atmo === k}" class="${d.atmo === k ? 'on' : ''}">${quad(U.airs[k])}</button>`).join('')}</div>`;
  return `<label class="pmlab">${quad(U.moons)}</label>${stepper('moons', U.moons, `<b class="pmcount">${d.moons}</b>`)}
    <div class="pmopts"><button type="button" data-act="rings" aria-pressed="${d.rings}" class="${d.rings ? 'on' : ''}">💍 ${quad(U.rings)}</button></div>
    <label class="pmlab">${quad(U.color)}</label><div class="pmcolors">${PM_COLORS.map(c => `<button type="button" data-color="${c}" style="--c:${c}" aria-pressed="${d.color === c}" aria-label="${c}" class="${d.color === c ? 'on' : ''}"></button>`).join('')}</div>
    <label class="pmlab" for="pmName">${quad(U.name)}</label><input id="pmName" maxlength="${PM_MAX_NAME}" placeholder="${esc4(tr(U.namePh, lang()))}">`;
}
function renderPM() {
  const U = PM_UI, top = `<div class="jtop"><div class="eyebrow" id="pmTitle">${quad(U.button)}</div><button type="button" class="jback" id="pmClose">✕ ${quad(U.close)}</button></div><div class="pmbadge big">${quad(U.badge)}</div>`;
  const how = `<details class="pmhow"><summary>${quad(U.how)}</summary><p>${quad(U.howText)}</p><p><b>${quad(U.sources)}:</b> ${[...new Set(Object.values(PM_SRC))].map((u, i) => `<a href="${u}" target="_blank" rel="noopener">${i + 1}</a>`).join(' · ')}</p></details>`;
  if (pm.view === 'result' && myPlanet) {
    pmCard.innerHTML = `${top}<h3 class="pmname"><i style="--c:${myPlanet.color}"></i><span id="pmShownName"></span></h3><div class="dhead">${quad(U.result)}</div><div id="pmLive">${pmLiveHTML(myPlanet)}</div>${pmAgeNote()}
      <div class="pmfoot"><button type="button" class="primary" data-act="show">${quad(U.show)}</button><button type="button" data-act="edit">${quad(U.edit)}</button><button type="button" data-act="remove">${quad(U.remove)}</button></div>${how}`;
    pmCard.querySelector('#pmShownName').textContent = pmName(myPlanet, lang());
    return;
  }
  const last = pm.step === 3;
  pmCard.innerHTML = `${top}<p class="pmintro">${quad(U.intro)}</p>
    <div class="pmtabs" role="tablist">${U.steps.map((s, i) => `<button type="button" role="tab" data-step="${i}" aria-selected="${pm.step === i}" class="${pm.step === i ? 'on' : ''}">${i + 1} · ${quad(s)}</button>`).join('')}</div>
    <div class="pmbody">${pmStepHTML()}</div>${pmQuizHTML(PM_QUIZ_AT[pm.step])}
    <div class="dhead">${quad(U.result)}</div><div id="pmLive">${pmLiveHTML(pm.draft)}</div>
    <div class="pmfoot">${pm.step ? `<button type="button" data-act="prev">${quad(U.back)}</button>` : ''}${last ? `<button type="button" class="primary" data-act="save">${quad(myPlanet ? U.update : U.add)}</button>` : `<button type="button" class="primary" data-act="next">${quad(U.next)}</button>`}</div>${how}`;
  const nm = pmCard.querySelector('#pmName'); if (nm) nm.value = pm.draft.name;
}
// Slider and name changes only refresh the value and the live results (keeps the drag going) · 拖动时只刷新数值和结果
function pmLive() {
  const d = pm.draft, U = PM_UI, a = pmCard.querySelector('#pmAuVal'), rv = pmCard.querySelector('#pmRVal');
  if (a) a.innerHTML = quad(L4(l => tr(U.au, l).replace('{n}', fmtN(d.au, l))));
  if (rv) rv.innerHTML = quad(L4(l => tr(U.radius, l).replace('{n}', fmtN(d.r, l))));
  const live = pmCard.querySelector('#pmLive'); if (live) live.innerHTML = pmLiveHTML(d);
}
function openPM(view) {
  pm.view = view === 'result' && myPlanet ? 'result' : 'edit'; pm.step = 0;
  pm.draft = { ...(myPlanet || { name: '', ...PM_PRESETS.ocean }) };
  renderPM(); if (pm.view === 'edit') pmLive(); pmCard.hidden = false; pmCard.querySelector('#pmClose').focus();
}
function pmShow() {
  pmCard.hidden = true;
  if (mode !== 'overview') home(); else noticeQ(PM_UI.added, 3200);
}
function pmApply(p) { const born = myPlanet?.born ?? Date.now(); myPlanet = sanitizePlanet({ ...p, born }); myPlanet.seen = planetAge(myPlanet)?.years ?? 0; pmSave(); pmBuild(); }   // a change of distance changes its year: no surprise birthday · 修改不会触发生日
// 🎂 Birthdays: checked at start and every minute; a finished year → celebration (once per year) · 生日：启动时和每分钟检查
function pmAgeLine(l, p = myPlanet) {
  const a = planetAge(p); if (!a) return null;
  return [tr(PM_UI.age, l), `${tr(fill(PM_UI.ageDay, { d: fmtN(a.day, l), y: fmtN(a.yearLen, l) }), l)}${a.years ? ' · ' + tr(fill(PM_UI.ageYears, { n: fmtN(a.years, l) }), l) : ''}`];
}
function pmAgeNote() {
  const a = planetAge(myPlanet); if (!a) return '';
  return `<p class="pmage">🎂 ${quad(a.fast ? PM_UI.ageFast : PM_UI.ageReal)} ${quad(fill(PM_UI.ageNext, { n: a.nextIn }))}</p>`;
}
function pmBirthday() {
  const a = myPlanet && planetAge(myPlanet); if (!a || a.years <= (myPlanet.seen || 0) || xr.active()) return;   // in VR the toast is hidden: wait · VR 中稍后再庆祝
  myPlanet.seen = a.years; pmSave(); celebrate(fill(PM_UI.birthday, { n: a.years }));
}
setInterval(pmBirthday, 60000); setTimeout(pmBirthday, 6000);
pmCard.addEventListener('click', e => {
  const t = e.target.closest('button'); if (!t) return; const d = pm.draft, act = t.dataset.act;
  if (t.id === 'pmClose') { pmCard.hidden = true; $('#moreBtn')?.focus(); return; }
  if (t.dataset.step) { pm.step = +t.dataset.step; renderPM(); pmLive(); return; }
  if (t.dataset.quiz) { const [i, k] = t.dataset.quiz.split(':').map(Number); if (pm.quiz[i] == null) pm.quiz[i] = k; renderPM(); pmLive(); return; }
  if (t.dataset.kind) { d.kind = t.dataset.kind; d.r = KINDS[d.kind].def; }
  else if (t.dataset.atmo) d.atmo = t.dataset.atmo;
  else if (t.dataset.color) d.color = t.dataset.color;
  else if (act === 'au-' || act === 'au+') d.au = Math.min(60, Math.max(0.1, +(d.au * (act === 'au+' ? 1.15 : 1 / 1.15)).toFixed(d.au < 2 ? 2 : 1)));
  else if (act === 'r-' || act === 'r+') { const K = KINDS[d.kind]; d.r = Math.min(K.max, Math.max(K.min, +(d.r + (act === 'r+' ? 0.1 : -0.1) * (d.kind === 'rocky' ? 1 : 5)).toFixed(1))); }
  else if (act === 'moons-' || act === 'moons+') d.moons = Math.min(4, Math.max(0, d.moons + (act === 'moons+' ? 1 : -1)));
  else if (act === 'rings') d.rings = !d.rings;
  else if (act === 'next' || act === 'prev') pm.step = Math.min(3, Math.max(0, pm.step + (act === 'next' ? 1 : -1)));
  else if (act === 'save') { pmApply(d); sfx('chime'); return pmShow(); }
  else if (act === 'show') return pmShow();
  else if (act === 'edit') { pm.view = 'edit'; pm.step = 0; }
  else if (act === 'remove') { myPlanet = null; pmSave(); pmBuild(); pmCard.hidden = true; noticeQ(PM_UI.removed, 2600); return; }
  else return;
  const focusSel = act ? `[data-act="${act}"]` : null; renderPM(); pmLive(); if (focusSel) pmCard.querySelector(focusSel)?.focus();
});
pmCard.addEventListener('input', e => {
  const d = pm.draft;
  if (e.target.id === 'pmAu') d.au = auFromSlider(+e.target.value);
  else if (e.target.id === 'pmR') d.r = +e.target.value;
  else if (e.target.id === 'pmName') d.name = e.target.value.slice(0, PM_MAX_NAME);
  pmLive();
});
addEventListener('keydown', e => { if (e.key === 'Escape' && !pmCard.hidden) { pmCard.hidden = true; e.stopImmediatePropagation(); $('#moreBtn')?.focus(); } }, true);
$('#pmOpen').onclick = () => openPM(myPlanet ? 'result' : 'edit');
$('#language')?.addEventListener('change', () => setTimeout(() => {   // a language change redraws the open card and the label · 切换语言时重绘
  if (!pmCard.hidden) { renderPM(); if (pm.view === 'edit') pmLive(); }
  const n = pmTag.querySelector('.pmn'); if (n && myPlanet) n.textContent = pmName(myPlanet, lang());
}, 0));
pmBuild();
// VR (simplified): a "🪐 Your planet" row; open, it offers three preset planets and Remove; the panel shows the results · VR：预设行星
function pmRows(l) {
  const head = { id: 'Y:pm', text: myPlanet ? `${tr(PM_UI.vrRow, l)} · ${pmName(myPlanet, l)}` : tr(PM_UI.vrRow, l), depth: 0, color: '#c7b7ef', on: pmVR };
  if (!pmVR) return [head];
  return [head, ...Object.keys(PM_PRESETS).map(k => ({ id: 'Y:' + k, text: tr(PM_UI.presets[k], l), depth: 1, color: '#c7b7ef' })), ...(myPlanet ? [{ id: 'Y:del', text: tr(PM_UI.remove, l), depth: 1, color: '#ff9b9b' }] : [])];
}
function pmGo(id) {
  if (id === 'Y:pm') { pmVR = !pmVR; return true; }
  const k = id.slice(2);
  if (k === 'del') { myPlanet = null; pmSave(); pmBuild(); return true; }
  if (PM_PRESETS[k]) { pmApply({ ...PM_PRESETS[k], name: '' }); if (mode !== 'overview') home(); sfx('chime'); return true; }
  return false;
}
function pmPanel() {
  const l = lang();
  if (!myPlanet) return { eyebrow: tr(PM_UI.badge, l).toUpperCase(), title: tr(PM_UI.title, l), accent: '#c7b7ef', text: tr(PM_UI.intro, l), facts: [], hint: tr(PM_UI.vrPick, l), hintColor: '#c7b7ef' };
  const { r, rows } = pmFacts(myPlanet, l);
  return { eyebrow: tr(PM_UI.badge, l).toUpperCase(), title: pmName(myPlanet, l), accent: myPlanet.color, text: r.notes.slice(0, 2).map(k => tr(PM_NOTES[k][0], l)).join(' '), facts: [...rows.slice(0, 4), ...(pmAgeLine(l) ? [pmAgeLine(l)] : [])], hint: planetAge(myPlanet) ? `🎂 ${tr(planetAge(myPlanet).fast ? PM_UI.ageFast : PM_UI.ageReal, l)}` : tr(PM_UI.vrPick, l), hintColor: '#c7b7ef' };
}
/* ───────── 🎂 Your birthday star (birthday.js) · 你的生日星 ───────── */
// Desktop: a card from ☰ More › Explore (type your birth year). VR: a "🎂 Birthday star" row; open, four rows step the year and
// the panel shows the match. The year is kept on this device only. · 桌面：卡片；VR：用四行调整年份；年份只存在本机
const BS_KEY = 'cosmo-birthyear';
let bsYear = (() => { try { const y = +localStorage.getItem(BS_KEY); return validYear(y) ? y : null; } catch { return null; } })();
function bsSave(y) { bsYear = y; try { if (y == null) localStorage.removeItem(BS_KEY); else localStorage.setItem(BS_KEY, String(y)); } catch {} }
const bsSrcName = u => /esa\.int|esawebb/.test(u) ? 'ESA' : /eso\.org/.test(u) ? 'ESO' : 'NASA';
const bsName = (s, l) => tr(s.names, l);
// A UI sentence with its {placeholders} filled per language (star names differ by language) · 每种语言分别填入
const bsL4 = (o, vars) => L4(l => tr(bsFill(o, typeof vars === 'function' ? vars(l) : vars), l));
const bsCard = document.createElement('section'); bsCard.id = 'bsCard'; bsCard.className = 'calcard bscard'; bsCard.hidden = true;
bsCard.setAttribute('role', 'dialog'); bsCard.setAttribute('aria-labelledby', 'bsTitle'); document.body.append(bsCard);
function bsRuler(r, l) {
  const W = 480, H = 74, x = ly => 14 + Math.min(135, ly) / 135 * (W - 28), esc = t => String(t).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const ticks = [0, 25, 50, 75, 100, 125].map(t => `<line x1="${x(t)}" x2="${x(t)}" y1="40" y2="46" stroke="#ffffff33"/><text x="${x(t)}" y="60" text-anchor="middle">${t ? esc(tr(bsFill(BS_UI.ly, { d: t }), l)) : '☉'}</text>`).join('');
  const dots = BS_STARS.map(s => { const on = s === r.star; return `<circle cx="${x(s.ly)}" cy="40" r="${on ? 6 : 3}" fill="${s.color}" opacity="${on ? 1 : .55}"${s.planets ? ` stroke="#9fe8c4" stroke-width="${on ? 2 : 1}"` : ''}><title>${esc(bsName(s, l))} · ${esc(tr(bsFill(BS_UI.ly, { d: fmtLy(s.ly, l) }), l))}</title></circle>`; }).join('');
  const you = `<line x1="${x(r.age)}" x2="${x(r.age)}" y1="14" y2="40" stroke="#8bd6ff" stroke-width="2"/><text x="${Math.min(W - 34, Math.max(34, x(r.age)))}" y="10" text-anchor="middle" class="you">${esc(tr(BS_UI.you, l))} · ${r.age}</text>`;
  return `<svg class="bsruler" viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(tr(BS_UI.ruler, l))}"><line x1="${x(0)}" x2="${x(135)}" y1="40" y2="40" stroke="#ffffff26"/>${ticks}${dots}${you}</svg>`;
}
function bsResultHTML(y) {
  const forget = bsYear != null ? `<div class="bsacts"><button type="button" class="jback" id="bsForget">${quad(BS_UI.forget)}</button></div>` : '';
  if (!validYear(y)) return `<p class="bserr">${quad(bsFill(BS_UI.bad, { a: BS_MIN_YEAR, b: new Date().getFullYear() }))}</p>${forget}`;
  const r = birthdayStar(y), l = lang(), esc = t => String(t).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const link = u => `<a class="src" href="${esc(u)}" target="_blank" rel="noopener">${quad(BS_UI.source)}: ${bsSrcName(u)} ↗</a>`;
  const nextLine = r.next ? `<p class="bsnext">${quad(bsL4(BS_UI.next, l2 => ({ y: r.nextYear, s: bsName(r.next, l2), d: fmtLy(r.next.ly, l2) })))}</p>` : '';
  if (r.young) return `<p class="bsleft">${quad(bsFill(BS_UI.young, { y: r.nextYear }))}</p>${bsRuler(r, l)}<p class="bsnote">${quad(BS_UI.note)} ${link(BS_STARS[0].src)}</p>${forget}`;
  const s = r.star;
  return `${r.old ? `<p class="bsleft">${quad(bsFill(BS_UI.old, { d: BS_STARS[BS_STARS.length - 1].ly }))}</p>` : ''}
    <div class="bsstar" style="--c:${s.color}"><i aria-hidden="true"></i><div><b class="bsname">${quad(s.names)}</b><span class="bsaway">${quad(bsL4(BS_UI.away, l2 => ({ d: fmtLy(s.ly, l2) })))}</span></div></div>
    <p class="bsleft">${quad(bsL4(BS_UI.left, l2 => ({ s: bsName(s, l2), y: r.leftYear, b: y })))}</p>
    <p class="bsfact">${quad(s.fact)}${s.planets ? ` <span class="bspl">${quad(BS_UI.planets)}</span>` : ''}<br>${link(s.src)}${s.also ? ' · ' + link(s.also) : ''}</p>
    ${nextLine}${bsRuler(r, l)}<p class="bsnote">${quad(BS_UI.note)}</p>
    <div class="bsacts"><button type="button" class="calfly" id="bsFly">✈ ${quad(BS_UI.fly)}</button><button type="button" class="jback" id="bsForget">${quad(BS_UI.forget)}</button></div>`;
}
function renderBS() {
  const Y = new Date().getFullYear();
  bsCard.innerHTML = `<div class="jtop"><div class="eyebrow" id="bsTitle">🎂 ${quad(BS_UI.title)}</div><button type="button" class="jback" id="bsClose">✕ ${quad(BS_UI.close)}</button></div>
    <p class="calintro">${quad(BS_UI.intro)}</p>
    <form id="bsForm" class="bsform" novalidate><label for="bsYear">${quad(BS_UI.year)}</label>
      <input id="bsYear" type="number" inputmode="numeric" min="${BS_MIN_YEAR}" max="${Y}" step="1" placeholder="${Y - 25}" value="${bsYear ?? ''}">
      <button type="submit" class="primary">${quad(BS_UI.find)}</button></form>
    <div id="bsOut" aria-live="polite">${bsYear != null ? bsResultHTML(bsYear) : ''}</div>`;
}
function openBS(y) {
  if (y != null && validYear(+y)) bsSave(+y);
  renderBS(); bsCard.hidden = false; (bsYear != null ? $('#bsClose') : $('#bsYear')).focus();
}
$('#bsOpen').onclick = () => openBS();
bsCard.addEventListener('submit', e => {
  e.preventDefault(); const y = Math.round(+$('#bsYear').value);
  if (validYear(y)) { bsSave(y); sfx('chime'); }
  $('#bsOut').innerHTML = bsResultHTML(y);
});
bsCard.addEventListener('click', e => {
  if (e.target.closest('#bsClose')) { bsCard.hidden = true; $('#moreBtn')?.focus(); return; }
  if (e.target.closest('#bsForget')) { bsSave(null); renderBS(); $('#bsYear').focus(); return; }
  if (e.target.closest('#bsFly')) { bsCard.hidden = true; ladderGo('L:neighbourhood'); }
});
addEventListener('keydown', e => { if (e.key === 'Escape' && !bsCard.hidden) { bsCard.hidden = true; e.stopImmediatePropagation(); $('#moreBtn')?.focus(); } }, true);
$('#language')?.addEventListener('change', () => setTimeout(() => { if (!bsCard.hidden) { const v = $('#bsYear')?.value; renderBS(); if (v) $('#bsYear').value = v; } }, 0));
// VR: the head row toggles; four rows step the year (no keyboard in a headset) · VR：四行调整年份（头显里没有键盘）
const BS_STEPS = { 'Z:-10': -10, 'Z:-1': -1, 'Z:+1': 1, 'Z:+10': 10 };
function bsRows(l) {
  const head = { id: 'Z:bs', text: tr(BS_UI.vrRow, l) + (bsVR ? ' · ' + (bsYear ?? new Date().getFullYear() - 25) : ''), depth: 0, color: '#ffd27a', on: bsVR };
  if (!bsVR) return [head];
  return [head, ...[['Z:-10', 'minus10'], ['Z:-1', 'minus1'], ['Z:+1', 'plus1'], ['Z:+10', 'plus10']].map(([id, k]) => ({ id, text: tr(BS_UI[k], l), depth: 1, color: '#ffd27a' }))];
}
function bsGo(id) {
  if (id === 'Z:bs') { bsVR = !bsVR; return true; }   // a default year shows, but nothing is saved until a step row is used · 仅在调整后保存
  if (!(id in BS_STEPS)) return false;
  bsSave(Math.min(new Date().getFullYear(), Math.max(BS_MIN_YEAR, (bsYear ?? new Date().getFullYear() - 25) + BS_STEPS[id]))); sfx('chime'); return true;
}
function bsPanel() {
  const l = lang(), y = bsYear ?? new Date().getFullYear() - 25, r = birthdayStar(y), eyebrow = tr(BS_UI.vrRow, l).replace(/^🎂\s*/, '').toUpperCase();
  const lyTxt = s => tr(bsFill(BS_UI.ly, { d: fmtLy(s.ly, l) }), l);
  const next = r.next ? [[tr(BS_UI.nextLabel, l), `${r.nextYear} · ${bsName(r.next, l)}`]] : [];
  if (r.young) return { eyebrow, title: bsName(BS_STARS[0], l), accent: BS_STARS[0].color, text: tr(bsFill(BS_UI.young, { y: r.nextYear }), l),
    facts: [[tr(BS_UI.born, l), String(y)], ...next], hint: tr(BS_UI.vrHint, l), hintColor: '#ffd27a' };
  const s = r.star;
  return { eyebrow, title: bsName(s, l), accent: s.color, text: tr(bsFill(BS_UI.left, { s: bsName(s, l), y: r.leftYear, b: y }), l),
    facts: [[tr(BS_UI.born, l), String(y)], [tr(BS_UI.dist, l), `${lyTxt(s)} · ${bsSrcName(s.src)}`], [tr(BS_UI.leftLabel, l), '≈ ' + r.leftYear], ...next],
    hint: tr(BS_UI.vrHint, l), hintColor: '#ffd27a' };
}
/* ───────── 🎵 Orbit harp (harp.js) · 轨道竖琴 ───────── */
// In the overview, sweeping across an orbit plucks it: mouse (pointermove), webcam hand cursor and VR fingertip aim (onHand),
// and in VR also a real fingertip that touches the orbital plane (mixed reality on your table) · 鼠标、手势光标、VR 指尖均可拨动
const harp = createHarp(), harpPrev = {}, HARP_LINE = new T.Color('#3b5870'), harpColor = new T.Color();
let harpLast = null, harpMoon = null, harpCount = 0;
const harpNotes = Object.fromEntries(planets.map(b => [b.p.id, noteForPeriod(HARP_PERIODS[b.p.id])])), harpRadii = planets.map(b => b.orbit);
// A soft glowing band over each orbit, lit when the string is plucked (a 1-px line alone is too thin to see) · 拨动时发光的光带
for (const b of planets) {
  const w = Math.max(0.6, b.orbit * 0.012);
  b.harpRing = new T.Mesh(new T.RingGeometry(b.orbit - w, b.orbit + w, 256, 1).rotateX(-Math.PI / 2),
    new T.MeshBasicMaterial({ color: b.p.color, transparent: true, opacity: 0, blending: T.AdditiveBlending, depthWrite: false, side: T.DoubleSide, toneMapped: false }));
  b.harpRing.visible = false; scene.add(b.harpRing);
}
const harpBar = document.createElement('section'); harpBar.id = 'harpBar'; harpBar.className = 'harpbar'; harpBar.hidden = true;
harpBar.setAttribute('aria-label', HARP_UI.title.en); document.body.append(harpBar);
const harpRay = new T.Vector3(), harpCam = new T.Vector3(), harpTip = new T.Vector3();
function setHarp(on) {
  harpOn = !!on; harp.stop(); harpMoon = null;
  for (const k in harpPrev) harpPrev[k] = null;
  if (harpOn && mode !== 'overview') ladderGo('L:solar-system');
  if (harpOn) { harp.warm([...Object.values(harpNotes), ...MOONS.map(m => m.midi)]); setHover(null); }
  renderHarpBar(); harpBar.hidden = !harpOn || xr.active();
}
// Screen point → distance from the Sun on the orbital plane; crossing a ring between two samples plucks it · 屏幕点 → 到太阳的距离
function harpAt(x, y, src) {
  if (!harpOn || mode !== 'overview' || trans < 0.6) { harpPrev[src] = null; return; }
  camera.getWorldPosition(harpCam); harpRay.set(x / innerWidth * 2 - 1, -(y / innerHeight) * 2 + 1, 0.5).unproject(camera).sub(harpCam).normalize();
  harpSample(src, ringDistance(harpCam, harpRay));
}
function harpSample(src, r) {
  const prev = harpPrev[src]; harpPrev[src] = r;
  if (r == null || prev == null) return;
  for (const i of crossed(prev, r, harpRadii)) harpPluck(planets[i]);
}
function harpPluck(b, quiet = false) {
  const now = performance.now(); if (now - (b.harpAt || 0) < 110) return;   // one sweep = one pluck per string · 一次扫过只响一次
  b.harpAt = now; b.harpGlow = 1; harp.play(harpNotes[b.p.id], quiet ? 0.6 : 0.85); harpLast = { b, at: now }; harpCount++;
  renderHarpLast();
}
function harpAll() { if (mode !== 'overview') return; planets.forEach((b, i) => harp.later(i * 230, () => harpPluck(b, true))); }
function harpMoons() {
  harp.stop(); const beats = moonBeats(), notes = Object.fromEntries(MOONS.map(m => [m.id, m.midi]));
  for (let k = 0; k < 16; k++) harp.later(k * 400, () => { const ids = beats[k % 4]; ids.forEach(id => harp.play(notes[id], 0.55)); harpMoon = { ids, at: performance.now(), k }; renderHarpMoons(); });
  harp.later(16 * 400 + 300, () => { harpMoon = null; renderHarpMoons(); });
}
function harpTick(dt, inXR, now) {
  if (harpOn && mode !== 'overview' && trans >= 1) setHarp(false);   // left the Solar System: the harp stops · 离开太阳系即停止
  for (const b of planets) {
    const g = b.harpGlow = (b.harpGlow || 0) * Math.exp(-dt * 2.2);
    if (g < 0.002 && !b.harpTinted) continue;
    b.line.material.color.copy(HARP_LINE).lerp(harpColor.set(b.p.color), Math.min(1, g * 1.4)); b.harpTinted = g >= 0.002;
    b.line.scale.setScalar(1 + 0.006 * g * Math.sin(now * 0.09));   // the string trembles · 弦在颤动
    b.harpRing.visible = g >= 0.002 && b.line.visible; b.harpRing.material.opacity = 0.6 * g; b.harpRing.scale.copy(b.line.scale);
  }
  if (!harpOn || !inXR || !xr.mrState()) return;
  // Mixed reality (the system sits on your table, within reach): a real fingertip touching the orbital plane plucks too · 混合现实：指尖触碰轨道平面
  for (const t of xr.tips()) {
    harpTip.copy(t.p); const near = Math.abs(harpTip.y) < 0.05 * t.scale;
    harpSample('tip' + t.i, near ? Math.hypot(harpTip.x, harpTip.z) : null);
  }
}
const hName = (b, l) => nameOf(b.p)[Math.max(0, ['en', 'zh', 'es', 'pt'].indexOf(l))];
const hNum = (n, l) => n.toLocaleString(l === 'zh' ? 'zh-CN' : l === 'pt' ? 'pt-BR' : l);
function renderHarpBar() {
  const esc = t => String(t).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  harpBar.innerHTML = `<div class="hbtop"><b>${quad(HARP_UI.button)}</b><button type="button" class="jback" id="harpClose">✕ ${quad(HARP_UI.close)}</button></div>
    <p class="hbhint">${quad(HARP_UI.hint)}</p><p class="hblast" id="harpLast" aria-live="polite"></p>
    <div class="hbmoons" id="harpMoons" hidden>${MOONS.map(m => `<span data-moon="${m.id}" style="--c:${m.color}"><i></i>${quad(m.names)}</span>`).join('')}</div>
    <div class="hbacts"><button type="button" id="harpAll">${quad(HARP_UI.all)}</button><button type="button" id="harpMoonsBtn">${quad(HARP_UI.moons)}</button></div>
    <details class="hbhow"><summary>${quad(HARP_UI.howTitle)}</summary><p>${quad(HARP_UI.how)}</p>
    <p>${quad(HARP_UI.source)}: <a class="src" href="${esc(HARP_PERIODS_SRC)}" target="_blank" rel="noopener">NASA ↗</a> · ${RESONANCE_SRC.map((u, i) => `<a class="src" href="${esc(u)}" target="_blank" rel="noopener">${i ? 'ESA' : 'NASA'} ↗</a>`).join(' · ')}</p></details>`;
  renderHarpLast(); renderHarpMoons();
}
function renderHarpLast() {
  const el = harpBar.querySelector('#harpLast'); if (!el || !harpLast) return;
  const b = harpLast.b;
  el.innerHTML = `<i style="--c:${b.p.color}"></i>${quad(L4(l => tr(HARP_UI.played, l).replace('{p}', hName(b, l)).replace('{n}', hNum(HARP_PERIODS[b.p.id], l))))} · ${noteName(harpNotes[b.p.id], lang())}`;
}
function renderHarpMoons() {
  const box = harpBar.querySelector('#harpMoons'); if (!box) return;
  box.hidden = !harpMoon; if (!harpMoon) return;
  box.querySelectorAll('[data-moon]').forEach(s => { s.classList.remove('on'); void s.offsetWidth; if (harpMoon.ids.includes(s.dataset.moon)) s.classList.add('on'); });
}
$('#harpOpen').onclick = () => setHarp(!harpOn);
harpBar.addEventListener('click', e => {
  if (e.target.closest('#harpClose')) { setHarp(false); $('#moreBtn')?.focus(); }
  else if (e.target.closest('#harpAll')) harpAll();
  else if (e.target.closest('#harpMoonsBtn')) harpMoons();
});
addEventListener('keydown', e => { if (e.key === 'Escape' && harpOn && !xr.active()) { setHarp(false); e.stopImmediatePropagation(); } }, true);
$('#language')?.addEventListener('change', () => setTimeout(() => { if (harpOn) renderHarpBar(); }, 0));
// VR: a row to switch it on; open, two rows play every orbit / Jupiter's moons; the panel shows the last string · VR 行
function harpRows(l) {
  const head = { id: 'H:harp', text: tr(HARP_UI.button, l), depth: 0, color: '#9fe8c4', on: harpOn };
  if (!harpOn) return [head];
  return [head, { id: 'H:all', text: tr(HARP_UI.all, l), depth: 1, color: '#9fe8c4' }, { id: 'H:moons', text: tr(HARP_UI.moons, l), depth: 1, color: '#9fe8c4' }];
}
function harpGo(id) {
  if (id === 'H:harp') { setHarp(!harpOn); return true; }
  if (!harpOn) return false;
  if (id === 'H:all') { harpAll(); return true; }
  if (id === 'H:moons') { harpMoons(); return true; }
  return false;
}
function harpPanel() {
  const l = lang(), eyebrow = tr(HARP_UI.title, l).toUpperCase(), moonsOn = !!harpMoon;   // the moons panel stays while their rhythm plays · 节奏播放时保持
  if (moonsOn) return { eyebrow, title: tr(HARP_UI.moons, l).replace(/^▶\s*/, ''), accent: '#ffd36b', text: tr(HARP_UI.moonsText, l),
    facts: MOONS.map(m => [tr(m.names, l), harpMoon.ids.includes(m.id) ? '● ● ●' : '·']), hint: tr(HARP_UI.vrHint, l), hintColor: '#9fe8c4' };
  if (mode !== 'overview') return { eyebrow, title: tr(HARP_UI.title, l), accent: '#9fe8c4', text: tr(HARP_UI.off, l), facts: [], hint: tr(HARP_UI.vrHint, l), hintColor: '#9fe8c4' };
  const b = harpLast?.b;
  return { eyebrow, title: b ? hName(b, l) : tr(HARP_UI.title, l), accent: b ? b.p.color : '#9fe8c4', text: tr(HARP_UI.how, l),
    facts: b ? [[tr(HARP_UI.year, l), tr(HARP_UI.days, l).replace('{n}', hNum(HARP_PERIODS[b.p.id], l))], [tr(HARP_UI.note, l), noteName(harpNotes[b.p.id], l)]] : [],
    hint: tr(HARP_UI.vrHint, l), hintColor: '#9fe8c4' };
}
/* ───────── 👏 Galaxy collision: the Milky Way and Andromeda (merger.js) · 星系碰撞 ───────── */
// At the Local Group the two galaxies are replaced by a small simulation of thousands of stars: clap (VR), pinch
// (webcam) or press Start. The frame runs from the Milky Way to Andromeda as drawn at this level. · 在本星系群层级播放
const MERGE_MW = new T.Vector3(-30, 0, 10.5), MERGE_M31 = new T.Vector3(45, 4.5, -10.5);   // pieces/local-group.js, pieces/andromeda.js
const MERGE_SECONDS = 32, MERGE_SECONDS_DEMO = 13;   // the whole story plays in about half a minute · 约半分钟播完
const merge = { sim: null, shown: false, flying: false, done: false, root: new T.Group(), pts: null };
{
  const c = document.createElement('canvas'); c.width = c.height = 64; const g = c.getContext('2d'), gr = g.createRadialGradient(32, 32, 0, 32, 32, 32);
  gr.addColorStop(0, '#fff'); gr.addColorStop(0.25, 'rgba(255,255,255,.7)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.fillRect(0, 0, 64, 64);
  merge.dot = new T.CanvasTexture(c);
  const axis = MERGE_M31.clone().sub(MERGE_MW), sc = axis.length() / 8;   // the simulation starts 8 units apart · 模拟初始相距 8
  merge.root.position.copy(MERGE_MW).add(MERGE_M31).multiplyScalar(0.5);
  merge.root.quaternion.setFromUnitVectors(new T.Vector3(1, 0, 0), axis.normalize()); merge.root.scale.setScalar(sc);
  merge.root.visible = false; merge.root.name = 'merger'; scene.add(merge.root);
}
const mergeBar = document.createElement('section'); mergeBar.id = 'mergeBar'; mergeBar.className = 'harpbar mergebar'; mergeBar.hidden = true;
mergeBar.setAttribute('aria-label', MERGE_UI.title.en); document.body.append(mergeBar);
const atLocalGroup = () => mode === 'journey' && journey.level === 'local-group' && !journey.piece;
const nearLocalGroup = () => mode === 'journey' && journey.level === 'local-group';   // a close-up (Andromeda) still counts · 特写也算
function setMerge(on) {
  mergeOn = !!on; mergeStop();
  if (mergeOn && !atLocalGroup()) { merge.flying = true; merge.flyAt = performance.now(); if (nearLocalGroup()) closePiece(); else ladderGo('L:local-group'); }
  if (mergeOn) setHover(null);
  renderMergeBar(); mergeBar.hidden = !mergeOn || xr.active();
}
function mergeStop() {
  merge.sim = null; merge.done = false; merge.shown = false; merge.root.visible = false; journey.root.visible = true; document.body.classList.remove('merging');
}
function mergePlay() {
  if (!mergeOn) return false;
  if (!atLocalGroup() || trans < 1) { merge.flying = true; merge.flyAt = performance.now(); merge.pending = true; if (nearLocalGroup()) closePiece(); else ladderGo('L:local-group'); return true; }
  merge.sim = createMergerSim({ n: 3000 }); merge.done = false; merge.acc = 0; merge.pending = false;
  if (!merge.pts) {   // one set of GPU buffers, reused on every replay · 只创建一次缓冲区
    const g = new T.BufferGeometry(), n = merge.sim.count;
    g.setAttribute('position', new T.BufferAttribute(new Float32Array(n * 3), 3)); g.setAttribute('color', new T.BufferAttribute(new Float32Array(n * 3), 3));
    g.setAttribute('aSize', new T.BufferAttribute(new Float32Array(n).fill(1), 1));
    merge.pts = new T.Points(g, pointsMaterial(T)); merge.pts.material.uniforms.uOpacity.value = 0.8;
    merge.pts.frustumCulled = false; merge.root.add(merge.pts);
  }
  const g = merge.pts.geometry, pa = g.attributes.position;
  pa.array.set(merge.sim.pos); merge.sim.pos = pa.array; pa.needsUpdate = true;   // the simulation writes straight into the GPU copy · 直接写入
  g.attributes.color.array.set(merge.sim.col); g.attributes.color.needsUpdate = true;
  merge.shown = true; merge.root.visible = true; journey.root.visible = false; document.body.classList.add('merging');
  if (!xr.active() && zooms.journey < 1.5) { zooms.journey = 1.7; startTransition(); }   // desktop: move in closer: the galaxies fill the view · 拉近视角
  sfx('chime'); renderMergeBar(); return true;
}
// 👏 in VR: at the Local Group a clap opens and starts it; with it open, a clap (re)plays · VR 拍手
function mergeClap() {
  if (!mergeOn && !nearLocalGroup()) return;
  if (!mergeOn) { mergeOn = true; renderMergeBar(); }
  mergePlay();
}
function mergeTick(dt) {
  if (!mergeOn) return;
  if (merge.pts) {   // the same soft, size-capped dots as the journey; VR: the world is scaled, so the dots are too · 与旅程相同的点
    const u = merge.pts.material.uniforms; u.uSize.value = 0.61 / xr.sizeScale();
    u.uViewH.value = (renderer.xr.isPresenting && renderer.xr.getCamera().cameras?.[0]?.viewport?.w) || renderer.domElement.height;
  }
  if (merge.flying) {
    if (atLocalGroup() && trans >= 1 && !journey.busy) { merge.flying = false; if (merge.pending) mergePlay(); }
    else { if (trans >= 1 && !journey.busy && !nearLocalGroup() && performance.now() - merge.flyAt > 1500) setMerge(false); return; }   // went somewhere else mid-flight · 中途去了别处
  }
  if (!nearLocalGroup()) { setMerge(false); return; }   // left the Local Group: it stops · 离开本星系群即停止
  if (journey.piece && merge.shown) closePiece();   // the collision is shown on the whole group, not a close-up · 碰撞在整个星系群上播放
  const s = merge.sim; if (!s || merge.done) return;
  merge.acc += Math.min(0.1, dt) * SIM_END / (demoOn ? MERGE_SECONDS_DEMO : MERGE_SECONDS);   // the video demo plays it twice as fast · 演示中两倍速
  while (merge.acc >= 0.02 && s.t < SIM_END) { s.step(0.02); merge.acc -= 0.02; }
  merge.pts.geometry.attributes.position.needsUpdate = true;
  if (s.t >= SIM_END) { merge.done = true; renderMergeBar(); }
  renderMergeTime();
}
function renderMergeBar() {
  const esc = t => String(t).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const src = (u, n) => `<a class="src" href="${esc(u)}" target="_blank" rel="noopener">${n} ↗</a>`;
  mergeBar.innerHTML = `<div class="hbtop"><b>${quad(MERGE_UI.title)}</b><button type="button" class="jback" id="mergeClose">✕ ${quad(MERGE_UI.close)}</button></div>
    <p class="hbhint">${quad(MERGE_UI.intro)}</p><p class="mgtime" id="mergeTime" aria-live="polite"></p>
    <div class="hbacts"><button type="button" id="mergePlay">${quad(!merge.sim ? MERGE_UI.start : merge.done ? MERGE_UI.replay : MERGE_UI.restart)}</button></div>
    <details class="hbhow"><summary>${quad(MERGE_UI.about)}</summary><p>${quad(MERGE_UI.scenario)}</p><p>${quad(MERGE_UI.odds)}</p><p>${quad(MERGE_UI.model)}</p>
    <p>${quad(MERGE_UI.sources)}: ${src(MERGE_SRC.scenario, 'NASA')} · ${src(MERGE_SRC.elliptical, 'NASA SVS')} · ${src(MERGE_SRC.odds, 'ESA')}</p></details>`;
  renderMergeTime(true);
}
let mergeTimeKey = '';
function renderMergeTime(force) {
  const el = mergeBar.querySelector('#mergeTime'); if (!el) return;
  const s = merge.sim, key = s ? stageAt(s.t) + ':' + gyrAt(s.t).toFixed(1) : merge.flying ? 'fly' : '-';
  if (key === mergeTimeKey && !force) return; mergeTimeKey = key;
  el.innerHTML = s ? `<b>${quad(L4(l => whenText(gyrAt(s.t), l)))}</b><br>${quad(MERGE_UI.stages[stageAt(s.t)])}` : merge.flying ? quad(MERGE_UI.goThere) : '';
}
$('#mergeOpen').onclick = () => setMerge(!mergeOn);
mergeBar.addEventListener('click', e => {
  if (e.target.closest('#mergeClose')) { setMerge(false); $('#moreBtn')?.focus(); }
  else if (e.target.closest('#mergePlay')) mergePlay();
});
addEventListener('keydown', e => { if (e.key === 'Escape' && mergeOn && !xr.active()) { setMerge(false); e.stopImmediatePropagation(); } }, true);
$('#language')?.addEventListener('change', () => setTimeout(() => { if (mergeOn) renderMergeBar(); }, 0));
// VR rows · VR 行
function mergeRows(l) {
  const head = { id: 'X:merge', text: tr(MERGE_UI.vrRow, l), depth: 0, color: '#ffb3c8', on: mergeOn };
  return mergeOn ? [head, { id: 'X:play', text: tr(!merge.sim ? MERGE_UI.vrStart : merge.done ? MERGE_UI.replay : MERGE_UI.restart, l), depth: 1, color: '#ffb3c8' }] : [head];
}
function mergeGo(id) {
  if (id === 'X:merge') { setMerge(!mergeOn); return true; }
  if (id === 'X:play') return mergePlay();
  return false;
}
function mergePanel() {
  const l = lang(), s = merge.sim, eyebrow = tr(MERGE_UI.title, l).toUpperCase();
  if (merge.flying || !atLocalGroup()) return { eyebrow, title: tr(MERGE_UI.vrRow, l), accent: '#ffb3c8', text: tr(MERGE_UI.goThere, l), facts: [], hint: tr(MERGE_UI.clapVR, l), hintColor: '#ffb3c8' };
  if (!s) return { eyebrow, title: tr(MERGE_UI.clapVR, l), accent: '#ffb3c8', text: tr(MERGE_UI.scenario, l), facts: [], hint: tr(MERGE_UI.clapVR, l), hintColor: '#ffb3c8' };
  return { eyebrow, title: whenText(gyrAt(s.t), l), accent: '#ffb3c8', text: tr(MERGE_UI.stages[stageAt(s.t)], l) + (merge.done ? '\n\n' + tr(MERGE_UI.odds, l) : ''),
    facts: [], hint: tr(MERGE_UI.vrHint, l), hintColor: '#ffb3c8' };
}
/* ───────── 🧭 From the Universe to Me, and back (me.js) · 从宇宙到我 ───────── */
// Down the levels to Earth, then the globe turns so your region faces you, with a glowing dot on it ("You are here").
// "Me → Universe" plays it backwards. The same on the computer, phone and in VR. · 电脑、手机与 VR 相同
const ME_KEY = 'cv-myplace';
const meState = { run: 0, place: (() => { try { const p = JSON.parse(localStorage.getItem(ME_KEY) || 'null'); return p && isFinite(p.lat) && isFinite(p.lon) ? p : null; } catch { return null; } })() };
const meMenu = document.createElement('div'); meMenu.id = 'meMenu'; meMenu.className = 'navplanets memenu'; meMenu.hidden = true; meMenu.setAttribute('role', 'menu');
const meCard = document.createElement('section'); meCard.id = 'meCard'; meCard.className = 'calcard mecard'; meCard.hidden = true; meCard.setAttribute('role', 'dialog');
const meTag = document.createElement('section'); meTag.id = 'meTag'; meTag.className = 'metag'; meTag.hidden = true; meTag.setAttribute('aria-live', 'polite');
document.body.append(meMenu, meCard, meTag);
function renderMeMenu() { meMenu.innerHTML = `<button type="button" data-me="up">${quad(ME_UI.up)}</button><button type="button" data-me="change">${quad(ME_UI.change)}</button>`; }
function openMeMenu() {
  renderMeMenu(); const r = $('#meMoreBtn').getBoundingClientRect(); meMenu.hidden = false;
  meMenu.style.left = Math.min(innerWidth - meMenu.offsetWidth - 8, Math.max(8, r.right - meMenu.offsetWidth)) + 'px'; meMenu.style.bottom = (innerHeight - r.top + 8) + 'px';
  $('#meMoreBtn').setAttribute('aria-expanded', 'true');
}
function closeMeMenu() { meMenu.hidden = true; $('#meMoreBtn')?.setAttribute('aria-expanded', 'false'); }
function renderMeCard() {
  meCard.innerHTML = `<div class="calhead"><b>🧭 ${quad(ME_UI.title)}</b><button type="button" class="jback" id="meCardClose">✕ ${quad(ME_UI.close)}</button></div>
    <p>${quad(ME_UI.intro)}</p>
    <button type="button" class="primary" id="meGeo">${quad(ME_UI.useGeo)}</button>
    <form id="meForm" class="meform"><label for="meCity">${quad(ME_UI.or)}</label><input id="meCity" type="text" autocomplete="address-level2" placeholder="${tr(ME_UI.placeholder, lang())}"><button type="submit">${quad(ME_UI.go)}</button></form>
    <p class="memsg" aria-live="polite"></p><p class="bsnote">🔒 ${quad(ME_UI.privacy)} · <a href="${ME_SRC.names}" target="_blank" rel="noopener">${ME_SRC.namesCredit}</a></p>`;
}
function openMeCard(then) { meState.then = then; renderMeCard(); meCard.hidden = false; $('#meCity').focus(); }
const meMsg = m => { const el = meCard.querySelector('.memsg'); if (el) el.innerHTML = m ? quad(m) : ''; };
async function nominatim(path) {
  const r = await fetch('https://nominatim.openstreetmap.org/' + path + '&format=jsonv2&addressdetails=1&accept-language=' + ({ zh: 'zh', es: 'es', pt: 'pt' }[lang()] || 'en'));
  if (!r.ok) throw new Error('nominatim ' + r.status); return r.json();
}
function meSave(lat, lon, names) {
  meState.place = { ...roundPlace(lat, lon), names: names || {} };
  try { localStorage.setItem(ME_KEY, JSON.stringify(meState.place)); } catch {}
  meCard.hidden = true; const go = meState.then; meState.then = null; if (go) go();
}
// Location from the device (the browser or headset shows its own permission prompt), rounded before anything else · 设备定位
function meGeo(then) {
  if (!navigator.geolocation) { meMsg(ME_UI.geoDenied); return; }
  meMsg(ME_UI.looking);
  navigator.geolocation.getCurrentPosition(async p => {
    const q = roundPlace(p.coords.latitude, p.coords.longitude); let names = {};
    try { names = namesFrom((await nominatim(`reverse?lat=${q.lat}&lon=${q.lon}&zoom=10`)).address); } catch {}
    if (then) meState.then = then; meSave(q.lat, q.lon, names);
  }, () => meMsg(ME_UI.geoDenied), { enableHighAccuracy: false, timeout: 15000, maximumAge: 600000 });
}
meCard.addEventListener('click', e => {
  if (e.target.closest('#meCardClose')) { meCard.hidden = true; meState.then = null; return; }
  if (e.target.closest('#meGeo')) meGeo();
});
meCard.addEventListener('submit', async e => {
  e.preventDefault(); const q = $('#meCity').value.trim(); if (!q) return;
  const ll = q.match(/^\s*(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)\s*$/);   // "34.05, -118.24" works too · 也可输入坐标
  if (ll) return meSave(+ll[1], +ll[2], {});
  meMsg(ME_UI.looking);
  try { const [hit] = await nominatim('search?q=' + encodeURIComponent(q) + '&limit=1'); if (!hit) return meMsg(ME_UI.notFound); meSave(+hit.lat, +hit.lon, namesFrom(hit.address)); }
  catch { meMsg(ME_UI.notFound); }
});
// Wait until the camera has arrived, then hold a moment; false if the trip was cancelled · 等待到达
async function meWait(id, hold) {
  while (id === meState.run && (journey.busy || trans < 1)) await new Promise(r => setTimeout(r, 120));
  await new Promise(r => setTimeout(r, hold)); return id === meState.run;
}
const mePlaceText = () => placeLine(meState.place?.names) || tr(ME_UI.yourArea, lang());
// Earth turned to face you, with a glowing dot on your region · 地球转向你，并标出你的地区
const mePin = { on: false, dot: null, v: new T.Vector3(), m: new T.Matrix4() };
function earthPin(on) {
  const b = bodyById.earth; if (!b) return;
  if (on && meState.place) {
    if (!mePin.dot) { mePin.dot = new T.Mesh(new T.SphereGeometry(1, 16, 12), new T.MeshBasicMaterial({ color: '#7dffcf', toneMapped: false, transparent: true })); mePin.dot.renderOrder = 5; }
    const p = spherePoint(meState.place.lat, meState.place.lon);
    mePin.p = p; mePin.dot.position.set(p.x, p.y, p.z).multiplyScalar(b.r * 1.015); mePin.dot.scale.setScalar(b.r * 0.03); b.spin.add(mePin.dot);
    if (!mePin.on) { mePin.spinWas = b.spinOn; b.spinOn = false; } mePin.on = true;
    if (zooms.focus < 1.5) { zooms.focus = 1.6; startTransition(); }   // a little closer: the whole continent in view · 稍微拉近
    if (!xr.active()) goal.pitch = clamp(meState.place.lat * Math.PI / 180 * 0.85, -1.2, 1.2);   // look from your latitude · 从你的纬度看
    meTag.innerHTML = `<small>${quad(ME_UI.here)}</small><b>${mePlaceText()}</b><button type="button" class="primary" id="meUpBtn">${quad(ME_UI.up)}</button><button type="button" class="jback" id="meClose">✕</button>`;
    meTag.hidden = xr.active();
  } else if (mePin.on) { mePin.on = false; mePin.dot?.parent?.remove(mePin.dot); b.spinOn = mePin.spinWas ?? true; meTag.hidden = true; }
}
function mePinTick(dt) {
  if (!mePin.on) return;
  const b = bodyById.earth; if (!(mode === 'focus' && focus === b)) { if (!document.body.classList.contains('me-trip')) earthPin(false); return; }
  if (renderer.xr.isPresenting) mePin.v.setFromMatrixPosition(renderer.xr.getCamera().matrixWorld);   // the head, as last drawn (no re-compute) · 头部位置
  else camera.getWorldPosition(mePin.v); b.tilt.updateMatrixWorld(); mePin.v.applyMatrix4(mePin.m.copy(b.tilt.matrixWorld).invert());   // viewer in the axis frame · 观看者在自转轴坐标中
  const want = spinToFace(mePin.p, mePin.v), cur = b.spin.rotation.y;
  b.spin.rotation.y = cur + wrapPI(want - cur) * Math.min(1, dt * 2.5);
  mePin.dot.material.opacity = 0.6 + 0.4 * Math.sin(performance.now() / 300);
}
function meStop() { meState.run++; earthPin(false); document.body.classList.remove('me-trip'); }
async function meDown() {
  if (!meState.place) return xr.active() ? meGeo(meDown) : openMeCard(meDown);   // VR: the headset asks for the location · VR 由头显询问
  const id = ++meState.run; welcome.close?.(); earthPin(false); document.body.classList.add('me-trip');
  for (const lv of ME_LEVELS) { ladderGo('L:' + lv); if (!await meWait(id, 1000)) return; }
  ladderGo('B:earth'); if (!await meWait(id, 600)) return;
  earthPin(true);   // stays on "You are here" until closed · 停在“你在这里”
  document.body.classList.remove('me-trip');
}
async function meUp() {
  if (!meState.place) return xr.active() ? meGeo(meUp) : openMeCard(meUp);
  const id = ++meState.run; document.body.classList.add('me-trip');
  if (!(mode === 'focus' && focus?.p.id === 'earth')) { ladderGo('B:earth'); if (!await meWait(id, 400)) return; }
  earthPin(true); if (!await meWait(id, 2500)) return;
  earthPin(false);
  for (const lv of [...ME_LEVELS].reverse()) { ladderGo('L:' + lv); if (!await meWait(id, 1000)) return; }
  document.body.classList.remove('me-trip');
}
$('#meBtn').onclick = () => { closeMeMenu(); closeNavPlanets(); meDown(); };
$('#meMoreBtn').onclick = e => { e.stopPropagation(); closeNavPlanets(); meMenu.hidden ? openMeMenu() : closeMeMenu(); };
meMenu.addEventListener('click', e => { const b = e.target.closest('[data-me]'); if (!b) return; closeMeMenu();
  if (b.dataset.me === 'up') meUp(); else { meStop(); openMeCard(null); } });
meTag.addEventListener('click', e => { if (e.target.closest('#meUpBtn')) meUp(); else if (e.target.closest('#meClose')) meStop(); });
addEventListener('pointerdown', e => {
  if (!meMenu.hidden && !e.target.closest('#meMenu, #meMoreBtn')) closeMeMenu();
  // taking the controls during the trip ends it · 旅途中访客操作即结束
  if (document.body.classList.contains('me-trip') && (e.target === renderer.domElement || e.target.closest?.('#nav') && !e.target.closest('#meBtn, #meMoreBtn'))) meStop();
}, true);
addEventListener('keydown', e => { if (e.key !== 'Escape') return;
  if (!meCard.hidden) { meCard.hidden = true; e.stopImmediatePropagation(); } else if (mePin.on || document.body.classList.contains('me-trip')) { meStop(); e.stopImmediatePropagation(); } }, true);
// VR panel at the end of the trip · 旅程结束时的 VR 面板
const mePanel = () => { const l = lang(); return { eyebrow: tr(ME_UI.eyebrow, l), title: tr(ME_UI.here, l), accent: '#7dffcf', text: placeLine(meState.place?.names) || tr(ME_UI.yourArea, l), facts: [], hint: tr(ME_UI.up, l), hintColor: '#7dffcf' }; };

/* ───────── 🎙 Voice commands (vr-voice): a spoken or typed equivalent for every hand action · 语音指令 ───────── */
let voiceNames = null;
function voiceCommand(text, l = lang()) {
  voiceNames ||= buildNames({ levels: LEVELS, pieces: PIECES });
  const c = parseVoiceCommand(text, voiceNames); if (!c) return null;
  const inXR = xr.active(), say = o => ({ said: tr(o, l) });
  // in VR a panel command shows that panel itself (not the Ask Cosmo reply) · VR 中直接显示对应面板
  const panel = o => { if (inXR) setTimeout(() => Object.assign(vrAsk, { open: false, q: null, a: null, err: null, state: null, cmd: false }), 0); return say(o); };
  if (c.type === 'ask') return { ask: c.q };
  if (c.type === 'go') { const info = placeInfo(c.id); if (!info) return null; ladderGo(c.id); return { said: tr(VC_SAY.go, l).replace('{n}', tr(info.names, l)) }; }
  if (c.type === 'back') { back(); return say(VC_SAY.back); }
  // zoom like a pinch; already at the limit, a bigger step goes on to the next level (like pushing past the edge) · 到边界后进入下一层
  if (c.type === 'zoom') {
    const z = zooms[mode], where = () => mode + '|' + journey.level + '|' + journey.piece, was = where(); zoomBy(c.dir === 'in' ? 1.8 : 0.55);
    if (zooms[mode] === z) { if (mode === 'journey' || mode === 'overview') zoomBy(c.dir === 'in' ? 4 : 0.25); else if (c.dir === 'out') home(); }
    const atEdge = mode === 'journey' && !journey.piece && !outerLevel(journey.level);   // the universe: nothing bigger · 宇宙：没有更大的
    if (zooms[mode] === z && where() === was && (c.dir === 'in' || atEdge)) return say(c.dir === 'in' ? VC_SAY.zoomMax : VC_SAY.zoomMin);   // nothing moved: say so · 没有变化时说明
    return say(c.dir === 'in' ? VC_SAY.zoomIn : VC_SAY.zoomOut);
  }
  if (c.type === 'turn') { goal.yaw += c.dir * 0.6; return say(VC_SAY.turn); }   // like ✋ palm + move · 同手掌
  if (c.type === 'tour') {
    if (c.op === 'start') { startTour(); return say(VC_SAY.tourStart); }
    if (!tour?.active) return say(VC_SAY.noTour);
    const now = performance.now();
    if (c.op === 'stop') { tour.stop(); return say(VC_SAY.tourStop); }
    if (c.op === 'pause') { tour.pause(now); return say(VC_SAY.tourPause); }
    tour.resume(now); return say(VC_SAY.tourResume);
  }
  if (c.type === 'save') { const id = currentPlace(); if (!id || !placeInfo(id)) return say(VC_SAY.nothing); if (favs.has(id)) return say(VC_SAY.already); favs.add(id); return say(VC_SAY.saved); }
  if (c.type === 'guide') { if (inXR) guideVR = true; else { guideShown = null; renderGuide(curGuide()); guideCard.hidden = false; } return panel(VC_SAY.guide); }
  if (c.type === 'logbook') { if (inXR) logVR = true; else openLog(); return panel(VC_SAY.logbook); }
  if (c.type === 'news') { if (inXR) { newsVR = true; markNewsSeen(); } else openNews(); return panel(VC_SAY.news); }
  if (c.type === 'planet') { if (inXR) pmVR = true; else openPM(myPlanet ? 'result' : 'edit'); return panel(VC_SAY.planet); }
  return null;
}
window.SolarAtlas = { harp: { go: id => harpGo(id), set: on => setHarp(on), at: (x, y) => harpAt(x, y, 'test'), get on() { return harpOn; }, get last() { return harpLast?.b.p.id ?? null; }, get plucks() { return harpCount; } }, me: { down: meDown, up: meUp, stop: meStop, set: (lat, lon, names) => meSave(lat, lon, names), get place() { return meState.place; }, get pinned() { return mePin.on; }, get trip() { return document.body.classList.contains('me-trip'); }, get spin() { return bodyById.earth.spin.rotation.y; } },
  merge: { open: setMerge, play: mergePlay, clap: mergeClap, state: () => ({ on: mergeOn, flying: merge.flying, t: merge.sim ? +merge.sim.t.toFixed(1) : null, sep: merge.sim ? +merge.sim.sep().toFixed(2) : null, done: merge.done, shown: merge.shown, level: journey.level, drawn: merge.pts ? (() => { const a = merge.pts.geometry.attributes.position.array; let lo = 1e9, hi = -1e9; for (let i = 0; i < a.length; i += 3) { lo = Math.min(lo, a[i]); hi = Math.max(hi, a[i]); } return +(hi - lo).toFixed(2); })() : null }) },
  birthday: { go: id => bsGo(id), open: y => openBS(y), get vr() { return bsVR; }, get year() { return bsYear; } }, voiceCommand, ask: t => chat.ask(t, true), get myPlanet() { return myPlanet; }, pmGo, openPM, vrPanel: () => pmVR ? pmPanel() : null,  get vrGuide() { return guideVR; }, vrMenuIds: () => vrMenu().rows.map(r => r.id), get vrAsk() { return { ...vrAsk, upAt: Math.round(hand.upAt || 0), downAt: Math.round(hand.downAt || 0), now: Math.round(performance.now()) }; }, get mode() { return mode; }, get mr() { return xr.mrState(); }, get focusId() { return focus?.p.id ?? null; }, ladderGo, demo: () => startDemo(), tour: { start: () => startTour(), pause: () => tour.pause(performance.now()), resume: () => tour.resume(performance.now()), stop: () => tour.stop(), get active() { return tour.active; }, get paused() { return tour.paused; }, get index() { return tour.index; }, get steps() { return tour.steps.length; }, get key() { return tour.step?.key ?? null; }, get phase() { return tour.state.phase; }, get user() { return !!tour.step?.user; } }, journey: { go: id => goLevel(id, 'up'), open: openPiece, back, pick: (x, y, px) => pickAt(x, y, px), get level() { return journey.level; }, get piece() { return journey.piece; }, get busy() { return journey.busy || trans < 1; } }, zoomBy, trajectory, PLANETS, selectPlanet: select, home, lineup, bodies: bodyById, scene, camera, simulateHand: onHand, screenOf: id => screenOf(bodyById[id]) };
