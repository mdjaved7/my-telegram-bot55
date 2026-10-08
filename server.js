require("dotenv").config();

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const connectDB = require("./config/db");

const app = express();

// Database connect karein
connectDB().catch(err => console.error("MongoDB connection error:", err));

app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_ORIGIN
    ? process.env.CLIENT_ORIGIN.split(",")
    : false
}));
app.use(express.json({ limit: "100kb" }));
app.use(morgan("dev"));

app.use("/api", rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 300
}));

// Root aur Favicon routes
app.get("/", (req, res) => {
  res.send("All Story FM API is running");
});

app.get("/favicon.ico", (req, res) => res.status(204).end());

app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/stories", require("./routes/storyRoutes"));
app.use("/api/payments", require("./routes/paymentRoutes"));
app.use("/api/admin", require("./routes/adminRoutes"));

// Generic error handler
app.use((err, req, res, next) => {
  console.error(err);
  if (res.headersSent) return next(err);

  res.status(err.status || 500).json({
    message: err.status ? err.message : "Internal server error"
  });
});

// Vercel serverless environment ke liye Express app export karein
module.exports = app;
