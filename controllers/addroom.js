const db = require("../models/db"); // Import your MySQL2 connection pool

exports.createRoom = async (req, res) => {
  try {
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
    if (
      !room_number ||
      !room_floor ||
      !category_id ||
      !capacity ||
      !price_per_night ||
      !bed_type ||
      !note
    ) {
      return res
        .status(400)
        .json({ error: "All fields except availability are required." });
    }

    // Check if the room_number already exists in the database
    const checkQuery =
      "SELECT COUNT(*) AS count FROM rooms WHERE room_number = ?";
    const [rows] = await db.execute(checkQuery, [room_number]);

    if (rows[0].count > 0) {
      return res.status(400).json({ error: "Room number already exists." });
    }

    // If no duplicate, insert the new room into the database
    const insertQuery = `
      INSERT INTO rooms (room_number, room_floor, category_id, capacity, price_per_night, availability, bed_type, note, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
    `;

    const [result] = await db.execute(insertQuery, [
      room_number,
      room_floor,
      category_id,
      capacity,
      price_per_night,
      availability,
      bed_type,
      note,
    ]);

    res.status(201).json({
      message: "Room created successfully.",
      room: {
        id: result.insertId,
        room_number,
        room_floor,
        category_id,
        capacity,
        price_per_night,
        availability,
        bed_type,
        note,
      },
    });
  } catch (error) {
    console.error("Error creating room:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
