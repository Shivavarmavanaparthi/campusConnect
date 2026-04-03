import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import upload from "../middleware/multer.middleware.js";
import {
    uploadResource,
    getAllResources,
    getMyResources,
    deleteResource,
} from "../controllers/resources.controller.js";

const router = express.Router();

router.get("/", getAllResources);
router.get("/my", protectRoute, getMyResources);
router.post("/upload", protectRoute, upload.single("file"), uploadResource);
router.delete("/:id", protectRoute, deleteResource);

export default router;