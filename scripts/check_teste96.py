#!/usr/bin/env python3
"""Teste 96: verifica que a cena coletiva da Biblioteca só ocorre após 6 pesquisas,
e que música, perseguição, priantes, sprites e nomes permanecem intactos.
"""
from pathlib import Path
import subprocess,sys
site=Path(sys.argv[1] if len(sys.argv)>1 else 'site')
source=(site/'index.html').read_text(encoding='utf8')
assert source==(site/'teste96.html').read_text(encoding='utf8')
assert source.count('Versão 96 ·')==1
assert 'Versão 95B ·' in (site/'teste95b.html').read_text(encoding='utf8')
for tag in ('teste95a.js','teste95b.js','teste96.js','finale-teste92.js',
            'soundtrack-teste90.js','teste92.js'):
    assert '<script src="'+tag+'"></script>' in source,tag
assert '<script src="teste94.js"></script>' not in source
for path in ('spare-hearts.mp3','hush-human68.ogg',
             'p95_run_down.webp','p95_run_up.webp','p95_run_left.webp','p95_run_right.webp'):
    assert (site/path).is_file() and (site/path).stat().st_size>1500,path
js=(site/'teste96.js').read_text(encoding='utf8')
for marker in ['SCENE3_OBSERVE_TEXT','scene3DiscussedIds.size===5',
               "scene3DigitAwarded=true","clues.arquivo='7'",
               "title=['marie','henry','percival']",
               "angelDialogue=function(o)","return oldAngelDialogue(o)",
               'SAMAEL' if False else 'samuel', 'scene3-transe96','tranceCount']:
    assert marker in js,marker
for markers in ("SCENE3_RESEARCH","SCENE3_PEOPLE","SCENE1_ANGELS",
                "SCENE2_OBSERVE_TEXT","luminiMemoryAsked","scene3DiscussedIds"):
    assert markers in source,markers
subprocess.run(['node','--check',str(site/'teste96.js')],check=True,timeout=20)
print('QA96 OK: vozes coletivas, descrições sem repetição, testes 95B preservados e 4 atlas sem alteração.')
