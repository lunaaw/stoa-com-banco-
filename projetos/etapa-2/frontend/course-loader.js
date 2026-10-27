(async () => {
  try {
    await window.STOA.courseProgress.init();
    const element=document.createElement('script');
    element.src='script.js';
    element.onerror=()=>alert('Não foi possível carregar o mini projeto.');
    document.body.appendChild(element);
  } catch (error) {
    console.error(error);
    alert('Não foi possível carregar seu progresso individual. Verifique a conexão e faça login novamente.');
  }
})();
