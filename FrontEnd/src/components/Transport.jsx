import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { createTransportRecords, getAllTransportRecords, updateTransportRecords } from "../api/Transport.api";
import { FaShoppingCart, FaChevronDown, FaSignOutAlt } from "react-icons/fa";
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
      <nav className="w-full py-6 px-10 flex justify-between items-center bg-transparent mt-4">
              {/* Left Section */}
              <div className="flex items-center gap-4">
                <FaShoppingCart className="text-red-600 text-5xl" />
                <h1
                  className="text-4xl font-bold tracking-wide text-gray-900"
                  style={{ fontFamily: "'Agu Display', sans-serif" }}
                >
                  PURCHASE MANAGEMENT SYSTEM
                </h1>
              </div>
      
              {/* Right User Profile */}
              <div className="relative group">
                {/* Profile Button */}
                <div className="flex items-center gap-3 cursor-pointer select-none">
                  
                  {/* Flower-style Avatar */}
                  <div className="relative w-11 h-11 flex items-center justify-center">
                    <div className="absolute inset-0 rounded-full bg-red-500 opacity-80 blur-[1px]"></div>
                    <div className="relative w-10 h-10 rounded-full bg-red-600 flex items-center justify-center ring-2 ring-red-300 shadow-md">
                      <span className="text-white font-extrabold text-lg uppercase">
                        {localStorage.getItem("username")?.charAt(0)}
                      </span>
                    </div>
                  </div>
      
                  {/* Username (role) */}
                  <span className="font-medium text-gray-800 whitespace-nowrap">
                    {localStorage.getItem("username")}
                    {localStorage.getItem("role") && (
                      <span className="text-sm text-gray-500 ml-1">
                        ({localStorage.getItem("role")})
                      </span>
                    )}
                  </span>
      
                  {/* Triangle */}
                  <FaChevronDown className="text-gray-600 transition-transform group-hover:rotate-180" />
                </div>
      
                {/* Hover Chat Box */}
                <div className="absolute right-0 mt-3 w-44 bg-white rounded-xl shadow-lg border opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                  
                  {/* Triangle Pointer */}
                  <div className="absolute -top-2 right-6 w-4 h-4 bg-white rotate-45 border-l border-t"></div>
      
                  {/* Logout */}
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-4 py-3 text-sm text-gray-700
                              border border-transparent rounded-xl
                              hover:border-red-600 hover:bg-red-50 hover:text-red-600
                              transition"
                  >
                    <FaSignOutAlt />
                    Logout
                  </button>
                </div>
              </div>
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