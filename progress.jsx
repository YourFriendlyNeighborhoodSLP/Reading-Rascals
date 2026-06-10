// ====== PROGRESS / SAVE ACROSS SESSIONS ======

const PKEY = 'ppq_progress';
const SKEY = 'ppq_session';
// per-student namespaced keys (falls back to base key when no one is signed in)
function pKey(){ return (typeof studentKey === 'function') ? studentKey(PKEY) : PKEY; }
function sKey(){ return (typeof studentKey === 'function') ? studentKey(SKEY) : SKEY; }

function defaultProgress(){ return { lifetimeGems:0, quests:0, bestStars:0, goldBadges:0, stickers:[], lastPlayed:null }; }
function loadProgress(){
  try { const p = JSON.parse(localStorage.getItem(pKey())||'null'); if(p) return { ...defaultProgress(), ...p }; } catch(e){}
  return defaultProgress();
}
function saveProgress(p){ try { localStorage.setItem(pKey(), JSON.stringify(p)); } catch(e){} }

// read a specific student's saved progress by id (for the teacher dashboard)
function loadProgressFor(id){
  try { const p = JSON.parse(localStorage.getItem(PKEY + '__' + id)||'null'); if(p) return { ...defaultProgress(), ...p }; } catch(e){}
  return defaultProgress();
}

// record a finished quest; returns updated progress + the new sticker
function commitQuest({ gems, stars, grade, type, topic }){
  const p = loadProgress();
  p.lifetimeGems += gems;
  p.quests += 1;
  p.bestStars = Math.max(p.bestStars, stars);
  if(stars>=3) p.goldBadges += 1;
  const sticker = { topic, stars, grade, type, date:Date.now() };
  p.stickers.unshift(sticker);
  if(p.stickers.length>40) p.stickers = p.stickers.slice(0,40);
  p.lastPlayed = Date.now();
  saveProgress(p);
  return { progress:p, sticker };
}

// ---- session resume ----
function saveSession(sess){ try { localStorage.setItem(sKey(), JSON.stringify(sess)); } catch(e){} }
function loadSession(){ try { return JSON.parse(localStorage.getItem(sKey())||'null'); } catch(e){ return null; } }
function clearSession(){ try { localStorage.removeItem(sKey()); } catch(e){} }

// ---- Sticker Book view ----
function StickerBook({ onClose, onStart }){
  const p = loadProgress();
  const has = p.stickers.length>0;
  const topicEmoji = id => { const t=TOPICS.find(x=>x.id===id); return t?t.emoji:'⭐'; };
  return (
    <Stage maxWidth={720}>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:16 }}>
        <button onClick={onClose} style={{ background:'#fff', color:'var(--purple)', borderRadius:999,
          padding:'10px 18px 10px 14px', boxShadow:'var(--shadow-soft)', fontSize:16, display:'flex', alignItems:'center', gap:8 }}>← Back</button>
        <h2 className="display" style={{ color:'var(--head-on-bg)', fontSize:'clamp(22px,3.4vw,30px)', margin:0, whiteSpace:'nowrap' }}>My Sticker Book</h2>
        <div style={{ width:80 }} />
      </div>

      {/* stat cards */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:12, marginBottom:18 }}>
        <StatCard emoji="💎" value={p.lifetimeGems} label="Gems collected" color="var(--pink-deep)" />
        <StatCard emoji="📚" value={p.quests} label="Quests finished" color="var(--purple)" />
        <StatCard emoji="🏅" value={p.goldBadges} label="Gold badges" color="var(--gold-deep)" />
      </div>

      <Panel>
        <h3 className="display" style={{ color:'var(--purple-ink)', fontSize:20, margin:'0 0 14px' }}>My Stickers</h3>
        {has ? (
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(92px,1fr))', gap:12 }}>
            {p.stickers.map((s,i)=>(
              <div key={i} style={{ background:'linear-gradient(135deg,var(--pink-soft-2),var(--lav-2))',
                borderRadius:18, padding:'14px 8px', textAlign:'center', border:'2px solid #fff',
                boxShadow:'var(--shadow-soft)', animation:`pop-in .3s ${Math.min(i*0.03,0.6)}s ease both` }}>
                <div style={{ fontSize:34, lineHeight:1 }}>{topicEmoji(s.topic)}</div>
                <div style={{ fontSize:13, marginTop:4, color:'var(--gold-deep)' }}>{'⭐'.repeat(s.stars||0)||'•'}</div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ textAlign:'center', padding:'24px 10px', color:'var(--ink-soft)' }}>
            <div style={{ fontSize:46, marginBottom:8 }}>🌟</div>
            <p style={{ fontSize:18, fontFamily:'var(--font-display)', margin:0 }}>No stickers yet!</p>
            <p style={{ fontSize:15, margin:'4px 0 0' }}>Finish a quest to earn your first sticker.</p>
          </div>
        )}
      </Panel>

      <div style={{ display:'flex', justifyContent:'center', marginTop:24 }}>
        <BigButton onClick={onStart} color="pink" size="lg" icon="✨">Start a Quest</BigButton>
      </div>
    </Stage>
  );
}

function StatCard({ emoji, value, label, color }){
  return (
    <div style={{ background:'#fff', borderRadius:'var(--r-md)', padding:'16px 10px', textAlign:'center', boxShadow:'var(--shadow-soft)' }}>
      <div style={{ fontSize:30 }}>{emoji}</div>
      <div className="display" style={{ fontSize:30, color, fontWeight:700, lineHeight:1.1 }}>{value}</div>
      <div style={{ fontSize:13, color:'var(--ink-soft)', fontFamily:'var(--font-display)' }}>{label}</div>
    </div>
  );
}

Object.assign(window, {
  loadProgress, saveProgress, loadProgressFor, commitQuest, defaultProgress,
  saveSession, loadSession, clearSession, StickerBook,
});
