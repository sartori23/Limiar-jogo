/* NO LIMIAR DO FINITO — TESTE 96
 * Biblioteca: a terceira cifra surge depois que as três presenças entram
 * em transe e a pronunciam em uníssono. Nenhuma pesquisa é modificada.
 * Céu Dourado e Biblioteca: descrições menos redundantes, preservando
 * identidade e diálogos originais dos personagens.
 */
(()=>{
  'use strict';
  const V=96;
  const OBSERVATIONS_SKY={
    vaniel:'O sorriso aberto acompanha gestos quase teatrais. Entre as nuvens, ele se comporta como se estivesse diante de uma plateia invisível, divertindo-se com cada palavra.',
    meriel:'Junto ao cavalete, mantém os olhos presos à pintura. O pincel se move com liberdade, e o entusiasmo em seu rosto diz mais que qualquer explicação.',
    akiriel:'A espada permanece ao alcance da mão. Seus movimentos são econômicos, mas os ombros tensos denunciam a prontidão de quem espera uma ameaça a qualquer instante.',
    samuel:'Com a cabeça inclinada em oração, ele parece alheio ao que acontece ao redor. A solenidade da postura não consegue esconder a inquietação contida em sua expressão.'
  };
  const OBSERVATIONS_LIBRARY={
    marie:'Vermelho e tons escuros destacam-se em seu traje elegante. A confiança transparece nos gestos expressivos e na maneira intensa com que ocupa o espaço.',
    henry:'As roupas discretas combinam com seus modos contidos. O olhar percorre o salão com cuidado; por trás da expressão reservada, cada detalhe parece ser calculado.',
    percival:'O branco impecável do traje contrasta com a poeira dos livros. As costas eretas e o olhar severo conferem a ele uma formalidade quase cerimonial, difícil de atravessar.'
  };
  for(const [id,value] of Object.entries(OBSERVATIONS_LIBRARY)){
    if(!Object.prototype.hasOwnProperty.call(SCENE3_OBSERVE_TEXT,id))
      throw Error('Personagem ausente da Biblioteca: '+id);
    SCENE3_OBSERVE_TEXT[id]=value;
  }
  const oldAngelDialogue=angelDialogue;
  const angelsObserved=new Set();
  angelDialogue=function(o){
    if(!o || !OBSERVATIONS_SKY[o.id] || angelsObserved.has(o.id))
      return oldAngelDialogue(o);
    angelsObserved.add(o.id);
    // Uma única observação narrativa antecede a conversa original.
    // Não dispara secretamente o contador da cena de Samael.
    showDialogue('P',[OBSERVATIONS_SKY[o.id]],'p',()=>oldAngelDialogue(o));
  };

  const stylesheet=document.createElement('style');
  stylesheet.textContent=[
    '#scene3-transe96{position:absolute;inset:8% 14% auto 14%;z-index:20;pointer-events:none;display:none;align-items:center;justify-content:center;gap:min(3vw,20px);filter:drop-shadow(0 0 25px rgba(183,118,137,.45));}',
    '#scene3-transe96.active{display:flex}',
    '#scene3-transe96 img{width:clamp(50px,10vw,112px);height:clamp(85px,16vw,156px);object-fit:contain;image-rendering:pixelated;opacity:.78;filter:grayscale(.42) drop-shadow(0 0 10px #a36c93);animation:scene3TransePulse96 1.5s ease-in-out infinite alternate}',
    '#scene3-transe96 img:nth-child(2){animation-delay:-.41s;filter:grayscale(.26) drop-shadow(0 0 14px #cf9ca9)}',
    '#scene3-transe96 img:nth-child(3){animation-delay:-.79s}',
    '#scene3-transe96::after{content:"";position:absolute;inset:-8px;z-index:-1;background:radial-gradient(ellipse,rgba(88,51,73,.27),transparent 70%);animation:scene3TransePulse96 1.1s ease-in-out infinite alternate}',
    '@keyframes scene3TransePulse96{from{opacity:.62;transform:translateY(2px) scale(.98)}to{opacity:1;transform:translateY(-4px) scale(1.035)}}',
    '#viewport.scene3-trance-flicker96::before{content:"";position:absolute;inset:0;z-index:18;pointer-events:none;background:radial-gradient(ellipse at center,rgba(111,72,95,.12),transparent 72%);animation:scene3TranseFlash96 1.8s steps(2) infinite}',
    '@keyframes scene3TranseFlash96{0%,85%,100%{opacity:.25}88%{opacity:.85}90%{opacity:.1}}'
  ].join('\n');
  document.head.appendChild(stylesheet);
  const viewport=document.getElementById('viewport');
  const trances=document.createElement('div');
  trances.id='scene3-transe96';trances.setAttribute('aria-hidden','true');
  for(const id of ['marie','henry','percival']){
    const im=document.createElement('img');
    im.alt='';
    // A mesma arte das três presenças já usada na Biblioteca.
    const original=assets['scene3_'+id];
    im.src=original?.src ||
      window.EMBEDDED_ASSETS?.['portrait_scene3_'+id] ||
      window.EMBEDDED_ASSETS?.['scene3_'+id] ||
      'assets/scene3_'+id+'.png';
    trances.appendChild(im);
  }
  viewport.appendChild(trances);

  let tranceCount=0,trancePlaying=false,chorusSounds=0,awards=0;
  function clearTrance(){
    trancePlaying=false;
    trances.classList.remove('active');
    viewport.classList.remove('scene3-trance-flicker96');
  }
  function hum(){
    if(!audioOn||!audioCtx||audioCtx.state!=='running')return;
    // Três timbres quase humanos em uníssono: efeito sonoro original,
    // não é uma gravação de fala, para não inventar vozes dos personagens.
    const t=audioCtx.currentTime;
    const frequencies=[138.6,141.7,145.2];
    for(let i=0;i<3;i++){
      const osc=audioCtx.createOscillator(),filter=audioCtx.createBiquadFilter(),v=audioCtx.createGain();
      osc.type=i===1?'sawtooth':'triangle';
      osc.frequency.setValueAtTime(frequencies[i],t);
      osc.frequency.exponentialRampToValueAtTime(frequencies[i]*.78,t+2.2);
      filter.type='lowpass';filter.frequency.value=440+i*60;
      v.gain.setValueAtTime(.0001,t);
      v.gain.exponentialRampToValueAtTime(.0042,t+.32+i*.1);
      v.gain.exponentialRampToValueAtTime(.0001,t+2.35);
      osc.connect(filter);filter.connect(v);v.connect(audioCtx.destination);
      osc.start(t);osc.stop(t+2.42);
    }
    chorusSounds++;
  }
  function awardDigit(){
    clearTrance();
    clues.arquivo='7';
    awards++;
    playSound('clue');
    updateHUD();
    showDialogue('P',[
      'As três vozes... disseram o mesmo número.',
      'Sete. O terceiro número da porta é 7.'
    ],'p');
  }
  function revealTogether(){
    trancePlaying=true;tranceCount++;
    trances.classList.add('active');
    viewport.classList.add('scene3-trance-flicker96');
    hum();
    // Os nomes só aparecem quando Lumini os apresentou.
    const title=['marie','henry','percival'].map(scene3DisplayName).join(' · ');
    showDialogue(title,[
      'As três presenças param ao mesmo tempo. Seus olhos ficam vazios; nenhuma parece respirar.',
      'As vozes se sobrepõem, primeiro como um sussurro, depois em perfeita sintonia...',
      '“SETE.”'
    ],scene3Portrait('marie'),awardDigit);
  }
  const oldChoose=scene3Choose;
  scene3Choose=function(choice){
    const id=scene3MenuId;
    if(!id || (choice!=='2'&&choice!=='3'))return oldChoose(choice);
    const all=SCENE3_BOOKS.filter(b=>b.owner===id);
    const book=all[choice==='2'?0:1];
    if(!book || !scene3ReadIds.has(book.id))return oldChoose(choice);
    const first=!scene3DiscussedIds.has(book.id);
    const last=first && !scene3DigitAwarded && scene3DiscussedIds.size===5;
    if(!last)return oldChoose(choice);
    const research=SCENE3_RESEARCH[book.id];
    if(!research)return oldChoose(choice);
    scene3MenuId=null;
    scene3DiscussedIds.add(book.id);
    scene3DigitAwarded=true; // impede uma segunda revelação concorrente
    showDialogue(scene3DisplayName(id),research.comment,scene3Portrait(id),()=>{
      updateHUD();
      revealTogether();
    });
  };
  const oldRetry=retry;
  retry=function(full){
    if(full)angelsObserved.clear();
    clearTrance();
    return oldRetry(full);
  };
  window.__teste96={
    status:()=>({
      version:V,
      observedAngels:[...angelsObserved],
      libraryDescriptions:Object.keys(OBSERVATIONS_LIBRARY),
      skyDescriptions:Object.keys(OBSERVATIONS_SKY),
      tranceCount,trancePlaying,chorusSounds,awards,
      thirdDigit:clues.arquivo??null,
      hadAllSixResearchComments:scene3DiscussedIds.size===6,
      musicFrom95B:!!window.__teste95B
    })
  };
})();