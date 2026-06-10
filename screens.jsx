// ====== SCREENS: selection flow, passage, score, top bar ======

// ---------- Top bar (shown during activity) ----------
function TopBar({ gems, totalGems, onHome, settings }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      gap: 12, marginBottom: 18 }}>
      <button onClick={onHome} style={{ display: 'flex', alignItems: 'center', gap: 10,
        background: '#fff', borderRadius: 999, padding: '8px 16px 8px 10px', boxShadow: 'var(--shadow-soft)' }}>
        <span style={{ width: 34, height: 34, borderRadius: '50%', background: 'var(--purple)', color: '#fff',
          display: 'grid', placeItems: 'center', fontSize: 18 }}>🏠</span>
        <span className="display" style={{ color: 'var(--purple-ink)', fontSize: 16 }}>Home</span>
      </button>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#fff',
        borderRadius: 999, padding: '8px 18px', boxShadow: 'var(--shadow-soft)' }}>
        <span style={{ fontSize: 22 }}>💎</span>
        <span className="display" style={{ color: 'var(--pink-deep)', fontSize: 22, fontWeight: 600 }}>{gems}</span>
        <span style={{ color: 'var(--ink-soft)', fontSize: 16, fontFamily: 'var(--font-display)' }}>/ {totalGems}</span>
      </div>
    </div>);

}

// ---------- Welcome ----------
function WelcomeScreen({ onStart, onOpenBook, resume, onResume, student, onSwitch }) {
  const greeting = (student ? ('Hi ' + student.name + '! ') : '') +
    'Welcome to Reading Rascals! Click on Start My Quest to get started on your reading adventure!';
  const [waving, setWaving] = useState(true);
  const greetRef = useRef(false);

  function greet(){
    setWaving(true);
    try { playClick(); } catch(e){}
    try { speakLine(greeting); } catch(e){}
    setTimeout(() => setWaving(false), 5200);
  }
  // wave + speak once shortly after the screen appears
  useEffect(() => {
    if(greetRef.current) return; greetRef.current = true;
    const t = setTimeout(greet, 650);
    return () => clearTimeout(t);
  }, []);

  return (
    <div style={{ position: 'relative', zIndex: 1, minHeight: '100vh', display: 'flex',
      flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 20px', textAlign: 'center' }}>
      {student &&
        <div style={{ position: 'fixed', top: 16, left: 16, zIndex: 5, display: 'flex', alignItems: 'center', gap: 10,
          background: 'rgba(255,255,255,.12)', backdropFilter: 'blur(6px)', borderRadius: 999,
          padding: '6px 8px 6px 6px', border: '1px solid rgba(255,255,255,.18)' }}>
          <StudentAvatar student={student} size={38} />
          <span className="display" style={{ color: 'var(--head-on-bg)', fontSize: 16, fontWeight: 700,
            maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{student.name}</span>
          <button onClick={onSwitch} title="Switch reader / log out"
            style={{ background: 'rgba(255,255,255,.16)', color: 'var(--head-on-bg)', borderRadius: 999,
              padding: '6px 12px', fontSize: 13, fontWeight: 700, fontFamily: 'var(--font-display)', whiteSpace: 'nowrap' }}>
            Switch
          </button>
        </div>
      }
      <div style={{ position: 'relative', zIndex: 2, display: 'flex', flexDirection: 'column', alignItems: 'center',
        animation: 'rise .5s ease both' }}>
        {/* speech bubble */}
        <div role="status" style={{ position: 'relative', maxWidth: 'min(420px, 86vw)', marginBottom: 14,
          background: '#fff', color: 'var(--ink)', borderRadius: 22, padding: '16px 20px',
          boxShadow: '0 16px 40px -14px rgba(40,20,90,.6)', fontSize: 'clamp(16px,2.2vw,20px)',
          fontWeight: 700, lineHeight: 1.35, fontFamily: 'var(--font-display)', textWrap: 'pretty',
          animation: 'bubble-in .45s .35s ease both' }}>
          <span style={{ color: 'var(--purple-deep)' }}>{greeting}</span>
          <span aria-hidden="true" style={{ position: 'absolute', left: '50%', bottom: -11, transform: 'translateX(-50%)',
            width: 24, height: 24, background: '#fff', clipPath: 'polygon(0 0, 100% 0, 50% 100%)' }}></span>
        </div>
        <button onClick={greet} title="Hear Remy again" aria-label="Hear Remy say hello again"
          style={{ background: 'transparent', padding: 0, cursor: 'pointer', lineHeight: 0 }}>
          <FloatingOwl size={210} mood={waving ? 'wave' : 'happy'} />
        </button>
      </div>
      <h1 style={{ position: 'relative', zIndex: 1, fontSize: 'clamp(40px, 7vw, 68px)', margin: '6px 0 4px', lineHeight: 1.02,
        background: 'linear-gradient(90deg, #C9A8FF 0%, #FF7DBC 55%, #FFD36B 120%)',
        backgroundSize: '200% auto', WebkitBackgroundClip: 'text', backgroundClip: 'text',
        WebkitTextFillColor: 'transparent', animation: 'sheen 5s linear infinite', fontWeight: 700,
        textShadow: '0 6px 26px rgba(255,125,188,.35)' }}>
        Reading<br />Rascals
      </h1>
      <p style={{ position: 'relative', zIndex: 1, fontSize: 'clamp(18px,2.4vw,23px)', color: '#EADCFF', maxWidth: 480,
        margin: '10px auto 26px', fontWeight: 600 }}>
        Read a brand-new story, answer fun questions, and play sound games with <b style={{ color: '#FF9BCB' }}>Remy the Raccoon!</b>
      </p>

      {resume &&
      <div style={{ position: 'relative', zIndex: 1, background: '#fff', borderRadius: 'var(--r-md)', boxShadow: 'var(--shadow-soft)',
        padding: '12px 14px 12px 18px', marginBottom: 18, display: 'flex', alignItems: 'center', gap: 14,
        animation: 'pop-in .3s ease both', maxWidth: 430 }}>
          <span style={{ fontSize: 30 }}>📖</span>
          <div style={{ textAlign: 'left' }}>
            <div className="display" style={{ color: 'var(--purple-ink)', fontSize: 16 }}>Pick up where you left off</div>
            <div style={{ color: 'var(--ink-soft)', fontSize: 14 }}>“{resume.title}” · {resume.gems} 💎 so far</div>
          </div>
          <BigButton onClick={onResume} color="purple" size="sm" icon="▶">Resume</BigButton>
        </div>
      }

      <div style={{ position: 'relative', zIndex: 1, animation: 'pulse-ring 2s ease-out infinite', borderRadius: 999 }}>
        <BigButton onClick={onStart} color="pink" size="lg" icon="✨">Start My Quest</BigButton>
      </div>
      <div style={{ position: 'relative', zIndex: 1, marginTop: 18 }}>
        <BigButton onClick={onOpenBook} color="white" size="sm" icon="⭐">My Sticker Book</BigButton>
      </div>
      <p style={{ position: 'relative', zIndex: 1, marginTop: 22, color: 'rgba(234,220,255,.72)', fontSize: 15 }}>
        A reading &amp; sound-play adventure for grades K–5
      </p>
    </div>);

}

// ---------- Grade selection ----------
function GradeScreen({ value, onPick, onBack, onNext }) {
  return (
    <Stage maxWidth={720}>
      <StepBar stepIndex={0} totalSteps={3} onBack={onBack} />
      <SelectHeader emoji="🎒" title="Pick Your Grade" subtitle="Choose the grade that's just right for you." />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginTop: 22 }}>
        {GRADES.map((g) =>
        <ChoiceTile key={g.id} emoji={g.emoji} label={g.label} big
        selected={value === g.id} onClick={() => onPick(g.id)} />
        )}
      </div>
      <NextRow show={!!value} onNext={onNext} label="Next: Story Type" />
    </Stage>);

}

// ---------- Story type ----------
function TypeScreen({ value, onPick, onBack, onNext }) {
  return (
    <Stage maxWidth={620}>
      <StepBar stepIndex={1} totalSteps={3} onBack={onBack} />
      <SelectHeader emoji="📖" title="Fiction or Non-fiction?" subtitle="Do you want a made-up story or real facts?" />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18, marginTop: 22 }}>
        {STORY_TYPES.map((t) =>
        <ChoiceTile key={t.id} emoji={t.emoji} label={t.label} blurb={t.blurb} big color="pink"
        selected={value === t.id} onClick={() => onPick(t.id)} />
        )}
      </div>
      <NextRow show={!!value} onNext={onNext} label="Next: Pick a Topic" />
    </Stage>);

}

// ---------- Topic ----------
function TopicScreen({ value, onPick, onBack, onNext }) {
  return (
    <Stage maxWidth={820}>
      <StepBar stepIndex={2} totalSteps={3} onBack={onBack} />
      <SelectHeader emoji="🌈" title="Choose a Topic" subtitle="What would you love to read about?" />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(124px, 1fr))', gap: 14, marginTop: 22 }}>
        {TOPICS.map((t) =>
        <ChoiceTile key={t.id} emoji={t.emoji} label={t.label}
        selected={value === t.id} onClick={() => onPick(t.id)} />
        )}
      </div>
      <NextRow show={!!value} onNext={onNext} label="Make My Story!" color="pink" icon="✨" />
    </Stage>);

}

// shared select header
function SelectHeader({ emoji, title, subtitle }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
      <div style={{ fontSize: 46, animation: 'bob 3s ease-in-out infinite' }}>{emoji}</div>
      <div>
        <h2 style={{ margin: 0, fontSize: 'clamp(26px,4vw,36px)', color: 'var(--head-on-bg)' }}>{title}</h2>
        <p style={{ margin: '4px 0 0', color: 'var(--head-on-bg-soft)', fontSize: 17 }}>{subtitle}</p>
      </div>
    </div>);

}
function NextRow({ show, onNext, label, color = 'purple', icon = '→' }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', marginTop: 30, minHeight: 64 }}>
      {show &&
      <div style={{ animation: 'pop-in .3s ease both' }}>
          <BigButton onClick={onNext} color={color} size="lg" icon={icon}>{label}</BigButton>
        </div>
      }
    </div>);

}

// ---------- Loading / generating ----------
function LoadingScreen({ grade, type, topic }) {
  const msgs = ['Mixing up your story…', 'Sprinkling in fun words…', 'Rustling up some questions…', 'Almost ready…'];
  const [i, setI] = useState(0);
  useEffect(() => {const t = setInterval(() => setI((v) => (v + 1) % msgs.length), 1600);return () => clearInterval(t);}, []);
  const topicObj = TOPICS.find((t) => t.id === topic);
  return (
    <div style={{ position: 'relative', zIndex: 1, minHeight: '100vh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', padding: '40px 20px', textAlign: 'center' }}>
      <div style={{ position: 'relative' }}>
        <div style={{ animation: 'bob 2s ease-in-out infinite' }}><Owl size={190} mood="reading" /></div>
        <div style={{ position: 'absolute', top: -6, right: -30, fontSize: 40, animation: 'float-y 2s ease-in-out infinite' }}>{topicObj ? topicObj.emoji : '✨'}</div>
      </div>
      <h2 style={{ fontSize: 'clamp(26px,4vw,34px)', color: 'var(--head-on-bg)', margin: '18px 0 6px' }}>{msgs[i]}</h2>
      <p style={{ color: 'var(--head-on-bg-soft)', fontSize: 17, margin: '0 0 22px' }}>
        {gradeLabel(grade)} · {type === 'fiction' ? 'Fiction' : 'Non-fiction'} · {topicObj ? topicObj.label : topic}
      </p>
      <LoadingDots />
    </div>);

}

// ---------- Passage ----------
function PassageScreen({ activity, onContinue, onHome, gems, totalGems, showKey, onPrint }) {
  const topicObj = TOPICS.find((t) => t.id === activity.topic);
  const sents = buildSentences(activity.paragraphs);
  const narrator = useNarrator(sents.flat);
  return (
    <Stage maxWidth={780}>
      <TopBar gems={gems} totalGems={totalGems} onHome={onHome} />
      <Panel pad={0} style={{ overflow: 'hidden' }}>
        {/* header band */}
        <div style={{ background: 'linear-gradient(120deg, var(--purple) 0%, var(--pink) 100%)',
          padding: '22px 30px', color: '#fff', display: 'flex', alignItems: 'center', gap: 14 }}>
          <span style={{ fontSize: 38 }}>{topicObj ? topicObj.emoji : '📖'}</span>
          <div>
            <div style={{ fontSize: 13, textTransform: 'uppercase', letterSpacing: 1.5, opacity: .85, fontFamily: 'var(--font-display)' }}>
              {gradeLabel(activity.grade)} · {activity.type === 'fiction' ? 'Fiction' : 'Non-fiction'}
            </div>
            <h2 style={{ margin: '2px 0 0', fontSize: 'clamp(24px,3.6vw,32px)' }}>{activity.title}</h2>
          </div>
        </div>
        {/* narration + print controls */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
          flexWrap: 'wrap', padding: '14px 30px', background: 'var(--pink-soft-2)', borderBottom: '2px solid #fff' }}>
          <NarratorBar narrator={narrator} />
          <button onClick={onPrint} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#fff',
            color: 'var(--purple)', borderRadius: 999, padding: '10px 18px', fontFamily: 'var(--font-display)',
            fontSize: 16, boxShadow: 'var(--shadow-soft)', whiteSpace: 'nowrap' }}>🖨️ Print</button>
        </div>
        {/* passage body */}
        <div style={{ padding: '26px 32px 30px' }}>
          {sents.byPara.map((row, pi) =>
          <p key={pi} style={{ fontSize: 'clamp(19px,2.3vw,22px)', lineHeight: 1.9, color: 'var(--ink)',
            margin: '0 0 16px', textWrap: 'pretty', fontWeight: 600 }}>
              {row.map((sn) =>
            <span key={sn.gi} className={'narr-sentence' + (narrator.active === sn.gi ? ' narr-active' : '')}>{sn.text}</span>
            )}
            </p>
          )}
        </div>
      </Panel>

      <div style={{ display: 'flex', justifyContent: 'center', gap: 14, marginTop: 24, alignItems: 'center' }}>
        <FloatingOwl size={84} mood="happy" />
        <BigButton onClick={() => {narrator.stop();onContinue();}} color="pink" size="lg" icon="✏️">I read it! Answer time</BigButton>
      </div>
    </Stage>);

}

// ---------- Score / progress ----------
function ScoreScreen({ activity, gems, totalGems, compScore, phonDone, onReplaySame, onNewTopic, onNewGrade, onHome, onPrint, onOpenBook }) {
  const [burst, setBurst] = useState(false);
  const [sticker, setSticker] = useState(null);
  const committed = useRef(false);
  const pct = Math.round(gems / totalGems * 100);
  const stars = gems >= 9 ? 3 : gems >= 6 ? 2 : gems >= 3 ? 1 : 0;
  useEffect(() => {
    const t = setTimeout(() => setBurst(true), 250);
    if (!committed.current) {
      committed.current = true;
      try {const r = commitQuest({ gems, stars, grade: activity.grade, type: activity.type, topic: activity.topic });setSticker(r.sticker);} catch (e) {}
      try { setTimeout(() => playCelebrate(), 260); } catch (e) {}
    }
    return () => clearTimeout(t);
  }, []);
  const topicObj = sticker ? TOPICS.find((t) => t.id === sticker.topic) : null;
  return (
    <Stage maxWidth={680}>
      <Confetti run={burst} />
      <div style={{ textAlign: 'center', animation: 'rise .4s ease both' }}>
        <div style={{ animation: 'bob 3s ease-in-out infinite', display: 'inline-block' }}>
          <Owl size={150} mood="cheer" />
        </div>
        <h2 style={{ fontSize: 'clamp(30px,5vw,44px)', color: 'var(--head-on-bg)', margin: '8px 0 2px' }}>Quest Complete!</h2>
        <p style={{ color: 'var(--head-on-bg-soft)', fontSize: 19, margin: '0 0 18px' }}>Look how many reading gems you collected!</p>

        {/* stars */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 12, marginBottom: 18 }}>
          {[0, 1, 2].map((i) =>
          <span key={i} style={{ fontSize: 54, filter: i < stars ? 'none' : 'grayscale(1)', opacity: i < stars ? 1 : 0.3,
            animation: i < stars ? `star-pop .5s ${0.2 + i * 0.18}s ease both` : 'none' }}>⭐</span>
          )}
        </div>

        <Panel>
          {/* rainbow path filling */}
          <div style={{ position: 'relative', height: 26, borderRadius: 99, background: '#EEE6FF', overflow: 'hidden', marginBottom: 10 }}>
            <div style={{ position: 'absolute', inset: 0, width: pct + '%',
              background: 'linear-gradient(90deg,#FF5BA0,#FFC23D,#5AD6B0,#54C7F2,#7C5CFC)',
              backgroundSize: '200% 100%', borderRadius: 99, transition: 'width 1s cubic-bezier(.2,.8,.2,1)',
              animation: 'sheen 3s linear infinite' }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 6 }}>
            <GemPath total={totalGems} earned={gems} />
          </div>
          <p className="display" style={{ fontSize: 24, color: 'var(--pink-deep)', margin: '8px 0 0' }}>
            💎 {gems} of {totalGems} gems
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 20, marginTop: 14, color: 'var(--ink-soft)', fontSize: 16, fontFamily: 'var(--font-display)' }}>
            <span>📖 Reading: <b style={{ color: 'var(--purple)' }}>{compScore}/5</b></span>
            <span>🔊 Sound games: <b style={{ color: 'var(--purple)' }}>{phonDone}/5</b></span>
          </div>

          {/* badge */}
          <div style={{ marginTop: 20, display: 'flex', justifyContent: 'center' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
              background: 'linear-gradient(135deg,var(--lav-2),var(--pink-soft))', borderRadius: 24, padding: '16px 28px',
              border: '3px dashed var(--purple)', animation: 'pop-in .5s .4s ease both' }}>
              <span style={{ fontSize: 46 }}>🏅</span>
              <span className="display" style={{ color: 'var(--purple-ink)', fontSize: 18, fontWeight: 600 }}>
                {stars === 3 ? 'Gold Reader Badge!' : stars === 2 ? 'Star Reader Badge!' : 'Quest Badge Earned!'}
              </span>
            </div>
          </div>
        </Panel>

        {/* new sticker earned */}
        {topicObj &&
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, marginTop: 18,
          background: '#fff', borderRadius: 'var(--r-md)', boxShadow: 'var(--shadow-soft)', padding: '12px 20px',
          maxWidth: 360, marginLeft: 'auto', marginRight: 'auto', animation: 'pop-in .5s .6s ease both' }}>
            <span style={{ fontSize: 38 }}>{topicObj.emoji}</span>
            <div style={{ textAlign: 'left' }}>
              <div className="display" style={{ color: 'var(--pink-deep)', fontSize: 16 }}>New sticker earned!</div>
              <div style={{ color: 'var(--ink-soft)', fontSize: 14 }}>Added to your Sticker Book {'⭐'.repeat(stars)}</div>
            </div>
          </div>
        }

        {/* play again options */}
        <h3 style={{ color: 'var(--head-on-bg)', fontSize: 22, margin: '26px 0 14px' }}>Play Again?</h3>
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 12 }}>
          <BigButton onClick={onReplaySame} color="pink" icon="🔄">New Story, Same Picks</BigButton>
          <BigButton onClick={onNewTopic} color="purple" icon="🌈">New Topic</BigButton>
          <BigButton onClick={onNewGrade} color="white" icon="🎒">Change Grade</BigButton>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 12, marginTop: 12 }}>
          <BigButton onClick={onPrint} color="white" size="sm" icon="🖨️">Print Worksheet</BigButton>
          <BigButton onClick={onOpenBook} color="white" size="sm" icon="⭐">My Sticker Book</BigButton>
        </div>
      </div>
    </Stage>);

}

Object.assign(window, {
  TopBar, WelcomeScreen, GradeScreen, TypeScreen, TopicScreen, LoadingScreen, PassageScreen, ScoreScreen
});