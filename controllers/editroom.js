const db = require("../models/db"); // Import your MySQL2 connection pool

exports.editRoom = async (req, res) => {
  try {
    const { id } = req.params; // Room ID from the route parameter
    const {
      room_number,
      room_floor,
      category_id,
      capacity,
      price_per_night,
      availability,
      bed_type,
      note,
    } = req.body;

    // Validate required fields
    if (!id) {
      return res.status(400).json({ error: "Room ID is required." });
    }

    // Check if the room exists
    const checkQuery = "SELECT COUNT(*) AS count FROM rooms WHERE id = ?";
    const [rows] = await db.execute(checkQuery, [id]);
    if (rows[0].count === 0) {
      return res.status(404).json({ error: "Room not found." });
    }

    // Update the room
    const updateQuery = `
      UPDATE rooms
      SET
        room_number = COALESCE(?, room_number),
        room_floor = COALESCE(?, room_floor),
        category_id = COALESCE(?, category_id),
        capacity = COALESCE(?, capacity),
        price_per_night = COALESCE(?, price_per_night),
        availability = COALESCE(?, availability),
        bed_type = COALESCE(?, bed_type),
        note = COALESCE(?, note),
        updated_at = NOW()
      WHERE id = ?
    `;
    const [result] = await db.execute(updateQuery, [
      room_number,
      room_floor,
      category_id,
      capacity,
      price_per_night,
      availability,
      bed_type,
      note,
      id,
    ]);

    if (result.affectedRows === 0) {
      return res.status(500).json({ error: "Failed to update room." });
    }

    res.status(200).json({ message: "Room updated successfully." });
  } catch (error) {
    console.error("Error updating room:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
