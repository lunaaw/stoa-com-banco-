// ======================================================
// CONFIGURAÇÕES GERAIS
// ======================================================

const API_BASE_URL = "http://127.0.0.1:8000";
const STORAGE_KEY = "stoa_mini_projeto_tecnico_v1";

const etapas = [
    { numero: 1, nome: "Demanda" },
    { numero: 2, nome: "Entendimento" },
    { numero: 3, nome: "IA e Execução" },
    { numero: 4, nome: "Validação" },
    { numero: 5, nome: "Entrega" }
];

function criarEstadoInicial() {
    return {
        etapaAtual: 1,
        etapaLiberada: 1,
        etapasConcluidas: {
            1: false,
            2: false,
            3: false,
            4: false,
            5: false
        },
        entendimento: {
            informacoesIdentificadas: "",
            estruturaPlanejada: ""
        },
        iaExecucao: {
            mensagens: [],
            execucaoConcluida: false
        },
        validacao: {
            dadosConferidos: false,
            formulaTestada: false,
            recursosConferidos: false,
            iaVerificada: false,
            verificacaoFormula: "",
            verificacaoIA: ""
        },
        entrega: {
            arquivoFinalNome: "",
            analisePlanilhaId: "",
            planilhaAnalisada: false,
            erroPlanilha: "",
            decisaoTecnica: ""
        },
        avaliacao: {
            status: "nao_iniciada",
            resultado: null,
            erro: ""
        },
        finalizado: false
    };
}

function carregarEstado() {
    const salvo = localStorage.getItem(STORAGE_KEY);

    if (!salvo) {
        return criarEstadoInicial();
    }

    try {
        const dados = JSON.parse(salvo);
        const inicial = criarEstadoInicial();

        return {
            ...inicial,
            ...dados,
            etapasConcluidas: {
                ...inicial.etapasConcluidas,
                ...(dados.etapasConcluidas || {})
            },
            entendimento: {
                ...inicial.entendimento,
                ...(dados.entendimento || {})
            },
            iaExecucao: {
                ...inicial.iaExecucao,
                ...(dados.iaExecucao || {})
            },
            validacao: {
                ...inicial.validacao,
                ...(dados.validacao || {})
            },
            entrega: {
                ...inicial.entrega,
                ...(dados.entrega || {})
            },
            avaliacao: {
                ...inicial.avaliacao,
                ...(dados.avaliacao || {})
            }
        };
    } catch (erro) {
        console.error("Erro ao carregar estado:", erro);
        return criarEstadoInicial();
    }
}

let estado = carregarEstado();
let arquivoFinalSelecionado = null;

if (estado.avaliacao.status === "carregando") {
    estado.avaliacao.status = "erro";
    estado.avaliacao.erro =
        "A geração da avaliação foi interrompida. Tente novamente.";
    salvarEstado();
}

const trilha = document.getElementById("trilha");
const conteudoEtapa = document.getElementById("conteudo-etapa");
const botaoVoltar = document.getElementById("botao-voltar");
const botaoContinuar = document.getElementById("botao-continuar");
const mensagemValidacao = document.getElementById("mensagem-validacao");

const modalFinalizacao = document.getElementById("modal-finalizacao");
const botaoCancelarFinalizacao =
    document.getElementById("cancelar-finalizacao");
const botaoConfirmarFinalizacao =
    document.getElementById("confirmar-finalizacao");

let resolverModalFinalizacao = null;


// ======================================================
// UTILITÁRIOS
// ======================================================

function salvarEstado() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(estado));
}

function limparMensagemValidacao() {
    mensagemValidacao.textContent = "";
}

function mostrarErro(mensagem) {
    mensagemValidacao.textContent = mensagem;
}

function escaparHTML(texto) {
    if (texto === null || texto === undefined) {
        return "";
    }

    return String(texto)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

function formatarMensagemChat(texto) {
    return escaparHTML(texto).replaceAll("\n", "<br>");
}

function rolarParaTopo() {
    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}

function fecharModalFinalizacao(confirmado) {
    if (!modalFinalizacao?.open) {
        return;
    }

    modalFinalizacao.close();

    const resolver = resolverModalFinalizacao;
    resolverModalFinalizacao = null;

    if (resolver) {
        resolver(confirmado);
    }

    if (!confirmado) {
        requestAnimationFrame(() => {
            botaoContinuar?.focus();
        });
    }
}

function abrirModalFinalizacao() {
    if (!modalFinalizacao) {
        return Promise.resolve(false);
    }

    return new Promise(resolve => {
        resolverModalFinalizacao = resolve;
        modalFinalizacao.showModal();

        requestAnimationFrame(() => {
            botaoCancelarFinalizacao?.focus();
        });
    });
}

botaoCancelarFinalizacao?.addEventListener("click", () => {
    fecharModalFinalizacao(false);
});

botaoConfirmarFinalizacao?.addEventListener("click", () => {
    fecharModalFinalizacao(true);
});

modalFinalizacao?.addEventListener("cancel", evento => {
    evento.preventDefault();
    fecharModalFinalizacao(false);
});

modalFinalizacao?.addEventListener("click", evento => {
    if (evento.target === modalFinalizacao) {
        fecharModalFinalizacao(false);
    }
});

// ======================================================
// RENDERIZAÇÃO PRINCIPAL
// ======================================================

function renderizarAplicacao() {
    limparMensagemValidacao();
    renderizarTrilha();
    renderizarConteudo();
    renderizarNavegacao();
}

function renderizarTrilha() {
    trilha.innerHTML = "";

    etapas.forEach(etapa => {
        const botao = document.createElement("button");
        botao.type = "button";
        botao.className = "botao-etapa";

        const bloqueada =
            estado.finalizado ||
            etapa.numero > estado.etapaLiberada;

        const atual = etapa.numero === estado.etapaAtual;
        const concluida = estado.etapasConcluidas[etapa.numero];
        const marcador = concluida && !atual ? "✓" : etapa.numero;

        botao.innerHTML = `
            <span class="etapa-marcador" aria-hidden="true">${marcador}</span>
            <span class="etapa-nome">${escaparHTML(etapa.nome)}</span>
        `;

        botao.setAttribute(
            "aria-label",
            `Etapa ${etapa.numero}: ${etapa.nome}`
        );

        if (atual) {
            botao.classList.add("atual");
            botao.setAttribute("aria-current", "step");
        }

        if (concluida) {
            botao.classList.add("concluida");
        }

        if (bloqueada) {
            botao.classList.add("bloqueada");
            botao.disabled = true;
        }

        botao.addEventListener("click", () => {
            if (estado.finalizado) {
                return;
            }

            estado.etapaAtual = etapa.numero;
            salvarEstado();
            renderizarAplicacao();
            rolarParaTopo();
        });

        trilha.appendChild(botao);
    });
}

function renderizarConteudo() {
    if (estado.etapaAtual === 6) {
        renderizarFinalizacao();
        return;
    }

    switch (estado.etapaAtual) {
        case 1:
            renderizarDemanda();
            break;
        case 2:
            renderizarEntendimento();
            break;
        case 3:
            renderizarIAExecucao();
            break;
        case 4:
            renderizarValidacao();
            break;
        case 5:
            renderizarEntrega();
            break;
        default:
            renderizarDemanda();
    }
}

// ======================================================
// ETAPA 1 — DEMANDA
// ======================================================

function renderizarDemanda() {
    conteudoEtapa.innerHTML = `
        <section>
            <h2>1. Demanda</h2>

            <p>
                Leia atentamente a solicitação e o documento-fonte antes
                de iniciar a atividade.
            </p>

            <div class="bloco">
                <h3>Solicitação do gestor</h3>

                <p>
                    Olá! Precisamos organizar as demandas da equipe para
                    facilitar o acompanhamento das atividades.
                </p>

                <p>
                    Você receberá um documento com informações em texto
                    corrido sobre tarefas, responsáveis, prazos,
                    prioridades e status. Transforme essas informações em
                    uma planilha estruturada e funcional no Google Planilhas.
                </p>

                <p>A planilha deverá apresentar, no mínimo:</p>

                <ul>
                    <li>demanda;</li>
                    <li>responsável;</li>
                    <li>prazo;</li>
                    <li>prioridade;</li>
                    <li>status;</li>
                    <li>situação do prazo.</li>
                </ul>

                <p>
                    Utilize filtros, listas suspensas para prioridade e
                    status, formatação condicional e uma fórmula que
                    classifique automaticamente a situação do prazo.
                </p>

                <p>
                    Durante a execução, realize pelo menos uma interação
                    técnica com o Assistente STOA para compreender, revisar
                    ou testar algum recurso utilizado na sua solução.
                </p>
            </div>

            <div class="bloco">
                <h3>Regra da situação do prazo</h3>

                <p>
                    Considere como data de referência da atividade:
                    <strong>30/09/2026</strong>.
                </p>

                <ul>
                    <li>atividade concluída → <strong>Concluída</strong>;</li>
                    <li>
                        atividade não concluída com prazo anterior à data
                        de referência → <strong>Atrasada</strong>;
                    </li>
                    <li>demais atividades → <strong>No prazo</strong>.</li>
                </ul>

                <p class="aviso">
                    A regra está definida, mas a fórmula não está pronta.
                    Você deverá construí-la e testá-la na sua planilha.
                </p>
            </div>

            <div class="bloco">
                <h3>Documento-fonte</h3>

                <div class="arquivo-destaque">
                    <div>
                        <p><strong>demandas_equipe.docx</strong></p>
                        <p>
                            O arquivo contém as informações em texto corrido.
                            Ele é apenas a fonte de dados e não deve ser reorganizado.
                        </p>
                    </div>

                    <a
                        class="botao-link"
                        href="./material/demandas_equipe.docx"
                        download
                    >
                        Baixar documento
                    </a>
                </div>

                <div class="acoes">
                    <button type="button" id="abrir-docs">
                        Abrir Google Docs
                    </button>
                </div>
            </div>

            <div class="bloco">
                <h3>O que será avaliado?</h3>
                <p>
                    O foco deste mini projeto é estritamente técnico:
                    interpretação da estrutura dos dados, organização da
                    planilha, uso dos recursos solicitados, uso consciente
                    da IA e validação da solução construída.
                </p>
            </div>
        </section>
    `;

    document
        .getElementById("abrir-docs")
        .addEventListener("click", () => {
            window.open("https://docs.google.com/document/u/0/", "_blank");
        });
}

// ======================================================
// ETAPA 2 — ENTENDIMENTO
// ======================================================

function renderizarEntendimento() {
    conteudoEtapa.innerHTML = `
        <section>
            <h2>2. Entendimento</h2>

            <p>
                Antes de pedir ajuda à IA, registre como você interpretou
                tecnicamente a atividade.
            </p>

            <div class="bloco">
                <div class="campo-grupo">
                    <label for="informacoes-identificadas">
                        Quais informações presentes no documento precisam
                        ser transformadas em campos da planilha?
                    </label>

                    <textarea
                        id="informacoes-identificadas"
                        placeholder="Descreva os dados que você identificou..."
                    >${escaparHTML(
                        estado.entendimento.informacoesIdentificadas
                    )}</textarea>
                </div>

                <div class="campo-grupo">
                    <label for="estrutura-planejada">
                        Como você pretende estruturar a planilha para
                        facilitar o acompanhamento das demandas?
                    </label>

                    <textarea
                        id="estrutura-planejada"
                        placeholder="Explique brevemente sua estrutura planejada..."
                    >${escaparHTML(
                        estado.entendimento.estruturaPlanejada
                    )}</textarea>
                </div>
            </div>
        </section>
    `;

    const informacoes = document.getElementById("informacoes-identificadas");
    const estrutura = document.getElementById("estrutura-planejada");

    informacoes.addEventListener("input", evento => {
        estado.entendimento.informacoesIdentificadas = evento.target.value;
        salvarEstado();
    });

    estrutura.addEventListener("input", evento => {
        estado.entendimento.estruturaPlanejada = evento.target.value;
        salvarEstado();
    });
}

// ======================================================
// ETAPA 3 — IA E EXECUÇÃO
// ======================================================

function renderizarIAExecucao() {
    let historicoHTML = "";

    if (estado.iaExecucao.mensagens.length === 0) {
        historicoHTML = '<p class="chat-vazio">Nenhuma interação registrada.</p>';
    } else {
        estado.iaExecucao.mensagens.forEach(mensagem => {
            const papel = mensagem.papel || "user";
            const nome =
                papel === "model" ? "Assistente STOA" : "Jovem Aprendiz";

            const classeMensagem =
                papel === "model"
                    ? "mensagem-assistente"
                    : "mensagem-usuario";

            historicoHTML += `
                <div class="mensagem-chat ${classeMensagem}">
                    <strong>${nome}</strong>
                    <div>${formatarMensagemChat(mensagem.texto)}</div>
                </div>
            `;
        });
    }

    conteudoEtapa.innerHTML = `
        <section>
            <h2>3. IA e Execução</h2>

            <p>
                Agora estruture sua planilha no Google Planilhas. O
                Assistente STOA pode ajudar com dúvidas técnicas, mas a
                execução e a validação continuam sendo suas.
            </p>

            <div class="bloco">
                <h3>Objetivos técnicos</h3>

                <ul class="lista-objetivos">
                    <li>transformar o texto corrido em dados tabulares;</li>
                    <li>criar cabeçalhos claros e coerentes;</li>
                    <li>usar datas corretamente;</li>
                    <li>configurar filtros;</li>
                    <li>criar listas suspensas para prioridade e status;</li>
                    <li>criar a fórmula de situação do prazo;</li>
                    <li>aplicar formatação condicional;</li>
                    <li>testar se os recursos funcionam.</li>
                </ul>

                <div class="acoes">
                    <a
                        class="botao-link"
                        href="./material/demandas_equipe.docx"
                        download
                    >
                        Baixar documento-fonte
                    </a>

                    <button type="button" id="abrir-planilhas">
                        Abrir Google Planilhas
                    </button>
                </div>
            </div>

            <div class="bloco">
                <h3>Assistente STOA</h3>

                <p>
                    Faça pelo menos uma interação técnica com a IA para
                    compreender um recurso, raciocinar sobre uma fórmula,
                    testar uma lógica ou revisar uma decisão. Não há
                    necessidade de pedir a solução inteira.
                </p>

                <p class="aviso">
                    Confira sempre as sugestões na sua própria planilha.
                    O assistente não tem acesso automático ao arquivo que
                    você está montando.
                </p>

                <div id="chat-historico" class="chat-historico">
                    ${historicoHTML}
                </div>

                <textarea
                    id="mensagem-ia"
                    placeholder="Digite sua dúvida técnica para o Assistente STOA..."
                ></textarea>

                <p id="status-chat" class="status"></p>

                <div class="acoes">
                    <button type="button" id="enviar-mensagem-ia">
                        Enviar para IA
                    </button>
                </div>
            </div>

            <div class="bloco">
                <label class="checkbox-item">
                    <input
                        type="checkbox"
                        id="execucao-concluida"
                        ${estado.iaExecucao.execucaoConcluida ? "checked" : ""}
                    >
                    <span>
                        Concluí a estruturação técnica da planilha e estou
                        pronto para realizar a validação.
                    </span>
                </label>
            </div>
        </section>
    `;

    vincularEventosIAExecucao();

    const historico = document.getElementById("chat-historico");
    historico.scrollTop = historico.scrollHeight;
}

function vincularEventosIAExecucao() {
    document
        .getElementById("abrir-planilhas")
        .addEventListener("click", () => {
            window.open("https://sheets.google.com", "_blank");
        });

    const botaoEnviar = document.getElementById("enviar-mensagem-ia");
    const campoMensagem = document.getElementById("mensagem-ia");

    botaoEnviar.addEventListener("click", enviarMensagemIA);

    campoMensagem.addEventListener("keydown", evento => {
        if (evento.ctrlKey && evento.key === "Enter") {
            evento.preventDefault();
            enviarMensagemIA();
        }
    });

    document
        .getElementById("execucao-concluida")
        .addEventListener("change", evento => {
            estado.iaExecucao.execucaoConcluida = evento.target.checked;
            salvarEstado();
        });
}

async function enviarMensagemIA() {
    const campo = document.getElementById("mensagem-ia");
    const botao = document.getElementById("enviar-mensagem-ia");
    const status = document.getElementById("status-chat");
    const mensagem = campo.value.trim();

    if (!mensagem) {
        status.textContent = "Digite uma pergunta antes de enviar.";
        return;
    }

    const historico = estado.iaExecucao.mensagens.map(item => ({
        papel: item.papel || "user",
        texto: item.texto
    }));

    try {
        botao.disabled = true;
        campo.disabled = true;
        status.textContent = "O Assistente STOA está respondendo...";

        const resposta = await fetch(`${API_BASE_URL}/chat`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                mensagem,
                historico
            })
        });

        let dados = null;

        try {
            dados = await resposta.json();
        } catch (erroLeitura) {
            console.error("Erro ao interpretar resposta do chat:", erroLeitura);
        }

        if (!resposta.ok) {
            throw new Error(
                dados?.detail || "Não foi possível obter uma resposta da IA."
            );
        }

        if (!dados?.resposta?.trim()) {
            throw new Error("A IA retornou uma resposta vazia.");
        }

        const agora = new Date().toISOString();

        estado.iaExecucao.mensagens.push(
            {
                papel: "user",
                texto: mensagem,
                data: agora
            },
            {
                papel: "model",
                texto: dados.resposta.trim(),
                data: new Date().toISOString()
            }
        );

        salvarEstado();
        renderizarAplicacao();
    } catch (erro) {
        console.error("Erro no chat:", erro);
        status.textContent =
            erro.message || "Não foi possível conversar com a IA.";
        botao.disabled = false;
        campo.disabled = false;
        campo.focus();
    }
}

// ======================================================
// ETAPA 4 — VALIDAÇÃO
// ======================================================

function renderizarValidacao() {
    conteudoEtapa.innerHTML = `
        <section>
            <h2>4. Validação</h2>

            <p>
                Antes de enviar a planilha, teste a solução que você
                construiu. Marcar os itens não substitui a explicação das
                verificações realizadas.
            </p>

            <div class="bloco">
                ${criarCheckboxValidacao(
                    "validar-dados",
                    estado.validacao.dadosConferidos,
                    "Conferi se todas as demandas e seus dados foram transferidos do documento-fonte."
                )}

                ${criarCheckboxValidacao(
                    "validar-formula",
                    estado.validacao.formulaTestada,
                    "Testei a fórmula de situação do prazo em casos diferentes."
                )}

                ${criarCheckboxValidacao(
                    "validar-recursos",
                    estado.validacao.recursosConferidos,
                    "Conferi filtros, listas suspensas e formatação condicional."
                )}

                ${criarCheckboxValidacao(
                    "validar-ia",
                    estado.validacao.iaVerificada,
                    "Conferi as sugestões da IA antes de aplicá-las na planilha."
                )}
            </div>

            <div class="bloco">
                <div class="campo-grupo">
                    <label for="verificacao-formula">
                        Como você verificou se a fórmula da situação do
                        prazo estava funcionando corretamente?
                    </label>

                    <textarea
                        id="verificacao-formula"
                        placeholder="Descreva o teste que você realizou..."
                    >${escaparHTML(
                        estado.validacao.verificacaoFormula
                    )}</textarea>
                </div>

                <div class="campo-grupo">
                    <label for="verificacao-ia">
                        Alguma sugestão da IA precisou ser adaptada ou
                        conferida antes de ser utilizada? Explique brevemente.
                    </label>

                    <textarea
                        id="verificacao-ia"
                        placeholder="Explique como você conferiu ou adaptou a sugestão..."
                    >${escaparHTML(
                        estado.validacao.verificacaoIA
                    )}</textarea>
                </div>
            </div>
        </section>
    `;

    vincularEventosValidacao();
}

function criarCheckboxValidacao(id, marcado, texto) {
    return `
        <label class="checkbox-item">
            <input
                type="checkbox"
                id="${id}"
                ${marcado ? "checked" : ""}
            >
            <span>${texto}</span>
        </label>
    `;
}

function vincularEventosValidacao() {
    const configuracoes = [
        { id: "validar-dados", propriedade: "dadosConferidos" },
        { id: "validar-formula", propriedade: "formulaTestada" },
        { id: "validar-recursos", propriedade: "recursosConferidos" },
        { id: "validar-ia", propriedade: "iaVerificada" }
    ];

    configuracoes.forEach(item => {
        document
            .getElementById(item.id)
            .addEventListener("change", evento => {
                estado.validacao[item.propriedade] = evento.target.checked;
                salvarEstado();
            });
    });

    document
        .getElementById("verificacao-formula")
        .addEventListener("input", evento => {
            estado.validacao.verificacaoFormula = evento.target.value;
            salvarEstado();
        });

    document
        .getElementById("verificacao-ia")
        .addEventListener("input", evento => {
            estado.validacao.verificacaoIA = evento.target.value;
            salvarEstado();
        });
}

// ======================================================
// ETAPA 5 — ENTREGA
// ======================================================

function renderizarEntrega() {
    conteudoEtapa.innerHTML = `
        <section>
            <h2>5. Entrega</h2>

            <p>
                Envie a planilha final em formato .xlsx. O sistema fará
                verificações objetivas da estrutura e dos recursos técnicos.
            </p>

            <div class="bloco">
                <h3>Planilha final</h3>

                <input
                    type="file"
                    id="arquivo-final"
                    accept=".xlsx"
                >

                <p id="status-planilha" class="status">
                    ${
                        estado.entrega.planilhaAnalisada
                            ? "Planilha recebida e analisada pelo sistema."
                            : estado.entrega.erroPlanilha
                                ? escaparHTML(estado.entrega.erroPlanilha)
                                : ""
                    }
                </p>

                <p>
                    Arquivo registrado:
                    <strong id="nome-arquivo-final">
                        ${
                            escaparHTML(estado.entrega.arquivoFinalNome) ||
                            "Nenhum arquivo selecionado"
                        }
                    </strong>
                </p>
            </div>

            <div class="bloco">
                <div class="campo-grupo">
                    <label for="decisao-tecnica">
                        Qual recurso ou decisão de organização você considera
                        mais importante para facilitar o acompanhamento das
                        demandas na planilha e por quê?
                    </label>

                    <textarea
                        id="decisao-tecnica"
                        placeholder="Explique uma decisão técnica da sua solução..."
                    >${escaparHTML(
                        estado.entrega.decisaoTecnica
                    )}</textarea>
                </div>
            </div>

            <p class="aviso">
                Ao finalizar, a entrega será bloqueada para alterações e a
                avaliação STOA será gerada com base nas evidências registradas.
            </p>
        </section>
    `;

    const arquivo = document.getElementById("arquivo-final");
    const decisao = document.getElementById("decisao-tecnica");

    arquivo.addEventListener("change", async evento => {
        const selecionado = evento.target.files[0];

        if (!selecionado) {
            return;
        }

        arquivoFinalSelecionado = selecionado;
        estado.entrega.arquivoFinalNome = selecionado.name;
        estado.entrega.analisePlanilhaId = "";
        estado.entrega.planilhaAnalisada = false;
        estado.entrega.erroPlanilha = "";
        salvarEstado();

        const nome = document.getElementById("nome-arquivo-final");
        nome.textContent = selecionado.name;

        try {
            await enviarPlanilhaParaBackend(selecionado);
        } catch (erro) {
            console.error("Falha no envio da planilha:", erro);
        }
    });

    decisao.addEventListener("input", evento => {
        estado.entrega.decisaoTecnica = evento.target.value;
        salvarEstado();
    });
}

async function enviarPlanilhaParaBackend(arquivo) {
    const status = document.getElementById("status-planilha");

    if (!arquivo) {
        throw new Error("Nenhuma planilha foi selecionada.");
    }

    if (!arquivo.name.toLowerCase().endsWith(".xlsx")) {
        throw new Error("Envie a planilha no formato .xlsx.");
    }

    estado.entrega.planilhaAnalisada = false;
    estado.entrega.analisePlanilhaId = "";
    estado.entrega.erroPlanilha = "";
    salvarEstado();

    status.textContent = "Enviando e analisando a planilha...";

    const formulario = new FormData();
    formulario.append("arquivo", arquivo, arquivo.name);

    try {
        const resposta = await fetch(`${API_BASE_URL}/planilha`, {
            method: "POST",
            body: formulario
        });

        let dados = null;

        try {
            dados = await resposta.json();
        } catch (erroLeitura) {
            console.error(
                "Erro ao interpretar resposta da planilha:",
                erroLeitura
            );
        }

        if (!resposta.ok) {
            throw new Error(
                dados?.detail || "Não foi possível analisar a planilha."
            );
        }

        if (!dados?.analise_id) {
            throw new Error(
                "O backend não retornou o identificador da análise."
            );
        }

        estado.entrega.analisePlanilhaId = dados.analise_id;
        estado.entrega.planilhaAnalisada = true;
        estado.entrega.erroPlanilha = "";
        salvarEstado();

        status.textContent = "Planilha recebida e analisada pelo sistema.";

        console.log("Análise da planilha registrada:", dados);
        return dados;
    } catch (erro) {
        estado.entrega.analisePlanilhaId = "";
        estado.entrega.planilhaAnalisada = false;
        estado.entrega.erroPlanilha =
            erro.message || "Não foi possível analisar a planilha.";
        salvarEstado();
        status.textContent = estado.entrega.erroPlanilha;
        throw erro;
    }
}

// ======================================================
// AVALIAÇÃO FINAL
// ======================================================

function renderizarListaAvaliacao(itens) {
    if (!Array.isArray(itens) || itens.length === 0) {
        return "<p>Nenhum item registrado.</p>";
    }

    const itensHTML = itens
        .map(item => `<li>${escaparHTML(item)}</li>`)
        .join("");

    return `<ul>${itensHTML}</ul>`;
}

function renderizarDimensaoAvaliacao(titulo, dimensao) {
    if (!dimensao) {
        return "";
    }

    return `
        <div class="bloco">
            <h4>${escaparHTML(titulo)}</h4>

            <p class="nota-nivel">
                <strong>Nível:</strong>
                ${escaparHTML(dimensao.nivel)} / 4
            </p>

            <p>
                <strong>Justificativa:</strong>
                ${escaparHTML(dimensao.justificativa)}
            </p>

            <p><strong>Evidências:</strong></p>
            ${renderizarListaAvaliacao(dimensao.evidencias)}

            ${
                Array.isArray(dimensao.limitacoes) &&
                dimensao.limitacoes.length > 0
                    ? `
                        <p><strong>Limitações:</strong></p>
                        ${renderizarListaAvaliacao(dimensao.limitacoes)}
                    `
                    : ""
            }
        </div>
    `;
}

function renderizarResultadoAvaliacao() {
    const resultado = estado.avaliacao.resultado;

    if (!resultado) {
        return "";
    }

    return `
        <div class="bloco avaliacao-cabecalho">
            <h3>Avaliação STOA</h3>
            <p>
                A avaliação foi gerada com base nas evidências
                registradas ao longo do mini projeto.
            </p>
        </div>

        ${renderizarDimensaoAvaliacao(
            "Interpretação e estruturação",
            resultado.interpretacao_estruturacao
        )}

        ${renderizarDimensaoAvaliacao(
            "Uso da IA",
            resultado.uso_ia
        )}

        ${renderizarDimensaoAvaliacao(
            "Pensamento crítico e validação",
            resultado.pensamento_critico_validacao
        )}

        ${renderizarDimensaoAvaliacao(
            "Execução técnica",
            resultado.execucao_tecnica
        )}

        ${renderizarDimensaoAvaliacao(
            "Organização da solução técnica",
            resultado.organizacao_solucao_tecnica
        )}

        ${renderizarDimensaoAvaliacao(
            "Execução do mini projeto",
            resultado.execucao_mini_projeto
        )}

        <div class="bloco">
            <h4>Pontos fortes</h4>
            ${renderizarListaAvaliacao(resultado.pontos_fortes)}
        </div>

        <div class="bloco">
            <h4>Oportunidades de melhoria</h4>
            ${renderizarListaAvaliacao(resultado.oportunidades_melhoria)}
        </div>

        <div class="bloco">
            <h4>Observação geral</h4>
            <p>${escaparHTML(resultado.observacao_geral)}</p>
        </div>
    `;
}

function renderizarAreaAvaliacao() {
    const avaliacao = estado.avaliacao;

    if (avaliacao.status === "carregando") {
        return `
            <div class="bloco">
                <h3>Avaliação STOA</h3>
                <p>Gerando sua avaliação técnica...</p>
            </div>
        `;
    }

    if (avaliacao.status === "erro") {
        return `
            <div class="bloco">
                <h3>Avaliação STOA</h3>
                <p>
                    O projeto foi concluído, mas não foi possível gerar a
                    avaliação neste momento.
                </p>
                <p class="aviso">${escaparHTML(avaliacao.erro)}</p>
                <button type="button" id="tentar-avaliacao-novamente">
                    Tentar gerar avaliação novamente
                </button>
            </div>
        `;
    }

    if (avaliacao.status === "concluida") {
        return renderizarResultadoAvaliacao();
    }

    return "";
}

function renderizarFinalizacao() {
    const interacoesUsuario = estado.iaExecucao.mensagens.filter(
        mensagem => (mensagem.papel || "user") === "user"
    ).length;

    conteudoEtapa.innerHTML = `
        <section>
            <h2>Mini projeto finalizado</h2>

            <p>
                Sua entrega foi registrada no protótipo da STOA.
            </p>

            ${renderizarAreaAvaliacao()}

            <div class="resumo-final">
                <h3>Resumo da execução</h3>

                <p>
                    <strong>Interações com IA:</strong>
                    ${interacoesUsuario}
                </p>

                <p>
                    <strong>Planilha final:</strong>
                    ${escaparHTML(estado.entrega.arquivoFinalNome)}
                </p>

                <p>
                    <strong>Decisão técnica registrada:</strong>
                    ${escaparHTML(estado.entrega.decisaoTecnica)}
                </p>
            </div>

            <div class="acoes">
                <button type="button" id="voltar-trilha">
                    Voltar para a trilha
                </button>
            </div>
        </section>
    `;

    const botaoTentarNovamente = document.getElementById(
        "tentar-avaliacao-novamente"
    );

    if (botaoTentarNovamente) {
        botaoTentarNovamente.addEventListener(
            "click",
            iniciarAvaliacaoFinal
        );
    }

    document
        .getElementById("voltar-trilha")
        .addEventListener("click", () => {
            window.location.href = "../../../pages/trilha/trilha.html";
        });
}

function montarPedidoAvaliacao() {
    return {
        entendimento: {
            informacoes_identificadas:
                estado.entendimento.informacoesIdentificadas,
            estrutura_planejada:
                estado.entendimento.estruturaPlanejada
        },
        mensagens_ia: estado.iaExecucao.mensagens.map(mensagem => ({
            papel: mensagem.papel || "user",
            texto: mensagem.texto
        })),
        execucao_concluida: estado.iaExecucao.execucaoConcluida,
        validacao: {
            dados_conferidos: estado.validacao.dadosConferidos,
            formula_testada: estado.validacao.formulaTestada,
            recursos_conferidos: estado.validacao.recursosConferidos,
            ia_verificada: estado.validacao.iaVerificada,
            verificacao_formula: estado.validacao.verificacaoFormula,
            verificacao_ia: estado.validacao.verificacaoIA
        },
        entrega: {
            arquivo_final_nome: estado.entrega.arquivoFinalNome,
            analise_planilha_id: estado.entrega.analisePlanilhaId,
            decisao_tecnica: estado.entrega.decisaoTecnica
        }
    };
}

async function iniciarAvaliacaoFinal() {
    estado.avaliacao.status = "carregando";
    estado.avaliacao.resultado = null;
    estado.avaliacao.erro = "";
    salvarEstado();
    renderizarAplicacao();

    try {
        const resposta = await fetch(`${API_BASE_URL}/avaliar`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(montarPedidoAvaliacao())
        });

        let dados = null;

        try {
            dados = await resposta.json();
        } catch (erroLeitura) {
            console.error(
                "Erro ao interpretar resposta da avaliação:",
                erroLeitura
            );
        }

        if (!resposta.ok) {
            throw new Error(
                dados?.detail || "Não foi possível gerar a avaliação."
            );
        }

        if (!dados) {
            throw new Error("O servidor não retornou a avaliação.");
        }

        estado.avaliacao.status = "concluida";
        estado.avaliacao.resultado = dados;
        estado.avaliacao.erro = "";
        salvarEstado();
        renderizarAplicacao();
    } catch (erro) {
        console.error("Erro ao gerar avaliação:", erro);
        estado.avaliacao.status = "erro";
        estado.avaliacao.resultado = null;
        estado.avaliacao.erro =
            erro.message || "Não foi possível gerar a avaliação.";
        salvarEstado();
        renderizarAplicacao();
    }
}

// ======================================================
// NAVEGAÇÃO E VALIDAÇÃO
// ======================================================

function renderizarNavegacao() {
    if (estado.etapaAtual === 6) {
        botaoVoltar.style.display = "none";
        botaoContinuar.style.display = "none";
        return;
    }

    botaoVoltar.style.display = "";
    botaoContinuar.style.display = "";
    botaoVoltar.disabled = estado.etapaAtual === 1;

    if (estado.etapaAtual === 5) {
        botaoContinuar.textContent = "Finalizar projeto";
    } else {
        botaoContinuar.textContent = "Continuar →";
    }
}

botaoVoltar.addEventListener("click", () => {
    if (estado.finalizado || estado.etapaAtual <= 1) {
        return;
    }

    estado.etapaAtual--;
    salvarEstado();
    renderizarAplicacao();
    rolarParaTopo();
});

botaoContinuar.addEventListener("click", async () => {
    limparMensagemValidacao();

    const etapa = estado.etapaAtual;

    if (!validarEtapa(etapa)) {
        return;
    }

    estado.etapasConcluidas[etapa] = true;

    if (etapa < 5) {
        estado.etapaLiberada = Math.max(
            estado.etapaLiberada,
            etapa + 1
        );
        estado.etapaAtual = etapa + 1;
        salvarEstado();
        renderizarAplicacao();
        rolarParaTopo();
        return;
    }

    const confirmarFinalizacao =
        await abrirModalFinalizacao();

    if (!confirmarFinalizacao) {
        return;
    }

    estado.finalizado = true;
    estado.etapaAtual = 6;
    salvarEstado();
    renderizarAplicacao();
    rolarParaTopo();
    await iniciarAvaliacaoFinal();
});

function validarEtapa(etapa) {
    switch (etapa) {
        case 1:
            return true;

        case 2:
            if (
                estado.entendimento.informacoesIdentificadas.trim().length < 20
            ) {
                mostrarErro(
                    "Descreva quais informações do documento devem virar campos da planilha."
                );
                return false;
            }

            if (estado.entendimento.estruturaPlanejada.trim().length < 20) {
                mostrarErro(
                    "Explique como você pretende estruturar a planilha."
                );
                return false;
            }

            return true;

        case 3: {
            const respostasIA = estado.iaExecucao.mensagens.filter(
                mensagem => mensagem.papel === "model"
            ).length;

            if (respostasIA === 0) {
                mostrarErro(
                    "Realize pelo menos uma interação técnica com o Assistente STOA antes de continuar."
                );
                return false;
            }

            if (!estado.iaExecucao.execucaoConcluida) {
                mostrarErro(
                    "Confirme que concluiu a estruturação técnica da planilha."
                );
                return false;
            }

            return true;
        }

        case 4: {
            const todosMarcados =
                estado.validacao.dadosConferidos &&
                estado.validacao.formulaTestada &&
                estado.validacao.recursosConferidos &&
                estado.validacao.iaVerificada;

            if (!todosMarcados) {
                mostrarErro(
                    "Conclua todos os itens de validação técnica antes de continuar."
                );
                return false;
            }

            if (estado.validacao.verificacaoFormula.trim().length < 20) {
                mostrarErro(
                    "Explique como você testou a fórmula da situação do prazo."
                );
                return false;
            }

            if (estado.validacao.verificacaoIA.trim().length < 20) {
                mostrarErro(
                    "Explique como você conferiu ou adaptou as sugestões da IA."
                );
                return false;
            }

            return true;
        }

        case 5:
            if (!estado.entrega.arquivoFinalNome) {
                mostrarErro("Selecione a planilha final antes de finalizar.");
                return false;
            }

            if (
                !estado.entrega.planilhaAnalisada ||
                !estado.entrega.analisePlanilhaId
            ) {
                mostrarErro(
                    "Aguarde a análise da planilha antes de finalizar."
                );
                return false;
            }

            if (estado.entrega.decisaoTecnica.trim().length < 20) {
                mostrarErro(
                    "Explique uma decisão técnica importante da sua solução."
                );
                return false;
            }

            return true;

        default:
            return true;
    }
}

// ======================================================
// INICIALIZAÇÃO
// ======================================================

renderizarAplicacao();
