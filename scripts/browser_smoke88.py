#!/usr/bin/env python3
"""Teste visual do 88 em Chrome: sprites renderizados em todos os mapas."""
from pathlib import Path
import sys,threading,http.server,socketserver,traceback,json
root=Path(sys.argv[1] if len(sys.argv)>1 else 'site').resolve()
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.support.ui import WebDriverWait
class Quiet(http.server.SimpleHTTPRequestHandler):
    def __init__(self,*args,**kwargs):super().__init__(*args,directory=str(root),**kwargs)
    def log_message(self,*args):pass
with socketserver.TCPServer(('127.0.0.1',0),Quiet) as server:
    threading.Thread(target=server.serve_forever,daemon=True).start()
    options=Options()
    for arg in ('--headless=new','--no-sandbox','--disable-dev-shm-usage',
                '--disable-gpu','--window-size=1280,900'):
        options.add_argument(arg)
    browser=None
    try:
        browser=webdriver.Chrome(options=options)
        browser.set_page_load_timeout(75)
        browser.get('http://127.0.0.1:'+str(server.server_address[1])+'/teste88.html')
        WebDriverWait(browser,65).until(lambda b:b.execute_script(
            'return !!(window.__teste87&&window.__teste88&&window.__teste84)'))
        WebDriverWait(browser,40).until(lambda b:b.execute_script(
            'return Object.values(window.__teste88.status().loaded).every(Boolean)'))
        bounds=browser.execute_script("""
          const result={};
          for(const key of [['walk','up',8],['idle','up',4],['run','down',8]]){
            const [m,d,n]=key;result[m+'_'+d]=[];
            for(let i=0;i<n;i++)result[m+'_'+d].push(window.__teste88.inspect(m,d,i));
          }
          return result;
        """)
        for mode in ('walk_up','idle_up'):
            for sample in bounds[mode]:
                assert sample['ready'] and sample['bbox'][1]==22 and sample['bbox'][3]==233,sample
        for sample in bounds['run_down']:
            assert sample['ready'] and sample['bbox'][3]==233,sample
        sceneChecks=browser.execute_script("""
            const original=window.__teste87.status;
            window.__teste87.status=()=>{
              const obj=original();
              return {...obj,facing:'up',frame:{source:'walk',index:3}};
            };
            const drawn=()=>window.__teste88.status().correctedDraws;
            const log={};
            setState('play');
            let n=drawn();render();log.limiante=drawn()>n;
            enterScene1();n=drawn();render();log.ceu=drawn()>n;
            exitScene1(true);
            enterScene2();n=drawn();render();log.cena=drawn()>n;
            exitScene2();
            enterScene3();n=drawn();render();log.biblioteca=drawn()>n;
            exitScene3();
            window.__teste87.status=()=>{
              const obj=original();
              return {...obj,facing:'down',frame:{source:'run',index:4}};
            };
            n=drawn();render();log.corridaFrontal=drawn()>n;
            window.__teste87.status=original;
            return log;
        """)
        assert all(sceneChecks.values()),sceneChecks
        s=browser.execute_script('return window.__teste84.status()')
        assert not s['errors'],s['errors']
        output={'version':88,'scenes':sceneChecks,'corrected_frames':bounds,
                'javascript_errors':s['errors']}
        (root/'qa_navegador88.json').write_text(json.dumps(output,indent=2),encoding='utf8')
        print('BROWSER P88 OK: costas renderizadas nos quatro mapas; corrida frontal corrigida; sem erros JS.')
    except Exception:
        if browser:
            try:
                browser.save_screenshot('/tmp/erro_p88.png')
                print('STATUS:',browser.execute_script('return window.__teste88?.status?.()'))
            except Exception as e:print('Status indisponível:',repr(e))
        traceback.print_exc()
        raise
    finally:
        if browser:browser.quit()
        server.shutdown()
