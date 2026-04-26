// ===============================
// CARREGAMENTO DE COMPONENTES
// ===============================
document.addEventListener("DOMContentLoaded", () => {

  Promise.all([
    loadComponent("/components/sidebar.html", "sidebar-container"),
    loadComponent("/components/footer.html", "footer-container")
  ]).then(() => {
    // garante que o HTML já foi injetado no DOM
    setTimeout(() => {
      initSidebar();
    }, 50);
  });

});

  
// ===============================
// FUNÇÃO: CARREGAR COMPONENTES
// ===============================
async function loadComponent(url, containerId) {
  try {
    const res = await fetch(url);

    if (!res.ok) throw new Error(`Erro ao carregar: ${url}`);

    const container = document.getElementById(containerId);

    if (!container) {
      console.warn(`#${containerId} não encontrado no DOM`);
      return false;
    }

    container.innerHTML = await res.text();
    return true;

  } catch (err) {
    console.error(`Erro no componente [${containerId}]:`, err);
    return false;
  }
}


// ===============================
// SIDEBAR
// ===============================
function initSidebar() {

  const sidebar = document.querySelector("#sidebar");
  const toggle  = document.getElementById("menuToggle");
  const overlay = document.getElementById("overlay");

  if (!sidebar || !toggle || !overlay) {
    console.warn("Sidebar: elementos não encontrados no DOM");
    return;
  }


  // ===============================
  // SUBMENUS
  // ===============================
  const subToggles = sidebar.querySelectorAll(".sub-toggle");

  subToggles.forEach(btn => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();

      const parent = btn.closest(".has-sub");
      if (!parent) return;

      const isOpen = parent.classList.contains("open");

      // fecha outros submenus
      sidebar.querySelectorAll(".has-sub.open").forEach(item => {
        if (item !== parent) item.classList.remove("open");
      });

      parent.classList.toggle("open");

      btn.setAttribute("aria-expanded", String(!isOpen));
    });
  });


  // ===============================
  // MENU HAMBURGUER
  // ===============================
  toggle.addEventListener("click", (e) => {
    e.stopPropagation();

    const isActive = sidebar.classList.toggle("active");
    overlay.classList.toggle("active");

    toggle.setAttribute("aria-expanded", String(isActive));

    if (!isActive) closeAllSubmenus();
  });


  // overlay fecha sidebar
  overlay.addEventListener("click", closeSidebar);


  // clique fora fecha sidebar
  document.addEventListener("click", (e) => {
    if (
      sidebar.classList.contains("active") &&
      !sidebar.contains(e.target) &&
      !toggle.contains(e.target)
    ) {
      closeSidebar();
    }
  });


  // tecla ESC fecha
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeSidebar();
  });


  // ===============================
  // FUNÇÕES AUXILIARES
  // ===============================
  function closeSidebar() {
    sidebar.classList.remove("active");
    overlay.classList.remove("active");
    toggle.setAttribute("aria-expanded", "false");
    closeAllSubmenus();
  }

  function closeAllSubmenus() {
    sidebar.querySelectorAll(".has-sub.open").forEach(item => {
      item.classList.remove("open");
    });
  }

  console.log("🚀 Sidebar inicializada com sucesso");
}