#!/usr/bin/env python3
"""Chrome: Teste 91, corrida só no final e créditos sem player externo."""
from pathlib import Path
import sys,json,http.server,socketserver,threading,traceback
base=Path(sys.argv[1] if len(sys.argv)>1 else 'site').resolve()
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.support.ui import WebDriverWait
class Quiet(http.server.SimpleHTTPRequestHandler):
 def __init__(self,*a,**kw):super().__init__(*a,directory=str(base),**kw)
 def log_message(self,*a):pass
with socketserver.TCPServer(('127.0.0.1',0),Quiet) as server:
 threading.Thread(target=server.serve_forever,daemon=True).start()
 options=Options()
 for x in ('--headless=new','--no-sandbox','--disable-dev-shm-usage',
           '--disable-gpu','--window-size=1280,900',
           '--autoplay-policy=no-user-gesture-required'):
  options.add_argument(x)
 browser=None
 try:
  browser=webdriver.Chrome(options=options)
  browser.set_page_load_timeout(75)
  browser.get(f'http://127.0.0.1:{server.server_address[1]}/teste91.html')
  WebDriverWait(browser,60).until(lambda b:b.execute_script(
    'return !!(window.__teste91 && window.__teste87 && window.__finaleTest71 && window.__soundtrackTest72)'))
  checks=browser.execute_script("""
    const log={};
    setState('play');
    heldKeys.clear();
    heldKeys.add('shift');heldKeys.add('d');
    for(let i=0;i<4;i++)update(.025);
    log.mazeSprint=player.sprinting;
    heldKeys.clear();
    enterScene1();setState('play');
    heldKeys.add('shift');heldKeys.add('d');update(.025);
    log.skySprint=player.sprinting;
    heldKeys.clear();exitScene1(true);
    enterScene2();setState('play');
    heldKeys.add('shift');heldKeys.add('d');update(.025);
    log.scene2Sprint=player.sprinting;
    heldKeys.clear();exitScene2();
    enterScene3();setState('play');
    heldKeys.add('shift');heldKeys.add('d');update(.025);
    log.librarySprint=player.sprinting;
    heldKeys.clear();exitScene3();
    log.youtubePanel=!!document.querySelector('#spare-player89');
    log.youtubeIframe=!!document.querySelector('iframe[src*="youtube.com"]');
    const f=document.querySelector('#soundtrack-credits72');
    log.musicReference=!!f?.querySelector('a[href*="GQTnh9v2lhs"]');
    log.captionExists=!!document.querySelector('#final-song');
    return log;
  """)
  for key in ['mazeSprint','skySprint','scene2Sprint','librarySprint',
              'youtubePanel','youtubeIframe']:
   assert checks[key] is False,(key,checks)
  assert checks['captionExists'] and checks['musicReference'],checks
  door=browser.execute_script("""
    setState('play');heldKeys.clear();
    const p=objs.find(o=>o.kind==='memory-portal');
    if(!p)throw Error('Porta de teste não encontrada');
    player.x=p.x+80;player.y=p.y;
    update(.03);
    return {seen:window.__teste91.status().firstDoorSeen,state,dialog:$('dialog-text').textContent};
  """)
  assert door['seen'] and door['state']=='dialog',door
  browser.execute_script("""
    while(state==='dialog')nextDialogue();
    window.__finaleTest71.enter();
    player.y=1300;update(.025);
    while(state==='dialog')nextDialogue();
    heldKeys.clear();heldKeys.add('s');heldKeys.add('shift');
    for(let i=0;i<3;i++)update(.03);
  """)
  state=browser.execute_script("""
    return {phase:window.__finaleTest71.state().phase,
            sprint:player.sprinting,mode:window.__teste87.status().mode,
            shown:document.querySelector('#final-song')?.textContent};
  """)
  assert state['phase'] in ('fear','chase'),state
  assert state['sprint'] is True,state
  credits=browser.execute_script("""
    heldKeys.clear();setState('final-credits');update(.03);
    return {cue:window.__soundtrackTest72.cueForState(),
       reference:document.querySelector('#soundtrack-credits72 a[href*="GQTnh9v2lhs"]')?.textContent,
       visibleVideo:!!document.querySelector('#spare-player89'),
       test:window.__teste91.status()};
  """)
  assert credits['cue']=='creditos' and not credits['visibleVideo'],credits
  errors=browser.execute_script('return window.__teste84.status().errors')
  assert not errors,errors
  report={'version':91,'walkOnly':checks,'firstDoor':door,'finalSprint':state,
          'credits':credits,'errors':errors}
  (base/'qa_navegador91.json').write_text(json.dumps(report,indent=2,ensure_ascii=False),encoding='utf8')
  print('BROWSER91 OK: 4 mapas sem sprint, finale sprint, porta revelada, legendas e créditos limpos.')
 except Exception:
  if browser:
   try:
    browser.save_screenshot('/tmp/browser91.png')
    print('DIAG:',browser.execute_script('return {state,p:window.__teste91?.status?.(),f:window.__finaleTest71?.state?.()}'))
   except Exception:pass
  traceback.print_exc()
  raise
 finally:
  if browser:browser.quit()
  server.shutdown()
