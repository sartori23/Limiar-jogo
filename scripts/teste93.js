/* NO LIMIAR DO FINITO — TESTE 93
 * Sprites aprovados recebidos pelo launcher local privado; no link público
 * usa atlas já existentes como fallback. Sem iframe de YouTube nos créditos.
 */
(()=>{
'use strict';
const ROOT=new URL('./',document.currentScript?.src||location.href);
const oldDraw=drawAnimatedP,oldUpdate=update,oldRetry=retry;
const dirs=['down','up','left','right'];
const sprites={},fallbacks={};
const fallbackFiles={down:'p90_run_down.webp',up:'p87_run_up.webp',
  left:'p90_run_left.webp',right:'p90_run_right.webp'};
for(const d of dirs){
 const img=new Image();img.decoding='async';
 img.src=new URL(fallbackFiles[d],ROOT).href;
 fallbacks[d]=img;
}
let externalAudio=false,creditsSent=false,runDraws=0,bridgeLoaded=false,errors=[];
let creditRefAdded=false;
window.addEventListener('message',event=>{
 if(window.parent===window || event.source!==window.parent)return;
 const data=event.data;
 if(!data||typeof data!=='object'||data.protocol!=='limiar-teste93')return;
 if(data.type==='assets'&&data.sprites&&typeof data.sprites==='object'){
   for(const d of dirs){
     const uri=data.sprites[d];
     if(typeof uri!=='string'||!uri.startsWith('data:image/webp;base64,')||uri.length>1200000)continue;
     const img=new Image();
     img.onload=()=>{sprites[d]=img;bridgeLoaded=true;};
     img.onerror=()=>errors.push('Falha ao ler arte aprovada: '+d);
     img.src=uri;
   }
 }else if(data.type==='audio-playing')externalAudio=true;
 else if(data.type==='audio-stopped')externalAudio=false;
});
function send(eventName){
 if(window.parent!==window)try{
   window.parent.postMessage({protocol:'limiar-teste93',type:eventName},'*');
 }catch(e){}
}
drawAnimatedP=function(x,y,size,dir,bob=0){
 const status=window.__teste87?.status?.();
 if(!status||status.frame?.source!=='run'||!player.sprinting)return oldDraw(x,y,size,dir,bob);
 const d=dirs.includes(status.facing)?status.facing:(dirs.includes(dir)?dir:'down');
 const img=sprites[d]?.naturalWidth?sprites[d]:fallbacks[d];
 if(!img?.complete||img.naturalWidth!==2048||img.naturalHeight!==256)
   return oldDraw(x,y,size,dir,bob);
 const frame=((status.frame.index||0)%8+8)%8;
 const px=tx(x),py=ty(y);
 if(!Number.isFinite(px)||!Number.isFinite(py))return;
 const offsets=window.__P87_OFFSETS||{};
 const [ox,oy]=offsets['run_'+d]?.[frame]||[0,0];
 const scale=size/256;
 g.save();
 g.globalAlpha=1;g.globalCompositeOperation='source-over';g.filter='none';
 g.imageSmoothingEnabled=false;
 g.drawImage(img,frame*256,0,256,256,
   Math.round(px-size/2+ox*scale),Math.round(py-size*.90+oy*scale),size,size);
 g.restore();
 runDraws++;
};
const style=document.createElement('style');
style.textContent=[
 "@import url('https://fonts.googleapis.com/css2?family=Creepster&display=swap');",
 "#final-corridor-hint .hint-side90{font-family:'Creepster','Chiller','Papyrus',fantasy!important;font-size:clamp(22px,3.8vw,42px)!important;font-weight:900!important;letter-spacing:.12em!important;color:#f9b5aa!important;text-shadow:1px 1px 0 #330409,-1px 0 #1b0203,0 0 5px rgba(255,31,34,.98),0 0 15px rgba(165,7,16,.90),0 0 30px rgba(65,0,4,.95)!important;animation:limiarHorrorWarning93 .19s steps(2,end) infinite!important;transform-origin:center!important;}",
 "#final-corridor-hint .hint-side90 small{font-family:'Courier New',monospace!important;letter-spacing:.07em!important;color:#e9d0c8!important;text-shadow:0 2px 5px black!important;}",
 "@keyframes limiarHorrorWarning93{0%{opacity:1;filter:blur(0);transform:translate(0,0) skew(-4deg)}25%{opacity:.86;filter:blur(.35px);transform:translate(-1px,1px) skew(-6deg)}50%{opacity:.95;filter:blur(0);transform:translate(1px,-1px) skew(-3deg)}75%{opacity:.66;filter:blur(.55px);transform:translate(0,1px) skew(-7deg)}100%{opacity:1;filter:blur(0);transform:translate(0,0) skew(-4deg)}}",
 "#final-song small{display:none!important}"
].join('\n');
document.head.append(style);
function updateCredits(){
 if(creditRefAdded)return;
 const credits=document.querySelector('#final-credits-screen .credit-scroll');
 if(!credits)return;
 let element=document.getElementById('spare-ref93');
 if(!element){
   element=document.createElement('div');element.id='spare-ref93';
   element.style.cssText='font-size:12px;color:#ba9f96;text-align:center;line-height:1.7;max-width:510px;padding:0 20px;';
   element.textContent='Spare Hearts — Exit Mouse (CatGhost) · Música escolhida para os agradecimentos.';
   credits.append(element);
 }
 creditRefAdded=true;
}
updateCredits();
update=function(dt){
 const result=oldUpdate(dt);
 const subtitle=document.getElementById('final-song');
 if(subtitle)subtitle.querySelector('small')?.remove();
 const credits=state==='final-credits';
 if(credits&&!creditsSent){updateCredits();creditsSent=true;send('credits-start');}
 if(!credits&&creditsSent){creditsSent=false;externalAudio=false;send('credits-stop');}
 if(credits&&externalAudio&&window.__soundtrackTest72?.tracks?.creditos)
   window.__soundtrackTest72.tracks.creditos.gain=0;
 return result;
};
retry=function(full){creditsSent=false;externalAudio=false;send('credits-stop');return oldRetry(full);};
send('ready');
window.__teste93={status:()=>({version:93,runDraws,bridgeLoaded,
 approvedSpritesLoaded:Object.fromEntries(dirs.map(d=>[d,!!sprites[d]?.naturalWidth])),
 musicFromPrivateLauncher:externalAudio,creditsSent,
 youtubeVisible:!!document.getElementById('spare-player89'),errors:errors.slice()})};
})();