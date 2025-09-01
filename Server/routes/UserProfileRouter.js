import express from "express";
import { getUserProfile } from "../controllers/UserProfileController.js";
import { verifyToken } from "../utils/verifytoken.js";

const profileRouter = express.Router();

/**
 * Middleware: allow only self or admin to access a profile
 */
const verifySelfOrAdmin = (req, res, next) => {
  if (req.user.id === req.params.userId || req.user.role === "admin") {
    return next();
  }
  return res.status(403).json({ success: false, message: "Forbidden" });
};

/**
 * @route   GET /api/profiles/:userId
 * @desc    Get user profile by userId
 * @access  Private (self or admin)
 */
profileRouter.get("/:userId", verifyToken, verifySelfOrAdmin, getUserProfile);

export default profileRouter;
