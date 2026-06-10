// ====== COMPREHENSION + PHONEMIC + THERAPIST PANEL ======

const QTYPE_LABEL = {
  who:'Who / What / Where', detail:'Detail Detective', main:'Main Idea',
  inference:'Think & Infer', why:'Why / How', vocab:'Word Power',
};
const QTYPE_EMOJI = { who:'🔍', detail:'🧩', main:'💡', inference:'🤔', why:'❓', vocab:'📚' };
// fixed order fallback (Q1..Q5) so labels are right even if the model's type string varies
const Q_META = [
  { label:'Who / What / Where', emoji:'🔍' },
  { label:'Detail Detective',   emoji:'🧩' },
  { label:'Main Idea',          emoji:'💡' },
  { label:'Think & Infer',      emoji:'🤔' },
  { label:'Word Power',         emoji:'📚' },
];

// little owl + speech feedback
function OwlSays({ text, mood='happy' }){
  if(!text) return null;
  return (
    <div style={{ display:'flex', alignItems:'center', gap:12, marginTop:16, animation:'pop-in .3s ease both' }}>
      <Owl size={66} mood={mood} />
      <SpeechBubble style={{ fontSize:18 }}>{text}</SpeechBubble>
    </div>
  );
}

// passage re-read modal
function PassageModal({ activity, onClose }){
  return (
    <div onClick={onClose} style={{ position:'fixed', inset:0, background:'rgba(60,42,110,.45)',
      zIndex:80, display:'grid', placeItems:'center', padding:20, animation:'pop-in .2s ease both' }}>
      <div onClick={e=>e.stopPropagation()} style={{ background:'#fff', borderRadius:'var(--r-lg)',
        maxWidth:680, width:'100%', maxHeight:'82vh', overflow:'auto', boxShadow:'var(--shadow-card)' }}>
        <div style={{ position:'sticky', top:0, background:'linear-gradient(120deg,var(--purple),var(--pink))',
          color:'#fff', padding:'16px 24px', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <h3 style={{ margin:0, fontSize:22 }}>📖 {activity.title}</h3>
          <button onClick={onClose} style={{ background:'rgba(255,255,255,.25)', color:'#fff', width:38, height:38,
            borderRadius:'50%', fontSize:20 }}>✕</button>
        </div>
        <div style={{ padding:'22px 28px' }}>
          {activity.paragraphs.map((p,i)=>(
            <p key={i} style={{ fontSize:20, lineHeight:1.7, fontWeight:600, margin:'0 0 14px', color:'var(--ink)' }}>{p}</p>
          ))}
        </div>
      </div>
    </div>
  );
}

// robust phonemic skill label (model's "skill" string varies)
function phonMeta(t, idx){
  const k = String(t.skill||'').toLowerCase();
  if(k.includes('substitut')) return { label:'Sound Substitution', emoji:'🔄' };
  if(k.includes('delet'))     return { label:'Sound Deletion', emoji:'✂️' };
  if(k.includes('addit'))     return { label:'Sound Addition', emoji:'➕' };
  if(k.includes('segment'))   return { label:'Tell the Sounds', emoji:'🎯' };
  if(k.includes('blend'))     return { label:'Blend the Sounds', emoji:'🔗' };
  if(k.includes('manipul')||k.includes('switch')) return { label:'Sound Switch', emoji:'🪄' };
  const fb=[{label:'Sound Substitution',emoji:'🔄'},{label:'Sound Deletion',emoji:'✂️'},{label:'Sound Addition',emoji:'➕'},{label:'Blend the Sounds',emoji:'🔗'},{label:'Sound Switch',emoji:'🪄'}];
  return fb[idx]||{ label:'Sound Play', emoji:'🎵' };
}

// ---------- Comprehension questions ----------
function QuestionsScreen({ activity, showKey, onComplete, onAward, onHome, gems, totalGems }){
  const questions = activity.comprehension;
  const [idx, setIdx] = useState(0);
  const [state, setState] = useState(()=>questions.map(()=>({ solved:false, picked:null, text:'', responded:false, feedback:'', mood:'happy', showCue:false })));
  const [showPassage, setShowPassage] = useState(false);
  const awarded = useRef(new Set());
  const q = questions[idx];
  const s = state[idx];
  const meta = Q_META[idx] || { label:'Question', emoji:'❓' };

  function update(patch){ setState(prev=>prev.map((x,i)=>i===idx?{...x,...patch}:x)); }
  function award(){ if(!awarded.current.has(idx)){ awarded.current.add(idx); onAward(); } }

  function pickChoice(i){
    if(s.solved) return;
    if(i===q.answer){
      update({ solved:true, picked:i, feedback:pick(FEEDBACK.correct), mood:'cheer' });
      award();
    } else {
      update({ picked:i, feedback:pick(FEEDBACK.retry), mood:'happy', showCue:true });
    }
  }
  function respondOpen(viaVoice){
    if(s.solved) return;
    if(!viaVoice && !s.text.trim()) return;
    update({ solved:true, responded:true, feedback:pick(FEEDBACK.open), mood:'cheer' });
    award();
  }

  const isLast = idx===questions.length-1;
  const canNext = s.solved;
  function next(){
    if(isLast){ onComplete(state.filter(x=>x.solved).length + (s.solved?0:0)); return; }
    setIdx(idx+1);
  }
  // recompute solved count live
  const solvedCount = state.filter(x=>x.solved).length;

  return (
    <Stage maxWidth={720}>
      {showPassage && <PassageModal activity={activity} onClose={()=>setShowPassage(false)} />}
      <TopBar gems={gems} totalGems={totalGems} onHome={onHome} />

      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:12, flexWrap:'wrap', gap:10 }}>
        <div style={{ display:'flex', alignItems:'center', gap:10, flexShrink:0 }}>
          <span style={{ fontSize:30 }}>{meta.emoji}</span>
          <div>
            <div className="display" style={{ fontSize:13, color:'#FF9BCB', letterSpacing:1, textTransform:'uppercase', whiteSpace:'nowrap' }}>
              {meta.label}
            </div>
            <div className="display" style={{ fontSize:20, color:'var(--head-on-bg)', whiteSpace:'nowrap' }}>Question {idx+1} of {questions.length}</div>
          </div>
        </div>
        <button onClick={()=>setShowPassage(true)} style={{ background:'#fff', color:'var(--purple)',
          borderRadius:999, padding:'10px 18px', boxShadow:'var(--shadow-soft)', fontSize:16,
          display:'flex', alignItems:'center', gap:8 }}>📖 Read story again</button>
      </div>

      <Panel>
        <p style={{ fontSize:'clamp(21px,2.6vw,26px)', color:'var(--purple-ink)', fontWeight:600,
          margin:'0 0 20px', fontFamily:'var(--font-display)', textWrap:'pretty' }}>{q.q}</p>

        {q.kind==='mc' ? (
          <div style={{ display:'grid', gap:12 }}>
            {q.choices && q.choices.map((c,i)=>{
              const isAns = i===q.answer;
              const picked = s.picked===i;
              let bg='#fff', border='#EFE7FF', fg='var(--ink)';
              if(s.solved && isAns){ bg='#E8FBF2'; border='var(--ok)'; fg='var(--ok-deep)'; }
              else if(picked && !isAns){ bg='#FFECF3'; border='var(--pink)'; fg='var(--pink-deep)'; }
              else if(showKey && isAns){ border='var(--ok)'; }
              return (
                <button key={i} onClick={()=>pickChoice(i)} disabled={s.solved}
                  style={{ display:'flex', alignItems:'center', gap:14, textAlign:'left',
                    background:bg, border:`3px solid ${border}`, borderRadius:'var(--r-sm)', padding:'14px 16px',
                    fontFamily:'var(--font-body)', fontWeight:700, fontSize:19, color:fg,
                    cursor:s.solved?'default':'pointer', transition:'all .15s',
                    boxShadow: picked||(s.solved&&isAns)?'var(--shadow-soft)':'none' }}>
                  <span style={{ width:34, height:34, borderRadius:'50%', flexShrink:0, display:'grid', placeItems:'center',
                    background: (s.solved&&isAns)?'var(--ok)':(picked&&!isAns)?'var(--pink)':'var(--lav-2)',
                    color:(s.solved&&isAns)||(picked&&!isAns)?'#fff':'var(--purple)', fontFamily:'var(--font-display)', fontSize:17 }}>
                    {(s.solved&&isAns)?'✓':(picked&&!isAns)?'✕':String.fromCharCode(65+i)}
                  </span>
                  <span style={{ textWrap:'pretty' }}>{c}</span>
                  {showKey && isAns && !s.solved && <span style={{ marginLeft:'auto', fontSize:13, color:'var(--ok-deep)', fontFamily:'var(--font-display)' }}>answer</span>}
                </button>
              );
            })}
          </div>
        ) : (
          <div>
            <textarea value={s.text} disabled={s.solved} onChange={e=>update({ text:e.target.value })}
              placeholder="Type your answer here… or tap the mic to tell it out loud!"
              rows={3} style={{ width:'100%', borderRadius:'var(--r-sm)', border:'3px solid #EFE7FF',
                padding:'14px 16px', fontSize:19, fontFamily:'var(--font-body)', fontWeight:600, color:'var(--ink)',
                resize:'vertical', outline:'none', background: s.solved?'#F7F3FF':'#fff' }} />
            <div style={{ display:'flex', gap:12, marginTop:12, flexWrap:'wrap' }}>
              <BigButton onClick={()=>respondOpen(false)} color="purple" size="sm" disabled={s.solved}>Check my answer</BigButton>
              <BigButton onClick={()=>respondOpen(true)} color="white" size="sm" disabled={s.solved} icon="🎤">I'll tell it out loud</BigButton>
            </div>
          </div>
        )}

        {/* hint / cue */}
        {!s.solved && (
          <button onClick={()=>update({ showCue:!s.showCue })} style={{ marginTop:16, background:'none', color:'var(--purple)',
            fontFamily:'var(--font-display)', fontSize:16, display:'flex', alignItems:'center', gap:6 }}>
            💡 {s.showCue?'Hide hint':'Need a hint?'}
          </button>
        )}
        {s.showCue && !s.solved && (
          <div style={{ marginTop:8, background:'var(--lav-2)', borderRadius:14, padding:'12px 16px',
            color:'var(--purple-ink)', fontSize:17, fontWeight:700, animation:'pop-in .2s ease both' }}>
            {q.cue}
          </div>
        )}

        {/* answer key box for therapist */}
        {showKey && (
          <div style={{ marginTop:16, background:'#FFF7E8', border:'2px dashed var(--gold-deep)', borderRadius:14, padding:'12px 16px' }}>
            <div className="display" style={{ fontSize:13, color:'var(--gold-deep)', letterSpacing:1, textTransform:'uppercase', marginBottom:4 }}>🔑 Answer Key</div>
            <div style={{ fontSize:17, color:'var(--ink)', fontWeight:700 }}>
              {q.kind==='mc' ? `Correct: ${q.choices?q.choices[q.answer]:''}` : `Model answer: ${q.answer}`}
            </div>
            <div style={{ fontSize:15, color:'var(--ink-soft)', marginTop:4 }}>Cue: “{q.cue}”</div>
          </div>
        )}
      </Panel>

      <OwlSays text={s.feedback} mood={s.mood} />

      <div style={{ display:'flex', justifyContent:'flex-end', marginTop:20 }}>
        <BigButton onClick={next} color="pink" size="lg" disabled={!canNext} icon={isLast?'🔊':'→'}>
          {isLast?'Sound Games!':'Next Question'}
        </BigButton>
      </div>
    </Stage>
  );
}

// ---------- Phonemic awareness ----------
function PhonemicScreen({ activity, showKey, onComplete, onAward, onHome, gems, totalGems }){
  const tasks = activity.phonemic;
  const [idx, setIdx] = useState(0);
  const [state, setState] = useState(()=>tasks.map(()=>({ done:false, revealed:false, showCue:false, cue:pick(PHON_CUES) })));
  const awarded = useRef(new Set());
  const t = tasks[idx];
  const s = state[idx];
  const pm = phonMeta(t, idx);

  function update(patch){ setState(prev=>prev.map((x,i)=>i===idx?{...x,...patch}:x)); }
  function gotIt(){
    if(!awarded.current.has(idx)){ awarded.current.add(idx); onAward(); }
    update({ done:true });
  }
  function speak(){
    try{
      const w = (t.answer||'').replace(/\//g,' ');
      const u = new SpeechSynthesisUtterance(w);
      u.rate = 0.7; u.pitch = 1.1;
      speechSynthesis.cancel(); speechSynthesis.speak(u);
    }catch(e){}
  }
  const isLast = idx===tasks.length-1;
  function next(){ if(isLast){ onComplete(state.filter(x=>x.done).length + (s.done?0:0)); return; } setIdx(idx+1); }

  return (
    <Stage maxWidth={680}>
      <TopBar gems={gems} totalGems={totalGems} onHome={onHome} />

      <div style={{ textAlign:'center', marginBottom:14 }}>
        <div style={{ display:'inline-flex', alignItems:'center', gap:10, background:'#fff', borderRadius:999,
          padding:'8px 20px', boxShadow:'var(--shadow-soft)' }}>
          <span style={{ fontSize:24 }}>🔊</span>
          <span className="display" style={{ color:'var(--purple-ink)', fontSize:18, whiteSpace:'nowrap' }}>Sound Game {idx+1} of {tasks.length}</span>
        </div>
      </div>

      <Panel style={{ textAlign:'center' }}>
        <div style={{ display:'inline-flex', alignItems:'center', gap:8, background:'var(--pink-soft-2)',
          borderRadius:999, padding:'6px 16px', marginBottom:18 }}>
          <span style={{ fontSize:20 }}>{pm.emoji}</span>
          <span className="display" style={{ color:'var(--pink-deep)', fontSize:15, letterSpacing:.5 }}>{pm.label}</span>
        </div>

        <p style={{ fontSize:'clamp(23px,3.2vw,30px)', color:'var(--purple-ink)', fontWeight:600,
          lineHeight:1.5, fontFamily:'var(--font-display)', margin:'0 0 8px', textWrap:'pretty' }}
          dangerouslySetInnerHTML={{ __html: t.prompt }} />

        <p style={{ color:'var(--ink-soft)', fontSize:16, margin:'0 0 18px' }}>Say it out loud with your grown-up! 🗣️</p>

        {/* revealed answer */}
        {(s.revealed || showKey) && (
          <div style={{ background:'#E8FBF2', border:'3px solid var(--ok)', borderRadius:'var(--r-md)',
            padding:'16px 20px', margin:'0 auto 16px', maxWidth:380, animation:'pop-in .25s ease both' }}>
            <div className="display" style={{ fontSize:13, color:'var(--ok-deep)', letterSpacing:1, textTransform:'uppercase' }}>The answer is</div>
            <div className="display" style={{ fontSize:34, color:'var(--ok-deep)', fontWeight:700 }}>{t.answer}</div>
            <button onClick={speak} style={{ marginTop:6, background:'var(--ok)', color:'#fff', borderRadius:999,
              padding:'6px 16px', fontSize:15, display:'inline-flex', alignItems:'center', gap:6 }}>🔊 Hear it</button>
          </div>
        )}

        {/* therapist note */}
        {showKey && (
          <div style={{ background:'#FFF7E8', border:'2px dashed var(--gold-deep)', borderRadius:14,
            padding:'12px 16px', margin:'0 auto 16px', maxWidth:420, textAlign:'left' }}>
            <div className="display" style={{ fontSize:13, color:'var(--gold-deep)', letterSpacing:1, textTransform:'uppercase', marginBottom:4 }}>🔑 Therapist Note</div>
            <div style={{ fontSize:16, color:'var(--ink)', fontWeight:600 }}>{t.note}</div>
          </div>
        )}

        {/* cue */}
        {s.showCue && !s.revealed && (
          <div style={{ background:'var(--lav-2)', borderRadius:14, padding:'10px 16px', margin:'0 auto 16px',
            maxWidth:380, color:'var(--purple-ink)', fontSize:17, fontWeight:700, animation:'pop-in .2s ease both' }}>
            💡 {s.cue}
          </div>
        )}

        <div style={{ display:'flex', flexWrap:'wrap', justifyContent:'center', gap:10 }}>
          {!s.revealed && <BigButton onClick={()=>update({ showCue:!s.showCue })} color="white" size="sm" icon="💡">{s.showCue?'Hide hint':'Hint'}</BigButton>}
          {!s.revealed && <BigButton onClick={()=>update({ revealed:true })} color="purple" size="sm" icon="👀">Show answer</BigButton>}
          <BigButton onClick={gotIt} color="mint" size="sm" disabled={s.done} icon={s.done?'✅':'⭐'}>{s.done?'Got it!':'I got it!'}</BigButton>
        </div>
      </Panel>

      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginTop:20 }}>
        <FloatingOwl size={70} mood="happy" />
        <BigButton onClick={next} color="pink" size="lg" disabled={!s.done} icon={isLast?'🏆':'→'}>
          {isLast?'See My Gems!':'Next Sound'}
        </BigButton>
      </div>
    </Stage>
  );
}

Object.assign(window, { QuestionsScreen, PhonemicScreen, OwlSays, PassageModal });
