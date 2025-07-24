// scriptly-backend/routes/userRoutes.js

const express = require("express");
const {
  getAllUsers,
  getUserById,
  updateUserRoleOrChapter,
  vouchUser,
  getRegisteredEvents,
  changePassword, // New: Import the new function
} = require("../controllers/userController");
const { protect, authorizeRoles } = require("../middleware/authMiddleware");

const router = express.Router();

// Get all users (Admin only)
router.get("/", protect, authorizeRoles("admin"), getAllUsers);

// Get single user by ID
router.get("/:id", protect, getUserById);

// Update user role, chapter, or name
router.put(
  "/:id/role",
  protect,
  authorizeRoles("student", "chapter-lead", "admin"),
  updateUserRoleOrChapter
);

// Vouch for a user (Admin or Chapter Lead)
router.post(
  "/:id/vouch",
  protect,
  authorizeRoles("admin", "chapter-lead"),
  vouchUser
);

// Get events a user is registered for (User themselves or Admin)
router.get("/:id/registered-events", protect, getRegisteredEvents);

// Change user's password (User themselves)
router.put("/:id/password", protect, changePassword); // New: Add this route

module.exports = router;
