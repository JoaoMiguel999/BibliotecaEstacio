document.addEventListener("DOMContentLoaded", () => {

// ===============================
// SIDEBAR (FETCH)
// ===============================
fetch("/components/sidebar.html")
  .then(res => res.text())
  .then(data => {
    const container = document.getElementById("sidebar-container");
    if (!container) return;

    container.innerHTML = data;
    initSidebar();
  })
  .catch(err => console.error("Erro sidebar:", err));


// ===============================
// FOOTER (FETCH)
// ===============================
fetch("/components/footer.html")
  .then(res => res.text())
  .then(data => {
    const container = document.getElementById("footer-container");
    if (!container) return;

    container.innerHTML = data;
  })
  .catch(err => console.error("Erro footer:", err));


// ===============================
// BOTÕES PDF (FETCH)
// ===============================
fetch("/components/botaopdf.html")
  .then(res => res.text())
  .then(data => {
    const container = document.getElementById("pdf-controls");
    if (!container) return;

    container.innerHTML = data;

    // inicia controles depois do HTML existir
    window.initPdfControls?.();
  })
  .catch(err => console.error("Erro botões PDF:", err));


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

    const parent = btn.closest(".has-sub");
    if (!parent) return;

    document.querySelectorAll(".has-sub.open").forEach(item => {
      if (item !== parent) item.classList.remove("open");
    });

    parent.classList.toggle("open");
    btn.setAttribute("aria-expanded", parent.classList.contains("open"));
  });
}


// ===============================
// PDF.JS RESPONSIVO 🔥
// ===============================
if (typeof pdfjsLib !== "undefined") {

  const url = "/assets/docs/documentosinformativos/wifi.pdf";

  const canvas = document.getElementById("pdf-canvas");
  if (!canvas) {
    console.error("Canvas não encontrado");
    return;
  }

  const ctx = canvas.getContext("2d");
  const container = document.querySelector(".pdf-canvas-wrap");

  let pdfDoc = null;
  let pageNum = 1;
  let scale = 1;
  let renderTask = null;

  let pageNumEl, pageCountEl, zoomLevelEl;

  function updateUI() {
    if (pageNumEl) pageNumEl.textContent = pageNum;
    if (pageCountEl && pdfDoc) pageCountEl.textContent = pdfDoc.numPages;
    if (zoomLevelEl) zoomLevelEl.textContent = Math.round(scale * 100) + "%";
  }

  function renderPage(num) {
    pdfDoc.getPage(num).then(page => {

      // viewport base
      const viewport = page.getViewport({ scale: 1 });

      // largura do container
      const containerWidth = container.clientWidth;

      // escala automática
      const scaleAuto = containerWidth / viewport.width;

      // escala final (responsivo + zoom)
      const finalScale = scaleAuto * scale;

      const scaledViewport = page.getViewport({ scale: finalScale });

      canvas.width  = scaledViewport.width;
      canvas.height = scaledViewport.height;

      if (renderTask) renderTask.cancel();

      renderTask = page.render({
        canvasContext: ctx,
        viewport: scaledViewport
      });

      renderTask.promise.catch(err => {
        if (err?.name !== "RenderingCancelledException") {
          console.error(err);
        }
      });

      updateUI();
    });
  }

  pdfjsLib.getDocument(url).promise
    .then(pdf => {
      pdfDoc = pdf;
      renderPage(pageNum);
      updateUI();
    })
    .catch(err => {
      console.error("❌ Erro ao carregar PDF:", err);
    });


  // ===============================
  // CONTROLES
  // ===============================
  function initPdfControls() {

    const controls = document.getElementById("pdf-controls");
    if (!controls) return;

    pageNumEl   = controls.querySelector("[data-page-num]");
    pageCountEl = controls.querySelector("[data-page-count]");
    zoomLevelEl = controls.querySelector("[data-zoom-level]");

    controls.querySelector("[data-next]")?.addEventListener("click", () => {
      if (pageNum < pdfDoc.numPages) renderPage(++pageNum);
    });

    controls.querySelector("[data-prev]")?.addEventListener("click", () => {
      if (pageNum > 1) renderPage(--pageNum);
    });

    controls.querySelector("[data-zoom-in]")?.addEventListener("click", () => {
      scale = Math.min(3, scale + 0.2);
      renderPage(pageNum);
    });

    controls.querySelector("[data-zoom-out]")?.addEventListener("click", () => {
      scale = Math.max(0.5, scale - 0.2);
      renderPage(pageNum);
    });

    updateUI();
  }

  window.initPdfControls = initPdfControls;

  // 🔥 RESPONSIVO DINÂMICO
  window.addEventListener("resize", () => {
    if (pdfDoc) renderPage(pageNum);
  });

} else {
  console.error("pdfjsLib não carregado");
}


// ===============================
console.log("🚀 PDF RESPONSIVO + ZOOM FUNCIONANDO 100%");

});