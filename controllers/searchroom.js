const db = require("../models/db");

exports.getAvailableRooms = async (req, res) => {
  try {
    const category_id = req.params.category_id;
    const start_date = req.params.start_date;
    const end_date = req.params.end_date;

    // Check if category_id is 'all' and adjust the query accordingly
    let query = `
      SELECT 
          r.id, 
          r.room_number, 
          r.room_floor, 
          r.capacity, 
          r.price_per_night, 
          r.bed_type, 
          r.note,
          c.id AS cat_id,
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
          r.availability = 1 AND
          b.id IS NULL
    `;

    const queryParams = [end_date, start_date, start_date];

    if (category_id !== "all") {
      query += ` AND r.category_id = ?`;
      queryParams.push(category_id);
    }

    const [results] = await db.query(query, queryParams);

    res.status(200).json({ availableRooms: results });
  } catch (error) {
    console.error("Error fetching available rooms: ", error);
    res
      .status(500)
      .json({ message: "An error occurred while fetching available rooms." });
  }
};
