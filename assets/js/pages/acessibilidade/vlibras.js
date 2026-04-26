document.addEventListener("DOMContentLoaded", () => {

// ===============================
// SIDEBAR (EVENT DELEGATION)
// ===============================
function initSidebar() {

  if (window.__sidebarInitialized) return;
  window.__sidebarInitialized = true;

  document.addEventListener("click", (e) => {

    const sidebar    = document.getElementById("sidebar");
    const overlay    = document.getElementById("overlay");
    const menuToggle = document.getElementById("menuToggle");

    if (!sidebar || !overlay) return;

    const hitToggle  = e.target.closest("#menuToggle");
    const hitOverlay = e.target.closest("#overlay");
    const hitSubBtn  = e.target.closest(".sub-toggle");

    if (hitToggle) {
      const isActive = sidebar.classList.toggle("active");
      overlay.classList.toggle("active");
      document.body.style.overflow = isActive ? "hidden" : "";
      if (menuToggle) menuToggle.setAttribute("aria-expanded", String(isActive));
    }

    if (hitOverlay) closeSidebar(sidebar, overlay, menuToggle);

    if (hitSubBtn) {
      e.preventDefault();
      const parent = hitSubBtn.closest(".has-sub");
      if (!parent) return;

      document.querySelectorAll(".has-sub.open").forEach(item => {
        if (item !== parent) item.classList.remove("open");
      });

      parent.classList.toggle("open");
      hitSubBtn.setAttribute("aria-expanded", String(parent.classList.contains("open")));
    }
  });

  document.addEventListener("keydown", (e) => {
    if (e.key !== "Escape") return;
    const sidebar    = document.getElementById("sidebar");
    const overlay    = document.getElementById("overlay");
    const menuToggle = document.getElementById("menuToggle");
    if (sidebar?.classList.contains("active")) closeSidebar(sidebar, overlay, menuToggle);
  });

  function closeSidebar(sidebar, overlay, toggle) {
    sidebar?.classList.remove("active");
    overlay?.classList.remove("active");
    document.body.style.overflow = "";
    if (toggle) toggle.setAttribute("aria-expanded", "false");
    document.querySelectorAll(".has-sub.open").forEach(item => item.classList.remove("open"));
  }
}


// ===============================
// INCLUDES (SIDEBAR + FOOTER)
// ===============================
function loadIncludes() {

  const sidebarContainer = document.getElementById("sidebar-container");
  const footerContainer  = document.getElementById("footer-container");
  const promises = [];

  if (sidebarContainer) {
    promises.push(
      fetch("/components/sidebar.html")
        .then(r => { if (!r.ok) throw new Error("sidebar 404"); return r.text(); })
        .then(html => { sidebarContainer.innerHTML = html; })
        .catch(err => console.warn("⚠️ Sidebar não carregado:", err.message))
    );
  }

  if (footerContainer) {
    promises.push(
      fetch("/components/footer.html")
        .then(r => { if (!r.ok) throw new Error("footer 404"); return r.text(); })
        .then(html => { footerContainer.innerHTML = html; })
        .catch(err => console.warn("⚠️ Footer não carregado:", err.message))
    );
  }

  return Promise.allSettled(promises);
}


// ===============================
// REVEAL SCROLL
// ===============================
function initReveal() {
  const reveals = document.querySelectorAll(".reveal");
  if (!reveals.length) return;

  function check() {
    const wh = window.innerHeight;
    reveals.forEach(el => {
      if (el.getBoundingClientRect().top < wh - 100) el.classList.add("active");
    });
  }

  window.addEventListener("scroll", check, { passive: true });
  check();
}


// ===============================
// INIT
// ===============================
initSidebar();
initReveal();
loadIncludes();

});