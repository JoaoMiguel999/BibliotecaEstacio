// ===============================
// SIDEBAR – SUBMENUS (ACCORDION)
// ===============================

const subToggles = document.querySelectorAll(".sub-toggle");

subToggles.forEach(btn => {

    const subMenu = btn.nextElementSibling;
    const arrow = btn.querySelector(".arrow");

    if (!subMenu) return;

    btn.addEventListener("click", () => {

        const isOpen = subMenu.classList.contains("open");

        // FECHA OUTROS
        document.querySelectorAll(".sub.open").forEach(menu => {
            if (menu !== subMenu) {
                menu.classList.remove("open");

                const otherBtn = menu.previousElementSibling;
                const otherArrow = otherBtn?.querySelector(".arrow");

                otherArrow?.classList.remove("rotate");
                otherBtn?.setAttribute("aria-expanded", "false");
            }
        });

        // TOGGLE ATUAL
        subMenu.classList.toggle("open");
        arrow?.classList.toggle("rotate");

        btn.setAttribute("aria-expanded", !isOpen);
    });

});


// ===============================
// MENU MOBILE + OVERLAY
// ===============================

const sidebar = document.getElementById("sidebar");
const toggle = document.getElementById("menuToggle");
const overlay = document.getElementById("overlay");

if (toggle && sidebar && overlay) {

    toggle.addEventListener("click", (e) => {
        e.stopPropagation(); // 🔥 evita conflito
        sidebar.classList.toggle("active");
        overlay.classList.toggle("active");
    });

    // FECHAR AO CLICAR NO OVERLAY
    overlay.addEventListener("click", () => {
        sidebar.classList.remove("active");
        overlay.classList.remove("active");
    });

    // FECHAR AO CLICAR FORA
    document.addEventListener("click", (e) => {
        if (!sidebar.contains(e.target) && !toggle.contains(e.target)) {
            sidebar.classList.remove("active");
            overlay.classList.remove("active");
        }
    });
}

// ===============================
// DEBUG
// ===============================

console.log("🚀 Sistema funcionando!");