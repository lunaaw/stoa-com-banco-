// ======================================================
// ACESSIBILIDADE GLOBAL DA STOA
// ======================================================

(() => {
    const STORAGE_KEY_ACESSIBILIDADE = "stoa_acessibilidade";
    const FONTES_PERMITIDAS = [87.5, 100, 112.5, 125, 137.5];

    const padrao = {
        tamanhoFonte: 100,
        altoContraste: false
    };

    function carregarPreferencias() {
        try {
            const salvo = localStorage.getItem(STORAGE_KEY_ACESSIBILIDADE);
            if (!salvo) {
                return { ...padrao };
            }

            const dados = JSON.parse(salvo);
            const tamanhoFonte = FONTES_PERMITIDAS.includes(dados.tamanhoFonte)
                ? dados.tamanhoFonte
                : padrao.tamanhoFonte;

            return {
                tamanhoFonte,
                altoContraste: Boolean(dados.altoContraste)
            };
        } catch (erro) {
            console.error("Erro ao carregar acessibilidade:", erro);
            return { ...padrao };
        }
    }

    let preferencias = carregarPreferencias();

    const botaoAbrir = document.getElementById("abrir-acessibilidade");
    const painel = document.getElementById("painel-acessibilidade");
    const botaoFechar = document.getElementById("fechar-acessibilidade");
    const botaoDiminuir = document.getElementById("diminuir-fonte");
    const botaoRestaurar = document.getElementById("restaurar-fonte");
    const botaoAumentar = document.getElementById("aumentar-fonte");
    const indicadorFonte = document.getElementById("indicador-fonte");
    const botaoContraste = document.getElementById("alternar-contraste");
    const botaoVLibras = document.getElementById("abrir-vlibras");
    const status = document.getElementById("status-acessibilidade");
    const botaoVoltarTrilha = document.getElementById("voltar-trilha-cabecalho");

    function salvarPreferencias() {
        localStorage.setItem(
            STORAGE_KEY_ACESSIBILIDADE,
            JSON.stringify(preferencias)
        );
    }

    function atualizarInterface() {
        document.documentElement.style.setProperty(
            "--stoa-font-size",
            `${preferencias.tamanhoFonte}%`
        );

        document.documentElement.classList.toggle(
            "stoa-alto-contraste",
            preferencias.altoContraste
        );

        if (indicadorFonte) {
            indicadorFonte.textContent = `${preferencias.tamanhoFonte}%`;
        }

        if (botaoContraste) {
            botaoContraste.setAttribute(
                "aria-pressed",
                String(preferencias.altoContraste)
            );
            botaoContraste.textContent = preferencias.altoContraste
                ? "Desativar"
                : "Ativar";
        }

        if (botaoDiminuir) {
            botaoDiminuir.disabled =
                preferencias.tamanhoFonte === FONTES_PERMITIDAS[0];
        }

        if (botaoAumentar) {
            botaoAumentar.disabled =
                preferencias.tamanhoFonte ===
                FONTES_PERMITIDAS[FONTES_PERMITIDAS.length - 1];
        }
    }

    function anunciar(mensagem) {
        if (status) {
            status.textContent = mensagem;
        }
    }

    function definirFonte(novoValor) {
        const indiceAtual = FONTES_PERMITIDAS.indexOf(preferencias.tamanhoFonte);
        const indiceNovo = Math.max(
            0,
            Math.min(FONTES_PERMITIDAS.length - 1, novoValor(indiceAtual))
        );

        preferencias.tamanhoFonte = FONTES_PERMITIDAS[indiceNovo];
        salvarPreferencias();
        atualizarInterface();
        anunciar(`Tamanho do texto ajustado para ${preferencias.tamanhoFonte}%.`);
    }

    function abrirPainel() {
        if (!painel || !botaoAbrir) {
            return;
        }

        painel.hidden = false;
        botaoAbrir.setAttribute("aria-expanded", "true");
        botaoFechar?.focus();
    }

    function fecharPainel() {
        if (!painel || !botaoAbrir) {
            return;
        }

        painel.hidden = true;
        botaoAbrir.setAttribute("aria-expanded", "false");
        botaoAbrir.focus();
    }

    botaoAbrir?.addEventListener("click", () => {
        if (painel.hidden) {
            abrirPainel();
        } else {
            fecharPainel();
        }
    });

    botaoFechar?.addEventListener("click", fecharPainel);

    botaoDiminuir?.addEventListener("click", () => {
        definirFonte(indice => indice - 1);
    });

    botaoAumentar?.addEventListener("click", () => {
        definirFonte(indice => indice + 1);
    });

    botaoRestaurar?.addEventListener("click", () => {
        preferencias.tamanhoFonte = 100;
        salvarPreferencias();
        atualizarInterface();
        anunciar("Tamanho do texto restaurado para 100%.");
    });

    botaoContraste?.addEventListener("click", () => {
        preferencias.altoContraste = !preferencias.altoContraste;
        salvarPreferencias();
        atualizarInterface();
        anunciar(
            preferencias.altoContraste
                ? "Alto contraste ativado."
                : "Alto contraste desativado."
        );
    });

    botaoVLibras?.addEventListener("click", () => {
        const botaoWidget = window.VLibrasWidget?.initBtn;

        if (botaoWidget && typeof botaoWidget.click === "function") {
            botaoWidget.click();
            anunciar("VLibras aberto.");
            return;
        }

        anunciar(
            "O VLibras ainda está carregando. Aguarde alguns segundos e tente novamente."
        );
    });

    botaoVoltarTrilha?.addEventListener("click", () => {
        window.location.href = "../../../pages/trilha/trilha.html";
    });

    document.addEventListener("keydown", evento => {
        if (evento.key === "Escape" && painel && !painel.hidden) {
            fecharPainel();
        }
    });

    atualizarInterface();
})();
