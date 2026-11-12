#!/usr/bin/env python3
"""Baixa, verifica e comprime trilhas licenciadas para o Teste 72.
Apenas arquivos oficiais CC0/CC BY. Não baixa Spare Hearts (direitos reservados).
Os arquivos não encontrados são omitidos com aviso; síntese original segue como alternativa.
"""
from pathlib import Path
from urllib.request import Request, urlopen
import zipfile, subprocess, tempfile, os, io, sys, json

OUT=Path(sys.argv[1] if len(sys.argv)>1 else "site/soundtrack72")
OUT.mkdir(parents=True,exist_ok=True)
SOURCES={
 'menu': [
  'https://opengameart.org/sites/default/files/ambient_horror_track_01.zip',
  'https://lpc.opengameart.org/sites/default/files/ambient_horror_track_01.zip'
 ],
 'limiante': [
  'https://opengameart.org/sites/default/files/Juhani%20Junkala%20-%20Post%20Apocalyptic%20Wastelands%20%5BLoop%20Ready%5D.ogg',
  'https://lpc.opengameart.org/sites/default/files/Juhani%20Junkala%20-%20Post%20Apocalyptic%20Wastelands%20%5BLoop%20Ready%5D.ogg'
 ],
 'priantes': [
  'https://lpc.opengameart.org/sites/default/files/CrEEP_0.mp3',
  'https://opengameart.org/sites/default/files/CrEEP_0.mp3',
 ],
 'ceu': ['https://www.scottbuckley.com.au/library/wp-content/uploads/2023/02/ADragonsLullaby2023.mp3'],
 'cena': [
  'https://opengameart.org/sites/default/files/creepy_piano_0.mp3',
  'https://lpc.opengameart.org/sites/default/files/creepy_piano_0.mp3'
 ],
 'biblioteca':[
  'https://opengameart.org/sites/default/files/forbidden_space_v2_loop.ogg',
  'https://lpc.opengameart.org/sites/default/files/forbidden_space_v2_loop.ogg'
 ],
 'lumini':['https://incompetech.com/music/royalty-free/mp3-royaltyfree/Ghost%20Story.mp3'],
 'perseguicao':['https://www.scottbuckley.com.au/library/wp-content/uploads/2025/06/EyesInTheVoid.mp3'],
 'creditos':['https://www.scottbuckley.com.au/library/wp-content/uploads/2025/07/Penumbra.mp3'],
}
# Duração convertida é compacta para preservar rapidez do carregamento.
SETTINGS={
 'menu':(0,47,43),
 'limiante':(0,104,42),
 'priantes':(0,80,42),
 'ceu':(0,103,57),
 'cena':(0,103,47),
 'biblioteca':(0,105,47),
 'lumini':(0,100,49),
 'perseguicao':(175,91,66),
 'creditos':(0,100,55),
}
def download(url):
    req=Request(url,headers={'User-Agent':'Mozilla/5.0 (No Limiar do Finito; noncommercial game prototype)','Accept':'*/*'})
    with urlopen(req,timeout=30) as f:
      mime=f.headers.get('Content-Type','')
      data=f.read(50000000)
    if len(data)<12000 or data.lstrip().lower().startswith(b'<!doctype') or b'<html' in data[:300].lower():
      raise ValueError('not audio or zip, length='+str(len(data))+' mime='+mime)
    return data

failures=[]
success=[]
for key, urls in SOURCES.items():
  raw=None
  for url in urls:
    try:
      raw=download(url)
      print('FONTE',key,url,len(raw),'bytes',flush=True)
      if raw[:2]==b'PK':
        z=zipfile.ZipFile(io.BytesIO(raw))
        names=[x for x in z.namelist() if x.lower().endswith(('.ogg','.mp3','.wav')) and not x.startswith('__MACOSX/')]
        if not names:raise ValueError('zip sem faixa de audio')
        names.sort(key=lambda x: (not x.lower().endswith('.ogg'),len(x)))
        raw=z.read(names[0])
      break
    except Exception as exc:
      print('AVISO: falha',key,url,str(exc)[:150],flush=True)
      raw=None
  if not raw:
    failures.append(key)
    continue
  start,duration,bitrate=SETTINGS[key]
  with tempfile.NamedTemporaryFile(suffix='.audio',delete=False) as t:
    t.write(raw)
    tmp=t.name
  dest=OUT/(key+'.ogg')
  cmd=['ffmpeg','-nostdin','-hide_banner','-loglevel','error','-y','-i',tmp]
  if start:
    cmd+=['-ss',str(start)]
  cmd+=['-t',str(duration),'-vn','-af','afade=t=in:st=0:d=1.3,volume=0.90','-ac', '2','-ar','32000','-c:a','libvorbis','-b:a',str(bitrate)+'k',str(dest)]
  try:
    sub=subprocess.run(cmd,stdout=subprocess.PIPE,stderr=subprocess.PIPE,timeout=130)
    if sub.returncode!=0 or not dest.exists() or dest.stat().st_size<10000:
      raise RuntimeError(sub.stderr.decode(errors='ignore')[-300:])
    print('OK',key,dest.stat().st_size,'bytes',flush=True)
    success.append(key)
  except Exception as exc:
    print('CONVERSAO ERRO',key,exc,flush=True)
    failures.append(key)
    dest.unlink(missing_ok=True)
  finally:
    os.unlink(tmp)

(OUT/'manifest.txt').write_text('Disponíveis: '+', '.join(success)+'\nIndisponíveis: '+', '.join(failures)+'\nCC0/CC BY 4.0, fontes nos créditos do jogo.\n',encoding='utf-8')
(OUT/'manifest.json').write_text(json.dumps({'available':success,'unavailable':failures},ensure_ascii=False),encoding='utf-8')
print('SUCESSO',success,flush=True)
print('INACESSÍVEIS',failures,flush=True)
if not all(x in success for x in ['ceu','perseguicao','creditos']):
  raise SystemExit('Faixas principais indisponíveis; não publicar versão incompleta.')
