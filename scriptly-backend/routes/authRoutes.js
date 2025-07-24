// scriptly-backend/routes/authRoutes.js

const express = require("express");
const {
  registerUser,
  loginUser,
  getProfile,
} = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware"); // We'll create this next

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/profile", protect, getProfile); // Protect this route

module.exports = router;
