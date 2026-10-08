
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const connectDB = require("./config/db");

const app = express();

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

app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/stories", require("./routes/storyRoutes"));
app.use("/api/payments", require("./routes/paymentRoutes"));
app.use("/api/admin", require("./routes/adminRoutes"));

// Generic error handler; avoid leaking internal errors.
app.use((err, req, res, next) => {
  console.error(err);
  if (res.headersSent) return next(err);

  res.status(err.status || 500).json({
    message: err.status ? err.message : "Internal server error"
  });
});

const PORT = process.env.PORT || 5000;

connectDB()
  .then(() => app.listen(PORT, () => {
    console.log(`All Story FM API listening on ${PORT}`);
  }))
  .catch(err => {
    console.error("Startup failed", err);
    process.exit(1);
  });
