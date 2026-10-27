const stages = [
  {
    id: "etapa1",
    number: "01",
    kicker: "DESENVOLVIMENTO DIRECIONADO",
    title: "Mini Projeto Técnico",
    subtitle: "Estruturação de demandas no Google Planilhas",
    description: "Interprete uma demanda, organize dados, use a IA de forma crítica e valide uma planilha funcional.",
    tags: ["Google Planilhas", "Organização", "IA"],
    href: "../../projetos/etapa-1/frontend/index.html"
  },
  {
    id: "etapa2",
    number: "02",
    kicker: "APLICAÇÃO E COMUNICAÇÃO",
    title: "Mini Projeto de Comunicação",
    subtitle: "Comunicação dos resultados da etapa técnica",
    description: "Transforme o resultado técnico em uma apresentação profissional clara, objetiva e contextualizada.",
    tags: ["Comunicação", "Apresentação", "Soft skills"],
    href: "../../projetos/etapa-2/frontend/index.html"
  },
  {
    id: "integrador",
    number: "03",
    kicker: "INTEGRAÇÃO",
    title: "Projeto Integrador",
    subtitle: "Análise de resultados de atendimento",
    description: "Integre análise de dados, IA, validação, apresentação e comunicação profissional em um único fluxo.",
    tags: ["Google Planilhas", "IA", "Comunicação"],
    href: "../../projetos/projeto-integrador/frontend/index.html"
  }
];

const DEMO_SESSION_KEY = "stoa_pitch_demo_integrador";

function getEffectiveProgress() {
  const params = new URLSearchParams(window.location.search);

  if (params.get("demo") === "integrador") {
    sessionStorage.setItem(DEMO_SESSION_KEY, "1");
  } else if (params.get("demo") === "off") {
    sessionStorage.removeItem(DEMO_SESSION_KEY);
  }

  const progress = window.STOA.progression.getProgress();
  const demoAtivo = sessionStorage.getItem(DEMO_SESSION_KEY) === "1";

  if (!demoAtivo) return { progress, demoAtivo: false };

  return {
    demoAtivo: true,
    progress: {
      ...progress,
      etapas: {
        ...progress.etapas,
        etapa1: { ...progress.etapas.etapa1, concluida: true, liberada: true },
        etapa2: { ...progress.etapas.etapa2, concluida: true, liberada: true },
        integrador: { ...progress.etapas.integrador, liberada: true }
      },
      concluidas: progress.etapas.integrador.concluida ? 3 : 2,
      percentual: progress.etapas.integrador.concluida ? 100 : 67
    }
  };
}

function statusFor(stageState) {
  if (stageState.concluida) {
    return { label: "Concluído", className: "completed", button: "Revisar projeto" };
  }

  if (stageState.liberada) {
    return { label: "Em andamento", className: "current", button: "Continuar projeto" };
  }

  return { label: "Bloqueado", className: "locked", button: "Bloqueado" };
}

function renderTrail() {
  const { progress, demoAtivo } = getEffectiveProgress();
  const list = document.getElementById("trail-stage-list");

  list.innerHTML = stages.map((stage, index) => {
    const state = progress.etapas[stage.id];
    const status = statusFor(state);
    const locked = !state.liberada;

    return `
      <article class="stage-card ${status.className}">
        <div class="stage-number" aria-hidden="true">${stage.number}</div>

        <div class="stage-content">
          <div class="stage-heading">
            <div>
              <span class="stage-kicker">${stage.kicker}</span>
              <h3>${stage.title}</h3>
              <p class="stage-subtitle">${stage.subtitle}</p>
            </div>
            <span class="stage-status ${status.className}">${status.label}</span>
          </div>

          <p class="stage-description">${stage.description}</p>

          <div class="stage-tags">
            ${stage.tags.map(tag => `<span>${tag}</span>`).join("")}
          </div>
        </div>

        <div class="stage-action">
          <button
            type="button"
            data-stage="${stage.id}"
            data-href="${stage.href}"
            ${locked ? "disabled" : ""}
          >
            ${locked ? "🔒 " : ""}${status.button}
          </button>
          ${locked ? '<small>Conclua a etapa anterior para desbloquear.</small>' : '<small>Seu progresso individual é salvo no Supabase.</small>'}
        </div>

        ${index < stages.length - 1 ? '<div class="stage-connector" aria-hidden="true"></div>' : ''}
      </article>
    `;
  }).join("");

  document.querySelectorAll("[data-stage][data-href]:not(:disabled)").forEach(button => {
    button.addEventListener("click", () => {
      window.location.href = button.dataset.href;
    });
  });

  const progressText = document.getElementById("trail-progress-text");
  const progressFill = document.getElementById("trail-progress-fill");
  const progressHint = document.getElementById("trail-progress-hint");

  progressText.textContent = `${progress.concluidas} de ${progress.total} concluídos`;
  progressFill.style.width = `${progress.percentual}%`;

  if (progress.etapas.integrador.concluida) {
    progressHint.textContent = "Trilha concluída. Recompensa final do avatar liberada.";
  } else if (progress.etapas.integrador.liberada) {
    progressHint.textContent = "Projeto Integrador liberado. É hora de conectar tudo.";
  } else if (progress.etapas.etapa2.liberada) {
    progressHint.textContent = "Mini Projeto de Comunicação liberado.";
  } else {
    progressHint.textContent = "Comece pelo Mini Projeto Técnico.";
  }

  const rewardLevel = demoAtivo ? Math.max(2, window.STOA.progression.getRewardLevel()) : window.STOA.progression.getRewardLevel();
  const rewardText = document.getElementById("avatar-reward-text");
  const messages = [
    "Conclua o Mini Projeto Técnico para liberar seu primeiro fundo especial.",
    "Primeiro fundo liberado. Conclua Comunicação para liberar um acessório.",
    "Acessório liberado. Conclua o Projeto Integrador para liberar a coleção final.",
    "Trilha concluída. Todos os cosméticos do MVP estão liberados."
  ];
  rewardText.textContent = messages[rewardLevel];
}

async function renderTrailFromDatabase() {
  try { await window.STOA.courseProgress.init(); renderTrail(); }
  catch (error) { console.error('Falha ao recuperar progresso:',error); }
}
window.addEventListener('pageshow', renderTrailFromDatabase);
