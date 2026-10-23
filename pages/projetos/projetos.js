document.addEventListener("DOMContentLoaded", () => {
  // Projetos Disponíveis
  const availableProjects = [
    {
      id: "p1",
      title: "Integração e Cultura",
      description: "Entendimento da cultura, valores e processos organizacionais.",
      skills: ["Comunicação", "Proatividade", "Trabalho em Equipe"],
      xp: "200 XP",
      duration: "2h",
      color: "#10b981",
      icon: "globe"
    },
    {
      id: "p2",
      title: "Ferramentas do Dia a Dia",
      description: "Uso prático de Slack, Jira, Figma e sistemas internos.",
      skills: ["Organização", "Tecnologia", "Produtividade"],
      xp: "350 XP",
      duration: "3h",
      color: "#06b6d4",
      icon: "layers"
    },
    {
      id: "p3",
      title: "Git e GitHub",
      description: "Versionamento de código, gestão de branches e pull requests.",
      skills: ["Resolução de Problemas", "Código", "Colaboração"],
      xp: "480 XP",
      duration: "4h",
      color: "#8b5cf6",
      icon: "git-branch"
    },
    {
      id: "p4",
      title: "Desenvolvimento Web Básico",
      description: "Estruturação semântica de interfaces e acessibilidade.",
      skills: ["Atenção a Detalhes", "HTML/CSS", "Lógica"],
      xp: "300 XP",
      duration: "3h",
      color: "#f97316",
      icon: "file-code"
    },
    {
      id: "p5",
      title: "Comunicação Assertiva",
      description: "Técnicas de apresentação de ideias e feedback construtivo.",
      skills: ["Comunicação", "Empatia", "Relacionamento"],
      xp: "400 XP",
      duration: "5h",
      color: "#3b82f6",
      icon: "message-square"
    }
  ];

  // Garante que nenhum item comece selecionado (começa array vazio [])
  // Limpa seleções residuais do LocalStorage para garantir que tudo comece desmarcado
  localStorage.removeItem("stoa_selected_track");

  // Inicia explicitamente com um array vazio
  let selectedProjectIds = [];

  // DOM
  const availableGrid = document.getElementById("availableProjectsGrid");
  const selectedGrid = document.getElementById("selectedTrackGrid");
  const btnPublishTrack = document.getElementById("btnPublishTrack");

  // Modais
  const projectModal = document.getElementById("projectModal");
  const modalTitle = document.getElementById("modalTitle");
  const modalBody = document.getElementById("modalBody");
  const btnCloseModal = document.getElementById("btnCloseModal");
  const btnModalClose = document.getElementById("btnModalClose");

  const successModal = document.getElementById("successModal");
  const btnSuccessClose = document.getElementById("btnSuccessClose");

  // Selecionar / Deselecionar Projetos
  function toggleProjectSelection(id) {
    if (selectedProjectIds.includes(id)) {
      selectedProjectIds = selectedProjectIds.filter(item => item !== id);
    } else {
      selectedProjectIds.push(id);
    }
    renderAll();
  }

  // Renderização
  function renderAll() {
    // 1. Grid de Projetos Disponíveis
    if (availableGrid) {
      availableGrid.innerHTML = "";
      availableProjects.forEach(project => {
        const isChecked = selectedProjectIds.includes(project.id);
        const card = createCardHTML(project, isChecked);
        availableGrid.appendChild(card);
      });
    }

    // 2. Grid da Trilha Selecionada
    if (selectedGrid) {
      selectedGrid.innerHTML = "";

      if (selectedProjectIds.length === 0) {
        selectedGrid.innerHTML = `
          <div class="empty-state">
            <i data-lucide="folder-open"></i>
            <p>Nenhum projeto selecionado.</p>
          </div>
        `;
        if (btnPublishTrack) btnPublishTrack.disabled = true;
      } else {
        if (btnPublishTrack) btnPublishTrack.disabled = false;
        
        const selectedProjects = availableProjects.filter(p => selectedProjectIds.includes(p.id));
        selectedProjects.forEach(project => {
          const card = createCardHTML(project, true);
          selectedGrid.appendChild(card);
        });
      }
    }

    if (window.lucide) lucide.createIcons();
  }

  // Criar Card HTML
  function createCardHTML(project, isChecked) {
    const div = document.createElement("div");
    div.className = "project-card";

    const skillsHTML = project.skills
      .map(s => `<span class="skill-tag">${s}</span>`)
      .join("");

    div.innerHTML = `
      <div class="card-feixe" style="background-color: ${project.color}"></div>
      <div class="card-content">
        <div class="card-top">
          <div class="card-icon" style="background-color: ${project.color}">
            <i data-lucide="${project.icon}"></i>
          </div>
          <label class="checkbox-container">
            <input type="checkbox" data-id="${project.id}" ${isChecked ? 'checked' : ''}>
            <span class="checkmark"></span>
          </label>
        </div>

        <h3 class="card-title">${project.title}</h3>
        <p class="card-description">${project.description}</p>

        <div class="skills-container">
          ${skillsHTML}
        </div>

        <div class="card-meta">
          <span class="meta-item"><i data-lucide="star"></i> ${project.xp}</span>
          <span class="meta-item"><i data-lucide="clock"></i> ${project.duration}</span>
        </div>

        <button class="btn-know" onclick="openProjectModal('${project.id}')">Conhecer</button>
      </div>
    `;

    const checkbox = div.querySelector('input[type="checkbox"]');
    checkbox.addEventListener("change", () => {
      toggleProjectSelection(project.id);
    });

    return div;
  }

  // Publicar Trilha
  if (btnPublishTrack) {
    btnPublishTrack.addEventListener("click", () => {
      const publishedTrack = availableProjects.filter(p => selectedProjectIds.includes(p.id));
      
      localStorage.setItem("stoa_published_track", JSON.stringify(publishedTrack));
      localStorage.setItem("stoa_selected_track", JSON.stringify(selectedProjectIds));

      openModal(successModal);
    });
  }

  // Modal Conhecer Projeto
  window.openProjectModal = function(id) {
    const project = availableProjects.find(p => p.id === id);
    if (!project) return;

    modalTitle.textContent = project.title;
    modalBody.innerHTML = `
      <p><strong>Descrição:</strong> ${project.description}</p>
      <p><strong>Carga Horária Estimada:</strong> ${project.duration}</p>
      <p><strong>Recompensa:</strong> ${project.xp}</p>
      <p><strong>Habilidades Desenvolvidas:</strong> ${project.skills.join(", ")}</p>
    `;

    openModal(projectModal);
  };

  function openModal(modal) {
    if (modal) modal.classList.add("active");
  }

  function closeModal(modal) {
    if (modal) modal.classList.remove("active");
  }

  if (btnCloseModal) btnCloseModal.addEventListener("click", () => closeModal(projectModal));
  if (btnModalClose) btnModalClose.addEventListener("click", () => closeModal(projectModal));
  if (btnSuccessClose) btnSuccessClose.addEventListener("click", () => closeModal(successModal));

  // Inicialização
  renderAll();
});