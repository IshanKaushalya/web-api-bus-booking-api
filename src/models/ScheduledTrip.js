const mongoose = require("mongoose");

const scheduledTripSchema = new mongoose.Schema({
  permitNumber: { type: String, ref: "BusPermits", required: true },
  busNumber: { type: String, required: true },
  routeNumber: { type: String, required: true },
  arrivalTime: { type: String, required: true },
  departureTime: { type: String, required: true },
  destinationTime: { type: String, required: true },
  operatorName: {
    type: String,
    ref: "Operator",
    required: true,
  }, // Reference to Operator
  date: { type: Date, required: true },
  reservedSeats: { type: [Number], default: [] }, // List of reserved seat numbers
  availableSeats: { type: [Number], required: true }, // List of available seat
  fare: { type: Number, required: true }, // Fare for the trip
});

module.exports = mongoose.model("ScheduledTrip", scheduledTripSchema);
