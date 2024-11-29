const db = require("../models/db");

exports.getAvailableRooms = async (req, res) => {
  try {
    const category_id = req.params.category_id;
    const start_date = req.params.start_date;
    const end_date = req.params.end_date;

    const query = `
      SELECT 
          r.id, 
          r.room_number, 
          r.room_floor, 
          r.capacity, 
          r.price_per_night, 
          r.bed_type, 
          r.note,
          c.name AS category_name, 
          c.description AS category_description, 
          c.image_url AS category_image
      FROM 
          rooms r
      INNER JOIN 
          categories c ON r.category_id = c.id
      LEFT JOIN 
          bookings b ON r.id = b.room_id AND b.status != 'Cancelled' AND (
              (b.check_in_date < ? AND b.check_out_date > ?) OR
              (b.check_out_date = ? AND TIME(b.check_out_date) > '12:00:00')
          )
      WHERE 
          r.category_id = ? AND
          r.availability = 1 AND
          b.id IS NULL;
    `;

    const [results] = await db.query(query, [
      end_date, // Ensure no future bookings overlap with the search range
      start_date, // Check overlap with the search's start date
      start_date, // Exact match on check-out date for same-day cases
      category_id, // Filter by room category
    ]);

    res.status(200).json({ availableRooms: results });
  } catch (error) {
    console.error("Error fetching available rooms: ", error);
    res
      .status(500)
      .json({ message: "An error occurred while fetching available rooms." });
  }
};
