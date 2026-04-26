document.addEventListener("DOMContentLoaded", () => {
  loadSidebar();
  loadFooter();

  initMenuToggle();
  initRevealOnScroll();
});


// ===============================
// SIDEBAR (LOAD DINÂMICO)
// ===============================
function loadSidebar() {
  const container = document.getElementById("sidebar-container");
  if (!container) return;

  fetch("../../../components/sidebar.html")
    .then(res => res.text())
    .then(html => {
      container.innerHTML = html;

      // inicializa tudo APÓS carregar HTML
      initSidebarEvents();
      initSubmenu();
    })
    .catch(err => console.error("Erro ao carregar sidebar:", err));
}


// ===============================
// FOOTER
// ===============================
function loadFooter() {
  const container = document.getElementById("footer-container");
  if (!container) return;

  fetch("../../../components/footer.html")
    .then(res => res.text())
    .then(html => {
      container.innerHTML = html;
    })
    .catch(err => console.error("Erro ao carregar footer:", err));
}


// ===============================
// MENU TOGGLE (OPEN/CLOSE SIDEBAR)
// ===============================
function initMenuToggle() {
  const menuToggle = document.getElementById("menuToggle");
  const overlay = document.getElementById("overlay");

  if (!menuToggle || !overlay) return;

  menuToggle.addEventListener("click", toggleSidebar);
  overlay.addEventListener("click", closeSidebar);

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeSidebar();
  });
}


// abre / fecha sidebar
function toggleSidebar() {
  const sidebar = document.querySelector(".sidebar");
  const overlay = document.getElementById("overlay");
  const menuToggle = document.getElementById("menuToggle");

  if (!sidebar || !overlay) return;

  const isOpen = sidebar.classList.toggle("active");
  overlay.classList.toggle("active", isOpen);

  menuToggle?.setAttribute("aria-expanded", isOpen);
}


// fecha sidebar
function closeSidebar() {
  const sidebar = document.querySelector(".sidebar");
  const overlay = document.getElementById("overlay");
  const menuToggle = document.getElementById("menuToggle");

  if (!sidebar || !overlay) return;

  sidebar.classList.remove("active");
  overlay.classList.remove("active");

  menuToggle?.setAttribute("aria-expanded", "false");
}


// ===============================
// FECHAR SIDEBAR AO CLICAR EM LINK
// ===============================
function initSidebarEvents() {
  const sidebar = document.querySelector(".sidebar");
  if (!sidebar) return;

  sidebar.addEventListener("click", (e) => {
    const link = e.target.closest("a");
    if (!link) return;

    closeSidebar();
  });
}


// ===============================
// SUBMENU (CORRIGIDO PARA SEU HTML)
// ===============================
function initSubmenu() {
  const sidebar = document.querySelector(".sidebar");
  if (!sidebar) return;

  sidebar.addEventListener("click", (e) => {
    const toggle = e.target.closest(".sub-toggle");
    if (!toggle) return;

    const parent = toggle.closest(".has-sub");
    if (!parent) return;

    const submenu = parent.querySelector(".sub");
    if (!submenu) return;

    const isOpen = parent.classList.contains("open");

    // fecha outros menus
    document.querySelectorAll(".has-sub.open").forEach(item => {
      if (item !== parent) item.classList.remove("open");
    });

    // toggle atual
    parent.classList.toggle("open", !isOpen);
  });
}


// ===============================
// REVEAL ON SCROLL
// ===============================
function initRevealOnScroll() {
  const elements = document.querySelectorAll(".reveal");

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("active");
      }
    });
  }, {
    threshold: 0.1
  });

  elements.forEach(el => observer.observe(el));
}