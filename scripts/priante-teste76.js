/* Teste 77 — Priantes: direção do corpo, olhos no rosto e investida curta.
 * Preserva atlas 73, colisões e comportamentos de erro do teclado.
 */
(()=>{
  'use strict';
  const atlas=new Image();
  const base=document.currentScript?.src||location.href;
  atlas.src=new URL('priante73.webp',base).href;
  let atlasLoaded=false;
  atlas.addEventListener('load',()=>{
    atlasLoaded=atlas.naturalWidth===320&&atlas.naturalHeight===83;
  });
  atlas.addEventListener('error',()=>{atlasLoaded=false;});
  const fallbackDraw=drawPrianteArachnid;
  const originalUpdate=updatePriantes;
  const originalGlow=glowOnEye;
  const clamp01=(v)=>Math.min(1,Math.max(0,v));
  const shortestAngle=(a,b)=>Math.atan2(Math.sin(b-a),Math.cos(b-a));
  // Atlas aprovado: 4 poses, a cabeça aponta para baixo.
  const walkFrames=[0,1,2,3,2,1];
  // Coordenadas locais dos olhos dentro de cada pose (80 × 83 pixels).
  const eyesByFrame=[
    [[34.5,51.8],[44,51.4]],
    [[40.5,51.7],[46,49.6]],
    [[40.5,58.5],[45.5,55.1]],
    [[36.5,49.7],[43,46.8]]
  ];
  const pauseOffsets=[0,1.1,2.3,3.6];
  let microChases=0;
  updatePriantes=function(dt){
    const now=gameTime;
    // O perseguidor só investe rapidamente ao encontrar Pietro nas proximidades.
    // Não interfere na perseguição maior, que ocorre após errar o código.
    const snapshots=new Map();
    for(const p of priantes){
      snapshots.set(p,{x:p.x,y:p.y});
      if(!Number.isFinite(p.facingAngle))p.facingAngle=0;
      if(state!=='play'||scene1Active||scene2Active||scene3Active)continue;
      if(keypadMistakeCount>0)continue;
      const distance=Math.hypot(p.x-player.x,p.y-player.y);
      if(p.miniState==='approach' && now>=p.miniUntil){
        p.miniState='retreat';p.miniUntil=now+.57;
      }else if(p.miniState==='retreat' && now>=p.miniUntil){
        p.miniState=null;p.miniUntil=0;p.dirTimer=0;p.burst=0;
      }
      if(!p.miniState && !p.chaseEndsAt &&
         now>=(p.miniCooldownUntil||0) &&
         distance<174 && distance>48 &&
         canPrianteReach(p,player)){
        p.miniState='approach';
        p.miniUntil=now+.93;
        p.miniCooldownUntil=now+6.2+Math.random()*2.1;
        microChases++;
      }
      if(p.miniState && p.miniUntil>now){
        const sign=p.miniState==='retreat'?-1:1;
        const dx=(player.x-p.x),dy=(player.y-p.y);
        const d=Math.max(1,Math.hypot(dx,dy));
        p.dx=dx/d*sign;
        p.dy=dy/d*sign;
        // Bloqueia a escolha aleatória só durante a investida / recuo.
        p.dirTimer=Math.max(p.dirTimer||0,.085+Math.min(dt,.04));
        p.rest=0;
        p.burst=Math.max(p.burst||0,.15);
      }
    }
    originalUpdate(dt);  // Física, impacto e colisões originais do Limiante.
    for(const p of priantes){
      const start=snapshots.get(p);
      if(!start)continue;
      const vx=p.x-start.x,vy=p.y-start.y;
      const step=Math.hypot(vx,vy);
      const moving=step>Math.max(.055,dt*2.8);
      const headingVx=moving?vx:p.dx||0;
      const headingVy=moving?vy:p.dy||0;
      if(moving && Math.hypot(headingVx,headingVy)>.01){
        const desired=Math.atan2(headingVy,headingVx)-Math.PI/2;
        const diff=shortestAngle(p.facingAngle,desired);
        const rate=Math.min(1,dt*(p.miniState?8:5.5));
        p.facingAngle+=diff*rate;
        p.lastHeadingAt=now;
      }
      if(!Number.isFinite(p.walkDistance))p.walkDistance=(p.seed||0)*.13;
      if(moving)p.walkDistance+=Math.min(step,12);
      const targetStride=moving?clamp01(step/Math.max(.001,dt*85)):0;
      p.strideIntensity=(p.strideIntensity||0)+(targetStride-(p.strideIntensity||0))*Math.min(1,dt*9);
      p.justMoved=moving;
    }
  };
  drawPrianteArachnid=function(o,eyeLights){
    if(!atlasLoaded)return fallbackDraw(o,eyeLights);
    const x=tx(o.x),y=ty(o.y);
    const facing=Number.isFinite(o.facingAngle)?o.facingAngle:0;
    const intensity=clamp01(o.strideIntensity||0);
    const moving=intensity>.12 && o.justMoved;
    const steps=o.walkDistance||0;
    const phase=Math.floor(steps/6.6);
    const frame=moving?walkFrames[((phase%6)+6)%6]:
      (Math.sin(gameTime*1.5+(o.seed||0))>.985?1:0);
    const bob=moving?Math.sin(steps/6.6*Math.PI)*(.85+.35*intensity):
      Math.sin(gameTime*1.75+(o.seed||0))*.20;
    // A oscilação é pequena: não gira o monstro separadamente de suas patas.
    const bodyTilt=moving?Math.sin(steps/13+(o.seed||0))*.009:0;
    const angle=facing+bodyTilt;
    // 19% menor: escala visual, não mexe no comportamento nem nas colisões.
    const scale=94, spriteHeight=97, topOffset=-48;
    const pivotX=x,pivotY=y-43;
    g.save();
    g.fillStyle='rgba(0,0,0,.48)';
    g.beginPath();
    g.ellipse(x,y-7,20.2+intensity*1.6,5.9,0,0,Math.PI*2);
    g.fill();
    g.translate(pivotX,pivotY);
    g.rotate(angle);
    g.imageSmoothingEnabled=false;
    g.drawImage(atlas,frame*80,0,80,83,-scale/2,topOffset+bob,scale,spriteHeight);
    g.restore();
    // Os pontos vermelhos são calculados nas coordenadas da MESMA pose e
    // transformados pelo MESMO ângulo e balanço do corpo. Sem globo solto.
    const cs=Math.cos(angle),sn=Math.sin(angle);
    const eyes=eyesByFrame[frame];
    for(let i=0;i<eyes.length;i++){
      const [u,v]=eyes[i];
      const lx=(u/80-.5)*scale;
      const ly=topOffset+v/83*spriteHeight+bob;
      eyeLights.push({
        x:pivotX+lx*cs-ly*sn,
        y:pivotY+lx*sn+ly*cs,
        w:i===0?.73:.62,
        seed:o.seed||0,
        priante76:true
      });
    }
  };
  // A névoa dos olhos deixa de ser um círculo grande: duas luzes pequenas,
  // desenhadas apenas após a iluminação do labirinto.
  glowOnEye=function(x,y,weight,seed){
    if(!atlasLoaded)return originalGlow(x,y,weight,seed);
    const pulse=.86+.14*Math.sin(gameTime*6+seed);
    const r=2.7;
    g.save();
    g.globalCompositeOperation='screen';
    g.globalAlpha=Math.min(.54,weight*.63)*pulse;
    const halo=g.createRadialGradient(x,y,0,x,y,r);
    halo.addColorStop(0,'rgba(255,106,98,.78)');
    halo.addColorStop(.48,'rgba(226,34,44,.42)');
    halo.addColorStop(1,'rgba(185,12,26,0)');
    g.fillStyle=halo;
    g.fillRect(x-r,y-r,2*r,2*r);
    g.restore();
  };
  window.__prianteTest76={
    status:()=>({atlasLoaded,frames:4,microChases,model:'aracnídeo original; rotação direcional suave; olhos presos à pose'}),
    image:atlas,
    sample:()=>priantes.slice(0,3).map(p=>({angle:p.facingAngle||0,shortPursuit:p.miniState||null,frame:walkFrames[Math.floor((p.walkDistance||0)/6.6)%6]}))
  };
  window.__prianteTest77=window.__prianteTest76;
})();
