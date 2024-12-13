const db = require("../models/db");

exports.getBookings = async (req, res) => {
  try {
    // Get pagination, search query, and date range from the request
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const searchQuery = (req.query.search || "").trim(); // Trim spaces before and after the search query
    const startDate = req.query.start_date || null; // Start date for filtering
    const endDate = req.query.end_date || null; // End date for filtering

    // Base SQL query
    let sql = `
      SELECT 
        bookings.id AS booking_id,
        bookings.room_id,
        bookings.paynamics_req_id,
        bookings.active_checkin,
        bookings.category_id,
        bookings.guest_id,
        bookings.status,
        bookings.check_in_date,
        bookings.check_out_date,
        bookings.total_price,
        bookings.created_at,
        bookings.updated_at,
        guests.full_name,
        guests.email,
        guests.phone_number,
        categories.name AS category_name,
        categories.description AS category_description,
        categories.image_url AS category_image_url,
        rooms.id AS room_id,
        rooms.room_number
      FROM bookings
      LEFT JOIN guests ON bookings.guest_id = guests.user_id
      LEFT JOIN categories ON bookings.category_id = categories.id
      LEFT JOIN rooms ON bookings.room_id = rooms.id
      WHERE 
        (bookings.paynamics_req_id LIKE ? OR 
         bookings.status LIKE ? OR 
         guests.full_name LIKE ? OR
         guests.email LIKE ? OR 
         categories.name LIKE ?)
    `;

    // Add date range filters for check-in and check-out dates if provided
    const queryParams = [
      `%${searchQuery}%`,
      `%${searchQuery}%`,
      `%${searchQuery}%`,
      `%${searchQuery}%`,
      `%${searchQuery}%`,
    ];

    if (startDate && endDate) {
      sql += ` AND bookings.check_in_date >= ? AND bookings.check_out_date <= ?`;
      queryParams.push(startDate, endDate);
    }

    // Add sorting by created_at (descending), limit, and offset
    sql += ` ORDER BY bookings.created_at DESC LIMIT ? OFFSET ?`;
    queryParams.push(limit, offset);

    // Execute the query to fetch bookings
    const [rows] = await db.query(sql, queryParams);

    // Get the total count of bookings for pagination info
    let countSql = `
      SELECT COUNT(*) AS total 
      FROM bookings
      LEFT JOIN guests ON bookings.guest_id = guests.id
      LEFT JOIN categories ON bookings.category_id = categories.id
      WHERE 
        (bookings.paynamics_req_id LIKE ? OR 
         bookings.status LIKE ? OR 
         guests.full_name LIKE ? OR
         guests.email LIKE ? OR 
         categories.name LIKE ?)
    `;

    const countParams = [
      `%${searchQuery}%`,
      `%${searchQuery}%`,
      `%${searchQuery}%`,
      `%${searchQuery}%`,
      `%${searchQuery}%`,
    ];

    if (startDate && endDate) {
      countSql += ` AND bookings.check_in_date >= ? AND bookings.check_out_date <= ?`;
      countParams.push(startDate, endDate);
    }

    const [[{ total }]] = await db.query(countSql, countParams);

    // Return response with bookings and pagination info
    return res.json({
      message: "Successfully fetched booking details",
      bookings: rows,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalItems: total,
      },
    });
  } catch (error) {
    console.error("Error fetching bookings:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
