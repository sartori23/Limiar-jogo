/* TESTE 82 — Transições das memórias e continuidade dos diálogos.
 * Preserva a cena de Samael e a entrada aprovada de Lumini do Teste 79.
 */
(()=>{
  'use strict';
  const oldRender=render;
  let fadeAt=-100,fadeColor='#000',fadeCount=0,lastMemory=null;
  const colors={ceu:'#271b27',cena:'#24110f',biblioteca:'#121019',limiante:'#05050a'};
  function startFade(color){
    fadeAt=gameTime;fadeColor=colors[color]||colors.limiante;fadeCount++;
    // Avisos de uma cena não continuam por cima da cena seguinte.
    toastExpire=0;$('toast').classList.add('hidden');
  }
  function transition(enterName,old,color){
    return function(...args){
      const before=state;
      const result=old(...args);
      // Os diálogos/cutscenes originais continuam responsáveis pela progressão.
      if(state==='play'||state===before)startFade(color);
      return result;
    };
  }
  const enter1=enterScene1,leave1=exitScene1,
        enter2=enterScene2,leave2=exitScene2,
        enter3=enterScene3,leave3=exitScene3;
  enterScene1=transition('ceu',enter1,'ceu');
  exitScene1=transition('limiante',leave1,'limiante');
  enterScene2=transition('cena',enter2,'cena');
  exitScene2=transition('limiante',leave2,'limiante');
  enterScene3=transition('biblioteca',enter3,'biblioteca');
  exitScene3=transition('limiante',leave3,'limiante');
  render=function(){
    const result=oldRender();
    if(state==='glitch'||state==='death'||state==='final-end'||state==='final-credits')return result;
    const t=gameTime-fadeAt;
    if(t>=0&&t<1.32){
      const x=Math.max(0,Math.min(1,t/1.32));
      const ease=x*x*(3-2*x);
      const a=(1-ease)*.91;
      g.save();g.globalCompositeOperation='source-over';
      g.fillStyle='rgba(0,0,0,'+a*.6+')';g.fillRect(0,0,W,H);
      g.globalAlpha=a*.7;g.fillStyle=fadeColor;
      g.fillRect(0,0,W,H);g.restore();
    }
    return result;
  };
  const oldRetry=retry;
  retry=function(all){fadeAt=-100;lastMemory=null;return oldRetry(all);};
  window.__teste82={
    status:()=>({fadeCount,fadeActive:gameTime-fadeAt<1.32,
      namesAfterLumini:typeof scene1DisplayName==='function'&&
        typeof scene2DisplayName==='function'&&typeof scene3DisplayName==='function',
      originalSamaelPreserved:typeof startSecretGlitch==='function',
      originalLuminiPreserved:typeof window.__teste79==='object'})
  };
})();