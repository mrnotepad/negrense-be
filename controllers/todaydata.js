const db = require("../models/db");

exports.todayData = async (req, res) => {
  try {
    const today = new Date().toISOString().split("T")[0]; // Get today's date in YYYY-MM-DD format

    // Fetch count of rooms with today's check-out date
    const [checkOutToday] = await db.query(
      "SELECT COUNT(*) AS count FROM bookings WHERE check_out_date = ?",
      [today]
    );

    // Fetch count of rooms with today's active check-in
    const [active] = await db.query(
      "SELECT COUNT(*) AS count FROM bookings WHERE check_in_date <= ? AND check_out_date >= ? AND active_checkin = 'IN'",
      [today, today]
    );

    // Fetch count of rooms with today's pending
    const [pending] = await db.query(
      "SELECT COUNT(*) AS count FROM bookings WHERE check_in_date <= ? AND check_out_date >= ? AND active_checkin IS NULL",
      [today, today]
    );

    // Fetch count of pending online bookings
    const [pendingBookings] = await db.query(
      "SELECT COUNT(*) AS count FROM bookings WHERE status = 'Pending'"
    );

    // Assuming operational and out-of-order rooms are stored in a different table `rooms`
    const [operationalRooms] = await db.query(
      "SELECT COUNT(*) AS count FROM rooms WHERE availability = '1'"
    );

    const [outOfOrderRooms] = await db.query(
      "SELECT COUNT(*) AS count FROM rooms WHERE availability = '0'"
    );

    // Send aggregated data as the response
    res.status(200).json({
      checkOutToday: checkOutToday[0].count,
      pendingBookings: pendingBookings[0].count,
      operationalRooms: operationalRooms[0].count,
      outOfOrderRooms: outOfOrderRooms[0].count,
      active: active[0].count,
      pending: pending[0].count,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};
