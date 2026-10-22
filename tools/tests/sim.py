# frame-by-frame simulation of src/breath.js + candle extinguishing, at a given fps
import sys, wave, numpy as np, math, random
def load(p):
    w=wave.open(p); return np.frombuffer(w.readframes(w.getnframes()),dtype='<i2').astype(np.float32)/32768, w.getframerate()
def per(td, sr, ds=2):
    d=np.diff(td[::ds]); m=len(d); s2=sr/ds; l0=int(round(s2*.0025)); l1=min(int(round(s2*.016)), m-64)
    if (d*d).sum()<1e-9: return 0
    best=0
    for L in range(l0,l1+1):
        a=d[:m-L:2]; b=d[L::2][:len(a)]; r=(a*b).sum()/math.sqrt((a*a).sum()*(b*b).sum()+1e-12); best=max(best,r)
    return best
def run(path, fps):
    x,sr=load(path); n=2048; dt=1/fps
    st=dict(floor=.003,warm=0,held=0,frames=0,smooth=0,per=0); lit=30; random.seed(0); first=None
    t=0.6  # mic starts a little after the cake shows
    while t < len(x)/sr:
        i=int(t*sr); td=x[max(0,i-n):i]
        if len(td)<n: t+=dt; continue
        rms=math.sqrt(float((td**2).mean()))
        if st['warm']<.6:
            st['warm']+=dt; st['floor']= rms if st['warm']<.1 else min(max(st['floor']*.9,rms), st['floor']*1.05+.0002)
        thr=max(.006,st['floor']*2.2); loud=min(1,max(0,(rms-thr)/(thr*1.5))); raw=0
        if loud>0:
            p=per(td,sr); st['per']+=(p-st['per'])*min(1,dt*20)
            noisy=min(1,max(0,(.38-max(p,st['per']*.8))/.12)); raw=loud*noisy
        else: st['per']*=.9
        if raw>.05: st['held']+=dt; st['frames']+=1
        else: st['held']=0; st['frames']=0
        if st['held']<.15 or st['frames']<2: raw=0
        st['smooth']+=(raw-st['smooth'])*min(1,dt*(25 if raw>st['smooth'] else 8))
        if raw==0 and rms<thr*1.2: st['floor']+=(max(.0015,rms)-st['floor'])*min(1,dt*.4)
        blow= min(1,.35+st['smooth']*1.3) if st['smooth']>.04 else 0
        if blow:
            for _ in range(lit):
                if random.random()< blow*dt*11*1.0: lit-=1
            if first is None: first=round(t,2)
        t+=dt
    return lit, first
for f in sys.argv[2:]:
    print(f.split('/')[-1].ljust(14), *[f"{fps}fps: {run(f,fps)[0]:2d} left (first at {run(f,fps)[1]})" for fps in map(int,sys.argv[1].split(','))])
