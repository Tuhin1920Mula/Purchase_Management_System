import express from "express";
import ExcelRecord from "../models/excelRecord.model.js";

const router = express.Router();

router.post("/save", async (req, res) => {
  try {
    const { rows } = req.body;

    if (!rows || !Array.isArray(rows) || rows.length === 0) {
      return res.status(400).json({ message: "Invalid data" });
    }

    // Convert array into objects if needed (optional)
    const formatted = rows.map((cols) => ({
      columns: cols,
    }));

    const saved = await ExcelRecord.insertMany(formatted);

    res.json({ success: true, saved });
  } catch (error) {
    console.error("Error saving excel data:", error);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;