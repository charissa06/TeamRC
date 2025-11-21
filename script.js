// ======================
// PART A — LOGIKA UTAMA KUIS (letakkan di bagian atas file)
// ======================

// Pastikan bagian B + C (englishQuestions) diletakkan setelah bagian ini.
document.addEventListener('DOMContentLoaded', () => {

  /* =========================
     BACKSOUND MUSIK
     ========================= */
  const bgMusic = document.getElementById('bgMusic');
  const musicToggle = document.getElementById('musicToggle');
  let musicOn = true;

  if (bgMusic) bgMusic.volume = 0.3;

  window.addEventListener('load', () => {
    if (!bgMusic) return;
    bgMusic.play().catch(() => {
      console.log("Autoplay diblokir. User harus tekan tombol untuk play.");
    });
  });

  if (musicToggle) {
    musicToggle.addEventListener('click', () => {
      musicOn = !musicOn;
      if (!bgMusic) return;
      if (musicOn) {
        bgMusic.play();
        musicToggle.textContent = "🔊 Musik: ON";
      } else {
        bgMusic.pause();
        musicToggle.textContent = "🔇 Musik: OFF";
      }
    });
  }

  /* =========================
     ELEMENT REFERENCES (DOM)
  */
  const seasonSelect = document.getElementById('seasonSelect');
  const seasonalContainer = document.getElementById('seasonal');
  const backgroundLayer = document.getElementById('backgroundLayer');

  const mainMenu = document.getElementById('mainMenu');
  const quizView = document.getElementById('quizView');
  const resultView = document.getElementById('resultView');
  const questionText = document.getElementById('questionText');
  const answersEl = document.getElementById('answers');
  const scoreEl = document.getElementById('score');
  const timerEl = document.getElementById('timer');
  const progressFill = document.getElementById('progressFill');
  const playerNameDisplay = document.getElementById('playerNameDisplay');
  const subjectDisplay = document.getElementById('subjectDisplay');
  const currentQuestionNum = document.getElementById('currentQuestionNum');
  const totalQuestionsNum = document.getElementById('totalQuestionsNum');
  const finalScoreEl = document.getElementById('finalScore');
  const resultMessageEl = document.getElementById('resultMessage');

  const startBtn = document.getElementById('startBtn');
  const quitBtn = document.getElementById('quitBtn');
  const homeBtn = document.getElementById('homeBtn');
  const retryBtn = document.getElementById('retryBtn');
  const skipBtn = document.getElementById('skipBtn');

  const nameInput = document.getElementById('nameInput');
  const ageInput = document.getElementById('ageInput');
  const gradeSelect = document.getElementById('gradeSelect');
  const subjectSelect = document.getElementById('subjectSelect');
  const levelSelect = document.getElementById('levelSelect');

  function ensure(el, id) {
    if (!el) console.warn(`Element with id="${id}" not found in DOM.`);
    return !!el;
  }

  ensure(mainMenu, 'mainMenu');
  ensure(startBtn, 'startBtn');
  ensure(nameInput, 'nameInput');
  ensure(ageInput, 'ageInput');
  ensure(gradeSelect, 'gradeSelect');
  ensure(subjectSelect, 'subjectSelect');
  ensure(levelSelect, 'levelSelect');

  /* =========================
     MUSIM & BACKGROUND
  */
  const seasonEmojis = {
    spring: ['🌸', '🌷'],
    summer: ['🌻', '🍦', '🌊'],
    autumn: ['🍁', '🍂', '🍄'],
    winter: ['❄️', '⛄']
  };

  function getSeasonImageUrl(season) {
    switch (season) {
      case 'spring': return 'url("semi.jpg")';
      case 'summer': return 'url("pans.jfif")';
      case 'autumn': return 'url("ggr.jfif")';
      case 'winter': return 'url("dingin.jfif")';
      default: return 'none';
    }
  }

  function transitionSeasonBackground(newSeason) {
    if (!backgroundLayer) return;
    Array.from(document.body.classList)
      .filter(c => c.startsWith('season-'))
      .forEach(c => document.body.classList.remove(c));
    backgroundLayer.style.backgroundImage = getSeasonImageUrl(newSeason);
  }

  function createFallingEffect(season) {
    if (!seasonalContainer) return;
    seasonalContainer.innerHTML = '';
    const emojis = seasonEmojis[season] || seasonEmojis.spring;
    const count = 15;
    for (let i = 0; i < count; i++) {
      const el = document.createElement('div');
      el.className = 'falling-item';
      el.textContent = emojis[Math.floor(Math.random() * emojis.length)];
      el.style.left = Math.random() * 100 + 'vw';
      el.style.fontSize = (Math.random() * 20 + 20) + 'px';
      el.style.animationDuration = (Math.random() * 5 + 5) + 's';
      el.style.animationDelay = Math.random() * 5 + 's';
      el.style.top = -10 - Math.random() * 20 + 'vh';
      seasonalContainer.appendChild(el);
    }
  }

  function changeSeason(season) {
    transitionSeasonBackground(season);
    createFallingEffect(season);
    document.body.classList.remove('season-spring','season-summer','season-autumn','season-winter');
    document.body.classList.add('season-' + season);
  }

  if (seasonSelect) seasonSelect.addEventListener('change', e => changeSeason(e.target.value));
  changeSeason('spring');

  /* =========================
     POOL SOAL MATEMATIKA (tetap random)
  */
  window.mathPoolRef = window.mathPoolRef || {
    easy: () => {
      const a = Math.floor(Math.random() * 10) + 1;
      const b = Math.floor(Math.random() * 10) + 1;
      return { q: `${a} + ${b} = ?`, a: a + b, opts: [] };
    },
    medium: () => {
      const a = Math.floor(Math.random() * 50) + 10;
      const b = Math.floor(Math.random() * 10) + 1;
      return { q: `${a} - ${b} = ?`, a: a - b, opts: [] };
    },
    hard: () => {
      const a = Math.floor(Math.random() * 12) + 1;
      const b = Math.floor(Math.random() * 12) + 1;
      return { q: `${a} × ${b} = ?`, a: a * b, opts: [] };
    }
  };

  /* =========================
     STATE KUIS
  */
  let state = {
    name: 'Anak',
    age: 8,
    grade: 1,
    subject: 'math', // 'math' atau 'english'
    level: 'easy', // 'easy' | 'medium' | 'hard'
    score: 0,
    currentQ: 0,
    totalQ: 10,
    perQuestion: 10,
    wrongPenalty: 5,
    timeLeft: 30,
    timerId: null,
    questions: []
  };

  function shuffleArray(arr) {
    for (let i = arr.length-1; i > 0; i--) {
      const j = Math.floor(Math.random()*(i+1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  function generateRandomValidishWord(len){
    const vowels='aeiou', cons='bcdfghjklmnpqrstvwxyz';
    let s='', isV=Math.random()<0.5;
    for(let i=0;i<len;i++){
      s += isV ? vowels[Math.floor(Math.random()*vowels.length)] : cons[Math.floor(Math.random()*cons.length)];
      isV = !isV;
    }
    return s.charAt(0).toUpperCase()+s.slice(1);
  }

  function getRandomWordType(type){
    const subjects=['She','He','They','It','A dog','The car','The girl','My teacher','We','You'];
    const verbs=['jump','run','eat','sleep','talk','read','sing','drive','play','walk','see'];
    const objects=['ball','house','book','food','tree','movie','car','garden','phone','friend','school'];
    if(type === 'filler') return generateRandomValidishWord(4);
    const map = {subject:subjects, verb:verbs, object:objects};
    const list = map[type] || objects;
    return list[Math.floor(Math.random()*list.length)];
  }

  /* =========================
     GENERATE QUESTIONS (MATH random OR ENGLISH bank)
     - englishQuestions must be defined in PART B/C
  */
  function generateQuestions(grade, subject, level, total){
    const questions = [];

    if (subject === 'math') {
      const pool = window.mathPoolRef[level] || window.mathPoolRef.easy;
      for (let i=0;i<total;i++){
        const qObj = pool();
        let options = qObj.opts || [];
        if (options.length === 0) options.push(String(qObj.a));
        while (options.length < 4) {
          let d = Number(qObj.a) + Math.floor(Math.random()*11) - 5;
          if (!options.includes(String(d))) options.push(String(d));
        }
        questions.push({ q: qObj.q, a: String(qObj.a), opts: shuffleArray(options.map(String)) });
      }
      return questions;
    }

    // ENGLISH: use englishQuestions defined in PART B/C
    if (subject === 'english') {
      // map level names
      const lvlMap = { easy: 'mudah', medium: 'sedang', hard: 'sulit' };
      const lvlKey = lvlMap[level] || 'mudah';
      const kelasKey = 'kelas' + Number(grade);
      const bank = (typeof englishQuestions !== 'undefined' && englishQuestions[kelasKey] && englishQuestions[kelasKey][lvlKey]) ? englishQuestions[kelasKey][lvlKey] : [];

      if (bank.length === 0) {
        // fallback: tiny generator
        for (let i=0;i<total;i++){
          const w = getRandomWordType('filler');
          const opts = [w, getRandomWordType('filler'), getRandomWordType('filler'), getRandomWordType('filler')];
          questions.push({ q: `Choose the correct word: "${w}"`, a: w, opts: shuffleArray(opts) });
        }
        return questions;
      }

      // choose 'total' items (cycle if needed) and normalize keys
      const pool = shuffleArray(bank.slice());
      for (let i=0;i<total;i++){
        const item = pool[i % pool.length];
        const opts = item.opt || item.options || [];
        const answer = item.a || item.answer || (opts.length>0 ? opts[0] : '');
        // ensure at least 4 options
        const optsCopy = opts.slice();
        while (optsCopy.length < 4) {
          const filler = getRandomWordType('filler');
          if (!optsCopy.includes(filler)) optsCopy.push(filler);
        }
        questions.push({ q: item.q, a: String(answer), opts: shuffleArray(optsCopy.map(String)) });
      }
      return questions;
    }

    // default fallback: empty
    return questions;
  }

  /* =========================
     RENDER & LOGIKA JAWAB
  */
  function renderQuestion(){
    const q = state.questions[state.currentQ];
    if (!q) return console.warn('No question found for index', state.currentQ);
    questionText.textContent = q.q;
    currentQuestionNum.textContent = state.currentQ + 1;
    scoreEl.textContent = state.score;
    progressFill.style.width = (state.currentQ / state.totalQ) * 100 + '%';

    answersEl.innerHTML = '';
    q.opts.forEach(opt => {
      const btn = document.createElement('button');
      btn.textContent = opt;
      btn.onclick = () => handleAnswer(opt, q.a, btn);
      answersEl.appendChild(btn);
    });

    clearInterval(state.timerId);
    state.timeLeft = 30;
    timerEl.textContent = state.timeLeft;
    startTimer();
  }

  function handleAnswer(selected, correct, btn){
    Array.from(answersEl.children).forEach(b => b.disabled = true);
    if (String(selected) === String(correct)) {
      state.score += state.perQuestion;
      if (btn) btn.classList.add('correct');
    } else {
      if (selected !== 'TIMEOUT') {
        state.score -= state.wrongPenalty;
        if (btn) btn.classList.add('incorrect');
      }
      Array.from(answersEl.children).forEach(b => {
        if (String(b.textContent) === String(correct)) b.classList.add('correct-highlight');
      });
    }
    scoreEl.textContent = state.score;
    setTimeout(() => {
      state.currentQ++;
      if (state.currentQ < state.totalQ) renderQuestion();
      else endGame();
    }, 1500);
  }

  function startTimer(){
    clearInterval(state.timerId);
    state.timerId = setInterval(() => {
      state.timeLeft--;
      timerEl.textContent = state.timeLeft;
      if (state.timeLeft <= 0) {
        clearInterval(state.timerId);
        handleAnswer('TIMEOUT', state.questions[state.currentQ].a, null);
      }
    }, 1000);
  }

  function endGame(){
    clearInterval(state.timerId);
    if (quizView) quizView.classList.add('hidden');
    if (resultView) resultView.classList.remove('hidden');
    const finalScore = Math.max(0, state.score);
    finalScoreEl.textContent = finalScore;
    const max = state.totalQ * state.perQuestion;
    const pct = (finalScore / max) * 100;
    resultMessageEl.textContent = pct >= 80 ? "Luar Biasa! Kamu hebat sekali! 🏆"
      : pct >= 50 ? "Bagus! Terus berlatih ya 👍"
      : "Jangan menyerah! Ayo coba lagi 💪";
    if (progressFill) progressFill.style.width = "100%";
  }

  /* =========================
     EVENT LISTENERS (START / NAV)
  */
  if (startBtn) {
    startBtn.addEventListener('click', () => {
      state.name = (nameInput && nameInput.value) ? nameInput.value.trim() : 'Anak';
      state.age = (ageInput && ageInput.value) ? Number(ageInput.value) : 8;
      state.grade = (gradeSelect && gradeSelect.value) ? Number(gradeSelect.value) : 1;
      state.subject = (subjectSelect && subjectSelect.value) ? subjectSelect.value : 'math';
      state.level = (levelSelect && levelSelect.value) ? levelSelect.value : 'easy';

      state.totalQ = 10;
      if (totalQuestionsNum) totalQuestionsNum.textContent = state.totalQ;

      state.questions = generateQuestions(state.grade, state.subject, state.level, state.totalQ);
      state.score = 0;
      state.currentQ = 0;
      state.timeLeft = 30;

      if (playerNameDisplay) playerNameDisplay.textContent = state.name;
      if (subjectDisplay) subjectDisplay.textContent = state.subject === 'math' ? 'Matematika' : 'Bahasa Inggris';

      if (mainMenu) mainMenu.classList.add('hidden');
      if (quizView) quizView.classList.remove('hidden');
      if (resultView) resultView.classList.add('hidden');

      renderQuestion();
    });
  } else {
    console.warn('startBtn tidak ditemukan; event start tidak terpasang.');
  }

  if (quitBtn) {
    quitBtn.addEventListener('click', () => {
      if (confirm('Yakin ingin keluar?')) {
        clearInterval(state.timerId);
        if (mainMenu) mainMenu.classList.remove('hidden');
        if (quizView) quizView.classList.add('hidden');
        if (resultView) resultView.classList.add('hidden');
      }
    });
  }

  if (homeBtn) {
    homeBtn.addEventListener('click', () => {
      clearInterval(state.timerId);
      if (mainMenu) mainMenu.classList.remove('hidden');
      if (quizView) quizView.classList.add('hidden');
      if (resultView) resultView.classList.add('hidden');
    });
  }

  if (retryBtn) retryBtn.addEventListener('click', () => startBtn && startBtn.click());
  if (skipBtn) skipBtn.addEventListener('click', () => {
    clearInterval(state.timerId);
    state.currentQ++;
    if (state.currentQ < state.totalQ) renderQuestion();
    else endGame();
  });

}); // DOMContentLoaded end


// ======================
// PART B — ENGLISH QUESTIONS (KELAS 1–3)
// ======================

const englishQuestions = {
  kelas1: {
    mudah: [
      { q:"What color is the sky?", opt:["Blue","Green","Black","Pink"], a:"Blue"},
      { q:"What animal says 'meow'?", opt:["Cat","Dog","Cow","Bird"], a:"Cat"},
      { q:"Opposite of 'big'?", opt:["Small","Tall","Long","Fast"], a:"Small"},
      { q:"Which one is a fruit?", opt:["Apple","Shoe","Car","Book"], a:"Apple"},
      { q:"What do we use for writing?", opt:["Pencil","Cup","Bag","Plate"], a:"Pencil"},
      { q:"What animal can fly?", opt:["Bird","Fish","Cow","Cat"], a:"Bird"},
      { q:"What number comes after 5?", opt:["6","4","2","10"], a:"6"},
      { q:"Opposite of 'happy'?", opt:["Sad","Big","Hot","Cold"], a:"Sad"},
      { q:"Which one is a shape?", opt:["Circle","Spoon","Tree","Hat"], a:"Circle"},
      { q:"What color is grass?", opt:["Green","Blue","Red","Yellow"], a:"Green"}
    ],
    sedang: [
      { q:"Where do we read books?", opt:["Library","Kitchen","Bathroom","Garage"], a:"Library"},
      { q:"What is the opposite of 'cold'?", opt:["Hot","Wet","Blue","Light"], a:"Hot"},
      { q:"Which one is a vehicle?", opt:["Car","Banana","Socks","Window"], a:"Car"},
      { q:"We sleep on a…", opt:["Bed","Roof","Table","Box"], a:"Bed"},
      { q:"Which one is a pet?", opt:["Rabbit","Rock","Spoon","Tree"], a:"Rabbit"},
      { q:"Which is a body part?", opt:["Hand","Milk","Shoe","Ball"], a:"Hand"},
      { q:"Opposite of 'slow'?", opt:["Fast","Tall","Happy","Round"], a:"Fast"},
      { q:"What do we drink?", opt:["Water","Stone","Sand","Box"], a:"Water"},
      { q:"Which one is a family member?", opt:["Mother","Chair","Sky","Spoon"], a:"Mother"},
      { q:"Where do we cook?", opt:["Kitchen","Bed","Garden","Bathroom"], a:"Kitchen"}
    ],
    sulit: [
      { q:"Which one is an action verb?", opt:["Run","Blue","Tall","Hot"], a:"Run"},
      { q:"Where do plants grow?", opt:["Soil","Chair","Bag","Window"], a:"Soil"},
      { q:"Opposite of 'noisy'?", opt:["Quiet","Bright","Deep","Hard"], a:"Quiet"},
      { q:"We read with our…", opt:["Eyes","Hands","Feet","Nose"], a:"Eyes"},
      { q:"What season is known for flowers?", opt:["Spring","Winter","Autumn","Summer"], a:"Spring"},
      { q:"Which one means 'cepat'?", opt:["Fast","Slow","Sad","Small"], a:"Fast"},
      { q:"'Delicious' means…", opt:["Enak","Besar","Berisik","Tinggi"], a:"Enak"},
      { q:"Which is an animal habitat?", opt:["Forest","Pencil","Plate","Clock"], a:"Forest"},
      { q:"Opposite of 'early'?", opt:["Late","Large","Soft","Weak"], a:"Late"},
      { q:"Which one is a natural thing?", opt:["Sun","Toy","Phone","Chair"], a:"Sun"}
    ]
  },

  kelas2: {
    mudah: [
      { q:"What animal says 'woof'?", opt:["Dog","Cat","Cow","Bird"], a:"Dog"},
      { q:"Opposite of ‘hot’?", opt:["Cold","Small","Tall","Young"], a:"Cold"},
      { q:"Which one is a drink?", opt:["Milk","Stone","Paper","Shoe"], a:"Milk"},
      { q:"We write with a…", opt:["Pencil","Plate","Spoon","Rock"], a:"Pencil"},
      { q:"Which one is a fruit?", opt:["Mango","Car","Shirt","Bag"], a:"Mango"},
      { q:"Opposite of 'short'?", opt:["Long","Fat","Warm","Dark"], a:"Long"},
      { q:"Which is transportation?", opt:["Bus","Tree","Eraser","Cup"], a:"Bus"},
      { q:"Where do we brush our teeth?", opt:["Bathroom","Garden","Class","Garage"], a:"Bathroom"},
      { q:"Which one is a job?", opt:["Teacher","Banana","Ball","Socks"], a:"Teacher"},
      { q:"Color of banana?", opt:["Yellow","Blue","Purple","Grey"], a:"Yellow"}
    ],
    sedang: [
      { q:"We eat with a…", opt:["Spoon","Book","Chair","Light"], a:"Spoon"},
      { q:"Opposite of 'light'?", opt:["Heavy","Strong","Short","Quick"], a:"Heavy"},
      { q:"Where do we study?", opt:["School","Market","Garage","Beach"], a:"School"},
      { q:"Which one is a vegetable?", opt:["Carrot","Ice cream","Cake","Meat"], a:"Carrot"},
      { q:"What do cows give?", opt:["Milk","Wool","Bread","Metal"], a:"Milk"},
      { q:"Which one is a body part?", opt:["Leg","Bag","Ball","Box"], a:"Leg"},
      { q:"'Kind' means…", opt:["Baik","Marah","Lapar","Basah"], a:"Baik"},
      { q:"Opposite of 'dirty'?", opt:["Clean","Long","Short","Wide"], a:"Clean"},
      { q:"We see with our…", opt:["Eyes","Nose","Hand","Foot"], a:"Eyes"},
      { q:"Which one is a living thing?", opt:["Bird","Rock","Table","Cup"], a:"Bird"}
    ],
    sulit: [
      { q:"Which one is a verb?", opt:["Walk","Red","Tall","Short"], a:"Walk"},
      { q:"'Delicious' means…", opt:["Enak","Buruk","Bosan","Lemah"], a:"Enak"},
      { q:"Where do fish live?", opt:["Water","Tree","Sky","Sand"], a:"Water"},
      { q:"Opposite of 'brave'?", opt:["Coward","Strong","Smart","Happy"], a:"Coward"},
      { q:"Which one is an adjective?", opt:["Beautiful","Run","Eat","Drink"], a:"Beautiful"},
      { q:"What is a baby cat called?", opt:["Kitten","Puppy","Cub","Calf"], a:"Kitten"},
      { q:"Opposite of 'dangerous'?", opt:["Safe","Soft","Sharp","Tall"], a:"Safe"},
      { q:"Meaning of 'favorite'?", opt:["Kesukaan","Kebiasaan","Kebutuhan","Kelemahan"], a:"Kesukaan"},
      { q:"Which is an indoor activity?", opt:["Reading","Swimming in the sea","Playing football","Flying a kite"], a:"Reading"},
      { q:"We use scissors to…", opt:["Cut","Sing","Drive","Sleep"], a:"Cut"}
    ]
  },

  kelas3: {
    mudah: [
      { q:"What is the opposite of ‘early’?", opt:["Late","Small","Warm","Fast"], a:"Late"},
      { q:"What do bees make?", opt:["Honey","Milk","Bread","Oil"], a:"Honey"},
      { q:"Which is a transport?", opt:["Train","Leaf","Spoon","Cloud"], a:"Train"},
      { q:"Which is a verb?", opt:["Jump","Blue","Tall","Circle"], a:"Jump"},
      { q:"Sun rises in the…", opt:["East","West","North","South"], a:"East"},
      { q:"Opposite of ‘high’?", opt:["Low","Hot","Fast","Round"], a:"Low"},
      { q:"We drink with a…", opt:["Glass","Bag","Book","Shoe"], a:"Glass"},
      { q:"Which one is a job?", opt:["Doctor","Chair","Chocolate","River"], a:"Doctor"},
      { q:"Which one is a weather?", opt:["Rainy","Spoon","Sofa","Jeans"], a:"Rainy"},
      { q:"Opposite of ‘strong’?", opt:["Weak","Tall","Hard","Long"], a:"Weak"}
    ],
    sedang: [
      { q:"Meaning of ‘protect’?", opt:["Melindungi","Melempar","Menutup","Membangun"], a:"Melindungi"},
      { q:"Which is an adverb?", opt:["Slowly","Chair","Yellow","Cloud"], a:"Slowly"},
      { q:"Correct sentence:", opt:["He is reading a book","He reading a book","He are reading a book","He read a book now"], a:"He is reading a book"},
      { q:"Opposite of ‘noisy’?", opt:["Quiet","Long","Strong","Thin"], a:"Quiet"},
      { q:"Which is a natural disaster?", opt:["Flood","Table","Pencil","Jacket"], a:"Flood"},
      { q:"Which is a pet?", opt:["Hamster","Car","Rock","Shoes"], a:"Hamster"},
      { q:"Meaning of ‘hungry’?", opt:["Lapar","Lelah","Takut","Marah"], a:"Lapar"},
      { q:"Which is a preposition?", opt:["Under","Green","Run","Sweet"], a:"Under"},
      { q:"Opposite of 'lend'?", opt:["Borrow","Buy","Catch","Stop"], a:"Borrow"},
      { q:"Correct:", opt:["She writes neatly","She write neatly","She writing neatly","She writes neatly now"], a:"She writes neatly"}
    ],
    sulit: [
      { q:"Meaning of ‘pollution’?", opt:["Pencemaran","Peningkatan","Peringatan","Peraturan"], a:"Pencemaran"},
      { q:"Synonym of ‘angry’?", opt:["Mad","Tall","Huge","Cold"], a:"Mad"},
      { q:"Correct passive:", opt:["The cake was made by Mila","Mila made by the cake","The cake makes Mila","Mila is made cake"], a:"The cake was made by Mila"},
      { q:"Meaning of ‘solution’?", opt:["Solusi","Masalah","Keributan","Kesempatan"], a:"Solusi"},
      { q:"Correct sentence:", opt:["The children were playing","The children was playing","Children were play","Children playing"], a:"The children were playing"},
      { q:"Synonym of 'tiny'?", opt:["Small","Cold","Sharp","Wide"], a:"Small"},
      { q:"Opposite of ‘protective’?", opt:["Dangerous","Clean","Soft","Short"], a:"Dangerous"},
      { q:"Meaning of 'participate'?", opt:["Ikut serta","Menolak","Berjalan","Membayar"], a:"Ikut serta"},
      { q:"Correct:", opt:["They have finished their work","They has finished their work","They finish their work now","They are finish their work"], a:"They have finished their work"},
      { q:"Meaning of ‘growth’?", opt:["Pertumbuhan","Kehilangan","Permainan","Penjelasan"], a:"Pertumbuhan"}
    ]
  }
};



// ======================
// PART C — ENGLISH QUESTIONS (KELAS 4–6)
// ======================

englishQuestions.kelas4 = {
  mudah: [
    { q:"Synonym of 'happy'?", opt:["Glad","Sad","Weak","Cold"], a:"Glad"},
    { q:"What do we use to measure time?", opt:["Clock","Spoon","Paper","Chair"], a:"Clock"},
    { q:"Opposite of 'clean'?", opt:["Dirty","Fresh","Short","Wide"], a:"Dirty"},
    { q:"Which is a profession?", opt:["Nurse","Bottle","Window","Tiger"], a:"Nurse"},
    { q:"Meaning of 'honest'?", opt:["Jujur","Lapar","Marah","Lelah"], a:"Jujur"},
    { q:"Opposite of 'strong'?", opt:["Weak","Big","Hard","Tall"], a:"Weak"},
    { q:"Which is an adverb?", opt:["Quickly","Blue","Shoe","River"], a:"Quickly"},
    { q:"Meaning of 'warning'?", opt:["Peringatan","Pembersih","Perhiasan","Peralatan"], a:"Peringatan"},
    { q:"Which one is an emotion?", opt:["Anger","Bottle","Sand","Flower"], a:"Anger"},
    { q:"Opposite of 'start'?", opt:["Finish","Arrive","Short","Move"], a:"Finish"}
  ],
  sedang: [
    { q:"Correct sentence:", opt:["They are doing homework","They is doing homework","They are do homework","They doing homework"], a:"They are doing homework"},
    { q:"Meaning of 'improve'?", opt:["Meningkatkan","Menjatuhkan","Menutup","Mengurangi"], a:"Meningkatkan"},
    { q:"Synonym of 'brave'?", opt:["Courageous","Cold","Slow","Weak"], a:"Courageous"},
    { q:"Which is a conjunction?", opt:["Although","Quickly","Soft","Stone"], a:"Although"},
    { q:"Meaning of 'reduce'?", opt:["Mengurangi","Membuat","Membawa","Mengangkat"], a:"Mengurangi"},
    { q:"Which one is a preposition?", opt:["Between","Fast","Tall","Jump"], a:"Between"},
    { q:"Meaning of 'protective'?", opt:["Pelindung","Peramal","Pertanian","Perbaikan"], a:"Pelindung"},
    { q:"Correct sentence:", opt:["She has eaten breakfast","She have eaten breakfast","She eaten breakfast","She is eat breakfast"], a:"She has eaten breakfast"},
    { q:"Meaning of 'natural resources'?", opt:["Sumber daya alam","Rumah tangga","Keuangan","Kesehatan"], a:"Sumber daya alam"},
    { q:"Synonym of 'accident'?", opt:["Crash","River","Project","Growth"], a:"Crash"}
  ],
  sulit: [
    { q:"Meaning of 'population'?", opt:["Populasi","Pertanyaan","Pengukuran","Pengiriman"], a:"Populasi"},
    { q:"Correct passive voice:", opt:["The food was cooked by my mom","My mom cooked by food","The food cooks mom","Mom is cooked food"], a:"The food was cooked by my mom"},
    { q:"Meaning of 'influence'?", opt:["Pengaruh","Kehilangan","Kebersihan","Kebiasaan"], a:"Pengaruh"},
    { q:"Meaning of 'responsibility'?", opt:["Tanggung jawab","Kesepakatan","Peringatan","Perhiasan"], a:"Tanggung jawab"},
    { q:"Correct:", opt:["They have been working","They has been working","They are been working","They be working"], a:"They have been working"},
    { q:"Synonym of 'require'?", opt:["Need","Cold","Wide","Short"], a:"Need"},
    { q:"Meaning of 'prevent'?", opt:["Mencegah","Membuka","Membuang","Membersihkan"], a:"Mencegah"},
    { q:"Correct:", opt:["If it rains, we stay inside","If it will rain, we stay inside","If raining, we stay inside","If rain, we stay inside"], a:"If it rains, we stay inside"},
    { q:"Meaning of 'climate change'?", opt:["Perubahan iklim","Perubahan musim","Musim kemarau","Pemanasan rumah"], a:"Perubahan iklim"},
    { q:"Synonym of 'ability'?", opt:["Skill","Plate","Forest","Chance"], a:"Skill"}
  ]
};

englishQuestions.kelas5 = {
  mudah: [
    { q:"What is the synonym of 'smart'?", opt:["Clever","Slow","Lazy","Weak"], a:"Clever"},
    { q:"Which one is a natural disaster?", opt:["Earthquake","Pencil","Butter","Lamp"], a:"Earthquake"},
    { q:"People travel by…", opt:["Car","Stone","Paper","Fork"], a:"Car"},
    { q:"‘Healthy’ means…", opt:["Sehat","Mahal","Lapar","Kotor"], a:"Sehat"},
    { q:"Opposite of 'dangerous'?", opt:["Safe","Hard","Strong","Soft"], a:"Safe"},
    { q:"We use a thermometer to measure…", opt:["Temperature","Length","Weight","Speed"], a:"Temperature"},
    { q:"Which is a verb?", opt:["Decide","Beautiful","Strong","Happy"], a:"Decide"},
    { q:"Which one is a profession?", opt:["Engineer","Circle","Cloud","Music"], a:"Engineer"},
    { q:"'Pollution' means…", opt:["Pencemaran","Pertumbuhan","Pelajaran","Pekerjaan"], a:"Pencemaran"},
    { q:"We breathe using our…", opt:["Lungs","Feet","Hands","Ears"], a:"Lungs"}
  ],
  sedang: [
    { q:"'Reduce' means…", opt:["Mengurangi","Menambah","Menghitung","Memperbesar"], a:"Mengurangi"},
    { q:"Correct sentence:", opt:["She is cooking","She are cooking","She am cooking","She cooking"], a:"She is cooking"},
    { q:"Synonym of 'brave'?", opt:["Courageous","Shy","Weak","Slow"], a:"Courageous"},
    { q:"Abstract noun:", opt:["Happiness","Table","Dog","River"], a:"Happiness"},
    { q:"'Protective gear' means…", opt:["Peralatan pelindung","Peralatan memasak","Peralatan bermain","Peralatan berkebun"], a:"Peralatan pelindung"},
    { q:"Correct:", opt:["He doesn't like fruit","He doesn’t likes fruit","He not like fruit","He no likes fruit"], a:"He doesn't like fruit"},
    { q:"A scientist works in a…", opt:["Laboratory","Kitchen","Bakery","Garden"], a:"Laboratory"},
    { q:"'Rarely' means…", opt:["Jarang","Sering","Kadang","Selalu"], a:"Jarang"},
    { q:"Which is a conjunction?", opt:["Because","Quickly","Happy","Stone"], a:"Because"},
    { q:"‘Financial problem’ means…", opt:["Masalah keuangan","Masalah makanan","Masalah sekolah","Masalah keluarga"], a:"Masalah keuangan"}
  ],
  sulit: [
    { q:"'Endangered animals' means…", opt:["Hewan yang terancam punah","Hewan peliharaan","Hewan buas","Hewan kecil"], a:"Hewan yang terancam punah"},
    { q:"Correct:", opt:["The data is correct","The datas are correct","The datas is correct","The data are correct"], a:"The data is correct"},
    { q:"'Consequence' means…", opt:["Akibat","Penyebab","Petunjuk","Pendapat"], a:"Akibat"},
    { q:"Correct passive:", opt:["The letter is written by Ana","Ana writes by the letter","The letter writes Ana","Ana written the letter"], a:"The letter is written by Ana"},
    { q:"‘He barely passed the test’ means…", opt:["Dia hampir tidak lulus","Dia lulus dengan mudah","Dia tidak lulus","Dia lulus dengan nilai tinggi"], a:"Dia hampir tidak lulus"},
    { q:"Synonym of 'essential'?", opt:["Important","Easy","Optional","Famous"], a:"Important"},
    { q:"Correct conditional:", opt:["If it rains, we will stay home","If it will rain, we stay home","If it raining, we will stay home","If rains, we will stay home"], a:"If it rains, we will stay home"},
    { q:"'Available' means…", opt:["Tersedia","Tertutup","Terlarang","Tersembunyi"], a:"Tersedia"},
    { q:"Correct question:", opt:["What are you doing?","What do you doing?","What you doing?","What doing you?"], a:"What are you doing?"},
    { q:"'Cooperate' means…", opt:["Bekerja sama","Bertengkar","Berbohong","Berjalan"], a:"Bekerja sama"}
  ]
};

englishQuestions.kelas6 = {
  mudah: [
    { q:"Synonym of 'quick'?", opt:["Fast","Late","Weak","Cold"], a:"Fast"},
    { q:"Which is a public place?", opt:["Library","Pencil","Bottle","Spoon"], a:"Library"},
    { q:"‘Responsibility’ means…", opt:["Tanggung jawab","Kemarahan","Kesedihan","Kebersihan"], a:"Tanggung jawab"},
    { q:"Which is an adjective?", opt:["Tall","Jump","Sing","Drink"], a:"Tall"},
    { q:"Opposite of 'crowded'?", opt:["Empty","Hot","Near","Short"], a:"Empty"},
    { q:"We use a microscope to see…", opt:["Small objects","Mountains","Cars","Planets"], a:"Small objects"},
    { q:"Correct:", opt:["She speaks English well","She speak English well","She speaking English well","She spoke English well now"], a:"She speaks English well"},
    { q:"‘Environment’ means…", opt:["Lingkungan","Peralatan","Pekerjaan","Perhiasan"], a:"Lingkungan"},
    { q:"Synonym of 'journey'?", opt:["Trip","Table","Flower","Paper"], a:"Trip"},
    { q:"We write on a…", opt:["Notebook","Ruler","Eraser","Bottle"], a:"Notebook"}
  ],
  sedang: [
    { q:"‘Improvement’ means…", opt:["Peningkatan","Penurunan","Kesalahan","Peringatan"], a:"Peningkatan"},
    { q:"Correct:", opt:["They have finished the project","They has finished the project","They are finish the project","They finishing the project"], a:"They have finished the project"},
    { q:"Which word is an adverb?", opt:["Quickly","Blue","Chair","Heavy"], a:"Quickly"},
    { q:"‘Avoid’ means…", opt:["Menghindari","Mendekati","Membantu","Mengumpulkan"], a:"Menghindari"},
    { q:"Choose conjunction:", opt:["Because","Beautiful","Quiet","Fast"], a:"Because"},
    { q:"Synonym of 'ability'?", opt:["Skill","Noise","Place","Problem"], a:"Skill"},
    { q:"Correct:", opt:["The students are studying now","The students studying now","The student are studying now","Students is studying now"], a:"The students are studying now"},
    { q:"‘Permission’ means…", opt:["Izin","Peringatan","Tugas","Larangan"], a:"Izin"},
    { q:"Compound word:", opt:["Raincoat","Tree","Water","Glass"], a:"Raincoat"},
    { q:"Correct:", opt:["She rarely eats junk food","She rare eats junk food","She rarely eating junk food","She rarely eat junk food"], a:"She rarely eats junk food"}
  ],
  sulit: [
    { q:"Meaning of 'sustainable development'?", opt:["Pembangunan berkelanjutan","Pembangunan cepat","Pembangunan darurat","Pembangunan sementara"], a:"Pembangunan berkelanjutan"},
    { q:"Correct passive:", opt:["The homework was completed by Lisa","Lisa completed by the homework","The homework completes Lisa","Lisa was completing the homework"], a:"The homework was completed by Lisa"},
    { q:"Meaning of 'significant'?", opt:["Penting","Biasa","Lama","Sementara"], a:"Penting"},
    { q:"Correct conditional:", opt:["If I had time, I would help you","If I have time, I would help you","If I had time, I will help you","If I would have time, I help you"], a:"If I had time, I would help you"},
    { q:"‘Contribute’ means…", opt:["Berperan / memberikan kontribusi","Berdiam diri","Berjalan","Bertengkar"], a:"Berperan / memberikan kontribusi"},
    { q:"Correct:", opt:["The book that you gave me is very useful","The book who you gave me is very useful","The book which you give me very useful","The book what you gave is useful"], a:"The book that you gave me is very useful"},
    { q:"Meaning of 'participation'?", opt:["Partisipasi / keikutsertaan","Peringatan","Perayaan","Perlawanan"], a:"Partisipasi / keikutsertaan"},
    { q:"Correct form:", opt:["He has been working here for 5 years","He is been working here for 5 years","He have been working here for 5 years","He has working here for 5 years"], a:"He has been working here for 5 years"},
    { q:"Synonym of 'challenge'?", opt:["Tantangan","Kesempatan","Kebiasaan","Perjalanan"], a:"Tantangan"},
    { q:"Meaning of 'responsible citizen'?", opt:["Warga yang bertanggung jawab","Warga yang kaya","Warga yang sibuk","Warga yang terkenal"], a:"Warga yang bertanggung jawab"}
  ]
};
