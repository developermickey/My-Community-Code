// scriptly-backend/models/Event.js

const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const eventSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    location: {
      type: String,
      required: true,
      trim: true,
    },
    chapter: {
      type: Schema.Types.ObjectId,
      ref: "Chapter", // The chapter hosting this event
      required: true,
    },
    organizer: {
      type: Schema.Types.ObjectId,
      ref: "User", // The user (likely Chapter Lead) who created this event
      required: true,
    },
    attendees: [
      {
        // Array of User Object IDs who registered for the event
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Event", eventSchema);
