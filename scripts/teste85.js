/* TESTE 85 — Pietro, animação refeita parte a parte.
 * 1. Parado: silhueta firme, respiração leve e direção retida.
 * 2. Andar: alternância real entre braços/pernas; quadros por distância.
 * 3. Correr: passada ampliada, ritmo próprio e inclinação moderada.
 * 4. Transições: apoio de pé ao parar, sem patinar em colisões.
 * Não muda física, textos, memórias, Priantes, som ou roteiro.
 */
(()=>{
 'use strict';
 const root=new URL('./',document.currentScript?.src||location.href);
 const modes={idle:6,walk:8,run:12};
 const sheets={};const failures=[];
 for(const mode of Object.keys(modes))for(const view of ['front','side','back']){
   const key=mode+'_'+view;
   const img=new Image();
   img.decoding='async';
   img.src=new URL('p85_'+key+'.webp',root).href;
   img.addEventListener('error',()=>{if(!failures.includes(key))failures.push(key);});
   sheets[key]=img;
 }
 const oldUpdate=update,oldDraw=drawAnimatedP,oldScene1=drawScene1Avatar,oldRetry=retry;
 let actor=player,heading=player.dir||'down';
 let distance=0,phase=0,mode='idle',speed=0;
 let stopTimer=0,stopFrom='walk',stopIndex=0;
 let lastMotion=0,drawCount=0,blockedFrames=0;

 function getDir(dx,dy){
   const ax=Math.abs(dx),ay=Math.abs(dy);
   if(ax<.08&&ay<.08)return heading;
   const hysteresis=1.22;
   if(heading==='up'||heading==='down'){
     if(ax>ay*hysteresis)return dx>0?'right':'left';
     if(ay>ax*.72)return dy>0?'down':'up';
   }else{
     if(ay>ax*hysteresis)return dy>0?'down':'up';
     if(ax>ay*.72)return dx>0?'right':'left';
   }
   return heading;
 }
 function reset(){
   actor=player;heading=player.dir||'down';
   distance=0;phase=0;speed=0;mode='idle';stopTimer=0;lastMotion=0;blockedFrames=0;
 }
 function frameIndexFor(which){
   if(which==='idle')return Math.floor(gameTime*2.2)%modes.idle;
   return Math.floor(phase*modes[which])%modes[which];
 }
 update=function(dt){
   const prior=player;
   const wasX=prior?.x??0,wasY=prior?.y??0;
   const result=oldUpdate(dt);
   if(!player||!Number.isFinite(player.x)||!Number.isFinite(player.y))return result;
   if(player!==actor||player!==prior)reset();
   const movedX=player.x-wasX,movedY=player.y-wasY;
   let d=Math.hypot(movedX,movedY);
   if(!Number.isFinite(d)||d>48)d=0; // mudança de cenário não conta como passada
   if(d>.09){
     const targetDir=getDir(movedX,movedY);
     heading=targetDir;
     player.dir=heading;
     blockedFrames=0;
   }else{
     if(player.moving)blockedFrames++;
     // Preservar a última direção quando encosta na parede.
     if(blockedFrames>1)player.dir=heading;
   }
   const meaningful=state==='play'||state==='waking';
   const actuallyMoving=meaningful&&d>.085;
   const nextMode=actuallyMoving?(player.sprinting?'run':'walk'):'idle';
   const blend=Math.min(1,Math.max(0,dt)*11.0);
   const targetSpeed=actuallyMoving?Math.min(280,d/Math.max(.001,dt)):0;
   speed+=(targetSpeed-speed)*blend;
   if(actuallyMoving){
     distance+=d;
     // Mais lento que os atlas antigos: um ciclo completo dura uma passada dupla.
     const strideLength=nextMode==='run'?152:123;
     phase=(phase+d/strideLength)%1000;
     if(mode!==nextMode){
       // O ciclo continua de modo contínuo ao passar de andar para correr.
       stopTimer=0;
       mode=nextMode;
     }
     lastMotion=gameTime;
   }else if(mode==='walk'||mode==='run'){
     stopFrom=mode;
     stopIndex=frameIndexFor(mode);
     stopTimer=.13;
     mode='stopping';
   }else if(mode==='stopping'){
     stopTimer=Math.max(0,stopTimer-Math.max(0,dt));
     if(stopTimer<=0)mode='idle';
   }
   return result;
 };
 function selectFrame(){
   if(mode==='stopping'){
     const n=modes[stopFrom];
     // Recupera a pose neutra próxima ao contato; pés não deslizam para lá.
     const goal=stopIndex<n/4||stopIndex>n*3/4?0:Math.round(n/2);
     const k=Math.min(1,1-stopTimer/.13);
     let idx=Math.round(stopIndex+(goal-stopIndex)*k);
     if(idx<0)idx+=n;
     return {mode:stopFrom,idx:idx%n};
   }
   const selected=mode==='idle'?'idle':mode;
   return {mode:selected,idx:frameIndexFor(selected)};
 }
 function render(x,y,size,dir,bob=0){
   const f=selectFrame();
   const actualHeading=heading||dir||'down';
   const view=actualHeading==='up'?'back':
       (actualHeading==='left'||actualHeading==='right'?'side':'front');
   const sheet=sheets[f.mode+'_'+view];
   if(!sheet?.complete||sheet.naturalWidth!==256*modes[f.mode]){
     oldDraw(x,y,size,actualHeading,bob);return;
   }
   const px=tx(x),py=ty(y);
   if(!Number.isFinite(px)||!Number.isFinite(py))return;
   const flip=actualHeading==='left';
   const idleRise=f.mode==='idle'?Math.sin(gameTime*1.45)*.20:0;
   const active=(f.mode==='walk'||f.mode==='run');
   // Giro leve do torso ao correr, sem deslocar a sombra nem a ancoragem dos pés.
   const tilt=active && (actualHeading==='left'||actualHeading==='right')
       ?Math.max(-.028,Math.min(.028,(player.lean||0)*.40)):0;
   const wobble=active?Math.sin(phase*Math.PI*2)*.22:0;
   const left=-Math.round(size/2),top=-Math.round(size*.90);
   g.save();
   g.translate(Math.round(px),Math.round(py+bob*.08+idleRise+wobble));
   if(flip)g.scale(-1,1);
   g.rotate(tilt);
   g.globalAlpha=1;g.filter='none';g.imageSmoothingEnabled=false;
   g.drawImage(sheet,f.idx*256,0,256,256,left,top,size,size);
   g.restore();
   drawCount++;
 }
 drawAnimatedP=render;
 drawScene1Avatar=function(){
   const px=tx(player.x),py=ty(player.y);
   if(!Number.isFinite(px)||!Number.isFinite(py))return oldScene1();
   g.save();
   g.globalCompositeOperation='source-over';g.globalAlpha=1;g.filter='none';
   g.fillStyle='rgba(5,7,16,.43)';
   g.beginPath();g.ellipse(px,py+2,17.5,5.5,0,0,Math.PI*2);g.fill();
   drawAnimatedP(player.x,player.y,P_RENDER_SIZE,player.dir,0);
   g.restore();
 };
 retry=function(full){const result=oldRetry(full);reset();return result;};
 window.__teste85={
   status:()=>({mode,heading,phase:Math.round(phase*100)/100,
     speed:Math.round(speed),frame:selectFrame(),drawCount,blockedFrames,
     failures:[...failures],
     atlas:Object.fromEntries(Object.entries(sheets).map(([k,i])=>[k,i.naturalWidth===256*modes[k.split('_')[0]]]))}),
   inspect:(m,d)=>({mode:m,view:d,available:!!sheets[m+'_'+d]?.naturalWidth})
 };
})();