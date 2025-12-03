import express from "express";
import {
  createIndentForm,
  getAllIndentForms,
  getIndentFormById,
  updateIndentForm,
  deleteIndentForm,
  approveIndentForm,
  rejectIndentForm,
} from "../controllers/purchase.controller.js";

const router = express.Router();

router.post("/", createIndentForm);
router.get("/", getAllIndentForms);
router.get("/:id", getIndentFormById);
router.put("/:id", updateIndentForm);
router.delete("/:id", deleteIndentForm);

// Approve / Reject
//router.post("/:id/approve", approveIndentForm);
//router.post("/:id/reject", rejectIndentForm);

export default router;