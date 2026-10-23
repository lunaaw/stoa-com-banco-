// ======================================================
// STOA | SERVIÇO DE AVATAR
// ======================================================
// Centraliza a configuração DiceBear usada tanto no editor quanto
// na área do aprendiz. O avatar salvo continua no campo perfis.avatar_url.

(() => {
  const STOA = window.STOA = window.STOA || {};
  const API_BASE = "https://api.dicebear.com/10.x/avataaars/svg";

  const DEFAULT_CONFIG = Object.freeze({
    seed: "stoa-aprendiz",
    skinColor: "ffdbb4",
    top: "shortFlat",
    hairColor: "4a312c",
    eyes: "happy",
    mouth: "smile",
    facialHair: "none",
    accessories: "none",
    bgColor: "b6e3f4"
  });

  function cloneDefaultConfig() {
    return { ...DEFAULT_CONFIG };
  }

  function buildUrl(config = DEFAULT_CONFIG) {
    const resolved = { ...DEFAULT_CONFIG, ...config };
    const params = new URLSearchParams({
      seed: resolved.seed || DEFAULT_CONFIG.seed,
      topVariant: resolved.top,
      hairColor: resolved.hairColor,
      eyesVariant: resolved.eyes,
      mouthVariant: resolved.mouth,
      skinColor: resolved.skinColor,
      backgroundColor: resolved.bgColor,
      borderRadius: "50"
    });

    if (resolved.facialHair && resolved.facialHair !== "none") {
      params.set("facialHairVariant", resolved.facialHair);
      params.set("facialHairColor", resolved.hairColor);
      params.set("facialHairProbability", "100");
    } else {
      params.set("facialHairProbability", "0");
    }

    if (resolved.accessories && resolved.accessories !== "none") {
      params.set("accessoriesVariant", resolved.accessories);
      params.set("accessoriesProbability", "100");
    } else {
      params.set("accessoriesProbability", "0");
    }

    return `${API_BASE}?${params.toString()}`;
  }

  function readFirstParam(params, modernKey, legacyKey) {
    const modernValue = params.get(modernKey);
    if (modernValue) return modernValue.split(",")[0];

    const legacyValue = legacyKey ? params.get(legacyKey) : null;
    return legacyValue ? legacyValue.split(",")[0] : null;
  }

  function parseUrl(url) {
    if (!url || typeof url !== "string") return cloneDefaultConfig();

    try {
      const parsed = new URL(url);
      const params = parsed.searchParams;
      const config = cloneDefaultConfig();

      const seed = params.get("seed");
      if (seed) config.seed = seed.split(",")[0];

      const skinColor = params.get("skinColor");
      const hairColor = params.get("hairColor");
      const backgroundColor = params.get("backgroundColor");

      if (skinColor) config.skinColor = skinColor.split(",")[0];
      if (hairColor) config.hairColor = hairColor.split(",")[0];
      if (backgroundColor) config.bgColor = backgroundColor.split(",")[0];

      config.top = readFirstParam(params, "topVariant", "top") || config.top;
      config.eyes = readFirstParam(params, "eyesVariant", "eyes") || config.eyes;
      config.mouth = readFirstParam(params, "mouthVariant", "mouth") || config.mouth;
      config.facialHair = readFirstParam(params, "facialHairVariant", "facialHair") || config.facialHair;
      config.accessories = readFirstParam(params, "accessoriesVariant", "accessories") || config.accessories;

      if (params.get("facialHairProbability") === "0") {
        config.facialHair = "none";
      }

      if (params.get("accessoriesProbability") === "0") {
        config.accessories = "none";
      }

      return config;
    } catch (error) {
      console.warn("Avatar salvo em formato inválido. Usando padrão STOA.", error);
      return cloneDefaultConfig();
    }
  }

  function isSupportedAvatarUrl(url) {
    if (!url || typeof url !== "string") return false;

    try {
      const parsed = new URL(url);
      return parsed.protocol === "https:"
        && parsed.hostname === "api.dicebear.com"
        && /\/avataaars\/svg\/?$/.test(parsed.pathname);
    } catch {
      return false;
    }
  }

  async function persistAvatar(userId, avatarUrl) {
    if (!userId || !STOA.data?.updateProfileAvatar) return;
    await STOA.data.updateProfileAvatar(userId, avatarUrl);
  }

  async function ensureForUser(userId, existingUrl) {
    let avatarUrl;

    if (isSupportedAvatarUrl(existingUrl)) {
      // Normaliza URLs antigas que usavam parâmetros legados da DiceBear
      // (top, eyes, mouth...) para o formato atual da API 9.x
      // (topVariant, eyesVariant, mouthVariant...). Isso evita avatares
      // incompletos e preserva a personalização existente.
      avatarUrl = buildUrl(parseUrl(existingUrl));
    } else {
      avatarUrl = buildUrl(DEFAULT_CONFIG);
    }

    if (userId && avatarUrl !== existingUrl) {
      try {
        await persistAvatar(userId, avatarUrl);
      } catch (error) {
        // O avatar continua utilizável mesmo quando a gravação remota falha.
        // O erro fica visível no console para diagnóstico sem quebrar a tela.
        console.error("Não foi possível gravar o avatar no Supabase:", error);
      }
    }

    return avatarUrl;
  }

  STOA.avatar = Object.freeze({
    apiBase: API_BASE,
    defaultConfig: cloneDefaultConfig,
    buildUrl,
    parseUrl,
    isSupportedAvatarUrl,
    ensureForUser
  });
})();
