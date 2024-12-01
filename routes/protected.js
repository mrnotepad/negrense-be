const express = require("express");
const router = express.Router();
const authenticateToken = require("../middlewares/authMiddleware");
const { getRooms } = require("../controllers/getrooms");
const { createRoom } = require("../controllers/addroom");
const { editRoom } = require("../controllers/editroom");
const { getBookings } = require("../controllers/getbookings");
const { getRoomsByCategory } = require("../controllers/getcategories");
const { assignRoom } = require("../controllers/assignroom");
const { getAvailableRooms } = require("../controllers/searchroom");
const { getCategoriesOnly } = require("../controllers/getcategories-only");
const { getUserData } = require("../controllers/check-user-data");

router.get("/dashboard", authenticateToken, (req, res) => {
  res.json({
    message: "successfully logged in",
    user: req.user, // Access user data from the tokens
  });
});

router.get("/rooms", authenticateToken, async (req, res) => {
  try {
    console.log("Decoded User:", req.user); // Debug log
    // Check if the user is an admin
    if (req.user.isAdmin === 1) {
      //console.log("User is Admin:", req.user.isAdmin);
      return getRooms(req, res); // Delegate to the controller function
    }

    // Non-admin response
    res.status(403).json({
      message: "Access denied. Admin privileges required.",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.post("/rooms/add", authenticateToken, async (req, res) => {
  try {
    console.log("Decoded User:", req.user); // Debug log
    // Check if the user is an admin
    if (req.user.isAdmin === 1) {
      //console.log("User is Admin:", req.user.isAdmin);
      return createRoom(req, res); // Delegate to the controller function
    }

    // Non-admin response
    res.status(403).json({
      message: "Access denied. Admin privileges required.",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.put("/rooms/edit/:id", authenticateToken, async (req, res) => {
  try {
    console.log("Decoded User:", req.user); // Debug log
    // Check if the user is an admin
    if (req.user.isAdmin === 1) {
      //console.log("User is Admin:", req.user.isAdmin);
      return editRoom(req, res); // Delegate to the controller function
    }

    // Non-admin response
    res.status(403).json({
      message: "Access denied. Admin privileges required.",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

//booking

router.get("/bookings", authenticateToken, async (req, res) => {
  try {
    console.log("Decoded User:", req.user); // Debug log
    // Check if the user is an admin
    if (req.user.isAdmin === 1) {
      //console.log("User is Admin:", req.user.isAdmin);
      return getBookings(req, res); // Delegate to the controller function
    }

    // Non-admin response
    res.status(403).json({
      message: "Access denied. Admin privileges required.",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

//get room categories
router.get("/rooms/category/:id", authenticateToken, async (req, res) => {
  try {
    console.log("Decoded User:", req.user); // Debug log
    // Check if the user is an admin
    if (req.user.isAdmin === 1) {
      //console.log("User is Admin:", req.user.isAdmin);
      return getRoomsByCategory(req, res); // Delegate to the controller function
    }

    // Non-admin response
    res.status(403).json({
      message: "Access denied. Admin privileges required.",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

//get room categories
router.post(
  "/update/booking/:new_room_id/:booking_id",
  authenticateToken,
  async (req, res) => {
    try {
      console.log("Incoming Request:", req.method, req.url); // Debug log console.log("Request Params:", req.params); // Debug log console.log("Decoded User:", req.user);
      // Check if the user is an admin
      if (req.user.isAdmin === 1) {
        //console.log("User is Admin:", req.user.isAdmin);
        return assignRoom(req, res); // Delegate to the controllerc function
      }

      // Non-admin response
      res.status(403).json({
        message: "Access denied. Admin privileges required.",
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal server error" });
    }
  }
);

//searchroom
// todo dont accept if endate is lower than start date
//add max month to 6 months.
//dont accept yesterday dates
router.get(
  "/search/:category_id/:start_date/:end_date",
  authenticateToken,
  async (req, res) => {
    try {
      if (!req.user) {
        return res.status(403).json({
          message: "Access denied. Admin privileges required.",
        });
      }

      // Parse the start and end dates from the request
      const { start_date, end_date } = req.params;
      const startDate = new Date(start_date);
      const endDate = new Date(end_date);
      const today = new Date();
      const maxDate = new Date(today);
      maxDate.setMonth(today.getMonth() + 6);

      // Validate that the dates are properly formatted
      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        return res.status(400).json({
          message: "Invalid date format. Please use YYYY-MM-DD.",
        });
      }

      // Ensure endDate is not before startDate
      if (endDate < startDate) {
        return res.status(400).json({
          message: "End date cannot be earlier than start date.",
        });
      }

      // Ensure dates are not in the past
      if (endDate < today || startDate < today) {
        return res.status(400).json({
          message: "Dates cannot be in the past.",
        });
      }

      // Ensure endDate does not exceed 6 months from today
      if (endDate > maxDate) {
        return res.status(400).json({
          message: "End date cannot be more than 6 months from today.",
        });
      }

      // Additional checks for the date range (if needed)
      if (startDate.getTime() === endDate.getTime()) {
        return res.status(400).json({
          message: "Start date and end date cannot be the same.",
        });
      }

      // Delegate to the controller function if all checks pass
      return getAvailableRooms(req, res);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal server error" });
    }
  }
);

router.get("/getallcategories/:id?", authenticateToken, async (req, res) => {
  try {
    if (req.user) {
      //console.log("User is Admin:", req.user.isAdmin);
      return getCategoriesOnly(req, res); // Delegate to the controllerc function
    }

    // Non-admin response
    res.status(403).json({
      message: "Access denied.",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.get("/getuser", authenticateToken, async (req, res) => {
  try {
    if (req.user) {
      // Assuming `req.user` contains the user's ID from the token
      return res.status(200).json({
        id: req.user.id, // Return the user ID
        message: "User data fetched successfully.",
      });
    }

    // Non-admin response
    res.status(403).json({
      message: "Access denied.",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.get("/getUser/:id?", authenticateToken, async (req, res) => {
  try {
    if (req.user) {
      //console.log("User is Admin:", req.user.isAdmin);
      return getUserData(req, res); // Delegate to the controllerc function
    }

    // Non-admin response
    res.status(403).json({
      message: "Access denied.",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = router;
