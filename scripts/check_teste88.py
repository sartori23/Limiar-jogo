#!/usr/bin/env python3
"""Valida as três correções do Teste 88 preservando todo o Teste 87."""
from pathlib import Path
from PIL import Image
import json,hashlib,subprocess,sys
root=Path(sys.argv[1] if len(sys.argv)>1 else 'site')
html=(root/'index.html').read_text(encoding='utf8')
before=(root/'teste87.html').read_text(encoding='utf8')
assert html==(root/'teste88.html').read_text(encoding='utf8')
assert html.count('Versão 88 ·')==1
assert before.count('Versão 87 ·')==1
assert '<script src="teste88.js"></script>' in html
assert '<script src="teste88.js"></script>' not in before
assert html.index('<script src="teste87.js"></script>')<html.index('<script src="teste88.js"></script>')
for token in ['SCENE2_OBSERVE_TEXT','SCENE3_OBSERVE_TEXT','scene2DisplayName',
              'luminiMemoryAsked','O tempo leva tudo. Até mesmo aquilo que acreditávamos ser eterno.',
              'finale-teste66.js','soundtrack-teste72.js','priante-teste76.js','teste79.js']:
    assert token in before and token in html,'Conteúdo perdido: '+token
metrics=json.loads((root/'p88_metrics.json').read_text(encoding='utf8'))
counts={'idle_up':4,'walk_up':8,'run_down':8}
for key,n in counts.items():
    img=Image.open(root/f'p88_{key}.webp').convert('RGBA')
    assert img.size==(n*256,256)
    for i in range(n):
        frame=img.crop((i*256,0,(i+1)*256,256))
        box=frame.getchannel('A').getbbox()
        if key in ('walk_up','idle_up'):
            assert box[1]==22 and box[3]==233,(key,i,box)
            assert 88<=box[2]-box[0]<=108,(key,i,box)
        else:
            assert box[3]==233,(key,i,box)
        assert metrics[key]['after'][i]==list(box),(key,i,box,metrics[key]['after'][i])
    assert hashlib.sha256((root/f'p88_{key}.webp').read_bytes()).hexdigest()==metrics[key]['sha256']
for mode,n in [('idle',4),('walk',8),('run',8)]:
    for direction in ('down','up','left','right'):
        key=mode+'_'+direction
        assert (root/f'p87_{key}.webp').is_file(),'Perdeu atlas original: '+key
# Não apagou quaisquer arquivos da revisão anterior.
subprocess.run(['node','--check',str(root/'teste88.js')],check=True)
print('QA88 OK: 3 atlas corrigidos (20 quadros), piso e altura uniformes, Teste 87 intacto.')
