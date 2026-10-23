// ======================================================
// CONFIGURAÇÕES GERAIS
// ======================================================

const API_BASE_URL = "http://127.0.0.1:8000";
const STORAGE_KEY = "stoa_mini_projeto_comunicacao_v1";
const DURACAO_MAXIMA_AUDIO = 120;

const etapas = [
    { numero: 1, nome: "Situação" },
    { numero: 2, nome: "Preparação" },
    { numero: 3, nome: "IA e Preparação" },
    { numero: 4, nome: "Apresentação" },
    { numero: 5, nome: "Reflexão" }
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
        preparacao: {
            informacoesPrioritarias: "",
            ordemApresentacao: ""
        },
        iaPreparacao: {
            mensagens: []
        },
        apresentacao: {
            duracao: 0,
            transcricao: ""
        },
        reflexao: {
            avaliacaoDestaques: "",
            mudancasFuturas: ""
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
            preparacao: {
                ...inicial.preparacao,
                ...(dados.preparacao || {})
            },
            iaPreparacao: {
                ...inicial.iaPreparacao,
                ...(dados.iaPreparacao || {})
            },
            apresentacao: {
                ...inicial.apresentacao,
                ...(dados.apresentacao || {})
            },
            reflexao: {
                ...inicial.reflexao,
                ...(dados.reflexao || {})
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

if (estado.avaliacao.status === "carregando") {
    estado.avaliacao.status = "erro";
    estado.avaliacao.erro =
        "A geração da avaliação foi interrompida. Tente novamente.";
}

// ======================================================
// ÁUDIO
// ======================================================

let mediaRecorder = null;
let partesAudio = [];
let audioBlob = null;
let audioUrl = null;
let streamAudio = null;
let intervaloCronometro = null;
let inicioGravacao = null;

// ======================================================
// ELEMENTOS PRINCIPAIS
// ======================================================

const trilha = document.getElementById("trilha");
const conteudoEtapa = document.getElementById("conteudo-etapa");
const botaoVoltar = document.getElementById("botao-voltar");
const botaoContinuar = document.getElementById("botao-continuar");
const mensagemValidacao = document.getElementById("mensagem-validacao");

const modalFinalizacao =
    document.getElementById("modal-finalizacao");

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

function formatarTempo(segundos) {
    const minutos = Math.floor(segundos / 60);
    const restante = segundos % 60;

    return (
        String(minutos).padStart(2, "0") +
        ":" +
        String(restante).padStart(2, "0")
    );
}

function rolarParaTopo() {
    const reduzirMovimento = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
    ).matches;

    window.scrollTo({
        top: 0,
        behavior: reduzirMovimento ? "auto" : "smooth"
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

function encerrarStreamAudio() {
    if (streamAudio) {
        streamAudio.getTracks().forEach(track => track.stop());
    }

    streamAudio = null;
}

function pararCronometro() {
    if (intervaloCronometro) {
        clearInterval(intervaloCronometro);
        intervaloCronometro = null;
    }
}

function limparAudioTemporario() {
    pararCronometro();
    encerrarStreamAudio();

    if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
        audioUrl = null;
    }

    audioBlob = null;
    partesAudio = [];
    mediaRecorder = null;
    inicioGravacao = null;
}

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

            if (estado.etapaAtual === 4 && mediaRecorder?.state === "recording") {
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

function renderizarConteudo() {
    if (estado.etapaAtual === 6) {
        renderizarFinalizacao();
        return;
    }

    switch (estado.etapaAtual) {
        case 1:
            renderizarSituacao();
            break;
        case 2:
            renderizarPreparacao();
            break;
        case 3:
            renderizarIAPreparacao();
            break;
        case 4:
            renderizarApresentacao();
            break;
        case 5:
            renderizarReflexao();
            break;
        default:
            renderizarSituacao();
    }
}

// ======================================================
// ETAPA 1 — SITUAÇÃO
// ======================================================

function renderizarSituacao() {
    conteudoEtapa.innerHTML = `
        <section>
            <h2>1. Situação</h2>

            <p>
                Nesta etapa, você utilizará o resultado do mini projeto anterior
                para realizar uma atualização oral ao seu gestor.
            </p>

            <div class="bloco bloco-destaque">
                <h3>Solicitação do gestor</h3>

                <p>
                    Olá! Gostaria de uma atualização rápida sobre as demandas
                    que foram organizadas na planilha.
                </p>

                <p>
                    Apresente os resultados de forma breve e clara. Não é
                    necessário comentar todas as linhas. Selecione as informações
                    que ajudem a compreender a situação da equipe e destaque o que
                    merece maior atenção.
                </p>

                <p>Na sua apresentação, procure contemplar:</p>

                <ul>
                    <li>um panorama geral das demandas;</li>
                    <li>atividades que merecem atenção;</li>
                    <li>demandas atrasadas e concluídas;</li>
                    <li>um ponto que você considera relevante para o acompanhamento.</li>
                </ul>

                <p class="aviso">
                    O objetivo não é ler a planilha. O desafio é selecionar os
                    dados importantes e transformá-los em uma atualização clara.
                </p>
            </div>

            <div class="bloco bloco-arquivo">
                <h3>Resultado da etapa anterior</h3>

                <div class="arquivo-destaque">
                    <div>
                        <p><strong>resultado_etapa_um.xlsx</strong></p>
                        <p>
                            Use a planilha como fonte para preparar sua comunicação.
                            Você não precisa editá-la neste mini projeto.
                        </p>
                    </div>

                    <a
                        class="botao-link"
                        href="./material/resultado_etapa_um.xlsx"
                        download
                    >
                        Baixar planilha
                    </a>
                </div>

                <div class="acoes">
                    <button type="button" id="abrir-planilhas">
                        Abrir Google Planilhas
                    </button>
                </div>
            </div>

            <div class="bloco bloco-suave">
                <h3>O que será avaliado?</h3>

                <p>
                    O foco é a sua capacidade de selecionar informações,
                    organizar uma mensagem, comunicar resultados com clareza,
                    utilizar a IA como apoio e refletir sobre a própria comunicação.
                </p>

                <p>
                    A avaliação considera o conteúdo da sua fala. Não serão
                    avaliados sotaque, timbre de voz, nervosismo ou características
                    pessoais.
                </p>
            </div>
        </section>
    `;

    document
        .getElementById("abrir-planilhas")
        .addEventListener("click", () => {
            window.open("https://sheets.google.com", "_blank", "noopener,noreferrer");
        });
}

// ======================================================
// ETAPA 2 — PREPARAÇÃO
// ======================================================

function renderizarPreparacao() {
    conteudoEtapa.innerHTML = `
        <section>
            <h2>2. Preparação</h2>

            <p>
                Antes de apresentar, pense no que realmente precisa chegar ao gestor.
            </p>

            <div class="bloco bloco-formulario">
                <div class="campo-grupo">
                    <label for="informacoes-prioritarias">
                        Quais informações da planilha você considera mais importantes
                        para apresentar ao gestor?
                    </label>

                    <textarea
                        id="informacoes-prioritarias"
                        placeholder="Registre os dados e pontos que você pretende priorizar."
                    >${escaparHTML(estado.preparacao.informacoesPrioritarias)}</textarea>
                </div>

                <div class="campo-grupo">
                    <label for="ordem-apresentacao">
                        Em que ordem você pretende apresentar essas informações?
                    </label>

                    <textarea
                        id="ordem-apresentacao"
                        placeholder="Explique brevemente a sequência que pretende seguir."
                    >${escaparHTML(estado.preparacao.ordemApresentacao)}</textarea>
                </div>
            </div>

            <div class="bloco bloco-suave">
                <h3>Lembrete</h3>

                <p>
                    Você não precisa criar um texto definitivo. Esta etapa serve
                    apenas para organizar as ideias antes da preparação com o
                    Assistente STOA.
                </p>
            </div>
        </section>
    `;

    const campoInformacoes = document.getElementById("informacoes-prioritarias");
    const campoOrdem = document.getElementById("ordem-apresentacao");

    campoInformacoes.addEventListener("input", () => {
        estado.preparacao.informacoesPrioritarias = campoInformacoes.value;
        salvarEstado();
    });

    campoOrdem.addEventListener("input", () => {
        estado.preparacao.ordemApresentacao = campoOrdem.value;
        salvarEstado();
    });
}

// ======================================================
// ETAPA 3 — IA E PREPARAÇÃO
// ======================================================

function renderizarIAPreparacao() {
    let historicoHTML = "";

    if (estado.iaPreparacao.mensagens.length === 0) {
        historicoHTML = `
            <p class="chat-vazio">
                Nenhuma interação registrada. Use o Assistente STOA para
                organizar ou revisar algum aspecto da sua comunicação.
            </p>
        `;
    } else {
        estado.iaPreparacao.mensagens.forEach(mensagem => {
            const nome =
                mensagem.papel === "model"
                    ? "Assistente STOA"
                    : "Jovem Aprendiz";

            const classeMensagem =
                mensagem.papel === "model"
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
            <h2>3. IA e Preparação</h2>

            <p>
                Use o Assistente STOA como apoio para organizar, revisar ou
                tornar sua comunicação mais clara.
            </p>

            <div class="bloco bloco-suave">
                <h3>Como a IA pode ajudar?</h3>

                <ul>
                    <li>organizar uma sequência lógica para a apresentação;</li>
                    <li>revisar uma frase ou trecho escrito por você;</li>
                    <li>ajudar a reduzir repetições;</li>
                    <li>sugerir maneiras mais claras de destacar um problema;</li>
                    <li>fazer perguntas que ajudem você a priorizar informações.</li>
                </ul>

                <p class="aviso">
                    O Assistente STOA apoia sua preparação, mas não deve escrever
                    a apresentação final inteira por você.
                </p>
            </div>

            <div class="bloco bloco-chat">
                <h3>Assistente STOA</h3>

                <div id="chat-historico" class="chat-historico">
                    ${historicoHTML}
                </div>

                <textarea
                    id="mensagem-ia"
                    placeholder="Digite sua pergunta para o Assistente STOA..."
                ></textarea>

                <p id="status-chat" class="status"></p>

                <div class="acoes">
                    <button type="button" id="enviar-mensagem-ia">
                        Enviar para IA
                    </button>
                </div>
            </div>
        </section>
    `;

    document
        .getElementById("enviar-mensagem-ia")
        .addEventListener("click", enviarMensagemIA);
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

    const historico = estado.iaPreparacao.mensagens.map(item => ({
        papel: item.papel,
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

        const dados = await resposta.json();

        if (!resposta.ok) {
            throw new Error(
                dados.detail || "Não foi possível obter uma resposta da IA."
            );
        }

        if (!dados.resposta || !dados.resposta.trim()) {
            throw new Error("A IA retornou uma resposta vazia.");
        }

        estado.iaPreparacao.mensagens.push(
            {
                papel: "user",
                texto: mensagem,
                data: new Date().toISOString()
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
// ETAPA 4 — APRESENTAÇÃO
// ======================================================

function renderizarApresentacao() {
    const transcricao = estado.apresentacao.transcricao.trim();

    conteudoEtapa.innerHTML = `
        <section>
            <h2>4. Apresentação</h2>

            <p>
                Faça uma atualização oral como se estivesse apresentando os
                resultados ao seu gestor.
            </p>

            <div class="bloco bloco-suave">
                <h3>Orientação</h3>

                <p>
                    Sua apresentação deve ser curta. Como referência, procure
                    permanecer entre 1 e 2 minutos, priorizando as informações
                    que realmente ajudam a compreender a situação das demandas.
                </p>

                <p class="aviso">
                    Fale com suas próprias palavras. A avaliação será feita sobre
                    o conteúdo comunicado, não sobre características da sua voz.
                </p>
            </div>

            <div class="bloco bloco-gravacao">
                <h3>Gravação</h3>

                <div class="gravador">
                    <p>Tempo de gravação</p>
                    <p id="tempo-gravacao" class="tempo-gravacao">
                        ${formatarTempo(estado.apresentacao.duracao)}
                    </p>

                    <p id="status-gravacao" class="status">
                        ${audioBlob ? "Gravação disponível." : "Nenhuma gravação nesta sessão."}
                    </p>

                    <div class="acoes">
                        <button type="button" id="iniciar-gravacao">
                            Iniciar gravação
                        </button>

                        <button type="button" id="parar-gravacao" disabled>
                            Parar gravação
                        </button>
                    </div>

                    <div id="area-audio"></div>
                </div>
            </div>

            <div class="bloco bloco-transcricao">
                <h3>Transcrição</h3>

                <p>
                    Depois de gravar, envie o áudio para transcrição. A transcrição
                    será usada na avaliação do conteúdo da sua apresentação.
                </p>

                <div class="acoes">
                    <button
                        type="button"
                        id="transcrever-audio"
                        ${audioBlob ? "" : "disabled"}
                    >
                        Transcrever áudio
                    </button>
                </div>

                <p id="status-transcricao" class="status"></p>

                <div id="texto-transcricao" class="transcricao">
                    ${
                        transcricao
                            ? escaparHTML(transcricao)
                            : "Nenhuma transcrição disponível."
                    }
                </div>
            </div>
        </section>
    `;

    document
        .getElementById("iniciar-gravacao")
        .addEventListener("click", iniciarGravacao);

    document
        .getElementById("parar-gravacao")
        .addEventListener("click", pararGravacao);

    document
        .getElementById("transcrever-audio")
        .addEventListener("click", transcreverAudio);

    renderizarPlayerAudio();
}

function escolherTipoAudio() {
    const tipos = [
        "audio/webm;codecs=opus",
        "audio/webm",
        "audio/ogg;codecs=opus",
        "audio/mp4"
    ];

    if (!window.MediaRecorder) {
        return "";
    }

    return tipos.find(tipo => MediaRecorder.isTypeSupported(tipo)) || "";
}

async function iniciarGravacao() {
    const status = document.getElementById("status-gravacao");
    const botaoIniciar = document.getElementById("iniciar-gravacao");
    const botaoParar = document.getElementById("parar-gravacao");

    if (!navigator.mediaDevices?.getUserMedia || !window.MediaRecorder) {
        status.textContent =
            "Seu navegador não oferece suporte à gravação de áudio necessária para esta atividade.";
        return;
    }

    try {
        limparAudioTemporario();

        estado.apresentacao.transcricao = "";
        estado.apresentacao.duracao = 0;
        salvarEstado();

        streamAudio = await navigator.mediaDevices.getUserMedia({
            audio: true
        });

        const tipo = escolherTipoAudio();
        mediaRecorder = tipo
            ? new MediaRecorder(streamAudio, { mimeType: tipo })
            : new MediaRecorder(streamAudio);

        partesAudio = [];

        mediaRecorder.addEventListener("dataavailable", evento => {
            if (evento.data && evento.data.size > 0) {
                partesAudio.push(evento.data);
            }
        });

        mediaRecorder.addEventListener("stop", () => {
            pararCronometro();

            const tipoFinal =
                mediaRecorder?.mimeType ||
                partesAudio[0]?.type ||
                "audio/webm";

            audioBlob = new Blob(partesAudio, {
                type: tipoFinal
            });

            if (audioUrl) {
                URL.revokeObjectURL(audioUrl);
            }

            audioUrl = URL.createObjectURL(audioBlob);
            encerrarStreamAudio();
            renderizarAplicacao();
        });

        mediaRecorder.start();
        inicioGravacao = Date.now();

        botaoIniciar.disabled = true;
        botaoParar.disabled = false;
        status.textContent = "Gravando...";

        intervaloCronometro = setInterval(() => {
            const segundos = Math.min(
                DURACAO_MAXIMA_AUDIO,
                Math.floor((Date.now() - inicioGravacao) / 1000)
            );

            estado.apresentacao.duracao = segundos;

            const contador = document.getElementById("tempo-gravacao");
            if (contador) {
                contador.textContent = formatarTempo(segundos);
            }

            if (
                segundos >= DURACAO_MAXIMA_AUDIO &&
                mediaRecorder?.state === "recording"
            ) {
                mediaRecorder.stop();
            }
        }, 500);

    } catch (erro) {
        console.error("Erro ao iniciar gravação:", erro);
        limparAudioTemporario();
        status.textContent =
            "Não foi possível acessar o microfone. Verifique a permissão do navegador.";
        botaoIniciar.disabled = false;
        botaoParar.disabled = true;
    }
}

function pararGravacao() {
    if (!mediaRecorder || mediaRecorder.state !== "recording") {
        return;
    }

    const segundos = Math.min(
        DURACAO_MAXIMA_AUDIO,
        Math.max(1, Math.floor((Date.now() - inicioGravacao) / 1000))
    );

    estado.apresentacao.duracao = segundos;
    salvarEstado();
    mediaRecorder.stop();
}

function renderizarPlayerAudio() {
    const area = document.getElementById("area-audio");

    if (!area || !audioBlob || !audioUrl) {
        return;
    }

    area.innerHTML = `
        <audio controls src="${audioUrl}">
            Seu navegador não suporta a reprodução deste áudio.
        </audio>
    `;
}

async function transcreverAudio() {
    if (!audioBlob) {
        mostrarErro("Nenhuma gravação disponível para transcrição.");
        return;
    }

    const botao = document.getElementById("transcrever-audio");
    const status = document.getElementById("status-transcricao");
    const texto = document.getElementById("texto-transcricao");

    try {
        botao.disabled = true;
        status.textContent = "Transcrevendo áudio...";
        texto.textContent = "Aguardando transcrição...";

        const formulario = new FormData();
        const tipo = audioBlob.type || "audio/webm";

        let extensao = "webm";
        if (tipo.includes("ogg")) {
            extensao = "ogg";
        } else if (tipo.includes("mp4")) {
            extensao = "mp4";
        }

        formulario.append(
            "audio",
            audioBlob,
            `apresentacao.${extensao}`
        );

        const resposta = await fetch(`${API_BASE_URL}/audio`, {
            method: "POST",
            body: formulario
        });

        const dados = await resposta.json();

        if (!resposta.ok) {
            throw new Error(
                dados.detail || "Não foi possível transcrever o áudio."
            );
        }

        if (!dados.transcricao || !dados.transcricao.trim()) {
            throw new Error("O servidor retornou uma transcrição vazia.");
        }

        estado.apresentacao.transcricao = dados.transcricao.trim();
        salvarEstado();

        texto.textContent = estado.apresentacao.transcricao;
        status.textContent = "Transcrição concluída.";

    } catch (erro) {
        console.error("Erro na transcrição:", erro);
        estado.apresentacao.transcricao = "";
        salvarEstado();
        texto.textContent = "Nenhuma transcrição disponível.";
        status.textContent =
            erro.message || "Não foi possível transcrever o áudio.";

    } finally {
        botao.disabled = false;
    }
}

// ======================================================
// ETAPA 5 — REFLEXÃO
// ======================================================

function renderizarReflexao() {
    conteudoEtapa.innerHTML = `
        <section>
            <h2>5. Reflexão</h2>

            <p>
                Antes de finalizar, observe a comunicação que você acabou de realizar.
            </p>

            <div class="bloco bloco-formulario">
                <div class="campo-grupo">
                    <label for="avaliacao-destaques">
                        Você acredita que destacou as informações mais importantes?
                        Por quê?
                    </label>

                    <textarea
                        id="avaliacao-destaques"
                        placeholder="Explique sua avaliação da apresentação."
                    >${escaparHTML(estado.reflexao.avaliacaoDestaques)}</textarea>
                </div>

                <div class="campo-grupo">
                    <label for="mudancas-futuras">
                        Se pudesse realizar a apresentação novamente, o que mudaria
                        na forma de comunicar os resultados?
                    </label>

                    <textarea
                        id="mudancas-futuras"
                        placeholder="Registre uma mudança, manutenção ou melhoria concreta."
                    >${escaparHTML(estado.reflexao.mudancasFuturas)}</textarea>
                </div>
            </div>

            <div class="bloco bloco-suave">
                <h3>Antes de finalizar</h3>

                <p>
                    Depois da finalização, esta tentativa ficará bloqueada para
                    alterações. Confira suas respostas antes de concluir.
                </p>
            </div>
        </section>
    `;

    const campoDestaques = document.getElementById("avaliacao-destaques");
    const campoMudancas = document.getElementById("mudancas-futuras");

    campoDestaques.addEventListener("input", () => {
        estado.reflexao.avaliacaoDestaques = campoDestaques.value;
        salvarEstado();
    });

    campoMudancas.addEventListener("input", () => {
        estado.reflexao.mudancasFuturas = campoMudancas.value;
        salvarEstado();
    });
}

// ======================================================
// AVALIAÇÃO
// ======================================================

function montarPedidoAvaliacao() {
    return {
        preparacao: {
            informacoes_prioritarias:
                estado.preparacao.informacoesPrioritarias,
            ordem_apresentacao:
                estado.preparacao.ordemApresentacao
        },
        mensagens_ia: estado.iaPreparacao.mensagens.map(item => ({
            papel: item.papel,
            texto: item.texto
        })),
        apresentacao: {
            transcricao: estado.apresentacao.transcricao,
            duracao_segundos: estado.apresentacao.duracao
        },
        reflexao: {
            avaliacao_destaques:
                estado.reflexao.avaliacaoDestaques,
            mudancas_futuras:
                estado.reflexao.mudancasFuturas
        }
    };
}

async function iniciarAvaliacaoFinal() {
    estado.avaliacao.status = "carregando";
    estado.avaliacao.erro = "";
    estado.avaliacao.resultado = null;
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

        const dados = await resposta.json();

        if (!resposta.ok) {
            throw new Error(
                dados.detail || "Não foi possível gerar a avaliação."
            );
        }

        estado.avaliacao.status = "concluida";
        estado.avaliacao.resultado = dados;
        estado.avaliacao.erro = "";
        salvarEstado();
        renderizarAplicacao();

    } catch (erro) {
        console.error("Erro na avaliação:", erro);
        estado.avaliacao.status = "erro";
        estado.avaliacao.resultado = null;
        estado.avaliacao.erro =
            erro.message || "Não foi possível gerar a avaliação.";
        salvarEstado();
        renderizarAplicacao();
    }
}

function renderizarListaAvaliacao(itens) {
    if (!Array.isArray(itens) || itens.length === 0) {
        return "";
    }

    return `
        <ul>
            ${itens
                .map(item => `<li>${escaparHTML(item)}</li>`)
                .join("")}
        </ul>
    `;
}

function renderizarDimensaoAvaliacao(titulo, dimensao) {
    if (!dimensao) {
        return "";
    }

    const limitacoes =
        Array.isArray(dimensao.limitacoes) &&
        dimensao.limitacoes.length > 0
            ? `
                <p><strong>Para avançar:</strong></p>
                ${renderizarListaAvaliacao(dimensao.limitacoes)}
            `
            : "";

    return `
        <div class="bloco">
            <h4>${escaparHTML(titulo)}</h4>

            <p class="nota-nivel">
                <strong>Nível:</strong>
                ${escaparHTML(dimensao.nivel)} / 4
            </p>

            <p>${escaparHTML(dimensao.justificativa)}</p>

            <p><strong>O que você demonstrou:</strong></p>
            ${renderizarListaAvaliacao(dimensao.evidencias)}

            ${limitacoes}
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
                Seu feedback considera a preparação, a apresentação realizada,
                o uso da IA e sua reflexão sobre a própria comunicação.
            </p>
        </div>

        ${renderizarDimensaoAvaliacao(
            "Compreensão e seleção das informações",
            resultado.compreensao_selecao_informacoes
        )}

        ${renderizarDimensaoAvaliacao(
            "Organização da comunicação",
            resultado.organizacao_comunicacao
        )}

        ${renderizarDimensaoAvaliacao(
            "Clareza e objetividade",
            resultado.clareza_objetividade
        )}

        ${renderizarDimensaoAvaliacao(
            "Comunicação profissional",
            resultado.comunicacao_profissional
        )}

        ${renderizarDimensaoAvaliacao(
            "Uso da IA",
            resultado.uso_ia
        )}

        ${renderizarDimensaoAvaliacao(
            "Reflexão e aprimoramento",
            resultado.reflexao_aprimoramento
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
                <p>Gerando seu feedback...</p>
            </div>
        `;
    }

    if (avaliacao.status === "erro") {
        return `
            <div class="bloco">
                <h3>Avaliação STOA</h3>
                <p>
                    O mini projeto foi concluído, mas o feedback não pôde
                    ser gerado neste momento.
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

// ======================================================
// FINALIZAÇÃO
// ======================================================

function renderizarFinalizacao() {
    const interacoesUsuario = estado.iaPreparacao.mensagens.filter(
        mensagem => mensagem.papel === "user"
    ).length;

    conteudoEtapa.innerHTML = `
        <section>
            <h2>Mini projeto finalizado</h2>

            <p>
                Sua apresentação e sua reflexão foram registradas no protótipo da STOA.
            </p>

            ${renderizarAreaAvaliacao()}

            <div class="resumo-final">
                <h3>Resumo da execução</h3>

                <p>
                    <strong>Interações com IA:</strong>
                    ${interacoesUsuario}
                </p>

                <p>
                    <strong>Duração da apresentação:</strong>
                    ${formatarTempo(estado.apresentacao.duracao)}
                </p>

                <p><strong>Transcrição:</strong></p>
                <p>${escaparHTML(estado.apresentacao.transcricao)}</p>
            </div>

            <div class="acoes">
                <button type="button" id="voltar-trilha">
                    Voltar para a trilha
                </button>
            </div>
        </section>
    `;

    const botaoTentar = document.getElementById(
        "tentar-avaliacao-novamente"
    );

    if (botaoTentar) {
        botaoTentar.addEventListener("click", iniciarAvaliacaoFinal);
    }

    document
        .getElementById("voltar-trilha")
        .addEventListener("click", () => {
            window.location.href = "../../../pages/trilha/trilha.html";
        });
}

// ======================================================
// NAVEGAÇÃO
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
        botaoContinuar.textContent = "Finalizar mini projeto";
    } else {
        botaoContinuar.textContent = "Continuar →";
    }
}

botaoVoltar.addEventListener("click", () => {
    if (estado.etapaAtual <= 1 || estado.finalizado) {
        return;
    }

    if (estado.etapaAtual === 4 && mediaRecorder?.state === "recording") {
        mediaRecorder.stop();
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

    if (etapa === 5) {
        const confirmar =
            await abrirModalFinalizacao();

        if (!confirmar) {
            return;
        }
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

    estado.finalizado = true;
    estado.etapaAtual = 6;
    salvarEstado();
    renderizarAplicacao();
    rolarParaTopo();
    await iniciarAvaliacaoFinal();
});

// ======================================================
// VALIDAÇÃO DAS ETAPAS
// ======================================================

function validarEtapa(etapa) {
    switch (etapa) {
        case 1:
            return true;

        case 2:
            if (
                estado.preparacao.informacoesPrioritarias.trim().length < 15
            ) {
                mostrarErro(
                    "Registre quais informações você considera mais importantes antes de continuar."
                );
                return false;
            }

            if (
                estado.preparacao.ordemApresentacao.trim().length < 15
            ) {
                mostrarErro(
                    "Explique brevemente a ordem que pretende seguir na apresentação."
                );
                return false;
            }

            return true;

        case 3: {
            const respostasIA = estado.iaPreparacao.mensagens.filter(
                mensagem => mensagem.papel === "model"
            ).length;

            if (respostasIA === 0) {
                mostrarErro(
                    "Realize pelo menos uma interação com o Assistente STOA antes de continuar."
                );
                return false;
            }

            return true;
        }

        case 4:
            if (!estado.apresentacao.transcricao.trim()) {
                mostrarErro(
                    "Grave e transcreva sua apresentação antes de continuar."
                );
                return false;
            }

            return true;

        case 5:
            if (
                estado.reflexao.avaliacaoDestaques.trim().length < 15
            ) {
                mostrarErro(
                    "Responda por que você acredita ter destacado, ou não, as informações mais importantes."
                );
                return false;
            }

            if (
                estado.reflexao.mudancasFuturas.trim().length < 15
            ) {
                mostrarErro(
                    "Registre o que você manteria ou mudaria em uma próxima apresentação."
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

salvarEstado();
renderizarAplicacao();
