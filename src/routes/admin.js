const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { check, validationResult } = require("express-validator");
const authenticateToken = require("../middleware/authenticateToken");
const Admin = require("../models/Admin");
const ScheduledTrip = require("../models/ScheduledTrip");
const BusPermit = require("../models/BusPermits");
const Operator = require("../models/Operator");

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

//add Schedule trips
router.post(
  "/schedule-trip",
  [
    authenticateToken,
    check("permitNumber").notEmpty().withMessage("Permit number is required"),
    check("busNumber").notEmpty().withMessage("Bus number is required"),
    check("routeNumber").notEmpty().withMessage("Route number is required"),
    check("arrivalTime").notEmpty().withMessage("Arrival time is required"),
    check("departureTime").notEmpty().withMessage("Departure time is required"),
    check("destinationTime")
      .notEmpty()
      .withMessage("Destination time is required"),
    check("operatorName").notEmpty().withMessage("Operator name is required"),
    check("date")
      .notEmpty()
      .withMessage("Date is required.")
      .custom((value) => !isNaN(Date.parse(value)))
      .withMessage("Invalid date format."),
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
      arrivalTime,
      departureTime,
      destinationTime,
      operatorName,
      date,
    } = req.body;

    try {
      const newTrip = new ScheduledTrip({
        permitNumber,
        busNumber,
        routeNumber,
        arrivalTime,
        departureTime,
        destinationTime,
        operatorName,
        date: new Date(date),
      });

      await newTrip.save();
      res
        .status(201)
        .json({ message: "Trip scheduled successfully", trip: newTrip });
    } catch (err) {
      res
        .status(400)
        .json({ error: "Error scheduling trip", details: err.message });
    }
  }
);

// Get All Scheduled Trips
router.get("/schedule-trip", authenticateToken, async (req, res) => {
  try {
    const trips = await ScheduledTrip.find();
    res.status(200).json(trips);
  } catch (err) {
    res
      .status(500)
      .json({ error: "Error retrieving trips", details: err.message });
  }
});

//Update Trip
router.put(
  "/schedule-trip/:id",
  [
    authenticateToken,
    check("permitNumber")
      .optional()
      .notEmpty()
      .withMessage("Permit number must not be empty"),
    check("busNumber")
      .optional()
      .notEmpty()
      .withMessage("Bus number must not be empty"),
    check("routeNumber")
      .optional()
      .notEmpty()
      .withMessage("Route number must not be empty"),
    check("arrivalTime")
      .optional()
      .notEmpty()
      .withMessage("Arrival time must not be empty"),
    check("departureTime")
      .optional()
      .notEmpty()
      .withMessage("Departure time must not be empty"),
    check("destinationTime")
      .optional()
      .notEmpty()
      .withMessage("Destination time must not be empty"),
    check("operatorName")
      .optional()
      .notEmpty()
      .withMessage("Operator must be assigned"),
    check("date")
      .notEmpty()
      .withMessage("Date is required.")
      .custom((value) => !isNaN(Date.parse(value)))
      .withMessage("Invalid date format."),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const {
      permitNumber,
      busNumber,
      routeNumber,
      arrivalTime,
      departureTime,
      destinationTime,
      operatorName,
      date,
    } = req.body;

    try {
      const updatedTrip = await ScheduledTrip.findByIdAndUpdate(
        id,
        {
          permitNumber,
          busNumber,
          routeNumber,
          arrivalTime,
          departureTime,
          destinationTime,
          operatorName,
          date: new Date(date),
        },
        { new: true, runValidators: true }
      );

      if (!updatedTrip) {
        return res.status(404).json({ error: "Trip not found" });
      }

      res
        .status(200)
        .json({ message: "Trip updated successfully", trip: updatedTrip });
    } catch (err) {
      res
        .status(400)
        .json({ error: "Error updating trip", details: err.message });
    }
  }
);

//admin to register an operator
router.post(
  "/register-operator",
  authenticateToken,
  [
    // Validations
    check("name").notEmpty().withMessage("Name is required"),
    check("email").isEmail().withMessage("Valid email is required"),
    check("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters long"),
    check("address").notEmpty().withMessage("Address is required"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password, address } = req.body;

    try {
      const existingOperator = await Operator.findOne({ email });
      if (existingOperator) {
        return res.status(400).json({ error: "Operator already exists" });
      }

      const operator = new Operator({ name, email, password, address });
      await operator.save();

      res.status(201).json({ message: "Operator registered successfully" });
    } catch (err) {
      res
        .status(500)
        .json({ error: "Error registering operator", details: err.message });
    }
  }
);

// Admin views all operators
router.get("/view-operators", authenticateToken, async (req, res) => {
  try {
    const operators = await Operator.find().select("-password"); // Exclude passwords
    res.status(200).json(operators);
  } catch (err) {
    res
      .status(500)
      .json({ error: "Error fetching operators", details: err.message });
  }
});

// Admin views an operator by name
router.get("/view-operator/:name", authenticateToken, async (req, res) => {
  const { name } = req.params;

  try {
    const operator = await Operator.findOne({
      name: new RegExp(`^${name}$`, "i"),
    }).select("-password");
    if (!operator) {
      return res.status(404).json({ error: "Operator not found" });
    }

    res.status(200).json(operator);
  } catch (err) {
    res
      .status(500)
      .json({ error: "Error fetching operator", details: err.message });
  }
});

// Additional admin routes for bus management...
module.exports = router;
