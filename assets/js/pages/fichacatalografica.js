document.addEventListener("DOMContentLoaded", () => {

// ===============================
// SIDEBAR (EVENT DELEGATION)
// ===============================
function initSidebar() {

    if (window.__sidebarInitialized) return;
    window.__sidebarInitialized = true;

    document.addEventListener("click", (e) => {

        const menuToggle = e.target.closest("#menuToggle");
        const overlayClick = e.target.closest("#overlay");

        const sidebar = document.getElementById("sidebar");
        const overlay = document.getElementById("overlay");

        if (!sidebar || !overlay) return;

        if (menuToggle) {
            sidebar.classList.toggle("active");
            overlay.classList.toggle("active");
        }

        if (overlayClick) {
            sidebar.classList.remove("active");
            overlay.classList.remove("active");
        }

        const subBtn = e.target.closest(".sub-toggle");
        if (subBtn) {

            e.preventDefault();

            const parent = subBtn.closest(".has-sub");
            if (!parent) return;

            document.querySelectorAll(".has-sub.open").forEach(item => {
                if (item !== parent) item.classList.remove("open");
            });

            parent.classList.toggle("open");
            subBtn.setAttribute("aria-expanded", parent.classList.contains("open"));
        }
    });
}


// ===============================
// INCLUDES
// ===============================
function loadIncludes() {

    const sidebarContainer = document.getElementById("sidebar-container");
    const footerContainer = document.getElementById("footer-container");

    if (sidebarContainer && !window.__sidebarLoaded) {
        window.__sidebarLoaded = true;

        fetch("../../components/sidebar.html")
            .then(r => r.text())
            .then(html => sidebarContainer.innerHTML = html);
    }

    if (footerContainer && !window.__footerLoaded) {
        window.__footerLoaded = true;

        fetch("../../components/footer.html")
            .then(r => r.text())
            .then(html => footerContainer.innerHTML = html);
    }
}


// ===============================
// PDF NORMAL
// ===============================
function initPDFNormal(pdfDoc) {

    const canvas = document.getElementById("pdf-canvas");
    const wrap = canvas?.parentElement;
    if (!canvas || !wrap) return;

    const ctx = canvas.getContext("2d");

    const btnPrev = document.querySelector("[data-prev]");
    const btnNext = document.querySelector("[data-next]");
    const zoomIn = document.querySelector("[data-zoom-in]");
    const zoomOut = document.querySelector("[data-zoom-out]");
    const pageNumEl = document.querySelector("[data-page-num]");
    const pageCountEl = document.querySelector("[data-page-count]");
    const zoomEl = document.querySelector("[data-zoom-level]");

    let page = 1;
    let scale = window.innerWidth <= 768 ? 1 : 0.5;

    let renderTask;

    function render(num) {

        pdfDoc.getPage(num).then(p => {

            const base = p.getViewport({ scale: 1 });
            const containerWidth = wrap.clientWidth || window.innerWidth;
            const fitScale = containerWidth / base.width;
            const dpr = window.devicePixelRatio || 1;

            const viewport = p.getViewport({
                scale: (fitScale * dpr) * scale
            });

            if (renderTask) renderTask.cancel();

            canvas.width = viewport.width;
            canvas.height = viewport.height;

            canvas.style.width = (viewport.width / dpr) + "px";
            canvas.style.height = (viewport.height / dpr) + "px";

            renderTask = p.render({
                canvasContext: ctx,
                viewport
            });

            pageNumEl.textContent = num;
            pageCountEl.textContent = pdfDoc.numPages;
            zoomEl.textContent = Math.round(scale * 100) + "%";
        });
    }

    render(page);

    btnPrev?.addEventListener("click", () => {
        if (page > 1) render(--page);
    });

    btnNext?.addEventListener("click", () => {
        if (page < pdfDoc.numPages) render(++page);
    });

    zoomIn?.addEventListener("click", () => {
        scale = Math.min(3, scale + 0.2);
        render(page);
    });

    zoomOut?.addEventListener("click", () => {
        scale = Math.max(0.3, scale - 0.2);
        render(page);
    });

    let resizeTimer;
    window.addEventListener("resize", () => {
        clearTimeout(resizeTimer);

        resizeTimer = setTimeout(() => {
            scale = window.innerWidth <= 768 ? 1 : 0.5;
            render(page);
        }, 200);
    });
}


// ===============================
// PDF MODAL
// ===============================
function initPDFModal(pdfDoc) {

    const modal = document.getElementById("modalPDF");
    if (!modal) return;

    const canvas = modal.querySelector("#modal-pdf-canvas");
    const wrap = modal.querySelector("#modal-canvas-wrap");
    if (!canvas || !wrap) return;

    const ctx = canvas.getContext("2d");

    const btnPrev = modal.querySelector("[data-modal-prev]");
    const btnNext = modal.querySelector("[data-modal-next]");
    const zoomIn = modal.querySelector("[data-modal-zoom-in]");
    const zoomOut = modal.querySelector("[data-modal-zoom-out]");
    const pageNumEl = modal.querySelector("[data-modal-page-num]");
    const pageCountEl = modal.querySelector("[data-modal-page-count]");
    const zoomEl = modal.querySelector("[data-modal-zoom-level]");

    let page = 1;
    let scale = 1;
    let renderTask;

    function render(num) {

        pdfDoc.getPage(num).then(p => {

            const base = p.getViewport({ scale: 1 });
            const containerWidth = wrap.clientWidth || window.innerWidth;
            const fitScale = containerWidth / base.width;
            const dpr = window.devicePixelRatio || 1;

            const viewport = p.getViewport({
                scale: (fitScale * dpr) * scale
            });

            if (renderTask) renderTask.cancel();

            canvas.width = viewport.width;
            canvas.height = viewport.height;

            canvas.style.width = (viewport.width / dpr) + "px";
            canvas.style.height = (viewport.height / dpr) + "px";

            renderTask = p.render({
                canvasContext: ctx,
                viewport
            });

            pageNumEl.textContent = num;
            pageCountEl.textContent = pdfDoc.numPages;
            zoomEl.textContent = Math.round(scale * 100) + "%";
        });
    }

    // RESET
    window.__pdfModal = {
        reset: () => {
            page = 1;
            scale = 1;
            render(page);
        },
        fit: () => {
            scale = 1;
            render(page);
        }
    };

    render(page);

    btnPrev?.addEventListener("click", () => {
        if (page > 1) render(--page);
    });

    btnNext?.addEventListener("click", () => {
        if (page < pdfDoc.numPages) render(++page);
    });

    zoomIn?.addEventListener("click", () => {
        scale = Math.min(3, scale + 0.2);
        render(page);
    });

    zoomOut?.addEventListener("click", () => {
        scale = Math.max(0.3, scale - 0.2);
        render(page);
    });

    // ===============================
    // FULLSCREEN FIX (🔥 AQUI ESTÁ O QUE VOCÊ QUERIA)
    // ===============================
    document.addEventListener("fullscreenchange", () => {

        if (!document.fullscreenElement) return;

        pdfDoc.getPage(page).then(p => {

            const base = p.getViewport({ scale: 1 });
            const containerWidth = wrap.clientWidth || window.innerWidth;
            const dpr = window.devicePixelRatio || 1;

            scale = 1; // ajusta automaticamente

            const viewport = p.getViewport({
                scale: (containerWidth / base.width) * dpr * scale
            });

            if (renderTask) renderTask.cancel();

            canvas.width = viewport.width;
            canvas.height = viewport.height;

            canvas.style.width = (viewport.width / dpr) + "px";
            canvas.style.height = (viewport.height / dpr) + "px";

            renderTask = p.render({
                canvasContext: ctx,
                viewport
            });
        });
    });
}


// ===============================
// MODAL
// ===============================
function initModal() {

    const open = document.getElementById("abrirModal");
    const close = document.getElementById("fecharModal");
    const modal = document.getElementById("modalPDF");

    if (!open || !close || !modal) return;

    open.addEventListener("click", () => {
        modal.classList.add("active");
        document.body.style.overflow = "hidden";

        window.__pdfModal?.reset();
    });

    close.addEventListener("click", () => {
        modal.classList.remove("active");
        document.body.style.overflow = "";
    });
}


// ===============================
// LOAD PDF
// ===============================
function loadPDF() {

    if (!window.pdfjsLib) return;

    const url = "../../assets/docs/documentosinformativos/Aviso-ficha-catalografica.pdf";

    pdfjsLib.getDocument(url).promise.then(pdf => {
        initPDFNormal(pdf);
        initPDFModal(pdf);
    });
}


// ===============================
// INIT
// ===============================
initSidebar();
loadIncludes();
initModal();
loadPDF();

});