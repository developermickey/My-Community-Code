// scriptly-backend/server.js

require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

// Import all routes
const authRoutes = require("./routes/authRoutes");
const chapterRoutes = require("./routes/chapterRoutes");
const eventRoutes = require("./routes/eventRoutes");
const userRoutes = require("./routes/userRoutes");
const tutorialRoutes = require("./routes/tutorialRoutes"); // New: Import tutorial routes

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected successfully!"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Basic Route for testing
app.get("/", (req, res) => {
  res.send("Scriptly Backend API is running!");
});

// Use all routes
app.use("/api/auth", authRoutes);
app.use("/api/chapters", chapterRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/users", userRoutes);
app.use("/api/tutorials", tutorialRoutes); // New: Add tutorial routes

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
