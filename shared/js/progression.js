// ======================================================
// STOA | PROGRESSÃO DA TRILHA DE MINI PROJETOS
// ======================================================
// Para o MVP, a progressão é lida dos estados já gravados pelos
// três projetos no localStorage. Não altera nem apaga o estado
// interno de nenhum projeto.

(() => {
  const STOA = window.STOA = window.STOA || {};

  const KEYS = Object.freeze({
    etapa1: "stoa_mini_projeto_tecnico_v1",
    etapa2: "stoa_mini_projeto_comunicacao_v1",
    integrador: "stoa_projeto_integrador_v1"
  });

  function lerEstado(chave) {
    try {
      const valor = localStorage.getItem(window.STOA?.courseProgress?.key(chave) || `${chave}__sem_usuario`);
      return valor ? JSON.parse(valor) : null;
    } catch (error) {
      console.warn(`Não foi possível ler ${chave}:`, error);
      return null;
    }
  }

  function estaFinalizado(chave) {
    return Boolean(lerEstado(chave)?.finalizado);
  }

  function getProgress() {
    const etapa1Concluida = estaFinalizado(KEYS.etapa1);
    const etapa2Concluida = estaFinalizado(KEYS.etapa2);
    const integradorConcluido = estaFinalizado(KEYS.integrador);

    const etapas = {
      etapa1: {
        id: "etapa1",
        concluida: etapa1Concluida,
        liberada: true
      },
      etapa2: {
        id: "etapa2",
        concluida: etapa2Concluida,
        liberada: etapa1Concluida
      },
      integrador: {
        id: "integrador",
        concluida: integradorConcluido,
        liberada: etapa1Concluida && etapa2Concluida
      }
    };

    const concluidas = Object.values(etapas).filter(etapa => etapa.concluida).length;

    return {
      etapas,
      concluidas,
      total: 3,
      percentual: Math.round((concluidas / 3) * 100)
    };
  }

  function getRewardLevel() {
    const { etapas } = getProgress();

    if (etapas.integrador.concluida) return 3;
    if (etapas.etapa2.concluida) return 2;
    if (etapas.etapa1.concluida) return 1;
    return 0;
  }

  STOA.progression = Object.freeze({
    keys: KEYS,
    getProgress,
    getRewardLevel
  });
})();
