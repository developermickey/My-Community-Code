const Tutorial = require("../models/Tutorial");
const Category = require("../models/Category");
const User = require("../models/User");
const Chapter = require("../models/Chapter"); // Make sure Chapter model is imported

// --- Category Management (Admin Only) ---

// @desc    Create a new category
// @route   POST /api/tutorials/categories
// @access  Private (Admin only)
exports.createCategory = async (req, res) => {
  const { name, description } = req.body;

  if (!name) {
    return res.status(400).json({ message: "Category name is required" });
  }

  try {
    const existingCategory = await Category.findOne({
      name: name.toLowerCase(),
    });
    if (existingCategory) {
      return res
        .status(400)
        .json({ message: "Category with this name already exists" });
    }

    const category = new Category({ name, description });
    await category.save();
    res
      .status(201)
      .json({ message: "Category created successfully", category });
  } catch (error) {
    console.error("Error creating category:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Get all categories
// @route   GET /api/tutorials/categories
// @access  Public
exports.getAllCategories = async (req, res) => {
  try {
    const categories = await Category.find();
    res.status(200).json(categories);
  } catch (error) {
    console.error("Error fetching categories:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Update a category
// @route   PUT /api/tutorials/categories/:id
// @access  Private (Admin only)
exports.updateCategory = async (req, res) => {
  const { name, description } = req.body;
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }
    if (name && name.toLowerCase() !== category.name) {
      const existingCategory = await Category.findOne({
        name: name.toLowerCase(),
      });
      if (
        existingCategory &&
        existingCategory._id.toString() !== req.params.id
      ) {
        return res
          .status(400)
          .json({ message: "Category with this name already exists" });
      }
    }
    category.name = name ? name.toLowerCase() : category.name;
    category.description =
      description !== undefined ? description : category.description;
    await category.save();
    res
      .status(200)
      .json({ message: "Category updated successfully", category });
  } catch (error) {
    console.error("Error updating category:", error);
    if (error.kind === "ObjectId") {
      return res.status(400).json({ message: "Invalid category ID" });
    }
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Delete a category
// @route   DELETE /api/tutorials/categories/:id
// @access  Private (Admin only)
exports.deleteCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }
    // Optional: Prevent deletion if tutorials are linked to it, or reassign them
    const tutorialsInCategory = await Tutorial.countDocuments({
      category: category._id,
    });
    if (tutorialsInCategory > 0) {
      return res.status(400).json({
        message: `Cannot delete category "${category.name}". It has ${tutorialsInCategory} tutorials linked to it.`,
      });
    }

    await Category.deleteOne({ _id: req.params.id });
    res.status(200).json({ message: "Category deleted successfully" });
  } catch (error) {
    console.error("Error deleting category:", error);
    if (error.kind === "ObjectId") {
      return res.status(400).json({ message: "Invalid category ID" });
    }
    res.status(500).json({ message: "Server error" });
  }
};

// --- Tutorial Management ---

// @desc    Create a new tutorial
// @route   POST /api/tutorials
// @access  Private (Admin, Chapter Lead, Student)
exports.createTutorial = async (req, res) => {
  const { title, content, category, chapter, keywords } = req.body;
  const authorId = req.user.id; // Get author from authenticated user
  const authorRole = req.user.role;

  if (!title || !content || !category) {
    return res
      .status(400)
      .json({ message: "Title, content, and category are required" });
  }

  try {
    const categoryExists = await Category.findById(category);
    if (!categoryExists) {
      return res.status(400).json({ message: "Invalid category ID" });
    }

    // Determine initial status based on user role
    let tutorialStatus = "pending";
    if (authorRole === "admin") {
      tutorialStatus = "approved"; // Admins can create approved tutorials directly
    }

    const tutorial = new Tutorial({
      title,
      content,
      category,
      author: authorId,
      status: tutorialStatus,
      chapter: chapter || null, // Optional chapter assignment
      keywords: keywords || [],
    });

    await tutorial.save();

    // Repopulate the saved tutorial by finding it again with all desired fields
    const populatedTutorial = await Tutorial.findById(tutorial._id)
      .populate("author", "name email role")
      .populate("category", "name")
      .populate("chapter", "name");

    res.status(201).json({
      message: "Tutorial created successfully",
      tutorial: populatedTutorial,
    });
  } catch (error) {
    console.error("Error creating tutorial:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Get all tutorials (with optional filters)
// @route   GET /api/tutorials
// @access  Public (only approved tutorials by default)
exports.getAllTutorials = async (req, res) => {
  const { categoryId, authorId, status, chapterId, search } = req.query;
  let filter = {};

  // By default, only show approved tutorials to public
  // Admins can see all, or filter by specific status
  if (
    !req.user ||
    req.user.role === "student" ||
    req.user.role === "chapter-lead"
  ) {
    filter.status = "approved";
  } else if (req.user.role === "admin") {
    if (status && status !== "all") filter.status = status; // Admin can specify status or get all if 'all' or no status
  } else {
    filter.status = "approved"; // Default for non-logged in or other roles
  }

  if (categoryId) filter.category = categoryId;
  if (authorId) filter.author = authorId;
  if (chapterId) filter.chapter = chapterId;

  if (search) {
    const searchRegex = new RegExp(search, "i"); // Case-insensitive search
    filter.$or = [
      { title: searchRegex },
      { content: searchRegex },
      { keywords: searchRegex },
    ];
  }

  try {
    const tutorials = await Tutorial.find(filter)
      .populate("author", "name email role")
      .populate("category", "name")
      .populate("chapter", "name")
      .sort({ createdAt: -1 }); // Sort by newest first

    res.status(200).json(tutorials);
  } catch (error) {
    console.error("Error fetching tutorials:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Get a single tutorial by ID
// @route   GET /api/tutorials/:id
// @access  Public (if approved, otherwise private for author/admin)
exports.getTutorialById = async (req, res) => {
  try {
    const tutorial = await Tutorial.findById(req.params.id)
      .populate("author", "name email role")
      .populate("category", "name")
      .populate("chapter", "name");

    if (!tutorial) {
      return res.status(404).json({ message: "Tutorial not found" });
    }

    // Authorization for viewing non-approved tutorials
    if (tutorial.status !== "approved") {
      const requestingUser = req.user;
      if (
        !requestingUser ||
        (requestingUser.id !== tutorial.author._id.toString() &&
          requestingUser.role !== "admin")
      ) {
        return res.status(403).json({
          message:
            "Not authorized to view this tutorial (pending or rejected).",
        });
      }
    }

    res.status(200).json(tutorial);
  } catch (error) {
    console.error("Error fetching tutorial by ID:", error);
    if (error.kind === "ObjectId") {
      return res.status(400).json({ message: "Invalid tutorial ID" });
    }
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Update a tutorial
// @route   PUT /api/tutorials/:id
// @access  Private (Admin, Chapter Lead/Student for own pending/approved tutorial)
exports.updateTutorial = async (req, res) => {
  const { title, content, category, chapter, keywords, status } = req.body; // Admin can also change status
  const tutorialId = req.params.id;
  const requestingUser = req.user;

  try {
    const tutorial = await Tutorial.findById(tutorialId);
    if (!tutorial) {
      return res.status(404).json({ message: "Tutorial not found" });
    }

    // Authorization Check
    const isAuthor = tutorial.author.toString() === requestingUser.id;
    const isAdmin = requestingUser.role === "admin";

    if (!isAuthor && !isAdmin) {
      // Only author or admin can update
      return res
        .status(403)
        .json({ message: "Not authorized to update this tutorial." });
    }

    // Prevent Chapter Leads/Students from directly approving/rejecting
    if (
      !isAdmin &&
      status &&
      (status === "approved" || status === "rejected")
    ) {
      return res
        .status(403)
        .json({ message: "Only Admins can approve or reject tutorials." });
    }
    // If author is trying to change a status for an already approved/rejected tutorial, they can't change it back to pending
    if (
      isAuthor &&
      tutorial.status !== "pending" &&
      status &&
      status === "pending"
    ) {
      return res.status(403).json({
        message:
          "Authors cannot change status of approved/rejected tutorials to pending.",
      });
    }

    // Update fields
    if (title !== undefined) tutorial.title = title;
    if (content !== undefined) tutorial.content = content;
    if (category !== undefined) {
      if (category === null || category === "") {
        // Allow unassigning category
        tutorial.category = null;
      } else {
        const categoryExists = await Category.findById(category);
        if (!categoryExists)
          return res.status(400).json({ message: "Invalid category ID." });
        tutorial.category = category;
      }
    }
    if (chapter !== undefined) {
      // Allow setting to null
      if (chapter === null || chapter === "") {
        tutorial.chapter = null;
      } else {
        const chapterExists = await Chapter.findById(chapter);
        if (!chapterExists)
          return res.status(400).json({ message: "Invalid chapter ID." });
        tutorial.chapter = chapter;
      }
    }
    if (keywords !== undefined) tutorial.keywords = keywords;

    // Admin can change status. Other roles can implicitly set to pending on edit.
    if (isAdmin && status !== undefined) {
      // Admin can set any status
      tutorial.status = status;
    } else if (
      isAuthor &&
      tutorial.status !== "pending" &&
      tutorial.status !== "rejected"
    ) {
      // If author edits an approved tutorial, it goes back to pending for review
      // If author edits a pending tutorial, it stays pending
      // If author edits a rejected tutorial, it goes back to pending
      tutorial.status = "pending";
    }

    await tutorial.save();
    // Repopulate the updated tutorial by finding it again with all desired fields
    const populatedTutorial = await Tutorial.findById(tutorial._id)
      .populate("author", "name email role")
      .populate("category", "name")
      .populate("chapter", "name");

    res.status(200).json({
      message: "Tutorial updated successfully",
      tutorial: populatedTutorial,
    });
  } catch (error) {
    console.error("Error updating tutorial:", error);
    if (error.kind === "ObjectId") {
      return res
        .status(400)
        .json({ message: "Invalid tutorial ID, category ID or chapter ID" });
    }
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Delete a tutorial
// @route   DELETE /api/tutorials/:id
// @access  Private (Admin only)
exports.deleteTutorial = async (req, res) => {
  const tutorialId = req.params.id;
  const requestingUser = req.user;

  try {
    const tutorial = await Tutorial.findById(tutorialId);
    if (!tutorial) {
      return res.status(404).json({ message: "Tutorial not found" });
    }

    // Authorization Check - Only Admin can delete tutorials now.
    const isAdmin = requestingUser.role === "admin";

    if (!isAdmin) {
      return res
        .status(403)
        .json({ message: "Only Admins are authorized to delete tutorials." });
    }
    // No need for 'isAuthor' check for deletion anymore if only admin can delete,
    // and no need to check status like 'approved' vs 'pending' for deletion if admin can delete any.

    await Tutorial.deleteOne({ _id: tutorialId });
    res.status(200).json({ message: "Tutorial deleted successfully" });
  } catch (error) {
    console.error("Error deleting tutorial:", error);
    if (error.kind === "ObjectId") {
      return res.status(400).json({ message: "Invalid tutorial ID" });
    }
    res.status(500).json({ message: "Server error" });
  }
};

// --- Admin Specific Tutorial Actions ---

// @desc    Approve a tutorial
// @route   PUT /api/tutorials/:id/approve
// @access  Private (Admin only)
exports.approveTutorial = async (req, res) => {
  try {
    const tutorial = await Tutorial.findById(req.params.id);
    if (!tutorial) {
      return res.status(404).json({ message: "Tutorial not found" });
    }
    if (tutorial.status === "approved") {
      return res.status(400).json({ message: "Tutorial is already approved." });
    }
    tutorial.status = "approved";
    await tutorial.save();
    res
      .status(200)
      .json({ message: "Tutorial approved successfully", tutorial });
  } catch (error) {
    console.error("Error approving tutorial:", error);
    if (error.kind === "ObjectId") {
      return res.status(400).json({ message: "Invalid tutorial ID" });
    }
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Reject a tutorial
// @route   PUT /api/tutorials/:id/reject
// @access  Private (Admin only)
exports.rejectTutorial = async (req, res) => {
  try {
    const tutorial = await Tutorial.findById(req.params.id);
    if (!tutorial) {
      return res.status(404).json({ message: "Tutorial not found" });
    }
    if (tutorial.status === "rejected") {
      return res.status(400).json({ message: "Tutorial is already rejected." });
    }
    tutorial.status = "rejected";
    await tutorial.save();
    res
      .status(200)
      .json({ message: "Tutorial rejected successfully", tutorial });
  } catch (error) {
    console.error("Error rejecting tutorial:", error);
    if (error.kind === "ObjectId") {
      return res.status(400).json({ message: "Invalid tutorial ID" });
    }
    res.status(500).json({ message: "Server error" });
  }
};
