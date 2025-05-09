// Récupérer l'ID de l'examen depuis l'URL
const urlParams = new URLSearchParams(window.location.search);
const examId = urlParams.get('id');

let currentExam = null;
let currentQuestionIndex = 0;
let timer = null;
let userAnswers = [];

// Fonction pour charger l'examen
async function loadExam() {
    try {
        const response = await fetch(`http://localhost:3002/api/exams/${examId}`);
        const data = await response.json();
        
        if (data.success) {
            currentExam = data.exam;
            document.getElementById('titreExam').textContent = currentExam.title;
            document.getElementById('startBtn').style.display = 'block';
            // Attacher l'événement ici
            const startBtn = document.getElementById('startBtn');
            startBtn.onclick = () => {
                if (currentExam && currentExam.questions.length > 0) {
                    displayQuestion(0);
                }
            };
        } else {
            throw new Error('Impossible de charger l\'examen');
        }
    } catch (error) {
        document.getElementById('locationStatus').textContent = 
            'Erreur lors du chargement de l\'examen. Veuillez vérifier le lien.';
        console.error('Erreur:', error);
    }
}

// Fonction pour afficher une question
function displayQuestion(questionIndex) {
    const question = currentExam.questions[questionIndex];
    const container = document.getElementById('container');
    
    // Nettoyer le conteneur
    while (container.firstChild) {
        container.removeChild(container.firstChild);
    }
    
    // Créer les éléments de la question
    const questionDiv = document.createElement('div');
    questionDiv.className = 'question';
    
    const statement = document.createElement('h2');
    statement.textContent = `Question ${questionIndex + 1}: ${question.statement}`;
    questionDiv.appendChild(statement);
    
    const timerDiv = document.createElement('div');
    timerDiv.id = 'timer';
    timerDiv.textContent = `Temps restant: ${question.duration}s`;
    questionDiv.appendChild(timerDiv);
    
    // Créer les éléments selon le type de question
    if (question.type === 'qcm') {
        const optionsDiv = document.createElement('div');
        optionsDiv.className = 'options';
        
        question.options.forEach((option, index) => {
            const label = document.createElement('label');
            const input = document.createElement('input');
            input.type = 'radio';
            input.name = 'answer';
            input.value = index;
            label.appendChild(input);
            label.appendChild(document.createTextNode(option.text));
            optionsDiv.appendChild(label);
        });
        
        questionDiv.appendChild(optionsDiv);
    } else if (question.type === 'direct') {
        const input = document.createElement('input');
        input.type = 'text';
        input.id = 'directAnswer';
        input.placeholder = 'Votre réponse...';
        questionDiv.appendChild(input);
    }
    
    // Bouton pour soumettre
    const submitBtn = document.createElement('button');
    submitBtn.textContent = 'Soumettre';
    submitBtn.onclick = () => submitAnswer(false, true);
    questionDiv.appendChild(submitBtn);
    
    // Bouton next (suivant)
    if (questionIndex < currentExam.questions.length - 1) {
        const nextBtn = document.createElement('button');
        nextBtn.textContent = 'Suivant';
        nextBtn.style.marginLeft = '10px';
        nextBtn.onclick = () => submitAnswer(false, false);
        questionDiv.appendChild(nextBtn);
    }
    
    container.appendChild(questionDiv);
    
    // Démarrer le timer
    startTimer(question.duration);
}

// Fonction pour gérer le timer
function startTimer(duration) {
    let timeLeft = duration;
    
    clearInterval(timer);
    timer = setInterval(() => {
        timeLeft--;
        document.getElementById('timer').textContent = `Temps restant: ${timeLeft}s`;
        
        if (timeLeft <= 0) {
            clearInterval(timer);
            submitAnswer(true); // Force submission
        }
    }, 1000);
}

// Fonction pour soumettre une réponse
function submitAnswer(timeOut = false, showNext = false) {
    clearInterval(timer);
    const question = currentExam.questions[currentQuestionIndex];
    let answer;
    
    if (!timeOut) {
        if (question.type === 'qcm') {
            const selectedOption = document.querySelector('input[name="answer"]:checked');
            answer = selectedOption ? parseInt(selectedOption.value) : null;
        } else if (question.type === 'direct') {
            answer = document.getElementById('directAnswer').value;
        }
    } else {
        answer = null;
    }
    
    userAnswers[currentQuestionIndex] = answer;
    
    if (showNext && currentQuestionIndex < currentExam.questions.length - 1) {
        currentQuestionIndex++;
        displayQuestion(currentQuestionIndex);
    } else if (!showNext && currentQuestionIndex < currentExam.questions.length - 1) {
        currentQuestionIndex++;
        displayQuestion(currentQuestionIndex);
    } else if (currentQuestionIndex >= currentExam.questions.length - 1) {
        finishExam();
    }
}

// Fonction pour terminer l'examen
function finishExam() {
    let score = 0;
    let total = 0;
    currentExam.questions.forEach((q, i) => {
        // Ajout d'une vérification robuste pour les QCM
        if (q.type === 'qcm') {
            total += q.points;
            const userAnswerIndex = typeof userAnswers[i] === 'number' ? userAnswers[i] : null;
            if (
                userAnswerIndex !== null &&
                q.options[userAnswerIndex] &&
                q.options[userAnswerIndex].correct === true
            ) {
                score += q.points;
            }
        } else if (q.type === 'direct') {
            total += q.points;
            const userAnswer = (userAnswers[i] || '').toString().trim().toLowerCase();
            const correctAnswer = (q.directAnswer || '').toString().trim().toLowerCase();
            if (userAnswer && correctAnswer && userAnswer === correctAnswer) {
                score += q.points;
            }
        }
    });
    // Calcul du score sur 100
    let scoreSur100 = total > 0 ? Math.round((score * 100) / total) : 0;
    const container = document.getElementById('container');
    container.innerHTML = `<h2>Examen terminé</h2><p>Votre score : <b>${scoreSur100} / 100</b></p>`;
}

// Charger l'examen au chargement de la page
loadExam();
