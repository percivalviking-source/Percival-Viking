# Percival Viking MVP

Primeiro teste estático do portal.

## Testar localmente

Não abra o index direto como arquivo. Como usamos fetch, rode com servidor:

```bash
python -m http.server 8000
```

Depois abra:

```text
http://localhost:8000
```

## Fluxo

- `index.html` é a shell.
- `partials/cabecalho.html`, `partials/body-home.html` e `partials/rodape.html` entram por fetch.
- `assets/js/feed.js` lê `data/artigos.json`.
- A home monta os cards automaticamente.
