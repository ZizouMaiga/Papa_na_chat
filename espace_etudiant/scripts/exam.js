// exam.js — version corrigée complète pour communication avec le backend (http://localhost:3000)

const urlParams = new URLSearchParams(window.location.search);
const examId = urlParams.get("id");
const apiUrl = `http://localhost:3000/api/exams/link/${examId}`;

let examData;
let currentQuestionIndex = 0;
let studentAnswers = [];

fetch(apiUrl)
  .then((res) => {
    if (!res.ok) {
      throw new Error("Examen introuvable");
    }
    return res.json();
  })
  .then((data) => {
    examData = data;
    document.getElementById("exam-title").textContent = examData.exam.title;
    document.getElementById("exam-description").textContent = examData.exam.description;
    showQuestion();
  })
  .catch((err) => {
    alert("Erreur: " + err.message);
  });

function showQuestion() {
  const question = examData.questions[currentQuestionIndex];
  const container = document.getElementById("question-container");
  container.innerHTML = "";

  const title = document.createElement("h2");
  title.textContent = `Question ${currentQuestionIndex + 1}`;
  container.appendChild(title);

  const statement = document.createElement("p");
  statement.textContent = question.statement;
  container.appendChild(statement);

  if (question.type === "qcm") {
    question.options.forEach((option, index) => {
      const label = document.createElement("label");
      const input = document.createElement("input");
      input.type = "radio";
      input.name = "qcmOption";
      input.value = index;
      label.appendChild(input);
      label.appendChild(document.createTextNode(option.text));
      container.appendChild(label);
      container.appendChild(document.createElement("br"));
    });
  } else if (question.type === "direct") {
    const input = document.createElement("input");
    input.type = "text";
    input.id = "directAnswer";
    container.appendChild(input);
  }

  const nextBtn = document.createElement("button");
  nextBtn.textContent = currentQuestionIndex < examData.questions.length - 1 ? "Suivant" : "Terminer";
  nextBtn.onclick = saveAnswer;
  container.appendChild(nextBtn);
}

function saveAnswer() {
  const question = examData.questions[currentQuestionIndex];
  let answer = null;

  if (question.type === "qcm") {
    const selected = document.querySelector("input[name='qcmOption']:checked");
    if (selected) {
      answer = parseInt(selected.value);
    }
  } else if (question.type === "direct") {
    answer = document.getElementById("directAnswer").value.trim();
  }

  studentAnswers.push({ index: currentQuestionIndex, answer });
  currentQuestionIndex++;

  if (currentQuestionIndex < examData.questions.length) {
    showQuestion();
  } else {
    finishExam();
  }
}

function finishExam() {
  const container = document.getElementById("question-container");
  container.innerHTML = "<h2>Merci ! Vous avez terminé l'examen.</h2>";
  console.log("Réponses de l'étudiant:", studentAnswers);

  // Facultatif : envoyer au backend
  /* fetch(`http://localhost:3000/api/submit`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ examId, answers: studentAnswers })
  })
    .then(res => res.json())
    .then(result => console.log("Résultat enregistré", result))
    .catch(err => console.error("Erreur d'envoi:", err)); */
}

