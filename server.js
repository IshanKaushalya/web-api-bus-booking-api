const express = require("express");
const mongoose = require("mongoose");
const adminRoutes = require("./src/routes/admin");
const databaseConnection = require("./databaseConnection");

const app = express();
app.use(express.json());

databaseConnection();

// Routes
app.use("/admin", adminRoutes);

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
