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
    papwDays: { type: Number, default: 0 },
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

    // ===============================
    // ✅ MATERIAL RECEIVED (PSE + STORE VALIDATION)
    // ===============================
    // Planned date computed as: PO Date + Lead Days (calendar days)
    plannedMaterialReceived: { type: String, default: "" },
    // Actual date = Store Received Date (preferred) else PSE Material Received Date
    actualMaterialReceived: { type: String, default: "" },
    timeDelayMaterialReceived: { type: String, default: "" },
    // Filled by Purchase Executive (PSE)
    materialReceivedDate: { type: String, default: "" },

    // ===============================
    // ✅ STORE SECTION FIELDS
    // ===============================
    // Store (India / source store) fields
    storeStatus: { type: String, default: "" }, // e.g., Received
    storeReceivedDate: { type: String, default: "" },
    // Cumulative received quantity at source store (India). Balance is computed automatically.
    storeReceivedQuantity: { type: Number, default: 0 },
    // NOTE: storeBalanceQuantity is maintained by backend from totalQuantity - storeReceivedQuantity.
    storeBalanceQuantity: { type: Number, default: 0 },
    storeInvoiceNumber: { type: String, default: "" },
    storeInvoiceDate: { type: String, default: "" },

    // Manual closure for Unique ID in Store section (used when received qty mismatch/excess etc.)
    storeManualClosed: { type: Boolean, default: false },
    storeManualClosedAt: { type: Date, default: null },
    storeManualClosedBy: { type: String, default: "" },
    storeManualCloseReason: { type: String, default: "" },


    // Keep invoice history so invoice no/date updates don't override previous values.
    storeInvoiceHistory: {
      type: [
        {
          invoiceNumber: { type: String, default: "" },
          invoiceDate: { type: String, default: "" },
          changedAt: { type: Date, default: Date.now },
          receivedQuantitySnapshot: { type: Number, default: 0 },
          receivedDateSnapshot: { type: String, default: "" },
          balanceQuantitySnapshot: { type: Number, default: 0 },
        },
      ],
      default: [],
    },
    storePrice: { type: Number, default: 0 },
    storeBoxNumber: { type: Number, default: 0 },
    storeModeOfDispatch: { type: String, default: "" },
    storeDispatchDocumentNumber: { type: String, default: "" },
    storeDispatchBoxNumber: { type: Number, default: 0 },
    storeDispatchDate: { type: String, default: "" },
    storeRemarks: { type: String, default: "" },

    // Nigeria store fields
    storeReceivedDateNigeria: { type: String, default: "" },
    storeNigeriaRemarks: { type: String, default: "" },
  },
  { timestamps: true }
);

export default mongoose.model("Purchase", PurchaseSchema);