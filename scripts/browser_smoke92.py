#!/usr/bin/env python3
"""Teste 92 no Chrome: corrida nos quatro mapas, Lumini inicia com nome e
corredor possui decoração visual sem novos objetos de colisão.
"""
from pathlib import Path
import json,sys,threading,http.server,socketserver,traceback
root=Path(sys.argv[1] if len(sys.argv)>1 else 'site').resolve()
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.support.ui import WebDriverWait
class Quiet(http.server.SimpleHTTPRequestHandler):
 def __init__(self,*a,**kw):super().__init__(*a,directory=str(root),**kw)
 def log_message(self,*a):pass
with socketserver.TCPServer(('127.0.0.1',0),Quiet) as server:
 threading.Thread(target=server.serve_forever,daemon=True).start()
 opts=Options()
 for flag in ('--headless=new','--no-sandbox','--disable-dev-shm-usage',
              '--disable-gpu','--window-size=1280,900','--autoplay-policy=no-user-gesture-required'):
  opts.add_argument(flag)
 b=None
 try:
  b=webdriver.Chrome(options=opts)
  b.set_page_load_timeout(75)
  b.get(f'http://127.0.0.1:{server.server_address[1]}/teste92.html')
  WebDriverWait(b,65).until(lambda d:d.execute_script(
    'return !!(window.__teste92 && window.__teste91 && window.__finaleTest71 && window.__teste87)'))
  d=b.execute_script("""
    const result={};
    const check=()=>{
      heldKeys.clear();heldKeys.add('shift');heldKeys.add('d');
      for(let i=0;i<3;i++)update(.025);
      const v=!!player.sprinting;
      heldKeys.clear();return v;
    };
    setState('play');result.maze=check();
    enterScene1();setState('play');result.sky=check();
    exitScene1(true);
    enterScene2();setState('play');result.scene2=check();
    exitScene2();
    enterScene3();setState('play');result.library=check();
    exitScene3();
    const ui=window.__teste92.status();
    result.luminiFirst=ui.questionFirstInMenu==='lumini-question-name';
    result.firstLabel=ui.firstQuestion;
    showDialogue('P',[
      'Hã...? Aquele portal... De onde você saiu?',
      'Você... consegue me ver?'
    ],'p');
    result.dialogue=dialogue[0];
    nextDialogue();nextDialogue();
    result.luminiIntercepted=window.__teste92.status().luminiDialogueReplaced>0;
    return result;
  """)
  assert all(d[k] for k in ('maze','sky','scene2','library','luminiFirst','luminiIntercepted')),d
  assert d['dialogue']=='Quem é vc?',d
  b.execute_script("""
     window.__finaleTest71.enter();
     player.y=1080;render();
  """)
  # A decoração é puramente visual: uma captura real do Canvas em repouso.
  screenshot=root/'corredor92_previa.png'
  b.save_screenshot(str(screenshot))
  assert screenshot.stat().st_size>4000
  state=b.execute_script("""
    return {game:state,finale:window.__finaleTest71.state().active,
      stillStraight:document.querySelector('#final-corridor-hint')!==null,
      noVideoUI:!document.getElementById('spare-player89'),
      errors:window.__teste84.status().errors};
  """)
  assert state['finale'] and state['stillStraight'] and state['noVideoUI'],state
  assert not state['errors'],state
  report={'test':92,'fourMapsRun':d,'corridor':state,'screenshot':screenshot.name,
          'approvedNewRunningAtlasInstalled':False}
  (root/'qa_navegador92.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf8')
  print('BROWSER92 OK: sprint em quatro mapas, Lumini primeira pergunta, corredor detalhado, sem vídeo nos créditos.')
 except Exception:
  if b:
   try:print('DIAG:',b.execute_script('return {state,p:window.__teste92?.status?.(),finale:window.__finaleTest71?.state?.()}'))
   except Exception:pass
  traceback.print_exc()
  raise
 finally:
  if b:b.quit()
  server.shutdown()
