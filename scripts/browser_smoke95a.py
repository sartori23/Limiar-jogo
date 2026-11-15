#!/usr/bin/env python3
"""Teste A no Chrome: checa 32 quadros reais no site e desenho de todas as direções."""
from pathlib import Path
import sys,threading,http.server,socketserver,json,traceback
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
    for f in ('--headless=new','--no-sandbox','--disable-dev-shm-usage','--disable-gpu',
              '--window-size=1280,900'):opts.add_argument(f)
    b=None
    try:
        b=webdriver.Chrome(options=opts)
        b.get('http://127.0.0.1:'+str(server.server_address[1])+'/teste95a.html')
        WebDriverWait(b,70).until(lambda d:d.execute_script('return !!window.__teste95A'))
        WebDriverWait(b,50).until(lambda d:d.execute_script(
           'return Object.values(window.__teste95A.status().ready).every(Boolean)'))
        data=b.execute_script("""
          let originals=window.__teste87.status;
          const results={};
          for(const dir of ['down','up','left','right']){
            for(let i=0;i<8;i++){
              window.__teste87.status=()=>({...originals(),
                mode:'run',facing:dir,frame:{source:'run',index:i}});
              drawAnimatedP(player.x,player.y,P_RENDER_SIZE,dir,0);
            }
            results[dir]=window.__teste95A.status().lastFrame;
          }
          window.__teste87.status=originals;
          return {results,status:window.__teste95A.status(),
           errors:window.__teste84.status().errors};
        """)
        assert data['status']['draws']>=32,data
        assert data['status']['fallbackDraws']==0,data
        assert all(data['status']['ready'].values()),data
        assert not data['status']['errors'] and not data['errors'],data
        assert all(data['results'][d]['frame']==7 for d in ['down','up','left','right']),data
        (root/'qa95a.json').write_text(json.dumps(data,indent=2,ensure_ascii=False),encoding='utf8')
        print('BROWSER95A OK: 32 quadros reais de 4 direções carregados e desenhados sem fallbacks!')
    except Exception:
        traceback.print_exc()
        if b:
            try:b.save_screenshot('/tmp/browser95a_fail.png')
            except Exception:pass
        raise
    finally:
        if b:b.quit()
        server.shutdown()
