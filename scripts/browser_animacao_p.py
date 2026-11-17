#!/usr/bin/env python3
"""Smoketest da prévia autônoma das animações de Pietro."""
from pathlib import Path
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.support.ui import WebDriverWait
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
import threading,sys,os

root=Path(sys.argv[1] if len(sys.argv)>1 else "site").resolve()
class Handler(SimpleHTTPRequestHandler):
    def __init__(self,*args,**kwargs):super().__init__(*args,directory=str(root),**kwargs)
    def log_message(self,*args):pass

server=ThreadingHTTPServer(("127.0.0.1",0),Handler)
threading.Thread(target=server.serve_forever,daemon=True).start()
chrome=Options()
for arg in ("--headless=new","--no-sandbox","--disable-dev-shm-usage","--disable-gpu","--window-size=1050,900"):
    chrome.add_argument(arg)
browser=None
try:
    browser=webdriver.Chrome(options=chrome)
    browser.get(f"http://127.0.0.1:{server.server_port}/animacao-p.html")
    WebDriverWait(browser,40).until(lambda b:b.execute_script(
      "return !!window.__pAnimationDemo && window.__pAnimationDemo.status().ready"))
    s=browser.execute_script("return window.__pAnimationDemo.status()")
    assert s["files"]==12 and s["errors"]==[],s
    for mode in ("idle","walk","run"):
        browser.find_element("css selector",f'[data-mode="{mode}"]').click()
        st=browser.execute_script("return window.__pAnimationDemo.status()")
        assert st["mode"]==mode and st["ready"] and not st["auto"],st
        for direction in ("down","up","left","right"):
            browser.find_element("css selector",f'[data-dir="{direction}"]').click()
            WebDriverWait(browser,12).until(lambda b:b.execute_script(
                "return window.__pAnimationDemo.status().ready"))
            x=browser.execute_script("return window.__pAnimationDemo.status()")
            assert x["dir"]==direction and x["ready"],x
    browser.find_element("id","auto").click()
    assert browser.execute_script("return window.__pAnimationDemo.status().auto")
    canvas=browser.find_element("id","demo")
    assert canvas.size["width"]>200 and canvas.size["height"]>90
    print("ANIMAÇÃO P OK: 12 atlas, modos parado/andar/correr, 4 direções e autoplay.")
finally:
    if browser:browser.quit()
    server.shutdown()
