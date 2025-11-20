Tentu, ini adalah perbaikan total pada file `script.js`.

**Apa yang diperbarui?**

1.  **Logika Matematika Dinamis:** Tidak lagi statis. Soal dibuat menggunakan angka acak sesuai level.
      * **Mudah:** Penjumlahan & Pengurangan angka kecil (1-20).
      * **Sedang:** Perkalian dasar & Penjumlahan angka puluhan (20-100).
      * **Sulit:** Pembagian, Perkalian angka lebih besar, & Operasi campuran.
      * **Jawaban Pengecoh (Distractor):** Pengecoh dibuat cerdas (misal: jika jawaban 10, pengecohnya 8, 9, 12, bukan angka asal-asalan).
2.  **Logika Bahasa Inggris Lebih Kaya:** Menggunakan *database* kata yang lebih banyak.
      * **Mudah:** Kosakata Benda/Hewan/Warna (Inggris -\> Indo).
      * **Sedang:** Kata Kerja & Kata Sifat (Indo -\> Inggris).
      * **Sulit:** Melengkapi kalimat (Grammar sederhana).
      * **Pengecoh:** Mengambil kata lain dari kategori yang sama agar tidak mudah ditebak.
3.  **Perbaikan Bug:** Menangani kasus jika waktu habis (timeout) agar tidak error.

Silakan ganti seluruh isi **`script.js`** kamu dengan kode di bawah ini:

```javascript
/* =========================================
   1. LOGIKA BACKGROUND & MUSIM (VISUAL)
   ========================================= */
const seasonSelect = document.getElementById('seasonSelect');
const seasonalContainer = document.getElementById('seasonal');
const backgroundLayer = document.getElementById('backgroundLayer');

const seasonEmojis = {
  spring: ['🌸', '🌹', '🌷', '🐝', '🐞'],
  summer: ['☀️', '🌻', '🍦', '🌊', '🌴'],
  autumn: ['🍁', '🍂', '🍄', '🌰', '🎃'],
  winter: ['❄️', '⛄', '🧊', '🧤', '🎄']
};

function getSeasonImageUrl(season) {
  switch(season) {
    case 'spring': return 'url("semi.jpg")';
    case 'summer': return 'url("pans.jfif")';
    case 'autumn': return 'url("ggr.jfif")';
    case 'winter': return 'url("dgin.jpg")';
    default: return 'none';
  }
}

function transitionSeasonBackground(newSeason) {
  const currentBodyClass = document.body.className;
  if (currentBodyClass) {
    backgroundLayer.classList.add('fade-out');
    backgroundLayer.style.backgroundImage = getSeasonImageUrl(currentBodyClass.replace('season-', ''));
  }

  setTimeout(() => {
    document.body.className = '';
    document.body.classList.add('season-' + newSeason);
    backgroundLayer.style.backgroundImage = getSeasonImageUrl(newSeason);
    backgroundLayer.classList.remove('fade-out');
  }, 500);
}

function createFallingEffect(season) {
  seasonalContainer.innerHTML = '';
  const emojis = seasonEmojis[season];
  const count = 15;

  for(let i=0; i<count; i++) {
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
}

seasonSelect.addEventListener('change', (e) => {
  changeSeason(e.target.value);
});

// Set awal
changeSeason('spring');


/* =========================================
   2. DATA & LOGIKA GENERATOR SOAL
   ========================================= */

// -- Utility: Acak Array --
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

// -- Utility: Angka Acak (Min - Max) --
function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// --- GENERATOR MATEMATIKA ---
function getMathQuestion(grade, level) {
  let q = "", a = 0, opts = [];
  let n1, n2;

  // Logika berdasarkan Level
  if (level === 'easy') {
    // Mudah: Penjumlahan & Pengurangan angka kecil (1-20)
    if (Math.random() > 0.5) {
      n1 = randInt(1, 15);
      n2 = randInt(1, 10);
      q = `${n1} + ${n2} = ?`;
      a = n1 + n2;
    } else {
      n1 = randInt(5, 20);
      n2 = randInt(1, n1); // Agar tidak negatif
      q = `${n1} - ${n2} = ?`;
      a = n1 - n2;
    }
  } 
  else if (level === 'medium') {
    // Sedang: Penjumlahan puluhan & Perkalian dasar (1-10)
    const type = Math.random();
    if (type < 0.33) {
      n1 = randInt(20, 50);
      n2 = randInt(10, 40);
      q = `${n1} + ${n2} = ?`;
      a = n1 + n2;
    } else if (type < 0.66) {
      n1 = randInt(30, 80);
      n2 = randInt(5, 25);
      q = `${n1} - ${n2} = ?`;
      a = n1 - n2;
    } else {
      n1 = randInt(2, 9);
      n2 = randInt(2, 9);
      q = `${n1} × ${n2} = ?`;
      a = n1 * n2;
    }
  } 
  else { // Hard
    // Sulit: Perkalian belasan, Pembagian, Campuran
    const type = Math.random();
    if (type < 0.4) {
      // Perkalian lebih besar
      n1 = randInt(10, 20);
      n2 = randInt(3, 9);
      q = `${n1} × ${n2} = ?`;
      a = n1 * n2;
    } else if (type < 0.7) {
      // Pembagian (Hasil bulat)
      n2 = randInt(2, 9);
      a = randInt(2, 12); // Jawaban
      n1 = n2 * a;        // Soalnya
      q = `${n1} : ${n2} = ?`;
    } else {
      // Operasi 3 angka
      n1 = randInt(5, 15);
      n2 = randInt(2, 5);
      let n3 = randInt(1, 10);
      q = `${n1} + ${n2} × ${n3} = ?`;
      a = n1 + (n2 * n3);
    }
  }

  // Generate Pengecoh (Distractors) Pintar
  opts.push(a); // Masukkan jawaban benar
  while (opts.length < 4) {
    // Buat angka acak di sekitar jawaban benar (range -10 sampai +10)
    let diff = randInt(-10, 10); 
    let wrong = a + diff;
    
    // Pastikan tidak negatif, tidak 0, dan tidak duplikat
    if (wrong >= 0 && !opts.includes(wrong) && wrong !== a) {
      opts.push(wrong);
    }
  }

  return { q: q, a: String(a), opts: shuffleArray(opts.map(String)) };
}

// --- GENERATOR BAHASA INGGRIS ---
const englishData = {
  easy: [
    {q: "Apple", a: "Apel"}, {q: "Cat", a: "Kucing"}, {q: "Dog", a: "Anjing"},
    {q: "Red", a: "Merah"}, {q: "Blue", a: "Biru"}, {q: "Book", a: "Buku"},
    {q: "School", a: "Sekolah"}, {q: "Fish", a: "Ikan"}, {q: "Bird", a: "Burung"},
    {q: "Door", a: "Pintu"}, {q: "Table", a: "Meja"}, {q: "Chair", a: "Kursi"}
  ],
  medium: [
    {q: "Eat", a: "Makan"}, {q: "Drink", a: "Minum"}, {q: "Sleep", a: "Tidur"},
    {q: "Run", a: "Lari"}, {q: "Walk", a: "Jalan"}, {q: "Happy", a: "Senang"},
    {q: "Sad", a: "Sedih"}, {q: "Big", a: "Besar"}, {q: "Small", a: "Kecil"},
    {q: "Teacher", a: "Guru"}, {q: "Student", a: "Murid"}, {q: "Window", a: "Jendela"}
  ],
  hard: [
    {q: "She ___ an apple.", a: "Eats", opts: ["Eat", "Eaten", "Eating"]},
    {q: "They ___ football.", a: "Play", opts: ["Plays", "Playing", "Played"]},
    {q: "I ___ a student.", a: "Am", opts: ["Is", "Are", "Be"]},
    {q: "He ___ to school.", a: "Goes", opts: ["Go", "Going", "Gone"]},
    {q: "Translate: 'Selamat Pagi'", a: "Good Morning", opts: ["Good Night", "Good Bye", "Good Afternoon"]},
    {q: "Translate: 'Terima Kasih'", a: "Thank You", opts: ["You're welcome", "I am sorry", "Excuse me"]},
    {q: "Opposite of 'Hot'", a: "Cold", opts: ["Warm", "Cool", "Fire"]},
    {q: "Opposite of 'Fast'", a: "Slow", opts: ["Quick", "Run", "Stop"]}
  ]
};

function getEnglishQuestion(level) {
  let item, qText, correct, options;

  // Ambil kolam data
  let pool = englishData[level] || englishData['easy'];
  
  // Pilih 1 soal acak
  item = pool[Math.floor(Math.random() * pool.length)];

  // Format Soal
  if (level === 'hard' && item.q.includes("___")) {
    qText = item.q;
    correct = item.a;
    // Khusus level hard, opsi pengecoh sudah disiapkan manual di atas
    // atau kita ambil random kalau tidak ada
    options = item.opts ? [correct, ...item.opts] : null;
  } else {
    // Easy & Medium: Terjemahan
    qText = `Apa arti "${item.q}"?`;
    correct = item.a;
    options = [correct];
  }

  // Jika options belum penuh (untuk easy/medium), ambil kata lain dari pool sebagai pengecoh
  if (options.length < 4) {
    let attempts = 0;
    while (options.length < 4 && attempts < 50) {
      let randomItem = pool[Math.floor(Math.random() * pool.length)];
      if (!options.includes(randomItem.a)) {
        options.push(randomItem.a);
      }
      attempts++;
    }
  }

  return { q: qText, a: correct, opts: shuffleArray(options) };
}

// --- FUNGSI UTAMA PEMBUAT SOAL ---
function generateQuestions(grade, subject, level, total) {
  let questions = [];
  
  for (let i = 0; i < total; i++) {
    if (subject === 'math') {
      questions.push(getMathQuestion(grade, level));
    } else {
      questions.push(getEnglishQuestion(level));
    }
  }
  
  return questions;
}


/* =========================================
   3. LOGIKA GAME (STATE & UI)
   ========================================= */
let state = {
  name: 'Anak',
  age: 8,
  grade: 1,
  subject: 'math',
  level: 'easy',
  score: 0,
  currentQ: 0,
  totalQ: 10,     // PASTI 10 SOAL
  perQuestion: 10,// Nilai Benar
  wrongPenalty: 5,// Hukuman Salah
  timeLeft: 30,
  timerId: null,
  questions: []
};

// DOM Elements
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

// Tombol Mulai
document.getElementById('startBtn').addEventListener('click', () => {
  // Ambil Input
  state.name = document.getElementById('nameInput').value.trim() || 'Anak';
  state.age = parseInt(document.getElementById('ageInput').value) || 8;
  state.grade = parseInt(document.getElementById('gradeSelect').value);
  state.subject = document.getElementById('subjectSelect').value;
  state.level = document.getElementById('levelSelect').value;
  
  // Reset State
  state.totalQ = 10; 
  state.score = 0;
  state.currentQ = 0;
  state.timeLeft = 30;
  
  // Update UI Awal
  totalQuestionsNum.textContent = state.totalQ;
  timerEl.textContent = state.timeLeft;
  playerNameDisplay.textContent = state.name;
  subjectDisplay.textContent = (state.subject === 'math') ? 'Matematika' : 'Bahasa Inggris';

  // Generate Soal Baru
  state.questions = generateQuestions(state.grade, state.subject, state.level, state.totalQ);

  // Ganti Layar
  mainMenu.classList.add('hidden');
  quizView.classList.remove('hidden');
  resultView.classList.add('hidden');
  
  renderQuestion();
  startTimer();
});

function renderQuestion() {
  const q = state.questions[state.currentQ];
  
  // Tampilkan Teks
  questionText.textContent = q.q;
  currentQuestionNum.textContent = state.currentQ + 1;
  scoreEl.textContent = state.score;
  
  // Update Progress Bar
  const pct = (state.currentQ / state.totalQ) * 100;
  progressFill.style.width = pct + '%';

  // Buat Tombol Jawaban
  answersEl.innerHTML = '';
  q.opts.forEach(opt => {
    const btn = document.createElement('button');
    btn.textContent = opt;
    btn.onclick = () => handleAnswer(opt, q.a, btn);
    answersEl.appendChild(btn);
  });

  // Reset Timer
  clearInterval(state.timerId);
  state.timeLeft = 30;
  timerEl.textContent = state.timeLeft;
  startTimer();
}

function handleAnswer(selected, correct, buttonElement) {
  // Matikan klik tombol lain
  Array.from(answersEl.children).forEach(btn => btn.disabled = true);
  
  // Cek Jawaban
  const isCorrect = String(selected) === String(correct);

  if (isCorrect) {
    state.score += state.perQuestion;
    if(buttonElement) {
      buttonElement.style.backgroundColor = '#d4edda'; // Hijau
      buttonElement.style.borderColor = '#28a745';
    }
  } else {
    state.score = Math.max(0, state.score - state.wrongPenalty); // Jangan sampai minus
    if(buttonElement) {
      buttonElement.style.backgroundColor = '#f8d7da'; // Merah
      buttonElement.style.borderColor = '#dc3545';
    }
    // Kasih tahu yang benar (Highlight hijau di tombol jawaban benar)
    Array.from(answersEl.children).forEach(btn => {
      if (String(btn.textContent) === String(correct)) {
        btn.style.borderColor = '#28a745';
        btn.style.borderWidth = '3px';
      }
    });
  }
  
  scoreEl.textContent = state.score;

  // Jeda sebelum soal berikutnya
  setTimeout(() => {
    state.currentQ++;
    if (state.currentQ < state.totalQ) {
      renderQuestion();
    } else {
      endGame();
    }
  }, 1200);
}

function startTimer() {
  clearInterval(state.timerId);
  state.timerId = setInterval(() => {
    state.timeLeft--;
    timerEl.textContent = state.timeLeft;
    
    if (state.timeLeft <= 0) {
      clearInterval(state.timerId);
      // Waktu habis = Salah (tanpa tombol yang diklik)
      handleAnswer('TIMEOUT', state.questions[state.currentQ].a, null); 
    }
  }, 1000);
}

function endGame() {
  clearInterval(state.timerId);
  quizView.classList.add('hidden');
  resultView.classList.remove('hidden');
  
  finalScoreEl.textContent = state.score;
  
  const maxScore = state.totalQ * state.perQuestion;
  const percentage = (state.score / maxScore) * 100;
  
  let message = '';
  if (percentage === 100) message = "Sempurna! Kamu Jenius! 🌟🏆";
  else if (percentage >= 80) message = "Luar Biasa! Kamu hebat sekali! 🎉";
  else if (percentage >= 60) message = "Bagus! Tingkatkan lagi ya! 👍";
  else message = "Tetap semangat! Ayo belajar lagi! 💪";
  
  resultMessageEl.textContent = message;
}

/* =========================================
   4. TOMBOL NAVIGASI UMUM
   ========================================= */
document.getElementById('quitBtn').addEventListener('click', () => {
  if (confirm('Yakin ingin keluar? Skor tidak disimpan.')) {
    clearInterval(state.timerId);
    location.reload(); // Cara paling bersih untuk reset ke menu
  }
});

document.getElementById('homeBtn').addEventListener('click', () => {
  location.reload();
});

document.getElementById('retryBtn').addEventListener('click', () => {
  document.getElementById('startBtn').click();
});

document.getElementById('skipBtn').addEventListener('click', () => {
  // Lewati dianggap salah atau tidak dapat nilai? 
  // Biasanya di kuis anak, lewati = tidak menjawab (0 poin atau penalti)
  // Di sini kita anggap timeout (salah) agar adil
  clearInterval(state.timerId);
  handleAnswer('SKIP', state.questions[state.currentQ].a, null);
});
```
