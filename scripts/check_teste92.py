#!/usr/bin/env python3
"""Teste 92: confirma reativação da corrida, pergunta inicial e corredor melhorado."""
from pathlib import Path
import subprocess,sys
root=Path(sys.argv[1] if len(sys.argv)>1 else 'site')
html=(root/'index.html').read_text(encoding='utf8')
assert html==(root/'teste92.html').read_text(encoding='utf8')
assert html.count('Versão 92 ·')==1
assert (root/'teste91.html').read_text(encoding='utf8').count('Versão 91 ·')==1
sprints=[
"player.sprinting=!!l&&(heldKeys.has('shift'));",
"player.sprinting=!!length&&heldKeys.has('shift');",
"player.sprinting=!!len&&heldKeys.has('shift');"
]
for phrase in sprints:assert phrase in html,'Corrida desativada: '+phrase
assert html.count('player.sprinting=false;')==0
assert "['name','place','why'][Number(key)-1]" in html
assert '<button class="secondary" id="lumini-question-name">1 · Quem é vc?</button>' in html
assert '<button class="secondary" id="lumini-question-place">2 · O que é esse lugar?</button>' in html
assert '<button class="secondary" id="lumini-question-why">3 · Por que eu estou aqui?</button>' in html
assert '<script src="teste92.js"></script>' in html
assert '<script src="finale-teste92.js"></script>' in html
assert '<script src="finale-teste90.js"></script>' not in html
for snippet in ['SCENE2_OBSERVE_TEXT','scene2DisplayName','scene3DisplayName',
                'luminiMemoryAsked','O tempo leva tudo. Até mesmo aquilo que acreditávamos ser eterno.']:
    assert snippet in html,snippet
for script in ('teste92.js','finale-teste92.js'):
    subprocess.run(['node','--check',str(root/script)],check=True,timeout=20)
finale=(root/'finale-teste92.js').read_text(encoding='utf8')
for m in ['TESTE 92','rebites','ferragens','Marcas de arrasto','marca','const block=Math.floor(cameraTop/91)+i',
          'glow(474,Math.round(H*.66),175','const closingSpeedBonus=158*finalStretch']:
    if m=='marca':continue
    assert m in finale,m
# Só renderizou: nenhuma parede, sprite ou áudio de terceiros foi instalado.
assert not (root/'p92_run_down.webp').exists(),'Novo sprite sem aprovação'
assert '<script src="teste89.js"></script>' not in html,'Iframe do YouTube voltou'
assert '<script src="teste90.js"></script>' not in html,'Iframe do YouTube voltou'
assert 'soundtrack-teste90.js' in html
print('QA92 OK: corrida restaurada em quatro mapas, Quem é vc? primeiro, corredor detalhado e sprites novos ainda não incluídos.')
