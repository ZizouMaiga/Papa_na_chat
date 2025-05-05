const examLink = window.location.pathname.split('/').pop();
let questions = [], current = 0, score = 0, student = { name: null, email: null, location: {} };

async function loadExam() {
  const examRes = await fetch('/api/exams/link/' + examLink);
  if (!examRes.ok) return document.getElementById('examContainer').innerHTML = '<p>Examen introuvable.</p>';
  const exam = await examRes.json();
  questions = await fetch(`/api/questions?examId=${exam._id}`).then(r => r.json());

  student.name = prompt('Entrez votre nom complet :');
  student.email = prompt('Entrez votre email :');
  if (!student.name || !student.email) return alert('Nom et email obligatoires !');

  try {
    const pos = await new Promise(resolve => navigator.geolocation.getCurrentPosition(
      p => resolve({ lat: p.coords.latitude, lon: p.coords.longitude }),
      () => resolve({ lat: null, lon: null })
    ));
    student.location = pos;
  } catch {
    student.location = { lat: null, lon: null };
  }

  showQuestion();
}

function showQuestion() {
  if (current >= questions.length) return finishExam();
  const q = questions[current];
  let html = `<h2>Question ${current + 1}</h2><p>${q.enonce}</p><div id="answers">`;

  if (q.type === 'qcm') {
    q.options.forEach(opt => {
      html += `<label><input type="checkbox" value="${opt}"> ${opt}</label>`;
    });
  } else {
    html += `<input type="text" id="directAnswer" placeholder="Votre réponse">`;
  }

  html += `</div><p>Temps restant : <span id="timer">${q.duree}</span> s</p><button onclick="submitAnswer()">Valider</button>`;
  document.getElementById('examContainer').innerHTML = html;

  let time = q.duree;
  const interval = setInterval(() => {
    time--;
    document.getElementById('timer').textContent = time;
    if (time <= 0) { clearInterval(interval); submitAnswer(); }
  }, 1000);
}

function levenshtein(a, b) {
  const m = a.length, n = b.length;
  const dp = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,
        dp[i][j - 1] + 1,
        dp[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)
      );
    }
  }
  return dp[m][n];
}

function submitAnswer() {
  const q = questions[current];
  let correct = false;

  if (q.type === 'directe') {
    const input = document.getElementById('directAnswer').value.trim().toLowerCase();
    const expected = q.reponse.trim().toLowerCase();
    const tol = q.tolerance || 0;
    correct = (levenshtein(input, expected) / expected.length * 100) <= tol;
  } else {
    const selected = Array.from(document.querySelectorAll('input[type=checkbox]:checked')).map(cb => cb.value);
    correct = JSON.stringify(selected.sort()) === JSON.stringify((q.bonnesReponses || []).sort());
  }

  if (correct) score += q.note;
  current++;
  showQuestion();
}

async function finishExam() {
  await fetch('/api/results', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      examId: questions[0].examId,
      studentName: student.name,
      studentEmail: student.email,
      location: student.location,
      score,
      answers: [] // Optionnel : tu peux stocker les réponses ici
    })
  });

  document.getElementById('examContainer').innerHTML = `<h2>Examen terminé</h2>
    <p>Merci ${student.name}, votre score est <strong>${score}/100</strong>.</p>`;
}

loadExam();
