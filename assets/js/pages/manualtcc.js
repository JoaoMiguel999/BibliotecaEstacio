// ===============================
// SIDEBAR (MENU HAMBÚRGUER)
// ===============================
const menuToggle = document.getElementById("menuToggle");
const sidebar    = document.getElementById("sidebar");
const overlay    = document.getElementById("overlay");

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
// SUBMENU
// ===============================
const subToggles = document.querySelectorAll(".sub-toggle");

subToggles.forEach(btn => {
    btn.addEventListener("click", (e) => {
        e.stopPropagation();
        const parent = btn.closest(".has-sub");
        parent.classList.toggle("open");
    });
});


// ===============================
// MODAL (TELA CHEIA — IFRAME)
// ===============================
// O modal usa um <iframe> simples que carrega o PDF diretamente.
// Não precisa de renderPage — o browser/leitor nativo cuida do zoom.
const abrirModal  = document.getElementById("abrirModal");
const fecharModal = document.getElementById("fecharModal");
const modal       = document.getElementById("modalPDF");

if (abrirModal && modal && fecharModal) {
    abrirModal.addEventListener("click", () => {
        modal.classList.add("active");
        // Impede scroll da página enquanto o modal está aberto
        document.body.style.overflow = "hidden";
    });

    fecharModal.addEventListener("click", () => {
        modal.classList.remove("active");
        document.body.style.overflow = "";
    });

    // Fechar com tecla Escape
    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && modal.classList.contains("active")) {
            modal.classList.remove("active");
            document.body.style.overflow = "";
        }
    });
}


// ===============================
// PDF.JS CONFIG (visualizador inline)
// ===============================
if (typeof pdfjsLib !== "undefined") {

    const url = "../../assets/docs/manual-estacio.pdf";
    let pdfDoc      = null;
    let paginaAtual = 1;
    let renderTask  = null;

    const canvas    = document.getElementById("pdf-canvas");
    const ctx       = canvas ? canvas.getContext("2d") : null;
    const wrap      = document.querySelector(".pdf-canvas-wrap");

    const btnPrev   = document.getElementById("btn-prev");
    const btnNext   = document.getElementById("btn-next");
    const btnZoomIn = document.getElementById("btn-zoom-in");
    const btnZoomOut= document.getElementById("btn-zoom-out");

    const pgAtualEl = document.getElementById("pg-atual");
    const pgTotalEl = document.getElementById("pg-total");

    let zoomOffset  = 0;

    // ── Escala responsiva ──────────────────────────────────────────
    // FIX: usa window.innerWidth como fallback se clientWidth = 0
    // FIX: limita escala máxima a 1.5 para evitar zoom exagerado
    function calcEscala(page) {
        let containerWidth = wrap ? wrap.clientWidth : 0;
        if (containerWidth < 50) containerWidth = window.innerWidth;
        containerWidth -= 24;

        const pdfWidth = page.getViewport({ scale: 1 }).width;
        const base = containerWidth / pdfWidth;

        return Math.min(1.5, Math.max(0.4, base + zoomOffset));
    }

    // ── Renderizar página ──────────────────────────────────────────
    function renderPage(num) {
        if (!pdfDoc || !canvas || !ctx) return;

        pdfDoc.getPage(num).then(page => {
            const escala   = calcEscala(page);
            const dpr      = window.devicePixelRatio || 1;
            const viewport = page.getViewport({ scale: escala * dpr });

            // Cancela render anterior
            if (renderTask) renderTask.cancel();

            // Tamanho físico do canvas (pixels reais da tela)
            canvas.width  = viewport.width;
            canvas.height = viewport.height;

            // Tamanho visual (CSS — sem o fator DPR)
            canvas.style.width  = Math.floor(viewport.width  / dpr) + "px";
            canvas.style.height = Math.floor(viewport.height / dpr) + "px";

            renderTask = page.render({ canvasContext: ctx, viewport });

            renderTask.promise
                .then(() => { renderTask = null; })
                .catch(err => {
                    if (err?.name !== "RenderingCancelledException") {
                        console.error("Erro ao renderizar:", err);
                    }
                });

            if (pgAtualEl) pgAtualEl.textContent = num;
            if (btnPrev)   btnPrev.disabled  = num <= 1;
            if (btnNext)   btnNext.disabled  = num >= pdfDoc.numPages;
        });
    }

    // ── Carregar PDF ───────────────────────────────────────────────
    pdfjsLib.getDocument(url).promise.then(pdf => {
        pdfDoc = pdf;
        if (pgTotalEl) pgTotalEl.textContent = pdf.numPages;
        renderPage(paginaAtual);
    }).catch(err => {
        console.error("Erro ao carregar PDF:", err);
    });

    // ── Navegação ─────────────────────────────────────────────────
    btnPrev?.addEventListener("click", () => {
        if (paginaAtual <= 1) return;
        renderPage(--paginaAtual);
    });

    btnNext?.addEventListener("click", () => {
        if (!pdfDoc || paginaAtual >= pdfDoc.numPages) return;
        renderPage(++paginaAtual);
    });

    // ── Zoom ───────────────────────────────────────────────────────
    btnZoomIn?.addEventListener("click", () => {
        zoomOffset += 0.2;
        renderPage(paginaAtual);
    });

    btnZoomOut?.addEventListener("click", () => {
        zoomOffset -= 0.2;
        renderPage(paginaAtual);
    });

    // ── Swipe horizontal (mobile) ─────────────────────────────────
    function adicionarSwipe(elemento) {
        if (!elemento) return;
        let startX = 0, startY = 0;

        elemento.addEventListener("touchstart", e => {
            startX = e.changedTouches[0].screenX;
            startY = e.changedTouches[0].screenY;
        }, { passive: true });

        elemento.addEventListener("touchend", e => {
            const dx = e.changedTouches[0].screenX - startX;
            const dy = e.changedTouches[0].screenY - startY;
            if (Math.abs(dx) < 50 || Math.abs(dx) < Math.abs(dy)) return;

            if (dx < 0 && pdfDoc && paginaAtual < pdfDoc.numPages) {
                renderPage(++paginaAtual);
            } else if (dx > 0 && paginaAtual > 1) {
                renderPage(--paginaAtual);
            }
        }, { passive: true });
    }

    adicionarSwipe(wrap);

    // ── Re-renderiza ao redimensionar ─────────────────────────────
    let resizeTimer;
    window.addEventListener("resize", () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => renderPage(paginaAtual), 200);
    });

} else {
    console.error("pdfjsLib não foi carregado corretamente.");
}


// ===============================
// SCROLL REVEAL
// ===============================
const revealEls = document.querySelectorAll(".reveal");

if (revealEls.length) {
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
const imgs     = document.querySelectorAll(".carrossel-img");
const btnPrevC = document.querySelector(".carrossel .prev");
const btnNextC = document.querySelector(".carrossel .next");

if (imgs.length && btnPrevC && btnNextC) {
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