// ===============================
// ELEMENTOS
// ===============================
const sidebar = document.getElementById("sidebar");
const toggle = document.getElementById("menuToggle");
const overlay = document.getElementById("overlay");
const subToggles = document.querySelectorAll(".sub-toggle");

// CARROSSEL
const images = document.querySelectorAll(".carrossel-img");
const prevBtn = document.querySelector(".prev");
const nextBtn = document.querySelector(".next");

let index = 0;


// ===============================
// MENU TOGGLE (SIDEBAR)
// ===============================
if (toggle && sidebar && overlay) {

  toggle.addEventListener("click", (e) => {
    e.stopPropagation();

    sidebar.classList.toggle("active");
    overlay.classList.toggle("active");

    // Fecha submenus ao fechar menu
    if (!sidebar.classList.contains("active")) {
      closeAllSubmenus();
    }
  });

  overlay.addEventListener("click", closeSidebar);

  document.addEventListener("click", (e) => {
    if (!sidebar.contains(e.target) && !toggle.contains(e.target)) {
      closeSidebar();
    }
  });
}

function closeSidebar() {
  sidebar.classList.remove("active");
  overlay.classList.remove("active");
  closeAllSubmenus();
}


// ===============================
// SUBMENUS
// ===============================
subToggles.forEach(btn => {
  btn.addEventListener("click", (e) => {
    e.stopPropagation();

    const parent = btn.closest(".has-sub");
    const isOpen = parent.classList.contains("open");

    // Fecha outros
    document.querySelectorAll(".has-sub.open").forEach(item => {
      if (item !== parent) {
        item.classList.remove("open");
        item.querySelector(".sub-toggle")?.setAttribute("aria-expanded", "false");
      }
    });

    // Toggle atual
    parent.classList.toggle("open");
    btn.setAttribute("aria-expanded", !isOpen);
  });
});

function closeAllSubmenus() {
  document.querySelectorAll(".has-sub.open").forEach(item => {
    item.classList.remove("open");
    item.querySelector(".sub-toggle")?.setAttribute("aria-expanded", "false");
  });
}


// ===============================
// CARROSSEL
// ===============================
if (images.length > 0) {

  function showSlide(i) {
    images.forEach(img => img.classList.remove("active"));
    images[i].classList.add("active");
  }

  if (nextBtn) {
    nextBtn.addEventListener("click", () => {
      index = (index + 1) % images.length;
      showSlide(index);
    });
  }

  if (prevBtn) {
    prevBtn.addEventListener("click", () => {
      index = (index - 1 + images.length) % images.length;
      showSlide(index);
    });
  }

  // AUTO PLAY
  setInterval(() => {
    index = (index + 1) % images.length;
    showSlide(index);
  }, 5000);
}


// ===============================
// SCROLL REVEAL (ANIMAÇÃO)
// ===============================
const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add("visible");
    }
  });
}, { threshold: 0.1 });

document.querySelectorAll(".reveal").forEach(el => observer.observe(el));


// ===============================
// SMOOTH SCROLL
// ===============================
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener("click", (e) => {
    const target = document.querySelector(anchor.getAttribute("href"));

    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: "smooth" });
    }
  });
});