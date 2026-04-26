// ===============================
// ELEMENTOS PRINCIPAIS
// ===============================

const toggle = document.getElementById("menuToggle");
const overlay = document.getElementById("overlay");

// sidebar é injetada via fetch
let sidebar = null;


// ===============================
// ESPERA SIDEBAR SER CARREGADA
// ===============================

const waitSidebar = setInterval(() => {
  sidebar = document.querySelector(".sidebar");

  if (sidebar) {
    clearInterval(waitSidebar);
    initSidebar();
  }
}, 100);


// ===============================
// INICIALIZA SIDEBAR
// ===============================

function initSidebar() {

  const subToggles = document.querySelectorAll(".sub-toggle");

  // ===============================
  // SUBMENUS
  // ===============================
  subToggles.forEach(btn => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();

      const parent = btn.closest(".has-sub");
      const isOpen = parent.classList.contains("open");

      // fecha outros menus abertos
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

  // clique fora da sidebar
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
// ABRIR / FECHAR MENU
// ===============================

if (toggle && overlay) {

  toggle.addEventListener("click", (e) => {
    e.stopPropagation();

    if (!sidebar) return;

    const isActive = sidebar.classList.toggle("active");
    overlay.classList.toggle("active");

    toggle.setAttribute("aria-expanded", isActive);

    if (!isActive) closeAllSubmenus();
  });

  overlay.addEventListener("click", closeSidebar);
}


// ===============================
// FECHAR SIDEBAR
// ===============================

function closeSidebar() {
  if (!sidebar) return;

  sidebar.classList.remove("active");
  overlay.classList.remove("active");
  toggle.setAttribute("aria-expanded", "false");

  closeAllSubmenus();
}


// ===============================
// FECHAR SUBMENUS
// ===============================

function closeAllSubmenus() {
  document.querySelectorAll(".has-sub.open").forEach(item => {
    item.classList.remove("open");
    item.querySelector(".sub-toggle")?.setAttribute("aria-expanded", "false");
  });
}


// ===============================
// ESC FECHA MENU
// ===============================

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    closeSidebar();
  }
});


// ===============================
// REVEAL (ANIMAÇÃO AO SCROLL)
// ===============================

const reveals = document.querySelectorAll(".reveal");

function revealOnScroll() {
  const windowHeight = window.innerHeight;

  reveals.forEach((el, index) => {
    const elementTop = el.getBoundingClientRect().top;

    if (elementTop < windowHeight - 100) {
      setTimeout(() => {
        el.classList.add("active");
      }, index * 100);
    }
  });
}

// eventos de scroll
window.addEventListener("load", revealOnScroll);
window.addEventListener("scroll", revealOnScroll);


// ===============================
// DEBUG
// ===============================

console.log("🚀 Sistema atualizado carregado (sidebar dinâmica + menu + reveal)");