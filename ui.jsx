// ====== SHARED UI ======

// Big chunky button with 3D press
function BigButton({ children, onClick, color='pink', size='md', disabled, style={}, icon }){
  const [press, setPress] = useState(false);
  const palette = {
    pink:   { bg:'var(--pink)', sh:'var(--pink-deep)', fg:'#fff' },
    purple: { bg:'var(--purple)', sh:'var(--purple-deep)', fg:'#fff' },
    gold:   { bg:'var(--gold)', sh:'var(--gold-deep)', fg:'#5b3d00' },
    mint:   { bg:'var(--mint)', sh:'var(--ok-deep)', fg:'#fff' },
    white:  { bg:'#fff', sh:'#E2D5FF', fg:'var(--purple-deep)' },
  }[color];
  const pads = { sm:'12px 20px', md:'16px 30px', lg:'20px 42px' }[size];
  const fs = { sm:17, md:21, lg:26 }[size];
  return (
    <button
      onMouseDown={()=>setPress(true)} onMouseUp={()=>setPress(false)}
      onMouseLeave={()=>setPress(false)}
      onClick={disabled?undefined:(e)=>{ try{ playClick(); }catch(_){ } onClick && onClick(e); }}
      disabled={disabled}
      style={{
        background:palette.bg, color:palette.fg, fontSize:fs, fontWeight:600,
        padding:pads, borderRadius:'999px',
        boxShadow:`0 ${press?2:8}px 0 0 ${palette.sh}`,
        transform:`translateY(${press?6:0}px)`,
        transition:'transform .06s, box-shadow .06s, filter .15s',
        opacity:disabled?0.5:1, display:'inline-flex', alignItems:'center', gap:10,
        filter: disabled?'grayscale(.3)':'none', whiteSpace:'nowrap', ...style,
      }}>
      {icon && <span style={{ fontSize:fs*1.05 }}>{icon}</span>}
      {children}
    </button>
  );
}

// Selectable tile (grade / story type / topic)
function ChoiceTile({ emoji, label, blurb, selected, onClick, color='purple', big }){
  const [hover, setHover] = useState(false);
  const accent = color==='pink' ? 'var(--pink)' : 'var(--purple)';
  return (
    <button
      onMouseEnter={()=>setHover(true)} onMouseLeave={()=>setHover(false)}
      onClick={(e)=>{ try{ playClick(); }catch(_){ } onClick && onClick(e); }}
      style={{
        background:'#fff',
        border:`4px solid ${selected?accent:'#EFE7FF'}`,
        borderRadius:'var(--r-md)',
        padding: big? '26px 18px' : '18px 14px',
        display:'flex', flexDirection:'column', alignItems:'center', gap:8,
        boxShadow: selected? `0 12px 26px -12px ${accent}` : 'var(--shadow-soft)',
        transform:`translateY(${hover||selected?-4:0}px) scale(${selected?1.02:1})`,
        transition:'transform .14s, border-color .14s, box-shadow .14s',
        cursor:'pointer', position:'relative', width:'100%',
      }}>
      {selected && (
        <span style={{ position:'absolute', top:-12, right:-10, background:accent, color:'#fff',
          width:30, height:30, borderRadius:'50%', display:'grid', placeItems:'center',
          fontSize:16, boxShadow:'0 4px 10px rgba(0,0,0,.18)', animation:'pop-in .25s ease' }}>✓</span>
      )}
      <span style={{ fontSize: big?56:40, lineHeight:1, filter:'drop-shadow(0 4px 6px rgba(0,0,0,.12))' }}>{emoji}</span>
      <span className="display" style={{ fontSize: big?24:19, color:'var(--purple-ink)', fontWeight:600, textAlign:'center' }}>{label}</span>
      {blurb && <span style={{ fontSize:14, color:'var(--ink-soft)', textAlign:'center', lineHeight:1.25 }}>{blurb}</span>}
    </button>
  );
}

// Step header with progress dots & back
function StepBar({ stepIndex, totalSteps, onBack, labels }){
  return (
    <div style={{ display:'flex', alignItems:'center', gap:14, marginBottom:18 }}>
      {onBack && (
        <button onClick={onBack} style={{
          background:'#fff', color:'var(--purple)', width:48, height:48, borderRadius:'50%',
          boxShadow:'var(--shadow-soft)', fontSize:22, flexShrink:0,
          display:'grid', placeItems:'center' }} aria-label="Back">←</button>
      )}
      <div style={{ display:'flex', gap:8, flex:1, flexWrap:'wrap' }}>
        {Array.from({length:totalSteps}).map((_,i)=>(
          <div key={i} style={{
            height:10, flex:1, minWidth:18, borderRadius:99,
            background: i<=stepIndex ? 'var(--pink)' : '#E4D7FF',
            transition:'background .3s' }} />
        ))}
      </div>
    </div>
  );
}

// Card shell for screens
function Panel({ children, style={}, pad=28 }){
  return (
    <div style={{
      background:'#fff', borderRadius:'var(--r-lg)', padding:pad,
      boxShadow:'var(--shadow-card)', position:'relative', ...style }}>
      {children}
    </div>
  );
}

// speech bubble next to owl
function SpeechBubble({ children, style={} }){
  return (
    <div style={{ position:'relative', background:'#fff', borderRadius:22, padding:'14px 20px',
      boxShadow:'var(--shadow-soft)', fontFamily:'var(--font-display)', color:'var(--purple-ink)',
      fontSize:19, maxWidth:340, ...style }}>
      {children}
      <span style={{ position:'absolute', left:-12, top:'50%', transform:'translateY(-50%)',
        width:0, height:0, borderTop:'10px solid transparent', borderBottom:'10px solid transparent',
        borderRight:'14px solid #fff' }} />
    </div>
  );
}

// Reading gems progress (collect gems along a path)
function GemPath({ total, earned }){
  return (
    <div style={{ display:'flex', alignItems:'center', gap:6, flexWrap:'wrap' }}>
      {Array.from({length:total}).map((_,i)=>{
        const got = i<earned;
        return (
          <div key={i} style={{ display:'flex', alignItems:'center', gap:6 }}>
            <span style={{
              fontSize:22, filter: got?'none':'grayscale(1)', opacity: got?1:0.35,
              transform: got?'scale(1)':'scale(.85)', transition:'all .3s',
              animation: got?'star-pop .4s ease':'none' }}>💎</span>
          </div>
        );
      })}
    </div>
  );
}

// Confetti burst
function Confetti({ run }){
  const ref = useRef(null);
  useEffect(()=>{
    if(!run || !ref.current) return;
    const wrap = ref.current;
    const cols = ['#FF5BA0','#7C5CFC','#FFC23D','#5AD6B0','#54C7F2','#FF9BC9'];
    for(let i=0;i<70;i++){
      const p=document.createElement('div');
      const sz=8+Math.random()*10;
      p.style.cssText=`position:absolute;top:-20px;left:${Math.random()*100}%;
        width:${sz}px;height:${sz*0.6}px;background:${cols[i%cols.length]};
        border-radius:2px;opacity:0;transform:rotate(${Math.random()*360}deg);
        animation:confetti-fall ${1.8+Math.random()*1.6}s ${Math.random()*0.6}s ease-in forwards;`;
      wrap.appendChild(p);
    }
    const t=setTimeout(()=>{ if(wrap) wrap.innerHTML=''; }, 4200);
    return ()=>clearTimeout(t);
  },[run]);
  return <div ref={ref} style={{ position:'fixed', inset:0, pointerEvents:'none', zIndex:90, overflow:'hidden' }} />;
}

// page container that centers content
function Stage({ children, maxWidth=760 }){
  return (
    <div style={{ position:'relative', zIndex:1, minHeight:'100vh', display:'flex',
      justifyContent:'center', padding:'28px 20px 60px' }}>
      <div style={{ width:'100%', maxWidth, animation:'rise .4s ease both' }}>
        {children}
      </div>
    </div>
  );
}

// Loading dots
function LoadingDots(){
  return (
    <div style={{ display:'flex', gap:8 }}>
      {[0,1,2].map(i=>(
        <span key={i} style={{ width:14, height:14, borderRadius:'50%', background:'var(--pink)',
          animation:`float-y 0.7s ease-in-out ${i*0.15}s infinite` }} />
      ))}
    </div>
  );
}

Object.assign(window, {
  BigButton, ChoiceTile, StepBar, Panel, SpeechBubble, GemPath, Confetti, Stage, LoadingDots,
});
