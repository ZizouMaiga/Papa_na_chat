// script/add_question_backend.js

document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById('questionForm');

    // Vérifier l'ID de l'examen
    const examId = localStorage.getItem('currentExamId');
    console.log('ID utilisé pour ajout de question :', examId);
    if (!examId) {
      alert("Erreur : ID de l'examen non trouvé");
      window.location.href = 'create_exam.html';
      return;
    }

    form.addEventListener('submit', async (event) => {
      event.preventDefault();

      const type = document.getElementById('questionType').value;
      const statement = document.getElementById('statement').value;
      const points = parseInt(document.getElementById('points').value);
      const duration = parseInt(document.getElementById('duration').value);
      const media = document.getElementById('media').files[0]?.name || '';

      const questionData = {
        type,
        statement,
        points,
        duration,
        media,
        examId // Inclure l'ID de l'examen
      };

      if (type === 'direct') {
        questionData.directAnswer = document.getElementById('directAnswer').value;
        questionData.tolerance = parseInt(document.getElementById('tolerance').value);
      } else if (type === 'qcm') {
        const options = [];
        document.querySelectorAll('#optionsList .option-container').forEach(opt => {
          const text = opt.querySelector('input[type="text"]').value;
          const correct = opt.querySelector('input[type="checkbox"]').checked;
          if (text) options.push({ text, correct });
        });
        questionData.options = options;
      }

      try {
        const response = await fetch(`http://localhost:3002/api/exams/${examId}/questions`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(questionData)
        });

        if (!response.ok) {
          const errorText = await response.text();
          alert('Erreur lors de la requête vers le backend : ' + errorText);
          return;
        }

        const result = await response.json();
        if (result.success) {
          alert("✅ Question ajoutée avec succès !");
          form.reset();
          document.getElementById('optionsList').innerHTML = '';
          document.getElementById('directOptions').style.display = 'none';
          document.getElementById('qcmOptions').style.display = 'none';
        } else {
          alert("❌ Erreur : " + result.message);
        }
      } catch (error) {
        console.error('Erreur:', error);
        alert("❌ Une erreur s'est produite lors de l'ajout de la question : " + error);
      }
    });
  });
