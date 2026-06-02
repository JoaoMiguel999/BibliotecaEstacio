// ===============================
// PDF VIEWER — GLOBAL RESPONSIVO v3.1
// Ajuste automático FULL FIT + HD Crisp Resolution
// ===============================

(function () {

  function init() {

    const canvas = document.getElementById("pdf-canvas");
    if (!canvas) return;

    const url = canvas.dataset.pdfUrl;

    if (!url) {
      console.error("PDFViewer: atributo data-pdf-url não encontrado.");
      return;
    }

    const ctx       = canvas.getContext("2d");
    const container = document.querySelector(".pdf-canvas-wrap");

    // ===============================
    // ELEMENTOS — VIEWER
    // ===============================
    const pageNumEl   = document.querySelector("[data-page-num]");
    const pageCountEl = document.querySelector("[data-page-count]");
    const zoomLevelEl = document.querySelector("[data-zoom-level]");
    const progressBar = document.getElementById("pdf-progress-bar");

    const btnPrev    = document.querySelector("[data-prev]");
    const btnNext    = document.querySelector("[data-next]");
    const btnZoomIn  = document.querySelector("[data-zoom-in]");
    const btnZoomOut = document.querySelector("[data-zoom-out]");

    // ===============================
    // ELEMENTOS — MODAL
    // ===============================
    const modal          = document.getElementById("modalPDF");
    const abrirModal     = document.getElementById("abrirModal");
    const fecharModal    = document.getElementById("fecharModal");

    const canvasModal    = document.getElementById("pdf-canvas-modal");
    const ctxModal       = canvasModal?.getContext("2d");
    const containerModal = document.querySelector(".pdf-canvas-wrap-modal");

    const pageNumElModal   = document.querySelector("[data-page-num-modal]");
    const pageCountElModal = document.querySelector("[data-page-count-modal]");
    const zoomLevelElModal = document.querySelector("[data-zoom-level-modal]");

    const btnPrevModal    = document.querySelector("[data-prev-modal]");
    const btnNextModal    = document.querySelector("[data-next-modal]");
    const btnZoomInModal  = document.querySelector("[data-zoom-in-modal]");
    const btnZoomOutModal = document.querySelector("[data-zoom-out-modal]");

    // ===============================
    // ESTADO
    // ===============================
    let pdfDoc = null;

    let renderTask      = null;
    let renderTaskModal = null;

    let pageNum      = 1;
    let pageNumModal = 1;

    let scale      = 1;
    let scaleModal = 1;

    // ===============================
    // SCROLL DA PÁGINA
    // Bloqueia o scroll do body quando o
    // ponteiro está sobre o viewer ou modal,
    // evitando que a página role por baixo.
    // ===============================

    function blockPageScroll(wrap) {
      if (!wrap) return;

      wrap.addEventListener("wheel", e => {
        const atTop    = wrap.scrollTop === 0;
        const atBottom = wrap.scrollTop + wrap.clientHeight >= wrap.scrollHeight - 1;

        // Deixa o evento chegar ao container só se
        // houver conteúdo para rolar nessa direção
        const scrollingUp   = e.deltaY < 0;
        const scrollingDown = e.deltaY > 0;

        if ((scrollingUp && atTop) || (scrollingDown && atBottom)) {
          e.preventDefault();
        }
      }, { passive: false });
    }

    // ===============================
    // OVERFLOW DINÂMICO
    // No scale = 1 (fit), overflow: hidden.
    // Com zoom manual, libera scroll interno.
    // ===============================

    function updateOverflow(wrap, currentScale) {
      if (!wrap) return;
      wrap.style.overflow = currentScale > 1 ? "auto" : "hidden";
    }

    // ===============================
    // UTILIDADES
    // ===============================

    function fadeInCanvas(cvs) {
      if (!cvs) return;

      cvs.style.transition = "none";
      cvs.style.opacity = "0";

      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          cvs.style.transition = "opacity .3s ease";
          cvs.style.opacity = "1";
        });
      });
    }

    function setLoading(isLoading, target = "viewer") {
      const wrap = target === "modal" ? containerModal : container;
      if (!wrap) return;
      wrap.classList.toggle("pdf-loading", isLoading);
    }

    // ===============================
    // CALCULAR SCALE AUTOMÁTICO
    // ===============================

    function calcFitScale(page, targetContainer, extraScale = 1) {

      const viewport = page.getViewport({ scale: 1 });

      const pad = 40; // desconta o padding do container (20px cada lado)
      const containerWidth  = targetContainer.clientWidth  - pad;
      const containerHeight = targetContainer.clientHeight - pad;

      const scaleX = containerWidth  / viewport.width;
      const scaleY = containerHeight / viewport.height;

      return Math.min(scaleX, scaleY) * extraScale;
    }

    // ===============================
    // RENDER — VIEWER
    // ===============================

    function renderPage(num) {

      if (!pdfDoc) return;

      setLoading(true, "viewer");

      pdfDoc.getPage(num).then(page => {

        const finalScale = calcFitScale(page, container, scale);
        const viewport   = page.getViewport({ scale: finalScale });
        
        // Multiplicador de densidade de pixels (Retina / Displays modernos)
        const outputScale = window.devicePixelRatio || 1;

        // Ajusta a resolução interna (tamanho real da imagem do canvas)
        canvas.width  = Math.floor(viewport.width * outputScale);
        canvas.height = Math.floor(viewport.height * outputScale);

        // Mantém o tamanho visual controlado via CSS
        canvas.style.width  = Math.floor(viewport.width) + "px";
        canvas.style.height = Math.floor(viewport.height) + "px";

        if (renderTask) renderTask.cancel();

        // Matriz de transformação para alta resolução
        const transform = outputScale !== 1 
          ? [outputScale, 0, 0, outputScale, 0, 0] 
          : null;

        renderTask = page.render({ 
          canvasContext: ctx, 
          viewport: viewport,
          transform: transform 
        });

        renderTask.promise
          .then(() => {
            setLoading(false, "viewer");
            fadeInCanvas(canvas);
          })
          .catch(e => {
            if (e?.name !== "RenderingCancelledException") {
              console.error(e);
              setLoading(false, "viewer");
            }
          });

        // UI
        if (pageNumEl)   pageNumEl.textContent   = num;
        if (pageCountEl) pageCountEl.textContent = pdfDoc.numPages;
        if (zoomLevelEl) zoomLevelEl.textContent = Math.round(scale * 100) + "%";

        // Barra de Progresso
        if (progressBar) {
          const porcentagem = (num / pdfDoc.numPages) * 100;
          progressBar.style.width = porcentagem + "%";
        }

        if (btnPrev) btnPrev.disabled = num <= 1;
        if (btnNext) btnNext.disabled = num >= pdfDoc.numPages;

        updateOverflow(container, scale);
      });
    }

    // ===============================
    // RENDER — MODAL
    // ===============================

    function renderModalPage(num) {

      if (!pdfDoc)                   return;
      if (!canvasModal || !ctxModal) return;

      setLoading(true, "modal");

      pdfDoc.getPage(num).then(page => {

        const finalScale = calcFitScale(page, containerModal, scaleModal);
        const viewport   = page.getViewport({ scale: finalScale });
        
        // Multiplicador de densidade de pixels para o modal
        const outputScale = window.devicePixelRatio || 1;

        // Ajusta resolução interna do modal
        canvasModal.width  = Math.floor(viewport.width * outputScale);
        canvasModal.height = Math.floor(viewport.height * outputScale);

        // Tamanho visual do CSS
        canvasModal.style.width  = Math.floor(viewport.width) + "px";
        canvasModal.style.height = Math.floor(viewport.height) + "px";

        if (renderTaskModal) renderTaskModal.cancel();

        // Matriz de transformação para o modal
        const transform = outputScale !== 1 
          ? [outputScale, 0, 0, outputScale, 0, 0] 
          : null;

        renderTaskModal = page.render({ 
          canvasContext: ctxModal, 
          viewport: viewport,
          transform: transform
        });

        renderTaskModal.promise
          .then(() => {
            setLoading(false, "modal");
            fadeInCanvas(canvasModal);
          })
          .catch(e => {
            if (e?.name !== "RenderingCancelledException") {
              console.error(e);
              setLoading(false, "modal");
            }
          });

        // UI
        if (pageNumElModal)   pageNumElModal.textContent   = num;
        if (pageCountElModal) pageCountElModal.textContent = pdfDoc.numPages;
        if (zoomLevelElModal) zoomLevelElModal.textContent = Math.round(scaleModal * 100) + "%";

        if (btnPrevModal) btnPrevModal.disabled = num <= 1;
        if (btnNextModal) btnNextModal.disabled = num >= pdfDoc.numPages;

        updateOverflow(containerModal, scaleModal);
      });
    }

    // ===============================
    // CARREGAR PDF
    // ===============================

    setLoading(true, "viewer");

    pdfjsLib
      .getDocument(url)
      .promise
      .then(pdf => {
        pdfDoc = pdf;
        if (pageCountEl) pageCountEl.textContent = pdf.numPages;
        renderPage(pageNum);
      })
      .catch(err => {
        console.error("PDFViewer: erro ao carregar →", err);
        setLoading(false, "viewer");
        if (container) {
          container.innerHTML = `
            <p class="pdf-error">
              Não foi possível carregar o documento.
            </p>
          `;
        }
      });

    // ===============================
    // BLOQUEIA SCROLL DA PÁGINA
    // ===============================

    blockPageScroll(container);
    blockPageScroll(containerModal);

    // ===============================
    // CONTROLES — VIEWER
    // ===============================

    btnPrev?.addEventListener("click", () => {
      if (pageNum > 1) renderPage(--pageNum);
    });

    btnNext?.addEventListener("click", () => {
      if (pdfDoc && pageNum < pdfDoc.numPages) renderPage(++pageNum);
    });

    btnZoomIn?.addEventListener("click", () => {
      scale = Math.min(3, parseFloat((scale + 0.2).toFixed(2)));
      renderPage(pageNum);
    });

    btnZoomOut?.addEventListener("click", () => {
      scale = Math.max(0.5, parseFloat((scale - 0.2).toFixed(2)));
      renderPage(pageNum);
    });

    // ===============================
    // CONTROLES — MODAL
    // ===============================

    btnPrevModal?.addEventListener("click", () => {
      if (pageNumModal > 1) renderModalPage(--pageNumModal);
    });

    btnNextModal?.addEventListener("click", () => {
      if (pdfDoc && pageNumModal < pdfDoc.numPages) renderModalPage(++pageNumModal);
    });

    btnZoomInModal?.addEventListener("click", () => {
      scaleModal = Math.min(3, parseFloat((scaleModal + 0.2).toFixed(2)));
      renderModalPage(pageNumModal);
    });

    btnZoomOutModal?.addEventListener("click", () => {
      scaleModal = Math.max(0.5, parseFloat((scaleModal - 0.2).toFixed(2)));
      renderModalPage(pageNumModal);
    });

    // ===============================
    // ABRIR MODAL
    // ===============================

    abrirModal?.addEventListener("click", () => {

      if (!modal || !canvasModal || !ctxModal) {
        console.warn("PDFViewer: elementos do modal não encontrados.");
        return;
      }

      pageNumModal = pageNum;
      scaleModal   = 1;

      modal.classList.add("active");
      document.body.style.overflow = "hidden";

      setTimeout(() => renderModalPage(pageNumModal), 300);
    });

    // ===============================
    // FECHAR MODAL
    // ===============================

    function fechar() {
      if (!modal) return;

      modal.classList.remove("active");
      document.body.style.overflow = "";

      if (renderTaskModal) {
        renderTaskModal.cancel();
        renderTaskModal = null;
      }
    }

    fecharModal?.addEventListener("click", fechar);

    modal?.addEventListener("click", e => {
      if (e.target === modal) fechar();
    });

    document.addEventListener("keydown", e => {
      if (e.key === "Escape" && modal?.classList.contains("active")) fechar();
    });

    // ===============================
    // SWIPE — VIEWER
    // ===============================

    let startX = 0;

    container?.addEventListener("touchstart", e => {
      startX = e.changedTouches[0].screenX;
    }, { passive: true });

    container?.addEventListener("touchend", e => {
      const dx = e.changedTouches[0].screenX - startX;
      if (Math.abs(dx) < 50) return;

      if (dx < 0 && pdfDoc && pageNum < pdfDoc.numPages) {
        renderPage(++pageNum);
      } else if (dx > 0 && pageNum > 1) {
        renderPage(--pageNum);
      }
    }, { passive: true });

    // ===============================
    // SWIPE — MODAL
    // ===============================

    let startXM = 0;

    containerModal?.addEventListener("touchstart", e => {
      startXM = e.changedTouches[0].screenX;
    }, { passive: true });

    containerModal?.addEventListener("touchend", e => {
      const dx = e.changedTouches[0].screenX - startXM;
      if (Math.abs(dx) < 50) return;

      if (dx < 0 && pdfDoc && pageNumModal < pdfDoc.numPages) {
        renderModalPage(++pageNumModal);
      } else if (dx > 0 && pageNumModal > 1) {
        renderModalPage(--pageNumModal);
      }
    }, { passive: true });

    // ===============================
    // RESIZE
    // ===============================

    let resizeTimer;

    window.addEventListener("resize", () => {
      clearTimeout(resizeTimer);

      resizeTimer = setTimeout(() => {
        if (!pdfDoc) return;
        renderPage(pageNum);
        if (modal?.classList.contains("active")) {
          renderModalPage(pageNumModal);
        }
      }, 200);
    });

  } // fim init()

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

})();