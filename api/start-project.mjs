import { getDb } from "./db.mjs";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    const {
      name = "", email = "", company = "", service = "",
      budget = "", timeline = "", message = "", botcheck = "",
    } = req.body || {};

    if (botcheck) return res.json({ ok: true }); // honeypot
    if (!name || !email || !service || !message) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const db = await getDb();
    const doc = {
      name, email, company, service, budget, timeline, message,
      ua: req.headers["user-agent"] || null,
      ip: req.headers["x-forwarded-for"] || req.socket?.remoteAddress || null,
      ts: new Date(),
    };
    const { insertedId } = await db.collection("intakes").insertOne(doc);

    return res.status(200).json({ ok: true, id: String(insertedId), receivedAt: doc.ts });
  } catch (e) {
    console.error("start-project error:", e);
    return res.status(500).json({ error: "Server error" });
  }
}
