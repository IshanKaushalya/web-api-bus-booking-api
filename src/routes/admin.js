const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { check, validationResult } = require("express-validator");
const authenticateToken = require("../middleware/authenticateToken");
const Admin = require("../models/Admin");
const ScheduledTrip = require("../models/ScheduledTrip");
const BusPermit = require("../models/BusPermits");
const Operator = require("../models/Operator");
const scheduledTripController = require("../controllers/scheduledTripController");

const router = express.Router();

/**
 * @swagger
 * /admin/register:
 *   post:
 *     summary: Register a new admin
 *     tags: [Admin]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *                 description: The admin's username
 *               password:
 *                 type: string
 *                 description: The admin's password
 *             example:
 *               username: admin
 *               password: password123
 *     responses:
 *       201:
 *         description: Admin registered successfully
 *       400:
 *         description: Error creating admin
 */

/**
 * @swagger
 * /admin/login:
 *   post:
 *     summary: Admin login
 *     tags: [Admin]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *                 description: The admin's username
 *               password:
 *                 type: string
 *                 description: The admin's password
 *             example:
 *               username: admin
 *               password: password123
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *       400:
 *         description: Invalid credentials
 *       500:
 *         description: Error logging in
 */

/**
 * @swagger
 * /admin/bus-permits:
 *   post:
 *     summary: Add a new bus permit
 *     tags: [Bus Permits]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               permitNumber:
 *                 type: string
 *                 description: Unique permit number
 *                 example: "12345"
 *               busNumber:
 *                 type: string
 *                 description: Bus number
 *                 example: "AB-1234"
 *               routeNumber:
 *                 type: string
 *                 description: Route number
 *                 example: "45"
 *               origin:
 *                 type: string
 *                 description: Origin of the bus route
 *                 example: "Colombo"
 *               destination:
 *                 type: string
 *                 description: Destination of the bus route
 *                 example: "Kandy"
 *               serviceType:
 *                 type: string
 *                 description: Type of service
 *                 enum: [luxury, semi-luxury, normal]
 *                 example: "luxury"
 *               operatorName:
 *                 type: string
 *                 description: Name of the bus operator
 *                 example: "John Doe"
 *               address:
 *                 type: string
 *                 description: Address of the bus operator
 *                 example: "123 Main St, Colombo"
 *               expiryDate:
 *                 type: string
 *                 format: date
 *                 description: Expiry date of the permit
 *                 example: "2025-12-31"
 *     responses:
 *       '201':
 *         description: Bus permit added successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Bus permit added successfully"
 *                 permit:
 *                   $ref: '#/components/schemas/BusPermit'
 *       '400':
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Error adding bus permit"
 *                 details:
 *                   type: string
 *                   example: "Detailed error message"
 */

/**
 * @swagger
 * /admin/bus-permits:
 *   get:
 *     summary: Retrieve all bus permits
 *     tags: [Bus Permits]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: A list of bus permits
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/BusPermit'
 *       '500':
 *         description: Error retrieving bus permits
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Error retrieving bus permits"
 *                 details:
 *                   type: string
 *                   example: "Detailed error message"
 */

/**
 * @swagger
 * /admin/schedule-trip:
 *   post:
 *     summary: Add a new scheduled trip
 *     tags: [Scheduled Trips]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               permitNumber:
 *                 type: string
 *                 description: Permit number
 *                 example: "12345"
 *               busNumber:
 *                 type: string
 *                 description: Bus number
 *                 example: "AB-1234"
 *               routeNumber:
 *                 type: string
 *                 description: Route number
 *                 example: "45"
 *               arrivalTime:
 *                 type: string
 *                 description: Arrival time
 *                 example: "08:00"
 *               departureTime:
 *                 type: string
 *                 description: Departure time
 *                 example: "08:30"
 *               destinationTime:
 *                 type: string
 *                 description: Destination time
 *                 example: "12:00"
 *               operatorName:
 *                 type: string
 *                 description: Operator name
 *                 example: "John Doe"
 *               date:
 *                 type: string
 *                 format: date
 *                 description: Date of the trip
 *                 example: "2025-01-01"
 *               reservedSeats:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Reserved seats
 *                 example: ["1A", "1B"]
 *               totalSeats:
 *                 type: integer
 *                 description: Total number of seats
 *                 example: 40
 *               fare:
 *                 type: string
 *                 description: Fare for the trip
 *                 example: "500"
 *     responses:
 *       '201':
 *         description: Scheduled trip added successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Scheduled trip added successfully"
 *                 trip:
 *                   $ref: '#/components/schemas/ScheduledTrip'
 *       '400':
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 errors:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       msg:
 *                         type: string
 *                       param:
 *                         type: string
 *                       location:
 *                         type: string
 *       '500':
 *         description: Error adding scheduled trip
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Error adding scheduled trip"
 *                 details:
 *                   type: string
 *                   example: "Detailed error message"
 */

/**
 * @swagger
 * /admin/schedule-trip:
 *   get:
 *     summary: Retrieve all scheduled trips
 *     tags: [Scheduled Trips]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: A list of scheduled trips
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/ScheduledTrip'
 *       '500':
 *         description: Error retrieving trips
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Error retrieving trips"
 *                 details:
 *                   type: string
 *                   example: "Detailed error message"
 */

/**
 * @swagger
 * /admin/update/{id}:
 *   put:
 *     summary: Update a scheduled trip
 *     tags: [Scheduled Trips]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The trip ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               arrivalTime:
 *                 type: string
 *                 description: Arrival time
 *                 example: "08:00"
 *               departureTime:
 *                 type: string
 *                 description: Departure time
 *                 example: "08:30"
 *               destinationTime:
 *                 type: string
 *                 description: Destination time
 *                 example: "12:00"
 *               reservedSeats:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Reserved seats
 *                 example: ["1A", "1B"]
 *               totalSeats:
 *                 type: integer
 *                 description: Total number of seats
 *                 example: 40
 *     responses:
 *       '200':
 *         description: Scheduled trip updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Scheduled trip updated successfully"
 *                 trip:
 *                   $ref: '#/components/schemas/ScheduledTrip'
 *       '400':
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 errors:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       msg:
 *                         type: string
 *                       param:
 *                         type: string
 *                       location:
 *                         type: string
 *       '500':
 *         description: Error updating scheduled trip
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Error updating scheduled trip"
 *                 details:
 *                   type: string
 *                   example: "Detailed error message"
 */

/**
 * @swagger
 * /admin/register-operator:
 *   post:
 *     summary: Register a new operator
 *     tags: [Operators]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Name of the operator
 *                 example: "John Doe"
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Email of the operator
 *                 example: "john.doe@example.com"
 *               password:
 *                 type: string
 *                 description: Password for the operator
 *                 example: "password123"
 *               address:
 *                 type: string
 *                 description: Address of the operator
 *                 example: "123 Main St, Colombo"
 *     responses:
 *       '201':
 *         description: Operator registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Operator registered successfully"
 *       '400':
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 errors:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       msg:
 *                         type: string
 *                       param:
 *                         type: string
 *                       location:
 *                         type: string
 *                 error:
 *                   type: string
 *                   example: "Operator already exists"
 *       '500':
 *         description: Error registering operator
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Error registering operator"
 *                 details:
 *                   type: string
 *                   example: "Detailed error message"
 */

/**
 * @swagger
 * /admin/view-operators:
 *   get:
 *     summary: Retrieve all operators
 *     tags: [Operators]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: A list of operators
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Operator'
 *       '500':
 *         description: Error fetching operators
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Error fetching operators"
 *                 details:
 *                   type: string
 *                   example: "Detailed error message"
 */

/**
 * @swagger
 * /admin/view-operator/{name}:
 *   get:
 *     summary: Retrieve an operator by name
 *     tags: [Operators]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: name
 *         required: true
 *         schema:
 *           type: string
 *         description: The name of the operator
 *     responses:
 *       '200':
 *         description: Operator details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Operator'
 *       '404':
 *         description: Operator not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Operator not found"
 *       '500':
 *         description: Error fetching operator
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Error fetching operator"
 *                 details:
 *                   type: string
 *                   example: "Detailed error message"
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     BusPermit:
 *       type: object
 *       properties:
 *         permitNumber:
 *           type: string
 *         busNumber:
 *           type: string
 *         routeNumber:
 *           type: string
 *         origin:
 *           type: string
 *         destination:
 *           type: string
 *         serviceType:
 *           type: string
 *         operatorName:
 *           type: string
 *         address:
 *           type: string
 *         expiryDate:
 *           type: string
 *           format: date
 *     ScheduledTrip:
 *       type: object
 *       properties:
 *         permitNumber:
 *           type: string
 *         busNumber:
 *           type: string
 *         routeNumber:
 *           type: string
 *         arrivalTime:
 *           type: string
 *         departureTime:
 *           type: string
 *         destinationTime:
 *           type: string
 *         operatorName:
 *           type: string
 *         date:
 *           type: string
 *           format: date
 *         reservedSeats:
 *           type: array
 *           items:
 *             type: string
 *         totalSeats:
 *           type: integer
 *         fare:
 *           type: string
 *     Operator:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *         email:
 *           type: string
 *           format: email
 *         address:
 *           type: string
 */

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
      // Check if the bus already has a permit
      const existingPermit = await BusPermit.findOne({ busNumber });
      if (existingPermit) {
        return res.status(400).json({ error: "This bus already has a permit" });
      }

      // Check if the operator is a valid user
      const operator = await Operator.findOne({ name: operatorName });
      if (!operator) {
        return res.status(400).json({ error: "Invalid operator" });
      }

      // Ensure permitNumber is not null
      if (!permitNumber) {
        return res.status(400).json({ error: "Permit number cannot be null" });
      }

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
    check("permitNumber", "Permit number is required").not().isEmpty(),
    check("busNumber", "Bus number is required").not().isEmpty(),
    check("routeNumber", "Route number is required").not().isEmpty(),
    check("arrivalTime", "Arrival time is required").not().isEmpty(),
    check("departureTime", "Departure time is required").not().isEmpty(),
    check("destinationTime", "Destination time is required").not().isEmpty(),
    check("operatorName", "Operator name is required").not().isEmpty(),
    check("date", "Date is required").isISO8601(),
    check("reservedSeats", "Reserved seats must be an array").isArray(),
    check("totalSeats", "Total seats is required and must be a number").isInt({
      min: 1,
    }),
    check("fare", "fare is required").not().isEmpty(),
  ],
  authenticateToken,
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    scheduledTripController.createScheduledTrip(req, res);
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

// Update a scheduled trip
router.put(
  "/update/:id",
  [
    check("arrivalTime", "Arrival time is required").optional().not().isEmpty(),
    check("departureTime", "Departure time is required")
      .optional()
      .not()
      .isEmpty(),
    check("destinationTime", "Destination time is required")
      .optional()
      .not()
      .isEmpty(),
    check("reservedSeats", "Reserved seats must be an array")
      .optional()
      .isArray(),
    check("totalSeats", "Total seats must be a number")
      .optional()
      .isInt({ min: 1 }),
  ],
  authenticateToken,
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    scheduledTripController.updateScheduledTrip(req, res);
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
