const express = require("express");
const { updatehook } = require("../controllers/call-hook"); // Destructure to get the function
const { getCategoriesOnly } = require("../controllers/getcategories-only");

const axios = require("axios");
const crypto = require("crypto");

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

router.get("/getallcategories/:id?", async (req, res) => {
  try {
    return getCategoriesOnly(req, res); // Delegate to the controllerc function
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

const merchantId = process.env.MERCHANT_ID;
const merchantKey = process.env.MERCHANT_KEY;
const apiUsername = process.env.API_USERNAME;
const apiPassword = process.env.API_PASSWORD;
// Function to generate SHA-512 signature
const generateSignature = (merchantId, merchantKey, requestId, orgTrxid2) => {
  const rawTrx = merchantId + requestId + orgTrxid2 + merchantKey;
  return crypto.createHash("sha512").update(rawTrx).digest("hex");
};

router.get("/verify", async (req, res) => {
  try {
    // Extract `org_trxid2` from query parameters (or body, if required)
    const { org_trxid2 } = req.query;

    if (!org_trxid2) {
      return res.status(400).json({ message: "org_trxid2 is required" });
    }

    // Generate a unique request ID
    const requestId = `req${Date.now()}${Math.random()
      .toString(36)
      .substring(2, 15)}`;

    // Generate the signature
    const signature = generateSignature(
      merchantId,
      merchantKey,
      requestId,
      org_trxid2
    );

    // Prepare the data to send
    const postData = {
      request_id: requestId,
      org_trxid2,
      signature,
    };

    // Make the API request
    const response = await axios.post(process.env.PAYNAMICS_QUERY, postData, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${Buffer.from(
          `${apiUsername}:${apiPassword}`
        ).toString("base64")}`,
      },
    });

    // Respond with the API response
    res.status(200).json(response.data);
  } catch (error) {
    console.error("Error in /verify:", error);

    if (error.response) {
      // API responded with an error
      res.status(error.response.status).json({
        message: error.response.data || "Error from API",
      });
    } else if (error.request) {
      // Request was made but no response was received
      res.status(500).json({
        message: "No response received from API",
      });
    } else {
      // Other errors
      res.status(500).json({
        message: "Internal server error",
      });
    }
  }
});

module.exports = router;
