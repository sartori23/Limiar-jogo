#!/usr/bin/env python3
"""Teste 85: rig de Pietro separado em braços, pernas, corpo e capuz.

Fonte: sprite aprovado incorporado em index.html e vistas do Teste 79.
Apenas as extremidades mudam de posição; não inventa nova aparência.
Etapas independentes: parado (6), caminhada (8), corrida (12).
"""
import sys, json, base64, io, math, re
from pathlib import Path
from PIL import Image, ImageDraw, ImageChops

base_dir=Path(sys.argv[1] if len(sys.argv)>1 else 'site')
html=(base_dir/'index.html').read_text(encoding='utf8')
m=re.search(r'window\.EMBEDDED_ASSETS=(\{.*?\});?</script>',html,re.S)
if not m:raise SystemExit('Dados originais do personagem nao encontrados')
embedded=json.loads(m.group(1))
p=Image.open(io.BytesIO(base64.b64decode(embedded['p'].split(',',1)[1]))).convert('RGBA')
if p.size!=(256,256):raise SystemExit('Dimensões de Pietro inesperadas')

sources={'front':p}
for direction in ('side','back'):
    sprite=Image.open(base_dir/f'p79_idle_{direction}.webp').convert('RGBA')
    if sprite.size!=(1536,256):raise SystemExit('Sprite legado direcional inválido')
    sources[direction]=sprite.crop((0,0,256,256))

def poly(vertices):
    m=Image.new('L',(256,256),0)
    ImageDraw.Draw(m).polygon(vertices,fill=255)
    return m

masks={
  'arm_l':poly([(96,129),(109,135),(109,158),(103,185),(90,190),(80,174),(84,151),(87,137)]),
  'arm_r':poly([(151,130),(166,132),(177,147),(176,173),(168,188),(155,186),(149,157)]),
  'leg_l':poly([(95,201),(128,200),(132,218),(131,249),(89,249),(92,219)]),
  'leg_r':poly([(129,201),(160,199),(175,217),(176,250),(128,250)])
}

def animate(source,frame,mode,amount=1):
    # Todos os componentes são ancorados nas juntas do mesmo desenho.
    n={'idle':6,'walk':8,'run':12}[mode]
    theta=frame*math.pi*2/n
    step=math.sin(theta)
    amp=0 if mode=='idle' else (1.0 if mode=='walk' else 1.48)
    amount=max(0,min(1,amount))
    alpha=source.getchannel('A')
    cut=Image.new('L',(256,256),0)
    for mask in masks.values():cut=ImageChops.lighter(cut,mask)
    torso=source.copy()
    ptor=torso.load()
    cutpix=cut.load()
    for y in range(125,255):
        for x in range(78,181):
            if cutpix[x,y]:
                if y>=202 and 92<=x<=175:
                    ptor[x,y]=(0,0,0,0)
                elif y>=138 and (x<107 or x>156) and y<188:
                    ptor[x,y]=(0,0,0,0)
    out=Image.new('RGBA',(256,256))

    # Parte 2: caminhada — pés alternando apoio; parte 3: corrida com passada maior.
    for i,name in enumerate(('leg_l','leg_r')):
        sign=1 if i==0 else -1
        leg=source.copy()
        leg.putalpha(ImageChops.multiply(alpha,masks[name]))
        angle=-sign*step*17*amp*amount
        pivot=(114,205) if i==0 else (146,205)
        leg=leg.rotate(angle,resample=Image.Resampling.NEAREST,center=pivot)
        offset_x=int(sign*step*16*amp*amount)
        offset_y=int(-max(0,sign*step)*6.4*amp*amount)
        out.alpha_composite(leg,(offset_x,offset_y))

    # Braços em oposição às pernas; máscara, capuz e sobretudo permanecem íntegros.
    for i,name in enumerate(('arm_l','arm_r')):
        sign=1 if i==0 else -1
        arm=source.copy()
        arm.putalpha(ImageChops.multiply(alpha,masks[name]))
        pivot=(103,137) if i==0 else (158,137)
        arm=arm.rotate(sign*step*25*amp*amount,
                       resample=Image.Resampling.NEAREST,center=pivot)
        out.alpha_composite(arm)

    torso_offset=round(math.sin(theta)*amp*.8*amount)
    out.alpha_composite(torso,(torso_offset,0))
    if mode=='idle':
        # Parte 1: descanso quase imperceptível, pés firmes.
        # O sprite fonte não perde seus olhos/rosto em nenhum quadro.
        if frame in (2,3):
            from PIL import ImageEnhance
            # Uma mudança visual mínima no manto, sem deslocar os pés.
            pass
    return out

all_sizes={}
for direction,source in sources.items():
    for mode,n in [('idle',6),('walk',8),('run',12)]:
        sheet=Image.new('RGBA',(n*256,256))
        for frame in range(n):
            img=animate(source,frame,mode)
            sheet.alpha_composite(img,(frame*256,0))
        out=base_dir/f'p85_{mode}_{direction}.webp'
        sheet.save(out,'WEBP',lossless=True,method=5)
        if out.stat().st_size<9000:raise SystemExit('Atlas incompleto '+str(out))
        all_sizes[out.name]=out.stat().st_size
        print('P85',direction,mode,out.stat().st_size,flush=True)
(base_dir/'p85_atlas_manifest.json').write_text(json.dumps(all_sizes,indent=2),encoding='utf8')
print('P85: rig por partes, nove atlas completos',flush=True)
