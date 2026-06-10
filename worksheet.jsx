// ====== PRINT-FRIENDLY WORKSHEET ======

function wsLetter(i){ return String.fromCharCode(65+i); }

// The printable document (hidden on screen, shown only when printing)
function Worksheet({ activity, includeKey }){
  if(!activity) return null;
  const topicObj = TOPICS.find(t=>t.id===activity.topic);
  return (
    <div className="ws-doc">
      {/* ---- Page 1: student worksheet ---- */}
      <div className="ws-page">
        <img className="ws-watermark" src="assets/slp-logo.png" alt="" aria-hidden="true" />
        <div className="ws-head">
          <div className="ws-brand">🦝 Reading Rascals</div>
          <div className="ws-meta">{gradeLabel(activity.grade)} · {activity.type==='fiction'?'Fiction':'Non-fiction'} · {topicObj?topicObj.label:activity.topic}</div>
        </div>
        <div className="ws-namerow">
          <span>Name: ________________________________</span>
          <span>Date: ____________________</span>
        </div>

        <h1 className="ws-title">{activity.title}</h1>
        <div className="ws-passage">
          {activity.paragraphs.map((p,i)=><p key={i}>{p}</p>)}
        </div>

        <h2 className="ws-sec">📖 Reading Questions</h2>
        <ol className="ws-list">
          {activity.comprehension.map((q,i)=>(
            <li key={i} className="ws-q">
              <div className="ws-qtext">{q.q}</div>
              {q.kind==='mc' && Array.isArray(q.choices) ? (
                <div className="ws-choices">
                  {q.choices.map((c,ci)=>(
                    <div key={ci} className="ws-choice"><span className="ws-bub">{wsLetter(ci)}</span>{c}</div>
                  ))}
                </div>
              ) : (
                <div className="ws-lines"><span></span><span></span></div>
              )}
            </li>
          ))}
        </ol>

        <h2 className="ws-sec">🔊 Sound Games (say these out loud)</h2>
        <ol className="ws-list">
          {activity.phonemic.map((t,i)=>(
            <li key={i} className="ws-q">
              <div className="ws-qtext" dangerouslySetInnerHTML={{ __html:t.prompt }} />
              <div className="ws-answerline">My answer: ______________________</div>
            </li>
          ))}
        </ol>
        <div className="ws-foot"><img className="ws-footmark" src="assets/slp-logo.png" alt="" aria-hidden="true" />Your Friendly Neighborhood SLP · Reading Rascals · Reading &amp; Phonemic Awareness Practice</div>
      </div>

      {/* ---- Page 2: answer key (optional) ---- */}
      {includeKey && (
        <div className="ws-page ws-key">
          <img className="ws-watermark" src="assets/slp-logo.png" alt="" aria-hidden="true" />
          <div className="ws-head">
            <div className="ws-brand">🔑 Answer Key &amp; Cues</div>
            <div className="ws-meta">{activity.title}</div>
          </div>

          <h2 className="ws-sec">📖 Reading Questions</h2>
          <ol className="ws-list">
            {activity.comprehension.map((q,i)=>(
              <li key={i} className="ws-q">
                <div className="ws-qtext">{q.q}</div>
                <div className="ws-ans">✓ {q.kind==='mc' ? (q.choices?q.choices[q.answer]:'') : q.answer}</div>
                <div className="ws-cue">Cue: “{q.cue}”</div>
              </li>
            ))}
          </ol>

          <h2 className="ws-sec">🔊 Sound Games</h2>
          <ol className="ws-list">
            {activity.phonemic.map((t,i)=>(
              <li key={i} className="ws-q">
                <div className="ws-qtext" dangerouslySetInnerHTML={{ __html:t.prompt }} />
                <div className="ws-ans">✓ {t.answer}</div>
                <div className="ws-cue">{t.note}</div>
              </li>
            ))}
          </ol>
          <div className="ws-foot"><img className="ws-footmark" src="assets/slp-logo.png" alt="" aria-hidden="true" />Your Friendly Neighborhood SLP · Therapist / Teacher copy — keep for scoring &amp; cueing</div>
        </div>
      )}
    </div>
  );
}

// Small modal to choose what to print
function PrintMenu({ onPrint, onClose }){
  const [withKey, setWithKey] = useState(true);
  return (
    <Overlay onClose={onClose}>
      <div style={{ textAlign:'center' }}>
        <div style={{ fontSize:40 }}>🖨️</div>
        <h3 style={{ color:'var(--purple-ink)', fontSize:24, margin:'6px 0 4px' }}>Print Worksheet</h3>
        <p style={{ color:'var(--ink-soft)', fontSize:16, margin:'0 0 18px' }}>
          A clean paper version of the passage, reading questions, and sound games.
        </p>
        <label style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:10, marginBottom:20,
          fontFamily:'var(--font-display)', color:'var(--purple-ink)', fontSize:17, cursor:'pointer' }}>
          <input type="checkbox" checked={withKey} onChange={e=>setWithKey(e.target.checked)}
            style={{ width:22, height:22, accentColor:'var(--purple)' }} />
          Include teacher answer key page
        </label>
        <div style={{ display:'flex', gap:12, justifyContent:'center' }}>
          <BigButton onClick={()=>onPrint(withKey)} color="pink" icon="🖨️">Print</BigButton>
          <BigButton onClick={onClose} color="white">Cancel</BigButton>
        </div>
      </div>
    </Overlay>
  );
}

Object.assign(window, { Worksheet, PrintMenu });
