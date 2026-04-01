// ===============================
// SIDEBAR (MENU HAMBÚRGUER)
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
const abrirModal = document.getElementById("abrirModal");
const fecharModal = document.getElementById("fecharModal");
const modal = document.getElementById("modalPDF");

if (abrirModal && modal && fecharModal) {
    abrirModal.addEventListener("click", () => {
        modal.classList.add("active");
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

    let pdfDoc = null;
    let paginaAtual = 1;
    let escala = 1.2;

    const canvas = document.getElementById("pdf-canvas");
    const ctx = canvas.getContext("2d");

    const btnPrev = document.getElementById("btn-prev");
    const btnNext = document.getElementById("btn-next");
    const btnZoomIn = document.getElementById("btn-zoom-in");
    const btnZoomOut = document.getElementById("btn-zoom-out");

    const pgAtualEl = document.getElementById("pg-atual");
    const pgTotalEl = document.getElementById("pg-total");

    // Carregar PDF
    pdfjsLib.getDocument(url).promise.then(pdf => {
        pdfDoc = pdf;
        pgTotalEl.textContent = pdf.numPages;

        renderPage(paginaAtual);
    }).catch(err => {
        console.error("Erro ao carregar PDF:", err);
    });

    // Renderizar página
    function renderPage(num) {
        pdfDoc.getPage(num).then(page => {

            const viewport = page.getViewport({ scale: escala });

            canvas.height = viewport.height;
            canvas.width = viewport.width;

            const renderContext = {
                canvasContext: ctx,
                viewport: viewport
            };

            page.render(renderContext);

            pgAtualEl.textContent = num;

            btnPrev.disabled = num <= 1;
            btnNext.disabled = num >= pdfDoc.numPages;
        });
    }

    // Navegação
    if (btnPrev) {
        btnPrev.addEventListener("click", () => {
            if (paginaAtual <= 1) return;
            paginaAtual--;
            renderPage(paginaAtual);
        });
    }

    if (btnNext) {
        btnNext.addEventListener("click", () => {
            if (paginaAtual >= pdfDoc.numPages) return;
            paginaAtual++;
            renderPage(paginaAtual);
        });
    }

    // Zoom
    if (btnZoomIn) {
        btnZoomIn.addEventListener("click", () => {
            escala += 0.2;
            renderPage(paginaAtual);
        });
    }

    if (btnZoomOut) {
        btnZoomOut.addEventListener("click", () => {
            if (escala <= 0.6) return;
            escala -= 0.2;
            renderPage(paginaAtual);
        });
    }

} else {
    console.error("pdfjsLib não foi carregado corretamente.");
}