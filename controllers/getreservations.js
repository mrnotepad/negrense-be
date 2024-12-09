const db = require("../models/db");

exports.getReservations = async (req, res) => {
  try {
    // Extract user ID from the authenticated user object
    const userId = req.user.id;

    // Validate the user ID
    if (!userId) {
      return res.status(400).json({ message: "User ID is required." });
    }

    // Query the database to fetch reservations for the authenticated user
    const [reservations] = await db.query(
      `
      SELECT 
        bookings.id,
        bookings.room_id,
        bookings.category_id,
        bookings.check_in_date,
        bookings.check_out_date,
        bookings.total_price,
        bookings.status,
        bookings.paynamics_req_id,
        bookings.created_at,
        bookings.updated_at,
        rooms.bed_type AS bed_type,
        categories.name AS category_name
      FROM bookings
      LEFT JOIN rooms ON bookings.room_id = rooms.id
      LEFT JOIN categories ON bookings.category_id = categories.id
      WHERE bookings.guest_id = ?
      ORDER BY bookings.created_at DESC
      `,
      [userId]
    );

    // Check if reservations were found
    if (reservations.length === 0) {
      return res
        .status(404)
        .json({ message: "No reservations found for this user." });
    }

    // Send the fetched reservations
    res.status(200).json({
      message: "Reservations fetched successfully.",
      reservations,
    });
  } catch (error) {
    console.error("Error fetching reservations:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};
