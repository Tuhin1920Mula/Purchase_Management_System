import express from "express";
//import { upload } from "../middleware/upload.js";
import {
  createIndentForm,
  getAllIndentForms,
  getLatestUniqueId,
  updatePurchase,
  getIndentFormById,
  updateIndentForm,
  deleteIndentForm,
  //uploadComparisonPDF,
  approveIndentForm,
  rejectIndentForm,
} from "../controllers/purchase.controller.js";

const router = express.Router();

router.post("/", createIndentForm);
//router.get("/", getAllIndentForms);
router.post("/all", getAllIndentForms);
router.get("/latest/unique-id", getLatestUniqueId);
router.put("/purchase/update/:id", updatePurchase);
// router.put("/purchase/update/:id", (req, res, next) => {
//   console.log("===============================================");
//   console.log("📥 PURCHASE UPDATE ROUTE HIT");
//   console.log("➡️ Route: /purchase/update/" + req.params.id);
//   console.log("➡️ Record ID:", req.params.id);
//   console.log("➡️ Body Received:", JSON.stringify(req.body, null, 2));
//   console.log("===============================================");

//   next(); // continue to actual controller: updatePurchase
// }, updatePurchase);
router.get("/:id", getIndentFormById);
router.put("/:id", updateIndentForm);
router.delete("/:id", deleteIndentForm);

// /api/comparison/upload-pdf
//router.post("/upload-pdf", upload.single("pdf"), uploadComparisonPDF);
// Approve / Reject
//router.post("/:id/approve", approveIndentForm);
//router.post("/:id/reject", rejectIndentForm);

export default router;