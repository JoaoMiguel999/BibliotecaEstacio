// ===============================
// SIDEBAR – SUBMENUS COM SETA INDEPENDENTE
// ===============================

// Seleciona todas as setas que abrem submenus
const subToggles = document.querySelectorAll(".sub-toggle");

subToggles.forEach(btn => {

    // Botão tem atributo aria-controls com ID do submenu
    const submenuId = btn.getAttribute("aria-controls");
    const subMenu = document.getElementById(submenuId);
    const arrow = btn.querySelector(".arrow");

    btn.addEventListener("click", () => {
        const isOpen = subMenu.style.display === "block";

        // Abrir / Fechar submenu
        subMenu.style.display = isOpen ? "none" : "block";

        // Rotacionar seta
        arrow.classList.toggle("rotate", !isOpen);

        // Atualiza acessibilidade ARIA
        btn.setAttribute("aria-expanded", !isOpen);
    });
});


// ===============================
// SIDEBAR TOGGLE (Versão Mobile)
// ===============================

const sidebar = document.querySelector(".sidebar");
const hamburger = document.querySelector(".hamburger");

if (hamburger) {
    hamburger.addEventListener("click", () => {
        sidebar.classList.toggle("collapsed");
    });
}


// ===============================
// BOTÃO VOLTAR AO TOPO
// ===============================

const btnTop = document.querySelector(".btn-top");

window.addEventListener("scroll", () => {
    btnTop.style.display = window.scrollY > 300 ? "flex" : "none";
});

btnTop.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
});


// ===============================
// SCROLL REVEAL (Animação ao aparecer)
// ===============================

const revealElements = document.querySelectorAll(".card, .hero, .content");

const revealOnScroll = () => {
    const windowHeight = window.innerHeight;

    revealElements.forEach(el => {
        const elementTop = el.getBoundingClientRect().top;

        if (elementTop < windowHeight - 100) {
            el.classList.add("visible");
        }
    });
};

window.addEventListener("scroll", revealOnScroll);
revealOnScroll();


// ===============================
// DEBUG
// ===============================

console.log("JS carregado com sucesso - Biblioteca Estácio 2025");
