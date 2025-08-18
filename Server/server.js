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



dotenv.config();

const corsOptions = {
  origin: "http://localhost:5173", // Allow requests from frontend
 // credentials: true // Allow cookies to be sent from frontend
};

const app = express();
const PORT = process.env.PORT || 5000;


app.use(cors(corsOptions)); // Enable CORS with defined options
app.use(cookieParser());// Parse cookies from incoming requests
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// Routes
app.use("/api/dsa-questions", dsaQuestionRoutes);
app.use("/api/daily-dsa", dailyDSArouter);
app.use("/api/aptitude-questions", aptitudeQuestionRoutes);
app.use("/api/daily-aptitude", dailyAptitudeRoutes);
app.use("/api/aptitude-submission", userAptitudeSubmissionRouter);

// Global error handling middleware
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500; // Default to 500 if no status
  const message = err.message || "internal server error"; // Default message
  res.status(statusCode).json({ error: message }); // Send error response
});

// Function to start the server after connecting to DB
const startServer = async () => {
  try {
    await connectToDB(); // Connect to MongoDB
    console.log("DB connected successfully!");

    app.listen(PORT, () => {
      console.log(`Server is listening at http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
  }
};

startServer(); // Start the server
