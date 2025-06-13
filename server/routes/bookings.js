const express = require("express");
const router = express.Router();

router.post("/create", async (req, res) => {
  try {
    const booking = {
      id: Date.now().toString(), // Replace with DB logic
      ...req.body,
    };

    // TODO: Save to a real database
    console.log("Booking created:", booking);

    res.json(booking);
  } catch (err) {
    console.error("Booking Error:", err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
