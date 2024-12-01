const db = require("../models/db");

exports.getUserData = async (req, res) => {
  try {
    // Extract user ID from the route parameters
    const usrID = req.params.id;

    // Validate that user ID is provided
    if (!usrID) {
      return res.status(400).json({ message: "User ID is required" });
    }

    // Define the SQL query to fetch user data
    const sqlQuery = `SELECT * FROM guests WHERE user_id = ? ORDER BY created_at DESC`;
    const queryParams = [usrID];

    // Execute the query
    const [rows] = await db.query(sqlQuery, queryParams);

    // Check if any users were found
    if (rows.length === 0) {
      return res.status(404).json({ message: "No user found" });
    }

    // Send response with user details
    return res.json({
      message: "Successfully fetched user data",
      users: rows,
    });
  } catch (error) {
    console.error("Error fetching user data:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
