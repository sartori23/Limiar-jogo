/* Teste 73 — Priantes animados a partir do GIF aprovado pelo criador.
 * O atlas contém os quatro quadros únicos do GIF (12 quadros em pingue-pongue
 * na mesma ordem do teste), com transparência e tamanho otimizado.
 * Não altera a IA, colisões, som, spawn ou velocidade dos Priantes.
 */
(()=>{
  'use strict';
  const atlas=new Image();
  const sourceScript=document.currentScript?.src||location.href;
  atlas.src=new URL('priante73.webp',sourceScript).href;
  const previous=drawPrianteArachnid;
  const sequence=[0,1,2,3,2,1,0,3,2,1,0,1];
  let loaded=false;
  atlas.addEventListener('load',()=>{loaded=atlas.naturalWidth===320&&atlas.naturalHeight===83;});
  atlas.addEventListener('error',()=>{loaded=false;});
  drawPrianteArachnid=function(o,eyeLights){
    if(!loaded){return previous(o,eyeLights);}
    const x=tx(o.x),y=ty(o.y);
    const movement=Math.min(1,Math.max(0,(o.motion||0)/240));
    const phase=gameTime*(movement>.12?9.2:5.9)+((o.seed||0)%100)*.73;
    const k=Math.floor(phase)%12;
    const idx=sequence[(k+12)%12];
    // Inclui o balanço e a alternância dos membros já desenhados nos frames.
    // A posição original do monstro e seu alcance permanecem intocados.
    const jitterX=Math.sin(gameTime*9.5+(o.seed||0))*.75;
    const jitterY=Math.sin(gameTime*12.4+(o.seed||0))*(movement>.08?2.2:.9);
    const lean=Math.sin(gameTime*2.1+(o.seed||0))*.025 + Math.min(.025,Math.max(-.025,(o.vxVisual||0)/1400));
    const lift= o.burst>0?-3.5:0;
    const flipped=(o.dx||0)>0;
    g.save();
    g.fillStyle='rgba(4,1,7,.5)';
    g.beginPath();g.ellipse(x,y-3,28,7,0,0,Math.PI*2);g.fill();
    g.translate(x+jitterX,y+jitterY+lift);
    g.rotate(lean);
    if(flipped)g.scale(-1,1);
    g.imageSmoothingEnabled=false;
    g.drawImage(atlas,idx*80,0,80,83,-60,-109,120,112);
    g.restore();
    // As luzes vermelhas continuam respondendo à função de iluminação existente.
    const pulse=1+Math.sin(gameTime*10+(o.seed||0))*.12;
    eyeLights.push({x:x+jitterX-6,y:y+jitterY-38,w:1.02*pulse,seed:o.seed||0});
    eyeLights.push({x:x+jitterX+7,y:y+jitterY-37,w:.83*pulse,seed:o.seed||0});
  };
  window.__prianteTest73={
    status:()=>({atlasLoaded:loaded,width:atlas.naturalWidth,height:atlas.naturalHeight,frames:12,source:'GIF aprovado pelos usuários',originalFallback:!loaded}),
    image:atlas
  };
})();