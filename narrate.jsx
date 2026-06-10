// ====== AUDIO NARRATION (Web Speech API) ======

// Pick the friendliest available voice (default system voices can sound robotic/eerie).
let _voicesWarm = null;
function pickFriendlyVoice(){
  try {
    if(!('speechSynthesis' in window)) return null;
    const voices = window.speechSynthesis.getVoices() || [];
    if(!voices.length) return null;
    const en = voices.filter(v => /^en(-|_|$)/i.test(v.lang || ''));
    const pool = en.length ? en : voices;
    // warm, natural-sounding voices first; avoid the novelty/robotic ones
    const prefer = ['samantha','google us english','google uk english female','karen','tessa',
      'victoria','moira','fiona','serena','allison','ava','susan','zira','aria','jenny','nicky','female'];
    const avoid = /albert|zarvox|bad news|bahh|bells|boing|bubbles|cellos|deranged|hysterical|trinoids|whisper|wobble|organ|superstar|junior|fred|ralph|kathy/i;
    const clean = pool.filter(v => !avoid.test(v.name || ''));
    // 1) modern "Natural"/"Online" neural voices sound the friendliest — prefer female-leaning ones
    const naturalFemale = clean.find(v => /natural|online/i.test(v.name) && /aria|jenny|emma|michelle|ava|sonia|libby|clara|female/i.test(v.name));
    if(naturalFemale) return naturalFemale;
    const anyNatural = clean.find(v => /natural|online/i.test(v.name) && !/guy|david|mark|brian|ryan|male/i.test(v.name));
    if(anyNatural) return anyNatural;
    // 2) known warm system voices
    for(const want of prefer){
      const hit = clean.find(v => (v.name || '').toLowerCase().includes(want));
      if(hit) return hit;
    }
    const local = clean.find(v => v.localService) || clean[0];
    return local || pool[0] || null;
  } catch(e){ return null; }
}
function warmVoice(){
  if(_voicesWarm) return _voicesWarm;
  _voicesWarm = pickFriendlyVoice();
  return _voicesWarm;
}
// voices often load async — refresh the cached pick when they arrive
try {
  if(typeof window !== 'undefined' && 'speechSynthesis' in window){
    window.speechSynthesis.onvoiceschanged = () => { _voicesWarm = pickFriendlyVoice(); };
  }
} catch(e){}

// split paragraphs into sentences with global indices for highlighting
function buildSentences(paragraphs){
  const byPara = []; const flat = []; let gi = 0;
  (paragraphs||[]).forEach(p=>{
    const parts = String(p).match(/[^.!?]+[.!?]+["”’)]?\s*|[^.!?]+$/g) || [String(p)];
    const row = parts.filter(t=>t.trim()).map(t=>{ const obj = { gi, text:t }; flat.push(t.trim()); gi++; return obj; });
    byPara.push(row);
  });
  return { byPara, flat };
}

function useNarrator(flat){
  const [active, setActive] = useState(-1);
  const [status, setStatus] = useState('idle'); // idle | playing | paused
  const rateRef = useRef(0.85);
  const runRef = useRef(0);
  const idxRef = useRef(0);
  const supported = typeof window!=='undefined' && 'speechSynthesis' in window;

  function speakFrom(i){
    const run = runRef.current;
    if(i>=flat.length){ setStatus('idle'); setActive(-1); idxRef.current=0; return; }
    idxRef.current = i; setActive(i); setStatus('playing');
    const u = new SpeechSynthesisUtterance(flat[i]);
    u.rate = rateRef.current; u.pitch = 1.0;
    const v = warmVoice(); if(v){ u.voice = v; u.lang = v.lang; }
    u.onend = ()=>{ if(runRef.current!==run) return; speakFrom(i+1); };
    u.onerror = ()=>{ if(runRef.current!==run) return; setStatus('idle'); setActive(-1); };
    try { window.speechSynthesis.speak(u); } catch(e){ setStatus('idle'); }
  }
  function play(){
    if(!supported) return;
    if(status==='paused'){ try{ window.speechSynthesis.resume(); }catch(e){} setStatus('playing'); return; }
    runRef.current++; window.speechSynthesis.cancel();
    setTimeout(()=>speakFrom(0), 60);
  }
  function pause(){ if(!supported) return; try{ window.speechSynthesis.pause(); }catch(e){} setStatus('paused'); }
  function stop(){ if(!supported) return; runRef.current++; try{ window.speechSynthesis.cancel(); }catch(e){} setStatus('idle'); setActive(-1); idxRef.current=0; }
  function setRate(r){
    rateRef.current = r;
    if(status==='playing'){ runRef.current++; window.speechSynthesis.cancel(); const from=idxRef.current; setTimeout(()=>speakFrom(from), 60); }
  }
  useEffect(()=>()=>{ runRef.current++; if(supported){ try{ window.speechSynthesis.cancel(); }catch(e){} } },[]);
  return { active, status, play, pause, stop, setRate, rate:rateRef.current, supported };
}

// Narration control bar
function NarratorBar({ narrator }){
  const { status, play, pause, stop, setRate, supported } = narrator;
  const [slow, setSlow] = useState(false);
  if(!supported) return null;
  const playing = status==='playing';
  function toggleSpeed(){ const next=!slow; setSlow(next); setRate(next?0.6:0.85); }
  return (
    <div style={{ display:'flex', alignItems:'center', gap:10, flexWrap:'wrap' }}>
      {!playing ? (
        <button onClick={play} style={narrBtn('var(--purple)','#fff')}>
          <span style={{ fontSize:18 }}>{status==='paused'?'▶':'🔊'}</span>{status==='paused'?'Resume':'Read to me'}
        </button>
      ) : (
        <button onClick={pause} style={narrBtn('var(--pink)','#fff')}>
          <span style={{ fontSize:16 }}>⏸</span>Pause
        </button>
      )}
      {status!=='idle' && (
        <button onClick={stop} style={narrBtn('#fff','var(--purple)')}>
          <span style={{ fontSize:16 }}>⏹</span>Stop
        </button>
      )}
      <button onClick={toggleSpeed} title="Reading speed" style={{ ...narrBtn(slow?'var(--gold)':'#fff', slow?'#5b3d00':'var(--ink-soft)'), fontSize:15 }}>
        🐢 {slow?'Slow':'Normal'}
      </button>
    </div>
  );
}
function narrBtn(bg, fg){
  return { display:'inline-flex', alignItems:'center', gap:8, background:bg, color:fg,
    borderRadius:999, padding:'10px 18px', fontFamily:'var(--font-display)', fontSize:16,
    boxShadow:'var(--shadow-soft)', whiteSpace:'nowrap' };
}

// Speak a one-off line (used for Remy's greeting). Respects the sound mute toggle.
function speakLine(text, { rate=0.95, pitch=1.0 }={}){
  try {
    if(typeof isMuted==='function' && isMuted()) return false;
    if(typeof window==='undefined' || !('speechSynthesis' in window)) return false;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.rate = rate; u.pitch = pitch;
    const v = warmVoice(); if(v){ u.voice = v; u.lang = v.lang; }
    window.speechSynthesis.speak(u);
    return true;
  } catch(e){ return false; }
}

Object.assign(window, { buildSentences, useNarrator, NarratorBar, speakLine });
