// src/routes/commuter.js
const express = require("express");
const router = express.Router();
const { check, validationResult } = require("express-validator");
const commuterController = require("../controllers/commuterController");
const authMiddleware = require("../middleware/commuterAuthenticateToken");

// Register a new commuter
router.post(
  "/register",
  [
    check("name", "Name is required").not().isEmpty(),
    check("email", "Please include a valid email").isEmail(),
    check(
      "password",
      "Please enter a password with 6 or more characters"
    ).isLength({ min: 6 }),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    commuterController.register(req, res);
  }
);

// Login commuter
router.post(
  "/login",
  [
    check("email", "Please include a valid email").isEmail(),
    check("password", "Password is required").exists(),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    commuterController.login(req, res);
  }
);

// Get commuter profile
router.get("/profile", authMiddleware, commuterController.getProfile);

module.exports = router;
