(() => {
  const STOA = window.STOA = window.STOA || {};
  const DEMO_AVATAR_KEY = "stoa_avatar_preview_v1";

  const state = STOA.avatar?.defaultConfig?.() || {
    skinColor: "ffdbb4",
    top: "shortFlat",
    hairColor: "4a312c",
    eyes: "happy",
    mouth: "smile",
    facialHair: "none",
    accessories: "none",
    bgColor: "b6e3f4"
  };

  let rewardLevel = 0;
  let currentUser = null;

  const rewardCopy = {
    0: {
      title: "Personalização inicial",
      description: "Conclua o Mini Projeto Técnico para liberar o fundo roxo da STOA."
    },
    1: {
      title: "Primeira recompensa desbloqueada",
      description: "O fundo roxo está disponível. Conclua a etapa de Comunicação para liberar um acessório."
    },
    2: {
      title: "Acessório desbloqueado",
      description: "Os óculos redondos foram liberados. Finalize o Projeto Integrador para abrir a coleção completa."
    },
    3: {
      title: "Trilha concluída",
      description: "Coleção de recompensas desbloqueada. Você concluiu a trilha prática da STOA."
    }
  };

  function setStatus(message, type = "") {
    const el = document.getElementById("avatar-status");
    if (!el) return;
    el.textContent = message;
    el.className = `status-message${type ? ` ${type}` : ""}`;
  }

  function updateRewardSummary() {
    const copy = rewardCopy[rewardLevel] || rewardCopy[0];
    document.getElementById("reward-level").textContent = `Nível ${rewardLevel}`;
    document.getElementById("reward-title").textContent = copy.title;
    document.getElementById("reward-description").textContent = copy.description;
  }

  function sanitizeRewards() {
    const accessoryUnlock = {
      none: 0,
      round: 2,
      sunglasses: 3,
      wayfarers: 3,
      prescription01: 3
    };

    const backgroundUnlock = {
      b6e3f4: 0,
      c0aede: 1,
      ffd5dc: 3,
      ffdfbf: 3,
      c8e6c9: 3,
      ffffff: 3
    };

    if ((accessoryUnlock[state.accessories] ?? 99) > rewardLevel) {
      state.accessories = "none";
    }

    if ((backgroundUnlock[state.bgColor] ?? 99) > rewardLevel) {
      state.bgColor = "b6e3f4";
    }
  }

  function renderAvatar() {
    const image = document.getElementById("avatarImg");
    if (!image) return;

    const url = STOA.avatar?.buildUrl
      ? STOA.avatar.buildUrl(state)
      : "";

    image.src = url;
    image.onerror = () => {
      image.onerror = null;
      const fallback = STOA.avatar?.buildUrl?.(STOA.avatar.defaultConfig());
      if (fallback && image.src !== fallback) image.src = fallback;
      setStatus("Não foi possível carregar a personalização atual. Exibindo o avatar padrão.", "warning");
    };
  }

  function updateActiveControls() {
    const groups = {
      skinColorGrid: "skinColor",
      topGrid: "top",
      hairColorGrid: "hairColor",
      eyesGrid: "eyes",
      mouthGrid: "mouth",
      facialHairGrid: "facialHair",
      accessoriesGrid: "accessories",
      bgColorGrid: "bgColor"
    };

    Object.entries(groups).forEach(([gridId, property]) => {
      document.querySelectorAll(`#${gridId} [data-val]`).forEach(button => {
        button.classList.toggle("active", button.dataset.val === state[property]);
      });
    });
  }

  function applyLocks() {
    document.querySelectorAll("[data-unlock]").forEach(button => {
      const requiredLevel = Number(button.dataset.unlock || 0);
      const locked = requiredLevel > rewardLevel;

      button.classList.toggle("locked", locked);
      button.setAttribute("aria-disabled", String(locked));

      if (locked) {
        button.title = `Desbloqueia no nível ${requiredLevel} da trilha`;
      } else {
        button.removeAttribute("title");
      }
    });
  }

  function describeLockedReward(requiredLevel) {
    const messages = {
      1: "Este fundo é liberado ao concluir o Mini Projeto Técnico.",
      2: "Este acessório é liberado ao concluir o Mini Projeto de Comunicação.",
      3: "Esta recompensa é liberada ao concluir o Projeto Integrador."
    };
    return messages[requiredLevel] || "Conclua sua trilha para liberar esta personalização.";
  }

  function setupOptionGroup(gridId, stateProperty) {
    const container = document.getElementById(gridId);
    if (!container) return;

    container.addEventListener("click", event => {
      const button = event.target.closest("button[data-val]");
      if (!button || !container.contains(button)) return;

      const requiredLevel = Number(button.dataset.unlock || 0);
      if (requiredLevel > rewardLevel) {
        setStatus(describeLockedReward(requiredLevel), "warning");
        return;
      }

      state[stateProperty] = button.dataset.val;
      updateActiveControls();
      renderAvatar();
      setStatus("");
    });
  }

  function applyConfig(config) {
    Object.assign(state, STOA.avatar?.defaultConfig?.() || {}, config || {});
    sanitizeRewards();
    updateActiveControls();
    renderAvatar();
  }

  async function loadAvatar() {
    rewardLevel = STOA.progression?.getRewardLevel?.() ?? 0;
    updateRewardSummary();
    applyLocks();

    let avatarUrl = null;

    try {
      currentUser = await STOA.auth?.getCurrentUser?.();

      if (currentUser) {
        const profile = await STOA.data.getApprenticeProfile(currentUser.id);
        avatarUrl = await STOA.avatar.ensureForUser(currentUser.id, profile?.avatar_url);
      } else {
        avatarUrl = localStorage.getItem(DEMO_AVATAR_KEY);
      }
    } catch (error) {
      console.error("Não foi possível carregar o avatar salvo:", error);
      avatarUrl = localStorage.getItem(DEMO_AVATAR_KEY);
      setStatus("O avatar foi aberto em modo local. Você ainda pode personalizá-lo.", "warning");
    }

    const config = avatarUrl
      ? STOA.avatar.parseUrl(avatarUrl)
      : STOA.avatar.defaultConfig();

    applyConfig(config);
  }

  async function saveAvatar() {
    const button = document.getElementById("save-avatar");
    const avatarUrl = STOA.avatar.buildUrl(state);

    button.disabled = true;
    button.textContent = "Salvando...";
    setStatus("Salvando sua personalização...");

    try {
      if (!currentUser) {
        currentUser = await STOA.auth?.getCurrentUser?.();
      }

      if (currentUser) {
        await STOA.data.updateProfileAvatar(currentUser.id, avatarUrl);

        if (STOA.auth?.isDemoUser?.(currentUser)) {
          // O usuário DEMO depende deste valor local. Não removê-lo após salvar.
          localStorage.setItem(DEMO_AVATAR_KEY, avatarUrl);
          setStatus("Avatar salvo localmente. A personalização já aparecerá na sua área de aprendiz.", "success");
        } else {
          // Para um usuário real, o Supabase passa a ser a fonte principal.
          localStorage.removeItem(DEMO_AVATAR_KEY);
          setStatus("Avatar salvo. Ele já aparecerá na sua área de aprendiz.", "success");
        }
      } else {
        localStorage.setItem(DEMO_AVATAR_KEY, avatarUrl);
        setStatus("Avatar salvo localmente para esta demonstração. Faça login para sincronizá-lo ao perfil.", "warning");
      }
    } catch (error) {
      console.error("Erro ao salvar avatar:", error);
      localStorage.setItem(DEMO_AVATAR_KEY, avatarUrl);
      setStatus("Não foi possível sincronizar com o Supabase agora. A personalização ficou preservada localmente.", "error");
    } finally {
      button.disabled = false;
      button.textContent = "Salvar avatar";
    }
  }

  function setup() {
    setupOptionGroup("skinColorGrid", "skinColor");
    setupOptionGroup("topGrid", "top");
    setupOptionGroup("hairColorGrid", "hairColor");
    setupOptionGroup("eyesGrid", "eyes");
    setupOptionGroup("mouthGrid", "mouth");
    setupOptionGroup("facialHairGrid", "facialHair");
    setupOptionGroup("accessoriesGrid", "accessories");
    setupOptionGroup("bgColorGrid", "bgColor");

    document.getElementById("save-avatar")?.addEventListener("click", saveAvatar);
    loadAvatar();
  }

  document.addEventListener("DOMContentLoaded", setup);
})();
