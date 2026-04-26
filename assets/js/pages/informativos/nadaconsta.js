document.addEventListener("DOMContentLoaded", () => {

  // ===============================
  // SIDEBAR (CORRIGIDO PARA SEU HTML)
  // ===============================
  function initSidebar() {
    const menuToggle = document.getElementById("menuToggle");
    const sidebarContainer = document.getElementById("sidebar-container");
    const overlay = document.getElementById("overlay");

    if (!menuToggle || !overlay) return;

    let sidebar = null;

    // pega sidebar depois do fetch
    const waitSidebar = () => {
      sidebar = sidebarContainer?.querySelector(".sidebar");
    };

    menuToggle.addEventListener("click", () => {

      waitSidebar();

      if (!sidebar) return;

      sidebar.classList.toggle("active");
      overlay.classList.toggle("active");

      document.body.classList.toggle("sidebar-open");
    });

    overlay.addEventListener("click", () => {

      waitSidebar();

      sidebar?.classList.remove("active");
      overlay.classList.remove("active");

      document.body.classList.remove("sidebar-open");
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
  // CARREGAMENTO COMPONENTES
  // ===============================
  fetch("/components/sidebar.html")
    .then(res => res.text())
    .then(html => {
      const el = document.getElementById("sidebar-container");
      if (!el) return;

      el.innerHTML = html;
      initSidebar();
    });

  fetch("/components/footer.html")
    .then(res => res.text())
    .then(html => {
      const el = document.getElementById("footer-container");
      if (el) el.innerHTML = html;
    });

  // ===============================
  // PDF ENGINE (ISOLADO E SEM CONFLITO)
  // ===============================
  function initPDF(canvasId, suffix = "") {

    if (typeof pdfjsLib === "undefined") return;

    const url = "/assets/docs/documentosinformativos/Nadaconsta.pdf";

    const canvas = document.getElementById(canvasId);
    if (!canvas) return;

    const ctx = canvas.getContext("2d");

    let pdfDoc = null;
    let pageNum = 1;
    let scale = 0.6;
    let renderTask = null;

    const pageNumEl = document.querySelector(`[data-page-num${suffix}]`);
    const pageCountEl = document.querySelector(`[data-page-count${suffix}]`);
    const zoomLevelEl = document.querySelector(`[data-zoom-level${suffix}]`);

    function renderPage(num) {

      pdfDoc.getPage(num).then(page => {

        const viewport = page.getViewport({ scale });

        if (renderTask) renderTask.cancel();

        canvas.width = viewport.width;
        canvas.height = viewport.height;

        renderTask = page.render({
          canvasContext: ctx,
          viewport
        });

        pageNumEl && (pageNumEl.textContent = num);
        pageCountEl && (pageCountEl.textContent = pdfDoc.numPages);
        zoomLevelEl && (zoomLevelEl.textContent = Math.round(scale * 100) + "%");
      });
    }

    pdfjsLib.getDocument(url).promise.then(pdf => {
      pdfDoc = pdf;
      renderPage(pageNum);
    });

    // EVENTOS ISOLADOS (NÃO GLOBAL)
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

  // ===============================
  // INIT PDF PRINCIPAL
  // ===============================
  initPDF("pdf-canvas", "");

  // ===============================
  // MODAL PDF (SEM DUPLICAÇÃO)
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