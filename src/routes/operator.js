const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { check, validationResult } = require("express-validator");
const Operator = require("../models/Operator");
const ScheduledTrip = require("../models/ScheduledTrip");
//const authenticateToken = require("../middleware/authenticateToken");
const operatorAuthenticationToken = require("../middleware/operatorAuthenticateToken");

const router = express.Router();

// Operator Login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const operator = await Operator.findOne({ email });
    if (!operator) return res.status(400).send("Operator not found");

    const validPassword = await bcrypt.compare(password, operator.password);
    if (!validPassword) return res.status(400).send("Invalid password");

    const token = jwt.sign(
      { _id: operator._id, name: operator.name },
      "secretKey",
      {
        expiresIn: "1h",
      }
    );
    res.header("AuthorizationOperator", token).send({ token });
  } catch (err) {
    res.status(500).send("Error logging in");
  }
});

// View assigned trips
router.get("/view-trips", operatorAuthenticationToken, async (req, res) => {
  try {
    const operatorName = req.operator.name; // Get operator name from authenticated user

    // Find trips assigned to the operator
    const trips = await ScheduledTrip.find({ operatorName });

    if (!trips || trips.length === 0) {
      return res
        .status(404)
        .json({ message: "No trips found for this operator." });
    }

    res.status(200).json(trips);
  } catch (error) {
    res.status(500).json({
      error: "An error occurred while fetching trips.",
      details: error.message,
    });
  }
});

// View and sort assigned trips
router.get(
  "/view-trips-by-dates",
  operatorAuthenticationToken,
  async (req, res) => {
    try {
      const operatorName = req.operator.name; // Get operator name from authenticated user
      const sortDirection = req.query.sort === "desc" ? -1 : 1; // Default to ascending if not specified

      // Find and sort trips assigned to the operator
      const trips = await ScheduledTrip.find({ operatorName }).sort({
        date: sortDirection,
      });

      if (!trips || trips.length === 0) {
        return res
          .status(404)
          .json({ message: "No trips found for this operator." });
      }

      res.status(200).json(trips);
    } catch (error) {
      res.status(500).json({
        error: "An error occurred while fetching trips.",
        details: error.message,
      });
    }
  }
);

module.exports = router;
