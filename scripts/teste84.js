/* TESTE 84 — Revisão final: evita teclas presas e artefatos gráficos.
 * As melhorias 80–83 permanecem independentes para comparação.
 */
(()=>{
  'use strict';
  const failures=[];
  function record(event){
    const error=event?.error?.message||event?.message||'Erro desconhecido';
    failures.push({at:Math.round(gameTime*10)/10,error:String(error).slice(0,180)});
    if(failures.length>18)failures.shift();
  }
  window.addEventListener('error',record);
  window.addEventListener('unhandledrejection',e=>record({message:e.reason?.message||String(e.reason)}));
  // Ao sair da aba, evita que Pietro continue correndo com a tecla presa.
  const release=()=>{if(typeof heldKeys!=='undefined')heldKeys.clear();};
  window.addEventListener('blur',release);
  document.addEventListener('visibilitychange',()=>{if(document.hidden)release();});
  window.addEventListener('keydown',e=>{
    if(state==='play'&&['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Space'].includes(e.code)){
      e.preventDefault();
    }
  },{passive:false});
  const oldRender=render;
  render=function(){
    // Os estados gráficos de glitches/iluminação não vazam entre memórias.
    g.setTransform(1,0,0,1,0,0);
    g.globalCompositeOperation='source-over';
    g.globalAlpha=1;g.filter='none';
    return oldRender();
  };
  // Diagnóstico só de leitura. Não adiciona controles nem quebra-cabeças.
  window.__teste84={
    status:()=>({
      version:84,state,scene:scene1Active?'ceu':scene2Active?'cena':scene3Active?'biblioteca':'limiante',
      playerFinite:Number.isFinite(player.x)&&Number.isFinite(player.y),
      direction:player.dir,
      prianteAnimation:!!window.__prianteTest78,
      nameReveal:typeof scene1DisplayName==='function'&&
        typeof scene2DisplayName==='function'&&typeof scene3DisplayName==='function',
      audio:!!window.__soundtrackTest72,
      lumini:!!window.__teste79,
      errors:failures.slice()
    })
  };
})();