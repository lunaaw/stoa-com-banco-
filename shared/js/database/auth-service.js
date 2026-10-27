// ======================================================
// STOA | SERVIÇO DE AUTENTICAÇÃO
// ======================================================

(() => {
  const STOA = window.STOA = window.STOA || {};

  function getClient() {
    if (!STOA.supabase) {
      throw new Error("Cliente Supabase não inicializado.");
    }

    return STOA.supabase;
  }

  function isDemoUser() { return false; }

  async function signInWithPassword(email, password) {
    const normalizedEmail = String(email || "").trim().toLowerCase();

    const { data, error } = await getClient().auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      throw error;
    }

    return data?.user || null;
  }

  async function getCurrentUser() {
    const { data, error } = await getClient().auth.getUser();

    if (error) {
      throw error;
    }

    return data?.user || null;
  }

  async function signOut() {
    const { error } = await getClient().auth.signOut();

    if (error) {
      throw error;
    }
  }

  // O papel vem exclusivamente da tabela protegida perfis, nunca de user_metadata.
  async function getCurrentProfile() {
    const user = await getCurrentUser();
    if (!user) return null;
    const { data, error } = await getClient().from("perfis")
      .select("id, nome_completo, tipo, email")
      .eq("id", user.id).single();
    if (error) throw error;
    return data;
  }

  STOA.auth = Object.freeze({
    getCurrentProfile,
    signInWithPassword,
    getCurrentUser,
    signOut,
    isDemoUser
  });
})();
