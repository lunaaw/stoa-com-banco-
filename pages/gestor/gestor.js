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

  let jovens = [];
  let feedbacks = [];

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

  const atribuicoesPadrao = {};

  let STORAGE_KEY = "stoa_gestor_demo_atribuicoes_v2";

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
      if (!jovem) return "";
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
  async function iniciarGestorReal() {
    const client = window.STOA?.supabase;
    if (!client) throw new Error("Cliente Supabase indisponível.");
    const { data: { user }, error: authError } = await client.auth.getUser();
    if (authError || !user) {
      location.replace("../login/login.html");
      return;
    }
    const { data: equipe, error: equipeErro } = await client.from("membros_equipe")
      .select("id, empresa_id, status").eq("id", user.id).maybeSingle();
    if (equipeErro) throw equipeErro;
    if (!equipe || equipe.status !== "Ativo") {
      location.replace("../login/login.html");
      return;
    }
    STORAGE_KEY = `stoa_gestor_demo_atribuicoes_v2_${user.id}`;
    const { data: vinculados, error: alunosErro } = await client.from("aprendizes")
      .select("id, area, status, gestor_id").eq("gestor_id", user.id).eq("empresa_id", equipe.empresa_id).order("id");
    if (alunosErro) throw alunosErro;
    const ids = (vinculados || []).map(a => a.id);
    let perfis = [], progresso = [];
    if (ids.length) {
      const pr = await client.from("perfis").select("id, nome_completo, avatar_url").in("id", ids);
      if (pr.error) throw pr.error;
      perfis = pr.data || [];
      const ev = await client.from("progresso_projetos").select("aprendiz_id, projeto_id, percentual, status").in("aprendiz_id", ids);
      if (ev.error) throw ev.error;
      progresso = ev.data || [];
    }
    const { data: projetosReais, error: projetosErro } = await client.from("projetos")
      .select("id,codigo").in("codigo", ["mini_projeto_tecnico","mini_projeto_comunicacao","projeto_integrador"]);
    if (projetosErro) throw projetosErro;
    const idsCurso = new Set((projetosReais || []).map(p => p.id));
    const nomes = new Map(perfis.map(p => [p.id, p]));
    jovens = (vinculados || []).map(a => {
      const perfil = nomes.get(a.id) || {};
      const estados = progresso.filter(p => p.aprendiz_id === a.id && idsCurso.has(p.projeto_id));
      const percent = estados.length ? Math.round(estados.reduce((acc,p) => acc + Math.max(0, Math.min(100, Number(p.percentual) || 0)),0)/3) : 0;
      const status = percent === 100 ? "Concluído" : percent > 0 ? "Em andamento" : "Não iniciado";
      return {
        id:a.id,
        nome:perfil.nome_completo || "Aprendiz",
        avatar: perfil.avatar_url || avatarPermitido({seed:a.id, skinColor:"ffdbb4", top:"shortFlat",hairColor:"4a312c"}),
        trilha:"Ferramentas do dia a dia e Comunicação",
        projetoAtual:"Curso em desenvolvimento",
        progresso:percent,
        status,
        statusClass:percent===100?"status-complete":percent>0?"status-attention":"",
      };
    });

    // Somente feedbacks persistidos, visíveis via RLS para este gestor.
    feedbacks = [];
    if (ids.length) {
      const {data:avaliacoes,error:erroFeedback}=await client.from("feedbacks_projetos")
        .select("id,aprendiz_id,projeto_id,resultado,resumo,gerado_em")
        .in("aprendiz_id",ids).order("gerado_em",{ascending:false});
      if (erroFeedback) throw erroFeedback;
      const codigos=new Map((projetosReais||[]).map(p=>[p.id,p.codigo]));
      const titulos={
        mini_projeto_tecnico:"Mini Projeto Técnico",
        mini_projeto_comunicacao:"Mini Projeto de Comunicação",
        projeto_integrador:"Projeto Integrador"
      };
      const escapar=(valor)=>String(valor??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
      const lista=(valor)=>Array.isArray(valor)?valor.map(escapar):[];
      feedbacks=(avaliacoes||[]).filter(f=>codigos.has(f.projeto_id)).map(f=>{
        const resultado=f.resultado||{};
        const dimensoes=Object.entries(resultado)
          .filter(([_,v])=>v && typeof v==="object" && !Array.isArray(v) &&
             (v.nivel!=null || v.justificativa))
          .map(([chave,v])=>({
            titulo:escapar(chave.replaceAll("_"," ")),
            nivel:escapar(v.nivel||"Não informado"),
            justificativa:escapar(v.justificativa||""),
            evidencias:lista(v.evidencias),
            limitacoes:lista(v.limitacoes||v.para_avancar)
          }));
        return {
          id:f.id,jovemId:f.aprendiz_id,
          projeto:titulos[codigos.get(f.projeto_id)]||"Mini projeto",
          data:new Date(f.gerado_em).toLocaleDateString("pt-BR"),
          feedbackGeral:escapar(f.resumo||resultado.observacao_geral||
             resultado.resumo_geral||resultado.feedback_geral||"Avaliação disponível. Veja os critérios."),
          pontosFortes:lista(resultado.pontos_fortes),
          melhorias:lista(resultado.oportunidades_melhoria||resultado.melhorias),
          dimensoes
        };
      });
    }
    atribuicoes = carregarAtribuicoes();
    document.querySelectorAll(".metrics-grid .metric-card strong").forEach((elemento, i) => {
      const valores = [jovens.length, jovens.filter(j => j.progresso > 0 && j.progresso < 100).length, jovens.filter(j => j.progresso === 100).length, 0];
      elemento.textContent = String(valores[i] ?? 0);
    });
    document.querySelector(".demo-badge")?.remove();
    renderDashboard();
    renderFeedbacks();
    renderAssignments();
    atualizarIcones();
  }
  iniciarGestorReal().catch(err => {
    console.error("Não foi possível carregar os dados do gestor:", err);
    dashboardGrid.textContent = "Não foi possível carregar a equipe. Confira sua sessão e as permissões do Supabase.";
    assignmentGrid.textContent = "Dados indisponíveis.";
    feedbackGrid.textContent = "Dados indisponíveis.";
  });
});
