#!/usr/bin/env python3
"""Teste 91: removes sprint from exploration, corrects opening P monologue,
and excludes the unwanted external video player while keeping soundtrack.
Only touches site/index.html, never earlier test snapshots.
"""
from pathlib import Path
import sys
root=Path(sys.argv[1] if len(sys.argv)>1 else 'site')
p=root/'index.html'
s=p.read_text(encoding='utf8')
def replace_once(old,new,label):
    global s
    n=s.count(old)
    assert n==1, (label,n)
    s=s.replace(old,new,1)

replace_once(
 "      'Tá tão escuro... Alô? Tem alguém? Eu queria ir pra casa...',\n"
 "      'Aquelas portas têm números? Será que alguma delas leva pra fora? Acho que vou olhar... bem devagarinho.'",
 "      'Tá tão escuro... Alô? Tem alguém? Eu queria ir pra casa...'",
 "retira fala sobre portas do despertar"
)
# Movimento comum e três memórias. Nada aqui altera o updateFinal
# do arquivo externo finale-teste90.js.
replace_once("player.sprinting=!!l&&(heldKeys.has('shift'));","player.sprinting=false;","labirinto")
replace_once("player.sprinting=!!length&&heldKeys.has('shift');","player.sprinting=false;","Céu Dourado")
assert s.count("player.sprinting=!!len&&heldKeys.has('shift');")==2,'duas memórias esperadas'
s=s.replace("player.sprinting=!!len&&heldKeys.has('shift');","player.sprinting=false;")
# Esconder referência a SHIFT fora do final, mas mantê-lo como comando na perseguição.
replace_once(
 " <span>·</span> SHIFT <span>—</span> CORRER",
 "",
 "tela inicial"
)
replace_once(
 "                <span>Correr</span><kbd>SHIFT</kbd>",
 "                <span>Correr (somente na perseguição final)</span><kbd>SHIFT</kbd>",
 "painel de comandos"
)
# Remover os dois componentes de 89 e 90 responsáveis pelo player YouTube
# e pelo botão manual. Versões anteriores permanecem disponíveis.
replace_once('<script src="teste89.js"></script>\n','',"remove iframe YouTube 89")
replace_once('<script src="teste90.js"></script>\n','',"remove iframe YouTube 90")
p.write_text(s,encoding='utf8')
print('PATCH91 OK: 4 áreas apenas caminhada; corrida do final intacta; sem player YouTube; P sem spoiler inicial.')
