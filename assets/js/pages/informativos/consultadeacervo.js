document.addEventListener("DOMContentLoaded", () => {

  let sidebarEl = null;
  const overlayEl = document.getElementById("overlay");
  const menuToggle = document.getElementById("menuToggle");

  // ===============================
  // SIDEBAR INIT (ROBUSTO)
  // ===============================
  function initSidebar() {

    if (!menuToggle || !overlayEl) return;

    function getSidebar() {
      return document.querySelector(".sidebar");
    }

    function openSidebar() {
      sidebarEl = getSidebar();

      if (!sidebarEl) {
        console.warn("Sidebar ainda não carregada.");
        return;
      }

      sidebarEl.classList.add("active");
      overlayEl.classList.add("active");
      document.body.classList.add("sidebar-open");
    }

    function closeSidebar() {
      sidebarEl = getSidebar();

      sidebarEl?.classList.remove("active");
      overlayEl.classList.remove("active");
      document.body.classList.remove("sidebar-open");
    }

    menuToggle.addEventListener("click", openSidebar);
    overlayEl.addEventListener("click", closeSidebar);

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") closeSidebar();
    });

    // submenu
    document.addEventListener("click", (e) => {
      const btn = e.target.closest(".sub-toggle");
      if (!btn) return;

      e.preventDefault();
      btn.closest(".has-sub")?.classList.toggle("open");
    });
  }

  // ===============================
  // FETCH COMPONENTES (CORRIGIDO)
  // ===============================
  Promise.all([
    fetch("/components/sidebar.html").then(r => r.text()),
    fetch("/components/footer.html").then(r => r.text())
  ])
    .then(([sidebarHTML, footerHTML]) => {

      const sidebarContainer = document.getElementById("sidebar-container");
      const footerContainer = document.getElementById("footer-container");

      if (sidebarContainer) sidebarContainer.innerHTML = sidebarHTML;
      if (footerContainer) footerContainer.innerHTML = footerHTML;

      // espera renderização real do DOM
      setTimeout(() => {
        initSidebar();
      }, 100);

    })
    .catch(err => console.error("Erro ao carregar componentes:", err));


  // ===============================
  // PDF (mantido)
  // ===============================
  function initPDF(canvasId, suffix = "") {

    if (!window.pdfjsLib) return;

    const url = "/assets/docs/documentosinformativos/Cartaz-Consulta ao Pergamum.pdf";

    const canvas = document.getElementById(canvasId);
    if (!canvas) return;

    const ctx = canvas.getContext("2d");

    let pdfDoc = null;
    let pageNum = 1;
    let scale = 0.6;

    const pageNumEl = document.querySelector(`[data-page-num${suffix}]`);
    const pageCountEl = document.querySelector(`[data-page-count${suffix}]`);
    const zoomLevelEl = document.querySelector(`[data-zoom-level${suffix}]`);

    function renderPage(num) {

      pdfDoc.getPage(num).then(page => {

        const viewport = page.getViewport({ scale });

        canvas.width = viewport.width;
        canvas.height = viewport.height;

        page.render({
          canvasContext: ctx,
          viewport
        });

        if (pageNumEl) pageNumEl.textContent = num;
        if (pageCountEl) pageCountEl.textContent = pdfDoc.numPages;
        if (zoomLevelEl) zoomLevelEl.textContent = Math.round(scale * 100) + "%";
      });
    }

    pdfjsLib.getDocument(url).promise.then(pdf => {
      pdfDoc = pdf;
      renderPage(pageNum);
    });

    const wrapper = canvas.closest(".pdf-wrapper");

    wrapper?.addEventListener("click", (e) => {

      if (!pdfDoc) return;

      if (e.target.closest(`[data-prev${suffix}]`)) {
        if (pageNum > 1) renderPage(--pageNum);
      }

      if (e.target.closest(`[data-next${suffix}]`)) {
        if (pageNum < pdfDoc.numPages) renderPage(++pageNum);
      }

      if (e.target.closest(`[data-zoom-in${suffix}]`)) {
        scale = Math.min(3, scale + 0.2);
        renderPage(pageNum);
      }

      if (e.target.closest(`[data-zoom-out${suffix}]`)) {
        scale = Math.max(0.5, scale - 0.2);
        renderPage(pageNum);
      }

    });
  }

  initPDF("pdf-canvas", "");

  // ===============================
  // MODAL
  // ===============================
  const modal = document.getElementById("modalPDF");
  const openBtn = document.getElementById("abrirModal");
  const closeBtn = document.getElementById("fecharModal");

  let modalLoaded = false;

  if (modal && openBtn && closeBtn) {

    openBtn.addEventListener("click", () => {
      modal.classList.add("active");
      document.body.classList.add("sidebar-open");

      if (!modalLoaded) {
        initPDF("pdf-canvas-modal", "-modal");
        modalLoaded = true;
      }
    });

    function closeModal() {
      modal.classList.remove("active");
      document.body.classList.remove("sidebar-open");
    }

    closeBtn.addEventListener("click", closeModal);

    modal.addEventListener("click", (e) => {
      if (e.target === modal) closeModal();
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") closeModal();
    });
  }

});