// ===============================
// ELEMENTOS
// ===============================

const sidebar = document.getElementById("sidebar");
const toggle = document.getElementById("menuToggle");
const overlay = document.getElementById("overlay");
const subToggles = document.querySelectorAll(".sub-toggle");


// ===============================
// SUBMENUS
// ===============================

subToggles.forEach(btn => {
  btn.addEventListener("click", (e) => {
    e.stopPropagation();

    const parent = btn.closest(".has-sub");
    const isOpen = parent.classList.contains("open");

    // fecha outros
    document.querySelectorAll(".has-sub.open").forEach(item => {
      if (item !== parent) {
        item.classList.remove("open");
        item.querySelector(".sub-toggle")?.setAttribute("aria-expanded", "false");
      }
    });

    // toggle atual
    parent.classList.toggle("open");
    btn.setAttribute("aria-expanded", !isOpen);
  });
});


// ===============================
// MENU TOGGLE (UNIFICADO)
// ===============================

if (toggle && sidebar && overlay) {

  toggle.addEventListener("click", (e) => {
    e.stopPropagation();

    const isActive = sidebar.classList.toggle("active");
    overlay.classList.toggle("active");

    // acessibilidade
    toggle.setAttribute("aria-expanded", isActive);

    // fecha submenus ao fechar sidebar
    if (!isActive) {
      closeAllSubmenus();
    }
  });

  // clique no overlay
  overlay.addEventListener("click", () => {
    closeSidebar();
  });

  // clique fora (melhorado 🔥)
  document.addEventListener("click", (e) => {
    const clickedOutside =
      !sidebar.contains(e.target) &&
      !toggle.contains(e.target);

    if (clickedOutside && sidebar.classList.contains("active")) {
      closeSidebar();
    }
  });
}


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
  document.querySelectorAll(".has-sub.open").forEach(item => {
    item.classList.remove("open");
    item.querySelector(".sub-toggle")?.setAttribute("aria-expanded", "false");
  });
}


// ===============================
// MELHORIA UX (ESC fecha menu)
// ===============================

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    closeSidebar();
  }
});


// ===============================
// DEBUG
// ===============================

console.log("🚀 Sidebar profissional 100%");