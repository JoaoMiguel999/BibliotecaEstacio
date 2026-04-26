// ===============================
// SCROLL REVEAL
// ===============================
const revealEls = document.querySelectorAll(".reveal");

if (revealEls.length) {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
      }
    });
  }, { threshold: 0.1 });

  revealEls.forEach(el => observer.observe(el));
}

console.log("🚀 Global JS carregado");