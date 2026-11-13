/* TESTE 80 — Movimento final de Pietro e continuidade com os Priantes.
 * Unifica direcoes nas tres memorias e no labirinto sem trocar os sprites originais.
 */
(()=>{
  'use strict';
  const oldUpdate=update;
  const oldScene1Avatar=drawScene1Avatar;
  const oldDrawP=drawAnimatedP;
  let dir='down', lastPlayer=null,lastFootstep=-1, motion=0, blockedFrames=0;
  const headings=[['right',1,0],['left',-1,0],['down',0,1],['up',0,-1]];
  function choose(dx,dy){
    const speed=Math.hypot(dx,dy);
    if(speed<.035)return dir;
    // Histerese: diagonais não mudam entre perfil/frente a cada pequeno passo.
    const scores=headings.map(([name,x,y])=>({name,score:(dx*x+dy*y)/speed+(name===dir?.19:0)}));
    scores.sort((a,b)=>b.score-a.score);
    return scores[0].name;
  }
  update=function(dt){
    const p=player;
    const x=p.x,y=p.y,oldStep=p.step||0;
    const answer=oldUpdate(dt);
    if(player!==p){lastPlayer=player;blockedFrames=0;return answer;}
    if(state==='play'||state==='waking'){
      const dx=p.x-x,dy=p.y-y,d=Math.hypot(dx,dy);
      if(d>.08){
        dir=choose(dx,dy);
        p.dir=dir;
        blockedFrames=0;
      }else if(p.moving){
        blockedFrames++;
        if(blockedFrames>=2){
          p.moving=false;
          p.moveBlend=Math.max(0,(p.moveBlend||0)-Math.max(0,dt)*8);
        }
      }
      motion+=(Math.min(1,d/Math.max(.001,dt*155))-motion)*Math.min(1,dt*13);
      // O passo só avança quando há deslocamento real.
      if(d<.035&&p.step!==oldStep)p.step=oldStep;
      if(scene1Active&&state==='play'&&audioOn&&p.moving&&
          Math.floor(p.step)>lastFootstep){
        lastFootstep=Math.floor(p.step);
        if(Math.floor(p.step)%2===0)playSound('step');
      }
    }
    return answer;
  };
  // O Céu Dourado ainda utilizava quadros antigos sempre de frente.
  // Passe a usar o MESMO personagem direcional das outras memórias.
  drawScene1Avatar=function(){
    const px=tx(player.x),py=ty(player.y);
    if(!Number.isFinite(px)||!Number.isFinite(py)){oldScene1Avatar();return;}
    const size=P_RENDER_SIZE;
    g.save();
    g.globalCompositeOperation='source-over';g.globalAlpha=1;g.filter='none';
    g.imageSmoothingEnabled=false;
    g.fillStyle='rgba(5,7,16,.43)';
    g.beginPath();g.ellipse(px,py+2,18,5.5,0,0,Math.PI*2);g.fill();
    const bob=player.moving?Math.sin((player.step||0)*Math.PI*2)*.55:0;
    oldDrawP(player.x,player.y,size,player.dir,bob);
    g.restore();
  };
  const oldRetry=retry;
  retry=function(all){
    blockedFrames=0;motion=0;lastFootstep=-1;lastPlayer=null;dir='down';
    return oldRetry(all);
  };
  window.__teste80={
    status:()=>({direction:dir,velocity:motion,blockedFrames,scene1Directional:true,
      priantes:typeof window.__prianteTest78==='object',
      restoredOriginalOnMissingAtlas:typeof oldScene1Avatar==='function'})
  };
})();