import express from "express";
import {
  submitDSASolution,
  getUserSubmissions,
} from "../controllers/UserDSASubmissionController.js";
import { verifyToken } from "../utils/verifytoken.js";

const UserDSASubmissionRouter = express.Router();

// @route   POST /api/dsa-submissions
// @desc    Submit a DSA solution (must be logged in)
UserDSASubmissionRouter.post("/", verifyToken, submitDSASolution);

// @route   GET /api/dsa-submissions/:userId
// @desc    Get all submissions of a user (that user or admin)
UserDSASubmissionRouter.get("/:userId", verifyToken, getUserSubmissions);

export default UserDSASubmissionRouter;
