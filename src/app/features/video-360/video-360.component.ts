import { Component, inject, OnInit, ElementRef, ViewChild, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { FileService } from '../../core/services/file.service';

// Viewer 360° dual-fisheye per video Insta360 (.insv/.lrv).
// Usa Three.js con uno shader GLSL custom che mappa la sfera sul formato
// dual-fisheye (due cerchi affiancati, proiezione equidistante).
@Component({
  selector: 'app-video-360',
  standalone: true,
  templateUrl: './video-360.component.html',
  styleUrls: ['./video-360.component.scss'],
})
export class Video360Component implements OnInit, OnDestroy {
  private route    = inject(ActivatedRoute);
  private location = inject(Location);
  private fileSvc  = inject(FileService);

  @ViewChild('container', { static: true }) containerRef!: ElementRef<HTMLDivElement>;

  name     = '';
  videoUrl = '';

  ngOnInit(): void {
    const path = this.route.snapshot.queryParamMap.get('path') ?? '';
    this.name  = this.route.snapshot.queryParamMap.get('name') ?? '';
    this.videoUrl = this.fileSvc.previewUrl(path);
    this.loadViewer();
  }

  // Il viewer 360° è implementato come HTML+Three.js in un <iframe> locale.
  // Generiamo la pagina come Blob URL per evitare problemi CORS con file://.
  private loadViewer(): void {
    const html  = this.buildHtml(this.videoUrl);
    const blob  = new Blob([html], { type: 'text/html' });
    const url   = URL.createObjectURL(blob);
    const iframe = document.createElement('iframe');
    iframe.src = url;
    iframe.style.cssText = 'width:100%;height:100%;border:none;background:#000';
    iframe.allow = 'autoplay';
    this.containerRef.nativeElement.appendChild(iframe);
  }

  flipLenses(): void {
    const iframe = this.containerRef.nativeElement.querySelector('iframe');
    (iframe?.contentWindow as any)?.flipLenses?.();
  }

  resetView(): void {
    const iframe = this.containerRef.nativeElement.querySelector('iframe');
    (iframe?.contentWindow as any)?.resetView?.();
  }

  back(): void { this.location.back(); }

  ngOnDestroy(): void {
    // Libera i Blob URL creati
    const iframe = this.containerRef.nativeElement.querySelector('iframe');
    if (iframe?.src?.startsWith('blob:')) URL.revokeObjectURL(iframe.src);
  }

  private buildHtml(videoUrl: string): string {
    const safeUrl = videoUrl.replace(/'/g, "\\'");
    return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { background: #000; overflow: hidden; width: 100vw; height: 100vh; font-family: sans-serif; }
  #hint {
    position: absolute; top: 12px; left: 50%;
    transform: translateX(-50%);
    color: rgba(255,255,255,0.55); font: 13px/1 sans-serif;
    pointer-events: none; text-shadow: 0 1px 4px #000; white-space: nowrap;
  }
  #playerBar {
    position: absolute; bottom: 0; left: 0; right: 0;
    background: linear-gradient(transparent, rgba(0,0,0,0.85));
    padding: 10px 16px 14px;
    display: flex; flex-direction: column; gap: 8px;
  }
  #seekRow { display: flex; align-items: center; gap: 10px; }
  #seekBar {
    flex: 1; height: 4px; background: rgba(255,255,255,0.25);
    border-radius: 2px; cursor: pointer; position: relative;
  }
  #seekFill { height: 100%; background: #ff6b00; border-radius: 2px; width: 0%; pointer-events: none; }
  #seekHandle {
    position: absolute; top: 50%; right: -6px;
    width: 12px; height: 12px; background: #fff;
    border-radius: 50%; transform: translateY(-50%);
    pointer-events: none; display: none;
  }
  #seekBar:hover #seekHandle { display: block; }
  .time { color: rgba(255,255,255,0.8); font-size: 12px; white-space: nowrap; }
  #btnRow { display: flex; align-items: center; gap: 8px; }
  button {
    background: rgba(255,255,255,0.12); border: 1px solid rgba(255,255,255,0.25);
    color: #fff; padding: 5px 12px; border-radius: 14px; cursor: pointer; font-size: 12px;
  }
  button:hover { background: rgba(255,255,255,0.22); }
  #btnPlay { font-size: 16px; padding: 4px 10px; }
  #volBtn { font-size: 16px; padding: 2px 6px; }
  #volSlider { width: 80px; accent-color: #ff6b00; cursor: pointer; vertical-align: middle; }
</style>
</head>
<body>
<div id="hint">Trascina per ruotare &nbsp;·&nbsp; Scorri per zoom</div>
<div id="playerBar">
  <div id="seekRow">
    <span class="time" id="tCurrent">0:00</span>
    <div id="seekBar"><div id="seekFill"></div><div id="seekHandle"></div></div>
    <span class="time" id="tDuration">0:00</span>
  </div>
  <div id="btnRow">
    <button id="btnPlay" onclick="togglePlay()">▶</button>
    <button id="volBtn" onclick="toggleMute()">🔊</button>
    <input id="volSlider" type="range" min="0" max="1" step="0.05" value="1" oninput="onVolume(this.value)" title="Volume"/>
    <button onclick="flipLenses()">⇄ Inverti lenti</button>
    <button onclick="resetView()">⟳ Reset vista</button>
  </div>
</div>
<script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
<script>
const scene    = new THREE.Scene();
const camera   = new THREE.PerspectiveCamera(75, innerWidth/innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({
  antialias: true,
  powerPreference: 'high-performance', // su dual-GPU usa la discreta, non l'integrata
});
// Cap a 2× per evitare che telefoni con 3× ratio facciano 9× lavoro inutile
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.setSize(innerWidth, innerHeight);
document.body.appendChild(renderer.domElement);

const video = document.createElement('video');
video.src = '${safeUrl}';
video.crossOrigin = 'anonymous';
video.loop = true; video.muted = false; video.playsInline = true;

const overlay = document.createElement('div');
overlay.style.cssText = 'position:fixed;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;background:rgba(0,0,0,0.7);cursor:pointer;z-index:10;color:#fff;font-family:sans-serif;gap:12px;';
overlay.innerHTML = '<div style="font-size:56px">▶</div><div style="font-size:16px">Clicca per avviare il video 360°</div><div id="errMsg" style="font-size:12px;color:#f88;margin-top:8px;max-width:80%;text-align:center;"></div>';
document.body.appendChild(overlay);

overlay.addEventListener('click', () => {
  video.play().then(() => overlay.style.display='none').catch(e => document.getElementById('errMsg').textContent='Errore: '+e.message);
});
video.addEventListener('canplay', () => { video.play().then(() => overlay.style.display='none').catch(()=>{}); });
video.addEventListener('error', () => {
  const e = video.error;
  document.getElementById('errMsg').textContent = 'Errore video. Code '+(e?.code)+'. Verifica CORS gateway.';
});

const tex = new THREE.VideoTexture(video);
tex.minFilter = tex.magFilter = THREE.LinearFilter;
tex.format    = THREE.RGBFormat;

const geo = new THREE.SphereGeometry(500, 80, 60);
geo.scale(-1, 1, 1);

const vert = \`
  varying vec3 vPos;
  void main() { vPos = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }
\`;
const frag = \`
  precision highp float;
  uniform sampler2D map; uniform bool flipped; varying vec3 vPos;
  #define PI 3.14159265358979323846
  vec4 fisheye(vec3 dir, float cx) {
    float r   = acos(clamp(dir.z, -1.0, 1.0)) / (PI / 2.0);
    float phi = atan(dir.y, dir.x);
    vec2  uv  = vec2(cx + 0.245 * r * cos(phi), 0.5 + 0.245 * r * sin(phi));
    if (distance(uv, vec2(cx, 0.5)) > 0.245) return vec4(0.0, 0.0, 0.0, 1.0);
    return texture2D(map, uv);
  }
  void main() {
    vec3 d = normalize(vPos); d.x = -d.x;
    bool front = flipped ? (d.z < 0.0) : (d.z >= 0.0);
    gl_FragColor = front ? fisheye(d, 0.25) : fisheye(vec3(-d.x, d.y, -d.z), 0.75);
  }
\`;
const mat = new THREE.ShaderMaterial({ uniforms:{map:{value:tex},flipped:{value:false}}, vertexShader:vert, fragmentShader:frag });
scene.add(new THREE.Mesh(geo, mat));

let drag=false, prevX=0, prevY=0, rotX=0, rotY=0;
const el = renderer.domElement;
el.addEventListener('mousedown', e=>{drag=true;prevX=e.clientX;prevY=e.clientY;});
el.addEventListener('mouseup', ()=>drag=false);
el.addEventListener('mouseleave', ()=>drag=false);
el.addEventListener('mousemove', e=>{
  if(!drag)return;
  rotY+=(e.clientX-prevX)*0.003; rotX+=(e.clientY-prevY)*0.003;
  rotX=Math.max(-Math.PI/2,Math.min(Math.PI/2,rotX));
  prevX=e.clientX; prevY=e.clientY;
});
el.addEventListener('wheel', e=>{
  camera.fov=Math.max(30,Math.min(110,camera.fov+e.deltaY*0.05));
  camera.updateProjectionMatrix(); e.preventDefault();
},{passive:false});
window.addEventListener('resize',()=>{
  camera.aspect=innerWidth/innerHeight; camera.updateProjectionMatrix();
  renderer.setSize(innerWidth,innerHeight);
});

const btnPlay=document.getElementById('btnPlay'),seekBar=document.getElementById('seekBar'),
      seekFill=document.getElementById('seekFill'),seekHandle=document.getElementById('seekHandle'),
      tCurrent=document.getElementById('tCurrent'),tDuration=document.getElementById('tDuration');

function fmt(s){if(!isFinite(s))return'0:00';return Math.floor(s/60)+':'+String(Math.floor(s%60)).padStart(2,'0');}
function togglePlay(){video.paused?video.play():video.pause();}
function flipLenses(){mat.uniforms.flipped.value=!mat.uniforms.flipped.value;}
function resetView(){rotX=0;rotY=0;camera.fov=75;camera.updateProjectionMatrix();}
function onVolume(val){
  video.volume=parseFloat(val);
  video.muted=(parseFloat(val)===0);
  document.getElementById('volBtn').textContent=video.muted?'🔇':parseFloat(val)>0.5?'🔊':'🔉';
}
function toggleMute(){
  video.muted=!video.muted;
  document.getElementById('volBtn').textContent=video.muted?'🔇':video.volume>0.5?'🔊':'🔉';
  document.getElementById('volSlider').value=video.muted?0:video.volume;
}

video.addEventListener('timeupdate',()=>{
  if(!video.duration)return;
  const p=(video.currentTime/video.duration)*100;
  seekFill.style.width=p+'%'; seekHandle.style.left='calc('+p+'% - 6px)';
  tCurrent.textContent=fmt(video.currentTime);
});
video.addEventListener('loadedmetadata',()=>tDuration.textContent=fmt(video.duration));
video.addEventListener('play',()=>btnPlay.textContent='⏸');
video.addEventListener('pause',()=>btnPlay.textContent='▶');

let seeking=false;
function seekTo(e){const r=seekBar.getBoundingClientRect(),p=Math.max(0,Math.min(1,(e.clientX-r.left)/r.width));if(video.duration)video.currentTime=p*video.duration;}
seekBar.addEventListener('mousedown',e=>{seeking=true;seekTo(e);e.stopPropagation();});
document.addEventListener('mousemove',e=>{if(seeking)seekTo(e);});
document.addEventListener('mouseup',()=>seeking=false);

const qX=new THREE.Quaternion(),qY=new THREE.Quaternion(),axX=new THREE.Vector3(1,0,0),axY=new THREE.Vector3(0,1,0);
function animate(){requestAnimationFrame(animate);qY.setFromAxisAngle(axY,rotY);qX.setFromAxisAngle(axX,rotX);camera.quaternion.copy(qY).multiply(qX);renderer.render(scene,camera);}
animate();
</script>
</body>
</html>`;
  }
}
