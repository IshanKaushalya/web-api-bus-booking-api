// controllers/commuterController.js
const Commuter = require("../models/Commuter");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const ScheduledTrip = require("../models/ScheduledTrip");
const sendBookingConfirmation = require("../config/nodemailer");

//commuter registration
exports.register = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    let commuter = await Commuter.findOne({ email });
    if (commuter) {
      return res.status(400).json({ msg: "Commuter already exists" });
    }

    commuter = new Commuter({ name, email, password });
    await commuter.save();

    const payload = { commuter: { id: commuter.id } };
    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    res.json({ token });
  } catch (err) {
    res.status(500).send("Server Error");
  }
};

//commuter login
exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const commuter = await Commuter.findOne({ email });
    if (!commuter) {
      return res.status(400).json({ msg: "Invalid Credentials" });
    }

    const isMatch = await bcrypt.compare(password, commuter.password);
    if (!isMatch) {
      return res.status(400).json({ msg: "Invalid Credentials" });
    }

    const payload = { commuter: { id: commuter._id } };
    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    res.json({ token });
  } catch (err) {
    res.status(500).send("Server Error");
  }
};

//view commuter profile
exports.getProfile = async (req, res) => {
  try {
    const commuter = await Commuter.findById(req.commuter.id).select(
      "-password"
    );
    res.json(commuter);
  } catch (err) {
    res.status(500).send("Server Error");
  }
};

//bus filter
exports.searchBuses = async (req, res) => {
  const { origin, destination, date } = req.query;

  try {
    const trips = await ScheduledTrip.find({
      origin,
      destination,
      date: new Date(date),
    });

    if (!trips || trips.length === 0) {
      return res
        .status(404)
        .json({ msg: "No available buses found for the specified criteria" });
    }

    res.json(trips);
  } catch (err) {
    res.status(500).send("Server Error");
  }
};

//book seats
// Mock payment processing function
const processPayment = async (amount, paymentDetails) => {
  // Simulate payment processing
  return { success: true, transactionId: "1234567890" };
};

exports.bookSeats = async (req, res) => {
  const { tripId, seatNumbers, paymentDetails } = req.body;

  try {
    // Find the scheduled trip by ID
    let trip = await ScheduledTrip.findById(tripId);
    if (!trip) {
      return res.status(404).json({ msg: "Scheduled trip not found" });
    }

    // Check if the requested seats are available
    const unavailableSeats = seatNumbers.filter(
      (seat) => !trip.availableSeats.includes(seat)
    );
    if (unavailableSeats.length > 0) {
      return res.status(400).json({
        msg: `Seats ${unavailableSeats.join(", ")} are not available`,
      });
    }

    // Calculate total fare
    const totalFare = seatNumbers.length * trip.fare;

    // Process payment
    const paymentResult = await processPayment(totalFare, paymentDetails);
    if (!paymentResult.success) {
      return res.status(400).json({ msg: "Payment failed" });
    }

    // Update reserved and available seats
    trip.reservedSeats = [...trip.reservedSeats, ...seatNumbers];
    trip.availableSeats = trip.availableSeats.filter(
      (seat) => !seatNumbers.includes(seat)
    );

    await trip.save();

    // Send booking confirmation email
    const commuter = await Commuter.findById(req.commuter.id);
    sendBookingConfirmation(commuter.email, {
      tripId,
      seatNumbers,
      totalFare,
      transactionId: paymentResult.transactionId,
    });

    res.json({
      msg: "Seats booked successfully",
      trip,
      transactionId: paymentResult.transactionId,
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
};

//ticket cancelation
exports.cancelBooking = async (req, res) => {
  const { tripId, seatNumbers } = req.body;

  try {
    // Find the scheduled trip by ID
    let trip = await ScheduledTrip.findById(tripId);
    if (!trip) {
      return res.status(404).json({ msg: "Scheduled trip not found" });
    }

    // Check if the requested seats are actually reserved
    const invalidSeats = seatNumbers.filter(
      (seat) => !trip.reservedSeats.includes(seat)
    );
    if (invalidSeats.length > 0) {
      return res
        .status(400)
        .json({ msg: `Seats ${invalidSeats.join(", ")} are not reserved` });
    }

    // Update reserved and available seats
    trip.reservedSeats = trip.reservedSeats.filter(
      (seat) => !seatNumbers.includes(seat)
    );
    trip.availableSeats = [...trip.availableSeats, ...seatNumbers];

    await trip.save();

    res.json({ msg: "Booking cancelled successfully", trip });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
};
