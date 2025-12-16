import mongoose from "mongoose";

// Function to generate DD-MM-YYYY formatted date
const getFormattedDate = () => {
  const now = new Date();
  const day = String(now.getDate()).padStart(2, "0");
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const year = now.getFullYear();
  return `${year}-${month}-${day}`;
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
    doerName: { type: String, default: "" },
    remarksIndentVerification: { type: String, default: "" },

    plannedGetQuotation: { type: String, default: "" },
    actualGetQuotation: { type: String, default: "" },
    quotationStatus: { type: String, default: "Pending" },
    timeDelayGetQuotation: { type: String, default: "" },
    doerStatus: { type: String, default: "Pending" },
    remarksGetQuotation: { type: String, default: "" },
    //comparisonPdf: { type: String, default: null },
    plannedTechApproval: { type: String, default: "" },
    actualTechApproval: { type: String, default: "" },
    technicalApprovalStatus: { type: String, default: "Pending" },
    timeDelayTechApproval: { type: String, default: "" },
    approverName: { type: String, default: "" },
    remarksTechApproval: { type: String, default: "" },
    plannedCommercialNegotiation: { type: String, default: "" },
    actualCommercialNegotiation: { type: String, default: "" },
    finalizeTermsStatus: { type: String, default: "Pending" },
    timeDelayCommercialNegotiation: { type: String, default: "" },
    getApproval: { type: String, default: "Pending" },
    remarksCommercialNegotiation: { type: String, default: "" },
    approverName2: { type: String, default: "" },
    plannedPoGeneration: { type: String, default: "" },
    actualPoGeneration: { type: String, default: "" },
    poGenerationStatus: { type: String, default: "Pending" },
    timeDelayPoGeneration: { type: String, default: "" },
    poNumber: { type: String, default: "" },
    poDate: { type: String, default: "" },
    vendorName: { type: String, default: "" },
    leadDays: { type: Number, default: 0 },
    amount: { type: Number, default: 0 },
    paymentCondition: { type: String, default: "" },
    remarksPoGeneration: { type: String, default: "" },
    grnToStore: { type: String, default: "Pending" },
  },
  { timestamps: true }
);

export default mongoose.model("Purchase", PurchaseSchema);