// ===============================
// SIDEBAR SUBMENU (Categorias)
// ===============================
const subToggles = document.querySelectorAll(".sub-toggle");

subToggles.forEach(btn => {
    const subMenu = btn.nextElementSibling; // pega o submenu
    const arrow = btn.querySelector(".arrow");

    btn.addEventListener("click", () => {
        const isOpen = subMenu.style.display === "block";

        if (isOpen) {
            subMenu.style.display = "none";
            arrow.classList.remove("rotate");
        } else {
            subMenu.style.display = "block";
            arrow.classList.add("rotate");
        }
    });
});

// ===============================
// SIDEBAR TOGGLE (mobile / colapsar)
// ===============================
const sidebar = document.querySelector(".sidebar");
const hamburger = document.querySelector(".hamburger");

hamburger.addEventListener("click", () => {
    sidebar.classList.toggle("collapsed");
});

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
// SCROLL REVEAL PARA ELEMENTOS
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
