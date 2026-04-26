// ===============================
// PDF VIEWER — GLOBAL
// A URL do PDF é lida do atributo data-pdf-url do canvas.
// Exemplo de uso no HTML:
//   <canvas id="pdf-canvas" data-pdf-url="../../assets/docs/meu-arquivo.pdf"></canvas>
// ===============================

let pdfDoc     = null;
let pageNum    = 1;
let scale      = 1;
let isRendering = false;

const canvas = document.getElementById("pdf-canvas");
const ctx    = canvas.getContext("2d");

// Lê a URL do atributo do canvas — sem hardcode
const url = canvas.dataset.pdfUrl;

if (!url) {
  console.error("PDF Viewer: atributo data-pdf-url não encontrado no canvas.");
}

// ===============================
// ELEMENTOS
// ===============================
const pageNumEl   = document.querySelector("[data-page-num]");
const pageCountEl = document.querySelector("[data-page-count]");
const zoomLevelEl = document.querySelector("[data-zoom-level]");

const btnPrev    = document.querySelector("[data-prev]");
const btnNext    = document.querySelector("[data-next]");
const btnZoomIn  = document.querySelector("[data-zoom-in]");
const btnZoomOut = document.querySelector("[data-zoom-out]");

// ===============================
// RENDERIZAR PÁGINA
// ===============================
function renderPage(num) {
  if (isRendering) return; // evita renderizações sobrepostas
  isRendering = true;

  pdfDoc.getPage(num).then(page => {
    const viewport = page.getViewport({ scale });

    canvas.height = viewport.height;
    canvas.width  = viewport.width;

    page.render({
      canvasContext: ctx,
      viewport: viewport
    }).promise.then(() => {
      isRendering = false;
    });

    // Atualiza UI
    if (pageNumEl)   pageNumEl.textContent   = num;
    if (zoomLevelEl) zoomLevelEl.textContent = Math.round(scale * 100) + "%";

    if (btnPrev) btnPrev.disabled = (num <= 1);
    if (btnNext) btnNext.disabled = (num >= pdfDoc.numPages);
  });
}

// ===============================
// CONTROLES
// ===============================
if (btnPrev) {
  btnPrev.addEventListener("click", () => {
    if (pageNum <= 1) return;
    pageNum--;
    renderPage(pageNum);
  });
}

if (btnNext) {
  btnNext.addEventListener("click", () => {
    if (pageNum >= pdfDoc.numPages) return;
    pageNum++;
    renderPage(pageNum);
  });
}

if (btnZoomIn) {
  btnZoomIn.addEventListener("click", () => {
    scale += 0.2;
    renderPage(pageNum);
  });
}

if (btnZoomOut) {
  btnZoomOut.addEventListener("click", () => {
    if (scale <= 0.4) return;
    scale -= 0.2;
    renderPage(pageNum);
  });
}

// ===============================
// CARREGAR PDF
// ===============================
if (url) {
  pdfjsLib.getDocument(url).promise.then(pdf => {
    pdfDoc = pdf;

    if (pageCountEl) pageCountEl.textContent = pdf.numPages;

    renderPage(pageNum);
  }).catch(err => {
    console.error("PDF Viewer: erro ao carregar o PDF →", err);
  });
}