document.addEventListener("DOMContentLoaded", () => {
  // ======================================================
  // DADOS ESTÁTICOS PARA O PITCH
  // ======================================================
  const FEEDBACK_INTEGRADOR_ESTHER =
    "O participante teve um desempenho consistente em toda a jornada, destacando-se especialmente na capacidade de comunicar e sintetizar os resultados do projeto de forma clara e profissional.";

  const AVATAR_ESTHER_KEY = "stoa_avatar_preview_v1";

  // Os jovens fictícios usam somente opções que já existem
  // no editor de avatar da STOA. Nenhum adereço aleatório é permitido.
  function avatarPermitido({
    seed,
    skinColor,
    top,
    hairColor,
    eyes = "happy",
    mouth = "smile",
    backgroundColor = "b6e3f4"
  }) {
    const params = new URLSearchParams({
      seed,
      skinColor,
      topVariant: top,
      hairColor,
      eyesVariant: eyes,
      mouthVariant: mouth,
      backgroundColor,
      borderRadius: "50",
      facialHairProbability: "0",
      accessoriesProbability: "0"
    });

    return `https://api.dicebear.com/10.x/avataaars/svg?${params.toString()}`;
  }

  function avatarDaEsther() {
    // O mesmo avatar personalizado e salvo na área do Aprendiz
    // é reutilizado no Dashboard e nos Feedbacks do Gestor.
    return localStorage.getItem(AVATAR_ESTHER_KEY) ||
      avatarPermitido({
        seed: "Esther STOA",
        skinColor: "ffdbb4",
        top: "shortFlat",
        hairColor: "4a312c",
        eyes: "happy",
        mouth: "smile",
        backgroundColor: "b6e3f4"
      });
  }

  const jovens = [
    {
      id: "esther",
      nome: "Esther Barreto",
      get avatar() { return avatarDaEsther(); },
      trilha: "Ferramentas do dia a dia",
      projetoAtual: "Projeto Integrador",
      progresso: 100,
      status: "Concluído",
      statusClass: "status-complete"
    },
    {
      id: "lucas",
      nome: "Lucas Almeida",
      avatar: avatarPermitido({
        seed: "Lucas STOA",
        skinColor: "d08b5b",
        top: "shortWaved",
        hairColor: "2c1b18",
        eyes: "default",
        mouth: "smile",
        backgroundColor: "b6e3f4"
      }),
      trilha: "Ferramentas do dia a dia",
      projetoAtual: "Mini Projeto de Comunicação",
      progresso: 100,
      status: "Concluído",
      statusClass: "status-complete"
    },
    {
      id: "mariana",
      nome: "Mariana Souza",
      avatar: avatarPermitido({
        seed: "Mariana STOA",
        skinColor: "edb98a",
        top: "straight01",
        hairColor: "724133",
        eyes: "happy",
        mouth: "twinkle",
        backgroundColor: "c0aede"
      }),
      trilha: "Integração e Cultura",
      projetoAtual: "Integração e Cultura",
      progresso: 100,
      status: "Concluído",
      statusClass: "status-complete"
    },
    {
      id: "rafael",
      nome: "Rafael Costa",
      avatar: avatarPermitido({
        seed: "Rafael STOA",
        skinColor: "ae5d29",
        top: "shortCurly",
        hairColor: "2c1b18",
        eyes: "happy",
        mouth: "smile",
        backgroundColor: "b6e3f4"
      }),
      trilha: "Git e GitHub",
      projetoAtual: "Versionamento colaborativo",
      progresso: 35,
      status: "Em andamento",
      statusClass: "status-attention"
    }
  ];

  const feedbacks = [
    {
      id: "esther-integrador",
      jovemId: "esther",
      projeto: "Projeto Integrador",
      data: "06/10/2026",
      feedbackGeral: FEEDBACK_INTEGRADOR_ESTHER,
      pontosFortes: [
        "Apresentação de resultados rica em dados quantitativos e com excelente capacidade de síntese.",
        "Comunicação escrita e oral clara, objetiva e adequada ao contexto profissional.",
        "Postura de conferência dos dados gerados antes de realizar a entrega final."
      ],
      melhorias: [
        "Utilizar a IA de forma mais contínua e aprofundada, explorando perguntas de acompanhamento.",
        "Registrar com mais detalhes os procedimentos específicos adotados para validar os dados da planilha."
      ],
      dimensoes: [
        {
          titulo: "Interpretação e contextualização",
          nivel: 3,
          justificativa: "O participante compreendeu os objetivos centrais da tarefa de maneira adequada, identificando a necessidade de analisar dados de atendimento, realizar cálculos, organizar a planilha, gerar um gráfico e apresentar os resultados.",
          evidencias: [
            "Registro de entendimento inicial citando explicitamente a necessidade de analisar dados, fazer cálculos, organizar a planilha, criar gráfico, destacar um ponto de atenção e apresentar os resultados."
          ],
          limitacoes: [
            "Não detalhou previamente quais indicadores específicos seriam priorizados antes de iniciar a execução."
          ]
        },
        {
          titulo: "Uso da IA",
          nivel: 2,
          justificativa: "A pergunta enviada à IA foi pertinente e contextualizada sobre fórmulas de contagem e porcentagem no Google Planilhas. No entanto, houve apenas uma interação, sem continuidade, aprofundamento ou refinamento das respostas.",
          evidencias: [
            "Prompt solicitando orientação sobre como calcular a porcentagem de atendimentos concluídos e pendentes no Google Planilhas."
          ],
          limitacoes: [
            "Houve apenas uma troca de mensagem com a IA, sem perguntas de acompanhamento ou refinamento da solução."
          ]
        },
        {
          titulo: "Pensamento crítico e validação",
          nivel: 3,
          justificativa: "O participante demonstrou procedimento de verificação ao checar as caixas de seleção e registrar na reflexão que conferiu os resultados na planilha e adaptou sugestões da IA antes do envio.",
          evidencias: [
            "Confirmação dos campos de validação de cálculos, dados, IA e gráfico.",
            "Reflexão escrita afirmando ter conferido os resultados na planilha antes do envio e adaptado sugestões para maior clareza."
          ],
          limitacoes: [
            "Não descreveu detalhadamente quais fórmulas ou dados específicos exigiram ajustes durante a conferência."
          ]
        },
        {
          titulo: "Execução técnica",
          nivel: 2,
          justificativa: "O arquivo final foi entregue e a atividade foi declarada concluída. Como o conteúdo da planilha não passou por verificação objetiva via código, o nível é limitado a 2 conforme a regra da dimensão.",
          evidencias: [
            "Arquivo final registrado sob o nome dados_atendimentos_stoa (3).xlsx com execução declarada concluída."
          ],
          limitacoes: [
            "Ausência de análise objetiva da planilha pelo sistema para confirmar a exatidão dos cálculos e a presença do gráfico."
          ]
        },
        {
          titulo: "Comunicação",
          nivel: 4,
          justificativa: "A comunicação foi excelente tanto na apresentação transcrita quanto no e-mail ao gestor. O participante apresentou métricas precisas, destacou pontos analíticos relevantes e manteve tom profissional e claro.",
          evidencias: [
            "Apresentação oral com dados quantitativos precisos: 48 registros, 75% concluídos, 25% pendentes, tempo médio de 24 minutos e suporte com 18 atendimentos.",
            "Destaque analítico ressaltando que um quarto dos atendimentos ainda estava pendente.",
            "Mensagem final ao gestor objetiva, cortês e informando o envio do anexo."
          ],
          limitacoes: []
        },
        {
          titulo: "Execução do mini projeto",
          nivel: 3,
          justificativa: "A jornada do mini projeto foi realizada de forma coerente e consistente. O participante cumpriu todas as etapas, desde a interpretação e uso da IA até a validação e uma apresentação final muito bem comunicada.",
          evidencias: [
            "Conclusão de todas as etapas registradas no fluxo de trabalho.",
            "Coerência entre o entendimento inicial, a validação realizada e a síntese final apresentada."
          ],
          limitacoes: [
            "Interação reduzida com a IA e falta de verificação técnica objetiva do arquivo entregue."
          ]
        }
      ]
    },
    {
      id: "lucas-comunicacao",
      jovemId: "lucas",
      projeto: "Mini Projeto de Comunicação",
      data: "04/10/2026",
      feedbackGeral:
        "Lucas apresentou os resultados de forma clara e organizada, priorizando as informações necessárias para a compreensão da atividade. Demonstrou boa relação entre a preparação realizada, os dados apresentados e a comunicação final.",
      pontosFortes: [
        "Organização das informações antes da apresentação.",
        "Comunicação objetiva dos principais resultados.",
        "Uso adequado da IA como apoio, sem substituir a própria análise."
      ],
      melhorias: [
        "Explicar com mais detalhe os critérios usados para priorizar as informações.",
        "Reforçar a validação final antes da apresentação ao gestor."
      ]
    },
    {
      id: "mariana-integracao",
      jovemId: "mariana",
      projeto: "Integração e Cultura",
      data: "02/10/2026",
      feedbackGeral:
        "Mariana concluiu a atividade de forma consistente e demonstrou boa compreensão dos valores, processos e comportamentos esperados no contexto organizacional. As respostas foram coerentes com as situações propostas.",
      pontosFortes: [
        "Boa compreensão da cultura e dos processos organizacionais.",
        "Respostas coerentes com o contexto profissional.",
        "Capacidade de relacionar orientações a situações práticas."
      ],
      melhorias: [
        "Aprofundar exemplos próprios para tornar as respostas mais concretas.",
        "Registrar com mais clareza as decisões tomadas durante a atividade."
      ]
    },
    {
      id: "rafael-tecnico",
      jovemId: "rafael",
      projeto: "Mini Projeto Técnico",
      data: "30/09/2026",
      feedbackGeral:
        "Rafael estruturou a solução técnica de forma adequada e demonstrou compreensão das principais etapas do projeto. A execução apresentou boa organização, com oportunidade de aprofundar a validação dos resultados antes da entrega.",
      pontosFortes: [
        "Estrutura lógica e organizada da solução.",
        "Boa identificação das informações necessárias.",
        "Uso consciente dos recursos de apoio."
      ],
      melhorias: [
        "Realizar testes adicionais antes da entrega final.",
        "Documentar melhor as verificações realizadas durante a validação."
      ]
    }
  ];

  const projetos = [
    {
      id: "ferramentas-comunicacao",
      titulo: "Ferramentas do dia a dia e Comunicação",
      descricao: "Google Workspace, comunicação e aplicação prática."
    },
    {
      id: "git-github",
      titulo: "Git e GitHub",
      descricao: "Versionamento, branches e colaboração."
    },
    {
      id: "integracao-cultura",
      titulo: "Integração e Cultura",
      descricao: "Cultura, valores e processos organizacionais."
    }
  ];

  const atribuicoesPadrao = {
    esther: ["ferramentas-comunicacao"],
    lucas: ["ferramentas-comunicacao", "integracao-cultura"],
    mariana: ["integracao-cultura"],
    rafael: ["git-github"]
  };

  const STORAGE_KEY = "stoa_gestor_demo_atribuicoes_v1";

  const getJovem = id => jovens.find(jovem => jovem.id === id);

  function atualizarIcones() {
    if (window.lucide) {
      lucide.createIcons();
    }
  }

  // ======================================================
  // NAVEGAÇÃO ENTRE AS TRÊS ÁREAS
  // ======================================================
  const navButtons = document.querySelectorAll("[data-view]");
  const panels = document.querySelectorAll("[data-view-panel]");

  function abrirView(view) {
    panels.forEach(panel => {
      const ativa = panel.dataset.viewPanel === view;
      panel.hidden = !ativa;
      panel.classList.toggle("active-view", ativa);
    });

    document.querySelectorAll(".topbar-nav [data-view]").forEach(button => {
      button.classList.toggle("active", button.dataset.view === view);
    });

    const dropdown = document.getElementById("profileDropdown");
    dropdown?.classList.remove("show");

    window.scrollTo({ top: 0, behavior: "smooth" });
    atualizarIcones();
  }

  navButtons.forEach(button => {
    button.addEventListener("click", () => abrirView(button.dataset.view));
  });

  // ======================================================
  // DASHBOARD
  // ======================================================
  const dashboardGrid = document.getElementById("dashboardYoungGrid");
  const dashboardSearch = document.getElementById("dashboardSearch");

  function renderDashboard() {
    const termo = (dashboardSearch?.value || "").trim().toLowerCase();

    const filtrados = jovens.filter(jovem =>
      jovem.nome.toLowerCase().includes(termo) ||
      jovem.trilha.toLowerCase().includes(termo) ||
      jovem.projetoAtual.toLowerCase().includes(termo)
    );

    if (!filtrados.length) {
      dashboardGrid.innerHTML = `
        <div class="empty-message">
          Nenhum jovem encontrado para esta busca.
        </div>
      `;
      return;
    }

    dashboardGrid.innerHTML = filtrados.map(jovem => `
      <article class="young-card">
        <div class="young-avatar">
          <img src="${jovem.avatar}" alt="Avatar de ${jovem.nome}">
        </div>

        <div class="young-main">
          <h3>${jovem.nome}</h3>
          <span class="young-trail">${jovem.trilha} · ${jovem.projetoAtual}</span>

          <div class="progress-row" aria-label="Progresso de ${jovem.progresso}%">
            <div class="progress-track" aria-hidden="true">
              <span style="width:${jovem.progresso}%"></span>
            </div>
            <span class="progress-number">${jovem.progresso}%</span>
          </div>
        </div>

        <span class="status-chip ${jovem.statusClass}">${jovem.status}</span>
      </article>
    `).join("");
  }

  dashboardSearch?.addEventListener("input", renderDashboard);

  // ======================================================
  // FEEDBACKS
  // ======================================================
  const feedbackGrid = document.getElementById("feedbackGrid");
  const feedbackFilter = document.getElementById("feedbackFilter");
  const feedbackDialog = document.getElementById("feedbackDialog");
  const feedbackDialogClose = document.getElementById("feedbackDialogClose");
  const feedbackDialogReportSection = document.getElementById("feedbackDialogReportSection");
  const feedbackDialogDimensions = document.getElementById("feedbackDialogDimensions");

  function feedbackDisponivel(feedback) {
    return Boolean(feedback.feedbackGeral && feedback.feedbackGeral.trim());
  }

  function renderFeedbacks() {
    const filtro = feedbackFilter?.value || "todos";

    const filtrados = feedbacks.filter(feedback => {
      const disponivel = feedbackDisponivel(feedback);
      if (filtro === "disponivel") return disponivel;
      if (filtro === "pendente") return !disponivel;
      return true;
    });

    feedbackGrid.innerHTML = filtrados.map(feedback => {
      const jovem = getJovem(feedback.jovemId);
      const disponivel = feedbackDisponivel(feedback);

      return `
        <article class="feedback-card">
          <div class="feedback-card-top">
            <div class="young-avatar">
              <img src="${jovem.avatar}" alt="Avatar de ${jovem.nome}">
            </div>
            <div>
              <h3>${jovem.nome}</h3>
              <span>${jovem.trilha}</span>
            </div>
          </div>

          <div class="feedback-project">
            <strong>${feedback.projeto}</strong>
            <p>
              ${disponivel
                ? "A avaliação foi concluída. Abra o card para visualizar o feedback geral e os detalhes."
                : "O projeto ainda está em andamento. O feedback será disponibilizado após a conclusão e avaliação."}
            </p>
          </div>

          <div class="feedback-card-actions">
            <span class="feedback-state">
              <i data-lucide="${disponivel ? "circle-check" : "clock-3"}"></i>
              ${disponivel ? feedback.data : "Feedback pendente"}
            </span>

            <button
              type="button"
              data-feedback-id="${feedback.id}"
              ${disponivel ? "" : "disabled"}
            >
              <i data-lucide="expand"></i>
              ${disponivel ? "Ver feedback" : "Indisponível"}
            </button>
          </div>
        </article>
      `;
    }).join("");

    feedbackGrid.querySelectorAll("[data-feedback-id]").forEach(button => {
      button.addEventListener("click", () => abrirFeedback(button.dataset.feedbackId));
    });

    atualizarIcones();
  }

  feedbackFilter?.addEventListener("change", renderFeedbacks);

  function preencherLista(elemento, itens) {
    elemento.innerHTML = itens.map(item => `<li>${item}</li>`).join("");
  }

  function renderizarDimensoes(feedback) {
    const dimensoes = Array.isArray(feedback.dimensoes)
      ? feedback.dimensoes
      : [];

    if (!dimensoes.length) {
      feedbackDialogReportSection.hidden = true;
      feedbackDialogDimensions.innerHTML = "";
      return;
    }

    feedbackDialogReportSection.hidden = false;

    feedbackDialogDimensions.innerHTML = dimensoes.map(dimensao => {
      const evidencias = (dimensao.evidencias || [])
        .map(item => `<li>${item}</li>`)
        .join("");

      const limitacoes = (dimensao.limitacoes || [])
        .map(item => `<li>${item}</li>`)
        .join("");

      return `
        <article class="dimension-card">
          <div class="dimension-card-header">
            <h4>${dimensao.titulo}</h4>
            <span class="dimension-level">Nível ${dimensao.nivel} / 4</span>
          </div>

          <p>${dimensao.justificativa}</p>

          ${evidencias ? `
            <div class="dimension-list">
              <strong>Evidências</strong>
              <ul>${evidencias}</ul>
            </div>
          ` : ""}

          ${limitacoes ? `
            <div class="dimension-list dimension-limitations">
              <strong>Para avançar</strong>
              <ul>${limitacoes}</ul>
            </div>
          ` : ""}
        </article>
      `;
    }).join("");
  }

  function abrirFeedback(feedbackId) {
    const feedback = feedbacks.find(item => item.id === feedbackId);
    if (!feedback || !feedbackDisponivel(feedback)) return;

    const jovem = getJovem(feedback.jovemId);

    const avatarEl = document.getElementById("feedbackDialogAvatar");
    avatarEl.src = jovem.avatar;
    avatarEl.alt = `Avatar de ${jovem.nome}`;

    document.getElementById("feedbackDialogProject").textContent = feedback.projeto;
    document.getElementById("feedbackDialogTitle").textContent = jovem.nome;
    document.getElementById("feedbackDialogMeta").textContent =
      `${jovem.trilha} · Avaliação de ${feedback.data}`;
    document.getElementById("feedbackDialogGeneral").textContent = feedback.feedbackGeral;

    renderizarDimensoes(feedback);

    preencherLista(
      document.getElementById("feedbackDialogStrengths"),
      feedback.pontosFortes
    );

    preencherLista(
      document.getElementById("feedbackDialogImprovements"),
      feedback.melhorias
    );

    feedbackDialog.showModal();
    feedbackDialogClose.focus();
    atualizarIcones();
  }

  function fecharFeedback() {
    if (feedbackDialog.open) {
      feedbackDialog.close();
    }
  }

  feedbackDialogClose.addEventListener("click", fecharFeedback);

  feedbackDialog.addEventListener("click", event => {
    if (event.target === feedbackDialog) {
      fecharFeedback();
    }
  });

  feedbackDialog.addEventListener("cancel", event => {
    event.preventDefault();
    fecharFeedback();
  });

  // ======================================================
  // PROJETOS / ATRIBUIÇÕES DEMONSTRATIVAS
  // ======================================================
  const assignmentGrid = document.getElementById("assignmentGrid");
  const saveAssignments = document.getElementById("saveAssignments");
  const assignmentStatus = document.getElementById("assignmentStatus");

  function carregarAtribuicoes() {
    try {
      const salvo = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
      return salvo && typeof salvo === "object"
        ? { ...atribuicoesPadrao, ...salvo }
        : { ...atribuicoesPadrao };
    } catch {
      return { ...atribuicoesPadrao };
    }
  }

  let atribuicoes = carregarAtribuicoes();

  function renderAssignments() {
    assignmentGrid.innerHTML = jovens.map(jovem => {
      const selecionados = atribuicoes[jovem.id] || [];

      return `
        <article class="assignment-card">
          <div class="assignment-person">
            <div class="young-avatar">
              <img src="${jovem.avatar}" alt="Avatar de ${jovem.nome}">
            </div>
            <div>
              <h3>${jovem.nome}</h3>
              <span>Trilha atual: ${jovem.trilha}</span>
            </div>
          </div>

          <div class="project-options">
            ${projetos.map(projeto => `
              <label class="project-option">
                <input
                  type="checkbox"
                  data-young-id="${jovem.id}"
                  value="${projeto.id}"
                  ${selecionados.includes(projeto.id) ? "checked" : ""}
                >
                <span>
                  <strong>${projeto.titulo}</strong>
                  <span>${projeto.descricao}</span>
                </span>
              </label>
            `).join("")}
          </div>
        </article>
      `;
    }).join("");
  }

  saveAssignments.addEventListener("click", () => {
    const novas = {};

    jovens.forEach(jovem => {
      novas[jovem.id] = Array.from(
        document.querySelectorAll(`input[data-young-id="${jovem.id}"]:checked`)
      ).map(input => input.value);
    });

    atribuicoes = novas;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(atribuicoes));

    assignmentStatus.textContent = "Atribuições salvas localmente para a demonstração.";
    window.setTimeout(() => {
      assignmentStatus.textContent = "";
    }, 3500);
  });

  // ======================================================
  // INICIALIZAÇÃO
  // ======================================================
  renderDashboard();
  renderFeedbacks();
  renderAssignments();
  atualizarIcones();
});
