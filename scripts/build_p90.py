#!/usr/bin/env python3
"""Teste 90: higieniza os 24 quadros aprovados da corrida de Pietro.

Origem: p87_run_{down,left,right}.webp. Não redesenha, não recorta braços,
não altera caminhada/pose/parado. Remove pixels isolados e fecha frestas de
1-2px na alfa sem criar polígonos grandes que distorçam o sobretudo.
"""
from pathlib import Path
from PIL import Image,ImageFilter
from collections import deque
import json,hashlib,sys

root=Path(sys.argv[1] if len(sys.argv)>1 else 'site')
metrics={}
for direction in ('down','left','right'):
    source=Image.open(root/f'p87_run_{direction}.webp').convert('RGBA')
    assert source.size==(2048,256),direction
    sheet=Image.new('RGBA',source.size)
    stats=[]
    for idx in range(8):
        fr=source.crop((idx*256,0,(idx+1)*256,256)).copy()
        pixels=fr.load()
        alpha=fr.getchannel('A')
        mask=alpha.point(lambda a:255 if a>=15 else 0)
        # Conserva toda a silhueta principal; somente microfrestas são fechadas.
        closed=mask.filter(ImageFilter.MaxFilter(3)).filter(ImageFilter.MinFilter(3))
        m=bytearray(1 if val>=128 else 0 for val in closed.getdata())
        visited=bytearray(len(m))
        pieces=[]
        for offset,v in enumerate(m):
            if not v or visited[offset]:continue
            visited[offset]=1
            queue=deque([offset]);part=[]
            while queue:
                k=queue.popleft();part.append(k)
                x,y=k%256,k//256
                for xx,yy in ((x-1,y),(x+1,y),(x,y-1),(x,y+1),
                              (x-1,y-1),(x+1,y-1),(x-1,y+1),(x+1,y+1)):
                    if xx<0 or xx>=256 or yy<0 or yy>=256:continue
                    j=yy*256+xx
                    if m[j] and not visited[j]:
                        visited[j]=1;queue.append(j)
            pieces.append(part)
        # Descarta apenas resíduos menores que 25 pixels; as extremidades
        # da capa, botas e pontas do cachecol são preservadas.
        discarded=0
        for part in pieces:
            if len(part)>=24:continue
            discarded+=len(part)
            for k in part:m[k]=0
        filled=0
        for y in range(256):
            for x in range(256):
                k=y*256+x
                R,G,B,A=pixels[x,y]
                if not m[k]:
                    if A:pixels[x,y]=(R,G,B,0)
                    continue
                if A>=15:continue
                # Novo píxel de borda: copiar a cor da vizinhança local,
                # nunca colocar blocos pretos artificiais.
                nearest=None
                for radius in (1,2,3):
                    for yy in range(max(0,y-radius),min(256,y+radius+1)):
                        for xx in range(max(0,x-radius),min(256,x+radius+1)):
                            rr,gg,bb,aa=pixels[xx,yy]
                            if aa>180:
                                nearest=(rr,gg,bb);break
                        if nearest:break
                    if nearest:break
                if nearest:
                    pixels[x,y]=(*nearest,210)
                    filled+=1
        sheet.alpha_composite(fr,(idx*256,0))
        bb=fr.getchannel('A').getbbox()
        assert bb and bb[1]>=18 and bb[3]<=242,(direction,idx,bb)
        assert bb[2]-bb[0]>=78,(direction,idx,bb)
        stats.append({'frame':idx,'removed_isolated_pixels':discarded,'filled_seams':filled,'bounds':bb})
    destination=root/f'p90_run_{direction}.webp'
    sheet.save(destination,'WEBP',lossless=True,method=4)
    assert destination.stat().st_size>5000
    metrics[direction]={'frames':stats,'sha256':hashlib.sha256(destination.read_bytes()).hexdigest()}
(root/'p90_metrics.json').write_text(json.dumps(metrics,ensure_ascii=False,indent=2),encoding='utf8')
print('P90 SPRITES OK: 24 quadros de corrida limpos; 9 atlas anteriores preservados.')
