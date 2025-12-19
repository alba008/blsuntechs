import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import stripeRoutes from "./routes/stripe.js";
import stripeWebhookRoutes from "./routes/stripeWebhook.js";

dotenv.config();

const app = express();

app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));

// IMPORTANT: webhook must come BEFORE express.json()
app.use("/api/stripe", stripeWebhookRoutes);

// JSON for everything else
app.use(express.json());

app.use("/api/stripe", stripeRoutes);

app.get("/api/ping", (req, res) => res.json({ ok: true }));

export default app;
