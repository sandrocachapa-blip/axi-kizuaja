-- Neon: projecto "AXI KizuaJa" (summer-butterfly-29625213)
CREATE TABLE IF NOT EXISTS reservas (
  ref text PRIMARY KEY, exp text NOT NULL, data date NOT NULL, slot text NOT NULL,
  pax int NOT NULL CHECK (pax BETWEEN 1 AND 12), total int NOT NULL,
  nome text NOT NULL, email text NOT NULL, tel text NOT NULL, notas text DEFAULT '',
  estado text NOT NULL DEFAULT 'pendente', criada timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS avisos (
  id serial PRIMARY KEY, produto text NOT NULL, contacto text NOT NULL, criada timestamptz NOT NULL DEFAULT now()
);
