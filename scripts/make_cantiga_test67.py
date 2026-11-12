#!/usr/bin/env python3
"""Cantiga ORIGINAL em português com voz masculina sintetizada para o prólogo.
Sem gravações musicais protegidas de terceiros. Requer espeak e ffmpeg."""
import array, io, math, random, subprocess, sys, wave
from pathlib import Path
R=16000
NOTES=[('Dorme',146.83,1.14),('dorme',130.81,1.12),('pequeno',110.,1.7),
 ('a',110.,.42),('noite',123.47,1.08),('vem',130.81,.78),('te',123.47,.4),('buscar',98.,1.78),
 ('Fecha',146.83,1.15),('fecha',130.81,1.08),('os',123.47,.38),('olhos',110.,1.52),
 ('ainda',110.,1.0),('não',123.47,.67),('é',110.,.4),('hora',98.,.87),('de',92.5,.39),('acordar',82.41,1.9)]
GAPS=[.09,.14,.45,.07,.10,.04,.08,.57,.10,.10,.06,.51,.07,.06,.04,.07,.04,.38]
def word_audio(word):
    data=subprocess.check_output(['espeak','-v','pt-br+m1','-s','100','-p','22','-a','155','--stdout',word])
    with wave.open(io.BytesIO(data),'rb') as f:
        rate=f.getframerate()
        pcm=array.array('h');pcm.frombytes(f.readframes(f.getnframes()))
    x=[v/32768 for v in pcm]
    if rate!=R:
        n=int(len(x)*R/rate)
        return [x[min(len(x)-1,int(j*rate/R))] for j in range(n)]
    return x
out=[]
noise=random.Random(13)
for i,(word,freq,duration) in enumerate(NOTES):
    x=word_audio(word)
    if not x:continue
    trim=120
    while trim<len(x)-300 and abs(x[trim])<.015:trim+=1
    x=x[max(0,trim-270):]
    n=int(R*duration)
    for j in range(n):
        t=j/R
        point=(j/(n-1))*max(0,len(x)-1)
        a=int(point); frac=point-a
        voice=(x[a]*(1-frac)+x[min(a+1,len(x)-1)]*frac)
        phase=2*math.pi*(freq*t+.0033*freq*math.sin(2*math.pi*4.6*t))
        tone=(math.sin(phase)*.22+math.sin(phase*2)*.075+math.sin(phase*3)*.03)
        env=min(1,t/.11,max(0,(duration-t)/.19))
        breath=(noise.random()-.5)*.022
        out.append((voice*.54+tone+breath)*env)
    out.extend([0.]*(int(GAPS[i]*R)))
out=[0.]*(int(.45*R))+out+[0.]*(int(1.1*R))
for delay,amount in [(int(.23*R),.21),(int(.47*R),.14),(int(.93*R),.10),(int(1.61*R),.06)]:
    for k in range(delay,len(out)):
        out[k]+=out[k-delay]*amount*.55
peak=max(abs(x) for x in out)
output=Path(sys.argv[1] if len(sys.argv)>1 else 'cantiga-67.ogg')
output.parent.mkdir(parents=True,exist_ok=True)
raw=io.BytesIO()
with wave.open(raw,'wb') as f:
    f.setnchannels(1);f.setsampwidth(2);f.setframerate(R)
    pcm=array.array('h',(int(max(-32766,min(32766,(v/peak)*24000))) for v in out))
    f.writeframes(pcm.tobytes())
subprocess.run(['ffmpeg','-hide_banner','-loglevel','error','-y','-i','pipe:0','-c:a','libopus',
    '-b:a','24k','-vbr','on','-ar',str(R),'-ac','1',str(output)],input=raw.getvalue(),check=True)
print('Cantiga sintetizada:',output,output.stat().st_size,'bytes',len(out)/R,'segundos')
