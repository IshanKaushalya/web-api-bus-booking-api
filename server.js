const express = require("express");
const mongoose = require("mongoose");
const adminRoutes = require("./src/routes/admin");
const operatorRoutes = require("./src/routes/operator");
const commuterRoutes = require("./src/routes/commuter");
const databaseConnection = require("./databaseConnection");
const { swaggerUi, specs } = require("./src/config/swagger");

const app = express();
app.use(express.json());

databaseConnection();

// Routes
app.use("/admin", adminRoutes);
app.use("/operator", operatorRoutes);
app.use("/commuter", commuterRoutes);

// Swagger setup
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(specs));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
