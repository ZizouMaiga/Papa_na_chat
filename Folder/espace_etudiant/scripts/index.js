document.getElementById('goExam').addEventListener('click', () => {
  const link = document.getElementById('examLinkInput').value.trim();
  if (!link) return alert('Veuillez coller le lien d\'examen.');
  
  try {
    const url = new URL(link);
    const examId = url.searchParams.get('id');
    
    // Vérifier le format de l'ID MongoDB (24 caractères hexadécimaux)
    if (!examId || !/^[0-9a-fA-F]{24}$/.test(examId)) {
      alert('Format d\'ID invalide. L\'ID doit être un identifiant MongoDB valide (24 caractères hexadécimaux).');
      return;
    }

    // Redirection vers la page d'examen avec l'ID
    window.location.href = `/espace_etudiant/exam.html?id=${examId}`;
  } catch (error) {
    alert('Format du lien invalide. Veuillez vérifier que le lien est correct.');
  }
});
