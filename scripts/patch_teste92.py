#!/usr/bin/env python3
"""Teste 92: restaura corrida normal e coloca "Quem é vc?" em primeiro lugar.
Os sprites da corrida NOVOS não são instalados: aguardam aprovação visual.
Mantém a revisão narrativa, legendas e os créditos limpos do Teste 91.
"""
from pathlib import Path
import sys
root=Path(sys.argv[1] if len(sys.argv)>1 else 'site')
p=root/'index.html'
s=p.read_text(encoding='utf8')
sprint=[
"player.sprinting=!!l&&(heldKeys.has('shift'));",
"player.sprinting=!!length&&heldKeys.has('shift');",
"player.sprinting=!!len&&heldKeys.has('shift');",
"player.sprinting=!!len&&heldKeys.has('shift');",
]
assert s.count("player.sprinting=false;")==4, 'Esperadas quatro limitações de corrida no Teste 91'
for phrase in sprint:
    assert phrase not in s,'Corrida já restabelecida antes do Teste 92'
for phrase in sprint:
    s=s.replace('player.sprinting=false;',phrase,1)
assert s.count('player.sprinting=false;')==0, 'Corrida ainda limitada'

def single(old,new,why):
    global s
    assert s.count(old)==1,(why,s.count(old))
    s=s.replace(old,new,1)

single(
'''              <button class="secondary" id="lumini-question-place">1 · O que é esse lugar?</button>
              <button class="secondary" id="lumini-question-why">2 · Por que eu estou aqui?</button>
              <button class="secondary" id="lumini-question-name">3 · Quem é você?</button>''',
'''              <button class="secondary" id="lumini-question-name">1 · Quem é vc?</button>
              <button class="secondary" id="lumini-question-place">2 · O que é esse lugar?</button>
              <button class="secondary" id="lumini-question-why">3 · Por que eu estou aqui?</button>''',
'ordem das perguntas de Lumini'
)
single(
"if(!e.repeat&&['1','2','3'].includes(key))askLumini(['place','why','name'][Number(key)-1]);",
"if(!e.repeat&&['1','2','3'].includes(key))askLumini(['name','place','why'][Number(key)-1]);",
'atalhos do menu de Lumini'
)
single(
''' <span>·</span> ESC <span>—</span> PAUSAR''',
''' <span>·</span> SHIFT <span>—</span> CORRER <span>·</span> ESC <span>—</span> PAUSAR''',
'dica de comando restaurada'
)
single(
'''                <span>Correr (somente na perseguição final)</span><kbd>SHIFT</kbd>''',
'''                <span>Correr</span><kbd>SHIFT</kbd>''',
'comando de corrida restaurado'
)
p.write_text(s,encoding='utf8')
print('TESTE 92 PROGRESSÃO OK: corrida restaurada em todos os mapas; Lumini começa por Quem é vc?')
