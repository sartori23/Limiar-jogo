#!/usr/bin/env python3
"""Chrome Test93 — running, credits, scary warning, and English-only lyric."""
from pathlib import Path
import json,sys,threading,http.server,socketserver,traceback
root=Path(sys.argv[1] if len(sys.argv)>1 else 'site').resolve()
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.support.ui import WebDriverWait
class Quiet(http.server.SimpleHTTPRequestHandler):
 def __init__(self,*a,**kw):super().__init__(*a,directory=str(root),**kw)
 def log_message(self,*args):pass
with socketserver.TCPServer(('127.0.0.1',0),Quiet) as server:
 threading.Thread(target=server.serve_forever,daemon=True).start()
 o=Options()
 for x in ('--headless=new','--no-sandbox','--disable-dev-shm-usage',
           '--disable-gpu','--window-size=1280,900','--autoplay-policy=no-user-gesture-required'):
  o.add_argument(x)
 driver=None
 try:
  driver=webdriver.Chrome(options=o)
  driver.set_page_load_timeout(75)
  driver.get(f'http://127.0.0.1:{server.server_address[1]}/teste93.html')
  WebDriverWait(driver,60).until(lambda d:d.execute_script(
    'return !!(window.__teste93&&window.__teste92&&window.__teste87&&window.__finaleTest71)'))
  data=driver.execute_script("""
    setState('play');heldKeys.clear();heldKeys.add('shift');heldKeys.add('d');
    for(let i=0;i<8;i++)update(.03);
    const running=!!player.sprinting;
    render();
    heldKeys.clear();
    const span=document.querySelector('#final-corridor-hint .hint-left90');
    if(!span)throw Error('Aviso lateral ausente');
    const style=getComputedStyle(span);
    setState('final-credits');update(.05);render();
    const credits=document.querySelector('#spare-ref93')?.textContent;
    return {running,warningFont:style.fontFamily,warningAnimation:style.animationName,
      noIframe:!document.querySelector('#spare-player89'),
      hasCredit:credits?.includes('Spare Hearts'),status:window.__teste93.status(),
      errors:window.__teste84.status().errors};
  """)
  assert data['running'] and data['noIframe'] and data['hasCredit'],data
  assert 'Creepster' in data['warningFont'],data
  assert data['warningAnimation']=='limiarHorrorWarning93',data
  assert not data['errors'],data
  (root/'qa_navegador93.json').write_text(json.dumps(data,ensure_ascii=False,indent=2),encoding='utf8')
  print('BROWSER93 OK: sprint, player oculto, créditos, fonte sombria e sem erros JS.')
 except Exception:
  if driver:
   try:driver.save_screenshot('/tmp/erro93.png')
   except Exception:pass
  traceback.print_exc()
  raise
 finally:
  if driver:driver.quit()
  server.shutdown()
