function dataBR(data) {
  return new Date(`${data}T12:00:00`).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric"
  });
}

function meta(artigo) {
  return `
    <div class="meta-row">
      <span>${artigo.fonte || "Percival Viking"}</span>
      <span class="dot"></span>
      <time datetime="${artigo.data}">
        ${dataBR(artigo.data)}
      </time>
    </div>
  `;
}

function hero(artigo) {
  return `
    <article class="hero-card">
      <a href="${artigo.url}">
        <img
          class="hero-cover"
          src="${artigo.capa}"
          alt="${artigo.alt || artigo.titulo}"
          loading="eager"
        >
      </a>

      <div class="hero-body">
        <span class="category">${artigo.categoria}</span>

        <a href="${artigo.url}">
          <h2 class="hero-title">${artigo.titulo}</h2>
        </a>

        <p class="excerpt">${artigo.resumo}</p>

        <div class="share-row">
          ${meta(artigo)}

          <button
            class="share-button"
            type="button"
            data-share="${artigo.url}"
            data-title="${artigo.titulo}"
          >
            Compartilhar
          </button>
        </div>
      </div>
    </article>
  `;
}

function card(artigo) {
  return `
    <article class="news-card">
      <a href="${artigo.url}">
        <img
          class="news-cover"
          src="${artigo.capa}"
          alt="${artigo.alt || artigo.titulo}"
          loading="lazy"
        >

        <div class="news-body">
          <span class="category">${artigo.categoria}</span>

          <h3 class="news-title">
            ${artigo.titulo}
          </h3>

          <p class="excerpt">
            ${artigo.resumo}
          </p>

          ${meta(artigo)}
        </div>
      </a>
    </article>
  `;
}

function compact(artigo) {
  return `
    <article class="compact-card">
      <a href="${artigo.url}">
        <img
          class="compact-cover"
          src="${artigo.capa}"
          alt="${artigo.alt || artigo.titulo}"
          loading="lazy"
        >

        <div class="compact-body">
          <span class="category">${artigo.categoria}</span>

          <h3 class="compact-title">
            ${artigo.titulo}
          </h3>

          ${meta(artigo)}
        </div>
      </a>
    </article>
  `;
}

function normalizarCategoria(texto) {
  return String(texto || "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

async function compartilhar(url, titulo) {
  const link = new URL(url, location.origin).href;

  try {
    if (navigator.share) {
      await navigator.share({
        title: titulo,
        url: link
      });

      return;
    }

    await navigator.clipboard.writeText(link);
    alert("Link copiado.");
  } catch (erro) {
    console.error("Não foi possível compartilhar o artigo.", erro);
  }
}

function ativarShare() {
  document.querySelectorAll("[data-share]").forEach(function (botao) {
    if (botao.dataset.shareAtivo === "true") {
      return;
    }

    botao.dataset.shareAtivo = "true";

    botao.addEventListener("click", function () {
      compartilhar(
        botao.dataset.share,
        botao.dataset.title
      );
    });
  });
}

async function carregarArtigos() {
  const resposta = await fetch("/data/artigos.json");

  if (!resposta.ok) {
    throw new Error("Falha ao carregar artigos.json");
  }

  const artigos = await resposta.json();

  return artigos.sort(function (a, b) {
    return new Date(b.data) - new Date(a.data);
  });
}

async function carregarFeedHome() {
  const destaque = document.querySelector("#destaque-principal");
  const alta = document.querySelector("#feed-em-alta");
  const recentes = document.querySelector("#feed-recentes");

  if (!destaque || !alta || !recentes) {
    return;
  }

  destaque.innerHTML = `
    <div class="loading">
      Carregando destaque...
    </div>
  `;

  alta.innerHTML = `
    <div class="loading">
      Carregando artigos...
    </div>
  `;

  recentes.innerHTML = `
    <div class="loading">
      Carregando recentes...
    </div>
  `;

  try {
    const artigos = await carregarArtigos();

    destaque.innerHTML = artigos[0]
      ? hero(artigos[0])
      : "";

    alta.innerHTML = artigos
      .slice(1, 4)
      .map(card)
      .join("");

    recentes.innerHTML = artigos
      .slice(4, 10)
      .map(compact)
      .join("");

    ativarShare();
  } catch (erro) {
    console.error(erro);

    destaque.innerHTML = `
      <div class="error">
        Não consegui carregar os artigos agora.
      </div>
    `;

    alta.innerHTML = "";
    recentes.innerHTML = "";
  }
}

async function carregarFeedCategoria() {
  const containers = [
    ...document.querySelectorAll("[data-category-feed]")
  ];

  if (containers.length === 0) {
    return;
  }

  containers.forEach(function (container) {
    container.innerHTML = `
      <div class="loading">
        Carregando artigos...
      </div>
    `;
  });

  try {
    const artigos = await carregarArtigos();

    containers.forEach(function (container) {
      const categoriaDesejada = normalizarCategoria(
        container.dataset.categoryFeed
      );

      const artigosDaCategoria = artigos.filter(function (artigo) {
        return (
          normalizarCategoria(artigo.categoria) === categoriaDesejada
        );
      });

      if (artigosDaCategoria.length === 0) {
        container.innerHTML = `
          <div class="error">
            Ainda não há artigos publicados nesta categoria.
          </div>
        `;

        return;
      }

      container.innerHTML = artigosDaCategoria
        .map(card)
        .join("");
    });

    ativarShare();
  } catch (erro) {
    console.error(erro);

    containers.forEach(function (container) {
      container.innerHTML = `
        <div class="error">
          Não consegui carregar os artigos desta categoria agora.
        </div>
      `;
    });
  }
}
