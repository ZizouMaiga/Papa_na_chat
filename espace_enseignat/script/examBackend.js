document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('examForm');
    
    if (form) {
      form.addEventListener('submit', async (event) => {
        event.preventDefault();
    
        const title = document.getElementById('title').value;
        const description = document.getElementById('description').value;
        const target = document.getElementById('target').value;
    
        try {
          const response = await fetch('http://localhost:3000/examens', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title, description, target })
          });
    
          const result = await response.json();
    
          if (response.ok) {
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
  // Récupérer toutes les questions d'un examen
app.get('/api/questions/:examId', (req, res) => {
  const { examId } = req.params;

  db.all(
    `SELECT * FROM questions WHERE examId = ?`,
    [examId],
    (err, rows) => {
      if (err) {
        res.status(500).json({ success: false, message: "Erreur serveur", error: err });
      } else {
        // Parse JSON des options si type qcm
        const questions = rows.map(q => {
          if (q.type === 'qcm' && q.options) {
            try {
              q.options = JSON.parse(q.options);
            } catch {
              q.options = [];
            }
          }
          return q;
        });

        res.json({ success: true, questions });
      }
    }
  );
});
