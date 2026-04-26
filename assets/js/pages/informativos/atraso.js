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

      if (!sidebar || !overlay) return;

      const menuToggle = e.target.closest("#menuToggle");
      const overlayHit = e.target.closest("#overlay");
      const subBtn     = e.target.closest(".sub-toggle");

      if (menuToggle) {
        const isActive = sidebar.classList.toggle("active");
        overlay.classList.toggle("active");
        document.body.style.overflow = isActive ? "hidden" : "";
      }

      if (overlayHit) {
        sidebar.classList.remove("active");
        overlay.classList.remove("active");
        document.body.style.overflow = "";
      }

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
  // INCLUDES (SIDEBAR + FOOTER)
  // Página em: html/pages/informativos/
  // Componentes em: html/components/
  // ===============================
  function loadIncludes() {

    const pairs = [
      { id: "sidebar-container", path: "../../../components/sidebar.html" },
      { id: "footer-container",  path: "../../../components/footer.html"  }
    ];

    pairs.forEach(({ id, path }) => {
      const el = document.getElementById(id);
      if (!el) return;

      fetch(path)
        .then(r => {
          if (!r.ok) throw new Error(`${path} → ${r.status}`);
          return r.text();
        })
        .then(html => { el.innerHTML = html; })
        .catch(err => console.warn("⚠️ Include não carregado:", err.message));
    });
  }


  // ===============================
  // MODAL
  // ===============================
  function initModal(callbacks) {

    const modal = document.getElementById("modalPDF");
    const open  = document.getElementById("abrirModal");
    const close = document.getElementById("fecharModal");

    if (!modal || !open || !close) return;

    open.addEventListener("click", () => {
      modal.classList.add("active");
      document.body.style.overflow = "hidden";
      callbacks?.onOpen?.();
    });

    const closeModal = () => {
      modal.classList.remove("active");
      document.body.style.overflow = "";
      callbacks?.onClose?.();
    };

    close.addEventListener("click", closeModal);

    // Fechar clicando no fundo (fora de .modal-content)
    modal.addEventListener("click", (e) => {
      if (e.target === modal) closeModal();
    });

    // Fechar com Escape
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && modal.classList.contains("active")) closeModal();
    });
  }


  // ===============================
  // PDF ENGINE
  // CORRIGIDO:
  // - scaleAuto responsivo (adapta ao container)
  // - canvas modal só renderiza quando modal está aberto
  // - renderTask.cancel() evita renders sobrepostos
  // - disabled nos botões de navegação
  // ===============================
  function initPDF() {

    if (typeof pdfjsLib === "undefined") {
      console.warn("⚠️ PDF.js não carregado");
      return;
    }

    const url = "../../../assets/docs/documentosinformativos/pendencia-de-livros.pdf";

    const canvas      = document.getElementById("pdf-canvas");
    const canvasModal = document.getElementById("pdf-canvas-modal");

    if (!canvas) return;

    const ctx      = canvas.getContext("2d");
    const ctxModal = canvasModal?.getContext("2d");

    const container      = document.querySelector(".pdf-canvas-wrap");
    const containerModal = document.querySelector(".modal-canvas-wrap");

    const pageNumEl   = document.querySelector("[data-page-num]");
    const pageCountEl = document.querySelector("[data-page-count]");
    const zoomLevelEl = document.querySelector("[data-zoom-level]");

    const btnPrev    = document.querySelector("[data-prev]");
    const btnNext    = document.querySelector("[data-next]");
    const btnZoomIn  = document.querySelector("[data-zoom-in]");
    const btnZoomOut = document.querySelector("[data-zoom-out]");

    let pdfDoc      = null;
    let pageNum     = 1;
    let scale       = 1.0;
    let isModalOpen = false;
    let renderTask  = null;

    // ----------------------------
    // Calcula escala responsiva
    // ----------------------------
    function calcScale(page, wrap) {
      const containerWidth = (wrap?.clientWidth || window.innerWidth) - 40;
      const baseWidth      = page.getViewport({ scale: 1 }).width;
      return (containerWidth / baseWidth) * scale;
    }

    // ----------------------------
    // Renderiza num canvas
    // ----------------------------
    function renderToCanvas(page, targetCanvas, targetCtx, wrap) {

      const finalScale     = calcScale(page, wrap);
      const dpr            = window.devicePixelRatio || 1;
      const scaledViewport = page.getViewport({ scale: finalScale * dpr });

      targetCanvas.width  = scaledViewport.width;
      targetCanvas.height = scaledViewport.height;

      targetCanvas.style.width  = (scaledViewport.width  / dpr) + "px";
      targetCanvas.style.height = (scaledViewport.height / dpr) + "px";

      return page.render({ canvasContext: targetCtx, viewport: scaledViewport });
    }

    // ----------------------------
    // Renderiza página principal
    // ----------------------------
    function renderPage(num) {

      if (!pdfDoc) return;

      pdfDoc.getPage(num).then(page => {

        // Cancela render anterior
        if (renderTask) renderTask.cancel();

        // Canvas principal
        renderTask = renderToCanvas(page, canvas, ctx, container);

        renderTask.promise.catch(err => {
          if (err?.name !== "RenderingCancelledException") {
            console.error("Erro ao renderizar:", err);
          }
        });

        // Canvas modal (só se modal estiver aberto)
        if (isModalOpen && canvasModal && ctxModal) {
          renderToCanvas(page, canvasModal, ctxModal, containerModal);
        }

        // Atualiza UI
        if (pageNumEl)   pageNumEl.textContent   = num;
        if (pageCountEl) pageCountEl.textContent = pdfDoc.numPages;
        if (zoomLevelEl) zoomLevelEl.textContent = Math.round(scale * 100) + "%";

        if (btnPrev) btnPrev.disabled = num <= 1;
        if (btnNext) btnNext.disabled = num >= pdfDoc.numPages;
      });
    }

    // ----------------------------
    // Carrega o PDF
    // ----------------------------
    pdfjsLib.getDocument(url).promise
      .then(pdf => {
        pdfDoc = pdf;
        renderPage(pageNum);
      })
      .catch(err => console.error("❌ Erro ao carregar PDF:", err));

    // ----------------------------
    // Navegação e zoom
    // ----------------------------
    document.addEventListener("click", (e) => {
      if (!pdfDoc) return;

      if (e.target.closest("[data-next]") && pageNum < pdfDoc.numPages) {
        renderPage(++pageNum);
      }

      if (e.target.closest("[data-prev]") && pageNum > 1) {
        renderPage(--pageNum);
      }

      if (e.target.closest("[data-zoom-in]")) {
        scale = Math.min(3, +(scale + 0.2).toFixed(1));
        renderPage(pageNum);
      }

      if (e.target.closest("[data-zoom-out]")) {
        scale = Math.max(0.5, +(scale - 0.2).toFixed(1));
        renderPage(pageNum);
      }
    });

    // ----------------------------
    // Swipe mobile
    // ----------------------------
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

        if (dx < 0 && pdfDoc && pageNum < pdfDoc.numPages) renderPage(++pageNum);
        else if (dx > 0 && pageNum > 1) renderPage(--pageNum);
      }, { passive: true });
    }

    // ----------------------------
    // Responsivo dinâmico
    // ----------------------------
    let resizeTimer;
    window.addEventListener("resize", () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        if (pdfDoc) renderPage(pageNum);
      }, 200);
    });

    // ----------------------------
    // Retorna callbacks do modal
    // ----------------------------
    return {
      onOpen: () => {
        isModalOpen = true;
        if (pdfDoc) renderPage(pageNum);
      },
      onClose: () => {
        isModalOpen = false;
      }
    };
  }


  // ===============================
  // INIT
  // ===============================
  initSidebar();
  loadIncludes();

  const pdfCallbacks = initPDF();
  initModal(pdfCallbacks);

});