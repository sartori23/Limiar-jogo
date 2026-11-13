/* Exercício de integração do controlador dos Priantes do Teste 78.
 * Executado no Node com tela Canvas simulada: nenhuma imagem ou arquivo externo.
 */
const fs=require('fs'),vm=require('vm'),assert=require('assert');
const script=fs.readFileSync('site/priante-teste76.js','utf8');
class ImageMock{
  constructor(){this.naturalWidth=320;this.naturalHeight=83;this.complete=true;this.listeners={};}
  set src(v){this._src=v;}
  get src(){return this._src;}
  addEventListener(k,cb){this.listeners[k]=cb;if(k==='load')cb();}
}
let clips=0,draws=0;
const paint={
  save(){},restore(){},beginPath(){},rect(){},ellipse(){},fill(){},clip(){clips++;},
  translate(){},rotate(){},moveTo(){},lineTo(){},stroke(){},fillRect(){},
  drawImage(){draws++;},
  createRadialGradient(){return {addColorStop(){}};}
};
const P={x:210,y:178,vx:0,vy:0},E={
 x:100,y:180,seed:1,dx:0,dy:0,dirTimer:1,speed:34,rest:0,burst:0,
 chaseEndsAt:0,temperament:1,vxVisual:0,vyVisual:0
};
const map=Array.from({length:12},(_,y)=>Array.from({length:12},(_,x)=>x===0||x===11||y===0||y===11||x===3&&y>=3&&y<=7?0:1));
const canOccupy=(x,y,r=10)=>{
 const at=(a,b)=>map[Math.floor(b/40)]?.[Math.floor(a/40)]===1;
 return at(x-r,y-r)&&at(x+r,y-r)&&at(x-r,y+r)&&at(x+r,y+r);
};
const ctx={
 console,Math,URL,Image:ImageMock,document:{currentScript:{src:'file:///tmp/priante-teste76.js'}},g:paint,map,TILE:40,MW:12,MH:12,
 camera:{x:0,y:0},player:P,priantes:[E],
 gameTime:0,keypadMistakeCount:0,state:'play',
 scene1Active:false,scene2Active:false,scene3Active:false,
 tx:(x)=>x,ty:(y)=>y,audioOn:true,window:{},
 canOccupy,canPrianteReach:()=>true,isWalkable:(x,y)=>map[Math.floor(y/40)]?.[Math.floor(x/40)]===1,
 tryMove:(p,dx,dy,r)=>{
   if(canOccupy(p.x+dx,p.y,r))p.x+=dx;
   if(canOccupy(p.x,p.y+dy,r))p.y+=dy;
 },
 updatePriantes:(dt)=>{
   for(const p of ctx.priantes){
     p.dirTimer-=dt;
     if(p.rest>0)p.rest-=dt;
     else {ctx.tryMove(p,(p.dx||0)*p.speed*dt,(p.dy||0)*p.speed*dt,10);}
   }
 },
 drawPrianteArachnid:()=>{},glowOnEye:()=>{},
};
vm.createContext(ctx);
vm.runInContext(script,ctx,{filename:'priante-teste76.js'});
assert(ctx.window.__prianteTest78,'Teste 78 não instalado');
assert(ctx.window.__prianteTest78.status().atlasLoaded,'Atlas não carregou');
let seenAlert=false,seenApproach=false,seenRetreat=false;
for(let k=0;k<75;k++){
 ctx.gameTime+=.05;
 ctx.updatePriantes(.05);
 if(E.miniState==='alert')seenAlert=true;
 if(E.miniState==='approach')seenApproach=true;
 if(E.miniState==='retreat')seenRetreat=true;
 assert(canOccupy(E.x,E.y,10),'Centro atravessou parede');
 const eyes=[];
 ctx.drawPrianteArachnid(E,eyes);
 assert.equal(eyes.length,2,'Cada pose deve ter dois olhos');
 for(const eye of eyes)assert(Number.isFinite(eye.x)&&Number.isFinite(eye.y),'Olho sem transformação válida');
}
assert(seenAlert&&seenApproach&&seenRetreat,'Sequência alerta-investida-recuo incompleta');
assert(clips>0,'Máscara de paredes não ativada');
assert(draws>0,'Atlas não desenhado');
assert(E.facingAngle!==0,'Corpo não virou para a direção de caminhada');
ctx.glowOnEye(150,150,.8,1);
console.log('Teste 78 OK: alerta, investida, recuo, curva, olhos por pose, máscara de paredes e colisões.');
