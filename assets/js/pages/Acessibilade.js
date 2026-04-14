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
// MENU TOGGLE
// ===============================

if (toggle && sidebar && overlay) {

  toggle.addEventListener("click", (e) => {
    e.stopPropagation();

    const isActive = sidebar.classList.toggle("active");
    overlay.classList.toggle("active");

    toggle.setAttribute("aria-expanded", isActive);

    if (!isActive) closeAllSubmenus();
  });

  overlay.addEventListener("click", closeSidebar);

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
// REVEAL (ANIMAÇÃO AO SCROLL) 🔥
// ===============================

const reveals = document.querySelectorAll(".reveal");

function revealOnScroll() {
  const windowHeight = window.innerHeight;

  reveals.forEach((el, index) => {
    const elementTop = el.getBoundingClientRect().top;

    if (elementTop < windowHeight - 100) {
      // delay suave nos elementos (efeito premium)
      setTimeout(() => {
        el.classList.add("active");
      }, index * 100);
    }
  });
}

// executa ao carregar
window.addEventListener("load", revealOnScroll);

// executa ao rolar
window.addEventListener("scroll", revealOnScroll);


// ===============================
// DEBUG
// ===============================

console.log("🚀 Sistema completo carregado (menu + reveal)");