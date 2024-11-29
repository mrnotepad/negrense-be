const db = require("../models/db");

exports.getRoomsByCategory = async (req, res) => {
  try {
    // Extract parameters from the request
    const categoryId = req.params.id; // Room ID from the route parameter
    // Validate category_id

    if (!categoryId) {
      return res.status(400).json({ error: "Invalid or missing category_id" });
    }

    // SQL query to fetch rooms filtered by category_id with pagination and search
    const [rows] = await db.query(
      `SELECT 
         id,
         room_number,
         room_floor,
         category_id,
         capacity,
         price_per_night,
         availability,
         bed_type,
         note,
         created_at,
         updated_at
       FROM rooms
       WHERE 
         category_id = ? 
       ORDER BY created_at DESC -- Sort by the latest created rooms
       `,
      [categoryId]
    );

    // Send response with room details and pagination
    return res.json({
      message: "Successfully fetched rooms by category",
      rooms: rows,
    });
  } catch (error) {
    console.error("Error fetching rooms by category:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
