(function () {

  // ===============================
  // BARRA DE PROGRESSO DE LEITURA
  // Observa [data-page-num] e atualiza a barra
  // conforme o pdf-viewer.js troca de página.
  // ===============================
  const bar = document.getElementById('pdf-progress-bar');

  if (bar) {
    const target = document.querySelector('[data-page-num]');

    if (target) {
      const observer = new MutationObserver(() => {
        const cur   = parseInt(document.querySelector('[data-page-num]')?.textContent)  || 1;
        const total = parseInt(document.querySelector('[data-page-count]')?.textContent) || 1;
        if (total > 1) bar.style.width = Math.round((cur / total) * 100) + '%';
      });

      observer.observe(target, { childList: true, characterData: true, subtree: true });
    }
  }

  // ===============================
  // ANIMAÇÃO REVEAL AO ROLAR
  // Adiciona .active em cada .reveal
  // quando o elemento entra na viewport.
  // ===============================
  const revealEls = document.querySelectorAll('.reveal');

  if (revealEls.length) {
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('active');
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.12 });

    revealEls.forEach(el => io.observe(el));
  }

})();