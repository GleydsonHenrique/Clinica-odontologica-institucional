/* ==========================================================
   Clínica Sorriso — interações da página
   ========================================================== */

document.documentElement.classList.add("js");

/* ---------- Cabeçalho: sombra ao rolar ---------- */

const header = document.querySelector(".site-header");

function atualizarCabecalho() {
  header.classList.toggle("is-scrolled", window.scrollY > 8);
}

atualizarCabecalho();
window.addEventListener("scroll", atualizarCabecalho, { passive: true });

/* ---------- Menu mobile ---------- */

const navToggle = document.querySelector(".nav-toggle");
const mainNav = document.querySelector(".main-nav");

function definirMenu(aberto) {
  navToggle.setAttribute("aria-expanded", String(aberto));
  navToggle.setAttribute("aria-label", aberto ? "Fechar menu" : "Abrir menu");
  mainNav.classList.toggle("is-open", aberto);
  document.body.classList.toggle("menu-aberto", aberto);
}

navToggle.addEventListener("click", () => {
  definirMenu(navToggle.getAttribute("aria-expanded") !== "true");
});

mainNav.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => definirMenu(false));
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && mainNav.classList.contains("is-open")) {
    definirMenu(false);
    navToggle.focus();
  }
});

window.matchMedia("(min-width: 56.01rem)").addEventListener("change", (event) => {
  if (event.matches) definirMenu(false);
});

/* ---------- Destaque do link da seção atual ---------- */

const navLinks = mainNav.querySelectorAll("a:not(.button)");
const secoes = [...navLinks]
  .map((link) => document.querySelector(link.getAttribute("href")))
  .filter(Boolean);

if ("IntersectionObserver" in window) {
  const observadorSecoes = new IntersectionObserver(
    (entradas) => {
      entradas.forEach((entrada) => {
        if (!entrada.isIntersecting) return;
        navLinks.forEach((link) => {
          const ativo = link.getAttribute("href") === `#${entrada.target.id}`;
          link.classList.toggle("is-active", ativo);
          if (ativo) {
            link.setAttribute("aria-current", "true");
          } else {
            link.removeAttribute("aria-current");
          }
        });
      });
    },
    { rootMargin: "-45% 0px -50% 0px" }
  );

  secoes.forEach((secao) => observadorSecoes.observe(secao));
}

/* ---------- Animação de entrada dos blocos ---------- */

const elementosReveal = document.querySelectorAll(".reveal");

if ("IntersectionObserver" in window) {
  const observadorReveal = new IntersectionObserver(
    (entradas, observador) => {
      entradas.forEach((entrada) => {
        if (!entrada.isIntersecting) return;
        entrada.target.classList.add("is-visible");
        observador.unobserve(entrada.target);
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
  );

  elementosReveal.forEach((elemento) => observadorReveal.observe(elemento));
} else {
  elementosReveal.forEach((elemento) => elemento.classList.add("is-visible"));
}

/* ---------- Ano atual no rodapé ---------- */

document.querySelectorAll("[data-ano-atual]").forEach((elemento) => {
  elemento.textContent = new Date().getFullYear();
});

/* ---------- Formulário de agendamento ---------- */

const appointmentForm = document.querySelector(".appointment-form");
const formStatus = appointmentForm.querySelector(".form-status");
const submitButton = appointmentForm.querySelector(".form-submit");
const campoTelefone = appointmentForm.querySelector("#telefone");
const campoEspecialidade = appointmentForm.querySelector("#especialidade");

// Os links "Agendar avaliação" dos cards já selecionam a especialidade correspondente.
document.querySelectorAll("[data-especialidade]").forEach((link) => {
  link.addEventListener("click", () => {
    campoEspecialidade.value = link.dataset.especialidade;
    limparErro(campoEspecialidade);
  });
});

// Máscara de telefone: (00) 0000-0000 ou (00) 00000-0000
function formatarTelefone(valor) {
  const digitos = valor.replace(/\D/g, "").slice(0, 11);

  if (digitos.length <= 2) return digitos.length ? `(${digitos}` : "";
  if (digitos.length <= 6) return `(${digitos.slice(0, 2)}) ${digitos.slice(2)}`;
  if (digitos.length <= 10) {
    return `(${digitos.slice(0, 2)}) ${digitos.slice(2, 6)}-${digitos.slice(6)}`;
  }
  return `(${digitos.slice(0, 2)}) ${digitos.slice(2, 7)}-${digitos.slice(7)}`;
}

campoTelefone.addEventListener("input", () => {
  campoTelefone.value = formatarTelefone(campoTelefone.value);
});

const validacoes = {
  nome(campo) {
    const valor = campo.value.trim();
    if (!valor) return "Informe seu nome.";
    if (valor.length < 3) return "Informe seu nome completo.";
    return "";
  },
  telefone(campo) {
    const digitos = campo.value.replace(/\D/g, "");
    if (!digitos) return "Informe um telefone para contato.";
    if (digitos.length < 10) return "Informe o telefone com DDD.";
    return "";
  },
  email(campo) {
    const valor = campo.value.trim();
    if (valor && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(valor)) return "Informe um e-mail válido.";
    return "";
  },
  especialidade(campo) {
    return campo.value ? "" : "Selecione uma especialidade.";
  },
  consentimento(campo) {
    return campo.checked ? "" : "É necessário autorizar o uso dos dados para contato.";
  },
};

function mostrarErro(campo, mensagem) {
  const field = campo.closest(".field");
  const erro = document.getElementById(`${campo.id}-erro`);
  field.classList.toggle("has-error", Boolean(mensagem));
  campo.setAttribute("aria-invalid", mensagem ? "true" : "false");
  if (erro) erro.textContent = mensagem;
}

function limparErro(campo) {
  mostrarErro(campo, "");
}

function validarCampo(campo) {
  const regra = validacoes[campo.name];
  if (!regra) return true;
  const mensagem = regra(campo);
  mostrarErro(campo, mensagem);
  return !mensagem;
}

Object.keys(validacoes).forEach((nome) => {
  const campo = appointmentForm.elements[nome];
  campo.addEventListener("blur", () => validarCampo(campo));
  campo.addEventListener(campo.type === "checkbox" || campo.tagName === "SELECT" ? "change" : "input", () => {
    if (campo.closest(".field").classList.contains("has-error")) validarCampo(campo);
  });
});

function mostrarStatus(mensagem, tipo) {
  formStatus.textContent = mensagem;
  formStatus.className = `form-status is-${tipo}`;
  formStatus.hidden = false;
}

/*
  Ponto de integração: substitua esta função pelo envio real
  (por exemplo, fetch para a API da clínica ou serviço de e-mail).
  Enquanto não houver integração, ela apenas simula o envio.
*/
function enviarSolicitacao(dados) {
  return new Promise((resolve) => setTimeout(() => resolve(dados), 700));
}

appointmentForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  formStatus.hidden = true;

  const campos = Object.keys(validacoes).map((nome) => appointmentForm.elements[nome]);
  const invalidos = campos.filter((campo) => !validarCampo(campo));

  if (invalidos.length) {
    mostrarStatus("Revise os campos destacados antes de enviar.", "error");
    invalidos[0].focus();
    return;
  }

  const dados = Object.fromEntries(new FormData(appointmentForm));
  const textoOriginal = submitButton.textContent;
  submitButton.disabled = true;
  submitButton.textContent = "Enviando...";

  try {
    await enviarSolicitacao(dados);
    const primeiroNome = dados.nome.trim().split(/\s+/)[0];
    mostrarStatus(
      `Obrigado, ${primeiroNome}. Sua solicitação foi registrada. (Demonstração: os dados não foram enviados à recepção.)`,
      "success"
    );
    appointmentForm.reset();
    campos.forEach(limparErro);
  } catch (erro) {
    mostrarStatus("Não foi possível enviar sua solicitação. Tente novamente em instantes.", "error");
  } finally {
    submitButton.disabled = false;
    submitButton.textContent = textoOriginal;
  }
});
