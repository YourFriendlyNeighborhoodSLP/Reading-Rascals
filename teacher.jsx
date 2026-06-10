// ====== TEACHER DASHBOARD: password-gated class progress (this device) ======
// Reads every roster student's saved progress from this device's storage.
// NOTE: only reflects activity on THIS device — home-device progress is not synced.

function fmtAgo(ts){
  if(!ts) return 'No activity yet';
  const d = Date.now() - ts;
  const min = Math.round(d/60000), hr = Math.round(d/3600000), day = Math.round(d/86400000);
  if(min < 1) return 'Just now';
  if(min < 60) return min + (min===1?' min ago':' mins ago');
  if(hr < 24) return hr + (hr===1?' hr ago':' hrs ago');
  if(day < 7) return day + (day===1?' day ago':' days ago');
  try { return new Date(ts).toLocaleDateString(undefined, { month:'short', day:'numeric' }); } catch(e){ return ''; }
}

function typeLabel(t){ return t==='fiction' ? 'Fiction' : t==='nonfiction' ? 'Non-fiction' : (t||''); }
function topicEmojiFor(id){ const t = (typeof TOPICS!=='undefined') && TOPICS.find(x=>x.id===id); return t ? t.emoji : '⭐'; }
function topicLabelFor(id){ const t = (typeof TOPICS!=='undefined') && TOPICS.find(x=>x.id===id); return t ? t.label : id; }

function TeacherDashboard({ onClose }){
  const roster = loadRoster();
  const rows = roster
    .map(s => ({ student:s, p:loadProgressFor(s.id) }))
    .sort((a,b) => (b.p.lastPlayed||0) - (a.p.lastPlayed||0));

  const totals = rows.reduce((acc,r)=>{
    acc.quests += r.p.quests||0;
    acc.gems += r.p.lifetimeGems||0;
    acc.gold += r.p.goldBadges||0;
    return acc;
  }, { quests:0, gems:0, gold:0 });

  const [openId, setOpenId] = useState(rows.length ? rows[0].student.id : null);

  return (
    <Stage maxWidth={840}>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:8 }}>
        <button onClick={onClose} style={{ background:'#fff', color:'var(--purple)', borderRadius:999,
          padding:'10px 18px 10px 14px', boxShadow:'var(--shadow-soft)', fontSize:16, display:'flex', alignItems:'center', gap:8 }}>← Back</button>
        <h2 className="display" style={{ color:'var(--head-on-bg)', fontSize:'clamp(22px,3.4vw,30px)', margin:0, whiteSpace:'nowrap' }}>Class Progress</h2>
        <div style={{ width:90 }} />
      </div>
      <p style={{ textAlign:'center', color:'var(--head-on-bg-soft)', fontSize:14, margin:'0 0 18px' }}>
        🔒 Progress saved on <b>this device</b> · {rows.length} {rows.length===1?'reader':'readers'}
      </p>

      {/* class totals */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12, marginBottom:18 }}>
        <StatCard emoji="🧒" value={rows.length} label="Readers" color="var(--purple)" />
        <StatCard emoji="📚" value={totals.quests} label="Quests done" color="var(--pink-deep)" />
        <StatCard emoji="💎" value={totals.gems} label="Gems" color="var(--purple)" />
        <StatCard emoji="🏅" value={totals.gold} label="Gold badges" color="var(--gold-deep)" />
      </div>

      {rows.length === 0 ? (
        <Panel>
          <div style={{ textAlign:'center', padding:'24px 10px', color:'var(--ink-soft)' }}>
            <div style={{ fontSize:46, marginBottom:8 }}>🧑‍🏫</div>
            <p style={{ fontSize:18, fontFamily:'var(--font-display)', margin:0, color:'var(--purple-ink)' }}>No readers yet</p>
            <p style={{ fontSize:15, margin:'4px 0 0' }}>Add a reader on the sign-in screen, then their progress shows up here.</p>
          </div>
        </Panel>
      ) : (
        <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
          {rows.map(({ student:s, p }) => {
            const open = openId === s.id;
            const active = p.quests > 0 || p.lastPlayed;
            return (
              <div key={s.id} style={{ background:'#fff', borderRadius:'var(--r-md)', boxShadow:'var(--shadow-card)', overflow:'hidden' }}>
                <button onClick={()=>setOpenId(open ? null : s.id)}
                  style={{ width:'100%', display:'flex', alignItems:'center', gap:14, padding:'14px 16px', textAlign:'left', background:'transparent', cursor:'pointer' }}>
                  <StudentAvatar student={s} size={50} />
                  <div style={{ flex:1, minWidth:0 }}>
                    <div className="display" style={{ fontSize:19, fontWeight:700, color:'var(--ink)',
                      overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{s.name}</div>
                    <div style={{ fontSize:13, color:'var(--ink-soft)', fontFamily:'var(--font-display)' }}>{fmtAgo(p.lastPlayed)}</div>
                  </div>
                  <div style={{ display:'flex', gap:16, alignItems:'center', flex:'0 0 auto' }}>
                    <MiniStat emoji="📚" value={p.quests||0} />
                    <MiniStat emoji="💎" value={p.lifetimeGems||0} />
                    <MiniStat emoji="🏅" value={p.goldBadges||0} />
                    <span style={{ fontSize:18, color:'var(--ink-soft)', transform:open?'rotate(90deg)':'none', transition:'transform .18s' }}>›</span>
                  </div>
                </button>

                {open && (
                  <div style={{ padding:'0 16px 16px', borderTop:'1px solid #F0EAFB' }}>
                    {active ? (
                      <React.Fragment>
                        <div style={{ display:'flex', flexWrap:'wrap', gap:18, padding:'12px 2px 14px', fontSize:14, color:'var(--ink-soft)' }}>
                          <span><b style={{ color:'var(--ink)' }}>{p.bestStars||0}</b> best stars ⭐</span>
                          <span><b style={{ color:'var(--ink)' }}>{p.stickers?p.stickers.length:0}</b> stickers</span>
                          <span><b style={{ color:'var(--ink)' }}>{p.quests?Math.round((p.lifetimeGems||0)/p.quests):0}</b> avg gems / quest</span>
                        </div>
                        <div className="display" style={{ fontSize:13, color:'var(--purple-ink)', letterSpacing:.4,
                          textTransform:'uppercase', margin:'2px 0 8px' }}>Recent quests</div>
                        <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
                          {(p.stickers||[]).slice(0,6).map((st,i)=>(
                            <div key={i} style={{ display:'flex', alignItems:'center', gap:10, background:'#FAF6FF',
                              borderRadius:10, padding:'8px 12px', fontSize:14 }}>
                              <span style={{ fontSize:20 }}>{topicEmojiFor(st.topic)}</span>
                              <span style={{ flex:1, color:'var(--ink)', fontWeight:600 }}>{topicLabelFor(st.topic)}</span>
                              <span style={{ color:'var(--ink-soft)', fontSize:12.5 }}>
                                {(typeof gradeLabel==='function'?gradeLabel(st.grade):st.grade)} · {typeLabel(st.type)}
                              </span>
                              <span style={{ color:'var(--gold-deep)', letterSpacing:1 }}>{'⭐'.repeat(st.stars||0)||'•'}</span>
                            </div>
                          ))}
                        </div>
                      </React.Fragment>
                    ) : (
                      <div style={{ padding:'14px 2px', color:'var(--ink-soft)', fontSize:14 }}>
                        Hasn’t finished a quest yet on this device.
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </Stage>
  );
}

function MiniStat({ emoji, value }){
  return (
    <span style={{ display:'inline-flex', alignItems:'center', gap:4, fontSize:15, fontWeight:700, color:'var(--ink)' }}>
      <span style={{ fontSize:15 }}>{emoji}</span>{value}
    </span>
  );
}

Object.assign(window, { TeacherDashboard });
