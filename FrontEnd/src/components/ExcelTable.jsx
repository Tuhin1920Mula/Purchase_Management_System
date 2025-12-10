// import React, { useState } from "react";
// import axios from "axios";

// export default function ExcelTable() {
//   const [rawData, setRawData] = useState("");
//   const [rows, setRows] = useState([]);

//   // Parse Excel copied data (tab-separated)
//   const handlePasteData = (e) => {
//     const text = e.target.value;
//     setRawData(text);

//     const parsed = text
//       .trim()
//       .split("\n")
//       .map((row) => row.split("\t")); // Excel uses TAB separator

//     setRows(parsed);
//   };

//   // Send to backend
//   const handleSubmit = async () => {
//     try {
//       const res = await axios.post("http://localhost:5000/api/excel/save", {
//         rows,
//       });

//       alert("Saved Successfully!");
//       console.log(res.data);
//     } catch (error) {
//       console.error(error);
//       alert("Error saving data");
//     }
//   };

//   return (
//     <div className="p-6 max-w-3xl mx-auto">
//       <h1 className="text-2xl font-bold mb-4">Excel Copy-Paste Import</h1>

//       {/* Paste Area */}
//       <textarea
//         className="border p-3 w-full h-40 rounded-lg"
//         placeholder="Copy cells from Excel and paste here..."
//         value={rawData}
//         onChange={handlePasteData}
//       ></textarea>

//       {/* Preview Table */}
//       {rows.length > 0 && (
//         <div className="mt-5">
//           <h2 className="font-semibold mb-2">Preview</h2>
//           <div className="overflow-auto border rounded-lg">
//             <table className="min-w-full border-collapse">
//               <tbody>
//                 {rows.map((r, i) => (
//                   <tr key={i} className="border-b">
//                     {r.map((cell, j) => (
//                       <td key={j} className="border px-3 py-1">
//                         {cell}
//                       </td>
//                     ))}
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>

//           <button
//             onClick={handleSubmit}
//             className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg"
//           >
//             Save to MongoDB
//           </button>
//         </div>
//       )}
//     </div>
//   );
// }

import React, { useState } from "react";
import axios from "axios";

export default function ExcelPasteForm() {
  const [pasteColumn, setPasteColumn] = useState(""); 
  const [tableData, setTableData] = useState([]);

  const headers = ["Item Name", "Quantity", "Rate", "Vendor", "Remarks"];

  // Handle pasted data
  const handlePaste = (e) => {
    const text = e.target.value;

    const parsedRows = text
      .trim()
      .split("\n")
      .map((row) => row.split("\t"));

    // Convert pasted column data into full table structure
    const updatedTable = parsedRows.map((rowValues) => {
      const rowObj = {};

      headers.forEach((h) => (rowObj[h] = "")); // default blank

      if (pasteColumn && headers.includes(pasteColumn)) {
        rowObj[pasteColumn] = rowValues[0] || "";
      }

      return rowObj;
    });

    setTableData(updatedTable);
  };

  const handleSubmit = async () => {
    try {
      const res = await axios.post("http://localhost:5000/api/excel/save", {
        rows: tableData,
      });

      alert("Saved Successfully!");
      console.log(res.data);
    } catch (error) {
      console.error(error);
      alert("Error saving data");
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Excel Copy-Paste Import</h1>

      {/* COLUMN SELECTOR */}
      <div className="mb-4">
        <label className="font-semibold mr-2">Select Field to Paste Into:</label>
        <select
          className="border p-2 rounded"
          value={pasteColumn}
          onChange={(e) => setPasteColumn(e.target.value)}
        >
          <option value="">-- Select Field --</option>
          {headers.map((h, i) => (
            <option key={i} value={h}>
              {h}
            </option>
          ))}
        </select>
      </div>

      {/* TABLE-LIKE PASTE AREA */}
      <div className="border rounded-lg p-3 bg-gray-50">
        <h2 className="font-semibold mb-2">Paste Data Below</h2>

        {/* HEADER ROW */}
        <div className="grid grid-cols-5 font-semibold bg-gray-200 border">
          {headers.map((h, i) => (
            <div key={i} className="border px-2 py-1 text-center">
              {h}
            </div>
          ))}
        </div>

        {/* Paste Cell */}
        <textarea
          className="border w-full mt-2 h-32 p-2 rounded font-mono"
          placeholder="Paste Excel column data here..."
          onChange={handlePaste}
        ></textarea>
      </div>

      {/* PREVIEW TABLE */}
      {tableData.length > 0 && (
        <div className="mt-6">
          <h2 className="font-semibold mb-2">Parsed Table Preview</h2>

          <div className="overflow-auto border rounded-lg">
            <table className="min-w-full border-collapse">
              <thead>
                <tr className="bg-blue-100">
                  {headers.map((h, i) => (
                    <th key={i} className="border px-3 py-2">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {tableData.map((row, rowIndex) => (
                  <tr key={rowIndex} className="border-b">
                    {headers.map((h, i) => (
                      <td key={i} className="border px-3 py-1">
                        {row[h]}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <button
            onClick={handleSubmit}
            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg"
          >
            Save to MongoDB
          </button>
        </div>
      )}
    </div>
  );
}