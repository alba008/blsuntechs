// server/app.js
import express from "express";
import cors from "cors";

import stripeRoutes from "./routes/stripe.js";
import stripeWebhookRoutes from "./routes/stripeWebhook.js";
import startProjectRoutes from "./routes/startProject.js";

const app = express();

// CORS (frontend)
app.use(
  cors({
    origin: process.env.ORIGIN || "http://localhost:3000",
    credentials: true,
  })
);

// ✅ Webhook must use raw body BEFORE express.json()
app.use("/stripe", stripeWebhookRoutes);

// ✅ JSON for normal routes
app.use(express.json());

// ✅ Stripe API routes
app.use("/stripe", stripeRoutes);

// ✅ Start Project routes (these become /api/start-project and /api/intakes)
app.use("/", startProjectRoutes);

// ✅ Health (becomes /api/health because index.js mounts app at /api)
app.get("/health", (req, res) => res.json({ ok: true }));

export default app;
