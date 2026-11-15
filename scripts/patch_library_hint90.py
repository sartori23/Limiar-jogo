#!/usr/bin/env python3
"""Teste 90: remove colisões fantasmas sobre o tapete da Biblioteca.
As duas faixas de 'corrimão superior' cruzam área aberta no mapa
e impedem Pietro de atravessar o centro do salão sem que haja obstáculos.
Preserva paredes, escadas, estantes, móveis, personagens e a saída.
Também desloca o aviso de corrida para as DUAS bordas do corredor.
"""
from pathlib import Path
import sys
site=Path(sys.argv[1] if len(sys.argv)>1 else 'site')
p=site/'index.html'
html=p.read_text(encoding='utf8')
ghosts=[
"  {name:'corrimão superior esquerdo',poly:[[110,306],[440,306],[440,335],[110,335]]},\n",
"  {name:'corrimão superior direito',poly:[[516,306],[847,306],[847,335],[516,335]]},\n"]
for shape in ghosts:
    n=html.count(shape)
    if n!=1:raise SystemExit(f'Faixa fantasma não encontrada ou duplicada: {shape[:50]} ({n})')
    html=html.replace(shape,'',1)
# O restante da geometria deve permanecer intacto, incluindo o perímetro.
for expected in ("{name:'mesa da galeria esquerda superior'",
                 "{name:'estante superior esquerda'",
                 "{name:'parede esquerda superior'",
                 "{name:'mesa redonda direita inferior'",
                 'function scene3Can(x,y,withActors=true)'):
    assert expected in html,expected
p.write_text(html,encoding='utf8')

final=site/'finale-teste90.js'
s=final.read_text(encoding='utf8')
old="  hint.innerHTML='CORRA!<small>SHIFT + S / SETA PARA BAIXO</small>';"
new=(
"  hint.innerHTML='<span class=\"hint-side90 hint-left90\">CORRA!"
"<small>SHIFT + S / SETA PARA BAIXO</small></span>'+\n"
"    '<span class=\"hint-side90 hint-right90\">CORRA!"
"<small>SHIFT + S / SETA PARA BAIXO</small></span>';"
)
assert s.count(old)==1, 'Texto do aviso de corrida mudou inesperadamente'
s=s.replace(old,new,1)
css="""
  styles.textContent+=[
    '#final-corridor-hint{left:0!important;right:0!important;top:42%!important;bottom:auto!important;width:100%!important;max-width:none!important;transform:none!important;animation:none!important;display:none!important;height:78px!important}',
    '#final-corridor-hint.visible{display:block!important}',
    '#final-corridor-hint .hint-side90{position:absolute;top:0;display:block;width:23%;text-align:center;animation:finalRunPulse .46s steps(2) infinite}',
    '#final-corridor-hint .hint-left90{left:2%}',
    '#final-corridor-hint .hint-right90{right:2%}',
    '#final-corridor-hint .hint-side90 small{font-size:9px;letter-spacing:.015em;line-height:1.5;white-space:normal}',
    '@media(max-width:720px){#final-corridor-hint .hint-side90{width:28%}#final-corridor-hint .hint-left90{left:0}#final-corridor-hint .hint-right90{right:0}}',
    '@media(max-width:480px){#final-corridor-hint .hint-side90{width:30%;font-size:17px}#final-corridor-hint .hint-side90 small{font-size:8px}}'
  ].join(' ');
"""
anchor="  document.head.appendChild(styles);"
assert s.count(anchor)==1, 'Ponto de inserção CSS não encontrado'
s=s.replace(anchor,css+anchor,1)
final.write_text(s,encoding='utf8')
print('P90 BIBLIOTECA/HINT OK: duas barreiras invisíveis removidas, CORRA visível só nas duas bordas.')
