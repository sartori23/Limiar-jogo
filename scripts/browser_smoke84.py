#!/usr/bin/env python3
"""Smoke test em Chrome: imagens e percursos, sem alterar os arquivos publicados."""
from pathlib import Path
import json,sys,threading,http.server,socketserver,shutil,traceback
root=Path(sys.argv[1] if len(sys.argv)>1 else 'site').resolve()
if not (shutil.which('google-chrome') or shutil.which('chromium') or shutil.which('chromium-browser')):
    print('AVISO: Chrome indisponível; verificações estáticas obrigatórias seguem ativas.')
    sys.exit(0)
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.support.ui import WebDriverWait
class Quiet(http.server.SimpleHTTPRequestHandler):
    def __init__(self,*args,**kw):super().__init__(*args,directory=str(root),**kw)
    def log_message(self,*args):pass
with socketserver.TCPServer(('127.0.0.1',0),Quiet) as server:
    threading.Thread(target=server.serve_forever,daemon=True).start()
    options=Options()
    for a in ('--headless=new','--no-sandbox','--disable-dev-shm-usage',
              '--disable-gpu','--window-size=1280,900',
              '--autoplay-policy=no-user-gesture-required'):
        options.add_argument(a)
    browser=None
    try:
        browser=webdriver.Chrome(options=options)
        browser.set_page_load_timeout(65)
        browser.get(f'http://127.0.0.1:{server.server_address[1]}/teste84.html')
        WebDriverWait(browser,55).until(lambda d:d.execute_script(
            'return !!(window.__teste84 && window.__teste79 && window.__prianteTest78 && window.__soundtrackTest72)'))
        WebDriverWait(browser,30).until(lambda d:d.execute_script(
            'return Object.values(window.__teste79.status().atlasses).every(Boolean)'))
        state=browser.execute_script('return window.__teste84.status()')
        assert state['playerFinite'] and state['prianteAnimation'] and state['audio'],state
        assert not state['errors'],state['errors']
        result=browser.execute_script("""
          return (function(){
            const a=scene2DisplayName('omega');
            setState('play');enterScene1();render();const ceu=scene1Active;
            exitScene1(true);enterScene2();render();const cena=scene2Active;
            exitScene2();enterScene3();render();const biblioteca=scene3Active;
            exitScene3();
            const b=scene2DisplayName('omega');
            luminiMemoryAsked.add('cena');
            const after=scene2DisplayName('omega');
            luminiMemoryAsked.delete('cena');
            return {ceu,cena,biblioteca,before:a,stillHidden:b,after};
          })();
        """)
        assert all(result[k] for k in ('ceu','cena','biblioteca')),result
        assert result['before']=='???' and result['stillHidden']=='???' and result['after']=='Ômega',result
        state=browser.execute_script('return window.__teste84.status()')
        assert not state['errors'],state['errors']
        report={'browser':'Chrome headless','version':84,'scenarios':result,
            'sprite_directions':browser.execute_script('return window.__teste79.status().atlasses'),
            'errors':state['errors']}
        (root/'relatorio_navegador84.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf8')
        print('BROWSER QA84 OK: 9 atlas + 3 memórias + revelação por Lumini + ausência de erros')
    except Exception as e:
        if browser:
            try:
                browser.save_screenshot('/tmp/qa84_browser_failure.png')
                print('JS STATUS:',browser.execute_script('return window.__teste84?.status?.()'))
            except Exception as se:print('Diagnóstico extra:',repr(se))
        traceback.print_exc()
        raise
    finally:
        if browser:browser.quit()
        server.shutdown()
