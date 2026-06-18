// ====== OFFLINE STORY ENGINE ======
// Generates a brand-new passage + comprehension + phonemic set every call,
// entirely in the browser (no server / no AI API needed). Output is scaled to
// the grade band and matched to the chosen topic + genre. Questions are derived
// from the generated text so their answers are always correct.

// ---------- small helpers ----------
function rnd(n){ return Math.floor(Math.random()*n); }
function choice(arr){ return arr[rnd(arr.length)]; }
function cap(s){ return s ? s.charAt(0).toUpperCase()+s.slice(1) : s; }
// pick k distinct items from arr
function sample(arr, k){
  const pool = arr.slice(); const out = [];
  while(out.length<k && pool.length){ out.push(pool.splice(rnd(pool.length),1)[0]); }
  return out;
}
// shuffle a copy
function shuffled(arr){ const a=arr.slice(); for(let i=a.length-1;i>0;i--){ const j=rnd(i+1); [a[i],a[j]]=[a[j],a[i]]; } return a; }

// ---------- no-repeat picker ("shuffle bag") ----------
// Guarantees every item in a pool gets used once before any item repeats, and
// avoids picking the same item twice back-to-back even across a reshuffle.
// This is what stops "regenerate" from handing back the same hero, setting,
// or — most importantly — the same story episode/subject right after it was
// just used. State lives for the page session (resets on reload).
const SG_BAGS = {};
function pickNoRepeat(bagKey, arr){
  if(!arr || arr.length===0) return undefined;
  if(arr.length===1) return arr[0];
  let bag = SG_BAGS[bagKey];
  if(!bag){ bag = SG_BAGS[bagKey] = { queue:[], lastIdx:null }; }
  if(bag.queue.length===0){
    let order = shuffled(arr.map((_,i)=>i));
    // don't let the very next pick equal the one we just served
    if(bag.lastIdx!=null && order[0]===bag.lastIdx){
      const swapWith = 1 + rnd(order.length-1);
      [order[0], order[swapWith]] = [order[swapWith], order[0]];
    }
    bag.queue = order;
  }
  const idx = bag.queue.shift();
  bag.lastIdx = idx;
  return arr[idx];
}
// distinct distractors that differ from `correct`
function distractorsFrom(pool, correct, k){
  const seen = new Set([String(correct).toLowerCase()]);
  const out = [];
  for(const x of shuffled(pool)){
    const key = String(x).toLowerCase();
    if(seen.has(key)) continue;
    seen.add(key); out.push(x);
    if(out.length>=k) break;
  }
  return out;
}
// build an MC question object with the correct answer shuffled among distractors
function mcQuestion(type, q, correct, distractors, cue){
  const opts = shuffled([correct, ...distractors.slice(0,3)]);
  return { type, kind:'mc', q, choices:opts, answer:opts.indexOf(correct), cue };
}
function openQuestion(type, q, model, cue){
  return { type, kind:'open', q, answer:model, cue };
}

// ---------- shared pools ----------
const SG_FEELINGS = ['proud','happy','excited','joyful','cheerful','grateful','brave','glad'];
const SG_TRAITS   = ['brave','curious','kind','clever','cheerful','gentle','bold','friendly'];
const SG_OPENERS  = ['One day','One sunny morning','One bright day','Early one morning','One afternoon'];
const SG_PROBLEM_CONN = ['But','The trouble was','But soon','One problem was'];
const SG_HELP_CONN    = ['Then','Soon','Just then','Luckily','After a while'];
const SG_WRONG_MAIN = [
  'A child who loses a favorite toy at the park',
  'A robot who learns how to dance',
  'A cook who burns the birthday soup',
  'A team that misses the school bus',
  'A cat who is scared of a tiny mouse',
  'A wizard who forgets a magic word',
];
const SG_WRONG_THEME = [
  'Everyone should eat more vegetables at dinner.',
  'The best color in the whole world is blue.',
  'Soccer is much harder to play than baseball.',
  'Computers were invented a very long time ago.',
  'Rainy days are always better than sunny days.',
  'Music sounds best when it is played very loud.',
];

// =====================================================================
// PASSAGE BUILDERS
// =====================================================================

// ---- FICTION ----
function buildFiction(grade, topicId){
  const band = gradeBand(grade);
  const pack = (window.FICTION_PACKS||{})[topicId] || (window.FICTION_PACKS||{}).animals;
  const hero    = pickNoRepeat('hero:'+topicId, pack.heroes);
  const trait   = pickNoRepeat('trait', SG_TRAITS);
  const setting = pickNoRepeat('setting:'+topicId, pack.settings);
  const ep      = pickNoRepeat('episode:'+topicId, pack.episodes);
  const feeling = ep.feeling || choice(SG_FEELINGS);
  const Name = hero.name;

  const fill = (s)=> String(s).replace(/\[NAME\]/g, Name).replace(/\[KIND\]/g, hero.kind);

  // core beats as full sentences
  const sIntro = `${Name} was a ${trait} ${hero.kind} who lived ${setting.prose}.`;
  const sWant  = `${Name} ${fill(ep.want)}.`;
  const sTrig  = `${choice(SG_OPENERS)}, ${Name} ${fill(ep.trigger)}.`;
  const sProb  = `${choice(SG_PROBLEM_CONN)} ${fill(ep.problem)}.`;
  const sHelp  = `${choice(SG_HELP_CONN)} ${fill(ep.help)}.`;
  const sSolve = `${Name} ${fill(ep.solution)}, and felt very ${feeling}.`;
  const sDetail = ep.detail ? cap(fill(ep.detail)) : '';
  const sExtra  = ep.extra  ? cap(fill(ep.extra))  : '';
  const sClose  = `From that day on, ${Name} knew that ${fill(ep.lesson)}.`;
  const sVocab  = ep.vocab ? cap(fill(ep.vocab.sentence)) : '';

  let paragraphs;
  if(band==='early'){
    paragraphs = [[sIntro, sWant, sTrig, sProb, sHelp, sSolve].join(' ')];
  } else if(band==='mid'){
    paragraphs = [
      [sIntro, sWant, sDetail].filter(Boolean).join(' '),
      [sTrig, sProb, sHelp, sSolve, sClose].join(' '),
    ];
  } else {
    paragraphs = [
      [sIntro, sWant, sDetail].filter(Boolean).join(' '),
      [sTrig, sProb].join(' '),
      [sHelp, sSolve, sExtra].filter(Boolean).join(' '),
      [sVocab, sClose].filter(Boolean).join(' '),
    ];
  }

  const title = fill(pickNoRepeat('title:'+topicId+':'+(ep.titles||[])[0], ep.titles || [`${Name}'s Big Day`]));
  const meta = { genre:'fiction', band, hero, trait, setting, ep, feeling, vocab:(band==='upper'?ep.vocab:null) };
  return { title, paragraphs, meta };
}

function buildFictionComp(meta, plan){
  const { hero, setting, ep, feeling } = meta;
  const pool = window.HERO_POOL || [];
  const otherHeroes = distractorsFrom(pool.map(h=>`${h.name} the ${h.kind}`), `${hero.name} the ${hero.kind}`, 3);
  const otherSettings = distractorsFrom((window.SETTING_LABELS||[]), setting.label, 3);
  const otherFeelings = distractorsFrom(SG_FEELINGS, feeling, 3);
  const fill = (s)=> String(s).replace(/\[NAME\]/g, hero.name).replace(/\[KIND\]/g, hero.kind);

  const slots = [
    { t:'who',
      q:'Who is the main character in the story?',
      correct:`${hero.name} the ${hero.kind}`, distractors:otherHeroes,
      open:`The main character is ${hero.name} the ${hero.kind}.`,
      cue:'Go back and find who the story is about.' },
    { t:'detail',
      q:'Where does the story take place?',
      correct:setting.label, distractors:otherSettings,
      open:`The story takes place ${setting.prose}.`,
      cue:'What sentence tells you where they are?' },
    { t:'main',
      q:'What is this story mostly about?',
      correct:`A ${hero.kind} who ${fill(ep.mainIdea)}`, distractors:sample(SG_WRONG_MAIN,3),
      open:`It is mostly about a ${hero.kind} who ${fill(ep.mainIdea)}.`,
      cue:'What was the most important part?' },
    { t:'inference',
      q:`How did ${hero.name} feel at the end of the story?`,
      correct:feeling, distractors:otherFeelings,
      open:`${hero.name} felt ${feeling} at the end.`,
      cue:'Think about what happened — how would that feel?' },
    { t:'why',
      q:fill(ep.why.q),
      correct:fill(ep.why.a), distractors:(ep.why.distractors||[]).map(fill),
      open:fill(ep.why.a),
      cue:'Find the part that shows why.' },
  ];
  return slots.map((s,i)=> plan[i]==='open'
    ? openQuestion(s.t, s.q, s.open, s.cue)
    : mcQuestion(s.t, s.q, s.correct, s.distractors, s.cue));
}

// ---- NON-FICTION ----
function buildNonfiction(grade, topicId){
  const band = gradeBand(grade);
  const pack = (window.NONFICTION_PACKS||{})[topicId] || (window.NONFICTION_PACKS||{}).animals;
  const subj = pickNoRepeat('subject:'+topicId, pack.subjects);
  const nFacts = band==='early' ? 4 : band==='mid' ? 5 : 6;

  // always include questionable facts first so comprehension has material
  const qFacts = subj.facts.filter(f=>f.q);
  const plain  = subj.facts.filter(f=>!f.q);
  const usedQ  = sample(qFacts, Math.min(qFacts.length, Math.max(2, nFacts-2)));
  const fillN  = Math.max(0, nFacts - usedQ.length);
  const usedPlain = sample(plain.length?plain:qFacts, fillN);
  const used = shuffled([...usedQ, ...usedPlain]).slice(0,nFacts);

  const intro = `${subj.intro}`;
  const factText = used.map(f=>f.text).join(' ');
  let paragraphs;
  if(band==='early'){
    paragraphs = [[intro, factText].join(' ')];
  } else if(band==='mid'){
    const half = Math.ceil(used.length/2);
    paragraphs = [
      [intro, ...used.slice(0,half).map(f=>f.text)].join(' '),
      used.slice(half).map(f=>f.text).join(' '),
    ];
  } else {
    const third = Math.ceil(used.length/3);
    paragraphs = [
      [intro, ...used.slice(0,third).map(f=>f.text)].join(' '),
      used.slice(third, third*2).map(f=>f.text).join(' '),
      used.slice(third*2).map(f=>f.text).join(' '),
    ];
    if(subj.closer) paragraphs.push(subj.closer);
  }

  const title = pickNoRepeat('title:'+topicId+':'+(subj.titles||[subj.label])[0], subj.titles || [subj.label]);
  const meta = { genre:'nonfiction', band, subj, usedQ:usedQ.filter(f=>f.q) };
  return { title, paragraphs, meta };
}

function buildNonfictionComp(meta, plan){
  const { subj, usedQ } = meta;
  const siblingLabels = distractorsFrom((window.SUBJECT_LABELS||[]), subj.label, 3);
  const detailFact = usedQ.length ? choice(usedQ) : (subj.facts.filter(f=>f.q)[0]);
  const slots = [
    { t:'who',
      q:'What is this passage mostly about?',
      correct:subj.label, distractors:siblingLabels,
      open:`It is mostly about ${subj.label.toLowerCase()}.`,
      cue:'Look at the title and the first sentence.' },
    { t:'detail',
      q:detailFact.q, correct:detailFact.a, distractors:detailFact.distractors,
      open:detailFact.a,
      cue:'Go back and find that exact fact in the passage.' },
    { t:'main',
      q:'Which sentence tells the BIG idea of the passage?',
      correct:subj.theme, distractors:sample(SG_WRONG_THEME,3),
      open:subj.theme,
      cue:'What is the one idea all the facts support?' },
    { t:'inference',
      q:subj.inference.q, correct:subj.inference.a, distractors:subj.inference.distractors,
      open:subj.inference.a,
      cue:'Use the facts to figure out something not said directly.' },
    { t:'vocab',
      q:`In this passage, what does the word "${subj.vocab.word}" mean?`,
      correct:subj.vocab.meaning, distractors:subj.vocab.distractors,
      open:`"${subj.vocab.word}" means ${subj.vocab.meaning}.`,
      cue:`Find "${subj.vocab.word}" in the passage and read around it.` },
  ];
  return slots.map((s,i)=> plan[i]==='open'
    ? openQuestion(s.t, s.q, s.open, s.cue)
    : mcQuestion(s.t, s.q, s.correct, s.distractors, s.cue));
}

// =====================================================================
// PHONEMIC AWARENESS (real-word transformations, scaled by band)
// =====================================================================
const PHONEME_BANK = {
  substitution: [
    { word:'cat', prompt:'Say <b>cat</b>. Change /k/ to /b/. What word?', answer:'bat', band:'early' },
    { word:'sun', prompt:'Say <b>sun</b>. Change /s/ to /f/. What word?', answer:'fun', band:'early' },
    { word:'map', prompt:'Say <b>map</b>. Change /m/ to /n/. What word?', answer:'nap', band:'early' },
    { word:'pig', prompt:'Say <b>pig</b>. Change /p/ to /d/. What word?', answer:'dig', band:'early' },
    { word:'dog', prompt:'Say <b>dog</b>. Change /d/ to /l/. What word?', answer:'log', band:'early' },
    { word:'top', prompt:'Say <b>top</b>. Change /t/ to /m/. What word?', answer:'mop', band:'early' },
    { word:'can', prompt:'Say <b>can</b>. Change /k/ to /v/. What word?', answer:'van', band:'early' },
    { word:'ten', prompt:'Say <b>ten</b>. Change /t/ to /h/. What word?', answer:'hen', band:'early' },
    { word:'fish', prompt:'Say <b>fish</b>. Change /f/ to /d/. What word?', answer:'dish', band:'mid' },
    { word:'ship', prompt:'Say <b>ship</b>. Change /sh/ to /ch/. What word?', answer:'chip', band:'mid' },
    { word:'chair', prompt:'Say <b>chair</b>. Change /ch/ to /h/. What word?', answer:'hair', band:'mid' },
    { word:'train', prompt:'Say <b>train</b>. Change /t/ to /b/. What word?', answer:'brain', band:'upper' },
    { word:'stick', prompt:'Say <b>stick</b>. Change /st/ to /th/. What word?', answer:'thick', band:'upper' },
  ],
  deletion: [
    { word:'stop', prompt:'Say <b>stop</b>. Now say it without /s/.', answer:'top', band:'early' },
    { word:'snap', prompt:'Say <b>snap</b>. Now say it without /s/.', answer:'nap', band:'early' },
    { word:'slip', prompt:'Say <b>slip</b>. Now say it without /s/.', answer:'lip', band:'early' },
    { word:'spot', prompt:'Say <b>spot</b>. Now say it without /s/.', answer:'pot', band:'early' },
    { word:'play', prompt:'Say <b>play</b>. Now say it without /p/.', answer:'lay', band:'mid' },
    { word:'clap', prompt:'Say <b>clap</b>. Now say it without /k/.', answer:'lap', band:'mid' },
    { word:'train', prompt:'Say <b>train</b>. Now say it without /t/.', answer:'rain', band:'mid' },
    { word:'black', prompt:'Say <b>black</b>. Now say it without /b/.', answer:'lack', band:'mid' },
    { word:'brush', prompt:'Say <b>brush</b>. Now say it without /b/.', answer:'rush', band:'upper' },
    { word:'swing', prompt:'Say <b>swing</b>. Now say it without /s/.', answer:'wing', band:'upper' },
    { word:'snail', prompt:'Say <b>snail</b>. Now say it without /s/.', answer:'nail', band:'upper' },
  ],
  addition: [
    { word:'top', prompt:'Say <b>top</b>. Add /s/ to the beginning. What word?', answer:'stop', band:'early' },
    { word:'pin', prompt:'Say <b>pin</b>. Add /s/ to the beginning. What word?', answer:'spin', band:'early' },
    { word:'lap', prompt:'Say <b>lap</b>. Add /k/ to the beginning. What word?', answer:'clap', band:'early' },
    { word:'nap', prompt:'Say <b>nap</b>. Add /s/ to the beginning. What word?', answer:'snap', band:'early' },
    { word:'and', prompt:'Say <b>and</b>. Add /h/ to the beginning. What word?', answer:'hand', band:'mid' },
    { word:'rain', prompt:'Say <b>rain</b>. Add /t/ to the beginning. What word?', answer:'train', band:'mid' },
    { word:'ring', prompt:'Say <b>ring</b>. Add /b/ to the beginning. What word?', answer:'bring', band:'mid' },
    { word:'art', prompt:'Say <b>art</b>. Add /p/ to the beginning. What word?', answer:'part', band:'mid' },
    { word:'ink', prompt:'Say <b>ink</b>. Add /p/ to the beginning. What word?', answer:'pink', band:'upper' },
    { word:'lip', prompt:'Say <b>lip</b>. Add /f/ to the beginning. What word?', answer:'flip', band:'upper' },
  ],
  blending: [
    { prompt:'Blend these sounds: /m/ /a/ /p/.', answer:'map', band:'early' },
    { prompt:'Blend these sounds: /c/ /a/ /t/.', answer:'cat', band:'early' },
    { prompt:'Blend these sounds: /s/ /u/ /n/.', answer:'sun', band:'early' },
    { prompt:'Blend these sounds: /d/ /o/ /g/.', answer:'dog', band:'early' },
    { prompt:'Blend these sounds: /f/ /i/ /sh/.', answer:'fish', band:'mid' },
    { prompt:'Blend these sounds: /sh/ /i/ /p/.', answer:'ship', band:'mid' },
    { prompt:'Blend these sounds: /f/ /r/ /o/ /g/.', answer:'frog', band:'mid' },
    { prompt:'Blend these sounds: /s/ /t/ /o/ /p/.', answer:'stop', band:'upper' },
    { prompt:'Blend these sounds: /s/ /n/ /a/ /k/.', answer:'snack', band:'upper' },
  ],
  manipulation: [
    { word:'cat', prompt:'Say <b>cat</b>. Change the /a/ to /u/. What word?', answer:'cut', band:'early' },
    { word:'pig', prompt:'Say <b>pig</b>. Change the /i/ to /e/. What word?', answer:'peg', band:'early' },
    { word:'top', prompt:'Say <b>top</b>. Change the /o/ to /a/. What word?', answer:'tap', band:'early' },
    { word:'bed', prompt:'Say <b>bed</b>. Change the /e/ to /a/. What word?', answer:'bad', band:'early' },
    { word:'bug', prompt:'Say <b>bug</b>. Change the /u/ to /i/. What word?', answer:'big', band:'mid' },
    { word:'hat', prompt:'Say <b>hat</b>. Change the /a/ to /o/. What word?', answer:'hot', band:'mid' },
    { word:'pen', prompt:'Say <b>pen</b>. Change the /e/ to /a/. What word?', answer:'pan', band:'mid' },
    { word:'ship', prompt:'Say <b>ship</b>. Change the /i/ to /o/. What word?', answer:'shop', band:'upper' },
    { word:'cap', prompt:'Say <b>cap</b>. Change the /a/ to /u/. What word?', answer:'cup', band:'upper' },
  ],
};
const PHON_NOTE = {
  substitution:'Cue: "What sound is at the front? Switch it."',
  deletion:'Cue: "Say it slowly, then leave off that sound."',
  addition:'Cue: "Put the new sound in front, then blend."',
  blending:'Cue: "Say the sounds faster until they join."',
  manipulation:'Cue: "Keep the other sounds — just change the middle."',
};
const BAND_ORDER = { early:['early'], mid:['early','mid'], upper:['mid','upper','early'] };

function buildPhonemic(passage, grade, source){
  const band = gradeBand(grade);
  const allowed = BAND_ORDER[band] || ['early'];
  const passageWords = new Set(passage.paragraphs.join(' ').toLowerCase().replace(/[^a-z\s]/g,'').split(/\s+/));
  const skills = ['substitution','deletion','addition','blending','manipulation'];

  return skills.map(skill=>{
    let items = PHONEME_BANK[skill].filter(it=> allowed.includes(it.band));
    if(!items.length) items = PHONEME_BANK[skill];
    // when therapist asks to draw from the passage, prefer items whose target word appears in it
    if(source==='passage'){
      const inPassage = items.filter(it=> it.word && passageWords.has(it.word.toLowerCase()));
      if(inPassage.length) items = inPassage;
    }
    const it = choice(items);
    return {
      skill,
      prompt: it.prompt,
      answer: it.answer,
      note: `Accept "${it.answer}". ${PHON_NOTE[skill]}`,
    };
  });
}

// =====================================================================
// MASTER (offline) — drop-in replacement for the old AI generateActivity
// =====================================================================
function offlineGenerateActivity({ grade, type, topic, questionMode, phonSource }){
  const isFic = type==='fiction';
  const built = isFic ? buildFiction(grade, topic) : buildNonfiction(grade, topic);
  const plan = questionPlan(grade, questionMode);
  const comprehension = isFic
    ? buildFictionComp(built.meta, plan)
    : buildNonfictionComp(built.meta, plan);
  const phonemic = buildPhonemic(built, grade, phonSource);
  return {
    title: built.title,
    paragraphs: built.paragraphs,
    comprehension,
    phonemic,
    grade, type, topic,
    fromFallback:false,
  };
}

Object.assign(window, { offlineGenerateActivity, buildFiction, buildNonfi

