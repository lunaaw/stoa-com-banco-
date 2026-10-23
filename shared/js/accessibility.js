// ======================================================
// STOA | ACESSIBILIDADE DA ÁREA PRINCIPAL
// ======================================================

(() => {
  const STOA = window.STOA = window.STOA || {};
  const STORAGE_KEY = "stoaAccessibility";
  const FONT_STEPS = [0.9, 1, 1.1, 1.2, 1.3];

  const defaults = {
    fontIndex: 1,
    highContrast: false,
    keyboardFocus: false
  };

  function loadPreferences() {
    try {
      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
      if (!stored) return { ...defaults };
      return {
        fontIndex: Number.isInteger(stored.fontIndex)
          ? Math.max(0, Math.min(FONT_STEPS.length - 1, stored.fontIndex))
          : defaults.fontIndex,
        highContrast: Boolean(stored.highContrast),
        keyboardFocus: Boolean(stored.keyboardFocus)
      };
    } catch {
      return { ...defaults };
    }
  }

  let preferences = loadPreferences();

  function savePreferences() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
  }

  function announce(message) {
    const live = document.getElementById("accessibility-status");
    if (live) live.textContent = message;
  }

  function updateButton(button, active, onText = "Desativar", offText = "Ativar") {
    if (!button) return;
    button.setAttribute("aria-pressed", String(active));
    button.textContent = active ? onText : offText;
    button.classList.toggle("is-active", active);
  }

  function applyFontScale() {
    const scale = FONT_STEPS[preferences.fontIndex];
    document.documentElement.style.setProperty("--stoa-accessibility-scale", String(scale));
    document.body.style.zoom = String(scale);

    const indicator = document.getElementById("font-size-indicator");
    if (indicator) indicator.textContent = `${Math.round(scale * 100)}%`;

    const reduce = document.getElementById("reduce-font");
    const increase = document.getElementById("increase-font");
    if (reduce) reduce.disabled = preferences.fontIndex === 0;
    if (increase) increase.disabled = preferences.fontIndex === FONT_STEPS.length - 1;
  }

  function applyPreferences() {
    applyFontScale();
    document.body.classList.toggle("stoa-high-contrast", preferences.highContrast);
    document.body.classList.toggle("stoa-keyboard-focus", preferences.keyboardFocus);

    updateButton(
      document.getElementById("high-contrast"),
      preferences.highContrast
    );
    updateButton(
      document.getElementById("keyboard-focus"),
      preferences.keyboardFocus
    );

    updateThemeControl();
  }

  function getTheme() {
    return localStorage.getItem("stoaTheme") || "light";
  }

  function setTheme(theme) {
    const normalized = theme === "dark" ? "dark" : "light";
    document.body.classList.toggle("light-theme", normalized === "light");
    localStorage.setItem("stoaTheme", normalized);
    updateThemeControl();

    document.dispatchEvent(
      new CustomEvent("stoa:theme-changed", { detail: { theme: normalized } })
    );
  }

  function updateThemeControl() {
    const isDark = getTheme() === "dark";
    updateButton(document.getElementById("dark-mode"), isDark);
  }

  function getVLibrasButton() {
    return window.VLibrasWidget?.initBtn
      || document.querySelector("[vw-access-button]");
  }

  function openVLibras() {
    const tryOpen = attempt => {
      const accessButton = getVLibrasButton();

      if (accessButton && typeof accessButton.click === "function") {
        accessButton.click();
        announce("VLibras aberto.");
        return;
      }

      if (attempt < 12) {
        window.setTimeout(() => tryOpen(attempt + 1), 250);
        return;
      }

      announce("Não foi possível abrir o VLibras. Verifique sua conexão e tente novamente.");
    };

    announce("Abrindo VLibras...");
    tryOpen(0);
  }

  function bindControls() {
    document.getElementById("reduce-font")?.addEventListener("click", () => {
      preferences.fontIndex = Math.max(0, preferences.fontIndex - 1);
      savePreferences();
      applyPreferences();
      announce(`Tamanho do texto ajustado para ${Math.round(FONT_STEPS[preferences.fontIndex] * 100)}%.`);
    });

    document.getElementById("reset-font")?.addEventListener("click", () => {
      preferences.fontIndex = 1;
      savePreferences();
      applyPreferences();
      announce("Tamanho do texto restaurado para 100%.");
    });

    document.getElementById("increase-font")?.addEventListener("click", () => {
      preferences.fontIndex = Math.min(FONT_STEPS.length - 1, preferences.fontIndex + 1);
      savePreferences();
      applyPreferences();
      announce(`Tamanho do texto ajustado para ${Math.round(FONT_STEPS[preferences.fontIndex] * 100)}%.`);
    });

    document.getElementById("high-contrast")?.addEventListener("click", () => {
      preferences.highContrast = !preferences.highContrast;
      savePreferences();
      applyPreferences();
      announce(preferences.highContrast ? "Alto contraste ativado." : "Alto contraste desativado.");
    });

    document.getElementById("keyboard-focus")?.addEventListener("click", () => {
      preferences.keyboardFocus = !preferences.keyboardFocus;
      savePreferences();
      applyPreferences();
      announce(preferences.keyboardFocus ? "Destaque de foco ativado." : "Destaque de foco desativado.");
    });

    document.getElementById("dark-mode")?.addEventListener("click", () => {
      setTheme(getTheme() === "dark" ? "light" : "dark");
      announce(getTheme() === "dark" ? "Modo escuro ativado." : "Modo escuro desativado.");
    });

    document.getElementById("vlibras")?.addEventListener("click", openVLibras);
  }

  function init() {
    setTheme(getTheme());
    applyPreferences();
    bindControls();

  }

  STOA.accessibility = Object.freeze({ init, setTheme, getTheme, openVLibras });
})();
