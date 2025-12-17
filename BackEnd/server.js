
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// DB connection
const mongoUri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/purchase_followup";
mongoose.connect(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log("MongoDB connected"))
    .catch((err) => console.error("MongoDB connection error:", err));

// Routes
const authRoutes = require("./routes/auth");
const followupRoutes = require("./routes/followups");
app.use("/api/auth", authRoutes);
app.use("/api/followups", followupRoutes);

// Health check
app.get("/", (req, res) => {
    res.json({ message: "Purchase Followup Backend is running" });
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
