const express = require("express");
const router = express.Router();
const Stripe = require("stripe");
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

router.post("/create-payment-intent", async (req, res) => {
  try {
    const { amount, currency = "gbp", metadata } = req.body;

    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency,
      metadata,
    });

    res.json({ client_secret: paymentIntent.client_secret });
  } catch (err) {
    console.error("Payment Intent Error:", err);
    res.status(500).json({ error: err.message });
  }
});

router.post("/save-payment-method", async (req, res) => {
  try {
    const { payment_method_id, customer_email } = req.body;

    // (Optional) Create or retrieve customer by email
    const customer = await stripe.customers.create({
      email: customer_email,
      payment_method: payment_method_id,
    });

    await stripe.paymentMethods.attach(payment_method_id, {
      customer: customer.id,
    });

    res.json({ success: true, customer_id: customer.id });
  } catch (err) {
    console.error("Save Payment Method Error:", err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
