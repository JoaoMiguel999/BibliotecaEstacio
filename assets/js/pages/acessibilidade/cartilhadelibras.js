// ===============================
// INIT GERAL
// ===============================
document.addEventListener("DOMContentLoaded", () => {
    loadSidebar();
    loadFooter();

    initMenuToggle();
    initModal();
    initPDF();
    initReveal();
});


// ===============================
// SIDEBAR
// ===============================
function loadSidebar() {
    const container = document.getElementById("sidebar-container");
    if (!container) return;

    fetch("/components/sidebar.html")
        .then(res => {
            if (!res.ok) throw new Error("Sidebar não encontrada");
            return res.text();
        })
        .then(html => {
            container.innerHTML = html;
            initSidebar();
            initSubmenu();
        })
        .catch(err => console.error("Erro sidebar:", err));
}

function initSidebar() {
    const sidebar = document.querySelector(".sidebar");
    const overlay = document.getElementById("overlay");
    const menuToggle = document.getElementById("menuToggle");

    if (!sidebar || !overlay || !menuToggle) return;

    menuToggle.addEventListener("click", () => {
        sidebar.classList.toggle("active");
        overlay.classList.toggle("active");
    });

    overlay.addEventListener("click", closeSidebar);

    function closeSidebar() {
        sidebar.classList.remove("active");
        overlay.classList.remove("active");
    }
}


// ===============================
// SUBMENU
// ===============================
function initSubmenu() {
    const sidebar = document.querySelector(".sidebar");
    if (!sidebar) return;

    sidebar.addEventListener("click", (e) => {
        const toggle = e.target.closest(".sub-toggle");
        if (!toggle) return;

        const parent = toggle.closest(".has-sub");
        if (!parent) return;

        parent.classList.toggle("open");
    });
}


// ===============================
// FOOTER
// ===============================
function loadFooter() {
    const container = document.getElementById("footer-container");
    if (!container) return;

    fetch("/components/footer.html")
        .then(res => {
            if (!res.ok) throw new Error("Footer não encontrado");
            return res.text();
        })
        .then(html => {
            container.innerHTML = html;
        })
        .catch(err => console.error("Erro footer:", err));
}


// ===============================
// MENU TOGGLE (SAFE)
// ===============================
function initMenuToggle() {
    const menuToggle = document.getElementById("menuToggle");
    const overlay = document.getElementById("overlay");
    const sidebar = document.querySelector(".sidebar");

    if (!menuToggle || !overlay || !sidebar) return;

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
// MODAL (CASO USE PDF EXPANDIDO)
// ===============================
function initModal() {
    const open = document.getElementById("abrirModal");
    const modal = document.getElementById("modalPDF");
    const close = document.getElementById("fecharModal");

    if (!open || !modal || !close) return;

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
}


// ===============================
// PDF.JS (CARTILHA DE LIBRAS - ESTÁVEL)
// ===============================
function initPDF() {

    if (typeof pdfjsLib === "undefined") {
        console.error("PDF.js não carregado");
        return;
    }

    const url = "/assets/docs/documentosacessibilidade/apostiladelibras.pdf";

    let pdfDoc = null;
    let pageNum = 1;
    let scale = window.innerWidth <= 768 ? 1 : 1.2;
    let rendering = false;

    const canvas = document.getElementById("pdf-canvas");
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    const wrap = document.querySelector(".pdf-canvas-wrap");

    const prev = document.querySelector("[data-prev]");
    const next = document.querySelector("[data-next]");
    const zoomIn = document.querySelector("[data-zoom-in]");
    const zoomOut = document.querySelector("[data-zoom-out]");

    const pageNumEl = document.querySelector("[data-page-num]");
    const pageCountEl = document.querySelector("[data-page-count]");
    const zoomLevel = document.querySelector("[data-zoom-level]");

    pdfjsLib.getDocument(url).promise.then(pdf => {
        pdfDoc = pdf;
        if (pageCountEl) pageCountEl.textContent = pdf.numPages;
        renderPage(pageNum);
    }).catch(err => console.error("Erro PDF:", err));

    function renderPage(num) {
        if (!pdfDoc || rendering) return;

        rendering = true;

        pdfDoc.getPage(num).then(page => {

            const viewport = page.getViewport({ scale });

            canvas.width = viewport.width;
            canvas.height = viewport.height;

            const renderTask = page.render({
                canvasContext: ctx,
                viewport
            });

            renderTask.promise.then(() => {
                rendering = false;
            });

            if (pageNumEl) pageNumEl.textContent = num;
            if (zoomLevel) zoomLevel.textContent = Math.round(scale * 100) + "%";
        });
    }

    prev?.addEventListener("click", () => {
        if (pageNum <= 1) return;
        renderPage(--pageNum);
    });

    next?.addEventListener("click", () => {
        if (!pdfDoc || pageNum >= pdfDoc.numPages) return;
        renderPage(++pageNum);
    });

    zoomIn?.addEventListener("click", () => {
        scale = Math.min(scale + 0.2, 3);
        renderPage(pageNum);
    });

    zoomOut?.addEventListener("click", () => {
        scale = Math.max(scale - 0.2, 0.6);
        renderPage(pageNum);
    });

    // swipe mobile
    if (wrap) {
        let startX = 0;

        wrap.addEventListener("touchstart", e => {
            startX = e.touches[0].clientX;
        });

        wrap.addEventListener("touchend", e => {
            const endX = e.changedTouches[0].clientX;

            if (!pdfDoc) return;

            if (startX - endX > 50 && pageNum < pdfDoc.numPages) {
                renderPage(++pageNum);
            }

            if (endX - startX > 50 && pageNum > 1) {
                renderPage(--pageNum);
            }
        });
    }
}


// ===============================
// REVEAL ANIMAÇÃO
// ===============================
function initReveal() {
    const items = document.querySelectorAll(".reveal");

    const observer = new IntersectionObserver(entries => {
        entries.forEach(e => {
            if (e.isIntersecting) {
                e.target.classList.add("active");
            }
        });
    }, { threshold: 0.1 });

    items.forEach(el => observer.observe(el));
}