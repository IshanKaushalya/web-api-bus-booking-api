const swaggerJsdoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "NTC API",
      version: "1.0.0",
      description:
        "API documentation for the National Transport Commission of Sri Lanka",
    },
    servers: [
      {
        url: "http://localhost:5000",
      },
      {
        url: "https://web-api-bus-booking-api-production-2c85.up.railway.app",
      },
    ],
  },
  apis: ["./src/routes/*.js"], // Path to the API docs
};

const specs = swaggerJsdoc(options);

module.exports = {
  swaggerUi,
  specs,
};
