// ======================================================
// Acessibilidade.js — Biblioteca Estácio São Luís
// Contém apenas lógica exclusiva desta página.
// Sidebar e scroll reveal já são gerenciados pelo global.js.
// ======================================================

document.addEventListener("DOMContentLoaded", () => {

  // ======================================================
  // REVEAL COM STAGGER NOS CARDS
  // O global.js adiciona a classe "visible" nos .reveal,
  // mas sem delay entre elementos. Aqui aplicamos
  // transitionDelay individual para que os cards apareçam
  // em sequência ao invés de todos juntos.
  // ======================================================

  document.querySelectorAll(".reveal").forEach((el, index) => {
    el.style.transitionDelay = `${index * 80}ms`;
  });


  // ======================================================
  // PARALLAX NO HERO
  // Atua em backgroundPositionY diretamente no .hero,
  // onde o background-image está declarado no CSS.
  // ======================================================

  const hero = document.querySelector(".hero");

  if (hero) {
    window.addEventListener("scroll", () => {
      hero.style.backgroundPositionY =
        `calc(center + ${window.scrollY * 0.3}px)`;
    }, { passive: true });
  }


  // ======================================================
  // SMOOTH SCROLL — ÂNCORAS
  // ======================================================

  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {

    anchor.addEventListener("click", (e) => {

      const targetId = anchor.getAttribute("href");

      if (!targetId || targetId === "#") return;

      const target = document.querySelector(targetId);

      if (!target) return;

      e.preventDefault();

      target.scrollIntoView({ behavior: "smooth", block: "start" });

    });

  });


  // ======================================================
  // HOVER 3D NOS CARDS
  // ======================================================

  document.querySelectorAll(".card").forEach((card) => {

    card.addEventListener("mousemove", (e) => {

      const rect    = card.getBoundingClientRect();
      const rotateY = ((e.clientX - rect.left)  / rect.width  - 0.5) * 8;
      const rotateX = ((e.clientY - rect.top)   / rect.height - 0.5) * -8;

      card.style.transform = `
        perspective(800px)
        rotateX(${rotateX}deg)
        rotateY(${rotateY}deg)
        translateY(-6px)
      `;

    });

    card.addEventListener("mouseleave", () => {
      card.style.transform = "";
    });

  });


  console.log("🚀 Acessibilidade.js carregado");

});