document.addEventListener("DOMContentLoaded", () => {

  // ===============================
  // SIDEBAR
  // ===============================
  function initSidebar() {
    const menuToggle = document.getElementById("menuToggle");
    const sidebar = document.getElementById("sidebar");
    const overlay = document.getElementById("overlay");

    if (!menuToggle || !sidebar || !overlay) return;

    menuToggle.addEventListener("click", () => {
      sidebar.classList.toggle("active");
      overlay.classList.toggle("active");

      document.body.style.overflow =
        sidebar.classList.contains("active") ? "hidden" : "";
    });

    overlay.addEventListener("click", () => {
      sidebar.classList.remove("active");
      overlay.classList.remove("active");
      document.body.style.overflow = "";
    });

    sidebar.addEventListener("click", (e) => {
      const btn = e.target.closest(".sub-toggle");
      if (!btn) return;

      e.preventDefault();
      btn.closest(".has-sub")?.classList.toggle("open");
    });
  }

  // ===============================
  // LOAD COMPONENTES
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
  // PDF ENGINE 🔥 PROFISSIONAL
  // ===============================
  function initPDF(canvasId, suffix = "") {

    if (typeof pdfjsLib === "undefined") return;

    const url = "/assets/docs/bibliotecasvirtuaisminhabibliotecaebsco/Cartaz-ebsco1_merged.pdf";

    const canvas = document.getElementById(canvasId);
    if (!canvas) return;

    const ctx = canvas.getContext("2d");

    let pdfDoc = null;
    let pageNum = 1;
    let scale = 0.6; // 🔥 ZOOM PADRÃO 60%
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

        if (pageNumEl) pageNumEl.textContent = num;
        if (pageCountEl) pageCountEl.textContent = pdfDoc.numPages;
        if (zoomLevelEl) zoomLevelEl.textContent = Math.round(scale * 100) + "%";
      });
    }

    pdfjsLib.getDocument(url).promise.then(pdf => {
      pdfDoc = pdf;
      renderPage(pageNum);
    });

    // ===============================
    // CONTROLES (SEM BUG 🔥)
    // ===============================
    document.addEventListener("click", (e) => {

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
  // INIT PDF NORMAL
  // ===============================
  initPDF("pdf-canvas", "");

  // ===============================
  // MODAL
  // ===============================
  const modal = document.getElementById("modalPDF");
  const openBtn = document.getElementById("abrirModal");
  const closeBtn = document.getElementById("fecharModal");

  if (modal && openBtn && closeBtn) {

    openBtn.addEventListener("click", () => {
      modal.classList.add("active");
      document.body.style.overflow = "hidden";

      initPDF("pdf-canvas-modal", "-modal");
    });

    function closeModal() {
      modal.classList.remove("active");
      document.body.style.overflow = "";
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