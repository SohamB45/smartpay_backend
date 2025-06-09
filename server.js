const express = require("express");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const cors = require("cors");



dotenv.config();
const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

// DB connection
const connectDB = require("./config/db");
connectDB();

const authRoutes = require("./routes/authRoutes.js");
app.use("/api/auth", authRoutes);

// Routes
const donationRoutes = require("./routes/donationroutes");
app.use("/api/donations", donationRoutes);

app.get("/", (req, res) => {
  res.send("QuickDonate API is live 🚀");
});


app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
