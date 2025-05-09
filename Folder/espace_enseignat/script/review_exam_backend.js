document.addEventListener("DOMContentLoaded", async () => {
    const examId = localStorage.getItem('currentExamId');
    const container = document.getElementById('reviewContainer');
  
    if (!examId) {
      container.innerHTML = "<p>❌ Aucun examen sélectionné.</p>";
      return;
    }
  
    try {
      const response = await fetch(`http://localhost:3002/api/questions/${examId}`);
      const result = await response.json();
  
      if (!result.success) {
        container.innerHTML = `<p>❌ Erreur : ${result.message}</p>`;
        return;
      }
  
      result.questions.forEach((q, index) => {
        const card = document.createElement("div");
        card.className = "question-card";
        card.innerHTML = `
          <h3>Question ${index + 1} (${q.type.toUpperCase()})</h3>
          <p><strong>Énoncé :</strong> ${q.statement}</p>
          ${q.media ? `<p><strong>Média :</strong> ${q.media}</p>` : ''}
          <p><strong>Points :</strong> ${q.points}</p>
          <p><strong>Durée :</strong> ${q.duration} secondes</p>
          ${
            q.type === 'direct'
              ? `<p><strong>Réponse attendue :</strong> ${q.directAnswer} (Tolérance : ${q.tolerance})</p>`
              : `<p><strong>Options :</strong><ul>${q.options.map(opt =>
                  `<li>${opt.text} ${opt.correct ? '(✔️ correcte)' : ''}</li>`
                ).join('')}</ul></p>`
          }
          <hr>
        `;
        container.appendChild(card);
      });
  
    } catch (error) {
      console.error(error);
      container.innerHTML = "<p>❌ Erreur lors du chargement des questions.</p>";
    }
  });
