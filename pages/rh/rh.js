(async () => {
  const status = document.getElementById('status');
  const login = '../login/login.html';
  try {
    const profile = await window.STOA.auth.getCurrentProfile();
    if (!profile || !['empresa', 'admin'].includes(profile.tipo)) {
      location.replace(login); return;
    }
    document.getElementById('app').hidden = false;
    status.textContent = `Bem-vindo(a), ${profile.nome_completo || 'RH'}!`;
    const client = window.STOA.supabase;
    const [managers, apprentices] = await Promise.all([
      client.from('membros_equipe').select('id', {count:'exact',head:true}),
      client.from('aprendizes').select('id', {count:'exact',head:true})
    ]);
    if (managers.error || apprentices.error) throw managers.error || apprentices.error;
    document.getElementById('totalGestores').textContent = managers.count ?? 0;
    document.getElementById('totalAprendizes').textContent = apprentices.count ?? 0;
    document.getElementById('sair').onclick = async () => {
      await window.STOA.auth.signOut(); location.replace(login);
    };
  } catch (error) {
    status.textContent = 'Falha ao carregar informações. Confira as permissões de leitura no Supabase.';
    console.error(error);
  }
})();