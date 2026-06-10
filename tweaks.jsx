// ====== TWEAKS: recolor the whole app from "Your Friendly Neighborhood SLP" logo ======
// Palettes are sampled from the brand logo: deep royal purple, navy ink,
// vibrant magenta/pink, and gold. Each control writes CSS custom properties on
// :root, which every screen already consumes — so changes ripple everywhere.

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "theme": "Classic",
  "purple": ["#7C5CFC", "#5B33D6", "#3C2A6E"],
  "pink": ["#FF5BA0", "#F0388A", "#FFD6EC", "#FFE9F4"],
  "gold": ["#FFC23D", "#F1A21B"],
  "bg": ["#1C1046", "#C42E96", "#7A3AE6", "#3A2270"]
}/*EDITMODE-END*/;

// ---- option sets (all drawn from the logo) ----
const PURPLES = [
  ["#7C5CFC", "#5B33D6", "#3C2A6E"], // royal (logo books)
  ["#6B3FD4", "#4A1E8C", "#2A1A5E"], // deep grape (logo background)
  ["#9B7BFF", "#6F4FE6", "#473270"]  // soft violet
];
const PINKS = [
  ["#FF5BA0", "#F0388A", "#FFD6EC", "#FFE9F4"], // magenta (logo script)
  ["#FF4FB0", "#E5379A", "#FFD3EC", "#FFE7F5"], // hot bubblegum
  ["#FF6F86", "#F0426B", "#FFD9DF", "#FFEAEF"]  // coral
];
const GOLDS = [
  ["#FFC23D", "#F1A21B"], // gold (logo accents)
  ["#FFA83D", "#F5821B"], // sunset orange
  ["#FFD24D", "#F2B521"]  // honey
];
const BGS = [
  ["#1C1046", "#C42E96", "#7A3AE6", "#3A2270"], // cosmic purple (default, from mascot)
  ["#241048", "#D6457A", "#9A3AE6", "#46226E"], // berry nebula
  ["#141033", "#B83A93", "#5E3CC9", "#2A2160"], // deep space
  ["#101A38", "#3E7FC9", "#6E3CC9", "#26285E"]  // blue galaxy
];

// coordinated presets — one tap sets every group at once
const PRESETS = {
  Classic: { purple: PURPLES[0], pink: PINKS[0], gold: GOLDS[0], bg: BGS[0] },
  Magenta: { purple: PURPLES[2], pink: PINKS[1], gold: GOLDS[2], bg: BGS[1] },
  Grape:   { purple: PURPLES[1], pink: PINKS[2], gold: GOLDS[1], bg: BGS[2] }
};

function applyTheme(t) {
  const r = document.documentElement.style;
  const set = (k, v) => v && r.setProperty(k, v);
  const [p, pd, pi] = t.purple || [];
  set('--purple', p); set('--purple-deep', pd); set('--purple-ink', pi);
  const [pk, pkd, pks, pks2] = t.pink || [];
  set('--pink', pk); set('--pink-deep', pkd);
  set('--pink-soft', pks); set('--pink-soft-2', pks2);
  const [g, gd] = t.gold || [];
  set('--gold', g); set('--gold-deep', gd);
  const [base, g1, g2, g3] = t.bg || [];
  set('--bg-base', base); set('--bg-glow-1', g1);
  set('--bg-glow-2', g2); set('--bg-glow-3', g3);
}

function TweaksApp() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);

  // apply on mount + whenever any color group changes (persists with panel closed)
  React.useEffect(() => { applyTheme(t); },
    [t.purple, t.pink, t.gold, t.bg]);

  const pickPreset = (name) => {
    const p = PRESETS[name];
    if (!p) return;
    setTweak({ theme: name, ...p });
  };

  return (
    <TweaksPanel title="Tweaks">
      <TweakSection label="Brand theme" />
      <TweakRadio label="Preset" value={t.theme}
        options={['Classic', 'Magenta', 'Grape']}
        onChange={pickPreset} />

      <TweakSection label="Fine-tune (from your logo)" />
      <TweakColor label="Purple" value={t.purple} options={PURPLES}
        onChange={(v) => setTweak('purple', v)} />
      <TweakColor label="Pink" value={t.pink} options={PINKS}
        onChange={(v) => setTweak('pink', v)} />
      <TweakColor label="Gold" value={t.gold} options={GOLDS}
        onChange={(v) => setTweak('gold', v)} />

      <TweakSection label="Background" />
      <TweakColor label="Cosmos" value={t.bg} options={BGS}
        onChange={(v) => setTweak('bg', v)} />
    </TweaksPanel>
  );
}

ReactDOM.createRoot(document.getElementById('tweaks-root')).render(<TweaksApp />);
