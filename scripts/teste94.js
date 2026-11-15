/* NO LIMIAR DO FINITO — TESTE 94
 * Correção real do uso online: instala assets particulares em IndexedDB sob
 * https://sartori23.github.io (sem distribuir MP3 no repositório).
 * Após ativação única, o jogo online usa animações aprovadas + gravação local.
 * A cantiga do homem é restaurada e legendada somente no original.
 */
(()=>{
'use strict';
const VER='limiar94-assets';
const DBNAME='limiar-pessoal-94';
const AUDIO_KEY='spare-hearts-user-audio';
const DIRS=['down','up','left','right'];
const priorDraw=drawAnimatedP,priorUpdate=update,priorRetry=retry;
const finale=window.__finaleTest71;
const voice=finale?.voice;
const imgs={};
const textureDraws={total:0,byDirection:{down:0,up:0,left:0,right:0}};
let db=null,audioObjectURL=null,privateSong=null,hasPersonalSong=false;
let importedAt=0,cacheError='',installedDirs=new Set(),creditPlaying=false,creditsAttempt=0;
let songAttemptAt=-100,chantError='',lastCaption=-1,phaseLast=null,volumeRestore=0.38;
let audioReady=false,creditsCalled=false;
const store='assets';
function openDB(){
 return new Promise((resolve,reject)=>{
   if(!('indexedDB' in window)){reject(Error('Armazenamento local indisponível'));return;}
   const req=indexedDB.open(DBNAME,1);
   req.onupgradeneeded=()=>{if(!req.result.objectStoreNames.contains(store))req.result.createObjectStore(store);};
   req.onsuccess=()=>{db=req.result;resolve(db);};
   req.onerror=()=>reject(req.error||Error('Não foi possível abrir armazenamento'));
 });
}
function getAsset(key){
 return new Promise((resolve,reject)=>{
  if(!db)return resolve(null);
  const t=db.transaction(store,'readonly'),r=t.objectStore(store).get(key);
  r.onsuccess=()=>resolve(r.result??null);r.onerror=()=>reject(r.error);
 });
}
function saveAsset(key,value){
 return new Promise((resolve,reject)=>{
  const t=db.transaction(store,'readwrite');
  t.objectStore(store).put(value,key);
  t.oncomplete=()=>resolve();
  t.onerror=()=>reject(t.error);
 });
}
function decodeBase64DataUrl(uri){
 const comma=uri.indexOf(',');
 if(comma<0)throw Error('Arquivo de áudio inválido');
 const raw=atob(uri.slice(comma+1));
 const u=new Uint8Array(raw.length);
 for(let i=0;i<raw.length;i++)u[i]=raw.charCodeAt(i);
 return new Blob([u],{type:'audio/mpeg'});
}
function displaySprite(dir,src){
 return new Promise((resolve,reject)=>{
  if(typeof src!=='string'||!src.startsWith('data:image/webp;base64,'))return reject(Error('Sprite não reconhecido'));
  const im=new Image();im.decoding='async';
  im.onload=()=>{
   if(im.naturalWidth!==2048||im.naturalHeight!==256)return reject(Error('Atlas fora do padrão em '+dir));
   imgs[dir]=im;installedDirs.add(dir);resolve();
  };
  im.onerror=()=>reject(Error('Falha na imagem '+dir));
  im.src=src;
 });
}
function useSong(blob){
 if(!(blob instanceof Blob)||blob.size<2000000){cacheError='Arquivo musical inválido';return;}
 if(audioObjectURL)URL.revokeObjectURL(audioObjectURL);
 audioObjectURL=URL.createObjectURL(blob);
 if(!privateSong)privateSong=new Audio();
 privateSong.src=audioObjectURL;
 privateSong.preload='auto';privateSong.loop=true;privateSong.volume=.80;
 privateSong.onerror=()=>{cacheError='Spare Hearts não pôde ser decodificada pelo navegador';};
 hasPersonalSong=true;audioReady=true;
 musicButton.hidden=true;
}
const style=document.createElement('style');
style.textContent=[
 '#final-song small{display:none!important}',
 '#spare-local94{position:absolute;z-index:36;left:50%;bottom:8px;transform:translateX(-50%);width:min(89%,460px);color:#d7bfc0;font:11px/1.4 Georgia,serif;text-align:center;pointer-events:none}',
 '#spare-local94 button{pointer-events:auto;border:1px solid #875252;border-radius:5px;background:#300b16;color:#f7d8d3;padding:7px 12px;font-size:12px;cursor:pointer}',
 '#spare-local94 input{display:none}',
 '#spare-local94 .spare-label{display:block;font-size:10px;opacity:.9;margin-bottom:4px}',
 '#cantiga-resgate94{position:absolute;z-index:23;right:12px;bottom:16%;display:none}',
 '#cantiga-resgate94.visible{display:block}',
 '#cantiga-resgate94 button{background:#25151a;color:#dcb6a5;border:1px solid #7d434b;font:11px Georgia,serif;padding:6px 9px;cursor:pointer}'
].join('\n');
document.head.append(style);
const creditsScreen=document.getElementById('final-credits-screen');
const helper=document.createElement('div');helper.id='spare-local94';
const musicButton=document.createElement('button');
musicButton.type='button';musicButton.textContent='Ativar Spare Hearts neste navegador';
const mp3input=document.createElement('input');mp3input.type='file';mp3input.accept='audio/mpeg,.mp3';
helper.append(musicButton,mp3input);
creditsScreen?.append(helper);
musicButton.onclick=()=>{
 if(hasPersonalSong)startCredits();else mp3input.click();
};
mp3input.onchange=async()=>{
 const f=mp3input.files?.[0];if(!f)return;
 if(f.size>25_000_000||f.size<2_000_000){musicButton.textContent='Arquivo inválido — selecione o MP3';return;}
 try{
  await saveAsset(AUDIO_KEY,f);
  useSong(f);
  musicButton.textContent='Spare Hearts instalada!';musicButton.hidden=true;
  if(state==='final-credits')startCredits();
 }catch(e){cacheError=String(e);musicButton.textContent='Falha ao instalar o MP3';}
};
const vocalButton=document.createElement('div');vocalButton.id='cantiga-resgate94';
vocalButton.innerHTML='<button type="button">♪ Ativar a cantiga</button>';
document.getElementById('viewport')?.append(vocalButton);
vocalButton.querySelector('button').addEventListener('click',()=>{
 if(!voice)return;
 voice.volume=.78;
 voice.play().then(()=>{chantError='';vocalButton.classList.remove('visible');})
 .catch(e=>{chantError=String(e);});
});
function subtitleUpdate(){
 const caption=document.getElementById('final-song');
 const f=finale?.state();
 if(!voice||!caption||!f?.active||f.phase!=='walk'||player.y>=5600 || !audioOn)return;
 caption.classList.add('visible');
 const phrases=[
   '♪ Hush, little baby... ♪',
   '♪ Don’t say a word... ♪',
   '♪ Mama’s gonna buy you a mockingbird... ♪',
   '♪ And if that mockingbird don’t sing... ♪'
 ];
 // Ativa o texto somente durante os quatro versos principais.
 // O tempo vem do áudio real, não do número de frames da animação.
 const duration=voice.duration;
 const time=voice.currentTime;
 const index=Number.isFinite(duration)&&duration>1
   ?Math.min(3,Math.floor((time/duration)*4))
   :Math.floor(gameTime/4)%4;
 if(lastCaption!==index||caption.querySelector('small')){
    caption.textContent=phrases[index];lastCaption=index;
 }
}
function keepCantigaAlive(){
 const f=finale?.state();
 if(!voice||!f?.active||!audioOn || f.phase!=='walk'||player.y>=5600){
   vocalButton.classList.remove('visible');
   return;
 }
 voice.loop=true;voice.volume=.76;
 if(voice.error){chantError='Áudio da cantiga indisponível: '+voice.error.code;vocalButton.classList.add('visible');return;}
 if(voice.paused&&gameTime-songAttemptAt>1.3){
   songAttemptAt=gameTime;
   voice.play().then(()=>{chantError='';vocalButton.classList.remove('visible');})
     .catch(e=>{chantError='Navegador bloqueou a cantiga: '+String(e);vocalButton.classList.add('visible');});
 }
 subtitleUpdate();
}
async function restoreAssets(){
 try{
   await openDB();
   const tasks=DIRS.map(async d=>{
     const val=await getAsset('sprite_'+d);
     if(val)await displaySprite(d,val);
   });
   tasks.push(getAsset(AUDIO_KEY).then(v=>{if(v)useSong(v)}));
   await Promise.all(tasks);
   if(hasPersonalSong){
     musicButton.textContent='Spare Hearts instalada ✓';musicButton.hidden=true;
   }
 }catch(e){cacheError=String(e);}
}
const boot=restoreAssets();
async function install(msg){
 if(!db)await openDB();
 const source=msg.sprites||{};
 const keys=DIRS;
 const actual=keys.filter(d=>typeof source[d]==='string'&&source[d].startsWith('data:image/webp;base64,'));
 if(actual.length!==4)throw Error('É necessário enviar as quatro direções de corrida');
 for(const d of keys){
   await displaySprite(d,source[d]);
   await saveAsset('sprite_'+d,source[d]);
 }
 const data=msg.audio;
 if(typeof data!=='string'||!data.startsWith('data:audio/mpeg;base64,')||data.length<2_000_000)
    throw Error('MP3 ausente na preparação');
 const blob=decodeBase64DataUrl(data);
 await saveAsset(AUDIO_KEY,blob);
 useSong(blob);importedAt=Date.now();correctMusicReference();
 musicButton.textContent='Spare Hearts instalada ✓';musicButton.hidden=true;
 return {directions:installedDirs.size,bytes:blob.size};
}
window.addEventListener('message',async e=>{
 if(!window.opener || e.source!==window.opener)return;
 const msg=e.data;
 if(!msg||msg.protocol!==VER)return;
 if(msg.type==='prepare'){notifyReady();return;}
 if(msg.type!=='install')return;
 try{
   const result=await install(msg);
   window.opener.postMessage({protocol:VER,type:'installed',...result},'*');
 }catch(error){
   cacheError=String(error);
   window.opener.postMessage({protocol:VER,type:'error',message:cacheError},'*');
 }
});
function notifyReady(){
 if(!window.opener)return;
 try{window.opener.postMessage({protocol:VER,type:'ready'},'*')}catch(e){}
}
boot.finally(notifyReady);

drawAnimatedP=function(x,y,size,dir,bob=0){
 const st=window.__teste87?.status?.();
 if(!st||st.frame?.source!=='run'||!player.sprinting)return priorDraw(x,y,size,dir,bob);
 const d=DIRS.includes(st.facing)?st.facing:(DIRS.includes(dir)?dir:'down');
 const im=imgs[d];
 if(!im?.complete||im.naturalWidth!==2048)return priorDraw(x,y,size,dir,bob);
 const frame=((st.frame.index||0)%8+8)%8;
 const px=tx(x),py=ty(y),scale=size/256;
 if(!Number.isFinite(px)||!Number.isFinite(py))return;
 const [ox,oy]=window.__P87_OFFSETS?.['run_'+d]?.[frame]||[0,0];
 g.save();g.globalCompositeOperation='source-over';g.globalAlpha=1;g.filter='none';
 g.imageSmoothingEnabled=false;
 g.drawImage(im,frame*256,0,256,256,
   Math.round(px-size/2+ox*scale),Math.round(py-size*.90+oy*scale),size,size);
 g.restore();
 textureDraws.total++;textureDraws.byDirection[d]++;
};
function stopCredits(){
 if(privateSong&&!privateSong.paused)privateSong.pause();
 if(privateSong)privateSong.currentTime=0;
 creditPlaying=false;creditsCalled=false;
 if(window.__soundtrackTest72?.tracks?.creditos)
   window.__soundtrackTest72.tracks.creditos.gain=.38;
}
function startCredits(){
 if(!hasPersonalSong||!privateSong)return;
 // Música licenciada do Teste 72 fica realmente em silêncio durante Spare Hearts.
 const credit=window.__soundtrackTest72?.tracks?.creditos;
 if(credit)credit.gain=0;
 if(creditPlaying)return;
 creditsCalled=true;
 privateSong.currentTime=0;privateSong.volume=.84;
 privateSong.play().then(()=>{
   creditPlaying=true;musicButton.textContent='♪ Spare Hearts';musicButton.hidden=true;
 }).catch(e=>{
   creditPlaying=false;cacheError='Reprodução bloqueada: '+String(e);
   musicButton.textContent='▶ Ativar Spare Hearts';musicButton.hidden=false;
   if(window.__soundtrackTest72?.tracks?.creditos)window.__soundtrackTest72.tracks.creditos.gain=.22;
 });
}
priorUpdate&& (update=function(dt){
 const ret=priorUpdate(dt);
 keepCantigaAlive();
 if(state==='final-credits'){
   if(hasPersonalSong){
     if(!creditsCalled)startCredits();
     if(window.__soundtrackTest72?.tracks?.creditos)window.__soundtrackTest72.tracks.creditos.gain=creditPlaying?0:.22;
   }else{
     musicButton.textContent='Escolher MP3 Spare Hearts (uma vez)';musicButton.hidden=false;
   }
 }else if(creditsCalled||creditPlaying){
   stopCredits();
 }
 return ret;
});
retry=function(full){stopCredits();return priorRetry(full);};
function correctMusicReference(){
 const footer=document.getElementById('soundtrack-credits72');
 if(!footer)return;
 for(const node of footer.querySelectorAll('div')){
   for(const child of node.childNodes){
     if(child.nodeType!==3)continue;
     if(child.textContent.includes('Gravação não incorporada') || child.textContent.includes('A gravação não foi incluída')){
       child.textContent=hasPersonalSong?' · Reprodução do MP3 pessoal instalado no navegador.':' · Disponível para reprodução após importar o MP3 pessoal.';
     }
   }
 }
}
boot.then(correctMusicReference).catch(()=>{});
const older=document.getElementById('spare-ref93');
if(older)older.textContent='Spare Hearts — Exit Mouse (CatGhost) · Música dos agradecimentos, quando instalada pelo jogador.';
window.__teste94={
  status:()=>({
   version:94,cacheReady:!!db,musicInstalled:hasPersonalSong,creditsPlaying:creditPlaying,
   assets:[...installedDirs],draws:textureDraws.total,perDirection:{...textureDraws.byDirection},
   creditsAttempted:creditsCalled,cantigaPaused:voice?.paused??true,
   cantigaError:chantError,voiceReady:voice?.readyState??0,
   errors:cacheError
  }),
  prepare:()=>notifyReady(),
  installLocal:(payload)=>install(payload)
};
})();