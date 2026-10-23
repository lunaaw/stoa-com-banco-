document.addEventListener("DOMContentLoaded", () => {
  // 1. Carrega os gestores do localStorage (se existirem) ou inicia lista vazia
  let managers = JSON.parse(localStorage.getItem("stoa_managers") || "[]");
  let selectedManagerId = null;

  // Elementos do DOM
  const tableBody = document.getElementById("teamTableBody");
  const searchInput = document.getElementById("searchInput");
  const countGestores = document.getElementById("countGestores");
  const countAreas = document.getElementById("countAreas");
  const countPendentes = document.getElementById("countPendentes");

  // Modais
  const managerModal = document.getElementById("formModal");
  const confirmDeleteModal = document.getElementById("confirmDeleteModal");
  const passwordModal = document.getElementById("passwordModal");
  const resendModal = document.getElementById("resendModal");

  // Formulários
  const managerForm = document.getElementById("managerForm");
  const passwordForm = document.getElementById("passwordForm");

  // Salva no localStorage
  function saveManagers() {
    localStorage.setItem("stoa_managers", JSON.stringify(managers));
  }

  // Renderiza a tabela de Gestores
  function renderTable() {
    // Atualiza a lista com o que está gravado no armazenamento
    managers = JSON.parse(localStorage.getItem("stoa_managers") || "[]");

    if (!tableBody) return;
    tableBody.innerHTML = "";

    const textSearch = searchInput ? searchInput.value.toLowerCase() : "";

    const filtered = managers.filter(m => 
      m.name.toLowerCase().includes(textSearch) ||
      m.area.toLowerCase().includes(textSearch) ||
      m.email.toLowerCase().includes(textSearch)
    );

    if (filtered.length === 0) {
      tableBody.innerHTML = `
        <tr>
          <td colspan="7">
            <div class="empty-state" style="text-align: center; padding: 30px; color: var(--text-muted);">
              <i data-lucide="users" style="width: 40px; height: 40px; margin-bottom: 10px;"></i>
              <p>Nenhum gestor encontrado.</p>
            </div>
          </td>
        </tr>
      `;
    } else {
      filtered.forEach(m => {
        const initials = m.name ? m.name.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase() : "GS";
        const tr = document.createElement("tr");

        tr.innerHTML = `
          <td>
            <div class="user-info">
              <div class="user-avatar">${initials}</div>
              <div class="user-details">
                <div class="name" style="font-weight: 600;">${m.name}</div>
                <div class="email" style="font-size: 0.8rem; color: var(--text-muted);">${m.email}</div>
              </div>
            </div>
          </td>
          <td>${m.area}</td>
          <td>${m.cargo}</td>
          <td><span class="apprentices-count" style="font-weight: 700;">${m.aprendizes || 0}</span></td>
          <td><span class="badge ${m.role === 'Administrador' ? 'badge-admin' : 'badge-gestor'}">${m.role}</span></td>
          <td>
            <button class="badge ${m.status === 'Ativo' ? 'badge-active' : 'badge-pending'}" onclick="toggleStatus(${m.id})" style="border:none; cursor:pointer;">
              ${m.status}
            </button>
          </td>
          <td>
            <div class="action-buttons">
              <button class="btn-action" onclick="openEditModal(${m.id})" title="Editar"><i data-lucide="pencil"></i></button>
              <button class="btn-action" onclick="openResendModal(${m.id})" title="Reenviar Convite"><i data-lucide="send"></i></button>
              <button class="btn-action" onclick="openDeleteModal(${m.id})" title="Excluir"><i data-lucide="trash-2"></i></button>
            </div>
          </td>
        `;
        tableBody.appendChild(tr);
      });
    }

    if (window.lucide) lucide.createIcons();

    // Atualiza os cards no topo
    if (countGestores) countGestores.textContent = managers.length;
    if (countAreas) countAreas.textContent = new Set(managers.map(m => m.area.toLowerCase())).size;
    if (countPendentes) countPendentes.textContent = managers.filter(m => m.status === "Pendente").length;
  }

  // Evento de Busca
  if (searchInput) {
    searchInput.addEventListener("input", renderTable);
  }

  // --- FUNÇÕES GLOBAIS DE MODAIS (Necessárias para o onclick do HTML) ---

  // Abrir Modal de Adicionar Gestor
  const btnOpenAddModal = document.getElementById("btnOpenAddModal") || document.querySelector(".btn-add-member");
  if (btnOpenAddModal) {
    btnOpenAddModal.addEventListener("click", () => {
      if (managerForm) managerForm.reset();
      const editIdInput = document.getElementById("editManagerId");
      if (editIdInput) editIdInput.value = "";
      openModal(managerModal);
    });
  }

  // Alternar Status (Ativo / Pendente)
  window.toggleStatus = function(id) {
    const manager = managers.find(m => m.id === id);
    if (manager) {
      manager.status = manager.status === "Ativo" ? "Pendente" : "Ativo";
      saveManagers();
      renderTable();
    }
  };

  // Editar Gestor
  window.openEditModal = function(id) {
    const manager = managers.find(m => m.id === id);
    if (!manager) return;

    document.getElementById("editManagerId").value = manager.id;
    document.getElementById("inputName").value = manager.name;
    document.getElementById("inputEmail").value = manager.email;
    document.getElementById("inputArea").value = manager.area;
    document.getElementById("inputCargo").value = manager.cargo;
    document.getElementById("selectRole").value = manager.role;

    openModal(managerModal);
  };

  // Reenviar Convite
  window.openResendModal = function(id) {
    openModal(resendModal);
  };

  // Abrir Modal de Exclusão
  window.openDeleteModal = function(id) {
    selectedManagerId = id;
    openModal(confirmDeleteModal);
  };

  // Confirmar Exclusão (Passo 1: Abrir Modal de Senha)
  const btnConfirmDelete = document.getElementById("btnConfirmDelete");
  if (btnConfirmDelete) {
    btnConfirmDelete.addEventListener("click", () => {
      closeModal(confirmDeleteModal);
      openModal(passwordModal);
    });
  }

  // Submeter Exclusão com Senha (Passo 2)
  if (passwordForm) {
    passwordForm.addEventListener("submit", (e) => {
      e.preventDefault();
      managers = managers.filter(m => m.id !== selectedManagerId);
      saveManagers();
      const pwdInput = document.getElementById("confirmPasswordInput");
      if (pwdInput) pwdInput.value = "";
      closeAllModals();
      renderTable();
    });
  }

  // Salvar / Cadastrar / Editar Gestor
  if (managerForm) {
    managerForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const id = document.getElementById("editManagerId").value;
      const name = document.getElementById("inputName").value;
      const email = document.getElementById("inputEmail").value;
      const area = document.getElementById("inputArea").value;
      const cargo = document.getElementById("inputCargo").value;
      const role = document.getElementById("selectRole").value;

      if (id) {
        const index = managers.findIndex(m => m.id == id);
        if (index !== -1) {
          managers[index] = { ...managers[index], name, email, area, cargo, role };
        }
      } else {
        managers.push({
          id: Date.now(),
          name,
          email,
          area,
          cargo,
          role,
          aprendizes: 0,
          status: "Pendente"
        });
      }

      saveManagers();
      closeAllModals();
      renderTable();
    });
  }

  // Utilitários de Modal
  function openModal(modal) {
    if (modal) modal.classList.add("active");
  }

  function closeModal(modal) {
    if (modal) modal.classList.remove("active");
  }

  function closeAllModals() {
    document.querySelectorAll(".modal-overlay").forEach(m => m.classList.remove("active"));
  }

  // Botões de Fechar Modal (.closeModalBtn e .btn-close-modal)
  document.querySelectorAll(".closeModalBtn, .btn-close-modal").forEach(btn => {
    btn.addEventListener("click", closeAllModals);
  });

  // Inicialização
  renderTable();
});