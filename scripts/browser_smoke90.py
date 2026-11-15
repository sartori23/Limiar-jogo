#!/usr/bin/env python3
"""Teste real Chrome do Teste 90: sprites, áudio, YouTube e captura próxima."""
from pathlib import Path
import sys,json,threading,http.server,socketserver,traceback
root=Path(sys.argv[1] if len(sys.argv)>1 else 'site').resolve()
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.support.ui import WebDriverWait
class Quiet(http.server.SimpleHTTPRequestHandler):
    def __init__(self,*a,**kw):super().__init__(*a,directory=str(root),**kw)
    def log_message(self,*args):pass
with socketserver.TCPServer(('127.0.0.1',0),Quiet) as server:
    threading.Thread(target=server.serve_forever,daemon=True).start()
    options=Options()
    for opt in ['--headless=new','--no-sandbox','--disable-dev-shm-usage',
                '--disable-gpu','--window-size=1280,900']:
        options.add_argument(opt)
    browser=None
    try:
        browser=webdriver.Chrome(options=options)
        browser.set_page_load_timeout(75)
        browser.get(f'http://127.0.0.1:{server.server_address[1]}/teste90.html')
        WebDriverWait(browser,65).until(lambda b:b.execute_script(
            'return !!(window.__teste90&&window.__teste88&&window.__teste89&&window.__soundtrackTest72)'))
        WebDriverWait(browser,30).until(lambda b:b.execute_script(
            'return Object.values(window.__teste90.status().spritesReady).every(Boolean)'))
        draw=browser.execute_script("""
          const old=window.__teste87.status;
          const original=old();
          window.__teste87.status=()=>{
            const f=old();
            return {...f,facing:'down',frame:{source:'run',index:4}};
          };
          setState('play');
          const first=window.__teste90.status().spriteDraws;
          render();
          const front=window.__teste90.status().spriteDraws>first;
          window.__teste87.status=()=>{
            const f=old();return {...f,facing:'left',frame:{source:'run',index:3}};
          };
          render();
          const left=window.__teste90.status().lastSprite==='run_left_3';
          window.__teste87.status=()=>{
            const f=old();return {...f,facing:'right',frame:{source:'run',index:5}};
          };
          render();
          const right=window.__teste90.status().lastSprite==='run_right_5';
          window.__teste87.status=old;
          enterScene1();render();
          const vol=window.__soundtrackTest72.tracks.ceu.gain;
          return {front,left,right,vol};
        """)
        assert draw['front'] and draw['left'] and draw['right'],draw
        assert draw['vol']<=.13,draw
        start=browser.execute_script("""
          setState('final-credits');update(.038);
          return {autoplay:window.__teste90.status().autoStarted,
                  title:document.querySelector('#spare-player89 .sp89-title')?.textContent,
                  api:!!document.querySelector('script[src*="youtube.com/iframe_api"]'),
                  link:document.querySelector('#spare-player89 a')?.href};
        """)
        assert start['autoplay'] and start['api'] and 'Spare Hearts' in start['title'],start
        assert 'GQTnh9v2lhs' in start['link']
        scene=browser.execute_script("""
          window.__finaleTest71.enter();
          player.y=1300;
          update(.035);
          const phase=window.__finaleTest71.state().phase;
          let n=0;
          while(state==='dialog'&&n<8){nextDialogue();n++;}
          const fear=window.__finaleTest71.state().phase;
          heldKeys.add('s');heldKeys.add('shift');
          let caught=null;
          for(let i=0;i<370;i++){
            update(.055);
            const f=window.__finaleTest71.state();
            if(f.gameState==='final-end'||f.gameState==='final-credits'){
              caught={gap:Math.hypot(f.manY-f.playerY,f.manX-player.x),
                      manY:f.manY,playerY:f.playerY,step:i,phase:f.phase};
              break;
            }
          }
          heldKeys.clear();
          return {phase,fear,caught};
        """)
        assert scene['phase']=='confront' and scene['fear']=='fear',scene
        assert scene['caught'] is not None,scene
        assert scene['caught']['gap']<105,scene
        assert scene['caught']['manY']<6520,scene
        data={'v':90,'sprites':draw,'youtube_credit_attempt':start,
              'capture':scene['caught'],'youtube_audio_guaranteed':False}
        (root/'qa_navegador90.json').write_text(json.dumps(data,ensure_ascii=False,indent=2),encoding='utf8')
        print('BROWSER 90 OK: 3 direções corrida, Céu baixo, YouTube iniciado nos créditos, captura a <105px.')
    except Exception:
        if browser:
            try:
                browser.save_screenshot('/tmp/erro90.png')
                print('STATUS:',browser.execute_script("return {state,run:window.__teste90?.status?.(),p87:window.__teste87?.status?.()}"))
            except Exception:pass
        traceback.print_exc()
        raise
    finally:
        if browser:browser.quit()
        server.shutdown()
