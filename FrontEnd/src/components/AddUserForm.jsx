import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FaUser, FaLock, FaShoppingCart, FaIdBadge } from "react-icons/fa";
import { Eye, EyeOff } from "lucide-react";
import loginImg from "../assets/AddUserImg.png";
import { useNavigate } from "react-router-dom";

import { addUser } from "../api/AddUser.api";

export default function AddUser() {
    const navigate = useNavigate();
  // ================= STATES =================
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [designation, setDesignation] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Inject Google Agu Font
  useEffect(() => {
    const link = document.createElement("link");
    link.href =
      "https://fonts.googleapis.com/css2?family=Agu+Display&display=swap";
    link.rel = "stylesheet";
    document.head.appendChild(link);
  }, []);

  // ================= HANDLE SUBMIT =================
//   const handleSubmit = (e) => {
//     e.preventDefault();

//     const payload = {
//       username,
//       password,
//       designation,
//     };

//     console.log("Add User Payload:", payload);
//     // 👉 Call your API here (e.g., addUser(payload))
//   };

const handleSubmit = async (e) => {
  e.preventDefault();

  const payload = {
    username,
    password,
    designation,
  };

  const result = await addUser(payload);

  if (result === "success") {
    alert("User added successfully"); // waits for OK click

    setUsername("");
    setPassword("");
    setDesignation("");

    // 🔁 Redirect ADMIN back to Purchase Page
    navigate("/purchase"); // change if your route differs
  } else {
    alert(result || "Failed to add user");
  }
};

  return (
    <div className="min-h-screen bg-gray-100">

      {/* NAVBAR */}
      <nav className="w-full py-8 px-12 flex items-center gap-5 mt-4 bg-transparent">
        <FaShoppingCart className="text-red-600 text-6xl" />
        <h1
          className="text-6xl font-bold tracking-wide text-gray-900"
          style={{ fontFamily: "'Agu Display', sans-serif" }}
        >
          PURCHASE MANAGEMENT SYSTEM
        </h1>
      </nav>

      {/* MAIN CONTENT */}
      <div className="flex items-center justify-center p-10 mt-[-20px]">
        <div className="flex flex-col md:flex-row gap-10">

          {/* LEFT FORM CARD */}
          <div
            className="p-10 w-[450px] flex flex-col justify-center text-center bg-transparent shadow-none"
            style={{ fontFamily: "Poppins, sans-serif" }}
          >
            <h2 className="text-4xl font-semibold mb-2 text-gray-800">
              Add New User
            </h2>

            <p className="text-md text-gray-600 mb-8">
              Create a new system user
            </p>

            <form onSubmit={handleSubmit}>
              {/* USER NAME */}
              <label className="text-left font-medium text-gray-700 flex items-center gap-2 pl-1 mb-2">
                <FaUser className="text-gray-600" /> User Name
              </label>

              <div className="flex items-center bg-gray-200 rounded-full px-4 py-3 mb-5">
                <input
                  type="text"
                  placeholder="Enter user name"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="flex-1 bg-transparent outline-none text-[16px]"
                  required
                />
              </div>

              {/* PASSWORD */}
              <label className="text-left font-medium text-gray-700 flex items-center gap-2 pl-1 mb-2">
                <FaLock className="text-gray-600" /> Password
              </label>

              <div className="flex items-center bg-gray-200 rounded-full px-4 py-3 mb-5">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="flex-1 bg-transparent outline-none text-[16px]"
                  required
                />

                <span
                  onClick={() => setShowPassword(!showPassword)}
                  className="ml-2 text-gray-600 hover:text-gray-800 cursor-pointer select-none"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </span>
              </div>

              {/* DESIGNATION */}
              <label className="text-left font-medium text-gray-700 flex items-center gap-2 pl-1 mb-2">
                <FaIdBadge className="text-gray-600" /> Designation
              </label>

              <div className="flex items-center bg-gray-200 rounded-full px-4 py-3 mb-6">
                <select
                  value={designation}
                  onChange={(e) => setDesignation(e.target.value)}
                  className="flex-1 bg-transparent outline-none text-[16px]"
                  required
                >
                  <option value="">Select Designation</option>
                  <option value="ADMIN">Admin</option>
                  <option value="DEO">Data Entry Operator (DEO)</option>
                  <option value="PA">Purchase Assistant (PA)</option>
                  <option value="PC">Process Co-Ordinator (PC)</option>
                  <option value="PSE">Purchase Senior Executive(PSE)</option>
                </select>
              </div>

              {/* SUBMIT BUTTON */}
              <button
                type="submit"
                className="w-full text-white font-medium py-3 rounded-full 
                           bg-gradient-to-r from-red-500 to-red-700 
                           hover:opacity-90 transition"
              >
                ADD USER
              </button>
            </form>
          </div>

          {/* RIGHT IMAGE */}
          <div className="w-[760px] md:w-[900px] h-[600px] flex items-center justify-center">
            <motion.img
              src={loginImg}
              alt="Add User Illustration"
              className="w-full h-full object-contain rounded-xl"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
            />
          </div>

        </div>
      </div>
    </div>
  );
}