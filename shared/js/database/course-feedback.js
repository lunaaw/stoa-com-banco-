// STOA | Persistência dos resultados reais de avaliação (MVP).
(() => {
  const titles = {
    mini_projeto_tecnico: "Mini Projeto Técnico",
    mini_projeto_comunicacao: "Mini Projeto de Comunicação",
    projeto_integrador: "Projeto Integrador"
  };
  window.STOA = window.STOA || {};
  window.STOA.courseFeedback = {
    async save(codigo, resultado) {
      const db=window.STOA?.supabase;
      if (!db || !titles[codigo] || !resultado || typeof resultado !== "object")
        throw new Error("Feedback ou conexão indisponível.");
      const {data:{user},error:authError}=await db.auth.getUser();
      if (authError || !user) throw new Error("Entre novamente na STOA para salvar sua avaliação.");
      const {data:projeto,error:projectError}=await db.from("projetos")
        .select("id").eq("codigo",codigo).single();
      if (projectError || !projeto) throw new Error("Projeto não encontrado no banco.");
      const resumo=String(resultado.observacao_geral || resultado.resumo_geral ||
        resultado.feedback_geral || resultado.observacao_final || "").slice(0,5000);
      const {error}=await db.from("feedbacks_projetos").upsert({
        aprendiz_id:user.id,projeto_id:projeto.id,resultado,
        resumo, versao_rubrica:"mvp-1",atualizado_em:new Date().toISOString()
      },{onConflict:"aprendiz_id,projeto_id"});
      if (error) throw new Error("O resultado foi gerado, mas não foi salvo no Supabase: "+error.message);
    }
  };
})();
