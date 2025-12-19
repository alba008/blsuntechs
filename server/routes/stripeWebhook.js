// server/routes/stripeWebhook.js
import express from "express";
import Stripe from "stripe";

const router = express.Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Stripe requires RAW body for signature verification
router.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  (req, res) => {
    const sig = req.headers["stripe-signature"];
    let event;

    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET
      );
    } catch (err) {
      console.error("Webhook signature failed:", err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    if (event.type === "checkout.session.completed") {
      const session = event.data.object;

      console.log("✅ Payment confirmed:", {
        session_id: session.id,
        status: session.payment_status,
        name: session.metadata?.customer_name,
        project: session.metadata?.project_id,
        email: session.customer_details?.email,
      });

      // TODO: save to DB (your server has db.js), email, unlock access, etc.
    }

    res.json({ received: true });
  }
);

export default router;
