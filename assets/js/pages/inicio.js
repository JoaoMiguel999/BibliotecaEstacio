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
// MENU TOGGLE (🔥 UNIFICADO)
// ===============================

if (toggle && sidebar && overlay) {

  toggle.addEventListener("click", (e) => {
    e.stopPropagation();

    // 🔥 AGORA FUNCIONA IGUAL EM TODOS OS TAMANHOS
    sidebar.classList.toggle("active");
    overlay.classList.toggle("active");

    // fecha submenus ao fechar
    if (!sidebar.classList.contains("active")) {
      document.querySelectorAll(".has-sub.open").forEach(item => {
        item.classList.remove("open");
        item.querySelector(".sub-toggle")?.setAttribute("aria-expanded", "false");
      });
    }
  });

  // clique no overlay
  overlay.addEventListener("click", () => {
    sidebar.classList.remove("active");
    overlay.classList.remove("active");
  });

  // clique fora (desktop + mobile)
  document.addEventListener("click", (e) => {
    if (
      !sidebar.contains(e.target) &&
      !toggle.contains(e.target)
    ) {
      sidebar.classList.remove("active");
      overlay.classList.remove("active");
    }
  });
}


