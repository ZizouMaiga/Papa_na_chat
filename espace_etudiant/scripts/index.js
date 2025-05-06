document.getElementById('goExam').addEventListener('click', () => {
  const link = document.getElementById('examLinkInput').value.trim();
  if (!link) return alert('Veuillez coller le lien d’examen.');
  window.location.href = link;
});

