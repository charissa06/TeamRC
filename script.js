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

    // Fungsi untuk transisi background
    function transitionSeasonBackground(newSeason) {
        // Hapus semua kelas musim dari body, hanya sisakan 'season-active' jika ada
        const oldSeasonClass = Array.from(document.body.classList).find(c => c.startsWith('season-'));
        if (oldSeasonClass) {
            document.body.classList.remove(oldSeasonClass);
        }

        // 1. Set backgroundLayer ke gambar saat ini dan mulai fade-out
        if (oldSeasonClass) {
            // Hanya fade out jika ada season sebelumnya
            backgroundLayer.style.backgroundImage = getSeasonImageUrl(oldSeasonClass.replace('season-', ''));
            backgroundLayer.classList.add('fade-out');
        }

        // 2. Set background baru setelah delay (durasi fade out)
        setTimeout(() => {
            // Terapkan kelas baru ke body
            document.body.classList.add('season-' + newSeason);
            
            // Set backgroundLayer ke gambar baru dan fade-in (dengan menghapus fade-out)
            backgroundLayer.style.backgroundImage = getSeasonImageUrl(newSeason);
            backgroundLayer.classList.remove('fade-out'); 
        }, oldSeasonClass ? 500 : 0); // Durasi transisi 0.5s. Jika pertama kali, tidak perlu delay.
    }

    // Fungsi ganti background & efek (memanggil transitionSeasonBackground)
    function changeSeason(season) {
        transitionSeasonBackground(season); 
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


    /* ---------------------------------- */
    /* --- LOGIKA KUIS (GAME) - PERBAIKAN */
    /* ---------------------------------- */
    let state = {
        name: 'Anak',
        age: 8,
        grade: 1,
        subject: 'math',
        level: 'easy',
        score: 0,
        currentQ: 0,
        totalQ: 10, 
        perQuestion: 10,
        wrongPenalty: 5,
        timeLeft: 30,
        timerId: null,
        questions: []
    };

    // DOM Elements (Pastikan ID ini ada di HTML Anda)
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


    /**
     * UTILITY: Fungsi untuk menghasilkan kata acak yang terlihat seperti kata kerja atau kata benda.
     */
    function generateRandomValidishWord(length) {
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
            isVowel = !isVowel; 
        }
        return result.charAt(0).toUpperCase() + result.slice(1);
    }

    /**
     * UTILITY: Fungsi untuk menghasilkan salah satu pilihan acak dari daftar kata dasar yang umum
     */
    function getRandomWordType(type) {
        const subjects = ['She', 'He', 'They', 'It', 'A_dog', 'The_car', 'The_girl', 'My_teacher', 'We', 'You'];
        const verbs = ['jump', 'run', 'eat', 'sleep', 'talk', 'read', 'sing', 'drive', 'play', 'walk', 'see'];
        const objects = ['ball', 'house', 'book', 'food', 'tree', 'movie', 'car', 'garden', 'phone', 'friend', 'school'];
        const adjectives = ['big', 'small', 'fast', 'slow', 'loud', 'quiet', 'happy', 'sad', 'blue', 'red', 'tall', 'easy', 'cold', 'hot', 'new', 'old'];
        const adverbs = ['quickly', 'slowly', 'loudly', 'softly', 'always', 'never', 'usually', 'often'];
        const preps = ['in', 'on', 'at', 'under', 'over', 'by', 'next to', 'behind', 'with', 'for'];
        const conjunctions = ['and', 'but', 'or', 'because', 'so'];
        const timeWords = ['yesterday', 'tomorrow', 'now'];
        const qWords = ['What', 'Where', 'Who', 'How', 'When'];

        let word;
        switch (type) {
            case 'subject': word = subjects; break;
            case 'verb': word = verbs; break;
            case 'object': word = objects; break;
            case 'adj': word = adjectives; break;
            case 'adv': word = adverbs; break;
            case 'prep': word = preps; break;
            case 'conj': word = conjunctions; break;
            case 'time': word = timeWords; break;
            case 'qWord': word = qWords; break;
            case 'filler': return generateRandomValidishWord(4);
            default: return generateRandomValidishWord(5);
        }
        return word[Math.floor(Math.random() * word.length)].replace('_', ' ');
    }


    /**
     * GENERATOR SOAL ACAL MURNI
     */
    function generateQuestions(grade, subject, level, total) {
        let questions = [];
        
        // --- MATH POOL --- (Sama seperti sebelumnya, ini sudah baik)
        const mathPool = {
            easy: () => { 
                const type = Math.random() < 0.6 ? 'add' : 'sub'; 
                let n1 = Math.floor(Math.random() * 10) + 1;
                let n2 = Math.floor(Math.random() * 9) + 1; 
                
                if (type === 'add') {
                    return { q: `${n1} + ${n2} = ?`, a: n1 + n2, type: 'math' };
                } else {
                    const [max, min] = [Math.max(n1, n2), Math.min(n1, n2)];
                    return { q: `${max} - ${min} = ?`, a: max - min, type: 'math' };
                }
            },
            medium: () => { 
                const rand = Math.random();
                if (rand < 0.35) { 
                    let n1 = Math.floor(Math.random() * 6) + 2; 
                    let n2 = Math.floor(Math.random() * 8) + 2; 
                    return { q: `${n1} × ${n2} = ?`, a: n1 * n2, type: 'math' };
                } else if (rand < 0.6) { 
                    let n2 = Math.floor(Math.random() * 6) + 2;
                    let a = Math.floor(Math.random() * 7) + 3;
                    let n1 = n2 * a;
                    return { q: `${n1} : ${n2} = ?`, a: a, type: 'math' };
                } else { 
                    let n1 = Math.floor(Math.random() * 70) + 30; 
                    let n2 = Math.floor(Math.random() * 50) + 20; 
                    const [max, min] = [Math.max(n1, n2), Math.min(n1, n2)];
                    return { q: `${max} - ${min} = ?`, a: max - min, type: 'math' };
                }
            },
            hard: () => { 
                const type = Math.random();
                
                if (type < 0.5) { 
                    let a = Math.floor(Math.random() * 8) + 2; 
                    let b = Math.floor(Math.random() * 7) + 2; 
                    let c = Math.floor(Math.random() * 15) + 5;
                    return { q: `${c} + ${a} × ${b} = ?`, a: c + (a * b), type: 'math' };
                } else { 
                    let n1 = Math.floor(Math.random() * 20) - 10; 
                    let n2 = Math.floor(Math.random() * 10) + 1; 
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
        
        // --- ENGLISH POOL (Perbaikan Variasi) ---
        const englishPool = {
            easy: () => { 
                const type = Math.random();
                
                if (type < 0.25) {
                    // Tipe 1: Identifikasi Kata Benda (Noun)
                    const noun = getRandomWordType('object');
                    const q = `Kata mana yang merupakan 'Benda' (Noun)?`;
                    const distractors = [getRandomWordType('verb'), getRandomWordType('adj'), getRandomWordType('prep')];
                    return { q: q, a: noun, opts: [noun, ...distractors], type: 'en', answerType: 'noun' };
                } else if (type < 0.50) {
                    // Tipe 2: Singular/Plural Tobe (Is/Are)
                    const isPlural = Math.random() < 0.5;
                    const subject = isPlural ? 'The friends' : 'The cat';
                    const correctAns = isPlural ? 'are' : 'is';
                    const q = `Pilih kata bantu yang tepat: ${subject} ____ watching TV.`;
                    const distractors = [isPlural ? 'is' : 'are', 'do', 'have'];
                    return { q: q, a: correctAns, opts: [correctAns, ...distractors], type: 'en' };
                } else if (type < 0.75) {
                    // Tipe 3: Kata Ganti Objek (Me/Him/Her)
                    const correctAns = Math.random() < 0.5 ? 'me' : 'him'; // Hanya contoh
                    const q = `Pilih kata ganti objek: She gave the book to ____.`;
                    const distractors = [correctAns, correctAns === 'me' ? 'I' : 'he', 'she', 'us'];
                    shuffleArray(distractors);
                    return { q: q, a: correctAns, opts: distractors, type: 'en' };
                } else {
                    // Tipe 4: Artikel A/An
                    const object = Math.random() < 0.5 ? 'umbrella' : 'book'; 
                    const correctAns = object.match(/^[aeiou]/i) ? 'an' : 'a';
                    const q = `Pilih artikel yang tepat: I see ____ ${object}.`;
                    const distractors = [correctAns === 'a' ? 'an' : 'a', 'the', 'some'];
                    return { q: q, a: correctAns, opts: [correctAns, ...distractors], type: 'en' };
                }
            },
            medium: () => { 
                const type = Math.random();
                
                if (type < 0.30) {
                    // Tipe 1: Simple Present Tense (Do/Does)
                    const isSingular = Math.random() < 0.5;
                    const subject = isSingular ? 'He' : 'They'; 
                    const correctAns = isSingular ? 'does' : 'do'; 
                    const q = `Lengkapi kalimat (Simple Present): ____ ${subject} like to ${getRandomWordType('verb')}?`;
                    const distractors = [isSingular ? 'do' : 'does', 'is', 'are'];
                    return { q: q, a: correctAns, opts: [correctAns, ...distractors], type: 'en' };
                } else if (type < 0.60) {
                    // Tipe 2: Simple Past Tense (Irregular Verb Sederhana)
                    const baseVerb = 'go'; 
                    const correctAns = 'went';
                    const q = `Bentuk kata kerja lampau (Past Tense) dari '${baseVerb}' adalah...`;
                    const distractors = [baseVerb, 'goed', getRandomWordType('adj')];
                    return { q: q, a: correctAns, opts: [correctAns, ...distractors], type: 'en' };
                } else {
                    // Tipe 3: Preposisi Tempat (in/on/at)
                    const correctAns = Math.random() < 0.5 ? 'in' : 'on'; 
                    const noun = correctAns === 'in' ? 'the box' : 'the table';
                    const q = `Kucing itu ada ____ ${noun}.`;
                    const distractors = [correctAns === 'in' ? 'on' : 'in', 'at', 'with'];
                    return { q: q, a: correctAns, opts: [correctAns, ...distractors], type: 'en' };
                }
            },
            hard: () => { 
                const type = Math.random();
                
                if (type < 0.25) {
                    // Tipe 1: Adverb vs Adjective
                    const verb = getRandomWordType('verb');
                    const correctAns = 'quickly'; 
                    const q = `Pilih kata yang tepat (Keterangan Cara): She ${verb} ____.`;
                    const distractors = ['quick', 'loud', 'happy']; 
                    return { q: q, a: correctAns, opts: [correctAns, ...distractors], type: 'en' };
                } else if (type < 0.50) {
                    // Tipe 2: Comparative Adjective (Perbandingan -er)
                    const adj = 'small'; 
                    const correctAns = 'smaller';
                    const q = `Pilih bentuk perbandingan (Comparative): This toy is ____ than that one.`;
                    const distractors = [adj, 'smallest', 'most small'];
                    return { q: q, a: correctAns, opts: [correctAns, ...distractors], type: 'en' };
                } else if (type < 0.75) {
                    // Tipe 3: Present Continuous Tense (Am/Is/Are + V-ing)
                    const subject = 'We';
                    const correctAns = 'are sleeping'; 
                    const q = `Lengkapi kalimat: ${subject} ____ (${getRandomWordType('verb')}) right now.`;
                    const distractors = ['is sleeping', 'sleep', 'slept']; 
                    return { q: q, a: correctAns, opts: [correctAns, ...distractors], type: 'en' };
                } else {
                    // Tipe 4: Konjungsi Kompleks (Because/So) - Sebab Akibat
                    const correctAns = 'because'; 
                    const q = `Pilih kata penghubung (Sebab): I stayed home ____ it was raining heavily.`;
                    const distractors = ['so', 'but', 'or'];
                    return { q: q, a: correctAns, opts: [correctAns, ...distractors], type: 'en' };
                }
            }
        };

        const subjectPool = subject === 'math' ? mathPool[level] : englishPool[level];
        
        for (let i = 0; i < total; i++) {
            let qObj = subjectPool(); 
            let options = qObj.opts || [];

            if (subject === 'math') {
                if (options.length === 0) options.push(qObj.a);
                while (options.length < 4) {
                    let distractor = parseInt(qObj.a) + Math.floor(Math.random() * 10) - 5;
                    // Pastikan distractor Math tidak sama
                    if (!options.includes(String(distractor)) && String(distractor) !== String(qObj.a)) {
                        options.push(String(distractor));
                    }
                }
            } else { 
                // Generator distractor cadangan untuk memastikan 4 pilihan jika belum ada
                if (options.length === 0) options.push(qObj.a);
                while (options.length < 4) {
                    const distractor = getRandomWordType('filler');
                    if (!options.includes(distractor) && distractor.toLowerCase() !== String(qObj.a).toLowerCase()) options.push(distractor);
                }
            }
            
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
    startBtn.addEventListener('click', () => {
        const nameInput = document.getElementById('nameInput');
        const ageInput = document.getElementById('ageInput');
        const gradeSelect = document.getElementById('gradeSelect');
        const subjectSelect = document.getElementById('subjectSelect');
        const levelSelect = document.getElementById('levelSelect');

        state.name = nameInput.value.trim() || 'Anak';
        state.age = parseInt(ageInput.value) || 8;
        state.grade = parseInt(gradeSelect.value);
        state.subject = subjectSelect.value;
        state.level = levelSelect.value;
        state.totalQ = 10; 
        totalQuestionsNum.textContent = state.totalQ; 

        state.questions = generateQuestions(state.grade, state.subject, state.level, state.totalQ);
        state.score = 0;
        state.currentQ = 0;
        state.timeLeft = 30; 
        timerEl.textContent = state.timeLeft; 

        playerNameDisplay.textContent = state.name;
        subjectDisplay.textContent = (state.subject === 'math') ? 'Matematika' : 'Bahasa Inggris';

        mainMenu.classList.add('hidden');
        quizView.classList.remove('hidden');
        resultView.classList.add('hidden');
        
        renderQuestion();
        // startTimer dipanggil di dalam renderQuestion
    });

    function renderQuestion() {
        const q = state.questions[state.currentQ];
        questionText.textContent = q.q;
        currentQuestionNum.textContent = state.currentQ + 1;
        scoreEl.textContent = state.score;
        
        const pct = (state.currentQ / state.totalQ) * 100;
        progressFill.style.width = pct + '%';

        answersEl.innerHTML = '';
        q.opts.forEach(opt => {
            const btn = document.createElement('button');
            btn.textContent = opt;
            btn.onclick = () => handleAnswer(opt, q.a, btn);
            answersEl.appendChild(btn);
        });

        // Reset dan Mulai timer untuk setiap soal
        clearInterval(state.timerId);
        state.timeLeft = 30;
        timerEl.textContent = state.timeLeft;
        startTimer();
    }

    function handleAnswer(selected, correct, buttonElement) {
        // PERBAIKAN: DISABLE SEMUA TOMBOL (Ini adalah perilaku yang benar, mencegah double-click)
        Array.from(answersEl.children).forEach(btn => btn.disabled = true);

        if (String(selected) === String(correct)) {
            state.score += state.perQuestion;
            if(buttonElement) {
                buttonElement.classList.add('correct');
            }
        } else {
            // Jika waktu habis (selected='TIMEOUT'), jangan berikan penalti dan jangan highlight tombol yang salah
            if(selected !== 'TIMEOUT') {
                state.score -= state.wrongPenalty;
                if(buttonElement) {
                    buttonElement.classList.add('incorrect');
                }
            }
            
            // Tunjukkan jawaban yang benar
            Array.from(answersEl.children).forEach(btn => {
                if (String(btn.textContent) === String(correct)) {
                    btn.classList.add('correct-highlight'); // Kelas baru untuk highlight
                }
            });
        }
        scoreEl.textContent = state.score; 

        setTimeout(() => {
            state.currentQ++;
            if (state.currentQ < state.totalQ) {
                renderQuestion();
            } else {
                endGame();
            }
        }, 1500); // Tunggu lebih lama (1.5 detik) agar pengguna sempat melihat jawaban
    }

    function startTimer() {
        clearInterval(state.timerId);
        state.timerId = setInterval(() => {
            state.timeLeft--;
            timerEl.textContent = state.timeLeft;
            if (state.timeLeft <= 0) {
                clearInterval(state.timerId);
                // Waktu habis, pindah ke soal berikutnya tanpa penalti
                handleAnswer('TIMEOUT', state.questions[state.currentQ].a, null); 
            }
        }, 1000);
    }

    function endGame() {
        clearInterval(state.timerId);
        quizView.classList.add('hidden');
        resultView.classList.remove('hidden');
        
        const finalCalculatedScore = Math.max(0, state.score); 
        finalScoreEl.textContent = finalCalculatedScore;
        
        const maxScore = state.totalQ * state.perQuestion;
        const percentage = (finalCalculatedScore / maxScore) * 100;
        let message = '';
        if (percentage >= 80) message = "Luar Biasa! Kamu hebat sekali! 🏆";
        else if (percentage >= 50) message = "Bagus sekali! Terus berlatih ya! 👍";
        else message = "Jangan menyerah! Ayo coba lagi! 💪";
        resultMessageEl.textContent = message;

        // Pastikan progress bar juga terisi penuh saat selesai
        progressFill.style.width = '100%';
    }

    // Tombol Navigasi (Event listeners menggunakan variabel DOM yang sudah diambil di awal)
    quitBtn.addEventListener('click', () => {
        if (confirm('Yakin ingin keluar? Skor Anda tidak akan disimpan.')) {
            clearInterval(state.timerId);
            mainMenu.classList.remove('hidden');
            quizView.classList.add('hidden');
            resultView.classList.add('hidden');
        }
    });

    homeBtn.addEventListener('click', () => {
        clearInterval(state.timerId);
        mainMenu.classList.remove('hidden');
        quizView.classList.add('hidden');
        resultView.classList.add('hidden');
    });

    retryBtn.addEventListener('click', () => {
        document.getElementById('startBtn').click();
    });

    // Lewati Soal
    skipBtn.addEventListener('click', () => {
        clearInterval(state.timerId); 
        state.currentQ++;
        if (state.currentQ < state.totalQ) {
            renderQuestion();
        } else {
            endGame();
        }
    });
});
