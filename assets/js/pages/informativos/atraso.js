// ===============================
// atraso.js
// JS específico da página de Atraso de Livros.
// Sidebar, footer, reveal e pdf-viewer
// são tratados pelos scripts globais.
// Aqui fica apenas a barra de progresso
// de leitura do PDF.
// ===============================

document.addEventListener("DOMContentLoaded", () => {

  initProgressBar();

});


// ===============================
// BARRA DE PROGRESSO DE LEITURA
// Observa [data-page-num] e atualiza a barra
// conforme o pdf-viewer.js global troca de página.
// ===============================
function initProgressBar() {

  const bar    = document.getElementById("pdf-progress-bar");
  const target = document.querySelector("[data-page-num]");

  if (!bar || !target) return;

  // Suaviza a transição da barra
  bar.style.transition = "width 0.35s ease";
  bar.style.width = "0%";

  const observer = new MutationObserver(() => {
    const cur   = parseInt(document.querySelector("[data-page-num]")?.textContent)   || 1;
    const total = parseInt(document.querySelector("[data-page-count]")?.textContent) || 0;

    if (total > 0) {
      bar.style.width = Math.round((cur / total) * 100) + "%";
    }
  });

  observer.observe(target, { childList: true, characterData: true, subtree: true });
}