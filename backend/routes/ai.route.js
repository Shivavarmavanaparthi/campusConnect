import express from "express";
import { summarizeInstantPDF } from "../controllers/ai.controller.js";
import { generateResumePdf } from "../controllers/resume.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";
import upload from "../middleware/multer.middleware.js";

const router = express.Router();


router.post( "/summarize", protectRoute, upload.single("file"), summarizeInstantPDF);
router.post("/resume/pdf", protectRoute, generateResumePdf);

export default router;