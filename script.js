/* --- LOGIKA BACKGROUND & MUSIM --- */
const seasonSelect = document.getElementById('seasonSelect');
const seasonalContainer = document.getElementById('seasonal');
const backgroundLayer = document.getElementById('backgroundLayer'); // Elemen baru untuk transisi

// Daftar emoji jatuh sesuai musim
const seasonEmojis = {
  spring: ['🌸', '🌹', '🌷', '🐝'],
  summer: ['☀️', '🌻', '🍦', '🌊'],
  autumn: ['🍁', '🍂', '🍄', '🌰'],
  winter: ['❄️', '⛄', '🧊', '🧤']
};

// Fungsi untuk transisi background
function transitionSeasonBackground(newSeason) {
  const currentBodyClass = document.body.className;
  
  // Jika ini bukan perubahan pertama, fade out background lama
  if (currentBodyClass) {
    backgroundLayer.classList.add('fade-out'); // Mulai fade out
    backgroundLayer.style.backgroundImage = getSeasonImageUrl(currentBodyClass.replace('season-', ''));
  }

  // Setelah fade out selesai (atau segera jika ini yang pertama), ganti background dan fade in
  setTimeout(() => {
    // Hapus kelas musim lama dari body dan tambahkan yang baru
    document.body.className = '';
    document.body.classList.add('season-' + newSeason);
    
    // Set background image baru untuk backgroundLayer dan fade in
    backgroundLayer.style.backgroundImage = getSeasonImageUrl(newSeason);
    backgroundLayer.classList.remove('fade-out'); // Fade in
  }, 500); // Durasi transisi CSS (0.5s)
}

// Helper untuk mendapatkan URL gambar berdasarkan musim
function getSeasonImageUrl(season) {
  switch(season) {
    case 'spring': return 'url("semi.jpg")';
    case 'summer': return 'url("pans.jfif")';
    case 'autumn': return 'url("ggr.jfif")';
    case 'winter': return 'url("dgin.jpg")';
    default: return 'none';
  }
}

// Fungsi ganti background & efek (memanggil transitionSeasonBackground)
function changeSeason(season) {
  transitionSeasonBackground(season); // Menggunakan fungsi transisi baru
  createFallingEffect(season);
}

function createFallingEffect(season) {
  seasonalContainer.innerHTML = ''; // bersihkan efek lama
  const emojis = seasonEmojis[season];
  const count = 15; // jumlah item jatuh

  for(let i=0; i<count; i++) {
    const el = document.createElement('div');
    el.className = 'falling-item';
    el.textContent = emojis[Math.floor(Math.random() * emojis.length)];
    el.style.left = Math.random() * 100 + 'vw';
    el.style.fontSize = (Math.random() * 20 + 20) + 'px';
    el.style.animationDuration = (Math.random() * 5 + 5) + 's'; // kecepatan 5-10 detik
    el.style.animationDelay = Math.random() * 5 + 's';
    el.style.top = -10 - Math.random() * 20 + 'vh'; // Mulai dari atas layar
    seasonalContainer.appendChild(el);
  }
}

// Event Listener saat dropdown berubah
seasonSelect.addEventListener('change', (e) => {
  changeSeason(e.target.value);
});

// Jalankan saat pertama kali load
changeSeason('spring');


/* --- LOGIKA KUIS (GAME) --- */
let state = {
  name: 'Anak',
  age: 8,
  grade: 1,
  subject: 'math',
  level: 'easy',
  score: 0,
  currentQ: 0,
  totalQ: 10, // Mengubah totalQ menjadi 10
  perQuestion: 10,
  wrongPenalty: 5,
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

// Generator Soal Sederhana (diperbaiki agar lebih dinamis)
function generateQuestions(grade, subject, level, total) {
  let questions = [];
  const mathPool = {
    easy: () => {
      let n1 = Math.floor(Math.random() * 10) + 1;
      let n2 = Math.floor(Math.random() * 10) + 1;
      return { q: `${n1} + ${n2} = ?`, a: n1 + n2 };
    },
    medium: () => {
      let n1 = Math.floor(Math.random() * 20) + 1;
      let n2 = Math.floor(Math.random() * 10) + 1;
      return { q: `${n1} - ${n2} = ?`, a: n1 - n2 };
    },
    hard: () => {
      let n1 = Math.floor(Math.random() * 10) + 2;
      let n2 = Math.floor(Math.random() * 10) + 2;
      return { q: `${n1} × ${n2} = ?`, a: n1 * n2 };
    }
  };

  const englishPool = {
    easy: () => {
      const vocab = [{w:"Apple",t:"Apel"},{w:"Cat",t:"Kucing"},{w:"Dog",t:"Anjing"},{w:"Book",t:"Buku"},{w:"Blue",t:"Biru"}];
      const item = vocab[Math.floor(Math.random()*vocab.length)];
      return { q: `Apa arti "${item.w}"?`, a: item.t };
    },
    medium: () => {
      const phrases = [{w:"Good morning",t:"Selamat pagi"},{w:"Thank you",t:"Terima kasih"},{w:"How are you?",t:"Apa kabar?"}];
      const item = phrases[Math.floor(Math.random()*phrases.length)];
      return { q: `Terjemahkan: "${item.w}"`, a: item.t };
    },
    hard: () => {
      const sent = [{w:"The sun is shining brightly.",t:"Matahari bersinar terang."}, {w:"Birds are singing in the trees.",t:"Burung-burung bernyanyi di pohon."}];
      const item = sent[Math.floor(Math.random()*sent.length)];
      return { q: `Apa arti kalimat "${item.w}"?`, a: item.t };
    }
  };

  for (let i = 0; i < total; i++) {
    let qObj;
    if (subject === 'math') {
      qObj = mathPool[level]();
      // Generate distractors for math
      qObj.opts = [qObj.a];
      while (qObj.opts.length < 4) {
        let distractor = qObj.a + Math.floor(Math.random() * 10) - 5;
        if (distractor < 0) distractor = 0;
        if (!qObj.opts.includes(distractor)) qObj.opts.push(distractor);
      }
    } else { // English
      qObj = englishPool[level]();
      // Generate distractors for English
      qObj.opts = [qObj.a];
      const allTranslations = (subject === 'math' ? [] : englishPool.easy().t + englishPool.medium().t + englishPool.hard().t); // Placeholder for a real translation pool
      while (qObj.opts.length < 4) {
        let distractor = "Pilihan Salah " + Math.floor(Math.random() * 10); // Simple placeholder
        if (!qObj.opts.includes(distractor)) qObj.opts.push(distractor);
      }
    }
    questions.push({q: qObj.q, a: String(qObj.a), opts: shuffleArray(qObj.opts.map(String))});
  }
  return questions;
}

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

// Mulai Game
document.getElementById('startBtn').addEventListener('click', () => {
  state.name = document.getElementById('nameInput').value.trim() || 'Anak';
  state.age = parseInt(document.getElementById('ageInput').value) || 8;
  state.grade = parseInt(document.getElementById('gradeSelect').value);
  state.subject = document.getElementById('subjectSelect').value;
  state.level = document.getElementById('levelSelect').value;
  state.totalQ = 10; // Set kembali ke 10 soal
  totalQuestionsNum.textContent = state.totalQ; // Update di UI

  state.questions = generateQuestions(state.grade, state.subject, state.level, state.totalQ);
  state.score = 0;
  state.currentQ = 0;
  state.timeLeft = 30; // Reset waktu
  timerEl.textContent = state.timeLeft; // Update UI timer

  playerNameDisplay.textContent = state.name;
  subjectDisplay.textContent = (state.subject === 'math') ? 'Matematika' : 'Bahasa Inggris';

  mainMenu.classList.add('hidden');
  quizView.classList.remove('hidden');
  resultView.classList.add('hidden');
  
  renderQuestion();
  startTimer();
});

function renderQuestion() {
  const q = state.questions[state.currentQ];
  questionText.textContent = q.q;
  currentQuestionNum.textContent = state.currentQ + 1;
  scoreEl.textContent = state.score;
  
  // Update progress bar
  const pct = (state.currentQ / state.totalQ) * 100;
  progressFill.style.width = pct + '%';

  answersEl.innerHTML = '';
  q.opts.forEach(opt => {
    const btn = document.createElement('button');
    btn.textContent = opt;
    btn.onclick = () => handleAnswer(opt, q.a, btn);
    answersEl.appendChild(btn);
  });

  // Reset timer untuk setiap soal
  clearInterval(state.timerId);
  state.timeLeft = 30;
  timerEl.textContent = state.timeLeft;
  startTimer();
}

function handleAnswer(selected, correct, buttonElement) {
  // Disable semua tombol jawaban setelah dipilih
  Array.from(answersEl.children).forEach(btn => btn.disabled = true);

  if (String(selected) === String(correct)) {
    state.score += state.perQuestion;
    buttonElement.style.backgroundColor = '#d4edda'; // Hijau muda untuk benar
    buttonElement.style.borderColor = '#28a745';
  } else {
    state.score -= state.wrongPenalty;
    buttonElement.style.backgroundColor = '#f8d7da'; // Merah muda untuk salah
    buttonElement.style.borderColor = '#dc3545';
    // Opsional: Tunjukkan jawaban yang benar
    Array.from(answersEl.children).forEach(btn => {
      if (String(btn.textContent) === String(correct)) {
        btn.style.borderColor = '#28a745'; // Garis hijau untuk jawaban benar
      }
    });
  }
  scoreEl.textContent = state.score; // Update skor di UI

  setTimeout(() => {
    state.currentQ++;
    if (state.currentQ < state.totalQ) {
      renderQuestion();
    } else {
      endGame();
    }
  }, 1000); // Tunggu 1 detik sebelum soal berikutnya
}

function startTimer() {
  clearInterval(state.timerId);
  state.timerId = setInterval(() => {
    state.timeLeft--;
    timerEl.textContent = state.timeLeft;
    if (state.timeLeft <= 0) {
      clearInterval(state.timerId);
      // Jika waktu habis, anggap salah dan langsung ke soal berikutnya
      handleAnswer('TIMEOUT', state.questions[state.currentQ].a, null); // Pass null for button
    }
  }, 1000);
}

function endGame() {
  clearInterval(state.timerId);
  quizView.classList.add('hidden');
  resultView.classList.remove('hidden');
  
  const finalCalculatedScore = Math.max(0, state.score); // Pastikan skor tidak minus
  finalScoreEl.textContent = finalCalculatedScore;
  
  const percentage = (finalCalculatedScore / (state.totalQ * state.perQuestion)) * 100;
  let message = '';
  if (percentage >= 80) message = "Luar Biasa! Kamu hebat sekali! 🏆";
  else if (percentage >= 50) message = "Bagus sekali! Terus berlatih ya! 👍";
  else message = "Jangan menyerah! Ayo coba lagi! 💪";
  resultMessageEl.textContent = message;
}

// Tombol Navigasi
document.getElementById('quitBtn').addEventListener('click', () => {
  if (confirm('Yakin ingin keluar? Skor Anda tidak akan disimpan.')) {
    clearInterval(state.timerId);
    mainMenu.classList.remove('hidden');
    quizView.classList.add('hidden');
    resultView.classList.add('hidden');
  }
});

document.getElementById('homeBtn').addEventListener('click', () => {
  clearInterval(state.timerId);
  mainMenu.classList.remove('hidden');
  quizView.classList.add('hidden');
  resultView.classList.add('hidden');
});

document.getElementById('retryBtn').addEventListener('click', () => {
  // Langsung panggil logika startBtn untuk memulai ulang dengan pengaturan yang sama
  document.getElementById('startBtn').click();
});

// Lewati Soal
document.getElementById('skipBtn').addEventListener('click', () => {
  clearInterval(state.timerId); // Hentikan timer soal ini
  state.currentQ++;
  if (state.currentQ < state.totalQ) {
    renderQuestion();
  } else {
    endGame();
  }
});
  
