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

// Get All
export const getAllIndentForms = async (req, res) => {
  try {
    const forms = await Purchase.find().sort({ createdAt: -1 });
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