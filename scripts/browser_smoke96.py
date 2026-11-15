#!/usr/bin/env python3
"""Chrome smoke Test 96 — visita o Céu, completa os seis registros da
Biblioteca e confirma que o 7 só chega depois do coro em transe.
"""
from pathlib import Path
import sys,json,threading,http.server,socketserver,traceback
root=Path(sys.argv[1] if len(sys.argv)>1 else 'site').resolve()
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.support.ui import WebDriverWait
class Quiet(http.server.SimpleHTTPRequestHandler):
    def __init__(self,*args,**kwargs):super().__init__(*args,directory=str(root),**kwargs)
    def log_message(self,*args):pass
with socketserver.TCPServer(('127.0.0.1',0),Quiet) as server:
    threading.Thread(target=server.serve_forever,daemon=True).start()
    opts=Options()
    for flag in ('--headless=new','--no-sandbox','--disable-dev-shm-usage',
                 '--disable-gpu','--window-size=1280,900',
                 '--autoplay-policy=no-user-gesture-required'):
        opts.add_argument(flag)
    browser=None
    try:
        browser=webdriver.Chrome(options=opts)
        browser.set_page_load_timeout(75)
        browser.get(f'http://127.0.0.1:{server.server_address[1]}/teste96.html')
        WebDriverWait(browser,60).until(lambda b:b.execute_script(
            'return !!(window.__teste96 && window.__teste95B && window.__teste87 && window.__finaleTest71)'))
        start=browser.execute_script("""
          setState('play');
          enterScene1();
          const npc=SCENE1_ANGELS.find(x=>x.id==='meriel');
          angelDialogue(npc);
          return {
            scene1:scene1Active,
            speaker:$('speaker').textContent,
            observation:dialogue[0],
            image:$('dialog-image').getAttribute('src')?.slice(0,24),
            seen:window.__teste96.status().observedAngels
          };
        """)
        assert start['scene1'] and start['speaker']=='P',start
        assert 'cavalete' in start['observation'] and 'meriel' in start['seen'],start
        continued=browser.execute_script("""
          const old=dialogue;
          let n=0;
          while(dialogue===old&&state==='dialog'&&n<20){nextDialogue();n++;}
          const response={speaker:$('speaker').textContent,
            first:dialogue[0], count:n};
          while(state==='dialog'&&n<40){nextDialogue();n++;}
          exitScene1(true);
          return response;
        """)
        assert 'pincel' in continued['first'].lower(),continued
        # Fill five research remarks using normal in-game records, then
        # speak to the third researcher about the sixth.
        before=browser.execute_script("""
          enterScene3();setState('play');
          for(const b of SCENE3_BOOKS)scene3ReadIds.add(b.id);
          const last=SCENE3_BOOKS.find(b=>b.owner==='percival'&&b===SCENE3_BOOKS.filter(x=>x.owner==='percival')[1]);
          if(!last)throw Error('Pesquisa VI não encontrada');
          for(const b of SCENE3_BOOKS)if(b.id!==last.id)scene3DiscussedIds.add(b.id);
          scene3OpenPerson('percival');
          scene3Choose('3');
          return {
            active:scene3Active,
            count:scene3DiscussedIds.size,
            digit:clues.arquivo||null,
            speaker:$('speaker').textContent,
            trance:window.__teste96.status().trancePlaying
          };
        """)
        assert before['active'] and before['count']==6 and not before['digit'] and not before['trance'],before
        after=browser.execute_script("""
          const lines=dialogue;let n=0;
          while(dialogue===lines&&state==='dialog'&&n<20){nextDialogue();n++;}
          return {phase:state, count:scene3DiscussedIds.size,digit:clues.arquivo||null,
            title:$('speaker').textContent,images:document.querySelectorAll('#scene3-transe96 img').length,
            active:document.querySelector('#scene3-transe96').classList.contains('active'),
            status:window.__teste96.status()};
        """)
        assert after['phase']=='dialog' and after['active'] and after['images']==3,after
        assert after['digit'] is None and '???' in after['title'],after
        result=browser.execute_script("""
          const chorus=dialogue;let n=0;
          while(dialogue===chorus&&state==='dialog'&&n<20){nextDialogue();n++;}
          const result={digit:clues.arquivo||null,trance:window.__teste96.status().trancePlaying,
            awards:window.__teste96.status().awards,speaker:$('speaker').textContent,
            note:dialogue[0]||'',n};
          return result;
        """)
        assert result['digit']=='7' and not result['trance'] and result['awards']==1,result
        assert result['speaker']=='P' and 'Sete' in result['note'],result
        preserve=browser.execute_script("""
          return {runReady:window.__teste95a?.status?.()?.readyCount??null,
            mp3:!!window.__teste95B,
            sameAssets:!!window.__prianteTest78,errors:window.__teste84.status().errors};
        """)
        assert preserve['mp3'] and preserve['sameAssets'] and not preserve['errors'],preserve
        report={'version':96,'sky':start,'angelDialogueContinues':continued,
                'sixthBook':before,'collectiveVision':after,'digitReveal':result,
                'preserved':preserve}
        (root/'qa_navegador96.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf8')
        print('BROWSER96 OK: Meriel descrição + fala; 6 pesquisas; coro de 3 presenças; cifra apenas após transe; MP3/sprites preservados.')
    except Exception:
        if browser:
            try:
                browser.save_screenshot('/tmp/browser96_fail.png')
                print('DIAG:',browser.execute_script('return {state,scene3Active,dialogue,info:window.__teste96?.status?.()}'))
            except Exception:pass
        traceback.print_exc()
        raise
    finally:
        if browser:browser.quit()
        server.shutdown()
