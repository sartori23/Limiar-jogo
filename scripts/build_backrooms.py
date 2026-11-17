#!/usr/bin/env python3
"""Gera uma página de teste isolada para o easter egg, sem alterar index.html."""
from pathlib import Path
import re
import shutil
import sys
site=Path(sys.argv[1] if len(sys.argv)>1 else 'site')
game=site/'index.html'
src=game.read_text(encoding='utf8')
assert src.count('</body>')==1
assert 'id="ndv-options"' in src and '<title>- niente da vedere -' in src
script=Path(__file__).with_name('backrooms-easteregg.js')
assert script.is_file() and script.stat().st_size>8000
shutil.copy2(script,site/'backrooms-easteregg.js')
# A versão para jogadores permanece estável enquanto a rota secreta é testada.
src=src.replace('</body>','<script src="backrooms-easteregg.js?v=1"></script>\n</body>',1)
assert src.count('backrooms-easteregg.js')==1
(site/'teste-backrooms.html').write_text(src,encoding='utf8')
print('ROTA BACKROOMS: teste-backrooms.html pronto; index.html preservado.')
