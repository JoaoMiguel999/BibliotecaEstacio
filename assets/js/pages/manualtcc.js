// ===============================
// ELEMENTOS
// ===============================

const sidebar = document.getElementById("sidebar");
const toggle = document.getElementById("menuToggle");
const overlay = document.getElementById("overlay");
const subToggles = document.querySelectorAll(".sub-toggle");

// MODAL PDF
const modal = document.getElementById("modalPDF");
const abrirModalBtn = document.getElementById("abrirModal");
const fecharModalBtn = document.getElementById("fecharModal");


// ===============================
// SUBMENUS (🔥 MELHORADO)
// ===============================

subToggles.forEach(btn => {
  btn.addEventListener("click", (e) => {
    e.stopPropagation();

    const parent = btn.closest(".has-sub");
    if (!parent) return;

    const isOpen = parent.classList.contains("open");

    // fecha outros menus
    document.querySelectorAll(".has-sub.open").forEach(item => {
      if (item !== parent) {
        item.classList.remove("open");
        item.querySelector(".sub-toggle")?.setAttribute("aria-expanded", "false");
      }
    });

    // toggle atual
    parent.classList.toggle("open");
    btn.setAttribute("aria-expanded", String(!isOpen));
  });
});


// ===============================
// MENU SIDEBAR (🔥 PROFISSIONAL)
// ===============================

if (toggle && sidebar && overlay) {

  const fecharSidebar = () => {
    sidebar.classList.remove("active");
    overlay.classList.remove("active");
    toggle.setAttribute("aria-expanded", "false");
  };

  const abrirSidebar = () => {
    sidebar.classList.add("active");
    overlay.classList.add("active");
    toggle.setAttribute("aria-expanded", "true");
  };

  toggle.addEventListener("click", (e) => {
    e.stopPropagation();

    const isActive = sidebar.classList.contains("active");

    if (isActive) {
      fecharSidebar();
    } else {
      abrirSidebar();
    }

    // fecha submenus ao fechar
    if (!sidebar.classList.contains("active")) {
      document.querySelectorAll(".has-sub.open").forEach(item => {
        item.classList.remove("open");
        item.querySelector(".sub-toggle")?.setAttribute("aria-expanded", "false");
      });
    }
  });

  // clique no overlay
  overlay.addEventListener("click", fecharSidebar);

  // clique fora
  document.addEventListener("click", (e) => {
    if (
      sidebar.classList.contains("active") &&
      !sidebar.contains(e.target) &&
      !toggle.contains(e.target)
    ) {
      fecharSidebar();
    }
  });
}


// ===============================
// MODAL PDF (🔥 MELHORADO)
// ===============================

if (modal && abrirModalBtn && fecharModalBtn) {

  let lastFocusedElement = null;

  const abrirModal = () => {
    lastFocusedElement = document.activeElement;

    modal.classList.add("active");
    document.body.style.overflow = "hidden";

    // foco acessível
    fecharModalBtn.focus();
  };

  const fecharModal = () => {
    modal.classList.remove("active");
    document.body.style.overflow = "";

    // volta foco
    if (lastFocusedElement) {
      lastFocusedElement.focus();
    }
  };

  // abrir
  abrirModalBtn.addEventListener("click", abrirModal);

  // fechar botão
  fecharModalBtn.addEventListener("click", fecharModal);

  // fechar clicando fora
  modal.addEventListener("click", (e) => {
    if (e.target === modal) {
      fecharModal();
    }
  });

  // fechar com ESC
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && modal.classList.contains("active")) {
      fecharModal();
    }
  });
}