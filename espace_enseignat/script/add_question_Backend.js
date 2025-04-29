// script/add_question_backend.js

document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById('questionForm');
    const questionType = document.getElementById('questionType');
    const optionsList = document.getElementById('optionsList');
  
    const examId = localStorage.getItem('currentExamId'); // À enregistrer dans localStorage lors de la création de l'examen
  
    form.addEventListener('submit', async (event) => {
      event.preventDefault();
  
      const type = questionType.value;
      const statement = document.getElementById('statement').value;
      const media = document.getElementById('media').files[0]?.name || '';
      const points = parseInt(document.getElementById('points').value);
      const duration = parseInt(document.getElementById('duration').value);
  
      const questionData = {
        examId,
        type,
        statement,
        media,
        points,
        duration
      };
  
      if (type === 'direct') {
        questionData.directAnswer = document.getElementById('directAnswer').value;
        questionData.tolerance = parseInt(document.getElementById('tolerance').value);
      }
  
      if (type === 'qcm') {
        const options = [];
        document.querySelectorAll('#optionsList .option-container').forEach(opt => {
          const text = opt.querySelector('input[type="text"]').value;
          const correct = opt.querySelector('input[type="checkbox"]').checked;
          if (text) options.push({ text, correct });
        });
        questionData.options = options;
      }
  
      try {
        const response = await fetch('http://localhost:3000/api/questions/add-question', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(questionData)
        });
  
        const result = await response.json();
        if (result.success) {
          alert("✅ Question ajoutée dans la base !");
          form.reset();
          optionsList.innerHTML = '';
        } else {
          alert("❌ Erreur : " + result.message);
        }
  
      } catch (error) {
        console.error('Erreur lors de l\'envoi :', error);
        alert("❌ Une erreur s'est produite !");
      }
    });
  });
  