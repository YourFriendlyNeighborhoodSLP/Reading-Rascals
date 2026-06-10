// ====== APP: state machine wiring everything together ======

const TOTAL_GEMS = 10;
const DEFAULT_SETTINGS = { grade:'', type:'', topic:'', questionMode:'auto', phonSource:'passage', showKey:false };

function loadSettings(){
  try { const s = JSON.parse(localStorage.getItem('ppq_settings')||'null'); if(s) return { ...DEFAULT_SETTINGS, ...s, grade:'', type:'', topic:'' }; } catch(e){}
  return { ...DEFAULT_SETTINGS };
}

function App(){
  const [student, setStudent] = useState(getActiveStudent);
  const [stage, setStage] = useState(student ? 'welcome' : 'signin');
  const [settings, setSettings] = useState(loadSettings);
  const [activity, setActivity] = useState(null);
  const [gems, setGems] = useState(0);
  const [compScore, setCompScore] = useState(0);
  const [phonScore, setPhonScore] = useState(0);

  const [gateOpen, setGateOpen] = useState(false);
  const [gatePassed, setGatePassed] = useState(false);
  const [panelOpen, setPanelOpen] = useState(false);
  const [printMenu, setPrintMenu] = useState(false);
  const [printKey, setPrintKey] = useState(true);
  const [resume, setResume] = useState(()=>loadSession());
  const genId = useRef(0);

  useEffect(()=>{
    try { localStorage.setItem('ppq_settings', JSON.stringify({ questionMode:settings.questionMode, phonSource:settings.phonSource, showKey:settings.showKey })); } catch(e){}
  },[settings.questionMode, settings.phonSource, settings.showKey]);

  // persist in-progress quest so a refresh can resume
  useEffect(()=>{
    if(['passage','questions','phonemic'].includes(stage) && activity){
      saveSession({ stage, settings, activity, gems, compScore, phonScore, title:activity.title });
    }
  },[stage, activity, gems, compScore, phonScore]);

  function patch(p){ setSettings(s=>({ ...s, ...p })); }

  async function startGenerate(useSettings){
    const cfg = useSettings || settings;
    const myId = ++genId.current;
    setResume(null); clearSession();
    setGems(0); setCompScore(0); setPhonScore(0);
    setStage('loading');
    let act;
    try { act = await generateActivity(cfg); }
    catch(e){ act = { ...FALLBACK, grade:cfg.grade, type:cfg.type, topic:cfg.topic, fromFallback:true }; }
    if(myId!==genId.current) return; // superseded
    setActivity(act);
    setStage('passage');
  }

  function resumeQuest(){
    const s = loadSession(); if(!s) return;
    setSettings(s.settings||DEFAULT_SETTINGS);
    setActivity(s.activity);
    setGems(s.gems||0); setCompScore(s.compScore||0); setPhonScore(s.phonScore||0);
    setResume(null);
    setStage(s.stage||'passage');
  }

  function goHome(){ clearSession(); setResume(null); setStage('welcome'); }
  function award(){ try{ playGem(); }catch(_){ } setGems(g=>Math.min(TOTAL_GEMS, g+1)); }

  // ---- student login / logout ----
  function signIn(s){
    setStudent(s);
    setActivity(null); setGems(0); setCompScore(0); setPhonScore(0);
    setResume(loadSession());      // that student's saved quest, if any
    setStage('welcome');
  }
  function logOut(){
    setActiveId('');
    setStudent(null);
    setActivity(null); setGems(0); setCompScore(0); setPhonScore(0);
    setResume(null);
    setStage('signin');
  }

  function openTherapist(){ if(gatePassed){ setPanelOpen(true); } else { setGateOpen(true); } }
  function regenerate(){ setPanelOpen(false); startGenerate(); }
  function doPrint(withKey){ setPrintKey(withKey); setPrintMenu(false); setTimeout(()=>{ try{ window.print(); }catch(e){} }, 150); }

  // ---- routing ----
  let screen;
  if(stage==='signin'){
    screen = <SignInScreen onSignIn={signIn} />;
  } else if(stage==='welcome'){
    screen = <WelcomeScreen onStart={()=>setStage('grade')} onOpenBook={()=>setStage('book')}
      resume={resume} onResume={resumeQuest} student={student} onSwitch={logOut} />;
  } else if(stage==='book'){
    screen = <StickerBook onClose={()=>setStage('welcome')} onStart={()=>setStage('grade')} />;
  } else if(stage==='grade'){
    screen = <GradeScreen value={settings.grade} onPick={g=>patch({ grade:g })}
      onBack={()=>setStage('welcome')} onNext={()=>setStage('type')} />;
  } else if(stage==='type'){
    screen = <TypeScreen value={settings.type} onPick={t=>patch({ type:t })}
      onBack={()=>setStage('grade')} onNext={()=>setStage('topic')} />;
  } else if(stage==='topic'){
    screen = <TopicScreen value={settings.topic} onPick={t=>patch({ topic:t })}
      onBack={()=>setStage('type')} onNext={()=>startGenerate()} />;
  } else if(stage==='loading'){
    screen = <LoadingScreen grade={settings.grade} type={settings.type} topic={settings.topic} />;
  } else if(stage==='passage'){
    screen = <PassageScreen activity={activity} gems={gems} totalGems={TOTAL_GEMS}
      showKey={settings.showKey} onHome={goHome} onContinue={()=>setStage('questions')}
      onPrint={()=>setPrintMenu(true)} />;
  } else if(stage==='questions'){
    screen = <QuestionsScreen activity={activity} showKey={settings.showKey} gems={gems} totalGems={TOTAL_GEMS}
      onAward={award} onHome={goHome}
      onComplete={(sc)=>{ setCompScore(sc); setStage('phonemic'); }} />;
  } else if(stage==='phonemic'){
    screen = <PhonemicScreen activity={activity} showKey={settings.showKey} gems={gems} totalGems={TOTAL_GEMS}
      onAward={award} onHome={goHome}
      onComplete={(sc)=>{ setPhonScore(sc); clearSession(); setStage('score'); }} />;
  } else if(stage==='score'){
    screen = <ScoreScreen activity={activity} gems={gems} totalGems={TOTAL_GEMS} compScore={compScore} phonDone={phonScore}
      onReplaySame={()=>startGenerate()} onNewTopic={()=>setStage('topic')} onNewGrade={()=>setStage('grade')}
      onHome={goHome} onPrint={()=>setPrintMenu(true)} onOpenBook={()=>setStage('book')} />;
  }

  return (
    <React.Fragment>
      <div className="no-print">
        {screen}
        <AppWatermark />
        {stage!=='signin' && <TherapistButton onClick={openTherapist} />}
        {stage!=='signin' && <SoundToggle />}
        {gateOpen && <Gate onClose={()=>setGateOpen(false)} onPass={()=>{ setGateOpen(false); setGatePassed(true); setPanelOpen(true); }} />}
        {panelOpen && (
          <TherapistPanel settings={settings} activity={activity}
            onChange={patch} onRegenerate={regenerate} onClose={()=>setPanelOpen(false)}
            onPrint={()=>{ setPanelOpen(false); setPrintMenu(true); }} />
        )}
        {printMenu && <PrintMenu onPrint={doPrint} onClose={()=>setPrintMenu(false)} />}
      </div>
      <div className="print-area" id="print-area">
        {activity && <Worksheet activity={activity} includeKey={printKey} />}
      </div>
    </React.Fragment>
  );
}

// soft brand watermark shown in the corner of every app screen (not printed)
function AppWatermark(){
  return (
    <img className="no-print" src="assets/slp-logo.png" alt="" aria-hidden="true"
      style={{ position:'fixed', left:16, bottom:16, zIndex:40, width:74, height:74,
        borderRadius:'50%', opacity:0.16, pointerEvents:'none',
        filter:'drop-shadow(0 4px 10px rgba(0,0,0,.35))' }} />
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
