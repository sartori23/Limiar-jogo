#!/usr/bin/env python3
"""Teste 64 — substitui apenas o diálogo de Ômega, preservando os demais elementos."""
from pathlib import Path
import sys
path=Path(sys.argv[1] if len(sys.argv)>1 else 'site/index.html')
s=path.read_text(encoding='utf-8')
old="""  omega:{name:'Ômega',role:'carrasco',start:{x:535,y:1204},lines:[
    '“Toda história termina em algum momento. Nem sempre pelas mesmas mãos.”',
    '“É fácil enxergar o fim. Mais difícil é entender o que levou até ele.”'
  ]}"""
new="""  omega:{name:'Ômega',role:'carrasco',start:{x:535,y:1204},lines:[
    '“O tempo leva tudo. Até mesmo aquilo que acreditávamos ser eterno.”'
  ]}"""
if s.count(old)!=1:
    raise SystemExit(f'Esperado um bloco de falas de Ômega; encontrados: {s.count(old)}. Publicação interrompida.')
s=s.replace(old,new,1)
if s.count('Versão 63 ·') != 1:
    raise SystemExit('Título Teste 63 não encontrado exatamente uma vez.')
s=s.replace('Versão 63 ·','Versão 64 ·',1)
path.write_text(s,encoding='utf-8')
print('Teste 64: fala de Ômega alterada; restante do jogo preservado.')
