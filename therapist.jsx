// ====== THERAPIST / TEACHER CONTROLS ======

// floating gear button
function TherapistButton({ onClick }){
  return (
    <button onClick={onClick} title="Grown-up settings" style={{ position:'fixed', right:18, bottom:18, zIndex:70,
      width:56, height:56, borderRadius:'50%', background:'#fff', boxShadow:'0 8px 22px -6px rgba(91,51,214,.5)',
      fontSize:26, display:'grid', placeItems:'center' }}>⚙️</button>
  );
}

// simple grown-up gate
function Gate({ onPass, onClose }){
  const a = 6, b = 4; // 6 + 4 = 10
  const opts = [9, 10, 12].sort(()=>Math.random()-0.5);
  return (
    <Overlay onClose={onClose}>
      <div style={{ textAlign:'center', maxWidth:360 }}>
        <div style={{ fontSize:40 }}>🔒</div>
        <h3 style={{ color:'var(--purple-ink)', fontSize:24, margin:'6px 0 4px' }}>Grown-ups only</h3>
        <p style={{ color:'var(--ink-soft)', fontSize:16, margin:'0 0 18px' }}>Tap the answer to unlock settings:</p>
        <div className="display" style={{ fontSize:30, color:'var(--pink-deep)', marginBottom:16 }}>{a} + {b} = ?</div>
        <div style={{ display:'flex', gap:12, justifyContent:'center' }}>
          {opts.map(o=>(
            <button key={o} onClick={()=>o===a+b?onPass():null} style={{ width:64, height:64, borderRadius:18,
              background:'var(--lav-2)', color:'var(--purple-ink)', fontFamily:'var(--font-display)', fontSize:26,
              boxShadow:'var(--shadow-soft)' }}>{o}</button>
          ))}
        </div>
      </div>
    </Overlay>
  );
}

function Overlay({ children, onClose, wide }){
  return (
    <div onClick={onClose} style={{ position:'fixed', inset:0, background:'rgba(60,42,110,.5)', zIndex:75,
      display:'grid', placeItems:'center', padding:18, animation:'pop-in .2s ease both' }}>
      <div onClick={e=>e.stopPropagation()} style={{ background:'#fff', borderRadius:'var(--r-lg)', padding:26,
        width:'100%', maxWidth: wide?560:420, maxHeight:'88vh', overflow:'auto', boxShadow:'var(--shadow-card)' }}>
        {children}
      </div>
    </div>
  );
}

// segmented control
function Segmented({ value, options, onChange }){
  return (
    <div style={{ display:'flex', background:'var(--lav-2)', borderRadius:14, padding:4, gap:4, flexWrap:'wrap' }}>
      {options.map(o=>(
        <button key={o.id} onClick={()=>onChange(o.id)} style={{ flex:'1 1 auto', minWidth:80, padding:'10px 12px',
          borderRadius:11, fontFamily:'var(--font-display)', fontSize:15, transition:'all .15s',
          background: value===o.id?'#fff':'transparent', color: value===o.id?'var(--purple-deep)':'var(--ink-soft)',
          boxShadow: value===o.id?'var(--shadow-soft)':'none' }}>{o.label}</button>
      ))}
    </div>
  );
}

function Field({ label, children }){
  return (
    <div style={{ marginBottom:18 }}>
      <div className="display" style={{ fontSize:14, color:'var(--purple-ink)', letterSpacing:.5,
        textTransform:'uppercase', marginBottom:8 }}>{label}</div>
      {children}
    </div>
  );
}

function TherapistPanel({ settings, onChange, onRegenerate, onClose, activity, onPrint }){
  const [tab, setTab] = useState('settings'); // settings | key
  return (
    <Overlay onClose={onClose} wide>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:14 }}>
        <h3 style={{ margin:0, color:'var(--purple-ink)', fontSize:24, display:'flex', alignItems:'center', gap:10 }}>
          <span>🧑‍🏫</span> Teacher / Therapist
        </h3>
        <button onClick={onClose} style={{ background:'var(--lav-2)', color:'var(--purple)', width:40, height:40,
          borderRadius:'50%', fontSize:20 }}>✕</button>
      </div>

      <div style={{ display:'flex', gap:8, marginBottom:18 }}>
        <Segmented value={tab} onChange={setTab} options={[
          { id:'settings', label:'Settings' }, { id:'key', label:'Answer Key' },
        ]} />
      </div>

      {tab==='settings' ? (
        <div>
          <Field label="Grade level">
            <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:8 }}>
              {GRADES.map(g=>(
                <button key={g.id} onClick={()=>onChange({ grade:g.id })} style={{ padding:'10px 6px', borderRadius:12,
                  fontFamily:'var(--font-display)', fontSize:14, border:`2px solid ${settings.grade===g.id?'var(--purple)':'#EFE7FF'}`,
                  background: settings.grade===g.id?'var(--lav-2)':'#fff', color:'var(--purple-ink)' }}>{g.emoji} {g.label}</button>
              ))}
            </div>
          </Field>

          <Field label="Story type">
            <Segmented value={settings.type} onChange={v=>onChange({ type:v })} options={[
              { id:'fiction', label:'🐉 Fiction' }, { id:'nonfiction', label:'🔎 Non-fiction' },
            ]} />
          </Field>

          <Field label="Topic">
            <select value={settings.topic} onChange={e=>onChange({ topic:e.target.value })}
              style={{ width:'100%', padding:'12px 14px', borderRadius:12, border:'2px solid #EFE7FF',
                fontFamily:'var(--font-body)', fontWeight:700, fontSize:16, color:'var(--ink)', background:'#fff' }}>
              {TOPICS.map(t=><option key={t.id} value={t.id}>{t.emoji}  {t.label}</option>)}
            </select>
          </Field>

          <Field label="Question format">
            <Segmented value={settings.questionMode} onChange={v=>onChange({ questionMode:v })} options={[
              { id:'auto', label:'Auto (by grade)' }, { id:'mc', label:'Multiple choice' }, { id:'open', label:'Open response' },
            ]} />
          </Field>

          <Field label="Phonemic words">
            <Segmented value={settings.phonSource} onChange={v=>onChange({ phonSource:v })} options={[
              { id:'passage', label:'Passage words' }, { id:'mixed', label:'Mixed words' },
            ]} />
          </Field>

          <Field label="Answer key">
            <Segmented value={settings.showKey?'on':'off'} onChange={v=>onChange({ showKey:v==='on' })} options={[
              { id:'off', label:'Hidden' }, { id:'on', label:'Revealed' },
            ]} />
          </Field>

          <div style={{ display:'flex', gap:10, marginTop:8, flexWrap:'wrap' }}>
            <BigButton onClick={onRegenerate} color="pink" icon="🔄">Regenerate Passage</BigButton>
            {onPrint && <BigButton onClick={onPrint} color="purple" icon="🖨️">Print</BigButton>}
            <BigButton onClick={onClose} color="white">Done</BigButton>
          </div>
        </div>
      ) : (
        <AnswerKeyView activity={activity} />
      )}
    </Overlay>
  );
}

function AnswerKeyView({ activity }){
  if(!activity || !activity.comprehension){
    return <p style={{ color:'var(--ink-soft)', fontSize:16 }}>Generate a passage first to see the answer key.</p>;
  }
  return (
    <div>
      <h4 className="display" style={{ color:'var(--pink-deep)', fontSize:17, margin:'4px 0 10px' }}>📖 Comprehension</h4>
      {activity.comprehension.map((q,i)=>(
        <div key={i} style={{ background:'#FAF6FF', borderRadius:12, padding:'12px 14px', marginBottom:8 }}>
          <div style={{ fontWeight:800, fontSize:16, color:'var(--purple-ink)' }}>{i+1}. {q.q}</div>
          <div style={{ fontSize:15, color:'var(--ok-deep)', marginTop:4, fontWeight:700 }}>
            ✓ {q.kind==='mc' ? (q.choices?q.choices[q.answer]:'') : q.answer}
          </div>
          <div style={{ fontSize:14, color:'var(--ink-soft)', marginTop:2 }}>Cue: “{q.cue}”</div>
        </div>
      ))}
      <h4 className="display" style={{ color:'var(--pink-deep)', fontSize:17, margin:'16px 0 10px' }}>🔊 Phonemic Awareness</h4>
      {activity.phonemic.map((t,i)=>(
        <div key={i} style={{ background:'#FAF6FF', borderRadius:12, padding:'12px 14px', marginBottom:8 }}>
          <div style={{ fontWeight:800, fontSize:16, color:'var(--purple-ink)' }} dangerouslySetInnerHTML={{ __html:`${i+1}. ${t.prompt}` }} />
          <div style={{ fontSize:15, color:'var(--ok-deep)', marginTop:4, fontWeight:700 }}>✓ {t.answer}</div>
          <div style={{ fontSize:14, color:'var(--ink-soft)', marginTop:2 }}>{t.note}</div>
        </div>
      ))}
    </div>
  );
}

Object.assign(window, { TherapistButton, Gate, TherapistPanel, Overlay, Segmented });
