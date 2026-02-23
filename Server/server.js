import express from "express";
import http from "http";
import { Server } from "socket.io";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import cookie from "cookie";
import jwt from "jsonwebtoken";

import { connectToDB } from "./utils/connectDB.js";
import { setSocketInstance } from "./controllers/MessageController.js";

// Models
import User from "./models/User.js";
import Conversation from "./models/Conversation.js";

// Chat Routers
import conversationRouter from "./routes/conversation.routes.js";
import messageRouter from "./routes/MessageRouter.js";
// import userRouter from "./routes/user.js";
import groupRouter from "./routes/groupRouter.js";
import adminRouter from "./routes/groupAdmin.routes.js";

// Main Project Routers
import dsaQuestionRoutes from "./routes/DSAQuestionRouter.js";
import dailyDSArouter from "./routes/DailyDSAQuestionRouter.js";
import aptitudeQuestionRoutes from "./routes/AptitudeQuestionRouter.js";
import dailyAptitudeRoutes from "./routes/DailyAptitudeQuestionRouter.js";
import userAptitudeSubmissionRouter from "./routes/UserAptitudeSubmissionRouter.js";
import UserDSASubmissionRouter from "./routes/UserDSASubmissionRouter.js";
import authRouter from "./routes/authRouter.js";
import profileRouter from "./routes/UserProfileRouter.js";
import {router} from "./routes/UserProfileRouter.js"

dotenv.config();

const app = express();
const server = http.createServer(app);

const PORT = process.env.PORT || 5000;

/* -------------------- CORS -------------------- */
const corsOptions = {
  origin: "http://localhost:5173",
  credentials: true,
};

app.use(cors(corsOptions));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* -------------------- API ROUTES -------------------- */

// Chat Routes
app.use(
  "/api",
  conversationRouter,
  messageRouter,
  router,
  // userRouter,
  groupRouter,
  adminRouter
);

// Main Project Routes
app.use("/api/dsa-questions", dsaQuestionRoutes);
app.use("/api/daily-dsa", dailyDSArouter);
app.use("/api/aptitude-questions", aptitudeQuestionRoutes);
app.use("/api/daily-aptitude", dailyAptitudeRoutes);
app.use("/api/aptitude-submission", userAptitudeSubmissionRouter);
app.use("/api/dsa-submission", UserDSASubmissionRouter);
app.use("/api/users", authRouter);
app.use("/api/profiles", profileRouter);

/* -------------------- SOCKET.IO -------------------- */

const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    credentials: true,
  },
});

/* -------- Socket Auth (JWT via handshake) -------- */
io.use(async (socket, next) => {
  try {
    const cookies = cookie.parse(socket.handshake.headers.cookie || "");
    const token = cookies.token;
    if (!token) return next(new Error("Not authorized, no token"));

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select("-password");

    if (!user) return next(new Error("Not authorized, user not found"));

    socket.user = user;
    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return next(new Error("token_expired"));
    }
    next(new Error("Not authorized, token failed"));
  }
});

/* ---------------- Socket Events ---------------- */
io.on("connection", async (socket) => {
  console.log("⚡ Connected:", socket.user.email);

  const joinedRooms = new Set();

  try {
    const userConversations = await Conversation.find({
      participants: socket.user._id,
    }).select("_id");

    userConversations.forEach((conv) => {
      socket.join(conv._id.toString());
      joinedRooms.add(conv._id.toString());
    });
  } catch (err) {
    console.error("Auto join error:", err);
  }

  socket.on("join_conversation", (conversationId) => {
    if (!conversationId || joinedRooms.has(conversationId)) return;
    socket.join(conversationId);
    joinedRooms.add(conversationId);
  });

  socket.on("send_message", async ({ conversationId, content }) => {
    if (!conversationId || !content) return;

    try {
      const Message = (await import("./models/Message.js")).default;

      const newMessage = await Message.create({
        conversation: conversationId,
        sender: socket.user._id,
        content,
        readBy: [socket.user._id],
      });

      await newMessage.populate("sender", "name email avatar");

      io.to(conversationId).emit("new_message", newMessage);
    } catch (err) {
      console.error("Send message error:", err);
    }
  });

  socket.on("disconnect", () => {
    console.log("❌ Disconnected:", socket.id);
  });
});

/* Pass io to controllers */
setSocketInstance(io);

/* ---------------- ERROR HANDLER ---------------- */
app.use((err, req, res, next) => {
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || "Internal server error",
  });
});

/* ---------------- START SERVER ---------------- */
const startServer = async () => {
  try {
    await connectToDB();
    console.log("✅ DB connected");

    server.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error("Server start failed:", err);
  }
};

startServer();
