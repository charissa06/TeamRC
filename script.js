/* app.js */
/* DoodleLearning: quiz logic, questions, UI interactions, sounds, seasonal background */

/* -------------------------
   Utilities & DOM refs
   ------------------------- */
const timerEl = document.getElementById('timer');
const $ = sel => document.querySelector(sel);
const nameInput = $('#nameInput');
const ageInput = $('#ageInput');
const gradeSelect = $('#gradeSelect');
const subjectSelect = $('#subjectSelect');
const levelSelect = $('#levelSelect');
const startBtn = $('#startBtn');
const mainMenu = $('#mainMenu');
const quizView = $('#quizView');
const resultView = $('#resultView');
const questionText = $('#questionText');
const answersEl = $('#answers');
const currentIndexEl = $('#currentIndex');
const scoreEl = $('#score');
const progressFill = $('#progressFill');
const playerNameEl = $('#playerName');
const playerGradeEl = $('#playerGrade');
const playerSubjectEl = $('#playerSubject');
const skipBtn = $('#skipBtn');
const quitBtn = $('#quitBtn');
const retryBtn = $('#retryBtn');
const menuBtn = $('#menuBtn');
const finalScoreEl = $('#finalScore');
const resultMessageEl = $('#resultMessage');
const emojiFloat = $('#emojiFloat');
const seasonSelect = $('#seasonSelect');
const seasonalWrap = $('#seasonal');
const themePink = $('#themePink');
const themeBlue = $('#themeBlue');

/* -------------------------
   App state
   ------------------------- */
let state = {
  name: 'Anak',
  age: 8,
  grade: 1,
  subject: 'math',
  level: 'easy',
  questions: [],
  current: 0,
  score: 0,
  totalQuestions: 10,
  perQuestion: 10,
  wrongPenalty: 5
};

/* -------------------------
   Sound (WebAudio simple tones)
   ------------------------- */
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
function playTone(type='correct'){
  const o = audioCtx.createOscillator();
  const g = audioCtx.createGain();
  o.type = 'sine';
  if(type === 'correct'){
    o.frequency.value = 880;
    g.gain.value = 0.02;
  } else {
    o.frequency.value = 200;
    g.gain.value = 0.02;
  }
  o.connect(g); g.connect(audioCtx.destination);
  o.start();
  setTimeout(()=>{ o.stop(); }, 200);
}

/* -------------------------
   Emoji feedback animation
   ------------------------- */
function showEmoji(emoji){
  emojiFloat.textContent = emoji;
  emojiFloat.style.transform = 'translateY(0)';
  emojiFloat.style.opacity = '1';
  setTimeout(()=> {
    emojiFloat.style.transform = 'translateY(-80px)';
    emojiFloat.style.opacity = '0';
  }, 50);
}

function showFloatingEmoji(emoji) {
  showEmoji(emoji); // pakai animasi emoji yang sudah ada
}


/* -------------------------
   Seasonal background generator (emoji)
   ------------------------- */
function clearSeasonal(){ seasonalWrap.innerHTML = ''; seasonalWrap.className='seasonal' }
function createSeasonal(season='auto'){
  clearSeasonal();
  const s = (season==='auto') ?
    ['spring','summer','autumn','winter'][Math.floor(Math.random()*4)] :
    season;

  seasonalWrap.classList.add('season-'+s);

  const n = 14;
  for(let i=0;i<n;i++){
    const el = document.createElement('div');
    const left = Math.random() * 100;
    const delay = Math.random() * 6;
    const dur = 6 + Math.random()*8;

  if(s==='autumn'){
      el.className = 'leaf';
      el.textContent = '🍁';
    } else if(s==='winter'){
      el.className = 'flake';
      el.textContent = '❄️';
    } else if(s==='spring'){
      el.className = 'petal';
      el.textContent = '🌸';
    } else {
      el.className = 'sunray';
      el.textContent = '🌻';
    }

    el.style.left = left + 'vw';
    el.style.top = (-10 - Math.random()*20) + 'vh';
    el.style.fontSize = (18 + Math.random()*34) + 'px';
    el.style.opacity = 0.9;
    el.style.animation = `fall ${dur}s linear ${delay}s infinite`;
    seasonalWrap.appendChild(el);
  }
}

/* -------------------------
   Question banks & generators
   ------------------------- */
function randInt(min,max){ return Math.floor(Math.random()*(max-min+1))+min; }
function shuffle(arr){ for(let i=arr.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [arr[i],arr[j]]=[arr[j],arr[i]] } return arr }

/* Math question generators */

function genMathForGrade(grade, level) {
  const qs = [];

  function make(q, a, fn) {
    const opts = new Set([String(a)]);
    while (opts.size < 4) opts.add(String(fn(a)));
    return { q, a: String(a), opts: shuffle([...opts]) };
  }

  // ===============================
  // KELAS 1–2 (materi dasar)
  // ===============================
  if (grade === 1 || grade === 2) {
    const range = level === "easy" ? 10 : level === "medium" ? 20 : 30;

    for (let i = 0; i < 30; i++) {
      let a = randInt(1, range);
      let b = randInt(1, range);

      if (level === "easy") {
        const q = `${a} + ${b} = ?`;
        qs.push(make(q, a + b, (x) => x + randInt(-5, 5)));
      } else if (level === "medium") {
        const q = `${a} - ${b} = ?`;
        qs.push(make(q, a - b, (x) => x + randInt(-5, 5)));
      } else {
        const q = `${a} + ${b} × 2 = ?`;
        qs.push(make(q, a + b * 2, (x) => x + randInt(-10, 10)));
      }
    }
    return shuffle(qs);
  }

  // ===============================
  // KELAS 3–4 (perkalian, pembagian dasar)
  // ===============================
  if (grade === 3 || grade === 4) {
    for (let i = 0; i < 30; i++) {
      const type = randInt(1, 4);

      if (type === 1) {
        let a = randInt(2, 10);
        let b = randInt(2, 10);
        const q = `${a} × ${b} = ?`;
        qs.push(make(q, a * b, (x) => x + randInt(-8, 8)));
      } else if (type === 2) {
        let a = randInt(2, 10);
        let b = randInt(2, 10);
        const prod = a * b;
        const q = `${prod} ÷ ${b} = ?`;
        qs.push(make(q, a, (x) => x + randInt(-4, 4)));
      } else if (type === 3) {
        const a = randInt(10, 99);
        const b = randInt(10, 99);
        const q = `${a} + ${b} = ?`;
        qs.push(make(q, a + b, (x) => x + randInt(-20, 20)));
      } else {
        const a = randInt(10, 99);
        const b = randInt(1, 50);
        const q = `${a} - ${b} = ?`;
        qs.push(make(q, a - b, (x) => x + randInt(-20, 20)));
      }
    }
    return shuffle(qs);
  }

  // ===============================
  // KELAS 5–6 (logika, pola, operasi campuran)
  // ===============================
  if (grade === 5 || grade === 6) {
    for (let i = 0; i < 40; i++) {
      const type = randInt(1, 6);

      if (type === 1) {
        const a = randInt(10, 50);
        const b = randInt(5, 25);
        qs.push(make(`${a} × ${b} = ?`, a * b, (x) => x + randInt(-60, 60)));
      }
      else if (type === 2) {
        const a = randInt(2, 12);
        qs.push(make(`${a}² = ?`, a * a, (x) => x + randInt(-10, 10)));
      }
      else if (type === 3) {
        const sq = randInt(4, 20);
        qs.push(make(`√${sq * sq} = ?`, sq, (x) => x + randInt(-6, 6)));
      }
      else if (type === 4) {
        const a = randInt(10, 50);
        const b = randInt(2, 12);
        const c = randInt(1, 10);
        const val = a + b * c;
        qs.push(make(`${a} + ${b} × ${c} = ?`, val, (x) => x + randInt(-30, 30)));
      }
      else if (type === 5) {
        const base = randInt(3, 9);
        const next = base + 3;
        qs.push(make(`Pola bilangan: ${base}, ${base + 3}, ?`, next + 3, (x) => x + randInt(-6, 6)));
      }
      else {
        const a = randInt(50, 150);
        const b = randInt(1, 25);
        qs.push(make(`${a} ÷ ${b} = ?`, Math.floor(a / b), (x) => x + randInt(-15, 15)));
      }
    }
    return shuffle(qs);
  }

  return shuffle(qs);
}


const englishPool = {

  /* ————————————————
     Tingkat Mudah (kosakata dasar)
     ———————————————— */
  vocab_easy: [
    ["apple", "apel"],
    ["dog", "anjing"],
    ["cat", "kucing"],
    ["milk", "susu"],
    ["book", "buku"],
    ["blue", "biru"],
    ["happy", "senang"],
    ["drink", "minum"],
    ["big", "besar"],
    ["small", "kecil"],
    ["school", "sekolah"],
    ["chair", "kursi"],
  ],


  /* ————————————————
     Tingkat Sedang (kalimat pendek)
     ———————————————— */
  vocab_medium: [
    ["I am reading a book", "Saya sedang membaca sebuah buku"],
    ["She has a red bag", "Dia memiliki tas merah"],
    ["We play in the yard", "Kami bermain di halaman"],
    ["They drink water", "Mereka minum air"],
    ["The cat is sleeping", "Kucing itu sedang tidur"],
    ["Close the door, please", "Tolong tutup pintunya"],
    ["This is my brother", "Ini adalah saudara laki-laki saya"],
    ["I like sweet food", "Saya suka makanan manis"]
  ],


  /* ————————————————
     Tingkat Sulit (Reading Comprehension)
     dengan penjelasan kalimat yang jelas
     ———————————————— */
  sentence_hard: [
    [
      "Sarah wakes up early every morning and helps her mother prepare breakfast. After that, she walks to school with her friends.",
      "Apa yang dilakukan Sarah setelah bangun pagi?",
      [
        "Membantu ibunya menyiapkan sarapan",
        "Pergi tidur lagi",
        "Mencuci pakaian",
        "Menonton TV"
      ]
    ],
    
    [
      "Tom likes science. He enjoys learning about planets, stars, and the moon. His favorite planet is Jupiter.",
      "Apa pelajaran yang disukai Tom?",
      [
        "Sains",
        "Matematika",
        "Musik",
        "Sejarah"
      ]
    ],

    [
      "Lisa has a small garden behind her house. She grows tomatoes, carrots, and lettuce. Every afternoon, she waters her plants.",
      "Apa yang dilakukan Lisa setiap sore?",
      [
        "Menyiram tanaman",
        "Memasak makan malam",
        "Membeli sayur di pasar",
        "Membersihkan rumah"
      ]
    ],

    [
      "The school library is very quiet. Students can read books or study there. The librarian always helps children find the books they need.",
      "Apa yang dilakukan pustakawan di perpustakaan?",
      [
        "Membantu anak-anak mencari buku",
        "Mengajar matematika",
        "Membersihkan kelas",
        "Menjual makanan"
      ]
    ],

    [
      "David practices playing the piano every day. He wants to become a great musician when he grows up.",
      "Apa cita-cita David?",
      [
        "Menjadi musisi hebat",
        "Menjadi dokter",
        "Menjadi polisi",
        "Menjadi pilot"
      ]
    ]
  ]
};


function genEnglishForGrade(grade, level) {
  const qs = [];
  const easy = englishPool.vocab_easy;
  const medium = englishPool.vocab_medium;
  const hard = englishPool.sentence_hard;

  function mcq(q, a, poolFn) {
    const opts = new Set([a]);
    while (opts.size < 4) opts.add(poolFn());
    return { q, a, opts: shuffle([...opts]) };
  }

  // ===============================
  // KELAS 1–2 (kata dasar)
  // ===============================
  if (grade === 1 || grade === 2) {
    for (let i = 0; i < 30; i++) {
      const item = easy[randInt(0, easy.length - 1)];

      if (Math.random() < 0.5) {
        qs.push(mcq(`Pilih arti kata "${item[0]}"`, item[1], () => easy[randInt(0, easy.length - 1)][1]));
      } else {
        qs.push(mcq(`Which word means "${item[1]}"?`, item[0], () => easy[randInt(0, easy.length - 1)][0]));
      }
    }
    return shuffle(qs);
  }

  // ===============================
  // KELAS 3–4 (kata + kalimat pendek)
  // ===============================
  if (grade === 3 || grade === 4) {
    const pool = easy.concat(medium);

    for (let i = 0; i < 30; i++) {
      const item = pool[randInt(0, pool.length - 1)];

      if (item[0].includes(" ")) {
        qs.push(mcq(`Translate: "${item[0]}"`, item[1], () => medium[randInt(0, medium.length - 1)][1]));
      } else {
        qs.push(mcq(`Arti dari "${item[0]}" adalah…`, item[1], () => easy[randInt(0, easy.length - 1)][1]));
      }
    }
    return shuffle(qs);
  }

  // ===============================
  // KELAS 5–6 (reading + logika bahasa)
  // ===============================
  if (grade === 5 || grade === 6) {
    const pool = hard.concat(medium);

    for (let i = 0; i < 40; i++) {
      const item = pool[randInt(0, pool.length - 1)];

      if (typeof item[2] !== "undefined") {
        qs.push(mcq(item[1], item[2][0], () => item[2][randInt(0, item[2].length - 1)]));
      } else {
        qs.push(mcq(`Translate: "${item[0]}"`, item[1], () => medium[randInt(0, medium.length - 1)][1]));
      }
    }
    return shuffle(qs);
  }

  return shuffle(qs);
}


function buildQuestions({ grade, subject, level, total }) {
  let pool = subject === "math"
    ? genMathForGrade(grade, level)
    : genEnglishForGrade(grade, level);

  const used = new Set();
  const final = [];

  for (const q of pool) {
    if (!used.has(q.q)) {
      final.push(q);
      used.add(q.q);
      if (final.length >= total) break;
    }
  }

  return shuffle(final);
}


/* -----------------------------------------------------
   EMOJI OTOMATIS UNTUK SOAL & JAWABAN
   ----------------------------------------------------- */

function getEmojiForQuestion(text) {
  text = text.toLowerCase();

  // Matematika
  if (text.includes('+') || text.includes('-') || text.includes('×') || text.includes('÷')) {
    return '🔢';
  }
  if (text.includes('akar') || text.includes('√')) return '🧮';
  if (text.includes('kali') || text.includes('perkalian')) return '✖️';
  if (text.includes('bagi') || text.includes('pembagian')) return '➗';

  // Bahasa Inggris – klasifikasi sederhana
  if (text.includes('pilih arti') || text.includes('means') || text.includes('translate')) {
    return '📚';
  }
  if (text.includes('choose') || text.includes('cocok')) return '📝';

  // Default
  return '❓';
}


function getEmojiForAnswer(answerText) {
  const t = answerText.toLowerCase();

  const map = {
    "apple": "🍎",
    "apel": "🍎",

    "dog": "🐶",
    "anjing": "🐶",

    "cat": "🐱",
    "kucing": "🐱",

    "milk": "🥛",
    "susu": "🥛",

    "book": "📘",
    "buku": "📘",

    "chair": "🪑",
    "kursi": "🪑",

    "blue": "🔵",
    "biru": "🔵",

    "happy": "😊",
    "senang": "😊",

    "drink": "🥤",
    "minum": "🥤",

    "school": "🏫",
    "sekolah": "🏫",
  };

  // Jika ada emoji spesifik
  if (map[t]) return map[t];

  // Jika numerik → pakai emoji angka
  if (!isNaN(Number(t))) return '🔢';

  // Default
  return '✨';
}


let timerInterval = null;
let timeLeft = 35;

function startTimer() {
  clearInterval(timerInterval);
  timeLeft = 35;
  timerEl.textContent = timeLeft;

  timerInterval = setInterval(() => {
    timeLeft--;
    timerEl.textContent = timeLeft;

    if (timeLeft <= 0) {
      clearInterval(timerInterval);
      handleTimeout();
    }
  }, 1000);
}

function handleTimeout() {
  // waktu habis → pindah soal tanpa skor
  showFloatingEmoji("⏳");
  nextQuestion();
}

function nextQuestion() {
  state.current++;
  if (state.current >= state.totalQuestions) {
    finishQuiz();
  } else {
    renderQuestion();
  }
}



/* -------------------------
   UI rendering & logic
   ------------------------- */

function renderQuestion(){
  const idx = state.current;
  const qObj = state.questions[idx];
  if(!qObj) return;

  currentIndexEl.textContent = (idx+1);
  scoreEl.textContent = state.score;
  progressFill.style.width = `${((idx)/state.totalQuestions)*100}%`;

 const qEmoji = getEmojiForQuestion(qObj.q);
questionText.innerHTML = `
  <span class="question-emoji">${qEmoji}</span>
  <span>${qObj.q}</span>
`;

  answersEl.innerHTML = '';

 qObj.opts.slice(0, 4).forEach(opt => {
    const b = document.createElement('button');

    // Emoji otomatis sesuai isi jawaban
    const emoji = getEmojiForAnswer(opt);

    b.textContent = `${emoji}  ${opt}`;

    b.addEventListener('click', () => handleAnswer(opt, b));

    answersEl.appendChild(b);
});




  playerNameEl.textContent = state.name || 'Anak';
  playerGradeEl.textContent = `Kelas ${state.grade}`;
  playerSubjectEl.textContent = state.subject === 'math' ? 'Matematika' : 'Bahasa Inggris';

startTimer();

}


function handleAnswer(selected, btn){
  const currentQ = state.questions[state.current];
  const correct = String(currentQ.a);

  Array.from(answersEl.children).forEach(b => b.disabled = true);

  if(String(selected) === correct){
    state.score = Math.min(100, state.score + state.perQuestion);
    btn.style.background = 'linear-gradient(90deg,#b9ffcf,#8effc2)';
    playTone('correct');
    showEmoji('🎉');
    btn.animate([{transform:'scale(1)'},{transform:'scale(1.03)'},{transform:'scale(1)'}],{duration:350});
  } else {
    state.score = Math.max(0, state.score - state.wrongPenalty);
    btn.style.background = 'linear-gradient(90deg,#ffd6d6,#ffbdbd)';
    playTone('wrong');
    showEmoji('💥');
    Array.from(answersEl.children).forEach(b=>{
      if(String(b.textContent) === correct){
        b.style.outline = `3px solid rgba(0,200,120,0.12)`;
      }
    });
  }

  setTimeout(()=>{
    state.current++;
    if(state.current >= state.totalQuestions){
      finishQuiz();
    } else {
      renderQuestion();
    }
  }, 700);
}

skipBtn.addEventListener('click', ()=>{
  state.current++;
  if(state.current >= state.totalQuestions) finishQuiz();
  else renderQuestion();
});

quitBtn.addEventListener('click', ()=>{
  if(confirm('Kembali ke menu? Skor saat ini akan hilang.')) showMenu();
});

startBtn.addEventListener('click', ()=>{
  state.name = nameInput.value.trim() || 'Anak';
  state.age = parseInt(ageInput.value) || 8;
  state.grade = parseInt(gradeSelect.value);
  state.subject = subjectSelect.value;
  state.level = levelSelect.value;

  state.score = 0;
  state.current = 0;
  state.totalQuestions = 10;
  state.perQuestion = 10;
  state.wrongPenalty = 5;

  state.questions = buildQuestions({
    grade:state.grade,
    subject:state.subject,
    level:state.level,
    total: state.totalQuestions
  });

  state.questions = state.questions.map(q=>{
    const opts = q.opts && q.opts.length===4 ? q.opts : makeDistractorsFor(q);
    return {q:q.q, a:q.a, opts:shuffle(opts)};
  });

  mainMenu.classList.add('hidden');
  quizView.classList.remove('hidden');
  resultView.classList.add('hidden');
  renderQuestion();
});

function makeDistractorsFor(q){
  const base = String(q.a);
  const out = new Set([base]);
  while(out.size<4){
    if(!isNaN(Number(base))){
      const v = Number(base) + randInt(-7,7);
      out.add(String(Math.max(0,v)));
    } else {
      const r = englishPool.vocab_easy[randInt(0,englishPool.vocab_easy.length-1)][0];
      out.add(r);
    }
  }
  return Array.from(out);
}

function finishQuiz(){
  quizView.classList.add('hidden');
  resultView.classList.remove('hidden');
  finalScoreEl.textContent = `${state.score} / ${state.perQuestion * state.totalQuestions}`;

  const pct = Math.round((state.score / (state.perQuestion * state.totalQuestions)) * 100);
  let msg = '';
  if(pct >= 85) msg = 'Hebat! Kalian pintar! 🎉';
  else if(pct >= 60) msg = 'Bagus! Coba lagi untuk dapat skor lebih tinggi 😊';
  else msg = 'Semangat, latihan lagi ya! 💪';

  resultMessageEl.textContent = `${msg} (Skor ${pct}%)`;
}

function showMenu(){
  mainMenu.classList.remove('hidden');
  quizView.classList.add('hidden');
  resultView.classList.add('hidden');
}

retryBtn.addEventListener('click', ()=>{
  state.score = 0;
  state.current = 0;
  state.questions = buildQuestions({
    grade:state.grade,
    subject:state.subject,
    level:state.level,
    total: state.totalQuestions
  });
  state.questions = state.questions.map(q=> ({q:q.q, a:q.a, opts: shuffle(q.opts || makeDistractorsFor(q))}));

  resultView.classList.add('hidden');
  quizView.classList.remove('hidden');
  renderQuestion();
});

menuBtn.addEventListener('click', showMenu);

/* -----------------------------------------------------
   SEASON & THEME CONTROLS
   ----------------------------------------------------- */
seasonSelect.addEventListener('change', ()=>{
  createSeasonal(seasonSelect.value);
});

function applySeasonBG(season) {
  document.body.classList.remove(
    'season-spring',
    'season-summer',
    'season-autumn',
    'season-winter'
  );
  document.body.classList.add(`season-${season}`);
}


seasonSelect.addEventListener("change", () => {
  applySeasonBG(seasonSelect.value);
});


themePink.addEventListener('click', ()=> document.body.className='theme-pink');
themeBlue.addEventListener('click', ()=> document.body.className='theme-blue');

/* -------------------------
   On load
   ------------------------- */
(function init(){
  document.body.className = 'theme-pink';
  createSeasonal('auto');

  /* ⬅️ TAMBAHAN: background awal otomatis */
  const randomSeason = ['spring','summer','autumn','winter'][Math.floor(Math.random()*4)];
  applySeasonBG(randomSeason);
})();


function renderQuestionEmoji(questionText) {
  const questionBox = document.querySelector('.question-text');
  const emoji = getEmojiForQuestion(questionText);

  questionBox.innerHTML = `
    <span class="question-emoji">${emoji}</span>
    <span>${questionText}</span>
  `;
}

