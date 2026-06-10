// ====== PROFILES: per-student login so several kids share one device ======
// Each student gets their own namespaced progress + resume session.

const ROSTER_KEY = 'ppq_students';
const ACTIVE_KEY = 'ppq_active_student';

// fun avatar palette + emoji, auto-assigned at sign-up (kid-friendly, no typing colors)
const AVATARS = [
  { color: '#FF5BA0', glow: '#FF9BCB', emoji: '🦊' },
  { color: '#7A3AE6', glow: '#C9A8FF', emoji: '🐼' },
  { color: '#2FA7E0', glow: '#9BD8FF', emoji: '🐧' },
  { color: '#1FA86A', glow: '#8FE6BE', emoji: '🐸' },
  { color: '#F0961E', glow: '#FFD36B', emoji: '🦁' },
  { color: '#E0457A', glow: '#FF9BCB', emoji: '🦄' },
  { color: '#5E6BE0', glow: '#B6BEFF', emoji: '🐳' },
  { color: '#C42E96', glow: '#FF8FD6', emoji: '🐙' },
];

function uid(){ return 's' + Date.now().toString(36) + Math.random().toString(36).slice(2,6); }

function loadRoster(){
  try { const r = JSON.parse(localStorage.getItem(ROSTER_KEY) || 'null'); if (Array.isArray(r)) return r; } catch(e){}
  return [];
}
function saveRoster(r){ try { localStorage.setItem(ROSTER_KEY, JSON.stringify(r)); } catch(e){} }

function getActiveId(){ try { return localStorage.getItem(ACTIVE_KEY) || ''; } catch(e){ return ''; } }
function setActiveId(id){ try { id ? localStorage.setItem(ACTIVE_KEY, id) : localStorage.removeItem(ACTIVE_KEY); } catch(e){} }

function getActiveStudent(){ const id = getActiveId(); return loadRoster().find(s => s.id === id) || null; }

function addStudent(name){
  const roster = loadRoster();
  const avatar = AVATARS[roster.length % AVATARS.length];
  const student = { id: uid(), name: (name||'').trim().slice(0,18) || 'Reader', ...avatar, created: Date.now() };
  roster.push(student);
  saveRoster(roster);
  return student;
}

function removeStudent(id){
  saveRoster(loadRoster().filter(s => s.id !== id));
  // wipe that student's saved data
  try {
    localStorage.removeItem('ppq_progress__' + id);
    localStorage.removeItem('ppq_session__' + id);
  } catch(e){}
  if (getActiveId() === id) setActiveId('');
}

// namespaced storage keys for the active student
function studentKey(base){ const id = getActiveId(); return id ? base + '__' + id : base; }

// ---------- admin password (protects reader deletion) ----------
const ADMIN_KEY = 'ppq_admin_pw';
function hasAdminPw(){ try { return !!localStorage.getItem(ADMIN_KEY); } catch(e){ return false; } }
function setAdminPw(pw){ try { localStorage.setItem(ADMIN_KEY, String(pw)); } catch(e){} }
function checkAdminPw(pw){ try { return localStorage.getItem(ADMIN_KEY) === String(pw); } catch(e){ return false; } }

// Modal: create the admin password on first use, or verify it afterwards.
function AdminGate({ onPass, onClose }){
  const setup = !hasAdminPw();
  const [pw, setPw] = useState('');
  const [pw2, setPw2] = useState('');
  const [err, setErr] = useState('');
  const ref = useRef(null);
  useEffect(()=>{ if(ref.current) ref.current.focus(); }, []);

  function submit(){
    if(setup){
      if(pw.length < 4){ setErr('Use at least 4 characters.'); return; }
      if(pw !== pw2){ setErr('Passwords don’t match.'); return; }
      setAdminPw(pw); onPass();
    } else {
      if(checkAdminPw(pw)){ onPass(); }
      else { setErr('Incorrect password.'); setPw(''); if(ref.current) ref.current.focus(); }
    }
  }
  const inputStyle = { width:'100%', fontSize:18, padding:'12px 14px', borderRadius:12,
    border:'2px solid var(--lav-2)', fontFamily:'var(--font-body)', fontWeight:700, outline:'none',
    color:'var(--ink)', textAlign:'center', marginBottom:10 };

  return (
    <Overlay onClose={onClose}>
      <div style={{ textAlign:'center', maxWidth:380, margin:'0 auto' }}>
        <div style={{ fontSize:40 }}>🔐</div>
        <h3 style={{ color:'var(--purple-ink)', fontSize:24, margin:'6px 0 4px' }}>
          {setup ? 'Create admin password' : 'Admin only'}
        </h3>
        <p style={{ color:'var(--ink-soft)', fontSize:15, margin:'0 0 18px' }}>
          {setup
            ? 'Set a password a grown-up will use to add or remove readers.'
            : 'Enter the admin password to manage readers.'}
        </p>
        <input ref={ref} type="password" value={pw}
          onChange={e=>{ setPw(e.target.value); setErr(''); }}
          onKeyDown={e=>{ if(e.key==='Enter') submit(); }}
          placeholder={setup ? 'New password' : 'Password'} style={inputStyle} />
        {setup &&
          <input type="password" value={pw2}
            onChange={e=>{ setPw2(e.target.value); setErr(''); }}
            onKeyDown={e=>{ if(e.key==='Enter') submit(); }}
            placeholder="Confirm password" style={inputStyle} />
        }
        {err && <div style={{ color:'#E0457A', fontSize:14, fontWeight:700, marginBottom:8 }}>{err}</div>}
        <div style={{ display:'flex', gap:10, justifyContent:'center', marginTop:6 }}>
          <BigButton onClick={onClose} color="white" size="sm">Cancel</BigButton>
          <BigButton onClick={submit} color="pink" size="sm" icon={setup ? '✓' : '🔓'}>
            {setup ? 'Save' : 'Unlock'}
          </BigButton>
        </div>
      </div>
    </Overlay>
  );
}

// ---------- Avatar bubble ----------
function StudentAvatar({ student, size = 56 }){
  if(!student) return null;
  return (
    <div style={{ width:size, height:size, borderRadius:'50%', flex:'0 0 auto',
      display:'flex', alignItems:'center', justifyContent:'center',
      background:`radial-gradient(circle at 35% 30%, ${student.glow}, ${student.color})`,
      boxShadow:`0 6px 18px ${student.color}66, inset 0 2px 6px rgba(255,255,255,.4)`,
      border:'3px solid rgba(255,255,255,.85)', fontSize:size*0.5, lineHeight:1 }}>
      {student.emoji}
    </div>
  );
}

// ---------- Sign-in screen ----------
function SignInScreen({ onSignIn }){
  const [roster, setRoster] = useState(loadRoster);
  const [adding, setAdding] = useState(roster.length === 0);
  const [name, setName] = useState('');
  const [manage, setManage] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);
  const [gateFor, setGateFor] = useState(null);   // 'manage' | 'dashboard'
  const [showDash, setShowDash] = useState(false);
  const inputRef = useRef(null);

  useEffect(()=>{
    if(adding && inputRef.current) inputRef.current.focus();
    if(adding){ try { speakLine('Type your name to go to Remy'); } catch(e){} }
  }, [adding]);

  function pick(s){ setActiveId(s.id); onSignIn(s); }
  function create(){
    const s = addStudent(name);
    setRoster(loadRoster());
    setName(''); setAdding(false);
    pick(s);
  }
  function remove(e, id){
    e.stopPropagation();
    if(!confirm('Remove this reader and all their saved progress? This cannot be undone.')) return;
    removeStudent(id);
    const r = loadRoster();
    setRoster(r);
    if(r.length === 0){ setManage(false); setAdding(true); }
  }
  function toggleManage(){
    if(manage){ setManage(false); return; }   // leaving manage mode is free
    setGateFor('manage'); setShowAdmin(true);  // entering requires admin password
  }
  function openDashboard(){ setGateFor('dashboard'); setShowAdmin(true); }
  function onGatePass(){
    setShowAdmin(false);
    if(gateFor === 'dashboard') setShowDash(true);
    else setManage(true);
    setGateFor(null);
  }

  if(showDash) return <TeacherDashboard onClose={()=>setShowDash(false)} />;

  return (
    <Stage maxWidth={760}>
      <div style={{ textAlign:'center', marginBottom:8, animation:'rise .5s ease both' }}>
        <FloatingOwl size={130} mood="happy" />
      </div>
      <h1 style={{ textAlign:'center', fontSize:'clamp(30px,5vw,48px)', margin:'2px 0 4px', lineHeight:1.05,
        background:'linear-gradient(90deg,#C9A8FF 0%,#FF7DBC 55%,#FFD36B 120%)', backgroundSize:'200% auto',
        WebkitBackgroundClip:'text', backgroundClip:'text', WebkitTextFillColor:'transparent',
        animation:'sheen 5s linear infinite', fontWeight:700 }}>
        Who's Reading Today?
      </h1>
      <p style={{ textAlign:'center', color:'var(--head-on-bg-soft)', fontSize:'clamp(16px,2.2vw,20px)', margin:'0 0 28px', fontWeight:600 }}>
        Tap your name to pick up right where you left off.
      </p>

      {!adding && (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(150px,1fr))', gap:16 }}>
          {roster.map((s,i)=>(
            <button key={s.id} onClick={()=>manage ? null : pick(s)}
              style={{ position:'relative', background:'#fff', borderRadius:'var(--r-md)', padding:'22px 14px 18px',
                boxShadow:'var(--shadow-soft)', display:'flex', flexDirection:'column', alignItems:'center', gap:12,
                cursor:manage?'default':'pointer', animation:`pop-in .3s ${Math.min(i*0.05,0.5)}s ease both`,
                border:'2px solid transparent' }}>
              <StudentAvatar student={s} size={72} />
              <span className="display" style={{ fontSize:20, color:'var(--ink)', fontWeight:700,
                maxWidth:'100%', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{s.name}</span>
              {manage && (
                <span onClick={(e)=>remove(e, s.id)} role="button"
                  style={{ position:'absolute', top:-10, right:-10, width:30, height:30, borderRadius:'50%',
                    background:'#FF4D6D', color:'#fff', display:'flex', alignItems:'center', justifyContent:'center',
                    fontSize:18, fontWeight:700, boxShadow:'0 4px 10px rgba(255,77,109,.5)', cursor:'pointer' }}>×</span>
              )}
            </button>
          ))}

          {!manage && (
            <button onClick={()=>setAdding(true)}
              style={{ background:'rgba(255,255,255,.10)', borderRadius:'var(--r-md)', padding:'22px 14px 18px',
                border:'2px dashed rgba(201,168,255,.6)', display:'flex', flexDirection:'column', alignItems:'center',
                gap:12, cursor:'pointer', color:'var(--head-on-bg)' }}>
              <div style={{ width:72, height:72, borderRadius:'50%', display:'flex', alignItems:'center',
                justifyContent:'center', background:'rgba(201,168,255,.18)', fontSize:38, fontWeight:300, lineHeight:1 }}>+</div>
              <span className="display" style={{ fontSize:18, fontWeight:700 }}>Add Reader</span>
            </button>
          )}
        </div>
      )}

      {adding && (
        <Panel>
          <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:16, padding:'8px 4px' }}>
            <h3 className="display" style={{ color:'var(--purple-ink)', fontSize:22, margin:0 }}>What's your name?</h3>
            <input ref={inputRef} value={name} onChange={e=>setName(e.target.value)}
              onKeyDown={e=>{ if(e.key==='Enter' && name.trim()) create(); }}
              placeholder="Type your first name"
              style={{ width:'min(360px,90%)', fontSize:20, padding:'14px 18px', borderRadius:16,
                border:'2px solid var(--lav-2)', fontFamily:'var(--font-display)', textAlign:'center', outline:'none', color:'var(--ink)' }} />
            <div style={{ display:'flex', gap:12, flexWrap:'wrap', justifyContent:'center' }}>
              {roster.length>0 && (
                <BigButton onClick={()=>{ setAdding(false); setName(''); }} color="white" size="sm">Back</BigButton>
              )}
              <BigButton onClick={create} color="pink" size="md" icon="✨" disabled={!name.trim()}>Let's Go!</BigButton>
            </div>
          </div>
        </Panel>
      )}

      {!adding && roster.length>0 && (
        <div style={{ display:'flex', justifyContent:'center', gap:10, flexWrap:'wrap', marginTop:26 }}>
          <button onClick={toggleManage}
            style={{ background:'rgba(255,255,255,.12)', color:'var(--head-on-bg)', borderRadius:999,
              padding:'10px 20px', fontSize:15, fontWeight:700, fontFamily:'var(--font-display)' }}>
            {manage ? '✓ Done' : '🔒 Manage readers'}
          </button>
          {!manage && (
            <button onClick={openDashboard}
              style={{ background:'rgba(255,255,255,.12)', color:'var(--head-on-bg)', borderRadius:999,
                padding:'10px 20px', fontSize:15, fontWeight:700, fontFamily:'var(--font-display)' }}>
              👩‍🏫 Teacher dashboard
            </button>
          )}
        </div>
      )}

      {showAdmin &&
        <AdminGate onClose={()=>{ setShowAdmin(false); setGateFor(null); }}
          onPass={onGatePass} />
      }
    </Stage>
  );
}

Object.assign(window, {
  loadRoster, saveRoster, getActiveId, setActiveId, getActiveStudent,
  addStudent, removeStudent, studentKey, StudentAvatar, SignInScreen,
  hasAdminPw, setAdminPw, checkAdminPw, AdminGate,
});
