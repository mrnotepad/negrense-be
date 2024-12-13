const db = require("../models/db");

exports.updateBooking = async (req, res) => {
  try {
    const { bookingId, activeCheckin } = req.body;

    // Validate input
    if (!bookingId || !activeCheckin) {
      return res.status(400).json({
        message: "bookingId and activeCheckin are required.",
      });
    }

    // Update the active_checkin field for the given bookingId
    const query = `
      UPDATE bookings 
      SET active_checkin = ?, updated_at = NOW()
      WHERE id = ?
    `;

    const [result] = await db.query(query, [activeCheckin, bookingId]);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        message: "Booking not found.",
      });
    }

    res.status(200).json({
      message: "Booking updated successfully.",
    });
  } catch (error) {
    console.error("Error updating booking:", error);
    res.status(500).json({
      message: "Internal server error.",
    });
  }
};
