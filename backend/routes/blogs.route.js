import { getAllBlogs,getBlogById,createBlog,updateBlog,deleteBlog,getMyBlogs } from "../controllers/blogs.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

import express from "express"

const router=express.Router();

router.get('/',getAllBlogs);
router.get('/getMyBlogs',protectRoute,getMyBlogs);
router.get("/:id",getBlogById);
router.post("/",protectRoute,createBlog);
router.put("/:id",protectRoute,updateBlog);
router.delete("/:id",protectRoute,deleteBlog);
export default router;