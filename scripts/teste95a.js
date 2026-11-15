/* TESTE 95 — ETAPA A
 * As quatro corridas aprovadas são agora ARQUIVOS REAIS DO GITHUB.
 * Não dependem de launcher, IndexedDB, YouTube ou iframe.
 * Centralização horizontal feita no build; aqui só renderizamos os
 * 8 quadros aprovados de cada direção (sem recorte dinâmico de membros).
 */
(()=>{
 'use strict';
 const ROOT=new URL('./',document.currentScript?.src||location.href);
 const dirList=['down','up','left','right'];
 const imgs={},ready={},loadErrors=[];
 const fallback=drawAnimatedP;
 let draws=0,fallbackDraws=0,lastFrame=null;
 for(const d of dirList){
   const img=new Image();
   img.decoding='async';
   img.src=new URL('p95_run_'+d+'.webp',ROOT).href;
   img.onload=()=>{
     if(img.naturalWidth!==2048||img.naturalHeight!==256){
       loadErrors.push('dimensões incorretas: '+d);
       return;
     }
     ready[d]=true;
   };
   img.onerror=()=>loadErrors.push('arquivo não carregou: '+d);
   imgs[d]=img;ready[d]=false;
 }
 function draw(x,y,size,dir,bob=0){
   const status=window.__teste87?.status?.();
   if(!status || status.frame?.source!=='run'){
     return fallback(x,y,size,dir,bob);
   }
   const facing=dirList.includes(status.facing)?status.facing:
     (dirList.includes(dir)?dir:'down');
   const img=imgs[facing];
   if(!ready[facing]||!img?.complete){
     fallbackDraws++;
     return fallback(x,y,size,dir,bob);
   }
   const frame=((status.frame.index||0)%8+8)%8;
   const px=tx(x),py=ty(y);
   if(!Number.isFinite(px)||!Number.isFinite(py))return;
   // Mesma ancoragem em todos os mapas; sem deslocamento de offsets legados.
   const xx=Math.round(px-size*.5);
   const yy=Math.round(py-size*.90);
   g.save();
   g.globalCompositeOperation='source-over';
   g.globalAlpha=1;
   g.filter='none';
   g.imageSmoothingEnabled=false;
   g.drawImage(img,frame*256,0,256,256,xx,yy,size,size);
   g.restore();
   draws++;
   lastFrame={facing,frame,size,mode:status.mode};
 }
 drawAnimatedP=draw;
 window.__teste95A={
   status:()=>({version:'95-A',ready:{...ready},errors:[...loadErrors],
     draws,fallbackDraws,lastFrame,legacyOffsetsUsed:false,
     spritesServedFromGitHub:true})
 };
})();
