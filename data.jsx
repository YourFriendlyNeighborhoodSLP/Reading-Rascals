// ====== DATA: grades, topics, fallback content, helper text ======

const GRADES = [
  { id:'K',  label:'Kindergarten', short:'K',   emoji:'🌱', band:'early' },
  { id:'1',  label:'1st Grade',    short:'1',   emoji:'⭐', band:'early' },
  { id:'2',  label:'2nd Grade',    short:'2',   emoji:'🐣', band:'mid' },
  { id:'3',  label:'3rd Grade',    short:'3',   emoji:'🚀', band:'mid' },
  { id:'4',  label:'4th Grade',    short:'4',   emoji:'🌟', band:'upper' },
  { id:'5',  label:'5th Grade',    short:'5',   emoji:'🏆', band:'upper' },
  { id:'6',  label:'6th Grade',    short:'6',   emoji:'🔭', band:'upper' },
  { id:'7',  label:'7th Grade',    short:'7',   emoji:'⚡', band:'upper' },
  { id:'8',  label:'8th Grade',    short:'8',   emoji:'🎓', band:'upper' },
];

const STORY_TYPES = [
  { id:'fiction',     label:'Fiction',     emoji:'🐉', blurb:'Made-up stories & adventures' },
  { id:'nonfiction',  label:'Non-fiction', emoji:'🔎', blurb:'Real facts about the world' },
];

const TOPICS = [
  { id:'animals',           label:'Animals',           emoji:'🦊' },
  { id:'space',             label:'Space',             emoji:'🚀' },
  { id:'ocean',             label:'Ocean',             emoji:'🐙' },
  { id:'weather',           label:'Weather',           emoji:'⛅' },
  { id:'friendship',        label:'Friendship',        emoji:'🤝' },
  { id:'sports',            label:'Sports',            emoji:'⚽' },
  { id:'dinosaurs',         label:'Dinosaurs',         emoji:'🦕' },
  { id:'community helpers', label:'Community Helpers', emoji:'🚒' },
  { id:'camping',           label:'Camping',           emoji:'⛺' },
  { id:'insects',           label:'Insects',           emoji:'🐝' },
  { id:'holidays',          label:'Holidays',          emoji:'🎉' },
  { id:'food',              label:'Food',              emoji:'🍎' },
  { id:'transportation',    label:'Transportation',    emoji:'🚂' },
  { id:'seasons',           label:'Seasons',           emoji:'🍂' },
  { id:'plants',            label:'Plants',            emoji:'🌻' },
  { id:'mysteries',         label:'Mysteries',         emoji:'🔍' },
  { id:'school adventures', label:'School Adventures', emoji:'🎒' },
];

// band helpers based on grade id
function gradeBand(gradeId){
  if(gradeId==='K' || gradeId==='1') return 'early';
  if(gradeId==='2' || gradeId==='3') return 'mid';
  return 'upper';
}
function gradeLabel(gradeId){
  const g = GRADES.find(x=>x.id===gradeId); return g ? g.label : gradeId;
}

// Feedback phrases (from spec)
const FEEDBACK = {
  correct: ['Nice thinking!', 'Great evidence!', 'You got it!', 'Super reading!'],
  retry:   ['Look back in the passage.', 'Try again.', 'Almost — peek at the story.'],
  open:    ['Tell how you know.', 'Nice thinking!', 'Great evidence!'],
};
function pick(arr){ return arr[Math.floor(Math.random()*arr.length)]; }

// Comprehension cueing prompts (from spec)
const COMP_CUES = [
  'Go back and find the part that helped you.',
  'What sentence gave you a clue?',
  'Tell me how you know.',
  'What was the most important part?',
  'What happened first, next, and last?',
];

// Phonemic cueing prompts (from spec)
const PHON_CUES = [
  'Say the word slowly.',
  'Tap the sounds.',
  'What sound did you hear first?',
  'What sound changed?',
  'Say it without that sound.',
  'Now blend it back together.',
];

const SKILL_LABELS = {
  substitution:'Sound Substitution',
  deletion:'Sound Deletion',
  addition:'Sound Addition',
  blending:'Blend the Sounds',
  segmenting:'Tell the Sounds',
  manipulation:'Sound Switch',
};
const SKILL_EMOJI = {
  substitution:'🔄', deletion:'✂️', addition:'➕', blending:'🔗', segmenting:'🎯', manipulation:'🪄',
};

// ---- Offline fallback content (used if AI is unavailable) ----
// A small but complete sample so the game always works.
const FALLBACK = {
  title:'The Brave Little Fox',
  paragraphs:[
    "Finn was a small red fox who lived near a big green hill. Every morning he liked to run in the tall grass and sniff the cool air.",
    "One day, Finn heard a soft cry. A baby bird had fallen from its nest. Finn was kind, so he gently helped the bird hop back to a safe branch.",
    "The bird's mother sang a happy song. From that day on, Finn and the birds were the best of friends on the green hill.",
  ],
  comprehension:[
    { type:'who', q:'Who is the main character in the story?', kind:'mc',
      choices:['Finn the fox','A big bear','A school teacher','A baby shark'], answer:0,
      cue:'Go back and find the part that tells who runs in the grass.' },
    { type:'detail', q:'Where did Finn like to run each morning?', kind:'mc',
      choices:['In the tall grass','In the city','At the beach','In a cave'], answer:0,
      cue:'What sentence tells where Finn runs?' },
    { type:'main', q:'What is this story mostly about?', kind:'mc',
      choices:['A kind fox who helps a bird','A fox who likes to sleep','A bird who builds a nest','A hill made of candy'], answer:0,
      cue:'What was the most important part?' },
    { type:'inference', q:'How do you think the bird felt after Finn helped?', kind:'mc',
      choices:['Safe and happy','Angry','Sleepy','Hungry'], answer:0,
      cue:'Tell me how you know.' },
    { type:'why', q:'Why were Finn and the birds friends?', kind:'mc',
      choices:['Because Finn was kind and helped','Because Finn was fast','Because the hill was green','Because it was raining'], answer:0,
      cue:'What part shows Finn being kind?' },
  ],
  phonemic:[
    { skill:'substitution', prompt:'Say <b>fox</b>. Change /f/ to /b/. What word?', answer:'box',
      note:'Accept "box." Cue: "What sound is at the front? Switch it to /b/."' },
    { skill:'deletion', prompt:'Say <b>hill</b>. Now say it without /h/.', answer:'ill',
      note:'Accept "ill." Cue: "Say it slowly, then leave off the first sound."' },
    { skill:'addition', prompt:'Say <b>top</b>. Add /s/ to the beginning.', answer:'stop',
      note:'Accept "stop." Cue: "Put /s/ in front, then blend."' },
    { skill:'blending', prompt:'Blend these sounds: /b/ /ɪ/ /r/ /d/.', answer:'bird',
      note:'Accept "bird." Cue: "Say them faster until they join."' },
    { skill:'segmenting', prompt:'Tell the sounds in <b>grass</b>.', answer:'/g/ /r/ /a/ /s/',
      note:'Accept /g/ /r/ /a/ /s/. Cue: "Tap one finger for each sound."' },
  ],
};

Object.assign(window, {
  GRADES, STORY_TYPES, TOPICS, gradeBand, gradeLabel,
  FEEDBACK, pick, COMP_CUES, PHON_CUES, SKILL_LABELS, SKILL_EMOJI, FALLBACK,
});
