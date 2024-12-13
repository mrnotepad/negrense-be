const db = require("../models/db");

exports.getCalendarData = async (req, res) => {
  try {
    // Fetch all bookings with guest details
    const [bookings] = await db.query(`
      SELECT 
        b.id AS booking_id,
        b.room_id,
        g.full_name AS guest_name,
        g.user_id,
        b.check_in_date,
        b.check_out_date,
        b.total_price,
        b.status
      FROM bookings b
      JOIN guests g ON b.guest_id = g.user_id
      WHERE b.status = 'Success'
    `);

    // Map and format data for frontend
    const formattedBookings = bookings.map((booking) => ({
      id: booking.booking_id,
      roomNumber: booking.room_id,
      guestName: booking.guest_name,
      checkIn: new Date(booking.check_in_date),
      checkOut: new Date(booking.check_out_date),
      totalPrice: booking.total_price,
      status: booking.status,
    }));

    res.status(200).json({ success: true, data: formattedBookings });
  } catch (error) {
    console.error("Error fetching calendar data:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};
