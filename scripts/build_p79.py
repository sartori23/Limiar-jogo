#!/usr/bin/env python3
"""Deriva quadros direcionais de Pietro da arte original sem recriar o personagem.
Gera caminhada e corrida vistos de frente, costas e perfil.
"""
import re,sys,json,base64,io
from pathlib import Path
from PIL import Image,ImageDraw
source=Path(sys.argv[1] if len(sys.argv)>1 else 'site/index.html')
dest=Path(sys.argv[2] if len(sys.argv)>2 else 'site')
dest.mkdir(parents=True,exist_ok=True)
html=source.read_text(encoding='utf8')
m=re.search(r'window\.EMBEDDED_ASSETS=(\{.*?\});?</script>',html,re.S)
if not m:raise SystemExit('Imagens originais de Pietro nao encontradas')
data=json.loads(m.group(1))
def transform(original,direction,mode,i):
    img=original.copy()
    if direction=='side':
        canvas=Image.new('RGBA',(256,256))
        canvas.alpha_composite(img.resize((196,256),Image.Resampling.NEAREST),(26,0))
        img=canvas
        d=ImageDraw.Draw(img,'RGBA')
        # Perfil à direita: capuz oculta o olho mais distante.
        d.polygon([(100,83),(111,73),(125,70),(126,106),(112,113),(103,104)],fill=(18,11,19,240))
        d.polygon([(108,78),(123,72),(126,83),(118,100),(108,100)],fill=(47,27,34,230))
        d.polygon([(140,84),(153,90),(158,102),(151,111),(142,108)],fill=(196,164,147,175))
        d.rectangle((145,92,149,101),fill=(237,133,52,232))
        d.rectangle((147,92,149,95),fill=(255,193,95,238))
        d.rectangle((148,95,150,97),fill=(25,16,27,220))
        d.polygon([(113,122),(105,128),(91,131),(96,137),(110,134),(125,136)],fill=(99,35,48,210))
        d.line([(95,134),(110,133),(124,135)],fill=(155,58,74,180),width=2)
        d.polygon([(108,159),(100,177),(98,206),(109,197),(118,171)],fill=(44,30,38,225))
        d.line([(108,164),(102,193)],fill=(116,80,75,220),width=2)
    elif direction=='back':
        d=ImageDraw.Draw(img,'RGBA')
        # Costas reais do capuz: substitui a face frontal por tecido e costuras.
        d.polygon([(98,69),(117,54),(148,54),(169,70),(172,92),(164,118),(145,127),(113,123),(95,106)],fill=(52,33,42,255))
        d.polygon([(104,72),(125,59),(149,61),(161,73),(164,103),(150,116),(116,115),(104,104)],fill=(80,45,54,255))
        d.polygon([(109,74),(124,63),(143,65),(155,76),(158,92),(143,87),(126,91),(109,91)],fill=(96,55,65,210))
        d.line([(128,62),(127,100),(131,112)],fill=(40,21,32,255),width=2)
        d.line([(128,64),(127,99)],fill=(155,94,88,240),width=1)
        for yy in (71,81,91):d.line([(124,yy),(131,yy+2)],fill=(22,12,24,255),width=2)
        d.polygon([(106,113),(126,120),(154,117),(162,111),(162,132),(149,141),(118,143),(106,130)],fill=(99,35,49,253))
        d.line([(111,127),(125,135),(149,134),(157,126)],fill=(160,65,72,245),width=3)
        d.polygon([(118,144),(151,143),(165,188),(159,211),(106,210),(105,184)],fill=(58,37,44,246))
        d.polygon([(115,149),(122,150),(117,195),(112,203),(111,181)],fill=(91,60,61,205))
        d.line([(135,146),(137,207)],fill=(28,17,27,230),width=2)
        d.line([(140,148),(143,206)],fill=(99,65,65,170),width=2)
    if mode!='idle':
        # Duas botas alternam apoio no chão conforme o frame.
        sway=[-5,0,5,0][i%4];lift=[0,-3,0,3][i%4]
        footL=img.crop((98,220,137,251))
        footR=img.crop((138,220,178,251))
        d=ImageDraw.Draw(img);d.rectangle((98,225,178,253),fill=(0,0,0,0))
        if direction=='side':
            img.alpha_composite(footL,(99+sway//2,221+max(0,-lift)))
            img.alpha_composite(footR,(138-sway,221+max(0,lift)))
        else:
            img.alpha_composite(footL,(98+sway//2,220+lift))
            img.alpha_composite(footR,(138-sway//2,220-lift))
    return img
for mode,n in [('idle',6),('walk',8),('run',12)]:
    raw=base64.b64decode(data['p_'+mode].split(',',1)[1])
    source_img=Image.open(io.BytesIO(raw)).convert('RGBA')
    if source_img.size!=(256*n,256):raise SystemExit('Tamanho inesperado: '+mode)
    for direction in ('front','side','back'):
        sheet=Image.new('RGBA',(256*n,256))
        for i in range(n):
            frame=source_img.crop((256*i,0,256*(i+1),256))
            sheet.alpha_composite(transform(frame,direction,mode,i),(256*i,0))
        path=dest/f'p79_{mode}_{direction}.webp'
        sheet.save(path,'WEBP',lossless=True,method=5)
        if path.stat().st_size<6000:raise SystemExit('Atlas pequeno demais: '+str(path))
        print('OK',path.name,path.stat().st_size)
