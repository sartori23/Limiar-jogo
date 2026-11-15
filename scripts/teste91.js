/* TESTE 91 — caminhada nas memórias, corrida só no último corredor.
 * Remove UI de YouTube; créditos conservam faixa licenciada automática e
 * referência a Spare Hearts. Adia fala de portas até a primeira porta vista.
 * Atualiza legendas da cantiga gravada respeitando tempo da faixa.
 */
(()=>{
  'use strict';
  const ROOT=new URL('./',document.currentScript?.src||location.href);
  const oldDraw=drawAnimatedP,oldUpdate=update,oldRetry=retry;
  let firstDoorSeen=false,spareReference=false,subtitles=0,renderedRun=0;
  const runFrames={},runBuffers={};
  for(const direction of ['down','left','right']){
    const img=new Image();
    img.decoding='async';
    img.src=new URL('p90_run_'+direction+'.webp',ROOT).href;
    runFrames[direction]=img;
  }

  // Quadros de corrida revisados só podem aparecer durante o epílogo.
  function cleanRunFrame(dir,i){
    const src=runFrames[dir];
    if(!src?.complete || src.naturalWidth!==2048||src.naturalHeight!==256)return null;
    const key=dir+'_'+i;
    if(runBuffers[key])return runBuffers[key];
    const c=document.createElement('canvas');
    c.width=c.height=256;
    const d=c.getContext('2d',{alpha:true});
    d.imageSmoothingEnabled=false;
    d.clearRect(0,0,256,256);
    d.drawImage(src,i*256,0,256,256,0,0,256,256);
    return runBuffers[key]=c;
  }
  drawAnimatedP=function(x,y,size,direction,bob=0){
    const finale=window.__finaleTest71?.state?.();
    const st=window.__teste87?.status?.();
    if(!finale?.active||!player.sprinting||st?.frame?.source!=='run' ||
       !['down','left','right'].includes(st.facing)){
      return oldDraw(x,y,size,direction,bob);
    }
    const i=((st.frame.index%8)+8)%8;
    const frame=cleanRunFrame(st.facing,i);
    if(!frame)return oldDraw(x,y,size,direction,bob);
    const px=tx(x),py=ty(y);
    const [offX,offY]=window.__P87_OFFSETS?.['run_'+st.facing]?.[i]||[0,0];
    const ratio=size/256;
    g.save();
    g.globalCompositeOperation='source-over';g.globalAlpha=1;
    g.filter='none';g.imageSmoothingEnabled=false;
    g.drawImage(frame,Math.round(px-size/2+offX*ratio),
      Math.round(py-size*.90+offY*ratio),size,size);
    g.restore();
    renderedRun++;
  };

  const subtitle=document.getElementById('final-song');
  const singer=window.__finaleTest71?.voice;
  const captionStyle=document.createElement('style');
  captionStyle.textContent=[
    '#final-song{top:11%!important;left:14%!important;right:14%!important;max-width:680px;margin:0 auto;line-height:1.45!important;font-size:clamp(12px,2.1vw,17px)!important;letter-spacing:.035em!important;color:#edc99f!important;padding:7px 10px!important;border-radius:7px;background:rgba(10,6,8,.62)!important;text-shadow:0 1px 5px #000!important}',
    '#final-song small{display:block;font-family:system-ui,sans-serif;font-size:11px;color:#d0b7a2;letter-spacing:.01em;font-style:normal;margin-top:2px}',
    '@media(max-width:540px){#final-song{top:8%!important;left:7%!important;right:7%!important}}'
  ].join('\n');
  document.head.append(captionStyle);

  // Trechos curtos da cantiga tradicional, traduzidos como legenda.
  // O tempo é relativo à duração do áudio real, inclusive nas repetições.
  const CANTIGA=[
    ['♪ Hush, little baby... ♪','♪ Durma, meu pequeno... ♪'],
    ["♪ Don't say a word... ♪",'♪ Não diga uma palavra... ♪'],
    ["♪ Mama's gonna buy you a mockingbird... ♪",'♪ Mamãe vai trazer um passarinho... ♪'],
    ["♪ And if that mockingbird don't sing... ♪",'♪ Se aquele passarinho não cantar... ♪']
  ];
  function updateCaption(){
    if(!subtitle||!singer||!subtitle.classList.contains('visible'))return;
    if(singer.paused)return;
    let n=0;
    if(Number.isFinite(singer.duration)&&singer.duration>1){
      n=Math.min(CANTIGA.length-1,
        Math.floor((singer.currentTime%singer.duration)/singer.duration*CANTIGA.length));
    }else n=Math.floor(gameTime/5)%CANTIGA.length;
    if(n!==subtitles||!subtitle.querySelector('small')){
      subtitles=n;
      subtitle.replaceChildren();
      const line=document.createElement('span'),translated=document.createElement('small');
      line.textContent=CANTIGA[n][0];
      translated.textContent=CANTIGA[n][1];
      subtitle.append(line,translated);
    }
  }
  function updateCredits(){
    if(spareReference)return;
    const footer=document.getElementById('soundtrack-credits72');
    if(!footer)return;
    const link=[...footer.querySelectorAll('a')].find(a=>a.textContent.includes('Spare Hearts'));
    if(!link)return;
    link.href='https://youtu.be/GQTnh9v2lhs';
    link.textContent='“Spare Hearts” — Exit Mouse / CatGhost (referência musical)';
    const parent=link.parentElement;
    for(const node of parent.childNodes){
      if(node.nodeType===3 && node.textContent.includes('Bandcamp')){
        node.textContent=' · Referência solicitada pelo criador. Gravação não incorporada; a trilha instrumental licenciada permanece como fundo dos créditos.';
      }
    }
    spareReference=true;
  }

  update=function(dt){
    const out=oldUpdate(dt);
    // A porta deve estar no campo de visão de Pietro; não antes do despertar.
    if(!firstDoorSeen && state==='play'&&!scene1Active&&!scene2Active&&!scene3Active &&
        !window.__finaleTest71?.state?.().active && Array.isArray(objs)){
      const visible=objs.some(o=>
        ['memory-portal','memory-portal1','memory-portal3'].includes(o.kind) &&
        Math.hypot(o.x-player.x,o.y-player.y)<160);
      if(visible){
        firstDoorSeen=true;
        player.moving=false;
        showDialogue('P',[
          'Aquelas portas têm números? Será que alguma delas leva pra fora?',
          'Acho que vou olhar... bem devagarinho.'
        ],'p');
      }
    }
    updateCaption();
    updateCredits();
    return out;
  };
  retry=function(full){
    if(full)firstDoorSeen=false;
    return oldRetry(full);
  };
  updateCredits();
  window.__teste91={
    status:()=>({version:91,sprinting:!!player.sprinting,
      finalSprintAllowed:!!window.__finaleTest71?.state?.().active,
      firstDoorSeen,
      captions:subtitles,
      audioOn,creditReference:spareReference,
      noYouTubeUI:!document.getElementById('spare-player89'),
      cleanedRunDraws:renderedRun,
      runSprites:Object.fromEntries(Object.entries(runFrames).map(([k,img])=>[k,img.naturalWidth===2048]))})
  };
})();