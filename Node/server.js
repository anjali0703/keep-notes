// server.js
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const path = require("path");
require("dotenv").config();

// Routes
const userRoutes = require("./src/routes/users");
const userTypeRoutes = require("./src/routes/userTypes");
const authRoutes = require("./src/routes/auth");
const notesRoutes = require("./src/routes/notes");
const labelRoutes = require("./src/routes/label");
const reminderRoutes = require("./src/routes/reminder");
const reminderCron = require("./src/cron/reminderCrone"); // cron job

const app = express();
const port = process.env.PORT || 5000;

// -------------------- 1. GLOBAL MIDDLEWARE --------------------
app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Disable caching for APIs
app.use((req, res, next) => {
  res.set("Cache-Control", "no-store");
  next();
});

// -------------------- 2. STATIC FILE SERVING --------------------
app.use("/Upload", express.static(path.join(__dirname, "src", "Upload")));
app.use(
  "/Upload/Reports",
  express.static(path.join(__dirname, "src", "Upload", "Reports"))
);
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/scripts", express.static(path.join(__dirname, "src", "scripts")));

// -------------------- 3. DATABASE CONNECTION --------------------
// Decide which DB to use: Atlas or local
const dbURI =
  process.env.USE_ATLAS === "true"
    ? process.env.ATLAS_DB_URI
    : process.env.LOCAL_DB_URI;

// Connect to MongoDB
mongoose
  .connect(dbURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    maxPoolSize: 100,
  })
  .catch((err) => console.error("Initial MongoDB connection error:", err));

// Log errors
mongoose.connection.on("error", (err) => {
  console.error("MongoDB connection error:", err);
});

// Only start server logic after DB is connected
mongoose.connection.once("open", () => {
  console.log(
    `Mongoose connected successfully to ${
      process.env.USE_ATLAS === "true" ? "MongoDB Atlas" : "Local MongoDB"
    }`
  );

  // -------------------- 4. ROUTES --------------------
  app.use("/api/auth", authRoutes);
  app.use("/api/users", userRoutes);
  app.use("/api/userTypes", userTypeRoutes);
  app.use("/api/notes", notesRoutes);
  app.use("/api/label", labelRoutes);
  app.use("/api/reminder", reminderRoutes);

  // -------------------- 5. START CRON --------------------
  // console.log("Starting reminder cron...");
  // reminderCron();

  // -------------------- 6. START SERVER --------------------
  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
});
