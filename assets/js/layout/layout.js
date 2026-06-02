// ===============================
// SCROLL REVEAL
// ===============================
document.addEventListener("DOMContentLoaded", () => {
  const revealEls = document.querySelectorAll(".reveal");

  if (revealEls.length) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
        }
      });
    }, { threshold: 0.1 });

    revealEls.forEach(el => observer.observe(el));
  }
});


// ===============================
// CARREGAMENTO DE COMPONENTES
// ===============================
document.addEventListener("DOMContentLoaded", () => {

  Promise.all([
    loadComponent("/components/sidebar.html", "sidebar-container"),
    loadComponent("/components/footer.html",  "footer-container")
  ]).then(([sidebarOk]) => {
    if (sidebarOk) initSidebar();
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

      // Fecha outros submenus abertos (comportamento acordeão)
      sidebar.querySelectorAll(".has-sub.open").forEach(item => {
        if (item !== parent) {
          item.classList.remove("open");
          const otherBtn = item.querySelector(".sub-toggle");
          if (otherBtn) otherBtn.setAttribute("aria-expanded", "false");
        }
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


  // Overlay fecha sidebar
  overlay.addEventListener("click", closeSidebar);


  // Clique fora fecha sidebar
  document.addEventListener("click", (e) => {
    if (
      sidebar.classList.contains("active") &&
      !sidebar.contains(e.target) &&
      !toggle.contains(e.target)
    ) {
      closeSidebar();
    }
  });


  // Tecla ESC fecha sidebar (cede prioridade ao modal PDF)
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      const modalPDF = document.getElementById("modalPDF");
      if (modalPDF?.classList.contains("active")) return;
      closeSidebar();
    }
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
      const btn = item.querySelector(".sub-toggle");
      if (btn) btn.setAttribute("aria-expanded", "false");
    });
  }

  console.log("🚀 Sidebar inicializada com sucesso");
}

console.log("🚀 Global JS carregado");