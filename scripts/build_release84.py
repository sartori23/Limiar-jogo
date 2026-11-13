#!/usr/bin/env python3
"""Constrói Testes 80→84 em ordem, preservando snapshots independentes."""
from pathlib import Path
import sys,json
site=Path(sys.argv[1] if len(sys.argv)>1 else 'site')
p=site/'index.html'
html=p.read_text(encoding='utf8')
assert html.count('Versão 79 ·')==1,'A base deve ser o Teste 79 publicado'
assert html.count('</body>')==1,'Marcador final do HTML ausente'
results=[]
for ver in range(80,85):
    prev=ver-1
    script=f'teste{ver}.js'
    assert (site/script).is_file(), 'Falta '+script
    html=html.replace('</body>',f'<script src="{script}"></script>\n</body>',1)
    needle=f'Versão {prev} ·'
    assert html.count(needle)==1,f'Identificação anterior ausente: {needle}'
    html=html.replace(needle,f'Versão {ver} ·',1)
    html=html.replace(f'PRÓLOGO · TESTE {prev} ·',f'PRÓLOGO · TESTE {ver} ·',1)
    html=html.replace(f'<title>No Limiar do Finito — Teste {prev}',
                      f'<title>No Limiar do Finito — Teste {ver}',1)
    out=site/f'teste{ver}.html'
    out.write_text(html,encoding='utf8')
    print(f'TESTE {ver} CONCLUÍDO: {out.stat().st_size} bytes, script {script}',flush=True)
    results.append({'test':ver,'path':out.name,'script':script})
p.write_text(html,encoding='utf8')
(site/'versoes80_84.json').write_text(json.dumps(results,ensure_ascii=False,indent=2),encoding='utf8')
print('TESTE 84 CONSOLIDADO em index.html: todas as cinco versões independentes.',flush=True)
