/* Easter egg secreto: Backrooms clássicas.
 * Isolado da rota principal. NÃO altera sprites, cenários ou o final normal.
 * Um token futuro pode ser carregado em window.BACKROOMS_FIGURE_TOKEN_URL.
 */
(()=>{
'use strict';
if(typeof checkCode!=='function'||typeof endGame!=='function'||typeof setState!=='function'){
  throw Error('Backrooms: jogo principal não está pronto.');
}
const $=id=>document.getElementById(id);
const BASE_T=64, COLS=31, ROWS=21;
const canvas=document.createElement('canvas');
canvas.id='backrooms-canvas';canvas.width=960;canvas.height=540;
canvas.setAttribute('aria-label','Labirinto secreto das Backrooms');
const ctx=canvas.getContext('2d',{alpha:false});
const root=document.createElement('section');
root.id='backrooms-screen';
root.className='hidden';
root.setAttribute('role','region');
root.setAttribute('aria-label','Um lugar que não deveria existir');
root.innerHTML='<div class="br-fade" aria-hidden="true"></div>'+
 '<div class="br-hint">WASD / SETAS · MOVER <span>SHIFT · CORRER</span></div>'+
 '<div class="br-touch" aria-label="Controles de movimento para toque">'+
 '<button data-br="up" aria-label="Cima">▲</button>'+
 '<button data-br="left" aria-label="Esquerda">◀</button>'+
 '<button data-br="down" aria-label="Baixo">▼</button>'+
 '<button data-br="right" aria-label="Direita">▶</button>'+
 '</div>';
root.insertBefore(canvas,root.firstChild);
const overlay=$('overlay');
if(!overlay)throw Error('Backrooms: overlay ausente.');
overlay.append(root);
const style=document.createElement('style');
style.id='backrooms-test-style';
style.textContent=[
'#viewport #backrooms-screen{position:absolute;inset:0;z-index:100;width:100%;height:100%;'+
 'padding:0;margin:0;border:0;background:#0a0905;overflow:hidden;}',
'#viewport #backrooms-screen.hidden{display:none!important}',
'#backrooms-canvas{display:block;width:100%;height:100%;image-rendering:pixelated;'+
 'image-rendering:crisp-edges;touch-action:none}',
'#backrooms-screen .br-fade{position:absolute;inset:0;pointer-events:none;z-index:8;'+
 'background:#000;opacity:1}',
'#backrooms-screen .br-hint{position:absolute;z-index:5;bottom:13px;left:50%;'+
 'transform:translateX(-50%);padding:7px 12px;color:rgba(235,224,169,.77);'+
 'background:rgba(46,41,25,.6);font:10px/1.3 monospace;'+
 'letter-spacing:.1em;white-space:nowrap;pointer-events:none;opacity:0;transition:opacity 1s}',
'#backrooms-screen .br-touch{display:none;position:absolute;bottom:14px;right:16px;z-index:6;'+
 'grid-template-columns:repeat(3,43px);grid-template-rows:repeat(2,43px);gap:5px}',
'#backrooms-screen .br-touch button{touch-action:none;user-select:none;border:1px solid #aaa16e;'+
 'background:rgba(55,50,31,.77);color:#e7e1b8;border-radius:4px;font-size:18px;'+
 'min-width:43px;min-height:43px}',
'#backrooms-screen .br-touch [data-br="up"]{grid-column:2;grid-row:1}',
'#backrooms-screen .br-touch [data-br="left"]{grid-column:1;grid-row:2}',
'#backrooms-screen .br-touch [data-br="down"]{grid-column:2;grid-row:2}',
'#backrooms-screen .br-touch [data-br="right"]{grid-column:3;grid-row:2}',
'@media(pointer:coarse){#backrooms-screen .br-touch{display:grid}}',
'@media(max-width:600px){#backrooms-screen .br-hint span{display:none}}'
].join('\n');
document.head.append(style);
const fade=root.querySelector('.br-fade');
const hint=root.querySelector('.br-hint');
const map=Array.from({length:ROWS},()=>Array(COLS).fill('#'));
function carve(x,y,w,h){
 for(let yy=y;yy<y+h;yy++)for(let xx=x;xx<x+w;xx++){
  if(xx>0&&yy>0&&xx<COLS-1&&yy<ROWS-1)map[yy][xx]='.';
 }
}
// Ambiente curto: hall, corredor, bifurcação sem saída, sala e encontro.
carve(1,16,7,4);       // começo
carve(5,12,3,6);       // corredor inicial
carve(5,12,13,3);      // travessia ao leste
carve(9,14,3,5);       // ramificação falsa
carve(9,17,7,2);       // parede morta
carve(15,7,3,8);       // segundo corredor
carve(15,6,12,3);      // labirinto repetitivo
carve(23,3,4,6);       // acesso ao encontro
carve(22,2,8,4);       // sala final
const START={x:3.4*BASE_T,y:17.9*BASE_T};
const PERSON={x:27.5*BASE_T,y:3.65*BASE_T};
const lights=[
 [3.5,17.5],[6.5,13.5],[11.5,13.5],[10.4,17.5],
 [16.4,10.2],[20.5,7.4],[25.1,7.4],[26.5,3.6]
];
const held=new Set();
let visitedAnyRoom=false,secretEligible=false,active=false,finished=false;
let px=START.x,py=START.y,direction='down',walk=0,sprint=false;
let startedAt=0,finishedAt=0,prev=0,clock=0,nextCrackle=0;
let soundNodes=null,humGain=null,soundCtx=null;
const oldCheckCode=checkCode,oldEndGame=endGame,oldRetry=retry;
const oldEnter1=enterScene1,oldEnter2=enterScene2,oldEnter3=enterScene3;
const oldUpdate=update;
function markVisited(){visitedAnyRoom=true;secretEligible=false;}
enterScene1=function(){markVisited();return oldEnter1.apply(this,arguments);};
enterScene2=function(){markVisited();return oldEnter2.apply(this,arguments);};
enterScene3=function(){markVisited();return oldEnter3.apply(this,arguments);};
checkCode=function(){
  const correct=state==='keypad'&&inputCode.length===3&&
   inputCode+'4'===CONFIG.password;
  if(correct)secretEligible=!visitedAnyRoom;
  return oldCheckCode.apply(this,arguments);
};
// O botão CONFIRMAR recebe o handler original no init(); interceptá-lo
// evita que a validação de clique ignore a flag de rota secreta.
const confirmKeypad=$('enter-key');
if(confirmKeypad&&typeof confirmKeypad.onclick==='function'){
 const oldConfirm=confirmKeypad.onclick;
 confirmKeypad.onclick=function(){
  if(state==='keypad'&&inputCode.length===3&&inputCode+'4'===CONFIG.password)
   secretEligible=!visitedAnyRoom;
  return oldConfirm.apply(this,arguments);
 };
}
retry=function(full){
 if(full){
  visitedAnyRoom=false;secretEligible=false;
  stopBackrooms();
 }
 return oldRetry.apply(this,arguments);
};
const startBtn=$('start-btn');
if(startBtn)startBtn.addEventListener('click',()=>{
 if(!active){visitedAnyRoom=false;secretEligible=false;}
});
endGame=function(){
 if(state==='play'&&doorUnlocked&&secretEligible&&!visitedAnyRoom){
  startBackrooms();return;
 }
 return oldEndGame.apply(this,arguments);
};
function silenceMusic(){
 if(!audioCtx)return;
 const t=audioCtx.currentTime;
 for(const bus of [ambientGain,limCalmBus,limTenseBus,scene2PianoBus,scene3PianoBus,skyHarpBus]){
  if(bus&&bus.gain)bus.gain.setTargetAtTime(0,t,.04);
 }
}
update=function(dt){
 if(scene1Active||scene2Active||scene3Active)markVisited();
 const result=oldUpdate(dt);
 if(active){silenceMusic();}
 return result;
};
function makeBuzz(){
 if(!audioOn)return;
 try{
  soundCtx=audioCtx||new(window.AudioContext||window.webkitAudioContext)();
  if(soundCtx.state==='suspended')soundCtx.resume().catch(()=>{});
  const master=soundCtx.createGain();
  master.gain.value=.0001;
  master.connect(soundCtx.destination);
  humGain=master;
  const oscillators=[];
  for(const spec of [[60,'sawtooth',.017],[120.3,'triangle',.012],[239.2,'sine',.006]]){
   const osc=soundCtx.createOscillator(),g=soundCtx.createGain();
   osc.type=spec[1];osc.frequency.value=spec[0];g.gain.value=spec[2];
   osc.connect(g);g.connect(master);osc.start();oscillators.push(osc);
  }
  const length=Math.floor(soundCtx.sampleRate*1.2);
  const buffer=soundCtx.createBuffer(1,length,soundCtx.sampleRate);
  const data=buffer.getChannelData(0);
  for(let i=0;i<data.length;i++)data[i]=(Math.random()*2-1)*.16;
  const noise=soundCtx.createBufferSource();noise.buffer=buffer;noise.loop=true;
  const filter=soundCtx.createBiquadFilter();filter.type='bandpass';
  filter.frequency.value=1620;filter.Q.value=.65;
  const ng=soundCtx.createGain();ng.gain.value=.06;
  noise.connect(filter);filter.connect(ng);ng.connect(master);noise.start();
  soundNodes={oscillators,noise,master};
  master.gain.setTargetAtTime(.95,soundCtx.currentTime,.22);
 }catch(e){soundNodes=null;humGain=null;}
}
function stopBuzz(){
 if(!soundNodes)return;
 const n=soundNodes;soundNodes=null;
 try{
  n.master.gain.setTargetAtTime(0,soundCtx.currentTime,.08);
  for(const osc of n.oscillators)osc.stop(soundCtx.currentTime+.4);
  n.noise.stop(soundCtx.currentTime+.4);
 }catch(e){}
 humGain=null;
}
function crackle(){
 if(!audioOn||!soundCtx||!humGain)return;
 const now=soundCtx.currentTime;
 try{
  const o=soundCtx.createOscillator(),g=soundCtx.createGain();
  o.type='square';o.frequency.setValueAtTime(1100,now);
  o.frequency.exponentialRampToValueAtTime(290,now+.055);
  g.gain.setValueAtTime(.001,now);
  g.gain.linearRampToValueAtTime(.028,now+.006);
  g.gain.exponentialRampToValueAtTime(.0001,now+.085);
  o.connect(g);g.connect(soundCtx.destination);
  o.start(now);o.stop(now+.09);
 }catch(e){}
}
function startBackrooms(){
 if(active)return;
 active=true;finished=false;held.clear();
 px=START.x;py=START.y;direction='up';walk=0;
 startedAt=performance.now()/1000;prev=startedAt;clock=0;nextCrackle=3.4;
 // Exatamente na travessia: sala escura, corte brusco, zumbido fluorescente.
 setState('backrooms');
 $('hud')?.classList.add('hidden');
 $('toast')?.classList.add('hidden');
 $('mobileControls')?.classList.add('hidden');
 fade.style.opacity='1';
 hint.style.opacity='0';
 silenceMusic();makeBuzz();
 requestAnimationFrame(frame);
}
function stopBackrooms(){
 active=false;finished=false;held.clear();stopBuzz();
 fade.style.opacity='1';root.classList.add('hidden');
}
const figureImage=new Image();
const figureUrl=window.BACKROOMS_FIGURE_TOKEN_URL;
if(typeof figureUrl==='string'&&figureUrl.trim())figureImage.src=figureUrl;
function keydown(e){
 if(!active||finished)return;
 const key=e.key.toLowerCase();
 if(['w','a','s','d','arrowup','arrowdown','arrowleft','arrowright','shift'].includes(key)){
  held.add(key);e.preventDefault();e.stopImmediatePropagation();
 }
}
function keyup(e){
 if(!active)return;
 const key=e.key.toLowerCase();
 held.delete(key);
 if(['w','a','s','d','arrowup','arrowdown','arrowleft','arrowright','shift'].includes(key)){
  e.preventDefault();e.stopImmediatePropagation();
 }
}
document.addEventListener('keydown',keydown,true);
document.addEventListener('keyup',keyup,true);
document.addEventListener('blur',()=>held.clear());
for(const button of root.querySelectorAll('[data-br]')){
 const dir=button.getAttribute('data-br');
 const k={up:'w',down:'s',left:'a',right:'d'}[dir];
 button.addEventListener('pointerdown',e=>{
  if(!active||finished)return;e.preventDefault();held.add(k);
  try{button.setPointerCapture(e.pointerId);}catch(_){}
 });
 for(const event of ['pointerup','pointercancel','lostpointercapture']){
  button.addEventListener(event,()=>held.delete(k));
 }
}
function passable(x,y,r=13){
 for(const dx of [-r,r])for(const dy of [-r,r]){
  const cx=Math.floor((x+dx)/BASE_T),cy=Math.floor((y+dy)/BASE_T);
  if(cx<0||cx>=COLS||cy<0||cy>=ROWS||map[cy][cx]==='#')return false;
 }
 return true;
}
function hash(x,y,n=0){
 let v=(x*73856093)^(y*19349663)^(n*83492791);
 v=Math.imul(v^(v>>>13),1274126177);
 return ((v^(v>>>16))>>>0)/4294967295;
}
function rect(x,y,w,h,c){
 ctx.fillStyle=c;ctx.fillRect(Math.floor(x),Math.floor(y),Math.ceil(w),Math.ceil(h));
}
function renderTile(x,y,sx,sy,t){
 const n=hash(x,y);
 if(t==='.'){
  rect(sx,sy,BASE_T+1,BASE_T+1,n>.44?'#a4a077':'#a9a27a');
  rect(sx+1,sy+2,BASE_T-1,2,'rgba(255,249,194,.085)');
  for(let i=0;i<15;i++){
   const xx=hash(x,y,i+4)*BASE_T,yy=hash(x,y,i+31)*BASE_T;
   rect(sx+xx,sy+yy,2+(i%3),1+(i%2),i%2?'rgba(54,52,35,.10)':'rgba(250,238,165,.075)');
  }
  if(n>.81)rect(sx+13,sy+32,40,2,'rgba(82,79,50,.10)');
 }else{
  rect(sx,sy,BASE_T+1,BASE_T+1,'#bcb477');
  rect(sx+4,sy+2,BASE_T-8,BASE_T-5,'#c4bb82');
  for(let i=0;i<4;i++){
   rect(sx+9+i*15,sy+5,1,BASE_T-8,'rgba(123,107,61,.13)');
  }
  const exposed=y+1<ROWS&&map[y+1][x]==='.';
  const right=x+1<COLS&&map[y][x+1]==='.';
  if(exposed){
   rect(sx,sy+BASE_T-11,BASE_T,11,'#5c5534');
   rect(sx,sy+BASE_T-13,BASE_T,3,'#e7d998');
   rect(sx,sy+BASE_T-9,BASE_T,2,'#999057');
  }
  if(right){
   rect(sx+BASE_T-10,sy,10,BASE_T,'#766b42');
   rect(sx+BASE_T-12,sy,2,BASE_T,'#f0dc9a');
  }
 }
}
function drawPlayer(x,y,dir,moving){
 ctx.save();ctx.translate(Math.floor(x),Math.floor(y));
 const bob=moving?Math.sin(walk*2)*2:0;
 ctx.translate(0,bob);
 ctx.fillStyle='rgba(18,17,12,.35)';ctx.beginPath();ctx.ellipse(0,18,19,6,0,0,Math.PI*2);ctx.fill();
 // Troços largos e canelas enfaixadas.
 rect(-13,2,11,21,'#363239');rect(2,2,11,21,'#3b3036');
 rect(-13,15,10,7,'#c0ada0');rect(3,15,10,7,'#c0ada0');
 rect(-14,20,12,5,'#2b2227');rect(2,20,12,5,'#2b2227');
 // Sobretudo desgastado.
 rect(-18,-15,36,28,'#211b24');rect(-13,-12,26,24,'#302730');
 rect(-17,5,8,11,'#201820');rect(9,5,8,11,'#21181d');
 rect(-22,-11,6,21,'#45333d');rect(16,-11,6,21,'#413038');
 // Cabeça pálida e máscara costurada.
 rect(-13,-33,26,23,'#d2c4ab');rect(-11,-35,22,3,'#d2c4ab');
 rect(-14,-21,4,10,'#b9a992');rect(11,-23,3,12,'#b9a992');
 rect(-6,-33,2,16,'#736657');rect(-9,-25,7,2,'#736657');
 rect(5,-29,2,4,'#76685a');
 if(dir==='left')rect(-13,-23,3,4,'#d5a557');
 if(dir==='right')rect(10,-23,3,4,'#d5a557');
 if(dir==='down') {rect(-7,-24,3,4,'#b17843');rect(5,-24,3,4,'#b17843');}
 // Cachecol vinho, franja levemente oscilante.
 rect(-19,-13,37,9,'#6b2939');rect(-12,-8,28,5,'#522030');
 rect(-18,-7,8,14,'#5d2435');rect(-22,-5+Math.sin(walk)*3,5,18,'#511b2a');
 ctx.restore();
}
function drawFigure(sx,sy,now){
 const flick=.8+.2*Math.sin(now*3.4);
 ctx.save();ctx.translate(sx,sy);
 ctx.globalAlpha=flick;
 if(figureImage.complete&&figureImage.naturalWidth){
  ctx.drawImage(figureImage,-27,-104,54,100);
 }else{
  // Placeholder proposital: será substituído pelo token do personagem.
  ctx.fillStyle='rgba(28,26,18,.28)';ctx.beginPath();
  ctx.ellipse(0,19,29,12,0,0,Math.PI*2);ctx.fill();
  rect(-14,-65,28,58,'#171711');rect(-10,-8,9,29,'#1d1b17');
  rect(3,-8,9,29,'#1d1b17');rect(-10,-89,20,26,'#181714');
  rect(-17,-57,7,40,'#1b1915');rect(10,-57,7,40,'#1b1915');
  rect(-7,-91,14,5,'#151411');
 }
 ctx.restore();
}
function draw(now){
 const cw=canvas.width,ch=canvas.height;
 const camX=Math.max(0,Math.min(COLS*BASE_T-cw,px-cw/2));
 const camY=Math.max(0,Math.min(ROWS*BASE_T-ch,py-ch/2));
 rect(0,0,cw,ch,'#393524');
 const x1=Math.floor(camX/BASE_T)-1,x2=Math.ceil((camX+cw)/BASE_T)+1;
 const y1=Math.floor(camY/BASE_T)-1,y2=Math.ceil((camY+ch)/BASE_T)+1;
 for(let y=Math.max(0,y1);y<Math.min(ROWS,y2);y++){
  for(let x=Math.max(0,x1);x<Math.min(COLS,x2);x++){
   renderTile(x,y,x*BASE_T-camX,y*BASE_T-camY,map[y][x]);
  }
 }
 // Faixas luminosas de lâmpadas no teto e falhas ocasionais.
 ctx.save();ctx.globalCompositeOperation='screen';
 for(let i=0;i<lights.length;i++){
  const light=lights[i],x=light[0]*BASE_T-camX,y=light[1]*BASE_T-camY;
  const flick=(i===6&&Math.floor(now*10)%37<3)?0.06:1;
  const radius=230;
  const grd=ctx.createRadialGradient(x,y,8,x,y,radius);
  grd.addColorStop(0,'rgba(249,236,157,'+(.25*flick)+')');
  grd.addColorStop(.35,'rgba(236,222,138,'+(.12*flick)+')');
  grd.addColorStop(1,'rgba(238,213,131,0)');
  ctx.fillStyle=grd;ctx.fillRect(x-radius,y-radius,2*radius,2*radius);
  rect(x-21,y-12,42,5,'rgba(253,253,226,'+(.72*flick)+')');
  rect(x-21,y-7,42,2,'rgba(233,224,166,'+(.33*flick)+')');
 }
 ctx.restore();
 // A luz não chega perfeitamente aos cantos.
 const vign=ctx.createRadialGradient(480,270,75,480,270,520);
 vign.addColorStop(0,'rgba(30,27,12,0)');
 vign.addColorStop(1,'rgba(18,16,8,.78)');
 ctx.fillStyle=vign;ctx.fillRect(0,0,cw,ch);
 const fpX=PERSON.x-camX,fpY=PERSON.y-camY;
 drawFigure(fpX,fpY,now);
 drawPlayer(px-camX,py-camY,direction,walk>0);
 // Leve interferência horizontal, sem esconder o cenário.
 ctx.fillStyle='rgba(63,53,28,'+(.023+.01*Math.sin(now*1.3))+')';
 for(let y=2;y<ch;y+=7)ctx.fillRect(0,y,cw,1);
}
function frame(timestamp){
 if(!active)return;
 const now=timestamp/1000,dt=Math.max(0,Math.min(.045,now-prev));
 prev=now;clock=now-startedAt;
 if(!finished && clock>.85){
  let dx=Number(held.has('d')||held.has('arrowright'))-
         Number(held.has('a')||held.has('arrowleft'));
  let dy=Number(held.has('s')||held.has('arrowdown'))-
         Number(held.has('w')||held.has('arrowup'));
  const l=Math.hypot(dx,dy);
  if(l>0){
   dx/=l;dy/=l;
   const speed=held.has('shift')?170:114;
   const sx=dx*speed*dt,sy=dy*speed*dt;
   if(passable(px+sx,py))px+=sx;
   if(passable(px,py+sy))py+=sy;
   direction=Math.abs(dx)>Math.abs(dy)?(dx>0?'right':'left'):(dy>0?'down':'up');
   walk+=l*dt*9;sprint=held.has('shift');
  }else{sprint=false;}
  if(Math.hypot(px-PERSON.x,py-PERSON.y)<75){
   finished=true;finishedAt=now;held.clear();
   if(humGain&&soundCtx)humGain.gain.setTargetAtTime(0,soundCtx.currentTime,.22);
  }
 }
 if(!finished&&clock>nextCrackle){
  if(Math.random()<.75)crackle();
  nextCrackle=clock+2.2+Math.random()*4.2;
 }
 draw(now);
 // Transição de entrada; chegada à pessoa: fade seco e fim sem falas.
 const alpha=finished?Math.min(1,(now-finishedAt)/.62):Math.max(0,1-clock/.85);
 fade.style.opacity=String(alpha);
 hint.style.opacity=finished?'0':clock>1.7&&clock<6.6?'1':'0';
 if(finished&&now-finishedAt>1.3){
  stopBuzz();root.classList.add('br-ended');
  return; // Cena encerrada: tela preta, nenhuma fala.
 }
 requestAnimationFrame(frame);
}
window.__backroomsEasterEgg={
 status:()=>({visitedAnyRoom,secretEligible,active,finished,
   gameState:state,x:Math.round(px),y:Math.round(py),passwordLength:CONFIG.password.length}),
 inspectMap:()=>map.map(r=>r.join(''))
};
})();
