import "express-async-errors";
import express from "express";
import { connectDB } from "./config/db.js";
import dotenv from "dotenv";
import blogsRoute from "./routes/blogs.route.js";
import authRoute from "./routes/auth.route.js";
import resourceRoute from "./routes/resources.route.js";
import cors from "cors";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
import aiRoute from "./routes/ai.route.js";

dotenv.config({ override: true });

const app = express();


app.set("trust proxy", 1); 

const PORT = process.env.PORT || 8001;

app.use(express.json({ limit: "5mb" }));
app.use(cookieParser());

const allowedOrigins = [
  process.env.CLIENT_URL,
  "http://localhost:5173",
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  exposedHeaders: ["X-Resume-Pdf-Source"],
}));


const authLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, 
  max: 20, 
  message: { message: "Too many login/signup attempts.Try again after a minute." },
  standardHeaders: true,
  legacyHeaders: false,
});


const generalLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, 
  max: 150,
  message: { message: "Too many requests, please slow down" },
  standardHeaders: true,
  legacyHeaders: false,
});

app.get("/api/health", (req, res) => {
  res.status(200).json({ status: "ok", timestamp: new Date().toISOString() });
});


app.use("/api/auth/signup", authLimiter);
app.use("/api/auth/login", authLimiter);
app.use("/api/auth/verify-otp", authLimiter);


app.use("/api/auth/profile", generalLimiter);
app.use("/api/auth/refresh-token", generalLimiter);
app.use("/api/blogs", generalLimiter);
app.use("/api/resources", generalLimiter);
app.use("/api/ai", generalLimiter);

app.use("/api/auth", authRoute);
app.use("/api/blogs", blogsRoute);
app.use("/api/resources", resourceRoute);
app.use("/api/ai", aiRoute);

app.use((err, req, res, next) => {
  console.error("GLOBAL ERROR:", err.stack);
  res.status(err.status || 500).json({
    message: err.message || "Internal server error",
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
});

connectDB();

app.listen(PORT, () => {
  console.log("Server started on port:", PORT);
});