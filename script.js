/* --- PENTING: Pembungkus DOMContentLoaded --- */
// Ini memastikan bahwa semua elemen HTML (tombol, div, input) sudah dimuat
// dan tersedia di Document Object Model (DOM) sebelum JavaScript mencoba
// untuk mencari elemen tersebut menggunakan getElementById dan melampirkan event listener.
document.addEventListener('DOMContentLoaded', () => {

    /* --- LOGIKA BACKGROUND & MUSIM --- */
    const seasonSelect = document.getElementById('seasonSelect');
    const seasonalContainer = document.getElementById('seasonal');
    const backgroundLayer = document.getElementById('backgroundLayer'); 

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
            // Mengambil nama musim lama dari body class
            const oldSeason = currentBodyClass.includes('season-') ? currentBodyClass.replace('season-', '') : '';
            backgroundLayer.style.backgroundImage = getSeasonImageUrl(oldSeason);
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
    if (seasonSelect) {
        seasonSelect.addEventListener('change', (e) => {
            changeSeason(e.target.value);
        });
    }

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
    
    // Ambil elemen tombol navigasi secara eksplisit
    const startBtn = document.getElementById('startBtn');
    const quitBtn = document.getElementById('quitBtn');
    const homeBtn = document.getElementById('homeBtn');
    const retryBtn = document.getElementById('retryBtn');
    const skipBtn = document.getElementById('skipBtn');


    /**
     * UTILITY: Fungsi untuk menghasilkan kata acak yang terlihat seperti kata kerja atau kata benda.
     */
    function generateRandomValidishWord(length) {
        // Kombinasi vokal dan konsonan yang lebih baik untuk kata yang "bisa dibaca"
        const vowels = 'aeiou';
        const consonants = 'bcdfghjklmnpqrstvwxyz';
        let result = '';
        let isVowel = Math.random() < 0.5;
        
        for (let i = 0; i < length; i++) {
            if (isVowel) {
                result += vowels.charAt(Math.floor(Math.random() * vowels.length));
            } else {
                result += consonants.charAt(Math.floor(Math.random() * consonants.length));
            }
            isVowel = !isVowel; // Pergantian konsonan-vokal
        }
        // Kapitalisasi huruf pertama
        return result.charAt(0).toUpperCase() + result.slice(1);
    }

    /**
     * UTILITY: Fungsi untuk menghasilkan salah satu pilihan acak dari daftar kata dasar yang umum (tanpa database kosa kata spesifik)
     */
    function getRandomWordType(type) {
        // Kata-kata ini hanya untuk KATEGORI tata bahasa (Verb, Noun, Adj), BUKAN kosa kata
        const subjects = ['She', 'He', 'They', 'It', 'A_dog', 'The_car', 'The_girl', 'My_teacher', 'We', 'You'];
        const verbs = ['jump', 'run', 'eat', 'sleep', 'talk', 'read', 'sing', 'drive', 'play', 'walk', 'see'];
        const objects = ['ball', 'house', 'book', 'food', 'tree', 'movie', 'car', 'garden', 'phone', 'friend', 'school'];
        const adjectives = ['big', 'small', 'fast', 'slow', 'loud', 'quiet', 'happy', 'sad', 'blue', 'red', 'tall'];
        const adverbs = ['quickly', 'slowly', 'loudly', 'softly', 'today', 'yesterday', 'always', 'never'];
        const preps = ['in', 'on', 'at', 'under', 'over', 'by', 'next to', 'behind'];
        const conjunctions = ['and', 'but', 'or', 'because', 'so'];
        const timeWords = ['yesterday', 'tomorrow', 'now'];
        const qWords = ['What', 'Where', 'Who', 'How', 'When'];

        let words;
        switch (type) {
            case 'subject': words = subjects; break;
            case 'verb': words = verbs; break;
            case 'object': words = objects; break;
            case 'adj': words = adjectives; break;
            case 'adv': words = adverbs; break;
            case 'prep': words = preps; break;
            case 'conj': words = conjunctions; break;
            case 'time': words = timeWords; break;
            case 'qWord': words = qWords; break;
            case 'filler': return generateRandomValidishWord(4);
            default: return generateRandomValidishWord(5);
        }
        return words[Math.floor(Math.random() * words.length)].replace('_', ' ');
    }


    /**
     * GENERATOR SOAL ACAL MURNI
     * Fokus pada Struktur Bahasa Inggris, bukan Kosa Kata
     */
    function generateQuestions(grade, subject, level, total) {
        let questions = [];
        
        // --- MATH POOL (Disesuaikan Tingkat Kesulitan) ---
        const mathPool = {
            easy: () => { // Kelas 1-2: Penjumlahan/Pengurangan sampai 20 (Sangat Dasar)
                const type = Math.random() < 0.6 ? 'add' : 'sub'; // Lebih banyak Penjumlahan
                let n1 = Math.floor(Math.random() * 10) + 1;
                let n2 = Math.floor(Math.random() * 9) + 1; // Maksimal 10 + 9
                
                if (type === 'add') {
                    return { q: `${n1} + ${n2} = ?`, a: n1 + n2, type: 'math' };
                } else {
                    const [max, min] = [Math.max(n1, n2), Math.min(n1, n2)];
                    return { q: `${max} - ${min} = ?`, a: max - min, type: 'math' };
                }
            },
            medium: () => { // Kelas 3-4: Perkalian/Pembagian (Tabel Dasar), Penjumlahan/Pengurangan puluhan
                const rand = Math.random();
                if (rand < 0.35) { // Perkalian (Tabel 2-7)
                    let n1 = Math.floor(Math.random() * 6) + 2; // 2 sampai 7
                    let n2 = Math.floor(Math.random() * 8) + 2; // 2 sampai 9
                    return { q: `${n1} × ${n2} = ?`, a: n1 * n2, type: 'math' };
                } else if (rand < 0.6) { // Pembagian (Hasil bulat)
                    let n2 = Math.floor(Math.random() * 6) + 2;
                    let a = Math.floor(Math.random() * 7) + 3;
                    let n1 = n2 * a;
                    return { q: `${n1} : ${n2} = ?`, a: a, type: 'math' };
                } else { // Penjumlahan/Pengurangan puluhan (Lebih besar)
                    let n1 = Math.floor(Math.random() * 70) + 30; // 30-99
                    let n2 = Math.floor(Math.random() * 50) + 20; // 20-69
                    const [max, min] = [Math.max(n1, n2), Math.min(n1, n2)];
                    return { q: `${max} - ${min} = ?`, a: max - min, type: 'math' };
                }
            },
            hard: () => { // Kelas 5-6: Operasi Campuran, Bilangan Bulat Negatif (Kompleks)
                const type = Math.random();
                
                if (type < 0.5) { // Operasi Campuran (kali/bagi + tambah/kurang)
                    // Contoh: 3 + 4 x 5
                    let a = Math.floor(Math.random() * 8) + 2; 
                    let b = Math.floor(Math.random() * 7) + 2; 
                    let c = Math.floor(Math.random() * 15) + 5;
                    // Pastikan urutan operasi dipahami:
                    return { q: `${c} + ${a} × ${b} = ?`, a: c + (a * b), type: 'math' };
                } else { // Bilangan Bulat Negatif (dengan pengurangan/penggandaan)
                    let n1 = Math.floor(Math.random() * 20) - 10; // -10 sampai 9
                    let n2 = Math.floor(Math.random() * 10) + 1; // 1 sampai 10
                    const operation = Math.random() < 0.5 ? 'sub' : 'add';
                    
                    let q_text, result;
                    if (operation === 'add') {
                        result = n1 + n2;
                        q_text = `${n1} + ${n2} = ?`;
                    } else {
                        result = n1 - n2;
                        q_text = `${n1} - ${n2} = ?`;
                    }
                    
                    return { q: q_text, a: result, type: 'math' };
                }
            }
        };
        
        // --- ENGLISH POOL (Generator Tata Bahasa yang Ditingkatkan dan Bervariasi) ---
        const englishPool = {
            easy: () => { // Kelas 1-2: Kata Tunggal, Noun/Verb, Kata Tanya Sederhana, Artikel (A/An)
                const type = Math.random();
                
                if (type < 0.25) {
                    // Tipe 1: Identifikasi Kata Sifat (Adjective) - Kata Sifat Sederhana
                    const adj = getRandomWordType('adj');
                    const q = `Kata mana yang menggambarkan 'Sifat' (Adjective)?`;
                    const distractors = [getRandomWordType('verb'), getRandomWordType('object'), getRandomWordType('prep')];
                    return { q: q, a: adj, opts: [adj, ...distractors], type: 'en', answerType: 'adj' };
                } else if (type < 0.50) {
                    // Tipe 2: Kata Tanya Paling Dasar (Who, What)
                    const qType = Math.random() < 0.5 ? 'Who' : 'What';
                    const correctAns = qType;
                    const q = qType === 'Who' ? `Lengkapi: ____ is your mother?` : `Lengkapi: ____ color is the sun?`;
                    const distractors = [qType === 'Who' ? 'What' : 'Who', 'How', 'When'];
                    return { q: q, a: correctAns, opts: [correctAns, ...distractors], type: 'en' };
                } else if (type < 0.75) {
                    // Tipe 3: Plural/Singular Sederhana (Is/Are)
                    const isPlural = Math.random() < 0.5;
                    const subject = isPlural ? 'The dogs' : 'The boy';
                    const correctAns = isPlural ? 'are' : 'is';
                    const q = `Pilih kata bantu yang tepat: ${subject} ____ running.`;
                    const distractors = [isPlural ? 'is' : 'are', 'do', 'have'];
                    return { q: q, a: correctAns, opts: [correctAns, ...distractors], type: 'en' };
                } else {
                    // Tipe 4: Artikel A/An
                    const object = Math.random() < 0.5 ? 'apple' : 'cat'; // Kata vokal/konsonan
                    const correctAns = object.match(/^[aeiou]/i) ? 'an' : 'a';
                    const q = `Pilih artikel yang tepat: I see ____ ${object}.`;
                    const distractors = [correctAns === 'a' ? 'an' : 'a', 'the', 'some'];
                    return { q: q, a: correctAns, opts: [correctAns, ...distractors], type: 'en' };
                }
            },
            medium: () => { // Kelas 3-4: Simple Tense (Verb S/Tidak S), Preposisi Waktu/Tempat, Kata Ganti
                const type = Math.random();
                
                if (type < 0.25) {
                    // Tipe 1: Simple Present Tense (Verb dengan -s)
                    const verbBase = getRandomWordType('verb');
                    const subject = 'She'; 
                    const correctAns = `${verbBase}s`; 
                    const q = `Lengkapi kalimat (Simple Present): ${subject} ____ (${verbBase}) the ${getRandomWordType('object')} every day.`;
                    const distractors = [verbBase, `${verbBase}ing`, `${verbBase}ed`];
                    return { q: q, a: correctAns, opts: [correctAns, ...distractors], type: 'en' };
                } else if (type < 0.50) {
                    // Tipe 2: Preposisi Waktu (at/on/in)
                    const correctAns = Math.random() < 0.5 ? 'at' : 'on'; // at 7 o'clock / on Monday
                    const q = correctAns === 'at' ? `Kami bangun ____ 7 o'clock.` : `Pesta diadakan ____ Saturday.`;
                    const distractors = [correctAns === 'at' ? 'on' : 'at', 'in', 'by'];
                    return { q: q, a: correctAns, opts: [correctAns, ...distractors], type: 'en' };
                } else if (type < 0.75) {
                    // Tipe 3: Kata Ganti Sederhana (He/She/They)
                    const subjects = ['She', 'He', 'They'];
                    const correctAns = subjects[Math.floor(Math.random() * subjects.length)];
                    const q = `Kata ganti yang tepat untuk '${correctAns}' adalah...`;
                    // Distraktor harus berupa kata ganti lain yang mungkin
                    let pronoun;
                    switch (correctAns) {
                        case 'She': pronoun = 'He'; break;
                        case 'He': pronoun = 'She'; break;
                        case 'They': pronoun = 'We'; break;
                        default: pronoun = 'It';
                    }
                    return { q: q, a: correctAns, opts: [correctAns, pronoun, 'I', 'You'], type: 'en' };
                } else {
                    // Tipe 4: Simple Past Tense Sederhana (Verb-ed / Did)
                    const verb = 'walk';
                    const correctAns = verb + 'ed';
                    const q = `Bentuk kata kerja lampau (Past Tense) dari '${verb}' adalah...`;
                    const distractors = [verb, verb + 'ing', getRandomWordType('adj')];
                    return { q: q, a: correctAns, opts: [correctAns, ...distractors], type: 'en' };
                }
            },
            hard: () => { // Kelas 5-6: Bentuk Tense Campuran, Adverb/Adjective, Konjungsi Kompleks
                const type = Math.random();
                
                if (type < 0.25) {
                    // Tipe 1: Present Continuous vs Simple Present (Pola Waktu: now vs every day)
                    const isContinuous = Math.random() < 0.5;
                    const verbBase = 'run';
                    const correctAns = isContinuous ? 'is running' : 'runs';
                    const timeClue = isContinuous ? 'now' : 'every day';
                    const q = `Lengkapi: She ____ (${verbBase}) to school ${timeClue}.`;
                    const distractors = [isContinuous ? 'runs' : 'is running', verbBase, 'ran'];
                    return { q: q, a: correctAns, opts: [correctAns, ...distractors], type: 'en' };
                } else if (type < 0.50) {
                    // Tipe 2: Superlative Adjective (Paling)
                    const adj = 'tall'; 
                    const correctAns = 'tallest';
                    const q = `Pilih bentuk perbandingan (Superlative): John is the ____ boy in the class.`;
                    const distractors = [adj, 'taller', getRandomWordType('adv')];
                    return { q: q, a: correctAns, opts: [correctAns, ...distractors], type: 'en' };
                } else if (type < 0.75) {
                    // Tipe 3: Adverb vs Adjective (quickly/quick)
                    const verb = 'drive';
                    const correctAns = 'carefully'; // Contoh Adverb
                    const q = `Pilih kata yang tepat (Keterangan Cara): He drives the car ____.`;
                    const distractors = ['careful', 'loud', 'happy']; // Contoh Adjective
                    return { q: q, a: correctAns, opts: [correctAns, ...distractors], type: 'en' };
                } else {
                    // Tipe 4: Konjungsi Kompleks (But/Or/And/So) - Pilihan/Kontras
                    const correctAns = 'but'; // Contoh statis untuk Kontras
                    const q = `Pilih kata penghubung (Kontras): I want to go, ____ I am too busy.`;
                    const distractors = ['and', 'or', 'so'];
                    return { q: q, a: correctAns, opts: [correctAns, ...distractors], type: 'en' };
                }
            }
        };

        // Menambahkan logika untuk memastikan 10 soal unik dengan variasi dari tipe-tipe di atas
        const subjectPool = subject === 'math' ? mathPool[level] : englishPool[level];
        
        // Untuk soal Bahasa Inggris, kita akan membuat 10 soal unik secara berulang dengan variasi yang tinggi
        for (let i = 0; i < total; i++) {
            let qObj = subjectPool(); // Panggil pool yang sesuai
            let options = qObj.opts || [];

            if (subject === 'math') {
                // Logika distractor Math tetap sama
                if (options.length === 0) options.push(qObj.a);
                while (options.length < 4) {
                    let distractor = parseInt(qObj.a) + Math.floor(Math.random() * 10) - 5;
                    if (level === 'easy' && distractor <= 0 && parseInt(qObj.a) > 0) distractor = 1;
                    if (!options.includes(String(distractor)) && String(distractor) !== String(qObj.a)) {
                        options.push(String(distractor));
                    }
                }
            } else { 
                // Logika distractor English (Khusus untuk tipe soal yang tidak menyediakan opts)
                if (options.length === 0) options.push(qObj.a);
                    
                if (options.length < 4) {
                    // Generator distractor cadangan untuk memastikan 4 pilihan jika belum ada
                    while (options.length < 4) {
                        const distractor = getRandomWordType('filler');
                        if (!options.includes(distractor) && distractor !== qObj.a) options.push(distractor);
                    }
                }
            }
            
            // Soal yang dihasilkan (pastikan jawaban dan opsi berbentuk string)
            questions.push({q: qObj.q, a: String(qObj.a), opts: shuffleArray(options.map(String))});
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
    if (startBtn) {
        startBtn.addEventListener('click', () => {
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
            // startTimer dipanggil di dalam renderQuestion
        });
    }


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
            // Pastikan penanganan klik dipasang
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
            if(buttonElement) {
                // Perubahan: Menggunakan classList untuk gaya yang lebih baik
                buttonElement.classList.add('correct-answer-selected'); 
            }
        } else {
            state.score -= state.wrongPenalty;
            if(buttonElement) {
                // Perubahan: Menggunakan classList untuk gaya yang lebih baik
                buttonElement.classList.add('incorrect-answer-selected'); 
            }
            // Opsional: Tunjukkan jawaban yang benar
            Array.from(answersEl.children).forEach(btn => {
                if (String(btn.textContent) === String(correct)) {
                    // Perubahan: Menandai jawaban yang benar tanpa diklik
                    btn.classList.add('correct-answer-highlight'); 
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

    // Tombol Navigasi (Memeriksa keberadaan tombol sebelum melampirkan listener)
    if (quitBtn) {
        quitBtn.addEventListener('click', () => {
            if (confirm('Yakin ingin keluar? Skor Anda tidak akan disimpan.')) {
                clearInterval(state.timerId);
                mainMenu.classList.remove('hidden');
                quizView.classList.add('hidden');
                resultView.classList.add('hidden');
            }
        });
    }

    if (homeBtn) {
        homeBtn.addEventListener('click', () => {
            clearInterval(state.timerId);
            mainMenu.classList.remove('hidden');
            quizView.classList.add('hidden');
            resultView.classList.add('hidden');
        });
    }

    if (retryBtn) {
        retryBtn.addEventListener('click', () => {
            // Memastikan tombol 'startBtn' ditemukan sebelum mengklik
            const startButton = document.getElementById('startBtn');
            if (startButton) {
                startButton.click();
            }
        });
    }

    // Lewati Soal
    if (skipBtn) {
        skipBtn.addEventListener('click', () => {
            clearInterval(state.timerId); // Hentikan timer soal ini
            state.currentQ++;
            if (state.currentQ < state.totalQ) {
                renderQuestion();
            } else {
                endGame();
            }
        });
    }
});
