/* NO LIMIAR DO FINITO — TESTE 95B
 * Etapa B: MP3 ORIGINAL de Spare Hearts em arquivo público do GitHub,
 * sem Youtube, ativação local, player embutido ou download manual.
 * A cantiga do Cavaleiro permanece audível no trecho inicial do corredor.
 * Letras: somente original, sem tradução, seguindo o tempo da gravação.
 */
(()=>{
 'use strict';
 const ROOT=new URL('./',document.currentScript?.src||location.href);
 const PATH=new URL('spare-hearts.mp3',ROOT).href;
 const CREDIT='Spare Hearts — Exit Mouse (CatGhost)';
 const music=new Audio(PATH);
 music.loop=true;
 music.preload='auto';
 music.volume=.78;
 const voice=window.__finaleTest71?.voice;
 const oldUpdate=update,oldRetry=retry;
 let played=false,tried=false,blocked=false,loads=0,errors=[];
 let creditsEntered=0,cantigaStarted=false,cantigaTries=0,cantigaLast=-1;
 let lyricsChanged=0, lastState=state, originalCreditsGain=null;
 const existing=document.getElementById('soundtrack-credits72');
 const ref=document.getElementById('spare-ref93');
 if(ref)ref.textContent=CREDIT+' · Gravação utilizada nos agradecimentos com autorização para este projeto.';
 if(existing){
   const original=[...existing.querySelectorAll('a')]
     .find(a=>a.textContent.includes('Spare Hearts'));
   if(original){
     original.href='https://youtu.be/GQTnh9v2lhs';
     original.textContent=CREDIT+' (trilha dos créditos)';
     const p=original.parentElement;
     for(const child of [...p.childNodes]){
       if(child.nodeType===3&&/não foi incluída|gravação não incorporada/i.test(child.textContent))
         child.textContent=' · Utilizada como trilha dos créditos finais, conforme autorização declarada pelo criador.';
     }
   }
 }
 const fallback=document.createElement('button');
 fallback.type='button';fallback.id='spare-unlock95b';
 fallback.textContent='♪ Ativar música dos agradecimentos';
 fallback.style.cssText='position:absolute;bottom:16px;left:50%;transform:translateX(-50%);z-index:35;display:none;background:#30121b;border:1px solid #90616a;border-radius:6px;padding:9px 13px;color:#eed5cf;font-family:Georgia,serif;cursor:pointer;';
 document.getElementById('final-credits-screen')?.append(fallback);
 function silencePrevious(){
   const credits=window.__soundtrackTest72?.tracks?.creditos;
   if(credits){
     if(originalCreditsGain===null)originalCreditsGain=credits.gain;
     credits.gain=0;
   }
 }
 function startMusic(retry=false){
   if(!audioOn)return;
   if(played)return;
   if(tried&&!retry)return;
   tried=true;
   silencePrevious();
   music.volume=.82;
   const promise=music.play();
   if(promise && typeof promise.then==='function'){
     promise.then(()=>{
       played=true;blocked=false;fallback.style.display='none';silencePrevious();
     }).catch(e=>{
       blocked=true;errors.push('MP3: '+String(e));
       fallback.style.display='block';
     });
   }else{
     played=!music.paused;
   }
 }
 function stopMusic(){
   music.pause();music.currentTime=0;
   if(originalCreditsGain!==null){
     const credit=window.__soundtrackTest72?.tracks?.creditos;
     if(credit)credit.gain=originalCreditsGain;
     originalCreditsGain=null;
   }
   played=false;tried=false;blocked=false;
   fallback.style.display='none';
 }
 fallback.addEventListener('click',()=>{
   tried=false;startMusic(true);
 });
 music.addEventListener('playing',()=>{
   played=true;blocked=false;fallback.style.display='none';
 });
 music.addEventListener('error',()=>{
   const msg='Falha no MP3 de Spare Hearts: '+(music.error?.code??'desconhecida');
   errors.push(msg);blocked=true;
   if(state==='final-credits')fallback.style.display='block';
 });
 music.addEventListener('loadedmetadata',()=>loads++);

 const lines=[
   '♪ Hush, little baby... ♪',
   '♪ Don’t say a word... ♪',
   '♪ Mama’s gonna buy you a mockingbird... ♪',
   '♪ And if that mockingbird don’t sing... ♪'
 ];
 const voiceHint=document.createElement('button');
 voiceHint.type='button';voiceHint.id='cantiga-unlock95b';
 voiceHint.textContent='♪ Ativar a cantiga';
 voiceHint.style.cssText='position:absolute;right:12px;bottom:15%;z-index:26;display:none;background:#25151a;border:1px solid #7d434b;border-radius:5px;padding:7px 10px;color:#e3b9a9;font:12px Georgia,serif;cursor:pointer;';
 document.getElementById('viewport')?.append(voiceHint);
 voiceHint.addEventListener('click',()=>{
   if(!voice)return;
   voice.play().then(()=>{cantigaStarted=true;voiceHint.style.display='none';})
     .catch(e=>errors.push('Cantiga, ativação manual: '+String(e)));
 });
 if(voice){
   voice.preload='auto';voice.loop=true;
   voice.addEventListener('error',()=>{
     errors.push('Cantiga indisponível: '+(voice.error?.code??'desconhecido'));
   });
 }
 function recoverCantiga(){
   const f=window.__finaleTest71?.state?.();
   if(!voice||!f?.active)return;
   const shouldPlay=audioOn && state==='play' && f.phase==='walk' && player.y<5600;
   if(!shouldPlay){
     if(f.phase!=='walk')voiceHint.style.display='none';
     return;
   }
   if(voice.readyState===0)voice.load();
   voice.volume=.76;
   if(voice.paused && gameTime-cantigaLast>1.6){
     cantigaLast=gameTime;cantigaTries++;
     voice.play().then(()=>{cantigaStarted=true;voiceHint.style.display='none';})
       .catch(e=>{
         errors.push('Cantiga bloqueada: '+String(e));
         voiceHint.style.display='block';
       });
   }
   const caption=document.getElementById('final-song');
   if(!caption)return;
   if(!voice.paused && voice.readyState>=2 && Number.isFinite(voice.duration)&&voice.duration>0){
     caption.classList.add('visible');
     const pos=voice.currentTime%voice.duration;
     // Progresso da gravação humana. Nenhuma linha traduzida é exibida.
     const k=Math.min(lines.length-1,Math.floor(pos/voice.duration*lines.length));
     const lyric=lines[k];
     if(caption.textContent!==lyric){
       caption.textContent=lyric;lyricsChanged++;
     }
   }
 }
 update=function(dt){
   const result=oldUpdate(dt);
   const inCredits=state==='final-credits';
   if(inCredits){
     if(lastState!=='final-credits')creditsEntered++;
     silencePrevious();
     if(audioOn){
       if(!tried)startMusic();
     }else if(!music.paused){
       music.pause();played=false;tried=false;
     }
   }else if(lastState==='final-credits' || played || tried){
     stopMusic();
   }
   recoverCantiga();
   lastState=state;
   return result;
 };
 retry=function(full){
   stopMusic();return oldRetry(full);
 };
 window.__teste95B={
   status:()=>({
     source:PATH,
     musicReady:music.readyState,
     duration:music.duration,
     musicCurrentTime:music.currentTime,
     creditsEntered,played,paused:music.paused,blocked,
     credited:!!document.getElementById('spare-ref93'),
     voiceReady:voice?.readyState??0,
     voiceCurrentTime:voice?.currentTime??0,
     voicePlaying:!!voice&&!voice.paused,
     cantigaStarted,cantigaTries,lyricsChanged,
     errors:errors.slice(-8)
   }),
   music,voice
 };
})();
