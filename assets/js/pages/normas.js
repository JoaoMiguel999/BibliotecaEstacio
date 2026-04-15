// ===============================
// SIDEBAR (MENU)
// ===============================
const menuToggle = document.getElementById("menuToggle");
const sidebar = document.getElementById("sidebar");
const overlay = document.getElementById("overlay");

if (menuToggle && sidebar && overlay) {
  menuToggle.addEventListener("click", () => {
    sidebar.classList.toggle("active");
    overlay.classList.toggle("active");
  });

  overlay.addEventListener("click", () => {
    sidebar.classList.remove("active");
    overlay.classList.remove("active");
  });
}

// ===============================
// SUBMENU (CORRIGIDO)
// ===============================
document.querySelectorAll(".sub-toggle").forEach(btn => {
  btn.addEventListener("click", (e) => {
    e.stopPropagation(); // evita conflito

    const parent = btn.closest(".has-sub");
    const submenu = parent.querySelector(".sub");

    // fecha outros abertos (opcional, estilo accordion)
    document.querySelectorAll(".has-sub").forEach(item => {
      if (item !== parent) {
        item.classList.remove("active");
      }
    });

    // toggle atual
    parent.classList.toggle("active");

    // animação suave
    if (submenu) {
      if (parent.classList.contains("active")) {
        submenu.style.maxHeight = submenu.scrollHeight + "px";
      } else {
        submenu.style.maxHeight = null;
      }
    }
  });
});

// ===============================
// PDF.JS CONFIG
// ===============================
pdfjsLib.GlobalWorkerOptions.workerSrc =
  "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";

// ===============================
// ELEMENTOS PDF
// ===============================
const url = "../../assets/docs/documentosinformativos/normas-biblioteca-2026.pdf";

const canvas = document.getElementById("pdf-canvas");
const ctx = canvas.getContext("2d");

const pageNumEl = document.getElementById("pageNum");
const pageCountEl = document.getElementById("pageCount");
const zoomLevelEl = document.getElementById("zoomLevel");

const prevBtn = document.getElementById("prevPage");
const nextBtn = document.getElementById("nextPage");
const zoomInBtn = document.getElementById("zoomIn");
const zoomOutBtn = document.getElementById("zoomOut");

// ===============================
// ESTADO
// ===============================
let pdfDoc = null;
let pageNum = 1;
let scale = 1.2;
let isRendering = false;
let pendingPage = null;

// ===============================
// RENDERIZAR PÁGINA
// ===============================
function renderPage(num) {
  isRendering = true;

  pdfDoc.getPage(num).then(page => {
    const viewport = page.getViewport({ scale });

    canvas.height = viewport.height;
    canvas.width = viewport.width;

    const renderContext = {
      canvasContext: ctx,
      viewport: viewport
    };

    page.render(renderContext).promise.then(() => {
      isRendering = false;

      if (pendingPage !== null) {
        renderPage(pendingPage);
        pendingPage = null;
      }
    });

    // Atualiza UI
    pageNumEl.textContent = num;
    zoomLevelEl.textContent = Math.round(scale * 100) + "%";
  });
}

// ===============================
// FILA DE RENDER
// ===============================
function queueRenderPage(num) {
  if (isRendering) {
    pendingPage = num;
  } else {
    renderPage(num);
  }
}

// ===============================
// NAVEGAÇÃO
// ===============================
function prevPage() {
  if (pageNum <= 1) return;
  pageNum--;
  queueRenderPage(pageNum);
}

function nextPage() {
  if (pageNum >= pdfDoc.numPages) return;
  pageNum++;
  queueRenderPage(pageNum);
}

// ===============================
// ZOOM
// ===============================
function zoomIn() {
  scale += 0.2;
  queueRenderPage(pageNum);
}

function zoomOut() {
  if (scale <= 0.6) return;
  scale -= 0.2;
  queueRenderPage(pageNum);
}

// ===============================
// EVENTOS
// ===============================
if (prevBtn) prevBtn.addEventListener("click", prevPage);
if (nextBtn) nextBtn.addEventListener("click", nextPage);
if (zoomInBtn) zoomInBtn.addEventListener("click", zoomIn);
if (zoomOutBtn) zoomOutBtn.addEventListener("click", zoomOut);

// ===============================
// CARREGAR PDF
// ===============================
pdfjsLib.getDocument(url).promise.then(pdfDoc_ => {
  pdfDoc = pdfDoc_;
  pageCountEl.textContent = pdfDoc.numPages;

  renderPage(pageNum);
}).catch(err => {
  console.error("Erro ao carregar PDF:", err);
});