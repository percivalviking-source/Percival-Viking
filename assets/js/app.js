async function carregarParcial(alvo) {
  const arquivo = alvo.dataset.partial;

  if (!arquivo) {
    return;
  }

  try {
    const resposta = await fetch(arquivo);

    if (!resposta.ok) {
      throw new Error(`Falha ao carregar ${arquivo}`);
    }

    alvo.innerHTML = await resposta.text();
  } catch (erro) {
    alvo.innerHTML = `<div class="error">Erro ao carregar ${arquivo}</div>`;
    console.error(erro);
  }
}

function abrirMenuMobile() {
  document.body.classList.add("menu-open");

  const botaoMenu = document.querySelector("[data-menu-open]");

  if (botaoMenu) {
    botaoMenu.setAttribute("aria-expanded", "true");
    botaoMenu.setAttribute("aria-label", "Fechar menu");
  }
}

function fecharMenuMobile() {
  document.body.classList.remove("menu-open");

  const botaoMenu = document.querySelector("[data-menu-open]");

  if (botaoMenu) {
    botaoMenu.setAttribute("aria-expanded", "false");
    botaoMenu.setAttribute("aria-label", "Abrir menu");
  }
}

function iniciarMenuMobile() {
  document.addEventListener("click", function (evento) {
    const botaoAbrir = evento.target.closest("[data-menu-open]");
    const botaoFechar = evento.target.closest("[data-menu-close]");
    const linkMenu = evento.target.closest(".mobile-menu-nav a");

    if (botaoAbrir) {
      const menuAberto = document.body.classList.contains("menu-open");

      if (menuAberto) {
        fecharMenuMobile();
      } else {
        abrirMenuMobile();
      }
    }

    if (botaoFechar || linkMenu) {
      fecharMenuMobile();
    }
  });

  document.addEventListener("keydown", function (evento) {
    if (evento.key === "Escape") {
      fecharMenuMobile();
    }
  });
}

async function iniciarPercivalViking() {
  const parciais = [...document.querySelectorAll("[data-partial]")];

  for (const parcial of parciais) {
    await carregarParcial(parcial);
  }

  iniciarMenuMobile();

  if (typeof carregarFeedHome === "function") {
    carregarFeedHome();
  }
}

document.addEventListener("DOMContentLoaded", iniciarPercivalViking);
