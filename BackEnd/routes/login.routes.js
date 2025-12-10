import express from "express";
import { loginUser } from "../controllers/login.controller.js";

const router = express.Router();

// ✅ Login API
router.post("/login", loginUser);

export default router;