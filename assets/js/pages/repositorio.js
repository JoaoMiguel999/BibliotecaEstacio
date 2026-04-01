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
// SUBMENUS (🔥 MAIS SUAVE)
// ===============================
subToggles.forEach(btn => {
  btn.setAttribute("aria-expanded", "false");

  btn.addEventListener("click", (e) => {
    e.stopPropagation();

    const parent = btn.closest(".has-sub");
    if (!parent) return;

    const isOpen = parent.classList.contains("open");

    // fecha outros com animação suave
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
// SIDEBAR MENU (🔥 UX MELHORADA)
// ===============================
if (toggle && sidebar && overlay) {

  const fecharSidebar = () => {
    sidebar.classList.remove("active");
    overlay.classList.remove("active");
    toggle.setAttribute("aria-expanded", "false");

    // fecha submenus
    document.querySelectorAll(".has-sub.open").forEach(item => {
      item.classList.remove("open");
      item.querySelector(".sub-toggle")?.setAttribute("aria-expanded", "false");
    });

    document.body.style.overflow = "";
  };

  const abrirSidebar = () => {
    sidebar.classList.add("active");
    overlay.classList.add("active");
    toggle.setAttribute("aria-expanded", "true");

    // trava scroll no mobile
    document.body.style.overflow = "hidden";
  };

  toggle.addEventListener("click", (e) => {
    e.stopPropagation();

    sidebar.classList.contains("active")
      ? fecharSidebar()
      : abrirSidebar();
  });

  // overlay fecha
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

  // ESC fecha sidebar
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && sidebar.classList.contains("active")) {
      fecharSidebar();
    }
  });
}


// ===============================
// MODAL PDF (🔥 PROFISSIONAL)
// ===============================
if (modal && abrirModalBtn && fecharModalBtn) {

  let lastFocusedElement = null;

  const abrirModal = () => {
    lastFocusedElement = document.activeElement;

    modal.classList.add("active");
    document.body.style.overflow = "hidden";

    // delay pra suavizar foco
    setTimeout(() => {
      fecharModalBtn.focus();
    }, 100);
  };

  const fecharModal = () => {
    modal.classList.remove("active");
    document.body.style.overflow = "";

    if (lastFocusedElement) {
      lastFocusedElement.focus();
    }
  };

  // abrir
  abrirModalBtn.addEventListener("click", abrirModal);

  // fechar botão
  fecharModalBtn.addEventListener("click", fecharModal);

  // clicar fora
  modal.addEventListener("click", (e) => {
    if (e.target === modal) {
      fecharModal();
    }
  });

  // ESC fecha modal
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && modal.classList.contains("active")) {
      fecharModal();
    }
  });
}