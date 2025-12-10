import Purchase from "../models/purchase.model.js";

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

export const getLatestUniqueId = async (req, res) => {
  try {
    const lastRecord = await Purchase.findOne().sort({ createdAt: -1 });

    console.log("📌 Last record fetched from DB:", lastRecord);

    // If no previous record found → start from "INT2_1"
    if (!lastRecord) {
      console.log("ℹ️ No previous record found. Starting uniqueId from INT2_1.");
      return res.json({
        success: true,
        uniqueId: "INT2_1"
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


// ==========================
// Update Purchase Status Fields (Custom Route)
// ==========================
export const updatePurchase = async (req, res) => {
  try {
    const updateData = req.body;

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

// Get All
export const getAllIndentForms = async (req, res) => {
  try {
    const forms = await Purchase.find().sort({ createdAt: 1 });
    return res.json({ success: true, data: forms });
  } catch (error) {
    console.error("❌ Error Fetching Forms:", error);
    return res.status(500).json({ success: false, error: error.message });
  }
};

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
export const uploadComparisonPDF = async (req, res) => {
  try {
    const { rowId } = req.body;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ success: false, message: "No file uploaded." });
    }

    if (!rowId) {
      return res.status(400).json({ success: false, message: "Row ID is missing." });
    }

    const fileMeta = {
      name: `comparison_${rowId}.pdf`,
      parents: ["YOUR_GOOGLE_DRIVE_FOLDER_ID"], // <<< replace here
    };

    const fileMedia = {
      mimeType: "application/pdf",
      body: Buffer.from(file.buffer),
    };

    const uploaded = await drive.files.create({
      requestBody: fileMeta,
      media: fileMedia,
      fields: "id",
    });

    const fileId = uploaded.data.id;

    await drive.permissions.create({
      fileId,
      requestBody: { role: "reader", type: "anyone" },
    });

    const fileUrl = `https://drive.google.com/file/d/${fileId}/preview`;

    await Purchase.findByIdAndUpdate(rowId, { comparisonPdf: fileUrl });

    return res.json({
      success: true,
      fileUrl,
      message: "PDF uploaded & URL saved.",
    });

  } catch (error) {
    console.error("Upload PDF Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};