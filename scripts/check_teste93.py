#!/usr/bin/env python3
"""Teste 93: integrity and public/private-media boundary checks."""
from pathlib import Path
import subprocess,sys
site=Path(sys.argv[1] if len(sys.argv)>1 else 'site')
html=(site/'index.html').read_text(encoding='utf8')
assert html==(site/'teste93.html').read_text(encoding='utf8')
assert html.count('Versão 93 ·')==1
assert (site/'teste92.html').read_text(encoding='utf8').count('Versão 92 ·')==1
assert '<script src="teste93.js"></script>' in html
for v in ('teste87.js','teste88.js','teste91.js','teste92.js','finale-teste92.js'):
 assert f'<script src="{v}"></script>' in html, v
assert '<script src="teste89.js"></script>' not in html
assert '<script src="teste90.js"></script>' not in html
assert "player.sprinting=!!l&&(heldKeys.has('shift'));" in html
for marker in ('SCENE2_OBSERVE_TEXT','luminiMemoryAsked',
               'O tempo leva tudo. Até mesmo aquilo que acreditávamos ser eterno.'):
 assert marker in html
sub=(site/'teste93.js').read_text(encoding='utf8')
for marker in ("data:image/webp;base64,","credits-start","credits-stop",
               "audio-playing","approvedSpritesLoaded","subtitle.querySelector('small')?.remove()",
               "limiarHorrorWarning93","Spare Hearts — Exit Mouse"):
 assert marker in sub,marker
subprocess.run(['node','--check',str(site/'teste93.js')],check=True,timeout=15)
assert not list(site.glob('*spare*mp3')), 'MP3 do usuário não pode ficar público'
print('QA93 OK: motor completo, corrida ativa, sprite privado via launcher e música sem player.')
