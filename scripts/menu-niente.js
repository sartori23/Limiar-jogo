/* Menu público: sem teleportes de QA e sem salvar progresso inexistente. */
(()=>{
'use strict';
const $id=id=>document.getElementById(id);
const start=$id('start-btn'),resume=$id('ndv-continue'),options=$id('ndv-options');
const panel=$id('ndv-options-panel');
const returnMenu=$id('ndv-return-menu');
const choices=[start,resume,options];
if(!start||!resume||!options||!panel||!returnMenu)throw Error('Interface da edição Niente incompleta');
let hasSession=false,selected=0,optionsOpen=false;
function updateChoices(){choices.forEach((b,i)=>b.classList.toggle('ndv-selected',i===selected&&!optionsOpen));}
function setOptionPanel(open){optionsOpen=open;panel.classList.toggle('hidden',!open);
 $id('ndv-option-audio').textContent='ÁUDIO: '+(audioOn?'LIGADO':'DESLIGADO');
 if(open)$id('ndv-option-back').focus();else{choices[selected].focus();updateChoices();}}
function markSession(){hasSession=true;resume.disabled=false;resume.removeAttribute('title');}
start.addEventListener('click',()=>{markSession();setOptionPanel(false);});
returnMenu.addEventListener('click',()=>{if(state==='pause'){setState('start');markSession();selected=1;updateChoices();}});
resume.addEventListener('click',()=>{if(!hasSession||resume.disabled)return;setOptionPanel(false);setState('play');});
options.addEventListener('click',()=>{selected=2;setOptionPanel(true);});
$id('ndv-option-audio').addEventListener('click',()=>{$id('audio-toggle').click();
 $id('ndv-option-audio').textContent='ÁUDIO: '+(audioOn?'LIGADO':'DESLIGADO');});
$id('ndv-option-fullscreen').addEventListener('click',()=>{$id('fullscreen').click();});
$id('ndv-option-back').addEventListener('click',()=>setOptionPanel(false));
// Opções da pausa: reutilizam exatamente os controles nativos do jogo.
const pauseAudio=$id('ndv-pause-audio'),pauseFullscreen=$id('ndv-pause-fullscreen');
const pauseDetails=$id('pause-commands');
if(!pauseAudio||!pauseFullscreen||!pauseDetails)throw Error('Opções da pausa ausentes');
function syncPauseAudio(){pauseAudio.textContent='ÁUDIO: '+(audioOn?'LIGADO':'DESLIGADO');}
pauseAudio.addEventListener('click',()=>{$id('audio-toggle').click();syncPauseAudio();});
pauseFullscreen.addEventListener('click',()=>{$id('fullscreen').click();});
pauseDetails.addEventListener('toggle',()=>{if(pauseDetails.open)syncPauseAudio();});
returnMenu.addEventListener('click',()=>{pauseDetails.open=false;});

document.addEventListener('keydown',e=>{
 if(state!=='start')return;
 if(optionsOpen){if(e.key==='Escape'){e.preventDefault();e.stopImmediatePropagation();setOptionPanel(false);}return;}
 if(!['ArrowUp','ArrowDown','w','W','s','S','Enter'].includes(e.key))return;
 e.preventDefault();e.stopImmediatePropagation();
 if(e.key==='Enter'){if(!choices[selected].disabled)choices[selected].click();return;}
 const delta=e.key==='ArrowUp'||e.key.toLowerCase()==='w'?-1:1;
 for(let i=0;i<choices.length;i++){selected=(selected+delta+choices.length)%choices.length;
  if(!choices[selected].disabled)break;}
 updateChoices();
},true);
updateChoices();
window.__nienteMenu={status:()=>({sessionActive:hasSession,canContinue:!resume.disabled,optionsOpen})};
})();
