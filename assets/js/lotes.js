/*
  ==========================================================
  PERCIVAL VIKING
  assets/js/lotes.js

  Catálogo LEGO
  ==========================================================

  DADOS:
  data/lotes.json

  FUNÇÕES:
  - Carrega o catálogo via JSON
  - Gera os cards automaticamente
  - Pesquisa por código, nome, tema, set e observação
  - Filtra itens acima do limite do lote médio
  - Calcula totais automaticamente
  - Abre modal com ficha completa
  - Fecha modal pelo X, fundo ou tecla ESC
  - Funciona com atualização futura somente do JSON
  ==========================================================
*/

(() => {

  "use strict";


  /*
    ==========================================================
    CONFIGURAÇÃO
    ==========================================================
  */

  const CAMINHO_JSON = "data/lotes.json";


  /*
    ==========================================================
    VARIÁVEIS
    ==========================================================
  */

  let dadosCatalogo = null;

  let itensLote = [];

  let configuracao = {};

  let somenteAcimaLimite = false;



  /*
    ==========================================================
    ELEMENTOS DA PÁGINA
    ==========================================================
  */

  const catalogo =
    document.getElementById("lotes-catalogo");

  const pesquisa =
    document.getElementById("lotes-pesquisa");

  const filtroLimite =
    document.getElementById("lotes-filtro-75");

  const vazio =
    document.getElementById("lotes-vazio");

  const status =
    document.getElementById("lotes-status");



  /*
    ==========================================================
    UTILIDADES
    ==========================================================
  */

  function moeda(valor) {

    return Number(valor || 0).toLocaleString(
      "pt-BR",
      {
        style: "currency",
        currency: "BRL"
      }
    );

  }



  function dolar(valor) {

    if (
      valor === null ||
      valor === undefined ||
      valor === ""
    ) {

      return "Referência composta";

    }

    return Number(valor).toLocaleString(
      "pt-BR",
      {
        style: "currency",
        currency: "USD"
      }
    );

  }



  function percentual(valor) {

    return (
      Number(valor || 0)
        .toFixed(1)
        .replace(".", ",")
      + "%"
    );

  }



  function normalizar(texto) {

    return String(texto ?? "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .trim();

  }



  function escaparHTML(texto) {

    return String(texto ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");

  }



  /*
    ==========================================================
    REFERÊNCIA INTERNACIONAL
    ==========================================================
  */

  function textoReferencia(item) {

    const referencia =
      item.referenciaInternacional;

    if (!referencia) {

      return "Não informada";

    }

    if (
      referencia.valor === null ||
      referencia.valor === undefined
    ) {

      return referencia.tipo
        || "Referência composta";

    }

    return `${dolar(referencia.valor)} • ${referencia.tipo || "NEW"}`;

  }



  /*
    ==========================================================
    CONVERSÃO INTERNACIONAL
    ==========================================================
  */

  function valorConvertido(item) {

    const referencia =
      item.referenciaInternacional;

    const cotacao =
      Number(configuracao.cotacaoDolar || 0);

    if (
      !referencia ||
      referencia.valor === null ||
      referencia.valor === undefined ||
      !cotacao
    ) {

      return null;

    }

    return (
      Number(referencia.valor) *
      cotacao
    );

  }



  /*
    ==========================================================
    ESTILOS DOS CARDS E MODAL
    ==========================================================
  */

  function inserirEstilos() {

    if (
      document.getElementById(
        "lotes-js-styles"
      )
    ) {

      return;

    }


    const style =
      document.createElement("style");

    style.id =
      "lotes-js-styles";


    style.textContent = `

      /*
        =========================
        CARDS
        =========================
      */

      .lote-card {

        background: #fff;

        border:
          1px solid #e7e7e7;

        border-radius: 16px;

        overflow: hidden;

        box-shadow:
          0 5px 20px
          rgba(0,0,0,.05);

        cursor: pointer;

        transition:
          transform .18s ease,
          box-shadow .18s ease;

      }


      .lote-card:hover {

        transform:
          translateY(-2px);

        box-shadow:
          0 8px 26px
          rgba(0,0,0,.08);

      }


      .lote-card:focus-visible {

        outline:
          3px solid #333;

        outline-offset:
          3px;

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

        padding:
          6px 9px;

        border-radius:
          999px;

        background:
          rgba(255,255,255,.95);

        border:
          1px solid
          rgba(0,0,0,.08);

        font-size:
          .75rem;

        font-weight:
          700;

      }


      .lote-badge-numero {

        position: absolute;

        top: 12px;

        right: 12px;

        padding:
          6px 10px;

        border-radius:
          999px;

        background:
          #1a1a1a;

        color:
          #fff;

        border:
          1px solid
          rgba(0,0,0,.15);

        font-size:
          .78rem;

        font-weight:
          700;

        letter-spacing:
          0.3px;

      }


      .lote-card-conteudo {

        padding:
          17px;

      }


      .lote-card-codigo {

        color:
          #666;

        font-size:
          .83rem;

        margin-bottom:
          6px;

      }


      .lote-card h2 {

        margin:
          0 0 14px;

        font-size:
          1.08rem;

        line-height:
          1.35;

      }


      .lote-card-linha {

        display:
          flex;

        align-items:
          flex-start;

        justify-content:
          space-between;

        gap:
          14px;

        padding:
          8px 0;

        border-top:
          1px solid #eee;

        font-size:
          .9rem;

      }


      .lote-card-linha span:first-child {

        color:
          #707070;

      }


      .lote-card-linha strong,
      .lote-card-linha span:last-child {

        text-align:
          right;

      }


      .lote-card-preco {

        margin-top:
          12px;

        background:
          #f4f4f4;

        border-radius:
          10px;

        padding:
          12px;

      }


      .lote-card-preco small {

        display:
          block;

        color:
          #666;

        margin-bottom:
          4px;

      }


      .lote-card-preco strong {

        font-size:
          1.25rem;

      }


      .lote-card-economia {

        margin-top:
          9px;

        color:
          #444;

        font-size:
          .88rem;

      }


      .lote-card-alerta {

        margin-top:
          10px;

        display:
          inline-block;

        padding:
          5px 8px;

        border-radius:
          7px;

        background:
          #f1f1f1;

        font-size:
          .76rem;

        font-weight:
          700;

      }


      .lote-card-observacao {

        margin:
          12px 0 0;

        color:
          #6d6d6d;

        font-size:
          .82rem;

        line-height:
          1.45;

      }



      /*
        =========================
        MODAL
        =========================
      */

      .lotes-modal {

        position:
          fixed;

        inset:
          0;

        z-index:
          99999;

        display:
          none;

        align-items:
          center;

        justify-content:
          center;

        padding:
          20px;

        background:
          rgba(0,0,0,.68);

      }


      .lotes-modal.aberto {

        display:
          flex;

      }


      .lotes-modal-caixa {

        position:
          relative;

        width:
          min(760px, 100%);

        max-height:
          92vh;

        overflow-y:
          auto;

        background:
          #fff;

        border-radius:
          18px;

        box-shadow:
          0 20px 70px
          rgba(0,0,0,.32);

      }


      .lotes-modal-fechar {

        position:
          absolute;

        top:
          12px;

        right:
          12px;

        z-index:
          2;

        width:
          42px;

        height:
          42px;

        border:
          none;

        border-radius:
          50%;

        background:
          rgba(255,255,255,.94);

        font-size:
          1.5rem;

        line-height:
          1;

        cursor:
          pointer;

        box-shadow:
          0 2px 10px
          rgba(0,0,0,.12);

      }


      .lotes-modal-imagem {

        width:
          100%;

        max-height:
          460px;

        object-fit:
          contain;

        display:
          block;

        background:
          #f4f4f4;

      }


      .lotes-modal-conteudo {

        padding:
          22px;

      }


      .lotes-modal-codigo {

        color:
          #666;

        font-size:
          .88rem;

        margin-bottom:
          6px;

      }


      .lotes-modal-conteudo h2 {

        margin:
          0 0 18px;

        font-size:
          1.45rem;

      }


      .lotes-modal-grid {

        display:
          grid;

        grid-template-columns:
          repeat(2,1fr);

        gap:
          10px;

      }


      .lotes-modal-item {

        background:
          #f6f6f6;

        border-radius:
          10px;

        padding:
          12px;

      }


      .lotes-modal-item small {

        display:
          block;

        color:
          #666;

        margin-bottom:
          5px;

      }


      .lotes-modal-item strong {

        display:
          block;

        line-height:
          1.4;

      }


      .lotes-modal-preco {

        margin-top:
          16px;

        padding:
          16px;

        background:
          #f2f2f2;

        border-radius:
          12px;

      }


      .lotes-modal-preco small {

        display:
          block;

        color:
          #666;

        margin-bottom:
          5px;

      }


      .lotes-modal-preco strong {

        font-size:
          1.55rem;

      }


      .lotes-modal-nota {

        margin-top:
          16px;

        color:
          #666;

        line-height:
          1.55;

        font-size:
          .88rem;

      }


      body.lotes-modal-travado {

        overflow:
          hidden;

      }


      @media
      (max-width: 620px) {

        .lotes-modal {

          padding:
            10px;

        }


        .lotes-modal-caixa {

          border-radius:
            14px;

        }


        .lotes-modal-grid {

          grid-template-columns:
            1fr;

        }


        .lotes-modal-conteudo {

          padding:
            18px;

        }

      }

    `;


    document.head.appendChild(
      style
    );

  }



  /*
    ==========================================================
    CRIAR MODAL
    ==========================================================
  */

  function criarModal() {

    if (
      document.getElementById(
        "lotes-modal"
      )
    ) {

      return;

    }


    const modal =
      document.createElement("div");


    modal.id =
      "lotes-modal";


    modal.className =
      "lotes-modal";


    modal.setAttribute(
      "aria-hidden",
      "true"
    );


    modal.innerHTML = `

      <div
        class="lotes-modal-caixa"
        role="dialog"
        aria-modal="true"
        aria-labelledby="lotes-modal-titulo"
      >

        <button
          type="button"
          class="lotes-modal-fechar"
          id="lotes-modal-fechar"
          aria-label="Fechar detalhes"
        >
          ×
        </button>


        <div
          id="lotes-modal-corpo"
        ></div>

      </div>

    `;


    document.body.appendChild(
      modal
    );


    const botaoFechar =
      document.getElementById(
        "lotes-modal-fechar"
      );


    botaoFechar.addEventListener(
      "click",
      fecharModal
    );


    modal.addEventListener(
      "click",
      (evento) => {

        if (
          evento.target === modal
        ) {

          fecharModal();

        }

      }
    );


    document.addEventListener(
      "keydown",
      (evento) => {

        if (
          evento.key === "Escape" &&
          modal.classList.contains("aberto")
        ) {

          fecharModal();

        }

      }
    );

  }



  /*
    ==========================================================
    ABRIR MODAL
    ==========================================================
  */

  function abrirModal(item) {

    const modal =
      document.getElementById(
        "lotes-modal"
      );


    const corpo =
      document.getElementById(
        "lotes-modal-corpo"
      );


    if (
      !modal ||
      !corpo
    ) {

      return;

    }


    const economia =
      Number(item.valorBrasil) -
      Number(item.valorLote);


    const desconto =
      item.valorBrasil > 0
        ? (
            economia /
            item.valorBrasil
          ) * 100
        : 0;


    const totalReferencia =
      Number(item.valorBrasil) *
      Number(item.quantidade);


    const totalLote =
      Number(item.valorLote) *
      Number(item.quantidade);


    const convertido =
      valorConvertido(item);


    corpo.innerHTML = `

      <img
        class="lotes-modal-imagem"
        src="${escaparHTML(item.imagem)}"
        alt="${escaparHTML(item.nome)}"
      >


      <div
        class="lotes-modal-conteudo"
      >

        <div
          class="lotes-modal-codigo"
        >
          ${item.numero ? `<strong style="color:#111;margin-right:8px;">${escaparHTML(item.numero)}</strong>` : ""}
          Código:
          <strong>
            ${escaparHTML(item.codigo)}
          </strong>
        </div>


        <h2
          id="lotes-modal-titulo"
        >
          ${escaparHTML(item.nome)}
        </h2>


        <div
          class="lotes-modal-grid"
        >


          <div
            class="lotes-modal-item"
          >
            <small>
              Condição
            </small>

            <strong>
              ${escaparHTML(item.condicao)}
            </strong>
          </div>


          <div
            class="lotes-modal-item"
          >
            <small>
              Quantidade
            </small>

            <strong>
              ${item.quantidade}
            </strong>
          </div>


          <div
            class="lotes-modal-item"
          >
            <small>
              Tema
            </small>

            <strong>
              ${escaparHTML(item.tema || "Não informado")}
            </strong>
          </div>


          <div
            class="lotes-modal-item"
          >
            <small>
              Set de origem
            </small>

            <strong>
              ${escaparHTML(item.setOrigem || "Não informado")}
            </strong>
          </div>


          <div
            class="lotes-modal-item"
          >
            <small>
              Referência internacional
            </small>

            <strong>
              ${escaparHTML(textoReferencia(item))}
            </strong>
          </div>


          <div
            class="lotes-modal-item"
          >
            <small>
              Cotação utilizada
            </small>

            <strong>
              US$ 1 = ${moeda(configuracao.cotacaoDolar)}
            </strong>
          </div>


          <div
            class="lotes-modal-item"
          >
            <small>
              Conversão antes da tributação
            </small>

            <strong>
              ${
                convertido !== null
                  ? moeda(convertido)
                  : "Referência composta"
              }
            </strong>
          </div>


          <div
            class="lotes-modal-item"
          >
            <small>
              Referência individual BR
            </small>

            <strong>
              ${moeda(item.valorBrasil)}
            </strong>
          </div>


          <div
            class="lotes-modal-item"
          >
            <small>
              Total individual
            </small>

            <strong>
              ${moeda(totalReferencia)}
            </strong>
          </div>


          <div
            class="lotes-modal-item"
          >
            <small>
              Total dentro do lote
            </small>

            <strong>
              ${moeda(totalLote)}
            </strong>
          </div>


        </div>


        <div
          class="lotes-modal-preco"
        >

          <small>
            Valor por unidade dentro do lote
          </small>

          <strong>
            ${moeda(item.valorLote)}
          </strong>

          <div
            style="
              margin-top:8px;
              font-size:.9rem;
            "
          >
            Economia por unidade:
            <strong>
              ${moeda(economia)}
            </strong>

            • ${percentual(desconto)}
          </div>

        </div>


        ${
          item.observacao
            ? `
              <p
                class="lotes-modal-nota"
              >
                ${escaparHTML(item.observacao)}
              </p>
            `
            : ""
        }


        ${
          configuracao.observacaoMetodologia
            ? `
              <p
                class="lotes-modal-nota"
              >
                ${escaparHTML(
                  configuracao.observacaoMetodologia
                )}
              </p>
            `
            : ""
        }


      </div>

    `;


    modal.classList.add(
      "aberto"
    );


    modal.setAttribute(
      "aria-hidden",
      "false"
    );


    document.body.classList.add(
      "lotes-modal-travado"
    );

  }



  /*
    ==========================================================
    FECHAR MODAL
    ==========================================================
  */

  function fecharModal() {

    const modal =
      document.getElementById(
        "lotes-modal"
      );


    if (!modal) {

      return;

    }


    modal.classList.remove(
      "aberto"
    );


    modal.setAttribute(
      "aria-hidden",
      "true"
    );


    document.body.classList.remove(
      "lotes-modal-travado"
    );

  }



  /*
    ==========================================================
    CRIAR CARD
    ==========================================================
  */

  function criarCard(item) {

    const economia =
      Number(item.valorBrasil) -
      Number(item.valorLote);


    const desconto =
      item.valorBrasil > 0
        ? (
            economia /
            item.valorBrasil
          ) * 100
        : 0;


    const totalReferencia =
      Number(item.valorBrasil) *
      Number(item.quantidade);


    const totalLote =
      Number(item.valorLote) *
      Number(item.quantidade);


    const limite =
      Number(
        configuracao.limiteLoteMedio || 75
      );


    const article =
      document.createElement("article");


    article.className =
      "lote-card";


    article.tabIndex =
      0;


    article.setAttribute(
      "role",
      "button"
    );


    article.setAttribute(
      "aria-label",
      `Ver detalhes de ${item.nome}`
    );


    article.innerHTML = `

      <div
        class="lote-card-imagem-wrap"
      >

        <img
          src="${escaparHTML(item.imagem)}"
          alt="${escaparHTML(item.nome)} - ${escaparHTML(item.codigo)}"
          loading="lazy"
        >

        <span
          class="lote-badge"
        >
          ${escaparHTML(item.condicao)}
        </span>

        ${
          item.numero
            ? `
              <span
                class="lote-badge-numero"
              >
                ${escaparHTML(item.numero)}
              </span>
            `
            : ""
        }

      </div>


      <div
        class="lote-card-conteudo"
      >

        <div
          class="lote-card-codigo"
        >
          ${item.numero ? `<strong style="color:#111;margin-right:6px;">${escaparHTML(item.numero)}</strong>` : ""}
          Código:
          <strong>
            ${escaparHTML(item.codigo)}
          </strong>
        </div>


        <h2>
          ${escaparHTML(item.nome)}
        </h2>


        <div
          class="lote-card-linha"
        >
          <span>
            Quantidade
          </span>

          <strong>
            ${item.quantidade}
          </strong>
        </div>


        <div
          class="lote-card-linha"
        >
          <span>
            Referência NEW
          </span>

          <span>
            ${escaparHTML(textoReferencia(item))}
          </span>
        </div>


        <div
          class="lote-card-linha"
        >
          <span>
            Referência individual BR
          </span>

          <strong>
            ${moeda(item.valorBrasil)}
          </strong>
        </div>


        <div
          class="lote-card-linha"
        >
          <span>
            Total de referência
          </span>

          <strong>
            ${moeda(totalReferencia)}
          </strong>
        </div>


        <div
          class="lote-card-linha"
        >
          <span>
            Total no lote
          </span>

          <strong>
            ${moeda(totalLote)}
          </strong>
        </div>


        <div
          class="lote-card-preco"
        >

          <small>
            Valor por unidade no lote
          </small>

          <strong>
            ${moeda(item.valorLote)}
          </strong>


          <div
            class="lote-card-economia"
          >

            Economia por unidade:

            <strong>
              ${moeda(economia)}
            </strong>

            (${percentual(desconto)})

          </div>

        </div>


        ${
          Number(item.valorBrasil) >
          limite

            ? `
              <span
                class="lote-card-alerta"
              >
                Referência acima de
                ${moeda(limite)}
              </span>
            `

            : ""
        }


        ${
          item.observacao

            ? `
              <p
                class="lote-card-observacao"
              >
                ${escaparHTML(item.observacao)}
              </p>
            `

            : ""
        }

      </div>

    `;


    article.addEventListener(
      "click",
      () => abrirModal(item)
    );


    article.addEventListener(
      "keydown",
      (evento) => {

        if (
          evento.key === "Enter" ||
          evento.key === " "
        ) {

          evento.preventDefault();

          abrirModal(item);

        }

      }
    );


    return article;

  }



  /*
    ==========================================================
    TOTAIS
    ==========================================================
  */

  function atualizarTotais() {

    const totalQuantidade =
      itensLote.reduce(
        (soma, item) =>
          soma +
          Number(item.quantidade || 0),
        0
      );


    const totalReferencia =
      itensLote.reduce(
        (soma, item) =>
          soma +
          (
            Number(item.valorBrasil || 0) *
            Number(item.quantidade || 0)
          ),
        0
      );


    const totalLote =
      itensLote.reduce(
        (soma, item) =>
          soma +
          (
            Number(item.valorLote || 0) *
            Number(item.quantidade || 0)
          ),
        0
      );


    const totalEconomia =
      totalReferencia -
      totalLote;


    const campoQuantidade =
      document.getElementById(
        "lotes-total-quantidade"
      );


    const campoReferencia =
      document.getElementById(
        "lotes-total-referencia"
      );


    const campoLote =
      document.getElementById(
        "lotes-total-lote"
      );


    const campoEconomia =
      document.getElementById(
        "lotes-total-economia"
      );


    if (campoQuantidade) {

      campoQuantidade.textContent =
        totalQuantidade;

    }


    if (campoReferencia) {

      campoReferencia.textContent =
        moeda(totalReferencia);

    }


    if (campoLote) {

      campoLote.textContent =
        moeda(totalLote);

    }


    if (campoEconomia) {

      campoEconomia.textContent =
        moeda(totalEconomia);

    }

  }



  /*
    ==========================================================
    PESQUISA E FILTRO
    ==========================================================
  */

  function obterItensFiltrados() {

    const termo =
      normalizar(
        pesquisa?.value
      );


    const limite =
      Number(
        configuracao.limiteLoteMedio || 75
      );


    return itensLote.filter(
      (item) => {


        const camposPesquisa = [

          item.codigo,

          item.nome,

          item.tema,

          item.setOrigem,

          item.observacao,

          item.id,

          item.numero

        ];


        const correspondePesquisa =
          !termo ||
          camposPesquisa.some(
            (campo) =>
              normalizar(campo)
                .includes(termo)
          );


        const correspondeFiltro =
          !somenteAcimaLimite ||
          Number(item.valorBrasil) >
          limite;


        return (
          correspondePesquisa &&
          correspondeFiltro
        );

      }
    );

  }



  /*
    ==========================================================
    RENDERIZAR
    ==========================================================
  */

  function renderizar() {

    if (!catalogo) {

      return;

    }


    const filtrados =
      obterItensFiltrados();


    catalogo.innerHTML =
      "";


    filtrados.forEach(
      (item) => {

        catalogo.appendChild(
          criarCard(item)
        );

      }
    );


    if (vazio) {

      vazio.style.display =
        filtrados.length
          ? "none"
          : "block";

    }


    const unidadesVisiveis =
      filtrados.reduce(
        (soma, item) =>
          soma +
          Number(item.quantidade || 0),
        0
      );


    if (status) {

      status.textContent =
        `${filtrados.length} código(s) exibido(s) • ${unidadesVisiveis} unidade(s)`;

    }

  }



  /*
    ==========================================================
    CARREGAR JSON
    ==========================================================
  */

  async function carregarDados() {

    const resposta =
      await fetch(
        CAMINHO_JSON,
        {
          cache: "no-store"
        }
      );


    if (!resposta.ok) {

      throw new Error(
        `Erro ${resposta.status} ao carregar ${CAMINHO_JSON}`
      );

    }


    dadosCatalogo =
      await resposta.json();


    configuracao =
      dadosCatalogo.catalogo || {};


    itensLote =
      Array.isArray(
        dadosCatalogo.itens
      )
        ? dadosCatalogo.itens
        : [];

  }



  /*
    ==========================================================
    EVENTOS
    ==========================================================
  */

  function configurarEventos() {

    if (pesquisa) {

      pesquisa.addEventListener(
        "input",
        renderizar
      );

    }


    if (filtroLimite) {

      const limite =
        Number(
          configuracao.limiteLoteMedio || 75
        );


      filtroLimite.textContent =
        `Acima de ${moeda(limite)}`;


      filtroLimite.addEventListener(
        "click",
        () => {


          somenteAcimaLimite =
            !somenteAcimaLimite;


          filtroLimite.classList.toggle(
            "ativo",
            somenteAcimaLimite
          );


          filtroLimite.setAttribute(
            "aria-pressed",
            String(
              somenteAcimaLimite
            )
          );


          renderizar();

        }
      );

    }

  }



  /*
    ==========================================================
    ERRO
    ==========================================================
  */

  function mostrarErro(erro) {

    console.error(
      "Catálogo LEGO:",
      erro
    );


    if (catalogo) {

      catalogo.innerHTML = `

        <div
          style="
            grid-column:1/-1;
            padding:24px;
            background:#fff;
            border:1px solid #e4e4e4;
            border-radius:12px;
            color:#666;
            text-align:center;
          "
        >

          Não foi possível carregar
          os dados do catálogo.

        </div>

      `;

    }


    if (status) {

      status.textContent =
        "Erro ao carregar catálogo.";

    }

  }



  /*
    ==========================================================
    INICIAR
    ==========================================================
  */

  async function iniciar() {

    try {


      if (
        !catalogo ||
        !pesquisa
      ) {

        throw new Error(
          "Elementos do body-lotes.html não encontrados."
        );

      }


      inserirEstilos();


      criarModal();


      await carregarDados();


      atualizarTotais();


      configurarEventos();


      renderizar();


      /*
        Disponibiliza dados no console
        para conferência técnica.
      */

      window.PercivalLoteLEGO = {

        catalogo:
          configuracao,

        itens:
          itensLote,

        atualizar:
          iniciar

      };


      console.log(
        `Catálogo LEGO carregado: ${itensLote.length} códigos.`
      );


    }

    catch (erro) {

      mostrarErro(
        erro
      );

    }

  }



  /*
    ==========================================================
    START
    ==========================================================
  */

  iniciar();


})();
