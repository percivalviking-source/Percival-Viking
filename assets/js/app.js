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
    alvo.innerHTML = `
      <div class="error">
        Erro ao carregar ${arquivo}
      </div>
    `;

    console.error(erro);
  }
}

/* Menu mobile */

function abrirMenuMobile() {
  fecharBuscaSite();

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
}

/* Busca */

let artigosDaBusca = [];
let buscaCarregada = false;

function normalizarTexto(texto) {
  return String(texto || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function escaparHTML(texto) {
  return String(texto || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

async function carregarArtigosBusca() {
  if (buscaCarregada) {
    return;
  }

  const resposta = await fetch("/data/artigos.json");

  if (!resposta.ok) {
    throw new Error("Falha ao carregar artigos da busca.");
  }

  artigosDaBusca = await resposta.json();
  buscaCarregada = true;
}

function obterUrlArtigo(artigo) {
  if (artigo.url) {
    return artigo.url;
  }

  if (artigo.slug) {
    return `/artigos/${artigo.slug}.html`;
  }

  return "#";
}

function ordenarArtigosPorData(artigos) {
  return [...artigos].sort(function (a, b) {
    return new Date(b.data) - new Date(a.data);
  });
}

function renderizarResultadosBusca(termo = "") {
  const resultadosEl = document.querySelector("[data-search-results]");
  const statusEl = document.querySelector("[data-search-status]");

  if (!resultadosEl || !statusEl) {
    return;
  }

  const termoLimpo = termo.trim();
  const termoNormalizado = normalizarTexto(termoLimpo);

  let resultados = ordenarArtigosPorData(artigosDaBusca);

  if (termoNormalizado.length >= 2) {
    resultados = resultados.filter(function (artigo) {
      const textoCompleto = normalizarTexto(`
        ${artigo.titulo}
        ${artigo.categoria}
        ${artigo.resumo}
        ${artigo.fonte}
      `);

      return textoCompleto.includes(termoNormalizado);
    });

    statusEl.textContent =
      `${resultados.length} resultado(s) para “${termoLimpo}”.`;
  } else {
    resultados = resultados.slice(0, 5);
    statusEl.textContent = "Últimos artigos publicados.";
  }

  if (resultados.length === 0) {
    resultadosEl.innerHTML = `
      <div class="search-empty">
        Nenhum artigo encontrado. Tente buscar por Copa, Pokémon, LEGO, TCG ou Colecionismo.
      </div>
    `;

    return;
  }

  resultadosEl.innerHTML = resultados
    .slice(0, 8)
    .map(function (artigo) {
      return `
        <a
          class="search-result"
          href="${escaparHTML(obterUrlArtigo(artigo))}"
        >
          <span class="search-result-category">
            ${escaparHTML(artigo.categoria || "Artigo")}
          </span>

          <h3 class="search-result-title">
            ${escaparHTML(artigo.titulo || "Sem título")}
          </h3>

          <p class="search-result-summary">
            ${escaparHTML(artigo.resumo || "")}
          </p>
        </a>
      `;
    })
    .join("");
}

async function abrirBuscaSite() {
  fecharMenuMobile();

  document.body.classList.add("search-open");

  const botaoBusca = document.querySelector("[data-search-open]");

  if (botaoBusca) {
    botaoBusca.setAttribute("aria-expanded", "true");
    botaoBusca.setAttribute("aria-label", "Fechar busca");
  }

  try {
    await carregarArtigosBusca();
    renderizarResultadosBusca("");
  } catch (erro) {
    const resultadosEl = document.querySelector("[data-search-results]");
    const statusEl = document.querySelector("[data-search-status]");

    if (statusEl) {
      statusEl.textContent =
        "Não foi possível carregar a busca agora.";
    }

    if (resultadosEl) {
      resultadosEl.innerHTML = `
        <div class="search-empty">
          Erro ao carregar os artigos da busca.
        </div>
      `;
    }

    console.error(erro);
  }

  setTimeout(function () {
    const campoBusca = document.querySelector("[data-search-input]");

    if (campoBusca) {
      campoBusca.focus();
    }
  }, 80);
}

function fecharBuscaSite() {
  document.body.classList.remove("search-open");

  const botaoBusca = document.querySelector("[data-search-open]");

  if (botaoBusca) {
    botaoBusca.setAttribute("aria-expanded", "false");
    botaoBusca.setAttribute("aria-label", "Buscar");
  }
}

function iniciarBuscaSite() {
  document.addEventListener("click", function (evento) {
    const botaoAbrir = evento.target.closest("[data-search-open]");
    const botaoFechar = evento.target.closest("[data-search-close]");
    const linkResultado = evento.target.closest(".search-result");

    if (botaoAbrir) {
      const buscaAberta = document.body.classList.contains("search-open");

      if (buscaAberta) {
        fecharBuscaSite();
      } else {
        abrirBuscaSite();
      }
    }

    if (botaoFechar || linkResultado) {
      fecharBuscaSite();
    }
  });

  document.addEventListener("input", function (evento) {
    const campoBusca = evento.target.closest("[data-search-input]");

    if (campoBusca) {
      renderizarResultadosBusca(campoBusca.value);
    }
  });
}

/* Inicialização */

async function iniciarPercivalViking() {
  const parciais = [
    ...document.querySelectorAll("[data-partial]")
  ];

  for (const parcial of parciais) {
    await carregarParcial(parcial);
  }

  iniciarMenuMobile();
  iniciarBuscaSite();

  if (typeof carregarFeedHome === "function") {
    await carregarFeedHome();
  }

  if (typeof carregarFeedCategoria === "function") {
    await carregarFeedCategoria();
  }
}

document.addEventListener("keydown", function (evento) {
  if (evento.key === "Escape") {
    fecharMenuMobile();
    fecharBuscaSite();
  }
});

document.addEventListener(
  "DOMContentLoaded",
  iniciarPercivalViking
);
