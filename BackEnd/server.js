import express from "express";
import dotenvFlow from "dotenv-flow";
import cors from "cors";
import connectDB from "./config/db.js";

// Routes
//import loginRoutes from "./routes/login.routes.js";
import purchaseRoutes from "./routes/purchase.routes.js";   // ✅ Added

dotenvFlow.config(); // Load env files

const app = express();

// ===============================
// ✅ MongoDB Connection Handling
// ===============================
let isConnected = false;

const ensureDBConnection = async () => {
  if (isConnected) return;

  try {
    await connectDB();
    isConnected = true;
    console.log("✅ MongoDB connected successfully");
  } catch (err) {
    console.error("❌ MongoDB connection failed:", err.message);
  }
};

// Connect before every request
app.use(async (req, res, next) => {
  await ensureDBConnection();
  next();
});

// ===============================
// ✅ Middleware
// ===============================
app.use(express.json());

// ===============================
// ✅ CORS
// ===============================
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://electric-monitoring-system-frontend.vercel.app",
    ],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true,
  })
);

// ===============================
// ✅ API ROUTES
// ===============================
//app.use("/auth", loginRoutes);
app.use("/indent", purchaseRoutes);  // ✅ Added in the same style

// ===============================
// ✅ Root Route
// ===============================
app.get("/", (req, res) => {
  res.send("⚡ Purchase Management API is running...");
});

// ===============================
// ✅ Local Development Server
// ===============================
if (process.env.NODE_ENV === "development") {
  const PORT = process.env.PORT || 5000;

  ensureDBConnection().then(() => {
    app.listen(PORT, () =>
      console.log(`🚀 Server running on http://localhost:${PORT}`)
    );
  });
} else {
  console.log("🌐 Running in serverless (production) mode — no app.listen()");
}

export default app;