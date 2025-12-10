import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FaUser, FaLock, FaShoppingCart } from "react-icons/fa";
import { Eye, EyeOff } from "lucide-react";
import loginImg from "../assets/LoginBgImg.png";

import PurchasePage from "../pages/PurchasePage";
import ExcelPage from "../pages/ExcelPage";
import IndentFormPage from "../pages/IndentFormPage";
import { loginUser } from "../api/Login.api";

export default function LoginForm() {
  // ================= STATES =================
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [role, setRole] = useState("");

  // Load Role On Page Refresh
  useEffect(() => {
    const savedRole = localStorage.getItem("role");
    if (savedRole) {
      setRole(savedRole);
      setIsLoggedIn(true);
    }
  }, []);

  // Inject Google Agu Font
  useEffect(() => {
    const link = document.createElement("link");
    link.href =
      "https://fonts.googleapis.com/css2?family=Agu+Display&display=swap";
    link.rel = "stylesheet";
    document.head.appendChild(link);
  }, []);

  // ================= HANDLE LOGIN =================
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const success = await loginUser({ username, password });

    if (success === "Admin") {
      setRole("Admin");
      setIsLoggedIn(true);
      localStorage.setItem("role", "Admin");
    } else if (success === "InputUser") {
      setRole("InputUser");
      setIsLoggedIn(true);
      localStorage.setItem("role", "InputUser");
    } else if (success === "DEO") {
      setRole("DEO");
      setIsLoggedIn(true);
      localStorage.setItem("role", "DEO");
    } else if (success === "PSE") {
      setRole("PSE");
      setIsLoggedIn(true);
      localStorage.setItem("role", "PSE");
    }
  };

  // ================= PAGE REDIRECT =================
  if (isLoggedIn && role === "DEO") {
    return <IndentFormPage />;
  } else if (isLoggedIn && role === "PSE") {
    return <PurchasePage />;
    //return <ExcelPage />;
  }

  // ================= LOGIN PAGE =================
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
              Welcome Back
            </h2>

            <p className="text-md text-gray-600 mb-8">
              Sign in to your account
            </p>

            <form onSubmit={handleSubmit}>
              {/* USERNAME */}
              <label className="text-left font-medium text-gray-700 flex items-center gap-2 pl-1 mb-2">
                <FaUser className="text-gray-600" /> Username
              </label>

              <div className="flex items-center bg-gray-200 rounded-full px-4 py-3 mb-5">
                <input
                  type="text"
                  placeholder="Enter your username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="flex-1 bg-transparent outline-none text-[16px]"
                />
              </div>

              {/* PASSWORD */}
              <label className="text-left font-medium text-gray-700 flex items-center gap-2 pl-1 mb-2">
                <FaLock className="text-gray-600" /> Password
              </label>

              <div className="flex items-center bg-gray-200 rounded-full px-4 py-3 mb-5">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="flex-1 bg-transparent outline-none text-[16px]"
                />

                <span
                  onClick={() => setShowPassword(!showPassword)}
                  className="ml-2 text-gray-600 hover:text-gray-800 cursor-pointer select-none"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </span>
              </div>

              {/* ERROR MESSAGE */}
              {error && (
                <p className="text-red-600 text-sm mb-4 text-left pl-1">
                  * Incorrect Username or Password
                </p>
              )}

              {/* LOGIN BUTTON */}
              <button
                type="submit"
                className="w-full text-white font-medium py-3 rounded-full 
                          bg-gradient-to-r from-red-500 to-red-700 
                          hover:opacity-90 transition"
              >
                LOGIN
              </button>
            </form>

            <p className="text-sm text-gray-500 mt-3 cursor-pointer hover:text-gray-700">
              Forgot Username / Password?
            </p>
          </div>

          {/* RIGHT IMAGE */}
          <div className="w-[760px] md:w-[900px] h-[600px] flex items-center justify-center">
            <motion.img
              src={loginImg}
              alt="Login Illustration"
              className="w-full h-full object-cover rounded-xl"
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
