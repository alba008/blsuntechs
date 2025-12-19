// api/intakes.mjs
import { getDb } from "./db.mjs";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  // Simple admin token auth
  const token = req.headers["x-admin-token"];
  if (!token || token !== process.env.INTAKE_ADMIN_TOKEN) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const rawLimit = req.query?.limit ?? 50;
  const limitNum = Number(rawLimit);
  const limit = Number.isFinite(limitNum)
    ? Math.max(1, Math.min(200, limitNum))
    : 50;

  try {
    const db = await getDb();

    const docs = await db
      .collection("intakes")
      .find({})
      .sort({ ts: -1 })
      .limit(limit)
      .toArray();

    const items = docs.map(({ _id, ...rest }) => ({
      id: String(_id),
      ...rest,
    }));

    const total = await db.collection("intakes").countDocuments();

    return res.status(200).json({ items, total });
  } catch (e) {
    console.error("intakes error:", e);
    return res.status(500).json({ error: "Server error" });
  }
}
