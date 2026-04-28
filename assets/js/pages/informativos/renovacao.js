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

    const menuToggle = e.target.closest("#menuToggle");
    const overlayHit = e.target.closest("#overlay");
    const subBtn = e.target.closest(".sub-toggle");

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
      subBtn.setAttribute(
        "aria-expanded",
        parent.classList.contains("open")
      );
    }
  });
}


// ===============================
// INCLUDES (SIDEBAR + FOOTER)
// ===============================
function loadIncludes() {

  const sidebarContainer = document.getElementById("sidebar-container");
  const footerContainer = document.getElementById("footer-container");

  const promises = [];

  if (sidebarContainer) {
    promises.push(
      fetch("../../../components/sidebar.html")
        .then(r => {
          if (!r.ok) throw new Error("sidebar 404");
          return r.text();
        })
        .then(html => {
          sidebarContainer.innerHTML = html;
        })
        .catch(err =>
          console.warn("⚠️ Sidebar não carregado:", err.message)
        )
    );
  }

  if (footerContainer) {
    promises.push(
      fetch("../../../components/footer.html")
        .then(r => {
          if (!r.ok) throw new Error("footer 404");
          return r.text();
        })
        .then(html => {
          footerContainer.innerHTML = html;
        })
        .catch(err =>
          console.warn("⚠️ Footer não carregado:", err.message)
        )
    );
  }

  return Promise.allSettled(promises);
}


// ===============================
// MODAL
// ===============================
function initModal() {

  const modal = document.getElementById("modalPDF");
  const open = document.getElementById("abrirModal");
  const close = document.getElementById("fecharModal");

  if (!modal || !open || !close) return;

  open.addEventListener("click", () => {
    modal.classList.add("active");
    document.body.style.overflow = "hidden";
  });

  close.addEventListener("click", () => {
    modal.classList.remove("active");
    document.body.style.overflow = "";
  });

  modal.addEventListener("click", (e) => {
    if (e.target === modal) {
      modal.classList.remove("active");
      document.body.style.overflow = "";
    }
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && modal.classList.contains("active")) {
      modal.classList.remove("active");
      document.body.style.overflow = "";
    }
  });
}


// ===============================
// PDF VIEWER
// ===============================
function loadPDF() {

  if (!window.pdfjsLib) {
    console.warn("⚠️ pdfjsLib não carregado");
    return;
  }

  // ✅ CAMINHO CORRETO
  const url =
    "../../../assets/docs/documentosinformativos/renovacao.pdf";

  const canvas = document.getElementById("pdf-canvas");

  if (!canvas) {
    console.warn("⚠️ Canvas não encontrado");
    return;
  }

  const ctx = canvas.getContext("2d");
  const container = document.querySelector(".pdf-canvas-wrap");

  // BOTÕES
  const btnPrev = document.querySelector("[data-prev]");
  const btnNext = document.querySelector("[data-next]");
  const btnZoomIn = document.querySelector("[data-zoom-in]");
  const btnZoomOut = document.querySelector("[data-zoom-out]");

  // INFO
  const pgAtualEl = document.querySelector("[data-page-num]");
  const pgTotalEl = document.querySelector("[data-page-count]");
  const zoomLevelEl = document.querySelector("[data-zoom-level]");

  let page = 1;
  let zoomFactor = 1;
  let pdfDoc = null;
  let renderTask = null;

  const ZOOM_STEP = 0.15;
  const ZOOM_MIN = 0.3;
  const ZOOM_MAX = 3;


  function getContainerWidth() {
    if (!container) return window.innerWidth - 32;
    return container.clientWidth - 32;
  }


  function calcInitialZoom() {

    const w = window.innerWidth;

    zoomFactor =
      w <= 480
        ? 0.92
        : w <= 768
        ? 0.85
        : 0.78;
  }


  function updateButtons(num) {

    if (btnPrev)
      btnPrev.disabled = num <= 1;

    if (btnNext)
      btnNext.disabled =
        !pdfDoc || num >= pdfDoc.numPages;

    if (btnZoomIn)
      btnZoomIn.disabled =
        zoomFactor >= ZOOM_MAX;

    if (btnZoomOut)
      btnZoomOut.disabled =
        zoomFactor <= ZOOM_MIN;
  }


  function render(num) {

    if (!pdfDoc) return;

    pdfDoc.getPage(num).then(p => {

      const viewport = p.getViewport({ scale: 1 });

      const containerWidth = getContainerWidth();

      const dpr = window.devicePixelRatio || 1;

      const fitScale =
        containerWidth / viewport.width;

      const finalScale =
        fitScale * zoomFactor;

      const scaledViewport =
        p.getViewport({
          scale: finalScale * dpr
        });

      if (renderTask) {
        renderTask.cancel();
      }

      canvas.width = scaledViewport.width;
      canvas.height = scaledViewport.height;

      canvas.style.width =
        scaledViewport.width / dpr + "px";

      canvas.style.height =
        scaledViewport.height / dpr + "px";

      renderTask = p.render({
        canvasContext: ctx,
        viewport: scaledViewport
      });

      renderTask.promise.catch(err => {

        if (
          err?.name !==
          "RenderingCancelledException"
        ) {
          console.error(
            "Erro ao renderizar página:",
            err
          );
        }
      });

      if (pgAtualEl)
        pgAtualEl.textContent = num;

      if (pgTotalEl)
        pgTotalEl.textContent =
          pdfDoc.numPages;

      if (zoomLevelEl)
        zoomLevelEl.textContent =
          Math.round(zoomFactor * 100) + "%";

      updateButtons(num);
    });
  }


  // ===============================
  // CARREGAR PDF
  // ===============================
  pdfjsLib.getDocument(url).promise
    .then(pdf => {

      pdfDoc = pdf;

      calcInitialZoom();

      render(page);
    })
    .catch(err => {
      console.error(
        "❌ Erro ao carregar PDF:",
        err
      );
    });


  // ===============================
  // NAVEGAÇÃO
  // ===============================
  btnPrev?.addEventListener("click", () => {
    if (page > 1) {
      page--;
      render(page);
    }
  });

  btnNext?.addEventListener("click", () => {
    if (pdfDoc && page < pdfDoc.numPages) {
      page++;
      render(page);
    }
  });


  // ===============================
  // ZOOM
  // ===============================
  btnZoomIn?.addEventListener("click", () => {

    if (zoomFactor >= ZOOM_MAX) return;

    zoomFactor = Math.min(
      ZOOM_MAX,
      +(zoomFactor + ZOOM_STEP).toFixed(2)
    );

    render(page);
  });

  btnZoomOut?.addEventListener("click", () => {

    if (zoomFactor <= ZOOM_MIN) return;

    zoomFactor = Math.max(
      ZOOM_MIN,
      +(zoomFactor - ZOOM_STEP).toFixed(2)
    );

    render(page);
  });


  // ===============================
  // CTRL + SCROLL
  // ===============================
  container?.addEventListener(
    "wheel",
    (e) => {

      if (!e.ctrlKey && !e.metaKey) return;

      e.preventDefault();

      zoomFactor =
        e.deltaY < 0
          ? Math.min(
              ZOOM_MAX,
              +(zoomFactor + ZOOM_STEP).toFixed(2)
            )
          : Math.max(
              ZOOM_MIN,
              +(zoomFactor - ZOOM_STEP).toFixed(2)
            );

      render(page);
    },
    { passive: false }
  );


  // ===============================
  // SWIPE MOBILE
  // ===============================
  if (container) {

    let startX = 0;
    let startY = 0;

    container.addEventListener(
      "touchstart",
      e => {

        startX =
          e.changedTouches[0].screenX;

        startY =
          e.changedTouches[0].screenY;
      },
      { passive: true }
    );

    container.addEventListener(
      "touchend",
      e => {

        const dx =
          e.changedTouches[0].screenX - startX;

        const dy =
          e.changedTouches[0].screenY - startY;

        if (
          Math.abs(dx) < 50 ||
          Math.abs(dx) < Math.abs(dy)
        ) return;

        if (
          dx < 0 &&
          pdfDoc &&
          page < pdfDoc.numPages
        ) {
          page++;
          render(page);
        }

        else if (
          dx > 0 &&
          page > 1
        ) {
          page--;
          render(page);
        }
      },
      { passive: true }
    );
  }


  // ===============================
  // RESIZE
  // ===============================
  let resizeTimer;

  window.addEventListener("resize", () => {

    clearTimeout(resizeTimer);

    resizeTimer = setTimeout(() => {

      if (!pdfDoc) return;

      calcInitialZoom();

      render(page);

    }, 200);
  });
}


// ===============================
// REVEAL
// ===============================
function initReveal() {

  const reveals =
    document.querySelectorAll(".reveal");

  if (!reveals.length) return;

  function check() {

    const wh = window.innerHeight;

    reveals.forEach(el => {

      if (
        el.getBoundingClientRect().top <
        wh - 100
      ) {
        el.classList.add("active");
      }
    });
  }

  window.addEventListener(
    "scroll",
    check,
    { passive: true }
  );

  check();
}


// ===============================
// INIT
// ===============================
initSidebar();
initModal();
loadPDF();
initReveal();
loadIncludes();

});