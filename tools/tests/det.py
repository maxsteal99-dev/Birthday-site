import sys, wave, numpy as np
def load(p):
    w=wave.open(p); x=np.frombuffer(w.readframes(w.getnframes()),dtype='<i2').astype(np.float32)/32768; return x, w.getframerate()
def per(td, sr, ds=2):
    d=np.diff(td[::ds]); m=len(d); s2=sr/ds; l0=int(round(s2*.0025)); l1=min(int(round(s2*.016)), m-64)
    best=0
    for L in range(l0,l1+1):
        a=d[:m-L:2]; b=d[L::2][:len(a)]
        r=(a*b).sum()/np.sqrt((a*a).sum()*(b*b).sum()+1e-12); best=max(best,r)
    return best
x,sr=load(sys.argv[1]); n=2048; seg=sys.argv[2:] 
for t in np.arange(0, len(x)/sr - .05, 0.25):
    i=int(t*sr); td=x[i:i+n]; rms=np.sqrt((td**2).mean())
    if rms>0.01: print(f"{t:5.2f}s rms {rms:.3f} per {per(td,sr):.2f}")
