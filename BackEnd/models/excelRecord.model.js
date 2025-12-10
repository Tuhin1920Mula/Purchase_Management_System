import mongoose from "mongoose";

const excelRecordSchema = new mongoose.Schema(
  {
    columns: {
      type: [String], // store each row as array of strings
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("ExcelRecord", excelRecordSchema);