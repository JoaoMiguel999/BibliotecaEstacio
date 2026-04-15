// ===============================
// MENU HAMBÚRGUER
// ===============================
const menuToggle = document.getElementById("menuToggle");
const sidebar = document.getElementById("sidebar");
const overlay = document.getElementById("overlay");

if (menuToggle && sidebar && overlay) {

    const toggleMenu = () => {
        sidebar.classList.toggle("active");
        overlay.classList.toggle("active");
    };

    const closeMenu = () => {
        sidebar.classList.remove("active");
        overlay.classList.remove("active");
    };

    menuToggle.addEventListener("click", toggleMenu);
    overlay.addEventListener("click", closeMenu);
}


// ===============================
// SUBMENUS (ACCORDION)
// ===============================
const subToggles = document.querySelectorAll(".sub-toggle");

subToggles.forEach(button => {

    button.addEventListener("click", () => {

        const parent = button.closest(".has-sub");
        if (!parent) return;

        parent.classList.toggle("open");

        // Fecha os outros
        document.querySelectorAll(".has-sub").forEach(item => {
            if (item !== parent) {
                item.classList.remove("open");
            }
        });

    });

});


// ===============================
// PDF.JS CONFIG
// ===============================
if (typeof pdfjsLib !== "undefined") {

    pdfjsLib.GlobalWorkerOptions.workerSrc =
        "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";

    const url = "../../assets/docs/documentosinformativos/wifi.pdf";

    const canvas = document.getElementById("pdf-canvas");

    if (canvas) {

        const ctx = canvas.getContext("2d");

        let pdfDoc = null;
        let pageNum = 1;
        let scale = 1.2;

        const pageNumEl = document.getElementById("pageNum");
        const pageCountEl = document.getElementById("pageCount");
        const zoomLevelEl = document.getElementById("zoomLevel");

        // ===============================
        // RENDERIZA PÁGINA
        // ===============================
        function renderPage(num) {

            pdfDoc.getPage(num).then(page => {

                const viewport = page.getViewport({ scale });

                canvas.height = viewport.height;
                canvas.width = viewport.width;

                const renderContext = {
                    canvasContext: ctx,
                    viewport: viewport
                };

                page.render(renderContext);

                if (pageNumEl) pageNumEl.textContent = num;
                if (zoomLevelEl) zoomLevelEl.textContent = Math.round(scale * 100) + "%";

            });

        }

        // ===============================
        // CARREGA PDF
        // ===============================
        pdfjsLib.getDocument(url).promise.then(pdf => {

            pdfDoc = pdf;

            if (pageCountEl) pageCountEl.textContent = pdf.numPages;

            renderPage(pageNum);

        }).catch(err => {
            console.error("Erro ao carregar PDF:", err);

            canvas.insertAdjacentHTML("afterend",
                `<p style="color:red;text-align:center;margin-top:10px;">
                    Erro ao carregar o PDF.
                </p>`
            );
        });

        // ===============================
        // CONTROLES
        // ===============================
        const nextBtn = document.getElementById("nextPage");
        const prevBtn = document.getElementById("prevPage");
        const zoomInBtn = document.getElementById("zoomIn");
        const zoomOutBtn = document.getElementById("zoomOut");

        if (nextBtn) {
            nextBtn.addEventListener("click", () => {
                if (pageNum < pdfDoc.numPages) {
                    pageNum++;
                    renderPage(pageNum);
                }
            });
        }

        if (prevBtn) {
            prevBtn.addEventListener("click", () => {
                if (pageNum > 1) {
                    pageNum--;
                    renderPage(pageNum);
                }
            });
        }

        if (zoomInBtn) {
            zoomInBtn.addEventListener("click", () => {
                scale += 0.2;
                renderPage(pageNum);
            });
        }

        if (zoomOutBtn) {
            zoomOutBtn.addEventListener("click", () => {
                if (scale > 0.6) {
                    scale -= 0.2;
                    renderPage(pageNum);
                }
            });
        }

    }

}


// ===============================
// LOG
// ===============================
console.log("🚀 Wi-Fi JS completo carregado com sucesso");