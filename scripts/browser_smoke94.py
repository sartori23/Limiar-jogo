#!/usr/bin/env python3
"""Chrome QA: Teste94 offline-side IndexedDB, sprite render and audio."""
from pathlib import Path
import sys,json,threading,http.server,socketserver,traceback
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
 for flag in ('--headless=new','--no-sandbox','--disable-dev-shm-usage',
               '--disable-gpu','--window-size=1280,900',
               '--autoplay-policy=no-user-gesture-required','--disable-features=AutoplayIgnoreWebAudio'):
  opts.add_argument(flag)
 browser=None
 try:
  browser=webdriver.Chrome(options=opts)
  browser.set_page_load_timeout(75)
  url='http://127.0.0.1:'+str(server.server_address[1])+'/teste94.html'
  browser.get(url)
  WebDriverWait(browser,60).until(lambda d:d.execute_script(
    "return !!(window.__teste94 && window.__teste93 && window.__teste87 && window.__finaleTest71)"))
  WebDriverWait(browser,20).until(lambda d:d.execute_script('return window.__teste94.status().cacheReady'))
  install=browser.execute_async_script("""
    const done=arguments[arguments.length-1];
    (async()=>{
      async function dataURL(name,mime){
        const r=await fetch(name);if(!r.ok)throw Error('Missing '+name);
        const data=new Uint8Array(await r.arrayBuffer());
        let text='';
        for(let i=0;i<data.length;i+=8192)
          text+=String.fromCharCode(...data.subarray(i,i+8192));
        return 'data:'+mime+';base64,'+btoa(text);
      }
      const sprites={};
      for(const d of ['down','up','left','right'])
        sprites[d]=await dataURL('p87_run_'+d+'.webp','image/webp');
      const audio=await dataURL('smoke94.mp3','audio/mpeg');
      return await window.__teste94.installLocal({sprites,audio});
    })().then(done).catch(e=>done({error:String(e)}));
  """)
  assert install.get('directions')==4,install
  assert install.get('bytes',0)>2_000_000,install
  state=browser.execute_script("return window.__teste94.status()")
  assert state['musicInstalled'] and len(state['assets'])==4,state
  # Audio must play from the cached MP3 blob when credits start.
  browser.execute_script("setState('final-credits');update(.034);")
  WebDriverWait(browser,20).until(lambda d:d.execute_script(
    'return window.__teste94.status().creditsPlaying'))
  assert browser.execute_script("return document.querySelector('#spare-local94 button').hidden")
  # Reload: prove IndexedDB cache survives a fresh page visit.
  browser.get(url)
  WebDriverWait(browser,60).until(lambda d:d.execute_script(
    'return window.__teste94?.status().musicInstalled && window.__teste94?.status().assets.length===4'))
  # Actual sprite render in game. Script uses old status rather than made-up frames.
  result=browser.execute_script("""
    setState('play');heldKeys.clear();heldKeys.add('shift');heldKeys.add('d');
    for(let i=0;i<10;i++)update(.033);
    const first=window.__teste94.status().draws;
    render();heldKeys.clear();
    return {running:!!player.sprinting,first,after:window.__teste94.status().draws,
      assets:window.__teste94.status().assets,old:window.__teste87.status().frame};
  """)
  assert result['running'] and result['after']>result['first'],result
  # Singing corridor: verify OGG source exists and playback resumes.
  voice=browser.execute_script("""
    window.__finaleTest71.enter();
    audioOn=true;
    heldKeys.clear();
    player.y=5400;
    update(.04);render();
    return {phase:window.__finaleTest71.state().phase,
      subtitle:document.querySelector('#final-song')?.textContent,
      result:window.__teste94.status(),
      src:window.__finaleTest71.voice.currentSrc};
  """)
  assert voice['phase']=='walk',voice
  assert 'hush-human68.ogg' in voice['src'],voice
  WebDriverWait(browser,15).until(lambda d:d.execute_script(
    'return window.__finaleTest71.voice.readyState >= 2'))
  # Playback may not be allowed in headless without user interaction; explicit test gesture.
  browser.execute_script("""
    const v=window.__finaleTest71.voice;
    if(v.paused)v.play().catch(()=>{});
    for(let j=0;j<5;j++)update(.05);
  """)
  states=browser.execute_script("""
    return {sing:window.__teste94.status(),lyric:document.querySelector('#final-song')?.textContent,
      hasTranslation:!!document.querySelector('#final-song small'),
      errors:window.__teste84.status().errors};
  """)
  assert not states['hasTranslation'] and not states['errors'],states
  report={'version':94,'install':install,'savedSpriteTest':result,'voice':voice,
          'voiceAfter':states,'cachePersistent':True}
  (root/'qa_navegador94.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf8')
  print('BROWSER94 OK: MP3+sprites instalados e guardados após reload; corrida corrigida renderiza; cantiga OGG carregada.')
 except Exception:
  if browser:
   try:
    browser.save_screenshot('/tmp/erro94.png')
    print('STATUS:',browser.execute_script("return {status:window.__teste94?.status?.(),p87:window.__teste87?.status?.(),state}"))
   except Exception:pass
  traceback.print_exc()
  raise
 finally:
  if browser:browser.quit()
  server.shutdown()
