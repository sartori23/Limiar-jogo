/* TESTE 87 — revisão e integração definitiva dos sprites aprovados de Pietro.
 * Mantém os 12 atlas originais (parado/andar/correr × 4 direções).
 * Corrige ancoragem dos pés, direção pelo deslocamento real e transição
 * andar↔correr↔parar. NÃO modifica física, inimigos, roteiros ou músicas.
 */
(()=>{
  'use strict';
  const base=new URL('./',document.currentScript?.src||location.href);
  const FRAMES={idle:4,walk:8,run:8};
  const DIRS=['down','up','left','right'];
  const images={},frameCache={},loadError=[];
  for(const mode of Object.keys(FRAMES)){
    for(const direction of DIRS){
      const key=mode+'_'+direction,img=new Image();
      img.decoding='async';
      img.src=new URL('p87_'+key+'.webp',base).href;
      img.addEventListener('error',()=>{
        if(!loadError.includes(key))loadError.push(key);
      });
      images[key]=img;
    }
  }
  const oldUpdate=update;
  const oldAnimatedP=drawAnimatedP;
  const oldScene1=drawScene1Avatar;
  const oldRetry=retry;
  const OFFSETS=window.__P87_OFFSETS||{};
  let currentPlayer=player;
  let facing=player?.dir||'down';
  let mode='idle',stepPhase=0,drawCount=0,lastStepAt=0;
  let stopBegin=-100,stopStart=0,stopTarget=0,stopKind='walk';
  let directionSwitches=0,blockedFrames=0,drawnSprite=null;
  function wrap(i,n){return ((i%n)+n)%n;}
  function easing(x){const v=Math.max(0,Math.min(1,x));return v*v*(3-2*v);}
  function reset(){
    currentPlayer=player;
    facing=DIRS.includes(player?.dir)?player.dir:'down';
    mode='idle';stepPhase=0;lastStepAt=gameTime;
    stopBegin=-100;stopStart=0;stopTarget=0;
    blockedFrames=0;drawnSprite=null;
  }
  function directionOf(dx,dy){
    const ax=Math.abs(dx),ay=Math.abs(dy),factor=1.17;
    if(ax<.03&&ay<.03)return facing;
    // Histerese reduz inversões rápidas em diagonais sem ignorar direção real.
    if(facing==='left'||facing==='right'){
      if(ay>ax*factor)return dy>0?'down':'up';
      if(ax>ay*.74)return dx>0?'right':'left';
    }else{
      if(ax>ay*factor)return dx>0?'right':'left';
      if(ay>ax*.74)return dy>0?'down':'up';
    }
    return facing;
  }
  function beginStop(){
    stopKind=mode;
    stopStart=wrap(Math.round(stepPhase),FRAMES[mode]);
    const options=[0,4,8];
    let goal=options[0],diff=1e9;
    for(const candidate of options){
      if(Math.abs(candidate-stopStart)<diff){
        diff=Math.abs(candidate-stopStart);goal=candidate;
      }
    }
    stopTarget=goal;
    stopBegin=gameTime;
    mode='stopping';
  }
  update=function(dt){
    const before=player;
    const ax=before?.x??0,ay=before?.y??0;
    const result=oldUpdate(dt);
    if(player!==before||player!==currentPlayer){reset();return result;}
    const dx=player.x-ax,dy=player.y-ay;
    const travel=Math.hypot(dx,dy);
    const actuallyMoved=travel>.075 && travel<46 && Number.isFinite(travel);
    const directionAllowed=(state==='play' || scene1Active||scene2Active||scene3Active);
    if(actuallyMoved&&directionAllowed){
      const direction=directionOf(dx,dy);
      if(direction!==facing){facing=direction;directionSwitches++;}
      player.dir=facing;
      blockedFrames=0;
      const next=player.sprinting?'run':'walk';
      if(mode!==next){
        // Continuidade do pé que já estava apoiado ao trocar de velocidade.
        stepPhase=wrap(stepPhase,8);
        mode=next;
      }
      const stridePixels=mode==='run'?19.5:13.2;
      stepPhase+=travel/stridePixels;
      lastStepAt=gameTime;
    }else if(mode==='walk'||mode==='run'){
      if(travel<=.075)blockedFrames++;
      beginStop();
    }else if(mode==='stopping' && gameTime-stopBegin>=.14){
      mode='idle';
    }
    if(!actuallyMoved && directionAllowed && blockedFrames>=2){
      // Encostou numa parede: preserva direção e para o movimento visual.
      player.dir=facing;
    }
    return result;
  };
  function displayFrame(){
    if(mode==='idle')return {source:'idle',index:wrap(Math.floor(gameTime/0.24),4)};
    if(mode==='stopping'){
      const t=easing((gameTime-stopBegin)/.14);
      const value=Math.round(stopStart+(stopTarget-stopStart)*t);
      return {source:stopKind,index:wrap(value,8)};
    }
    return {source:mode,index:wrap(Math.floor(stepPhase),8)};
  }
  function getPreparedFrame(key,index){
    const sheet=images[key];
    if(!sheet?.complete||sheet.naturalWidth!==FRAMES[key.split('_')[0]]*256)return null;
    const cacheKey=key+'_'+index;
    if(frameCache[cacheKey])return frameCache[cacheKey];
    // A memória 1 apresentava artefatos quando recortava direto do atlas na GPU.
    // Um quadro isolado em canvas evita transparência residual sem redesenhar.
    const buffer=document.createElement('canvas');
    buffer.width=buffer.height=256;
    const ctx=buffer.getContext('2d',{alpha:true});
    ctx.imageSmoothingEnabled=false;
    ctx.clearRect(0,0,256,256);
    ctx.drawImage(sheet,index*256,0,256,256,0,0,256,256);
    frameCache[cacheKey]=buffer;
    return buffer;
  }
  drawAnimatedP=function(x,y,size,dir,bob=0){
    if(!DIRS.includes(facing)){
      facing=DIRS.includes(dir)?dir:'down';
    }
    const selected=displayFrame(),key=selected.source+'_'+facing;
    const frame=getPreparedFrame(key,selected.index);
    if(!frame){return oldAnimatedP(x,y,size,dir,bob);}
    const px=tx(x),py=ty(y);
    if(!Number.isFinite(px)||!Number.isFinite(py))return;
    const [offX,offY]=OFFSETS[key]?.[selected.index]||[0,0];
    const ratio=size/256;
    const lean=(selected.source==='run'&&(facing==='left'||facing==='right'))
        ?Math.max(-.012,Math.min(.012,(player.lean||0)*.24)):0;
    // Quadros já animam botas/cachecol; nada de bob exagerado do código antigo.
    const breathe=selected.source==='idle'?Math.sin(gameTime*1.7)*.09:0;
    g.save();
    g.globalCompositeOperation='source-over';
    g.globalAlpha=1;g.filter='none';g.imageSmoothingEnabled=false;
    g.translate(Math.round(px),Math.round(py+breathe));
    if(lean)g.rotate(lean);
    g.drawImage(frame,-size/2+offX*ratio,-size*.9+offY*ratio,size,size);
    g.restore();
    drawCount++;drawnSprite=key;
  };
  drawScene1Avatar=function(){
    const px=tx(player.x),py=ty(player.y);
    if(!Number.isFinite(px)||!Number.isFinite(py))return oldScene1();
    g.save();
    g.setTransform(1,0,0,1,0,0);
    g.globalCompositeOperation='source-over';g.globalAlpha=1;g.filter='none';
    g.imageSmoothingEnabled=false;
    g.fillStyle='rgba(5,7,16,.43)';
    g.beginPath();g.ellipse(px,py+2,18,5.5,0,0,Math.PI*2);g.fill();
    drawAnimatedP(player.x,player.y,P_RENDER_SIZE,facing,0);
    g.restore();
  };
  retry=function(full){const answer=oldRetry(full);reset();return answer;};
  window.__teste87={
    status:()=>({
      version:87,mode,facing,frame:displayFrame(),
      loaded:Object.fromEntries(Object.entries(images).map(([k,img])=>
        [k,img.complete&&img.naturalWidth===FRAMES[k.split('_')[0]]*256])),
      readyCount:Object.values(images).filter(img=>img.naturalWidth>0).length,
      errors:loadError.slice(),drawCount,drawnSprite,
      directionSwitches,blockedFrames,
      spritesFrom:'Conjunto de 12 atlas aprovados sem redesenho'
    }),
    frames:FRAMES
  };
})();
