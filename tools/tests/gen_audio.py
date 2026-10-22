# Makes the synthetic microphone test files used by blowtest.js / musictest.js / vibtest2.js:
#   t-noblow.wav (speech, music, laughter, claps: must NOT blow candles out)
#   t-soft.wav, t-rumble.wav, t-hard.wav (gentle / rumbly / very hard breaths: must blow them out)
#   t-claps.wav (claps only)
# Usage: python3 gen_audio.py OUTPUT_DIR      (needs numpy)
import sys, wave, numpy as np
S=sys.argv[1]; R=48000; rng=np.random.default_rng(1)
def env(t,d): return np.minimum(1,np.minimum(t/.08,(d-t)/.12))
def voice(d,a,base=140,rate=3.2,breath=0.01):
    t=np.arange(int(d*R))/R; f0=base+30*np.sin(2*np.pi*1.3*t)+20*np.sin(2*np.pi*.4*t); ph=2*np.pi*np.cumsum(f0)/R
    v=sum((1/k)*np.sin(k*ph)*(1.4 if 3<=k<=5 else 1) for k in range(1,14)); syl=np.maximum(0,np.sin(2*np.pi*rate*t))**.6
    return (v*.35*syl+rng.normal(0,1,len(t))*breath*syl)*a*env(t,d)
def laugh(d,a):
    t=np.arange(int(d*R))/R; f0=260+40*np.sin(2*np.pi*2*t); ph=2*np.pi*np.cumsum(f0)/R; pulse=np.maximum(0,np.sin(2*np.pi*5*t))**2
    return (sum((1/k)*np.sin(k*ph) for k in range(1,10))*.4*pulse+rng.normal(0,1,len(t))*.03*pulse)*a
def music(d,a):
    t=np.arange(int(d*R))/R; notes=np.array([261.6,329.6,392.0,523.3]); k=(t/0.4).astype(int)%4; tt=t%0.4
    return sum(np.sin(2*np.pi*notes[(k+j)%4]*(1+j*.002)*t)*np.exp(-tt*4) for j in range(3))*a*.4
def lp(w,al):
    y=np.empty_like(w); s=0.0
    for i,v in enumerate(w): s+=(v-s)*al; y[i]=s
    return y
def softblow(d,a):
    w=rng.normal(0,1,int(d*R)); t=np.arange(len(w))/R; return (lp(w,.03)*3.5+lp(w,.3)*.15)*a*env(t,d)*(1+.3*np.sin(2*np.pi*5*t))
def rumble(d,a):
    w=rng.normal(0,1,int(d*R)); t=np.arange(len(w))/R; x=lp(w,.01); return (x*6+lp(x,.05)*10)*a*env(t,d)
def hard(d,a):
    w=rng.normal(0,1,int(d*R)); t=np.arange(len(w))/R; return np.clip(lp(w,.08)*8*a,-1,1)*env(t,d)
def clap(d,a):
    t=np.arange(int(d*R))/R; return rng.normal(0,1,len(t))*a*np.exp(-(t%.5)*120)
def quiet(d,a=0): return np.zeros(int(d*R))
def write(name,segs):
    x=np.concatenate([f(d,a) for f,d,a in segs]); x+=rng.normal(0,1,len(x))*.002
    w=wave.open(f"{S}/{name}.wav",'wb'); w.setnchannels(1); w.setsampwidth(2); w.setframerate(R); w.writeframes((np.clip(x,-1,1)*32000).astype('<i2').tobytes()); w.close()
write('t-noblow',[(quiet,2,0),(voice,3,.9),(quiet,.8,0),(music,3,.8),(quiet,.8,0),(laugh,2.5,.7),(quiet,.8,0),(clap,2,.6),(quiet,.8,0),(voice,3,1.4),(quiet,.8,0),(lambda d,a: voice(d,a,base=220,rate=4),3,1.0)])
write('t-soft',[(quiet,2.5,0),(softblow,1.4,.05),(quiet,1.5,0),(softblow,1.4,.05),(quiet,1.5,0),(softblow,1.5,.05),(quiet,4,0)])
write('t-rumble',[(quiet,2.5,0),(rumble,1.4,.05),(quiet,1.5,0),(rumble,1.4,.05),(quiet,4,0)])
write('t-hard',[(quiet,2.5,0),(hard,1.2,1),(quiet,4,0)])
write('t-claps',[(quiet,1.5,0),(clap,6.5,.6)])
print('written to',S)
