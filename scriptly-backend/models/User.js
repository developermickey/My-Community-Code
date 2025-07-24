// scriptly-backend/models/User.js

const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["student", "chapter-lead", "admin"],
      default: "student",
      required: true,
    },
    chapter: {
      type: Schema.Types.ObjectId,
      ref: "Chapter",
      default: null,
    },
    vouchCount: {
      type: Number,
      default: 0,
    },
    vouchedBy: [
      {
        // New field: Array of User IDs who have vouched for this user
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
