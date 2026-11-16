#!/usr/bin/env python3
"""Verifica no Chrome que o menu renderiza cada rótulo uma única vez.
Os três textos são pintados na imagem; os botões HTML têm hitboxes invisíveis.
"""
from pathlib import Path
import http.server, socketserver, threading, sys, traceback
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.support.ui import WebDriverWait

root=Path(sys.argv[1] if len(sys.argv)>1 else "site").resolve()
class Server(http.server.SimpleHTTPRequestHandler):
    def __init__(self,*args,**kwargs):
        super().__init__(*args,directory=str(root),**kwargs)
    def log_message(self,*args):
        pass

with socketserver.TCPServer(("127.0.0.1",0),Server) as server:
    threading.Thread(target=server.serve_forever,daemon=True).start()
    opts=Options()
    for flag in ("--headless=new","--no-sandbox","--disable-dev-shm-usage","--disable-gpu",
                 "--window-size=1280,800","--autoplay-policy=no-user-gesture-required"):
        opts.add_argument(flag)
    browser=None
    try:
        browser=webdriver.Chrome(options=opts)
        browser.set_page_load_timeout(80)
        browser.get(f"http://127.0.0.1:{server.server_address[1]}/index.html")
        WebDriverWait(browser,60).until(lambda b:b.execute_script(
            "return !!(window.__nienteMenu && document.querySelector('#start-btn') "
            "&& document.querySelector('#ndv-options'))"))
        info=browser.execute_script("""
            const bg=document.getElementById('start-screen');
            const view=document.getElementById('viewport').getBoundingClientRect();
            const buttons=['start-btn','ndv-continue','ndv-options'].map(id=>{
              const el=document.getElementById(id),s=getComputedStyle(el),r=el.getBoundingClientRect();
              return {id,centerY:(r.top+r.height/2-view.top)/view.height,
                centerX:(r.left+r.width/2-view.left)/view.width,
                font:s.fontSize,fill:s.webkitTextFillColor,opacity:s.opacity,
                disabled:el.disabled,visible:r.height>5};
            });
            const style=getComputedStyle(bg).backgroundImage;
            return {buttons,style,imageLoad:!!style.includes('menu-niente-da-vedere.webp'),
              oldTitle:!!document.querySelector('.start-rune, #start-screen .meta-label'),
              sections:document.querySelectorAll('#start-screen').length,
              status:window.__nienteMenu.status()};
        """)
        assert info["imageLoad"] and not info["oldTitle"],info
        assert info["sections"]==1,info
        # Centros das palavras que já são parte da arte 960x540.
        for btn,y in zip(info["buttons"],(414/540,439/540,466/540)):
            assert btn["font"]=="0px",btn
            assert btn["visible"] and abs(btn["centerY"]-y)<.025,btn
            assert abs(btn["centerX"]-.5)<.02,btn
        assert info["buttons"][1]["disabled"],info
        browser.execute_script("document.getElementById('ndv-options').click()")
        assert browser.execute_script("return window.__nienteMenu.status().optionsOpen")
        browser.execute_script("document.getElementById('ndv-option-back').click()")
        assert not browser.execute_script("return window.__nienteMenu.status().optionsOpen")
        browser.execute_script("document.getElementById('start-btn').click()")
        state=browser.execute_script("return {state,menu:window.__nienteMenu.status()}")
        assert state["state"]!="start" and state["menu"]["canContinue"],state
        print("MENU QA OK: sem letras duplicadas, 3 hitboxes alinhados, opções e JOGAR funcionais.")
    except Exception:
        if browser:
            try: browser.save_screenshot("/tmp/niente_menu_fail.png")
            except Exception: pass
        traceback.print_exc()
        raise
    finally:
        if browser:browser.quit()
        server.shutdown()
