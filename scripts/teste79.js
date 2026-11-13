/* Teste 79: Pietro em 3 direcoes, close cinematografico de Lumini. */
(()=>{
 const root=new URL('./',document.currentScript?.src||location.href);
 const pFrames={idle:6,walk:8,run:12},pSheets={};
 for(const mode of Object.keys(pFrames))for(const view of ['front','side','back']){
   const img=new Image();img.src=new URL('p79_'+mode+'_'+view+'.webp',root).href;
   pSheets[mode+'_'+view]=img;
 }
 const oldP=drawAnimatedP;
 let facing='down';
 drawAnimatedP=function(x,y,size,dir,bob=0){
   const mode=player.moving?(player.sprinting?'run':'walk'):'idle';
   const vx=player.vx||0,vy=player.vy||0;
   if(player.moving&&Math.hypot(vx,vy)>12){
     if(Math.abs(vx)>Math.abs(vy)*1.1)facing=vx>0?'right':'left';
     else if(Math.abs(vy)>Math.abs(vx)*1.1)facing=vy>0?'down':'up';
     else facing=dir||facing;
   }else if(dir)facing=dir;
   const view=facing==='up'?'back':(facing==='left'||facing==='right')?'side':'front';
   const sheet=pSheets[mode+'_'+view],count=pFrames[mode];
   if(!sheet?.naturalWidth||sheet.naturalWidth!==count*256){oldP(x,y,size,dir,bob);return;}
   const step=(player.step||0)*(mode==='run'?2.8:2.3);
   const idx=mode==='idle'?Math.floor(gameTime*4.2)%count:Math.floor(step)%count;
   const xx=tx(x),yy=ty(y);
   const stride=mode==='idle'?Math.sin(gameTime*2.0)*.35:Math.sin(step*Math.PI)*.45;
   const lean=player.moving?Math.max(-.027,Math.min(.027,(player.lean||0)*.45)):0;
   g.save();g.translate(Math.round(xx),Math.round(yy+bob+stride));
   g.rotate(lean);if(facing==='left')g.scale(-1,1);
   g.imageSmoothingEnabled=false;
   g.drawImage(sheet,idx*256,0,256,256,-size/2,-size*.90,size,size);
   g.restore();
 };
 const oldStart=startLuminiArrival,oldDraw=drawObject;
 const portrait=new Image();
 portrait.src=window.EMBEDDED_ASSETS?.portrait_mysterious_visitor||window.EMBEDDED_ASSETS?.mysterious_visitor||'';
 const ease=(a,b,t)=>{const q=Math.max(0,Math.min(1,(t-a)/(b-a)));return q*q*(3-2*q);};
 let arrivalTone=false;
 startLuminiArrival=function(){
   if(!chestEventReady||luminiArrivalStarted||luminiArrivalFinished)return;
   arrivalTone=false;oldStart();
   if(audioCtx&&ambientGain&&audioOn)ambientGain.gain.setTargetAtTime(.0001,audioCtx.currentTime,.1);
 };
 luminiEntranceUpdate=function(){
   if(!luminiArrivalStarted||luminiArrivalFinished||state!=='play')return false;
   const t=gameTime-luminiArrivalAt;
   player.vx=0;player.vy=0;player.moving=false;
   const cx=clamp(CHEST_EVENT.x-W/2,0,MW*TILE-W);
   const cy=clamp(CHEST_EVENT.y-70-H/2,0,MH*TILE-H);
   camera.x+=(cx-camera.x)*.115;camera.y+=(cy-camera.y)*.115;
   if(t>3.2&&!arrivalTone){arrivalTone=true;if(audioOn)playSound('clue');}
   if(t<6.7)return true;
   luminiArrivalFinished=true;
   if(audioCtx&&ambientGain&&audioOn)ambientGain.gain.setTargetAtTime(.012,audioCtx.currentTime,.4);
   if(!luminiIntroDone){
     luminiIntroDone=true;
     showDialogue('P',['Hã...? Aquele portal... De onde você saiu?','Você... consegue me ver?'],'p',()=>openLuminiIntroduction());
   }
   return true;
 };
 drawObject=function(o){
   if(o.kind!=='chest-event')return oldDraw(o);
   if(!chestEventReady||!luminiArrivalStarted)return;
   const x=tx(o.x),y=ty(o.y),t=gameTime-luminiArrivalAt;
   const visible=luminiArrivalFinished?1:ease(1.5,4.0,t);
   g.save();
   g.fillStyle='rgba(0,0,0,.45)';g.beginPath();g.ellipse(x,y-3,26,7,0,0,Math.PI*2);g.fill();
   const img=assets.mysterious_visitor;
   if(img?.naturalWidth){g.globalAlpha=visible;g.imageSmoothingEnabled=false;
     g.drawImage(img,x-46,y-130+(luminiArrivalFinished?Math.sin(gameTime)*.7:0),92,130);
   }
   g.restore();
 };
 drawLuminiArrivalEffects=function(){
   if(!(luminiArrivalStarted&&!luminiArrivalFinished&&state==='play'))return;
   const t=gameTime-luminiArrivalAt;
   const x=tx(CHEST_EVENT.x),y=ty(CHEST_EVENT.y-78);
   const dark=Math.max(0,Math.min(.86,.24*ease(0,1,t)+.64*ease(2.2,3.6,t)-.83*ease(5.4,6.6,t)));
   g.save();g.fillStyle='rgba(5,3,10,'+dark+')';g.fillRect(0,0,W,H);
   const spark=ease(.5,1.4,t)*(1-ease(3,3.8,t));
   if(spark>.01){
     const a=g.createRadialGradient(x,y,1,x,y,88);
     a.addColorStop(0,'rgba(254,238,192,'+(.30*spark)+')');
     a.addColorStop(1,'rgba(10,7,21,0)');
     g.fillStyle=a;g.fillRect(x-88,y-88,176,176);
   }
   const close=ease(3.15,4.0,t)*(1-ease(5.15,6.2,t));
   if(close>.01&&portrait.naturalWidth){
     g.globalAlpha=close;g.fillStyle='#05040b';g.fillRect(0,0,W,H);
     const z=250+44*ease(3.7,5.6,t);
     const crop=Math.min(portrait.naturalWidth,portrait.naturalHeight*.84);
     const sy=Math.round(portrait.naturalHeight*.02);
     g.imageSmoothingEnabled=false;
     g.drawImage(portrait,(portrait.naturalWidth-crop)/2,sy,crop,Math.min(crop,portrait.naturalHeight-sy),
       W/2-z/2,H/2-z/2,z,z);
     g.globalAlpha=1;
   }
   g.restore();
 };
 const oldRetry=retry;
 retry=function(all){arrivalTone=false;return oldRetry(all);};
 window.__teste79={status:()=>({direcao:facing,atlasses:Object.fromEntries(Object.entries(pSheets).map(([k,i])=>[k,i.naturalWidth>0])),lumini:luminiArrivalStarted?'aparecendo':'aguardando'})};
})();