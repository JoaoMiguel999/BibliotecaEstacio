// ===============================
// ELEMENTOS PRINCIPAIS
// ===============================

const toggle = document.getElementById("menuToggle");
const overlay = document.getElementById("overlay");

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

  // pega apenas botões da sidebar
  const subToggles = sidebar.querySelectorAll(".sub-toggle");

  // ===============================
  // SUBMENUS
  // ===============================

  subToggles.forEach(btn => {

    btn.addEventListener("click", (e) => {

      e.preventDefault();
      e.stopPropagation();

      const parent = btn.closest(".has-sub");

      if (!parent) return;

      const isOpen = parent.classList.contains("open");

      // fecha outros submenus
      sidebar.querySelectorAll(".has-sub.open").forEach(item => {

        if (item !== parent) {

          item.classList.remove("open");

          item
            .querySelector(".sub-toggle")
            ?.setAttribute("aria-expanded", "false");
        }

      });

      // abre atual
      parent.classList.toggle("open");

      btn.setAttribute(
        "aria-expanded",
        String(!isOpen)
      );

    });

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

    toggle.setAttribute(
      "aria-expanded",
      String(isActive)
    );

    if (!isActive) {
      closeAllSubmenus();
    }

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

  if (!sidebar) return;

  sidebar.querySelectorAll(".has-sub.open").forEach(item => {

    item.classList.remove("open");

    item
      .querySelector(".sub-toggle")
      ?.setAttribute("aria-expanded", "false");

  });

}


// ===============================
// CLIQUE FORA FECHA MENU
// ===============================

document.addEventListener("click", (e) => {

  if (!sidebar || !toggle) return;

  const clickedOutside =
    !sidebar.contains(e.target) &&
    !toggle.contains(e.target);

  if (
    clickedOutside &&
    sidebar.classList.contains("active")
  ) {
    closeSidebar();
  }

});


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

    const elementTop =
      el.getBoundingClientRect().top;

    if (elementTop < windowHeight - 100) {

      setTimeout(() => {
        el.classList.add("active");
      }, index * 100);

    }

  });

}


// ===============================
// EVENTOS
// ===============================

window.addEventListener("load", revealOnScroll);

window.addEventListener("scroll", revealOnScroll);


// ===============================
// DEBUG
// ===============================

console.log(
  "🚀 Sidebar dinâmica carregada com sucesso"
);