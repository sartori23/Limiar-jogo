#!/usr/bin/env python3
"""Teste 87: integridade das 12 animações aprovadas no jogo atualizado."""
from __future__ import annotations
from pathlib import Path
from PIL import Image
import hashlib, json, subprocess, sys

site=Path(sys.argv[1] if len(sys.argv)>1 else "site")
main=(site/"index.html").read_text(encoding="utf8")
old=(site/"teste85.html").read_text(encoding="utf8")
assert main==(site/"teste87.html").read_text(encoding="utf8")
assert main.count("Versão 87 ·")==1
assert old.count("Versão 85 ·")==1
assert "<script src=\"p87_offsets.js\"></script>" in main
assert "<script src=\"teste87.js\"></script>" in main
assert main.find("teste85.js")<main.find("p87_offsets.js")<main.find("teste87.js")
assert "<script src=\"teste87.js\"></script>" not in old
for token in ["scene1DisplayName","scene2DisplayName","scene3DisplayName",
              "SCENE2_OBSERVE_TEXT","SCENE3_OBSERVE_TEXT",
              "luminiMemoryAsked",
              "O tempo leva tudo. Até mesmo aquilo que acreditávamos ser eterno.",
              "finale-teste66.js","soundtrack-teste72.js",
              "priante-teste76.js","teste79.js","teste85.js"]:
    assert token in main and token in old, "Conteúdo antigo ausente: "+token
manifest=json.loads((site/"p87_manifest.json").read_text(encoding="utf8"))
assert manifest["total"]==12
for mode,count in (("idle",4),("walk",8),("run",8)):
    for direction in ("up","down","left","right"):
        key=mode+"_"+direction
        record=manifest["sprites"][key]
        assert record["frames"]==count
        assert len(record["offsets"])==count
        assert all(abs(dx)<=7 and abs(dy)<=9 for dx,dy in record["offsets"])
        p=site/("p87_"+key+".webp")
        with Image.open(p) as im:
            assert im.size==(256*count,256), str(p)
        assert hashlib.sha256(p.read_bytes()).hexdigest()==record["sha256"]
for name in ("teste87.js","p87_offsets.js"):
    subprocess.run(["node","--check",str(site/name)],check=True,timeout=18)
print("QA87 OK: 12 atlas originais (80 quadros), alinhamento de pés, versão 85 preservada e conteúdo integral intacto.")
