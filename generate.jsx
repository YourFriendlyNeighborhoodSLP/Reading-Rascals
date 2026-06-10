// ====== ACTIVITY GENERATION (fully offline — runs in the browser) ======
// Stories, comprehension questions, and phonemic tasks are built entirely on the
// device by the offline engine in storygen.jsx + the content packs in
// story-fiction.jsx / story-nonfiction.jsx. A brand-new, grade- and topic-matched
// activity is produced on every press. No server or AI connection is required,
// so it works the same on GitHub Pages as it does anywhere else.

// Decides the mix of multiple-choice vs. open-response questions by grade + mode.
function questionPlan(grade, mode){
  const band = gradeBand(grade);
  if(mode==='mc')   return ['mc','mc','mc','mc','mc'];
  if(mode==='open') return ['open','open','open','open','open'];
  // auto: more open-ended responses as the grade goes up
  if(band==='early') return ['mc','mc','mc','mc','mc'];
  if(band==='mid')   return ['mc','mc','mc','mc','open'];
  return ['mc','mc','mc','open','open'];
}

// Master generate: returns a full activity object. Always succeeds offline;
// only drops to the static FALLBACK if something is truly misconfigured.
async function generateActivity({ grade, type, topic, questionMode, phonSource }){
  try {
    if(typeof offlineGenerateActivity === 'function'){
      return offlineGenerateActivity({ grade, type, topic, questionMode, phonSource });
    }
  } catch(e){ console.warn('offline generation failed', e); }
  return { ...FALLBACK, grade, type, topic, fromFallback:true };
}

Object.assign(window, { generateActivity, questionPlan });
