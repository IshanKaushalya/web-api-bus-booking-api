const nodemailer = require("nodemailer");
require("dotenv").config();

const transporter = nodemailer.createTransport({
  host: "smtp.elasticemail.com",
  port: 2525,
  auth: {
    user: process.env.ELASTIC_EMAIL_USER,
    pass: process.env.ELASTIC_EMAIL_PASS,
  },
});

const sendBookingConfirmation = (email, bookingDetails) => {
  const mailOptions = {
    from: process.env.ELASTIC_EMAIL_USER,
    to: email,
    subject: "Booking Confirmation",
    text: `Your booking is confirmed. Details: ${JSON.stringify(
      bookingDetails
    )}`,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log("Error sending email:", error);
    } else {
      console.log("Email sent:", info.response);
    }
  });
};

module.exports = sendBookingConfirmation;
