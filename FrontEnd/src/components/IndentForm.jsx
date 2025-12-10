import React, { useState, useEffect } from "react";
import { FaShoppingCart } from "react-icons/fa";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
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

  // ==============================
  // ⭐ Fetch Latest Unique ID
  // ==============================
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
    link.href = "https://fonts.googleapis.com/css2?family=Agu+Display&display=swap";
    link.rel = "stylesheet";
    document.head.appendChild(link);
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await createIndentForm(formData);
      alert("Indent Form Submitted Successfully!");
      console.log("Server Response:", response);

      // Reset the form except uniqueId (fetch new one)
      const newId = await getLatestUniqueId();

      setFormData((prev) => ({
        site: "",
        section: "",
        uniqueId: newId.success ? newId.uniqueId.toString() : "",
        indentNumber: "",
        itemNumber: "",
        itemDescription: "",
        uom: "",
        totalQuantity: "",
        submittedBy: "",
      }));
    } catch (error) {
      console.error("Error submitting form:", error);
      alert("Failed to submit form.");
    }
  };

  const handleCancel = () => {
    setFormData((prev) => ({
      ...prev,
      site: "",
      section: "",
      indentNumber: "",
      itemNumber: "",
      itemDescription: "",
      uom: "",
      totalQuantity: "",
      submittedBy: "",
    }));
  };

  const handleLogout = () => {
    localStorage.removeItem("role");
    navigate("/", { replace: true });
    window.location.reload();
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
          className="px-5 py-2 bg-red-600 text-white font-medium rounded-full shadow-md 
          hover:bg-red-700 active:scale-95 transition"
        >
          Logout
        </button>
      </nav>

      {/* Form */}
      <div className="flex justify-center items-start p-10 mt-[-60px]">
        <motion.form
          onSubmit={handleSubmit}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="p-10 rounded-3xl w-full max-w-4xl bg-transparent"
          style={{ fontFamily: "Poppins, sans-serif" }}
        >
          <div className="w-full rounded-xl mb-10 p-4 text-center bg-red-600 shadow-md">
            <h2 className="text-3xl font-bold text-white">Indent Creation Form</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Unique ID (Auto-loaded + READ ONLY) */}
            <div>
              <label className="block font-medium text-gray-700 mb-1">
                Unique ID <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                name="uniqueId"
                required
                value={formData.uniqueId}
                readOnly
                className="w-full p-3 bg-[#DFDDDD] rounded-xl outline-none border border-transparent focus:border-none cursor-not-allowed"
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
                className="w-full p-3 bg-[#DFDDDD] rounded-xl outline-none border border-transparent focus:border-red-500 focus:ring-1 focus:ring-red-400 transition"
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
                className="w-full p-3 bg-[#DFDDDD] rounded-xl outline-none border border-transparent focus:border-red-500 focus:ring-1 focus:ring-red-400 transition"
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
                <option value="RSIPL-PROJECT-R">RSIPL-PROJECT-R</option>
                <option value="RSIPL-PROJECT-S">RSIPL-PROJECT-S</option>
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
                className="w-full p-3 bg-[#DFDDDD] rounded-xl outline-none border border-transparent focus:border-red-500 focus:ring-1 focus:ring-red-400 transition"
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
                className="w-full p-3 bg-[#DFDDDD] rounded-xl outline-none border border-transparent focus:border-red-500 focus:ring-1 focus:ring-red-400 transition"
              />
            </div>

            <div>
              <label className="block font-medium mb-1 text-gray-700">
                UOM <span className="text-red-600">*</span>
              </label>
              <select
                name="uom"
                required
                value={formData.uom}
                onChange={handleChange}
                className="w-full p-3 bg-[#DFDDDD] rounded-xl outline-none border border-transparent focus:border-red-500 focus:ring-1 focus:ring-red-400 transition"
              >
                <option value="">Select UOM</option>
                <option value="DRUM">DRUM</option>
                <option value="NOS">NOS</option>
                <option value="KG">KG</option>
                <option value="PCS">PCS</option>
                <option value="JAR">JAR</option>
                <option value="MTR">MTR</option>
                <option value="BAGS">BAGS</option>
                <option value="LTR">LTR</option>
                <option value="SET">SET</option>
                <option value="BARREL">BARREL</option>
                <option value="BELT">BELT</option>
                <option value="RING">RING</option>
                <option value="GM">GM</option>
                <option value="BOX">BOX</option>
                <option value="FT">FT</option>
                <option value="ROLL">ROLL</option>
                <option value="ML">ML</option>
                <option value="SQ">SQ</option>
                <option value="CASE">CASE</option>
                <option value="TON">TON</option>
                <option value="PKT">PKT</option>
                <option value="BOTTLE">BOTTLE</option>
                <option value="PAIR">PAIR</option>
                <option value="COIL">COIL</option>
                <option value="CARTON">CARTON</option>
                <option value="STRIPS">STRIPS</option>
                <option value="CAN">CAN</option>
                <option value="PATI">PATI</option>
                <option value="BUNDLE">BUNDLE</option>
                <option value="BORA">BORA</option>
                <option value="FILE">FILE</option>
                <option value="AMPULES">AMPULES</option>
                <option value="BLOCK">BLOCK</option>
                <option value="CAPSULE">CAPSULE</option>
                <option value="REAM">REAM</option>
                <option value="CHAIN">CHAIN</option>
                <option value="PACK">PACK</option>
                <option value="SQM">SQM</option>
                <option value="M2">M2</option>
                <option value="CFT">CFT</option>
                <option value="SQ FT">SQ FT</option>
                <option value="EACH">EACH</option>
                <option value="CAR">CAR</option>
                <option value="LENGTH">LENGTH</option>
                <option value="DISTA">DISTA</option>
                <option value="PVC">PVC</option>
                <option value="DUMPER">DUMPER</option>
                <option value="UNIT">UNIT</option>
                <option value="SET EACH">SET EACH</option>
                <option value="ROLL/KG">ROLL/KG</option>
                <option value="MT">MT</option>
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
              className="w-full p-3 bg-[#DFDDDD] rounded-xl outline-none border border-transparent focus:border-red-500 focus:ring-1 focus:ring-red-400 transition"
            />
          </div>

          {/* Row 3 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">

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
                className="w-full p-3 bg-[#DFDDDD] rounded-xl outline-none border border-transparent focus:border-red-500 focus:ring-1 focus:ring-red-400 transition"
              />
            </div>

            <div>
              <label className="block font-medium mb-1 text-gray-700">
                Submitted By <span className="text-red-600">*</span>
              </label>
              <select
                name="submittedBy"
                required
                value={formData.submittedBy}
                onChange={handleChange}
                className="w-full p-3 bg-[#DFDDDD] rounded-xl outline-none border border-transparent focus:border-red-500 focus:ring-1 focus:ring-red-400 transition"
              >
                <option value="">Select Name</option>
                <option value="Proloy Ghosh">Proloy Ghosh</option>
                <option value="Sayanta Chakraborty">Sayanta Chakraborty</option>
                <option value="Arpita Ghosh">Arpita Ghosh</option>
                <option value="Jui Baidya">Jui Baidya</option>
                <option value="Amit Poddar">Amit Poddar</option>
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