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

    const menuToggle   = e.target.closest("#menuToggle");
    const overlayClick = e.target.closest("#overlay");
    const subBtn       = e.target.closest(".sub-toggle");

    if (menuToggle) {
      const isActive = sidebar.classList.toggle("active");
      overlay.classList.toggle("active");
      document.body.style.overflow = isActive ? "hidden" : "";
    }

    if (overlayClick) {
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

      subBtn.setAttribute(
        "aria-expanded",
        parent.classList.contains("open")
      );
    }

  });
}


// ===============================
// INCLUDES
// ===============================
function loadIncludes() {

  const sidebarContainer = document.getElementById("sidebar-container");
  const footerContainer  = document.getElementById("footer-container");

  const promises = [];

  if (sidebarContainer) {
    promises.push(
      fetch("../../components/sidebar.html")
        .then(r => r.text())
        .then(html => sidebarContainer.innerHTML = html)
    );
  }

  if (footerContainer) {
    promises.push(
      fetch("../../components/footer.html")
        .then(r => r.text())
        .then(html => footerContainer.innerHTML = html)
    );
  }

  return Promise.all(promises);
}


// ===============================
// MODAL
// ===============================
function initModal() {

  const modal = document.getElementById("modalPDF");
  const open  = document.getElementById("abrirModal");
  const close = document.getElementById("fecharModal");

  if (!modal || !open || !close) return;

  open.onclick = () => {
    modal.classList.add("active");
    document.body.style.overflow = "hidden";
  };

  close.onclick = () => {
    modal.classList.remove("active");
    document.body.style.overflow = "";
  };

  modal.onclick = (e) => {
    if (e.target === modal) {
      modal.classList.remove("active");
      document.body.style.overflow = "";
    }
  };

  document.onkeydown = (e) => {
    if (e.key === "Escape" && modal.classList.contains("active")) {
      modal.classList.remove("active");
      document.body.style.overflow = "";
    }
  };
}


// ===============================
// PDF VIEWER (RESPONSIVO)
// ===============================
function loadPDF() {

  if (!window.pdfjsLib) return;

  const url = "../../assets/docs/documentosinformativos/wifi.pdf";

  const canvas = document.getElementById("pdf-canvas");
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

  let page = 1;
  let pdfDoc;

  // zoom inicial: 50% desktop / 80% mobile
  const isMobile = window.innerWidth <= 768;
  let scale = isMobile ? 0.8 : 0.5;

  function render(num) {

    pdfDoc.getPage(num).then(p => {

      const viewport       = p.getViewport({ scale: 1 });
      const containerWidth = container.clientWidth;
      const scaleAuto      = containerWidth / viewport.width;
      const finalScale     = scaleAuto * scale;
      const scaledViewport = p.getViewport({ scale: finalScale });

      canvas.width  = scaledViewport.width;
      canvas.height = scaledViewport.height;

      p.render({ canvasContext: ctx, viewport: scaledViewport });

      pgAtualEl   && (pgAtualEl.textContent   = num);
      pgTotalEl   && (pgTotalEl.textContent   = pdfDoc.numPages);
      zoomLevelEl && (zoomLevelEl.textContent = Math.round(scale * 100) + "%");

      btnPrev && (btnPrev.disabled = num <= 1);
      btnNext && (btnNext.disabled = num >= pdfDoc.numPages);
    });
  }

  pdfjsLib.getDocument(url).promise
    .then(pdf => {
      pdfDoc = pdf;
      render(page);
    })
    .catch(err => console.error("Erro ao carregar PDF:", err));

  // CONTROLES
  btnPrev?.addEventListener("click",    () => page > 1               && render(--page));
  btnNext?.addEventListener("click",    () => page < pdfDoc.numPages && render(++page));

  btnZoomIn?.addEventListener("click",  () => { scale = Math.min(3,   scale + 0.2); render(page); });
  btnZoomOut?.addEventListener("click", () => { scale = Math.max(0.3, scale - 0.2); render(page); });

  // RESPONSIVO DINÂMICO
  window.addEventListener("resize", () => { if (pdfDoc) render(page); });
}


// ===============================
// REVEAL SCROLL
// ===============================
function initReveal() {

  const reveals = document.querySelectorAll(".reveal");

  function revealOnScroll() {
    const windowHeight = window.innerHeight;
    reveals.forEach(el => {
      if (el.getBoundingClientRect().top < windowHeight - 100)
        el.classList.add("active");
    });
  }

  window.addEventListener("scroll", revealOnScroll);
  window.addEventListener("load",   revealOnScroll);
}


// ===============================
// INIT
// ===============================
initSidebar();

loadIncludes().then(() => {
  initModal();
  loadPDF();
  initReveal();
});

});