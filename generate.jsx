// ====== AI GENERATION (passage, comprehension, phonemic) ======

// robustly pull JSON out of a model response
function parseJSON(text, fallback){
  if(!text) return fallback;
  try { return JSON.parse(text); } catch(e){}
  // strip code fences
  let t = text.replace(/```json/gi,'```').replace(/```/g,'').trim();
  try { return JSON.parse(t); } catch(e){}
  // find first { or [ ... matching last } or ]
  const firstObj = t.indexOf('{'), firstArr = t.indexOf('[');
  let start = -1, open='{', close='}';
  if(firstArr!==-1 && (firstArr<firstObj || firstObj===-1)){ start=firstArr; open='['; close=']'; }
  else if(firstObj!==-1){ start=firstObj; }
  if(start!==-1){
    const last = t.lastIndexOf(close);
    if(last>start){
      try { return JSON.parse(t.slice(start,last+1)); } catch(e){}
    }
  }
  return fallback;
}

const LENGTH_RULES = {
  early: '5 to 7 short, simple sentences in ONE single paragraph. Use very simple vocabulary a 5-6 year old knows. Include a clear beginning, middle, and end (fiction) or clear simple facts (non-fiction).',
  mid:   '2 to 3 short paragraphs. Use grade-appropriate vocabulary. Include concrete details that support comprehension questions.',
  upper: '3 to 4 paragraphs. Use richer vocabulary. Include a clear main idea, supporting details, an opportunity for inference, and at least one slightly advanced vocabulary word used in context.',
};

const TWISTS = [
  'a surprising helper appears','a small problem gets solved','someone learns something new',
  'a tiny discovery changes the day','two characters team up','a clever idea saves the day',
  'a fact most kids never knew','an unexpected place','a brave little choice','a happy ending with a twist',
];
function nonce(){ return Math.random().toString(36).slice(2,8); }

async function generatePassage(grade, type, topic){
  const band = gradeBand(grade);
  const isFic = type==='fiction';
  const twist = pick(TWISTS);
  const prompt = `You write delightful, age-appropriate reading passages for elementary speech & reading therapy.
Create a ${isFic?'FICTION story':'NON-FICTION informational passage'} for a ${gradeLabel(grade)} student about the topic "${topic}".
Length & level: ${LENGTH_RULES[band]}
Make it fresh and original — incorporate this idea so it feels new: "${twist}". (variation id ${nonce()})
Keep it warm, positive, and kid-friendly. Absolutely no scary, sad, or intense content.
Use words that contain good phonemic-awareness practice (one-syllable words, blends, digraphs) where natural.
Return ONLY valid JSON, no commentary:
{"title":"a short fun title (max 5 words)","paragraphs":["paragraph 1","paragraph 2"]}`;
  try {
    const out = await window.claude.complete({ messages:[{ role:'user', content:prompt }] });
    const data = parseJSON(out, null);
    if(data && Array.isArray(data.paragraphs) && data.paragraphs.length){
      return { title:String(data.title||'Reading Quest'), paragraphs:data.paragraphs.map(String) };
    }
  } catch(e){ console.warn('passage gen failed', e); }
  return null; // signal fallback
}

function questionPlan(grade, mode){
  // returns array of kinds for the 5 questions
  const band = gradeBand(grade);
  if(mode==='mc') return ['mc','mc','mc','mc','mc'];
  if(mode==='open') return ['open','open','open','open','open'];
  // auto
  if(band==='early') return ['mc','mc','mc','mc','mc'];
  if(band==='mid')   return ['mc','mc','mc','mc','open'];
  return ['mc','mc','mc','open','open'];
}

async function generateComprehension(passage, grade, mode){
  const text = passage.paragraphs.join('\n\n');
  const plan = questionPlan(grade, mode);
  const prompt = `Here is a reading passage for a ${gradeLabel(grade)} student:
TITLE: ${passage.title}
${text}

Write EXACTLY 5 comprehension questions about THIS passage, in this order and type:
1. who/what/where question
2. a specific detail question
3. main idea question
4. an inference question (answer not stated directly)
5. a vocabulary-in-context OR "why/how" question

Question formats to use, in order: ${plan.map((k,i)=>`Q${i+1}=${k==='mc'?'multiple choice':'short open response'}`).join(', ')}.
For multiple choice: give 4 short answer options; exactly one correct; "answer" is the 0-based index of the correct option.
For open response: "answer" is a brief model/example answer (one sentence). No choices.
Each question also gets a short "cue" — a gentle hint that points the student back to the passage.
Return ONLY valid JSON, an array of 5 objects:
[{"type":"who","kind":"mc","q":"...","choices":["..","..","..",".."],"answer":0,"cue":".."},
 {"type":"detail","kind":"open","q":"...","answer":"model answer","cue":".."}]`;
  try {
    const out = await window.claude.complete({ messages:[{ role:'user', content:prompt }] });
    const data = parseJSON(out, null);
    if(Array.isArray(data) && data.length>=4){
      return data.slice(0,5).map((q,i)=>({
        type:q.type||['who','detail','main','inference','why'][i],
        kind: q.kind==='open'?'open':'mc',
        q:String(q.q||q.question||'Question'),
        choices: Array.isArray(q.choices)?q.choices.map(String):undefined,
        answer: q.answer,
        cue:String(q.cue||pick(COMP_CUES)),
      }));
    }
  } catch(e){ console.warn('comp gen failed', e); }
  return null;
}

async function generatePhonemic(passage, grade, source){
  const band = gradeBand(grade);
  const text = passage.paragraphs.join(' ');
  const levelNote = band==='early'
    ? 'Use simple CVC or one-syllable REAL words (cat, map, sun, top).'
    : band==='mid'
    ? 'Use one-syllable real words including blends and digraphs (stop, fish, ship, frog).'
    : 'Use blends, digraphs, and some multisyllabic / morphology-connected real words.';
  const srcNote = source==='passage'
    ? 'Use words that appear in (or are closely related to) the passage whenever possible.'
    : 'You may use any developmentally appropriate real words; passage words are a bonus.';
  const prompt = `Create 5 phonemic awareness tasks for a ${gradeLabel(grade)} student.
Passage (for word ideas): ${text}
${srcNote}
${levelNote}
Use these 5 skills IN THIS ORDER (one each):
1. sound substitution (e.g. "Say cat. Change /k/ to /b/." -> bat)
2. sound deletion (e.g. "Say smile. Now say it without /s/." -> mile)
3. sound addition (e.g. "Say top. Add /s/ to the beginning." -> stop)
4. sound blending OR segmenting (e.g. "Blend /m/ /a/ /p/." -> map)
5. sound manipulation (e.g. "Say slip. Change /l/ to /t/." )

CRITICAL RULES:
- Refer to SOUNDS using slash marks like /m/, /s/, /sh/ — NEVER letter names.
- Strongly prefer REAL words for the answer. Only use a nonsense word if unavoidable.
- "answer" is the resulting word (or for segmenting, the sounds like "/f/ /i/ /sh/").
- "note" = therapist note: acceptable response(s) + one cueing idea.
- In "prompt", wrap the target word in <b>...</b> tags.
Return ONLY valid JSON, an array of 5 objects:
[{"skill":"substitution","prompt":"Say <b>cat</b>. Change /k/ to /b/. What word?","answer":"bat","note":"Accept 'bat'. Cue: 'What sound is first?'"}]`;
  try {
    const out = await window.claude.complete({ messages:[{ role:'user', content:prompt }] });
    const data = parseJSON(out, null);
    if(Array.isArray(data) && data.length>=4){
      const skills=['substitution','deletion','addition','blending','manipulation'];
      return data.slice(0,5).map((t,i)=>({
        skill: t.skill || skills[i],
        prompt:String(t.prompt||'Say the word.'),
        answer:String(t.answer||''),
        note:String(t.note||'Cue: say the word slowly and tap the sounds.'),
      }));
    }
  } catch(e){ console.warn('phon gen failed', e); }
  return null;
}

// Master generate: returns full activity object, falling back gracefully
async function generateActivity({ grade, type, topic, questionMode, phonSource }){
  const passage = await generatePassage(grade, type, topic);
  if(!passage){
    // total fallback
    return { ...FALLBACK, grade, type, topic, fromFallback:true };
  }
  const [comp, phon] = await Promise.all([
    generateComprehension(passage, grade, questionMode),
    generatePhonemic(passage, grade, phonSource),
  ]);
  return {
    title: passage.title,
    paragraphs: passage.paragraphs,
    comprehension: comp || FALLBACK.comprehension,
    phonemic: phon || FALLBACK.phonemic,
    grade, type, topic,
    fromFallback: !comp || !phon,
  };
}

Object.assign(window, { generateActivity, generatePassage });
