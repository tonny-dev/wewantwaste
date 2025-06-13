const express = require("express");
const router = express.Router();
const Stripe = require("stripe");

// Initialize Stripe with your secret key
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

// Create Payment Intent endpoint
router.post("/create-payment-intent", async (req, res) => {
  try {
    console.log("Creating payment intent with data:", req.body);

    const {
      amount,
      currency = "gbp",
      metadata,
      booking_data,
      billing_address,
    } = req.body;

    // Validate required fields
    if (!amount || amount <= 0) {
      return res.status(400).json({ error: "Invalid amount provided" });
    }

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount), // Ensure it's an integer
      currency: currency.toLowerCase(),
      automatic_payment_methods: {
        enabled: true,
      },
      metadata: {
        ...metadata,
        // Add additional metadata for tracking
        environment: process.env.NODE_ENV || "development",
        created_at: new Date().toISOString(),
      },
    });

    console.log("Payment intent created:", paymentIntent.id);

    res.json({
      client_secret: paymentIntent.client_secret,
      payment_intent_id: paymentIntent.id,
    });
  } catch (err) {
    console.error("Payment Intent Error:", err);
    res.status(500).json({
      error: err.message || "Failed to create payment intent",
      code: err.code,
    });
  }
});

// Save Payment Method endpoint
router.post("/save-payment-method", async (req, res) => {
  try {
    const { payment_method_id, customer_email } = req.body;

    if (!payment_method_id || !customer_email) {
      return res.status(400).json({
        error: "Payment method ID and customer email are required",
      });
    }

    // Check if customer already exists
    const existingCustomers = await stripe.customers.list({
      email: customer_email,
      limit: 1,
    });

    let customer;
    if (existingCustomers.data.length > 0) {
      customer = existingCustomers.data[0];
      console.log("Using existing customer:", customer.id);
    } else {
      // Create new customer
      customer = await stripe.customers.create({
        email: customer_email,
        metadata: {
          created_at: new Date().toISOString(),
        },
      });
      console.log("Created new customer:", customer.id);
    }

    // Attach payment method to customer
    await stripe.paymentMethods.attach(payment_method_id, {
      customer: customer.id,
    });

    console.log("Payment method attached to customer");

    res.json({
      success: true,
      customer_id: customer.id,
      message: "Payment method saved successfully",
    });
  } catch (err) {
    console.error("Save Payment Method Error:", err);
    res.status(500).json({
      error: err.message || "Failed to save payment method",
      code: err.code,
    });
  }
});

// Webhook endpoint for handling Stripe events (optional but recommended)
router.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  (req, res) => {
    const sig = req.headers["stripe-signature"];
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

    let event;

    try {
      if (endpointSecret) {
        event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
      } else {
        event = req.body;
      }
    } catch (err) {
      console.log(`Webhook signature verification failed.`, err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle the event
    switch (event.type) {
      case "payment_intent.succeeded":
        const paymentIntent = event.data.object;
        console.log("Payment succeeded:", paymentIntent.id);
        // Handle successful payment here
        break;
      case "payment_intent.payment_failed":
        const failedPayment = event.data.object;
        console.log("Payment failed:", failedPayment.id);
        // Handle failed payment here
        break;
      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    res.json({ received: true });
  },
);

// Test endpoint to verify Stripe connection
router.get("/test", async (req, res) => {
  try {
    // Try to create a test payment intent with minimum amount
    const testIntent = await stripe.paymentIntents.create({
      amount: 100, // £1.00 in pence
      currency: "gbp",
      metadata: {
        test: "connection_test",
      },
    });

    res.json({
      success: true,
      message: "Stripe connection successful",
      test_payment_intent: testIntent.id,
    });
  } catch (err) {
    console.error("Stripe test error:", err);
    res.status(500).json({
      success: false,
      error: err.message,
      message: "Stripe connection failed",
    });
  }
});

router.get("/stripe-status", async (req, res) => {
  try {
    const testIntent = await stripe.paymentIntents.create({
      amount: 100,
      currency: "gbp",
      metadata: { test: "stripe_status_check" },
    });

    res.json({
      success: true,
      message: "Stripe connection successful",
      environment: process.env.NODE_ENV || "development",
      test_mode: process.env.STRIPE_SECRET_KEY?.startsWith("sk_test_") || false,
    });
  } catch (err) {
    console.error("Stripe status check error:", err);
    res.status(500).json({
      success: false,
      error: err.message,
      message: "Stripe connection failed",
    });
  }
});

module.exports = router;
