// ======================================================
// STOA | ÁREA DO APRENDIZ
// ======================================================

const projects = [
  {
    id: 1,
    title: "Ferramentas do dia a dia e Comunicação",
    description: "Soft skills, comunicação e Google Workspace aplicados ao dia a dia profissional.",
    tags: ["Google Workspace", "Comunicação", "Soft skills"],
    xp: 1050,
    time: "Trilha prática",
    status: "current",
    color: "#625DA4",
    icon: "▱"
  },
  {
    id: 2,
    title: "Git e GitHub",
    description: "Versionamento de código, gestão de branches e pull requests.",
    tags: ["Código", "Versionamento", "Colaboração"],
    xp: 480,
    time: "4h",
    status: "locked",
    color: "#8b5cf6",
    icon: "⑂"
  },
  {
    id: 3,
    title: "Integração e Cultura",
    description: "Entendimento da cultura, valores e processos organizacionais.",
    tags: ["Cultura", "Comunicação", "Integração"],
    xp: 200,
    time: "2h",
    status: "completed",
    color: "#16d39a",
    icon: "✓"
  }
];

const journeyItems = [
  {
    title: "Integração e Cultura",
    detail: "Concluído • 200 XP • 2h",
    statusClass: "done"
  },
  {
    title: "Ferramentas do Dia a Dia",
    detail: "Em andamento • trilha de mini projetos",
    statusClass: "active"
  },
  {
    title: "Git e GitHub",
    detail: "Bloqueado • 480 XP • 4h",
    statusClass: "locked"
  },
  {
    title: "Desenvolvimento Web Básico",
    detail: "Bloqueado • 400 XP • 6h",
    statusClass: "locked"
  },
  {
    title: "Comunicação Assertiva",
    detail: "Bloqueado • 300 XP • 2h",
    statusClass: "locked"
  }
];

function projectCard(project) {
  const isLocked = project.status === "locked";
  const isCompleted = project.status === "completed";
  const disabled = isLocked || isCompleted ? "disabled" : "";
  const statusLabel = isCompleted
    ? "Finalizado"
    : isLocked
      ? "Bloqueado"
      : "Em andamento";
  const buttonLabel = isCompleted
    ? "Finalizado"
    : isLocked
      ? "Bloqueado"
      : "Continuar";

  return `
    <article class="project-card project-card-${project.status}" style="--accent:${project.color}">
      <div class="project-card-topline">
        <div class="project-icon">${project.icon}</div>
        <span class="project-status-label ${project.status}">${statusLabel}</span>
      </div>

      <h3>${project.title}</h3>
      <p>${project.description}</p>

      <div class="tags">
        ${project.tags.map(tag => `<span class="tag">${tag}</span>`).join("")}
      </div>

      <div class="project-meta">
        <span>☆ ${project.xp} XP</span>
        <span>◷ ${project.time}</span>
      </div>

      <button class="outline-button project-open" data-id="${project.id}" ${disabled}>
        ${buttonLabel}
      </button>
    </article>
  `;
}

function renderProjects() {
  const home = document.getElementById("home-projects");
  const all = document.getElementById("all-projects");

  if (home) home.innerHTML = projects.map(projectCard).join("");
  if (all) all.innerHTML = projects.map(projectCard).join("");

  document.querySelectorAll(".project-open:not(:disabled)").forEach(button => {
    button.addEventListener("click", () => openProject(Number(button.dataset.id)));
  });
}

function renderProgress() {
  // Esta área permanece estática neste momento do MVP, conforme planejado.
  const fill = document.getElementById("progress-fill");
  const text = document.getElementById("progress-text");
  const count = document.getElementById("project-count");
  const evo = document.getElementById("evo-completed");
  const profile = document.getElementById("profile-completed");

  if (fill) fill.style.width = "40%";
  if (text) text.textContent = "40% concluído";
  if (count) count.textContent = "2 de 5 projetos";
  if (evo) evo.textContent = "2";
  if (profile) profile.textContent = "2";
}

function renderJourney() {
  const container = document.getElementById("full-journey");
  if (!container) return;

  container.innerHTML = journeyItems.map(item => `
    <div class="journey-row ${item.statusClass}">
      <div class="row-circle">${item.statusClass === "done" ? "✓" : item.statusClass === "active" ? "→" : "♙"}</div>
      <div class="row-info">
        <strong>${item.title}</strong>
        <span>${item.detail}</span>
      </div>
      <span>${item.statusClass === "locked" ? "🔒" : "›"}</span>
    </div>
  `).join("");
}

function openProject(id) {
  const project = projects.find(item => item.id === id);
  if (!project || project.status !== "current") return;

  if (project.id === 1) {
    window.location.href = "../trilha/trilha.html";
  }
}

function navigate(page) {
  document.querySelectorAll(".page").forEach(section => {
    section.classList.remove("active-page");
  });

  const target = document.getElementById(page);
  if (target) target.classList.add("active-page");

  document.querySelectorAll(".menu-item[data-page]").forEach(item => {
    item.classList.toggle("active", item.dataset.page === page);
  });

  window.scrollTo({ top: 0, behavior: "smooth" });
}

function renderAvatarElement(element, avatarUrl, firstName) {
  if (!element) return;

  element.classList.remove("has-avatar");
  element.textContent = "";

  const fallback = () => {
    const defaultUrl = window.STOA?.avatar?.buildUrl?.();

    if (defaultUrl && avatarUrl !== defaultUrl) {
      renderAvatarElement(element, defaultUrl, firstName);
      return;
    }

    element.innerHTML = "";
    element.textContent = (firstName || "A").charAt(0).toUpperCase();
    element.classList.remove("has-avatar");
  };

  if (!avatarUrl) {
    fallback();
    return;
  }

  const image = document.createElement("img");
  image.src = avatarUrl;
  image.alt = `Avatar de ${firstName || "aprendiz"}`;
  image.loading = "eager";
  image.addEventListener("error", fallback, { once: true });

  element.appendChild(image);
  element.classList.add("has-avatar");
}

function applyUserData(nomeCompleto, nomeEmpresa, avatarUrl) {
  const safeName = (nomeCompleto || "Aprendiz STOA").trim();
  const firstName = safeName.split(/\s+/)[0] || "Aprendiz";

  document.querySelectorAll("[data-user-name]").forEach(el => {
    el.textContent = safeName;
  });
  document.querySelectorAll("[data-user-first-name]").forEach(el => {
    el.textContent = firstName;
  });
  document.querySelectorAll("[data-company-name]").forEach(el => {
    el.textContent = nomeEmpresa || "TOTVS";
  });
  document.querySelectorAll("[data-user-role]").forEach(el => {
    el.textContent = "Aprendiz";
  });
  document.querySelectorAll("[data-user-avatar]").forEach(el => {
    renderAvatarElement(el, avatarUrl, firstName);
  });
}

async function carregarDadosDoBanco() {
  const defaultAvatar = window.STOA?.avatar?.buildUrl?.() || null;
  const localAvatar = localStorage.getItem("stoa_avatar_preview_v1");

  try {
    const user = await window.STOA.auth.getCurrentUser();
    if (!user) {
      applyUserData("Aprendiz STOA", "TOTVS", localAvatar || defaultAvatar);
      return;
    }

    const perfil = await window.STOA.data.getApprenticeProfile(user.id);
    const nomeTratado = perfil?.nome_completo || "Aprendiz STOA";
    let empresaTratada = "TOTVS";

    if (
      perfil?.aprendizes &&
      perfil.aprendizes.length > 0 &&
      perfil.aprendizes[0].empresas
    ) {
      empresaTratada = perfil.aprendizes[0].empresas.razao_social || empresaTratada;
    }

    let avatarUrl = perfil?.avatar_url || localAvatar || null;

    if (!perfil?.avatar_url && localAvatar) {
      try {
        await window.STOA.data.updateProfileAvatar(user.id, localAvatar);
        localStorage.removeItem("stoa_avatar_preview_v1");
      } catch (syncError) {
        console.warn("Avatar local ainda não pôde ser sincronizado:", syncError);
      }
    }

    avatarUrl = await window.STOA.avatar.ensureForUser(user.id, avatarUrl);
    applyUserData(nomeTratado, empresaTratada, avatarUrl);
  } catch (error) {
    console.error("Erro ao carregar dados do aprendiz:", error);
    applyUserData("Aprendiz STOA", "TOTVS", localAvatar || defaultAvatar);
  }
}

function updateThemeMenu() {
  const theme = window.STOA?.accessibility?.getTheme?.() ||
    (localStorage.getItem("stoaTheme") || "light");
  const isDark = theme === "dark";
  const icon = document.getElementById("theme-icon");
  const text = document.getElementById("theme-text");

  if (icon) icon.textContent = isDark ? "☾" : "☀";
  if (text) text.textContent = isDark ? "Tema escuro" : "Tema claro";
}

function setupUserMenu() {
  const button = document.getElementById("user-menu-button");
  const menu = document.getElementById("user-dropdown");

  if (button && menu) {
    button.addEventListener("click", event => {
      event.stopPropagation();
      menu.classList.toggle("open");
    });

    document.addEventListener("click", event => {
      if (!menu.contains(event.target) && event.target !== button) {
        menu.classList.remove("open");
      }
    });
  }

  const themeButton = document.getElementById("theme-toggle");
  themeButton?.addEventListener("click", () => {
    const current = window.STOA.accessibility.getTheme();
    window.STOA.accessibility.setTheme(current === "dark" ? "light" : "dark");
    updateThemeMenu();
  });

  document.addEventListener("stoa:theme-changed", updateThemeMenu);
  updateThemeMenu();

  const logout = document.getElementById("logout-button");
  logout?.addEventListener("click", async event => {
    event.preventDefault();
    try {
      await window.STOA.auth.signOut();
    } catch (error) {
      console.error("Erro ao sair:", error);
    } finally {
      window.location.href = "../login/login.html";
    }
  });
}

function setupNavigation() {
  document.querySelectorAll(".menu-item[data-page]").forEach(item => {
    item.addEventListener("click", () => navigate(item.dataset.page));
  });

  document.querySelectorAll("[data-page-link]").forEach(button => {
    button.addEventListener("click", () => navigate(button.dataset.pageLink));
  });

  const sidebarToggle = document.getElementById("sidebar-toggle");
  sidebarToggle?.addEventListener("click", () => {
    document.body.classList.toggle("sidebar-collapsed");
  });
}

document.addEventListener("DOMContentLoaded", () => {
  window.STOA?.accessibility?.init?.();
  renderProjects();
  renderProgress();
  renderJourney();
  setupNavigation();
  setupUserMenu();
  carregarDadosDoBanco();

  document.getElementById("avatar-button")?.addEventListener("click", () => {
    window.location.href = "../avatar/avatar.html";
  });
});

/* =========================================================
   CERTIFICADOS
   ========================================================= */

// Botão "Adicionar Certificado"
const addCertificateButton = document.getElementById("add-certificate");

// Modal de certificado
const certificateModal = document.getElementById("certificate-modal");

// Botão X
const certificateModalClose = document.getElementById("certificate-modal-close");

// Botão Cancelar
const certificateCancel = document.getElementById("certificate-cancel");

// Formulário
const certificateForm = document.getElementById("certificate-form");

// Área onde os certificados serão exibidos
const certificatesList = document.getElementById("certificates-list");


/* =========================================================
   ABRIR MODAL
   ========================================================= */

if (addCertificateButton) {
  addCertificateButton.addEventListener("click", () => {
    certificateModal.classList.add("open");
  });
}


/* =========================================================
   FECHAR MODAL
   ========================================================= */

function closeCertificateModal() {

  if (!certificateModal) return;

  certificateModal.classList.remove("open");

  if (certificateForm) {
    certificateForm.reset();
  }
}


/* Botão X */
if (certificateModalClose) {
  certificateModalClose.addEventListener(
    "click",
    closeCertificateModal
  );
}


/* Botão Cancelar */
if (certificateCancel) {
  certificateCancel.addEventListener(
    "click",
    closeCertificateModal
  );
}


/* Fechar clicando fora do modal */
if (certificateModal) {
  certificateModal.addEventListener("click", event => {

    if (event.target === certificateModal) {
      closeCertificateModal();
    }

  });
}


/* =========================================================
   ADICIONAR CERTIFICADO
   ========================================================= */

if (certificateForm) {

  certificateForm.addEventListener("submit", event => {

    event.preventDefault();

    // Pega os valores preenchidos
    const name =
      document.getElementById("certificate-name").value.trim();

    const institution =
      document.getElementById("certificate-institution").value.trim();

    const date =
      document.getElementById("certificate-date").value;

    const description =
      document.getElementById("certificate-description").value.trim();

    const hours =
      document.getElementById("certificate-hours").value.trim();

    const fileInput =
      document.getElementById("certificate-file");

    const file =
      fileInput ? fileInput.files[0] : null;


    /* =====================================================
       VALIDAÇÃO
       ===================================================== */

    if (!name || !institution || !date) {

      alert("Preencha os campos obrigatórios.");

      return;
    }


    /* =====================================================
       REMOVE A MENSAGEM "NENHUM CERTIFICADO"
       ===================================================== */

    const emptyCard =
      certificatesList.querySelector(".empty-card");

    if (emptyCard) {
      emptyCard.remove();
    }


    /* =====================================================
       FORMATA A DATA
       ===================================================== */

    const formattedDate =
      new Date(date + "T00:00:00")
        .toLocaleDateString("pt-BR");


    /* =====================================================
       CRIA O CARD DO CERTIFICADO
       ===================================================== */

    const certificateCard =
      document.createElement("div");

    certificateCard.className = "record-card";


    certificateCard.innerHTML = `

      <div class="record-card-top">

        <div class="record-symbol">
          ◇
        </div>

        <button
          type="button"
          class="record-remove"
          title="Remover certificado"
        >
          ×
        </button>

      </div>

      <h3>${name}</h3>

      <p class="record-muted">
        ${institution}
      </p>

      ${
        description
          ? `<p>${description}</p>`
          : ""
      }

      <div class="record-meta">

        <span>
          📅 ${formattedDate}
        </span>

        ${
          hours
            ? `<span>⏱ ${hours}</span>`
            : ""
        }

      </div>

      ${
        file
          ? `
            <span class="record-file">
              📎 ${file.name}
            </span>
          `
          : ""
      }

    `;


    /* =====================================================
       COLOCA O CERTIFICADO NA LISTA
       ===================================================== */

    certificatesList.appendChild(certificateCard);


    /* =====================================================
       BOTÃO REMOVER
       ===================================================== */

    const removeButton =
      certificateCard.querySelector(".record-remove");


    removeButton.addEventListener("click", () => {

      certificateCard.remove();


      /* Se não houver mais certificados,
         volta a mensagem inicial */

      if (!certificatesList.querySelector(".record-card")) {

        certificatesList.innerHTML = `

          <div class="empty-card">

            <div class="empty-icon">
              ◇
            </div>

            <h2>
              Nenhum certificado cadastrado
            </h2>

            <p>
              Use o botão acima para adicionar
              seu primeiro certificado.
            </p>

          </div>

        `;

      }

    });


    /* Fecha o modal */
    closeCertificateModal();

  });

}
/* =========================================================
   COMPETÊNCIAS
   ========================================================= */

// Botão "Adicionar Competência"
const addCompetencyButton = document.getElementById("add-competency");

// Modal
const competencyModal = document.getElementById("competency-modal");

// Botão X
const competencyModalClose = document.getElementById("competency-modal-close");

// Botão Cancelar
const competencyCancel = document.getElementById("competency-cancel");

// Formulário
const competencyForm = document.getElementById("competency-form");

// Área onde as competências serão exibidas
const competenciesList = document.getElementById("competencies-list");


// Abrir modal
if (addCompetencyButton) {
  addCompetencyButton.addEventListener("click", () => {
    competencyModal.classList.add("open");
  });
}


// Fechar modal
function closeCompetencyModal() {
  if (!competencyModal) return;

  competencyModal.classList.remove("open");

  if (competencyForm) {
    competencyForm.reset();
  }
}


// Botão X
if (competencyModalClose) {
  competencyModalClose.addEventListener(
    "click",
    closeCompetencyModal
  );
}


// Botão Cancelar
if (competencyCancel) {
  competencyCancel.addEventListener(
    "click",
    closeCompetencyModal
  );
}


// Clicar fora do modal fecha
if (competencyModal) {
  competencyModal.addEventListener("click", event => {

    if (event.target === competencyModal) {
      closeCompetencyModal();
    }

  });
}


// Enviar formulário
if (competencyForm) {

  competencyForm.addEventListener("submit", event => {

    event.preventDefault();

    const name = document
      .getElementById("competency-name")
      .value
      .trim();

    const level = document
      .getElementById("competency-level")
      .value;

    const description = document
      .getElementById("competency-description")
      .value
      .trim();


    // Verifica campo obrigatório
    if (!name || !level) {

      alert("Preencha os campos obrigatórios.");

      return;
    }


    // Remove mensagem de lista vazia
    const emptyCard =
      competenciesList.querySelector(".empty-card");

    if (emptyCard) {
      emptyCard.remove();
    }


    // Cria o card
    const competencyCard =
      document.createElement("div");

    competencyCard.className = "record-card";


    competencyCard.innerHTML = `
      <div class="record-card-top">

        <div class="record-symbol">
          ✦
        </div>

        <button
          type="button"
          class="record-remove"
          title="Remover competência"
        >
          ×
        </button>

      </div>

      <h3>${name}</h3>

      <span class="record-level">
        ${level}
      </span>

      ${
        description
          ? `<p>${description}</p>`
          : ""
      }
    `;


    // Adiciona na tela
    competenciesList.appendChild(
      competencyCard
    );


    // Botão remover
    const removeButton =
      competencyCard.querySelector(
        ".record-remove"
      );

    removeButton.addEventListener(
      "click",
      () => {

        competencyCard.remove();


        // Se não tiver mais competências,
        // mostra novamente o estado vazio
        if (
          !competenciesList.querySelector(
            ".record-card"
          )
        ) {

          competenciesList.innerHTML = `
            <div class="empty-card">

              <div class="empty-icon">
                ✦
              </div>

              <h2>
                Nenhuma competência cadastrada
              </h2>

              <p>
                Adicione suas competências para completar seu perfil.
              </p>

            </div>
          `;

        }

      }
    );


    // Fecha o modal
    closeCompetencyModal();

  });

}