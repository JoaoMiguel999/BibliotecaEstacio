document.addEventListener("DOMContentLoaded", () => {

  // ===============================
  // SIDEBAR (EVENT DELEGATION)
  // ===============================
  function initSidebar() {

    if (window.__sidebarInitialized) return;
    window.__sidebarInitialized = true;

    document.addEventListener("click", (e) => {

      const sidebar = document.getElementById("sidebar");
      const overlay = document.getElementById("overlay");

      if (!sidebar || !overlay) return;

      const menuToggle = e.target.closest("#menuToggle");
      const overlayHit = e.target.closest("#overlay");
      const subBtn     = e.target.closest(".sub-toggle");

      // abrir / fechar sidebar
      if (menuToggle) {
        const isActive = sidebar.classList.toggle("active");
        overlay.classList.toggle("active");
        document.body.style.overflow = isActive ? "hidden" : "";
      }

      // fechar clicando no overlay
      if (overlayHit) {
        sidebar.classList.remove("active");
        overlay.classList.remove("active");
        document.body.style.overflow = "";
      }

      // submenu
      if (subBtn) {
        e.preventDefault();

        const parent = subBtn.closest(".has-sub");
        if (!parent) return;

        document.querySelectorAll(".has-sub.open").forEach(item => {
          if (item !== parent) item.classList.remove("open");
        });

        parent.classList.toggle("open");
        subBtn.setAttribute("aria-expanded", parent.classList.contains("open"));
      }
    });
  }


  // ===============================
  // INCLUDES
  // ===============================
  function loadIncludes() {

    const items = [
      { id: "sidebar-container", path: "../../components/sidebar.html" },
      { id: "footer-container",  path: "../../components/footer.html" }
    ];

    items.forEach(({ id, path }) => {
      const el = document.getElementById(id);
      if (!el) return;

      fetch(path)
        .then(r => {
          if (!r.ok) throw new Error(path);
          return r.text();
        })
        .then(html => el.innerHTML = html)
        .catch(() => console.warn("Erro ao carregar:", path));
    });
  }


  // ===============================
  // MODAL
  // ===============================
  function initModal() {

    const modal = document.getElementById("modalPDF");
    const open  = document.getElementById("abrirModal");
    const close = document.getElementById("fecharModal");

    if (!modal || !open || !close) return;

    const openModal = () => {
      modal.classList.add("active");
      document.body.style.overflow = "hidden";

      // 🔥 FORÇA 100% NO FULLSCREEN
      if (window.renderPDFPage) {
        window.pdfScale = 1;
        window.renderPDFPage(window.currentPage || 1);
      }
    };

    const closeModal = () => {
      modal.classList.remove("active");
      document.body.style.overflow = "";
    };

    open.addEventListener("click", openModal);
    close.addEventListener("click", closeModal);

    modal.addEventListener("click", (e) => {
      if (e.target === modal) closeModal();
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && modal.classList.contains("active")) {
        closeModal();
      }
    });
  }


  // ===============================
  // PDF VIEWER
  // ===============================
  function loadPDF() {

    if (!window.pdfjsLib) return;

    const url = "../../assets/docs/documentosinformativos/repositoriotcc.pdf";

    const canvas    = document.getElementById("pdf-canvas");
    if (!canvas) return;

    const ctx       = canvas.getContext("2d");
    const container = document.querySelector(".pdf-canvas-wrap");

    const btnPrev    = document.getElementById("btn-prev");
    const btnNext    = document.getElementById("btn-next");
    const btnZoomIn  = document.getElementById("btn-zoom-in");
    const btnZoomOut = document.getElementById("btn-zoom-out");

    const pgAtualEl   = document.getElementById("pg-atual");
    const pgTotalEl   = document.getElementById("pg-total");
    const zoomLevelEl = document.getElementById("zoom-level");

    let page       = 1;
    let pdfDoc     = null;
    let renderTask = null;

    // 🔥 SCALE GLOBAL
    function getInitialScale() {
      return window.innerWidth >= 1024 ? 0.5 : 1;
    }

    window.pdfScale = getInitialScale();

    function render(num) {

      if (!pdfDoc) return;

      pdfDoc.getPage(num).then(p => {

        const containerWidth = (container?.clientWidth || window.innerWidth) - 32;
        const baseWidth      = p.getViewport({ scale: 1 }).width;

        const scaleAuto  = containerWidth / baseWidth;
        const finalScale = scaleAuto * window.pdfScale;
        const dpr        = window.devicePixelRatio || 1;

        const viewport = p.getViewport({ scale: finalScale * dpr });

        if (renderTask) renderTask.cancel();

        canvas.width  = viewport.width;
        canvas.height = viewport.height;

        canvas.style.width  = (viewport.width / dpr) + "px";
        canvas.style.height = (viewport.height / dpr) + "px";

        renderTask = p.render({ canvasContext: ctx, viewport });

        window.currentPage = num;

        if (pgAtualEl) pgAtualEl.textContent = num;
        if (pgTotalEl) pgTotalEl.textContent = pdfDoc.numPages;
        if (zoomLevelEl) zoomLevelEl.textContent = Math.round(window.pdfScale * 100) + "%";

        if (btnPrev) btnPrev.disabled = num <= 1;
        if (btnNext) btnNext.disabled = num >= pdfDoc.numPages;
      });
    }

    // 🔥 EXPÕE GLOBAL
    window.renderPDFPage = render;

    pdfjsLib.getDocument(url).promise
      .then(pdf => {
        pdfDoc = pdf;
        render(page);
      });

    // BOTÕES
    btnPrev?.addEventListener("click", () => {
      if (page > 1) render(--page);
    });

    btnNext?.addEventListener("click", () => {
      if (pdfDoc && page < pdfDoc.numPages) render(++page);
    });

    btnZoomIn?.addEventListener("click", () => {
      window.pdfScale = Math.min(3, +(window.pdfScale + 0.2).toFixed(1));
      render(page);
    });

    btnZoomOut?.addEventListener("click", () => {
      window.pdfScale = Math.max(0.5, +(window.pdfScale - 0.2).toFixed(1));
      render(page);
    });

    // SWIPE MOBILE
    if (container) {
      let startX = 0, startY = 0;

      container.addEventListener("touchstart", e => {
        startX = e.changedTouches[0].screenX;
        startY = e.changedTouches[0].screenY;
      }, { passive: true });

      container.addEventListener("touchend", e => {
        const dx = e.changedTouches[0].screenX - startX;
        const dy = e.changedTouches[0].screenY - startY;

        if (Math.abs(dx) < 50 || Math.abs(dx) < Math.abs(dy)) return;

        if (dx < 0 && pdfDoc && page < pdfDoc.numPages) render(++page);
        else if (dx > 0 && page > 1) render(--page);
      }, { passive: true });
    }

    // RESIZE
    let resizeTimer;
    window.addEventListener("resize", () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        window.pdfScale = getInitialScale();
        render(page);
      }, 200);
    });
  }


  // ===============================
  // REVEAL
  // ===============================
  function initReveal() {

    const els = document.querySelectorAll(".reveal");
    if (!els.length) return;

    function check() {
      const h = window.innerHeight;
      els.forEach(el => {
        if (el.getBoundingClientRect().top < h - 100) {
          el.classList.add("active");
        }
      });
    }

    window.addEventListener("scroll", check, { passive: true });
    check();
  }


  // ===============================
  // INIT
  // ===============================
  initSidebar();
  loadIncludes();
  initModal();
  loadPDF();
  initReveal();

});