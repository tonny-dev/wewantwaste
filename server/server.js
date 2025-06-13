const express = require("express");
const cors = require("cors");
const path = require("path");
const dotenv = require("dotenv");
dotenv.config({ path: path.resolve(__dirname, "../.env") });

const paymentRoutes = require("./routes/payments");
const bookingRoutes = require("./routes/bookings");

const app = express();
const PORT = process.env.PORT || 5000;

// CORS first
app.use(cors());

// Webhook route MUST come before express.json() middleware
app.use("/api/payments/webhook", express.raw({ type: "application/json" }));

// Then other JSON middleware
app.use(express.json());

// Logging middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`, {
    body: req.body,
    query: req.query,
    params: req.params,
    headers: {
      "content-type": req.headers["content-type"],
      "user-agent": req.headers["user-agent"],
    },
  });
  next();
});

// Routes
app.use("/api/payments", paymentRoutes);
app.use("/api/bookings", bookingRoutes);

app.use("*", (req, res) => {
  console.log(`404 - Route not found: ${req.method} ${req.originalUrl}`);
  res.status(404).json({
    error: "Route not found",
    method: req.method,
    url: req.originalUrl,
    availableRoutes: [
      "POST /api/payments/create-payment-intent",
      "POST /api/payments/save-payment-method",
      "POST /api/payments/webhook",
      "GET /api/payments/test",
      "GET /api/payments/stripe-status",
      "POST /api/bookings/create",
    ],
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Server error:", err);
  res.status(500).json({ error: "Internal server error" });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
