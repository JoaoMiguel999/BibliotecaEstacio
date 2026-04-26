document.addEventListener("DOMContentLoaded", () => {

  // ===============================
  // CARREGA COMPONENTES
  // ===============================
  Promise.all([
    fetch("/components/sidebar.html").then(r => r.text()),
    fetch("/components/footer.html").then(r => r.text())
  ]).then(([sidebarHTML, footerHTML]) => {
    const sc = document.getElementById("sidebar-container");
    const fc = document.getElementById("footer-container");
    if (sc) sc.innerHTML = sidebarHTML;
    if (fc) fc.innerHTML = footerHTML;
    requestAnimationFrame(() => initSidebar());
  }).catch(err => console.error("Erro ao carregar componentes:", err));


  // ===============================
  // SIDEBAR
  // ===============================
  function initSidebar() {
    const sidebar    = document.querySelector(".sidebar");
    const menuToggle = document.getElementById("menuToggle");
    const overlay    = document.getElementById("overlay");
    if (!sidebar || !menuToggle || !overlay) return;

    menuToggle.addEventListener("click", () => {
      const isOpened = sidebar.classList.toggle("active");
      overlay.classList.toggle("active", isOpened);
      document.body.style.overflow = isOpened ? "hidden" : "";
    });

    const closeSidebar = () => {
      sidebar.classList.remove("active");
      overlay.classList.remove("active");
      document.body.style.overflow = "";
    };

    overlay.addEventListener("click", closeSidebar);
    document.addEventListener("keydown", e => { if (e.key === "Escape") closeSidebar(); });

    sidebar.addEventListener("click", (e) => {
      const btn = e.target.closest(".sub-toggle");
      if (!btn) return;
      const itemPai = btn.closest(".has-sub");
      if (!itemPai) return;
      e.preventDefault();
      const estaAberto = itemPai.classList.contains("open");
      sidebar.querySelectorAll(".has-sub.open").forEach(el => {
        if (el !== itemPai) el.classList.remove("open");
      });
      itemPai.classList.toggle("open", !estaAberto);
    });
  }


  // ===============================
  // REVEAL ON SCROLL
  // ===============================
  const revealEls = document.querySelectorAll(".reveal");
  if (revealEls.length) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("active");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08 });
    revealEls.forEach(el => observer.observe(el));
  }


  // ===============================
  // DATA DE HOJE
  // ===============================
  const dataVisita = document.getElementById("data-visita");
  if (dataVisita) {
    const hoje = new Date();
    const yyyy = hoje.getFullYear();
    const mm   = String(hoje.getMonth() + 1).padStart(2, "0");
    const dd   = String(hoje.getDate()).padStart(2, "0");
    const hoje_str = `${yyyy}-${mm}-${dd}`;
    dataVisita.value = hoje_str;
    dataVisita.max   = hoje_str; // não permite datas futuras
  }


  // ===============================
  // MÁSCARA CPF
  // ===============================
  const cpfInput = document.getElementById("cpf-visitante");
  if (cpfInput) {
    cpfInput.addEventListener("input", () => {
      let val = cpfInput.value.replace(/\D/g, "").slice(0, 11);
      if (val.length > 9) {
        val = val.replace(/(\d{3})(\d{3})(\d{3})(\d{0,2})/, "$1.$2.$3-$4");
      } else if (val.length > 6) {
        val = val.replace(/(\d{3})(\d{3})(\d{0,3})/, "$1.$2.$3");
      } else if (val.length > 3) {
        val = val.replace(/(\d{3})(\d{0,3})/, "$1.$2");
      }
      cpfInput.value = val;
    });
  }


  // ===============================
  // MÁSCARA TELEFONE
  // ===============================
  const telInput = document.getElementById("telefone-visitante");
  if (telInput) {
    telInput.addEventListener("input", () => {
      let val = telInput.value.replace(/\D/g, "").slice(0, 11);
      if (val.length > 10) {
        val = val.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
      } else if (val.length > 6) {
        val = val.replace(/(\d{2})(\d{4})(\d{0,4})/, "($1) $2-$3");
      } else if (val.length > 2) {
        val = val.replace(/(\d{2})(\d{0,5})/, "($1) $2");
      }
      telInput.value = val;
    });
  }


  // ===============================
  // VALIDAÇÃO E ENVIO
  // ===============================
  const btnCadastrar = document.getElementById("btn-cadastrar");
  const btnLimpar    = document.getElementById("btn-limpar-visitante");
  const formSuccess  = document.getElementById("form-success-visitante");

  const camposObrig = {
    "nome-visitante"      : "erro-nome-visitante",
    "cpf-visitante"       : "erro-cpf-visitante",
    "email-visitante"     : "erro-email-visitante",
    "data-visita"         : "erro-data-visita",
    "horario-entrada"     : "erro-horario-entrada",
    "finalidade-visitante": "erro-finalidade-visitante",
  };

  function limparErros() {
    Object.entries(camposObrig).forEach(([id, erroId]) => {
      const campo = document.getElementById(id);
      const erro  = document.getElementById(erroId);
      if (campo) campo.classList.remove("erro");
      if (erro)  erro.textContent = "";
    });
    const lgpdErro = document.getElementById("erro-lgpd-visitante");
    if (lgpdErro) lgpdErro.textContent = "";
  }

  function validarCPF(cpf) {
    const nums = cpf.replace(/\D/g, "");
    if (nums.length !== 11 || /^(\d)\1+$/.test(nums)) return false;
    let soma = 0;
    for (let i = 0; i < 9; i++) soma += Number(nums[i]) * (10 - i);
    let resto = (soma * 10) % 11;
    if (resto === 10 || resto === 11) resto = 0;
    if (resto !== Number(nums[9])) return false;
    soma = 0;
    for (let i = 0; i < 10; i++) soma += Number(nums[i]) * (11 - i);
    resto = (soma * 10) % 11;
    if (resto === 10 || resto === 11) resto = 0;
    return resto === Number(nums[10]);
  }

  function validar() {
    let valido = true;

    Object.entries(camposObrig).forEach(([id, erroId]) => {
      const campo = document.getElementById(id);
      const erro  = document.getElementById(erroId);
      if (!campo || !erro) return;

      const val = campo.value.trim();

      if (!val) {
        campo.classList.add("erro");
        erro.textContent = "Campo obrigatório.";
        valido = false;
        return;
      }

      // E-mail
      if (id === "email-visitante") {
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) {
          campo.classList.add("erro");
          erro.textContent = "Informe um e-mail válido.";
          valido = false;
          return;
        }
      }

      // CPF
      if (id === "cpf-visitante") {
        if (!validarCPF(val)) {
          campo.classList.add("erro");
          erro.textContent = "CPF inválido. Verifique o número informado.";
          valido = false;
          return;
        }
      }

      campo.classList.remove("erro");
      erro.textContent = "";
    });

    // LGPD
    const lgpd     = document.getElementById("lgpd-visitante");
    const lgpdErro = document.getElementById("erro-lgpd-visitante");
    if (lgpd && lgpdErro && !lgpd.checked) {
      lgpdErro.textContent = "É necessário aceitar os termos para prosseguir.";
      valido = false;
    } else if (lgpdErro) {
      lgpdErro.textContent = "";
    }

    return valido;
  }

  const todosOsCampos = [
    "nome-visitante", "cpf-visitante", "email-visitante", "telefone-visitante",
    "rg-visitante", "nascimento-visitante", "data-visita", "horario-entrada",
    "finalidade-visitante", "vinculo-visitante", "obs-visitante"
  ];

  if (btnCadastrar) {
    btnCadastrar.addEventListener("click", () => {
      limparErros();
      if (!validar()) return;

      btnCadastrar.disabled = true;
      btnCadastrar.innerHTML = '<i class="ri-loader-4-line ri-spin"></i> Registrando...';

      setTimeout(() => {
        btnCadastrar.disabled = false;
        btnCadastrar.innerHTML = '<i class="ri-user-add-line"></i> Registrar Visita';

        if (formSuccess) {
          formSuccess.style.display = "flex";
          formSuccess.scrollIntoView({ behavior: "smooth", block: "center" });
        }

        // Limpa campos
        todosOsCampos.forEach(id => {
          const el = document.getElementById(id);
          if (el) el.value = "";
        });

        const lgpd = document.getElementById("lgpd-visitante");
        if (lgpd) lgpd.checked = false;

      }, 1400);
    });
  }

  if (btnLimpar) {
    btnLimpar.addEventListener("click", () => {
      limparErros();
      if (formSuccess) formSuccess.style.display = "none";
      todosOsCampos.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.value = "";
      });
      const lgpd = document.getElementById("lgpd-visitante");
      if (lgpd) lgpd.checked = false;
    });
  }

});