// src/routes/commuter.js
const express = require("express");
const router = express.Router();
const { check, validationResult } = require("express-validator");
const commuterController = require("../controllers/commuterController");
const commuterAuthenticateToken = require("../middleware/commuterAuthenticateToken");

/**
 * @swagger
 * tags:
 *   name: Commuters
 *   description: Commuter management
 */

/**
 * @swagger
 * /commuter/register:
 *   post:
 *     summary: Register a new commuter
 *     tags: [Commuters]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *                 description: Name of the commuter
 *               email:
 *                 type: string
 *                 description: Email of the commuter
 *               password:
 *                 type: string
 *                 description: Password for the commuter
 *     responses:
 *       200:
 *         description: Commuter registered successfully
 *       400:
 *         description: Bad request
 */

/**
 * @swagger
 * /commuter/login:
 *   post:
 *     summary: Login commuter
 *     tags: [Commuters]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 description: Email of the commuter
 *               password:
 *                 type: string
 *                 description: Password for the commuter
 *     responses:
 *       200:
 *         description: Commuter logged in successfully
 *       400:
 *         description: Bad request
 */

/**
 * @swagger
 * /commuter/profile:
 *   get:
 *     summary: Get commuter profile
 *     tags: [Commuters]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Commuter profile retrieved successfully
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /commuter/search-buses:
 *   get:
 *     summary: Search for available buses
 *     tags: [Commuters]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: origin
 *         schema:
 *           type: string
 *         required: true
 *         description: Origin of the trip
 *       - in: query
 *         name: destination
 *         schema:
 *           type: string
 *         required: true
 *         description: Destination of the trip
 *       - in: query
 *         name: date
 *         schema:
 *           type: string
 *           format: date
 *         required: true
 *         description: Date of the trip
 *     responses:
 *       200:
 *         description: List of available buses
 *       400:
 *         description: Bad request
 */

/**
 * @swagger
 * /commuter/book-seats:
 *   post:
 *     summary: Book seats with payment
 *     tags: [Commuters]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - tripId
 *               - seatNumbers
 *               - paymentDetails
 *             properties:
 *               tripId:
 *                 type: string
 *                 description: ID of the trip
 *               seatNumbers:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Array of seat numbers
 *               paymentDetails:
 *                 type: string
 *                 description: Payment details
 *     responses:
 *       200:
 *         description: Seats booked successfully
 *       400:
 *         description: Bad request
 */

/**
 * @swagger
 * /commuter/cancel-booking:
 *   post:
 *     summary: Cancel booking
 *     tags: [Commuters]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - tripId
 *               - seatNumbers
 *             properties:
 *               tripId:
 *                 type: string
 *                 description: ID of the trip
 *               seatNumbers:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Array of seat numbers
 *     responses:
 *       200:
 *         description: Booking canceled successfully
 *       400:
 *         description: Bad request
 */

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
router.get(
  "/profile",
  commuterAuthenticateToken,
  commuterController.getProfile
);

// Search for available buses
router.get(
  "/search-buses",
  [
    check("origin", "Origin is required").not().isEmpty(),
    check("destination", "Destination is required").not().isEmpty(),
    check("date", "Date is required").isISO8601(),
  ],
  commuterAuthenticateToken,
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    commuterController.searchBuses(req, res);
  }
);

// Book seats with payment
router.post(
  "/book-seats",
  [
    check("tripId", "Trip ID is required").not().isEmpty(),
    check("seatNumbers", "Seat numbers must be an array").isArray(),
    check("paymentDetails", "Payment details are required").not().isEmpty(),
  ],
  commuterAuthenticateToken,
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    commuterController.bookSeats(req, res);
  }
);

// Cancel booking
router.post(
  "/cancel-booking",
  [
    check("tripId", "Trip ID is required").not().isEmpty(),
    check("seatNumbers", "Seat numbers must be an array").isArray(),
  ],
  commuterAuthenticateToken,
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    commuterController.cancelBooking(req, res);
  }
);

module.exports = router;
