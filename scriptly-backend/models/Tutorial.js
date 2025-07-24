// scriptly-backend/models/Tutorial.js

const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const tutorialSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    content: {
      type: String, // Store rich text/Markdown content as a string
      required: true,
    },
    category: {
      type: Schema.Types.ObjectId, // Reference to the Category model
      ref: "Category",
      required: true,
    },
    author: {
      type: Schema.Types.ObjectId, // Reference to the User who created it
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"], // Approval workflow status
      default: "pending", // New tutorials are pending by default
      required: true,
    },
    chapter: {
      type: Schema.Types.ObjectId, // Optional: Link tutorial to a specific chapter
      ref: "Chapter",
      default: null,
    },
    keywords: [
      {
        // Optional: for search/tags
        type: String,
        trim: true,
        lowercase: true,
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Tutorial", tutorialSchema);
