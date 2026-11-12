#!/usr/bin/env python3
"""Teste 62: colisão dos quatro tokens dos anjos da Memória 1."""
from pathlib import Path
import sys
path=Path(sys.argv[1] if len(sys.argv)>1 else 'site/index.html')
s=path.read_text(encoding='utf-8')
old="""  for(const a of SCENE1_ANGELS)if(Math.hypot(x-a.x,y-a.y)<r+18)return false;
  return true;
}
function scene1Spawn()"""
new="""  // TESTE 62: colisão acompanha a silhueta dos sprites dos anjos,
  // não somente um pequeno círculo na posição dos pés.
  // O atlas frontal mede 110px (116px para Vaniel), ancorado no chão.
  for(const a of SCENE1_ANGELS){
    const dx=Math.abs(x-a.x),dy=y-a.y;
    const bodyHalf=a.id==='vaniel'?31:29;
    const wingHalf=a.id==='samuel'?40:43;
    if(dx<bodyHalf+r && dy>-107-r && dy<9+r)return false;
    if(dx<wingHalf+r && dy>-87-r && dy<-27+r)return false;
  }
  return true;
}
function scene1Spawn()"""
if s.count(old)!=1: raise SystemExit(f'Colisão antiga não encontrada uma única vez: {s.count(old)}')
s=s.replace(old,new,1)
old_reach="let a=SCENE1_ANGELS.filter(a=>dist(a,player)<98).sort((a,b)=>dist(a,player)-dist(b,player));"
new_reach="let a=SCENE1_ANGELS.filter(a=>dist(a,player)<(player.y<a.y?146:98)).sort((a,b)=>dist(a,player)-dist(b,player));"
if s.count(old_reach)!=1: raise SystemExit('Interação dos anjos não encontrada')
s=s.replace(old_reach,new_reach,1)
s=s.replace('Teste 61','Teste 62').replace('TESTE 61','TESTE 62').replace('Versão 61 ·','Versão 62 ·')
path.write_text(s,encoding='utf-8')
print('Teste 62: colisões nos quatro anjos corrigidas; diálogos e demais cenas preservados')
