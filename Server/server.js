import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import { connectToDB } from "./utils/connectDB.js";
import dsaQuestionRoutes from "./routes/DSAQuestionRouter.js";
import dailyDSArouter from "./routes/DailyDSAQuestionRouter.js";
import aptitudeQuestionRoutes from "./routes/AptitudeQuestionRouter.js";
import dailyAptitudeRoutes from "./routes/DailyAptitudeQuestionRouter.js";
import userAptitudeSubmissionRouter from "./routes/UserAptitudeSubmissionRouter.js";
import UserDSASubmissionRouter from "./routes/UserDSASubmissionRouter.js";
import authRouter from "./routes/authRouter.js";
import profileRouter from "./routes/UserProfileRouter.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// ✅ FIX: allow cookies from frontend
const corsOptions = {
  origin: "http://localhost:5173", // React frontend
  credentials: true,               // 🔑 required for HttpOnly cookies
};

// Middleware
app.use(cors(corsOptions));
app.use(cookieParser()); // Parse cookies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api/dsa-questions", dsaQuestionRoutes);
app.use("/api/daily-dsa", dailyDSArouter);
app.use("/api/aptitude-questions", aptitudeQuestionRoutes);
app.use("/api/daily-aptitude", dailyAptitudeRoutes);
app.use("/api/aptitude-submission", userAptitudeSubmissionRouter);
app.use("/api/dsa-submission", UserDSASubmissionRouter);
app.use("/api/users", authRouter);
app.use("/api/profiles", profileRouter);

// Global error handler
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal server error";
  res.status(statusCode).json({ success: false, message });
});

// Start server
const startServer = async () => {
  try {
    await connectToDB();
    console.log("✅ DB connected successfully!");

    app.listen(PORT, () => {
      console.log(`🚀 Server running at http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error);
  }
};

startServer();
