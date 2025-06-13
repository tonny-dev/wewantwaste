const express = require("express");
const cors = require("cors");
const path = require("path");
const dotenv = require("dotenv");
dotenv.config({ path: path.resolve(__dirname, "../.env") });

const paymentRoutes = require("./routes/payments");
const bookingRoutes = require("./routes/bookings");

const app = express();
const PORT = process.env.PORT || 5000;

app.use("/api/payments/webhook", express.raw({ type: "application/json" }));

app.use(cors());
app.use(express.json());

// Routes
app.use("/api/payments", paymentRoutes);
app.use("/api/bookings", bookingRoutes);

// Add this after your existing middleware but before routes
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`, req.body);
  next();
});

// Add error handling middleware at the end, before app.listen
app.use((err, req, res, next) => {
  console.error("Server error:", err);
  res.status(500).json({ error: "Internal server error" });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
