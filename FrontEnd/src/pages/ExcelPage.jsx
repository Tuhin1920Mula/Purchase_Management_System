import React from "react";
import ExcelTable from "../components/ExcelTable"

export default function ExcelPage() {
  return (
    <div className="p-5">
      <h1 className="text-xl font-bold mb-4">Excel-like Table</h1>
      <ExcelTable />
    </div>
  );
}