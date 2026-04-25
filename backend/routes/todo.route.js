import express from "express";
import {
  createTodo,
  getTodos,
  getTodoById,
  updateTodo,
  deleteTodo,
  getStats,
  getUpcomingTodos,
  getOverdueTodos,
  updateChecklistItem,
  bulkUpdate,
  deleteCompleted
} from "../controllers/todo.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

/* ================= ALL ROUTES REQUIRE AUTHENTICATION ================= */
router.use(protectRoute);

/* ================= CREATE ================= */
router.post("/", createTodo);

/* ================= READ ================= */
router.get("/", getTodos);
router.get("/stats", getStats);
router.get("/upcoming", getUpcomingTodos);
router.get("/overdue", getOverdueTodos);
router.get("/:id", getTodoById);

/* ================= UPDATE ================= */
router.put("/:id", updateTodo);
router.put("/:id/checklist/:itemIndex", updateChecklistItem);
router.patch("/bulk", bulkUpdate);

/* ================= DELETE ================= */
router.delete("/:id", deleteTodo);
router.delete("/completed", deleteCompleted);

export default router;