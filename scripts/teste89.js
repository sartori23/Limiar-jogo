/* Teste 89 — créditos com player oficial do YouTube e mixagem final.
 * Não baixa, extrai, armazena nem reempacota Spare Hearts.
 * Reproduzir depende de incorporação permitida no YouTube e clique do usuário.
 */
(()=>{
 'use strict';
 const YOUTUBE='https://www.youtube.com/watch?v=GQTnh9v2lhs';
 const EMBED='https://www.youtube-nocookie.com/embed/GQTnh9v2lhs?autoplay=1&playsinline=1&rel=0';
 const credits=document.getElementById('final-credits-screen');
 if(!credits)throw Error('Tela de créditos finais não encontrada');
 const sheet=document.createElement('style');
 sheet.textContent=[
  '#spare-player89{position:absolute;z-index:30;left:50%;bottom:12px;transform:translateX(-50%);width:min(96%,420px);background:rgba(8,5,11,.96);border:1px solid #6b4544;border-radius:9px;box-shadow:0 4px 22px #000b;padding:10px 13px;display:flex;flex-direction:column;gap:6px;align-items:center;text-align:center;}',
  '#spare-player89 .sp89-title{font-size:13px;font-family:Georgia,serif;color:#f0d2c5}',
  '#spare-player89 .sp89-credit{font-size:10px;color:#b7a3a0;line-height:1.4}',
  '#spare-player89 button{background:#48202b;color:#ffe6da;border:1px solid #aa7776;border-radius:7px;padding:8px 12px;cursor:pointer;font-size:12px;font-family:inherit}',
  '#spare-player89 button:focus-visible{outline:2px solid #f2c0a4;outline-offset:2px}',
  '#spare-player89 a{color:#e9c1a0;font-size:11px;text-decoration:underline}',
  '#spare-player89 iframe{max-width:100%;aspect-ratio:16/9;border:0;border-radius:5px;background:#000}',
  '@media(max-width:600px){#spare-player89{bottom:4px;padding:6px 8px}#spare-player89 iframe{max-height:120px}#spare-player89 .sp89-credit{font-size:9px}}'
 ].join('\n');
 document.head.append(sheet);
 const panel=document.createElement('div');
 panel.id='spare-player89';
 panel.setAttribute('aria-label','Música dos agradecimentos, player oficial do YouTube');
 const title=document.createElement('div');
 title.className='sp89-title';title.textContent='Spare Hearts — Exit Mouse (CatGhost)';
 const credit=document.createElement('div');
 credit.className='sp89-credit';
 credit.textContent='Música: Buck Riley / Exit Mouse · Reprodução pelo YouTube, conforme disponibilidade do vídeo';
 const play=document.createElement('button');
 play.type='button';play.textContent='▶ Ouvir Spare Hearts no YouTube';
 const link=document.createElement('a');
 link.href=YOUTUBE;link.target='_blank';link.rel='noopener noreferrer';
 link.textContent='Abrir o vídeo original';
 const fallback=document.createElement('button');
 fallback.type='button';fallback.textContent='Usar trilha instrumental dos créditos';
 fallback.hidden=true;
 const detail=document.createElement('div');
 detail.className='sp89-credit';
 detail.textContent='Se o vídeo não puder ser incorporado, use o link acima ou retorne à trilha instrumental.';
 panel.append(title,credit,play,link,fallback,detail);
 credits.append(panel);
 let launched=false,playingYoutube=false,iframe=null;
 function cleanup(){
   if(iframe){iframe.remove();iframe=null;}
   playingYoutube=false;launched=false;
   play.textContent='▶ Ouvir Spare Hearts no YouTube';
   play.disabled=false;fallback.hidden=true;
 }
 play.addEventListener('click',()=>{
   if(state!=='final-credits'||launched)return;
   launched=true;playingYoutube=true;
   iframe=document.createElement('iframe');
   iframe.title='Spare Hearts — vídeo vinculado no YouTube';
   iframe.loading='eager';
   iframe.allow='autoplay; encrypted-media; picture-in-picture; fullscreen';
   iframe.referrerPolicy='strict-origin-when-cross-origin';
   iframe.allowFullscreen=true;
   iframe.width='320';iframe.height='180';
   iframe.src=EMBED;
   panel.insertBefore(iframe,link);
   play.textContent='Reprodução via YouTube';play.disabled=true;
   fallback.hidden=false;
 });
 fallback.addEventListener('click',cleanup);
 const soundtrack=window.__soundtrackTest72;
 const finalMix={menu:.24,limiante:.27,priantes:.31,ceu:.31,cena:.30,
   biblioteca:.29,lumini:.28,perseguicao:.85,creditos:.38};
 const oldUpdate=update;
 update=function(dt){
   const result=oldUpdate(dt);
   if(soundtrack?.tracks){
     const isDialog=state==='dialog'||state==='scene2-actions'||state==='scene3-actions';
     for(const [key,value] of Object.entries(finalMix)){
       const tr=soundtrack.tracks[key];
       if(!tr)continue;
       const dialogueFactor=(key==='perseguicao'||key==='creditos')?1:(isDialog?0.62:1);
       tr.gain=value*dialogueFactor;
       if(key==='menu'&&state==='pause')tr.gain*=.6;
     }
     if(state==='final-credits'&&playingYoutube){
       soundtrack.tracks.creditos.gain=0;
     }
   }
   return result;
 };
 const oldRetry=retry;
 retry=function(full){cleanup();return oldRetry(full);};
 const older=document.querySelector('#soundtrack-credits72');
 if(older){
   for(const item of older.querySelectorAll('div')){
     if(item.textContent.includes('Faixa desejada para o encerramento:')){
       if(item.lastChild&&item.lastChild.nodeType===3)
         item.lastChild.textContent=' · Reprodução opcional no player oficial do YouTube, nos créditos.';
     }
   }
 }
 window.__teste89={
   status:()=>({playerReady:!!panel,videoUrl:YOUTUBE,videoActivated:playingYoutube,
     iframeCreated:!!iframe,mix:finalMix,finale:window.__finaleTest71?.state?.()||null})
 };
})();