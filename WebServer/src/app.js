const express = require("express");
const mongoose = require("mongoose");
const mongoURI = process.env.MONGO_URI || "mongodb://localhost:27017/myapp";

mongoose.connect(mongoURI)
.then(() => {
    console.log("Connected to MongoDB");
})
.catch((err) => {
    console.error("Failed to connect to MongoDB", err);
});

const usersRoutes = require("./routes/users");
const tokensRoutes = require("./routes/tokens");
const filesRoutes = require("./routes/files");
const searchRoutes = require("./routes/search");
const auth = require("./middleware/auth");
const app = express();

app.use(express.json({ limit: "10mb" }));

// if there was a syntax error in the JSON, handle it:
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
    return res.status(400).json({ error: "Invalid JSON" });
  }
  next(err);
});

// API routes
app.use("/api/users", usersRoutes);
app.use("/api/tokens", tokensRoutes);
// routes for logged in users only
app.use("/api/files", auth.verifyToken, filesRoutes);
app.use("/api/search",auth.verifyToken, searchRoutes);

// 404 JSON for /api/*
app.use((req, res) => {
  res.status(404).json({ error: "Not found" });
});

module.exports = app;
