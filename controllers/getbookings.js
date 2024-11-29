const db = require("../models/db");

exports.getBookings = async (req, res) => {
  try {
    // Get pagination and search query from the request
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const searchQuery = req.query.search || "";

    // SQL query with search filter, JOIN to include guest and category information, and sorting by created_at (latest first)
    const [rows] = await db.query(
      `SELECT 
         bookings.id AS booking_id,  -- Alias to avoid conflict
         bookings.room_id,
         bookings.paynamics_req_id,
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
         rooms.id AS room_id,        -- Alias to avoid conflict
         rooms.room_number
       FROM bookings
       LEFT JOIN guests ON bookings.guest_id = guests.id
       LEFT JOIN categories ON bookings.category_id = categories.id
       LEFT JOIN rooms ON bookings.room_id = rooms.id
       WHERE 
         bookings.paynamics_req_id LIKE ? OR 
         bookings.status LIKE ? OR 
         guests.full_name LIKE ? OR
         guests.email LIKE ? OR 
         categories.name LIKE ?
       ORDER BY bookings.created_at DESC  -- Sorting by created_at (latest first)
       LIMIT ? OFFSET ?`,
      [
        `%${searchQuery}%`,
        `%${searchQuery}%`,
        `%${searchQuery}%`,
        `%${searchQuery}%`,
        `%${searchQuery}%`,
        limit,
        offset,
      ]
    );

    // Get the total count of bookings for pagination info
    const [[{ total }]] = await db.query(
      `SELECT COUNT(*) AS total 
       FROM bookings
       LEFT JOIN guests ON bookings.guest_id = guests.id
       LEFT JOIN categories ON bookings.category_id = categories.id
       WHERE 
         bookings.paynamics_req_id LIKE ? OR 
         bookings.status LIKE ? OR 
         guests.full_name LIKE ? OR
         guests.email LIKE ? OR 
         categories.name LIKE ?`,
      [
        `%${searchQuery}%`,
        `%${searchQuery}%`,
        `%${searchQuery}%`,
        `%${searchQuery}%`,
        `%${searchQuery}%`,
      ]
    );

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
