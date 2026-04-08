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
// MODAL (TELA CHEIA)
// ===============================
const abrirModal  = document.getElementById("abrirModal");
const fecharModal = document.getElementById("fecharModal");
const modal       = document.getElementById("modalPDF");

if (abrirModal && modal && fecharModal) {
    abrirModal.addEventListener("click", () => {
        modal.classList.add("active");
        // Re-renderiza no canvas do modal ao abrir
        if (typeof renderPage === "function") renderPage(paginaAtual, true);
    });

    fecharModal.addEventListener("click", () => {
        modal.classList.remove("active");
    });

    window.addEventListener("click", (e) => {
        if (e.target === modal) {
            modal.classList.remove("active");
        }
    });
}


// ===============================
// PDF.JS CONFIG
// ===============================
if (typeof pdfjsLib !== "undefined") {

    const url = "/assets/docs/manual-estacio.pdf";

    let pdfDoc      = null;
    let paginaAtual = 1;

    // Controla renders simultâneos por canvas (evita flickering)
    let renderTaskInline = null;
    let renderTaskModal  = null;

    // Canvas inline (visualização embutida)
    const canvasInline = document.getElementById("pdf-canvas");
    const ctxInline    = canvasInline ? canvasInline.getContext("2d") : null;
    const wrapInline   = document.querySelector(".pdf-canvas-wrap");

    // Canvas do modal (tela cheia)
    // FIX: o modal usa seu próprio canvas para evitar conflito de contexto
    const canvasModal  = document.getElementById("pdf-canvas-modal");
    const ctxModal     = canvasModal ? canvasModal.getContext("2d") : null;
    const wrapModal    = document.querySelector(".modal-content .pdf-canvas-wrap");

    const btnPrev    = document.getElementById("btn-prev");
    const btnNext    = document.getElementById("btn-next");
    const btnZoomIn  = document.getElementById("btn-zoom-in");
    const btnZoomOut = document.getElementById("btn-zoom-out");

    const pgAtualEl = document.getElementById("pg-atual");
    const pgTotalEl = document.getElementById("pg-total");

    let zoomOffset = 0;

    // ── Escala responsiva ──────────────────────────────────────────
    // Calcula escala para caber na largura disponível do container.
    // Quando o modal está aberto, usa o container do modal.
    function calcEscala(page, isModal) {
        const wrap = isModal ? wrapModal : wrapInline;
        const containerWidth = wrap ? wrap.clientWidth - 24 : window.innerWidth - 24;
        const pdfWidth = page.getViewport({ scale: 1 }).width;
        const base = containerWidth / pdfWidth;
        return Math.max(0.5, base + zoomOffset);
    }

    // ── Renderizar página ──────────────────────────────────────────
    // FIX: recebe flag "isModal" para saber em qual canvas renderizar.
    // FIX: aplica devicePixelRatio para telas retina (resolve o zoom/borrado).
    function renderPage(num, isModal) {
        if (!pdfDoc) return;

        const isModalOpen = isModal || (modal && modal.classList.contains("active"));
        const canvas = isModalOpen ? canvasModal : canvasInline;
        const ctx    = isModalOpen ? ctxModal    : ctxInline;

        if (!canvas || !ctx) return;

        pdfDoc.getPage(num).then(page => {
            const escala = calcEscala(page, isModalOpen);

            // FIX: multiplica pela densidade de pixels da tela para
            // evitar imagem borrada / com zoom errado em mobile
            const dpr      = window.devicePixelRatio || 1;
            const viewport = page.getViewport({ scale: escala * dpr });

            // Cancela render anterior se ainda estiver em andamento
            if (isModalOpen) {
                if (renderTaskModal) renderTaskModal.cancel();
            } else {
                if (renderTaskInline) renderTaskInline.cancel();
            }

            // FIX: canvas com tamanho real (em pixels físicos)
            canvas.width  = viewport.width;
            canvas.height = viewport.height;

            // FIX: CSS exibe no tamanho lógico (sem o fator DPR)
            // — isso que corrige o zoom aparente no mobile
            canvas.style.width  = Math.floor(viewport.width  / dpr) + "px";
            canvas.style.height = Math.floor(viewport.height / dpr) + "px";

            const task = page.render({ canvasContext: ctx, viewport });

            if (isModalOpen) {
                renderTaskModal = task;
            } else {
                renderTaskInline = task;
            }

            task.promise
                .then(() => {
                    if (isModalOpen) renderTaskModal = null;
                    else renderTaskInline = null;
                })
                .catch(err => {
                    if (err?.name !== "RenderingCancelledException") {
                        console.error("Erro ao renderizar:", err);
                    }
                });

            // Atualiza UI de paginação
            if (pgAtualEl) pgAtualEl.textContent = num;
            if (btnPrev) btnPrev.disabled = num <= 1;
            if (btnNext) btnNext.disabled = num >= pdfDoc.numPages;
        });
    }

    // ── Carregar PDF ───────────────────────────────────────────────
    pdfjsLib.getDocument(url).promise.then(pdf => {
        pdfDoc = pdf;
        if (pgTotalEl) pgTotalEl.textContent = pdf.numPages;
        renderPage(paginaAtual, false);
    }).catch(err => {
        console.error("Erro ao carregar PDF:", err);
    });

    // ── Navegação (botões) ─────────────────────────────────────────
    btnPrev?.addEventListener("click", () => {
        if (paginaAtual <= 1) return;
        paginaAtual--;
        const isModalOpen = modal && modal.classList.contains("active");
        renderPage(paginaAtual, isModalOpen);
    });

    btnNext?.addEventListener("click", () => {
        if (!pdfDoc || paginaAtual >= pdfDoc.numPages) return;
        paginaAtual++;
        const isModalOpen = modal && modal.classList.contains("active");
        renderPage(paginaAtual, isModalOpen);
    });

    // ── Zoom ───────────────────────────────────────────────────────
    btnZoomIn?.addEventListener("click", () => {
        zoomOffset += 0.2;
        const isModalOpen = modal && modal.classList.contains("active");
        renderPage(paginaAtual, isModalOpen);
    });

    btnZoomOut?.addEventListener("click", () => {
        zoomOffset -= 0.2;
        const isModalOpen = modal && modal.classList.contains("active");
        renderPage(paginaAtual, isModalOpen);
    });

    // ── Swipe horizontal para trocar página (mobile) ───────────────
    // FIX: detecta gesto de swipe no canvas wrap do modal e do inline.
    // Swipe para esquerda = próxima página / para direita = página anterior.
    function adicionarSwipe(elemento) {
        if (!elemento) return;

        let touchStartX = 0;
        let touchStartY = 0;

        elemento.addEventListener("touchstart", (e) => {
            touchStartX = e.changedTouches[0].screenX;
            touchStartY = e.changedTouches[0].screenY;
        }, { passive: true });

        elemento.addEventListener("touchend", (e) => {
            const deltaX = e.changedTouches[0].screenX - touchStartX;
            const deltaY = e.changedTouches[0].screenY - touchStartY;

            // Só considera swipe horizontal se o movimento X for dominante
            // e maior que 50px (evita ativação acidental ao rolar)
            if (Math.abs(deltaX) < 50) return;
            if (Math.abs(deltaX) < Math.abs(deltaY)) return;

            const isModalOpen = modal && modal.classList.contains("active");

            if (deltaX < 0) {
                // Swipe para esquerda → próxima página
                if (!pdfDoc || paginaAtual >= pdfDoc.numPages) return;
                paginaAtual++;
                renderPage(paginaAtual, isModalOpen);
            } else {
                // Swipe para direita → página anterior
                if (paginaAtual <= 1) return;
                paginaAtual--;
                renderPage(paginaAtual, isModalOpen);
            }
        }, { passive: true });
    }

    adicionarSwipe(wrapInline);
    adicionarSwipe(wrapModal);

    // ── Re-renderiza ao redimensionar (rotação de tela, resize) ───
    let resizeTimer;
    window.addEventListener("resize", () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            const isModalOpen = modal && modal.classList.contains("active");
            renderPage(paginaAtual, isModalOpen);
        }, 200);
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