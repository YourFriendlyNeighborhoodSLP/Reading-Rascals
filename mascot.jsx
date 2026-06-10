// ====== MASCOT: "Remy" the reading raccoon — official badge artwork ======
const { useState, useEffect, useRef } = React;

const REMY_SRC = 'assets/remy.png';

// Renders Remy. Keeps the original API (size / mood / style) so every caller
// keeps working — `mood` now nudges a small idle behaviour instead of redrawing.
function Owl({ size = 180, mood = 'happy', style = {} }) {
  const cheer = mood === 'cheer';
  const reading = mood === 'reading';
  const wave = mood === 'wave';

  return (
    <div
      aria-label="Remy the raccoon"
      style={{
        position: 'relative',
        width: size,
        height: size,
        display: 'inline-block',
        transformOrigin: '50% 92%',
        animation: wave ? 'remy-waggle 1.6s ease-in-out infinite' : 'none',
        ...style,
      }}>
      <img
        src={REMY_SRC}
        alt="Remy the raccoon"
        draggable={false}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          borderRadius: '50%',
          display: 'block',
          userSelect: 'none',
          boxShadow: '0 10px 28px rgba(60,42,110,0.28)',
          animation: cheer ? 'remy-cheer 1.1s ease-in-out infinite' : 'none',
        }} />

      {/* a little book peeking in when Remy is reading */}
      {reading &&
        <svg
          width={size * 0.42}
          height={size * 0.42}
          viewBox="0 0 80 60"
          style={{ position: 'absolute', right: -size * 0.08, bottom: -size * 0.04,
                   filter: 'drop-shadow(0 6px 10px rgba(60,42,110,0.3))', animation: 'float-y 2s ease-in-out infinite' }}>
          <rect x="4" y="8" width="72" height="44" rx="6" fill="#FF5BA0" />
          <rect x="6" y="6" width="34" height="44" rx="5" fill="#fff" />
          <rect x="40" y="6" width="34" height="44" rx="5" fill="#FFF3FA" />
          <line x1="40" y1="6" x2="40" y2="50" stroke="#FF5BA0" strokeWidth="3" />
          <line x1="13" y1="18" x2="33" y2="18" stroke="#FFC8E4" strokeWidth="3" strokeLinecap="round" />
          <line x1="13" y1="27" x2="33" y2="27" stroke="#FFC8E4" strokeWidth="3" strokeLinecap="round" />
          <line x1="47" y1="18" x2="67" y2="18" stroke="#FFC8E4" strokeWidth="3" strokeLinecap="round" />
          <line x1="47" y1="27" x2="67" y2="27" stroke="#FFC8E4" strokeWidth="3" strokeLinecap="round" />
        </svg>
      }

      {/* waving paw */}
      {wave &&
        <span style={{ position: 'absolute', right: -size * 0.04, top: size * 0.02, fontSize: size * 0.30,
                       transformOrigin: '70% 90%', animation: 'remy-wave 0.8s ease-in-out infinite',
                       filter: 'drop-shadow(0 4px 8px rgba(60,42,110,0.35))' }}>👋</span>
      }

      {/* sparkles when cheering */}
      {cheer && <>
        <span style={{ position: 'absolute', top: -size * 0.02, right: size * 0.04, fontSize: size * 0.16,
                       animation: 'float-y 1.6s ease-in-out infinite' }}>✨</span>
        <span style={{ position: 'absolute', bottom: size * 0.02, left: -size * 0.02, fontSize: size * 0.12,
                       animation: 'float-y 2.1s ease-in-out infinite' }}>⭐</span>
      </>}
    </div>);
}

// floating wrapper
function FloatingOwl(props) {
  return (
    <div style={{ animation: 'bob 3.4s ease-in-out infinite', display: 'inline-block' }}>
      <Owl {...props} />
    </div>);
}

Object.assign(window, { Owl, FloatingOwl });
