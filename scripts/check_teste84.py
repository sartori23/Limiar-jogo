#!/usr/bin/env python3
"""Verifica versões 80–84, trilhas, atlas, progressão e pacotes antes de publicar."""
from pathlib import Path
import json,re,subprocess,sys
root=Path(sys.argv[1] if len(sys.argv)>1 else 'site')
report={'version':84,'checked':[],'music':{},'snapshots':{},'errors':[]}
versions=range(80,85)
for version in versions:
    p=root/f'teste{version}.html'
    assert p.exists(),f'Arquivo de teste {version} ausente'
    html=p.read_text(encoding='utf-8')
    assert len(html)>6_000_000,f'HTML incompleto do Teste {version}'
    assert html.count(f'Versão {version} ·')==1, f'Identificação incorreta do Teste {version}'
    for expected in ('P','Priantes','Lumini','O tempo leva tudo. Até mesmo aquilo que acreditávamos ser eterno.',
                     'SCENE2_OBSERVE_TEXT','SCENE3_OBSERVE_TEXT','luminiMemoryAsked',
                     'scene1DisplayName','scene2DisplayName','scene3DisplayName',
                     'finale-teste66.js','soundtrack-teste72.js','priante-teste76.js','teste79.js'):
        assert expected in html,f'Conteúdo {expected} ausente no Teste {version}'
    srcs=re.findall(r'<script\s+src=["\x27]([^"\x27]+)',html)
    for src in srcs:
        if src.startswith('http'):continue
        assert (root/src).is_file(),f'JavaScript ausente em {version}: {src}'
    for current in range(80,85):
        marker=f'<script src="teste{current}.js"></script>'
        assert (marker in html)==(current<=version),f'Ordem das revisões incorreta: {marker}, versão {version}'
    report['snapshots'][str(version)]={'bytes':p.stat().st_size,'scripts':srcs}
    report['checked'].append(f'HTML {version}: arquivos e progressão preservados')
assert (root/'index.html').read_bytes()==(root/'teste84.html').read_bytes(),'index final diferente do Teste 84'
for mode,n in [('idle',6),('walk',8),('run',12)]:
    for view in ('front','side','back'):
        p=root/f'p79_{mode}_{view}.webp'
        assert p.is_file() and p.stat().st_size>6000,f'Sprite direcional ausente: {p}'
        report['checked'].append(f'Pietro {mode}/{view}')
assert (root/'priante73.webp').stat().st_size>3000
assert (root/'hush-human68.ogg').stat().st_size>12000
manifest=json.loads((root/'soundtrack72/manifest.json').read_text(encoding='utf-8'))
for name in ('menu','limiante','priantes','ceu','cena','biblioteca','lumini','perseguicao','creditos'):
    p=root/'soundtrack72'/f'{name}.ogg'
    assert name in manifest['available'] and p.stat().st_size>10000,f'Trilha ausente: {name}'
    result=subprocess.run(['ffprobe','-v','error','-show_entries','format=duration',
       '-of','default=nokey=1:noprint_wrappers=1',str(p)],
       capture_output=True,text=True,timeout=12,check=True)
    duration=float(result.stdout.strip())
    assert duration>15,f'Trilha muito curta: {name}'
    report['music'][name]={'duration_sec':round(duration,1),'bytes':p.stat().st_size}
report['checked'].append('9 trilhas e cantiga do corredor')
for version in range(80,85):
    p=root/f'teste{version}.js'
    assert p.is_file()
    subprocess.run(['node','--check',str(p)],check=True,timeout=12)
report['checked'].append('JavaScript 80–84 compilável')
for p in ('finale-teste66.js','priante-teste73.js','priante-teste76.js','teste79.js','soundtrack-teste72.js'):
    subprocess.run(['node','--check',str(root/p)],check=True,timeout=12)
report['checked'].append('Código final, Priantes, música e Pietro compiláveis')
js=(root/'priante-teste76.js').read_text(encoding='utf-8')
assert 'floorMaskAround' in js and 'centralizeAtWall' in js
html=(root/'index.html').read_text(encoding='utf-8')
assert '“Ainda não é hora de acordar.”' in (root/'finale-teste66.js').read_text(encoding='utf-8')
assert '“Você não deveria estar aqui.”' in (root/'finale-teste66.js').read_text(encoding='utf-8')
assert 'LUMINI_MEMORY_TOPICS' in html
assert 'showDialogue(scene2DisplayName(id),lines,id)' in html
report['checked'].append('Final, nomes de Lumini e falas da Cena Incompleta')
(root/'relatorio_qa84.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf8')
print('QA84 OK | 5 versões comparáveis | '+str(len(report['checked']))+' verificações | 9 músicas | 9 direções de animação')
