#!/usr/bin/env python3
"""Teste 87 — instala exatamente os 12 atlas de Pietro aprovados.

Pacote de origem: assets/pietro86_atlases_b64.txt (ZIP de 12 WebPs).
Não recria Pietro, não modifica as cores e não redesenha quadros.
Calcula apenas o deslocamento de renderização para manter cabeça e pés
alinhados entre os quadros sem regravar os pixels.
"""
from __future__ import annotations
from pathlib import Path
from PIL import Image
import base64, hashlib, io, json, sys, zipfile

site=Path(sys.argv[1] if len(sys.argv)>1 else "site")
package=Path(sys.argv[2] if len(sys.argv)>2 else "assets/pietro86_atlases_b64.txt")
if not site.is_dir():
    raise SystemExit(f"Site ausente: {site}")
if not package.is_file():
    raise SystemExit(f"Pacote dos atlas aprovados ausente: {package}")
raw=base64.b64decode("".join(package.read_text(encoding="ascii").split()),validate=True)
with zipfile.ZipFile(io.BytesIO(raw)) as archive:
    names=set(archive.namelist())
    count=0
    offsets={}
    stats={}
    for mode,frames in (("idle",4),("walk",8),("run",8)):
        for direction,view in (("down","front"),("up","back"),("left","left"),("right","right")):
            original=f"Pietro_{mode}_{view}_atlas.webp"
            if original not in names:
                raise SystemExit(f"Sprite aprovado ausente: {original}")
            data=archive.read(original)
            if len(data)<1000 or data[:4]!=b"RIFF" or data[8:12]!=b"WEBP":
                raise SystemExit(f"WEBP de Pietro inválido: {original}")
            with Image.open(io.BytesIO(data)) as source:
                if source.size!=(frames*256,256):
                    raise SystemExit(f"Atlas inesperado {original}: {source.size}")
                image=source.convert("RGBA")
            dest=site/f"p87_{mode}_{direction}.webp"
            dest.write_bytes(data)
            cell_offsets=[]
            for frame_index in range(frames):
                cell=image.crop((frame_index*256,0,(frame_index+1)*256,256))
                mask=cell.getchannel("A")
                bounds=mask.getbbox()
                if not bounds or bounds[3]<185 or bounds[2]-bounds[0]<20:
                    raise SystemExit(f"Quadro incompleto {original} #{frame_index}")
                # A centralização usa APENAS a região do capuz, nunca o cachecol
                # ao vento ou as pernas, que devem oscilar naturalmente.
                top=mask.crop((35,25,221,119))
                hood=top.getbbox()
                if hood:
                    hood_cx=35+(hood[0]+hood[2])/2
                else:
                    hood_cx=(bounds[0]+bounds[2])/2
                shift_x=max(-7,min(7,round(128-hood_cx)))
                # Correção sutil do pé de apoio: nenhum quadro 'flutua'.
                shift_y=max(-9,min(9,238-bounds[3]))
                cell_offsets.append([shift_x,shift_y])
            key=f"{mode}_{direction}"
            offsets[key]=cell_offsets
            stats[key]={"size":len(data),"frames":frames,
                        "sha256":hashlib.sha256(data).hexdigest(),
                        "offsets":cell_offsets}
            count+=1
    if count!=12:
        raise SystemExit(f"Conjunto incompleto: {count}/12")
js="/* Gerado automaticamente: ajuste de apoio dos pés e capuz. */\n"
js+="window.__P87_OFFSETS="+json.dumps(offsets,ensure_ascii=False,separators=(",",":"))+";\n"
(site/"p87_offsets.js").write_text(js,encoding="utf8")
manifest={"sprites":stats,"total":count,"zip_sha256":hashlib.sha256(raw).hexdigest()}
(site/"p87_manifest.json").write_text(json.dumps(manifest,ensure_ascii=False,indent=2),encoding="utf8")
print(f"P87 PRONTO: {count} atlas, {sum(p['frames'] for p in stats.values())} quadros, WEBPs originais preservados")
