#!/usr/bin/env python3
"""Etapa A — corrige alinhamento dos 32 frames aprovados na versão online.

Origem: assets/p95_run_{down,up,left,right}.webp no repositório.
Saída: site/p95_run_{down,up,left,right}.webp (8×256px × 256px).
A arte e paleta aprovadas são preservadas; apenas a posição do
personagem dentro de cada quadro é estabilizada para eliminar deslize.
"""
from pathlib import Path
from PIL import Image
import hashlib,sys,json
root=Path(sys.argv[1] if len(sys.argv)>1 else 'site')
src=Path('assets')
manifest={}
for direction in ('down','up','left','right'):
    inp=src/f'p95_run_{direction}.webp'
    assert inp.is_file(),f'Atlas ausente: {inp}'
    image=Image.open(inp).convert('RGBA')
    assert image.size==(2048,256),(direction,image.size)
    out=Image.new('RGBA',(2048,256))
    metrics=[]
    for i in range(8):
        frame=image.crop((i*256,0,(i+1)*256,256))
        alpha=frame.getchannel('A')
        bbox=alpha.point(lambda x:255 if x>20 else 0).getbbox()
        assert bbox,f'Quadro transparente: {direction} {i}'
        center=(bbox[0]+bbox[2])/2
        dx=int(round(128-center))
        # O capuz não deve 'pular': a parte superior fica estável.
        # A posição das botas continua variável, como na arte aprovada.
        desired_top=17 if direction=='down' else 13
        dy=max(-4,min(4,desired_top-bbox[1]))
        fixed=Image.new('RGBA',(256,256))
        fixed.paste(frame,(dx,dy),frame)
        # paste(mask) may produce unwanted pre-multiplied alpha for pixels with
        # partial transparency; alpha_composite preserves the source colors.
        fixed=Image.new('RGBA',(256,256))
        fixed.alpha_composite(frame,(dx,dy))
        out.alpha_composite(fixed,(256*i,0))
        bbox2=fixed.getchannel('A').getbbox()
        assert bbox2 and abs((bbox2[0]+bbox2[2])/2-128)<2.1,(direction,i,bbox2)
        metrics.append({'frame':i,'shift_x':dx,'shift_y':dy,'bbox':bbox2})
    target=root/f'p95_run_{direction}.webp'
    out.save(target,'WEBP',lossless=True,method=5)
    with Image.open(target) as chk:
        assert chk.size==(2048,256),target
    manifest[direction]={
        'size':target.stat().st_size,
        'sha256':hashlib.sha256(target.read_bytes()).hexdigest(),
        'metrics':metrics}
    print('P95 A OK:',direction,target.stat().st_size,'bytes',flush=True)
(root/'p95_manifest.json').write_text(json.dumps(manifest,indent=2),encoding='utf8')
print('P95 A COMPLETO: 32 quadros reais do usuário, corrigidos e publicados no site.')
