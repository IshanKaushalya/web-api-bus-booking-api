const mongoose = require("mongoose");
require("dotenv").config();

const clientOptions = {
  serverApi: { version: "1", strict: true, deprecationErrors: true },
};

async function databaseConnection() {
  try {
    await mongoose.connect(
      "mongodb+srv://IKIshan:8980t8n79HQBQ6uw@cluster0.pd3y5.mongodb.net/busBooking?retryWrites=true&w=majority&appName=Cluster0",
      clientOptions
    ); //mongodb+srv://IKIshan:8980t8n79HQBQ6uw@cluster0.pd3y5.mongodb.net/
    console.log("Successfully Connected to the DB");
  } catch (error) {
    console.error("Unable to Connect to DB");
    console.log(error);
  }
}

module.exports = databaseConnection;
