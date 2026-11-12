/* Teste 68 — o corredor além da Grande Porta.
   Cena autocontida: não altera memórias, senhas ou objetos do Limiante. */
(() => {
  'use strict';
  const FINALE={
    active:false,phase:'walk',manX:480,manY:1120,elapsed:0,phaseAt:0,
    nextSong:0,catchAt:0,closeAt:0,cameraY:0,touchRun:false,
    torch:0,lampSeen:false,steps:0,lastStep:-1,shiver:0,
    songFirstAt:-1,nextBeat:0,endingAt:0,creditsReached:false,said:false
  };
  const sprite=new Image();
  sprite.src='data:image/png;base64,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';

  // Hush Little Baby.mp3: performance humana de TheGloomWorker, CC0 no Freesound.
  const voice=new Audio(new URL('hush-human68.ogg',document.currentScript?.src||location.href).href);
  voice.loop=true;voice.preload='auto';voice.volume=.11;voice.preservesPitch=false;

  const styles=document.createElement('style');
  styles.textContent=`
    #final-end-screen{position:relative;width:100%;height:100%;max-width:none;max-height:none;
       padding:0;display:flex;flex-direction:column;align-items:center;justify-content:center;
       gap:14px;text-align:center;color:#e8d8d0;background:#050204;overflow:hidden;
       border:0;box-shadow:none}
    #final-end-screen.hidden{display:none!important}
    #final-end-screen:before{content:'';position:absolute;inset:0;pointer-events:none;
       background:radial-gradient(ellipse at 50% 27%,rgba(108,23,23,.23),transparent 55%),
       repeating-linear-gradient(0deg,transparent 0 5px,rgba(255,255,255,.017) 6px 7px)}
    #final-end-screen .ending-eyes{width:110px;height:83px;position:relative;opacity:.78;
      background:radial-gradient(ellipse 11px 7px at 30% 54%,#c61f1a,transparent 90%),
      radial-gradient(ellipse 11px 7px at 70% 54%,#c61f1a,transparent 90%);
      filter:drop-shadow(0 0 14px rgba(204,17,20,.65));animation:finalEyes 4s steps(1,end) infinite}
    #final-end-screen .ending-line{font-family:Georgia,serif;font-size:clamp(23px,4.8vw,43px);
      line-height:1.35;font-weight:normal;letter-spacing:.015em;color:#efe1d5;
      max-width:85%;text-shadow:0 0 23px rgba(150,14,15,.65);animation:finalAppear 2.1s ease-out both}
    #final-end-screen .ending-foot{font-size:10px;letter-spacing:.3em;color:#896c6a;margin-top:10px}
    #final-end-screen button{display:none!important}
    #final-credits-screen{position:relative;width:100%;height:100%;max-width:none;max-height:none;
      background:radial-gradient(ellipse at 50% 42%,#170c14 0%,#070508 65%,#020204 100%);
      border:0;box-shadow:none;overflow:hidden;color:#e8d8c9;display:block;padding:0}
    #final-credits-screen.hidden{display:none!important}
    #final-credits-screen .credit-scroll{position:absolute;top:0;left:0;right:0;
      display:flex;flex-direction:column;align-items:center;text-align:center;gap:23px;
      padding:4rem 2rem 5rem;transform:translateY(15%)}
    #final-credits-screen:not(.hidden) .credit-scroll{animation:finalCredits 36s linear forwards}
    #final-credits-screen .credit-title{font-family:Georgia,serif;font-size:clamp(23px,5vw,46px);
      letter-spacing:.11em;color:#f3e8df;line-height:1.35}
    #final-credits-screen .credit-section{font-size:11px;letter-spacing:.23em;color:#a58c80;margin-top:14px}
    #final-credits-screen .credit-name{font-family:Georgia,serif;font-size:clamp(17px,3vw,26px);color:#e9d5bf}
    #final-credits-screen .credit-last{font-family:Georgia,serif;font-size:18px;
      color:#e6c4b7;font-style:italic;margin-top:25px}
    #final-credits-screen .credits-darkness{position:absolute;inset:0;pointer-events:none;
      background:linear-gradient(#050406 0%,transparent 20%,transparent 78%,#050406 100%)}
    @keyframes finalCredits{from{transform:translateY(15%)}to{transform:translateY(-110%)}}
    @keyframes finalEyes{0%,73%,78%,98%{opacity:.75}75%,97%{opacity:0}}
    @keyframes finalAppear{from{opacity:0;filter:blur(8px)}to{opacity:1;filter:blur(0)}}
    #final-corridor-hint{position:absolute;z-index:21;left:50%;top:auto;bottom:11%;transform:translateX(-50%);
      pointer-events:none;display:none;text-align:center;font-size:clamp(18px,4vw,35px);
      color:#f9e6df;letter-spacing:.22em;font-weight:800;text-shadow:0 3px 12px #a01315,0 0 25px #dd1313;
      animation:finalRunPulse .38s steps(2) infinite}
    #final-corridor-hint small{display:block;margin-top:10px;font-size:11px;letter-spacing:.07em;color:#f2c8c3}
    #final-corridor-hint.visible{display:block}
    @keyframes finalRunPulse{50%{opacity:.53;transform:translateX(-50%) scale(1.035)}}
    #final-song{position:absolute;top:17%;left:0;right:0;text-align:center;z-index:20;display:none;
      color:#c48b65;font-family:Georgia,serif;font-size:16px;letter-spacing:.22em;font-style:italic;
      text-shadow:0 0 11px #f07526a0;pointer-events:none;opacity:.8}
    #final-song.visible{display:block}
    #final-man-speech{position:absolute;top:23%;left:8%;right:8%;display:none;text-align:center;pointer-events:none;z-index:25;font:normal clamp(19px,3.4vw,32px) Georgia,serif;color:#ecd5bf;letter-spacing:.035em;text-shadow:0 0 9px #310607,0 1px 22px #aa2718;animation:finalAppear .75s ease-out both}
    #final-man-speech.visible{display:block}
    #final-run-mobile{display:none;background:#6c1316;color:#fff;touch-action:none;
      border:1px solid #d77e6e;border-radius:12px;padding:14px 17px;font-weight:900;
      box-shadow:0 0 16px rgba(208,37,39,.4)}
    #final-run-mobile.visible{display:inline-flex;align-items:center;justify-content:center}
    @media(pointer:coarse),(max-width:800px){#final-run-mobile.visible{display:inline-flex}}
  `;
  document.head.appendChild(styles);
  const overlay=document.getElementById('overlay');
  const end=document.createElement('section');
  end.id='final-end-screen';end.className='panel hidden';end.setAttribute('role','dialog');
  end.setAttribute('aria-label','Fim do prólogo');
  end.innerHTML='<div class="ending-eyes" aria-hidden="true"></div>'+
    '<div class="ending-line">“Ainda não é hora de acordar.”</div>'+
    '<div class="ending-foot">FIM DO PRÓLOGO · NO LIMIAR DO FINITO</div>'+
    '<div class="ending-foot">VOCÊ NÃO PODE VOLTAR</div>';
  overlay.append(end);
  const credits=document.createElement('section');
  credits.id='final-credits-screen';credits.className='panel hidden';
  credits.setAttribute('role','dialog');credits.setAttribute('aria-label','Agradecimentos finais');
  credits.innerHTML='<div class="credit-scroll">'+
    '<div class="credit-section">UM PRÓLOGO SOBRE O QUE NÃO DEVERIA DESPERTAR</div>'+
    '<div class="credit-title">NO LIMIAR DO FINITO</div>'+
    '<div class="credit-name">LIMIANTE</div>'+
    '<div class="credit-section">CRIAÇÃO E UNIVERSO</div>'+
    '<div class="credit-name">Gabriel Sartori</div>'+
    '<div class="credit-section">MÚSICA DO CORREDOR</div>'+
    '<div class="credit-name">“Hush Little Baby” — TheGloomWorker</div>
    <div class="credit-section">FREESOUND · CC0 · GRAVAÇÃO HUMANA PROCESSADA</div>'+
    '<div class="credit-section">AGRADECIMENTOS</div>'+
    '<div class="credit-name">A todos que caminharam pelo Limiante.</div>'+
    '<div class="credit-name">A todos que ouviram seus ecos.</div>'+
    '<div class="credit-last">Obrigado por jogar.</div>'+
    '<div class="credit-section">FIM DO PRÓLOGO</div>'+
    '</div><div class="credits-darkness"></div>';
  overlay.append(credits);
  const hint=document.createElement('div');hint.id='final-corridor-hint';
  hint.innerHTML='CORRA!<small>SHIFT + S / SETA PARA BAIXO</small>';
  document.getElementById('viewport').append(hint);
  const songCaption=document.createElement('div');songCaption.id='final-song';songCaption.textContent='♪ Hush... little baby... ♪';
  const manSpeech=document.createElement('div');manSpeech.id='final-man-speech';
  manSpeech.setAttribute('aria-live','polite');manSpeech.textContent='“Você não deveria estar aqui.”';
  document.getElementById('viewport').append(manSpeech);
  document.getElementById('viewport').append(songCaption);
  const mobileRun=document.createElement('button');mobileRun.id='final-run-mobile';mobileRun.textContent='CORRER';
  mobileRun.setAttribute('aria-label','Segure para correr no corredor');
  document.getElementById('mobileControls').append(mobileRun);
  const touchRelease=()=>{FINALE.touchRun=false;};
  mobileRun.addEventListener('pointerdown',e=>{e.preventDefault();FINALE.touchRun=true;mobileRun.setPointerCapture?.(e.pointerId);});
  for(const name of ['pointerup','pointercancel','lostpointercapture'])mobileRun.addEventListener(name,touchRelease);
  const oldRender=render,oldUpdate=update,oldEndGame=endGame,oldRetry=retry,
        oldInteract=interact,oldInventory=inventory,oldShowMap=showMap;
  function muteLabyrinth(){
    if(!audioCtx)return;
    const t=audioCtx.currentTime;
    for(const b of [limCalmBus,limTenseBus,ambientGain,scene2PianoBus,scene3PianoBus]){
      if(b?.gain)b.gain.setTargetAtTime(0,t,.04);
    }
  }
  function enterFinalCorridor(){
    FINALE.active=true;FINALE.phase='walk';FINALE.elapsed=0;FINALE.phaseAt=gameTime;
    FINALE.manX=480;FINALE.manY=1120;FINALE.nextSong=gameTime;FINALE.said=false;
    FINALE.catchAt=0;FINALE.closeAt=0;FINALE.lampSeen=false;
    FINALE.cameraY=6170;FINALE.steps=0;FINALE.lastStep=-1;FINALE.touchRun=false;
    FINALE.songFirstAt=-1;FINALE.nextBeat=0;FINALE.creditsReached=false;FINALE.endingAt=0;
    voice.pause();voice.currentTime=0;
    player={...player,x:480,y:6600,dir:'up',vx:0,vy:0,step:0,moving:false,sprinting:false,lean:0,moveBlend:0};
    camera.x=0;camera.y=FINALE.cameraY;
    heldKeys.clear();muteLabyrinth();
    document.getElementById('location').textContent='Além da Grande Porta';
    document.getElementById('status').textContent='SÓ OS SEUS PASSOS';
    document.getElementById('prompt').classList.add('hidden');
    hint.classList.remove('visible');songCaption.classList.remove('visible');manSpeech.classList.remove('visible');
    mobileRun.classList.remove('visible');
    setState('play');
    // Apenas os passos: o portão já ficou para trás.
  }
  function finalNote(frequency,at,duration,volume){
    const a=audioCtx;
    const osc=a.createOscillator(),filter=a.createBiquadFilter(),gain=a.createGain();
    const vib=a.createOscillator(),vibDepth=a.createGain();
    osc.type='sawtooth';osc.frequency.setValueAtTime(frequency,at);
    filter.type='lowpass';filter.frequency.value=620;filter.Q.value=.9;
    vib.type='sine';vib.frequency.value=4.7;vibDepth.gain.value=frequency*.008;
    vib.connect(vibDepth);vibDepth.connect(osc.frequency);
    gain.gain.setValueAtTime(.0001,at);
    gain.gain.exponentialRampToValueAtTime(Math.max(.001,volume),at+.16);
    gain.gain.setTargetAtTime(Math.max(.001,volume*.48),at+duration*.52,.22);
    gain.gain.exponentialRampToValueAtTime(.0001,at+duration+.35);
    osc.connect(filter);filter.connect(gain);gain.connect(a.destination);
    osc.start(at);osc.stop(at+duration+.38);
    vib.start(at);vib.stop(at+duration+.38);
  }
  function singLullaby(){
    if(!FINALE.active||!audioOn){voice.pause();return;}
    if(FINALE.songFirstAt<0)FINALE.songFirstAt=gameTime;
    const distance=Math.hypot(player.x-FINALE.manX,player.y-FINALE.manY);
    voice.volume=clamp(.12+.72*(1-distance/3150),.07,.82);
    if(voice.paused)voice.play().catch(()=>{});
    FINALE.nextSong=gameTime+1.4;
  }
  function heartbeat(){
    if(!audioOn)return;
    soundSetup();if(!audioCtx)return;
    const t=audioCtx.currentTime;
    for(const [offset,volume] of [[0,.085],[.22,.052]]){
      const o=audioCtx.createOscillator(),en=audioCtx.createGain();
      o.type='sine';o.frequency.setValueAtTime(76,t+offset);
      o.frequency.exponentialRampToValueAtTime(41,t+offset+.18);
      en.gain.setValueAtTime(.0001,t+offset);
      en.gain.exponentialRampToValueAtTime(volume,t+offset+.014);
      en.gain.exponentialRampToValueAtTime(.0001,t+offset+.22);
      o.connect(en);en.connect(audioCtx.destination);o.start(t+offset);o.stop(t+offset+.24);
    }
  }
  function beginConfront(){
    if(FINALE.phase!=='walk')return;
    FINALE.phase='confront';FINALE.phaseAt=gameTime;FINALE.said=true;
    FINALE.manX=player.x;FINALE.manY=player.y-175;
    player.vx=0;player.vy=0;player.moving=false;player.sprinting=false;player.dir='up';
    voice.pause();songCaption.classList.remove('visible');
    manSpeech.classList.add('visible');
    // A legenda sempre aparece; a fala usa voz pt-BR quando disponível no navegador.
    if(audioOn&&'speechSynthesis' in window){
      try{
        window.speechSynthesis.cancel();
        const u=new SpeechSynthesisUtterance('Você não deveria estar aqui.');
        u.lang='pt-BR';u.pitch=.38;u.rate=.73;u.volume=.95;
        const vs=window.speechSynthesis.getVoices();
        u.voice=vs.find(v=>v.lang.toLowerCase().startsWith('pt')&&/male|masculin|homem/i.test(v.name))
          ||vs.find(v=>v.lang.toLowerCase().startsWith('pt'))||null;
        window.speechSynthesis.speak(u);
      }catch(_){}
    }
  }
  function beginFear(){
    if(FINALE.phase!=='confront' && FINALE.phase!=='walk')return;
    manSpeech.classList.remove('visible');
    FINALE.phase='fear';FINALE.phaseAt=gameTime;
    FINALE.manY=player.y-210;FINALE.manX=player.x;
    hint.classList.add('visible');songCaption.classList.remove('visible');
    mobileRun.classList.add('visible');
    FINALE.shiver=2.5;
    FINALE.nextBeat=gameTime;
    voice.playbackRate=.90;
    if(audioOn)playSound('fail');
  }
  function beginCapture(){
    if(FINALE.phase==='caught')return;
    FINALE.phase='caught';FINALE.phaseAt=gameTime;FINALE.catchAt=gameTime;
    hint.classList.remove('visible');songCaption.classList.remove('visible');manSpeech.classList.remove('visible');
    mobileRun.classList.remove('visible');heldKeys.clear();FINALE.touchRun=false;
    player.moving=false;player.sprinting=false;player.vy=0;
    voice.pause();voice.currentTime=0;
    if(audioOn){playSound('death');}
  }
  function updateFinal(dt){
    FINALE.elapsed+=dt;muteLabyrinth();
    if(state==='final-end'){
      if(!FINALE.creditsReached&&gameTime-FINALE.endingAt>=5.4){
        FINALE.creditsReached=true;setState('final-credits');
      }
      return;
    }
    if(state==='final-credits')return;
    if(state!=='play')return;
    if(FINALE.phase==='caught'){
      if(gameTime-FINALE.catchAt>1.75){FINALE.endingAt=gameTime;setState('final-end');muteLabyrinth();}
      return;
    }
    if(FINALE.phase==='confront'){
      player.moving=false;player.sprinting=false;player.vx=0;player.vy=0;
      if(gameTime-FINALE.phaseAt>4.1)beginFear();
      return;
    }
    let dx=(heldKeys.has('d')||heldKeys.has('arrowright')?1:0)-(heldKeys.has('a')||heldKeys.has('arrowleft')?1:0);
    let dy=(heldKeys.has('s')||heldKeys.has('arrowdown')?1:0)-(heldKeys.has('w')||heldKeys.has('arrowup')?1:0);
    if(dx||dy){const m=Math.hypot(dx,dy);dx/=m;dy/=m;}
    const sprint=FINALE.phase!=='walk'&&!!(heldKeys.has('shift')||FINALE.touchRun);
    const speed=FINALE.phase==='walk'?145:sprint?260:153;
    const transition=1-Math.exp(-dt*11);
    player.vx+=(dx*speed-player.vx)*transition;
    player.vy+=(dy*speed-player.vy)*transition;
    const ox=player.x,oy=player.y;
    player.x=clamp(player.x+player.vx*dt,398,561);
    player.y=clamp(player.y+player.vy*dt,850,6820);
    if(Math.abs(dx)>Math.abs(dy))player.dir=dx>0?'right':'left';
    else if(dy)player.dir=dy>0?'down':'up';
    player.moving=Math.hypot(player.x-ox,player.y-oy)>.13;
    player.sprinting=player.moving&&sprint;
    player.moveBlend+=(Number(player.moving)-player.moveBlend)*(1-Math.exp(-dt*12));
    player.lean+=(clamp(player.vx/250,-1,1)*.024-player.lean)*(1-Math.exp(-dt*9));
    const traveled=Math.hypot(player.x-ox,player.y-oy);
    player.step+=traveled/19;
    if(Math.floor(player.step)>FINALE.lastStep){
      FINALE.lastStep=Math.floor(player.step);
      if(player.moving&&audioOn)playSound('step');
    }
    if(FINALE.phase==='walk'){
      FINALE.torch=clamp((4350-player.y)/1950,0,1);
      if(player.y<4030){
        songCaption.classList.add('visible');
        if(gameTime>=FINALE.nextSong)singLullaby();
      }else songCaption.classList.remove('visible');
      if(player.y<1525&&(FINALE.songFirstAt<0||gameTime-FINALE.songFirstAt>=14||player.y<1345))beginConfront();
    }else{
      FINALE.torch=1;
      if(gameTime>=FINALE.nextSong)singLullaby();
      if(gameTime>=FINALE.nextBeat){heartbeat();FINALE.nextBeat=gameTime+(FINALE.phase==='fear'?.87:.57);}
      if(FINALE.phase==='fear'&&gameTime-FINALE.phaseAt>2.05){FINALE.phase='chase';FINALE.phaseAt=gameTime;}
      if(FINALE.phase==='chase'){
        FINALE.manY+=dt*(287+Math.min(58,(gameTime-FINALE.phaseAt)*2.7));
        FINALE.manX+=(player.x-FINALE.manX)*Math.min(1,dt*1.65);
        if((Math.abs(FINALE.manY-player.y)<91&&Math.abs(FINALE.manX-player.x)<68)
            || FINALE.manY>2520){beginCapture();}
      }
    }
    if(!audioOn&& !voice.paused)voice.pause();
    if(FINALE.phase==='chase'){voice.volume=.78;voice.playbackRate=.83;}
    const viewTarget=player.y-435;
    FINALE.cameraY+=(viewTarget-FINALE.cameraY)*(1-Math.exp(-dt*5.3));
    camera.x=0;camera.y=FINALE.cameraY;
    document.getElementById('prompt').classList.add('hidden');
    document.getElementById('location').textContent='O corredor sem fim';
    document.getElementById('status').textContent=FINALE.phase==='walk'?'SÓ OS SEUS PASSOS':'NÃO OLHE PARA TRÁS';
  }
  function glow(x,y,r,color,intensity=1){
    const rg=g.createRadialGradient(x,y,5,x,y,r);
    rg.addColorStop(0,color.replace('ALPHA',String(.7*intensity)));
    rg.addColorStop(.32,color.replace('ALPHA',String(.3*intensity)));
    rg.addColorStop(1,color.replace('ALPHA','0'));
    g.fillStyle=rg;g.fillRect(x-r,y-r,2*r,2*r);
  }
  function renderFinal(){
    g.save();g.clearRect(0,0,W,H);g.fillStyle='#030407';g.fillRect(0,0,W,H);
    if(FINALE.phase==='caught'){
      g.fillStyle='#070304';g.fillRect(0,0,W,H);
      const t=gameTime-FINALE.catchAt;
      const size=400+t*500;
      if(sprite.complete&&sprite.naturalWidth){
        g.save();g.imageSmoothingEnabled=false;g.globalAlpha=.83;
        g.drawImage(sprite,27,7,63,73,W/2-size*.5,H/2-size*.36,size,size*1.23);
        g.restore();
      }
      g.fillStyle='rgba(154,8,11,'+(.16+.11*Math.sin(gameTime*36))+')';g.fillRect(0,0,W,H);
      g.restore();return;
    }
    const cameraTop=FINALE.cameraY;
    const flicker=.88+.12*Math.sin(gameTime*23)+.04*Math.sin(gameTime*49);
    const cX=480;
    // Reto, sem desvios ou portas: paredes de pedra e sombras repetidas.
    g.fillStyle='#101014';g.fillRect(270,0,420,H);
    g.fillStyle='#17171a';g.fillRect(330,0,300,H);
    for(let j=-2;j<15;j++){
      const world=Math.floor(cameraTop/65)*65+j*65,y=Math.round(world-cameraTop);
      g.fillStyle= j%3===0?'#232127':'#1c1c21';g.fillRect(334,y,292,1);
      g.fillStyle='rgba(4,4,6,.32)';g.fillRect(330,y+13,300,3);
      for(let i=0;i<3;i++){
        const xx=336+i*95+((Math.floor(world/65)&1)*27);
        g.fillStyle='rgba(69,58,60,.15)';g.fillRect(xx,y+19,2,31);
      }
    }
    g.fillStyle='#0a0b10';g.fillRect(274,0,54,H);g.fillRect(632,0,54,H);
    for(let i=-2;i<12;i++){
      const wy=Math.floor(cameraTop/95)*95+i*95,py=Math.round(wy-cameraTop);
      g.fillStyle='#29262a';g.fillRect(292,py+4,36,5);g.fillRect(632,py+4,36,5);
      g.fillStyle='#222024';g.fillRect(299,py+15,24,17);g.fillRect(637,py+15,24,17);
      g.fillStyle='#0b0b0f';g.fillRect(326,py,7,96);g.fillRect(627,py,7,96);
    }
    g.fillStyle='#020306';g.fillRect(0,0,274,H);g.fillRect(686,0,W-686,H);
    // A única luz do percurso vem de sua lamparina.
    let manY=FINALE.manY-cameraTop;
    if(FINALE.torch>.04 && manY<20){
      g.save();g.globalCompositeOperation='screen';
      glow(480,12,155,'rgba(233,102,31,ALPHA)',FINALE.torch*.35*flicker);
      g.restore();
    }
    if(FINALE.torch>.01 && manY>-320&&manY<H+300){
      g.save();g.globalCompositeOperation='screen';
      glow(FINALE.manX+26,manY-73,260,'rgba(239,99,22,ALPHA)',FINALE.torch*flicker);
      glow(FINALE.manX+26,manY-75,105,'rgba(255,177,61,ALPHA)',FINALE.torch*.85);
      g.restore();
    }
    if(FINALE.torch>.16 && manY>-250 && manY<H+190 && sprite.complete&&sprite.naturalWidth){
      const bob=Math.sin(gameTime*(FINALE.phase==='chase'?13:2.3))*(FINALE.phase==='chase'?3:1.5);
      const h=FINALE.phase==='chase'?209:190,w=103;
      g.save();g.imageSmoothingEnabled=false;
      g.globalAlpha=Math.min(1,FINALE.torch*1.9);
      g.drawImage(sprite,FINALE.manX-w/2,manY-h+14+bob,w,h);g.restore();
      g.save();g.globalCompositeOperation='screen';
      glow(FINALE.manX+16,manY-104+bob,75,'rgba(255,143,40,ALPHA)',.43*FINALE.torch*flicker);
      g.restore();
    }
    // O jogador mal enxerga o piso sob os próprios pés.
    const px=player.x,py=player.y-cameraTop;
    g.save();g.globalCompositeOperation='screen';
    glow(px,py-12,140,'rgba(65,82,117,ALPHA)',.46);g.restore();
    g.fillStyle='rgba(4,3,6,.65)';g.beginPath();g.ellipse(px,py+4,20,6,0,0,Math.PI*2);g.fill();
    const bob=player.moving?Math.sin(gameTime*(player.sprinting?18:12))*3.4:0;
    drawAnimatedP(player.x,player.y,P_RENDER_SIZE,player.dir,bob);
    // A visão se fecha como um túnel. Nenhuma pista do mundo anterior é visível.
    const dark=g.createRadialGradient(480,330,65,480,275,525);
    dark.addColorStop(0,'rgba(0,0,0,0)');
    dark.addColorStop(.46,'rgba(0,0,0,.32)');
    dark.addColorStop(1,'rgba(0,0,0,.98)');
    g.fillStyle=dark;g.fillRect(0,0,W,H);
    if(FINALE.phase==='fear'||FINALE.phase==='chase'){
      const elapsed=gameTime-FINALE.phaseAt;
      const blink=FINALE.phase==='fear'?(Math.sin(elapsed*8.2)>.42?.30:0):Math.sin(gameTime*12)>.92?.11:0;
      g.fillStyle='rgba(210,210,213,'+blink+')';g.fillRect(0,0,W,H);
      if(FINALE.phase==='chase'){
        const urgency=clamp(1-Math.abs(FINALE.manY-player.y)/420,0,1);
        g.fillStyle='rgba(124,13,17,'+(.035+urgency*.1+Math.abs(Math.sin(gameTime*10))*.045)+')';
        g.fillRect(0,0,W,H);
      }
    }
    g.restore();
  }
  endGame=function(){if(state==='play'&&!FINALE.active)enterFinalCorridor();};
  render=function(){if(FINALE.active)return renderFinal();return oldRender();};
  update=function(dt){
    if(FINALE.active){gameTime+=dt;updateFinal(dt);return;}
    return oldUpdate(dt);
  };
  retry=function(full=false){
    if(FINALE.active&&(FINALE.phase==='caught'||state==='final-end'||state==='final-credits'))return;
    voice.pause();voice.currentTime=0;voice.playbackRate=1;
    FINALE.active=false;FINALE.touchRun=false;FINALE.phase='walk';
    hint.classList.remove('visible');songCaption.classList.remove('visible');mobileRun.classList.remove('visible');
    return oldRetry(full);
  };
  interact=function(){if(FINALE.active)return;return oldInteract();};
  inventory=function(){if(FINALE.active)return;return oldInventory();};
  showMap=function(){if(FINALE.active)return;return oldShowMap();};
  // Útil também para testes automatizados, sem atalho exposto ao jogador.
  window.__finaleTest66={enter:enterFinalCorridor,state:()=>({...FINALE,playerY:player.y,playerX:player.x,gameState:state})};
  window.__finaleTest67={enter:enterFinalCorridor,state:()=>({...FINALE,playerY:player.y,gameState:state,voicePlaying:!voice.paused}),voice};
  window.__finaleTest68={enter:enterFinalCorridor,state:()=>({...FINALE,playerY:player.y,gameState:state,voicePlaying:!voice.paused}),voice};
})();
