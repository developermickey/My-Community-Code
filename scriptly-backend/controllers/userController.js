// scriptly-backend/controllers/userController.js

const User = require("../models/User");
const Chapter = require("../models/Chapter");
const Event = require("../models/Event");
const bcrypt = require("bcryptjs");

// @desc    Get all users (for Admin dashboard, etc.)
// @route   GET /api/users
// @access  Private (Admin only)
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find()
      .select("-password")
      .populate("chapter", "name"); // Exclude passwords, populate chapter name
    res.status(200).json(users);
  } catch (error) {
    console.error("Error fetching all users:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Get a single user by ID (for Admin or viewing public profiles)
// @route   GET /api/users/:id
// @access  Private (Admin, Chapter Lead for their members, or public profile if allowed)
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select("-password")
      .populate("chapter", "name"); // Exclude password
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json(user);
  } catch (error) {
    console.error("Error fetching user by ID:", error);
    if (error.kind === "ObjectId") {
      return res.status(400).json({ message: "Invalid user ID" });
    }
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Update a user's role or chapter (Admin only) or name (User themselves)
// @route   PUT /api/users/:id/role
// @access  Private (Admin for role/chapter, User themselves for name/chapter)
exports.updateUserRoleOrChapter = async (req, res) => {
  // Destructure all possible fields from the request body
  const { role, chapterId, name } = req.body;
  const userId = req.params.id;
  const requestingUser = req.user; // User from JWT (who is making the request)

  // Validate if at least one field is provided for update
  if (role === undefined && chapterId === undefined && name === undefined) {
    return res
      .status(400)
      .json({ message: "Please provide at least one field to update." });
  }

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Authorization checks
    // 1. User can only update their OWN profile (name, chapter).
    // 2. Admin can update ANYONE's profile (name, role, chapter).
    if (requestingUser.id !== userId && requestingUser.role !== "admin") {
      return res
        .status(403)
        .json({ message: "Not authorized to update this user." });
    }

    // Prevent admin from changing their own role to non-admin (security)
    if (
      requestingUser.id.toString() === user._id.toString() &&
      role &&
      role !== "admin"
    ) {
      return res
        .status(403)
        .json({ message: "Admins cannot demote themselves." });
    }

    // Update name if provided
    if (name !== undefined) {
      user.name = name;
    }

    // Update role if provided, only if requesting user is an Admin
    if (role !== undefined) {
      if (requestingUser.role !== "admin") {
        return res
          .status(403)
          .json({ message: "Only Admins can change user roles." });
      }
      if (!["student", "chapter-lead", "admin"].includes(role)) {
        return res.status(400).json({ message: "Invalid role provided." });
      }
      user.role = role;
    }

    // Handle chapter assignment/reassignment if provided
    if (chapterId !== undefined) {
      // If the target user is a Chapter Lead or Admin, only an Admin can change their chapter
      // This prevents a Chapter Lead from changing their own chapter without admin oversight,
      // and ensures admins are managed correctly.
      if (
        (user.role === "chapter-lead" || user.role === "admin") &&
        requestingUser.role !== "admin"
      ) {
        return res.status(403).json({
          message:
            "Only Admins can manage chapters for Chapter Leads or other Admins.",
        });
      }

      if (chapterId === null || chapterId === "") {
        // Explicitly setting to null/empty string to unassign
        user.chapter = null;
      } else {
        const chapter = await Chapter.findById(chapterId);
        if (!chapter) {
          return res
            .status(404)
            .json({ message: "Chapter not found for assignment." });
        }
        user.chapter = chapter._id;
      }
    }

    await user.save();
    res.status(200).json({ message: "User updated successfully", user });
  } catch (error) {
    console.error("Error updating user profile:", error); // More specific error message
    if (error.kind === "ObjectId") {
      return res
        .status(400)
        .json({ message: "Invalid user ID or chapter ID." });
    }
    res.status(500).json({ message: "Server error." });
  }
};

// @desc    Vouch for a user
// @route   POST /api/users/:id/vouch
// @access  Private (Admin or Chapter Lead)
exports.vouchUser = async (req, res) => {
  const targetUserId = req.params.id; // User being vouched for
  const vouchingUserId = req.user.id; // Logged-in user who is vouching
  const vouchingUserRole = req.user.role; // Role of the logged-in user

  // Prevent self-vouching
  if (vouchingUserId.toString() === targetUserId.toString()) {
    return res.status(400).json({ message: "Cannot vouch for yourself" });
  }

  try {
    const targetUser = await User.findById(targetUserId);
    const vouchingUser = await User.findById(vouchingUserId);

    if (!targetUser || !vouchingUser) {
      return res.status(404).json({ message: "User not found" });
    }

    // Role-based authorization for vouching
    if (vouchingUserRole === "chapter-lead") {
      // Chapter Lead can only vouch for users in their own chapter
      if (
        !vouchingUser.chapter || // If vouching lead has no chapter assigned
        !targetUser.chapter || // If target user has no chapter assigned
        vouchingUser.chapter.toString() !== targetUser.chapter.toString()
      ) {
        return res.status(403).json({
          message:
            "Chapter Leads can only vouch for members within their own assigned chapter.",
        });
      }
    } else if (vouchingUserRole !== "admin") {
      // Only Admin or Chapter Lead can vouch
      return res
        .status(403)
        .json({ message: "Not authorized to vouch for users" });
    }

    // Check if vouchingUser has already vouched for targetUser
    if (targetUser.vouchedBy.includes(vouchingUserId)) {
      return res
        .status(400)
        .json({ message: "You have already vouched for this user" });
    }

    // Increment vouchCount and add to vouchedBy array
    targetUser.vouchCount += 1;
    targetUser.vouchedBy.push(vouchingUserId);

    await targetUser.save();

    res.status(200).json({
      message: "User vouched successfully",
      user: {
        id: targetUser._id,
        name: targetUser.name,
        vouchCount: targetUser.vouchCount,
        email: targetUser.email, // Include email in response for frontend clarity
        role: targetUser.role, // Include role in response
      },
    });
  } catch (error) {
    console.error("Error vouching for user:", error);
    if (error.kind === "ObjectId") {
      return res.status(400).json({ message: "Invalid user ID" });
    }
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Get events a specific user is registered for
// @route   GET /api/users/:id/registered-events
// @access  Private (User themselves or Admin)
exports.getRegisteredEvents = async (req, res) => {
  const userId = req.params.id;
  const requestingUser = req.user; // User from JWT (who is making the request)

  // Authorization check: Only the user themselves or an admin can view this
  if (requestingUser.id !== userId && requestingUser.role !== "admin") {
    return res
      .status(403)
      .json({ message: "Not authorized to view these events" });
  }

  try {
    const userExists = await User.findById(userId);
    if (!userExists) {
      return res.status(404).json({ message: "User not found" });
    }

    // Find events where the attendees array contains the userId
    const registeredEvents = await Event.find({ attendees: userId })
      .populate("chapter", "name") // Populate chapter name
      .populate("organizer", "name email"); // Populate organizer details

    res.status(200).json(registeredEvents);
  } catch (error) {
    console.error("Error fetching registered events:", error);
    if (error.kind === "ObjectId") {
      return res.status(400).json({ message: "Invalid user ID" });
    }
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Change user's password
// @route   PUT /api/users/:id/password
// @access  Private (User themselves)
exports.changePassword = async (req, res) => {
  const userId = req.params.id;
  const { oldPassword, newPassword } = req.body;
  const requestingUser = req.user; // User from JWT

  // Authorization check: User can only change their OWN password.
  // Admins typically have a separate "reset password" functionality, not a "change password".
  if (requestingUser.id !== userId) {
    return res
      .status(403)
      .json({ message: "Not authorized to change this password." });
  }

  // Basic validation
  if (!oldPassword || !newPassword) {
    return res
      .status(400)
      .json({ message: "Please provide both old and new passwords." });
  }
  if (newPassword.length < 6) {
    // Example: minimum password length
    return res
      .status(400)
      .json({ message: "New password must be at least 6 characters long." });
  }

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    // Check if old password matches
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Old password is incorrect." });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);

    await user.save();

    res.status(200).json({
      message:
        "Password updated successfully. Please log in with your new password.",
    });
  } catch (error) {
    console.error("Error changing password:", error);
    if (error.kind === "ObjectId") {
      return res.status(400).json({ message: "Invalid user ID." });
    }
    res.status(500).json({ message: "Server error." });
  }
};
