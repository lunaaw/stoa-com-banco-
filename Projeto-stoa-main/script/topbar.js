document.addEventListener("DOMContentLoaded", () => {
  // 1. Carrega e Aplica o Tema Salvo (localStorage)
  const savedTheme = localStorage.getItem("stoa-theme") || "light";
  applyTheme(savedTheme);

  // 2. Inicializa os Ícones Lucide
  if (window.lucide) {
    lucide.createIcons();
  }

  // 3. Marca a Página Ativa na Navegação
  const currentPath = window.location.pathname.split("/").pop() || "dashboard.html";
  
  const navLinks = document.querySelectorAll(".topbar-nav .nav-item, .profile-dropdown .dropdown-item");
  navLinks.forEach(link => {
    const href = link.getAttribute("href");
    if (href === currentPath) {
      link.classList.add("active");
    } else {
      link.classList.remove("active");
    }
  });

  // 4. Lógica do Menu Dropdown (Abrir/Fechar)
  const profileBtn = document.getElementById("profileMenuBtn");
  const profileDropdown = document.getElementById("profileDropdown");

  if (profileBtn && profileDropdown) {
    profileBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      profileDropdown.classList.toggle("show");
    });

    document.addEventListener("click", (e) => {
      if (!profileDropdown.contains(e.target) && !profileBtn.contains(e.target)) {
        profileDropdown.classList.remove("show");
      }
    });
  }

  // 5. Botão Alternador de Tema (Claro / Escuro)
  const themeToggleBtn = document.getElementById("themeToggleBtn");
  if (themeToggleBtn) {
    themeToggleBtn.addEventListener("click", () => {
      const currentTheme = document.documentElement.getAttribute("data-theme") === "dark" ? "dark" : "light";
      const newTheme = currentTheme === "dark" ? "light" : "dark";
      
      applyTheme(newTheme);
      localStorage.setItem("stoa-theme", newTheme);
    });
  }
});

// Função Auxiliar para Aplicar o Tema e Atualizar Ícone/Texto
function applyTheme(theme) {
  if (theme === "dark") {
    document.documentElement.setAttribute("data-theme", "dark");
  } else {
    document.documentElement.removeAttribute("data-theme");
  }

  const themeIcon = document.getElementById("themeIcon");
  const themeText = document.getElementById("themeText");

  if (themeIcon && themeText) {
    if (theme === "dark") {
      themeIcon.setAttribute("data-lucide", "sun");
      themeText.textContent = "Tema Claro";
    } else {
      themeIcon.setAttribute("data-lucide", "moon");
      themeText.textContent = "Tema Escuro";
    }
    // Re-inicializa o ícone alterado do Lucide
    if (window.lucide) {
      lucide.createIcons();
    }
  }
}