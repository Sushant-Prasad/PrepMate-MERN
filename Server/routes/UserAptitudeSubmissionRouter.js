import express from "express";
import {
  submitAptitudeAnswer,
  getUserSubmissions,
  getUserStreakSubmissions,
} from "../controllers/UserAptitudeSubmissionController.js";
import { verifyToken } from "../utils/verifytoken.js";

const userAptitudeSubmissionRouter = express.Router();

// @route   POST /api/aptitude-submissions
// @desc    Submit answer (must be logged in)
userAptitudeSubmissionRouter.post("/", verifyToken, submitAptitudeAnswer);

// @route   GET /api/aptitude-submissions/:userId
// @desc    Get all submissions of a specific user (that user or admin)
userAptitudeSubmissionRouter.get("/:userId", verifyToken, getUserSubmissions);

// @route   GET /api/aptitude-submissions/:userId/streak
// @desc    Get only streak submissions (that user or admin)
userAptitudeSubmissionRouter.get("/:userId/streak", verifyToken, getUserStreakSubmissions);

export default userAptitudeSubmissionRouter;
