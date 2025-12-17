const mongoose = require("mongoose");

const RemarkSchema = new mongoose.Schema({
  text: { type: String, required: true },
  addedAt: { type: Date, default: Date.now }
});

const FollowupSchema = new mongoose.Schema(
  {
    type: { type: String, enum: ["pc", "payment"], required: true }, // PC followup or Payment followup
    formNumber: { type: Number, enum: [1, 2, 3, 4], required: true },

    // Core fields (auto-fetched from your main purchase system)
    site: { type: String, required: true },
    uniqueId: { type: String, required: true },
    indentNumber: { type: String, required: true }, // I.N
    itemNumber: { type: String },
    item: { type: String },
    description: { type: String },
    uom: { type: String },
    totalQty: { type: Number },
    submittedBy: { type: String },

    // Timestamp coming from your purchase system (or auto)
    timestamp: { type: Date, default: Date.now },

    // PO details (auto-fetched from your main purchase system)
    poNumber: { type: String },
    poDate: { type: Date },

    // Payment related extra columns
    vendorName: { type: String },
    leadDays: { type: Number },
    paymentCondition: { type: String },

    // Payment-specific: Material received actual date (from DB)
    materialReceivedActualDate: { type: Date },

    // Planned (can be stored or computed in frontend)
    plannedDate: { type: Date },

    // PC followup user-updated fields
    actualDate: { type: Date },
    status: {
      type: String,
      enum: ["HOLD", "CANCELED", "PENDING", "DONE", "NOT APPROVED"],
      default: "PENDING"
    },

    // ✅ Payment followup per-user transaction numbers
    transactionNoRupak: { type: String, default: "" },
    transactionNoAnindita: { type: String, default: "" },

    // Payment followup user-updated fields (stored separately)
    actualDateRupak: { type: Date },
    statusRupak: {
      type: String,
      enum: ["HOLD", "CANCELED", "PENDING", "DONE"],
      default: "PENDING"
    },

    actualDateAnindita: { type: Date },
    statusAnindita: {
      type: String,
      enum: ["HOLD", "CANCELED", "PENDING", "DONE"],
      default: "PENDING"
    },

    // Optional stored delays
    timeDelay: { type: Number },
    timeDelayRupak: { type: Number },
    timeDelayAnindita: { type: Number },

    remarks: [RemarkSchema]
  },
  { timestamps: true }
);

module.exports = mongoose.model("Followup", FollowupSchema);
