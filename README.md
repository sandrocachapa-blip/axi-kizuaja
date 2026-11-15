# AXI Lwanda × KizuaJá — loja online

Loja da parceria AXI Lwanda × KizuaJá (KizuaJá é uma empresa do grupo EventBoxAngola), com reservas da AXI Gin School.

- `index.html` — a página (imagens embutidas, sem build).
- `api/reservas.js` — reservas da Gin School: `GET` ocupação, `POST` nova reserva (verifica as 12 vagas por sessão), `GET ?admin=1` e `PATCH` com o cabeçalho `x-admin-key`.
- `api/avisos.js` — pedidos "Avisa-me quando chegar" dos produtos novos.
- `db/schema.sql` — tabelas no Neon (projecto **AXI KizuaJa**).

## Variáveis no Vercel
- `DATABASE_URL` — ligação ao Neon.
- `ADMIN_KEY` — chave do painel de reservas (abrir o site com `#admin`).
