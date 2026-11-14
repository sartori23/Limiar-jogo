/* TESTE 88 — somente escala das costas e recortes da corrida frontal.
 * Mantém todos os controles/físicas do Teste 87; mesmo tamanho em
 * Limiante, Céu Dourado, Cena Incompleta e Biblioteca.
 */
(()=>{
  'use strict';
  const root=new URL('./',document.currentScript?.src||location.href);
  const previous=drawAnimatedP;
  const correctedNames={
    idle_up:'p88_idle_up.webp',
    walk_up:'p88_walk_up.webp',
    run_down:'p88_run_down.webp'
  };
  const counts={idle:4,walk:8,run:8};
  const images={},buffers={},errors=[];
  for(const [key,file] of Object.entries(correctedNames)){
    const image=new Image();
    image.decoding='async';
    image.src=new URL(file,root).href;
    image.addEventListener('error',()=>errors.push(key));
    images[key]=image;
  }
  let correctedDraws=0,lastKey='',lastIndex=-1,lastSize=0;
  function ready(key){
    const im=images[key];
    return !!(im&&im.complete&&im.naturalWidth===256*counts[key.split('_')[0]]&&
       im.naturalHeight===256);
  }
  function alphaBounds(canvas){
    const data=canvas.getContext('2d',{willReadFrequently:true}).getImageData(0,0,256,256).data;
    let x1=256,x2=0,y1=256,y2=0,nontransparent=0;
    for(let y=0;y<256;y++)for(let x=0;x<256;x++){
      if(data[(y*256+x)*4+3]<12)continue;
      x1=Math.min(x1,x);x2=Math.max(x2,x+1);
      y1=Math.min(y1,y);y2=Math.max(y2,y+1);
      nontransparent++;
    }
    return nontransparent?[x1,y1,x2,y2]:null;
  }
  function frame(key,index){
    const sprite=images[key],mode=key.split('_')[0];
    const count=counts[mode];
    if(!ready(key))return null;
    const idx=((index%count)+count)%count;
    const id=key+'_'+idx;
    if(buffers[id])return buffers[id];
    const raw=document.createElement('canvas');
    raw.width=raw.height=256;
    const rawCtx=raw.getContext('2d',{alpha:true});
    rawCtx.imageSmoothingEnabled=false;
    rawCtx.clearRect(0,0,256,256);
    rawCtx.drawImage(sprite,idx*256,0,256,256,0,0,256,256);
    const box=alphaBounds(raw);
    if(!box)return null;
    // O decodificador de alguns navegadores entrega quadros com margens
    // distintas. Normalizamos o CONTEÚDO VISÍVEL no Canvas já carregado.
    const targetTop=key==='run_down'?20:22,targetBottom=233;
    const targetHeight=targetBottom-targetTop;
    const originalWidth=box[2]-box[0],originalHeight=box[3]-box[1];
    const targetWidth=key==='run_down'
      ?Math.min(126,Math.max(108,Math.round(originalWidth*targetHeight/originalHeight)))
      :96;
    const canvas=document.createElement('canvas');
    canvas.width=canvas.height=256;
    const ctx=canvas.getContext('2d',{alpha:true});
    ctx.imageSmoothingEnabled=false;
    ctx.clearRect(0,0,256,256);
    ctx.drawImage(raw,box[0],box[1],originalWidth,originalHeight,
      Math.round(128-targetWidth/2),targetTop,targetWidth,targetHeight);
    buffers[id]=canvas;
    return canvas;
  }
  drawAnimatedP=function(x,y,size,dir,bob=0){
    const state87=window.__teste87?.status?.();
    if(!state87){return previous(x,y,size,dir,bob);}
    const chosen=state87.frame||{};
    const source=chosen.source;
    const facing=state87.facing;
    const key=source+'_'+facing;
    if(!Object.prototype.hasOwnProperty.call(correctedNames,key)){
      return previous(x,y,size,dir,bob);
    }
    const idx=Number.isFinite(chosen.index)?chosen.index:0;
    const img=frame(key,idx);
    if(!img)return previous(x,y,size,dir,bob);
    const px=tx(x),py=ty(y);
    if(!Number.isFinite(px)||!Number.isFinite(py)||!Number.isFinite(size))return;
    // Mesmo tamanho e apoio em todos os mapas; o WebP já foi normalizado.
    g.save();
    g.globalCompositeOperation='source-over';
    g.globalAlpha=1;
    g.filter='none';
    g.imageSmoothingEnabled=false;
    g.translate(Math.round(px),Math.round(py));
    g.drawImage(img,-size/2,-size*.90,size,size);
    g.restore();
    correctedDraws++;
    lastKey=key;lastIndex=idx;lastSize=size;
  };
  window.__teste88={
    status:()=>({
      version:88,correctedDraws,lastKey,lastIndex,lastSize,
      loaded:Object.fromEntries(Object.keys(correctedNames).map(k=>[k,ready(k)])),
      errors:[...errors],oldControllerPreserved:!!window.__teste87,
      sameSizeAllMaps:true
    }),
    inspect:(mode,facing,index)=>{
      const key=mode+'_'+facing;
      const sprite=frame(key,index);
      if(!sprite)return {key,ready:false};
      const d=sprite.getContext('2d').getImageData(0,0,256,256).data;
      let x1=256,x2=0,y1=256,y2=0,nontransparent=0;
      for(let y=0;y<256;y++)for(let x=0;x<256;x++){
        if(d[(y*256+x)*4+3]<12)continue;
        x1=Math.min(x1,x);x2=Math.max(x2,x+1);
        y1=Math.min(y1,y);y2=Math.max(y2,y+1);
        nontransparent++;
      }
      return {key,ready:true,bbox:[x1,y1,x2,y2],nontransparent};
    }
  };
})();
