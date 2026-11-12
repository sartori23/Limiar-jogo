#!/usr/bin/env python3
"""Teste 73: devolve as falas de Andreas, Johana, Niklaus e Ômega
depois da observação de Pietro; preserva os nomes ocultos até Lumini.
"""
from pathlib import Path
import sys
p=Path(sys.argv[1] if len(sys.argv)>1 else 'site/index.html')
s=p.read_text(encoding='utf-8')
old="""  if(which==='listen'){
    showDialogue(scene2DisplayName(id),[SCENE2_OBSERVE_TEXT[id]||'A presença permanece imóvel diante de você.'],id);
    return;
  }"""
new="""  if(which==='listen'){
    // Primeiro P descreve a aparência. Ao avançar, a presença diz a frase
    // definida originalmente para ela. O nome continua ??? até Lumini revelar.
    showDialogue('P',[SCENE2_OBSERVE_TEXT[id]||'A presença permanece imóvel diante de você.'],'p',()=>{
      const lines=SCENE2_CAST[id]?.lines||[];
      if(lines.length)showDialogue(scene2DisplayName(id),lines,id);
    });
    return;
  }"""
if s.count(old)!=1:
    raise SystemExit(f'Trecho da observação não encontrado exatamente uma vez (total: {s.count(old)}).')
s=s.replace(old,new,1)
# Verifica que as quatro falas seguem no jogo; não as reinventa nem modifica.
for phrase in [
 'Conheça o Fogo do meu Ódio',
 'O mundo já estava uma merda antes de mim.',
 'Se der merda, a gente finge que foi de propósito.',
 'O tempo leva tudo. Até mesmo aquilo que acreditávamos ser eterno.'
]:
 if phrase not in s:
    raise SystemExit('Fala original ausente: '+phrase)
if s.count('Versão 72 ·')!=1:raise SystemExit('Versão 72 não encontrada.')
s=s.replace('Versão 72 ·','Versão 73 ·',1)
s=s.replace('PRÓLOGO · TESTE 72 ·','PRÓLOGO · TESTE 73 ·')
s=s.replace('<title>No Limiar do Finito — Teste 72','<title>No Limiar do Finito — Teste 73')
marker='<script src="soundtrack-teste72.js"></script>'
if s.count(marker)!=1:raise SystemExit('Ponto de inclusão dos novos Priantes ausente.')
s=s.replace(marker,marker+'\n<script src="priante-teste73.js"></script>',1)
p.write_text(s,encoding='utf-8')
print('Teste 73: observação seguida das quatro falas originais; Priantes animados integrados.')
