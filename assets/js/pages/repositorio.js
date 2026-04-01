// ===============================
// ELEMENTOS
// ===============================
const sidebar = document.getElementById("sidebar");
const toggle = document.getElementById("menuToggle");
const overlay = document.getElementById("overlay");
const subToggles = document.querySelectorAll(".sub-toggle");

// MODAL PDF
const modal = document.getElementById("modalPDF");
const abrirModalBtn = document.getElementById("abrirModal");
const fecharModalBtn = document.getElementById("fecharModal");


// ===============================
// SUBMENUS (🔥 MAIS SUAVE)
// ===============================
subToggles.forEach(btn => {
  btn.setAttribute("aria-expanded", "false");

  btn.addEventListener("click", (e) => {
    e.stopPropagation();

    const parent = btn.closest(".has-sub");
    if (!parent) return;

    const isOpen = parent.classList.contains("open");

    // fecha outros com animação suave
    document.querySelectorAll(".has-sub.open").forEach(item => {
      if (item !== parent) {
        item.classList.remove("open");
        item.querySelector(".sub-toggle")?.setAttribute("aria-expanded", "false");
      }
    });

    // toggle atual
    parent.classList.toggle("open");
    btn.setAttribute("aria-expanded", String(!isOpen));
  });
});


// ===============================
// SIDEBAR MENU (🔥 UX MELHORADA)
// ===============================
if (toggle && sidebar && overlay) {

  const fecharSidebar = () => {
    sidebar.classList.remove("active");
    overlay.classList.remove("active");
    toggle.setAttribute("aria-expanded", "false");

    // fecha submenus
    document.querySelectorAll(".has-sub.open").forEach(item => {
      item.classList.remove("open");
      item.querySelector(".sub-toggle")?.setAttribute("aria-expanded", "false");
    });

    document.body.style.overflow = "";
  };

  const abrirSidebar = () => {
    sidebar.classList.add("active");
    overlay.classList.add("active");
    toggle.setAttribute("aria-expanded", "true");

    // trava scroll no mobile
    document.body.style.overflow = "hidden";
  };

  toggle.addEventListener("click", (e) => {
    e.stopPropagation();

    sidebar.classList.contains("active")
      ? fecharSidebar()
      : abrirSidebar();
  });

  // overlay fecha
  overlay.addEventListener("click", fecharSidebar);

  // clique fora
  document.addEventListener("click", (e) => {
    if (
      sidebar.classList.contains("active") &&
      !sidebar.contains(e.target) &&
      !toggle.contains(e.target)
    ) {
      fecharSidebar();
    }
  });

  // ESC fecha sidebar
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && sidebar.classList.contains("active")) {
      fecharSidebar();
    }
  });
}


// ===============================
// MODAL PDF (🔥 PROFISSIONAL)
// ===============================
if (modal && abrirModalBtn && fecharModalBtn) {

  let lastFocusedElement = null;

  const abrirModal = () => {
    lastFocusedElement = document.activeElement;

    modal.classList.add("active");
    document.body.style.overflow = "hidden";

    setTimeout(() => {
      fecharModalBtn.focus();
    }, 100);
  };

  const fecharModal = () => {
    modal.classList.remove("active");
    document.body.style.overflow = "";

    if (lastFocusedElement) {
      lastFocusedElement.focus();
    }
  };

  abrirModalBtn.addEventListener("click", abrirModal);
  fecharModalBtn.addEventListener("click", fecharModal);

  modal.addEventListener("click", (e) => {
    if (e.target === modal) {
      fecharModal();
    }
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && modal.classList.contains("active")) {
      fecharModal();
    }
  });
}


// ===============================
// PDF.JS VIEWER
// ===============================
const PDF_URL = '/assets/docs/repositorioTCC.pdf';

pdfjsLib.GlobalWorkerOptions.workerSrc =
  'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

let pdfDoc = null;
let paginaAtual = 1;
let zoom = 1.2;

const canvas  = document.getElementById('pdf-canvas');
const ctx     = canvas?.getContext('2d');

const btnPrev = document.getElementById('btn-prev');
const btnNext = document.getElementById('btn-next');
const btnZoomIn = document.getElementById('btn-zoom-in');
const btnZoomOut = document.getElementById('btn-zoom-out');

function renderPagina(num) {
  pdfDoc.getPage(num).then(page => {
    const viewport = page.getViewport({ scale: zoom });

    canvas.height = viewport.height;
    canvas.width  = viewport.width;

    page.render({
      canvasContext: ctx,
      viewport
    });

    document.getElementById('pg-atual').textContent = num;
    btnPrev.disabled = num <= 1;
    btnNext.disabled = num >= pdfDoc.numPages;
  });
}

if (window.pdfjsLib && canvas) {
  pdfjsLib.getDocument(PDF_URL).promise.then(pdf => {
    pdfDoc = pdf;

    document.getElementById('pg-total').textContent = pdf.numPages;

    btnPrev.disabled = false;
    btnNext.disabled = false;

    renderPagina(paginaAtual);
  });

  btnPrev?.addEventListener('click', () => {
    if (paginaAtual > 1) renderPagina(--paginaAtual);
  });

  btnNext?.addEventListener('click', () => {
    if (paginaAtual < pdfDoc.numPages) renderPagina(++paginaAtual);
  });

  btnZoomIn?.addEventListener('click', () => {
    zoom = Math.min(zoom + 0.2, 3);
    renderPagina(paginaAtual);
  });

  btnZoomOut?.addEventListener('click', () => {
    zoom = Math.max(zoom - 0.2, 0.6);
    renderPagina(paginaAtual);
  });
}