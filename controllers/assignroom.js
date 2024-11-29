const db = require("../models/db");

exports.assignRoom = async (req, res) => {
  const new_room_id = req.params.new_room_id;
  const booking_id = req.params.booking_id;

  console.log(new_room_id, booking_id);

  try {
    // Update room_id for bookings with the specified category_id
    const [result] = await db.query(
      `UPDATE bookings SET room_id = ? WHERE id = ?`,
      [new_room_id, booking_id]
    );

    if (result.affectedRows > 0) {
      res.status(200).json({ message: "room_id updated successfully." });
    } else {
      res
        .status(404)
        .json({ message: "No bookings found for the specified booking id." });
    }
  } catch (error) {
    console.error("Error updating room_id:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};
