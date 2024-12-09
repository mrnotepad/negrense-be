const crypto = require("crypto");
const db = require("../models/db");

exports.updatehook = async (req, res) => {
  try {
    // Log the raw POST data for debugging
    console.log("Raw POST Data:", req.body);

    // Ensure the request body is parsed correctly
    const rawData =
      typeof req.body === "object" ? req.body : JSON.parse(req.body);
    console.log("Parsed rawData:", rawData);

    // Destructure necessary fields from the parsed JSON payload
    const {
      merchant_id,
      request_id,
      response_id,
      response_code,
      response_message,
      response_advise,
      timestamp,
      rebill_id,
      signature,
    } = rawData;

    // Validate required fields
    if (
      !merchant_id ||
      !request_id ||
      !response_id ||
      !response_code ||
      !response_message ||
      !response_advise ||
      !timestamp ||
      !signature
    ) {
      throw new Error("Missing required fields for signature computation");
    }

    // Merchant key for signature verification
    const merchantKey = "645F2583D7F7A057590BF6B22E651F68"; // Replace with your live/sandbox key

    // Construct the string for signature computation
    const forSign =
      merchant_id +
      request_id +
      response_id +
      response_code +
      response_message +
      response_advise +
      timestamp +
      (rebill_id || ""); // Include rebill_id if present, otherwise default to an empty string

    // Log the constructed string for debugging
    console.log("String for Signature (forSign):", forSign);

    // Compute the signature
    const computedSignature = crypto
      .createHash("sha512")
      .update(forSign + merchantKey)
      .digest("hex");

    // Log computed and received signatures for comparison
    console.log("Signature (Computed):", computedSignature);
    console.log("Signature (Received):", signature);

    // Determine the status based on response_code
    let status = "Failed";

    if (response_code === "GR001" || response_code === "GR002") {
      status = "Success";
    } else if (response_code === "GR033") {
      status = "Pending";
    } else if (response_code === "GR053") {
      status = "Cancelled";
    } else {
      status = "Cancelled";
    }

    console.log(`Payment Status: ${status}, Request ID: ${request_id}`);

    // Update the status in the database
    // Update the status in the database if it's not already 'cancelled'
    db.query(
      "UPDATE bookings SET status = ? WHERE paynamics_req_id = ? AND status != 'cancelled'",
      [status, request_id],
      (err, result) => {
        if (err) {
          console.error("Error updating booking:", err);
          res.status(500).send("Internal Server Error");
        } else if (result.affectedRows === 0) {
          console.log(
            "No booking updated. Status might already be 'cancelled'."
          );
          res
            .status(400)
            .send("Cannot update status. Booking is already cancelled.");
        } else {
          console.log("Booking updated successfully");
          res.status(200).send("Payment response processed successfully");
        }
      }
    );

    res.status(200).send("transaction completed.");
  } catch (error) {
    console.error("Error in updatehook:", error.message);
    res.status(500).send("Internal Server Error");
  }
};
