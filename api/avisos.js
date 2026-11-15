// Pedidos "Avisa-me quando chegar" para produtos novos
import { neon } from "@neondatabase/serverless";
const sql = neon(process.env.DATABASE_URL);

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "metodo" });
  const produto = String(req.body?.produto ?? "").trim().slice(0, 60);
  const contacto = String(req.body?.contacto ?? "").trim().slice(0, 160);
  if (!produto || contacto.length < 6) return res.status(400).json({ error: "dados_invalidos" });
  try {
    await sql`INSERT INTO avisos (produto, contacto) VALUES (${produto}, ${contacto})`;
    return res.status(201).json({ ok: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "servidor" });
  }
}
