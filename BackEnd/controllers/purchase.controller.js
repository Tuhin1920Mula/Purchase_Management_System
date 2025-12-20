import { uploadToGoogleDrive } from "../config/googleDrive.js";
import Purchase from "../models/purchase.model.js";
import LocalPurchase from "../models/localpurchase.model.js";

/* ------------------ Indian Holidays (YYYY-MM-DD) ------------------ */
const INDIAN_HOLIDAYS = [
  "2025-01-26",
  "2025-08-15",
  "2025-10-02",
  "2025-12-25",
];

/* ------------------ Helper Functions ------------------ */

// Check Sunday or holiday
const isHoliday = (date) => {
  const yyyyMmDd = date.toISOString().split("T")[0];
  return date.getDay() === 0 || INDIAN_HOLIDAYS.includes(yyyyMmDd);
};

// Add working days
const addWorkingDays = (startDate, days) => {
  let date = new Date(startDate);
  let count = 0;

  while (count < days) {
    date.setDate(date.getDate() + 1);
    if (!isHoliday(date)) count++;
  }
  return date;
};

// Calculate delay in days only
const calculateDelayDays = (planned, actual) => {
  const msDiff = actual - planned;
  if (msDiff <= 0) return "0 days";
  const days = Math.floor(msDiff / (1000 * 60 * 60 * 24));
  return `${days} days`;
};

/* ------------------ Controller ------------------ */

export const updatePurchase = async (req, res) => {
  try {
    const updateData = { ...req.body };

    const purchase = await Purchase.findById(req.params.id);
    if (!purchase) {
      return res.status(404).json({ success: false, message: "Record not found" });
    }

    /* -------- (i) Planned Get Quotation -------- */
    //if (purchase.date && !purchase.plannedGetQuotation) {
    if (purchase.date) {
      const baseDate = new Date(purchase.date); // YYYY-MM-DD
      const plannedDate = addWorkingDays(baseDate, 3);
      updateData.plannedGetQuotation = plannedDate
        .toISOString()
        .split("T")[0];
    }

    /* -------- (ii) Time Delay Calculation (Get Quotation) -------- */
    if (updateData.actualGetQuotation && purchase.plannedGetQuotation) {
      const planned = new Date(purchase.plannedGetQuotation);
      const actual = new Date(updateData.actualGetQuotation);
      updateData.timeDelayGetQuotation = calculateDelayDays(planned, actual);
    }

    /* -------- (iii) Planned Technical Approval -------- */
    //if (purchase.actualGetQuotation && !purchase.plannedTechApproval) {
    if (updateData.actualGetQuotation) {
      const baseDate = new Date(updateData.actualGetQuotation);
      const plannedTechDate = addWorkingDays(baseDate, 3);
      updateData.plannedTechApproval = plannedTechDate
        .toISOString()
        .split("T")[0];
    }

    /* -------- (iv) Time Delay Calculation (Technical Approval) -------- */
    if (updateData.actualTechApproval && purchase.plannedTechApproval) {
      const planned = new Date(purchase.plannedTechApproval);
      const actual = new Date(updateData.actualTechApproval);
      updateData.timeDelayTechApproval = calculateDelayDays(planned, actual);
    }

    /* -------- (v) Planned Commercial Negotiation -------- */
    //if (purchase.actualTechApproval && !purchase.plannedCommercialNegotiation) {
    if (updateData.actualTechApproval) {
      const baseDate = new Date(updateData.actualTechApproval);
      const plannedDate = addWorkingDays(baseDate, 3);
      updateData.plannedCommercialNegotiation = plannedDate
        .toISOString()
        .split("T")[0];
    }

    /* -------- (vi) Time Delay Calculation (Commercial Negotiation) -------- */
    if (updateData.actualCommercialNegotiation && purchase.plannedCommercialNegotiation) {
      const planned = new Date(purchase.plannedCommercialNegotiation);
      const actual = new Date(updateData.actualCommercialNegotiation);
      updateData.timeDelayCommercialNegotiation = calculateDelayDays(planned, actual);
    }

    /* -------- (vii) Planned PO Generation -------- */
    //if (purchase.actualCommercialNegotiation && !purchase.plannedPoGeneration) {
    if (updateData.actualCommercialNegotiation) {
      const baseDate = new Date(updateData.actualCommercialNegotiation);
      const plannedDate = addWorkingDays(baseDate, 3);
      updateData.plannedPoGeneration = plannedDate
        .toISOString()
        .split("T")[0];
    }

    /* -------- (viii) Time Delay Calculation (PO Generation) -------- */
    if (updateData.actualPoGeneration && purchase.plannedPoGeneration) {
      const planned = new Date(purchase.plannedPoGeneration);
      const actual = new Date(updateData.actualPoGeneration);
      updateData.timeDelayPoGeneration = calculateDelayDays(planned, actual);
    }

    const updated = await Purchase.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    return res.json({ success: true, data: updated });
  } catch (error) {
    console.error("❌ Update error:", error);
    return res.status(500).json({ success: false, error: error.message });
  }
};

export const updateLocalPurchase = async (req, res) => {
  try {
    const updateData = { ...req.body };

    //const localpurchase = await LocalPurchase.findById(req.params.id);

    const updated = await LocalPurchase.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    return res.json({ success: true, data: updated });
  } catch (error) {
    console.error("❌ Update error:", error);
    return res.status(500).json({ success: false, error: error.message });
  }
};

// Create
export const createIndentForm = async (req, res) => {
  try {
    const form = await Purchase.create(req.body);
    return res.status(201).json({
      success: true,
      message: "Indent Form Created Successfully",
      data: form,
    });
  } catch (error) {
    console.error("❌ Error Creating Indent Form:", error);
    return res.status(500).json({ success: false, error: error.message });
  }
};

export const createLocalPurchaseForm = async (req, res) => {
  try {
    const form = await LocalPurchase.create(req.body);
    return res.status(201).json({
      success: true,
      message: "Local Purchase Form Created Successfully",
      data: form,
    });
  } catch (error) {
    console.error("❌ Error Creating Local Purchase Form:", error);
    return res.status(500).json({ success: false, error: error.message });
  }
};

export const getLatestUniqueId = async (req, res) => {
  try {
    const lastRecord = await Purchase.findOne().sort({ createdAt: -1 });

    console.log("📌 Last record fetched from DB:", lastRecord);

    // If no previous record found → start from "INT2_12000"
    if (!lastRecord) {
      console.log("ℹ️ No previous record found. Starting uniqueId from INT2_12000.");
      return res.json({
        success: true,
        uniqueId: "INT2_12000"
      });
    }

    const prevId = lastRecord.uniqueId;  // Example: "INT2_12000"
    console.log("🔍 Unique ID from DB:", prevId);

    // Split prefix and numeric part
    const [prefix, numPart] = prevId.split("_");

    // Convert only numeric part
    const newNumber = Number(numPart) + 1;

    // Rebuild new ID
    const newUniqueId = `${prefix}_${newNumber}`;

    console.log("✅ New Generated Unique ID:", newUniqueId);

    return res.json({
      success: true,
      uniqueId: newUniqueId
    });

  } catch (error) {
    console.error("❌ Error Fetching Latest Unique ID:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

//++++++++++++++++++++++++++++++++++
export const getLatestLocalPurchaseUniqueId = async (req, res) => {
  try {
    const lastRecord = await LocalPurchase.findOne().sort({ createdAt: -1 });

    console.log("📌 Last record fetched from DB:", lastRecord);

    // If no previous record found → start from "INT2_12000"
    if (!lastRecord) {
      console.log("ℹ️ No previous record found. Starting uniqueId from INTLP2_12000.");
      return res.json({
        success: true,
        uniqueId: "INTLP2_12000"
      });
    }

    const prevId = lastRecord.uniqueId;  // Example: "INTLP2_12000"
    console.log("🔍 Unique ID from DB:", prevId);

    // Split prefix and numeric part
    const [prefix, numPart] = prevId.split("_");

    // Convert only numeric part
    const newNumber = Number(numPart) + 1;

    // Rebuild new ID
    const newUniqueId = `${prefix}_${newNumber}`;

    console.log("✅ New Generated Unique ID:", newUniqueId);

    return res.json({
      success: true,
      uniqueId: newUniqueId
    });

  } catch (error) {
    console.error("❌ Error Fetching Latest Unique ID:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};


// ==========================
// Update Purchase Status Fields (Custom Route)
// ==========================
// export const updatePurchase = async (req, res) => {
//   try {
//     const updateData = req.body;

//     const updated = await Purchase.findByIdAndUpdate(
//       req.params.id,
//       updateData,
//       { new: true }
//     );

//     return res.json({ success: true, data: updated });
//   } catch (error) {
//     console.error("❌ Update error:", error);
//     return res.status(500).json({ success: false, error: error.message });
//   }
// };

//?????????????????????????????????????????????????????????????

// Get All
// export const getAllIndentForms = async (req, res) => {
//   try {
//     const forms = await Purchase.find().sort({ createdAt: 1 });
//     return res.json({ success: true, data: forms });
//   } catch (error) {
//     console.error("❌ Error Fetching Forms:", error);
//     return res.status(500).json({ success: false, error: error.message });
//   }
// };

//----------------------------------------------------
export const getAllIndentForms = async (req, res) => {
  try {
    const { role, username } = req.body;

    let filter = {};

    if (role === "PSE") {
      filter = { submittedBy: username };
    } else if (role === "PA") {
      filter = { doerName: username };
    }

    const forms = await Purchase.find(filter).sort({ createdAt: 1 });

    return res.json({
      success: true,
      data: forms,
    });

  } catch (error) {
    console.error("❌ Error Fetching Forms:", error);
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

export const getAllLocalPurchaseForms = async (req, res) => {
  try {
    const { role, username } = req.body;

    let filter = {};

    if (role === "PSE") {
      filter = { submittedBy: username };
    } else if (role === "PA") {
      filter = { doerName: username };
    }

    const forms = await LocalPurchase.find(filter).sort({ createdAt: 1 });

    return res.json({
      success: true,
      data: forms,
    });

  } catch (error) {
    console.error("❌ Error Fetching Forms:", error);
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// export const getAllIndentForms = async (req, res) => {
//   try {
//     // Log what frontend sends
//     console.log("📥 Received from Frontend:", {
//       role: req.body.role,
//       username: req.body.username
//     });

//     const { role, username } = req.body;

//     let filter = {};

//     if (role === "PSE") {
//       filter = { submittedBy: username };
//     } else if (role === "PA") {
//       filter = { doerName: username };
//     }

//     // Log the filter condition created by backend
//     console.log("🔎 Applied Filter:", filter);

//     const forms = await Purchase.find(filter).sort({ createdAt: 1 });

//     // Log what backend is sending back
//     console.log("📤 Sending back records:", forms.length);

//     return res.json({
//       success: true,
//       data: forms,
//     });

//   } catch (error) {
//     console.error("❌ Error Fetching Forms:", error);
//     return res.status(500).json({
//       success: false,
//       error: error.message,
//     });
//   }
// };

// Get One
export const getIndentFormById = async (req, res) => {
  try {
    const form = await Purchase.findById(req.params.id);
    if (!form)
      return res.status(404).json({ success: false, message: "Not Found" });

    res.json({ success: true, data: form });
  } catch (error) {
    console.error("❌ Error Fetching Form:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Update
export const updateIndentForm = async (req, res) => {
  try {
    const form = await Purchase.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    return res.json({
      success: true,
      message: "Form Updated Successfully",
      data: form,
    });
  } catch (error) {
    console.error("❌ Error Updating Form:", error);
    return res.status(500).json({ success: false, error: error.message });
  }
};

// Delete
export const deleteIndentForm = async (req, res) => {
  try {
    await Purchase.findByIdAndDelete(req.params.id);
    return res.json({ success: true, message: "Form Deleted Successfully" });
  } catch (error) {
    console.error("❌ Error Deleting Form:", error);
    return res.status(500).json({ success: false, error: error.message });
  }
};

// Approve
export const approveIndentForm = async (req, res) => {
  try {
    const form = await Purchase.findByIdAndUpdate(
      req.params.id,
      {
        status: "Approved",
        approvedBy: req.body.approvedBy,
      },
      { new: true }
    );

    return res.json({
      success: true,
      message: "Form Approved Successfully",
      data: form,
    });
  } catch (error) {
    console.error("❌ Error Approving Form:", error);
    return res.status(500).json({ success: false, error: error.message });
  }
};

// Reject
export const rejectIndentForm = async (req, res) => {
  try {
    const form = await Purchase.findByIdAndUpdate(
      req.params.id,
      {
        status: "Rejected",
        rejectedReason: req.body.reason,
      },
      { new: true }
    );

    return res.json({
      success: true,
      message: "Form Rejected Successfully",
      data: form,
    });
  } catch (error) {
    console.error("❌ Error Rejecting Form:", error);
    return res.status(500).json({ success: false, error: error.message });
  }
};

// ==========================
// PDF Upload → Google Drive
// ==========================
// export const uploadComparisonPDF = async (req, res) => {
//   try {
//     const { rowId } = req.body;
//     const file = req.file;

//     if (!file) {
//       return res.status(400).json({ success: false, message: "No file uploaded." });
//     }

//     if (!rowId) {
//       return res.status(400).json({ success: false, message: "Row ID is missing." });
//     }

//     const fileMeta = {
//       name: `comparison_${rowId}.pdf`,
//       parents: ["YOUR_GOOGLE_DRIVE_FOLDER_ID"], // <<< replace here
//     };

//     const fileMedia = {
//       mimeType: "application/pdf",
//       body: Buffer.from(file.buffer),
//     };

//     const uploaded = await drive.files.create({
//       requestBody: fileMeta,
//       media: fileMedia,
//       fields: "id",
//     });

//     const fileId = uploaded.data.id;

//     await drive.permissions.create({
//       fileId,
//       requestBody: { role: "reader", type: "anyone" },
//     });

//     const fileUrl = `https://drive.google.com/file/d/${fileId}/preview`;

//     await Purchase.findByIdAndUpdate(rowId, { comparisonPdf: fileUrl });

//     return res.json({
//       success: true,
//       fileUrl,
//       message: "PDF uploaded & URL saved.",
//     });

//   } catch (error) {
//     console.error("Upload PDF Error:", error);
//     return res.status(500).json({
//       success: false,
//       message: "Internal Server Error",
//       error: error.message,
//     });
//   }
// };

export const uploadComparisonPDF = async (req, res) => {
  try {
    const { rowId } = req.body;
    const file = req.file;

    if (!file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded",
      });
    }

    if (!rowId) {
      return res.status(400).json({
        success: false,
        message: "Row ID missing",
      });
    }

    // 🚀 Upload to Google Drive
    const fileUrl = await uploadToGoogleDrive(file, rowId);

    // 💾 Save URL in DB (ONLY here)
    await Purchase.findByIdAndUpdate(rowId, {
      comparisonPdf: fileUrl,
    });

    return res.status(200).json({
      success: true,
      fileUrl,
    });
  } catch (error) {
    console.error("❌ Upload Comparison PDF Error:", error);
    return res.status(500).json({
      success: false,
      message: "PDF upload failed",
    });
  }
};