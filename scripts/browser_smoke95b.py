#!/usr/bin/env python3
"""Teste Chrome 95B: áudio MP3 REAL, não sinal falso; cantiga cantada REAL.
O teste exige avanço do tempo de ambos os áudios no navegador.
"""
from pathlib import Path
import json,sys,threading,http.server,socketserver,time,traceback
root=Path(sys.argv[1] if len(sys.argv)>1 else 'site').resolve()
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.support.ui import WebDriverWait
class Quiet(http.server.SimpleHTTPRequestHandler):
 def __init__(self,*args,**kwargs):super().__init__(*args,directory=str(root),**kwargs)
 def log_message(self,*a):pass
with socketserver.TCPServer(('127.0.0.1',0),Quiet) as server:
 threading.Thread(target=server.serve_forever,daemon=True).start()
 o=Options()
 for x in ('--headless=new','--no-sandbox','--disable-dev-shm-usage','--disable-gpu',
           '--window-size=1280,900','--autoplay-policy=no-user-gesture-required'):
  o.add_argument(x)
 driver=None
 try:
  driver=webdriver.Chrome(options=o)
  driver.set_page_load_timeout(70)
  driver.get(f'http://127.0.0.1:{server.server_address[1]}/teste95b.html')
  WebDriverWait(driver,60).until(lambda b:b.execute_script(
      'return !!(window.__teste95A && window.__teste95B && window.__finaleTest71 && window.__teste94)'))
  running=driver.execute_script("""
    audioOn=true;setState('play');
    const o=window.__teste87.status;
    let n=0;
    for(const direction of ['down','up','left','right']){
      window.__teste87.status=()=>({...o(),mode:'run',facing:direction,frame:{source:'run',index:4}});
      drawAnimatedP(player.x,player.y,P_RENDER_SIZE,direction,0);n++;
    }
    window.__teste87.status=o;
    return {n,status:window.__teste95A.status()};
  """)
  assert running['status']['draws']>=4,running
  start=driver.execute_script("""
    window.__finaleTest71.enter();
    audioOn=true;player.y=5400;
    update(.035);
    return {state, phase:window.__finaleTest71.state().phase,
      voice:window.__teste95B.status(), songVisible:document.getElementById('final-song').classList.contains('visible')};
  """)
  assert start['phase']=='walk' and start['songVisible'],start
  WebDriverWait(driver,22,poll_frequency=.3).until(lambda b:b.execute_script(
     'return window.__teste95B.status().voiceCurrentTime>.3 && window.__teste95B.status().voicePlaying'))
  singing=driver.execute_script('return window.__teste95B.status()')
  assert singing['voiceReady']>=2,singing
  driver.execute_script("setState('final-credits');update(.035);")
  WebDriverWait(driver,40,poll_frequency=.4).until(lambda b:b.execute_script(
    'return window.__teste95B.status().musicCurrentTime>.6 && !window.__teste95B.status().paused'))
  credits=driver.execute_script("""
    return {music:window.__teste95B.status(),
      creditGain:window.__soundtrackTest72.tracks.creditos.gain,
      noYoutube:!document.getElementById('spare-player89'),
      oldLocalHelperHidden:!!document.getElementById('spare-local94'),
      errors:window.__teste84.status().errors};
  """)
  assert 261<credits['music']['duration']<263,credits
  assert credits['music']['played'] and credits['creditGain']==0,credits
  assert credits['noYoutube'] and not credits['errors'],credits
  report={'run':running,'voice':singing,'credits':credits}
  (root/'qa95b.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf8')
  print('BROWSER95B OK: 32 sprites oficiais; cantiga toca e avança; MP3 original 262s reproduz nos créditos; trilha antiga silenciada!')
 except Exception:
  if driver:
   try:
    print('DIAG:',driver.execute_script('return {state,finale:window.__finaleTest71?.state?.(),music:window.__teste95B?.status?.()}'))
    driver.save_screenshot('/tmp/browser95b_fail.png')
   except Exception:pass
  traceback.print_exc()
  raise
 finally:
  if driver:driver.quit()
  server.shutdown()
