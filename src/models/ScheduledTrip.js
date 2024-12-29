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
});

module.exports = mongoose.model("ScheduledTrip", scheduledTripSchema);
