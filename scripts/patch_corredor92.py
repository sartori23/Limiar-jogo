#!/usr/bin/env python3
"""Teste 92: polimento visual do corredor final, sem mudar mecânicas/salas.
Sombras, pedra quebrada, ferragens, marcas de arrasto, poeira e reflexos
sutis da lamparina. O trajeto continua retilíneo e livre de obstáculos.
"""
from pathlib import Path
import shutil,sys
root=Path(sys.argv[1] if len(sys.argv)>1 else 'site')
old=root/'finale-teste90.js'
new=root/'finale-teste92.js'
shutil.copyfile(old,new)
s=new.read_text(encoding='utf8')
needle="""    g.fillStyle='#020306';g.fillRect(0,0,274,H);g.fillRect(686,0,W-686,H);
    // A única luz do percurso vem de sua lamparina."""
assert s.count(needle)==1, ('Corredor original alterado',s.count(needle))
replacement=r"""    g.fillStyle='#020306';g.fillRect(0,0,274,H);g.fillRect(686,0,W-686,H);

    // TESTE 92 — O corredor fica intacto em seu traçado: nenhum objeto
    // decorativo recebe colisão e não há novos caminhos ou saídas.
    // Detalhes de profundidade e desgaste com coordenadas MUNDIAIS
    // para não cintilar/teletransportar ao mover a câmera.
    g.save();
    for(let i=-3;i<20;i++){
      const block=Math.floor(cameraTop/91)+i;
      const wy=block*91,sy=Math.round(wy-cameraTop);
      const odd=block&1;
      const grain=Math.abs(Math.sin(block*17.39)*117.79)%1;
      const grainB=Math.abs(Math.sin(block*31.71)*49.21)%1;
      // Lajes do piso central: sempre paralelas ao corredor.
      g.fillStyle='rgba(84,81,83,.085)';
      g.fillRect(343,sy+2,273,1);
      g.fillStyle='rgba(2,2,5,.55)';
      g.fillRect(344,sy+4,271,2);
      const seamX=odd?432:512;
      g.fillStyle='rgba(95,87,85,.095)';
      g.fillRect(seamX,sy+3,1,87);
      g.fillStyle='rgba(0,0,0,.25)';
      g.fillRect(seamX+2,sy+3,2,86);

      // Fissuras curtas e irregulares, nunca blocos sobre o personagem.
      const x1=369+Math.round(grain*208);
      const x2=x1+(odd?-17:19);
      g.strokeStyle='rgba(2,1,5,.48)';
      g.lineWidth=2;g.beginPath();
      g.moveTo(x1,sy+16);
      g.lineTo(x1+6,sy+34);
      g.lineTo(x2,sy+42);
      g.lineTo(x2+3,sy+57);
      g.stroke();
      g.strokeStyle='rgba(128,111,100,.13)';
      g.lineWidth=1;g.beginPath();
      g.moveTo(x1+2,sy+16);g.lineTo(x1+8,sy+34);g.stroke();

      // Ferragens das paredes: rebites, malha enferrujada e nervuras.
      for(const side of [-1,1]){
        const wx=side<0?292:642;
        g.fillStyle='rgba(82,74,75,.18)';
        g.fillRect(wx-3,sy+14,18,2);
        g.fillRect(wx-3,sy+55,18,1);
        g.fillStyle='rgba(6,5,8,.58)';
        g.fillRect(wx+6,sy+17,2,40);
        g.fillStyle='rgba(128,91,75,.21)';
        g.fillRect(wx+5,sy+18,1,34);
        g.fillStyle='rgba(129,97,85,.30)';
        g.fillRect(wx+2,sy+18,3,3);
        g.fillRect(wx+2,sy+50,3,3);
        if(block%3===0){
          g.strokeStyle='rgba(110,105,102,.16)';
          g.beginPath();g.moveTo(wx-4,sy+74);
          g.lineTo(wx+9,sy+66);g.lineTo(wx+14,sy+79);g.stroke();
        }
      }
      // Umidade e sujeira nos cantos próximos às paredes.
      g.fillStyle='rgba(23,30,32,.25)';
      g.fillRect(335,sy+20+Math.round(grainB*12),5+Math.round(grain*6),39);
      g.fillRect(620-Math.round(grain*7),sy+8,5+Math.round(grainB*7),60);
      // Marcas de arrasto espaçadas pelo caminho.
      if(block%5===0){
        g.fillStyle='rgba(114,72,64,.16)';
        g.fillRect(463+Math.round(grain*14),sy+21,2,24);
        g.fillRect(471+Math.round(grainB*12),sy+14,2,31);
        g.fillStyle='rgba(9,7,10,.5)';
        g.fillRect(469,sy+46,12,1);
      }
      // Pequenas partículas suspensas: pontos estáveis no mundo.
      if(block%2===0){
        const moteX=359+Math.round(grain*249);
        g.fillStyle='rgba(165,148,122,.17)';
        g.fillRect(moteX,sy+25+Math.round(grainB*40),1,1);
      }
    }
    // Reflexo frio muito fraco no chão: revela textura sem criar nova lâmpada.
    g.globalCompositeOperation='screen';
    glow(474,Math.round(H*.66),175,'rgba(65,80,91,ALPHA)',.08);
    g.restore();

    // A única luz do percurso vem de sua lamparina."""
s=s.replace(needle,replacement,1)
# Mancha dinâmica da luz real de sua lamparina sobre piso e ferragens
needle2="""      glow(FINALE.manX+26,manY-75,105,'rgba(255,177,61,ALPHA)',FINALE.torch*.85);
      g.restore();"""
assert s.count(needle2)==1,('luz antiga mudou',s.count(needle2))
new2="""      glow(FINALE.manX+26,manY-75,105,'rgba(255,177,61,ALPHA)',FINALE.torch*.85);
      // Os reflexos sobem nas ferragens e no piso molhado à sua passagem.
      glow(Math.max(345,Math.min(614,FINALE.manX+8)),manY-12,148,
        'rgba(236,124,46,ALPHA)',FINALE.torch*.28*flicker);
      g.restore();"""
s=s.replace(needle2,new2,1)
new.write_text(s,encoding='utf8')
print('CORREDOR92 OK: grão, lajes, fissuras, rebites, marcas, umidade e reflexos dinâmicos — nenhum obstáculo novo.')
