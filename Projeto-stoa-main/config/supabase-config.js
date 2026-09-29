// 1. Coloque aqui a URL do seu projeto Supabase
const SUPABASE_URL = 'https://zlixkjuwhiijikrhofdh.supabase.co/rest/v1/';

// 2. Coloque aqui a sua chave pública (anon key) do Supabase
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpsaXhranV3aGlpamlrcmhvZmRoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTAxMDMzODAsImV4cCI6MjEwNTY3OTM4MH0.vsBv-NBnjq3SWwP7EJqgqmQa38_Nf3j5fMkzwFpEEOo';

// 3. Cria a conexão oficial com o banco de dados
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Aviso no console para confirmar que carregou certinho
console.log("Supabase conectado com sucesso!");