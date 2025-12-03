import mongoose from "mongoose";

const PurchaseSchema = new mongoose.Schema(
  {
    site: { type: String, required: true },
    uniqueId: { type: String, required: true },
    indentNumber: { type: String, required: true },
    itemNumber: { type: String, required: true },
    itemDescription: { type: String, required: true },
    uom: { type: String, required: true },
    totalQuantity: { type: Number, required: true },
    submittedBy: { type: String, required: true },
  },
  { timestamps: true }
);

export default mongoose.model("Purchase", PurchaseSchema);