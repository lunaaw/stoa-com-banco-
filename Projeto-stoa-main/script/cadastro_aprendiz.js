document.addEventListener("DOMContentLoaded", async () => {
  // 1. Array local que vai guardar os dados vindos do Supabase para renderizar a tabela
  let apprentices = [];
  let selectedApprenticeId = null;

  // DOM
  const tableBody = document.getElementById("apprenticeTableBody");
  const searchInput = document.getElementById("searchInput");
  const filterStatus = document.getElementById("filterStatus");
  const filterGestor = document.getElementById("filterGestor");
  const selectGestorModal = document.getElementById("selectGestor");

  // Métricas
  const countAtivos = document.getElementById("countAtivos");
  const countConcluidos = document.getElementById("countConcluidos");
  const countPendentes = document.getElementById("countPendentes");

  // Modais
  const apprenticeModal = document.getElementById("apprenticeModal");
  const detailsModal = document.getElementById("detailsModal");
  const confirmDeleteModal = document.getElementById("confirmDeleteModal");
  const passwordModal = document.getElementById("passwordModal");

  const apprenticeForm = document.getElementById("apprenticeForm");
  const passwordForm = document.getElementById("passwordForm");

  // ==========================================
  // INTEGRAÇÃO SUPABASE: BUSCAR DADOS
  // ==========================================
  
  // 2. Carrega os Gestores Cadastrados do Supabase para os selects
  async function loadGestoresOptions() {
    try {
      // Busca a equipe e junta com a tabela perfis para pegar o nome
      const { data: savedManagers, error } = await window.supabase
        .from('membros_equipe')
        .select(`
          id,
          area,
          perfis (nome_completo)
        `);

      if (error) throw error;
      
      if (filterGestor) filterGestor.innerHTML = `<option value="">Todos os Gestores</option>`;
      if (selectGestorModal) selectGestorModal.innerHTML = `<option value="">Selecione um gestor...</option>`;

      if (!savedManagers || savedManagers.length === 0) {
        if (selectGestorModal) {
          const option = document.createElement("option");
          option.disabled = true;
          option.textContent = "Nenhum gestor cadastrado na equipe";
          selectGestorModal.appendChild(option);
        }
        return;
      }

      savedManagers.forEach(m => {
        const nomeGestor = m.perfis?.nome_completo || 'Sem Nome';
        
        if (filterGestor) {
          const optFiltro = document.createElement("option");
          optFiltro.value = m.id; // Agora usamos o ID real do banco
          optFiltro.textContent = nomeGestor;
          filterGestor.appendChild(optFiltro);
        }

        if (selectGestorModal) {
          const optForm = document.createElement("option");
          optForm.value = m.id; // O valor que vai pro banco
          optForm.textContent = `${nomeGestor} (${m.area})`;
          selectGestorModal.appendChild(optForm);
        }
      });
    } catch (err) {
      console.error("Erro ao carregar gestores:", err);
    }
  }

  // 3. Busca todos os aprendizes no banco de dados e adapta para o array da sua amiga
  async function fetchApprentices() {
    try {
      const { data, error } = await window.supabase
        .from('aprendizes')
        .select(`
          id,
          area,
          inicio_contrato,
          fim_contrato,
          status,
          perfis ( nome_completo, email ),
          gestor_id
        `);

      if (error) throw error;

      // Adaptando os dados do banco para o formato que a lógica visual espera
      apprentices = data.map(item => ({
        id: item.id,
        name: item.perfis?.nome_completo || 'Sem Nome',
        email: item.perfis?.email || '',
        area: item.area,
        gestorId: item.gestor_id, // Guarda o ID do gestor
        startDate: item.inicio_contrato,
        endDate: item.fim_contrato,
        status: item.status
      }));

      // Após buscar os dados, renderizamos a tabela
      renderTable();
    } catch (err) {
      console.error("Erro ao buscar aprendizes:", err);
    }
  }

  // ==========================================
  // LÓGICA VISUAL (MANTIDA DA SUA AMIGA)
  // ==========================================

  function renderTable() {
    if (!tableBody) return;
    tableBody.innerHTML = "";

    const textSearch = searchInput ? searchInput.value.toLowerCase() : "";
    const selectedStatus = filterStatus ? filterStatus.value : "";
    const selectedGestor = filterGestor ? filterGestor.value : "";

    const filtered = apprentices.filter(a => {
      const matchText = a.name.toLowerCase().includes(textSearch) || a.email.toLowerCase().includes(textSearch);
      const matchStatus = selectedStatus === "" || a.status === selectedStatus;
      // Compara pelo ID do gestor agora
      const matchGestor = selectedGestor === "" || a.gestorId === selectedGestor; 
      return matchText && matchStatus && matchGestor;
    });

    if (filtered.length === 0) {
      tableBody.innerHTML = `
        <tr>
          <td colspan="6">
            <div class="empty-state" style="text-align:center; padding:30px; color:var(--text-muted);">
              <i data-lucide="graduation-cap" style="width: 48px; height: 48px; margin-bottom:10px;"></i>
              <p>Nenhum aprendiz encontrado.</p>
            </div>
          </td>
        </tr>
      `;
    } else {
      filtered.forEach(a => {
        const initials = a.name ? a.name.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase() : "AP";
        const tr = document.createElement("tr");
        
        // Pega o nome do gestor (simulado) para exibição a partir do select
        let nomeGestor = 'Nenhum';
        if (selectGestorModal) {
          const gestorOpt = Array.from(selectGestorModal.options).find(opt => opt.value === a.gestorId);
          if (gestorOpt) nomeGestor = gestorOpt.text.split(' (')[0];
        }

        tr.innerHTML = `
          <td>
            <div class="user-info">
              <div class="user-avatar">${initials}</div>
              <div class="user-details">
                <div style="font-weight:600;">${a.name}</div>
                <div style="font-size:0.8rem; color:var(--text-muted);">${a.email}</div>
              </div>
            </div>
          </td>
          <td>${a.area}</td>
          <td><strong>${nomeGestor}</strong></td>
          <td>${formatDate(a.startDate)} até ${formatDate(a.endDate)}</td>
          <td>
            <span class="badge ${a.status === 'Concluído' ? 'badge-finished' : 'badge-active'}">
              ${a.status}
            </span>
          </td>
          <td>
            <div class="action-buttons">
              <button class="btn-action" onclick="openDetailsModal('${a.id}')" title="Ver Detalhes"><i data-lucide="eye"></i></button>
              <button class="btn-action" onclick="openEditModal('${a.id}')" title="Editar"><i data-lucide="pencil"></i></button>
              <button class="btn-action" onclick="openDeleteModal('${a.id}')" title="Excluir"><i data-lucide="trash-2"></i></button>
            </div>
          </td>
        `;
        tableBody.appendChild(tr);
      });
    }

    if (window.lucide) lucide.createIcons();

    // Atualiza Métricas no Topo
    if (countAtivos) countAtivos.textContent = apprentices.filter(a => a.status === "Ativo").length;
    if (countConcluidos) countConcluidos.textContent = apprentices.filter(a => a.status === "Concluído").length;
    if (countPendentes) countPendentes.textContent = apprentices.filter(a => !a.gestorId).length;
  }

  function formatDate(dateStr) {
    if (!dateStr) return "-";
    const [year, month, day] = dateStr.split("-");
    return `${day}/${month}/${year}`;
  }

  if (searchInput) searchInput.addEventListener("input", renderTable);
  if (filterStatus) filterStatus.addEventListener("change", renderTable);
  if (filterGestor) filterGestor.addEventListener("change", renderTable);

  const btnOpenApprenticeModal = document.getElementById("btnOpenApprenticeModal");
  if (btnOpenApprenticeModal) {
    btnOpenApprenticeModal.addEventListener("click", () => {
      document.getElementById("modalTitle").textContent = "Cadastrar Aprendiz";
      if (apprenticeForm) apprenticeForm.reset();
      document.getElementById("editApprenticeId").value = "";
      openModal(apprenticeModal);
    });
  }

  // ==========================================
  // SALVAR / ATUALIZAR NO SUPABASE
  // ==========================================
  if (apprenticeForm) {
    apprenticeForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      
      const id = document.getElementById("editApprenticeId").value;
      const area = document.getElementById("inputArea").value;
      const gestorId = document.getElementById("selectGestor").value;
      const startDate = document.getElementById("inputStartDate").value;
      const endDate = document.getElementById("inputEndDate").value;

      try {
        if (id) {
          // UPDATE: Atualiza os dados do aprendiz existente no Supabase
          const { error } = await window.supabase
            .from('aprendizes')
            .update({
              area: area,
              gestor_id: gestorId,
              inicio_contrato: startDate,
              fim_contrato: endDate
            })
            .eq('id', id);

          if (error) throw error;
          alert("Aprendiz atualizado com sucesso!");
        } else {
          // Em um ambiente real, o HR envia um convite. 
          // Para esta tela, alertamos a regra de negócio.
          alert("Aviso: No modelo atual, o aprendiz precisa criar sua própria conta (Cadastro) primeiro. Use a edição para vinculá-lo a um gestor!");
        }

        closeAllModals();
        await fetchApprentices(); // Recarrega os dados fresquinhos do banco
      } catch (err) {
        console.error("Erro ao salvar:", err);
        alert("Ocorreu um erro ao salvar os dados no banco.");
      }
    });
  }

  // Ver Detalhes
  window.openDetailsModal = function(id) {
    const item = apprentices.find(a => a.id === id);
    if (!item) return;

    let nomeGestor = 'Nenhum';
    if (selectGestorModal) {
      const gestorOpt = Array.from(selectGestorModal.options).find(opt => opt.value === item.gestorId);
      if (gestorOpt) nomeGestor = gestorOpt.text.split(' (')[0];
    }

    document.getElementById("detailsContent").innerHTML = `
      <p><strong>Nome:</strong> ${item.name}</p>
      <p><strong>E-mail:</strong> ${item.email}</p>
      <p><strong>Área:</strong> ${item.area}</p>
      <p><strong>Gestor Atribuído:</strong> ${nomeGestor}</p>
      <p><strong>Período do Contrato:</strong> ${formatDate(item.startDate)} até ${formatDate(item.endDate)}</p>
      <p><strong>Status Atual:</strong> ${item.status}</p>
    `;
    openModal(detailsModal);
  };

  // Editar Aprendiz
  window.openEditModal = function(id) {
    const item = apprentices.find(a => a.id === id);
    if (!item) return;

    document.getElementById("modalTitle").textContent = "Editar Aprendiz";
    document.getElementById("editApprenticeId").value = item.id;
    
    // Como nome e e-mail ficam na tabela perfis, eles são apenas leitura aqui
    document.getElementById("inputName").value = item.name;
    document.getElementById("inputName").disabled = true; 
    document.getElementById("inputEmail").value = item.email;
    document.getElementById("inputEmail").disabled = true;

    document.getElementById("inputArea").value = item.area;
    document.getElementById("selectGestor").value = item.gestorId || "";
    document.getElementById("inputStartDate").value = item.startDate || "";
    document.getElementById("inputEndDate").value = item.endDate || "";

    openModal(apprenticeModal);
  };

  // Exclusão de Aprendiz
  window.openDeleteModal = function(id) {
    selectedApprenticeId = id;
    openModal(confirmDeleteModal);
  };

  const btnConfirmDelete = document.getElementById("btnConfirmDelete");
  if (btnConfirmDelete) {
    btnConfirmDelete.addEventListener("click", () => {
      closeModal(confirmDeleteModal);
      openModal(passwordModal);
    });
  }

  if (passwordForm) {
    passwordForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      document.getElementById("confirmPasswordInput").value = "";

      try {
        // Deleta o aprendiz diretamente do banco Supabase
        const { error } = await window.supabase
          .from('aprendizes')
          .delete()
          .eq('id', selectedApprenticeId);

        if (error) throw error;

        alert("Aprendiz removido com sucesso!");
        closeAllModals();
        await fetchApprentices(); // Recarrega os dados da tabela
      } catch (err) {
        console.error("Erro ao excluir:", err);
        alert("Ocorreu um erro ao excluir do banco.");
      }
    });
  }

  function openModal(modal) { if (modal) modal.classList.add("active"); }
  function closeModal(modal) { if (modal) modal.classList.remove("active"); }
  function closeAllModals() {
    document.querySelectorAll(".modal-overlay").forEach(m => m.classList.remove("active"));
  }

  document.querySelectorAll(".closeModalBtn, .btn-close-modal").forEach(btn => {
    btn.addEventListener("click", closeAllModals);
  });

  // ==========================================
  // INICIALIZAÇÃO DA TELA
  // ==========================================
  // Carrega os gestores primeiro, depois busca os aprendizes e desenha a tabela
  await loadGestoresOptions();
  await fetchApprentices();
});