/* Teste 78 — Priantes: direção do corpo, olhos no rosto e investida curta.
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

  // A checagem do jogo usa raio 10 para a física. Essas sondas antecipam
  // curvas e centralizam a figura antes que as patas alcancem a alvenaria.
  function clearance(x,y,dx,dy,distance=29,radius=14){
    return canOccupy(x+dx*distance,y+dy*distance,radius,true);
  }
  function safeDirection(p,dx,dy){
    const length=Math.hypot(dx,dy);
    if(length<.01)return null;
    const a=Math.atan2(dy,dx);
    const offsets=[0,.35,-.35,.72,-.72,1.1,-1.1,Math.PI/2,-Math.PI/2,Math.PI];
    let best=null,score=-999;
    for(const off of offsets){
      const u=Math.cos(a+off),v=Math.sin(a+off);
      if(!clearance(p.x,p.y,u,v,11,13))continue;
      const near=clearance(p.x,p.y,u,v,25,14);
      const far=clearance(p.x,p.y,u,v,43,13);
      const candidate=(near?4:0)+(far?3:0)-Math.abs(off)*1.7;
      if(candidate>score){score=candidate;best={x:u,y:v};}
    }
    return best;
  }
  function centralizeAtWall(p,dt){
    if(canOccupy(p.x,p.y,15,true))return;
    // Apenas correção pequena: não teletransporta nem atravessa paredes.
    const candidates=[[1,0],[-1,0],[0,1],[0,-1],[1,1],[1,-1],[-1,1],[-1,-1]];
    let choice=null;
    for(let radius=2;radius<=9 && !choice;radius+=2){
      for(const [dx,dy] of candidates){
        const u=dx/Math.hypot(dx,dy),v=dy/Math.hypot(dx,dy);
        if(canOccupy(p.x+u*radius,p.y+v*radius,15,true)){
          choice={dx:u,dy:v};break;
        }
      }
    }
    if(choice){
      const amount=Math.min(2.3,Math.max(0,dt)*65);
      tryMove(p,choice.dx*amount,choice.dy*amount,10,true);
    }
  }
  function floorMaskAround(p){
    // Máscara por blocos reais do mapa; as pontas das patas passam atrás da
    // parede em vez de serem desenhadas SOBRE a pedra.
    const radius=72,extra=3;
    const x0=Math.max(0,Math.floor((p.x-radius)/TILE));
    const x1=Math.min(MW-1,Math.floor((p.x+radius)/TILE));
    const y0=Math.max(0,Math.floor((p.y-radius)/TILE));
    const y1=Math.min(MH-1,Math.floor((p.y+radius)/TILE));
    g.beginPath();
    let count=0;
    for(let ty0=y0;ty0<=y1;ty0++){
      for(let tx0=x0;tx0<=x1;tx0++){
        if(map[ty0]?.[tx0]!==1)continue;
        g.rect(tx0*TILE-camera.x-extra,ty0*TILE-camera.y-extra,TILE+extra*2,TILE+extra*2);
        count++;
      }
    }
    if(count)g.clip();
  }

  let microChases=0;
  updatePriantes=function(dt){
    const now=gameTime;
    const snapshots=new Map();
    for(const p of priantes){
      snapshots.set(p,{x:p.x,y:p.y});
      if(!Number.isFinite(p.facingAngle))p.facingAngle=0;
      if(!Number.isFinite(p.walkDistance))p.walkDistance=(p.seed||0)*.13;
      const inMaze=state==='play'&&!scene1Active&&!scene2Active&&!scene3Active;
      if(!inMaze){
        p.miniState=null;
        continue;
      }
      if(keypadMistakeCount>0){
        // O comportamento da perseguição do teclado tem prioridade.
        p.miniState=null;
      }
      const d=Math.hypot(p.x-player.x,p.y-player.y);
      if(keypadMistakeCount===0){
        if(p.miniState==='alert' && now>=p.miniUntil){
          p.miniState='approach';p.miniUntil=now+.78;
          p.dirTimer=.25;
        }else if(p.miniState==='approach' && now>=p.miniUntil){
          p.miniState='retreat';p.miniUntil=now+.52;
        }else if(p.miniState==='retreat' && now>=p.miniUntil){
          p.miniState=null;p.miniUntil=0;p.dirTimer=.08;p.burst=0;
        }
        if(!p.miniState && now>=(p.miniCooldownUntil||0) &&
            d<165 && d>63 && canPrianteReach(p,player)){
          // Reconhece Pietro, contrai as patas dianteiras e fica imóvel
          // por um instante ANTES do bote.
          p.miniState='alert';
          p.miniUntil=now+.29+Math.random()*.08;
          p.miniCooldownUntil=now+7.5+Math.random()*2.0;
          p.alertFace=Math.atan2(player.y-p.y,player.x-p.x)-Math.PI/2;
          microChases++;
        }
        if(p.miniState==='alert'){
          p.rest=Math.max(p.rest||0,dt+.075);
          p.dirTimer=Math.max(p.dirTimer||0,.15);
          p.dx=0;p.dy=0;p.burst=0;
        }else if(p.miniState==='approach'||p.miniState==='retreat'){
          const sign=p.miniState==='retreat'?-1:1;
          const desiredX=(player.x-p.x)*sign;
          const desiredY=(player.y-p.y)*sign;
          const candidate=safeDirection(p,desiredX,desiredY);
          if(candidate){
            p.dx=candidate.x;p.dy=candidate.y;
            p.dirTimer=Math.max(p.dirTimer||0,.18);
            p.rest=0;p.burst=Math.max(p.burst||0,.17);
          }else{
            p.miniState='retreat';p.miniUntil=Math.min(p.miniUntil,now+.22);
            p.dirTimer=0;
          }
        }else if(Math.hypot(p.dx||0,p.dy||0)>.3){
          // Não fica tentando andar repetidamente contra a mesma parede.
          const len=Math.hypot(p.dx,p.dy),u=p.dx/len,v=p.dy/len;
          if(!clearance(p.x,p.y,u,v,30,15)){
            const alt=safeDirection(p,u,v);
            if(alt){
              p.dx=alt.x;p.dy=alt.y;
              p.dirTimer=Math.max(p.dirTimer||0,.26);
              p.rest=Math.max(p.rest||0,.045);
            }else p.dirTimer=0;
          }
        }
      }
    }
    originalUpdate(dt);
    for(const p of priantes){
      const prev=snapshots.get(p);
      if(!prev)continue;
      centralizeAtWall(p,dt);
      const vx=p.x-prev.x,vy=p.y-prev.y;
      const distance=Math.hypot(vx,vy);
      const moving=distance>Math.max(.055,dt*2.8);
      if(p.miniState==='alert'){
        const delta=shortestAngle(p.facingAngle,p.alertFace||0);
        p.facingAngle+=delta*Math.min(1,dt*6.5);
      }else if(moving){
        const desired=Math.atan2(vy,vx)-Math.PI/2;
        const delta=shortestAngle(p.facingAngle,desired);
        if(Math.abs(delta)>.80 && (p.turnCooldown||0)<now && !p.miniState &&
           keypadMistakeCount===0){
          p.turnCooldown=now+1.1;
          p.rest=Math.max(p.rest||0,.075);
          p.turnPulse=.13;
        }
        p.facingAngle+=delta*Math.min(1,dt*(p.miniState?8:5.2));
      }
      if(moving)p.walkDistance+=Math.min(distance,11);
      const target=moving?clamp01(distance/Math.max(.001,dt*85)):0;
      p.strideIntensity=(p.strideIntensity||0)+(target-(p.strideIntensity||0))*Math.min(1,dt*8);
      p.justMoved=moving;
      p.turnPulse=Math.max(0,(p.turnPulse||0)-dt);
      p.motion=Math.hypot((p.x-prev.x)/Math.max(dt,.001),(p.y-prev.y)/Math.max(dt,.001));
    }
  };
  drawPrianteArachnid=function(o,eyeLights){
    if(!atlasLoaded)return fallbackDraw(o,eyeLights);
    const x=tx(o.x),y=ty(o.y);
    const facing=Number.isFinite(o.facingAngle)?o.facingAngle:0;
    const intensity=clamp01(o.strideIntensity||0);
    const moving=intensity>.12 && o.justMoved;
    const steps=o.walkDistance||0;
    const frame=moving?walkFrames[((Math.floor(steps/5.7)%6)+6)%6]:
      (Math.sin(gameTime*1.9+(o.seed||0))>.975?1:0);
    const alert=o.miniState==='alert';
    const gait=steps/5.7;
    const bob=moving?Math.sin(gait*Math.PI)*(.85+.37*intensity):
      Math.sin(gameTime*1.6+(o.seed||0))*.18;
    const bodyTilt=moving?Math.sin(gait*.95+(o.seed||0))*.009:
      Math.sin(gameTime*.8+(o.seed||0))*.008;
    const alertLean=alert?Math.sin((gameTime-(o.miniUntil||gameTime))*9)*.024:0;
    const turnLean=(o.turnPulse||0)*.055;
    const angle=facing+bodyTilt+alertLean+turnLean;
    // Mesmo tamanho aprovado do Teste 77.
    const scale=94, spriteHeight=97, topOffset=-48;
    const pivotX=x,pivotY=y-43;
    g.save();
    floorMaskAround(o);
    g.fillStyle='rgba(0,0,0,.48)';
    g.beginPath();
    g.ellipse(x,y-7,20.2+intensity*1.6,5.9,0,0,Math.PI*2);
    g.fill();
    g.translate(pivotX,pivotY);
    g.rotate(angle);
    g.imageSmoothingEnabled=false;
    // Alternância real das patas está nos seis passos do atlas:
    // 0→1→2→3→2→1. A distância percorrida controla a fase.
    g.drawImage(atlas,frame*80,0,80,83,-scale/2,topOffset+bob,scale,spriteHeight);
    // Detalhes discretos nas articulações dianteiras, sincronizados com a
    // sequência dos quadros; não cria membros novos sobre a criatura.
    if(moving && intensity>.25){
      g.save();
      g.globalAlpha=.30*intensity;
      g.strokeStyle='#905466';g.lineWidth=1.1;
      for(const side of [-1,1]){
        const wave=Math.sin(gait*Math.PI+(side>0?Math.PI:0));
        const raise=Math.max(0,wave)*2.3;
        g.beginPath();
        g.moveTo(side*20,4);
        g.lineTo(side*(29+wave*1.5),12-raise);
        g.stroke();
      }
      g.restore();
    }
    g.restore(); // Máscara dos pisos também limita patas e sombra nas bordas.
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
    // Olhos não devem acender sobre uma parede opaca.
    if(!isWalkable(x+camera.x,y+camera.y,true))return;
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
    status:()=>({atlasLoaded,frames:4,microChases,model:'giro antecipado, repouso vivo, bote curto, desvio e oclusão nas paredes'}),
    image:atlas,
    sample:()=>priantes.slice(0,3).map(p=>({angle:p.facingAngle||0,shortPursuit:p.miniState||null,frame:walkFrames[Math.floor((p.walkDistance||0)/6.6)%6]}))
  };
  window.__prianteTest77=window.__prianteTest76;
  window.__prianteTest78=window.__prianteTest76;
})();
