import express from "express";
import { connectDB } from "./config/db.js";
import dotenv from "dotenv";
import blogsRoute from "./routes/blogs.route.js";
import authRoute from "./routes/auth.route.js";
import resourceRoute from "./routes/resources.route.js";
import cors from "cors";
import aiRoute from "./routes/ai.route.js";
import cookieParser from "cookie-parser";


dotenv.config({ override: true });

const app = express();
const PORT = 8001;


app.use(express.json({ limit: "5mb" }));
app.use(cookieParser());


app.use(cors({
  origin: "http://localhost:5173",
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
  exposedHeaders: ["X-Resume-Pdf-Source"],
}));


app.use("/api/auth", authRoute);
app.use("/api/blogs", blogsRoute);
app.use("/api/resources", resourceRoute);
app.use("/api/ai", aiRoute);


connectDB();


app.listen(PORT, () => {
  console.log("Server started on port:", PORT);
});
