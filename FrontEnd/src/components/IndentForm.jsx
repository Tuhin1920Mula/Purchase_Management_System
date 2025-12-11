import React, { useState, useEffect } from "react";
import { FaShoppingCart } from "react-icons/fa";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import * as XLSX from "xlsx"; // Vite-friendly
import { createIndentForm, getLatestUniqueId } from "../api/IndentForm.api";

export default function IndentCreationForm() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    site: "",
    section: "",
    uniqueId: "",
    indentNumber: "",
    itemNumber: "",
    itemDescription: "",
    uom: "",
    totalQuantity: "",
    submittedBy: "",
  });

  const [bulkData, setBulkData] = useState([]);
  const [showBulkUpload, setShowBulkUpload] = useState(false);
  const [bulkSubmittedBy, setBulkSubmittedBy] = useState("User");

  // ===========================
  // Fetch Latest Unique ID
  // ===========================
  useEffect(() => {
    async function fetchUniqueId() {
      try {
        const res = await getLatestUniqueId();
        if (res?.success) {
          setFormData((prev) => ({
            ...prev,
            uniqueId: res.uniqueId.toString(),
          }));
        }
      } catch (error) {
        console.error("Error fetching unique ID:", error);
      }
    }
    fetchUniqueId();
  }, []);

  // Agu Font Loader
  useEffect(() => {
    const link = document.createElement("link");
    link.href =
      "https://fonts.googleapis.com/css2?family=Agu+Display&display=swap";
    link.rel = "stylesheet";
    document.head.appendChild(link);
  }, []);

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const totalQty = Number(formData.totalQuantity);
      if (isNaN(totalQty)) throw new Error("Total Quantity must be a number");

      await createIndentForm({ ...formData, totalQuantity: totalQty });
      alert("Indent Form Submitted Successfully!");
      const newId = await getLatestUniqueId();
      setFormData({
        site: "",
        section: "",
        uniqueId: newId.success ? newId.uniqueId.toString() : "",
        indentNumber: "",
        itemNumber: "",
        itemDescription: "",
        uom: "",
        totalQuantity: "",
        submittedBy: "",
      });
    } catch (error) {
      console.error(error);
      alert("Failed to submit form: " + error.message);
    }
  };

  const handleCancel = () => {
    setFormData({
      site: "",
      section: "",
      uniqueId: formData.uniqueId,
      indentNumber: "",
      itemNumber: "",
      itemDescription: "",
      uom: "",
      totalQuantity: "",
      submittedBy: "",
    });
  };

  const handleLogout = () => {
    localStorage.removeItem("role");
    navigate("/", { replace: true });
    window.location.reload();
  };

  // ================= Bulk Upload Handlers =================
  const handleBulkUpload = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = (evt) => {
      const bstr = evt.target.result;
      const wb = XLSX.read(bstr, { type: "binary" });
      const wsname = wb.SheetNames[0];
      const ws = wb.Sheets[wsname];
      const data = XLSX.utils.sheet_to_json(ws);

      const updatedData = data.map((row) => ({
        ...row,
        submittedBy: "",
      }));

      setBulkData(data);
    };
    reader.readAsBinaryString(file);
  };

  const handleBulkSave = async () => {
    if (!bulkData.length) return alert("No data to save!");

    try {
      for (let i = 0; i < bulkData.length; i++) {
        const row = bulkData[i];
        const totalQty = Number(row["Total Quantity"]);
        if (isNaN(totalQty)) {
          return alert(`Invalid Total Quantity at row ${i + 2}`);
        }
        const idRes = await getLatestUniqueId();
        const uniqueId = idRes.success ? idRes.uniqueId.toString() : "";

        await createIndentForm({
          uniqueId,
          site: row["Site"] || "",
          section: row["Section"] || "",
          indentNumber: row["Indent Number"] || "",
          itemNumber: row["Item Number"] || "",
          itemDescription: row["Item Description"] || "",
          uom: row["UOM"] || "",
          totalQuantity: totalQty,
          submittedBy: row.submittedBy ||  "User",
        });
      }
      alert("Bulk data saved successfully!");
      setBulkData([]);
      setShowBulkUpload(false);
    } catch (error) {
      console.error(error);
      alert("Failed to save bulk data.");
    }
  };

  // ================= Excel Template =================
  const handleCreateTemplate = async () => {
    const latest = await getLatestUniqueId();
    const uniqueId = latest.success ? latest.uniqueId.toString() : "";

    const wsData = [
      [
        "Site",
        "Section",
        "Indent Number",
        "Item Number",
        "UOM",
        "Item Description",
        "Total Quantity",
      ],
      ["", "", "", "", "", "", ""],
    ];

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(wsData);
    XLSX.utils.book_append_sheet(wb, ws, "Template");
    XLSX.writeFile(wb, "Indent_Form_Template.xlsx");
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navbar */}
      <nav className="w-full py-6 px-10 flex justify-between items-center bg-transparent mt-4">
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
      </nav>

      {/* Excel Template Button */}
      <div className="flex flex-row items-center justify-end p-6 mt-6 gap-6">
        <button
          onClick={handleCreateTemplate}
          className="px-6 py-3 rounded-full bg-blue-600 text-white hover:bg-blue-700 transition"
        >
          Create Excel Template
        </button>

        {/* Bulk Upload Toggle */}
        <button
          onClick={() => setShowBulkUpload(!showBulkUpload)}
          className="px-6 py-3 rounded-full bg-purple-600 text-white hover:bg-purple-700 transition"
        >
          {showBulkUpload ? "Hide Bulk Upload" : "Bulk Upload from Excel"}
        </button>

        {/* Bulk Upload Section */}
        {showBulkUpload && (
          <div className="bg-gray-200 p-6 rounded-xl mb-6 w-full max-w-6xl">
            <input
              type="file"
              accept=".xlsx, .xls"
              onChange={handleBulkUpload}
              className="bg-gray-200 p-6"
            />
            {bulkData.length > 0 && (
              <div className="overflow-x-auto mt-4">
                
                {/* For the Bulk assigen submitted by field . */}
                {/* <div className="mb-4">
                  <label className="block font-medium mb-1 text-gray-700">
                    Submitted By (for all bulk entries){" "}
                    <span className="text-red-600">*</span>
                  </label>
                  <select
                    value={bulkSubmittedBy}
                    onChange={(e) => setBulkSubmittedBy(e.target.value)}
                    className="p-3 bg-gray-200 rounded-xl"
                    required
                  >
                    <option value="">Select Name</option>
                    <option value="Proloy Ghosh">Proloy Ghosh</option>
                    <option value="Sayanta Chakraborty">
                      Sayanta Chakraborty
                    </option>
                    <option value="Arpita Ghosh">Arpita Ghosh</option>
                  </select>
                </div> */}

                <table className="table-auto w-full border-collapse border border-gray-300">
                  <thead>
                    <tr className="bg-gray-300">
                      {Object.keys(bulkData[0]).map((key) => (
                        <th
                          key={key}
                          className="border border-gray-400 px-2 py-1 text-left"
                        >
                          {key}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {bulkData.map((row, idx) => (
                      <tr key={idx}>
                        {Object.keys(row).map(
                          (key) =>
                            key !== "submittedBy" && (
                              <td key={key} className="border px-2 py-1">
                                {row[key]}
                              </td>
                            )
                        )}

                        {/* Per-row Submitted By dropdown */}
                        <td className="border px-2 py-1">
                          <select
                            value={row.submittedBy}
                            onChange={(e) => {
                              const updated = [...bulkData];
                              updated[idx].submittedBy = e.target.value;
                              setBulkData(updated);
                            }}
                            className="p-2 rounded bg-gray-200"
                          >
                            <option value="">Select</option>
                            <option value="Proloy Ghosh">Proloy Ghosh</option>
                            <option value="Sayanta Chakraborty">
                              Sayanta Chakraborty
                            </option>
                            <option value="Arpita Ghosh">Arpita Ghosh</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <button
                  onClick={handleBulkSave}
                  className="mt-4 px-6 py-3 rounded-full bg-green-600 text-white hover:bg-green-700 transition"
                >
                  Save All
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="flex flex-col justify-center items-center p-10 mt-[-60px] w-full gap-6">
        {/* Original Form */}
        <motion.form
          onSubmit={handleSubmit}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="p-10 rounded-3xl w-full max-w-4xl bg-transparent"
          style={{ fontFamily: "Poppins, sans-serif" }}
        >
          <div className="w-full rounded-xl mb-10 p-4 text-center bg-red-600 shadow-md">
            <h2 className="text-3xl font-bold text-white">
              Indent Creation Form
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Unique ID */}
            <div>
              <label className="block font-medium text-gray-700 mb-1">
                Unique ID <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                name="uniqueId"
                value={formData.uniqueId}
                readOnly
                className="w-full p-3 bg-[#DFDDDD] rounded-xl cursor-not-allowed"
              />
            </div>
            {/* Site */}
            <div>
              <label className="block font-medium mb-1 text-gray-700">
                Site <span className="text-red-600">*</span>
              </label>
              <select
                name="site"
                required
                value={formData.site}
                onChange={handleChange}
                className="w-full p-3 bg-[#DFDDDD] rounded-xl"
              >
                <option value="">Select Site</option>
                <option value="HIPL">HIPL</option>
                <option value="RSIPL">RSIPL</option>
                <option value="HRM">HRM</option>
                <option value="SUNAGROW">SUNAGROW</option>
                <option value="RICE FIELD">RICE FIELD</option>
              </select>
            </div>
            {/* Section */}
            <div>
              <label className="block font-medium mb-1 text-gray-700">
                Section <span className="text-red-600">*</span>
              </label>
              <select
                name="section"
                required
                value={formData.section}
                onChange={handleChange}
                className="w-full p-3 bg-[#DFDDDD] rounded-xl"
              >
                <option value="">Select Section</option>
                <option value="REFINERY">REFINERY</option>
                <option value="CENTRAL STORE">CENTRAL STORE</option>
                <option value="MEGA STORE">MEGA STORE</option>
                <option value="OILS STORE">OILS STORE</option>
                <option value="PP STORE">PP STORE</option>
                <option value="RSIPL">RSIPL</option>
                <option value="HRM">HRM</option>
                <option value="OILS LAB">OILS LAB</option>
              </select>
            </div>
            {/* Indent Number */}
            <div>
              <label className="block font-medium text-gray-700 mb-1">
                Indent Number <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                name="indentNumber"
                required
                value={formData.indentNumber}
                onChange={handleChange}
                className="w-full p-3 bg-[#DFDDDD] rounded-xl"
              />
            </div>
            {/* Item Number */}
            <div>
              <label className="block font-medium text-gray-700 mb-1">
                Item Number <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                name="itemNumber"
                required
                value={formData.itemNumber}
                onChange={handleChange}
                className="w-full p-3 bg-[#DFDDDD] rounded-xl"
              />
            </div>
            {/* UOM */}
            <div>
              <label className="block font-medium mb-1 text-gray-700">
                UOM <span className="text-red-600">*</span>
              </label>
              <select
                name="uom"
                required
                value={formData.uom}
                onChange={handleChange}
                className="w-full p-3 bg-[#DFDDDD] rounded-xl"
              >
                <option value="">Select UOM</option>
                <option value="DRUM">DRUM</option>
                <option value="NOS">NOS</option>
                <option value="KG">KG</option>
                <option value="PCS">PCS</option>
                <option value="LTR">LTR</option>
                <option value="SET">SET</option>
              </select>
            </div>
          </div>

          {/* Description */}
          <div className="mt-6">
            <label className="block font-medium text-gray-700 mb-1">
              Item Description <span className="text-red-600">*</span>
            </label>
            <textarea
              name="itemDescription"
              required
              value={formData.itemDescription}
              onChange={handleChange}
              rows={4}
              className="w-full p-3 bg-[#DFDDDD] rounded-xl"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            {/* Total Quantity */}
            <div>
              <label className="block font-medium text-gray-700 mb-1">
                Total Quantity <span className="text-red-600">*</span>
              </label>
              <input
                type="number"
                name="totalQuantity"
                required
                value={formData.totalQuantity}
                onChange={handleChange}
                className="w-full p-3 bg-[#DFDDDD] rounded-xl"
              />
            </div>
            {/* Submitted By */}
            <div>
              <label className="block font-medium mb-1 text-gray-700">
                Submitted By <span className="text-red-600">*</span>
              </label>
              <select
                name="submittedBy"
                required
                value={formData.submittedBy}
                onChange={handleChange}
                className="w-full p-3 bg-[#DFDDDD] rounded-xl"
              >
                <option value="">Select Name</option>
                <option value="Proloy Ghosh">Proloy Ghosh</option>
                <option value="Sayanta Chakraborty">Sayanta Chakraborty</option>
                <option value="Arpita Ghosh">Arpita Ghosh</option>
              </select>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-4 pt-8">
            <button
              type="button"
              onClick={handleCancel}
              className="px-6 py-3 rounded-full bg-red-600 text-white hover:bg-red-700 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-3 rounded-full bg-green-600 text-white hover:bg-green-700 transition"
            >
              Submit
            </button>
          </div>
        </motion.form>
      </div>
    </div>
  );
}
