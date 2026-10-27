// Proteção de navegação: autorização efetiva de dados continua no RLS.
(async () => {
  const kinds={
    'aprendiz':['aprendiz','avatar','trilha'],
    'gestor':['gestor'],
    'empresa':['cadastro','cadastro-equipe','cadastro-aprendiz','projetos'],
    'admin':['cadastro','cadastro-equipe','cadastro-aprendiz','projetos']
  };
  const page=location.pathname.split('/').filter(Boolean).slice(-2,-1)[0];
  if(!page || !Object.values(kinds).some(p=>p.includes(page)))return;
  // Enquanto a consulta está pendente, a interface privada não fica visível.
  document.documentElement.style.visibility='hidden';
  const login=()=>location.replace('../login/login.html');
  try {
    const db=window.STOA?.supabase;
    if(!db)throw Error('Supabase indisponível');
    const {data:{user},error:authError}=await db.auth.getUser();
    if(authError || !user)return login();
    const {data,error}=await db.from('perfis').select('tipo').eq('id',user.id).single();
    if(error || !data?.tipo)return login();
    if(!(kinds[data.tipo]||[]).includes(page)){
      const home=({'aprendiz':'../aprendiz/aprendiz.html','gestor':'../gestor/gestor.html',
       'empresa':'../cadastro-equipe/cadastro_equipe.html','admin':'../cadastro-equipe/cadastro_equipe.html'})[data.tipo];
      return location.replace(home||'../login/login.html');
    }
    document.documentElement.style.visibility='visible';
  }catch(e){console.error('Autorização da página:',e);login()}
})();
