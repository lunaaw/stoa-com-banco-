// STOA - progresso do único curso funcional: Ferramentas do dia a dia e Comunicação.
// Os 3 projetos internos são etapas deste curso; os outros 2 cards permanecem fixos.
(() => {
  const STOA = window.STOA = window.STOA || {};
  const CODES = { etapa1: 'mini_projeto_tecnico', etapa2: 'mini_projeto_comunicacao', integrador: 'projeto_integrador' };
  const KEYS = { etapa1: 'stoa_mini_projeto_tecnico_v1', etapa2: 'stoa_mini_projeto_comunicacao_v1', integrador: 'stoa_projeto_integrador_v1' };
  let identity = null;
  let ids = null;
  const client = () => STOA.supabase;
  const scopedKey = (key) => identity ? `${key}__${identity}` : `${key}__sem_usuario`;
  async function init() {
    if (!client()) throw new Error('Supabase não foi inicializado.');
    const {data:{user}, error} = await client().auth.getUser();
    if (error || !user) { location.replace('/pages/login/login.html'); throw new Error('Faça login como aprendiz.'); }
    const {data:profile,error:profileError} = await client().from('perfis').select('tipo').eq('id',user.id).single();
    if (profileError || profile?.tipo !== 'aprendiz') throw new Error('Apenas aprendizes podem abrir esta trilha.');
    identity = user.id;
    const {data:projects,error:projectsError} = await client().from('projetos').select('id,codigo').in('codigo',Object.values(CODES));
    if (projectsError) throw projectsError;
    ids = Object.fromEntries((projects || []).map(project => [project.codigo,project.id]));
    if (Object.keys(ids).length !== 3) throw new Error('Os mini projetos não foram encontrados.');
    const {data:rows,error:rowsError} = await client().from('progresso_projetos').select('projeto_id,estado').eq('aprendiz_id',identity).in('projeto_id',Object.values(ids));
    if (rowsError) throw rowsError;
    // O Supabase é fonte de verdade. Nunca importar automaticamente estado sem dono do localStorage antigo.
    for (const [step,code] of Object.entries(CODES)) {
      const saved = (rows||[]).find(r=>r.projeto_id===ids[code]);
      const key=scopedKey(KEYS[step]);
      if (saved?.estado?.dados) localStorage.setItem(key, JSON.stringify(saved.estado.dados));
      else localStorage.removeItem(key);
    }
    return true;
  }
  function key(stepOrKey){ const base=KEYS[stepOrKey]||stepOrKey; return scopedKey(base); }
  async function save(step,state) {
    if (!identity || !ids?.[CODES[step]]) throw new Error('Sessão de progresso ainda não carregada.');
    const total = step === 'integrador' ? 6 : 6;
    const etapa = Math.min(total,Math.max(1,Number(state.etapaAtual)||1));
    const finalizado=Boolean(state.finalizado);
    const percentual=finalizado?100:Math.max(0,Math.min(99,Math.round(((etapa-1)/total)*100)));
    const {error}=await client().from('progresso_projetos').upsert({
      aprendiz_id:identity,projeto_id:ids[CODES[step]],
      estado:{dados:state},etapa_atual:etapa,percentual,
      status:finalizado?'Concluído':'Em andamento',
      iniciado_em:new Date().toISOString(),
      concluido_em:finalizado?new Date().toISOString():null,
      atualizado_em:new Date().toISOString()
    },{onConflict:'aprendiz_id,projeto_id'});
    if (error) {console.error('STOA: não foi possível salvar no Supabase:',error); STOA.progressSaveError=true;}
    else STOA.progressSaveError=false;
  }
  STOA.courseProgress={init,key,save,get userId(){return identity;}};
})();
