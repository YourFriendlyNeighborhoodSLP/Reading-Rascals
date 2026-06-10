// ====== SOUND: tiny Web-Audio synth (no asset files, works offline) ======
// A soft chime on button/tile taps, a happy arpeggio when a sticker is earned.

const SOUND_KEY = 'ppq_muted';
let _ac = null;
let _muted = (function(){ try { return localStorage.getItem(SOUND_KEY) === '1'; } catch(e){ return false; } })();

function isMuted(){ return _muted; }
function setMuted(v){
  _muted = !!v;
  try { localStorage.setItem(SOUND_KEY, _muted ? '1' : '0'); } catch(e){}
  if(!_muted){ ctx(); blip(880, 0.06, 'triangle', 0.12); } // little confirmation beep
}

// lazily create / resume the AudioContext (autoplay policies need a gesture)
function ctx(){
  try {
    if(!_ac){ const AC = window.AudioContext || window.webkitAudioContext; if(!AC) return null; _ac = new AC(); }
    if(_ac.state === 'suspended') _ac.resume();
    return _ac;
  } catch(e){ return null; }
}

// one shaped tone
function tone(freq, start, dur, { type='sine', gain=0.18, glideTo=null }={}){
  const ac = _ac; if(!ac) return;
  const t0 = ac.currentTime + start;
  const osc = ac.createOscillator();
  const g = ac.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t0);
  if(glideTo) osc.frequency.exponentialRampToValueAtTime(glideTo, t0 + dur);
  // quick attack, smooth decay
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(gain, t0 + 0.012);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  osc.connect(g); g.connect(ac.destination);
  osc.start(t0); osc.stop(t0 + dur + 0.02);
}

function blip(freq, dur, type, gain){ if(_muted || !ctx()) return; tone(freq, 0, dur, { type, gain }); }

// ---- public sounds ----

// soft "click" chime for button & tile selections
function playClick(){
  if(_muted || !ctx()) return;
  tone(660, 0, 0.10, { type:'triangle', gain:0.14, glideTo:990 });
}

// gentle positive ping (e.g. correct answer / gem)
function playGem(){
  if(_muted || !ctx()) return;
  tone(784, 0,    0.12, { type:'sine', gain:0.16 });   // G5
  tone(1175, 0.07, 0.16, { type:'sine', gain:0.13 });  // D6
}

// celebratory arpeggio + shimmer for earning a sticker
function playCelebrate(){
  if(_muted || !ctx()) return;
  const notes = [523.25, 659.25, 783.99, 1046.5, 1318.5]; // C5 E5 G5 C6 E6
  notes.forEach((f,i)=> tone(f, i*0.10, 0.34, { type:'triangle', gain:0.16 }));
  // sparkle on top
  tone(1568, 0.52, 0.5, { type:'sine', gain:0.10 });   // G6
  tone(2093, 0.60, 0.5, { type:'sine', gain:0.08 });   // C7
}

// ---- mute toggle button (fixed, kid-reachable) ----
function SoundToggle(){
  const [muted, setM] = useState(isMuted());
  return (
    <button
      onClick={()=>{ const v=!muted; setMuted(v); setM(v); }}
      title={muted ? 'Turn sound on' : 'Turn sound off'}
      aria-label={muted ? 'Turn sound on' : 'Turn sound off'}
      style={{ position:'fixed', right:18, bottom:84, zIndex:70, width:56, height:56, borderRadius:'50%',
        background:'#fff', boxShadow:'0 8px 22px -6px rgba(91,51,214,.5)', fontSize:24,
        display:'grid', placeItems:'center' }}>
      {muted ? '🔇' : '🔊'}
    </button>
  );
}

Object.assign(window, { playClick, playGem, playCelebrate, isMuted, setMuted, SoundToggle });
