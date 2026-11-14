#!/usr/bin/env python3
"""Teste 88: corrige escala da vista de costas e transparências da corrida frontal.
Lê os atlases do Teste 87; NÃO modifica os dez restantes nem as mecânicas.
"""
from pathlib import Path
from PIL import Image, ImageDraw
import json,sys,hashlib
site=Path(sys.argv[1] if len(sys.argv)>1 else "site")
metrics={}
for mode,n in (("idle",4),("walk",8)):
    source=Image.open(site/f"p87_{mode}_up.webp").convert("RGBA")
    assert source.size==(256*n,256),f"Tamanho incorreto: {mode}/up"
    output=Image.new("RGBA",(256*n,256))
    before=[];after=[]
    for i in range(n):
        frame=source.crop((256*i,0,256*(i+1),256))
        box=frame.getchannel("A").getbbox()
        if not box:raise SystemExit(f"Quadro de costas vazio: {mode}/{i}")
        before.append(box)
        crop=frame.crop(box)
        # Todas as poses usam o mesmo topo/solo do P frontal:
        # de 22px a 233px, isto é, 211px de altura aparente.
        factor=211/(box[3]-box[1])
        width=min(184,round(crop.width*factor*1.07))
        resized=crop.resize((width,211),Image.Resampling.LANCZOS)
        output.alpha_composite(resized,(256*i+round(128-width/2),22))
        after.append(output.crop((256*i,0,256*(i+1),256)).getchannel("A").getbbox())
    destination=site/f"p88_{mode}_up.webp"
    output.save(destination,"WEBP",lossless=True,method=4)
    metrics[f"{mode}_up"]={"before":before,"after":after,
                          "sha256":hashlib.sha256(destination.read_bytes()).hexdigest()}
source=Image.open(site/"p87_run_down.webp").convert("RGBA")
assert source.size==(2048,256),"Atlas de corrida frontal incorreto"
output=Image.new("RGBA",source.size)
before=[];after=[]
for i in range(8):
    frame=source.crop((i*256,0,(i+1)*256,256))
    before.append(frame.getchannel("A").getbbox())
    under=Image.new("RGBA",(256,256))
    draw=ImageDraw.Draw(under)
    # Camadas escuras ATRÁS do sprite fechado. Elas tapam os recortes
    # indevidos junto ao capuz e ao casaco sem alterar olhos e membros.
    draw.ellipse((95,74,163,132),fill=(21,13,23,255))
    draw.polygon([(103,126),(149,126),(159,153),(156,175),
                  (144,189),(108,183),(97,151)],fill=(33,21,29,255))
    draw.polygon([(110,153),(149,150),(160,184),(153,216),
                  (139,223),(114,210),(102,188)],fill=(35,24,31,255))
    under.alpha_composite(frame)
    # Alinha a bota no mesmo piso da caminhada frontal (y=233).
    output.alpha_composite(under,(i*256,-5))
    after.append(output.crop((i*256,0,(i+1)*256,256)).getchannel("A").getbbox())
destination=site/"p88_run_down.webp"
output.save(destination,"WEBP",lossless=True,method=4)
metrics["run_down"]={"before":before,"after":after,
                     "sha256":hashlib.sha256(destination.read_bytes()).hexdigest()}
assert all(b[1]==22 and b[3]==233 for b in metrics["walk_up"]["after"])
assert all(b[1]==22 and b[3]==233 for b in metrics["idle_up"]["after"])
assert all(b[3]==233 for b in metrics["run_down"]["after"])
(site/"p88_metrics.json").write_text(json.dumps(metrics,indent=2),encoding="utf8")
print("P88 OK: tamanho de costas idêntico nos mapas e oito quadros de corrida frontal reparados.")
