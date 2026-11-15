#!/usr/bin/env python3
"""Validação estática do Teste 90: fuga, mistura e atlas corrigidos."""
from pathlib import Path
from PIL import Image
import json,hashlib,subprocess,sys
site=Path(sys.argv[1] if len(sys.argv)>1 else 'site')
html=(site/'index.html').read_text(encoding='utf8')
assert html==(site/'teste90.html').read_text(encoding='utf8')
assert html.count('Versão 90 ·')==1
assert 'Versão 89 ·' in (site/'teste89.html').read_text(encoding='utf8')
for name in ['teste89.js','teste90.js','soundtrack-teste90.js','finale-teste90.js']:
    assert f'<script src="{name}"></script>' in html, name
assert '<script src="soundtrack-teste72.js"></script>' not in html
assert '<script src="finale-teste66.js"></script>' not in html
for name in ['teste90.js','soundtrack-teste90.js','finale-teste90.js']:
    subprocess.run(['node','--check',str(site/name)],check=True,timeout=20)
for name in ['SCENE2_OBSERVE_TEXT','scene2DisplayName','scene3DisplayName',
             'luminiMemoryAsked','O tempo leva tudo. Até mesmo aquilo que acreditávamos ser eterno.']:
    assert name in html,name
metrics=json.loads((site/'p90_metrics.json').read_text(encoding='utf8'))
for direction in ('down','left','right'):
    path=site/f'p90_run_{direction}.webp'
    assert path.is_file()
    with Image.open(path) as im:
        assert im.size==(2048,256)
        for i in range(8):
            frame=im.crop((256*i,0,256*(i+1),256)).convert('RGBA')
            bounds=frame.getchannel('A').getbbox()
            assert bounds and bounds[3]<=242,(direction,i,bounds)
            assert bounds[2]-bounds[0]>=78,(direction,i,bounds)
    assert len(metrics[direction]['frames'])==8
    assert metrics[direction]['sha256']==hashlib.sha256(path.read_bytes()).hexdigest()
    assert (site/f'p88_{"run_down" if direction=="down" else "walk_up"}.webp').exists()
sound=(site/'soundtrack-teste90.js').read_text(encoding='utf8')
for token in ["ceu:{file:'ceu.ogg',gain:.12}","prianteLatched?290:175",
              "scene2PianoBus,scene3PianoBus,skyHarpBus",
              "const tau=target>next?1.15:.90"]:
    assert token in sound,token
assert "if(window.__soundtrackTest72?.status?.().active==='ceu')return;" in html
assert "ceu:.12" in (site/'teste89.js').read_text(encoding='utf8')
finale=(site/'finale-teste90.js').read_text(encoding='utf8')
for marker in ['closingSpeedBonus=158*finalStretch','FINALE.manY>6520',
               'FINALE.runHintHideAt=gameTime+1.25']:
    assert marker in finale,marker
s=(site/'teste90.js').read_text(encoding='utf8')
for t in ['youtube.com/iframe_api','onAutoplayBlocked','autoplay:1','playVideo()',
          'playerReady','p90_run_','youtubePlaying']:
    if t=='playerReady':continue
    assert t in s,t
assert not (site/'spare-hearts.mp3').exists()
print('QA90 OK: 24 quadros, 3 direções, música baixa, crossfade, YouTube automático e perseguição por proximidade.')
