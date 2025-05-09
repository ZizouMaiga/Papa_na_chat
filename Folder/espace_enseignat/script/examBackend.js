document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('examForm');
  
  if (form) {
    form.addEventListener('submit', async (event) => {
      event.preventDefault();
  
      const title = document.getElementById('title').value;
      const description = document.getElementById('description').value;
      const target = document.getElementById('target').value;
  
      try {
        const response = await fetch('http://localhost:3002/api/exams', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title, description, target })
        });
  
        const result = await response.json();
  
        if (response.ok) {
          // Stocker l'ID de l'examen pour l'utiliser plus tard
          localStorage.setItem('currentExamId', result.exam._id);
          alert('Examen enregistré avec succès.');
          // Redirige vers l'ajout de questions
          window.location.href = "add_question.html";
        } else {
          alert('Erreur : ' + result.error);
        }
      } catch (error) {
        console.error("Erreur réseau :", error);
        alert("Erreur lors de la communication avec le serveur.");
      }
    });
  }
});
