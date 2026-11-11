#!/usr/bin/env python3
"""Teste 60: aprimora o movimento de Pietro, o despertar, falas e morte.
Aplica mudanças pontuais ao index.html extraido do pacote original Teste 59.
Nao modifica os recursos, pistas, cenas ou a estrutura do jogo original.
"""
from pathlib import Path
import re
import sys

path = Path(sys.argv[1] if len(sys.argv) > 1 else 'site/index.html')
s = path.read_text(encoding='utf-8')

# Teste 60 - preserve as cenas originais e os recursos do Teste 59.
s = s.replace('Teste 59', 'Teste 60').replace('TESTE 59', 'TESTE 60')
s = s.replace('Versão 57 ·', 'Versão 60 ·')

moving = r'''// TESTE 60 — movimento com passos reais e contato do pé no solo.
// Conserva os atlas e a identidade gráfica do Teste 59. A parte inferior de
// cada quadro move-se em oposição (passo e contrapeso), sem deslizar imóvel.
const P_RENDER_SIZE=78;
const P_ANIMATION_FRAMES={idle:6,walk:8,run:12};
function drawAnimatedP(x,y,size,dir,bob=0){
  const mode=player.moving?(player.sprinting?'run':'walk'):'idle';
  const img=assets['p_'+mode],frames=P_ANIMATION_FRAMES[mode];
  if(!img?.naturalWidth){drawSprite('p',x,y,size,dir,bob);return;}
  const i=mode==='idle'?Math.floor(gameTime*5.6)%frames:Math.floor(player.step*(mode==='run'?1.08:.97))%frames;
  const speed=player.moveBlend||0;
  const phase=(i/frames)*Math.PI*2;
  const sway=mode==='idle'?Math.sin(gameTime*2.15)*.34:Math.cos(phase*2)*(mode==='run'?1.8:.9)*speed;
  const tilt=clamp(player.lean||0,-.039,.039)*speed+(mode==='idle'?Math.sin(gameTime*.83)*.002:Math.sin(phase)*.013*speed);
  const xx=tx(x),yy=ty(y),left=-size/2,top=-size*.9+bob;
  g.save();g.translate(xx,yy+sway);g.rotate(tilt);g.translate(left,top);
  if(dir==='right'){g.translate(size,0);g.scale(-1,1);}
  if(dir==='up')g.filter='brightness(.77) saturate(.88)';
  g.imageSmoothingEnabled=false;
  const sx=i*256;
  if(mode==='idle'||speed<.10){
    g.drawImage(img,sx,0,256,256,0,0,size,size);
  }else{
    // Tronco e capuz permanecem inteiros. As duas pernas possuem passadas opostas.
    const seam=203,step=mode==='run'?18:12,up=mode==='run'?11:8;
    const unit=size/256;
    g.drawImage(img,sx,0,256,seam,0,0,size,seam*unit);
    for(let foot=0;foot<2;foot++){
      const cycle=phase+(foot?Math.PI:0);
      const offset=Math.sin(cycle)*step*speed*unit;
      const lift=Math.max(0,Math.cos(cycle))*up*speed*unit;
      const sourceX=sx+foot*128;
      g.drawImage(img,sourceX,seam,128,256-seam,
        foot*size/2+offset, seam*unit-lift, size/2,size-seam*unit);
    }
  }
  g.restore();
}
'''
s, n = re.subn(r'// TESTE 60 — novos atlas de P:.*?\nconst P_RENDER_SIZE=78;.*?\n(?=function halo\()',moving,s,flags=re.S,count=1)
if n != 1: raise RuntimeError('Nao encontrou drawAnimatedP do Teste 59')

waking = r'''// TESTE 60 — despertar com base física no solo, sem girar no ar.
// As poses passam de deitado a apoiado, ajoelhado e de pé, mantendo o capuz
// e os pés no mesmo ponto de apoio durante toda a transição.
function drawWakeP(x,y){
  const img=assets.p_idle;
  if(!img?.naturalWidth){drawSprite('p',x,y,P_RENDER_SIZE,'down');return;}
  const elapsed=Math.max(0,gameTime-wakeStartTime);
  let pose=0;
  for(let i=1;i<WAKE_CUES.length;i++){if(elapsed>=WAKE_CUES[i])pose=i;}
  wakeFrame=pose;
  const xx=tx(x),yy=ty(y)+1,size=P_RENDER_SIZE;
  const angle=[-1.51,-1.46,-1.37,-1.20,-1.02,-.84,-.65,-.43,-.25,-.13,-.05,0][pose];
  const crouch=[.82,.82,.83,.85,.80,.76,.77,.80,.86,.91,.97,1][pose];
  const bodyW=112*size/256;
  const bodyH=226*size/256*crouch;
  const lowest=(Math.abs(Math.sin(angle))*bodyW+Math.abs(Math.cos(angle))*bodyH)/2;
  g.save();g.imageSmoothingEnabled=false;
  g.fillStyle='rgba(7,4,10,.52)';g.beginPath();g.ellipse(xx,yy+2,pose<5?38:24,5,0,0,Math.PI*2);g.fill();
  // Centralizamos a silhueta recortada no pivô, com sua parte mais baixa no solo.
  g.translate(xx+(pose<4?-10:pose<7?-5:0),yy-lowest+1);
  g.rotate(angle);
  g.drawImage(img,0*256+72,19,112,226,-bodyW/2,-bodyH/2,bodyW,bodyH);
  g.restore();
  if(pose>=3&&pose<=8){
    g.save();g.globalAlpha=.20*(1-pose/12);
    for(let i=0;i<4;i++)fill(g,'#aa8980',xx-20+i*11,yy-2-(i%2),2,2);
    g.restore();
  }
}
'''
s, n = re.subn(r'// TESTE 60 — despertar de P em 12 poses intermediárias, mantendo o mesmo figurino\.\nfunction drawWakeP\(x,y\)\{.*?\n\}(?=\nfunction drawWakeAtmosphere\()',waking.rstrip(),s,flags=re.S,count=1)
if n!=1:raise RuntimeError('Nao encontrou drawWakeP do Teste 59')

# Texto: mostrar caracter a caracter, sem perder as marcas de data e italico.
s = s.replace("let state='start',dialogue=[],dialogIdx=0,", "let dialogChars=0,dialogFull=0,dialogBeepAt=-10;\nlet state='start',dialogue=[],dialogIdx=0,",1)
s = s.replace("  dialogue=lines.map(x=>String(x));dialogIdx=0;dialogueEnd=onFinish;", "  dialogue=lines.map(x=>String(x));dialogIdx=0;dialogueEnd=onFinish;dialogChars=0;dialogBeepAt=-10;",1)
s = s.replace("renderDialogue();setState('dialog');$('dialog-screen').classList.remove('dialog-enter');void $('dialog-screen').offsetWidth;$('dialog-screen').classList.add('dialog-enter');playSound('text');", "renderDialogue();setState('dialog');$('dialog-screen').classList.remove('dialog-enter');void $('dialog-screen').offsetWidth;$('dialog-screen').classList.add('dialog-enter');",1)

new_dialog = r'''// TESTE 60 — digitação progressiva; bipe de texto original (não usa samples).
function renderDialogue(){
  const full=Array.from(dialogue[dialogIdx]||'');
  dialogFull=full.length;
  const raw=full.slice(0,Math.floor(dialogChars)).join('');
  const encoded=raw.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  $('dialog-text').innerHTML=encoded.replace(/\*\*(\d{4})\*\*/g,'<strong class="date-emphasis">$1</strong>').replace(/\*sorriso\*/g,'<em>sorriso</em>');
  const hint=$('dialog-screen').querySelector('.continue');
  if(hint)hint.firstChild.textContent=dialogChars<dialogFull?'ENTER / E — MOSTRAR TEXTO ':'ENTER / E — CONTINUAR ';
}
function playTypingBlip(symbol){
  if(!audioOn||!audioCtx||audioCtx.state!=='running'||!symbol.trim()||/[.,!?;:—…]/.test(symbol))return;
  if(gameTime-dialogBeepAt<.065)return;
  dialogBeepAt=gameTime;
  const speaker=$('speaker').textContent.trim();
  const base=speaker==='P'?365:speaker==='Samael'?190:speaker==='Lumini'?305:330;
  const jitter=((dialogFull+Math.floor(dialogChars)*7)%9-4)*8;
  const t=audioCtx.currentTime,osc=audioCtx.createOscillator(),env=audioCtx.createGain();
  osc.type='square';osc.frequency.setValueAtTime(base+jitter,t);
  env.gain.setValueAtTime(.0001,t);env.gain.exponentialRampToValueAtTime(.010,t+.004);
  env.gain.exponentialRampToValueAtTime(.0001,t+.030);
  osc.connect(env);env.connect(audioCtx.destination);osc.start(t);osc.stop(t+.034);
}
function tickDialogueTypewriter(dt){
  if(state!=='dialog'||dialogChars>=dialogFull)return;
  const before=Math.floor(dialogChars);
  dialogChars=Math.min(dialogFull,dialogChars+dt*48);
  const after=Math.floor(dialogChars);
  if(after>before){
    const s=Array.from(dialogue[dialogIdx]||'');
    const ch=s[after-1]||'';
    if(after%2===0)playTypingBlip(ch);
    renderDialogue();
  }
}
function nextDialogue(){
  if(state!=='dialog')return;
  if(dialogChars<dialogFull){dialogChars=dialogFull;renderDialogue();return;}
  if(dialogIdx<dialogue.length-1){
    dialogIdx++;dialogChars=0;dialogBeepAt=-10;
    if(luminiRevealPending&&dialogIdx===1){
      luminiRevealPending=false;luminiNameKnown=true;
      CHEST_EVENT.name='Lumini · conversar';$('speaker').textContent='Lumini';updateHUD();
    }
    renderDialogue();
  }else{const callback=dialogueEnd;dialogueEnd=null;setState('play');if(callback)callback();}
}
'''
s,n=re.subn(r'function renderDialogue\(\)\{.*?\n\}\nfunction nextDialogue\(\)\{.*?\n\}(?=\nfunction toast\()',lambda m:new_dialog.rstrip(),s,flags=re.S,count=1)
if n!=1:raise RuntimeError('Nao encontrou dialog/nextDialogue')
s=s.replace('function update(dt){gameTime+=dt;', 'function update(dt){gameTime+=dt;tickDialogueTypewriter(dt);',1)

# O ataque dos Priantes deve permanecer ate clique/tap. Nao existe timeout.
s=s.replace("  if(state==='death' && gameTime-nightmareStart>=3.4){\n    retry(false);return true;\n  }", "  if(state==='death'){return true;}",1)
s=s.replace("  $('death-screen').style.setProperty('--nightmare-bg','url('+$('nightmare-priantes').src+')');", "  $('death-screen').style.setProperty('--nightmare-bg','url('+$('nightmare-priantes').src+')');\n  $('death-screen').addEventListener('click',()=>{if(state==='death')retry(false);});",1)
s=s.replace('Até os sonhos mais frágeis se perderam na escuridão.</span>', 'Até os sonhos mais frágeis se perderam na escuridão.</span><span class="death-instruction">CLIQUE OU TOQUE PARA CONTINUAR</span>',1)

style='''\n/* Teste 60: cena de captura permanece ate toque/click. */\n#death-screen{cursor:pointer;touch-action:manipulation}\n#death-screen .death-instruction{display:block;margin-top:18px;letter-spacing:.14em;color:#eed6c8;font:600 11px/1.6 monospace;animation:death-prompt-pulse 1.7s ease-in-out infinite}\n@keyframes death-prompt-pulse{50%{opacity:.38}}\n#dialog-screen .continue{transition:opacity .15s}\n'''
s=s.replace('</style>',style+'</style>',1)

path.write_text(s,encoding='utf-8')
print('Teste 60 preparado:',path, 'bytes:',len(s.encode('utf-8')))
