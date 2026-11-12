/* Teste 72 — trilha licenciada por cenário, sem tocar material protegido sem permissão.
 * Os arquivos em soundtrack72 são preparados no workflow somente a partir de faixas CC0/CC-BY.
 * Não substitui sons de passos, diálogos, enigmas ou memória, apenas a música ambiente.
 */
(()=>{
  'use strict';
  const ROOT=new URL('./',document.currentScript?.src||location.href);
  const TRACKS={
    menu:{file:'menu.ogg',gain:.28},
    limiante:{file:'limiante.ogg',gain:.31},
    priantes:{file:'priantes.ogg',gain:.33},
    ceu:{file:'ceu.ogg',gain:.34},
    cena:{file:'cena.ogg',gain:.34},
    biblioteca:{file:'biblioteca.ogg',gain:.36},
    lumini:{file:'lumini.ogg',gain:.32},
    perseguicao:{file:'perseguicao.ogg',gain:.88},
    creditos:{file:'creditos.ogg',gain:.47}
  };
  let available=new Set(), manifestLoaded=false,manifestError=false;
  const players={};
  const score=new Map();
  let active=null,lastCheck=-999;
  const src=(filename)=>new URL('soundtrack72/'+filename,ROOT).href;
  // Faixas tocadas/baixadas são verificadas em build_soundtrack72.py.
  fetch(src('manifest.json')).then(r=>{
    if(!r.ok)throw Error('Manifest indisponível');
    return r.json();
  }).then(data=>{
    available=new Set(data.available||[]);
    manifestLoaded=true;
  }).catch(()=>{manifestLoaded=true;manifestError=true;});
  function playerFor(key){
    if(players[key])return players[key];
    const track=TRACKS[key];
    const a=new Audio(src(track.file));
    a.loop=true;a.preload='none';a.volume=0;
    a.addEventListener('error',()=>{
      available.delete(key);
      score.set(key,-1);
      if(active===key){active=null;window.__limiarSoundtrackPlayingChase=false;}
    });
    players[key]=a;
    score.set(key,0);
    return a;
  }
  function nearLumini(){
    if(!luminiArrivalStarted)return false;
    if(!luminiArrivalFinished)return true;
    if(state==='lumini-questions')return true;
    const person=$('speaker')?.textContent?.trim();
    if(state==='dialog' && (person==='Lumini'||person==='???')&&
        Math.hypot(player.x-CHEST_EVENT.x,player.y-CHEST_EVENT.y)<230)return true;
    return false;
  }
  function nearPriantes(){
    if(!Array.isArray(priantes)||!priantes.length)return false;
    let radiusSq=220*220;
    for(const p of priantes){
      const dx=(p.x||0)-player.x,dy=(p.y||0)-player.y;
      if(dx*dx+dy*dy<radiusSq)return true;
    }
    return false;
  }
  function currentCue(){
    // Estes estados vêm antes das salas, pois a cantiga e o final têm prioridade absoluta.
    if(state==='final-end')return null;
    if(state==='final-credits')return 'creditos';
    if(window.__finaleTest71){
      const f=window.__finaleTest71.state();
      if(f.active){
        if(f.phase==='chase'||f.phase==='fear')return 'perseguicao';
        return null; // silêncio + cantiga humana original no corredor
      }
    }
    if(state==='start'||state==='pause')return 'menu';
    if(state==='glitch'||state==='death'||state==='win')return null;
    if(scene1Active)return 'ceu';
    if(scene2Active)return 'cena';
    if(scene3Active)return 'biblioteca';
    if(nearLumini())return 'lumini';
    if(state==='waking')return 'menu';
    if(state==='play'&&nearPriantes())return 'priantes';
    return 'limiante';
  }
  function silenceOriginalWhenPlaying(cue){
    if(!audioCtx || !cue || !audioOn)return;
    const now=audioCtx.currentTime;
    for(const bus of [limCalmBus,limTenseBus,scene2PianoBus,scene3PianoBus]){
      if(bus?.gain)bus.gain.setTargetAtTime(0,now,.07);
    }
    // A música externa substitui os temas sintetizados, não os sons de interação.
  }
  function keepSynthFromRestarting(cue){
    if(!cue||!audioOn||!players[cue]||players[cue].paused)return;
    if(cue==='ceu')lastHarp=gameTime;
    if(cue==='cena')scene2PianoLast=gameTime;
    if(cue==='biblioteca')scene3PianoLast=gameTime;
    if(cue==='limiante'||cue==='priantes'||cue==='lumini'){
      limCalmLast=gameTime;limTenseLast=gameTime;
    }
  }
  function updateMix(dt){
    const cue=currentCue();
    const canPlay=!!audioOn&&manifestLoaded&&available.has(cue)&&!manifestError;
    if(gameTime-lastCheck>.17 || cue!==active){
      lastCheck=gameTime;
      if(canPlay){
        if(active!==cue)active=cue;
        const a=playerFor(cue);
        if(a.paused)a.play().catch(()=>{});
      }else if(cue===null || !audioOn){
        active=null;
      }else if(manifestLoaded && !available.has(cue)){
        active=null; // mantém trilha gerada originalmente para essa sala
      }
    }
    let usingChase=false;
    for(const [key,a] of Object.entries(players)){
      const target=key===active&&audioOn?TRACKS[key].gain:0;
      const delta=Math.max(.005,Math.min(.055,dt||.016));
      let next=a.volume;
      const speed=target>next?1.7:2.8;
      next+=(target-next)*Math.min(1,delta*speed);
      if(Math.abs(next-target)<.005)next=target;
      a.volume=Math.min(1,Math.max(0,next));
      if(a.volume===0 && !a.paused)a.pause();
      if(key==='perseguicao' && !a.paused && a.volume>.08)usingChase=true;
    }
    window.__limiarSoundtrackPlayingChase=usingChase;
    window.__useExternalChaseMusic=true;
    if(active && players[active] && !players[active].paused){
      silenceOriginalWhenPlaying(active);
    }
  }
  const previousUpdate=update;
  update=function(dt){
    keepSynthFromRestarting(active);
    const result=previousUpdate(dt);
    updateMix(dt);
    return result;
  };
  // Créditos das gravações utilizadas, inclusive a indicação da faixa escolhida
  // pelo criador que ainda necessita de permissão de uso: Spare Hearts.
  const scroll=document.querySelector('#final-credits-screen .credit-scroll');
  if(scroll){
    const footer=document.createElement('div');
    footer.id='soundtrack-credits72';
    footer.style.cssText='display:flex;flex-direction:column;align-items:center;gap:7px;padding:24px 10px 36px;max-width:720px;';
    const heading=document.createElement('div');
    heading.className='credit-section';heading.textContent='TRILHA MUSICAL — CRÉDITOS E LICENÇAS';
    footer.append(heading);
    const items=[
      ['A Dragon’s Lullaby','Scott Buckley','CC BY 4.0'],
      ['Eyes In The Void','Scott Buckley','CC BY 4.0'],
      ['Penumbra','Scott Buckley','CC BY 4.0'],
      ['Ghost Story','Kevin MacLeod','CC BY 4.0'],
      ['Ambient Horror Track 01','Cleyton Kauffman','CC0'],
      ['Horror Atmosphere','SubspaceAudio / Juhani Junkala','CC0'],
      ['Creepy','TokyoGeisha','CC0'],
      ['A Detuned Memory','Tarush Singhal','CC0'],
      ['Forbidden Space','SkyleTheFrench','CC0'],
      ['Hush Little Baby (interpretação)','TheGloomWorker','CC0']
    ];
    for(const [name,artist,license] of items){
      const item=document.createElement('div');
      item.style.cssText='font-size:12px;line-height:1.5;color:#c6b6a8;text-align:center;';
      item.textContent=name+' — '+artist+' ('+license+')';
      footer.append(item);
    }
    const rights=document.createElement('div');
    rights.style.cssText='font-size:11px;line-height:1.5;color:#ab938b;max-width:580px;text-align:center;margin-top:9px;';
    rights.textContent='Scott Buckley: scottbuckley.com.au — CC BY 4.0; Kevin MacLeod: incompetech.com — CC BY 4.0. As demais faixas foram publicadas sob CC0 em OpenGameArt e Freesound. Faixas reduzidas em duração e convertidas para OGG.';
    footer.append(rights);
    const wish=document.createElement('div');
    wish.style.cssText='font-size:12px;color:#baa8a5;margin-top:14px;line-height:1.6;text-align:center;';
    wish.textContent='Faixa desejada para o encerramento: ';
    const link=document.createElement('a');
    link.href='https://exitmouse.bandcamp.com/album/spare-hearts';
    link.target='_blank';link.rel='noopener noreferrer';
    link.textContent='“Spare Hearts” — Exit Mouse (CatGhost)';
    link.style.cssText='color:#ffcfaf;text-decoration:underline;cursor:pointer;';
    wish.append(link);
    wish.append(document.createTextNode(' · Disponível no Bandcamp. A gravação não foi incluída no jogo sem autorização do titular.'));
    footer.append(wish);
    const thanks=scroll.querySelector('.credit-last');
    if(thanks)scroll.insertBefore(footer,thanks);
    else scroll.append(footer);
    scroll.style.gap='15px';
    scroll.style.animationDuration='78s';
    const sheet=document.createElement('style');
    sheet.textContent='#final-credits-screen:not(.hidden) .credit-scroll{animation-duration:78s!important}';
    document.head.append(sheet);
  }
  window.__soundtrackTest72={
    status:()=>({active,available:[...available],loaded:manifestLoaded,error:manifestError,volumes:Object.fromEntries(Object.entries(players).map(([k,a])=>[k,a.volume]))}),
    cueForState:currentCue,
    tracks:TRACKS
  };
})();