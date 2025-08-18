import express from "express";
import {
  submitAptitudeAnswer,
  getUserSubmissions,
  getUserStreakSubmissions,
} from "../controllers/UserAptitudeSubmissionController.js";

const userAptitudeSubmissionRouter = express.Router();

// Submit answer
userAptitudeSubmissionRouter.post("/", submitAptitudeAnswer);

// Get all submissions of a user
userAptitudeSubmissionRouter.get("/:userId", getUserSubmissions);

// Get only streak submissions
userAptitudeSubmissionRouter.get("/:userId/streak", getUserStreakSubmissions);



export default userAptitudeSubmissionRouter;
