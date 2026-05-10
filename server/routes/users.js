const express = require("express");
const router = express.Router();
const User = require("../models/User");
const { auth } = require("../middleware/auth");

router.get("/search", auth, async (req, res) => {
  try {
    const { email } = req.query;
    if (!email)
      return res.status(400).json({ message: "Email query required" });
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return res.status(404).json({ message: "No user found" });
    res.json(user);
  } catch {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
