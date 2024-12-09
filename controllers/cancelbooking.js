const db = require("../models/db");

exports.cancelbooking = async (req, res) => {
  const { reservationId } = req.body;

  if (!reservationId) {
    return res.status(400).json({ message: "Reservation ID is required" });
  }

  try {
    // Check the current status of the booking
    const [results] = await db.query(
      "SELECT status FROM bookings WHERE id = ?",
      [reservationId]
    );

    if (results.length === 0) {
      return res.status(404).json({ message: "Booking not found" });
    }

    const currentStatus = results[0].status;

    // If the status is already "Cancelled", do not update
    if (currentStatus === "Cancelled") {
      return res.status(400).json({ message: "Booking is already cancelled" });
    }

    // Update the status to "Cancelled"
    const [updateResult] = await db.query(
      "UPDATE bookings SET status = ? WHERE id = ?",
      ["Cancelled", reservationId]
    );

    if (updateResult.affectedRows === 0) {
      return res.status(500).json({ message: "Failed to cancel booking" });
    }

    return res.status(200).json({ message: "Booking cancelled successfully" });
  } catch (err) {
    console.error("Error cancelling booking:", err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
