import mongoose from "mongoose";

const getFormattedDate = () => {
  const now = new Date();
  const day = String(now.getDate()).padStart(2, "0");
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const year = now.getFullYear();
  return `${year}-${month}-${day}`;
};

const LocalPurchaseSchema = new mongoose.Schema(
  {
    date: { type: String, default: getFormattedDate },

    site: { type: String, required: true },
    section: { type: String, required: true },
    uniqueId: { type: String, required: true },
    indentNumber: { type: String, required: true },
    itemNumber: { type: String, required: true },
    itemDescription: { type: String, required: true },
    uom: { type: String, required: true },
    totalQuantity: { type: Number, required: true },
    submittedBy: { type: String, required: true },

    poDate: { type: String, default: "" },
    vendorName: { type: String, default: "" },
    amount: { type: Number, default: 0 },
    remarks: { type: String, default: "" },
  },
  { timestamps: true }
);
export default mongoose.model("LocalPurchase", LocalPurchaseSchema);