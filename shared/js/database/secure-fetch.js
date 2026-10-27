// Comunicação com as APIs FastAPI protegidas da STOA.
(() => {
  window.STOA=window.STOA||{};
  window.STOA.secureFetch=async (url, options={}) => {
    const db=window.STOA.supabase;
    if (!db) throw new Error('Supabase não inicializado.');
    const {data:{session},error}=await db.auth.getSession();
    if (error || !session?.access_token) throw new Error('Faça login novamente para utilizar a atividade.');
    const headers=new Headers(options.headers||{});
    headers.set('Authorization','Bearer '+session.access_token);
    return fetch(url,{...options,headers});
  };
})();
