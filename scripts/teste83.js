/* TESTE 83 — Mixagem coerente, efeitos pontuais e epílogo sem sobreposição sonora.
 * Não inclui Spare Hearts sem licença; mantém Penumbra nos créditos.
 */
(()=>{
  'use strict';
  const music=window.__soundtrackTest72;
  const normal={menu:.26,limiante:.29,priantes:.34,ceu:.37,cena:.34,
    biblioteca:.33,lumini:.30,perseguicao:.89,creditos:.49};
  let duck=1,throttledSteps=0,lastStepAt=-100,lastTextAt=-100;
  const oldPlaySound=playSound;
  playSound=function(kind){
    // Passadas sincronizadas sem disparar muitos estalos a cada frame.
    if(kind==='step'){
      if(gameTime-lastStepAt<.14){throttledSteps++;return;}
      lastStepAt=gameTime;
    }else if(kind==='text'){
      if(gameTime-lastTextAt<.043)return;
      lastTextAt=gameTime;
    }
    return oldPlaySound(kind);
  };
  const oldUpdate=update;
  update=function(dt){
    const result=oldUpdate(dt);
    if(music&&music.tracks){
      const activeDialogue=state==='dialog'||state==='scene2-actions'||state==='scene3-actions';
      const final=window.__finaleTest71?.state();
      const chasing=final?.active&&(final.phase==='chase'||final.phase==='fear');
      const goal=chasing?1:(activeDialogue?.64:1);
      duck+=(goal-duck)*Math.min(1,Math.max(0,dt)*4.8);
      for(const [key,base] of Object.entries(normal)){
        const tr=music.tracks[key];
        if(!tr)continue;
        tr.gain=base*(key==='perseguicao'||key==='creditos'?1:duck);
        if(key==='menu'&&state==='pause')tr.gain*=.48;
      }
    }
    return result;
  };
  const oldRetry=retry;
  retry=function(all){
    duck=1;lastStepAt=-100;lastTextAt=-100;throttledSteps=0;
    return oldRetry(all);
  };
  window.__teste83={status:()=>({
    mixReady:!!music?.tracks,duck:Math.round(duck*100)/100,
    chaseMusic:normal.perseguicao,creditsMusic:'Penumbra (licenciada)',
    silentFinalSentence:state==='final-end',throttledSteps
  })};
})();