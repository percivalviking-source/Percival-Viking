/*
  Percival Viking
  assets/js/lotes.js

  Catálogo do lote LEGO.
  - Gera os cards automaticamente
  - Pesquisa por código ou nome
  - Filtra itens acima de R$ 75
  - Calcula quantidade, valor de referência, valor do lote e economia
  - Usa imagens em assets/img/lotes/

  IMPORTANTE:
  Como body-lotes.html é carregado dinamicamente, este script espera
  os elementos existirem antes de iniciar.
*/

(() => {
  "use strict";

  const itensLote = [
    {
      codigo: "sh0262",
      nome: "Crossbones",
      imagem: "assets/img/lotes/img001.jpg",
      quantidade: 14,
      condicao: "NOVO",
      referenciaInternacional: "US$ 9,43",
      conversao: "US$ 1 = R$ 5,10",
      valorBrasil: 92.71,
      valorLote: 30.00,
      observacao: "Minifigura nova."
    },
    {
      codigo: "60108-1 + cty0652",
      nome: "Moto Fire Response completa + bombeiro",
      imagem: "assets/img/lotes/img002.jpg",
      quantidade: 1,
      condicao: "NOVO",
      referenciaInternacional: "Referência composta do conjunto",
      conversao: "US$ 1 = R$ 5,10",
      valorBrasil: 60.00,
      valorLote: 30.00,
      observacao: "Componentes do set 60108-1 com minifigura cty0652."
    },
    {
      codigo: "colmar-12 / colmar12",
      nome: "Gamora with the Blade of Thanos + base e acessórios",
      imagem: "assets/img/lotes/img003.jpg",
      quantidade: 1,
      condicao: "NOVO",
      referenciaInternacional: "US$ 6,39",
      conversao: "US$ 1 = R$ 5,10",
      valorBrasil: 62.82,
      valorLote: 30.00,
      observacao: "Conjunto completo com suporte e acessórios."
    },
    {
      codigo: "sw1193",
      nome: "Bib Fortuna",
      imagem: "assets/img/lotes/img004.jpg",
      quantidade: 1,
      condicao: "NOVO",
      referenciaInternacional: "US$ 7,97",
      conversao: "US$ 1 = R$ 5,10",
      valorBrasil: 78.36,
      valorLote: 30.00,
      observacao: "Minifigura nova com acessório."
    },
    {
      codigo: "colmar2-3 / colmar15",
      nome: "Mr. Knight completo",
      imagem: "assets/img/lotes/img005.jpg",
      quantidade: 2,
      condicao: "NOVO",
      referenciaInternacional: "US$ 9,99",
      conversao: "US$ 1 = R$ 5,10",
      valorBrasil: 98.21,
      valorLote: 30.00,
      observacao: "Conjunto completo com base e acessórios."
    }

    /*
      PRÓXIMO ITEM:
      {
        codigo: "sw0554",
        nome: "Bith Musician + instrumento",
        imagem: "assets/img/lotes/img006.jpg",
        quantidade: 1,
        condicao: "NOVO",
        referenciaInternacional: "US$ 8,82",
        conversao: "US$ 1 = R$ 5,10",
        valorBrasil: 86.71,
        valorLote: 30.00,
        observacao: "Instrumento original incluído."
      }
    */
  ];

  const moeda = (valor) =>
    Number(valor).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL"
    });

  const percentual = (valor) =>
    Number(valor).toFixed(1).replace(".", ",") + "%";

  const normalizar = (texto) =>
    String(texto ?? "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .trim();

  function inserirEstilosDosCards() {
    if (document.getElementById("lotes-card-styles")) return;

    const style = document.createElement("style");
    style.id = "lotes-card-styles";

    style.textContent = `
      .lote-card {
        background: #fff;
        border: 1px solid #e7e7e7;
        border-radius: 16px;
        overflow: hidden;
        box-shadow: 0 5px 20px rgba(0,0,0,.05);
      }

      .lote-card-imagem-wrap {
        position: relative;
        background: #f2f2f2;
      }

      .lote-card img {
        display: block;
        width: 100%;
        aspect-ratio: 1 / 1;
        object-fit: cover;
      }

      .lote-badge {
        position: absolute;
        top: 12px;
        left: 12px;
        padding: 6px 9px;
        border-radius: 999px;
        background: rgba(255,255,255,.94);
        border: 1px solid rgba(0,0,0,.08);
        font-size: .75rem;
        font-weight: 700;
      }

      .lote-card-conteudo {
        padding: 17px;
      }

      .lote-card-codigo {
        color: #666;
        font-size: .83rem;
        margin-bottom: 6px;
      }

      .lote-card h2 {
        margin: 0 0 14px;
        font-size: 1.08rem;
        line-height: 1.35;
      }

      .lote-card-linha {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        gap: 14px;
        padding: 8px 0;
        border-top: 1px solid #eee;
        font-size: .9rem;
      }

      .lote-card-linha span:first-child {
        color: #707070;
      }

      .lote-card-linha strong,
      .lote-card-linha span:last-child {
        text-align: right;
      }

      .lote-card-preco {
        margin-top: 12px;
        background: #f4f4f4;
        border-radius: 10px;
        padding: 12px;
      }

      .lote-card-preco small {
        display: block;
        color: #666;
        margin-bottom: 4px;
      }

      .lote-card-preco strong {
        font-size: 1.25rem;
      }

      .lote-card-economia {
        margin-top: 9px;
        color: #444;
        font-size: .88rem;
      }

      .lote-card-alerta {
        margin-top: 10px;
        display: inline-block;
        padding: 5px 8px;
        border-radius: 7px;
        background: #f1f1f1;
        font-size: .76rem;
        font-weight: 700;
      }

      .lote-card-observacao {
        margin: 12px 0 0;
        color: #6d6d6d;
        font-size: .82rem;
        line-height: 1.45;
      }
    `;

    document.head.appendChild(style);
  }

  function criarCard(item) {
    const economiaUnidade = item.valorBrasil - item.valorLote;

    const desconto = item.valorBrasil > 0
      ? (economiaUnidade / item.valorBrasil) * 100
      : 0;

    const totalReferenciaItem =
      item.valorBrasil * item.quantidade;

    const totalLoteItem =
      item.valorLote * item.quantidade;

    const article = document.createElement("article");

    article.className = "lote-card";

    article.innerHTML = `
      <div class="lote-card-imagem-wrap">

        <img
          src="${item.imagem}"
          alt="${item.nome} - ${item.codigo}"
          loading="lazy"
          onerror="this.style.opacity='.18'; this.alt='Imagem ainda não adicionada';"
        >

        <span class="lote-badge">
          ${item.condicao}
        </span>

      </div>

      <div class="lote-card-conteudo">

        <div class="lote-card-codigo">
          Código:
          <strong>${item.codigo}</strong>
        </div>

        <h2>
          ${item.nome}
        </h2>

        <div class="lote-card-linha">
          <span>Quantidade</span>
          <strong>${item.quantidade}</strong>
        </div>

        <div class="lote-card-linha">
          <span>Referência NEW</span>
          <span>${item.referenciaInternacional}</span>
        </div>

        <div class="lote-card-linha">
          <span>Conversão usada</span>
          <span>${item.conversao}</span>
        </div>

        <div class="lote-card-linha">
          <span>Referência individual BR</span>
          <strong>${moeda(item.valorBrasil)}</strong>
        </div>

        <div class="lote-card-linha">
          <span>Total de referência</span>
          <strong>${moeda(totalReferenciaItem)}</strong>
        </div>

        <div class="lote-card-linha">
          <span>Total no lote</span>
          <strong>${moeda(totalLoteItem)}</strong>
        </div>

        <div class="lote-card-preco">

          <small>
            Valor por unidade dentro do lote
          </small>

          <strong>
            ${moeda(item.valorLote)}
          </strong>

          <div class="lote-card-economia">

            Economia por unidade:

            <strong>
              ${moeda(economiaUnidade)}
            </strong>

            (${percentual(desconto)})

          </div>

        </div>

        ${
          item.valorBrasil > 75
            ? `
              <span class="lote-card-alerta">
                Referência acima de R$ 75
              </span>
            `
            : ""
        }

        ${
          item.observacao
            ? `
              <p class="lote-card-observacao">
                ${item.observacao}
              </p>
            `
            : ""
        }

      </div>
    `;

    return article;
  }

  function iniciarCatalogo() {

    const catalogo =
      document.getElementById("lotes-catalogo");

    const pesquisa =
      document.getElementById("lotes-pesquisa");

    const filtro75 =
      document.getElementById("lotes-filtro-75");

    const vazio =
      document.getElementById("lotes-vazio");

    const status =
      document.getElementById("lotes-status");

    if (
      !catalogo ||
      !pesquisa ||
      !filtro75 ||
      !vazio ||
      !status
    ) {
      return false;
    }

    inserirEstilosDosCards();

    let somenteAcima75 = false;

    function atualizarTotais() {

      const totalQuantidade =
        itensLote.reduce(
          (soma, item) =>
            soma + item.quantidade,
          0
        );

      const totalReferencia =
        itensLote.reduce(
          (soma, item) =>
            soma +
            (item.valorBrasil * item.quantidade),
          0
        );

      const totalLote =
        itensLote.reduce(
          (soma, item) =>
            soma +
            (item.valorLote * item.quantidade),
          0
        );

      const totalEconomia =
        totalReferencia - totalLote;

      document
        .getElementById("lotes-total-quantidade")
        .textContent =
        totalQuantidade;

      document
        .getElementById("lotes-total-referencia")
        .textContent =
        moeda(totalReferencia);

      document
        .getElementById("lotes-total-lote")
        .textContent =
        moeda(totalLote);

      document
        .getElementById("lotes-total-economia")
        .textContent =
        moeda(totalEconomia);
    }

    function obterItensFiltrados() {

      const termo =
        normalizar(pesquisa.value);

      return itensLote.filter((item) => {

        const correspondePesquisa =
          !termo ||
          normalizar(item.codigo).includes(termo) ||
          normalizar(item.nome).includes(termo) ||
          normalizar(item.observacao).includes(termo);

        const correspondeFiltro =
          !somenteAcima75 ||
          item.valorBrasil > 75;

        return (
          correspondePesquisa &&
          correspondeFiltro
        );
      });
    }

    function renderizar() {

      const filtrados =
        obterItensFiltrados();

      catalogo.innerHTML = "";

      filtrados.forEach((item) => {
        catalogo.appendChild(
          criarCard(item)
        );
      });

      vazio.style.display =
        filtrados.length
          ? "none"
          : "block";

      const unidadesVisiveis =
        filtrados.reduce(
          (soma, item) =>
            soma + item.quantidade,
          0
        );

      status.textContent =
        `${filtrados.length} código(s) exibido(s) • ${unidadesVisiveis} unidade(s)`;
    }

    pesquisa.addEventListener(
      "input",
      renderizar
    );

    filtro75.addEventListener(
      "click",
      () => {

        somenteAcima75 =
          !somenteAcima75;

        filtro75.classList.toggle(
          "ativo",
          somenteAcima75
        );

        filtro75.setAttribute(
          "aria-pressed",
          String(somenteAcima75)
        );

        renderizar();
      }
    );

    atualizarTotais();

    renderizar();

    return true;
  }

  /*
    Como body-lotes.html entra via fetch,
    o script pode carregar antes
    de o partial existir.

    Por isso tentamos iniciar
    por alguns segundos.
  */

  let tentativas = 0;

  const maxTentativas = 80;

  function tentarIniciar() {

    if (iniciarCatalogo()) {
      return;
    }

    tentativas++;

    if (tentativas < maxTentativas) {

      setTimeout(
        tentarIniciar,
        100
      );

    } else {

      console.error(
        "Catálogo LEGO: body-lotes.html não foi encontrado para iniciar."
      );
    }
  }

  if (
    document.readyState === "loading"
  ) {

    document.addEventListener(
      "DOMContentLoaded",
      tentarIniciar
    );

  } else {

    tentarIniciar();
  }

  /*
    Disponibiliza os dados no console
    para conferência, se necessário.
  */

  window.PercivalLoteLEGO = {
    itens: itensLote
  };

})();
