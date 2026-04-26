document.addEventListener("DOMContentLoaded", () => {

  const menuToggle = document.getElementById("menuToggle");
  const overlay = document.getElementById("overlay");
  const sidebarContainer = document.getElementById("sidebar-container");

  if (!menuToggle || !overlay || !sidebarContainer) return;

  let sidebar = null;

  // ===============================
  // CAPTURA SIDEBAR APÓS FETCH
  // ===============================
 fetch("../../../../components/sidebar.html")
  .then(r => r.text())
  .then(html => {

    sidebarContainer.innerHTML = html;

    // 🔥 CORREÇÃO DEFINITIVA
    sidebar = sidebarContainer.querySelector(".sidebar");

  });

  // ===============================
  // ABRIR
  // ===============================
  function openSidebar() {
    if (!sidebar) return;

    sidebar.classList.add("active");
    overlay.classList.add("active");
    document.body.classList.add("sidebar-open");
  }

  // ===============================
  // FECHAR
  // ===============================
  function closeSidebar() {
    if (!sidebar) return;

    sidebar.classList.remove("active");
    overlay.classList.remove("active");
    document.body.classList.remove("sidebar-open");
  }

  // ===============================
  // TOGGLE (AGORA FUNCIONA SEM ERRO)
  // ===============================
  function toggleSidebar() {
    if (!sidebar) return;

    if (sidebar.classList.contains("active")) {
      closeSidebar();
    } else {
      openSidebar();
    }
  }

  // ===============================
  // EVENTOS
  // ===============================
  menuToggle.addEventListener("click", toggleSidebar);
  overlay.addEventListener("click", closeSidebar);

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeSidebar();
  });

  // ===============================
  // SUBMENU
  // ===============================
  document.addEventListener("click", (e) => {
    const btn = e.target.closest(".sub-toggle");
    if (!btn) return;

    e.preventDefault();
    btn.closest(".has-sub")?.classList.toggle("open");
  });

});