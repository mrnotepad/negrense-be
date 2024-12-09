const db = require("../models/db");

exports.updateProfile = async (req, res) => {
  try {
    // Extract user ID from the authenticated token
    const userId = req.user.id;

    // Extract profile update fields from the request body
    const { name, phone, email, address } = req.body;

    // Validate the inputs
    if (!name || !phone || !email || !address) {
      return res.status(400).json({ message: "All fields are required." });
    }

    // Update the user's profile in the database
    const updateQuery = `
      UPDATE guests
      SET full_name = ?, phone_number = ?, email = ?, address = ?
      WHERE user_id = ?
    `;
    const updateValues = [name, phone, userId, email, address];

    // Execute the update query
    const [updateResult] = await db.execute(updateQuery, updateValues);

    if (updateResult.affectedRows === 0) {
      // If no rows were updated, insert a new user record
      const insertQuery = `
        INSERT INTO guests (user_id, full_name, phone_number, email, address)
        VALUES (?, ?, ?, ?, ?)
      `;
      const insertValues = [userId, name, phone, email, address];

      const [insertResult] = await db.execute(insertQuery, insertValues);

      if (insertResult.affectedRows === 0) {
        return res
          .status(500)
          .json({ message: "Failed to create a new user." });
      }

      return res
        .status(201)
        .json({ message: "New user profile created successfully." });
    }

    // Respond with success if update was successful
    res.status(200).json({ message: "Profile updated successfully." });
  } catch (error) {
    console.error("Error updating or creating profile:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};
