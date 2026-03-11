const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
// bodyParser is actually built into express now, but we'll keep it clean
const userRoutes = require("./src/routes/users");
const userTypeRoutes = require("./src/routes/userTypes");
const authRoutes = require("./src/routes/auth");
const notesRoutes = require("./src/routes/notes");
const labelRoutes = require("./src/routes/label");
const reminderRoutes = require("./src/routes/reminder");
const reminderCron = require("./src/cron/reminderCrone");
const path = require("path");
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

// 1. GLOBAL MIDDLEWARE
app.use(cors());

// --- CRITICAL FIX START ---
// Set the limits IMMEDIATELY before any other body-parsing middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
// --- CRITICAL FIX END ---

app.use((req, res, next) => {
  res.set('Cache-Control', 'no-store');
  next();
});

// 2. STATIC FILE SERVING
const uploadDir = path.join(__dirname, "src", "Upload");
app.use("/Upload", express.static(uploadDir));

const ReportDir = path.join(__dirname, "src", "Upload", "Reports");
app.use("/Upload/Reports", express.static(ReportDir));

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

const ScriptDir = path.join(__dirname, "src", "scripts");
app.use('/scripts', express.static(ScriptDir));
const mongoURI =
  process.env.MONGO_URI || "mongodb://localhost:27017/google_note";

mongoose.connect(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  maxPoolSize: 100,
});
// 3. DATABASE CONNECTION
mongoose.connect("mongodb://localhost:27017/google_note", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  maxPoolSize: 100,
});
// reminderCron(); 

mongoose.connection.on("connected", () => {
  console.log("Mongoose connected to MongoDB");
});

mongoose.connection.on("error", (err) => {
  console.error("Mongoose connection error:", err);
});

// 4. ROUTES
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/userTypes", userTypeRoutes);
app.use("/api/notes", notesRoutes);
app.use("/api/label", labelRoutes);
app.use("/api/reminder", reminderRoutes);


app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
