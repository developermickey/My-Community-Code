// scriptly-backend/routes/chapterRoutes.js

const express = require("express");
const {
  createChapter,
  getAllChapters,
  getChapterById,
  updateChapter,
  deleteChapter,
} = require("../controllers/chapterController");
const { protect, authorizeRoles } = require("../middleware/authMiddleware");

const router = express.Router();

// Routes for Chapter Management (Admin Only for CUD, Public for Read All/Single)
router
  .route("/")
  .post(protect, authorizeRoles("admin"), createChapter) // Only Admin can create
  .get(getAllChapters); // Anyone can view all chapters

router
  .route("/:id")
  .get(getChapterById) // Anyone can view a single chapter
  .put(protect, authorizeRoles("admin"), updateChapter) // Only Admin can update
  .delete(protect, authorizeRoles("admin"), deleteChapter); // Only Admin can delete

module.exports = router;
