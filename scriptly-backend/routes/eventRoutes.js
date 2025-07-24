// scriptly-backend/routes/eventRoutes.js

const express = require("express");
const {
  createEvent,
  getAllEvents,
  getEventById,
  updateEvent,
  deleteEvent,
  registerForEvent,
  deregisterFromEvent,
} = require("../controllers/eventController");
const { protect, authorizeRoles } = require("../middleware/authMiddleware");

const router = express.Router();

// Routes for Event Management
router
  .route("/")
  .post(protect, authorizeRoles("chapter-lead", "admin"), createEvent) // Chapter Lead or Admin can create
  .get(getAllEvents); // Anyone can view all events

router
  .route("/:id")
  .get(getEventById) // Anyone can view a single event
  .put(protect, authorizeRoles("chapter-lead", "admin"), updateEvent) // Chapter Lead (organizer) or Admin can update
  .delete(protect, authorizeRoles("chapter-lead", "admin"), deleteEvent); // Chapter Lead (organizer) or Admin can delete

router.route("/:id/register").post(protect, registerForEvent); // Any authenticated user can register

router.route("/:id/deregister").post(protect, deregisterFromEvent); // Any authenticated user can deregister

module.exports = router;
