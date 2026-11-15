/* TESTE 92 — a pergunta de Pietro a Lumini fica direta.
 * Animação de corrida original MANTIDA: a versão recolorida do sprite
 * é apenas prévia externa e espera aprovação visual do criador.
 */
(()=>{
  'use strict';
  const oldDialogue=showDialogue;
  let replaced=0;
  showDialogue=function(speaker,lines,portrait,onFinish){
    const first=Array.isArray(lines)?lines[0]:'';
    if(speaker==='P'&&typeof first==='string'&&
       first.includes('Aquele portal... De onde você saiu?')){
      replaced++;
      return oldDialogue('P',[
        'Quem é vc?',
        'Você... consegue me ver?'
      ],portrait,onFinish);
    }
    return oldDialogue(speaker,lines,portrait,onFinish);
  };
  const releaseOnBlur=()=>{};
  window.__teste92={
    status:()=>({
      version:92,
      runningPreserved:true,
      firstQuestion:document.getElementById('lumini-question-name')?.textContent||'',
      questionFirstInMenu:document.querySelector('#lumini-questions-screen .lumini-choices button')?.id,
      luminiDialogueReplaced:replaced,
      corridorArt:!!window.__finaleTest71,
      newRunningArtNotInstalled:true,
      musicReference:!!document.querySelector('#soundtrack-credits72 a[href*="GQTnh9v2lhs"]')
    })
  };
})();
