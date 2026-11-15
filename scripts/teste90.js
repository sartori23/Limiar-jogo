/* Teste 90 — corrida sem pixels soltos e música dos créditos automática.
 * Incorporação oficial do YouTube: inicia no momento dos créditos, e o botão
 * aparece como alternativa caso o navegador bloqueie autoplay com som.
 * Não extrai ou redistribui o áudio protegido por direitos autorais.
 */
(()=>{
 'use strict';
 const root=new URL('./',document.currentScript?.src||location.href);
 const directions=['down','left','right'];
 const runImages={},frameBuffers={},missing=[];
 for(const d of directions){
   const img=new Image();img.decoding='async';
   img.src=new URL('p90_run_'+d+'.webp',root).href;
   img.addEventListener('error',()=>missing.push(d));
   runImages[d]=img;
 }
 const previousDraw=drawAnimatedP;
 let draws=0,lastSprite=null;
 function cleanFrame(direction,index){
   const img=runImages[direction];
   if(!img?.complete||img.naturalWidth!==2048||img.naturalHeight!==256)return null;
   const id=direction+'_'+index;
   if(frameBuffers[id])return frameBuffers[id];
   const canvas=document.createElement('canvas');
   canvas.width=canvas.height=256;
   const c=canvas.getContext('2d',{alpha:true});
   c.imageSmoothingEnabled=false;
   c.clearRect(0,0,256,256);
   c.drawImage(img,index*256,0,256,256,0,0,256,256);
   frameBuffers[id]=canvas;
   return canvas;
 }
 drawAnimatedP=function(x,y,size,dir,bob=0){
   const controller=window.__teste87?.status?.();
   const m=controller?.frame?.source;
   const direction=controller?.facing;
   const index=controller?.frame?.index;
   if(m!=='run'||!directions.includes(direction)||!Number.isInteger(index))
     return previousDraw(x,y,size,dir,bob);
   const safe=((index%8)+8)%8;
   const frame=cleanFrame(direction,safe);
   if(!frame)return previousDraw(x,y,size,dir,bob);
   const px=tx(x),py=ty(y);
   if(!Number.isFinite(px)||!Number.isFinite(py))return;
   const [offX,offY]=window.__P87_OFFSETS?.['run_'+direction]?.[safe]||[0,0];
   const r=size/256;
   g.save();
   g.globalCompositeOperation='source-over';
   g.globalAlpha=1;
   g.filter='none';
   g.imageSmoothingEnabled=false;
   g.translate(Math.round(px),Math.round(py));
   // Apoio do pé do conjunto aprovado, sem ampliar os recortes ou distorcer
   // a cabeça: cada quadro conserva sua própria silhueta frontal/lateral.
   g.drawImage(frame,-size/2+offX*r,-size*.90+offY*r,size,size);
   g.restore();
   draws++;lastSprite='run_'+direction+'_'+safe;
 };

 const credits=document.getElementById('final-credits-screen');
 const panel=document.getElementById('spare-player89');
 if(!credits||!panel)throw Error('Agradecimentos indisponíveis');
 const ytUrl='https://www.youtube.com/watch?v=GQTnh9v2lhs';
 const style=document.createElement('style');
 style.textContent=[
   '#spare-player89{left:auto!important;right:12px!important;bottom:12px!important;transform:none!important;width:min(92%,365px)!important;max-width:365px!important;padding:8px!important;gap:5px!important}',
   '#spare-player89 .yt90-stage{width:100%;min-height:200px;display:flex;align-items:center;justify-content:center;background:#09070a;border:1px solid #413038;border-radius:5px;overflow:hidden}',
   '#spare-player89 .yt90-stage iframe{display:block;width:100%;min-height:200px;aspect-ratio:16/9;border:0}',
   '#spare-player89 .yt90-alert{font-size:10px;line-height:1.4;color:#d9b1a0;max-width:340px}',
   '#spare-player89 button{font-size:11px;padding:6px 9px}',
   '@media(max-width:600px){#spare-player89{right:4px!important;max-width:270px!important;width:min(90%,270px)!important}#spare-player89 .yt90-stage{min-height:200px}#spare-player89 .yt90-stage iframe{min-height:200px;max-height:none}}'
 ].join('\n');
 document.head.append(style);

 const heading=document.createElement('div');
 heading.className='sp89-title';heading.textContent='Spare Hearts — Exit Mouse (CatGhost)';
 const credit=document.createElement('div');
 credit.className='sp89-credit';credit.textContent='Reprodução oficial pelo YouTube · música dos agradecimentos';
 const stage=document.createElement('div');
 stage.className='yt90-stage';
 const placeholder=document.createElement('div');
 placeholder.id='spare-yt90';
 placeholder.style.cssText='width:100%;min-height:200px;display:flex;align-items:center;justify-content:center;color:#a78b8c;font-size:11px';
 placeholder.textContent='Preparando a música…';
 stage.append(placeholder);
 const fallback=document.createElement('button');
 fallback.type='button';fallback.textContent='▶ Ativar a música com som';
 fallback.hidden=true;
 const note=document.createElement('div');
 note.className='yt90-alert';note.textContent='';
 const link=document.createElement('a');
 link.href=ytUrl;link.target='_blank';link.rel='noopener noreferrer';
 link.textContent='Abrir Spare Hearts no YouTube';
 panel.replaceChildren(heading,credit,stage,fallback,note,link);

 let started=false,hasPlayed=false,blocked=false,loaded=false,ytPlayer=null,errors=[],attempts=0;
 function musicGain(){
   const m=window.__soundtrackTest72;
   if(m?.tracks?.creditos)m.tracks.creditos.gain=hasPlayed?0:.27;
 }
 function reportBlock(reason){
   hasPlayed=false;blocked=true;
   note.textContent=reason||'O navegador bloqueou a reprodução automática. Toque para ouvir com som.';
   fallback.hidden=false;
   musicGain();
 }
 function reportPlay(){
   hasPlayed=true;blocked=false;
   note.textContent='Spare Hearts tocando através do player oficial do YouTube.';
   fallback.hidden=true;
   musicGain();
 }
 fallback.addEventListener('click',()=>{
   if(state!=='final-credits')return;
   if(ytPlayer&&typeof ytPlayer.playVideo==='function'){
     try{ytPlayer.unMute();ytPlayer.playVideo();}catch(e){errors.push(String(e));}
   }else {
     window.open(ytUrl,'_blank','noopener,noreferrer');
   }
 });
 function makePlayer(){
   if(!started||state!=='final-credits'||ytPlayer||!window.YT?.Player)return;
   loaded=true;attempts++;
   try{
     ytPlayer=new YT.Player('spare-yt90',{
       host:'https://www.youtube-nocookie.com',
       width:'352',height:'205',
       videoId:'GQTnh9v2lhs',
       playerVars:{autoplay:1,playsinline:1,rel:0,controls:1,loop:1,
         playlist:'GQTnh9v2lhs',origin:location.origin},
       events:{
         onReady:event=>{
           if(state!=='final-credits')return;
           event.target.setVolume(72);
           event.target.playVideo();
         },
         onStateChange:event=>{
           if(state!=='final-credits')return;
           if(event.data===1)reportPlay();
           else if(event.data===0||event.data===2) {
             hasPlayed=false;musicGain();
           }
         },
         onAutoplayBlocked:()=>reportBlock('Reprodução automática com som bloqueada. Toque para ativar Spare Hearts.'),
         onError:event=>{errors.push('YouTube: '+event.data);reportBlock('O vídeo não pôde ser incorporado. Use o link direto abaixo.');}
       }
     });
   }catch(e){errors.push(String(e));reportBlock('Player externo indisponível. Use o link direto abaixo.');}
 }
 function autoStart(){
   if(started)return;
   started=true;hasPlayed=false;blocked=false;
   note.textContent='Iniciando Spare Hearts automaticamente…';
   fallback.hidden=true;
   if(window.YT?.Player){makePlayer();return;}
   const earlier=window.onYouTubeIframeAPIReady;
   window.onYouTubeIframeAPIReady=function(){
     if(typeof earlier==='function')earlier();
     makePlayer();
   };
   const tag=document.createElement('script');
   tag.src='https://www.youtube.com/iframe_api';tag.async=true;
   tag.onerror=()=>reportBlock('Não foi possível conectar ao YouTube. Use o link direto.');
   document.head.append(tag);
 }
 function stop(){
   hasPlayed=false;started=false;blocked=false;loaded=false;attempts=0;
   if(ytPlayer){
     try{ytPlayer.destroy();}catch(e){}
     ytPlayer=null;
   }
   stage.replaceChildren();
   const next=document.createElement('div');
   next.id='spare-yt90';
   next.style.cssText=placeholder.style.cssText;
   next.textContent='Preparando a música…';
   stage.append(next);
   fallback.hidden=true;
   note.textContent='';
 }
 const oldUpdate=update;
 update=function(dt){
   const result=oldUpdate(dt);
   // O Teste 89 ainda mantém uma mixagem antiga; a prioridade do Céu agora é 12%.
   const soundtrack90=window.__soundtrackTest72;
   if(soundtrack90?.tracks?.ceu)soundtrack90.tracks.ceu.gain=.12;
   if(state==='final-credits'){
     if(!started)autoStart();
     musicGain();
   }else if(started)stop();
   return result;
 };
 const oldRetry=retry;
 retry=function(full){if(started)stop();return oldRetry(full);};
 window.__teste90={
   status:()=>({version:90,spritesReady:Object.fromEntries(Object.entries(runImages)
     .map(([k,img])=>[k,img.naturalWidth===2048])),
     spriteDraws:draws,lastSprite,
     autoStarted:started,playerCreated:!!ytPlayer,playerAttempts:attempts,
     youtubePlaying:hasPlayed,autoplayBlocked:blocked,
     musicReference:ytUrl,errors:[...errors,...missing],
     soundtrackCue:window.__soundtrackTest72?.status?.().active||null,
     finale:window.__finaleTest71?.state?.()||null})
 };
})();
