const express = require("express");
const { updatehook } = require("../controllers/call-hook"); // Destructure to get the function

const router = express.Router();

// Middleware to log incoming request details
router.use((req, res, next) => {
  const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress; // Get client IP address
  const domain = req.hostname; // Get the hostname/domain of the request
  console.log(`Incoming request from IP: ${ip}, Domain: ${domain}`);
  console.log(`Request Method: ${req.method}, URL: ${req.originalUrl}`);
  next(); // Proceed to the next middleware or route handler
});

// Set up the POST route
router.post("/hook", updatehook);

module.exports = router;
