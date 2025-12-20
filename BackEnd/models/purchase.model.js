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
    comparisonStatementPdf: { type: String, default: "" },
    comparisonStatementStatus: { type: String, default: "" },
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
    plannedPCFollowUp1: { type: String, default: "" },
    actualPCFollowUp1: { type: String, default: "" },
    statusPCFollowUp1: { type: String, default: "" },
    timeDelayPCFollowUp1: { type: String, default: "" },
    remarksPCFollowUp1: { type: String, default: "" },
    plannedPCFollowUp2: { type: String, default: "" },
    actualPCFollowUp2: { type: String, default: "" },
    statusPCFollowUp2: { type: String, default: "" },
    timeDelayPCFollowUp2: { type: String, default: "" },
    remarksPCFollowUp2: { type: String, default: "" },
    plannedPCFollowUp3: { type: String, default: "" },
    actualPCFollowUp3: { type: String, default: "" },
    statusPCFollowUp3: { type: String, default: "" },
    timeDelayPCFollowUp3: { type: String, default: "" },
    remarksPCFollowUp3: { type: String, default: "" },
    transactionNoPaymentPWP: { type: String, default: "" },
    plannedPaymentPWP: { type: String, default: "" },
    actualPaymentPWP: { type: String, default: "" },
    statusPaymentPWP: { type: String, default: "" },
    timeDelayPaymentPWP: { type: String, default: "" },
    remarksPaymentPWP: { type: String, default: "" },
    transactionNoPaymentBBD: { type: String, default: "" },
    plannedPaymentBBD: { type: String, default: "" },
    actualPaymentBBD: { type: String, default: "" },
    statusPaymentBBD: { type: String, default: "" },
    timeDelayPaymentBBD: { type: String, default: "" },
    remarksPaymentBBD: { type: String, default: "" },
    transactionNoPaymentFAR: { type: String, default: "" },
    plannedPaymentFAR: { type: String, default: "" },
    actualPaymentFAR: { type: String, default: "" },
    statusPaymentFAR: { type: String, default: "" },
    timeDelayPaymentFAR: { type: String, default: "" },
    remarksPaymentFAR: { type: String, default: "" },
    transactionNoPaymentPAPW: { type: String, default: "" },
    plannedPaymentPAPW: { type: String, default: "" },
    actualPaymentPAPW: { type: String, default: "" },
    statusPaymentPAPW: { type: String, default: "" },
    timeDelayPaymentPAPW: { type: String, default: "" },
    remarksPaymentPAPW: { type: String, default: "" },
    grnToStore: { type: String, default: "Pending" },
  },
  { timestamps: true }
);

export default mongoose.model("Purchase", PurchaseSchema);