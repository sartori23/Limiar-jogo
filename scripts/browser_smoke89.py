#!/usr/bin/env python3
"""Smoke test Chrome: CORRA temporário e player oficial nos créditos."""
from pathlib import Path
import sys,json,threading,http.server,socketserver,traceback
root=Path(sys.argv[1] if len(sys.argv)>1 else 'site').resolve()
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.common.by import By
class Quiet(http.server.SimpleHTTPRequestHandler):
    def __init__(self,*args,**kw):super().__init__(*args,directory=str(root),**kw)
    def log_message(self,*args):pass
with socketserver.TCPServer(('127.0.0.1',0),Quiet) as server:
    threading.Thread(target=server.serve_forever,daemon=True).start()
    options=Options()
    for x in ['--headless=new','--no-sandbox','--disable-dev-shm-usage','--disable-gpu',
              '--window-size=1280,900','--autoplay-policy=no-user-gesture-required']:
        options.add_argument(x)
    b=None
    try:
        b=webdriver.Chrome(options=options)
        b.set_page_load_timeout(75)
        b.get('http://127.0.0.1:'+str(server.server_address[1])+'/teste89.html')
        WebDriverWait(b,70).until(lambda d:d.execute_script('return !!(window.__teste89&&window.__teste88&&window.__finaleTest71)'))
        pre=b.execute_script("""
          setState('final-credits');
          update(.03);
          return {state,ready:window.__teste89.status().playerReady,
                  label:document.querySelector('#spare-player89 .sp89-title')?.textContent};
        """)
        assert pre['state']=='final-credits' and pre['ready']
        assert 'Spare Hearts' in pre['label']
        play=b.find_element(By.CSS_SELECTOR,'#spare-player89 button')
        play.click()
        info=b.execute_script("""
          update(.03);
          return {x:window.__teste89.status(),src:document.querySelector('#spare-player89 iframe')?.src};
        """)
        assert info['x']['videoActivated'],info
        assert 'youtube-nocookie.com/embed/GQTnh9v2lhs' in info['src'],info
        assert b.execute_script('return window.__soundtrackTest72.tracks.creditos.gain')==0
        b.find_element(By.CSS_SELECTOR,'#spare-player89 button:nth-of-type(2)').click()
        assert not b.execute_script('return window.__teste89.status().videoActivated')
        # A cena de confronto segue o fluxo original. Não inventar atalhos.
        state=b.execute_script("""
          window.__finaleTest71.enter();
          player.y=1300;
          update(.035);
          const a=window.__finaleTest71.state();
          let dialogs=0;
          while(state==='dialog'&&dialogs<6){nextDialogue();dialogs++;}
          const fear=window.__finaleTest71.state();
          return {a,fear,dialogs,hint:document.getElementById('final-corridor-hint').classList.contains('visible')};
        """)
        assert state['fear']['phase']=='fear',state
        assert state['hint'],state
        after=b.execute_script("""
          for(let i=0;i<14;i++)update(.1);
          const f=window.__finaleTest71.state();
          return {f,hint:document.getElementById('final-corridor-hint').classList.contains('visible'),
                  mobile:document.getElementById('final-run-mobile').classList.contains('visible')};
        """)
        assert not after['hint'] and after['mobile'],after
        errors=b.execute_script('return window.__teste84.status().errors')
        assert not errors,errors
        report={'version':89,'youtube_enabled':info['src'],'start_phase':state['fear']['phase'],
                'run_warning_hidden_after_1_4sec':not after['hint'],
                'mobile_run_button_preserved':after['mobile'],
                'javascript_errors':errors}
        (root/'qa_navegador89.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf8')
        print('BROWSER 89 OK: player YouTube, mix sem sobreposição, CORRA oculto após 1,4 s e perseguição preservada.')
    except Exception:
        if b:
            try:
                b.save_screenshot('/tmp/erro_test89.png')
                print('STATUS:',b.execute_script('return {state,finale:window.__finaleTest71?.state?.(),music:window.__teste89?.status?.()}'))
            except Exception:pass
        traceback.print_exc()
        raise
    finally:
        if b:b.quit()
        server.shutdown()
