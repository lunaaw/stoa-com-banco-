document.addEventListener("DOMContentLoaded", () => {
  // 1. Carrega os aprendizes do localStorage (se existirem) ou inicia lista vazia
  let apprentices = JSON.parse(localStorage.getItem("stoa_apprentices") || "[]");
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

  // Função para salvar a lista de aprendizes no localStorage
  function saveApprentices() {
    localStorage.setItem("stoa_apprentices", JSON.stringify(apprentices));
  }

  // 2. Atualiza a contagem de aprendizes na lista de gestores (salva em stoa_managers)
  function updateManagerApprenticeCounts() {
    let savedManagers = JSON.parse(localStorage.getItem("stoa_managers") || "[]");

    // Mapeia e conta quantos aprendizes cada gestor possui
    const counts = {};
    apprentices.forEach(apprentice => {
      if (apprentice.gestor) {
        counts[apprentice.gestor] = (counts[apprentice.gestor] || 0) + 1;
      }
    });

    // Atualiza a propriedade 'aprendizes' de cada gestor
    savedManagers = savedManagers.map(manager => {
      return {
        ...manager,
        aprendizes: counts[manager.name] || 0
      };
    });

    // Performa a gravação no localStorage dos gestores
    localStorage.setItem("stoa_managers", JSON.stringify(savedManagers));
  }

  // 3. Carrega os Gestores Cadastrados do LocalStorage para os selects
  function loadGestoresOptions() {
    const savedManagers = JSON.parse(localStorage.getItem("stoa_managers") || "[]");
    
    if (filterGestor) filterGestor.innerHTML = `<option value="">Todos os Gestores</option>`;
    if (selectGestorModal) selectGestorModal.innerHTML = `<option value="">Selecione um gestor...</option>`;

    if (savedManagers.length === 0) {
      if (selectGestorModal) {
        const option = document.createElement("option");
        option.disabled = true;
        option.textContent = "Nenhum gestor cadastrado na equipe";
        selectGestorModal.appendChild(option);
      }
      return;
    }

    savedManagers.forEach(m => {
      if (filterGestor) {
        const optFiltro = document.createElement("option");
        optFiltro.value = m.name;
        optFiltro.textContent = m.name;
        filterGestor.appendChild(optFiltro);
      }

      if (selectGestorModal) {
        const optForm = document.createElement("option");
        optForm.value = m.name;
        optForm.textContent = `${m.name} (${m.area})`;
        selectGestorModal.appendChild(optForm);
      }
    });
  }

  // 4. Renderizar Tabela e Calcular Métricas
  function renderTable() {
    // Garante sincronia lendo do localStorage
    apprentices = JSON.parse(localStorage.getItem("stoa_apprentices") || "[]");

    if (!tableBody) return;
    tableBody.innerHTML = "";

    const textSearch = searchInput ? searchInput.value.toLowerCase() : "";
    const selectedStatus = filterStatus ? filterStatus.value : "";
    const selectedGestor = filterGestor ? filterGestor.value : "";

    const filtered = apprentices.filter(a => {
      const matchText = a.name.toLowerCase().includes(textSearch) || a.email.toLowerCase().includes(textSearch);
      const matchStatus = selectedStatus === "" || a.status === selectedStatus;
      const matchGestor = selectedGestor === "" || a.gestor === selectedGestor;
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
          <td><strong>${a.gestor || 'Nenhum'}</strong></td>
          <td>${formatDate(a.startDate)} até ${formatDate(a.endDate)}</td>
          <td>
            <span class="badge ${a.status === 'Concluído' ? 'badge-finished' : 'badge-active'}">
              ${a.status}
            </span>
          </td>
          <td>
            <div class="action-buttons">
              <button class="btn-action" onclick="openDetailsModal(${a.id})" title="Ver Detalhes"><i data-lucide="eye"></i></button>
              <button class="btn-action" onclick="openEditModal(${a.id})" title="Editar"><i data-lucide="pencil"></i></button>
              <button class="btn-action" onclick="openDeleteModal(${a.id})" title="Excluir"><i data-lucide="trash-2"></i></button>
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
    if (countPendentes) countPendentes.textContent = apprentices.filter(a => !a.gestor).length;
  }

  // Helper de Formatação de Data
  function formatDate(dateStr) {
    if (!dateStr) return "-";
    const [year, month, day] = dateStr.split("-");
    return `${day}/${month}/${year}`;
  }

  // Eventos de Filtro
  if (searchInput) searchInput.addEventListener("input", renderTable);
  if (filterStatus) filterStatus.addEventListener("change", renderTable);
  if (filterGestor) filterGestor.addEventListener("change", renderTable);

  // Abrir Modal de Cadastro
  const btnOpenApprenticeModal = document.getElementById("btnOpenApprenticeModal");
  if (btnOpenApprenticeModal) {
    btnOpenApprenticeModal.addEventListener("click", () => {
      loadGestoresOptions();
      document.getElementById("modalTitle").textContent = "Cadastrar Aprendiz";
      if (apprenticeForm) apprenticeForm.reset();
      document.getElementById("editApprenticeId").value = "";
      openModal(apprenticeModal);
    });
  }

  // Submeter Formulário de Aprendiz (Salvar/Editar)
  if (apprenticeForm) {
    apprenticeForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const id = document.getElementById("editApprenticeId").value;
      const name = document.getElementById("inputName").value;
      const email = document.getElementById("inputEmail").value;
      const area = document.getElementById("inputArea").value;
      const gestor = document.getElementById("selectGestor").value;
      const startDate = document.getElementById("inputStartDate").value;
      const endDate = document.getElementById("inputEndDate").value;

      if (id) {
        const idx = apprentices.findIndex(a => a.id == id);
        if (idx !== -1) {
          apprentices[idx] = { ...apprentices[idx], name, email, area, gestor, startDate, endDate };
        }
      } else {
        apprentices.push({
          id: Date.now(),
          name,
          email,
          area,
          gestor,
          startDate,
          endDate,
          status: "Ativo"
        });
      }

      // Persiste no localStorage
      saveApprentices();
      updateManagerApprenticeCounts();

      closeAllModals();
      renderTable();
    });
  }

  // Ver Detalhes
  window.openDetailsModal = function(id) {
    const item = apprentices.find(a => a.id === id);
    if (!item) return;

    document.getElementById("detailsContent").innerHTML = `
      <p><strong>Nome:</strong> ${item.name}</p>
      <p><strong>E-mail:</strong> ${item.email}</p>
      <p><strong>Área:</strong> ${item.area}</p>
      <p><strong>Gestor Atribuído:</strong> ${item.gestor || 'Nenhum'}</p>
      <p><strong>Período do Contrato:</strong> ${formatDate(item.startDate)} até ${formatDate(item.endDate)}</p>
      <p><strong>Status Atual:</strong> ${item.status}</p>
    `;
    openModal(detailsModal);
  };

  // Editar Aprendiz
  window.openEditModal = function(id) {
    loadGestoresOptions();
    const item = apprentices.find(a => a.id === id);
    if (!item) return;

    document.getElementById("modalTitle").textContent = "Editar Aprendiz";
    document.getElementById("editApprenticeId").value = item.id;
    document.getElementById("inputName").value = item.name;
    document.getElementById("inputEmail").value = item.email;
    document.getElementById("inputArea").value = item.area;
    document.getElementById("selectGestor").value = item.gestor;
    document.getElementById("inputStartDate").value = item.startDate;
    document.getElementById("inputEndDate").value = item.endDate;

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
    passwordForm.addEventListener("submit", (e) => {
      e.preventDefault();
      apprentices = apprentices.filter(a => a.id !== selectedApprenticeId);
      document.getElementById("confirmPasswordInput").value = "";

      saveApprentices();
      updateManagerApprenticeCounts();

      closeAllModals();
      renderTable();
    });
  }

  // Funções Utilitárias de Modal
  function openModal(modal) { if (modal) modal.classList.add("active"); }
  function closeModal(modal) { if (modal) modal.classList.remove("active"); }
  function closeAllModals() {
    document.querySelectorAll(".modal-overlay").forEach(m => m.classList.remove("active"));
  }

  document.querySelectorAll(".closeModalBtn, .btn-close-modal").forEach(btn => {
    btn.addEventListener("click", closeAllModals);
  });

  // Inicialização
  loadGestoresOptions();
  renderTable();
});