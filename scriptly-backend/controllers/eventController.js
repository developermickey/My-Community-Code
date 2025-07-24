// scriptly-backend/controllers/eventController.js

const Event = require("../models/Event");
const Chapter = require("../models/Chapter");
const User = require("../models/User");

// @desc    Create a new event
// @route   POST /api/events
// @access  Private (Chapter Lead or Admin only)
exports.createEvent = async (req, res) => {
  const { name, description, date, location, chapterId } = req.body;

  // The organizer will be the logged-in user (Chapter Lead or Admin)
  const organizerId = req.user.id;
  const organizerRole = req.user.role;

  if (!name || !description || !date || !location || !chapterId) {
    return res
      .status(400)
      .json({ message: "Please enter all required event fields" });
  }

  try {
    const chapter = await Chapter.findById(chapterId);
    if (!chapter) {
      return res.status(404).json({ message: "Chapter not found" });
    }

    // If the user is a Chapter Lead, ensure they are the lead of the specified chapter
    if (
      organizerRole === "chapter-lead" &&
      chapter.chapterLead.toString() !== organizerId.toString()
    ) {
      return res
        .status(403)
        .json({
          message: "Chapter Lead can only create events for their own chapter",
        });
    }

    const event = new Event({
      name,
      description,
      date: new Date(date), // Ensure date is stored as a Date object
      location,
      chapter: chapter._id,
      organizer: organizerId,
    });

    await event.save();

    res.status(201).json({ message: "Event created successfully", event });
  } catch (error) {
    console.error("Error creating event:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Get all events
// @route   GET /api/events
// @access  Public
exports.getAllEvents = async (req, res) => {
  try {
    // Populate chapter and organizer details
    const events = await Event.find()
      .populate("chapter", "name") // Only get chapter name
      .populate("organizer", "name email"); // Only get organizer name and email
    res.status(200).json(events);
  } catch (error) {
    console.error("Error fetching events:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Get a single event by ID
// @route   GET /api/events/:id
// @access  Public
exports.getEventById = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate("chapter", "name")
      .populate("organizer", "name email")
      .populate("attendees", "name email role vouchCount"); // Populate attendees

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    res.status(200).json(event);
  } catch (error) {
    console.error("Error fetching event:", error);
    if (error.kind === "ObjectId") {
      return res.status(400).json({ message: "Invalid event ID" });
    }
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Update an event
// @route   PUT /api/events/:id
// @access  Private (Chapter Lead who organized it, or Admin)
exports.updateEvent = async (req, res) => {
  const { name, description, date, location, chapterId } = req.body;
  const userId = req.user.id;
  const userRole = req.user.role;

  try {
    let event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    // Check if the user is the organizer or an admin
    if (
      userRole !== "admin" &&
      event.organizer.toString() !== userId.toString()
    ) {
      return res
        .status(403)
        .json({ message: "Not authorized to update this event" });
    }

    if (chapterId) {
      const chapter = await Chapter.findById(chapterId);
      if (!chapter) {
        return res.status(404).json({ message: "New chapter not found" });
      }
      event.chapter = chapter._id;
    }

    event.name = name || event.name;
    event.description = description || event.description;
    event.date = date ? new Date(date) : event.date;
    event.location = location || event.location;

    await event.save();

    res.status(200).json({ message: "Event updated successfully", event });
  } catch (error) {
    console.error("Error updating event:", error);
    if (error.kind === "ObjectId") {
      return res.status(400).json({ message: "Invalid event ID" });
    }
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Delete an event
// @route   DELETE /api/events/:id
// @access  Private (Chapter Lead who organized it, or Admin)
exports.deleteEvent = async (req, res) => {
  const userId = req.user.id;
  const userRole = req.user.role;

  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    // Check if the user is the organizer or an admin
    if (
      userRole !== "admin" &&
      event.organizer.toString() !== userId.toString()
    ) {
      return res
        .status(403)
        .json({ message: "Not authorized to delete this event" });
    }

    await Event.deleteOne({ _id: req.params.id });

    res.status(200).json({ message: "Event deleted successfully" });
  } catch (error) {
    console.error("Error deleting event:", error);
    if (error.kind === "ObjectId") {
      return res.status(400).json({ message: "Invalid event ID" });
    }
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Register user for an event
// @route   POST /api/events/:id/register
// @access  Private (Students, Chapter Leads, Admin)
exports.registerForEvent = async (req, res) => {
  const eventId = req.params.id;
  const userId = req.user.id; // The logged-in user

  try {
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    // Check if user is already registered
    if (event.attendees.includes(userId)) {
      return res
        .status(400)
        .json({ message: "Already registered for this event" });
    }

    event.attendees.push(userId);
    await event.save();

    res
      .status(200)
      .json({ message: "Successfully registered for event", event });
  } catch (error) {
    console.error("Error registering for event:", error);
    if (error.kind === "ObjectId") {
      return res.status(400).json({ message: "Invalid event ID" });
    }
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Deregister user from an event
// @route   POST /api/events/:id/deregister
// @access  Private (Students, Chapter Leads, Admin)
exports.deregisterFromEvent = async (req, res) => {
  const eventId = req.params.id;
  const userId = req.user.id; // The logged-in user

  try {
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    // Check if user is registered
    if (!event.attendees.includes(userId)) {
      return res.status(400).json({ message: "Not registered for this event" });
    }

    event.attendees = event.attendees.filter(
      (attendee) => attendee.toString() !== userId.toString()
    );
    await event.save();

    res
      .status(200)
      .json({ message: "Successfully deregistered from event", event });
  } catch (error) {
    console.error("Error deregistering from event:", error);
    if (error.kind === "ObjectId") {
      return res.status(400).json({ message: "Invalid event ID" });
    }
    res.status(500).json({ message: "Server error" });
  }
};
