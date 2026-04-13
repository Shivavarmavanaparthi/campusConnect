import express from "express";
import { generateResumePdf } from "../controllers/resume.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";


const router = express.Router();


router.post("/resume/pdf", protectRoute, generateResumePdf);

export default router;