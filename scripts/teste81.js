/* TESTE 81 — Consistencia de colisao, cameras e bordas dos tres cenarios. */
(()=>{
 'use strict';
 const oldCanOccupy=canOccupy;
 const oldTryMove=tryMove;
 let correctedEdges=0,substeps=0;
 canOccupy=function(x,y,r=9,monster=false){
   if(!Number.isFinite(x)||!Number.isFinite(y)||!Number.isFinite(r))return false;
   if(!oldCanOccupy(x,y,r,monster))return false;
   // Os quatro cantos isolados deixavam passar por quinas e cavidades.
   if(!isWalkable(x,y,monster))return false;
   for(const [ox,oy] of [[-r,0],[r,0],[0,-r],[0,r]]){
     if(!isWalkable(x+ox,y+oy,monster)){correctedEdges++;return false;}
   }
   return true;
 };
 tryMove=function(obj,dx,dy,r=9,monster=false){
   if(!obj||!Number.isFinite(obj.x)||!Number.isFinite(obj.y)||
      !Number.isFinite(dx)||!Number.isFinite(dy))return false;
   // Passos curtos impedem pular quinas com dt variavel no navegador.
   const chunks=Math.max(1,Math.ceil(Math.max(Math.abs(dx),Math.abs(dy))/3.6));
   const stepX=dx/chunks,stepY=dy/chunks;
   let moved=false;
   for(let i=0;i<chunks;i++){
     // Deixa P escorregar no eixo livre junto aos obstaculos.
     moved=oldTryMove(obj,stepX,stepY,r,monster)||moved;
     substeps++;
   }
   return moved;
 };
 // As memorias preservam seus mapas. Apenas acabamos a borda da camera
 // com uma penumbra sutil e consistente, sem esconder pistas ou personagens.
 function vignette(outerColor,opacity){
   g.save();g.globalCompositeOperation='source-over';g.globalAlpha=opacity;
   const radius=Math.hypot(W,H)*.68;
   const gr=g.createRadialGradient(W/2,H/2,Math.min(W,H)*.27,W/2,H/2,radius);
   gr.addColorStop(0,'rgba(0,0,0,0)');
   gr.addColorStop(.67,'rgba(0,0,0,.04)');
   gr.addColorStop(1,outerColor);
   g.fillStyle=gr;g.fillRect(0,0,W,H);g.restore();
 }
 const oldR1=renderScene1,oldR2=renderScene2,oldR3=renderScene3;
 renderScene1=function(){oldR1();if(state!=='glitch')vignette('rgba(26,17,28,.52)',.27);};
 renderScene2=function(){oldR2();vignette('rgba(20,8,12,.66)',.24);};
 renderScene3=function(){oldR3();vignette('rgba(8,7,14,.72)',.24);};
 const oldRetry=retry;
 retry=function(all){correctedEdges=0;substeps=0;return oldRetry(all);};
 window.__teste81={status:()=>({collisionChecks:true,correctedEdges,substeps,sceneVignette:true})};
})();