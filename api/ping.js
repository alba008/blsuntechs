import { MongoClient, ServerApiVersion } from "mongodb";

export default async function handler(req, res) {
  const uri = process.env.MONGODB_URI;
  const name = process.env.MONGODB_DB || "blsuntech";
  if (!uri) return res.status(500).json({ ok: false, error: "MONGODB_URI missing" });

  try {
    const client = new MongoClient(uri, {
      serverApi: { version: ServerApiVersion.v1, strict: true, deprecationErrors: true }
    });
    await client.connect();
    await client.db(name).command({ ping: 1 });
    await client.close();
    res.json({ ok: true, db: name });
  } catch (e) {
    // surface error to help you debug (remove later)
    res.status(500).json({ ok: false, error: String(e?.message || e) });
  }
}
