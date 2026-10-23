// ======================================================
// CONFIGURAÇÕES GERAIS
// ======================================================

const API_BASE_URL =
    "http://127.0.0.1:8000";

const STORAGE_KEY =
    "stoa_projeto_integrador_v1";

const DURACAO_MAXIMA_AUDIO =
    120;


// ======================================================
// ETAPAS
// ======================================================

const etapas = [
    {
        numero: 1,
        nome: "Demanda"
    },
    {
        numero: 2,
        nome: "Entendimento"
    },
    {
        numero: 3,
        nome: "IA e Execução"
    },
    {
        numero: 4,
        nome: "Validação"
    },
    {
        numero: 5,
        nome: "Apresentação"
    },
    {
        numero: 6,
        nome: "Entrega"
    }
];


// ======================================================
// ESTADO INICIAL
// ======================================================

function criarEstadoInicial() {

    return {

        etapaAtual: 1,

        etapaLiberada: 1,

        etapasConcluidas: {
            1: false,
            2: false,
            3: false,
            4: false,
            5: false,
            6: false
        },

        entendimento: "",

       iaExecucao: {
          
        mensagens: [],
        
        arquivoFinalNome: "",
     
        analisePlanilhaId: "",
        
        planilhaAnalisada: false,
       
        erroPlanilha: "",
  
        execucaoConcluida: false

    },

        validacao: {

            calculosConferidos: false,

            dadosComparados: false,

            iaVerificada: false,

            graficoVerificado: false,

            reflexao: ""
        },

        apresentacao: {

            duracao: 0,

            transcricao: ""
        },

        entrega: {

            assunto: "",

            mensagem: ""
        },

        avaliacao: {
         status: "nao_iniciada",
         resultado: null,
         erro: ""
        
        },



        finalizado: false
    };
}


// ======================================================
// CARREGAR ESTADO
// ======================================================

function carregarEstado() {

    const salvo =
        localStorage.getItem(
            STORAGE_KEY
        );


    if (!salvo) {

        return criarEstadoInicial();
    }


    try {

        const dados =
            JSON.parse(salvo);

        const inicial =
            criarEstadoInicial();


        return {

            ...inicial,

            ...dados,

            etapasConcluidas: {
                ...inicial.etapasConcluidas,
                ...(dados.etapasConcluidas || {})
            },

            iaExecucao: {
                ...inicial.iaExecucao,
                ...(dados.iaExecucao || {})
            },

            validacao: {
                ...inicial.validacao,
                ...(dados.validacao || {})
            },

            apresentacao: {
                ...inicial.apresentacao,
                ...(dados.apresentacao || {})
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

        console.error(
            "Erro ao carregar estado:",
            erro
        );


        return criarEstadoInicial();
    }
}


let estado =
    carregarEstado();

    if (estado.avaliacao.status === "carregando") {
    estado.avaliacao.status = "erro";

    estado.avaliacao.erro =
        "A geração da avaliação foi interrompida. Tente novamente.";

    salvarEstado();
}


// ======================================================
// ÁUDIO
// ======================================================

let mediaRecorder = null;

let partesAudio = [];

let audioBlob = null;

let streamAudio = null;

let intervaloCronometro = null;

let inicioGravacao = null;

let arquivoFinalSelecionado = null;


// ======================================================
// ELEMENTOS PRINCIPAIS
// ======================================================

const trilha =
    document.getElementById(
        "trilha"
    );

const conteudoEtapa =
    document.getElementById(
        "conteudo-etapa"
    );

const botaoVoltar =
    document.getElementById(
        "botao-voltar"
    );

const botaoContinuar =
    document.getElementById(
        "botao-continuar"
    );

const mensagemValidacao =
    document.getElementById(
        "mensagem-validacao"
    );

const modalFinalizacao =
    document.getElementById(
        "modal-finalizacao"
    );

const botaoCancelarFinalizacao =
    document.getElementById(
        "cancelar-finalizacao"
    );

const botaoConfirmarFinalizacao =
    document.getElementById(
        "confirmar-finalizacao"
    );

let resolverModalFinalizacao = null;


// ======================================================
// UTILITÁRIOS
// ======================================================

function salvarEstado() {

    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(estado)
    );
}


function limparMensagemValidacao() {

    mensagemValidacao.textContent =
        "";
}


function mostrarErro(mensagem) {

    mensagemValidacao.textContent =
        mensagem;
}


function escaparHTML(texto) {

    if (
        texto === null ||
        texto === undefined
    ) {

        return "";
    }


    return String(texto)

        .replaceAll(
            "&",
            "&amp;"
        )

        .replaceAll(
            "<",
            "&lt;"
        )

        .replaceAll(
            ">",
            "&gt;"
        )

        .replaceAll(
            '"',
            "&quot;"
        )

        .replaceAll(
            "'",
            "&#039;"
        );
}


function formatarMensagemChat(texto) {

    return escaparHTML(
        texto
    ).replaceAll(
        "\n",
        "<br>"
    );
}


function formatarTempo(segundos) {

    const minutos =
        Math.floor(
            segundos / 60
        );

    const restante =
        segundos % 60;


    return (
        String(minutos)
            .padStart(2, "0")
        +
        ":"
        +
        String(restante)
            .padStart(2, "0")
    );
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

botaoCancelarFinalizacao?.addEventListener(
    "click",
    () => {
        fecharModalFinalizacao(false);
    }
);

botaoConfirmarFinalizacao?.addEventListener(
    "click",
    () => {
        fecharModalFinalizacao(true);
    }
);

modalFinalizacao?.addEventListener(
    "cancel",
    evento => {
        evento.preventDefault();
        fecharModalFinalizacao(false);
    }
);

modalFinalizacao?.addEventListener(
    "click",
    evento => {
        if (evento.target === modalFinalizacao) {
            fecharModalFinalizacao(false);
        }
    }
);


// ======================================================
// RENDERIZAÇÃO PRINCIPAL
// ======================================================

function renderizarAplicacao() {

    limparMensagemValidacao();

    renderizarTrilha();

    renderizarConteudo();

    renderizarNavegacao();
}


// ======================================================
// TRILHA
// ======================================================

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

            if (estado.etapaAtual === 5 && mediaRecorder?.state === "recording") {
                mediaRecorder.stop();
            }

            estado.etapaAtual = etapa.numero;
            salvarEstado();
            renderizarAplicacao();
            rolarParaTopo();
        });

        trilha.appendChild(botao);
    });
}


// ======================================================
// CONTEÚDO
// ======================================================

function renderizarConteudo() {

    if (
        estado.etapaAtual === 7
    ) {

        renderizarFinalizacao();

        return;
    }


    switch (
        estado.etapaAtual
    ) {

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
            renderizarApresentacao();
            break;

        case 6:
            renderizarEntrega();
            break;
    }
}


// ======================================================
// 1. DEMANDA
// ======================================================

function renderizarDemanda() {

    conteudoEtapa.innerHTML = `

        <section>

            <h2>
                1. Demanda
            </h2>

            <p>
                Leia atentamente a solicitação
                recebida antes de iniciar a atividade.
            </p>


            <div class="bloco">

                <h3>
                    Solicitação do gestor
                </h3>


                <p>
                    Olá! Preciso apresentar os resultados
                    dos atendimentos da equipe referentes
                    ao último mês.
                </p>


                <p>
                    Organize os dados disponibilizados
                    e prepare uma análise contendo:
                </p>


                <ul>

                    <li>
                        quantidade total de atendimentos;
                    </li>

                    <li>
                        quantidade e percentual de
                        atendimentos concluídos
                        e pendentes;
                    </li>

                    <li>
                        tempo médio de atendimento;
                    </li>

                    <li>
                        setor com maior número
                        de atendimentos;
                    </li>

                    <li>
                        uma visualização que facilite
                        a comparação dos resultados.
                    </li>

                </ul>


                <p>
                    Além dos resultados, identifique
                    um ponto que considere relevante
                    nos dados e explique brevemente
                    por que ele merece atenção.
                </p>


                <p>
                    Você poderá utilizar a Inteligência
                    Artificial como apoio durante
                    a atividade, mas deverá verificar
                    as informações e os cálculos
                    antes de realizar a entrega.
                </p>

            </div>


            <div class="bloco">

                <h3>
                    Arquivo da atividade
                </h3>


                <p>
                    <strong>
                        dados_atendimentos.xlsx
                    </strong>
                </p>


                <p>
                    Utilize esta planilha como base
                    para realizar sua análise.
                    Você poderá criar fórmulas,
                    tabelas de resumo, novas abas
                    e visualizações no próprio arquivo.
                </p>


                <p>
                    Mantenha os dados originais
                    disponíveis na planilha.
                    Ao finalizar a atividade,
                    você deverá enviar novamente
                    o arquivo contendo também
                    os resultados da sua análise.
                </p>


                <a
                    href="./dados_atendimentos_stoa.xlsx"
                    download
                >
                    Baixar arquivo
                </a>

            </div>


            <div class="bloco">

                <h3>
                    O que você fará neste projeto?
                </h3>


                <p>
                    Sua tarefa será utilizar
                    os dados fornecidos para realizar
                    uma análise no Google Planilhas,
                    com apoio de recursos
                    de Inteligência Artificial.
                </p>


                <p>
                    Você deverá calcular os indicadores
                    solicitados, organizar os resultados,
                    criar uma visualização e identificar
                    um ponto relevante nos dados.
                </p>


                <p>
                    A planilha original deverá ser
                    utilizada como base do trabalho.
                    Você poderá acrescentar fórmulas,
                    tabelas de resumo, novas abas
                    e gráficos, mantendo os dados
                    originais disponíveis no arquivo.
                </p>


                <p>
                    Ao finalizar, envie a própria
                    planilha com a análise realizada.
                </p>


                <p>
                    Durante o projeto, utilize a IA
                    como ferramenta de apoio,
                    analisando criticamente suas
                    respostas e verificando informações,
                    fórmulas e resultados antes
                    de utilizá-los.
                </p>

            </div>

        </section>
    `;
}

// ======================================================
// 2. ENTENDIMENTO
// ======================================================

function renderizarEntendimento() {

    conteudoEtapa.innerHTML = `

        <section>

            <h2>
                2. Entendimento
            </h2>


            <p>
                Antes de utilizar a IA,
                registre sua própria compreensão
                da atividade.
            </p>


            <div class="bloco">

                <label
                    for="resposta-entendimento"
                >

                    <strong>
                        Com suas próprias palavras,
                        o que você entendeu que precisa
                        realizar nesta atividade?
                    </strong>

                </label>


                <br><br>


                <textarea
                    id="resposta-entendimento"
                    placeholder="Escreva sua resposta aqui..."
                >${escaparHTML(
                    estado.entendimento
                )}</textarea>

            </div>

        </section>
    `;


    const campo =
        document.getElementById(
            "resposta-entendimento"
        );


    campo.addEventListener(
        "input",
        evento => {

            estado.entendimento =
                evento.target.value;


            salvarEstado();
        }
    );
}


// ======================================================
// 3. IA E EXECUÇÃO
// ======================================================

function renderizarIAExecucao() {

    let historicoHTML =
        "";


    if (
        estado
            .iaExecucao
            .mensagens
            .length === 0
    ) {

        historicoHTML = `
            <p class="chat-vazio">Nenhuma interação registrada.</p>
        `;

    } else {

        estado
            .iaExecucao
            .mensagens
            .forEach(
                mensagem => {

                    const papel =
                        mensagem.papel
                        ||
                        "user";


                    const nome =
                        papel === "model"
                        ?
                        "Assistente STOA"
                        :
                        "Jovem Aprendiz";


                    const classeMensagem =
                        papel === "model"
                        ?
                        "mensagem-assistente"
                        :
                        "mensagem-usuario";

                    historicoHTML += `

                        <div
                            class="mensagem-chat ${classeMensagem}"
                        >

                            <strong>
                                ${nome}
                            </strong>

                            <div>
                                ${formatarMensagemChat(
                                    mensagem.texto
                                )}
                            </div>

                        </div>
                    `;
                }
            );
    }


    conteudoEtapa.innerHTML = `

        <section>

            <h2>
                3. IA e Execução
            </h2>


            <p>
                Agora você deverá executar
                a atividade utilizando
                os dados disponibilizados.
            </p>


            <div class="bloco">

                <h3>
                    Objetivos
                </h3>


                <ul class="lista-objetivos">

                    <li>
                        Calcular o total
                        de atendimentos.
                    </li>

                    <li>
                        Identificar concluídos
                        e pendentes.
                    </li>

                    <li>
                        Calcular seus percentuais.
                    </li>

                    <li>
                        Calcular o tempo médio
                        de atendimento.
                    </li>

                    <li>
                        Identificar o setor
                        com maior número
                        de atendimentos.
                    </li>

                    <li>
                        Criar uma visualização.
                    </li>

                    <li>
                        Identificar um ponto
                        relevante nos dados.
                    </li>

                </ul>


                <div class="acoes">

                    <a
                        href="./dados_atendimentos_stoa.xlsx"
                        download
                    >
                        Baixar dados
                    </a>


                    <button
                        type="button"
                        id="abrir-planilhas"
                    >
                        Abrir Google Planilhas
                    </button>

                </div>

            </div>


            <div class="bloco">

                <h3>
                    Assistente de IA
                </h3>


                <p>
                    Utilize o assistente como apoio
                    durante a execução da atividade.
                </p>


                <p class="aviso">

                    Analise criticamente as respostas
                    da IA e confira informações,
                    fórmulas e resultados antes
                    de utilizá-los.

                </p>


                <div
                    id="chat-historico"
                    class="chat-historico"
                >
                    ${historicoHTML}
                </div>


                <textarea
                    id="mensagem-ia"
                    placeholder="Digite sua pergunta para o Assistente STOA..."
                ></textarea>


                <p
                    id="status-chat"
                    class="status"
                ></p>


                <div class="acoes">

                    <button
                        type="button"
                        id="enviar-mensagem-ia"
                    >
                        Enviar para IA
                    </button>

                </div>

            </div>


            <div class="bloco">

                <h3>
                     Planilha final
                </h3>

                <p>
                    Quando concluir sua análise,
                    envie a versão final da planilha utilizada
                    durante a atividade.
                </p>

                <p>
                  Mantenha os dados originais no arquivo
                  e acrescente seus cálculos, resultados
                  e a visualização solicitada.
                </p>

                <p>
                 Você pode, por exemplo, criar uma nova aba
                chamada <strong>Análise</strong> para organizar
                os resultados.
                </p>


                <input
                    type="file"
                    id="arquivo-final"
                    accept=".xlsx,.xls,.csv"
                >

                <p
                     id="status-planilha"
                     class="status"
                >
         ${
             estado.iaExecucao.planilhaAnalisada
            ? "Planilha recebida e analisada pelo sistema."
            : estado.iaExecucao.erroPlanilha
                ? escaparHTML(
                    estado.iaExecucao.erroPlanilha
                )
                : ""
         }
                </p>


                <p>
                    Arquivo registrado:

                    <strong
                        id="nome-arquivo-final"
                    >

                        ${
                            escaparHTML(
                                estado
                                    .iaExecucao
                                    .arquivoFinalNome
                            )
                            ||
                            "Nenhum arquivo selecionado"
                        }

                    </strong>
                </p>


                <label
                    class="checkbox-item"
                >

                    <input
                        type="checkbox"
                        id="execucao-concluida"

                        ${
                            estado
                                .iaExecucao
                                .execucaoConcluida
                                ?
                                "checked"
                                :
                                ""
                        }
                    >

                    Concluí os cálculos,
                    a análise e a visualização
                    solicitada.

                </label>

            </div>

        </section>
    `;


    vincularEventosIAExecucao();


    const historico =
        document.getElementById(
            "chat-historico"
        );


    historico.scrollTop =
        historico.scrollHeight;
}

// ======================================================
// ENVIO E ANÁLISE DA PLANILHA
// ======================================================

async function enviarPlanilhaParaBackend(
    arquivo
) {

    const status =
        document.getElementById(
            "status-planilha"
        );


    if (!arquivo) {

        throw new Error(
            "Nenhuma planilha foi selecionada."
        );
    }


    const nome =
        arquivo.name.toLowerCase();


    if (!nome.endsWith(".xlsx")) {

        throw new Error(
            "Envie uma planilha no formato .xlsx."
        );
    }


    estado.iaExecucao.planilhaAnalisada =
        false;

    estado.iaExecucao.analisePlanilhaId =
        "";

    estado.iaExecucao.erroPlanilha =
        "";


    salvarEstado();


    if (status) {

        status.textContent =
            "Enviando e analisando a planilha...";
    }


    const formulario =
        new FormData();


    formulario.append(
        "arquivo",
        arquivo,
        arquivo.name
    );


    try {

        const resposta =
            await fetch(
                `${API_BASE_URL}/planilha`,
                {
                    method: "POST",
                    body: formulario
                }
            );


        let dados = null;


        try {

            dados =
                await resposta.json();

        } catch (erroLeitura) {

            console.error(
                "Erro ao interpretar resposta da planilha:",
                erroLeitura
            );
        }


        if (!resposta.ok) {

            throw new Error(
                dados?.detail ||
                "Não foi possível analisar a planilha."
            );
        }


        if (
            !dados ||
            !dados.analise_id
        ) {

            throw new Error(
                "O backend não retornou o identificador da análise."
            );
        }


        estado.iaExecucao.analisePlanilhaId =
            dados.analise_id;

        estado.iaExecucao.planilhaAnalisada =
            true;

        estado.iaExecucao.erroPlanilha =
            "";


        salvarEstado();


        if (status) {

            status.textContent =
                "Planilha recebida e analisada pelo sistema.";
        }


        console.log(
            "Análise da planilha registrada:",
            dados
        );


        return dados;


    } catch (erro) {

        console.error(
            "Erro ao analisar planilha:",
            erro
        );


        estado.iaExecucao.analisePlanilhaId =
            "";

        estado.iaExecucao.planilhaAnalisada =
            false;

        estado.iaExecucao.erroPlanilha =
            erro.message ||
            "Não foi possível analisar a planilha.";


        salvarEstado();


        if (status) {

            status.textContent =
                estado.iaExecucao.erroPlanilha;
        }


        throw erro;
    }
}


// ======================================================
// EVENTOS DA ETAPA 3
// ======================================================

function vincularEventosIAExecucao() {

    const botaoPlanilhas =
        document.getElementById(
            "abrir-planilhas"
        );


    botaoPlanilhas.addEventListener(
        "click",
        () => {

            window.open(
                "https://sheets.google.com",
                "_blank"
            );
        }
    );


    const botaoEnviar =
        document.getElementById(
            "enviar-mensagem-ia"
        );


    const campoMensagem =
        document.getElementById(
            "mensagem-ia"
        );


    botaoEnviar.addEventListener(
        "click",
        enviarMensagemIA
    );


    campoMensagem.addEventListener(
        "keydown",
        evento => {

            if (
                evento.ctrlKey
                &&
                evento.key === "Enter"
            ) {

                evento.preventDefault();

                enviarMensagemIA();
            }
        }
    );


    const arquivoFinal =
        document.getElementById(
            "arquivo-final"
        );


    arquivoFinal.addEventListener(
        "change",
        async evento => {

            const arquivo =
                evento.target.files[0];


            if (!arquivo) {

                return;
            }


            arquivoFinalSelecionado =
                arquivo;


            estado
                .iaExecucao
                .arquivoFinalNome =
                arquivo.name;


            estado
                .iaExecucao
                .analisePlanilhaId =
                "";


            estado
                .iaExecucao
                .planilhaAnalisada =
                false;


            estado
                .iaExecucao
                .erroPlanilha =
                "";


            salvarEstado();


            const nomeArquivo =
                document.getElementById(
                    "nome-arquivo-final"
                );


            if (nomeArquivo) {

                nomeArquivo.textContent =
                    arquivo.name;
            }


            console.log(
                "Planilha selecionada:",
                arquivoFinalSelecionado
            );


            try {

                await enviarPlanilhaParaBackend(
                    arquivo
                );

            } catch (erro) {

                console.error(
                    "Falha no envio da planilha:",
                    erro
                );
            }
        }
    );


    const checkbox =
        document.getElementById(
            "execucao-concluida"
        );


    checkbox.addEventListener(
        "change",
        evento => {

            estado
                .iaExecucao
                .execucaoConcluida =
                evento.target.checked;


            salvarEstado();
        }
    );
}
// ======================================================
// CHAT COM GEMINI
// ======================================================

async function enviarMensagemIA() {

    const campo =
        document.getElementById(
            "mensagem-ia"
        );


    const botao =
        document.getElementById(
            "enviar-mensagem-ia"
        );


    const status =
        document.getElementById(
            "status-chat"
        );


    const mensagem =
        campo
            .value
            .trim();


    if (!mensagem) {

        status.textContent =
            "Digite uma pergunta antes de enviar.";

        return;
    }


    const historico =
        estado
            .iaExecucao
            .mensagens
            .map(
                item => ({

                    papel:
                        item.papel
                        ||
                        "user",

                    texto:
                        item.texto
                })
            );


    try {

        botao.disabled =
            true;

        campo.disabled =
            true;


        status.textContent =
            "O Assistente STOA está respondendo...";


        const resposta =
            await fetch(
                `${API_BASE_URL}/chat`,
                {

                    method:
                        "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body:
                        JSON.stringify({
                            mensagem:
                                mensagem,

                            historico:
                                historico
                        })
                }
            );


        const dados =
            await resposta.json();


        if (!resposta.ok) {

            throw new Error(
                dados.detail
                ||
                "Não foi possível obter uma resposta da IA."
            );
        }


        if (
            !dados.resposta
            ||
            !dados.resposta.trim()
        ) {

            throw new Error(
                "A IA retornou uma resposta vazia."
            );
        }


        const agora =
            new Date()
                .toISOString();


        estado
            .iaExecucao
            .mensagens
            .push(
                {
                    papel:
                        "user",

                    texto:
                        mensagem,

                    data:
                        agora
                },

                {
                    papel:
                        "model",

                    texto:
                        dados
                            .resposta
                            .trim(),

                    data:
                        new Date()
                            .toISOString()
                }
            );


        salvarEstado();


        console.log(
            "Resposta da IA:",
            dados.resposta
        );


        renderizarAplicacao();


    } catch (erro) {

        console.error(
            "Erro no chat:",
            erro
        );


        status.textContent =
            erro.message
            ||
            "Não foi possível conversar com a IA.";


        botao.disabled =
            false;

        campo.disabled =
            false;

        campo.focus();
    }
}


// ======================================================
// 4. VALIDAÇÃO
// ======================================================

function renderizarValidacao() {

    conteudoEtapa.innerHTML = `

        <section>

            <h2>
                4. Validação
            </h2>


            <p>
                Antes de apresentar o trabalho,
                revise os resultados.
            </p>


            <div class="bloco">

                <label
                    class="checkbox-item"
                >

                    <input
                        type="checkbox"
                        id="validar-calculos"

                        ${
                            estado
                                .validacao
                                .calculosConferidos
                                ?
                                "checked"
                                :
                                ""
                        }
                    >

                    Conferi os cálculos realizados.

                </label>


                <label
                    class="checkbox-item"
                >

                    <input
                        type="checkbox"
                        id="validar-dados"

                        ${
                            estado
                                .validacao
                                .dadosComparados
                                ?
                                "checked"
                                :
                                ""
                        }
                    >

                    Comparei os resultados
                    com os dados originais.

                </label>


                <label
                    class="checkbox-item"
                >

                    <input
                        type="checkbox"
                        id="validar-ia"

                        ${
                            estado
                                .validacao
                                .iaVerificada
                                ?
                                "checked"
                                :
                                ""
                        }
                    >

                    Verifiquei as sugestões
                    fornecidas pela IA
                    antes de utilizá-las.

                </label>


                <label
                    class="checkbox-item"
                >

                    <input
                        type="checkbox"
                        id="validar-grafico"

                        ${
                            estado
                                .validacao
                                .graficoVerificado
                                ?
                                "checked"
                                :
                                ""
                        }
                    >

                    Conferi se a planilha final
                    contém a visualização solicitada.

                </label>

            </div>


            <div class="bloco">

                <label
                    for="reflexao-validacao"
                >

                    <strong>

                        Durante a atividade,
                        alguma resposta da IA
                        precisou ser verificada,
                        corrigida ou adaptada?
                        Explique.

                    </strong>

                </label>


                <br><br>


                <textarea
                    id="reflexao-validacao"
                    placeholder="Escreva sua reflexão..."
                >${escaparHTML(
                    estado
                        .validacao
                        .reflexao
                )}</textarea>

            </div>

        </section>
    `;


    vincularEventosValidacao();
}


// ======================================================
// EVENTOS DE VALIDAÇÃO
// ======================================================

function vincularEventosValidacao() {

    const configuracoes = [

        {
            id:
                "validar-calculos",

            propriedade:
                "calculosConferidos"
        },

        {
            id:
                "validar-dados",

            propriedade:
                "dadosComparados"
        },

        {
            id:
                "validar-ia",

            propriedade:
                "iaVerificada"
        },

        {
            id:
                "validar-grafico",

            propriedade:
                "graficoVerificado"
        }
    ];


    configuracoes.forEach(
        item => {

            const campo =
                document.getElementById(
                    item.id
                );


            campo.addEventListener(
                "change",
                evento => {

                    estado
                        .validacao[
                            item.propriedade
                        ] =
                        evento.target.checked;


                    salvarEstado();
                }
            );
        }
    );


    const reflexao =
        document.getElementById(
            "reflexao-validacao"
        );


    reflexao.addEventListener(
        "input",
        evento => {

            estado
                .validacao
                .reflexao =
                evento.target.value;


            salvarEstado();
        }
    );
}


// ======================================================
// 5. APRESENTAÇÃO
// ======================================================

function renderizarApresentacao() {

    conteudoEtapa.innerHTML = `

        <section>

            <h2>
                5. Apresentação
            </h2>


            <div class="bloco">

                <h3>
                    Apresente seus resultados ao gestor
                </h3>


                <p>
                    Grave uma apresentação
                    de até 2 minutos explicando:
                </p>


                <ul>

                    <li>
                        o que foi solicitado;
                    </li>

                    <li>
                        os principais resultados;
                    </li>

                    <li>
                        um ponto que chamou
                        sua atenção;
                    </li>

                    <li>
                        como a IA auxiliou
                        seu trabalho;
                    </li>

                    <li>
                        quais cuidados você tomou
                        para validar as informações.
                    </li>

                </ul>

            </div>


            <div class="gravador">

                <p>

                    Tempo:

                    <strong
                        id="cronometro"
                    >
                        ${formatarTempo(
                            estado
                                .apresentacao
                                .duracao
                        )}
                    </strong>

                    / 02:00

                </p>


                <div class="acoes">

                    <button
                        id="iniciar-gravacao"
                        type="button"
                    >
                        🎙️ Iniciar gravação
                    </button>


                    <button
                        id="parar-gravacao"
                        type="button"
                        disabled
                    >
                        ⏹️ Parar gravação
                    </button>

                </div>


                <p
                    id="status-gravacao"
                    class="status"
                >
                    Nenhuma gravação iniciada.
                </p>


                <audio
                    id="player-audio"
                    controls
                ></audio>


                <div class="acoes">

                    <button
                        id="transcrever-audio"
                        type="button"
                        disabled
                    >
                        Transcrever áudio
                    </button>

                </div>


                <p
                    id="status-transcricao"
                    class="status"
                ></p>


                <details>

                    <summary>
                        Transcrição
                    </summary>


                    <p
                        id="texto-transcricao"
                    >

                        ${
                            escaparHTML(
                                estado
                                    .apresentacao
                                    .transcricao
                            )
                            ||
                            "Nenhuma transcrição disponível."
                        }

                    </p>

                </details>

            </div>

        </section>
    `;


    vincularEventosGravador();
}


// ======================================================
// GRAVADOR
// ======================================================

function vincularEventosGravador() {

    const iniciar =
        document.getElementById(
            "iniciar-gravacao"
        );

    const parar =
        document.getElementById(
            "parar-gravacao"
        );

    const transcrever =
        document.getElementById(
            "transcrever-audio"
        );


    iniciar.addEventListener(
        "click",
        iniciarGravacao
    );


    parar.addEventListener(
        "click",
        pararGravacao
    );


    transcrever.addEventListener(
        "click",
        transcreverAudio
    );


    if (audioBlob) {

        const player =
            document.getElementById(
                "player-audio"
            );


        player.src =
            URL.createObjectURL(
                audioBlob
            );


        transcrever.disabled =
            false;
    }
}


// ======================================================
// INICIAR GRAVAÇÃO
// ======================================================

async function iniciarGravacao() {

    limparMensagemValidacao();


    const status =
        document.getElementById(
            "status-gravacao"
        );


    try {

        if (
            !navigator.mediaDevices
            ||
            !window.MediaRecorder
        ) {

            throw new Error(
                "Gravação de áudio não suportada."
            );
        }


        streamAudio =
            await navigator
                .mediaDevices
                .getUserMedia({
                    audio: true
                });


        mediaRecorder =
            new MediaRecorder(
                streamAudio
            );


        partesAudio =
            [];

        audioBlob =
            null;


        estado
            .apresentacao
            .transcricao =
            "";


        estado
            .apresentacao
            .duracao =
            0;


        salvarEstado();


        const textoTranscricao =
            document.getElementById(
                "texto-transcricao"
            );


        if (textoTranscricao) {

            textoTranscricao.textContent =
                "Nenhuma transcrição disponível.";
        }


        const statusTranscricao =
            document.getElementById(
                "status-transcricao"
            );


        if (statusTranscricao) {

            statusTranscricao.textContent =
                "";
        }


        const player =
            document.getElementById(
                "player-audio"
            );


        if (player) {

            player.removeAttribute(
                "src"
            );

            player.load();
        }


        const cronometro =
            document.getElementById(
                "cronometro"
            );


        if (cronometro) {

            cronometro.textContent =
                "00:00";
        }


        mediaRecorder.addEventListener(
            "dataavailable",
            evento => {

                if (
                    evento.data.size > 0
                ) {

                    partesAudio.push(
                        evento.data
                    );
                }
            }
        );


        mediaRecorder.addEventListener(
            "stop",
            finalizarArquivoAudio
        );


        mediaRecorder.start();


        inicioGravacao =
            Date.now();


        document
            .getElementById(
                "iniciar-gravacao"
            )
            .disabled =
            true;


        document
            .getElementById(
                "parar-gravacao"
            )
            .disabled =
            false;


        document
            .getElementById(
                "transcrever-audio"
            )
            .disabled =
            true;


        status.textContent =
            "🔴 Gravando...";


        iniciarCronometro();


    } catch (erro) {

        console.error(
            erro
        );


        status.textContent =
            "Não foi possível acessar o microfone.";
    }
}


// ======================================================
// CRONÔMETRO
// ======================================================

function iniciarCronometro() {

    pararCronometro();


    intervaloCronometro =
        setInterval(
            () => {

                if (!inicioGravacao) {

                    return;
                }


                const segundos =
                    Math.floor(
                        (
                            Date.now()
                            -
                            inicioGravacao
                        )
                        /
                        1000
                    );


                const cronometro =
                    document.getElementById(
                        "cronometro"
                    );


                if (cronometro) {

                    cronometro.textContent =
                        formatarTempo(
                            Math.min(
                                segundos,
                                DURACAO_MAXIMA_AUDIO
                            )
                        );
                }


                if (
                    segundos >=
                    DURACAO_MAXIMA_AUDIO
                ) {

                    pararGravacao();
                }

            },
            500
        );
}


function pararCronometro() {

    if (intervaloCronometro) {

        clearInterval(
            intervaloCronometro
        );

        intervaloCronometro =
            null;
    }
}


// ======================================================
// PARAR GRAVAÇÃO
// ======================================================

function pararGravacao() {

    if (
        mediaRecorder
        &&
        mediaRecorder.state ===
            "recording"
    ) {

        mediaRecorder.stop();
    }


    pararCronometro();


    const iniciar =
        document.getElementById(
            "iniciar-gravacao"
        );


    const parar =
        document.getElementById(
            "parar-gravacao"
        );


    if (iniciar) {

        iniciar.disabled =
            false;
    }


    if (parar) {

        parar.disabled =
            true;
    }
}


// ======================================================
// FINALIZAR ÁUDIO
// ======================================================

function finalizarArquivoAudio() {

    audioBlob =
        new Blob(
            partesAudio,
            {
                type:
                    mediaRecorder.mimeType
            }
        );


    const duracao =
        inicioGravacao
        ?
        Math.min(
            Math.round(
                (
                    Date.now()
                    -
                    inicioGravacao
                )
                /
                1000
            ),
            DURACAO_MAXIMA_AUDIO
        )
        :
        0;


    estado
        .apresentacao
        .duracao =
        duracao;


    salvarEstado();


    const player =
        document.getElementById(
            "player-audio"
        );


    if (player) {

        player.src =
            URL.createObjectURL(
                audioBlob
            );
    }


    const status =
        document.getElementById(
            "status-gravacao"
        );


    if (status) {

        status.textContent =
            "Gravação concluída.";
    }


    const transcrever =
        document.getElementById(
            "transcrever-audio"
        );


    if (transcrever) {

        transcrever.disabled =
            false;
    }


    const cronometro =
        document.getElementById(
            "cronometro"
        );


    if (cronometro) {

        cronometro.textContent =
            formatarTempo(
                duracao
            );
    }


    if (streamAudio) {

        streamAudio
            .getTracks()
            .forEach(
                track =>
                    track.stop()
            );
    }


    streamAudio =
        null;

    inicioGravacao =
        null;
}


// ======================================================
// TRANSCRIÇÃO
// ======================================================

async function transcreverAudio() {

    if (!audioBlob) {

        mostrarErro(
            "Nenhuma gravação disponível."
        );

        return;
    }


    const botao =
        document.getElementById(
            "transcrever-audio"
        );


    const status =
        document.getElementById(
            "status-transcricao"
        );


    const texto =
        document.getElementById(
            "texto-transcricao"
        );


    try {

        botao.disabled =
            true;


        status.textContent =
            "Transcrevendo áudio...";


        texto.textContent =
            "Aguardando nova transcrição...";


        const formulario =
            new FormData();


        let tipo =
            audioBlob.type
            ||
            "audio/webm";


        let extensao =
            "webm";


        if (
            tipo.includes(
                "ogg"
            )
        ) {

            extensao =
                "ogg";
        }


        if (
            tipo.includes(
                "mp4"
            )
        ) {

            extensao =
                "mp4";
        }


        formulario.append(
            "audio",
            audioBlob,
            `apresentacao.${extensao}`
        );


        const resposta =
            await fetch(
                `${API_BASE_URL}/audio`,
                {
                    method:
                        "POST",

                    body:
                        formulario
                }
            );


        const dados =
            await resposta.json();


        if (!resposta.ok) {

            throw new Error(
                dados.detail
                ||
                "Erro ao enviar o áudio."
            );
        }


        if (
            !dados.transcricao
            ||
            !dados.transcricao.trim()
        ) {

            throw new Error(
                "O servidor não retornou uma nova transcrição."
            );
        }


        estado
            .apresentacao
            .transcricao =
            dados
                .transcricao
                .trim();


        salvarEstado();


        texto.textContent =
            estado
                .apresentacao
                .transcricao;


        status.textContent =
            "Transcrição concluída!";


    } catch (erro) {

        console.error(
            "Erro na transcrição:",
            erro
        );


        estado
            .apresentacao
            .transcricao =
            "";


        salvarEstado();


        texto.textContent =
            "Nenhuma transcrição disponível.";


        status.textContent =
            erro.message
            ||
            "Não foi possível transcrever o áudio.";


    } finally {

        botao.disabled =
            false;
    }
}


// ======================================================
// 6. ENTREGA
// ======================================================

function renderizarEntrega() {

    conteudoEtapa.innerHTML = `

        <section>

            <h2>
                6. Entrega
            </h2>


            <p>
                Imagine que você precisa
                enviar o resultado ao gestor.
            </p>


            <p>
                Escreva uma mensagem
                apresentando a entrega
                e destacando brevemente
                os principais resultados.
            </p>


            <div class="bloco">

                <div
                    class="email-campo"
                >

                    <label>
                        Para
                    </label>


                    <input
                        type="text"
                        value="Gestor responsável"
                        disabled
                    >

                </div>


                <div
                    class="email-campo"
                >

                    <label
                        for="assunto-entrega"
                    >
                        Assunto
                    </label>


                    <input
                        type="text"
                        id="assunto-entrega"

                        value="${escaparHTML(
                            estado
                                .entrega
                                .assunto
                        )}"

                        placeholder="Digite o assunto..."
                    >

                </div>


                <div
                    class="email-campo"
                >

                    <label
                        for="mensagem-entrega"
                    >
                        Mensagem
                    </label>


                    <textarea
                        id="mensagem-entrega"
                        placeholder="Escreva sua mensagem profissional..."
                    >${escaparHTML(
                        estado
                            .entrega
                            .mensagem
                    )}</textarea>

                </div>


                <p>

                    Anexo:

                    <strong>

                        ${
                            escaparHTML(
                                estado
                                    .iaExecucao
                                    .arquivoFinalNome
                            )
                            ||
                            "Nenhum arquivo registrado"
                        }

                    </strong>

                </p>

            </div>

        </section>
    `;


    const assunto =
        document.getElementById(
            "assunto-entrega"
        );


    const mensagem =
        document.getElementById(
            "mensagem-entrega"
        );


    assunto.addEventListener(
        "input",
        evento => {

            estado
                .entrega
                .assunto =
                evento.target.value;


            salvarEstado();
        }
    );


    mensagem.addEventListener(
        "input",
        evento => {

            estado
                .entrega
                .mensagem =
                evento.target.value;


            salvarEstado();
        }
    );
}


// ======================================================
// FINALIZAÇÃO
// ======================================================

function renderizarListaAvaliacao(itens) {

    if (
        !Array.isArray(itens) ||
        itens.length === 0
    ) {

        return "<p>Nenhum item registrado.</p>";
    }


    const itensHTML =
        itens
            .map(
                item =>
                    `<li>${escaparHTML(item)}</li>`
            )
            .join("");


    return `<ul>${itensHTML}</ul>`;
}


function renderizarDimensaoAvaliacao(
    titulo,
    dimensao
) {

    if (!dimensao) {

        return "";
    }


    return `

        <div class="bloco">

            <h4>
                ${escaparHTML(titulo)}
            </h4>

            <p>
                <strong>Nível:</strong>
                ${escaparHTML(dimensao.nivel)}
                / 4
            </p>

            <p>
                <strong>Justificativa:</strong>
                ${escaparHTML(
                    dimensao.justificativa
                )}
            </p>

            <p>
                <strong>Evidências:</strong>
            </p>

            ${renderizarListaAvaliacao(
                dimensao.evidencias
            )}

            ${
                Array.isArray(
                    dimensao.limitacoes
                ) &&
                dimensao.limitacoes.length > 0
                    ?
                    `
                        <p>
                            <strong>Limitações:</strong>
                        </p>

                        ${renderizarListaAvaliacao(
                            dimensao.limitacoes
                        )}
                    `
                    :
                    ""
            }

        </div>
    `;
}


function renderizarResultadoAvaliacao() {

    const resultado =
        estado
            .avaliacao
            .resultado;


    if (!resultado) {

        return "";
    }


    return `

        <div class="bloco">

            <h3>
                Avaliação STOA
            </h3>

            <p>
                A avaliação foi gerada com base
                nas evidências registradas durante
                a execução do projeto.
            </p>

        </div>


        ${renderizarDimensaoAvaliacao(
            "Interpretação e contextualização",
            resultado.interpretacao_contextualizacao
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
            "Comunicação",
            resultado.comunicacao
        )}

        ${renderizarDimensaoAvaliacao(
            "Execução do mini projeto",
            resultado.execucao_mini_projeto
        )}


        <div class="bloco">

            <h4>
                Pontos fortes
            </h4>

            ${renderizarListaAvaliacao(
                resultado.pontos_fortes
            )}

        </div>


        <div class="bloco">

            <h4>
                Oportunidades de melhoria
            </h4>

            ${renderizarListaAvaliacao(
                resultado.oportunidades_melhoria
            )}

        </div>


        <div class="bloco">

            <h4>
                Observação geral
            </h4>

            <p>
                ${escaparHTML(
                    resultado.observacao_geral
                )}
            </p>

        </div>
    `;
}


function renderizarAreaAvaliacao() {

    const avaliacao =
        estado.avaliacao;


    if (
        avaliacao.status === "carregando"
    ) {

        return `

            <div class="bloco">

                <h3>
                    Avaliação STOA
                </h3>

                <p>
                    Gerando sua avaliação...
                </p>

            </div>
        `;
    }


    if (
        avaliacao.status === "erro"
    ) {

        return `

            <div class="bloco">

                <h3>
                    Avaliação STOA
                </h3>

                <p>
                    O projeto foi concluído,
                    mas não foi possível gerar
                    a avaliação neste momento.
                </p>

                <p class="aviso">
                    ${escaparHTML(
                        avaliacao.erro
                    )}
                </p>

                <button
                    type="button"
                    id="tentar-avaliacao-novamente"
                >
                    Tentar gerar avaliação novamente
                </button>

            </div>
        `;
    }


    if (
        avaliacao.status === "concluida"
    ) {

        return renderizarResultadoAvaliacao();
    }


    return "";
}


function renderizarFinalizacao() {

    const interacoesUsuario =
        estado
            .iaExecucao
            .mensagens
            .filter(
                mensagem =>
                    (
                        mensagem.papel ||
                        "user"
                    ) === "user"
            )
            .length;


    conteudoEtapa.innerHTML = `

        <section>

            <h2>
                Projeto finalizado
            </h2>


            <p>
                Sua entrega foi registrada
                no protótipo da STOA.
            </p>


            ${renderizarAreaAvaliacao()}


            <div class="resumo-final">

                <h3>
                    Resumo dos dados coletados
                </h3>


                <p>
                    <strong>
                        Entendimento registrado:
                    </strong>

                    ${escaparHTML(
                        estado.entendimento
                    )}
                </p>


                <p>
                    <strong>
                        Interações com IA:
                    </strong>

                    ${interacoesUsuario}
                </p>


                <p>
                    <strong>
                        Planilha final:
                    </strong>

                    ${escaparHTML(
                        estado
                            .iaExecucao
                            .arquivoFinalNome
                    )}
                </p>


                <p>
                    <strong>
                        Duração da apresentação:
                    </strong>

                    ${formatarTempo(
                        estado
                            .apresentacao
                            .duracao
                    )}
                </p>


                <p>
                    <strong>
                        Assunto da comunicação:
                    </strong>

                    ${escaparHTML(
                        estado
                            .entrega
                            .assunto
                    )}
                </p>

            </div>


            <div class="acoes">

                <button
                    type="button"
                    id="voltar-trilha"
                >
                    Voltar para a trilha
                </button>

            </div>

        </section>
    `;


    const botaoTentarNovamente =
        document.getElementById(
            "tentar-avaliacao-novamente"
        );


    if (botaoTentarNovamente) {

        botaoTentarNovamente.addEventListener(
            "click",
            iniciarAvaliacaoFinal
        );
    }


    const botaoVoltarTrilha =
        document.getElementById(
            "voltar-trilha"
        );


    if (botaoVoltarTrilha) {

        botaoVoltarTrilha.addEventListener(
            "click",
            () => {

                window.location.href = "../../../pages/trilha/trilha.html";
            }
        );
    }
}

// ======================================================
// AVALIAÇÃO FINAL
// ======================================================

// ======================================================
// MONTAR PEDIDO DE AVALIAÇÃO
// ======================================================

function montarPedidoAvaliacao() {

    return {

        entendimento:
            estado.entendimento,

        mensagens_ia:
            estado
                .iaExecucao
                .mensagens
                .map(
                    mensagem => ({

                        papel:
                            mensagem.papel ||
                            "user",

                        texto:
                            mensagem.texto
                    })
                ),

        arquivo_final_nome:
            estado
                .iaExecucao
                .arquivoFinalNome,

        execucao_concluida:
            estado
                .iaExecucao
                .execucaoConcluida,

        analise_planilha_id:
            estado
                .iaExecucao
                .analisePlanilhaId,

        validacao: {

            calculos_conferidos:
                estado
                    .validacao
                    .calculosConferidos,

            dados_comparados:
                estado
                    .validacao
                    .dadosComparados,

            ia_verificada:
                estado
                    .validacao
                    .iaVerificada,

            grafico_verificado:
                estado
                    .validacao
                    .graficoVerificado,

            reflexao:
                estado
                    .validacao
                    .reflexao
        },

        apresentacao: {

            duracao:
                estado
                    .apresentacao
                    .duracao,

            transcricao:
                estado
                    .apresentacao
                    .transcricao
        },

        entrega: {

            assunto:
                estado
                    .entrega
                    .assunto,

            mensagem:
                estado
                    .entrega
                    .mensagem
        }
    };
}


// ======================================================
// INICIAR AVALIAÇÃO FINAL
// ======================================================

async function iniciarAvaliacaoFinal() {

    estado.avaliacao.status =
        "carregando";

    estado.avaliacao.resultado =
        null;

    estado.avaliacao.erro =
        "";

    salvarEstado();

    renderizarAplicacao();

    try {

        const resposta =
            await fetch(
                `${API_BASE_URL}/avaliar`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body:
                        JSON.stringify(
                            montarPedidoAvaliacao()
                        )
                }
            );

        let dados = null;

        try {

            dados =
                await resposta.json();

        } catch (erroLeitura) {

            console.error(
                "Erro ao interpretar resposta da avaliação:",
                erroLeitura
            );
        }

        if (!resposta.ok) {

            throw new Error(
                dados?.detail ||
                "Não foi possível gerar a avaliação."
            );
        }

        if (!dados) {

            throw new Error(
                "O servidor não retornou a avaliação."
            );
        }

        estado.avaliacao.status =
            "concluida";

        estado.avaliacao.resultado =
            dados;

        estado.avaliacao.erro =
            "";

        salvarEstado();

        renderizarAplicacao();

    } catch (erro) {

        console.error(
            "Erro ao gerar avaliação:",
            erro
        );

        estado.avaliacao.status =
            "erro";

        estado.avaliacao.resultado =
            null;

        estado.avaliacao.erro =
            erro.message ||
            "Não foi possível gerar a avaliação.";

        salvarEstado();

        renderizarAplicacao();
    }
}
// ======================================================
// NAVEGAÇÃO
// ======================================================

function renderizarNavegacao() {

    if (
        estado.etapaAtual === 7
    ) {

        botaoVoltar.style.display =
            "none";

        botaoContinuar.style.display =
            "none";

        return;
    }


    botaoVoltar.style.display =
        "";

    botaoContinuar.style.display =
        "";


    botaoVoltar.disabled =
        estado.etapaAtual === 1;


    if (
        estado.etapaAtual === 6
    ) {

        botaoContinuar.textContent =
            "Finalizar projeto";

    } else {

        botaoContinuar.textContent =
            "Continuar →";
    }
}


// ======================================================
// VOLTAR
// ======================================================

botaoVoltar.addEventListener(
    "click",
    () => {

        if (
            estado.etapaAtual <= 1
        ) {

            return;
        }


        estado.etapaAtual--;


        salvarEstado();

        renderizarAplicacao();
        rolarParaTopo();
    }
);


// ======================================================
// CONTINUAR
// ======================================================

botaoContinuar.addEventListener(
    "click",
    async () => {

        limparMensagemValidacao();

        const etapa =
            estado.etapaAtual;

        if (
            !validarEtapa(
                etapa
            )
        ) {

            return;
        }

        if (
            etapa === 6
        ) {

            const confirmarFinalizacao =
                await abrirModalFinalizacao();


            if (!confirmarFinalizacao) {

                return;
            }
        }


        estado
            .etapasConcluidas[
                etapa
            ] =
            true;

        if (
            etapa < 6
        ) {

            estado.etapaLiberada =
                Math.max(
                    estado.etapaLiberada,
                    etapa + 1
                );

            estado.etapaAtual =
                etapa + 1;

            salvarEstado();

            renderizarAplicacao();
            rolarParaTopo();

            return;
        }

        estado.finalizado =
            true;

        estado.etapaAtual =
            7;

        salvarEstado();

        renderizarAplicacao();
        rolarParaTopo();

        await iniciarAvaliacaoFinal();
    }
);

// ======================================================
// VALIDAÇÃO DAS ETAPAS
// ======================================================

function validarEtapa(etapa) {

    switch (etapa) {

        case 1:

            return true;


        case 2:

            if (
                estado
                    .entendimento
                    .trim()
                    .length < 10
            ) {

                mostrarErro(
                    "Escreva sua compreensão da atividade antes de continuar."
                );


                return false;
            }


            return true;


    case 3:

    const respostasIA =
        estado
            .iaExecucao
            .mensagens
            .filter(
                mensagem =>
                    mensagem.papel === "model"
            )
            .length;


    if (
        respostasIA === 0
    ) {

        mostrarErro(
            "Realize pelo menos uma interação com o Assistente STOA antes de continuar."
        );

        return false;
    }


    if (
        !estado
            .iaExecucao
            .arquivoFinalNome
    ) {

        mostrarErro(
            "Selecione a planilha final antes de continuar."
        );

        return false;
    }


    if (
        !estado
            .iaExecucao
            .planilhaAnalisada
        ||
        !estado
            .iaExecucao
            .analisePlanilhaId
    ) {

        mostrarErro(
            "Aguarde a análise da planilha antes de continuar."
        );

        return false;
    }


    if (
        !estado
            .iaExecucao
            .execucaoConcluida
    ) {

        mostrarErro(
            "Confirme que a execução da atividade foi concluída."
        );

        return false;
    }


    return true;


        case 4:

            const validacao =
                estado.validacao;


            const todosMarcados =
                validacao
                    .calculosConferidos
                &&
                validacao
                    .dadosComparados
                &&
                validacao
                    .iaVerificada
                &&
                validacao
                    .graficoVerificado;


            if (!todosMarcados) {

                mostrarErro(
                    "Conclua todos os itens de validação antes de continuar."
                );


                return false;
            }


            if (
                validacao
                    .reflexao
                    .trim()
                    .length < 10
            ) {

                mostrarErro(
                    "Responda à reflexão da etapa de validação."
                );


                return false;
            }


            return true;


        case 5:

            if (
                !estado
                    .apresentacao
                    .transcricao
                    .trim()
            ) {

                mostrarErro(
                    "Grave e transcreva a apresentação antes de continuar."
                );


                return false;
            }


            return true;


        case 6:

            if (
                estado
                    .entrega
                    .assunto
                    .trim()
                    .length < 3
            ) {

                mostrarErro(
                    "Informe o assunto da mensagem."
                );


                return false;
            }


            if (
                estado
                    .entrega
                    .mensagem
                    .trim()
                    .length < 20
            ) {

                mostrarErro(
                    "Escreva a mensagem profissional antes de finalizar."
                );


                return false;
            }


            return true;
    }


    return true;
}


// ======================================================
// INICIALIZAÇÃO
// ======================================================

renderizarAplicacao();