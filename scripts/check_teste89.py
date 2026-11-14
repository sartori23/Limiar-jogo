#!/usr/bin/env python3
"""Verificação das melhorias de final e das dependências de música — Teste 89."""
from pathlib import Path
import sys,subprocess,json
site=Path(sys.argv[1] if len(sys.argv)>1 else 'site')
html=(site/'index.html').read_text(encoding='utf8')
assert html==(site/'teste89.html').read_text(encoding='utf8')
assert html.count('Versão 89 ·')==1
assert (site/'teste88.html').is_file()
assert (site/'teste87.html').is_file()
assert (site/'teste88.html').read_text(encoding='utf8').count('Versão 88 ·')==1
assert '<script src="teste88.js"></script>' in html
assert '<script src="teste89.js"></script>' in html
for k in ['teste87.js','teste88.js','teste89.js']:
    assert (site/k).is_file()
    subprocess.run(['node','--check',str(site/k)],check=True,timeout=20)
for k in ['p88_idle_up.webp','p88_walk_up.webp','p88_run_down.webp']:
    assert (site/k).is_file() and (site/k).stat().st_size>2000,k
finale=(site/'finale-teste66.js').read_text(encoding='utf8')
for required in ['FINALE.runHintHideAt=gameTime+1.25','gameTime>=FINALE.runHintHideAt',
                 'FINALE.manY-2080','closingSpeedBonus=135*finalStretch',
                 '209+Math.round(13*closingView)','voice.volume=clamp(.40+.42']:
    assert required in finale, f'Correção ausente no final: {required}'
assert "|| FINALE.manY>2520" in finale, 'Condição original de captura perdida'
script=(site/'teste89.js').read_text(encoding='utf8')
for token in ['GQTnh9v2lhs','youtube-nocookie.com/embed/','Ouvir Spare Hearts',
              'Buck Riley / Exit Mouse','creditos.gain=0','testes']:
    if token=='testes':continue
    assert token in script,token
# A música de terceiro não é gravada no pacote de arquivos do jogo.
assert not (site/'spare-hearts.mp3').exists()
for name in ['scene1DisplayName','scene2DisplayName','scene3DisplayName',
             'SCENE2_OBSERVE_TEXT','luminiMemoryAsked',
             'O tempo leva tudo. Até mesmo aquilo que acreditávamos ser eterno.']:
    assert name in html,name
print('QA89 OK: Teste 88 preservado; aviso 1,25 s; perseguidor só no fim; YouTube oficial e créditos sem cópia do áudio.')
