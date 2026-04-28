// ===============================
// INJECT COMPONENTS
// ===============================
function injectComponent(containerId, url, callback) {
  const container = document.getElementById(containerId);
  if (!container) return;

  fetch(url)
    .then(res => res.text())
    .then(html => {
      container.innerHTML = html;
      if (callback) callback();
    })
    .catch(err => console.warn(err));
}


// ===============================
// SIDEBAR
// ===============================
function initSidebar() {
  const sidebar = document.getElementById("sidebar");
  const toggle  = document.getElementById("menuToggle");
  const overlay = document.getElementById("overlay");

  if (!sidebar || !toggle || !overlay) return;

  const abrir = () => {
    sidebar.classList.add("active");
    overlay.classList.add("active");
    document.body.style.overflow = "hidden";
  };

  const fechar = () => {
    sidebar.classList.remove("active");
    overlay.classList.remove("active");
    document.body.style.overflow = "";
  };

  toggle.onclick = () => {
    sidebar.classList.contains("active") ? fechar() : abrir();
  };

  overlay.onclick = fechar;

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") fechar();
  });

  // SUBMENUS
  const subToggles = sidebar.querySelectorAll(".sub-toggle");

  subToggles.forEach(btn => {
    btn.onclick = (e) => {
      e.preventDefault();
      e.stopPropagation();

      const parent = btn.closest(".has-sub");
      if (!parent) return;

      const isOpen = parent.classList.contains("open");

      sidebar.querySelectorAll(".has-sub.open").forEach(item => {
        if (item !== parent) item.classList.remove("open");
      });

      parent.classList.toggle("open", !isOpen);
    };
  });
}


// ===============================
// MODAL
// ===============================
function initModal() {
  const modal    = document.getElementById("modalPDF");
  const openBtn  = document.getElementById("abrirModal");
  const closeBtn = document.getElementById("fecharModal");

  if (!modal || !openBtn || !closeBtn) return;

  openBtn.onclick = () => {
    modal.classList.add("active");
    document.body.style.overflow = "hidden";
  };

  closeBtn.onclick = () => {
    modal.classList.remove("active");
    document.body.style.overflow = "";
  };

  modal.onclick = (e) => {
    if (e.target === modal) {
      modal.classList.remove("active");
      document.body.style.overflow = "";
    }
  };

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      modal.classList.remove("active");
      document.body.style.overflow = "";
    }
  });
}


// ===============================
// PDF.JS
// ===============================
pdfjsLib.GlobalWorkerOptions.workerSrc =
  "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";

const PDF_URL =
  "../../../assets/docs/documentosinformativos/normas-biblioteca-2026.pdf";

let pdfDoc   = null;
let pageNum  = 1;
let scale    = 1.2;
let rendering = false;
let pending   = null;

const canvas = document.getElementById("pdf-canvas");
const ctx    = canvas?.getContext("2d");

const elPageNum   = document.querySelector("[data-page-num]");
const elPageCount = document.querySelector("[data-page-count]");
const elZoom      = document.querySelector("[data-zoom-level]");

const btnPrev = document.querySelector("[data-prev]");
const btnNext = document.querySelector("[data-next]");
const btnIn   = document.querySelector("[data-zoom-in]");
const btnOut  = document.querySelector("[data-zoom-out]");

function renderPage(num) {
  if (!pdfDoc) return;

  rendering = true;

  pdfDoc.getPage(num).then(page => {
    const viewport = page.getViewport({ scale });

    canvas.width  = viewport.width;
    canvas.height = viewport.height;

    const task = page.render({ canvasContext: ctx, viewport });

    task.promise.then(() => {
      rendering = false;
      if (pending !== null) {
        renderPage(pending);
        pending = null;
      }
    });

    if (elPageNum)   elPageNum.textContent   = num;
    if (elPageCount) elPageCount.textContent = pdfDoc.numPages;
    if (elZoom)      elZoom.textContent      = Math.round(scale * 100) + "%";

    if (btnPrev) btnPrev.disabled = num <= 1;
    if (btnNext) btnNext.disabled = num >= pdfDoc.numPages;
  });
}

function queue(num) {
  if (rendering) pending = num;
  else renderPage(num);
}

function loadPDF() {
  if (!window.pdfjsLib || !canvas) return;

  pdfjsLib.getDocument(PDF_URL).promise.then(pdf => {
    pdfDoc = pdf;
    if (elPageCount) elPageCount.textContent = pdf.numPages;
    renderPage(pageNum);
  });
}


// ===============================
// CONTROLES PDF
// ===============================
function initPDF() {
  btnNext?.addEventListener("click", () => {
    if (pdfDoc && pageNum < pdfDoc.numPages) {
      pageNum++;
      queue(pageNum);
    }
  });

  btnPrev?.addEventListener("click", () => {
    if (pageNum > 1) {
      pageNum--;
      queue(pageNum);
    }
  });

  btnIn?.addEventListener("click", () => {
    scale = Math.min(scale + 0.2, 3);
    queue(pageNum);
  });

  btnOut?.addEventListener("click", () => {
    scale = Math.max(scale - 0.2, 0.6);
    queue(pageNum);
  });

  loadPDF();
}


// ===============================
// EXECUÇÃO
// ===============================
injectComponent("sidebar-container", "../../../components/sidebar.html", () => {
  initSidebar();
});

injectComponent("footer-container", "../../../components/footer.html");

document.addEventListener("DOMContentLoaded", () => {
  initPDF();
  initModal();
});