#!/usr/bin/env python3
"""Edição pública -niente da vedere-: troca APENAS o menu de abertura.
Execute após release_players.py. Nenhum cenário, sprite ou áudio é reescrito.
"""
from pathlib import Path
import re,sys,shutil
site=Path(sys.argv[1] if len(sys.argv)>1 else 'site')
source=site/'index.html'
s=source.read_text(encoding='utf-8')
assert s.count('id="start-screen"')==1, 'Tela inicial não encontrada'
assert s.count('id="pause-screen"')==1, 'Pause não encontrado'
assert s.count('id="start-btn"')==1, 'Botão original não encontrado'
assert '<script src="teste96.js"></script>' in s, 'Base 96 esperada'
asset=Path(__file__).resolve().parent.parent/'assets'/'menu-niente-da-vedere.webp'
if not asset.is_file():
    raise SystemExit(f'Falta a arte aprovada: {asset} (não publicar menu incompleto)')
shutil.copy2(asset,site/'menu-niente-da-vedere.webp')
menu='''<section id="start-screen" class="start-screen panel" role="dialog" aria-label="- niente da vedere - — menu inicial">
  <h2 class="ndv-visually-hidden">- niente da vedere -</h2>
  <nav class="ndv-main-menu" aria-label="Menu inicial">
    <div class="ndv-divider" aria-hidden="true">✣ ───────── ✣</div>
    <button id="start-btn" class="ndv-button ndv-selected" type="button">JOGAR</button>
    <button id="ndv-continue" class="ndv-button" type="button" disabled title="Disponível após iniciar uma sessão">CONTINUAR</button>
    <button id="ndv-options" class="ndv-button" type="button">OPÇÕES</button>
    <div class="ndv-divider" aria-hidden="true">✣ ───────── ✣</div>
  </nav>
  <section id="ndv-options-panel" class="ndv-options-panel hidden" role="dialog" aria-label="Opções do jogo">
    <h3>OPÇÕES</h3>
    <button id="ndv-option-audio" type="button">ÁUDIO: LIGADO</button>
    <button id="ndv-option-fullscreen" type="button">TELA CHEIA</button>
    <p>WASD / SETAS · MOVER　 SHIFT · CORRER　 E · INTERAGIR　 ESC · PAUSAR</p>
    <button id="ndv-option-back" type="button">VOLTAR</button>
  </section>
</section>'''
start=re.compile(r'<section id="start-screen".*?</section>(?=\s*<section id="dialog-screen")', re.S)
s,count=start.subn(lambda _:menu,s)
assert count==1, f'Esperada uma tela inicial, encontradas {count}'
# Retorno ao menu preserva a sessão em memória (sem prometer salvamento).
# O botão ficará por último, na ordem da composição aprovada.
needle='<button class="secondary" id="pause-restart">RECOMEÇAR JOGO</button>'
assert s.count(needle)==1
s=s.replace(needle,needle+'\n            <button class="secondary" id="ndv-return-menu" type="button">VOLTAR AO MENU</button>',1)
# O painel recolhível substitui a lista de comandos na face principal do Pause.
summary='<summary>COMANDO <span class="command-chevron" aria-hidden="true">⌄</span></summary>'
assert s.count(summary)==1
s=s.replace(summary,'<summary>OPÇÕES <span class="command-chevron" aria-hidden="true">⌄</span></summary>',1)
inner='<div class="pause-commands-grid" aria-label="Comandos do jogo">'
assert s.count(inner)==1
extras='''<div class="ndv-pause-settings">
                <button id="ndv-pause-audio" type="button">ÁUDIO: LIGADO</button>
                <button id="ndv-pause-fullscreen" type="button">TELA CHEIA</button>
              </div>'''
s=s.replace(inner,extras+'\n              '+inner,1)
# As duas faixas são decoração web anterior, não elementos de gameplay.
s,n=re.subn(r'\s*<header class="masthead">.*?</header>', '', s,count=1,flags=re.S)
assert n==1,'Cabeçalho externo não localizado'
s,n=re.subn(r'\s*<div class="footer-left">.*?</div>', '', s,count=1,flags=re.S)
assert n==1,'Faixa inferior esquerda não localizada'
s=s.replace('Fim do Teste 21 · outras memórias permanecem em desenvolvimento',
            'Toda saída deixa algo para trás.',1)
# Identidade visível ao jogador; nomes técnicos internos permanecem intactos.
s=s.replace('<title>No Limiar do Finito — Jogo', '<title>- niente da vedere -',1)
s=s.replace('NO LIMIAR DO <em>FINITO</em>','- niente da <em>vedere -</em>',1)
s=s.replace('UM FRAGMENTO DO UNIVERSO','UMA HISTÓRIA EM LIMIANTE',1)
assert '</head>' in s and '</body>' in s
s=s.replace('</head>','<link rel="stylesheet" href="menu-niente.css">\n</head>',1)
s=s.replace('</body>','<script src="menu-niente.js"></script>\n</body>',1)
source.write_text(s,encoding='utf-8')
for name in ('menu-niente.css','menu-niente.js'):
    shutil.copy2(Path(__file__).resolve().parent/name,site/name)
print('MENU NIENTE OK: cabeçalho e status removidos; pausa gótica, jogo e opções preservados.')
