// ===============================
// SIDEBAR (CARREGAMENTO + INIT)
// ===============================
function initSidebar() {
    const menuToggle = document.getElementById("menuToggle");
    const sidebar    = document.getElementById("sidebar");
    const overlay    = document.getElementById("overlay");

    if (!menuToggle || !sidebar || !overlay) return;

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
// CARREGAR SIDEBAR
// ===============================
const sidebarContainer = document.getElementById("sidebar-container");

if (sidebarContainer) {
    fetch("../../components/sidebar.html")
        .then(res => res.text())
        .then(html => {
            sidebarContainer.innerHTML = html;
            initSidebar();
            initSubmenu();
        })
        .catch(err => console.error("Erro ao carregar sidebar:", err));
}

// ===============================
// SUBMENU
// ===============================
function initSubmenu() {
    const subToggles = document.querySelectorAll(".sub-toggle");

    subToggles.forEach(btn => {
        btn.addEventListener("click", (e) => {
            e.stopPropagation();
            const parent = btn.closest(".has-sub");
            parent?.classList.toggle("open");
        });
    });
}

// ===============================
// MODAL
// ===============================
function initModal() {
    const abrirModal  = document.getElementById("abrirModal");
    const fecharModal = document.getElementById("fecharModal");
    const modal       = document.getElementById("modalPDF");

    if (!abrirModal || !modal || !fecharModal) return;

    abrirModal.addEventListener("click", () => {
        modal.classList.add("active");
        document.body.style.overflow = "hidden";

        // 🔥 Modal abre em 100%
        if (window.setPDFScale) window.setPDFScale(1);
    });

    fecharModal.addEventListener("click", () => {
        modal.classList.remove("active");
        document.body.style.overflow = "";

        // 🔥 Volta ao padrão
        if (window.resetPDF) window.resetPDF();
    });

    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && modal.classList.contains("active")) {
            modal.classList.remove("active");
            document.body.style.overflow = "";
            if (window.resetPDF) window.resetPDF();
        }
    });
}

// ===============================
// PDF.JS (VERSÃO FINAL PROFISSIONAL)
// ===============================
function initPDF() {

    if (typeof pdfjsLib === "undefined") {
        console.error("pdfjsLib não carregado");
        return;
    }

    const url = "../../assets/docs/manual-estacio.pdf";

    let pdfDoc = null;
    let paginaAtual = 1;
    let renderTask = null;

    // 🔥 ESCALA INICIAL (separada do mínimo)
    let initialScale = window.innerWidth <= 768 ? 1 : 0.5;
    let scale = initialScale;

    const MIN_SCALE = 0.3;
    const MAX_SCALE = 3;

    const canvas = document.getElementById("pdf-canvas");
    const ctx    = canvas?.getContext("2d");
    const wrap   = document.querySelector(".pdf-canvas-wrap");

    const btnPrev    = document.querySelector("[data-prev]");
    const btnNext    = document.querySelector("[data-next]");
    const btnZoomIn  = document.querySelector("[data-zoom-in]");
    const btnZoomOut = document.querySelector("[data-zoom-out]");

    const pgAtualEl   = document.querySelector("[data-page-num]");
    const pgTotalEl   = document.querySelector("[data-page-count]");
    const zoomLevelEl = document.querySelector("[data-zoom-level]");

    if (!canvas || !ctx) return;

    function calcEscala(page) {
        let containerWidth = wrap?.clientWidth || window.innerWidth;

        if (containerWidth < 50) {
            containerWidth = window.innerWidth;
        }

        containerWidth -= 16;

        const pdfWidth = page.getViewport({ scale: 1 }).width;
        const baseScale = containerWidth / pdfWidth;

        return baseScale * scale;
    }

    function renderPage(num) {

        if (!pdfDoc) return;

        pdfDoc.getPage(num).then(page => {

            const escala   = calcEscala(page);
            const dpr      = window.devicePixelRatio || 1;
            const viewport = page.getViewport({ scale: escala * dpr });

            if (renderTask) renderTask.cancel();

            canvas.width  = viewport.width;
            canvas.height = viewport.height;

            canvas.style.width  = (viewport.width  / dpr) + "px";
            canvas.style.height = (viewport.height / dpr) + "px";

            renderTask = page.render({ canvasContext: ctx, viewport });

            renderTask.promise.catch(err => {
                if (err?.name !== "RenderingCancelledException") {
                    console.error(err);
                }
            });

            if (pgAtualEl)   pgAtualEl.textContent   = num;
            if (pgTotalEl)   pgTotalEl.textContent   = pdfDoc.numPages;
            if (zoomLevelEl) zoomLevelEl.textContent = Math.round(scale * 100) + "%";

            if (btnPrev) btnPrev.disabled = num <= 1;
            if (btnNext) btnNext.disabled = num >= pdfDoc.numPages;
        });
    }

    pdfjsLib.getDocument(url).promise.then(pdf => {
        pdfDoc = pdf;
        renderPage(paginaAtual);
    });

    // BOTÕES
    btnPrev?.addEventListener("click", () => {
        if (paginaAtual > 1) renderPage(--paginaAtual);
    });

    btnNext?.addEventListener("click", () => {
        if (paginaAtual < pdfDoc.numPages) renderPage(++paginaAtual);
    });

    btnZoomIn?.addEventListener("click", () => {
        scale = Math.min(scale + 0.2, MAX_SCALE);
        renderPage(paginaAtual);
    });

    btnZoomOut?.addEventListener("click", () => {
        scale = Math.max(scale - 0.2, MIN_SCALE);
        renderPage(paginaAtual);
    });

    // SWIPE MOBILE
    if (wrap) {
        let startX = 0, startY = 0;

        wrap.addEventListener("touchstart", e => {
            startX = e.changedTouches[0].screenX;
            startY = e.changedTouches[0].screenY;
        }, { passive: true });

        wrap.addEventListener("touchend", e => {
            const dx = e.changedTouches[0].screenX - startX;
            const dy = e.changedTouches[0].screenY - startY;

            if (Math.abs(dx) < 50 || Math.abs(dx) < Math.abs(dy)) return;

            if (dx < 0 && paginaAtual < pdfDoc.numPages) {
                renderPage(++paginaAtual);
            } else if (dx > 0 && paginaAtual > 1) {
                renderPage(--paginaAtual);
            }
        }, { passive: true });
    }

    // RESIZE
    let resizeTimer;
    window.addEventListener("resize", () => {
        clearTimeout(resizeTimer);

        resizeTimer = setTimeout(() => {
            if (!pdfDoc) return;

            initialScale = window.innerWidth <= 768 ? 1 : 0.5;
            scale = initialScale;

            renderPage(paginaAtual);
        }, 200);
    });

    // FUNÇÕES GLOBAIS
    window.resetPDF = () => {
        scale = initialScale;
        paginaAtual = 1;
        renderPage(paginaAtual);
    };

    window.setPDFScale = (value) => {
        scale = value;
        renderPage(paginaAtual);
    };
}

// ===============================
// SCROLL REVEAL
// ===============================
function initReveal() {
    const revealEls = document.querySelectorAll(".reveal");

    if (!revealEls.length) return;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add("visible");
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });

    revealEls.forEach(el => observer.observe(el));
}

// ===============================
// CARROSSEL
// ===============================
function initCarrossel() {
    const imgs     = document.querySelectorAll(".carrossel-img");
    const btnPrevC = document.querySelector(".carrossel .prev");
    const btnNextC = document.querySelector(".carrossel .next");

    if (!imgs.length || !btnPrevC || !btnNextC) return;

    let idx = 0;

    function showImg(n) {
        imgs.forEach(i => i.classList.remove("active"));
        imgs[n].classList.add("active");
    }

    btnPrevC.addEventListener("click", () => {
        idx = (idx - 1 + imgs.length) % imgs.length;
        showImg(idx);
    });

    btnNextC.addEventListener("click", () => {
        idx = (idx + 1) % imgs.length;
        showImg(idx);
    });
}

// ===============================
// INIT
// ===============================
document.addEventListener("DOMContentLoaded", () => {
    initModal();
    initPDF();
    initReveal();
    initCarrossel();
});