#!/usr/bin/env python3
"""Smoke Chrome: rota secreta somente após senha correta sem entrar nas memórias."""
from collections import deque
from pathlib import Path
import http.server
import socketserver
import threading
import time
import sys
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.support.ui import WebDriverWait

site=Path(sys.argv[1] if len(sys.argv)>1 else "site").resolve()
assert (site/"teste-backrooms.html").is_file()
class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self,*a,**kw):
        super().__init__(*a,directory=str(site),**kw)
    def log_message(self,*_):pass

with socketserver.TCPServer(("127.0.0.1",0),Handler) as server:
    threading.Thread(target=server.serve_forever,daemon=True).start()
    opts=Options()
    for option in ["--headless=new","--no-sandbox","--disable-dev-shm-usage",
                   "--disable-gpu","--window-size=1280,800"]:
        opts.add_argument(option)
    driver=webdriver.Chrome(options=opts)
    driver.set_page_load_timeout(100)
    url="http://127.0.0.1:"+str(server.server_address[1])+"/teste-backrooms.html"
    try:
        def open_game():
            driver.get(url)
            WebDriverWait(driver,80).until(lambda d:d.execute_script(
                "return !!(window.__backroomsEasterEgg && window.__nienteMenu && typeof endGame==='function')"))
            return driver.execute_script("return window.__backroomsEasterEgg.status()")
        def enter_correct_code():
            # Testa o botão de confirmação real, não apenas um helper de QA.
            return driver.execute_script("""
                state='keypad';
                inputCode=CONFIG.password.slice(0,3);
                document.getElementById('enter-key').click();
                return {open:doorUnlocked,passwordLength:CONFIG.password.length,
                    status:window.__backroomsEasterEgg.status()};
            """)
        def cross_gate():
            return driver.execute_script("""
                state='play';doorOpenProgress=1;doorOpened=true;
                endGame();
                return {secret:window.__backroomsEasterEgg.status(),
                  regular:window.__finaleTest71?.state?.().active||false,
                  visible:!document.getElementById('backrooms-screen').classList.contains('hidden')};
            """)
        before=open_game()
        assert not before["visitedAnyRoom"] and not before["active"],before
        code=enter_correct_code()
        assert code["open"] and code["status"]["secretEligible"],code
        route=cross_gate()
        assert route["secret"]["active"] and route["visible"] and not route["regular"],route
        assert route["secret"]["gameState"]=="backrooms",route
        soundtrack=driver.execute_script("return window.__soundtrackTest72?.cueForState?.()")
        assert soundtrack is None,{"soundtrack":soundtrack}
        terrain=driver.execute_script("return window.__backroomsEasterEgg.inspectMap()")
        assert len(terrain)==21 and all(len(row)==31 for row in terrain)
        start=(17,3)
        goal=(3,27)
        todo=deque([start])
        seen={start}
        while todo:
            y,x=todo.popleft()
            for yy,xx in [(y+1,x),(y-1,x),(y,x+1),(y,x-1)]:
                if 0<=yy<len(terrain) and 0<=xx<len(terrain[yy]) and terrain[yy][xx]=='.' and (yy,xx) not in seen:
                    seen.add((yy,xx));todo.append((yy,xx))
        assert goal in seen,"A silhueta final deve estar alcançável"
        time.sleep(1.0)
        y0=driver.execute_script("return window.__backroomsEasterEgg.status().y")
        driver.execute_script("document.dispatchEvent(new KeyboardEvent('keydown',{key:'w',bubbles:true,cancelable:true}));")
        time.sleep(.33)
        driver.execute_script("document.dispatchEvent(new KeyboardEvent('keyup',{key:'w',bubbles:true,cancelable:true}));")
        y1=driver.execute_script("return window.__backroomsEasterEgg.status().y")
        assert y1<y0-8,{"y_before":y0,"y_after":y1}
        print("ROTA SECRETA: senha certa e zero salas -> Backrooms; movimento, silêncio e mapa verificados.")

        open_game()
        # Entrar em UMA sala bloqueia para sempre a rota secreta desta sessão.
        driver.execute_script("enterScene1()")
        entered=driver.execute_script("return window.__backroomsEasterEgg.status()")
        assert entered["visitedAnyRoom"],entered
        code=enter_correct_code()
        assert code["open"] and not code["status"]["secretEligible"],code
        ordinary=cross_gate()
        assert not ordinary["secret"]["active"] and ordinary["regular"],ordinary
        print("ROTA NORMAL: visita a qualquer memória -> corredor do perseguidor preservado.")
    finally:
        driver.quit()
        server.shutdown()
