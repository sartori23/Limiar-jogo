#!/usr/bin/env python3
"""Teste 91: confirma que exploração só anda, final ainda corre e créditos estão limpos."""
from pathlib import Path
import subprocess,sys
root=Path(sys.argv[1] if len(sys.argv)>1 else 'site')
p=root/'index.html'
s=p.read_text(encoding='utf8')
assert s==(root/'teste91.html').read_text(encoding='utf8')
assert s.count('Versão 91 ·')==1
assert (root/'teste90.html').read_text(encoding='utf8').count('Versão 90 ·')==1
assert '<script src="teste91.js"></script>' in s
for unwanted in ('<script src="teste89.js"></script>','<script src="teste90.js"></script>'):
    assert unwanted not in s, 'player externo não pode aparecer'
assert '<script src="finale-teste90.js"></script>' in s, 'final da versão 90 perdido'
assert '<script src="soundtrack-teste90.js"></script>' in s, 'trilha sonora da versão 90 perdida'
assert s.count('player.sprinting=false;')>=4
assert "player.sprinting=!!l&&(heldKeys.has('shift'));" not in s
assert "player.sprinting=!!length&&heldKeys.has('shift');" not in s
assert "player.sprinting=!!len&&heldKeys.has('shift');" not in s
assert 'Aquelas portas têm números?' not in s
assert 'Correr (somente na perseguição final)' in s
assert 'SHIFT <span>—</span> CORRER' not in s
for script in ['teste91.js','finale-teste90.js','soundtrack-teste90.js']:
    subprocess.run(['node','--check',str(root/script)],check=True,timeout=20)
content=(root/'teste91.js').read_text(encoding='utf8')
for k in ['firstDoorSeen','CANTIGA','singer.currentTime','GQTnh9v2lhs',
          'NoYouTube' if False else 'noYouTubeUI','p90_run_', 'Spare Hearts']:
    assert k in content,k
assert "phase!=='walk'&&!!(heldKeys.has('shift')||FINALE.touchRun)" in (root/'finale-teste90.js').read_text(encoding='utf8')
for name in ('SCENE2_OBSERVE_TEXT','scene2DisplayName','scene3DisplayName',
             'luminiMemoryAsked','O tempo leva tudo. Até mesmo aquilo que acreditávamos ser eterno.'):
    assert name in s,name
print('QA91 OK: só anda em 4 mapas, só corre no final, sem quadro YouTube, legenda e fala após porta.')
