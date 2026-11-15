#!/usr/bin/env python3
"""Acabamento da edição pública do jogo. Não altera a lógica das cenas."""
from pathlib import Path
import re
import sys

site=Path(sys.argv[1] if len(sys.argv)>1 else "site")
p=site/"index.html"
s=p.read_text(encoding="utf-8")
assert s.count("Versão 96 ·")==1, "A edição pública precisa ser gerada a partir do Teste 96"
assert s.count("</head>")==1 and s.count("</body>")==1

def replace_once(old, new, label):
    global s
    count=s.count(old)
    if count != 1:
        raise SystemExit(f"{label}: esperado 1 trecho, encontrados {count}")
    s=s.replace(old,new,1)

# Só o jogo público muda: teste96.html permanece como referência técnica.
replace_once("<title>No Limiar do Finito — Teste 96", "<title>No Limiar do Finito — Jogo", "Título da página")
replace_once("PRÓLOGO · TESTE 96 ·", "UM PRÓLOGO ·", "Cabeçalho público")
replace_once("Versão 96 · Limiante · Céu Dourado · A Cena Incompleta · Biblioteca",
             "LIMIANTE · TRÊS MEMÓRIAS · UMA SAÍDA", "Rodapé da abertura")
replace_once("INICIAR O PRÓLOGO <span>↗</span>", "JOGAR <span>↗</span>", "Botão jogar")
replace_once("UM PEQUENO RELATO FORA DO TEMPO", "UMA HISTÓRIA FORA DO TEMPO", "Subtítulo da abertura")
replace_once("O LABIRINTO<br><i>ENTRE O QUE RESTOU</i>",
             "NO LIMIAR<br><i>DO FINITO</i>", "Título principal da abertura")

# A estrutura de perguntas e a progressão de Lumini continuam intactas.
replace_once("    'Se deseja respostas, pequeno Polarium, concederei três. Escolha com cuidado.'",
             "    'Não espere encontrar todas as respostas aqui, pequeno Polarium.'",
             "Fala de Lumini sobre três perguntas")
replace_once("Escolha três perguntas. Cada resposta será dada uma única vez.",
             "Escolha o que deseja perguntar.", "Mensagem de Lumini")
replace_once("'Perguntas respondidas: '+luminiAsked.size+' / 3 · Escolha uma pergunta ainda não feita.'",
             "'Escolha o que deseja perguntar.'", "Status inicial de Lumini")
replace_once("'Perguntas iniciais: '+luminiAsked.size+' / 3 · Memórias comentadas: '+luminiMemoryAsked.size+' / '+luminiMemoryVisited.size+'.'",
             "'Escolha o que deseja perguntar. · Memórias comentadas: '+luminiMemoryAsked.size+' / '+luminiMemoryVisited.size+'.'",
             "Status de memórias de Lumini")

# O PAUSE da versão para jogadores não apresenta teleporte nem controles
# de QA. Removemos também seus handlers para que os botões ausentes não
# causem erro em init(). O reinício normal permanece disponível.
teleport_ids=("sky","gate","scene2","scene3")
for tid in teleport_ids:
    pattern=rf'<button class="secondary" id="pause-{tid}">[^<]*</button>'
    s,count=re.subn(pattern,"",s)
    if count != 1:
        raise SystemExit(f"Botão de teleporte {tid}: esperado 1, encontrados {count}")
    handler=rf"(?m)^  \\$('pause-{tid}')\\.onclick=.*\\n"
    # Escapa o seletor literal e remove exclusivamente a linha do handler.
    handler=re.compile(r"(?m)^  "+re.escape("$('pause-"+tid+"').onclick=")+r"[^\\n]*\\n")
    s,count=handler.subn("",s)
    if count != 1:
        raise SystemExit(f"Handler de teleporte {tid}: esperado 1, encontrados {count}")
replace_once('<button class="secondary" id="pause-restart">RECOMEÇAR TESTE</button>',
             '<button class="secondary" id="pause-restart">RECOMEÇAR JOGO</button>',
             "Reinício normal do jogo")
for tid in teleport_ids:
    assert f'pause-{tid}' not in s, f"Controle de teste ainda presente: {tid}"
assert 'RECOMEÇAR TESTE' not in s
assert "$('pause-restart').onclick=()=>retry(true)" in s
assert "$('resume-btn').onclick=()=>setState('play')" in s

# Aparência: apenas as superfícies externas e a abertura; não encosta
# no canvas, sprites, música, diálogos, atlas ou no gameplay.
css=r"""
<style id="player-release-style">
:root{--release-gold:#d9b98c;--release-crimson:#a84d58}
body{background:#08080c}
.backdrop{background:
 radial-gradient(ellipse at 50% -10%,rgba(96,48,67,.18),transparent 55%),
 radial-gradient(ellipse at 100% 90%,rgba(78,46,72,.11),transparent 48%),
 #08080c!important}
.masthead{border-bottom:1px solid rgba(215,174,141,.14);padding-bottom:14px}
.masthead .brand h1{letter-spacing:.065em;text-shadow:0 2px 28px rgba(163,64,79,.22)}
.masthead .edition{font-size:10px;letter-spacing:.14em;color:#a997a4}
.game-wrap{box-shadow:0 28px 100px rgba(0,0,0,.56),0 0 0 1px rgba(205,153,141,.10)}
#start-screen:not(.hidden){position:relative;isolation:isolate;overflow:hidden;
 width:min(760px,94%);max-height:min(96%,850px);padding:clamp(24px,5vh,52px) clamp(20px,5vw,56px)!important;
 border:1px solid rgba(197,142,135,.45)!important;
 background:linear-gradient(152deg,rgba(30,20,31,.98),rgba(9,9,17,.985) 72%)!important;
 box-shadow:0 28px 85px rgba(0,0,0,.78),inset 0 1px rgba(236,191,157,.16),0 0 45px rgba(113,37,63,.16)!important;
 border-radius:4px;overflow-y:auto}
#start-screen:not(.hidden)::before{content:"";position:absolute;z-index:-1;inset:-32%;
 background:radial-gradient(ellipse at 50% 23%,rgba(154,70,85,.20),transparent 38%),
 radial-gradient(circle at 50% 76%,rgba(126,78,92,.07),transparent 43%);
 pointer-events:none}
#start-screen .start-rune{color:#cda68c;filter:drop-shadow(0 0 15px #ab5472);
 animation:releaseBreath 4.7s ease-in-out infinite alternate}
#start-screen .meta-label{letter-spacing:.25em;color:#bd9f9c}
#start-screen h2{font-family:Georgia,'Times New Roman',serif!important;
 line-height:1.06!important;letter-spacing:.035em!important;
 font-size:clamp(31px,5vw,64px)!important;text-wrap:balance;
 color:#f1e7df!important;text-shadow:0 6px 30px rgba(0,0,0,.48)}
#start-screen h2 i{color:var(--release-gold)!important;font-weight:400}
#start-screen p{max-width:510px;line-height:1.85!important;color:#c8b8ba!important}
#start-btn{min-width:min(295px,100%);padding:16px 28px!important;
 background:linear-gradient(110deg,#6d293d,#a34f54 75%,#b66759)!important;
 border:1px solid #c27f78!important;box-shadow:0 9px 30px rgba(109,37,58,.3);
 color:#fff5ec!important;letter-spacing:.18em!important;transition:transform .2s,box-shadow .2s,filter .2s}
#start-btn:hover,#start-btn:focus-visible{transform:translateY(-2px);
 filter:brightness(1.12);box-shadow:0 13px 35px rgba(143,47,70,.42)}
#start-screen .start-controls{margin-top:10px;line-height:1.9;color:#a99ca7}
#start-screen .start-footnote{color:#b39b94;letter-spacing:.12em;line-height:1.6}
#lumini-questions-screen .micro{letter-spacing:.16em;color:#bba0ad}
#lumini-questions-status{color:#d7c5d6!important}
#lumini-questions-screen button:focus-visible,#start-btn:focus-visible{
 outline:2px solid #e3c69b;outline-offset:3px}
@keyframes releaseBreath{from{opacity:.70;transform:scale(.96)}to{opacity:1;transform:scale(1.06)}}
@media(max-width:620px){
 .masthead{gap:9px;flex-wrap:wrap}
 .masthead .edition{font-size:9px}
 #start-screen:not(.hidden){width:96%;padding:22px 17px!important}
 #start-screen .start-controls{font-size:9px!important}
 #start-btn{width:100%}
}
@media(prefers-reduced-motion:reduce){
 #start-screen .start-rune{animation:none}
 #start-btn{transition:none}
}
</style>
"""
s=s.replace("</head>",css+"\n</head>",1)
assert 'TESTE 96' not in re.search(r'<header class="masthead">.*?</header>',s,re.S).group(0)
assert 'Escolha três perguntas' not in s
p.write_text(s,encoding="utf-8")
print("Edição pública preparada: visual final, menu JOGAR e Lumini sem anúncio de limite de três perguntas.")
