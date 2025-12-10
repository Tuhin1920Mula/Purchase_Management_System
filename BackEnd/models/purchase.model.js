import mongoose from "mongoose";

// Function to generate DD-MM-YYYY formatted date
const getFormattedDate = () => {
  const now = new Date();
  const day = String(now.getDate()).padStart(2, "0");
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const year = now.getFullYear();
  return `${day}-${month}-${year}`;
};

const PurchaseSchema = new mongoose.Schema(
  {
    date: { type: String, default: getFormattedDate }, // <-- Only DD-MM-YYYY

    site: { type: String, required: true },
    section: { type: String, required: true },
    uniqueId: { type: String, required: true },
    indentNumber: { type: String, required: true },
    itemNumber: { type: String, required: true },
    itemDescription: { type: String, required: true },
    uom: { type: String, required: true },
    totalQuantity: { type: Number, required: true },
    submittedBy: { type: String, required: true },

    quotationStatus: { type: String, default: "Pending" },
    doerStatus: { type: String, default: "Pending" },
    //comparisonPdf: { type: String, default: null },
    technicalApprovalStatus: { type: String, default: "Pending" },
    approverName: { type: String, default: "" },
    finalizeTermsStatus: { type: String, default: "Pending" },
    getApproval: { type: String, default: "Pending" },
    approverName2: { type: String, default: "" },
    poGenerationStatus: { type: String, default: "Pending" },
    poNumber: { type: String, default: "" },
    poDate: { type: String, default: "" },
    vendorName: { type: String, default: "" },
    leadDays: { type: Number, default: 0 },
    paymentCondition: { type: String, default: "" },
    grnToStore: { type: String, default: "Pending" },
  },
  { timestamps: true }
);

export default mongoose.model("Purchase", PurchaseSchema);