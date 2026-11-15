#!/usr/bin/env python3
"""Teste 90: trilhas com transição gradual, volume baixo no Céu Dourado
e captura no final somente quando perseguidor está fisicamente perto do P.
Aplica-se somente aos arquivos publicados da nova versão.
"""
from pathlib import Path
import sys
site=Path(sys.argv[1] if len(sys.argv)>1 else 'site')

def change(path,old,new,label):
    src=path.read_text(encoding='utf8')
    assert src.count(old)==1,(label,src.count(old))
    path.write_text(src.replace(old,new,1),encoding='utf8')

from shutil import copy2
copy2(site/'soundtrack-teste72.js',site/'soundtrack-teste90.js')
copy2(site/'finale-teste66.js',site/'finale-teste90.js')
music=site/'soundtrack-teste90.js'
change(music,"    ceu:{file:'ceu.ogg',gain:.34},","    ceu:{file:'ceu.ogg',gain:.12},",'volume céu')
change(music,"  let active=null,lastCheck=-999;","  let active=null,lastCheck=-999,prianteLatched=false;",'histerese')
start="""  function nearPriantes(){
    if(!Array.isArray(priantes)||!priantes.length)return false;
    let radiusSq=220*220;
    for(const p of priantes){
      const dx=(p.x||0)-player.x,dy=(p.y||0)-player.y;
      if(dx*dx+dy*dy<radiusSq)return true;
    }
    return false;
  }"""
new="""  function nearPriantes(){
    if(!Array.isArray(priantes)||!priantes.length){
      prianteLatched=false;return false;
    }
    // Entra com 175px, sai com 290px: a troca musical não oscila na borda.
    const radiusSq=(prianteLatched?290:175)**2;
    for(const p of priantes){
      const dx=(p.x||0)-player.x,dy=(p.y||0)-player.y;
      if(dx*dx+dy*dy<radiusSq){prianteLatched=true;return true;}
    }
    prianteLatched=false;
    return false;
  }"""
change(music,start,new,'histerese priantes')
change(music,
 "    for(const bus of [limCalmBus,limTenseBus,scene2PianoBus,scene3PianoBus]){",
 "    for(const bus of [limCalmBus,limTenseBus,scene2PianoBus,scene3PianoBus,skyHarpBus]){",
 'harpa sintetizada')
change(music,
 """      const delta=Math.max(.005,Math.min(.055,dt||.016));
      let next=a.volume;
      const speed=target>next?1.7:2.8;
      next+=(target-next)*Math.min(1,delta*speed);
      if(Math.abs(next-target)<.005)next=target;""",
 """      const delta=Math.max(.005,Math.min(.055,dt||.016));
      let next=a.volume;
      // Crossfade de ~1s; evita cortes abruptos na passagem entre salas.
      const tau=target>next?1.15:.90;
      next+=(target-next)*(1-Math.exp(-delta/tau));
      if(Math.abs(next-target)<.002)next=target;""",
 'crossfade suave')
# A música da sala 1 não deve ser duplicada pela síntese interna.
html=site/'index.html'
change(html,
 "function playHarpPhrase(){\n  if(!audioCtx)return;",
 "function playHarpPhrase(){\n  if(window.__soundtrackTest72?.status?.().active==='ceu')return;\n  if(!audioCtx)return;",
 'harpa duplicada')
# Recupera silêncio em Samael: é controlado pela própria cena.
# A mixagem final é sobrescrita apenas pelo Teste 90, sem alterar 83/89.

final=site/'finale-teste90.js'
change(final,
 "        const finalStretch=clamp((FINALE.manY-2080)/360,0,1);",
 "        const finalStretch=clamp((FINALE.manY-1950)/480,0,1);",
 'início gradual da aproximação final')
change(final,
 "        const closingSpeedBonus=135*finalStretch;",
 "        const closingSpeedBonus=158*finalStretch;",
 'velocidade adicional de ~10% no desfecho')
change(final,
 "        FINALE.manY+=dt*(287+Math.min(58,(gameTime-FINALE.phaseAt)*2.7)+closingSpeedBonus);",
 "        FINALE.manY+=dt*(309+Math.min(58,(gameTime-FINALE.phaseAt)*2.7)+closingSpeedBonus);",
 'perseguidor um pouco mais rápido')
change(final,
 "            || FINALE.manY>2520){beginCapture();}",
 "            || FINALE.manY>6520){beginCapture();}",
 'captura por real proximidade em vez de corte antecipado')
print('P90 AUDIO/FIM OK: Céu -61%, crossfade 0.9–1.15s, Priantes com histerese, captura por proximidade.')
