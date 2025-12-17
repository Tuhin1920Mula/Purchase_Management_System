const express = require("express");
const router = express.Router();
const Followup = require("../models/Followup");
const { requireAuth } = require("../middleware/auth");

// Create a new followup
router.post("/", requireAuth, async (req, res) => {
  try {
    const followup = new Followup(req.body);
    const saved = await followup.save();
    res.status(201).json(saved);
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: "Failed to create followup", details: err.message });
  }
});

// Get followups with filters (type, formNumber, indentNumber, date range)
router.get("/", requireAuth, async (req, res) => {
  try {
    const { type, formNumber, indentNumber, uniqueId, fromDate, toDate } = req.query;
    const query = {};

    if (type) query.type = type;
    if (formNumber) query.formNumber = Number(formNumber);
    if (indentNumber) query.indentNumber = { $regex: indentNumber, $options: "i" };
    if (uniqueId) query.uniqueId = { $regex: uniqueId, $options: "i" };

    // date range on timestamp (as in your UI filters)
    if (fromDate || toDate) {
      query.timestamp = {};
      if (fromDate) query.timestamp.$gte = new Date(fromDate);
      if (toDate) {
        const end = new Date(toDate);
        end.setHours(23, 59, 59, 999);
        query.timestamp.$lte = end;
      }
    }

    const docs = await Followup.find(query).sort({ createdAt: -1 }).limit(100);
    res.json(docs);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch followups" });
  }
});

// Get single followup by id
router.get("/:id", requireAuth, async (req, res) => {
  try {
    const doc = await Followup.findById(req.params.id);
    if (!doc) return res.status(404).json({ error: "Not found" });
    res.json(doc);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch followup" });
  }
});

async function updateFollowup(req, res) {
  try {
    const doc = await Followup.findById(req.params.id);
    if (!doc) return res.status(404).json({ error: "Not found" });

    const body = req.body || {};

    // Allow these shared fields (optional)
    if ("plannedDate" in body) {
      doc.plannedDate = body.plannedDate ? new Date(body.plannedDate) : null;
    }
    if ("timeDelay" in body) {
      doc.timeDelay = body.timeDelay === "" ? null : body.timeDelay;
    }

    if (doc.type === "payment") {
      const role = (req.user?.role || "").toLowerCase();

      // ✅ Save fields per-user so they never overwrite each other
      if (role === "rupak") {
        if ("transactionNo" in body) doc.transactionNoRupak = (body.transactionNo || "").trim();
        if ("actualDate" in body) doc.actualDateRupak = body.actualDate ? new Date(body.actualDate) : null;
        if ("status" in body) doc.statusRupak = body.status;
      } else if (role === "anindita") {
        if ("transactionNo" in body) doc.transactionNoAnindita = (body.transactionNo || "").trim();
        if ("actualDate" in body) doc.actualDateAnindita = body.actualDate ? new Date(body.actualDate) : null;
        if ("status" in body) doc.statusAnindita = body.status;
      } else {
        return res.status(403).json({ error: "Unauthorized role for payment update" });
      }

    } else {
      // ✅ PC followup (ONLY single actual/status)
      if ("actualDate" in body) doc.actualDate = body.actualDate ? new Date(body.actualDate) : null;
      if ("status" in body) doc.status = body.status;

      // ✅ IMPORTANT: remove payment-only fields from PC docs (so they won't appear anymore)
      doc.transactionNoRupak = undefined;
      doc.transactionNoAnindita = undefined;
      doc.actualDateRupak = undefined;
      doc.actualDateAnindita = undefined;
      doc.statusRupak = undefined;
      doc.statusAnindita = undefined;
      doc.timeDelayRupak = undefined;
      doc.timeDelayAnindita = undefined;
    }

    // ✅ remarks appended (shared remarks array)
    if (typeof body.addRemark === "string" && body.addRemark.trim()) {
      doc.remarks.push({ text: body.addRemark.trim() });
    }

    const updated = await doc.save();
    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: "Failed to update followup", details: err.message });
  }
}


// Update followup (PC: actualDate/status + remarks, Payment: per-user transactionNo/actual/status + remarks)
router.patch("/:id", requireAuth, updateFollowup);
router.put("/:id", requireAuth, updateFollowup);

module.exports = router;
