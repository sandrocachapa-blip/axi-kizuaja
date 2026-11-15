// API de reservas da AXI Gin School (Vercel Function + Neon Postgres)
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL);
const CAP = 12;
const EXP = {
  prova: { p: 15000, slots: ["17:00", "19:00"] },
  master: { p: 45000, slots: ["15:00"] },
  cocktail: { p: 25000, slots: ["18:00", "20:30"] },
};
const isAdmin = (req) => !!process.env.ADMIN_KEY && req.headers["x-admin-key"] === process.env.ADMIN_KEY;
const clean = (v, n) => String(v ?? "").trim().slice(0, n);

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");
  try {
    if (req.method === "GET") {
      if (req.query.admin) {
        if (!isAdmin(req)) return res.status(401).json({ error: "chave_invalida" });
        const rows = await sql`SELECT ref, exp, to_char(data,'YYYY-MM-DD') AS date, slot, pax, total, nome, email, tel, notas, estado, criada
                               FROM reservas ORDER BY data, slot`;
        return res.json(rows);
      }
      const rows = await sql`SELECT to_char(data,'YYYY-MM-DD') AS date, exp, slot, sum(pax)::int AS n
                             FROM reservas WHERE estado <> 'cancelada' AND data >= current_date
                             GROUP BY data, exp, slot`;
      return res.json(rows);
    }

    if (req.method === "POST") {
      const b = req.body || {};
      const e = EXP[b.exp];
      const pax = Number(b.pax);
      const date = clean(b.date, 10);
      const d = new Date(date + "T12:00:00Z");
      const nome = clean(b.nome, 120), email = clean(b.email, 160), tel = clean(b.tel, 40), notas = clean(b.notas, 500);
      const w = d.getUTCDay();
      if (!e || !e.slots.includes(b.slot)) return res.status(400).json({ error: "sessao_invalida" });
      if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || isNaN(d) || d <= new Date() || !(w === 0 || w >= 4))
        return res.status(400).json({ error: "data_invalida" });
      if (!Number.isInteger(pax) || pax < 1 || pax > CAP) return res.status(400).json({ error: "pessoas_invalidas" });
      if (!nome || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || tel.replace(/\D/g, "").length < 9)
        return res.status(400).json({ error: "contacto_invalido" });
      const ref = "AXI-" + Date.now().toString(36).toUpperCase().slice(-6);
      const total = pax * e.p;
      const rows = await sql`INSERT INTO reservas (ref, exp, data, slot, pax, total, nome, email, tel, notas)
        SELECT ${ref}, ${b.exp}, ${date}::date, ${b.slot}, ${pax}, ${total}, ${nome}, ${email}, ${tel}, ${notas}
        WHERE (SELECT coalesce(sum(pax),0) FROM reservas
               WHERE data = ${date}::date AND exp = ${b.exp} AND slot = ${b.slot} AND estado <> 'cancelada') + ${pax} <= ${CAP}
        RETURNING ref, total`;
      if (!rows.length) return res.status(409).json({ error: "sem_vagas" });
      return res.status(201).json(rows[0]);
    }

    if (req.method === "PATCH") {
      if (!isAdmin(req)) return res.status(401).json({ error: "chave_invalida" });
      const { ref, estado } = req.body || {};
      if (!["pendente", "confirmada", "cancelada"].includes(estado)) return res.status(400).json({ error: "estado_invalido" });
      const rows = await sql`UPDATE reservas SET estado = ${estado} WHERE ref = ${clean(ref, 20)} RETURNING ref, estado`;
      if (!rows.length) return res.status(404).json({ error: "nao_encontrada" });
      return res.json(rows[0]);
    }

    res.setHeader("Allow", "GET, POST, PATCH");
    return res.status(405).json({ error: "metodo" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "servidor" });
  }
}
