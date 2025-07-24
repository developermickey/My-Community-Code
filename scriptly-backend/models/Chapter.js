// scriptly-backend/models/Chapter.js

const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const chapterSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    description: {
      type: String,
      default: "",
    },
    chapterLead: {
      type: Schema.Types.ObjectId,
      ref: "User", // Reference to the User model
      default: null, // A chapter might not have a lead initially
    },
    // Note: We won't store 'members' directly in the Chapter model as an array of ObjectIds.
    // Instead, we can query users by their 'chapter' field. This avoids large, mutable arrays
    // and makes member management more efficient (e.g., when a student leaves a chapter).
  },
  { timestamps: true }
);

module.exports = mongoose.model("Chapter", chapterSchema);
