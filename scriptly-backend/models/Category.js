// scriptly-backend/models/Category.js

const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const categorySchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true, // Category names should be unique
      trim: true,
      lowercase: true, // Store category names in lowercase for consistent lookups
    },
    description: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Category", categorySchema);
