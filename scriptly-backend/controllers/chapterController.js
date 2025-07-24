// scriptly-backend/controllers/chapterController.js

const Chapter = require("../models/Chapter");
const User = require("../models/User"); // Needed to update user's chapter field and potentially role
const Event = require("../models/Event"); // Needed for deleteChapter cleanup

// @desc    Create a new chapter
// @route   POST /api/chapters
// @access  Private (Admin only)
exports.createChapter = async (req, res) => {
  const { name, description, chapterLeadId } = req.body;

  if (!name) {
    return res.status(400).json({ message: "Chapter name is required" });
  }

  try {
    const existingChapter = await Chapter.findOne({ name });
    if (existingChapter) {
      return res
        .status(400)
        .json({ message: "Chapter with this name already exists" });
    }

    let chapterLead = null;
    if (chapterLeadId) {
      chapterLead = await User.findById(chapterLeadId);
      if (!chapterLead) {
        return res
          .status(400)
          .json({ message: "Provided Chapter Lead ID is invalid." });
      }
      // Refined logic: Allow student or chapter-lead roles to be assigned as leads.
      // Automatically promote student to chapter-lead if assigned.
      if (chapterLead.role === "admin") {
        return res
          .status(400)
          .json({ message: "An Admin cannot be assigned as a Chapter Lead." });
      }
      if (chapterLead.role === "student") {
        chapterLead.role = "chapter-lead"; // Promote student
      }
      // If already a chapter-lead, no change needed to role.
    }

    const chapter = new Chapter({
      name,
      description,
      chapterLead: chapterLead ? chapterLead._id : null,
    });

    await chapter.save();

    // If a chapter lead is assigned, update their chapter field (and potentially role)
    if (chapterLead) {
      // Unassign previous chapter if the assigned lead was lead of another chapter
      // (This handles reassignment if user was lead of another chapter before being assigned here)
      if (
        chapterLead.chapter &&
        chapterLead.chapter.toString() !== chapter._id.toString()
      ) {
        const oldChapter = await Chapter.findById(chapterLead.chapter);
        if (
          oldChapter &&
          oldChapter.chapterLead &&
          oldChapter.chapterLead.toString() === chapterLead._id.toString()
        ) {
          oldChapter.chapterLead = null; // Unassign from old chapter
          await oldChapter.save();
        }
      }

      chapterLead.chapter = chapter._id;
      await chapterLead.save(); // Save the chapterLead user with updated role/chapter
    }

    res.status(201).json({ message: "Chapter created successfully", chapter });
  } catch (error) {
    console.error("Error creating chapter:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Get all chapters
// @route   GET /api/chapters
// @access  Public (or Private, depending on app requirement. Let's make it public for now)
exports.getAllChapters = async (req, res) => {
  try {
    // Populate chapterLead to get lead's details if needed
    const chapters = await Chapter.find().populate("chapterLead", "name email");
    res.status(200).json(chapters);
  } catch (error) {
    console.error("Error fetching chapters:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Get a single chapter by ID
// @route   GET /api/chapters/:id
// @access  Public
exports.getChapterById = async (req, res) => {
  try {
    const chapter = await Chapter.findById(req.params.id).populate(
      "chapterLead",
      "name email"
    );

    if (!chapter) {
      return res.status(404).json({ message: "Chapter not found" });
    }

    // To get members of a chapter, we query the User model
    const members = await User.find({ chapter: chapter._id }).select(
      "name email role vouchCount"
    );

    res.status(200).json({ chapter, members });
  } catch (error) {
    console.error("Error fetching chapter:", error);
    // Handle CastError for invalid IDs
    if (error.kind === "ObjectId") {
      return res.status(400).json({ message: "Invalid chapter ID" });
    }
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Update a chapter
// @route   PUT /api/chapters/:id
// @access  Private (Admin only)
exports.updateChapter = async (req, res) => {
  const { name, description, chapterLeadId } = req.body;

  try {
    let chapter = await Chapter.findById(req.params.id);

    if (!chapter) {
      return res.status(404).json({ message: "Chapter not found" });
    }

    // Check if new name already exists for another chapter
    if (name && name !== chapter.name) {
      const existingChapter = await Chapter.findOne({ name });
      if (existingChapter && existingChapter._id.toString() !== req.params.id) {
        return res
          .status(400)
          .json({ message: "Chapter with this name already exists" });
      }
    }

    let oldChapterLeadId = chapter.chapterLead
      ? chapter.chapterLead.toString()
      : null;
    let newChapterLead = null;

    if (chapterLeadId !== undefined) {
      // Check if chapterLeadId is explicitly provided (can be null to unassign)
      if (chapterLeadId) {
        newChapterLead = await User.findById(chapterLeadId);
        if (!newChapterLead) {
          return res
            .status(400)
            .json({ message: "Provided Chapter Lead ID is invalid." });
        }
        // Refined logic for update: Allow student or chapter-lead roles. Promote if student.
        if (newChapterLead.role === "admin") {
          return res.status(400).json({
            message: "An Admin cannot be assigned as a Chapter Lead.",
          });
        }
        if (newChapterLead.role === "student") {
          newChapterLead.role = "chapter-lead"; // Promote student
        }
      }
      chapter.chapterLead = newChapterLead ? newChapterLead._id : null; // Assign new lead or null
    }

    chapter.name = name || chapter.name;
    chapter.description =
      description !== undefined ? description : chapter.description;

    // Handle chapter lead change in User documents
    if (chapterLeadId !== oldChapterLeadId) {
      // Unassign old chapter lead's chapter field if they were the lead of THIS chapter
      if (oldChapterLeadId) {
        const oldLead = await User.findById(oldChapterLeadId);
        if (
          oldLead &&
          oldLead.chapter &&
          oldLead.chapter.toString() === chapter._id.toString()
        ) {
          oldLead.chapter = null; // Unassign
          await oldLead.save();
        }
      }
      // Assign new chapter lead's chapter field
      if (newChapterLead) {
        // Before assigning, if new lead was lead of another chapter, unassign them first
        if (
          newChapterLead.chapter &&
          newChapterLead.chapter.toString() !== chapter._id.toString()
        ) {
          const otherChapter = await Chapter.findById(newChapterLead.chapter);
          if (
            otherChapter &&
            otherChapter.chapterLead &&
            otherChapter.chapterLead.toString() ===
              newChapterLead._id.toString()
          ) {
            otherChapter.chapterLead = null;
            await otherChapter.save();
          }
        }
        newChapterLead.chapter = chapter._id;
        await newChapterLead.save(); // Save the newChapterLead user with updated role/chapter
      }
    }

    await chapter.save();

    res.status(200).json({ message: "Chapter updated successfully", chapter });
  } catch (error) {
    console.error("Error updating chapter:", error);
    if (error.kind === "ObjectId") {
      return res.status(400).json({ message: "Invalid chapter ID" });
    }
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Delete a chapter
// @route   DELETE /api/chapters/:id
// @access  Private (Admin only)
exports.deleteChapter = async (req, res) => {
  try {
    const chapter = await Chapter.findById(req.params.id);

    if (!chapter) {
      return res.status(404).json({ message: "Chapter not found" });
    }

    // Before deleting the chapter, unassign it from all users and events
    await User.updateMany(
      { chapter: chapter._id },
      { $set: { chapter: null } }
    );
    await Event.deleteMany({ chapter: chapter._id }); // Decide if events should be deleted or reassigned

    // If there was a chapter lead for this chapter, unassign them
    if (chapter.chapterLead) {
      const chapterLead = await User.findById(chapter.chapterLead);
      if (
        chapterLead &&
        chapterLead.chapter &&
        chapterLead.chapter.toString() === chapter._id.toString()
      ) {
        chapterLead.chapter = null;
        await chapterLead.save();
      }
    }

    await Chapter.deleteOne({ _id: req.params.id });

    res.status(200).json({ message: "Chapter deleted successfully" });
  } catch (error) {
    console.error("Error deleting chapter:", error);
    if (error.kind === "ObjectId") {
      return res.status(400).json({ message: "Invalid chapter ID" });
    }
    res.status(500).json({ message: "Server error" });
  }
};
