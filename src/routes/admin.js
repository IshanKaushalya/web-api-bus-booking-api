const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { check, validationResult } = require("express-validator");
const authenticateToken = require("../middleware/authenticateToken");
const Admin = require("../models/Admin");

const router = express.Router();

// Admin Registration
router.post(
  "/register",
  [
    check("username", "Username is required").notEmpty(),
    check("password", "Password should be at least 6 characters long").isLength(
      { min: 6 }
    ),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { username, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    const admin = new Admin({ username, password: hashedPassword });
    try {
      await admin.save();
      res.status(201).send("Admin registered successfully");
    } catch (err) {
      res.status(400).send("Error creating admin");
    }
  }
);

// Admin Login
router.post("/login", async (req, res) => {
  const { username, password } = req.body;

  try {
    const admin = await Admin.findOne({ username });
    if (!admin) return res.status(400).send("Admin not found");

    const validPassword = await bcrypt.compare(password, admin.password);
    if (!validPassword) return res.status(400).send("Invalid password");

    const token = jwt.sign({ _id: admin._id }, "secretKey", {
      expiresIn: "1h",
    });
    res.header("Authorization", token).send({ token });
  } catch (err) {
    res.status(500).send("Error logging in");
  }
});

// Add Bus Permit with Validation
router.post(
  "/bus-permits",
  [
    authenticateToken,
    check("permitNumber").notEmpty().withMessage("Permit number is required"),
    check("busNumber").notEmpty().withMessage("Bus number is required"),
    check("routeNumber").notEmpty().withMessage("Route number is required"),
    check("origin").notEmpty().withMessage("Origin is required"),
    check("destination").notEmpty().withMessage("Destination is required"),
    check("serviceType")
      .isIn(["luxury", "semi-luxury", "normal"])
      .withMessage("Invalid service type"),
    check("expiryDate").isISO8601().toDate().withMessage("Invalid expiry date"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      permitNumber,
      busNumber,
      routeNumber,
      origin,
      destination,
      serviceType,
      operatorName,
      address,
      expiryDate,
    } = req.body;

    try {
      const newPermit = new BusPermit({
        permitNumber,
        busNumber,
        routeNumber,
        origin,
        destination,
        serviceType,
        operatorName,
        address,
        expiryDate,
      });
      await newPermit.save();
      res
        .status(201)
        .json({ message: "Bus permit added successfully", permit: newPermit });
    } catch (err) {
      res
        .status(400)
        .json({ error: "Error adding bus permit", details: err.message });
    }
  }
);

// Get All Bus Permits
router.get("/bus-permits", authenticateToken, async (req, res) => {
  try {
    const permits = await BusPermit.find();
    res.status(200).json(permits);
  } catch (err) {
    res
      .status(500)
      .json({ error: "Error retrieving bus permits", details: err.message });
  }
});

// Additional admin routes for bus management...
module.exports = router;
