#!/usr/bin/env python3
"""Smoke test da rota Backrooms em Chrome sem teleportes na interface."""
import http.server,socketserver,threading,sys
from pathlib import Path
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.support.ui import WebDriverWait
root=Path(sys.argv[1] if len(sys.argv)>1 else "site").resolve()
class Server(http.server.SimpleHTTPRequestHandler):
 def __init__(self,*a,**kw):super().__init__(*a,directory=str(root),**kw)
 def log_message(self,*a):pass
with socketserver.TCPServer(('127.0.0.1',0),Server) as serv:
 threading.Thread(target=serv.serve_forever,daemon=True).start()
 opt=Options()
 for x in ('--headless=new','--no-sandbox','--disable-dev-shm-usage','--disable-gpu','--window-size=1280,800'):
  opt.add_argument(x)
 browser=webdriver.Chrome(options=opt)
 try:
  browser.get('http://127.0.0.1:%s/teste97.html'%serv.server_address[1])
  WebDriverWait(browser,90).until(lambda d:d.execute_script(
   'return !!(window.__backrooms97&&window.__teste96&&window.__finaleTest66&&window.__nienteMenu)'))
  status=browser.execute_script('return __backrooms97.status()')
  assert status['password']=='2174',status
  assert status['normalEndingPreserved'] and not status['enteredAnyMemory'],status
  # Digitar a senha legítima sem nenhuma visita: marca rota, não antecipa final.
  info=browser.execute_script("""
   setState('keypad');inputCode=CONFIG.password.slice(0,3);checkCode();
   return {code:CONFIG.password,status:__backrooms97.status(),doorUnlocked};
  """)
  assert info['doorUnlocked'] and info['status']['armed'] and not info['status']['active'],info
  # Atravessar a Grande Porta; endGame é chamado pelo detector já existente.
  browser.execute_script("setState('play');endGame();")
  entry=browser.execute_script("return __backrooms97.status()")
  assert entry['active'] and not entry['armed'] and not entry['finished'],entry
  # Limites de movimento e pintura em canvas.
  browser.execute_script("render();update(.06);")
  assert browser.execute_script("return __backrooms97.status().active")
  # Silhueta no final, sem diálogo ou perseguidor.
  browser.execute_script("""
   player.x=22.5*64-28;player.y=1.5*64;
   update(.1);update(2);
  """)
  completed=browser.execute_script("return __backrooms97.status()")
  assert completed['finished'] and completed['encountered'],completed
  assert completed['gameState']=='backrooms-end',completed
  # Recarrega a página: entrar em qualquer memória cancela o easter egg.
  browser.refresh()
  WebDriverWait(browser,90).until(lambda d:d.execute_script('return !!window.__backrooms97'))
  visit=browser.execute_script("""
    enterScene1();
    setState('keypad');inputCode=CONFIG.password.slice(0,3);checkCode();
    let before=__backrooms97.status();
    setState('play');endGame();
    return {before,after:__backrooms97.status(),final:__finaleTest66.state().active};
  """)
  assert visit['before']['enteredAnyMemory'] and not visit['before']['armed'],visit
  assert not visit['after']['active'] and visit['final'],visit
  print('BACKROOMS 97 OK: senha correta, zero memórias -> segredo; visita -> corredor; final negro sem fala.')
 finally:
  browser.quit();serv.shutdown()
