document.addEventListener('DOMContentLoaded', async () => {
  const db = window.STOA?.supabase;
  const body = document.getElementById('teamTableBody');
  const form = document.getElementById('managerForm');
  const modal = document.getElementById('formModal');
  let managers = [];
  const el = id => document.getElementById(id);
  const escape = v => String(v ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const close = () => document.querySelectorAll('.modal-overlay').forEach(m => m.classList.remove('active'));
  document.querySelectorAll('.closeModalBtn,.btn-close-modal').forEach(b => b.addEventListener('click', close));
  const report = msg => alert(msg);
  if (!db) { report('Supabase indisponível.'); return; }
  async function authorized() {
    const {data:{user}} = await db.auth.getUser();
    if (!user) { location.href='../login/login.html'; return false; }
    const {data:profile,error}=await db.from('perfis').select('tipo').eq('id',user.id).single();
    if (error || !['empresa','admin'].includes(profile?.tipo)) { report('Acesso permitido somente ao RH.'); location.href='../login/login.html'; return false; }
    return true;
  }
  async function load(){
    const [{data:team,error},{data:apprentices,error:ae}] = await Promise.all([
      db.from('membros_equipe').select('id,area,cargo,permissao,status,empresa_id,perfis(nome_completo,email)').order('cargo'),
      db.from('aprendizes').select('gestor_id')
    ]);
    if(error||ae){report('Não foi possível carregar a equipe: '+(error||ae).message);return;}
    managers=(team||[]).map(m=>({id:m.id,name:m.perfis?.nome_completo||'Sem nome',email:m.perfis?.email||'',area:m.area||'',cargo:m.cargo||'Gestor',role:m.permissao||'Gestor',status:m.status||'Ativo',aprendizes:(apprentices||[]).filter(a=>a.gestor_id===m.id).length}));
    render();
  }
  function render(){
    const q=(el('searchInput')?.value||'').toLowerCase();
    const filtered=managers.filter(m=>[m.name,m.email,m.area].some(v=>v.toLowerCase().includes(q)));
    body.replaceChildren();
    if(!filtered.length){const tr=document.createElement('tr');tr.innerHTML='<td colspan="7" style="text-align:center;padding:30px">Nenhum gestor encontrado.</td>';body.append(tr);}
    for(const m of filtered){
      const tr=document.createElement('tr');
      tr.innerHTML=`<td><div class="user-info"><div class="user-avatar">${escape(m.name.split(' ').map(x=>x[0]).slice(0,2).join('').toUpperCase())}</div><div class="user-details"><div class="name">${escape(m.name)}</div><div class="email">${escape(m.email)}</div></div></div></td><td>${escape(m.area)}</td><td>${escape(m.cargo)}</td><td>${m.aprendizes}</td><td><span class="badge badge-gestor">${escape(m.role)}</span></td><td><span class="badge badge-active">${escape(m.status)}</span></td><td><button type="button" class="btn-action" title="Edição em desenvolvimento" disabled>Visualização</button></td>`;
      body.append(tr);
    }
    el('countGestores').textContent=managers.length;
    el('countAreas').textContent=new Set(managers.map(m=>m.area.toLowerCase()).filter(Boolean)).size;
    el('countPendentes').textContent=managers.filter(m=>m.status==='Pendente').length;
    window.lucide?.createIcons();
  }
  if(!(await authorized()))return;
  el('searchInput')?.addEventListener('input',render);
  (el('btnOpenAddModal')||document.querySelector('.btn-add-member'))?.addEventListener('click',()=>{
    form.reset();el('editManagerId').value='';modal.classList.add('active');
  });
  form?.addEventListener('submit',async e=>{
    e.preventDefault();
    const button=form.querySelector('[type=submit]');
    const nome_completo=el('inputName').value.trim(),email=el('inputEmail').value.trim(),area=el('inputArea').value.trim(),senha=el('teamInitialPassword').value;
    if(senha.length<12){report('Defina uma senha inicial com pelo menos 12 caracteres.');return;}
    button.disabled=true;
    try {
      const {data:{session},error:sessionError}=await db.auth.getSession();
      if(sessionError||!session)throw new Error('Sua sessão expirou. Faça login novamente.');
      const res=await fetch(`${window.STOA.databaseConfig.projectUrl}/functions/v1/admin-create-user`,{method:'POST',headers:{'Content-Type':'application/json','apikey':db.supabaseKey,Authorization:`Bearer ${session.access_token}`},body:JSON.stringify({tipo:'gestor',nome_completo,email,area,senha,cargo:el('inputCargo').value.trim()})});
      const result=await res.json();if(!res.ok)throw new Error(result.error||'Cadastro não concluído');
      close();await load();report('Gestor cadastrado com sucesso!');
    }catch(err){report('Erro ao cadastrar gestor: '+err.message)}finally{button.disabled=false;}
  });
  await load();
});
