import "express-async-errors";
import express from "express";
import { connectDB } from "./config/db.js";
import dotenv from "dotenv";

import blogsRoute from "./routes/blogs.route.js";
import authRoute from "./routes/auth.route.js";
import resourceRoute from "./routes/resources.route.js";
import aiRoute from "./routes/ai.route.js";

import cors from "cors";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";

dotenv.config({ override: true });

const app = express();
const PORT = process.env.PORT || 8001;



app.use(express.json({ limit: "5mb" }));
app.use(cookieParser());



const allowedOrigins = [
  process.env.CLIENT_URL,
  "http://localhost:5173",
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
     
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(null, false); 
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    exposedHeaders: ["X-Resume-Pdf-Source"],
  })
);


app.options("*", cors());



const authLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 20,
  message: { message: "Too many attempts, try again in aminute." },
});

const otpLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 5,
  message: { message: "Too many OTP requests. Please wait for 1 minute." },
});

const generalLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 100,
  message: { message: "Too many requests. Please try after few minutes." },
});



app.use("/api/auth/verify-otp", otpLimiter);
app.use("/api/auth/resend-otp", otpLimiter);
app.use("/api/auth", authLimiter);
app.use("/api", generalLimiter);



app.get("/api/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    timestamp: new Date().toISOString(),
  });
});



app.use("/api/auth", authRoute);
app.use("/api/blogs", blogsRoute);
app.use("/api/resources", resourceRoute);
app.use("/api/ai", aiRoute);



app.use((err, req, res, next) => {
  console.error("GLOBAL ERROR:", err.message);

  res.status(err.status || 500).json({
    message: err.message || "Internal server error",
    ...(process.env.NODE_ENV === "development" && {
      stack: err.stack,
    }),
  });
});



connectDB();

app.listen(PORT, () => {
  console.log(`Server started on port: ${PORT}`);
});