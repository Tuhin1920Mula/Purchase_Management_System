// import React, { useState } from "react";

// export default function IndentCreationForm() {
//   const [formData, setFormData] = useState({
//     site: "",
//     uniqueId: "",
//     indentNumber: "",
//     itemNumber: "",
//     itemDescription: "",
//     uom: "",
//     totalQuantity: "",
//     submittedBy: "",
//   });

//   const handleChange = (e) => {
//     setFormData({ ...formData, [e.target.name]: e.target.value });
//   };

//   const handleSubmit = (e) => {
//     e.preventDefault();
//     alert("Form Submitted!" + JSON.stringify(formData, null, 2));
//   };

//   const handleCancel = () => {
//     setFormData({
//       site: "",
//       uniqueId: "",
//       indentNumber: "",
//       itemNumber: "",
//       itemDescription: "",
//       uom: "",
//       totalQuantity: "",
//       submittedBy: "",
//     });
//   };

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 to-purple-100 p-6">
//       <form
//         onSubmit={handleSubmit}
//         className="bg-white/80 backdrop-blur-xl p-10 rounded-3xl shadow-2xl w-full max-w-3xl space-y-8 border border-white/40"
//       >
//         <h2 className="text-3xl font-bold text-center bg-gradient-to-r from-blue-600 to-purple-600 text-transparent bg-clip-text drop-shadow-md">
//           Indent Creation Form
//         </h2>

//         {/* ---------- FORM FIELDS ---------- */}
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//           {/* Site */}
//           <div>
//             <label className="block font-semibold mb-1">
//               Site <span className="text-red-600">*</span>
//             </label>
//             <select
//               name="site"
//               required
//               value={formData.site}
//               onChange={handleChange}
//               className="w-full p-3 border rounded-xl shadow-sm focus:ring-2 focus:ring-purple-400 transition-all"
//             >
//               <option value="">Select Site</option>
//               <option value="HIPL">HIPL</option>
//               <option value="RSIPL">RSIPL</option>
//               <option value="HRM">HRM</option>
//               <option value="SUNAGROW">SUNAGROW</option>
//               <option value="RICE FIELD">RICE FIELD</option>
//             </select>
//           </div>

//           {/* Unique ID */}
//           <div>
//             <label className="block font-semibold mb-1">
//               Unique ID <span className="text-red-600">*</span>
//             </label>
//             <input
//               type="text"
//               name="uniqueId"
//               required
//               value={formData.uniqueId}
//               onChange={handleChange}
//               className="w-full p-3 border rounded-xl shadow-sm focus:ring-2 focus:ring-purple-400 transition-all"
//             />
//           </div>
//         </div>

//         {/* Row 2 */}
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//           <div>
//             <label className="block font-semibold mb-1">
//               Indent Number <span className="text-red-600">*</span>
//             </label>
//             <input
//               type="text"
//               name="indentNumber"
//               required
//               value={formData.indentNumber}
//               onChange={handleChange}
//               className="w-full p-3 border rounded-xl shadow-sm focus:ring-2 focus:ring-purple-400 transition-all"
//             />
//           </div>

//           <div>
//             <label className="block font-semibold mb-1">
//               Item Number <span className="text-red-600">*</span>
//             </label>
//             <input
//               type="text"
//               name="itemNumber"
//               required
//               value={formData.itemNumber}
//               onChange={handleChange}
//               className="w-full p-3 border rounded-xl shadow-sm focus:ring-2 focus:ring-purple-400 transition-all"
//             />
//           </div>
//         </div>

//         {/* Description */}
//         <div>
//           <label className="block font-semibold mb-1">
//             Item Description <span className="text-red-600">*</span>
//           </label>
//           <textarea
//             name="itemDescription"
//             required
//             value={formData.itemDescription}
//             onChange={handleChange}
//             rows={4}
//             className="w-full p-3 border rounded-xl shadow-sm focus:ring-2 focus:ring-purple-400 transition-all"
//           />
//         </div>

//         {/* Row 3 */}
//         <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//           <div>
//             <label className="block font-semibold mb-1">
//               UOM <span className="text-red-600">*</span>
//             </label>
//             <input
//               type="text"
//               name="uom"
//               required
//               value={formData.uom}
//               onChange={handleChange}
//               className="w-full p-3 border rounded-xl shadow-sm focus:ring-2 focus:ring-purple-400 transition-all"
//             />
//           </div>

//           <div>
//             <label className="block font-semibold mb-1">
//               Total Quantity <span className="text-red-600">*</span>
//             </label>
//             <input
//               type="number"
//               name="totalQuantity"
//               required
//               value={formData.totalQuantity}
//               onChange={handleChange}
//               className="w-full p-3 border rounded-xl shadow-sm focus:ring-2 focus:ring-purple-400 transition-all"
//             />
//           </div>

//           <div>
//             <label className="block font-semibold mb-1">
//               Submitted By <span className="text-red-600">*</span>
//             </label>
//             <input
//               type="text"
//               name="submittedBy"
//               required
//               value={formData.submittedBy}
//               onChange={handleChange}
//               className="w-full p-3 border rounded-xl shadow-sm focus:ring-2 focus:ring-purple-400 transition-all"
//             />
//           </div>
//         </div>

//         {/* Buttons */}
//         <div className="flex justify-end gap-4 pt-4">
//           {/* Cancel - Red */}
//           <button
//             type="button"
//             onClick={handleCancel}
//             className="px-5 py-2.5 rounded-xl shadow-md border border-red-500 bg-red-500 text-white font-medium hover:bg-red-600 active:scale-95 transition"
//           >
//             Cancel
//           </button>

//           {/* Submit - Green */}
//           <button
//             type="submit"
//             className="px-5 py-2.5 bg-green-600 text-white font-semibold rounded-xl shadow-md hover:bg-green-700 active:scale-95 transition"
//           >
//             Submit
//           </button>
//         </div>
//       </form>
//     </div>
//   );
// }

import React, { useState } from "react";
//import { createIndentForm } from "../../api/IndentForm.api"; // ✅ Added
import { createIndentForm } from "../api/IndentForm.api";

export default function IndentCreationForm() {
  const [formData, setFormData] = useState({
    site: "",
    uniqueId: "",
    indentNumber: "",
    itemNumber: "",
    itemDescription: "",
    uom: "",
    totalQuantity: "",
    submittedBy: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // ✅ Updated handleSubmit with API integration
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await createIndentForm(formData);
      alert("Indent Form Submitted Successfully!");
      console.log("📌 Server Response:", response);

      // Reset form after submit
      setFormData({
        site: "",
        uniqueId: "",
        indentNumber: "",
        itemNumber: "",
        itemDescription: "",
        uom: "",
        totalQuantity: "",
        submittedBy: "",
      });

    } catch (error) {
      console.error("❌ Error submitting form:", error);
      alert("Failed to submit form.");
    }
  };

  const handleCancel = () => {
    setFormData({
      site: "",
      uniqueId: "",
      indentNumber: "",
      itemNumber: "",
      itemDescription: "",
      uom: "",
      totalQuantity: "",
      submittedBy: "",
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 to-purple-100 p-6">
      <form
        onSubmit={handleSubmit}
        className="bg-white/80 backdrop-blur-xl p-10 rounded-3xl shadow-2xl w-full max-w-3xl space-y-8 border border-white/40"
      >
        <h2 className="text-3xl font-bold text-center bg-gradient-to-r from-blue-600 to-purple-600 text-transparent bg-clip-text drop-shadow-md">
          Indent Creation Form
        </h2>

        {/* ---------- FORM FIELDS ---------- */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Site */}
          <div>
            <label className="block font-semibold mb-1">
              Site <span className="text-red-600">*</span>
            </label>
            <select
              name="site"
              required
              value={formData.site}
              onChange={handleChange}
              className="w-full p-3 border rounded-xl shadow-sm focus:ring-2 focus:ring-purple-400 transition-all"
            >
              <option value="">Select Site</option>
              <option value="HIPL">HIPL</option>
              <option value="RSIPL">RSIPL</option>
              <option value="HRM">HRM</option>
              <option value="SUNAGROW">SUNAGROW</option>
              <option value="RICE FIELD">RICE FIELD</option>
            </select>
          </div>

          {/* Unique ID */}
          <div>
            <label className="block font-semibold mb-1">
              Unique ID <span className="text-red-600">*</span>
            </label>
            <input
              type="text"
              name="uniqueId"
              required
              value={formData.uniqueId}
              onChange={handleChange}
              className="w-full p-3 border rounded-xl shadow-sm focus:ring-2 focus:ring-purple-400 transition-all"
            />
          </div>
        </div>

        {/* Row 2 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block font-semibold mb-1">
              Indent Number <span className="text-red-600">*</span>
            </label>
            <input
              type="text"
              name="indentNumber"
              required
              value={formData.indentNumber}
              onChange={handleChange}
              className="w-full p-3 border rounded-xl shadow-sm focus:ring-2 focus:ring-purple-400 transition-all"
            />
          </div>

          <div>
            <label className="block font-semibold mb-1">
              Item Number <span className="text-red-600">*</span>
            </label>
            <input
              type="text"
              name="itemNumber"
              required
              value={formData.itemNumber}
              onChange={handleChange}
              className="w-full p-3 border rounded-xl shadow-sm focus:ring-2 focus:ring-purple-400 transition-all"
            />
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block font-semibold mb-1">
            Item Description <span className="text-red-600">*</span>
          </label>
          <textarea
            name="itemDescription"
            required
            value={formData.itemDescription}
            onChange={handleChange}
            rows={4}
            className="w-full p-3 border rounded-xl shadow-sm focus:ring-2 focus:ring-purple-400 transition-all"
          />
        </div>

        {/* Row 3 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block font-semibold mb-1">
              UOM <span className="text-red-600">*</span>
            </label>
            <input
              type="text"
              name="uom"
              required
              value={formData.uom}
              onChange={handleChange}
              className="w-full p-3 border rounded-xl shadow-sm focus:ring-2 focus:ring-purple-400 transition-all"
            />
          </div>

          <div>
            <label className="block font-semibold mb-1">
              Total Quantity <span className="text-red-600">*</span>
            </label>
            <input
              type="number"
              name="totalQuantity"
              required
              value={formData.totalQuantity}
              onChange={handleChange}
              className="w-full p-3 border rounded-xl shadow-sm focus:ring-2 focus:ring-purple-400 transition-all"
            />
          </div>

          <div>
            <label className="block font-semibold mb-1">
              Submitted By <span className="text-red-600">*</span>
            </label>
            <input
              type="text"
              name="submittedBy"
              required
              value={formData.submittedBy}
              onChange={handleChange}
              className="w-full p-3 border rounded-xl shadow-sm focus:ring-2 focus:ring-purple-400 transition-all"
            />
          </div>
        </div>

        {/* Buttons */}
        <div className="flex justify-end gap-4 pt-4">
          <button
            type="button"
            onClick={handleCancel}
            className="px-5 py-2.5 rounded-xl shadow-md border border-red-500 bg-red-500 text-white font-medium hover:bg-red-600 active:scale-95 transition"
          >
            Cancel
          </button>

          <button
            type="submit"
            className="px-5 py-2.5 bg-green-600 text-white font-semibold rounded-xl shadow-md hover:bg-green-700 active:scale-95 transition"
          >
            Submit
          </button>
        </div>
      </form>
    </div>
  );
}