#!/usr/bin/env python3
"""Teste94: integridade do jogo, asset privado e cantiga sem tradução."""
from pathlib import Path
import subprocess,sys
site=Path(sys.argv[1] if len(sys.argv)>1 else 'site')
html=(site/'index.html').read_text(encoding='utf8')
assert html==(site/'teste94.html').read_text(encoding='utf8')
assert html.count('Versão 94 ·')==1
assert (site/'teste93.html').read_text(encoding='utf8').count('Versão 93 ·')==1
assert '<script src="teste94.js"></script>' in html
for name in ['teste87.js','teste88.js','teste91.js','teste92.js','teste93.js','finale-teste92.js','soundtrack-teste90.js']:
 assert f'<script src="{name}"></script>' in html,name
p=site/'teste94.js'
assert p.is_file()
subprocess.run(['node','--check',str(p)],check=True,timeout=15)
script=p.read_text(encoding='utf8')
for mark in ['limiar-pessoal-94','indexedDB.open','credits-start' if False else 'startCredits',
             'voice.play()','Spare Hearts','function install','installLocal',
             'sprite_'+'' if False else "saveAsset('sprite_'+d","'audio/mpeg'",
             'limiar94-assets',"subtitleUpdate()",'data:image/webp;base64,']:
 assert mark in script,mark
for name in ['hush-human68.ogg','p87_run_down.webp','p87_run_up.webp','p87_run_left.webp','p87_run_right.webp']:
 assert (site/name).is_file() and (site/name).stat().st_size>2500,name
assert not (site/'Spare Hearts.mp3').exists()
for k in ['SCENE2_OBSERVE_TEXT','scene2DisplayName','scene3DisplayName','luminiMemoryAsked',
          'O tempo leva tudo. Até mesmo aquilo que acreditávamos ser eterno.']:
 assert k in html,k
print('QA94 OK: salvamento de imagens/MP3 no navegador, restauração da cantiga e versão pública sem cópia do áudio.')
