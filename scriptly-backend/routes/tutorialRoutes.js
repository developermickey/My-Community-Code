const express = require("express");
const {
  createCategory,
  getAllCategories,
  updateCategory,
  deleteCategory,
  createTutorial, // <--- ENSURE THIS IS PRESENT AND SPELLED CORRECTLY!
  getAllTutorials,
  getTutorialById, // Also ensuring all others are present
  updateTutorial,
  deleteTutorial,
  approveTutorial,
  rejectTutorial,
} = require("../controllers/tutorialController"); // Make sure this path is correct

const { protect, authorizeRoles } = require("../middleware/authMiddleware");

const router = express.Router();

// --- Category Routes (Admin Only for CUD, Public for Read) ---
router
  .route("/categories")
  .post(protect, authorizeRoles("admin"), createCategory)
  .get(getAllCategories);

router
  .route("/categories/:id")
  .put(protect, authorizeRoles("admin"), updateCategory)
  .delete(protect, authorizeRoles("admin"), deleteCategory);

// --- Tutorial Routes ---
router
  .route("/")
  .post(protect, createTutorial) // This is the line at tutorialRoutes.js:36:4
  .get(getAllTutorials);

router
  .route("/:id")
  .get(getTutorialById)
  .put(protect, updateTutorial)
  .delete(protect, deleteTutorial);

// --- Admin Specific Tutorial Approval Routes ---
router.put("/:id/approve", protect, authorizeRoles("admin"), approveTutorial);
router.put("/:id/reject", protect, authorizeRoles("admin"), rejectTutorial);

module.exports = router;
