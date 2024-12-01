const db = require("../models/db");

exports.getCategoriesOnly = async (req, res) => {
  try {
    // Extract parameters from the request
    const categoryId = req.params.id; // Category ID from the route parameter

    // Define the base SQL query
    let sqlQuery = `SELECT * FROM categories`;
    const queryParams = [];

    // Add condition if categoryId is provided
    if (categoryId) {
      sqlQuery += ` WHERE id = ?`;
      queryParams.push(categoryId);
    }

    // Add ordering clause
    sqlQuery += ` ORDER BY created_at DESC`;

    // Execute the query
    const [rows] = await db.query(sqlQuery, queryParams);

    // Check if any rooms were found
    if (rows.length === 0) {
      return res.status(404).json({ message: "No rooms found" });
    }

    // Send response with room details
    return res.json({
      message: "Successfully fetched categories",
      categories: rows,
    });
  } catch (error) {
    console.error("Error fetching rooms by category:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
