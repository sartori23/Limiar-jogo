#!/usr/bin/env python3
"""Teste 65: nomes das presenças somente depois de Lumini comentar cada memória."""
from pathlib import Path
import sys

path=Path(sys.argv[1] if len(sys.argv)>1 else 'site/index.html')
s=path.read_text(encoding='utf-8')

def replace_once(old,new,label):
    global s
    n=s.count(old)
    if n!=1:
        raise RuntimeError(f'{label}: esperado 1 trecho, encontrado {n}')
    s=s.replace(old,new,1)

replace_once('Versão 64 ·','Versão 65 ·','versão')

replace_once("""  luminiMemoryAsked.add(key);
  showDialogue(luminiSpeaker(),topic.lines(),'mysterious_visitor',showLuminiQuestions);
}""",
"""  // Nomes só se tornam públicos DEPOIS que Lumini termina de falar deles.
  // Antes disso, até mesmo durante sua explicação, os tokens permanecem ???.
  showDialogue(luminiSpeaker(),topic.lines(),'mysterious_visitor',()=>{
    luminiMemoryAsked.add(key);
    showLuminiQuestions();
  });
}""",'conclusão da conversa Lumini')

replace_once("""  showDialogue(d.name,lines,o.id,trigger?startSecretGlitch:null);
}""",
"""  showDialogue(scene1DisplayName(o.id),lines,o.id,trigger?startSecretGlitch:null);
}""",'falas dos anjos')

replace_once("""const SCENE1_PULPIT={kind:'clue',id:'ceu',x:440,y:264,name:'Livro do púlpito'};""",
"""// O título dos anjos é anônimo até Pietro ouvir Lumini falar do Céu Dourado.
function scene1DisplayName(id){return luminiMemoryAsked.has('ceu')?(CONFIG.angels[id]?.name||'???'):'???';}
function scene1NpcPrompt(a){return {...a,name:luminiMemoryAsked.has('ceu')?a.name:'???'};}
const SCENE1_PULPIT={kind:'clue',id:'ceu',x:440,y:264,name:'Livro do púlpito'};""",'rótulos dinâmicos dos anjos')

replace_once("""  if(a.length&&dist(a[0],player)<62)return a[0];
  if(scene1CanReadPulpit())return SCENE1_PULPIT;
  if(Math.hypot(player.x-SCENE1_PAINTING.x,player.y-SCENE1_PAINTING.y)<83)return SCENE1_PAINTING;
  if(a.length)return a[0];""",
"""  if(a.length&&dist(a[0],player)<62)return scene1NpcPrompt(a[0]);
  if(scene1CanReadPulpit())return SCENE1_PULPIT;
  if(Math.hypot(player.x-SCENE1_PAINTING.x,player.y-SCENE1_PAINTING.y)<83)
    return {...SCENE1_PAINTING,name:'A tela de '+scene1DisplayName('meriel')};
  if(a.length)return scene1NpcPrompt(a[0]);""",'indicadores interativos do Céu Dourado')

replace_once("""function inspectPainting(){
  $('painting-image').src=(window.EMBEDDED_ASSETS?.meriel_painting || 'assets/meriel_painting.png');
  setState('painting');""",
"""function inspectPainting(){
  // A autoria da pintura também não antecipa a revelação de Lumini.
  const author=scene1DisplayName('meriel');
  $('painting-screen').querySelector('h2 i').textContent=author;
  $('painting-screen').setAttribute('aria-label','Observar a pintura de '+author);
  $('painting-image').src=(window.EMBEDDED_ASSETS?.meriel_painting || 'assets/meriel_painting.png');
  setState('painting');""",'identificação da pintura')

replace_once("""function scene2DisplayName(_id){return SCENE2_DISPLAY_NAME;}""",
"""function scene2DisplayName(id){return luminiMemoryAsked.has('cena')?(SCENE2_CAST[id]?.name||SCENE2_DISPLAY_NAME):SCENE2_DISPLAY_NAME;}""",'nomes da Cena Incompleta')

replace_once("""  toast(c.name+' foi fixado nesta lembrança.',2);""",
"""  toast(scene2DisplayName(c.id)+' foi fixado nesta lembrança.',2);""",'texto de posicionamento da Cena Incompleta')

replace_once("""function scene3DisplayName(_id){return SCENE3_DISPLAY_NAME;}""",
"""function scene3DisplayName(id){return luminiMemoryAsked.has('biblioteca')?(SCENE3_PEOPLE[id]?.name||SCENE3_DISPLAY_NAME):SCENE3_DISPLAY_NAME;}""",'nomes da Biblioteca')

path.write_text(s,encoding='utf-8')
print('Teste 65: nomes revelados por memória ao concluir a fala de Lumini; rótulos anteriores ficam ???.')
