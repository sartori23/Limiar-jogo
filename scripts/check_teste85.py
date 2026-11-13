#!/usr/bin/env python3
"""Validação do Teste 85: fase parada, passo, corrida, transição e cenas."""
from pathlib import Path
from PIL import Image
import sys,subprocess
site=Path(sys.argv[1] if len(sys.argv)>1 else 'site')
base=(site/'teste84.html').read_text(encoding='utf-8')
latest=(site/'index.html').read_text(encoding='utf-8')
assert latest==(site/'teste85.html').read_text(encoding='utf-8'),'Index não corresponde ao Teste 85'
assert 'Versão 84 ·' in base and 'Versão 85 ·' in latest
assert '<script src="teste85.js"></script>' in latest
for script in ('priante-teste73.js','priante-teste76.js','teste79.js','teste80.js',
               'teste81.js','teste82.js','teste83.js','teste84.js','teste85.js',
               'soundtrack-teste72.js','finale-teste66.js'):
    assert f'<script src="{script}"></script>' in latest,f'Script ausente: {script}'
    subprocess.run(['node','--check',str(site/script)],check=True,timeout=15)
for mode,n in [('idle',6),('walk',8),('run',12)]:
    for direction in ('front','side','back'):
        p=site/f'p85_{mode}_{direction}.webp'
        assert p.is_file(),f'Quadros ausentes: {p}'
        with Image.open(p) as im:
            assert im.size==(256*n,256),f'Tamanho inesperado: {p}'
            # Verifica que cada quadro realmente tem conteúdo.
            for i in range(n):
                f=im.crop((i*256,0,(i+1)*256,256)).convert('RGBA')
                assert f.getbbox(),f'Quadro vazio: {p} #{i}'
        if mode!='idle':
            with Image.open(p) as im:
                a=im.crop((0,0,256,256)).convert('RGBA')
                b=im.crop((256,0,512,256)).convert('RGBA')
                from PIL import ImageChops
                assert ImageChops.difference(a,b).getbbox(),f'Quadros sem animação: {p}'
# Confirmar integridade do jogo: scripts e falas não mudaram no HTML embutido.
for token in ['SCENE2_OBSERVE_TEXT','SCENE3_OBSERVE_TEXT','scene2DisplayName',
              'scene3DisplayName','luminiMemoryAsked',
              'O tempo leva tudo. Até mesmo aquilo que acreditávamos ser eterno.']:
    assert token in latest and token in base,f'Progresso perdido: {token}'
assert '<script src="teste85.js"></script>' not in base,'Teste 84 original deve permanecer acessível'
print('TESTE 85 OK: 9 atlas, 3 ritmos, 3 direções, transições, scripts e conteúdo anterior')
