// ======================================================
// STOA | CLIENTE SUPABASE COMPARTILHADO
// ======================================================
// Este arquivo centraliza SOMENTE a criação do cliente.
// As páginas não devem criar conexões próprias com o banco.

(() => {
  const STOA = window.STOA = window.STOA || {};

  // Mantém o mesmo projeto e a mesma anon key do código original.
  // O valor original estava no formato de endpoint REST; a SDK oficial
  // precisa da URL base do projeto, por isso removemos /rest/v1 quando existir.
  const RAW_SUPABASE_URL = "https://zlixkjuwhiijikrhofdh.supabase.co/rest/v1/";
  const SUPABASE_PROJECT_URL = RAW_SUPABASE_URL.replace(/\/rest\/v1\/?$/, "");
  const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpsaXhranV3aGlpamlrcmhvZmRoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTAxMDMzODAsImV4cCI6MjEwNTY3OTM4MH0.vsBv-NBnjq3SWwP7EJqgqmQa38_Nf3j5fMkzwFpEEOo";

  if (!window.supabase || typeof window.supabase.createClient !== "function") {
    throw new Error("A biblioteca oficial do Supabase não foi carregada.");
  }

  if (!STOA.supabase) {
    STOA.supabase = window.supabase.createClient(
      SUPABASE_PROJECT_URL,
      SUPABASE_ANON_KEY
    );
  }

  STOA.databaseConfig = Object.freeze({
    projectUrl: SUPABASE_PROJECT_URL
  });
})();
