import "express-async-errors";
import express from "express";
import { connectDB } from "./config/db.js";
import dotenv from "dotenv";

import blogsRoute from "./routes/blogs.route.js";
import authRoute from "./routes/auth.route.js";
import resourceRoute from "./routes/resources.route.js";
import aiRoute from "./routes/ai.route.js";
import todoRoute from "./routes/todo.route.js";

import cors from "cors";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";

dotenv.config();

const app = express();

/* ================= PORT ================= */
const PORT = process.env.PORT || 8080;

/* ================= MIDDLEWARE ================= */

app.use(express.json({ limit: "5mb" }));
app.use(cookieParser());

/* ================= CORS (FINAL FIX) ================= */

const allowedOrigins = [
  "http://localhost:5173",
  "https://campus-connect-six-lovat.vercel.app"
];

app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

/* ================= RATE LIMIT ================= */

app.use(
  rateLimit({
    windowMs: 1 * 60 * 1000,
    max: 100,
    message: { message: "Too many requests. Try again later." },
  })
);

/* ================= HEALTH ================= */

app.get("/api/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    timestamp: new Date().toISOString(),
  });
});

/* ================= ROUTES ================= */

app.use("/api/auth", authRoute);
app.use("/api/blogs", blogsRoute);
app.use("/api/resources", resourceRoute);
app.use("/api/ai", aiRoute);
app.use("/api/todos", todoRoute);

/* ================= ERROR HANDLER ================= */

app.use((err, req, res, next) => {
  console.error("ERROR:", err);

  res.status(err.status || 500).json({
    message: err.message || "Internal server error",
  });
});

/* ================= START SERVER ================= */

const startServer = async () => {
  try {
    await connectDB();
    console.log("MongoDB connected");

    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error("DB connection failed:", err);
    process.exit(1);
  }
};

startServer();