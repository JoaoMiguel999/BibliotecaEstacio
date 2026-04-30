// ===============================
// PDF VIEWER — GLOBAL RESPONSIVO
// URL lida do atributo data-pdf-url do canvas.
// Exemplo:
//   <canvas id="pdf-canvas" data-pdf-url="../../assets/docs/arquivo.pdf"></canvas>
// ===============================

(function () {

  const canvas = document.getElementById("pdf-canvas");
  if (!canvas) return;

  const url = canvas.dataset.pdfUrl;
  if (!url) return console.error("PDFViewer: atributo data-pdf-url não encontrado.");

  const ctx       = canvas.getContext("2d");
  const container = document.querySelector(".pdf-canvas-wrap");

  // ===============================
  // ELEMENTOS — VIEWER
  // ===============================
  const pageNumEl   = document.querySelector("[data-page-num]");
  const pageCountEl = document.querySelector("[data-page-count]");
  const zoomLevelEl = document.querySelector("[data-zoom-level]");

  const btnPrev    = document.querySelector("[data-prev]");
  const btnNext    = document.querySelector("[data-next]");
  const btnZoomIn  = document.querySelector("[data-zoom-in]");
  const btnZoomOut = document.querySelector("[data-zoom-out]");

  // ===============================
  // ELEMENTOS — MODAL
  // ===============================
  const modal       = document.getElementById("modalPDF");
  const abrirModal  = document.getElementById("abrirModal");
  const fecharModal = document.getElementById("fecharModal");

  const canvasModal = document.getElementById("pdf-canvas-modal");
  const ctxModal    = canvasModal?.getContext("2d");
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
  let pdfDoc          = null;
  let pageNum         = 1;
  let renderTask      = null;
  let renderTaskModal = null;

  const isMobile = () => window.innerWidth <= 768;

  // scale relativo: multiplica pela escala automática do container
  let scale      = isMobile() ? 0.8 : 0.5;
  let scaleModal = 1;

  // ===============================
  // RENDER — VIEWER
  // ===============================
  function renderPage(num) {
    if (!pdfDoc) return;

    pdfDoc.getPage(num).then(page => {
      const baseViewport   = page.getViewport({ scale: 1 });
      const containerWidth = container?.clientWidth || window.innerWidth;
      const scaleAuto      = containerWidth / baseViewport.width;
      const finalScale     = scaleAuto * scale;
      const viewport       = page.getViewport({ scale: finalScale });

      canvas.width  = viewport.width;
      canvas.height = viewport.height;

      if (renderTask) renderTask.cancel();
      renderTask = page.render({ canvasContext: ctx, viewport });
      renderTask.promise.catch(e => {
        if (e?.name !== "RenderingCancelledException") console.error(e);
      });

      if (pageNumEl)   pageNumEl.textContent   = num;
      if (pageCountEl) pageCountEl.textContent = pdfDoc.numPages;
      if (zoomLevelEl) zoomLevelEl.textContent = Math.round(scale * 100) + "%";

      if (btnPrev) btnPrev.disabled = num <= 1;
      if (btnNext) btnNext.disabled = num >= pdfDoc.numPages;
    });
  }

  // ===============================
  // RENDER — MODAL
  // ===============================
  function renderModal(num) {
    if (!pdfDoc || !canvasModal || !ctxModal) return;

    pdfDoc.getPage(num).then(page => {
      const baseViewport   = page.getViewport({ scale: 1 });
      const containerWidth = containerModal?.clientWidth || window.innerWidth;
      const scaleAuto      = containerWidth / baseViewport.width;
      const finalScale     = scaleAuto * scaleModal;
      const viewport       = page.getViewport({ scale: finalScale });

      canvasModal.width  = viewport.width;
      canvasModal.height = viewport.height;

      if (renderTaskModal) renderTaskModal.cancel();
      renderTaskModal = page.render({ canvasContext: ctxModal, viewport });
      renderTaskModal.promise.catch(e => {
        if (e?.name !== "RenderingCancelledException") console.error(e);
      });

      if (pageNumElModal)   pageNumElModal.textContent   = num;
      if (pageCountElModal) pageCountElModal.textContent = pdfDoc.numPages;
      if (zoomLevelElModal) zoomLevelElModal.textContent = Math.round(scaleModal * 100) + "%";

      if (btnPrevModal) btnPrevModal.disabled = num <= 1;
      if (btnNextModal) btnNextModal.disabled = num >= pdfDoc.numPages;
    });
  }

  // ===============================
  // CARREGAR PDF
  // ===============================
  pdfjsLib.getDocument(url).promise
    .then(pdf => {
      pdfDoc = pdf;
      if (pageCountEl) pageCountEl.textContent = pdf.numPages;
      renderPage(pageNum);
    })
    .catch(err => console.error("PDFViewer: erro ao carregar →", err));

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
    scale = Math.min(3, scale + 0.2);
    renderPage(pageNum);
  });

  btnZoomOut?.addEventListener("click", () => {
    scale = Math.max(0.3, scale - 0.2);
    renderPage(pageNum);
  });

  // ===============================
  // CONTROLES — MODAL
  // ===============================
  btnPrevModal?.addEventListener("click", () => {
    if (pageNum > 1) renderModal(--pageNum);
  });

  btnNextModal?.addEventListener("click", () => {
    if (pdfDoc && pageNum < pdfDoc.numPages) renderModal(++pageNum);
  });

  btnZoomInModal?.addEventListener("click", () => {
    scaleModal = Math.min(3, scaleModal + 0.2);
    renderModal(pageNum);
  });

  btnZoomOutModal?.addEventListener("click", () => {
    scaleModal = Math.max(0.3, scaleModal - 0.2);
    renderModal(pageNum);
  });

  // ===============================
  // MODAL
  // ===============================
  abrirModal?.addEventListener("click", () => {
    if (!modal) return;
    scaleModal = 1;
    modal.classList.add("active");
    document.body.style.overflow = "hidden";
    // aguarda o modal estar visível para calcular largura correta
    requestAnimationFrame(() => renderModal(pageNum));
  });

  const fechar = () => {
    modal?.classList.remove("active");
    document.body.style.overflow = "";
  };

  fecharModal?.addEventListener("click", fechar);

  modal?.addEventListener("click", e => {
    if (e.target === modal) fechar();
  });

  document.addEventListener("keydown", e => {
    if (e.key === "Escape" && modal?.classList.contains("active")) fechar();
  });

  // ===============================
  // SWIPE MOBILE — VIEWER
  // ===============================
  let startX = 0, startY = 0;

  container?.addEventListener("touchstart", e => {
    startX = e.changedTouches[0].screenX;
    startY = e.changedTouches[0].screenY;
  }, { passive: true });

  container?.addEventListener("touchend", e => {
    const dx = e.changedTouches[0].screenX - startX;
    const dy = e.changedTouches[0].screenY - startY;
    if (Math.abs(dx) < 50 || Math.abs(dx) < Math.abs(dy)) return;
    if (dx < 0 && pdfDoc && pageNum < pdfDoc.numPages) renderPage(++pageNum);
    else if (dx > 0 && pageNum > 1)                    renderPage(--pageNum);
  }, { passive: true });

  // ===============================
  // RESIZE
  // ===============================
  let resizeTimer;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      if (!pdfDoc) return;
      scale = isMobile() ? 0.8 : 0.5;
      renderPage(pageNum);
      if (modal?.classList.contains("active")) renderModal(pageNum);
    }, 200);
  });

})();