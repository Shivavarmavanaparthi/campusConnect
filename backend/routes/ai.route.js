import express from "express";
import { summarizeInstantPDF } from "../controllers/ai.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";
import upload from "../middleware/multer.middleware.js";

const router = express.Router();


router.post( "/summarize", protectRoute, upload.single("file"), summarizeInstantPDF);

export default router;