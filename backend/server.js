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


const PORT = process.env.PORT || 8080;



app.use(express.json({ limit: "5mb" }));
app.use(cookieParser());



const allowedOrigins = [
  process.env.CLIENT_URL,
  "http://localhost:5173",
].filter(Boolean);

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true); // allow mobile / curl

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      } else {
        return callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);


app.options("*", cors({
  origin: allowedOrigins,
  credentials: true
}));


app.use(
  rateLimit({
    windowMs: 1 * 60 * 1000,
    max: 100,
    message: { message: "Too many requests. Try again later." },
  })
);



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
  });
});



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