// server/routes/stripe.js
import express from "express";
import Stripe from "stripe";
import { STRIPE_PROJECTS } from "../data/stripeProjects.js";

const router = express.Router();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2024-06-20",
});

// ✅ GET /api/stripe/projects  (ACTIVE PRODUCTS ONLY)
router.get("/projects", async (req, res) => {
  try {
    // 1) Pull ACTIVE products only
    const products = await stripe.products.list({
      active: true,
      limit: 100,
    });

    const activeProductIds = new Set(products.data.map((p) => p.id));

    // 2) Pull ACTIVE prices (still needed to get amounts)
    const prices = await stripe.prices.list({
      active: true,
      limit: 100,
      expand: ["data.product"],
    });

    const projects = prices.data
      // keep only prices that belong to ACTIVE products
      .filter((p) => {
        const prodId =
          typeof p.product === "object" && p.product?.id ? p.product.id : p.product;
        return activeProductIds.has(prodId);
      })
      // (optional) keep your one_time requirement
      .filter((p) => p.type === "one_time" && p.unit_amount != null)
      .map((p) => {
        const product = p.product;
        const label =
          typeof product === "object" && product?.name ? product.name : "Service";

        return {
          id: p.id, // price_...
          label,
          amount: Number(p.unit_amount) / 100,
          currency: p.currency,
          productId: typeof product === "object" ? product.id : p.product,
        };
      })
      .sort((a, b) => a.amount - b.amount);

    return res.json({ projects });
  } catch (err) {
    console.error(
      "GET /stripe/projects error:",
      err?.raw?.message || err?.message || err
    );
    return res.status(500).json({ error: "Failed to load Stripe projects." });
  }
});


// ✅ POST /api/stripe/create-checkout-session
router.post("/create-checkout-session", async (req, res) => {
  try {
    const { name, projectId } = req.body || {};
    const cleanName = String(name || "").trim();

    if (!cleanName) return res.status(400).json({ error: "Name is required." });
    if (!projectId) return res.status(400).json({ error: "projectId is required." });

    const clientUrl = process.env.CLIENT_URL || "http://localhost:3000";

    // ✅ Stripe price id path (recommended)
    if (String(projectId).startsWith("price_")) {
      const price = await stripe.prices.retrieve(projectId);
      if (!price?.active) {
        return res.status(400).json({ error: "Selected price is inactive." });
      }

      const session = await stripe.checkout.sessions.create({
        mode: "payment",
        payment_method_types: ["card"],
        line_items: [{ price: projectId, quantity: 1 }],
        metadata: {
          customer_name: cleanName,
          project_price_id: projectId,
        },
        success_url: `${clientUrl}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${clientUrl}/payment/cancel`,
      });

      return res.json({ url: session.url });
    }

    // ✅ Backward compatible fallback: your old STRIPE_PROJECTS
    const project = STRIPE_PROJECTS.find((p) => p.id === projectId);
    if (!project) return res.status(400).json({ error: "Invalid projectId." });

    if (project.amount == null || Number.isNaN(Number(project.amount))) {
      return res.status(400).json({ error: "Project amount is missing/invalid." });
    }

    const currency = (project.currency || "usd").toLowerCase();
    const unitAmount = Math.round(Number(project.amount) * 100);

    if (unitAmount < 50) {
      return res.status(400).json({ error: "Project amount too small (min usually $0.50)." });
    }

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency,
            product_data: { name: project.label },
            unit_amount: unitAmount,
          },
          quantity: 1,
        },
      ],
      metadata: {
        customer_name: cleanName,
        project_id: project.id,
        project_label: project.label,
      },
      success_url: `${clientUrl}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${clientUrl}/payment/cancel`,
    });

    return res.json({ url: session.url });
  } catch (err) {
    console.error(
      "Stripe create-checkout-session error:",
      err?.raw?.message || err?.message || err
    );
    return res.status(500).json({ error: "Stripe checkout session failed." });
  }
});

// ✅ GET /api/stripe/session/:id  (UPGRADED)
router.get("/session/:id", async (req, res) => {
  const sessionId = String(req.params.id || "").trim();

  if (!sessionId.startsWith("cs_test_") && !sessionId.startsWith("cs_live_")) {
    return res.status(400).json({ error: "Invalid session_id format." });
  }

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ["payment_intent"],
    });

    const pi =
      typeof session.payment_intent === "object" ? session.payment_intent : null;

    return res.json({
      id: session.id,
      payment_status: session.payment_status,
      status: session.status,
      amount_total: session.amount_total,
      currency: session.currency,
      metadata: session.metadata,
      customer_details: session.customer_details,
      payment_intent: pi
        ? {
            id: pi.id,
            status: pi.status,
            amount: pi.amount,
            currency: pi.currency,
            latest_charge: pi.latest_charge,
          }
        : session.payment_intent
        ? { id: session.payment_intent }
        : null,
    });
  } catch (err) {
    const details = err?.raw?.message || err?.message || String(err);
    const code = err?.raw?.code || err?.code;
    console.error("Stripe retrieve session error:", details);

    const isClientError =
      code === "resource_missing" ||
      /no such checkout\.session/i.test(details) ||
      /invalid/i.test(details);

    return res.status(isClientError ? 400 : 500).json({
      error: "Failed to retrieve session.",
      details,
      code,
    });
  }
});

export default router;
