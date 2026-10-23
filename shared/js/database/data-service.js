// ======================================================
// STOA | ACESSO A DADOS
// ======================================================
// Todas as consultas que já existiam nas páginas ficam centralizadas aqui.
// Nomes de tabelas, colunas, relacionamentos e filtros foram preservados.

(() => {
  const STOA = window.STOA = window.STOA || {};

  const TABLES = Object.freeze({
    PROFILES: "perfis",
    APPRENTICES: "aprendizes",
    TEAM_MEMBERS: "membros_equipe"
  });

  function getClient() {
    if (!STOA.supabase) {
      throw new Error("Cliente Supabase não inicializado.");
    }

    return STOA.supabase;
  }

  async function getApprenticeProfile(userId) {
    if (STOA.auth?.isDemoUser?.(userId)) {
      return {
        nome_completo: "Esther Teste",
        avatar_url: localStorage.getItem("stoa_avatar_preview_v1"),
        aprendizes: [
          {
            empresas: {
              razao_social: "TOTVS"
            }
          }
        ]
      };
    }

    const { data, error } = await getClient()
      .from(TABLES.PROFILES)
      .select(`
        nome_completo,
        avatar_url,
        aprendizes (
          empresas (
            razao_social
          )
        )
      `)
      .eq("id", userId)
      .single();

    if (error) {
      throw error;
    }

    return data;
  }

  async function updateProfileAvatar(userId, avatarUrl) {
    if (STOA.auth?.isDemoUser?.(userId)) {
      localStorage.setItem("stoa_avatar_preview_v1", avatarUrl);
      return;
    }

    const { error } = await getClient()
      .from(TABLES.PROFILES)
      .update({ avatar_url: avatarUrl })
      .eq("id", userId);

    if (error) {
      throw error;
    }
  }

  async function listManagers() {
    const { data, error } = await getClient()
      .from(TABLES.TEAM_MEMBERS)
      .select(`
        id,
        area,
        perfis (nome_completo)
      `);

    if (error) {
      throw error;
    }

    return data || [];
  }

  async function listApprentices() {
    const { data, error } = await getClient()
      .from(TABLES.APPRENTICES)
      .select(`
        id,
        area,
        inicio_contrato,
        fim_contrato,
        status,
        perfis ( nome_completo, email ),
        gestor_id
      `);

    if (error) {
      throw error;
    }

    return data || [];
  }

  async function updateApprentice(apprenticeId, changes) {
    const { error } = await getClient()
      .from(TABLES.APPRENTICES)
      .update(changes)
      .eq("id", apprenticeId);

    if (error) {
      throw error;
    }
  }

  async function deleteApprentice(apprenticeId) {
    const { error } = await getClient()
      .from(TABLES.APPRENTICES)
      .delete()
      .eq("id", apprenticeId);

    if (error) {
      throw error;
    }
  }

  STOA.data = Object.freeze({
    tables: TABLES,
    getApprenticeProfile,
    updateProfileAvatar,
    listManagers,
    listApprentices,
    updateApprentice,
    deleteApprentice
  });
})();
