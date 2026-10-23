// ======================================================
// STOA | SERVIÇO DE AUTENTICAÇÃO
// ======================================================

(() => {
  const STOA = window.STOA = window.STOA || {};

  const DEMO_SESSION_KEY = "stoa_demo_session_v1";
  const DEMO_USER_ID = "stoa-local-demo-aprendiz";
  const DEMO_EMAIL = "demo@stoa.local";
  const DEMO_PASSWORD = "StoaDemo123";

  function getClient() {
    if (!STOA.supabase) {
      throw new Error("Cliente Supabase não inicializado.");
    }

    return STOA.supabase;
  }

  function createDemoUser() {
    return {
      id: DEMO_USER_ID,
      email: DEMO_EMAIL,
      isLocalDemo: true,
      user_metadata: {
        nome_completo: "Esther Teste",
        tipo: "aprendiz"
      }
    };
  }

  function hasDemoSession() {
    return localStorage.getItem(DEMO_SESSION_KEY) === "active";
  }

  function isDemoUser(userOrId) {
    const id = typeof userOrId === "string" ? userOrId : userOrId?.id;
    return id === DEMO_USER_ID;
  }

  async function signInWithPassword(email, password) {
    const normalizedEmail = String(email || "").trim().toLowerCase();

    // Usuário local exclusivo para testes do MVP. Não acessa nem altera o Supabase.
    if (normalizedEmail === DEMO_EMAIL && password === DEMO_PASSWORD) {
      localStorage.setItem(DEMO_SESSION_KEY, "active");
      return createDemoUser();
    }

    // Qualquer outra credencial continua seguindo o login real já existente.
    localStorage.removeItem(DEMO_SESSION_KEY);

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
    if (hasDemoSession()) {
      return createDemoUser();
    }

    const { data, error } = await getClient().auth.getUser();

    if (error) {
      throw error;
    }

    return data?.user || null;
  }

  async function signOut() {
    if (hasDemoSession()) {
      localStorage.removeItem(DEMO_SESSION_KEY);
      return;
    }

    const { error } = await getClient().auth.signOut();

    if (error) {
      throw error;
    }
  }

  STOA.auth = Object.freeze({
    signInWithPassword,
    getCurrentUser,
    signOut,
    isDemoUser,
    demo: Object.freeze({
      email: DEMO_EMAIL,
      password: DEMO_PASSWORD,
      userId: DEMO_USER_ID
    })
  });
})();
