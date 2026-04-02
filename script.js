const QUESTIONS = [
  { category: "SCIENCE", text: "What is the chemical symbol for gold?", options: ["Au", "Ag", "Fe", "Cu"], answer: 0 },

  // 👇 ADD YOUR QUESTIONS HERE
  { category: "SCIENCE", text: "Which organ pumps blood?", options: ["Brain", "Heart", "Lungs", "Kidney"], answer: 1 },
  { category: "TECH", text: "Which company created JavaScript?", options: ["Google", "Netscape", "Microsoft", "Apple"], answer: 1 },
  { category: "GEOGRAPHY", text: "Largest desert?", options: ["Sahara", "Arctic", "Gobi", "Kalahari"], answer: 0 },
  { category: "HISTORY", text: "Who discovered America?", options: ["Columbus", "Newton", "Einstein", "Tesla"], answer: 0 },
  { category: "POP CULTURE", text: "How many Avengers?", options: ["4", "6", "8", "Many"], answer: 3 },
  { category: "SCIENCE", text: "Water formula?", options: ["H2O", "CO2", "O2", "NaCl"], answer: 0 },
  { category: "TECH", text: "What does CPU stand for?", options: ["Central Processing Unit", "Computer Personal Unit", "Central Performance Utility", "Control Program for Users"], answer: 0 },
  { category: "GEOGRAPHY", text: "Capital of France?", options: ["Berlin", "Madrid", "Paris", "Rome"], answer: 2 },
  { category: "HISTORY", text: "Year of the moon landing?", options: ["1965", "1969", "1972", "1980"], answer: 1 },
  { category: "POP CULTURE", text: "Who sings 'Shape of You'?", options: ["Ed Sheeran", "Adele", "Drake", "Taylor Swift"], answer: 0 }

];
const CIRC    = 2 * Math.PI * 20; // SVG circle circumference (r=20)
const LETTERS = ['A', 'B', 'C', 'D'];

let state         = {};
let timerInterval = null;

/* ─── HELPERS ─────────────────────────────────────── */
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById(id).classList.add('active');
}

/* ─── QUIZ FLOW ───────────────────────────────────── */
function startQuiz() {
    playSound(clickSound); 
 state = {
  questions: shuffle(QUESTIONS).slice(0, 10),
  current: 0,
  score: 0,
  correct: 0,
  wrong: 0,
  streak: 0,   // 🔥 NEW
  answered: false,
  timeLeft: 20,
};
  showScreen('quizScreen');
  loadQuestion();
}

function loadQuestion() {
  const q      = state.questions[state.current];
  state.answered = false;
  state.timeLeft = 20;

  // Header
  document.getElementById('qNum').textContent       = state.current + 1;
  document.getElementById('progressBar').style.width = `${(state.current / state.questions.length) * 100}%`;
  document.getElementById('liveScore').textContent   = state.score;

  // Question content
  document.getElementById('qCategory').textContent = q.category;
  document.getElementById('qText').textContent      = q.text;

  // Build options
  const grid = document.getElementById('optionsGrid');
  grid.innerHTML = '';
  q.options.forEach((opt, i) => {
    const btn       = document.createElement('button');
    btn.className   = 'option-btn';
    btn.innerHTML   = `<span class="opt-letter">${LETTERS[i]}</span><span>${opt}</span><span class="option-icon"></span>`;
    btn.onclick     = () => selectAnswer(i, btn);
    grid.appendChild(btn);
  });

  // Reset feedback & next button
  document.getElementById('feedbackBar').className = 'feedback-bar';
  document.getElementById('nextBtn').className     = 'btn-next';

  startTimer();
}
// 🔊 Sounds
const correctSound = new Audio("correct.mp3");
const wrongSound = new Audio("wrong.mp3");
const clickSound = new Audio("click.mp3");

function playSound(sound) {
  sound.currentTime = 0;
  sound.play();
}

/* ─── TIMER ───────────────────────────────────────── */
function startTimer() {
  clearInterval(timerInterval);
  updateTimerUI(20);
  timerInterval = setInterval(() => {
    state.timeLeft--;
    updateTimerUI(state.timeLeft);
    if (state.timeLeft <= 0) {
      clearInterval(timerInterval);
      if (!state.answered) timeOut();
    }
  }, 1000);
}

function updateTimerUI(t) {
  document.getElementById('timerNum').textContent            = t;
  const offset                                               = CIRC * (1 - t / 20);
  const circle                                               = document.getElementById('timerCircle');
  circle.style.strokeDashoffset                              = offset;
  circle.style.stroke                                        = t > 10 ? 'var(--accent)' : t > 5 ? '#ff9f40' : 'var(--accent2)';
  document.getElementById('timerNum').style.color            = t > 5 ? 'var(--text)' : 'var(--accent2)';
}

/* ─── ANSWER HANDLING ─────────────────────────────── */
function selectAnswer(idx, btn) {
  if (state.answered) return;
  state.answered = true;
  clearInterval(timerInterval);

  const q = state.questions[state.current];
  const btns = document.querySelectorAll('.option-btn');
  btns.forEach(b => (b.disabled = true));

  if (idx === q.answer) {
    playSound(correctSound);

    btn.classList.add('correct');
    btn.querySelector('.option-icon').textContent = '✓';

    state.correct++;
    state.streak++;

    let bonus = state.streak * 2;
    const pts = Math.ceil(state.timeLeft * 5 + bonus);

    state.score += pts;

    document.getElementById('liveScore').textContent = state.score;

    showFeedback(true, `+${pts} points 🔥 x${state.streak}`);
  } 
  else {
    playSound(wrongSound);

    state.streak = 0;

    btn.classList.add('wrong');
    btn.querySelector('.option-icon').textContent = '✗';

    btns[q.answer].classList.add('correct');
    btns[q.answer].querySelector('.option-icon').textContent = '✓';

    state.wrong++;
    showFeedback(false, `Answer: ${q.options[q.answer]}`);
  }

  // ✅ SHOW NEXT BUTTON HERE
  document.getElementById('nextBtn').className = 'btn-next show';
}

function timeOut() {
  state.answered = true;
  const q    = state.questions[state.current];
  const btns = document.querySelectorAll('.option-btn');
  btns.forEach(b => (b.disabled = true));
  btns[q.answer].classList.add('correct');
  btns[q.answer].querySelector('.option-icon').textContent = '✓';
  state.wrong++;
  showFeedback(false, `Answer: ${q.options[q.answer]}`, "⏰ Time's up!");
  document.getElementById('nextBtn').className = 'btn-next show';
}

function showFeedback(correct, hint, msgOverride) {
  const fb = document.getElementById('feedbackBar');
  document.getElementById('feedbackMsg').textContent = msgOverride || (correct ? '✦ Correct!' : '✗ Not quite');
  document.getElementById('feedbackHint').textContent = hint;
  fb.className = `feedback-bar show ${correct ? 'correct-fb' : 'wrong-fb'}`;
}

/* ─── NAVIGATION ──────────────────────────────────── */
function nextQuestion() {
  state.current++;
  if (state.current >= state.questions.length) {
    showResults();
  } else {
    loadQuestion();
  }
}

/* ─── RESULTS ─────────────────────────────────────── */
function showResults() {
  clearInterval(timerInterval);

  const total = state.questions.length;
  const pct   = Math.round((state.correct / total) * 100);

  let emoji, title, sub;
  if (pct >= 90) {
    emoji = '🏆'; title = 'LEGENDARY!'; sub = 'Outstanding performance — you crushed it!';
  } else if (pct >= 70) {
    emoji = '⭐'; title = 'WELL DONE!'; sub = 'Great knowledge — impressive score!';
  } else if (pct >= 50) {
    emoji = '👍'; title = 'NOT BAD!'; sub = 'Solid effort — keep pushing!';
  } else {
    emoji = '💪'; title = 'KEEP GOING!'; sub = 'Practice makes perfect — try again!';
  }

  // 👉 SET UI
  document.getElementById('resultEmoji').textContent = emoji;
  document.getElementById('resultTitle').textContent = title;
  document.getElementById('resultSub').textContent = sub;
  document.getElementById('resultPct').textContent = pct + '%';

  // 🎉 CONFETTI (ADD THIS PART)
  if (pct >= 70) {
    setTimeout(() => {
      confetti({
        particleCount: 150,
        spread: 100,
        startVelocity: 40,
        gravity: 0.8,
        origin: { y: 0.6 }
      });
    }, 300);
  }

  showScreen('resultScreen');
}

function restartQuiz() {
  showScreen('startScreen');
}
window.restartQuiz = restartQuiz;

