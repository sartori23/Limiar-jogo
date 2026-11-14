#!/usr/bin/env python3
"""Teste 89: polimento pontual do final, sem alterar a história.
Aviso CORRA! desaparece após 1,25 s. O perseguidor ganha velocidade
APENAS nos últimos ~400 px antes da captura automática do prólogo.
"""
from pathlib import Path
import sys
root=Path(sys.argv[1] if len(sys.argv)>1 else 'site')
p=root/'finale-teste66.js'
s=p.read_text(encoding='utf8')
changes=[
(
 "    FINALE.manX=480;FINALE.manY=1120;FINALE.nextSong=gameTime;FINALE.said=false;",
 "    FINALE.manX=480;FINALE.manY=1120;FINALE.nextSong=gameTime;FINALE.said=false;\n    FINALE.runHintHideAt=0;",
 "reset do aviso",
),
(
 "    hint.classList.add('visible');songCaption.classList.remove('visible');",
 "    hint.classList.add('visible');FINALE.runHintHideAt=gameTime+1.25;\n    songCaption.classList.remove('visible');",
 "exibição do CORRA por 1.25 s",
),
(
 "    FINALE.elapsed+=dt;muteLabyrinth();",
 "    FINALE.elapsed+=dt;muteLabyrinth();\n    if(FINALE.runHintHideAt>0 && gameTime>=FINALE.runHintHideAt){\n      hint.classList.remove('visible');\n      FINALE.runHintHideAt=0;\n    }",
 "ocultação definitiva do aviso",
),
(
 "        FINALE.manY+=dt*(287+Math.min(58,(gameTime-FINALE.phaseAt)*2.7));",
 "        // Só no último trecho: aceleração para aparecer próximo, sem encurtar a maior parte da fuga.\n        const finalStretch=clamp((FINALE.manY-2080)/360,0,1);\n        const closingSpeedBonus=135*finalStretch;\n        FINALE.manY+=dt*(287+Math.min(58,(gameTime-FINALE.phaseAt)*2.7)+closingSpeedBonus);",
 "velocidade final localizada",
),
(
 "      const h=FINALE.phase==='chase'?209:190,w=103;",
 "      const closingView=FINALE.phase==='chase'?clamp((FINALE.manY-2120)/360,0,1):0;\n      const h=FINALE.phase==='chase'?209+Math.round(13*closingView):190;\n      const w=FINALE.phase==='chase'?103+Math.round(6*closingView):103;",
 "aproximação leve no enquadramento final",
),
(
 "    voice.volume=clamp(.43+.55*(1-distance/4900),.42,.97);",
 "    voice.volume=clamp(.40+.42*(1-distance/4900),.38,.84);",
 "volume da cantiga limitado sem distorção",
),
(
 "    const bob=player.moving?Math.sin(gameTime*(player.sprinting?18:12))*3.4:0;",
 "    const bob=player.moving?Math.sin(gameTime*(player.sprinting?18:12))*1.8:0;",
 "animação do P sem balanço excessivo na fuga",
),
]
for a,b,desc in changes:
  count=s.count(a)
  if count!=1: raise SystemExit(f'Âncora de {desc} ausente ou ambígua ({count})')
  s=s.replace(a,b,1)
p.write_text(s,encoding='utf8')
print('FINAL 89 OK:',', '.join(x[2] for x in changes))
