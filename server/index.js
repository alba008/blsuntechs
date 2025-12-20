// server/index.js
import "dotenv/config"; // ✅ loads server/.env automatically
import express from "express";
import app from "./app.js";

const PORT = process.env.PORT || 5050;

const server = express();
// mount the app at /api locally so URLs match production
server.use("/api", app);

server.listen(PORT, () => {
  console.log(`Local API: http://localhost:${PORT}/api/health`);
});
