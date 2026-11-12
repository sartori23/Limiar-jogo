#!/usr/bin/env python3
"""Teste 63: novas conversas condicionais de Lumini, sem alterar as demais cenas."""
from pathlib import Path
import sys
p=Path(sys.argv[1] if len(sys.argv)>1 else "site/index.html")
s=p.read_text(encoding="utf-8")
def change(a,b,tag):
 global s
 if s.count(a)!=1: raise RuntimeError(f"{tag}: encontrado {s.count(a)}, esperado 1")
 s=s.replace(a,b,1)
change("Versão 62 ·","Versão 63 ·","titulo")
change("const luminiAsked=new Set();",
"""const luminiAsked=new Set();
// As perguntas sobre memórias só ficam disponíveis após entrar na respectiva sala.
const luminiMemoryVisited=new Set(),luminiMemoryAsked=new Set();
const LUMINI_MEMORY_TOPICS=[
 {key:'ceu',label:'4 · Sobre o Céu Dourado',lines:()=>[
  'Ah, o Céu Dourado... Então você conheceu Vaniel, Meriel, Akiriel e Samael.',
  'Vaniel prefere contar nuvens. Meriel tem olhos para a arte; Akiriel mantém a espada por perto. E Samael... bem, ele tem seu próprio jeito de encarar as coisas.',
  samuelVisits>=3?'Você parece ter visto um lado menos acolhedor de Samael. Não precisa me contar os detalhes, pequeno Polarium.':'Quatro presenças tão diferentes em um mesmo lugar. Nem tudo o que parece celestial precisa ser compreendido de imediato.'
 ]},
 {key:'cena',label:'5 · Sobre a Cena Incompleta',lines:()=>[
  'Aquela cena quebrada? Os nomes daquelas quatro presenças são Andreas, Johana, Niklaus e Ômega.',
  'Saber os nomes não significa conhecer a história. Cada um ocupa um lugar naquela lembrança, mas não cabe a mim escolher por você.',
  scene2Solved?'Vejo que conseguiu reorganizá-los. Quem diria que uma memória partida ainda guardava tantas peças?':'Talvez você compreenda melhor a cena quando observar onde cada um deveria estar.'
 ]},
 {key:'biblioteca',label:'6 · Sobre a Biblioteca',lines:()=>[
  'Na Biblioteca estavam Marie, Henry e Percival. Três nomes para três maneiras bem diferentes de olhar o mundo.',
  'Marie parece acreditar que ainda pode ajudar alguém. Henry mede as palavras com cuidado. Percival tem aquele olhar de quem não se contenta com os limites que encontra.',
  scene3ReadIds.size>0?'Pelo visto, você também folheou alguns dos registros deles. Livros podem mostrar muito... mas nunca mostram tudo.':'As estantes guardam as pesquisas dos três. Se tiver curiosidade, os próprios registros contam um pouco mais.'
 ]}
];
function luminiUnansweredMemories(){
 return LUMINI_MEMORY_TOPICS.filter(q=>luminiMemoryVisited.has(q.key)&&!luminiMemoryAsked.has(q.key));
}""","estado de Lumini")
change('              <button class="secondary" id="lumini-question-name">3 · Quem é você?</button>',
'''              <button class="secondary" id="lumini-question-name">3 · Quem é você?</button>
              <button class="secondary hidden" id="lumini-memory-ceu">4 · Sobre o Céu Dourado</button>
              <button class="secondary hidden" id="lumini-memory-cena">5 · Sobre a Cena Incompleta</button>
              <button class="secondary hidden" id="lumini-memory-biblioteca">6 · Sobre a Biblioteca</button>''',"botoes")
change(".lumini-questions-screen .lumini-back{align-self:center;min-width:180px;font-size:10px;margin-top:4px}",
""".lumini-questions-screen .lumini-back{align-self:center;min-width:180px;font-size:10px;margin-top:4px}
.lumini-questions-screen{max-height:min(94vh,520px);overflow-y:auto;overscroll-behavior:contain}
.lumini-questions-screen.memory-open .lumini-choices{gap:7px}
.lumini-questions-screen.memory-open .lumini-choices button{padding:10px 14px}""","layout")
change("""function showLuminiQuestions(){
  if(luminiAsked.size>=3){showLuminiFarewell();return;}
  $('lumini-questions-title').textContent=luminiSpeaker();
  $('lumini-questions-screen').setAttribute('aria-label',luminiNameKnown?'Perguntas a Lumini':'Perguntas ao desconhecido');
  $('lumini-questions-status').textContent='Perguntas respondidas: '+luminiAsked.size+' / 3 · Escolha uma pergunta ainda não feita.';
  for(const {key} of LUMINI_QUESTIONS){const b=$('lumini-question-'+key);b.disabled=luminiAsked.has(key);}
  setState('lumini-questions');
}""",
"""function showLuminiQuestions(){
  const memories=luminiUnansweredMemories();
  if(luminiAsked.size>=3&&!memories.length){showLuminiFarewell();return;}
  const screen=$('lumini-questions-screen');
  $('lumini-questions-title').textContent=luminiSpeaker();
  screen.setAttribute('aria-label',luminiNameKnown?'Perguntas a Lumini':'Perguntas ao desconhecido');
  const anyVisited=luminiMemoryVisited.size>0;
  screen.classList.toggle('memory-open',anyVisited);
  $('lumini-questions-status').textContent=anyVisited
    ? 'Perguntas iniciais: '+luminiAsked.size+' / 3 · Memórias comentadas: '+luminiMemoryAsked.size+' / '+luminiMemoryVisited.size+'.'
    : 'Perguntas respondidas: '+luminiAsked.size+' / 3 · Escolha uma pergunta ainda não feita.';
  for(const {key} of LUMINI_QUESTIONS){const b=$('lumini-question-'+key);b.disabled=luminiAsked.has(key);}
  for(const {key} of LUMINI_MEMORY_TOPICS){
    const b=$('lumini-memory-'+key);
    b.classList.toggle('hidden',!luminiMemoryVisited.has(key));
    b.disabled=luminiMemoryAsked.has(key);
  }
  setState('lumini-questions');
}
function askLuminiMemory(key){
  if(state!=='lumini-questions'||!luminiMemoryVisited.has(key)||luminiMemoryAsked.has(key))return;
  const topic=LUMINI_MEMORY_TOPICS.find(q=>q.key===key);
  if(!topic)return;
  luminiMemoryAsked.add(key);
  showDialogue(luminiSpeaker(),topic.lines(),'mysterious_visitor',showLuminiQuestions);
}""","menu de Lumini")
change("if(luminiAsked.size===3)showLuminiFarewell();else showLuminiQuestions();","showLuminiQuestions();","pergunta original")
change("""  if(luminiAsked.size===3)showLuminiFarewell();
  else if(luminiIntroDone)showLuminiQuestions();
  else openLuminiIntroduction();""",
"""  if(luminiIntroDone)showLuminiQuestions();
  else openLuminiIntroduction();""","retorno a Lumini")
change("  scene1Active=true;\n  player={...player,...scene1Spawn()",
"  scene1Active=true;\n  luminiMemoryVisited.add('ceu');\n  player={...player,...scene1Spawn()","entrada 1")
change("  scene2Active=true;scene2FollowId=null;\n  toastExpire=0;",
"  scene2Active=true;scene2FollowId=null;\n  luminiMemoryVisited.add('cena');\n  toastExpire=0;","entrada 2")
change("  scene3Active=true;scene3MenuId=null;\n  scene3PianoLast=-100;",
"  scene3Active=true;scene3MenuId=null;\n  luminiMemoryVisited.add('biblioteca');\n  scene3PianoLast=-100;","entrada 3")
change("luminiIntroDone=false;luminiAsked.clear();CHEST_EVENT.name=",
"luminiIntroDone=false;luminiAsked.clear();luminiMemoryVisited.clear();luminiMemoryAsked.clear();CHEST_EVENT.name=","reinicio")
change("  for(const q of LUMINI_QUESTIONS)$('lumini-question-'+q.key).onclick=()=>askLumini(q.key);",
"""  for(const q of LUMINI_QUESTIONS)$('lumini-question-'+q.key).onclick=()=>askLumini(q.key);
  for(const q of LUMINI_MEMORY_TOPICS)$('lumini-memory-'+q.key).onclick=()=>askLuminiMemory(q.key);""","eventos")
p.write_text(s,encoding="utf-8")
print("Teste 63 atualizado: três novas conversas desbloqueáveis do Lumini")
