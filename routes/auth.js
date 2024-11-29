const express = require("express");
const authController = require("../controllers/authcontroller");

const router = express.Router();

router.post("/signup", authController.signup);
router.get("/verify-email", authController.verifyEmail);
router.post("/login", authController.login);
router.post("/reset-password", authController.resetPassword);
router.post("/update-password", authController.updatePassword);

module.exports = router;
