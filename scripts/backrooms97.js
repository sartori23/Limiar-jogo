/* niente da vedere — Easter egg Backrooms / rota sem nenhuma memória.
 * Instalar APÓS finale-teste66.js e teste96.js.
 * Nada aqui concede teleporte; só intercepta a travessia legítima da Grande Porta.
 */
(()=>{
'use strict';
const TILE97=64;
const ROOMS97=[
"#########################",
"#.......................#",
"#.#########.###########.#",
"#.#.......#.#.........#.#",
"#.#.#####.#.#.#######.#.#",
"#.#.#...#.#.#.#.....#.#.#",
"#...#.#.#...#.#.###.#...#",
"#####.#.#####.#.#.#.#####",
"#.....#.....#...#.#.....#",
"#.#########.#####.#####.#",
"#.#.......#.......#.....#",
"#.#.#####.#########.###.#",
"#.#...#.#...........#...#",
"#.###.#.###########.#.###",
"#.....#.............#...#",
"#########################"
];
if(ROOMS97.some(r=>r.length!==25))throw Error('Mapa secreto inválido');
const WIDTH97=25*TILE97,HEIGHT97=ROOMS97.length*TILE97;
const start97={x:1.5*TILE97,y:14.5*TILE97},figure97={x:22.5*TILE97,y:1.5*TILE97};
let enteredAnyMemory97=false,armed97=false;
let active97=false,finished97=false,encounter97=false;
let fade97=0,walk97=0,sounds97=0,blink97=0,phase97=0;
let brAudio97=null,osc97=[],lastZap97=0;
const vp97=document.getElementById('viewport'),overlay97=document.getElementById('overlay');
const ending97=document.createElement('section');
ending97.id='backrooms-end-screen';ending97.className='panel hidden';
ending97.setAttribute('role','dialog');ending97.setAttribute('aria-label','Fim');
ending97.style.cssText='position:absolute;inset:0;width:100%;height:100%;max-width:none;max-height:none;background:#000;border:0;padding:0;box-shadow:none';
overlay97.appendChild(ending97);
const style97=document.createElement('style');
style97.textContent=[
 '#viewport.ndv-backrooms97 #hud{display:none!important}',
 '#viewport.ndv-backrooms97 #film-grain{opacity:.15}',
 '#backrooms-end-screen:not(.hidden){display:block!important;position:absolute!important;inset:0!important;width:100%!important;height:100%!important;max-width:none!important;max-height:none!important;background:#000!important;border:0!important;padding:0!important;box-shadow:none!important}',
 '#viewport.ndv-backrooms97 .mobile-controls:not(.hidden){z-index:30}'
].join('\n');
document.head.appendChild(style97);
function hash97(x,y,n=0){let h=((x+7)*127.1+(y+29)*311.7+n*71.8);return (Math.sin(h)*43758.5453)%1;}
function r97(x,y,n=0){return Math.abs(hash97(x,y,n));}
function floor97(tx,ty){return !!ROOMS97[ty]&&ROOMS97[ty][tx]==='.';}
function can97(x,y,r=12){
 return floor97(Math.floor((x-r)/TILE97),Math.floor((y-r)/TILE97)) &&
 floor97(Math.floor((x+r)/TILE97),Math.floor((y-r)/TILE97)) &&
 floor97(Math.floor((x-r)/TILE97),Math.floor((y+r)/TILE97)) &&
 floor97(Math.floor((x+r)/TILE97),Math.floor((y+r)/TILE97));
}
function muteOther97(){
 if(!audioCtx)return;
 for(const bus of [limCalmBus,limTenseBus,ambientGain,scene2PianoBus,scene3PianoBus]){
  if(bus?.gain)bus.gain.setTargetAtTime(0,audioCtx.currentTime,.04);
 }
}
function stopHum97(){
 if(!brAudio97)return;
 const {gain,ctx}=brAudio97;
 try{gain.gain.cancelScheduledValues(ctx.currentTime);gain.gain.setTargetAtTime(.00001,ctx.currentTime,.04);}catch(_){}
 for(const o of osc97)try{o.stop(ctx.currentTime+.12)}catch(_){}
 osc97=[];brAudio97=null;
}
function startHum97(){
 if(!active97||!audioOn||!audioCtx||audioCtx.state!=='running'||brAudio97)return;
 const ctx=audioCtx,gain=ctx.createGain(),filter=ctx.createBiquadFilter();
 gain.gain.value=.00001;gain.gain.setTargetAtTime(.045,ctx.currentTime,.3);
 filter.type='lowpass';filter.frequency.value=1250;filter.Q.value=.8;
 gain.connect(filter);filter.connect(ctx.destination);
 for(const [freq,kind,level] of [[59.6,'sawtooth',.42],[119.4,'triangle',.24],[238.9,'sawtooth',.06]]){
  const o=ctx.createOscillator(),g0=ctx.createGain();
  o.type=kind;o.frequency.value=freq;g0.gain.value=level;
  o.connect(g0);g0.connect(gain);o.start();osc97.push(o);
 }
 brAudio97={ctx,gain};
}
function zap97(){
 if(!audioOn||!audioCtx||audioCtx.state!=='running')return;
 const ctx=audioCtx,o=ctx.createOscillator(),f=ctx.createBiquadFilter(),v=ctx.createGain(),t=ctx.currentTime;
 o.type='sawtooth';o.frequency.setValueAtTime(350+Math.random()*140,t);
 o.frequency.exponentialRampToValueAtTime(70,t+.13);
 f.type='bandpass';f.frequency.value=740;f.Q.value=.5;
 v.gain.setValueAtTime(.0001,t);v.gain.exponentialRampToValueAtTime(.009,t+.009);
 v.gain.exponentialRampToValueAtTime(.0001,t+.18);
 o.connect(f);f.connect(v);v.connect(ctx.destination);o.start(t);o.stop(t+.2);sounds97++;
}
function walkIn97(){
 active97=true;finished97=false;encounter97=false;armed97=false;
 fade97=0;walk97=0;phase97=0;blink97=0;lastZap97=gameTime+3;
 player={...player,x:start97.x,y:start97.y,dir:'up',vx:0,vy:0,step:0,moving:false,sprinting:false,lean:0,moveBlend:0};
 camera={x:0,y:HEIGHT97-H};
 toastExpire=0;document.getElementById('toast').classList.add('hidden');
 vp97.classList.add('ndv-backrooms97');setState('play');muteOther97();startHum97();
}
function update97(dt){
 gameTime+=dt;walk97+=dt;
 muteOther97();
 if(!audioOn)stopHum97();else startHum97();
 if(brAudio97){
  const tg=state==='pause'?.014:.045;
  brAudio97.gain.gain.setTargetAtTime(tg*(1+.05*Math.sin(walk97*16)),audioCtx.currentTime,.09);
 }
 if(gameTime>lastZap97 && state==='play'&&!encounter97){
  zap97();lastZap97=gameTime+2.8+Math.random()*5;
 }
 if(encounter97){
  fade97=Math.min(1,fade97+dt/1.55);
  if(fade97>=1&&!finished97){
   finished97=true;stopHum97();heldKeys.clear();player.vx=0;player.vy=0;
   setState('backrooms-end');
  }
  return;
 }
 if(state!=='play')return;
 let dx=Number(heldKeys.has('d')||heldKeys.has('arrowright'))-Number(heldKeys.has('a')||heldKeys.has('arrowleft'));
 let dy=Number(heldKeys.has('s')||heldKeys.has('arrowdown'))-Number(heldKeys.has('w')||heldKeys.has('arrowup'));
 const norm=Math.hypot(dx,dy);
 if(norm){dx/=norm;dy/=norm;player.dir=Math.abs(dx)>Math.abs(dy)?(dx>0?'right':'left'):(dy>0?'down':'up');}
 player.sprinting=norm>0&&heldKeys.has('shift');
 const speed=player.sprinting?218:147,blend=1-Math.exp(-dt*(norm?12:19));
 player.vx=(player.vx||0)+(dx*speed-(player.vx||0))*blend;
 player.vy=(player.vy||0)+(dy*speed-(player.vy||0))*blend;
 if(Math.abs(player.vx)<.1)player.vx=0;
 if(Math.abs(player.vy)<.1)player.vy=0;
 const px=player.x,py=player.y;
 if(can97(player.x+player.vx*dt,player.y))player.x+=player.vx*dt;else player.vx=0;
 if(can97(player.x,player.y+player.vy*dt))player.y+=player.vy*dt;else player.vy=0;
 const distance=Math.hypot(player.x-px,player.y-py);
 player.moving=distance>.06;player.step+=distance/18;
 if(Math.floor(player.step)>Math.floor(player.step-distance/18)&&audioOn&&distance>.05 && sounds97<9999){
  // Pequeno som abafado sobre carpete; não reutiliza passos pétreos de Limiante.
  if(audioCtx&&audioCtx.state==='running'&&Math.floor(player.step)%2===0){
   const ctx=audioCtx,osc=ctx.createOscillator(),v=ctx.createGain(),t=ctx.currentTime;
   osc.type='triangle';osc.frequency.value=72;v.gain.setValueAtTime(.0001,t);
   v.gain.linearRampToValueAtTime(.005,t+.013);v.gain.exponentialRampToValueAtTime(.0001,t+.1);
   osc.connect(v);v.connect(ctx.destination);osc.start(t);osc.stop(t+.12);
  }
 }
 camera.x=clamp(player.x-W/2,0,WIDTH97-W);
 camera.y=clamp(player.y-H/2,0,HEIGHT97-H);
 if(Math.hypot(player.x-figure97.x,player.y-figure97.y)<69){
  encounter97=true;phase97=walk97;heldKeys.clear();
  player.vx=0;player.vy=0;player.moving=false;player.sprinting=false;
  lastZap97=Infinity;zap97();
 }
}
function render97(){
 g.save();g.clearRect(0,0,W,H);
 g.fillStyle='#47432e';g.fillRect(0,0,W,H);
 const minX=Math.max(0,Math.floor(camera.x/TILE97)-1),maxX=Math.min(24,Math.ceil((camera.x+W)/TILE97)+1);
 const minY=Math.max(0,Math.floor(camera.y/TILE97)-1),maxY=Math.min(15,Math.ceil((camera.y+H)/TILE97)+1);
 for(let y=minY;y<=maxY;y++)for(let x=minX;x<=maxX;x++){
  const xx=Math.floor(x*TILE97-camera.x),yy=Math.floor(y*TILE97-camera.y),fl=floor97(x,y);
  if(fl){
   const n=r97(x,y);
   g.fillStyle=n>.72?'#726943':n>.38?'#77704b':'#6d6848';
   g.fillRect(xx,yy,65,65);
   // Carpete úmido, padrão orgânico de baixa frequência, sem ladrilho brilhante.
   g.fillStyle='rgba(42,38,24,.13)';
   for(let k=0;k<9;k++){
    const a=r97(x,y,k+30),b=r97(x,y,k+80);
    g.fillRect(xx+Math.floor(a*63),yy+Math.floor(b*63),2+Math.floor(a*7),1);
   }
   g.strokeStyle='rgba(38,35,25,.12)';g.strokeRect(xx+.5,yy+.5,63,63);
   if((x*3+y*7)%11===0){
    g.fillStyle='rgba(234,225,153,.07)';g.fillRect(xx+7,yy+7,50,50);
   }
  }else{
   g.fillStyle='#a39b5e';g.fillRect(xx,yy,65,65);
   const pattern=r97(x,y);
   g.fillStyle=pattern>.5?'rgba(129,123,70,.23)':'rgba(202,191,126,.11)';
   g.fillRect(xx+9,yy,3,65);g.fillRect(xx+43,yy,2,65);
   g.fillStyle='rgba(68,60,31,.16)';
   for(let j=0;j<3;j++)g.fillRect(xx,yy+j*23+2,64,1);
   if(floor97(x,y+1)){
    g.fillStyle='#5b5033';g.fillRect(xx,yy+57,64,7);
    g.fillStyle='#c1b579';g.fillRect(xx,yy+54,64,3);
    g.fillStyle='rgba(24,22,15,.36)';g.fillRect(xx,yy+64,64,9);
   }
  }
 }
 // Fluorescentes artificiais repetidas: clima de level 0, com falhas irregulares.
 const lampOn=!(Math.sin(gameTime*1.45)> .985||Math.sin(gameTime*7.07)> .991);
 for(let y=minY;y<=maxY;y++)for(let x=minX;x<=maxX;x++){
  if(!floor97(x,y)||(x*2+y*3)%12!==0)continue;
  let xx=x*TILE97-camera.x+32,yy=y*TILE97-camera.y+30;
  g.fillStyle=lampOn?'rgba(246,252,191,.25)':'rgba(28,27,18,.17)';
  g.beginPath();g.ellipse(xx,yy,102,74,0,0,Math.PI*2);g.fill();
  g.fillStyle=lampOn?'#d9dab2':'#78775c';g.fillRect(xx-18,yy-4,36,8);
  g.fillStyle=lampOn?'#f0f4ce':'#9d9b79';g.fillRect(xx-14,yy-2,28,3);
 }
 // Silhueta aguardando token definitivo, imóvel e sem diálogo.
 const fx=figure97.x-camera.x,fy=figure97.y-camera.y;
 g.fillStyle='rgba(22,20,17,.34)';
 g.beginPath();g.ellipse(fx,fy+13,24,8,0,0,Math.PI*2);g.fill();
 g.fillStyle='#22221a';
 g.beginPath();g.arc(fx,fy-34,13,0,Math.PI*2);g.fill();
 g.fillRect(fx-14,fy-23,28,38);
 g.fillRect(fx-12,fy+12,9,19);g.fillRect(fx+3,fy+12,9,19);
 g.fillRect(fx-20,fy-21,7,35);g.fillRect(fx+13,fy-21,7,35);
 g.fillStyle='#99926c';g.fillRect(fx-1,fy-25,2,5);
 // Pietro: reutiliza o sprite atual, inclusive o conjunto de corrida aprovado.
 try{drawAnimatedP(player.x,player.y,56,player.dir,0);}
 catch(_){g.fillStyle='#391d29';g.fillRect(player.x-camera.x-10,player.y-camera.y-28,20,29);}
 // Vinheta opressiva e faixas de cintilação.
 const grd=g.createRadialGradient(W/2,H/2,100,W/2,H/2,630);
 grd.addColorStop(0,'rgba(31,25,18,0)');grd.addColorStop(1,'rgba(9,8,6,.86)');
 g.fillStyle=grd;g.fillRect(0,0,W,H);
 if(!lampOn){g.fillStyle='rgba(4,4,3,.34)';g.fillRect(0,0,W,H);}
 const fl=.025+.012*Math.sin(gameTime*39);
 g.fillStyle='rgba(247,235,158,'+fl+')';
 for(let i=0;i<8;i++)g.fillRect(0,((i*103+gameTime*11)%H)|0,W,1);
 if(encounter97){
  g.fillStyle='rgba(0,0,0,'+fade97+')';g.fillRect(0,0,W,H);
 }
 g.restore();
}
const prevCheck97=checkCode,prevEnd97=endGame,prevRender97=render,prevUpdate97=update,prevRetry97=retry;
const enter1=enterScene1,enter2=enterScene2,enter3=enterScene3;
enterScene1=function(...args){enteredAnyMemory97=true;armed97=false;return enter1(...args);};
enterScene2=function(...args){enteredAnyMemory97=true;armed97=false;return enter2(...args);};
enterScene3=function(...args){enteredAnyMemory97=true;armed97=false;return enter3(...args);};
checkCode=function(...args){
 if(state==='keypad'&&inputCode.length===3&&inputCode+'4'===CONFIG.password){
  armed97=!enteredAnyMemory97;
 }
 return prevCheck97(...args);
};
endGame=function(...args){
 if(active97)return;
 if(state==='play'&&armed97&&!enteredAnyMemory97){walkIn97();return;}
 return prevEnd97(...args);
};
render=function(...args){if(active97)return render97();return prevRender97(...args);};
update=function(dt){
 if(active97)return update97(dt);
 return prevUpdate97(dt);
};
retry=function(full=false){
 if(active97&&finished97)return;
 if(active97){stopHum97();active97=false;encounter97=false;finished97=false;vp97.classList.remove('ndv-backrooms97');}
 if(full){enteredAnyMemory97=false;armed97=false;}
 return prevRetry97(full);
};
const prevInv97=inventory,prevMap97=showMap,prevInteract97=interact;
inventory=function(...args){if(active97)return;return prevInv97(...args);};
showMap=function(...args){if(active97)return;return prevMap97(...args);};
interact=function(...args){if(active97)return;return prevInteract97(...args);};
window.__backrooms97={
 status:()=>({enteredAnyMemory:enteredAnyMemory97,armed:armed97,active:active97,finished:finished97,
  encountered:encounter97,gameState:state,playerX:player.x,playerY:player.y,
  password:CONFIG.password,figureReady:false,humActive:!!brAudio97,mapWidth:WIDTH97,mapHeight:HEIGHT97,
  normalEndingPreserved:typeof prevEnd97==='function'}),
 // Métodos sem botão público: utilizados somente pelo teste automatizado.
 debug:{enter:walkIn97,reset:()=>retry(true),visit:()=>{enteredAnyMemory97=true;armed97=false;},
  arm:()=>{armed97=!enteredAnyMemory97;}}
};
})();