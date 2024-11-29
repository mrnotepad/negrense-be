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
//add max year
//dont accept yesterday dates
router.get(
  "/search/:category_id/:start_date/:end_date",
  authenticateToken,
  async (req, res) => {
    try {
      if (req.user) {
        //console.log("User is Admin:", req.user.isAdmin);
        return getAvailableRooms(req, res); // Delegate to the controllerc function
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

module.exports = router;
