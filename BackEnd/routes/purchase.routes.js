import express from "express";
import multer from "multer";
import {
  createIndentForm,
  createLocalPurchaseForm,
  getAllIndentForms,
  getAllLocalPurchaseForms,
  getLatestUniqueId,
  getLatestLocalPurchaseUniqueId,
  updatePurchase,
  updateLocalPurchase,
  getIndentFormById,
  getIndentFormByUniqueId,
  manualCloseStoreByUniqueId,
  updateIndentForm,
  deleteIndentForm,
  uploadComparisonPDF,   // ✅ UNCOMMENT / ADD THIS
  approveIndentForm,
  rejectIndentForm,
} from "../controllers/purchase.controller.js";

const router = express.Router();

/* ------------------ Multer Config ------------------ */
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10 MB limit (optional)
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype !== "application/pdf") {
      cb(new Error("Only PDF files allowed"), false);
    } else {
      cb(null, true);
    }
  },
});

/* ------------------ Routes ------------------ */
router.post("/", createIndentForm);
router.post("/localpurchase", createLocalPurchaseForm);
//router.get("/", getAllIndentForms);
router.post("/all", getAllIndentForms);
router.post("/localpurchase/all", getAllLocalPurchaseForms);
router.get("/latest/unique-id", getLatestUniqueId);
router.get("/latest/localpurchase/unique-id", getLatestLocalPurchaseUniqueId);
router.put("/purchase/update/:id", updatePurchase);
router.put("/localpurchase/update/:id", updateLocalPurchase);
// router.put("/purchase/update/:id", (req, res, next) => {
//   console.log("===============================================");
//   console.log("📥 PURCHASE UPDATE ROUTE HIT");
//   console.log("➡️ Route: /purchase/update/" + req.params.id);
//   console.log("➡️ Record ID:", req.params.id);
//   console.log("➡️ Body Received:", JSON.stringify(req.body, null, 2));
//   console.log("===============================================");

//   next(); // continue to actual controller: updatePurchase
// }, updatePurchase);
router.get("/by-uniqueid/:uniqueId", getIndentFormByUniqueId);
router.post("/store/manual-close", manualCloseStoreByUniqueId);
router.get("/:id", getIndentFormById);
router.put("/:id", updateIndentForm);
router.delete("/:id", deleteIndentForm);

/* ---------- PDF Upload → Google Drive ---------- */
router.post(
  "/upload/comparison-pdf",
  upload.single("file"),   // 🔑 must match frontend FormData key
  uploadComparisonPDF
);

// /api/comparison/upload-pdf
//router.post("/upload-pdf", upload.single("pdf"), uploadComparisonPDF);
// Approve / Reject
//router.post("/:id/approve", approveIndentForm);
//router.post("/:id/reject", rejectIndentForm);

export default router;