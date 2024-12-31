// controllers/scheduledTripController.js
const ScheduledTrip = require("../models/ScheduledTrip");
const BusPermit = require("../models/BusPermits");

//create a trip schedule
exports.createScheduledTrip = async (req, res) => {
  const {
    permitNumber,
    busNumber,
    routeNumber,
    arrivalTime,
    departureTime,
    destinationTime,
    operatorName,
    date,
    reservedSeats,
    totalSeats,
    fare,
  } = req.body;

  try {
    // Check if the permit number exists in the BusPermits collection
    const busPermit = await BusPermit.findOne({ permitNumber });
    if (!busPermit) {
      return res.status(400).json({ msg: "Invalid permit number" });
    }

    // Calculate available seats
    const allSeats = Array.from({ length: totalSeats }, (_, i) => i + 1);
    const availableSeats = allSeats.filter(
      (seat) => !reservedSeats.includes(seat)
    );

    // Create a new scheduled trip
    const newTrip = new ScheduledTrip({
      permitNumber,
      busNumber,
      routeNumber,
      arrivalTime,
      departureTime,
      destinationTime,
      operatorName,
      date,
      reservedSeats,
      availableSeats,
      fare,
    });

    await newTrip.save();
    res.json(newTrip);
  } catch (err) {
    res.status(500).send("Server Error");
  }
};

//update scheduled trips
exports.updateScheduledTrip = async (req, res) => {
  const { id } = req.params;
  const {
    arrivalTime,
    departureTime,
    destinationTime,
    reservedSeats,
    totalSeats,
  } = req.body;

  try {
    // Find the scheduled trip by ID
    let trip = await ScheduledTrip.findById(id);
    if (!trip) {
      return res.status(404).json({ msg: "Scheduled trip not found" });
    }

    // Update the trip details
    trip.arrivalTime = arrivalTime || trip.arrivalTime;
    trip.departureTime = departureTime || trip.departureTime;
    trip.destinationTime = destinationTime || trip.destinationTime;

    // Update reserved seats and recalculate available seats if provided
    if (reservedSeats) {
      trip.reservedSeats = reservedSeats;
      const allSeats = Array.from(
        {
          length:
            totalSeats ||
            trip.availableSeats.length + trip.reservedSeats.length,
        },
        (_, i) => i + 1
      );
      trip.availableSeats = allSeats.filter(
        (seat) => !reservedSeats.includes(seat)
      );
    }

    await trip.save();
    res.json(trip);
  } catch (err) {
    res.status(500).send("Server Error");
  }
};
