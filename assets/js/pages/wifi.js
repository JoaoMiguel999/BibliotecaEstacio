
// ===============================
// MENU HAMBÚRGUER
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
// SUBMENUS (ACORDION)
// ===============================
const subToggles = document.querySelectorAll(".sub-toggle");

subToggles.forEach(button => {

    button.addEventListener("click", (e) => {
        e.preventDefault();

        const parent = button.closest(".has-sub");
        if (!parent) return;

        // Alterna o submenu clicado
        parent.classList.toggle("open");

        // Fecha os outros submenus
        document.querySelectorAll(".has-sub").forEach(item => {
            if (item !== parent) {
                item.classList.remove("open");
            }
        });

    });

});


// ===============================
// FECHAR MENU AO CLICAR NO OVERLAY
// ===============================
if (overlay) {
    overlay.addEventListener("click", () => {
        sidebar.classList.remove("active");
        overlay.classList.remove("active");
    });
}


// ===============================
// ANIMAÇÃO DA IMAGEM (SCROLL)
// ===============================
const wifiImg = document.querySelector(".wifi-img");

if (wifiImg) {

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                wifiImg.classList.add("show");
            }
        });
    }, {
        threshold: 0.3
    });

    observer.observe(wifiImg);

}


// ===============================
// EFEITO 3D (MOUSE)
// ===============================
if (wifiImg) {

    wifiImg.addEventListener("mousemove", (e) => {

        const rect = wifiImg.getBoundingClientRect();

        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        const rotateX = ((y - centerY) / centerY) * 6;
        const rotateY = ((x - centerX) / centerX) * -6;

        wifiImg.style.transform = `
            scale(1.05)
            rotateX(${rotateX}deg)
            rotateY(${rotateY}deg)
        `;

    });

    wifiImg.addEventListener("mouseleave", () => {
        wifiImg.style.transform = "";
    });

}


// ===============================
// LOG
// ===============================
console.log("🚀 JS Wi-Fi carregado com sucesso");