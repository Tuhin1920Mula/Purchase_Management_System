// import React, { useState, useEffect, useRef } from "react";
// import { motion } from "framer-motion";
// import { useNavigate } from "react-router-dom";
// import { FaShoppingCart } from "react-icons/fa";

// export default function Transport() {
//     const navigate = useNavigate();

//     useEffect(() => {
//         //fetchIndentForms();
//         const link = document.createElement("link");
//         link.href = "https://fonts.googleapis.com/css2?family=Agu+Display&display=swap";
//         link.rel = "stylesheet";
//         document.head.appendChild(link);
//         // cleanup not required for this example
//     }, []);

//     const handleLogout = () => {
//         localStorage.removeItem("role");
//         localStorage.removeItem("username");
//         navigate("/", { replace: true });
//         window.location.reload();
//     };

//     return (
//         <div className="min-h-screen bg-gray-100 font-poppins">
//           {/* ------------------ TOP NAVBAR ------------------ */}
//           <nav className="w-full py-6 px-10 flex justify-between items-center bg-transparent mt-4">
//             <div className="flex items-center gap-4">
//               <FaShoppingCart className="text-red-600 text-5xl" />
//               <h1
//                 className="text-4xl font-bold tracking-wide text-gray-900"
//                 style={{ fontFamily: "'Agu Display', sans-serif" }}
//               >
//                 PURCHASE MANAGEMENT SYSTEM
//               </h1>
//             </div>
    
//             <button
//               onClick={handleLogout}
//               className="px-5 py-2 bg-red-600 text-white font-medium rounded-full shadow-md hover:bg-red-700 active:scale-95 transition"
//             >
//               Logout
//             </button>
//           </nav>

//           {/* ------------------ MAIN CONTENT ------------------ */}
//             <main className="w-full px-6 py-10">
//                 <motion.div
//                     initial={{ opacity: 0, y: 20 }}
//                     animate={{ opacity: 1, y: 0 }}
//                     transition={{ duration: 0.5 }}
//                     className="bg-white rounded-3xl shadow-md p-8"
//                     >

//                     <div className="mb-8 p-4 bg-red-600 rounded-xl shadow-md text-center">
//                         <h1 className="text-3xl font-bold text-white">Purchase</h1>
//                     </div>

//                     <div className="w-full overflow-x-auto">
//                         <table className="min-w-max border border-gray-200 rounded-xl whitespace-nowrap text-xs">
//                             <thead className="bg-gray-200 text-left rounded-t-xl">
//                                 <tr>
//                                     <th className="px-4 py-3 border-b">Transporter Name</th>
//                                     <th className="px-4 py-3 border-b">Supplier Name</th>
//                                     <th className="px-4 py-3 border-b">Freight Charges</th>
//                                     <th className="px-4 py-3 border-b">Loading/ Unloading Charge</th>
//                                     <th className="px-4 py-3 border-b">Free Period (Demurrage free days)</th>
//                                     <th className="px-4 py-3 border-b">Per Day Charge</th>
//                                     <th className="px-4 py-3 border-b">Insurance</th>
//                                     <th className="px-4 py-3 border-b">Insurance coverage carried by</th>
//                                     <th className="px-4 py-3 border-b">Loading Location</th>
//                                     <th className="px-4 py-3 border-b">Loading State</th>
//                                     <th className="px-4 py-3 border-b">Delivery Point</th>
//                                     <th className="px-4 py-3 border-b">Distance in Km</th>
//                                     <th className="px-4 py-3 border-b">Route</th>
//                                     <th className="px-4 py-3 border-b">Mode of Delivery</th>
//                                     <th className="px-4 py-3 border-b">Start Date</th>
//                                     <th className="px-4 py-3 border-b">Transit Time (Days)</th>
//                                     <th className="px-4 py-3 border-b">Trasporter contact details</th>
//                                     <th className="px-4 py-3 border-b">Driver Contact Details</th>
//                                     <th className="px-4 py-3 border-b">Vehicle Type</th>
//                                     <th className="px-4 py-3 border-b">Vehicle Number</th>
//                                     <th className="px-4 py-3 border-b">Vehicle Loading Capacity (Ton)</th>
//                                     <th className="px-4 py-3 border-b">Required Documents (LR  / GR ) No</th>
//                                     <th className="px-4 py-3 border-b">Required Documents (E-way Bill  & Invoice)</th>
//                                     <th className="px-4 py-3 border-b">PAN CARD (Freight Invoice)</th>
//                                     <th className="px-4 py-3 border-b">Tracking System</th>
//                                     <th className="px-4 py-3 border-b">Payment Terms</th>
//                                     <th className="px-4 py-3 border-b">Dimension (Length Ft)</th>
//                                     <th className="px-4 py-3 border-b">Material Weight (Ton) </th>
//                                     <th className="px-4 py-3 border-b">Special Conditions</th>
//                                     <th className="px-4 py-3 border-b">Material Received</th>
//                                     <th className="px-4 py-3 border-b">Invoice Number</th>
//                                     <th className="px-4 py-3 border-b">Received Date</th>
//                                     <th className="px-4 py-3 border-b">FINAL PAYMENT UTR</th>
//                                     <th className="px-4 py-3 border-b">FINAL PAYMENT DATE</th>
//                                     <th className="px-4 py-3 border-b">UNIT</th>
//                                     <th className="px-4 py-3 border-b">REMARKS</th>
//                                 </tr>
//                             </thead>

//                             <tbody>
//                                 {/* {tableData.map((row, index) => (
//                                 <>
//                                     <tr
//                                         key={row._id || index}
//                                         className={`${index % 2 === 0 ? "bg-gray-50 h-4" : "bg-white h-4"} hover:bg-red-50 transition`}
//                                     ></tr>
//                                 </>
//                                 ))} */}
//                             </tbody>
//                         </table>
//                     </div>
                        
//                 </motion.div>
//             </main>
//         </div>
//     )
// }

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { createTransportRecords, getAllTransportRecords, updateTransportRecords } from "../api/Transport.api";
import { FaShoppingCart } from "react-icons/fa";
import axios from "axios";

const emptyRow = {
  transporterName: "",
  supplierName: "",
  freightCharges: "",
  loadingUnloadingCharge: "",
  freePeriod: "",
  perDayCharge: "",
  insurance: "",
  insuranceCoverageCarriedBy: "",
  loadingLocation: "",
  loadingState: "",
  deliveryPoint: "",
  distanceInKm: "",
  route: "",
  modeOfDelivery: "",
  startDate: "",
  transitTime: "",
  trasporterContactDetails: "",
  driverContactDetails: "",
  vehicleType: "",
  vehicleNumber: "",
  vehicleLoadingCapacity: "",
  lr_Gr_No: "",
  ewayBillInvoice: "",
  panCardFreightInvoice: "",
  trackingSystem: "",
  paymentTerms: "",
  dimension: "",
  materialWeight: "",
  specialConditions: "",
  materialReceived: "",
  invoiceNumber: "",
  receivedDate: "",
  finalPaymentUTR: "",
  finalPaymentDate: "",
  unit: "",
  remarks: ""
};

const columns = [
  { key: "transporterName", label: "Transporter Name" },
  { key: "supplierName", label: "Supplier Name" },
  { key: "freightCharges", label: "Freight Charges" },
  { key: "loadingUnloadingCharge", label: "Loading / Unloading Charge" },
  { key: "freePeriod", label: "Free Period (Demurrage free days)" },
  { key: "perDayCharge", label: "Per Day Charge" },
  { key: "insurance", label: "Insurance" },
  { key: "insuranceCoverageCarriedBy", label: "Insurance coverage carried by" },
  { key: "loadingLocation", label: "Loading Location" },
  { key: "loadingState", label: "Loading State" },
  { key: "deliveryPoint", label: "Delivery Point" },
  { key: "distanceInKm", label: "Distance in Km" },
  { key: "route", label: "Route" },
  { key: "modeOfDelivery", label: "Mode of Delivery" },
  { key: "startDate", label: "Start Date" },
  { key: "transitTime", label: "Transit Time (Days)" },
  { key: "trasporterContactDetails", label: "Transporter Contact Details" },
  { key: "driverContactDetails", label: "Driver Contact Details" },
  { key: "vehicleType", label: "Vehicle Type" },
  { key: "vehicleNumber", label: "Vehicle Number" },
  { key: "vehicleLoadingCapacity", label: "Vehicle Loading Capacity (Ton)" },
  { key: "lr_Gr_No", label: "Required Documents (LR / GR) No" },
  { key: "ewayBillInvoice", label: "Required Documents (E-way Bill & Invoice)" },
  { key: "panCardFreightInvoice", label: "PAN CARD (Freight Invoice)" },
  { key: "trackingSystem", label: "Tracking System" },
  { key: "paymentTerms", label: "Payment Terms" },
  { key: "dimension", label: "Dimension (Length Ft)" },
  { key: "materialWeight", label: "Material Weight (Ton)" },
  { key: "specialConditions", label: "Special Conditions" },
  { key: "materialReceived", label: "Material Received" },
  { key: "invoiceNumber", label: "Invoice Number" },
  { key: "receivedDate", label: "Received Date" },
  { key: "finalPaymentUTR", label: "FINAL PAYMENT UTR" },
  { key: "finalPaymentDate", label: "FINAL PAYMENT DATE" },
  { key: "unit", label: "UNIT" },
  { key: "remarks", label: "REMARKS" },
];

export default function Transport() {
  const navigate = useNavigate();
  const [rows, setRows] = useState([]);
  const [existingRows, setExistingRows] = useState([]); // from DB
  const [newRows, setNewRows] = useState([]);           // added via Add Row

  useEffect(() => {
    fetchTransportData();
    const link = document.createElement("link");
    link.href =
      "https://fonts.googleapis.com/css2?family=Agu+Display&display=swap";
    link.rel = "stylesheet";
    document.head.appendChild(link);
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/", { replace: true });
    window.location.reload();
  };

  const fetchTransportData = async () => {
    try {
        const res = await getAllTransportRecords();
        setExistingRows(res.data || []);
    } catch (error) {
        console.error("Failed to fetch transport records");
    }
};

const handleAddRow = () => {
  setNewRows([...newRows, { ...emptyRow }]);
};

const handleChange = (setFn, index, field, value) => {
  setFn(prev => {
    const updated = [...prev];
    updated[index][field] = value;
    return updated;
  });
};

// const handleSubmit = async () => {
//   if (newRows.length === 0) {
//     alert("No new rows to submit");
//     return;
//   }

//   try {
//     await createTransportRecords(newRows);
//     alert("New transport data saved successfully");
//     setNewRows([]);
//     fetchTransportData(); // refresh table
//   } catch (error) {
//     alert("Failed to save transport data");
//   }
// };

const handleSubmit = async () => {
  if (newRows.length === 0 && existingRows.length === 0) {
    alert("Nothing to submit");
    return;
  }

  try {
    // 1️⃣ Update existing records (if any)
    if (existingRows.length > 0) {
      await updateTransportRecords(existingRows);
    }

    // 2️⃣ Insert new records (if any)
    if (newRows.length > 0) {
      await createTransportRecords(newRows);
      setNewRows([]);
    }

    alert("Transport data saved successfully");
    fetchTransportData(); // refresh table
  } catch (error) {
    console.error(error);
    alert("Failed to save transport data");
  }
};

  return (
    <div className="min-h-screen bg-gray-100 font-poppins">
      {/* ------------------ TOP NAVBAR ------------------ */}
      <nav className="w-full py-6 px-10 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <FaShoppingCart className="text-red-600 text-5xl" />
          <h1
            className="text-4xl font-bold"
            style={{ fontFamily: "'Agu Display', sans-serif" }}
          >
            PURCHASE MANAGEMENT SYSTEM
          </h1>
        </div>

        <button
          onClick={handleLogout}
          className="px-5 py-2 bg-red-600 text-white rounded-full"
        >
          Logout
        </button>
      </nav>

      {/* ------------------ MAIN CONTENT ------------------ */}
      <main className="px-6 py-10">
        <motion.div className="bg-white rounded-3xl shadow-md p-8">
          <div className="mb-6 p-4 bg-red-600 rounded-xl text-center">
            <h1 className="text-3xl font-bold text-white">Transport</h1>
          </div>

          <div className="w-full overflow-x-auto">
            <table className="min-w-max border text-xs">
                <thead className="bg-gray-200">
                    <tr>
                        {columns.map((col) => (
                        <th key={col.key} className="px-4 py-3 border-b">
                            {col.label}
                        </th>
                        ))}
                    </tr>
                </thead>

              <tbody>
                {/* Existing DB Records */}
                {existingRows.map((row, index) => (
                    <tr key={`existing-${row._id}`}>
                        {columns.map((col) => (
                        <td key={col.key} className="border-b px-2 py-1">
                            <input
                            type="text"
                            value={row[col.key] || ""}
                            onChange={(e) =>
                                handleChange(setExistingRows, index, col.key, e.target.value)
                            }
                            className="border rounded p-1 w-full bg-gray-100"
                            />
                        </td>
                        ))}
                    </tr>
                ))}

                {/* Newly Added Rows */}
                {newRows.map((row, index) => (
                    <tr key={`new-${index}`} className="bg-green-50">
                        {columns.map((col) => (
                        <td key={col.key} className="border-b px-2 py-1">
                            <input
                            type="text"
                            value={row[col.key]}
                            onChange={(e) =>
                                handleChange(setNewRows, index, col.key, e.target.value)
                            }
                            className="border rounded p-1 w-full"
                            />
                        </td>
                        ))}
                    </tr>
                ))}
                </tbody>
            </table>
          </div>

          {/* ------------------ ACTION BUTTONS ------------------ */}
          <div className="flex justify-end gap-4 mt-6">
            <button
              onClick={handleAddRow}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Add Row
            </button>

            <button
              onClick={handleSubmit}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              Submit
            </button>
          </div>
        </motion.div>
      </main>
    </div>
  );
}