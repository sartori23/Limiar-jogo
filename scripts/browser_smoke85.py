#!/usr/bin/env python3
"""Smoke test real de Pietro no Chrome: parado, andar, correr, parar, 4 direções."""
from pathlib import Path
import sys,json,http.server,socketserver,threading,shutil,traceback
root=Path(sys.argv[1] if len(sys.argv)>1 else 'site').resolve()
if not (shutil.which('google-chrome') or shutil.which('chromium') or shutil.which('chromium-browser')):
    raise SystemExit('Chrome não está instalado, teste no navegador é obrigatório')
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.support.ui import WebDriverWait
class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self,*a,**kw):super().__init__(*a,directory=str(root),**kw)
    def log_message(self,*a):pass
with socketserver.TCPServer(('127.0.0.1',0),Handler) as server:
    threading.Thread(target=server.serve_forever,daemon=True).start()
    opt=Options()
    for arg in ['--headless=new','--no-sandbox','--disable-dev-shm-usage',
                '--disable-gpu','--window-size=1280,900',
                '--autoplay-policy=no-user-gesture-required']:
        opt.add_argument(arg)
    browser=None
    try:
        browser=webdriver.Chrome(options=opt)
        browser.set_page_load_timeout(75)
        url='http://127.0.0.1:'+str(server.server_address[1])+'/teste85.html'
        browser.get(url)
        WebDriverWait(browser,60).until(lambda b:b.execute_script('return !!window.__teste85'))
        WebDriverWait(browser,45).until(lambda b:b.execute_script(
            'return Object.values(window.__teste85.status().atlas).every(Boolean)'))
        set_game="""
        setState('play');
        let found=null;
        for(let y=2;y<MH-2&&!found;y++)for(let x=2;x<MW-6&&!found;x++){
           const xx=x*TILE+TILE/2,yy=y*TILE+TILE/2;
           if(canOccupy(xx,yy,10)&&canOccupy(xx+90,yy,10)&&
              priantes.every(e=>Math.hypot(e.x-xx,e.y-yy)>250))
              found={x:xx,y:yy};
        }
        if(!found)throw Error('Não encontrou corredor seguro para testar Pietro');
        player.x=found.x;player.y=found.y;
        player.vx=0;player.vy=0;
        heldKeys.clear();
        return {found,sprite:window.__teste85.status()};
        """
        setup=browser.execute_script(set_game)
        idle=browser.execute_script('return window.__teste85.status()')
        browser.execute_script("heldKeys.add('d');for(let i=0;i<13;i++){update(.033);render();}")
        walking=browser.execute_script('return window.__teste85.status()')
        assert walking['mode']=='walk',walking
        assert walking['heading']=='right',walking
        assert walking['drawCount']>0,walking
        browser.execute_script("heldKeys.add('shift');for(let i=0;i<12;i++){update(.033);render();}")
        running=browser.execute_script('return window.__teste85.status()')
        assert running['mode']=='run',running
        browser.execute_script("heldKeys.clear();for(let i=0;i<20;i++){update(.033);render();}")
        stopped=browser.execute_script('return window.__teste85.status()')
        assert stopped['mode']=='idle',stopped
        assert stopped['heading']=='right',stopped
        assert not stopped['failures'],stopped
        assert browser.execute_script('return window.__teste84.status().errors')==[]
        report={'idle':idle,'walk':walking,'run':running,'stop':stopped,
                'nine_atlases':True,'scenario':'corredor seguro, personagem real'}
        (root/'qa_navegador85.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf-8')
        print('BROWSER P85 OK: 9 atlas, parado → andando → correndo → parado, direção e sem falhas JS.')
    except Exception:
        if browser:
            try:
                browser.save_screenshot('/tmp/p85_error.png')
                print('STATUS:',browser.execute_script('return window.__teste85?.status?.()'))
            except Exception as err:print('Diagnóstico:',repr(err))
        traceback.print_exc()
        raise
    finally:
        if browser:browser.quit()
        server.shutdown()
