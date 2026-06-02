// ===============================
// inicio.js
// JS específico da página inicial.
// Sidebar, footer, reveal são tratados
// pelo global.js.
// ===============================

document.addEventListener("DOMContentLoaded", () => {

  initContadores();
  initSmoothScroll();

});


// ===============================
// CONTADOR DE ESTATÍSTICAS
// ===============================
function initContadores() {

  const counters = document.querySelectorAll(".stat-number[data-target]");
  if (!counters.length) return;

  let started = false;

  function animarContador(el) {
    const target   = parseInt(el.dataset.target, 10);
    const duration = 1800;
    const start    = performance.now();

    function step(now) {
      const elapsed  = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const ease     = 1 - Math.pow(1 - progress, 3);
      const value    = Math.floor(ease * target);

      el.textContent = value.toLocaleString("pt-BR");

      if (progress < 1) requestAnimationFrame(step);
      else el.textContent = target.toLocaleString("pt-BR") + "+";
    }

    requestAnimationFrame(step);
  }

  function checarVisibilidade() {
    if (started) return;

    const section = document.querySelector(".section-stats");
    if (!section) return;

    if (section.getBoundingClientRect().top < window.innerHeight - 80) {
      started = true;
      counters.forEach(animarContador);
    }
  }

  window.addEventListener("scroll", checarVisibilidade);
  checarVisibilidade();
}


// ===============================
// SMOOTH SCROLL — ÂNCORAS DO HERO
// ===============================
function initSmoothScroll() {

  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener("click", (e) => {
      const target = document.querySelector(link.getAttribute("href"));
      if (!target) return;

      e.preventDefault();
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });
}