const mongoose = require("mongoose");

const busPermitSchema = new mongoose.Schema({
  permitNumber: { type: String, required: true, unique: true },
  busNumber: { type: String, required: true },
  routeNumber: { type: String, required: true },
  origin: { type: String, required: true },
  destination: { type: String, required: true },
  serviceType: {
    type: String,
    enum: ["luxury", "semi-luxury", "normal"],
    required: true,
  },
  operatorName: { type: String, required: true },
  address: { type: String, required: true },
  expiryDate: { type: Date, required: true },
});

module.exports = mongoose.model("BusPermit", busPermitSchema);
