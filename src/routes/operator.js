const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { check, validationResult } = require("express-validator");
const Operator = require("../models/Operator");
const ScheduledTrip = require("../models/ScheduledTrip");
//const authenticateToken = require("../middleware/authenticateToken");
const operatorAuthenticationToken = require("../middleware/operatorAuthenticateToken");

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Operator:
 *       type: object
 *       required:
 *         - email
 *         - password
 *       properties:
 *         email:
 *           type: string
 *           description: The operator's email
 *         password:
 *           type: string
 *           description: The operator's password
 *     Trip:
 *       type: object
 *       properties:
 *         operatorName:
 *           type: string
 *           description: The name of the operator
 *         date:
 *           type: string
 *           format: date-time
 *           description: The date of the trip
 */

/**
 * @swagger
 * tags:
 *   name: Operators
 *   description: The operators managing API
 */

/**
 * @swagger
 * /operator/login:
 *   post:
 *     summary: Login an operator
 *     tags: [Operators]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 description: The operator's email
 *               password:
 *                 type: string
 *                 description: The operator's password
 *     responses:
 *       200:
 *         description: The token of the authenticated operator
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                   description: The JWT token
 *       400:
 *         description: Invalid email or password
 *       500:
 *         description: Error logging in
 */

/**
 * @swagger
 * /operator/view-trips:
 *   get:
 *     summary: View assigned trips
 *     tags: [Operators]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of trips assigned to the operator
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Trip'
 *       404:
 *         description: No trips found for this operator
 *       500:
 *         description: Error fetching trips
 */

/**
 * @swagger
 * /operator/view-trips-by-dates:
 *   get:
 *     summary: View and sort assigned trips by dates
 *     tags: [Operators]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *         description: Sort direction (asc or desc)
 *     responses:
 *       200:
 *         description: List of sorted trips assigned to the operator
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Trip'
 *       404:
 *         description: No trips found for this operator
 *       500:
 *         description: Error fetching trips
 */

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
