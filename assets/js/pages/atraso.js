// ===============================
// SIDEBAR (MENU HAMBÚRGUER)
// ===============================
const menuToggle = document.getElementById("menuToggle");
const sidebar = document.getElementById("sidebar");
const overlay = document.getElementById("overlay");

menuToggle.addEventListener("click", () => {
  sidebar.classList.toggle("active");
  overlay.classList.toggle("active");
});

overlay.addEventListener("click", () => {
  sidebar.classList.remove("active");
  overlay.classList.remove("active");
});

// ===============================
// SUBMENUS
// ===============================
const subToggles = document.querySelectorAll(".sub-toggle");

subToggles.forEach(toggle => {
  toggle.addEventListener("click", () => {
    const parent = toggle.closest(".has-sub");
    parent.classList.toggle("open");
  });
});

// ===============================
// PDF.JS CONFIG
// ===============================
const url = "../../assets/docs/documentosinformativos/pendência-de-livros.pdf";

let pdfDoc = null;
let pageNum = 1;
let scale = 1.2;
let canvas = document.getElementById("pdf-canvas");
let ctx = canvas.getContext("2d");

const pageNumSpan = document.getElementById("pageNum");
const pageCountSpan = document.getElementById("pageCount");
const zoomLevel = document.getElementById("zoomLevel");

// ===============================
// RENDERIZAR PÁGINA
// ===============================
function renderPage(num) {
  pdfDoc.getPage(num).then(page => {
    const viewport = page.getViewport({ scale: scale });
    canvas.height = viewport.height;
    canvas.width = viewport.width;

    const renderContext = {
      canvasContext: ctx,
      viewport: viewport
    };

    page.render(renderContext);

    pageNumSpan.textContent = num;
  });
}

// ===============================
// CARREGAR PDF
// ===============================
pdfjsLib.getDocument(url).promise.then(pdf => {
  pdfDoc = pdf;
  pageCountSpan.textContent = pdf.numPages;

  renderPage(pageNum);
});

// ===============================
// BOTÕES
// ===============================
document.getElementById("prevPage").addEventListener("click", () => {
  if (pageNum <= 1) return;
  pageNum--;
  renderPage(pageNum);
});

document.getElementById("nextPage").addEventListener("click", () => {
  if (pageNum >= pdfDoc.numPages) return;
  pageNum++;
  renderPage(pageNum);
});

document.getElementById("zoomIn").addEventListener("click", () => {
  scale += 0.2;
  updateZoom();
});

document.getElementById("zoomOut").addEventListener("click", () => {
  if (scale <= 0.6) return;
  scale -= 0.2;
  updateZoom();
});

function updateZoom() {
  zoomLevel.textContent = Math.round(scale * 100) + "%";
  renderPage(pageNum);
}