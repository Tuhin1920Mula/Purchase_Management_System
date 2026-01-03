import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import {
  FaFileAlt,
  FaBalanceScale,
  FaCheckCircle,
  FaHandshake,
  FaFileSignature,
  FaTruck,
  FaMoneyCheckAlt,
  FaShoppingCart,
  FaShip,
  FaFileUpload,
  FaClipboardCheck,
  FaRegMoneyBillAlt,
  FaPhoneAlt,
  FaSearch,
  FaStore,
  FaClipboardList,
  FaUserPlus,
  FaChevronDown,
  FaSignOutAlt,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import {
  getAllIndentForms,
  getAllLocalPurchaseForms,
  updatePurchaseRow,
  updateLocalPurchaseRow,
} from "../../api/IndentForm.api";

import "./GetQuotations.css";


// ---------------------- ROLE FIRST ----------------------
const getNavLinksByRole = (role) => {
  // Default full menu
  const fullMenu = {
    "Executive FMS Section": [
      { name: "Indent Verification", icon: <FaClipboardCheck /> },
      { name: "Get Quotation", icon: <FaFileAlt /> },
      { name: "Comparison Statement", icon: <FaBalanceScale /> },
      { name: "Technical Approval", icon: <FaCheckCircle /> },
      { name: "Commercial Negotiation", icon: <FaHandshake /> },
      { name: "Local Purchase", icon: <FaStore /> },
      { name: "PO Generation", icon: <FaFileSignature /> },
      { name: "PC and Payment", icon: <FaMoneyCheckAlt /> },
      { name: "Transport", icon: <FaShip /> },
      { name: "Material Received", icon: <FaTruck /> },
    ],
  };

  // If PA → restricted menu
  if (role === "PSE") {
    return {
      "Executive FMS Section": [
        { name: "Indent Verification", icon: <FaClipboardCheck /> },
        { name: "Comparison Statement", icon: <FaBalanceScale /> },
        { name: "Technical Approval", icon: <FaCheckCircle /> },
        { name: "Commercial Negotiation", icon: <FaHandshake /> },
        { name: "PO Generation", icon: <FaFileSignature /> },
        { name: "Local Purchase", icon: <FaStore /> },
      ],
    };
  } else if (role === "PA") {
    return {
      "Executive FMS Section": [
        { name: "Get Quotation", icon: <FaFileAlt /> },
        { name: "Comparison Statement", icon: <FaBalanceScale /> },
        { name: "PO Generation", icon: <FaFileSignature /> },
      ],
    };
  } else if (role === "PC") {
    return {
      "Executive FMS Section": [
        { name: "PC Follow Up", icon: <FaPhoneAlt /> },
        { name: "Payment Follow Up", icon: <FaRegMoneyBillAlt /> },
      ],
    };
  } else if (role === "ADMIN") {
    return {
      "Executive FMS Section": [
        { name: "PMS Master Sheet", icon: <FaClipboardList /> },
        { name: "PC Follow Up", icon: <FaPhoneAlt /> },
        { name: "Payment Follow Up", icon: <FaRegMoneyBillAlt /> },
        { name: "Local Purchase", icon: <FaStore /> },
        { name: "Transport", icon: <FaShip /> },
        { name: "Material Received", icon: <FaTruck /> },
      ],
    };
  }

  return fullMenu;
};

export default function PurchasePage() {
  const navigate = useNavigate();
  // --- Load role FIRST ---
  const [role, setRole] = useState(localStorage.getItem("role") || "");
  // --- Generate navLinks AFTER role is known ---
  const navLinks = getNavLinksByRole(role);
  const getDefaultOption = (role) => {
    if (role === "ADMIN") return "PMS Master Sheet";
    if (role === "PA") return "Get Quotation";
    if (role === "PSE") return "Indent Verification";
    if (role === "PC") return "PC Follow Up";
    return "";
  };

  const [selectedOption, setSelectedOption] = useState(getDefaultOption(role));
  const [tableData, setTableData] = useState([]);
  const [changedRows, setChangedRows] = useState({});
  const latestDataRef = useRef([]); // <- always keep freshest data here
  const [saving, setSaving] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState({});
  const [pdfPreview, setPdfPreview] = useState({});
  const [pcFollowUp, setPcFollowUp] = useState("PC1"); // "", "PC1", "PC2", "PC3"
  const [paymentFollowUp, setPaymentFollowUp] = useState("PWP");
  const [findBy, setFindBy] = useState("");
  const [selectedSite, setSelectedSite] = useState("");
  const [date, setDate] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  //const pcIndex = pcFollowUp?.replace("PC", ""); // "1" | "2" | "3"
  const pcIndex =
    selectedOption === "PC Follow Up" ? pcFollowUp.replace("PC", "") : null;
  const paymentKey =
    selectedOption === "Payment Follow Up" ? paymentFollowUp : null;

  // keep ref in-sync whenever state changes
  useEffect(() => {
    latestDataRef.current = tableData;
  }, [tableData]);

  useEffect(() => {
    if (pcFollowUp) {
      // fetchData({ pcFollowUp });
      console.log("Selected PC Follow Up:", pcFollowUp);
    }
  }, [pcFollowUp]);

  // useEffect(() => {
  //   fetchIndentForms();
  // }, [findBy, selectedSite, date, startDate, endDate]);
  useEffect(() => {
    fetchIndentForms();
  }, [selectedOption, findBy, selectedSite, date, startDate, endDate]);

  useEffect(() => {
    fetchIndentForms();
    const link = document.createElement("link");
    link.href =
      "https://fonts.googleapis.com/css2?family=Agu+Display&display=swap";
    link.rel = "stylesheet";
    document.head.appendChild(link);
    // cleanup not required for this example
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("role");
    localStorage.removeItem("username");
    navigate("/", { replace: true });
    window.location.reload();
  };

  // Ensures we update state using functional updater and also return updated for logging
  // const handleFieldChange = (id, field, value) => {
  //   setTableData(prev =>
  //     prev.map(r => (r._id === id ? { ...r, [field]: value } : r))
  //   );

  //   // Track changed rows
  //   setChangedRows(prev => ({
  //     ...prev,
  //     [id]: {
  //       ...prev[id],
  //       [field]: value,
  //     },
  //   }));

  //   console.log("Updated Field:", { id, field, value });
  // };
  const handleFieldChange = (id, field, value) => {
    setTableData((prev) =>
      prev.map((r) => (r._id === id ? { ...r, [field]: value } : r))
    );

    // Track changed rows
    setChangedRows((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
  const today = new Date().toISOString().split("T")[0];

  const isGetQuotationDone = field === "doerStatus" && value === "Done";
  const isGetQuotationNotDone = field === "doerStatus" && value !== "Done";

  const isTechApprovalDone =
    field === "technicalApprovalStatus" && value === "Done";
  const isTechApprovalNotDone =
    field === "technicalApprovalStatus" && value !== "Done";

  const isCommercialDone =
    field === "finalizeTermsStatus" && value === "Done";
  const isCommercialNotDone =
    field === "finalizeTermsStatus" && value !== "Done";

  const isPoDone =
    field === "poGenerationStatus" && value === "Done";
  const isPoNotDone =
    field === "poGenerationStatus" && value !== "Done";

  setTableData((prev) =>
    prev.map((r) => {
      if (r._id !== id) return r;

      return {
        ...r,
        [field]: value,

        // Get Quotation
        ...(isGetQuotationDone && { actualGetQuotation: today }),
        ...(isGetQuotationNotDone && { actualGetQuotation: "" }),

        // Technical Approval
        ...(isTechApprovalDone && { actualTechApproval: today }),
        ...(isTechApprovalNotDone && { actualTechApproval: "" }),

        // Commercial Negotiation
        ...(isCommercialDone && { actualCommercialNegotiation: today }),
        ...(isCommercialNotDone && { actualCommercialNegotiation: "" }),

        // PO Generation
        ...(isPoDone && { actualPoGeneration: today }),
        ...(isPoNotDone && { actualPoGeneration: "" }),
      };
    })
  );

  setChangedRows((prev) => ({
    ...prev,
    [id]: {
      ...prev[id],
      [field]: value,

      // Get Quotation
      ...(isGetQuotationDone && { actualGetQuotation: today }),
      ...(isGetQuotationNotDone && { actualGetQuotation: "" }),

      // Technical Approval
      ...(isTechApprovalDone && { actualTechApproval: today }),
      ...(isTechApprovalNotDone && { actualTechApproval: "" }),

      // Commercial Negotiation
      ...(isCommercialDone && { actualCommercialNegotiation: today }),
      ...(isCommercialNotDone && { actualCommercialNegotiation: "" }),

      // PO Generation
      ...(isPoDone && { actualPoGeneration: today }),
      ...(isPoNotDone && { actualPoGeneration: "" }),
    },
  }));
};

  const toInputDateFormat = (dateStr) => {
    if (!dateStr) return "";
    const [dd, mm, yyyy] = dateStr.split("-");
    return `${yyyy}-${mm}-${dd}`;
  };

  //   const fetchIndentForms = async () => {
  //   try {
  //     const role = localStorage.getItem("role");
  //     const username = localStorage.getItem("username");

  //     const response = await getAllIndentForms({ role, username });

  //     if (response && response.success && response.data) {
  //       let filteredData = response.data;

  //       // -------- FILTER BY SITE --------
  //       if (findBy === "Site" && selectedSite) {
  //         filteredData = filteredData.filter(item =>
  //           item.site?.toLowerCase() === selectedSite.toLowerCase()
  //         );
  //       }

  //       // -------- FILTER BY DATE --------
  //       if (findBy === "Date" && date) {
  //         filteredData = filteredData.filter(item => {
  //           return item.date === date;
  //         });
  //       }

  //       // -------- FILTER BY DATE RANGE --------
  //       if (findBy === "DateRange" && startDate && endDate) {
  //         filteredData = filteredData.filter(item => {
  //           console.log(
  //             "🔍 Range Check → Start:", startDate,
  //             "| End:", endDate,
  //             "| Item:", item.date
  //           );

  //           return item.date >= startDate && item.date <= endDate;
  //         });
  //       }

  //       console.log("📥 Filtered Data fetched:", filteredData);

  //       setTableData(filteredData);
  //       latestDataRef.current = filteredData;
  //     } else {
  //       console.warn("⚠️ Unexpected response:", response);
  //     }
  //   } catch (error) {
  //     console.error("❌ Error fetching Purchase data:", error);
  //   }
  // };

  const fetchIndentForms = async () => {
    try {
      const role = localStorage.getItem("role");
      const username = localStorage.getItem("username");

      let response;

      // ✅ FETCH LOCAL PURCHASE DATA ONLY
      if (selectedOption === "Local Purchase") {
        response = await getAllLocalPurchaseForms({ role, username });
      } else {
        response = await getAllIndentForms({ role, username });
      }

      if (response && response.success && response.data) {
        let filteredData = response.data;

        // -------- FILTER BY SITE --------
        if (findBy === "Site" && selectedSite) {
          filteredData = filteredData.filter(
            (item) => item.site?.toLowerCase() === selectedSite.toLowerCase()
          );
        }

        // -------- FILTER BY DATE --------
        if (findBy === "Date" && date) {
          filteredData = filteredData.filter((item) => item.date === date);
        }

        // -------- FILTER BY DATE RANGE --------
        if (findBy === "DateRange" && startDate && endDate) {
          filteredData = filteredData.filter(
            (item) => item.date >= startDate && item.date <= endDate
          );
        }

        // ✅ ADD THIS PART (DB SNAPSHOT)
      const formattedData = filteredData.map(row => ({
        ...row,
        dbDoerName: row.doerName,
        dbDoerStatus: row.doerStatus,
        dbComparisonStatementStatus: row.comparisonStatementStatus,
        dbTechnicalApprovalStatus: row.technicalApprovalStatus,
        dbFinalizeTermsStatus: row.finalizeTermsStatus,
        dbGetApproval: row.getApproval,
        dbPoGenerationStatus: row.poGenerationStatus,
      }));

      // ✅ USE formattedData, NOT filteredData
      setTableData(formattedData);

        //setTableData(filteredData);
        latestDataRef.current = filteredData;
      } else {
        console.warn("⚠️ Unexpected response:", response);
      }
    } catch (error) {
      console.error("❌ Error fetching Purchase data:", error);
    }
  };

  // Submit uses latestDataRef.current (always freshest snapshot) to build payloads
  // const handleSubmitUpdates = async () => {
  //   if (saving) return;

  //   if (Object.keys(changedRows).length === 0) {
  //     alert("No changes to save.");
  //     return;
  //   }

  //   setSaving(true);

  //   try {
  //     console.log("📤 Sending Changed Rows:", changedRows);

  //     //setChangedRowsForLogging(changedRows);
  //     for (const [id, changes] of Object.entries(changedRows)) {
  //       await updatePurchaseRow(id, changes);
  //       console.log("Updated ID:", id, "Data Sent:", changes);
  //     }

  //     alert("✅ Updates Saved Successfully!");

  //     // Refresh data from backend
  //     await fetchIndentForms();

  //     // Reset changedRows after successful update
  //     setChangedRows({});
  //   } catch (err) {
  //     console.error("❌ Save Error:", err);
  //     alert("Error saving changes.");
  //   } finally {
  //     setSaving(false);
  //   }
  // };

// src/api/LocalPurchase.api.js

const addToLocalPurchase = async (payload) => {
  // ✅ NEW validation
  if (!Array.isArray(payload.indentIds) || payload.indentIds.length === 0) {
    throw new Error("indentIds array is required");
  }

  const res = await fetch("http://localhost:5000/indent/add-to-localPurchase", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || "Failed");
  }

  return data;
};



const handleSubmitUpdates = async () => {
  if (saving) return;

  if (Object.keys(changedRows).length === 0) {
    alert("No changes to save.");
    return;
  }

  setSaving(true);

  try {
    console.log("📤 Sending Changed Rows:", changedRows);

    const localPurchaseIds = [];

    // 1️⃣ Update Purchase rows
    for (const [id, changes] of Object.entries(changedRows)) {

      await updatePurchaseRow(id, changes);
      console.log("🔵 Purchase Updated:", id);

      if (changes.doerName === "Local 1") {
        localPurchaseIds.push(id);
      }
    }

    console.log("🧾 Local Purchase IDs:", localPurchaseIds);

    // 2️⃣ BULK CALL (ONLY ONCE)
    if (localPurchaseIds.length > 0) {
      const response = await addToLocalPurchase({
        indentIds: localPurchaseIds,   // ✅ ARRAY
        doerName: "Local 1",            // ✅ REQUIRED
      });

      console.log("🚀 Bulk Local Purchase Response:", response);
    }

    alert("✅ Updates Saved Successfully!");
    await fetchIndentForms();
    setChangedRows({});

  } catch (err) {
    console.error("❌ Save Error:", err);
    alert(err.message);
  } finally {
    setSaving(false);
  }
};







  // const handlePdfUpload = async (rowId, file) => {
  //   if (!file) return;

  //   // Only allow PDFs
  //   if (file.type !== "application/pdf") {
  //     alert("Only PDF files can be uploaded.");
  //     return;
  //   }

  //   try {
  //     setUploading(true);

  //     const response = await uploadComparisonPDF(rowId, file);
  //     console.log("PDF Upload Response:", response);

  //     if (!response.fileUrl) {
  //       alert("Upload failed: no file URL returned.");
  //       return;
  //     }

  //     alert("PDF uploaded successfully!");

  //     const dbRes = await updatePurchaseRow(rowId, { comparisonPdf: response.fileUrl });

  //     if (!dbRes.success) {
  //       console.warn("Database update failed.");
  //     }

  //     fetchIndentForms(); // Refresh table UI

  //   } catch (err) {
  //     console.error("PDF Upload Error:", err?.response?.data || err);
  //     alert("Failed to upload PDF.");
  //   } finally {
  //     setUploadedFiles(false);
  //   }
  // };

  const isDefaultEditable =
    selectedOption === "Indent Verification" ||
    selectedOption === "Local Purchase" ||
    selectedOption === "PMS Master Sheet";

  return (
    <div className="min-h-screen bg-gray-100 font-poppins">
      {/* ------------------ TOP NAVBAR ------------------ */}
      {/* <nav className="w-full py-6 px-10 flex justify-between items-center bg-transparent mt-4">
        <div className="flex items-center gap-4">
          <FaShoppingCart className="text-red-600 text-5xl" />
          <h1
            className="text-4xl font-bold tracking-wide text-gray-900"
            style={{ fontFamily: "'Agu Display', sans-serif" }}
          >
            PURCHASE MANAGEMENT SYSTEM
          </h1>
        </div>

        <button
          onClick={handleLogout}
          className="px-5 py-2 bg-red-600 text-white font-medium rounded-full shadow-md hover:bg-red-700 active:scale-95 transition"
        >
          Logout
        </button>
      </nav> */}

      <nav className="w-full py-6 px-10 flex justify-between items-center bg-transparent mt-4">
        {/* Left Section */}
        <div className="flex items-center gap-4 purchase-logo">
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

      {/* ------------------ SIDEBAR ------------------ */}
      <aside className="w-64 bg-transparent text-black p-6 float-left h-screen flex flex-col nav-sections">
        {/* NAV LINKS */}
        <div className="flex-1 overflow-y-auto">
          {Object.entries(navLinks).map(([section, links]) => (
            <div key={section} className="mb-8">
              <h2 className="text-lg font-bold mb-4">{section}</h2>

              <ul className="space-y-4">
                {links.length > 0 ? (
                  links.map((link) => {
                    const isSelected = selectedOption === link.name;
                    return (
                      <li
                        key={link.name}
                        //onClick={() => setSelectedOption(link.name)}
                        onClick={() => {
                          if (link.name === "Transport") {
                            navigate("/transport"); // route that renders <Transport />
                          } else {
                            setSelectedOption(link.name);
                          }
                        }}
                        className={`
                          flex items-center gap-5 p-4 rounded-xl cursor-pointer transition shadow-sm
                          bg-gray-100 hover:bg-red-100
                          ${
                            isSelected
                              ? "bg-red-100 border-l-4 border-red-500 text-red-700"
                              : ""
                          }
                        `}
                      >
                        <span className="text-xl">{link.icon}</span>
                        <span className="font-medium">{link.name}</span>
                      </li>
                    );
                  })
                ) : (
                  <li className="text-gray-500 italic">No links</li>
                )}
              </ul>
            </div>
          ))}
          {/* ADD USER BUTTON – ONLY FOR ADMIN */}
          {role === "ADMIN" && (
            <div className="mt-20">
              <button
                onClick={() => navigate("/add-user")}
                className="
                  w-full flex items-center justify-center gap-3
                  p-3 rounded-xl font-semibold
                  bg-red-600 text-white
                  hover:bg-red-700 transition shadow-md
                "
              >
                <FaUserPlus className="text-lg" />
                Add User
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* ------------------ MAIN CONTENT ------------------ */}
      <main className="ml-64 p-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-3xl shadow-md p-8"
        >
          {/* ---------- FILTER BAR (LEFT + RIGHT SAME ROW) ---------- */}
          <div className="flex justify-between items-center mb-3">
            {/* -------- LEFT : PC FOLLOW UP BUTTONS -------- */}
            <div className="flex gap-2">
              {selectedOption === "PC Follow Up" && (
                <>
                  {["PC1", "PC2", "PC3"].map((pc, index) => (
                    <button
                      key={pc}
                      onClick={() => setPcFollowUp(pc)}
                      className={`px-4 py-2 rounded-lg text-xs font-semibold shadow-sm transition
                      ${
                        pcFollowUp === pc
                          ? "bg-red-600 text-white"
                          : "bg-gray-100 text-gray-700 hover:bg-red-100"
                      }`}
                    >
                      PC-Follow UP {index + 1}
                    </button>
                  ))}
                </>
              )}

              {selectedOption === "Payment Follow Up" && (
                <>
                  {[
                    { key: "PWP", label: "Payment Along with PO" },
                    { key: "BBD", label: "Balance Before Dispatch" },
                    { key: "FAR", label: "After Receive Material / FAR" },
                    {
                      key: "PAPW",
                      label: "Payment After Performance Warranty / PAPW",
                    },
                  ].map((item) => (
                    <button
                      key={item.key}
                      onClick={() => setPaymentFollowUp(item.key)}
                      className={`px-4 py-2 rounded-lg text-xs font-semibold shadow-sm transition
                      ${
                        paymentFollowUp === item.key
                          ? "bg-red-600 text-white"
                          : "bg-gray-100 text-gray-700 hover:bg-red-100"
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </>
              )}
            </div>
            {/* -------- RIGHT : FIND BY FILTERS -------- */}
            <div className="flex items-center gap-3">
              {/* Icon + Label with background */}
              <div className="flex items-center gap-2 bg-red-100 px-3 py-2 rounded-lg shadow-sm">
                <FaSearch className="text-red-700 text-xl font-bold" />

                <label className="text-lg font-bold text-red-800">
                  Find By :
                </label>
              </div>

              {/* Main Dropdown */}
              <select
                className="border p-1 rounded-lg text-xs"
                value={findBy}
                onChange={(e) => setFindBy(e.target.value)}
              >
                <option value="">Select</option>
                <option value="Site">Site</option>
                <option value="Date">Date</option>
                <option value="DateRange">Date Range</option>
              </select>

              {/* If Site selected */}
              {findBy === "Site" && (
                <select
                  className="border p-1 rounded-lg text-xs"
                  value={selectedSite}
                  onChange={(e) => setSelectedSite(e.target.value)}
                >
                  <option value="">Select Site</option>
                  <option value="HIPL">HIPL</option>
                  <option value="RSIPL">RSIPL</option>
                  <option value="HRM">HRM</option>
                  <option value="SUNAGROW">SUNAGROW</option>
                  <option value="RICE FIELD">RICE FIELD</option>
                </select>
              )}

              {/* If Date selected */}
              {findBy === "Date" && (
                <div className="flex items-center gap-2">
                  <input
                    type="date"
                    className="border p-1 rounded-lg text-xs"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                  />
                </div>
              )}

              {/* If Date Range selected */}
              {findBy === "DateRange" && (
                <div className="flex items-center gap-2">
                  <input
                    type="date"
                    className="border p-1 rounded-lg text-xs"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                  <span className="font-medium text-xs">to</span>
                  <input
                    type="date"
                    className="border p-1 rounded-lg text-xs"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </div>
              )}
            </div>
          </div>

          <div className="mb-8 p-4 bg-red-600 rounded-xl shadow-md text-center">
            <h1 className="text-3xl font-bold text-white">Purchase</h1>
          </div>

          <div className="w-full overflow-x-auto max-h-[400px] overflow-y-auto">

            <table className="min-w-max border border-gray-200 rounded-xl whitespace-nowrap text-xs">
              <thead className="bg-gray-200 text-left rounded-t-xl">
                <tr>
                  {/* ------------------------- COMPARISON STATEMENT ------------------------- */}
                  {selectedOption === "Comparison Statement" ? (
                    <>
                      <th className="px-4 py-3 border-b">Date</th>
                      <th className="px-4 py-3 border-b">Unique ID</th>
                      <th className="px-4 py-3 border-b text-red-700">
                        Upload PDF
                      </th>

                      {/* Add conditional header based on role */}
                      {role === "PA" && (
                        <th className="px-4 py-3 border-b text-red-700">
                          Upload Status
                        </th>
                      )}

                      {role === "PSE" && (
                        <th className="px-4 py-3 border-b text-red-700">
                          Review Status
                        </th>
                      )}
                    </>
                  ) : (
                    <>
                      {/* ------------------------- DEFAULT COLUMNS ------------------------- */}
                      <th className="px-4 py-3 border-b">Date</th>
                      <th className="px-4 py-3 border-b">Site</th>
                      <th className="px-4 py-3 border-b">Unique ID</th>
                      <th className="px-4 py-3 border-b">Indent Number</th>
                      <th className="px-4 py-3 border-b">Item Number</th>
                      <th className="px-4 py-3 border-b">Item Description</th>
                      <th className="px-4 py-3 border-b">UOM</th>
                      <th className="px-4 py-3 border-b">Total Quantity</th>
                      <th className="px-4 py-3 border-b">Submitted By</th>
                      <th className="px-4 py-3 border-b">Section</th>
                      <th className="px-4 py-3 border-b text-red-700">
                        Doer Name
                      </th>

                      {/* ------------------------- CONDITIONAL HEADERS ------------------------- */}
                      {selectedOption === "PMS Master Sheet" && (
                        <>
                          <th className="px-4 py-3 border-b text-red-700">
                            Remarks
                          </th>
                          <th className="px-4 py-3 border-b text-red-700">
                            Planned Date
                          </th>
                          <th className="px-4 py-3 border-b text-red-700">
                            Actual Date
                          </th>
                          <th className="px-4 py-3 border-b text-red-700">
                            Send for Get Quotation
                          </th>
                          <th className="px-4 py-3 border-b text-red-700">
                            Doer Status
                          </th>
                          <th className="px-4 py-3 border-b text-red-700">
                            Time Delay
                          </th>
                          <th className="px-4 py-3 border-b text-red-700">
                            Remarks
                          </th>
                          <th className="px-4 py-3 border-b text-red-700">
                            Planned Date
                          </th>
                          <th className="px-4 py-3 border-b text-red-700">
                            Actual Date
                          </th>
                          <th className="px-4 py-3 border-b text-red-700">
                            Technical Approval Status
                          </th>
                          <th className="px-4 py-3 border-b text-red-700">
                            Time Delay
                          </th>
                          <th className="px-4 py-3 border-b text-red-700">
                            Approver Name
                          </th>
                          <th className="px-4 py-3 border-b text-red-700">
                            Remarks
                          </th>
                          <th className="px-4 py-3 border-b text-red-700">
                            Planned Date
                          </th>
                          <th className="px-4 py-3 border-b text-red-700">
                            Actual Date
                          </th>
                          <th className="px-4 py-3 border-b text-red-700">
                            Finalize Terms Status
                          </th>
                          <th className="px-4 py-3 border-b text-red-700">
                            Time Delay
                          </th>
                          <th className="px-4 py-3 border-b text-red-700">
                            Get Approval
                          </th>
                          <th className="px-4 py-3 border-b text-red-700">
                            Approver Name
                          </th>
                          <th className="px-4 py-3 border-b text-red-700">
                            Remarks
                          </th>
                          <th className="px-4 py-3 border-b text-red-700">
                            Planned Date
                          </th>
                          <th className="px-4 py-3 border-b text-red-700">
                            Actual Date
                          </th>
                          <th className="px-4 py-3 border-b text-red-700">
                            PO Generation Status
                          </th>
                          <th className="px-4 py-3 border-b text-red-700">
                            Time Delay
                          </th>
                          <th className="px-4 py-3 border-b text-red-700">
                            PO Date
                          </th>
                          <th className="px-4 py-3 border-b text-red-700">
                            PO Number
                          </th>
                          <th className="px-4 py-3 border-b text-red-700">
                            Vendor Name
                          </th>
                          <th className="px-4 py-3 border-b text-red-700">
                            Lead Days
                          </th>
                          <th className="px-4 py-3 border-b text-red-700">
                            Amount
                          </th>
                          <th className="px-4 py-3 border-b text-red-700">
                            Payment Condition
                          </th>
                          <th className="px-4 py-3 border-b text-red-700">
                            Remarks
                          </th>
                        </>
                      )}

                      {selectedOption === "Indent Verification" && (
                        <>
                          <th className="px-4 py-3 border-b text-red-700">
                            Remarks
                          </th>
                        </>
                      )}

                      {selectedOption === "Get Quotation" && (
                        <>
                          <th className="px-4 py-3 border-b text-red-700">
                            Planned Date
                          </th>
                          <th className="px-4 py-3 border-b text-red-700">
                            Actual Date
                          </th>
                          <th className="px-4 py-3 border-b text-red-700">
                            Send for Get Quotation
                          </th>
                          <th className="px-4 py-3 border-b text-red-700">
                            Doer Status
                          </th>
                          <th className="px-4 py-3 border-b text-red-700">
                            Time Delay
                          </th>
                          <th className="px-4 py-3 border-b text-red-700">
                            Remarks
                          </th>
                        </>
                      )}

                      {selectedOption === "Technical Approval" && (
                        <>
                          <th className="px-4 py-3 border-b text-red-700">
                            Planned Date
                          </th>
                          <th className="px-4 py-3 border-b text-red-700">
                            Actual Date
                          </th>
                          <th className="px-4 py-3 border-b text-red-700">
                            Technical Approval Status
                          </th>
                          <th className="px-4 py-3 border-b text-red-700">
                            Time Delay
                          </th>
                          <th className="px-4 py-3 border-b text-red-700">
                            Approver Name
                          </th>
                          <th className="px-4 py-3 border-b text-red-700">
                            Remarks
                          </th>
                        </>
                      )}

                      {selectedOption === "Commercial Negotiation" && (
                        <>
                          <th className="px-4 py-3 border-b text-red-700">
                            Planned Date
                          </th>
                          <th className="px-4 py-3 border-b text-red-700">
                            Actual Date
                          </th>
                          <th className="px-4 py-3 border-b text-red-700">
                            Finalize Terms Status
                          </th>
                          <th className="px-4 py-3 border-b text-red-700">
                            Time Delay
                          </th>
                          <th className="px-4 py-3 border-b text-red-700">
                            Get Approval
                          </th>
                          <th className="px-4 py-3 border-b text-red-700">
                            Approver Name
                          </th>
                          <th className="px-4 py-3 border-b text-red-700">
                            Remarks
                          </th>
                        </>
                      )}

                      {selectedOption === "PO Generation" && (
                        <>
                          <th className="px-4 py-3 border-b text-red-700">
                            Planned Date
                          </th>
                          <th className="px-4 py-3 border-b text-red-700">
                            Actual Date
                          </th>
                          <th className="px-4 py-3 border-b text-red-700">
                            PO Generation Status
                          </th>
                          <th className="px-4 py-3 border-b text-red-700">
                            Time Delay
                          </th>
                          <th className="px-4 py-3 border-b text-red-700">
                            PO Date
                          </th>
                          <th className="px-4 py-3 border-b text-red-700">
                            PO Number
                          </th>
                          <th className="px-4 py-3 border-b text-red-700">
                            Vendor Name
                          </th>
                          <th className="px-4 py-3 border-b text-red-700">
                            Lead Days
                          </th>
                          <th className="px-4 py-3 border-b text-red-700">
                            Amount
                          </th>
                          <th className="px-4 py-3 border-b text-red-700">
                            Payment Condition
                          </th>
                          <th className="px-4 py-3 border-b text-red-700">
                            Remarks
                          </th>
                        </>
                      )}

                      {selectedOption === "Local Purchase" && (
                        <>
                          <th className="px-4 py-3 border-b text-red-700">
                            PO Date
                          </th>
                          <th className="px-4 py-3 border-b text-red-700">
                            Vendor Name
                          </th>
                          <th className="px-4 py-3 border-b text-red-700">
                            Amount
                          </th>
                          <th className="px-4 py-3 border-b text-red-700">
                            Remarks
                          </th>
                        </>
                      )}

                      {(selectedOption === "PC Follow Up" ||
                        selectedOption === "Payment Follow Up") && (
                        <>
                          <th className="px-4 py-3 border-b text-red-700">
                            PO Date
                          </th>
                          <th className="px-4 py-3 border-b text-red-700">
                            PO Number
                          </th>
                          <th className="px-4 py-3 border-b text-red-700">
                            Vendor Name
                          </th>
                          <th className="px-4 py-3 border-b text-red-700">
                            Lead Days
                          </th>
                          <th className="px-4 py-3 border-b text-red-700">
                            Payment Condition
                          </th>

                          {/* Extra column only for Payment Follow Up */}
                          {selectedOption === "Payment Follow Up" && (
                            <th className="px-4 py-3 border-b text-red-700">
                              Transaction Number
                            </th>
                          )}

                          <th className="px-4 py-3 border-b text-red-700">
                            Planned Date
                          </th>
                          <th className="px-4 py-3 border-b text-red-700">
                            Actual Date
                          </th>
                          <th className="px-4 py-3 border-b text-red-700">
                            Follow Up Status
                          </th>
                          <th className="px-4 py-3 border-b text-red-700">
                            Time Delay
                          </th>
                          <th className="px-4 py-3 border-b text-red-700">
                            Remarks
                          </th>
                        </>
                      )}

                      {selectedOption === "Material Received" && (
                        <>
                          <th className="px-4 py-3 border-b text-red-700">
                            GRN to Store
                          </th>
                        </>
                      )}
                    </>
                  )}
                </tr>
              </thead>

              <tbody>
                {tableData.map((row, index) => (
                  <>
                    {selectedOption === "Comparison Statement" ? (
                      /* ------------- ONLY FOR COMPARISON STATEMENT ------------- */
                      <tr
                        key={row._id || index}
                        className={`
                          h-4 transition
                          ${
                            row.comparisonStatementStatus === "Reopen"
                              ? "bg-yellow-200 hover:bg-yellow-300"
                              : index % 2 === 0
                              ? "bg-gray-50 hover:bg-red-50"
                              : "bg-white hover:bg-red-50"
                          }
                        `}
                      >
                        {/* Date */}
                        <td className="px-4 py-0 border-b">{row.date}</td>

                        {/* Unique ID */}
                        <td className="px-4 py-0 border-b">{row.uniqueId}</td>

                        {/* PDF Upload Section */}
                        <td className="px-4 py-1 border-b flex items-center gap-3">
                          {(() => {
                            const isPA = localStorage.getItem("role") === "PA";
                            const isDone =
                              row.comparisonStatementStatus === "Done";
                            const isReadOnly = isPA && isDone;

                            return (
                              <>
                                {/* Hidden File Input */}
                                <input
                                  id={`pdfInput_${row._id}`}
                                  type="file"
                                  accept="application/pdf"
                                  className="hidden"
                                  disabled={isReadOnly}
                                  onChange={(e) => {
                                    if (isReadOnly) return;

                                    const file = e.target.files[0];
                                    if (!file) return;

                                    const previewUrl =
                                      URL.createObjectURL(file);

                                    setPdfPreview((prev) => ({
                                      ...prev,
                                      [row._id]: previewUrl,
                                    }));

                                    setUploadedFiles((prev) => ({
                                      ...prev,
                                      [row._id]: file.name,
                                    }));

                                    handlePdfUpload(row._id, file);
                                  }}
                                />

                                {/* Upload Button */}
                                <button
                                  type="button"
                                  disabled={isReadOnly}
                                  onClick={() =>
                                    !isReadOnly &&
                                    document
                                      .getElementById(`pdfInput_${row._id}`)
                                      .click()
                                  }
                                  className={`flex items-center gap-2 px-3 py-0.5 rounded transition
                                    ${
                                      isReadOnly
                                        ? "bg-gray-400 cursor-not-allowed text-white"
                                        : "bg-blue-600 hover:bg-blue-700 text-white"
                                    }`}
                                >
                                  <FaFileUpload /> Upload
                                </button>

                                {/* Uploaded Filename Button */}
                                {uploadedFiles[row._id] && (
                                  <button
                                    onClick={() =>
                                      window.open(pdfPreview[row._id], "_blank")
                                    }
                                    className="px-3 py-0 rounded font-medium transition"
                                    style={{
                                      backgroundColor: "#F5D038",
                                      color: "#000",
                                    }}
                                  >
                                    {uploadedFiles[row._id]}
                                  </button>
                                )}

                                {/* Already Uploaded PDF (DB / Google Drive) */}
                                {row.comparisonPdf && (
                                  <button
                                    onClick={() =>
                                      window.open(row.comparisonPdf, "_blank")
                                    }
                                    className="px-3 py-1 rounded font-medium transition"
                                    style={{
                                      backgroundColor: "#F5D038",
                                      color: "#000",
                                    }}
                                  >
                                    View Uploaded PDF
                                  </button>
                                )}
                              </>
                            );
                          })()}
                        </td>

                        {/* Comparison Statement Status */}
                        <td className="px-4 py-0 border-b">
                          <select
                            className="border p-0 rounded"
                            value={row.comparisonStatementStatus ?? ""}
                            disabled={
                              localStorage.getItem("role") === "PA" &&
                              row.comparisonStatementStatus === "Done"
                            }
                            onChange={(e) =>
                              handleFieldChange(
                                row._id,
                                "comparisonStatementStatus",
                                e.target.value
                              )
                            }
                          >
                            <option value="">--Select--</option>
                            <option value="Hold">Hold</option>
                            <option value="Cancelled">Cancelled</option>
                            <option value="Done">Done</option>
                            <option value="Reopen">Reopen</option>
                          </select>
                        </td>
                      </tr>
                    ) : (
                      /* ------------- ALL OTHER SECTIONS (DEFAULT TABLE) ------------- */
                      <tr
                        key={row._id || index}
                        className={`${
                          index % 2 === 0 ? "bg-gray-50" : "bg-white"
                        } hover:bg-red-50 transition`}
                      >
                        {/* DATE */}
                        <td className="px-4 py-2 border-b">
                          {isDefaultEditable ? (
                            <input
                              type="date"
                              className="border p-1 rounded w-full"
                              value={row.date ?? ""}
                              onChange={(e) =>
                                handleFieldChange(
                                  row._id,
                                  "date",
                                  e.target.value
                                )
                              }
                            />
                          ) : row.date ? (
                            new Date(row.date)
                              .toLocaleDateString("en-GB")
                              .replace(/\//g, "-")
                          ) : (
                            ""
                          )}
                        </td>

                        {/* SITE */}
                        <td className="px-4 py-2 border-b">
                          {isDefaultEditable ? (
                            <select
                              className="border p-1 rounded w-full"
                              value={row.site ?? ""}
                              onChange={(e) =>
                                handleFieldChange(
                                  row._id,
                                  "site",
                                  e.target.value
                                )
                              }
                            >
                              <option value="">Select Site</option>
                              <option value="HIPL">HIPL</option>
                              <option value="RSIPL">RSIPL</option>
                              <option value="HRM">HRM</option>
                              <option value="SUNAGROW">SUNAGROW</option>
                              <option value="RICE FIELD">RICE FIELD</option>
                            </select>
                          ) : (
                            row.site
                          )}
                        </td>

                        {/* UNIQUE ID (ALWAYS READ ONLY) */}
                        <td className="px-4 py-2 border-b bg-gray-100 cursor-not-allowed">
                          {row.uniqueId}
                        </td>

                        {/* INDENT NUMBER */}
                        <td className="px-4 py-2 border-b">
                          {isDefaultEditable ? (
                            <input
                              type="text"
                              className="border p-1 rounded w-full"
                              value={row.indentNumber ?? ""}
                              onChange={(e) =>
                                handleFieldChange(
                                  row._id,
                                  "indentNumber",
                                  e.target.value
                                )
                              }
                            />
                          ) : (
                            row.indentNumber
                          )}
                        </td>

                        {/* ITEM NUMBER */}
                        <td className="px-4 py-2 border-b">
                          {isDefaultEditable ? (
                            <input
                              type="text"
                              className="border p-1 rounded w-full"
                              value={row.itemNumber ?? ""}
                              onChange={(e) =>
                                handleFieldChange(
                                  row._id,
                                  "itemNumber",
                                  e.target.value
                                )
                              }
                            />
                          ) : (
                            row.itemNumber
                          )}
                        </td>

                        {/* ITEM DESCRIPTION */}
                        <td className="px-4 py-2 border-b">
                          {isDefaultEditable ? (
                            <input
                              type="text"
                              className="border p-1 rounded w-full"
                              value={row.itemDescription ?? ""}
                              onChange={(e) =>
                                handleFieldChange(
                                  row._id,
                                  "itemDescription",
                                  e.target.value
                                )
                              }
                            />
                          ) : (
                            row.itemDescription
                          )}
                        </td>

                        {/* UOM */}
                        <td className="px-4 py-2 border-b">
                          {isDefaultEditable ? (
                            <input
                              type="text"
                              className="border p-1 rounded w-full"
                              value={row.uom ?? ""}
                              onChange={(e) =>
                                handleFieldChange(
                                  row._id,
                                  "uom",
                                  e.target.value
                                )
                              }
                            />
                          ) : (
                            row.uom
                          )}
                        </td>

                        {/* TOTAL QUANTITY */}
                        <td className="px-4 py-2 border-b">
                          {isDefaultEditable ? (
                            <input
                              type="number"
                              className="border p-1 rounded w-full"
                              value={row.totalQuantity ?? ""}
                              onChange={(e) =>
                                handleFieldChange(
                                  row._id,
                                  "totalQuantity",
                                  e.target.value
                                )
                              }
                            />
                          ) : (
                            row.totalQuantity
                          )}
                        </td>

                        {/* SUBMITTED BY (ALWAYS READ ONLY) */}
                        <td className="px-4 py-2 border-b bg-gray-100 cursor-not-allowed">
                          {/* {row.submittedBy} */}
                          {isDefaultEditable ? (
                            <select
                              className="border p-1 rounded w-full"
                              value={row.submittedBy ?? ""}
                              onChange={(e) =>
                                handleFieldChange(
                                  row._id,
                                  "submittedBy",
                                  e.target.value
                                )
                              }
                            >
                              <option value="">Select Site</option>
                              <option value="User">Admin</option>
                              <option value="Arpita Ghosh">Arpita Ghosh</option>
                              <option value="Praloy Ghosh">Praloy Ghosh</option>
                              <option value="Amit Ray">Amit Ray</option>
                            </select>
                          ) : (
                            row.submittedBy
                          )}
                        </td>

                        {/* {<td className="px-4 py-2 border-b">
                          {isDefaultEditable ? (
                            <select
                              className="border p-1 rounded w-full"
                              value={row.site ?? ""}
                              onChange={(e) => handleFieldChange(row._id, "site", e.target.value)}
                            >
                              <option value="">Select Site</option>
                              <option value="HIPL">HIPL</option>
                              <option value="RSIPL">RSIPL</option>
                              <option value="HRM">HRM</option>
                              <option value="SUNAGROW">SUNAGROW</option>
                              <option value="RICE FIELD">RICE FIELD</option>
                            </select>
                          ) : (
                            row.site
                          )}
                        </td>} */}

                        {/* SECTION */}
                        <td className="px-4 py-2 border-b">
                          {isDefaultEditable ? (
                            <select
                              className="border p-1 rounded w-full"
                              value={row.section ?? ""}
                              onChange={(e) =>
                                handleFieldChange(
                                  row._id,
                                  "section",
                                  e.target.value
                                )
                              }
                            >
                              <option value="">Select Section</option>
                              <option value="REFINERY">REFINERY</option>
                              <option value="CENTRAL STORE">
                                CENTRAL STORE
                              </option>
                              <option value="MEGA STORE">MEGA STORE</option>
                              <option value="OILS STORE">OILS STORE</option>
                              <option value="PP STORE">PP STORE</option>
                              <option value="RSIPL">RSIPL</option>
                              <option value="HRM">HRM</option>
                              <option value="OILS LAB">OILS LAB</option>
                              <option value="RSIPL-PROJECT-R">
                                RSIPL-PROJECT-R
                              </option>
                              <option value="RSIPL-PROJECT-S">
                                RSIPL-PROJECT-S
                              </option>
                            </select>
                          ) : (
                            row.section
                          )}
                        </td>

                        {/* DOER NAME */}
                        <td className="px-4 py-2 border-b">
                          {selectedOption === "Indent Verification" ? (
                            <select
                              className="border p-1 rounded w-full"
                              value={row.doerName ?? ""}
                              onChange={(e) =>
                                handleFieldChange(
                                  row._id,
                                  "doerName",
                                  e.target.value
                                )
                              }
                            >
                              <option value="">Select Doer Name</option>
                              <option value="Executive 1">Executive 1</option>
                              <option value="Executive 2">Executive 2</option>
                              <option value="Executive 3">Executive 3</option>
                              <option value="Executive 4">Executive 4</option>
                              <option value="Local 1">Local Purchase</option>
                            </select>
                          ) : (
                            row.doerName
                          )}
                        </td>

                        {/* ------------ OTHER CONDITION BLOCKS REMAIN SAME ------------ */}

                        {/* PMS Master Sheet */}
                        {selectedOption === "PMS Master Sheet" && (
                          <>
                            <td className="px-4 py-2 border-b">
                              <input
                                type="text"
                                className="border p-1 rounded"
                                value={row.remarksIndentVerification ?? ""}
                                onChange={(e) =>
                                  handleFieldChange(
                                    row._id,
                                    "remarksIndentVerification",
                                    e.target.value
                                  )
                                }
                              />
                            </td>

                            <td className="px-4 py-2 border-b bg-gray-100 cursor-not-allowed">
                              {row.plannedGetQuotation
                                ? new Date(row.plannedGetQuotation)
                                    .toLocaleDateString("en-GB")
                                    .replace(/\//g, "-")
                                : ""}
                            </td>

                            <td className="px-4 py-2 border-b">
                              <input
                                type="date"
                                className="border p-1 rounded"
                                value={row.actualGetQuotation ?? ""}
                                onChange={(e) =>
                                  handleFieldChange(
                                    row._id,
                                    "actualGetQuotation",
                                    e.target.value
                                  )
                                }
                              />
                            </td>

                            <td className="px-4 py-2 border-b">
                              <select
                                className="border p-1 rounded"
                                value={row.quotationStatus ?? ""}
                                onChange={(e) =>
                                  handleFieldChange(
                                    row._id,
                                    "quotationStatus",
                                    e.target.value
                                  )
                                }
                              >
                                <option value="">--Select--</option>
                                <option value="Inquiry Send">
                                  Inquiry Send
                                </option>
                                <option value="Hold">Hold</option>
                              </select>
                            </td>

                            <td className="px-4 py-2 border-b">
                              <select
                                className="border p-1 rounded"
                                value={row.doerStatus ?? ""}
                                onChange={(e) =>
                                  handleFieldChange(
                                    row._id,
                                    "doerStatus",
                                    e.target.value
                                  )
                                }
                              >
                                <option value="">--Select--</option>
                                <option value="Done">Done</option>
                              </select>
                            </td>

                            <td className="px-4 py-2 border-b bg-gray-100 cursor-not-allowed">
                              {row.timeDelayGetQuotation}
                            </td>

                            <td className="px-4 py-2 border-b">
                              <input
                                type="text"
                                className="border p-1 rounded"
                                value={row.remarksGetQuotation ?? ""}
                                onChange={(e) =>
                                  handleFieldChange(
                                    row._id,
                                    "remarksGetQuotation",
                                    e.target.value
                                  )
                                }
                              />
                            </td>

                            <td className="px-4 py-2 border-b bg-gray-100 cursor-not-allowed">
                              {row.plannedTechApproval
                                ? new Date(row.plannedTechApproval)
                                    .toLocaleDateString("en-GB")
                                    .replace(/\//g, "-")
                                : ""}
                            </td>

                            <td className="px-4 py-2 border-b">
                              <input
                                type="date"
                                className="border p-1 rounded"
                                value={row.actualTechApproval ?? ""}
                                onChange={(e) =>
                                  handleFieldChange(
                                    row._id,
                                    "actualTechApproval",
                                    e.target.value
                                  )
                                }
                              />
                            </td>

                            <td className="px-4 py-2 border-b">
                              <select
                                className="border p-1 rounded"
                                value={row.technicalApprovalStatus ?? ""}
                                onChange={(e) =>
                                  handleFieldChange(
                                    row._id,
                                    "technicalApprovalStatus",
                                    e.target.value
                                  )
                                }
                              >
                                <option value="">--Select--</option>
                                <option value="Hold">Hold</option>
                                <option value="Cancelled">Cancelled</option>
                                <option value="Done">Done</option>
                                <option value="Reopen">Reopen</option>
                              </select>
                            </td>

                            <td className="px-4 py-2 border-b bg-gray-100 cursor-not-allowed">
                              {row.timeDelayTechApproval}
                            </td>

                            <td className="px-4 py-2 border-b">
                              <input
                                type="text"
                                className="border p-1 rounded"
                                value={row.approverName ?? ""}
                                onChange={(e) =>
                                  handleFieldChange(
                                    row._id,
                                    "approverName",
                                    e.target.value
                                  )
                                }
                              />
                            </td>

                            <td className="px-4 py-2 border-b">
                              <input
                                type="text"
                                className="border p-1 rounded"
                                value={row.remarksTechApproval ?? ""}
                                onChange={(e) =>
                                  handleFieldChange(
                                    row._id,
                                    "remarksTechApproval",
                                    e.target.value
                                  )
                                }
                              />
                            </td>

                            <td className="px-4 py-2 border-b bg-gray-100 cursor-not-allowed">
                              {row.plannedCommercialNegotiation
                                ? new Date(row.plannedCommercialNegotiation)
                                    .toLocaleDateString("en-GB")
                                    .replace(/\//g, "-")
                                : ""}
                            </td>

                            <td className="px-4 py-2 border-b">
                              <input
                                type="date"
                                className="border p-1 rounded"
                                value={row.actualCommercialNegotiation ?? ""}
                                onChange={(e) =>
                                  handleFieldChange(
                                    row._id,
                                    "actualCommercialNegotiation",
                                    e.target.value
                                  )
                                }
                              />
                            </td>

                            <td className="px-4 py-2 border-b">
                              <select
                                className="border p-1 rounded"
                                value={row.finalizeTermsStatus ?? ""}
                                onChange={(e) =>
                                  handleFieldChange(
                                    row._id,
                                    "finalizeTermsStatus",
                                    e.target.value
                                  )
                                }
                              >
                                <option value="">--Select--</option>
                                <option value="Hold">Hold</option>
                                <option value="Cancelled">Cancelled</option>
                                <option value="Done">Done</option>
                              </select>
                            </td>

                            <td className="px-4 py-2 border-b bg-gray-100 cursor-not-allowed">
                              {row.timeDelayCommercialNegotiation}
                            </td>

                            <td className="px-4 py-2 border-b">
                              <select
                                className="border p-1 rounded"
                                value={row.getApproval ?? ""}
                                onChange={(e) =>
                                  handleFieldChange(
                                    row._id,
                                    "getApproval",
                                    e.target.value
                                  )
                                }
                              >
                                <option value="">--Select--</option>
                                <option value="Hold">Hold</option>
                                <option value="Cancelled">Cancelled</option>
                                <option value="Done">Done</option>
                              </select>
                            </td>

                            <td className="px-4 py-2 border-b">
                              <select
                                className="border p-1 rounded"
                                value={row.approverName2 ?? ""}
                                onChange={(e) =>
                                  handleFieldChange(
                                    row._id,
                                    "approverName2",
                                    e.target.value
                                  )
                                }
                              >
                                <option value="">--Select--</option>
                                <option value="Tapan Agarwala">
                                  Tapan Agarwala
                                </option>
                                <option value="Rohit Agarwala">
                                  Rohit Agarwala
                                </option>
                                <option value="Hiru Ghosh">Hiru Ghosh</option>
                                <option value="Arindam Saha">
                                  Arindam Saha
                                </option>
                              </select>
                            </td>

                            <td className="px-4 py-2 border-b">
                              <input
                                type="text"
                                className="border p-1 rounded"
                                value={row.remarksCommercialNegotiation ?? ""}
                                onChange={(e) =>
                                  handleFieldChange(
                                    row._id,
                                    "remarksCommercialNegotiation",
                                    e.target.value
                                  )
                                }
                              />
                            </td>

                            <td className="px-4 py-2 border-b bg-gray-100 cursor-not-allowed">
                              {row.plannedPoGeneration
                                ? new Date(row.plannedPoGeneration)
                                    .toLocaleDateString("en-GB")
                                    .replace(/\//g, "-")
                                : ""}
                            </td>

                            <td className="px-4 py-2 border-b">
                              <input
                                type="date"
                                className="border p-1 rounded"
                                value={row.actualPoGeneration ?? ""}
                                onChange={(e) =>
                                  handleFieldChange(
                                    row._id,
                                    "actualPoGeneration",
                                    e.target.value
                                  )
                                }
                              />
                            </td>

                            <td className="px-4 py-2 border-b">
                              <select
                                className="border p-1 rounded"
                                value={row.poGenerationStatus ?? ""}
                                onChange={(e) => {
                                  const value = e.target.value;
                                  handleFieldChange(
                                    row._id,
                                    "poGenerationStatus",
                                    value
                                  );

                                  if (value === "Done") {
                                    const today = new Date();
                                    const formattedDate = `${String(
                                      today.getDate()
                                    ).padStart(2, "0")}-${String(
                                      today.getMonth() + 1
                                    ).padStart(2, "0")}-${today.getFullYear()}`;

                                    handleFieldChange(
                                      row._id,
                                      "poDate",
                                      formattedDate
                                    );
                                  } else {
                                    handleFieldChange(row._id, "poDate", "");
                                  }
                                }}
                              >
                                <option value="">--Select--</option>
                                <option value="Hold">Hold</option>
                                <option value="Cancelled">Cancelled</option>
                                <option value="Done">Done</option>
                              </select>
                            </td>

                            <td className="px-4 py-2 border-b bg-gray-100 cursor-not-allowed">
                              {row.timeDelayPoGeneration}
                            </td>

                            <td className="px-4 py-2 border-b">
                              <input
                                type="date"
                                className="border p-1 rounded"
                                value={row.poDate ?? ""}
                                onChange={(e) =>
                                  handleFieldChange(
                                    row._id,
                                    "poDate",
                                    e.target.value
                                  )
                                }
                              />
                            </td>

                            <td className="px-4 py-2 border-b">
                              <input
                                type="text"
                                className="border p-1 rounded"
                                value={row.poNumber ?? ""}
                                onChange={(e) =>
                                  handleFieldChange(
                                    row._id,
                                    "poNumber",
                                    e.target.value
                                  )
                                }
                              />
                            </td>

                            <td className="px-4 py-2 border-b">
                              <input
                                type="text"
                                className="border p-1 rounded"
                                value={row.vendorName ?? ""}
                                onChange={(e) =>
                                  handleFieldChange(
                                    row._id,
                                    "vendorName",
                                    e.target.value
                                  )
                                }
                              />
                            </td>

                            <td className="px-4 py-2 border-b">
                              <input
                                type="number"
                                className="border p-1 rounded"
                                value={row.leadDays ?? ""}
                                onChange={(e) =>
                                  handleFieldChange(
                                    row._id,
                                    "leadDays",
                                    e.target.value
                                  )
                                }
                              />
                            </td>

                            <td className="px-4 py-2 border-b">
                              <input
                                type="number"
                                className="border p-1 rounded"
                                value={row.amount ?? ""}
                                onChange={(e) =>
                                  handleFieldChange(
                                    row._id,
                                    "amount",
                                    e.target.value
                                  )
                                }
                              />
                            </td>

                            <td className="px-4 py-2 border-b">
                              <select
                                className="border p-1 rounded"
                                value={row.paymentCondition ?? ""}
                                onChange={(e) =>
                                  handleFieldChange(
                                    row._id,
                                    "paymentCondition",
                                    e.target.value
                                  )
                                }
                              >
                                <option value="">--Select--</option>
                                <option value="After Received">
                                  After Received
                                </option>
                                <option value="Before Dispatch">
                                  Before Dispatch
                                </option>
                                <option value="PWP BBD">PWP BBD</option>
                                <option value="PWP BBD FAR">PWP BBD FAR</option>
                                <option value="PWP BBD PAPW">
                                  PWP BBD PAPW
                                </option>
                              </select>
                            </td>

                            <td className="px-4 py-2 border-b">
                              <input
                                type="text"
                                className="border p-1 rounded"
                                value={row.remarksPoGeneration ?? ""}
                                onChange={(e) =>
                                  handleFieldChange(
                                    row._id,
                                    "remarksPoGeneration",
                                    e.target.value
                                  )
                                }
                              />
                            </td>
                          </>
                        )}

                        {/* Indent Verification */}
                        {selectedOption === "Indent Verification" && 
                          row.dbDoerName === "" && (
                          <>
                            <td className="px-4 py-2 border-b">
                              <input
                                type="text"
                                className="border p-1 rounded"
                                value={row.remarksIndentVerification ?? ""}
                                onChange={(e) =>
                                  handleFieldChange(
                                    row._id,
                                    "remarksIndentVerification",
                                    e.target.value
                                  )
                                }
                              />
                            </td>
                          </>
                        )}

                        {/* GET QUOTATION */}
                        {selectedOption === "Get Quotation" &&
                          row.doerName !== "" &&
                          (
                            row.dbDoerStatus !== "Done" ||
                            row.dbComparisonStatementStatus !== "Done"
                          ) && (
                          <>
                            <td className="px-4 py-2 border-b bg-gray-100 cursor-not-allowed">
                              {row.plannedGetQuotation
                                ? new Date(row.plannedGetQuotation)
                                    .toLocaleDateString("en-GB")
                                    .replace(/\//g, "-")
                                : ""}
                            </td>
                            
                            <td className="px-4 py-2 border-b bg-gray-100 cursor-not-allowed">
                              {row.actualGetQuotation
                                ? new Date(row.actualGetQuotation)
                                    .toLocaleDateString("en-GB")
                                    .replace(/\//g, "-")
                                : ""}
                            </td>

                            <td className="px-4 py-2 border-b">
                              <select
                                className="border p-1 rounded"
                                value={row.quotationStatus ?? ""}
                                onChange={(e) =>
                                  handleFieldChange(
                                    row._id,
                                    "quotationStatus",
                                    e.target.value
                                  )
                                }
                              >
                                <option value="">--Select--</option>
                                <option value="Inquiry Send">
                                  Inquiry Send
                                </option>
                                <option value="Hold">Hold</option>
                              </select>
                            </td>

                            <td className="px-4 py-2 border-b">
                              <select
                                className="border p-1 rounded"
                                value={row.doerStatus ?? ""}
                                onChange={(e) =>
                                  handleFieldChange(
                                    row._id,
                                    "doerStatus",
                                    e.target.value
                                  )
                                }
                              >
                                <option value="">--Select--</option>
                                <option value="Done">Done</option>
                                <option value="Hold">Hold</option>
                                <option value="Cancelled">Cancelled</option>
                              </select>
                            </td>

                            <td className="px-4 py-2 border-b bg-gray-100 cursor-not-allowed">
                              {row.timeDelayGetQuotation}
                            </td>

                            <td className="px-4 py-2 border-b">
                              <input
                                type="text"
                                className="border p-1 rounded"
                                value={row.remarksGetQuotation ?? ""}
                                onChange={(e) =>
                                  handleFieldChange(
                                    row._id,
                                    "remarksGetQuotation",
                                    e.target.value
                                  )
                                }
                              />
                            </td>
                          </>
                        )}

                        {/* TECHNICAL APPROVAL */}
                        {selectedOption === "Technical Approval" &&
                          row.dbDoerStatus === "Done" &&
                          row.dbComparisonStatementStatus === "Done" &&
                          row.dbTechnicalApprovalStatus !== "Done" && (
                          <>
                            <td className="px-4 py-2 border-b bg-gray-100 cursor-not-allowed">
                              {row.plannedTechApproval}
                            </td>
                            
                            <td className="px-4 py-2 border-b bg-gray-100 cursor-not-allowed">
                              {row.actualTechApproval
                                ? new Date(row.actualTechApproval)
                                    .toLocaleDateString("en-GB")
                                    .replace(/\//g, "-")
                                : ""}
                            </td>

                            <td className="px-4 py-2 border-b">
                              <select
                                className="border p-1 rounded"
                                value={row.technicalApprovalStatus ?? ""}
                                onChange={(e) =>
                                  handleFieldChange(
                                    row._id,
                                    "technicalApprovalStatus",
                                    e.target.value
                                  )
                                }
                              >
                                <option value="">--Select--</option>
                                <option value="Hold">Hold</option>
                                <option value="Cancelled">Cancelled</option>
                                <option value="Done">Done</option>
                                <option value="Reopen">Reopen</option>
                              </select>
                            </td>

                            <td className="px-4 py-2 border-b bg-gray-100 cursor-not-allowed">
                              {row.timeDelayTechApproval}
                            </td>

                            <td className="px-4 py-2 border-b">
                              <input
                                type="text"
                                className="border p-1 rounded"
                                value={row.approverName ?? ""}
                                onChange={(e) =>
                                  handleFieldChange(
                                    row._id,
                                    "approverName",
                                    e.target.value
                                  )
                                }
                              />
                            </td>

                            <td className="px-4 py-2 border-b">
                              <input
                                type="text"
                                className="border p-1 rounded"
                                value={row.remarksTechApproval ?? ""}
                                onChange={(e) =>
                                  handleFieldChange(
                                    row._id,
                                    "remarksTechApproval",
                                    e.target.value
                                  )
                                }
                              />
                            </td>
                          </>
                        )}

                        {/* COMMERCIAL NEGOTIATION */}
                        {selectedOption === "Commercial Negotiation" &&
                          row.technicalApprovalStatus === "Done" &&
                        (
                          row.dbFinalizeTermsStatus !== "Done" ||
                          row.dbGetApproval !== "Done"
                        ) && (
                            <>
                              <td className="px-4 py-2 border-b bg-gray-100 cursor-not-allowed">
                                {row.plannedCommercialNegotiation
                                  ? new Date(row.plannedCommercialNegotiation)
                                      .toLocaleDateString("en-GB")
                                      .replace(/\//g, "-")
                                  : ""}
                              </td>

                              <td className="px-4 py-2 border-b bg-gray-100 cursor-not-allowed">
                                {row.actualCommercialNegotiation
                                  ? new Date(row.actualCommercialNegotiation)
                                      .toLocaleDateString("en-GB")
                                      .replace(/\//g, "-")
                                  : ""}
                              </td>

                              <td className="px-4 py-2 border-b">
                                <select
                                  className="border p-1 rounded"
                                  value={row.finalizeTermsStatus ?? ""}
                                  onChange={(e) =>
                                    handleFieldChange(row._id, "finalizeTermsStatus", e.target.value)
                                  }
                                >
                                  <option value="">--Select--</option>
                                  <option value="Hold">Hold</option>
                                  <option value="Cancelled">Cancelled</option>
                                  <option value="Done">Done</option>
                                </select>
                              </td>

                              <td className="px-4 py-2 border-b bg-gray-100 cursor-not-allowed">
                                {row.timeDelayCommercialNegotiation}
                              </td>

                              <td className="px-4 py-2 border-b">
                                <select
                                  className="border p-1 rounded"
                                  value={row.getApproval ?? ""}
                                  onChange={(e) =>
                                    handleFieldChange(row._id, "getApproval", e.target.value)
                                  }
                                >
                                  <option value="">--Select--</option>
                                  <option value="Hold">Hold</option>
                                  <option value="Cancelled">Cancelled</option>
                                  <option value="Done">Done</option>
                                </select>
                              </td>

                              <td className="px-4 py-2 border-b">
                                <select
                                  className="border p-1 rounded"
                                  value={row.approverName2 ?? ""}
                                  onChange={(e) =>
                                    handleFieldChange(row._id, "approverName2", e.target.value)
                                  }
                                >
                                  <option value="">--Select--</option>
                                  <option value="Tapan Agarwala">Tapan Agarwala</option>
                                  <option value="Rohit Agarwala">Rohit Agarwala</option>
                                  <option value="Hiru Ghosh">Hiru Ghosh</option>
                                  <option value="Arindam Saha">Arindam Saha</option>
                                </select>
                              </td>

                              <td className="px-4 py-2 border-b">
                                <input
                                  type="text"
                                  className="border p-1 rounded"
                                  value={row.remarksCommercialNegotiation ?? ""}
                                  onChange={(e) =>
                                    handleFieldChange(
                                      row._id,
                                      "remarksCommercialNegotiation",
                                      e.target.value
                                    )
                                  }
                                />
                              </td>
                            </>
                        )}

                        {/* LOCAL PURCHASE */}
                        {selectedOption === "Local Purchase" && (
                          <>
                            <td className="px-4 py-2 border-b">
                              <input
                                type="date"
                                className="border p-1 rounded"
                                value={row.poDate ?? ""}
                                onChange={(e) =>
                                  handleFieldChange(
                                    row._id,
                                    "poDate",
                                    e.target.value
                                  )
                                }
                              />
                            </td>

                            <td className="px-4 py-2 border-b">
                              <input
                                type="text"
                                className="border p-1 rounded"
                                value={row.vendorName ?? ""}
                                onChange={(e) =>
                                  handleFieldChange(
                                    row._id,
                                    "vendorName",
                                    e.target.value
                                  )
                                }
                              />
                            </td>

                            <td className="px-4 py-2 border-b">
                              <input
                                type="number"
                                className="border p-1 rounded"
                                value={row.amount ?? ""}
                                onChange={(e) =>
                                  handleFieldChange(
                                    row._id,
                                    "amount",
                                    e.target.value
                                  )
                                }
                              />
                            </td>

                            <td className="px-4 py-2 border-b">
                              <input
                                type="text"
                                className="border p-1 rounded"
                                value={row.remarks ?? ""}
                                onChange={(e) =>
                                  handleFieldChange(
                                    row._id,
                                    "remarks",
                                    e.target.value
                                  )
                                }
                              />
                            </td>
                          </>
                        )}

                        {/* PO GENERATION */}
                        {selectedOption === "PO Generation" && 
                          row.finalizeTermsStatus === "Done" &&
                          row.getApproval === "Done" &&
                          row.dbPoGenerationStatus !== "Done" && (
                          <>
                            <td className="px-4 py-2 border-b bg-gray-100 cursor-not-allowed">
                              {row.plannedPoGeneration
                                ? new Date(row.plannedPoGeneration)
                                    .toLocaleDateString("en-GB")
                                    .replace(/\//g, "-")
                                : ""}
                            </td>
                            
                            <td className="px-4 py-2 border-b bg-gray-100 cursor-not-allowed">
                              {row.actualPoGeneration
                                ? new Date(row.actualPoGeneration)
                                    .toLocaleDateString("en-GB")
                                    .replace(/\//g, "-")
                                : ""}
                            </td>

                            
                            <td className="px-4 py-2 border-b">
                              <select
                                className="border p-1 rounded"
                                value={row.poGenerationStatus ?? ""}
                                // onChange={(e) => {
                                //   const value = e.target.value;
                                //   handleFieldChange(row._id, "poGenerationStatus", value);

                                //   if (value === "Done") {
                                //     const today = new Date();
                                //     const formattedDate = `${String(today.getDate()).padStart(
                                //       2,
                                //       "0"
                                //     )}-${String(today.getMonth() + 1).padStart(2, "0")}-${today.getFullYear()}`;

                                //     handleFieldChange(row._id, "poDate", formattedDate);
                                //   } else {
                                //     handleFieldChange(row._id, "poDate", "");
                                //   }
                                // }}
                                onChange={(e) =>
                                  handleFieldChange(row._id, "poGenerationStatus", e.target.value)
                                }
                              >
                                <option value="">--Select--</option>
                                <option value="Hold">Hold</option>
                                <option value="Cancelled">Cancelled</option>
                                <option value="Done">Done</option>
                              </select>
                            </td>

                            <td className="px-4 py-2 border-b bg-gray-100 cursor-not-allowed">
                              {row.timeDelayPoGeneration}
                            </td>

                            <td className="px-4 py-2 border-b">
                              <input
                                type="date"
                                className="border p-1 rounded"
                                value={row.poDate ?? ""}
                                onChange={(e) =>
                                  handleFieldChange(
                                    row._id,
                                    "poDate",
                                    e.target.value
                                  )
                                }
                              />
                            </td>

                            <td className="px-4 py-2 border-b">
                              <input
                                type="text"
                                className="border p-1 rounded"
                                value={row.poNumber ?? ""}
                                onChange={(e) =>
                                  handleFieldChange(
                                    row._id,
                                    "poNumber",
                                    e.target.value
                                  )
                                }
                              />
                            </td>

                            <td className="px-4 py-2 border-b">
                              <input
                                type="text"
                                className="border p-1 rounded"
                                value={row.vendorName ?? ""}
                                onChange={(e) =>
                                  handleFieldChange(
                                    row._id,
                                    "vendorName",
                                    e.target.value
                                  )
                                }
                              />
                            </td>

                            <td className="px-4 py-2 border-b">
                              <input
                                type="number"
                                className="border p-1 rounded"
                                value={row.leadDays ?? ""}
                                onChange={(e) =>
                                  handleFieldChange(
                                    row._id,
                                    "leadDays",
                                    e.target.value
                                  )
                                }
                              />
                            </td>

                            <td className="px-4 py-2 border-b">
                              <input
                                type="number"
                                className="border p-1 rounded"
                                value={row.amount ?? ""}
                                onChange={(e) =>
                                  handleFieldChange(
                                    row._id,
                                    "amount",
                                    e.target.value
                                  )
                                }
                              />
                            </td>

                            <td className="px-4 py-2 border-b">
                              <select
                                className="border p-1 rounded"
                                value={row.paymentCondition ?? ""}
                                onChange={(e) =>
                                  handleFieldChange(
                                    row._id,
                                    "paymentCondition",
                                    e.target.value
                                  )
                                }
                              >
                                <option value="">--Select--</option>
                                <option value="After Received">
                                  After Received
                                </option>
                                <option value="Before Dispatch">
                                  Before Dispatch
                                </option>
                                <option value="PWP BBD">PWP BBD</option>
                                <option value="PWP BBD FAR">PWP BBD FAR</option>
                                <option value="PWP BBD PAPW">
                                  PWP BBD PAPW
                                </option>
                              </select>
                            </td>

                            <td className="px-4 py-2 border-b">
                              <input
                                type="text"
                                className="border p-1 rounded"
                                value={row.remarksPoGeneration ?? ""}
                                onChange={(e) =>
                                  handleFieldChange(
                                    row._id,
                                    "remarksPoGeneration",
                                    e.target.value
                                  )
                                }
                              />
                            </td>
                          </>
                        )}

                        {/* PC Follow Up */}
                        {((selectedOption === "PC Follow Up" && pcIndex) ||
                          (selectedOption === "Payment Follow Up" &&
                            paymentKey)) && (
                          <>
                            {/* Common fields */}
                            <td className="px-4 py-2 border-b bg-gray-100 cursor-not-allowed">
                              {row.poDate
                                ? new Date(row.poDate)
                                    .toLocaleDateString("en-GB")
                                    .replace(/\//g, "-")
                                : ""}
                            </td>
                            <td className="px-4 py-2 border-b">
                              {row.poNumber}
                            </td>
                            <td className="px-4 py-2 border-b">
                              {row.vendorName}
                            </td>
                            <td className="px-4 py-2 border-b">
                              {row.leadDays}
                            </td>
                            <td className="px-4 py-2 border-b">
                              {row.paymentCondition}
                            </td>

                            {/* Transaction Number (Payment Follow Up only) */}
                            {selectedOption === "Payment Follow Up" && (
                              <td className="px-4 py-2 border-b">
                                <input
                                  type="text"
                                  className="border p-1 rounded"
                                  value={
                                    row[`transactionNoPayment${paymentKey}`] ??
                                    ""
                                  }
                                  onChange={(e) =>
                                    handleFieldChange(
                                      row._id,
                                      `transactionNoPayment${paymentKey}`,
                                      e.target.value
                                    )
                                  }
                                />
                              </td>
                            )}

                            {/* Planned */}
                            <td className="px-4 py-2 border-b bg-gray-100 cursor-not-allowed">
                              {(
                                selectedOption === "PC Follow Up"
                                  ? row[`plannedPCFollowUp${pcIndex}`]
                                  : row[`plannedPayment${paymentKey}`]
                              )
                                ? new Date(
                                    selectedOption === "PC Follow Up"
                                      ? row[`plannedPCFollowUp${pcIndex}`]
                                      : row[`plannedPayment${paymentKey}`]
                                  )
                                    .toLocaleDateString("en-GB")
                                    .replace(/\//g, "-")
                                : ""}
                            </td>

                            {/* Actual */}
                            <td className="px-4 py-2 border-b">
                              <input
                                type="date"
                                className="border p-1 rounded"
                                value={
                                  selectedOption === "PC Follow Up"
                                    ? row[`actualPCFollowUp${pcIndex}`] ?? ""
                                    : row[`actualPayment${paymentKey}`] ?? ""
                                }
                                onChange={(e) =>
                                  handleFieldChange(
                                    row._id,
                                    selectedOption === "PC Follow Up"
                                      ? `actualPCFollowUp${pcIndex}`
                                      : `actualPayment${paymentKey}`,
                                    e.target.value
                                  )
                                }
                              />
                            </td>

                            {/* Status */}
                            <td className="px-4 py-2 border-b">
                              <select
                                className="border p-1 rounded"
                                value={
                                  selectedOption === "PC Follow Up"
                                    ? row[`statusPCFollowUp${pcIndex}`] ?? ""
                                    : row[`statusPayment${paymentKey}`] ?? ""
                                }
                                onChange={(e) =>
                                  handleFieldChange(
                                    row._id,
                                    selectedOption === "PC Follow Up"
                                      ? `statusPCFollowUp${pcIndex}`
                                      : `statusPayment${paymentKey}`,
                                    e.target.value
                                  )
                                }
                              >
                                <option value="">--Select--</option>
                                <option value="Hold">Hold</option>
                                <option value="Cancelled">Cancelled</option>
                                <option value="Done">Done</option>
                                <option value="Pending">Pending</option>
                              </select>
                            </td>

                            {/* Time Delay */}
                            <td className="px-4 py-2 border-b">
                              {selectedOption === "PC Follow Up"
                                ? row[`timeDelayPCFollowUp${pcIndex}`]
                                : row[`timeDelayPayment${paymentKey}`]}
                            </td>

                            {/* Remarks */}
                            <td className="px-4 py-2 border-b">
                              <input
                                type="text"
                                className="border p-1 rounded"
                                value={
                                  selectedOption === "PC Follow Up"
                                    ? row[`remarksPCFollowUp${pcIndex}`] ?? ""
                                    : row[`remarksPayment${paymentKey}`] ?? ""
                                }
                                onChange={(e) =>
                                  handleFieldChange(
                                    row._id,
                                    selectedOption === "PC Follow Up"
                                      ? `remarksPCFollowUp${pcIndex}`
                                      : `remarksPayment${paymentKey}`,
                                    e.target.value
                                  )
                                }
                              />
                            </td>
                          </>
                        )}

                        {/* MATERIAL RECEIVED */}
                        {selectedOption === "Material Received" && (
                          <td className="px-4 py-2 border-b">
                            <select
                              className="border p-1 rounded"
                              value={row.grnToStore ?? ""}
                              onChange={(e) =>
                                handleFieldChange(
                                  row._id,
                                  "grnToStore",
                                  e.target.value
                                )
                              }
                            >
                              <option value="">--Select--</option>
                              <option value="Pending">Pending</option>
                              <option value="Received">Received</option>
                            </select>
                          </td>
                        )}
                      </tr>
                    )}
                  </>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* ------- RIGHT ALIGNED SUBMIT BUTTON ------- */}
        <div className="fixed bottom-6 right-6 z-50">
          <button
            onClick={handleSubmitUpdates}
            disabled={saving}
            className={`px-6 py-3 text-lg rounded-xl shadow-lg transition save-btn ${
              saving
                ? "bg-gray-400 text-gray-700 cursor-not-allowed"
                : "bg-green-600 text-white hover:bg-green-700"
            }`}
          >
            {saving ? "SAVING..." : "SUBMIT UPDATES"}
          </button>
        </div>
      </main>
    </div>
  );
}
