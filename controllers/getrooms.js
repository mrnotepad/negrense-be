const db = require("../models/db");

exports.getRooms = async (req, res) => {
  try {
    // Get pagination and search query from the request
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const searchQuery = req.query.search || ""; // Get search query (defaults to empty string if not provided)

    // SQL query with search filter
    const [rows] = await db.query(
      "SELECT * FROM rooms WHERE room_number LIKE ? OR category_id LIKE ? OR capacity LIKE ? OR price_per_night LIKE ? LIMIT ? OFFSET ?",
      [
        `%${searchQuery}%`,
        `%${searchQuery}%`,
        `%${searchQuery}%`,
        `%${searchQuery}%`,
        limit,
        offset,
      ]
    );

    // Get the total count of rooms for pagination info
    const [[{ total }]] = await db.query(
      "SELECT COUNT(*) AS total FROM rooms WHERE room_number LIKE ? OR category_id LIKE ? OR capacity LIKE ? OR price_per_night LIKE ?",
      [
        `%${searchQuery}%`,
        `%${searchQuery}%`,
        `%${searchQuery}%`,
        `%${searchQuery}%`,
      ]
    );

    // Return response with rooms and pagination info
    return res.json({
      message: "Successfully fetched room details",
      rooms: rows,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalItems: total,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
