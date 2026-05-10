const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const { body, validationResult } = require("express-validator");
const User = require("../models/User");
const { auth } = require("../middleware/auth");

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });

router.post(
  "/signup",
  [
    body("name").trim().notEmpty().withMessage("Name is required"),
    body("email").isEmail().withMessage("Valid email required"),
    body("password").isLength({ min: 6 }).withMessage("Min 6 characters"),
    body("role").optional().isIn(["admin", "member"]),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array()[0].msg });
    }
    try {
      const { name, email, password, role } = req.body;
      const exists = await User.findOne({ email });
      if (exists)
        return res.status(400).json({ message: "Email already in use" });
      const user = await User.create({
        name,
        email,
        password,
        role: role || "member",
      });
      const token = signToken(user._id);
      res.status(201).json({ token, user });
    } catch {
      res.status(500).json({ message: "Server error" });
    }
  },
);

router.post(
  "/login",
  [
    body("email").isEmail().withMessage("Valid email required"),
    body("password").notEmpty().withMessage("Password required"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array()[0].msg });
    }
    try {
      const { email, password } = req.body;
      const user = await User.findOne({ email });
      if (!user || !(await user.comparePassword(password))) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      const token = signToken(user._id);
      res.json({ token, user });
    } catch {
      res.status(500).json({ message: "Server error" });
    }
  },
);

router.get("/me", auth, (req, res) => {
  res.json({ user: req.user });
});

module.exports = router;
