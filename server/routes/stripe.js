// server/routes/stripe.js
import express from "express";
import Stripe from "stripe";
import { STRIPE_PROJECTS } from "../data/stripeProjects.js";

const router = express.Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

router.get("/projects", (req, res) => {
  // Send only safe data to frontend (no priceId needed on client)
  const safe = STRIPE_PROJECTS.map(({ id, label }) => ({ id, label }));
  res.json({ projects: safe });
});

router.post("/create-checkout-session", async (req, res) => {
  try {
    const { name, projectId } = req.body;

    if (!name || !projectId) {
      return res.status(400).json({ error: "Name and project are required." });
    }

    const project = STRIPE_PROJECTS.find((p) => p.id === projectId);
    if (!project) {
      return res.status(400).json({ error: "Invalid project selected." });
    }

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [{ price: project.priceId, quantity: 1 }],
      success_url: `${process.env.CLIENT_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.CLIENT_URL}/payment/cancel`,
      metadata: {
        customer_name: name,
        project_id: projectId,
      },
    });

    res.json({ url: session.url });
  } catch (err) {
    console.error("Stripe session error:", err);
    res.status(500).json({ error: "Failed to create checkout session." });
  }
});

router.get("/session/:id", async (req, res) => {
  try {
    const session = await stripe.checkout.sessions.retrieve(req.params.id);
    res.json({
      id: session.id,
      payment_status: session.payment_status,
      metadata: session.metadata,
      customer_details: session.customer_details,
    });
  } catch (err) {
    res.status(404).json({ error: "Session not found" });
  }
});

export default router;
